# Epic: PMP — Plano Mestre de Produção (Brownfield Enhancement)

## Epic Goal

Implementar o módulo PMP (Plano Mestre de Produção) ao SysOEE, permitindo que o Gestor PCP registre e revise o plano mensal de produção por linha e SKU, com cálculo automático de horas planejadas (via velocidades nominais existentes), gestão de headcount por linha (cruzando planejado vs ativos em `tbfuncionario`) e dashboard de aderência planejado × realizado integrado ao OEE executado.

## Epic Description

### Existing System Context

- **Funcionalidade relevante existente:**
  - Sistema possui cadastro de linhas (`tblinhaproducao`) e produtos (`tbproduto`)
  - Velocidades nominais por linha/produto já cadastradas em `tbvelocidadenominal`
  - Funcionários cadastrados em `tbfuncionario` com campos `lotacao_id`, `cargo_id`, `ativo`, `dt_rescisao`
  - Dados de OEE executado disponíveis para cruzamento com planejado
  - Controle de acesso via `tbusuario.perfil`

- **Stack tecnológica:**
  - Backend: PostgreSQL 15+ com Supabase
  - Frontend: React + TypeScript + Vite
  - UI: Tailwind CSS + Shadcn/UI
  - State: React Query
  - Export: XLSX + jsPDF/html2canvas

- **Pontos de integração:**
  - `tbvelocidadenominal` para cálculo de `horas_planejadas = qtd_planejada / velocidade`
  - `tbfuncionario` para cálculo de `headcount_atual`
  - Tabelas de produção OEE para "realizado" no dashboard
  - `tbusuario.perfil` para controle de acesso (`!= 'Operador'`)

### Enhancement Details

**O que está sendo adicionado:**

1. **Tabela `tbpmp_plano`:** Cabeçalho do plano mensal com `ano`, `mes`, `descricao`, campos de auditoria padrão
2. **Tabela `tbpmp_item`:** Itens do plano por linha + SKU + semana, com `qtd_planejada` e `horas_planejadas` (calculado na aplicação)
3. **Tabela `tbpmp_headcount`:** Headcount desejado por linha, com `lotacao_id` + `cargo_id` + `headcount_desejado`; `headcount_atual` calculado em runtime via `tbfuncionario`
4. **API TypeScript (`pmp.api.ts`):** CRUD de plano/itens/headcount, cálculo de horas e headcount atual, consulta planejado × realizado
5. **Frontend — Cadastro de Plano:** Tela para PCP criar e revisar plano mensal; revisão toda sexta-feira sem aprovação
6. **Frontend — Headcount:** Configuração de lotação+cargo+desejado por linha com exibição do atual em tempo real
7. **Frontend — Dashboard PMP:** Tabela planejado × realizado com indicadores de aderência por linha/SKU/semana
8. **Exportação:** Excel (editável, 2 abas) e PDF (apresentação) para reunião semanal de sexta-feira

**Como se integra:**

- `horas_planejadas` é calculado ao salvar item do PMP via join com `tbvelocidadenominal`
- `headcount_atual` é calculado em runtime ao abrir tela (não armazenado)
- Dashboard "realizado" consome dados de produção existentes do OEE
- Sem impacto nas funcionalidades existentes de apontamento e cálculo de OEE

**Critérios de sucesso:**

1. Gestor PCP consegue criar plano mensal e distribuir por linha/SKU/semana
2. Horas planejadas calculadas automaticamente ao selecionar linha + SKU + quantidade
3. Headcount desejado comparado em tempo real com ativos no `tbfuncionario`
4. Dashboard mostra aderência entre planejado e realizado por linha
5. Exportação gera Excel e PDF para reunião de sexta-feira
6. Acesso bloqueado para perfil `Operador`
7. Revisão semanal registrada com `updated_at` + `updated_by` sem necessidade de aprovação

## Stories

### Story 1: Migration — Tabelas do PMP (tbpmp_plano, tbpmp_item, tbpmp_headcount)
Criar as 3 tabelas de banco de dados do módulo PMP seguindo convenções de auditoria do projeto (`tblinhaproducao` como referência), com constraints de integridade, índices de performance e FKs para tabelas existentes.

### Story 2: API TypeScript — PMP
Criar `src/services/api/pmp.api.ts` com funções para CRUD completo do plano, cálculo de horas planejadas via `tbvelocidadenominal`, cálculo de headcount atual via `tbfuncionario`, e consulta planejado × realizado cruzando com dados de produção OEE.

### Story 3: Frontend — Cadastro e Revisão de Plano Mensal
Criar tela `/pmp` para Gestor PCP criar plano mensal, adicionar itens por linha/SKU/semana com cálculo automático de horas, e revisar o plano a qualquer momento (sem aprovação), registrando auditoria de alterações.

### Story 4: Frontend — Configuração de Headcount por Linha
Criar seção de headcount dentro da tela do plano, permitindo definir lotação + cargo + quantidade desejada por linha, exibindo headcount atual (de `tbfuncionario`) e gap em tempo real com sinalização visual.

### Story 5: Frontend — Dashboard PMP (Planejado × Realizado)
Criar dashboard `/pmp/dashboard` com tabela comparativa planejado × realizado por linha/SKU com filtros por mês/semana/linha, indicadores de aderência (coloridos), KPIs de resumo e headcount desejado vs atual.

### Story 6: Exportação Excel e PDF
Implementar exportação do plano para Excel (2 abas: Produção + Headcount) e PDF (layout apresentação) para uso na reunião semanal de revisão de sexta-feira.

## Compatibility Requirements

- [x] Tabelas `tblinhaproducao`, `tbproduto`, `tbvelocidadenominal`, `tbfuncionario`, `tbusuario` permanecem inalteradas
- [x] Database schema changes são apenas aditivos (3 novas tabelas)
- [x] UI segue padrões existentes (Tailwind + Shadcn/UI)
- [x] Nenhuma alteração em APIs existentes de OEE
- [x] Roteamento mantém estrutura existente (novas rotas `/pmp` e `/pmp/dashboard`)

## Risk Mitigation

**Riscos identificados:**

- `horas_planejadas = null` quando velocidade nominal não cadastrada para o par linha/SKU → sistema deve alertar usuário com aviso visual claro
- `tbvelocidadenominal` tem nomes de colunas `updated_at`/`updated_by` e `deleted_at`/`deleted_by` invertidos na DDL — ao fazer join, mapear apenas `velocidade`, `linhaproducao_id`, `produto_id`, `deletado` (seguro)
- Headcount pode ser 0 se nenhum funcionário ativo com aquela lotação+cargo — exibir 0 com destaque vermelho

**Plano de rollback:**
- Migrations são reversíveis (DROP TABLE das 3 novas tabelas)
- Dados das tabelas existentes não são modificados
- Novas páginas podem ser removidas do routing sem impacto

## Definition of Done

- [ ] Tabelas `tbpmp_plano`, `tbpmp_item`, `tbpmp_headcount` criadas e migrations executadas
- [ ] API TypeScript com cálculo correto de `horas_planejadas` e `headcount_atual`
- [ ] Gestor PCP consegue criar, editar e revisar plano mensal
- [ ] Headcount desejado vs atual exibido com gap e sinalização visual
- [ ] Dashboard planejado × realizado com indicadores de aderência
- [ ] Exportação Excel e PDF funcionando com formatação pt-BR
- [ ] Acesso bloqueado para `perfil = 'Operador'`
- [ ] Audit trail: `updated_at` + `updated_by` gravados em cada revisão
- [ ] Aviso exibido quando velocidade nominal não cadastrada para par linha/SKU
- [ ] Nenhuma regressão nas funcionalidades existentes de OEE

## Dependencies

**Pré-requisitos (já existem):**
- `tblinhaproducao` ✅
- `tbproduto` ✅
- `tbvelocidadenominal` (com `velocidade`, `linhaproducao_id`, `produto_id`, `deletado`) ✅
- `tbfuncionario` (com `lotacao_id`, `cargo_id`, `ativo`, `dt_rescisao`) ✅
- `tbusuario` (com `perfil`) ✅
- Dados de produção OEE para dashboard "realizado" ✅

**Sequência recomendada de desenvolvimento:**

```
Story 1 (Migration DB) — base para tudo
  └─ Story 2 (API TypeScript)
       ├─ Story 3 (Frontend Cadastro Plano)
       └─ Story 4 (Frontend Headcount)  ──── paralelas ────► Story 5 (Dashboard)
                                                                    └─ Story 6 (Exportação)
```

## Technical Notes

- **Convenção de auditoria:** Seguir `tblinhaproducao` — `created_by INTEGER REFERENCES tbusuario(usuario_id)`, `updated_at TIMESTAMP WITHOUT TIME ZONE`, `updated_by INTEGER REFERENCES tbusuario(usuario_id)`, etc.
- **Timezone:** Todos os `DEFAULT NOW()` usam `(NOW() AT TIME ZONE 'America/Fortaleza')` conforme padrão do projeto
- **`horas_planejadas`:** Calculado na camada de aplicação (não GENERATED ALWAYS AS) pois requer join com `tbvelocidadenominal`; armazenado na tabela para performance
- **`headcount_atual`:** Calculado em runtime (não armazenado) para sempre refletir situação atual de `tbfuncionario`
- **Formatação numérica:** pt-BR — separador decimal vírgula, milhar ponto (`toLocaleString('pt-BR', ...)`) em toda a UI e exportações
- **IDs:** `SERIAL` (não UUID) conforme padrão do projeto

## Related Documentation

- `docs/prd/epic-9-pmp-plano-mestre-producao.md` — Especificação PRD completa
- `docs/architecture/database-conventions.md` — Convenções de banco
- `docs/project/05-Metodologia-Calculo.md` — Metodologia OEE (referência para "realizado")

## Estimated Effort

| Story | Descrição | Estimativa |
|-------|-----------|------------|
| Story 1 | Migration DB | 1-2 dias |
| Story 2 | API TypeScript | 2-3 dias |
| Story 3 | Frontend Cadastro Plano | 4-5 dias |
| Story 4 | Frontend Headcount | 2-3 dias |
| Story 5 | Dashboard PMP | 4-5 dias |
| Story 6 | Exportação | 2-3 dias |
| Buffer/Testes | | 3-4 dias |
| **Total** | | **~20-25 dias úteis** |

---

**Status:** 📝 Pronto para desenvolvimento
**Prioridade:** 🟡 Média (sem prazo definido — iniciar após estabilização do MVP OEE)
**Validado por:** Sarah (PO)
**Data:** 2026-03-01
