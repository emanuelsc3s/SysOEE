/**
 * Funções para buscar Ordens de Produção do TOTVS
 * Dados importados do arquivo JSON real
 */

import ordensProducaoData from '../../data/ordem-producao.json'
import { OrdemProducaoTOTVS } from '@/types/ordem-producao-totvs'

/**
 * Array de Ordens de Produção importado do JSON
 */
const ordensProducao: OrdemProducaoTOTVS[] = ordensProducaoData as OrdemProducaoTOTVS[]

/**
 * Busca uma Ordem de Produção pelo número (C2_NUM)
 * @param numeroOP - Número da Ordem de Produção
 * @returns OrdemProducaoTOTVS encontrada ou undefined
 */
export function buscarOPTOTVSPorNumero(numeroOP: string | number): OrdemProducaoTOTVS | undefined {
  const numero = typeof numeroOP === 'string' ? parseInt(numeroOP, 10) : numeroOP
  
  if (isNaN(numero)) {
    return undefined
  }
  
  return ordensProducao.find(op => op.C2_NUM === numero)
}

/**
 * Busca todas as Ordens de Produção de um produto específico
 * @param codigoProduto - Código do produto (C2_PRODUTO)
 * @returns Array de OrdemProducaoTOTVS
 */
export function buscarOPsPorProduto(codigoProduto: string): OrdemProducaoTOTVS[] {
  return ordensProducao.filter(op => op.C2_PRODUTO === codigoProduto)
}

/**
 * Busca todas as Ordens de Produção de um lote específico
 * @param lote - Número do lote (C2_YLOTE)
 * @returns Array de OrdemProducaoTOTVS
 */
export function buscarOPsPorLote(lote: string): OrdemProducaoTOTVS[] {
  return ordensProducao.filter(op => op.C2_YLOTE === lote)
}

/**
 * Busca todas as Ordens de Produção de um dossiê específico
 * @param dossie - Número do dossiê (C2_YDOSSIE)
 * @returns Array de OrdemProducaoTOTVS
 */
export function buscarOPsPorDossie(dossie: string): OrdemProducaoTOTVS[] {
  return ordensProducao.filter(op => op.C2_YDOSSIE === dossie)
}

/**
 * Retorna todas as Ordens de Produção
 * @returns Array completo de OrdemProducaoTOTVS
 */
export function obterTodasOPs(): OrdemProducaoTOTVS[] {
  return ordensProducao
}

