import { useEffect, useState } from 'react';
import { adminImg, api } from '../api.js';
import { showAdminToast } from './adminToast.js';

const positiveLimit = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : fallback;
};
const MAX_COUNT = positiveLimit(import.meta.env.VITE_GALLERY_MAX_COUNT || import.meta.env.VITE_MAX_GALLERY_IMAGES_PER_SECTION, 50);
const MAX_SIZE_MB = positiveLimit(import.meta.env.VITE_IMAGE_UPLOAD_MAX_SIZE_MB, 10);
const GROUPS = ['Client Testimonials', 'Seminars & Events', 'Office Trips', 'Destinations'];

export default function GalleryAdmin() {
  const token = localStorage.getItem('vfn-admin-token');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', group: GROUPS[1], note: '', file: null });
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await api('/admin/cms/gallery', { token });
      setItems(Array.isArray(data?.gallery?.images) ? data.gallery.images : []);
      setNotice('');
    } catch (error) {
      setNotice(error.message || 'Could not load gallery images.');
    }
  };
  useEffect(() => { load(); }, []);

  const save = async event => {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!form.file) return setNotice('Choose an image to upload.');
    if (!form.file.type.startsWith('image/')) return setNotice('Choose a JPG, PNG, or WebP image.');
    if (form.file.size > MAX_SIZE_MB * 1024 * 1024) return setNotice(`Image must be ${MAX_SIZE_MB} MB or smaller.`);
    if (items.length >= MAX_COUNT) return setNotice(`Gallery supports up to ${MAX_COUNT} images.`);
    if (form.title.trim().length < 2) return setNotice('Add a title with at least 2 characters.');

    setSaving(true);
    setNotice('');
    try {
      const uploadData = new FormData();
      uploadData.append('category', 'gallery');
      uploadData.append('file', form.file);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData,
      });
      const upload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(upload.message || 'Image upload failed.');

      const image = {
        id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        imageUrl: upload.path,
        title: form.title.trim(),
        group: form.group,
        note: form.note.trim(),
      };
      const next = [...items, image];
      await api('/admin/cms/gallery/gallery', { method: 'POST', body: { images: next }, token });
      setItems(next);
      setForm({ title: '', group: GROUPS[1], note: '', file: null });
      formElement.reset();
      setNotice('Gallery image uploaded and published.');
      showAdminToast('Gallery image uploaded and published.');
    } catch (error) {
      setNotice(error.message || 'Could not upload gallery image.');
      showAdminToast(error.message || 'Could not upload gallery image.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async item => {
    if (!window.confirm(`Remove “${item.title}” from the gallery?`)) return;
    const next = items.filter(image => image.id !== item.id);
    try {
      await api('/admin/cms/gallery/gallery', { method: 'POST', body: { images: next }, token });
      setItems(next);
      showAdminToast('Gallery image removed.');
    } catch (error) {
      setNotice(error.message || 'Could not remove gallery image.');
      showAdminToast(error.message || 'Could not remove gallery image.', 'error');
    }
  };

  return <div className="adm-cms-collection">
    <div className="adm-section-heading"><div><h3>Gallery images</h3><p>Upload and publish images shown in the public gallery. Up to {MAX_COUNT} images · JPG, PNG, or WebP · max {MAX_SIZE_MB} MB each.</p></div><strong>{items.length} / {MAX_COUNT}</strong></div>
    {notice && <p className="adm-cms-notice" role="status">{notice}</p>}
    <form className="adm-cms-editor" onSubmit={save}>
      <div className="adm-seo-edit-header"><h3>Add gallery image</h3></div>
      <div className="adm-editor-grid">
        <div className="adm-form-group"><label htmlFor="gallery-image">Image file</label><input id="gallery-image" type="file" accept="image/jpeg,image/png,image/webp" required onChange={event => setForm(current => ({ ...current, file: event.target.files?.[0] || null }))} /><small>Recommended image size: 1200 × 900 px (4:3). The full image will show in the card and viewer. Maximum {MAX_SIZE_MB} MB.</small></div>
        <div className="adm-form-group"><label htmlFor="gallery-title">Image title</label><input id="gallery-title" required minLength={2} maxLength={100} value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} /></div>
        <div className="adm-form-group"><label htmlFor="gallery-group">Collection</label><select id="gallery-group" value={form.group} onChange={event => setForm(current => ({ ...current, group: event.target.value }))}>{GROUPS.map(group => <option key={group}>{group}</option>)}</select></div>
        <div className="adm-form-group adm-form-wide"><label htmlFor="gallery-note">Caption</label><textarea id="gallery-note" rows="3" maxLength={300} value={form.note} onChange={event => setForm(current => ({ ...current, note: event.target.value }))} /></div>
      </div>
      <button type="submit" className="adm-btn-primary" disabled={saving || items.length >= MAX_COUNT}>{saving ? 'Uploading…' : 'Upload and publish image'}</button>
    </form>
    <div className="adm-cms-card-list">
      {items.map(item => <article className="adm-cms-item-card" key={item.id || item.imageUrl}>
        <img src={adminImg(item.imageUrl)} alt={item.title || 'Gallery image'} />
        <div className="adm-cms-item-copy"><strong>{item.title}</strong><span>{item.group}{item.note ? ` · ${item.note}` : ''}</span></div>
        <div className="adm-cms-item-actions"><button type="button" className="adm-btn-action red" onClick={() => remove(item)}>Remove</button></div>
      </article>)}
      {!items.length && <p className="adm-cms-empty">No gallery images uploaded yet.</p>}
    </div>
  </div>;
}
