import { useEffect, useState } from 'react';
import SEOHead from '../components/SEOHead.jsx';
import { api } from '../api.js';
import './Careers.css';

export default function Careers() {
  const [jobs, setJobs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  useEffect(() => { api('/career/jobs').then(setJobs).catch(() => setJobs([])); }, []);
  const apply = async e => {
    e.preventDefault();
    setBusy(true);
    setMessage({ type: '', text: '' });
    const formElement = e.currentTarget;
    const form = new FormData(formElement);
    form.set('job', selected._id);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/career/apply`, { method: 'POST', body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 409) {
          const fullJob = { ...selected, applicationsFull: true };
          setSelected(fullJob);
          setJobs(current => current.map(job => job._id === fullJob._id ? fullJob : job));
        }
        throw new Error(data.message || 'We could not submit your application. Please try again.');
      }
      formElement.reset();
      const updatedJob = { ...selected, applicationCount: data.applicationCount, applicationsFull: data.applicationCount >= data.applicationLimit };
      setSelected(updatedJob);
      setJobs(current => current.map(job => job._id === updatedJob._id ? updatedJob : job));
      setMessage({ type: 'success', text: 'Application submitted successfully! Thank you for your interest. Our recruitment team will review your application and contact you if your experience matches the role.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'We could not submit your application. Please try again.' });
    } finally { setBusy(false); }
  };
  return <main className="career-page">
    <SEOHead title="Careers | Visa For Nation" description="Explore open roles and apply to join Visa For Nation." />
    <header className="career-hero"><span>JOIN OUR TEAM</span><h1>Build your future with us</h1><p>Explore current opportunities and share your experience with Visa For Nation.</p></header>
    {!jobs.length && <p className="career-empty">There are no open positions at the moment. Please check back soon.</p>}
    <div className="career-job-list">{jobs.map(job => <article className="career-job-card" key={job._id}>
      <div className="career-job-top"><span className="career-job-tag">{job.applicationsFull ? 'Applications full' : 'Now hiring'}</span><h2>{job.title}</h2><p>{[job.position, job.experience, job.role, job.location].filter(Boolean).join(' · ')}</p></div>
      <p className="career-job-description">{job.description}</p>
      {job.applicationsFull && <p className="career-full-note" role="status">Applications are full for this position. Please check back for future opportunities.</p>}
      <button className="career-apply-button" type="button" disabled={job.applicationsFull} onClick={() => { setSelected(job); setMessage({ type: '', text: '' }); }}>{job.applicationsFull ? 'Applications full' : 'Apply for this role'} {!job.applicationsFull && <span aria-hidden="true">&#8594;</span>}</button>
    </article>)}</div>
    {selected && <div className="career-dialog-backdrop" role="presentation" onClick={() => !busy && setSelected(null)}>
      <form className="career-application-form" onSubmit={apply} onClick={e => e.stopPropagation()} aria-label={`Apply for ${selected.title}`}>
        <button className="career-close" type="button" onClick={() => setSelected(null)} aria-label="Close application">×</button>
        {selected.applicationsFull ? <><span className="career-form-eyebrow">POSITION FULL</span><h2>Applications are full</h2><p>Thank you for your interest. We have reached the application limit for this position.</p></> : <>
          <span className="career-form-eyebrow">APPLICATION</span><h2>Apply for {selected.title}</h2><p>Share your details and attach your resume to apply.</p>
          <label>Full name<input required minLength="2" maxLength="100" name="applicantName" autoComplete="name" placeholder="e.g. Aditi Sharma" /></label>
          <label>Email address<input required type="email" maxLength="254" name="email" autoComplete="email" placeholder="e.g. aditi@example.com" /></label>
          <label>Phone number<input required type="tel" minLength="7" maxLength="24" name="phone" autoComplete="tel" pattern="[+0-9() .-]{7,24}" placeholder="e.g. +91 98765 43210" /></label>
          <label>Current CTC<input required name="currentCtc" minLength="1" maxLength="60" placeholder="e.g. ?8 LPA or ?65,000 per month" /></label>
          <label>Resume (PDF or Word)<input required type="file" name="resume" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" /></label>
          <label>Cover note <span className="career-optional">Optional</span><textarea name="coverLetter" rows="4" maxLength="2000" placeholder="Tell us briefly why you are interested in this role." /></label>
        </>}
        {message.text && <p className={`career-form-message ${message.type}`} role="status">{message.text}</p>}
        {!selected.applicationsFull && <button className="career-submit-button" disabled={busy} type="submit">{busy ? 'Submitting application…' : 'Submit application'}</button>}
      </form>
    </div>}
  </main>;
}