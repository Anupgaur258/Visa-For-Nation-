import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe } from '../components/Art.jsx';
import Reveal from '../components/Reveal.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import SEOHead from '../components/SEOHead.jsx';
import { api, img } from '../api.js';
import './Awards.css';
import './Gallery.css';
import './Legal.css';

const awardFilename = source => {
  let value = String(source || '');
  try {
    if (/^https?:\/\//i.test(value)) value = new URL(value).pathname;
    value = decodeURIComponent(value);
  } catch {}
  return value.split(/[?#]/)[0].split('/').pop().toLowerCase();
};

const awardImage = (source, fallback) => {
  const filename = awardFilename(source);
  const fallbackFilename = awardFilename(fallback);
  const localPath = LOCAL_AWARD_IMAGES.get(filename)
    || LOCAL_AWARD_IMAGES.get(fallbackFilename)
    || LOCAL_AWARD_IMAGES.values().next().value;
  return img(localPath);
};

const AWARD_CATEGORIES = [
  {
    title: 'Elite Leadership Award & Summit',
    images: [
      'uploads/Award/Elite%20Pick.jpg.jpeg',
      'uploads/Award/Elite%20Trophee.jpg.jpeg',
      'uploads/Award/Elite%20Certificate.jpg.jpeg',
      'uploads/Award/Elite%20Both.jpg.jpeg',
    ],
  },
  {
    title: 'Rising Bharat Awards',
    images: [
      'uploads/Award/RBRH%20copy%202.png',
      'uploads/Award/RBRH%20copy.png',
      'uploads/Award/RBRH.png',
      'uploads/Award/RBRH-1.png',
    ],
  },
  {
    title: 'Global Leadership Awards',
    images: [
      'uploads/Award/GL1.png',
      'uploads/Award/GL2.png',
      'uploads/Award/GL3.png',
      'uploads/Award/GL4.png',
    ],
  },
  {
    title: 'Indian Star Excellence',
    images: [
      'uploads/Award/ISE1.jpeg',
      'uploads/Award/ISE.jpg.jpeg',
      'uploads/Award/ISE-1.jpg.jpeg',
      'uploads/Award/ISE%20copy.jpg.jpeg',
    ],
  },
  {
    title: 'Millennium Brilliance',
    images: [
      'uploads/Award/MB%20copy%202.png',
      'uploads/Award/MB%20copy.png',
    ],
  },
  {
    title: 'India Glory Awards',
    images: [
      'uploads/Award/IG.png',
      'uploads/Award/IG2.png',
      'uploads/Award/IG3.png',
    ],
  },
  {
    title: 'Indian Icon',
    images: [
      'uploads/Award/II-1.png',
      'uploads/Award/II.png',
      'uploads/Award/IIi.png',
    ],
  },
];

const LOCAL_AWARD_IMAGES = new Map(
  AWARD_CATEGORIES.flatMap(category => category.images.map(image => [awardFilename(image), image])),
);

export function Awards() {
  const [openImg, setOpenImg] = useState(null);
  const [awardCategories, setAwardCategories] = useState(AWARD_CATEGORIES);
  useEffect(() => { api('/cms/awards').then(data => { if (!data || !Object.keys(data).length) return; setAwardCategories(AWARD_CATEGORIES.map(category => ({ ...category, images: Array.isArray(data[category.title]?.images)
        ? data[category.title].images.map((source, index) => awardImage(source, category.images[index % category.images.length]))
        : category.images }))); }).catch(() => {}); }, []);

  const openModal = (src) => setOpenImg(src);
  const closeModal = () => setOpenImg(null);

  return (
    <main className="aw">
      <SEOHead
        title="Awards & Recognition | Visa For Nation"
        description="A gallery of recognitions and certifications earned by Visa For Nation for trusted, transparent immigration consultancy."
      />
      {/* ============ Hero ============ */}
      <section className="aw-sec aw-hero">
        <div className="aw-wrap">
          <Reveal from="up">
            <div className="aw-head">
              <span className="aw-eyebrow">Recognition & Trust</span>
              <h2 className="aw-h2">Awards & <em>Certificates</em></h2>
              <p className="aw-lead">A gallery of the recognitions and certifications earned for delivering trusted, transparent, and successful immigration consultancy.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ Award Categories ============ */}
      {awardCategories.map((cat, catIndex) => (
        <section key={cat.title} className="aw-sec aw-category" style={{ background: catIndex % 2 === 0 ? '#fff' : 'var(--soft)' }}>
          <div className="aw-wrap">
            <Reveal from="up">
              <div className="aw-cat-head">
                <span className="aw-cat-tag">{catIndex + 1}</span>
                <h3 className="aw-cat-title">{cat.title}</h3>
              </div>
            </Reveal>

            <div className="aw-grid">
              {cat.images.map((imgPath, imgIndex) => (
                <Reveal key={imgPath} from="up" delay={imgIndex * 60}>
                  <article className="aw-card">
                    <div className="aw-card-img">
                      <img src={awardImage(imgPath)} alt={`${cat.title} award`} loading="lazy" />
                      <button className="aw-view-btn" onClick={() => openModal(awardImage(imgPath))} aria-label="View award">
                        View
                      </button>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ============ Image Modal ============ */}
      {openImg && (
        <div className="aw-modal" onClick={closeModal} role="dialog" aria-modal="true" aria-label="Award image">
          <div className="aw-modal-inner" onClick={e => e.stopPropagation()}>
            <button className="aw-modal-close" onClick={closeModal} aria-label="Close">×</button>
            <img src={openImg} alt="Award" />
          </div>
        </div>
      )}
    </main>
  );
}

export function Gallery() {
  const [activeGalleryTab, setActiveGalleryTab] = useState('All');
  const pics = [
    { file: 'youtube/Vj5y3dhy8Bc.jpg', title: 'Client Success Story', group: 'Client Testimonials', note: 'Hear directly from a client about their experience with our team.' },
    { file: 'youtube/OkSpnIs-zsE.jpg', title: 'A Client Journey', group: 'Client Testimonials', note: 'Real stories from people taking their next step abroad.' },
    { file: 'youtube/MOGzdzOr38s.jpg', title: 'Visa Journey', group: 'Client Testimonials', note: 'A client shares their Visa For Nation experience.' },
    { file: 'uploads/Award/banner/Elite Banner.jpg.jpeg', title: 'Recognition & Awards', group: 'Seminars & Events', note: 'Moments from industry events and professional recognition.' },
    { file: 'uploads/Award/banner/glory.png', title: 'Industry Celebration', group: 'Seminars & Events', note: 'Celebrating milestones and achievements together.' },
    { file: 'uploads/Award/banner/leader.png', title: 'Leadership Event', group: 'Seminars & Events', note: 'A look back at events that bring our industry together.' },
    { file: 'uploads/team/Umesh.jpg.jpeg', title: 'Meet Our Team', group: 'Office Trips', note: 'The people behind Visa For Nation’s client support.' },
    { file: 'uploads/team/Taniya.jpg.jpeg', title: 'Our People', group: 'Office Trips', note: 'A glimpse of the team that guides your journey.' },
    { file: 'uploads/team/Simran Kaur.jpg.jpeg', title: 'Team Moments', group: 'Office Trips', note: 'Meet the people working together at Visa For Nation.' },
  ];
  const galleryTabs = ['All', 'Client Testimonials', 'Seminars & Events', 'Office Trips'];
  const filteredPics = activeGalleryTab === 'All' ? pics : pics.filter(pic => pic.group === activeGalleryTab);
  return (
    <main className="ga">
      <SEOHead
        title="Our Gallery | Visa For Nation Office & Success Moments"
        description="Explore Visa For Nation's gallery: client celebrations, team events, international destinations, and consultancy milestones."
      />
      <section className="ga-banner" style={{ '--ga-banner-image': `url("${img('assets/img/banner/paris.jpg')}")` }}>
        <div className="ga-wrap ga-banner-inner">
          <div className="ga-banner-copy">
            <span className="ga-banner-kicker">Visa For Nation · Gallery</span>
            <h1>Moments That <em>Move You Forward</em></h1>
            <p>Explore the destinations, opportunities and journeys that inspire a life abroad.</p>
            <div className="ga-banner-stats"><span><b>3</b> gallery collections</span><span><b>{pics.length}</b> featured moments</span></div>
          </div>
        </div>
      </section>
      <section className="ga-sec ga-gallery-section">
        <div className="ga-wrap">
          <div className="ga-gallery-tabs" role="tablist" aria-label="Filter gallery by region">
            {galleryTabs.map((tab, index) => (
              <button type="button" role="tab" aria-selected={activeGalleryTab === tab} className={activeGalleryTab === tab ? 'is-active' : ''} onClick={() => setActiveGalleryTab(tab)} key={tab}>
                <span aria-hidden="true">{index === 0 ? '▦' : index === 1 ? '♡' : index === 2 ? '✦' : '⌂'}</span>{tab}<b>{tab === 'All' ? pics.length : pics.filter(pic => pic.group === tab).length}</b>
              </button>
            ))}
          </div>
          <div className="ga-gallery-summary"><strong>Showing {filteredPics.length} {filteredPics.length === 1 ? 'gallery moment' : 'gallery moments'}</strong><span>Client stories, events and moments with our team</span></div>
          <div className="ga-grid">
            {filteredPics.map((pic, i) => (
              <Reveal key={pic.file} from={i % 2 ? 'right' : 'left'} delay={i * 60}>
                <article className="ga-item">
                  <div className="ga-item-img"><img src={img(pic.file)} alt={pic.title} loading="lazy" /><span className="ga-item-tag">{pic.group}</span></div>
                  <div className="ga-item-body"><h4>{pic.title}</h4><p>{pic.note}</p><span className="ga-card-link">Explore destination <b aria-hidden="true">→</b></span></div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export function Legal({ kind }) {
  const terms = kind === 'terms';
  return (
    <main className="lg">
      <SEOHead
        title={(terms ? 'Terms and Conditions' : 'Privacy Policy') + ' | Visa For Nation'}
        description={terms ? 'Terms and conditions for Visa For Nation Private Limited services.' : 'Privacy policy and data protection principles of Visa For Nation.'}
      />
      <section className="lg-sec lg-hero">
        <div className="lg-wrap">
          <Reveal from="up">
            <div className="lg-head">
              <span className="lg-eyebrow">Legal</span>
              <h2 className="lg-h2">{terms ? 'Terms and' : 'Privacy'} <em>{terms ? 'Conditions' : 'Policy'}</em></h2>
              <p className="lg-lead">Visa For Nation Private Limited · CIN U70200DL2015PTC279965</p>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="lg-sec">
        <div className="lg-wrap lg-content">
          <Reveal from="up">
            <div className="prose">
              {terms ? (
                <>
                  <h2>Services</h2>
                  <p>Visa For Nation provides immigration consultancy. We do not guarantee visa approval; the final decision rests with the relevant immigration authority.</p>
                  <h2>Fees</h2>
                  <p>Government fees and professional fees are itemised separately and agreed in writing before work begins.</p>
                  <h2>Refunds</h2>
                  <p>Professional fees are non-refundable once work has commenced. Government fees are subject to the respective authority's refund policy.</p>
                  <h2>Limitation of Liability</h2>
                  <p>We exercise due diligence but cannot be held liable for visa refusals, delays, or changes in immigration law.</p>
                  <h2>Governing Law</h2>
                  <p>These terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of courts in New Delhi.</p>
                </>
              ) : (
                <>
                  <h2>Information we collect</h2>
                  <p>Name, phone, email and enquiry details you submit through our forms.</p>
                  <h2>How we use it</h2>
                  <p>To contact you about your enquiry and deliver our services. We do not sell your data.</p>
                  <h2>Data retention</h2>
                  <p>We retain enquiry records for the duration necessary to provide our services and comply with legal obligations.</p>
                  <h2>Your rights</h2>
                  <p>You may request access, correction, or deletion of your personal data by contacting us.</p>
                  <h2>Third parties</h2>
                  <p>We do not share your data with third parties except as required to deliver our services (e.g., government portals) or by law.</p>
                </>
              )}
              <p className="note">Questions? <Link to="/contact-us">Contact us</Link>. <em>Replace this text with your final legal copy.</em></p>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="lg-sec lg-cta">
        <div className="lg-wrap">
          <Reveal from="up">
            <span className="lg-eyebrow">Need Help?</span>
            <h2 className="lg-h2">Have Questions About Our <em>Policies?</em></h2>
            <p>Our team is happy to clarify any concerns you may have.</p>
            <Link to="/contact-us" className="lg-btn red">Contact Us <span aria-hidden="true">→</span></Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
