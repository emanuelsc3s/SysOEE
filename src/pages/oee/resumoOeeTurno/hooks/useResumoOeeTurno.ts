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
  return linhas.map((linha) => ({
    ...linha,
    qtd_envase: normalizarNumero(linha.qtd_envase),
    qtd_embalagem: normalizarNumero(linha.qtd_embalagem),
    perdas: normalizarNumero(linha.perdas),
    unidades_boas: normalizarNumero(linha.unidades_boas),
    paradas_minutos: normalizarNumero(linha.paradas_minutos),
    paradas_grandes_minutos: normalizarNumero(linha.paradas_grandes_minutos),
    paradas_totais_minutos: normalizarNumero(linha.paradas_totais_minutos),
    paradas_estrategicas_minutos: normalizarNumero(linha.paradas_estrategicas_minutos),
  }))
}

const somarTotais = (linhas: ResumoOeeTurnoLinhaNormalizada[]): ResumoTotais => {
  return linhas.reduce(
    (acc, linha) => {
      acc.qtdEnvase += linha.qtd_envase
      acc.qtdEmbalagem += linha.qtd_embalagem
      acc.quantidade += linha.qtd_envase + linha.qtd_embalagem
      acc.perdas += linha.perdas
      acc.boas += linha.unidades_boas
      acc.paradasGrandes += linha.paradas_grandes_minutos
      acc.paradasTotais += linha.paradas_totais_minutos
      acc.paradasEstrategicas += linha.paradas_estrategicas_minutos
      return acc
    },
    {
      qtdEnvase: 0,
      qtdEmbalagem: 0,
      quantidade: 0,
      perdas: 0,
      boas: 0,
      paradasGrandes: 0,
      paradasTotais: 0,
      paradasEstrategicas: 0,
    }
  )
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
