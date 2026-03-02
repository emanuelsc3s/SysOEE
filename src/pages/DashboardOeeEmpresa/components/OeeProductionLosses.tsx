import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { LinhaPerdaOeeEmpresa, LinhaProducaoOeeEmpresa } from '../types'

type OeeProductionLossesProps = {
  producao: LinhaProducaoOeeEmpresa[]
  perdas: LinhaPerdaOeeEmpresa[]
}

const formatarValor = (valor: number | string): string => {
  if (typeof valor === 'number') {
    return valor.toLocaleString('pt-BR', {
      maximumFractionDigits: 0,
    })
  }

  return valor
}

const formatarInteiro = (valor: number): string =>
  valor.toLocaleString('pt-BR', {
    maximumFractionDigits: 0,
  })

export function OeeProductionLosses({
  producao,
  perdas,
}: OeeProductionLossesProps) {
  return (
    <div className="bottom-grid">
      <Card className="prod-card">
        <div className="section-label section-label-tight">Produção</div>

        {producao.map((item) => (
          <div key={item.id} className="prod-row">
            <div className="prod-row-label">
              <div className="prod-row-title">{item.titulo}</div>
              <div className="prod-row-sub">{item.subtitulo}</div>
            </div>
            <div className="prod-row-value" style={{ color: item.corValor }}>
              {formatarValor(item.valor)}
              <small>{item.unidade}</small>
            </div>
          </div>
        ))}
      </Card>

      <Card className="prod-card">
        <div className="section-label section-label-tight">Perdas</div>

        {perdas.map((item) => (
          <div key={item.id} className="prod-row">
            <div className="prod-row-label">
              <div className="prod-row-title">{item.titulo}</div>
              <div className="prod-row-sub">{item.subtitulo}</div>
            </div>
            <div className="prod-row-value">
              <span style={{ color: item.corValor }}>{formatarInteiro(item.valor)}</span>
              {item.badge ? (
                <small>
                  <Badge variant="outline" className="badge badge-red">
                    {item.badge}
                  </Badge>
                </small>
              ) : (
                <small>{item.unidade}</small>
              )}
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
