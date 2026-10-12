import { useEffect, useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { api, img, adminImg } from '../api.js';
import EnquiryForm from '../components/EnquiryForm.jsx';
import Loader from '../components/Loader.jsx';
import { artFor } from '../components/Art.jsx';
import Reveal from '../components/Reveal.jsx';

const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';

export default function DynamicPage() {
  const { pathname } = useLocation();
  const [page, setPage] = useState(null);
  const [err, setErr] = useState(false);
  const [open, setOpen] = useState(-1);
  useEffect(() => {
    setPage(null); setErr(false);
    api(`/pages?url=${encodeURIComponent(pathname)}`).then(p => { setPage(p); document.title = p.metaTitle || p.heroTitle; }).catch(() => setErr(true));
  }, [pathname]);

  // Auto Table of Contents from every <h2>
  const { html, toc } = useMemo(() => {
    const toc = [], seen = new Set();
    const html = (page?.content || '').replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (_, a, t) => {
      const text = t.replace(/<[^>]+>/g, '').trim(); if (!text) return _;
      let id = slugify(text), n = 2; while (seen.has(id)) id = `${slugify(text)}-${n++}`;
      seen.add(id); toc.push({ id, text }); return `<h2${a} id="${id}">${t}</h2>`;
    }).replace(/<table/g, '<div class="table-wrap"><table').replace(/<\/table>/g, '</table></div>');
    return { html, toc };
  }, [page]);

  if (err) return <div className="notfound"><h1>404</h1><p>This page doesn't exist or isn't published yet.</p><Link className="btn btn-red" to="/">Return home</Link></div>;
  if (!page) return <Loader />;
  const Art = artFor(page.fullUrl);
  const words = page.heroTitle.trim().split(/\s+/), last = words.pop();
  return (
    <>
      <section className="page-hero" style={page.bannerImage ? { backgroundImage: `linear-gradient(135deg,rgba(20,8,10,.93),rgba(60,10,16,.72)),url(${adminImg(page.bannerImage)})` } : null}>
        <div className="wrap ph-grid"><div className="ph-text">
          {page.heroBadge && <span className="badge">{page.heroBadge}</span>}
          <h1>{words.join(' ')} <em>{last}</em></h1><p>{page.heroDesc}</p></div><div className="ph-art"><Art /></div></div>
      </section>
      <div className="wrap page-grid">
        <Reveal as="article" from="left" className="content-wrap">
          {toc.length > 0 && <div className="toc"><h4>Table of Contents</h4>{toc.map((t, i) => <a key={t.id} href={`#${t.id}`}><b>{String(i + 1).padStart(2, '0')}</b>{t.text}</a>)}</div>}
          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
        </Reveal>
        <div className="side"><Reveal from="right"><EnquiryForm /></Reveal></div>
      </div>
      {page.faqs?.length > 0 && (
        <section className="wrap narrow faq-block"><Reveal><h2 className="center-h">Frequently Asked Questions</h2></Reveal>
          {page.faqs.map((f, i) => <div key={i} className={`faq ${open === i ? 'open' : ''}`}><button onClick={() => setOpen(open === i ? -1 : i)}><h3>{f.q}</h3><i /></button><div><p>{f.a}</p></div></div>)}
        </section>
      )}
    </>
  );
}
