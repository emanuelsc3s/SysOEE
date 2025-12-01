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
import { buscarParadasPorLinha, ParadaLocalStorage } from '@/services/localStorage/parada.storage'
import { TipoParada } from '@/types/parada'

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
 * Busca apontamentos de perdas por linha e SKU
 * Soma todas as perdas de todos os apontamentos de produção da mesma linha e SKU
 *
 * IMPORTANTE: O campo 'linha' no ApontamentoProducao armazena o NOME da linha (ex: "Linha A"),
 * enquanto linhaId é o ID da linha (ex: "spep-envase-a"). Precisamos buscar pelo nome.
 */
export function buscarApontamentosPerdasPorLinhaESku(linhaId: string, skuCodigo: string, linhaNome?: string): ApontamentoQualidadePerdas[] {
  // Busca todos os apontamentos de produção da linha e SKU
  // Compara tanto pelo ID quanto pelo nome da linha para garantir compatibilidade
  const apontamentosProducao = buscarTodosApontamentosProducao().filter(a => {
    const matchLinha = a.linha === linhaId || a.linha === linhaNome || (linhaNome && a.linha === linhaNome)
    const matchSku = a.sku === skuCodigo
    return matchLinha && matchSku
  })

  // Busca todas as perdas associadas a esses apontamentos
  const todasPerdas = buscarTodosApontamentosPerdas()
  const idsProducao = apontamentosProducao.map(a => a.id)

  return todasPerdas.filter(p => idsProducao.includes(p.apontamentoProducaoId))
}

/**
 * Busca apontamentos de retrabalho por linha e SKU
 * Soma todos os retrabalhos de todos os apontamentos de produção da mesma linha e SKU
 */
export function buscarApontamentosRetrabalhoPorLinhaESku(linhaId: string, skuCodigo: string, linhaNome?: string): ApontamentoQualidadeRetrabalho[] {
  // Busca todos os apontamentos de produção da linha e SKU
  // Compara tanto pelo ID quanto pelo nome da linha para garantir compatibilidade
  const apontamentosProducao = buscarTodosApontamentosProducao().filter(a => {
    const matchLinha = a.linha === linhaId || a.linha === linhaNome || (linhaNome && a.linha === linhaNome)
    const matchSku = a.sku === skuCodigo
    return matchLinha && matchSku
  })

  // Busca todos os retrabalhos associados a esses apontamentos
  const todosRetrabalhos = buscarTodosApontamentosRetrabalho()
  const idsProducao = apontamentosProducao.map(a => a.id)

  return todosRetrabalhos.filter(r => idsProducao.includes(r.apontamentoProducaoId))
}

/**
 * Calcula o total de perdas (perdas + retrabalhos) por linha e SKU
 */
export function calcularTotalPerdasPorLinhaESku(linhaId: string, skuCodigo: string, linhaNome?: string): number {
  const perdas = buscarApontamentosPerdasPorLinhaESku(linhaId, skuCodigo, linhaNome)
  const retrabalhos = buscarApontamentosRetrabalhoPorLinhaESku(linhaId, skuCodigo, linhaNome)

  const totalPerdas = perdas.reduce((total, p) => total + p.unidadesRejeitadas, 0)
  const totalRetrabalho = retrabalhos.reduce((total, r) => total + r.unidadesRetrabalho, 0)

  return totalPerdas + totalRetrabalho
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
 * Calcula OEE completo integrando paradas, perdas e retrabalhos
 * Baseado em docs/example/EXEMPLOS-CODIGO-OEE.md
 *
 * @param apontamentoProducaoId - ID do apontamento de produção
 * @param linhaId - ID da linha de produção (OEE é calculado por linha)
 * @param tempoDisponivelTurno - Tempo disponível do turno em horas (padrão: 12h)
 */
export function calcularOEECompleto(
  apontamentoProducaoId: string,
  linhaId: string,
  tempoDisponivelTurno: number = 12
): CalculoOEE {
  // =================================================================
  // PASSO 1: BUSCAR DADOS
  // =================================================================

  const apontamento = buscarApontamentoProducaoPorId(apontamentoProducaoId)

  if (!apontamento) {
    console.warn('6a8 Apontamento de produ e7 e3o n e3o encontrado:', apontamentoProducaoId)
    return {
      disponibilidade: 0,
      performance: 0,
      qualidade: 0,
      oee: 0,
      tempoOperacionalLiquido: 0,
      tempoValioso: 0
    }
  }

  // OEE é calculado por LINHA, independente de lote, data ou turno
  const paradas = buscarParadasPorLinha(linhaId)
  const perdas = buscarApontamentosPerdasPorProducao(apontamentoProducaoId)
  const retrabalhos = buscarApontamentosRetrabalhoPorProducao(apontamentoProducaoId)

  console.log('4ca Calculando OEE:', {
    apontamentoId: apontamentoProducaoId,
    linhaId,
    totalParadas: paradas.length,
    totalPerdas: perdas.length,
    totalRetrabalhos: retrabalhos.length
  })

  // =================================================================
  // PASSO 2: CLASSIFICAR PARADAS POR TIPO E DURA c7 c3O
  // =================================================================

  // Paradas estrat e9gicas (n e3o entram no c e1lculo - s e3o exclu eddas do tempo dispon eível)
  const paradasEstrategicas = paradas.filter(p =>
    identificarTipoParada(p) === 'ESTRATEGICA' && p.duracao_minutos !== null
  )

  // Paradas grandes (>= 10 min) - Afetam DISPONIBILIDADE
  const paradasGrandes = paradas.filter(p =>
    identificarTipoParada(p) !== 'ESTRATEGICA' &&
    p.duracao_minutos !== null &&
    p.duracao_minutos >= 10
  )

  // Pequenas paradas (< 10 min) - Afetam PERFORMANCE
  const pequenasParadas = paradas.filter(p =>
    p.duracao_minutos !== null &&
    p.duracao_minutos < 10
  )

  console.log('50d Classifica e7 e3o de paradas:', {
    estrategicas: paradasEstrategicas.length,
    grandes: paradasGrandes.length,
    pequenas: pequenasParadas.length
  })

  // =================================================================
  // PASSO 3: CALCULAR TEMPOS (em horas)
  // =================================================================

  const tempoDisponivelHoras = tempoDisponivelTurno
  const tempoEstrategicoHoras = somarDuracoesMinutos(paradasEstrategicas) / 60
  const tempoParadasGrandesHoras = somarDuracoesMinutos(paradasGrandes) / 60
  const tempoPequenasParadasHoras = somarDuracoesMinutos(pequenasParadas) / 60

  // Tempo Dispon edvel Ajustado = Tempo Dispon eível - Paradas Estrat e9gicas
  const tempoDisponivelAjustado = tempoDisponivelHoras - tempoEstrategicoHoras

  // Tempo de Opera e7 e3o = Tempo Dispon eível Ajustado - Paradas Grandes
  const tempoOperacao = tempoDisponivelAjustado - tempoParadasGrandesHoras

  console.log('3f1 Tempos calculados (horas):', {
    tempoDisponivel: tempoDisponivelHoras,
    tempoEstrategico: tempoEstrategicoHoras,
    tempoDisponivelAjustado,
    tempoParadasGrandes: tempoParadasGrandesHoras,
    tempoOperacao,
    tempoPequenasParadas: tempoPequenasParadasHoras
  })

  // =================================================================
  // PASSO 4: CALCULAR DISPONIBILIDADE
  // Disponibilidade = (Tempo de Opera e7 e3o / Tempo Dispon eível Ajustado)  d7 100
  // =================================================================

  const disponibilidade = tempoDisponivelAjustado > 0
    ? (tempoOperacao / tempoDisponivelAjustado) * 100
    : 0

  console.log('4c8 Disponibilidade:', {
    tempoOperacao,
    tempoDisponivelAjustado,
    disponibilidade: `${arredondar(disponibilidade)}%`
  })

  // =================================================================
  // PASSO 5: CALCULAR PERFORMANCE
  // Performance = (Tempo Operacional L edquido / Tempo de Opera e7 e3o)  d7 100
  // =================================================================

  // Método 1: Por quantidade produzida e velocidade nominal
  const tempoOperacionalLiquidoPorProducao = apontamento.velocidadeNominal > 0
    ? apontamento.quantidadeProduzida / apontamento.velocidadeNominal
    : 0

  // Método 2: Por tempo de operação menos pequenas paradas
  const tempoOperacionalLiquidoPorParadas = tempoOperacao - tempoPequenasParadasHoras

  console.log('Comparação métodos de performance:', {
    tempoOperacionalLiquidoPorProducao,
    tempoOperacionalLiquidoPorParadas
  })

  // Usar o método por produção (mais preciso)
  const tempoOperacionalLiquido = tempoOperacionalLiquidoPorProducao

  const performanceBruta = tempoOperacao > 0
    ? (tempoOperacionalLiquido / tempoOperacao) * 100
    : 0

  // Garante que a performance não ultrapasse 100%
  const performance = Math.min(performanceBruta, 100)

  console.log('680 Performance:', {
    quantidadeProduzida: apontamento.quantidadeProduzida,
    velocidadeNominal: apontamento.velocidadeNominal,
    tempoOperacionalLiquido,
    tempoOperacao,
    performance: `${arredondar(performance)}%`
  })

  // =================================================================
  // PASSO 6: CALCULAR QUALIDADE
  // Qualidade = Qualidade_Unidades  d7 Qualidade_Retrabalho
  // =================================================================

  // 6a. Qualidade por Unidades (Refugo e Desvios)
  const totalPerdas = perdas.reduce((sum, p) => sum + p.unidadesRejeitadas, 0)
  const unidadesBoas = apontamento.quantidadeProduzida - totalPerdas

  const qualidadeUnidades = apontamento.quantidadeProduzida > 0
    ? (unidadesBoas / apontamento.quantidadeProduzida) * 100
    : 100

  // 6b. Qualidade por Retrabalho
  const totalTempoRetrabalho = retrabalhos.reduce((sum, r) => sum + r.tempoRetrabalho, 0)

  const qualidadeRetrabalho = tempoOperacao > 0
    ? ((tempoOperacao - totalTempoRetrabalho) / tempoOperacao) * 100
    : 100

  // 6c. Qualidade Total
  const qualidade = (qualidadeUnidades / 100) * (qualidadeRetrabalho / 100) * 100

  console.log('728 Qualidade:', {
    totalPerdas,
    unidadesBoas,
    qualidadeUnidades: `${arredondar(qualidadeUnidades)}%`,
    totalTempoRetrabalho,
    qualidadeRetrabalho: `${arredondar(qualidadeRetrabalho)}%`,
    qualidadeTotal: `${arredondar(qualidade)}%`
  })

  // =================================================================
  // PASSO 7: CALCULAR OEE
  // OEE = Disponibilidade  d7 Performance  d7 Qualidade
  // =================================================================

  const oee = (disponibilidade / 100) * (performance / 100) * (qualidade / 100) * 100

  // Tempo Valioso = (Qualidade / 100)  d7 Tempo Operacional L edquido
  const tempoValioso = (qualidade / 100) * tempoOperacionalLiquido

  console.log('3af OEE Final:', {
    disponibilidade: `${arredondar(disponibilidade)}%`,
    performance: `${arredondar(performance)}%`,
    qualidade: `${arredondar(qualidade)}%`,
    oee: `${arredondar(oee)}%`,
    tempoValioso: `${arredondar(tempoValioso)}h`
  })

  return {
    disponibilidade: arredondar(disponibilidade),
    performance: arredondar(performance),
    qualidade: arredondar(qualidade),
    oee: arredondar(oee),
    tempoOperacionalLiquido: arredondar(tempoOperacionalLiquido),
    tempoValioso: arredondar(tempoValioso)
  }
}

/**
 * Soma dura e7 f5es de paradas em minutos
 */
function somarDuracoesMinutos(paradas: ParadaLocalStorage[]): number {
  return paradas.reduce((sum, p) => sum + (p.duracao_minutos || 0), 0)
}

/**
 * Arredonda n famero para 2 casas decimais
 */
function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100
}

/**
 * Identifica tipo de parada baseado em campos da parada
 * TODO: Substituir por busca no c f3digo de parada real quando integrado com banco
 */
function identificarTipoParada(parada: ParadaLocalStorage): TipoParada {
  // Por enquanto, inferir do campo observacao ou usar padr e3o
  // IMPORTANTE: Esta fun e7 e3o deve ser substitu edda quando integrar com c f3digos de parada reais

  const obs = parada.observacao?.toLowerCase() || ''

  if (obs.includes('estrateg') || obs.includes('setup') || obs.includes('troca')) {
    return 'ESTRATEGICA'
  }

  if (obs.includes('planej') || obs.includes('manuten') || obs.includes('limpeza')) {
    return 'PLANEJADA'
  }

  return 'NAO_PLANEJADA'
}

/**
 * Exclui um apontamento de produção específico do localStorage
 * Também remove os apontamentos de perdas e retrabalho relacionados
 *
 * @param id - ID do apontamento de produção a ser excluído
 * @returns true se o apontamento foi excluído com sucesso, false caso contrário
 */
export function excluirApontamentoProducao(id: string): boolean {
  try {
    // Buscar todos os apontamentos
    const apontamentos = buscarTodosApontamentosProducao()

    // Verificar se o apontamento existe
    const index = apontamentos.findIndex(a => a.id === id)
    if (index === -1) {
      console.error('❌ Apontamento não encontrado para exclusão:', id)
      return false
    }

    // Remover o apontamento da lista
    const apontamentoExcluido = apontamentos[index]
    apontamentos.splice(index, 1)

    // Salvar a lista atualizada
    localStorage.setItem(STORAGE_KEY_PRODUCAO, JSON.stringify(apontamentos))

    // Remover apontamentos de perdas relacionados
    const perdas = buscarTodosApontamentosPerdas()
    const perdasAtualizadas = perdas.filter(p => p.apontamentoProducaoId !== id)
    localStorage.setItem(STORAGE_KEY_PERDAS, JSON.stringify(perdasAtualizadas))

    // Remover apontamentos de retrabalho relacionados
    const retrabalhos = buscarTodosApontamentosRetrabalho()
    const retrabalhosAtualizados = retrabalhos.filter(r => r.apontamentoProducaoId !== id)
    localStorage.setItem(STORAGE_KEY_RETRABALHO, JSON.stringify(retrabalhosAtualizados))

    console.log('✅ Apontamento de produção excluído com sucesso:', {
      id,
      lote: apontamentoExcluido.lote,
      quantidadeProduzida: apontamentoExcluido.quantidadeProduzida
    })

    return true
  } catch (error) {
    console.error('❌ Erro ao excluir apontamento de produção:', error)
    return false
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

