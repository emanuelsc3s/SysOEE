import type { PresenceActivity, PresenceConnectionStatus } from '@/pages/oee/apontamento-oee/realtime-presence/types/realtimePresence.types'

export const OEE_PRESENCE_CHANNEL_PREFIX = 'oee-turno'
export const OEE_PRESENCE_HEARTBEAT_MS = 25_000
export const OEE_PRESENCE_MAX_VISIBLE_AVATARS = 5
export const OEE_PRESENCE_CURSOR_THROTTLE_MS = 80
export const OEE_PRESENCE_CURSOR_STALE_MS = 10_000

const VALORES_FLAG_INATIVA = new Set(['0', 'false', 'no', 'off', 'nao', 'n'])

const valorFlagPresence = String(import.meta.env.VITE_ENABLE_OEE_PRESENCE ?? '')
  .trim()
  .toLowerCase()

export const OEE_REALTIME_PRESENCE_ENABLED = valorFlagPresence
  ? !VALORES_FLAG_INATIVA.has(valorFlagPresence)
  : true

export const OEE_PRESENCE_ACTIVITY_LABELS: Record<PresenceActivity, string> = {
  visualizando: 'Visualizando',
  editando_cabecalho: 'Editando cabeçalho',
  editando_producao: 'Editando produção',
  editando_qualidade: 'Editando qualidade',
  editando_parada: 'Editando parada',
  editando_anotacao: 'Editando anotação',
}

export const OEE_PRESENCE_CONNECTION_LABELS: Record<PresenceConnectionStatus, string> = {
  idle: 'Presence inativa',
  connecting: 'Conectando presence',
  connected: 'Presence conectada',
  error: 'Presence indisponível',
}
