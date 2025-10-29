/**
 * Tipos de dados para o módulo de Operação
 * Define as estruturas de dados para Ordens de Produção e Kanban
 */

/**
 * Fases do processo produtivo no Kanban
 */
export type FaseProducao =
  | 'Planejado'
  | 'Emissão de Dossiê'
  | 'Pesagem'
  | 'Preparação'
  | 'Envase'
  | 'Embalagem'
  | 'Concluído'

/**
 * Turnos de produção
 * Sistema utiliza apenas 2 turnos de 8 horas cada
 */
export type Turno = '1º Turno' | '2º Turno'

/**
 * Setores produtivos
 */
export type Setor = 'SPEP' | 'SPPV' | 'Líquidos' | 'CPHD'

/**
 * Interface para Ordem de Produção
 */
export interface OrdemProducao {
  /** Número da Ordem de Produção */
  op: string

  /** Data de emissão (formato DD/MM/YYYY) */
  dataEmissao: string

  /** Número do lote */
  lote: string

  /** Código do SKU */
  sku: string

  /** Descrição do produto */
  produto: string

  /** Equipamento/Linha de produção */
  equipamento: string

  /** Fase atual no Kanban */
  fase: FaseProducao

  /** Quantidade teórica planejada */
  quantidadeTeorica: number

  /** Quantidade de perdas */
  perdas: number

  /** Quantidade embalada na etapa de Embalagem (em Unidades) */
  quantidadeEmbaladaUnidades: number


  /** Quantidade preparada na etapa de Preparação (em ML) */
  quantidadePreparadaMl?: number

  /** Perda/desperdício relacionada à etapa de Preparação (em ML) */
  perdasPreparacaoMl?: number

  /** Quantidade envasada na etapa de Envase (em Unidades) */
  quantidadeEnvasadaUnidades?: number

  /** Perda/desperdício na etapa de Envase (em Unidades) */
  perdasEnvaseUnidades?: number

  /** Data e hora de conclusão da etapa de Preparação (ISO 8601) */
  dataHoraPreparacao?: string

  /** Data e hora de conclusão da etapa de Envase (ISO 8601) */
  dataHoraEnvase?: string

  /** Data e hora de conclusão da etapa de Embalagem (ISO 8601) */
  dataHoraEmbalagem?: string

  /** Total de horas em operação (formato HH:MM) */
  horas: string

  /** Turno de produção */
  turno: Turno

  /** Número do dossiê */
  dossie?: string

  /** Código de barras GTIN */
  gtin?: string

  /** Setor produtivo */
  setor: Setor
}

/**
 * Interface para dados brutos do mock (TSV)
 */
export interface DadosMockOP {
  C2_EMISSAO: string
  OP: string
  SKU: string
  SKU_DESCRICAO: string
  TEORICO: string
  DOSSIE: string
  LOTE: string
  GTIN: string
}

/**
 * Tipo de movimentação no histórico de auditoria
 */
export type TipoMovimentacao = 'avanco' | 'retrocesso'

/**
 * Registro de movimentação de OP para auditoria (ALCOA+)
 */
export interface RegistroMovimentacao {
  /** ID único do registro */
  id: string

  /** Número da OP movimentada */
  op: string

  /** Fase de origem */
  faseOrigem: FaseProducao

  /** Fase de destino */
  faseDestino: FaseProducao

  /** Tipo de movimentação */
  tipo: TipoMovimentacao

  /** Data e hora da movimentação (ISO 8601) */
  dataHora: string

  /** Usuário que realizou a movimentação */
  usuario: string

  /** Justificativa (obrigatória para retrocesso) */
  justificativa?: string
}

/**
 * Interface para Assinatura de Aprovação da Supervisão
 * Seguindo princípios ALCOA+ (Atribuível, Contemporâneo, Durável)
 */
export interface AssinaturaSupervisao {
  /** ID único da assinatura */
  id: string

  /** Número da OP assinada */
  op: string

  /** Nome completo do supervisor */
  nomeSupervisor: string

  /** Número do crachá/matrícula do supervisor */
  numeroCracha: string

  /** Data e hora da assinatura (ISO 8601) */
  dataHoraAssinatura: string

  /** Assinatura em formato base64 (imagem PNG) */
  assinaturaBase64: string

  /** ID do usuário supervisor (referência ao sistema de autenticação) */
  supervisorId: number

  /** Campos de auditoria ALCOA+ */
  created_at: string
  created_by: number
}

