import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { OEE_PRESENCE_HEARTBEAT_MS } from '@/pages/oee/apontamento-oee/realtime-presence/constants/realtimePresence.constants'
import type {
  OeePresenceTrackPayload,
  UseOeeTurnoPresenceParams,
  UseOeeTurnoPresenceResult,
} from '@/pages/oee/apontamento-oee/realtime-presence/types/realtimePresence.types'
import { mapPresenceStateToParticipants } from '@/pages/oee/apontamento-oee/realtime-presence/utils/realtimePresenceMapper.utils'
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

export function useOeeTurnoPresence({
  enabled,
  oeeTurnoId,
  currentUser,
  activityState,
}: UseOeeTurnoPresenceParams): UseOeeTurnoPresenceResult {
  const [connectionStatus, setConnectionStatus] = useState<UseOeeTurnoPresenceResult['connectionStatus']>('idle')
  const [others, setOthers] = useState<UseOeeTurnoPresenceResult['others']>([])
  const [error, setError] = useState<string | null>(null)

  const channelRef = useRef<OeePresenceChannel | null>(null)
  const tabIdRef = useRef(createPresenceTabId())
  const payloadRef = useRef<OeePresenceTrackPayload | null>(null)

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
      setOthers(participants)
    }

    if (!shouldConnect || !currentUser?.id || !oeeTurnoId) {
      const currentChannel = channelRef.current
      channelRef.current = null
      void removeChannel(currentChannel)
      setOthers([])
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
          void channel.track(payloadInicial).catch((trackError: unknown) => {
            if (!active || channelRef.current !== channel) {
              return
            }
            const mensagem = trackError instanceof Error ? trackError.message : 'Falha ao enviar presence.'
            setConnectionStatus('error')
            setError(mensagem)
          })
        }

        stopHeartbeat()
        heartbeatId = window.setInterval(() => {
          const heartbeatPayload = payloadRef.current
          if (!active || channelRef.current !== channel || !heartbeatPayload) {
            return
          }

          void channel.track({
            ...heartbeatPayload,
            updated_at: new Date().toISOString(),
          }).catch(() => {
            // Heartbeat não deve interromper o fluxo da tela.
          })
        }, OEE_PRESENCE_HEARTBEAT_MS)
        return
      }

      if (isConnectionError(status)) {
        setConnectionStatus('error')
        setError(subscribeError?.message ?? 'Não foi possível conectar no presence.')
        setOthers([])
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
      setConnectionStatus('idle')
    }
  }, [currentUser?.id, oeeTurnoId, shouldConnect])

  useEffect(() => {
    if (connectionStatus !== 'connected' || !payload) {
      return
    }

    const channel = channelRef.current
    if (!channel) {
      return
    }

    void channel.track({
      ...payload,
      updated_at: new Date().toISOString(),
    }).catch((trackError: unknown) => {
      const mensagem = trackError instanceof Error ? trackError.message : 'Falha ao atualizar presence.'
      setConnectionStatus('error')
      setError(mensagem)
    })
  }, [connectionStatus, payload])

  return {
    connectionStatus,
    others,
    othersCount: others.length,
    connected: connectionStatus === 'connected',
    error,
  }
}
