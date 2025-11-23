# Checklist de Implementação

## 📋 Visão Geral

Este checklist serve como guia passo a passo para implementar uma nova página de listagem com CRUD no SysOEE, seguindo os padrões estabelecidos na página de Turnos.

---

## ✅ Fase 1: Preparação

### 1.1. Definir Estrutura de Dados

- [ ] Criar interface TypeScript para dados da UI (`*FormData`)
- [ ] Criar interface TypeScript para dados do banco (`*DB`)
- [ ] Criar funções de mapeamento (`mapDbToForm`, `mapFormToDb`)
- [ ] Definir validações de dados
- [ ] Criar funções utilitárias (formatação, cálculos)

**Exemplo:**
```typescript
// src/types/minha-entidade.ts
export interface MinhaEntidadeFormData {
  id?: string
  codigo: string
  nome: string
  // ... outros campos
}

export interface MinhaEntidadeDB {
  entidade_id: number
  codigo: string
  nome: string | null
  // ... outros campos
}
```

### 1.2. Criar Hook Customizado

- [ ] Criar arquivo `src/hooks/useMinhaEntidade.ts`
- [ ] Implementar `fetchEntidades(filters?)`
- [ ] Implementar `fetchEntidade(id)`
- [ ] Implementar `saveEntidade(formData)`
- [ ] Implementar `deleteEntidade(id)` (soft delete)
- [ ] Adicionar tratamento de erros com toast
- [ ] Adicionar campos de auditoria (created_at, updated_at, etc.)

**Template:**
```typescript
export function useMinhaEntidade() {
  const [loading, setLoading] = useState(false)
  
  const fetchEntidades = async (filters?) => { /* ... */ }
  const fetchEntidade = async (id) => { /* ... */ }
  const saveEntidade = async (formData) => { /* ... */ }
  const deleteEntidade = async (id) => { /* ... */ }
  
  return { loading, fetchEntidades, fetchEntidade, saveEntidade, deleteEntidade }
}
```

---

## ✅ Fase 2: Estrutura da Página

### 2.1. Criar Arquivo da Página

- [ ] Criar `src/pages/MinhaEntidade.tsx`
- [ ] Importar dependências necessárias
- [ ] Definir constantes do módulo (`PAGE_SIZE_STORAGE_KEY`, `PAGE_SIZE_OPTIONS`)
- [ ] Criar componente funcional exportado

### 2.2. Configurar Hooks

- [ ] `useNavigate()` para navegação
- [ ] `useSearchParams()` para sincronização com URL
- [ ] Hook customizado (`useMinhaEntidade()`)
- [ ] Estados locais (busca, paginação, filtros, modais)
- [ ] Refs necessários (`tableContainerRef`, `paginationRef`)

**Template:**
```typescript
export default function MinhaEntidade() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { fetchEntidades, deleteEntidade } = useMinhaEntidade()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(() => {
    const p = Number(searchParams.get('page'))
    return Number.isFinite(p) && p > 0 ? p : 1
  })
  const [itemsPerPage, setItemsPerPage] = useState(25)
  
  // ... outros estados
}
```

### 2.3. Configurar React Query

- [ ] Definir `queryKey` dinâmica (incluir página, busca, filtros)
- [ ] Implementar `queryFn` com filtros locais e paginação
- [ ] Configurar `staleTime` (5 minutos)
- [ ] Configurar `gcTime` (10 minutos)
- [ ] Desestruturar `data`, `isLoading`, `isFetching`, `error`, `refetch`

**Template:**
```typescript
const { data, isLoading, isFetching, error, refetch } = useQuery({
  queryKey: ['minha-entidade', currentPage, itemsPerPage, searchTerm, appliedFilters],
  queryFn: async () => {
    const result = await fetchEntidades({ /* filtros */ })
    let filteredData = result.data || []
    
    // Aplicar busca
    if (searchTerm) { /* ... */ }
    
    // Aplicar filtros locais
    // ...
    
    // Paginação local
    const totalItems = filteredData.length
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedData = filteredData.slice(startIndex, endIndex)
    
    return { data: paginatedData, count: totalItems }
  },
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
})
```

---

## ✅ Fase 3: Layout e UI

### 3.1. Cabeçalho da Página

- [ ] Container com `flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`
- [ ] Título da página (`text-2xl font-bold text-[#1f2937]`)
- [ ] Descrição da página (`text-gray-500`)
- [ ] Botão "Novo" com ícone `Plus` e cor `#242f65`

**Template:**
```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div>
    <h1 className="text-2xl font-bold text-[#1f2937]">Minha Entidade</h1>
    <p className="text-gray-500">Descrição da funcionalidade</p>
  </div>
  <Button
    className="bg-[#242f65] hover:bg-[#1a2148] flex items-center gap-2"
    onClick={() => navigate('/minha-entidade/novo')}
  >
    <Plus className="h-4 w-4" />
    Novo
  </Button>
</div>
```

### 3.2. Card Principal

- [ ] Container com `bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden mb-6`
- [ ] Cabeçalho do card com título e contador
- [ ] Indicadores de loading/erro
- [ ] Barra de busca e ações
- [ ] Tabela de dados
- [ ] Componente `DataPagination`

### 3.3. Barra de Busca e Ações

- [ ] Input de busca com ícone `Search`
- [ ] Botão "Filtros" com `Dialog` e contador de filtros ativos
- [ ] Botão "Atualizar" com ícone `RefreshCw` (animação de spin)

**Template:**
```tsx
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
  <div className="relative w-full md:flex-1 max-w-none">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
    <Input
      type="text"
      placeholder="Pesquisar..."
      className="pl-10 py-2 w-full border border-gray-200 rounded-md"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
  <div className="flex gap-2 md:shrink-0">
    {/* Botões Filtros e Atualizar */}
  </div>
</div>
```

### 3.4. Tabela de Dados

- [ ] Estrutura `<table>` com classes responsivas
- [ ] `<thead>` com colunas apropriadas
- [ ] `<tbody>` com `divide-y divide-gray-200`
- [ ] Linhas clicáveis (`hover:bg-gray-50 cursor-pointer`)
- [ ] Botões de ação (Visualizar, Editar, Excluir)
- [ ] Empty state (sem dados / erro)
- [ ] Loading overlay (`isFetching`)

---

## ✅ Fase 4: Funcionalidades

### 4.1. Sistema de Filtros

- [ ] Estado `appliedFilters` (filtros ativos)
- [ ] Estado `draftFilters` (filtros em edição)
- [ ] `Dialog` para modal de filtros
- [ ] Campos de filtro com `Label` e `Input`
- [ ] Botão "Aplicar Filtros"
- [ ] Botão "Limpar Filtros"
- [ ] Contador de filtros ativos (`useMemo`)
- [ ] Badge com contador no botão "Filtros"

### 4.2. Paginação

- [ ] Componente `DataPagination` importado
- [ ] Props configuradas corretamente
- [ ] Handler `handlePageChange` com sincronização de URL
- [ ] Handler `onItemsPerPageChange` com localStorage
- [ ] Reset de página ao mudar busca/filtros

### 4.3. CRUD

- [ ] Navegação para formulário de criação
- [ ] Navegação para visualização (com preservação de página)
- [ ] Navegação para edição (com preservação de página)
- [ ] `AlertDialog` para confirmação de exclusão
- [ ] Handler de exclusão com `refetch` após sucesso

---

## ✅ Fase 5: Responsividade

### 5.1. Breakpoints

- [ ] Mobile: Layout empilhado (`flex-col`)
- [ ] Tablet: Layout horizontal (`sm:flex-row`)
- [ ] Desktop: Padding aumentado (`md:px-6`, `lg:px-8`)

### 5.2. Tabela

- [ ] Padding responsivo nas células (`px-4 md:px-6`)
- [ ] Scroll horizontal em telas pequenas (se necessário)
- [ ] Colunas ocultas em mobile (se necessário)

---

## ✅ Fase 6: Acessibilidade

- [ ] Labels associados a inputs (`htmlFor` + `id`)
- [ ] Botões com `title` para tooltips
- [ ] Linhas da tabela com `tabIndex={0}` e `onKeyDown`
- [ ] Estados de foco visíveis (`focus-visible:ring-1`)
- [ ] Contraste de cores adequado (WCAG AA mínimo)

---

## ✅ Fase 7: Performance

- [ ] Constantes no escopo do módulo
- [ ] Lazy initialization de estados
- [ ] `useMemo` para cálculos derivados
- [ ] React Query cache configurado
- [ ] Paginação local (evitar requisições desnecessárias)

---

## ✅ Fase 8: Tratamento de Erros

- [ ] Try-catch em operações de localStorage
- [ ] Try-catch em operações de URL params
- [ ] Feedback visual de erro (botão "Tentar novamente")
- [ ] Empty states diferenciados (erro vs sem dados)
- [ ] Toast notifications (sucesso/erro)

---

## ✅ Fase 9: Testes e Validação

### 9.1. Testes Manuais

- [ ] Criar novo registro
- [ ] Visualizar registro
- [ ] Editar registro
- [ ] Excluir registro
- [ ] Buscar por termo
- [ ] Aplicar filtros
- [ ] Limpar filtros
- [ ] Navegar entre páginas
- [ ] Mudar itens por página
- [ ] Atualizar lista
- [ ] Testar em mobile
- [ ] Testar em tablet
- [ ] Testar em desktop
- [ ] Testar navegação por teclado
- [ ] Testar com leitor de tela

### 9.2. Validações

- [ ] URL reflete estado da página
- [ ] localStorage persiste preferências
- [ ] Voltar/Avançar do navegador funciona
- [ ] Refresh da página mantém estado
- [ ] Loading states aparecem corretamente
- [ ] Erros são tratados graciosamente
- [ ] Empty states são exibidos corretamente

---

## 📦 Dependências Necessárias

```json
{
  "@tanstack/react-query": "^5.56.2",
  "react": "^18.3.1",
  "react-router-dom": "^6.26.2",
  "lucide-react": "^0.462.0",
  "@radix-ui/react-dialog": "^1.1.2",
  "@radix-ui/react-alert-dialog": "^1.1.2",
  "@radix-ui/react-label": "^2.1.0",
  "@radix-ui/react-select": "^2.1.2",
  "tailwindcss": "^3.4.11"
}
```

---

## 🐛 Troubleshooting

### Problema: Página não reseta ao filtrar

**Solução:**
```typescript
useEffect(() => {
  setCurrentPage(1)
  const params = new URLSearchParams(searchParams)
  params.delete('page')
  setSearchParams(params, { replace: true })
}, [searchTerm, appliedFilters])
```

### Problema: localStorage não funciona

**Solução:** Sempre usar try-catch
```typescript
try {
  localStorage.setItem(key, value)
} catch { /* noop */ }
```

### Problema: React Query não revalida

**Solução:** Verificar se `queryKey` inclui todas as dependências
```typescript
queryKey: ['entidade', currentPage, itemsPerPage, searchTerm, appliedFilters]
```

### Problema: Tabela não rola em mobile

**Solução:** Adicionar container com overflow
```tsx
<div className="overflow-x-auto">
  <table>...</table>
</div>
```

---

**Fim do Checklist** ✅

