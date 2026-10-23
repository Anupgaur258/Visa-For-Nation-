import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api.js';
import './EnquiryForm.css';

const COUNTRIES_ALL = ['Canada', 'Australia', 'USA', 'UK', 'Germany', 'Singapore', 'Portugal', 'Schengen Area', 'France', 'Ireland', 'New Zealand', 'Denmark', 'Italy', 'Malta', 'Netherlands', 'Switzerland', 'Luxembourg', 'Greece', 'Norway', 'Slovakia', 'Lithuania', 'Hong Kong', 'Spain', 'Other'];

const getCountryFromPath = pathname => {
  const path = pathname.toLowerCase();
  if (path.includes('canada')) return 'Canada';
  if (path.includes('australia')) return 'Australia';
  if (path.includes('new-zealand') || path.includes('newzealand')) return 'New Zealand';
  if (path.includes('hong-kong')) return 'Hong Kong';
  if (path.includes('germany')) return 'Germany';
  if (path.includes('portugal')) return 'Portugal';
  if (path.includes('singapore')) return 'Singapore';
  if (path.includes('malta')) return 'Malta';
  if (path.includes('ireland')) return 'Ireland';
  if (path.includes('netherlands')) return 'Netherlands';
  if (path.includes('switzerland')) return 'Switzerland';
  if (path.includes('luxembourg')) return 'Luxembourg';
  if (path.includes('greece')) return 'Greece';
  if (path.includes('france')) return 'France';
  if (path.includes('italy')) return 'Italy';
  if (path.includes('denmark')) return 'Denmark';
  if (path.includes('spain')) return 'Spain';
  if (path.includes('norway')) return 'Norway';
  if (path.includes('slovakia')) return 'Slovakia';
  if (path.includes('lithuania')) return 'Lithuania';
  if (path.includes('schengen')) return 'Schengen Area';
  if (path.includes('usa') || path.includes('united-states')) return 'USA';
  if (path.includes('/uk') || path.includes('-uk-') || path.endsWith('-uk')) return 'UK';
  return '';
};

export default function EnquiryForm({
  variant = 'card',
  category: propCat,
  country: propCountry,
  visaType: propVisaType,
  title,
  sub,
}) {
  const { pathname } = useLocation();

  // Auto-detect Category & Country if not provided explicitly
  const { detectedCategory, detectedCountry, detectedVisaType } = useMemo(() => {
    const p = pathname.toLowerCase();
    let cat = 'General';
    let c = propCountry || getCountryFromPath(p);
    let vt = propVisaType || '';

    if (p.includes('/pr/') || p.includes('express-entry') || p.includes('pnp') || p.includes('opportunity-card') || p.includes('job-seeker')) {
      cat = 'PR Visa';
    } else if (p.includes('tourist')) {
      cat = 'Tourist Visa';
    } else if (p.includes('study')) {
      cat = 'Study Visa';
    } else if (p.includes('work-permit') || p.includes('work-visa') || p.includes('job-assistance')) {
      cat = 'Work Permit';
    } else if (p.includes('ielts') || p.includes('pte') || p.includes('duolingo') || p.includes('gre-gmat') || p.includes('counselling') || p.includes('sop') || p.includes('relocation') || p.includes('post-landing') || p.includes('pre-departure') || p.includes('dependent')) {
      cat = 'Services & Coaching';
    }

    const categoryKey = String(propCat || '').toLowerCase().replace(/[^a-z]/g, '');
    const categoryMap = {
      visa: cat, migrate: cat, prvisa: 'PR Visa', tourist: 'Tourist Visa', touristvisa: 'Tourist Visa',
      study: 'Study Visa', studyvisa: 'Study Visa', work: 'Work Permit', workpermit: 'Work Permit',
      service: 'Services & Coaching', services: 'Services & Coaching', servicescoaching: 'Services & Coaching',
    };

    return {
      detectedCategory: categoryMap[categoryKey] || cat,
      detectedCountry: c,
      detectedVisaType: vt,
    };
  }, [pathname, propCat, propCountry, propVisaType]);

  const category = detectedCategory;

  const defaultTitle = useMemo(() => {
    if (title) return title;
    if (category === 'PR Visa') return 'Check PR Eligibility';
    if (category === 'Tourist Visa') return 'Apply Tourist Visa';
    if (category === 'Study Visa') return 'Free Student Assessment';
    if (category === 'Work Permit') return 'Check Work Visa Eligibility';
    if (category === 'Services & Coaching') return 'Book Free Demo / Trial';
    return 'Free Eligibility Check';
  }, [title, category]);

  const defaultSub = useMemo(() => {
    if (sub) return sub;
    if (category === 'PR Visa') return 'Calculate your points with our senior PR consultants';
    if (category === 'Tourist Visa') return 'Get complete document checklist & fast processing';
    if (category === 'Study Visa') return 'Free university course selection & scholarship guidance';
    return 'Our experts call you back within 24 hours';
  }, [sub, category]);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    country: detectedCountry || '',
    visaType: detectedVisaType || '',
    ageGroup: '',
    qualification: '',
    experience: '',
    languageScore: '',
    travelDate: '',
    intake: '',
    serviceNeeded: '',
    message: '',
    callbackDate: '',
    callbackTime: '',
    subject: '',
    securityAnswer: '',
  });

  // EnquiryForm stays mounted while React Router changes visa routes. Keep the
  // selected destination in sync so each country page opens with its own country.
  useEffect(() => {
    setForm(current => ({ ...current, country: detectedCountry || '' }));
  }, [pathname, detectedCountry]);

  const [state, setState] = useState('idle');
  const [captchaNumbers] = useState(() => [2 + Math.floor(Math.random() * 8), 2 + Math.floor(Math.random() * 8)]);
  const [captchaInvalid, setCaptchaInvalid] = useState(false);
  const set = k => e => setForm(current => ({ ...current, [k]: e.target.value }));
  const setPhone = e => setForm(current => ({ ...current, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }));
  const emailLooksValid = value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  const countryOptions = options => [...new Set([...(detectedCountry ? [detectedCountry] : []), ...options])];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (variant === 'callback' && Number(form.securityAnswer) !== captchaNumbers[0] + captchaNumbers[1]) {
      setCaptchaInvalid(true);
      return;
    }
    setCaptchaInvalid(false);
    setState('loading');
    try {
      const submittedForm = variant === 'callback' ? {
        ...form,
        message: [
          'Callback request',
          `Preferred date: ${form.callbackDate}`,
          `Preferred time: ${form.callbackTime}`,
          form.subject ? `Subject: ${form.subject}` : '',
          form.message ? `Message: ${form.message}` : '',
        ].filter(Boolean).join('\n'),
      } : form;
      await api('/inquiries', {
        method: 'POST',
        body: {
          ...submittedForm,
          category,
          sourcePage: pathname,
          country: form.country || detectedCountry || 'General',
        },
      });
      setState('done');
      setForm({
        name: '',
        phone: '',
        email: '',
        country: detectedCountry || '',
        visaType: '',
        ageGroup: '',
        qualification: '',
        experience: '',
        languageScore: '',
        travelDate: '',
        intake: '',
        serviceNeeded: '',
        message: '',
    callbackDate: '',
    callbackTime: '',
    subject: '',
    securityAnswer: '',
      });
    } catch {
      setState('error');
    }
  };

  const renderCategoryFields = () => {
    switch (category) {
      case 'PR Visa':
        return (
          <>
            <select required value={form.country} onChange={set('country')}>
              <option value="">Destination Country *</option>
              {countryOptions(['Canada', 'Australia', 'Germany', 'Portugal', 'New Zealand', 'UK', 'Other']).map(c => <option key={c}>{c}</option>)}
            </select>
            <div className="form-row-2">
              <select value={form.ageGroup} onChange={set('ageGroup')}>
                <option value="">Age Group</option>
                <option value="18-24">18 - 24 Years</option>
                <option value="25-32">25 - 32 Years (Max Points)</option>
                <option value="33-39">33 - 39 Years</option>
                <option value="40-44">40 - 44 Years</option>
                <option value="45+">45+ Years</option>
              </select>
              <select value={form.qualification} onChange={set('qualification')}>
                <option value="">Highest Education</option>
                <option value="Master's / PhD">Master's / PhD</option>
                <option value="Bachelor's (4 Yr)">Bachelor's (4 Yr Degree)</option>
                <option value="Bachelor's (3 Yr)">Bachelor's (3 Yr Degree)</option>
                <option value="Diploma / Trade">Diploma / Trade</option>
                <option value="High School">High School</option>
              </select>
            </div>
            <div className="form-row-2">
              <select value={form.experience} onChange={set('experience')}>
                <option value="">Work Experience</option>
                <option value="1-2 Years">1 - 2 Years</option>
                <option value="3-5 Years">3 - 5 Years</option>
                <option value="6-8 Years">6 - 8 Years</option>
                <option value="8+ Years">8+ Years</option>
              </select>
              <select value={form.languageScore} onChange={set('languageScore')}>
                <option value="">Language Status</option>
                <option value="IELTS / PTE Taken">IELTS / PTE Taken</option>
                <option value="Planning to take">Planning to take</option>
                <option value="Need Coaching">Need Coaching</option>
              </select>
            </div>
          </>
        );

      case 'Tourist Visa':
        return (
          <>
            <select required value={form.country} onChange={set('country')}>
              <option value="">Destination Country *</option>
              {countryOptions(COUNTRIES_ALL).map(c => <option key={c}>{c}</option>)}
            </select>
            <div className="form-row-2">
              <input
                type="text"
                placeholder="Planned Travel Month (e.g. Dec 2026)"
                value={form.travelDate}
                onChange={set('travelDate')}
              />
              <select value={form.experience} onChange={set('experience')}>
                <option value="">No. of Travellers</option>
                <option value="Solo (1 Person)">Solo (1 Person)</option>
                <option value="Couple (2 Persons)">Couple (2 Persons)</option>
                <option value="Family (3-4 Persons)">Family (3-4 Persons)</option>
                <option value="Group (5+ Persons)">Group (5+ Persons)</option>
              </select>
            </div>
          </>
        );

      case 'Study Visa':
        return (
          <>
            <select required value={form.country} onChange={set('country')}>
              <option value="">Preferred Study Country *</option>
              {countryOptions(['Canada', 'Australia', 'UK', 'USA', 'Germany', 'Ireland', 'Singapore', 'France', 'New Zealand', 'Italy', 'Denmark', 'Hong Kong']).map(c => <option key={c}>{c}</option>)}
            </select>
            <div className="form-row-2">
              <select value={form.qualification} onChange={set('qualification')}>
                <option value="">Target Degree</option>
                <option value="Master's / Postgrad">Master's / Postgrad</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Diploma / Certificate">Diploma / Certificate</option>
                <option value="PhD / Research">PhD / Research</option>
              </select>
              <select value={form.intake} onChange={set('intake')}>
                <option value="">Target Intake</option>
                <option value="Fall (Sept/Oct)">Fall (Sept/Oct)</option>
                <option value="Spring (Jan/Feb)">Spring (Jan/Feb)</option>
                <option value="Summer (May/June)">Summer (May/June)</option>
              </select>
            </div>
          </>
        );

      case 'Work Permit':
        return (
          <>
            <select required value={form.country} onChange={set('country')}>
              <option value="">Target Country *</option>
              {countryOptions(['Canada', 'Australia', 'Singapore', 'Malta', 'Ireland', 'Germany', 'UK', 'Netherlands', 'Switzerland', 'Luxembourg', 'Greece', 'Other']).map(c => <option key={c}>{c}</option>)}
            </select>
            <div className="form-row-2">
              <input
                placeholder="Current Job Title / Profession"
                value={form.visaType}
                onChange={set('visaType')}
              />
              <select value={form.experience} onChange={set('experience')}>
                <option value="">Total Experience</option>
                <option value="1-2 Years">1 - 2 Years</option>
                <option value="3-5 Years">3 - 5 Years</option>
                <option value="5-8 Years">5 - 8 Years</option>
                <option value="8+ Years">8+ Years</option>
              </select>
            </div>
          </>
        );

      case 'Services & Coaching':
        return (
          <>
            <select
              value={form.serviceNeeded}
              onChange={set('serviceNeeded')}
              required
            >
              <option value="">Select Service / Course *</option>
              <option value="IELTS Academic / General">IELTS Academic / General</option>
              <option value="PTE Academic Coaching">PTE Academic Coaching</option>
              <option value="Duolingo English Test">Duolingo English Test</option>
              <option value="GRE / GMAT Prep">GRE / GMAT Prep</option>
              <option value="SOP / LOR / Resume Drafting">SOP / LOR / Resume Drafting</option>
              <option value="Relocation / Post Landing Support">Relocation / Post Landing Support</option>
              <option value="Dependent Visa Guidance">Dependent Visa Guidance</option>
            </select>
          </>
        );

      default:
        return (
          <select value={form.country} onChange={set('country')}>
            <option value="">Country of Interest</option>
            {COUNTRIES_ALL.map(c => <option key={c}>{c}</option>)}
          </select>
        );
    }
  };

  const fields = (
    <>
      <div className="form-row-2">
        <input
          required
          placeholder="Your Full Name *"
          value={form.name}
          onChange={set('name')}
        />
        <input
          required
          type="tel"
          inputMode="numeric"
          pattern="[0-9]{10}"
          maxLength="10"
          title="Enter a 10-digit phone number."
          placeholder="Phone (10 digits) *"
          aria-label="Phone number (10 digits)"
          value={form.phone}
          aria-invalid={form.phone.length > 0 && form.phone.length !== 10}
          onChange={setPhone}
        />
      </div>
      {form.phone.length > 0 && form.phone.length !== 10 && <small className="field-error" role="alert">Enter exactly 10 digits.</small>}

      <input
        required
        type="email"
        maxLength="254"
        placeholder="Email ID *"
        value={form.email}
        aria-invalid={form.email.length > 0 && !emailLooksValid(form.email)}
        onChange={set('email')}
      />
      {form.email.length > 0 && !emailLooksValid(form.email) && <small className="field-error" role="alert">Enter a valid email address.</small>}

      {variant === 'callback' ? <>
        <div className="form-row-2 callback-date-row">
          <label>When should we call? *<input required type="date" min={new Date().toISOString().slice(0, 10)} value={form.callbackDate} onChange={set('callbackDate')} /></label>
          <label>Preferred Time *<select required value={form.callbackTime} onChange={set('callbackTime')}><option value="">Select time</option><option>10:30 AM - 12:00 PM</option><option>12:00 PM - 2:00 PM</option><option>2:00 PM - 4:00 PM</option><option>4:00 PM - 6:30 PM</option></select></label>
        </div>
        <small className="callback-hours-note">We call Monday to Saturday, 10:30 AM - 6:30 PM (India time).</small>
        <label className="callback-full-field callback-subject-field">Subject <span>(optional)</span><input maxLength="120" value={form.subject} onChange={set('subject')} placeholder="What is this about?" /></label>
        <label className="callback-full-field callback-message-field">Message <span>(optional)</span><textarea rows="3" maxLength="1000" value={form.message} onChange={set('message')} placeholder="Write your message or query here..." /></label>
        <div className="callback-security"><label htmlFor="callback-security-answer">Security Check * <span>{captchaNumbers[0]} + {captchaNumbers[1]} =</span></label><input id="callback-security-answer" required type="number" inputMode="numeric" value={form.securityAnswer} aria-invalid={captchaInvalid} onChange={event => { setCaptchaInvalid(false); set('securityAnswer')(event); }} placeholder="Answer" />{captchaInvalid && <small role="alert">Please enter the correct answer.</small>}</div>
      </> : renderCategoryFields()}

      {(variant === 'card' || variant === 'eligibility') && (
        <textarea
          rows="2"
          placeholder="Any specific questions? (optional)"
          value={form.message}
          onChange={set('message')}
        />
      )}

      <button
        className="btn btn-red enquiry-submit"
        disabled={state === 'loading'}
      >
        {state === 'loading'
          ? 'Submitting…'
          : variant === 'callback'
          ? 'Request a Callback'
          : variant === 'eligibility'
          ? 'Check Eligibility'
          : category === 'PR Visa'
          ? 'Calculate My PR Points'
          : category === 'Tourist Visa'
          ? 'Get Visa Checklist'
          : category === 'Study Visa'
          ? 'Book Free Counselling'
          : 'Get Free Consultation'}
      </button>

      <div className="form-assurance">
        <span>🔒 100% Confidential</span>
        <span>•</span>
        <span>Delhi Office Expert Call</span>
      </div>
    </>
  );

  const msg = state === 'done' ? (
    <div className="form-msg ok" style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', background: '#DCFCE7', color: '#166534', fontSize: '13px', lineHeight: 1.5 }}>
      <strong>✓ Thank you!</strong> Your assessment request has been received. Our senior consultant from our Greater Kailash office will call you within 24 hours.
    </div>
  ) : state === 'error' ? (
    <div className="form-msg err" style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', background: '#FEE2E2', color: '#991B1B', fontSize: '13px' }}>
      ✕ Something went wrong. Please call us directly at <strong>+91 7677666677</strong>.
    </div>
  ) : null;

  if (variant === 'bar') {
    return (
      <form className="bar-form" onSubmit={handleSubmit}>
        {fields}
        {msg}
      </form>
    );
  }

  return (
    <aside className={`form-card${variant === 'callback' ? ' callback-form-card' : ''}${variant === 'eligibility' ? ' eligibility-form-card' : ''}`}>
      <div className="form-card-head">
        {(variant === 'callback' || variant === 'eligibility') && <span className={`form-card-icon ${variant}`} aria-hidden="true">
          {variant === 'callback' ? <svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 5.2 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L9 10.7a16 16 0 0 0 4.3 4.3l1.3-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z"/></svg> : <svg viewBox="0 0 24 24"><path d="M7 3h8l4 4v14H7z"/><path d="M15 3v5h5M10 13h6M10 17h4"/><path d="m3 12 1.5 1.5L7 11"/></svg>}
        </span>}
        <div className="form-card-head-copy">
          <div className="form-card-category">{category}</div>
          <h3>{defaultTitle}</h3>
          <p>{defaultSub}</p>
        </div>
      </div>
      <form className="enquiry-form" onSubmit={handleSubmit}>
        {fields}
        {msg}
      </form>
    </aside>
  );
}
