import { MousePointer2 } from 'lucide-react'
import type {
  OeePresenceCursor,
  OeePresenceParticipant,
  PresenceConnectionStatus,
} from '@/pages/oee/apontamento-oee/realtime-presence/types/realtimePresence.types'

interface OeeTurnoPresenceCursorLayerProps {
  enabled: boolean
  connectionStatus: PresenceConnectionStatus
  participants: OeePresenceParticipant[]
  cursors: OeePresenceCursor[]
}

function cortarNome(nome: string): string {
  const valor = nome.trim()
  if (valor.length <= 24) {
    return valor
  }

  return `${valor.slice(0, 24)}...`
}

export function OeeTurnoPresenceCursorLayer({
  enabled,
  connectionStatus,
  participants,
  cursors,
}: OeeTurnoPresenceCursorLayerProps) {
  if (!enabled || connectionStatus !== 'connected' || cursors.length === 0) {
    return null
  }

  const participantesPorConexao = new Map(
    participants.map((participant) => [participant.connectionId, participant])
  )

  const cursoresVisiveis = cursors
    .map((cursor) => {
      const participant = participantesPorConexao.get(cursor.connectionId)
      if (!participant) {
        return null
      }

      return { cursor, participant }
    })
    .filter((item): item is { cursor: OeePresenceCursor; participant: OeePresenceParticipant } => item !== null)

  if (cursoresVisiveis.length === 0) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      {cursoresVisiveis.map(({ cursor, participant }) => (
        <div
          key={cursor.connectionId}
          className="absolute -translate-x-1 -translate-y-1"
          style={{
            left: `${(cursor.xRatio * 100).toFixed(2)}%`,
            top: `${(cursor.yRatio * 100).toFixed(2)}%`,
          }}
        >
          <div className="flex items-start gap-1">
            <MousePointer2
              className={`h-4 w-4 drop-shadow-sm ${
                participant.sameUser ? 'text-blue-600' : 'text-emerald-600'
              }`}
            />
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm ${
                participant.sameUser
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {participant.sameUser
                ? `${cortarNome(participant.nome)} (outra sessão)`
                : cortarNome(participant.nome)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
