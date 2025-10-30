/**
 * Tipos de dados para o módulo de Equipamentos
 * Define as estruturas de dados para visualização de equipamentos e status operacionais
 */

import { Setor, Turno } from './operacao'

/**
 * Status operacional do equipamento
 */
export type StatusEquipamento =
  | 'Disponível'
  | 'Não Disponível'
  | 'Paradas'
  | 'Em Produção'

/**
 * Configuração visual dos status de equipamento
 */
export interface ConfigStatus {
  /** Cor principal do status (hex) */
  cor: string
  /** Nome do ícone Lucide React */
  icone: string
  /** Classes Tailwind para badge */
  badgeClass: string
  /** Classes Tailwind para borda esquerda */
  borderClass: string
  /** Classes Tailwind para texto */
  textClass: string
}

/**
 * Configuração de cores e estilos para cada status de equipamento
 */
export const STATUS_CONFIG: Record<StatusEquipamento, ConfigStatus> = {
  'Disponível': {
    cor: '#0891B2',
    icone: 'CheckCircle',
    badgeClass: 'bg-blue-600 text-white',
    borderClass: 'border-l-blue-600',
    textClass: 'text-blue-700'
  },
  'Em Produção': {
    cor: '#16A34A',
    icone: 'Play',
    badgeClass: 'bg-green-600 text-white',
    borderClass: 'border-l-green-600',
    textClass: 'text-green-700'
  },
  'Paradas': {
    cor: '#F59E0B',
    icone: 'Pause',
    badgeClass: 'bg-orange-600 text-white',
    borderClass: 'border-l-orange-600',
    textClass: 'text-orange-700'
  },
  'Não Disponível': {
    cor: '#DC2626',
    icone: 'XCircle',
    badgeClass: 'bg-red-600 text-white',
    borderClass: 'border-l-red-600',
    textClass: 'text-red-700'
  }
}

/**
 * Interface para Equipamento/Linha de Produção
 */
export interface Equipamento {
  /** ID único do equipamento */
  id: string

  /** Nome/identificação da linha de produção */
  nome: string

  /** Setor produtivo */
  setor: Setor

  /** Status operacional atual */
  status: StatusEquipamento

  /** Número da OP em execução (se houver) */
  op?: string

  /** Produto sendo produzido (se houver) */
  produto?: string

  /** Lote em produção (se houver) */
  lote?: string

  /** Turno atual */
  turno?: Turno

  /** Tempo na etapa atual (em minutos) */
  tempoNaEtapa: number

  /** Progresso da produção (0-100%) */
  progresso?: number

  /** Quantidade produzida */
  quantidadeProduzida?: number

  /** Quantidade teórica */
  quantidadeTeorica?: number

  /** Motivo da parada (se status = 'Paradas') */
  motivoParada?: string

  /** Motivo da indisponibilidade (se status = 'Não Disponível') */
  motivoIndisponibilidade?: string

  /** Data/hora de início da operação atual */
  dataHoraInicio?: string

  /** Operador responsável */
  operador?: string
}

