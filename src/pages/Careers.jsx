import { useEffect, useState } from 'react';
import SEOHead from '../components/SEOHead.jsx';
import { api } from '../api.js';
import './Careers.css';

export default function Careers() {
  const [jobs, setJobs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const [applicantPhone, setApplicantPhone] = useState('');
  const [jobsLoading, setJobsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  useEffect(() => { api('/career/jobs').then(setJobs).catch(() => setJobs([])).finally(() => setJobsLoading(false)); }, []);
  const standardDepartments = ['Client Counselling', 'Sales & Business Development', 'Marketing', 'Operations', 'Human Resources'];
  const departments = [...new Set([...standardDepartments, ...jobs.map(job => job.department).filter(Boolean)])];
  const filteredJobs = jobs.filter(job => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || [job.title, job.department].filter(Boolean).some(value => value.toLowerCase().includes(query));
    return matchesSearch && (!departmentFilter || job.department === departmentFilter);
  });
  const apply = async e => {
    e.preventDefault();
    setBusy(true);
    setMessage({ type: '', text: '' });
    const formElement = e.currentTarget;
    const form = new FormData(formElement);
    form.set('job', selected._id || '');
    form.set('applicationType', selected.applicationType || 'job');
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
      setApplicantPhone('');
      if (selected.applicationType !== 'general') {
        const updatedJob = { ...selected, applicationCount: data.applicationCount, applicationsFull: data.applicationCount >= data.applicationLimit };
        setSelected(updatedJob);
        setJobs(current => current.map(job => job._id === updatedJob._id ? updatedJob : job));
      }
      setMessage({ type: 'success', text: 'Application submitted successfully! Thank you for your interest. Our recruitment team will review your application and contact you if your experience matches the role.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'We could not submit your application. Please try again.' });
    } finally { setBusy(false); }
  };
  return <main className="career-page">
    <SEOHead title="Careers | Visa For Nation" description="Explore open roles and apply to join Visa For Nation." />
    <header className="career-hero"><div className="career-hero-inner"><span>JOIN OUR TEAM</span><h1>Build your future <em>with us</em></h1><p>Explore current opportunities and share your experience with Visa For Nation.</p><div className="career-hero-stats"><span><b>Delhi</b> based team</span><span><b>Visa For Nation</b> careers</span></div></div></header>
    <section className="career-hiring-banner" aria-label="Hiring location and team">
      <span className="career-hiring-icon" aria-hidden="true">??</span>
      <div><h2>We&apos;re Hiring in Delhi</h2><p>Join our immigration &amp; travel team and help people reach their global goals.</p></div>
      <div className="career-open-count"><strong>{jobs.length}</strong><span>Open Positions</span></div>
    </section>
    <section className="career-openings" aria-labelledby="career-openings-title">
      <header className="career-section-heading"><span>FIND YOUR NEXT OPPORTUNITY</span><h2 id="career-openings-title">Current Job Openings</h2><p>Explore exciting opportunities and become a part of our global journey.</p></header>
      <div className="career-job-filters">
        <label className="career-job-search"><span className="career-visually-hidden">Search jobs by title or department</span><input type="search" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Search jobs by title or department..." /></label>
        <label className="career-department-filter"><span className="career-visually-hidden">Department</span><select value={departmentFilter} onChange={event => setDepartmentFilter(event.target.value)}><option value="">Department</option>{departments.map(department => <option key={department} value={department}>{department}</option>)}</select></label>
        <button className="career-clear-filters" type="button" onClick={() => { setSearchQuery(''); setDepartmentFilter(''); }}>Clear Filters</button>
      </div>
      {jobsLoading ? <p className="career-empty" role="status">Loading open positions...</p> : !jobs.length ? <p className="career-empty">There are no open positions at the moment. Please check back soon.</p> : !filteredJobs.length ? <div className="career-empty"><p>No positions match those filters.</p><button className="career-clear-filters" type="button" onClick={() => { setSearchQuery(''); setDepartmentFilter(''); }}>Clear Filters</button></div> : <div className="career-job-list">{filteredJobs.map(job => <article className="career-job-card" key={job._id}>
        <div className="career-job-top"><span className="career-job-tag">{job.applicationsFull ? 'Applications full' : 'Now hiring'}</span><h3>{job.title}</h3><p>{job.department || job.position || 'Career opportunity'}</p></div>
        <p className="career-job-description">{job.description}</p>
        <div className="career-listing-meta"><span>?? {job.location || 'Delhi (Office)'}</span><span>{job.role || 'Full Time'}</span></div>
        {(job.salary || job.vacancies || job.applicationDeadline || job.experience) && <div className="career-job-meta">{job.experience && <span>Experience: {job.experience}</span>}{job.salary && <span>Salary: {job.salary}</span>}{job.vacancies && <span>Vacancies: {job.vacancies}</span>}{job.applicationDeadline && <span>Apply by: {new Date(job.applicationDeadline + 'T00:00:00').toLocaleDateString()}</span>}</div>}
        {job.applicationsFull && <p className="career-full-note" role="status">Applications are full for this position. Please check back for future opportunities.</p>}
        <button className="career-apply-button" type="button" disabled={job.applicationsFull} onClick={() => { setSelected(job); setApplicantPhone(''); setMessage({ type: '', text: '' }); }}>{job.applicationsFull ? 'Applications full' : 'Apply Now'} {!job.applicationsFull && <span aria-hidden="true">&#8594;</span>}</button>
      </article>)}</div>}
    </section>
    <section className="career-general-cta" aria-labelledby="career-general-title">
      <div><span className="career-form-eyebrow">GENERAL APPLICATION</span><h2 id="career-general-title">Don&apos;t See a Suitable Role?</h2><p>Send us your resume and we will get in touch when a relevant opportunity arises.</p></div>
      <button className="career-general-button" type="button" onClick={() => { setSelected({ title: 'General Interest', applicationType: 'general', applicationsFull: false }); setApplicantPhone(''); setMessage({ type: '', text: '' }); }}>Send Your Resume <span aria-hidden="true">&#8594;</span></button>
    </section>
    <section className="career-process" aria-labelledby="career-process-title">
      <header className="career-section-heading"><span>WHAT TO EXPECT</span><h2 id="career-process-title">Our Hiring Process</h2><p>A clear, four-step path from application to joining our team.</p></header>
      <ol className="career-process-list">
        <li><span className="career-step-number">Step 1</span><h3>Apply Online</h3><p>Submit your resume</p></li>
        <li><span className="career-step-number">Step 2</span><h3>Initial Screening</h3><p>Our team reviews your profile</p></li>
        <li><span className="career-step-number">Step 3</span><h3>Interview</h3><p>Technical &amp; HR rounds</p></li>
        <li><span className="career-step-number">Step 4</span><h3>Final Selection</h3><p>Welcome to the team!</p></li>
      </ol>
    </section>
    <section className="career-faq" aria-labelledby="career-faq-title">
      <header className="career-section-heading"><span>NEED TO KNOW MORE?</span><h2 id="career-faq-title">Frequently Asked Questions</h2></header>
      <div className="career-faq-list">
        <details><summary>How can I apply for a job?</summary><p>Choose an open position above, select Apply for this role, and submit the application form with your resume.</p></details>
        <details><summary>What is the work culture at Sernexuss?</summary><p>We value collaboration, respectful communication, and shared ownership. Day-to-day work varies by role and team.</p></details>
        <details><summary>Will I get training?</summary><p>Role-specific onboarding and training needs are discussed during the hiring process.</p></details>
        <details><summary>How will I know if my application is shortlisted?</summary><p>Our recruitment team will contact shortlisted applicants using the email address or phone number provided in the application.</p></details>
      </div>
    </section>
    {selected && <div className="career-dialog-backdrop" role="presentation" onClick={() => !busy && setSelected(null)}>
      <form className="career-application-form" onSubmit={apply} onClick={e => e.stopPropagation()} aria-label={`Apply for ${selected.title}`}>
        <button className="career-close" type="button" onClick={() => setSelected(null)} aria-label="Close application">×</button>
        {selected.applicationsFull ? <><span className="career-form-eyebrow">POSITION FULL</span><h2>Applications are full</h2><p>Thank you for your interest. We have reached the application limit for this position.</p></> : <>
          <span className="career-form-eyebrow">{selected.applicationType === 'general' ? 'GENERAL APPLICATION' : 'APPLICATION'}</span><h2>{selected.applicationType === 'general' ? 'Send your resume' : 'Apply for ' + selected.title}</h2><p>{selected.applicationType === 'general' ? 'Share your contact details and resume. We will get in touch when a relevant opportunity arises.' : 'Share your details and attach your resume to apply.'}</p>
          <label>Full name<input required minLength="2" maxLength="100" name="applicantName" autoComplete="name" placeholder="e.g. Aditi Sharma" /></label>
          <label>Email address<input required type="email" maxLength="254" name="email" autoComplete="email" placeholder="e.g. aditi@example.com" /></label>
          <label>Phone number<input required type="tel" inputMode="numeric" minLength="10" maxLength="10" name="phone" autoComplete="tel" pattern="[0-9]{10}" title="Enter a 10-digit phone number." value={applicantPhone} aria-invalid={applicantPhone.length > 0 && applicantPhone.length !== 10} onChange={e => setApplicantPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit phone number" />{applicantPhone.length > 0 && applicantPhone.length !== 10 && <small className="career-field-error" role="alert">Enter exactly 10 digits.</small>}</label>
          <label>Current CTC {selected.applicationType === 'general' && <span className="career-optional">Optional</span>}<input required={selected.applicationType !== 'general'} name="currentCtc" minLength="1" maxLength="60" placeholder="e.g. 8 LPA or INR 65,000 per month" /></label>
          <label>Resume (PDF or Word)<input required type="file" name="resume" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" /></label>
          <label>Cover note <span className="career-optional">Optional</span><textarea name="coverLetter" rows="4" maxLength="2000" placeholder="Tell us briefly why you are interested in this role." /></label>
        </>}
        {message.text && <p className={`career-form-message ${message.type}`} role="status">{message.text}</p>}
        {!selected.applicationsFull && <button className="career-submit-button" disabled={busy} type="submit">{busy ? 'Submitting application�' : 'Submit application'}</button>}
      </form>
    </div>}
  </main>;
}
