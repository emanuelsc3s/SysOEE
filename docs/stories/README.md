# Stories - Sistema OEE

## Épico 001: Implementação de Cálculo de OEE

**Status:** 📝 Pronto para desenvolvimento
**Prioridade:** 🔴 Alta (MVP Crítico)
**Esforço Total:** ~28 dias úteis

### Épico
- [Epic 001: Implementação de Cálculo de OEE](./epic-001-calculo-oee.md)

### Stories

#### Fase 1: Database (Stories 001-003) - 3 dias
**Descrição:** Fundação do sistema - tabela de snapshot, view consolidada e function de cálculo

- [Story 001.001: Migration - Tabela tboee (Snapshot de OEE)](./001.001.migration-tboee.md)
  - **Esforço:** 1 dia
  - **Prioridade:** P0 (Bloqueador)
  - **Descrição:** Criar tabela tboee com campos calculados via GENERATED ALWAYS AS, imutável (APPEND-ONLY)

- [Story 001.002: Migration - View vw_supervisao_turnos](./001.002.migration-view-supervisao.md)
  - **Esforço:** 1 dia
  - **Prioridade:** P0 (Bloqueador)
  - **Descrição:** Criar view que consolida lotes e apontamentos para interface de supervisão

- [Story 001.003: Function PostgreSQL - inserir_snapshot_oee()](./001.003.function-inserir-snapshot-oee.md)
  - **Esforço:** 2 dias
  - **Prioridade:** P0 (Bloqueador)
  - **Descrição:** Criar function que agrega apontamentos e calcula OEE automaticamente

**Dependências Fase 1:**
- Nenhuma dependência externa
- Executar em sequência: 001 → 002 → 003

---

#### Fase 2: Backend API (Story 004) - 3 dias
**Descrição:** Camada de serviços TypeScript para supervisão de turnos

- [Story 001.004: API TypeScript - Supervisão de Turnos](./001.004.api-supervisao-turnos.md)
  - **Esforço:** 3 dias
  - **Prioridade:** P1
  - **Descrição:** Criar API com endpoints para buscar turnos, detalhes e fechar turno
  - **Dependências:** Stories 001-003 (precisa de view e function)

---

#### Fase 3: Frontend Supervisão (Story 005) - 7 dias
**Descrição:** Interface completa para supervisor fechar turnos

- [Story 001.005: Frontend - Página de Supervisão de Turnos](./001.005.frontend-supervisao-turnos.md)
  - **Esforço:** 7 dias
  - **Prioridade:** P1
  - **Descrição:** Página com tabela de turnos, modal de detalhes e fechamento de turno
  - **Dependências:** Story 004 (consome API de supervisão)

---

#### Fase 4: Cadastros Necessários (Stories 006-007) - 6 dias
**Descrição:** Interfaces para cadastrar velocidades e apontar produção manual

- [Story 001.006: Cadastro de Velocidades Nominais](./001.006.cadastro-velocidades-nominais.md)
  - **Esforço:** 3 dias
  - **Prioridade:** P0 (Bloqueador para cálculo de Performance)
  - **Descrição:** CRUD de velocidades nominais (Und/h) por linha e produto
  - **Dependências:** Nenhuma (pode ser paralela)

- [Story 001.007: Apontamento Manual de Produção](./001.007.apontamento-manual-producao.md)
  - **Esforço:** 3 dias
  - **Prioridade:** P1
  - **Descrição:** Modal para operador registrar produção quando não há CLP
  - **Dependências:** Nenhuma (pode ser paralela)

---

#### Fase 5: API de Consulta (Story 008) - 3 dias
**Descrição:** API para dashboards e relatórios consumirem dados de OEE

- [Story 001.008: API de Consulta de OEE](./001.008.api-consulta-oee.md)
  - **Esforço:** 3 dias
  - **Prioridade:** P2
  - **Descrição:** Endpoints para buscar OEE histórico por linha, período, tendências
  - **Dependências:** Story 001 (consome tboee)

---

## Sequência Recomendada de Desenvolvimento

### Sprint 1 (Semana 1-2): Fundação Database + Velocidades
```
Dia 1:     Story 001 (Migration tboee)
Dia 2:     Story 002 (View supervisao)
Dia 3-4:   Story 003 (Function inserir_snapshot_oee)
Dia 5-7:   Story 006 (Cadastro Velocidades) - PARALELO
Dia 8:     Testes integrados de database
```

**Entregável:** Database completa + Cadastro de velocidades funcionando

### Sprint 2 (Semana 3): Backend API
```
Dia 9-11:  Story 004 (API Supervisão)
Dia 12:    Story 007 (Apontamento Produção) - PARALELO
Dia 13:    Testes de API
```

**Entregável:** APIs de supervisão e produção funcionando

### Sprint 3-4 (Semana 4-5): Frontend Supervisão
```
Dia 14-20: Story 005 (Frontend Supervisão)
Dia 21:    Testes end-to-end
```

**Entregável:** Fluxo completo de supervisão funcionando (fechar turno + calcular OEE)

### Sprint 5 (Semana 6): API OEE + Buffer
```
Dia 22-24: Story 008 (API Consulta OEE)
Dia 25-28: Buffer para ajustes, testes, documentação
```

**Entregável:** Sistema completo pronto para dashboards

---

## Validação Final (Checklist)

Após todas as stories, validar:

- [ ] Velocidade nominal pode ser cadastrada via interface
- [ ] Produção pode ser apontada manualmente
- [ ] Supervisor consegue visualizar turnos do dia
- [ ] Supervisor consegue ver detalhes de apontamentos
- [ ] Supervisor consegue fechar turno (sem paradas ativas)
- [ ] OEE é calculado automaticamente ao fechar turno
- [ ] OEE calculado está correto (validar contra fórmulas)
- [ ] Dados persistem em tboee de forma imutável
- [ ] API de consulta retorna dados históricos corretos
- [ ] Nenhuma regressão em funcionalidades existentes

---

## Documentação Relacionada

### Especificações de Negócio
- `docs/project/05-Metodologia-Calculo.md` - **Fórmulas de OEE (CRÍTICO)**
- `docs/project/07-Identificacao-Fontes-Dados.md` - Fontes de dados
- `docs/project/08-Indicadores-Secundarios.md` - MTBF, MTTR

### Documentação Técnica
- `docs/ALERTAS_CRITICOS_BANCO.md` - Análise de gaps e decisões
- `docs/architecture/tboee-usage-guide.md` - Guia completo da tboee
- `docs/architecture/database-conventions.md` - Convenções do projeto

### Migrations Criadas (durante sessão de planejamento)
- `database/migrations/08-tbfuncionario.sql` - Funcionários
- `database/migrations/09-tboee-snapshot.sql` - **Tabela principal de OEE**
- `database/migrations/10-vw-supervisao-turnos.sql` - View de supervisão

### Componentes Criados (durante sessão de planejamento)
- `src/services/api/supervisao.api.ts` - API de supervisão (template)
- `src/types/supervisao.ts` - Tipos TypeScript (template)
- `src/pages/SupervisaoTurnos.tsx` - Página principal (template)
- `src/components/supervisao/TabelaTurnos.tsx` - Tabela (template)
- `src/components/supervisao/ModalDetalhesTurno.tsx` - Modal (template)

---

**Última Atualização:** 2025-11-16
**Validado por:** Sarah (Product Owner)
