import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import EnquiryForm from '../components/EnquiryForm.jsx';
import { Globe } from '../components/Art.jsx';
import Reveal from '../components/Reveal.jsx';
import { img } from '../api.js';
import { BANNERS } from '../data/home.js';

const Hero = ({ badge, title, last, desc }) => (
  <section className="page-hero"><div className="wrap ph-grid"><div className="ph-text"><span className="badge">{badge}</span><h1>{title} <em>{last}</em></h1><p>{desc}</p></div><div className="ph-art"><Globe /></div></div></section>
);
const useTitle = t => useEffect(() => { document.title = `${t} | Visa For Nation`; }, [t]);

export function About() {
  useTitle('About Us');
  const pts = [['Our Mission', 'To make international immigration honest, understandable, and accessible for every applicant — replacing confusion and inflated promises with clear information, realistic timelines, and ethical advice.'], ['Our Expertise', "Hands-on knowledge of Canada's Express Entry and PNPs, Australia's 189/190/491 visas, Europe's work routes including Germany's Opportunity Card, plus study and visitor visas worldwide."], ['Our Client-First Approach', 'Every applicant is an individual case. We understand your education, work history, finances and goals before recommending a pathway — and tell you honestly if a route does not suit you.']];
  return (<>
    <Hero badge="About Us" title="Delhi's Trusted Immigration" last="Consultants" desc="Honest guidance, properly documented applications and support at every step." />
    <div className="wrap page-grid"><div className="content-wrap"><div className="prose">
      <p>Finding the best immigration consultant in Delhi can be the single most important decision in your journey to live, work, or study abroad. With embassies tightening scrutiny and eligibility criteria changing every few months, a small documentation error or an outdated strategy can turn a strong profile into a rejected file. That is where Visa For Nation comes in.</p>
      {pts.map(([h, t]) => <div key={h}><h2>{h}</h2><p>{t}</p></div>)}
      <p>We do not promise guaranteed visas, because no consultant honestly can; we promise a properly assessed, correctly documented, and professionally presented application.</p>
    </div></div><div className="side"><Reveal from="right"><EnquiryForm /></Reveal></div></div></>);
}

export function Contact() {
  useTitle('Contact Us');
  const PHONE = import.meta.env.VITE_PHONE, MAIL = import.meta.env.VITE_EMAIL;
  return (<>
    <Hero badge="Contact Us" title="Let's Plan Your" last="Journey" desc="Book a free eligibility assessment with our Delhi-based team." />
    <div className="wrap page-grid"><div className="content-wrap"><div className="prose">
      <h2>Visit our office</h2><p>HS-33, Kailash Colony Market, Greater Kailash-1, New Delhi, Delhi 110048</p>
      <p>📞 <a href={`tel:${PHONE}`}>+91 7677666677</a><br />✉️ <a href={`mailto:${MAIL}`}>{MAIL}</a><br />🕙 Mon to Sat: 10.00 am – 6.00 pm</p>
      <iframe title="map" loading="lazy" className="map big" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.545628094768!2d77.2424971!3d28.553374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x83678360f861adbb%3A0x6e0d63b897943054!2sVisa%20For%20Nation!5e0!3m2!1sen!2sin" />
    </div></div><div className="side"><Reveal from="right"><EnquiryForm /></Reveal></div></div></>);
}

export function Awards() {
  useTitle('Awards & Recognition');
  return (<>
    <Hero badge="Awards" title="Awards &" last="Recognition" desc="Recognised for trust, transparency and results in immigration consulting." />
    <div className="wrap blog-grid">{BANNERS.map(([d], i) => <Reveal key={d} from={i % 2 ? 'right' : 'left'} delay={i * 60} className="award"><img src={img(d)} alt="Visa For Nation award" loading="lazy" /></Reveal>)}</div></>);
}

export function Gallery() {
  useTitle('Our Gallery');
  const pics = ['london.jpeg', 'paris.jpg', 'germany.jpg', 'usa.jpg', 'canada.jpg', 'sweden.jpg'];
  return (<>
    <Hero badge="Gallery" title="Our" last="Gallery" desc="Moments from our office, clients and destinations." />
    <div className="wrap blog-grid">{pics.map((p, i) => <Reveal key={p} from={i % 2 ? 'right' : 'left'} delay={i * 60} className="award"><img src={img(`assets/img/banner/${p}`)} alt="Gallery" loading="lazy" /></Reveal>)}</div></>);
}

export function Legal({ kind }) {
  const terms = kind === 'terms';
  useTitle(terms ? 'Terms and Conditions' : 'Privacy Policy');
  return (<>
    <Hero badge="Legal" title={terms ? 'Terms and' : 'Privacy'} last={terms ? 'Conditions' : 'Policy'} desc="Visa For Nattion Private Limited · CIN U70200DL2015PTC279965" />
    <div className="wrap narrow"><div className="content-wrap"><div className="prose">
      {terms ? <><h2>Services</h2><p>Visa For Nation provides immigration consultancy. We do not guarantee visa approval; the final decision rests with the relevant immigration authority.</p><h2>Fees</h2><p>Government fees and professional fees are itemised separately and agreed in writing before work begins.</p></>
        : <><h2>Information we collect</h2><p>Name, phone, email and enquiry details you submit through our forms.</p><h2>How we use it</h2><p>To contact you about your enquiry and deliver our services. We do not sell your data.</p></>}
      <p>Questions? <Link to="/contact-us">Contact us</Link>. <em>Replace this text with your final legal copy.</em></p>
    </div></div></div></>);
}
