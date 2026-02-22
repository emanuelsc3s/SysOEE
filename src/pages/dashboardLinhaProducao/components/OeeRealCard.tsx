interface OeeRealCardProps {
  oee?: number;
  disponibilidade?: number;
  performance?: number;
  qualidade?: number;
}

const clampPercentual = (valor: number) => Math.max(0, Math.min(100, valor));

const formatarPercentual = (valor: number) =>
  valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function OeeRealCard({
  oee = 70,
  disponibilidade = 82,
  performance = 88,
  qualidade = 97,
}: OeeRealCardProps) {
  const oeeNormalizado = clampPercentual(oee);
  const disponibilidadeNormalizada = clampPercentual(disponibilidade);
  const performanceNormalizada = clampPercentual(performance);
  const qualidadeNormalizada = clampPercentual(qualidade);

  return (
    <div className="card card-oee-real">
      <h2>OEE REAL <span className="subtitle">Últimos 30 dias</span></h2>
      <div className="oee-real-content">
        <div className="bars-col">
          <div className="bar-item">
            <div className="bar-label"><span className="val blue-text">{formatarPercentual(disponibilidadeNormalizada)}%</span> Disponibilidade</div>
            <div className="progress-bg"><div className="progress-fill blue-fill" style={{ width: `${disponibilidadeNormalizada}%` }}></div></div>
          </div>
          <div className="bar-item">
            <div className="bar-label"><span className="val orange-text">{formatarPercentual(performanceNormalizada)}%</span> Performance</div>
            <div className="progress-bg"><div className="progress-fill orange-fill" style={{ width: `${performanceNormalizada}%` }}></div></div>
          </div>
          <div className="bar-item">
            <div className="bar-label"><span className="val green-text">{formatarPercentual(qualidadeNormalizada)}%</span> Qualidade</div>
            <div className="progress-bg"><div className="progress-fill green-fill" style={{ width: `${qualidadeNormalizada}%` }}></div></div>
          </div>
        </div>
        <div className="circle-col">
          <div className="circular-chart">
            <svg viewBox="0 0 36 36" className="circular-svg">
              <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="circle-val blue-stroke" strokeDasharray={`${oeeNormalizado}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <text x="18" y="20.5" className="circle-text">{formatarPercentual(oeeNormalizado)}%</text>
            </svg>
          </div>
          <div className="circle-sub">50%</div>
        </div>
      </div>
    </div>
  );
}
