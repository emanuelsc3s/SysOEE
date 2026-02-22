interface OeeRealCardProps {
  oee?: number;
  disponibilidade?: number;
  performance?: number;
  qualidade?: number;
}

const clampPercentual = (valor: number) => Math.max(0, Math.min(100, valor));
const CIRCUNFERENCIA_OEE = 339.292;

const getColorByPercentage = (percentage: number): string => {
  const percent = Math.max(0, Math.min(100, percentage));

  const colorStops = [
    { percent: 0, color: { r: 220, g: 38, b: 38 } },
    { percent: 25, color: { r: 239, g: 68, b: 68 } },
    { percent: 50, color: { r: 249, g: 115, b: 22 } },
    { percent: 65, color: { r: 234, g: 179, b: 8 } },
    { percent: 75, color: { r: 34, g: 197, b: 94 } },
    { percent: 85, color: { r: 16, g: 185, b: 129 } },
    { percent: 90, color: { r: 59, g: 130, b: 246 } },
    { percent: 95, color: { r: 37, g: 99, b: 235 } },
    { percent: 100, color: { r: 30, g: 64, b: 175 } },
  ];

  let lowerStop = colorStops[0];
  let upperStop = colorStops[colorStops.length - 1];

  for (let i = 0; i < colorStops.length - 1; i++) {
    if (percent >= colorStops[i].percent && percent <= colorStops[i + 1].percent) {
      lowerStop = colorStops[i];
      upperStop = colorStops[i + 1];
      break;
    }
  }

  const range = upperStop.percent - lowerStop.percent;
  const rangePercent = range === 0 ? 0 : (percent - lowerStop.percent) / range;

  const r = Math.round(lowerStop.color.r + (upperStop.color.r - lowerStop.color.r) * rangePercent);
  const g = Math.round(lowerStop.color.g + (upperStop.color.g - lowerStop.color.g) * rangePercent);
  const b = Math.round(lowerStop.color.b + (upperStop.color.b - lowerStop.color.b) * rangePercent);

  const toHex = (value: number) => {
    const hex = value.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

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
  const corOee = getColorByPercentage(oeeNormalizado);

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
            <svg
              className="circular-svg"
              viewBox="0 0 120 120"
            >
              <circle
                className="circular-track"
                cx="60"
                cy="60"
                fill="none"
                r="54"
                strokeWidth="12"
              />
              <circle
                cx="60"
                cy="60"
                fill="none"
                r="54"
                strokeDasharray={CIRCUNFERENCIA_OEE}
                strokeDashoffset={CIRCUNFERENCIA_OEE - (CIRCUNFERENCIA_OEE * oeeNormalizado) / 100}
                strokeLinecap="round"
                strokeWidth="12"
                stroke={corOee}
                style={{ transition: 'stroke 0.3s ease-in-out' }}
              />
              {oeeNormalizado < 65 && (
                <circle
                  cx="60"
                  cy="60"
                  fill="none"
                  r="54"
                  strokeDasharray={CIRCUNFERENCIA_OEE}
                  strokeDashoffset={CIRCUNFERENCIA_OEE - (CIRCUNFERENCIA_OEE * 65) / 100}
                  strokeLinecap="round"
                  strokeWidth="12"
                  stroke="#EAB308"
                  opacity="0.25"
                  style={{ transition: 'opacity 0.3s ease-in-out' }}
                />
              )}
            </svg>
            <div className="circular-chart-overlay">
              <div className="circular-chart-center">
                <span className="circular-chart-value">{formatarPercentual(oeeNormalizado)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
