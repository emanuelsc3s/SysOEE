# Exemplos de Código para Implementação de OEE

**Complemento de:** `IMPLEMENTACAO-CALCULO-OEE.md`
**Data:** 16/11/2025

Este documento contém exemplos de código prontos para uso na implementação do cálculo de OEE.

---

## 📦 Exemplo 1: Função calcularOEECompleto() COMPLETA

**Arquivo:** `src/services/localStorage/apontamento-oee.storage.ts`

**Adicionar no início do arquivo (após imports existentes):**

```typescript
import { buscarParadasPorLote, ParadaLocalStorage } from './parada.storage'

// Tipos de parada (deve estar em sync com tipos do sistema)
type TipoParada = 'ESTRATEGICA' | 'PLANEJADA' | 'NAO_PLANEJADA'
```

**Adicionar antes da função `limparTodosApontamentos()` (antes da linha 301):**

```typescript
/**
 * Calcula OEE completo integrando apontamentos de produção, qualidade e paradas
 *
 * Esta função implementa a metodologia completa de OEE considerando:
 * - Disponibilidade: Afetada por paradas >= 10 min (exceto estratégicas)
 * - Performance: Afetada por pequenas paradas < 10 min e velocidade nominal
 * - Qualidade: Afetada por perdas e retrabalhos
 *
 * @param apontamentoProducaoId - ID do apontamento de produção
 * @param lote - Número do lote (para buscar paradas relacionadas)
 * @param tempoDisponivelTurno - Tempo disponível do turno em horas (padrão: 12)
 * @returns Cálculo completo do OEE com todos os componentes
 */
export function calcularOEECompleto(
  apontamentoProducaoId: string,
  lote: string,
  tempoDisponivelTurno: number = 12
): CalculoOEE {
  // =================================================================
  // PASSO 1: BUSCAR DADOS
  // =================================================================

  const apontamento = buscarApontamentoProducaoPorId(apontamentoProducaoId)

  if (!apontamento) {
    console.warn('⚠️ Apontamento de produção não encontrado:', apontamentoProducaoId)
    return {
      disponibilidade: 0,
      performance: 0,
      qualidade: 0,
      oee: 0,
      tempoOperacionalLiquido: 0,
      tempoValioso: 0
    }
  }

  const paradas = buscarParadasPorLote(lote)
  const perdas = buscarApontamentosPerdasPorProducao(apontamentoProducaoId)
  const retrabalhos = buscarApontamentosRetrabalhoPorProducao(apontamentoProducaoId)

  console.log('📊 Calculando OEE:', {
    apontamentoId: apontamentoProducaoId,
    lote,
    totalParadas: paradas.length,
    totalPerdas: perdas.length,
    totalRetrabalhos: retrabalhos.length
  })

  // =================================================================
  // PASSO 2: CLASSIFICAR PARADAS POR TIPO E DURAÇÃO
  // =================================================================

  // Paradas estratégicas (não entram no cálculo - são excluídas do tempo disponível)
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

  console.log('🔍 Classificação de paradas:', {
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

  // Tempo Disponível Ajustado = Tempo Disponível - Paradas Estratégicas
  const tempoDisponivelAjustado = tempoDisponivelHoras - tempoEstrategicoHoras

  // Tempo de Operação = Tempo Disponível Ajustado - Paradas Grandes
  const tempoOperacao = tempoDisponivelAjustado - tempoParadasGrandesHoras

  console.log('⏱️ Tempos calculados (horas):', {
    tempoDisponivel: tempoDisponivelHoras,
    tempoEstrategico: tempoEstrategicoHoras,
    tempoDisponivelAjustado,
    tempoParadasGrandes: tempoParadasGrandesHoras,
    tempoOperacao,
    tempoPequenasParadas: tempoPequenasParadasHoras
  })

  // =================================================================
  // PASSO 4: CALCULAR DISPONIBILIDADE
  // Disponibilidade = (Tempo de Operação / Tempo Disponível Ajustado) × 100
  // =================================================================

  const disponibilidade = tempoDisponivelAjustado > 0
    ? (tempoOperacao / tempoDisponivelAjustado) * 100
    : 0

  console.log('📈 Disponibilidade:', {
    tempoOperacao,
    tempoDisponivelAjustado,
    disponibilidade: `${arredondar(disponibilidade)}%`
  })

  // =================================================================
  // PASSO 5: CALCULAR PERFORMANCE
  // Performance = (Tempo Operacional Líquido / Tempo de Operação) × 100
  // =================================================================

  // Método 1: Por quantidade produzida e velocidade nominal
  const tempoOperacionalLiquidoPorProducao = apontamento.velocidadeNominal > 0
    ? apontamento.quantidadeProduzida / apontamento.velocidadeNominal
    : 0

  // Método 2: Por tempo de operação menos pequenas paradas
  const tempoOperacionalLiquidoPorParadas = tempoOperacao - tempoPequenasParadasHoras

  // Usar o método por produção (mais preciso)
  const tempoOperacionalLiquido = tempoOperacionalLiquidoPorProducao

  const performance = tempoOperacao > 0
    ? (tempoOperacionalLiquido / tempoOperacao) * 100
    : 0

  console.log('🚀 Performance:', {
    quantidadeProduzida: apontamento.quantidadeProduzida,
    velocidadeNominal: apontamento.velocidadeNominal,
    tempoOperacionalLiquido,
    tempoOperacao,
    performance: `${arredondar(performance)}%`
  })

  // =================================================================
  // PASSO 6: CALCULAR QUALIDADE
  // Qualidade = Qualidade_Unidades × Qualidade_Retrabalho
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

  console.log('✨ Qualidade:', {
    totalPerdas,
    unidadesBoas,
    qualidadeUnidades: `${arredondar(qualidadeUnidades)}%`,
    totalTempoRetrabalho,
    qualidadeRetrabalho: `${arredondar(qualidadeRetrabalho)}%`,
    qualidadeTotal: `${arredondar(qualidade)}%`
  })

  // =================================================================
  // PASSO 7: CALCULAR OEE
  // OEE = Disponibilidade × Performance × Qualidade
  // =================================================================

  const oee = (disponibilidade / 100) * (performance / 100) * (qualidade / 100) * 100

  // Tempo Valioso = (Qualidade / 100) × Tempo Operacional Líquido
  const tempoValioso = (qualidade / 100) * tempoOperacionalLiquido

  console.log('🎯 OEE Final:', {
    disponibilidade: `${arredondar(disponibilidade)}%`,
    performance: `${arredondar(performance)}%`,
    qualidade: `${arredondar(qualidade)}%`,
    oee: `${arredondar(oee)}%`,
    tempoValioso: `${arredondar(tempoValioso)}h`
  })

  // =================================================================
  // RETORNO
  // =================================================================

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
 * Soma durações de paradas em minutos
 */
function somarDuracoesMinutos(paradas: ParadaLocalStorage[]): number {
  return paradas.reduce((sum, p) => sum + (p.duracao_minutos || 0), 0)
}

/**
 * Arredonda número para 2 casas decimais
 */
function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100
}

/**
 * Identifica tipo de parada baseado em campos da parada
 * TODO: Substituir por busca no código de parada real quando integrado com banco
 */
function identificarTipoParada(parada: ParadaLocalStorage): TipoParada {
  // Por enquanto, inferir do campo observacao ou usar padrão
  // IMPORTANTE: Esta função deve ser substituída quando integrar com códigos de parada reais

  const obs = parada.observacao?.toLowerCase() || ''

  if (obs.includes('estrateg') || obs.includes('setup') || obs.includes('troca')) {
    return 'ESTRATEGICA'
  }

  if (obs.includes('planej') || obs.includes('manuten') || obs.includes('limpeza')) {
    return 'PLANEJADA'
  }

  return 'NAO_PLANEJADA'
}
```

---

## 📦 Exemplo 2: handleSalvarProducao() COMPLETO

**Arquivo:** `src/pages/ApontamentoOEE.tsx`

**Adicionar função auxiliar (após imports, antes do componente):**

```typescript
/**
 * Calcula diferença em horas entre dois horários HH:MM
 * Suporta passagem de meia-noite
 */
function calcularDiferencaHoras(inicio: string, fim: string): number {
  const [hInicio, mInicio] = inicio.split(':').map(Number)
  const [hFim, mFim] = fim.split(':').map(Number)

  const minutosInicio = hInicio * 60 + mInicio
  let minutosFim = hFim * 60 + mFim

  // Se fim < início, passou da meia-noite
  if (minutosFim < minutosInicio) {
    minutosFim += 24 * 60 // Adiciona 24 horas
  }

  return (minutosFim - minutosInicio) / 60
}
```

**Substituir handleSalvarProducao (linha 124):**

```typescript
const handleSalvarProducao = () => {
  // =================================================================
  // VALIDAÇÃO 1: Campos do Cabeçalho
  // =================================================================

  if (!data) {
    toast({
      title: 'Campo obrigatório',
      description: 'Selecione a Data do apontamento',
      variant: 'destructive'
    })
    return
  }

  if (!turno) {
    toast({
      title: 'Campo obrigatório',
      description: 'Selecione o Turno',
      variant: 'destructive'
    })
    return
  }

  if (!linhaId) {
    toast({
      title: 'Campo obrigatório',
      description: 'Selecione a Linha de Produção',
      variant: 'destructive'
    })
    return
  }

  if (!skuCodigo) {
    toast({
      title: 'Campo obrigatório',
      description: 'Digite o código do SKU',
      variant: 'destructive'
    })
    return
  }

  if (!lote) {
    toast({
      title: 'Campo obrigatório',
      description: 'Digite o número do Lote',
      variant: 'destructive'
    })
    return
  }

  // =================================================================
  // VALIDAÇÃO 2: Campos do Formulário de Produção
  // =================================================================

  if (!horaInicio) {
    toast({
      title: 'Campo obrigatório',
      description: 'Informe a Hora de Início da produção',
      variant: 'destructive'
    })
    return
  }

  if (!horaFim) {
    toast({
      title: 'Campo obrigatório',
      description: 'Informe a Hora de Fim da produção',
      variant: 'destructive'
    })
    return
  }

  if (!quantidadeProduzida || Number(quantidadeProduzida) <= 0) {
    toast({
      title: 'Campo obrigatório',
      description: 'Informe a Quantidade Produzida (maior que zero)',
      variant: 'destructive'
    })
    return
  }

  // =================================================================
  // BUSCAR DADOS RELACIONADOS
  // =================================================================

  const linha = buscarLinhaPorId(linhaId)
  if (!linha) {
    toast({
      title: 'Erro',
      description: 'Linha de produção não encontrada',
      variant: 'destructive'
    })
    return
  }

  const sku = buscarSKUPorCodigo(skuCodigo)
  if (!sku) {
    toast({
      title: 'Erro',
      description: `SKU "${skuCodigo}" não encontrado no sistema`,
      variant: 'destructive'
    })
    return
  }

  // =================================================================
  // CALCULAR TEMPO DE OPERAÇÃO
  // =================================================================

  const tempoOperacaoHoras = calcularDiferencaHoras(horaInicio, horaFim)

  if (tempoOperacaoHoras <= 0) {
    toast({
      title: 'Erro de validação',
      description: 'Hora de Fim deve ser posterior à Hora de Início',
      variant: 'destructive'
    })
    return
  }

  if (tempoOperacaoHoras > 24) {
    toast({
      title: 'Atenção',
      description: 'Tempo de operação superior a 24 horas. Verifique os horários.',
      variant: 'destructive'
    })
    return
  }

  // =================================================================
  // CRIAR DTO
  // =================================================================

  const dto: CriarApontamentoProducaoDTO = {
    turno,
    linha: linha.nome,
    setor: linha.setor,
    ordemProducao: ordemProducao || 'S/N', // Opcional
    lote,
    sku: sku.codigo,
    produto: sku.descricao,
    velocidadeNominal: 4000, // CONSTANTE: 4000 unidades/hora
    quantidadeProduzida: Number(quantidadeProduzida),
    tempoOperacao: tempoOperacaoHoras,
    tempoDisponivel: 12, // CONSTANTE: 12 horas por turno
    dataApontamento: format(data, 'yyyy-MM-dd'),
    horaInicio: horaInicio.includes(':') ? horaInicio + ':00' : horaInicio,
    horaFim: horaFim.includes(':') ? horaFim + ':00' : horaFim,
    criadoPor: 1, // TODO: buscar do contexto de autenticação
    criadoPorNome: 'Emanuel Silva' // TODO: buscar do contexto
  }

  // =================================================================
  // SALVAR NO LOCALSTORAGE
  // =================================================================

  try {
    const apontamento = salvarApontamentoProducao(dto)

    console.log('✅ Apontamento de produção salvo:', apontamento)

    // =================================================================
    // ATUALIZAR ESTADO PARA RECALCULAR OEE
    // =================================================================

    setApontamentoProducaoId(apontamento.id)

    // =================================================================
    // LIMPAR FORMULÁRIO
    // =================================================================

    setHoraInicio('')
    setHoraFim('')
    setQuantidadeProduzida('')

    // =================================================================
    // FEEDBACK PARA O USUÁRIO
    // =================================================================

    toast({
      title: '✅ Produção Registrada',
      description: `${Number(quantidadeProduzida).toLocaleString('pt-BR')} unidades em ${tempoOperacaoHoras.toFixed(2)}h. OEE atualizado.`
    })

  } catch (error) {
    console.error('❌ Erro ao salvar apontamento:', error)
    toast({
      title: 'Erro ao salvar',
      description: 'Não foi possível salvar o apontamento. Tente novamente.',
      variant: 'destructive'
    })
  }
}
```

---

## 📦 Exemplo 3: handleAdicionarQualidade() COMPLETO

**Substituir handleAdicionarQualidade (linha 131):**

```typescript
const handleAdicionarQualidade = () => {
  // =================================================================
  // VALIDAÇÃO 1: Existe apontamento de produção?
  // =================================================================

  if (!apontamentoProducaoId) {
    toast({
      title: 'Apontamento não encontrado',
      description: 'Registre a produção antes de apontar qualidade',
      variant: 'destructive'
    })
    return
  }

  // =================================================================
  // VALIDAÇÃO 2: Pelo menos um campo de qualidade preenchido
  // =================================================================

  const temPerdas = quantidadePerdas && Number(quantidadePerdas) > 0 && motivoPerdas
  const temRetrabalho = quantidadeRetrabalho && Number(quantidadeRetrabalho) > 0 && motivoRetrabalho

  if (!temPerdas && !temRetrabalho) {
    toast({
      title: 'Campos obrigatórios',
      description: 'Preencha pelo menos um registro: Perdas OU Retrabalho',
      variant: 'destructive'
    })
    return
  }

  // =================================================================
  // SALVAR PERDAS (se preenchido)
  // =================================================================

  if (temPerdas) {
    try {
      salvarApontamentoPerdas(
        apontamentoProducaoId,
        Number(quantidadePerdas),
        motivoPerdas,
        null, // observacao
        1, // TODO: buscar do contexto
        'Emanuel Silva' // TODO: buscar do contexto
      )

      console.log('✅ Perdas registradas:', {
        quantidade: quantidadePerdas,
        motivo: motivoPerdas
      })
    } catch (error) {
      console.error('❌ Erro ao salvar perdas:', error)
      toast({
        title: 'Erro ao salvar perdas',
        description: 'Não foi possível registrar as perdas',
        variant: 'destructive'
      })
      return
    }
  }

  // =================================================================
  // SALVAR RETRABALHO (se preenchido)
  // =================================================================

  if (temRetrabalho) {
    try {
      // Calcular tempo de retrabalho estimado
      // Assumindo que retrabalho consome tempo proporcional à velocidade nominal
      const tempoRetrabalhoHoras = Number(quantidadeRetrabalho) / 4000 // 4000 und/h

      salvarApontamentoRetrabalho(
        apontamentoProducaoId,
        Number(quantidadeRetrabalho),
        tempoRetrabalhoHoras,
        motivoRetrabalho,
        null, // observacao
        1, // TODO: buscar do contexto
        'Emanuel Silva' // TODO: buscar do contexto
      )

      console.log('✅ Retrabalho registrado:', {
        quantidade: quantidadeRetrabalho,
        tempo: tempoRetrabalhoHoras,
        motivo: motivoRetrabalho
      })
    } catch (error) {
      console.error('❌ Erro ao salvar retrabalho:', error)
      toast({
        title: 'Erro ao salvar retrabalho',
        description: 'Não foi possível registrar o retrabalho',
        variant: 'destructive'
      })
      return
    }
  }

  // =================================================================
  // RECALCULAR OEE COM NOVA FUNÇÃO
  // =================================================================

  if (lote) {
    try {
      const novoOEE = calcularOEECompleto(apontamentoProducaoId, lote, 12)
      setOeeCalculado(novoOEE)
      console.log('📊 OEE recalculado após qualidade:', novoOEE)
    } catch (error) {
      console.error('❌ Erro ao recalcular OEE:', error)
    }
  }

  // =================================================================
  // LIMPAR FORMULÁRIO
  // =================================================================

  setQuantidadePerdas('')
  setMotivoPerdas('')
  setQuantidadeRetrabalho('')
  setMotivoRetrabalho('')

  // =================================================================
  // FEEDBACK PARA O USUÁRIO
  // =================================================================

  const mensagemPerdas = temPerdas ? `${quantidadePerdas} unidades perdidas` : ''
  const mensagemRetrabalho = temRetrabalho ? `${quantidadeRetrabalho} unidades retrabalhadas` : ''
  const mensagemCompleta = [mensagemPerdas, mensagemRetrabalho]
    .filter(Boolean)
    .join(' e ')

  toast({
    title: '✅ Qualidade Registrada',
    description: `${mensagemCompleta}. OEE recalculado.`
  })
}
```

---

## 📦 Exemplo 4: Histórico Real de Produção

**Substituir histórico mockado (linhas 103-113) por:**

```typescript
// ==================== Estado de Histórico ====================
const [historicoProducao, setHistoricoProducao] = useState<Array<{
  dataHora: string
  inicio: string
  fim: string
  qtdProd: string
}>>([])

// ==================== useEffect para Carregar Histórico ====================
useEffect(() => {
  // Só carregar se tiver lote selecionado
  if (!lote) {
    setHistoricoProducao([])
    return
  }

  try {
    // Buscar todos os apontamentos do lote
    const apontamentos = buscarApontamentosProducaoPorLote(lote)

    // Ordenar por data/hora (mais recente primeiro)
    const apontamentosOrdenados = apontamentos.sort((a, b) => {
      const dataHoraA = new Date(a.dataApontamento + ' ' + a.horaInicio).getTime()
      const dataHoraB = new Date(b.dataApontamento + ' ' + b.horaInicio).getTime()
      return dataHoraB - dataHoraA // Decrescente
    })

    // Pegar apenas os 10 mais recentes
    const historico = apontamentosOrdenados.slice(0, 10).map(apt => ({
      dataHora: `${format(new Date(apt.dataApontamento), 'dd/MM/yyyy')} ${apt.horaInicio.substring(0, 5)}`,
      inicio: apt.horaInicio.substring(0, 5),
      fim: apt.horaFim?.substring(0, 5) || '-',
      qtdProd: apt.quantidadeProduzida.toLocaleString('pt-BR')
    }))

    setHistoricoProducao(historico)

    console.log('📋 Histórico carregado:', {
      lote,
      totalApontamentos: apontamentos.length,
      exibindo: historico.length
    })

  } catch (error) {
    console.error('❌ Erro ao carregar histórico:', error)
    setHistoricoProducao([])
  }
}, [lote]) // Recarregar sempre que o lote mudar
```

---

## 📦 Exemplo 5: Recalculo Automático de OEE

**Substituir useEffect existente (linhas 116-121) por:**

```typescript
// ==================== Recalcula OEE quando dados mudam ====================
useEffect(() => {
  if (apontamentoProducaoId && lote) {
    try {
      // Usar nova função que integra paradas
      const novoOEE = calcularOEECompleto(apontamentoProducaoId, lote, 12)
      setOeeCalculado(novoOEE)

      console.log('🔄 OEE recalculado automaticamente:', {
        apontamentoId: apontamentoProducaoId,
        lote,
        oee: `${novoOEE.oee}%`
      })
    } catch (error) {
      console.error('❌ Erro ao recalcular OEE:', error)
    }
  }
}, [apontamentoProducaoId, lote])

// ==================== Listener para sincronização multi-usuário ====================
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    // Detectar mudanças no localStorage (outros usuários/abas)
    if (
      e.key?.includes('sysoee_apontamentos') ||
      e.key?.includes('sysoee_paradas')
    ) {
      if (apontamentoProducaoId && lote) {
        console.log('🔄 Detectada mudança no localStorage. Recalculando OEE...')

        try {
          const novoOEE = calcularOEECompleto(apontamentoProducaoId, lote, 12)
          setOeeCalculado(novoOEE)
        } catch (error) {
          console.error('❌ Erro ao recalcular OEE:', error)
        }
      }
    }
  }

  window.addEventListener('storage', handleStorageChange)

  return () => {
    window.removeEventListener('storage', handleStorageChange)
  }
}, [apontamentoProducaoId, lote])
```

---

## 📦 Exemplo 6: Import necessário

**Adicionar no topo de ApontamentoOEE.tsx (após imports existentes):**

```typescript
import {
  salvarApontamentoProducao,
  salvarApontamentoPerdas,
  salvarApontamentoRetrabalho,
  calcularOEECompleto, // ← NOVA FUNÇÃO
  buscarApontamentosProducaoPorLote // ← Para histórico
} from '@/services/localStorage/apontamento-oee.storage'
import { format } from 'date-fns'
```

---

## 🧪 Exemplo 7: Dados de Teste

Para testar o cálculo de OEE, você pode usar estes dados de exemplo:

### Cenário 1: OEE Alto (85%)

```typescript
// Apontamento de Produção
Data: 16/11/2025
Turno: 1º Turno
Linha: Linha A
Lote: LOTE-001
Hora Início: 07:00
Hora Fim: 19:00 (12 horas)
Quantidade Produzida: 46.000 unidades

// Paradas
Parada Estratégica: 0 minutos
Paradas Planejadas >= 10min: 30 minutos (manutenção preventiva)
Paradas Não Planejadas >= 10min: 30 minutos (falta de insumo)
Pequenas Paradas < 10min: 20 minutos (micro paradas)

// Qualidade
Perdas: 200 unidades (0,43%)
Retrabalho: 0 unidades

// Resultado Esperado:
Disponibilidade: 90,00% = (660 min / 720 min)
Performance: 95,83% = (11,5h / 12h) [46k / 4k/h = 11,5h]
Qualidade: 99,57% = (45.800 / 46.000)
OEE: 85,83%
```

### Cenário 2: OEE Médio (60%)

```typescript
// Apontamento de Produção
Quantidade Produzida: 32.000 unidades (em 12h)

// Paradas
Paradas Planejadas: 60 minutos
Paradas Não Planejadas: 90 minutos (quebra de máquina)
Pequenas Paradas: 40 minutos

// Qualidade
Perdas: 800 unidades (2,5%)
Retrabalho: 400 unidades (1h de retrabalho)

// Resultado Esperado:
Disponibilidade: 79,17% = (9,5h / 12h)
Performance: 84,21% = (8h / 9,5h) [32k / 4k/h = 8h]
Qualidade: 97,50% × 89,47% = 87,23%
OEE: 58,09%
```

---

## ✅ RESUMO DE ARQUIVOS A MODIFICAR

1. **`src/services/localStorage/apontamento-oee.storage.ts`**
   - Adicionar import de `buscarParadasPorLote`
   - Adicionar função `calcularOEECompleto()`
   - Adicionar funções auxiliares: `somarDuracoesMinutos()`, `arredondar()`, `identificarTipoParada()`

2. **`src/pages/ApontamentoOEE.tsx`**
   - Adicionar import de `calcularOEECompleto` e `buscarApontamentosProducaoPorLote`
   - Adicionar import de `format` do date-fns
   - Adicionar função `calcularDiferencaHoras()`
   - Substituir `handleSalvarProducao()`
   - Substituir `handleAdicionarQualidade()`
   - Substituir histórico mockado por histórico real
   - Atualizar useEffect de recalculo de OEE

---

**Documento criado em:** 16/11/2025
**Versão:** 1.0
**Complementa:** IMPLEMENTACAO-CALCULO-OEE.md
