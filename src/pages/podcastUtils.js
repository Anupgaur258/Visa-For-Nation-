export function getPodcastEmbed(rawUrl) {
  try {
    const url = new URL(String(rawUrl || '').trim());
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    let id = '';
    if (['youtube.com', 'm.youtube.com', 'youtu.be', 'youtube-nocookie.com'].includes(host)) {
      id = url.searchParams.get('v') || url.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] || (host === 'youtu.be' ? url.pathname.split('/').filter(Boolean)[0] : '');
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0` : '';
    }
    if (host === 'open.spotify.com') {
      const match = url.pathname.match(/^\/episode\/([A-Za-z0-9]+)/);
      return match ? `https://open.spotify.com/embed/episode/${match[1]}?utm_source=generator` : '';
    }
    if (host === 'podcasts.apple.com' && /\/podcast\//.test(url.pathname)) return `https://embed.podcasts.apple.com${url.pathname}${url.search}`;
    if (host === 'soundcloud.com' && url.pathname.split('/').filter(Boolean).length >= 2) return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url.href)}&auto_play=false`;
    return '';
  } catch { return ''; }
}

export const isSupportedPodcastUrl = url => Boolean(getPodcastEmbed(url));
