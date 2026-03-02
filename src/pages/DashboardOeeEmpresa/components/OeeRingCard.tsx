import { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import type { ArcoRingOeeEmpresa, LegendaRingOeeEmpresa } from '../types'

type OeeRingCardProps = {
  arcos: ArcoRingOeeEmpresa[]
  legenda: LegendaRingOeeEmpresa[]
  percentualCentro: number
}

const calcularCircunferencia = (raio: number): number => 2 * Math.PI * raio

const formatarPercentual = (valor: number, casasDecimais = 2): string =>
  valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  })

export function OeeRingCard({
  arcos,
  legenda,
  percentualCentro,
}: OeeRingCardProps) {
  const arcRefs = useRef<Record<string, SVGCircleElement | null>>({})

  useEffect(() => {
    arcos.forEach((arco, index) => {
      const el = arcRefs.current[arco.id]
      if (!el) {
        return
      }

      const circunferencia = calcularCircunferencia(arco.raio)
      const targetOffset = circunferencia - (arco.percentual / 100) * circunferencia

      el.style.strokeDasharray = `${circunferencia}`
      el.style.strokeDashoffset = `${circunferencia}`
      el.style.transition = `stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1) ${0.2 + index * 0.2}s`

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.strokeDashoffset = `${targetOffset}`
        })
      })
    })
  }, [arcos])

  return (
    <Card className="ring-card">
      <div className="ring-wrapper">
        <svg viewBox="0 0 200 200">
          {arcos.map((arco) => (
            <circle
              key={`bg-${arco.id}`}
              cx="100"
              cy="100"
              r={arco.raio}
              fill="none"
              stroke="rgba(0,0,0,0.06)"
              strokeWidth="12"
            />
          ))}

          {arcos.map((arco) => {
            const circunferencia = calcularCircunferencia(arco.raio)
            return (
              <circle
                key={arco.id}
                ref={(el) => {
                  arcRefs.current[arco.id] = el
                }}
                cx="100"
                cy="100"
                r={arco.raio}
                fill="none"
                stroke={arco.cor}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circunferencia}
                strokeDashoffset={circunferencia}
              />
            )
          })}
        </svg>
        <div className="ring-center">
          <div className="ring-center-val">{formatarPercentual(percentualCentro, 1)}%</div>
          <div className="ring-center-label">OEE</div>
        </div>
      </div>

      <div className="ring-legend">
        {legenda.map((item) => (
          <div key={item.id} className="ring-item">
            <div className="ring-item-left">
              <div className="ring-dot" style={{ background: item.cor }} />
              <span className="ring-item-name">{item.nome}</span>
            </div>
            <span className="ring-item-val" style={{ color: item.cor }}>
              {formatarPercentual(item.percentual)}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
