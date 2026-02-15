import type {
  AcaoPrioritariaItem,
  AnaliseParadasKpis,
  CadastroParadaRelacionado,
  DistribuicaoClasseItem,
  ParadaNormalizada,
  ParadaTurnoRaw,
  ParetoParadaItem,
  ResumoOeeTurnoRpcRow,
  TendenciaParadasItem,
  TopLinhaItem,
  TopNaturezaItem,
  TotaisResumoRpc,
  TurnoFiltrado,
} from '../types'
import { formatarDataCurta, formatarMinutosHHMM, formatarPercentual, normalizarNumero } from './formatters'

const SEGUNDOS_DIA = 24 * 60 * 60
const LIMITE_PARADA_PEQUENA_MINUTOS = 10

const removerAcentos = (valor: string): string => {
  return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const normalizarTexto = (valor?: string | null): string => {
  return removerAcentos((valor || '').trim().toLowerCase())
}

const valorOuFallback = (valor: string | null | undefined, fallback: string): string => {
  const texto = (valor || '').trim()
  return texto.length > 0 ? texto : fallback
}

const horaParaSegundos = (valorHora?: string | null): number | null => {
  if (!valorHora) {
    return null
  }

  const match = valorHora.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/)
  if (!match) {
    return null
  }

  const horas = Number(match[1])
  const minutos = Number(match[2])
  const segundos = Number(match[3] || '0')

  if (
    !Number.isFinite(horas) ||
    !Number.isFinite(minutos) ||
    !Number.isFinite(segundos) ||
    horas < 0 ||
    horas > 23 ||
    minutos < 0 ||
    minutos > 59 ||
    segundos < 0 ||
    segundos > 59
  ) {
    return null
  }

  return horas * 3600 + minutos * 60 + segundos
}

/**
 * Replica a lógica da RPC para cálculo de duração de paradas (incluindo virada de dia).
 */
export const calcularDuracaoParadaMinutos = (
  horaInicio?: string | null,
  horaFim?: string | null
): number => {
  const inicioSegundos = horaParaSegundos(horaInicio)
  const fimSegundos = horaParaSegundos(horaFim)

  if (inicioSegundos === null || fimSegundos === null) {
    return 0
  }

  if (fimSegundos > inicioSegundos) {
    return (fimSegundos - inicioSegundos) / 60
  }

  if (fimSegundos === inicioSegundos) {
    return 0
  }

  return ((SEGUNDOS_DIA - inicioSegundos) + fimSegundos) / 60
}

const ehClasseEstrategica = (classe: string): boolean => {
  const classeNormalizada = normalizarTexto(classe)
  return classeNormalizada === 'parada estrategica' || classeNormalizada === 'estrategica'
}

const obterCadastroParada = (
  cadastro: CadastroParadaRelacionado | CadastroParadaRelacionado[] | null | undefined
): CadastroParadaRelacionado | null => {
  if (!cadastro) {
    return null
  }

  if (Array.isArray(cadastro)) {
    return cadastro[0] || null
  }

  return cadastro
}

export const normalizarParadas = (
  paradasRaw: ParadaTurnoRaw[],
  turnos: TurnoFiltrado[],
  produtoFiltroId: number | null
): ParadaNormalizada[] => {
  const turnosPorId = new Map<number, TurnoFiltrado>()
  turnos.forEach((turno) => {
    turnosPorId.set(turno.oeeturno_id, turno)
  })

  const normalizadas: ParadaNormalizada[] = []

  for (const paradaRaw of paradasRaw) {
    const turnoRelacionado = turnosPorId.get(paradaRaw.oeeturno_id)
    if (!turnoRelacionado) {
      continue
    }

    const produtoIdConsolidado = paradaRaw.produto_id ?? turnoRelacionado.produto_id ?? null
    if (produtoFiltroId !== null && produtoIdConsolidado !== produtoFiltroId) {
      continue
    }

    const cadastroParada = obterCadastroParada(paradaRaw.tboee_parada)
    const classeParada = valorOuFallback(cadastroParada?.classe ?? paradaRaw.classe, 'Classe não informada')
    const naturezaParada = valorOuFallback(cadastroParada?.natureza ?? paradaRaw.natureza, 'Natureza não informada')
    const nomeParada = valorOuFallback(cadastroParada?.parada ?? paradaRaw.parada, 'Parada não informada')
    const componenteParada = valorOuFallback(cadastroParada?.componente, 'Componente não informado')
    const duracaoMinutos = calcularDuracaoParadaMinutos(paradaRaw.hora_inicio, paradaRaw.hora_fim)
    const estrategica = ehClasseEstrategica(classeParada)

    normalizadas.push({
      id: paradaRaw.oeeturnoparada_id,
      oeeturnoId: paradaRaw.oeeturno_id,
      data: paradaRaw.data ?? turnoRelacionado.data ?? null,
      linhaproducaoId: turnoRelacionado.linhaproducao_id ?? null,
      linhaproducao: valorOuFallback(turnoRelacionado.linhaproducao, 'Linha não informada'),
      turnoId: turnoRelacionado.turno_id ?? null,
      turno: valorOuFallback(turnoRelacionado.turno, 'Turno não informado'),
      produtoId: produtoIdConsolidado,
      produto: valorOuFallback(paradaRaw.produto ?? turnoRelacionado.produto, 'Produto não informado'),
      oeeparadaId: paradaRaw.oeeparada_id ?? cadastroParada?.oeeparada_id ?? null,
      codigoParada: cadastroParada?.codigo ?? null,
      parada: nomeParada,
      natureza: naturezaParada,
      classe: classeParada,
      componente: componenteParada,
      observacao: paradaRaw.observacao,
      duracaoMinutos,
      estrategica,
      paradaGrande: !estrategica && duracaoMinutos > LIMITE_PARADA_PEQUENA_MINUTOS,
      paradaPequena: !estrategica && duracaoMinutos <= LIMITE_PARADA_PEQUENA_MINUTOS,
    })
  }

  normalizadas.sort((a, b) => {
    const dataA = a.data || ''
    const dataB = b.data || ''
    if (dataA !== dataB) {
      return dataA.localeCompare(dataB)
    }
    if (a.linhaproducao !== b.linhaproducao) {
      return a.linhaproducao.localeCompare(b.linhaproducao, 'pt-BR')
    }
    return a.parada.localeCompare(b.parada, 'pt-BR')
  })

  return normalizadas
}

export const consolidarTotaisResumoRpc = (linhasResumo: ResumoOeeTurnoRpcRow[]): TotaisResumoRpc => {
  const turnos = new Set<number>()
  let paradasGrandesMinutos = 0
  let paradasPequenasMinutos = 0
  let paradasTotaisMinutos = 0
  let paradasEstrategicasMinutos = 0

  for (const linha of linhasResumo) {
    paradasGrandesMinutos += normalizarNumero(linha.paradas_grandes_minutos)
    paradasPequenasMinutos += normalizarNumero(linha.paradas_pequenas_minutos)
    paradasTotaisMinutos += normalizarNumero(linha.paradas_totais_minutos)
    paradasEstrategicasMinutos += normalizarNumero(linha.paradas_estrategicas_minutos)

    if (typeof linha.oeeturno_id === 'number') {
      turnos.add(linha.oeeturno_id)
    }
  }

  return {
    paradasGrandesMinutos,
    paradasPequenasMinutos,
    paradasTotaisMinutos,
    paradasEstrategicasMinutos,
    turnosRegistrados: turnos.size,
  }
}

export const calcularKpisParadas = (
  paradasNormalizadas: ParadaNormalizada[],
  totaisResumoRpc: TotaisResumoRpc
): AnaliseParadasKpis => {
  const rawTotais = paradasNormalizadas.reduce(
    (acc, parada) => {
      acc.total += parada.duracaoMinutos
      if (parada.paradaGrande) {
        acc.grandes += parada.duracaoMinutos
      }
      if (parada.paradaPequena) {
        acc.pequenas += parada.duracaoMinutos
      }
      if (parada.estrategica) {
        acc.estrategicas += parada.duracaoMinutos
      }
      return acc
    },
    {
      total: 0,
      grandes: 0,
      pequenas: 0,
      estrategicas: 0,
    }
  )

  const tempoTotalMinutos = totaisResumoRpc.paradasTotaisMinutos > 0
    ? totaisResumoRpc.paradasTotaisMinutos
    : rawTotais.total

  const tempoGrandesMinutos = totaisResumoRpc.paradasGrandesMinutos > 0
    ? totaisResumoRpc.paradasGrandesMinutos
    : rawTotais.grandes

  const tempoPequenasMinutos = totaisResumoRpc.paradasPequenasMinutos > 0
    ? totaisResumoRpc.paradasPequenasMinutos
    : rawTotais.pequenas

  const tempoEstrategicasMinutos = totaisResumoRpc.paradasEstrategicasMinutos > 0
    ? totaisResumoRpc.paradasEstrategicasMinutos
    : rawTotais.estrategicas

  const turnosComParada = new Set<number>()
  const linhasImpactadas = new Set<number>()
  let ocorrenciasGrandes = 0

  for (const parada of paradasNormalizadas) {
    turnosComParada.add(parada.oeeturnoId)
    if (parada.linhaproducaoId !== null) {
      linhasImpactadas.add(parada.linhaproducaoId)
    }
    if (parada.paradaGrande) {
      ocorrenciasGrandes += 1
    }
  }

  const basePercentual = tempoTotalMinutos > 0 ? tempoTotalMinutos : 1

  return {
    tempoTotalMinutos,
    tempoGrandesMinutos,
    tempoPequenasMinutos,
    tempoEstrategicasMinutos,
    ocorrenciasTotais: paradasNormalizadas.length,
    ocorrenciasGrandes,
    turnosComParada: turnosComParada.size || totaisResumoRpc.turnosRegistrados,
    linhasImpactadas: linhasImpactadas.size,
    indiceGrandesPercentual: (tempoGrandesMinutos / basePercentual) * 100,
    indicePequenasPercentual: (tempoPequenasMinutos / basePercentual) * 100,
    indiceEstrategicasPercentual: (tempoEstrategicasMinutos / basePercentual) * 100,
  }
}

export const gerarParetoParadas = (
  paradasNormalizadas: ParadaNormalizada[],
  limitePareto: number
): ParetoParadaItem[] => {
  const acumulador = new Map<string, { quantidade: number; tempoMinutos: number }>()

  for (const parada of paradasNormalizadas) {
    if (!parada.paradaGrande) {
      continue
    }
    const chave = parada.parada
    const atual = acumulador.get(chave) || { quantidade: 0, tempoMinutos: 0 }
    atual.quantidade += 1
    atual.tempoMinutos += parada.duracaoMinutos
    acumulador.set(chave, atual)
  }

  const itens = Array.from(acumulador.entries())
    .map(([parada, valor]) => ({
      parada,
      quantidade: valor.quantidade,
      tempoMinutos: valor.tempoMinutos,
    }))
    .sort((a, b) => {
      if (b.tempoMinutos !== a.tempoMinutos) {
        return b.tempoMinutos - a.tempoMinutos
      }
      return b.quantidade - a.quantidade
    })

  const totalMinutos = itens.reduce((acc, item) => acc + item.tempoMinutos, 0)
  if (totalMinutos <= 0) {
    return []
  }

  const limite = Math.max(1, limitePareto)
  let acumulado = 0

  return itens.slice(0, limite).map((item) => {
    const percentual = (item.tempoMinutos / totalMinutos) * 100
    acumulado += percentual
    return {
      parada: item.parada,
      quantidade: item.quantidade,
      tempoMinutos: item.tempoMinutos,
      tempoHoras: item.tempoMinutos / 60,
      percentual,
      percentualAcumulado: Math.min(acumulado, 100),
    }
  })
}

export const gerarTendenciaParadas = (paradasNormalizadas: ParadaNormalizada[]): TendenciaParadasItem[] => {
  const mapa = new Map<string, TendenciaParadasItem>()

  for (const parada of paradasNormalizadas) {
    const dataBase = (parada.data || '').trim()
    if (!dataBase) {
      continue
    }

    const itemAtual = mapa.get(dataBase) || {
      data: dataBase,
      rotuloData: formatarDataCurta(dataBase),
      minutosGrandes: 0,
      minutosPequenas: 0,
      minutosEstrategicas: 0,
      minutosTotais: 0,
    }

    itemAtual.minutosTotais += parada.duracaoMinutos
    if (parada.paradaGrande) {
      itemAtual.minutosGrandes += parada.duracaoMinutos
    }
    if (parada.paradaPequena) {
      itemAtual.minutosPequenas += parada.duracaoMinutos
    }
    if (parada.estrategica) {
      itemAtual.minutosEstrategicas += parada.duracaoMinutos
    }

    mapa.set(dataBase, itemAtual)
  }

  return Array.from(mapa.values()).sort((a, b) => a.data.localeCompare(b.data))
}

export const gerarDistribuicaoClasse = (
  paradasNormalizadas: ParadaNormalizada[]
): DistribuicaoClasseItem[] => {
  const mapa = new Map<string, { tempoMinutos: number; quantidade: number }>()

  for (const parada of paradasNormalizadas) {
    const classe = parada.classe
    const atual = mapa.get(classe) || { tempoMinutos: 0, quantidade: 0 }
    atual.tempoMinutos += parada.duracaoMinutos
    atual.quantidade += 1
    mapa.set(classe, atual)
  }

  const itens = Array.from(mapa.entries())
    .map(([classe, valor]) => ({
      classe,
      tempoMinutos: valor.tempoMinutos,
      quantidade: valor.quantidade,
    }))
    .filter((item) => item.tempoMinutos > 0)
    .sort((a, b) => b.tempoMinutos - a.tempoMinutos)

  const totalMinutos = itens.reduce((acc, item) => acc + item.tempoMinutos, 0)
  if (totalMinutos <= 0) {
    return []
  }

  return itens.map((item) => ({
    ...item,
    percentual: (item.tempoMinutos / totalMinutos) * 100,
  }))
}

export const gerarTopNaturezas = (
  paradasNormalizadas: ParadaNormalizada[],
  limite = 8
): TopNaturezaItem[] => {
  const mapa = new Map<string, { tempoMinutos: number; quantidade: number }>()

  for (const parada of paradasNormalizadas) {
    if (parada.estrategica) {
      continue
    }

    const natureza = parada.natureza
    const atual = mapa.get(natureza) || { tempoMinutos: 0, quantidade: 0 }
    atual.tempoMinutos += parada.duracaoMinutos
    atual.quantidade += 1
    mapa.set(natureza, atual)
  }

  const itensOrdenados = Array.from(mapa.entries())
    .map(([natureza, valor]) => ({
      natureza,
      tempoMinutos: valor.tempoMinutos,
      quantidade: valor.quantidade,
    }))
    .filter((item) => item.tempoMinutos > 0)
    .sort((a, b) => b.tempoMinutos - a.tempoMinutos)

  const totalMinutos = itensOrdenados.reduce((acc, item) => acc + item.tempoMinutos, 0)
  if (totalMinutos <= 0) {
    return []
  }

  return itensOrdenados.slice(0, Math.max(1, limite)).map((item) => ({
    natureza: item.natureza,
    tempoMinutos: item.tempoMinutos,
    tempoHoras: item.tempoMinutos / 60,
    quantidade: item.quantidade,
    percentual: (item.tempoMinutos / totalMinutos) * 100,
  }))
}

export const gerarTopLinhas = (
  paradasNormalizadas: ParadaNormalizada[],
  limite = 8
): TopLinhaItem[] => {
  const mapa = new Map<string, { linhaId: number | null; tempoMinutos: number; quantidade: number }>()

  for (const parada of paradasNormalizadas) {
    const chave = `${parada.linhaproducaoId || 0}:${parada.linhaproducao}`
    const atual = mapa.get(chave) || {
      linhaId: parada.linhaproducaoId,
      tempoMinutos: 0,
      quantidade: 0,
    }
    atual.tempoMinutos += parada.duracaoMinutos
    atual.quantidade += 1
    mapa.set(chave, atual)
  }

  const itensOrdenados = Array.from(mapa.entries())
    .map(([chave, valor]) => {
      const [, nomeLinha] = chave.split(':')
      return {
        linhaproducaoId: valor.linhaId,
        linhaproducao: nomeLinha,
        tempoMinutos: valor.tempoMinutos,
        quantidade: valor.quantidade,
      }
    })
    .filter((item) => item.tempoMinutos > 0)
    .sort((a, b) => b.tempoMinutos - a.tempoMinutos)

  const totalMinutos = itensOrdenados.reduce((acc, item) => acc + item.tempoMinutos, 0)
  if (totalMinutos <= 0) {
    return []
  }

  return itensOrdenados.slice(0, Math.max(1, limite)).map((item) => ({
    ...item,
    tempoHoras: item.tempoMinutos / 60,
    percentual: (item.tempoMinutos / totalMinutos) * 100,
  }))
}

export const gerarAcoesPrioritarias = (pareto: ParetoParadaItem[]): AcaoPrioritariaItem[] => {
  return pareto.map((item) => {
    const mediaMinutos = item.quantidade > 0 ? item.tempoMinutos / item.quantidade : 0

    let prioridade: AcaoPrioritariaItem['prioridade'] = 'Média'
    if (item.percentualAcumulado <= 50) {
      prioridade = 'Crítica'
    } else if (item.percentualAcumulado <= 80) {
      prioridade = 'Alta'
    }

    let recomendacao = 'Monitorar tendência e validar padronização operacional.'
    if (mediaMinutos >= 30) {
      recomendacao = 'Priorizar análise de causa raiz com plano de ação e responsável definido.'
    } else if (item.quantidade >= 5) {
      recomendacao = 'Atuar em prevenção recorrente com checklist e revisão de setup.'
    }

    return {
      parada: item.parada,
      tempoMinutos: item.tempoMinutos,
      tempoHoras: item.tempoHoras,
      quantidade: item.quantidade,
      mediaMinutos,
      percentual: item.percentual,
      percentualAcumulado: item.percentualAcumulado,
      prioridade,
      recomendacao,
    }
  })
}

export const gerarResumoExecutivo = (
  kpis: AnaliseParadasKpis,
  pareto: ParetoParadaItem[]
): string[] => {
  if (kpis.ocorrenciasTotais === 0) {
    return [
      'Nenhuma parada registrada no período filtrado.',
      'Revise o período, linha ou turno para ampliar a janela de análise.',
    ]
  }

  const mensagens: string[] = []
  const principal = pareto[0]

  if (principal) {
    mensagens.push(
      `Maior causa de parada: ${principal.parada} (${formatarPercentual(principal.percentual)} do tempo das paradas grandes).`
    )
  }

  mensagens.push(
    `Paradas grandes representam ${formatarPercentual(kpis.indiceGrandesPercentual)} do tempo total de parada (${formatarMinutosHHMM(kpis.tempoGrandesMinutos)}).`
  )
  mensagens.push(
    `Foram ${kpis.ocorrenciasTotais} ocorrências em ${kpis.linhasImpactadas} linhas e ${kpis.turnosComParada} turnos com impacto.`
  )

  return mensagens
}

