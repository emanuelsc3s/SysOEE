import type { ParadaGeral } from '@/components/apontamento/ModalBuscaParadas'
import type { OeeTurnoStatus } from '@/types/apontamento-oee'

export type AbaApontamentoRapidoOEE = 'PRODUCAO' | 'PERDA' | 'PARADA'

export interface ContextoTurnoRapidoOEE {
  oeeturnoId: number
  data: string
  turnoId: number
  turno: string
  horaInicio: string | null
  horaFim: string | null
  linhaProducaoId: number | null
  linhaProducaoNome: string
  produtoId: number
  produto: string
  status: OeeTurnoStatus | null
}

export interface RegistroProducaoRapidoOEE {
  oeeturnoproducao_id: number
  hora_inicio: string | null
  hora_final: string | null
  quantidade: number | null
}

export interface JanelaHoraOEE {
  chave: string
  horaInicio: string
  horaFim: string
}

export type JanelaFaltanteOEE = JanelaHoraOEE

export interface RegistrarProducaoRapidaOEEInput {
  contexto: ContextoTurnoRapidoOEE
  janela: JanelaHoraOEE
  quantidade: number
}

export interface RegistrarPerdaRapidaOEEInput {
  contexto: ContextoTurnoRapidoOEE
  perdaNormalizada: string
}

export interface RegistrarParadaRapidaOEEInput {
  contexto: ContextoTurnoRapidoOEE
  paradaSelecionada: ParadaGeral
  horaInicial: string
  horaFinal: string
  observacao: string
}
