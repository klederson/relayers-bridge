import { apiBase, permissionOrigin, SCHEMA, DESTINATION, uuid, chatId } from './contracts.js';
import { createCommandJournal } from './journal.js';
import { createInbox } from './inbox.js';
import { readRelayInPage } from './whatsapp.js';
import { executeQuickReply } from '../quick-reply.js';
import { createRelayersClient } from './api.js';
import { hmac, decodeKey, signFrame, createFrameVerifier, decodeBody } from './wire.js';
import { normalizeSettings, matchesFilter } from './filters.js';

export function createBridgeController(api, { fetcher = fetch, Socket = WebSocket, now = Date.now } = {}) {
  const local = api.storage.local;
  const journal = createCommandJournal(local, { now });
  const inbox = createInbox(local, { now });
  let binding, auth, client, socket, sessionKey, verify, heartbeat, scanTimer, authTimer;
  let state = 'disconnected', lastError = '', lastResult = null, polling = false, configuring = false;
  let nextFlushAt = 0, retryDelay = 2000;
  let generation = 0;
  let scanning = false;
  let commandChain = Promise.resolve(), tickChain = Promise.resolve();
  const saveBinding = async () => local.set({ bridgeBinding: binding });
  const credentials = () => ({ origins: [permissionOrigin(auth.server)], ...(api.runtime.getBrowserInfo ? { data_collection: ['authenticationInfo', 'personalCommunications', 'personallyIdentifyingInfo'] } : {}) });
  const saveAuth = async tokens => { auth = { ...auth, ...tokens }; await local.set({ bridgeAuth: auth }); };
  const makeClient = () => {
    const epoch = generation, server = auth.server;
    const current = () => { if (epoch !== generation || auth?.server !== server) throw new Error('disconnected'); };
    client = createRelayersClient(server, {
      getAuth: async () => { current(); return auth; },
      saveAuth: async tokens => { current(); return saveAuth(tokens); },
      fetcher: async (...args) => {
        current();
        if (!await api.permissions.contains(credentials())) throw new Error('permission-revoked');
        current();
        const response = await fetcher(...args); current(); return response;
      }
    });
  };
  const stopTransport = () => {
    clearInterval(heartbeat); clearInterval(scanTimer); clearTimeout(authTimer);
    sessionKey = null; verify = null;
    const previous = socket; socket = null;
    if (previous) { previous.onclose = null; previous.close(); }
  };
  const fail = error => { lastError = error?.message || 'unavailable'; state = binding?.enabled ? 'offline' : binding ? 'paused' : 'disconnected'; stopTransport(); };
  const scan = async (tabId, ids = [], enforceBinding = true) => {
    const tab = await api.tabs.get(tabId);
    if (tab.incognito || !tab.url?.startsWith('https://web.whatsapp.com/')) throw new Error('wrong-tab');
    if (enforceBinding && binding && (tabId !== binding.tabId || tab.cookieStoreId !== binding.cookieStoreId)) throw new Error('wrong-tab');
    const frames = await api.scripting.executeScript({ target: { tabId, frameIds: [0] }, world: 'MAIN', func: readRelayInPage, args: [ids] });
    const result = frames.find(frame => frame.frameId === 0)?.result;
    if (!result?.ok) throw new Error(result?.code || 'unavailable');
    if (enforceBinding && binding && result.accountId !== binding.accountId) throw new Error('wrong-account');
    return { ...result, cookieStoreId: tab.cookieStoreId };
  };
  const write = async frame => {
    const target = socket, key = sessionKey;
    if (!target || target.readyState !== 1 || !key) throw new Error('offline');
    const signed = await signFrame(key, frame, now());
    if (target !== socket || key !== sessionKey) throw new Error('offline');
    target.send(JSON.stringify(signed));
  };
  const ensureEndpoint = async direction => {
    const current = binding, transport = client, epoch = generation;
    const check = () => { if (current !== binding || epoch !== generation) throw new Error('disconnected'); };
    const field = direction === 'in' ? 'inEndpoint' : 'outEndpoint';
    if (binding[field]) return binding[field];
    const slug = `whatsapp-${direction}-${binding.connectionId}`;
    const listed = await transport.request(`/v1/endpoints/?search=${encodeURIComponent(slug)}&per_page=100`);
    check();
    let endpoint = listed?.find(item => item.slug === slug);
    if (!endpoint) endpoint = await transport.request('/v1/endpoints/', { method: 'POST', body: { name: `WhatsApp Bridge ${direction.toUpperCase()}`, slug,
      signature_algo: 'hmac-sha256', signature_header: 'X-Relayers-Signature', signing_secret: binding.signingSecrets[direction], dedup_window_sec: 86400, rate_limit_per_sec: 10 } });
    check();
    if (!uuid(endpoint?.id) || typeof endpoint.public_id !== 'string' || !/^[\w-]+$/.test(endpoint.public_id) || endpoint.signature_algo !== 'hmac-sha256') throw new Error('invalid-endpoint');
    binding[field] = { id: endpoint.id, publicId: endpoint.public_id };
    await saveBinding(); return binding[field];
  };
  const ensureRule = async () => {
    if (!binding?.outbound || binding.ruleId) return;
    const current = binding, transport = client, epoch = generation;
    const check = () => { if (current !== binding || epoch !== generation) throw new Error('disconnected'); };
    const endpoint = binding.outEndpoint;
    const name = `WhatsApp Bridge OUT ${binding.connectionId}`;
    const rules = await transport.request(`/v1/endpoints/${endpoint.id}/rules/`);
    check();
    let rule = rules?.find(item => item.name === name && item.daemon_id === binding.daemonId);
    if (!rule) rule = await transport.request(`/v1/endpoints/${endpoint.id}/rules/`, { method: 'POST', body: { name, priority: 100, filter: {},
      destination_type: 'tunnel', destination_url: DESTINATION, daemon_id: binding.daemonId, http_method: 'POST', timeout_ms: 30000,
      retry_policy: { max_retries: 5, backoff_base_sec: 10, backoff_max_sec: 60 } } });
    check();
    if (!uuid(rule?.id)) throw new Error('invalid-rule');
    binding.ruleId = rule.id; await saveBinding();
  };
  const applicationDevices = async () => {
    const response = await client.request('/v1/daemons/?per_page=100');
    const listed = response === null ? [] : response;
    if (!Array.isArray(listed)) throw new Error('invalid-devices');
    return listed.filter(item => uuid(item.id) && item.id !== binding?.daemonId).map(item => ({ id: item.id,
      name: String(item.name || item.hostname || item.system_info?.hostname || item.id).slice(0, 120), status: String(item.status || '').slice(0, 30) }));
  };
  const ensureIncomingRule = async settings => {
    if (!binding?.inbound) {
      if (settings.destination.kind !== 'none') throw new Error('inbound-disabled');
      return;
    }
    const current = binding, epoch = generation, transport = client;
    const check = () => { if (current !== binding || epoch !== generation) throw new Error('disconnected'); };
    const destination = settings.destination;
    const base = `/v1/endpoints/${current.inEndpoint.id}/rules/`;
    const name = `WhatsApp Bridge IN app ${current.connectionId}`;
    // Reconcile before a write: the service may have committed a previous POST
    // whose response was lost. Retrying must not duplicate application delivery.
    const response = await transport.request(base); check();
    const listed = response === null ? [] : response;
    if (!Array.isArray(listed)) throw new Error('invalid-rule');
    const named = listed.filter(rule => rule.name === name);
    if (named.length > 1) throw new Error('duplicate-application-rules');
    const existing = listed.find(rule => rule.id === current.inRuleId) ?? named[0];
    current.inRuleId = existing?.id ?? null;
    if (current.inRuleId && !uuid(current.inRuleId)) throw new Error('invalid-rule');
    if (destination.kind === 'none') {
      if (current.inRuleId) {
        await transport.request(`/v1/endpoints/${current.inEndpoint.id}/rules/${current.inRuleId}`, { method: 'DELETE' }); check();
        current.inRuleId = null; await saveBinding();
      }
      return;
    }
    if (destination.kind === 'local') {
      const devices = await applicationDevices(); check();
      if (!devices.some(item => item.id === destination.daemonId)) throw new Error('invalid-device');
    }
    const body = { name, priority: 100, filter: {}, destination_url: destination.url,
      destination_type: destination.kind === 'local' ? 'tunnel' : 'public', daemon_id: destination.kind === 'local' ? destination.daemonId : null,
      http_method: 'POST', timeout_ms: 30000, retry_policy: { max_retries: 5, backoff_base_sec: 10, backoff_max_sec: 60 } };
    const rule = await transport.request(current.inRuleId ? `${base}${current.inRuleId}` : base, { method: current.inRuleId ? 'PATCH' : 'POST', body }); check();
    if (!uuid(rule?.id)) throw new Error('invalid-rule');
    current.inRuleId = rule.id; await saveBinding();
  };
  const deliver = async frame => {
    let result = { status: 'rejected', code: 'wrong-endpoint' }, command;
    if (binding?.enabled && frame.endpoint_id === binding.outEndpoint?.id && frame.url === DESTINATION && frame.method === 'POST') {
      try {
        command = decodeBody(frame.body);
        result = await journal.execute(command, () => binding, async value => {
          if (!binding?.enabled || !binding.outbound) return { ok: false, code: 'outbound-disabled' };
          if (!matchesFilter(binding.settings?.outgoingFilter, { text: value.text, type: 'chat', chatId: value.chatId })) return { ok: false, code: 'filtered-out' };
          if (!await api.permissions.contains(credentials())) return { ok: false, code: 'permission-revoked' };
          await scan(binding.tabId);
          const snapshot = await executeQuickReply(api, binding.tabId, { action: 'snapshot', chatId: value.chatId });
          if (!snapshot.ok) return snapshot;
          if (snapshot.accountId !== binding?.accountId) return { ok: false, code: 'wrong-account' };
          if (!binding.enabled || !binding.outbound) return { ok: false, code: 'outbound-disabled' };
          return executeQuickReply(api, binding.tabId, { action: 'send', accountId: binding.accountId, documentId: snapshot.documentId, operationId: value.commandId, chatId: value.chatId, text: value.text });
        });
      } catch { result = { status: 'uncertain', code: 'dispatch-interrupted' }; }
    }
    lastResult = { status: result.status, code: result.code, at: now() };
    await write({ type: 'deliver_resp', delivery_id: frame.delivery_id, status_code: result.status === 'uncertain' ? 202 : 200,
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ schema: SCHEMA, commandId: command?.commandId, ...result }) });
  };
  const tick = () => {
    if (scanning) return tickChain;
    scanning = true;
    const task = tickChain.catch(() => {}).then(async () => {
      if (!binding?.enabled || state !== 'connected') return;
      if (!await api.permissions.contains(credentials())) throw new Error('permission-revoked');
      const current = binding;
      const snapshot = await scan(current.tabId, current.inbound ? current.chatIds : []);
      if (!current.inbound) return;
      if (!current.enabled || current !== binding) return;
      const captured = await inbox.capture(current, snapshot.messages);
      if (captured.blocked) lastError = 'queue-full';
      const pending = await inbox.peek();
      if (!pending || !current.enabled || current !== binding || now() < nextFlushAt) return;
      const body = JSON.stringify(pending.body);
      const signature = await hmac(current.signingSecrets.in, body);
      if (!current.enabled || current !== binding) return;
      if (!await api.permissions.contains(credentials())) throw new Error('permission-revoked');
      const response = await fetcher(`${auth.server}/v1/webhooks/${encodeURIComponent(current.inEndpoint.publicId)}`, { method: 'POST', body, redirect: 'error', credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(15000),
        headers: { 'Content-Type': 'application/json', 'X-Relayers-Signature': signature, 'X-Idempotency-Key': pending.id } });
      const envelope = await response.json().catch(() => ({}));
      if (!response.ok || !['received', 'duplicate'].includes(envelope.data?.status)) throw new Error('ingest-unavailable');
      await inbox.acknowledge(pending.id); lastError = captured.blocked ? 'queue-full' : ''; retryDelay = 2000; nextFlushAt = 0;
    });
    tickChain = task;
    task.then(() => { scanning = false; }, () => { scanning = false; });
    task.catch(error => {
      lastError = error.message;
      nextFlushAt = now() + retryDelay; retryDelay = Math.min(60000, retryDelay * 2);
      if (['wrong-account', 'wrong-tab', 'permission-revoked', 'queue-expired', 'snapshot-too-large'].includes(error.message)) {
        if (binding) { binding.enabled = false; saveBinding().catch(() => {}); }
        state = 'paused'; stopTransport();
      }
    });
    return task;
  };
  const connect = async () => {
    if (!binding?.enabled || !auth?.access_token || socket || configuring) return;
    if (!await api.permissions.contains(credentials())) throw new Error('permission-revoked');
    await scan(binding.tabId);
    state = 'connecting'; lastError = '';
    const url = new URL('/v1/tunnel/connect', auth.server); url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    const connection = new Socket(url.href); socket = connection;
    connection.onopen = () => {
      connection.send(JSON.stringify({ type: 'auth', token: auth.access_token, daemon_id: binding.daemonId ?? '', system_info: { hostname: 'RELAYERS Bridge', os: 'browser' } }));
      authTimer = setTimeout(() => fail(new Error('auth-timeout')), 10000);
    };
    connection.onmessage = event => {
      commandChain = commandChain.catch(() => {}).then(async () => {
        if (socket !== connection || typeof event.data !== 'string' || event.data.length > 150000) return;
        const frame = JSON.parse(event.data);
        if (!sessionKey) {
          if (frame.type !== 'auth_ok' || !uuid(frame.daemon_id)) throw new Error(frame.type === 'error' ? 'authentication-failed' : 'invalid-handshake');
          clearTimeout(authTimer); sessionKey = decodeKey(frame.session_key); verify = createFrameVerifier(sessionKey, now);
          binding.daemonId = frame.daemon_id; await saveBinding();
          await ensureRule();
          if (socket !== connection || !binding.enabled) return;
          await write({ type: 'subscribe', endpoint_ids: [binding.outEndpoint?.id ?? binding.inEndpoint.id] });
          state = 'connected';
          heartbeat = setInterval(() => { write({ type: 'heartbeat' }).catch(fail); }, 20000);
          scanTimer = setInterval(() => { tick().catch(() => {}); }, 2000);
          tick().catch(() => {});
          return;
        }
        await verify(frame);
        if (frame.type === 'deliver') await deliver(frame);
        else if (frame.type === 'ping') await write({ type: 'ping_resp', ping_id: frame.ping_id });
        else if (frame.type === 'error') throw new Error('server-error');
      }).catch(fail);
    };
    connection.onclose = () => { if (socket === connection) { stopTransport(); state = binding?.enabled ? 'offline' : 'paused'; } };
    connection.onerror = () => { if (socket === connection) fail(new Error('connection-failed')); };
  };
  const initialize = async () => {
    ({ bridgeBinding: binding, bridgeAuth: auth } = await local.get(['bridgeBinding', 'bridgeAuth']));
    if (auth?.server) makeClient();
    if (await inbox.expire() && binding) { binding.enabled = false; lastError = 'queue-expired'; await saveBinding(); }
    if (binding) state = binding.enabled ? 'offline' : 'paused';
    await api.alarms.create('bridge-reconnect', { periodInMinutes: 1 });
    await connect().catch(fail);
  };
  return {
    initialize,
    async reconnect() {
      if (await inbox.expire() && binding) { binding.enabled = false; lastError = 'queue-expired'; await saveBinding(); stopTransport(); state = 'paused'; }
      if (binding?.enabled && state !== 'connected') {
        if (lastError === 'authentication-failed' && auth?.refresh_token) {
          const epoch = generation;
          const tokens = await client.request('/v1/auth/refresh', { method: 'POST', authenticated: false, body: { refresh_token: auth.refresh_token } });
          if (epoch !== generation || !binding?.enabled) return;
          await saveAuth(tokens);
        }
        await connect().catch(fail);
      }
    },
    async handle(message) {
      if (message.type === 'bridge-status') {
        const { bridgePairing: pairing } = await api.storage.session.get('bridgePairing');
        return { ok: true, state, lastError, lastResult, server: auth?.server, connectedAccount: binding?.accountId,
        authenticated: Boolean(auth?.access_token), binding: binding ? { connectionId: binding.connectionId, accountId: binding.accountId, chatIds: binding.chatIds,
          enabled: binding.enabled, inbound: binding.inbound, outbound: binding.outbound, inUrl: binding.inEndpoint ? `${auth.server}/v1/webhooks/${binding.inEndpoint.publicId}` : null,
          outUrl: binding.outEndpoint ? `${auth.server}/v1/webhooks/${binding.outEndpoint.publicId}` : null,
          settings: normalizeSettings(binding.settings), settingsPending: Boolean(binding.settingsPending), applicationRoute: Boolean(binding.inRuleId) } : null,
        pending: await inbox.count(), pairing: pairing ? { userCode: pairing.userCode, verificationUri: pairing.verificationUri } : null };
      }
      if (message.type === 'bridge-begin-auth') {
        if (binding) throw new Error('disconnect-first');
        const server = apiBase(message.server);
        const epoch = ++generation;
        await api.storage.session.remove('bridgePairing');
        if (epoch !== generation) throw new Error('disconnected');
        auth = { server }; makeClient();
        if (!await api.permissions.contains({ origins: [permissionOrigin(server)] })) throw new Error('permission-revoked');
        const data = await client.request('/v1/auth/device/code', { method: 'POST', authenticated: false });
        if (epoch !== generation) throw new Error('disconnected');
        if (typeof data?.device_code !== 'string' || typeof data.user_code !== 'string' || data.user_code.length > 40 || !Number.isFinite(data.expires_in)) throw new Error('invalid-pairing');
        const verification = new URL(data.verification_uri_complete || data.verification_uri);
        if (verification.username || verification.password) throw new Error('invalid-pairing');
        apiBase(verification.origin);
        const pairing = { server, deviceCode: data.device_code, userCode: data.user_code, verificationUri: verification.href, expiresAt: now() + Math.min(data.expires_in, 900) * 1000, nextPollAt: now(), interval: Math.max(5, Number(data.interval) || 5) * 1000 };
        await api.storage.session.set({ bridgePairing: pairing });
        return { ok: true, userCode: pairing.userCode, verificationUri: pairing.verificationUri };
      }
      if (message.type === 'bridge-poll-auth') {
        const epoch = generation;
        if (polling) return { ok: true, pending: true };
        const { bridgePairing: pairing } = await api.storage.session.get('bridgePairing');
        if (epoch !== generation) throw new Error('disconnected');
        if (!pairing || pairing.expiresAt <= now()) throw new Error('pairing-expired');
        if (pairing.nextPollAt > now()) return { ok: true, pending: true };
        polling = true;
        try {
          auth = { server: pairing.server }; makeClient();
          pairing.nextPollAt = now() + pairing.interval; await api.storage.session.set({ bridgePairing: pairing });
          const tokens = await client.request('/v1/auth/device/token', { method: 'POST', body: { device_code: pairing.deviceCode }, authenticated: false });
          if (epoch !== generation) throw new Error('disconnected');
          if (!tokens?.access_token || !tokens.refresh_token) throw new Error('invalid-pairing');
          await saveAuth(tokens); await api.storage.session.remove('bridgePairing'); return { ok: true, authenticated: true };
        } catch (error) { if (error.message === 'authorization_pending') return { ok: true, pending: true }; throw error; }
        finally { polling = false; }
      }
      if (message.type === 'bridge-tabs') {
        const tabs = (await api.tabs.query({})).filter(tab => !tab.incognito && tab.url?.startsWith('https://web.whatsapp.com/'));
        return { ok: true, tabs: tabs.map(tab => ({ id: tab.id, title: tab.title || 'WhatsApp' })) };
      }
      if (message.type === 'bridge-chats') {
        const snapshot = await scan(message.tabId);
        return { ok: true, accountId: snapshot.accountId, chats: snapshot.chats };
      }
      if (message.type === 'bridge-create') {
        if (binding || configuring) throw new Error('disconnect-first');
        if (!auth?.access_token || !message.consent || (!message.inbound && !message.outbound) || !Number.isInteger(message.tabId)
          || !Array.isArray(message.chatIds) || !message.chatIds.length || message.chatIds.length > 50 || message.chatIds.some(id => !chatId(id))) throw new Error('invalid-scope');
        if (!await api.permissions.contains(credentials())) throw new Error('permission-revoked');
        const settings = normalizeSettings(message.settings);
        if (!message.inbound && settings.destination.kind !== 'none') throw new Error('inbound-disabled');
        configuring = true;
        try {
          const snapshot = await scan(message.tabId, message.chatIds);
          if (message.chatIds.some(id => !snapshot.chats.some(chat => chat.id === id))) throw new Error('stale-chat');
          if (snapshot.messages.length > 10000) throw new Error('queue-full');
          binding = { connectionId: crypto.randomUUID(), accountId: snapshot.accountId, tabId: message.tabId, cookieStoreId: snapshot.cookieStoreId,
            chatIds: [...new Set(message.chatIds)], inbound: message.inbound === true, outbound: message.outbound === true, enabled: false, startedAt: now(),
            settings, settingsPending: true, signingSecrets: Object.fromEntries(['in', 'out'].map(direction => [direction, [...crypto.getRandomValues(new Uint8Array(32))].map(byte => byte.toString(16).padStart(2, '0')).join('')])) };
          await saveBinding(); await inbox.baseline(binding.connectionId, snapshot.messages);
          if (binding.inbound) await ensureEndpoint('in');
          if (binding.outbound) await ensureEndpoint('out');
          await ensureIncomingRule(settings);
          binding.settingsPending = false; binding.enabled = true; await saveBinding();
        } finally { configuring = false; }
        await connect(); return { ok: true };
      }
      if (message.type === 'bridge-config-options') {
        if (!auth?.access_token) throw new Error('not-configured');
        const devices = await applicationDevices();
        const snapshot = binding ? await scan(binding.tabId, binding.chatIds) : null;
        return { ok: true, devices, chats: snapshot?.chats?.filter(item => binding.chatIds.includes(item.id)) ?? [] };
      }
      if (message.type === 'bridge-configure') {
        if (!binding || !auth?.access_token || configuring) throw new Error('not-configured');
        if (message.consent !== true) throw new Error('confirmation-required');
        const settings = normalizeSettings(message.settings);
        if (!await api.permissions.contains(credentials())) throw new Error('permission-revoked');
        configuring = true;
        try {
          binding.enabled = false; stopTransport(); state = 'paused';
          await tickChain.catch(() => {}); await commandChain.catch(() => {});
          const current = binding, epoch = generation;
          if (!current) throw new Error('disconnected');
          current.settingsPending = true; await saveBinding();
          if (current.inbound) await ensureEndpoint('in');
          if (current.outbound) await ensureEndpoint('out');
          await ensureIncomingRule(settings);
          if (current !== binding || epoch !== generation) throw new Error('disconnected');
          current.settings = settings; current.settingsPending = false; await saveBinding(); lastError = '';
        } catch (error) { lastError = error.message; throw error; }
        finally { configuring = false; }
        return { ok: true, paused: true };
      }
      if (message.type === 'bridge-pause') {
        if (binding) { binding.enabled = false; await saveBinding(); } stopTransport(); state = 'paused'; return { ok: true };
      }
      if (message.type === 'bridge-out-secret') {
        if (!binding?.outbound || !message.confirm) throw new Error('confirmation-required');
        return { ok: true, secret: binding.signingSecrets.out };
      }
      if (message.type === 'bridge-rebind') {
        if (configuring) throw new Error('configuration-pending');
        if (!binding || !Number.isInteger(message.tabId)) throw new Error('not-configured');
        const snapshot = await scan(message.tabId, binding.chatIds, false);
        if (snapshot.accountId !== binding.accountId) throw new Error('wrong-account');
        if (binding.chatIds.some(id => !snapshot.chats.some(chat => chat.id === id))) throw new Error('stale-chat');
        const resume = binding.enabled;
        binding.enabled = false; stopTransport();
        await tickChain.catch(() => {}); await commandChain.catch(() => {});
        binding.tabId = message.tabId; binding.cookieStoreId = snapshot.cookieStoreId; binding.enabled = resume;
        await saveBinding(); state = resume ? 'offline' : 'paused';
        await connect(); return { ok: true };
      }
      if (message.type === 'bridge-resume') {
        if (!binding || !auth?.access_token) throw new Error('not-configured');
        if (configuring || binding.settingsPending) throw new Error('configuration-pending');
        await scan(binding.tabId);
        if (!await api.permissions.contains(credentials())) throw new Error('permission-revoked');
        if (binding.inbound) await ensureEndpoint('in'); if (binding.outbound) await ensureEndpoint('out');
        binding.startedAt = now(); binding.enabled = true; await saveBinding(); await connect(); return { ok: true };
      }
      if (message.type === 'bridge-disconnect') {
        if (!message.confirm) throw new Error('confirmation-required');
        generation++;
        if (binding) binding.enabled = false;
        stopTransport(); await tickChain.catch(() => {}); await commandChain.catch(() => {});
        const server = auth?.server; binding = null; auth = null; client = null; state = 'disconnected'; lastError = ''; lastResult = null;
        await local.remove(['bridgeAuth', 'bridgeBinding', 'bridgeInbox', 'bridgeCommandJournal']); await api.storage.session.remove('bridgePairing');
        if (server) await api.permissions.remove({ origins: [permissionOrigin(server)] });
        if (api.runtime.getBrowserInfo) {
          const { qrAiKey } = await local.get('qrAiKey');
          await api.permissions.remove({ data_collection: qrAiKey ? ['personallyIdentifyingInfo'] : ['authenticationInfo', 'personalCommunications', 'personallyIdentifyingInfo'] });
        }
        return { ok: true };
      }
      throw new Error('invalid-request');
    }
  };
}
