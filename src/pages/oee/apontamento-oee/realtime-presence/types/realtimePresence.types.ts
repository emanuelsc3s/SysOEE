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
  lock_field_key?: string | null
  lock_field_label?: string | null
  lock_updated_at?: string | null
  updated_at: string
}

export interface OeePresenceParticipant {
  connectionId: string
  userId: string
  tabId: string
  nome: string
  perfil: string | null
  atividade: PresenceActivity
  formulario: string | null
  modoOperacao: string | null
  updatedAt: string | null
  sameUser: boolean
}

export interface OeePresenceCursor {
  connectionId: string
  userId: string
  tabId: string
  xRatio: number
  yRatio: number
  updatedAt: string
}

export interface OeePresenceFieldLock {
  connectionId: string
  userId: string
  tabId: string
  usuario: string | null
  fieldKey: string
  fieldLabel: string
  updatedAt: string
}

export interface OeePresenceUiStateSnapshotLine {
  horaInicio: string
  horaFim: string
  quantidadeProduzida: string
}

export interface OeePresenceUiStateSnapshot {
  formularioAtivo?: string | null
  dataIso?: string | null
  turno?: string | null
  turnoCodigo?: string | null
  turnoNome?: string | null
  turnoHoraInicial?: string | null
  turnoHoraFinal?: string | null
  linhaId?: string | null
  linhaNome?: string | null
  skuCodigo?: string | null
  quantidadePerdas?: string | null
  codigoParadaBusca?: string | null
  horaInicialParada?: string | null
  horaFinalParada?: string | null
  observacoesParada?: string | null
  linhasQuantidade?: OeePresenceUiStateSnapshotLine[]
}

export interface OeePresenceUiStateEvent {
  connectionId: string
  userId: string
  tabId: string
  updatedAt: string
  state: OeePresenceUiStateSnapshot
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
  cursors: OeePresenceCursor[]
  fieldLocks: OeePresenceFieldLock[]
  uiStateEvent: OeePresenceUiStateEvent | null
  broadcastUiState: (state: OeePresenceUiStateSnapshot) => void
  acquireFieldLock: (fieldKey: string, fieldLabel: string) => void
  releaseFieldLock: (fieldKey?: string) => void
  othersCount: number
  connected: boolean
  error: string | null
}
