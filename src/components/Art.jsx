// Animated, professional SVG illustrations (original artwork). Colours come from CSS: --ink, --red, #fff
const W = { fill: '#fff', stroke: 'var(--ink)', strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' };
const R = { fill: 'var(--red)', stroke: 'var(--ink)', strokeWidth: 3, strokeLinejoin: 'round' };
const K = { fill: 'var(--ink)', stroke: 'var(--ink)', strokeWidth: 3, strokeLinejoin: 'round' };
const Plane = ({ s = 1 }) => <path d="M0 0 L-16 -9 L-11 0 L-16 9 Z" fill="var(--red)" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" transform={`scale(${s})`} />;

export function Globe() {
  const orbit = 'M 8 160 a 152 52 0 1 0 304 0 a 152 52 0 1 0 -304 0';
  return (
    <svg viewBox="0 0 320 320" className="art" role="img" aria-label="Animated globe">
      <defs><clipPath id="gc"><circle cx="160" cy="160" r="92" /></clipPath></defs>
      <g transform="rotate(-24 160 160)"><path d={orbit} fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeDasharray="3 8" opacity=".5" /></g>
      <circle cx="160" cy="160" r="92" {...W} />
      <g clipPath="url(#gc)">
        <g className="drift"><path d="M70 120c20-20 45-14 60 4s-4 34-22 40-30 24-42 8 -10-36 4-52zM180 90c24-14 50 0 56 22s-14 30-6 52-30 24-46 4-20-34-12-50 -2-20 8-28zM205 210c18-6 36 4 34 22s-24 20-38 10-12-26 4-32z" fill="var(--red)" opacity=".92" /></g>
        <ellipse className="mer" cx="160" cy="160" rx="92" ry="92" fill="none" stroke="var(--ink)" strokeWidth="1.5" opacity=".35" />
        <ellipse className="mer m2" cx="160" cy="160" rx="92" ry="92" fill="none" stroke="var(--ink)" strokeWidth="1.5" opacity=".35" />
        <path d="M68 160H252M80 118H240M80 202H240" stroke="var(--ink)" strokeWidth="1.4" opacity=".3" fill="none" />
      </g>
      <circle cx="160" cy="160" r="92" fill="none" stroke="var(--ink)" strokeWidth="3" />
      <g className="pin" transform="translate(118 112)"><circle r="6" fill="var(--ink)" /><circle className="ping" r="6" fill="none" stroke="var(--red)" strokeWidth="2" /></g>
      <g className="pin p2" transform="translate(212 186)"><circle r="6" fill="var(--ink)" /><circle className="ping" r="6" fill="none" stroke="var(--red)" strokeWidth="2" /></g>
      <g transform="rotate(-24 160 160)"><g><Plane s={2.3} /><animateMotion dur="7s" repeatCount="indefinite" rotate="auto" path={orbit} /></g></g>
    </svg>
  );
}

export function Cap() {
  return (
    <svg viewBox="0 0 400 300" className="art" role="img" aria-label="Study abroad">
      <g className="float"><path d="M200 50 L338 105 L200 160 L62 105 Z" {...K} /><path d="M118 135v46c0 26 164 26 164 0v-46l-82 32z" {...R} />
        <path d="M338 105v62" stroke="var(--ink)" strokeWidth="3" /><circle className="swing" cx="338" cy="176" r="9" fill="var(--red)" stroke="var(--ink)" strokeWidth="3" /></g>
      <path d="M70 252c40-16 90-16 130 8 40-24 90-24 130-8v-34c-40-16-90-16-130 8-40-24-90-24-130-8z" {...W} /><path d="M200 226v34" stroke="var(--ink)" strokeWidth="3" />
      <path className="dash" d="M96 232c26-6 52-4 78 6M96 244c26-6 52-4 78 6" stroke="var(--red)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <g className="tw"><path d="M60 70l5 12 12 5-12 5-5 12-5-12-12-5 12-5z" fill="var(--red)" /></g><g className="tw t2"><path d="M350 200l4 9 9 4-9 4-4 9-4-9-9-4 9-4z" fill="var(--ink)" /></g>
    </svg>
  );
}

export function Briefcase() {
  return (
    <svg viewBox="0 0 400 300" className="art" role="img" aria-label="Work and job visa">
      <g className="float">
        <path d="M156 92v-18c0-10 8-16 18-16h52c10 0 18 6 18 16v18" fill="none" stroke="var(--ink)" strokeWidth="9" strokeLinecap="round" />
        <rect x="70" y="92" width="260" height="164" rx="22" {...R} /><path d="M70 160c40 26 220 26 260 0" fill="none" stroke="var(--ink)" strokeWidth="3" />
        <rect x="178" y="146" width="44" height="34" rx="8" {...W} /><circle cx="200" cy="163" r="5" fill="var(--ink)" />
      </g>
      <g className="pop"><circle cx="322" cy="86" r="34" fill="#fff" stroke="var(--ink)" strokeWidth="3" /><path className="draw" d="M305 87l12 12 21-24" fill="none" stroke="var(--red)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /></g>
      <g className="tw"><rect x="40" y="48" width="54" height="68" rx="8" {...W} transform="rotate(-12 67 82)" /><path d="M52 70h30M52 84h30M52 98h18" stroke="var(--red)" strokeWidth="3" strokeLinecap="round" transform="rotate(-12 67 82)" /></g>
    </svg>
  );
}

export function Passport() {
  return (
    <svg viewBox="0 0 400 300" className="art" role="img" aria-label="Permanent residency">
      <g className="float"><rect x="108" y="36" width="184" height="236" rx="16" {...K} /><rect x="120" y="48" width="160" height="212" rx="10" fill="var(--red)" />
        <circle cx="200" cy="130" r="42" fill="none" stroke="#fff" strokeWidth="3.5" /><ellipse cx="200" cy="130" rx="18" ry="42" fill="none" stroke="#fff" strokeWidth="3" /><path d="M158 130h84M166 108h68M166 152h68" stroke="#fff" strokeWidth="3" />
        <text x="200" y="214" textAnchor="middle" fontFamily="Plus Jakarta Sans,sans-serif" fontWeight="800" fontSize="17" letterSpacing="5" fill="#fff">PASSPORT</text></g>
      <g className="stamp" transform="rotate(-14 300 215)"><circle cx="300" cy="215" r="48" fill="rgba(255,255,255,.92)" stroke="var(--ink)" strokeWidth="4" /><circle cx="300" cy="215" r="39" fill="none" stroke="var(--ink)" strokeWidth="2" strokeDasharray="4 4" />
        <text x="300" y="212" textAnchor="middle" fontFamily="Plus Jakarta Sans,sans-serif" fontWeight="800" fontSize="15" fill="var(--ink)">PR</text><text x="300" y="232" textAnchor="middle" fontFamily="Plus Jakarta Sans,sans-serif" fontWeight="800" fontSize="12" fill="var(--red)">APPROVED</text></g>
    </svg>
  );
}

export function Flight() {
  return (
    <svg viewBox="0 0 400 300" className="art" role="img" aria-label="Tourist visa">
      <g className="cloud"><path d="M40 90c0-16 22-22 32-10 6-14 32-12 34 6 14 0 20 18 6 24H48c-12 0-16-12-8-20z" fill="#fff" stroke="var(--ink)" strokeWidth="3" /></g>
      <g className="cloud c2"><path d="M270 230c0-14 20-20 29-9 6-13 29-11 31 5 13 0 18 16 5 22h-56c-11 0-14-11-9-18z" fill="#fff" stroke="var(--ink)" strokeWidth="3" /></g>
      <path className="dash" d="M30 250C120 250 150 150 240 150" fill="none" stroke="var(--ink)" strokeWidth="3" strokeDasharray="4 10" strokeLinecap="round" />
      <g className="fly"><g transform="translate(255 105) rotate(55) scale(.7) translate(-200 -120)"><path d="M200 30c9 0 14 9 14 22v52l78 44v20l-78-20v54l26 20v14l-40-10-40 10v-14l26-20v-54l-78 20v-20l78-44V52c0-13 5-22 14-22z" {...R} /></g></g>
      <g className="float"><rect x="48" y="176" width="116" height="64" rx="10" {...W} /><path d="M128 176v64" stroke="var(--ink)" strokeWidth="3" strokeDasharray="4 5" /><path d="M62 196h50M62 210h36M62 224h24" stroke="var(--red)" strokeWidth="3.5" strokeLinecap="round" /></g>
    </svg>
  );
}

export const artFor = url => /study|ielts|pte|gre|duolingo|scholar|sop|counsel|interview/.test(url) ? Cap : /work|job/.test(url) ? Briefcase : /tourist|schengen|flight/.test(url) ? Flight : /pr|canada|australia|pnp|express|subclass|germany|portugal/.test(url) ? Passport : Globe;
