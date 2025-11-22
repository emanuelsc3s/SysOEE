# Padrões Avançados e Boas Práticas

## 1. Gerenciamento de Estado Complexo

### Padrão: Estado Derivado com useMemo

Use `useMemo` para computações pesadas que dependem de estado:

```typescript
// ❌ Ruim - Recalcula a cada render
const sortedProdutos = produtos.sort((a, b) => {
  // lógica de ordenação complexa
})

// ✅ Bom - Só recalcula quando dependências mudam
const sortedProdutos = useMemo(() => {
  if (!sortField || !sortDirection) return produtos
  
  return [...produtos].sort((a, b) => {
    // lógica de ordenação complexa
  })
}, [produtos, sortField, sortDirection])
```

### Padrão: Callbacks Otimizados com useCallback

Use `useCallback` para funções passadas como props:

```typescript
// ❌ Ruim - Cria nova função a cada render
const handleEdit = (produto: ProdutoFormData) => {
  setProdutoDialogMode('edit')
  setCurrentProduto(produto)
  setIsProdutoDialogOpen(true)
}

// ✅ Bom - Memoriza a função
const handleEdit = useCallback((produto: ProdutoFormData) => {
  setProdutoDialogMode('edit')
  setCurrentProduto(produto)
  setIsProdutoDialogOpen(true)
}, []) // Dependências vazias se não usa estado externo
```

## 2. Tratamento de Erros Robusto

### Padrão: Try-Catch com Feedback Específico

```typescript
const handleSave = async () => {
  try {
    // Validações
    if (!formData.orgaoId) {
      throw new Error('Selecione um órgão licitante')
    }
    
    // Operação
    await saveLicitacao(formData)
    
    // Sucesso
    toast({
      title: "Sucesso",
      description: "Licitação salva com sucesso",
      variant: "default"
    })
    
    navigate('/licitacoes')
  } catch (error) {
    // Erro específico
    if (error instanceof Error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive"
      })
    } else {
      // Erro genérico
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao salvar a licitação",
        variant: "destructive"
      })
    }
    
    // Log para debug
    console.error('Erro ao salvar licitação:', error)
  }
}
```

### Padrão: Error Boundary para Componentes

```typescript
// src/components/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="container mx-auto py-6">
          <Card>
            <CardHeader>
              <CardTitle>Ops! Algo deu errado</CardTitle>
              <CardDescription>
                Ocorreu um erro inesperado. Por favor, tente novamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                {this.state.error?.message}
              </p>
              <Button onClick={() => window.location.reload()}>
                Recarregar Página
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
```

### Uso do ErrorBoundary

```typescript
// No App.tsx ou em rotas específicas
<ErrorBoundary>
  <LicitacoesCad />
</ErrorBoundary>
```

## 3. Performance e Otimização

### Padrão: Lazy Loading de Componentes

```typescript
// Importação lazy
import { lazy, Suspense } from 'react'

const LicitacoesCad = lazy(() => import('@/pages/LicitacoesCad'))

// Uso com Suspense
<Suspense fallback={<div>Carregando...</div>}>
  <LicitacoesCad />
</Suspense>
```

### Padrão: Virtualização de Listas Grandes

Para listas com muitos itens, use virtualização:

```typescript
// Instalar: npm install @tanstack/react-virtual

import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

function VirtualizedList({ items }: { items: any[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Altura estimada de cada item
  })

  return (
    <div ref={parentRef} className="h-[500px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {/* Renderizar item */}
            {items[virtualItem.index].nome}
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 4. Acessibilidade (a11y)

### Padrão: Labels Adequados

```typescript
// ✅ Bom - Label associado ao input
<div className="space-y-2">
  <Label htmlFor="nome">Nome *</Label>
  <Input id="nome" name="nome" />
</div>

// ❌ Ruim - Sem label ou label não associado
<div>
  <span>Nome</span>
  <Input />
</div>
```

### Padrão: Navegação por Teclado

```typescript
// Garantir que elementos interativos sejam acessíveis por teclado
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
  Clique aqui
</div>
```

### Padrão: ARIA Labels

```typescript
// Para ícones sem texto
<Button aria-label="Excluir produto">
  <Trash className="h-4 w-4" />
</Button>

// Para estados de loading
<Button disabled={loading} aria-busy={loading}>
  {loading ? 'Salvando...' : 'Salvar'}
</Button>
```

## 5. Segurança

### Padrão: Sanitização de Inputs

```typescript
// Prevenir SQL Injection em queries customizadas
const sanitizeInput = (input: string): string => {
  return input.replace(/'/g, "''") // Escapar aspas simples
}

const searchTerm = sanitizeInput(userInput)
const sqlQuery = `SELECT * FROM table WHERE nome ILIKE '%${searchTerm}%'`
```

### Padrão: Validação de Permissões

```typescript
// Verificar permissões antes de operações sensíveis
const handleDelete = async () => {
  // Verificar se usuário tem permissão
  const hasPermission = await checkUserPermission('delete_licitacao')
  
  if (!hasPermission) {
    toast({
      title: "Sem permissão",
      description: "Você não tem permissão para excluir licitações",
      variant: "destructive"
    })
    return
  }
  
  // Continuar com exclusão
  await deleteLicitacao(id)
}
```

## 6. Testes

### Padrão: Testes de Componentes

```typescript
// src/__tests__/LicitacoesCad.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LicitacoesCad from '@/pages/LicitacoesCad'

describe('LicitacoesCad', () => {
  it('deve renderizar o formulário', () => {
    render(
      <BrowserRouter>
        <LicitacoesCad />
      </BrowserRouter>
    )
    
    expect(screen.getByLabelText(/Órgão Licitante/i)).toBeInTheDocument()
  })

  it('deve validar campos obrigatórios', async () => {
    render(
      <BrowserRouter>
        <LicitacoesCad />
      </BrowserRouter>
    )
    
    const saveButton = screen.getByText(/Salvar/i)
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText(/obrigatório/i)).toBeInTheDocument()
    })
  })
})
```

## 7. Documentação de Código

### Padrão: JSDoc para Funções Complexas

```typescript
/**
 * Busca licitações com filtros e paginação
 * 
 * @param filters - Objeto com filtros opcionais
 * @param filters.search_term - Termo de busca geral
 * @param filters.page - Número da página (1-based)
 * @param filters.itemsPerPage - Itens por página
 * @returns Promise com dados e contagem total
 * 
 * @example
 * const { data, count } = await fetchLicitacoes({
 *   search_term: 'pregão',
 *   page: 1,
 *   itemsPerPage: 10
 * })
 */
const fetchLicitacoes = async (filters?: FilterOptions) => {
  // implementação
}
```
