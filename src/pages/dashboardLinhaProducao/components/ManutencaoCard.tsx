export function ManutencaoCard() {
  return (
    <div className="card card-manutencao">
      <h2>Manutenção <span className="subtitle">Últimos 30 dias</span></h2>
      <div className="m-content">
        <div className="m-item">
          <div className="m-label">MTTR</div>
          <div className="m-chart">
            <div className="m-val-top">0h</div>
            <div className="m-track"><div className="m-marker" style={{ left: '0%' }}></div></div>
            <div className="m-val-bot green-text">0h</div>
          </div>
        </div>
        <div className="m-item">
          <div className="m-label">MTBF</div>
          <div className="m-chart">
            <div className="m-val-top">0h</div>
            <div className="m-track"><div className="m-marker" style={{ left: '0%' }}></div></div>
            <div className="m-val-bot green-text">0h</div>
          </div>
        </div>
        <div className="m-item">
          <div className="m-label">MWT</div>
          <div className="m-chart">
            <div className="m-val-top">0h</div>
            <div className="m-track"><div className="m-marker" style={{ left: '0%' }}></div></div>
            <div className="m-val-bot green-text">0h</div>
          </div>
        </div>
      </div>
    </div>
  );
}
