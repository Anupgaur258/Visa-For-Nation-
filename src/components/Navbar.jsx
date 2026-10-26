import { useLayoutEffect, useRef, useState } from 'react';
import EnquiryForm from './EnquiryForm.jsx';
import { Link, NavLink } from 'react-router-dom';
import nav from '../data/nav.json';
const PHONE = import.meta.env.VITE_PHONE;
const MENUS = [['Migrate', 'migrate'], ['Work Permit', 'work-permit'], ['Study Visa', 'study'], ['Travel Visa', 'tourist'], ['Job Assistance', 'job-assistance'], ['Services', 'services']];
const MENU_CONTENT = {
  ...nav,
  migrate: nav.migrate.filter(group => !['Work Permits', 'Job Assistance'].includes(group.title)),
  'work-permit': nav.migrate.filter(group => group.title === 'Work Permits'),
  'job-assistance': nav.migrate.filter(group => group.title === 'Job Assistance'),
};
const FLIP = ['services', 'study'];
const PAY = 'https://payments.cashfree.com/forms/visafornattion';
const REGION_ORDER = ['Europe', 'Asia-Pacific', 'Americas'];
const QUICK_LINKS = [
  ['Home', '/'], ['Blog', '/blog'], ['News', '/news'], ['Podcast', '/podcast'], ['About Us', '/about'], ['Careers', '/careers'],
  ['Gallery', '/our-gellary'], ['Testimonials', '/#testimonials'], ['Contact Us', '/contact-us'],
];
const COUNTRIES = [
  { code: 'ca', name: 'Canada', region: 'Americas', aliases: ['canada', 'ontario', 'british-columbia', 'alberta', 'saskatchewan', 'nova-scotia', 'express-entry', 'nominee-program'] },
  { code: 'us', name: 'United States', region: 'Americas', aliases: ['usa', 'united-states'] },
  { code: 'au', name: 'Australia', region: 'Asia-Pacific', aliases: ['australia', 'subclass-'] },
  { code: 'nz', name: 'New Zealand', region: 'Asia-Pacific', aliases: ['new-zealand', 'newzealand'] },
  { code: 'sg', name: 'Singapore', region: 'Asia-Pacific', aliases: ['singapore'] },
  { code: 'hk', name: 'Hong Kong', region: 'Asia-Pacific', aliases: ['hong-kong'] },
  { code: 'eu', name: 'Europe', region: 'Europe', aliases: ['schengen'] },
  { code: 'de', name: 'Germany', region: 'Europe', aliases: ['germany'] },
  { code: 'pt', name: 'Portugal', region: 'Europe', aliases: ['portugal'] },
  { code: 'mt', name: 'Malta', region: 'Europe', aliases: ['malta'] },
  { code: 'ie', name: 'Ireland', region: 'Europe', aliases: ['ireland'] },
  { code: 'gr', name: 'Greece', region: 'Europe', aliases: ['greece'] },
  { code: 'nl', name: 'Netherlands', region: 'Europe', aliases: ['netherlands'] },
  { code: 'ch', name: 'Switzerland', region: 'Europe', aliases: ['switzerland'] },
  { code: 'gb', name: 'United Kingdom', region: 'Europe', aliases: ['united-kingdom', 'uk', '/uk', 'uk-'] },
  { code: 'lu', name: 'Luxembourg', region: 'Europe', aliases: ['luxembourg'] },
  { code: 'fr', name: 'France', region: 'Europe', aliases: ['france'] },
  { code: 'it', name: 'Italy', region: 'Europe', aliases: ['italy'] },
  { code: 'dk', name: 'Denmark', region: 'Europe', aliases: ['denmark'] },
  { code: 'no', name: 'Norway', region: 'Europe', aliases: ['norway'] },
  { code: 'es', name: 'Spain', region: 'Europe', aliases: ['spain'] },
  { code: 'sk', name: 'Slovakia', region: 'Europe', aliases: ['slovakia'] },
  { code: 'lt', name: 'Lithuania', region: 'Europe', aliases: ['lithuania'] },
];
const getCountryInfo = (label = '', href = '') => {
  const value = `${label} ${href}`.toLowerCase();
  return COUNTRIES.find(country => country.aliases.some(alias => value.includes(alias)));
};
const CountryFlag = ({ country }) => country ? (
  <svg className="country-flag" viewBox="0 0 36 24" aria-hidden="true" focusable="false">
    <use href={`/country-flags.svg#${country.code}`} />
  </svg>
) : null;

export default function Navbar() {
  const headerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState(null);
  const [region, setRegion] = useState('Europe');
  const [activeEnquiry, setActiveEnquiry] = useState('');
  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return undefined;
    const updateHeaderPosition = () => {
      const desktop = window.matchMedia('(min-width: 1200px)').matches;
      const topbar = header.querySelector(desktop ? '.vfn-desktop-topbar' : '.topbar');
      const topbarHeight = topbar && window.getComputedStyle(topbar).display !== 'none'
        ? topbar.getBoundingClientRect().height
        : 0;
      document.documentElement.style.setProperty('--vfn-header-height', `${header.getBoundingClientRect().height}px`);
      header.style.setProperty('--vfn-sticky-top', window.scrollY >= topbarHeight && topbarHeight > 0 ? `${-topbarHeight}px` : '0px');
    };
    updateHeaderPosition();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateHeaderPosition) : null;
    observer?.observe(header);
    window.addEventListener('resize', updateHeaderPosition);
    window.addEventListener('scroll', updateHeaderPosition, { passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateHeaderPosition);
      window.removeEventListener('scroll', updateHeaderPosition);
      document.documentElement.style.removeProperty('--vfn-header-height');
      header.style.removeProperty('--vfn-sticky-top');
    };
  }, []);
  const close = () => { setOpen(false); setSub(null); };
  const mobileMenus = MENUS.map(([label, key]) => {
    const links = MENU_CONTENT[key].flatMap(group => group.links);
    const regions = REGION_ORDER.filter(name => links.some(link => getCountryInfo(link.label, link.href)?.region === name));
    const selectedRegion = regions.includes(region) ? region : (regions[0] || '');
    const visibleLinks = regions.length > 1
      ? links.filter(link => getCountryInfo(link.label, link.href)?.region === selectedRegion)
      : links;
    const otherLinks = regions.length > 1 ? links.filter(link => !getCountryInfo(link.label, link.href)) : [];
    return { label, key, regions, selectedRegion, visibleLinks, otherLinks };
  });
  return (
    <header ref={headerRef} className="header">
    <div className="vfn-desktop-header">
      <div className="vfn-desktop-topbar">
        <div className="vfn-desktop-wrap">
          <nav aria-label="Main pages">
            {QUICK_LINKS.filter(([label]) => label !== 'Testimonials').map(([label, href]) => <Link key={label} to={href}>{label}</Link>)}
          </nav>
          <span className="vfn-desktop-location"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>Delhi NCR</span>
        </div>
      </div>
      <div className="vfn-desktop-mainrow">
        <div className="vfn-desktop-wrap">
          <Link to="/" className="vfn-desktop-logo"><img src="/logo.png" alt="Visa For Nation" /></Link>
          <nav className="vfn-desktop-categories" aria-label="Visa services">
            {MENUS.map(([label, key]) => <div className="vfn-desktop-menu" key={key}>
              <button type="button">{label}<span className="vfn-chevron" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="m3 6 5 5 5-5"/></svg></span></button>
              <div className="vfn-desktop-mega">
                <div className="vfn-mega-groups">
                  {MENU_CONTENT[key].map((group, index) => <section className="vfn-mega-group" key={`${key}-${index}`}>
                    {group.title && <h3>{getCountryInfo(group.title)?.name || group.title}</h3>}
                    <div>{group.links.map(link => <Link key={link.href} to={link.href}><CountryFlag country={getCountryInfo(link.label, link.href)} />{link.label}</Link>)}</div>
                  </section>)}
                </div>
                <aside className="vfn-eligibility-card">
                  <span className="vfn-eligibility-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 4.5 6v5.5c0 4.6 3.2 7.8 7.5 9.5 4.3-1.7 7.5-4.9 7.5-9.5V6L12 3Z"/><path d="m8.5 12 2.3 2.3 4.8-5"/></svg></span>
                  <h3>Not sure which visa fits you?</h3>
                  <p><strong>Get a free profile evaluation from our team.</strong></p>
                  <button type="button" onClick={() => setActiveEnquiry('eligibility')}>Check Eligibility <span aria-hidden="true">&#8594;</span></button>
                </aside>
              </div>
            </div>)}
          </nav>
          <a href={PAY} className="vfn-desktop-pay"><span className="pay-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" fill="#fff"/><path d="M3 9h18" stroke="#b51226" strokeWidth="3"/><path d="M7 14h4" stroke="#211b1d" strokeWidth="1.7" strokeLinecap="round"/></svg></span>Pay Now</a>
        </div>
      </div>

    </div>
    
<div
  className="topbar"
  style={{
    background: "linear-gradient(100deg, #7F0000 0%, #B51226 48%, #E52235 100%)",
    color: "#FFFFFF",
    fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
    fontSize: "13px",
    fontWeight: 600,
    letterSpacing: "0.25px",
    padding: "12px 0",
    boxShadow: "0 3px 12px rgba(127, 0, 0, 0.20)",
    borderBottom: "1px solid rgba(255,255,255,0.15)"
  }}
>
  <div
    className="wrap"
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "18px",
      flexWrap: "wrap",
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 20px"
    }}
  >
    {/* Location */}
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "9px",
        color: "#FFFFFF",
        lineHeight: 1.7
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <path
          d="M20 10C20 15 12 22 12 22S4 15 4 10a8 8 0 1 1 16 0Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="12"
          cy="10"
          r="2.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>

      HS-33, Kailash Colony Market, Greater Kailash-1, New Delhi
    </span>



    {/* Phone */}
    <a
      href={`tel:${PHONE}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "9px",
        color: "#FFFFFF",
        textDecoration: "none",
        fontWeight: 700,
        fontSize: "13px",
        lineHeight: 1.7,
        whiteSpace: "nowrap",
        transition: "opacity 0.2s ease"
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <path
          d="M22 16.92V19.92C22 20.47 21.55 20.92 21 20.92C11.61 20.92 4 13.31 4 3.92C4 3.37 4.45 2.92 5 2.92H8C8.5 2.92 8.92 3.29 8.99 3.78C9.13 4.82 9.38 5.84 9.73 6.81C9.89 7.23 9.79 7.71 9.47 8.03L7.56 9.94C8.8 12.5 10.88 14.58 13.44 15.82L15.35 13.91C15.67 13.59 16.15 13.49 16.57 13.65C17.54 14 18.56 14.25 19.6 14.39C20.1 14.46 20.47 14.89 20.47 15.39V18"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      +91 7677666677
    </a>
  </div>
</div>
 
 {/* Navbar second Row (Links Menu)  */}
 
      <div className="menu-area"><div className="wrap menu-row">
        <Link to="/" className="logo"><img src="/logo.png" alt="Visa For Nation" /></Link>
        <nav className="main-menu">
          <NavLink to="/" end>Home</NavLink><NavLink to="/about">About Us</NavLink><NavLink to="/award-and-certificate">Awards</NavLink>
          {MENUS.map(([label, key]) => (
            <div className={`has-dd ${FLIP.includes(key) ? 'flip' : ''}`} key={key}>
              <a href="#!" onClick={e => e.preventDefault()}>{label} <i>▾</i></a>
              <div className={`dd ${MENU_CONTENT[key][0].title ? '' : 'grid2'}`}>
                {MENU_CONTENT[key].map((g, i) => g.title ? (
                  <div key={i} className="dd-item"><span><CountryFlag country={getCountryInfo(g.title)} />{g.title}<i>›</i></span><div className="fly">{g.links.map(l => <Link key={l.href} to={l.href}><CountryFlag country={getCountryInfo(l.label, l.href)} />{l.label}</Link>)}</div></div>
                ) : g.links.map(l => <Link key={l.href} to={l.href} className="dd-link"><CountryFlag country={getCountryInfo(l.label, l.href)} />{l.label}</Link>))}
              </div>
            </div>
            ))}
        
          <NavLink to="/blog">Blog</NavLink>
          <NavLink to="/news">News</NavLink>
          <NavLink to="/contact-us">Contact Us</NavLink><NavLink to="/careers">Careers</NavLink>
        </nav>
        <a href={PAY} className="btn btn-pay"><span className="pay-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" fill="#fff"/><path d="M3 9h18" stroke="#b51226" strokeWidth="3"/><path d="M7 14h4" stroke="#211b1d" strokeWidth="1.7" strokeLinecap="round"/></svg></span>Paynow</a>
        <div className="mobile-header-actions">
          <span className="mobile-location-label">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
            <span>Delhi NCR</span>
          </span>
          <button className="burger" aria-label="Menu" onClick={() => setOpen(true)}>&#9776;</button>
        </div>
      </div>


      </div>

      
       {/* Carause Images  */}
      
      
      <div className={`drawer-bg ${open ? 'show' : ''}`} onClick={close} />
       <aside className={`drawer ${open ? 'show' : ''}`}>
        <div className="drawer-head">
          <img src="/logo.png" alt="Visa For Nation" />
          <button onClick={close}>
            ✕
          </button>
        </div>
        <Link to="/" onClick={close}>Home</Link><Link to="/about" onClick={close}>About Us</Link>
        {mobileMenus.map(({ label, key, regions, selectedRegion, visibleLinks, otherLinks }) => (
          <div key={key} className={sub === key ? 'acc open' : 'acc'}>
            <button onClick={() => { setSub(sub === key ? null : key); setRegion(regions[0] || 'Europe'); }}>{label}<i>▾</i></button>
            <div className="acc-body">
              {regions.length > 1 && <div className="drawer-region-tabs" role="group" aria-label={label + ' regions'}>
                {regions.map(name => <button type="button" key={name} className={selectedRegion === name ? 'active' : ''} aria-pressed={selectedRegion === name} onClick={() => setRegion(name)}>{name}</button>)}
              </div>}
              <div className="drawer-country-grid">
                {visibleLinks.map(link => <Link key={link.href} to={link.href} onClick={close}>
                  <CountryFlag country={getCountryInfo(link.label, link.href)} /><span>{link.label}</span>
                </Link>)}
              </div>
              {!!otherLinks.length && <div className="drawer-other-links"><h4>More links</h4>{otherLinks.map(link => <Link key={link.href} to={link.href} onClick={close}>{link.label}</Link>)}</div>}
            </div>
          </div>
        ))}
        <div className="drawer-quick-links"><h3>Quick Links</h3><div>{QUICK_LINKS.map(([label, href]) => <Link key={href} to={href} onClick={() => { close(); if (href === '/#testimonials') window.setTimeout(() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' }), 150); }}>{label}</Link>)}</div></div>
        <Link to="/award-and-certificate" onClick={close}>Awards &amp; Recognition</Link>
        <a href={PAY} className="btn btn-red drawer-pay" style={{ margin: 16 }}><span className="pay-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" fill="#fff"/><path d="M3 9h18" stroke="#b51226" strokeWidth="3"/><path d="M7 14h4" stroke="#211b1d" strokeWidth="1.7" strokeLinecap="round"/></svg></span>Paynow</a>
            </aside>
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <NavLink to="/" end onClick={close}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></svg><span>Home</span></NavLink>
        <NavLink to="/about" onClick={close}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg><span>About</span></NavLink>
        <button type="button" className="mobile-bottom-menu" onClick={() => setOpen(true)} aria-label="Open menu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg><span>Menu</span></button>
        <NavLink to="/contact-us" onClick={close}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v12H8l-4 3z" /><path d="M8 9h8M8 13h5" /></svg><span>Contact</span></NavLink>
        <a href={PAY} onClick={close}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 9h5M7 13h10" /></svg><span>Pay now</span></a>
      </nav>
      {activeEnquiry && <div className="vfn-enquiry-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setActiveEnquiry(''); }}>
        <section className={`vfn-enquiry-dialog${activeEnquiry === 'eligibility' ? ' is-eligibility-dialog' : ''}`} role="dialog" aria-modal="true" aria-label={activeEnquiry === 'callback' ? 'Request a callback' : 'Check visa eligibility'}>
          <button className="vfn-enquiry-close" type="button" aria-label="Close form" onClick={() => setActiveEnquiry("")}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
          <EnquiryForm key={activeEnquiry} variant={activeEnquiry === 'callback' ? 'callback' : 'eligibility'} category="General" title={activeEnquiry === 'callback' ? 'Request a Callback' : 'Check Your Eligibility'} sub={activeEnquiry === 'callback' ? 'Tell us when to call and our expert will ring you.' : 'Share your details and our expert will guide you.'} />
        </section>
      </div>}
    </header>
  );
}
