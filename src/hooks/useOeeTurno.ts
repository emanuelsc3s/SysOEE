/**
 * Hook customizado para gerenciamento de OEE Turno
 * Operações CRUD com a tabela tboee_turno do Supabase
 */

import { useState, useCallback } from 'react'
import { supabase, handleSupabaseError } from '@/lib/supabase'
import {
  OeeTurnoDB,
  OeeTurnoFormData,
  FetchOeeTurnoFilters
} from '@/types/apontamento-oee'
import { toast } from '@/hooks/use-toast'
import { gerarTimestampLocal } from '@/utils/datahora.utils'

/**
 * Mapeia dados do banco para o formato do formulário/UI
 */
function mapDbToForm(
  db: OeeTurnoDB,
  linhaProducaoId: number | null = db.linhaproducao_id ?? null,
  linhaProducaoNome = db.linhaproducao || ''
): OeeTurnoFormData {
  return {
    id: db.oeeturno_id.toString(),
    data: db.data || '',
    linhaProducaoId,
    linhaProducaoNome,
    produtoId: db.produto_id,
    produto: db.produto,
    turnoId: db.turno_id,
    turno: db.turno,
    horaInicio: db.turno_hi,
    horaFim: db.turno_hf,
    observacao: db.observacao,
    status: db.status,
    createdAt: db.created_at,
    createdBy: db.created_by,
    createdByLogin: db.criador?.login ?? null
  }
}

/**
 * Interface de resposta para busca paginada
 */
export interface FetchOeeTurnosResponse {
  data: OeeTurnoFormData[]
  count: number
  page: number
}

type SupabaseErrorLike = {
  code?: string
  details?: string
  hint?: string
  message?: string
  status?: number
}

const PAGINA_INICIAL = 1
const ITENS_POR_PAGINA_PADRAO = 25

/**
 * Garante valor inteiro de página >= 1
 */
const normalizarPagina = (page: number): number => {
  if (!Number.isFinite(page)) return PAGINA_INICIAL
  return Math.max(PAGINA_INICIAL, Math.floor(page))
}

/**
 * Garante valor inteiro de itens por página >= 1
 */
const normalizarItensPorPagina = (itemsPerPage: number): number => {
  if (!Number.isFinite(itemsPerPage)) return ITENS_POR_PAGINA_PADRAO
  return Math.max(1, Math.floor(itemsPerPage))
}

/**
 * Detecta erro de paginação fora do intervalo (HTTP 416 / PGRST103)
 */
const isErroFaixaPaginacao = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false
  }

  const erro = error as SupabaseErrorLike
  if (erro.status === 416 || erro.code === 'PGRST103') {
    return true
  }

  const mensagem = `${erro.message ?? ''}`.toLowerCase()
  const detalhes = `${erro.details ?? ''}`.toLowerCase()

  return (
    (mensagem.includes('range') && mensagem.includes('satisfiable')) ||
    (detalhes.includes('range') && detalhes.includes('satisfiable')) ||
    mensagem.includes('416') ||
    detalhes.includes('416')
  )
}

/**
 * Hook para gerenciar operações de OEE Turno
 */
export function useOeeTurno() {
  const [loading, setLoading] = useState(false)
  const [turnos, setTurnos] = useState<OeeTurnoFormData[]>([])

  /**
   * Busca lista de turnos OEE com filtros opcionais
   */
  const fetchOeeTurnos = useCallback(async (
    filters?: FetchOeeTurnoFilters,
    page = 1,
    itemsPerPage = 25
  ): Promise<FetchOeeTurnosResponse> => {
    const paginaSolicitada = normalizarPagina(page)
    const itensPorPagina = normalizarItensPorPagina(itemsPerPage)

    try {
      console.log('🔍 useOeeTurno: Iniciando busca. Filtros:', filters)
      setLoading(true)

      const construirQueryBase = () => {
        // Construir query base
        let query = supabase
          .from('tboee_turno')
          .select(`
            *,
            criador:tbusuario!tboee_turno_created_by_fkey(
              usuario_id,
              login
            )
          `, { count: 'exact' })
          .eq('deletado', 'N')
          .order('data', { ascending: false })
          .order('oeeturno_id', { ascending: false })

        // Aplicar filtros se fornecidos
        if (filters?.data) {
          query = query.eq('data', filters.data)
        }
        if (filters?.dataInicio) {
          query = query.gte('data', filters.dataInicio)
        }
        if (filters?.dataFim) {
          query = query.lte('data', filters.dataFim)
        }
        const turnoIds = (filters?.turnoIds || []).filter((id) => Number.isFinite(id))
        if (turnoIds.length > 0) {
          query = query.in('turno_id', turnoIds)
        } else if (filters?.turnoId) {
          query = query.eq('turno_id', filters.turnoId)
        }
        if (filters?.produtoId) {
          query = query.eq('produto_id', filters.produtoId)
        }
        if (filters?.status) {
          query = query.eq('status', filters.status)
        }

        // Busca por termo (produto, turno ou observação). Para ID, usa igualdade quando o termo é numérico,
        // pois o PostgREST não aceita cast em filtros (evita erro 400).
        if (filters?.searchTerm) {
          const term = filters.searchTerm.trim()
          if (term) {
            const partesBusca = [
              `produto.ilike.%${term}%`,
              `turno.ilike.%${term}%`,
              `observacao.ilike.%${term}%`
            ]

            if (/^\d+$/.test(term)) {
              partesBusca.unshift(`oeeturno_id.eq.${term}`)
            }

            query = query.or(partesBusca.join(','))
          }
        }

        return query
      }

      const executarBuscaPaginada = async (pagina: number) => {
        const from = (pagina - 1) * itensPorPagina
        const to = from + itensPorPagina - 1
        return construirQueryBase().range(from, to)
      }

      let paginaEfetiva = paginaSolicitada

      console.log('🔍 useOeeTurno: Executando query no Supabase...')
      let { data, error, count } = await executarBuscaPaginada(paginaEfetiva)

      if (error && paginaSolicitada > PAGINA_INICIAL && isErroFaixaPaginacao(error)) {
        console.warn(
          '⚠️ useOeeTurno: Página fora do intervalo. Reexecutando na página 1.',
          { paginaSolicitada, itensPorPagina, error }
        )
        paginaEfetiva = PAGINA_INICIAL
        const retry = await executarBuscaPaginada(paginaEfetiva)
        data = retry.data
        error = retry.error
        count = retry.count
      }

      if (error) {
        console.error('❌ useOeeTurno: Erro na query:', error)
        throw error
      }

      console.log('✅ useOeeTurno: Dados recebidos:', data?.length || 0, 'registros')

      const registros = data || []
      const turnosSemLinha = registros.filter((registro) =>
        !registro.linhaproducao_id || !registro.linhaproducao
      )
      const turnoIdsSemLinha = Array.from(new Set(
        turnosSemLinha
          .map((registro) => registro.oeeturno_id)
          .filter((id): id is number => typeof id === 'number')
      ))

      const linhaPorTurno = new Map<number, { id: number | null, nome: string }>()
      const linhaMap = new Map<number, string>()

      if (turnoIdsSemLinha.length > 0) {
        const { data: producoesData, error: producoesError } = await supabase
          .from('tboee_turno_producao')
          .select('oeeturno_id, linhaproducao_id, linhaproducao')
          .in('oeeturno_id', turnoIdsSemLinha)
          .eq('deletado', 'N')
          .order('oeeturnoproducao_id', { ascending: true })

        if (producoesError) {
          console.warn('⚠️ useOeeTurno: Erro ao buscar linhas via produção:', producoesError)
        } else {
          ;(producoesData || []).forEach((registro) => {
            if (typeof registro.oeeturno_id !== 'number') return
            if (!linhaPorTurno.has(registro.oeeturno_id)) {
              linhaPorTurno.set(registro.oeeturno_id, {
                id: registro.linhaproducao_id ?? null,
                nome: registro.linhaproducao || ''
              })
            }
          })
        }
      }

      const linhaIdsSemNome = new Set<number>()

      registros.forEach((registro) => {
        if (typeof registro.linhaproducao_id === 'number' && !registro.linhaproducao) {
          linhaIdsSemNome.add(registro.linhaproducao_id)
        }
      })

      linhaPorTurno.forEach((linha) => {
        if (typeof linha.id === 'number' && !linha.nome) {
          linhaIdsSemNome.add(linha.id)
        }
      })

      if (linhaIdsSemNome.size > 0) {
        const { data: linhasData, error: linhasError } = await supabase
          .from('tblinhaproducao')
          .select('linhaproducao_id, linhaproducao')
          .in('linhaproducao_id', Array.from(linhaIdsSemNome))
          .is('deleted_at', null)

        if (linhasError) {
          console.warn('⚠️ useOeeTurno: Erro ao buscar nomes de linha:', linhasError)
        } else {
          ;(linhasData || []).forEach((linha) => {
            if (linha.linhaproducao_id) {
              linhaMap.set(linha.linhaproducao_id, linha.linhaproducao || '')
            }
          })
        }
      }

      const turnosMapeados = registros.map((registro) => {
        const linhaInfo = linhaPorTurno.get(registro.oeeturno_id)
        const linhaId = registro.linhaproducao_id ?? linhaInfo?.id ?? null
        const nomeDireto = registro.linhaproducao || linhaInfo?.nome || ''
        const nomeLinha = nomeDireto || (linhaId ? (linhaMap.get(linhaId) || '') : '')
        return mapDbToForm(registro, linhaId, nomeLinha)
      })
      setTurnos(turnosMapeados)

      return {
        data: turnosMapeados,
        count: count || turnosMapeados.length,
        page: paginaEfetiva
      }
    } catch (error) {
      console.error('❌ useOeeTurno: Erro ao buscar turnos OEE:', error)
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao buscar turnos OEE',
        description: errorMessage,
        variant: 'destructive'
      })
      return { data: [], count: 0, page: PAGINA_INICIAL }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Busca um turno OEE específico por ID
   */
  const fetchOeeTurno = async (id: string): Promise<OeeTurnoFormData | null> => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('tboee_turno')
        .select(`
          *,
          criador:tbusuario!tboee_turno_created_by_fkey(
            usuario_id,
            login
          )
        `)
        .eq('oeeturno_id', parseInt(id))
        .eq('deletado', 'N')
        .single()

      if (error) throw error
      if (!data) {
        throw new Error('Turno OEE não encontrado')
      }

      let linhaProducaoId: number | null = data.linhaproducao_id ?? null
      let linhaProducaoNome = data.linhaproducao || ''

      if (!linhaProducaoId) {
        const { data: producaoData, error: producaoError } = await supabase
          .from('tboee_turno_producao')
          .select('linhaproducao_id, linhaproducao')
          .eq('oeeturno_id', data.oeeturno_id)
          .eq('deletado', 'N')
          .order('oeeturnoproducao_id', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (producaoError) {
          console.warn('⚠️ useOeeTurno: Erro ao buscar linha via produção:', producaoError)
        } else {
          linhaProducaoId = producaoData?.linhaproducao_id ?? null
          linhaProducaoNome = producaoData?.linhaproducao || ''
        }
      }

      if (linhaProducaoId && !linhaProducaoNome) {
        const { data: linhaData, error: linhaError } = await supabase
          .from('tblinhaproducao')
          .select('linhaproducao')
          .eq('linhaproducao_id', linhaProducaoId)
          .is('deleted_at', null)
          .maybeSingle()

        if (linhaError) {
          console.warn('⚠️ useOeeTurno: Erro ao buscar linha de produção:', linhaError)
        } else {
          linhaProducaoNome = linhaData?.linhaproducao || ''
        }
      }

      return mapDbToForm(data, linhaProducaoId, linhaProducaoNome)
    } catch (error) {
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao buscar turno OEE',
        description: errorMessage,
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Exclui logicamente um turno OEE (soft delete)
   */
  const deleteOeeTurno = async (
    id: string,
    deletedByUuid: string,
    deletedByUsuarioId: number
  ): Promise<boolean> => {
    try {
      setLoading(true)
      const turnoId = parseInt(id)
      if (!Number.isFinite(turnoId)) {
        toast({
          title: 'Erro ao excluir turno OEE',
          description: 'ID do turno inválido.',
          variant: 'destructive'
        })
        return false
      }
      if (!deletedByUuid) {
        toast({
          title: 'Erro ao excluir turno OEE',
          description: 'Usuário autenticado não identificado.',
          variant: 'destructive'
        })
        return false
      }
      if (!Number.isFinite(deletedByUsuarioId)) {
        toast({
          title: 'Erro ao excluir turno OEE',
          description: 'Usuário interno não identificado.',
          variant: 'destructive'
        })
        return false
      }

      const payloadExclusao = {
        deletado: 'S' as const,
        deleted_at: gerarTimestampLocal(),
        deleted_by: deletedByUsuarioId
      }

      const { error } = await supabase
        .from('tboee_turno')
        .update(payloadExclusao)
        .eq('oeeturno_id', turnoId)

      if (error) throw error

      const payloadExclusaoRelacionado = {
        deletado: 'S' as const,
        deleted_at: payloadExclusao.deleted_at,
        deleted_by: deletedByUuid
      }

      const resultadosRelacionados = await Promise.all([
        supabase
          .from('tboee_turno_producao')
          .update(payloadExclusaoRelacionado)
          .eq('oeeturno_id', turnoId),
        supabase
          .from('tboee_turno_parada')
          .update(payloadExclusaoRelacionado)
          .eq('oeeturno_id', turnoId),
        supabase
          .from('tboee_turno_perda')
          .update(payloadExclusaoRelacionado)
          .eq('oeeturno_id', turnoId),
        supabase
          .from('tboee_turno_lote')
          .update(payloadExclusaoRelacionado)
          .eq('oeeturno_id', turnoId)
      ])

      const erroRelacionado = resultadosRelacionados.find((resultado) => resultado.error)?.error
      if (erroRelacionado) {
        throw erroRelacionado
      }

      toast({
        title: 'Turno OEE excluído',
        description: 'O registro foi excluído com sucesso.',
        variant: 'default'
      })

      return true
    } catch (error) {
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao excluir turno OEE',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    turnos,
    fetchOeeTurnos,
    fetchOeeTurno,
    deleteOeeTurno
  }
}

