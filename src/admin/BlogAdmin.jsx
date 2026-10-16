import { useEffect, useState } from 'react';
import { api } from '../api.js';

const limit = Number(import.meta.env.VITE_BLOG_MAX_CONTENT_CHARS || 800);
const empty = { title: '', slug: '', image: '', category: '', metaDescription: '', content: '', status: 'published' };
export default function BlogAdmin() {
  const token = localStorage.getItem('vfn-admin-token');
  const [posts, setPosts] = useState([]); const [form, setForm] = useState(empty); const [editing, setEditing] = useState(null); const [error, setError] = useState('');
  const load = () => api('/admin/posts', { token }).then(setPosts).catch(e => setError(e.message));
  useEffect(() => { load(); }, []);
  const save = async e => { e.preventDefault(); setError(''); try { await api(editing ? `/admin/posts/${editing}` : '/admin/posts', { method: editing ? 'PUT' : 'POST', body: form, token }); setForm(empty); setEditing(null); load(); } catch (err) { setError(err.message); } };
  const edit = p => { setEditing(p._id); setForm({ ...empty, ...p }); };
  const remove = async p => { if (!window.confirm(`Delete “${p.title}”?`)) return; try { await api(`/admin/posts/${p._id || p.slug}`, { method: 'DELETE', token }); load(); } catch (e) { setError(e.message); } };
  return <section className="adm-tab-panel"><div className="adm-section-heading"><div><h2>Blog posts</h2><p>Create, update, and remove blog articles. The public blog cards keep their current design.</p></div></div>
    {error && <div className="adm-login-error" role="alert">{error}</div>}
    <form className="adm-cms-editor" onSubmit={save}><div className="adm-seo-edit-header"><h3>{editing ? 'Edit article' : 'Add article'}</h3>{editing && <button type="button" className="adm-btn-action" onClick={() => { setEditing(null); setForm(empty); }}>Cancel</button>}</div>
      <div className="adm-editor-grid"><div className="adm-form-group"><label>Title</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div><div className="adm-form-group"><label>URL slug</label><input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="Generated from title if blank" /></div>
        <div className="adm-form-group"><label>Card image URL</label><input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} /></div><div className="adm-form-group"><label>Category</label><input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
        <div className="adm-form-group adm-form-wide"><label>Card excerpt</label><textarea rows="2" maxLength="160" value={form.metaDescription} onChange={e => setForm({ ...form, metaDescription: e.target.value })} /></div>
        <div className="adm-form-group adm-form-wide"><label>Article text (max {limit} characters)</label><textarea required rows="8" maxLength={limit} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /><small>{form.content.length}/{limit}</small></div>
        <div className="adm-form-group"><label>Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="published">Published</option><option value="draft">Draft</option></select></div>
      </div><button type="submit" className="adm-btn-primary">{editing ? 'Save article' : 'Add article'}</button>
    </form>
    <div className="adm-table-card"><div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead><tbody>{posts.map(p => <tr key={p._id || p.slug}><td>{p.title}</td><td>{p.category}</td><td>{p.status}</td><td><button className="adm-btn-action" onClick={() => edit(p)}>Edit</button><button className="adm-btn-action red" onClick={() => remove(p)}>Delete</button></td></tr>)}{!posts.length && <tr><td colSpan="4">No blog posts.</td></tr>}</tbody></table></div></div>
  </section>;
}
