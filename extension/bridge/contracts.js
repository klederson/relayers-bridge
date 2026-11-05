export const SCHEMA = 'relayers.whatsapp.v1';
export const DESTINATION = 'https://whatsapp.bridge.invalid/send';
export const MAX_COMMAND_AGE = 24 * 60 * 60 * 1000;
export const uuid = value => typeof value === 'string' && /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(value);
export const chatId = value => typeof value === 'string' && /^[\d-]+@(?:c\.us|lid|g\.us)$/.test(value);
export function validateCommand(command, binding, now = Date.now()) {
  if (!binding) return 'not-configured';
  if (!command || command.schema !== SCHEMA || command.type !== 'message.send' || !uuid(command.commandId) || !uuid(command.connectionId)
    || !chatId(command.accountId) || !chatId(command.chatId) || typeof command.text !== 'string' || !command.text.trim() || command.text.length > 10000) return 'invalid-command';
  if (command.connectionId !== binding.connectionId || command.accountId !== binding.accountId || !binding.chatIds.includes(command.chatId)) return 'wrong-binding';
  if (!binding.enabled || !binding.outbound) return 'outbound-disabled';
  if (typeof command.expiresAt !== 'string' || !Number.isFinite(Date.parse(command.expiresAt)) || Date.parse(command.expiresAt) <= now || Date.parse(command.expiresAt) > now + MAX_COMMAND_AGE) return 'expired-command';
  return null;
}
export async function fingerprint(command) {
  const canonical = JSON.stringify([command.schema, command.type, command.commandId, command.connectionId, command.accountId, command.chatId, command.text, command.expiresAt]);
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
  return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
export function apiBase(value) {
  const url = new URL(value);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('invalid-server');
  return url.origin;
}
export function permissionOrigin(server) { const u = new URL(apiBase(server)); return `${u.protocol}//${u.hostname}/*`; }
