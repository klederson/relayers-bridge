import { fingerprint, validateCommand } from './contracts.js';

// Serialize durable read/intent/dispatch/result operations within the controller.
// A worker restart leaves 'running' as uncertain; it must never re-dispatch it.
export function createCommandJournal(storage, { now = Date.now, limit = 4096 } = {}) {
  let chain = Promise.resolve();
  return {
    execute(command, binding, dispatch) {
      const job = chain.catch(() => {}).then(async () => {
        const error = validateCommand(command, binding, now());
        if (error) return { status: 'rejected', code: error };
        const hash = await fingerprint(command);
        const key = 'bridgeCommandJournal';
        const records = (await storage.get(key))[key] ?? {};
        const previous = records[command.commandId];
        if (previous) {
          if (previous.fingerprint !== hash) return { status: 'rejected', code: 'command-conflict' };
          return previous.result ?? { status: 'uncertain', code: 'dispatch-interrupted' };
        }
        for (const [id, record] of Object.entries(records)) if (record.expiresAt <= now()) delete records[id];
        if (Object.keys(records).length >= limit) return { status: 'rejected', code: 'journal-full' };
        records[command.commandId] = { fingerprint: hash, expiresAt: Date.parse(command.expiresAt), startedAt: now() };
        // Failure to persist intent prevents the side effect entirely.
        await storage.set({ [key]: records });
        let result;
        try {
          const sent = await dispatch(command);
          result = sent?.ok && sent.status === 'accepted' ? { status: 'accepted' }
            : sent?.code && ['stale-document', 'stale-chat', 'unavailable', 'not-ready', 'wrong-account'].includes(sent.code) ? { status: 'rejected', code: sent.code }
            : { status: 'uncertain', code: 'send-unknown' };
        } catch { result = { status: 'uncertain', code: 'send-unknown' }; }
        records[command.commandId].result = result;
        await storage.set({ [key]: records });
        return result;
      });
      chain = job;
      return job;
    }
  };
}
