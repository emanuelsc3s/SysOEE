/**
 * Tipos específicos para o Dashboard OEE
 */

/**
 * Dados de um card OEE individual (por linha)
 */
export interface OEECardData {
  /** Título/nome da linha */
  title: string
  /** Valor do OEE (0-100) */
  oeeValue: number
  /** Disponibilidade (0-100) */
  disponibilidade: number
  /** Performance (0-100) */
  performance: number
  /** Qualidade (0-100) */
  qualidade: number
  /** Total de unidades produzidas */
  unidadesProduzidas: number
  /** Total de unidades perdidas/rejeitadas */
  unidadesPerdas: number
  /** Total de unidades aprovadas (boas) */
  unidadesBoas: number
}

/**
 * Props do componente CircularGaugeOEE
 */
export interface CircularGaugeOEEProps {
  /** Valor do OEE (0-100) */
  value: number
  /** Tamanho do gauge em pixels */
  size?: number
  /** Classes CSS adicionais */
  className?: string
}

/**
 * Props do componente MetricBarOEE
 */
export interface MetricBarOEEProps {
  /** Label da métrica */
  label: string
  /** Valor percentual (0-100) */
  value: number
  /** Variante de cor */
  variant: 'disponibilidade' | 'performance' | 'qualidade'
  /** Classes CSS adicionais */
  className?: string
}

/**
 * Props do componente OEECard
 */
export interface OEECardProps extends OEECardData {
  /** Classes CSS adicionais */
  className?: string
}

/**
 * Tipo de acento para SummaryCard
 */
export type SummaryCardAccent = 'success' | 'warning' | 'purple' | 'default'

/**
 * Props do componente SummaryCard
 */
export interface SummaryCardProps {
  /** Label do card */
  label: string
  /** Valor principal */
  value: string
  /** Unidade de medida */
  unit: string
  /** Cor de destaque */
  accentColor?: SummaryCardAccent
  /** Classes CSS adicionais */
  className?: string
}

/**
 * Totais consolidados do dashboard
 */
export interface DashboardTotals {
  /** Total de unidades produzidas */
  totalProduzido: number
  /** Total de unidades aprovadas */
  totalAprovadas: number
  /** Total de unidades perdidas */
  totalPerdas: number
  /** OEE médio de todas as linhas */
  oeeMedia: number
}

/**
 * Dados retornados pelo hook useDashboardOEE
 */
export interface DashboardOEEData {
  /** Lista de cards de linhas */
  cards: OEECardData[]
  /** Totais consolidados */
  totals: DashboardTotals
  /** Indica se está carregando */
  isLoading: boolean
  /** Erro, se houver */
  error: Error | null
}
