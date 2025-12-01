# Mapeamento Frontend → Backend - Sistema OEE SicFar

## Visão Geral

Este documento mapeia os dados do componente `ApontamentoOEE.tsx` para as tabelas do Supabase, mostrando como os dados do localStorage devem ser migrados para o banco de dados.

## 1. Cabeçalho do Apontamento

### Estado do Frontend (ApontamentoOEE.tsx)

```typescript
// Linhas 194-222
const [data, setData] = useState<Date | undefined>(new Date())
const [turno, setTurno] = useState<Turno>('1º Turno')
const [turnoId, setTurnoId] = useState<string>('')
const [turnoCodigo, setTurnoCodigo] = useState<string>('')
const [turnoNome, setTurnoNome] = useState<string>('')
const [turnoHoraInicial, setTurnoHoraInicial] = useState<string>('')
const [turnoHoraFinal, setTurnoHoraFinal] = useState<string>('')
const [linhaId, setLinhaId] = useState<string>('')
const [skuCodigo, setSkuCodigo] = useState<string>('')
const [ordemProducao, setOrdemProducao] = useState<string>('')
const [lote, setLote] = useState<string>('')
const [dossie, setDossie] = useState<string>('')
```

### Mapeamento para Banco de Dados

| Campo Frontend | Tabela Supabase | Campo Supabase | Observação |
|----------------|-----------------|----------------|------------|
| `data` | `tblote` | `data_producao` | Converter Date para DATE |
| `turnoId` | `tblote` | `turno_id` | FK para `tbturno` |
| `linhaId` | `tblote` | `linhaproducao_id` | FK para `tblinhaproducao` |
| `skuCodigo` | `tblote` | `sku_id` | Buscar ID do SKU por código |
| `ordemProducao` | `tblote` | `ordem_producao_totvs` | Número da OP |
| `lote` | `tblote` | `numero_lote` | Número do lote |
| `dossie` | `tblote` | `dossie` | Número do dossiê |

## 2. Apontamento de Produção

### Estado do Frontend (ApontamentoOEE.tsx)

```typescript
// Linhas 94-101
type LinhaApontamentoProducao = {
  id: string
  horaInicio: string
  horaFim: string
  quantidadeProduzida: string
  apontamentoId?: string
  editavel?: boolean
}

// Linhas 104-118
interface RegistroProducao {
  id: string
  data: string
  turno: Turno
  linhaId: string
  linhaNome: string
  skuCodigo: string
  ordemProducao: string
  lote: string
  dossie: string
  horaInicio: string
  horaFim: string
  quantidadeProduzida: number
  dataHoraRegistro: string
}
```

### Mapeamento para Banco de Dados

| Campo Frontend | Tabela Supabase | Campo Supabase | Observação |
|----------------|-----------------|----------------|------------|
| `id` | `tbapontamento_producao` | `apontamento_producao_id` | UUID gerado pelo Supabase |
| `data` | `tbapontamento_producao` | `data_apontamento` | Formato YYYY-MM-DD |
| `linhaId` | `tbapontamento_producao` | `linhaproducao_id` | FK |
| `lote` | `tbapontamento_producao` | `lote_id` | Buscar ID do lote |
| `horaInicio` | `tbapontamento_producao` | `hora_inicio` | Formato HH:MM:SS |
| `horaFim` | `tbapontamento_producao` | `hora_fim` | Formato HH:MM:SS |
| `quantidadeProduzida` | `tbapontamento_producao` | `quantidade_produzida` | INTEGER |
| `dataHoraRegistro` | `tbapontamento_producao` | `created_at` | TIMESTAMP automático |

### Função de Salvamento (Linha 771)

```typescript
const dto: CriarApontamentoProducaoDTO = {
  turno,
  linha: linha.nome,
  setor: linha.setor,
  ordemProducao: ordemProducao || 'S/N',
  lote,
  sku: codigoSKU,
  produto: descricaoSKU,
  velocidadeNominal: 4000, // ⚠️ DEVE vir de tbsku_velocidade_nominal
  quantidadeProduzida: Number(linhaApontamento.quantidadeProduzida),
  tempoOperacao: tempoOperacaoHoras,
  tempoDisponivel: 12,
  dataApontamento: format(data, 'yyyy-MM-dd'),
  horaInicio: linhaApontamento.horaInicio.includes(':')
    ? linhaApontamento.horaInicio + ':00'
    : linhaApontamento.horaInicio,
  horaFim: linhaApontamento.horaFim.includes(':')
    ? linhaApontamento.horaFim + ':00'
    : linhaApontamento.horaFim,
  criadoPor: 1,
  criadoPorNome: 'Emanuel Silva'
}
```

### Query Supabase para Inserção

```typescript
const { data: apontamento, error } = await supabase
  .from('tbapontamento_producao')
  .insert({
    lote_id: loteId, // Buscar do tblote
    linhaproducao_id: linhaId,
    sku_id: skuId, // Buscar do tbsku
    turno_id: turnoId,
    data_apontamento: dataApontamento,
    hora_inicio: horaInicio,
    hora_fim: horaFim,
    quantidade_produzida: quantidadeProduzida,
    velocidade_nominal: velocidadeNominal, // Buscar de tbsku_velocidade_nominal
    tempo_operacao: tempoOperacao,
    tempo_disponivel: tempoDisponivel,
    origem_dados: 'MANUAL',
    created_by: userId
  })
  .select()
  .single()
```

## 3. Apontamento de Paradas

### Estado do Frontend (ApontamentoOEE.tsx)

```typescript
// Linhas 121-135
interface RegistroParada {
  id: string
  data: string
  turno: Turno
  linhaId: string
  linhaNome: string
  horaInicio: string
  horaFim: string
  duracao: number // em minutos
  tipoParada: string
  codigoParada: string
  descricaoParada: string
  observacoes: string
  dataHoraRegistro: string
}
```

### Mapeamento para Banco de Dados

| Campo Frontend | Tabela Supabase | Campo Supabase | Observação |
|----------------|-----------------|----------------|------------|
| `id` | `tbapontamento_parada` | `apontamento_parada_id` | UUID gerado |
| `data` | `tbapontamento_parada` | `data_parada` | DATE |
| `linhaId` | `tbapontamento_parada` | `linhaproducao_id` | FK |
| `codigoParada` | `tbapontamento_parada` | `codigo_parada_id` | Buscar ID do código |
| `horaInicio` | `tbapontamento_parada` | `hora_inicio` | TIME |
| `horaFim` | `tbapontamento_parada` | `hora_fim` | TIME (NULL se em andamento) |
| `duracao` | `tbapontamento_parada` | `duracao_minutos` | Calculado automaticamente |
| `observacoes` | `tbapontamento_parada` | `observacao` | TEXT |
| `dataHoraRegistro` | `tbapontamento_parada` | `created_at` | TIMESTAMP automático |

### Query Supabase para Inserção

```typescript
const { data: parada, error } = await supabase
  .from('tbapontamento_parada')
  .insert({
    linhaproducao_id: linhaId,
    lote_id: loteId, // Pode ser NULL
    codigo_parada_id: codigoParadaId,
    turno_id: turnoId,
    data_parada: dataParada,
    hora_inicio: horaInicio,
    hora_fim: horaFim, // NULL se parada em andamento
    observacao: observacoes,
    status: horaFim ? 'FINALIZADA' : 'EM_ANDAMENTO',
    created_by: userId
  })
  .select()
  .single()
```

## 4. Apontamento de Qualidade (Perdas e Retrabalho)

### Estado do Frontend (ApontamentoOEE.tsx)

```typescript
// Linhas 138-149
interface RegistroQualidade {
  id: string
  data: string
  turno: Turno
  linhaId: string
  linhaNome: string
  apontamentoProducaoId: string
  tipo: 'PERDAS' | 'RETRABALHO'
  quantidade: number
  motivo: string
  dataHoraRegistro: string
}

// Linhas 251-256
const [quantidadePerdas, setQuantidadePerdas] = useState<string>('')
const [motivoPerdas, setMotivoPerdas] = useState<string>('')
const [quantidadeRetrabalho, setQuantidadeRetrabalho] = useState<string>('')
const [motivoRetrabalho, setMotivoRetrabalho] = useState<string>('')
```

### Mapeamento para Perdas (Refugo)

| Campo Frontend | Tabela Supabase | Campo Supabase | Observação |
|----------------|-----------------|----------------|------------|
| `id` | `tbapontamento_perdas` | `apontamento_perdas_id` | UUID gerado |
| `data` | `tbapontamento_perdas` | `data_apontamento` | DATE |
| `linhaId` | `tbapontamento_perdas` | `linhaproducao_id` | FK |
| `apontamentoProducaoId` | `tbapontamento_perdas` | `lote_id` | FK para lote |
| `quantidade` | `tbapontamento_perdas` | `unidades_refugadas` | INTEGER |
| `motivo` | `tbapontamento_perdas` | `motivo` | TEXT |
| `tipo` | `tbapontamento_perdas` | `tipo_perda` | 'REFUGO', 'DESVIO', 'BLOQUEIO' |

### Query Supabase para Perdas

```typescript
const { data: perdas, error } = await supabase
  .from('tbapontamento_perdas')
  .insert({
    lote_id: loteId,
    linhaproducao_id: linhaId,
    sku_id: skuId,
    turno_id: turnoId,
    data_apontamento: dataApontamento,
    tipo_perda: 'REFUGO',
    unidades_refugadas: quantidadePerdas,
    motivo: motivoPerdas,
    origem_dados: 'MANUAL',
    totvs_integrado: false,
    created_by: userId
  })
  .select()
  .single()
```

### Mapeamento para Retrabalho

| Campo Frontend | Tabela Supabase | Campo Supabase | Observação |
|----------------|-----------------|----------------|------------|
| `id` | `tbapontamento_retrabalho` | `apontamento_retrabalho_id` | UUID gerado |
| `data` | `tbapontamento_retrabalho` | `data_apontamento` | DATE |
| `linhaId` | `tbapontamento_retrabalho` | `linhaproducao_id` | FK |
| `apontamentoProducaoId` | `tbapontamento_retrabalho` | `lote_id` | FK para lote |
| `quantidade` | `tbapontamento_retrabalho` | `tempo_retrabalho_minutos` | INTEGER (minutos) |
| `motivo` | `tbapontamento_retrabalho` | `motivo` | TEXT |

### Query Supabase para Retrabalho

```typescript
const { data: retrabalho, error } = await supabase
  .from('tbapontamento_retrabalho')
  .insert({
    lote_id: loteId,
    linhaproducao_id: linhaId,
    sku_id: skuId,
    turno_id: turnoId,
    data_apontamento: dataApontamento,
    tempo_retrabalho_minutos: quantidadeRetrabalho,
    motivo: motivoRetrabalho,
    created_by: userId
  })
  .select()
  .single()
```

## 5. Cálculo de OEE

### Estado do Frontend (ApontamentoOEE.tsx)

```typescript
// Linhas 270-277
const [oeeCalculado, setOeeCalculado] = useState<CalculoOEE>({
  disponibilidade: 0,
  performance: 0,
  qualidade: 0,
  oee: 0,
  tempoOperacionalLiquido: 0,
  tempoValioso: 0
})
```

### Mapeamento para Banco de Dados

| Campo Frontend | Tabela Supabase | Campo Supabase | Observação |
|----------------|-----------------|----------------|------------|
| `disponibilidade` | `tboee_calculado` | `disponibilidade` | NUMERIC(5,2) |
| `performance` | `tboee_calculado` | `performance` | NUMERIC(5,2) |
| `qualidade` | `tboee_calculado` | `qualidade` | NUMERIC(5,2) |
| `oee` | `tboee_calculado` | `oee` | NUMERIC(5,2) |
| `tempoOperacionalLiquido` | `tboee_calculado` | `tempo_operacional_liquido` | NUMERIC(10,4) horas |
| `tempoValioso` | `tboee_calculado` | `tempo_valioso` | NUMERIC(10,4) horas |

### Query Supabase para Salvar OEE Calculado

```typescript
const { data: oee, error } = await supabase
  .from('tboee_calculado')
  .insert({
    linhaproducao_id: linhaId,
    lote_id: loteId,
    sku_id: skuId,
    turno_id: turnoId,
    data_referencia: dataReferencia,
    tipo_periodo: 'TURNO',
    tempo_calendario: tempoCalendario,
    tempo_disponivel: tempoDisponivel,
    tempo_operacao: tempoOperacao,
    tempo_operacional_liquido: tempoOperacionalLiquido,
    tempo_valioso: tempoValioso,
    tempo_paradas_estrategicas: tempoParadasEstrategicas,
    tempo_paradas_planejadas: tempoParadasPlanejadas,
    tempo_paradas_nao_planejadas: tempoParadasNaoPlanejadas,
    tempo_retrabalho: tempoRetrabalho,
    unidades_produzidas: unidadesProduzidas,
    unidades_boas: unidadesBoas,
    unidades_refugadas: unidadesRefugadas,
    velocidade_nominal: velocidadeNominal,
    disponibilidade: disponibilidade,
    performance: performance,
    qualidade: qualidade,
    oee: oee,
    meta_oee: metaOee,
    created_by: userId
  })
  .select()
  .single()
```

## 6. Lotes de Produção (Modal de Lotes)

### Estado do Frontend (ApontamentoOEE.tsx)

```typescript
// Linhas 152-172
interface LoteProducao {
  id: string
  numeroLote: string
  data: string
  horaInicial: string
  horaFinal: string
  quantidadePerdas: number
  quantidadeRetrabalho: number
  quantidadeProduzida: number
}

interface DadosLote {
  numeroLote: string
  data: string
  horaInicial: string
  horaFinal: string
  quantidadePerdas: number
  quantidadeRetrabalho: number
  quantidadeProduzida: number
}
```

### Mapeamento para Banco de Dados

| Campo Frontend | Tabela Supabase | Campo Supabase | Observação |
|----------------|-----------------|----------------|------------|
| `id` | `tblote` | `lote_id` | SERIAL PRIMARY KEY |
| `numeroLote` | `tblote` | `numero_lote` | VARCHAR(50) UNIQUE |
| `data` | `tblote` | `data_producao` | DATE |
| `horaInicial` | `tblote` | `hora_inicio` | TIME |
| `horaFinal` | `tblote` | `hora_fim` | TIME |
| `quantidadeProduzida` | `tblote` | `producao_atual` | INTEGER |
| `quantidadePerdas` | `tblote` | `unidades_refugo` | INTEGER (calculado) |
| `quantidadeRetrabalho` | `tblote` | `tempo_retrabalho_minutos` | INTEGER (calculado) |

### Query Supabase para Criar Lote

```typescript
const { data: lote, error } = await supabase
  .from('tblote')
  .insert({
    numero_lote: numeroLote,
    linhaproducao_id: linhaId,
    sku_id: skuId,
    turno_id: turnoId,
    data_producao: data,
    hora_inicio: horaInicial,
    hora_fim: horaFinal,
    producao_inicial: 0,
    producao_atual: quantidadeProduzida,
    status: 'EM_ANDAMENTO',
    ordem_producao_totvs: ordemProducao,
    dossie: dossie,
    created_by: userId
  })
  .select()
  .single()
```


