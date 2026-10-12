import { useEffect, useState } from 'react';
import { api, adminImg, UPLOAD } from '../api.js';

const RES = {
  pages: { label: 'Pages', title: 'heroTitle', sub: 'fullUrl', fields: [['fullUrl', 'Full URL (e.g. visa/pr/canada)'], ['heroBadge', 'Hero badge'], ['heroTitle', 'Hero title'], ['heroDesc', 'Hero description', 'area'], ['bannerImage', 'Banner image', 'img'], ['content', 'Main content (HTML, use <h2> for TOC)', 'html'], ['faqs', 'FAQs', 'faqs'], ['metaTitle', 'Meta title'], ['metaDescription', 'Meta description', 'area'], ['status', 'Status', 'status']] },
  posts: { label: 'Blog Posts', title: 'title', sub: 'category', fields: [['title', 'Title'], ['slug', 'Slug (auto if empty)'], ['category', 'Category'], ['subCategory', 'Sub category'], ['image', 'Banner image', 'img'], ['content', 'Article content (HTML)', 'html'], ['metaTitle', 'Meta title'], ['metaDescription', 'Meta description', 'area'], ['status', 'Status', 'status']] },
  inquiries: { label: 'Inquiries', title: 'name', sub: 'phone', readonly: true },
};

export default function Admin() {
  const [auth, setAuth] = useState(() => JSON.parse(localStorage.getItem('vfn_admin') || 'null'));
  const [tab, setTab] = useState('dashboard');
  if (!auth) return <Login onLogin={a => { localStorage.setItem('vfn_admin', JSON.stringify(a)); setAuth(a); }} />;
  const logout = () => { localStorage.removeItem('vfn_admin'); setAuth(null); };
  const tabs = ['dashboard', ...Object.keys(RES)];
  return (
    <div className="adm">
      <aside><h2>VFN Admin</h2>{tabs.map(t => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{RES[t]?.label || 'Dashboard'}</button>)}<button onClick={logout}>Logout</button><a href="/">← View site</a></aside>
      <section>{tab === 'dashboard' ? <Dash token={auth.token} go={setTab} /> : <Manager key={tab} name={tab} token={auth.token} onAuthFail={logout} />}</section>
    </div>
  );
}

function Login({ onLogin }) {
  const [f, setF] = useState({ email: '', password: '' }); const [err, setErr] = useState('');
  const go = async e => { e.preventDefault(); try { onLogin(await api('/admin/login', { method: 'POST', body: f })); } catch (x) { setErr(x.message); } };
  return <div className="adm-login"><form onSubmit={go}><h2>Admin Login</h2><input placeholder="Email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /><input type="password" placeholder="Password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />{err && <p className="form-msg err">{err}</p>}<button className="btn btn-red">Login</button></form></div>;
}

function Dash({ token, go }) {
  const [s, setS] = useState({});
  useEffect(() => { api('/admin/stats', { token }).then(setS); }, [token]);
  return <><h1>Dashboard</h1><div className="adm-stats">{Object.keys(RES).map(k => <div key={k} onClick={() => go(k)}><b>{s[k] ?? '–'}</b><span>{RES[k].label}</span></div>)}</div></>;
}

function Manager({ name, token, onAuthFail }) {
  const cfg = RES[name];
  const [rows, setRows] = useState([]); const [edit, setEdit] = useState(null); const [q, setQ] = useState('');
  const load = () => api(`/admin/${name}`, { token }).then(setRows).catch(e => e.status === 401 && onAuthFail());
  useEffect(() => { load(); }, []);
  const save = async () => {
    try { await api(`/admin/${name}${edit._id ? '/' + edit._id : ''}`, { method: edit._id ? 'PUT' : 'POST', body: edit, token }); setEdit(null); load(); }
    catch (e) { alert(e.message); }
  };
  const del = async r => { if (confirm('Delete permanently?')) { await api(`/admin/${name}/${r._id}`, { method: 'DELETE', token }); load(); } };
  const upload = async (k, file) => {
    const fd = new FormData(); fd.append('file', file);
    const r = await fetch(`${UPLOAD}/api/admin/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd }).then(r => r.json());
    setEdit(e => ({ ...e, [k]: r.path }));
  };
  const list = rows.filter(r => JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));

  if (edit) return (
    <div className="adm-form"><h1>{edit._id ? 'Edit' : 'New'} {cfg.label}</h1>{name === 'pages' && <p className="hint">Full URL jo bhi likhoge usi path par page khulega. Example: <b>visa/pr/uk</b> → /visa/pr/uk. Content me har <h1>{edit._id ? 'Edit' : 'New'} {cfg.label}</h1>lt;h2<h1>{edit._id ? 'Edit' : 'New'} {cfg.label}</h1>gt; se Table of Contents khud ban jata hai.</p>}
      {cfg.fields.map(([k, label, type]) => (
        <label key={k}>{label}
          {type === 'area' ? <textarea rows="3" value={edit[k] || ''} onChange={e => setEdit({ ...edit, [k]: e.target.value })} />
            : type === 'html' ? <textarea className="code" rows="16" value={edit[k] || ''} onChange={e => setEdit({ ...edit, [k]: e.target.value })} />
            : type === 'status' ? <select value={edit[k] || 'published'} onChange={e => setEdit({ ...edit, [k]: e.target.value })}><option>published</option><option>draft</option></select>
            : type === 'img' ? <div><input value={edit[k] || ''} onChange={e => setEdit({ ...edit, [k]: e.target.value })} placeholder="path or URL" /><input type="file" accept="image/*" onChange={e => e.target.files[0] && upload(k, e.target.files[0])} />{edit[k] && <img className="thumb" src={adminImg(edit[k])} alt="" onError={e => (e.target.style.display = 'none')} />}</div>
            : type === 'faqs' ? <div>{(edit.faqs || []).map((f, i) => <div className="faq-edit" key={i}><input placeholder="Question" value={f.q} onChange={e => { const a = [...edit.faqs]; a[i] = { ...f, q: e.target.value }; setEdit({ ...edit, faqs: a }); }} /><textarea rows="2" placeholder="Answer" value={f.a} onChange={e => { const a = [...edit.faqs]; a[i] = { ...f, a: e.target.value }; setEdit({ ...edit, faqs: a }); }} /><button type="button" onClick={() => setEdit({ ...edit, faqs: edit.faqs.filter((_, j) => j !== i) })}>Remove</button></div>)}<button type="button" className="btn btn-line" onClick={() => setEdit({ ...edit, faqs: [...(edit.faqs || []), { q: '', a: '' }] })}>+ Add FAQ</button></div>
            : <input value={edit[k] || ''} onChange={e => setEdit({ ...edit, [k]: e.target.value })} />}
        </label>))}
      <div className="row"><button className="btn btn-red" onClick={save}>Save</button><button className="btn btn-line" onClick={() => setEdit(null)}>Cancel</button></div>
    </div>);

  return (
    <><div className="adm-bar"><h1>{cfg.label} <small>({list.length})</small></h1><input placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />{!cfg.readonly && <button className="btn btn-red" onClick={() => setEdit({ status: 'published', faqs: [] })}>+ New</button>}</div>
      <table className="adm-table"><tbody>{list.map(r => (
        <tr key={r._id}><td><b>{r[cfg.title]}</b><br /><small>{r[cfg.sub]}{name === 'inquiries' && ` · ${r.email || ''} · ${r.interest || ''} · ${r.sourcePage || ''} · ${new Date(r.createdAt).toLocaleString()}`}</small></td>
          <td>{r.status && <span className={`st ${r.status}`}>{r.status}</span>}</td>
          <td className="act">{!cfg.readonly && <button onClick={() => setEdit(r)}>Edit</button>}<button onClick={() => del(r)}>Delete</button></td></tr>))}</tbody></table></>);
}
