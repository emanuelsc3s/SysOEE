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

/**
 * Mapeia dados do banco para o formato do formulário/UI
 */
function mapDbToForm(db: OeeTurnoDB, linhaProducaoNome = ''): OeeTurnoFormData {
  return {
    id: db.oeeturno_id.toString(),
    data: db.data || '',
    linhaProducaoId: db.linhaproducao_id ?? null,
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
    createdBy: db.created_by
  }
}

/**
 * Interface de resposta para busca paginada
 */
export interface FetchOeeTurnosResponse {
  data: OeeTurnoFormData[]
  count: number
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
    try {
      console.log('🔍 useOeeTurno: Iniciando busca. Filtros:', filters)
      setLoading(true)

      // Construir query base
      let query = supabase
        .from('tboee_turno')
        .select('*', { count: 'exact' })
        .eq('deletado', 'N')
        .order('data', { ascending: false })
        .order('oeeturno_id', { ascending: false })

      // Aplicar filtros se fornecidos
      if (filters?.data) {
        query = query.eq('data', filters.data)
      }
      if (filters?.turnoId) {
        query = query.eq('turno_id', filters.turnoId)
      }
      if (filters?.produtoId) {
        query = query.eq('produto_id', filters.produtoId)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      // Busca por termo (produto ou turno)
      if (filters?.searchTerm) {
        const term = filters.searchTerm.trim()
        query = query.or(`produto.ilike.%${term}%,turno.ilike.%${term}%,observacao.ilike.%${term}%`)
      }

      // Paginação
      const from = (page - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to)

      console.log('🔍 useOeeTurno: Executando query no Supabase...')
      const { data, error, count } = await query

      if (error) {
        console.error('❌ useOeeTurno: Erro na query:', error)
        throw error
      }

      console.log('✅ useOeeTurno: Dados recebidos:', data?.length || 0, 'registros')

      const linhaIds = Array.from(new Set(
        (data || [])
          .map((registro) => registro.linhaproducao_id)
          .filter((id): id is number => typeof id === 'number')
      ))

      const linhaMap = new Map<number, string>()

      if (linhaIds.length > 0) {
        const { data: linhasData, error: linhasError } = await supabase
          .from('tblinhaproducao')
          .select('linhaproducao_id, linhaproducao')
          .in('linhaproducao_id', linhaIds)
          .is('deleted_at', null)

        if (linhasError) {
          console.warn('⚠️ useOeeTurno: Erro ao buscar linhas de produção:', linhasError)
        } else {
          ;(linhasData || []).forEach((linha) => {
            if (linha.linhaproducao_id) {
              linhaMap.set(linha.linhaproducao_id, linha.linhaproducao || '')
            }
          })
        }
      }

      const turnosMapeados = (data || []).map((registro) =>
        mapDbToForm(registro, linhaMap.get(registro.linhaproducao_id ?? -1) || '')
      )
      setTurnos(turnosMapeados)

      return {
        data: turnosMapeados,
        count: count || turnosMapeados.length
      }
    } catch (error) {
      console.error('❌ useOeeTurno: Erro ao buscar turnos OEE:', error)
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao buscar turnos OEE',
        description: errorMessage,
        variant: 'destructive'
      })
      return { data: [], count: 0 }
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
        .select('*')
        .eq('oeeturno_id', parseInt(id))
        .eq('deletado', 'N')
        .single()

      if (error) throw error
      if (!data) {
        throw new Error('Turno OEE não encontrado')
      }

      let linhaProducaoNome = ''

      if (data.linhaproducao_id) {
        const { data: linhaData, error: linhaError } = await supabase
          .from('tblinhaproducao')
          .select('linhaproducao')
          .eq('linhaproducao_id', data.linhaproducao_id)
          .is('deleted_at', null)
          .maybeSingle()

        if (linhaError) {
          console.warn('⚠️ useOeeTurno: Erro ao buscar linha de produção:', linhaError)
        } else {
          linhaProducaoNome = linhaData?.linhaproducao || ''
        }
      }

      return mapDbToForm(data, linhaProducaoNome)
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
  const deleteOeeTurno = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)

      const { error } = await supabase
        .from('tboee_turno')
        .update({
          deletado: 'S',
          deleted_at: new Date().toISOString()
        })
        .eq('oeeturno_id', parseInt(id))

      if (error) throw error

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

