export function ManutencaoCard() {
  return (
    <div className="card card-manutencao">
      <h2>Manutenção <span className="subtitle">Últimos 30 dias</span></h2>
      <div className="m-content">
        <div className="m-item">
          <div className="m-label">MTTR</div>
          <div className="m-chart">
            <div className="m-val-top">0.8h</div>
            <div className="m-track"><div className="m-marker" style={{ left: '80%' }}></div></div>
            <div className="m-val-bot green-text">0.5h</div>
          </div>
        </div>
        <div className="m-item">
          <div className="m-label">MTBF</div>
          <div className="m-chart">
            <div className="m-val-top">24.0h</div>
            <div className="m-track"><div className="m-marker" style={{ left: '30%' }}></div></div>
            <div className="m-val-bot green-text">53.2h</div>
          </div>
        </div>
        <div className="m-item">
          <div className="m-label">MWT</div>
          <div className="m-chart">
            <div className="m-val-top">0.3h</div>
            <div className="m-track"><div className="m-marker" style={{ left: '60%' }}></div></div>
            <div className="m-val-bot green-text">0.2h</div>
          </div>
        </div>
      </div>
    </div>
  );
}
