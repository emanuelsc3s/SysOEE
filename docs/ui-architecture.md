# Sistema OEE - SicFar Frontend Architecture Document

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-25 | 1.0 | Documentação inicial da arquitetura frontend | Winston (Architect Agent) |

---

## Template and Framework Selection

### Stack Atual Detectada

**Framework Base**: Vite + React 18.3.1 + TypeScript 5.5.3

**Template/Starter**: Projeto customizado baseado em:
- **Vite** como build tool (não Create React App)
- **Shadcn/UI** como component library (estrutura já presente em `src/components/ui/`)
- **React Router** v6.26.2 para roteamento
- **TailwindCSS** v3.4.11 para estilização

**Estrutura já implementada**:
```
src/
├── components/
│   ├── ui/              # Shadcn/UI components
│   ├── branding/        # Componentes de marca
│   ├── navigation/      # Navegação
│   └── operacao/        # Domínio de operação
├── pages/               # Páginas da aplicação
├── lib/                 # Utilitários
├── types/               # Tipos TypeScript
├── data/                # Mock data
└── styles/              # Estilos globais
```

**Integrações configuradas**:
- ✅ Supabase Client (@supabase/supabase-js v2.49.4)
- ✅ React Query (@tanstack/react-query v5.56.2) para cache e fetching
- ✅ React Hook Form v7.53.0 + Zod v3.23.8 para formulários
- ✅ Recharts v2.12.7 para gráficos
- ✅ dnd-kit para drag-and-drop
- ✅ Lucide React para ícones
- ✅ Next Themes para dark mode

**Decisão**: Este projeto **não usa template starter padrão**, mas sim uma configuração customizada otimizada para o domínio OEE que combina Vite + React + Shadcn/UI.

---

## Frontend Tech Stack

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|-----------|---------|---------|-----------|
| **Framework** | React | 18.3.1 | UI rendering e componentes | Framework mais popular com ecossistema maduro, suporte a TypeScript robusto, excelente para dashboards complexos |
| **UI Library** | Shadcn/UI + Radix UI | Latest | Sistema de componentes acessíveis | Componentes headless personalizáveis, acessibilidade WCAG2 integrada, ideal para indústria farmacêutica |
| **State Management** | React Query + Context API | 5.56.2 | Server state + client state | React Query para cache/sync com Supabase, Context API para estado global simples (autenticação, tema) |
| **Routing** | React Router | 6.26.2 | Navegação SPA | Padrão da indústria para React, suporte a lazy loading, proteção de rotas |
| **Build Tool** | Vite | 7.1.4 | Bundling e dev server | HMR ultra-rápido, build otimizado, melhor DX que Webpack/CRA |
| **Styling** | TailwindCSS + CSS Variables | 3.4.11 | Utility-first styling | Desenvolvimento rápido, design system consistente, dark mode nativo |
| **Testing (Unit)** | Vitest + React Testing Library | Latest | Testes de componentes | Vitest = Vite-native, zero config, sintaxe Jest, extremamente rápido |
| **Testing (E2E)** | Playwright | Latest | Testes end-to-end | Performance superior, múltiplos browsers, API moderna |
| **Component Library** | Shadcn/UI | 3.1.0 | Componentes UI prontos | Copy-paste components (não npm package), customizável, código no projeto |
| **Form Handling** | React Hook Form + Zod | 7.53.0 + 3.23.8 | Formulários performáticos | Validação type-safe, performance (uncontrolled), integração com Shadcn |
| **Data Fetching** | @tanstack/react-query | 5.56.2 | Server state management | Cache inteligente, refetch automático, otimização de rede |
| **Animation** | TailwindCSS Animate | 1.0.7 | Animações CSS | Animações leves via utility classes, sem JavaScript overhead |
| **Charts** | Recharts | 2.12.7 | Gráficos OEE (Pareto, velocímetro) | Componentes React nativos, customizável, suporte a SVG responsivo |
| **Icons** | Lucide React | 0.462.0 | Ícones SVG | Biblioteca moderna, tree-shakeable, consistente com Shadcn |
| **Drag & Drop** | @dnd-kit | 6.3.1 | Drag-and-drop de operações | Performance superior ao react-beautiful-dnd, acessível |
| **Date Handling** | date-fns + react-day-picker | 3.0.0 + 8.10.1 | Manipulação de datas | Leve (vs Moment.js), tree-shakeable, i18n nativo |
| **Backend Client** | @supabase/supabase-js | 2.49.4 | Conexão com Supabase | Cliente oficial, real-time, auth integrado |
| **Dev Tools** | ESLint + TypeScript ESLint | 9.9.0 + 8.0.1 | Code quality e linting | Regras estritas, prevenção de bugs, consistência de código |

### Rationale Detalhado

**Decisões-Chave**:

1. **Vite vs Create React App**: Escolhido Vite pela performance superior em desenvolvimento (HMR instantâneo) e builds otimizados. CRA está deprecated desde 2023.

2. **Shadcn/UI vs Material-UI/Ant Design**: Shadcn permite customização total (código no projeto, não node_modules), acessibilidade nativa via Radix UI, e design system alinhado com identidade da Farmace.

3. **React Query vs Redux**: Para sistema OEE com forte dependência de dados do servidor (Supabase), React Query é superior para sincronização server-client. Redux seria overkill e aumentaria complexidade.

4. **TailwindCSS vs CSS-in-JS**: Tailwind oferece desenvolvimento mais rápido com utilities, dark mode nativo (crítico para turnos noturnos), e melhor performance (CSS estático vs runtime).

5. **React Hook Form vs Formik**: Performance superior (uncontrolled inputs), bundle menor, integração nativa com Zod para validação type-safe.

6. **Recharts vs Chart.js/D3**: Recharts é React-first (componentes declarativos), mais fácil de manter que D3, e suficiente para gráficos OEE (Pareto, velocímetro, barras).

**Trade-offs Identificados**:

- ⚠️ **Shadcn copy-paste model**: Componentes ficam no código-fonte (não npm), aumenta tamanho do projeto mas dá controle total
- ⚠️ **React Query complexidade**: Curva de aprendizado para desenvolvedores novos, mas vale o investimento
- ⚠️ **TailwindCSS verbosity**: Classes podem ficar longas, mas usamos `cn()` utility e component extraction para mitigar

**Decisões Finalizadas para MVP**:

- ✅ **Testing framework**: **Vitest** + React Testing Library
  - Zero config com Vite, sintaxe Jest-like, performance superior
  - Foco MVP: testes críticos (formulários, cálculos, componentes de domínio)

- ✅ **E2E Testing**: **Playwright**
  - Performance superior ao Cypress, múltiplos browsers
  - Prioridade: fluxos críticos (login, apontamento, conclusão lote)

- ✅ **Storybook**: **NÃO incluir no MVP** (Fase 2)
  - Overhead de configuração incompatível com prazo (Jan/2026)
  - Melhor investir tempo em features core e testes
  - Considerar pós-MVP para design system documentation

---

## Project Structure

### Estrutura de Diretórios Completa

```
SysOEE/
├── public/                          # Arquivos estáticos
│   ├── favicon.ico
│   └── logo-farmace.svg
│
├── src/
│   ├── main.tsx                     # Entry point da aplicação
│   ├── App.tsx                      # Root component com providers
│   │
│   ├── components/                  # Componentes reutilizáveis
│   │   ├── ui/                      # Shadcn/UI components (copy-paste)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   └── ... (30+ componentes Shadcn)
│   │   │
│   │   ├── layout/                  # Componentes de layout
│   │   │   ├── AppLayout.tsx        # Layout principal com sidebar
│   │   │   ├── Sidebar.tsx          # Navegação lateral
│   │   │   ├── Header.tsx           # Cabeçalho com user menu
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── branding/                # Componentes de marca
│   │   │   ├── BrandingSection.tsx
│   │   │   └── Logo.tsx
│   │   │
│   │   ├── navigation/              # Navegação
│   │   │   ├── NavigationCard.tsx
│   │   │   └── Breadcrumbs.tsx
│   │   │
│   │   ├── charts/                  # Componentes de gráficos OEE
│   │   │   ├── OEEGauge.tsx         # Velocímetro de OEE
│   │   │   ├── ParetoChart.tsx      # Gráfico de Pareto (principal!)
│   │   │   ├── ComponentesOEE.tsx   # Barras de Disp/Perf/Qual
│   │   │   ├── TendenciaOEE.tsx     # Linha do tempo (10 semanas)
│   │   │   ├── DonutParadas.tsx     # Rosca Planejadas vs Não Planejadas
│   │   │   └── MTBFMTTRChart.tsx    # MTBF e MTTR
│   │   │
│   │   └── forms/                   # Componentes de formulário
│   │       ├── FormField.tsx        # Wrapper de campo com erro
│   │       ├── DatePicker.tsx
│   │       ├── TimePicker.tsx
│   │       └── NumberInput.tsx
│   │
│   ├── features/                    # Features por domínio (Feature-Sliced Design)
│   │   ├── auth/                    # Autenticação e autorização
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── usePermissions.ts
│   │   │   ├── context/
│   │   │   │   └── AuthContext.tsx
│   │   │   └── types.ts
│   │   │
│   │   ├── dashboard/               # Dashboard OEE
│   │   │   ├── components/
│   │   │   │   ├── DashboardGrid.tsx
│   │   │   │   ├── OEECard.tsx
│   │   │   │   └── LinhaSelector.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useDashboardData.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── lote/                    # Gestão de lotes
│   │   │   ├── components/
│   │   │   │   ├── LoteForm.tsx
│   │   │   │   ├── LoteCard.tsx
│   │   │   │   └── LoteList.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useLote.ts
│   │   │   │   └── useLotes.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── operacao/                # Operações/Apontamentos (já existente)
│   │   │   ├── components/
│   │   │   │   ├── OPCard.tsx
│   │   │   │   ├── KanbanColumn.tsx
│   │   │   │   ├── ModalSelecaoOperacao.tsx
│   │   │   │   └── DialogoConclusaoOP.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useOperacoes.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── apontamento/             # Apontamentos (Paradas, Produção, Qualidade)
│   │   │   ├── components/
│   │   │   │   ├── ApontamentoParadaForm.tsx
│   │   │   │   ├── ApontamentoProducaoForm.tsx
│   │   │   │   ├── ApontamentoQualidadeForm.tsx
│   │   │   │   └── ListaParadas.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useApontamentos.ts
│   │   │   │   └── useCodigosParada.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── diario-bordo/            # Diário de Bordo
│   │   │   ├── components/
│   │   │   │   ├── DiarioBordoView.tsx
│   │   │   │   ├── AssinaturaEletronica.tsx
│   │   │   │   └── ExportPDF.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useDiarioBordo.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── relatorios/              # Relatórios e análises
│   │   │   ├── components/
│   │   │   │   ├── RelatorioOEE.tsx
│   │   │   │   ├── ParetoAnalysis.tsx
│   │   │   │   └── FiltrosPeriodo.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useRelatorios.ts
│   │   │   └── types.ts
│   │   │
│   │   └── cadastros/               # Cadastros (Linhas, SKUs, Códigos de Parada)
│   │       ├── components/
│   │       │   ├── LinhaForm.tsx
│   │       │   ├── SKUForm.tsx
│   │       │   └── CodigoParadaForm.tsx
│   │       ├── hooks/
│   │       │   ├── useLinhas.ts
│   │       │   └── useSKUs.ts
│   │       └── types.ts
│   │
│   ├── pages/                       # Páginas (rotas)
│   │   ├── Home.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Operacao.tsx             # Já existe
│   │   ├── Lotes.tsx
│   │   ├── Apontamentos.tsx
│   │   ├── DiarioBordo.tsx
│   │   ├── Relatorios.tsx
│   │   ├── Cadastros.tsx
│   │   └── Placeholder.tsx
│   │
│   ├── services/                    # Serviços de API
│   │   ├── supabase.ts              # Cliente Supabase configurado
│   │   ├── api/
│   │   │   ├── lote.api.ts
│   │   │   ├── apontamento.api.ts
│   │   │   ├── oee.api.ts
│   │   │   ├── linha.api.ts
│   │   │   ├── sku.api.ts
│   │   │   └── user.api.ts
│   │   └── sync/
│   │       └── totvs-sync.ts        # Integração TOTVS (futuro)
│   │
│   ├── hooks/                       # Hooks globais/compartilhados
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useMediaQuery.ts
│   │   └── useRealtime.ts           # Supabase realtime
│   │
│   ├── lib/                         # Utilitários e helpers
│   │   ├── utils.ts                 # cn() e utilitários Shadcn
│   │   ├── format.ts                # Formatação de números/datas
│   │   ├── validation.ts            # Schemas Zod compartilhados
│   │   ├── oee-calculations.ts      # Lógica de cálculo OEE (client-side)
│   │   └── constants.ts             # Constantes globais
│   │
│   ├── types/                       # Tipos TypeScript globais
│   │   ├── database.types.ts        # Tipos gerados do Supabase
│   │   ├── operacao.ts              # Já existe
│   │   ├── lote.ts
│   │   ├── apontamento.ts
│   │   ├── oee.ts
│   │   └── index.ts
│   │
│   ├── data/                        # Dados mock/estáticos
│   │   ├── mockOPs.ts               # Já existe
│   │   └── setores.ts               # Dados dos 4 setores
│   │
│   ├── styles/                      # Estilos globais
│   │   ├── index.css                # Global CSS + Tailwind imports
│   │   └── themes.css               # Variáveis CSS para temas
│   │
│   └── config/                      # Configurações
│       ├── env.ts                   # Validação de env vars com Zod
│       ├── routes.ts                # Definição de rotas
│       └── permissions.ts           # Mapeamento de permissões por role
│
├── tests/                           # Testes (Vitest + Playwright)
│   ├── unit/                        # Testes unitários
│   │   ├── components/
│   │   ├── hooks/
│   │   └── lib/
│   ├── integration/                 # Testes de integração
│   │   └── features/
│   └── e2e/                         # Testes E2E (Playwright)
│       ├── auth.spec.ts
│       ├── apontamento.spec.ts
│       └── lote-workflow.spec.ts
│
├── scripts/                         # Scripts utilitários
│   └── check-env.js                 # Já existe
│
├── .env.example                     # Template de variáveis de ambiente
├── .env.local                       # Variáveis locais (gitignored)
├── vite.config.ts                   # Configuração Vite
├── tailwind.config.ts               # Configuração Tailwind
├── tsconfig.json                    # Configuração TypeScript
├── vitest.config.ts                 # Configuração Vitest (a criar)
├── playwright.config.ts             # Configuração Playwright (a criar)
└── package.json
```

### Princípios de Organização

1. **Feature-Sliced Design**: Cada feature (`features/*`) é auto-contida com seus próprios components/hooks/types
2. **Colocation**: Código relacionado fica junto (componente + hook + tipo da mesma feature)
3. **Shared vs Feature**: `components/ui` e `components/charts` são compartilhados, features são isoladas
4. **Pages como Orchestrators**: Pages apenas compõem features, sem lógica de negócio
5. **Services isolados**: Toda comunicação com backend fica em `services/api/*`
6. **Types centralizados**: `types/database.types.ts` gerado automaticamente pelo Supabase CLI

### Convenções de Nomenclatura

- **Componentes**: PascalCase (e.g., `OEEGauge.tsx`)
- **Hooks**: camelCase com `use` prefix (e.g., `useAuth.ts`)
- **Services**: camelCase com `.api.ts` suffix (e.g., `lote.api.ts`)
- **Types**: PascalCase para interfaces/types (e.g., `Lote`, `ApontamentoParada`)
- **Utilitários**: camelCase (e.g., `formatOEE()`)
- **Constantes**: UPPER_SNAKE_CASE (e.g., `MAX_PARADAS_PER_LOTE`)

---

## Component Standards

### Component Template

```typescript
/**
 * Nome do Componente
 *
 * Descrição breve do propósito do componente
 *
 * @example
 * ```tsx
 * <ComponentName prop1="value" prop2={123} />
 * ```
 */

import { ComponentProps, FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ========================================
// TYPES
// ========================================

export interface ComponentNameProps extends ComponentProps<'div'> {
  /**
   * Descrição da prop
   */
  prop1: string;

  /**
   * Descrição da prop opcional
   * @default false
   */
  prop2?: boolean;

  /**
   * Slot para conteúdo filho
   */
  children?: ReactNode;
}

// ========================================
// COMPONENT
// ========================================

export const ComponentName: FC<ComponentNameProps> = ({
  prop1,
  prop2 = false,
  children,
  className,
  ...rest
}) => {
  // ========================================
  // HOOKS
  // ========================================

  // State
  // const [state, setState] = useState<Type>(initialValue);

  // Context
  // const { contextValue } = useContext(SomeContext);

  // Custom hooks
  // const { data, isLoading } = useCustomHook();

  // ========================================
  // HANDLERS
  // ========================================

  // const handleEvent = (param: Type) => {
  //   // handler logic
  // };

  // ========================================
  // EFFECTS
  // ========================================

  // useEffect(() => {
  //   // effect logic
  // }, [dependencies]);

  // ========================================
  // COMPUTED VALUES
  // ========================================

  // const computedValue = useMemo(() => {
  //   return expensive();
  // }, [dependencies]);

  // ========================================
  // RENDER CONDITIONS
  // ========================================

  // if (isLoading) {
  //   return <Skeleton />;
  // }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      className={cn(
        "base-classes here",
        prop2 && "conditional-class",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

// ========================================
// DISPLAY NAME (útil para debugging)
// ========================================

ComponentName.displayName = 'ComponentName';
```

### Naming Conventions

#### 1. Arquivos e Componentes

| Tipo | Convenção | Exemplo | Localização |
|------|-----------|---------|-------------|
| **Componente UI** | PascalCase | `Button.tsx` | `src/components/ui/` |
| **Componente Feature** | PascalCase | `LoteForm.tsx` | `src/features/lote/components/` |
| **Componente de Página** | PascalCase | `Dashboard.tsx` | `src/pages/` |
| **Componente de Chart** | PascalCase com sufixo | `ParetoChart.tsx`, `OEEGauge.tsx` | `src/components/charts/` |
| **Componente de Layout** | PascalCase | `AppLayout.tsx`, `Sidebar.tsx` | `src/components/layout/` |

#### 2. Hooks

| Tipo | Convenção | Exemplo | Localização |
|------|-----------|---------|-------------|
| **Hook de Feature** | `use` + PascalCase | `useLote.ts`, `useApontamentos.ts` | `src/features/{feature}/hooks/` |
| **Hook Global** | `use` + PascalCase | `useDebounce.ts`, `useAuth.ts` | `src/hooks/` |
| **Hook de Query** | `use` + Entity + `Query` | `useLotesQuery.ts` | `src/features/{feature}/hooks/` |
| **Hook de Mutation** | `use` + Action + Entity | `useCreateLote.ts`, `useUpdateParada.ts` | `src/features/{feature}/hooks/` |

#### 3. Services e APIs

| Tipo | Convenção | Exemplo | Localização |
|------|-----------|---------|-------------|
| **API Service** | camelCase + `.api.ts` | `lote.api.ts`, `apontamento.api.ts` | `src/services/api/` |
| **Função de API** | verbo + Entity | `getLotes()`, `createApontamento()` | Dentro do arquivo `.api.ts` |
| **Supabase Client** | camelCase | `supabase.ts` | `src/services/` |

#### 4. Types e Interfaces

| Tipo | Convenção | Exemplo | Localização |
|------|-----------|---------|-------------|
| **Interface de Domínio** | PascalCase | `Lote`, `ApontamentoParada` | `src/types/{entity}.ts` |
| **Props de Componente** | ComponentName + `Props` | `LoteFormProps`, `OEEGaugeProps` | Junto ao componente |
| **Tipos de Banco** | PascalCase (gerado) | `Database`, `Tables<'tblote'>` | `src/types/database.types.ts` |
| **Enums** | PascalCase | `StatusLote`, `TipoParada` | `src/types/{entity}.ts` |
| **Tipos Utilitários** | PascalCase | `WithRequired<T>`, `Nullable<T>` | `src/types/index.ts` |

#### 5. Utilitários e Constantes

| Tipo | Convenção | Exemplo | Localização |
|------|-----------|---------|-------------|
| **Função Utilitária** | camelCase | `formatOEE()`, `calculateDisponibilidade()` | `src/lib/{purpose}.ts` |
| **Constante Global** | UPPER_SNAKE_CASE | `MAX_PARADAS_PER_LOTE`, `DEFAULT_OEE_META` | `src/lib/constants.ts` |
| **Constante Local** | UPPER_SNAKE_CASE | `DEBOUNCE_MS`, `ITEMS_PER_PAGE` | Dentro do arquivo que usa |

#### 6. Contextos

| Tipo | Convenção | Exemplo | Localização |
|------|-----------|---------|-------------|
| **Context** | Entity + `Context` | `AuthContext`, `ThemeContext` | `src/features/{feature}/context/` |
| **Provider** | Entity + `Provider` | `AuthProvider`, `QueryProvider` | Junto ao Context |
| **Hook de Context** | `use` + Entity | `useAuth()`, `useTheme()` | Junto ao Context |

#### 7. Schemas de Validação (Zod)

| Tipo | Convenção | Exemplo | Localização |
|------|-----------|---------|-------------|
| **Schema** | entity + `Schema` | `loteSchema`, `apontamentoParadaSchema` | `src/lib/validation.ts` |
| **Schema de Form** | formName + `FormSchema` | `createLoteFormSchema` | Junto ao componente de form |

#### 8. Testes

| Tipo | Convenção | Exemplo | Localização |
|------|-----------|---------|-------------|
| **Unit Test** | ComponentName + `.test.tsx` | `LoteForm.test.tsx` | `tests/unit/components/` |
| **Hook Test** | hookName + `.test.ts` | `useLote.test.ts` | `tests/unit/hooks/` |
| **E2E Test** | feature + `.spec.ts` | `apontamento.spec.ts` | `tests/e2e/` |

### Padrões Adicionais

#### Props Destructuring Order
```typescript
export const Component: FC<Props> = ({
  // 1. Required props
  requiredProp,

  // 2. Optional props (with defaults)
  optionalProp = 'default',

  // 3. Callback props
  onClick,
  onChange,

  // 4. Children
  children,

  // 5. HTML/DOM props
  className,
  ...rest
}) => {
  // ...
};
```

#### Import Order
```typescript
// 1. React imports
import { FC, useState, useEffect } from 'react';

// 2. External libraries
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

// 3. Internal components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Internal utilities
import { cn } from '@/lib/utils';
import { formatOEE } from '@/lib/format';

// 5. Types
import type { Lote } from '@/types/lote';

// 6. Styles/Assets
import './styles.css';
```

#### Boolean Props
- Use `is`, `has`, `should` prefixes
- Examples: `isLoading`, `hasError`, `shouldValidate`

#### Event Handlers
- Use `handle` prefix
- Examples: `handleClick`, `handleSubmit`, `handleChange`

---

## State Management

### Arquitetura de Estado

O Sistema OEE usa uma estratégia **híbrida** de gerenciamento de estado:

- **React Query (@tanstack/react-query)**: Para **server state** (dados do Supabase)
- **Context API**: Para **client state global** (autenticação, tema, preferências)
- **useState/useReducer**: Para **estado local** de componentes

```
┌─────────────────────────────────────────────────┐
│              React Query                         │
│  (Server State - Dados do Supabase)             │
│                                                  │
│  • Lotes, Apontamentos, Linhas, SKUs            │
│  • OEE Calculado, Relatórios                    │
│  • Cache automático, refetch, optimistic        │
└─────────────────────────────────────────────────┘
                      ↕
┌─────────────────────────────────────────────────┐
│            Context API                           │
│  (Client State Global)                          │
│                                                  │
│  • AuthContext (usuário, permissões)            │
│  • ThemeContext (light/dark mode)               │
│  • LinhaContext (linha selecionada)             │
└─────────────────────────────────────────────────┘
                      ↕
┌─────────────────────────────────────────────────┐
│      useState/useReducer                         │
│  (Local Component State)                        │
│                                                  │
│  • Form state (inputs temporários)              │
│  • UI state (modals open/close)                 │
│  • Drag-and-drop state                          │
└─────────────────────────────────────────────────┘
```

### Store Structure

```
src/features/{feature}/hooks/
├── useLotes.ts              # Queries de lotes
├── useCreateLote.ts         # Mutation para criar
├── useUpdateLote.ts         # Mutation para atualizar
├── useApontamentos.ts       # Queries de apontamentos
└── useDashboardData.ts      # Queries compostas
```

### State Management Template (React Query)

```typescript
// src/features/lote/hooks/useLotes.ts

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getLotes } from '@/services/api/lote.api';
import type { Lote } from '@/types/lote';

export interface UseLotesParams {
  linhaId?: string;
  status?: 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  dataInicio?: Date;
  dataFim?: Date;
}

export const useLotes = (params: UseLotesParams): UseQueryResult<Lote[], Error> => {
  return useQuery({
    queryKey: ['lotes', params],
    queryFn: () => getLotes(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 3,
    enabled: true,
  });
};

// Mutation example
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLote } from '@/services/api/lote.api';

export const useCreateLote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLote,
    onSuccess: (newLote) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['lotes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      console.error('Erro ao criar lote:', error);
    },
  });
};
```

### Context API Template

```typescript
// src/features/auth/context/AuthContext.tsx

import { createContext, useContext, useEffect, useState, ReactNode, FC } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';

// Types
export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Provider
export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value: AuthContextValue = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Query Keys Convention

```typescript
// src/lib/query-keys.ts

export const queryKeys = {
  lotes: {
    all: ['lotes'] as const,
    lists: () => [...queryKeys.lotes.all, 'list'] as const,
    list: (filters: object) => [...queryKeys.lotes.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.lotes.all, 'detail', id] as const,
  },

  apontamentos: {
    all: ['apontamentos'] as const,
    paradas: (loteId?: string) => [...queryKeys.apontamentos.all, 'paradas', loteId] as const,
    producao: (loteId?: string) => [...queryKeys.apontamentos.all, 'producao', loteId] as const,
  },

  oee: {
    all: ['oee'] as const,
    dashboard: (linhaId?: string) => [...queryKeys.oee.all, 'dashboard', linhaId] as const,
  },
} as const;
```

### Realtime com Supabase

```typescript
// src/hooks/useRealtime.ts

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';

export const useRealtimeLotes = (linhaId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('lotes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tblote',
          filter: linhaId ? `linha_id=eq.${linhaId}` : undefined,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['lotes'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [linhaId, queryClient]);
};
```

---

## API Integration

### Service Template

```typescript
// src/services/api/lote.api.ts

import { supabase } from '@/services/supabase';
import type { Database } from '@/types/database.types';
import type { Lote, CreateLoteDTO, UpdateLoteDTO } from '@/types/lote';

// Types
type LoteRow = Database['public']['Tables']['tblote']['Row'];
type LoteInsert = Database['public']['Tables']['tblote']['Insert'];

export interface GetLotesParams {
  linhaId?: string;
  status?: 'PLANEJADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  dataInicio?: Date;
  dataFim?: Date;
  limit?: number;
}

// QUERIES
export async function getLotes(params: GetLotesParams = {}): Promise<Lote[]> {
  const { linhaId, status, dataInicio, dataFim, limit = 100 } = params;

  let query = supabase
  .from('tblote')
  .select(`*, linha:tblinha(*), sku:tbsku(*), turno:tbturno(*)`)
    .order('data_producao', { ascending: false })
    .limit(limit);

  if (linhaId) query = query.eq('linha_id', linhaId);
  if (status) query = query.eq('status', status);
  if (dataInicio) query = query.gte('data_producao', dataInicio.toISOString());
  if (dataFim) query = query.lte('data_producao', dataFim.toISOString());

  const { data, error } = await query;

  if (error) throw new Error(`Erro ao buscar lotes: ${error.message}`);
  return data as Lote[];
}

// MUTATIONS
export async function createLote(dto: CreateLoteDTO): Promise<Lote> {
  const { data, error } = await supabase
  .from('tblote')
    .insert({
      numero_lote: dto.numeroLote,
      linha_id: dto.linhaId,
      sku_id: dto.skuId,
      turno_id: dto.turnoId,
      data_producao: dto.dataProducao,
      status: 'EM_ANDAMENTO',
    } as LoteInsert)
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar lote: ${error.message}`);
  return data as Lote;
}
```

### API Client Configuration

```typescript
// src/services/supabase.ts

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
```

### Error Handling

```typescript
// src/lib/error-handling.ts

export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function handleSupabaseError<T>(
  operation: () => Promise<{ data: T | null; error: Error | null }>
): Promise<T> {
  const { data, error } = await operation();

  if (error) {
    if (error.message.includes('unique')) {
      throw new ApiError('Registro duplicado', 'DUPLICATE_ENTRY', 409);
    }
    throw new ApiError(error.message, 'UNKNOWN_ERROR', 500);
  }

  if (!data) {
    throw new ApiError('Nenhum dado retornado', 'NO_DATA', 404);
  }

  return data;
}
```

### Generating Database Types

```bash
# Instalar Supabase CLI
npm install -g supabase

# Link com projeto
supabase link --project-ref <your-project-ref>

# Gerar types TypeScript
supabase gen types typescript --linked > src/types/database.types.ts
```

---

## Routing

### Route Configuration

```typescript
// src/config/routes.ts

export const routes = {
  home: '/',
  dashboard: '/dashboard',
  operacao: '/operacao',
  lotes: '/lotes',
  loteDetail: (id: string) => `/lotes/${id}`,
  apontamentos: '/apontamentos',
  diarioBordo: '/diario-bordo',
  relatorios: '/relatorios',
  cadastros: '/cadastros',
  login: '/login',
} as const;

// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/operacao" element={<Operacao />} />
              <Route path="/lotes" element={<Lotes />} />
              <Route path="/lotes/:id" element={<LoteDetail />} />
              <Route path="/apontamentos" element={<Apontamentos />} />
              <Route path="/diario-bordo" element={<DiarioBordo />} />
              <Route path="/relatorios" element={<Relatorios />} />

              {/* Admin only */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'GESTOR']} />}>
                <Route path="/cadastros" element={<Cadastros />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};
```

### Protected Route Component

```typescript
// src/features/auth/components/ProtectedRoute.tsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import type { TipoUsuario } from '@/types/database.types';

interface ProtectedRouteProps {
  allowedRoles?: TipoUsuario[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.tipo_usuario)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
```

---

## Styling Guidelines

### TailwindCSS + CSS Variables

```css
/* src/styles/themes.css */

@layer base {
  :root {
    /* Colors - Light Mode */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;

    /* Spacing */
    --radius: 0.5rem;

    /* Farmace Brand Colors */
    --brand-blue: 210 100% 50%;
    --brand-green: 142 71% 45%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
  }
}
```

### Component Styling Pattern

```typescript
// Usar cn() utility para combinar classes

import { cn } from '@/lib/utils';

export const Card = ({ className, ...props }) => (
  <div
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
);
```

### Dark Mode

```typescript
// src/App.tsx

import { ThemeProvider } from 'next-themes';

export const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    {/* ... */}
  </ThemeProvider>
);

// Usar em componentes:
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();
```

---

## Testing Requirements

### Component Test Template

```typescript
// tests/unit/components/LoteCard.test.tsx

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoteCard } from '@/features/lote/components/LoteCard';

describe('LoteCard', () => {
  it('should render lote information', () => {
    const lote = {
      id: '1',
      numero_lote: 'L001',
      status: 'EM_ANDAMENTO',
    };

    render(<LoteCard lote={lote} />);

    expect(screen.getByText('L001')).toBeInTheDocument();
    expect(screen.getByText('EM_ANDAMENTO')).toBeInTheDocument();
  });
});
```

### Testing Best Practices

1. **Unit Tests**: Test individual components in isolation
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test critical user flows (using Playwright)
4. **Coverage Goals**: Aim for 80% code coverage
5. **Test Structure**: Arrange-Act-Assert pattern
6. **Mock External Dependencies**: API calls, routing, state management

### Vitest Configuration

```typescript
// vitest.config.ts

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

## Environment Configuration

### Environment Variables

```bash
# .env.example

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# App
VITE_APP_NAME=SysOEE
VITE_APP_VERSION=1.0.0

# Features
VITE_ENABLE_REALTIME=true
VITE_ENABLE_DEVTOOLS=true
```

### Validation (Zod)

```typescript
// src/config/env.ts

import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_APP_NAME: z.string().default('SysOEE'),
  VITE_ENABLE_REALTIME: z.string().transform(val => val === 'true').default('true'),
});

export const env = envSchema.parse(import.meta.env);
```

---

## Frontend Developer Standards

### Critical Coding Rules

1. **SEMPRE use path alias `@/`** - Não use `../../` imports relativos
2. **SEMPRE type props com interfaces** - Nunca use `any` ou omita tipos
3. **SEMPRE use React Query para dados do servidor** - Não use useState para API
4. **SEMPRE use Shadcn components** - Não crie componentes UI do zero
5. **SEMPRE use `cn()` utility** - Para combinar classes TailwindCSS
6. **SEMPRE handle loading/error states** - Não assuma que data existe
7. **SEMPRE use Zod para validação** - Em formulários e API responses
8. **SEMPRE use hooks customizados** - Para lógica reutilizável
9. **NUNCA commite `.env.local`** - Apenas `.env.example`
10. **NUNCA use `console.log` em produção** - Use proper logging

### Quick Reference

```bash
# Comandos úteis
npm run dev           # Dev server (http://localhost:5173)
npm run build         # Build para produção
npm run preview       # Preview build
npm run lint          # Lint código
npm run test          # Rodar testes (Vitest)
npm run test:ui       # Testes com UI
npm run test:e2e      # E2E tests (Playwright)

# Shadcn
npx shadcn@latest add button    # Adicionar componente
npx shadcn@latest add form      # Adicionar form components

# Supabase
supabase gen types typescript --linked > src/types/database.types.ts
```

### Import Patterns

```typescript
// ✅ CORRETO
import { Button } from '@/components/ui/button';
import { useLotes } from '@/features/lote/hooks/useLotes';
import type { Lote } from '@/types/lote';

// ❌ ERRADO
import { Button } from '../../../components/ui/button';
import { useLotes } from '../../hooks/useLotes';
```

### File Naming

- **Componentes**: `PascalCase.tsx`
- **Hooks**: `usePascalCase.ts`
- **Utils**: `camelCase.ts`
- **Types**: `camelCase.ts`
- **Constants**: `UPPER_SNAKE_CASE` (dentro de arquivos)

---

