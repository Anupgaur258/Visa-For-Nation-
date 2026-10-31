import { useEffect, useMemo, useState } from 'react';
import { api, adminImg } from '../api.js';
import { showAdminToast } from './adminToast.js';
import RichContentEditor from './RichContentEditor.jsx';

const CONTENT_LIMIT = Number(import.meta.env.VITE_BLOG_MAX_CONTENT_CHARS || 3500);
const BLOG_COUNT_LIMIT = Number(import.meta.env.VITE_BLOG_MAX_COUNT || 30);
const PAGE_SIZE = Math.max(1, Math.floor(Number(import.meta.env.VITE_ADMIN_PAGE_SIZE || 10)));
const CATEGORY_OPTIONS = ['Immigration News', 'Visa Update', 'Travel News', 'Student Visa', 'Study Abroad', 'Work Visa', 'Immigration Guide', 'Canada PR', 'Australia PR'];
const COUNTRY_OPTIONS = ['Canada', 'Australia', 'USA', 'UK', 'Germany', 'Ireland', 'New Zealand', 'Portugal', 'Singapore', 'Schengen Area', 'France', 'Italy', 'Spain', 'Netherlands', 'Austria', 'Switzerland', 'UAE', 'Global / International'];
const empty = { title: '', slug: '', image: '', category: '', country: '', content: '', status: 'published' };
const slugFromTitle = title => String(title || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'article';
const dateLabel = value => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
const uploadImage = async (file, token, category) => {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) throw new Error('Choose a JPEG, PNG, WebP, or GIF image.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Image must be 5 MB or smaller.');
  const data = new FormData(); data.append('category', category); data.append('file', file);
  const response = await fetch(import.meta.env.VITE_API_URL + '/admin/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: data });
  const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Image upload failed.'); return result.path;
};

export default function BlogAdmin({ type = 'blog' }) {
  const isNews = type === 'news';
  const endpoint = isNews ? 'news' : 'posts';
  const itemLabel = isNews ? 'news article' : 'blog post';
  const title = isNews ? 'News Management' : 'Blog Post Management';
  const maxCount = Number(isNews ? import.meta.env.VITE_NEWS_MAX_COUNT || 30 : BLOG_COUNT_LIMIT);
  const maxChars = Number(isNews ? import.meta.env.VITE_NEWS_MAX_CONTENT_CHARS || CONTENT_LIMIT : CONTENT_LIMIT);
  const token = localStorage.getItem('vfn-admin-token');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const load = () => api(`/admin/${endpoint}`, { token }).then(data => setItems(Array.isArray(data) ? data : [])).catch(err => {
    setError(err.message || `Could not load ${isNews ? 'news' : 'blog posts'}.`);
    showAdminToast(err.message || `Could not load ${isNews ? 'news' : 'blog posts'}.`, 'error');
  });
  useEffect(() => { load(); }, []);
  const categories = useMemo(() => [...new Set([...CATEGORY_OPTIONS, ...items.map(item => item.category).filter(Boolean), form.category].filter(Boolean))], [items, form.category]);
  const countries = useMemo(() => [...new Set([...COUNTRY_OPTIONS, ...items.map(item => item.country).filter(Boolean), form.country].filter(Boolean))], [items, form.country]);
  const filteredItems = useMemo(() => items.filter(item =>
    (category === 'All' || item.category === category) &&
    (countryFilter === 'All' || (countryFilter === 'Global / International' ? !item.country : item.country === countryFilter)) &&
    (status === 'All' || item.status === status.toLowerCase()) &&
    (!search.trim() || `${item.title} ${item.category || ''} ${item.country || ''}`.toLowerCase().includes(search.trim().toLowerCase())
  )), [items, category, countryFilter, status, search]);
  const pageCount = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const visibleItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const clear = () => { setEditing(null); setForm(empty); setError(''); };
  const save = async event => {
    event.preventDefault(); setError('');
    try {
      if (!form.category) throw new Error('Choose a category before saving.');
      const readableContent = new DOMParser().parseFromString(form.content, 'text/html').body.textContent.trim();
      if (readableContent.length < 20) throw new Error('Add at least 20 characters of article content.');
      if (form.content.length > maxChars) throw new Error(`Content is over the ${maxChars} character limit. Shorten it or increase the content limit in the environment settings.`);
      await api(editing ? `/admin/${endpoint}/${editing}` : `/admin/${endpoint}`, { method: editing ? 'PUT' : 'POST', body: { ...form, slug: slugFromTitle(form.title) }, token });
      clear(); await load(); showAdminToast(editing ? `${isNews ? 'News article' : 'Blog post'} updated.` : `${isNews ? 'News article' : 'Blog post'} created.`);
    } catch (err) { setError(err.message); showAdminToast(err.message || `Could not save ${itemLabel}.`, 'error'); }
  };
  const edit = item => { setEditing(item._id); setForm({ ...empty, ...item }); };
  const remove = async item => {
    if (!window.confirm(`Delete ${item.title}?`)) return;
    try { await api(`/admin/${endpoint}/${item._id || item.slug}`, { method: 'DELETE', token }); await load(); showAdminToast(`${isNews ? 'News article' : 'Blog post'} deleted.`); }
    catch (err) { setError(err.message); showAdminToast(err.message || `Could not delete ${itemLabel}.`, 'error'); }
  };
  const chooseImage = async event => {
    const file = event.target.files?.[0]; if (!file) return;
    try {
      const image = await uploadImage(file, token, isNews ? 'news' : 'blogs');
      setForm(current => ({ ...current, image })); showAdminToast('Image uploaded.');
    } catch (err) { setError(err.message); showAdminToast(err.message, 'error'); }
  };
  return <section className="adm-tab-panel adm-publishing-page">
    <header className="adm-pub-title">
      <div><h2>{title}</h2><p>Home <span aria-hidden="true">›</span> {isNews ? 'News' : 'Blog Post'}</p></div>
      <button type="button" className="adm-btn-primary" onClick={clear}>＋ Add {isNews ? 'News' : 'Post'}</button>
    </header>
    {error && <div className="adm-login-error" role="alert">{error}</div>}
    <div className="adm-pub-main">
      <section className="adm-table-card adm-pub-list" aria-label={`${title} list`}>
        <div className="adm-pub-filters">
          <input type="search" aria-label={`Search ${isNews ? 'news' : 'blog posts'}`} placeholder={`Search ${isNews ? 'news' : 'blog posts'}...`} value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} />
          <select aria-label="Filter by category" value={category} onChange={event => { setCategory(event.target.value); setPage(1); }}><option value="All">All categories</option>{categories.map(value => <option key={value} value={value}>{value}</option>)}</select>
          <select aria-label="Filter by country" value={countryFilter} onChange={event => { setCountryFilter(event.target.value); setPage(1); }}><option value="All">All countries</option>{countries.map(value => <option key={value} value={value}>{value}</option>)}</select>
          <select aria-label="Filter by status" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="All">All statuses</option><option value="Published">Published</option><option value="Draft">Draft</option></select>
          <button type="button" className="adm-btn-secondary" onClick={() => { setSearch(''); setCategory('All'); setCountryFilter('All'); setStatus('All'); setPage(1); }}>Reset filters</button>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table adm-pub-table"><thead><tr><th>Image</th><th>Title</th><th>Category</th><th>Country</th><th>Status</th><th>Published</th><th>Actions</th></tr></thead>
            <tbody>{visibleItems.map(item => <tr key={item._id || item.slug}>
              <td>{item.image ? <img className="adm-pub-thumb" src={adminImg(item.image)} alt="" /> : <span className="adm-pub-thumb-empty">No image</span>}</td>
              <td><strong>{item.title}</strong></td><td>{item.category || '—'}</td><td>{item.country || 'Global / International'}</td>
              <td><span className={`adm-pub-status ${item.status}`}>{item.status || 'draft'}</span></td>
              <td>{dateLabel(item.createdAt)}</td>
              <td><button type="button" className="adm-btn-action" onClick={() => edit(item)}>Edit</button><button type="button" className="adm-btn-action red" onClick={() => remove(item)}>Delete</button></td>
            </tr>)}{!visibleItems.length && <tr><td colSpan="7" className="adm-pub-empty">{items.length ? 'No items match these filters.' : `No ${isNews ? 'news articles' : 'blog posts'} yet.`}</td></tr>}</tbody>
          </table>
        </div>
        <div className="adm-pagination" aria-label="Content pages"><span>Showing {filteredItems.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filteredItems.length)} of {filteredItems.length}</span><div><button type="button" className="adm-btn-action" disabled={page <= 1} onClick={() => setPage(current => Math.max(1, current - 1))}>Previous</button><span>Page {page} of {pageCount}</span><button type="button" className="adm-btn-action" disabled={page >= pageCount} onClick={() => setPage(current => Math.min(pageCount, current + 1))}>Next</button></div></div>
      </section>
      <form className="adm-cms-editor adm-pub-editor" onSubmit={save}>
        <div className="adm-pub-editor-head">{editing ? `Edit ${isNews ? 'news article' : 'blog post'}` : `Add ${isNews ? 'news article' : 'blog post'}`}</div>
        <div className="adm-pub-editor-fields">
          <label>Title *<input required minLength="3" maxLength="120" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} /></label>
          <label>Category<select required value={form.category} onChange={event => setForm({ ...form, category: event.target.value })}><option value="">Choose a category</option>{categories.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
          <label>Country<select value={form.country || 'Global / International'} onChange={event => setForm({ ...form, country: event.target.value === 'Global / International' ? '' : event.target.value })}><option value="Global / International">Global / International</option>{countries.filter(value => value !== 'Global / International').map(value => <option key={value} value={value}>{value}</option>)}</select><small>This field connects the post to the destination filter on the public {isNews ? 'news' : 'blog'} page.</small></label>
          <label>Featured image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={chooseImage} />{form.image && <small>Image selected</small>}</label>
          <div className="adm-pub-content-field"><label htmlFor="pub-content-editor">Content *</label><RichContentEditor key={editing || 'new'} id="pub-content-editor" resetKey={editing || 'new'} value={form.content} placeholder={`Write your ${isNews ? 'news article' : 'blog post'} here…`} onChange={content => setForm(current => ({ ...current, content }))} /><small>{form.content.length}/{maxChars} characters (formatting is included in the limit)</small></div>
          <label>Status<select value={form.status} onChange={event => setForm({ ...form, status: event.target.value })}><option value="published">Published</option><option value="draft">Draft</option></select></label>
          <div className="adm-pub-editor-actions"><button type="submit" className="adm-btn-primary" disabled={!editing && items.length >= maxCount}>{editing ? 'Save changes' : items.length >= maxCount ? 'Limit reached' : 'Save'}</button><button type="button" className="adm-btn-secondary" onClick={clear}>Cancel</button></div>
        </div>
      </form>
    </div>
  </section>;
}
