import type { OeePresenceActivityState } from '@/pages/oee/apontamento-oee/realtime-presence/types/realtimePresence.types'

interface BuildPresenceActivityStateInput {
  modoConsulta: boolean
  editandoCabecalho: boolean
  modalAnotacoesAberto: boolean
  formularioAtivo: string
  modoOperacao: string | null
}

function normalizarFormulario(formularioAtivo: string): string | null {
  const valor = formularioAtivo.trim()
  return valor ? valor : null
}

export function buildPresenceActivityState({
  modoConsulta,
  editandoCabecalho,
  modalAnotacoesAberto,
  formularioAtivo,
  modoOperacao,
}: BuildPresenceActivityStateInput): OeePresenceActivityState {
  const formulario = normalizarFormulario(formularioAtivo)

  if (editandoCabecalho) {
    return {
      atividade: 'editando_cabecalho',
      formulario,
      modoOperacao,
    }
  }

  if (modoConsulta) {
    return {
      atividade: 'visualizando',
      formulario,
      modoOperacao,
    }
  }

  if (modalAnotacoesAberto) {
    return {
      atividade: 'editando_anotacao',
      formulario,
      modoOperacao,
    }
  }

  if (formularioAtivo === 'quality-form') {
    return {
      atividade: 'editando_qualidade',
      formulario,
      modoOperacao,
    }
  }

  if (formularioAtivo === 'downtime-form') {
    return {
      atividade: 'editando_parada',
      formulario,
      modoOperacao,
    }
  }

  if (formularioAtivo === 'production-form') {
    return {
      atividade: 'editando_producao',
      formulario,
      modoOperacao,
    }
  }

  return {
    atividade: 'visualizando',
    formulario,
    modoOperacao,
  }
}
