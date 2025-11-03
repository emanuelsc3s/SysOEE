/**
 * Tipos relacionados ao cadastro e gerenciamento de amostras
 * Flash de Linha e Reator
 */

/**
 * Tipos de amostra disponíveis no sistema
 */
export type TipoAmostra = 'Flash de Linha' | 'Reator'

/**
 * Interface completa para dados de uma amostra
 * Segue princípios ALCOA+ (Atribuível, Legível, Contemporâneo, Original, Exato)
 */
export interface Amostra {
  /** ID único da amostra */
  id: string

  /** Tipo de amostra coletada */
  tipoAmostra: TipoAmostra

  /** ID da Ordem de Produção relacionada */
  opId: string

  /** Descrição da OP (produto + lote) */
  opDescricao: string

  /** Data e hora da coleta da amostra (ISO 8601) */
  dataHoraColeta: string

  /** Observações adicionais sobre a coleta (opcional) */
  observacoes?: string

  /** ID do usuário que registrou a amostra */
  usuarioId: number

  /** Nome do usuário que registrou a amostra */
  usuarioNome: string

  /** Data e hora do cadastro no sistema (ISO 8601) */
  dataHoraCadastro: string
}

/**
 * DTO para criação de nova amostra
 * Omite campos gerados automaticamente pelo sistema
 */
export type CriarAmostraDTO = Omit<
  Amostra,
  'id' | 'dataHoraCadastro' | 'usuarioId' | 'usuarioNome'
>

/**
 * Filtros para busca de amostras
 */
export interface FiltrosAmostra {
  /** Filtrar por tipo de amostra */
  tipoAmostra?: TipoAmostra

  /** Filtrar por OP específica */
  opId?: string

  /** Filtrar por período de coleta (data inicial) */
  dataColetaInicio?: string

  /** Filtrar por período de coleta (data final) */
  dataColetaFim?: string

  /** Filtrar por usuário que registrou */
  usuarioId?: number
}

