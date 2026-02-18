/**
 * Utilitários de armazenamento da sessão de autenticação.
 *
 * Objetivo:
 * - Registrar atividade recente do usuário autenticado
 * - Sanitizar sessão persistida obsoleta antes do bootstrap do Supabase
 */

const AUTH_ACTIVITY_STORAGE_KEY = 'sysoee_auth_last_activity_at'

const MAX_INACTIVITY_HOURS_RAW = Number(import.meta.env.VITE_SUPABASE_MAX_INACTIVITY_HOURS ?? '24')
const MAX_INACTIVITY_HOURS =
  Number.isFinite(MAX_INACTIVITY_HOURS_RAW) && MAX_INACTIVITY_HOURS_RAW > 0
    ? MAX_INACTIVITY_HOURS_RAW
    : 24

const MAX_INACTIVITY_MS = MAX_INACTIVITY_HOURS * 60 * 60 * 1000

interface PersistedSessionShape {
  access_token?: unknown
  refresh_token?: unknown
}

function getProjectRefFromUrl(supabaseUrl: string): string | null {
  try {
    const hostname = new URL(supabaseUrl).hostname
    const projectRef = hostname.split('.')[0]
    return projectRef || null
  } catch {
    return null
  }
}

function getSupabaseAuthStorageKey(supabaseUrl: string): string | null {
  const projectRef = getProjectRefFromUrl(supabaseUrl)
  return projectRef ? `sb-${projectRef}-auth-token` : null
}

function readLastActivityTimestamp(): number | null {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem(AUTH_ACTIVITY_STORAGE_KEY)
  if (!raw) return null

  const value = Number(raw)
  return Number.isFinite(value) && value > 0 ? value : null
}

function extractPersistedSession(parsed: unknown): PersistedSessionShape | null {
  if (!parsed || typeof parsed !== 'object') {
    return null
  }

  const root = parsed as Record<string, unknown>

  if (root.currentSession && typeof root.currentSession === 'object') {
    return root.currentSession as PersistedSessionShape
  }

  if (root.session && typeof root.session === 'object') {
    return root.session as PersistedSessionShape
  }

  return root as PersistedSessionShape
}

function shouldClearSession(session: PersistedSessionShape, nowMs: number): boolean {
  const accessToken = typeof session.access_token === 'string' ? session.access_token.trim() : ''
  const refreshToken = typeof session.refresh_token === 'string' ? session.refresh_token.trim() : ''

  if (!accessToken || !refreshToken) {
    return true
  }

  const lastActivityAt = readLastActivityTimestamp()
  if (!lastActivityAt) {
    // Se não há histórico local de atividade, não inferimos expiração por timestamp de token.
    return false
  }

  return nowMs - lastActivityAt > MAX_INACTIVITY_MS
}

export function registrarAtividadeAuth(): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(AUTH_ACTIVITY_STORAGE_KEY, String(Date.now()))
}

export function limparAtividadeAuth(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(AUTH_ACTIVITY_STORAGE_KEY)
}

/**
 * Remove sessão persistida claramente obsoleta/inválida antes de criar o client Supabase.
 */
export function sanitizePersistedSupabaseSession(supabaseUrl: string): void {
  if (typeof window === 'undefined') return

  const authStorageKey = getSupabaseAuthStorageKey(supabaseUrl)
  if (!authStorageKey) return

  const raw = window.localStorage.getItem(authStorageKey)
  if (!raw) return

  try {
    const parsed = JSON.parse(raw)
    const session = extractPersistedSession(parsed)
    const shouldClear = !session || shouldClearSession(session, Date.now())

    if (shouldClear) {
      window.localStorage.removeItem(authStorageKey)
      limparAtividadeAuth()
    }
  } catch {
    window.localStorage.removeItem(authStorageKey)
    limparAtividadeAuth()
  }
}

export { MAX_INACTIVITY_HOURS }
