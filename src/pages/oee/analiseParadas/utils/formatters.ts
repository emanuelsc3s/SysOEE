const formatadorNumeroInteiro = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const formatadorDecimal = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const formatadorHoraAtualizacao = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

/**
 * Normaliza valores numéricos vindos da API/RPC.
 */
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

export const formatarNumeroInteiro = (valor: number): string => {
  if (!Number.isFinite(valor)) {
    return '0'
  }
  return formatadorNumeroInteiro.format(Math.round(valor))
}

export const formatarDecimal = (valor: number): string => {
  if (!Number.isFinite(valor)) {
    return '0,00'
  }
  return formatadorDecimal.format(valor)
}

export const formatarPercentual = (valor: number): string => {
  return `${formatarDecimal(valor)}%`
}

export const formatarHoras = (horas: number): string => {
  if (!Number.isFinite(horas)) {
    return '0,00 h'
  }
  return `${formatarDecimal(horas)} h`
}

export const formatarMinutosHHMM = (minutos: number): string => {
  if (!Number.isFinite(minutos)) {
    return '00:00'
  }
  const total = Math.max(0, Math.round(minutos))
  const horas = Math.floor(total / 60)
  const resto = total % 60
  return `${String(horas).padStart(2, '0')}:${String(resto).padStart(2, '0')}`
}

export const formatarDataCurta = (valorData: string): string => {
  const texto = valorData.trim()
  if (!texto) {
    return 'Sem data'
  }

  const matchIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!matchIso) {
    return texto
  }

  return `${matchIso[3]}/${matchIso[2]}`
}

export const formatarDataHoraAtualizacao = (timestamp: number): string => {
  if (!timestamp || Number.isNaN(timestamp)) {
    return '-'
  }
  return formatadorHoraAtualizacao.format(new Date(timestamp))
}

export const truncarTexto = (valor: string, limite = 26): string => {
  const texto = valor.trim()
  if (texto.length <= limite) {
    return texto
  }
  return `${texto.slice(0, limite).trimEnd()}…`
}
