import type { LinhaAgrupada, ResumoOeeTurnoLinhaNormalizada, ResumoTotais } from '../types'
import { formatarDecimal, formatarMinutos, formatarQuantidade } from './formatters'

type LinhaDestaque = {
  nome: string
  valor: number
  percentual: number
}

export type InsightContext = {
  totalProducao: number
  totalPerdas: number
  taxaPerdas: number
  totalEnvase: number
  totalEmbalagem: number
  gapEnvaseEmbalagem: number
  gapAbs: number
  etapaMaior: 'envase' | 'embalagem'
  totalParadas: number
  totalParadasBase: number
  totalParadasGrandes: number
  totalParadasPequenas: number
  totalParadasEstrategicas: number
  proporcaoParadasGrandes: number
  proporcaoParadasPequenas: number
  proporcaoParadasEstrategicas: number
  skuProduzidos: number
  turnosDistintos: number
  linhasAtivas: number
  linhasNaoIniciadas: number
  qtdAbertos: number
  qtdFechados: number
  produtoTop: string | null
  linhaTopProducao: string | null
  linhaTopParada: string | null
  linhaTopPerdas: string | null
  linhaTopEstrategicas: string | null
  existeLinhaTurnoInteiroParada: boolean
  linhaTurnoInteiroParada: string | null
  paradasLinhaTurnoInteiro: number
  linhaMaisPerdas: LinhaDestaque | null
  linhaMaisParadas: LinhaDestaque | null
}

export type InsightTipo = 'warning' | 'success' | 'critical' | 'info'

type InsightRegra = {
  id: string
  titulo: string
  tipo: InsightTipo
  when: (contexto: InsightContext) => boolean
  variants: string[]
  recomendacoes?: string[]
  tags?: string[]
  confianca?: number
  map?: (contexto: InsightContext) => Record<string, string>
}

export type InsightGerado = {
  id: string
  titulo: string
  tipo: InsightTipo
  texto: string
  recomendacao: string | null
  tags: string[]
  confianca: number | null
}

const INSIGHT_SESSION_PREFIX = 'resumo-oee-turno-insights'

const escolherUm = <T,>(itens: T[]): T => itens[Math.floor(Math.random() * itens.length)]
const interpolarTemplate = (texto: string, mapa: Record<string, string>): string =>
  texto.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, chave) => (chave in mapa ? mapa[chave] : '—'))
const normalizarTexto = (valor: string) =>
  valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
const normalizarStatus = (valor?: string | null) => normalizarTexto((valor || '').replace(/_/g, ' ')).trim()

const LIMIAR_GAP_PERCENTUAL = 0.1
const LIMIAR_PERDAS_DESTAQUE = 0.02
const LIMIAR_PARADAS_TOTAIS_MIN = 120
const LIMIAR_PARADAS_ESTRATEGICAS_MIN = 60
const LIMIAR_PARADAS_ESTRATEGICAS_PROP = 0.2
const LIMIAR_LINHA_TURNO_PARADO_MIN = 600
const LIMIAR_MICROPARADAS_MIN = 30
const LIMIAR_SKU_VARIADO = 3
const LIMIAR_LINHAS_ATIVAS = 2

const somarTotais = (linhas: ResumoOeeTurnoLinhaNormalizada[]): ResumoTotais => {
  const totais: ResumoTotais = {
    skuProduzidos: 0,
    turnosDistintos: 0,
    qtdEnvase: 0,
    perdasEnvase: 0,
    envasado: 0,
    qtdEmbalagem: 0,
    perdasEmbalagem: 0,
    embalado: 0,
    quantidade: 0,
    perdas: 0,
    paradasGrandes: 0,
    paradasPequenas: 0,
    paradasTotais: 0,
    paradasEstrategicas: 0,
  }

  const produtosProduzidos = new Set<number>()

  for (const linha of linhas) {
    totais.qtdEnvase += linha.qtd_envase
    totais.perdasEnvase += linha.perdas_envase
    totais.envasado += linha.envasado
    totais.qtdEmbalagem += linha.qtd_embalagem
    totais.perdasEmbalagem += linha.perdas_embalagem
    totais.embalado += linha.embalado
    totais.quantidade += linha.qtd_envase + linha.qtd_embalagem
    totais.perdas += linha.perdas
    totais.paradasGrandes += linha.paradas_grandes_minutos
    totais.paradasPequenas += linha.paradas_pequenas_minutos
    totais.paradasTotais += linha.paradas_totais_minutos
    totais.paradasEstrategicas += linha.paradas_estrategicas_minutos

    const produtoId = linha.produto_id
    const teveProducao = linha.qtd_envase > 0 || linha.embalado > 0
    if (produtoId !== null && produtoId !== undefined && teveProducao) {
      produtosProduzidos.add(produtoId)
    }
  }

  totais.skuProduzidos = produtosProduzidos.size
  totais.turnosDistintos = new Set(
    linhas
      .map((linha) => linha.oeeturno_id)
      .filter((id): id is number => id !== null && id !== undefined)
  ).size
  return totais
}

const obterLinhaDestaque = (
  linhas: LinhaAgrupada[],
  extrairValor: (linha: LinhaAgrupada) => number,
  total: number
): LinhaDestaque | null => {
  let destaque: LinhaDestaque | null = null

  for (const linha of linhas) {
    const valor = extrairValor(linha)
    if (!Number.isFinite(valor) || valor <= 0) {
      continue
    }

    if (!destaque || valor > destaque.valor) {
      const nomeLinha = (linha.linha || 'Linha não informada').trim() || 'Linha não informada'
      destaque = {
        nome: nomeLinha,
        valor,
        percentual: total > 0 ? valor / total : 0,
      }
    }
  }

  return destaque
}

export const criarChaveInsightSessao = (usuarioId?: string | null): string => {
  return `${INSIGHT_SESSION_PREFIX}:${usuarioId || 'anon'}`
}

export const lerInsightsUsados = (chave: string): Set<string> => {
  if (typeof window === 'undefined') {
    return new Set()
  }

  const salvo = window.sessionStorage.getItem(chave)
  if (!salvo) {
    return new Set()
  }

  try {
    const parsed = JSON.parse(salvo)
    if (!Array.isArray(parsed)) {
      return new Set()
    }
    return new Set(parsed.filter((item) => typeof item === 'string'))
  } catch {
    return new Set()
  }
}

export const salvarInsightsUsados = (chave: string, usados: Set<string>) => {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(chave, JSON.stringify(Array.from(usados)))
}

export const construirContextoInsight = (
  linhas: ResumoOeeTurnoLinhaNormalizada[],
  linhasAgrupadas: LinhaAgrupada[]
): InsightContext => {
  const totais = somarTotais(linhas)
  const turnosAbertos = new Set<string>()
  const turnosFechados = new Set<string>()
  const linhasNaoIniciadas = new Set<string>()
  const produtosMap = new Map<string, number>()
  const totalProducao = Math.max(0, totais.quantidade)
  const totalPerdas = Math.max(0, totais.perdas)
  const taxaPerdas = totalProducao > 0 ? totalPerdas / totalProducao : 0
  const totalEnvase = Math.max(0, totais.qtdEnvase)
  const totalEmbalagem = Math.max(0, totais.qtdEmbalagem)
  const gapEnvaseEmbalagem = totalEnvase - totalEmbalagem
  const gapAbs = Math.abs(gapEnvaseEmbalagem)
  const etapaMaior = totalEnvase >= totalEmbalagem ? 'envase' : 'embalagem'
  const totalParadas = Math.max(0, totais.paradasTotais)
  const totalParadasGrandes = Math.max(0, totais.paradasGrandes)
  const totalParadasPequenas = Math.max(0, totais.paradasPequenas)
  const totalParadasEstrategicas = Math.max(0, totais.paradasEstrategicas)
  const totalParadasBase =
    totalParadas > 0
      ? totalParadas
      : totalParadasGrandes + totalParadasPequenas + totalParadasEstrategicas

  const proporcaoParadasGrandes = totalParadasBase > 0 ? totalParadasGrandes / totalParadasBase : 0
  const proporcaoParadasPequenas = totalParadasBase > 0 ? totalParadasPequenas / totalParadasBase : 0
  const proporcaoParadasEstrategicas =
    totalParadasBase > 0 ? totalParadasEstrategicas / totalParadasBase : 0
  const linhaMaisPerdas = obterLinhaDestaque(linhasAgrupadas, (linha) => linha.perdas, totalPerdas)
  const linhaMaisParadas = obterLinhaDestaque(linhasAgrupadas, (linha) => linha.paradasTotais, totalParadasBase)
  const linhaTopProducao = obterLinhaDestaque(linhasAgrupadas, (linha) => linha.quantidade, totalProducao)?.nome ?? null
  const linhaTopEstrategicas =
    obterLinhaDestaque(linhasAgrupadas, (linha) => linha.paradasEstrategicas, totalParadasEstrategicas)?.nome ?? null
  const linhasAtivas = linhasAgrupadas.filter((linha) => linha.quantidade > 0).length
  const linhaTurnoInteiroParada = linhasAgrupadas.find(
    (linha) => linha.paradasTotais >= LIMIAR_LINHA_TURNO_PARADO_MIN && linha.quantidade <= 0
  )

  for (const linha of linhas) {
    const status = normalizarStatus(linha.status_turno_registrado ?? linha.status_linha)
    const turnoKey =
      linha.oeeturno_id !== null && linha.oeeturno_id !== undefined
        ? `id-${linha.oeeturno_id}`
        : `linha-${linha.linhaproducao_id ?? 'sem'}-${linha.data ?? 'sem-data'}`

    if (status.includes('ABERTO')) {
      turnosAbertos.add(turnoKey)
    }
    if (status.includes('FECHADO') || status.includes('FECHADA')) {
      turnosFechados.add(turnoKey)
    }
    if (status.includes('NAO INICIADO')) {
      const linhaKey = linha.linhaproducao_id !== null && linha.linhaproducao_id !== undefined
        ? `id-${linha.linhaproducao_id}`
        : `linha-${linha.linhaproducao ?? 'sem-linha'}`
      linhasNaoIniciadas.add(linhaKey)
    }

    const produto = (linha.produto || '').trim()
    if (produto && produto.toLowerCase() !== 'produto não informado') {
      const quantidadeProduto = linha.qtd_envase + linha.qtd_embalagem
      produtosMap.set(produto, (produtosMap.get(produto) ?? 0) + quantidadeProduto)
    }
  }

  let produtoTop: string | null = null
  let produtoTopValor = 0
  produtosMap.forEach((valor, produto) => {
    if (valor > produtoTopValor) {
      produtoTop = produto
      produtoTopValor = valor
    }
  })

  return {
    totalProducao,
    totalPerdas,
    taxaPerdas,
    totalEnvase,
    totalEmbalagem,
    gapEnvaseEmbalagem,
    gapAbs,
    etapaMaior,
    totalParadas,
    totalParadasBase,
    totalParadasGrandes,
    totalParadasPequenas,
    totalParadasEstrategicas,
    proporcaoParadasGrandes,
    proporcaoParadasPequenas,
    proporcaoParadasEstrategicas,
    skuProduzidos: totais.skuProduzidos,
    turnosDistintos: totais.turnosDistintos,
    linhasAtivas,
    linhasNaoIniciadas: linhasNaoIniciadas.size,
    qtdAbertos: turnosAbertos.size,
    qtdFechados: turnosFechados.size,
    produtoTop,
    linhaTopProducao,
    linhaTopParada: linhaMaisParadas?.nome ?? null,
    linhaTopPerdas: linhaMaisPerdas?.nome ?? null,
    linhaTopEstrategicas,
    existeLinhaTurnoInteiroParada: Boolean(linhaTurnoInteiroParada),
    linhaTurnoInteiroParada: linhaTurnoInteiroParada?.linha ?? null,
    paradasLinhaTurnoInteiro: linhaTurnoInteiroParada?.paradasTotais ?? 0,
    linhaMaisPerdas,
    linhaMaisParadas,
  }
}

const criarMapaPlaceholders = (contexto: InsightContext): Record<string, string> => ({
  etapa_maior: contexto.etapaMaior,
  gap_abs: formatarQuantidade(contexto.gapAbs),
  perdas_total: formatarQuantidade(contexto.totalPerdas),
  taxa_perdas_pct: formatarDecimal(contexto.taxaPerdas * 100, 1),
  paradas_totais_min: formatarDecimal(contexto.totalParadasBase, 0),
  paradas_totais_hhmm: formatarMinutos(contexto.totalParadasBase),
  paradas_estrategicas_min: formatarDecimal(contexto.totalParadasEstrategicas, 0),
  paradas_estrategicas_hhmm: formatarMinutos(contexto.totalParadasEstrategicas),
  paradas_pequenas_min: formatarDecimal(contexto.totalParadasPequenas, 0),
  paradas_pequenas_hhmm: formatarMinutos(contexto.totalParadasPequenas),
  linhas_ativas: formatarDecimal(contexto.linhasAtivas, 0),
  linhas_nao_iniciadas: formatarDecimal(contexto.linhasNaoIniciadas, 0),
  qtd_abertos: formatarDecimal(contexto.qtdAbertos, 0),
  qtd_fechados: formatarDecimal(contexto.qtdFechados, 0),
  linha_top_parada: contexto.linhaTopParada ?? 'Linha não informada',
  linha_top_estrat: contexto.linhaTopEstrategicas ?? 'Linha não informada',
  linha_top_producao: contexto.linhaTopProducao ?? 'Linha não informada',
  linha_top_perdas: contexto.linhaTopPerdas ?? 'Linha não informada',
  linha_exemplo: contexto.linhaTurnoInteiroParada ?? 'Linha não informada',
  produto_top: contexto.produtoTop ?? 'Produto não informado',
  sku_produzidos: formatarDecimal(contexto.skuProduzidos, 0),
  turnos_distintos: formatarDecimal(contexto.turnosDistintos, 0),
})

const INSIGHTS: InsightRegra[] = [
  {
    id: 'balanceamento-envase-embalagem',
    titulo: 'Balanço Envase × Embalagem',
    tipo: 'warning',
    when: (contexto) =>
      contexto.totalProducao > 0 &&
      contexto.gapAbs >= Math.max(contexto.totalProducao * LIMIAR_GAP_PERCENTUAL, 1),
    variants: [
      'Hoje apareceu um desalinhamento entre envase e embalagem: a etapa de {etapa_maior} está {gap_abs} unidades acima da outra. Isso geralmente indica desequilíbrio de fluxo (ex.: produto chegando mais rápido do que a etapa seguinte consegue processar, ou embalagem rodando com material já acumulado). Vale checar se houve formação de estoque intermediário, troca de equipe/ritmo no meio do turno, ou se parte do volume foi embalada em janela diferente do envase.',
      'O comparativo Envase × Embalagem sugere um ponto de atenção no sincronismo das etapas. A diferença de {gap_abs} unidades pode ser normal se houve reprocesso / ajuste operacional, mas se for recorrente pode indicar gargalo (quando embalagem fica atrás) ou consumo de estoque intermediário (quando embalagem fica à frente). Recomendo olhar o histórico por linha e observar se essa diferença acompanha picos de paradas.',
    ],
    recomendacoes: [
      'Verifique estoque intermediário e o ritmo entre etapas para reduzir o gap.',
      'Avalie gargalos e janelas diferentes de envase/embalagem no período.',
    ],
    tags: ['Fluxo', 'Envase', 'Embalagem'],
    confianca: 78,
  },
  {
    id: 'perdas-em-destaque',
    titulo: 'Perdas em destaque',
    tipo: 'warning',
    when: (contexto) => contexto.totalProducao > 0 && contexto.taxaPerdas >= LIMIAR_PERDAS_DESTAQUE,
    variants: [
      'As perdas do período chamam atenção: foram {perdas_total} unidades, equivalentes a {taxa_perdas_pct}% do volume movimentado. Quando esse percentual passa de um patamar aceitável, normalmente vale investigar se o principal fator foi setup, regulagem, refugo por qualidade, ou quebras por parada/retomada. Um bom próximo passo é comparar as perdas por linha/produto e ver onde a taxa dispara.',
      'Mesmo com produção registrada, as perdas ficaram em {taxa_perdas_pct}% (≈ {perdas_total} unidades). Isso é um bom candidato a “insight de causa”: perdas altas tendem a acompanhar instabilidade do processo (muitas paradas), trocas frequentes, ou diferença grande entre envase e embalagem. Se você cruzar esse indicador com as maiores paradas e com o produto {produto_top}, provavelmente encontra um padrão.',
    ],
    recomendacoes: [
      'Cruze perdas por linha/produto e investigue causas de setup e qualidade.',
      'Priorize as linhas com maior taxa de perdas e revise retomadas.',
    ],
    tags: ['Perdas', 'Qualidade', 'Processo'],
    confianca: 82,
  },
  {
    id: 'paradas-dominando-turno',
    titulo: 'Paradas dominando o turno',
    tipo: 'critical',
    when: (contexto) => contexto.totalParadasBase >= LIMIAR_PARADAS_TOTAIS_MIN,
    variants: [
      'O dia teve paradas relevantes: somando {paradas_totais_min} minutos (≈ {paradas_totais_hhmm}) no turno. Quando a parada ocupa uma fatia grande do tempo disponível, a maior alavanca costuma ser Disponibilidade: atacar as 2–3 maiores causas frequentemente devolve mais OEE do que micro-otimizações. Se as paradas foram concentradas em {linha_top_parada}, essa é a candidata principal para abrir análise.',
      'Pelo volume de paradas ({paradas_totais_hhmm} no período), o cenário aponta mais para perda de tempo produtivo do que para problema de velocidade nominal. Minha sugestão é ranquear: (1) paradas grandes, (2) paradas estratégicas, (3) repetição de pequenas paradas. Só esse ranking normalmente já aponta um plano de ação bem objetivo para a equipe.',
    ],
    recomendacoes: [
      'Rankear paradas e atacar as 2–3 maiores causas primeiro.',
      'Focar em disponibilidade antes de ajustes de velocidade.',
    ],
    tags: ['Disponibilidade', 'Paradas'],
    confianca: 86,
  },
  {
    id: 'paradas-estrategicas',
    titulo: 'Paradas estratégicas em alta',
    tipo: 'info',
    when: (contexto) =>
      contexto.totalParadasEstrategicas >= LIMIAR_PARADAS_ESTRATEGICAS_MIN &&
      contexto.proporcaoParadasEstrategicas >= LIMIAR_PARADAS_ESTRATEGICAS_PROP,
    variants: [
      'Um ponto importante: parte relevante das paradas foi classificada como estratégica ({paradas_estrategicas_min} min, {paradas_estrategicas_hhmm}). Isso tende a significar parada planejada/inevitável (setup, limpeza, validação, programação). O insight aqui é separar o que é “do jogo” do que é perda real: se o turno ficou quase todo estratégico em {linha_top_estrat}, pode valer revisar programação de produção (sequenciamento) para reduzir setups e janelas ociosas.',
      'O peso das paradas estratégicas sugere que o desempenho do turno pode estar mais condicionado à agenda/planejamento do que à execução em si. Se essa linha passou muitas horas em estratégico, uma ação prática é observar se houve janelas grandes de espera (materiais, aprovação, liberação) que poderiam ser antecipadas.',
    ],
    recomendacoes: [
      'Revisar sequenciamento e janelas de setup para reduzir tempo estratégico.',
      'Separar o que é planejado do que é perda real no apontamento.',
    ],
    tags: ['Planejamento', 'Setup', 'Estratégico'],
    confianca: 74,
  },
  {
    id: 'governanca-aberto-fechado',
    titulo: 'Turnos abertos sem fechamento',
    tipo: 'warning',
    when: (contexto) => contexto.qtdAbertos > 0 && contexto.qtdFechados > 0,
    variants: [
      'Percebi um padrão de mistura de turnos abertos e fechados no mesmo dia (ex.: {qtd_abertos} abertos e {qtd_fechados} fechados). Isso pode ser normal ao longo do dia, mas se o período analisado já deveria estar consolidado, é um sinal de governança do apontamento: turnos abertos podem deixar paradas/quantidades incompletas e distorcer indicadores. Um bom cuidado é tratar insights com um “selo” de confiabilidade: quanto mais aberto, mais “parcial” é o diagnóstico.',
      'O status mostra que nem tudo está encerrado ainda. Quando existem registros em “Aberto”, alguns números (principalmente paradas totais e perdas) podem estar subestimados. O insight é simples: para análise final (e comparação histórica), priorize turnos “Fechado”; para acompanhamento em tempo real, use os abertos como tendência e não como resultado definitivo.',
    ],
    recomendacoes: [
      'Priorize o fechamento dos turnos para consolidar indicadores.',
      'Use turnos abertos como tendência e não como resultado final.',
    ],
    tags: ['Governança', 'Apontamento', 'Turnos'],
    confianca: 70,
  },
  {
    id: 'turno-inteiro-parado',
    titulo: 'Linha com turno parado',
    tipo: 'critical',
    when: (contexto) => contexto.existeLinhaTurnoInteiroParada,
    map: (contexto) => ({
      paradas_totais_min: formatarDecimal(contexto.paradasLinhaTurnoInteiro, 0),
      paradas_totais_hhmm: formatarMinutos(contexto.paradasLinhaTurnoInteiro),
    }),
    variants: [
      'Há linhas com sinal claro de turno consumido por parada (ex.: {linha_exemplo} com {paradas_totais_hhmm} de paradas e produção mínima/zero). Quando isso acontece, normalmente a causa é uma de três: linha não programada, intervenção/manutenção, ou bloqueio operacional (material/qualidade/liberação). O insight prático é registrar isso como evento de gestão: se for não programada, marque como “sem programação”; se for manutenção, garanta o motivo/OS; se for bloqueio, qual foi o gargalo de liberação.',
      'Turno inteiro parado não é um “ruído” do dado — é um evento. Se isso estiver aparecendo repetidamente, é um ótimo indicador de que o planejamento (ou a disponibilidade de recursos) está puxando o desempenho para baixo mais do que a operação em si.',
    ],
    recomendacoes: [
      'Classificar motivo: sem programação, manutenção ou bloqueio operacional.',
      'Registrar OS/causa e avaliar impacto no planejamento.',
    ],
    tags: ['Disponibilidade', 'Gestão', 'Paradas'],
    confianca: 90,
  },
  {
    id: 'concentracao-producao',
    titulo: 'Produção concentrada',
    tipo: 'info',
    when: (contexto) => contexto.linhasAtivas > 0 && contexto.linhasAtivas <= LIMIAR_LINHAS_ATIVAS,
    variants: [
      'A produção ficou concentrada em poucas linhas: {linhas_ativas} linhas tiveram volume relevante, enquanto várias ficaram com produção zero. Isso não é necessariamente ruim, mas cria um insight de dependência: qualquer instabilidade em {linha_top_producao} vira impacto direto no resultado do dia. Se você quiser reduzir risco operacional, vale pensar em alternativas de balanceamento ou contingência.',
      'Quando poucas linhas carregam o dia, o ganho mais rápido geralmente é estabilizar essas linhas-chave (paradas grandes, setup, abastecimento). O restante vira “capacidade reserva” — útil, mas não é onde está o retorno imediato.',
    ],
    recomendacoes: [
      'Estabilizar as linhas-chave e definir contingência para variações.',
      'Balancear produção quando possível para reduzir dependência.',
    ],
    tags: ['Risco', 'Balanceamento', 'Produção'],
    confianca: 68,
  },
  {
    id: 'variedade-skus',
    titulo: 'Variedade de SKUs',
    tipo: 'warning',
    when: (contexto) => contexto.skuProduzidos >= LIMIAR_SKU_VARIADO,
    variants: [
      'Teve uma variedade considerável de SKUs/produtos ({sku_produzidos}) no recorte analisado. Sempre que o mix aumenta, a eficiência tende a cair por trocas e setups, além de maior risco de microparadas e ajustes. O insight é: se a meta do dia é volume, reduzir o número de trocas (sequenciar produtos similares) costuma devolver tempo produtivo. Se a meta é atender demanda variada, então o foco muda para reduzir tempo de setup e padronizar.',
    ],
    recomendacoes: [
      'Sequenciar produtos similares para reduzir setups.',
      'Padronizar retomadas para minimizar perdas por troca.',
    ],
    tags: ['Mix', 'SKU', 'Setup'],
    confianca: 66,
  },
  {
    id: 'microparadas-acumulando',
    titulo: 'Microparadas acumuladas',
    tipo: 'warning',
    when: (contexto) => contexto.totalParadasPequenas >= LIMIAR_MICROPARADAS_MIN,
    variants: [
      'As pequenas paradas podem estar “comendo” eficiência sem chamar atenção: foram {paradas_pequenas_min} minutos no total. Elas costumam indicar problemas de alimentação, sensores, ajustes finos, ou rotina de operador (ex.: pequenas intervenções repetidas). O insight aqui é tratar microparada como padrão: se ela aparece todo dia, provavelmente é causa crônica e vale padronizar correção.',
      'Mesmo quando as paradas grandes estão sob controle, microparadas recorrentes derrubam o ritmo. Uma boa ação é: identificar as 3 microcausas mais frequentes e fazer um mini-kaizen focado nelas.',
    ],
    recomendacoes: [
      'Mapear as 3 microcausas mais frequentes e padronizar correções.',
      'Fazer mini-kaizen focado em alimentação, sensores e ajustes finos.',
    ],
    tags: ['Performance', 'Microparadas'],
    confianca: 73,
  },
  {
    id: 'qualidade-dado-nao-iniciado',
    titulo: 'Turno não iniciado',
    tipo: 'info',
    when: (contexto) => contexto.linhasNaoIniciadas > 0,
    variants: [
      'Algumas linhas aparecem como “Turno Não Iniciado” (≈ {linhas_nao_iniciadas}). O insight é de qualidade do dado: para não poluir a leitura do dashboard, você pode separar isso como “linhas sem apontamento” e não misturar com as linhas produtivas. Operacionalmente, isso também ajuda: vira uma lista objetiva de onde faltou iniciar/registrar o turno.',
      'Quando uma linha retorna com turno não iniciado, o melhor uso do dado é como checklist: “essa linha foi programada e não iniciou?” Se sim, é um desvio de programação; se não, é simplesmente ocioso planejado. Separar esses dois cenários melhora muito a credibilidade do insight.',
    ],
    recomendacoes: [
      'Separar linhas sem apontamento e revisar programação.',
      'Usar como checklist de início de turno para evitar distorções.',
    ],
    tags: ['Dados', 'Apontamento'],
    confianca: 60,
  },
]

export const gerarInsight = (contexto: InsightContext, usados: Set<string>): InsightGerado | null => {
  const candidatos = INSIGHTS.filter((regra) => regra.when(contexto) && !usados.has(regra.id))
  const candidatosFallback = INSIGHTS.filter((regra) => regra.when(contexto))
  const pool = candidatos.length > 0 ? candidatos : candidatosFallback
  if (pool.length === 0) {
    return null
  }
  const escolhido = pool[Math.floor(Math.random() * pool.length)]
  const mapaBase = criarMapaPlaceholders(contexto)
  const mapa = escolhido.map ? { ...mapaBase, ...escolhido.map(contexto) } : mapaBase
  const textoBase = escolherUm(escolhido.variants)
  const recomendacaoBase = escolhido.recomendacoes ? escolherUm(escolhido.recomendacoes) : null
  return {
    id: escolhido.id,
    titulo: interpolarTemplate(escolhido.titulo, mapa),
    tipo: escolhido.tipo,
    texto: interpolarTemplate(textoBase, mapa),
    recomendacao: recomendacaoBase ? interpolarTemplate(recomendacaoBase, mapa) : null,
    tags: escolhido.tags ?? [],
    confianca: typeof escolhido.confianca === 'number' ? escolhido.confianca : null,
  }
}
