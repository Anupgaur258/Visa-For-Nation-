import { useEffect, useRef, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { api } from './api.js';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import DynamicPage from './pages/DynamicPage.jsx';
import VisaPage from './pages/VisaPage.jsx';
import { Blog, BlogPost } from './pages/Blog.jsx';
import News, { NewsPost } from './pages/News.jsx';
import Podcast from './pages/Podcast.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Careers from './pages/Careers.jsx';
import { Awards, Gallery, Legal } from './pages/Static.jsx';
import Loader from './components/Loader.jsx';
import Admin from './admin/Admin.jsx';

function VfnChatbotWidget() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const [options, setOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsRequested, setOptionsRequested] = useState(false);
  const [optionsError, setOptionsError] = useState('');
  const [chatError, setChatError] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'Which visa are you interested in?' }]);
  const transcriptEndRef = useRef(null);
  const [message, setMessage] = useState('');
  const [answerLoading, setAnswerLoading] = useState(false);
  const [intakeStep, setIntakeStep] = useState('topic');
  const [advisorOnline, setAdvisorOnline] = useState(false);
  const [advisorBusy, setAdvisorBusy] = useState(false);
  const [chatMode, setChatMode] = useState('');
  const [visitorId] = useState(() => {
    let id = localStorage.getItem('vfn-chat-visitor-id');
    if (!id) { id = crypto.randomUUID(); localStorage.setItem('vfn-chat-visitor-id', id); }
    return id;
  });
  const [lead, setLead] = useState({ name: '', phone: '', email: '', country: '', topic: '', message: '', callDate: '', callTime: '', consent: false });
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadError, setLeadError] = useState('');
  const [leadSent, setLeadSent] = useState(false);

  useEffect(() => {
    const refreshStatus = () => api('/chatbot/status').then(result => { setAdvisorOnline(result.available === true); setAdvisorBusy(result.busy === true); }).catch(() => { setAdvisorOnline(false); setAdvisorBusy(false); });
    refreshStatus();
    const timer = window.setInterval(refreshStatus, 3000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (chatMode !== 'live') return undefined;
    const refreshMessages = () => api(`/chatbot/session/${visitorId}${open ? '?read=true' : ''}`).then(result => {
      const nextMessages = (result.messages || []).map(item => ({ role: item.role === 'admin' ? 'assistant' : 'user', text: item.text, at: item.at, readAt: item.readAt }));
      if (!result.active) {
        setAdvisorOnline(result.available === true); setAdvisorBusy(result.busy === true);
        setMessages([...nextMessages, { role: 'assistant', text: 'The advisor has ended this chat. You can schedule a call request instead.' }]);
        setChatMode(''); setIntakeStep('call'); return;
      }
      setMessages(current => current.length === nextMessages.length && current.every((item, index) => item.role === nextMessages[index].role && item.text === nextMessages[index].text && item.readAt === nextMessages[index].readAt && item.at === nextMessages[index].at) ? current : nextMessages);
      setAdvisorOnline(result.available === true); setAdvisorBusy(result.busy === true);
    }).catch(() => {});
    refreshMessages();
    const timer = window.setInterval(refreshMessages, 2500);
    return () => window.clearInterval(timer);
  }, [chatMode, visitorId, open]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, intakeStep, leadError]);

  useEffect(() => {
    if (!open || optionsRequested || optionsLoading) return;
    setOptionsRequested(true);
    setOptionsLoading(true);
    setOptionsError('');
    api('/chatbot/options')
      .then(items => setOptions(Array.isArray(items) ? items : []))
      .catch(() => setOptionsError('Could not load the quick options. Please try again.'))
      .finally(() => setOptionsLoading(false));
  }, [open, optionsLoading, optionsRequested]);

  const ask = async text => {
    const cleanText = text.trim();
    if (!cleanText || answerLoading) return;
    setMessage('');
    setAnswerLoading(true);
    setChatError('');
    if (chatMode === 'live') {
      try {
        const result = await api(`/chatbot/session/${visitorId}/messages`, { method: 'POST', body: { text: cleanText } });
        const serverMessages = (result.messages || []).map(item => ({ role: item.role === 'admin' ? 'assistant' : 'user', text: item.text, at: item.at, readAt: item.readAt }));
        setMessages(serverMessages);
      } catch (error) { setChatError(error.message || 'Message could not be sent.'); }
      finally { setAnswerLoading(false); }
      return;
    }
    setMessages(current => [...current, { role: 'user', text: cleanText }]);
    try {
      const result = await api('/chatbot/message', { method: 'POST', body: { message: cleanText } });
      setMessages(current => [...current, { role: 'assistant', text: result.answer }]);
    } catch {
      setChatError('We could not connect right now. Please try again or contact our team.');
    } finally {
      setAnswerLoading(false);
    }
  };

  const submitIntake = event => {
    event.preventDefault();
    const value = message.trim();
    if (!value || !['name', 'phone', 'email', 'country'].includes(intakeStep)) return;
    if (intakeStep === 'name' && value.length < 2) return setLeadError('Please enter your name.');
    if (intakeStep === 'phone' && (!/^[0-9+(). -]{7,20}$/.test(value) || value.replace(/\D/g, '').length < 7)) return setLeadError('Please enter a valid mobile number.');
    if (intakeStep === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return setLeadError('Please enter a valid email address.');
    const next = { name: 'phone', phone: 'email', email: 'country', country: 'actions' }[intakeStep];
    const prompt = { phone: 'What is your mobile number?', email: 'What is your email address?', country: 'Which country are you applying from?', actions: 'Thanks! How would you like us to continue?' }[next];
    setLead(current => ({ ...current, [intakeStep]: value }));
    setMessages(current => [...current, { role: 'user', text: value }, { role: 'assistant', text: prompt }]);
    setMessage(''); setLeadError(''); setIntakeStep(next);
  };

  const chooseVisa = option => {
    setLead(current => ({ ...current, topic: option }));
    setMessages(current => [...current, { role: 'user', text: option }, { role: 'assistant', text: 'What is your name?' }]);
    setIntakeStep('name');
  };

  const submitLead = async event => {
    event.preventDefault();
    if (!lead.callDate || !lead.callTime) { setLeadError('Choose a date and time for your call.'); return; }
    setLeadLoading(true);
    setLeadError('');
    try {
      const result = await api('/chatbot/leads', {
        method: 'POST',
        body: { ...lead, sourcePage: pathname },
      });
      setLeadSent(true);
      setMessages(current => [...current, { role: 'assistant', text: result.message }]);
    } catch (error) {
      setLeadError(error.message || 'We could not send your request. Please try again.');
    } finally {
      setLeadLoading(false);
    }
  };

  const startLiveChat = async event => {
    event?.preventDefault();
    if (!lead.consent) { setLeadError('Please agree before starting a live chat.'); return; }
    setLeadLoading(true); setLeadError('');
    try {
      await api('/chatbot/session', { method: 'POST', body: { visitorId, details: lead, messages } });
      setChatMode('live');
      setMessages([{ role: 'assistant', text: `Hi ${lead.name}, an advisor is here. How can we help?` }]);
    } catch (error) { setLeadError(error.message || 'Could not start chat. Please try again.'); }
    finally { setLeadLoading(false); }
  };

  return (
    <div className={`vfn-chatbot ${open ? 'is-open' : ''}`}>
      <div className="vfn-chatbot-window" role="dialog" aria-modal="false" aria-label="Visa For Nation chatbot" aria-hidden={!open}>
        <header className="vfn-chatbot-header">
          <div className="vfn-chatbot-brand">
            <img src="/logo.png" alt="Visa For Nation logo" />
            <div className="vfn-chatbot-brand-copy">
              <strong>Visa For Nation</strong>
              <span>{advisorOnline ? 'Advisor online now' : advisorBusy ? 'Advisor busy with another visitor' : 'How can we help you?'}</span>
            </div>
          </div>
          <button type="button" className="vfn-chatbot-close" aria-label="Close chatbot" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </header>

        <div className="vfn-chatbot-body">
          <div className="vfn-chat-message vfn-chat-message-welcome">
            Hi! How are you? How can I assist you today?
          </div>

          <div className="vfn-chatbot-transcript" aria-live="polite">
            {messages.map((item, index) => (
              <div key={`${item.role}-${index}`} className={`vfn-chat-message ${item.role === 'user' ? 'vfn-chat-message-user' : 'vfn-chat-message-assistant'}`}>
                {item.text}
                {chatMode === 'live' && item.role === 'user' && item.at && <span className={`vfn-chat-message-ticks${item.readAt ? ' is-read' : ''}`} aria-label={item.readAt ? 'Read' : 'Sent'}>{item.readAt ? '✓✓' : '✓'}</span>}
              </div>
            ))}
            {answerLoading && <div className="vfn-chatbot-loading" role="status">Preparing a response...</div>}
            <div ref={transcriptEndRef} aria-hidden="true" />
          </div>
          {leadError && intakeStep !== 'call' && <p className="vfn-chatbot-error" role="alert">{leadError}</p>}

          {intakeStep === 'topic' && chatMode !== 'live' && <div className="vfn-chatbot-options" aria-label="Choose a visa type">
            {optionsLoading && <span className="vfn-chatbot-loading" role="status">Loading options...</span>}
            {options.filter(option => option !== 'Contact Our Team').map((option) => (
              <button
                key={option}
                type="button"
                className={`vfn-option ${selected === option ? 'is-selected' : ''}`}
                disabled={answerLoading}
                onClick={() => { setSelected(option); chooseVisa(option); }}
                aria-pressed={selected === option}
              >
                {option}
              </button>
            ))}
          </div>}

          {optionsError && (
            <div className="vfn-chatbot-error" role="alert">
              <p>{optionsError}</p>
              <button type="button" onClick={() => { setOptionsRequested(false); setOptionsError(''); }}>Retry loading options</button>
            </div>
          )}
          {chatError && <p className="vfn-chatbot-error" role="alert">{chatError}</p>}

          {intakeStep === 'actions' && chatMode !== 'live' && !leadSent && <div className="vfn-chatbot-lead">
            <strong>How would you like us to continue?</strong>
            {advisorBusy && <p className="vfn-chatbot-error">An advisor is currently helping another visitor. Please request a call.</p>}
            <label className="vfn-chatbot-consent"><input type="checkbox" checked={lead.consent} onChange={event => setLead(current => ({ ...current, consent: event.target.checked }))} /><span>I agree that Visa For Nation may contact me about this request.</span></label>
            <button className="vfn-chatbot-submit" type="button" disabled={!lead.consent} onClick={() => { setIntakeStep('call'); setMessages(items => [...items, { role: 'user', text: 'Call request' }, { role: 'assistant', text: 'Please choose a date and time for your call.' }]); }}>Call request</button>
            {advisorOnline && <button className="vfn-chatbot-submit" type="button" disabled={!lead.consent || leadLoading} onClick={startLiveChat}>Live chat</button>}
          </div>}
          {intakeStep === 'call' && !leadSent && <form className="vfn-chatbot-lead" onSubmit={submitLead}>
            <strong>Choose a call date and time</strong>
            <label>Call date<input required type="date" min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)} value={lead.callDate} onChange={event => setLead(current => ({ ...current, callDate: event.target.value }))} /></label>
            <label>Call time<input required type="time" value={lead.callTime} onChange={event => setLead(current => ({ ...current, callTime: event.target.value }))} /></label>
            {leadError && <p className="vfn-chatbot-error" role="alert">{leadError}</p>}
            <button className="vfn-chatbot-submit" type="submit" disabled={leadLoading}>{leadLoading ? 'Sending...' : 'Confirm call request'}</button>
          </form>}
          {leadSent && <p className="vfn-chatbot-success" role="status">Your call request has been sent. We’ll contact you soon.</p>}
        </div>

        <form className="vfn-chatbot-input-wrap" onSubmit={event => { if (chatMode === 'live') { event.preventDefault(); ask(message); } else submitIntake(event); }}>
          <input
            type={intakeStep === 'email' && chatMode !== 'live' ? 'email' : 'text'}
            className="vfn-chatbot-input"
            placeholder={chatMode === 'live' ? 'Message the advisor...' : intakeStep === 'name' ? 'Type your name...' : intakeStep === 'phone' ? 'Type your mobile number...' : intakeStep === 'email' ? 'Type your email...' : intakeStep === 'country' ? 'Type your country...' : 'Choose an option above...'}
            aria-label="Type your question"
            disabled={chatMode !== 'live' && !['name', 'phone', 'email', 'country'].includes(intakeStep)}
            maxLength="500"
            value={message}
            onChange={event => setMessage(event.target.value)}
          />
          <button type="submit" className="vfn-chatbot-send" aria-label="Send message" disabled={!message.trim() || answerLoading || (chatMode !== 'live' && !['name', 'phone', 'email', 'country'].includes(intakeStep))}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5L20 3l-4.1 17-4.3-6.5L3 11.5zm0 0l7.5 2.2" /></svg>
          </button>
        </form>
      </div>

      <button
        type="button"
        className="vfn-chatbot-launcher"
        aria-label={open ? 'Close chatbot' : 'Open chatbot'}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? (
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18.5h9.5A4.5 4.5 0 0 0 21 14V9.5A4.5 4.5 0 0 0 16.5 5H7A4.5 4.5 0 0 0 2.5 9.5V14A4.5 4.5 0 0 0 7 18.5zm0 0l-1.2 3.5 4.2-3.5M8.5 9.5h7M8.5 13h5" /></svg>
        )}
      </button>
    </div>
  );
}

export default function App() {
  const { pathname } = useLocation();
  const [splash, setSplash] = useState(!pathname.startsWith('/admin'));
  useEffect(() => { const t = setTimeout(() => setSplash(false), 1300); return () => clearTimeout(t); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  if (pathname.startsWith('/admin')) return <Routes><Route path="/admin/*" element={<Admin />} /></Routes>;
  return (
    <>
      {splash && <Loader splash />}
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact-us" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/award-and-certificate" element={<Awards />} />
          <Route path="/our-gellary" element={<Gallery />} />
          <Route path="/terms-and-conditions" element={<Legal kind="terms" />} />
          <Route path="/privacy-policy" element={<Legal kind="privacy" />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<NewsPost />} />
          <Route path="/podcast" element={<Podcast />} />
          
          {/* Migrate - Canada */}
          <Route path="/visa/pr/canada" element={<VisaPage />} />
          <Route path="/migrate/canada/express-entry" element={<VisaPage />} />
          <Route path="/visa/pr/canada/pnp" element={<VisaPage />} />
          <Route path="/visa/canada/pnp/ontario" element={<VisaPage />} />
          <Route path="/visa/pr/canada/british-columbia-pnp" element={<VisaPage />} />
          <Route path="/visa/pr/canada/alberta-pnp" element={<VisaPage />} />
          <Route path="/visa/pr/canada/saskatchewan-pnp" element={<VisaPage />} />
          <Route path="/visa/pr/canada/nova-scotia-pnp" element={<VisaPage />} />
          
          {/* Migrate - Australia PR */}
          <Route path="/visa/pr/australia" element={<VisaPage />} />
          <Route path="/visa/pr/australia/subclass-189" element={<VisaPage />} />
          <Route path="/visa/pr/australia/subclass-190" element={<VisaPage />} />
          <Route path="/visa/pr/australia/subclass-491" element={<VisaPage />} />
          
          {/* Migrate - Other PR */}
          <Route path="/germany-opportunity-card" element={<VisaPage />} />
          <Route path="/portugal-job-seeker-visa" element={<VisaPage />} />
          
          {/* Migrate - Work Permits */}
          <Route path="/canada-work-permit" element={<VisaPage />} />
          <Route path="/australia-work-permit" element={<VisaPage />} />
          <Route path="/singapore-work-permit" element={<VisaPage />} />
          <Route path="/malta-work-permit" element={<VisaPage />} />
          <Route path="/ireland-work-visa" element={<VisaPage />} />
          
          {/* Migrate - Job Assistance */}
          <Route path="/greece-job-assistance" element={<VisaPage />} />
          <Route path="/netherlands-job-assistance" element={<VisaPage />} />
          <Route path="/switzerland-job-assistance" element={<VisaPage />} />
          <Route path="/uk-job-assistance" element={<VisaPage />} />
          <Route path="/luxembourg-job-assistance" element={<VisaPage />} />
          
          {/* Tourist - Top Destinations */}
          <Route path="/canada-tourist-visa" element={<VisaPage />} />
          <Route path="/usa-tourist-visa" element={<VisaPage />} />
          <Route path="/uk-tourist-visa" element={<VisaPage />} />
          <Route path="/australia-tourist-visa" element={<VisaPage />} />
          <Route path="/hong-kong-tourist-visa" element={<VisaPage />} />
          
          {/* Tourist - Schengen */}
          <Route path="/schengen-tourist-visa" element={<VisaPage />} />
          <Route path="/france-tourist-visa" element={<VisaPage />} />
          <Route path="/portugal-tourist-visa" element={<VisaPage />} />
          <Route path="/spain-tourist-visa" element={<VisaPage />} />
          <Route path="/denmark-tourist-visa" element={<VisaPage />} />
          
          {/* Tourist - Europe & Others */}
          <Route path="/ireland-tourist-visa" element={<VisaPage />} />
          <Route path="/slovakia-tourist-visa" element={<VisaPage />} />
          <Route path="/norway-tourist-visa" element={<VisaPage />} />
          <Route path="/luxembourg-tourist-visa" element={<VisaPage />} />
          <Route path="/lithuania-tourist-visa" element={<VisaPage />} />
          
          {/* Study Visa */}
          <Route path="/study-in-canada" element={<VisaPage />} />
          <Route path="/study-in-australia" element={<VisaPage />} />
          <Route path="/study-in-uk" element={<VisaPage />} />
          <Route path="/study-in-usa" element={<VisaPage />} />
          <Route path="/study-in-germany" element={<VisaPage />} />
          <Route path="/study-in-italy" element={<VisaPage />} />
          <Route path="/study-in-singapore" element={<VisaPage />} />
          <Route path="/study-in-ireland" element={<VisaPage />} />
          <Route path="/study-in-france" element={<VisaPage />} />
          <Route path="/study-in-newzealand" element={<VisaPage />} />
          <Route path="/study-in-hong-kong" element={<VisaPage />} />
          <Route path="/study-in-denmark" element={<VisaPage />} />
          
          {/* Services - Exams */}
          <Route path="/ielts" element={<VisaPage />} />
          <Route path="/pte" element={<VisaPage />} />
          <Route path="/duolingo-english-test" element={<VisaPage />} />
          <Route path="/gre-gmat" element={<VisaPage />} />
          
          {/* Services - Student Support */}
          <Route path="/education-counselling" element={<VisaPage />} />
          <Route path="/sop-lor-resume" element={<VisaPage />} />
          <Route path="/scholarship-guidance" element={<VisaPage />} />
          <Route path="/interview-preparation" element={<VisaPage />} />
          
          {/* Services - Settlement */}
          <Route path="/relocation-services" element={<VisaPage />} />
          <Route path="/post-landing-support" element={<VisaPage />} />
          <Route path="/pre-departure-orientation" element={<VisaPage />} />
          <Route path="/dependent-visa-assistance" element={<VisaPage />} />
          
          <Route path="*" element={<DynamicPage />} />
        </Routes>
      </main>
      <Footer />
      <VfnChatbotWidget />
    </>
  );
}
