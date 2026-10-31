const API = import.meta.env.VITE_API_URL;
export const UPLOAD = import.meta.env.VITE_UPLOAD_BASE;
const staticAssetPath = path => {
  const value = String(path || '').replace(/^\/+/, '');
  const aliases = [
    ['assets/img/banner/', 'images/pages/home/immigration-consultants/'],
    ['assets/img/migrate.jpg.jpeg', 'images/pages/home/goals/migrate.jpg.jpeg'],
    ['assets/img/study.jpg.jpeg', 'images/pages/home/goals/study.jpg.jpeg'],
    ['assets/img/study in ', 'images/pages/home/study-visa/study in '],
    ['assets/img/', 'images/'],
    ['uploads/Award/banner/', 'images/pages/about/awards/events/'],
    ['uploads/Award/', 'images/pages/about/awards/'],
    ['uploads/team/', 'images/pages/about/team/'],
    ['media-logoes/', 'images/pages/home/our-media/'],
    ['reviews/', 'images/pages/contact/office/'],
    ['youtube/', 'images/pages/home/success-stories/'],
  ];
  const [from, to] = aliases.find(([prefix]) => value.startsWith(prefix)) || ['', ''];
  return from ? to + value.slice(from.length) : value;
};
export const img = p => (!p ? '' : /^https?:/.test(p) ? p : encodeURI('/assets/' + staticAssetPath(p)));
export const adminImg = p => {
  if (!p) return '';
  if (/^https?:/.test(p) || p.startsWith('/uploads/')) return p;
  if (p.startsWith('/assets/') || p.startsWith('assets/')) return img(p);
  return `${UPLOAD}/${String(p).replace(/^\/+/, '')}`;
};


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
