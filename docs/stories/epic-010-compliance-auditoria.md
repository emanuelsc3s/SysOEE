# Epic 010: Compliance & Trilha de Auditoria (ALCOA+)

## Epic Goal

Corrigir e completar a trilha de auditoria do SysOEE no Supabase, garantindo que **todas as alterações em dados críticos sejam rastreadas com quem/quando/o quê/antes/depois**, de forma imutável e em conformidade com os princípios ALCOA+ exigidos para ambientes regulados pela ANVISA.

## Epic Description

### Contexto do Sistema Existente

O projeto já possui uma estrutura inicial de auditoria, porém com **bugs críticos** que impedem seu funcionamento correto:

- **`tbauditlog`** — Tabela APPEND-ONLY criada em `02-tables.sql`, mas com incompatibilidades de tipos (UUID vs INTEGER nas PKs, BIGINT vs INTEGER no FK de usuário)
- **`audit_trigger_func()`** — Função criada em `03-functions.sql`, mas com bug de nome de tabela (`tb_audit_log` em vez de `tbauditlog`) que impede auditoria de INSERTs e DELETEs
- **Triggers** — Instalados em 6 tabelas críticas em `04-triggers.sql`, mas dependem da função bugada
- **Contexto de sessão** — `get_current_user_id()` existe mas o frontend **não envia** `app.current_user_id`, causando `usuario_id = NULL` em todos os registros de auditoria

Além disso, tabelas novas criadas após a migration inicial (módulos OEE snapshot, PMP) **não possuem triggers** de auditoria.

### Gaps Identificados

| Gap | Impacto | Severidade |
|---|---|---|
| `audit_trigger_func()` usa `tb_audit_log` para INSERT/DELETE (nome errado) | INSERTs e DELETEs **não auditados** — erro silencioso em runtime | 🔴 Crítico |
| `tbauditlog.registro_id UUID` — tabelas novas usam `INTEGER` como PK | `registro_id` incorreto para todas as tabelas pós-migração | 🔴 Crítico |
| `tbauditlog.usuario_id BIGINT REFERENCES tbusuario(id)` — FK inválida | Todos os inserts na `tbauditlog` falham por constraint quebrada | 🔴 Crítico |
| Trigger captura `(v_new_record).id` mas PKs são nomeadas `<nome>_id` | PK nunca capturada corretamente | 🟠 Alto |
| `ip_address` e `device_info` nunca preenchidos na função | Rastreabilidade incompleta (ALCOA+ — Atribuível) | 🟠 Alto |
| Frontend não envia `app.current_user_id` nas requisições | Todas as operações sem atribuição de usuário | 🟠 Alto |
| Tabelas dos módulos OEE e PMP sem triggers de auditoria | Módulos mais críticos do sistema sem rastreabilidade | 🟠 Alto |

### O que este Epic entrega

1. **`tbauditlog` recriada** com schema correto e compatível com o padrão atual do projeto
2. **`audit_trigger_func()` corrigida** — captura INSERT/UPDATE/DELETE com IP, device_info e descoberta dinâmica de PK
3. **Cobertura ampliada** — triggers em todas as tabelas de negócio críticas
4. **Contexto de sessão integrado** — `app.current_user_id` enviado automaticamente em todas as mutações do frontend
5. **Tela de consulta** — interface para supervisores/auditores consultarem o histórico de alterações

### Stack Técnica

- Backend: PostgreSQL 15+ via Supabase
- Frontend: React + TypeScript + Vite
- UI: Tailwind CSS + Shadcn/UI
- Client: Supabase JS SDK

### Critérios de Sucesso do Epic

1. Inserir/atualizar/deletar (logicamente) um apontamento → registro aparece em `tbauditlog` com `usuario_id`, `ip_address`, `operacao`, `campo_alterado`, `valor_anterior`, `valor_novo` preenchidos corretamente
2. Campo `usuario_id` **nunca NULL** após integração do frontend (exceto operações de sistema sem contexto)
3. `tbauditlog` imutável — tentativas de UPDATE/DELETE ignoradas pelas rules do PostgreSQL
4. Supervisor consegue consultar histórico de alterações de qualquer registro via `/auditoria`
5. Todas as tabelas de negócio críticas possuem trigger de auditoria ativo e funcionando

---

## Stories

### Sequência Recomendada

```
010.001 (Corrigir tbauditlog + audit_trigger_func)   ← Bloqueador
    └─ 010.002 (Ampliar triggers para tabelas novas)
    └─ 010.003 (Frontend: enviar contexto de sessão)
         └─ 010.004 (Tela de consulta do Audit Log)
```

### Story 010.001: Migration — Corrigir tbauditlog e audit_trigger_func()
- **Arquivo:** [010.001.migration-fix-auditlog.md](./010.001.migration-fix-auditlog.md)
- **Esforço:** 1-2 dias | **Prioridade:** P0 (Bloqueador)
- **Descrição:** Recriar `tbauditlog` com schema correto e corrigir `audit_trigger_func()` eliminando todos os bugs identificados

### Story 010.002: Migration — Ampliar Cobertura de Triggers de Auditoria
- **Arquivo:** [010.002.migration-ampliar-triggers.md](./010.002.migration-ampliar-triggers.md)
- **Esforço:** 1 dia | **Prioridade:** P0
- **Descrição:** Adicionar triggers de auditoria nas tabelas de negócio sem cobertura (módulos OEE, PMP, Funcionários, Linhas)

### Story 010.003: Frontend — Enviar Contexto de Auditoria nas Requisições
- **Arquivo:** [010.003.frontend-contexto-auditoria.md](./010.003.frontend-contexto-auditoria.md)
- **Esforço:** 1 dia | **Prioridade:** P1
- **Descrição:** Configurar o cliente Supabase para enviar `app.current_user_id` e `app.device_info` automaticamente antes de qualquer mutação no banco

### Story 010.004: Frontend — Tela de Consulta do Audit Log
- **Arquivo:** [010.004.frontend-tela-auditlog.md](./010.004.frontend-tela-auditlog.md)
- **Esforço:** 2-3 dias | **Prioridade:** P2
- **Descrição:** Criar página `/auditoria` com tabela de histórico, filtros por tabela/usuário/data/operação e visualização de valores antes/depois

---

**Status:** 📝 Pronto para desenvolvimento
**Prioridade:** 🔴 Alta (pré-requisito para conformidade ALCOA+)
**Esforço Total:** ~5-7 dias úteis
**Última Atualização:** 2026-03-01
**Criado por:** Sarah (Product Owner)
