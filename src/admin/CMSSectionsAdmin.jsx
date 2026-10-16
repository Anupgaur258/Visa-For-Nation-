import { useEffect, useState } from 'react';
import { api } from '../api.js';
const pages = ['home', 'about', 'contact', 'gallery'];
export default function CMSSectionsAdmin() {
  const token = localStorage.getItem('vfn-admin-token'); const [page, setPage] = useState('home'); const [sections, setSections] = useState({}); const [forms, setForms] = useState({}); const [newName, setNewName] = useState(''); const [notice, setNotice] = useState('');
  const load = async () => { try { const data = await api(`/admin/cms/${page}`, { token }); setSections(data || {}); setForms(Object.fromEntries(Object.entries(data || {}).map(([k,v]) => [k, JSON.stringify(v, null, 2)]))); } catch (e) { setNotice(e.message); } };
  useEffect(() => { load(); }, [page]);
  const save = async name => { try { const data = JSON.parse(forms[name]); await api(`/admin/cms/${page}/${name}`, { method: 'POST', body: data, token }); setNotice(`${name} section saved.`); load(); } catch (e) { setNotice(e instanceof SyntaxError ? 'Section data must be valid JSON.' : e.message); } };
  const add = async e => { e.preventDefault(); const name = newName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-'); if (!name) return; try { await api(`/admin/cms/${page}/${name}`, { method: 'POST', body: {}, token }); setNewName(''); load(); } catch (e) { setNotice(e.message); } };
  return <section className="adm-tab-panel"><div className="adm-section-heading"><div><h2>Page sections</h2><p>Choose a page to edit its saved CMS sections. Each section saves independently.</p></div><select className="adm-select" value={page} onChange={e => setPage(e.target.value)}>{pages.map(p => <option key={p} value={p}>{p[0].toUpperCase()+p.slice(1)}</option>)}</select></div>
    {notice && <p role="status">{notice}</p>}
    <form onSubmit={add} style={{ display: 'flex', gap: 10, margin: '16px 0' }}><input aria-label="New section name" placeholder="New section name" value={newName} onChange={e => setNewName(e.target.value)} /><button className="adm-btn-primary">Add section</button></form>
    {Object.keys(sections).length === 0 && <p>No saved sections for this page yet.</p>}
    {Object.keys(sections).map(name => <div className="adm-cms-editor" key={name}><div className="adm-seo-edit-header"><h3>{name.replace(/[_-]/g, ' ')}</h3><button type="button" className="adm-btn-primary" onClick={() => save(name)}>Save section</button></div><textarea className="code" rows="10" aria-label={`${name} section data JSON`} value={forms[name] || ''} onChange={e => setForms({ ...forms, [name]: e.target.value })} /></div>)}
  </section>;
}
