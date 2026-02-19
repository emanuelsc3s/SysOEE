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

function buildResumoParticipantes(others: OeePresenceParticipant[]): string {
  if (others.length === 0) {
    return 'Nenhuma outra conexão ativa neste lançamento.'
  }

  const primeiro = others[0]
  const atividadePrimeiro = OEE_PRESENCE_ACTIVITY_LABELS[primeiro.atividade]
  const descricaoPrimeiro = primeiro.sameUser
    ? `${primeiro.nome} (outra sessão sua)`
    : primeiro.nome

  if (others.length === 1) {
    return `${descricaoPrimeiro} está em ${atividadePrimeiro.toLowerCase()}.`
  }

  return `${descricaoPrimeiro} e mais ${others.length - 1} conexão(ões) estão neste lançamento.`
}

function buildDescricaoConexao(participant: OeePresenceParticipant): string {
  const partes = [OEE_PRESENCE_ACTIVITY_LABELS[participant.atividade]]

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

  const isError = connectionStatus === 'error'
  const hasConnections = othersCount > 0
  if (!isError && !hasConnections) {
    return null
  }

  const resumo = isError
    ? 'Erro ao conectar no presence.'
    : buildResumoParticipantes(others)

  return (
    <div className="mt-2 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <OeeTurnoPresenceBadge connectionStatus={connectionStatus} othersCount={othersCount} />
      <OeeTurnoPresenceAvatarStack participants={others} />
      <span className={`text-xs ${isError ? 'text-red-700' : 'text-slate-600'}`}>
        {isError && error ? `${resumo} ${error}` : resumo}
      </span>

      {others.length > 0 && (
        <div className="w-full rounded-md border border-slate-200 bg-white/80 p-2">
          <div className="space-y-1">
            {others.map((participant) => (
              <p key={participant.connectionId} className="text-xs text-slate-700">
                <span className="font-medium">
                  {participant.sameUser
                    ? `${participant.nome} (outra sessão sua)`
                    : participant.nome}
                </span>
                {' • '}
                {buildDescricaoConexao(participant)}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
