export function OeeRealCard() {
  return (
    <div className="card card-oee-real">
      <h2>OEE Real <span className="subtitle">Últimos 30 dias</span></h2>
      <div className="oee-real-content">
        <div className="bars-col">
          <div className="bar-item">
            <div className="bar-label"><span className="val blue-text">82%</span> Disponibilidade</div>
            <div className="progress-bg"><div className="progress-fill blue-fill" style={{ width: '82%' }}></div></div>
          </div>
          <div className="bar-item">
            <div className="bar-label"><span className="val orange-text">88%</span> Performance</div>
            <div className="progress-bg"><div className="progress-fill orange-fill" style={{ width: '88%' }}></div></div>
          </div>
          <div className="bar-item">
            <div className="bar-label"><span className="val green-text">97%</span> Qualidade</div>
            <div className="progress-bg"><div className="progress-fill green-fill" style={{ width: '97%' }}></div></div>
          </div>
        </div>
        <div className="circle-col">
          <div className="circular-chart">
            <svg viewBox="0 0 36 36" className="circular-svg">
              <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="circle-val blue-stroke" strokeDasharray="70, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <text x="18" y="20.5" className="circle-text">70%</text>
            </svg>
          </div>
          <div className="circle-sub">50%</div>
        </div>
      </div>
    </div>
  );
}
