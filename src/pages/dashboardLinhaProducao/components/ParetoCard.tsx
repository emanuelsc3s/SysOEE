export function ParetoCard() {
  return (
    <div className="card card-pareto">
      <h2>Pareto <span className="subtitle">Últimos 30 dias</span></h2>
      <div className="pareto-list">
        <div className="pareto-item">
          <div className="p-label" style={{ background: 'linear-gradient(90deg, var(--p-label-bg) 100%, transparent 100%)' }}>
            SETUP TOTAL
          </div>
          <div className="p-val1">84.5h</div>
          <div className="p-val2">38.5%</div>
        </div>
        <div className="pareto-item">
          <div className="p-label" style={{ background: 'linear-gradient(90deg, var(--p-label-bg) 60%, transparent 60%)' }}>
            MICROPARADA
          </div>
          <div className="p-val1">50.7h</div>
          <div className="p-val2">23.1%</div>
        </div>
        <div className="pareto-item">
          <div className="p-label" style={{ background: 'linear-gradient(90deg, var(--p-label-bg) 34%, transparent 34%)' }}>
            SETUP PARCIAL
          </div>
          <div className="p-val1">28.8h</div>
          <div className="p-val2">13.1%</div>
        </div>
        <div className="pareto-item">
          <div className="p-label" style={{ background: 'linear-gradient(90deg, var(--p-label-bg) 30%, transparent 30%)' }}>
            REPROCESSO
          </div>
          <div className="p-val1">25.1h</div>
          <div className="p-val2">11.4%</div>
        </div>
        <div className="pareto-item">
          <div className="p-label" style={{ background: 'linear-gradient(90deg, var(--p-label-bg) 17%, transparent 17%)' }}>
            REFEIÇÃO
          </div>
          <div className="p-val1">14.6h</div>
          <div className="p-val2">6.6%</div>
        </div>
        <div className="pareto-item">
          <div className="p-label" style={{ background: 'linear-gradient(90deg, var(--p-label-bg) 11%, transparent 11%)' }}>
            AGUARDANDO TAREFA
          </div>
          <div className="p-val1">9.7h</div>
          <div className="p-val2">4.4%</div>
        </div>
        <div className="pareto-item">
          <div className="p-label" style={{ background: 'linear-gradient(90deg, var(--p-label-bg) 7%, transparent 7%)' }}>
            LIMPEZA
          </div>
          <div className="p-val1">6.2h</div>
          <div className="p-val2">2.8%</div>
        </div>
      </div>
    </div>
  );
}
