import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import type {
  AnaliseParadasResultado,
  LinhaFiltroOption,
  ParadaTurnoRaw,
  ProdutoFiltroOption,
  ResumoOeeTurnoRpcRow,
  TurnoFiltrado,
  TurnoFiltroOption,
} from '../types'
import {
  calcularKpisParadas,
  consolidarTotaisResumoRpc,
  gerarAcoesPrioritarias,
  gerarDistribuicaoClasse,
  gerarParetoParadas,
  gerarResumoExecutivo,
  gerarTendenciaParadas,
  gerarTopLinhas,
  gerarTopNaturezas,
  normalizarParadas,
} from '../utils/aggregations'

const TAMANHO_PAGINA = 1000
const TAMANHO_LOTE_IDS = 200

type UseAnaliseParadasOeeParams = {
  dataInicioIso?: string
  dataFimIso?: string
  linhaId: number | null
  turnoId: number | null
  produtoId: number | null
  limitePareto: number
}

type UseAnaliseParadasOeeRetorno = {
  linhasFiltro: LinhaFiltroOption[]
  turnosFiltro: TurnoFiltroOption[]
  produtosFiltro: ProdutoFiltroOption[]
  dados: AnaliseParadasResultado
  parametrosValidos: boolean
  periodoInvalido: boolean
  isLoadingFiltros: boolean
  isLoadingDados: boolean
  isFetchingDados: boolean
  erroConsulta: string | null
  dataAtualizacao: number
  refetch: () => Promise<void>
}

type LinhaFiltroRaw = {
  linhaproducao_id: number
  linhaproducao: string | null
  bloqueado: string | null
}

const DADOS_VAZIOS: AnaliseParadasResultado = {
  totaisResumoRpc: {
    paradasGrandesMinutos: 0,
    paradasPequenasMinutos: 0,
    paradasTotaisMinutos: 0,
    paradasEstrategicasMinutos: 0,
    turnosRegistrados: 0,
  },
  kpis: {
    tempoTotalMinutos: 0,
    tempoGrandesMinutos: 0,
    tempoPequenasMinutos: 0,
    tempoEstrategicasMinutos: 0,
    ocorrenciasTotais: 0,
    ocorrenciasGrandes: 0,
    turnosComParada: 0,
    linhasImpactadas: 0,
    indiceGrandesPercentual: 0,
    indicePequenasPercentual: 0,
    indiceEstrategicasPercentual: 0,
  },
  pareto: [],
  tendencia: [],
  distribuicaoClasse: [],
  topNaturezas: [],
  topLinhas: [],
  acoesPrioritarias: [],
  paradasNormalizadas: [],
  resumoExecutivo: [],
}

const criarLotes = <T,>(itens: T[], tamanhoLote: number): T[][] => {
  const lotes: T[][] = []
  for (let indice = 0; indice < itens.length; indice += tamanhoLote) {
    lotes.push(itens.slice(indice, indice + tamanhoLote))
  }
  return lotes
}

const linhaAtiva = (bloqueado: string | null): boolean => {
  const valor = (bloqueado || '').trim().toLowerCase()
  if (!valor) {
    return true
  }
  return valor === 'não' || valor === 'nao' || valor === 'n'
}

const carregarTurnosFiltrados = async (
  dataInicioIso: string,
  dataFimIso: string,
  linhaId: number | null,
  turnoId: number | null
): Promise<TurnoFiltrado[]> => {
  const turnos: TurnoFiltrado[] = []
  let paginaAtual = 0

  while (true) {
    let query = supabase
      .from('tboee_turno')
      .select(
        'oeeturno_id, data, turno_id, turno, linhaproducao_id, linhaproducao, produto_id, produto, status'
      )
      .eq('deletado', 'N')
      .gte('data', dataInicioIso)
      .lte('data', dataFimIso)
      .order('oeeturno_id', { ascending: true })
      .range(paginaAtual * TAMANHO_PAGINA, (paginaAtual + 1) * TAMANHO_PAGINA - 1)

    if (linhaId !== null) {
      query = query.eq('linhaproducao_id', linhaId)
    }
    if (turnoId !== null) {
      query = query.eq('turno_id', turnoId)
    }

    const { data, error } = await query
    if (error) {
      throw error
    }

    const loteAtual = (data || []) as TurnoFiltrado[]
    turnos.push(...loteAtual)

    if (loteAtual.length < TAMANHO_PAGINA) {
      break
    }
    paginaAtual += 1
  }

  return turnos
}

const carregarParadasPorTurnos = async (oeeturnoIds: number[]): Promise<ParadaTurnoRaw[]> => {
  if (oeeturnoIds.length === 0) {
    return []
  }

  const paradas: ParadaTurnoRaw[] = []
  const lotes = criarLotes(oeeturnoIds, TAMANHO_LOTE_IDS)

  for (const loteIds of lotes) {
    let paginaAtual = 0

    while (true) {
      const { data, error } = await supabase
        .from('tboee_turno_parada')
        .select(`
          oeeturnoparada_id,
          oeeturno_id,
          oeeparada_id,
          parada,
          natureza,
          classe,
          hora_inicio,
          hora_fim,
          observacao,
          data,
          produto_id,
          produto,
          tboee_parada (
            oeeparada_id,
            codigo,
            classe,
            natureza,
            parada,
            componente
          )
        `)
        .eq('deletado', 'N')
        .in('oeeturno_id', loteIds)
        .order('oeeturnoparada_id', { ascending: true })
        .range(paginaAtual * TAMANHO_PAGINA, (paginaAtual + 1) * TAMANHO_PAGINA - 1)

      if (error) {
        throw error
      }

      const loteAtual = (data || []) as ParadaTurnoRaw[]
      paradas.push(...loteAtual)

      if (loteAtual.length < TAMANHO_PAGINA) {
        break
      }
      paginaAtual += 1
    }
  }

  return paradas
}

export const useAnaliseParadasOee = ({
  dataInicioIso,
  dataFimIso,
  linhaId,
  turnoId,
  produtoId,
  limitePareto,
}: UseAnaliseParadasOeeParams): UseAnaliseParadasOeeRetorno => {
  const periodoInvalido = Boolean(dataInicioIso && dataFimIso && dataInicioIso > dataFimIso)
  const parametrosValidos = Boolean(dataInicioIso && dataFimIso && !periodoInvalido)

  const filtrosQuery = useQuery({
    queryKey: ['analise-paradas-oee-filtros'],
    queryFn: async () => {
      const [linhasResult, turnosResult, produtosResult] = await Promise.all([
        supabase
          .from('tblinhaproducao')
          .select('linhaproducao_id, linhaproducao, bloqueado')
          .is('deleted_at', null)
          .order('linhaproducao', { ascending: true }),
        supabase
          .from('tbturno')
          .select('turno_id, codigo, turno, hora_inicio, hora_fim')
          .eq('deletado', 'N')
          .order('codigo', { ascending: true }),
        supabase
          .from('tbproduto')
          .select('produto_id, referencia, descricao')
          .eq('deletado', 'N')
          .order('referencia', { ascending: true })
          .range(0, 1999),
      ])

      if (linhasResult.error) {
        throw linhasResult.error
      }
      if (turnosResult.error) {
        throw turnosResult.error
      }
      if (produtosResult.error) {
        throw produtosResult.error
      }

      const linhasAtivas = ((linhasResult.data || []) as LinhaFiltroRaw[])
        .filter((linha) => linhaAtiva(linha.bloqueado))
        .map((linha) => ({
          linhaproducao_id: linha.linhaproducao_id,
          linhaproducao: linha.linhaproducao,
        }))

      return {
        linhas: linhasAtivas,
        turnos: (turnosResult.data || []) as TurnoFiltroOption[],
        produtos: (produtosResult.data || []) as ProdutoFiltroOption[],
      }
    },
    staleTime: 10 * 60_000,
  })

  const dadosQuery = useQuery({
    queryKey: [
      'analise-paradas-oee-dados',
      {
        dataInicioIso: dataInicioIso || null,
        dataFimIso: dataFimIso || null,
        linhaId,
        turnoId,
        produtoId,
        limitePareto,
      },
    ],
    queryFn: async () => {
      if (!dataInicioIso || !dataFimIso) {
        return DADOS_VAZIOS
      }

      const parametrosRpc = {
        p_data_inicio: dataInicioIso,
        p_data_fim: dataFimIso,
        p_turno_id: turnoId,
        p_produto_id: produtoId,
        p_linhaproducao_id: linhaId,
        p_oeeturno_id: null,
      }

      const [resumoResult, turnosFiltrados] = await Promise.all([
        supabase.rpc('fn_resumo_oee_turno', parametrosRpc),
        carregarTurnosFiltrados(dataInicioIso, dataFimIso, linhaId, turnoId),
      ])

      if (resumoResult.error) {
        throw resumoResult.error
      }

      const linhasResumo = (resumoResult.data || []) as ResumoOeeTurnoRpcRow[]
      const totaisResumoRpc = consolidarTotaisResumoRpc(linhasResumo)

      const oeeturnoIds = turnosFiltrados.map((turno) => turno.oeeturno_id)
      const paradasRaw = await carregarParadasPorTurnos(oeeturnoIds)
      const paradasNormalizadas = normalizarParadas(paradasRaw, turnosFiltrados, produtoId)

      const kpis = calcularKpisParadas(paradasNormalizadas, totaisResumoRpc)
      const pareto = gerarParetoParadas(paradasNormalizadas, limitePareto)
      const tendencia = gerarTendenciaParadas(paradasNormalizadas)
      const distribuicaoClasse = gerarDistribuicaoClasse(paradasNormalizadas)
      const topNaturezas = gerarTopNaturezas(paradasNormalizadas)
      const topLinhas = gerarTopLinhas(paradasNormalizadas)
      const acoesPrioritarias = gerarAcoesPrioritarias(pareto)
      const resumoExecutivo = gerarResumoExecutivo(kpis, pareto)

      return {
        totaisResumoRpc,
        kpis,
        pareto,
        tendencia,
        distribuicaoClasse,
        topNaturezas,
        topLinhas,
        acoesPrioritarias,
        paradasNormalizadas,
        resumoExecutivo,
      } as AnaliseParadasResultado
    },
    enabled: parametrosValidos,
    staleTime: 60_000,
  })

  const erroConsulta = dadosQuery.error
    ? 'Não foi possível carregar a análise de paradas para o período selecionado.'
    : null

  const dados = useMemo(() => dadosQuery.data || DADOS_VAZIOS, [dadosQuery.data])

  const refetch = async () => {
    await dadosQuery.refetch()
  }

  return {
    linhasFiltro: filtrosQuery.data?.linhas || [],
    turnosFiltro: filtrosQuery.data?.turnos || [],
    produtosFiltro: filtrosQuery.data?.produtos || [],
    dados,
    parametrosValidos,
    periodoInvalido,
    isLoadingFiltros: filtrosQuery.isLoading,
    isLoadingDados: dadosQuery.isLoading,
    isFetchingDados: dadosQuery.isFetching,
    erroConsulta,
    dataAtualizacao: dadosQuery.dataUpdatedAt,
    refetch,
  }
}

