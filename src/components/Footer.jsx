import { Link } from 'react-router-dom';
const PHONE = import.meta.env.VITE_PHONE, MAIL = import.meta.env.VITE_EMAIL;
const SOCIAL = [['Facebook', 'https://www.facebook.com/visafornation/'], ['X', 'https://x.com/visafornation'], ['LinkedIn', 'https://www.linkedin.com/company/visafornationofficial'], ['Instagram', 'https://www.instagram.com/visa_for_nation/'], ['YouTube', 'https://www.youtube.com/@Visafornation']];
const LINKS = [['Home', '/'], ['About Us', '/about'], ['Contact Us', '/contact-us'], ['Awards & Recognition', '/award-and-certificate'], ['Our Gallery', '/our-gellary'], ['Terms and Conditions', '/terms-and-conditions'], ['Privacy Policy', '/privacy-policy'], ['Admin Login', '/admin']];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap foot-grid">
        <div><img src="https://visafornation.com/assets/img/logo-white.svg" alt="Visa For Nation" height="48" />
          <p>At <strong>Visa For Nation</strong>, we believe that every global dream deserves the right guidance delivered with integrity, expertise, and commitment. <Link to="/about" className="more">Read More</Link></p>
          <div className="socials">{SOCIAL.map(([n, u]) => <a key={n} href={u} target="_blank" rel="noreferrer">{n}</a>)}</div></div>
        <div><h3>Quick Links</h3>{LINKS.map(([l, h]) => <Link key={h} to={h}>{l}</Link>)}</div>
        <div><h3>Get In Touch</h3><a href={`tel:${PHONE}`}>📞 +91 7677666677</a><a href={`mailto:${MAIL}`}>✉️ {MAIL}</a>
          <p>📍 HS-33, Kailash Colony Market, Greater Kailash-1, New Delhi, Delhi 110048</p></div>
        <div><h3>Find Us</h3><iframe title="map" loading="lazy" className="map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.545628094768!2d77.2424971!3d28.553374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x83678360f861adbb%3A0x6e0d63b897943054!2sVisa%20For%20Nation!5e0!3m2!1sen!2sin" /></div>
      </div>
      <div className="copy">© 2026 <Link to="/">Visa For Nation</Link>. All Rights Reserved.<br /><small>A Unit of <strong>Visa For Nattion Private Limited</strong> | CIN: <strong>U70200DL2015PTC279965</strong></small></div>
      <div className="sticky-cta"><a href={`tel:${PHONE}`}>📞 Call Us</a><a href="https://wa.me/917677666677" target="_blank" rel="noreferrer" className="wa">WhatsApp</a></div>
    </footer>
  );
}
