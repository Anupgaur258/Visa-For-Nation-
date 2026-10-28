const API = import.meta.env.VITE_API_URL;
export const UPLOAD = import.meta.env.VITE_UPLOAD_BASE;
const staticAssetPath = path => {
  const value = String(path || '').replace(/^\/+/, '');
  const aliases = [
    ['assets/img/banner/', 'images/banners/'],
    ['assets/img/study in ', 'images/study-destinations/study in '],
    ['assets/img/', 'images/'],
    ['uploads/Award/banner/', 'awards/events/'],
    ['uploads/Award/', 'awards/'],
    ['uploads/team/', 'team/'],
    ['media-logoes/', 'media/logos/'],
    ['reviews/', 'media/reviews/'],
    ['youtube/', 'media/video-thumbnails/youtube/'],
  ];
  const [from, to] = aliases.find(([prefix]) => value.startsWith(prefix)) || ['', ''];
  return from ? to + value.slice(from.length) : value;
};
export const img = p => (!p ? '' : /^https?:/.test(p) ? p : encodeURI('/assets/' + staticAssetPath(p)));
export const adminImg = p => !p ? '' : (/^(https?:|\/)/.test(p) ? p : `${UPLOAD}/${p}`);


export async function api(path, { method = 'GET', body, token } = {}) {
  let res;
  try {
    res = await fetch(API + path, {
      method, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
      body: body && JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof TypeError) throw new Error(`Could not reach the backend at ${API}. Check that the Backend server is running and try again.`);
    throw error;
  }
  
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.message || 'Request failed'), { status: res.status });
  return data;
}
