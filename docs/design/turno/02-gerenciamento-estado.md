# Gerenciamento de Estado

## 📊 Visão Geral

A página de Turnos utiliza uma combinação de estratégias de gerenciamento de estado para garantir performance, sincronização e persistência de dados:

1. **React Query** - Estado assíncrono (dados do servidor)
2. **useState** - Estado local da UI
3. **useSearchParams** - Sincronização com URL
4. **localStorage** - Persistência de preferências

---

## 🔄 React Query (@tanstack/react-query)

### Configuração Básica

```typescript
import { useQuery } from '@tanstack/react-query'

const {
  data: turnosData,
  isLoading,
  isFetching,
  error,
  refetch
} = useQuery({
  queryKey: [
    'turnos',
    currentPage,
    itemsPerPage,
    searchTerm,
    {
      codigo: appliedFilters.codigo,
      turno: appliedFilters.turno,
      metaOeeMin: appliedFilters.metaOeeMin,
      metaOeeMax: appliedFilters.metaOeeMax,
    },
  ],
  queryFn: async () => {
    const result = await fetchTurnos({
      codigo: appliedFilters.codigo || undefined,
      turno: appliedFilters.turno || undefined,
    })
    
    // Filtros locais e paginação
    let filteredData = result.data || []
    
    // Aplicar busca por termo
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filteredData = filteredData.filter(
        (turno) =>
          turno.codigo.toLowerCase().includes(term) ||
          turno.turno.toLowerCase().includes(term)
      )
    }
    
    // Aplicar filtros de meta OEE
    if (appliedFilters.metaOeeMin) {
      const min = parseFloat(appliedFilters.metaOeeMin)
      if (!isNaN(min)) {
        filteredData = filteredData.filter((turno) => turno.metaOee >= min)
      }
    }
    
    if (appliedFilters.metaOeeMax) {
      const max = parseFloat(appliedFilters.metaOeeMax)
      if (!isNaN(max)) {
        filteredData = filteredData.filter((turno) => turno.metaOee <= max)
      }
    }
    
    // Paginação local
    const totalItems = filteredData.length
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedData = filteredData.slice(startIndex, endIndex)
    
    return {
      data: paginatedData,
      count: totalItems
    }
  },
  staleTime: 5 * 60 * 1000,  // 5 minutos
  gcTime: 10 * 60 * 1000,    // 10 minutos (anteriormente cacheTime)
})
```

### Query Key Dinâmica

A `queryKey` é um array que identifica unicamente a consulta. Quando qualquer valor muda, o React Query automaticamente refaz a consulta:

```typescript
queryKey: [
  'turnos',           // Identificador base
  currentPage,        // Página atual
  itemsPerPage,       // Itens por página
  searchTerm,         // Termo de busca
  {                   // Filtros aplicados
    codigo: appliedFilters.codigo,
    turno: appliedFilters.turno,
    metaOeeMin: appliedFilters.metaOeeMin,
    metaOeeMax: appliedFilters.metaOeeMax,
  },
]
```

**Por quê?**
- ✅ Revalidação automática quando dependências mudam
- ✅ Cache inteligente (mesma query key = mesmos dados)
- ✅ Evita requisições duplicadas
- ✅ Sincronização entre componentes

### Configuração de Cache

```typescript
staleTime: 5 * 60 * 1000,  // 5 minutos
gcTime: 10 * 60 * 1000,    // 10 minutos
```

| Propriedade | Valor | Significado |
|-------------|-------|-------------|
| **staleTime** | 5 minutos | Dados são considerados "frescos" por 5 minutos |
| **gcTime** | 10 minutos | Dados em cache são mantidos por 10 minutos após não serem mais usados |

**Por quê?**
- ✅ Reduz requisições desnecessárias ao servidor
- ✅ Melhora performance percebida pelo usuário
- ✅ Economiza banda e recursos do servidor

### Estados do React Query

```typescript
const {
  data: turnosData,      // Dados retornados pela queryFn
  isLoading,             // true apenas no primeiro carregamento
  isFetching,            // true sempre que está buscando dados
  error,                 // Erro da última tentativa (se houver)
  refetch                // Função para forçar revalidação
} = useQuery({ ... })
```

**Diferença entre `isLoading` e `isFetching`:**

| Estado | Primeira Carga | Revalidação | Uso |
|--------|----------------|-------------|-----|
| `isLoading` | ✅ true | ❌ false | Skeleton/placeholder inicial |
| `isFetching` | ✅ true | ✅ true | Overlay de loading, spinner |

---

## 📝 Estados Locais (useState)

### 1. Estado de Busca

```typescript
const [searchTerm, setSearchTerm] = useState('')
```

**Uso:** Campo de busca em tempo real  
**Sincronização:** Automática via queryKey do React Query

### 2. Estado de Paginação

```typescript
const [currentPage, setCurrentPage] = useState(() => {
  const p = Number(searchParams.get('page'))
  return Number.isFinite(p) && p > 0 ? p : 1
})

const [itemsPerPage, setItemsPerPage] = useState(25)
```

**Inicialização Lazy:**
```typescript
useState(() => {
  // Função executada apenas uma vez na montagem
  const p = Number(searchParams.get('page'))
  return Number.isFinite(p) && p > 0 ? p : 1
})
```

**Por quê?**
- ✅ Evita cálculos desnecessários em cada render
- ✅ Sincroniza com URL na montagem
- ✅ Fallback seguro (página 1 se inválido)

### 3. Estado de Filtros

```typescript
// Filtros aplicados (usados na consulta)
const [appliedFilters, setAppliedFilters] = useState({
  codigo: '',
  turno: '',
  metaOeeMin: '',
  metaOeeMax: '',
})

// Filtros em edição (no modal)
const [draftFilters, setDraftFilters] = useState({
  codigo: '',
  turno: '',
  metaOeeMin: '',
  metaOeeMax: '',
})
```

**Padrão de Dois Estados:**
- `draftFilters` - Editado no modal (não afeta consulta)
- `appliedFilters` - Aplicado ao clicar "Aplicar Filtros"

**Por quê?**
- ✅ Usuário pode cancelar edição sem afetar filtros ativos
- ✅ Evita requisições a cada tecla digitada
- ✅ UX melhor (controle explícito de quando aplicar)

### 4. Estados de UI

```typescript
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
const [turnoToDelete, setTurnoToDelete] = useState<TurnoFormData | null>(null)
const [openFilterDialog, setOpenFilterDialog] = useState(false)
```

**Uso:** Controle de modais e dialogs

---

## 🔗 Sincronização com URL (useSearchParams)

### Leitura de Parâmetros

```typescript
const [searchParams, setSearchParams] = useSearchParams()

// Ler página da URL
const [currentPage, setCurrentPage] = useState(() => {
  const p = Number(searchParams.get('page'))
  return Number.isFinite(p) && p > 0 ? p : 1
})
```

### Atualização de Parâmetros

```typescript
const handlePageChange = (page: number) => {
  const next = Math.max(1, page)
  setCurrentPage(next)
  
  try {
    const params = new URLSearchParams(searchParams)
    if (next > 1) {
      params.set('page', String(next))
    } else {
      params.delete('page')  // Remove se página 1 (URL limpa)
    }
    setSearchParams(params, { replace: true })
  } catch { /* noop */ }
}
```

**Opções de `setSearchParams`:**
- `{ replace: true }` - Substitui entrada no histórico (não cria nova)
- `{ replace: false }` - Adiciona nova entrada no histórico

**Por quê usar `replace: true`?**
- ✅ Evita poluir histórico do navegador
- ✅ Botão "Voltar" funciona como esperado
- ✅ URL sempre reflete estado atual

---

## 💾 Persistência em localStorage

### Salvando Preferências

```typescript
const PAGE_SIZE_STORAGE_KEY = 'sysoee_turnos_items_per_page'

// Salvar ao mudar itens por página
try {
  localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(size))
} catch { /* noop */ }
```

### Carregando Preferências

```typescript
useEffect(() => {
  try {
    const raw = localStorage.getItem(PAGE_SIZE_STORAGE_KEY)
    const parsed = raw ? parseInt(raw, 10) : NaN
    if (PAGE_SIZE_OPTIONS.includes(parsed as any)) {
      setItemsPerPage(parsed)
    }
  } catch { /* noop */ }
}, [])
```

**Tratamento de Erros:**
- `try/catch` silencioso (`/* noop */`)
- Fallback para valor padrão se inválido
- Validação contra `PAGE_SIZE_OPTIONS`

**Por quê?**
- ✅ localStorage pode estar desabilitado (modo privado)
- ✅ Dados podem estar corrompidos
- ✅ Usuário pode ter editado manualmente

---

**Próximo:** [Funcionalidades →](./03-funcionalidades.md)

