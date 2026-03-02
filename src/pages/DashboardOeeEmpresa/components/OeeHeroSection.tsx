import { Card } from '@/components/ui/card'
import type { IndicadorHeroOeeEmpresa } from '../types'

type OeeHeroSectionProps = {
  percentualOee: number
  descricao: string
  indicadores: IndicadorHeroOeeEmpresa[]
}

const formatarPercentual = (valor: number, casasDecimais = 2): string =>
  valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  })

const formatarNumero = (valor: number): string =>
  valor.toLocaleString('pt-BR', {
    maximumFractionDigits: 0,
  })

export function OeeHeroSection({
  percentualOee,
  descricao,
  indicadores,
}: OeeHeroSectionProps) {
  return (
    <Card className="oee-main-card">
      <div>
        <div className="oee-label">Overall Equipment Effectiveness</div>
        <div className="oee-value-huge">
          {formatarPercentual(percentualOee)}
          <span>%</span>
        </div>
        <div className="oee-desc">{descricao}</div>
      </div>

      <div className="oee-highlights-wrapper">
        <div className="oee-highlights">
          {indicadores.map((indicador) => (
            <div
              key={indicador.id}
              className="oee-highlight-card"
              style={{
                background: indicador.fundo,
                borderColor: indicador.borda,
              }}
            >
              <div className="oee-highlight-title">{indicador.titulo}</div>
              <div className="oee-highlight-value" style={{ color: indicador.cor }}>
                {formatarNumero(indicador.valor)}{' '}
                <span className="oee-highlight-unit">{indicador.unidade}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
