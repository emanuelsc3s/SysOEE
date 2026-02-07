/**
 * Hook customizado para gerenciamento de Paradas OEE
 * Operações CRUD com a tabela tboee_parada do Supabase
 *
 * Tabela: tboee_parada
 * - oeeparada_id: integer (PK)
 * - codigo: text NOT NULL
 * - componente, classe, natureza, parada, descricao: text NULL
 * - created_by, updated_by, deleted_by: uuid (FK auth.users)
 * - deletado: 'S' | 'N'
 *
 * IMPORTANTE: Os campos *_by referenciam auth.users(id), ou seja,
 * devem receber o UUID do Supabase Auth (authUser.id), não um ID interno.
 */

import { useState, useCallback } from 'react'
import { supabase, handleSupabaseError } from '@/lib/supabase'
import {
  OeeParadaDB,
  OeeParadaFormData,
  FetchOeeParadaFilters,
  FetchOeeParadasResponse
} from '@/types/oee-parada'
import { toast } from '@/hooks/use-toast'

/**
 * Valida se o userId é um UUID válido (formato Supabase Auth)
 */
function isValidUUID(id: string | undefined | null): boolean {
  if (!id) return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

/**
 * Mapeia dados do banco para o formato do formulário/UI
 */
function mapDbToForm(db: OeeParadaDB): OeeParadaFormData {
  return {
    id: db.oeeparada_id.toString(),
    codigo: db.codigo || '',
    componente: db.componente || '',
    classe: db.classe || '',
    natureza: db.natureza || '',
    parada: db.parada || '',
    descricao: db.descricao || '',
    createdAt: db.created_at || '',
    createdBy: db.created_by
  }
}

/**
 * Hook para gerenciar operações de Paradas OEE
 */
export function useOeeParada() {
  const [loading, setLoading] = useState(false)
  const [paradas, setParadas] = useState<OeeParadaFormData[]>([])

  /**
   * Busca lista de paradas OEE com filtros opcionais
   */
  const fetchParadas = useCallback(async (
    filters?: FetchOeeParadaFilters,
    page = 1,
    itemsPerPage = 25
  ): Promise<FetchOeeParadasResponse> => {
    try {
      console.log('🔍 useOeeParada: Iniciando busca. Filtros:', filters)
      setLoading(true)

      // Construir query base
      let query = supabase
        .from('tboee_parada')
        .select('*', { count: 'exact' })
        .eq('deletado', 'N')
        .order('codigo', { ascending: true })

      // Aplicar filtros se fornecidos
      if (filters?.componente) {
        query = query.ilike('componente', `%${filters.componente}%`)
      }
      if (filters?.classe) {
        query = query.ilike('classe', `%${filters.classe}%`)
      }
      if (filters?.natureza) {
        query = query.ilike('natureza', `%${filters.natureza}%`)
      }

      // Busca por termo (código, parada ou descrição)
      if (filters?.searchTerm) {
        const term = filters.searchTerm.trim()
        query = query.or(`codigo.ilike.%${term}%,parada.ilike.%${term}%,descricao.ilike.%${term}%,componente.ilike.%${term}%,classe.ilike.%${term}%,natureza.ilike.%${term}%`)
      }

      // Paginação
      const from = (page - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to)

      console.log('🔍 useOeeParada: Executando query no Supabase...')
      const { data, error, count } = await query

      if (error) {
        console.error('❌ useOeeParada: Erro na query:', error)
        throw error
      }

      console.log('✅ useOeeParada: Dados recebidos:', data?.length || 0, 'registros')

      const paradasMapeadas = (data || []).map((registro) => mapDbToForm(registro))
      setParadas(paradasMapeadas)

      return {
        data: paradasMapeadas,
        count: count || paradasMapeadas.length
      }
    } catch (error) {
      console.error('❌ useOeeParada: Erro ao buscar paradas OEE:', error)
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao buscar paradas OEE',
        description: errorMessage,
        variant: 'destructive'
      })
      return { data: [], count: 0 }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Busca uma parada OEE específica por ID
   */
  const fetchParada = useCallback(async (id: string): Promise<OeeParadaFormData | null> => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('tboee_parada')
        .select('*')
        .eq('oeeparada_id', parseInt(id))
        .eq('deletado', 'N')
        .single()

      if (error) throw error
      if (!data) {
        throw new Error('Parada OEE não encontrada')
      }

      return mapDbToForm(data)
    } catch (error) {
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao buscar parada OEE',
        description: errorMessage,
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Salva uma parada OEE (criar ou atualizar)
   *
   * @param formData - Dados do formulário
   * @param userId - UUID do usuário autenticado (auth.users.id)
   * @returns true se operação foi bem-sucedida
   *
   * IMPORTANTE: O userId deve ser um UUID válido do Supabase Auth,
   * pois as colunas created_by/updated_by são FKs para auth.users(id)
   */
  const saveParada = useCallback(async (
    formData: OeeParadaFormData,
    userId: string
  ): Promise<boolean> => {
    try {
      // Validar userId antes de prosseguir
      if (!isValidUUID(userId)) {
        console.error('❌ useOeeParada: userId inválido:', userId)
        toast({
          title: 'Erro de autenticação',
          description: 'Usuário não autenticado ou sessão inválida. Faça login novamente.',
          variant: 'destructive'
        })
        return false
      }

      setLoading(true)

      const isUpdate = !!formData.id && formData.id !== ''

      if (isUpdate) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('tboee_parada')
          .update({
            codigo: formData.codigo,
            componente: formData.componente || null,
            classe: formData.classe || null,
            natureza: formData.natureza || null,
            parada: formData.parada || null,
            descricao: formData.descricao || null,
            updated_at: new Date().toISOString(),
            updated_by: userId
          })
          .eq('oeeparada_id', parseInt(formData.id))

        if (error) throw error

        toast({
          title: 'Parada atualizada',
          description: 'O registro foi atualizado com sucesso.',
          variant: 'default'
        })
      } else {
        // Criar novo registro
        // Nota: created_at tem default no banco, mas enviamos para garantir timezone correto
        const { error } = await supabase
          .from('tboee_parada')
          .insert({
            codigo: formData.codigo,
            componente: formData.componente || null,
            classe: formData.classe || null,
            natureza: formData.natureza || null,
            parada: formData.parada || null,
            descricao: formData.descricao || null,
            created_by: userId,
            deletado: 'N'
          })

        if (error) throw error

        toast({
          title: 'Parada criada',
          description: 'O registro foi criado com sucesso.',
          variant: 'default'
        })
      }

      return true
    } catch (error) {
      console.error('❌ useOeeParada: Erro ao salvar:', error)
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao salvar parada OEE',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Exclui logicamente uma parada OEE (soft delete)
   *
   * @param id - ID da parada (oeeparada_id)
   * @param userId - UUID do usuário autenticado (auth.users.id)
   * @returns true se operação foi bem-sucedida
   *
   * IMPORTANTE: O userId deve ser um UUID válido do Supabase Auth,
   * pois a coluna deleted_by é FK para auth.users(id)
   */
  const deleteParada = useCallback(async (id: string, userId: string): Promise<boolean> => {
    try {
      // Validar userId antes de prosseguir
      if (!isValidUUID(userId)) {
        console.error('❌ useOeeParada: userId inválido para exclusão:', userId)
        toast({
          title: 'Erro de autenticação',
          description: 'Usuário não autenticado ou sessão inválida. Faça login novamente.',
          variant: 'destructive'
        })
        return false
      }

      setLoading(true)

      const { error } = await supabase
        .from('tboee_parada')
        .update({
          deletado: 'S',
          deleted_at: new Date().toISOString(),
          deleted_by: userId
        })
        .eq('oeeparada_id', parseInt(id))

      if (error) throw error

      toast({
        title: 'Parada excluída',
        description: 'O registro foi excluído com sucesso.',
        variant: 'default'
      })

      return true
    } catch (error) {
      console.error('❌ useOeeParada: Erro ao excluir:', error)
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao excluir parada OEE',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    paradas,
    fetchParadas,
    fetchParada,
    saveParada,
    deleteParada
  }
}
