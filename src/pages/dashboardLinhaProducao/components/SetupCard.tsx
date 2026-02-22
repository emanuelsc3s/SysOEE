export function SetupCard() {
  return (
    <div className="card card-setup">
      <h2>Setup <span className="subtitle">Last 30 days</span></h2>
      <div className="setup-content">
        <div className="setup-bar-track">
          <div className="setup-bar-fill red-fill" style={{ width: '58.7%' }}></div>
        </div>
        <div className="setup-labels">
          <span>0%</span>
          <span>100%</span>
        </div>
        <div className="setup-val red-text">58.7%<br /><span className="s-small-real">REAL</span></div>
      </div>
    </div>
  );
}
