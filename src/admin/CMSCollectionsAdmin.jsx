import { useEffect, useState } from 'react';
import { api, adminImg } from '../api.js';
import { showAdminToast } from './adminToast.js';

const cmsImage = path => path?.startsWith('uploads/Award/') ? '/assets/' + path : import.meta.env.VITE_UPLOAD_BASE + '/' + path;
const MAX_HOME_BANNERS = 5;
const awardNames = ['Elite Leadership Award & Summit', 'Rising Bharat Awards', 'Global Leadership Awards', 'Indian Star Excellence', 'Millennium Brilliance', 'India Glory Awards', 'Indian Icon'];
const definitions = {
  home: {
    banner: { title: 'Banner', endpoint: 'banner', limit: Math.min(MAX_HOME_BANNERS, Number(import.meta.env.VITE_BANNER_MAX_COUNT || MAX_HOME_BANNERS)), fields: [['imageUrl', 'Banner image', 'image']] },
    reel: { title: 'Instagram reels', endpoint: 'reel', limit: Number(import.meta.env.VITE_REEL_MAX_COUNT || 20), fields: [['url', 'Instagram reel URL', 'url']] },
    testimonial: { title: 'Video testimonials', endpoint: 'testimonial', limit: Number(import.meta.env.VITE_TESTIMONIAL_MAX_COUNT || 20), fields: [['videoUrl', 'Testimonial video URL', 'url']] },
    review: { title: 'Reviews', endpoint: 'review', limit: Math.min(20, Number(import.meta.env.VITE_REVIEW_MAX_COUNT || 20)), fields: [['name', 'Reviewer name', 'text'], ['message', 'Review', 'textarea'], ['rating', 'Star rating', 'rating']] },
  },
  about: { 'team-image': { title: 'Team', endpoint: 'team-image', limit: Number(import.meta.env.VITE_TEAM_IMAGE_MAX_COUNT || 20), fields: [['imageUrl', 'Team image', 'image']] } },
};

async function uploadImage(file, token, category) {
  const data = new FormData(); data.append('category', category); data.append('file', file);
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
  const load = async () => { if (!config || (page === 'home' && kind === 'banner')) return; try { setItems(await api(`/admin/${config.endpoint}`, { token })); } catch (e) { setNotice(e.message); } };
  useEffect(() => { load(); }, [page, kind]);
  const save = async event => {
    event.preventDefault(); setNotice('');
    try {
      const next = { ...form };
      for (const [key, label, type] of config.fields) {
        const value = next[key];
        if (type === 'image' && !editing && !next.imageFile) throw new Error(`${label} is required.`);
        if (type === 'text' && String(value || '').trim().length < 2) throw new Error(`${label} must contain at least 2 characters.`);
        if (type === 'textarea' && String(value || '').trim().length < 5) throw new Error(`${label} must contain at least 5 characters.`);
        if (type === 'url') { try { const parsed = new URL(String(value || '').trim()); if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error(); } catch { throw new Error(`Enter a valid https URL for ${label}.`); } }
      }
      if (next.imageFile && (!next.imageFile.type.startsWith('image/') || next.imageFile.size > 5 * 1024 * 1024)) throw new Error('Choose an image file smaller than 5 MB.');
      if (config.fields[0][2] === 'image' && next.imageFile) next.imageUrl = await uploadImage(next.imageFile, token, kind === 'banner' ? 'banner' : 'team');
      delete next.imageFile;
      if (kind === 'reel') next.urls = [next.url];
      if (kind === 'review') { next.rating = Number(next.rating || 5); next.name = next.name.trim(); if (next.message.length > 300) throw new Error('Review text must be 300 characters or fewer.'); }
      delete next.url;
      await api(`/admin/${config.endpoint}`, { method: 'POST', body: { ...next, ...(editing ? { _id: editing } : {}) }, token });
      setEditing(null); setForm({}); await load(); setNotice(`${config.title} saved successfully.`); showAdminToast(`${config.title} saved successfully.`);
    } catch (e) { setNotice(e.message || 'Could not save this item.'); showAdminToast(e.message || 'Could not save this item.', 'error'); }
  };
  const remove = async item => { if (!window.confirm('Delete this item?')) return; try { await api(`/admin/${config.endpoint}/${item._id}`, { method: 'DELETE', token }); await load(); showAdminToast(`${config.title} deleted.`); } catch (e) { setNotice(e.message); showAdminToast(e.message || 'Could not delete this item.', 'error'); } };
  const beginEdit = item => {
    setEditing(item._id);
    const value = kind === 'reel' ? (item.urls || [])[0] || '' : (item.imageUrl || item.videoUrl || item.message || '');
    setForm(kind === 'review' ? { name: item.name || '', message: item.message || '', rating: item.rating || 5 } : kind === 'reel' ? { url: value } : { [config.fields[0][0]]: value });
    showAdminToast('Item loaded for editing.');
  };
  if (page === 'awards') return <AwardsSections token={token} />;
  if (page === 'home' && kind === 'banner') {
    return <div className="adm-cms-collection">
      <nav className="adm-cms-section-tabs" aria-label="Page sections">{sections.map(section => <button key={section} type="button" className={`adm-cms-section-tab${kind === section ? ' active' : ''}`} onClick={() => { setKind(section); setEditing(null); setForm({}); setNotice(''); }}>{collections[section]?.title || section}</button>)}</nav>
      <BannerCollectionAdmin token={token} />
    </div>;
  }
  const atLimit = !editing && items.length >= config.limit;
  return <div className="adm-cms-collection">
    <nav className="adm-cms-section-tabs" aria-label="Page sections">{sections.map(section => <button key={section} type="button" className={`adm-cms-section-tab${kind === section ? ' active' : ''}`} onClick={() => { setKind(section); setEditing(null); setForm({}); setNotice(''); }}>{collections[section]?.title || section}</button>)}</nav>
    <div className="adm-section-heading"><div><h3>{config.title}</h3><p>Add, edit, or remove {config.title.toLowerCase()} for this page. You can manage up to {config.limit} items.</p></div></div>
    {notice && <p className="adm-cms-notice" role="status">{notice}</p>}
    <form className="adm-cms-editor" onSubmit={save}><div className="adm-seo-edit-header"><h3>{editing ? 'Update item' : 'Add item'}</h3>{editing && <button type="button" className="adm-btn-action" onClick={() => { setEditing(null); setForm({}); }}>Cancel</button>}</div>
      <div className="adm-editor-grid">{config.fields.map(([key, label, type]) => <div className="adm-form-group" key={key}><label htmlFor={`cms-${key}`}>{label}</label>{type === 'image' ? <><input id={`cms-${key}`} type="file" accept="image/jpeg,image/png,image/webp,image/gif" required={!editing} onChange={e => setForm({ ...form, imageFile: e.target.files?.[0] })} />{editing && !form.imageFile && <small>Current image will be kept. Select a file to replace it. Maximum 5 MB.</small>}</> : type === 'textarea' ? <><textarea id={`cms-${key}`} required minLength={5} maxLength={300} rows="4" placeholder="Write a concise client review (up to 300 characters)." value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} /><small>{(form[key] || '').length}/300</small></> : type === 'rating' ? <select id={`cms-${key}`} required value={form[key] || 5} onChange={e => setForm({ ...form, [key]: Number(e.target.value) })}>{[1, 2, 3, 4, 5].map(rating => <option key={rating} value={rating}>{rating} {rating === 1 ? 'star' : 'stars'}</option>)}</select> : type === 'text' ? <input id={`cms-${key}`} required minLength={2} maxLength="100" value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} /> : <input id={`cms-${key}`} required type="url" maxLength="500" placeholder={kind === 'reel' ? 'https://www.instagram.com/reel/.../' : 'https://www.youtube.com/watch?v=...'} value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} />}</div>)}</div>
      <button type="submit" className="adm-btn-primary" disabled={atLimit}>{atLimit ? 'Limit reached' : editing ? 'Save changes' : 'Add item'}</button>
    </form>
    <div className="adm-cms-card-list">{items.map(item => <article className="adm-cms-item-card" key={item._id}>{item.imageUrl && <img src={`${import.meta.env.VITE_UPLOAD_BASE}/${item.imageUrl}`} alt="CMS item" />}{item.videoUrl && <span className="adm-cms-item-icon">Video</span>}<div className="adm-cms-item-copy"><strong>{kind === 'review' ? `${item.name || 'Reviewer'} - ${item.rating || 5} stars` : item.message || item.urls?.[0] || item.videoUrl || 'Uploaded image'}</strong><span>{item.message || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : config.title)}</span></div><div className="adm-cms-item-actions"><button className="adm-btn-action" type="button" onClick={() => beginEdit(item)}>Edit</button><button className="adm-btn-action red" type="button" onClick={() => remove(item)}>Delete</button></div></article>)}{!items.length && <p className="adm-cms-empty">No {config.title.toLowerCase()} added yet.</p>}</div>
  </div>;
}

function BannerCollectionAdmin({ token }) {
  const configuredLimit = Number(import.meta.env.VITE_BANNER_MAX_COUNT || MAX_HOME_BANNERS);
  const limit = Number.isFinite(configuredLimit) ? Math.min(MAX_HOME_BANNERS, Math.max(0, Math.floor(configuredLimit))) : MAX_HOME_BANNERS;
  const [items, setItems] = useState([]);
  const [files, setFiles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editFile, setEditFile] = useState(null);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const load = async () => {
    try {
      setItems(await api('/admin/banner', { token }));
    } catch (error) {
      setNotice(error.message || 'Could not load homepage banners.');
    }
  };
  useEffect(() => { load(); }, []);

  const save = async event => {
    event.preventDefault();
    setNotice('');
    setSaving(true);
    if (editing) {
      try {
        const current = items.find(item => item._id === editing);
        if (!current) throw new Error('The banner could not be found. Reload the banner list and try again.');
        const imageUrl = editFile ? await uploadImage(editFile, token, 'banner') : current.imageUrl;
        await api('/admin/banner', {
          method: 'POST',
          body: { _id: editing, imageUrl, displayOrder: current.displayOrder || 0, altText: current.altText || '', linkUrl: current.linkUrl || '' },
          token,
        });
        setEditing(null);
        setEditFile(null);
        await load();
        setNotice('Homepage banner updated successfully.');
        showAdminToast('Homepage banner updated successfully.');
      } catch (error) {
        setNotice(error.message || 'Could not update homepage banner.');
        showAdminToast(error.message || 'Could not update homepage banner.', 'error');
      } finally {
        setSaving(false);
      }
      return;
    }

    const batch = files;
    let savedCount = 0;
    try {
      if (!batch.length) throw new Error('Choose at least one banner image.');
      for (const file of batch) {
        const imageUrl = await uploadImage(file, token, 'banner');
        await api('/admin/banner', {
          method: 'POST',
          body: { imageUrl, displayOrder: items.length + savedCount },
          token,
        });
        savedCount += 1;
        setFiles(batch.slice(savedCount));
      }
      await load();
      setNotice(`${savedCount} homepage banner${savedCount === 1 ? '' : 's'} added successfully.`);
      showAdminToast(`${savedCount} homepage banner${savedCount === 1 ? '' : 's'} added successfully.`);
    } catch (error) {
      await load();
      const message = savedCount
        ? `${savedCount} of ${batch.length} banners were added. ${error.message}`
        : error.message || 'Could not add homepage banners.';
      setNotice(message);
      showAdminToast(message, 'error');
    } finally {
      setSaving(false);
      if (savedCount === batch.length) setFiles([]);
    }
  };

  const remove = async item => {
    if (!window.confirm('Delete this homepage banner?')) return;
    try {
      await api(`/admin/banner/${item._id}`, { method: 'DELETE', token });
      await load();
      showAdminToast('Homepage banner deleted.');
    } catch (error) {
      setNotice(error.message || 'Could not delete homepage banner.');
      showAdminToast(error.message || 'Could not delete homepage banner.', 'error');
    }
  };

  const remaining = Math.max(0, limit - items.length);
  return <>
    <div className="adm-section-heading"><div><h3>Homepage banners</h3><p>Upload up to {limit} banners. Select multiple images to add them in one batch. Each image must be 5 MB or smaller.</p></div></div>
    {notice && <p className="adm-cms-notice" role="status">{notice}</p>}
    <form className="adm-cms-editor" onSubmit={save}>
      <div className="adm-seo-edit-header">
        <h3>{editing ? 'Update banner' : 'Add homepage banners'}</h3>
        <span>{items.length} / {limit} added</span>
        {editing && <button type="button" className="adm-btn-action" onClick={() => { setEditing(null); setEditFile(null); setNotice(''); }}>Cancel</button>}
      </div>
      <div className="adm-form-group">
        <label htmlFor="cms-banner-files">{editing ? 'Replace banner image (optional)' : 'Select banner images'}</label>
        <input
          id="cms-banner-files"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple={!editing}
          required={!editing}
          disabled={saving || (!editing && remaining === 0)}
          onChange={event => {
            const selected = Array.from(event.target.files || []);
            const invalid = selected.find(file => !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024);
            if (invalid) {
              setNotice(`${invalid.name} is not a supported image or exceeds the 5 MB limit.`);
              if (editing) setEditFile(null);
              else setFiles([]);
            } else if (editing) {
              setEditFile(selected[0] || null);
              setNotice('');
            } else {
              if (selected.length > remaining) setNotice(`Only ${remaining} more banner${remaining === 1 ? '' : 's'} can be added.`);
              else setNotice('');
              setFiles(selected.slice(0, remaining));
            }
            event.target.value = '';
          }}
        />
        {!editing && <small>Choose up to {remaining} more image{remaining === 1 ? '' : 's'}.</small>}
      </div>
      {editing && <p>Current banner image will be kept if you do not select a replacement.</p>}
      {!editing && files.length > 0 && <p>{files.length} image{files.length === 1 ? '' : 's'} ready to upload.</p>}
      <button type="submit" className="adm-btn-primary" disabled={saving || (!editing && (!files.length || remaining === 0))}>
        {saving ? 'Saving banners...' : editing ? 'Save changes' : `Upload ${files.length || ''} banner${files.length === 1 ? '' : 's'}`}
      </button>
    </form>
    <div className="adm-cms-card-list">
      {items.map((item, index) => <article className="adm-cms-item-card" key={item._id}>
        <img src={adminImg(item.imageUrl)} alt={item.altText || `Homepage banner ${index + 1}`} />
        <div className="adm-cms-item-copy"><strong>Homepage banner {index + 1}</strong><span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Active on the home page'}</span></div>
        <div className="adm-cms-item-actions">
          <button className="adm-btn-action" type="button" onClick={() => { setEditing(item._id); setEditFile(null); setNotice(''); }}>Edit</button>
          <button className="adm-btn-action red" type="button" onClick={() => remove(item)}>Delete</button>
        </div>
      </article>)}
      {!items.length && <p className="adm-cms-empty">No homepage banners added yet.</p>}
    </div>
  </>;
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
      const uploaded = await Promise.all(pending.map(file => uploadImage(file, token, 'awards')));
      const images = [...current, ...uploaded].slice(0, maxImages);
      await api(`/admin/cms/awards/${encodeURIComponent(section)}`, { method: 'POST', body: { images }, token });
      setPending([]); await load(); setNotice('Award images saved successfully.');
      showAdminToast('Award images saved successfully.');
    } catch (e) { setNotice(e.message || 'Could not save award images.'); showAdminToast(e.message || 'Could not save award images.', 'error'); }
  };
  const remove = async image => {
    try { await api(`/admin/cms/awards/${encodeURIComponent(section)}`, { method: 'POST', body: { images: current.filter(item => item !== image) }, token }); await load(); setNotice('Award image removed.'); showAdminToast('Award image removed.'); }
    catch (e) { setNotice(e.message); showAdminToast(e.message || 'Could not remove award image.', 'error'); }
  };
  return <div className="adm-cms-collection">
    <nav className="adm-cms-section-tabs" aria-label="Award sections">{awardNames.map(name => <button type="button" key={name} className={`adm-cms-section-tab${section === name ? ' active' : ''}`} onClick={() => { setSection(name); setPending([]); }}>{name}</button>)}</nav>
    <div className="adm-section-heading"><div><h3>{section}</h3><p>Upload award images only. Maximum {maxImages} images in this existing section.</p></div></div>
    {notice && <p className="adm-cms-notice" role="status">{notice}</p>}
    <div className="adm-cms-editor"><label className="adm-form-group"><span>Add award images</span><input type="file" accept="image/*" multiple onChange={addImages} disabled={current.length >= maxImages} /></label><div className="adm-award-image-grid">{current.map(src => <figure key={src}><img src={cmsImage(src)} alt={`${section} award`} /><button className="adm-btn-action red" type="button" onClick={() => remove(src)}>Remove</button></figure>)}{pending.map((file, index) => <figure key={`${file.name}-${index}`}><img src={URL.createObjectURL(file)} alt={file.name} /><figcaption>Ready to upload</figcaption></figure>)}</div><button type="button" className="adm-btn-primary" onClick={save} disabled={!pending.length}>Upload and save</button></div>
  </div>;
}
