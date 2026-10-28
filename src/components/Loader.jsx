// Animated Visa For Nation logo loader
export default function Loader({ splash }) {
  return (
    <div className={splash ? 'splash' : 'loader'} role="status" aria-label="Loading Visa For Nation">
      <div className="ld-loader-content">
        <div className="ld-leaf-stage" aria-hidden="true">
          <img className="ld-leaf" src="/assets/brand/fav.png" alt="" />
        </div>
        <div className="ld-wordmark" aria-hidden="true" style={{color:"red"}}>VISA FOR NATION</div>
        <div className="ld-loader-track" aria-hidden="true"><span /></div>
      </div>
    </div>
  );
}
