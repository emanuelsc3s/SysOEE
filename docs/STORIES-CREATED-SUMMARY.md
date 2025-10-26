# Stories Criadas - Resumo Completo

**Data:** 26/10/2025
**Product Owner:** Sarah
**Total Stories Criadas:** 8

---

## ✅ Stories Criadas

### Epic 1: Foundation & Core Infrastructure (7 stories)

| # | Story | Status | Estimativa | Prioridade |
|---|-------|--------|------------|------------|
| 1.1 | Setup de Monorepo Turborepo | Draft | 1-2 dias | 🔴 CRÍTICA |
| 1.2 | Configurar Supabase Cloud | Draft | 1 dia | 🔴 CRÍTICA |
| 1.3 | Implementar Autenticação Básica | Draft | 2 dias | 🔴 CRÍTICA |
| 1.4 | Criar Schema Inicial de Banco | Draft | 2 dias | 🔴 CRÍTICA |
| 1.5 | Implementar Offline-First Buffer | Draft | 2-3 dias | 🟠 ALTA |
| 1.6 | Implementar Keep-Alive Automático | Draft | 1-2 dias | 🟠 ALTA |
| 1.7 | Criar Health-Check Route e Validar Deploy | Draft | 1 dia | 🟠 ALTA |

**Total Epic 1:** ~10-13 dias (2 semanas)

---

### Epic 7 (Dados Mestres - MOVER PARA CIMA): 2 stories

| # | Story | Status | Estimativa | Prioridade |
|---|-------|--------|------------|------------|
| 7.4 | Seed Books de Paradas | Draft | 1 dia | 🔴 CRÍTICA |
| 7.1 | Gerenciamento Velocidades Nominais | Draft | 2-3 dias | 🟠 ALTA |

**Total Epic 7 (parcial):** ~3-4 dias

---

## 📊 Estatísticas

**Total de Arquivos:** 9 (8 novos + 1.1 já existia)
**Total de Páginas:** ~90 páginas de documentação
**Total de Tasks:** ~85 tasks mapeados
**Total de AC (Acceptance Criteria):** ~80 critérios

---

## 📁 Estrutura de Arquivos

```
docs/stories/
├── 1.1.story.md  ← 8.5 KB  (JÁ EXISTIA)
├── 1.2.story.md  ← 5.9 KB  ✅ CRIADO
├── 1.3.story.md  ← 8.7 KB  ✅ CRIADO
├── 1.4.story.md  ← 9.7 KB  ✅ CRIADO
├── 1.5.story.md  ← 10 KB   ✅ CRIADO
├── 1.6.story.md  ← 11 KB   ✅ CRIADO
├── 1.7.story.md  ← 12 KB   ✅ CRIADO
├── 7.1.story.md  ← 11 KB   ✅ CRIADO
└── 7.4.story.md  ← 12 KB   ✅ CRIADO
```

**Total:** ~89 KB de documentação detalhada

---

## 🎯 Sequência de Execução Recomendada

### Fase 1: Fundação (Semana 1-2)
1. ✅ **Story 1.1** - Setup Turborepo (~1-2 dias)
2. ✅ **Story 1.2** - Supabase Cloud (~1 dia)
3. ✅ **Story 1.3** - Autenticação (~2 dias)
4. ✅ **Story 1.4** - Schema Banco (~2 dias)
5. ✅ **Story 1.5** - Offline-First (~2-3 dias)
6. ✅ **Story 1.6** - Keep-Alive (~1-2 dias)
7. ✅ **Story 1.7** - Health-Check (~1 dia)

### Fase 2: Dados Mestres (Semana 3)
8. ✅ **Story 7.4** - Seed Books de Paradas (~1 dia)
9. ✅ **Story 7.1** - Velocidades Nominais (~2-3 dias)

### Fase 3: Prosseguir com Épicos (Semana 4+)
10. Epic 2: Compliance
11. Epic 3: Apontamentos Manuais
12. Epic 4: Cálculo OEE
13. ...

---

## 📝 Detalhes das Stories

### Story 1.1: Setup Turborepo
**Arquivo:** `docs/stories/1.1.story.md`
**Tasks:** 7 tasks, 28 subtasks
**Dependências:** Nenhuma (primeira!)
**Output:** Monorepo funcionando, `turbo dev` OK

**Tecnologias:**
- Turborepo
- Vite 7
- React 19
- TypeScript 5.3+
- ESLint + Prettier

---

### Story 1.2: Supabase Cloud
**Arquivo:** `docs/stories/1.2.story.md`
**Tasks:** 6 tasks
**Dependências:** Story 1.1
**Output:** Conexão Supabase funcionando

**Key Points:**
- Projeto Supabase Pro criado
- Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Health-check query: `SELECT 1`

---

### Story 1.3: Autenticação
**Arquivo:** `docs/stories/1.3.story.md`
**Tasks:** 10 tasks
**Dependências:** Story 1.2
**Output:** Login funcional, protected routes

**Key Points:**
- React Hook Form + Zod
- Supabase Auth
- Protected routes
- Session JWT localStorage

---

### Story 1.4: Schema Banco
**Arquivo:** `docs/stories/1.4.story.md`
**Tasks:** 13 tasks
**Dependências:** Story 1.2
**Output:** Migrations aplicadas, seed data OK

**Tabelas Criadas:**
- setores
- linhas
- apontamentos
- assinaturas_eletronicas
- books_paradas

**IMPORTANTE:** Tabela `ordens_producao_ativas` foi REMOVIDA (sem sensores)

---

### Story 1.5: Offline-First
**Arquivo:** `docs/stories/1.5.story.md`
**Tasks:** 10 tasks
**Dependências:** Story 1.4
**Output:** IndexedDB funcionando, sync automático

**Key Points:**
- Dexie.js
- IndexedDB: `pending_apontamentos`
- SyncService (10s interval)
- Badge de status: Online/Offline/Sincronizando

---

### Story 1.6: Keep-Alive
**Arquivo:** `docs/stories/1.6.story.md`
**Tasks:** 12 tasks
**Dependências:** Story 1.2
**Output:** Sessões 8h+ ativas

**Key Points:**
- autoRefreshToken: true
- Token refresh: 50min
- Heartbeat: 5min
- SessionTimer component
- Retry exponential backoff

---

### Story 1.7: Health-Check
**Arquivo:** `docs/stories/1.7.story.md`
**Tasks:** 12 tasks
**Dependências:** Stories 1.2, 1.3, 1.5, 1.6
**Output:** `/health` OK, deploy validado

**Key Points:**
- Rota pública `/health`
- Dashboard canary
- AppLayout component
- Validar deploy Cloudflare
- Teste: https://sysoee.farmace.io/health

---

### Story 7.4: Books de Paradas
**Arquivo:** `docs/stories/7.4.story.md`
**Tasks:** 11 tasks
**Dependências:** Story 1.4
**Output:** ~500 códigos de parada seedados

**Key Points:**
- 10 linhas SPEP × 50 códigos = 500 registros
- Hierarquia: Classe → Grande Parada → Apontamento
- Códigos comuns + específicos
- Seed via SQL

---

### Story 7.1: Velocidades Nominais
**Arquivo:** `docs/stories/7.1.story.md`
**Tasks:** 12 tasks
**Dependências:** Story 7.4
**Output:** CRUD velocidades funcionando

**Key Points:**
- Tabela `velocidades_nominais`
- Tela `/admin/velocidades-nominais`
- CRUD completo
- Audit trail
- RLS por role (admin, engenharia)

---

## 🎨 Cada Story Inclui:

✅ **Status** - Draft
✅ **Story** - Como/Quero/Para que
✅ **Acceptance Criteria** - 7-11 critérios cada
✅ **Tasks/Subtasks** - Quebrados em passos executáveis
✅ **Dev Notes** - Contexto técnico detalhado:
  - Previous Story Insights
  - Code Examples (TypeScript/SQL)
  - Architecture Context
  - Testing Scenarios
  - Troubleshooting

✅ **Change Log** - Versionamento
✅ **Dev Agent Record** - Espaço para preenchimento futuro
✅ **QA Results** - Espaço para validação

---

## 🚀 Próximos Passos IMEDIATOS

### 1. Aplicar Mudanças nos Épicos (se ainda não fez)

```bash
cd /home/emanuel/SysOEE
chmod +x docs/APPLY-CHANGES.sh
./docs/APPLY-CHANGES.sh
```

### 2. Começar Story 1.1

```bash
# Ver guia completo
cat docs/stories/1.1.story.md

# Ou ver tasks no epic
cat docs/prd/epic-1-foundation-infrastructure.md
```

### 3. Iniciar Desenvolvimento

```bash
# Task 1: Inicializar Turborepo
npm init -y
npm install turbo --save-dev

# Task 2: Criar estrutura
mkdir -p apps/web packages/{ui,database,config}

# ... seguir tasks da Story 1.1
```

---

## 📚 Documentos de Referência

Durante desenvolvimento, consultar:

**Épicos:**
- `docs/prd/epic-1-foundation-infrastructure.md` (revisado)
- `docs/prd/epic-3-apontamentos-manuais.md` (revisado)

**Arquitetura:**
- `docs/architecture/tech-stack.md`
- `docs/architecture/database-schema.md`
- `docs/architecture/coding-standards.md`
- `docs/architecture/testing-strategy.md`

**Resumos:**
- `docs/REVISION-SUMMARY.md` - Mudanças aplicadas
- `docs/STORIES-CREATED-SUMMARY.md` - Este arquivo

---

## 🎯 Métricas de Sucesso

**Depois de completar as 8 stories:**

✅ Turborepo configurado e `turbo dev` funcionando
✅ Supabase conectado e autenticação funcional
✅ Schema banco com 5+ tabelas
✅ Offline-first operacional (IndexedDB + sync)
✅ Sessões 8h+ sem desconectar
✅ Health-check retornando 200 OK em produção
✅ ~500 códigos de parada seedados
✅ CRUD de velocidades nominais funcionando

**Deploy validado:**
- Local: http://localhost:5173/health
- Produção: https://sysoee.farmace.io/health

---

## 🤝 Quem Faz o Quê

**Product Owner (Sarah/EU):**
- ✅ Criar stories (FEITO!)
- ✅ Validar AC
- ✅ Priorizar backlog

**Dev Agent (Próximo):**
- Executar tasks de cada story
- Preencher "Dev Agent Record"
- Commitar código

**QA Agent (Depois):**
- Validar AC
- Preencher "QA Results"
- Aprovar story

---

**Criado por:** Sarah (Product Owner)
**Data:** 26/10/2025
**Versão:** 1.0

---

🎉 **PRONTO PARA COMEÇAR DESENVOLVIMENTO!** 🎉
