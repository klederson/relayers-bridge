import { SCHEMA } from './contracts.js';
const TTL = 24 * 60 * 60 * 1000;
export function createInbox(storage, { now = Date.now, limit = 500, seenLimit = 10000, byteLimit = 2 * 1024 * 1024 } = {}) {
  let chain = Promise.resolve();
  const update = operation => {
    const next = chain.catch(() => {}).then(async () => {
      const state = (await storage.get('bridgeInbox')).bridgeInbox ?? { connectionId: null, seen: {}, pending: [] };
      const revision = state.revision ?? 0;
      const result = await operation(state);
      if ((state.revision ?? 0) !== revision) await storage.set({ bridgeInbox: state });
      return result;
    });
    chain = next;
    return next;
  };
  return {
    baseline(connectionId, messages) { return update(state => {
      if (messages.length > seenLimit) throw new Error('queue-full');
      state.connectionId = connectionId; state.pending = []; state.seen = {};
      for (const message of messages) state.seen[message.id] = now();
      state.revision = (state.revision ?? 0) + 1;
    }); },
    capture(binding, messages) { return update(state => {
      if (state.connectionId !== binding.connectionId) throw new Error('wrong-inbox');
      const cutoff = now() - TTL;
      // Expired pending data is not silently acknowledged or retransmitted.
      if (state.pending.some(item => item.createdAt < cutoff)) throw new Error('queue-expired');
      let changed = false;
      for (const [id, time] of Object.entries(state.seen)) if (time < cutoff) { delete state.seen[id]; changed = true; }
      let added = 0, blocked = false;
      let byteCount = state.pending.reduce((sum, item) => sum + item.size, 0);
      for (const message of messages) {
        if (state.seen[message.id] || message.timestamp < Math.max(binding.startedAt, cutoff) || !binding.chatIds.includes(message.chatId)) continue;
        if (state.pending.length >= limit || Object.keys(state.seen).length >= seenLimit) { blocked = true; break; }
        const id = crypto.randomUUID();
        const body = { schema: SCHEMA, type: 'message.received', eventId: id, connectionId: binding.connectionId,
          accountId: binding.accountId, chatId: message.chatId, messageId: message.id, timestamp: message.timestamp, direction: 'in', origin: 'whatsapp',
          messageType: message.type, text: message.text, truncated: Boolean(message.truncated) };
        const size = new TextEncoder().encode(JSON.stringify(body)).byteLength;
        if (byteCount + size > byteLimit) { blocked = true; break; }
        state.pending.push({ id, createdAt: now(), size, body }); byteCount += size;
        state.seen[message.id] = now(); added++;
      }
      if (changed || added) state.revision = (state.revision ?? 0) + 1;
      return { added, blocked };
    }); },
    peek() { return update(state => state.pending[0] ?? null); },
    acknowledge(id) { return update(state => { if (state.pending[0]?.id === id) { state.pending.shift(); state.revision = (state.revision ?? 0) + 1; } }); },
    count() { return update(state => state.pending.length); },
    expire() { return update(state => {
      const cutoff = now() - TTL, previous = state.pending.length;
      state.pending = state.pending.filter(item => item.createdAt >= cutoff);
      let changed = previous !== state.pending.length;
      for (const [id, time] of Object.entries(state.seen)) if (time < cutoff) { delete state.seen[id]; changed = true; }
      if (changed) state.revision = (state.revision ?? 0) + 1;
      return previous - state.pending.length;
    }); }
  };
}
