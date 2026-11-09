import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { normalizeFilter, matchesFilter, normalizeSettings, normalizeDestination } from '../extension/bridge/filters.js';
import { createInbox } from '../extension/bridge/inbox.js';
import { createCommandJournal } from '../extension/bridge/journal.js';

test('basic words match case and accents; advanced conditions combine text, type and authorized conversation', () => {
  const basic = { mode: 'basic', match: 'any', conditions: [{ field: 'text', operator: 'contains', value: 'orcamento' }] };
  assert.equal(matchesFilter(basic, { text: 'Quero um ORÇAMENTO hoje' }), true);
  assert.equal(matchesFilter(basic, { text: 'Obrigado' }), false);
  const advanced = { mode: 'advanced', match: 'all', conditions: [
    { field: 'text', operator: 'startsWith', value: 'pedido' },
    { field: 'text', operator: 'notContains', value: 'cancelado' },
    { field: 'type', operator: 'equals', value: 'chat' },
    { field: 'chatId', operator: 'equals', value: '12025550140@c.us' }
  ] };
  const message = { text: 'Pedido pronto', type: 'chat', chatId: '12025550140@c.us' };
  assert.equal(matchesFilter(advanced, message), true);
  assert.equal(matchesFilter(advanced, { ...message, text: 'Pedido cancelado' }), false);
  assert.equal(matchesFilter(advanced, { ...message, type: 'image' }), false);
  assert.equal(matchesFilter(advanced, { ...message, chatId: '12025550141@c.us' }), false);
  assert.equal(matchesFilter(undefined, message), true);
});
test('filters reject executable expressions, unknown fields and oversized rules; destinations keep local and remote separate', () => {
  for (const condition of [
    { field: 'text', operator: 'eval', value: 'alert(1)' },
    { field: 'secret', operator: 'equals', value: 'x' },
    { field: 'text', operator: 'contains', value: 'x'.repeat(201) }
  ]) assert.throws(() => normalizeFilter({ mode: 'advanced', match: 'all', conditions: [condition] }));
  assert.throws(() => normalizeFilter({ mode: 'basic', match: 'any', conditions: Array(11).fill({ field: 'text', operator: 'contains', value: 'a' }) }));
  for (const url of ['http://example.com/hook', 'https://name:password@example.com/', 'https://localhost/hook', 'javascript:alert(1)']) assert.throws(() => normalizeDestination({ kind: 'remote', url }));
  assert.equal(normalizeDestination({ kind: 'remote', url: 'https://example.com/messages' }).url, 'https://example.com/messages');
  assert.equal(normalizeDestination({ kind: 'local', url: 'http://127.0.0.1:3000/messages', daemonId: randomUUID() }).kind, 'local');
  assert.throws(() => normalizeDestination({ kind: 'local', url: 'http://example.com/', daemonId: randomUUID() }));
  assert.equal(normalizeSettings().destination.kind, 'none');
});
test('filtered incoming content never enters the queue and changing filters does not export excluded history', async () => {
  const data = {}; const storage = { async get(key) { return structuredClone({ [key]: data[key] }); }, async set(value) { Object.assign(data, structuredClone(value)); } };
  const inbox = createInbox(storage);
  const binding = { connectionId: randomUUID(), accountId: '12025550000@c.us', chatIds: ['12025550140@c.us'], startedAt: Date.now() - 1000,
    settings: { incomingFilter: { mode: 'basic', match: 'any', conditions: [{ field: 'text', operator: 'contains', value: 'pedido' }] } } };
  await inbox.baseline(binding.connectionId, []);
  const message = { id: 'excluded', text: 'Private unrelated text', type: 'chat', chatId: binding.chatIds[0], timestamp: Date.now() };
  assert.equal((await inbox.capture(binding, [message])).added, 0);
  assert.ok(!JSON.stringify(data).includes(message.text));
  binding.settings = normalizeSettings();
  assert.equal((await inbox.capture(binding, [message])).added, 0);
  assert.equal((await inbox.capture(binding, [{ ...message, id: 'new', text: 'Newly allowed message' }])).added, 1);
  assert.equal((await inbox.peek()).body.text, 'Newly allowed message');
});
test('an OUT blocked before dispatch is a definitive rejection; its retry cannot become a send after filters change', async () => {
  const data = {}; const storage = { async get(key) { return structuredClone({ [key]: data[key] }); }, async set(value) { Object.assign(data, structuredClone(value)); } };
  const binding = { connectionId: randomUUID(), accountId: '12025550000@c.us', chatIds: ['12025550140@c.us'], enabled: true, outbound: true };
  const command = { schema: 'relayers.whatsapp.v1', type: 'message.send', commandId: randomUUID(), connectionId: binding.connectionId,
    accountId: binding.accountId, chatId: binding.chatIds[0], text: 'Not allowed by the filter', expiresAt: new Date(Date.now() + 300000).toISOString() };
  const journal = createCommandJournal(storage);
  assert.deepEqual(await journal.execute(command, binding, async () => ({ ok: false, code: 'filtered-out' })), { status: 'rejected', code: 'filtered-out' });
  let sends = 0;
  assert.deepEqual(await createCommandJournal(storage).execute(command, binding, async () => { sends++; return { ok: true, status: 'accepted' }; }), { status: 'rejected', code: 'filtered-out' });
  assert.equal(sends, 0);
});
test('a full queue still records exclusions, so relaxing filters cannot later upload their old content', async () => {
  const data = {}; const storage = { async get(key) { return structuredClone({ [key]: data[key] }); }, async set(value) { Object.assign(data, structuredClone(value)); } };
  const inbox = createInbox(storage, { limit: 1 });
  const binding = { connectionId: randomUUID(), accountId: '12025550000@c.us', chatIds: ['12025550140@c.us'], startedAt: Date.now() - 1000,
    settings: normalizeSettings({ incomingFilter: { mode: 'basic', match: 'any', conditions: [{ field: 'text', operator: 'contains', value: 'order' }] } }) };
  await inbox.baseline(binding.connectionId, []);
  const message = { id: 'allowed', text: 'Order ready', type: 'chat', chatId: binding.chatIds[0], timestamp: Date.now() };
  await inbox.capture(binding, [message]);
  const excluded = { ...message, id: 'excluded-while-full', text: 'Unrelated private content' };
  await inbox.capture(binding, [{ ...message, id: 'waiting-while-full' }, excluded]);
  await inbox.acknowledge((await inbox.peek()).id);
  binding.settings = normalizeSettings();
  assert.equal((await inbox.capture(binding, [excluded])).added, 0);
  assert.ok(!JSON.stringify(data).includes(excluded.text));
});
