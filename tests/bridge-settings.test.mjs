import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createBridgeController } from '../extension/bridge/controller.js';
import { normalizeSettings } from '../extension/bridge/filters.js';

test('saving stays paused, blocks concurrent resume and cannot restore credentials after Disconnect', async () => {
  const ruleId = randomUUID(), endpointId = randomUUID();
  const data = {
    bridgeAuth: { server: 'https://api.example.test', access_token: 'fictional-access' },
    bridgeBinding: { connectionId: randomUUID(), accountId: '12025550000@c.us', chatIds: ['12025550140@c.us'], tabId: 1,
      enabled: false, inbound: true, outbound: true, inEndpoint: { id: endpointId, publicId: 'fixture-in' }, outEndpoint: { id: randomUUID(), publicId: 'fixture-out' }, inRuleId: ruleId,
      settings: normalizeSettings({ destination: { kind: 'remote', url: 'https://old.example.test/messages' } }) }
  };
  const storage = { async get(keys) { return Object.fromEntries((Array.isArray(keys) ? keys : [keys]).map(key => [key, structuredClone(data[key])])); },
    async set(value) { Object.assign(data, structuredClone(value)); }, async remove(keys) { for (const key of Array.isArray(keys) ? keys : [keys]) delete data[key]; } };
  const api = { runtime: {}, storage: { local: storage, session: { ...storage } }, permissions: { async contains() { return true; }, async remove() {} }, alarms: { async create() {} } };
  let release, requestStarted;
  const started = new Promise(resolve => { requestStarted = resolve; });
  const controller = createBridgeController(api, { fetcher: async (url, options) => {
    if (options.method === 'GET') return new Response(JSON.stringify({ data: [{ id: ruleId }] }), { status: 200 });
    assert.equal(url, `https://api.example.test/v1/endpoints/${endpointId}/rules/${ruleId}`);
    assert.equal(options.method, 'PATCH');
    requestStarted();
    await new Promise(resolve => { release = resolve; });
    return new Response(JSON.stringify({ data: { id: ruleId } }), { status: 200 });
  } });
  await controller.initialize();
  const saving = controller.handle({ type: 'bridge-configure', consent: true,
    settings: normalizeSettings({ destination: { kind: 'remote', url: 'https://new.example.test/messages' } }) });
  const outcome = saving.then(() => 'saved', error => error.message);
  await started;
  assert.equal(data.bridgeBinding.enabled, false);
  assert.equal(data.bridgeBinding.settingsPending, true);
  await assert.rejects(controller.handle({ type: 'bridge-resume' }), /configuration-pending/);
  await controller.handle({ type: 'bridge-disconnect', confirm: true });
  release();
  assert.equal(await outcome, 'disconnected');
  assert.equal(data.bridgeAuth, undefined); assert.equal(data.bridgeBinding, undefined);
});
test('an account with a null empty rule list can save receiving in RELAYERS without an application route', async () => {
  const data = { bridgeAuth: { server: 'https://api.example.test', access_token: 'fictional-access' },
    bridgeBinding: { connectionId: randomUUID(), accountId: '12025550000@c.us', chatIds: ['12025550140@c.us'], tabId: 1,
      enabled: false, inbound: true, outbound: true, inEndpoint: { id: randomUUID(), publicId: 'fixture-in' }, outEndpoint: { id: randomUUID(), publicId: 'fixture-out' } } };
  const storage = { async get(keys) { return Object.fromEntries((Array.isArray(keys) ? keys : [keys]).map(key => [key, structuredClone(data[key])])); }, async set(value) { Object.assign(data, structuredClone(value)); } };
  const api = { runtime: {}, storage: { local: storage, session: storage }, permissions: { async contains() { return true; } }, alarms: { async create() {} } };
  let writes = 0;
  let responseBody = { data: null };
  const controller = createBridgeController(api, { fetcher: async (_, options) => {
    if (options.method !== 'GET') writes++;
    return new Response(JSON.stringify(responseBody), { status: 200 });
  } });
  await controller.initialize();
  assert.deepEqual(await controller.handle({ type: 'bridge-configure', consent: true, settings: normalizeSettings() }), { ok: true, paused: true });
  assert.equal(data.bridgeBinding.settingsPending, false);
  assert.equal(data.bridgeBinding.enabled, false);
  assert.equal(writes, 0, 'Choosing no application must not create a route');
  responseBody = {};
  await assert.rejects(controller.handle({ type: 'bridge-configure', consent: true, settings: normalizeSettings() }), /invalid-rule/);
  assert.equal(data.bridgeBinding.settingsPending, true, 'A malformed response must leave the connection paused');
});
