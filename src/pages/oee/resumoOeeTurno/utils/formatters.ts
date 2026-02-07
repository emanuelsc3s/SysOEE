import type { BadgeStatusVariant } from '../types'

export const normalizarNumero = (valor: number | string | null | undefined): number => {
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : 0
  }

  if (valor === null || valor === undefined) {
    return 0
  }

  if (typeof valor === 'string') {
    const limpo = valor.trim().replace('%', '').replace(/\s+/g, '')
    if (!limpo) {
      return 0
    }

    if (limpo.includes(',') && limpo.includes('.')) {
      const normalizado = limpo.replace(/\./g, '').replace(',', '.')
      const parsed = Number.parseFloat(normalizado)
      return Number.isFinite(parsed) ? parsed : 0
    }

    if (limpo.includes(',')) {
      const parsed = Number.parseFloat(limpo.replace(',', '.'))
      return Number.isFinite(parsed) ? parsed : 0
    }

    const parsed = Number.parseFloat(limpo)
    return Number.isFinite(parsed) ? parsed : 0
  }

  const parsed = Number(valor)
  return Number.isFinite(parsed) ? parsed : 0
}

export const formatarQuantidade = (valor: number): string => {
  if (!Number.isFinite(valor)) return '0'
  return Math.round(valor).toLocaleString('pt-BR')
}

export const formatarDecimal = (valor: number, casas = 2): string => {
  if (!Number.isFinite(valor)) return '0'
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
}

export const formatarMinutos = (minutos: number): string => {
  if (!Number.isFinite(minutos)) return '00:00'
  const total = Math.max(0, Math.round(minutos))
  const horas = Math.floor(total / 60)
  const resto = total % 60
  return `${String(horas).padStart(2, '0')}:${String(resto).padStart(2, '0')}`
}

export const formatarStatus = (status?: string | null): string => {
  const valor = (status || '').trim()
  if (!valor) return '-'
  return valor.replace(/_/g, ' ')
}

export const getBadgeStatus = (status: string | null | undefined): BadgeStatusVariant => {
  const valor = (status || '').toUpperCase()
  if (valor.includes('FECHADA')) return 'success'
  if (valor.includes('CANCELADA')) return 'destructive'
  if (valor.includes('EM_PRODUCAO')) return 'info'
  if (valor.includes('ABERTO')) return 'info'
  return 'secondary'
}

export const obterStatusPrioritario = (statuses: string[]): string => {
  const valores = statuses.map((status) => (status || '').toUpperCase())

  if (valores.some((status) => status.includes('EM_PRODUCAO') || status.includes('ABERTO'))) {
    return 'EM_PRODUCAO'
  }
  if (valores.some((status) => status.includes('FECHADA') || status.includes('FECHADO'))) {
    return 'FECHADA'
  }
  if (valores.some((status) => status.includes('CANCELADA') || status.includes('CANCELADO'))) {
    return 'CANCELADA'
  }

  return statuses[0] || 'SEM_STATUS'
}
