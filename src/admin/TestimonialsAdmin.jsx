import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { showAdminToast } from './adminToast.js';
import { isYouTubeVideoUrl, readVideoDurationSeconds } from './videoValidation.js';

const MAX_VIDEOS = Number(import.meta.env.VITE_TESTIMONIAL_MAX_COUNT || 20);
const MAX_VIDEO_SIZE = Number(import.meta.env.VITE_TESTIMONIAL_MAX_SIZE_MB) * 1024 * 1024;
const MAX_VIDEO_DURATION = Number(import.meta.env.VITE_TESTIMONIAL_MAX_DURATION_SECONDS);
const blank = { videoUrl: '', title: '', videoFile: null };
export default function TestimonialsAdmin() {
  const token = localStorage.getItem('vfn-admin-token');
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');
  const load = () => api('/admin/testimonial', { token }).then(setVideos).catch(e => setNotice(e.message));
  useEffect(() => { load(); }, []);
  const save = async e => {
    e.preventDefault(); setNotice('');
    if (!form.videoUrl && !form.videoFile) { setNotice('Choose a video file or enter a YouTube URL.'); return; }
    if (form.videoUrl && !isYouTubeVideoUrl(form.videoUrl)) { setNotice('Enter a valid YouTube video or Shorts URL.'); return; }
    if (form.videoFile && (!/^video\/(mp4|webm|quicktime)$/.test(form.videoFile.type) || !Number.isFinite(MAX_VIDEO_SIZE) || form.videoFile.size > MAX_VIDEO_SIZE)) { setNotice(`Choose an MP4, WebM, or MOV video up to ${Math.round(MAX_VIDEO_SIZE / 1024 / 1024)} MB.`); return; }
    if (form.title.trim().length > 100) { setNotice('Title must be 100 characters or fewer.'); return; }
    try {
      let videoUrl = form.videoUrl.trim();
      if (form.videoFile) {
        if (!Number.isFinite(MAX_VIDEO_DURATION) || MAX_VIDEO_DURATION <= 0) throw new Error('Set VITE_TESTIMONIAL_MAX_DURATION_SECONDS in the frontend environment.');
        const durationSeconds = await readVideoDurationSeconds(form.videoFile);
        if (durationSeconds > MAX_VIDEO_DURATION) throw new Error(`Testimonial videos must be ${MAX_VIDEO_DURATION} seconds or shorter.`);
        const data = new FormData(); data.append('durationSeconds', String(durationSeconds)); data.append('file', form.videoFile);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/upload-video`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: data });
        const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Video upload failed.');
        videoUrl = result.path;
      }
      await api('/admin/testimonial', { method: 'POST', body: { videoUrl, title: form.title, ...(editing ? { _id: editing } : {}) }, token });
      setForm(blank); setEditing(null); setNotice('Video saved.'); showAdminToast(editing ? 'Testimonial updated.' : 'Testimonial added.'); load();
    } catch (error) { setNotice(error.message || 'Could not save video.'); showAdminToast(error.message || 'Could not save video.', 'error'); }
  };
  const edit = item => { setEditing(item._id); setForm({ videoUrl: item.videoUrl || '', title: item.title || '', videoFile: null }); showAdminToast('Testimonial loaded for editing.'); };
  const remove = async item => {
    if (!window.confirm('Remove this testimonial video?')) return;
    try { await api(`/admin/testimonial/${item._id}`, { method: 'DELETE', token }); setNotice('Video removed.'); showAdminToast('Testimonial removed.'); load(); }
    catch (error) { setNotice(error.message || 'Could not remove video.'); showAdminToast(error.message || 'Could not remove video.', 'error'); }
  };
  return <section className="adm-tab-panel">
    <div className="adm-section-heading"><div><h2>Video testimonials</h2><p>Upload a video up to {MAX_VIDEO_DURATION} seconds or paste a YouTube URL. MP4, WebM, or MOV up to {Math.round(MAX_VIDEO_SIZE / 1024 / 1024)} MB. Up to {MAX_VIDEOS} videos.</p></div></div>
    {notice && <p role="status" className="adm-testimonial-notice">{notice}</p>}
    <form className="adm-cms-editor" onSubmit={save}>
      <div className="adm-seo-edit-header"><h3>{editing ? 'Edit video' : 'Add video'}</h3>{editing && <button type="button" className="adm-btn-action" onClick={() => { setEditing(null); setForm(blank); }}>Cancel</button>}</div>
      <div className="adm-editor-grid">
        <div className="adm-form-group adm-form-wide"><label>Upload video file</label><input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={e => setForm({ ...form, videoFile: e.target.files?.[0] || null, videoUrl: '' })} /><small>Choose an MP4, WebM, or MOV file. Maximum duration: {MAX_VIDEO_DURATION} seconds; maximum size: {Math.round(MAX_VIDEO_SIZE / 1024 / 1024)} MB.</small></div>
        <div className="adm-form-group adm-form-wide"><label>Or YouTube video URL</label><input type="url" maxLength="500" placeholder="https://www.youtube.com/shorts/..." value={form.videoUrl} onChange={e => setForm({ ...form, videoUrl: e.target.value, videoFile: null })} /><small>Only YouTube video links are supported.</small></div>
        <div className="adm-form-group adm-form-wide"><label>Title (optional)</label><input maxLength="100" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
      </div>
      <button className="adm-btn-primary" type="submit" disabled={!editing && videos.length >= MAX_VIDEOS}>{editing ? 'Save video' : videos.length >= MAX_VIDEOS ? 'Video limit reached' : 'Add video'}</button>
    </form>
    <div className="adm-testimonial-list">
      {videos.map(video => <article className="adm-testimonial-item" key={video._id}>
        <div><strong>{video.title || 'Client testimonial'}</strong><a href={video.videoUrl?.startsWith('/uploads/') ? `${import.meta.env.VITE_API_URL.replace(/\/api$/, '')}${video.videoUrl}` : video.videoUrl} target="_blank" rel="noreferrer">{video.videoUrl}</a><small>{video.likes || 0} likes</small></div>
        <div><button type="button" className="adm-btn-action" onClick={() => edit(video)}>Edit</button><button type="button" className="adm-btn-action red" onClick={() => remove(video)}>Delete</button></div>
      </article>)}
      {!videos.length && <p className="adm-testimonial-empty">No testimonial videos added yet.</p>}
    </div>
  </section>;
}
