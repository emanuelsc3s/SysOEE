# Epic: Implementação de Cálculo de OEE - Brownfield Enhancement

## Epic Goal

Implementar a funcionalidade completa de cálculo automático de OEE (Overall Equipment Effectiveness) ao final de cada turno, incluindo persistência histórica via snapshot, interface de supervisão para fechamento de turnos, e APIs de consulta para dashboards e relatórios.

## Epic Description

### Existing System Context

- **Current relevant functionality:**
  - Sistema já possui módulo de operação com apontamentos de paradas (tbapontamentoparada)
  - Apontamentos de produção via CLP ou manual (tbapontamentoproducao)
  - Apontamentos de qualidade para refugo e retrabalho (tbapontamentoqualidade)
  - Interface de operação funcional com Kanban de OPs e modais de apontamento

- **Technology stack:**
  - Backend: PostgreSQL 15+ com Supabase
  - Frontend: React 18.3.1 + TypeScript 5.5.3 + Vite
  - UI: Tailwind CSS + Shadcn/UI
  - State: React Query 5.56.2
  - Gráficos: Recharts 2.12.7

- **Integration points:**
  - Integração com tabelas transacionais existentes (tbapontamentoparada, tbapontamentoproducao, tbapontamentoqualidade)
  - Integração com tabelas de cadastro (tblinhaproducao, tbproduto, tbturno, tbusuario)
  - Página de operação existente (Operacao.tsx, OperacaoDetalheOP.tsx)

### Enhancement Details

**What's being added/changed:**

1. **Tabela de Snapshot de OEE (tboee):** Nova tabela que armazena snapshots históricos de OEE calculado, garantindo rastreabilidade ALCOA+ e imutabilidade dos dados
2. **View de Supervisão (vw_supervisao_turnos):** View que consolida dados de apontamentos para interface de supervisão
3. **Function de Cálculo (inserir_snapshot_oee):** Function PostgreSQL que agrega apontamentos e calcula OEE automaticamente
4. **Página de Supervisão de Turnos:** Interface onde supervisor visualiza turnos do dia e executa fechamento, disparando cálculo de OEE
5. **API de Supervisão:** Endpoints TypeScript para buscar turnos, detalhes de apontamentos e executar fechamento
6. **Cadastro de Velocidades Nominais:** Interface para cadastrar velocidades de produção por linha/produto (base para cálculo de Performance)
7. **Apontamento Manual de Produção:** Interface para operadores registrarem produção quando não há CLP
8. **API de Consulta de OEE:** Endpoints para dashboards e relatórios consultarem dados históricos de OEE

**How it integrates:**

- Snapshot de OEE é criado automaticamente ao final do turno via trigger quando supervisor fecha turno
- Agrega dados das 3 tabelas transacionais existentes (paradas, produção, qualidade)
- Busca velocidade nominal e meta OEE vigentes e "congela" no snapshot (imutabilidade)
- Componentes de OEE (Disponibilidade, Performance, Qualidade) são calculados via GENERATED ALWAYS AS
- Interface de supervisão consome view consolidada para exibir status de turnos
- Dashboards futuros consumirão tboee para relatórios históricos

**Success criteria:**

1. OEE calculado automaticamente ao fechar turno com precisão conforme especificação (docs/project/05-Metodologia-Calculo.md)
2. Dados históricos preservados de forma imutável (ALCOA+ compliance)
3. Supervisor consegue visualizar e fechar turnos através de interface intuitiva
4. Velocidades nominais cadastradas e utilizadas corretamente no cálculo
5. API de consulta retorna dados de OEE para dashboards e relatórios
6. Nenhuma regressão em funcionalidades existentes de apontamento

## Stories

### Story 1: Migration - Tabela tboee (Snapshot de OEE)
Criar migration da tabela tboee com todos os campos necessários para armazenar snapshot histórico de OEE, incluindo tempos, unidades, parâmetros congelados e campos calculados via GENERATED ALWAYS AS.

### Story 2: Migration - View vw_supervisao_turnos
Criar view que consolida dados de lotes e apontamentos (paradas, produção, qualidade) para facilitar consulta na página de supervisão de turnos.

### Story 3: Function PostgreSQL - inserir_snapshot_oee()
Criar function que agrega todos os apontamentos do turno, busca parâmetros vigentes (velocidade, meta) e insere snapshot de OEE na tboee com cálculos corretos.

### Story 4: API TypeScript - Supervisão de Turnos
Criar serviço de API (supervisao.api.ts) com endpoints para buscar turnos do dia, detalhes de apontamentos e executar fechamento de turno.

### Story 5: Frontend - Página de Supervisão de Turnos
Criar página onde supervisor visualiza turnos do dia em tabela, seleciona turno para ver detalhes de apontamentos e executa fechamento disparando cálculo de OEE.

### Story 6: Cadastro de Velocidades Nominais
Criar interface CRUD completa para cadastrar velocidades nominais (Und/h) por linha e produto, essencial para cálculo de Performance no OEE.

### Story 7: Apontamento Manual de Produção
Criar interface para operadores registrarem produção manualmente quando não há integração com CLP.

### Story 8: API de Consulta de OEE
Criar serviço de API (oee.api.ts) com endpoints para buscar dados históricos de OEE por linha, período, turno, etc. para uso em dashboards e relatórios.

## Compatibility Requirements

- [x] Tabelas transacionais existentes (tbapontamentoparada, tbapontamentoproducao, tbapontamentoqualidade) permanecem inalteradas
- [x] Database schema changes são apenas aditivos (novas tabelas, views, functions)
- [x] UI segue padrões existentes (Tailwind + Shadcn/UI)
- [x] Roteamento e navegação mantêm estrutura existente
- [x] Performance: consultas otimizadas via índices e views materializadas
- [x] Nenhuma alteração em APIs existentes

## Risk Mitigation

**Primary Risk:**
- Cálculo incorreto de OEE devido a erros na lógica de agregação ou nas fórmulas
- Perda de dados históricos se snapshot não for imutável
- Performance degradada em consultas de dashboard se não houver índices adequados

**Mitigation:**
- Validar cálculos com casos de teste baseados em exemplos da especificação (docs/project/05-Metodologia-Calculo.md)
- Implementar tabela tboee como APPEND-ONLY com rules que bloqueiam UPDATE/DELETE
- Criar índices otimizados em tboee para queries de dashboard
- Testar com dados reais do registro de velocidade existente

**Rollback Plan:**
- Migrations são reversíveis (DROP TABLE, DROP VIEW, DROP FUNCTION)
- Dados das tabelas transacionais permanecem intactos
- Novas páginas podem ser removidas do routing
- APIs novas não afetam endpoints existentes

## Definition of Done

- [x] Todas as 8 stories completadas com acceptance criteria met
- [x] Cálculo de OEE validado com casos de teste da especificação
- [x] Tabela tboee implementada como APPEND-ONLY (imutável)
- [x] Supervisor consegue fechar turno e OEE é calculado corretamente
- [x] Velocidades nominais podem ser cadastradas via interface
- [x] Produção pode ser apontada manualmente via interface
- [x] API de consulta retorna dados corretos de OEE histórico
- [x] Existing functionality de apontamentos verificada (nenhuma regressão)
- [x] Integration points testados (triggers, functions)
- [x] Documentação atualizada (ALERTAS_CRITICOS_BANCO.md, tboee-usage-guide.md)
- [x] Performance validada (consultas < 2s mesmo com milhares de registros)

## Dependencies

**Bloqueadores:**
- Nenhum bloqueador externo identificado
- Todas as dependências são internas ao projeto

**Sequência Recomendada:**
1. Stories 1-3 (Database) devem ser completadas primeiro (base para tudo)
2. Story 6 (Velocidades) deve vir antes de Story 3 ser testada (dados necessários)
3. Story 7 (Produção Manual) pode ser paralela a Story 4-5
4. Story 4-5 (Supervisão) dependem de Stories 1-3 estarem prontas
5. Story 8 (API OEE) pode ser última (consome dados de tboee)

## Technical Notes

- **ALCOA+ Compliance:** Tabela tboee implementa princípios ALCOA+ via imutabilidade e campos de auditoria
- **Snapshot Strategy:** Velocidade nominal e meta OEE são "congeladas" no momento do cálculo para garantir histórico correto
- **Performance:** Campos calculados usam GENERATED ALWAYS AS STORED para evitar recálculo em queries
- **Índices:** Criar índices em (linhaproducao_id, data_referencia), (status), (calculado_em) para otimizar consultas
- **Timezone:** Todos os timestamps usam 'America/Fortaleza' conforme padrão do projeto

## Related Documentation

- `docs/project/05-Metodologia-Calculo.md` - Fórmulas de OEE (CRÍTICO)
- `docs/ALERTAS_CRITICOS_BANCO.md` - Análise de gaps e limitações
- `docs/architecture/tboee-usage-guide.md` - Guia de uso da tboee
- `docs/architecture/database-conventions.md` - Convenções do projeto
- `database/migrations/09-tboee-snapshot.sql` - Migration da tboee
- `database/migrations/10-vw-supervisao-turnos.sql` - View de supervisão

## Estimated Effort

- **Total:** ~28 dias úteis (6 semanas com 1 desenvolvedor full-time)
- **Por Story:**
  - Story 1-3 (Database): 3 dias
  - Story 4 (API Supervisão): 3 dias
  - Story 5 (Frontend Supervisão): 7 dias
  - Story 6 (Velocidades): 3 dias
  - Story 7 (Produção Manual): 3 dias
  - Story 8 (API OEE): 3 dias
  - Buffer/Testes: 6 dias

---

**Status:** 📝 Pronto para desenvolvimento
**Prioridade:** 🔴 Alta (MVP Crítico)
**Validado por:** Sarah (PO)
**Data:** 2025-11-16
