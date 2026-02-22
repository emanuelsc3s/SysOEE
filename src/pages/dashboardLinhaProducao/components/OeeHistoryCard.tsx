export function OeeHistoryCard() {
  return (
    <div className="card card-oee-history">
      <h2>OEE Histórico <span className="subtitle">Últimos 30 dias</span> <span className="subtitle-right">Meta <span className="blue-text">50.0%</span> Média <span className="green-text">30.1%</span></span></h2>
      <div className="chart-placeholder">
        <div className="bar-chart-container">
          {Array.from({ length: 16 }).map((_, i) => {
            const h = Math.random() * 60 + 10;
            return (
              <div key={i} className="bar-wrapper">
                <div className="bar-val">{Math.round(h)}</div>
                <div className="bar-fill purple-fill" style={{ height: `${h}%` }}></div>
                <div className="bar-date">{20 + i}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
