import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { showAdminToast } from './adminToast.js';

const BLOG_CONTENT_LIMIT = Number(import.meta.env.VITE_BLOG_MAX_CONTENT_CHARS || 800);
const BLOG_COUNT_LIMIT = Number(import.meta.env.VITE_BLOG_MAX_COUNT || 30);
const uploadImage = async (file, token) => { if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) throw new Error('Choose a JPEG, PNG, WebP, or GIF image.'); if (file.size > 5 * 1024 * 1024) throw new Error('Image must be 5 MB or smaller.'); const data = new FormData(); data.append('file', file); const response = await fetch(import.meta.env.VITE_API_URL + '/admin/upload', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: data }); const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Image upload failed.'); return result.path; };
const empty = { title: '', slug: '', image: '', category: '', metaDescription: '', content: '', status: 'published' };
export default function BlogAdmin({ type = 'blog' }) {
  const isNews = type === 'news';
  const endpoint = isNews ? 'news' : 'posts';
  const itemLabel = isNews ? 'news article' : 'blog article';
  const sectionLabel = isNews ? 'News articles' : 'Blog posts';
  const limit = Number(isNews ? import.meta.env.VITE_NEWS_MAX_CONTENT_CHARS || BLOG_CONTENT_LIMIT : BLOG_CONTENT_LIMIT);
  const maxPosts = Number(isNews ? import.meta.env.VITE_NEWS_MAX_COUNT || 30 : BLOG_COUNT_LIMIT);
  const token = localStorage.getItem('vfn-admin-token');
  const [posts, setPosts] = useState([]); const [form, setForm] = useState(empty); const [editing, setEditing] = useState(null); const [error, setError] = useState('');
  const load = () => api(`/admin/${endpoint}`, { token }).then(setPosts).catch(e => { setError(e.message); showAdminToast(e.message || `Could not load ${sectionLabel.toLowerCase()}.`, 'error'); });
  useEffect(() => { load(); }, []);
  const save = async e => { e.preventDefault(); setError(''); try { await api(editing ? `/admin/${endpoint}/${editing}` : `/admin/${endpoint}`, { method: editing ? 'PUT' : 'POST', body: form, token }); setForm(empty); setEditing(null); await load(); showAdminToast(editing ? `${isNews ? 'News article' : 'Blog post'} updated.` : `${isNews ? 'News article' : 'Blog post'} created.`); } catch (err) { setError(err.message); showAdminToast(err.message || `Could not save ${itemLabel}.`, 'error'); } };
  const edit = p => { setEditing(p._id); setForm({ ...empty, ...p }); showAdminToast(`Editing ${p.title}.`); };
  const chooseImage = async event => { const file = event.target.files?.[0]; if (!file) return; try { const image = await uploadImage(file, token); setForm(current => ({ ...current, image })); showAdminToast(`${isNews ? 'News' : 'Blog'} image uploaded.`); } catch (error) { setError(error.message); showAdminToast(error.message, 'error'); } };
  const remove = async p => { if (!window.confirm(`Delete ${p.title}?`)) return; try { await api(`/admin/${endpoint}/${p._id || p.slug}`, { method: 'DELETE', token }); await load(); showAdminToast(`${isNews ? 'News article' : 'Blog post'} deleted.`); } catch (e) { setError(e.message); showAdminToast(e.message || `Could not delete ${itemLabel}.`, 'error'); } };
  return <section className="adm-tab-panel"><div className="adm-section-heading"><div><h2>{sectionLabel}</h2><p>Create and edit up to {maxPosts} {isNews ? 'news articles' : 'blog articles'}. Newer items appear first.</p></div></div>
    {error && <div className="adm-login-error" role="alert">{error}</div>}
    <form className="adm-cms-editor" onSubmit={save}><div className="adm-seo-edit-header"><h3>{editing ? `Edit ${itemLabel}` : `Add ${itemLabel}`}</h3>{editing && <button type="button" className="adm-btn-action" onClick={() => { setEditing(null); setForm(empty); }}>Cancel</button>}</div>
      <div className="adm-editor-grid"><div className="adm-form-group"><label>Title</label><input required minLength="3" maxLength="120" value={form.title} placeholder={isNews ? 'e.g. Latest immigration update' : 'e.g. Canada Express Entry: 2026 Guide'} onChange={e => setForm({ ...form, title: e.target.value })} /></div><div className="adm-form-group"><label>URL slug</label><input maxLength="140" pattern="[A-Za-z0-9-]*" title="Use letters, numbers, and hyphens." value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="Generated from title if blank" /></div>
        <div className="adm-form-group"><label>Card image URL or upload</label><input required maxLength="500" value={form.image} placeholder="uploads/articles/cover-image.jpg" onChange={e => setForm({ ...form, image: e.target.value })} /><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={chooseImage} aria-label={`Upload ${itemLabel} image`} /></div><div className="adm-form-group"><label>Category</label><input maxLength="60" value={form.category} placeholder={isNews ? 'e.g. Immigration news' : 'e.g. Canada PR'} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
        <div className="adm-form-group adm-form-wide"><label>Card excerpt</label><textarea rows="2" maxLength="160" placeholder="A short summary shown on the blog card." value={form.metaDescription} onChange={e => setForm({ ...form, metaDescription: e.target.value })} /></div>
        <div className="adm-form-group adm-form-wide"><label>Article text (max {limit} characters)</label><textarea required minLength="20" rows="8" maxLength={limit} placeholder={`Write the full ${itemLabel} here.`} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /><small>{form.content.length}/{limit}</small></div>
        
      </div><div className="adm-blog-form-footer"><div className="adm-form-group"><label htmlFor={`${endpoint}-status`}>Publishing status</label><select id={`${endpoint}-status`} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="published">Published</option><option value="draft">Draft</option></select></div><button type="submit" className="adm-btn-primary" disabled={!editing && posts.length >= maxPosts}>{editing ? 'Save article' : posts.length >= maxPosts ? `${isNews ? 'News' : 'Blog'} limit reached` : `Add ${itemLabel}`}</button></div>
    </form>
    <div className="adm-table-card"><div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead><tbody>{posts.map(p => <tr key={p._id || p.slug}><td>{p.title}</td><td>{p.category}</td><td>{p.status}</td><td><button className="adm-btn-action" type="button" onClick={() => edit(p)}>Edit</button><button className="adm-btn-action red" type="button" onClick={() => remove(p)}>Delete</button></td></tr>)}{!posts.length && <tr><td colSpan="4">No {isNews ? 'news articles' : 'blog posts'} yet.</td></tr>}</tbody></table></div></div>
  </section>;
}
