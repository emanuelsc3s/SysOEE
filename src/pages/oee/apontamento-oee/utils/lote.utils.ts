import { DadosLote, LoteProducao, LoteSupabase, TotaisLote } from '../types/lote.types'

export interface ResultadoValidacaoLote {
  valido: boolean
  mensagem?: string
}

export const normalizarNumero = (valor: number | string | null | undefined): number => {
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : 0
  }

  if (typeof valor === 'string') {
    const numero = Number(valor.replace(',', '.'))
    return Number.isFinite(numero) ? numero : 0
  }

  return 0
}

export const limparHoraDigitada = (valor: string): string => {
  const numeros = valor.replace(/\D/g, '').slice(0, 4)

  if (!numeros) {
    return ''
  }

  if (numeros.length <= 2) {
    return numeros.length === 2 ? `${numeros}:` : numeros
  }

  const horas = numeros.slice(0, 2)
  const minutos = numeros.slice(2, 4)
  return `${horas}:${minutos}`
}

export const normalizarHoraDigitada = (valor: string, permitirSomenteHora = false): string => {
  const valorLimpo = valor.replace(/[^\d:]/g, '')
  const partes = valorLimpo.split(':')

  if (partes.length > 1) {
    const horasTexto = (partes[0] || '').slice(0, 2)
    const minutosTexto = (partes[1] || '').slice(0, 2)

    if (!horasTexto) {
      return ''
    }

    const horas = Number(horasTexto)
    if (Number.isNaN(horas) || horas > 23) {
      return ''
    }

    if (!minutosTexto) {
      if (!permitirSomenteHora) {
        return ''
      }

      return `${String(horas).padStart(2, '0')}:00`
    }

    const minutos = Number(minutosTexto.padStart(2, '0'))
    if (Number.isNaN(minutos) || minutos > 59) {
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
    if (Number.isNaN(horas) || horas > 23) {
      return ''
    }

    return `${String(horas).padStart(2, '0')}:00`
  }

  const horas = Number(numeros.slice(0, 2))
  const minutos = Number(numeros.slice(2).padEnd(2, '0'))
  if (Number.isNaN(horas) || Number.isNaN(minutos) || horas > 23 || minutos > 59) {
    return ''
  }

  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`
}

export const normalizarHoraParaBanco = (hora: string): string => {
  if (!hora) {
    return ''
  }

  return hora.length === 5 ? `${hora}:00` : hora
}

export const formatarDataDigitada = (valor: string): string => {
  const numeros = valor.replace(/\D/g, '').slice(0, 8)
  const dia = numeros.slice(0, 2)
  const mes = numeros.slice(2, 4)
  const ano = numeros.slice(4, 8)
  const partes = []

  if (dia) partes.push(dia)
  if (mes) partes.push(mes)
  if (ano) partes.push(ano)

  return partes.join('/')
}

export const converterDataBrParaIso = (dataBr: string): string => {
  const partes = dataBr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)

  if (!partes) {
    return ''
  }

  const dia = Number(partes[1])
  const mes = Number(partes[2])
  const ano = Number(partes[3])

  if (Number.isNaN(dia) || Number.isNaN(mes) || Number.isNaN(ano)) {
    return ''
  }

  if (mes < 1 || mes > 12) {
    return ''
  }

  const data = new Date(ano, mes - 1, dia)

  if (
    Number.isNaN(data.getTime())
    || data.getFullYear() !== ano
    || data.getMonth() !== mes - 1
    || data.getDate() !== dia
  ) {
    return ''
  }

  return `${String(ano).padStart(4, '0')}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

export const formatarDataIsoParaBr = (dataIso: string): string => {
  if (!dataIso) {
    return ''
  }

  if (dataIso.includes('/')) {
    return dataIso
  }

  const partes = dataIso.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (!partes) {
    return dataIso
  }

  const ano = partes[1]
  const mes = partes[2]
  const dia = partes[3]

  return `${dia}/${mes}/${ano}`
}

export const validarDadosLote = (dadosLote: DadosLote): ResultadoValidacaoLote => {
  if (!dadosLote.numeroLote.trim()) {
    return { valido: false, mensagem: 'Informe o número do lote.' }
  }

  if (!dadosLote.data || !dadosLote.fabricacao || !dadosLote.validade) {
    return { valido: false, mensagem: 'Preencha Data de Produção, Fabricação e Validade.' }
  }

  const horaInicialNormalizada = normalizarHoraDigitada(dadosLote.horaInicial, true)
  const horaFinalNormalizada = normalizarHoraDigitada(dadosLote.horaFinal, true)

  if (!horaInicialNormalizada || !horaFinalNormalizada) {
    return { valido: false, mensagem: 'Informe Hora Inicial e Hora Final no formato 24h.' }
  }

  if (dadosLote.quantidadeProduzidaInicial < 0 || dadosLote.quantidadeProduzidaFinal < 0 || dadosLote.quantidadePerdas < 0) {
    return { valido: false, mensagem: 'Quantidades não podem ser negativas.' }
  }

  const dataFabricacao = new Date(`${dadosLote.fabricacao}T00:00:00`)
  const dataValidade = new Date(`${dadosLote.validade}T00:00:00`)

  if (!Number.isNaN(dataFabricacao.getTime()) && !Number.isNaN(dataValidade.getTime()) && dataValidade < dataFabricacao) {
    return { valido: false, mensagem: 'A validade não pode ser anterior à fabricação.' }
  }

  return { valido: true }
}

export const mapearLoteSupabase = (registro: LoteSupabase): LoteProducao => {
  const quantidadeInicial = normalizarNumero(registro.qtd_inicial)
  const quantidadeFinal = normalizarNumero(registro.qtd_final)
  const quantidadePerdas = normalizarNumero(registro.perda)
  const quantidadeProduzida = registro.qtd_produzida === null || registro.qtd_produzida === undefined
    ? Math.abs(quantidadeFinal - quantidadeInicial)
    : normalizarNumero(registro.qtd_produzida)

  const totalProducao = registro.total_producao === null || registro.total_producao === undefined
    ? quantidadeProduzida - quantidadePerdas
    : normalizarNumero(registro.total_producao)

  const dataRegistro = registro.data || ''
  const fabricacaoRegistro = registro.fabricacao || ''
  const validadeRegistro = registro.validade || ''

  return {
    id: String(registro.oeeturnolote_id),
    numeroLote: registro.lote || '',
    data: dataRegistro || fabricacaoRegistro,
    fabricacao: fabricacaoRegistro || dataRegistro,
    validade: validadeRegistro || dataRegistro,
    horaInicial: registro.hora_inicio ? registro.hora_inicio.substring(0, 5) : '',
    horaFinal: registro.hora_fim ? registro.hora_fim.substring(0, 5) : '',
    quantidadePerdas,
    quantidadeProduzidaInicial: quantidadeInicial,
    quantidadeProduzidaFinal: quantidadeFinal,
    quantidadeProduzida,
    totalProducao,
  }
}

export const ordenarLotesPorHora = (lotes: LoteProducao[]): LoteProducao[] => {
  return [...lotes].sort((a, b) => a.horaInicial.localeCompare(b.horaInicial))
}

export const calcularTotaisLotes = (lotes: LoteProducao[]): TotaisLote => {
  return lotes.reduce(
    (acc, lote) => ({
      totalProduzidoInicial: acc.totalProduzidoInicial + lote.quantidadeProduzidaInicial,
      totalProduzidoFinal: acc.totalProduzidoFinal + lote.quantidadeProduzidaFinal,
      totalProduzido: acc.totalProduzido + lote.quantidadeProduzida,
      totalPerdas: acc.totalPerdas + lote.quantidadePerdas,
      totalProducao: acc.totalProducao + lote.totalProducao,
    }),
    {
      totalProduzidoInicial: 0,
      totalProduzidoFinal: 0,
      totalProduzido: 0,
      totalPerdas: 0,
      totalProducao: 0,
    }
  )
}
