# Sistema OEE para SicFar
## Apresentação Executiva do PRD

**Data:** 19 de Outubro de 2025
**Versão:** 1.0
**Apresentador:** Cícero Emanuel da Silva (Líder de TI)
**Audiência:** Maxwell Cruz Cortez, Sávio Correia Rafael, Consultor Rafael Gusmão, Diretoria

---

## 📋 Agenda (30 minutos)

1. **Contexto e Problema** (5 min)
2. **Solução Proposta** (5 min)
3. **Arquitetura Técnica** (5 min)
4. **Roadmap de Desenvolvimento** (5 min)
5. **Riscos e Mitigações** (5 min)
6. **Aprovações e Próximos Passos** (5 min)

---

## 1. Contexto e Problema

### Situação Atual

**37 linhas de produção** em 4 setores (SPEP, SPPV, Líquidos, CPHD) operando com:
- ❌ Dados fragmentados em planilhas Excel
- ❌ CLPs não integrados (KEYENCE, Bottelpack, Pró Maquia, Bausch Strobbel)
- ❌ Apontamentos manuais não contemporâneos (risco ALCOA+)
- ❌ Análise de dados leva 40h/mês (trabalho manual intenso)
- ❌ Zero visibilidade em tempo real sobre eficiência

### Impactos Críticos

🔴 **Regulatório:** Apontamentos não contemporâneos violam ALCOA+ (ANVISA IN 134, RDC 658, FDA CFR 21 Part 11) → risco de warning letter em auditorias

🟡 **Operacional:** Impossível identificar rapidamente gargalos e priorizar ações corretivas → decisões reativas vs. proativas

🟠 **Financeiro:** OEE médio ~65% significa 35% de capacidade desperdiçada → potencial de aumento de 10-15% em produtividade = milhões em valor

### Objetivo do Projeto

**Criar Sistema OEE Web pharma-native que:**
- ✅ Garanta contemporaneidade de apontamentos (compliance BPF)
- ✅ Integre sensores KEYENCE automaticamente
- ✅ Calcule OEE validado (Disponibilidade × Performance × Qualidade)
- ✅ Forneça dashboards interativos para gestão "ver e agir"
- ✅ Reduza tempo de análise de 40h → 4h/mês (10x mais eficiente)

---

## 2. Solução Proposta

### Visão Geral

**Sistema OEE Web** com 3 componentes principais:

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────────┐
│   Operadores    │      │   Gateway    │      │   Dashboards    │
│  (Apontamentos) │ ───> │   SICFAR     │ ───> │   Gerenciais    │
│   Formulário    │      │  (CLPs IoT)  │      │   (8 Gráficos)  │
└─────────────────┘      └──────────────┘      └─────────────────┘
         │                      │                       │
         └──────────────────────┴───────────────────────┘
                                │
                         ┌──────▼──────┐
                         │  Supabase   │
                         │ (PostgreSQL)│
                         └─────────────┘
```

### Funcionalidades Core

**Para Operadores:**
- Formulário de apontamento contemporâneo (<30s por registro)
- Funciona 100% offline (turno completo de 8h sem internet)
- Validação em tempo real (códigos de parada por linha)
- Feedback visual imediato (online/offline/sincronizando)

**Para Supervisores:**
- Assinatura eletrônica de apontamentos em batch
- Rejeição de registros incorretos com motivo
- Rastreabilidade completa (quem/quando/o quê)

**Para Gestores:**
- Dashboard com 8 gráficos obrigatórios:
  1. **Velocímetro de OEE** (visão executiva por linha)
  2. **Pareto de Paradas** (principal ferramenta de priorização)
  3. **Componentes do OEE** (diagnóstico: qual pilar está baixo?)
  4. **Tabela Consolidada** (dados detalhados com filtros)
  5. **Rosca Planejadas vs Não Planejadas** (nível de controle)
  6. **Resumo de Horas Totais** (uso do tempo calendário)
  7. **Histórico de Tendências** (últimas 10-12 semanas)
  8. **MTBF e MTTR** (confiabilidade dos equipamentos)
- Filtros dinâmicos: setor, linha, período
- Export para Excel e PDF (relatórios executivos)

**Para Admin/Engenharia:**
- Gerenciamento de velocidades nominais por SKU
- Configuração de metas de OEE por linha
- Gerenciamento de usuários com roles (operador, supervisor, gestor, admin)
- Audit trail completo (rastreabilidade de todas as alterações)

### Diferenciais Competitivos

**vs. Planilhas Excel:**
- ✅ Tempo real vs. análise manual demorada
- ✅ Integração IoT automática vs. digitação manual
- ✅ Compliance ALCOA+ nativo vs. riscos de auditoria

**vs. Concorrentes (Evocon, Obitec):**
- ✅ Pharma-native (ALCOA+, CFR 21 Part 11) vs. genérico industrial
- ✅ Offline-first (contemporaneidade garantida) vs. dependência de internet
- ✅ Customizado para 37 linhas SicFar vs. solução one-size-fits-all
- ✅ Ownership completo (código fonte) vs. vendor lock-in

---

## 3. Arquitetura Técnica

### Stack Tecnológica

**Frontend:**
- React 19 + Vite 7 (build rápido)
- Tailwind CSS v4 + Shadcn (UI moderna, bundle pequeno)
- TypeScript 5.3+ (type-safety)
- PWA (instalável como app desktop/mobile)

**Backend:**
- Supabase Cloud (PostgreSQL 15 + Auth + Realtime)
- Row Level Security (RLS) para controle de acesso granular
- Triggers PostgreSQL para audit trail automático
- View materializada com refresh automático (pg_cron)

**Gateway IoT:**
- Node.js 20 LTS worker (on-premise Windows Server 2019)
- Tail de arquivo TXT KEYENCE (4 registros/segundo)
- Agregação em memória + UPDATE Supabase a cada 5s

**Deploy:**
- Frontend: Vercel (deploy automático, CDN global)
- Gateway: Windows Service (auto-start, restart on failure)
- CI/CD: GitHub Actions (lint, test, build, deploy)

### Decisões Arquiteturais Críticas

**1. Supabase vs PostgreSQL Self-Hosted**
- ✅ **Escolhido:** Supabase Pro
- **Razão:** Elimina 2-3 semanas de setup (Auth + RLS + Realtime prontos)
- **Validação:** Consultor Rafael revisa na Semana 2
- **Plano B:** Migrar para Azure PostgreSQL se reprovado (+4-6 semanas)

**2. Offline-First Mandatório**
- ✅ **Escolhido:** IndexedDB + Service Worker + Background Sync
- **Razão:** Contemporaneidade BPF depende de NUNCA falhar durante turno
- **Validação:** Teste de sessões longas 8h+ na Semana 5

**3. View Materializada MVP vs Tempo Real**
- ✅ **Escolhido:** View materializada com refresh 1h
- **Razão:** Pragmatismo - começar simples, otimizar se necessário
- **Validação:** Feedback de gestores na demo final (Semana 6)
- **Plano B:** Tabelas agregadas + triggers incrementais pós-MVP

**4. PWA vs App Nativo**
- ✅ **Escolhido:** PWA (MVP)
- **Razão:** Computadores fixos não instalam .exe, deployment instantâneo
- **Validação:** Testes de usabilidade com operadores (Semana 5)
- **Plano B:** React Native pós-MVP se adoção < 70%

### Compliance Regulatório

**ALCOA+ (100% atendido):**
- **A**tribuível: RLS força user_id em todos os registros
- **L**egível: UI em português, dados não codificados
- **C**ontemporâneo: Offline buffer + timestamp automático
- **O**riginal: Audit trail com triggers imutáveis
- **A**cexato: Validações Zod + constraints PostgreSQL
- **+Completo:** Campos obrigatórios forçados
- **+Consistente:** Foreign keys + transactions ACID
- **+Durável:** Backups PITR 7 dias Supabase
- **+Disponível:** SLA 99.9% + offline-first

**CFR 21 Part 11 (FDA):**
- ✅ Assinatura eletrônica: hash SHA-256 + re-autenticação
- ✅ Audit trail: quem/quando/o quê/antes/depois
- ✅ Controle de acesso: RLS policies por role
- ✅ Validação formal: QI/OQ/PQ (pós-MVP, 6-12 meses)

---

## 4. Roadmap de Desenvolvimento

### Timeline MVP: 6 Semanas (Nov-Dez/2025)

| Semana | Epic | Entregas | Validação Crítica |
|--------|------|----------|-------------------|
| **1** | Foundation & Compliance | Setup monorepo, Supabase, CI/CD, Auth, Offline-First, Audit Trail, RLS | - |
| **2** | Compliance (cont.) | Assinatura eletrônica, Documentação ALCOA+/CFR 21 Part 11 | ✅ **Consultor Rafael aprova** |
| **3** | Apontamentos & IoT + Cálculo OEE | Formulário operador, Gateway SICFAR, Funções SQL OEE, View materializada | ✅ **Sávio Rafael aprova cálculos ±2%** |
| **4** | Dashboards Top 4 | Filtros, Velocímetro, Pareto, Componentes OEE, Tabela | Teste de stress (100 usuários) |
| **5** | Gráficos + Admin | Rosca, Horas Totais, Tendências, MTBF/MTTR, Export PDF/Excel, Config | ✅ **Testes usabilidade (NPS > 7/10)** |
| **6** | Validação Final | Testes stress final, Docs, Demo, Go/No-Go | ✅ **Demo aprovada → Go-live Jan/2026** |

### Escopo MVP vs Pós-MVP

**✅ Incluído no MVP (6 semanas):**
- 10 linhas SPEP (protótipo)
- Apontamentos contemporâneos + integração IoT
- 8 gráficos obrigatórios
- Export Excel/PDF
- Assinatura eletrônica
- Audit trail completo
- Offline-first
- Seed data de Books de Paradas

**⏳ Pós-MVP (Fev-Ago/2026):**
- Rollout 37 linhas completas
- Integração TOTVS (velocidades nominais automáticas)
- CRUD de Books de Paradas (aguardando Atividade 06)
- Notificações push
- App React Native (iOS/Android)
- Validação GMP formal (QI/OQ/PQ)
- Features avançadas (ML preditivo, benchmarking)

### Equipe e Recursos

**Desenvolvimento:**
- 2 desenvolvedores full-stack sênior (React + PostgreSQL)
- 1 líder técnico (Cícero Emanuel)
- 1 PM (John - BMAD)

**Validação:**
- Consultor Rafael Gusmão (compliance, Semana 2)
- Sávio Rafael (cálculos OEE, Semana 3)
- 5-10 operadores SPEP (usabilidade, Semana 5)

**Infraestrutura:**
- Supabase Pro: ~R$ 500/mês (escala até 500 usuários)
- Vercel Pro: ~R$ 200/mês (deploy automático + CDN)
- GitHub: Plano atual (já disponível)
- Windows Server 2019: Existente (já disponível)

---

## 5. Riscos e Mitigações

### Matriz de Riscos

| # | Risco | Prob. | Impacto | Mitigação | Plano B |
|---|-------|-------|---------|-----------|---------|
| **R1** | Supabase não aprovado por consultor CFR 21 Part 11 | Média | 🔴 Alto | Spike técnico Semana 1, validação Semana 2 | Migrar PostgreSQL self-hosted (+4-6 semanas) |
| **R2** | Cálculos OEE divergem > 2% das planilhas | Baixa | 🔴 Alto | Unit tests automatizados, validação presencial Semana 3 | Revisar fórmulas SQL, revalidar |
| **R3** | PWA não adotado por operadores | Média | 🟡 Médio | Testes usabilidade Semana 5 (NPS > 7/10) | Desenvolver React Native pós-MVP (+8-12 semanas) |
| **R4** | Gateway SICFAR não aguenta 10 linhas | Baixa | 🟡 Médio | Teste de stress Semana 4 (40 req/s) | Múltiplos workers ou upgrade servidor |
| **R5** | Books de Paradas (Atividade 06) indisponível | Alta | 🟢 Baixo | Usar seed data genérico no MVP | CRUD completo pós-MVP |
| **R6** | Timeline 6 semanas muito apertada | Média | 🟡 Médio | Priorização rigorosa P0 vs P1 | Backlog pós-MVP para features "nice to have" |

### Dependências Críticas (Bloqueios)

**🚨 Bloqueio 1: Aprovação Consultor Rafael (Semana 2)**
- **O quê:** Validação compliance ALCOA+/CFR 21 Part 11
- **Por quê:** Sem aprovação, sistema não pode ser validado formalmente (QI/OQ/PQ)
- **Impacto se falhar:** Retrabalho arquitetural (+4-6 semanas)
- **Mitigação:** Reunião validação agendada Semana 2, documentação preparada Semana 1

**🚨 Bloqueio 2: Aprovação Sávio Rafael (Semana 3)**
- **O quê:** Validação cálculos OEE ±2% tolerância
- **Por quê:** Cálculos incorretos = decisões erradas = perda de confiança no sistema
- **Impacto se falhar:** Revisão fórmulas SQL (+1-2 semanas)
- **Mitigação:** Unit tests contra planilhas de Sávio, validação presencial

**🚨 Bloqueio 3: Testes de Usabilidade (Semana 5)**
- **O quê:** NPS > 7/10 com operadores reais
- **Por quê:** Sistema difícil de usar = baixa adoção = projeto fracassado
- **Impacto se falhar:** Refatoração UX (+1-2 semanas)
- **Mitigação:** Formulário testado iterativamente, feedback contínuo

### Contingências

**Se Timeline Escorregar:**
- Cortar features secundárias (export PDF, gráficos de tendências) para pós-MVP
- Priorizar P0 absoluto: Apontamentos + Cálculos + Dashboard básico
- Adiar demo final 1-2 semanas (ainda dentro de Q4/2025)

**Se Supabase Reprovar:**
- Ativar Plano B imediatamente: Azure PostgreSQL managed
- Equipe conhece PostgreSQL (sem curva de aprendizado)
- Retrabalho estimado: 4-6 semanas (ainda viável para Jan/2026)

---

## 6. Aprovações e Próximos Passos

### Critérios de Sucesso (MVP)

**Técnicos:**
- ✅ 30 Functional Requirements implementados (FR1-FR30)
- ✅ 15 Non-Functional Requirements validados (NFR1-NFR15)
- ✅ P95 dashboards < 2s, interações < 500ms
- ✅ Bundle frontend < 500KB gzipped
- ✅ Suporta 100 usuários simultâneos
- ✅ Sessões ativas 8h+ sem desconectar
- ✅ Contemporaneidade > 98% (registros dentro de 10min)

**Validações:**
- ✅ Consultor Rafael aprova compliance (Semana 2)
- ✅ Sávio Rafael aprova cálculos OEE (Semana 3)
- ✅ NPS operadores > 7/10 (Semana 5)
- ✅ Demo final aprovada por Maxwell + Diretoria (Semana 6)

**Negócio:**
- ✅ Sistema funcional em 10 linhas SPEP
- ✅ Redução tempo análise: 40h → 4h/mês (10x)
- ✅ Baseline OEE medido (dados confiáveis para comparação futura)
- ✅ Go-live Janeiro/2026 confirmado

### Aprovações Necessárias (Hoje)

Este PRD requer aprovação formal de:

| Stakeholder | Role | Responsabilidade | Status |
|-------------|------|------------------|--------|
| **Maxwell Cruz Cortez** | Gerente Industrial | Sponsor executivo, orçamento, go/no-go | ☐ **Pendente** |
| **Sávio Correia Rafael** | Gerente de Processos | Validação metodologia OEE | ☐ **Pendente** |
| **Cícero Emanuel da Silva** | Líder de TI | Aprovação técnica, recursos | ☐ **Pendente** |
| **Consultor Rafael Gusmão** | Consultor GMP | Validação compliance | ☐ **Pendente** |

**Deadline:** 25/Outubro/2025 (1 semana)

### Próximos Passos Imediatos

**Hoje (19/Out):**
1. ✅ Apresentação do PRD (esta reunião)
2. ⏳ Q&A e esclarecimentos
3. ⏳ Solicitação de aprovações formais

**Esta Semana (21-25/Out):**
1. Stakeholders revisam PRD completo (`docs/prd.md`)
2. Consultor Rafael revisa seção de compliance antecipadamente
3. Sávio Rafael revisa fórmulas de cálculo OEE
4. Aprovações formais coletadas (email ou assinatura física)

**Semana 1 (28/Out - 01/Nov):**
1. ✅ Kick-off de desenvolvimento (Epic 1: Foundation)
2. Setup monorepo Turborepo
3. Configuração Supabase Cloud
4. Spike técnico: Audit Trail + RLS
5. Reunião diária (daily standup) às 9h

**Semana 2 (04-08/Nov):**
1. Continuação Epic 1 + início Epic 2 (Compliance)
2. **CRÍTICO:** Reunião validação com Consultor Rafael (Qui 07/Nov)
3. Documentação ALCOA+/CFR 21 Part 11
4. Decisão go/no-go Supabase

### Perguntas para Discussão

**Para Maxwell (Sponsor Executivo):**
1. Orçamento de R$ 400-800k aprovado? (Supabase + Vercel ~R$ 8k/ano é apenas fração)
2. Timeline 6 semanas + go-live Jan/2026 viável com calendário de fim de ano?
3. Recursos humanos: 2 devs full-time disponíveis por 6 semanas?

**Para Sávio (Processos):**
1. Planilhas de validação de cálculos OEE prontas para Semana 3?
2. Disponibilidade para reunião de validação presencial (Qui Semana 3)?
3. Seed data de Books de Paradas: podemos usar genérico no MVP?

**Para Consultor Rafael (GMP):**
1. Disponibilidade para revisão antecipada de docs compliance (Semana 1)?
2. Reunião de validação presencial: Qui 07/Nov funciona?
3. Critérios específicos de aprovação CFR 21 Part 11 para Supabase?

**Para Todos:**
1. Alguma dúvida sobre escopo MVP vs pós-MVP?
2. Riscos adicionais não mapeados?
3. Aprovação do PRD hoje ou precisam de tempo para revisar?

---

## 📊 Anexos

### Anexo A: Comparação de Custos (MVP + Ano 1)

| Item | Opção | Custo Ano 1 | Observação |
|------|-------|-------------|------------|
| **Backend** | Supabase Pro | R$ 6.000 | ~R$ 500/mês, até 500 usuários |
| **Frontend** | Vercel Pro | R$ 2.400 | ~R$ 200/mês, deploy automático |
| **Desenvolvimento** | 2 devs × 6 semanas | R$ 120.000 | Estimativa interna (R$ 10k/dev/mês) |
| **Consultoria** | Consultor Rafael | R$ 30.000 | Estimativa (validações Semana 2, 3, 6) |
| **Infraestrutura** | Windows Server | R$ 0 | Já existente |
| **Validação GMP** | QI/OQ/PQ (pós-MVP) | R$ 150.000 | Estimativa (Abr-Ago/2026) |
| **TOTAL MVP** | - | **R$ 158.400** | Apenas desenvolvimento (6 semanas) |
| **TOTAL Ano 1** | - | **R$ 308.400** | MVP + validação GMP + ops |

**ROI Estimado:**
- Redução tempo análise: 36h/mês economizadas × 12 meses × R$ 100/h (custo analista) = **R$ 43.200/ano**
- Aumento OEE: 65% → 75% (10pp) em 37 linhas = 10-15% aumento produtividade = **R$ 2-5 milhões/ano** (estimativa conservadora)
- Payback: **< 2 meses** (considerando apenas ganhos de produtividade)

### Anexo B: Documentos de Referência

1. **PRD Completo:** `docs/prd.md` (2.072 linhas)
2. **Project Brief:** `docs/brief.md`
3. **Brainstorming Técnico:** `docs/brainstorming-session-results.md`
4. **Metodologia OEE:** `docs/project/05-Metodologia-Calculo.md`
5. **Gráficos Obrigatórios:** `docs/project/09-Validacao-Tecnica-SicFar.md`
6. **Análise Competitiva:** `docs/competitor-analysis-executive.md`

### Anexo C: Contatos do Projeto

- **Cícero Emanuel** (Líder TI): cicero@sicfar.com.br
- **Maxwell Cruz** (Gerente Industrial): maxwell@sicfar.com.br
- **Sávio Rafael** (Gerente Processos): savio@sicfar.com.br
- **Consultor Rafael Gusmão**: rafael.gusmao@consultoria.com.br
- **John (PM BMAD)**: john@bmad.ai

---

## 🎯 Decisão Solicitada

**Aprovar início de desenvolvimento do Sistema OEE conforme PRD apresentado?**

- ☐ **Aprovado** - Iniciar desenvolvimento Semana 1 (28/Out)
- ☐ **Aprovado com ressalvas** - Especificar ajustes necessários
- ☐ **Adiado** - Necessário mais tempo para análise (especificar prazo)
- ☐ **Rejeitado** - Especificar motivos

**Assinaturas:**

___________________________
Maxwell Cruz Cortez (Sponsor)
Data: ___/___/2025

___________________________
Sávio Correia Rafael
Data: ___/___/2025

___________________________
Cícero Emanuel da Silva
Data: ___/___/2025

___________________________
Consultor Rafael Gusmão
Data: ___/___/2025

---

**Obrigado!**

📧 Dúvidas: cicero@sicfar.com.br
📄 PRD Completo: `/home/emanuel/SysOEE/docs/prd.md`
🚀 Repositório: github.com/sicfar/sysoee (após aprovação)
