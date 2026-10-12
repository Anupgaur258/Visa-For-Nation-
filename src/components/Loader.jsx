// Animated SVG loader / logo splash (plane orbiting a globe + wordmark that draws in)
export default function Loader({ splash }) {
  return (
    <div className={splash ? 'splash' : 'loader'}>
      <svg viewBox="0 0 120 120" width="96" height="96" aria-hidden="true">
        <circle cx="60" cy="60" r="34" fill="none" stroke="#ececef" strokeWidth="4" />
        <circle className="ld-arc" cx="60" cy="60" r="34" fill="none" stroke="var(--red)" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="60" cy="60" rx="14" ry="34" fill="none" stroke="var(--ink)" strokeWidth="2.5" /><path d="M26 60h68" stroke="var(--ink)" strokeWidth="2.5" />
        <g><path d="M0 0L-9-5-6 0-9 5Z" fill="var(--red)" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" /><animateMotion dur="1.6s" repeatCount="indefinite" rotate="auto" path="M60 12a48 48 0 1 1 -0.1 0" /></g>
      </svg>
      {splash && <svg className="wordmark" viewBox="0 0 420 44" aria-label="Visa For Nation"><text x="210" y="32" textAnchor="middle" textLength="396" lengthAdjust="spacing" fontFamily="Plus Jakarta Sans,sans-serif" fontWeight="800" fontSize="30" fill="none" stroke="var(--ink)" strokeWidth="1.2">VISA FOR NATION</text></svg>}
    </div>
  );
}
