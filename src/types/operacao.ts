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
 */
export type Turno = '1º Turno' | '2º Turno' | '3º Turno' | 'Administrativo'

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

  /** Quantidade já produzida */
  produzido: number


  /** Quantidade preparada na etapa de Preparação (em ML) */
  quantidadePreparadaMl?: number

  /** Perda/desperdício relacionada à etapa de Preparação (em ML) */
  perdasPreparacaoMl?: number

  /** Total de horas em operação (formato HH:MM) */
  horas: string

  /** Turno de produção */
  turno: Turno

  /** Número do dossiê */
  dossie?: string

  /** Registro ANVISA */
  anvisa?: string

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
  ANVISA: string
  GTIN: string
}

