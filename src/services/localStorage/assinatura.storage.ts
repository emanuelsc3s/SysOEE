/**
 * Serviço de localStorage para Assinaturas de Supervisão
 * 
 * Gerencia o armazenamento local de assinaturas eletrônicas
 * seguindo princípios ALCOA+ (Atribuível, Contemporâneo, Durável)
 * 
 * NOTA: Este é um armazenamento temporário para validação.
 * Em produção, as assinaturas devem ser salvas no Supabase.
 */

import { AssinaturaSupervisao } from '@/types/operacao'

const STORAGE_KEY = 'sicfar_assinaturas_supervisao'

/**
 * Salva uma assinatura no localStorage
 * @param assinatura - Dados da assinatura a ser salva
 */
export function salvarAssinatura(assinatura: AssinaturaSupervisao): void {
  try {
    const assinaturas = buscarTodasAssinaturas()
    
    // Adiciona a nova assinatura
    assinaturas.push(assinatura)
    
    // Salva no localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assinaturas))
    
    console.log('✅ Assinatura salva no localStorage:', assinatura.id)
  } catch (error) {
    console.error('❌ Erro ao salvar assinatura no localStorage:', error)
    throw new Error('Falha ao salvar assinatura')
  }
}

/**
 * Busca todas as assinaturas armazenadas
 * @returns Array de assinaturas
 */
export function buscarTodasAssinaturas(): AssinaturaSupervisao[] {
  try {
    const dados = localStorage.getItem(STORAGE_KEY)
    
    if (!dados) {
      return []
    }
    
    return JSON.parse(dados) as AssinaturaSupervisao[]
  } catch (error) {
    console.error('❌ Erro ao buscar assinaturas do localStorage:', error)
    return []
  }
}

/**
 * Busca assinaturas de uma OP específica
 * @param numeroOP - Número da OP
 * @returns Array de assinaturas da OP
 */
export function buscarAssinaturasPorOP(numeroOP: string): AssinaturaSupervisao[] {
  try {
    const todasAssinaturas = buscarTodasAssinaturas()
    return todasAssinaturas.filter(assinatura => assinatura.op === numeroOP)
  } catch (error) {
    console.error('❌ Erro ao buscar assinaturas por OP:', error)
    return []
  }
}

/**
 * Busca a última assinatura de uma OP
 * @param numeroOP - Número da OP
 * @returns Última assinatura ou null se não houver
 */
export function buscarUltimaAssinaturaPorOP(numeroOP: string): AssinaturaSupervisao | null {
  try {
    const assinaturas = buscarAssinaturasPorOP(numeroOP)
    
    if (assinaturas.length === 0) {
      return null
    }
    
    // Ordena por data de criação (mais recente primeiro)
    assinaturas.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    
    return assinaturas[0]
  } catch (error) {
    console.error('❌ Erro ao buscar última assinatura:', error)
    return null
  }
}

/**
 * Verifica se uma OP já possui assinatura
 * @param numeroOP - Número da OP
 * @returns true se a OP já foi assinada
 */
export function opJaAssinada(numeroOP: string): boolean {
  try {
    const assinaturas = buscarAssinaturasPorOP(numeroOP)
    return assinaturas.length > 0
  } catch (error) {
    console.error('❌ Erro ao verificar se OP foi assinada:', error)
    return false
  }
}

/**
 * Busca assinaturas por supervisor
 * @param supervisorId - ID do supervisor
 * @returns Array de assinaturas do supervisor
 */
export function buscarAssinaturasPorSupervisor(supervisorId: number): AssinaturaSupervisao[] {
  try {
    const todasAssinaturas = buscarTodasAssinaturas()
    return todasAssinaturas.filter(assinatura => assinatura.supervisorId === supervisorId)
  } catch (error) {
    console.error('❌ Erro ao buscar assinaturas por supervisor:', error)
    return []
  }
}

/**
 * Busca assinaturas em um período específico
 * @param dataInicio - Data de início (ISO 8601)
 * @param dataFim - Data de fim (ISO 8601)
 * @returns Array de assinaturas no período
 */
export function buscarAssinaturasPorPeriodo(
  dataInicio: string,
  dataFim: string
): AssinaturaSupervisao[] {
  try {
    const todasAssinaturas = buscarTodasAssinaturas()
    
    const inicio = new Date(dataInicio).getTime()
    const fim = new Date(dataFim).getTime()
    
    return todasAssinaturas.filter(assinatura => {
      const dataAssinatura = new Date(assinatura.dataHoraAssinatura).getTime()
      return dataAssinatura >= inicio && dataAssinatura <= fim
    })
  } catch (error) {
    console.error('❌ Erro ao buscar assinaturas por período:', error)
    return []
  }
}

/**
 * Remove uma assinatura específica
 * ATENÇÃO: Esta operação viola princípios ALCOA+ (Durável)
 * Deve ser usada apenas para testes/desenvolvimento
 * @param assinaturaId - ID da assinatura a ser removida
 */
export function removerAssinatura(assinaturaId: string): void {
  try {
    const assinaturas = buscarTodasAssinaturas()
    const assinaturasAtualizadas = assinaturas.filter(a => a.id !== assinaturaId)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assinaturasAtualizadas))
    
    console.log('⚠️ Assinatura removida (apenas para desenvolvimento):', assinaturaId)
  } catch (error) {
    console.error('❌ Erro ao remover assinatura:', error)
    throw new Error('Falha ao remover assinatura')
  }
}

/**
 * Limpa todas as assinaturas do localStorage
 * ATENÇÃO: Esta operação viola princípios ALCOA+ (Durável)
 * Deve ser usada apenas para testes/desenvolvimento
 */
export function limparTodasAssinaturas(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log('⚠️ Todas as assinaturas foram removidas (apenas para desenvolvimento)')
  } catch (error) {
    console.error('❌ Erro ao limpar assinaturas:', error)
    throw new Error('Falha ao limpar assinaturas')
  }
}

/**
 * Exporta todas as assinaturas para JSON
 * Útil para backup ou migração para Supabase
 * @returns String JSON com todas as assinaturas
 */
export function exportarAssinaturasJSON(): string {
  try {
    const assinaturas = buscarTodasAssinaturas()
    return JSON.stringify(assinaturas, null, 2)
  } catch (error) {
    console.error('❌ Erro ao exportar assinaturas:', error)
    throw new Error('Falha ao exportar assinaturas')
  }
}

/**
 * Importa assinaturas de um JSON
 * ATENÇÃO: Sobrescreve todas as assinaturas existentes
 * @param jsonData - String JSON com as assinaturas
 */
export function importarAssinaturasJSON(jsonData: string): void {
  try {
    const assinaturas = JSON.parse(jsonData) as AssinaturaSupervisao[]
    
    // Valida se é um array
    if (!Array.isArray(assinaturas)) {
      throw new Error('JSON inválido: esperado um array de assinaturas')
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assinaturas))
    console.log(`✅ ${assinaturas.length} assinaturas importadas com sucesso`)
  } catch (error) {
    console.error('❌ Erro ao importar assinaturas:', error)
    throw new Error('Falha ao importar assinaturas')
  }
}

/**
 * Obtém estatísticas das assinaturas
 * @returns Objeto com estatísticas
 */
export function obterEstatisticasAssinaturas() {
  try {
    const assinaturas = buscarTodasAssinaturas()
    
    // Conta assinaturas por supervisor
    const porSupervisor = assinaturas.reduce((acc, assinatura) => {
      const nome = assinatura.nomeSupervisor
      acc[nome] = (acc[nome] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Conta assinaturas por dia
    const porDia = assinaturas.reduce((acc, assinatura) => {
      const data = new Date(assinatura.dataHoraAssinatura).toLocaleDateString('pt-BR')
      acc[data] = (acc[data] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      total: assinaturas.length,
      porSupervisor,
      porDia,
      opsAssinadas: new Set(assinaturas.map(a => a.op)).size,
    }
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error)
    return {
      total: 0,
      porSupervisor: {},
      porDia: {},
      opsAssinadas: 0,
    }
  }
}

