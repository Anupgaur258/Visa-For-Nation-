export function readVideoDurationSeconds(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(objectUrl);
      if (!Number.isFinite(duration) || duration <= 0) reject(new Error('Could not read the video duration.'));
      else resolve(duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read this video file.'));
    };
    video.src = objectUrl;
  });
}

export function isYouTubeVideoUrl(value) {
  try {
    const parsed = new URL(String(value || '').trim());
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    let id = '';
    if (host === 'youtu.be') id = parsed.pathname.split('/').filter(Boolean)[0] || '';
    else if (['youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(host)) {
      id = parsed.searchParams.get('v') || parsed.pathname.match(/\/(?:embed|shorts|live)\/([^/?#]+)/)?.[1] || '';
    }
    return /^[A-Za-z0-9_-]{11}$/.test(id);
  } catch {
    return false;
  }
}
