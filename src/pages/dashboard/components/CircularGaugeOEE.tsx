/**
 * CircularGaugeOEE - Gauge circular com efeito de glow
 * Exibe o valor do OEE em formato circular com animação
 */

import { cn } from '@/lib/utils'
import { getOEEStatusColors } from '../constants/oee-theme'
import type { CircularGaugeOEEProps } from '../types/dashboard.types'

export function CircularGaugeOEE({
  value,
  size = 120,
  className,
}: CircularGaugeOEEProps) {
  const status = getOEEStatusColors(value)
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (value / 100) * circumference

  // Formata o valor com vírgula (pt-BR)
  const formattedValue = value.toFixed(1).replace('.', ',')

  return (
    <div
      className={cn('relative', className)}
      style={{ width: size, height: size }}
    >
      {/* Glow effect */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[20px]"
        style={{
          width: 90,
          height: 90,
          background: status.glow,
        }}
      />

      {/* SVG do gauge */}
      <svg
        width={size}
        height={size}
        className="-rotate-90"
      >
        {/* Trilho de fundo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={8}
        />
        {/* Arco de progresso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={status.stroke}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>

      {/* Texto central */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <span className="text-[26px] font-semibold tracking-tight text-white">
          {formattedValue}
          <span className="ml-0.5 text-[13px] font-normal text-white/30">%</span>
        </span>
      </div>
    </div>
  )
}
