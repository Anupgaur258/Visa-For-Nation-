import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import EnquiryForm from '../components/EnquiryForm.jsx';
import Reveal from '../components/Reveal.jsx';
import SEOHead from '../components/SEOHead.jsx';
import './Contact.css';

export default function Contact() {
  const PHONE = import.meta.env.VITE_PHONE;
  const MAIL = import.meta.env.VITE_EMAIL;

  return (
    <main className="ct">
      <SEOHead
        title="Contact Us | Office in Kailash Colony Greater Kailash Delhi"
        description="Visit Visa For Nation at HS-33, Kailash Colony Market, Greater Kailash-1, New Delhi. Call +91 7677666677 for immediate assistance."
      />
        {/* ============ Hero ============ */}
        <section className="ct-sec ct-hero">
          <div className="ct-wrap">
            <Reveal from="up">
              <div className="ct-head">
                <span className="ct-eyebrow">Contact Us</span>
                <h2 className="ct-h2">Let's Plan Your <em>Journey</em></h2>
                <p className="ct-lead">Book a free eligibility assessment with our Delhi-based team.</p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============ Contact Info + Map ============ */}
        <section className="ct-sec ct-contact-section">
          <div className="ct-wrap ct-grid">
            <Reveal from="left" className="ct-info">
              <span className="ct-eyebrow">Get In Touch</span>
              <h2 className="ct-h2">We'd Love to Hear From You</h2>
              <p className="ct-lead">Visit our office, give us a call, or send a message — we're here to help.</p>

              <ul className="ct-contact-list">
                <li className="ct-contact-item">
                  <span className="ct-contact-icon">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10C20 15 12 22 12 22S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                  </span>
                  <div className="ct-contact-text">
                    <h4>Visit Our Office</h4>
                    <p>HS-33, Kailash Colony Market, Greater Kailash-1, New Delhi, Delhi 110048</p>
                  </div>
                </li>

                <li className="ct-contact-item">
                  <span className="ct-contact-icon">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92V19.92C22 20.47 21.55 20.92 21 20.92C11.61 20.92 4 13.31 4 3.92C4 3.37 4.45 2.92 5 2.92H8C8.5 2.92 8.92 3.29 8.99 3.78C9.13 4.82 9.38 5.84 9.73 6.81C9.89 7.23 9.79 7.71 9.47 8.03L7.56 9.94C8.8 12.5 10.88 14.58 13.44 15.82L15.35 13.91C15.67 13.59 16.15 13.49 16.57 13.65C17.54 14 18.56 14.25 19.6 14.39C20.1 14.46 20.47 14.89 20.47 15.39V18"/></svg>
                  </span>
                  <div className="ct-contact-text">
                    <h4>Call Us</h4>
                    <p><a href={`tel:${PHONE}`}>+91 7677666677</a></p>
                    <small>Mon to Sat: 10:00 AM – 6:00 PM</small>
                  </div>
                </li>

                <li className="ct-contact-item">
                  <span className="ct-contact-icon">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7V12L15.5 14"/></svg>
                  </span>
                  <div className="ct-contact-text">
                    <h4>Email Us</h4>
                    <p><a href={`mailto:${MAIL}`}>{MAIL}</a></p>
                    <small>We reply within 24 hours</small>
                  </div>
                </li>

                <li className="ct-contact-item">
                  <span className="ct-contact-icon">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7V12L15.5 14"/></svg>
                  </span>
                  <div className="ct-contact-text">
                    <h4>WhatsApp</h4>
                    <p><a href="https://wa.me/917677666677" target="_blank" rel="noreferrer">+91 7677666677</a></p>
                    <small>Quick chat support</small>
                  </div>
                </li>
              </ul>

              <div className="ct-hours">
                <h4>Office Hours</h4>
                <ul className="ct-hours-list">
                  <li><span>Monday – Friday</span><span>10:00 AM – 6:00 PM</span></li>
                  <li><span>Saturday</span><span>10:00 AM – 4:00 PM</span></li>
                  <li><span>Sunday</span><span>Closed</span></li>
                </ul>
              </div>
            </Reveal>

            <Reveal from="right" delay={120} className="ct-sidebar">
              <div className="ct-map">
                <iframe
                  title="Visa For Nation location map"
                  loading="lazy"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.545628094768!2d77.2424971!3d28.553374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x83678360f861adbb%3A0x6e0d63b897943054!2sVisa%20For%20Nation!5e0!3m2!1sen!2sin"
                />
              </div>
                          <div className="ct-assessment-panel">
                <div className="ct-assessment-copy">
                  <span className="ct-eyebrow">Free Assessment</span>
                  <h2 className="ct-h2">Start Your <em>Visa Journey</em></h2>
                  <p className="ct-lead">Fill out the form and our experts will call you back within 24 hours for a free eligibility assessment.</p>
                </div>
                <EnquiryForm variant="card" />
              </div></Reveal>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section className="ct-sec ct-cta">
          <div className="ct-wrap">
            <Reveal from="up">
              <span className="ct-eyebrow">Follow Our Journey</span>
              <h2 className="ct-h2">Stay Connected With <em>Visa For Nation</em></h2>
              <p>Get the latest immigration updates, success stories, and visa tips.</p>
              <div className="ct-socials">
                <a className="ct-social" href="https://www.facebook.com/visafornation/" target="_blank" rel="noreferrer" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a className="ct-social" href="https://x.com/visafornation" target="_blank" rel="noreferrer" aria-label="X (Twitter)">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
                </a>
                <a className="ct-social" href="https://www.linkedin.com/company/visafornationofficial" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                <a className="ct-social" href="https://www.instagram.com/visa_for_nation/" target="_blank" rel="noreferrer" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a className="ct-social" href="https://www.youtube.com/@Visafornation" target="_blank" rel="noreferrer" aria-label="YouTube">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
  );
}