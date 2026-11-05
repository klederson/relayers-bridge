import { apiBase } from './contracts.js';
export function createRelayersClient(server, { getAuth, saveAuth, fetcher = fetch }) {
  const base = apiBase(server);
  let refreshing;
  const request = async (path, { method = 'GET', body, authenticated = true, retry = true } = {}) => {
    if (!path.startsWith('/v1/')) throw new Error('invalid-path');
    const auth = authenticated ? await getAuth() : null;
    const response = await fetcher(`${base}${path}`, { method, credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(15000),
      headers: { 'Content-Type': 'application/json', ...(auth?.access_token ? { Authorization: `Bearer ${auth.access_token}` } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
    const envelope = await response.json().catch(() => ({}));
    if (response.status === 401 && authenticated && retry && auth?.refresh_token) {
      refreshing ??= request('/v1/auth/refresh', { method: 'POST', body: { refresh_token: auth.refresh_token }, authenticated: false }).then(saveAuth).finally(() => { refreshing = null; });
      await refreshing;
      return request(path, { method, body, authenticated, retry: false });
    }
    if (!response.ok) throw new Error(typeof envelope.error?.code === 'string' ? envelope.error.code : `http-${response.status}`);
    return envelope.data;
  };
  return { request };
}
