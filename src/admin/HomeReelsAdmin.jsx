import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { showAdminToast } from './adminToast.js';
import { readVideoDurationSeconds } from './videoValidation.js';

const MAX_REELS = Number(import.meta.env.VITE_REEL_MAX_COUNT);
const MAX_VIDEO_SIZE = Number(import.meta.env.VITE_REEL_MAX_SIZE_MB) * 1024 * 1024;
const MAX_VIDEO_DURATION = Number(import.meta.env.VITE_REEL_MAX_DURATION_SECONDS);
const blank = { url: '', videoFile: null, existingVideo: '' };

const isInstagramReelUrl = value => {
  try {
    const parsed = new URL(String(value || '').trim());
    return ['instagram.com', 'www.instagram.com', 'm.instagram.com'].includes(parsed.hostname.toLowerCase())
      && /^\/reel\/[^/]+\/?$/i.test(parsed.pathname);
  } catch { return false; }
};

export default function HomeReelsAdmin() {
  const token = localStorage.getItem('vfn-admin-token');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const load = () => api('/admin/reel', { token }).then(setItems).catch(error => setNotice(error.message));
  useEffect(() => { load(); }, []);

  const save = async event => {
    event.preventDefault();
    setNotice('');
    setSaving(true);
    try {
      let videoUrl = form.url.trim() || form.existingVideo;
      if (form.url && !isInstagramReelUrl(form.url)) throw new Error('Enter an Instagram Reel link, such as https://www.instagram.com/reel/.../.');
      if (form.videoFile) {
        if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(form.videoFile.type)) throw new Error('Choose an MP4, WebM, or MOV video.');
        if (!Number.isFinite(MAX_VIDEO_SIZE) || MAX_VIDEO_SIZE <= 0 || form.videoFile.size > MAX_VIDEO_SIZE) throw new Error('The reel video exceeds the configured file-size limit.');
        if (!Number.isFinite(MAX_VIDEO_DURATION) || MAX_VIDEO_DURATION <= 0) throw new Error('Set VITE_REEL_MAX_DURATION_SECONDS in the frontend environment.');
        const durationSeconds = await readVideoDurationSeconds(form.videoFile);
        if (durationSeconds > MAX_VIDEO_DURATION) throw new Error(`Reel videos must be ${MAX_VIDEO_DURATION} seconds or shorter.`);
        const data = new FormData();
        data.append('durationSeconds', String(durationSeconds));
        data.append('file', form.videoFile);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/upload-reel-video`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: data });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Reel upload failed.');
        videoUrl = result.path;
      }
      if (!videoUrl) throw new Error('Paste an Instagram Reel link or upload a reel video.');
      await api('/admin/reel', { method: 'POST', body: { urls: [videoUrl], ...(editing ? { _id: editing } : {}) }, token });
      setNotice(editing ? 'Instagram reel updated.' : 'Instagram reel added.');
      showAdminToast(editing ? 'Instagram reel updated.' : 'Instagram reel added.');
      setForm(blank);
      setEditing(null);
      await load();
    } catch (error) {
      setNotice(error.message || 'Could not save the Instagram reel.');
      showAdminToast(error.message || 'Could not save the Instagram reel.', 'error');
    } finally { setSaving(false); }
  };

  const edit = item => {
    const url = item.urls?.[0] || '';
    const uploaded = url.startsWith('/uploads/reels/');
    setEditing(item._id);
    setForm({ url: uploaded ? '' : url, videoFile: null, existingVideo: uploaded ? url : '' });
  };

  const remove = async item => {
    if (!window.confirm('Remove this Instagram reel?')) return;
    try {
      await api(`/admin/reel/${item._id}`, { method: 'DELETE', token });
      await load();
      showAdminToast('Instagram reel removed.');
    } catch (error) {
      setNotice(error.message || 'Could not remove the Instagram reel.');
      showAdminToast(error.message || 'Could not remove the Instagram reel.', 'error');
    }
  };

  const maxReached = !editing && items.length >= MAX_REELS;
  return <section className="adm-tab-panel">
    <div className="adm-section-heading"><div><h3>Instagram reels</h3><p>Add an Instagram Reel link or upload a video. Uploaded videos: MP4, WebM, or MOV; up to {Math.round(MAX_VIDEO_SIZE / 1024 / 1024)} MB and {MAX_VIDEO_DURATION} seconds. Up to {MAX_REELS} reels.</p></div></div>
    {notice && <p role="status" className="adm-testimonial-notice">{notice}</p>}
    <form className="adm-cms-editor" onSubmit={save}>
      <div className="adm-seo-edit-header"><h3>{editing ? 'Edit reel' : 'Add reel'}</h3>{editing && <button type="button" className="adm-btn-action" onClick={() => { setEditing(null); setForm(blank); }}>Cancel</button>}</div>
      <div className="adm-editor-grid">
        <div className="adm-form-group adm-form-wide"><label htmlFor="reel-link">Instagram Reel link</label><input id="reel-link" type="url" maxLength="500" placeholder="https://www.instagram.com/reel/.../" value={form.url} onChange={event => setForm({ ...form, url: event.target.value, videoFile: null, existingVideo: '' })} /><small>Paste a link to an Instagram Reel.</small></div>
        <div className="adm-form-group adm-form-wide"><label htmlFor="reel-video">Or upload a reel video</label><input id="reel-video" type="file" accept="video/mp4,video/webm,video/quicktime" onChange={event => setForm({ ...form, videoFile: event.target.files?.[0] || null, url: '' })} /><small>MP4, WebM, or MOV. Maximum duration: {MAX_VIDEO_DURATION} seconds. Maximum size: {Math.round(MAX_VIDEO_SIZE / 1024 / 1024)} MB.{form.existingVideo ? ' Leave empty to keep the current video.' : ''}</small></div>
      </div>
      {form.existingVideo && <p>Current uploaded video will be kept unless you choose a link or new file.</p>}
      <button className="adm-btn-primary" type="submit" disabled={saving || maxReached}>{saving ? 'Saving...' : maxReached ? 'Reel limit reached' : editing ? 'Save reel' : 'Add reel'}</button>
    </form>
    <div className="adm-testimonial-list">
      {items.map(item => <article className="adm-testimonial-item" key={item._id}>
        <div><strong>{item.urls?.[0]?.startsWith('/uploads/reels/') ? 'Uploaded reel video' : 'Instagram Reel'}</strong><a href={item.urls?.[0]?.startsWith('/uploads/reels/') ? `${import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')}${item.urls[0]}` : item.urls?.[0]} target="_blank" rel="noreferrer">{item.urls?.[0]}</a></div>
        <div><button type="button" className="adm-btn-action" onClick={() => edit(item)}>Edit</button><button type="button" className="adm-btn-action red" onClick={() => remove(item)}>Delete</button></div>
      </article>)}
      {!items.length && <p className="adm-testimonial-empty">No Instagram reels added yet.</p>}
    </div>
  </section>;
}
