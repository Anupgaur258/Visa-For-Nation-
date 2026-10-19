import React, { useState, useEffect } from 'react';
import './Admin.css';
import { api } from '../api.js';
import CareersAdmin from './CareersAdmin.jsx';
import BlogAdmin from './BlogAdmin.jsx';
import CMSSectionsAdmin from './CMSSectionsAdmin.jsx';
import * as XLSX from 'xlsx';


 // Token keys tempurary

const TOKEN_KEY = 'vfn-admin-token';
const EMAIL_KEY = 'vfn-admin-email';

export default function Admin() {
  const [activeTab, setActiveTab] = useState(0);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem(EMAIL_KEY) || '');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [stats, setStats] = useState({});
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [pages, setPages] = useState([]);
  const [editingPage, setEditingPage] = useState(null);
  const [pageForm, setPageForm] = useState(null);
  const [seoList, setSeoList] = useState([]);
  const [seoEdit, setSeoEdit] = useState(null);
  const [seoForm, setSeoForm] = useState({});
  const [seoValidation, setSeoValidation] = useState(null);
  const [notice, setNotice] = useState('');

  // Pagination states
  const [inquiryPage, setInquiryPage] = useState(1);
  const [inquiryTotal, setInquiryTotal] = useState(0);
  const [inquiryLimit] = useState(10);
  const [exportingLeads, setExportingLeads] = useState(false);

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const adminApi = async (path, options = {}) => {
    try {
      return await api(path, { ...options, token });
    } catch (err) {
      if (err.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(EMAIL_KEY);
        setToken('');
        setAdminEmail('');
      }
      throw err;
    }
  };

  useEffect(() => {
    if (!token) return;
    loadStats();
    loadInquiries();
    loadPages();
    loadSeo();
  }, [token]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      const session = await api('/admin/login', { method: 'POST', body: loginForm });
      localStorage.setItem(TOKEN_KEY, session.token);
      localStorage.setItem(EMAIL_KEY, session.email);
      setToken(session.token);
      setAdminEmail(session.email);
      setLoginForm({ email: '', password: '' });
    } catch (err) {
      setLoginError(err.message || 'Unable to sign in. Check your credentials and try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setToken('');
    setAdminEmail('');
  };

  const loadStats = async () => {
    try {
      const res = await adminApi('/admin/stats');
      setStats(res);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const loadInquiries = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (countryFilter !== 'All') params.append('country', countryFilter);
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (search) params.append('q', search);
      params.append('page', page.toString());
      params.append('limit', inquiryLimit.toString());
      const res = await adminApi(`/admin/inquiries?${params.toString()}`);
      setInquiries(res.inquiries || []);
      setInquiryTotal(res.total || 0);
      setInquiryPage(page);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load inquiries', err);
      setLoading(false);
    }
  };

  const loadPages = async () => {
    try {
      const res = await adminApi('/admin/pages');
      setPages(res || []);
    } catch (err) {
      console.error('Failed to load pages', err);
    }
  };

  const loadSeo = async () => {
    try {
      const res = await adminApi('/admin/seo');
      setSeoList(res || []);
    } catch (err) {
      console.error('Failed to load SEO', err);
    }
  };

  const handleSearchInquiries = () => {
    loadInquiries(1);
  };
  const downloadLeadsExcel = async () => {
    setExportingLeads(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (countryFilter !== 'All') params.append('country', countryFilter);
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (search.trim()) params.append('q', search.trim());
      const pageSize = 100;
      params.set('page', '1');
      params.set('limit', String(pageSize));
      const firstPage = await adminApi(`/admin/inquiries?${params.toString()}`);
      const allLeads = [...(firstPage.inquiries || [])];
      const totalPages = Math.ceil((firstPage.total || allLeads.length) / pageSize);
      for (let page = 2; page <= totalPages; page += 1) {
        params.set('page', String(page));
        const result = await adminApi(`/admin/inquiries?${params.toString()}`);
        allLeads.push(...(result.inquiries || []));
      }
      const rows = allLeads.map(lead => ({
        'Date Received': lead.createdAt ? new Date(lead.createdAt).toLocaleString() : '',
        'Candidate Name': lead.name || '', Phone: lead.phone || '', Email: lead.email || '',
        Category: lead.category || '', Country: lead.country || '', 'Visa Type': lead.visaType || '',
        'Age Group': lead.ageGroup || '', Qualification: lead.qualification || '', Experience: lead.experience || '',
        'Language Score': lead.languageScore || '', 'Travel Date': lead.travelDate || '', Intake: lead.intake || '',
        'Service Needed': lead.serviceNeeded || '', Message: lead.message || '', 'Source Page': lead.sourcePage || '',
        Status: lead.status || '', Notes: lead.notes || '',
      }));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), 'Leads');
      XLSX.writeFile(workbook, `leads-${new Date().toISOString().slice(0, 10)}.xlsx`);
      setNotice(`Downloaded ${allLeads.length} lead${allLeads.length === 1 ? '' : 's'} to Excel.`);
    } catch (err) {
      setNotice(err.message || 'Unable to download leads. Please try again.');
    } finally {
      setExportingLeads(false);
    }
  };

  const updateInquiryStatus = async (id, newStatus) => {
    try {
      await adminApi(`/admin/inquiries/${id}`, { method: 'PUT', body: { status: newStatus } });
      setInquiries(prev => prev.map(i => i._id === id ? { ...i, status: newStatus } : i));
      if (selectedInquiry?._id === id) {
        setSelectedInquiry(prev => ({ ...prev, status: newStatus }));
      }
      loadStats();
    } catch (err) {
      console.error('Failed to update inquiry', err);
    }
  };

  const deleteInquiry = async (id) => {
    if (!window.confirm('Delete this inquiry?')) return;
    try {
      await adminApi(`/admin/inquiries/${id}`, { method: 'DELETE' });
      setInquiries(prev => prev.filter(i => i._id !== id));
      if (selectedInquiry?._id === id) setSelectedInquiry(null);
      loadStats();
      loadInquiries(inquiryPage);
    } catch (err) {
      console.error('Failed to delete inquiry', err);
    }
  };

  const openInquiryModal = (inq) => {
    setSelectedInquiry(inq);
  };

  const closeInquiryModal = () => {
    setSelectedInquiry(null);
  };

  const handleSeoChange = (e) => {
    const { name, value } = e.target;
    setSeoForm(prev => ({ ...prev, [name]: value }));
  };

  const saveSeo = async () => {
    try {
      await adminApi('/admin/seo', { method: 'POST', body: { ...seoForm, ...(seoEdit?._id && { _id: seoEdit._id }) } });
      setSeoEdit(null);
      setSeoForm({});
      setSeoValidation(null);
      setNotice('SEO settings saved.');
      loadSeo();
    } catch (err) {
      console.error('Failed to save SEO', err);
    }
  };

  const deleteSeo = async (id) => {
    if (!window.confirm('Delete this SEO entry?')) return;
    try {
      await adminApi(`/admin/seo/${id}`, { method: 'DELETE' });
      loadSeo();
    } catch (err) {
      console.error('Failed to delete SEO', err);
    }
  };

  const deletePage = async (id) => {
    if (!window.confirm('Delete this page?')) return;
    try {
      await adminApi(`/admin/pages/${id}`, { method: 'DELETE' });
      loadPages();
    } catch (err) {
      console.error('Failed to delete page', err);
    }
  };

  const beginPageEdit = (page = null) => {
    setEditingPage(page);
    setPageForm({
      fullUrl: page?.fullUrl || page?.slug || '',
      heroBadge: page?.heroBadge || '',
      heroTitle: page?.heroTitle || '',
      heroDesc: page?.heroDesc || '',
      bannerImage: page?.bannerImage || '',
      content: page?.content || '',
      metaTitle: page?.metaTitle || '',
      metaDescription: page?.metaDescription || '',
      status: page?.status || 'published',
    });
  };

  const savePage = async (event) => {
    event.preventDefault();
    const hasId = Boolean(editingPage?._id);
    const path = hasId ? `/admin/pages/${editingPage._id}` : '/admin/pages';
    try {
      await adminApi(path, {
        method: hasId ? 'PUT' : 'POST',
        body: {
          ...editingPage,
          ...pageForm,
          fullUrl: pageForm.fullUrl.replace(/^\/+|\/+$/g, ''),
        },
      });
      setPageForm(null);
      setEditingPage(null);
      setNotice('Page content saved.');
      loadPages();
    } catch (err) {
      setNotice(err.message || 'Could not save page content.');
    }
  };

  const validateSeo = async () => {
    try {
      setSeoValidation(await adminApi('/admin/seo/validate', { method: 'POST', body: seoForm }));
    } catch (err) {
      setSeoValidation({ isValid: false, errors: [err.message], warnings: [] });
    }
  };

  const totalPages = Math.ceil(inquiryTotal / inquiryLimit);

  const renderInquiriesTab = () => {
    return (
      <div className="adm-tab-panel">
        <div className="adm-stats-grid">
          <div className="adm-stat-card">
            <span className="label">Total Form Submissions</span>
            <span className="num">{stats.totalInquiries ?? inquiries.length}</span>
            <span className="sub">All categories</span>
          </div>
          <div className="adm-stat-card">
            <span className="label">New Leads</span>
            <span className="num" style={{ color: '#B51226' }}>{stats.newInquiries ?? 0}</span>
            <span className="sub">Needs follow-up</span>
          </div>
          <div className="adm-stat-card">
            <span className="label">Website Pages</span>
            <span className="num">{stats.pages ?? pages.length}</span>
            <span className="sub">Managed in CMS</span>
          </div>
        </div>

        <div className="adm-filters-card">
          <form onSubmit={(e) => { e.preventDefault(); handleSearchInquiries(); }} className="adm-filters-row">
            <input
              className="adm-search-input"
              placeholder="Search by Name, Phone, Email, Country…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="adm-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="All">All Categories</option>
              {["All", "PR Visa", "Tourist Visa", "Study Visa", "Work Permit", "Services & Coaching", "General"].map(cat => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
            <select className="adm-select" value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
              <option value="All">All Countries</option>
              {["All", "Canada", "Australia", "USA", "UK", "Germany", "Singapore", "Portugal", "Schengen Area", "Ireland", "New Zealand"].map(country => (<option key={country} value={country}>{country}</option>))}
            </select>
            <select className="adm-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
            <button type="submit" className="adm-btn-primary" style={{ padding: '8px 14px' }}>Filter</button>
            <button type="button" className="adm-btn-secondary" style={{ padding: '8px 14px' }} onClick={downloadLeadsExcel} disabled={exportingLeads}>{exportingLeads ? 'Preparing Excel�' : 'Download .xlsx'}</button>
          </form>
        </div>

        <div className="adm-table-card">
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Candidate Name & Contact</th>
                  <th>Category</th>
                  <th>Country / Visa</th>
                  <th>Profile Overview</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                      Loading form data…
                    </td>
                  </tr>
                ) : inquiries.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                      No form submissions found matching your filters.
                    </td>
                  </tr>
                ) : (
                  inquiries.map(inq => (
                    <tr key={inq._id}>
                      <td>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>
                          {new Date(inq.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <br />
                        <small style={{ color: '#94A3B8' }}>{new Date(inq.createdAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</small>
                      </td>
                      <td>
                        <strong style={{ fontSize: '14px', color: '#0F172A' }}>{inq.name}</strong>
                        <br />
                        <a href={`tel:${inq.phone}`} style={{ color: '#2563EB', textDecoration: 'none', fontSize: '12px', fontWeight: 600 }}>
                          📞 {inq.phone}
                        </a>
                        {inq.email && (
                          <>
                            <br />
                            <span style={{ fontSize: '12px', color: '#64748B' }}>✉ {inq.email}</span>
                          </>
                        )}
                      </td>
                      <td>
                        <span className="adm-pill new" style={{ background: '#F1F5F9', color: '#334155' }}>
                          {inq.category || 'General'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#0F172A' }}>{inq.country || 'N/A'}</span>
                        {inq.visaType && <div style={{ fontSize: '11px', color: '#64748B' }}>{inq.visaType}</div>}
                      </td>
                      <td style={{ maxWidth: '240px' }}>
                        <div style={{ fontSize: '12px', color: '#334155', lineHeight: 1.4 }}>
                          {inq.ageGroup && <span>Age: {inq.ageGroup} · </span>}
                          {inq.qualification && <span>{inq.qualification} · </span>}
                          {inq.experience && <span>Exp: {inq.experience}</span>}
                          {inq.travelDate && <span>Travel: {inq.travelDate}</span>}
                          {inq.intake && <span>Intake: {inq.intake}</span>}
                          {inq.serviceNeeded && <span>Service: {inq.serviceNeeded}</span>}
                          {!inq.ageGroup && !inq.experience && !inq.travelDate && !inq.serviceNeeded && (
                            <span style={{ color: '#64748B' }}>{inq.message ? inq.message.slice(0, 45) + '…' : 'General Inquiry'}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <select
                          value={inq.status || 'new'}
                          onChange={e => updateInquiryStatus(inq._id, e.target.value)}
                          className="adm-pill"
                          style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="in_progress">In Progress</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button className="adm-btn-action" onClick={() => openInquiryModal(inq)}>
                          View Details
                        </button>
                        <button className="adm-btn-action red" onClick={() => deleteInquiry(inq._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="adm-pagination">
              <button
                className="adm-btn-action"
                onClick={() => loadInquiries(inquiryPage - 1)}
                disabled={inquiryPage <= 1}
              >
                Previous
              </button>
              <span className="adm-page-info">
                Page {inquiryPage} of {totalPages} ({inquiryTotal} total)
              </span>
              <button
                className="adm-btn-action"
                onClick={() => loadInquiries(inquiryPage + 1)}
                disabled={inquiryPage >= totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Inquiry Details Modal */}
        {selectedInquiry && (
          <div className="adm-modal-overlay" onClick={closeInquiryModal}>
            <div className="adm-modal" onClick={e => e.stopPropagation()}>
              <div className="adm-modal-head">
                <div>
                  <span className="adm-pill new">{selectedInquiry.category}</span>
                  <h3 style={{ marginTop: '6px' }}>{selectedInquiry.name}</h3>
                </div>
                <button className="adm-modal-close" onClick={closeInquiryModal}>✕</button>
              </div>
              <div className="adm-inquiry-contact">
                {selectedInquiry.phone && <a href={`tel:${selectedInquiry.phone}`}><span>Phone</span><strong>{selectedInquiry.phone}</strong></a>}
                {selectedInquiry.email && <a href={`mailto:${selectedInquiry.email}`}><span>Email</span><strong>{selectedInquiry.email}</strong></a>}
              </div>
              <div className="adm-modal-grid">
                {[
                  ['Category', selectedInquiry.category],
                  ['Country', selectedInquiry.country],
                  ['Visa type', selectedInquiry.visaType],
                  ['Age group', selectedInquiry.ageGroup],
                  ['Qualification', selectedInquiry.qualification],
                  ['Experience', selectedInquiry.experience],
                  ['Travel date', selectedInquiry.travelDate],
                  ['Intake', selectedInquiry.intake],
                  ['Service needed', selectedInquiry.serviceNeeded],
                ].filter(([, value]) => value != null && String(value).trim() !== '').map(([label, value]) => (
                  <div className="adm-detail-item" key={label}>
                    <span className="label">{label}</span>
                    <span className="value">{value}</span>
                  </div>
                ))}
                {selectedInquiry.message && String(selectedInquiry.message).trim() && (
                  <div className="adm-detail-item adm-detail-message">
                    <span className="label">Message</span>
                    <span className="value">{selectedInquiry.message}</span>
                  </div>
                )}
                {!selectedInquiry.phone && !selectedInquiry.email && ![
                  selectedInquiry.category, selectedInquiry.country, selectedInquiry.visaType,
                  selectedInquiry.ageGroup, selectedInquiry.qualification, selectedInquiry.experience,
                  selectedInquiry.travelDate, selectedInquiry.intake, selectedInquiry.serviceNeeded,
                  selectedInquiry.message,
                ].some(value => value != null && String(value).trim() !== '') && (
                  <p className="adm-inquiry-empty">No additional details were provided.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPagesTab = () => {
    return (
      <div className="adm-tab-panel">
        <div className="adm-section-heading">
          <div>
            <h2>Website content</h2>
            <p>Edit published page copy and metadata.</p>
          </div>
          {!pageForm && <button type="button" className="adm-btn-primary" onClick={() => beginPageEdit()}>Add page</button>}
        </div>
        {pageForm ? (
          <form className="adm-cms-editor" onSubmit={savePage}>
            <div className="adm-seo-edit-header">
              <h3>{editingPage ? 'Edit page' : 'New page'}</h3>
              <button type="button" className="adm-btn-action" onClick={() => { setPageForm(null); setEditingPage(null); }}>Cancel</button>
            </div>
            <div className="adm-editor-grid">
              <div className="adm-form-group">
                <label>Page path</label>
                <input required name="fullUrl" value={pageForm.fullUrl} onChange={e => setPageForm({ ...pageForm, fullUrl: e.target.value })} placeholder="visa/pr/canada" />
              </div>
              <div className="adm-form-group">
                <label>Hero title</label>
                <input required name="heroTitle" value={pageForm.heroTitle} onChange={e => setPageForm({ ...pageForm, heroTitle: e.target.value })} />
              </div>
              <div className="adm-form-group">
                <label>Hero label</label>
                <input name="heroBadge" value={pageForm.heroBadge} onChange={e => setPageForm({ ...pageForm, heroBadge: e.target.value })} />
              </div>
              <div className="adm-form-group">
                <label>Banner image URL</label>
                <input name="bannerImage" value={pageForm.bannerImage} onChange={e => setPageForm({ ...pageForm, bannerImage: e.target.value })} />
              </div>
              <div className="adm-form-group adm-form-wide">
                <label>Hero description</label>
                <textarea rows="3" name="heroDesc" value={pageForm.heroDesc} onChange={e => setPageForm({ ...pageForm, heroDesc: e.target.value })} />
              </div>
              <div className="adm-form-group">
                <label>Meta title</label>
                <input name="metaTitle" value={pageForm.metaTitle} onChange={e => setPageForm({ ...pageForm, metaTitle: e.target.value })} />
              </div>
              <div className="adm-form-group">
                {/* this is the >< lagel for <> meta Description  SEO */}
                <label>Meta description</label>
                <textarea rows="3" name="metaDescription" value={pageForm.metaDescription} onChange={e => setPageForm({ ...pageForm, metaDescription: e.target.value })} />
              </div>
              <div className="adm-form-group adm-form-wide">
                <label>Page content (HTML)</label>
                <textarea className="code" rows="16" name="content" value={pageForm.content} onChange={e => setPageForm({ ...pageForm, content: e.target.value })} />
              </div>
              <div className="adm-form-group">
                <label>Publish status</label>
                <select name="status" value={pageForm.status} onChange={e => setPageForm({ ...pageForm, status: e.target.value })}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
            <button type="submit" className="adm-btn-primary">Save page</button>
          </form>
        ) : (
          <div className="adm-table-card">
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr><th>Title</th><th>Path</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
                </thead>
                <tbody>
                  {pages.length === 0 ? <tr><td colSpan="4">No pages found.</td></tr> : pages.map(page => (
                    <tr key={page._id || page.fullUrl}>
                      <td>{page.heroTitle}</td>
                      <td>/{page.fullUrl || page.slug}</td>
                      <td><span className={`adm-pill ${page.status || 'draft'}`}>{page.status || 'draft'}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <button type="button" className="adm-btn-action" onClick={() => beginPageEdit(page)}>Edit</button>
                        {page._id && <button type="button" className="adm-btn-action red" onClick={() => deletePage(page._id)}>Delete</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSeoTab = () => {
    return (
      <div className="adm-tab-panel">
        {seoEdit ? (
          <div className="adm-seo-edit-card">
            <div className="adm-seo-edit-header">
              <h3>{seoEdit ? 'Edit SEO' : 'Add New SEO'}</h3>
              <button className="adm-btn-action" onClick={() => setSeoEdit(null)}>Cancel</button>
            </div>
            <div className="adm-seo-edit-body">
              <div className="adm-form-group">
                <label>Page URL</label>
                <input
                  value={seoForm.pageUrl || ''}
                  onChange={handleSeoChange}
                  name="pageUrl"
                  placeholder="e.g., /about"
                />
              </div>
              <div className="adm-form-group">
                <label>Meta Title</label>
                <input
                  value={seoForm.metaTitle || ''}
                  onChange={handleSeoChange}
                  name="metaTitle" placeholder="e.g. Immigration Services | Visa For Nation" />
              </div>
              <div className="adm-form-group">
                <label>Meta Description</label>
                <input
                  value={seoForm.metaDescription || ''}
                  onChange={handleSeoChange}
                  name="metaDescription" placeholder="Summarize this page in up to 160 characters." />
              </div>

              <div className="adm-form-group">
                <label>Canonical URL</label>
                <input
                  value={seoForm.canonicalUrl || ''}
                  onChange={handleSeoChange}
                  name="canonicalUrl" placeholder="https://www.example.com/about" />
              </div>
              <div className="adm-form-group">
                <label>OG Title</label>
                <input value={seoForm.ogTitle || ''} onChange={handleSeoChange} name="ogTitle" placeholder="e.g. Visa For Nation | About Us" />
              </div>
              <div className="adm-form-group">
                <label>OG Description</label>
                <textarea value={seoForm.ogDescription || ''} onChange={handleSeoChange} name="ogDescription" rows="3" placeholder="A short description for social sharing." />
              </div>
              <div className="adm-form-group">
                <label>OG Image URL</label>
                <input
                  value={seoForm.ogImage || ''}
                  onChange={handleSeoChange}
                  name="ogImage" placeholder="https://www.example.com/images/share.jpg" />
              </div>
              <div className="adm-form-group">
                <button className="adm-btn-primary" onClick={saveSeo}>
                  {seoEdit ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="adm-section-heading">
              <div>
                <h2>Search metadata</h2>
                <p>Manage meta titles, descriptions, canonical URLs and Open Graph details.</p>
              </div>
              <button type="button" className="adm-btn-primary" onClick={() => { setSeoEdit({}); setSeoForm({ pageUrl: '/', metaTitle: '', metaDescription: '', keywords: '', canonicalUrl: '', ogTitle: '', ogDescription: '', ogImage: '',  }); }}>Add SEO</button>
            </div>
            <div className="adm-table-card">
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Page URL</th>
                      <th>Meta Title</th>
                      <th>Meta Description</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seoList.map(seo => (
                      <tr key={seo._id}>
                        <td>{seo.pageUrl}</td>
                        <td>{seo.metaTitle}</td>
                        <td>{seo.metaDescription}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="adm-btn-action" onClick={() => {
                            setSeoEdit(seo);
                            setSeoForm({
                              pageUrl: seo.pageUrl,
                              metaTitle: seo.metaTitle,
                              metaDescription: seo.metaDescription,
                              keywords: seo.keywords,
                              canonicalUrl: seo.canonicalUrl,
                              ogTitle: seo.ogTitle,
                              ogDescription: seo.ogDescription,
                              ogImage: seo.ogImage,
                            });
                          }}>
                            Edit
                          </button>
                          <button className="adm-btn-action red" onClick={() => deleteSeo(seo._id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="adm-seo-validator">
              <button className="adm-btn-primary" onClick={validateSeo}>Validate SEO fields</button>
              {seoValidation && (
                <div className={`adm-validation-banner ${seoValidation.isValid ? 'ok' : 'err'}`}>
                  {seoValidation.errors.map((error, index) => <div key={`error-${index}`}>{error}</div>)}
                  {seoValidation.warnings.map((warning, index) => <div key={`warning-${index}`}>{warning}</div>)}
                  {seoValidation.isValid && seoValidation.warnings.length === 0 && 'SEO fields look good.'}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  if (!token) {
    return (
      <main className="adm-login-wrap">
        <form className="adm-login-card" onSubmit={handleLogin}>
          <img className="adm-login-logo" src="/logo.png" alt="Visa For Nation" />
          <h1>Admin sign in</h1>
          <p>Sign in to manage leads, website content and SEO.</p>
          <label className="adm-form-group">
            <span>Email address</span>
            <input type="email" autoComplete="username" required value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />
          </label>
          <label className="adm-form-group">
            <span>Password</span>
            <input type="password" autoComplete="current-password" required value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
          </label>
          {loginError && <div className="adm-login-error" role="alert">{loginError}</div>}
          <button className="adm-btn-primary" type="submit" disabled={loggingIn}>{loggingIn ? 'Signing in...' : 'Sign in'}</button>
          <a className="adm-login-back" href="/">Back to website</a>
        </form>
      </main>
    );
  }

  const tabs = ['Leads Data', 'CMS', 'Blog Post', 'SEO', 'Career'];
  return (
    <div className="adm-root">
      <header className="adm-header">
        <div className="adm-brand">
          <img className="adm-header-logo" src="/assets/assets/img/logo-white.svg" alt="Visa For Nation" />
          <h2><span className="badge">ADMIN</span></h2>
          <span className="adm-account">{adminEmail}</span>
        </div>
        <div className="adm-actions">
          <a href="/">View website</a>
          <button type="button" className="adm-btn-logout" onClick={handleLogout}>Sign out</button>
        </div>
      </header>
      <div className="adm-workspace">
        <div className="adm-page-heading">
          <div><span>CONTROL PANEL</span><h1>Website management</h1></div>
          {notice && <div className="adm-notice" role="status">{notice}<button type="button" aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}
        </div>
        <nav className="adm-nav-tabs" role="tablist" aria-label="Admin sections">
          {tabs.map((label, index) => (
            <button key={label} type="button" role="tab" aria-selected={activeTab === index} className={`adm-nav-tab${activeTab === index ? ' active' : ''}`} onClick={() => setActiveTab(index)}>
              {label}{index === 0 && stats.newInquiries > 0 && <span className="adm-tab-pill">{stats.newInquiries}</span>}
            </button>
          ))}
        </nav>
        <main className="adm-body">
          {activeTab === 0 ? renderInquiriesTab() : activeTab === 1 ? <CMSSectionsAdmin /> : activeTab === 2 ? <BlogAdmin /> : activeTab === 3 ? renderSeoTab() : <CareersAdmin />}
        </main>
      </div>
    </div>
  );
}
