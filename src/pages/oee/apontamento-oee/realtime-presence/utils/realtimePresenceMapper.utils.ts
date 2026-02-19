import type {
  OeePresenceFieldLock,
  OeePresenceParticipant,
  PresenceActivity,
} from '@/pages/oee/apontamento-oee/realtime-presence/types/realtimePresence.types'

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

type MapPresenceFieldLocksArgs = MapPresenceStateArgs

interface NormalizedParticipant {
  connectionId: string
  userId: string
  tabId: string
  nome: string
  perfil: string | null
  atividade: PresenceActivity
  formulario: string | null
  modoOperacao: string | null
  updatedAt: string | null
  updatedAtMs: number
  sameUser: boolean
}

interface NormalizedFieldLock {
  lock: OeePresenceFieldLock
  updatedAtMs: number
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

function buildConnectionId(userId: string, tabId: string): string {
  return `${userId}:${tabId}`
}

function buildTimestampMs(value: string | null): number {
  if (!value) {
    return 0
  }

  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function mapPresenceStateToParticipants({
  state,
  currentUserId,
  currentTabId,
}: MapPresenceStateArgs): OeePresenceParticipant[] {
  if (!state) {
    return []
  }

  const participantesPorConexao = new Map<string, NormalizedParticipant>()

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
      const modoOperacao = asString(entry.modo_operacao)
      const updatedAt = asString(entry.updated_at)
      const updatedAtMs = parseUpdatedAtMs(updatedAt)
      const tabId = asString(entry.tab_id) ?? presenceKey
      const sameUser = userId === currentUserId

      if (sameUser && currentTabId && tabId === currentTabId) {
        continue
      }

      const connectionId = buildConnectionId(userId, tabId)
      const existente = participantesPorConexao.get(connectionId)

      if (existente && existente.updatedAtMs > updatedAtMs) {
        continue
      }

      participantesPorConexao.set(connectionId, {
        connectionId,
        userId,
        tabId,
        nome: normalizeNomeUsuario(userId, usuario),
        perfil,
        atividade,
        formulario,
        modoOperacao,
        updatedAt,
        updatedAtMs,
        sameUser,
      })
    }
  }

  return Array.from(participantesPorConexao.values())
    .sort((a, b) => {
      if (a.updatedAtMs !== b.updatedAtMs) {
        return b.updatedAtMs - a.updatedAtMs
      }
      return a.nome.localeCompare(b.nome, 'pt-BR')
    })
    .map<OeePresenceParticipant>((item) => ({
      connectionId: item.connectionId,
      userId: item.userId,
      tabId: item.tabId,
      nome: item.nome,
      perfil: item.perfil,
      atividade: item.atividade,
      formulario: item.formulario,
      modoOperacao: item.modoOperacao,
      updatedAt: item.updatedAt,
      sameUser: item.sameUser,
    }))
}

export function mapPresenceStateToFieldLocksByConnection({
  state,
  currentUserId,
  currentTabId,
}: MapPresenceFieldLocksArgs): Record<string, OeePresenceFieldLock> {
  if (!state) {
    return {}
  }

  const locksPorConexao = new Map<string, NormalizedFieldLock>()

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

      const tabId = asString(entry.tab_id) ?? presenceKey
      const sameUser = userId === currentUserId
      if (sameUser && currentTabId && tabId === currentTabId) {
        continue
      }

      const fieldKey = asString(entry.lock_field_key)
      if (!fieldKey) {
        continue
      }

      const fieldLabel = asString(entry.lock_field_label) ?? fieldKey
      const usuario = asString(entry.usuario)
      const updatedAt = asString(entry.lock_updated_at) ?? asString(entry.updated_at) ?? new Date().toISOString()
      const updatedAtMs = buildTimestampMs(updatedAt)
      const connectionId = buildConnectionId(userId, tabId)
      const existente = locksPorConexao.get(connectionId)

      if (existente && existente.updatedAtMs > updatedAtMs) {
        continue
      }

      locksPorConexao.set(connectionId, {
        updatedAtMs,
        lock: {
          connectionId,
          userId,
          tabId,
          usuario,
          fieldKey,
          fieldLabel,
          updatedAt,
        },
      })
    }
  }

  return Array.from(locksPorConexao.entries()).reduce<Record<string, OeePresenceFieldLock>>(
    (acumulador, [connectionId, item]) => {
      acumulador[connectionId] = item.lock
      return acumulador
    },
    {}
  )
}
