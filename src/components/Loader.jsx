// Animated Visa For Nation logo loader
export default function Loader({ splash }) {
  return (
    <div className={splash ? 'splash' : 'loader'} role="status" aria-label="Loading Visa For Nation">
      <div className="ld-loader-content">
        {/* vfn loader size img circle  */}
        <div className="ld-leaf-stage" aria-hidden="true" style={{height:"88px", width:"88px",}}>
          <img className="ld-leaf" src="/assets/brand/fav.png" alt="vfn-loader-logo" />
        </div>
        <div className="ld-wordmark" aria-hidden="true" style={{color:"#b51226"}}>VISA FOR NATION</div>
        <div className="ld-loader-track" aria-hidden="true"><span /></div>
      </div>
    </div>
  );
}
