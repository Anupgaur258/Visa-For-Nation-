import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import './ChatbotAdmin.css';

const PAGE_SIZE = Math.max(1, Math.floor(Number(import.meta.env.VITE_ADMIN_PAGE_SIZE || 10)));
const CALL_LIMIT = Math.max(1, Math.floor(Number(import.meta.env.VITE_ADMIN_CHATBOT_CALL_LIMIT || 100)));
const REFRESH_MS = Math.max(10000, Number(import.meta.env.VITE_ADMIN_CHATBOT_REFRESH_MS || 15000));

export default function ChatbotAdmin({ token }) {
  const [online, setOnline] = useState(false);
  const [chatBusy, setChatBusy] = useState(false);
  const [activeVisitorId, setActiveVisitorId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [selected, setSelected] = useState('');
  const [reply, setReply] = useState('');
  const messagesEndRef = useRef(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sessionPage, setSessionPage] = useState(1);
  const [callPage, setCallPage] = useState(1);
  const [sessionHasMore, setSessionHasMore] = useState(false);
  const sessionPageSize = PAGE_SIZE;
  const visibleSessions = sessions;
  const callPageSize = PAGE_SIZE;
  const callRequests = inquiries.filter(item => item.details?.requestType === 'scheduled_call' || item.details?.callDate);
  const callPages = Math.max(1, Math.ceil(callRequests.length / callPageSize));
  const visibleCalls = callRequests.slice((callPage - 1) * callPageSize, callPage * callPageSize);
  const formatCallDate = value => {
    if (!value) return 'Not provided';
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  };
  const formatCallDay = item => item.details?.callDay || (item.details?.callDate ? new Date(`${item.details.callDate}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long' }) : 'Not provided');
  useEffect(() => { setCallPage(page => Math.min(page, callPages)); }, [callPages]);
  const load = useCallback(async () => {
    try {
      const [status, chats, leads] = await Promise.all([
        api('/admin/chatbot/status', { token }),
        api(`/admin/chatbot/sessions?page=${sessionPage}&limit=${sessionPageSize}`, { token }),
        api(`/admin/inquiries?category=Chatbot&limit=${CALL_LIMIT}`, { token }),
      ]);
      setOnline(status.online === true);
      setChatBusy(status.busy === true);
      setActiveVisitorId(status.activeVisitorId || '');
      setSessions(Array.isArray(chats) ? chats : chats.sessions || []);
      setSessionHasMore(Boolean(chats.hasMore));
      setInquiries(leads.inquiries || []);
      if (status.activeVisitorId) setSelected(status.activeVisitorId);
    } catch (e) { setError(e.message || 'Could not load chatbot data.'); }
  }, [token, sessionPage, sessionPageSize]);
  useEffect(() => { load(); const id = window.setInterval(load, REFRESH_MS); return () => window.clearInterval(id); }, [load]);
useEffect(() => { if (selected) api(`/admin/chatbot/sessions/${selected}/read`, { method: 'POST', token }).catch(() => {}); }, [selected, token]);
  const toggle = async () => {
    setBusy(true); setError('');
    try { const result = await api('/admin/chatbot/status', { method: 'PUT', body: { online: !online }, token }); setOnline(result.online); setChatBusy(result.busy); setActiveVisitorId(result.activeVisitorId || ''); }
    catch (e) { setError(e.message || 'Could not update availability.'); }
    finally { setBusy(false); }
  };
  const endChat = async () => {
    if (!activeVisitorId) return;
    setBusy(true); setError('');
    try { await api(`/admin/chatbot/sessions/${activeVisitorId}/end`, { method: 'POST', token }); setChatBusy(false); setActiveVisitorId(''); await load(); }
    catch (e) { setError(e.message || 'Could not end this conversation.'); }
    finally { setBusy(false); }
  };
  const sendReply = async event => {
    event.preventDefault();
    if (!reply.trim() || !selected) return;
    setBusy(true); setError('');
    try { await api(`/admin/chatbot/sessions/${selected}/messages`, { method: 'POST', body: { text: reply.trim() }, token }); setReply(''); await load(); }
    catch (e) { setError(e.message || 'Could not send reply.'); }
    finally { setBusy(false); }
  };
  const active = sessions.find(item => item.visitorId === selected);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [selected, active?.messages?.length, active?.messages?.at(-1)?.at, active?.messages?.at(-1)?.text]);
  return <section className="adm-chatbot">
    <div className="adm-chatbot-heading"><div><h2>Chat bot inbox</h2><p>Manage advisor availability, live chats and scheduled calls.</p></div>
      <div className="adm-chatbot-presence"><button type="button" className={`adm-chatbot-toggle ${online ? 'is-online' : ''}`} onClick={toggle} disabled={busy} aria-pressed={online}><span />{online ? 'Online' : 'Offline'}</button>{online && <small>{chatBusy ? 'Busy with one visitor' : 'Available for live chat'}</small>}</div></div>
    {error && <p className="adm-chatbot-error" role="alert">{error}</p>}
    <div className="adm-chatbot-grid">
      <section className="adm-chatbot-card"><h3>Live conversations <small>{sessions.length}</small></h3>
        {sessions.length === 0 ? <p className="adm-chatbot-empty">Live conversations will appear here.</p> : <>{visibleSessions.map(session => <button key={session.visitorId} className={`adm-chatbot-session ${selected === session.visitorId ? 'selected' : ''}`} onClick={() => setSelected(session.visitorId)} type="button"><strong>{session.details?.name || 'Website visitor'}</strong><span>{session.details?.country || 'Country not provided'} · {session.details?.visaType || 'Visa type not provided'}</span><small>{activeVisitorId === session.visitorId ? 'ACTIVE · ' : ''}{session.messages?.at(-1)?.text || 'Started a chat'}</small></button>)}<div className="adm-chatbot-pagination"><span>Page {sessionPage}</span><button type="button" onClick={() => setSessionPage(page => Math.max(1, page - 1))} disabled={sessionPage <= 1}>Previous</button><button type="button" onClick={() => setSessionPage(page => page + 1)} disabled={!sessionHasMore}>Next</button></div></>}
      </section>
      <section className="adm-chatbot-card adm-chatbot-conversation"><div className="adm-chatbot-conversation-heading"><h3>{active?.details?.name || 'Select a conversation'}</h3>{activeVisitorId && <button type="button" onClick={endChat} disabled={busy}>End active chat</button>}</div>
        {active && <><div className="adm-chatbot-messages">{(active.messages || []).map((item, index) => <div key={`${item.at}-${index}`} className={`adm-chatbot-message ${item.role}`}>{item.text}<small>{new Date(item.at).toLocaleString()}{item.role === 'admin' && <span className={`adm-chatbot-ticks${item.readAt ? ' is-read' : ''}`} aria-label={item.readAt ? 'Read' : 'Sent'}>{item.readAt ? '✓✓' : '✓'}</span>}</small></div>)}<div ref={messagesEndRef} /></div>{activeVisitorId === selected ? <form onSubmit={sendReply}><input value={reply} onChange={e => setReply(e.target.value)} placeholder="Write a reply..." maxLength="1000" /><button disabled={busy || !reply.trim()}>Send</button></form> : <p className="adm-chatbot-empty">This conversation is not active. Only the active visitor can chat with you.</p>}</>}
      </section>
    </div>
    <section className="adm-chatbot-card adm-chatbot-calls"><h3>Call requests <small>{callRequests.length}</small></h3>
      {callRequests.length === 0 ? <p className="adm-chatbot-empty">Scheduled call requests will appear here.</p> : <><div className="adm-chatbot-table-wrap"><table className="adm-chatbot-table"><thead><tr><th>Name</th><th>Mobile</th><th>Email</th><th>Country</th><th>Visa type</th><th>Call date</th><th>Day</th><th>Time</th><th>Received</th></tr></thead><tbody>{visibleCalls.map(item => <tr key={item._id}><td>{item.name || '—'}</td><td>{item.phone || '—'}</td><td>{item.email || '—'}</td><td>{item.country || '—'}</td><td>{item.visaType || item.serviceNeeded || '—'}</td><td>{formatCallDate(item.details?.callDate)}</td><td>{formatCallDay(item)}</td><td>{item.details?.callTime || 'Not provided'}</td><td>{item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}</td></tr>)}</tbody></table></div><div className="adm-chatbot-pagination"><span>Page {callPage} of {callPages}</span><button type="button" onClick={() => setCallPage(page => Math.max(1, page - 1))} disabled={callPage <= 1}>Previous</button><button type="button" onClick={() => setCallPage(page => Math.min(callPages, page + 1))} disabled={callPage >= callPages}>Next</button></div></>}
    </section>
  </section>;
}
