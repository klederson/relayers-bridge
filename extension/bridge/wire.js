const bytes = value => new TextEncoder().encode(value);
const hex = value => [...new Uint8Array(value)].map(byte => byte.toString(16).padStart(2, '0')).join('');
export async function hmac(secret, content) {
  const raw = typeof secret === 'string' ? bytes(secret) : secret;
  const key = await crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, bytes(content)));
}
export function decodeKey(value) {
  const result = Uint8Array.from(atob(value), char => char.charCodeAt(0));
  if (result.length !== 32) throw new Error('invalid-session-key');
  return result;
}
// RELAYERS tunnel-v1 signs the type/nonce/timestamp envelope. TLS remains
// mandatory for non-local servers; schema/binding/expiry checks gate effects.
export async function signFrame(key, frame, now = Date.now()) {
  const nonce = hex(crypto.getRandomValues(new Uint8Array(16)));
  const ts = Math.floor(now / 1000);
  return { ...frame, nonce, ts, sig: await hmac(key, `${frame.type}${nonce}${ts}`) };
}
export function createFrameVerifier(key, now = Date.now) {
  const seen = new Map();
  return async frame => {
    const time = now();
    for (const [nonce, expiry] of seen) if (expiry <= time) seen.delete(nonce);
    if (typeof frame?.type !== 'string' || !/^[a-f\d]{32}$/.test(frame.nonce ?? '') || !Number.isSafeInteger(frame.ts) || Math.abs(time / 1000 - frame.ts) > 60
      || !/^[a-f\d]{64}$/.test(frame.sig ?? '') || seen.has(frame.nonce) || seen.size >= 4096) throw new Error('invalid-frame');
    seen.set(frame.nonce, time + 120000);
    const expected = await hmac(key, `${frame.type}${frame.nonce}${frame.ts}`);
    let mismatch = 0;
    for (let index = 0; index < 64; index++) mismatch |= expected.charCodeAt(index) ^ frame.sig.charCodeAt(index);
    if (mismatch) throw new Error('invalid-frame');
    return frame;
  };
}
export function decodeBody(body) {
  if (typeof body !== 'string' || body.length > 100000) throw new Error('invalid-command');
  const data = Uint8Array.from(atob(body), char => char.charCodeAt(0));
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(data));
}
