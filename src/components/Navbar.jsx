import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import nav from '../data/nav.json';
const PHONE = import.meta.env.VITE_PHONE;
const MENUS = [['Migrate', 'migrate'], ['Tourist', 'tourist'], ['Study Visa', 'study'], ['Services', 'services']];
const FLIP = ['services', 'study'];
const PAY = 'https://payments.cashfree.com/forms/visafornattion';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState(null);
  const close = () => { setOpen(false); setSub(null); };
  return (
    <header className="header">
    
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

    {/* Business Hours */}
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "9px",
        color: "#FFFFFF",
        lineHeight: 1.7,
        whiteSpace: "nowrap"
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
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M12 7V12L15.5 14"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      Mon to Sat: 10:00 AM – 6:00 PM
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
              <div className={`dd ${nav[key][0].title ? '' : 'grid2'}`}>
                {nav[key].map((g, i) => g.title ? (
                  <div key={i} className="dd-item"><span>{g.title}<i>›</i></span><div className="fly">{g.links.map(l => <Link key={l.href} to={l.href}>{l.label}</Link>)}</div></div>
                ) : g.links.map(l => <Link key={l.href} to={l.href} className="dd-link">{l.label}</Link>))}
              </div>
            </div>
            ))}
         
          <NavLink to="/blog">Blog</NavLink>
          <NavLink to="/contact-us">Contact Us</NavLink>
        </nav>
        <a href={PAY} className="btn btn-pay">Paynow</a>
        <button className="burger" aria-label="Menu" onClick={() => setOpen(true)}>☰</button>
      </div>


      </div>

 {/* Carause Images  */}
      <div className={`drawer-bg ${open ? 'show' : ''}`} onClick={close} />
      <aside className={`drawer ${open ? 'show' : ''}`}>
        <div className="drawer-head"><img src="https://visafornation.com/assets/img/logo.svg" alt="Visa For Nation" /><button onClick={close}>✕</button></div>
        <Link to="/" onClick={close}>Home</Link><Link to="/about" onClick={close}>About Us</Link>
        {MENUS.map(([label, key]) => (
          <div key={key} className={sub === key ? 'acc open' : 'acc'}>
            <button onClick={() => setSub(sub === key ? null : key)}>{label}<i>▾</i></button>
            <div className="acc-body">{nav[key].flatMap(g => g.links).map(l => <Link key={l.href} to={l.href} onClick={close}>{l.label}</Link>)}</div>
          </div>
        ))}
        <Link to="/award-and-certificate" onClick={close}>Awards &amp; Recognition</Link><Link to="/blog" onClick={close}>Blog</Link><Link to="/contact-us" onClick={close}>Contact Us</Link>
        <a href={PAY} className="btn btn-red" style={{ margin: 16 }}>Paynow</a>
      </aside>
    </header>
  );
}
