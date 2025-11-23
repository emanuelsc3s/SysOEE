/**
 * Hook customizado para gerenciamento de Turnos
 * Operações CRUD com a tabela tbturno do Supabase
 */

import { useState } from 'react'
import { supabaseAdmin, handleSupabaseError } from '@/lib/supabase'
// TODO: Reativar import quando autenticação for implementada
// import { getUserIdFromTbusuario } from '@/lib/supabase'
import { TurnoFormData, TurnoDB } from '@/types/turno'
import { toast } from '@/hooks/use-toast'

/**
 * Filtros para busca de turnos
 */
export interface FetchTurnosFilters {
  codigo?: string
  turno?: string
}

/**
 * Hook para gerenciar operações CRUD de turnos
 */
export function useTurnos() {
  const [loading, setLoading] = useState(false)
  const [turnos, setTurnos] = useState<TurnoFormData[]>([])

  /**
   * Mapeia dados do banco para o formato do formulário
   */
  const mapDbToForm = (dbTurno: TurnoDB): TurnoFormData => {
    return {
      id: dbTurno.turno_id.toString(),
      codigo: dbTurno.codigo,
      turno: dbTurno.turno || '',
      horaInicio: dbTurno.hora_inicio || '',
      horaFim: dbTurno.hora_fim || '',
      metaOee: dbTurno.meta_oee || 85.0,
      deletado: (dbTurno.deletado as 'N' | 'S') || 'N',
      createdAt: dbTurno.created_at || undefined,
      createdBy: dbTurno.created_by || undefined,
      updatedAt: dbTurno.updated_at || undefined,
      updatedBy: dbTurno.updated_by || undefined,
      deletedAt: dbTurno.deleted_at || undefined,
      deletedBy: dbTurno.deleted_by || undefined,
    }
  }

  /**
   * Mapeia dados do formulário para o formato do banco
   */
  const mapFormToDb = (formData: TurnoFormData): Partial<TurnoDB> => {
    const dbData: Partial<TurnoDB> = {
      codigo: formData.codigo,
      turno: formData.turno || null,
      hora_inicio: formData.horaInicio || null,
      hora_fim: formData.horaFim || null,
      meta_oee: formData.metaOee || null,
      deletado: formData.deletado || 'N',
    }

    return dbData
  }

  /**
   * Busca lista de turnos com filtros opcionais
   */
  const fetchTurnos = async (filters?: FetchTurnosFilters) => {
    try {
      setLoading(true)

      let query = supabaseAdmin
        .from('tbturno')
        .select('*')
        .eq('deletado', 'N')
        .order('codigo', { ascending: true })

      // Aplicar filtros se fornecidos
      if (filters?.codigo) {
        query = query.ilike('codigo', `%${filters.codigo}%`)
      }
      if (filters?.turno) {
        query = query.ilike('turno', `%${filters.turno}%`)
      }

      const { data, error, count } = await query

      if (error) throw error

      const turnosMapeados = (data || []).map(mapDbToForm)
      setTurnos(turnosMapeados)

      return {
        data: turnosMapeados,
        count: count || turnosMapeados.length
      }
    } catch (error) {
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao buscar turnos',
        description: errorMessage,
        variant: 'destructive'
      })
      return { data: [], count: 0 }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Busca um turno específico por ID
   */
  const fetchTurno = async (id: string): Promise<TurnoFormData> => {
    try {
      setLoading(true)

      const { data, error } = await supabaseAdmin
        .from('tbturno')
        .select('*')
        .eq('turno_id', parseInt(id))
        .eq('deletado', 'N')
        .single()

      if (error) throw error
      if (!data) {
        throw new Error('Turno não encontrado')
      }

      return mapDbToForm(data)
    } catch (error) {
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao buscar turno',
        description: errorMessage,
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  /**
   * Salva um turno (inserir ou atualizar)
   */
  const saveTurno = async (formData: TurnoFormData) => {
    try {
      setLoading(true)

      // TODO: Reativar campos de auditoria quando sistema de autenticação for implementado
      // const usuarioId = await getUserIdFromTbusuario()
      // if (!usuarioId) {
      //   throw new Error('Usuário não encontrado')
      // }

      const dbData = mapFormToDb(formData)

      if (formData.id) {
        // Atualizar
        const updateData = {
          ...dbData,
          updated_at: new Date().toISOString(),
          // TODO: Reativar quando autenticação estiver implementada
          // updated_by: usuarioId
        }

        const { data, error } = await supabaseAdmin
          .from('tbturno')
          .update(updateData)
          .eq('turno_id', parseInt(formData.id))
          .select()
          .single()

        if (error) throw error

        toast({
          title: 'Sucesso',
          description: 'Turno atualizado com sucesso',
          variant: 'default'
        })

        return data
      } else {
        // Inserir
        const insertData = {
          ...dbData,
          created_at: new Date().toISOString(),
          // TODO: Reativar quando autenticação estiver implementada
          // created_by: usuarioId
        }

        const { data, error } = await supabaseAdmin
          .from('tbturno')
          .insert(insertData)
          .select()
          .single()

        if (error) throw error

        toast({
          title: 'Sucesso',
          description: 'Turno cadastrado com sucesso',
          variant: 'default'
        })

        return data
      }
    } catch (error) {
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao salvar turno',
        description: errorMessage,
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  /**
   * Exclui um turno (soft delete)
   */
  const deleteTurno = async (id: string) => {
    try {
      setLoading(true)

      // TODO: Reativar campos de auditoria quando sistema de autenticação for implementado
      // const usuarioId = await getUserIdFromTbusuario()
      // if (!usuarioId) {
      //   throw new Error('Usuário não encontrado')
      // }

      const { error } = await supabaseAdmin
        .from('tbturno')
        .update({
          deletado: 'S',
          deleted_at: new Date().toISOString(),
          // TODO: Reativar quando autenticação estiver implementada
          // deleted_by: usuarioId
        })
        .eq('turno_id', parseInt(id))

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Turno excluído com sucesso',
        variant: 'default'
      })
    } catch (error) {
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao excluir turno',
        description: errorMessage,
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    turnos,
    fetchTurnos,
    fetchTurno,
    saveTurno,
    deleteTurno
  }
}

