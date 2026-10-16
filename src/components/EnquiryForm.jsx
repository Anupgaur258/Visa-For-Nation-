import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api.js';

const COUNTRIES_ALL = ['Canada', 'Australia', 'USA', 'UK', 'Germany', 'Singapore', 'Portugal', 'Schengen Area', 'France', 'Ireland', 'New Zealand', 'Denmark', 'Italy', 'Malta', 'Other'];

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
    let c = propCountry || '';
    let vt = propVisaType || '';

    if (p.includes('/pr/') || p.includes('express-entry') || p.includes('pnp') || p.includes('opportunity-card') || p.includes('job-seeker')) {
      cat = 'PR Visa';
      if (p.includes('canada')) c = 'Canada';
      else if (p.includes('australia')) c = 'Australia';
      else if (p.includes('germany')) c = 'Germany';
      else if (p.includes('portugal')) c = 'Portugal';
    } else if (p.includes('tourist')) {
      cat = 'Tourist Visa';
      if (p.includes('canada')) c = 'Canada';
      else if (p.includes('usa')) c = 'USA';
      else if (p.includes('uk')) c = 'UK';
      else if (p.includes('australia')) c = 'Australia';
      else if (p.includes('schengen') || p.includes('france') || p.includes('spain') || p.includes('denmark')) c = 'Schengen / Europe';
      else if (p.includes('hong-kong')) c = 'Hong Kong';
    } else if (p.includes('study')) {
      cat = 'Study Visa';
      if (p.includes('canada')) c = 'Canada';
      else if (p.includes('australia')) c = 'Australia';
      else if (p.includes('uk')) c = 'UK';
      else if (p.includes('usa')) c = 'USA';
      else if (p.includes('germany')) c = 'Germany';
      else if (p.includes('ireland')) c = 'Ireland';
    } else if (p.includes('work-permit') || p.includes('work-visa') || p.includes('job-assistance')) {
      cat = 'Work Permit';
      if (p.includes('canada')) c = 'Canada';
      else if (p.includes('australia')) c = 'Australia';
      else if (p.includes('singapore')) c = 'Singapore';
      else if (p.includes('malta')) c = 'Malta';
      else if (p.includes('ireland')) c = 'Ireland';
      else if (p.includes('uk')) c = 'UK';
    } else if (p.includes('ielts') || p.includes('pte') || p.includes('duolingo') || p.includes('gre-gmat') || p.includes('counselling') || p.includes('sop') || p.includes('relocation') || p.includes('post-landing') || p.includes('pre-departure') || p.includes('dependent')) {
      cat = 'Services & Coaching';
    }

    return {
      detectedCategory: propCat || cat,
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
  });

  const [state, setState] = useState('idle');
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setState('loading');
    try {
      await api('/inquiries', {
        method: 'POST',
        body: {
          ...form,
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
            <select required value={form.country || detectedCountry} onChange={set('country')}>
              <option value="">Destination Country *</option>
              {['Canada', 'Australia', 'Germany', 'Portugal', 'New Zealand', 'UK', 'Other'].map(c => <option key={c}>{c}</option>)}
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
            <select required value={form.country || detectedCountry} onChange={set('country')}>
              <option value="">Destination Country *</option>
              {COUNTRIES_ALL.map(c => <option key={c}>{c}</option>)}
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
            <select required value={form.country || detectedCountry} onChange={set('country')}>
              <option value="">Preferred Study Country *</option>
              {['Canada', 'Australia', 'UK', 'USA', 'Germany', 'Ireland', 'Singapore', 'France', 'New Zealand', 'Italy'].map(c => <option key={c}>{c}</option>)}
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
            <select required value={form.country || detectedCountry} onChange={set('country')}>
              <option value="">Target Country *</option>
              {['Canada', 'Australia', 'Singapore', 'Malta', 'Ireland', 'Germany', 'UK', 'Netherlands', 'Other'].map(c => <option key={c}>{c}</option>)}
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
          placeholder="Phone Number (+91) *"
          value={form.phone}
          onChange={set('phone')}
        />
      </div>

      <input
        type="email"
        placeholder="Email ID (optional)"
        value={form.email}
        onChange={set('email')}
      />

      {renderCategoryFields()}

      {variant === 'card' && (
        <textarea
          rows="2"
          placeholder="Any specific questions? (optional)"
          value={form.message}
          onChange={set('message')}
        />
      )}

      <button
        className="btn btn-red"
        disabled={state === 'loading'}
        style={{ width: '100%', marginTop: '8px' }}
      >
        {state === 'loading'
          ? 'Submitting…'
          : category === 'PR Visa'
          ? 'Calculate My PR Points'
          : category === 'Tourist Visa'
          ? 'Get Visa Checklist'
          : category === 'Study Visa'
          ? 'Book Free Counselling'
          : 'Get Free Consultation'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '14px', fontSize: '11px', color: '#64748B' }}>
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
    <aside className="form-card" style={{ background: '#FFFFFF', borderRadius: '14px', padding: '30px', boxShadow: '0 12px 36px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}>
      <div className="form-card-head" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'inline-block', background: '#FFF1F2', color: '#B51226', padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
          {category}
        </div>
        <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>{defaultTitle}</h3>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>{defaultSub}</p>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {fields}
        {msg}
      </form>
    </aside>
  );
}
