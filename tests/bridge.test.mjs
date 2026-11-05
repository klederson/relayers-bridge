import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, randomUUID } from 'node:crypto';
import { SCHEMA, validateCommand, apiBase, permissionOrigin } from '../extension/bridge/contracts.js';
import { createCommandJournal } from '../extension/bridge/journal.js';
import { createInbox } from '../extension/bridge/inbox.js';
import { hmac, signFrame, createFrameVerifier } from '../extension/bridge/wire.js';
import { bridgeCatalogs } from '../extension/bridge/ui-i18n.js';

const memory = () => {
  const data = {};
  return { data, async get(key) { return structuredClone({ [key]: data[key] }); }, async set(value) { Object.assign(data, structuredClone(value)); } };
};
const scope = () => ({ connectionId: randomUUID(), accountId: '12025550000@c.us', chatIds: ['12025550140@c.us'], enabled: true, inbound: true, outbound: true, startedAt: Date.now() - 1000 });
const commandFor = binding => ({ schema: SCHEMA, type: 'message.send', commandId: randomUUID(), connectionId: binding.connectionId, accountId: binding.accountId, chatId: binding.chatIds[0], text: 'Test reply', expiresAt: new Date(Date.now() + 3600000).toISOString() });

test('commands are scoped, explicitly enabled and expiring; unsafe server URLs are rejected', () => {
  const binding = scope(), command = commandFor(binding);
  assert.equal(validateCommand(command, binding), null);
  assert.equal(validateCommand({ ...command, accountId: '12025550001@c.us' }, binding), 'wrong-binding');
  assert.equal(validateCommand({ ...command, chatId: '12025550141@c.us' }, binding), 'wrong-binding');
  assert.equal(validateCommand(command, { ...binding, outbound: false }), 'outbound-disabled');
  assert.equal(validateCommand({ ...command, expiresAt: new Date(0).toISOString() }, binding), 'expired-command');
  assert.equal(validateCommand({ ...command, expiresAt: new Date(Date.now() + 86400001 * 2).toISOString() }, binding), 'expired-command');
  for (const url of ['http://example.com', 'https://user:secret@example.com', 'https://example.com/path', 'javascript:alert(1)']) assert.throws(() => apiBase(url));
  assert.equal(apiBase('http://127.0.0.1:8765'), 'http://127.0.0.1:8765');
  assert.equal(permissionOrigin('http://127.0.0.1:8765'), 'http://127.0.0.1/*');
});
test('same command survives transport retries and controller restart without a second send', async () => {
  const storage = memory(), binding = scope(), command = commandFor(binding); let sends = 0;
  const dispatch = async () => { sends++; return { ok: true, status: 'accepted' }; };
  const first = createCommandJournal(storage);
  const results = await Promise.all([first.execute(command, binding, dispatch), first.execute(command, binding, dispatch)]);
  assert.deepEqual(results, [{ status: 'accepted' }, { status: 'accepted' }]);
  assert.deepEqual(await createCommandJournal(storage).execute(command, binding, dispatch), { status: 'accepted' });
  assert.equal(sends, 1);
  assert.deepEqual(await first.execute({ ...command, text: 'Different' }, binding, dispatch), { status: 'rejected', code: 'command-conflict' });
  assert.equal(sends, 1);
  assert.equal(JSON.stringify(storage.data).includes('Test reply'), false, 'Journal stores a fingerprint rather than message text');
});
test('a restart after persistent intent and uncertain dispatch never retries automatically', async () => {
  const storage = memory(), binding = scope(), command = commandFor(binding); let sends = 0;
  const first = createCommandJournal(storage);
  await first.execute(command, binding, async () => { sends++; throw new Error('socket lost after send'); });
  assert.equal((await createCommandJournal(storage).execute(command, binding, async () => { sends++; })).status, 'uncertain');
  assert.equal(sends, 1);
  delete storage.data.bridgeCommandJournal[command.commandId].result;
  assert.deepEqual(await createCommandJournal(storage).execute(command, binding, async () => { sends++; }), { status: 'uncertain', code: 'dispatch-interrupted' });
  assert.equal(sends, 1);
});
test('recorded acceptance remains authoritative when the same command is retried after expiry', async () => {
  const storage = memory(), binding = scope(), command = commandFor(binding); let time = Date.now(), sends = 0;
  const journal = createCommandJournal(storage, { now: () => time });
  await journal.execute(command, binding, async () => { sends++; return { ok: true, status: 'accepted' }; });
  time += 7200000;
  assert.deepEqual(await journal.execute(command, binding, async () => { sends++; }), { status: 'accepted' });
  assert.equal(sends, 1);
  assert.deepEqual(await journal.execute({ ...command, commandId: randomUUID() }, binding, async () => { sends++; }), { status: 'rejected', code: 'expired-command' });
});
test('intent persistence failure and a pause while persisting prohibit dispatch', async () => {
  const binding = scope(), command = commandFor(binding); let sends = 0;
  const storage = memory(); storage.set = async () => { throw new Error('storage full'); };
  await assert.rejects(createCommandJournal(storage).execute(command, binding, async () => { sends++; }));
  assert.equal(sends, 0);
  const paused = memory(), save = paused.set;
  paused.set = async value => { await save(value); binding.enabled = false; };
  const result = await createCommandJournal(paused).execute(command, () => binding, async () => { sends++; });
  assert.deepEqual(result, { status: 'rejected', code: 'outbound-disabled' });
  assert.equal(sends, 0);
});
test('incoming baseline does not export history; persisted event identity survives retries', async () => {
  const storage = memory(), binding = scope();
  const before = { id: 'old', chatId: binding.chatIds[0], timestamp: Date.now(), type: 'chat', text: 'Old preview' };
  const after = { ...before, id: 'new', text: 'New message' };
  const inbox = createInbox(storage);
  await inbox.baseline(binding.connectionId, [before]);
  assert.equal((await inbox.capture(binding, [before])).added, 0);
  assert.equal((await inbox.capture(binding, [before, after])).added, 1);
  const pending = await inbox.peek();
  assert.equal(pending.body.type, 'message.received'); assert.equal(pending.body.text, 'New message');
  const restarted = createInbox(storage);
  assert.equal((await restarted.peek()).id, pending.id);
  assert.equal((await restarted.capture(binding, [after])).added, 0);
  await restarted.acknowledge(pending.id);
  assert.equal(await restarted.count(), 0);
  assert.equal((await restarted.capture(binding, [after])).added, 0);
});
test('queue capacity stops capture instead of silently dropping acknowledged events', async () => {
  const storage = memory(), binding = scope(), inbox = createInbox(storage, { limit: 1 });
  await inbox.baseline(binding.connectionId, []);
  const message = { id: 'a', chatId: binding.chatIds[0], timestamp: Date.now(), type: 'chat', text: 'A' };
  await inbox.capture(binding, [message]);
  assert.deepEqual(await inbox.capture(binding, [{ ...message, id: 'b', text: 'B' }]), { added: 0, blocked: true });
  assert.equal((await inbox.peek()).body.text, 'A');
  assert.equal(storage.data.bridgeInbox.seen.b, undefined);
  await inbox.acknowledge((await inbox.peek()).id);
  assert.deepEqual(await inbox.capture(binding, [{ ...message, id: 'b', text: 'B' }]), { added: 1, blocked: false });
});
test('expired incoming payloads are removed on cleanup and reported separately from delivery', async () => {
  const storage = memory(), binding = scope(); let time = Date.now();
  const inbox = createInbox(storage, { now: () => time });
  await inbox.baseline(binding.connectionId, []);
  await inbox.capture(binding, [{ id: 'expires', chatId: binding.chatIds[0], timestamp: time, type: 'chat', text: 'Temporary pending data' }]);
  time += 86400001;
  assert.equal(await inbox.expire(), 1);
  assert.equal(await inbox.count(), 0);
  assert.equal(JSON.stringify(storage.data).includes('Temporary pending data'), false);
});
test('tunnel-v1 HMAC matches the wire contract and refuses unsigned, expired and replayed frames', async () => {
  const secret = new Uint8Array(32).fill(17), time = Date.now();
  assert.equal(await hmac(secret, 'hello'), createHmac('sha256', secret).update('hello').digest('hex'));
  const frame = await signFrame(secret, { type: 'deliver', body: 'opaque-data' }, time);
  const verify = createFrameVerifier(secret, () => time);
  assert.deepEqual(await verify(frame), frame);
  await assert.rejects(verify(frame), /invalid-frame/);
  await assert.rejects(createFrameVerifier(secret, () => time + 120000)(frame), /invalid-frame/);
  await assert.rejects(createFrameVerifier(secret)({ type: 'deliver' }), /invalid-frame/);
  await assert.rejects(createFrameVerifier(new Uint8Array(32).fill(18))(frame), /invalid-frame/);
});
test('all Bridge controls and disclosures are translated in the five interface languages', () => {
  for (const [locale, messages] of Object.entries(bridgeCatalogs)) {
    assert.deepEqual(Object.keys(messages).sort(), Object.keys(bridgeCatalogs.en).sort(), locale);
    assert.ok(Object.values(messages).every(value => typeof value === 'string' && value.length), locale);
  }
});
