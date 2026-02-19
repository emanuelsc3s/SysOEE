import type { OeePresenceParticipant, PresenceActivity } from '@/pages/oee/apontamento-oee/realtime-presence/types/realtimePresence.types'

const ATIVIDADES_VALIDAS = new Set<PresenceActivity>([
  'visualizando',
  'editando_cabecalho',
  'editando_producao',
  'editando_qualidade',
  'editando_parada',
  'editando_anotacao',
])

interface MapPresenceStateArgs {
  state: Record<string, unknown> | null | undefined
  currentUserId?: string | null
  currentTabId?: string | null
}

interface AggregatedParticipant {
  userId: string
  nome: string
  perfil: string | null
  atividade: PresenceActivity
  formulario: string | null
  updatedAt: string | null
  updatedAtMs: number
  tabIds: Set<string>
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  return value as Record<string, unknown>
}

function asString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const texto = value.trim()
  return texto ? texto : null
}

function asActivity(value: unknown): PresenceActivity {
  if (typeof value !== 'string') {
    return 'visualizando'
  }

  return ATIVIDADES_VALIDAS.has(value as PresenceActivity)
    ? (value as PresenceActivity)
    : 'visualizando'
}

function parseUpdatedAtMs(updatedAt: string | null): number {
  if (!updatedAt) {
    return 0
  }

  const parsed = Date.parse(updatedAt)
  return Number.isFinite(parsed) ? parsed : 0
}

function extractUserIdFromPresenceKey(presenceKey: string): string | null {
  const [userId] = presenceKey.split(':')
  const valor = userId?.trim()
  return valor ? valor : null
}

function normalizeNomeUsuario(userId: string, usuario: string | null): string {
  if (usuario) {
    return usuario
  }

  return `Usuário ${userId.slice(0, 8)}`
}

export function mapPresenceStateToParticipants({
  state,
  currentUserId,
  currentTabId,
}: MapPresenceStateArgs): OeePresenceParticipant[] {
  if (!state) {
    return []
  }

  const participantesPorUsuario = new Map<string, AggregatedParticipant>()

  for (const [presenceKey, rawPresenceEntries] of Object.entries(state)) {
    if (!Array.isArray(rawPresenceEntries)) {
      continue
    }

    for (const rawEntry of rawPresenceEntries) {
      const entry = asRecord(rawEntry)
      if (!entry) {
        continue
      }

      const userId = asString(entry.user_id) ?? extractUserIdFromPresenceKey(presenceKey)
      if (!userId) {
        continue
      }

      const usuario = asString(entry.usuario)
      const perfil = asString(entry.perfil)
      const atividade = asActivity(entry.atividade)
      const formulario = asString(entry.formulario)
      const updatedAt = asString(entry.updated_at)
      const updatedAtMs = parseUpdatedAtMs(updatedAt)
      const tabId = asString(entry.tab_id) ?? presenceKey

      const existente = participantesPorUsuario.get(userId)

      if (!existente) {
        participantesPorUsuario.set(userId, {
          userId,
          nome: normalizeNomeUsuario(userId, usuario),
          perfil,
          atividade,
          formulario,
          updatedAt,
          updatedAtMs,
          tabIds: new Set([tabId]),
        })
        continue
      }

      existente.tabIds.add(tabId)

      // Mantém os dados mais recentes para exibição.
      if (updatedAtMs >= existente.updatedAtMs) {
        existente.nome = normalizeNomeUsuario(userId, usuario)
        existente.perfil = perfil
        existente.atividade = atividade
        existente.formulario = formulario
        existente.updatedAt = updatedAt
        existente.updatedAtMs = updatedAtMs
      }
    }
  }

  return Array.from(participantesPorUsuario.values())
    .flatMap<OeePresenceParticipant>((item) => {
      const isCurrentUser = item.userId === currentUserId
      const totalTabs = item.tabIds.size

      if (!isCurrentUser) {
        return [{
          userId: item.userId,
          nome: item.nome,
          perfil: item.perfil,
          atividade: item.atividade,
          formulario: item.formulario,
          updatedAt: item.updatedAt,
          tabCount: totalTabs,
        }]
      }

      const ownSessionCount = currentTabId
        ? (item.tabIds.has(currentTabId) ? 1 : 0)
        : 1
      const outrasSessoes = Math.max(totalTabs - ownSessionCount, 0)

      if (outrasSessoes <= 0) {
        return []
      }

      return [{
        userId: item.userId,
        nome: `${item.nome} (outras sessões)`,
        perfil: item.perfil,
        atividade: item.atividade,
        formulario: item.formulario,
        updatedAt: item.updatedAt,
        tabCount: outrasSessoes,
      }]
    })
    .sort((a, b) => {
      const aMs = parseUpdatedAtMs(a.updatedAt)
      const bMs = parseUpdatedAtMs(b.updatedAt)
      if (aMs !== bMs) {
        return bMs - aMs
      }
      return a.nome.localeCompare(b.nome, 'pt-BR')
    })
}
