import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { api } from '../api.js';
import { getFallbackPage, mergePageWithFallback } from '../data/pagesData.js';
import { countryFlagForPage, heroBackgroundForPage } from '../data/heroTheme.js';
import EnquiryForm from '../components/EnquiryForm.jsx';
import SEOHead from '../components/SEOHead.jsx';
import Loader from '../components/Loader.jsx';
import Reveal from '../components/Reveal.jsx';
import './VisaPage.css';

const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';

export default function VisaPage() {
  const { pathname } = useLocation();
  const initialFallback = useMemo(() => getFallbackPage(pathname), [pathname]);

  const [page, setPage] = useState(initialFallback);
  const [err, setErr] = useState(false);
  const [open, setOpen] = useState(-1);
  const heroRef = useRef(null);
  const sideRef = useRef(null);
  const [formPinned, setFormPinned] = useState(false);

  useEffect(() => {
    const updateOverlap = () => {
      const hero = heroRef.current;
      const side = sideRef.current;
      if (!hero || !side) return;
      const heroRect = hero.getBoundingClientRect();
      const sideRect = side.getBoundingClientRect();
      const currentMargin = Number.parseFloat(window.getComputedStyle(side).marginTop) || 0;
      const desiredTop = heroRect.top + heroRect.height / 2;
      side.style.marginTop = `${currentMargin + desiredTop - sideRect.top}px`;
    };
    updateOverlap();
    const observer = typeof ResizeObserver !== 'undefined' && heroRef.current
      ? new ResizeObserver(updateOverlap)
      : null;
    if (observer && heroRef.current) observer.observe(heroRef.current);
    window.addEventListener('resize', updateOverlap);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateOverlap);
    };
  }, []);

  useEffect(() => {
    const updateFormPosition = () => {
      const naturalTop = sideRef.current?.getBoundingClientRect().top;
      const shouldPin = window.innerWidth >= 1101 && window.scrollY > 0 && Number.isFinite(naturalTop) && naturalTop <= 182;
      setFormPinned(current => current === shouldPin ? current : shouldPin);
    };
    updateFormPosition();
    window.addEventListener('scroll', updateFormPosition, { passive: true });
    window.addEventListener('resize', updateFormPosition);
    return () => {
      window.removeEventListener('scroll', updateFormPosition);
      window.removeEventListener('resize', updateFormPosition);
    };
  }, []);

  useEffect(() => {
    // 1. Instantly use bundled fallback data if available so no waiting or 404
    const fb = getFallbackPage(pathname);
    if (fb) {
      setPage(fb);
      setErr(false);
    } else {
      setPage(null);
    }

    // 2. Fetch live data from backend (CMS updates)
    let isCurrent = true;
    api(`/pages?url=${encodeURIComponent(pathname)}`)
      .then(p => {
        if (!isCurrent) return;
        if (p) {
          setPage(mergePageWithFallback(fb, p));
          setErr(false);
        }
      })
      .catch(() => {
        if (!isCurrent) return;
        // If backend failed but we have fallback, keep fallback!
        if (!fb) {
          setErr(true);
        }
      });

    return () => { isCurrent = false; };
  }, [pathname]);

  const { html, toc } = useMemo(() => {
    const toc = [], seen = new Set();
    const html = (page?.content || '').replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (_, a, t) => {
      const text = t.replace(/<[^>]+>/g, '').trim(); if (!text) return _;
      let id = slugify(text), n = 2; while (seen.has(id)) id = `${slugify(text)}-${n++}`;
      seen.add(id); toc.push({ id, text }); return `<h2${a} id="${id}">${t}</h2>`;
    }).replace(/<table/g, '<div class="table-wrap"><table').replace(/<\/table>/g, '</table></div>');
    return { html, toc };
  }, [page]);

  if (err && !page) return (
    <main className="vp">
      <section className="vp-sec">
        <div className="vp-wrap">
          <Reveal from="up">
            <div className="vp-notfound" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <h1 style={{ fontSize: '72px', color: '#B51226', margin: '0 0 16px 0' }}>404</h1>
              <p style={{ fontSize: '18px', color: '#64748B', marginBottom: '24px' }}>This page doesn't exist or isn't published yet.</p>
              <Link className="vp-btn red btn btn-red" to="/">Return home</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );

  if (!page) return (
    <main className="vp">
      <section className="vp-sec">
        <div className="vp-wrap"><Loader splash /></div>
      </section>
    </main>
  );

  const words = (page.heroTitle || 'Visa Information').trim().split(/\s+/);
  const last = words.pop();

  return (
    <main className="vp">
      <SEOHead
        title={page.metaTitle || page.heroTitle}
        description={page.metaDescription || page.heroDesc}
      />

      {/* ============ Hero ============ */}
      <section
        ref={heroRef}
        className="vp-sec vp-hero color-hero"
        style={heroBackgroundForPage(page)}
      >
        <div className="vp-wrap vp-hero-grid">
          <Reveal from="left">
            <div className="vp-hero-text">
              {page.heroBadge && <span className="vp-eyebrow">{countryFlagForPage(page) && <span className={`vp-country-flag${page.heroBadge.toLowerCase().includes('canada') ? ' vp-country-code' : ''}`} aria-hidden="true">{page.heroBadge.toLowerCase().includes('canada') ? 'CA' : countryFlagForPage(page)}</span>}{page.heroBadge}</span>}
              <h2 className="vp-h2">{words.join(' ')} <em>{last}</em></h2>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ Content + Sidebar ============ */}
      <section className="vp-sec">
        <div className="vp-wrap vp-grid">
          <Reveal from="left" className="vp-content">
            {toc.length > 0 && (
              <div className="vp-toc">
                <h4>Table of Contents</h4>
                {toc.map((t, i) => (
                  <a key={t.id} href={`#${t.id}`}><b>{String(i + 1).padStart(2, '0')}</b>{t.text}</a>
                ))}
              </div>
            )}
            <div className="vp-prose" dangerouslySetInnerHTML={{ __html: html }} />
          </Reveal>

          <div ref={sideRef} className="vp-side">
            <div className={`vp-side-form${formPinned ? ' is-pinned' : ''}`}>
              <EnquiryForm
                variant="card"
                category={page.category}
                country={page.country}
                visaType={page.heroTitle}
                title="Check Eligibility"
                sub="Get a free consultation from our experts"
                submitLabel="Get Free Expert Call"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      {page.faqs?.length > 0 && (
        <section className="vp-sec vp-faq">
          <div className="vp-wrap">
            <Reveal from="up">
              <div className="vp-head">
                <span className="vp-eyebrow">FAQ</span>
                <h2 className="vp-h2">Frequently Asked <em>Questions</em></h2>
              </div>
            </Reveal>
            {page.faqs.map((f, i) => (
              <Reveal key={i} from="up" delay={i * 60}>
                <div className={`vp-faq-item${open === i ? ' open' : ''}`}>
                  <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                    <h3>{f.q}</h3>
                    <i />
                  </button>
                  <div className="vp-faq-body"><p>{f.a}</p></div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
