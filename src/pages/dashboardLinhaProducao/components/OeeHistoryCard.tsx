export type OeeHistoryCardItem = {
  dataLabel: string;
  dataTooltip?: string;
  oee: number;
};

type OeeHistoryCardProps = {
  itens: OeeHistoryCardItem[];
  statusTexto?: string;
  mensagemVazia?: string;
  limiteDias?: number;
  metaPercentual?: number;
};

const clampPercentual = (valor: number): number => {
  if (!Number.isFinite(valor)) {
    return 0;
  }

  return Math.min(Math.max(valor, 0), 100);
};

export function OeeHistoryCard({
  itens,
  statusTexto,
  mensagemVazia,
  limiteDias = 30,
  metaPercentual = 65,
}: OeeHistoryCardProps) {
  const metaNormalizada = clampPercentual(metaPercentual);
  const totalBarras = Math.max(itens.length, 1);
  const gapPct =
    totalBarras >= 20 ? 0.7 : totalBarras >= 14 ? 0.85 : totalBarras >= 10 ? 1 : 1.2;
  const ocupacaoTotalPct =
    totalBarras >= 20 ? 94 : totalBarras >= 14 ? 95 : totalBarras >= 10 ? 96 : 97;
  const margemLateralPct = Math.max((100 - ocupacaoTotalPct) / 2, 1.5);
  const larguraBarraPct =
    itens.length > 0
      ? Math.max(
          2.2,
          Math.min(6, (ocupacaoTotalPct - gapPct * (totalBarras - 1)) / totalBarras),
        )
      : 4;
  const metaTexto = `Meta ${metaNormalizada.toLocaleString('pt-BR', {
    maximumFractionDigits: 0,
  })}%`;

  return (
    <div className="card card-oee-history">
      <h2>
        OEE Histórico <span className="subtitle">Últimos {limiteDias} dias</span>
        <span className="subtitle subtitle-right">
          <span className="green-text">{metaTexto}</span>
          {statusTexto ? ` · ${statusTexto}` : null}
        </span>
      </h2>

      {itens.length === 0 ? (
        <div className="pareto-empty">{mensagemVazia || 'Sem dados no período.'}</div>
      ) : (
        <div className="chart-placeholder">
          <div
            className="bar-chart-container"
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr)',
              gridTemplateRows: '1fr auto',
              justifyContent: 'stretch',
              justifyItems: 'stretch',
              alignItems: 'stretch',
              borderBottom: 'none',
              paddingBottom: 0,
            }}
          >
            <div
              style={{
                width: '100%',
                minWidth: 0,
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: `${gapPct}%`,
                borderBottom: '1px solid var(--border-color)',
                minHeight: 0,
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: `${margemLateralPct}%`,
                  right: `${margemLateralPct}%`,
                  bottom: `${metaNormalizada}%`,
                  borderTop: '2px dashed rgba(34, 197, 94, 0.8)',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              />

              {itens.map((item, indice) => {
                const oeeNormalizado = clampPercentual(item.oee);
                const alturaBarra = oeeNormalizado > 0 ? Math.max(oeeNormalizado, 4) : 0;
                const oeeArredondado = Math.round(oeeNormalizado);

                return (
                  <div
                    key={`${item.dataLabel}-${indice}`}
                    className="bar-wrapper"
                    style={{
                      width: `${larguraBarraPct}%`,
                      flex: '0 0 auto',
                      position: 'relative',
                      zIndex: 1,
                    }}
                    title={`${item.dataTooltip || item.dataLabel}: ${oeeNormalizado.toLocaleString(
                      'pt-BR',
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )}%`}
                  >
                    <div className="bar-val">{oeeArredondado}</div>
                    <div className="bar-fill purple-fill" style={{ height: `${alturaBarra}%` }}></div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                width: '100%',
                minWidth: 0,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                gap: `${gapPct}%`,
                paddingTop: '0.2cqi',
              }}
            >
              {itens.map((item, indice) => (
                <div
                  key={`date-${item.dataLabel}-${indice}`}
                  style={{ width: `${larguraBarraPct}%`, flex: '0 0 auto' }}
                >
                  <div className="bar-date" style={{ marginTop: 0 }}>
                    {item.dataLabel}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
