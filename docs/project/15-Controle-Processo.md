# Atividade 15 - Controle em Processo (IPC)

## Objetivo
Definir a estrutura para registro e monitoramento de Controles em Processo (In-Process Controls - IPC) no sistema OEE SicFar, garantindo rastreabilidade de parâmetros críticos de qualidade durante a produção e sua integração com os indicadores de eficiência operacional.

## Justificativa
Controles em Processo são análises e verificações realizadas durante a fabricação para assegurar que o produto atenda às especificações de qualidade. Na indústria farmacêutica, IPCs são **obrigatórios** e regulamentados por BPF. Falhas em IPCs podem resultar em:
- Bloqueio ou descarte de lote
- Retrabalho ou reprocesso
- Parada de produção para ajustes
- Desvios de qualidade
- Impacto direto nos indicadores de OEE (Disponibilidade, Performance, Qualidade)

O sistema OEE SicFar deve permitir o registro contemporâneo de IPCs, vinculando-os aos lotes e linhas de produção, e identificando automaticamente impactos no OEE quando resultados estiverem fora de especificação.

## Status do Levantamento

⚠️ **ATENÇÃO**: Este documento é um **esboço inicial** e requer levantamento detalhado com a área de Qualidade.

### Próximos Passos
1. **Reunião com Qualidade** para mapear:
   - Quais controles são realizados em cada etapa (Preparação, Envase, Embalagem)
   - Especificações de cada controle (limite superior, inferior, tolerâncias)
   - Frequência de execução (contínua, por lote, por turno, aleatória)
   - Métodos de medição (manual, automático, laboratorial)
   - Responsáveis pela execução (operador, qualidade, laboratório)
2. **Validação com Consultor Rafael Gusmão**
3. **Definição de integrações** (LIMS, TOTVS, equipamentos de medição)

## Contexto Regulatório

### Normativas Aplicáveis
- **RDC 301/2019 (ANVISA)**: Controles durante o processo de fabricação
- **21 CFR Part 211.110 (FDA)**: Sampling and testing of in-process materials and drug products
- **ICH Q7**: In-process controls
- **Farmacopeia Brasileira**: Métodos analíticos e especificações

### Princípios ALCOA+ Aplicáveis

#### A - Atribuível
- Quem executou o controle?
- Quem revisou o resultado?
- Quem aprovou (quando necessário)?

#### C - Contemporâneo
- Registro imediato após execução do controle
- Não é permitido registro retroativo

#### O - Original
- Dados registrados diretamente no sistema
- Integração com equipamentos (quando possível)

#### A - Exato
- Valores precisos (ex: pH 7.35, não "aproximadamente 7.3")
- Unidades de medida sempre especificadas

#### + Completo
- Todos os controles obrigatórios registrados
- Resultados fora de especificação devem gerar desvio automaticamente

## Definição de Controle em Processo

### Conceito
Análise ou verificação realizada durante uma ou mais etapas do processo de fabricação para monitorar e controlar o desempenho do processo e/ou a qualidade do produto ou material intermediário.

### Objetivos
- **Prevenir** desvios antes que o lote seja finalizado
- **Detectar** problemas em tempo real
- **Garantir** conformidade com especificações
- **Reduzir** refugo e retrabalho
- **Proteger** o paciente/consumidor final

## Tipos de Controles em Processo

### 1. Controles Físicos
- **Peso**: Peso médio de unidades
- **Volume**: Volume de envase (ML)
- **Dimensões**: Comprimento, largura, altura de embalagens
- **Integridade**: Teste de vazamento, selagem
- **Aspecto Visual**: Cor, limpidez, presença de partículas

### 2. Controles Químicos
- **pH**: Acidez ou alcalinidade da solução
- **Concentração**: Teor de princípio ativo
- **Osmolaridade**: Para soluções parenterais
- **Densidade**: Densidade relativa

### 3. Controles Microbiológicos
- **Esterilidade**: Ausência de contaminação microbiana (para produtos estéreis)
- **Contagem de bioburden**: Antes da esterilização
- **Testes de endotoxinas bacterianas**: Para parenterais

### 4. Controles de Rotulagem/Embalagem
- **Código de barras**: Legibilidade e precisão
- **Dados de impressão**: Lote, validade, data de fabricação
- **Integridade da embalagem secundária**: Ausência de danos

### 5. Controles de Processo
- **Temperatura**: Temperatura de envase, armazenamento
- **Pressão**: Pressão de envase (para produtos pressurizados)
- **Tempo de ciclo**: Tempo de esterilização, tempo de CIP/SIP
- **Velocidade de linha**: Velocidade de envase/embalagem

## Controles em Processo por Setor (Esboço)

### SPEP - Soluções Parenterais de Embalagem Plástica

#### Etapa: Preparação
- **pH** (manual, pHmetro) - Especificação: 6.8-7.2
- **Volume preparado** (manual, medidor de nível) - Especificação: conforme batch record
- **Aspecto visual** (manual, inspeção) - Especificação: límpido, incolor, isento de partículas

#### Etapa: Envase
- **Volume envasado** (automático, CLP da envasadora) - Especificação: ±2% do volume nominal
- **Teste de integridade** (automático, máquina de selagem) - Especificação: 100% das unidades aprovadas
- **Inspeção visual** (manual/automático, inspeção eletrônica) - Especificação: ausência de partículas visíveis

#### Etapa: Embalagem
- **Integridade da embalagem secundária** (manual, inspeção) - Especificação: sem danos
- **Legibilidade de rotulagem** (manual, inspeção) - Especificação: 100% legível
- **Código de barras** (automático, leitor de código de barras) - Especificação: 100% de leitura

### SPPV - Soluções Parenterais de Pequeno Volume (Vidros)

#### Etapa: Preparação
- **pH** (manual, pHmetro) - Especificação: conforme fórmula
- **Osmolaridade** (laboratorial) - Especificação: conforme especificação
- **Aspecto visual** (manual) - Especificação: conforme padrão

#### Etapa: Envase
- **Volume envasado** (automático, CLP) - Especificação: ±2% do volume nominal
- **Integridade de selagem** (automático) - Especificação: 100% aprovadas
- **Inspeção eletrônica** (automático) - Especificação: ausência de partículas, vazamento, selagem inadequada

#### Etapa: Embalagem
- **Rotulagem** (manual/automático) - Especificação: conforme padrão
- **Embalagem secundária** (manual) - Especificação: sem danos

### Líquidos - Líquidos Orais

#### Etapa: Preparação
- **pH** (manual, pHmetro) - Especificação: conforme fórmula
- **Densidade** (manual, densímetro) - Especificação: conforme especificação
- **Aspecto visual** (manual) - Especificação: conforme padrão

#### Etapa: Envase
- **Volume envasado** (automático, CLP) - Especificação: ±2% do volume nominal
- **Selagem** (automático) - Especificação: 100% aprovadas

#### Etapa: Embalagem
- **Rotulagem** (manual) - Especificação: conforme padrão
- **Inserção de bula/cartucho** (automático) - Especificação: 100% das unidades

### CPHD - Concentrado Polieletrolítico para Hemodiálise

#### Etapa: Preparação
- **pH** (manual, pHmetro) - Especificação: conforme fórmula (ácido ou básico)
- **Concentração de eletrólitos** (laboratorial) - Especificação: conforme especificação
- **Aspecto visual** (manual) - Especificação: conforme padrão

#### Etapa: Envase
- **Volume envasado** (manual, medidor) - Especificação: ±1% do volume nominal
- **Integridade da embalagem** (manual) - Especificação: sem vazamentos

#### Etapa: Embalagem
- **Rotulagem** (manual) - Especificação: conforme padrão
- **Lacre de segurança** (manual) - Especificação: intacto

**Nota**: Os controles acima são **exemplos** e devem ser validados com Qualidade. Especificações reais podem variar por produto/SKU.

## Impacto de Controles em Processo no OEE

### Resultado Dentro de Especificação ✅
- Produção segue normalmente
- Sem impacto no OEE

### Resultado Fora de Especificação (OOS - Out of Specification) ❌

#### Cenário 1: Ajuste de Processo
- Linha é parada para ajuste
- Código de parada: "Ajuste Operacional" ou "Desvio de Processo"
- **Impacto no OEE**: Reduz Disponibilidade (tempo de parada)

**Exemplo**:
```
Controle: pH da solução
Resultado: 7.8 (Especificação: 6.8-7.2)
Ação: Parar envase, ajustar pH
Parada: 1 hora para correção
Impacto OEE: Disponibilidade -1h
```

#### Cenário 2: Refugo de Produto
- Produto já envasado está fora de especificação
- Lote ou parte do lote deve ser descartado
- **Impacto no OEE**: Reduz Qualidade (unidades refugadas)

**Exemplo**:
```
Controle: Volume envasado
Resultado: 520 ML (Especificação: 500 ±2% = 490-510 ML)
Ação: Descartar 2.000 unidades fora de especificação
Impacto OEE: Qualidade -2.000 unidades (refugo)
```

#### Cenário 3: Retrabalho
- Produto pode ser reprocessado (ex: re-rotulagem)
- Tempo gasto em retrabalho
- **Impacto no OEE**: Reduz Qualidade (tempo de retrabalho)

**Exemplo**:
```
Controle: Legibilidade de rotulagem
Resultado: Rótulos ilegíveis em 500 unidades
Ação: Retrabalho de rotulagem
Tempo: 2 horas
Impacto OEE: Qualidade -2h de retrabalho
```

#### Cenário 4: Abertura de Desvio
- Resultado OOS obriga abertura de Evento de Desvio
- Desvio vinculado ao controle em processo
- Sistema sugere abertura automática de desvio

## Estrutura de Dados

### Interface: `TipoControleProcesso`

```typescript
export interface TipoControleProcesso {
  /** ID único do tipo de controle */
  id: string

  /** Código do controle (ex: IPC-pH-001) */
  codigo: string

  /** Nome do controle */
  nome: string

  /** Descrição detalhada */
  descricao: string

  /** Etapa do processo onde é realizado */
  etapa: 'preparacao' | 'envase' | 'embalagem'

  /** Tipo de controle */
  tipo: 'fisico' | 'quimico' | 'microbiologico' | 'rotulagem' | 'processo'

  /** Método de execução */
  metodo: 'manual' | 'automatico' | 'laboratorial'

  /** Unidade de medida (ex: "pH", "mL", "°C", "%") */
  unidade_medida: string

  /** Limite inferior de especificação */
  limite_inferior?: number | null

  /** Limite superior de especificação */
  limite_superior?: number | null

  /** Valor nominal (centro da especificação) */
  valor_nominal?: number | null

  /** Frequência de execução */
  frequencia: 'continua' | 'por_lote' | 'por_turno' | 'amostragem'

  /** Setor aplicável */
  setor_id?: string | null

  /** Linha aplicável (null = todas) */
  linha_id?: string | null

  /** POP de referência */
  pop_referencia?: string | null

  /** Ativo? */
  ativo: boolean

  /** Criado em */
  criado_em: string

  /** Atualizado em */
  atualizado_em: string
}
```

### Interface: `RegistroControleProcesso`

```typescript
export interface RegistroControleProcesso {
  /** ID único do registro */
  id: string

  /** ID do tipo de controle */
  tipo_controle_id: string

  /** ID do lote */
  lote_id: string

  /** ID da linha */
  linha_id: string

  /** ID da OP (opcional) */
  op?: string | null

  /** ID do turno */
  turno_id: string

  /** Data e hora da execução (ISO 8601) */
  data_hora_execucao: string

  /** Valor medido */
  valor_medido: number | string

  /** Resultado dentro da especificação? */
  conforme: boolean

  /** Motivo de não conformidade (se conforme = false) */
  motivo_nao_conformidade?: string | null

  /** Ação tomada (se não conforme) */
  acao_tomada?: string | null

  /** ID do desvio vinculado (se aberto) */
  desvio_id?: string | null

  /** ID do operador que executou */
  executado_por: number

  /** ID do treinamento vigente (rastreabilidade) */
  treinamento_id?: string | null

  /** Observações */
  observacoes?: string | null

  /** Anexos (fotos, relatórios) */
  anexos?: string[]

  /** Criado em */
  criado_em: string
}
```

### Interface: `ImpactoControleProcessoOEE`

```typescript
export interface ImpactoControleProcessoOEE {
  /** ID do registro */
  id: string

  /** ID do registro de controle */
  registro_controle_id: string

  /** Tipo de impacto */
  tipo_impacto: 'parada' | 'refugo' | 'retrabalho'

  /** ID da parada vinculada (se aplicável) */
  parada_id?: string | null

  /** Quantidade de refugo (unidades) */
  quantidade_refugo?: number | null

  /** Tempo de retrabalho (minutos) */
  tempo_retrabalho?: number | null

  /** Tempo de parada para ajuste (minutos) */
  tempo_parada?: number | null

  /** Impacto calculado no OEE (%) */
  impacto_oee?: number | null

  /** Observações */
  observacoes?: string | null

  /** Criado em */
  criado_em: string
}
```

## Funcionalidades do Sistema

### 1. Cadastro de Tipos de Controle

**Perfil**: Qualidade

**Objetivo**: Cadastrar os controles obrigatórios de cada linha/setor

**Campos**: Conforme interface `TipoControleProcesso`

### 2. Registro de Controle em Processo

**Perfil**: Operador, Qualidade ou Sistema (automático)

**Fluxo**:
1. Operador acessa tela de registro de controle
2. Sistema exibe controles pendentes para o lote/turno
3. Operador insere valor medido
4. Sistema valida se está dentro da especificação
5. Se **CONFORME**: Registro salvo, produção continua
6. Se **NÃO CONFORME**:
   - Sistema alerta o operador
   - Solicita ação tomada
   - Sugere abertura de desvio
   - Permite vincular parada/refugo/retrabalho

### 3. Dashboard de Controles em Processo

**Visualizações**:
- Gráfico de controle (control chart) por tipo de IPC
- Lista de controles não conformes no período
- Taxa de conformidade por linha/setor
- Gráfico de Pareto de não conformidades

### 4. Alertas e Notificações

| Evento | Destinatários | Urgência |
|--------|---------------|----------|
| Controle Não Conforme | Supervisor + Qualidade | 🟠 ALTA |
| Controle Crítico Não Conforme | Gerência + Qualidade | 🔴 URGENTE |
| Controle Pendente de Registro | Operador + Supervisor | 🟡 NORMAL |

## Integração com Módulos Existentes

### Módulo de Operação
- Ao concluir etapa de produção (Preparação, Envase, Embalagem), sistema verifica se há controles pendentes
- Se houver controles obrigatórios não registrados, sistema bloqueia conclusão da etapa

### Módulo de Qualidade
- Controle não conforme gera automaticamente sugestão de abertura de desvio
- Desvio vinculado ao registro de controle

### Módulo de OEE
- Controles não conformes que geram parada/refugo/retrabalho impactam cálculo do OEE
- Rastreabilidade completa do impacto

## Integrações Externas

### LIMS (Laboratory Information Management System)
- Se a Farmace utilizar LIMS para controles laboratoriais, integração é recomendada
- Resultados de análises migram automaticamente para SicFar

### Equipamentos de Medição Automáticos
- pHmetros digitais com conexão
- Balanças eletrônicas
- Medidores de volume
- Leitores de código de barras
- Integração via API ou protocolo (ex: Modbus, OPC UA)

### TOTVS
- Resultados de controles podem ser sincronizados com TOTVS
- Bloqueio de lote por não conformidade em controle

## Levantamento de Requisitos Pendente

### Informações a Coletar com Qualidade

1. **Lista Completa de Controles**:
   - Quais controles são obrigatórios?
   - Para quais produtos/SKUs?
   - Em quais etapas?

2. **Especificações**:
   - Limite inferior, superior, valor nominal
   - Tolerâncias aceitáveis
   - Critérios de aprovação/rejeição

3. **Frequências**:
   - Contínua (100% das unidades)?
   - Por lote (uma vez por lote)?
   - Por turno?
   - Amostragem (ex: 10 unidades a cada hora)?

4. **Métodos**:
   - Manual?
   - Automático (integrado)?
   - Laboratorial (fora de linha)?

5. **Responsáveis**:
   - Operador de produção?
   - Técnico de qualidade?
   - Laboratório?

6. **Treinamentos Requeridos**:
   - Quais POPs devem estar vigentes para executar cada controle?

7. **Ações em Caso de Não Conformidade**:
   - Parar linha?
   - Ajustar processo?
   - Bloquear lote?
   - Abertura de desvio obrigatória?

## Implementação Recomendada

### Fase 1: Levantamento (PENDENTE)
- Reunião com Qualidade
- Mapeamento completo de controles por setor/linha
- Validação com Consultor Rafael Gusmão

### Fase 2: Cadastro de Controles
- Cadastro de tipos de controles no sistema
- Definição de especificações
- Vinculação com linhas/etapas

### Fase 3: Registro Manual
- Telas de registro de controles
- Validação de conformidade
- Alertas de não conformidade

### Fase 4: Integração Automática
- Integração com equipamentos de medição
- Integração com LIMS (se aplicável)
- Sincronização com TOTVS

### Fase 5: Dashboard e Análises
- Gráficos de controle
- Relatórios de não conformidades
- KPIs de qualidade

## Permissões de Acesso

| Ação | Operador | Supervisor | Qualidade | Gerência | Admin |
|------|----------|------------|-----------|----------|-------|
| Cadastrar Tipo de Controle | ❌ | ❌ | ✅ | ✅ | ✅ |
| Registrar Controle | ✅ | ✅ | ✅ | ✅ | ✅ |
| Visualizar Controles | ✅ (da própria linha) | ✅ (do setor) | ✅ (todos) | ✅ (todos) | ✅ |
| Editar Registro de Controle | ❌ | ❌ | ✅ (com justificativa) | ✅ | ✅ |
| Excluir Registro | ❌ | ❌ | ❌ | ❌ | ✅ (apenas Admin) |

## Indicadores de Performance de Controles

### KPIs Sugeridos

#### 1. Taxa de Conformidade
- **Fórmula**: (Controles conformes / Total de controles) × 100
- **Objetivo**: Manter acima de 95%

#### 2. Controles Não Conformes por Tipo
- **Análise de Pareto**: Identificar controles com maior índice de falha
- **Objetivo**: Focar melhorias nos controles mais problemáticos

#### 3. Impacto de Controles Não Conformes no OEE
- **Fórmula**: (Perda de OEE por IPCs / OEE teórico) × 100
- **Objetivo**: Reduzir ao longo do tempo

## Validação Necessária

### Stakeholders para Aprovação
1. **Qualidade** - Definir controles obrigatórios, especificações, frequências
2. **Produção** - Validar viabilidade operacional de registro contemporâneo
3. **Engenharia** - Avaliar integrações com equipamentos
4. **Consultor Rafael Gusmão** - Validação técnica final e conformidade regulatória
5. **TI** - Viabilidade de integrações (LIMS, equipamentos, TOTVS)

### Documentos a Gerar (Após Levantamento)
- Matriz de Controles em Processo (por setor/linha/etapa)
- Procedimento de Registro de Controles em Processo no SicFar
- Manual de Usuário - Módulo de Controles em Processo
- Especificações de Integração com Equipamentos

## Conclusão

O módulo de Controles em Processo é **essencial** para garantir qualidade do produto e conformidade regulatória. A integração com o sistema OEE permite:
- Rastreabilidade completa de parâmetros críticos de qualidade
- Identificação imediata de não conformidades
- Ação rápida para minimizar impacto no OEE
- Dados estruturados para análise de tendências e melhorias

**Status Atual**: ⚠️ LEVANTAMENTO DE REQUISITOS PENDENTE

**Prioridade de Implementação**: 🟡 MÉDIA (após levantamento completo com Qualidade)

**Próximo Passo**: Agendar reunião com Qualidade para mapeamento completo de controles.
