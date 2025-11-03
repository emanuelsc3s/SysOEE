/**
 * Utilitários para manipulação de horas no formato HH:MM
 * Usado para acumular tempo de paradas nas OPs
 */

/**
 * Converte string HH:MM para minutos totais
 * @param horaStr - String no formato "HH:MM" (ex: "17:14")
 * @returns Número total de minutos
 */
export function horaParaMinutos(horaStr: string): number {
  if (!horaStr || typeof horaStr !== 'string') {
    return 0
  }

  const partes = horaStr.split(':')
  if (partes.length < 2) {
    return 0
  }

  const horas = parseInt(partes[0], 10) || 0
  const minutos = parseInt(partes[1], 10) || 0

  return horas * 60 + minutos
}

/**
 * Converte minutos totais para string HH:MM
 * @param minutos - Número total de minutos
 * @returns String no formato "HH:MM"
 */
export function minutosParaHora(minutos: number): string {
  if (!minutos || isNaN(minutos) || minutos < 0) {
    return '00:00'
  }

  const horas = Math.floor(minutos / 60)
  const mins = Math.floor(minutos % 60)

  return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

/**
 * Soma duas horas no formato HH:MM
 * @param hora1 - Primeira hora no formato "HH:MM"
 * @param hora2 - Segunda hora no formato "HH:MM"
 * @returns Soma das horas no formato "HH:MM"
 */
export function somarHoras(hora1: string, hora2: string): string {
  const minutos1 = horaParaMinutos(hora1)
  const minutos2 = horaParaMinutos(hora2)
  const total = minutos1 + minutos2

  return minutosParaHora(total)
}

/**
 * Subtrai duas horas no formato HH:MM
 * @param hora1 - Primeira hora no formato "HH:MM"
 * @param hora2 - Segunda hora no formato "HH:MM" (será subtraída)
 * @returns Diferença das horas no formato "HH:MM" (mínimo 00:00)
 */
export function subtrairHoras(hora1: string, hora2: string): string {
  const minutos1 = horaParaMinutos(hora1)
  const minutos2 = horaParaMinutos(hora2)
  const diferenca = Math.max(0, minutos1 - minutos2)

  return minutosParaHora(diferenca)
}

/**
 * Converte duração em minutos (decimal) para formato HH:MM
 * Usado para converter duracao_minutos das paradas
 * @param duracaoMinutos - Duração em minutos (pode ter decimais para segundos)
 * @returns String no formato "HH:MM"
 */
export function duracaoParaHora(duracaoMinutos: number): string {
  if (!duracaoMinutos || isNaN(duracaoMinutos) || duracaoMinutos < 0) {
    return '00:00'
  }

  // Arredonda para o minuto mais próximo
  const minutosArredondados = Math.round(duracaoMinutos)
  return minutosParaHora(minutosArredondados)
}

/**
 * Formata duração em minutos para exibição legível
 * @param minutos - Número de minutos
 * @returns String formatada (ex: "2h 30min", "45min", "1h")
 */
export function formatarDuracaoLegivel(minutos: number): string {
  if (!minutos || isNaN(minutos) || minutos < 0) {
    return '0min'
  }

  const horas = Math.floor(minutos / 60)
  const mins = Math.floor(minutos % 60)

  if (horas === 0) {
    return `${mins}min`
  }

  if (mins === 0) {
    return `${horas}h`
  }

  return `${horas}h ${mins}min`
}

/**
 * Valida se uma string está no formato HH:MM válido
 * @param horaStr - String a ser validada
 * @returns true se válido, false caso contrário
 */
export function validarFormatoHora(horaStr: string): boolean {
  if (!horaStr || typeof horaStr !== 'string') {
    return false
  }

  const regex = /^([0-9]{1,2}):([0-5][0-9])$/
  const match = horaStr.match(regex)

  if (!match) {
    return false
  }

  const horas = parseInt(match[1], 10)
  const minutos = parseInt(match[2], 10)

  return horas >= 0 && minutos >= 0 && minutos < 60
}

