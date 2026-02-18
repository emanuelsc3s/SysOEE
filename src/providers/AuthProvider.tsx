import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { AuthContext, type AuthUser, type UseAuthReturn } from '@/contexts/auth.context'
import { limparAtividadeAuth, registrarAtividadeAuth } from '@/lib/auth-storage'

interface AuthProviderProps {
  children: ReactNode
}

const AUTH_BOOTSTRAP_TIMEOUT_MS = 7000
const AUTH_USERDATA_TIMEOUT_MS = 5000

class AuthTimeoutError extends Error {
  constructor(etapa: string, timeoutMs: number) {
    super(`[AUTH_TIMEOUT] ${etapa} excedeu ${timeoutMs}ms`)
    this.name = 'AuthTimeoutError'
  }
}

/**
 * Garante que chamadas críticas de autenticação não mantenham loading infinito.
 */
function runWithTimeout<T>(promise: Promise<T>, timeoutMs: number, etapa: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timerId = window.setTimeout(() => {
      reject(new AuthTimeoutError(etapa, timeoutMs))
    }, timeoutMs)

    promise
      .then((value) => resolve(value))
      .catch((error) => reject(error))
      .finally(() => {
        window.clearTimeout(timerId)
      })
  })
}

/**
 * Verifica se o erro retornado pelo Supabase é de sessão expirada.
 */
function isErroSessaoExpirada(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('message' in error)) {
    return false
  }

  const mensagem = String((error as { message?: string }).message ?? '').toLowerCase()

  return mensagem.includes('invalid refresh token') || mensagem.includes('session expired')
}

/**
 * Provider global de autenticação.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const updateSequenceRef = useRef(0)
  const navigate = useNavigate()
  const { toast } = useToast()

  /**
   * Busca dados complementares na tabela tbusuario.
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
   * Limpa somente a sessão local inválida.
   */
  const limparSessaoLocalInvalida = useCallback(async () => {
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    if (error) {
      console.warn('Falha ao limpar sessão local inválida:', error)
    }
    limparAtividadeAuth()
  }, [])

  /**
   * Atualiza estado de usuário autenticado.
   */
  const updateUserState = useCallback(async (authUser: { id: string; email: string | null } | null) => {
    const updateId = ++updateSequenceRef.current

    if (!authUser) {
      if (updateId !== updateSequenceRef.current) return
      setUser(null)
      setIsLoading(false)
      return
    }

    let userData: { usuario: string | null; perfil: string | null }
    try {
      userData = await runWithTimeout(
        fetchUserData(authUser.id),
        AUTH_USERDATA_TIMEOUT_MS,
        'carregamento de perfil (tbusuario)'
      )
    } catch (error) {
      if (error instanceof AuthTimeoutError) {
        console.warn(error.message)
      } else {
        console.error('Erro ao carregar dados de perfil:', error)
      }
      userData = { usuario: null, perfil: null }
    }

    if (updateId !== updateSequenceRef.current) return

    setUser({
      id: authUser.id,
      email: authUser.email,
      usuario: userData.usuario,
      perfil: userData.perfil,
    })
    registrarAtividadeAuth()
    setIsLoading(false)
  }, [fetchUserData])

  useEffect(() => {
    let isMounted = true

    const inicializarSessao = async () => {
      try {
        const { data, error } = await runWithTimeout(
          supabase.auth.getSession(),
          AUTH_BOOTSTRAP_TIMEOUT_MS,
          'bootstrap de sessão'
        )

        if (!isMounted) return

        if (error) {
          if (isErroSessaoExpirada(error)) {
            await limparSessaoLocalInvalida()
          } else {
            console.error('Erro ao recuperar sessão inicial:', error)
          }

          setUser(null)
          setIsLoading(false)
          return
        }

        await updateUserState(
          data.session?.user
            ? { id: data.session.user.id, email: data.session.user.email ?? null }
            : null
        )
      } catch (error) {
        if (!isMounted) return

        if (error instanceof AuthTimeoutError) {
          console.warn(error.message)
          await limparSessaoLocalInvalida()
        } else {
          console.error('Erro inesperado ao inicializar sessão:', error)
        }

        if (!isMounted) return
        setUser(null)
        setIsLoading(false)
      }
    }

    void inicializarSessao()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return

      if (session) {
        registrarAtividadeAuth()
      } else {
        limparAtividadeAuth()
      }

      await updateUserState(
        session?.user ? { id: session.user.id, email: session.user.email ?? null } : null
      )
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [limparSessaoLocalInvalida, updateUserState])

  /**
   * Logout do sistema.
   */
  const signOut = useCallback(async () => {
    try {
      toast({
        title: 'Saindo do sistema...',
        description: 'Aguarde um momento',
      })

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Erro ao fazer logout:', error)
        toast({
          variant: 'destructive',
          title: 'Erro ao sair',
          description: 'Não foi possível encerrar a sessão. Tente novamente.',
        })
        return
      }

      limparAtividadeAuth()
      navigate('/login')
    } catch (err) {
      console.error('Erro inesperado no logout:', err)
      toast({
        variant: 'destructive',
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao sair. Recarregue a página.',
      })
    }
  }, [navigate, toast])

  const value = useMemo<UseAuthReturn>(
    () => ({ user, isLoading, signOut }),
    [isLoading, signOut, user]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
