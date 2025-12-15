/**
 * Tipos de dados para o módulo de Apontamento de OEE
 * Define as estruturas de dados para apontamento de produção, qualidade e paradas
 */

import { Turno, Setor } from './operacao'

/**
 * Interface para Apontamento de Produção
 */
export interface ApontamentoProducao {
  /** ID único do apontamento */
  id: string

  /** Turno de produção */
  turno: Turno

  /** Linha de produção */
  linha: string

  /** Setor produtivo */
  setor: Setor

  /** Código do SKU */
  sku: string

  /** Descrição do produto */
  produto: string

  /** Velocidade nominal do SKU (unidades/hora) */
  velocidadeNominal: number

  /** Quantidade produzida (unidades) */
  quantidadeProduzida: number

  /** Tempo de operação em horas */
  tempoOperacao: number

  /** Tempo disponível em horas */
  tempoDisponivel: number

  /** Data do apontamento (formato YYYY-MM-DD) */
  dataApontamento: string

  /** Hora de início (formato HH:MM:SS) */
  horaInicio: string

  /** Hora de fim (formato HH:MM:SS) */
  horaFim: string | null

  /** ID do usuário que fez o apontamento */
  criadoPor: number

  /** Nome do usuário que fez o apontamento */
  criadoPorNome: string

  /** Campos de auditoria ALCOA+ */
  created_at: string
  updated_at: string
}

/**
 * Interface para Apontamento de Qualidade - Perdas
 */
export interface ApontamentoQualidadePerdas {
  /** ID único do apontamento */
  id: string

  /** ID do apontamento de produção relacionado */
  apontamentoProducaoId: string

  /** Quantidade de unidades rejeitadas/descartadas */
  unidadesRejeitadas: number

  /** Motivo da rejeição */
  motivoRejeicao: string

  /** Observações adicionais */
  observacao: string | null

  /** ID do usuário que fez o apontamento */
  criadoPor: number

  /** Nome do usuário que fez o apontamento */
  criadoPorNome: string

  /** Campos de auditoria ALCOA+ */
  created_at: string
  updated_at: string
}

/**
 * Interface para Apontamento de Qualidade - Retrabalho
 */
export interface ApontamentoQualidadeRetrabalho {
  /** ID único do apontamento */
  id: string

  /** ID do apontamento de produção relacionado */
  apontamentoProducaoId: string

  /** Quantidade de unidades em retrabalho */
  unidadesRetrabalho: number

  /** Tempo de retrabalho em horas */
  tempoRetrabalho: number

  /** Motivo do retrabalho */
  motivoRetrabalho: string

  /** Observações adicionais */
  observacao: string | null

  /** ID do usuário que fez o apontamento */
  criadoPor: number

  /** Nome do usuário que fez o apontamento */
  criadoPorNome: string

  /** Campos de auditoria ALCOA+ */
  created_at: string
  updated_at: string
}

/**
 * Interface para cálculo de OEE em tempo real
 */
export interface CalculoOEE {
  /** Disponibilidade (%) */
  disponibilidade: number

  /** Performance (%) */
  performance: number

  /** Qualidade (%) */
  qualidade: number

  /** OEE total (%) */
  oee: number

  /** Tempo operacional líquido (horas) */
  tempoOperacionalLiquido: number

  /** Tempo valioso (horas) */
  tempoValioso: number
}

/**
 * DTO para criação de apontamento de produção
 */
export interface CriarApontamentoProducaoDTO {
  turno: Turno
  linha: string
  setor: Setor
  sku: string
  produto: string
  velocidadeNominal: number
  quantidadeProduzida: number
  tempoOperacao: number
  tempoDisponivel: number
  dataApontamento: string
  horaInicio: string
  horaFim: string | null
  criadoPor: number
  criadoPorNome: string
}

