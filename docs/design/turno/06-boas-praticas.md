# Boas Práticas

## 🎯 Visão Geral

Este documento descreve as boas práticas aplicadas na página de Turnos, cobrindo acessibilidade, performance, código limpo e tratamento de erros.

---

## ♿ Acessibilidade

### 1. Labels Semânticos

```tsx
<Label htmlFor="f-codigo">Código</Label>
<Input
  id="f-codigo"
  placeholder="Ex.: T1"
  value={draftFilters.codigo}
  onChange={(e) => setDraftFilters((p) => ({ ...p, codigo: e.target.value }))}
/>
```

**Por quê?**
- ✅ Leitores de tela anunciam o label ao focar no input
- ✅ Clicar no label foca o input (UX melhor)
- ✅ Conformidade com WCAG 2.1

### 2. ARIA Labels

```tsx
<Button
  variant="ghost"
  size="icon"
  className="h-8 w-8 text-[#242f65]"
  title="Visualizar"
  onClick={(e) => {
    e.preventDefault()
    e.stopPropagation()
    handleVisualizar(turno)
  }}
>
  <Eye className="h-4 w-4" />
</Button>
```

**Atributos:**
- `title` - Tooltip ao passar o mouse
- `aria-label` - Descrição para leitores de tela (implícito via title)

### 3. Navegação por Teclado

```tsx
<tr
  key={turno.id}
  className="hover:bg-gray-50 cursor-pointer"
  onClick={() => handleVisualizar(turno)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleVisualizar(turno)
    }
  }}
  tabIndex={0}
>
```

**Características:**
- ✅ `tabIndex={0}` - Permite foco via Tab
- ✅ `onKeyDown` - Ativa com Enter ou Espaço
- ✅ `cursor-pointer` - Indica interatividade

### 4. Estados de Foco Visíveis

```tsx
<Button className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
  Novo Turno
</Button>
```

**Características:**
- ✅ Anel de foco visível ao navegar por teclado
- ✅ Não aparece ao clicar com mouse (`focus-visible`)

### 5. Contraste de Cores

| Elemento | Cor Texto | Cor Fundo | Contraste | WCAG |
|----------|-----------|-----------|-----------|------|
| Botão Primário | `#ffffff` | `#242f65` | 8.59:1 | AAA ✅ |
| Texto Principal | `#1f2937` | `#ffffff` | 16.11:1 | AAA ✅ |
| Texto Secundário | `#6b7280` | `#ffffff` | 4.69:1 | AA ✅ |

---

## ⚡ Performance

### 1. Memoização com useMemo

```typescript
const appliedCount = useMemo(() => {
  let count = 0
  const f = appliedFilters
  if (f.codigo) count++
  if (f.turno) count++
  if (f.metaOeeMin) count++
  if (f.metaOeeMax) count++
  return count
}, [appliedFilters])
```

**Por quê?**
- ✅ Evita recálculo em cada render
- ✅ Só recalcula quando `appliedFilters` muda
- ✅ Melhora performance em listas grandes

### 2. Lazy Initialization de Estado

```typescript
const [currentPage, setCurrentPage] = useState(() => {
  const p = Number(searchParams.get('page'))
  return Number.isFinite(p) && p > 0 ? p : 1
})
```

**Por quê?**
- ✅ Função executada apenas uma vez (na montagem)
- ✅ Evita parsing da URL em cada render
- ✅ Melhora performance inicial

### 3. Constantes no Escopo do Módulo

```typescript
// Fora do componente
const PAGE_SIZE_STORAGE_KEY = 'sysoee_turnos_items_per_page'
const PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const
```

**Por quê?**
- ✅ Não recriadas em cada render
- ✅ Evita warnings de dependências em hooks
- ✅ Melhor para garbage collector

### 4. React Query Cache

```typescript
staleTime: 5 * 60 * 1000,  // 5 minutos
gcTime: 10 * 60 * 1000,    // 10 minutos
```

**Por quê?**
- ✅ Reduz requisições ao servidor
- ✅ Dados "frescos" por 5 minutos
- ✅ Cache mantido por 10 minutos
- ✅ Melhora experiência do usuário

### 5. Paginação Local

```typescript
// Paginação local (evita requisições ao servidor)
const totalItems = filteredData.length
const startIndex = (currentPage - 1) * itemsPerPage
const endIndex = startIndex + itemsPerPage
const paginatedData = filteredData.slice(startIndex, endIndex)
```

**Por quê?**
- ✅ Navegação instantânea entre páginas
- ✅ Reduz carga no servidor
- ✅ Funciona offline (dados em cache)

---

## 🧹 Código Limpo

### 1. Comentários em Português

```typescript
// Constantes estáveis no escopo do módulo para evitar warnings de dependências
const PAGE_SIZE_STORAGE_KEY = 'sysoee_turnos_items_per_page'

// Resetar página para 1 quando searchTerm ou filtros mudarem
useEffect(() => {
  setCurrentPage(1)
}, [searchTerm, appliedFilters])
```

**Por quê?**
- ✅ Equipe brasileira
- ✅ Facilita manutenção
- ✅ Reduz barreira de entrada para novos desenvolvedores

### 2. Nomenclatura Descritiva

```typescript
// ❌ Ruim
const h = () => { ... }
const d = { ... }

// ✅ Bom
const handlePageChange = (page: number) => { ... }
const draftFilters = { codigo: '', turno: '' }
```

### 3. Funções Pequenas e Focadas

```typescript
// Cada função tem uma responsabilidade única
const formatarHorario = (hora: string) => {
  if (!hora) return '-'
  return hora
}

const formatarMetaOEE = (meta: number) => {
  return `${meta.toFixed(1)}%`
}

const getBadgeMetaOEE = (meta: number) => {
  if (meta >= 90) return 'success'
  if (meta >= 85) return 'info'
  if (meta >= 80) return 'warning'
  return 'destructive'
}
```

### 4. Destructuring de Props

```typescript
// ✅ Bom
const { data, isLoading, isFetching, error, refetch } = useQuery({ ... })

// ❌ Ruim
const queryResult = useQuery({ ... })
const data = queryResult.data
const isLoading = queryResult.isLoading
```

### 5. Organização de Imports

```typescript
// 1. Hooks do React
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'

// 2. Hooks de roteamento
import { useNavigate, useSearchParams } from 'react-router-dom'

// 3. Componentes UI
import { Button } from '@/components/ui/button'

// 4. Hooks customizados
import { useTurnos } from '@/hooks/useTurnos'

// 5. Tipos
import { TurnoFormData } from '@/types/turno'

// 6. Ícones
import { Plus, Search } from 'lucide-react'

// 7. Bibliotecas externas
import { useQuery } from '@tanstack/react-query'
```

---

## 🛡️ Tratamento de Erros

### 1. Try-Catch Silencioso

```typescript
try {
  localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(size))
} catch { /* noop */ }
```

**Quando usar:**
- ✅ Operações não críticas (localStorage, URL params)
- ✅ Fallback automático já existe
- ✅ Erro não afeta funcionalidade principal

### 2. Try-Catch com Feedback

```typescript
try {
  await deleteTurno(turnoToDelete.id)
  setIsDeleteDialogOpen(false)
  setTurnoToDelete(null)
  await refetch()
} catch (error) {
  console.error('Erro ao excluir turno:', error)
  // Toast já exibido pelo hook useTurnos
}
```

**Quando usar:**
- ✅ Operações críticas (CRUD)
- ✅ Usuário precisa saber do erro
- ✅ Log para debugging

### 3. Estados de Erro na UI

```tsx
{error && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => refetch()}
    className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-300"
  >
    <AlertCircle className="h-4 w-4" />
    Tentar novamente
  </Button>
)}
```

**Características:**
- ✅ Feedback visual claro (cor vermelha)
- ✅ Ação de recuperação (botão "Tentar novamente")
- ✅ Ícone de alerta

### 4. Empty States

```tsx
{turnosList.length === 0 && !isLoading ? (
  <tr>
    <td colSpan={7} className="px-4 md:px-6 py-8 text-center">
      {error ? (
        <div className="flex flex-col items-center gap-3 text-red-500">
          <AlertCircle className="h-8 w-8" />
          <div>
            <p className="font-medium">Erro ao carregar turnos</p>
            <p className="text-sm text-gray-500">Verifique sua conexão e tente novamente</p>
          </div>
        </div>
      ) : (
        <div className="text-gray-500">
          {searchTerm || appliedCount > 0 ?
            'Nenhum turno encontrado com os filtros aplicados.' :
            'Nenhum turno cadastrado.'
          }
        </div>
      )}
    </td>
  </tr>
) : null}
```

**Características:**
- ✅ Diferencia erro de lista vazia
- ✅ Mensagem contextual (com/sem filtros)
- ✅ Ícone e cores apropriadas

### 5. Validação de Dados

```typescript
const handlePageChange = (page: number) => {
  const next = Math.max(1, page)  // Garante página >= 1
  setCurrentPage(next)
  // ...
}
```

**Características:**
- ✅ Valida entrada antes de usar
- ✅ Previne estados inválidos
- ✅ Evita bugs silenciosos

---

**Próximo:** [Checklist de Implementação →](./07-checklist-implementacao.md)

