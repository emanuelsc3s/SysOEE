export function VelocidadeCard() {
  return (
    <div className="card card-velocidade">
      <h2>Velocidade <span className="subtitle">Últimos 30 dias</span></h2>
      <div className="vel-chart-container">
        <div className="vel-y-axis">
          <span>100</span>
          <span>75</span>
          <span>50</span>
          <span>25</span>
          <span>0</span>
        </div>
        <div className="vel-chart">
          {Array.from({ length: 15 }).map((_, i) => {
            const h = Math.random() * 60 + 20;
            return (
              <div key={i} className="vel-bar-wrapper">
                <div className="vel-bar blue-fill" style={{ height: `${h}%` }}></div>
                <div className="vel-date">{21 + i}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
