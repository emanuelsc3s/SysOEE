import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'
import { isPerfilAdministrador } from '@/utils/perfil.utils'

interface ProtectedRouteProps {
  children: React.ReactNode
  /** Se true, exige perfil Administrador (tbusuario.perfil) */
  requireAdmin?: boolean
}

/**
 * Componente de proteção de rotas
 *
 * Verifica se o usuário está autenticado antes de renderizar o conteúdo.
 * Opcionalmente, valida se o perfil é Administrador na tabela tbusuario.
 * Se não autenticado, redireciona para /login.
 *
 * Funcionalidades:
 * - Verificação inicial de sessão
 * - Listener para mudanças de autenticação
 * - Loading state durante verificação
 * - Redirecionamento automático
 *
 * @example
 * <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 */
export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const [accessState, setAccessState] = useState<'checking' | 'authorized' | 'unauthenticated' | 'unauthorized'>('checking')

  useEffect(() => {
    let isMounted = true

    const validarAcesso = async (session: { user: { id: string } } | null) => {
      if (!isMounted) return

      if (!session) {
        setAccessState('unauthenticated')
        return
      }

      if (!requireAdmin) {
        setAccessState('authorized')
        return
      }

      try {
        const { data, error } = await supabase
          .from('tbusuario')
          .select('perfil')
          .eq('user_id', session.user.id)
          .eq('deletado', 'N')
          .single()

        if (!isMounted) return

        if (error || !isPerfilAdministrador(data?.perfil)) {
          setAccessState('unauthorized')
          return
        }

        setAccessState('authorized')
      } catch {
        if (!isMounted) return
        setAccessState('unauthorized')
      }
    }

    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      void validarAcesso(session)
    })

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void validarAcesso(session)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [requireAdmin])

  // Loading state durante verificação de autenticação/perfil
  if (accessState === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg-primary">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-brand-text-secondary text-sm">
            {requireAdmin ? 'Verificando permissões...' : 'Verificando autenticação...'}
          </p>
        </div>
      </div>
    )
  }

  // Redirecionar para login se não autenticado
  if (accessState === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  // Bloquear rota se não for Administrador
  if (accessState === 'unauthorized') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg-primary px-4">
        <div className="w-full max-w-md rounded-xl border border-destructive/20 bg-card p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-destructive">Acesso negado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta rota é exclusiva para usuários com perfil Administrador.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar para a Home
          </Link>
        </div>
      </div>
    )
  }

  // Renderizar conteúdo protegido
  return <>{children}</>
}
