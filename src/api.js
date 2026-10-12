const API = import.meta.env.VITE_API_URL;
export const ASSET = import.meta.env.VITE_ASSET_BASE;
export const UPLOAD = import.meta.env.VITE_UPLOAD_BASE;
export const img = p => (!p ? '' : /^https?:/.test(p) ? p : encodeURI(ASSET + '/' + p.replace(/^\//, '')));
export const adminImg = p => !p ? '' : /^https?:/.test(p) ? p : `${UPLOAD}/${p}`;

export async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(API + path, {
    method, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.message || 'Request failed'), { status: res.status });
  return data;
}
