import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { isSupportedPodcastUrl } from '../pages/podcastUtils.js';
import { showAdminToast } from './adminToast.js';

const configuredLimit = Number(import.meta.env.VITE_PODCAST_MAX_COUNT || 20);
const LIMIT = Number.isFinite(configuredLimit) ? Math.max(0, Math.floor(configuredLimit)) : 20;
const BLANK = { title: '', url: '' };
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
    setSaving(true);
    try {
      await api(editing ? `/admin/podcasts/${editing}` : '/admin/podcasts', { method: editing ? 'PUT' : 'POST', body: { title, url }, token });
      await load(); showAdminToast(editing ? 'Podcast updated.' : 'Podcast added.'); clear();
    } catch (err) { setError(err.message || 'Could not save podcast.'); showAdminToast(err.message || 'Could not save podcast.', 'error'); }
    finally { setSaving(false); }
  };
  const edit = item => { setEditing(item._id); setForm({ title: item.title || '', url: item.url || '' }); setError(''); };
  const remove = async item => { if (!window.confirm(`Delete “${item.title}”?`)) return; try { await api(`/admin/podcasts/${item._id}`, { method: 'DELETE', token }); await load(); if (editing === item._id) clear(); showAdminToast('Podcast deleted.'); } catch (err) { showAdminToast(err.message || 'Could not delete podcast.', 'error'); } };
  return <section className="adm-tab-panel">
    <div className="adm-section-heading"><div><h2>Podcast episodes</h2><p>Add up to {LIMIT} episodes using player links. Podcast video or audio files are not uploaded.</p></div><span className="adm-count-badge">{episodes.length} / {LIMIT}</span></div>
    {error && <div className="adm-login-error" role="alert">{error}</div>}
    <form className="adm-cms-editor" onSubmit={submit}>
      <div className="adm-seo-edit-header"><h3>{editing ? 'Edit episode' : 'Add an episode'}</h3>{editing && <button type="button" className="adm-btn-action" onClick={clear}>Cancel</button>}</div>
      <div className="adm-editor-grid">
        <div className="adm-form-group"><label htmlFor="podcast-title">Episode title</label><input id="podcast-title" required minLength={3} maxLength={120} value={form.title} onChange={e => setForm(current => ({ ...current, title: e.target.value }))} placeholder="e.g. Your guide to studying in Canada" /></div>
        <div className="adm-form-group"><label htmlFor="podcast-url">Podcast player link</label><input id="podcast-url" type="url" required maxLength={1000} value={form.url} onChange={e => setForm(current => ({ ...current, url: e.target.value }))} placeholder="YouTube, Spotify episode, Apple Podcasts, or SoundCloud URL" /><small>Playback is embedded on this website.</small></div>
      </div>
      <div className="adm-blog-form-footer"><span>{episodes.length} of {LIMIT} episodes used</span><button className="adm-btn-primary" type="submit" disabled={saving || (!editing && episodes.length >= LIMIT)}>{saving ? 'Saving…' : editing ? 'Save episode' : episodes.length >= LIMIT ? 'Limit reached' : 'Add episode'}</button></div>
    </form>
    <div className="adm-table-card"><div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Episode</th><th>Player link</th><th>Actions</th></tr></thead><tbody>{episodes.map(item => <tr key={item._id}><td>{item.title}</td><td><a href={item.url} target="_blank" rel="noreferrer">View link</a></td><td><button type="button" className="adm-btn-action" onClick={() => edit(item)}>Edit</button><button type="button" className="adm-btn-action red" onClick={() => remove(item)}>Delete</button></td></tr>)}{!episodes.length && <tr><td colSpan="3">No podcast episodes yet.</td></tr>}</tbody></table></div></div>
  </section>;
}
