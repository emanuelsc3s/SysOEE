import { format } from 'date-fns'

const formatadorDataPtBr = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

/**
 * Formata texto digitado no campo de data para o padrão dd/mm/aaaa.
 */
export const formatarDataDigitada = (valor: string): string => {
  const texto = valor.trim()
  const matchIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (matchIso) {
    return `${matchIso[3]}/${matchIso[2]}/${matchIso[1]}`
  }

  const numeros = texto.replace(/\D/g, '').slice(0, 8)
  if (!numeros) {
    return ''
  }

  const partes: string[] = []
  partes.push(numeros.slice(0, 2))
  if (numeros.length > 2) {
    partes.push(numeros.slice(2, 4))
  }
  if (numeros.length > 4) {
    partes.push(numeros.slice(4, 8))
  }
  return partes.join('/')
}

/**
 * Converte string de data (dd/mm/aaaa ou yyyy-mm-dd) para objeto Date.
 */
export const parseDataParaDate = (valor: string): Date | undefined => {
  const texto = valor.trim()
  if (!texto) {
    return undefined
  }

  const matchBr = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  const matchIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  const dia = matchBr ? Number(matchBr[1]) : matchIso ? Number(matchIso[3]) : Number.NaN
  const mes = matchBr ? Number(matchBr[2]) : matchIso ? Number(matchIso[2]) : Number.NaN
  const ano = matchBr ? Number(matchBr[3]) : matchIso ? Number(matchIso[1]) : Number.NaN

  if (!Number.isFinite(dia) || !Number.isFinite(mes) || !Number.isFinite(ano)) {
    return undefined
  }

  const data = new Date(ano, mes - 1, dia)
  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {
    return undefined
  }

  return data
}

/**
 * Converte data no formato dd/mm/aaaa para yyyy-mm-dd (ISO) para consultas.
 */
export const converterDataBrParaIso = (valor: string): string | undefined => {
  const texto = valor.trim()
  if (!texto) {
    return undefined
  }

  const matchIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (matchIso) {
    return texto
  }

  const matchBr = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!matchBr) {
    return undefined
  }

  const dia = Number(matchBr[1])
  const mes = Number(matchBr[2])
  const ano = Number(matchBr[3])
  const data = new Date(ano, mes - 1, dia)

  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {
    return undefined
  }

  return `${matchBr[3]}-${matchBr[2]}-${matchBr[1]}`
}

/**
 * Retorna a data atual no formato dd/mm/aaaa.
 */
export const obterDataAtualFormatada = (): string => {
  return format(new Date(), 'dd/MM/yyyy')
}

/**
 * Formata data ISO para exibição em pt-BR.
 */
export const formatarDataExibicao = (dataISO?: string | null): string => {
  if (!dataISO) {
    return '-'
  }

  const texto = dataISO.trim()
  if (!texto) {
    return '-'
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) {
    return texto
  }

  const apenasData = texto.split('T')[0]
  const matchIso = apenasData.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (matchIso) {
    const ano = Number(matchIso[1])
    const mes = Number(matchIso[2])
    const dia = Number(matchIso[3])
    const data = new Date(Date.UTC(ano, mes - 1, dia))
    return formatadorDataPtBr.format(data)
  }

  const data = new Date(texto)
  if (Number.isNaN(data.getTime())) {
    return texto
  }

  return formatadorDataPtBr.format(data)
}
