// Tutorial companion. Uses only public RELAYERS contracts and the public Bridge wire helpers.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomBytes, randomUUID, createHmac } from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { decodeKey, createFrameVerifier, signFrame } from './wire.mjs';
const API = 'https://api.relayers.app';
const UUID = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;
const CHAT = /^[\d-]+@(?:c\.us|lid|g\.us)$/;
const MAX_BODY = 160000;
export async function createDesk({ port = 47831, open = false, api = API, fetcher = fetch, Socket = WebSocket } = {}) {
  if (api !== API && !(process.env.RELAYERS_DESK_TEST === '1' && new URL(api).hostname === '127.0.0.1')) throw new Error('invalid-server');
  let auth, pairing, socket, key, verify, heartbeat, daemonId, settings, pendingPoll = false, closed = false, refreshing;
  let state = 'disconnected', detail = '', chain = Promise.resolve(), generation = 0;
  const messages = [], seen = new Set(), sends = new Map(), session = randomBytes(32).toString('hex');
  let localOrigin, cookieName;
  const deviceName = 'Balcão do tutorial / Tutorial desk · ' + randomUUID().slice(0, 6);
  const request = async (path, { body, method = body ? 'POST' : 'GET', anonymous = false, retry = true } = {}) => {
    const response = await fetcher(api + path, { method, redirect: 'error', signal: AbortSignal.timeout(15000), headers: { 'Content-Type': 'application/json', ...(!anonymous && auth ? { Authorization: `Bearer ${auth.access_token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const envelope = await response.json().catch(() => ({}));
    if (response.status === 401 && !anonymous && retry && auth?.refresh_token) {
      const epoch = generation;
      refreshing ??= request('/v1/auth/refresh', { anonymous: true, retry: false, body: { refresh_token: auth.refresh_token } }).then(tokens => {
        if (epoch !== generation || !auth) throw new Error('disconnected');
        if (typeof tokens?.access_token !== 'string' || typeof tokens.refresh_token !== 'string') throw new Error('invalid-pairing');
        auth = tokens;
      }).finally(() => { refreshing = undefined; });
      await refreshing;
      return request(path, { body, method, anonymous, retry: false });
    }
    if (!response.ok) throw new Error(envelope.error?.code || 'request-failed');
    return envelope.data;
  };
  const stopSocket = () => { clearInterval(heartbeat); heartbeat = null; const old = socket; socket = null; key = verify = null; old?.close(); };
  const write = async frame => { const target = socket, secret = key; if (!target || target.readyState !== 1 || !secret) throw new Error('offline'); const signed = await signFrame(secret, frame); if (target !== socket) throw new Error('offline'); target.send(JSON.stringify(signed)); };
  const accept = value => {
    if (!settings || value?.schema !== 'relayers.whatsapp.v1' || value.type !== 'message.received' || value.connectionId !== settings.connectionId || !UUID.test(value.eventId || '') || !CHAT.test(value.accountId || '') || !CHAT.test(value.chatId || '') || typeof value.text !== 'string' || value.text.length > 12000) throw new Error('invalid-message');
    if (seen.has(value.eventId)) return;
    if (seen.size >= 500 || messages.length >= 50) throw new Error('desk-full');
    seen.add(value.eventId); messages.push({ id: value.eventId, connectionId: value.connectionId, accountId: value.accountId, chatId: value.chatId, text: value.text, receivedAt: Date.now(), replies: [] });
  };
  const connect = async () => {
    if (!auth || closed) throw new Error('sign-in-required');
    stopSocket(); state = 'connecting'; detail = '';
    const url = new URL('/v1/tunnel/connect', api); url.protocol = api.startsWith('https:') ? 'wss:' : 'ws:';
    const target = new Socket(url); socket = target;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { if (socket === target) { stopSocket(); state = 'offline'; } reject(new Error('connection-timeout')); }, 15000);
      const fail = error => { clearTimeout(timer); if (socket === target) { stopSocket(); state = 'offline'; detail = ['invalid-frame','invalid-session-key','invalid-handshake','server-error'].includes(error?.message) ? error.message : 'connection-lost'; } reject(new Error('connection-lost')); };
      target.onopen = () => target.send(JSON.stringify({ type: 'auth', token: auth.access_token, daemon_id: daemonId || '', system_info: { hostname: deviceName, os: 'node' } }));
      target.onerror = fail;
      target.onclose = () => { clearTimeout(timer); if (socket === target) { socket = null; key = verify = null; clearInterval(heartbeat); state = 'offline'; detail = 'connection-lost'; } reject(new Error('connection-lost')); };
      target.onmessage = event => {
        chain = chain.catch(() => {}).then(async () => {
          if (socket !== target || typeof event.data !== 'string' || event.data.length > 230000) return;
          const frame = JSON.parse(event.data);
          if (!key) {
            if (frame.type !== 'auth_ok' || !UUID.test(frame.daemon_id || '')) throw new Error('invalid-handshake');
            daemonId = frame.daemon_id; key = decodeKey(frame.session_key); verify = createFrameVerifier(key);
            if (settings) await write({ type: 'subscribe', endpoint_ids: [settings.inId] });
            state = 'connected'; clearTimeout(timer);
            heartbeat = setInterval(() => write({ type: 'heartbeat' }).catch(fail), 20000); resolve(); return;
          }
          await verify(frame);
          if (frame.type === 'ping') return write({ type: 'ping_resp', ping_id: frame.ping_id });
          if (frame.type === 'error') throw new Error('server-error');
          if (frame.type !== 'deliver') return;
          let status = 400;
          if (settings && frame.endpoint_id === settings.inId && frame.url === localOrigin + '/messages' && frame.method === 'POST' && typeof frame.body === 'string' && frame.body.length <= MAX_BODY) {
            try { accept(JSON.parse(Buffer.from(frame.body, 'base64').toString('utf8'))); status = 204; detail = ''; } catch { status = 422; detail = 'invalid-message'; }
          }
          if (status === 400) detail = !settings ? 'paths-not-configured' : frame.endpoint_id !== settings.inId ? 'wrong-receiving-path' : frame.url !== localOrigin + '/messages' ? 'wrong-receiving-address' : 'invalid-receiving-request';
          // Acknowledge only this fixed inbox. Never proxy a destination provided by a frame.
          await write({ type: 'deliver_resp', delivery_id: frame.delivery_id, status_code: status, headers: {}, body: '' });
        }).catch(fail);
      };
    });
  };
  const configure = async input => {
    if (state !== 'connected') throw new Error('offline');
    const parse = raw => { const url = new URL(raw); if (url.origin !== api || url.username || url.password || url.search || url.hash || !/^\/v1\/webhooks\/[\w-]+$/.test(url.pathname)) throw new Error('invalid-connection'); return url.pathname.split('/').at(-1); };
    const inPublic = parse(input.inUrl), outPublic = parse(input.outUrl);
    if (!/^[a-f\d]{64}$/i.test(input.secret || '')) throw new Error('invalid-secret');
    const list = await request('/v1/endpoints/?per_page=100');
    const incoming = list?.find(item => item.public_id === inPublic), outgoing = list?.find(item => item.public_id === outPublic);
    const connectionId = incoming?.slug?.replace(/^whatsapp-in-/, '');
    if (!UUID.test(connectionId || '') || incoming.slug !== 'whatsapp-in-' + connectionId || outgoing?.slug !== 'whatsapp-out-' + connectionId || !UUID.test(incoming.id) || !UUID.test(outgoing.id)) throw new Error('wrong-connection');
    if (messages.length && settings?.connectionId !== connectionId) throw new Error('clear-first');
    settings = { inId: incoming.id, outId: outgoing.id, inUrl: input.inUrl, outUrl: input.outUrl, secret: input.secret, connectionId };
    await write({ type: 'subscribe', endpoint_ids: [settings.inId] });
  };
  const reply = async input => {
    if (state !== 'connected' || !settings || !UUID.test(input.id || '') || typeof input.text !== 'string' || !input.text.trim() || input.text.length > 2000 || !UUID.test(input.requestId || '')) throw new Error('invalid-reply');
    const item = messages.find(item => item.id === input.id); if (!item) throw new Error('invalid-reply');
    const existing = sends.get(input.requestId);
    if (existing) { if (existing.message !== input.id || existing.text !== input.text) throw new Error('request-conflict'); return { status: existing.status }; }
    if (sends.size >= 100) throw new Error('desk-full');
    const command = { schema: 'relayers.whatsapp.v1', type: 'message.send', commandId: input.requestId, connectionId: item.connectionId, accountId: item.accountId, chatId: item.chatId, text: input.text.trim(), expiresAt: new Date(Date.now() + 300000).toISOString() };
    const raw = JSON.stringify(command), record = { message: input.id, text: input.text, status: 'uncertain' };
    // Record intent before I/O; a lost response is never retried automatically.
    sends.set(input.requestId, record); item.replies.push({ requestId: input.requestId, text: command.text, status: 'uncertain' });
    try {
      const response = await fetcher(settings.outUrl, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000), headers: { 'Content-Type': 'application/json', 'X-Relayers-Signature': createHmac('sha256', settings.secret).update(raw).digest('hex'), 'X-Idempotency-Key': input.requestId }, body: raw });
      const envelope = await response.json().catch(() => ({}));
      if (!response.ok) { record.status = 'rejected'; item.replies.at(-1).status = 'rejected'; return { status: 'rejected' }; }
      record.status = 'queued'; item.replies.at(-1).status = 'queued';
      if (UUID.test(envelope.data?.event_id || '')) record.eventId = envelope.data.event_id;
      return { status: 'queued' };
    } catch { return { status: 'uncertain' }; }
  };
  const refreshResults = async () => {
    if (!auth) return;
    for (const [id, record] of sends) {
      if (!record.eventId || record.status !== 'queued') continue;
      const deliveries = await request(`/v1/events/${record.eventId}/deliveries`).catch(() => null);
      for (const delivery of deliveries || []) {
        let result; try { result = JSON.parse(delivery.response_body); } catch { continue; }
        if (!['accepted', 'rejected', 'uncertain'].includes(result.status)) continue;
        record.status = result.status; messages.find(item => item.id === record.message)?.replies.find(item => item.requestId === id) && (messages.find(item => item.id === record.message).replies.find(item => item.requestId === id).status = result.status); break;
      }
    }
  };
  const publicState = () => ({ state, detail, authenticated: Boolean(auth), configured: Boolean(settings), destination: localOrigin + '/messages', daemonName: deviceName, pairing: pairing ? { userCode: pairing.userCode, url: pairing.url } : null, messages: messages.map(({ id, text, receivedAt, replies }) => ({ id, text, receivedAt, replies })) });
  const server = createServer(async (req, res) => {
    const send = (status, value, type = 'application/json') => { res.writeHead(status, { 'Content-Type': type + '; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'", ...({'GET':1}[req.method] ? { 'Set-Cookie': `${cookieName}=${session}; HttpOnly; SameSite=Strict; Path=/` } : {}) }).end(type === 'application/json' ? JSON.stringify(value) : value); };
    try {
      if (req.headers.host !== new URL(localOrigin).host || (req.headers.origin && req.headers.origin !== localOrigin) || (req.headers['sec-fetch-site'] && !['same-origin','none'].includes(req.headers['sec-fetch-site']))) return send(403, { error: 'local-only' });
      const pathname = new URL(req.url, localOrigin).pathname;
      if (req.method === 'GET' && ['/', '/app.js', '/style.css'].includes(pathname)) return send(200, await readFile(new URL(pathname === '/' ? './index.html' : '.' + pathname, import.meta.url), 'utf8'), ({'/':'text/html','/app.js':'text/javascript','/style.css':'text/css'})[pathname]);
      if (!req.headers.cookie?.split(';').some(value => value.trim() === cookieName + '=' + session)) return send(403, { error: 'open-desk-first' });
      if (req.method === 'GET' && pathname === '/state') return send(200, publicState());
      if (req.method !== 'POST' || !req.headers['content-type']?.startsWith('application/json')) return send(404, { error: 'not-found' });
      let body = '', size = 0; for await (const part of req) { size += part.length; if (size > MAX_BODY) throw new Error('too-large'); body += part; } const input = JSON.parse(body || '{}');
      if (pathname === '/auth/start') {
        if (auth) throw new Error('already-connected'); const epoch=++generation;
        const value = await request('/v1/auth/device/code', { method: 'POST', anonymous: true }); if (epoch!==generation) throw new Error('disconnected');
        const url = new URL(value.verification_uri_complete || value.verification_uri);
        if (url.protocol !== 'https:' || url.hostname !== 'panel.relayers.app' || url.pathname !== '/auth/device' || url.username || url.password || typeof value.device_code !== 'string' || typeof value.user_code !== 'string') throw new Error('invalid-pairing');
        pairing = { deviceCode: value.device_code, userCode: value.user_code, url: url.href, expires: Date.now() + Math.min(900, value.expires_in) * 1000, next: 0, interval: Math.max(5, Number(value.interval) || 5) * 1000 }; return send(200, publicState());
      }
      if (pathname === '/auth/poll') {
        if (!pairing || pendingPoll || Date.now() < pairing.next) return send(200, publicState());
        if (Date.now() >= pairing.expires) { pairing = null; throw new Error('pairing-expired'); }
        pendingPoll = true; pairing.next = Date.now() + pairing.interval; const epoch=generation;
        try { const value = await request('/v1/auth/device/token', { body: { device_code: pairing.deviceCode }, anonymous: true }); if(epoch!==generation)throw new Error('disconnected'); if (!value?.access_token || !value.refresh_token) throw new Error('invalid-pairing'); auth = value; pairing = null; await connect(); }
        catch (error) { if (error.message !== 'authorization_pending') throw error; }
        finally { pendingPoll = false; } return send(200, publicState());
      }
      if (pathname === '/configure') { await configure(input); return send(200, publicState()); }
      if (pathname === '/reply') return send(200, await reply(input));
      if (pathname === '/results') { await refreshResults(); return send(200, publicState()); }
      if (pathname === '/reconnect') { if (auth?.refresh_token) auth = await request('/v1/auth/refresh', { body: { refresh_token: auth.refresh_token }, anonymous: true }); await connect(); return send(200, publicState()); }
      if (pathname === '/clear') { messages.length = 0; seen.clear(); sends.clear(); return send(200, publicState()); }
      if (pathname === '/disconnect') { generation++; stopSocket(); if (auth && daemonId) await request(`/v1/daemons/${daemonId}/`, { method: 'DELETE' }).catch(()=>{}); auth = pairing = settings = daemonId = undefined; messages.length = 0; seen.clear(); sends.clear(); state = 'disconnected'; return send(200, publicState()); }
      return send(404, { error: 'not-found' });
    } catch (error) { return send(400, { error: /^[a-z-]{2,50}$/.test(error.message) ? error.message : 'request-failed' }); }
  });
  await new Promise((resolve,reject) => { server.once('error',reject); server.listen(port,'127.0.0.1',resolve); });
  localOrigin = `http://127.0.0.1:${server.address().port}`;
  cookieName = `relayers_desk_${server.address().port}`;
  if (open) { const launch = process.platform === 'win32' ? ['cmd', ['/c','start','',localOrigin]] : process.platform === 'darwin' ? ['open',[localOrigin]] : ['xdg-open',[localOrigin]]; spawn(...launch,{stdio:'ignore'}).on('error',()=>{}).unref(); }
  return { url: localOrigin, state: publicState, close: async () => { closed=true; generation++;stopSocket();if(auth&&daemonId)await request(`/v1/daemons/${daemonId}/`,{method:'DELETE'}).catch(()=>{});auth=undefined;await new Promise(resolve=>server.close(resolve)); } };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (Number(process.versions.node.split('.')[0]) < 22) throw new Error('Install Node.js 22 or newer from nodejs.org.');
  const desk = await createDesk({ open: !process.argv.includes('--no-open') });
  console.log(`Balcão do tutorial / Tutorial desk: ${desk.url}`);
  console.log('Keep this window open. No messages are saved to disk. Ctrl+C closes the desk.');
  for (const signal of ['SIGINT','SIGTERM']) process.once(signal,async()=>{await desk.close();process.exit(0)});
}
