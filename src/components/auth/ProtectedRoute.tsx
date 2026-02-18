import { Link, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { isPerfilAdministrador, isPerfilOperador } from '@/utils/perfil.utils'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  /** Se true, exige perfil Administrador (tbusuario.perfil) */
  requireAdmin?: boolean
  /** Se true, bloqueia apenas perfil Operador; demais perfis acessam normalmente */
  blockOperador?: boolean
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
export function ProtectedRoute({ children, requireAdmin = false, blockOperador = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  // Loading state durante verificação de autenticação/perfil
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg-primary">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-brand-text-secondary text-sm">
            {requireAdmin || blockOperador ? 'Verificando permissões...' : 'Verificando autenticação...'}
          </p>
        </div>
      </div>
    )
  }

  // Redirecionar para login se não autenticado
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Bloquear rota para perfil Operador (ex.: Análise Paradas OEE)
  if (blockOperador && isPerfilOperador(user.perfil)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg-primary px-4">
        <div className="w-full max-w-md rounded-xl border border-destructive/20 bg-card p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-destructive">Acesso negado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Este módulo não está disponível para perfil Operador.
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

  // Bloquear rota se não for Administrador
  if (requireAdmin && !isPerfilAdministrador(user.perfil)) {
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
