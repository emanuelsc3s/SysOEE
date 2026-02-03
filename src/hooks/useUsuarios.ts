/**
 * Hook customizado para gerenciamento de Usuários
 * Operações CRUD com a tabela tbusuario do Supabase
 */

import { useState, useCallback, useRef } from 'react'
import { supabase, handleSupabaseError } from '@/lib/supabase'
import {
  UsuarioFormData,
  UsuarioDB,
  UsuarioCreateData,
  CreateUserResponse
} from '@/types/usuario'
import { toast } from '@/hooks/use-toast'
import { gerarTimestampLocal } from '@/utils/datahora.utils'

/**
 * Filtros para busca de usuários
 */
export interface FetchUsuariosFilters {
  login?: string
  usuario?: string
  email?: string
  perfilId?: number
}

/**
 * Hook para gerenciar operações CRUD de usuários
 */
export function useUsuarios() {
  const [loading, setLoading] = useState(false)
  const [usuarios, setUsuarios] = useState<UsuarioFormData[]>([])
  const edgeFunctionDisponivelRef = useRef(true)

  /**
   * Mapeia dados do banco para o formato do formulário
   */
  const mapDbToForm = useCallback((dbUsuario: UsuarioDB): UsuarioFormData => {
    return {
      id: dbUsuario.usuario_id.toString(),
      userId: dbUsuario.user_id || undefined,
      login: dbUsuario.login || '',
      email: dbUsuario.email || '',
      usuario: dbUsuario.usuario || '',
      perfilId: dbUsuario.perfil_id || undefined,
      perfil: dbUsuario.perfil || '',
      funcionarioId: dbUsuario.funcionario_id || undefined,
      matricula: dbUsuario.matricula || '',
      ramal: dbUsuario.ramal || '',
      whatsapp: dbUsuario.whatsapp || '',
      deletado: (dbUsuario.deletado as 'N' | 'S') || 'N',
      createdAt: dbUsuario.created_at || undefined,
      createdBy: dbUsuario.created_by || undefined,
      createdNome: dbUsuario.created_nome || undefined,
      updatedAt: dbUsuario.updated_at || undefined,
      updatedBy: dbUsuario.updated_by || undefined,
      updatedNome: dbUsuario.updated_nome || undefined,
      deletedAt: dbUsuario.deleted_at || undefined,
      deletedBy: dbUsuario.deleted_by || undefined,
    }
  }, [])

  /**
   * Mapeia dados do formulário para o formato do banco
   */
  const mapFormToDb = useCallback((formData: UsuarioFormData): Partial<UsuarioDB> => {
    const dbData: Partial<UsuarioDB> = {
      login: formData.login,
      usuario: formData.usuario || null,
      perfil_id: formData.perfilId || null,
      funcionario_id: formData.funcionarioId || null,
      ramal: formData.ramal || null,
      whatsapp: formData.whatsapp || null,
      deletado: formData.deletado || 'N',
    }

    return dbData
  }, [])

  /**
   * Busca o email do usuário no auth.users via função RPC (SECURITY DEFINER)
   * A função retorna apenas o email, sem expor outros dados sensíveis
   */
  const fetchEmailFromAuthByLogin = useCallback(async (login: string): Promise<string | null> => {
    if (!login?.trim()) return null

    try {
      const { data, error } = await supabase.rpc('get_email_by_username', {
        username: login.trim()
      })

      if (error) {
        console.error('Erro ao buscar email no auth.users:', error)
        return null
      }

      if (typeof data === 'string' && data.trim()) {
        return data
      }

      return null
    } catch (error) {
      console.error('Erro ao buscar email no auth.users:', error)
      return null
    }
  }, [])

  /**
   * Busca o email do usuário no auth.users via Edge Function
   * Preferencialmente usa o user_id (mais estável); fallback para login/RPC
   */
  const fetchEmailFromAuth = useCallback(async (userId?: string, login?: string): Promise<string | null> => {
    try {
      if (!edgeFunctionDisponivelRef.current) {
        return login ? await fetchEmailFromAuthByLogin(login) : null
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      if (!supabaseUrl) {
        return login ? await fetchEmailFromAuthByLogin(login) : null
      }

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      if (!token) {
        return login ? await fetchEmailFromAuthByLogin(login) : null
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/get-user-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: userId,
          login
        })
      })

      if (!response.ok) {
        return login ? await fetchEmailFromAuthByLogin(login) : null
      }

      const result = await response.json() as { success?: boolean; email?: string | null }
      if (result?.success && result.email) {
        return result.email
      }

      return login ? await fetchEmailFromAuthByLogin(login) : null
    } catch (error) {
      if (error instanceof TypeError) {
        edgeFunctionDisponivelRef.current = false
      }
      console.error('Erro ao buscar email no auth.users via Edge Function:', error)
      return login ? await fetchEmailFromAuthByLogin(login) : null
    }
  }, [fetchEmailFromAuthByLogin])

  /**
   * Busca lista de usuários com filtros opcionais
   */
  const fetchUsuarios = useCallback(async (filters?: FetchUsuariosFilters) => {
    try {
      console.log('useUsuarios: Iniciando busca de usuários. Filtros:', filters)
      setLoading(true)

      let query = supabase
        .from('tbusuario')
        .select('*')
        .eq('deletado', 'N')
        .order('login', { ascending: true })

      // Aplicar filtros se fornecidos
      if (filters?.login) {
        query = query.ilike('login', `%${filters.login}%`)
      }
      if (filters?.usuario) {
        query = query.ilike('usuario', `%${filters.usuario}%`)
      }
      if (filters?.email) {
        query = query.ilike('email', `%${filters.email}%`)
      }
      if (filters?.perfilId) {
        query = query.eq('perfil_id', filters.perfilId)
      }

      console.log('useUsuarios: Executando query no Supabase...')
      const { data, error, count } = await query

      if (error) {
        console.error('useUsuarios: Erro na query:', error)
        throw error
      }

      console.log('useUsuarios: Dados recebidos do Supabase:', data)
      console.log('useUsuarios: Total de registros:', data?.length || 0)

      const usuariosMapeados = (data || []).map(mapDbToForm)
      console.log('useUsuarios: Usuários mapeados:', usuariosMapeados)

      // Enriquecer emails consultando o auth.users (Edge Function/RPC) como no cadastro
      const usuariosComEmail = await Promise.all(
        usuariosMapeados.map(async (usuario) => {
          const emailAuth = await fetchEmailFromAuth(usuario.userId, usuario.login)
          if (!emailAuth || emailAuth === usuario.email) {
            return usuario
          }
          return {
            ...usuario,
            email: emailAuth
          }
        })
      )

      setUsuarios(usuariosComEmail)

      return {
        data: usuariosComEmail,
        count: count || usuariosComEmail.length
      }
    } catch (error) {
      console.error('useUsuarios: Erro ao buscar usuários:', error)
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao buscar usuários',
        description: errorMessage,
        variant: 'destructive'
      })
      return { data: [], count: 0 }
    } finally {
      setLoading(false)
    }
  }, [mapDbToForm, fetchEmailFromAuth])

  /**
   * Busca um usuário específico por ID
   */
  const fetchUsuario = useCallback(async (id: string): Promise<UsuarioFormData> => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('tbusuario')
        .select('*')
        .eq('usuario_id', parseInt(id))
        .eq('deletado', 'N')
        .single()

      if (error) throw error
      if (!data) {
        throw new Error('Usuário não encontrado')
      }

      const usuarioMapeado = mapDbToForm(data)
      const emailAuth = await fetchEmailFromAuth(usuarioMapeado.userId, usuarioMapeado.login)

      return {
        ...usuarioMapeado,
        email: emailAuth ?? usuarioMapeado.email
      }
    } catch (error) {
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao buscar usuário',
        description: errorMessage,
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [mapDbToForm, fetchEmailFromAuth])

  /**
   * Cria um novo usuário via Edge Function
   * A Edge Function cuida de criar em auth.users e tbusuario
   */
  const createUsuario = useCallback(async (formData: UsuarioCreateData): Promise<CreateUserResponse> => {
    try {
      setLoading(true)

      // Obter token JWT do usuário atual
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      if (!token) {
        throw new Error('Usuário não autenticado')
      }

      const createdAt = (formData.createdAt || '').trim() || gerarTimestampLocal()
      const usuarioIdInformado = (formData.id || '').trim()
      const usuarioId = usuarioIdInformado && /^\d+$/.test(usuarioIdInformado)
        ? parseInt(usuarioIdInformado, 10)
        : undefined

      // Chamar Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const response = await fetch(`${supabaseUrl}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: formData.email,
          senha: formData.senha,
          login: formData.login,
          usuario: formData.usuario,
          perfil_id: formData.perfilId,
          funcionario_id: formData.funcionarioId,
          usuario_id: usuarioId,
          created_at: createdAt
        })
      })

      const result: CreateUserResponse = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || 'Erro ao criar usuário')
      }

      toast({
        title: 'Sucesso',
        description: 'Usuário cadastrado com sucesso',
        variant: 'default'
      })

      return result
    } catch (error) {
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao criar usuário',
        description: errorMessage,
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Atualiza um usuário existente (apenas dados em tbusuario, não altera auth.users)
   */
  const updateUsuario = useCallback(async (formData: UsuarioFormData): Promise<UsuarioDB> => {
    try {
      setLoading(true)

      if (!formData.id) {
        throw new Error('ID do usuário é obrigatório para atualização')
      }

      const dbData = mapFormToDb(formData)

      const updateData = {
        ...dbData,
        updated_at: new Date().toISOString(),
        // TODO: Reativar quando autenticação estiver implementada
        // updated_by: usuarioId
      }

      const { data, error } = await supabase
        .from('tbusuario')
        .update(updateData)
        .eq('usuario_id', parseInt(formData.id))
        .select()
        .single()

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Usuário atualizado com sucesso',
        variant: 'default'
      })

      return data
    } catch (error) {
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao atualizar usuário',
        description: errorMessage,
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [mapFormToDb])

  /**
   * Exclui um usuário (soft delete)
   * Nota: Não exclui do auth.users, apenas marca como deletado em tbusuario
   */
  const deleteUsuario = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true)

      const { error } = await supabase
        .from('tbusuario')
        .update({
          deletado: 'S',
          deleted_at: new Date().toISOString(),
          // TODO: Reativar quando autenticação estiver implementada
          // deleted_by: usuarioId
        })
        .eq('usuario_id', parseInt(id))

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Usuário excluído com sucesso',
        variant: 'default'
      })
    } catch (error) {
      const errorMessage = handleSupabaseError(error)
      toast({
        title: 'Erro ao excluir usuário',
        description: errorMessage,
        variant: 'destructive'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Verifica se um login já existe no sistema
   */
  const checkLoginExists = useCallback(async (login: string, excludeId?: string): Promise<{ exists: boolean; error?: string }> => {
    try {
      let query = supabase
        .from('tbusuario')
        .select('usuario_id')
        .eq('login', login)
        .eq('deletado', 'N')

      if (excludeId) {
        query = query.neq('usuario_id', parseInt(excludeId))
      }

      const { data, error } = await query

      if (error) throw error

      return { exists: (data?.length || 0) > 0 }
    } catch (error) {
      console.error('Erro ao verificar login:', error)
      return { exists: false, error: handleSupabaseError(error) }
    }
  }, [])

  /**
   * Verifica se um usuário ID (usuario_id) já existe no sistema
   */
  const checkUsuarioIdExists = useCallback(async (usuarioId: number, excludeId?: string): Promise<{ exists: boolean; error?: string }> => {
    try {
      let query = supabase
        .from('tbusuario')
        .select('usuario_id')
        .eq('usuario_id', usuarioId)
        .eq('deletado', 'N')

      if (excludeId) {
        query = query.neq('usuario_id', parseInt(excludeId))
      }

      const { data, error } = await query

      if (error) throw error

      return { exists: (data?.length || 0) > 0 }
    } catch (error) {
      console.error('Erro ao verificar usuário ID:', error)
      return { exists: false, error: handleSupabaseError(error) }
    }
  }, [])

  /**
   * Verifica se um email já existe no sistema
   */
  const checkEmailExists = useCallback(async (email: string, excludeId?: string): Promise<{ exists: boolean; error?: string }> => {
    try {
      let query = supabase
        .from('tbusuario')
        .select('usuario_id')
        .eq('email', email)
        .eq('deletado', 'N')

      if (excludeId) {
        query = query.neq('usuario_id', parseInt(excludeId))
      }

      const { data, error } = await query

      if (error) throw error

      return { exists: (data?.length || 0) > 0 }
    } catch (error) {
      console.error('Erro ao verificar email:', error)
      return { exists: false, error: handleSupabaseError(error) }
    }
  }, [])

  return {
    loading,
    usuarios,
    fetchUsuarios,
    fetchUsuario,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    checkLoginExists,
    checkUsuarioIdExists,
    checkEmailExists
  }
}
