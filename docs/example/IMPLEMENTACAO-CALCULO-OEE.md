# Implementação do Cálculo de OEE - Análise e Orientações

**Data de Análise:** 16/11/2025
**Página Analisada:** `src/pages/ApontamentoOEE.tsx`
**Objetivo:** Implementar cálculo real de OEE integrado com apontamentos de produção, qualidade e paradas

---

## 📊 ANÁLISE DA SITUAÇÃO ATUAL

### ✅ O que JÁ ESTÁ IMPLEMENTADO

#### 1. **Serviços de localStorage** (`src/services/localStorage/apontamento-oee.storage.ts`)

```typescript
// Funções já implementadas:
- buscarTodosApontamentosProducao()
- salvarApontamentoProducao(dto)
- buscarTodosApontamentosPerdas()
- salvarApontamentoPerdas(...)
- buscarTodosApontamentosRetrabalho()
- salvarApontamentoRetrabalho(...)
- calcularOEE(apontamentoProducaoId) // ⚠️ INCOMPLETO
```

**Problema identificado:** A função `calcularOEE()` atual (linhas 232-296) **NÃO considera as paradas** registradas no sistema.

#### 2. **Serviço de Paradas** (`src/services/localStorage/parada.storage.ts`)

```typescript
// Funções disponíveis:
- buscarTodasParadas()
- buscarParadasPorLote(loteId)
- salvarParada(parada)
- calcularDuracaoMinutos(horaInicio, horaFim)
```

#### 3. **Interface da Página ApontamentoOEE.tsx**

**Estrutura existente:**
- ✅ Formulário de cabeçalho com filtros (Data, Turno, Linha, SKU, OP, Lote, Dossie)
- ✅ Três formulários: Produção, Qualidade, Tempo de Parada
- ✅ Sidebar com velocímetro de OEE
- ✅ Histórico de produção (mockado)

---

## ❌ PROBLEMAS IDENTIFICADOS

### Problema 1: Handlers Não Salvam Dados Reais

**Localização:** `ApontamentoOEE.tsx` linhas 124-143

```typescript
// ATUAL - Apenas mostra toast
const handleSalvarProducao = () => {
  toast({ title: 'Sucesso', description: 'Dados de produção salvos' })
}

const handleAdicionarQualidade = () => {
  toast({ title: 'Sucesso', description: 'Registro de qualidade adicionado' })
}

const handleRegistrarParada = () => {
  toast({ title: 'Sucesso', description: 'Tempo de parada registrado' })
}
```

**Impacto:** Nenhum dado é persistido, não há cálculo real de OEE.

---

### Problema 2: Cálculo de OEE Não Integra Paradas

**Localização:** `apontamento-oee.storage.ts` linhas 232-296

**Problema:** A função atual calcula OEE baseado apenas em:
- `tempoOperacao` (campo do apontamento)
- `tempoDisponivel` (campo do apontamento)

**Não considera:**
- ❌ Paradas Estratégicas (devem ser excluídas do Tempo Disponível)
- ❌ Paradas Planejadas >= 10 min (afetam Disponibilidade)
- ❌ Paradas Não Planejadas >= 10 min (afetam Disponibilidade)
- ❌ Pequenas Paradas < 10 min (afetam Performance)

---

### Problema 3: Histórico Mockado

**Localização:** `ApontamentoOEE.tsx` linhas 103-113

```typescript
const historicoProducao = [
  { dataHora: '2023-10-27 08:00', inicio: '08:00', fim: '12:00', qtdProd: '15.000' },
  // ... dados fixos
]
```

**Impacto:** Histórico não reflete apontamentos reais salvos no localStorage.

---

### Problema 4: Falta Validação de Dados Obrigatórios

Os formulários permitem salvar sem validar se todos os campos do cabeçalho estão preenchidos (linha, SKU, lote, etc).

---

## 🧮 FÓRMULAS DE CÁLCULO (Baseado na Documentação do Projeto)

### Constantes Fornecidas

```typescript
const TEMPO_DISPONIVEL_TURNO = 12 // horas (fixo)
const VELOCIDADE_NOMINAL_LINHA = 4000 // unidades/hora
const LIMITE_PEQUENA_PARADA = 10 // minutos
```

---

### 1. CÁLCULO DE DISPONIBILIDADE

```
Disponibilidade (%) = (Tempo de Operação / Tempo Disponível Ajustado) × 100

Onde:
  Tempo Disponível Ajustado = Tempo Disponível - Paradas Estratégicas

  Tempo de Operação = Tempo Disponível Ajustado - Σ Paradas que Impactam Disponibilidade

  Paradas que Impactam Disponibilidade:
    - Paradas Planejadas com duracao_minutos >= 10
    - Paradas Não Planejadas com duracao_minutos >= 10

  Paradas Estratégicas:
    - São EXCLUÍDAS do Tempo Disponível (não entram no cálculo)
```

**Exemplo:**
```
Turno = 12 horas = 720 minutos
Paradas Estratégicas = 60 minutos (setup de produto)
Paradas Planejadas >= 10min = 30 minutos (manutenção preventiva)
Paradas Não Planejadas >= 10min = 45 minutos (quebra de máquina)

Tempo Disponível Ajustado = 720 - 60 = 660 minutos
Tempo de Operação = 660 - 30 - 45 = 585 minutos

Disponibilidade = (585 / 660) × 100 = 88.64%
```

---

### 2. CÁLCULO DE PERFORMANCE

```
Performance (%) = (Tempo Operacional Líquido / Tempo de Operação) × 100

Onde:
  Tempo Operacional Líquido = Quantidade Produzida / Velocidade Nominal

  OU (considerando pequenas paradas):

  Tempo Operacional Líquido = Tempo de Operação - Σ Pequenas Paradas

  Pequenas Paradas:
    - Paradas com duracao_minutos < 10 minutos
    - Afetam Performance, NÃO afetam Disponibilidade
```

**Exemplo 1 (por quantidade produzida):**
```
Quantidade Produzida = 35.000 unidades
Velocidade Nominal = 4.000 unidades/hora
Tempo de Operação = 585 minutos = 9.75 horas

Tempo Operacional Líquido = 35.000 / 4.000 = 8.75 horas

Performance = (8.75 / 9.75) × 100 = 89.74%
```

**Exemplo 2 (por pequenas paradas):**
```
Tempo de Operação = 585 minutos
Pequenas Paradas = 15 minutos (5 paradas de 3 min cada)

Tempo Operacional Líquido = 585 - 15 = 570 minutos = 9.5 horas

Performance = (9.5 / 9.75) × 100 = 97.44%
```

---

### 3. CÁLCULO DE QUALIDADE

```
Qualidade (%) = Qualidade_Unidades × Qualidade_Retrabalho

Onde:
  Qualidade_Unidades (%) = ((Qtd Produzida - Perdas) / Qtd Produzida) × 100

  Qualidade_Retrabalho (%) = ((Tempo Operação - Tempo Retrabalho) / Tempo Operação) × 100

  Qualidade Total = (Qualidade_Unidades / 100) × (Qualidade_Retrabalho / 100) × 100
```

**Exemplo:**
```
Quantidade Produzida = 35.000 unidades
Perdas (rejeitadas) = 500 unidades
Tempo de Operação = 9.75 horas
Tempo de Retrabalho = 0.5 horas

Qualidade_Unidades = ((35.000 - 500) / 35.000) × 100 = 98.57%
Qualidade_Retrabalho = ((9.75 - 0.5) / 9.75) × 100 = 94.87%

Qualidade Total = (98.57 / 100) × (94.87 / 100) × 100 = 93.50%
```

---

### 4. CÁLCULO DE OEE

```
OEE (%) = (Disponibilidade / 100) × (Performance / 100) × (Qualidade / 100) × 100
```

**Exemplo completo:**
```
Disponibilidade = 88.64%
Performance = 89.74%
Qualidade = 93.50%

OEE = (88.64 / 100) × (89.74 / 100) × (93.50 / 100) × 100
OEE = 0.8864 × 0.8974 × 0.9350 × 100
OEE = 74.35%
```

---

## 🔧 PLANO DE IMPLEMENTAÇÃO

### ETAPA 1: Criar Função de Cálculo OEE Completa

**Arquivo:** `src/services/localStorage/apontamento-oee.storage.ts`

**Nova função a ser criada:**

```typescript
/**
 * Calcula OEE completo integrando apontamentos de produção, qualidade e paradas
 *
 * @param apontamentoProducaoId - ID do apontamento de produção
 * @param loteId - ID do lote (para buscar paradas relacionadas)
 * @param tempoDisponivelTurno - Tempo disponível do turno em horas (padrão: 12)
 * @returns Cálculo completo do OEE com todos os componentes
 */
export function calcularOEECompleto(
  apontamentoProducaoId: string,
  loteId: string,
  tempoDisponivelTurno: number = 12
): CalculoOEE {
  // 1. Buscar apontamento de produção
  // 2. Buscar paradas do lote
  // 3. Buscar perdas e retrabalhos
  // 4. Separar paradas por tipo e duração
  // 5. Calcular Disponibilidade
  // 6. Calcular Performance
  // 7. Calcular Qualidade
  // 8. Calcular OEE final
}
```

**Detalhamento da implementação:**

```typescript
// Passo 1: Buscar dados
const apontamento = buscarApontamentoProducaoPorId(apontamentoProducaoId)
if (!apontamento) return OEE_VAZIO

const paradas = buscarParadasPorLote(loteId)
const perdas = buscarApontamentosPerdasPorProducao(apontamentoProducaoId)
const retrabalhos = buscarApontamentosRetrabalhoPorProducao(apontamentoProducaoId)

// Passo 2: Classificar paradas
const paradasEstrategicas = paradas.filter(p =>
  p.tipo_parada === 'ESTRATEGICA' && p.duracao_minutos !== null
)
const paradasGrandes = paradas.filter(p =>
  p.tipo_parada !== 'ESTRATEGICA' &&
  p.duracao_minutos !== null &&
  p.duracao_minutos >= 10
)
const pequenasParadas = paradas.filter(p =>
  p.duracao_minutos !== null &&
  p.duracao_minutos < 10
)

// Passo 3: Calcular tempos
const tempoDisponivelHoras = tempoDisponivelTurno
const tempoEstrategicoHoras = somarDuracoes(paradasEstrategicas) / 60
const tempoParadasGrandesHoras = somarDuracoes(paradasGrandes) / 60
const tempoPequenasParadasHoras = somarDuracoes(pequenasParadas) / 60

const tempoDisponivelAjustado = tempoDisponivelHoras - tempoEstrategicoHoras
const tempoOperacao = tempoDisponivelAjustado - tempoParadasGrandesHoras

// Passo 4: Calcular DISPONIBILIDADE
const disponibilidade = tempoDisponivelAjustado > 0
  ? (tempoOperacao / tempoDisponivelAjustado) * 100
  : 0

// Passo 5: Calcular PERFORMANCE
const tempoOperacionalLiquido = apontamento.velocidadeNominal > 0
  ? apontamento.quantidadeProduzida / apontamento.velocidadeNominal
  : tempoOperacao - tempoPequenasParadasHoras

const performance = tempoOperacao > 0
  ? (tempoOperacionalLiquido / tempoOperacao) * 100
  : 0

// Passo 6: Calcular QUALIDADE
const totalPerdas = perdas.reduce((sum, p) => sum + p.unidadesRejeitadas, 0)
const qualidadeUnidades = apontamento.quantidadeProduzida > 0
  ? ((apontamento.quantidadeProduzida - totalPerdas) / apontamento.quantidadeProduzida) * 100
  : 100

const totalTempoRetrabalho = retrabalhos.reduce((sum, r) => sum + r.tempoRetrabalho, 0)
const qualidadeRetrabalho = tempoOperacao > 0
  ? ((tempoOperacao - totalTempoRetrabalho) / tempoOperacao) * 100
  : 100

const qualidade = (qualidadeUnidades / 100) * (qualidadeRetrabalho / 100) * 100

// Passo 7: Calcular OEE
const oee = (disponibilidade / 100) * (performance / 100) * (qualidade / 100) * 100

// Passo 8: Calcular tempo valioso
const tempoValioso = (qualidade / 100) * tempoOperacionalLiquido

return {
  disponibilidade: arredondar(disponibilidade),
  performance: arredondar(performance),
  qualidade: arredondar(qualidade),
  oee: arredondar(oee),
  tempoOperacionalLiquido: arredondar(tempoOperacionalLiquido),
  tempoValioso: arredondar(tempoValioso)
}
```

**Função auxiliar:**

```typescript
function somarDuracoes(paradas: ParadaLocalStorage[]): number {
  return paradas.reduce((sum, p) => sum + (p.duracao_minutos || 0), 0)
}

function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100
}
```

---

### ETAPA 2: Implementar handleSalvarProducao

**Arquivo:** `src/pages/ApontamentoOEE.tsx` (linha 124)

**Objetivo:** Salvar apontamento de produção real no localStorage

```typescript
const handleSalvarProducao = () => {
  // 1. Validar campos obrigatórios
  if (!data || !turno || !linhaId || !skuCodigo || !lote) {
    toast({
      title: 'Campos obrigatórios',
      description: 'Preencha Data, Turno, Linha, SKU e Lote antes de apontar',
      variant: 'destructive'
    })
    return
  }

  if (!horaInicio || !horaFim || !quantidadeProduzida) {
    toast({
      title: 'Campos obrigatórios',
      description: 'Preencha Hora Início, Hora Fim e Quantidade Produzida',
      variant: 'destructive'
    })
    return
  }

  // 2. Buscar dados da linha e SKU
  const linha = buscarLinhaPorId(linhaId)
  const sku = buscarSKUPorCodigo(skuCodigo)

  if (!linha || !sku) {
    toast({
      title: 'Erro',
      description: 'Linha ou SKU não encontrado',
      variant: 'destructive'
    })
    return
  }

  // 3. Calcular tempo de operação
  const tempoOperacaoHoras = calcularDiferencaHoras(horaInicio, horaFim)

  // 4. Criar DTO
  const dto: CriarApontamentoProducaoDTO = {
    turno,
    linha: linha.nome,
    setor: linha.setor,
    ordemProducao,
    lote,
    sku: sku.codigo,
    produto: sku.descricao,
    velocidadeNominal: 4000, // Constante fornecida
    quantidadeProduzida: Number(quantidadeProduzida),
    tempoOperacao: tempoOperacaoHoras,
    tempoDisponivel: 12, // Constante fornecida (12 horas)
    dataApontamento: format(data, 'yyyy-MM-dd'),
    horaInicio: horaInicio + ':00',
    horaFim: horaFim + ':00',
    criadoPor: 1, // TODO: pegar do contexto de autenticação
    criadoPorNome: 'Emanuel Silva' // TODO: pegar do contexto
  }

  // 5. Salvar
  const apontamento = salvarApontamentoProducao(dto)

  // 6. Atualizar estado para recalcular OEE
  setApontamentoProducaoId(apontamento.id)

  // 7. Limpar formulário
  setHoraInicio('')
  setHoraFim('')
  setQuantidadeProduzida('')

  toast({
    title: 'Sucesso',
    description: `Produção de ${quantidadeProduzida} unidades registrada`
  })
}
```

**Função auxiliar:**

```typescript
/**
 * Calcula diferença em horas entre dois horários HH:MM
 */
function calcularDiferencaHoras(inicio: string, fim: string): number {
  const [hInicio, mInicio] = inicio.split(':').map(Number)
  const [hFim, mFim] = fim.split(':').map(Number)

  const minutosInicio = hInicio * 60 + mInicio
  let minutosFim = hFim * 60 + mFim

  // Se fim < início, passou da meia-noite
  if (minutosFim < minutosInicio) {
    minutosFim += 24 * 60
  }

  return (minutosFim - minutosInicio) / 60
}
```

---

### ETAPA 3: Implementar handleAdicionarQualidade

**Arquivo:** `src/pages/ApontamentoOEE.tsx` (linha 131)

```typescript
const handleAdicionarQualidade = () => {
  // 1. Validar se há apontamento de produção ativo
  if (!apontamentoProducaoId) {
    toast({
      title: 'Apontamento não encontrado',
      description: 'Registre a produção antes de apontar qualidade',
      variant: 'destructive'
    })
    return
  }

  // 2. Validar campos de perdas OU retrabalho
  const temPerdas = quantidadePerdas && motivoPerdas
  const temRetrabalho = quantidadeRetrabalho && motivoRetrabalho

  if (!temPerdas && !temRetrabalho) {
    toast({
      title: 'Campos obrigatórios',
      description: 'Preencha pelo menos um registro (Perdas ou Retrabalho)',
      variant: 'destructive'
    })
    return
  }

  // 3. Salvar Perdas
  if (temPerdas) {
    salvarApontamentoPerdas(
      apontamentoProducaoId,
      Number(quantidadePerdas),
      motivoPerdas,
      null,
      1, // TODO: pegar do contexto
      'Emanuel Silva' // TODO: pegar do contexto
    )
  }

  // 4. Salvar Retrabalho
  if (temRetrabalho) {
    // Assumir que tempo de retrabalho é proporcional à quantidade
    const tempoRetrabalhoHoras = Number(quantidadeRetrabalho) / 4000 // vel nominal

    salvarApontamentoRetrabalho(
      apontamentoProducaoId,
      Number(quantidadeRetrabalho),
      tempoRetrabalhoHoras,
      motivoRetrabalho,
      null,
      1, // TODO: pegar do contexto
      'Emanuel Silva' // TODO: pegar do contexto
    )
  }

  // 5. Forçar recalculo do OEE
  const novoOEE = calcularOEECompleto(apontamentoProducaoId, lote, 12)
  setOeeCalculado(novoOEE)

  // 6. Limpar formulário
  setQuantidadePerdas('')
  setMotivoPerdas('')
  setQuantidadeRetrabalho('')
  setMotivoRetrabalho('')

  toast({
    title: 'Sucesso',
    description: 'Registro de qualidade adicionado. OEE recalculado.'
  })
}
```

---

### ETAPA 4: Implementar handleRegistrarParada

**Arquivo:** `src/pages/ApontamentoOEE.tsx` (linha 138)

**Nota:** Este handler precisa de mais contexto. As paradas são registradas em outra tela?

**Abordagem sugerida:**

```typescript
const handleRegistrarParada = () => {
  // 1. Validar campos
  if (!tipoParada || !duracaoParada || !motivoNivel1) {
    toast({
      title: 'Campos obrigatórios',
      description: 'Preencha Tipo, Duração e Motivo (Nível 1) da parada',
      variant: 'destructive'
    })
    return
  }

  // 2. Mapear tipo de parada
  let tipoParadaEnum: TipoParada
  if (tipoParada === 'Planejado') tipoParadaEnum = 'PLANEJADA'
  else if (tipoParada === 'Não Planejado') tipoParadaEnum = 'NAO_PLANEJADA'
  else tipoParadaEnum = 'PLANEJADA' // Pequena Parada = Planejada?

  // 3. Criar parada mock (IDEAL: buscar código de parada real do banco)
  const codigoParadaMock = crypto.randomUUID()

  // 4. Calcular hora fim
  const agora = new Date()
  const horaAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}:00`

  // 5. Calcular hora início (retroativa)
  const duracaoMinutos = Number(duracaoParada)
  const inicioDate = new Date(agora.getTime() - duracaoMinutos * 60000)
  const horaInicioCalculada = `${String(inicioDate.getHours()).padStart(2, '0')}:${String(inicioDate.getMinutes()).padStart(2, '0')}:00`

  // 6. Criar parada
  const parada: ParadaLocalStorage = {
    id: crypto.randomUUID(),
    linha_id: linhaId,
    lote_id: lote || null,
    codigo_parada_id: codigoParadaMock,
    turno_id: '1', // TODO: mapear turno
    data_parada: format(data || new Date(), 'yyyy-MM-dd'),
    hora_inicio: horaInicioCalculada,
    hora_fim: horaAtual,
    duracao_minutos: duracaoMinutos,
    observacao: `${motivoNivel1} > ${motivoNivel2} > ${motivoNivel3}`.trim(),
    criado_por_operador: 1,
    conferido_por_supervisor: null,
    conferido_em: null,
    created_at: new Date().toISOString(),
    created_by: 1,
    updated_at: new Date().toISOString(),
    updated_by: null,
    deleted_at: null,
    deleted_by: null
  }

  // 7. Salvar
  salvarParada(parada)

  // 8. Recalcular OEE se há apontamento de produção
  if (apontamentoProducaoId && lote) {
    const novoOEE = calcularOEECompleto(apontamentoProducaoId, lote, 12)
    setOeeCalculado(novoOEE)
  }

  // 9. Limpar formulário
  setTipoParada('Planejado')
  setDuracaoParada('')
  setMotivoNivel1('')
  setMotivoNivel2('')
  setMotivoNivel3('')
  setMotivoNivel4('')
  setMotivoNivel5('')

  toast({
    title: 'Sucesso',
    description: `Parada de ${duracaoMinutos} minutos registrada. OEE recalculado.`
  })
}
```

---

### ETAPA 5: Carregar Histórico Real

**Arquivo:** `src/pages/ApontamentoOEE.tsx`

**Substituir histórico mockado (linhas 103-113) por:**

```typescript
// ==================== Histórico Real de Produção ====================
const [historicoProducao, setHistoricoProducao] = useState<Array<{
  dataHora: string
  inicio: string
  fim: string
  qtdProd: string
}>>([])

useEffect(() => {
  // Carregar histórico quando o lote mudar
  if (!lote) {
    setHistoricoProducao([])
    return
  }

  const apontamentos = buscarApontamentosProducaoPorLote(lote)

  const historico = apontamentos
    .sort((a, b) =>
      new Date(b.dataApontamento + ' ' + b.horaInicio).getTime() -
      new Date(a.dataApontamento + ' ' + a.horaInicio).getTime()
    )
    .slice(0, 10) // Últimos 10 registros
    .map(apt => ({
      dataHora: `${format(new Date(apt.dataApontamento), 'dd/MM/yyyy')} ${apt.horaInicio.substring(0, 5)}`,
      inicio: apt.horaInicio.substring(0, 5),
      fim: apt.horaFim?.substring(0, 5) || '-',
      qtdProd: apt.quantidadeProduzida.toLocaleString('pt-BR')
    }))

  setHistoricoProducao(historico)
}, [lote])
```

---

### ETAPA 6: Recalculo Automático de OEE

**Arquivo:** `src/pages/ApontamentoOEE.tsx` (linhas 116-121)

**Substituir useEffect existente:**

```typescript
// ==================== Recalcula OEE quando dados mudam ====================
useEffect(() => {
  if (apontamentoProducaoId && lote) {
    // Usar nova função que integra paradas
    const novoOEE = calcularOEECompleto(apontamentoProducaoId, lote, 12)
    setOeeCalculado(novoOEE)
  }
}, [apontamentoProducaoId, lote])

// Adicionar listener para mudanças no localStorage (se outro usuário adicionar dados)
useEffect(() => {
  const handleStorageChange = () => {
    if (apontamentoProducaoId && lote) {
      const novoOEE = calcularOEECompleto(apontamentoProducaoId, lote, 12)
      setOeeCalculado(novoOEE)
    }
  }

  window.addEventListener('storage', handleStorageChange)
  return () => window.removeEventListener('storage', handleStorageChange)
}, [apontamentoProducaoId, lote])
```

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Cálculo de OEE
- [ ] Criar função `calcularOEECompleto()` em `apontamento-oee.storage.ts`
- [ ] Criar função auxiliar `somarDuracoes()`
- [ ] Criar função auxiliar `arredondar()`
- [ ] Adicionar import `buscarParadasPorLote` do serviço de paradas
- [ ] Testar cálculo com dados mockados

### Fase 2: Handlers de Salvamento
- [ ] Implementar `handleSalvarProducao()` completo
- [ ] Criar função `calcularDiferencaHoras()`
- [ ] Implementar `handleAdicionarQualidade()` completo
- [ ] Implementar `handleRegistrarParada()` completo
- [ ] Adicionar validações de campos obrigatórios

### Fase 3: Histórico e Recalculo
- [ ] Substituir histórico mockado por histórico real
- [ ] Criar useEffect para carregar histórico por lote
- [ ] Atualizar useEffect de recalculo de OEE
- [ ] Adicionar listener de storage para sincronização

### Fase 4: Validação e UX
- [ ] Adicionar toast de erro para campos vazios
- [ ] Adicionar toast de sucesso com detalhes
- [ ] Limpar formulários após salvamento
- [ ] Garantir que OEE recalcula após cada operação

### Fase 5: Testes
- [ ] Testar fluxo completo: Produção → Qualidade → Parada → OEE
- [ ] Validar cálculo de OEE com diferentes cenários
- [ ] Testar persistência no localStorage
- [ ] Validar histórico dinâmico

---

## 🚨 PONTOS DE ATENÇÃO

### 1. Tipo de Parada no Formulário

O formulário atual tem 3 opções:
- "Planejado"
- "Não Planejado"
- "Pequena Parada"

Mas o sistema de paradas usa:
- `ESTRATEGICA`
- `PLANEJADA`
- `NAO_PLANEJADA`

**Decisão necessária:**
- "Pequena Parada" é uma PLANEJADA ou NAO_PLANEJADA?
- Ou devemos adicionar ESTRATEGICA no formulário?

---

### 2. Códigos de Parada Hierárquicos

O formulário tem 5 níveis de motivo, mas no salvamento atual estamos criando um `codigoParadaMock`.

**Recomendação:**
- Criar uma tabela de códigos de parada no localStorage
- Ou mapear os níveis para uma string concatenada temporariamente

---

### 3. Autenticação de Usuário

Várias funções precisam de `criadoPor` e `criadoPorNome`.

**Solução temporária:** usar valores fixos (id: 1, nome: "Emanuel Silva")
**Solução definitiva:** criar contexto de autenticação

---

### 4. Validação de Turno

O sistema tem 3 turnos, cada um com 12 horas.

**Pergunta:**
- O tempo disponível é sempre 12h independente do turno?
- Ou devemos buscar da tabela de turnos?

---

## 💡 MELHORIAS FUTURAS (Pós-MVP)

1. **Contexto de Sessão:**
   - Criar contexto para manter lote/linha/data/turno selecionados
   - Evitar recarregar filtros toda vez

2. **Validação em Tempo Real:**
   - Mostrar OEE estimado conforme usuário digita

3. **Gráfico de Paradas:**
   - Adicionar visualização de Pareto de paradas na sidebar

4. **Export de Dados:**
   - Permitir exportar apontamentos para Excel/CSV

5. **Sincronização Multi-Usuário:**
   - Implementar polling ou WebSocket para sincronizar dados em tempo real

---

## 📚 REFERÊNCIAS

- **Documentação do Projeto:** `docs/project/05-Metodologia-Calculo.md` (fórmulas de OEE)
- **Especificação Técnica:** `docs/project/09-Validacao-Tecnica-SicFar.md` (gráficos e requisitos)
- **Glossário:** `docs/project/04-Glossario-Termos.md` (termos do domínio)
- **Tipos TypeScript:** `src/types/apontamento-oee.ts` e `src/types/parada.ts`

---

## ✅ RESUMO EXECUTIVO

### O que precisa ser feito:

1. **Criar função `calcularOEECompleto()`** que integra paradas no cálculo
2. **Implementar 3 handlers** (Produção, Qualidade, Paradas) com persistência real
3. **Substituir histórico mockado** por dados do localStorage
4. **Adicionar validações** de campos obrigatórios
5. **Implementar recalculo automático** de OEE após cada operação

### Tempo estimado:
- Fase 1 (Cálculo): **2-3 horas**
- Fase 2 (Handlers): **3-4 horas**
- Fase 3 (Histórico): **1-2 horas**
- Fase 4 (Validação): **1-2 horas**
- Fase 5 (Testes): **2-3 horas**

**Total: 9-14 horas**

### Prioridade:
1. ⚡ **Crítico:** Função `calcularOEECompleto()` (base de tudo)
2. ⚡ **Crítico:** Handler `handleSalvarProducao()` (fluxo principal)
3. 🔴 **Alto:** Handler `handleAdicionarQualidade()`
4. 🟡 **Médio:** Handler `handleRegistrarParada()`
5. 🟡 **Médio:** Histórico real
6. 🟢 **Baixo:** Melhorias de UX

---

**Documento criado em:** 16/11/2025
**Versão:** 1.0
**Autor:** Claude Code (Análise de ApontamentoOEE.tsx)
