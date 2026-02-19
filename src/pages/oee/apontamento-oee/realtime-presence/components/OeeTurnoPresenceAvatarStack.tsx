import { OEE_PRESENCE_ACTIVITY_LABELS, OEE_PRESENCE_MAX_VISIBLE_AVATARS } from '@/pages/oee/apontamento-oee/realtime-presence/constants/realtimePresence.constants'
import type { OeePresenceParticipant } from '@/pages/oee/apontamento-oee/realtime-presence/types/realtimePresence.types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface OeeTurnoPresenceAvatarStackProps {
  participants: OeePresenceParticipant[]
  maxVisible?: number
}

function formatFormulario(formulario: string | null): string | null {
  if (!formulario) {
    return null
  }

  if (formulario === 'production-form') {
    return 'Formulário de produção'
  }

  if (formulario === 'quality-form') {
    return 'Formulário de qualidade'
  }

  if (formulario === 'downtime-form') {
    return 'Formulário de parada'
  }

  return formulario
}

function formatModoOperacao(modoOperacao: string | null): string | null {
  if (!modoOperacao) {
    return null
  }

  if (modoOperacao === 'consulta') {
    return 'Modo consulta'
  }

  if (modoOperacao === 'edicao') {
    return 'Modo edição'
  }

  if (modoOperacao === 'inclusao') {
    return 'Modo inclusão'
  }

  return `Modo ${modoOperacao}`
}

function buildParticipantTooltip(participant: OeePresenceParticipant): string {
  const partes = [
    participant.sameUser
      ? `${participant.nome} (outra sessão sua)`
      : participant.nome,
    OEE_PRESENCE_ACTIVITY_LABELS[participant.atividade],
  ]

  const formulario = formatFormulario(participant.formulario)
  if (formulario) {
    partes.push(formulario)
  }

  const modoOperacao = formatModoOperacao(participant.modoOperacao)
  if (modoOperacao) {
    partes.push(modoOperacao)
  }

  return partes.join(' • ')
}

function gerarIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) {
    return 'US'
  }

  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase()
  }

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}

export function OeeTurnoPresenceAvatarStack({
  participants,
  maxVisible = OEE_PRESENCE_MAX_VISIBLE_AVATARS,
}: OeeTurnoPresenceAvatarStackProps) {
  if (participants.length === 0) {
    return null
  }

  const visible = participants.slice(0, maxVisible)
  const overflow = Math.max(participants.length - visible.length, 0)

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visible.map((participant) => (
          <Avatar
            key={participant.connectionId}
            className="h-7 w-7 border border-white ring-1 ring-slate-200"
            title={buildParticipantTooltip(participant)}
          >
            <AvatarFallback className={`text-[11px] font-semibold ${
              participant.sameUser
                ? 'bg-blue-50 text-blue-700'
                : 'bg-slate-100 text-slate-700'
            }`}>
              {gerarIniciais(participant.nome)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>

      {overflow > 0 && (
        <span className="ml-2 text-xs font-medium text-slate-600">
          +{overflow}
        </span>
      )}
    </div>
  )
}
