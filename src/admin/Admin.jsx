import React, { useState, useEffect } from 'react';
import './Admin.css';
import { api } from '../api.js';

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
              <div className="adm-modal-grid">
                <div className="adm-detail-item">
                  <span className="label">Phone</span>
                  <span className="value"><a href={`tel:${selectedInquiry.phone}`}>{selectedInquiry.phone}</a></span>
                </div>
                <div className="adm-detail-item">
                  <span className="label">Email</span>
                  <span className="value">{selectedInquiry.email}</span>
                </div>
                <div className="adm-detail-item">
                  <span className="label">Category</span>
                  <span className="value">{selectedInquiry.category}</span>
                </div>
                <div className="adm-detail-item">
                  <span className="label">Country</span>
                  <span className="value">{selectedInquiry.country}</span>
                </div>
                <div className="adm-detail-item">
                  <span className="label">Visa Type</span>
                  <span className="value">{selectedInquiry.visaType}</span>
                </div>
                <div className="adm-detail-item">
                  <span className="label">Age Group</span>
                  <span className="value">{selectedInquiry.ageGroup}</span>
                </div>
                <div className="adm-detail-item">
                  <span className="label">Qualification</span>
                  <span className="value">{selectedInquiry.qualification}</span>
                </div>
                <div className="adm-detail-item">
                  <span className="label">Experience</span>
                  <span className="value">{selectedInquiry.experience}</span>
                </div>
                <div className="adm-detail-item">
                  <span className="label">Travel Date</span>
                  <span className="value">{selectedInquiry.travelDate}</span>
                </div>
                <div className="adm-detail-item">
                  <span className="label">Intake</span>
                  <span className="value">{selectedInquiry.intake}</span>
                </div>
                <div className="adm-detail-item">
                  <span className="label">Service Needed</span>
                  <span className="value">{selectedInquiry.serviceNeeded}</span>
                </div>
                <div className="adm-detail-item">
                  <span className="label">Message</span>
                  <span className="value">{selectedInquiry.message}</span>
                </div>
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
                  value={seoEdit ? seoEdit.pageUrl : seoForm.pageUrl || ''}
                  onChange={handleSeoChange}
                  name="pageUrl"
                  placeholder="e.g., /about"
                />
              </div>
              <div className="adm-form-group">
                <label>Meta Title</label>
                <input
                  value={seoEdit ? seoEdit.metaTitle : seoForm.metaTitle || ''}
                  onChange={handleSeoChange}
                  name="metaTitle"
                />
              </div>
              <div className="adm-form-group">
                <label>Meta Description</label>
                <input
                  value={seoEdit ? seoEdit.metaDescription : seoForm.metaDescription || ''}
                  onChange={handleSeoChange}
                  name="metaDescription"
                />
              </div>
              <div className="adm-form-group">
                <label>Keywords (comma separated)</label>
                <input
                  value={seoEdit ? seoEdit.keywords : seoForm.keywords || ''}
                  onChange={handleSeoChange}
                  name="keywords"
                />
              </div>
              <div className="adm-form-group">
                <label>Canonical URL</label>
                <input
                  value={seoEdit ? seoEdit.canonicalUrl : seoForm.canonicalUrl || ''}
                  onChange={handleSeoChange}
                  name="canonicalUrl"
                />
              </div>
              <div className="adm-form-group">
                <label>OG Image URL</label>
                <input
                  value={seoEdit ? seoEdit.ogImage : seoForm.ogImage || ''}
                  onChange={handleSeoChange}
                  name="ogImage"
                />
              </div>
              <div className="adm-form-group">
                <label>Custom Header Tags (HTML/Script)</label>
                <textarea
                  className="code"
                  value={seoEdit ? seoEdit.customHeaderTags : seoForm.customHeaderTags || ''}
                  onChange={handleSeoChange}
                  name="customHeaderTags"
                  rows="8"
                  placeholder={`<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  "name": "Visa For Nation" 
}
</script>`}
                />
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
                <p>Manage titles, descriptions, canonical URLs and header tags.</p>
              </div>
              <button type="button" className="adm-btn-primary" onClick={() => { setSeoEdit({}); setSeoForm({ pageUrl: '/', metaTitle: '', metaDescription: '', keywords: '', canonicalUrl: '', ogImage: '', customHeaderTags: '' }); }}>Add SEO</button>
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
                              ogImage: seo.ogImage,
                              customHeaderTags: seo.customHeaderTags
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
          <div className="adm-login-mark">VFN</div>
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

  const tabs = ['Leads Data', 'CMS', 'SEO'];
  return (
    <div className="adm-root">
      <header className="adm-header">
        <div className="adm-brand">
          <h2>Visa For Nation <span className="badge">ADMIN</span></h2>
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
          {activeTab === 0 ? renderInquiriesTab() : activeTab === 1 ? renderPagesTab() : renderSeoTab()}
        </main>
      </div>
    </div>
  );
}
