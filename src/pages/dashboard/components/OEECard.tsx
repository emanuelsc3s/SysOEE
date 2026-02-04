/**
 * OEECard - Card principal de OEE por linha de produção
 * Exibe gauge circular, estatísticas e barras de métricas
 */

import { cn } from '@/lib/utils'
import { CircularGaugeOEE } from './CircularGaugeOEE'
import { MetricBarOEE } from './MetricBarOEE'
import type { OEECardProps } from '../types/dashboard.types'

// Componente interno para estatísticas
interface StatItemProps {
  label: string
  value: number
  color: string
}

function StatItem({ label, value, color }: StatItemProps) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-xs text-white/40">{label}</span>
      <div className="flex items-baseline gap-1">
        <span
          className="text-lg font-medium"
          style={{ color, letterSpacing: '-0.01em' }}
        >
          {value.toLocaleString('pt-BR')}
        </span>
        <span className="text-[11px] tracking-wide text-white/30">un</span>
      </div>
    </div>
  )
}

export function OEECard({
  title,
  oeeValue,
  disponibilidade,
  performance,
  qualidade,
  unidadesProduzidas,
  unidadesPerdas,
  unidadesBoas,
  className,
}: OEECardProps) {
  return (
    <div
      className={cn(
        'rounded-3xl p-7 border font-sans',
        'bg-white/[0.02] backdrop-blur-xl border-white/[0.06]',
        className
      )}
    >
      {/* Header */}
      <h3 className="text-[13px] text-white/70 mb-6 leading-normal">
        {title}
      </h3>

      {/* Conteúdo principal: Gauge + Estatísticas */}
      <div className="flex gap-7 items-start">
        <CircularGaugeOEE value={oeeValue} />

        <div className="flex-1 flex flex-col gap-4 pt-1">
          <StatItem
            label="Produzidas"
            value={unidadesProduzidas}
            color="rgba(96,165,250,0.9)"
          />
          <StatItem
            label="Aprovadas"
            value={unidadesBoas}
            color="rgba(52,211,153,0.9)"
          />
          <StatItem
            label="Perdas"
            value={unidadesPerdas}
            color={unidadesPerdas > 0 ? 'rgba(248,113,113,0.9)' : 'rgba(255,255,255,0.3)'}
          />
        </div>
      </div>

      {/* Divisor */}
      <div className="h-px bg-white/[0.06] my-6" />

      {/* Barras de métricas */}
      <div className="flex flex-col gap-4">
        <MetricBarOEE
          label="Disponibilidade"
          value={disponibilidade}
          variant="disponibilidade"
        />
        <MetricBarOEE
          label="Performance"
          value={performance}
          variant="performance"
        />
        <MetricBarOEE
          label="Qualidade"
          value={qualidade}
          variant="qualidade"
        />
      </div>
    </div>
  )
}
