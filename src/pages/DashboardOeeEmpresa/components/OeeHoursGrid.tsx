import { Card } from '@/components/ui/card'
import type { HoraPeriodoOeeEmpresa } from '../types'

type OeeHoursGridProps = {
  horas: HoraPeriodoOeeEmpresa[]
}

export function OeeHoursGrid({ horas }: OeeHoursGridProps) {
  return (
    <div className="hours-section">
      <div className="section-label">Horas do período</div>
      <div className="hours-grid">
        {horas.map((hora) => {
          const [partePrincipal, parteFinal = '00'] = hora.valor.split(':')

          return (
            <Card key={hora.id} className="hour-card">
              <div className="hour-label">{hora.rotulo}</div>
              <div className="hour-value" style={{ color: hora.cor }}>
                {partePrincipal}
                <small className="hour-value-suffix">:{parteFinal} h</small>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
