import { useContext } from 'react'
import { AuthContext, type UseAuthReturn } from '@/contexts/auth.context'

/**
 * Hook de acesso ao contexto de autenticação.
 */
export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>.')
  }

  return context
}
