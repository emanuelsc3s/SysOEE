/**
 * Hook customizado para gerenciamento de Velocidade Nominal
 * Operações CRUD com a tabela tbvelocidadenominal do Supabase
 */

import { useState, useCallback } from 'react'
import { supabase, handleSupabaseError } from '@/lib/supabase'
import {
  VelocidadeNominalComJoins,
  VelocidadeNominalFormData,
  FetchVelocidadeNominalFilters,
  FetchVelocidadesResponse
} from '@/types/velocidadenominal'
import { toast } from '@/hooks/use-toast'

/**
 * Mapeia dados do banco para o formato do formulário/UI
 */
function mapDbToForm(db: VelocidadeNominalComJoins): VelocidadeNominalFormData {
  return {
    id: db.velocidade_id.toString(),
    linhaProducaoId: db.linhaproducao_id,
    linhaProducaoNome: db.tblinhaproducao?.linhaproducao || '',
    produtoId: db.produto_id,
    produtoCodigo: db.tbproduto?.referencia || '',
    produtoDescricao: db.tbproduto?.descricao || '',
    velocidade: db.velocidade,
    observacao: db.observacao,
    createdAt: db.created_at,
    createdBy: db.created_by
  }
}

/**
 * Hook para gerenciar operações de Velocidade Nominal
 */
export function useVelocidadeNominal() {
  const [loading, setLoading] = useState(false)
  const [velocidades, setVelocidades] = useState<VelocidadeNominalFormData[]>([])

  /**
   * Busca lista de velocidades nominais com filtros opcionais e paginação
   */
  const fetchVelocidades = useCallback(async (
    filters?: FetchVelocidadeNominalFilters,
    page = 1,
    itemsPerPage = 25
  ): Promise<FetchVelocidadesResponse> => {
    try {
      console.log('🔍 useVelocidadeNominal: Iniciando busca. Filtros:', filters)
      setLoading(true)

      // Construir query base com JOINs
      // Ordenacao por campos de tabelas relacionadas sera feita apos o mapeamento
      let query = supabase
        .from('tbvelocidadenominal')
        .select(`
          *,
          tblinhaproducao!left (
            linhaproducao,
            departamento_id
          ),
          tbproduto!left (
            referencia,
            descricao
          )
        `, { count: 'exact' })
        .eq('deletado', 'N')

      // Aplicar filtros se fornecidos
      if (filters?.linhaProducaoId) {
        query = query.eq('linhaproducao_id', filters.linhaProducaoId)
      }
      if (filters?.produtoId) {
        query = query.eq('produto_id', filters.produtoId)
      }

      // Paginação
      const from = (page - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to)

      console.log('🔍 useVelocidadeNominal: Executando query no Supabase...')
      const { data, error, count } = await query

      if (error) {
        console.error('❌ useVelocidadeNominal: Erro na query:', error)
        throw error
      }

      console.log('✅ useVelocidadeNominal: Dados recebidos:', data?.length || 0, 'registros')

      // Mapear e ordenar por linha de producao (alfabetica) e referencia do produto
      const velocidadesMapeadas = (data || [])
        .map(mapDbToForm)
        .sort((a, b) => {
          // Primeiro: ordenar por linha de producao (alfabetica)
          const linhaA = (a.linhaProducaoNome || '').toLowerCase()
          const linhaB = (b.linhaProducaoNome || '').toLowerCase()
          if (linhaA < linhaB) return -1
          if (linhaA > linhaB) return 1
          // Segundo: ordenar por referencia do produto (alfabetica)
          const produtoA = (a.produtoCodigo || '').toLowerCase()
          const produtoB = (b.produtoCodigo || '').toLowerCase()
          if (produtoA < produtoB) return -1
          if (produtoA > produtoB) return 1
          return 0
        })

      setVelocidades(velocidadesMapeadas)

      return {
        data: velocidadesMapeadas,
        count: count || velocidadesMapeadas.length
      }
    } catch (error) {
      console.error('❌ useVelocidadeNominal: Erro ao buscar velocidades:', error)
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao buscar velocidades nominais',
        description: errorMessage,
        variant: 'destructive'
      })
      return { data: [], count: 0 }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Busca uma velocidade nominal específica por ID
   */
  const fetchVelocidade = async (id: string): Promise<VelocidadeNominalFormData | null> => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('tbvelocidadenominal')
        .select(`
          *,
          tblinhaproducao!left (
            linhaproducao,
            departamento_id
          ),
          tbproduto!left (
            referencia,
            descricao
          )
        `)
        .eq('velocidade_id', parseInt(id))
        .eq('deletado', 'N')
        .single()

      if (error) throw error
      if (!data) {
        throw new Error('Velocidade nominal não encontrada')
      }

      return mapDbToForm(data)
    } catch (error) {
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao buscar velocidade nominal',
        description: errorMessage,
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Salva velocidade nominal (criar ou atualizar)
   */
  const saveVelocidade = async (
    formData: VelocidadeNominalFormData,
    userId: number
  ): Promise<boolean> => {
    try {
      setLoading(true)

      // Verificar duplicata (mesma linha + produto)
      if (formData.linhaProducaoId && formData.produtoId) {
        let duplicateQuery = supabase
          .from('tbvelocidadenominal')
          .select('velocidade_id')
          .eq('linhaproducao_id', formData.linhaProducaoId)
          .eq('produto_id', formData.produtoId)
          .eq('deletado', 'N')

        // Se estiver editando, excluir o próprio registro da verificação
        if (formData.id) {
          duplicateQuery = duplicateQuery.neq('velocidade_id', parseInt(formData.id))
        }

        const { data: existente } = await duplicateQuery.maybeSingle()

        if (existente) {
          toast({
            title: 'Velocidade já cadastrada',
            description: 'Já existe uma velocidade nominal para esta linha e produto.',
            variant: 'destructive'
          })
          return false
        }
      }

      const dbData = {
        linhaproducao_id: formData.linhaProducaoId,
        produto_id: formData.produtoId,
        velocidade: formData.velocidade,
        observacao: formData.observacao || null
      }

      if (formData.id) {
        // Atualizar
        // NOTA: Devido à inconsistência do schema, salvamos o user_id em updated_at
        // e o timestamp em updated_by
        const { error } = await supabase
          .from('tbvelocidadenominal')
          .update({
            ...dbData,
            updated_at: userId, // FK usuario (campo invertido no schema)
            updated_by: new Date().toISOString() // timestamp (campo invertido no schema)
          })
          .eq('velocidade_id', parseInt(formData.id))

        if (error) throw error

        toast({
          title: 'Velocidade atualizada',
          description: 'Registro atualizado com sucesso.'
        })
      } else {
        // Criar
        const { error } = await supabase
          .from('tbvelocidadenominal')
          .insert({
            ...dbData,
            created_by: userId,
            deletado: 'N',
            sync: 'N'
          })

        if (error) throw error

        toast({
          title: 'Velocidade criada',
          description: 'Registro criado com sucesso.'
        })
      }

      return true
    } catch (error) {
      console.error('❌ useVelocidadeNominal: Erro ao salvar:', error)
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao salvar velocidade',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Exclui logicamente uma velocidade nominal (soft delete)
   */
  const deleteVelocidade = async (id: string, userId: number): Promise<boolean> => {
    try {
      setLoading(true)

      // NOTA: Devido à inconsistência do schema, salvamos o user_id em deleted_at
      // e o timestamp em deleted_by
      const { error } = await supabase
        .from('tbvelocidadenominal')
        .update({
          deletado: 'S',
          deleted_at: userId, // FK usuario (campo invertido no schema)
          deleted_by: new Date().toISOString() // timestamp (campo invertido no schema)
        })
        .eq('velocidade_id', parseInt(id))

      if (error) throw error

      toast({
        title: 'Velocidade excluída',
        description: 'O registro foi excluído com sucesso.'
      })

      return true
    } catch (error) {
      console.error('❌ useVelocidadeNominal: Erro ao excluir:', error)
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao excluir velocidade',
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
    velocidades,
    fetchVelocidades,
    fetchVelocidade,
    saveVelocidade,
    deleteVelocidade
  }
}
