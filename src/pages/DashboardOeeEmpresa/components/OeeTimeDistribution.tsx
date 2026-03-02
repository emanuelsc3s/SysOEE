import type { SegmentoTempoOeeEmpresa } from '../types'

type OeeTimeDistributionProps = {
  segmentos: SegmentoTempoOeeEmpresa[]
}

export function OeeTimeDistribution({ segmentos }: OeeTimeDistributionProps) {
  return (
    <div className="time-bar-section">
      <div className="section-label">Distribuição de horas</div>

      <div className="time-bar">
        {segmentos.map((segmento) => (
          <div
            key={segmento.id}
            className="time-segment"
            style={{
              width: `${segmento.larguraPercentual}%`,
              background: segmento.gradiente,
              color: segmento.corTexto,
            }}
          >
            {segmento.valor}
          </div>
        ))}
      </div>

      <div className="time-bar-legend">
        {segmentos.map((segmento) => (
          <div key={`legend-${segmento.id}`} className="legend-item">
            <div
              className="legend-dot"
              style={{
                background: segmento.corLegenda,
                border: segmento.bordaLegenda ? `1px solid ${segmento.bordaLegenda}` : undefined,
              }}
            />
            {segmento.legenda}
          </div>
        ))}
      </div>
    </div>
  )
}
