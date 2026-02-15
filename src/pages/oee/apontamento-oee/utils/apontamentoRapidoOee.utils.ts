import type { JanelaHoraOEE, RegistroProducaoRapidoOEE } from '../types/apontamentoRapidoOee.types'

type HoraMinuto = {
  hora: number
  minuto: number
}

const HORA_REGEX = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/
const TOTAL_MAXIMO_DIGITOS_PERDA = 15
const MAXIMO_DECIMAIS_PERDA = 4

const parseHoraMinuto = (valor: string): HoraMinuto | null => {
  const texto = (valor || '').trim()
  const match = texto.match(HORA_REGEX)
  if (!match) {
    return null
  }

  const hora = Number(match[1])
  const minuto = Number(match[2])

  if (!Number.isFinite(hora) || !Number.isFinite(minuto) || hora < 0 || hora > 23 || minuto < 0 || minuto > 59) {
    return null
  }

  return { hora, minuto }
}

const formatarHora = (hora: number, minuto: number): string => {
  return `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`
}

const formatarHoraPorMinutoAbsoluto = (minutoAbsoluto: number): string => {
  const minutoNoDia = ((minutoAbsoluto % 1440) + 1440) % 1440
  const hora = Math.floor(minutoNoDia / 60)
  const minuto = minutoNoDia % 60
  return formatarHora(hora, minuto)
}

export const limparHoraDigitadaOEE = (valor: string): string => {
  const numeros = (valor || '').replace(/\D/g, '').slice(0, 4)
  if (!numeros) {
    return ''
  }

  if (numeros.length <= 2) {
    return numeros.length === 2 ? `${numeros}:` : numeros
  }

  return `${numeros.slice(0, 2)}:${numeros.slice(2)}`
}

export const normalizarHora24hOEE = (valor: string, permitirSomenteHora = true): string => {
  const valorLimpo = (valor || '').replace(/[^\d:]/g, '')
  const partes = valorLimpo.split(':')

  if (partes.length > 1) {
    const horasTexto = (partes[0] || '').slice(0, 2)
    const minutosTexto = (partes[1] || '').slice(0, 2)

    if (!horasTexto) {
      return ''
    }

    const horas = Number(horasTexto)
    if (!Number.isFinite(horas) || horas < 0 || horas > 23) {
      return ''
    }

    if (!minutosTexto) {
      if (!permitirSomenteHora) {
        return ''
      }
      return `${String(horas).padStart(2, '0')}:00`
    }

    const minutos = Number(minutosTexto)
    if (!Number.isFinite(minutos) || minutos < 0 || minutos > 59) {
      return ''
    }

    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`
  }

  const numeros = valorLimpo.replace(/\D/g, '').slice(0, 4)
  if (!numeros) {
    return ''
  }

  if (numeros.length <= 2) {
    if (!permitirSomenteHora) {
      return ''
    }
    const horas = Number(numeros)
    if (!Number.isFinite(horas) || horas < 0 || horas > 23) {
      return ''
    }
    return `${String(horas).padStart(2, '0')}:00`
  }

  const horas = Number(numeros.slice(0, 2))
  const minutos = Number(numeros.slice(2).padEnd(2, '0'))
  if (!Number.isFinite(horas) || !Number.isFinite(minutos) || horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
    return ''
  }

  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`
}

export const normalizarHoraBancoOEE = (hora: string): string => {
  const base = normalizarHora24hOEE(hora, true)
  if (!base) {
    return ''
  }
  return `${base}:00`
}

export const extrairHoraMinutoOEE = (hora: string): string => {
  const parsed = parseHoraMinuto(hora)
  if (!parsed) {
    return ''
  }
  return formatarHora(parsed.hora, parsed.minuto)
}

export const calcularDuracaoMinutosComViradaOEE = (horaInicial: string, horaFinal: string): number | null => {
  const inicio = parseHoraMinuto(horaInicial)
  const fim = parseHoraMinuto(horaFinal)

  if (!inicio || !fim) {
    return null
  }

  const minutosInicio = inicio.hora * 60 + inicio.minuto
  let minutosFim = fim.hora * 60 + fim.minuto
  if (minutosFim < minutosInicio) {
    minutosFim += 24 * 60
  }

  return minutosFim - minutosInicio
}

export const formatarDuracaoMinutosOEE = (duracaoMinutos: number | null): string => {
  if (!Number.isFinite(duracaoMinutos) || duracaoMinutos === null || duracaoMinutos <= 0) {
    return ''
  }

  const totalMinutos = Math.floor(duracaoMinutos)
  const horas = Math.floor(totalMinutos / 60)
  const minutos = totalMinutos % 60
  return `${horas}h ${minutos}min (${totalMinutos} minutos)`
}

export const gerarJanelasHoraAHoraOEE = (horaInicio: string | null, horaFim: string | null): JanelaHoraOEE[] => {
  if (!horaInicio || !horaFim) {
    return []
  }

  const inicio = parseHoraMinuto(horaInicio)
  const fim = parseHoraMinuto(horaFim)
  if (!inicio || !fim) {
    return []
  }

  let minutoAtual = inicio.hora * 60 + inicio.minuto
  let minutoFimTurno = fim.hora * 60 + fim.minuto
  if (minutoFimTurno < minutoAtual) {
    minutoFimTurno += 24 * 60
  }

  if (minutoFimTurno === minutoAtual) {
    return []
  }

  const janelas: JanelaHoraOEE[] = []
  while (minutoAtual < minutoFimTurno) {
    const proximoMinuto = Math.min(minutoAtual + 60, minutoFimTurno)
    const horaInicioJanela = formatarHoraPorMinutoAbsoluto(minutoAtual)
    const horaFimJanela = formatarHoraPorMinutoAbsoluto(proximoMinuto)
    janelas.push({
      chave: `${horaInicioJanela}-${horaFimJanela}`,
      horaInicio: horaInicioJanela,
      horaFim: horaFimJanela
    })
    minutoAtual = proximoMinuto
  }

  return janelas
}

export const identificarJanelasFaltantesOEE = (
  janelas: JanelaHoraOEE[],
  producoes: RegistroProducaoRapidoOEE[]
): JanelaHoraOEE[] => {
  const chavesJaApontadas = new Set<string>()
  const iniciosJaApontados = new Set<string>()

  producoes.forEach((registro) => {
    const horaInicio = extrairHoraMinutoOEE(registro.hora_inicio || '')
    const horaFim = extrairHoraMinutoOEE(registro.hora_final || '')

    if (horaInicio) {
      iniciosJaApontados.add(horaInicio)
    }

    if (horaInicio && horaFim) {
      chavesJaApontadas.add(`${horaInicio}-${horaFim}`)
    }
  })

  return janelas.filter((janela) =>
    !chavesJaApontadas.has(janela.chave) && !iniciosJaApontados.has(janela.horaInicio)
  )
}

export const normalizarPerdaPtBrRapidoOEE = (valor: string): {
  formatado: string
  valorNumero: number
  valorNormalizado: string
} => {
  const textoEntrada = valor || ''
  if (!textoEntrada) {
    return {
      formatado: '',
      valorNumero: Number.NaN,
      valorNormalizado: ''
    }
  }

  const somenteNumerosEVirgula = textoEntrada.replace(/[^\d,]/g, '')
  const partes = somenteNumerosEVirgula.split(',')
  const temVirgula = partes.length > 1

  let inteiroNumeros = (partes[0] || '').replace(/^0+(?=\d)/, '')
  let decimaisNumeros = temVirgula ? partes.slice(1).join('') : ''

  if (inteiroNumeros.length > TOTAL_MAXIMO_DIGITOS_PERDA) {
    inteiroNumeros = inteiroNumeros.slice(0, TOTAL_MAXIMO_DIGITOS_PERDA)
  }

  const maxDecimaisDisponiveis = Math.max(TOTAL_MAXIMO_DIGITOS_PERDA - inteiroNumeros.length, 0)
  const limiteDecimais = Math.min(MAXIMO_DECIMAIS_PERDA, maxDecimaisDisponiveis)
  if (decimaisNumeros.length > limiteDecimais) {
    decimaisNumeros = decimaisNumeros.slice(0, limiteDecimais)
  }

  if (!inteiroNumeros && temVirgula) {
    inteiroNumeros = '0'
  }

  const inteiroFormatado = inteiroNumeros
    ? inteiroNumeros.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    : ''

  const formatado = temVirgula
    ? `${inteiroFormatado || '0'},${decimaisNumeros}`
    : inteiroFormatado

  if (!inteiroNumeros && !decimaisNumeros) {
    return {
      formatado,
      valorNumero: Number.NaN,
      valorNormalizado: ''
    }
  }

  const valorNormalizado = decimaisNumeros
    ? `${inteiroNumeros || '0'}.${decimaisNumeros}`
    : `${inteiroNumeros || '0'}`
  const valorNumero = Number(valorNormalizado)

  return {
    formatado,
    valorNumero,
    valorNormalizado
  }
}
