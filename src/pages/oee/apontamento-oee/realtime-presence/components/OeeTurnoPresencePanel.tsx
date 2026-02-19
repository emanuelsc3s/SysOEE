import { OEE_PRESENCE_ACTIVITY_LABELS } from '@/pages/oee/apontamento-oee/realtime-presence/constants/realtimePresence.constants'
import type {
  OeePresenceParticipant,
  PresenceConnectionStatus,
} from '@/pages/oee/apontamento-oee/realtime-presence/types/realtimePresence.types'
import { OeeTurnoPresenceAvatarStack } from '@/pages/oee/apontamento-oee/realtime-presence/components/OeeTurnoPresenceAvatarStack'
import { OeeTurnoPresenceBadge } from '@/pages/oee/apontamento-oee/realtime-presence/components/OeeTurnoPresenceBadge'

interface OeeTurnoPresencePanelProps {
  enabled: boolean
  oeeTurnoId: number | null
  connectionStatus: PresenceConnectionStatus
  others: OeePresenceParticipant[]
  othersCount: number
  error: string | null
}

function buildResumoParticipantes(others: OeePresenceParticipant[]): string {
  if (others.length === 0) {
    return 'Nenhum outro usuário conectado neste lançamento.'
  }

  const primeiro = others[0]
  const atividadePrimeiro = OEE_PRESENCE_ACTIVITY_LABELS[primeiro.atividade]

  if (others.length === 1) {
    return `${primeiro.nome} está em ${atividadePrimeiro.toLowerCase()}.`
  }

  return `${primeiro.nome} e mais ${others.length - 1} usuário(s) estão neste lançamento.`
}

export function OeeTurnoPresencePanel({
  enabled,
  oeeTurnoId,
  connectionStatus,
  others,
  othersCount,
  error,
}: OeeTurnoPresencePanelProps) {
  if (!enabled || !oeeTurnoId) {
    return null
  }

  const resumo = buildResumoParticipantes(others)
  const isError = connectionStatus === 'error'

  return (
    <div className="mt-2 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <OeeTurnoPresenceBadge connectionStatus={connectionStatus} othersCount={othersCount} />
      <OeeTurnoPresenceAvatarStack participants={others} />
      <span className={`text-xs ${isError ? 'text-red-700' : 'text-slate-600'}`}>
        {isError && error ? `${resumo} ${error}` : resumo}
      </span>
    </div>
  )
}
