# Brainstorming Session Results

**Session Date:** 2025-11-18
**Facilitator:** Business Analyst Mary 📊
**Participant:** Emanuel (Líder de TI - SicFar)

---

## Executive Summary

### Session Topic
**Tecnologias e Stack Técnico - Sistema OEE para SicFar**

### Session Goals
Explorar e definir decisões técnicas e arquiteturais para implementação do Sistema OEE, considerando:
- Stack tecnológica previamente definida (React 19, Vite 7, Tailwind v4, TypeScript, Shadcn, Supabase)
- Requisitos regulatórios rigorosos (IN 134 ANVISA, RDC 658 ANVISA, CFR 21 Part 11)
- Timeline apertado: Protótipo SPEP na primeira semana de Dezembro/2025 (~6 semanas)
- Escopo: 37 linhas de produção (MVP: 10 linhas SPEP)

### Techniques Used
1. **Question Storming** - Geração de perguntas provocativas
2. **SCAMPER Method** - Exploração de compliance e auditoria
3. **Morphological Analysis** - Dimensões de cálculo OEE e opções de bibliotecas
4. **Analogical Thinking** - Adaptação de sistemas bancários e médicos
5. **First Principles Thinking** - Redesign da integração IoT
6. **Five Whys** - Análise raiz de sessões longas

### Total Ideas Generated
**~50 decisões técnicas e arquiteturais** organizadas em 6 áreas principais

### Key Themes Identified
- **Compliance-First**: Assinatura eletrônica e auditoria são fundação do sistema
- **Simplicidade Pragmática**: Começar simples (view materializada) vs over-engineering prematuro
- **Zero Data Loss**: Offline-first e buffer local são críticos para contemporaneidade (ALCOA+)
- **Performance por Design**: Agregação inteligente reduz carga em 35.000x
- **Interatividade Avançada**: Dashboards não são apenas visualização, são ferramenta de gestão

---

## Technique Sessions

### Technique: Question Storming - 15 minutos

**Description:** Geração de perguntas provocativas sobre implementação técnica ao invés de buscar respostas imediatas.

#### Ideas Generated:

1. Como garantir que o Supabase atenda aos princípios ALCOA+ (rastreabilidade, imutabilidade de registros)?
2. Shadcn + Lucide são suficientes para construir os 8 gráficos obrigatórios complexos (Pareto, Velocímetro, Rosca)?
3. Como implementar assinatura eletrônica conforme CFR 21 Part 11 no Supabase?
4. Como implementar auditoria no Supabase para tabelas críticas salvando quem incluiu, alterou ou excluiu um registro? E como salvar o campo alterado, o valor antes e depois da alteração?
5. Como calcular o OEE geral? Por Linha? Por Departamento? Pensando no alto volume de dados ao longo do tempo.
6. Como efetuar todos os cálculos OEE conforme documentado em docs/project/05-Metodologia-Calculo.md?
7. Como implementar os indicadores secundários documentados em docs/project/08-Indicadores-Secundarios.md?
8. Como garantir responsividade para a aplicação? Mobile-first?
9. Como ficar coletando dados de sensores KEYENCE que salvam em txt via FTP? Esses dados apontam se equipamento está funcionando e quanto produziu/rejeitou.
10. Como garantir performance para mais de 500 usuários?
11. Como implementar um App para Android e iOS futuramente? Usar Flutter, React Native, Kotlin, Swift ou Expo.Dev?
12. Como garantir conexão para sessões longas (8h+)?
13. Como garantir velocidade na aplicação?

#### Insights Discovered:
- **Escalabilidade real vs estimativa inicial**: 500 usuários mencionados (vs 100 no doc original)
- **IoT não mapeado**: Sensores KEYENCE via FTP não estavam no escopo original
- **Supabase sob pressão regulatória**: CFR 21 Part 11 + auditoria complexa são desafios únicos
- **Mobile como evolução natural**: Apontamentos móveis fazem sentido para operadores

#### Notable Connections:
- Questões 4, 5, 6, 7 formam cluster de "Performance & Cálculos"
- Questões 3, 4 formam cluster de "Compliance & Auditoria"
- Questões 9, 10, 12, 13 formam cluster de "Escalabilidade & IoT"

---

### Technique: SCAMPER Method - Compliance & Auditoria - 30 minutos

**Description:** Exploração sistemática de soluções para auditoria ALCOA+ e assinatura eletrônica CFR 21 Part 11.

#### Ideas Generated:

**S - Substitute (Substituir):**
1. Substituir updates diretos por sistema de eventos imutáveis (Event Sourcing)

**C - Combine (Combinar):**
2. Combinar Row Level Security (RLS) do Supabase + triggers PostgreSQL para auditoria automática
3. Combinar assinatura do operador + supervisor (dupla assinatura)

**A - Adapt (Adaptar):**
4. Adaptar triggers do Firebird para PostgreSQL
5. Adaptar conceito de versionamento de registros (nunca UPDATE/DELETE, sempre INSERT novo)
6. Adaptar logs de transação do PostgreSQL para auditoria

**M - Modify (Modificar):**
7. Tabelas de auditoria separadas (1 audit table por tabela crítica)
8. Adicionar tabela "shadow" para cada tabela crítica
9. Separar banco "operacional" vs banco "auditoria"

**P - Put to other uses (Outros usos):**
10. Usar técnicas de sistemas bancários (transações financeiras) para auditoria farmacêutica
11. Usar técnicas de prontuários eletrônicos (PEP) para assinatura eletrônica
12. Usar conceito de blockchain (imutabilidade) sem blockchain real

**E - Eliminate (Eliminar):**
13. Eliminar updates diretos → usar apenas inserts (append-only tables)
14. Eliminar deletes físicos → usar apenas soft-delete
15. Eliminar auditoria de tabelas de sensores (dados automáticos não manipuláveis)

**R - Reverse/Reorganizar:**
16. Auditoria nativa em vez de adicional (trigger ao inserir já grava auditoria)
17. Toda mudança nasce como registro de auditoria (event sourcing leve)

#### Insights Discovered:
- **Tabelas de sensores NÃO precisam auditoria**: Decisão importante que simplifica muito
- **Híbrido de estratégias**: Triggers para campos críticos + versionamento para configurações
- **Status simplificado**: `draft` → `aguardando_assinatura` → `assinado` (sem status intermediários)

#### Notable Connections:
- Event Sourcing (ideia 1) + Append-only (ideia 13) são complementares
- Versionamento (ideia 5) resolve auditoria E histórico simultaneamente

---

### Technique: Analogical Thinking - Assinatura Eletrônica - 25 minutos

**Description:** Adaptar soluções de sistemas de Prontuário Eletrônico e Sistemas Bancários para assinatura eletrônica farmacêutica.

#### Ideas Generated:

**Analogia 1: Prontuário Eletrônico (PEP)**
1. Fluxo: Médico registra → Clica "Assinar" → Re-autenticação com senha → Hash SHA-256 → Status locked
2. Tabela `assinaturas` separada com hash do documento
3. Status de registro: `draft` → `signed` → `approved`

**Analogia 2: Sistema Bancário (Aprovação de Transações)**
4. Aprovação dupla (4 olhos): Supervisor 1 + Supervisor 2
5. Cada assinatura grava: timestamp + IP + device
6. Workflow de aprovação com múltiplas etapas

**Adaptações para OEE:**
7. **Ações que requerem assinatura**: Apontamentos de produção, parada, perdas, abertura/troca de turno, alteração de velocidades nominais, tipos de paradas, planejamento de produção
8. **Modelo de assinatura**: Operador + Supervisor (dupla assinatura híbrida)
9. **Exceção controlada**: Admin/Gerente pode alterar registro assinado, MAS gera nova assinatura
10. **Granularidade**: Operador registra contemporaneamente (sem assinatura formal), Supervisor assina ao final do turno em batch
11. **Interface de assinatura**: Supervisor vê resumo do turno + checkbox para selecionar registros + botão "Assinar Selecionados"
12. **Re-autenticação**: PIN/Senha UMA vez para assinar batch completo
13. **Motivo de rejeição**: Se supervisor desmarca registro, deve informar motivo (volta para operador corrigir)

#### Insights Discovered:
- **Fluxo híbrido é ideal**: Balance entre contemporaneidade (BPF) e validação (qualidade)
- **Seleção granular**: Supervisor precisa controle individual (não assinar tudo automaticamente)
- **Assinatura ELETRÔNICA ≠ Assinatura DIGITAL**: Não precisa certificado digital ICP-Brasil!

#### Notable Connections:
- Contemporaneidade (ALCOA+) + Validação do Supervisor = requisitos complementares resolvidos pelo fluxo híbrido
- Re-autenticação única para batch = balance de segurança (CFR 21) + usabilidade (chão de fábrica)

---

### Technique: First Principles Thinking - Integração IoT - 35 minutos

**Description:** Quebrar problema de integração KEYENCE nos fundamentos e redesenhar solução do zero.

#### Ideas Generated:

**Problema Original:**
- Sensores KEYENCE: 4 registros/segundo
- Arquivo TXT com append contínuo via FTP
- Volume: 3.456.000 registros/dia (10 linhas SPEP)
- Desafio: Como processar e armazenar?

**Abordagem Analítica (Descartada):**
1. Worker fazendo tail do arquivo TXT
2. Parse de cada linha
3. Batch INSERT de 200-500 registros no Supabase
4. Tabela `sensor_readings` particionada por mês
5. View materializada agregada por minuto

**Insights Fundamentais:**
- Pergunta: "Por que precisamos de cada registro individual?"
- Resposta: "Na verdade, não precisamos! Precisamos do total acumulado por ordem de produção!"

**Abordagem Agregada (Aprovada) - MUDANÇA DE PARADIGMA:**
6. SICFAR local acumula contadores em memória por Ordem de Produção
7. UPDATE Supabase a cada 5 segundos (não INSERT!)
8. Tabela `ordens_producao_ativas` com colunas: `producao_acumulada`, `rejeicao_acumulada`
9. Apenas ~100 registros/dia (1 por ordem) vs 3.500.000
10. **Redução: 35.000x menos dados!**

**Benefícios:**
11. Simplicidade: Gateway muito mais simples
12. Performance: 12 UPDATEs/min vs 2.400 INSERTs/min
13. Alinhamento com negócio: "Ordem de Produção" é conceito farmacêutico natural
14. Custo: Supabase Pro suficiente (sem necessidade de camadas adicionais)
15. Dashboard tempo real: Supabase Realtime funciona perfeitamente com UPDATEs

#### Insights Discovered:
- **Pensar no contexto do domínio** (farmacêutico) em vez de copiar padrão genérico de IoT
- Operador abre turno informando ordem → sistema já sabe qual registro atualizar
- Dados brutos de sensores não têm valor analítico individual (só o acumulado importa)

#### Notable Connections:
- Agregação no gateway (edge computing) reduz tráfego de rede drasticamente
- Modelo de dados "stateful" (UPDATE) vs "event stream" (INSERT) é mais adequado

---

### Technique: Morphological Analysis - Visualizações & Performance - 40 minutos

**Description:** Explorar combinações de bibliotecas de gráficos e estratégias de cálculo OEE.

#### Ideas Generated:

**Dimensão A: Bibliotecas de Gráficos**
1. **Recharts**: Popular, API declarativa React, 400KB bundle
2. **Tremor**: Shadcn-style, Tailwind-first, mas SEM velocímetro nativo
3. **Visx (Airbnb)**: Low-level, controle total, curva de aprendizado alta
4. **Chart.js**: Maduro, mas API imperativa (não React-native)
5. **Apache ECharts**: Performance excepcional, TEM velocímetro nativo, 700KB bundle

**Decisão: Stack Híbrida**
6. **Shadcn** para componentes base e filtros
7. **ECharts** para velocímetro, Pareto (complexos)
8. **Recharts** para barras, linhas, rosca (simples e React-friendly)
9. **TanStack Table** para tabelas interativas com ordenação/filtros

**Dimensão B: Interatividade**
10. Filtros dinâmicos: setor, linha, período, data range (Shadcn Select + Popover)
11. Drill-down: Click em barra do Pareto → Modal com detalhes
12. Zoom e pan: ECharts toolbox nativo
13. Export PDF: html2canvas + jsPDF (dashboard completo)
14. Export Excel: XLSX library (tabelas de dados)
15. Export PNG: ECharts saveAsImage

**Dimensão C: Responsividade**
16. Hook customizado `useResponsiveChart()` detecta breakpoints
17. Height adaptativo: mobile (300px), tablet (400px), desktop (500px)
18. Gráficos complexos: scroll horizontal em mobile

**Dimensão D: Cálculo de OEE**
19. **Granularidade temporal**: Turno, Dia, Semana, Mês, Trimestre, Ano
20. **Hierarquia**: Linha, Departamento, Geral
21. **Momento do cálculo**: Tempo Real, Sob Demanda, Pré-calculado
22. **Armazenamento**: Normalizado, Agregado, View Materializada

**Decisão MVP: View Materializada Simples**
23. Começar com view materializada (refresh manual ou 1h)
24. Agregação por linha/turno/dia
25. Refresh via pg_cron
26. Futuro: Tabela agregada + trigger leve para tempo real incremental

**Dimensão E: Performance 500+ Usuários**
27. React Query com cache inteligente (5 min stale time)
28. Lazy loading de gráficos pesados (dynamic imports)
29. Code splitting por rota
30. Supabase Pro connection pooling (15-20 connections)

#### Insights Discovered:
- Nenhuma biblioteca única resolve tudo → híbrido é melhor
- View materializada é suficiente para MVP (não fazer otimização prematura)
- React Query reduz requests em ~80% com cache apropriado

#### Notable Connections:
- Lazy loading + Code splitting = bundle inicial <500KB
- Cache inteligente + View materializada = dashboard rápido mesmo com 500 usuários

---

### Technique: Five Whys - Sessões Longas - 20 minutos

**Description:** Análise raiz do problema de desconexão durante turnos de 8h.

#### Ideas Generated:

**Why #1: Por que sessões web desconectam?**
- Resposta: Tokens JWT expiram (padrão: 1 hora no Supabase)

**Why #2: Por que tokens expiram?**
- Resposta: Segurança - evitar sequestro de sessão

**Why #3: Por que não renovar automaticamente?**
- Resposta: Refresh tokens existem, mas requerem implementação ativa

**Why #4: Por que navegadores fecham conexões?**
- Resposta: Timeout de rede, mudança de rede, sleep mode

**Why #5: Por que isso é crítico para farmacêutica?**
- Resposta: **Contemporaneidade de dados (BPF)** - operador DEVE registrar parada no momento que ocorre

**Soluções Implementadas:**

1. **Keep-Alive Automático**: `autoRefreshToken: true` + refresh manual a cada 50 minutos
2. **Heartbeat**: Query leve a cada 5 minutos para manter conexão ativa
3. **Offline-First**: IndexedDB como buffer local (zero data loss)
4. **Service Worker**: PWA com cache e background sync
5. **Auto-Reconnect**: Tentativas com exponential backoff (3x)
6. **Connection Status UI**: Badge Online/Offline + alertas de pendências
7. **Network Change Detection**: Event listeners para `online`/`offline`
8. **Session Recovery**: Salvar último offset lido para recovery

#### Insights Discovered:
- **Problema não é só técnico, é regulatório**: ALCOA+ exige contemporaneidade
- **Buffer local é seguro crítico**: Se Supabase cair, dados não se perdem
- **UI de status é essencial**: Operador precisa SABER que está offline

#### Notable Connections:
- Offline-first resolve DOIS problemas: internet instável + contemporaneidade
- Service Worker + IndexedDB = PWA completo (bonus: pode instalar como app desktop)

---

## Idea Categorization

### Immediate Opportunities
*Ideas ready to implement now (MVP - Dezembro 2025)*

#### 1. **Escalabilidade & Sessões Longas** (Semana 1-2)
- **Descrição**: Keep-alive automático, offline-first buffer, PWA
- **Por que imediato**: Requisito crítico BPF - se cair durante turno = perda de rastreabilidade
- **Recursos necessários**:
  - 1 dev full-time
  - IndexedDB + Service Worker API (nativo do navegador)
  - Supabase Pro configurado
- **Riscos**:
  - Navegador limpar cache do IndexedDB (mitigação: export periódico)
  - Service Worker não suportado em navegadores antigos (mitigação: progressive enhancement)

#### 2. **Assinatura Eletrônica & Auditoria** (Semana 1-2)
- **Descrição**: Fluxo híbrido de assinatura (operador + supervisor), tabela centralizada, triggers PostgreSQL
- **Por que imediato**: Compliance obrigatório (CFR 21 Part 11) - sem isso, sistema não pode ser validado
- **Recursos necessários**:
  - 1 dev backend full-time
  - Validação com consultor Rafael Gusmão
  - Documentação de validação (QI/QO/QP)
- **Riscos**:
  - Interpretação incorreta de CFR 21 Part 11 (mitigação: validação com consultor)
  - Performance de triggers com alto volume (mitigação: testar com carga)

#### 3. **Visualizações Interativas** (Semana 3-5)
- **Descrição**: 8 gráficos obrigatórios com filtros dinâmicos, drill-down, export
- **Por que imediato**: Protótipo precisa mostrar dados para validação com usuários
- **Recursos necessários**:
  - 1 dev frontend full-time
  - 1 designer para validação UX
  - Bibliotecas: ECharts (~700KB), Recharts (~400KB), TanStack Table
- **Riscos**:
  - Bundle size > 2MB (mitigação: lazy loading, code splitting)
  - Performance com muitos dados (mitigação: virtualização, paginação)

#### 4. **Cálculos OEE - View Materializada** (Semana 2-3)
- **Descrição**: View materializada com refresh periódico, fórmulas conforme doc 05
- **Por que imediato**: Core do sistema - sem cálculo correto, nada funciona
- **Recursos necessários**:
  - 1 dev backend
  - Validação das fórmulas com Sávio Rafael (Gerente de Processos)
  - pg_cron configurado no Supabase
- **Riscos**:
  - Fórmulas incorretas (mitigação: validação com planilhas atuais)
  - Refresh muito lento (mitigação: começar com 1h, otimizar depois)

#### 5. **Integração IoT - KEYENCE** (Semana 4)
- **Descrição**: Gateway local SICFAR → Tail TXT → UPDATE Supabase (agregado)
- **Por que imediato**: Dados de sensor são core do protótipo SPEP
- **Recursos necessários**:
  - 1 dev (pode ser mesmo de backend)
  - Acesso ao servidor Windows Server 2019 on-premise
  - Arquivo TXT de exemplo dos sensores
- **Riscos**:
  - Bloqueio de arquivo (mitigação: tail follow com leitura compartilhada)
  - Rede instável fábrica → Supabase (mitigação: buffer local também no gateway)

---

### Future Innovations
*Ideas requiring development/research (Pós-MVP - Jan-Mar 2026)*

#### 1. **Otimização de Performance Incremental**
- **Descrição**: Tabela `agregados_linha_turno` com trigger leve, particionamento por mês
- **Desenvolvimento necessário**:
  - Refatorar view materializada para tabela física
  - Implementar triggers que apenas somam (não calculam fórmulas)
  - Criar partições mensais automáticas
- **Timeline estimate**: 2-3 semanas
- **Benefício**: Cálculos em tempo real sem sobrecarga

#### 2. **Book de Paradas Completo**
- **Descrição**: Interface de cadastro da hierarquia de 5 níveis, validação por linha
- **Desenvolvimento necessário**:
  - ⚠️ Aguardar Atividade 06 (ainda não documentada)
  - CRUD completo com validações
  - Importação de books existentes
- **Timeline estimate**: 3-4 semanas
- **Benefício**: Autonomia para gestores cadastrarem novos códigos

#### 3. **Integração TOTVS (ERP)**
- **Descrição**: API SICFAR → Supabase (produtos, lotes, perdas de qualidade)
- **Desenvolvimento necessário**:
  - Mapeamento de APIs TOTVS existentes
  - ETL para sincronização de SKUs e velocidades nominais
  - Validação de lotes
- **Timeline estimate**: 4-6 semanas
- **Benefício**: Dados mestres sempre atualizados

#### 4. **Analytics Avançado**
- **Descrição**: Machine Learning para predição de falhas, recomendações automáticas
- **Desenvolvimento necessário**:
  - Coleta de dados históricos (mínimo 6 meses)
  - Modelo de ML treinado (ex: Random Forest para prever paradas)
  - API de inferência
- **Timeline estimate**: 2-3 meses
- **Benefício**: Manutenção preditiva

#### 5. **Expansão para 37 Linhas**
- **Descrição**: Rollout SPPV, Líquidos, CPHD
- **Desenvolvimento necessário**:
  - Configuração de novos setores
  - Treinamentos específicos
  - Ajustes baseados em feedback SPEP
- **Timeline estimate**: 1-2 meses (após MVP)
- **Benefício**: Cobertura completa da fábrica

---

### Moonshots
*Ambitious, transformative concepts*

#### 1. **Mobile Apps Nativos**
- **Descrição**: React Native/Expo para apontamentos mobile
- **Transformative potential**:
  - Operadores fazem apontamentos direto do celular (sem ir ao computador)
  - Notificações push de alertas em tempo real
  - Offline-first nativo (melhor que PWA)
- **Challenges to overcome**:
  - Áreas limpas têm restrições de celulares
  - Aprovação regulatória para uso de apps móveis
  - Investimento em devices (tablets farmacêuticos)
- **Timeline**: 6-12 meses

#### 2. **Integração CLPs Direto (Bypassing SICFAR)**
- **Descrição**: Conectar diretamente em CLPs (Bottelpack, Pró Maquia, Bausch Strobbel)
- **Transformative potential**:
  - Dados em tempo real SEM atraso
  - Eliminação de intermediário (SICFAR)
  - Maior confiabilidade
- **Challenges to overcome**:
  - Protocolos industriais complexos (OPC UA, Modbus)
  - Segurança de rede industrial
  - Expertise em automação necessária
- **Timeline**: 12-18 meses

#### 3. **Digital Twin da Fábrica**
- **Descrição**: Simulação completa das linhas de produção
- **Transformative potential**:
  - Testes de cenários "what-if" antes de implementar mudanças
  - Otimização preditiva de setup e sequenciamento
  - Treinamento de operadores em ambiente virtual
- **Challenges to overcome**:
  - Modelagem complexa de cada linha
  - Integração com dados reais em tempo real
  - Alto custo de desenvolvimento
- **Timeline**: 18-24 meses

#### 4. **Blockchain para Auditoria Imutável**
- **Descrição**: Blockchain privado para registros críticos (além de ALCOA+)
- **Transformative potential**:
  - Imutabilidade absoluta (impossível alterar mesmo com admin)
  - Compliance para auditorias internacionais (FDA, EMA)
  - Smart contracts para validações automáticas
- **Challenges to overcome**:
  - Complexidade técnica alta
  - Custo de infraestrutura blockchain
  - Questionável se agrega valor real vs solução atual
- **Timeline**: 24+ meses

---

## Action Planning

### Top 3 Priority Ideas

#### #1 Priority: Escalabilidade & Sessões Longas

**Rationale:**
- Requisito crítico BPF - contemporaneidade de dados depende de conexão estável
- Se sistema cair durante turno = perda de rastreabilidade = não-conformidade ALCOA+
- Base para todo o sistema funcionar (sem isso, nada mais importa)

**Next steps:**
1. Implementar classe `SupabaseKeepAlive` com auto-refresh token (50 min)
2. Criar buffer local `OfflineBuffer` com IndexedDB
3. Registrar Service Worker para PWA + background sync
4. Componente `ConnectionStatus` no layout principal
5. Testes de stress: sessão de 8h+ contínua

**Resources needed:**
- 1 desenvolvedor full-time (Semana 1-2)
- Supabase Pro habilitado
- Documentação de APIs (IndexedDB, Service Worker)

**Timeline:**
- Semana 1: SupabaseKeepAlive + OfflineBuffer (3 dias)
- Semana 2: Service Worker + ConnectionStatus + Testes (4 dias)
- Total: 7 dias úteis

---

#### #2 Priority: Visualizações Interativas

**Rationale:**
- Protótipo precisa "mostrar" dados (sem dashboard, não há validação com usuários)
- Pareto de Paradas é a PRINCIPAL ferramenta de gestão (doc 09)
- Dashboards são a interface com gestores (diretoria, engenharia, produção)

**Next steps:**
1. Instalar bibliotecas: `npm install echarts echarts-for-react recharts @tanstack/react-table`
2. Criar componentes dos 8 gráficos obrigatórios
3. Implementar barra de filtros dinâmicos (Shadcn Select + Popover)
4. Hook `useOEEData` com React Query para caching
5. Testes com dados mock SPEP (simular 10 linhas)

**Resources needed:**
- 1 desenvolvedor frontend full-time (Semana 3-5)
- 1 designer para validação UX (2 dias na semana 4)
- Bibliotecas: ECharts (700KB), Recharts (400KB), TanStack Table (~100KB)

**Timeline:**
- Semana 3: Velocímetro + Pareto + Filtros (5 dias)
- Semana 4: Componentes OEE + Resumo Horas + Rosca (5 dias)
- Semana 5: Tabela + MTBF/MTTR + Export + Ajustes (5 dias)
- Total: 15 dias úteis

---

#### #3 Priority: Assinatura Eletrônica & Auditoria

**Rationale:**
- Compliance obrigatório (CFR 21 Part 11) - sem isso, sistema não pode ser validado
- Decisões arquiteturais (triggers, tabelas de auditoria) afetam todo schema
- Validação com consultor Rafael Gusmão é marco crítico

**Next steps:**
1. Criar schema de banco: `assinaturas_eletronicas`, `ordens_producao_audit`
2. Implementar triggers PostgreSQL para auditoria automática
3. Interface de assinatura do supervisor (modal com checkbox selection)
4. Fluxo de estados: `draft` → `aguardando_assinatura` → `assinado`
5. Validação com consultor Rafael Gusmão (apresentação técnica)

**Resources needed:**
- 1 desenvolvedor backend full-time (Semana 1-2)
- 1 reunião (4h) com consultor Rafael Gusmão para validação
- Documentação CFR 21 Part 11 (FDA guidelines)

**Timeline:**
- Semana 1: Schema + Triggers + Testes unitários (5 dias)
- Semana 2: Interface + Fluxo + Validação consultor (5 dias)
- Total: 10 dias úteis

---

### Detailed 6-Week Roadmap

#### Semana 1 (18-24 Nov 2025)
- [ ] **Setup base**: Vite + React 19 + TypeScript + Supabase Pro
- [ ] **Escalabilidade**: SupabaseKeepAlive + OfflineBuffer
- [ ] **Schema inicial**: users, linhas, setores, assinaturas_eletronicas
- [ ] **Triggers**: Auditoria automática para tabelas críticas
- [ ] **Deliverable**: Sistema com sessões estáveis 8h+ e auditoria funcional

#### Semana 2 (25 Nov - 1 Dez 2025)
- [ ] **View materializada**: oee_calculado com fórmulas conforme doc 05
- [ ] **Interface assinatura**: Modal supervisor com checkbox selection
- [ ] **Service Worker**: PWA com background sync
- [ ] **ConnectionStatus**: Componente de status de conexão
- [ ] **Validação**: Apresentação para Rafael Gusmão (assinatura eletrônica)
- [ ] **Deliverable**: Cálculos OEE validados e compliance aprovado

#### Semana 3 (2-8 Dez 2025)
- [ ] **Bibliotecas de gráficos**: Instalar ECharts, Recharts, TanStack Table
- [ ] **Velocímetro OEE**: Componente com ECharts gauge
- [ ] **Pareto de Paradas**: Com drill-down e export
- [ ] **Filtros dinâmicos**: Shadcn Select (setor, linha, período, data range)
- [ ] **React Query**: Setup com cache 5min
- [ ] **Deliverable**: Dashboard com 3 gráficos principais funcionais

#### Semana 4 (9-15 Dez 2025)
- [ ] **Integração KEYENCE**: Gateway SICFAR → Supabase
- [ ] **Tabela ordens_producao_ativas**: Schema + UPDATE a cada 5s
- [ ] **Gateway worker**: Tail de arquivo TXT com agregação
- [ ] **Componentes OEE**: Barras comparativas (últimas 12 semanas)
- [ ] **Resumo de Horas**: Barras empilhadas
- [ ] **Validação UX**: Designer revisa dashboards
- [ ] **Teste real**: 1 linha SPEP com dados de sensor
- [ ] **Deliverable**: IoT funcional + 6 gráficos prontos

#### Semana 5 (16-22 Dez 2025)
- [ ] **Rosca Planejadas/Não Planejadas**: Donut chart
- [ ] **Tabela Consolidada**: TanStack Table com ordenação e filtros
- [ ] **MTBF e MTTR**: Gráficos de linhas
- [ ] **Export PDF/Excel**: Funcionalidades completas
- [ ] **Lazy loading**: Dynamic imports para otimização
- [ ] **Responsividade**: Testes em mobile/tablet
- [ ] **Deliverable**: 8 gráficos completos + exports funcionais

#### Semana 6 (23-29 Dez 2025)
- [ ] **Testes de stress**: Simular 100 usuários simultâneos (10 linhas × 10 users)
- [ ] **Ajustes de performance**: Baseado em métricas de teste
- [ ] **Refinamento UX**: Ajustes baseado em feedback
- [ ] **Documentação técnica**: README, API docs, deployment guide
- [ ] **Preparação demo**: Dados mock + roteiro de apresentação
- [ ] **DEMO FINAL**: Apresentação para diretoria + gestores + consultor
- [ ] **Deliverable**: Protótipo MVP validado e pronto para rollout jan/2026

---

## Reflection & Follow-up

### What Worked Well

- **Mudança de paradigma IoT**: Decisão de agregar por Ordem de Produção (vs analítico) economizou ENORME complexidade e custo
- **Stack híbrida de gráficos**: Balance entre simplicidade (Recharts) e poder (ECharts) foi acertada
- **Começar simples**: View materializada vs over-engineering (tabelas agregadas + triggers complexos) alinha com timeline apertado
- **Foco em compliance desde início**: Evita retrabalho futuro em validação
- **Sessões longas como prioridade #1**: Reconhecer criticidade de contemporaneidade (ALCOA+) orienta decisões arquiteturais
- **Correção sobre assinatura eletrônica vs digital**: Evitou caminho caro e complexo desnecessário

### Areas for Further Exploration

- **Modelagem completa de banco de dados**: PENDENTE - precisa sessão dedicada para definir todas entidades e relacionamentos
  - Razão: Muitas decisões tomadas, mas schema completo ainda não desenhado
- **Book de Paradas**: Aguardando Atividade 06 (não documentada ainda)
  - Razão: Estrutura de 5 níveis é core do sistema, mas detalhes não foram fornecidos
- **Estratégia de testes**: Como validar sistema que requer validação formal (QI/QO/QP)?
  - Razão: Farmacêutica tem processo específico de validação que afeta development workflow
- **Migração de dados históricos**: Se existe sistema anterior, como migrar?
  - Razão: Não foi discutido se há dados históricos ou se começa do zero
- **Plano de treinamento**: Como treinar 100-500 usuários?
  - Razão: Adoção depende de treinamento, mas não foi planejado

### Recommended Follow-up Techniques

- **Entity-Relationship Diagramming (ERD)**: Para modelagem completa de banco de dados
  - Razão: Visualização de entidades e relacionamentos facilita discussão e validação
- **User Story Mapping**: Para priorizar features dentro do MVP
  - Razão: Garantir que protótipo tem exatamente o necessário para validação
- **Technical Spike**: Para testar integração KEYENCE real antes de implementar
  - Razão: Reduzir risco de assumir que tail de arquivo funciona sem validar

### Questions That Emerged

- **Como lidar com mudança de SKU no meio de um turno?** Criar nova ordem ou continuar na mesma?
- **Backup do buffer IndexedDB**: Se navegador limpar cache, como recuperar dados não sincronizados?
- **Estratégia de versionamento durante validação**: Como fazer updates após QI sem invalidar qualificação?
- **Como testar assinatura eletrônica sem certificado digital?** Ambiente de homologação precisa simular CFR 21 Part 11?
- **Retenção de dados**: Quanto tempo guardar registros de sensor? Agregados? Auditoria?
- **Velocidades nominais**: Quem atualiza? Com que frequência? Requer assinatura?
- **Alertas em tempo real**: Sistema deve notificar supervisores quando OEE cai abaixo de meta?
- **Permissões granulares**: Operador pode ver OEE ou só supervisor? Diretoria vê tudo?

### Next Session Planning

#### Suggested topics:
- **Modelagem Completa de Banco de Dados** (ERD + Schema SQL)
- **Plano de Testes e Validação** (QI/QO/QP alinhado com desenvolvimento)
- **Prototipagem de Interface** (Wireframes/Mockups antes de coding)

#### Recommended timeframe:
- **Modelagem de Banco**: 2-3 horas
- **Plano de Testes**: 1-2 horas
- **Prototipagem UI**: 2-3 horas (com designer)

#### Preparation needed:
- Revisar documentação de paradas (quando Atividade 06 disponível)
- Listar todas entidades mencionadas nesta sessão (ordens, apontamentos, linhas, users, etc.)
- Coletar exemplos de dados reais (mock data) para validar modelagem
- Estudar processo de validação farmacêutica (QI/QO/QP) para planejar ciclo de desenvolvimento

---

*Session facilitated using the BMAD-METHOD™ brainstorming framework*
