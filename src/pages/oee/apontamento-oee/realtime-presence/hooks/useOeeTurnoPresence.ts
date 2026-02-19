import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  OEE_PRESENCE_CURSOR_STALE_MS,
  OEE_PRESENCE_CURSOR_THROTTLE_MS,
  OEE_PRESENCE_HEARTBEAT_MS,
} from '@/pages/oee/apontamento-oee/realtime-presence/constants/realtimePresence.constants'
import type {
  OeePresenceCursor,
  OeePresenceFieldLock,
  OeePresenceTrackPayload,
  OeePresenceUiStateSnapshot,
  UseOeeTurnoPresenceParams,
  UseOeeTurnoPresenceResult,
} from '@/pages/oee/apontamento-oee/realtime-presence/types/realtimePresence.types'
import {
  mapPresenceStateToFieldLocksByConnection,
  mapPresenceStateToParticipants,
} from '@/pages/oee/apontamento-oee/realtime-presence/utils/realtimePresenceMapper.utils'
import {
  buildOeePresenceKey,
  buildOeePresenceTopic,
  createPresenceTabId,
} from '@/pages/oee/apontamento-oee/realtime-presence/utils/realtimePresenceTopic.utils'

type OeePresenceChannel = ReturnType<typeof supabase.channel>

function isSubscribed(status: string): boolean {
  return status === 'SUBSCRIBED'
}

function isConnectionError(status: string): boolean {
  return status === 'CHANNEL_ERROR' || status === 'TIMED_OUT'
}

function isClosed(status: string): boolean {
  return status === 'CLOSED'
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

function asNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null
  }

  return value
}

function asBoolean(value: unknown): boolean | null {
  if (typeof value !== 'boolean') {
    return null
  }

  return value
}

function clampRatio(value: number | null): number | null {
  if (!Number.isFinite(value ?? Number.NaN)) {
    return null
  }

  return Math.min(1, Math.max(0, value as number))
}

function buildConnectionId(userId: string, tabId: string): string {
  return `${userId}:${tabId}`
}

interface FieldLockBroadcastPayload {
  fieldKey: string
  fieldLabel: string
  locked: boolean
}

export function useOeeTurnoPresence({
  enabled,
  oeeTurnoId,
  currentUser,
  activityState,
}: UseOeeTurnoPresenceParams): UseOeeTurnoPresenceResult {
  const [connectionStatus, setConnectionStatus] = useState<UseOeeTurnoPresenceResult['connectionStatus']>('idle')
  const [others, setOthers] = useState<UseOeeTurnoPresenceResult['others']>([])
  const [cursorsByConnection, setCursorsByConnection] = useState<Record<string, OeePresenceCursor>>({})
  const [fieldLocksByConnection, setFieldLocksByConnection] = useState<Record<string, OeePresenceFieldLock>>({})
  const [uiStateEvent, setUiStateEvent] = useState<UseOeeTurnoPresenceResult['uiStateEvent']>(null)
  const [error, setError] = useState<string | null>(null)

  const channelRef = useRef<OeePresenceChannel | null>(null)
  const tabIdRef = useRef(createPresenceTabId())
  const payloadRef = useRef<OeePresenceTrackPayload | null>(null)
  const currentFieldLockRef = useRef<{ fieldKey: string; fieldLabel: string; updatedAt: string } | null>(null)
  const connectionStatusRef = useRef<UseOeeTurnoPresenceResult['connectionStatus']>('idle')

  const shouldConnect = enabled && Boolean(currentUser?.id) && Number.isFinite(oeeTurnoId ?? Number.NaN)

  const payload = useMemo<OeePresenceTrackPayload | null>(() => {
    if (!currentUser?.id) {
      return null
    }

    return {
      user_id: currentUser.id,
      usuario: currentUser.usuario,
      perfil: currentUser.perfil,
      atividade: activityState.atividade,
      formulario: activityState.formulario,
      modo_operacao: activityState.modoOperacao,
      tab_id: tabIdRef.current,
      lock_field_key: null,
      lock_field_label: null,
      lock_updated_at: null,
      updated_at: new Date().toISOString(),
    }
  }, [
    activityState.atividade,
    activityState.formulario,
    activityState.modoOperacao,
    currentUser?.id,
    currentUser?.perfil,
    currentUser?.usuario,
  ])
  payloadRef.current = payload

  useEffect(() => {
    connectionStatusRef.current = connectionStatus
  }, [connectionStatus])

  const buildTrackPayloadWithCurrentLock = useCallback((basePayload: OeePresenceTrackPayload | null): OeePresenceTrackPayload | null => {
    if (!basePayload) {
      return null
    }

    const lockAtual = currentFieldLockRef.current

    return {
      ...basePayload,
      lock_field_key: lockAtual?.fieldKey ?? null,
      lock_field_label: lockAtual?.fieldLabel ?? null,
      lock_updated_at: lockAtual?.updatedAt ?? null,
      updated_at: new Date().toISOString(),
    }
  }, [])

  const trackPresencePayload = useCallback((channelOverride?: OeePresenceChannel | null) => {
    const channel = channelOverride ?? channelRef.current
    if (!channel) {
      return
    }

    const payloadAtual = buildTrackPayloadWithCurrentLock(payloadRef.current)
    if (!payloadAtual) {
      return
    }

    void channel.track(payloadAtual).catch(() => {
      // Falha de track não deve interromper o fluxo principal.
    })
  }, [buildTrackPayloadWithCurrentLock])

  const sendFieldLockBroadcast = useCallback((
    lockPayload: FieldLockBroadcastPayload,
    channelOverride?: OeePresenceChannel | null
  ) => {
    if (!currentUser?.id) {
      return
    }

    const channel = channelOverride ?? channelRef.current
    if (!channel) {
      return
    }

    if (!channelOverride && connectionStatusRef.current !== 'connected') {
      return
    }

    void channel.send({
      type: 'broadcast',
      event: 'field_lock',
      payload: {
        user_id: currentUser.id,
        tab_id: tabIdRef.current,
        usuario: currentUser.usuario,
        field_key: lockPayload.fieldKey,
        field_label: lockPayload.fieldLabel,
        locked: lockPayload.locked,
        updated_at: new Date().toISOString(),
      },
    }).catch(() => {
      // Falha de lock não deve interromper o fluxo.
    })
  }, [currentUser?.id, currentUser?.usuario])

  const releaseFieldLock = useCallback((fieldKey?: string) => {
    const lockAtual = currentFieldLockRef.current
    if (!lockAtual) {
      return
    }

    if (fieldKey && lockAtual.fieldKey !== fieldKey) {
      return
    }

    sendFieldLockBroadcast({
      fieldKey: lockAtual.fieldKey,
      fieldLabel: lockAtual.fieldLabel,
      locked: false,
    })
    currentFieldLockRef.current = null
    trackPresencePayload()
  }, [sendFieldLockBroadcast, trackPresencePayload])

  const acquireFieldLock = useCallback((fieldKey: string, fieldLabel: string) => {
    const chaveNormalizada = fieldKey.trim()
    if (!chaveNormalizada) {
      return
    }

    const rotuloNormalizado = fieldLabel.trim() || chaveNormalizada
    const lockAtual = currentFieldLockRef.current

    if (lockAtual?.fieldKey === chaveNormalizada) {
      return
    }

    if (lockAtual) {
      sendFieldLockBroadcast({
        fieldKey: lockAtual.fieldKey,
        fieldLabel: lockAtual.fieldLabel,
        locked: false,
      })
    }

    currentFieldLockRef.current = {
      fieldKey: chaveNormalizada,
      fieldLabel: rotuloNormalizado,
      updatedAt: new Date().toISOString(),
    }

    sendFieldLockBroadcast({
      fieldKey: chaveNormalizada,
      fieldLabel: rotuloNormalizado,
      locked: true,
    })
    trackPresencePayload()
  }, [sendFieldLockBroadcast, trackPresencePayload])

  useEffect(() => {
    let active = true
    let heartbeatId: number | null = null

    const stopHeartbeat = () => {
      if (heartbeatId !== null) {
        window.clearInterval(heartbeatId)
        heartbeatId = null
      }
    }

    const removeChannel = async (channel: OeePresenceChannel | null) => {
      if (!channel) {
        return
      }

      stopHeartbeat()

      const lockAtual = currentFieldLockRef.current
      if (lockAtual) {
        sendFieldLockBroadcast({
          fieldKey: lockAtual.fieldKey,
          fieldLabel: lockAtual.fieldLabel,
          locked: false,
        }, channel)
        currentFieldLockRef.current = null
      }

      try {
        await channel.untrack()
      } catch {
        // Ignora falha de untrack para não interromper cleanup.
      }

      try {
        await supabase.removeChannel(channel)
      } catch {
        // Ignora falha de remoção para manter fluxo principal.
      }
    }

    const syncParticipants = (channel: OeePresenceChannel) => {
      if (!active) {
        return
      }

      const state = channel.presenceState<Record<string, unknown>>()
      const participants = mapPresenceStateToParticipants({
        state: state as unknown as Record<string, unknown>,
        currentUserId: currentUser?.id,
        currentTabId: tabIdRef.current,
      })
      const locksPorConexaoSnapshot = mapPresenceStateToFieldLocksByConnection({
        state: state as unknown as Record<string, unknown>,
        currentUserId: currentUser?.id,
        currentTabId: tabIdRef.current,
      })
      setOthers(participants)
      setCursorsByConnection((current) => {
        const allowedConnections = new Set(participants.map((item) => item.connectionId))
        let changed = false
        const next: Record<string, OeePresenceCursor> = {}

        for (const [connectionId, cursor] of Object.entries(current)) {
          if (allowedConnections.has(connectionId)) {
            next[connectionId] = cursor
            continue
          }
          changed = true
        }

        return changed ? next : current
      })
      setFieldLocksByConnection((current) => {
        const allowedConnections = new Set(participants.map((item) => item.connectionId))
        const next: Record<string, OeePresenceFieldLock> = {}

        for (const connectionId of allowedConnections) {
          const lockSnapshot = locksPorConexaoSnapshot[connectionId]
          const lockAtual = current[connectionId]

          if (lockSnapshot && lockAtual) {
            const snapshotMs = Date.parse(lockSnapshot.updatedAt)
            const atualMs = Date.parse(lockAtual.updatedAt)
            next[connectionId] = (Number.isFinite(atualMs) ? atualMs : 0) > (Number.isFinite(snapshotMs) ? snapshotMs : 0)
              ? lockAtual
              : lockSnapshot
            continue
          }

          if (lockSnapshot) {
            next[connectionId] = lockSnapshot
            continue
          }
        }

        return next
      })
    }

    if (!shouldConnect || !currentUser?.id || !oeeTurnoId) {
      const currentChannel = channelRef.current
      channelRef.current = null
      void removeChannel(currentChannel)
      setOthers([])
      setCursorsByConnection({})
      setFieldLocksByConnection({})
      setUiStateEvent(null)
      setError(null)
      setConnectionStatus('idle')
      return () => {
        active = false
        stopHeartbeat()
      }
    }

    const previousChannel = channelRef.current
    channelRef.current = null
    void removeChannel(previousChannel)

    setConnectionStatus('connecting')
    setError(null)

    const topic = buildOeePresenceTopic(oeeTurnoId)
    const channel = supabase.channel(topic, {
      config: {
        private: true,
        presence: {
          key: buildOeePresenceKey(currentUser.id, tabIdRef.current),
        },
      },
    })

    channelRef.current = channel

    channel.on('presence', { event: 'sync' }, () => {
      syncParticipants(channel)
    })
    channel.on('presence', { event: 'join' }, () => {
      syncParticipants(channel)
    })
    channel.on('presence', { event: 'leave' }, () => {
      syncParticipants(channel)
    })
    channel.on('broadcast', { event: 'cursor_move' }, (message) => {
      if (!active || !currentUser?.id) {
        return
      }

      const messageRecord = asRecord(message)
      const payloadRecord = asRecord(messageRecord?.payload)
      if (!payloadRecord) {
        return
      }

      const userId = asString(payloadRecord.user_id)
      const tabId = asString(payloadRecord.tab_id)
      if (!userId || !tabId) {
        return
      }

      if (userId === currentUser.id && tabId === tabIdRef.current) {
        return
      }

      const connectionId = buildConnectionId(userId, tabId)
      const visible = asBoolean(payloadRecord.visible) ?? true

      if (!visible) {
        setCursorsByConnection((current) => {
          if (!(connectionId in current)) {
            return current
          }

          const next = { ...current }
          delete next[connectionId]
          return next
        })
        return
      }

      const xRatio = clampRatio(asNumber(payloadRecord.x_ratio))
      const yRatio = clampRatio(asNumber(payloadRecord.y_ratio))
      if (xRatio === null || yRatio === null) {
        return
      }

      const updatedAt = asString(payloadRecord.updated_at) ?? new Date().toISOString()

      setCursorsByConnection((current) => ({
        ...current,
        [connectionId]: {
          connectionId,
          userId,
          tabId,
          xRatio,
          yRatio,
          updatedAt,
        },
      }))
    })
    channel.on('broadcast', { event: 'ui_state' }, (message) => {
      if (!active || !currentUser?.id) {
        return
      }

      const messageRecord = asRecord(message)
      const payloadRecord = asRecord(messageRecord?.payload)
      if (!payloadRecord) {
        return
      }

      const userId = asString(payloadRecord.user_id)
      const tabId = asString(payloadRecord.tab_id)
      const updatedAt = asString(payloadRecord.updated_at) ?? new Date().toISOString()
      const state = asRecord(payloadRecord.state)

      if (!userId || !tabId || !state) {
        return
      }

      if (userId === currentUser.id && tabId === tabIdRef.current) {
        return
      }

      const connectionId = buildConnectionId(userId, tabId)

      setUiStateEvent({
        connectionId,
        userId,
        tabId,
        updatedAt,
        state: state as OeePresenceUiStateSnapshot,
      })
    })
    channel.on('broadcast', { event: 'field_lock' }, (message) => {
      if (!active || !currentUser?.id) {
        return
      }

      const messageRecord = asRecord(message)
      const payloadRecord = asRecord(messageRecord?.payload)
      if (!payloadRecord) {
        return
      }

      const userId = asString(payloadRecord.user_id)
      const tabId = asString(payloadRecord.tab_id)
      if (!userId || !tabId) {
        return
      }

      if (userId === currentUser.id && tabId === tabIdRef.current) {
        return
      }

      const connectionId = buildConnectionId(userId, tabId)
      const locked = asBoolean(payloadRecord.locked)
      if (locked === null) {
        return
      }

      if (!locked) {
        setFieldLocksByConnection((current) => {
          if (!(connectionId in current)) {
            return current
          }

          const next = { ...current }
          delete next[connectionId]
          return next
        })
        return
      }

      const fieldKey = asString(payloadRecord.field_key)
      if (!fieldKey) {
        return
      }

      const fieldLabel = asString(payloadRecord.field_label) ?? fieldKey
      const usuario = asString(payloadRecord.usuario)
      const updatedAt = asString(payloadRecord.updated_at) ?? new Date().toISOString()

      setFieldLocksByConnection((current) => ({
        ...current,
        [connectionId]: {
          connectionId,
          userId,
          tabId,
          usuario,
          fieldKey,
          fieldLabel,
          updatedAt,
        },
      }))
    })

    channel.subscribe((status, subscribeError) => {
      if (!active || channelRef.current !== channel) {
        return
      }

      if (isSubscribed(status)) {
        setConnectionStatus('connected')
        setError(null)
        syncParticipants(channel)

        const payloadInicial = payloadRef.current
        if (payloadInicial) {
          const payloadTrack = buildTrackPayloadWithCurrentLock(payloadInicial)
          if (payloadTrack) {
            void channel.track(payloadTrack).catch((trackError: unknown) => {
              if (!active || channelRef.current !== channel) {
                return
              }
              const mensagem = trackError instanceof Error ? trackError.message : 'Falha ao enviar presence.'
              setConnectionStatus('error')
              setError(mensagem)
            })
          }
        }

        stopHeartbeat()
        heartbeatId = window.setInterval(() => {
          const heartbeatPayload = payloadRef.current
          if (!active || channelRef.current !== channel || !heartbeatPayload) {
            return
          }

          const payloadTrack = buildTrackPayloadWithCurrentLock(heartbeatPayload)
          if (!payloadTrack) {
            return
          }

          void channel.track(payloadTrack).catch(() => {
            // Heartbeat não deve interromper o fluxo da tela.
          })
        }, OEE_PRESENCE_HEARTBEAT_MS)
        return
      }

      if (isConnectionError(status)) {
        setConnectionStatus('error')
        setError(subscribeError?.message ?? 'Não foi possível conectar no presence.')
        setOthers([])
        setCursorsByConnection({})
        setFieldLocksByConnection({})
        setUiStateEvent(null)
        return
      }

      if (isClosed(status)) {
        setConnectionStatus('idle')
      }
    })

    return () => {
      active = false
      if (channelRef.current === channel) {
        channelRef.current = null
      }
      void removeChannel(channel)
      setOthers([])
      setCursorsByConnection({})
      setFieldLocksByConnection({})
      setUiStateEvent(null)
      setConnectionStatus('idle')
    }
  }, [
    buildTrackPayloadWithCurrentLock,
    currentUser?.id,
    oeeTurnoId,
    sendFieldLockBroadcast,
    shouldConnect,
  ])

  useEffect(() => {
    if (connectionStatus !== 'connected') {
      return
    }

    const staleIntervalId = window.setInterval(() => {
      const limite = Date.now() - OEE_PRESENCE_CURSOR_STALE_MS
      setCursorsByConnection((current) => {
        let changed = false
        const next: Record<string, OeePresenceCursor> = {}

        for (const [connectionId, cursor] of Object.entries(current)) {
          const timestamp = Date.parse(cursor.updatedAt)
          if (Number.isFinite(timestamp) && timestamp >= limite) {
            next[connectionId] = cursor
            continue
          }
          changed = true
        }

        return changed ? next : current
      })
    }, 1_000)

    return () => {
      window.clearInterval(staleIntervalId)
    }
  }, [connectionStatus])

  useEffect(() => {
    if (connectionStatus !== 'connected' || !currentUser?.id) {
      return
    }

    const channel = channelRef.current
    if (!channel) {
      return
    }

    let lastSentAt = 0

    const sendCursor = (xRatio: number | null, yRatio: number | null, visible: boolean) => {
      const now = Date.now()
      if (visible && now - lastSentAt < OEE_PRESENCE_CURSOR_THROTTLE_MS) {
        return
      }
      lastSentAt = now

      const payloadCursor: Record<string, unknown> = {
        user_id: currentUser.id,
        tab_id: tabIdRef.current,
        usuario: currentUser.usuario,
        atividade: activityState.atividade,
        formulario: activityState.formulario,
        modo_operacao: activityState.modoOperacao,
        visible,
        updated_at: new Date().toISOString(),
      }

      if (typeof xRatio === 'number') {
        payloadCursor.x_ratio = xRatio
      }

      if (typeof yRatio === 'number') {
        payloadCursor.y_ratio = yRatio
      }

      void channel.send({
        type: 'broadcast',
        event: 'cursor_move',
        payload: payloadCursor,
      }).catch(() => {
        // Falha de cursor não deve bloquear a edição.
      })
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (window.innerWidth <= 0 || window.innerHeight <= 0) {
        return
      }

      const xRatio = clampRatio(event.clientX / window.innerWidth)
      const yRatio = clampRatio(event.clientY / window.innerHeight)
      if (xRatio === null || yRatio === null) {
        return
      }

      sendCursor(xRatio, yRatio, true)
    }

    const handleMouseLeave = () => {
      sendCursor(null, null, false)
    }

    const handleWindowBlur = () => {
      sendCursor(null, null, false)
      releaseFieldLock()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        sendCursor(null, null, false)
        releaseFieldLock()
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('blur', handleWindowBlur)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('blur', handleWindowBlur)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      sendCursor(null, null, false)
      releaseFieldLock()
    }
  }, [
    activityState.atividade,
    activityState.formulario,
    activityState.modoOperacao,
    connectionStatus,
    currentUser?.id,
    currentUser?.usuario,
    releaseFieldLock,
  ])

  useEffect(() => {
    if (connectionStatus !== 'connected' || !payload) {
      return
    }

    const channel = channelRef.current
    if (!channel) {
      return
    }

    const payloadTrack = buildTrackPayloadWithCurrentLock(payload)
    if (!payloadTrack) {
      return
    }

    void channel.track(payloadTrack).catch((trackError: unknown) => {
      const mensagem = trackError instanceof Error ? trackError.message : 'Falha ao atualizar presence.'
      setConnectionStatus('error')
      setError(mensagem)
    })
  }, [buildTrackPayloadWithCurrentLock, connectionStatus, payload])

  const cursors = useMemo<OeePresenceCursor[]>(() => {
    return Object.values(cursorsByConnection).sort((a, b) => {
      const aMs = Date.parse(a.updatedAt)
      const bMs = Date.parse(b.updatedAt)
      return (Number.isFinite(bMs) ? bMs : 0) - (Number.isFinite(aMs) ? aMs : 0)
    })
  }, [cursorsByConnection])

  const fieldLocks = useMemo<OeePresenceFieldLock[]>(() => {
    return Object.values(fieldLocksByConnection).sort((a, b) => {
      const aMs = Date.parse(a.updatedAt)
      const bMs = Date.parse(b.updatedAt)
      return (Number.isFinite(bMs) ? bMs : 0) - (Number.isFinite(aMs) ? aMs : 0)
    })
  }, [fieldLocksByConnection])

  const broadcastUiState = useCallback((state: OeePresenceUiStateSnapshot) => {
    if (connectionStatus !== 'connected' || !currentUser?.id) {
      return
    }

    const channel = channelRef.current
    if (!channel) {
      return
    }

    void channel.send({
      type: 'broadcast',
      event: 'ui_state',
      payload: {
        user_id: currentUser.id,
        tab_id: tabIdRef.current,
        updated_at: new Date().toISOString(),
        state,
      },
    }).catch(() => {
      // Erro de sincronização de UI não deve quebrar a página.
    })
  }, [connectionStatus, currentUser?.id])

  return {
    connectionStatus,
    others,
    cursors,
    fieldLocks,
    uiStateEvent,
    broadcastUiState,
    acquireFieldLock,
    releaseFieldLock,
    othersCount: others.length,
    connected: connectionStatus === 'connected',
    error,
  }
}
