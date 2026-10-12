import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
// import { Navigation, Autoplay } from 'swiper/modules'; 
import { YouTube, Count } from '../components/Media.jsx';
import { Globe, Cap, Briefcase, Passport, Flight } from '../components/Art.jsx';
import Slider from '../components/Slider.jsx';
import Reveal from '../components/Reveal.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import { img } from '../api.js';
import { BANNERS, DEST, COUNTRIES, WHY, STUDY, IG, YT, REVIEWS, MEDIA, FAQS, SEO_INTRO, SEO_MORE } from '../data/home.js';

// import { Swiper, SwiperSlide } from 'swiper/react'; 
import { Navigation, Autoplay, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Head = ({ tag, title, light }) => <Reveal className={`sec-head ${light ? 'light' : ''}`}>
<span
  className="tag"
  style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    padding: '8px 20px',
    background: 'linear-gradient(135deg, #ef2b3c 0%, #c4121f 100%)',
    border: '1.5px solid rgba(255,255,255,0.55)',
    borderRadius: 50,
    color: '#FFFF00',
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
    fontSize: 11.5,
    fontWeight: 800,
    letterSpacing: '2.4px',
    lineHeight: 1.4,
    boxShadow: '0 10px 26px rgba(243, 34, 52, 0.74), inset 0 1px 0 rgba(255,255,255,0.25)',
    WebkitFontSmoothing: 'antialiased',
    textRendering: 'optimizeLegibility',
  }}
>
  <span
    style={{
      width: 8,
      height: 8,
      flexShrink: 0,
      borderRadius: '50%',
      background: '#ffffff',
    }}
  />
  {tag}
</span>
<h2>{title}</h2></Reveal>;
const BP = (a, b, c, d, e) => ({ 0: { slidesPerView: a }, 576: { slidesPerView: b }, 992: { slidesPerView: c }, 1200: { slidesPerView: d }, 1400: { slidesPerView: e } });

export default function Home() {
  /* Stats section: animated SVG icons */
const STAT_ICONS = [
  <svg viewBox="0 0 48 48" aria-hidden="true"><polygon className="ic-star" points="24 6 29.8 17.8 42.8 19.6 33.4 28.8 35.6 41.8 24 35.7 12.4 41.8 14.6 28.8 5.2 19.6 18.2 17.8" /><path className="ic-spark" d="M40 6v8M36 10h8" /></svg>,
  <svg viewBox="0 0 48 48" aria-hidden="true"><path className="ic-line" d="M8 8h32a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H22l-9 8v-8H8a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z" /><circle className="ic-dot" cx="15" cy="21" r="2.4" /><circle className="ic-dot d2" cx="24" cy="21" r="2.4" /><circle className="ic-dot d3" cx="33" cy="21" r="2.4" /></svg>,
  <svg viewBox="0 0 48 48" aria-hidden="true"><circle className="ic-line" cx="24" cy="24" r="17" /><ellipse className="ic-mer" cx="24" cy="24" rx="17" ry="17" /><path className="ic-line thin" d="M7 24h34M10 15h28M10 33h28" /><circle className="ic-ping" cx="33" cy="16" r="3" /><circle className="ic-pin" cx="33" cy="16" r="2.4" /></svg>,
  <svg viewBox="0 0 48 48" aria-hidden="true"><path className="ic-route" d="M6 38c8-2 8-14 16-14s6 10 12 6 6-16 8-20" /><circle className="ic-pin" cx="6" cy="38" r="2.6" /><path className="ic-arrow" d="M36 6h6v6" /></svg>,
];

const STAT_SIDES = ['left', 'up', 'up', 'right'];

// cursor ke saath red spotlight
const statSpot = e => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
};


// -------------------------------------- 

  const [more, setMore] = useState(false);
  const [faq, setFaq] = useState(0);
  const half = Math.ceil(FAQS.length / 2);
  useEffect(() => { document.title = 'Best Immigration Consultant in Delhi | Visa For Nation'; }, []);
  return (
    <>
      {/* Banner carousel — unchanged from the live site */}
     
{/* Banner carousel */}
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
        <img
          src={img(m)}
          alt={`Visa For Nation banner ${i + 1}`}
        />
      </picture>
    </SwiperSlide>
  ))}
</Swiper>

{/* counter section of review  */}

     <section className="stats-premium">
  {/* peeche chalte hue plane routes (HD, sharp) */}
  <svg className="stats-routes" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <path id="rt1" className="route" d="M60 330C300 40 780 40 1140 250" />
    <path id="rt2" className="route" d="M60 90C340 380 820 390 1140 110" />
    {[[60, 330], [1140, 250], [60, 90], [1140, 110]].map(([x, y]) => (
      <circle key={`${x}-${y}`} className="city" cx={x} cy={y} r="6" />
    ))}
    {['rt1', 'rt2'].map((id, i) => (
      <g key={id}>
        <path className="plane" transform="scale(1.7)" d="M12 0L-4-3-8-12-12-12-9-2-16-1.5-18-5-21-5-19 0-21 5-18 5-16 1.5-9 2-12 12-8 12-4 3Z" />
        <animateMotion dur={`${i ? 17 : 13}s`} repeatCount="indefinite" rotate="auto"><mpath href={`#${id}`} /></animateMotion>
      </g>
    ))}
  </svg>

  <div className="wrap">
    <Reveal from="up" className="stats-heading">
      <span
  className="stats-eyebrow"
  style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    padding: '8px 20px',
    background: 'linear-gradient(135deg, #ef2b3c 0%, #c4121f 100%)',
    border: '1 px solid rgba(255,255,255,0.55)',
    borderRadius: 50,
    color: '#FFFF00',
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
    fontSize: 11.5,
    fontWeight: 800,
    letterSpacing: '2.4px',
    lineHeight: 1.4,
    boxShadow: '0 10px 26px rgba(243, 34, 52, 0.74), inset 0 1px 0 rgba(255,255,255,0.25)',
    WebkitFontSmoothing: 'antialiased',
    textRendering: 'optimizeLegibility',
  }}
>
  <span
    className="stats-eyebrow-dot"
    style={{
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: '#ffffff',
      color:''
    }}
  />
  TRUST THAT SPEAKS FOR ITSELF
</span>
      <h2>Your Journey. <span style={{color:"yellow"}}>Our Commitment.</span></h2>
      <p>Real trust, global opportunities, and guidance at every step.</p>
    </Reveal>

    <div className="stats-grid">
      {[
        [5, '', 'Google Rating', 1, 'Rated by our clients'],
        [69, '+', 'Google Reviews', 0, 'Real client experiences'],
        [9, '+', 'Countries Covered', 0, 'Global opportunities'],
        [6, '', 'Guided Steps', 0, 'Your journey, simplified'],
      ].map(([n, s, l, d, caption], i) => (
        <Reveal style={{ border: '1px solid #FFFF',border: '1px solid #FFFF',
  textAlign: 'center',
  alignItems: 'center' }}  key={l} from={STAT_SIDES[i]} delay={i * 110} className={`stat-card stat-card-${i + 1}`} onMouseMove={statSpot}>
          <div className="stat-card-top">
            <span className="stat-icon">{STAT_ICONS[i]}</span>
           
          </div>

          <div className="stat-number">
           <span style={{ color: '#FFFF00' }}>
  <Count to={n} suffix={s} dec={d} />
</span>
            {i === 0 && <span  className="stat-star">/ 5</span>}
          </div>

          <h3></h3>
          <p>{caption}</p>

          {i === 0 && (
            <div className="mini-stars" aria-hidden="true">
            {[0, 1, 2, 3, 4].map(k => <b key={k} style={{ color: '#FFD700', animationDelay: `${k * 0.15}s` }}>★</b>)}
            </div>
          )}
          <div className="stat-accent" />
        </Reveal>
      ))}
    </div>

    <div className="stats-footer">
      <span className="stats-footer-line" />
    
<span style={{ color: "white", fontFamily: "Arial, sans-serif", fontWeight: 800, letterSpacing: "2px" }}>
  YOUR GLOBAL FUTURE STARTS HERE
</span>

      <span className="stats-footer-line" />
    </div>
  </div>
</section>

{/* ----------------------------------------  */}
 {/* <span
  className="stats-eyebrow"
  style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    padding: '8px 20px',
    background: 'linear-gradient(135deg, #ef2b3c 0%, #c4121f 100%)',
    border: '1.5px solid rgba(255,255,255,0.55)',
    borderRadius: 50,
    color: '#FFFF00',
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
    fontSize: 11.5,
    fontWeight: 800,
    letterSpacing: '2.4px',
    lineHeight: 1.4,
    boxShadow: '0 10px 26px rgba(243, 34, 52, 0.74), inset 0 1px 0 rgba(255,255,255,0.25)',
    WebkitFontSmoothing: 'antialiased',
    textRendering: 'optimizeLegibility',
  }}
>
  <span
    className="stats-eyebrow-dot"
    style={{
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: '#ffffff',
      color:''
    }}
  />
  TRUST THAT SPEAKS FOR ITSELF
</span> */}
{/* Choose Your Pathway section */}

 
<section className="sec">
  <div className="wrap">
    <Head
      tag="Choose Your Pathway"
      title="Where Do You Want Your Life To Go?"
    />

    <div className="paths">
      {[
        [Cap, 'Study Abroad', 'Admissions, SOP, funds proof and student visa for top universities.', '/study-in-canada'],
        [Briefcase, 'Work & Jobs', 'Work permits and job assistance across Canada, Europe, UK and Singapore.', '/canada-work-permit'],
        [Passport, 'Permanent Residency', 'Express Entry, PNP and Australia 189 / 190 / 491 with expert profile planning.', '/visa/pr/canada'],
        [Flight, 'Tourist & Visit', 'Schengen, USA, UK, Canada and Australia visitor visas with clean documentation.', '/schengen-tourist-visa']
      ].map(([A, t, d, h], i) => (
        <Reveal
          key={t}
          from={i % 2 ? 'right' : 'left'}
          delay={i * 90}
          as={Link}
          to={h}
          className="path"
          style={{
            background: '#ffffff',
            border: '1px solid #991b1b',
            borderRadius: 20,
            padding: '22px 22px 26px',
            boxShadow:
              '0 0 0 1px rgba(153,27,27,0.30), 0 0 12px rgba(185,28,28,0.28), 0 8px 22px rgba(127,16,16,0.30), 0 14px 30px rgba(80,0,0,0.16)',
            filter: 'none',
            backdropFilter: 'none',
            textDecoration: 'none',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          }}
        >
          <div
            className="path-art"
            style={{
              background: '#fff1f2',
              border: '1px solid #fecaca',
              borderRadius: 14,
              filter: 'none',
              boxShadow: 'none',
            }}
          >
            <A />
          </div>

          <h3
            style={{
              color: '#171717',
              fontWeight: 800,
              filter: 'none',
              textShadow: 'none',
            }}
          >
            {t}
          </h3>

          <p
            style={{
              color: '#333333',
              fontWeight: 500,
              lineHeight: 1.7,
              filter: 'none',
              textShadow: 'none',
            }}
          >
            {d}
          </p>

          <span
            style={{
              color: '#991b1b',
              fontWeight: 800,
              filter: 'none',
              textShadow: 'none',
            }}
          >
            Explore pathway →
          </span>
        </Reveal>
      ))}
    </div>
  </div>
</section>


      {/* Immigration Consultants Section  */}

<section className="sec alt">
  <div className="wrap">
    <Reveal from="up" key="immigration-heading">
      <Head
        tag="Immigration Consultants"
        title="Can Provide The Best Assistance!"
      />
    </Reveal>

    <Reveal
      from="up"
      delay={100}
      key="immigration-slider"
      style={{
        position: 'relative',
        width: '100%',
      }}
    >
      <Slider
        items={DEST}
        autoplay={2500}
        breakpoints={BP(1, 2, 3, 4, 5)}
        render={d => (
          <div
            style={{
              padding: '8px',
              height: '100%',
              boxSizing: 'border-box',
              overflow: 'visible',
            }}
          >
            <div
              className="dest"
              style={{
                overflow: 'hidden',
                border: '1px solid #991b1b',
                borderRadius: '14px',
                background: '#fff',
                boxShadow:
                  '0 0 0 1px rgba(153,27,27,0.30), 0 0 12px rgba(185,28,28,0.28), 0 8px 22px rgba(127,16,16,0.30), 0 14px 30px rgba(80,0,0,0.16)',
                height: '100%',
                boxSizing: 'border-box',
                position: 'relative',
                transition:
                  'transform 0.35s ease, box-shadow 0.35s ease',
              }}
            >
              <img
                src={img(d)}
                alt="Immigration destination"
                loading="lazy"
                style={{
                  display: 'block',
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  transition: 'transform 0.5s ease',
                }}
              />
            </div>
          </div>
        )}
      />
    </Reveal>
  </div>
</section>



{/*About section  */}

      

<section className="sec alt">
  <div
    className="wrap about"
    style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 0.85fr) minmax(0, 1.15fr)',
      alignItems: 'center',
      gap: 'clamp(28px, 5vw, 64px)',
    }}
  >
    <Reveal
      from="left"
      className="about-img"
      style={{
        width: '100%',
        maxWidth: '420px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          padding: '7px',
          border: '0.1px solid rgba(153,27,27,0.25)',
          borderRadius: '20px',
          background: '#ffffff',
          boxShadow:
            '0 0 8px rgba(185,28,28,0.16), 0 8px 24px rgba(127,16,16,0.22), 0 14px 32px rgba(80,0,0,0.14)',
          overflow: 'hidden',
        }}
      >
        <img
          src={img('assets/img/banner/about.jpeg')}
          alt="About Visa For Nation"
          loading="lazy"
          style={{
            display: 'block',
            width: '100%',
            height: '320px',
            objectFit: 'cover',
            objectPosition: 'center',
            borderRadius: '14px',
          }}
        />
      </div>
    </Reveal>

    <Reveal
      from="right"
      delay={120}
      style={{
        padding: '12px 0',
      }}
    >
      <span
        className="tag"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '8px 18px',
          marginBottom: '18px',
          background: 'linear-gradient(135deg, #ef2b3c 0%, #c4121f 100%)',
          border: '1px solid rgba(255,255,255,0.55)',
          borderRadius: 50,
          color: '#FFFF00',
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '2px',
          boxShadow: '0 5px 14px rgba(153,27,27,0.20)',
        }}
      >
        ABOUT US
      </span>

      <h2
        style={{
          color: '#171717',
          fontSize: 'clamp(28px, 3.2vw, 42px)',
          lineHeight: 1.2,
          fontWeight: 800,
          letterSpacing: '-0.8px',
          marginBottom: '20px',
          textShadow: 'none',
        }}
      >
        Best Immigration Consultant
        <span style={{ color: '#991b1b' }}> in Delhi</span>
      </h2>

      <div
        style={{
          width: '64px',
          height: '4px',
          borderRadius: '4px',
          background: 'linear-gradient(90deg, #991b1b, #ef2b3c)',
          marginBottom: '22px',
        }}
      />

      <p
        style={{
          color: '#404040',
          fontSize: '15.5px',
          lineHeight: 1.9,
          fontWeight: 400,
          marginBottom: '26px',
          maxWidth: '650px',
        }}
      >
        Finding the best immigration consultant in Delhi can be the single most
        important decision in your journey to live, work, or study abroad.
        With embassies tightening scrutiny and eligibility criteria changing
        every few months, a small documentation error or an outdated strategy
        can turn a strong profile into a rejected file. That is where Visa For
        Nation comes in.
      </p>

      <Link
        to="/about"
        className="btn btn-red"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: '13px 24px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #ef2b3c 0%, #991b1b 100%)',
          color: '#ffffff',
          fontWeight: 800,
          textDecoration: 'none',
          boxShadow: '0 7px 18px rgba(153,27,27,0.24)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        Learn More <span aria-hidden="true">→</span>
      </Link>
    </Reveal>
  </div>
</section>

{/* Immigration & Visa Services  */}

  
<section className="sec">
  <div className="wrap">
    <Head
      tag="Immigration & Visa Services"
      title="For Following Countries"
    />

    <Slider
      items={COUNTRIES}
      breakpoints={BP(1.2, 2, 4, 5, 6)}
      render={c => (
        <Link
          to={c.h}
          className="ccard"
          style={{
            display: 'block',
            padding: '8px',
            margin: '8px',
            overflow: 'hidden',
            background: '#ffffff',
            border: '1px solid rgba(153,27,27,0.35)',
            borderRadius: '16px',
            boxShadow:
              '0 0 0 1px rgba(153,27,27,0.08), 0 6px 18px rgba(153,27,27,0.12), 0 12px 26px rgba(80,0,0,0.10)',
            textDecoration: 'none',
            textAlign: 'center',
            transition:
              'transform 0.35s ease, box-shadow 0.35s ease',
          }}
        >
          <div
            style={{
              overflow: 'hidden',
              borderRadius: '11px',
              position: 'relative',
              background: '#fff1f2',
            }}
          >
            <img
              src={img(c.img)}
              alt={c.n}
              loading="lazy"
              style={{
                display: 'block',
                width: '100%',
                height: '155px',
                objectFit: 'cover',
                objectPosition: 'center',
                transition: 'transform 0.45s ease',
              }}
            />
          </div>

          <h3
            style={{
              color: '#171717',
              fontSize: '17px',
              fontWeight: 800,
              margin: '16px 0 13px',
              lineHeight: 1.4,
            }}
          >
            {c.n}
          </h3>

          <span
            className="pill"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '9px 20px',
              borderRadius: 50,
              background:
                'linear-gradient(135deg, #ef2b3c 0%, #c4121f 100%)',
              border: '1px solid rgba(255,255,255,0.55)',
              color: '#FFFF00',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.4px',
              boxShadow: '0 4px 12px rgba(153,27,27,0.22)',
            }}
          >
            Apply Now <span style={{ marginLeft: '6px' }}>→</span>
          </span>
        </Link>
      )}
    />
  </div>
</section>
 {/* why choose us Section  */}


<section
  className="sec alt"
  style={{
    position: 'relative',
    overflow: 'hidden',
    background:
      'linear-gradient(135deg, #fffafa 0%, #ffffff 55%, #fff4f4 100%)',
    padding: 'clamp(55px, 7vw, 90px) 0',
  }}
>
  <div
    className="wrap why"
    style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
      alignItems: 'center',
      gap: 'clamp(30px, 6vw, 75px)',
    }}
  >
    <Reveal
      from="left"
      className="why-globe"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '340px',
        padding: '25px',
        borderRadius: '28px',
        background:
          'radial-gradient(circle at center, rgba(239,43,60,0.12) 0%, rgba(255,241,242,0.65) 42%, rgba(255,255,255,0.2) 75%)',
        border: '1px solid rgba(153,27,27,0.12)',
        boxShadow:
          '0 12px 35px rgba(127,16,16,0.08), inset 0 0 25px rgba(239,43,60,0.04)',
      }}
    >
      <div
        style={{
          width: 'min(100%, 320px)',
          aspectRatio: '1 / 1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, #ffffff 35%, #fff1f2 72%, rgba(239,43,60,0.12) 100%)',
          border: '1px solid rgba(185,28,28,0.16)',
          boxShadow:
            '0 0 0 10px rgba(239,43,60,0.035), 0 15px 35px rgba(127,16,16,0.12)',
          color: '#991b1b',
        }}
      >
        <div
          style={{
            width: '82%',
            height: '82%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Globe />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '22px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '9px 16px',
          borderRadius: '50px',
          background: '#ffffff',
          border: '1px solid rgba(153,27,27,0.15)',
          color: '#991b1b',
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '1.2px',
          whiteSpace: 'nowrap',
          boxShadow: '0 5px 16px rgba(127,16,16,0.10)',
        }}
      >
        YOUR GLOBAL JOURNEY
      </div>
    </Reveal>

    <Reveal
      from="right"
      delay={120}
      style={{ padding: '10px 0' }}
    >
      <span
        className="tag"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '9px 18px',
          marginBottom: '20px',
          background:
            'linear-gradient(135deg, #ef2b3c 0%, #c4121f 100%)',
          border: '1px solid rgba(255,255,255,0.55)',
          borderRadius: 50,
          color: '#FFFF00',
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '1.8px',
          boxShadow: '0 5px 14px rgba(153,27,27,0.18)',
        }}
      >
        WHY CHOOSE US
      </span>

      <h2
        style={{
          color: '#171717',
          fontSize: 'clamp(28px, 3.3vw, 43px)',
          lineHeight: 1.2,
          fontWeight: 850,
          letterSpacing: '-1px',
          margin: '0 0 18px',
          textShadow: 'none',
        }}
      >
        Your Pathway Abroad,
        <span style={{ color: '#b91c1c' }}> Made Simpler</span>
      </h2>

      <div
        style={{
          width: '65px',
          height: '4px',
          borderRadius: '5px',
          background: 'linear-gradient(90deg, #991b1b, #ef2b3c)',
          marginBottom: '20px',
        }}
      />

      <p
        style={{
          color: '#525252',
          fontSize: '15px',
          lineHeight: 1.9,
          margin: '0 0 28px',
          fontWeight: 400,
        }}
      >
        Experience reliable guidance at every step of your immigration
        journey — secure opportunities, unlock a brighter future, and
        achieve your global goals with confidence.
      </p>

      <div style={{ display: 'grid', gap: '13px' }}>
        {WHY.map(([t, d], i) => (
          <div
            className="why-item"
            key={t}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '15px',
              padding: '17px 18px',
              background: '#ffffff',
              border: '1px solid rgba(153,27,27,0.13)',
              borderRadius: '15px',
              boxShadow: '0 5px 16px rgba(80,0,0,0.045)',
              transition:
                'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
            }}
          >
            <b
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background:
                  'linear-gradient(135deg, #991b1b 0%, #650b0b 100%)',
                color: '#FFFF00',
                fontSize: '13px',
                fontWeight: 800,
                border: '1px solid rgba(153,27,27,0.35)',
                boxShadow: '0 5px 12px rgba(80,0,0,0.22)',
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </b>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h3
                style={{
                  color: '#202020',
                  fontSize: '16px',
                  lineHeight: 1.4,
                  fontWeight: 800,
                  margin: '1px 0 6px',
                }}
              >
                {t}
              </h3>

              <p
                style={{
                  color: '#666666',
                  fontSize: '13.5px',
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                {d}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  </div>
</section>

{/* ------------------------------------  */}

{/* Study Visa  */}

<section
  className="sec study"
  style={{
    position: 'relative',
    overflow: 'hidden',
    background:
      'radial-gradient(ellipse at 50% 0%, #3b1015 0%, #21090c 48%, #160608 100%)',
    padding: '38px 0 42px',
  }}
>
  <div
    className="wrap"
    style={{
      maxWidth: '1240px',
      margin: '0 auto',
      paddingLeft: '16px',
      paddingRight: '16px',
    }}
  >
    <div style={{ marginBottom: '12px' }}>
      <Head
        light
        tag="Study Visa"
        title="Choose Your Dream Destination"
      />
    </div>
  </div>

  <div
    className="marquee"
    style={{
      margin: '12px 0 20px',
      overflow: 'hidden',
      borderTop: '1px solid rgba(255,255,255,0.09)',
      borderBottom: '1px solid rgba(255,255,255,0.09)',
      background: 'rgba(255,255,255,0.025)',
    }}
  >
    <div>
      {[...STUDY, ...STUDY].map((s, i) => (
        <span
          key={i}
          style={{
            color: '#f5d6a0',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.3px',
            lineHeight: 1.3,
            margin: '0 10px',
          }}
        >
          <span style={{ color: '#ef4444', marginRight: '5px' }}>★</span>
          {s.n}
        </span>
      ))}
    </div>
  </div>

  <div
    className="wrap"
    style={{
      maxWidth: '1240px',
      margin: '0 auto',
      paddingLeft: '12px',
      paddingRight: '12px',
    }}
  >
    <Slider
      items={STUDY}
      autoplay={2000}
      breakpoints={BP(1.4, 2, 3, 4, 4)}
      render={s => (
        <Link
          to={s.h}
          className="scard"
          style={{
            display: 'block',
            margin: '5px',
            overflow: 'hidden',
            position: 'relative',
            background: '#ffffff',
            border: '1px solid rgba(255,255,255,0.13)',
            borderRadius: '12px',
            boxShadow:
              '0 5px 15px rgba(0,0,0,0.18), 0 0 12px rgba(153,27,27,0.10)',
            textDecoration: 'none',
            transition:
              'transform 0.3s ease, box-shadow 0.3s ease',
          }}
        >
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: '#3b1015',
            }}
          >
            <img
              src={img(s.img)}
              alt={s.n}
              loading="lazy"
              style={{
                display: 'block',
                width: '100%',
                height: '145px',
                objectFit: 'cover',
                objectPosition: 'center',
                transition: 'transform 0.4s ease',
              }}
            />

            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, transparent 55%, rgba(15,3,5,0.45) 100%)',
                pointerEvents: 'none',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '7px',
              padding: '10px 10px 11px',
            }}
          >
            <h3
              style={{
                color: '#242020',
                fontSize: '13px',
                lineHeight: 1.3,
                fontWeight: 750,
                margin: 0,
                minWidth: 0,
              }}
            >
              {s.n}
            </h3>

            <span
              className="pill-r"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                gap: '4px',
                padding: '6px 10px',
                borderRadius: '6px',
                background:
                  'linear-gradient(135deg, #ef2b3c 0%, #991b1b 100%)',
                color: '#FFFF00',
                border: '1px solid rgba(255,255,255,0.25)',
                fontSize: '10px',
                fontWeight: 750,
                lineHeight: 1.2,
                boxShadow: '0 3px 8px rgba(153,27,27,0.18)',
                whiteSpace: 'nowrap',
              }}
            >
              Explore <span aria-hidden="true">→</span>
            </span>
          </div>
        </Link>
      )}
    />
  </div>
</section>

{/* Journey in 6 Steps  */}

      <section className="sec proc"><div className="wrap">
        <Head light tag="How It Works" title="Your Journey In 6 Simple Steps" />
        <div className="steps">{['Free Eligibility Assessment', 'Profile Evaluation', 'Documentation', 'Application Submission', 'Updates & Support', 'Post-Visa Guidance'].map((t, i) => (
          <Reveal key={t} from={i % 2 ? 'right' : 'left'} delay={i * 80} className="step"><b>{i + 1}</b><h3>{t}</h3></Reveal>))}</div>
      </div>
      </section>
{/* ----------------------------------------------  */}

 {/* Instagram Section  */}

     {/* Instagram Section */}
<section
  className="sec"
  style={{
    position: 'relative',
    overflow: 'hidden',
    padding: '40px 0 44px',
    background:
      'radial-gradient(circle at 12% 0%, rgba(225,29,46,0.22) 0%, transparent 42%), radial-gradient(circle at 92% 100%, rgba(225,29,46,0.16) 0%, transparent 40%), #0a0a0b',
  }}
 >
  {/* dotted grid texture */}
  <div
    aria-hidden="true"
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      backgroundImage:
        'radial-gradient(circle, rgba(255,255,255,0.14) 1px, transparent 1.4px)',
      backgroundSize: '26px 26px',
      WebkitMaskImage:
        'radial-gradient(ellipse at 50% 40%, #000 15%, transparent 72%)',
      maskImage:
        'radial-gradient(ellipse at 50% 40%, #000 15%, transparent 72%)',
    }}
  />

  <div
    className="wrap"
    style={{
      position: 'relative',
      maxWidth: '1180px',
      margin: '0 auto',
      padding: '0 16px',
      boxSizing: 'border-box',
    }}
  >
    <div style={{ marginBottom: '20px' }}>
      <Head light tag="Instagram" title="Reels Of The Week" />
    </div>

    <Slider
      items={IG}
      autoplay={0}
      breakpoints={BP(1.4, 2.4, 4, 5, 5)}
      render={id => (
        <a
          className="ig ig-card"
          href={`https://www.instagram.com/${id}/`}
          target="_blank"
          rel="noreferrer"
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            aspectRatio: 'auto',
            maxHeight: 'none',
            minHeight: '200px',
            margin: '5px',
            padding: '22px 12px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            textAlign: 'center',
            textDecoration: 'none',
            color: '#ffffff',
            border: '1.5px solid transparent',
            borderRadius: '16px',
            background:
              'linear-gradient(160deg, #17090b, #0d0708) padding-box, linear-gradient(145deg, rgba(255,255,255,0.6), rgba(255,255,255,0.12) 45%, rgba(225,29,46,0.9)) border-box',
            boxShadow: '0 12px 28px rgba(0,0,0,0.5)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#ffffff',
              color: '#e11d2e',
              fontSize: '20px',
              paddingLeft: '4px',
              boxSizing: 'border-box',
              boxShadow: '0 0 0 6px rgba(225,29,46,0.28)',
            }}
          >
            ▶
          </span>

          <b
            style={{
              fontSize: '14px',
              fontWeight: 700,
              lineHeight: 1.35,
              color: '#ffffff',
            }}
          >
            Watch on Instagram
          </b>

          <small
            style={{
              display: 'inline-block',
              color: 'rgba(255,255,255,0.72)',
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: 1.3,
            }}
          >
            @visa_for_nation
          </small>

          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '10px',
              right: '13px',
              color: '#ffffff',
              fontSize: '17px',
              opacity: 0.85,
            }}
          >
            ↗
          </span>
        </a>
      )}
    />

    {/* follow button */}
    <div style={{ textAlign: 'center', marginTop: '6px' }}>
      <a
        href="https://www.instagram.com/visa_for_nation/"
        target="_blank"
        rel="noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '11px 24px',
          borderRadius: '50px',
          background: 'linear-gradient(135deg, #ef2b3c 0%, #c4121f 100%)',
          border: '1.5px solid rgba(255,255,255,0.55)',
          color: '#ffffff',
          fontSize: '13px',
          fontWeight: 800,
          letterSpacing: '0.4px',
          textDecoration: 'none',
          boxShadow: '0 8px 22px rgba(225,29,46,0.4)',
        }}
      >
        Follow @visa_for_nation <span aria-hidden="true">→</span>
      </a>
    </div>
  </div>

  <style>{`
    .ig-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 22px 42px rgba(0,0,0,0.6), 0 0 26px rgba(225,29,46,0.35) !important;
    }
  `}</style>
</section>

 {/* -------------------------------------------------  */}

 {/* Testimonial Section  */}

<section
  className="sec alt"
  style={{
    background: '#ffffff',
    padding: '22px 0 24px',
    overflow: 'hidden',
  }}
>
  <div
    className="wrap"
    style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 12px',
      boxSizing: 'border-box',
    }}
  >
    <Reveal from="bottom" delay={0}>
      <div style={{ marginBottom: '12px' }}>
        <Head
          tag="Success Stories"
          title="Client Testimonials"
        />
      </div>
    </Reveal>

    <Reveal from="bottom" delay={100}>
      <div
        style={{
          padding: '2px 0',
          borderRadius: '10px',
        }}
      >
        <Slider
          items={YT}
          autoplay={0}
          breakpoints={BP(1.5, 2.4, 4, 5, 5)}
          render={id => (
            <div
              style={{
                margin: '4px',
                padding: '5px',
                background: '#ffffff',
                border: '1px solid rgba(153,27,27,0.13)',
                borderRadius: '10px',
                boxShadow:
                  '0 4px 14px rgba(100,15,25,0.09), 0 1px 4px rgba(0,0,0,0.04)',
                overflow: 'hidden',
                transition:
                  'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
              }}
            >
              <YouTube id={id} />
            </div>
          )}
        />
      </div>
    </Reveal>
  </div>

  <style>{`
    @media (prefers-reduced-motion: no-preference) {
      .alt .wrap > * {
        animation: testimonialEnter 0.55s ease-out both;
      }

      @keyframes testimonialEnter {
        from {
          opacity: 0;
          transform: translateY(12px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    }

    @media (max-width: 600px) {
      .alt.sec {
        padding: 18px 0 20px !important;
      }

      .alt.sec .wrap {
        padding-left: 8px !important;
        padding-right: 8px !important;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .alt .wrap > * {
        animation: none !important;
      }
    }
  `}</style>
</section>


{/* ------------------------------  */}


<section className="sec" style={{ background: '#f3f4f6' }}>
  <div className="wrap">
    <Head tag="Google Reviews" title="Hear From Our Happy Clients" />
    <div className="reviews">
      <Reveal from="left" className="biz"><h3>Visa For Nation — Best Immigration Consultants In Delhi, India</h3>
        <div className="rate"><b>5.0</b><span>★★★★★</span><a href="https://www.google.com/maps/place/Visa+For+Nation+-+Best+Immigration+Consultants+In+Delhi" target="_blank" rel="noreferrer">Google reviews</a>(69)</div>
        <p>Immigration &amp; visa consultant · Greater Kailash, New Delhi</p>
        <div className="biz-btns"><a className="btn btn-red" href="https://www.visafornation.com">Website</a><a className="btn btn-line" href="https://www.google.com/maps/dir/?api=1&destination=Visa+For+Nation+Greater+Kailash+New+Delhi" target="_blank" rel="noreferrer">Directions</a></div></Reveal>
      <Reveal from="right" className="ticker"><div>{[...REVIEWS, ...REVIEWS].map(([n, t, x], i) => (
        <article key={i}><span className="av">{n[0]}</span><div><h4>{n} <small>{t}</small></h4><span className="stars">★★★★★</span><p>{x}</p></div></article>))}</div></Reveal>
    </div>
  </div>
</section>

{/* ------------------------------------------  */}
{/* As Seen In Section  */}

  
<section
  className="sec media-mentions"
  style={{
    background: '#ffffff',
    padding: '24px 0 28px',
    overflow: 'hidden',
  }}
 >
  <div
    className="wrap"
    style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 12px',
      boxSizing: 'border-box',
    }}
  >
    <Reveal from="bottom" delay={0}>
      <div style={{ marginBottom: '12px' }}>
        <Head
          tag="As Seen In"
          title="Our Media Mentions"
        />
      </div>
    </Reveal>

    <Slider
      items={MEDIA}
      breakpoints={BP(2, 3, 4, 4, 4)}
      render={m => (
        <Reveal from="bottom" delay={80}>
          <a
            className="logo-card"
            href={m.h || undefined}
            target={m.h ? '_blank' : undefined}
            rel="nofollow noopener noreferrer"
            aria-label={m.n}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '88px',
              margin: '4px',
              padding: '14px',
              boxSizing: 'border-box',
              background: '#ffffff',
              border: '1px solid #eeeeee',
              borderRadius: '9px',
              boxShadow: '0 3px 12px rgba(20,20,20,0.055)',
              textDecoration: 'none',
              overflow: 'hidden',
              transition:
                'transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease',
            }}
          >
            <img
              src={img(m.img)}
              alt={m.n}
              loading="lazy"
              style={{
                display: 'block',
                width: '100%',
                maxWidth: '150px',
                height: '46px',
                objectFit: 'contain',
                objectPosition: 'center',
                filter: 'grayscale(100%)',
                opacity: 0.78,
                transition:
                  'filter 0.28s ease, opacity 0.28s ease, transform 0.28s ease',
              }}
            />
          </a>
        </Reveal>
      )}
    />
  </div>

  <style>{`
    .media-mentions .logo-card:hover {
      transform: translateY(-3px);
      border-color: rgba(153, 27, 27, 0.28) !important;
      box-shadow: 0 8px 20px rgba(100, 15, 25, 0.11) !important;
    }

    .media-mentions .logo-card:hover img {
      filter: grayscale(0%);
      opacity: 1;
      transform: scale(1.04);
    }

    @media (max-width: 600px) {
      .media-mentions.sec {
        padding: 18px 0 20px !important;
      }

      .media-mentions .wrap {
        padding-left: 8px !important;
        padding-right: 8px !important;
      }

      .media-mentions .logo-card {
        height: 76px !important;
        padding: 10px !important;
        margin: 3px !important;
      }

      .media-mentions .logo-card img {
        height: 40px !important;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .media-mentions .logo-card,
      .media-mentions .logo-card img {
        transition: none !important;
      }
    }
  `}</style>
</section>

{/* FAQ / SEO Content */}


{/* FAQ / SEO Content */}
<section className="sec">
  <div className="wrap seo">
    <p>{SEO_INTRO}</p>

    {more && (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '24px',
          width: '100%',
          alignItems: 'start',
        }}
      >
        {SEO_MORE.map(([h, p]) => (
          <div
            key={h}
            style={{
              minWidth: 0,
              padding: '16px',
              border: '1px solid #eee',
              borderRadius: '10px',
              background: '#fff',
              boxSizing: 'border-box',
            }}
          >
            <h3>{h}</h3>
            <p>{p}</p>
          </div>
        ))}
      </div>
    )}

    <button
      className="btn btn-line center"
      onClick={() => setMore(!more)}
    >
      {more ? 'Show less ▲' : 'Show more ▼'}
    </button>
  </div>

  <style>{`
    @media (max-width: 650px) {
      .wrap.seo > div[style*="grid-template-columns"] {
        grid-template-columns: 1fr !important;
      }
    }
  `}</style>
</section>

<section className="sec alt">
  <div className="wrap">
    <Head tag="Frequently Asked Question" title="Got Questions?" />

    <div className="faq-cols">
      {[FAQS.slice(0, half), FAQS.slice(half)].map((col, c) => (
        <div className="faq-col" key={c}>
          {col.map(([q, a], j) => {
            const i = c * half + j;
            return (
              <div key={q} className={`faq ${faq === i ? 'open' : ''}`}>
                <button onClick={() => setFaq(faq === i ? -1 : i)}>
                  <h3>{q}</h3>
                  <i />
                </button>
                <div><p>{a}</p></div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  </div>
</section>


     
      <section className="cta"><div className="wrap cta-in"><Reveal from="left"><h2>Ready to start your visa journey?</h2><p>Book a free eligibility assessment with our Delhi-based experts.</p></Reveal>
        <Reveal from="right" className="cta-btns"><Link to="/contact-us" className="btn btn-white">Book Free Consultation</Link><a className="btn btn-ghost" href="https://wa.me/917677666677" target="_blank" rel="noreferrer">WhatsApp Us</a></Reveal></div>
        </section>
    </>
  );
}