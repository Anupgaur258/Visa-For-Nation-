import React, { useState, useEffect } from 'react';
import './Admin.css';
import { api } from '../api.js';
import CareersAdmin from './CareersAdmin.jsx';
import BlogAdmin from './BlogAdmin.jsx';
import CMSSectionsAdmin from './CMSSectionsAdmin.jsx';
import PodcastAdmin from './PodcastAdmin.jsx';
import ChatbotAdmin from './ChatbotAdmin.jsx';
import * as XLSX from 'xlsx';
import { showAdminToast } from './adminToast.js';
import { ALL_PAGES } from '../data/pagesData.js';
import nav from '../data/nav.json';
import { countryFlagForPage } from '../data/heroTheme.js';


 // Token keys tempurary

const TOKEN_KEY = 'vfn-admin-token';
const EMAIL_KEY = 'vfn-admin-email';
const TAB_KEY = 'vfn-admin-active-tab';
const THEME_KEY = 'vfn-admin-theme';
const MAX_PAGE_CONTENT_SECTIONS = 50;
const pageUrlKey = page => String(page?.fullUrl || page?.slug || '').replace(/^\/+|\/+$/g, '').toLowerCase();
const PAGE_NAV_GROUPS = [
  { title: 'Migrate', groups: nav.migrate.filter(group => !['Work Permits', 'Job Assistance'].includes(group.title)) },
  { title: 'Work Permit', groups: nav.migrate.filter(group => group.title === 'Work Permits') },
  { title: 'Study Visa', groups: nav.study },
  { title: 'Travel Visa', groups: nav.tourist },
  { title: 'Job Assistance', groups: nav.migrate.filter(group => group.title === 'Job Assistance') },
  { title: 'Services', groups: nav.services },
];
const groupPagesByNavigation = pages => {
  const pagesByUrl = new Map(pages.map(page => [pageUrlKey(page), page]));
  const assigned = new Set();
  let serial = 0;
  const sections = PAGE_NAV_GROUPS.map(section => ({
    title: section.title,
    groups: section.groups.map(group => ({
      title: group.title || 'Destinations',
      pages: group.links.flatMap(link => {
        const key = pageUrlKey({ fullUrl: link.href });
        const page = pagesByUrl.get(key);
        if (!page || assigned.has(key)) return [];
        assigned.add(key);
        serial += 1;
        return [{ ...page, displayTitle: link.label, countryFlag: countryFlagForPage({ ...page, heroTitle: link.label }), serial }];
      }),
    })).filter(group => group.pages.length),
  })).filter(section => section.groups.length);
  const extras = pages.filter(page => !assigned.has(pageUrlKey(page)));
  if (extras.length) {
    const groups = new Map();
    extras.forEach(page => {
      const title = page.category
        ? page.category.replace(/[-_]/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())
        : 'Other';
      if (!groups.has(title)) groups.set(title, []);
      serial += 1;
      groups.get(title).push({
        ...page,
        displayTitle: page.heroTitle || page.fullUrl,
        countryFlag: countryFlagForPage(page),
        serial,
      });
    });
    sections.push({ title: 'Other Existing Pages', groups: [...groups].map(([title, groupedPages]) => ({ title, pages: groupedPages })) });
  }
  return sections;
};
const parsePageSections = content => {
  const html = String(content || '');
  const headingPattern = /<h2\b[^>]*>([\s\S]*?)<\/h2\s*>/gi;
  const matches = [...html.matchAll(headingPattern)];
  if (!matches.length) return { contentIntro: html, contentSections: [] };
  const decodeHeading = value => new DOMParser().parseFromString(value, 'text/html').body.textContent?.trim() || '';
  return {
    contentIntro: html.slice(0, matches[0].index),
    contentSections: matches.map((match, index) => ({
      title: decodeHeading(match[1]),
      content: html.slice(match.index + match[0].length, matches[index + 1]?.index ?? html.length).trim(),
    })),
  };
};
const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));
const compilePageContent = ({ contentIntro = '', contentSections = [] }) => (
  contentIntro + contentSections
    .filter(section => section.title.trim() || section.content.trim())
    .map(section => `${section.title.trim() ? `<h2>${escapeHTML(section.title.trim())}</h2>` : ''}${section.content}`)
    .join('\n')
);
const readActiveTab = () => {
  const saved = Number(localStorage.getItem(TAB_KEY));
  return Number.isInteger(saved) && saved >= 0 && saved < 9 ? saved : 0;
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState(readActiveTab);
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState(null);
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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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

  useEffect(() => { localStorage.setItem(TAB_KEY, String(activeTab)); }, [activeTab]);
  useEffect(() => { localStorage.setItem(THEME_KEY, theme); }, [theme]);
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const closeOnEscape = event => { if (event.key === 'Escape') setDrawerOpen(false); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [drawerOpen]);
  useEffect(() => {
    const onToast = event => {
      setToast(event.detail);
      window.clearTimeout(onToast.timeout);
      onToast.timeout = window.setTimeout(() => setToast(null), 3600);
    };
    window.addEventListener('vfn-admin-toast', onToast);
    return () => { window.removeEventListener('vfn-admin-toast', onToast); window.clearTimeout(onToast.timeout); };
  }, []);

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
      showAdminToast('Signed in successfully.');
    } catch (err) {
      setLoginError(err.message || 'Unable to sign in. Check your credentials and try again.');
      showAdminToast(err.message || 'Unable to sign in. Check your credentials and try again.', 'error');
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
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
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
      const savedPages = Array.isArray(res) ? res : [];
      const savedByUrl = new Map(savedPages.map(page => [pageUrlKey(page), page]));
      const bundledUrls = new Set(ALL_PAGES.map(pageUrlKey));
      const existingPages = ALL_PAGES.map(page => ({
        ...page,
        ...(savedByUrl.get(pageUrlKey(page)) || {}),
      }));
      const additionalSavedPages = savedPages.filter(page => !bundledUrls.has(pageUrlKey(page)));
      setPages([...existingPages, ...additionalSavedPages].sort((a, b) => String(a.heroTitle || '').localeCompare(String(b.heroTitle || ''))));
    } catch (err) {
      console.error('Failed to load pages', err);
      setPages(ALL_PAGES);
      showAdminToast(err.message || 'Could not load saved page content. Showing the existing page list; saving requires the backend.', 'error');
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
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
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
      showAdminToast(`Downloaded ${allLeads.length} lead${allLeads.length === 1 ? '' : 's'} to Excel.`);
    } catch (err) {
      setNotice(err.message || 'Unable to download leads. Please try again.');
      showAdminToast(err.message || 'Unable to download leads. Please try again.', 'error');
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
      showAdminToast('Inquiry status updated.');
      loadStats();
    } catch (err) {
      console.error('Failed to update inquiry', err);
      showAdminToast(err.message || 'Could not update inquiry status.', 'error');
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
      showAdminToast('Inquiry deleted.');
    } catch (err) {
      console.error('Failed to delete inquiry', err);
      showAdminToast(err.message || 'Could not delete inquiry.', 'error');
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
    const urlPattern = /^\/(?:[A-Za-z0-9/_-]*)$/;
    if (!urlPattern.test(String(seoForm.pageUrl || '').trim())) {
      setSeoValidation({ isValid: false, errors: ['Page URL must be a valid site path beginning with /.'], warnings: [] });
      showAdminToast('Page URL must be a valid site path beginning with /.', 'error');
      return;
    }
    if (String(seoForm.metaTitle || '').trim().length < 2 || String(seoForm.metaTitle || '').length > 70) {
      setSeoValidation({ isValid: false, errors: ['Meta title is required and must be 2 to 70 characters.'], warnings: [] });
      showAdminToast('Meta title is required and must be 2 to 70 characters.', 'error');
      return;
    }
    if (String(seoForm.metaDescription || '').trim().length < 20 || String(seoForm.metaDescription || '').length > 160) {
      setSeoValidation({ isValid: false, errors: ['Meta description must be 20 to 160 characters.'], warnings: [] });
      showAdminToast('Meta description must be 20 to 160 characters.', 'error');
      return;
    }
    for (const field of ['canonicalUrl', 'ogImage']) {
      if (seoForm[field] && !/^https?:\/\//i.test(seoForm[field].trim())) {
        setSeoValidation({ isValid: false, errors: [`${field === 'ogImage' ? 'OG image' : 'Canonical'} URL must begin with http:// or https://.`], warnings: [] });
        showAdminToast(`${field === 'ogImage' ? 'OG image' : 'Canonical'} URL must begin with http:// or https://.`, 'error');
        return;
      }
    }
    try {
      await adminApi('/admin/seo', { method: 'POST', body: { ...seoForm, ...(seoEdit?._id && { _id: seoEdit._id }) } });
      setSeoEdit(null);
      setSeoForm({});
      setSeoValidation(null);
      setNotice('SEO settings saved.');
      showAdminToast('SEO settings saved.');
      loadSeo();
    } catch (err) {
      console.error('Failed to save SEO', err);
      showAdminToast(err.message || 'Could not save SEO settings.', 'error');
    }
  };

  const deleteSeo = async (id) => {
    if (!window.confirm('Delete this SEO entry?')) return;
    try {
      await adminApi(`/admin/seo/${id}`, { method: 'DELETE' });
      loadSeo();
      showAdminToast('SEO entry deleted.');
    } catch (err) {
      console.error('Failed to delete SEO', err);
      showAdminToast(err.message || 'Could not delete SEO entry.', 'error');
    }
  };

  const beginPageEdit = (page = null) => {
    const { contentIntro, contentSections } = parsePageSections(page?.content);
    setEditingPage(page);
    setPageForm({
      contentIntro,
      contentSections,
    });
    showAdminToast('Existing page content loaded for editing.', 'info');
  };

  const savePage = async (event) => {
    event.preventDefault();
    if (pageForm.contentSections.length > MAX_PAGE_CONTENT_SECTIONS) {
      showAdminToast(`A page can have up to ${MAX_PAGE_CONTENT_SECTIONS} table of contents sections. Remove extra sections before saving.`, 'error');
      return;
    }
    if (pageForm.contentSections.some(section => !section.title.trim())) {
      showAdminToast('Enter a title for every table of contents section.', 'error');
      return;
    }
    const hasId = Boolean(editingPage?._id);
    const path = hasId ? `/admin/pages/${editingPage._id}` : '/admin/pages';
    try {
      await adminApi(path, {
        method: hasId ? 'PUT' : 'POST',
        body: {
          ...editingPage,
          content: compilePageContent(pageForm),
        },
      });
      setPageForm(null);
      setEditingPage(null);
      setNotice('Page content saved.');
      loadPages();
      showAdminToast('Page content saved.');
    } catch (err) {
      setNotice(err.message || 'Could not save page content.');
      showAdminToast(err.message || 'Could not save page content.', 'error');
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
    const analytics = [
      { label: 'Form submissions', value: Number(stats.totalInquiries ?? inquiries.length), className: 'red' },
      { label: 'New leads', value: Number(stats.newInquiries ?? 0), className: 'green' },
      { label: 'Website pages', value: Number(stats.pages ?? pages.length), className: 'orange' },
    ];
    const analyticsMax = Math.max(1, ...analytics.map(item => item.value));
    return (
      <div className="adm-tab-panel">
        <section className="adm-analytics-chart" aria-labelledby="adm-analytics-title">
          <div className="adm-analytics-chart-head"><div><span className="adm-analytics-eyebrow">AT A GLANCE</span><h2 id="adm-analytics-title">Admin analytics</h2><p>All-time totals across your website. Bars share a count scale.</p></div><span className="adm-analytics-live"><i /> Live totals</span></div>
          <div className="adm-analytics-plot" role="img" aria-label={analytics.map(item => `${item.label}: ${item.value}`).join(', ')}>
            {analytics.map(item => <div className={`adm-analytics-column ${item.className}`} key={item.label}>
              <strong>{item.value.toLocaleString()}</strong>
              <div className="adm-analytics-bar-track"><span style={{ height: `${Math.max(item.value > 0 ? 8 : 0, (item.value / analyticsMax) * 100)}%` }} /></div>
              <span className="adm-analytics-label">{item.label}</span>
            </div>)}
          </div>
        </section>

        <div className="adm-filters-card">
          <form onSubmit={(e) => { e.preventDefault(); handleSearchInquiries(); }} className="adm-filters-row">
            <input
              className="adm-search-input"
              type="search"
              maxLength={150}
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
            <label className="adm-date-filter"><span>From</span><input type="date" aria-label="Leads from date" max={dateTo || undefined} value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></label>
            <label className="adm-date-filter"><span>To</span><input type="date" aria-label="Leads to date" min={dateFrom || undefined} value={dateTo} onChange={e => setDateTo(e.target.value)} /></label>
            <button type="submit" className="adm-btn-primary" style={{ padding: '8px 14px' }}>Filter</button>
            <button type="button" className="adm-btn-secondary" style={{ padding: '8px 14px' }} onClick={downloadLeadsExcel} disabled={exportingLeads}>{exportingLeads ? 'Preparing Excel�' : 'Download .xlsx'}</button>
          </form>
        </div>

        <div className="adm-table-card">
          <div className="adm-table-wrap">
            <table className="adm-table adm-inquiries-table">
              <thead>
                <tr>
                  <th>No.</th>
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
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                      Loading form data…
                    </td>
                  </tr>
                ) : inquiries.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                      No form submissions found matching your filters.
                    </td>
                  </tr>
                ) : (
                  inquiries.map((inq, index) => (
                    <tr key={inq._id}>
                      <td><strong>{(inquiryPage - 1) * inquiryLimit + index + 1}</strong></td>
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
                        <span className="adm-country-value">{inq.country || 'N/A'}</span>
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
                          className={`adm-pill inquiry-status ${inq.status || 'new'}`}
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
    const navigationSections = groupPagesByNavigation(pages);
    return (
      <div className="adm-tab-panel">
        <div className="adm-section-heading">
          <div>
            <h2>Page Content</h2>
            <p>Edit Table of Contents titles and section content for existing website pages.</p>
          </div>
        </div>
        {pageForm ? (
          <form className="adm-cms-editor" onSubmit={savePage}>
            <div className="adm-seo-edit-header">
              <h3>Edit {editingPage?.heroTitle || 'page content'}</h3>
              <button type="button" className="adm-btn-action" onClick={() => { setPageForm(null); setEditingPage(null); }}>Cancel</button>
            </div>
            <div className="adm-page-content-sections">
              <div className="adm-page-content-section-actions">
                <span>{pageForm.contentSections.length} / {MAX_PAGE_CONTENT_SECTIONS} sections</span>
                <button
                  type="button"
                  className="adm-btn-primary"
                  disabled={pageForm.contentSections.length >= MAX_PAGE_CONTENT_SECTIONS}
                  onClick={() => setPageForm({ ...pageForm, contentSections: [...pageForm.contentSections, { title: '', content: '' }] })}
                >
                  Add Table of Contents
                </button>
              </div>
              {pageForm.contentSections.length > MAX_PAGE_CONTENT_SECTIONS && (
                <p className="adm-login-error" role="alert">This page currently has more than {MAX_PAGE_CONTENT_SECTIONS} sections. Remove extra sections before saving.</p>
              )}
              {pageForm.contentSections.length === 0 && (
                <p>No Table of Contents sections exist for this page yet. Use “Add Table of Contents” to create one.</p>
              )}
              {pageForm.contentSections.map((section, index) => (
                <div key={index} className="adm-page-content-section" style={{ display: 'grid', gap: 12, marginTop: 14, padding: 16, border: '1px solid var(--adm-line)', borderRadius: 10 }}>
                  <div className="adm-seo-edit-header">
                    <strong>Section {index + 1}</strong>
                    <button type="button" className="adm-btn-action red" onClick={() => setPageForm({ ...pageForm, contentSections: pageForm.contentSections.filter((_, sectionIndex) => sectionIndex !== index) })}>Remove</button>
                  </div>
                  <div className="adm-form-group">
                    <label htmlFor={`page-section-title-${index}`}>Table of Contents title</label>
                    <input required id={`page-section-title-${index}`} maxLength={160} value={section.title} onChange={event => setPageForm({ ...pageForm, contentSections: pageForm.contentSections.map((item, sectionIndex) => sectionIndex === index ? { ...item, title: event.target.value } : item) })} placeholder="Enter section title" />
                  </div>
                  <div className="adm-form-group">
                    <label htmlFor={`page-section-content-${index}`}>Content (HTML)</label>
                    <textarea id={`page-section-content-${index}`} className="code" rows="8" maxLength={50000} value={section.content} onChange={event => setPageForm({ ...pageForm, contentSections: pageForm.contentSections.map((item, sectionIndex) => sectionIndex === index ? { ...item, content: event.target.value } : item) })} placeholder="<p>Enter this section's content here.</p>" />
                  </div>
                </div>
              ))}
            </div>
            <button type="submit" className="adm-btn-primary">Save page</button>
          </form>
        ) : (
          navigationSections.length === 0
            ? <div className="adm-table-card"><p>No existing pages found.</p></div>
            : <div className="adm-page-navigation">
              {navigationSections.map((section, sectionIndex) => (
                <section className="adm-page-navigation-section" key={section.title}>
                  <h3>{sectionIndex + 1}. {section.title}</h3>
                  {section.groups.map(group => (
                    <div className="adm-page-navigation-subsection" key={`${section.title}-${group.title}`}>
                      <h4>{group.title}</h4>
                      <div className="adm-table-card">
                        <div className="adm-table-wrap">
                          <table className="adm-table adm-pages-table">
                            <thead><tr><th>No.</th><th>Page</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                            <tbody>{group.pages.map(page => (
                              <tr key={page._id || page.fullUrl}>
                                <td>{String(page.serial).padStart(2, '0')}</td>
                                <td><span className="adm-page-navigation-title">{page.countryFlag && <span aria-hidden="true">{page.countryFlag}</span>}{page.displayTitle}</span></td>
                                <td><span className={`adm-pill ${page.status || 'published'}`}>{page.status || 'published'}</span></td>
                                <td style={{ textAlign: 'right' }}><button type="button" className="adm-btn-action" onClick={() => beginPageEdit(page)}>Edit</button></td>
                              </tr>
                            ))}</tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              ))}
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
                <input required maxLength={180} pattern="/[A-Za-z0-9/_-]*" title="Use a page path such as /about or /visa/canada." type="text"
                  value={seoForm.pageUrl || ''}
                  onChange={handleSeoChange}
                  name="pageUrl"
                  placeholder="e.g., /about"
                />
              </div>
              <div className="adm-form-group">
                <label>Meta Title</label>
                <input required minLength={2} maxLength={70}
                  value={seoForm.metaTitle || ''}
                  onChange={handleSeoChange}
                  name="metaTitle" placeholder="e.g. Immigration Services | Visa For Nation" />
              </div>
              <div className="adm-form-group">
                <label>Meta Description</label>
                <input required minLength={20} maxLength={160}
                  value={seoForm.metaDescription || ''}
                  onChange={handleSeoChange}
                  name="metaDescription" placeholder="Summarize this page in up to 160 characters." />
              </div>

              <div className="adm-form-group">
                <label>Canonical URL</label>
                <input type="url" maxLength={500}
                  value={seoForm.canonicalUrl || ''}
                  onChange={handleSeoChange}
                  name="canonicalUrl" placeholder="https://www.example.com/about" />
              </div>
              <div className="adm-form-group">
                <label>OG Title</label>
                <input maxLength={70} value={seoForm.ogTitle || ''} onChange={handleSeoChange} name="ogTitle" placeholder="e.g. Visa For Nation | About Us" />
              </div>
              <div className="adm-form-group">
                <label>OG Description</label>
                <textarea maxLength={200} value={seoForm.ogDescription || ''} onChange={handleSeoChange} name="ogDescription" rows="3" placeholder="A short description for social sharing." />
              </div>
              <div className="adm-form-group">
                <label>OG Image URL</label>
                <input type="url" maxLength={500}
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
              <button type="button" className="adm-btn-primary" onClick={() => { setSeoEdit({}); setSeoForm({ pageUrl: '/', metaTitle: '', metaDescription: '', keywords: '', canonicalUrl: '', ogTitle: '', ogDescription: '', ogImage: '',  }); showAdminToast('New SEO entry form opened.', 'info'); }}>Add SEO</button>
            </div>
            <div className="adm-table-card">
              <div className="adm-table-wrap">
                <table className="adm-table adm-seo-table">
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
                            showAdminToast('SEO entry loaded for editing.', 'info');
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
        {toast && <div className={`adm-toast ${toast.type || 'success'}`} role={toast.type === 'error' ? 'alert' : 'status'}><span>{toast.message}</span><button type="button" aria-label="Dismiss notification" onClick={() => setToast(null)}>×</button></div>}
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

  const tabs = ['Leads Data', 'CMS', 'Blog Post', 'News', 'Podcast', 'SEO', 'Career', 'Chat Bot', 'Page Content'];
  return (
    <div className="adm-root" data-theme={theme}>
      {toast && <div className={`adm-toast ${toast.type || 'success'}`} role={toast.type === 'error' ? 'alert' : 'status'}><span>{toast.message}</span><button type="button" aria-label="Dismiss notification" onClick={() => setToast(null)}>×</button></div>}
      <header className="adm-header">
        <div className="adm-brand">
          <img className="adm-header-logo" src="/logo.png" alt="Visa For Nation" />
          <h2><span className="badge">ADMIN</span></h2>
          <span className="adm-account">{adminEmail}</span>
        </div>
        <div className="adm-actions">
          <button type="button" className="adm-theme-toggle" onClick={() => setTheme(current => current === 'light' ? 'dark' : 'light')} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}><span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</button>
          <a href="/">View website</a>
          <button type="button" className="adm-btn-logout" onClick={handleLogout}>Sign out</button>
        </div>
      </header>
      <div className="adm-workspace">
        <div className="adm-page-heading">
          <div><span>CONTROL PANEL</span><h1>Website management</h1></div>
          {notice && <div className="adm-notice" role="status">{notice}<button type="button" aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}
        </div>
        <div className="adm-navigation-actions">
          <button type="button" className="adm-drawer-toggle" aria-expanded={drawerOpen} aria-controls="adm-tabs-drawer" onClick={() => setDrawerOpen(value => !value)}><i aria-hidden="true">☰</i> All sections</button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 8}
            className={`adm-page-content-tab${activeTab === 8 ? ' active' : ''}`}
            onClick={() => { setActiveTab(8); setDrawerOpen(false); }}
          >
            Page Content
          </button>
        </div>
        {drawerOpen && <button type="button" className="adm-drawer-backdrop" aria-label="Close admin navigation" onClick={() => setDrawerOpen(false)} />}
        <nav id="adm-tabs-drawer" className={`adm-nav-tabs adm-tabs-drawer${drawerOpen ? ' is-open' : ''}`} role="tablist" aria-label="Admin sections" aria-hidden={!drawerOpen}>
          <div className="adm-drawer-heading"><strong>Workspace</strong><span>Manage your website</span></div>
          {tabs.map((label, index) => (
            <button key={label} type="button" role="tab" aria-selected={activeTab === index} tabIndex={drawerOpen ? 0 : -1} className={`adm-nav-tab${activeTab === index ? ' active' : ''}`} onClick={() => { setActiveTab(index); setDrawerOpen(false); }}>
              <span className="adm-nav-icon" aria-hidden="true">{label.slice(0, 1)}</span><span className="adm-nav-label">{label}</span>{index === 0 && stats.newInquiries > 0 && <span className="adm-tab-pill">{stats.newInquiries}</span>}
            </button>
          ))}
        </nav>
        <main className="adm-body">
          {activeTab === 0 ? renderInquiriesTab() : activeTab === 1 ? <CMSSectionsAdmin /> : activeTab === 2 ? <BlogAdmin /> : activeTab === 3 ? <BlogAdmin type="news" /> : activeTab === 4 ? <PodcastAdmin /> : activeTab === 5 ? renderSeoTab() : activeTab === 6 ? <CareersAdmin /> : activeTab === 7 ? <ChatbotAdmin token={token} /> : renderPagesTab()}
        </main>
      </div>
    </div>
  );
}
