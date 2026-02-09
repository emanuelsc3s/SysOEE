import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import type {
  ComparativoTurno,
  ResumoOeeTurnoLinhaNormalizada,
  ResumoOeeTurnoParametros,
  ResumoOeeTurnoRow,
  ResumoTotais,
} from '../types'
import { normalizarNumero } from '../utils/formatters'

type UseResumoOeeTurnoParams = {
  dataInicioIso?: string
  dataFimIso?: string
}

type UseResumoOeeTurnoRetorno = {
  linhas: ResumoOeeTurnoLinhaNormalizada[]
  totais: ResumoTotais
  comparativoTurnos: ComparativoTurno[]
  parametrosValidos: boolean
  periodoInvalido: boolean
  resumoAtualizadoEm: number
  isLoading: boolean
  isFetching: boolean
  erroConsulta: string | null
  refetch: () => Promise<void>
}

const TURNOS_COMPARATIVO_PADRAO: ComparativoTurno[] = [
  { id: 1, nome: 'Turno 1', producao: 0, perdas: 0 },
  { id: 2, nome: 'Turno 2', producao: 0, perdas: 0 },
  { id: 3, nome: 'Turno 3', producao: 0, perdas: 0 },
]

const normalizarLinhas = (linhas: ResumoOeeTurnoRow[]): ResumoOeeTurnoLinhaNormalizada[] => {
  return linhas.map((linha) => {
    const skuProduzidos = normalizarNumero(linha.sku_produzidos)
    const qtdEnvase = normalizarNumero(linha.qtd_envase)
    const envasado = normalizarNumero(linha.envasado)
    const qtdEmbalagem = normalizarNumero(linha.qtd_embalagem)
    const embalado = normalizarNumero(linha.embalado)
    const perdasEnvase = normalizarNumero(linha.perdas_envase)
    const perdasEmbalagem = normalizarNumero(linha.perdas_embalagem)
    const unidadesBoas =
      linha.unidades_boas !== undefined && linha.unidades_boas !== null
        ? normalizarNumero(linha.unidades_boas)
        : Math.max(envasado, embalado)

    return {
      ...linha,
      sku_produzidos: skuProduzidos,
      qtd_envase: qtdEnvase,
      envasado,
      embalado,
      qtd_embalagem: qtdEmbalagem,
      perdas_envase: perdasEnvase,
      perdas_embalagem: perdasEmbalagem,
      perdas: perdasEnvase + perdasEmbalagem,
      unidades_boas: unidadesBoas,
      paradas_grandes_minutos: normalizarNumero(linha.paradas_grandes_minutos),
      paradas_pequenas_minutos: normalizarNumero(linha.paradas_pequenas_minutos),
      paradas_totais_minutos: normalizarNumero(linha.paradas_totais_minutos),
      paradas_estrategicas_minutos: normalizarNumero(linha.paradas_estrategicas_minutos),
    }
  })
}

const somarTotais = (linhas: ResumoOeeTurnoLinhaNormalizada[]): ResumoTotais => {
  const totais: ResumoTotais = {
    skuProduzidos: 0,
    turnosDistintos: 0,
    qtdEnvase: 0,
    perdasEnvase: 0,
    envasado: 0,
    qtdEmbalagem: 0,
    perdasEmbalagem: 0,
    embalado: 0,
    quantidade: 0,
    perdas: 0,
    paradasGrandes: 0,
    paradasPequenas: 0,
    paradasTotais: 0,
    paradasEstrategicas: 0,
  }

  const produtosProduzidos = new Set<number>()

  for (const linha of linhas) {
    totais.qtdEnvase += linha.qtd_envase
    totais.perdasEnvase += linha.perdas_envase
    totais.envasado += linha.envasado
    totais.qtdEmbalagem += linha.qtd_embalagem
    totais.perdasEmbalagem += linha.perdas_embalagem
    totais.embalado += linha.embalado
    totais.quantidade += linha.qtd_envase + linha.qtd_embalagem
    totais.perdas += linha.perdas
    totais.paradasGrandes += linha.paradas_grandes_minutos
    totais.paradasPequenas += linha.paradas_pequenas_minutos
    totais.paradasTotais += linha.paradas_totais_minutos
    totais.paradasEstrategicas += linha.paradas_estrategicas_minutos

    const produtoId = linha.produto_id
    const teveProducao = linha.qtd_envase > 0 || linha.embalado > 0
    if (produtoId !== null && produtoId !== undefined && teveProducao) {
      produtosProduzidos.add(produtoId)
    }

  }

  totais.skuProduzidos = produtosProduzidos.size
  totais.turnosDistintos = new Set(
    linhas
      .map((linha) => linha.oeeturno_id)
      .filter((id): id is number => id !== null && id !== undefined)
  ).size
  return totais
}

export const useResumoOeeTurno = ({
  dataInicioIso,
  dataFimIso,
}: UseResumoOeeTurnoParams): UseResumoOeeTurnoRetorno => {
  const periodoInvalido = Boolean(dataInicioIso && dataFimIso && dataInicioIso > dataFimIso)
  const parametrosValidos = Boolean(dataInicioIso && dataFimIso && !periodoInvalido)

  const parametrosBase = useMemo<ResumoOeeTurnoParametros>(
    () => ({
      p_data_inicio: dataInicioIso ?? null,
      p_data_fim: dataFimIso ?? null,
      p_turno_id: null,
      p_produto_id: null,
      p_linhaproducao_id: null,
      p_oeeturno_id: null,
    }),
    [dataInicioIso, dataFimIso]
  )

  const resumoQuery = useQuery({
    queryKey: ['resumo-oee-turno-pagina', parametrosBase],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('fn_resumo_oee_turno', parametrosBase)
      if (error) {
        throw error
      }
      return normalizarLinhas((data || []) as ResumoOeeTurnoRow[])
    },
    enabled: parametrosValidos,
    staleTime: 60_000,
  })

  const comparativoQuery = useQuery({
    queryKey: ['resumo-oee-turno-pagina-comparativo', parametrosBase],
    queryFn: async () => {
      const comparativo = await Promise.all(
        TURNOS_COMPARATIVO_PADRAO.map(async (turno) => {
          const { data, error } = await supabase.rpc('fn_resumo_oee_turno', {
            ...parametrosBase,
            p_turno_id: turno.id,
          })

          if (error) {
            throw error
          }

          const linhasTurno = normalizarLinhas((data || []) as ResumoOeeTurnoRow[])
          const totaisTurno = somarTotais(linhasTurno)

          return {
            id: turno.id,
            nome: turno.nome,
            producao: totaisTurno.quantidade,
            perdas: totaisTurno.perdas,
          } satisfies ComparativoTurno
        })
      )

      return comparativo
    },
    enabled: parametrosValidos,
    staleTime: 60_000,
  })

  const linhas = useMemo(() => resumoQuery.data || [], [resumoQuery.data])
  const totais = useMemo(() => somarTotais(linhas), [linhas])
  const comparativoTurnos = useMemo(
    () => comparativoQuery.data || TURNOS_COMPARATIVO_PADRAO,
    [comparativoQuery.data]
  )

  const erroBruto = resumoQuery.error || comparativoQuery.error
  const erroConsulta = erroBruto ? 'Não foi possível carregar o resumo do período informado.' : null

  const refetch = async () => {
    await Promise.all([resumoQuery.refetch(), comparativoQuery.refetch()])
  }

  return {
    linhas,
    totais,
    comparativoTurnos,
    parametrosValidos,
    periodoInvalido,
    resumoAtualizadoEm: resumoQuery.dataUpdatedAt,
    isLoading: resumoQuery.isLoading || comparativoQuery.isLoading,
    isFetching: resumoQuery.isFetching || comparativoQuery.isFetching,
    erroConsulta,
    refetch,
  }
}
