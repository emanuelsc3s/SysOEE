/**
 * SummaryCard - Card de resumo para KPIs do dashboard
 * Exibe totais consolidados como Produção, Perdas, OEE Médio
 */

import { cn } from '@/lib/utils'
import { OEE_COLORS } from '../constants/oee-theme'
import type { SummaryCardProps, SummaryCardAccent } from '../types/dashboard.types'

// Mapeamento de accent para cores
const accentColorMap: Record<SummaryCardAccent, string> = {
  success: OEE_COLORS.success,
  warning: OEE_COLORS.warning,
  purple: OEE_COLORS.purple,
  default: OEE_COLORS.textPrimary,
}

export function SummaryCard({
  label,
  value,
  unit,
  accentColor = 'default',
  className,
}: SummaryCardProps) {
  const color = accentColorMap[accentColor]

  return (
    <div
      className={cn(
        'rounded-2xl p-6 border font-sans',
        'bg-white/[0.02] border-white/[0.04]',
        className
      )}
    >
      {/* Label */}
      <p className="text-xs text-white/40 mb-3">{label}</p>

      {/* Valor e unidade */}
      <div className="flex items-baseline gap-2">
        <span
          className="text-[28px] font-semibold tracking-tight"
          style={{ color }}
        >
          {value}
        </span>
        <span className="text-[13px] text-white/30">{unit}</span>
      </div>
    </div>
  )
}
