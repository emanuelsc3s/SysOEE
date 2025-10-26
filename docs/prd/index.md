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

[Ver detalhes do Epic 1](./epic-1-foundation-infrastructure.md)

---

**Epic 2: Compliance & Data Integrity (ALCOA+/CFR 21 Part 11)**

Implementar assinatura eletrônica com fluxo híbrido (operador + supervisor), audit trail completo via triggers PostgreSQL, e Row Level Security (RLS) para controle de acesso granular. Sistema atende requisitos regulatórios farmacêuticos validáveis por consultor.

[Ver detalhes do Epic 2](./epic-2-compliance-data-integrity.md)

---

**Epic 3: Apontamentos Contemporâneos & Integração IoT**

Habilitar operadores a registrar apontamentos de paradas/perdas/trocas com formulário simples, validação em tempo real e feedback visual. Gateway SICFAR integra sensores KEYENCE atualizando contadores de produção/rejeição no Supabase. Operador e gateway funcionam completamente offline.

[Ver detalhes do Epic 3](./epic-3-apontamentos-integracao-iot.md)

---

**Epic 4: Cálculo de OEE & View Materializada**

Implementar fórmulas de OEE validadas (Disponibilidade, Performance, Qualidade) conforme docs/project/05-Metodologia-Calculo.md. View materializada PostgreSQL agrega resultados por linha/turno/dia/semana/mês com refresh periódico (pg_cron 1h). Cálculos validados por Gerente de Processos (±2% tolerância).

[Ver detalhes do Epic 4](./epic-4-calculo-oee.md)

---

**Epic 5: Dashboards Interativos & Visualizações (Top 4 Gráficos)**

Criar dashboard principal com 4 gráficos essenciais: Velocímetro de OEE (ECharts gauge), Pareto de Paradas (drill-down), Componentes do OEE (barras comparativas 12 períodos), e Tabela Consolidada (TanStack Table). Filtros dinâmicos por setor/linha/período. Gestores conseguem gerar insights em <2 minutos.

[Ver detalhes do Epic 5](./epic-5-dashboards-visualizacoes.md)

---

**Epic 6: Visualizações Complementares & Export**

Adicionar 4 gráficos restantes: Rosca Planejadas/Não Planejadas, Resumo de Horas Totais (barras empilhadas), Histórico de Tendências (10 semanas), MTBF e MTTR. Implementar export para Excel e PDF com filtros aplicados. Dashboard completo com 8 gráficos obrigatórios.

[Ver detalhes do Epic 6](./epic-6-visualizacoes-complementares.md)

---

**Epic 7: Configurações & Gerenciamento de Dados Mestres**

Interface de administração para cadastro/edição de Velocidades Nominais por SKU, Metas de OEE por linha, Books de Paradas (seed data no MVP, CRUD pós-MVP), e gerenciamento de usuários com roles (Operador, Supervisor, Gestor, Admin). Engenharia e Admin têm autonomia para parametrizar sistema.

[Ver detalhes do Epic 7](./epic-7-configuracoes-dados-mestres.md)

---

**Epic 8: Testes de Stress, Refinamento & Validação Final**

Executar testes de stress (100 usuários simultâneos, sessões 8h+, offline/online), ajustar performance baseado em métricas reais, refinar UX com feedback de operadores/gestores, preparar documentação técnica e roteiro de demo. Protótipo MVP validado e pronto para apresentação final.

[Ver detalhes do Epic 8](./epic-8-testes-validacao.md)

---
