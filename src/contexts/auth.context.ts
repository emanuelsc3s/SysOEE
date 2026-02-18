import { createContext } from 'react'

/**
 * Dados do usuário autenticado.
 */
export interface AuthUser {
  /** UUID do Supabase Auth */
  id: string
  /** E-mail do usuário */
  email: string | null
  /** Nome de usuário (tbusuario.usuario) */
  usuario: string | null
  /** Perfil do usuário (tbusuario.perfil) */
  perfil: string | null
}

/**
 * Contrato público da autenticação consumido pelo hook.
 */
export interface UseAuthReturn {
  user: AuthUser | null
  isLoading: boolean
  signOut: () => Promise<void>
}

export const AuthContext = createContext<UseAuthReturn | undefined>(undefined)
