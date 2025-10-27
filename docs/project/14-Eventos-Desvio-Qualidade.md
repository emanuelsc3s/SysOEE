# Atividade 14 - Eventos de Desvio de Qualidade

## Objetivo
Estabelecer o processo de abertura, investigação e tratamento de Eventos de Desvio de Qualidade no sistema OEE SicFar, integrando-os com os indicadores de produção (refugo, retrabalho, paradas) e garantindo conformidade com as Boas Práticas de Fabricação (BPF).

## Justificativa
Desvios de qualidade são ocorrências não planejadas que se afastam de procedimentos, especificações ou padrões estabelecidos. Na indústria farmacêutica, todo desvio deve ser:
- **Detectado imediatamente**
- **Registrado contemporaneamente**
- **Investigado sistematicamente**
- **Tratado com ações corretivas/preventivas (CAPA)**
- **Rastreável para auditorias**

A não gestão adequada de desvios pode resultar em:
- Recolhimento de lotes (recall)
- Sanções regulatórias (ANVISA, FDA)
- Perda de produtos e receita
- Risco à saúde pública
- Dano à reputação da empresa

## Contexto Regulatório

### Normativas Aplicáveis
- **RDC 301/2019 (ANVISA)**: Requisitos de BPF para medicamentos
- **21 CFR Part 211 (FDA)**: Current Good Manufacturing Practice
- **ICH Q7**: Good Manufacturing Practice Guide for APIs
- **ICH Q9**: Quality Risk Management
- **ICH Q10**: Pharmaceutical Quality System

### Princípios ALCOA+ Aplicáveis

#### A - Atribuível
- Quem detectou o desvio?
- Quem registrou?
- Quem investigou?
- Quem aprovou o tratamento?

#### L - Legível
- Descrição clara e detalhada do desvio
- Sem ambiguidades ou abreviações não padronizadas

#### C - Contemporâneo
- Registro **imediato** após detecção
- Investigação iniciada dentro de prazo definido (ex: 24h)
- Histórico cronológico de todas as ações

#### O - Original
- Registro original no sistema (não reconstrução posterior)
- Evidências anexadas (fotos, relatórios de CLP, laudos)

#### A - Exato
- Dados precisos sobre quantidade afetada, horário, lote, linha

#### + Completo
- Todos os dados relevantes registrados
- Causa raiz identificada
- CAPA definido e implementado

#### + Consistente
- Numeração sequencial de desvios
- Classificação padronizada
- Seguir fluxo estabelecido

#### + Durável
- Armazenamento seguro por período regulatório (mínimo 5 anos)
- Backup e recuperação garantidos

#### + Disponível
- Acessível para auditorias internas e externas
- Relatórios gerenciais disponíveis

## Definição de Desvio de Qualidade

### Conceito
Qualquer afastamento de:
- Procedimentos Operacionais Padrão (POPs)
- Especificações de produto
- Parâmetros de processo
- Requisitos regulatórios
- Padrões de qualidade estabelecidos

### Exemplos na Farmace
- Resultado fora de especificação em controle em processo (pH, volume, aspecto)
- Falha de equipamento que impacta qualidade do produto
- Contaminação microbiológica
- Erro de rotulagem ou embalagem
- Desvio de temperatura em área controlada
- Falha no sistema HVAC
- Uso de material não liberado
- Falta de assinatura em documento crítico
- Quebra de integridade de embalagem primária

## Tipos de Desvio

### Classificação por Criticidade

#### Crítico 🔴
- **Impacto direto na segurança do paciente**
- **Impacto regulatório grave**
- Exemplos:
  - Contaminação microbiológica em produto estéril
  - Erro de dosagem de princípio ativo
  - Mistura de lotes
  - Falha de esterilidade
- **Ação**: Investigação imediata, bloqueio de lote, CAPA obrigatório
- **Prazo de investigação**: 24 horas

#### Maior 🟠
- **Impacto potencial na qualidade do produto**
- **Pode afetar eficácia ou estabilidade**
- Exemplos:
  - pH fora de especificação
  - Volume fora de especificação
  - Falha em teste de integridade
  - Temperatura fora do range em área limpa
- **Ação**: Investigação dentro de 72 horas, avaliação de impacto no lote
- **Prazo de investigação**: 72 horas

#### Menor 🟡
- **Impacto mínimo na qualidade**
- **Não afeta produto ou lote**
- Exemplos:
  - Atraso na liberação de análise (sem impacto no produto)
  - Falta de assinatura em documento não crítico
  - Desvio de procedimento sem impacto mensurável
- **Ação**: Investigação dentro de 5 dias úteis, correção pontual
- **Prazo de investigação**: 5 dias úteis

### Classificação por Origem

#### Desvio de Processo
- Relacionado à execução de etapas produtivas
- Exemplos: Falha de equipamento, erro operacional, contaminação

#### Desvio de Produto
- Relacionado ao produto final ou intermediário
- Exemplos: Aspecto fora do padrão, resultado OOS (Out of Specification)

#### Desvio de Documentação
- Relacionado a registros e procedimentos
- Exemplos: Falta de assinatura, erro de transcrição, documento não atualizado

#### Desvio de Sistema
- Relacionado a utilidades ou sistemas de suporte
- Exemplos: Falha de HVAC, falha de água WFI, falta de energia

## Workflow de Desvio

```
┌──────────────────────────────────────┐
│ 1. DETECÇÃO                          │
│ - Operador, Qualidade ou Sistema     │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ 2. ABERTURA CONTEMPORÂNEA            │
│ - Registro imediato no SicFar        │
│ - Numeração automática               │
│ - Status: ABERTO                     │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ 3. NOTIFICAÇÃO AUTOMÁTICA            │
│ - Qualidade                          │
│ - Supervisor da linha                │
│ - Gerência (se crítico)              │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ 4. CLASSIFICAÇÃO INICIAL             │
│ - Qualidade define criticidade       │
│ - Define prazo de investigação       │
│ - Status: CLASSIFICADO               │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ 5. CONTENÇÃO IMEDIATA                │
│ - Bloquear lote (se necessário)      │
│ - Isolar produto afetado             │
│ - Parar produção (se crítico)        │
│ - Status: CONTIDO                    │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ 6. INVESTIGAÇÃO                      │
│ - Coletar evidências                 │
│ - Análise de causa raiz (5 Porquês,  │
│   Ishikawa, etc.)                    │
│ - Status: EM INVESTIGAÇÃO            │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ 7. AVALIAÇÃO DE IMPACTO              │
│ - Impacto no lote                    │
│ - Impacto em outros lotes            │
│ - Impacto no OEE                     │
│ - Status: AVALIADO                   │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ 8. AÇÃO CORRETIVA/PREVENTIVA (CAPA)  │
│ - Definir ações de curto prazo       │
│ - Definir ações de longo prazo       │
│ - Definir responsáveis e prazos      │
│ - Status: CAPA DEFINIDO              │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ 9. APROVAÇÃO                         │
│ - Qualidade aprova investigação      │
│ - Qualidade aprova CAPA              │
│ - Status: APROVADO                   │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ 10. IMPLEMENTAÇÃO CAPA               │
│ - Executar ações definidas           │
│ - Verificar eficácia                 │
│ - Status: EM IMPLEMENTAÇÃO           │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ 11. VERIFICAÇÃO DE EFICÁCIA          │
│ - Qualidade verifica se problema     │
│   foi eliminado                      │
│ - Status: EM VERIFICAÇÃO             │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ 12. ENCERRAMENTO                     │
│ - Qualidade encerra desvio           │
│ - Arquivamento de evidências         │
│ - Status: ENCERRADO                  │
└──────────────────────────────────────┘
```

## Integração com Indicadores de OEE

### Impacto de Desvios no OEE

#### 1. Desvio → Parada de Produção
- Desvio crítico pode exigir parada imediata da linha
- Sistema deve permitir vincular parada ao desvio
- Código de parada específico: "Parada por Desvio de Qualidade"
- **Impacto no OEE**: Reduz Disponibilidade

**Exemplo**:
```
Desvio: DEV-2025-00123
Descrição: pH fora de especificação (Lote XYZ)
Ação imediata: Parar envase até ajuste de processo
Parada registrada: P5.3 - Ajuste Operacional
Duração: 2 horas
Impacto: Disponibilidade -2h
```

#### 2. Desvio → Refugo (Produto Descartado)
- Produto não conforme deve ser descartado
- Quantidade registrada no sistema
- **Impacto no OEE**: Reduz Qualidade

**Exemplo**:
```
Desvio: DEV-2025-00124
Descrição: Volume fora de especificação (Lote ABC)
Quantidade afetada: 5.000 unidades
Ação: Descarte do produto
Impacto: Qualidade -5.000 unidades (refugo)
```

#### 3. Desvio → Retrabalho
- Produto pode ser reprocessado/reembalado
- Tempo gasto em retrabalho registrado
- **Impacto no OEE**: Reduz Qualidade (tempo de retrabalho)

**Exemplo**:
```
Desvio: DEV-2025-00125
Descrição: Erro de rotulagem (Lote DEF)
Quantidade afetada: 10.000 unidades
Ação: Retrabalho de rotulagem
Tempo de retrabalho: 8 horas
Impacto: Qualidade -8h de retrabalho
```

#### 4. Desvio → Bloqueio de Lote (Quarentena)
- Lote aguardando decisão de Qualidade
- Não impacta OEE diretamente, mas afeta disponibilidade de produto
- Sistema deve sinalizar lote bloqueado no Kanban

### Vinculação Desvio × OEE

O sistema deve permitir:
1. **Abrir desvio a partir de um apontamento de parada**
   - Operador registra parada → Sistema pergunta se é devido a desvio
2. **Abrir desvio a partir de apontamento de refugo**
   - Operador registra perda → Sistema pergunta se é devido a desvio
3. **Vincular desvio existente a parada/refugo**
   - Desvio já aberto → Parada posterior vinculada ao mesmo desvio
4. **Dashboard de desvios por linha/setor**
   - Quantidade de desvios por período
   - Impacto total no OEE por desvio

## Estrutura de Dados

### Interface: `Desvio`

```typescript
export interface Desvio {
  /** ID único do desvio (gerado automaticamente) */
  id: string

  /** Número sequencial (ex: DEV-2025-00123) */
  numero: string

  /** Título resumido do desvio */
  titulo: string

  /** Descrição detalhada */
  descricao: string

  /** Criticidade */
  criticidade: 'critico' | 'maior' | 'menor'

  /** Origem do desvio */
  origem: 'processo' | 'produto' | 'documentacao' | 'sistema'

  /** Status atual */
  status:
    | 'aberto'
    | 'classificado'
    | 'contido'
    | 'em_investigacao'
    | 'avaliado'
    | 'capa_definido'
    | 'aprovado'
    | 'em_implementacao'
    | 'em_verificacao'
    | 'encerrado'

  /** ID da linha onde ocorreu */
  linha_id: string

  /** ID do lote afetado (se aplicável) */
  lote_id?: string | null

  /** Número da OP afetada (se aplicável) */
  op?: string | null

  /** Data e hora da detecção (ISO 8601) */
  data_deteccao: string

  /** ID do usuário que detectou */
  detectado_por: number

  /** Data e hora da abertura no sistema */
  data_abertura: string

  /** ID do usuário que abriu o desvio */
  aberto_por: number

  /** ID do responsável pela investigação */
  responsavel_investigacao?: number | null

  /** Prazo para conclusão da investigação */
  prazo_investigacao?: string | null

  /** Causa raiz identificada */
  causa_raiz?: string | null

  /** Ações corretivas imediatas */
  acoes_imediatas?: string | null

  /** CAPA definido */
  capa?: string | null

  /** ID do usuário que aprovou */
  aprovado_por?: number | null

  /** Data de aprovação */
  data_aprovacao?: string | null

  /** Data de encerramento */
  data_encerramento?: string | null

  /** ID do usuário que encerrou */
  encerrado_por?: number | null

  /** Anexos (caminhos de arquivo ou URLs) */
  anexos?: string[]

  /** Tags para categorização */
  tags?: string[]

  /** Criado em */
  criado_em: string

  /** Atualizado em */
  atualizado_em: string
}
```

### Interface: `DesvioImpactoOEE`

```typescript
export interface DesvioImpactoOEE {
  /** ID do registro */
  id: string

  /** ID do desvio */
  desvio_id: string

  /** Tipo de impacto */
  tipo_impacto: 'parada' | 'refugo' | 'retrabalho'

  /** ID da parada vinculada (se aplicável) */
  parada_id?: string | null

  /** Quantidade de refugo (unidades) */
  quantidade_refugo?: number | null

  /** Tempo de retrabalho (minutos) */
  tempo_retrabalho?: number | null

  /** Impacto calculado no OEE (%) */
  impacto_oee?: number | null

  /** Observações */
  observacoes?: string | null

  /** Criado em */
  criado_em: string
}
```

### Interface: `CAPAItem`

```typescript
export interface CAPAItem {
  /** ID do item */
  id: string

  /** ID do desvio */
  desvio_id: string

  /** Tipo de ação */
  tipo: 'corretiva' | 'preventiva'

  /** Descrição da ação */
  descricao: string

  /** Responsável pela execução */
  responsavel_id: number

  /** Prazo para execução */
  prazo: string

  /** Status */
  status: 'pendente' | 'em_andamento' | 'concluido' | 'atrasado'

  /** Data de conclusão */
  data_conclusao?: string | null

  /** Evidências de conclusão */
  evidencias?: string | null

  /** Criado em */
  criado_em: string

  /** Atualizado em */
  atualizado_em: string
}
```

## Funcionalidades do Sistema

### 1. Abertura de Desvio

#### Tela/Modal: `ModalAbrirDesvio.tsx`

**Campos obrigatórios**:
- Título resumido (máx 100 caracteres)
- Descrição detalhada (campo livre)
- Linha de produção (dropdown)
- Data e hora da detecção (pré-preenchido com momento atual)
- Lote afetado (opcional, se houver)
- OP afetada (opcional, se houver)

**Campos opcionais**:
- Anexos (fotos, PDFs, relatórios)
- Tags para categorização

**Comportamento**:
- Ao salvar, sistema gera número sequencial (DEV-AAAA-NNNNN)
- Status inicial: "ABERTO"
- Criticidade inicial: null (aguarda classificação por Qualidade)
- Notificação automática enviada para Qualidade + Supervisor da linha

### 2. Classificação de Desvio

**Perfil**: Apenas Qualidade pode classificar

**Campos**:
- Criticidade: Crítico | Maior | Menor
- Origem: Processo | Produto | Documentação | Sistema
- Responsável pela investigação (usuário)
- Prazo de investigação (calculado automaticamente baseado na criticidade)

**Comportamento**:
- Após classificação, status muda para "CLASSIFICADO"
- E-mail/notificação enviada para responsável pela investigação

### 3. Investigação de Desvio

**Perfil**: Responsável designado + Qualidade

**Campos**:
- Causa raiz identificada (campo livre)
- Ações imediatas tomadas (campo livre)
- Evidências coletadas (anexos)
- Status muda para "EM INVESTIGAÇÃO"

**Ferramentas disponíveis**:
- Template de 5 Porquês
- Template de Diagrama de Ishikawa
- Vinculação com paradas/refugos relacionados

### 4. Definição de CAPA

**Perfil**: Responsável pela investigação + Qualidade

**Ações**:
- Adicionar itens de CAPA (ação corretiva ou preventiva)
- Para cada item:
  - Descrição da ação
  - Responsável
  - Prazo
- Status muda para "CAPA DEFINIDO"

### 5. Aprovação

**Perfil**: Apenas Qualidade (Coordenador ou Gerente)

**Validações**:
- Investigação completa?
- Causa raiz identificada?
- CAPA adequado?

**Comportamento**:
- Se aprovado: Status muda para "APROVADO"
- Se rejeitado: Volta para "EM INVESTIGAÇÃO" com comentários

### 6. Dashboard de Desvios

**Visualizações**:
- Lista de desvios abertos (status ≠ encerrado)
- Gráfico de Pareto de desvios por linha
- Gráfico de Pareto de desvios por causa raiz
- Gráfico de pizza: Criticidade dos desvios
- Gráfico de linha: Evolução de desvios ao longo do tempo
- Impacto total de desvios no OEE (%)

**Filtros**:
- Por linha
- Por setor
- Por período
- Por status
- Por criticidade

### 7. Relatórios

#### Relatório de Desvios por Período
- Lista todos os desvios abertos em um período
- Informações: Número, Título, Linha, Criticidade, Status, Data de abertura

#### Relatório de CAPA Pendentes
- Lista todos os itens de CAPA com status "Pendente" ou "Atrasado"
- Ordenado por prazo

#### Relatório de Impacto de Desvios no OEE
- Quantifica impacto de desvios em Disponibilidade, Performance e Qualidade
- Por linha/setor

## Notificações e Alertas

### Notificações Automáticas

| Evento | Destinatários | Urgência |
|--------|---------------|----------|
| Desvio Crítico Aberto | Qualidade + Gerência + Supervisor | 🔴 URGENTE |
| Desvio Maior Aberto | Qualidade + Supervisor | 🟠 ALTA |
| Desvio Menor Aberto | Qualidade | 🟡 NORMAL |
| Prazo de Investigação Vencendo (24h) | Responsável + Qualidade | 🟠 ALTA |
| Prazo de Investigação Vencido | Responsável + Qualidade + Gerência | 🔴 URGENTE |
| CAPA Vencendo (3 dias) | Responsável | 🟡 NORMAL |
| CAPA Vencido | Responsável + Qualidade | 🔴 URGENTE |
| Desvio Aprovado | Responsável pela investigação | 🟢 INFO |
| Desvio Rejeitado | Responsável pela investigação | 🟠 ALTA |

## Integração com TOTVS

### Dados a Sincronizar

#### TOTVS → SicFar
- **Perdas registradas no TOTVS** → Verificar se há desvio associado
- **Bloqueios de lote no TOTVS** → Sincronizar com status de desvio
- **Resultado de análises (CQ)** → Se OOS, sugerir abertura de desvio

#### SicFar → TOTVS
- **Desvio com refugo** → Registrar perda no TOTVS
- **Desvio com bloqueio de lote** → Bloquear lote no TOTVS
- **Desvio encerrado com liberação** → Liberar lote no TOTVS (se aplicável)

**Nota**: Detalhes de integração devem ser definidos com equipe de TI + TOTVS.

## Permissões de Acesso

| Ação | Operador | Supervisor | Qualidade | Gerência | Admin |
|------|----------|------------|-----------|----------|-------|
| Abrir Desvio | ✅ | ✅ | ✅ | ✅ | ✅ |
| Visualizar Desvios | ✅ (da própria linha) | ✅ (do setor) | ✅ (todos) | ✅ (todos) | ✅ |
| Classificar Desvio | ❌ | ❌ | ✅ | ✅ | ✅ |
| Investigar Desvio | ❌ | ✅ (se responsável) | ✅ | ✅ | ✅ |
| Definir CAPA | ❌ | ✅ (se responsável) | ✅ | ✅ | ✅ |
| Aprovar Desvio | ❌ | ❌ | ✅ | ✅ | ✅ |
| Encerrar Desvio | ❌ | ❌ | ✅ | ✅ | ✅ |
| Excluir Desvio | ❌ | ❌ | ❌ | ❌ | ✅ (apenas Admin) |

## Indicadores de Performance de Desvios

### KPIs Sugeridos

#### 1. Número de Desvios por 1.000 Unidades Produzidas
- **Fórmula**: (Total de desvios / Total de unidades produzidas) × 1.000
- **Objetivo**: Reduzir ao longo do tempo

#### 2. Tempo Médio de Resolução de Desvios
- **Fórmula**: Soma(Data encerramento - Data abertura) / Total de desvios
- **Objetivo**: Reduzir tempo de resolução

#### 3. % de Desvios com CAPA Atrasado
- **Fórmula**: (CAPA atrasados / Total de CAPA) × 100
- **Objetivo**: Manter abaixo de 5%

#### 4. % de Desvios Recorrentes
- **Definição**: Desvios com mesma causa raiz em período de 6 meses
- **Objetivo**: Reduzir (indica ineficácia de CAPA)

#### 5. Impacto de Desvios no OEE (%)
- **Fórmula**: (Perda de OEE por desvios / OEE teórico) × 100
- **Objetivo**: Reduzir ao longo do tempo

## Implementação Recomendada

### Fase 1: MVP de Desvios
- Abertura de desvio
- Classificação por Qualidade
- Vinculação com paradas/refugos
- Lista de desvios abertos

### Fase 2: Investigação e CAPA
- Investigação estruturada
- Definição de CAPA
- Aprovação de desvios

### Fase 3: Dashboard e Relatórios
- Dashboard de desvios
- Relatórios gerenciais
- KPIs de desvios

### Fase 4: Integração TOTVS
- Sincronização de perdas
- Sincronização de bloqueios
- Integração com resultados de CQ

## Validação Necessária

### Stakeholders para Aprovação
1. **Qualidade** - Definir workflow completo, criticidades, prazos
2. **Produção** - Validar integração com apontamentos de parada/refugo
3. **Consultor Rafael Gusmão** - Validação técnica final e conformidade regulatória
4. **TI** - Viabilidade de integração com TOTVS

### Documentos a Gerar
- Procedimento de Abertura e Investigação de Desvios no SicFar
- Matriz de Criticidade de Desvios
- Fluxograma de Workflow de Desvios
- Manual de Usuário - Módulo de Desvios

## Considerações Importantes

### Período de Transição
- Durante implantação, desvios podem ser registrados em paralelo (SicFar + Sistema legado)
- Migração de desvios abertos do sistema legado para SicFar

### Treinamento Obrigatório
- Todos os usuários que abrirão desvios devem ser treinados
- Treinamento específico para Qualidade (classificação, aprovação)

### Auditoria
- Todos os desvios e CAPA devem estar disponíveis para auditorias
- Sistema deve permitir exportação em PDF de desvios completos

## Conclusão

O módulo de Eventos de Desvio de Qualidade é **crítico** para conformidade regulatória e gestão de riscos na indústria farmacêutica. A integração com o sistema OEE permite:
- Rastreabilidade completa de desvios e seu impacto na produção
- Tomada de decisão baseada em dados
- Redução de desvios recorrentes através de CAPA eficazes
- Conformidade com ALCOA+ e BPF

**Prioridade de Implementação**: 🔴 ALTA (requisito regulatório + impacto direto no OEE)
