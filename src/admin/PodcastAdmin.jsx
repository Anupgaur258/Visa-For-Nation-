import { useEffect, useState } from 'react';
import { api, adminImg } from '../api.js';
import { isSupportedPodcastUrl } from '../pages/podcastUtils.js';
import { showAdminToast } from './adminToast.js';

const configuredLimit = Number(import.meta.env.VITE_PODCAST_MAX_COUNT || 20);
const LIMIT = Number.isFinite(configuredLimit) ? Math.max(0, Math.floor(configuredLimit)) : 20;
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;
const BLANK = { title: '', url: '', thumbnailUrl: '', thumbnailFile: null };
export default function PodcastAdmin() {
  const token = localStorage.getItem('vfn-admin-token');
  const [episodes, setEpisodes] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const load = async () => { try { setEpisodes(await api('/admin/podcasts', { token })); } catch (err) { setError(err.message || 'Could not load podcasts.'); } };
  useEffect(() => { load(); }, []);
  const clear = () => { setEditing(''); setForm(BLANK); setError(''); };
  const submit = async event => {
    event.preventDefault(); setError('');
    const title = form.title.trim(); const url = form.url.trim();
    if (title.length < 3 || title.length > 120) { setError('Title must be 3 to 120 characters.'); return; }
    if (url.length > 1000 || !isSupportedPodcastUrl(url)) { setError('Enter a valid YouTube, Spotify episode, Apple Podcasts, or SoundCloud link.'); return; }
    if (!form.thumbnailUrl && !form.thumbnailFile) { setError('Upload a thumbnail image for this episode.'); return; }
    if (form.thumbnailFile && (!['image/jpeg', 'image/png', 'image/webp'].includes(form.thumbnailFile.type) || form.thumbnailFile.size > MAX_THUMBNAIL_SIZE)) { setError('Choose a JPG, PNG, or WebP thumbnail up to 5 MB.'); return; }
    setSaving(true);
    try {
      let thumbnailUrl = form.thumbnailUrl;
      if (form.thumbnailFile) {
        const data = new FormData(); data.append('category', 'podcast-thumbnails'); data.append('file', form.thumbnailFile);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: data });
        const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Thumbnail upload failed.');
        thumbnailUrl = result.path;
      }
      await api(editing ? `/admin/podcasts/${editing}` : '/admin/podcasts', { method: editing ? 'PUT' : 'POST', body: { title, url, thumbnailUrl }, token });
      await load(); showAdminToast(editing ? 'Podcast updated.' : 'Podcast added.'); clear();
    } catch (err) { setError(err.message || 'Could not save podcast.'); showAdminToast(err.message || 'Could not save podcast.', 'error'); }
    finally { setSaving(false); }
  };
  const edit = item => { setEditing(item._id); setForm({ title: item.title || '', url: item.url || '', thumbnailUrl: item.thumbnailUrl || '', thumbnailFile: null }); setError(''); };
  const remove = async item => { if (!window.confirm(`Delete “${item.title}”?`)) return; try { await api(`/admin/podcasts/${item._id}`, { method: 'DELETE', token }); await load(); if (editing === item._id) clear(); showAdminToast('Podcast deleted.'); } catch (err) { showAdminToast(err.message || 'Could not delete podcast.', 'error'); } };
  return <section className="adm-tab-panel">
    <div className="adm-section-heading"><div><h2>Podcast episodes</h2><p>Add an episode link and upload its thumbnail image (JPG, PNG, or WebP, up to 5 MB). Up to {LIMIT} episodes.</p></div><span className="adm-count-badge">{episodes.length} / {LIMIT}</span></div>
    {error && <div className="adm-login-error" role="alert">{error}</div>}
    <form className="adm-cms-editor" onSubmit={submit}>
      <div className="adm-seo-edit-header"><h3>{editing ? 'Edit episode' : 'Add an episode'}</h3>{editing && <button type="button" className="adm-btn-action" onClick={clear}>Cancel</button>}</div>
      <div className="adm-editor-grid">
        <div className="adm-form-group"><label htmlFor="podcast-title">Episode title</label><input id="podcast-title" required minLength={3} maxLength={120} value={form.title} onChange={e => setForm(current => ({ ...current, title: e.target.value }))} placeholder="e.g. Your guide to studying in Canada" /></div>
        <div className="adm-form-group"><label htmlFor="podcast-url">Podcast player link</label><input id="podcast-url" type="url" required maxLength={1000} value={form.url} onChange={e => setForm(current => ({ ...current, url: e.target.value }))} placeholder="YouTube, Spotify episode, Apple Podcasts, or SoundCloud URL" /><small>Playback is embedded on this website.</small></div>
        <div className="adm-form-group adm-form-wide"><label htmlFor="podcast-thumbnail">Thumbnail image</label><input id="podcast-thumbnail" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setForm(current => ({ ...current, thumbnailFile: e.target.files?.[0] || null }))} />{form.thumbnailUrl && !form.thumbnailFile && <img className="adm-podcast-thumb-preview" src={adminImg(form.thumbnailUrl)} alt="Current podcast thumbnail" />}{form.thumbnailFile && <img className="adm-podcast-thumb-preview" src={URL.createObjectURL(form.thumbnailFile)} alt="Selected podcast thumbnail preview" />}<small>Recommended image size: 1280 × 720 px (16:9). Leave empty to keep the current image while editing.</small></div>
      </div>
      <div className="adm-blog-form-footer"><span>{episodes.length} of {LIMIT} episodes used</span><button className="adm-btn-primary" type="submit" disabled={saving || (!editing && episodes.length >= LIMIT)}>{saving ? 'Saving…' : editing ? 'Save episode' : episodes.length >= LIMIT ? 'Limit reached' : 'Add episode'}</button></div>
    </form>
    <div className="adm-table-card"><div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Thumbnail</th><th>Episode</th><th>Player link</th><th>Actions</th></tr></thead><tbody>{episodes.map(item => <tr key={item._id}><td>{item.thumbnailUrl && <img className="adm-podcast-table-thumb" src={adminImg(item.thumbnailUrl)} alt="" />}</td><td>{item.title}</td><td><a href={item.url} target="_blank" rel="noreferrer">View link</a></td><td><button type="button" className="adm-btn-action" onClick={() => edit(item)}>Edit</button><button type="button" className="adm-btn-action red" onClick={() => remove(item)}>Delete</button></td></tr>)}{!episodes.length && <tr><td colSpan="4">No podcast episodes yet.</td></tr>}</tbody></table></div></div>
  </section>;
}
