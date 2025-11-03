/**
 * Utilitários para manipulação de dados de Preparação
 */

/**
 * Interface para os totais acumulados de preparação
 */
export interface TotaisPreparacao {
  totalPreparadoMl: number
  totalPerdasMl: number
  ultimaAtualizacao: string
}

/**
 * Recupera os totais acumulados de preparação do localStorage
 * @param op - Número da Ordem de Produção
 * @returns Totais acumulados ou null se não houver dados
 */
export function obterTotaisPreparacao(op: string): TotaisPreparacao | null {
  try {
    const chaveTotais = `totais_preparacao_${op}`
    const totaisStr = localStorage.getItem(chaveTotais)
    
    if (totaisStr) {
      return JSON.parse(totaisStr) as TotaisPreparacao
    }
    
    return null
  } catch (error) {
    console.error('Erro ao recuperar totais de preparação:', error)
    return null
  }
}

/**
 * Converte mL para Litros com formatação
 * @param ml - Valor em mililitros
 * @returns String formatada em litros (ex: "95,10")
 */
export function converterMlParaLitros(ml: number): string {
  return (ml / 1000).toLocaleString('pt-BR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })
}

/**
 * Formata valor em mL com separador de milhares
 * @param ml - Valor em mililitros
 * @returns String formatada (ex: "95.000")
 */
export function formatarMl(ml: number): string {
  return ml.toLocaleString('pt-BR', { 
    maximumFractionDigits: 0 
  })
}

