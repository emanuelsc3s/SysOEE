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

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'

/**
 * Dados do usuário autenticado
 */
interface AuthUser {
  /** UUID do Supabase Auth */
  id: string
  /** Email do usuário */
  email: string | null
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

  useEffect(() => {
    /**
     * Verificar sessão inicial
     * Busca a sessão atual do Supabase ao montar o componente
     */
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null)
      setIsLoading(false)
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
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null)
      setIsLoading(false)
    })

    // Cleanup: cancelar subscription ao desmontar
    return () => subscription.unsubscribe()
  }, [])

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
