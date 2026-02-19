import type { PresenceActivity, PresenceConnectionStatus } from '@/pages/oee/apontamento-oee/realtime-presence/types/realtimePresence.types'

export const OEE_PRESENCE_CHANNEL_PREFIX = 'oee-turno'
export const OEE_PRESENCE_HEARTBEAT_MS = 25_000
export const OEE_PRESENCE_MAX_VISIBLE_AVATARS = 5

const VALORES_FLAG_ATIVA = new Set(['1', 'true', 'yes', 'on', 'sim', 's'])

export const OEE_REALTIME_PRESENCE_ENABLED = VALORES_FLAG_ATIVA.has(
  String(import.meta.env.VITE_ENABLE_OEE_PRESENCE ?? '')
    .trim()
    .toLowerCase()
)

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
