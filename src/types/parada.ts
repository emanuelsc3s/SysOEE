/**
 * Tipos de dados para o módulo de Paradas
 * Define as estruturas de dados para apontamento de paradas de produção
 */

/**
 * Tipo de parada conforme metodologia OEE
 */
export type TipoParada = 'ESTRATEGICA' | 'PLANEJADA' | 'NAO_PLANEJADA'

/**
 * Interface para Código de Parada (hierarquia de 5 níveis)
 */
export interface CodigoParada {
  /** ID único do código de parada */
  id: string

  /** ID da linha (NULL = parada global) */
  linha_id: string | null

  /** Código único da parada */
  codigo: string

  /** Descrição da parada */
  descricao: string

  /** Nível 1: Classe (Planejada, Não Planejada, Estratégica) */
  nivel_1_classe: string

  /** Nível 2: Grande Parada (Manutenção, Falta de Insumo, etc) */
  nivel_2_grande_parada: string

  /** Nível 3: Apontamento */
  nivel_3_apontamento: string | null

  /** Nível 4: Grupo (Mecânica, Elétrica, etc) */
  nivel_4_grupo: string | null

  /** Nível 5: Detalhamento */
  nivel_5_detalhamento: string | null

  /** Tipo de parada */
  tipo_parada: TipoParada

  /** Se FALSE, afeta Performance (paradas < 10 min) */
  impacta_disponibilidade: boolean

  /** Tempo mínimo para registro (minutos) */
  tempo_minimo_registro: number

  /** Se o código está ativo */
  ativo: boolean
}

/**
 * Interface para Apontamento de Parada
 */
export interface ApontamentoParada {
  /** ID único do apontamento */
  id: string

  /** ID da linha de produção */
  linha_id: string

  /** ID do lote (NULL se parada sem lote) */
  lote_id: string | null

  /** ID do código de parada */
  codigo_parada_id: string

  /** ID do turno */
  turno_id: string

  /** Data da parada */
  data_parada: string

  /** Hora de início (formato HH:MM:SS) */
  hora_inicio: string

  /** Hora de fim (NULL se parada em andamento) */
  hora_fim: string | null

  /** Duração em minutos (calculado automaticamente) */
  duracao_minutos: number | null

  /** Observações sobre a parada */
  observacao: string | null

  /** ID do operador que registrou (ALCOA+: Atribuível) */
  criado_por_operador: number

  /** ID do supervisor que conferiu */
  conferido_por_supervisor: number | null

  /** Data/hora da conferência */
  conferido_em: string | null

  /** Campos de auditoria */
  created_at: string
  created_by: number | null
  updated_at: string
  updated_by: number | null
  deleted_at: string | null
  deleted_by: number | null
}

/**
 * DTO para criação de apontamento de parada
 */
export interface CriarApontamentoParadaDTO {
  /** ID da linha de produção */
  linha_id: string

  /** ID do lote (opcional) */
  lote_id?: string | null

  /** ID do código de parada */
  codigo_parada_id: string

  /** ID do turno */
  turno_id: string

  /** Data da parada (formato YYYY-MM-DD) */
  data_parada: string

  /** Hora de início (formato HH:MM:SS) */
  hora_inicio: string

  /** Observações (opcional) */
  observacao?: string | null

  /** ID do operador que está registrando */
  criado_por_operador: number
}

/**
 * Interface para Turno
 */
export interface Turno {
  /** ID único do turno */
  id: string

  /** Código do turno */
  codigo: string

  /** Nome do turno */
  nome: string

  /** Hora de início (formato HH:MM:SS) */
  hora_inicio: string

  /** Hora de fim (formato HH:MM:SS) */
  hora_fim: string

  /** Duração em horas */
  duracao_horas: number

  /** Se o turno está ativo */
  ativo: boolean
}

/**
 * Opções para seleção hierárquica de paradas
 */
export interface OpcaoHierarquiaParada {
  /** Valor da opção */
  value: string

  /** Label exibido */
  label: string

  /** Se está desabilitado */
  disabled?: boolean
}

