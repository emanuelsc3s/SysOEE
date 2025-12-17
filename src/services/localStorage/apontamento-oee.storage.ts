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
  // PASSO 1: BUSCAR DADOS DO APONTAMENTO DE REFERÊNCIA
  // =================================================================

  const apontamentoReferencia = buscarApontamentoProducaoPorId(apontamentoProducaoId)

  if (!apontamentoReferencia) {
    console.warn('6a8 Apontamento de produe7e3o ne3o encontrado:', apontamentoProducaoId)
    return {
      disponibilidade: 0,
      performance: 0,
      qualidade: 0,
      oee: 0,
      tempoOperacionalLiquido: 0,
      tempoValioso: 0
    }
  }

  // =================================================================
  // PASSO 1B: BUSCAR TODOS OS APONTAMENTOS DA MESMA LINHA E TURNO
  // OEE deve considerar TODA a produção do turno, não apenas um apontamento
  // =================================================================

  const todosApontamentos = buscarTodosApontamentosProducao()
  const apontamentosDoTurno = todosApontamentos.filter(a =>
    a.linha === apontamentoReferencia.linha &&
    a.turno === apontamentoReferencia.turno
  )

  // IDs de todos os apontamentos do turno para buscar perdas e retrabalhos
  const idsApontamentos = apontamentosDoTurno.map(a => a.id)

  // Somar quantidades produzidas de todos os apontamentos do turno
  const quantidadeProduzidaTotal = apontamentosDoTurno.reduce(
    (total, a) => total + a.quantidadeProduzida, 0
  )

  // Usar velocidade nominal do apontamento de referência
  const velocidadeNominal = apontamentoReferencia.velocidadeNominal

  // OEE é calculado por LINHA
  const paradas = buscarParadasPorLinha(linhaId)

  // Buscar TODAS as perdas e retrabalhos de TODOS os apontamentos do turno
  const todasPerdas = buscarTodosApontamentosPerdas()
  const perdas = todasPerdas.filter(p => idsApontamentos.includes(p.apontamentoProducaoId))

  const todosRetrabalhos = buscarTodosApontamentosRetrabalho()
  const retrabalhos = todosRetrabalhos.filter(r => idsApontamentos.includes(r.apontamentoProducaoId))

  console.log('4ca Calculando OEE:', {
    apontamentoReferencia: apontamentoProducaoId,
    linhaId,
    turno: apontamentoReferencia.turno,
    apontamentosDoTurno: apontamentosDoTurno.length,
    quantidadeProduzidaTotal,
    totalParadas: paradas.length,
    totalPerdas: perdas.length,
    totalRetrabalhos: retrabalhos.length
  })

  // =================================================================
  // PASSO 2: CLASSIFICAR PARADAS POR TIPO E DURAc7c3O
  // =================================================================

  // Paradas estrate9gicas (ne3o entram no ce1lculo - se3o exclueddas do tempo disponeível)
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

  console.log('50d Classificae7e3o de paradas:', {
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

  // Tempo Disponedvel Ajustado = Tempo Disponeível - Paradas Estrate9gicas
  const tempoDisponivelAjustado = tempoDisponivelHoras - tempoEstrategicoHoras

  // Tempo de Operae7e3o = Tempo Disponeível Ajustado - Paradas Grandes
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
  // Disponibilidade = (Tempo de Operae7e3o / Tempo Disponeível Ajustado) d7 100
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
  // Performance = (Tempo Operacional Ledquido / Tempo de Operae7e3o) d7 100
  // =================================================================

  // Método 1: Por quantidade produzida e velocidade nominal
  // Usa quantidadeProduzidaTotal (soma de todos apontamentos do turno) e velocidadeNominal
  const tempoOperacionalLiquidoPorProducao = velocidadeNominal > 0
    ? quantidadeProduzidaTotal / velocidadeNominal
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
    quantidadeProduzidaTotal,
    velocidadeNominal,
    tempoOperacionalLiquido,
    tempoOperacao,
    performance: `${arredondar(performance)}%`
  })

  // =================================================================
  // PASSO 6: CALCULAR QUALIDADE
  // Qualidade = Qualidade_Unidades d7 Qualidade_Retrabalho
  // =================================================================

  // 6a. Qualidade por Unidades (Refugo e Desvios)
  // Usa quantidadeProduzidaTotal (soma de todos apontamentos do turno)
  const totalPerdas = perdas.reduce((sum, p) => sum + p.unidadesRejeitadas, 0)
  const unidadesBoas = quantidadeProduzidaTotal - totalPerdas

  const qualidadeUnidades = quantidadeProduzidaTotal > 0
    ? (unidadesBoas / quantidadeProduzidaTotal) * 100
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
  // OEE = Disponibilidade d7 Performance d7 Qualidade
  // =================================================================

  const oee = (disponibilidade / 100) * (performance / 100) * (qualidade / 100) * 100

  // Tempo Valioso = (Qualidade / 100) d7 Tempo Operacional Ledquido
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
 * Soma durae7f5es de paradas em minutos
 */
function somarDuracoesMinutos(paradas: ParadaLocalStorage[]): number {
  return paradas.reduce((sum, p) => sum + (p.duracao_minutos || 0), 0)
}

/**
 * Arredonda nfamero para 2 casas decimais
 */
function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100
}

/**
 * Identifica tipo de parada baseado em campos da parada
 * Versão corrigida para reconhecer CIP/SIP e outras paradas planejadas
 */
function identificarTipoParada(parada: ParadaLocalStorage): TipoParada {
  // Identifica o tipo de parada para cálculo de OEE
  // IMPORTANTE: Paradas Estratégicas NÃO entram no tempo disponível
  // Paradas Planejadas e Não Planejadas >= 10min afetam DISPONIBILIDADE
  // Paradas < 10min afetam PERFORMANCE (pequenas paradas)

  const obs = parada.observacao?.toLowerCase() || ''
  const codigoParada = parada.codigo_parada_id?.toLowerCase() || ''

  // PASSO 1: Verificar PARADAS ESTRATÉGICAS
  // Exemplos: Feriado, Inventário, Sem Programação
  const padroesEstrategicos = [
    'feriado', 'inventário', 'inventario',
    'atividade programada', 'parada estratégica', 'parada estrategica',
    'sem programação', 'sem programacao', 'sem demanda', 'ociosidade planejada'
  ]

  for (const padrao of padroesEstrategicos) {
    if (codigoParada.includes(padrao) || obs.includes(padrao)) {
      return 'ESTRATEGICA'
    }
  }

  // PASSO 2: Verificar PARADAS PLANEJADAS
  // Exemplos: CIP/SIP, Manutenção Preventiva, Setup, Troca de Formato
  const padroesPlaneados = [
    // Limpeza e Sanitização (CIP/SIP é PLANEJADA, afeta disponibilidade)
    'cip', 'sip', 'cip/sip',
    // Manutenção
    'manutenção preventiva', 'manutencao preventiva',
    'manutenção planejada', 'manutencao planejada',
    // Setup e Processos
    'setup', 'troca de formato', 'troca de produto',
    'troca de lote', 'troca de sku',
    'início de produção', 'inicio de producao',
    'fim de produção', 'fim de producao',
    // Validação
    'validação', 'validacao', 'qualificação', 'qualificacao',
    'teste de filtro',
    // Classe de parada
    'paradas planejadas', 'planejada'
  ]

  for (const padrao of padroesPlaneados) {
    if (codigoParada.includes(padrao) || obs.includes(padrao)) {
      return 'PLANEJADA'
    }
  }

  // PASSO 3: Verificar PARADAS NÃO PLANEJADAS
  // Exemplos: Quebra, Falha, Falta de Insumo
  const padroesNaoPlaneados = [
    'não planejada', 'nao planejada',
    'quebra', 'falha',
    'falta de', 'falta insumo',
    'emergência', 'emergencia',
    'corretiva'
  ]

  for (const padrao of padroesNaoPlaneados) {
    if (codigoParada.includes(padrao) || obs.includes(padrao)) {
      return 'NAO_PLANEJADA'
    }
  }

  // PASSO 4: Fallback - Assume NAO_PLANEJADA para impactar disponibilidade
  console.warn('⚠️ Tipo de parada não identificado, assumindo NAO_PLANEJADA:', {
    codigoParada: parada.codigo_parada_id,
    observacao: parada.observacao
  })

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
      sku: apontamentoExcluido.sku,
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

