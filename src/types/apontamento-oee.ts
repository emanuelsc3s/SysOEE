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

/**
 * Status possíveis para um turno OEE
 */
export type OeeTurnoStatus = 'Aberto' | 'Fechado' | 'Cancelado'

/**
 * Interface para dados do banco de dados (tboee_turno)
 * Representa a estrutura exata da tabela no Supabase
 */
export interface OeeTurnoDB {
  oeeturno_id: number
  data: string | null
  produto_id: number
  produto: string
  turno_id: number
  turno: string
  turno_hi: string | null  // time without time zone
  turno_hf: string | null  // time without time zone
  observacao: string | null
  status: OeeTurnoStatus | null
  deletado: string | null
  created_at: string
  created_by: number | null
  updated_at: string | null
  updated_by: number | null
  deleted_at: string | null
  deleted_by: number | null
}

/**
 * Interface para dados do formulário/UI de OEE Turno
 */
export interface OeeTurnoFormData {
  /** ID do registro (string para compatibilidade com formulário) */
  id: string
  /** Data do apontamento (formato YYYY-MM-DD) */
  data: string
  /** ID do produto */
  produtoId: number
  /** Descrição completa do produto */
  produto: string
  /** ID do turno */
  turnoId: number
  /** Nome do turno */
  turno: string
  /** Hora de início (formato HH:MM:SS) */
  horaInicio: string | null
  /** Hora de fim (formato HH:MM:SS) */
  horaFim: string | null
  /** Observações */
  observacao: string | null
  /** Status do turno */
  status: OeeTurnoStatus | null
  /** Data de criação */
  createdAt: string
  /** Usuário que criou */
  createdBy: number | null
}

/**
 * Interface para filtros de busca de OEE Turno
 */
export interface FetchOeeTurnoFilters {
  /** Termo de busca geral */
  searchTerm?: string
  /** Filtrar por data específica */
  data?: string
  /** Filtrar por ID do turno */
  turnoId?: number
  /** Filtrar por ID do produto */
  produtoId?: number
  /** Filtrar por status */
  status?: OeeTurnoStatus
}

