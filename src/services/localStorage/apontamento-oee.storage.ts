/**
 * Serviço de armazenamento de apontamentos de OEE no localStorage
 * Usado para validação de UI/UX antes de integrar com Supabase
 */

import {
  ApontamentoProducao,
  ApontamentoQualidadePerdas,
  ApontamentoQualidadeRetrabalho,
  CriarApontamentoProducaoDTO,
  CalculoOEE
} from '@/types/apontamento-oee'

const STORAGE_KEY_PRODUCAO = 'sysoee_apontamentos_producao'
const STORAGE_KEY_PERDAS = 'sysoee_apontamentos_perdas'
const STORAGE_KEY_RETRABALHO = 'sysoee_apontamentos_retrabalho'

// ==================== APONTAMENTOS DE PRODUÇÃO ====================

/**
 * Busca todos os apontamentos de produção do localStorage
 */
export function buscarTodosApontamentosProducao(): ApontamentoProducao[] {
  try {
    const dados = localStorage.getItem(STORAGE_KEY_PRODUCAO)
    if (!dados) return []
    return JSON.parse(dados)
  } catch (error) {
    console.error('❌ Erro ao buscar apontamentos de produção:', error)
    return []
  }
}

/**
 * Busca apontamento de produção por ID
 */
export function buscarApontamentoProducaoPorId(id: string): ApontamentoProducao | null {
  const apontamentos = buscarTodosApontamentosProducao()
  return apontamentos.find(a => a.id === id) || null
}

/**
 * Busca apontamentos de produção por lote
 */
export function buscarApontamentosProducaoPorLote(lote: string): ApontamentoProducao[] {
  const apontamentos = buscarTodosApontamentosProducao()
  return apontamentos.filter(a => a.lote === lote)
}

/**
 * Salva um novo apontamento de produção
 */
export function salvarApontamentoProducao(dto: CriarApontamentoProducaoDTO): ApontamentoProducao {
  try {
    const apontamento: ApontamentoProducao = {
      id: crypto.randomUUID(),
      ...dto,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const apontamentos = buscarTodosApontamentosProducao()
    apontamentos.push(apontamento)
    localStorage.setItem(STORAGE_KEY_PRODUCAO, JSON.stringify(apontamentos))
    
    console.log('✅ Apontamento de produção salvo:', apontamento)
    return apontamento
  } catch (error) {
    console.error('❌ Erro ao salvar apontamento de produção:', error)
    throw error
  }
}

/**
 * Atualiza um apontamento de produção existente
 */
export function atualizarApontamentoProducao(
  id: string,
  dadosAtualizacao: Partial<ApontamentoProducao>
): ApontamentoProducao | null {
  try {
    const apontamentos = buscarTodosApontamentosProducao()
    const index = apontamentos.findIndex(a => a.id === id)
    
    if (index === -1) {
      console.error('❌ Apontamento não encontrado:', id)
      return null
    }

    apontamentos[index] = {
      ...apontamentos[index],
      ...dadosAtualizacao,
      updated_at: new Date().toISOString()
    }

    localStorage.setItem(STORAGE_KEY_PRODUCAO, JSON.stringify(apontamentos))
    console.log('✅ Apontamento de produção atualizado:', apontamentos[index])
    return apontamentos[index]
  } catch (error) {
    console.error('❌ Erro ao atualizar apontamento de produção:', error)
    throw error
  }
}

// ==================== APONTAMENTOS DE PERDAS ====================

/**
 * Busca todos os apontamentos de perdas
 */
export function buscarTodosApontamentosPerdas(): ApontamentoQualidadePerdas[] {
  try {
    const dados = localStorage.getItem(STORAGE_KEY_PERDAS)
    if (!dados) return []
    return JSON.parse(dados)
  } catch (error) {
    console.error('❌ Erro ao buscar apontamentos de perdas:', error)
    return []
  }
}

/**
 * Busca apontamentos de perdas por ID de apontamento de produção
 */
export function buscarApontamentosPerdasPorProducao(apontamentoProducaoId: string): ApontamentoQualidadePerdas[] {
  const apontamentos = buscarTodosApontamentosPerdas()
  return apontamentos.filter(a => a.apontamentoProducaoId === apontamentoProducaoId)
}

/**
 * Salva um novo apontamento de perdas
 */
export function salvarApontamentoPerdas(
  apontamentoProducaoId: string,
  unidadesRejeitadas: number,
  motivoRejeicao: string,
  observacao: string | null,
  criadoPor: number,
  criadoPorNome: string
): ApontamentoQualidadePerdas {
  try {
    const apontamento: ApontamentoQualidadePerdas = {
      id: crypto.randomUUID(),
      apontamentoProducaoId,
      unidadesRejeitadas,
      motivoRejeicao,
      observacao,
      criadoPor,
      criadoPorNome,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const apontamentos = buscarTodosApontamentosPerdas()
    apontamentos.push(apontamento)
    localStorage.setItem(STORAGE_KEY_PERDAS, JSON.stringify(apontamentos))
    
    console.log('✅ Apontamento de perdas salvo:', apontamento)
    return apontamento
  } catch (error) {
    console.error('❌ Erro ao salvar apontamento de perdas:', error)
    throw error
  }
}

// ==================== APONTAMENTOS DE RETRABALHO ====================

/**
 * Busca todos os apontamentos de retrabalho
 */
export function buscarTodosApontamentosRetrabalho(): ApontamentoQualidadeRetrabalho[] {
  try {
    const dados = localStorage.getItem(STORAGE_KEY_RETRABALHO)
    if (!dados) return []
    return JSON.parse(dados)
  } catch (error) {
    console.error('❌ Erro ao buscar apontamentos de retrabalho:', error)
    return []
  }
}

/**
 * Busca apontamentos de retrabalho por ID de apontamento de produção
 */
export function buscarApontamentosRetrabalhoPorProducao(apontamentoProducaoId: string): ApontamentoQualidadeRetrabalho[] {
  const apontamentos = buscarTodosApontamentosRetrabalho()
  return apontamentos.filter(a => a.apontamentoProducaoId === apontamentoProducaoId)
}

/**
 * Salva um novo apontamento de retrabalho
 */
export function salvarApontamentoRetrabalho(
  apontamentoProducaoId: string,
  unidadesRetrabalho: number,
  tempoRetrabalho: number,
  motivoRetrabalho: string,
  observacao: string | null,
  criadoPor: number,
  criadoPorNome: string
): ApontamentoQualidadeRetrabalho {
  try {
    const apontamento: ApontamentoQualidadeRetrabalho = {
      id: crypto.randomUUID(),
      apontamentoProducaoId,
      unidadesRetrabalho,
      tempoRetrabalho,
      motivoRetrabalho,
      observacao,
      criadoPor,
      criadoPorNome,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const apontamentos = buscarTodosApontamentosRetrabalho()
    apontamentos.push(apontamento)
    localStorage.setItem(STORAGE_KEY_RETRABALHO, JSON.stringify(apontamentos))

    console.log('✅ Apontamento de retrabalho salvo:', apontamento)
    return apontamento
  } catch (error) {
    console.error('❌ Erro ao salvar apontamento de retrabalho:', error)
    throw error
  }
}

// ==================== CÁLCULO DE OEE ====================

/**
 * Calcula OEE em tempo real baseado nos apontamentos
 */
export function calcularOEE(apontamentoProducaoId: string): CalculoOEE {
  const apontamento = buscarApontamentoProducaoPorId(apontamentoProducaoId)

  if (!apontamento) {
    return {
      disponibilidade: 0,
      performance: 0,
      qualidade: 0,
      oee: 0,
      tempoOperacionalLiquido: 0,
      tempoValioso: 0
    }
  }

  const perdas = buscarApontamentosPerdasPorProducao(apontamentoProducaoId)
  const retrabalhos = buscarApontamentosRetrabalhoPorProducao(apontamentoProducaoId)

  // 1. Disponibilidade = (Tempo de Operação / Tempo Disponível) × 100
  const disponibilidade = apontamento.tempoDisponivel > 0
    ? (apontamento.tempoOperacao / apontamento.tempoDisponivel) * 100
    : 0

  // 2. Performance = (Tempo Operacional Líquido / Tempo de Operação) × 100
  // Tempo Operacional Líquido = Unidades Produzidas / Velocidade Nominal (Und/h)
  const tempoOperacionalLiquido = apontamento.velocidadeNominal > 0
    ? apontamento.quantidadeProduzida / apontamento.velocidadeNominal
    : 0

  const performance = apontamento.tempoOperacao > 0
    ? (tempoOperacionalLiquido / apontamento.tempoOperacao) * 100
    : 0

  // 3. Qualidade = Qualidade_Unidades × Qualidade_Retrabalho

  // 3a. Qualidade por Unidades (Refugo e Desvios)
  const totalPerdas = perdas.reduce((sum, p) => sum + p.unidadesRejeitadas, 0)
  const unidadesBoas = apontamento.quantidadeProduzida - totalPerdas
  const qualidadeUnidades = apontamento.quantidadeProduzida > 0
    ? (unidadesBoas / apontamento.quantidadeProduzida) * 100
    : 100

  // 3b. Qualidade por Retrabalho
  const totalTempoRetrabalho = retrabalhos.reduce((sum, r) => sum + r.tempoRetrabalho, 0)
  const qualidadeRetrabalho = apontamento.tempoOperacao > 0
    ? ((apontamento.tempoOperacao - totalTempoRetrabalho) / apontamento.tempoOperacao) * 100
    : 100

  // Qualidade Total
  const qualidade = (qualidadeUnidades / 100) * (qualidadeRetrabalho / 100) * 100

  // 4. OEE = Disponibilidade × Performance × Qualidade
  const oee = (disponibilidade / 100) * (performance / 100) * (qualidade / 100) * 100

  // Tempo Valioso = (Qualidade × Tempo Operacional Líquido) / 100
  const tempoValioso = (qualidade / 100) * tempoOperacionalLiquido

  return {
    disponibilidade: Math.round(disponibilidade * 100) / 100,
    performance: Math.round(performance * 100) / 100,
    qualidade: Math.round(qualidade * 100) / 100,
    oee: Math.round(oee * 100) / 100,
    tempoOperacionalLiquido: Math.round(tempoOperacionalLiquido * 100) / 100,
    tempoValioso: Math.round(tempoValioso * 100) / 100
  }
}

/**
 * Limpa todos os apontamentos do localStorage (usar com cuidado!)
 */
export function limparTodosApontamentos(): void {
  localStorage.removeItem(STORAGE_KEY_PRODUCAO)
  localStorage.removeItem(STORAGE_KEY_PERDAS)
  localStorage.removeItem(STORAGE_KEY_RETRABALHO)
  console.log('🗑️ Todos os apontamentos foram removidos do localStorage')
}

