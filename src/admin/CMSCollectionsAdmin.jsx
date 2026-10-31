import { useEffect, useState } from 'react';
import { api, adminImg, img } from '../api.js';
import { showAdminToast } from './adminToast.js';
import HomeReelsAdmin from './HomeReelsAdmin.jsx';
import TestimonialsAdmin from './TestimonialsAdmin.jsx';
import GalleryAdmin from './GalleryAdmin.jsx';
import { HOME_GOAL_CARDS } from '../data/home.js';

const cmsImage = path => path?.startsWith('uploads/Award/banner/') ? '/assets/images/pages/about/awards/events/' + path.slice('uploads/Award/banner/'.length) : path?.startsWith('uploads/Award/') ? '/assets/images/pages/about/awards/' + path.slice('uploads/Award/'.length) : adminImg(path);
const MAX_HOME_BANNERS = 5;
const ADMIN_PAGE_SIZE = Math.max(1, Math.floor(Number(import.meta.env.VITE_ADMIN_PAGE_SIZE || 10)));
const REVIEW_MAX_MESSAGE_CHARS = Math.max(1, Number(import.meta.env.VITE_REVIEW_MAX_MESSAGE_CHARS || 500));
const awardNames = ['Elite Leadership Award & Summit', 'Rising Bharat Awards', 'Global Leadership Awards', 'Indian Star Excellence', 'Millennium Brilliance', 'India Glory Awards', 'Indian Icon'];
const definitions = {
  home: {
    banner: { title: 'Banner', endpoint: 'banner', limit: Math.min(MAX_HOME_BANNERS, Number(import.meta.env.VITE_BANNER_MAX_COUNT || MAX_HOME_BANNERS)), fields: [['imageUrl', 'Banner image', 'image']] },
    goals: { title: 'Goal cards', endpoint: 'cms/home/goals' },
    reel: { title: 'Instagram reels', endpoint: 'reel', limit: Number(import.meta.env.VITE_REEL_MAX_COUNT || 20), fields: [['url', 'Instagram reel URL', 'url']] },
    testimonial: { title: 'Video testimonials', endpoint: 'testimonial', limit: Number(import.meta.env.VITE_TESTIMONIAL_MAX_COUNT || 20), fields: [['videoUrl', 'Testimonial video URL', 'url']] },
    review: { title: 'Reviews', endpoint: 'review', limit: Math.min(20, Number(import.meta.env.VITE_REVIEW_MAX_COUNT || 20)), fields: [['name', 'Reviewer name', 'text'], ['message', 'Review', 'textarea'], ['rating', 'Star rating', 'rating']] },
  },
  about: { 'team-image': { title: 'Team', endpoint: 'team-image', limit: Number(import.meta.env.VITE_TEAM_IMAGE_MAX_COUNT || 20), fields: [['imageUrl', 'Team image', 'image']] } },
  gallery: { gallery: { title: 'Gallery', endpoint: 'cms/gallery/gallery', limit: Number(import.meta.env.VITE_GALLERY_MAX_COUNT || 50), fields: [['imageUrl', 'Gallery image', 'image']] } },
};

async function uploadImage(file, token, category) {
  const data = new FormData(); data.append('category', category); data.append('file', file);
  let response;
  try {
    response = await fetch(`${import.meta.env.VITE_API_URL}/admin/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: data });
  } catch (error) {
    if (error instanceof TypeError) throw new Error(`The admin API could not be reached at ${import.meta.env.VITE_API_URL}. Check that Backend is running. The upload may have completed; retry the banner upload to save it to the homepage.`);
    throw error;
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || 'Image upload failed.');
  return result.path;
}

export default function CMSCollectionsAdmin({ page, sections }) {
  const token = localStorage.getItem('vfn-admin-token');
  const collections = definitions[page] || {};
  const [kind, setKind] = useState(sections[0] || '');
  const [items, setItems] = useState([]);
  const [listPage, setListPage] = useState(1);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');
  const config = collections[kind];
  const load = async () => { if (!config || (page === 'home' && ['banner', 'goals'].includes(kind))) return; try { setItems(await api(`/admin/${config.endpoint}`, { token })); } catch (e) { setNotice(e.message); } };
  useEffect(() => { setListPage(1); load(); }, [page, kind]);
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
      if (kind === 'review') { next.rating = Number(next.rating || 5); next.name = next.name.trim(); if (next.message.length > REVIEW_MAX_MESSAGE_CHARS) throw new Error(`Review text must be ${REVIEW_MAX_MESSAGE_CHARS} characters or fewer.`); }
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
  if (page === 'gallery') return <GalleryAdmin />;
  if (page === 'home' && ['reel', 'testimonial'].includes(kind)) {
    const Editor = kind === 'reel' ? HomeReelsAdmin : TestimonialsAdmin;
    return <div className="adm-cms-collection">
      <nav className="adm-cms-section-tabs" aria-label="Page sections">{sections.map(section => <button key={section} type="button" className={`adm-cms-section-tab${kind === section ? ' active' : ''}`} onClick={() => { setKind(section); setEditing(null); setForm({}); setNotice(''); }}>{collections[section]?.title || section}</button>)}</nav>
      <Editor />
    </div>;
  }
  if (page === 'home' && kind === 'goals') {
    return <div className="adm-cms-collection">
      <nav className="adm-cms-section-tabs" aria-label="Page sections">{sections.map(section => <button key={section} type="button" className={`adm-cms-section-tab${kind === section ? ' active' : ''}`} onClick={() => { setKind(section); setEditing(null); setForm({}); setNotice(''); }}>{collections[section]?.title || section}</button>)}</nav>
      <GoalCardsAdmin token={token} />
    </div>;
  }
  if (page === 'home' && kind === 'banner') {
    return <div className="adm-cms-collection">
      <nav className="adm-cms-section-tabs" aria-label="Page sections">{sections.map(section => <button key={section} type="button" className={`adm-cms-section-tab${kind === section ? ' active' : ''}`} onClick={() => { setKind(section); setEditing(null); setForm({}); setNotice(''); }}>{collections[section]?.title || section}</button>)}</nav>
      <BannerCollectionAdmin token={token} />
    </div>;
  }
  const atLimit = !editing && items.length >= config.limit;
  const listPages = Math.max(1, Math.ceil(items.length / ADMIN_PAGE_SIZE));
  const visibleItems = items.slice((listPage - 1) * ADMIN_PAGE_SIZE, listPage * ADMIN_PAGE_SIZE);
  return <div className="adm-cms-collection">
    <nav className="adm-cms-section-tabs" aria-label="Page sections">{sections.map(section => <button key={section} type="button" className={`adm-cms-section-tab${kind === section ? ' active' : ''}`} onClick={() => { setKind(section); setEditing(null); setForm({}); setNotice(''); }}>{collections[section]?.title || section}</button>)}</nav>
    <div className="adm-section-heading"><div><h3>{config.title}</h3><p>Add, edit, or remove {config.title.toLowerCase()} for this page. You can manage up to {config.limit} items.</p></div></div>
    {notice && <p className="adm-cms-notice" role="status">{notice}</p>}
    <form className="adm-cms-editor" onSubmit={save}><div className="adm-seo-edit-header"><h3>{editing ? 'Update item' : 'Add item'}</h3>{editing && <button type="button" className="adm-btn-action" onClick={() => { setEditing(null); setForm({}); }}>Cancel</button>}</div>
      <div className="adm-editor-grid">{config.fields.map(([key, label, type]) => <div className="adm-form-group" key={key}><label htmlFor={`cms-${key}`}>{label}</label>{type === 'image' ? <><input id={`cms-${key}`} type="file" accept="image/jpeg,image/png,image/webp,image/gif" required={!editing} onChange={e => setForm({ ...form, imageFile: e.target.files?.[0] })} /><small>{page === 'about' ? 'Image size: 800 × 800 px (square portrait). ' : ''}{editing && !form.imageFile ? 'Current image will be kept. Select a file to replace it. ' : ''}Maximum 5 MB.</small></> : type === 'textarea' ? <><textarea id={`cms-${key}`} required minLength={5} maxLength={REVIEW_MAX_MESSAGE_CHARS} rows="4" placeholder={`Write a concise client review (up to ${REVIEW_MAX_MESSAGE_CHARS} characters).`} value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} /><small>{(form[key] || '').length}/{REVIEW_MAX_MESSAGE_CHARS}</small></> : type === 'rating' ? <select id={`cms-${key}`} required value={form[key] || 5} onChange={e => setForm({ ...form, [key]: Number(e.target.value) })}>{[1, 2, 3, 4, 5].map(rating => <option key={rating} value={rating}>{rating} {rating === 1 ? 'star' : 'stars'}</option>)}</select> : type === 'text' ? <input id={`cms-${key}`} required minLength={2} maxLength="100" value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} /> : <input id={`cms-${key}`} required type="url" maxLength="500" placeholder={kind === 'reel' ? 'https://www.instagram.com/reel/.../' : 'https://www.youtube.com/watch?v=...'} value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} />}</div>)}</div>
      <button type="submit" className="adm-btn-primary" disabled={atLimit}>{atLimit ? 'Limit reached' : editing ? 'Save changes' : 'Add item'}</button>
    </form>
    <div className="adm-cms-card-list">{visibleItems.map(item => <article className="adm-cms-item-card" key={item._id}>{item.imageUrl && <img src={adminImg(item.imageUrl)} alt="CMS item" />}{item.videoUrl && <span className="adm-cms-item-icon">Video</span>}<div className="adm-cms-item-copy"><strong>{kind === 'review' ? `${item.name || 'Reviewer'} - ${item.rating || 5} stars` : item.message || item.urls?.[0] || item.videoUrl || 'Uploaded image'}</strong><span>{item.message || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : config.title)}</span></div><div className="adm-cms-item-actions"><button className="adm-btn-action" type="button" onClick={() => beginEdit(item)}>Edit</button><button className="adm-btn-action red" type="button" onClick={() => remove(item)}>Delete</button></div></article>)}{!items.length && <p className="adm-cms-empty">No {config.title.toLowerCase()} added yet.</p>}</div>
    {items.length > ADMIN_PAGE_SIZE && <nav className="adm-pagination" aria-label="CMS item pages"><span>Page {listPage} of {listPages}</span><div><button type="button" className="adm-btn-action" disabled={listPage <= 1} onClick={() => setListPage(page => Math.max(1, page - 1))}>Previous</button><button type="button" className="adm-btn-action" disabled={listPage >= listPages} onClick={() => setListPage(page => Math.min(listPages, page + 1))}>Next</button></div></nav>}
  </div>;
}

function BannerCollectionAdmin({ token }) {
  const configuredLimit = Number(import.meta.env.VITE_BANNER_MAX_COUNT || MAX_HOME_BANNERS);
  const limit = Number.isFinite(configuredLimit) ? Math.min(MAX_HOME_BANNERS, Math.max(0, Math.floor(configuredLimit))) : MAX_HOME_BANNERS;
  const [items, setItems] = useState([]);
  const [listPage, setListPage] = useState(1);
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
          body: { _id: editing, imageUrl, eyebrow: '', title: '', accentText: '', description: '', overlayText: '', displayOrder: current.displayOrder || 0, altText: '', linkUrl: '' },
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
          body: { imageUrl, eyebrow: '', title: '', accentText: '', description: '', overlayText: '', displayOrder: items.length + savedCount },
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
    <div className="adm-section-heading"><div><h3>Homepage banners</h3><p>Upload up to {limit} banner images. Image size: 1920 × 700 px; keep important text and subjects near the center for mobile cropping. Each image must be 5 MB or smaller.</p></div></div>
    {notice && <p className="adm-cms-notice" role="status">{notice}</p>}
    <form className="adm-cms-editor" onSubmit={save}>
      <div className="adm-seo-edit-header">
        <h3>{editing ? 'Update banner' : 'Add homepage banner'}</h3>
        <span>{items.length} / {limit} added</span>
        {editing && <button type="button" className="adm-btn-action" onClick={() => { setEditing(null); setEditFile(null); setFiles([]); setNotice(''); }}>Cancel</button>}
      </div>
      <div className="adm-form-group">
        <label htmlFor="cms-banner-files">{editing ? 'Replace banner image (optional)' : 'Upload banner image'}</label>
        <input
          id="cms-banner-files"
          type="file"
          accept="image/*"
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
              setNotice('');
              setFiles(selected.slice(0, 1));
            }
            event.target.value = '';
          }}
        />
        {!editing && <small>Choose one image per upload. Image size: 1920 × 700 px. Maximum file size: 5 MB.</small>}
      </div>
      {editing && <p>Current banner image will be kept if you do not select a replacement.</p>}
      {!editing && files.length > 0 && <div className="adm-cms-selected-files" aria-live="polite"><strong>Image ready to upload</strong><ul>{files.map((file, index) => <li key={`${file.name}-${index}`}>{file.name}</li>)}</ul></div>}
      {editing && editFile && <p className="adm-cms-selected-files" aria-live="polite">Replacement selected: <strong>{editFile.name}</strong></p>}
      <button type="submit" className="adm-btn-primary" disabled={saving || (!editing && (!files.length || remaining === 0))}>
        {saving ? 'Saving banner...' : editing ? 'Save changes' : 'Upload banner'}
      </button>
    </form>
    <div className="adm-cms-card-list adm-cms-banner-list">
      {items.map((item, index) => <article className="adm-cms-item-card adm-cms-banner-card" key={item._id}>
        <img src={adminImg(item.imageUrl)} alt={item.altText || `Homepage banner ${index + 1}`} />
        <div className="adm-cms-item-copy"><strong>{item.title || item.overlayText || `Homepage banner ${index + 1}`}{item.accentText ? ` ${item.accentText}` : ''}</strong><span>{item.description || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Active on the home page')}</span></div>
        <div className="adm-cms-item-actions">
          <button className="adm-btn-action" type="button" onClick={() => { setEditing(item._id); setEditFile(null); setFiles([]); setNotice(''); }}>Edit</button>
          <button className="adm-btn-action red" type="button" onClick={() => remove(item)}>Delete</button>
        </div>
      </article>)}
      {!items.length && <p className="adm-cms-empty">No homepage banners added yet.</p>}
    </div>
  </>;
}

function GoalCardsAdmin({ token }) {
  const [cards, setCards] = useState(HOME_GOAL_CARDS);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [newCardFile, setNewCardFile] = useState(null);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const maxCards = 6;

  const load = async () => {
    try {
      const content = await api('/admin/cms/home', { token });
      if (Array.isArray(content?.goals?.cards)) setCards(content.goals.cards.slice(0, maxCards));
    } catch (error) {
      setNotice(error.message || 'Could not load homepage goal cards.');
    }
  };
  useEffect(() => { load(); }, []);

  const saveImage = async index => {
    setNotice('');
    setSaving(true);
    try {
      const file = selectedFiles[index];
      if (!file) throw new Error('Choose an image to upload.');
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Choose a JPEG, PNG, or WebP image smaller than 5 MB.');
      const imageUrl = await uploadImage(file, token, 'goals');
      const next = cards.map((card, cardIndex) => cardIndex === index ? { ...card, imageUrl, image: undefined } : card);
      await api('/admin/cms/home/goals', { method: 'POST', body: { cards: next }, token });
      setCards(next);
      setSelectedFiles(current => ({ ...current, [index]: null }));
      setNotice('Homepage goal cards saved successfully.');
      showAdminToast('Homepage goal cards saved successfully.');
    } catch (error) {
      setNotice(error.message || 'Could not save homepage goal card image.');
      showAdminToast(error.message || 'Could not save homepage goal card image.', 'error');
    } finally {
      setSaving(false);
    }
  };
  const addCardImage = async () => {
    if (!newCardFile) {
      document.getElementById('goal-new-image')?.click();
      return;
    }
    setNotice('');
    setSaving(true);
    try {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(newCardFile.type) || newCardFile.size > 5 * 1024 * 1024) throw new Error('Choose a JPEG, PNG, or WebP image smaller than 5 MB.');
      if (cards.length >= maxCards) throw new Error('All 6 homepage goal cards are already in use.');
      const template = HOME_GOAL_CARDS[cards.length];
      if (!template) throw new Error('No card template is available for this position.');
      const imageUrl = await uploadImage(newCardFile, token, 'goals');
      const next = [...cards, { ...template, imageUrl, image: undefined }];
      await api('/admin/cms/home/goals', { method: 'POST', body: { cards: next }, token });
      setCards(next);
      setNewCardFile(null);
      setNotice(`Homepage goal card ${next.length} added successfully.`);
      showAdminToast(`Homepage goal card ${next.length} added successfully.`);
    } catch (error) {
      setNotice(error.message || 'Could not add homepage goal card image.');
      showAdminToast(error.message || 'Could not add homepage goal card image.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return <>
    <div className="adm-section-heading"><div><h3>Homepage goal cards</h3><p>Replace card images only. Card text and links stay as they are. Image size: 323 × 205 px · JPEG, PNG, or WebP · max 5 MB.</p></div><span className="adm-count-badge">{cards.length} / {maxCards} cards</span></div>
    {notice && <p className="adm-cms-notice" role="status">{notice}</p>}
    <div className="adm-cms-card-list adm-goal-card-list">{cards.map((card, index) => <article className="adm-cms-item-card adm-goal-card" key={`${card.title}-${index}`}>
      {(card.imageUrl || card.image) && <img src={card.imageUrl ? adminImg(card.imageUrl) : img(card.image)} alt={card.alt || card.title} />}
      <div className="adm-goal-order">CARD {String(index + 1).padStart(2, '0')}</div><div className="adm-cms-item-copy"><strong>{card.title}</strong><span>{card.description}</span></div>
      <div className="adm-goal-upload"><input id={`goal-image-${index}`} type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setSelectedFiles(current => ({ ...current, [index]: event.target.files?.[0] || null }))} /><label className="adm-goal-choose" htmlFor={`goal-image-${index}`}>{selectedFiles[index]?.name || 'Select an image · 323 × 205 px'}</label><button className="adm-btn-primary" type="button" disabled={saving} onClick={() => selectedFiles[index] ? saveImage(index) : document.getElementById(`goal-image-${index}`)?.click()}>{saving ? 'Uploading…' : selectedFiles[index] ? 'Upload image' : 'Upload new image'}</button></div>
    </article>)}{cards.length < maxCards && <article className="adm-goal-add-card"><input id="goal-new-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setNewCardFile(event.target.files?.[0] || null)} /><button className="adm-goal-add-trigger" type="button" disabled={saving} onClick={addCardImage}><span className="adm-goal-plus" aria-hidden="true">+</span><strong>{newCardFile ? newCardFile.name : `Add card ${cards.length + 1}`}</strong><small>{newCardFile ? 'Click to upload this image' : 'Next card in order · image only'}</small></button></article>}</div>
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
    <div className="adm-cms-editor"><label className="adm-form-group"><span>Add award images</span><input type="file" accept="image/*" multiple onChange={addImages} disabled={current.length >= maxImages} /><small>Event/award banner image: 1600 × 900 px (16:9). Certificate/award artwork image: 1200 × 1600 px (3:4). Maximum file size: 5 MB each.</small></label><div className="adm-award-image-grid">{current.map(src => <figure key={src}><img src={cmsImage(src)} alt={`${section} award`} /><button className="adm-btn-action red" type="button" onClick={() => remove(src)}>Remove</button></figure>)}{pending.map((file, index) => <figure key={`${file.name}-${index}`}><img src={URL.createObjectURL(file)} alt={file.name} /><figcaption>Ready to upload</figcaption></figure>)}</div><button type="button" className="adm-btn-primary" onClick={save} disabled={!pending.length}>Upload and save</button></div>
  </div>;
}
