import { OEE_PRESENCE_CHANNEL_PREFIX } from '@/pages/oee/apontamento-oee/realtime-presence/constants/realtimePresence.constants'

export function buildOeePresenceTopic(oeeTurnoId: number): string {
  return `${OEE_PRESENCE_CHANNEL_PREFIX}:${oeeTurnoId}`
}

export function buildOeePresenceKey(userId: string, tabId: string): string {
  return `${userId}:${tabId}`
}

export function createPresenceTabId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
