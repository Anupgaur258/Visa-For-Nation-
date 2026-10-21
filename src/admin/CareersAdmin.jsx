import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';

const blank = { title: '', description: '', department: '', experience: '', position: '', role: '', location: '', workMode: '', salary: '', vacancies: '', responsibilities: '', qualifications: '', applicationDeadline: '', status: 'open' };
const applicationStatuses = ['received', 'shortlisted', 'contacted', 'interviewed', 'not selected'];
const apiBase = String(import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
const resumeHref = path => /^https?:\/\//i.test(path || '') ? path : `${apiBase}${path?.startsWith('/') ? path : `/${path || ''}`}`;
const PAGE_SIZE = 10;
const dateRanges = { all: 0, day: 1, week: 7, month: 30 };

export default function CareersAdmin() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [savingStatus, setSavingStatus] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [applicationPage, setApplicationPage] = useState(1);
  const token = localStorage.getItem('vfn-admin-token');
  const load = async () => {
    try {
      const [j, a] = await Promise.all([api('/admin/career/job', { token }), api('/admin/career/application', { token })]);
      setJobs(Array.isArray(j) ? j : []); setApplications(Array.isArray(a) ? a : []);
    } catch (e) { setError(e.message || 'Could not load career data.'); }
  };
  useEffect(() => { load(); }, []);
  const save = async e => {
    e.preventDefault(); setError('');
    try { await api(editing ? `/admin/career/job/${editing}` : '/admin/career/job', { method: editing ? 'PUT' : 'POST', body: { ...form, vacancies: form.vacancies === '' ? null : Number(form.vacancies) }, token }); setForm(blank); setEditing(null); await load(); }
    catch (e) { setError(e.message || 'Could not save this opening.'); }
  };
  const edit = job => { setEditing(job._id); setForm({ ...blank, ...job }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const remove = async job => { if (!window.confirm('Delete job opening: ' + job.title + '?')) return; try { await api(`/admin/career/job/${job._id}`, { method: 'DELETE', token }); await load(); } catch (e) { setError(e.message || 'Could not delete this opening.'); } };
  const updateStatus = async (application, status) => {
    setSavingStatus(application._id); setError('');
    try { await api('/admin/career/application', { method: 'POST', body: { ...application, job: application.job?._id || application.job, status }, token }); await load(); }
    catch (e) { setError(e.message || 'Could not update the application status.'); }
    finally { setSavingStatus(''); }
  };
  const removeApplication = async app => { if (!window.confirm(`Delete the application from ${app.applicantName}?`)) return; try { await api(`/admin/career/application/${app._id}`, { method: 'DELETE', token }); await load(); } catch (e) { setError(e.message || 'Could not delete this application.'); } };
  const experienceOptions = useMemo(() => [...new Set(jobs.map(job => job.experience).filter(Boolean))].sort(), [jobs]);
  const filteredApplications = useMemo(() => applications.filter(application => {
    const experienceMatches = experienceFilter === 'all' || (application.job?.experience || 'Not specified') === experienceFilter;
    const days = dateRanges[dateFilter];
    const receivedAt = new Date(application.appliedAt || application.createdAt).getTime();
    const dateMatches = !days || (Number.isFinite(receivedAt) && receivedAt >= Date.now() - days * 24 * 60 * 60 * 1000);
    return experienceMatches && dateMatches;
  }), [applications, experienceFilter, dateFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredApplications.length / PAGE_SIZE));
  const visibleApplications = filteredApplications.slice((applicationPage - 1) * PAGE_SIZE, applicationPage * PAGE_SIZE);
  useEffect(() => { setApplicationPage(current => Math.min(current, pageCount)); }, [pageCount]);
  const changeExperience = value => { setExperienceFilter(value); setApplicationPage(1); };
  const changeDate = value => { setDateFilter(value); setApplicationPage(1); };
  return <div className="adm-tab-panel adm-careers">
    <div className="adm-section-heading"><div><h2>Career management</h2><p>Manage published openings and track every candidate through the hiring process.</p></div></div>
    {error && <div className="adm-login-error" role="alert">{error}</div>}
    <form className="adm-cms-editor" onSubmit={save}>
      <div className="adm-seo-edit-header"><h3>{editing ? 'Edit job opening' : 'Create a job opening'}</h3>{editing && <button type="button" className="adm-btn-action" onClick={() => { setEditing(null); setForm(blank); }}>Cancel edit</button>}</div>
      <div className="adm-editor-grid">
        <div className="adm-form-group"><label htmlFor="career-title">Job title</label><input id="career-title" required minLength="2" maxLength="100" placeholder="e.g. Immigration Consultant" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div className="adm-form-group"><label htmlFor="career-department">Department</label><input id="career-department" maxLength="100" placeholder="e.g. Immigration" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></div>
        <div className="adm-form-group"><label htmlFor="career-position">Position</label><input id="career-position" maxLength="100" placeholder="e.g. Senior Consultant" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} /></div>
        <div className="adm-form-group"><label htmlFor="career-experience">Experience required</label><input id="career-experience" maxLength="60" placeholder="e.g. 2 to 5 years" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} /></div>
        <div className="adm-form-group"><label htmlFor="career-role">Job type</label><select id="career-role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}><option value="">Select job type</option>{form.role && !['Full-time', 'Part-time', 'Internship'].includes(form.role) && <option value={form.role}>{form.role}</option>}<option value="Full-time">Full-time</option><option value="Part-time">Part-time</option><option value="Internship">Internship</option></select></div>
        <div className="adm-form-group"><label htmlFor="career-location">Location</label><input id="career-location" maxLength="100" placeholder="e.g. New Delhi / Hybrid" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
        <div className="adm-form-group"><label htmlFor="career-work-mode">Work mode</label><select id="career-work-mode" value={form.workMode} onChange={e => setForm({ ...form, workMode: e.target.value })}><option value="">Select work mode</option><option value="On-site">On-site</option><option value="Remote">Remote</option><option value="Hybrid">Hybrid</option></select></div>
        <div className="adm-form-group"><label htmlFor="career-salary">Salary range <span className="adm-muted">(Optional)</span></label><input id="career-salary" maxLength="100" placeholder="e.g. INR 30,000 to 45,000 per month" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} /></div>
        <div className="adm-form-group"><label htmlFor="career-vacancies">Number of vacancies</label><input id="career-vacancies" type="number" min="1" step="1" value={form.vacancies ?? ''} onChange={e => setForm({ ...form, vacancies: e.target.value ? Number(e.target.value) : '' })} /></div>
        <div className="adm-form-group"><label htmlFor="career-deadline">Application deadline</label><input id="career-deadline" type="date" value={form.applicationDeadline || ''} onChange={e => setForm({ ...form, applicationDeadline: e.target.value })} /></div>
        <div className="adm-form-group"><label htmlFor="career-job-status">Job status</label><select id="career-job-status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="draft">Draft</option><option value="open">Published</option><option value="closed">Closed</option></select></div>
        <div className="adm-form-group adm-form-wide"><label htmlFor="career-description">Job description</label><textarea id="career-description" required minLength="10" maxLength="5000" rows="5" placeholder="Describe the role, responsibilities, and required qualifications." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <div className="adm-form-group adm-form-wide"><label htmlFor="career-responsibilities">Responsibilities</label><textarea id="career-responsibilities" maxLength="5000" rows="4" placeholder="List the main responsibilities for this role." value={form.responsibilities} onChange={e => setForm({ ...form, responsibilities: e.target.value })} /></div>
        <div className="adm-form-group adm-form-wide"><label htmlFor="career-qualifications">Required skills &amp; qualifications</label><textarea id="career-qualifications" maxLength="5000" rows="4" placeholder="List required skills, education, and qualifications." value={form.qualifications} onChange={e => setForm({ ...form, qualifications: e.target.value })} /></div>
      </div><button className="adm-btn-primary" type="submit">{editing ? 'Save opening' : 'Save job opening'}</button>
    </form>
    <div className="adm-section-heading adm-career-subheading"><div><h3>Job openings</h3><p>{jobs.length} job opening{jobs.length === 1 ? '' : 's'}</p></div></div>
    <div className="adm-career-job-grid">{jobs.map(job => <article className="adm-career-job-card" key={job._id}><div><span className={`adm-career-state ${job.status === 'open' ? 'open' : job.status === 'closed' ? 'closed' : ''}`}>{job.status === 'open' ? 'Published' : job.status === 'draft' ? 'Draft' : 'Closed'}</span><h4>{job.title}</h4><p>{[job.department, job.position, job.role, job.workMode, job.location, job.experience, job.salary, job.vacancies ? job.vacancies + ' vacancies' : ''].filter(Boolean).join(' · ') || 'Details not specified'}</p></div><div className="adm-career-actions"><button type="button" className="adm-btn-action" onClick={() => edit(job)}>Edit</button><button type="button" className="adm-btn-action red" onClick={() => remove(job)}>Delete</button></div></article>)}{!jobs.length && <p className="adm-cms-empty">No openings have been created yet.</p>}</div>
    <div className="adm-section-heading adm-career-subheading"><div><h3>Candidate applications</h3><p>{filteredApplications.length} matching application{filteredApplications.length === 1 ? '' : 's'} | {applications.length} total | newest first</p></div></div>
    <div className="adm-career-filters">
      <label>Experience<select value={experienceFilter} onChange={e => changeExperience(e.target.value)}><option value="all">All experience levels</option>{experienceOptions.map(value => <option key={value} value={value}>{value}</option>)}<option value="Not specified">Not specified</option></select></label>
      <label>Received<select value={dateFilter} onChange={e => changeDate(e.target.value)}><option value="all">Any time</option><option value="day">Last 1 day</option><option value="week">Last 7 days</option><option value="month">Last 1 month</option></select></label>
    </div>
    <div className="adm-career-app-list">{visibleApplications.map(app => <article className="adm-career-app-card" key={app._id}>
      <div className="adm-career-app-head"><div><h4>{app.applicantName}</h4><p>{app.job?.title || (app.applicationType === 'general' ? 'General interest' : 'Opening removed')} · {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}</p></div><span className={`adm-career-state ${String(app.status || 'received').replaceAll(' ', '-')}`}>{app.status || 'received'}</span></div>
      <div className="adm-career-app-details"><a href={`mailto:${app.email}`}>{app.email}</a>{app.phone && <a href={`tel:${app.phone}`}>{app.phone}</a>}<span>Current CTC: {app.currentCtc || 'Not provided'}</span>{app.job?.experience && <span>Experience: {app.job.experience}</span>}</div>
      {app.coverLetter && <p className="adm-career-cover">{app.coverLetter}</p>}
      <div className="adm-career-app-actions"><label>Status<select aria-label={`Application status for ${app.applicantName}`} value={app.status || 'received'} disabled={savingStatus === app._id} onChange={e => updateStatus(app, e.target.value)}>{applicationStatuses.map(status => <option key={status} value={status}>{status.replace(/^./, char => char.toUpperCase())}</option>)}</select></label>{app.resumeUrl ? <a className="adm-btn-action" href={resumeHref(app.resumeUrl)} target="_blank" rel="noreferrer">View resume / CV</a> : <span className="adm-career-no-resume">No resume attached</span>}<button type="button" className="adm-btn-action red" onClick={() => removeApplication(app)}>Delete</button></div>
    </article>)}{!visibleApplications.length && <p className="adm-cms-empty">No applications match these filters.</p>}</div>
    {filteredApplications.length > PAGE_SIZE && <nav className="adm-pagination" aria-label="Application pages"><span>Page {applicationPage} of {pageCount}</span><div><button className="adm-btn-action" type="button" disabled={applicationPage <= 1} onClick={() => setApplicationPage(page => Math.max(1, page - 1))}>Previous</button><button className="adm-btn-action" type="button" disabled={applicationPage >= pageCount} onClick={() => setApplicationPage(page => Math.min(pageCount, page + 1))}>Next</button></div></nav>}
  </div>;
}