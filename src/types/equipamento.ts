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

