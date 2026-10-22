import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import { YouTube } from '../components/Media.jsx';
import { Globe, Cap, Briefcase, Passport, Flight } from '../components/Art.jsx';
import Slider from '../components/Slider.jsx';
import Reveal from '../components/Reveal.jsx';
import { api, img, adminImg } from '../api.js';
import { FALLBACK_POSTS } from '../data/postsData.js';
import { BANNERS, DEST, COUNTRIES, WHY, STUDY, IG, YT, REVIEWS, MEDIA, FAQS, SEO_INTRO, SEO_MORE } from '../data/home.js';
import aboutGlobe from '../assets/about-globe.png';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

/* ------------------------------------------------------------------ */
/*  helpers                                                            */
/* ------------------------------------------------------------------ */

const BP = (a, b, c, d, e) => ({
  0: { slidesPerView: a },
  576: { slidesPerView: b },
  992: { slidesPerView: c },
  1200: { slidesPerView: d },
  1400: { slidesPerView: e },
});

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

/* Element screen me aaye to seen = true (3 tareeke se detect hota hai) */
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

/* 0 se `to` tak count-up (state se chalta hai, DOM hack nahi) */
function CountUp({ to, dec = 0, suffix = '', start, duration = 1800 }) {
  const [v, setV] = useState(0);

  useEffect(() => {
    if (!start) return undefined;

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      setV(to);
      return undefined;
    }

    let raf;
    let t0;
    const step = (t) => {
      if (!t0) t0 = t;
      const p = Math.min((t - t0) / duration, 1);
      setV(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
      else setV(to);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [start, to, duration]);

  return <>{v.toFixed(dec)}{suffix}</>;
}

/* ------------------------------------------------------------------ */
/*  static data                                                        */
/* ------------------------------------------------------------------ */

const STATS = [
  {
    n: 5, dec: 1, suffix: '', label: 'Google Rating', caption: 'Rated by our clients', rating: true,
    icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.9L12 3.5z" /></svg>,
  },
  {
    n: 69, dec: 0, suffix: '+', label: 'Google Reviews', caption: 'Real client experiences',
    icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4V5z" /><path d="M8.5 10h7M8.5 13h4" /></svg>,
  },
  {
    n: 9, dec: 0, suffix: '+', label: 'Countries Covered', caption: 'Global opportunities',
    icon: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>,
  },
  {
    n: 6, dec: 0, suffix: '', label: 'Guided Steps', caption: 'Your journey, simplified',
    icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11" /><path d="M3.5 6l1.2 1.2L6.8 5M3.5 12l1.2 1.2L6.8 11M3.5 18l1.2 1.2L6.8 17" /></svg>,
  },
];

const PATHS = [
  [Cap, 'Study Abroad', 'Admissions, SOP, funds proof and student visa for top universities.', '/study-in-canada'],
  [Briefcase, 'Work & Jobs', 'Work permits and job assistance across Canada, Europe, UK and Singapore.', '/canada-work-permit'],
  [Passport, 'Permanent Residency', 'Express Entry, PNP and Australia 189 / 190 / 491 with expert profile planning.', '/visa/pr/canada'],
  [Flight, 'Tourist & Visit', 'Schengen, USA, UK, Canada and Australia visitor visas with clean documentation.', '/schengen-tourist-visa'],
];

const STEPS = [
  'Free Eligibility Assessment',
  'Profile Evaluation',
  'Documentation',
  'Application Submission',
  'Updates & Support',
  'Post-Visa Guidance',
];

/* ------------------------------------------------------------------ */
/*  page                                                               */
/* ------------------------------------------------------------------ */

export default function Home() {
  const [more, setMore] = useState(false);
  const [faq, setFaq] = useState(0);
  const [instagramReelIndex, setInstagramReelIndex] = useState(0);
  const [instagramItems, setInstagramItems] = useState(IG);
  const [reviewItems, setReviewItems] = useState(REVIEWS);
  const [likedInstagramReels, setLikedInstagramReels] = useState({});
  const half = Math.ceil(FAQS.length / 2);
  const [statsRef, statsSeen] = useInView();
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

  const reelSource = instagramItems.length ? instagramItems : IG;
  const visibleInstagramReels = [reelSource[instagramReelIndex % reelSource.length], reelSource[(instagramReelIndex + 1) % reelSource.length]];
  const shareInstagramReel = async path => {
    const url = `https://www.instagram.com/${path}/`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Visa For Nation Instagram Reel', url }); } catch { /* share dismissed */ }
    } else if (navigator.clipboard) {
      try { await navigator.clipboard.writeText(url); } catch { /* clipboard unavailable */ }
    }
  };  const getTestimonialId = (url) => {
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
    api('/reviews').then(items => { if (Array.isArray(items) && items.length) setReviewItems(items.map(item => [item.name, 'Client review', item.message])); }).catch(() => {});
    api('/reels').then(items => { const urls = (items || []).flatMap(item => item.urls || []).map(url => String(url).split('instagram.com/').pop().split('/').filter(Boolean).join('/')).filter(Boolean); if (urls.length) setInstagramItems(urls); }).catch(() => {});
    api('/testimonials').then(items => {
      if (Array.isArray(items) && items.length) setTestimonialItems(items);
    }).catch(() => {});
    api('/posts').then(items => { if (Array.isArray(items) && items.length) setBlogPosts(items.slice(0, 3)); }).catch(() => {});
  }, []);

  return (
    <>
      {/* ============ Banner carousel (UNTOUCHED) ============ */}
      <Swiper
        className="hero-slider"
        modules={[Navigation, Autoplay, Pagination]}
        navigation
        pagination={{ clickable: true }}
        loop={BANNERS.length > 1}
        speed={1000}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
      >
        {BANNERS.map(([d, m], i) => (
          <SwiperSlide key={i}>
            <picture>
              <source media="(min-width:768px)" srcSet={img(d)} />
              <img src={img(m)} alt={`Visa For Nation banner ${i + 1}`} />
            </picture>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="hm">
        {/* ============ 1. Trust / counter ============ */}
        <section className="hm-sec hm-stats">
          <div className="hm-wrap">
            <Head
              tag="Trust that speaks for itself"
              title="Your Journey."
              accent="Our Commitment."
              sub="Real trust, global opportunities, and guidance at every step."
            />

            <div className="hm-stat-grid hm-eq" ref={statsRef}>
              {STATS.map((s, i) => (
                <Reveal key={s.label} from="up" delay={i * 90}>
                  <div className="hm-stat">
                    <span className="hm-stat-icon">{s.icon}</span>

                    <div className="hm-stat-num">
                      <CountUp to={s.n} dec={s.dec} suffix={s.suffix} start={statsSeen} />
                      {s.rating && <small>/ 5</small>}
                    </div>

                    <h3>{s.label}</h3>
                    <p>{s.caption}</p>

                    {s.rating && (
                      <div className="hm-stars" aria-label="5 out of 5 stars">
                        {[0, 1, 2, 3, 4].map((k) => <b key={k}>★</b>)}
                      </div>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="hm-stat-foot">
              <span /><em>Your global future starts here</em><span />
            </div>
          </div>
        </section>

        {/* ============ 2. Pathways ============ */}
        <section className="hm-sec">
          <div className="hm-wrap">
            <Head tag="Choose Your Pathway" title="Where Do You Want" accent="Your Life To Go?" />

            <div className="hm-paths hm-eq">
              {PATHS.map(([A, t, d, h], i) => (
                <Reveal key={t} from="up" delay={i * 90}>
                  <Link to={h} className="hm-path">
                    <div className="hm-path-art"><A /></div>
                    <h3>{t}</h3>
                    <p>{d}</p>
                    <span className="hm-link">Explore pathway <i>→</i></span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============ 3. Immigration consultants (destinations) ============ */}
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

        {/* ============ 4. About ============ */}
        <section className="hm-sec">
          <div className="hm-wrap hm-about">
            <Reveal from="left" className="hm-about-art">
              <div className="hm-about-img">
                <img src={aboutGlobe} alt="Visa For Nation global immigration network" loading="lazy" />
                <span className="hm-about-shadow" aria-hidden="true" />
              </div>
            </Reveal>

            <Reveal from="right" delay={120} className="hm-about-text">
              <span className="hm-eyebrow">About Us</span>
              <h2 className="hm-h2">
                Best Immigration Consultant <em>in Delhi</em>
              </h2>

              <p>
                Finding the best immigration consultant in Delhi can be the single most
                important decision in your journey to live, work, or study abroad. With
                embassies tightening scrutiny and eligibility criteria changing every few
                months, a small documentation error or an outdated strategy can turn a
                strong profile into a rejected file. That is where Visa For Nation comes in.
              </p>

              <ul className="hm-checks">
                <li>Expert profile evaluation</li>
                <li>Clean, transparent documentation</li>
                <li>End-to-end visa support</li>
              </ul>

              <Link to="/about" className="hm-btn red">Learn More <span aria-hidden="true">→</span></Link>
            </Reveal>
          </div>
        </section>

        {/* ============ 5. Countries ============ */}
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

        {/* ============ 6. Why choose us ============ */}
        <section className="hm-sec">
          <div className="hm-wrap hm-why">
            <Reveal from="left" className="hm-why-art">
              <div className="hm-globe">
                <Globe />
              </div>
              <span className="hm-globe-tag">Your Global Journey</span>
            </Reveal>

            <Reveal from="right" delay={120}>
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

        {/* ============ 7. Study visa ============ */}
        <section className="hm-sec hm-study">
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

        {/* ============ 8. 6 steps ============ */}
        <section className="hm-sec hm-process-section">
          <div className="hm-wrap">
            <Head tag="Visa Process" title="Your Journey In" accent="6 Simple Steps" />

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

        {/* ============ 9. Instagram ============ */}
<section className="hm-sec soft hm-ig-week-section">
  <div className="hm-wrap">
    <Head tag="Instagram" title="Reels Of" accent="The Week" sub="A closer look at our people, guidance and client journeys." />
    <div className="hm-ig-week-grid">
      <a className="hm-ig-profile" href="https://www.instagram.com/visa_for_nation/" target="_blank" rel="noreferrer" aria-label="Visit Visa For Nation on Instagram">
        <div className="hm-ig-profile-top"><span className="hm-ig-brand-avatar"><img src="/logo.png" alt="" /></span><div><strong>visa_for_nation</strong><small>Visa For Nation</small></div><span className="hm-ig-verified" aria-label="Verified">&#10003;</span></div>
        <div className="hm-ig-stats"><span><b>Reels</b><small>Weekly</small></span><span><b>Guides</b><small>Visa advice</small></span><span><b>Stories</b><small>Client wins</small></span></div>
        <p>Visa guidance for your next global journey. Expert support for study, work and permanent residency.</p>
        <div className="hm-ig-profile-tags"><span>Immigration</span><span>Study abroad</span><span>Client stories</span></div>
        <div className="hm-ig-profile-preview" aria-hidden="true"><span>&#9992;</span><span>VFN</span><span>&#10024;</span></div>
        <span className="hm-ig-profile-link">Visit Instagram <b aria-hidden="true">&#8599;</b></span>
      </a>
      {visibleInstagramReels.map((path, index) => (
        <article className="hm-ig-week-reel" key={`${path}-${index}`}>
          <div className="hm-ig-week-frame">
            <iframe src={`https://www.instagram.com/${path}/embed/`} title={`Visa For Nation Instagram reel ${index + 1}`} loading="lazy" scrolling="no" allow="autoplay; encrypted-media; picture-in-picture" />
            <a className="hm-ig-week-play" href={`https://www.instagram.com/${path}/`} target="_blank" rel="noreferrer" aria-label="Play reel">&#9654;</a>
            <div className="hm-ig-week-actions">
              <button type="button" className={likedInstagramReels[path] ? 'is-liked' : ''} aria-label={likedInstagramReels[path] ? 'Unlike reel' : 'Like reel'} aria-pressed={Boolean(likedInstagramReels[path])} onClick={() => setLikedInstagramReels(prev => ({ ...prev, [path]: !prev[path] }))}>&#9829;</button>
              <button type="button" aria-label="Share reel" onClick={() => shareInstagramReel(path)}>&#8599;</button>
            </div>
          </div>
        </article>
      ))}
    </div>
    <div className="hm-carousel-arrows hm-ig-week-arrows" aria-label="Instagram reel navigation">
      <button type="button" aria-label="Previous reels" onClick={() => setInstagramReelIndex(index => (index - 1 + IG.length) % IG.length)}>&#8592;</button>
      <button type="button" aria-label="Next reels" onClick={() => setInstagramReelIndex(index => (index + 1) % IG.length)}>&#8594;</button>
    </div>
  </div>
</section>{/* ============ 10. Video Testimonials ============ */}
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
</section>{/* ============ 11. Google reviews (vertical auto-scroll) ============ */}
        <section className="hm-sec soft">
          <div className="hm-wrap">
            <Head tag="Google Reviews" title="Hear From Our" accent="Happy Clients" />

            <div className="hm-reviews">
              <Reveal from="left">
                <div className="hm-biz">
                  <div className="hm-biz-brand">
                    <span className="hm-biz-logo"><img src="/logo.png" alt="Visa For Nation" /></span>
                    <span><strong>Visa For Nation</strong><small>Google Business Profile</small></span>
                  </div>
                  <div className="hm-biz-score">
                    <b>5.0</b>
                    <div>
                      <span className="hm-stars big">★★★★★</span>
                      <small>69 Google reviews</small>
                    </div>
                  </div>

                  <h3>Visa For Nation — Best Immigration Consultants In Delhi, India</h3>
                  <p>Immigration &amp; visa consultant · Greater Kailash, New Delhi</p>

                  <div className="hm-btn-row">
                    <a
                      className="hm-btn red"
                      href="https://www.google.com/maps/place/Visa+For+Nation+-+Best+Immigration+Consultants+In+Delhi"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Read Reviews
                    </a>
                    <a
                      className="hm-btn line"
                      href="https://www.google.com/maps/dir/?api=1&destination=Visa+For+Nation+Greater+Kailash+New+Delhi"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Directions
                    </a>
                  </div>
                </div>
              </Reveal>

              <Reveal from="right">
                <div className="hm-ticker">
                  <div className="hm-ticker-track">
                    {[...reviewItems, ...reviewItems].map(([n, t, x], i) => (
                      <article className="hm-review" key={i}>
                        <div className="hm-review-top">
                          <span className="hm-av">{n[0]}</span>
                          <div>
                            <h4>{n}</h4>
                            <small>{t}</small>
                          </div>
                        </div>
                        <span className="hm-stars">★★★★★</span>
                        <p>{x}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ============ 12. Media mentions ============ */}
        <section className="hm-sec hm-media">
          <div className="hm-wrap">
            <Head tag="As Seen In" title="Our Media" accent="Mentions" />

            <Slider
              items={MEDIA}
              breakpoints={BP(2, 3, 4, 4, 5)}
              render={(m) => (
                <div className="hm-slide">
                  <a
                    className="hm-logo"
                    href={m.h || undefined}
                    target={m.h ? '_blank' : undefined}
                    rel="nofollow noopener noreferrer"
                    aria-label={m.n}
                  >
                    <img src={img(m.img)} alt={m.n} loading="lazy" />
                  </a>
                </div>
              )}
            />
          </div>
        </section>


        {/* ============ Latest blog articles ============ */}
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
                      <h3>{post.title}</h3>
                      <span className="hm-blog-read">Read more <span aria-hidden="true">→</span></span>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="hm-center"><Link className="hm-btn line" to="/blog">View all articles</Link></div>
          </div>
        </section>
        {/* ============ 13. SEO content ============ */}
        <section className="hm-sec soft hm-seo">
          <div className="hm-wrap">
            <p>{SEO_INTRO}</p>

            {more && (
              <div className="hm-seo-grid">
                {SEO_MORE.map(([h, p]) => (
                  <div key={h} className="hm-seo-card">
                    <h3>{h}</h3>
                    <p>{p}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="hm-center">
              <button className="hm-btn line" onClick={() => setMore(!more)}>
                {more ? 'Show less ▲' : 'Show more ▼'}
              </button>
            </div>
          </div>
        </section>

        {/* ============ 14. FAQ ============ */}
        <section className="hm-sec">
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

        {/* ============ 15. CTA ============ */}
        <section className="hm-cta">
          <div className="hm-wrap hm-cta-in">
            <Reveal from="left">
              <h2 className="hm-h2">
                Ready to start your <em>visa journey?</em>
              </h2>
              <p>Book a free eligibility assessment with our Delhi-based experts.</p>
            </Reveal>

            <Reveal from="right" className="hm-btn-row">
              <Link to="/contact-us" className="hm-btn white">Book Free Consultation</Link>
              <a
                className="hm-btn ghost"
                href="https://wa.me/917677666677"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp Us
              </a>
            </Reveal>
          </div>
        </section>
      </div>
    </>
  );
}
