import { useEffect, useState } from 'react';
import SEOHead from '../components/SEOHead.jsx';
import { api } from '../api.js';

export default function Careers() {
  const [jobs, setJobs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { api('/career/jobs').then(setJobs).catch(() => setJobs([])); }, []);
  const apply = async e => {
    e.preventDefault(); setBusy(true); setMessage('');
    const form = new FormData(e.currentTarget); form.set('job', selected._id);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/career/apply`, { method: 'POST', body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Could not submit your application.');
      setMessage('Thanks for applying. Your application has been received.'); e.currentTarget.reset();
    } catch (err) { setMessage(err.message); }
    finally { setBusy(false); }
  };
  return <main style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px', minHeight: '60vh' }}>
    <SEOHead title="Careers | Visa For Nation" description="Explore open roles and apply to join Visa For Nation." />
    <header style={{ marginBottom: 32 }}><span>JOIN OUR TEAM</span><h1>Careers at Visa For Nation</h1><p>Explore current opportunities and share your experience with us.</p></header>
    {!jobs.length && <p>There are no open positions at the moment. Please check back soon.</p>}
    <div style={{ display: 'grid', gap: 20 }}>
      {jobs.map(job => <article key={job._id} style={{ padding: 24, border: '1px solid #e2e8f0', borderRadius: 12 }}>
        <h2>{job.title}</h2><p>{[job.position, job.experience, job.role, job.location].filter(Boolean).join(' · ')}</p><p style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>
        <button className="btn btn-red" type="button" onClick={() => { setSelected(job); setMessage(''); }}>Apply for this role</button>
      </article>)}
    </div>
    {selected && <div role="dialog" aria-modal="true" aria-label={`Apply for ${selected.title}`} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#0008', display: 'grid', placeItems: 'center', padding: 16 }} onClick={() => setSelected(null)}>
      <form onSubmit={apply} onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, padding: 24, width: 'min(520px, 100%)', display: 'grid', gap: 12 }}>
        <button type="button" onClick={() => setSelected(null)} style={{ justifySelf: 'end' }}>Close</button><h2>Apply: {selected.title}</h2>
        <label>Name<input required name="applicantName" autoComplete="name" /></label><label>Email<input required type="email" name="email" autoComplete="email" /></label><label>Phone<input name="phone" autoComplete="tel" /></label>
        <label>Resume (PDF or Word)<input required type="file" name="resume" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" /></label>
        <label>Cover note<textarea name="coverLetter" rows="4" /></label>
        {message && <p role="status">{message}</p>}<button disabled={busy} className="btn btn-red" type="submit">{busy ? 'Submitting…' : 'Submit application'}</button>
      </form>
    </div>}
  </main>;
}
