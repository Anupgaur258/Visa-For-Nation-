import { useEffect, useState } from 'react';
import { api } from '../api.js';

const blank = { title: '', description: '', experience: '', position: '', role: '', location: '', status: 'open' };

export default function CareersAdmin() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('vfn-admin-token');
  const load = async () => {
    try {
      const [j, a] = await Promise.all([
        api('/admin/career/job', { token }),
        api('/admin/career/application', { token }),
      ]);
      setJobs(Array.isArray(j) ? j : []);
      setApplications(Array.isArray(a) ? a : []);
    } catch (e) { setError(e.message || 'Could not load career data.'); }
  };
  useEffect(() => { load(); }, []);
  const save = async e => {
    e.preventDefault(); setError('');
    try {
      await api(editing ? `/admin/career/job/${editing}` : '/admin/career/job', { method: editing ? 'PUT' : 'POST', body: form, token });
      setForm(blank); setEditing(null); await load();
    } catch (e) { setError(e.message || 'Could not save this opening.'); }
  };
  const edit = job => { setEditing(job._id); setForm({ ...blank, ...job }); };
  const remove = async job => {
    if (!window.confirm(`Delete the “${job.title}” opening?`)) return;
    try { await api(`/admin/career/job/${job._id}`, { method: 'DELETE', token }); await load(); }
    catch (e) { setError(e.message || 'Could not delete this opening.'); }
  };
  const removeApplication = async app => {
    if (!window.confirm(`Delete the application from ${app.applicantName}?`)) return;
    try { await api(`/admin/career/application/${app._id}`, { method: 'DELETE', token }); await load(); }
    catch (e) { setError(e.message || 'Could not delete this application.'); }
  };
  return <div className="adm-tab-panel">
    <div className="adm-section-heading"><div><h2>Career openings</h2><p>Publish roles and review candidate applications.</p></div></div>
    {error && <div className="adm-login-error" role="alert">{error}</div>}
    <form className="adm-cms-editor" onSubmit={save}>
      <div className="adm-seo-edit-header"><h3>{editing ? 'Update opening' : 'Add an opening'}</h3>{editing && <button type="button" className="adm-btn-action" onClick={() => { setEditing(null); setForm(blank); }}>Cancel</button>}</div>
      <div className="adm-editor-grid">
        <div className="adm-form-group"><label>Job title</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div className="adm-form-group"><label>Position</label><input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} placeholder="e.g. Immigration Consultant" /></div>
        <div className="adm-form-group"><label>Experience</label><input value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} placeholder="e.g. 2–5 years" /></div>
        <div className="adm-form-group"><label>Role type</label><input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Full-time" /></div>
        <div className="adm-form-group"><label>Location</label><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
        <div className="adm-form-group"><label>Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="open">Open</option><option value="closed">Closed</option></select></div>
        <div className="adm-form-group adm-form-wide"><label>Description</label><textarea required rows="5" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
      </div>
      <button className="adm-btn-primary" type="submit">{editing ? 'Save changes' : 'Publish opening'}</button>
    </form>
    <div className="adm-table-card"><div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Opening</th><th>Position</th><th>Experience</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      {jobs.map(j => <tr key={j._id}><td>{j.title}</td><td>{j.position || '—'}</td><td>{j.experience || '—'}</td><td>{j.status}</td><td><button className="adm-btn-action" onClick={() => edit(j)}>Edit</button><button className="adm-btn-action red" onClick={() => remove(j)}>Delete</button></td></tr>)}
      {!jobs.length && <tr><td colSpan="5">No openings yet.</td></tr>}
    </tbody></table></div></div>
    <div className="adm-section-heading" style={{ marginTop: 28 }}><div><h2>Applications</h2><p>{applications.length} candidate submission{applications.length === 1 ? '' : 's'}</p></div></div>
    <div className="adm-table-card"><div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Candidate</th><th>Opening</th><th>Email / phone</th><th>Resume</th><th>Applied</th><th>Actions</th></tr></thead><tbody>
      {applications.map(a => <tr key={a._id}><td>{a.applicantName}</td><td>{a.job?.title || 'Opening removed'}</td><td>{a.email}<br />{a.phone}</td><td>{a.resumeUrl ? <a href={a.resumeUrl} target="_blank" rel="noreferrer">View resume</a> : '—'}</td><td>{new Date(a.appliedAt || a.createdAt).toLocaleDateString()}</td><td><button className="adm-btn-action red" onClick={() => removeApplication(a)}>Delete</button></td></tr>)}
      {!applications.length && <tr><td colSpan="6">No applications received yet.</td></tr>}
    </tbody></table></div></div>
  </div>;
}
