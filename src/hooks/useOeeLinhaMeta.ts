/**
 * Hook customizado para gerenciamento de Metas OEE por Linha
 * Operações CRUD com a tabela tblinhaproducao_meta do Supabase
 */

import { useState, useCallback } from 'react'
import { supabase, handleSupabaseError } from '@/lib/supabase'
import {
  OeeLinhaMetaDB,
  OeeLinhaMetaFormData,
  FetchOeeLinhaMetaFilters,
  FetchOeeLinhaMetaResponse
} from '@/types/oee-linha-meta'
import { toast } from '@/hooks/use-toast'

const formatadorMeta = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

/**
 * Valida se o userId é um UUID válido (formato Supabase Auth)
 */
function isValidUUID(id: string | undefined | null): boolean {
  if (!id) return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

/**
 * Converte data do banco (yyyy-MM-dd) para formato brasileiro (dd/MM/yyyy)
 */
function converterDataIsoParaBr(dataIso: string | null | undefined): string {
  if (!dataIso) return ''
  const match = dataIso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return dataIso
  return `${match[3]}/${match[2]}/${match[1]}`
}

/**
 * Converte data de entrada (dd/MM/yyyy ou yyyy-MM-dd) para formato ISO (yyyy-MM-dd)
 */
function converterDataParaIso(data: string): string | null {
  const texto = data.trim()
  if (!texto) return null

  const matchIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (matchIso) return texto

  const matchBr = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!matchBr) return null

  const dia = Number(matchBr[1])
  const mes = Number(matchBr[2])
  const ano = Number(matchBr[3])
  const dataObj = new Date(ano, mes - 1, dia)

  if (
    dataObj.getFullYear() !== ano ||
    dataObj.getMonth() !== mes - 1 ||
    dataObj.getDate() !== dia
  ) {
    return null
  }

  return `${matchBr[3]}-${matchBr[2]}-${matchBr[1]}`
}

/**
 * Converte valor textual de meta (pt-BR ou padrão com ponto) para número
 */
function converterMetaParaNumero(meta: string | number | null | undefined): number | null {
  if (typeof meta === 'number') {
    return Number.isFinite(meta) ? meta : null
  }

  if (typeof meta !== 'string') {
    return null
  }

  const texto = meta.trim()
  if (!texto) {
    return null
  }

  const numeroNormalizado = texto.includes(',')
    ? Number(texto.replace(/\./g, '').replace(',', '.'))
    : Number(texto)

  return Number.isFinite(numeroNormalizado) ? numeroNormalizado : null
}

function extrairLinhaJoin(
  linhaJoin: OeeLinhaMetaDB['tblinhaproducao']
): { linhaproducao_id: number | null; linhaproducao: string | null } | null {
  if (!linhaJoin) return null
  if (Array.isArray(linhaJoin)) {
    return linhaJoin[0] || null
  }
  return linhaJoin
}

/**
 * Mapeia dados do banco para o formato do formulário/UI
 */
function mapDbToForm(db: OeeLinhaMetaDB): OeeLinhaMetaFormData {
  const linhaJoin = extrairLinhaJoin(db.tblinhaproducao)
  const metaNumero = converterMetaParaNumero(db.meta)

  return {
    id: db.linhameta_id.toString(),
    linhaProducaoId: db.linhaproducao_id,
    linhaProducaoNome: linhaJoin?.linhaproducao || '',
    dataInicio: converterDataIsoParaBr(db.data_inicio),
    dataFim: converterDataIsoParaBr(db.data_fim),
    meta: metaNumero !== null ? formatadorMeta.format(metaNumero) : '',
    observacao: db.observacao || '',
    createdAt: db.created_at || '',
    createdBy: db.created_by
  }
}

/**
 * Hook para gerenciar operações de Meta por Linha
 */
export function useOeeLinhaMeta() {
  const [loading, setLoading] = useState(false)
  const [linhasMeta, setLinhasMeta] = useState<OeeLinhaMetaFormData[]>([])

  /**
   * Busca lista de metas por linha com filtros opcionais
   */
  const fetchLinhasMeta = useCallback(async (
    filters?: FetchOeeLinhaMetaFilters,
    page = 1,
    itemsPerPage = 25
  ): Promise<FetchOeeLinhaMetaResponse> => {
    try {
      setLoading(true)

      let query = supabase
        .from('tblinhaproducao_meta')
        .select(`
          linhameta_id,
          data_inicio,
          data_fim,
          meta,
          linhaproducao_id,
          observacao,
          created_at,
          created_by,
          updated_at,
          updated_by,
          deleted_at,
          deleted_by,
          tblinhaproducao!left (
            linhaproducao_id,
            linhaproducao
          )
        `, { count: 'exact' })
        .is('deleted_at', null)
        .order('data_inicio', { ascending: false })
        .order('linhameta_id', { ascending: false })

      if (filters?.linhaProducaoId) {
        query = query.eq('linhaproducao_id', filters.linhaProducaoId)
      }

      if (filters?.searchTerm) {
        const term = filters.searchTerm.trim()
        if (term) {
          if (/^\d+$/.test(term)) {
            query = query.or(`linhameta_id.eq.${term},linhaproducao_id.eq.${term}`)
          } else {
            query = query.ilike('observacao', `%${term}%`)
          }
        }
      }

      const from = (page - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      const metasMapeadas = (data || []).map((registro) => mapDbToForm(registro as OeeLinhaMetaDB))
      setLinhasMeta(metasMapeadas)

      return {
        data: metasMapeadas,
        count: count || metasMapeadas.length
      }
    } catch (error) {
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao buscar metas por linha',
        description: errorMessage,
        variant: 'destructive'
      })
      return { data: [], count: 0 }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Busca uma meta específica por ID
   */
  const fetchLinhaMeta = useCallback(async (id: string): Promise<OeeLinhaMetaFormData | null> => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('tblinhaproducao_meta')
        .select(`
          linhameta_id,
          data_inicio,
          data_fim,
          meta,
          linhaproducao_id,
          observacao,
          created_at,
          created_by,
          updated_at,
          updated_by,
          deleted_at,
          deleted_by,
          tblinhaproducao!left (
            linhaproducao_id,
            linhaproducao
          )
        `)
        .eq('linhameta_id', Number(id))
        .is('deleted_at', null)
        .maybeSingle()

      if (error) throw error
      if (!data) {
        throw new Error('Meta por linha não encontrada')
      }

      return mapDbToForm(data as OeeLinhaMetaDB)
    } catch (error) {
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao buscar meta por linha',
        description: errorMessage,
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Salva meta por linha (criar ou atualizar)
   */
  const saveLinhaMeta = useCallback(async (
    formData: OeeLinhaMetaFormData,
    userId: string
  ): Promise<boolean> => {
    try {
      if (!isValidUUID(userId)) {
        toast({
          title: 'Erro de autenticação',
          description: 'Usuário não autenticado ou sessão inválida. Faça login novamente.',
          variant: 'destructive'
        })
        return false
      }

      setLoading(true)

      const dataInicioIso = converterDataParaIso(formData.dataInicio)
      const dataFimIso = converterDataParaIso(formData.dataFim)
      const metaNumero = converterMetaParaNumero(formData.meta)

      const payloadBase = {
        linhaproducao_id: formData.linhaProducaoId,
        data_inicio: dataInicioIso,
        data_fim: dataFimIso,
        meta: metaNumero,
        observacao: formData.observacao.trim() || null,
      }

      const isUpdate = Boolean(formData.id)
      if (isUpdate) {
        const { error } = await supabase
          .from('tblinhaproducao_meta')
          .update({
            ...payloadBase,
            updated_at: new Date().toISOString(),
            updated_by: userId
          })
          .eq('linhameta_id', Number(formData.id))

        if (error) throw error

        toast({
          title: 'Meta atualizada',
          description: 'O registro foi atualizado com sucesso.',
          variant: 'default'
        })
      } else {
        const { error } = await supabase
          .from('tblinhaproducao_meta')
          .insert({
            ...payloadBase,
            created_by: userId
          })

        if (error) throw error

        toast({
          title: 'Meta criada',
          description: 'O registro foi criado com sucesso.',
          variant: 'default'
        })
      }

      return true
    } catch (error) {
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao salvar meta por linha',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Exclui logicamente uma meta por linha (soft delete)
   */
  const deleteLinhaMeta = useCallback(async (id: string, userId: string): Promise<boolean> => {
    try {
      if (!isValidUUID(userId)) {
        toast({
          title: 'Erro de autenticação',
          description: 'Usuário não autenticado ou sessão inválida. Faça login novamente.',
          variant: 'destructive'
        })
        return false
      }

      setLoading(true)

      const { error } = await supabase
        .from('tblinhaproducao_meta')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: userId
        })
        .eq('linhameta_id', Number(id))

      if (error) throw error

      toast({
        title: 'Meta excluída',
        description: 'O registro foi excluído com sucesso.',
        variant: 'default'
      })

      return true
    } catch (error) {
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao excluir meta por linha',
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
    linhasMeta,
    fetchLinhasMeta,
    fetchLinhaMeta,
    saveLinhaMeta,
    deleteLinhaMeta
  }
}
