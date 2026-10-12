import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api.js';
const COUNTRIES = ['Canada', 'Australia', 'Germany', 'Singapore', 'Sweden', 'Portugal', 'UK', 'USA', 'Other'];

// variant="bar" = home horizontal bar, "card" = sticky side card
export default function EnquiryForm({ variant = 'card', title = 'Free Eligibility Check', sub = 'Our experts call you back within 24 hours' }) {
  const { pathname } = useLocation();
  const [f, setF] = useState({ name: '', phone: '', email: '', interest: '', message: '' });
  const [state, setState] = useState('idle');
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setState('loading');
    try { await api('/inquiries', { method: 'POST', body: { ...f, sourcePage: pathname } }); setState('done'); setF({ name: '', phone: '', email: '', interest: '', message: '' }); }
    catch { setState('error'); }
  };
  const fields = (
    <>
      <input required placeholder="Your Name" value={f.name} onChange={set('name')} />
      <input required type="tel" placeholder="Phone Number" value={f.phone} onChange={set('phone')} />
      <input required type="email" placeholder="Email ID" value={f.email} onChange={set('email')} />
      <select required value={f.interest} onChange={set('interest')}><option value="">Move to</option>{COUNTRIES.map(c => <option key={c}>{c}</option>)}</select>
      {variant === 'card' && <textarea rows="2" placeholder="Message (optional)" value={f.message} onChange={set('message')} />}
      <button className="btn btn-red" disabled={state === 'loading'}>{state === 'loading' ? 'Sending…' : variant === 'bar' ? 'Submit' : 'Get Free Consultation'}</button>
    </>
  );
  const msg = state === 'done' ? <p className="form-msg ok">Thank you! We will contact you shortly.</p> : state === 'error' ? <p className="form-msg err">Something went wrong. Please try again.</p> : null;
  if (variant === 'bar') return <form className="bar-form" onSubmit={submit}>{fields}{msg}</form>;
  return (
    <aside className="form-card">
      <div className="form-card-head"><h3>{title}</h3><p>{sub}</p></div>
      <form onSubmit={submit}>{fields}{msg}</form>
    </aside>
  );
}
