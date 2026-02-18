import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
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
 * Garante que a busca de dados do usuário não mantenha loading infinito.
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
 * Provider global de autenticação.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const updateSequenceRef = useRef(0)
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
   * Atualiza estado de usuário autenticado.
   *
   * updateSequenceRef descarta resultados stale de chamadas concorrentes:
   * só aplica o estado se esta chamada ainda for a mais recente.
   * A checagem é feita APÓS a operação assíncrona (fetchUserData), que é o
   * único ponto onde uma chamada posterior pode ter sido iniciada.
   */
  const updateUserState = useCallback(async (authUser: { id: string; email: string | null } | null) => {
    const updateId = ++updateSequenceRef.current

    if (!authUser) {
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

    // Descarta resultado se uma chamada mais recente foi iniciada durante fetchUserData.
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

  /**
   * Limpeza local segura para cenários de token inválido/estado de auth inconsistente.
   */
  const limparSessaoLocal = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (error) {
        console.warn('Falha ao limpar sessão local:', error)
      }
    } catch (error) {
      console.warn('Erro inesperado ao limpar sessão local:', error)
    } finally {
      limparAtividadeAuth()
    }
  }, [])

  /**
   * Processa uma sessão de auth fora do lock interno do Supabase.
   */
  const processarSessaoAuth = useCallback(async (session: Session | null) => {
    if (session) {
      registrarAtividadeAuth()
    } else {
      limparAtividadeAuth()
    }

    await updateUserState(
      session?.user ? { id: session.user.id, email: session.user.email ?? null } : null
    )
  }, [updateUserState])

  useEffect(() => {
    // Variável local ao closure desta execução do effect.
    // Cada remontagem (inclusive StrictMode em dev) tem sua própria cópia isolada,
    // garantindo que callbacks de execuções anteriores não vejam o estado de montagem
    // de execuções posteriores — ao contrário de um useRef no nível do componente.
    let isMounted = true

    // Timeout de segurança: se o evento INITIAL_SESSION não chegar em tempo hábil
    // (ex.: Supabase SDK pendurado no refresh de token expirado), libera o loading
    // para não bloquear o usuário indefinidamente.
    const bootstrapTimeoutId = window.setTimeout(() => {
      if (!isMounted) return
      console.warn(`[AUTH_TIMEOUT] bootstrap de sessão excedeu ${AUTH_BOOTSTRAP_TIMEOUT_MS}ms`)
      void limparSessaoLocal()
      setUser(null)
      setIsLoading(false)
    }, AUTH_BOOTSTRAP_TIMEOUT_MS)

    // Fila para serializar eventos de auth e evitar concorrência em consultas de perfil.
    let authEventChain = Promise.resolve()
    let recebeuPrimeiroEvento = false
    const invalidarUpdatesPendentes = () => {
      updateSequenceRef.current++
    }

    // onAuthStateChange é a ÚNICA fonte de verdade do estado de autenticação.
    // O SDK dispara INITIAL_SESSION automaticamente na subscrição com a sessão atual
    // (ou null se o refresh falhar), eliminando a necessidade de chamar getSession()
    // separadamente e evitando chamadas paralelas a updateUserState no mount.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return

      // Cancela o timeout de segurança assim que qualquer evento de auth chegar.
      if (!recebeuPrimeiroEvento) {
        recebeuPrimeiroEvento = true
        window.clearTimeout(bootstrapTimeoutId)
      }

      // IMPORTANTE: callback síncrono. Processamento assíncrono fora do lock interno do SDK.
      authEventChain = authEventChain
        .then(async () => {
          if (!isMounted) return
          await processarSessaoAuth(session)
        })
        .catch((error) => {
          if (!isMounted) return
          console.error('Erro ao processar evento de autenticação:', error)
          setUser(null)
          setIsLoading(false)
        })
    })

    return () => {
      isMounted = false
      // Invalida updates assíncronos pendentes desta execução do effect.
      invalidarUpdatesPendentes()
      window.clearTimeout(bootstrapTimeoutId)
      subscription.unsubscribe()
    }
  }, [limparSessaoLocal, processarSessaoAuth])

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
    } catch (err) {
      console.error('Erro inesperado no logout:', err)
      toast({
        variant: 'destructive',
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao sair. Recarregue a página.',
      })
    }
  }, [toast])

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
