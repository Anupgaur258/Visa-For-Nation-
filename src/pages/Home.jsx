import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import { YouTube } from '../components/Media.jsx';
import { Globe, Cap, Briefcase, Passport, Flight } from '../components/Art.jsx';
import Slider from '../components/Slider.jsx';
import Reveal from '../components/Reveal.jsx';
import { img } from '../api.js';
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
  const half = Math.ceil(FAQS.length / 2);
  const [statsRef, statsSeen] = useInView();

  useEffect(() => {
    document.title = 'Best Immigration Consultant in Delhi | Visa For Nation';
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
        <section className="hm-sec soft">
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

        {/* ============ 9. Instagram ============ */}
        <section className="hm-sec soft">
          <div className="hm-wrap">
            <Head tag="Instagram" title="Reels Of" accent="The Week" />

            <Slider
              items={IG}
              autoplay={0}
              breakpoints={BP(1.4, 2.4, 4, 5, 5)}
              render={(id) => (
                <div className="hm-slide">
                  <a
                    className="hm-ig"
                    href={`https://www.instagram.com/${id}/`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="hm-ig-play">▶</span>
                    <b>Watch on Instagram</b>
                    <small>@visa_for_nation</small>
                    <i aria-hidden="true">↗</i>
                  </a>
                </div>
              )}
            />

            <div className="hm-center">
              <a
                className="hm-btn red"
                href="https://www.instagram.com/visa_for_nation/"
                target="_blank"
                rel="noreferrer"
              >
                Follow @visa_for_nation <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>

        {/* ============ 10. Video testimonials ============ */}
        <section className="hm-sec">
          <div className="hm-wrap">
            <Head tag="Success Stories" title="Client" accent="Testimonials" />

            <Slider
              items={YT}
              autoplay={0}
              breakpoints={BP(1.3, 2.2, 3, 4, 4)}
              render={(id) => (
                <div className="hm-slide">
                  <div className="hm-video">
                    <YouTube id={id} />
                  </div>
                </div>
              )}
            />
          </div>
        </section>

        {/* ============ 11. Google reviews (vertical auto-scroll) ============ */}
        <section className="hm-sec soft">
          <div className="hm-wrap">
            <Head tag="Google Reviews" title="Hear From Our" accent="Happy Clients" />

            <div className="hm-reviews">
              <Reveal from="left">
                <div className="hm-biz">
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
                    {[...REVIEWS, ...REVIEWS].map(([n, t, x], i) => (
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