// Real Chromium APIs + actual loopback HTTP/WebSocket transport.
// WhatsApp, RELAYERS account and permission grants are isolated test fixtures.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { WebSocketServer } from 'ws';
import { mkdtemp, readFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { chromium } from 'playwright';
import { dismissChromiumWelcome } from './installation.mjs';

const endpoints = [], rules = [], ingested = [], replies = [], sockets = [];
const daemonId = randomUUID(), appDaemonId = randomUUID();
let failFirstIngest = true;
let forwardCommand, holdToken = false, releaseToken, failRuleUpdate = false, loseIncomingRuleResponse = true;
const server = createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Relayers-Signature, X-Idempotency-Key');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  if (request.method === 'OPTIONS') { response.writeHead(204).end(); return; }
  let raw = ''; for await (const part of request) raw += part;
  const body = raw ? JSON.parse(raw) : null, path = new URL(request.url, 'http://test').pathname;
  const send = (data, status = 200) => { response.writeHead(status, { 'Content-Type': 'application/json' }); response.end(JSON.stringify({ data })); };
  if (path === '/v1/auth/device/code') { send({ device_code: 'fixture-device', user_code: 'TEST-CODE', verification_uri: `http://127.0.0.1:${server.address().port}/approve`, expires_in: 600, interval: 5 }); return; }
  if (path === '/v1/auth/device/token') { assert.equal(body.device_code, 'fixture-device'); const reply = () => send({ access_token: 'fictional-test-access', refresh_token: 'fictional-test-refresh' }); if (holdToken) releaseToken = reply; else reply(); return; }
  if (path === '/v1/daemons/') { send([{ id: appDaemonId, hostname: 'Application fixture' }, { id: daemonId, hostname: 'Browser fixture' }]); return; }
  if (path.startsWith('/v1/endpoints')) {
    assert.equal(request.headers.authorization, 'Bearer fictional-test-access');
    if (path.includes('/rules/')) {
      const endpoint = path.split('/')[3], ruleId = path.split('/')[5];
      if (request.method === 'PATCH') {
        if (failRuleUpdate) { response.writeHead(503, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: { code: 'fixture-save-error' } })); return; }
        const rule = rules.find(item => item.id === ruleId && item.endpoint === endpoint); assert.ok(rule); Object.assign(rule, body); send(rule);
      } else if (request.method === 'DELETE') {
        const index = rules.findIndex(item => item.id === ruleId && item.endpoint === endpoint); assert.ok(index >= 0); rules.splice(index, 1); send({});
      } else if (request.method === 'POST') {
        const rule = { id: randomUUID(), endpoint, ...body }; rules.push(rule);
        if (body.name.startsWith('WhatsApp Bridge IN app') && loseIncomingRuleResponse) {
          loseIncomingRuleResponse = false; response.writeHead(503, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: { code: 'fixture-save-error' } })); return;
        }
        send(rule, 201);
      }
      else send(rules.filter(item => item.endpoint === endpoint));
    } else if (request.method === 'POST') {
      const endpoint = { id: randomUUID(), public_id: `ep-${randomUUID()}`, ...body }; endpoints.push(endpoint); send(endpoint, 201);
    } else { const query = new URL(request.url, 'http://test').searchParams.get('search'); send(endpoints.filter(item => item.slug === query)); }
    return;
  }
  if (path.startsWith('/v1/webhooks/')) {
    const endpoint = endpoints.find(item => path.endsWith(item.public_id)); assert.ok(endpoint);
    assert.equal(request.headers['x-relayers-signature'], createHmac('sha256', endpoint.signing_secret).update(raw).digest('hex'));
    if (endpoint.slug.startsWith('whatsapp-out-')) { forwardCommand(body); send({ status: 'received', event_id: randomUUID() }); return; }
    ingested.push({ id: request.headers['x-idempotency-key'], body });
    if (failFirstIngest) { failFirstIngest = false; send({}, 503); } else send({ status: 'received', event_id: randomUUID() });
    return;
  }
  response.writeHead(404).end();
});
server.listen(0, '127.0.0.1'); await once(server, 'listening');
const address = `http://127.0.0.1:${server.address().port}`;
const wss = new WebSocketServer({ server, path: '/v1/tunnel/connect' });
wss.on('connection', socket => {
  const key = randomBytes(32); const entry = { socket, key }; sockets.push(entry);
  socket.on('message', raw => {
    const frame = JSON.parse(raw);
    if (frame.type === 'auth') {
      assert.equal(frame.token, 'fictional-test-access'); socket.send(JSON.stringify({ type: 'auth_ok', daemon_id: daemonId, session_key: key.toString('base64') })); return;
    }
    assert.equal(frame.sig, createHmac('sha256', key).update(`${frame.type}${frame.nonce}${frame.ts}`).digest('hex'));
    if (frame.type === 'deliver_resp') replies.push(JSON.parse(frame.body));
    if (frame.type === 'subscribe') entry.subscriptions = frame.endpoint_ids;
  });
});
const profile = await mkdtemp(join(tmpdir(), 'relayers-bridge-browser-'));
const extension = resolve('dist/chrome');
const context = await chromium.launchPersistentContext(profile, { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`] });
const eventually = async (check, message) => {
  const end = Date.now() + 20000;
  while (Date.now() < end) { if (await check()) return; await new Promise(resolve => setTimeout(resolve, 100)); }
  throw new Error(message);
};
try {
  const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
  await dismissChromiumWelcome(context);
  const url = new URL(worker.url()), origin = `${url.protocol}//${url.host}`;
  // Native permission prompts are not automated here. This fixture represents
  // explicit grants, then tests actual revocation enforcement below.
  await worker.evaluate(() => { chrome.permissions.contains = async () => true; });
  const fixture = await readFile(new URL('./fixtures/whatsapp.html', import.meta.url), 'utf8');
  await context.route('https://web.whatsapp.com/**', route => route.fulfill({ contentType: 'text/html', body: fixture }));
  await context.route('https://work.test/**', route => route.fulfill({ contentType: 'text/html', body: '<title>Work</title><textarea>Keep my work</textarea>' }));
  const work = await context.newPage(); await work.goto('https://work.test/');
  const whatsapp = await context.newPage(); await whatsapp.goto('https://web.whatsapp.com/');
  const originalDocument = await whatsapp.evaluateHandle(() => document);
  const token = await whatsapp.evaluate(() => documentToken), originalDraft = await whatsapp.locator('#compose').inputValue();
  await work.bringToFront();
  const workId = await worker.evaluate(async () => (await chrome.tabs.query({ active: true, currentWindow: true }))[0].id);
  let navigations = 0; whatsapp.on('framenavigated', frame => { if (frame === whatsapp.mainFrame()) navigations++; });
  const bridge = await context.newPage(); await bridge.goto(`${origin}/bridge.html`);
  await bridge.waitForFunction(() => document.documentElement.dataset.ready === 'true');
  await bridge.evaluate(() => { chrome.permissions.request = async () => true; });
  await bridge.locator('#login summary').click();
  await bridge.locator('#server').fill(address);
  await bridge.locator('#connect').click();
  await eventually(async () => (await bridge.locator('#user-code').textContent()) === 'TEST-CODE', 'Pairing code not shown');
  await bridge.locator('#setup').waitFor({ state: 'visible', timeout: 15000 });
  await eventually(async () => await bridge.locator('#chats input').count() === 2, 'Loaded scope missing');
  assert.equal(await bridge.locator('#incoming').isChecked(), false);
  assert.equal(await bridge.locator('#outgoing').isChecked(), false);
  assert.equal(endpoints.length, 0, 'Login alone must not create relay resources');
  await bridge.locator('#chats input[value="12025550140@c.us"]').check();
  await bridge.locator('#incoming').check(); await bridge.locator('#outgoing').check();
  assert.equal(await bridge.locator('#start').isDisabled(), true, 'Consent must be explicit');
  await bridge.locator('#consent').check(); await bridge.locator('#start').click();
  await eventually(() => sockets[0]?.subscriptions?.length === 1 && rules.length === 1, 'Signed tunnel and bound route not ready');
  assert.equal(rules[0].daemon_id, daemonId);
  assert.equal(endpoints.length, 2);
  assert.equal(ingested.length, 0, 'Creating a connection must not export an old preview');
  const config = await worker.evaluate(async () => (await chrome.storage.local.get('bridgeBinding')).bridgeBinding);
  const outEndpoint = endpoints.find(item => item.id === config.outEndpoint.id);
  const command = { schema: 'relayers.whatsapp.v1', type: 'message.send', commandId: randomUUID(), connectionId: config.connectionId,
    accountId: config.accountId, chatId: config.chatIds[0], text: 'Sent by the isolated RELAYERS fixture.', expiresAt: new Date(Date.now() + 3600000).toISOString() };
  const deliver = async value => {
    const entry = sockets.at(-1), nonce = randomBytes(16).toString('hex'), ts = Math.floor(Date.now() / 1000);
    entry.socket.send(JSON.stringify({ type: 'deliver', delivery_id: randomUUID(), event_id: randomUUID(), endpoint_id: outEndpoint.id, method: 'POST',
      url: 'https://whatsapp.bridge.invalid/send', body: Buffer.from(JSON.stringify(value)).toString('base64'), nonce, ts,
      sig: createHmac('sha256', entry.key).update(`deliver${nonce}${ts}`).digest('hex') }));
  };
  forwardCommand = deliver;
  assert.notEqual(config.signingSecrets.in, config.signingSecrets.out);
  const publicStatus = await bridge.evaluate(() => chrome.runtime.sendMessage({ type: 'bridge-status' }));
  assert.equal(JSON.stringify(publicStatus).includes(config.signingSecrets.out), false);
  const outSecret = await bridge.evaluate(() => chrome.runtime.sendMessage({ type: 'bridge-out-secret', confirm: true }));
  assert.equal(outSecret.secret, outEndpoint.signing_secret);
  await work.bringToFront();
  const commandBody = JSON.stringify(command);
  const submitted = await fetch(`${address}/v1/webhooks/${outEndpoint.public_id}`, { method: 'POST', body: commandBody, headers: { 'Content-Type': 'application/json', 'X-Relayers-Signature': createHmac('sha256', outSecret.secret).update(commandBody).digest('hex') } });
  assert.equal(submitted.ok, true);
  await eventually(() => replies.some(item => item.commandId === command.commandId && item.status === 'accepted'), 'OUT was not accepted');
  await deliver(command);
  await eventually(() => replies.filter(item => item.commandId === command.commandId).length === 2, 'Duplicate result not returned');
  assert.deepEqual(await whatsapp.evaluate(() => appState.messages), [{ to: command.chatId, text: command.text }]);
  assert.equal(await whatsapp.evaluate(original => document === original, originalDocument), true);
  assert.equal(await whatsapp.evaluate(() => documentToken), token);
  assert.equal(await whatsapp.locator('#compose').inputValue(), originalDraft);
  assert.equal(navigations, 0);
  assert.equal(await worker.evaluate(async () => (await chrome.tabs.query({ active: true, currentWindow: true }))[0].id), workId);
  await deliver({ ...command, commandId: randomUUID(), chatId: '12025550141@c.us' });
  await eventually(() => replies.some(item => item.code === 'wrong-binding'), 'Unselected conversation not rejected');
  assert.equal(await whatsapp.evaluate(() => appState.messages.length), 1);
  // Configure a receiving destination from the real UI. A failed update must
  // keep the old filters and route and prevent Resume until a successful save.
  await bridge.locator('#edit-settings').click();
  await bridge.locator('#whatsapp-settings').waitFor({ state: 'visible' });
  await bridge.locator('#in-words').fill('order');
  await bridge.locator('#out-words').fill('approved');
  await bridge.locator('#filter-in summary').click();
  await bridge.locator('#in-sample').fill('My ORDER is ready'); await bridge.locator('#in-test-filter').click();
  assert.match(await bridge.locator('#in-filter-result').textContent(), /passes/);
  await bridge.locator('#in-sample').fill('Unrelated greeting'); await bridge.locator('#in-test-filter').click();
  assert.match(await bridge.locator('#in-filter-result').textContent(), /blocked/);
  assert.equal(await whatsapp.evaluate(() => appState.messages.length), 1, 'Testing filters must not send a WhatsApp message');
  assert.equal(ingested.length, 0, 'Testing filters must not upload an example');
  await bridge.locator('#destination-kind').selectOption('remote');
  await bridge.locator('#destination-url').fill('https://application.test/messages');
  await bridge.locator('#settings-consent').check(); await bridge.locator('#save-settings').click();
  const getStatus = () => bridge.evaluate(() => chrome.runtime.sendMessage({ type: 'bridge-status' }));
  await eventually(async () => (await getStatus()).lastError === 'fixture-save-error', 'Lost create response not surfaced');
  assert.equal((await getStatus()).binding.settingsPending, true);
  await bridge.locator('#save-settings').click();
  await eventually(async () => (await getStatus()).binding.applicationRoute && !(await getStatus()).binding.settingsPending, 'Receiving configuration not created');
  assert.equal((await getStatus()).state, 'paused');
  const applicationRule = rules.find(rule => rule.destination_url === 'https://application.test/messages');
  assert.ok(applicationRule); assert.equal(applicationRule.destination_type, 'public');
  assert.equal(rules.filter(rule => rule.name.startsWith('WhatsApp Bridge IN app')).length, 1, 'A lost create response must not duplicate the receiving route');
  assert.equal(rules.filter(rule => rule.daemon_id === daemonId).length, 1, 'OUT keeps its original browser-bound route');
  await bridge.locator('#in-words').fill('changed'); failRuleUpdate = true;
  await bridge.locator('#settings-consent').check(); await bridge.locator('#save-settings').click();
  await eventually(async () => (await getStatus()).lastError === 'fixture-save-error', 'Simulated save failure not surfaced');
  assert.equal((await getStatus()).binding.settings.incomingFilter.conditions[0].value, 'order');
  assert.equal((await getStatus()).binding.settingsPending, true);
  assert.equal(await bridge.locator('#resume').isDisabled(), true);
  assert.equal(applicationRule.destination_url, 'https://application.test/messages');
  failRuleUpdate = false; await bridge.locator('#save-settings').click();
  await eventually(async () => !(await getStatus()).binding.settingsPending && (await getStatus()).binding.settings.incomingFilter.conditions[0].value === 'changed', 'Configuration did not recover');
  assert.equal(rules.filter(rule => rule.id === applicationRule.id).length, 1, 'Retry updates the same managed rule');
  const unrelated = { id: randomUUID(), endpoint: applicationRule.endpoint, name: 'User-created separate receiving route', destination_url: 'https://other-application.test/messages', destination_type: 'public' };
  rules.push(unrelated);
  await bridge.locator('#destination-kind').selectOption('none');
  await bridge.locator('#settings-consent').check(); await bridge.locator('#save-settings').click();
  await eventually(async () => !(await getStatus()).binding.applicationRoute, 'Application forwarding was not removed');
  assert.equal(rules.length, 2, 'Removing application forwarding leaves OUT and unrelated routes intact');
  assert.equal(rules.find(rule => rule.id === unrelated.id), unrelated);
  // Restore permissive filters for the existing same-account rebind checks.
  await bridge.locator('#in-words').fill(''); await bridge.locator('#out-words').fill('');
  await bridge.locator('#settings-consent').check(); await bridge.locator('#save-settings').click();
  await eventually(async () => !(await getStatus()).binding.settingsPending && !(await getStatus()).binding.settings.outgoingFilter.conditions.length, 'Default filters not restored');
  await bridge.locator('#resume').click();
  await eventually(async () => (await getStatus()).state === 'connected', 'Configured connection did not resume');
  assert.equal(await whatsapp.evaluate(original => document === original, originalDocument), true);
  assert.equal(await whatsapp.evaluate(() => documentToken), token);
  assert.equal(await whatsapp.locator('#compose').inputValue(), originalDraft);
  assert.equal(whatsapp.url(), 'https://web.whatsapp.com/');
  assert.equal(navigations, 0, 'Editing webhook configuration must preserve the loaded WhatsApp document');
  await whatsapp.evaluate(() => {
    const store = require('WAWebChatCollection').ChatCollection;
    const chat = store.getModelsArray()[0];
    chat.msgs.getModelsArray = () => [
      { id: { _serialized: 'fixture-incoming-id', fromMe: false }, type: 'chat', body: 'Newly observed incoming text.', t: Math.floor(Date.now() / 1000) + 1 },
      { id: { _serialized: 'fixture-outgoing-id', fromMe: true }, type: 'chat', body: 'Do not echo this.', t: Math.floor(Date.now() / 1000) + 1 }
    ];
  });
  await eventually(() => ingested.length >= 2, 'IN did not retry after temporary failure');
  assert.equal(ingested[0].id, ingested[1].id, 'IN retry must retain the event identity');
  assert.equal(ingested[0].body.messageId, 'fixture-incoming-id');
  assert.equal(ingested[0].body.text, 'Newly observed incoming text.');
  assert.equal(ingested.some(item => item.body.text === 'Do not echo this.'), false);
  await eventually(async () => (await bridge.evaluate(() => chrome.runtime.sendMessage({ type: 'bridge-status' }))).pending === 0, 'Acknowledged IN not removed');
  // A reopened tab must be selected explicitly and must use the same account.
  const reopened = await context.newPage(); await reopened.goto('https://web.whatsapp.com/');
  const reopenedId = await worker.evaluate(async () => (await chrome.tabs.query({ active: true, currentWindow: true }))[0].id);
  await reopened.evaluate(() => { window.fixtureAccount = '12025559999@c.us'; });
  const wrongAccount = await bridge.evaluate(tabId => chrome.runtime.sendMessage({ type: 'bridge-rebind', tabId }), reopenedId);
  assert.equal(wrongAccount.ok, false); assert.equal(wrongAccount.code, 'wrong-account');
  await reopened.evaluate(() => { window.fixtureAccount = '12025550000@c.us'; });
  const rebinding = await bridge.evaluate(tabId => chrome.runtime.sendMessage({ type: 'bridge-rebind', tabId }), reopenedId);
  assert.equal(rebinding.ok, true);
  await eventually(() => sockets.at(-1)?.subscriptions?.length === 1, 'Rebinding did not reconnect the selected same account');
  const nextCommand = { ...command, commandId: randomUUID(), text: 'Bound to the explicitly reopened same account.' };
  await work.bringToFront(); await deliver(nextCommand);
  await eventually(() => replies.some(item => item.commandId === nextCommand.commandId && item.status === 'accepted'), 'Rebound account did not accept OUT');
  assert.equal(await reopened.evaluate(() => appState.messages.length), 1);
  assert.equal(await whatsapp.evaluate(() => appState.messages.length), 1);
  await bridge.evaluate(() => chrome.runtime.sendMessage({ type: 'bridge-pause' }));
  assert.equal((await bridge.evaluate(() => chrome.runtime.sendMessage({ type: 'bridge-status' }))).state, 'paused');
  await bridge.evaluate(() => chrome.runtime.sendMessage({ type: 'bridge-resume' }));
  await eventually(() => sockets.at(-1)?.subscriptions?.length === 1, 'Resume did not reconnect');
  await worker.evaluate(() => { chrome.permissions.contains = async () => false; });
  await eventually(async () => (await bridge.evaluate(() => chrome.runtime.sendMessage({ type: 'bridge-status' }))).state === 'paused', 'Revoked permission must stop relay');
  const untrusted = await context.newPage(); await untrusted.goto(`${origin}/handoff.html`);
  const refused = await untrusted.evaluate(() => chrome.runtime.sendMessage({ type: 'bridge-status' }));
  assert.equal(refused.code, 'unauthorized-source');
  await bridge.evaluate(() => chrome.runtime.sendMessage({ type: 'bridge-disconnect', confirm: true }));
  const cleared = await worker.evaluate(() => chrome.storage.local.get(['bridgeAuth', 'bridgeBinding', 'bridgeInbox', 'bridgeCommandJournal']));
  assert.deepEqual(cleared, {});
  // A late authentication response must not restore credentials after Disconnect.
  await worker.evaluate(() => { chrome.permissions.contains = async () => true; });
  await bridge.evaluate(server => chrome.runtime.sendMessage({ type: 'bridge-begin-auth', server }), address);
  holdToken = true;
  const lateAuth = bridge.evaluate(() => chrome.runtime.sendMessage({ type: 'bridge-poll-auth' }));
  await eventually(() => Boolean(releaseToken), 'Delayed authentication fixture did not receive a poll');
  await bridge.evaluate(() => chrome.runtime.sendMessage({ type: 'bridge-disconnect', confirm: true }));
  releaseToken();
  assert.equal((await lateAuth).ok, false);
  assert.deepEqual(await worker.evaluate(() => chrome.storage.local.get(['bridgeAuth', 'bridgeBinding'])), {});
  await bridge.reload(); await bridge.waitForFunction(() => document.documentElement.dataset.ready === 'true');
  await mkdir('artifacts', { recursive: true });
  await bridge.screenshot({ path: 'artifacts/bridge-disconnected.png', fullPage: true });
  console.log('OK Bridge: actual loopback HTTP/WS, pairing, explicit scope/consent, bound OUT, no duplicate or focus/reload, signed IN/retry/no echo, pause/resume, revoked permission and local disconnect. Services/data/grants were simulated.');
} finally {
  await context.close(); await rm(profile, { recursive: true, force: true });
  for (const entry of sockets) entry.socket.terminate();
  await new Promise(resolve => wss.close(resolve));
  await new Promise(resolve => server.close(resolve));
}
