# Unified Project Structure

[← Voltar para Índice](./index.md)

## Estrutura de Diretórios do Projeto

### Monorepo Turborepo

```
SysOEE/
├── .bmad-core/                 # BMAD Agent configuration
│   ├── core-config.yaml
│   ├── tasks/
│   ├── templates/
│   └── checklists/
│
├── apps/
│   ├── web/                    # Frontend React
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   └── package.json
│   │
│   └── edge/                   # Edge Functions (Integrações)
│       ├── clp-integration/
│       ├── totvs-sync/
│       └── oee-calculator/
│
├── packages/
│   ├── ui/                     # Shared UI components
│   ├── database/               # Supabase types & queries
│   ├── config/                 # Shared configs
│   └── typescript-config/      # TS configs
│
├── supabase/
│   ├── migrations/             # Database migrations
│   ├── functions/              # Edge Functions
│   └── seed.sql                # Initial data
│
├── docs/
│   ├── prd/                    # Product Requirements (Sharded)
│   │   ├── index.md
│   │   └── epic-*.md
│   │
│   ├── architecture/           # Architecture Docs (Sharded)
│   │   ├── index.md
│   │   ├── tech-stack.md
│   │   ├── data-models.md
│   │   ├── database-schema.md
│   │   ├── core-workflows.md
│   │   ├── backend-architecture.md
│   │   ├── external-apis.md
│   │   ├── coding-standards.md
│   │   ├── testing-strategy.md
│   │   └── unified-project-structure.md
│   │
│   ├── stories/                # User Stories
│   │   └── {epic}.{story}.story.md
│   │
│   └── project/                # Especificações Originais
│       └── *.md
│
├── database/                   # Schema documentation
│
├── turbo.json                  # Turborepo config
├── package.json                # Root package.json
├── CLAUDE.md                   # Claude Code instructions
└── README.md                   # Project README
```

### Convenções de Nomenclatura

#### Arquivos de Componentes React
```
PascalCase para componentes
kebab-case para utilitários

Exemplos:
- VelocimetroOEE.tsx
- GraficoPareto.tsx
- use-offline-sync.ts
- format-oee.utils.ts
```

#### Database Files
```
snake_case para tabelas e colunas
kebab-case para migrations

Exemplos:
- linhas_producao
- apontamentos_parada
- 20251025-create-lotes-producao.sql
```

#### Stories e Épicos
```
Padrão BMAD:
- epic-{n}-{slug}.md
- {epic}.{story}.story.md

Exemplos:
- epic-1-foundation-infrastructure.md
- 1.1.story.md
```

### File Organization Guidelines

#### Components
```
src/components/
├── apontamentos/
│   ├── ApontamentoParadaForm.tsx
│   ├── ApontamentoProducaoForm.tsx
│   └── index.ts
│
├── graficos/
│   ├── VelocimetroOEE.tsx
│   ├── GraficoPareto.tsx
│   ├── GraficoComponentesOEE.tsx
│   └── index.ts
│
└── common/
    ├── Button.tsx
    ├── Modal.tsx
    └── index.ts
```

#### Services
```
src/services/
├── supabase/
│   ├── client.ts
│   ├── auth.service.ts
│   └── realtime.service.ts
│
├── offline/
│   ├── indexeddb.service.ts
│   └── sync.service.ts
│
└── oee/
    ├── calculator.service.ts
    └── aggregations.service.ts
```

---

**Fonte:** `docs/architecture.md` + BMAD Core Structure  
**Última Atualização:** 2025-10-25
