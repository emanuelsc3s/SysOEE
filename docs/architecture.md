# Sistema OEE para SicFar - Arquitetura Backend

**Versão:** 0.1
**Data:** 2025-10-25
**Autor:** Winston (Architect Agent)
**Status:** Em Desenvolvimento

---

## Índice

1. [Introduction](#1-introduction)
2. [Data Models](#2-data-models)
3. [Database Schema](#3-database-schema)
4. [Core Workflows](#4-core-workflows)

---

## 1. Introduction

Este documento detalha a arquitetura backend do **Sistema OEE (Overall Equipment Effectiveness) para SicFar**, um sistema de monitoramento de eficiência operacional para a indústria farmacêutica Farmace. O sistema calculará e monitorará a eficiência global de 37 linhas de produção através de três componentes principais: Disponibilidade, Performance e Qualidade.

Este documento serve como blueprint arquitetural definitivo para desenvolvimento orientado por IA, garantindo consistência e aderência aos padrões escolhidos, especialmente considerando os requisitos regulatórios da indústria farmacêutica (BPF e princípios ALCOA+).

### Relacionamento com Arquitetura Frontend

Como este projeto inclui interfaces significativas para usuários (operadores, supervisores, gestores), um documento separado de Arquitetura Frontend detalhará o design específico de UI/UX. As escolhas de tecnologia documentadas na seção "Tech Stack" deste documento são definitivas para todo o projeto, incluindo componentes frontend.

### Starter Template ou Projeto Existente

**Decisão Confirmada: Supabase como Backend-as-a-Service**

O projeto utilizará **Supabase** como plataforma backend, que fornece:
- PostgreSQL gerenciado com APIs REST/GraphQL auto-geradas
- Sistema de autenticação e autorização integrado
- Real-time subscriptions para atualizações em tempo real
- Row Level Security (RLS) para controle de acesso granular
- Storage para arquivos (se necessário)

**Implicações Arquiteturais:**
- ✅ Infraestrutura base já fornecida (auth, APIs, database)
- ✅ Foco do desenvolvimento em: modelagem de dados, business logic, integrações
- ✅ RLS do Supabase auxilia implementação de princípios ALCOA+ (rastreabilidade, atribuibilidade)
- ⚠️ Integrações com CLPs e TOTVS requerão Edge Functions ou serviços externos

**Foco Inicial:**
1. Modelagem de dados (entidades mestres e transacionais)
2. Cadastros (linhas, SKUs, códigos de paradas, velocidades nominais)
3. Apontamentos (paradas, produção, qualidade)

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-10-25 | 0.1 | Documento inicial de arquitetura backend | Winston (Architect Agent) |

---

## 2. Data Models

### Visão Geral da Modelagem

Baseado nos requisitos do projeto, identificamos **15 entidades principais** divididas em três categorias:

**Cadastros (Entidades Mestres):**
1. Setor
2. Linha de Produção
3. SKU (Produto)
4. Insumo
5. Lote de Insumo
6. Velocidade Nominal
7. Código de Parada
8. Turno
9. Usuário/Operador
10. Meta OEE

**Transações (Dados Operacionais):**
11. Lote de Produção
12. Apontamento de Parada
13. Apontamento de Produção
14. Apontamento de Qualidade

**Cache e Auditoria (ALCOA+):**
15. OEE Calculado
16. Audit Log

### Diagrama de Relacionamentos (ER Conceitual)

```
SETOR (1) ─────< (N) LINHA_PRODUCAO
                        │
                        ├─────< (N) VELOCIDADE_NOMINAL >───── (N) SKU
                        │
                        ├─────< (N) CODIGO_PARADA
                        │
                        ├─────< (N) META_OEE
                        │
                        └─────< (N) LOTE_PRODUCAO >───── (N) SKU
                                     │             └───── (N) TURNO
                                     │
                                     ├─────< (N) APONTAMENTO_PARADA >───── CODIGO_PARADA
                                     │                                └───── TURNO
                                     │                                └───── USUARIO (operador)
                                     │                                └───── USUARIO (supervisor)
                                     │
                                     ├─────< (N) APONTAMENTO_PRODUCAO >───── TURNO
                                     │                                  └───── USUARIO
                                     │
                                     └─────< (N) APONTAMENTO_QUALIDADE >───── TURNO
                                                                          └───── USUARIO

USUARIO ─────< (N) AUDIT_LOG

INSUMO (1) ─────< (N) LOTE_INSUMO
```

### Entidades Detalhadas

#### 1. Setor

**Propósito:** Agrupa linhas de produção por área produtiva da Farmace. Cada setor tem características e processos específicos.

**Key Attributes:**
- `id`: UUID - Identificador único
- `codigo`: STRING(10) - Código do setor (ex: "SPEP", "SPPV", "CPHD", "LIQUIDOS")
- `nome`: STRING(100) - Nome completo
- `descricao`: TEXT - Descrição detalhada
- `ativo`: BOOLEAN
- `created_at`, `created_by`, `updated_at`, `updated_by` - Auditoria ALCOA+

**Relationships:**
- Um Setor possui muitas Linhas de Produção (1:N)

#### 2. Linha de Produção

**Propósito:** Representa cada linha de envase/embalagem. MVP: 37 linhas. Cada linha tem seu "book de paradas" e pode produzir múltiplos SKUs.

**Key Attributes:**
- `id`: UUID
- `setor_id`: UUID (FK → Setor)
- `codigo`: STRING(20) - Código único (ex: "SPEP-ENV-A")
- `nome`: STRING(100)
- `tipo`: ENUM - "ENVASE" ou "EMBALAGEM"
- `localizacao`: STRING(200)
- `tem_clp`: BOOLEAN
- `tipo_clp`: STRING(50) - "Bottelpack", "Pró Maquia", "Bausch Strobbel"
- `meta_oee_padrao`: DECIMAL(5,2) - Meta padrão de OEE (%)
- `ativo`: BOOLEAN
- Campos de auditoria

**Relationships:**
- Pertence a um Setor (N:1)
- Possui muitas Velocidades Nominais (1:N)
- Possui muitos Códigos de Parada (1:N)
- Possui muitos Lotes de Produção (1:N)
- Possui muitas Metas OEE (1:N)

#### 3. SKU (Produto)

**Propósito:** Produtos fabricados. Cada SKU tem velocidade nominal diferente por linha.

**Key Attributes:**
- `id`: UUID
- `codigo_totvs`: STRING(50) UNIQUE - Código no ERP
- `nome`: STRING(200)
- `descricao`: TEXT
- `unidade_medida`: STRING(10)
- `categoria`: STRING(50)
- `ativo`: BOOLEAN
- `totvs_sincronizado_em`: TIMESTAMP
- Campos de auditoria

**Relationships:**
- Possui muitas Velocidades Nominais (1:N)
- Possui muitos Lotes de Produção (1:N)

#### 4. Insumo

**Propósito:** Insumos (matérias-primas, embalagens) utilizados na produção.

**Key Attributes:**
- `id`: UUID
- `codigo_totvs`: STRING(50) UNIQUE
- `nome`: STRING(200)
- `descricao`: TEXT
- `unidade_medida`: STRING(10)
- `categoria`: STRING(50)
- `ativo`: BOOLEAN
- `totvs_sincronizado_em`: TIMESTAMP
- Campos de auditoria

**Relationships:**
- Possui muitos Lotes de Insumo (1:N)

#### 5. Lote de Insumo

**Propósito:** Lotes de insumos recebidos de Compras (sincronizados do TOTVS).

**Key Attributes:**
- `id`: UUID
- `numero_lote`: STRING(50) UNIQUE
- `insumo_id`: UUID (FK)
- `quantidade`: DECIMAL(12,3)
- `data_fabricacao`, `data_validade`: DATE
- `fornecedor`: STRING(200)
- `status`: ENUM - "EM_ESTOQUE", "EM_USO", "ESGOTADO", "BLOQUEADO"
- `totvs_sincronizado_em`: TIMESTAMP
- Campos de auditoria

#### 6. Velocidade Nominal

**Propósito:** **CRÍTICO** - Velocidade de produção (Und/h) de cada SKU em cada linha. Essencial para cálculo de Performance.

**Key Attributes:**
- `id`: UUID
- `linha_id`, `sku_id`: UUID (FK)
- `velocidade_nominal`: DECIMAL(10,2) - Unidades por hora
- `data_inicio_vigencia`, `data_fim_vigencia`: DATE - Histórico
- `observacao`: TEXT
- `aprovado_por`: UUID (FK → Usuario) - Aprovação Diretoria
- `aprovado_em`: TIMESTAMP
- Campos de auditoria

**Constraints:**
- UNIQUE (linha_id, sku_id, data_inicio_vigencia)
- CHECK (data_fim_vigencia >= data_inicio_vigencia)

**Observação:** Sistema usa velocidade vigente na data do lote para cálculos retroativos.

#### 7. Código de Parada

**Propósito:** Códigos de paradas com hierarquia de 5 níveis (TPM - 16 Grandes Perdas). Cada linha tem seu "book" específico.

**Key Attributes:**
- `id`: UUID
- `linha_id`: UUID (FK) - NULL = parada global
- `codigo`: STRING(20)
- `descricao`: STRING(200)
- `nivel_1_classe`: STRING(50) - "Planejada", "Não Planejada", "Estratégica"
- `nivel_2_grande_parada`: STRING(100) - "Manutenção", "Falta de Insumo"
- `nivel_3_apontamento`: STRING(100)
- `nivel_4_grupo`: STRING(100) - "Mecânica", "Elétrica"
- `nivel_5_detalhamento`: STRING(200)
- `tipo_parada`: ENUM - "ESTRATEGICA", "PLANEJADA", "NAO_PLANEJADA"
- `impacta_disponibilidade`: BOOLEAN - FALSE = afeta Performance (< 10 min)
- `tempo_minimo_registro`: INTEGER (minutos)
- `ativo`: BOOLEAN
- Campos de auditoria

**Regra de Negócio:** Paradas < 10 min afetam Performance, não Disponibilidade.

#### 8. Turno

**Propósito:** Turnos de trabalho (D1, N1, etc.).

**Key Attributes:**
- `id`: UUID
- `codigo`: STRING(10) - "D1", "N1"
- `nome`: STRING(50)
- `hora_inicio`, `hora_fim`: TIME
- `duracao_horas`: DECIMAL(4,2)
- `ativo`: BOOLEAN
- Campos de auditoria

#### 9. Usuário/Operador

**Propósito:** Usuários do sistema. **ALCOA+: Atribuível** - todo registro deve ter autor.

**Key Attributes:**
- `id`: UUID - Supabase Auth UUID
- `email`: STRING(255) UNIQUE
- `nome_completo`: STRING(200)
- `matricula`: STRING(20) UNIQUE
- `tipo_usuario`: ENUM - "OPERADOR", "SUPERVISOR", "ENCARREGADO", "GESTOR", "ADMIN"
- `setor_id`, `linha_id`: UUID (FK) - Opcional
- `ativo`: BOOLEAN
- `created_at`, `updated_at`

**Integração Supabase:**
- Tabela custom vinculada a `auth.users` do Supabase

#### 10. Meta OEE

**Propósito:** Metas de OEE por linha com histórico de vigência.

**Key Attributes:**
- `id`: UUID
- `linha_id`: UUID (FK)
- `meta_oee`: DECIMAL(5,2) - Percentual (0-100)
- `data_inicio_vigencia`, `data_fim_vigencia`: DATE
- `observacao`: TEXT
- `aprovado_por`: UUID (FK)
- `aprovado_em`: TIMESTAMP
- `ativo`: BOOLEAN
- Campos de auditoria

**Constraints:**
- UNIQUE (linha_id, data_inicio_vigencia)

#### 11. Lote de Produção

**Propósito:** Lotes produzidos. Criado automaticamente quando OP é aberta no TOTVS.

**Key Attributes:**
- `id`: UUID
- `numero_lote`: STRING(50) UNIQUE
- `linha_id`, `sku_id`, `turno_id`: UUID (FK)
- `data_producao`: DATE
- `hora_inicio`, `hora_fim`: TIME
- `producao_inicial`: INTEGER - Quantidade quando turno iniciou
- `producao_atual`: INTEGER - Produzido no turno
- `unidades_produzidas`, `unidades_boas`, `unidades_refugo`: INTEGER - Calculados
- `tempo_retrabalho_minutos`: INTEGER - Calculado
- `status`: ENUM - "PLANEJADO", "EM_ANDAMENTO", "CONCLUIDO", "CANCELADO"
- `origem_totvs_op`: STRING(50) - Número da OP
- `totvs_sincronizado_em`: TIMESTAMP
- `conferido_por_supervisor`: UUID (FK) - Assinatura eletrônica
- `conferido_em`: TIMESTAMP
- Campos de auditoria

**Observação:** Campos calculados atualizados via triggers quando apontamentos são inseridos.

#### 12. Apontamento de Parada

**Propósito:** **CRÍTICO - ALCOA+** - Registro contemporâneo de paradas.

**Key Attributes:**
- `id`: UUID
- `linha_id`, `lote_id`, `codigo_parada_id`, `turno_id`: UUID (FK)
- `data_parada`: DATE
- `hora_inicio`, `hora_fim`: TIME
- `duracao_minutos`: INTEGER - Calculado automaticamente
- `observacao`: TEXT
- `criado_por_operador`: UUID (FK) - ALCOA+ Atribuível
- `conferido_por_supervisor`: UUID (FK)
- `conferido_em`: TIMESTAMP
- Campos de auditoria

**Regras:**
- Contemporaneidade: hora_inicio deve estar no turno atual (tolerância 5 min)
- Todas paradas devem ser registradas, mesmo < 10 min

#### 13. Apontamento de Produção

**Propósito:** Registro de produção (CLP automático ou manual).

**Key Attributes:**
- `id`: UUID
- `lote_id`, `linha_id`, `turno_id`: UUID (FK)
- `data_apontamento`: DATE
- `hora_apontamento`: TIME
- `unidades_produzidas`: INTEGER
- `fonte_dados`: ENUM - "CLP_AUTOMATICO", "MANUAL", "TOTVS"
- `clp_timestamp`: TIMESTAMP - Timestamp original do CLP (ALCOA+ Original)
- `observacao`: TEXT
- Campos de auditoria

**Integração:** Dados de CLP preservam timestamp original.

#### 14. Apontamento de Qualidade

**Propósito:** Perdas de qualidade (refugo, retrabalho).

**Key Attributes:**
- `id`: UUID
- `lote_id`, `linha_id`, `turno_id`: UUID (FK)
- `data_apontamento`: DATE
- `tipo_perda`: ENUM - "REFUGO", "RETRABALHO", "DESVIO", "BLOQUEIO"
- `unidades_refugadas`: INTEGER (se REFUGO)
- `tempo_retrabalho_minutos`: INTEGER (se RETRABALHO)
- `motivo`: TEXT
- `origem_dados`: ENUM - "MANUAL", "TOTVS"
- `totvs_integrado`: BOOLEAN
- `totvs_timestamp`: TIMESTAMP
- Campos de auditoria

**Regra:** Refugo DEVE ser sincronizado com TOTVS antes de concluir lote.

#### 15. OEE Calculado

**Propósito:** Cache de cálculos de OEE para performance.

**Key Attributes:**
- `id`: UUID
- `linha_id`, `lote_id`, `sku_id`, `turno_id`: UUID (FK)
- `data_referencia`: DATE
- Tempos (horas): `tempo_calendario`, `tempo_disponivel`, `tempo_operacao`, `tempo_operacional_liquido`, `tempo_valioso`
- Breakdown paradas: `tempo_paradas_estrategicas`, `tempo_paradas_planejadas`, `tempo_paradas_nao_planejadas`, `tempo_retrabalho`
- Unidades: `unidades_produzidas`, `unidades_boas`, `unidades_refugadas`, `velocidade_nominal`
- Componentes OEE: `disponibilidade`, `performance`, `qualidade`, `oee` (%)
- `meta_oee`: DECIMAL(5,2)
- `atingiu_meta`: BOOLEAN - Calculado automaticamente
- `calculado_em`: TIMESTAMP
- `recalcular`: BOOLEAN - Flag para invalidar cache

**Trigger:** Populado automaticamente quando lote muda para status CONCLUIDO.

#### 16. Audit Log

**Propósito:** **ALCOA+ Compliance** - Rastreia TODAS alterações em dados críticos. Tabela IMUTÁVEL.

**Key Attributes:**
- `id`: UUID
- `tabela`: STRING(100)
- `registro_id`: UUID
- `operacao`: ENUM - "INSERT", "UPDATE", "DELETE"
- `campo_alterado`: STRING(100)
- `valor_anterior`, `valor_novo`: TEXT
- `usuario_id`: UUID (FK) - ALCOA+ Atribuível
- `timestamp`: TIMESTAMP - ALCOA+ Contemporâneo
- `ip_address`: INET
- `user_agent`: TEXT
- `motivo_alteracao`: TEXT - Obrigatório para UPDATE/DELETE críticos

**Implementação:**
- PostgreSQL Triggers automáticos
- Tabela append-only (sem UPDATE/DELETE via RULE)

---

## 3. Database Schema

### Implementação PostgreSQL/Supabase

Este schema implementa todos os modelos definidos, otimizado para PostgreSQL 15+ e Supabase.

**Componentes:**
- 15 tabelas principais
- 6 functions (incluindo cálculo completo de OEE)
- Triggers automáticos (auditoria ALCOA+, campos calculados)
- 5 views (dashboards e relatórios)
- 30+ indexes para performance
- 10+ RLS policies para segurança

### 3.1. Enums e Tipos

```sql
-- Tipo de linha
CREATE TYPE tipo_linha_enum AS ENUM ('ENVASE', 'EMBALAGEM');

-- Tipo de usuário
CREATE TYPE tipo_usuario_enum AS ENUM ('OPERADOR', 'SUPERVISOR', 'ENCARREGADO', 'GESTOR', 'ADMIN');

-- Status de lote
CREATE TYPE status_lote_enum AS ENUM ('PLANEJADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO');

-- Tipo de parada
CREATE TYPE tipo_parada_enum AS ENUM ('ESTRATEGICA', 'PLANEJADA', 'NAO_PLANEJADA');

-- Fonte de dados
CREATE TYPE fonte_dados_enum AS ENUM ('CLP_AUTOMATICO', 'MANUAL', 'TOTVS');

-- Tipo de perda de qualidade
CREATE TYPE tipo_perda_qualidade_enum AS ENUM ('REFUGO', 'RETRABALHO', 'DESVIO', 'BLOQUEIO');

-- Operação de auditoria
CREATE TYPE operacao_audit_enum AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- Status de insumo
CREATE TYPE status_insumo_enum AS ENUM ('EM_ESTOQUE', 'EM_USO', 'ESGOTADO', 'BLOQUEADO');
```

### 3.2. Tabelas de Cadastro

**Nota:** DDL completo disponível em arquivo separado. Resumo das principais tabelas:

**tbsetor:** Setores produtivos (SPEP, SPPV, CPHD, Líquidos)
**tblinha:** 37 linhas de produção do MVP
**tbsku:** Produtos sincronizados do TOTVS
**tbinsumo:** Insumos sincronizados do TOTVS
**tbloteinsumo:** Lotes de insumos recebidos
**tbvelocidadenominal:** Velocidades por SKU por linha (com histórico)
**tbcodigoparada:** Book de paradas (hierarquia 5 níveis)
**tbturno:** Turnos de trabalho
**tbusuario:** Usuários (vinculado a auth.users)
**tbmetaoee:** Metas com histórico de vigência

### 3.3. Tabelas Transacionais

**tblote:** Lotes de produção (origem: TOTVS OP)
**tbapontamentoparada:** Paradas contemporâneas (ALCOA+)
**tbapontamentoproducao:** Produção (CLP/Manual)
**tbapontamentoqualidade:** Refugo e retrabalho

### 3.4. Tabelas de Cache e Auditoria

**tboeecalculado:** Cache de OEE calculado
**tbauditlog:** Log imutável de auditoria

### 3.5. Functions Principais

#### get_velocidade_nominal()
Retorna velocidade nominal vigente para linha+SKU na data especificada.

#### get_meta_oee()
Retorna meta OEE vigente para linha na data.

#### calcular_oee_lote()
**CRÍTICO** - Implementa fórmulas da Atividade 05:

```
Tempo Disponível = Tempo Calendário - Paradas Estratégicas
Disponibilidade (%) = (Tempo Operação / Tempo Disponível) × 100
Performance (%) = (Tempo Op. Líquido / Tempo Operação) × 100
Qualidade (%) = Qualidade_Unidades × Qualidade_Retrabalho
OEE (%) = Disponibilidade × Performance × Qualidade
```

Retorna:
- Todos os tempos (calendário, disponível, operação, líquido, valioso)
- Breakdown de paradas por tipo
- Componentes OEE separados
- OEE final

#### update_updated_at_column()
Trigger function para atualizar `updated_at` automaticamente.

#### audit_trigger_func()
Captura INSERT/UPDATE/DELETE e grava em `tbauditlog` (ALCOA+).

#### atualizar_totais_lote()
Mantém campos calculados de `tblote` sincronizados com apontamentos.

#### cache_oee_lote_concluido()
Trigger que popula `tboeecalculado` quando lote é concluído.

### 3.6. Views Úteis

**vw_diario_bordo:** Relatório completo do Diário de Bordo
**vw_diario_bordo_paradas:** Lista de paradas
**vw_dashboard_oee_linha:** Dashboard OEE em tempo real
**vw_pareto_paradas:** Gráfico de Pareto (principal ferramenta de gestão)
**vw_mtbf_mttr:** Indicadores MTBF e MTTR

### 3.7. Indexes para Performance

30+ indexes otimizados para queries de dashboard e relatórios, incluindo:
- Indexes em FKs para JOINs
- Indexes compostos para queries frequentes (linha_id + data)
- Indexes em campos de filtro (status, tipo_parada, etc.)

### 3.8. Row Level Security (RLS)

Policies implementadas para controle de acesso granular:

**Operador:** Vê apenas sua linha
**Supervisor/Encarregado:** Vê linhas do seu setor
**Gestor/Admin:** Vê tudo

RLS aplicado em:
- tblinha, tblote, tbapontamento_* (parada, produção, qualidade)
- tboeecalculado
- tbauditlog (somente Admin/Gestor)

---

## 4. Core Workflows

### Visão Geral

Workflows críticos do sistema com diagramas de sequência detalhados:

1. **Apontamento de Parada** (CRÍTICO - ALCOA+ Contemporâneo)
2. **Apontamento de Produção** (CLP + Manual)
3. **Apontamento de Qualidade** (Refugo/Retrabalho)
4. **Abertura de Lote via TOTVS**
5. **Conclusão de Lote e Cálculo de OEE**
6. **Conferência e Assinatura do Diário de Bordo**
7. **Sincronização TOTVS** (Produtos, Insumos, Lotes)
8. **Visualização de Dashboard OEE** (Tempo Real)

### 4.1. Workflow: Apontamento de Parada

**Importância:** Workflow **MAIS CRÍTICO**. Paradas devem ser registradas **CONTEMPORANEAMENTE** (ALCOA+).

**Atores:** Operador, Supervisor, Sistema

**Fluxo Principal:**

1. **Início de Parada:**
   - Operador clica "Registrar Parada"
   - Sistema captura timestamp atual (contemporaneidade)
   - Operador seleciona código de parada (do book da linha)
   - Sistema valida: hora_inicio <= NOW() + 5 min
   - INSERT em `tbapontamentoparada` (hora_fim = NULL)
   - Trigger de auditoria registra em `tbauditlog`
   - Frontend exibe timer visual da parada

2. **Fim de Parada:**
   - Operador clica "Finalizar Parada"
   - Sistema captura hora_fim = NOW()
   - UPDATE `tbapontamentoparada` (calcula duracao_minutos)
   - Trigger de auditoria registra UPDATE
   - Frontend para timer e exibe duração final

3. **Conferência (Opcional/Assíncrono):**
   - Supervisor acessa "Paradas Pendentes"
   - Revisa paradas não conferidas
   - Confirma parada (UPDATE conferido_por_supervisor, conferido_em)

**Regras de Negócio:**
- ✅ Contemporaneidade obrigatória (tolerância 5 min)
- ✅ Atribuibilidade: `criado_por_operador` sempre preenchido
- ✅ Completude: TODAS paradas registradas (mesmo < 10 min)
- ✅ Auditoria automática via trigger
- ⚠️ Pequenas paradas (< 10 min): impacta_disponibilidade = FALSE → afeta Performance

**Tratamento de Erros:**
- Parada não contemporânea: Erro 422 "Parada deve ser contemporânea"
- Operador sem permissão: RLS Policy bloqueia (403 Forbidden)

### 4.2. Workflow: Apontamento de Produção

**Fontes:** CLP Automático (envase) ou Manual (embalagem)

**Fluxo CLP Automático:**

1. CLP lê contador de produção (a cada 5 min)
2. POST para Supabase Edge Function `/webhook/producao`
3. Edge Function valida token e busca linha + lote
4. INSERT em `tbapontamentoproducao` (fonte: CLP_AUTOMATICO, preserva clp_timestamp)
5. Trigger `atualizar_totais_lote()` atualiza `tblote.unidades_produzidas`
6. Sistema retorna 200 OK ao CLP

**Fluxo Manual (Embalagem):**

1. Operador acessa "Apontar Produção"
2. Sistema exibe lote(s) em andamento
3. Operador informa contagem física (ex: 32.400 unidades)
4. Frontend calcula delta e valida integridade
5. POST para `tbapontamentoproducao` (fonte: MANUAL)
6. Trigger atualiza totais do lote
7. Frontend exibe confirmação

**Integração TOTVS (Validação):**
- Operador pode sincronizar produção com TOTVS
- Edge Function envia dados para API local TOTVS
- TOTVS valida e registra produção
- Em caso de divergência, alerta operador

**Regras:**
- ✅ CLP Timestamp original preservado (ALCOA+ Original)
- ✅ Integridade TOTVS: quantidade deve ser idêntica
- ✅ Trigger mantém campos calculados atualizados

### 4.3. Workflow: Apontamento de Qualidade

**Tipos:** Refugo (unidades descartadas) ou Retrabalho (tempo gasto)

**Fluxo Refugo:**

1. Operador clica "Registrar Refugo"
2. Informa quantidade e motivo (ex: 5.000 unidades, "Contaminação")
3. POST para `tbapontamentoqualidade` (tipo: REFUGO)
4. Trigger atualiza `tblote` (unidades_refugo, unidades_boas)
5. **CRÍTICO:** Operador DEVE sincronizar com TOTVS
6. Edge Function envia para TOTVS API
7. TOTVS registra perda e atualiza estoque
8. UPDATE `totvs_integrado = TRUE`

**Fluxo Retrabalho:**

1. Operador clica "Registrar Retrabalho"
2. Informa tempo (ex: 45 minutos, "Reinspeção")
3. POST para `tbapontamentoqualidade` (tipo: RETRABALHO)
4. Trigger atualiza `tblote.tempo_retrabalho_minutos`
5. **Importante:** Retrabalho afeta Qualidade, NÃO Disponibilidade!

**Validação:**
- Sistema bloqueia conclusão de lote se há refugo não integrado com TOTVS

### 4.4. Workflow: Abertura de Lote via TOTVS

**Trigger:** Quando OP (Ordem de Produção) é aberta no TOTVS

**Fluxo:**

1. **TOTVS Local:** Usuário abre OP (produto, linha, quantidade, data)
2. **App Sync Local:** Monitora tabela de OPs (CDC/Trigger)
3. Detecta nova OP e enfileira para sync (RabbitMQ/Redis)
4. POST para Supabase Edge Function `/criar-lote-totvs`
5. **Validações:**
   - Linha existe e ativa?
   - SKU existe e ativo?
   - Velocidade nominal configurada?
   - OP não duplicada?
6. INSERT em `tblote` (status: EM_ANDAMENTO, origem_totvs_op)
7. Supabase retorna lote_id
8. App Sync atualiza OP no TOTVS (registra lote_id SicFar)
9. **Realtime:** Supabase Realtime notifica frontend
10. Frontend exibe toast "Novo lote iniciado!"

**Retry Strategy:**
- Fila local com retry exponencial (1min, 5min, 15min)
- Máximo 10 tentativas
- Dead Letter Queue + alerta TI se falhar

**Erros Tratados:**
- SKU não cadastrado: Erro + alerta para cadastrar antes de abrir OP
- Velocidade não configurada: Alerta para configurar antes de produzir

### 4.5. Workflow: Conclusão de Lote e Cálculo de OEE

**Trigger:** Operador conclui lote

**Fluxo:**

1. Operador clica "Concluir Lote"
2. Frontend valida pré-requisitos:
   - Hora fim preenchida
   - Produção > 0
   - Sem paradas em aberto
   - Refugo sincronizado TOTVS
3. Se pendências: Frontend lista para operador corrigir
4. Operador confirma conclusão
5. PATCH `/tblote/{id}` (status: CONCLUIDO, hora_fim)
6. **Trigger: cache_oee_lote_concluido()** dispara automaticamente
7. **CALL calcular_oee_lote():**
   - Busca dados do lote (linha, SKU, turno, unidades)
   - Busca velocidade nominal vigente na data
   - Agrega paradas por tipo (estratégicas, planejadas, não planejadas)
   - **Calcula tempos:**
     - Tempo Calendário (duração do turno)
     - Tempo Disponível = Calendário - Estratégicas
     - Tempo Operação = Disponível - Paradas
   - **Calcula DISPONIBILIDADE:** (Tempo Operação / Tempo Disponível) × 100
   - **Calcula PERFORMANCE:** (Tempo Op. Líquido / Tempo Operação) × 100
     - Tempo Op. Líquido = Unidades Produzidas / Velocidade Nominal
   - **Calcula QUALIDADE:**
     - Qualidade Unidades = (Unidades Boas / Unidades Produzidas) × 100
     - Qualidade Retrabalho = ((Tempo Op - Tempo Retrabalho) / Tempo Op) × 100
     - Qualidade Total = Qualidade Unidades × Qualidade Retrabalho
   - **Calcula OEE FINAL:** Disponibilidade × Performance × Qualidade
8. Busca meta OEE vigente
9. INSERT em `tboeecalculado` (todos componentes + meta + flag atingiu_meta)
10. Frontend exibe resultado detalhado:
    - Velocímetro de OEE
    - Breakdown dos componentes
    - Principais perdas
11. **Realtime:** Dashboard é atualizado automaticamente

**Fórmulas Implementadas (Atividade 05):**
```
Tempo Disponível = Tempo Calendário - Paradas Estratégicas
Disponibilidade (%) = (Tempo Operação / Tempo Disponível) × 100
Performance (%) = (Tempo Op. Líquido / Tempo Operação) × 100
  onde: Tempo Op. Líquido = Unidades Produzidas / Velocidade Nominal (Und/h)
Qualidade (%) = Qualidade_Unidades × Qualidade_Retrabalho
OEE (%) = Disponibilidade × Performance × Qualidade
```

### 4.6. Workflow: Conferência e Assinatura do Diário de Bordo

**Objetivo:** Assinatura eletrônica (ALCOA+) + geração de PDF para backup físico (BPF)

**Fluxo:**

1. **Consulta:** Supervisor acessa "Diários Pendentes"
2. Sistema lista lotes não conferidos (WHERE conferido_em IS NULL)
3. Supervisor seleciona lote
4. Sistema renderiza Diário de Bordo completo:
   - Cabeçalho (Data, Turno, Linha)
   - Produção por lote (Inicial, Atual, Horas)
   - Paradas (Código, Início, Fim, Duração)
   - Totalizadores (Produção total, Refugo total)
   - Operador responsável
5. **Ajustes (se necessário):**
   - Supervisor pode ajustar observações de paradas
   - Alterações auditadas (campo alterado + motivo)
6. **Assinatura Eletrônica:**
   - Supervisor clica "Assinar Diário"
   - Sistema valida (autenticado, setor correto, paradas finalizadas)
   - Modal de confirmação (pode pedir senha)
   - UPDATE `conferido_por_supervisor` + `conferido_em` = NOW()
   - Audit Log registra ato de assinatura (timestamp, IP)
7. **Geração de PDF:**
   - Supervisor clica "Gerar PDF para Impressão"
   - Edge Function busca dados completos (view diario_bordo)
   - Renderiza PDF (puppeteer/jsPDF):
     - Logo Farmace
     - Layout estruturado (cabeçalho, tabelas, totais)
     - Área de assinaturas com timestamps
     - Marca d'água "DOCUMENTO CONTROLADO"
   - Upload para Supabase Storage (bucket: diarios-bordo)
   - UPDATE `pdf_url` + `pdf_gerado_em` no lote
   - Retorna URL assinada (24h)
8. Frontend abre PDF em nova aba
9. Supervisor pode visualizar/imprimir/baixar

**Assinatura Eletrônica (ALCOA+):**
- `conferido_por_supervisor` + `conferido_em` = assinatura digital válida
- PDF inclui: "Assinado eletronicamente por [Nome] em [Data/Hora]"
- Conforme princípios: Atribuível + Contemporâneo + Durável

**Backup Físico:**
- PDF permanece no Storage para auditorias
- Retenção conforme BPF (mínimo 5 anos)
- PDF impresso guardado fisicamente (não gerenciado pelo sistema)

### 4.7. Workflow: Sincronização TOTVS

**Arquitetura:** App Sync local no servidor TOTVS monitora mudanças e envia para Supabase Cloud

**4.7.1. Sincronização de Produtos (SKUs)**

**Fluxo:**
1. TOTVS: Usuário cadastra novo produto
2. TOTVS: INSERT na tabela de produtos
3. App Sync: Detecta via CDC/Trigger/Polling (30s)
4. App Sync: Enfileira para sync (RabbitMQ/Redis)
5. POST para Supabase Edge Function `/sync-sku`
6. Supabase: UPSERT em `tbsku` (ON CONFLICT codigo_totvs DO UPDATE)
7. Supabase: Atualiza `totvs_sincronizado_em`
8. Retorna 200 OK
9. App Sync: ACK mensagem (sucesso)

**Retry com Backoff:**
- Falha de rede: NACK + retry (1min, 5min, 15min)
- Máximo 10 tentativas
- Dead Letter Queue + alerta TI se exceder

**4.7.2. Sincronização de Insumos e Lotes de Insumos**

Similar ao fluxo de SKUs:
- Compras registra novo lote de insumo no TOTVS
- App Sync detecta e envia para Supabase
-- Supabase cria/atualiza `tbinsumo` + INSERT `tbloteinsumo`

**4.7.3. Sincronização Bidirecional (Refugo)**

**Fluxo:**
1. **SicFar → TOTVS:** Operador registra refugo no SicFar
2. Frontend: POST `/tbapontamentoqualidade` (totvs_integrado = FALSE)
3. Frontend: POST `/functions/v1/sync-totvs-qualidade`
4. Edge Function: Monta payload e envia para **Webhook Reverso**
5. **Supabase → Servidor Local:** POST para App Sync local
6. App Sync: Valida assinatura webhook
7. App Sync: Registra perda na OP do TOTVS (movimentação estoque)
8. TOTVS: Atualiza estoque
9. Retorna 200 OK + timestamp
10. Supabase: UPDATE `totvs_integrado = TRUE`, `totvs_timestamp`

**Webhook Reverso:**
- Supabase chama servidor local via IP público/VPN
- Autenticação via token
- SSL/TLS obrigatório

**4.7.4. Monitoramento (Heartbeat)**

**Fluxo:**
1. App Sync: Health check a cada 5 minutos
2. POST `/functions/v1/health` com timestamp
3. Supabase: UPDATE `tb_sync_status` (tabela de controle)
4. Registra `last_heartbeat`, `last_sync_produtos`, etc.

**Alertas:**
- Se heartbeat ausente > 10 min:
  - Realtime envia evento para frontend
  - Frontend exibe banner vermelho "SINCRONIZAÇÃO OFFLINE"
  - Email automático para TI

**Infraestrutura Necessária:**
```
Servidor Local TOTVS:
├── App Sync (Node.js/C#/.NET)
├── Fila Local (Redis/RabbitMQ)
├── Webhook Listener (Express/ASP.NET)
└── Logs (Winston/Serilog)

Conectividade:
- IP Fixo ou VPN site-to-site
- Webhook público com autenticação
- SSL/TLS
```

### 4.8. Workflow: Dashboard OEE (Tempo Real)

**Objetivo:** Exibir indicadores em tempo real com atualização automática (Supabase Realtime)

**Fluxo:**

1. **Acesso ao Dashboard:**
   - Gestor acessa Dashboard OEE
   - Frontend autentica (Supabase Auth)
   - Estabelece conexão Realtime (channel: 'dashboard')
   - Subscribe a mudanças em `tboeecalculado`

2. **Carga Inicial:**
   - GET `/rpc/vw_dashboard_oee_linha`
   - RLS permite gestor ver todas 37 linhas
   - Retorna OEE atual de cada linha

3. **Renderização:**
   - **Velocímetros de OEE:** Gauge charts por linha
     - Verde: ≥ 85%, Amarelo: 70-84%, Vermelho: < 70%
   - **Componentes OEE:** Barras comparativas (Disponibilidade, Performance, Qualidade)
   - **Pareto de Paradas:** Top 10 causas (principal ferramenta de gestão!)
     - Linha 80/20 destacada
     - Drill-down para 5 níveis de hierarquia
   - **Tendência Semanal:** Line chart (últimas 10 semanas)
     - OEE Real vs Meta
   - **MTBF / MTTR:** Cards com indicadores secundários
   - **Tabelas Consolidadas:** OEE por linha/turno/período
   - **Gráfico de Rosca:** Paradas Planejadas vs Não Planejadas
   - **Barras Empilhadas:** Resumo de Horas (Calendário → Valioso)

4. **Atualização em Tempo Real:**
   - Operador conclui lote (Workflow 5)
   - Trigger: INSERT em `tboeecalculado`
   - PostgreSQL → Supabase Realtime: Change Event
   - Realtime broadcast para subscribers do canal 'dashboard'
   - Frontend: handleUpdate(payload)
   - Re-renderiza componentes sem reload
   - Exibe notificação: "SPEP-ENV-A: Novo OEE 78.2% (↑ 2.7%)"

5. **Filtros e Drill-Down:**
   - Gestor seleciona filtros (Setor, Período, Tipo parada)
   - Frontend atualiza queries e re-renderiza
   - Clique em barra do Pareto → Drill-down detalhado

6. **Export e Relatórios:**
   - Gestor clica "Exportar Relatório"
   - POST `/functions/v1/gerar-relatorio-oee`
   - Edge Function gera PDF com gráficos e tabelas
   - Upload para Storage
   - Download automático

7. **Alertas Automáticos:**
   - **OEE abaixo da meta:** Trigger detecta oee < meta × 0.9
     - Realtime: Alert event
     - Frontend: Banner vermelho + notificação sonora
   - **Parada prolongada (> 2h):** Trigger detecta parada em aberto
     - Frontend: Alerta crítico

**Componentes do Dashboard:**

1. Visão Geral: Cards por setor + Ranking + Alertas
2. Velocímetros: Gauge por linha (cores por faixa)
3. Componentes OEE: Barras lado a lado
4. **Pareto de Paradas:** Top 10 + drill-down (PRINCIPAL!)
5. Tendência: Line chart histórico
6. MTBF/MTTR: Evolução ao longo do tempo
7. Tabelas: Consolidação com filtros
8. Rosca: Planejadas vs Não Planejadas
9. Barras Empilhadas: Fluxo de horas

**Performance:**
-- Cache em `tboeecalculado` garante queries rápidas
- Views materializadas para agregações
- Indexes otimizados

---

## Próximos Passos

### Para Implementação

1. **Executar Schema no Supabase:**
   - Copiar DDL completo do Apêndice A
   - Executar seção por seção no SQL Editor
   - Popular dados iniciais (setores, turnos, linhas)

2. **Configurar Autenticação:**
   - Habilitar Supabase Auth
   - Criar primeiros usuários de teste
   - Testar RLS policies por perfil

3. **Desenvolver Frontend:**
   - Criar componentes de apontamento
   - Implementar dashboards
   - Integrar Supabase Realtime

4. **Integração TOTVS:**
   - Desenvolver App Sync local
   - Configurar webhooks
   - Testar sincronização bidirecional

5. **Integração CLPs:**
   - Desenvolver Edge Functions para receber dados
   - Configurar dispositivos edge
   - Testar fluxo automático de produção

### Para Validação

- Validar fórmulas de OEE com Consultor Rafael Gusmão
- Testar workflows com usuários-chave
- Revisar compliance ALCOA+ com Qualidade
- Preparar documentação de validação (QI, QO, QP)

---

## Apêndices

### Apêndice A: DDL Completo

**Nota:** DDL SQL completo disponível em arquivos separados organizados por seção:
- `01-enums.sql`
- `02-tables.sql`
- `03-functions.sql`
- `04-triggers.sql`
- `05-views.sql`
- `06-indexes.sql`
- `07-rls-policies.sql`
- `08-seeds.sql`

### Apêndice B: Referências

- **Atividade 05:** Metodologia de Cálculo (`docs/project/05-Metodologia-Calculo.md`)
- **Atividade 07:** Identificação de Fontes de Dados (`docs/project/07-Identificacao-Fontes-Dados.md`)
- **Atividade 09:** Validação Técnica - Gráficos (`docs/project/09-Validacao-Tecnica-SicFar.md`)
- **CLAUDE.md:** Instruções do projeto (`/home/emanuel/SysOEE/CLAUDE.md`)

### Apêndice C: Glossário

Ver `docs/project/04-Glossario-Termos.md` para glossário completo de termos do domínio OEE.

---

**Fim do Documento**
