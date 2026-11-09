// Opt-in test against an owned RELAYERS test account. WhatsApp is ALWAYS a fixture.
// Credentials stay outside the repository; this test never contacts WhatsApp.
import assert from 'node:assert/strict';
import { createHmac, randomUUID } from 'node:crypto';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { WebSocket } from 'ws';
import { decodeKey, createFrameVerifier, signFrame } from '../extension/bridge/wire.js';
import { dismissChromiumWelcome } from './installation.mjs';

if (process.env.RELAYERS_LIVE_TEST !== '1' || !process.env.RELAYERS_LIVE_ACCOUNT_FILE) {
  throw new Error('Explicit RELAYERS_LIVE_TEST=1 and external RELAYERS_LIVE_ACCOUNT_FILE are required.');
}
const account = JSON.parse(await readFile(process.env.RELAYERS_LIVE_ACCOUNT_FILE, 'utf8'));
assert.ok(account.email?.startsWith('bridge-qa-') && account.email.endsWith('@example.invalid'), 'Use a dedicated Bridge QA account.');
assert.equal(new URL(account.server).protocol, 'https:');
const address = new URL(account.server).origin;
let stage = 'test profile', context, bridge, worker, config, access, approval, loginStatus, approvalStatus;
let appSocket, appServer, appHeartbeat, appDaemon, appError;
const appMessages = [];
const profile = await mkdtemp(join(tmpdir(), 'relayers-bridge-live-'));
const extension = join(profile, 'extension');
const eventually = async (check, message, timeout = 45000) => {
  const end = Date.now() + timeout;
  while (Date.now() < end) { if (await check()) return; await new Promise(resolve => setTimeout(resolve, 500)); }
  throw new Error(message);
};
const request = async (path, options = {}) => {
  const response = await fetch(`${address}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(access ? { Authorization: `Bearer ${access}` } : {}), ...options.headers }, signal: AbortSignal.timeout(20000) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error('Live API request failed');
    error.httpStatus = response.status; error.apiCode = body.error?.code || 'request-failed';
    throw error;
  }
  return body.data;
};
try {
  // The isolated test manifest pre-grants only the selected API origin. Native
  // permission prompts are covered separately by the Firefox browser test.
  await cp(resolve('dist/chrome'), extension, { recursive: true });
  const manifest = JSON.parse(await readFile(join(extension, 'manifest.json'), 'utf8'));
  manifest.host_permissions.push(`${address}/*`);
  await writeFile(join(extension, 'manifest.json'), JSON.stringify(manifest));
  context = await chromium.launchPersistentContext(profile, { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`] });
  const fixture = await readFile(new URL('./fixtures/whatsapp.html', import.meta.url), 'utf8');
  await context.route('https://web.whatsapp.com/**', route => route.fulfill({ contentType: 'text/html', body: fixture }));
  await context.route('https://work.test/**', route => route.fulfill({ contentType: 'text/html', body: '<title>Work fixture</title><textarea>Keep my work</textarea>' }));
  worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
  await dismissChromiumWelcome(context);
  const workerUrl = new URL(worker.url()), origin = `${workerUrl.protocol}//${workerUrl.host}`;
  const whatsapp = await context.newPage(); await whatsapp.goto('https://web.whatsapp.com/');
  await whatsapp.waitForFunction(() => window.documentToken && window.appState);
  const documentHandle = await whatsapp.evaluateHandle(() => document);
  const token = await whatsapp.evaluate(() => documentToken), draft = await whatsapp.locator('#compose').inputValue();
  let navigations = 0; whatsapp.on('framenavigated', frame => { if (frame === whatsapp.mainFrame()) navigations++; });
  bridge = await context.newPage(); await bridge.goto(`${origin}/bridge.html`);
  await bridge.waitForFunction(() => document.documentElement.dataset.ready === 'true');
  if (address !== 'https://api.relayers.app') { await bridge.locator('#login summary').click(); await bridge.locator('#server').fill(address); }
  stage = 'real device code';
  await bridge.locator('#connect').click();
  await eventually(async () => Boolean(await bridge.locator('#user-code').textContent()), 'No device code');
  const verificationUri = await bridge.locator('#verify').getAttribute('href');
  assert.equal(new URL(verificationUri).pathname, '/auth/device');
  assert.equal(new URL(verificationUri).searchParams.get('user_code'), await bridge.locator('#user-code').textContent());
  stage = 'approval page navigation';
  approval = await context.newPage();
  approval.on('response', response => {
    if (new URL(response.url()).pathname === '/v1/auth/login') loginStatus = response.status();
    if (new URL(response.url()).pathname === '/v1/auth/device/verify') approvalStatus = response.status();
  });
  await approval.goto(verificationUri);
  stage = 'approval sign-in link';
  await approval.getByRole('link', { name: 'Sign in to approve' }).click();
  stage = 'login email input';
  await approval.getByLabel('Email', { exact: true }).fill(account.email);
  stage = 'login password input';
  await approval.getByLabel('Password', { exact: true }).fill(account.password);
  stage = 'login submission';
  await approval.getByRole('button', { name: 'Sign in', exact: true }).click();
  stage = 'login return to device approval';
  await approval.waitForURL(url => url.pathname === '/auth/device' && url.searchParams.get('user_code') === new URL(verificationUri).searchParams.get('user_code'));
  stage = 'device code input after login';
  assert.equal(await approval.getByLabel('Device code').inputValue(), new URL(verificationUri).searchParams.get('user_code'));
  assert.equal(await approval.getByText('Device approved', { exact: true }).count(), 0, 'Visiting a link must not approve a device');
  stage = 'explicit device approval click';
  await approval.getByRole('button', { name: 'Approve device', exact: true }).click();
  stage = 'device approval result';
  await approval.getByText('Device approved', { exact: true }).waitFor();
  console.log('Live: explicit device approval completed.');
  access = await approval.evaluate(() => localStorage.getItem('access_token'));
  assert.ok(access, 'The dedicated test account must expose its legacy session for test cleanup');
  stage = 'real device token and explicit connection';
  await bridge.locator('#setup').waitFor({ state: 'visible', timeout: 25000 });
  assert.equal(await bridge.locator('#incoming').isChecked(), false);
  assert.equal(await bridge.locator('#outgoing').isChecked(), false);
  await bridge.locator('#chats input[value="12025550140@c.us"]').check();
  await bridge.locator('#incoming').check(); await bridge.locator('#outgoing').check();
  await bridge.locator('#consent').check(); await bridge.locator('#start').click();
  const status = () => bridge.evaluate(() => chrome.runtime.sendMessage({ type: 'bridge-status' }));
  await eventually(async () => (await status()).state === 'connected', 'Tunnel not connected');
  console.log('Live: dedicated endpoints and bound WebSocket connected.');
  config = await worker.evaluate(async () => (await chrome.storage.local.get('bridgeBinding')).bridgeBinding);
  assert.ok(config.inEndpoint && config.outEndpoint && config.ruleId && config.daemonId);
  const resources = await request('/v1/endpoints/?per_page=100');
  assert.ok(resources.some(item => item.id === config.inEndpoint.id));
  assert.ok(resources.some(item => item.id === config.outEndpoint.id));
  const rules = await request(`/v1/endpoints/${config.outEndpoint.id}/rules/`);
  assert.ok(rules.some(item => item.id === config.ruleId && item.daemon_id === config.daemonId));
  stage = 'real HTTP OUT, queue, worker and WebSocket';
  const secret = await bridge.evaluate(() => chrome.runtime.sendMessage({ type: 'bridge-out-secret', confirm: true }));
  const command = { schema: 'relayers.whatsapp.v1', type: 'message.send', commandId: randomUUID(), connectionId: config.connectionId, accountId: config.accountId, chatId: config.chatIds[0], text: 'RELAYERS live transport test — simulated WhatsApp only.', expiresAt: new Date(Date.now() + 300000).toISOString() };
  const submit = async value => {
    const raw = JSON.stringify(value);
    // An independent application needs the OUT secret, not the browser's
    // RELAYERS login token or its cookies, to submit an authorized command.
    const response = await fetch(`${address}/v1/webhooks/${config.outEndpoint.publicId}`, { method: 'POST', body: raw,
      headers: { 'Content-Type': 'application/json', 'X-Relayers-Signature': createHmac('sha256', secret.secret).update(raw).digest('hex'), 'X-Idempotency-Key': randomUUID() }, signal: AbortSignal.timeout(20000) });
    assert.ok(response.ok, 'Independent application OUT ingestion failed');
    return (await response.json()).data;
  };
  const work = await context.newPage(); await work.goto('https://work.test/'); await work.bringToFront();
  const workId = await worker.evaluate(async () => (await chrome.tabs.query({ active: true, currentWindow: true }))[0].id);
  const event = await submit(command);
  await eventually(async () => await whatsapp.evaluate(() => appState.messages.length) === 1, 'OUT did not reach the WhatsApp fixture');
  let result;
  await eventually(async () => {
    const deliveries = await request(`/v1/events/${event.event_id}/deliveries`);
    result = (deliveries ?? []).find(item => item.status === 'success');
    return Boolean(result);
  }, 'OUT result not recorded');
  assert.equal(JSON.parse(result.response_body).status, 'accepted');
  console.log('Live: OUT accepted through the real queue/worker/tunnel.');
  const duplicate = await submit(command);
  await eventually(async () => (await request(`/v1/events/${duplicate.event_id}/deliveries`) ?? []).some(item => item.status === 'success'), 'Duplicate not handled');
  assert.deepEqual(await whatsapp.evaluate(() => appState.messages), [{ to: command.chatId, text: command.text }]);
  assert.equal(await whatsapp.evaluate(original => document === original, documentHandle), true);
  assert.equal(await whatsapp.evaluate(() => documentToken), token);
  assert.equal(await whatsapp.locator('#compose').inputValue(), draft);
  assert.deepEqual(await whatsapp.evaluate(() => appState.opens), []);
  assert.equal(navigations, 0);
  assert.equal(await worker.evaluate(async () => (await chrome.tabs.query({ active: true, currentWindow: true }))[0].id), workId);
  stage = 'independent local application and its own tunnel';
  appServer = createServer(async (req, res) => {
    let raw = ''; for await (const part of req) raw += part;
    if (req.method !== 'POST' || req.url !== '/messages') { res.writeHead(404).end(); return; }
    try { appMessages.push(JSON.parse(raw)); res.writeHead(204).end(); }
    catch { res.writeHead(400).end(); }
  });
  await new Promise(resolve => appServer.listen(0, '127.0.0.1', resolve));
  const appUrl = `http://127.0.0.1:${appServer.address().port}/messages`;
  const appDestination = 'https://tutorial.bridge.invalid/messages';
  const tunnelUrl = new URL('/v1/tunnel/connect', address); tunnelUrl.protocol = 'wss:';
  appSocket = new WebSocket(tunnelUrl);
  await new Promise((resolve, reject) => {
    let key, verify, chain = Promise.resolve();
    const timer = setTimeout(() => reject(new Error('Application tunnel timeout')), 15000);
    const write = async frame => appSocket.send(JSON.stringify(await signFrame(key, frame)));
    appSocket.on('open', () => appSocket.send(JSON.stringify({ type: 'auth', token: access, daemon_id: '', system_info: { hostname: 'Bridge tutorial QA app', os: 'node' } })));
    appSocket.on('error', error => { appError = error; reject(error); });
    appSocket.on('message', raw => {
      chain = chain.then(async () => {
        const frame = JSON.parse(raw.toString());
        if (!key) {
          assert.equal(frame.type, 'auth_ok'); appDaemon = frame.daemon_id;
          assert.notEqual(appDaemon, config.daemonId, 'The application and browser need separate tunnel destinations');
          key = decodeKey(frame.session_key); verify = createFrameVerifier(key);
          await write({ type: 'subscribe', endpoint_ids: [config.inEndpoint.id] });
          appHeartbeat = setInterval(() => write({ type: 'heartbeat' }).catch(error => { appError = error; }), 20000);
          clearTimeout(timer); resolve(); return;
        }
        await verify(frame);
        if (frame.type === 'ping') { await write({ type: 'ping_resp', ping_id: frame.ping_id }); return; }
        if (frame.type !== 'deliver') return;
        assert.equal(frame.endpoint_id, config.inEndpoint.id); assert.equal(frame.url, appDestination); assert.equal(frame.method, 'POST');
        const delivered = await fetch(appUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: Buffer.from(frame.body, 'base64'), signal: AbortSignal.timeout(5000) });
        await write({ type: 'deliver_resp', delivery_id: frame.delivery_id, status_code: delivered.status, headers: {}, body: '' });
      }).catch(error => { appError = error; clearTimeout(timer); reject(error); });
    });
  });
  await request(`/v1/endpoints/${config.inEndpoint.id}/rules/`, { method: 'POST', body: JSON.stringify({ name: 'Tutorial QA IN to application', priority: 100, filter: {},
    destination_type: 'tunnel', destination_url: appDestination, daemon_id: appDaemon, http_method: 'POST', timeout_ms: 30000,
    retry_policy: { max_retries: 5, backoff_base_sec: 10, backoff_max_sec: 60 } }) });
  stage = 'real signed IN ingestion and delivery to the application';
  const messageId = `live-fixture-${randomUUID()}`;
  await whatsapp.evaluate(id => {
    require('WAWebChatCollection').ChatCollection.getModelsArray()[0].msgs.getModelsArray = () => [
      { id: { _serialized: id, fromMe: false }, type: 'chat', body: 'Incoming fixture text for the live RELAYERS transport.', t: Math.floor(Date.now() / 1000) + 1 },
      { id: { _serialized: `${id}-echo`, fromMe: true }, type: 'chat', body: 'Do not export outgoing echoes.', t: Math.floor(Date.now() / 1000) + 1 }
    ];
  }, messageId);
  let received;
  await eventually(async () => {
    const events = await request(`/v1/events/?endpoint_id=${config.inEndpoint.id}&per_page=100`);
    received = (events ?? []).map(item => ({ event: item, payload: JSON.parse(Buffer.from(item.request_body, 'base64').toString('utf8')) })).find(item => item.payload.messageId === messageId);
    return Boolean(received);
  }, 'IN not recorded by RELAYERS');
  assert.equal(received.payload.text, 'Incoming fixture text for the live RELAYERS transport.');
  assert.equal(received.payload.connectionId, config.connectionId);
  await eventually(() => appMessages.some(item => item.messageId === messageId), 'IN did not reach the separate local application');
  assert.equal(appMessages.find(item => item.messageId === messageId).text, received.payload.text);
  assert.ok(!appError, 'Application tunnel failed');
  await eventually(async () => (await status()).pending === 0, 'Acknowledged IN still queued');
  stage = 'application reply through OUT without browser login credentials';
  const reply = { ...command, commandId: randomUUID(), text: 'Your order is ready — hypothetical tutorial case.', expiresAt: new Date(Date.now() + 300000).toISOString() };
  await submit(reply);
  await eventually(async () => await whatsapp.evaluate(() => appState.messages.length) === 2, 'Application reply did not return through OUT');
  assert.equal(await whatsapp.evaluate(original => document === original, documentHandle), true);
  assert.equal(await whatsapp.locator('#compose').inputValue(), draft); assert.equal(navigations, 0);
  assert.deepEqual(await whatsapp.evaluate(() => appState.opens), []);
  assert.equal(await worker.evaluate(async () => (await chrome.tabs.query({ active: true, currentWindow: true }))[0].id), workId);
  console.log('Live: IN reached an independent local application; its separate HTTP request returned a reply through OUT. No browser login credential was used for the send.');
  stage = 'disconnect';
  await bridge.evaluate(() => chrome.runtime.sendMessage({ type: 'bridge-disconnect', confirm: true }));
  assert.deepEqual(await worker.evaluate(() => chrome.storage.local.get(['bridgeAuth', 'bridgeBinding', 'bridgeInbox', 'bridgeCommandJournal'])), {});
  console.log('OK: real RELAYERS device approval, API, signed HTTP IN/OUT, queue/worker, bound WebSocket and duplicate suppression. WhatsApp was a fixture; document, conversation, draft and focus were preserved.');
} catch (error) {
  // Keep credentials, device codes, tokens and payloads out of logs.
  console.error(`Live Bridge test failed at: ${stage} (${error.name}).`);
  if (stage === 'approval page navigation') console.error(error.message.split('\n')[0].replace(/https?:\/\/[^\s"']+/g, '[verification page]'));
  if (error.httpStatus) console.error(JSON.stringify({ httpStatus: error.httpStatus, apiCode: error.apiCode }));
  if (approval) console.error(JSON.stringify({ approvalPath: new URL(approval.url()).pathname, approvalQueryKeys: [...new URL(approval.url()).searchParams.keys()], loginStatus, approvalStatus }));
  if (bridge && worker) {
    const safe = await bridge.evaluate(() => chrome.runtime.sendMessage({ type: 'bridge-status' })).catch(() => null);
    if (safe) console.error(JSON.stringify({ state: safe.state, lastError: safe.lastError, lastResult: safe.lastResult }));
  }
  process.exitCode = 1;
} finally {
  clearInterval(appHeartbeat); appSocket?.terminate();
  if (appServer) await new Promise(resolve => appServer.close(resolve));
  if (!config && worker) config = await worker.evaluate(async () => (await chrome.storage.local.get('bridgeBinding')).bridgeBinding).catch(() => null);
  if (bridge) await bridge.evaluate(() => chrome.runtime.sendMessage({ type: 'bridge-disconnect', confirm: true })).catch(() => {});
  if (access && config) {
    // Delete only the resources just created in the dedicated QA account.
    let cleanupFailures = 0;
    for (const endpoint of [config.inEndpoint, config.outEndpoint]) {
      if (endpoint) await request(`/v1/endpoints/${endpoint.id}/`, { method: 'DELETE' }).catch(() => { cleanupFailures++; });
    }
    if (config.daemonId) await request(`/v1/daemons/${config.daemonId}/`, { method: 'DELETE' }).catch(() => { cleanupFailures++; });
    if (appDaemon) await request(`/v1/daemons/${appDaemon}/`, { method: 'DELETE' }).catch(() => { cleanupFailures++; });
    if (cleanupFailures) { console.error(`QA resource cleanup failed for ${cleanupFailures} resources.`); process.exitCode = 1; }
  }
  if (context) await context.close();
  await rm(profile, { recursive: true, force: true });
}
