import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Componente de proteção de rotas
 *
 * Verifica se o usuário está autenticado antes de renderizar o conteúdo.
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
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session)
    })

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Loading state durante verificação de autenticação
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg-primary">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-brand-text-secondary text-sm">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Renderizar conteúdo protegido
  return <>{children}</>
}
