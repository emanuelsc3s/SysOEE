# Sistema OEE para SicFar - Product Requirements Document (PRD)

**Versão:** 1.0
**Data:** 19 de Outubro de 2025
**Responsável:** John (Product Manager)
**Stakeholders:** Maxwell Cruz Cortez (Gerente Industrial), Sávio Correia Rafael (Gerente de Processos), Cícero Emanuel da Silva (Líder de TI)
**Consultor:** Rafael Gusmão (Validação Técnica)

---

## Goals and Background Context

### Goals

- Aumentar OEE médio geral de ~65% (baseline estimado) para 75% até Jun/2026
- Reduzir tempo de análise de dados de 40h/mês para 4h/mês até Mar/2026
- Garantir 100% contemporaneidade de apontamentos (conformidade BPF/ALCOA+)
- Aprovar validação formal (QI/QO/QP) até Ago/2026
- Reduzir paradas não planejadas em 25% através de gestão preditiva (MTBF/MTTR)
- Eliminar dependência de planilhas Excel e processos manuais fragmentados
- Fornecer visibilidade em tempo real sobre eficiência das 37 linhas de produção
- Criar fonte única de verdade para dados de OEE integrando CLPs, apontamentos manuais e TOTVS

### Background Context

A Farmace/SicFar opera 37 linhas de produção farmacêutica em 4 setores críticos (SPEP, SPPV, Líquidos, CPHD), mas enfrenta desafios operacionais significativos que impedem otimização de capacidade produtiva e gestão preditiva. O problema central é a falta de visibilidade em tempo real sobre eficiência das linhas, com dados fragmentados entre planilhas Excel, CLPs não integrados e apontamentos manuais não contemporâneos. Isso impossibilita análise estratégica baseada em dados concretos e representa risco regulatório crítico: apontamentos não contemporâneos violam princípios ALCOA+ exigidos pela ANVISA (IN 134, RDC 658) e FDA (CFR 21 Part 11), expondo a SicFar a potenciais warning letters em auditorias.

A solução proposta é um Sistema OEE Web pharma-native (React 19 + Supabase) com integrações CLPs/TOTVS, dashboards interativos avançados (8 gráficos obrigatórios), assinatura eletrônica CFR 21 Part 11, e offline-first para garantir zero data loss durante turnos de 8+ horas. O sistema será validado formalmente (QI/QO/QP) para uso em ambiente regulado, com meta de implantação em Janeiro/2026 (protótipo SPEP em Dezembro/2025).

### Change Log

| Data | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-19 | 1.0 | PRD inicial criado a partir de Project Brief | John (PM) |

---

## Requirements

### Functional Requirements

**FR1:** O sistema deve permitir registro de apontamentos contemporâneos (paradas, trocas de turno, perdas de qualidade) com campos obrigatórios: linha, turno, tipo de evento, código de parada do Book, timestamp automático, quantidade afetada e operador autenticado

**FR2:** O sistema deve integrar com sensores KEYENCE via gateway SICFAR, processando dados de produção/rejeição de arquivos TXT (4 registros/segundo) e atualizando tabela `ordens_producao_ativas` com contadores acumulados a cada 5 segundos

**FR3:** O sistema deve calcular OEE conforme metodologia validada: OEE (%) = Disponibilidade × Performance × Qualidade, onde Disponibilidade = (Tempo de Operação / Tempo Disponível) × 100, Performance = (Tempo Operacional Líquido / Tempo de Operação) × 100, e Qualidade = Qualidade_Unidades × Qualidade_Retrabalho

**FR4:** O sistema deve calcular cada componente de OEE separadamente (Disponibilidade, Performance, Qualidade) e armazenar resultados agregados por linha, turno, dia, semana, mês, trimestre e ano

**FR5:** O sistema deve exibir Velocímetro de OEE (gauge) com meta configurável por linha, diferenciando zonas vermelha/amarela/verde conforme metas específicas

**FR6:** O sistema deve exibir Gráfico de Pareto de Paradas em ordem decrescente mostrando principais causas de paradas em duração (horas) e impacto percentual sobre OEE, com drill-down de Grandes Paradas → Apontamento

**FR7:** O sistema deve exibir Gráfico de Componentes do OEE (barras comparativas) mostrando Disponibilidade, Performance, Qualidade e OEE consolidado para até 12 períodos comparativos (últimos 12 dias/semanas/meses)

**FR8:** O sistema deve exibir Tabela Consolidada com ordenação e filtros, apresentando versão por período (categorias de paradas × períodos) e versão por linha (tipos de parada × linhas de produção)

**FR9:** O sistema deve implementar filtros dinâmicos por setor (SPEP, SPPV, Líquidos, CPHD), linha, período (últimas 24h, semana, mês) e data range customizado

**FR10:** O sistema deve implementar fluxo de assinatura eletrônica híbrido: operador registra apontamento (status `draft`) → supervisor seleciona registros individualmente → re-autentica com PIN/Senha → assina batch completo (status `assinado`)

**FR11:** O sistema deve gerar hash SHA-256 de cada registro assinado combinado com timestamp, IP, device e salvar em tabela `assinaturas_eletronicas` com rastreabilidade completa

**FR12:** O sistema deve implementar audit trail completo via triggers PostgreSQL salvando: quem incluiu/alterou/excluiu, campo alterado, valor antes/depois, timestamp, IP e device em tabelas `*_audit`

**FR13:** O sistema deve funcionar completamente offline por até 8 horas (1 turno) armazenando dados não sincronizados em IndexedDB e sincronizando automaticamente quando conexão retornar

**FR14:** O sistema deve manter sessões ativas por 8+ horas através de auto-refresh de tokens (a cada 50 minutos), heartbeat (query leve a cada 5 minutos) e auto-reconnect com exponential backoff

**FR15:** O sistema deve exibir badge de status de conexão (Online/Offline) e alertar usuário sobre dados pendentes de sincronização com contador visual

**FR16:** O sistema deve permitir export de dashboards para Excel (via XLSX library) e PDF (via html2canvas + jsPDF) com filtros aplicados

**FR17:** O sistema deve classificar pequenas paradas (< 10 minutos) como impacto em Performance (não em Disponibilidade) conforme metodologia validada

**FR18:** O sistema deve excluir Paradas Estratégicas do Tempo Disponível (não entram no denominador do cálculo de Disponibilidade)

**FR19:** O sistema deve usar Velocidade Nominal por SKU (não capacidade nominal da máquina) como base para cálculo de Performance, permitindo diferentes velocidades para mesma linha

**FR20:** O sistema deve exibir Gráfico de Rosca mostrando distribuição percentual entre Paradas Planejadas (azul) e Não Planejadas (vermelho) segmentado por linha, setor, turno ou período

**FR21:** O sistema deve exibir Gráfico de Resumo de Horas Totais (barras empilhadas) categorizando: Horas Valiosas (verde), Paradas Estratégicas (azul), Paradas por Indisponibilidade (vermelho), Perdas por Performance (laranja), Perdas por Qualidade (amarelo)

**FR22:** O sistema deve calcular e exibir indicadores secundários: MTBF (tempo médio entre falhas), MTTR (tempo médio para reparo) e Taxa de Utilização ao longo do tempo

**FR23:** O sistema deve exibir Gráfico Histórico de Tendências (linhas) mostrando evolução das últimas 10-12 semanas de horas e % do OEE por categoria de parada

**FR24:** O sistema deve validar dados em tempo real (campos obrigatórios, SKU válido, operador autenticado, códigos de parada do Book da linha) antes de permitir salvamento

**FR25:** O sistema deve fornecer feedback visual imediato após registro de apontamento indicando: salvamento local (IndexedDB), sincronizando ou sincronizado com servidor

**FR26:** O sistema deve gerenciar Books de Paradas específicos por linha, permitindo que mesmo código tenha diferentes classificações hierárquicas (Classe → Grande Parada → Apontamento → Grupo → Detalhamento) entre linhas

**FR27:** O sistema deve preencher automaticamente Setor, Semana, Mês, Trimestre e Ano a partir da Data do apontamento para viabilizar segmentações temporais

**FR28:** O sistema deve implementar Row Level Security (RLS) no Supabase com permissões granulares por tipo de usuário: Operador (CRUD próprios apontamentos), Supervisor (read todos do setor + assinar), Gestor (read all + relatórios), Admin (full access)

**FR29:** O sistema deve tratar paradas que atravessam meia-noite calculando duração corretamente (ex: início 23:30 → término 00:45 = 1h15min)

**FR30:** O sistema deve permitir supervisor rejeitar registros individuais informando motivo obrigatório, devolvendo apontamento para operador corrigir (volta status `draft`)

### Non-Functional Requirements

**NFR1:** O sistema deve manter P95 de tempo de carregamento de dashboards < 2 segundos e P95 de interações (cliques, filtros) < 500ms

**NFR2:** O sistema deve suportar 100-500 usuários simultâneos (10 linhas MVP → 37 linhas completo) sem degradação de performance

**NFR3:** O sistema deve manter uptime > 99.5% durante horário produtivo (6h-22h, seg-sex) com SLA de Supabase Pro + Vercel

**NFR4:** O sistema deve garantir contemporaneidade de apontamentos com > 98% dos registros tendo timestamp dentro de 10 minutos da ocorrência real

**NFR5:** O sistema deve atender 100% dos princípios ALCOA+: Atribuível (user_id sempre preenchido via RLS), Legível (UI clara), Contemporâneo (offline buffer + timestamp automático), Original (triggers de auditoria), Exato (validações Zod + constraints PostgreSQL), Completo (campos obrigatórios), Consistente (foreign keys + transactions), Durável (backups PITR 7 dias + replicação Supabase), Disponível (uptime SLA 99.9%)

**NFR6:** O sistema deve atender requisitos CFR 21 Part 11 (FDA): assinatura eletrônica com hash SHA-256 + re-autenticação, audit trail completo, controle de acesso via RLS policies, validação formal QI/QO/QP

**NFR7:** O sistema deve usar HTTPS obrigatório (TLS 1.3), senhas hasheadas (bcrypt via Supabase Auth), Service Role Key armazenada em variável de ambiente (não hardcoded)

**NFR8:** O sistema deve funcionar em navegadores: Chrome 90+, Edge 90+, Firefox 88+ (desktop) e Chrome Mobile, Safari iOS 14+ (mobile via PWA)

**NFR9:** O sistema deve manter bundle inicial do frontend < 500KB através de lazy loading, code splitting por rota e tree-shaking

**NFR10:** O sistema deve implementar cache inteligente com React Query (stale time 5min) reduzindo requests em ~80%

**NFR11:** O sistema deve ser responsivo (mobile-first) com heights adaptativos: mobile (300px), tablet (400px), desktop (500px) e scroll horizontal em gráficos complexos quando necessário

**NFR12:** O sistema deve ser instalável como PWA (Progressive Web App) através de Service Worker com cache de assets, background sync e funcionamento offline completo

**NFR13:** O sistema deve armazenar até 10.000 registros não sincronizados no buffer local (IndexedDB) com política FIFO (First In First Out) caso limite seja atingido

**NFR14:** O sistema deve estar em português brasileiro para toda interface, mensagens de erro, documentação e comentários no código

**NFR15:** O sistema deve validar cálculos de OEE com margem de tolerância ±2% comparado a planilhas de validação do Gerente de Processos (Sávio Rafael)

---

## User Interface Design Goals

### Overall UX Vision

Sistema web pharma-native com UX moderna inspirada em Evocon (benchmark de mercado 4.8/5) mas adaptada para ambiente regulado BPF. Interface deve ser **simples e sem distrações** para operadores de chão de fábrica (baixa fluência digital, foco em produção), enquanto oferece **análise robusta e interativa** para gestores. Prioridades: (1) Contemporaneidade sem fricção - apontamentos em <30s, (2) Feedback visual constante - usuário sempre sabe o estado da operação, (3) Zero ansiedade sobre perda de dados - status offline/online explícito, (4) Hierarquia visual clara - operador vê formulários simples, gestor vê dashboards complexos.

### Key Interaction Paradigms

- **Offline-First Mental Model**: Sistema SEMPRE funciona, mesmo sem internet - badge verde/amarelo/vermelho de status visível permanentemente no header
- **Instant Feedback**: Cada ação (salvar apontamento, aplicar filtro, assinar registro) gera feedback visual imediato (<200ms)
- **Progressive Disclosure**: Operadores veem apenas campos essenciais, gestores têm acesso a drill-downs e configurações avançadas
- **Touch-Friendly para PWA**: Botões grandes (min 44×44px), espaçamento generoso, evitar hovers (pensando em tablets futuros)
- **Filtros Persistentes**: Última seleção de setor/linha/período é salva localmente (não obrigar re-seleção a cada sessão)
- **Assinatura em Batch com Controle Granular**: Supervisor vê lista com checkboxes (não radio), pode desmarcar registros problemáticos antes de assinar

### Core Screens and Views

**1. Tela de Apontamento Contemporâneo (Operador)**
- Formulário vertical em single column
- Campos: Linha (dropdown pré-filtrado por setor do usuário), Turno (auto-detectado por horário), Tipo de Evento (radio buttons grandes), Código de Parada (searchable dropdown com descrição), Quantidade Afetada (input numérico), Observações (textarea opcional)
- Botão primário: "Registrar Apontamento" (verde, full-width, loading state)
- Toast de confirmação: "✓ Salvo localmente" → "⟳ Sincronizando..." → "✓ Sincronizado"

**2. Dashboard Principal (Gestor/Supervisor)**
- Barra de filtros fixa no topo (sticky): Setor, Linha, Período, Date Range
- Grid responsivo 2×4 (desktop) ou 1×8 (mobile):
  - Velocímetro de OEE (destaque, 2x height)
  - Pareto de Paradas (principal ferramenta)
  - Componentes do OEE (barras)
  - Tabela Consolidada (TanStack Table com paginação)
  - Rosca Planejadas/Não Planejadas
  - Resumo de Horas Totais
  - Histórico de Tendências (últimas 10 semanas)
  - MTBF e MTTR
- Botão de export (floating action button, canto inferior direito): "Exportar Dashboard"

**3. Tela de Assinatura de Lote (Supervisor)**
- Lista de apontamentos pendentes filtrados por setor do supervisor
- Cada item: Checkbox, Linha, Operador, Tipo de Evento, Código de Parada, Timestamp, Badge de Status
- Ações: "Selecionar Todos", "Desmarcar Todos", botão primário "Assinar Selecionados (X itens)"
- Modal de re-autenticação: PIN/Senha + botão "Confirmar Assinatura"
- Feedback: Lista de assinados (verde), rejeitados (vermelho com motivo)

**4. Tela de Auditoria (Admin/Qualidade)**
- Filtros avançados: Usuário, Tabela, Ação (INSERT/UPDATE/DELETE), Data Range
- Tabela auditoria: Timestamp, Usuário, IP, Device, Tabela, Campo Alterado, Valor Antes, Valor Depois
- Export para Excel (compliance - auditorias ANVISA/FDA)

**5. Tela de Configurações de Linha (Admin/Engenharia)**
- CRUD de Velocidades Nominais por SKU
- CRUD de Metas de OEE por linha
- CRUD de Books de Paradas (hierarquia 5 níveis) - **Pós-MVP aguardando Atividade 06**

**6. Tela de Gerenciamento de Usuários (Admin)**
- CRUD de usuários com RLS roles: Operador, Supervisor, Gestor, Admin
- Vinculação: Operador → Setor(es), Supervisor → Setor
- Assinatura eletrônica: Ativar/desativar, reset de PIN

### Accessibility

**Nível:** WCAG AA (conformidade básica acessibilidade)

**Requisitos:**
- Contraste mínimo 4.5:1 (texto normal), 3:1 (texto grande e UI components)
- Navegação completa via teclado (tab order lógico)
- Screen reader friendly: ARIA labels em gráficos, formulários semânticos
- Tamanhos de fonte ajustáveis (respeitar zoom do navegador até 200%)
- Sem dependência exclusiva de cor para transmitir informação (usar ícones + texto)

**Nota:** WCAG AAA não é requisito para MVP farmacêutico (foco é compliance BPF, não acessibilidade avançada)

### Branding

**Paleta de cores funcional (alinhada com metodologia OEE):**
- Verde (#22C55E): Horas Valiosas, OEE acima da meta, status online, sucesso
- Azul (#3B82F6): Paradas Estratégicas, informação neutra
- Vermelho (#EF4444): Paradas Não Planejadas, OEE crítico, status offline, erro
- Laranja (#F59E0B): Perdas por Performance, alertas, avisos
- Amarelo (#EAB308): Perdas por Qualidade, atenção
- Cinza (#6B7280): Texto secundário, bordas, disabled states

**Tipografia:**
- Font-family: Inter (system font fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)
- Tamanhos: Body 16px, Headings 20/24/32px, Small 14px

**Identidade:**
- Logo Farmace/SicFar no header (posição: canto superior esquerdo)
- Tema: Light mode prioritário (áreas limpas têm iluminação controlada), dark mode não é prioridade MVP

**Estilo visual:**
- Minimalista pharma-clean: Espaços brancos generosos, cards com sombras sutis, bordas arredondadas (8px)
- Evitar gradientes chamativos ou animações excessivas (foco é dados, não "beleza")
- Inspiração: Evocon (clean + funcional) + Google Material 3 (componentes sólidos)

### Target Device and Platforms

**Plataformas:** Web Responsive (desktop prioritário, mobile via PWA)

**Devices alvo MVP:**
- **Desktop (80% dos casos):** Computadores fixos em áreas limpas (Windows 10/11, telas 1366×768 ou maiores)
- **Tablet (20% dos casos):** Supervisores circulando (iPads, Android tablets 10"+) - PWA instalado
- **Mobile (pós-MVP):** Smartphones para notificações e consultas rápidas

**Restrições ambiente pharma:**
- Áreas limpas NÃO permitem celulares pessoais (contaminação)
- Computadores são dedicados (não podem instalar software arbitrário → PWA é ideal)
- Conexão WiFi pode ser instável (paredes de concreto, equipamentos industriais interferem)

**Breakpoints Tailwind v4:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## Technical Assumptions

### Repository Structure

**Monorepo** (estrutura única de repositório)

**Justificativa:** Monorepo Turborepo permite compartilhamento de código (types, configs, UI components) entre frontend, gateway e docs, com deploy independente de cada app. Alternativas (polyrepo, multi-repo) aumentam complexidade de manutenção e sincronização de versões.

**Estrutura:**
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

### Service Architecture

**Arquitetura:** Monolito modular (frontend) + Worker isolado (gateway) + BaaS (Supabase)

**Não é Microservices nem Serverless Functions** - Escolha deliberada por simplicidade MVP:
- Frontend React é SPA (Single Page Application) hospedado em Vercel
- Gateway SICFAR é worker Node.js long-running (não serverless, pois precisa manter tail de arquivo)
- Supabase fornece backend (PostgreSQL + Auth + Realtime) como serviço

**Componentes:**
1. **Frontend (apps/web):** React 19 SPA, build Vite, deploy Vercel
2. **Gateway SICFAR (apps/gateway):** Node.js worker on-premise (Windows Server 2019), executa como serviço Windows (PM2 ou node-windows)
3. **Database:** Supabase Cloud (PostgreSQL managed)
4. **Auth:** Supabase Auth (JWT + RLS)
5. **Storage:** Supabase Storage (não usado no MVP)
6. **Real-time:** Supabase Realtime (WebSockets para dashboards live)

### Testing Requirements

**Estratégia MVP:** Unit + Integration (sem E2E completo no MVP)

**Cobertura:**
- **Unit Tests (obrigatório):**
  - Lógica de cálculo OEE (Disponibilidade, Performance, Qualidade) - TDD com Jest
  - Validações Zod (formulários, schemas)
  - Funções utilitárias (conversão de horas, tratamento de meia-noite)
  - **Target:** >80% cobertura para módulos críticos (cálculo, validação)

- **Integration Tests (obrigatório):**
  - Fluxo completo: Apontamento → IndexedDB → Sync Supabase → Assinatura → Audit trail
  - Gateway SICFAR: Leitura TXT → Agregação → UPDATE Supabase
  - Triggers PostgreSQL: INSERT/UPDATE/DELETE geram registros em `*_audit`
  - **Tool:** Vitest + Testing Library + Supabase local (Docker)

- **E2E Tests (pós-MVP):**
  - Playwright para user flows críticos (login → apontamento → dashboard)
  - **Razão do adiamento:** Timeline apertado (6 semanas protótipo), manual testing com operadores reais é mais valioso no MVP

- **Validação Pharma (QI/OQ/PQ - obrigatório pré-produção):**
  - **IQ (Installation Qualification):** Documentar ambiente, versões, infraestrutura
  - **OQ (Operational Qualification):** Testar cada feature contra especificações (este PRD)
  - **PQ (Performance Qualification):** Teste de stress (100 usuários, sessões 8h, offline/online)
  - **Responsável:** Consultor Rafael Gusmão + equipe Qualidade SicFar

### Additional Technical Assumptions and Requests

1. **Supabase Pro é suficiente para ALCOA+/CFR 21 Part 11**
   - Premissa: Triggers PostgreSQL + RLS + PITR backups atendem requisitos regulatórios
   - **Validação necessária:** Consultor Rafael Gusmão revisar arquitetura na Semana 2
   - **Plano B:** Se reprovado, migrar para PostgreSQL self-hosted (Azure/AWS managed) adiciona 4-6 semanas

2. **Gateway SICFAR aguenta carga de 10 linhas (MVP)**
   - Premissa: Windows Server 2019 processa 40 req/s (10 linhas × 4 req/s sem problemas)
   - **Validação necessária:** Teste de stress na Semana 4
   - **Plano B:** Se não aguentar, distribuir carga (múltiplos workers ou upgrade servidor)

3. **PWA é suficiente (não precisa app nativo MVP)**
   - Premissa: Operadores aceitam PWA instalado como se fosse app desktop
   - **Validação necessária:** Testes de usabilidade com 5-10 operadores na Semana 5
   - **Plano B:** Se adoção < 70%, desenvolver app React Native/Expo adiciona 8-12 semanas

4. **View materializada com refresh 1h é aceitável MVP**
   - Premissa: Dashboards não precisam ser tempo real absoluto (1h de lag é tolerável)
   - **Validação necessária:** Feedback de gestores na demo final (Semana 6)
   - **Plano B:** Implementar tabelas agregadas + triggers incrementais pós-MVP (3-4 semanas)

5. **Integração TOTVS fora do escopo MVP**
   - Decisão: Velocidades nominais por SKU serão cadastradas manualmente no MVP
   - **Razão:** APIs TOTVS podem não estar disponíveis/documentadas (descobrir leva 2-3 semanas)
   - **Pós-MVP:** Integração TOTVS via API ou ETL SQL direto (4-6 semanas)

6. **Books de Paradas como seed data (não CRUD MVP)**
   - Decisão: Hierarquia de 5 níveis será carregada via `seed.sql` no MVP
   - **Razão:** Atividade 06 (documentação books) não disponível ainda
   - **Pós-MVP:** Interface de CRUD completo para gestores cadastrarem novos códigos (3-4 semanas)

7. **Sem migração de dados históricos no MVP**
   - Premissa: Sistema começa "do zero" em Jan/2026 (não importa planilhas antigas)
   - **Validação necessária:** Confirmar com Sávio Rafael na Semana 1
   - **Plano B:** Se dados históricos forem críticos, ETL de Excel → PostgreSQL adiciona 4-6 semanas

8. **Internet estável em áreas limpas (offline é exceção, não regra)**
   - Premissa: WiFi/cabo funciona 95%+ do tempo, offline-first é safety net (não modo primário)
   - **Validação necessária:** Testar conectividade real em 2-3 linhas SPEP na Semana 4
   - **Plano B:** Se internet é muito instável (< 90% uptime), reforçar infraestrutura de rede (fora do escopo TI)

9. **Stack Tecnológica Confirmada (baseada no brainstorming):**
   - **Frontend:** React 19 + Vite 7 + Tailwind CSS v4 + Shadcn + TypeScript 5.3+
   - **State Management:** React Query (server state) + Zustand (client state, se necessário)
   - **Forms:** React Hook Form + Zod
   - **Charts:** ECharts (~700KB) + Recharts (~400KB) + TanStack Table
   - **PWA:** Vite PWA Plugin + Workbox (Service Worker)
   - **Offline:** IndexedDB via Dexie.js
   - **Backend:** Supabase (PostgreSQL 15+ + Auth + Realtime)
   - **Gateway:** Node.js 20 LTS + TypeScript
   - **Deploy:** Vercel (frontend) + Windows Server 2019 (gateway) + Supabase Cloud
   - **CI/CD:** GitHub Actions
   - **Monitoring:** Supabase Dashboard + Vercel Analytics

10. **Biblioteca de componentes customizada (não Material UI / Ant Design)**
    - Decisão: Shadcn (Tailwind-native, tree-shakeable, customizável) vs MUI (pesado, ~500KB)
    - **Razão:** Bundle size crítico (NFR9: <500KB inicial), Shadcn permite copy-paste apenas componentes usados

---

## Epic List

**Epic 1: Foundation & Core Infrastructure**

Estabelecer projeto setup, infraestrutura base (Supabase + Vercel + GitHub Actions), autenticação básica, e mecanismos críticos de escalabilidade (offline-first, sessões longas, audit trail). Entregar health-check funcional demonstrando sistema operacional e deployment pipeline ativo.

---

**Epic 2: Compliance & Data Integrity (ALCOA+/CFR 21 Part 11)**

Implementar assinatura eletrônica com fluxo híbrido (operador + supervisor), audit trail completo via triggers PostgreSQL, e Row Level Security (RLS) para controle de acesso granular. Sistema atende requisitos regulatórios farmacêuticos validáveis por consultor.

---

**Epic 3: Apontamentos Contemporâneos & Integração IoT**

Habilitar operadores a registrar apontamentos de paradas/perdas/trocas com formulário simples, validação em tempo real e feedback visual. Gateway SICFAR integra sensores KEYENCE atualizando contadores de produção/rejeição no Supabase. Operador e gateway funcionam completamente offline.

---

**Epic 4: Cálculo de OEE & View Materializada**

Implementar fórmulas de OEE validadas (Disponibilidade, Performance, Qualidade) conforme docs/project/05-Metodologia-Calculo.md. View materializada PostgreSQL agrega resultados por linha/turno/dia/semana/mês com refresh periódico (pg_cron 1h). Cálculos validados por Gerente de Processos (±2% tolerância).

---

**Epic 5: Dashboards Interativos & Visualizações (Top 4 Gráficos)**

Criar dashboard principal com 4 gráficos essenciais: Velocímetro de OEE (ECharts gauge), Pareto de Paradas (drill-down), Componentes do OEE (barras comparativas 12 períodos), e Tabela Consolidada (TanStack Table). Filtros dinâmicos por setor/linha/período. Gestores conseguem gerar insights em <2 minutos.

---

**Epic 6: Visualizações Complementares & Export**

Adicionar 4 gráficos restantes: Rosca Planejadas/Não Planejadas, Resumo de Horas Totais (barras empilhadas), Histórico de Tendências (10 semanas), MTBF e MTTR. Implementar export para Excel e PDF com filtros aplicados. Dashboard completo com 8 gráficos obrigatórios.

---

**Epic 7: Configurações & Gerenciamento de Dados Mestres**

Interface de administração para cadastro/edição de Velocidades Nominais por SKU, Metas de OEE por linha, Books de Paradas (seed data no MVP, CRUD pós-MVP), e gerenciamento de usuários com roles (Operador, Supervisor, Gestor, Admin). Engenharia e Admin têm autonomia para parametrizar sistema.

---

**Epic 8: Testes de Stress, Refinamento & Validação Final**

Executar testes de stress (100 usuários simultâneos, sessões 8h+, offline/online), ajustar performance baseado em métricas reais, refinar UX com feedback de operadores/gestores, preparar documentação técnica e roteiro de demo. Protótipo MVP validado e pronto para apresentação final.

---

## Epic 1: Foundation & Core Infrastructure

**Objetivo Expandido:** Estabelecer base sólida do projeto com monorepo Turborepo, infraestrutura Supabase + Vercel configurada, autenticação funcional via Supabase Auth, mecanismos de offline-first (IndexedDB + Service Worker), sessões longas (keep-alive automático), e estrutura inicial de banco de dados. Entregar health-check route demonstrando deployment pipeline ativo e sistema respondendo.

### Story 1.1: Setup de Monorepo Turborepo com Apps Base

**Como** desenvolvedor,
**Eu quero** configurar monorepo Turborepo com estrutura apps/web (React 19 + Vite) e apps/gateway (Node.js + TypeScript),
**Para que** eu possa compartilhar types e configs entre frontend e backend desde o início.

#### Acceptance Criteria

1. Repositório GitHub criado com estrutura Turborepo: `apps/web`, `apps/gateway`, `packages/ui`, `packages/db`, `packages/config`
2. Apps/web: Vite 7 + React 19 + TypeScript 5.3+ rodando com `turbo dev` exibindo "Hello World"
3. Apps/gateway: Node.js 20 LTS + TypeScript configurado com `turbo dev` executando console.log básico
4. Package.json raiz com scripts: `turbo dev`, `turbo build`, `turbo test`
5. ESLint + Prettier configurados em `packages/config` e aplicados em todos os apps
6. .gitignore configurado (node_modules, dist, .env, .turbo)
7. README.md raiz com instruções de setup (`npm install`, `turbo dev`)

---

### Story 1.2: Configurar Supabase Cloud e Conectar Frontend

**Como** desenvolvedor,
**Eu quero** criar projeto Supabase Pro e conectar apps/web via Supabase JS Client,
**Para que** eu tenha backend (PostgreSQL + Auth + Realtime) funcional desde o início.

#### Acceptance Criteria

1. Projeto Supabase criado no plano Pro com nome "SysOEE-MVP"
2. Variáveis de ambiente `.env.local` em apps/web: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
3. Supabase JS Client inicializado em `apps/web/src/lib/supabase.ts`
4. Health-check query: `SELECT 1` executado com sucesso no mount do App.tsx
5. Logs de conexão exibidos no console (URL do projeto, status connected)
6. Service Role Key armazenada em variável de ambiente (NÃO commitada no Git)
7. Documentação em README.md com passo-a-passo para obter keys do dashboard Supabase

---

### Story 1.3: Implementar Autenticação Básica (Email/Senha)

**Como** usuário do sistema,
**Eu quero** fazer login com email e senha,
**Para que** eu possa acessar o sistema de forma autenticada e rastreável.

#### Acceptance Criteria

1. Tela de Login (`/login`) com formulário: Email (input), Senha (password input), Botão "Entrar"
2. React Hook Form + Zod validando email formato válido e senha mínimo 8 caracteres
3. Função `signIn(email, password)` chamando `supabase.auth.signInWithPassword()`
4. Redirecionamento para `/dashboard` após login bem-sucedido
5. Mensagem de erro exibida se credenciais inválidas (toast ou text vermelho)
6. Estado de loading no botão "Entrar" (spinner + disabled) durante autenticação
7. Sessão JWT salva automaticamente pelo Supabase (localStorage)
8. Protected route `/dashboard` redirecionando para `/login` se não autenticado

---

### Story 1.4: Criar Schema Inicial de Banco de Dados

**Como** desenvolvedor,
**Eu quero** criar migrations SQL iniciais para tabelas core (users, setores, linhas, apontamentos, assinaturas_eletronicas),
**Para que** estrutura de dados esteja definida antes de implementar features.

#### Acceptance Criteria

1. Migration `20250101000000_initial_schema.sql` criada em `supabase/migrations/`
2. Tabela `setores`: id (uuid PK), nome (text NOT NULL), created_at (timestamp)
3. Tabela `linhas`: id (uuid PK), nome (text NOT NULL), setor_id (uuid FK → setores), velocidade_nominal_padrao (numeric), meta_oee (numeric 0-100), created_at
4. Tabela `apontamentos`: id (uuid PK), linha_id (uuid FK), user_id (uuid FK → auth.users), tipo_evento (enum), codigo_parada (text), timestamp_ocorrencia (timestamp NOT NULL), quantidade_afetada (numeric), observacoes (text), status (enum: draft, aguardando_assinatura, assinado), created_at, updated_at
5. Tabela `assinaturas_eletronicas`: id (uuid PK), apontamento_id (uuid FK), supervisor_id (uuid FK → auth.users), hash_sha256 (text NOT NULL), timestamp_assinatura (timestamp NOT NULL), ip_address (inet), device_info (jsonb)
6. Tabela `ordens_producao_ativas`: id (uuid PK), linha_id (uuid FK), producao_acumulada (bigint DEFAULT 0), rejeicao_acumulada (bigint DEFAULT 0), updated_at (timestamp)
7. Migration aplicada com sucesso via Supabase CLI: `supabase db push`
8. Seed data em `supabase/seed.sql`: 4 setores (SPEP, SPPV, Líquidos, CPHD) e 10 linhas SPEP

---

### Story 1.5: Implementar Offline-First Buffer (IndexedDB)

**Como** operador,
**Eu quero** que o sistema continue funcionando quando internet cair,
**Para que** eu não perca dados de apontamentos contemporâneos durante meu turno.

#### Acceptance Criteria

1. Biblioteca Dexie.js instalada e configurada em `apps/web/src/lib/db.ts`
2. Schema IndexedDB: tabela `pending_apontamentos` com campos: id, linha_id, tipo_evento, codigo_parada, timestamp_ocorrencia, quantidade_afetada, observacoes, created_at_local
3. Função `saveToPendingQueue(apontamento)` salvando no IndexedDB quando offline
4. Service `SyncService` tentando sincronizar pending_apontamentos com Supabase a cada 10 segundos
5. Event listeners `window.addEventListener('online')` e `offline` atualizando estado de conexão
6. Apontamentos sincronizados são removidos do IndexedDB automaticamente
7. UI exibindo badge de status: "Online" (verde), "Offline - X pendentes" (amarelo), "Sincronizando..." (azul)
8. Limite máximo de 10.000 registros no IndexedDB (FIFO - remove mais antigos se atingir limite)

---

### Story 1.6: Implementar Keep-Alive Automático de Sessões

**Como** operador,
**Eu quero** que minha sessão permaneça ativa durante todo o turno de 8 horas,
**Para que** eu não perca dados por desconexão automática e continue registrando apontamentos contemporâneos.

#### Acceptance Criteria

1. Supabase Client inicializado com `autoRefreshToken: true` em `lib/supabase.ts`
2. Timer setInterval executando `supabase.auth.getSession()` a cada 50 minutos (antes de token expirar em 1h)
3. Heartbeat query leve (`SELECT 1`) executado a cada 5 minutos para manter conexão PostgreSQL ativa
4. Contador de tempo de sessão exibido no header: "Sessão ativa: Xh Ymin"
5. Auto-reconnect implementado: se token refresh falhar, tentar 3x com exponential backoff (1s, 2s, 4s)
6. Log de atividade de keep-alive em console (dev mode) ou Supabase Dashboard (prod)
7. Toast de alerta se sessão falhar após 3 tentativas: "Sessão expirou. Faça login novamente."
8. Testes manuais: sessão permanece ativa por 8h+ sem interrupção

---

### Story 1.7: Configurar CI/CD com GitHub Actions e Vercel

**Como** desenvolvedor,
**Eu quero** pipeline de CI/CD automatizado,
**Para que** builds, testes e deploys aconteçam automaticamente a cada push.

#### Acceptance Criteria

1. Arquivo `.github/workflows/ci.yml` criado com jobs: `lint`, `typecheck`, `test`, `build`
2. Job `lint` executando `turbo lint` em todos os apps (falha se ESLint errors)
3. Job `typecheck` executando `turbo typecheck` (falha se TypeScript errors)
4. Job `test` executando `turbo test` (Vitest unit tests - mínimo 1 test passando)
5. Job `build` executando `turbo build` (gera dist/ de apps/web e apps/gateway)
6. Projeto Vercel conectado ao GitHub repository
7. Deploy automático de apps/web para Vercel a cada push na branch `main`
8. Environment variables configuradas no Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
9. Preview deploys automáticos para pull requests
10. Badge de status no README.md: "CI Status: Passing"

---

### Story 1.8: Criar Health-Check Route e Dashboard Canary

**Como** stakeholder,
**Eu quero** acessar uma rota de health-check e ver dashboard canary funcionando,
**Para que** eu valide que sistema está operacional e deployment pipeline está ativo.

#### Acceptance Criteria

1. Rota `/health` (não autenticada) retornando JSON: `{ status: "ok", version: "1.0.0", timestamp: "ISO8601", database: "connected" }`
2. Health-check testando conexão Supabase: `SELECT 1` (retorna `database: "error"` se falhar)
3. Rota acessível via `https://sysoee-mvp.vercel.app/health` (ou domínio Vercel)
4. Dashboard canary em `/dashboard` (rota autenticada) exibindo: "Sistema OEE - Protótipo MVP", logo Farmace/SicFar, e card "Bem-vindo, {nome_usuario}"
5. Layout base com header: Logo, título "SysOEE", badge de status conexão, nome do usuário, botão "Sair"
6. Footer com versão do sistema e link para documentação
7. Navegação funcional (ainda sem páginas completas, mas estrutura de rotas pronta)
8. Testes manuais: acessar `/health` retorna status 200 OK, acessar `/dashboard` sem login redireciona para `/login`

---

**Fim do Epic 1**

Este epic estabelece a fundação técnica sólida. Todos os epics subsequentes dependem desta infraestrutura estar operacional.

---

## Epic 2: Compliance & Data Integrity (ALCOA+/CFR 21 Part 11)

**Objetivo Expandido:** Implementar todos os controles regulatórios necessários para validação GMP: assinatura eletrônica com fluxo híbrido (operador registra → supervisor assina batch), audit trail completo via triggers PostgreSQL (rastreando quem/quando/o quê/antes/depois em todas as tabelas críticas), e Row Level Security (RLS) garantindo controle de acesso granular por role. Sistema deve atender 100% dos requisitos ALCOA+ e ser validável por Consultor Rafael Gusmão conforme CFR 21 Part 11.

### Story 2.1: Criar Triggers de Audit Trail para Tabelas Críticas

**Como** auditor de qualidade,
**Eu quero** rastrear todas as alterações em registros críticos (apontamentos, assinaturas, velocidades nominais),
**Para que** eu possa demonstrar integridade de dados conforme ALCOA+ em auditorias ANVISA/FDA.

#### Acceptance Criteria

1. Migration criada: `20250102000000_audit_trail_triggers.sql`
2. Tabela genérica `audit_log`: id (uuid PK), table_name (text), record_id (uuid), action (enum: INSERT, UPDATE, DELETE), user_id (uuid FK), field_changed (text nullable), old_value (jsonb nullable), new_value (jsonb nullable), timestamp (timestamp NOT NULL), ip_address (inet), device_info (jsonb)
3. Função PL/pgSQL `audit_trigger_func()` capturando OLD e NEW row, user via `auth.uid()`, timestamp via `now()`
4. Triggers instalados em tabelas críticas: `apontamentos`, `assinaturas_eletronicas`, `linhas` (campo velocidade_nominal), `books_paradas`
5. INSERT: salva `new_value` (record completo), `old_value` null
6. UPDATE: salva `field_changed`, `old_value`, `new_value` (apenas campos alterados - loop através de record fields)
7. DELETE: salva `old_value` (record completo), `new_value` null
8. IP Address capturado via `inet_client_addr()` (PostgreSQL function)
9. Device info salvo via custom `set_config('app.device_info', '{...}', true)` antes de mutation
10. Teste: inserir/atualizar/deletar apontamento → verificar registro correspondente em `audit_log` com todos os campos preenchidos

---

### Story 2.2: Implementar Row Level Security (RLS) para Controle de Acesso

**Como** administrador do sistema,
**Eu quero** garantir que operadores só vejam/modifiquem próprios apontamentos e supervisores só acessem seu setor,
**Para que** dados sejam protegidos conforme princípio de least privilege (ALCOA+ - Atribuível).

#### Acceptance Criteria

1. Migration criada: `20250103000000_rls_policies.sql`
2. Tabela `user_roles` criada: user_id (uuid PK FK → auth.users), role (enum: operador, supervisor, gestor, admin), setor_id (uuid FK nullable)
3. RLS habilitado em todas as tabelas: `ALTER TABLE apontamentos ENABLE ROW LEVEL SECURITY;`
4. Policy `apontamentos_select_own` (operador): `SELECT WHERE user_id = auth.uid()`
5. Policy `apontamentos_insert_own` (operador): `INSERT WITH CHECK (user_id = auth.uid())`
6. Policy `apontamentos_update_own` (operador): `UPDATE WHERE user_id = auth.uid() AND status = 'draft'`
7. Policy `apontamentos_select_setor` (supervisor): `SELECT WHERE linha_id IN (SELECT id FROM linhas WHERE setor_id = (SELECT setor_id FROM user_roles WHERE user_id = auth.uid()))`
8. Policy `apontamentos_select_all` (gestor, admin): `SELECT (no restrictions)`
9. Policy `assinaturas_insert_supervisor` (supervisor): `INSERT WITH CHECK (supervisor_id = auth.uid())`
10. Testes: criar usuário operador → tentar ler apontamento de outro operador (deve falhar), criar supervisor → deve ler todo o setor

---

### Story 2.3: Implementar Fluxo de Assinatura Eletrônica (Frontend)

**Como** supervisor,
**Eu quero** visualizar lista de apontamentos pendentes do meu setor e assinar em batch,
**Para que** eu valide registros contemporâneos dos operadores de forma eficiente.

#### Acceptance Criteria

1. Rota `/assinatura-lote` (protegida, role: supervisor)
2. Query Supabase: `SELECT * FROM apontamentos WHERE status = 'draft' AND linha_id IN (linhas do setor do supervisor) ORDER BY timestamp_ocorrencia DESC`
3. Tabela exibindo: Checkbox, Linha, Operador (nome via JOIN), Tipo Evento, Código Parada, Timestamp, Quantidade Afetada
4. Botões: "Selecionar Todos", "Desmarcar Todos"
5. Botão primário: "Assinar Selecionados (X itens)" (disabled se nenhum selecionado)
6. Click em "Assinar Selecionados" → abre Modal de Re-autenticação
7. Modal: Input PIN/Senha, Botão "Confirmar Assinatura", Botão "Cancelar"
8. Após confirmar PIN correto: chamar função `signBatch(apontamentoIds[], supervisorId, pin)`
9. Função gera hash SHA-256 de cada apontamento (concat: apontamento.id + timestamp + supervisor_id)
10. INSERTs em `assinaturas_eletronicas` + UPDATEs `apontamentos.status = 'assinado'`
11. Toast sucesso: "X apontamentos assinados com sucesso"
12. Lista atualizada automaticamente (remover itens assinados da view)

---

### Story 2.4: Adicionar Rejeição de Apontamentos pelo Supervisor

**Como** supervisor,
**Eu quero** desmarcar apontamentos incorretos e informar motivo,
**Para que** operador corrija erros antes de eu assinar o lote.

#### Acceptance Criteria

1. Cada item na lista de apontamentos tem botão secundário: "Rejeitar" (ícone X vermelho)
2. Click em "Rejeitar" → abre Modal: "Motivo da Rejeição" (textarea obrigatório), Botão "Confirmar Rejeição"
3. Função `rejectApontamento(apontamentoId, supervisorId, motivo)`
4. UPDATE `apontamentos SET status = 'rejeitado', motivo_rejeicao = ?, rejeitado_por = ?, rejeitado_em = now() WHERE id = ?`
5. Notificação enviada ao operador (toast quando ele logar): "Apontamento [Linha X - Código Y] foi rejeitado. Motivo: [texto]"
6. Operador pode editar apontamento rejeitado (volta status `draft` após edição)
7. Apontamento rejeitado não aparece mais na lista de assinatura até operador corrigir
8. Audit trail registra rejeição (action: UPDATE, campo status draft → rejeitado, motivo em new_value)

---

### Story 2.5: Validar Conformidade ALCOA+ com Consultor

**Como** Consultor Rafael Gusmão,
**Eu quero** revisar arquitetura de audit trail, assinatura eletrônica e RLS,
**Para que** eu valide que sistema atende CFR 21 Part 11 e pode ser usado em ambiente regulado.

#### Acceptance Criteria

1. Documento técnico criado: `docs/compliance/alcoa-plus-design.md` descrevendo:
   - **A (Atribuível):** RLS força user_id em todos os registros, auth.uid() nunca null
   - **L (Legível):** UI em português, dados não codificados, timestamps em formato brasileiro
   - **C (Contemporâneo):** Offline buffer + timestamp automático garantem registro no momento da ocorrência
   - **O (Original):** Audit trail com triggers imutáveis, DELETE físico bloqueado (apenas soft-delete)
   - **A (Exato):** Validações Zod no frontend + constraints PostgreSQL no backend
   - **+ (Completo):** Campos obrigatórios forçados, sem dados omitidos
   - **+ (Consistente):** Foreign keys + transactions ACID garantem integridade referencial
   - **+ (Durável):** Backups PITR 7 dias Supabase + replicação automática
   - **+ (Disponível):** SLA 99.9% Supabase Pro + offline-first garante acesso contínuo
2. Documento técnico: `docs/compliance/cfr-21-part-11.md` descrevendo:
   - Assinatura eletrônica: hash SHA-256 + re-autenticação + timestamp + IP + device
   - Audit trail: quem/quando/o quê/antes/depois em tabela imutável
   - Controle de acesso: RLS policies por role
3. Reunião de validação agendada (Semana 2) com Consultor Rafael Gusmão
4. Apresentação técnica (45 min): demonstração ao vivo de audit trail, assinatura, RLS
5. Consultor aprova por escrito (email ou documento): "Sistema atende requisitos CFR 21 Part 11 para uso em ambiente regulado"
6. Se reprovado: documentar gaps identificados e criar stories corretivas
7. Aprovação do consultor é bloqueio para prosseguir com desenvolvimento (Epic 3+)

---

**Fim do Epic 2**

Este epic é CRÍTICO - sem aprovação do consultor, sistema não pode ser validado formalmente (QI/OQ/QP). Todas as decisões arquiteturais de compliance devem ser validadas antes de codificar features de negócio.

---

## Epic 3: Apontamentos Contemporâneos & Integração IoT

**Objetivo Expandido:** Habilitar operadores a registrar apontamentos de paradas, perdas de qualidade e trocas de turno através de formulário simples e rápido (<30s por registro), com validação em tempo real, feedback visual imediato e funcionamento 100% offline. Gateway SICFAR integra sensores KEYENCE lendo arquivos TXT (4 registros/segundo), agregando contadores em memória por Ordem de Produção, e atualizando Supabase a cada 5 segundos. Operador consegue trabalhar turno completo (8h+) mesmo com internet instável.

### Story 3.1: Criar Formulário de Apontamento Contemporâneo (UI)

**Como** operador,
**Eu quero** registrar apontamento de parada em menos de 30 segundos com formulário simples,
**Para que** eu mantenha contemporaneidade (ALCOA+) sem atrasar minha produção.

#### Acceptance Criteria

1. Rota `/apontamento` (protegida, role: operador)
2. Layout vertical single-column (mobile-first, otimizado para telas 1366×768)
3. Campo "Linha" (Shadcn Select): dropdown pré-filtrado por setor do operador (via RLS), obrigatório
4. Campo "Turno" (auto-detectado): radio buttons desabilitados mostrando turno atual baseado em hora do sistema (6h-14h = Manhã, 14h-22h = Tarde, 22h-6h = Noite)
5. Campo "Tipo de Evento" (radio buttons grandes): Parada, Perda de Qualidade, Troca de Turno
6. Campo "Código de Parada" (Shadcn Combobox searchable): dropdown com descrição completa (ex: "P1.1 - Manutenção Planejada"), filtrado por Book da linha selecionada, obrigatório
7. Campo "Quantidade Afetada" (input numérico): opcional para Parada, obrigatório para Perda de Qualidade
8. Campo "Observações" (textarea): opcional, max 500 caracteres
9. Timestamp capturado automaticamente: `new Date().toISOString()` (não editável pelo usuário)
10. Botão primário: "Registrar Apontamento" (verde, full-width, loading state com spinner)
11. Validações Zod em tempo real: campos obrigatórios, quantidade > 0 se Perda, linha pertence ao setor do operador
12. Formulário limpa campos após registro bem-sucedido (ready para próximo apontamento)

---

### Story 3.2: Implementar Lógica de Salvamento Offline-First

**Como** operador,
**Eu quero** que apontamentos sejam salvos localmente se internet cair,
**Para que** eu não perca dados contemporâneos durante meu turno.

#### Acceptance Criteria

1. Service `ApontamentoService.save(apontamento)` implementado
2. Detectar status de conexão: `navigator.onLine` ou ping em Supabase
3. Se ONLINE: tentar INSERT direto em Supabase `apontamentos` table
4. Se INSERT sucesso: retornar `{ status: 'synced', id: uuid }`
5. Se OFFLINE ou INSERT falha: salvar em IndexedDB `pending_apontamentos`
6. Retornar `{ status: 'pending_local', id: uuid_local }`
7. Toast exibido conforme status:
   - Synced: "✓ Apontamento registrado e sincronizado"
   - Pending: "⚠ Salvo localmente - será sincronizado quando conexão retornar"
8. Background sync: `SyncService` tentando enviar pending_apontamentos a cada 10 segundos
9. Se sync bem-sucedido: remover de IndexedDB, atualizar badge de status no header
10. Teste manual: desconectar WiFi → registrar apontamento → deve salvar local → reconectar → deve sincronizar automaticamente

---

### Story 3.3: Adicionar Feedback Visual de Status de Sincronização

**Como** operador,
**Eu quero** ver claramente se sistema está online e quantos apontamentos estão pendentes,
**Para que** eu tenha confiança de que dados não serão perdidos.

#### Acceptance Criteria

1. Badge de status no header (sempre visível, canto superior direito)
2. Estados do badge:
   - **Online (verde):** "🟢 Online" - conexão Supabase OK
   - **Offline (amarelo):** "🟡 Offline - X pendentes" - sem conexão, X = count de pending_apontamentos
   - **Sincronizando (azul):** "🔵 Sincronizando..." - upload em progresso
   - **Erro (vermelho):** "🔴 Erro de conexão" - falha após 3 tentativas
3. Click no badge abre modal com detalhes: lista de apontamentos pendentes, última tentativa de sync, botão "Tentar Sincronizar Agora"
4. Polling a cada 5 segundos: verificar `navigator.onLine` e count de IndexedDB
5. Animação no badge quando sincronizando (pulse ou spinner)
6. Toast de sucesso quando todos pendentes forem sincronizados: "✓ Todos os apontamentos foram sincronizados"
7. Persistir estado do badge no localStorage (sobrevive a refresh da página)

---

### Story 3.4: Implementar Validação de Códigos de Parada por Book da Linha

**Como** operador,
**Eu quero** ver apenas códigos de parada válidos para minha linha,
**Para que** eu não registre códigos incorretos e cause inconsistência de dados.

#### Acceptance Criteria

1. Tabela `books_paradas` no schema: id (uuid PK), linha_id (uuid FK), codigo (text NOT NULL), classe (text), grande_parada (text), apontamento (text), grupo (text nullable), detalhamento (text nullable), is_ativo (boolean DEFAULT true)
2. Seed data: carregar Book de Paradas de SPEP (10 linhas × ~50 códigos cada = ~500 registros)
3. Query ao selecionar linha no formulário: `SELECT codigo, grande_parada, apontamento FROM books_paradas WHERE linha_id = ? AND is_ativo = true ORDER BY codigo`
4. Combobox "Código de Parada" populado com resultados (formato: "P1.1 - Manutenção Planejada")
5. Search funcional: digitar "manut" filtra para códigos contendo "manut" (case-insensitive)
6. Validação backend (constraint): `CHECK (codigo_parada IN (SELECT codigo FROM books_paradas WHERE linha_id = apontamentos.linha_id))`
7. Se operador tentar burlar frontend (via API direta): INSERT falha com erro "Código de parada inválido para esta linha"
8. Teste: selecionar Linha A SPEP → dropdown deve ter ~50 códigos específicos da Linha A

---

### Story 3.5: Desenvolver Gateway SICFAR (Node.js Worker)

**Como** gestor,
**Eu quero** dados de sensores KEYENCE integrados automaticamente ao sistema,
**Para que** cálculos de OEE reflitam produção real sem apontamento manual.

#### Acceptance Criteria

1. Projeto `apps/gateway` com estrutura: `src/index.ts`, `src/services/FileTailService.ts`, `src/services/SupabaseSyncService.ts`
2. FileTailService lê arquivo TXT via tail (biblioteca `tail` do npm): `new Tail('/path/to/keyence_output.txt')`
3. Arquivo TXT tem formato: `timestamp,linha_id,producao_count,rejeicao_count` (1 linha por registro, 4 registros/segundo)
4. Parser extrai campos: timestamp, linha_id, producao_count, rejeicao_count
5. Agregador em memória: `Map<linha_id, { producao_acumulada, rejeicao_acumulada }>`
6. A cada novo registro: `map.get(linha_id).producao_acumulada += producao_count`
7. Timer setInterval (5 segundos): flush agregador → UPDATE Supabase
8. Query Supabase: `UPDATE ordens_producao_ativas SET producao_acumulada = ?, rejeicao_acumulada = ?, updated_at = now() WHERE linha_id = ?`
9. Service Role Key usado para autenticação (não anon key - backend-only)
10. Retry com exponential backoff se UPDATE falhar (3 tentativas: 1s, 2s, 4s)
11. Logs estruturados: Winston logger salvando em `logs/gateway-YYYY-MM-DD.log`
12. Teste: simular arquivo TXT com 100 registros/segundo → verificar UPDATEs a cada 5s no Supabase Dashboard

---

### Story 3.6: Configurar Gateway como Serviço Windows

**Como** administrador de TI,
**Eu quero** gateway rodando como serviço Windows iniciando automaticamente,
**Para que** dados de sensores continuem fluindo mesmo após reboot do servidor.

#### Acceptance Criteria

1. Biblioteca `node-windows` instalada em `apps/gateway`
2. Script `install-service.js` criado configurando serviço Windows: nome "SysOEE Gateway", descrição, executável `node dist/index.js`
3. Service instalado via: `node install-service.js` (executar como Admin)
4. Service configurado para: Auto-start, Restart on failure (3 tentativas), Log output em `logs/service.log`
5. Comandos PowerShell funcionando: `net start "SysOEE Gateway"`, `net stop "SysOEE Gateway"`
6. Teste: reiniciar Windows Server 2019 → gateway inicia automaticamente em 30-60s
7. Monitoramento: dashboard Supabase mostrando UPDATEs em `ordens_producao_ativas` continuando após reboot
8. Documentação em README: como instalar/desinstalar/atualizar serviço

---

### Story 3.7: Adicionar Tratamento de Paradas que Atravessam Meia-Noite

**Como** operador,
**Eu quero** registrar paradas que começam em um dia e terminam no dia seguinte,
**Para que** duração seja calculada corretamente independente de atravessar meia-noite.

#### Acceptance Criteria

1. Formulário de apontamento: adicionar campo "Hora Início" (time picker) e "Hora Término" (time picker)
2. Se tipo evento = "Parada": campos hora início/término são obrigatórios
3. Função utilitária `calculateDuration(dataOcorrencia, horaInicio, horaTermino)`:
   - Se `horaTermino > horaInicio`: duração = horaTermino - horaInicio
   - Se `horaTermino < horaInicio`: parada atravessou meia-noite → duração = (24h - horaInicio) + horaTermino
4. Exemplo: início 23:30, término 00:45 → duração = 0.5h + 0.75h = 1.25h (1h15min)
5. Campo `duracao_minutos` (integer) calculado e salvo em `apontamentos` table
6. Validação: duração máxima = 12h (se > 12h, alertar operador "Duração muito longa - confirme os horários")
7. Exibição na UI: converter minutos para formato legível "Xh Ymin"
8. Teste: criar apontamento 23:30 → 00:45 → deve calcular 75 minutos corretamente

---

**Fim do Epic 3**

Este epic entrega o primeiro vertical slice completo de valor: operador registra dados contemporâneos + gateway captura sensores + sistema funciona offline. É o core operacional do sistema.

---

## Epic 4: Cálculo de OEE & View Materializada

**Objetivo Expandido:** Implementar todas as fórmulas de OEE validadas conforme docs/project/05-Metodologia-Calculo.md, criando view materializada PostgreSQL que agrega Disponibilidade, Performance e Qualidade por linha/turno/dia/semana/mês. View refresh via pg_cron (1h no MVP). Cálculos devem ser validados por Gerente de Processos (Sávio Rafael) com margem de tolerância ±2% comparado a planilhas de referência. Sistema calcula cada componente separadamente (não apenas OEE final) para permitir análise detalhada.

### Story 4.1: Implementar Funções SQL de Cálculo de Disponibilidade

**Como** analista de dados,
**Eu quero** função SQL que calcula Disponibilidade conforme metodologia validada,
**Para que** view materializada use fórmulas corretas e auditáveis.

#### Acceptance Criteria

1. Migration criada: `20250104000000_oee_calculation_functions.sql`
2. Função `calculate_disponibilidade(linha_id, data_inicio, data_fim) RETURNS numeric`:
   - Tempo Calendário = diferença em horas entre data_fim e data_inicio
   - Paradas Estratégicas = SUM(duracao_minutos) WHERE tipo_parada = 'Estratégica' / 60
   - Tempo Disponível = Tempo Calendário - Paradas Estratégicas
   - Paradas de Indisponibilidade = SUM(duracao_minutos) WHERE tipo_parada IN ('Planejada', 'Não Planejada') AND duracao >= 10 / 60 (pequenas paradas < 10min não entram aqui)
   - Tempo de Operação = Tempo Disponível - Paradas de Indisponibilidade
   - Disponibilidade (%) = (Tempo de Operação / Tempo Disponível) × 100
3. Todas as conversões em **horas** (não minutos ou segundos)
4. Retorna NULL se Tempo Disponível = 0 (evitar divisão por zero)
5. Comentários SQL documentando cada step da fórmula (rastreabilidade para auditoria)
6. Unit test SQL: `SELECT calculate_disponibilidade('linha_a_id', '2026-01-01', '2026-01-02')` → deve retornar valor esperado de planilha de validação

---

### Story 4.2: Implementar Funções SQL de Cálculo de Performance

**Como** analista de dados,
**Eu quero** função SQL que calcula Performance considerando velocidade nominal por SKU,
**Para que** cálculos reflitam produtividade real de cada produto.

#### Acceptance Criteria

1. Função `calculate_performance(linha_id, data_inicio, data_fim) RETURNS numeric`:
   - Unidades Produzidas = SUM(producao_acumulada) FROM ordens_producao_ativas WHERE linha_id = ? AND updated_at BETWEEN data_inicio AND data_fim
   - Velocidade Nominal = JOIN com `linhas` → `velocidade_nominal_padrao` (ou por SKU se ordens_producao_ativas tiver sku_id FK)
   - Tempo Operacional Líquido = Unidades Produzidas / Velocidade Nominal (em horas)
   - Tempo de Operação = valor retornado de `calculate_disponibilidade()` (reutiliza função anterior)
   - Performance (%) = (Tempo Operacional Líquido / Tempo de Operação) × 100
2. Pequenas paradas (< 10min) impactam Performance (não Disponibilidade) - fórmula automaticamente captura isso
3. Retorna NULL se Tempo de Operação = 0
4. Documentação SQL: "Performance mede velocidade real vs ideal, incluindo impacto de pequenas paradas"
5. Unit test: validar com planilha de referência (±2% tolerância)

---

### Story 4.3: Implementar Funções SQL de Cálculo de Qualidade

**Como** analista de dados,
**Eu quero** função SQL que calcula Qualidade considerando refugo e retrabalho,
**Para que** OEE reflita perdas de qualidade corretamente.

#### Acceptance Criteria

1. Função `calculate_qualidade(linha_id, data_inicio, data_fim) RETURNS numeric`:
   - Unidades Produzidas = SUM(producao_acumulada) FROM ordens_producao_ativas
   - Unidades Rejeitadas = SUM(rejeicao_acumulada) FROM ordens_producao_ativas
   - Unidades Boas = Unidades Produzidas - Unidades Rejeitadas
   - Qualidade_Unidades (%) = (Unidades Boas / Unidades Produzidas) × 100
   - Tempo de Retrabalho = SUM(duracao_minutos) WHERE tipo_evento = 'Retrabalho' / 60
   - Tempo de Operação = valor de `calculate_disponibilidade()`
   - Qualidade_Retrabalho (%) = ((Tempo de Operação - Tempo de Retrabalho) / Tempo de Operação) × 100
   - Qualidade Total (%) = Qualidade_Unidades × Qualidade_Retrabalho
2. Retorna 100% se não houver rejeições nem retrabalho
3. Retorna NULL se Unidades Produzidas = 0
4. Documentação: "Retrabalho é perda de qualidade, não indisponibilidade"
5. Unit test: validar fórmula dupla (unidades + retrabalho) com planilha

---

### Story 4.4: Criar View Materializada `oee_agregado`

**Como** gestor,
**Eu quero** view materializada com OEE pré-calculado por linha e período,
**Para que** dashboards carreguem rapidamente sem recalcular a cada query.

#### Acceptance Criteria

1. Migration criada: `20250105000000_oee_materialized_view.sql`
2. View materializada `oee_agregado`:
   - Colunas: linha_id, setor_id, periodo_tipo (enum: dia, semana, mes), periodo_inicio (date), periodo_fim (date), disponibilidade (numeric), performance (numeric), qualidade (numeric), oee (numeric), updated_at (timestamp)
3. Query base da view:
   ```sql
   SELECT
     l.id as linha_id,
     l.setor_id,
     'dia'::text as periodo_tipo,
     d.data as periodo_inicio,
     d.data as periodo_fim,
     calculate_disponibilidade(l.id, d.data, d.data + interval '1 day') as disponibilidade,
     calculate_performance(l.id, d.data, d.data + interval '1 day') as performance,
     calculate_qualidade(l.id, d.data, d.data + interval '1 day') as qualidade,
     calculate_disponibilidade(...) * calculate_performance(...) * calculate_qualidade(...) / 10000 as oee,
     now() as updated_at
   FROM linhas l
   CROSS JOIN generate_series('2026-01-01', current_date, '1 day') d(data)
   WHERE l.is_ativo = true
   ```
4. UNION com agregações por semana (generate_series com '1 week')
5. UNION com agregações por mês (generate_series com '1 month')
6. View usa índices em `apontamentos(linha_id, timestamp_ocorrencia)` e `ordens_producao_ativas(linha_id, updated_at)`
7. Comando refresh: `REFRESH MATERIALIZED VIEW CONCURRENTLY oee_agregado;`
8. CONCURRENTLY permite queries continuarem durante refresh (não bloqueia leitura)

---

### Story 4.5: Configurar pg_cron para Refresh Automático da View

**Como** desenvolvedor,
**Eu quero** view materializada atualizada automaticamente a cada 1 hora,
**Para que** dashboards sempre mostrem dados recentes sem intervenção manual.

#### Acceptance Criteria

1. Extensão pg_cron habilitada no Supabase: `CREATE EXTENSION pg_cron;`
2. Job pg_cron criado:
   ```sql
   SELECT cron.schedule(
     'refresh-oee-view',
     '0 * * * *', -- a cada hora, no minuto 0
     $$REFRESH MATERIALIZED VIEW CONCURRENTLY oee_agregado;$$
   );
   ```
3. Job status verificável via: `SELECT * FROM cron.job;`
4. Logs de execução em `cron.job_run_details`: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;`
5. Alerta configurado (Supabase Dashboard ou email): se job falhar 3x consecutivas, notificar admin
6. Documentação: como pausar/retomar job (`SELECT cron.unschedule('refresh-oee-view');`)
7. Teste manual: forçar refresh `REFRESH MATERIALIZED VIEW oee_agregado;` → verificar `updated_at` atualizado

---

### Story 4.6: Criar Indicadores Secundários (MTBF, MTTR, Taxa de Utilização)

**Como** gestor de manutenção,
**Eu quero** visualizar MTBF e MTTR das linhas,
**Para que** eu priorize manutenção preditiva e reduza paradas não planejadas.

#### Acceptance Criteria

1. Função `calculate_mtbf(linha_id, data_inicio, data_fim) RETURNS numeric`:
   - Tempo Total de Operação (horas) = SUM(Tempo de Operação) por dia no período
   - Número de Falhas = COUNT(apontamentos) WHERE tipo_parada LIKE 'Quebra%' OR tipo_parada LIKE 'Falha%'
   - MTBF (horas) = Tempo Total de Operação / Número de Falhas
   - Retorna NULL se Número de Falhas = 0
2. Função `calculate_mttr(linha_id, data_inicio, data_fim) RETURNS numeric`:
   - Tempo Total de Reparo (horas) = SUM(duracao_minutos) WHERE tipo_parada LIKE 'Quebra%' OR 'Falha%' / 60
   - Número de Reparos = COUNT(apontamentos) WHERE tipo_parada LIKE 'Quebra%' OR 'Falha%'
   - MTTR (horas) = Tempo Total de Reparo / Número de Reparos
   - Retorna NULL se Número de Reparos = 0
3. Função `calculate_taxa_utilizacao(linha_id, data_inicio, data_fim) RETURNS numeric`:
   - Taxa de Utilização (%) = (Tempo de Operação / Tempo Calendário) × 100
   - Diferença vs OEE: usa Tempo Calendário (não Tempo Disponível) como denominador
4. View materializada `indicadores_secundarios_agregado`:
   - Colunas: linha_id, periodo_tipo, periodo_inicio, periodo_fim, mtbf, mttr, taxa_utilizacao, updated_at
   - Refresh via mesmo job pg_cron (adicionar linha no schedule)
5. Documentação: "MTBF alto = confiável, MTTR baixo = manutenção rápida"
6. Unit tests: validar fórmulas com planilhas de referência

---

### Story 4.7: Validar Cálculos de OEE com Gerente de Processos

**Como** Sávio Rafael (Gerente de Processos),
**Eu quero** comparar OEE calculado pelo sistema com minhas planilhas de validação,
**Para que** eu aprove que cálculos estão corretos antes do sistema ir para produção.

#### Acceptance Criteria

1. Planilhas de validação fornecidas por Sávio Rafael (Excel ou Google Sheets) com:
   - Dados de entrada: linha, período, apontamentos, sensores (producao/rejeicao)
   - Cálculos esperados: Disponibilidade, Performance, Qualidade, OEE
2. Script de teste automatizado `scripts/validate-oee-calculations.ts`:
   - Lê planilha de validação (biblioteca XLSX)
   - Para cada linha de teste: insere dados no Supabase (seed test data)
   - Executa `REFRESH MATERIALIZED VIEW oee_agregado;`
   - Query `SELECT * FROM oee_agregado WHERE linha_id = ? AND periodo = ?`
   - Compara resultados: `abs(sistema_oee - planilha_oee) <= 2%` (tolerância ±2%)
3. Report gerado: `docs/validation/oee-calculation-report.md`:
   - Lista de testes executados
   - Resultado: Pass/Fail para cada linha
   - Desvios > 2%: destacados com explicação
4. Reunião de validação com Sávio Rafael (Semana 3):
   - Demonstração ao vivo: inserir apontamento → refresh view → mostrar OEE calculado
   - Revisar report de validação juntos
   - Sávio aprova por escrito (email): "Cálculos de OEE aprovados, diferença dentro da tolerância"
5. Se reprovado (desvio > 2%): identificar fonte de erro (fórmula SQL errada, dados de teste incorretos, etc.) e corrigir
6. Aprovação de Sávio é requisito para Epic 5 (dashboards) - não adianta visualizar dados incorretos

---

**Fim do Epic 4**

Este epic é o cérebro do sistema - cálculos de OEE corretos são fundação para todas as decisões de negócio. Validação com Sávio Rafael é checkpoint crítico antes de visualizar dados.

---

## Epic 5: Dashboards Interativos & Visualizações (Top 4 Gráficos)

**Objetivo Expandido:** Criar dashboard principal com 4 gráficos essenciais que entregam valor gerencial imediato: Velocímetro de OEE (visão executiva por linha), Pareto de Paradas (principal ferramenta de gestão para priorizar ações), Componentes do OEE (diagnóstico de qual pilar está baixo), e Tabela Consolidada (dados detalhados com ordenação/filtros). Implementar filtros dinâmicos por setor/linha/período funcionando em todos os gráficos. Gestores devem conseguir gerar insights em <2 minutos.

### Story 5.1: Criar Barra de Filtros Dinâmicos (Shared Component)

**Como** gestor,
**Eu quero** filtrar dashboards por setor, linha e período de forma persistente,
**Para que** eu visualize dados relevantes para minha análise sem reconfigurar a cada sessão.

#### Acceptance Criteria

1. Componente `<DashboardFilters>` no topo do dashboard (sticky position)
2. Filtro "Setor" (Shadcn Select): opções SPEP, SPPV, Líquidos, CPHD, Todos
3. Filtro "Linha" (Shadcn Select): dropdown dinâmico baseado em setor selecionado (query: `SELECT * FROM linhas WHERE setor_id = ? ORDER BY nome`)
4. Filtro "Período" (Shadcn Select): opções Últimas 24h, Última Semana, Último Mês, Customizado
5. Se "Customizado" selecionado: abrir Shadcn Popover com date range picker (data início + data fim)
6. Botão "Aplicar Filtros" (primário, azul) - dispara query e atualiza todos os gráficos
7. Botão "Limpar Filtros" (secundário, ghost) - reseta para valores padrão
8. State management: Zustand store `useFiltersStore` compartilhado entre componentes de gráficos
9. Persistência: salvar filtros no localStorage (key: `sysoee_dashboard_filters`) - sobrevive a refresh
10. Loading state: skeleton nos gráficos enquanto dados carregam após aplicar filtros
11. Query params na URL: `?setor=SPEP&linha=linha_a&periodo=semana` para compartilhar views específicas

---

### Story 5.2: Implementar Velocímetro de OEE (ECharts Gauge)

**Como** gestor,
**Eu quero** ver OEE consolidado em formato de velocímetro com meta visual,
**Para que** eu identifique rapidamente se linha está acima ou abaixo da meta.

#### Acceptance Criteria

1. Componente `<OEEGauge>` usando biblioteca `echarts-for-react`
2. Query Supabase: `SELECT AVG(oee) as oee_medio FROM oee_agregado WHERE linha_id = ? AND periodo_inicio BETWEEN ? AND ?`
3. Meta OEE: query `SELECT meta_oee FROM linhas WHERE id = ?`
4. Gauge configuração:
   - Min: 0%, Max: 100%
   - Zonas de cor: 0-50% (vermelho), 50-70% (amarelo), 70-100% (verde)
   - Agulha apontando para OEE atual
   - Linha de meta: marcador visual na meta (ex: 75%)
5. Título acima do gauge: "OEE - {nome_linha}" ou "OEE Médio - {nome_setor}" se múltiplas linhas
6. Valor numérico centralizado: "XX.X%" (1 casa decimal)
7. Subtítulo abaixo: "Meta: YY%" (meta da linha)
8. Tooltip ao hover: "OEE: XX.X% | Disponibilidade: AA% | Performance: BB% | Qualidade: CC%"
9. Responsivo: height 300px (mobile), 400px (tablet), 500px (desktop)
10. Animação smooth ao carregar (duration 1000ms, easing cubicOut)

---

### Story 5.3: Implementar Gráfico de Pareto de Paradas

**Como** gestor,
**Eu quero** visualizar principais causas de paradas em ordem decrescente com Pareto,
**Para que** eu priorize ações corretivas nos maiores ofensores (princípio 80/20).

#### Acceptance Criteria

1. Componente `<ParetoChart>` usando Recharts (ComposedChart com barras + linha)
2. Query Supabase:
   ```sql
   SELECT
     bp.grande_parada,
     SUM(a.duracao_minutos) / 60 as horas_totais,
     COUNT(*) as quantidade_ocorrencias
   FROM apontamentos a
   JOIN books_paradas bp ON a.codigo_parada = bp.codigo
   WHERE a.linha_id = ? AND a.timestamp_ocorrencia BETWEEN ? AND ?
   GROUP BY bp.grande_parada
   ORDER BY horas_totais DESC
   LIMIT 10
   ```
3. Cálculo de Pareto: acumulado percentual (linha vermelha) = `(SUM(horas_totais até item) / SUM(horas_totais total)) × 100`
4. Barras verticais azuis: altura = horas_totais
5. Linha vermelha overlay: percentual acumulado (eixo Y direito 0-100%)
6. Eixo X: Grande Parada (truncar labels longos com "...")
7. Eixo Y esquerdo: Horas (0 - max)
8. Eixo Y direito: Percentual acumulado (0% - 100%)
9. Tooltip ao hover: "Parada: {nome} | Horas: XX.Xh (YY% do total) | Ocorrências: ZZ"
10. Drill-down: click em barra → abrir modal listando apontamentos detalhados dessa grande parada (tabela com timestamp, linha, operador, duração)
11. Legend: "Horas de Parada" (barra azul), "% Acumulado" (linha vermelha)
12. Export button (ícone download): exportar dados do gráfico para Excel

---

### Story 5.4: Implementar Gráfico de Componentes do OEE

**Como** gestor,
**Eu quero** comparar Disponibilidade, Performance e Qualidade em barras lado a lado,
**Para que** eu identifique qual pilar do OEE está prejudicando eficiência.

#### Acceptance Criteria

1. Componente `<OEEComponentsChart>` usando Recharts (BarChart com 3 barras agrupadas)
2. Query Supabase: `SELECT periodo_inicio, disponibilidade, performance, qualidade, oee FROM oee_agregado WHERE linha_id = ? ORDER BY periodo_inicio DESC LIMIT 12`
3. Eixo X: Período (últimos 12 dias/semanas/meses conforme filtro)
4. Eixo Y: Percentual (0-100%)
5. Barras agrupadas por período:
   - Disponibilidade (verde escuro)
   - Performance (laranja)
   - Qualidade (amarelo)
6. Linha de meta: horizontal tracejada (ex: 75%) cruzando o gráfico
7. Tooltip ao hover: "Período: {data} | Disponibilidade: XX% | Performance: YY% | Qualidade: ZZ% | OEE: AA%"
8. Legend: checkboxes interativos - clicar em "Disponibilidade" esconde/mostra barras verdes
9. Responsivo: empilhar barras verticalmente em mobile (<640px)
10. Botão toggle "Visualizar por Linha": abre view alternativa com todas as linhas lado a lado (útil para comparar setores)

---

### Story 5.5: Implementar Tabela Consolidada com TanStack Table

**Como** gestor,
**Eu quero** tabela detalhada de OEE com ordenação, filtros e paginação,
**Para que** eu analise dados granulares e exporte para relatórios.

#### Acceptance Criteria

1. Componente `<OEEConsolidatedTable>` usando TanStack Table v8
2. Query Supabase: `SELECT * FROM oee_agregado WHERE {filtros} ORDER BY periodo_inicio DESC`
3. Colunas:
   - Linha (sortable)
   - Setor (sortable)
   - Período (sortable, formato dd/mm/yyyy)
   - Disponibilidade % (sortable, cor verde se >70%, amarelo se 50-70%, vermelho se <50%)
   - Performance % (sortable, mesma lógica de cores)
   - Qualidade % (sortable, mesma lógica de cores)
   - OEE % (sortable, bold, cores dinâmicas)
   - Última atualização (timestamp, formato relativo "há 2 horas")
4. Filtros inline: input de busca por linha (debounced 300ms)
5. Paginação: 10/25/50/100 itens por página (Shadcn Select no footer)
6. Ordenação: click em header alterna asc/desc/none
7. Loading state: skeleton rows durante fetch
8. Empty state: "Nenhum dado encontrado para os filtros selecionados" (Shadcn Empty)
9. Export button: "Exportar para Excel" (biblioteca XLSX) - exporta dados filtrados/ordenados atuais
10. Responsivo: scroll horizontal em mobile, colunas fixas (Linha + OEE sempre visíveis)

---

### Story 5.6: Implementar React Query para Cache Inteligente

**Como** desenvolvedor,
**Eu quero** cache de queries com invalidação inteligente,
**Para que** dashboards carreguem instantaneamente em navegações subsequentes.

#### Acceptance Criteria

1. React Query v5 configurado em `apps/web/src/lib/queryClient.ts`
2. QueryClient config: `{ defaultOptions: { queries: { staleTime: 5 * 60 * 1000, cacheTime: 10 * 60 * 1000 } } }`
3. Hook customizado `useOEEData(filters)`:
   - Query key: `['oee', filters.setor, filters.linha, filters.periodo]`
   - Query function: fetch de `oee_agregado` com filtros
   - Enabled: apenas quando filtros estão válidos
4. Hook `useParetoData(filters)` para dados de Pareto
5. Hook `useComponentsData(filters)` para gráfico de componentes
6. Invalidação manual: botão "Atualizar Dados" (ícone refresh) nos filtros → `queryClient.invalidateQueries(['oee'])`
7. Invalidação automática: após criar novo apontamento → invalida queries relacionadas
8. Loading states: `isLoading`, `isFetching` expostos para UI
9. Error handling: toast de erro se query falhar (Shadcn Toast com retry button)
10. Prefetching: ao hover em filtro de linha → prefetch dados dessa linha

---

### Story 5.7: Criar Layout Responsivo do Dashboard

**Como** usuário mobile,
**Eu quero** dashboard adaptado para tablets e celulares,
**Para que** supervisores acessem dados enquanto circulam pela fábrica.

#### Acceptance Criteria

1. Layout grid responsivo usando Tailwind CSS:
   - Desktop (>1024px): 2 colunas × 4 linhas
   - Tablet (640-1024px): 1 coluna × 8 linhas (gráficos empilhados)
   - Mobile (<640px): 1 coluna, gráficos com scroll horizontal se necessário
2. Header fixo (sticky top): logo, título, filtros (colapsáveis em mobile), badge status, user menu
3. Velocímetro OEE: span 2 colunas em desktop (destaque), full-width em mobile
4. Pareto: grid item com height adaptativo (min 400px)
5. Componentes OEE: grid item com height adaptativo
6. Tabela: full-width, scroll horizontal em mobile
7. Gráficos lazy-loaded: apenas carregam quando entram no viewport (react-intersection-observer)
8. PWA: adicionar botão "Instalar App" no header se PWA não instalado ainda (detectar via `window.matchMedia('(display-mode: standalone)')`)
9. Testes manuais: visualizar dashboard em Chrome DevTools com emulação de iPhone 12, iPad Pro, Desktop 1920×1080
10. Performance: Lighthouse score >90 em mobile

---

**Fim do Epic 5**

Este epic entrega valor gerencial imediato - dashboards são a interface principal do sistema. Pareto é a ferramenta crítica para metodologia "ver e agir".

---

## Epic 6: Visualizações Complementares & Export

**Objetivo Expandido:** Completar os 8 gráficos obrigatórios adicionando 4 visualizações restantes: Gráfico de Rosca (Paradas Planejadas vs Não Planejadas), Resumo de Horas Totais (barras empilhadas mostrando uso do tempo), Histórico de Tendências (evolução semanal), e MTBF/MTTR (indicadores de manutenção). Implementar funcionalidades de export para Excel e PDF permitindo relatórios executivos. Dashboard completo atende 100% dos requisitos da documentação técnica (docs/project/09).

### Story 6.1: Implementar Gráfico de Rosca (Planejadas vs Não Planejadas)

**Como** gerente de PCP,
**Eu quero** visualizar proporção de paradas planejadas vs não planejadas,
**Para que** eu avalie nível de controle e previsibilidade da operação.

#### Acceptance Criteria

1. Componente `<PlannedVsUnplannedDonutChart>` usando Recharts (PieChart com innerRadius)
2. Query Supabase:
   ```sql
   SELECT
     CASE
       WHEN bp.classe = 'Parada Estratégica' OR bp.classe = 'Parada Planejada' THEN 'Planejadas'
       ELSE 'Não Planejadas'
     END as tipo,
     SUM(a.duracao_minutos) / 60 as horas_totais
   FROM apontamentos a
   JOIN books_paradas bp ON a.codigo_parada = bp.codigo
   WHERE a.linha_id = ? AND a.timestamp_ocorrencia BETWEEN ? AND ?
   GROUP BY tipo
   ```
3. Rosca (donut): innerRadius 60%, outerRadius 80%
4. Cores: Planejadas (azul #3B82F6), Não Planejadas (vermelho #EF4444)
5. Label centralizado no donut: percentual maior (ex: "65% Planejadas")
6. Tooltip: "Tipo: {Planejadas|Não Planejadas} | Horas: XX.Xh (YY% do total)"
7. Legend: abaixo do gráfico com checkboxes interativos
8. Insight text: abaixo da legend - "✓ Operação estável" se Planejadas > 60%, "⚠ Alta imprevisibilidade" se Não Planejadas > 60%
9. Animação: fade-in suave ao carregar
10. Responsivo: tamanho 300px (mobile), 400px (desktop)

---

### Story 6.2: Implementar Resumo de Horas Totais (Barras Empilhadas)

**Como** gestor,
**Eu quero** visualizar como tempo calendário foi utilizado em cada categoria,
**Para que** eu identifique onde há maior desperdício de capacidade.

#### Acceptance Criteria

1. Componente `<TimeSummaryStackedBarChart>` usando Recharts (BarChart stacked)
2. Query Supabase: calcular por linha/período:
   - Tempo Calendário (base 24h por dia)
   - Horas Valiosas (produção efetiva)
   - Paradas Estratégicas
   - Paradas por Indisponibilidade
   - Perdas por Performance
   - Perdas por Qualidade
3. Barra horizontal empilhada 100% (full-width do container)
4. Cores conforme metodologia:
   - Horas Valiosas: verde #22C55E
   - Paradas Estratégicas: azul #3B82F6
   - Paradas Indisponibilidade: vermelho #EF4444
   - Perdas Performance: laranja #F59E0B
   - Perdas Qualidade: amarelo #EAB308
5. Eixo Y: Linha (se múltiplas) ou único bar se linha única
6. Eixo X: Percentual (0-100%)
7. Tooltip: "Categoria: {nome} | Horas: XX.Xh (YY% do tempo calendário)"
8. Legend: ordenada por impacto (maior para menor)
9. Valores absolutos exibidos dentro das barras (se espaço suficiente)
10. Botão toggle: alternar entre view % e view horas absolutas

---

### Story 6.3: Implementar Histórico de Tendências (Últimas 10 Semanas)

**Como** gestor,
**Eu quero** visualizar evolução de OEE e paradas nas últimas 10-12 semanas,
**Para que** eu identifique tendências positivas/negativas e impacto de ações de melhoria.

#### Acceptance Criteria

1. Componente `<TrendHistoryChart>` usando Recharts (LineChart multi-series)
2. Query Supabase: `SELECT * FROM oee_agregado WHERE linha_id = ? AND periodo_tipo = 'semana' ORDER BY periodo_inicio DESC LIMIT 12`
3. Eixo X: Semana (formato "Sem XX/YYYY")
4. Eixo Y: Percentual (0-100%) ou Horas (dependendo do toggle)
5. Linhas disponíveis (usuário seleciona quais exibir via checkboxes):
   - OEE % (linha azul grossa)
   - Disponibilidade % (verde)
   - Performance % (laranja)
   - Qualidade % (amarelo)
   - Horas de Paradas Não Planejadas (vermelho, eixo Y secundário)
6. Linha de meta: horizontal tracejada (ex: 75% OEE)
7. Tooltip: ao hover em ponto → tooltip consolidado mostrando todos os valores daquela semana
8. Área preenchida sob linha OEE (área azul transparente)
9. Marcadores de eventos: annotations em semanas específicas (ex: "Manutenção preventiva realizada")
10. Botão "Ver Mais": expandir para últimas 24 semanas (modal full-screen)

---

### Story 6.4: Implementar Gráficos de MTBF e MTTR

**Como** gestor de manutenção,
**Eu quero** visualizar MTBF e MTTR ao longo do tempo,
**Para que** eu monitore confiabilidade dos equipamentos e efetividade da manutenção.

#### Acceptance Criteria

1. Componente `<MTBFMTTRChart>` usando Recharts (LineChart com 2 séries)
2. Query Supabase: `SELECT * FROM indicadores_secundarios_agregado WHERE linha_id = ? ORDER BY periodo_inicio DESC LIMIT 12`
3. Eixo X: Semana ou Mês
4. Eixo Y esquerdo: MTBF (horas)
5. Eixo Y direito: MTTR (horas)
6. Linha MTBF: azul, eixo esquerdo (valores geralmente maiores, ex: 50-200h)
7. Linha MTTR: vermelho, eixo direito (valores menores, ex: 1-10h)
8. Tooltip: "Semana: XX | MTBF: YYh (tempo médio entre falhas) | MTTR: ZZh (tempo médio de reparo)"
9. Insight box: abaixo do gráfico
   - "✓ MTBF crescente: equipamento mais confiável"
   - "⚠ MTTR aumentando: manutenção demorada"
10. Benchmark lines: linhas tracejadas mostrando médias históricas ou targets
11. Drill-down: click em ponto → modal listando falhas específicas daquela semana

---

### Story 6.5: Implementar Export de Dashboard para PDF

**Como** gestor,
**Eu quero** exportar dashboard completo para PDF,
**Para que** eu compartilhe relatórios executivos em reuniões e auditorias.

#### Acceptance Criteria

1. Botão "Exportar Dashboard" no header (ícone PDF)
2. Biblioteca `html2canvas` + `jspdf` instaladas
3. Click no botão:
   - Captura screenshot do dashboard completo (todos os gráficos visíveis)
   - Converte para canvas via `html2canvas(dashboardElement, { scale: 2 })`
   - Gera PDF via `jsPDF` com orientação landscape (A4)
   - Adiciona header no PDF: Logo SicFar + título "Relatório OEE - {Setor/Linha} - {Período}"
   - Adiciona footer: data de geração, usuário que gerou, versão do sistema
4. Filename: `OEE_Report_{setor}_{linha}_{data}.pdf`
5. Download automático após geração (browser download)
6. Loading state: modal "Gerando PDF..." com spinner (processo pode levar 5-10s)
7. Qualidade alta: scale 2x para imagens nítidas (não pixeladas)
8. Filtros aplicados exibidos no header do PDF (para contexto)
9. Tratamento de múltiplas páginas: se dashboard é muito longo, quebrar em páginas automaticamente
10. Fallback: se html2canvas falhar em algum navegador, exibir toast "Funcionalidade não suportada neste navegador. Use Chrome ou Edge."

---

### Story 6.6: Implementar Export de Tabela para Excel

**Como** analista,
**Eu quero** exportar tabela consolidada para Excel,
**Para que** eu faça análises adicionais e cruze com outros dados em planilhas.

#### Acceptance Criteria

1. Botão "Exportar para Excel" acima da Tabela Consolidada (ícone Excel verde)
2. Biblioteca `xlsx` instalada
3. Click no botão:
   - Captura dados da tabela atualmente filtrados/ordenados (não todos os dados, apenas visíveis)
   - Gera workbook XLSX via `XLSX.utils.json_to_sheet(data)`
   - Worksheet name: "OEE_{setor}_{periodo}"
   - Colunas: Linha, Setor, Período, Disponibilidade %, Performance %, Qualidade %, OEE %
   - Formatação: headers em bold, percentuais com 1 casa decimal, colunas auto-width
4. Metadata sheet adicional: "Filtros Aplicados" listando filtros de setor/linha/período
5. Filename: `OEE_Data_{setor}_{linha}_{data}.xlsx`
6. Download automático
7. Limite: se > 10.000 registros, alertar usuário "Muitos dados - aplicar filtros antes de exportar"
8. Loading state: botão com spinner durante geração
9. Toast sucesso: "Arquivo Excel gerado com sucesso - X linhas exportadas"

---

### Story 6.7: Adicionar Export de Gráfico Individual para PNG

**Como** usuário,
**Eu quero** exportar gráficos individuais como imagem PNG,
**Para que** eu insira em apresentações PowerPoint ou relatórios Word.

#### Acceptance Criteria

1. Botão de export (ícone camera/download) no canto superior direito de cada gráfico (hover para aparecer)
2. ECharts: usar método nativo `echartsInstance.getDataURL({ type: 'png', pixelRatio: 2 })`
3. Recharts: usar `html2canvas` para capturar componente do gráfico
4. Click no botão:
   - Captura gráfico em alta resolução (2x scale)
   - Gera PNG com fundo branco (não transparente)
   - Download com filename: `{tipo_grafico}_{linha}_{data}.png`
5. Incluir título e legenda na captura (não apenas o gráfico puro)
6. Loading state: botão com spinner por 1-2s durante geração
7. Qualidade: 1200×800px mínimo para uso em apresentações
8. Toast: "Imagem salva com sucesso"

---

**Fim do Epic 6**

Este epic completa os 8 gráficos obrigatórios e adiciona funcionalidades de export essenciais para relatórios executivos e reuniões gerenciais.

---

## Epic 7: Configurações & Gerenciamento de Dados Mestres

**Objetivo Expandido:** Criar interface de administração permitindo cadastro e edição de dados mestres críticos: Velocidades Nominais por SKU (base para cálculo de Performance), Metas de OEE por linha (visualização em gráficos), Books de Paradas (seed data no MVP, CRUD completo pós-MVP aguardando Atividade 06), e gerenciamento de usuários com roles/permissões. Engenharia e Admin têm autonomia para parametrizar sistema sem depender de desenvolvedores.

### Story 7.1: Criar Tela de Gerenciamento de Velocidades Nominais

**Como** engenheiro de processos,
**Eu quero** cadastrar e atualizar velocidades nominais por SKU em cada linha,
**Para que** cálculos de Performance reflitam capacidade real de cada produto.

#### Acceptance Criteria

1. Rota `/admin/velocidades-nominais` (protegida, role: admin, engenharia)
2. Tabela listando: Linha, SKU (código + descrição), Velocidade Nominal (Und/h), Última Atualização, Ações (Editar, Desativar)
3. Botão "Nova Velocidade Nominal" → abre modal:
   - Select "Linha" (obrigatório)
   - Input "SKU Código" (obrigatório, ex: "SKU-001")
   - Input "SKU Descrição" (obrigatório, ex: "Soro Fisiológico 500ml")
   - Input "Velocidade Nominal" (numérico obrigatório, Und/h, ex: 10000)
   - Botão "Salvar"
4. INSERT em tabela `velocidades_nominais`: linha_id, sku_codigo, sku_descricao, velocidade_nominal_undh, created_by, created_at
5. Editar velocidade: abre modal similar, campos pré-preenchidos, UPDATE em vez de INSERT
6. Audit trail: trigger registra alterações (campo velocidade_nominal old → new)
7. Assinatura eletrônica: **SIM** - mudanças em velocidades nominais requerem assinatura de gestor (impactam cálculos retroativos)
8. Validação: velocidade nominal > 0, SKU único por linha
9. Filtros: buscar por linha ou SKU (debounced input)
10. Histórico: botão "Ver Histórico" → modal listando alterações anteriores via `audit_log`

---

### Story 7.2: Criar Tela de Gerenciamento de Metas de OEE

**Como** gestor,
**Eu quero** definir metas de OEE específicas por linha,
**Para que** velocímetros e gráficos mostrem zonas vermelha/amarela/verde corretas.

#### Acceptance Criteria

1. Rota `/admin/metas-oee` (protegida, role: admin, gestor)
2. Tabela listando: Linha, Setor, Meta OEE Atual (%), Última Atualização, Ações (Editar)
3. Editar meta: abre modal
   - Linha (readonly, já selecionada)
   - Input "Nova Meta OEE (%)" (numérico 0-100, obrigatório)
   - Input "Justificativa" (textarea obrigatório - por que meta mudou?)
   - Botão "Salvar"
4. UPDATE em `linhas SET meta_oee = ?, meta_oee_justificativa = ?, meta_oee_updated_at = now() WHERE id = ?`
5. Audit trail: registra alteração old meta → new meta + justificativa
6. Validação: meta entre 50% e 100% (alertar se < 50% "Meta muito baixa, confirmar?")
7. Impacto imediato: após salvar, velocímetros e gráficos atualizam zonas de cor
8. Histórico de metas: botão "Ver Histórico" → modal timeline mostrando mudanças ao longo do tempo

---

### Story 7.3: Criar Tela de Gerenciamento de Usuários

**Como** admin,
**Eu quero** criar usuários com roles e setores associados,
**Para que** controle de acesso via RLS funcione corretamente.

#### Acceptance Criteria

1. Rota `/admin/usuarios` (protegida, role: admin)
2. Tabela listando: Nome, Email, Role, Setor (se operador/supervisor), Status (Ativo/Inativo), Ações (Editar, Desativar)
3. Botão "Novo Usuário" → abre modal:
   - Input "Nome Completo" (obrigatório)
   - Input "Email" (obrigatório, validação formato email)
   - Select "Role" (operador, supervisor, gestor, admin - obrigatório)
   - Select "Setor" (condicional - obrigatório se role = operador ou supervisor, disabled se gestor/admin)
   - Input "Senha Temporária" (obrigatório, min 8 caracteres)
   - Checkbox "Forçar troca de senha no primeiro login"
   - Botão "Criar Usuário"
4. Fluxo: INSERT em `auth.users` via Supabase Admin API → INSERT em `user_roles` (user_id, role, setor_id)
5. Email automático: enviar credenciais para usuário (via Supabase Auth ou Edge Function)
6. Editar usuário: alterar role/setor/status (não email - Supabase não permite)
7. Desativar usuário: soft-delete (status = 'inativo'), não DELETE físico
8. Reset de senha: botão "Resetar Senha" → envia link de recuperação via email
9. Filtros: buscar por nome/email, filtrar por role ou setor
10. Bulk actions: selecionar múltiplos usuários → desativar em batch

---

### Story 7.4: Criar Seed Data de Books de Paradas (MVP)

**Como** desenvolvedor,
**Eu quero** carregar Books de Paradas via seed.sql,
**Para que** operadores tenham códigos disponíveis no MVP sem aguardar Atividade 06.

#### Acceptance Criteria

1. Arquivo `supabase/seed-books.sql` criado
2. Estrutura hierárquica: Classe → Grande Parada → Apontamento → Grupo → Detalhamento
3. Seed data para **10 linhas SPEP** (~50 códigos por linha = ~500 registros):
   - Linha A SPEP: códigos P1.1 a P1.50 (exemplo: P1.1 = Manutenção Planejada, P1.2 = Sem Programação PMP, etc.)
   - Linha B SPEP: mesmo padrão com variações
   - ...Linha SLE
4. INSERTs em tabela `books_paradas`: `(linha_id, codigo, classe, grande_parada, apontamento, grupo, detalhamento, is_ativo)`
5. Códigos comuns em todas as linhas: P1.1 (Manutenção Planejada), P2.1 (Quebra/Falha), P3.1 (Falta de Material)
6. Códigos específicos por linha: baseado em características (ex: Linha A tem código "P5.1 - Troca de Filtro Específico")
7. Script executável: `supabase db reset` → limpa dados + aplica migrations + executa seed
8. Validação: query `SELECT COUNT(*) FROM books_paradas GROUP BY linha_id` → deve retornar ~50 por linha
9. Documentação: README.md com instrução "Para popular Books de Paradas: `supabase db reset`"
10. **Nota:** CRUD interface de Books fica pós-MVP (aguardando Atividade 06 documentar hierarquia completa)

---

### Story 7.5: Adicionar Tela de Configurações do Sistema

**Como** admin,
**Eu quero** configurar parâmetros globais do sistema,
**Para que** comportamentos sejam customizáveis sem alterar código.

#### Acceptance Criteria

1. Rota `/admin/configuracoes` (protegida, role: admin)
2. Seções de configuração:
   - **Sessões:** Timeout de sessão (minutos), Intervalo de keep-alive (minutos)
   - **Offline:** Tamanho máximo buffer IndexedDB (registros), Intervalo de tentativa de sync (segundos)
   - **Dashboards:** Stale time de cache React Query (minutos), Itens por página padrão em tabelas
   - **Notificações:** Habilitar/desabilitar toasts, Duração de toasts (segundos)
   - **Validação:** Tolerância de cálculo OEE para validação (%), Duração mínima de pequenas paradas (minutos)
3. Tabela `system_config`: key (text PK), value (jsonb), description (text), updated_by, updated_at
4. Formulário: cada config tem input apropriado (numérico, toggle, etc.)
5. Botão "Salvar Configurações" → UPSERTs em `system_config`
6. Validações: timeouts > 0, buffer size entre 1.000-10.000, etc.
7. Impacto imediato: frontend lê configs via query ao inicializar
8. Valores padrão: se key não existe, usar defaults hardcoded
9. Audit trail: registra alterações de configurações

---

### Story 7.6: Implementar Profile & Preferências do Usuário

**Como** usuário,
**Eu quero** personalizar preferências da minha conta,
**Para que** sistema se adapte ao meu workflow.

#### Acceptance Criteria

1. Botão "Meu Perfil" no user menu (header, canto superior direito)
2. Modal ou página `/perfil` com abas:
   - **Dados Pessoais:** Nome, Email (readonly), Foto (upload avatar)
   - **Senha:** Trocar senha (senha atual + nova senha + confirmar)
   - **Preferências:** Setor padrão (pré-seleciona nos filtros), Linha padrão, Período padrão, Idioma (apenas PT-BR no MVP)
   - **Notificações:** Habilitar/desabilitar toasts, Notificar apontamentos rejeitados
3. Tabela `user_preferences`: user_id (PK FK), setor_padrao_id, linha_padrao_id, periodo_padrao, preferences (jsonb)
4. Salvar: UPSERT em `user_preferences`
5. Avatar: upload para Supabase Storage bucket `avatars/{user_id}.jpg`, resize automático para 200×200px
6. Trocar senha: validar senha atual via `supabase.auth.updateUser({ password: novaSenha })`
7. Logout button: "Sair da Conta" → `supabase.auth.signOut()` → redirect `/login`

---

**Fim do Epic 7**

Este epic dá autonomia para equipe operacional (engenharia, gestão) parametrizar sistema sem depender de desenvolvedores. CRUD de Books fica pós-MVP aguardando doc da Atividade 06.

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

## Summary

Este PRD define o **Sistema OEE para SicFar** - uma solução web pharma-native para monitoramento de eficiência operacional em ambiente regulado BPF. O sistema integra dados de sensores KEYENCE, apontamentos contemporâneos de operadores e cálculos validados de OEE (Disponibilidade × Performance × Qualidade) para entregar dashboards interativos que permitem gestão "ver e agir" em 37 linhas de produção farmacêutica.

### Destaques Técnicos

- **Stack:** React 19 + Supabase + Vite + Tailwind CSS v4 + Shadcn (frontend), Node.js 20 worker (gateway IoT), PostgreSQL 15 (banco)
- **Compliance:** ALCOA+ e CFR 21 Part 11 compliant - assinatura eletrônica, audit trail, RLS
- **Offline-First:** IndexedDB + Service Worker garantem contemporaneidade mesmo com internet instável
- **Dashboards:** 8 gráficos obrigatórios (Pareto, Velocímetro OEE, Componentes, Tabelas, Rosca, MTBF/MTTR, Tendências, Resumo de Horas)
- **Performance:** P95 < 2s (dashboards), bundle < 500KB, suporta 100 usuários simultâneos, sessões 8h+

### Entregas do MVP

**8 Epics | 56 User Stories** cobrindo:
1. Infraestrutura (monorepo Turborepo, CI/CD, Supabase + Vercel)
2. Compliance regulatório (validável por Consultor Rafael Gusmão)
3. Operação core (apontamentos contemporâneos + integração IoT)
4. Cálculos de OEE (validados por Gerente de Processos Sávio Rafael)
5. Dashboards interativos (4 gráficos top)
6. Visualizações complementares (4 gráficos restantes + exports)
7. Administração (velocidades nominais, metas, users, books seed data)
8. Validação final (stress tests, usabilidade, docs, demo)

### Critérios de Sucesso

- ✅ **30 Functional Requirements** (FR1-FR30) implementados
- ✅ **15 Non-Functional Requirements** (NFR1-NFR15) validados
- ✅ Consultor Rafael aprova compliance (Semana 2)
- ✅ Sávio Rafael aprova cálculos OEE ±2% tolerância (Semana 3)
- ✅ Testes de stress: 100 usuários simultâneos + sessões 8h+ (Semana 4-5)
- ✅ NPS operadores > 7/10 em testes de usabilidade (Semana 5)
- ✅ Demo final aprovada por stakeholders (Semana 6)
- ✅ Go-live Janeiro/2026 em 10 linhas SPEP

---

## Next Steps

### Pós-MVP (Fev-Ago/2026)

**Fase 1: Escalonamento (Fev-Mar/2026)**
- Rollout completo: 37 linhas (SPEP 20 + SPPV 10 + Líquidos 5 + CPHD 2)
- Integração TOTVS (velocidades nominais automáticas via API)
- CRUD de Books de Paradas (após conclusão Atividade 06)
- Notificações push (alertas de OEE abaixo da meta)
- App React Native (iOS + Android para supervisores)

**Fase 2: Validação GMP (Abr-Ago/2026)**
- QI (Installation Qualification): documentar infraestrutura
- OQ (Operational Qualification): testar FR1-FR30 formalmente
- PQ (Performance Qualification): validar NFR1-NFR15 em produção
- Aprovação Consultor Rafael Gusmão + equipe Qualidade SicFar
- Certificação sistema como validado para uso regulado

**Fase 3: Features Avançadas (Pós-Validação)**
- Análises preditivas (Machine Learning para prever paradas)
- Benchmarking automático (comparar linhas similares)
- Integração Diário de Bordo Digital (migrar backup manual para sistema)
- API pública (permitir integrações terceiros)
- Multi-tenancy (expandir para outras plantas Farmace)

### Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Supabase não aprovado por consultor CFR 21 Part 11 | Média | Alto | Spike técnico Semana 1, validação Semana 2. Plano B: migrar para PostgreSQL self-hosted (+4-6 semanas) |
| Cálculos OEE divergem > 2% das planilhas | Baixa | Alto | Unit tests automatizados contra planilhas de Sávio. Validação presencial Semana 3 |
| PWA não adotado por operadores (preferem app nativo) | Média | Médio | Testes de usabilidade Semana 5. Plano B: desenvolver React Native pós-MVP (+8-12 semanas) |
| Gateway SICFAR não aguenta 10 linhas simultâneas | Baixa | Médio | Teste de stress Semana 4. Plano B: múltiplos workers ou upgrade servidor |
| Books de Paradas (Atividade 06) não disponível pré-MVP | Alta | Baixo | Usar seed data genérico. CRUD completo fica pós-MVP |
| Timeline 6 semanas muito apertada | Média | Médio | Priorização rigorosa P0 vs P1. Backlog pós-MVP para features "nice to have" |

### Stakeholder Sign-Off

Este PRD requer aprovação formal dos seguintes stakeholders antes de iniciar desenvolvimento:

| Stakeholder | Role | Responsabilidade | Aprovação |
|-------------|------|------------------|-----------|
| Maxwell Cruz Cortez | Gerente Industrial | Sponsor executivo, aprovação de escopo | ☐ Pendente |
| Sávio Correia Rafael | Gerente de Processos | Validação de cálculos OEE e metodologia | ☐ Pendente |
| Cícero Emanuel da Silva | Líder de TI | Aprovação técnica, infraestrutura, recursos | ☐ Pendente |
| Consultor Rafael Gusmão | Consultor GMP | Validação compliance ALCOA+/CFR 21 Part 11 | ☐ Pendente |

**Deadline para aprovações:** 25/Out/2025 (1 semana após apresentação do PRD)

---

## Appendices

### Appendix A: Glossário de Termos Técnicos

- **ALCOA+:** Princípios de integridade de dados farmacêuticos (Atribuível, Legível, Contemporâneo, Original, Exato, Completo, Consistente, Durável, Disponível)
- **CFR 21 Part 11:** Regulamentação FDA para assinatura eletrônica e registros eletrônicos
- **OEE:** Overall Equipment Effectiveness = Disponibilidade × Performance × Qualidade
- **MTBF:** Mean Time Between Failures (tempo médio entre falhas)
- **MTTR:** Mean Time To Repair (tempo médio para reparo)
- **RLS:** Row Level Security (segurança em nível de linha PostgreSQL)
- **PWA:** Progressive Web App (aplicativo web instalável)
- **View Materializada:** Tabela PostgreSQL com dados pré-calculados (refresh periódico)

### Appendix B: Referências de Documentação

**Especificações do Projeto:**
- `docs/project/05-Metodologia-Calculo.md` - Fórmulas de OEE validadas
- `docs/project/09-Validacao-Tecnica-SicFar.md` - Especificações de gráficos obrigatórios
- `docs/project/04-Glossario-Termos.md` - Glossário completo do domínio
- `docs/brief.md` - Project Brief original
- `docs/brainstorming-session-results.md` - Decisões arquiteturais
- `docs/competitor-analysis.md` - Análise competitiva (Evocon benchmark)

**Regulamentações:**
- ANVISA IN 134/2023 - Boas Práticas de Fabricação (BPF)
- ANVISA RDC 658/2022 - Requisitos de Qualificação e Validação
- FDA CFR 21 Part 11 - Electronic Records and Signatures
- ICH Q10 - Pharmaceutical Quality System

### Appendix C: Estimativas de Esforço

**Total:** ~6 semanas (30 dias úteis) com 2 desenvolvedores full-time

| Epic | Stories | Estimativa | Dependências Críticas |
|------|---------|-----------|----------------------|
| Epic 1: Foundation | 8 | 1 semana | Nenhuma (início imediato) |
| Epic 2: Compliance | 5 | 1 semana | Epic 1 completo, Validação Consultor Semana 2 |
| Epic 3: Apontamentos IoT | 7 | 1 semana | Epic 1-2 completos |
| Epic 4: Cálculo OEE | 7 | 1 semana | Epic 3 completo, Validação Sávio Semana 3 |
| Epic 5: Dashboards Top 4 | 7 | 1 semana | Epic 4 completo |
| Epic 6: Gráficos + Export | 7 | 0.5 semana | Epic 5 completo |
| Epic 7: Admin & Config | 6 | 0.5 semana | Epic 4-5 completos (paralelo com Epic 6) |
| Epic 8: Testes & Validação | 8 | 1 semana | Todos os epics completos |

**Nota:** Estimativas assumem desenvolvedores sênior familiarizados com React/TypeScript/PostgreSQL. Tempo pode variar ±20% dependendo de complexidade de integrações IoT.

### Appendix D: Contatos e Responsabilidades

| Nome | Role | Email | Telefone | Responsabilidade no Projeto |
|------|------|-------|----------|----------------------------|
| Cícero Emanuel da Silva | Líder de TI | cicero@sicfar.com.br | (XX) XXXX-XXXX | Sponsor técnico, infraestrutura, aprovação final |
| Maxwell Cruz Cortez | Gerente Industrial | maxwell@sicfar.com.br | (XX) XXXX-XXXX | Sponsor executivo, orçamento, go/no-go |
| Sávio Correia Rafael | Gerente de Processos | savio@sicfar.com.br | (XX) XXXX-XXXX | Validação de cálculos OEE, metodologia |
| Consultor Rafael Gusmão | Consultor GMP | rafael.gusmao@consultoria.com.br | (XX) XXXX-XXXX | Validação compliance ALCOA+/CFR 21 Part 11 |
| John (PM) | Product Manager | john@bmad.ai | N/A | Criação e manutenção do PRD |

---

## Approval

**Data de criação:** 19/Outubro/2025
**Versão:** 1.0
**Status:** Aguardando aprovação de stakeholders

**Assinaturas:**

___________________________
Maxwell Cruz Cortez
Gerente Industrial - Sponsor Executivo
Data: ___/___/2025

___________________________
Sávio Correia Rafael
Gerente de Processos
Data: ___/___/2025

___________________________
Cícero Emanuel da Silva
Líder de TI
Data: ___/___/2025

___________________________
Consultor Rafael Gusmão
Consultor GMP
Data: ___/___/2025

---

**Fim do Product Requirements Document**

Este documento estabelece a fundação completa para desenvolvimento do Sistema OEE para SicFar. Todas as decisões técnicas, requisitos funcionais e não-funcionais, epics, stories e acceptance criteria estão definidos para guiar a equipe de desenvolvimento do MVP até rollout em Janeiro/2026.

**Próximos passos:** Apresentação do PRD para stakeholders → aprovações → kick-off de desenvolvimento (Semana 1).

---
