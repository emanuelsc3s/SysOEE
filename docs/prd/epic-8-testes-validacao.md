# Epic 8: Testes de Stress, Refinamento & Validação Final

[← Voltar ao Índice](./index.md)

---


## Epic 8: Testes de Stress, Refinamento & Validação Final

**Objetivo Expandido:** Executar testes de stress simulando 100 usuários simultâneos e sessões de 8h+ para validar NFR2-NFR4 (performance, uptime, contemporaneidade). Ajustar performance baseado em métricas reais (P95, bundle size, query times). Refinar UX com feedback de operadores e gestores reais. Preparar documentação técnica (README, deployment guide, QI/QO/QP inicial) e roteiro de demo. Entregar protótipo MVP validado e pronto para apresentação final (Semana 6) e rollout Janeiro/2026.

### Story 8.1: Executar Testes de Stress (100 Usuários Simultâneos)

**Como** arquiteto de sistema,
**Eu quero** validar que sistema suporta 100 usuários simultâneos sem degradação,
**Para que** garantamos NFR2 antes de rollout em 10 linhas SPEP.

#### Acceptance Criteria

1. Ferramenta de teste: k6 (open-source load testing)
2. Script `tests/load/stress-test.js`:
   - Simular 100 virtual users (VUs)
   - Cada VU: login → visualizar dashboard → aplicar filtros → criar apontamento → logout
   - Duração: 30 minutos contínuos
   - Ramp-up: 0 → 100 VUs em 5 minutos (não todos de uma vez)
3. Métricas coletadas:
   - P95 response time (dashboard load, filter apply, create apontamento)
   - Taxa de erro (% de requests falhando)
   - Throughput (requests/segundo)
   - Supabase connection pool usage
4. Critérios de sucesso:
   - P95 dashboard load < 2s (NFR1)
   - P95 interactions < 500ms (NFR1)
   - Taxa de erro < 1%
   - Nenhum timeout de conexão Supabase
5. Report gerado: `docs/performance/stress-test-report.md` com gráficos e métricas
6. Se falhar: identificar bottleneck (query lenta? view materializada? connection pool?), otimizar, re-executar

---

### Story 8.2: Executar Testes de Sessões Longas (8h+)

**Como** operador,
**Eu quero** garantir que sistema não desconecte durante meu turno de 8 horas,
**Para que** contemporaneidade (ALCOA+) seja mantida conforme NFR4.

#### Acceptance Criteria

1. Teste manual: 3 navegadores simultâneos (Chrome, Edge, Firefox) logados como operadores
2. Deixar navegadores abertos e ativos por 8 horas contínuas (8h-16h)
3. Ações simuladas a cada 30 minutos:
   - Registrar apontamento (automatizado via script Puppeteer)
   - Verificar badge de status (deve estar verde "Online")
   - Verificar contador de sessão no header (deve incrementar corretamente)
4. Critérios de sucesso:
   - Sessão permanece ativa por 8h+ (token não expira)
   - Todos os apontamentos salvos com sucesso (0 perdas)
   - Heartbeat queries executando a cada 5min (verificar logs Supabase)
   - Keep-alive refresh executando a cada 50min (verificar console browser)
5. Teste de resiliência: desconectar WiFi por 5 minutos no meio do teste → sistema deve buffer localmente → reconectar → sync automático
6. Report: `docs/validation/long-session-test-report.md` documentando timeline e eventos
7. Se falhar: revisar lógica de keep-alive, aumentar frequency de heartbeat, adicionar logging

---

### Story 8.3: Otimizar Bundle Size do Frontend

**Como** desenvolvedor,
**Eu quero** bundle inicial < 500KB conforme NFR9,
**Para que** aplicação carregue rapidamente mesmo em conexões 3G.

#### Acceptance Criteria

1. Análise atual: `npm run build` → verificar output de `dist/` size
2. Ferramenta: `vite-plugin-bundle-visualizer` para identificar pacotes pesados
3. Otimizações aplicadas:
   - Lazy load de gráficos: `const ParetoChart = React.lazy(() => import('./ParetoChart'))`
   - Code splitting por rota: cada página em chunk separado
   - Tree-shaking: verificar que apenas componentes Shadcn usados são incluídos (não biblioteca inteira)
   - Remover sourcemaps de produção: `build: { sourcemap: false }`
   - Minificar ECharts: usar build customizado com apenas gauge + bar charts (não todos os tipos)
4. Target: bundle inicial (main chunk) < 500KB gzipped
5. Chunks secundários (carregados sob demanda): OK ter > 500KB cada
6. Lighthouse CI: adicionar ao GitHub Actions verificando bundle size a cada PR
7. Fallback: se ECharts sozinho é > 300KB, considerar alternativa (Recharts gauge custom)
8. Report: comparar before/after em `docs/performance/bundle-optimization.md`

---

### Story 8.4: Conduzir Testes de Usabilidade com Operadores

**Como** PM,
**Eu quero** observar operadores reais usando formulário de apontamento,
**Para que** identifiquemos fricções de UX e ajustemos antes do rollout.

#### Acceptance Criteria

1. Recrutar 5-10 operadores de SPEP para testes (voluntários, 30min cada)
2. Tarefa: "Registre 3 apontamentos de paradas diferentes usando o sistema"
3. Observar sem interferir: tempo gasto, erros cometidos, confusões
4. Métricas coletadas:
   - Tempo médio por apontamento (target < 30s)
   - Taxa de erro (campos incorretos, validações falhando)
   - NPS (0-10): "Você recomendaria esse sistema vs Diário de Bordo?"
   - Feedback qualitativo: "O que foi confuso? O que ajudaria?"
5. Entrevista pós-teste (5 min): perguntas abertas sobre experiência
6. Report: `docs/ux/usability-test-report.md` consolidando feedback
7. Priorizar top 3 issues reportados:
   - Se crítico (bloqueia uso): fix imediato antes de demo final
   - Se menor: adicionar ao backlog pós-MVP
8. Re-testar com 2-3 operadores após fixes para validar melhorias

---

### Story 8.5: Criar Documentação Técnica Completa

**Como** desenvolvedor futuro (ou suporte),
**Eu quero** documentação técnica detalhada,
**Para que** eu consiga entender arquitetura, deploy e troubleshooting sem ajuda externa.

#### Acceptance Criteria

1. README.md principal (raiz do repo):
   - Visão geral do projeto (o que é, para quê serve)
   - Tecnologias usadas (stack completo)
   - Pré-requisitos (Node.js 20, Supabase CLI, etc.)
   - Setup local: `npm install && turbo dev`
   - Estrutura de pastas (monorepo explicado)
   - Links para docs específicas
2. apps/web/README.md:
   - Arquitetura do frontend (React 19, Vite, Tailwind, etc.)
   - Estrutura de componentes (`src/components`, `src/pages`, `src/lib`)
   - State management (React Query, Zustand)
   - Como adicionar novo gráfico
   - Como adicionar nova rota
3. apps/gateway/README.md:
   - Arquitetura do gateway (Node.js worker, tail de arquivo)
   - Como configurar caminho do arquivo TXT KEYENCE
   - Como instalar/desinstalar serviço Windows
   - Troubleshooting: logs, erros comuns
4. supabase/README.md:
   - Schema de banco (ERD diagram via Mermaid)
   - Como criar nova migration
   - Como executar seed data
   - RLS policies explicadas
   - Triggers de auditoria
5. docs/deployment/deploy-guide.md:
   - Deploy frontend para Vercel (step-by-step)
   - Deploy Supabase (configurações necessárias)
   - Deploy gateway SICFAR (Windows Server 2019)
   - Environment variables necessárias
   - Rollback procedure se algo der errado
6. docs/architecture/system-overview.md:
   - Diagrama de arquitetura (C4 model ou similar)
   - Fluxo de dados end-to-end (operador → apontamento → calc OEE → dashboard)
   - Decisões arquiteturais críticas (ADRs)
7. Todos os READMEs em português brasileiro

---

### Story 8.6: Preparar Apresentação de Demo Final

**Como** PM,
**Eu quero** roteiro de demo estruturado,
**Para que** apresentação final (Semana 6) mostre valor do sistema claramente.

#### Acceptance Criteria

1. Documento `docs/demo/demo-script.md` (roteiro passo-a-passo)
2. Estrutura da demo (30-45 minutos):
   - **Intro (5 min):** Contexto do problema, objetivos do MVP, roadmap cumprido
   - **Demo 1 - Operador (10 min):**
     - Login como operador
     - Registrar apontamento contemporâneo (<30s)
     - Simular offline: desconectar WiFi → registrar apontamento → badge amarelo "Offline - 1 pendente"
     - Reconectar: auto-sync → badge verde → toast sucesso
   - **Demo 2 - Supervisor (10 min):**
     - Login como supervisor
     - Visualizar lista de apontamentos pendentes
     - Selecionar 3 apontamentos → assinar batch → re-autenticação PIN → sucesso
     - Rejeitar 1 apontamento com motivo → operador recebe notificação
   - **Demo 3 - Gestor (10 min):**
     - Login como gestor
     - Dashboard: aplicar filtros (SPEP, Linha A, última semana)
     - Velocímetro OEE: 72% (meta 75%) → zona amarela
     - Pareto: maior causa = "Manutenção Planejada" (30% das paradas)
     - Drill-down: click na barra → detalhes dos apontamentos
     - Componentes OEE: Performance baixa (85%) puxando OEE para baixo
     - Export dashboard para PDF
   - **Demo 4 - Admin (5 min):**
     - Configurações: atualizar meta OEE de Linha A para 70%
     - Velocímetro muda para zona verde imediatamente
     - Audit trail: mostrar histórico de alterações
   - **Wrap-up (5 min):** Próximos passos (Epics pós-MVP, roadmap Janeiro/2026), Q&A
3. Ambiente de demo: dados seed realistas (não Lorem Ipsum)
4. Backup plan: se WiFi da sala falhar, ter screenshots/vídeo gravado como fallback
5. Apresentador: Cícero (Líder TI) + demonstração técnica por dev sênior
6. Audiência: Maxwell (Gerente Industrial), Sávio (Processos), Consultor Rafael, Diretoria
7. Feedback form: Google Forms para audiência avaliar demo (0-10, comentários)

---

### Story 8.7: Documentar Início de Validação GMP (QI/QO/PQ)

**Como** equipe de Qualidade,
**Eu quero** templates iniciais de documentação de validação,
**Para que** processo de QI/OQ/PQ comece imediatamente pós-MVP.

#### Acceptance Criteria

1. Documento `docs/validation/IQ-Installation-Qualification-Template.md`:
   - Seções: Objetivo, Escopo, Infraestrutura (Supabase, Vercel, Gateway), Versões de software, Network topology, Checklist de instalação
   - Tabela de aprovação: assinaturas de TI, Qualidade, Consultor
2. Documento `docs/validation/OQ-Operational-Qualification-Template.md`:
   - Seções: Objetivo, Escopo, Testes funcionais (FR1-FR30), Testes de segurança (RLS, audit trail), Testes de compliance (ALCOA+, CFR 21 Part 11)
   - Cada teste: ID, Descrição, Procedure, Expected Result, Actual Result, Pass/Fail, Evidência (screenshot)
3. Documento `docs/validation/PQ-Performance-Qualification-Template.md`:
   - Seções: Objetivo, Escopo, Testes de performance (NFR1-NFR15), Teste de stress (100 usuários), Teste de sessões longas (8h), Teste de offline-first
   - Tabela de métricas: Critério, Target, Resultado, Pass/Fail
4. Documento `docs/validation/Validation-Master-Plan.md`:
   - Timeline de validação (6-12 meses)
   - Responsáveis (Qualidade lead, TI support, Consultor)
   - Escopo (quais funcionalidades serão validadas)
   - Out of scope (features pós-MVP não validadas inicialmente)
   - Critérios de aprovação/rejeição
5. Documentos em português brasileiro
6. Formato: Markdown (fácil de versionar no Git) + export para Word para assinaturas formais

---

### Story 8.8: Executar Checklist Pré-Demo e Aprovar Go-Live

**Como** PM,
**Eu quero** checklist formal de prontidão,
**Para que** garantamos que todos os critérios de MVP foram atendidos antes da demo final.

#### Acceptance Criteria

1. Checklist em `docs/checklist/mvp-readiness.md`:
   - ✅ Todos os 8 epics completados (27 stories implementadas e testadas)
   - ✅ 30 Functional Requirements atendidos (FR1-FR30)
   - ✅ 15 Non-Functional Requirements validados (NFR1-NFR15)
   - ✅ Consultor Rafael aprovou compliance (Epic 2)
   - ✅ Sávio Rafael aprovou cálculos OEE (Epic 4)
   - ✅ Testes de stress passaram (100 usuários, 8h sessão)
   - ✅ Testes de usabilidade com operadores (NPS > 7/10)
   - ✅ Bundle size < 500KB
   - ✅ Uptime > 99.5% em testes de stress
   - ✅ Contemporaneidade > 98% em testes de offline-first
   - ✅ Documentação técnica completa (README, deployment guide)
   - ✅ Seed data de 10 linhas SPEP carregado
   - ✅ Roteiro de demo preparado e ensaiado
   - ✅ Ambiente de demo configurado com dados realistas
2. Reunião de go/no-go (1 dia antes da demo final):
   - Participantes: Cícero (TI), Maxwell (Industrial), Sávio (Processos), Dev Sênior
   - Revisar checklist item por item
   - Decisão: "Go" (demo acontece) ou "No-Go" (adiar 1 semana para fixes)
   - Critério: pelo menos 90% do checklist deve estar ✅
3. Documentar decisão em `docs/checklist/go-no-go-decision.md` com assinaturas
4. Se "Go": confirmar demo para Semana 6 (29/Dez/2025)
5. Se "No-Go": identificar blockers críticos, criar plano de ação, re-agendar demo

---

**Fim do Epic 8**

Este epic fecha o ciclo de desenvolvimento do MVP - testes, refinamento, documentação e validação final. Protótipo está pronto para demo e rollout Janeiro/2026.

---
