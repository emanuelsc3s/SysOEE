# Project Brief: Sistema OEE para SicFar

**Data:** 18 de Outubro de 2025
**Versão:** 1.0
**Responsável:** Cícero Emanuel da Silva (Líder de TI)
**Stakeholders:** Maxwell Cruz Cortez (Gerente Industrial), Sávio Correia Rafael (Gerente de Processos)
**Consultor:** Rafael Gusmão (Validação Técnica)

---

## Executive Summary

O **Sistema OEE (Overall Equipment Effectiveness) para SicFar** é uma plataforma de monitoramento de eficiência operacional desenvolvida especificamente para a indústria farmacêutica Farmace. O sistema calcula e monitora a eficiência global de **37 linhas de produção** através de três componentes principais: **Disponibilidade**, **Performance** e **Qualidade**.

**Problema central:** A SicFar carece de visibilidade em tempo real sobre a eficiência das linhas de produção, impossibilitando a gestão preditiva de paradas, identificação de gargalos e otimização de capacidade produtiva. Os apontamentos manuais atuais não garantem contemporaneidade (princípio ALCOA+) e a análise de dados é fragmentada entre planilhas e sistemas legados.

**Solução proposta:** Sistema web pharma-native (React 19 + Supabase) com integrações CLPs/TOTVS, dashboards interativos avançados, assinatura eletrônica CFR 21 Part 11, e offline-first para garantir zero data loss durante turnos de 8+ horas.

**Meta de implantação:** Janeiro/2026 (protótipo SPEP em Dezembro/2025)

**Diferenciais:**
- ✅ **Compliance-First:** ALCOA+ e BPF embarcados desde o design (não add-ons posteriores)
- ✅ **Contemporaneidade Forçada:** Offline-first com buffer local garante registro no momento da ocorrência
- ✅ **Pharma-Native:** Desenhado especificamente para ambiente regulado (validação QI/QO/QP)
- ✅ **Zero Data Loss:** Sessões estáveis 8h+ com auto-recovery e background sync

---

## Problem Statement

### Contexto Atual

A Farmace/SicFar opera **37 linhas de produção farmacêutica** em 4 setores críticos (SPEP, SPPV, Líquidos, CPHD), mas enfrenta **desafios operacionais significativos**:

**1. Falta de Visibilidade em Tempo Real**
- Gestores não conseguem visualizar eficiência das linhas durante o turno
- Decisões sobre alocação de recursos são reativas (não preditivas)
- Paradas não planejadas só são detectadas após impacto severo na produção

**2. Dados Fragmentados e Não Confiáveis**
- Apontamentos manuais em planilhas Excel (sujeitos a erros e registros posteriores)
- Dados de CLPs (Bottelpack, Pró Maquia, Bausch Strobbel) não integrados ao ERP
- Não há fonte única de verdade para análise de OEE

**3. Não-Conformidade com BPF (Risco Regulatório)**
- **Contemporaneidade comprometida:** Operadores registram paradas horas/dias depois
- **Atribuibilidade fraca:** Não há assinatura eletrônica rastreável
- **Auditoria insuficiente:** Impossível rastrear "quem alterou o quê, quando e por quê"
- **Risco de auditoria FDA/ANVISA:** Sistema atual não atende ALCOA+ (Atribuível, Legível, Contemporâneo, Original, Exato, Completo, Consistente, Durável, Disponível)

**4. Impossibilidade de Análise Estratégica**
- Não há cálculo automatizado de OEE por linha/setor/período
- Pareto de paradas (principal ferramenta de gestão) não existe
- Indicadores secundários (MTBF, MTTR, Taxa de Utilização) não são calculados
- Decisões de CAPEX/investimento não têm base em dados concretos

### Impacto do Problema

**Financeiro:**
- **Perda estimada:** 10-15% de capacidade produtiva por ineficiência não identificada
- **Custo de não-conformidade:** Risco de warning letter em auditoria (impacto: certificação suspensa, exportação bloqueada)

**Operacional:**
- Gestores gastam 40% do tempo compilando dados manualmente vs analisando
- Falta de priorização: Todos os problemas parecem igualmente urgentes (sem Pareto)
- Manutenção reativa vs preditiva (MTBF/MTTR não calculados)

**Estratégico:**
- Impossível garantir capacidade instalada real para planejamento comercial
- Decisões de investimento (nova linha vs otimização) sem dados objetivos
- SicFar não consegue demonstrar melhoria contínua para clientes/auditores

### Por Que Resolver Agora?

1. **Pressão Regulatória Crescente:** IN 134 ANVISA e RDC 658 reforçam requisitos de integridade de dados
2. **Expansão Planejada:** Nova linha em planejamento requer capacidade real medida
3. **Janela de Implementação:** Janeiro/2026 alinha com ciclo orçamentário e planejamento estratégico
4. **Maturidade Digital:** Stack tecnológico definido + equipe capacitada + consultor validando

---

## Proposed Solution

### Visão da Solução

**Sistema OEE Web Pharma-Native** que:
- **Coleta** dados automaticamente de CLPs e apontamentos manuais contemporâneos
- **Calcula** OEE e indicadores secundários conforme metodologia validada (docs/project/05-Metodologia-Calculo.md)
- **Visualiza** dashboards interativos em tempo real (8 gráficos obrigatórios)
- **Garante compliance** através de assinatura eletrônica, audit trail completo e contemporaneidade forçada
- **Valida** conforme QI/QO/QP para uso em ambiente regulado

### Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                    USUÁRIOS (100-500)                       │
│  Operadores | Supervisores | Gestores | Diretoria | Audit  │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│              FRONTEND - React 19 PWA                        │
│  • Dashboards Interativos (ECharts, Recharts, TanStack)    │
│  • Offline-First (IndexedDB + Service Worker)              │
│  • Assinatura Eletrônica (Re-auth + Hash SHA-256)          │
│  • Filtros Dinâmicos (Shadcn + Tailwind v4)                │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│              BACKEND - Supabase (PostgreSQL)                │
│  • Row Level Security (RLS) para permissões granulares      │
│  • Triggers PostgreSQL para auditoria automática            │
│  • View Materializada para cálculos OEE                     │
│  • Real-time subscriptions (WebSockets)                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│              FONTES DE DADOS                                │
│  • CLPs (KEYENCE via FTP → Gateway SICFAR)                  │
│  • Apontamentos Manuais Contemporâneos (Operadores)         │
│  • TOTVS ERP (SKUs, Velocidades Nominais, Lotes)           │
└─────────────────────────────────────────────────────────────┘
```

### Componentes Core

**1. Integração IoT (Gateway SICFAR)**
- Tail de arquivos TXT gerados por sensores KEYENCE (4 registros/segundo)
- **Agregação no Edge:** Acumula contadores em memória por Ordem de Produção
- UPDATE Supabase a cada 5 segundos (não INSERT!) → **Redução: 35.000x menos dados**
- Tabela `ordens_producao_ativas`: `producao_acumulada`, `rejeicao_acumulada`

**2. Cálculo de OEE (View Materializada MVP)**
- Fórmula: **OEE (%) = Disponibilidade × Performance × Qualidade**
  - Disponibilidade = (Tempo de Operação / Tempo Disponível) × 100
  - Performance = (Tempo Operacional Líquido / Tempo de Operação) × 100
  - Qualidade = Qualidade_Unidades × Qualidade_Retrabalho
- View materializada com refresh via pg_cron (a cada 1h no MVP)
- Agregação por: linha, turno, dia, semana, mês, trimestre, ano
- **Velocidade Nominal por SKU** (não capacidade nominal da máquina)

**3. Assinatura Eletrônica & Auditoria**
- **Fluxo híbrido:** Operador registra contemporaneamente (sem assinatura) → Supervisor assina batch ao final do turno
- **Granularidade:** Supervisor seleciona individualmente quais registros assinar (não tudo automaticamente)
- **Re-autenticação:** PIN/Senha única para assinar batch completo
- **Audit Trail:** Triggers PostgreSQL salvam: quem incluiu/alterou/excluiu, campo alterado, valor antes/depois, timestamp, IP, device
- **Conformidade:** CFR 21 Part 11 (assinatura eletrônica ≠ assinatura digital certificada)

**4. Visualizações Obrigatórias (8 Gráficos)**
- **Velocímetro de OEE** (ECharts gauge) com meta por linha
- **Pareto de Paradas** (principal ferramenta de gestão) com drill-down
- **Componentes do OEE** (barras comparativas: Disponibilidade, Performance, Qualidade)
- **Tabela Consolidada** (TanStack Table com ordenação/filtros)
- **Histórico de Tendências** (últimas 10-12 semanas)
- **Gráfico de Rosca** (Paradas Planejadas vs Não Planejadas)
- **Resumo de Horas** (barras empilhadas: Disponível, Operação, Paradas)
- **MTBF e MTTR** (gráficos de linhas ao longo do tempo)

**5. Sessões Longas & Offline-First**
- **Keep-Alive Automático:** `autoRefreshToken: true` + refresh manual a cada 50min
- **Buffer Local:** IndexedDB armazena dados não sincronizados (zero data loss)
- **Service Worker PWA:** Background sync + cache + instalável como app desktop
- **UI de Status:** Badge Online/Offline + alertas de pendências
- **Auto-Reconnect:** Tentativas com exponential backoff (3x)

### Diferenciadores vs Mercado

Análise competitiva (Tractan, Aloee, TOTVS, Evocon) revelou **4 gaps críticos** que SysOEE resolve:

1. **Gap 1 - OEE Pharma-Native:** ALCOA+/BPF embarcado desde design (não customização posterior)
2. **Gap 2 - UX + Integração ERP:** UX moderna (inspirada em Evocon) + integração TOTVS nativa
3. **Gap 3 - Multi-Setor com Books Customizados:** 4 setores + 37 linhas + books específicos por linha
4. **Gap 4 - Velocidade Nominal por SKU:** Performance calculada por SKU (não máquina)

---

## Target Users

### Primary User Segment: Operadores de Chão de Fábrica

**Perfil:**
- **Quantidade:** 80-100 operadores ativos (2-3 por linha, 3 turnos)
- **Contexto:** Áreas limpas (BPF), computadores dedicados, não podem sair para registrar dados
- **Habilidades:** Baixa fluência digital, habituados com Diários de Bordo em papel

**Necessidades:**
- Registro rápido de apontamentos (<30 segundos por evento)
- Interface simples sem distrações (foco em produção, não em software)
- Sistema **não pode cair** durante turno (perda de contemporaneidade = não-conformidade)
- Feedback visual imediato (confirmação de registro salvo)

**Pain Points Atuais:**
- TOTVS é complexo e lento (operadores resistem ao uso)
- Desconexões frequentes obrigam re-login (quebra contemporaneidade)
- Não sabem se dados foram salvos (incerteza gera duplicações)

**Objetivos com SysOEE:**
- Registrar paradas, trocas de turno, perdas em **tempo real** sem fricção
- Ter certeza de que dados foram salvos (mesmo offline)
- Passar turno para próximo operador com informações íntegras

**Métricas de Sucesso:**
- Tempo médio de apontamento < 30 segundos
- Taxa de adoção > 95% (contemporaneidade)
- Uptime de sessão > 99% durante turno (8h+)

---

### Secondary User Segment: Supervisores de Produção

**Perfil:**
- **Quantidade:** 15-20 supervisores (1-2 por setor, 3 turnos)
- **Contexto:** Circulam entre linhas, responsáveis por validar registros dos operadores
- **Habilidades:** Fluência digital moderada, familiarizados com planilhas Excel

**Necessidades:**
- Visualizar resumo do turno (todas as linhas do setor simultaneamente)
- Assinar registros em batch (não um por um)
- Ter controle granular (rejeitar registros incorretos com motivo)
- Dashboard com alertas (linhas abaixo da meta de OEE)

**Pain Points Atuais:**
- Validar apontamentos manualmente em planilhas é demorado (1-2h/turno)
- Não têm visibilidade em tempo real durante o turno
- Descobrem problemas tarde demais (após turno acabar)

**Objetivos com SysOEE:**
- Validar apontamentos de 10 linhas em < 15 minutos
- Receber alertas de linhas com problemas (OEE < 70%)
- Assinar batch completo com re-autenticação única

**Métricas de Sucesso:**
- Tempo de validação de turno < 15 minutos (vs 1-2h atual)
- Taxa de rejeição < 5% (operadores registram corretamente)
- Tempo de resposta a alertas < 30 minutos

---

### Tertiary User Segment: Gestores (Gerente Industrial, Engenharia, Processos)

**Perfil:**
- **Quantidade:** 5-10 gestores
- **Contexto:** Escritórios, tomam decisões estratégicas baseadas em dados de OEE
- **Habilidades:** Alta fluência digital, familiarizados com análise de dados

**Necessidades:**
- Dashboards analíticos (Pareto de paradas, tendências, comparações)
- Filtros dinâmicos (setor, linha, período, tipo de parada)
- Export de relatórios (PDF, Excel) para reuniões
- Drill-down para investigar root causes

**Objetivos com SysOEE:**
- Identificar top 3 causas de paradas por setor (Pareto)
- Priorizar investimentos (manutenção, treinamento, CAPEX)
- Demonstrar melhoria contínua para diretoria/auditores

**Métricas de Sucesso:**
- Tempo de geração de relatório < 2 minutos (vs 4h manual)
- Taxa de decisões data-driven > 80%
- Redução de OEE abaixo de 70% em 20% (6 meses)

---

## Goals & Success Metrics

### Business Objectives

- **OBJ-1:** Aumentar OEE médio geral de **~65% (baseline estimado) para 75%** até Jun/2026 (6 meses pós-MVP)
  - Métrica: OEE médio mensal calculado pelo sistema
  - Target: +10 pontos percentuais (equivalente a ~15% aumento de capacidade produtiva)

- **OBJ-2:** Reduzir tempo de análise de dados de **40h/mês (gestores) para 4h/mês** até Mar/2026 (3 meses pós-MVP)
  - Métrica: Horas reportadas por gestores em time tracking
  - Target: 90% redução (10x mais eficiente)

- **OBJ-3:** Garantir 100% contemporaneidade de apontamentos (conformidade BPF/ALCOA+)
  - Métrica: % de apontamentos com timestamp dentro de 10min da ocorrência
  - Target: >95% até Fev/2026, >98% até Jun/2026

- **OBJ-4:** Aprovar validação formal (QI/QO/QP) até Ago/2026
  - Métrica: Certificado de sistema validado emitido por Qualidade + Consultor
  - Target: 100% dos testes de validação aprovados

- **OBJ-5:** Reduzir paradas não planejadas em 25% através de gestão preditiva (MTBF/MTTR)
  - Métrica: Horas de paradas não planejadas (mês atual vs baseline Jan/2026)
  - Target: -25% até Dez/2026 (12 meses)

### User Success Metrics

- **Operadores:**
  - Taxa de adoção de apontamentos contemporâneos: >95%
  - NPS (Net Promoter Score) do sistema: >40 (após 3 meses)
  - Tempo médio de apontamento: <30 segundos

- **Supervisores:**
  - Tempo de validação de turno: <15 minutos (vs 1-2h atual)
  - Taxa de detecção de problemas em tempo real: >80%
  - Taxa de rejeição de apontamentos: <5%

- **Gestores:**
  - Tempo de geração de relatório gerencial: <2 minutos
  - Taxa de decisões baseadas em dados do sistema: >80%
  - Satisfação com visualizações (survey): >4.0/5.0

### Key Performance Indicators (KPIs)

- **KPI-1: OEE Médio Geral:** Baseline ~65% → Target 75% (Jun/2026)
  - Medição: Calculado automaticamente pelo sistema (view materializada)
  - Frequência: Revisão mensal em reunião de gestão

- **KPI-2: Uptime do Sistema:** Target >99.5% durante horário produtivo (6h-22h, seg-sex)
  - Medição: Monitoramento Supabase + Service Worker offline metrics
  - Frequência: Dashboard em tempo real + relatório semanal

- **KPI-3: Contemporaneidade de Apontamentos:** Target >98%
  - Definição: % de apontamentos com timestamp dentro de 10min da ocorrência
  - Medição: Query SQL com diferença entre timestamp registro e timestamp ocorrência
  - Frequência: Relatório semanal para Qualidade

- **KPI-4: Taxa de Adoção (Operadores):** Target >95%
  - Definição: % de turnos com pelo menos 1 apontamento registrado
  - Medição: Query SQL contando registros por turno/linha
  - Frequência: Dashboard diário para supervisores

- **KPI-5: Tempo Médio de Resposta (Dashboards):** Target <2 segundos
  - Definição: P95 de tempo de carregamento de dashboards
  - Medição: React Query metrics + Google Lighthouse
  - Frequência: Monitoramento contínuo + revisão quinzenal

- **KPI-6: Redução de Paradas Não Planejadas:** Target -25% (Dez/2026)
  - Baseline: Horas de paradas não planejadas Jan/2026
  - Medição: Query SQL somando paradas não planejadas por mês
  - Frequência: Revisão mensal

---

## MVP Scope

### Core Features (Must Have)

**1. Apontamentos Contemporâneos (P0 - Crítico)**
- **Descrição:** Interface simplificada para operadores registrarem paradas, trocas de turno, perdas de qualidade
- **Rationale:** Contemporaneidade é requisito BPF não-negociável. Sem isso, sistema não pode ser validado.
- **Funcionalidades:**
  - Formulário com campos obrigatórios: linha, turno, tipo de evento, código de parada (do Book), quantidade afetada
  - Validação em tempo real (campos obrigatórios, SKU válido, operador autenticado)
  - Buffer local (IndexedDB) com sync automático quando conexão retornar
  - Feedback visual de status (salvo localmente / sincronizado com servidor)
- **Critério de Aceitação:** Operador consegue registrar apontamento em <30s e recebe confirmação visual

**2. Integração CLPs KEYENCE (P0 - Crítico)**
- **Descrição:** Gateway SICFAR que lê dados de sensores e atualiza Supabase com produção/rejeição acumuladas
- **Rationale:** Dados automáticos de produção são base para cálculo de Performance e Qualidade.
- **Funcionalidades:**
  - Worker que faz tail de arquivo TXT (4 registros/segundo)
  - Agregação em memória por Ordem de Produção
  - UPDATE Supabase a cada 5 segundos (tabela `ordens_producao_ativas`)
  - Retry com exponential backoff se Supabase estiver offline
- **Critério de Aceitação:** Dados de 10 linhas SPEP fluem para Supabase em tempo real (<10s latência)

**3. Cálculo de OEE (View Materializada) (P0 - Crítico)**
- **Descrição:** View materializada PostgreSQL com fórmulas conforme docs/project/05-Metodologia-Calculo.md
- **Rationale:** Core do sistema. Sem cálculo correto, dashboards não têm valor.
- **Funcionalidades:**
  - Fórmulas de Disponibilidade, Performance, Qualidade implementadas
  - Agregação por linha, turno, dia, semana, mês
  - Refresh via pg_cron (a cada 1h)
  - Validação com planilhas atuais (Sávio Rafael)
- **Critério de Aceitação:** OEE calculado bate com planilhas de validação (±2% tolerância)

**4. Dashboards Interativos (Top 4 Gráficos) (P0 - Crítico)**
- **Descrição:** Visualizações essenciais para validação com usuários
- **Gráficos Obrigatórios no MVP:**
  1. **Velocímetro de OEE** (ECharts gauge) - Visão executiva por linha
  2. **Pareto de Paradas** (Recharts) - Principal ferramenta de gestão
  3. **Componentes do OEE** (Recharts barras) - Diagnóstico (qual componente está baixo?)
  4. **Tabela Consolidada** (TanStack Table) - Dados detalhados com filtros
- **Filtros Dinâmicos:**
  - Setor (SPEP, SPPV, Líquidos, CPHD)
  - Linha (dropdown por setor)
  - Período (últimas 24h, semana, mês)
  - Data range customizado (Shadcn Popover com date picker)
- **Critério de Aceitação:** Gestores conseguem gerar Pareto de paradas filtrado em <2 minutos

**5. Assinatura Eletrônica & Audit Trail (P0 - Crítico)**
- **Descrição:** Conformidade CFR 21 Part 11 + ALCOA+
- **Rationale:** Sem compliance, sistema não pode operar em ambiente regulado.
- **Funcionalidades:**
  - Fluxo: Operador registra (status `draft`) → Supervisor assina (status `assinado`)
  - Interface de assinatura: Modal com lista de registros + checkbox selection + botão "Assinar Selecionados"
  - Re-autenticação: PIN/Senha para confirmar identidade
  - Hash SHA-256 do registro + timestamp + IP + device salvos em `assinaturas_eletronicas`
  - Triggers PostgreSQL para auditoria: salvam quem/quando/o quê/antes/depois em `*_audit` tables
- **Critério de Aceitação:** Consultor Rafael Gusmão valida que sistema atende CFR 21 Part 11

**6. Offline-First & Sessões Longas (P0 - Crítico)**
- **Descrição:** Garantir zero data loss durante turnos de 8h+
- **Rationale:** Contemporaneidade depende de sistema estável. Desconexão = não-conformidade.
- **Funcionalidades:**
  - Service Worker PWA com cache de assets + background sync
  - IndexedDB como buffer local (FIFO, max 10.000 registros)
  - Keep-alive automático (refresh token a cada 50min)
  - UI de status de conexão (badge Online/Offline)
  - Auto-reconnect com exponential backoff (3 tentativas)
- **Critério de Aceitação:** Sessão de 8h sem desconexão em teste de stress

### Out of Scope for MVP

**Recursos excluídos do MVP (serão considerados pós-MVP):**

- ❌ **Mobile Apps Nativos** (React Native/Expo) - PWA é suficiente para MVP
- ❌ **4 gráficos restantes** (Rosca, Resumo Horas, MTBF, MTTR) - Serão implementados após validação do core
- ❌ **Integração TOTVS ERP** - Dados de SKUs/velocidades serão cadastrados manualmente no MVP
- ❌ **Book de Paradas CRUD** - Hierarquia de 5 níveis será seed data (Atividade 06 pendente)
- ❌ **Analytics Avançado / Machine Learning** - Predição de falhas fica para fase 2
- ❌ **37 linhas completas** - MVP é apenas **10 linhas SPEP** (rollout gradual pós-validação)
- ❌ **Multi-idioma** - Apenas português brasileiro
- ❌ **Notificações Push** - Alertas serão visualizados no dashboard (não push)
- ❌ **Otimização de Performance Incremental** - View materializada suficiente (tabelas agregadas ficam pós-MVP)
- ❌ **Export PDF Avançado** - Export Excel básico (via XLSX library), PDF fica fase 2

### MVP Success Criteria

**O MVP será considerado bem-sucedido quando:**

1. ✅ **Cálculos validados:** OEE calculado pelo sistema bate com planilhas de Sávio Rafael (±2% tolerância)
2. ✅ **Compliance aprovado:** Consultor Rafael Gusmão valida que assinatura eletrônica e audit trail atendem CFR 21 Part 11
3. ✅ **Adoção operacional:** >90% dos operadores das 10 linhas SPEP registram apontamentos contemporâneos (dentro de 10min)
4. ✅ **Sessões estáveis:** Sistema mantém uptime >99% durante turnos de 8h+ (teste de stress com 30 usuários simultâneos)
5. ✅ **Dashboards funcionais:** Gestores conseguem gerar Pareto de paradas filtrado em <2 minutos
6. ✅ **IoT funcionando:** Dados de sensores KEYENCE fluem para dashboards com latência <10s
7. ✅ **Apresentação aprovada:** Demo final (29/Dez/2025) aprovada por Diretoria + Maxwell + Sávio + Consultor

**Condições de Falha (Stop Criteria):**
- ❌ Cálculos de OEE não batem com validação (erro > 5%)
- ❌ Consultor reprova compliance (não atende CFR 21 Part 11)
- ❌ Adoção < 70% após 2 semanas de piloto (resistência dos operadores)
- ❌ Uptime < 95% em testes de stress (sessões instáveis)

---

## Post-MVP Vision

### Phase 2 Features (Q1-Q2 2026)

**1. Expansão para 37 Linhas Completas**
- Rollout SPPV (10 linhas) → Líquidos (5 linhas) → CPHD (2 linhas)
- Configuração de Books de Paradas específicos por setor
- Treinamentos presenciais (4h por setor, total 16h)
- Timeline: Jan-Mar/2026

**2. Integração TOTVS ERP**
- API SICFAR → Supabase para sincronização de SKUs, velocidades nominais, lotes
- ETL automático (sync a cada 1h)
- Validação de lotes contra ordens de produção
- Eliminação de cadastros manuais
- Timeline: Fev-Abr/2026

**3. Book de Paradas CRUD Completo**
- Interface de cadastro da hierarquia de 5 níveis (Classe → Grande Parada → Apontamento → Grupo → Detalhamento)
- Permissões: Gestores cadastram, Qualidade aprova, Operadores apenas visualizam
- Importação de books existentes (Excel → SQL seed)
- Validação por linha (cada linha tem book específico)
- Timeline: Mar-Mai/2026 (aguardando Atividade 06)

**4. Gráficos Adicionais (4 restantes)**
- Gráfico de Rosca (Paradas Planejadas vs Não Planejadas)
- Resumo de Horas (barras empilhadas: Disponível, Operação, Paradas)
- MTBF e MTTR ao longo do tempo (gráficos de linhas)
- Timeline: Abr-Mai/2026

**5. Otimização de Performance Incremental**
- Refatorar view materializada → tabela física `agregados_linha_turno`
- Triggers leves para atualização incremental (não recalcula tudo)
- Particionamento por mês para queries rápidas
- Cálculos em tempo real sem sobrecarga
- Timeline: Mai-Jun/2026

### Long-term Vision (2026-2027)

**Ano 1 (2026):**
- Sistema validado (QI/QO/QP) e operando em todas 37 linhas
- OEE médio geral estabilizado em 75%+ (vs ~65% baseline)
- Gestão preditiva de manutenção (MTBF/MTTR driving decisions)
- Redução de 25% em paradas não planejadas

**Ano 2 (2027):**
- **Mobile Apps Nativos** (React Native/Expo) para apontamentos móveis
- **Analytics Avançado** com Machine Learning:
  - Predição de falhas (Random Forest treinado em 12 meses de histórico)
  - Recomendações automáticas de priorização de manutenção
  - Anomaly detection (alertas quando OEE cai abaixo de padrão esperado)
- **Integração CLPs Direto** (Bottelpack, Pró Maquia, Bausch Strobbel via OPC UA) - bypass SICFAR
- **Expansão para outros sites** (se SicFar tiver múltiplas fábricas)

**Visão 3-5 Anos (2028-2030):**
- **Digital Twin da Fábrica:** Simulação de cenários "what-if" antes de implementar mudanças
- **Licenciamento B2B:** SysOEE como produto para outras pharmas (receita adicional)
- **Blockchain para Auditoria Imutável:** Compliance para auditorias internacionais (FDA, EMA)
- **Smart Contracts:** Validações automáticas de conformidade

### Expansion Opportunities

**1. Vertical (Pharma):**
- Expandir para outras fábricas do grupo Farmace (se existirem)
- Oferecer SysOEE como SaaS para pharmas de médio porte (20-50 linhas)
- Parceria com consultorias de validação (Rafael Gusmão) para co-selling

**2. Horizontal (Indústrias Reguladas):**
- Adaptar para indústrias de alimentos (HACCP, BPF similares)
- Adaptar para indústrias de cosméticos (ANVISA RDC 48/2013)
- Adaptar para indústrias de dispositivos médicos (ISO 13485)

**3. Produto (Features Premium):**
- Módulo de **Rastreabilidade** integrado (competir com Tractan)
- Módulo de **LIMS** (Laboratory Information Management System)
- Módulo de **BPR Eletrônico** (Batch Production Record)

**4. Tecnologia (Inovação):**
- **Computer Vision:** Câmeras para contagem automática de produtos (elimina sensores KEYENCE)
- **NLP (Natural Language Processing):** Operador registra parada por voz (hands-free)
- **Edge AI:** Modelos de ML rodando localmente em gateways (reduz latência)

---

## Technical Considerations

### Platform Requirements

- **Target Platforms:** Web (desktop e mobile via responsive design)
- **Browser Support:**
  - **Desktop:** Chrome 90+, Edge 90+, Firefox 88+ (últimas 2 versões)
  - **Mobile:** Chrome Mobile, Safari iOS 14+ (PWA support)
  - ❌ **NÃO suportar:** Internet Explorer (deprecated)
- **Performance Requirements:**
  - **P95 Page Load:** <2 segundos (dashboard principal)
  - **P95 Interaction:** <500ms (cliques, filtros)
  - **Concurrent Users:** 100-500 usuários (10 linhas MVP → 37 linhas completo)
  - **Data Volume:** ~35.000 apontamentos/mês (37 linhas) + agregações
  - **Offline Support:** Funcionar completamente offline por até 8h (1 turno)

### Technology Preferences

**Frontend:**
- **Framework:** React 19 (latest)
- **Build Tool:** Vite 7 (fast refresh, optimized builds)
- **Styling:** Tailwind CSS v4 (utility-first, responsive)
- **Components:** Shadcn (accessible, customizable, Tailwind-native)
- **Charts:** ECharts (velocímetro, Pareto) + Recharts (barras, linhas, rosca)
- **Tables:** TanStack Table (ordenação, filtros, paginação)
- **Forms:** React Hook Form + Zod (validação type-safe)
- **State Management:** React Query (server state) + Zustand (client state, se necessário)
- **PWA:** Vite PWA Plugin + Workbox (service worker)
- **Offline Storage:** IndexedDB (via Dexie.js)

**Backend:**
- **BaaS:** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Database:** PostgreSQL 15+ (via Supabase)
- **Authentication:** Supabase Auth (email/password + RLS)
- **Real-time:** Supabase Realtime (WebSockets) para dashboards live
- **Scheduled Jobs:** pg_cron (refresh de view materializada)

**Infrastructure:**
- **Hosting Frontend:** Vercel (deploy automático, CDN global, Edge Network)
- **Hosting Backend:** Supabase Cloud (plano Pro)
- **Gateway SICFAR:** Windows Server 2019 on-premise (já existente)
- **Monitoring:** Supabase Dashboard + Vercel Analytics
- **Backup:** Supabase PITR (Point-in-Time Recovery, 7 dias)

**Integrations:**
- **CLPs (KEYENCE):** FTP → Tail TXT → Gateway SICFAR (Node.js worker)
- **TOTVS ERP:** API REST (pós-MVP)
- **Email (Alertas):** Supabase Edge Functions + Resend/SendGrid (pós-MVP)

### Architecture Considerations

**Repository Structure:**
```
SysOEE/
├── apps/
│   ├── web/               # React 19 frontend (Vite)
│   ├── gateway/           # Gateway SICFAR (Node.js worker)
│   └── docs/              # Documentação (Markdown)
├── packages/
│   ├── ui/                # Shadcn components compartilhados
│   ├── db/                # Supabase types (gerados via CLI)
│   └── config/            # Configurações compartilhadas (ESLint, Prettier, Tailwind)
├── supabase/
│   ├── migrations/        # SQL migrations (versionadas)
│   ├── seed.sql           # Dados iniciais (users, linhas, books)
│   └── functions/         # Edge Functions (se necessário)
└── scripts/
    └── deploy.sh          # Script de deploy automatizado
```

**Service Architecture:**
- **Monorepo:** Turborepo (apps/packages compartilham código)
- **Deployment:**
  - Frontend: Vercel (CD via GitHub)
  - Gateway: Windows Server 2019 on-premise (systemd/PM2)
  - Database: Supabase Cloud (managed)

**Integration Requirements:**
- **Gateway SICFAR ↔ Supabase:**
  - Conexão: HTTPS (Supabase REST API)
  - Autenticação: Service Role Key (backend-only, NÃO expor no frontend)
  - Rate Limit: 100 req/min (Supabase Pro)
  - Retry: Exponential backoff (3 tentativas)
- **Frontend ↔ Supabase:**
  - Conexão: HTTPS + WebSockets (Realtime)
  - Autenticação: JWT (anon key + RLS)
  - Caching: React Query (stale time 5min)

**Security/Compliance:**
- **ALCOA+ Compliance:**
  - Atribuível: RLS garante user_id sempre preenchido
  - Legível: UI clara, dados não codificados
  - Contemporâneo: Offline buffer + timestamp automático
  - Original: Triggers de auditoria (imutabilidade)
  - Exato: Validações Zod no frontend + constraints PostgreSQL
  - Completo: Campos obrigatórios forçados
  - Consistente: Foreign keys + transactions
  - Durável: Backups PITR (7 dias) + replicação Supabase
  - Disponível: Uptime SLA 99.9% (Supabase Pro)

- **CFR 21 Part 11:**
  - Assinatura eletrônica: Hash SHA-256 + re-autenticação
  - Audit trail: Triggers PostgreSQL (quem/quando/o quê)
  - Controle de acesso: RLS policies granulares
  - Validação: Documentação QI/QO/QP

- **Segurança de Dados:**
  - HTTPS obrigatório (TLS 1.3)
  - Senhas hasheadas (bcrypt via Supabase Auth)
  - RLS policies impedem data leakage entre setores
  - Service Role Key armazenada em variável de ambiente (não hardcoded)

---

## Constraints & Assumptions

### Constraints

**Budget:**
- **Orçamento total:** R$ 400-800k (build + validação + treinamento)
- **Breakdown estimado:**
  - Desenvolvimento: R$ 250-400k (time interno + consultoria frontend/backend)
  - Infraestrutura: R$ 50-100k/ano (Supabase Pro + Vercel + ferramentas)
  - Validação: R$ 50-150k (consultor Rafael Gusmão + documentação QI/QO/QP)
  - Treinamento: R$ 30-50k (material + horas de treinadores)
  - Contingência: R$ 20-100k (10-15% do total)
- **Custo recorrente anual:** R$ 80-150k (Supabase + Vercel + manutenção)

**Timeline:**
- **Protótipo SPEP:** Primeira semana de Dezembro/2025 (~6 semanas a partir de agora)
- **MVP Validado:** Janeiro/2026 (rollout em 10 linhas SPEP)
- **37 Linhas Completas:** Março/2026
- **Sistema Validado (QI/QO/QP):** Agosto/2026
- **Risco:** Timeline apertada (6 semanas para protótipo é agressivo)

**Resources:**
- **Equipe Interna (SicFar):**
  - 1 Líder de TI (Cícero Emanuel) - 40% dedicação
  - 1 Gerente de Processos (Sávio Rafael) - validação de cálculos, 20% dedicação
  - 1 Gerente Industrial (Maxwell Cruz) - aprovações, 10% dedicação
- **Equipe Externa (Consultoria):**
  - 1 Dev Full-stack Sênior - 100% dedicação (6 semanas)
  - 1 Designer UX - 25% dedicação (1 dia/semana)
  - 1 Consultor Validação (Rafael Gusmão) - marcos críticos (3-4 reuniões)
- **Operadores para Piloto:** 20-30 operadores SPEP (treinamento 2h cada)

**Technical:**
- **Infraestrutura On-Premise Imutável:**
  - Windows Server 2019 (gateway SICFAR não pode ser substituído)
  - Sensores KEYENCE geram TXT via FTP (protocolo legado, não pode mudar)
  - Áreas limpas têm restrições: computadores fixos (não tablets/celulares no MVP)
- **Integrações Complexas:**
  - TOTVS API pode ter limitações (descobrir em runtime)
  - CLPs de 3 fabricantes diferentes (Bottelpack, Pró Maquia, Bausch Strobbel)
- **Regulatório:**
  - Validação formal (QI/QO/QP) adiciona 6-12 meses ao timeline
  - Mudanças pós-validação requerem change control (burocracia)

### Key Assumptions

**Premissas que, se invalidadas, afetam escopo/timeline:**

- ✅ **Supabase atende requisitos pharma:** Assumimos que Supabase Pro + customizações (triggers, RLS) são suficientes para ALCOA+/CFR 21 Part 11
  - **Risco se falso:** Migrar para PostgreSQL self-hosted (adiciona 4-6 semanas + custo infra)

- ✅ **Gateway SICFAR tem capacidade:** Assumimos que Windows Server 2019 aguenta processar 4 req/s × 10 linhas = 40 req/s
  - **Risco se falso:** Upgrade de servidor ou redistribuição de carga

- ✅ **Operadores aceitam PWA:** Assumimos que PWA instalado é suficiente (não precisa app nativo)
  - **Risco se falso:** Desenvolver app React Native (adiciona 8-12 semanas)

- ✅ **View materializada é performática:** Assumimos que refresh 1h é aceitável para MVP
  - **Risco se falso:** Implementar tabelas agregadas + triggers incrementais (adiciona 3-4 semanas)

- ✅ **Book de Paradas existe:** Assumimos que Atividade 06 será disponibilizada antes do desenvolvimento
  - **Risco se falso:** Atrasar feature de CRUD de paradas para pós-MVP

- ✅ **Consultor valida remotamente:** Assumimos que Rafael Gusmão pode validar assinatura eletrônica via reuniões + documentação (não precisa presencial)
  - **Risco se falso:** Custo/tempo adicional para visitas presenciais

- ✅ **Internet estável em áreas limpas:** Assumimos que WiFi/cabo existe e é confiável (offline é exceção, não regra)
  - **Risco se falso:** Investir em infraestrutura de rede (fora do escopo TI)

- ✅ **Dados históricos não são críticos:** Assumimos que sistema começa do zero (sem migração de dados)
  - **Risco se falso:** Projeto de ETL de dados históricos (adiciona 4-6 semanas)

---

## Risks & Open Questions

### Key Risks

**RISK-1: Timeline Agressivo (6 Semanas para Protótipo) - PROBABILIDADE: ALTA / IMPACTO: ALTO**
- **Descrição:** Protótipo SPEP em primeira semana de Dezembro/2025 é muito apertado (~6 semanas)
- **Impacto:** Se atrasar, pode comprometer meta Janeiro/2026 de rollout MVP
- **Mitigação:**
  - Priorizar impiedosamente: apenas P0 features (cortar P1/P2 do protótipo)
  - Contratar dev sênior externo (não depender só de equipe interna)
  - Roadmap semanal detalhado com milestones (semana 1, 2, 3... conforme brainstorming)
  - Preparar plano B: Se não entregar protótipo em Dez, postergar para Jan e ajustar expectativas

**RISK-2: Supabase Não Atende Requisitos Pharma - PROBABILIDADE: MÉDIA / IMPACTO: ALTO**
- **Descrição:** Supabase pode não ter controles suficientes para ALCOA+ (ex: imutabilidade de logs, retention)
- **Impacto:** Forçaria migração para PostgreSQL self-hosted (adiciona 4-6 semanas + complexidade)
- **Mitigação:**
  - Spike técnico (Semana 1): Implementar PoC de audit trail com triggers PostgreSQL
  - Validar com consultor Rafael Gusmão antes de codificar tudo
  - Plano B: PostgreSQL no Azure/AWS (managed, controle maior que Supabase)

**RISK-3: Baixa Adoção por Operadores (UX Ruim / Sistema Instável) - PROBABILIDADE: MÉDIA / IMPACTO: CRÍTICO**
- **Descrição:** Se operadores resistem ao uso, contemporaneidade é comprometida → não-conformidade BPF
- **Impacto:** Sistema tecnicamente pronto, mas inutilizável (falha de validação QP - Performance Qualification)
- **Mitigação:**
  - Envolver operadores desde Semana 3 (testes de usabilidade)
  - Benchmark UX com Evocon (melhor do mercado)
  - Garantir uptime >99% (offline-first é crítico)
  - Treinamentos práticos (não só teóricos)

**RISK-4: Validação GMP Demora 12+ Meses - PROBABILIDADE: MÉDIA / IMPACTO: MÉDIO**
- **Descrição:** Timeline de validação (QI/QO/QP) pode ser mais longo que 6 meses esperados
- **Impacto:** Sistema funcionando mas não validado (uso limitado, auditorias podem questionar)
- **Mitigação:**
  - Começar documentação QI/QO/QP em paralelo ao desenvolvimento (não depois)
  - Contratar consultor de validação desde início (não só na fase final)
  - Aceitar uso em "modo piloto não validado" até aprovação formal (com risk assessment documentado)

**RISK-5: Integração TOTVS Mais Complexa Que Esperado - PROBABILIDADE: MÉDIA / IMPACTO: MÉDIO**
- **Descrição:** APIs TOTVS podem não expor dados necessários (SKUs, velocidades nominais) facilmente
- **Impacto:** Cadastro manual persistir (aumenta carga operacional, risco de erro)
- **Mitigação:**
  - Fase de discovery com TI TOTVS (mapear APIs disponíveis) - Semana 1
  - Aceitar cadastro manual no MVP (integração fica pós-MVP)
  - Plano B: ETL via queries SQL diretas no banco TOTVS (se APIs não existirem)

**RISK-6: Gateway SICFAR Não Aguenta Carga (40 req/s × 37 Linhas) - PROBABILIDADE: BAIXA / IMPACTO: MÉDIO**
- **Descrição:** Windows Server 2019 pode não processar 148 req/s (37 linhas × 4 req/s)
- **Impacto:** Latência alta, perda de dados, dashboards desatualizados
- **Mitigação:**
  - Teste de stress na Semana 4 (MVP com 10 linhas = 40 req/s)
  - Agregação no gateway (UPDATE vs INSERT) reduz carga drasticamente
  - Plano B: Múltiplos gateways (1 por setor) se servidor único não aguentar

### Open Questions

**Perguntas que precisam ser respondidas antes/durante desenvolvimento:**

**Q1: Como lidar com mudança de SKU no meio de um turno?**
- Operador fecha Ordem de Produção atual e abre nova?
- Sistema permite múltiplas ordens ativas simultaneamente na mesma linha?
- **Responsável:** Sávio Rafael (Processos)
- **Prazo:** Antes da Semana 2 (afeta schema de banco)

**Q2: Qual estratégia de backup do buffer IndexedDB?**
- Se navegador limpar cache, dados não sincronizados são perdidos?
- Implementar export periódico para localStorage também?
- Service Worker pode bloquear limpeza de cache do navegador?
- **Responsável:** Dev Sênior
- **Prazo:** Spike técnico Semana 1

**Q3: Como fazer updates após validação QI/QO/QP sem invalidar sistema?**
- Change control permite hot-fixes de bugs críticos?
- Features novas requerem re-validação completa ou parcial?
- **Responsável:** Consultor Rafael Gusmão
- **Prazo:** Antes de submeter para validação (Semana 6)

**Q4: Retenção de dados - Quanto tempo guardar registros?**
- Dados de sensores (brutos): 7 dias? 30 dias? Indefinido?
- Agregados: Indefinido (compliance)?
- Auditoria: Mínimo 5 anos (GMP)?
- **Responsável:** Qualidade + Regulatório
- **Prazo:** Antes da Semana 3 (afeta estratégia de particionamento)

**Q5: Quem atualiza velocidades nominais e com que frequência?**
- Engenharia de Processos cadastra?
- Requer assinatura eletrônica (CFR 21 Part 11)?
- Alteração retroativa (afeta cálculos históricos)?
- **Responsável:** Sávio Rafael (Processos) + Engenharia
- **Prazo:** Antes da Semana 2 (afeta CRUD de SKUs)

**Q6: Alertas em tempo real - Sistema deve notificar supervisores?**
- Email? SMS? Dashboard badge?
- Quando? (OEE < 70%? Parada > 30min?)
- **Responsável:** Supervisores + Maxwell
- **Prazo:** Pós-MVP (não crítico para protótipo)

**Q7: Permissões granulares - Quem vê o quê?**
- Operador pode ver OEE da própria linha?
- Supervisor vê apenas seu setor ou tudo?
- Diretoria vê tudo sempre?
- **Responsável:** Maxwell (Gerente Industrial) + RH
- **Prazo:** Antes da Semana 2 (afeta RLS policies)

**Q8: Estratégia de testes durante validação - QP requer testes de stress?**
- Performance Qualification exige testes com 500 usuários?
- Ambiente de homologação precisa ser espelho de produção?
- **Responsável:** Consultor Rafael Gusmão + Qualidade
- **Prazo:** Antes de iniciar validação (mês 6)

### Areas Needing Further Research

**RESEARCH-1: Experiência de Pharmas com Supabase em Ambientes Validados**
- **Objetivo:** Encontrar cases de uso de Supabase (ou Firebase, PlanetScale) em pharma com sistema validado
- **Método:** LinkedIn outreach, fóruns GMP, consultar Rafael Gusmão
- **Prazo:** Semana 1 (crítico para decisão build)

**RESEARCH-2: Benchmarking de UX (Evocon Trial)**
- **Objetivo:** Entender o que torna Evocon a melhor UX do mercado (4.8/5 em reviews)
- **Método:** Trial gratuito 14 dias + análise heurística + testes com operadores
- **Prazo:** Semana 2-3 (informar design de interfaces)

**RESEARCH-3: Protocolos de CLPs (OPC UA / Modbus)**
- **Objetivo:** Avaliar viabilidade de integração direta (bypass SICFAR) para pós-MVP
- **Método:** Pesquisa de bibliotecas Node.js (node-opcua), consultar fabricantes (Bottelpack, etc.)
- **Prazo:** Pós-MVP (não crítico agora, mas informar roadmap futuro)

**RESEARCH-4: Migração de Dados Históricos (Se Existirem)**
- **Objetivo:** Mapear se SicFar tem dados históricos de OEE em planilhas/TOTVS que devem ser migrados
- **Método:** Entrevista com Sávio Rafael, análise de planilhas atuais
- **Prazo:** Semana 1 (se SIM, adiciona escopo de ETL)

**RESEARCH-5: Processo de Validação GMP Específico da SicFar**
- **Objetivo:** Entender workflow de validação interno (quem aprova, documentação necessária, SLAs)
- **Método:** Reunião com Qualidade + Rafael Gusmão
- **Prazo:** Semana 4 (antes de submeter protótipo para validação)

---

## Appendices

### A. Research Summary

**Brainstorming Session (18/Nov/2025)**
- **Técnicas usadas:** Question Storming, SCAMPER, Morphological Analysis, Analogical Thinking, First Principles, Five Whys
- **Decisões técnicas principais:**
  - Stack: React 19 + Vite 7 + Tailwind v4 + Shadcn + Supabase
  - Integração IoT: Agregação no gateway (UPDATE vs INSERT) → Redução 35.000x de dados
  - Assinatura eletrônica: Fluxo híbrido (operador registra, supervisor assina batch)
  - Sessões longas: Offline-first com IndexedDB + Service Worker PWA
  - Gráficos: Stack híbrida (ECharts para complexos, Recharts para simples)
  - Performance: View materializada MVP (tabelas agregadas pós-MVP)
- **Insights críticos:**
  - Compliance-first: Assinatura eletrônica e auditoria são fundação (não add-ons)
  - Simplicidade pragmática: Começar simples vs over-engineering prematuro
  - Zero data loss: Offline-first crítico para contemporaneidade (ALCOA+)
  - UX é risco de compliance: Operadores que não usam = contemporaneidade comprometida

**Competitor Analysis (18/Out/2025)**
- **Concorrentes analisados:** Tractan, Aloee, TOTVS, Evocon, PPI-Multitask, WEG, Cogtive
- **Top 3 Finalistas:**
  1. **Tractan** (Buy Integrated) - Melhor fit pharma, experiência BPF, custo R$ 450k-1.35M (3 anos)
  2. **Aloee** (Buy Modern OEE) - Deployment rápido, UX moderna, custo R$ 648k-2.6M (3 anos)
  3. **Build SysOEE** (Build Custom) - 100% aderência, pharma-native, custo R$ 640k-1.05M (3 anos)
- **Gaps de mercado:**
  - Gap 1: OEE Pharma-Native (ALCOA+/BPF embarcado)
  - Gap 2: UX + Integração ERP (ninguém tem os dois)
  - Gap 3: Multi-Setor com Books Customizados
  - Gap 4: Velocidade Nominal por SKU (vs máquina)
- **Recomendação:** Cenário A (Tractan piloto → Build SysOEE faseado) é mais robusto, mas timeline é 18-24 meses
- **Decisão:** Build SysOEE foi escolhido (baseado em reuniões internas não documentadas aqui)

### B. Stakeholder Input

**Maxwell Cruz Cortez (Gerente Industrial):**
- Prioridade: Compliance pharma > Velocidade de implantação
- Orçamento aprovado: R$ 400-800k (range amplo, preferir extremo inferior)
- Timeline: Janeiro/2026 é desejável, mas flexível se justificado

**Sávio Correia Rafael (Gerente de Processos):**
- Dor atual com TOTVS: UX ruim, operadores resistem, apontamentos não contemporâneos
- Expectativa: Sistema simples, intuitivo, que operadores adotem naturalmente
- Validação: Disponível para validar cálculos de OEE (±2% tolerância aceitável)

**Rafael Gusmão (Consultor de Validação):**
- Validação de marcos principais é obrigatória
- Assinatura eletrônica e audit trail devem atender CFR 21 Part 11 (sem exceções)
- Documentação QI/QO/QP deve começar desde o desenvolvimento (não depois)

**Operadores (Feedback Indireto via Supervisores):**
- Sistema atual (TOTVS) é "muito complicado e trava"
- Preferem Diário de Bordo em papel (simplicidade, confiabilidade)
- Maior resistência: Sistemas que desconectam durante o turno

### C. References

**Documentação Interna:**
- `docs/project/00-Visao-Geral-Projeto.md` - Visão geral do projeto
- `docs/project/04-Glossario-Termos.md` - Glossário completo do domínio
- `docs/project/05-Metodologia-Calculo.md` - Fórmulas de OEE (CRÍTICO)
- `docs/project/07-Identificacao-Fontes-Dados.md` - Integrações CLPs, TOTVS
- `docs/project/08-Indicadores-Secundarios.md` - MTBF, MTTR, Taxa de Utilização
- `docs/project/09-Validacao-Tecnica-SicFar.md` - Requisitos técnicos, gráficos
- `docs/brainstorming-session-results.md` - Decisões técnicas e arquiteturais
- `docs/competitor-analysis.md` - Análise competitiva completa (73 páginas)
- `docs/competitor-analysis-executive.md` - Executive summary da análise

**Regulatório:**
- IN 134 ANVISA (Integridade de Dados)
- RDC 658 ANVISA (Requisitos de BPF)
- CFR 21 Part 11 (FDA - Registros Eletrônicos e Assinaturas Eletrônicas)

**Técnico:**
- React 19 Documentation: https://react.dev
- Supabase Documentation: https://supabase.com/docs
- Vite 7 Documentation: https://vitejs.dev
- Tailwind CSS v4: https://tailwindcss.com
- ECharts Documentation: https://echarts.apache.org
- Recharts Documentation: https://recharts.org
- TanStack Table: https://tanstack.com/table

**Benchmarking:**
- Evocon (UX reference): https://www.evocon.com
- Aloee: https://www.aloee.com.br
- Tractan: https://www.tractan.com.br

---

## Next Steps

### Immediate Actions

**Ação 1: Validar e Aprovar Project Brief**
- **Responsável:** Cícero Emanuel (líder)
- **Participantes:** Maxwell, Sávio, Rafael Gusmão
- **Prazo:** 1 semana (até 25/Nov/2025)
- **Entregável:** Project Brief aprovado com assinaturas

**Ação 2: Contratar Desenvolvedor Sênior Full-Stack**
- **Responsável:** Cícero Emanuel + RH
- **Perfil:** Experiência com React + PostgreSQL + PWA
- **Prazo:** 1 semana (início 25/Nov/2025)
- **Entregável:** Contrato assinado, dev onboarded

**Ação 3: Spike Técnico - Audit Trail com Supabase**
- **Responsável:** Dev Sênior
- **Objetivo:** PoC de triggers PostgreSQL + tabela de auditoria
- **Prazo:** 3 dias (26-28/Nov/2025)
- **Entregável:** PoC funcional + documentação de viabilidade

**Ação 4: Mapear APIs TOTVS Disponíveis**
- **Responsável:** Cícero Emanuel + TI TOTVS
- **Objetivo:** Listar APIs de SKUs, velocidades nominais, lotes
- **Prazo:** 1 semana (até 2/Dez/2025)
- **Entregável:** Documento de integração TOTVS (viável ou não)

**Ação 5: Validar Book de Paradas (Atividade 06)**
- **Responsável:** Sávio Rafael
- **Objetivo:** Confirmar se Atividade 06 será disponibilizada ou usar seed data
- **Prazo:** 1 semana (até 2/Dez/2025)
- **Entregável:** Hierarquia de 5 níveis documentada ou decisão de adiar CRUD

**Ação 6: Kickoff de Desenvolvimento**
- **Responsável:** Cícero Emanuel
- **Participantes:** Dev Sênior, Designer UX, Sávio (validação), Rafael (consultor)
- **Prazo:** 2/Dez/2025 (início Semana 1 do roadmap)
- **Entregável:** Roadmap detalhado 6 semanas + repo setup + primeiro commit

**Ação 7: Setup de Infraestrutura**
- **Responsável:** Dev Sênior
- **Tarefas:**
  - Criar projeto Supabase Pro
  - Configurar Vercel (deploy automático)
  - Setup monorepo Turborepo
  - Configurar GitHub Actions (CI/CD)
- **Prazo:** Semana 1 (até 6/Dez/2025)
- **Entregável:** Infraestrutura funcionando + deploy de hello world

**Ação 8: Trial Evocon (Benchmarking UX)**
- **Responsável:** Designer UX + Cícero
- **Objetivo:** Análise heurística + testes com 2-3 operadores
- **Prazo:** Semana 2 (9-13/Dez/2025)
- **Entregável:** Relatório de UX learnings + guidelines de design

---

### PM Handoff

Este Project Brief fornece o contexto completo para o **Sistema OEE para SicFar**.

**Próximo passo:**

O PM (ou Dev Lead) deve:

1. **Revisar este brief** integralmente com stakeholders (Maxwell, Sávio, Rafael)
2. **Criar backlog inicial** baseado no MVP Scope (seção "Core Features")
3. **Definir sprints de 1 semana** seguindo roadmap detalhado do brainstorming (Semana 1-6)
4. **Configurar ferramentas de projeto:**
   - GitHub Projects (ou Jira) para tracking
   - Slack/Teams para comunicação
   - Google Drive para documentação de validação (QI/QO/QP)
5. **Agendar cerimônias:**
   - Daily standups (15min, 9h)
   - Sprint review (sexta, 16h) com stakeholders
   - Retrospectiva (sexta, 17h) apenas time
6. **Iniciar Semana 1 do roadmap:**
   - Setup base (Vite + React + Supabase)
   - Escalabilidade (SupabaseKeepAlive + OfflineBuffer)
   - Schema inicial (users, linhas, setores, assinaturas)
   - Triggers de auditoria

**Questões ou clarificações?**

Entre em contato com **Cícero Emanuel da Silva** (Líder de TI) ou consulte a documentação em `docs/project/`.

---

**Boa sorte com o desenvolvimento! 🚀**

*Este documento foi gerado pela Business Analyst Mary usando o BMAD Agent System em YOLO mode.*
