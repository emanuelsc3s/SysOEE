/**
 * Tipos do módulo de presença em tempo real do Apontamento OEE.
 */

export type PresenceActivity =
  | 'visualizando'
  | 'editando_cabecalho'
  | 'editando_producao'
  | 'editando_qualidade'
  | 'editando_parada'
  | 'editando_anotacao'

export type PresenceConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error'

export interface OeePresenceCurrentUser {
  id: string
  usuario: string | null
  perfil: string | null
}

export interface OeePresenceActivityState {
  atividade: PresenceActivity
  formulario: string | null
  modoOperacao: string | null
}

export interface OeePresenceTrackPayload {
  user_id: string
  usuario: string | null
  perfil: string | null
  atividade: PresenceActivity
  formulario: string | null
  modo_operacao: string | null
  tab_id: string
  updated_at: string
}

export interface OeePresenceParticipant {
  userId: string
  nome: string
  perfil: string | null
  atividade: PresenceActivity
  formulario: string | null
  updatedAt: string | null
  tabCount: number
}

export interface UseOeeTurnoPresenceParams {
  enabled: boolean
  oeeTurnoId: number | null
  currentUser: OeePresenceCurrentUser | null
  activityState: OeePresenceActivityState
}

export interface UseOeeTurnoPresenceResult {
  connectionStatus: PresenceConnectionStatus
  others: OeePresenceParticipant[]
  othersCount: number
  connected: boolean
  error: string | null
}
