/**
 * Hook de Autenticação
 *
 * Gerencia o estado de autenticação do usuário usando Supabase Auth.
 * Fornece dados do usuário autenticado e função de logout.
 *
 * @module hooks/useAuth
 *
 * @example
 * ```tsx
 * const { user, isLoading, signOut } = useAuth()
 *
 * if (isLoading) {
 *   return <LoadingSpinner />
 * }
 *
 * return (
 *   <div>
 *     <p>Olá, {user?.email}</p>
 *     <button onClick={signOut}>Sair</button>
 *   </div>
 * )
 * ```
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

/**
 * Dados do usuário autenticado
 */
interface AuthUser {
  /** UUID do Supabase Auth */
  id: string
  /** Email do usuário */
  email: string | null
  /** Nome de usuário (da tbusuario) */
  usuario: string | null
  /** Perfil do usuário (da tbusuario) */
  perfil: string | null
}

/**
 * Retorno do hook useAuth
 */
interface UseAuthReturn {
  /** Dados do usuário autenticado (null se não autenticado) */
  user: AuthUser | null
  /** Indica se está carregando dados de autenticação */
  isLoading: boolean
  /** Função para fazer logout do sistema */
  signOut: () => Promise<void>
}

/**
 * Hook para gerenciar autenticação do usuário
 *
 * Funcionalidades:
 * - Verifica sessão inicial do Supabase
 * - Escuta mudanças de autenticação em tempo real
 * - Fornece função de logout com feedback visual
 * - Sincroniza estado entre múltiplas abas
 *
 * @returns {UseAuthReturn} Estado de autenticação e função de logout
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  /**
   * Busca os dados do usuário na tabela tbusuario
   * @param userId - UUID do usuário no Supabase Auth
   * @returns Dados do usuário (usuario, perfil) ou null se não encontrado
   */
  const fetchUserData = useCallback(async (userId: string): Promise<{ usuario: string | null; perfil: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('tbusuario')
        .select('usuario, perfil')
        .eq('user_id', userId)
        .eq('deletado', 'N')
        .single()

      if (error || !data) {
        return { usuario: null, perfil: null }
      }

      return { usuario: data.usuario, perfil: data.perfil }
    } catch {
      return { usuario: null, perfil: null }
    }
  }, [])

  /**
   * Atualiza o estado do usuário com dados do Auth e da tbusuario
   */
  const updateUserState = useCallback(async (authUser: { id: string; email: string | null } | null) => {
    if (!authUser) {
      setUser(null)
      setIsLoading(false)
      return
    }

    const userData = await fetchUserData(authUser.id)
    setUser({
      id: authUser.id,
      email: authUser.email,
      usuario: userData.usuario,
      perfil: userData.perfil
    })
    setIsLoading(false)
  }, [fetchUserData])

  useEffect(() => {
    /**
     * Verificar sessão inicial
     * Busca a sessão atual do Supabase ao montar o componente
     */
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateUserState(session?.user ? { id: session.user.id, email: session.user.email ?? null } : null)
    })

    /**
     * Escutar mudanças de autenticação
     * Atualiza o estado quando:
     * - Usuário faz login/logout
     * - Token é renovado
     * - Sessão expira
     * - Logout acontece em outra aba (sincronização automática)
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateUserState(session?.user ? { id: session.user.id, email: session.user.email ?? null } : null)
    })

    // Cleanup: cancelar subscription ao desmontar
    return () => subscription.unsubscribe()
  }, [updateUserState])

  /**
   * Realiza logout do sistema
   *
   * Fluxo:
   * 1. Mostra toast "Saindo do sistema..."
   * 2. Chama supabase.auth.signOut()
   * 3. Se sucesso: navega para /login
   * 4. Se erro: mostra toast de erro
   *
   * Observações:
   * - onAuthStateChange detectará o logout e atualizará o estado
   * - ProtectedRoute redirecionará automaticamente para /login
   * - Múltiplas abas serão sincronizadas automaticamente
   */
  const signOut = async () => {
    try {
      // Feedback visual: início do logout
      toast({
        title: "Saindo do sistema...",
        description: "Aguarde um momento"
      })

      // Chamar API de logout do Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Erro ao fazer logout:', error)
        toast({
          variant: "destructive",
          title: "Erro ao sair",
          description: "Não foi possível encerrar a sessão. Tente novamente."
        })
        return
      }

      // Navegação manual para login (redundante com ProtectedRoute, mas garante)
      navigate('/login')
    } catch (err) {
      console.error('Erro inesperado no logout:', err)
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao sair. Recarregue a página."
      })
    }
  }

  return { user, isLoading, signOut }
}
