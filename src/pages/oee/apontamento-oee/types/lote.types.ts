export type StatusTurnoLote = 'NAO_INICIADO' | 'INICIADO' | 'ENCERRADO'

export interface LoteProducao {
  id: string
  numeroLote: string
  data: string
  fabricacao: string
  validade: string
  horaInicial: string
  horaFinal: string
  quantidadePerdas: number
  quantidadeProduzidaInicial: number
  quantidadeProduzidaFinal: number
  quantidadeProduzida: number
  totalProducao: number
}

export interface DadosLote {
  numeroLote: string
  data: string
  fabricacao: string
  validade: string
  horaInicial: string
  horaFinal: string
  quantidadePerdas: number
  quantidadeProduzidaInicial: number
  quantidadeProduzidaFinal: number
}

export interface LoteSupabase {
  oeeturnolote_id: number
  lote: string | null
  fabricacao: string | null
  validade: string | null
  hora_inicio: string | null
  hora_fim: string | null
  data: string | null
  qtd_inicial: number | string | null
  qtd_final: number | string | null
  perda: number | string | null
  qtd_produzida: number | string | null
  total_producao: number | string | null
  oeeturno_id: number | null
  created_at: string | null
  deletado: 'S' | 'N' | null
}

export interface PayloadLoteSupabase {
  lote: string
  fabricacao: string
  validade: string
  hora_inicio: string
  hora_fim: string
  data: string
  qtd_inicial: number
  qtd_final: number
  perda: number
  oeeturno_id: number
}

export interface TotaisLote {
  totalProduzidoInicial: number
  totalProduzidoFinal: number
  totalProduzido: number
  totalPerdas: number
  totalProducao: number
}

export const ESTADO_INICIAL_LOTE: DadosLote = {
  numeroLote: '',
  data: '',
  fabricacao: '',
  validade: '',
  horaInicial: '',
  horaFinal: '',
  quantidadePerdas: 0,
  quantidadeProduzidaInicial: 0,
  quantidadeProduzidaFinal: 0,
}
