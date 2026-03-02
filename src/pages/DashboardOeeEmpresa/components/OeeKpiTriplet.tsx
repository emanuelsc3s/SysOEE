import type { CSSProperties } from 'react'
import { Card } from '@/components/ui/card'
import type { KpiOeeEmpresa } from '../types'

type OeeKpiTripletProps = {
  kpis: KpiOeeEmpresa[]
}

const formatarPercentual = (valor: number): string =>
  valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

export function OeeKpiTriplet({ kpis }: OeeKpiTripletProps) {
  return (
    <div className="kpi-triplet">
      {kpis.map((kpi) => {
        const styleComCor = {
          '--kpi-color': kpi.cor,
        } as CSSProperties

        return (
          <Card key={kpi.id} className="kpi-card" style={styleComCor}>
            <div className="kpi-name">{kpi.nome}</div>
            <div className="kpi-num">
              {formatarPercentual(kpi.percentual)}
              <span>%</span>
            </div>
            <div className="kpi-sub">{kpi.subtitulo}</div>
            <div className="kpi-bar-bg">
              <div className="kpi-bar-fill" style={{ width: `${kpi.percentual}%` }} />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
