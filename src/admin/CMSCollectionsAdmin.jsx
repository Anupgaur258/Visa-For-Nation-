import { useEffect, useState } from 'react';
import { api } from '../api.js';

const cmsImage = path => path?.startsWith('uploads/Award/') ? '/assets/' + path : import.meta.env.VITE_UPLOAD_BASE + '/' + path;
const awardNames = ['Elite Leadership Award & Summit', 'Rising Bharat Awards', 'Global Leadership Awards', 'Indian Star Excellence', 'Millennium Brilliance', 'India Glory Awards', 'Indian Icon'];
const definitions = {
  home: {
    banner: { title: 'Banner', endpoint: 'banner', limit: Number(import.meta.env.VITE_BANNER_MAX_COUNT || 20), fields: [['imageUrl', 'Banner image', 'image']] },
    reel: { title: 'Instagram reels', endpoint: 'reel', limit: Number(import.meta.env.VITE_REEL_MAX_COUNT || 20), fields: [['url', 'Instagram reel URL', 'url']] },
    testimonial: { title: 'Video testimonials', endpoint: 'testimonial', limit: Number(import.meta.env.VITE_TESTIMONIAL_MAX_COUNT || 20), fields: [['videoUrl', 'Testimonial video URL', 'url']] },
    review: { title: 'Reviews', endpoint: 'review', limit: Number(import.meta.env.VITE_REVIEW_MAX_COUNT || 20), fields: [['message', 'Review text', 'textarea']] },
  },
  about: { 'team-image': { title: 'Team', endpoint: 'team-image', limit: Number(import.meta.env.VITE_TEAM_IMAGE_MAX_COUNT || 20), fields: [['imageUrl', 'Team image', 'image']] } },
};

async function uploadImage(file, token) {
  const data = new FormData(); data.append('file', file);
  const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: data });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || 'Image upload failed.');
  return result.path;
}

export default function CMSCollectionsAdmin({ page, sections }) {
  const token = localStorage.getItem('vfn-admin-token');
  const collections = definitions[page] || {};
  const [kind, setKind] = useState(sections[0] || '');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');
  const config = collections[kind];
  const load = async () => { if (!config) return; try { setItems(await api(`/admin/${config.endpoint}`, { token })); } catch (e) { setNotice(e.message); } };
  useEffect(() => { load(); }, [page, kind]);
  const save = async event => {
    event.preventDefault(); setNotice('');
    try {
      const next = { ...form };
      if (config.fields[0][2] === 'image' && next.imageFile) next.imageUrl = await uploadImage(next.imageFile, token);
      delete next.imageFile;
      if (kind === 'reel') next.urls = [next.url];
      if (kind === 'review') { next.name = 'Client'; next.rating = 5; if (next.message.length > 300) throw new Error('Review text must be 300 characters or fewer.'); }
      delete next.url;
      await api(`/admin/${config.endpoint}`, { method: 'POST', body: { ...next, ...(editing ? { _id: editing } : {}) }, token });
      setEditing(null); setForm({}); await load(); setNotice(`${config.title} saved successfully.`);
    } catch (e) { setNotice(e.message || 'Could not save this item.'); }
  };
  const remove = async item => { if (!window.confirm('Delete this item?')) return; try { await api(`/admin/${config.endpoint}/${item._id}`, { method: 'DELETE', token }); await load(); } catch (e) { setNotice(e.message); } };
  const beginEdit = item => {
    setEditing(item._id);
    const value = kind === 'reel' ? (item.urls || [])[0] || '' : (item.imageUrl || item.videoUrl || item.message || '');
    setForm(kind === 'review' ? { message: value } : kind === 'reel' ? { url: value } : { [config.fields[0][0]]: value });
  };
  if (page === 'awards') return <AwardsSections token={token} />;
  const atLimit = !editing && items.length >= config.limit;
  return <div className="adm-cms-collection">
    <nav className="adm-cms-section-tabs" aria-label="Page sections">{sections.map(section => <button key={section} type="button" className={`adm-cms-section-tab${kind === section ? ' active' : ''}`} onClick={() => { setKind(section); setEditing(null); setForm({}); setNotice(''); }}>{collections[section]?.title || section}</button>)}</nav>
    <div className="adm-section-heading"><div><h3>{config.title}</h3><p>Up to {config.limit} items, managed with image uploads and validated fields.</p></div></div>
    {notice && <p className="adm-cms-notice" role="status">{notice}</p>}
    <form className="adm-cms-editor" onSubmit={save}><div className="adm-seo-edit-header"><h3>{editing ? 'Update item' : 'Add item'}</h3>{editing && <button type="button" className="adm-btn-action" onClick={() => { setEditing(null); setForm({}); }}>Cancel</button>}</div>
      <div className="adm-editor-grid">{config.fields.map(([key, label, type]) => <div className="adm-form-group" key={key}><label htmlFor={`cms-${key}`}>{label}</label>{type === 'image' ? <><input id={`cms-${key}`} type="file" accept="image/*" required={!editing} onChange={e => setForm({ ...form, imageFile: e.target.files?.[0] })} />{editing && !form.imageFile && <small>Current image will be kept. Select a file to replace it.</small>}</> : type === 'textarea' ? <><textarea id={`cms-${key}`} required maxLength={300} rows="4" placeholder="Write a concise client review (up to 300 characters)." value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} /><small>{(form[key] || '').length}/300</small></> : <input id={`cms-${key}`} required type="url" maxLength="500" placeholder={kind === 'reel' ? 'https://www.instagram.com/reel/…/' : 'https://www.youtube.com/watch?v=…'} value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} />}</div>)}</div>
      <button type="submit" className="adm-btn-primary" disabled={atLimit}>{atLimit ? 'Limit reached' : editing ? 'Save changes' : 'Add item'}</button>
    </form>
    <div className="adm-cms-card-list">{items.map(item => <article className="adm-cms-item-card" key={item._id}>{item.imageUrl && <img src={`${import.meta.env.VITE_UPLOAD_BASE}/${item.imageUrl}`} alt="CMS item" />}{item.videoUrl && <span className="adm-cms-item-icon">Video</span>}<div className="adm-cms-item-copy"><strong>{item.message || item.urls?.[0] || item.videoUrl || 'Uploaded image'}</strong><span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : config.title}</span></div><div className="adm-cms-item-actions"><button className="adm-btn-action" type="button" onClick={() => beginEdit(item)}>Edit</button><button className="adm-btn-action red" type="button" onClick={() => remove(item)}>Delete</button></div></article>)}{!items.length && <p className="adm-cms-empty">No {config.title.toLowerCase()} added yet.</p>}</div>
  </div>;
}

function AwardsSections({ token }) {
  const maxImages = Number(import.meta.env.VITE_AWARD_SECTION_MAX_COUNT || 20);
  const [section, setSection] = useState(awardNames[0]);
  const [sections, setSections] = useState({});
  const [pending, setPending] = useState([]);
  const [notice, setNotice] = useState('');
  const load = async () => { try { setSections(await api('/admin/cms/awards', { token }) || {}); } catch (e) { setNotice(e.message); } };
  useEffect(() => { load(); }, []);
  const current = Array.isArray(sections[section]?.images) ? sections[section].images : [];
  const addImages = e => { setPending([...pending, ...Array.from(e.target.files || [])].slice(0, Math.max(0, maxImages - current.length))); e.target.value = ''; };
  const save = async () => {
    try {
      const uploaded = await Promise.all(pending.map(file => uploadImage(file, token)));
      const images = [...current, ...uploaded].slice(0, maxImages);
      await api(`/admin/cms/awards/${encodeURIComponent(section)}`, { method: 'POST', body: { images }, token });
      setPending([]); await load(); setNotice('Award images saved successfully.');
    } catch (e) { setNotice(e.message || 'Could not save award images.'); }
  };
  const remove = async image => {
    try { await api(`/admin/cms/awards/${encodeURIComponent(section)}`, { method: 'POST', body: { images: current.filter(item => item !== image) }, token }); await load(); setNotice('Award image removed.'); }
    catch (e) { setNotice(e.message); }
  };
  return <div className="adm-cms-collection">
    <nav className="adm-cms-section-tabs" aria-label="Award sections">{awardNames.map(name => <button type="button" key={name} className={`adm-cms-section-tab${section === name ? ' active' : ''}`} onClick={() => { setSection(name); setPending([]); }}>{name}</button>)}</nav>
    <div className="adm-section-heading"><div><h3>{section}</h3><p>Upload award images only. Maximum {maxImages} images in this existing section.</p></div></div>
    {notice && <p className="adm-cms-notice" role="status">{notice}</p>}
    <div className="adm-cms-editor"><label className="adm-form-group"><span>Add award images</span><input type="file" accept="image/*" multiple onChange={addImages} disabled={current.length >= maxImages} /></label><div className="adm-award-image-grid">{current.map(src => <figure key={src}><img src={cmsImage(src)} alt={`${section} award`} /><button className="adm-btn-action red" type="button" onClick={() => remove(src)}>Remove</button></figure>)}{pending.map((file, index) => <figure key={`${file.name}-${index}`}><img src={URL.createObjectURL(file)} alt={file.name} /><figcaption>Ready to upload</figcaption></figure>)}</div><button type="button" className="adm-btn-primary" onClick={save} disabled={!pending.length}>Upload and save</button></div>
  </div>;
}