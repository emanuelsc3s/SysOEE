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
  | 'Esterilização'
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
 * Configuração visual das fases do Kanban
 * Centraliza cores, ícones e estilos para manter consistência
 */
export interface ConfigFase {
  /** Cor principal da fase (hex) - integrada com brand colors */
  cor: string
  /** Nome do ícone Lucide React */
  icone: string
  /** Classes Tailwind para badge */
  badgeClass: string
  /** Classes Tailwind para borda superior dos cards de OP */
  borderClass: string
  /** Classes Tailwind para texto */
  textClass: string
}

/**
 * Configuração de cores e estilos para cada fase do Kanban
 * Integra cores de marca da empresa (#242f65, #62a183, #ee8b60)
 */
export const FASES_CONFIG: Record<FaseProducao, ConfigFase> = {
  'Planejado': {
    cor: '#8B94A5',
    icone: 'ClipboardList',
    badgeClass: 'bg-slate-600 text-white',
    borderClass: 'border-t-slate-500',
    textClass: 'text-slate-700'
  },
  'Emissão de Dossiê': {
    cor: '#242f65', // brand.primary
    icone: 'FileText',
    badgeClass: 'bg-[#242f65] text-white',
    borderClass: 'border-t-[#242f65]',
    textClass: 'text-[#242f65]'
  },
  'Pesagem': {
    cor: '#8B5CF6',
    icone: 'Scale',
    badgeClass: 'bg-purple-600 text-white',
    borderClass: 'border-t-purple-600',
    textClass: 'text-purple-700'
  },
  'Preparação': {
    cor: '#ee8b60', // brand.tertiary
    icone: 'Beaker',
    badgeClass: 'bg-[#ee8b60] text-white',
    borderClass: 'border-t-[#ee8b60]',
    textClass: 'text-[#ee8b60]'
  },
  'Envase': {
    cor: '#0891B2',
    icone: 'Droplet',
    badgeClass: 'bg-cyan-600 text-white',
    borderClass: 'border-t-cyan-600',
    textClass: 'text-cyan-700'
  },
  'Esterilização': {
    cor: '#9F7AEA',
    icone: 'Flame',
    badgeClass: 'bg-violet-600 text-white',
    borderClass: 'border-t-violet-600',
    textClass: 'text-violet-700'
  },
  'Embalagem': {
    cor: '#62a183', // brand.secondary
    icone: 'Package',
    badgeClass: 'bg-[#62a183] text-white',
    borderClass: 'border-t-[#62a183]',
    textClass: 'text-[#62a183]'
  },
  'Concluído': {
    cor: '#16A34A',
    icone: 'CheckCircle2',
    badgeClass: 'bg-green-600 text-white',
    borderClass: 'border-t-green-600',
    textClass: 'text-green-700'
  }
}

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

/**
 * Interface para Apontamento Parcial de Preparação
 * Permite múltiplos apontamentos durante a execução da fase
 */
export interface ApontamentoPreparacao {
  /** ID único do apontamento */
  id: string

  /** Número da OP */
  op: string

  /** Quantidade preparada em mL */
  quantidadePreparadaMl: number

  /** Perdas em mL (opcional) */
  perdasPreparacaoMl?: number

  /** Data e hora do apontamento (ISO 8601) */
  dataHoraApontamento: string

  /** ID do usuário que fez o apontamento */
  usuarioId: number

  /** Nome do usuário que fez o apontamento */
  usuarioNome: string

  /** Tipo de apontamento */
  tipo: 'parcial' | 'final'

  /** Observações (opcional) */
  observacao?: string
}

