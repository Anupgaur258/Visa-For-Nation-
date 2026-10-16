import { useEffect, useState } from 'react';
import { api } from '../api.js';

const MAX_VIDEOS = Number(import.meta.env.VITE_TESTIMONIAL_MAX_COUNT || 10);
const blank = { videoUrl: '', title: '' };
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
    const validYoutubeUrl = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)[\w-]{11}/i;
    if (!validYoutubeUrl.test(form.videoUrl.trim())) { setNotice('Enter a valid YouTube video or Shorts URL.'); return; }
    try {
      await api('/admin/testimonial', { method: 'POST', body: { ...form, ...(editing ? { _id: editing } : {}) }, token });
      setForm(blank); setEditing(null); setNotice('Video saved.'); load();
    } catch (error) { setNotice(error.message || 'Could not save video.'); }
  };
  const edit = item => { setEditing(item._id); setForm({ videoUrl: item.videoUrl || '', title: item.title || '' }); };
  const remove = async item => {
    if (!window.confirm('Remove this testimonial video?')) return;
    try { await api(`/admin/testimonial/${item._id}`, { method: 'DELETE', token }); setNotice('Video removed.'); load(); }
    catch (error) { setNotice(error.message || 'Could not remove video.'); }
  };
  return <section className="adm-tab-panel">
    <div className="adm-section-heading"><div><h2>Client testimonial videos</h2><p>Paste a YouTube video or Shorts URL. Up to {MAX_VIDEOS} videos.</p></div></div>
    {notice && <p role="status" className="adm-testimonial-notice">{notice}</p>}
    <form className="adm-cms-editor" onSubmit={save}>
      <div className="adm-seo-edit-header"><h3>{editing ? 'Edit video' : 'Add video'}</h3>{editing && <button type="button" className="adm-btn-action" onClick={() => { setEditing(null); setForm(blank); }}>Cancel</button>}</div>
      <div className="adm-editor-grid">
        <div className="adm-form-group adm-form-wide"><label>YouTube video URL</label><input required type="url" placeholder="https://www.youtube.com/shorts/..." value={form.videoUrl} onChange={e => setForm({ ...form, videoUrl: e.target.value })} /></div>
        <div className="adm-form-group adm-form-wide"><label>Title (optional)</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
      </div>
      <button className="adm-btn-primary" type="submit" disabled={!editing && videos.length >= MAX_VIDEOS}>{editing ? 'Save video' : videos.length >= MAX_VIDEOS ? 'Video limit reached' : 'Add video'}</button>
    </form>
    <div className="adm-testimonial-list">
      {videos.map(video => <article className="adm-testimonial-item" key={video._id}>
        <div><strong>{video.title || 'Client testimonial'}</strong><a href={video.videoUrl} target="_blank" rel="noreferrer">{video.videoUrl}</a><small>{video.likes || 0} likes</small></div>
        <div><button type="button" className="adm-btn-action" onClick={() => edit(video)}>Edit</button><button type="button" className="adm-btn-action red" onClick={() => remove(video)}>Delete</button></div>
      </article>)}
      {!videos.length && <p className="adm-testimonial-empty">No testimonial videos added yet.</p>}
    </div>
  </section>;
}
