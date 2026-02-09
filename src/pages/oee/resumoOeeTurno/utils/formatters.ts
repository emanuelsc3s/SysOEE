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

const MINUTOS_POR_HORA = 60
const MINUTOS_POR_DIA = 24 * MINUTOS_POR_HORA
const MINUTOS_POR_MES = 30 * MINUTOS_POR_DIA
const MINUTOS_POR_ANO = 365 * MINUTOS_POR_DIA

const formatarParteTempo = (quantidade: number, singular: string, plural: string): string => {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`
}

const juntarPartesTempo = (partes: string[]): string => {
  if (partes.length === 0) {
    return '0min'
  }
  if (partes.length === 1) {
    return partes[0]
  }
  if (partes.length === 2) {
    return `${partes[0]} e ${partes[1]}`
  }
  return `${partes.slice(0, -1).join(', ')} e ${partes[partes.length - 1]}`
}

export const formatarPeriodoMinutos = (minutos: number): string => {
  if (!Number.isFinite(minutos)) return '0min'

  let restante = Math.max(0, Math.round(minutos))
  const partes: string[] = []

  const anos = Math.floor(restante / MINUTOS_POR_ANO)
  if (anos > 0) {
    partes.push(formatarParteTempo(anos, 'ano', 'anos'))
    restante -= anos * MINUTOS_POR_ANO
  }

  // Mês fixo de 30 dias para uma representação estável do total acumulado.
  const meses = Math.floor(restante / MINUTOS_POR_MES)
  if (meses > 0) {
    partes.push(formatarParteTempo(meses, 'mês', 'meses'))
    restante -= meses * MINUTOS_POR_MES
  }

  const dias = Math.floor(restante / MINUTOS_POR_DIA)
  if (dias > 0) {
    partes.push(formatarParteTempo(dias, 'dia', 'dias'))
    restante -= dias * MINUTOS_POR_DIA
  }

  const horas = Math.floor(restante / MINUTOS_POR_HORA)
  if (horas > 0) {
    partes.push(`${horas}h`)
    restante -= horas * MINUTOS_POR_HORA
  }

  if (restante > 0 || partes.length === 0) {
    partes.push(`${restante}min`)
  }

  return juntarPartesTempo(partes)
}

export const formatarStatus = (status?: string | null): string => {
  const valor = (status || '').trim()
  if (!valor) return '-'
  return valor.replace(/_/g, ' ')
}

export const getBadgeStatus = (status: string | null | undefined): BadgeStatusVariant => {
  const valor = (status || '').toUpperCase()
  if (valor.includes('PARADA')) return 'destructive'
  if (valor.includes('FECHADA')) return 'success'
  if (valor.includes('CANCELADA')) return 'destructive'
  if (valor.includes('EM_PRODUCAO')) return 'info'
  if (valor.includes('ABERTO')) return 'info'
  return 'secondary'
}

export const obterStatusPrioritario = (statuses: string[]): string => {
  const valores = statuses.map((status) => (status || '').toUpperCase())

  if (valores.some((status) => status.includes('PARADA'))) {
    return 'Parada'
  }
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
