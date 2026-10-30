import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import { YouTube } from '../components/Media.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import Slider from '../components/Slider.jsx';
import Reveal from '../components/Reveal.jsx';
import { api, img, adminImg } from '../api.js';
import { DEST, COUNTRIES, WHY, STUDY, YT, REVIEWS, MEDIA, FAQS, HOME_GOAL_CARDS } from '../data/home.js';
import { FALLBACK_POSTS } from '../data/postsData.js';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

/* ------------------------------ Helpers ------------------------------ */

const BP = (a, b, c, d, e) => ({
  0: { slidesPerView: a },
  576: { slidesPerView: b },
  992: { slidesPerView: c },
  1200: { slidesPerView: d },
  1400: { slidesPerView: e },
});

const GoogleMark = () => (
  <svg className="hm-google-mark" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.65Z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.93l-3.88-3c-1.08.72-2.46 1.15-4.05 1.15-3.12 0-5.77-2.1-6.72-4.93H1.27v3.09A12 12 0 0 0 12 24Z" />
    <path fill="#FBBC05" d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.27a12 12 0 0 0 0 10.76l4.01-3.09Z" />
    <path fill="#EA4335" d="M12 4.78c1.77 0 3.36.61 4.61 1.81l3.45-3.45C17.95 1.18 15.24 0 12 0A12 12 0 0 0 1.27 6.62l4.01 3.09C6.23 6.88 8.88 4.78 12 4.78Z" />
  </svg>
);

/* Section heading: eyebrow + title + italic accent (+ optional sub) */
const Head = ({ tag, title, accent, sub, light, left }) => (
  <Reveal from="up" className={`hm-head${light ? ' is-light' : ''}${left ? ' is-left' : ''}`}>
    <span className="hm-eyebrow">{tag}</span>
    <h2 className="hm-h2">
      {title}
      {accent && <> <em>{accent}</em></>}
    </h2>
    {sub && <p className="hm-sub">{sub}</p>}
  </Reveal>
);


/* Trigger once when an element enters the viewport. */
function useInView() {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return undefined;

    let done = false;
    const fire = () => {
      if (!done) {
        done = true;
        setSeen(true);
      }
    };
    const check = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vh * 0.9 && r.bottom > 0) fire();
    };


    let io;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.isIntersecting && fire()),
        { threshold: 0.15 }
      );
      io.observe(el);
    }

    window.addEventListener('scroll', check, { passive: true, capture: true });
    window.addEventListener('resize', check);
    window.addEventListener('load', check);
    const t = setTimeout(check, 400);
    check();

    return () => {
      clearTimeout(t);
      io && io.disconnect();
      window.removeEventListener('scroll', check, true);
      window.removeEventListener('resize', check);
      window.removeEventListener('load', check);
    };
  }, [seen]);

  return [ref, seen];
}

/* --------------------------- Homepage data --------------------------- */

const STEPS = [
  'Free Eligibility Assessment',
  'Profile Evaluation',
  'Documentation',
  'Application Submission',
  'Updates & Support',
  'Post-Visa Guidance',
];
const HOME_BANNER_FALLBACK = { imageUrl: '/assets/images/banners/Elite Leadership Awards Ceremony.png', altText: 'Visa For Nation featured banner' };

/* ---------------------------- Home page ------------------------------ */
export default function Home() {
  const [banners, setBanners] = useState([HOME_BANNER_FALLBACK]);
  const [journeyCards, setJourneyCards] = useState(HOME_GOAL_CARDS);
  const [journeyPage, setJourneyPage] = useState(0);
  const [faq, setFaq] = useState(-1);
  const [instagramReelIndex, setInstagramReelIndex] = useState(0);
  const [homeReels, setHomeReels] = useState([]);
  const [reviewItems, setReviewItems] = useState(REVIEWS);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const half = Math.ceil(FAQS.length / 2);
  const [aboutRef, aboutSeen] = useInView();
  const [playingVideo, setPlayingVideo] = useState(null);
  const [likedVideos, setLikedVideos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vfn-testimonial-likes') || '{}'); }
    catch { return {}; }
  });
  const [captionVideos, setCaptionVideos] = useState({});
  const testimonialSwiper = useRef(null);
  const testimonialHovered = useRef(false);
  const [testimonialItems, setTestimonialItems] = useState(YT.map(id => ({ videoUrl: id, likes: 0 })));
  const [blogPosts, setBlogPosts] = useState(FALLBACK_POSTS.slice(0, 3));
  const displayedReviewIndex = activeReviewIndex % reviewItems.length;
  const featuredReview = reviewItems[displayedReviewIndex] || REVIEWS[0];
  const otherReviews = reviewItems.filter((_, index) => index !== displayedReviewIndex);

  useEffect(() => {
    if (reviewItems.length < 2) return undefined;
    const intervalId = window.setInterval(() => {
      setActiveReviewIndex(index => (index + 1) % reviewItems.length);
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [reviewItems.length]);

  const reelSource = homeReels;
  const visibleInstagramReels = reelSource.length ? [reelSource[instagramReelIndex % reelSource.length], reelSource[(instagramReelIndex + 1) % reelSource.length]].filter(Boolean) : [];
  const shareInstagramReel = async path => {
    const apiBase = String(import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
    const url = path?.startsWith('/uploads/') ? `${apiBase}${path}` : /^https?:\/\//i.test(path || '') ? path : `https://www.instagram.com/${path}/`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Visa For Nation Instagram Reel', url }); } catch { /* share dismissed */ }
    } else if (navigator.clipboard) {
      try { await navigator.clipboard.writeText(url); } catch { /* clipboard unavailable */ }
    }
  };

  const getTestimonialId = (url) => {
    const value = String(url || '').trim();
    const match = value.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|shorts\/|watch\?v=))([A-Za-z0-9_-]{11})/);
    return match?.[1] || (/^[A-Za-z0-9_-]{11}$/.test(value) ? value : '');
  };
  const likeTestimonialVideo = async (item) => {
    const key = String(item._id || item.videoUrl);
    if (!item._id || likedVideos[key] || localStorage.getItem('vfn-testimonial-likes')?.includes(`"${key}":true`)) return;
    const nextLikes = { ...likedVideos, [key]: true };
    setLikedVideos(nextLikes);
    localStorage.setItem('vfn-testimonial-likes', JSON.stringify(nextLikes));
    try {
      const result = await api(`/testimonials/${item._id}/like`, { method: 'POST' });
      setTestimonialItems(prev => prev.map(video => video._id === item._id ? { ...video, likes: result.likes } : video));
    } catch {
      const reverted = { ...nextLikes, [key]: false };
      setLikedVideos(reverted);
      localStorage.setItem('vfn-testimonial-likes', JSON.stringify(reverted));
    }
  };
  const sendTestimonialCommand = (id, command, args = []) => {
    document.getElementById(`hm-testimonial-${id}`)?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: command, args }),
      'https://www.youtube-nocookie.com'
    );
  };
  const shareTestimonial = async (id) => {
    const url = `https://youtube.com/shorts/${id}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Client testimonial', url }); } catch { /* share dismissed */ }
    } else if (navigator.clipboard) {
      try { await navigator.clipboard.writeText(url); } catch { /* clipboard unavailable */ }
    }
  };

  useEffect(() => {
    document.title = 'Best Immigration Consultant in Delhi | Visa For Nation';
    api('/banners').then(items => {
      if (Array.isArray(items)) {
        const available = items.filter(item => item?.imageUrl);
        setBanners(available.length ? available : [HOME_BANNER_FALLBACK]);
      }
    }).catch(error => console.error('Failed to load homepage banners', error));
    api('/cms/home').then(content => {
      if (Array.isArray(content?.goals?.cards) && content.goals.cards.length) {
        setJourneyCards(content.goals.cards.filter(card => card?.title && (card.imageUrl || card.image)));
      }
    }).catch(error => console.error('Failed to load homepage goal cards', error));
    api('/reviews').then(items => { if (Array.isArray(items) && items.length) setReviewItems(items.map(item => [item.name, item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Client review', item.message, Number(item.rating) || 5])); }).catch(() => {});
    api('/testimonials').then(items => {
      if (Array.isArray(items)) setTestimonialItems(items);
    }).catch(() => {});
    api('/reels').then(items => {
      if (Array.isArray(items)) setHomeReels(items.filter(item => item?.urls?.[0]));
    }).catch(error => console.error('Failed to load homepage Instagram reels', error));
    api('/posts').then(items => { if (Array.isArray(items) && items.length) setBlogPosts(items.slice(0, 3)); }).catch(() => {});
  }, []);

  return (
    <>
      {/* SECTION 0 — HOME BANNER
          Images are managed in Admin > Content management > Home > Banner.
          Edit banner layout in index.css under "HOME STEP 0 — HERO BANNER". */}
      {banners.length > 0 && <Swiper
        className="hero-slider"
        modules={[Navigation, Autoplay, Pagination]}
        navigation={banners.length > 1}
        pagination={banners.length > 1 ? { clickable: true } : false}
        loop={banners.length > 1}
        speed={1000}
        autoplay={banners.length > 1 ? {
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        } : false}
      >
        {banners.map((banner, index) => {
          const slideContent = <img src={adminImg(banner.imageUrl)} alt={banner.altText || `Visa For Nation banner ${index + 1}`} onError={event => {
            if (event.currentTarget.dataset.fallback) return;
            event.currentTarget.dataset.fallback = 'true';
            event.currentTarget.src = HOME_BANNER_FALLBACK.imageUrl;
          }} />;
          const bannerClass = 'hm-hero-banner';
          return (
            <SwiperSlide key={banner._id || banner.imageUrl}>
              {banner.linkUrl
                ? <a className={bannerClass} href={banner.linkUrl} aria-label={banner.altText || `Homepage banner ${index + 1}`}>{slideContent}</a>
                : <div className={bannerClass}>{slideContent}</div>}
            </SwiperSlide>
          );
        })}
      </Swiper>}
      {/* SECTION 1 — GOAL CARDS
          Edit card content in Admin > Content management > Home > Goal cards.
          Edit card layout in index.css under "HOME SECTION 1 — GOAL CARDS". */}
      <section className={`hm-journey${banners.length ? '' : ' no-banner'}`} aria-label="Choose your goal">
        <div className="hm-wrap">
          <div className="hm-journey-grid" aria-live="polite">
            {journeyCards.slice(journeyPage * 3, journeyPage * 3 + 3).map((path, i) => (
              <Reveal key={path.title} from="up" delay={i * 90}>
                <Link to={path.href} className="hm-journey-card">
                  <div className="hm-journey-image"><img src={path.imageUrl ? adminImg(path.imageUrl) : img(path.image)} alt={path.alt || path.title} loading="lazy" /></div>
                  <div className="hm-journey-content">
                    <span className="hm-journey-label">{path.label}</span>
                    <h3>{path.title}</h3>
                    <p>{path.description}</p>
                    <span className="hm-journey-action">{path.action}<i aria-hidden="true">&#8594;</i></span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <nav className="hm-journey-controls" aria-label="Goal card pages">
            <div className="hm-journey-dots">
              {Array.from({ length: Math.ceil(journeyCards.length / 3) }, (_, page) => <button key={page} type="button" className={`hm-journey-dot${journeyPage === page ? ' active' : ''}`} aria-label={`Show goal card group ${page + 1}`} aria-current={journeyPage === page ? 'page' : undefined} onClick={() => setJourneyPage(page)} />)}
            </div>
          </nav>
        </div>
      </section>

      <div className="hm">

        {/* SECTION 2 — IMMIGRATION CONSULTANTS / DESTINATIONS
            Edit carousel images in the DEST array in src/data/home.js.
            Edit layout in index.css under "3. DESTINATIONS". */}
        <section className="hm-sec soft">
          <div className="hm-wrap">
            <Head tag="Immigration Consultants" title="Can Provide The" accent="Best Assistance!" />

            <Reveal from="up" delay={100}>
              <div className="hm-dest-wrap">
                <Swiper
                  className="hm-dest-swiper"
                  modules={[Navigation, Autoplay]}
                  navigation={{ prevEl: '.hm-dest-prev', nextEl: '.hm-dest-next' }}
                  autoplay={{ delay: 2500, disableOnInteraction: false, pauseOnMouseEnter: true }}
                  loop={DEST.length >= 7}
                  rewind={DEST.length < 7}

                  speed={700}
                  spaceBetween={22}
                  breakpoints={{
                    0:    { slidesPerView: 1.6, spaceBetween: 14 },
                    576:  { slidesPerView: 2.6, spaceBetween: 18 },
                    992:  { slidesPerView: 4,   spaceBetween: 22 },
                    1200: { slidesPerView: 5,   spaceBetween: 24 },
                  }}
                >
                  {DEST.map((d, i) => (
                    <SwiperSlide key={i} className={`hm-dest-slide v${i % 5}`}>
                      <div className="hm-dest">
                        <img src={img(d)} alt="Immigration destination" loading="lazy" />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                <div className="hm-dest-nav">
                  <button type="button" className="hm-dest-prev" aria-label="Previous">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
                  </button>
                  <button type="button" className="hm-dest-next" aria-label="Next">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* SECTION 3 — ABOUT US

            Edit the founder image and caption in the left column. Update the copy,
            checklist, and link in the right column. Styles: index.css, "4. ABOUT". */}
        <section id="about" ref={aboutRef} className={`hm-sec hm-about-section${aboutSeen ? ' is-revealed' : ''}`} aria-labelledby="hm-about-title">
          <div className="hm-wrap hm-about">
            <Reveal from="left" className="hm-about-art">
              <div className="hm-founder-profile">
                <div className="hm-founder-photo-frame">
                  <span className="hm-founder-ring" aria-hidden="true" />
                  <div className="hm-about-img hm-about-award hm-about-founder">
                    <img src={img('images/pages/home/about-us/founder.png')} alt="Visa For Nation founder" loading="lazy" onError={(event) => event.currentTarget.classList.add('image-unavailable')} />
                    <span className="hm-founder-placeholder" role="img" aria-label="Founder portrait unavailable">VFN</span>
                    <span className="hm-about-shadow" aria-hidden="true" />
                  </div>
                </div>
                <div className="hm-founder-caption">
                  <span>FOUNDER &amp; VISIONARY</span>
                  <strong>Visa For Nation</strong>
                  <p>Guiding global journeys with clarity and care.</p>
                </div>
              </div>
            </Reveal>

            <Reveal from="right" delay={120} className="hm-about-text">
              <span className="hm-eyebrow">About Us</span>
              <h2 id="hm-about-title" className="hm-h2">
                Best Immigration Consultant <em>in Delhi</em>
              </h2>

              <div className="hm-about-authority">
                <h3>The Vision Behind Visa For Nation</h3>
                <p>
                  Visa For Nation was built on a simple belief: every person planning to
                  live, work, or study abroad deserves clear and thoughtful guidance. That
                  founder-led vision shapes how we support each applicant, from understanding
                  their goals to preparing a careful, well-documented visa application.
                </p>
              </div>

              <ul className="hm-checks">
                <li>Expert profile evaluation</li>
                <li>Clean, transparent documentation</li>
                <li>End-to-end visa support</li>
              </ul>

              <Link to="/about" className="hm-btn red">Learn More <span aria-hidden="true">→</span></Link>
            </Reveal>
          </div>
        </section>

        {/* SECTION 4 — IMMIGRATION & VISA SERVICES
            Edit country names, images, and links in the COUNTRIES array.
            Styles: index.css, "5. COUNTRIES". */}
        <section className="hm-sec soft hm-countries-section">
          <div className="hm-wrap">
            <Head tag="Immigration & Visa Services" title="For Following" accent="Countries" />

            <Slider
              items={COUNTRIES}
              breakpoints={BP(1.2, 2, 4, 5, 5)}
              render={(c) => (
                <div className="hm-slide">
                  <Link to={c.h} className="hm-country">
                    <div className="hm-country-img">
                      <img src={img(c.img)} alt={c.n} loading="lazy" />
                    </div>
                    <h3>{c.n}</h3>
                    <span className="hm-pill">Apply Now <i>→</i></span>
                  </Link>
                </div>
              )}
            />
          </div>
        </section>

        {/* SECTION 5 — WHY CHOOSE US + ELIGIBILITY FORM
            Edit form text in EnquiryForm props; update feature copy in the WHY array.
            Styles: index.css, "6. WHY CHOOSE US". */}
        <section className="hm-sec hm-why-section">
          <div className="hm-wrap hm-why">
            <Reveal from="left" className="hm-why-form">
              <EnquiryForm
                variant="card"
                category="General"
                title="Free Eligibility Check"
                sub="Our experts call you back within 24 hours"
              />
            </Reveal>

            <Reveal from="right" delay={120} className="hm-why-content">
              <span className="hm-eyebrow">Why Choose Us</span>
              <h2 className="hm-h2">
                Your Pathway Abroad, <em>Made Simpler</em>
              </h2>
              <p className="hm-lead">
                Experience reliable guidance at every step of your immigration journey —
                secure opportunities, unlock a brighter future, and achieve your global
                goals with confidence.
              </p>

              <div className="hm-why-list">
                {WHY.map(([t, d], i) => (
                  <div className="hm-why-item" key={t}>
                    <b>{String(i + 1).padStart(2, '0')}</b>
                    <div>
                      <h3>{t}</h3>
                      <p>{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* SECTION 6 — STUDY VISA
            Edit the heading below and card images, names, and links in the STUDY array.
            Styles: index.css, "7. STUDY VISA". */}
        <section className="hm-sec soft hm-study">
          <div className="hm-wrap">
            <Head
              tag="Study Visa"
              title="Choose Your"
              
              accent="Dream Destination"
              sub="Top universities, clear guidance and a smooth student visa process."
            />

            <Slider
              items={STUDY}
              autoplay={2200}
              breakpoints={BP(1.4, 2.2, 3, 4, 4)}
              render={(s) => (
                <div className="hm-slide">
                  <Link to={s.h} className="hm-study-card" aria-label={s.n}>
                    <img src={img(s.img)} alt={s.n} loading="lazy" />
                  </Link>
                </div>
              )}
            />
          </div>
        </section>

        {/* SECTION 7 — HOW IT WORKS
            Edit the step labels in the STEPS array. Styles: index.css, "8. SIX STEPS". */}
        <section className="hm-sec">
          <div className="hm-wrap">
            <Head tag="How It Works" title="Your Journey In" accent="6 Simple Steps" />

            <div className="hm-steps hm-eq">
              {STEPS.map((t, i) => (
                <Reveal key={t} from="up" delay={i * 70}>
                  <div className="hm-step">
                    <b>{i + 1}</b>
                    <h3>{t}</h3>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 8 — INSTAGRAM REELS

            Profile details are below; Instagram reels are managed in Admin > Content management > Home > Instagram reels.
            Styles: index.css, "9. INSTAGRAM".
       */}
        
<section className="hm-sec soft hm-ig-week-section">
  <div className="hm-wrap">
    <Head tag="Instagram" title="Reels Of" accent="The Week" sub="A closer look at our people, guidance and client journeys." />
    <div className="hm-ig-week-grid">
      <article className="hm-ig-profile">
        <div className="hm-ig-profile-head">
          <a className="hm-ig-profile-top" href="https://www.instagram.com/visa_for_nation/" target="_blank" rel="noreferrer" aria-label="Open Visa For Nation Instagram profile">
            <span className="hm-ig-brand-avatar"><img src="/logo.png" alt="" /></span>
          </a>
          <div className="hm-ig-profile-info">
            <a className="hm-ig-username" href="https://www.instagram.com/visa_for_nation/" target="_blank" rel="noreferrer">visa_for_nation</a>
            <div className="hm-ig-stats"><span><b>12.1K</b><small>followers</small></span><span><b>5</b><small>following</small></span></div>
            <div className="hm-ig-profile-bio">
              
              <strong>Visa For Nation_Since2015</strong>

              <span>PR | WORK | TOURIST | BUSINESS | INVESTMENT</span>
              <span>📈 99.9% Success Rate | 17,000+ Visas Approved</span>
              <span>Contact Us: info@visafornation.com</span>
              <a href="https://visafornation.com" target="_blank" rel="noreferrer">visafornation.com and more</a>
            </div>
          </div>
        </div>
        <div className="hm-ig-highlights" aria-label="Instagram story highlights">
          <a href="https://www.instagram.com/visa_for_nation/" target="_blank" rel="noreferrer"><span>🏆</span><small>Success Stories</small></a>
          <a href="https://www.instagram.com/visa_for_nation/" target="_blank" rel="noreferrer"><span>🏆</span><small>Testimonial</small></a>
          <a href="https://www.instagram.com/visa_for_nation/" target="_blank" rel="noreferrer"><span>🎥</span><small>Cele Vibes</small></a>
          <a href="https://www.instagram.com/visa_for_nation/" target="_blank" rel="noreferrer"><span>📣</span><small>Media Mention</small></a>
        </div>
        <a className="hm-ig-profile-link" href="https://www.instagram.com/visa_for_nation/" target="_blank" rel="noreferrer">View Instagram profile <b aria-hidden="true">&#8599;</b></a>
      </article>
      {visibleInstagramReels.map((item, index) => {
        const path = item.urls[0];
        const uploaded = path.startsWith('/uploads/reels/');
        const cardKey = String(item._id || path || index);
        const apiBase = String(import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
        const videoUrl = path.startsWith('/uploads/') ? `${apiBase}${path}` : path;
        const reelCode = path.match(/instagram\.com\/reel\/([^/?#]+)/i)?.[1];
        const embedUrl = reelCode ? `https://www.instagram.com/reel/${reelCode}/embed/` : '';
        return <article className="hm-ig-week-reel" key={cardKey}>
          <div className="hm-ig-week-frame">
            {uploaded
              ? <video src={videoUrl} title={`Visa For Nation Instagram reel ${index + 1}`} playsInline controls preload="metadata" />
              : embedUrl
                ? <iframe src={embedUrl} title={`Visa For Nation Instagram reel ${index + 1}`} loading="lazy" allowFullScreen scrolling="no" style={{ top: 0, left: 0, width: '100%', height: '100%', maxWidth: '100%' }} />
                : <a className="hm-ig-week-empty" href={path} target="_blank" rel="noreferrer">View Instagram Reel</a>}
            <div className="hm-ig-week-actions">
              <button type="button" aria-label="Share video" onClick={() => shareInstagramReel(path)}>&#8599;</button>
              <a href={uploaded ? 'https://www.instagram.com/visa_for_nation/' : path} target="_blank" rel="noreferrer" aria-label="Open Instagram Reel"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r=".7" fill="currentColor"/></svg></a>
            </div>
          </div>
          <div className="hm-ig-week-caption"><span className="hm-ig-week-dot" /> @visa_for_nation <span>Instagram Reel</span></div>
        </article>;
      })}
      {!visibleInstagramReels.length && <p className="hm-ig-week-empty">Video stories will appear here soon.</p>}
    </div>
    <div className="hm-carousel-arrows hm-ig-week-arrows" aria-label="Instagram reel navigation">
      <button type="button" aria-label="Previous reels" onClick={() => setInstagramReelIndex(index => Math.max(0, index - 1))} disabled={instagramReelIndex === 0}>&#8592;</button>
      <button type="button" aria-label="Next reels" onClick={() => setInstagramReelIndex(index => Math.min(Math.max(0, reelSource.length - 2), index + 1))} disabled={instagramReelIndex >= Math.max(0, reelSource.length - 2)}>&#8594;</button>
    </div>
  </div>
</section>
{/* SECTION 9 — SUCCESS STORIES / VIDEO TESTIMONIALS
    Videos are managed in Admin > Testimonials. Styles: index.css, "10. VIDEO TESTIMONIALS". */}
<section className="hm-sec hm-reels-section" id="testimonials">
  <div className="hm-wrap" onMouseEnter={() => { testimonialHovered.current = true; testimonialSwiper.current?.autoplay?.stop(); }} onMouseLeave={() => { testimonialHovered.current = false; if (playingVideo === null) testimonialSwiper.current?.autoplay?.start(); }}>
    <Head tag="Success Stories" title="Client" accent="Testimonials" />
    <Swiper className="hm-testimonial-swiper" modules={[Autoplay]} onSwiper={swiper => { testimonialSwiper.current = swiper; }}
      slidesPerView={1} spaceBetween={18} loop={testimonialItems.length > 4}
      autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: false }}
      breakpoints={{ 576: { slidesPerView: 2 }, 768: { slidesPerView: 3 }, 992: { slidesPerView: 4 } }}>
      {testimonialItems.map((item, index) => {
        const id = getTestimonialId(item.videoUrl);
        if (!id) return null;
        const likeKey = String(item._id || item.videoUrl);
        return <SwiperSlide key={item._id || id}>
          <div className="hm-reel-card"><div className="hm-reel-frame">
            <iframe id={`hm-testimonial-${id}`} src={`https://www.youtube-nocookie.com/embed/${id}?enablejsapi=1&controls=0&rel=0&modestbranding=1&playsinline=1`}
              title={item.title || `Client testimonial ${index + 1}`} loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" />
            <button type="button" className="hm-reel-play" aria-label={playingVideo === id ? 'Pause video' : 'Play video'} onClick={() => {
              const next = playingVideo === id ? null : id;
              sendTestimonialCommand(id, next ? 'playVideo' : 'pauseVideo');
              if (next) testimonialSwiper.current?.autoplay?.stop();
              else if (!testimonialHovered.current) testimonialSwiper.current?.autoplay?.start();
              setPlayingVideo(next);
            }}>{playingVideo === id ? <>&#x23F8;</> : <>&#9654;</>}</button>
            <div className="hm-reel-controls" aria-label="Testimonial controls">
              <button type="button" className={likedVideos[likeKey] ? 'is-liked' : ''} aria-label="Like video" aria-pressed={Boolean(likedVideos[likeKey])} onClick={() => likeTestimonialVideo(item)}>&#9829;</button>
              <span className="hm-reel-like-count">{item.likes || 0}</span>
              <button type="button" aria-label="Share video" onClick={() => shareTestimonial(id)}>&#8599;</button>
              <button type="button" className={captionVideos[id] ? 'is-active' : ''} aria-label={captionVideos[id] ? 'Turn captions off' : 'Turn captions on'} aria-pressed={Boolean(captionVideos[id])} onClick={() => {
                const enabled = !captionVideos[id]; sendTestimonialCommand(id, enabled ? 'loadModule' : 'unloadModule', ['captions']);
                setCaptionVideos(prev => ({ ...prev, [id]: enabled }));
              }}>CC</button>
              <a href={`https://www.youtube.com/shorts/${id}`} target="_blank" rel="noreferrer" aria-label="Open as a Short">Short</a>
            </div>
          </div></div>
        </SwiperSlide>;
      })}
    </Swiper>
    <div className="hm-testimonial-arrows hm-carousel-arrows" aria-label="Testimonial navigation">
      <button type="button" aria-label="Previous testimonials" onClick={() => testimonialSwiper.current?.slidePrev()}>&#8592;</button>
      <button type="button" aria-label="Next testimonials" onClick={() => testimonialSwiper.current?.slideNext()}>&#8594;</button>
    </div>
  </div>
</section>
{/* SECTION 10 — GOOGLE REVIEWS
    Reviews load from Admin > Reviews. Edit the business profile, score, and office images here.
    Styles: index.css, "11. GOOGLE REVIEWS". */}
        <section className="hm-sec soft">
          <div className="hm-wrap">
            <div className="hm-reviews">
              <Reveal from="left">
                <div className="hm-biz">
                  <div className="hm-biz-photo-strip">
                    <img src="/assets/media/reviews/reception.png" alt="Visa For Nation reception area" loading="lazy" />
                    <img src="/assets/media/reviews/officeInterior.png" alt="Visa For Nation office workspace" loading="lazy" />
                  </div>
                  <div className="hm-biz-score">
                    <b>4.7</b>
                    <div>
                      <span className="hm-stars big">★★★★★</span>
                      <small>69 Google reviews</small>
                    </div>
                  </div>

                  <h3>Visa For Nation — Best Immigration Consultants In Delhi, India</h3>
                  <p>Immigration &amp; visa consultant · Greater Kailash, New Delhi</p>

                  <div className="hm-biz-actions">
                    <a href="https://visafornation.com" target="_blank" rel="noreferrer"><svg className="hm-review-action-icon hm-review-action-website" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>Website</a>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=Visa+For+Nation+Greater+Kailash+New+Delhi" target="_blank" rel="noreferrer"><svg className="hm-review-action-icon hm-review-action-directions" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-7.2 8-13a8 8 0 1 0-16 0c0 5.8 8 13 8 13Z" /><circle cx="12" cy="9" r="2.5" /></svg>Directions</a>
                    <a href="tel:+917677666677"><svg className="hm-review-action-icon hm-review-action-call" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 3a14 14 0 0 1-5-5l3-2-2-5-3 1Z" /></svg>Call</a>
                  </div>
                  <a className="hm-biz-all-reviews" href="https://www.google.com/maps/place/Visa+For+Nation+-+Best+Immigration+Consultants+In+Delhi" target="_blank" rel="noreferrer"><GoogleMark /> View all Google Reviews</a>
                </div>
              </Reveal>

              <Reveal from="right">
                <div className="hm-reviews-panel-head">
                  <div><span className="hm-google-heading"><GoogleMark /> GOOGLE REVIEWS</span><h3>What our clients say</h3></div>
                  <div className="hm-review-controls" aria-label="Review navigation">
                    <button type="button" aria-label="Previous review" onClick={() => setActiveReviewIndex(index => (index - 1 + reviewItems.length) % reviewItems.length)}>&#8592;</button>
                    <button type="button" aria-label="Next review" onClick={() => setActiveReviewIndex(index => (index + 1) % reviewItems.length)}>&#8594;</button>
                  </div>
                </div>
                <article className="hm-review-featured" key={activeReviewIndex} aria-live="polite">
                  <div className="hm-review-feature-top"><span className="hm-av">{featuredReview[0]?.[0] || 'V'}</span><div><h4>{featuredReview[0]}</h4><small>{featuredReview[1]}</small></div><span className="hm-review-source"><GoogleMark /> <small>Google</small></span></div>
                  <span className="hm-google-stars" aria-label={`${featuredReview[3] || 5} out of 5 stars`}>{Array.from({ length: 5 }, (_, star) => <span className={star < (Number(featuredReview[3]) || 5) ? '' : 'is-empty'} key={star}>&#9733;</span>)}</span>
                  <p>“{featuredReview[2]}”</p>
                  <div className="hm-review-verified"><span>✓</span> Client review <i>{String(displayedReviewIndex + 1).padStart(2, '0')} / {String(reviewItems.length).padStart(2, '0')}</i></div>
                </article>
                <div className="hm-review-pagination" role="group" aria-label="Choose a review">
                  {reviewItems.map((_, index) => (
                    <button
                      type="button"
                      className={index === displayedReviewIndex ? 'is-active' : ''}
                      aria-label={`Show review ${index + 1}`}
                      aria-pressed={index === displayedReviewIndex}
                      key={index}
                      onClick={() => setActiveReviewIndex(index)}
                    />
                  ))}
                </div>
                <div className="hm-ticker">
                  <div className="hm-ticker-track">
                    {otherReviews.slice(0, 2).map(([n, t, x, rating], i) => (
                      <article className="hm-review" key={i}>
                        <div className="hm-review-top">
                          <span className="hm-av">{n[0]}</span>
                          <div>
                            <h4>{n}</h4>
                            <small>{t}</small>
                          </div>
                        </div>
                        <span className="hm-google-stars" aria-label={`${rating || 5} out of 5 stars`}>{Array.from({ length: 5 }, (_, star) => <span className={star < (Number(rating) || 5) ? '' : 'is-empty'} key={star}>&#9733;</span>)}</span>
                        <p>{x}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* SECTION 11 — OUR MEDIA
            Edit logos, labels, and links in the MEDIA array. Styles: index.css, "12. MEDIA MENTIONS". */}
        <section className="hm-sec hm-media">
          <div className="hm-wrap">
            <Head tag="As Seen In" title="Our Media" accent="Mentions" />
            <div className="hm-media-marquee" aria-label="Media coverage">
              {[MEDIA.filter((_, index) => index % 2 === 0), MEDIA.filter((_, index) => index % 2 === 1)].map((row, rowIndex) => (
                <div className={`hm-media-row${rowIndex === 0 ? ' moves-right' : ' moves-left'}`} key={rowIndex}>
                  <div className="hm-media-track">
                    {[0, 1].map(copy => (
                      <div className="hm-media-group" key={copy} aria-hidden={copy === 1 || undefined}>
                        {row.map((media, index) => (
                          <a
                            className="hm-logo"
                            href={media.h || undefined}
                            target={media.h ? '_blank' : undefined}
                            rel={media.h ? 'nofollow noopener noreferrer' : undefined}
                            aria-label={copy === 0 ? media.n : undefined}
                            tabIndex={copy === 1 ? -1 : undefined}
                            key={`${media.n}-${index}`}
                          >
                            <img src={img(media.img)} alt={copy === 0 ? media.n : ''} loading="lazy" />
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* SECTION 12 — LATEST UPDATES
            Articles load from Admin > Blog. Edit the heading and fallback text below.
            Styles: index.css, search for "hm-blog-section". */}


        <section className="hm-sec soft hm-blog-section">
          <div className="hm-wrap">
            <Head tag="Latest Updates" title="Visa & Immigration" accent="Insights" sub="Helpful guides and updates from our team." />
            <div className="hm-blog-grid">
              {blogPosts.slice(0, 3).map((post, index) => {
                const image = post.image?.startsWith('uploads/') && /^\d{10}_/.test(post.image.split('/')[1])
                  ? img(post.image)
                  : adminImg(post.image) || img(post.image);
                return (
                  <Link className="hm-blog-card" to={`/blog/${post.slug}`} key={post._id || post.slug || index}>
                    <div className="hm-blog-image">
                      <img src={image} alt={post.title} loading="lazy" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = img(post.image); }} />
                    </div>
                    <div className="hm-blog-content">
                      <div className="hm-blog-meta">
                        <span>{post.category || 'Visa guide'}</span>
                        <time>{new Date(post.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</time>
                      </div>
                      <h3>{post.title}</h3>
                      <p>{post.metaDescription || 'Read the latest guidance and updates from Visa For Nation.'}</p>
                      <span className="hm-blog-read">Read article <span aria-hidden="true">?</span></span>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="hm-center"><Link className="hm-btn line" to="/blog">View all articles</Link></div>
          </div>
        </section>
        {/* SECTION 13 — FAQ
            Edit questions and answers in the FAQS array. Styles: index.css, "14. FAQ". */}
        <section className="hm-sec hm-faq-section">
          <div className="hm-wrap">
            <Head tag="Frequently Asked Questions" title="Got" accent="Questions?" />

            <div className="hm-faq-cols">
              {[FAQS.slice(0, half), FAQS.slice(half)].map((col, c) => (
                <div className="hm-faq-col" key={c}>
                  {col.map(([q, a], j) => {
                    const i = c * half + j;
                    const open = faq === i;
                    return (
                      <div key={q} className={`hm-faq${open ? ' open' : ''}`}>
                        <button onClick={() => setFaq(open ? -1 : i)} aria-expanded={open}>
                          <h3>{q}</h3>
                          <i />
                        </button>
                        <div className="hm-faq-body"><p>{a}</p></div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
