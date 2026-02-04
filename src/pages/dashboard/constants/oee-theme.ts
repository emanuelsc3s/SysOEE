/**
 * Constantes de cores e thresholds para o Dashboard OEE
 * Design System Premium - SICFAR OEE
 */

// Cores do Design System
export const OEE_COLORS = {
  // Cores de fundo
  bgPrimary: '#0a0a0c',
  bgCard: 'rgba(255,255,255,0.02)',
  bgCardSecondary: 'rgba(255,255,255,0.02)',

  // Cores de status OEE
  success: '#34d399',
  warning: '#fbbf24',
  critical: '#f87171',

  // Cores auxiliares
  blue: '#60a5fa',
  purple: '#a78bfa',

  // Cores das métricas OEE
  metricDisponibilidade: 'rgba(96, 165, 250, 0.8)',
  metricPerformance: 'rgba(74, 222, 128, 0.8)',
  metricQualidade: 'rgba(251, 191, 36, 0.8)',

  // Cores de texto
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.7)',
  textMuted: 'rgba(255,255,255,0.4)',
  textFaint: 'rgba(255,255,255,0.3)',

  // Bordas
  border: 'rgba(255,255,255,0.06)',
  borderLight: 'rgba(255,255,255,0.04)',

  // Glow effects
  glowSuccess: 'rgba(52, 211, 153, 0.15)',
  glowWarning: 'rgba(251, 191, 36, 0.15)',
  glowCritical: 'rgba(248, 113, 113, 0.15)',
} as const

// Thresholds de OEE para cores
export const OEE_THRESHOLDS = {
  success: 80, // >= 80% = verde
  warning: 60, // >= 60% = amarelo
  // < 60% = vermelho (critical)
} as const

// Classes Tailwind para cores de status
export const OEE_STATUS_CLASSES = {
  success: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-400',
    border: 'border-emerald-400',
  },
  warning: {
    text: 'text-amber-400',
    bg: 'bg-amber-400',
    border: 'border-amber-400',
  },
  critical: {
    text: 'text-red-400',
    bg: 'bg-red-400',
    border: 'border-red-400',
  },
} as const

/**
 * Retorna as cores de status baseado no valor do OEE
 */
export function getOEEStatusColors(value: number) {
  if (value >= OEE_THRESHOLDS.success) {
    return {
      stroke: OEE_COLORS.success,
      glow: OEE_COLORS.glowSuccess,
      status: 'success' as const,
    }
  }
  if (value >= OEE_THRESHOLDS.warning) {
    return {
      stroke: OEE_COLORS.warning,
      glow: OEE_COLORS.glowWarning,
      status: 'warning' as const,
    }
  }
  return {
    stroke: OEE_COLORS.critical,
    glow: OEE_COLORS.glowCritical,
    status: 'critical' as const,
  }
}
