// Self-contained MAIN-world snapshot. No tokens, clicks, downloads, read marks,
// history loading, navigation, focus change or composer writes.
export function readRelayInPage(chatIds = []) {
  const serial = id => id?._serialized ?? id?.$1 ?? (typeof id === 'string' ? id : null);
  const load = name => {
    for (const loader of [globalThis.require, globalThis.importNamespace]) {
      try { if (typeof loader === 'function') { const value = loader(name); if (value) return value; } } catch {}
    }
  };
  if (location.origin !== 'https://web.whatsapp.com') return { ok: false, code: 'unavailable' };
  try {
    const store = load('WAWebChatCollection')?.ChatCollection ?? load('WAWebCollections')?.Chat;
    const user = load('WAWebUserPrefsMeUser');
    const accountId = serial(user?.getMaybeMeLidUser?.()) ?? serial(user?.getMaybeMePnUser?.());
    if (!accountId || !store?.getModelsArray) return { ok: false, code: 'not-ready' };
    const models = store.getModelsArray().filter(chat => /^[\d-]+@(?:c\.us|lid|g\.us)$/.test(serial(chat.id) ?? ''));
    const chats = models.map(chat => ({ id: serial(chat.id), name: String(chat.formattedTitle || chat.name || chat.contact?.pushname || serial(chat.id)).slice(0, 160) }));
    const messages = [];
    for (const chat of models.filter(chat => chatIds.includes(serial(chat.id)))) {
      const loaded = chat.msgs?.getModelsArray?.() ?? [];
      if (loaded.length > 1000) return { ok: false, code: 'snapshot-too-large' };
      for (const message of loaded) {
        if (message.id?.fromMe || message.fromMe || message.isSentByMe || message.isNotification || ['e2e_notification', 'notification_template', 'gp2', 'protocol', 'ciphertext'].includes(message.type)) continue;
        const id = serial(message.id);
        const timestamp = Number(message.t ?? message.timestamp) * 1000;
        if (!id || !Number.isFinite(timestamp)) continue;
        const type = message.isViewOnce ? 'view_once' : message.type ?? 'chat';
        const raw = type === 'view_once' ? '' : type === 'chat' ? message.body : message.caption;
        const text = typeof raw === 'string' ? raw.slice(0, 16384) : '';
        messages.push({ id, chatId: serial(chat.id), type, timestamp, text, truncated: typeof raw === 'string' && raw.length > text.length });
      }
    }
    return { ok: true, accountId, chats, messages };
  } catch { return { ok: false, code: 'unavailable' }; }
}
