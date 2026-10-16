import { img } from '../api.js';
import { useEffect, useRef, useState } from 'react';
// Click-to-load video (no heavy iframes on page load) + animated counter
export function YouTube({ id }) {
  const [on, setOn] = useState(false);
  return <div className="vid">{on ? <iframe allow="autoplay;encrypted-media" allowFullScreen title={id} src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`} />
    : <button onClick={() => setOn(true)} aria-label="Play"><img loading="lazy" src={img(`youtube/${id}.jpg`)} alt="" /><span>â–¶</span></button>}</div>;
}
export function Count({ to, suffix = '', dec = 0 }) {
  const ref = useRef(); const [n, setN] = useState(0);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect(); const t0 = performance.now();
      const tick = t => { const p = Math.min((t - t0) / 1400, 1); setN(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick);
    }); io.observe(ref.current); return () => io.disconnect();
  }, [to]);
  return <b ref={ref}>{n.toFixed(dec)}{suffix}</b>;
}
