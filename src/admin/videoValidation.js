export function readVideoMetadata(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const metadata = { duration: video.duration, width: video.videoWidth, height: video.videoHeight };
      URL.revokeObjectURL(objectUrl);
      if (!Number.isFinite(metadata.duration) || metadata.duration <= 0 || !metadata.width || !metadata.height) reject(new Error('Could not read the video details.'));
      else resolve(metadata);
    };
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read this video file.'));
    };
    video.src = objectUrl;
  });
}

export async function readVideoDurationSeconds(file) {
  return (await readVideoMetadata(file)).duration;
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
