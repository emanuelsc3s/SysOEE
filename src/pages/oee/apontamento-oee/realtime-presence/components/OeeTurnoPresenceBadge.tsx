import { OEE_PRESENCE_CONNECTION_LABELS } from '@/pages/oee/apontamento-oee/realtime-presence/constants/realtimePresence.constants'
import type { PresenceConnectionStatus } from '@/pages/oee/apontamento-oee/realtime-presence/types/realtimePresence.types'

interface OeeTurnoPresenceBadgeProps {
  connectionStatus: PresenceConnectionStatus
  othersCount: number
}

function getStatusStyles(connectionStatus: PresenceConnectionStatus): string {
  if (connectionStatus === 'connected') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (connectionStatus === 'connecting') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }

  if (connectionStatus === 'error') {
    return 'border-red-200 bg-red-50 text-red-700'
  }

  return 'border-slate-200 bg-slate-50 text-slate-700'
}

function getDotStyles(connectionStatus: PresenceConnectionStatus): string {
  if (connectionStatus === 'connected') {
    return 'bg-emerald-500'
  }

  if (connectionStatus === 'connecting') {
    return 'bg-amber-500'
  }

  if (connectionStatus === 'error') {
    return 'bg-red-500'
  }

  return 'bg-slate-400'
}

export function OeeTurnoPresenceBadge({ connectionStatus, othersCount }: OeeTurnoPresenceBadgeProps) {
  const statusLabel = OEE_PRESENCE_CONNECTION_LABELS[connectionStatus]
  const counterLabel = connectionStatus === 'connected'
    ? `${othersCount} conexão(ões) online`
    : statusLabel

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusStyles(connectionStatus)}`}
      title={counterLabel}
    >
      <span className={`h-2 w-2 rounded-full ${getDotStyles(connectionStatus)}`} />
      {counterLabel}
    </span>
  )
}
