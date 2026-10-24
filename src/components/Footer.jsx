import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
const PHONE = import.meta.env.VITE_PHONE || '+917677666677', MAIL = import.meta.env.VITE_EMAIL || 'info@visafornation.com';

const SOCIAL = [
  { name: 'Facebook', href: 'https://www.facebook.com/visafornation/', icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
  { name: 'X', href: 'https://x.com/visafornation', icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg> },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/company/visafornationofficial', icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg> },
  { name: 'Instagram', href: 'https://www.instagram.com/visa_for_nation/', icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
  { name: 'YouTube', href: 'https://www.youtube.com/@Visafornation', icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
];

const LINKS = [['Home', '/'], ['About Us', '/about'], ['Contact Us', '/contact-us'], ['Awards & Recognition', '/award-and-certificate'], ['Our Gallery', '/our-gellary'], ['Terms and Conditions', '/terms-and-conditions'], ['Privacy Policy', '/privacy-policy'], ['Admin Login', '/admin']];

export default function Footer() {
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const updateScroll = () => setShowTop(window.scrollY > 320);
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);
  return (
    <footer className="ft footer">
      <div className="ft-wrap foot-grid">
        <div className="foot-brand">
          <img src="/assets/assets/img/logo-white.svg" alt="Visa For Nation" height="48" />
          <p>At <strong>Visa For Nation</strong>, we believe that every global dream deserves the right guidance delivered with integrity, expertise, and commitment. <Link to="/about" className="more">Read More</Link></p>
          <div className="socials">
            {SOCIAL.map(({ name, href, icon }) => (
              <a key={name} href={href} target="_blank" rel="noreferrer" aria-label={name} className="social-icon">
                {icon}
              </a>
            ))}
          </div>
        </div>
        <div className="foot-links"><h3>Quick Links</h3>{LINKS.map(([l, h]) => <Link key={h} to={h}>{l}</Link>)}</div>
        <div className="foot-contact">
          <h3>Get In Touch</h3>
          <a href={`tel:${PHONE}`} className="contact-item">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92V19.92C22 20.47 21.55 20.92 21 20.92C11.61 20.92 4 13.31 4 3.92C4 3.37 4.45 2.92 5 2.92H8C8.5 2.92 8.92 3.29 8.99 3.78C9.13 4.82 9.38 5.84 9.73 6.81C9.89 7.23 9.79 7.71 9.47 8.03L7.56 9.94C8.8 12.5 10.88 14.58 13.44 15.82L15.35 13.91C15.67 13.59 16.15 13.49 16.57 13.65C17.54 14 18.56 14.25 19.6 14.39C20.1 14.46 20.47 14.89 20.47 15.39V18"/></svg>
            <span>+91 7677666677</span>
          </a>
          <a href={`mailto:${MAIL}`} className="contact-item">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span>{MAIL}</span>
          </a>
          <p className="address">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>HS-33, Kailash Colony Market, Greater Kailash-1, New Delhi, Delhi 110048</span>
          </p>
        </div>
        <div className="foot-map">
          <h3>Find Us</h3>
          <iframe title="Visa For Nation location map" loading="lazy" className="map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.545628094768!2d77.2424971!3d28.553374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x83678360f861adbb%3A0x6e0d63b897943054!2sVisa%20For%20Nation!5e0!3m2!1sen!2sin" />
        </div>
      </div>
      <section className="footer-cta ft-wrap" aria-label="Start your visa journey">
        <div className="footer-cta-copy">
          <h2>Ready to start your <em>visa journey?</em></h2>
          <p>Book a free eligibility assessment with our Delhi-based experts.</p>
        </div>
        <div className="footer-cta-actions">
          <Link to="/contact-us" className="footer-cta-primary">Book Free Consultation</Link>
          <a href="https://wa.me/917677666677" target="_blank" rel="noreferrer" className="footer-cta-secondary">WhatsApp Us</a>
        </div>
      </section>
      <div className="copy">
        <div className="copy-main">
          <span>&copy; 2026 <Link to="/">Visa For Nation</Link>. All Rights Reserved.</span>
          <small>A Unit of <strong>Visa For Nation Private Limited</strong> | CIN: <strong>U70200DL2015PTC279965</strong></small>
        </div>
      </div>
      <div className="vfn-floating-actions" aria-label="Contact shortcuts">
        <a href={`tel:${PHONE}`} className="vfn-float-button vfn-float-call" aria-label="Call Visa For Nation" title="Call us">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.08 5.18 2 2 0 0 1 5.06 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L9 10.69a16 16 0 0 0 4.31 4.31l1.23-1.23a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z"/></svg>
        </a>
        <a href="https://wa.me/917677666677" target="_blank" rel="noreferrer" className="vfn-float-button vfn-float-chat" aria-label="Chat with Visa For Nation on WhatsApp" title="Chat with us">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.5a8.5 8.5 0 0 1-12.7 7.4L3 20l1.2-4.5A8.5 8.5 0 1 1 20.5 11.5Z"/><path d="M8.2 7.8c.3-.6.6-.6.9-.6h.5c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4-.1.6l-.6.7c-.2.2-.2.4-.1.6.5.9 1.2 1.6 2.1 2.1.2.1.4.1.6-.1l.7-.7c.2-.2.4-.2.6-.1l1.7.8c.3.1.4.3.4.5 0 .3-.2 1.1-.7 1.5-.5.4-1.1.6-1.8.5-1-.1-2.3-.7-3.8-2-1.2-1.1-2-2.5-2.2-3.5-.2-.9.1-1.6.5-2.4Z"/></svg>
        </a>
        {showTop && <button type="button" className="vfn-float-button vfn-float-top" aria-label="Back to top" title="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 15 7-7 7 7"/></svg>
        </button>}
      </div>
    </footer>
  );
}
