/**
 * MetricBarOEE - Barra de progresso para métricas OEE
 * Exibe Disponibilidade, Performance ou Qualidade
 */

import { cn } from '@/lib/utils'
import { OEE_COLORS } from '../constants/oee-theme'
import type { MetricBarOEEProps } from '../types/dashboard.types'

// Mapeamento de variantes para cores
const variantColors: Record<MetricBarOEEProps['variant'], string> = {
  disponibilidade: OEE_COLORS.metricDisponibilidade,
  performance: OEE_COLORS.metricPerformance,
  qualidade: OEE_COLORS.metricQualidade,
}

export function MetricBarOEE({
  label,
  value,
  variant,
  className,
}: MetricBarOEEProps) {
  const color = variantColors[variant]
  const formattedValue = value.toFixed(2).replace('.', ',')

  return (
    <div className={cn('', className)}>
      {/* Header com label e valor */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/50">{label}</span>
        <span className="text-[13px] font-medium text-white">
          {formattedValue}%
        </span>
      </div>

      {/* Barra de progresso */}
      <div className="h-1 rounded-sm overflow-hidden bg-white/[0.04]">
        <div
          className="h-full rounded-sm transition-all duration-700 ease-out"
          style={{
            width: `${Math.min(value, 100)}%`,
            background: color,
          }}
        />
      </div>
    </div>
  )
}
