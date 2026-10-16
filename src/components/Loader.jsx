// Animated SVG loader / logo splash (globe + plane + wordmark draw-in)
export default function Loader({ splash }) {
  return (
    <div className={splash ? 'splash' : 'loader'}>
      <svg viewBox="0 0 140 140" width={splash ? 120 : 80} height={splash ? 120 : 80} aria-hidden="true" className="ld-svg">
        <defs>
          <linearGradient id="ldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e11d2e" />
            <stop offset="100%" stopColor="#ff3b3b" />
          </linearGradient>
        </defs>
        <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(225,29,46,0.15)" strokeWidth="3" />
        <circle className="ld-ring" cx="70" cy="70" r="58" fill="none" stroke="url(#ldGrad)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="300" strokeDashoffset="0" />
        <ellipse cx="70" cy="70" rx="22" ry="58" fill="none" stroke="var(--ink)" strokeWidth="1.5" opacity="0.3" />
        <path d="M35 70h70" stroke="var(--ink)" strokeWidth="1.5" opacity="0.3" />
        <g className="ld-plane">
          <path d="M0 0 L-12 -7 L-8 0 L-12 7 Z" fill="var(--red)" stroke="var(--ink)" strokeWidth="1.2" strokeLinejoin="round" />
          <animateMotion dur="2.2s" repeatCount="indefinite" rotate="auto" path="M70 12a58 58 0 1 1 -0.1 0" />
        </g>
      </svg>
      {splash && (
        <svg className="ld-wordmark" viewBox="0 0 440 56" aria-label="Visa For Nation">
          <defs>
            <linearGradient id="wmGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e11d2e" />
              <stop offset="50%" stopColor="#fff" />
              <stop offset="100%" stopColor="#e11d2e" />
            </linearGradient>
          </defs>
          <text x="220" y="40" textAnchor="middle" textLength="410" lengthAdjust="spacing"
                fontFamily="Outfit,Plus Jakarta Sans,sans-serif" fontWeight="800" fontSize="38"
                fill="url(#wmGrad)" stroke="none"
                className="ld-text">
            VISA FOR NATION
          </text>
        </svg>
      )}
    </div>
  );
}