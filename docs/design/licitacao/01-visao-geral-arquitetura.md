# Documentação de Design System - LicitacoesCad.tsx

## 1. Visão Geral e Arquitetura

### 1.1 Propósito do Componente

O componente `LicitacoesCad.tsx` é uma página completa de cadastro e edição de licitações que implementa um CRUD (Create, Read, Update, Delete) robusto com funcionalidades avançadas. Serve como referência para implementação de formulários complexos no sistema.

### 1.2 Estrutura Geral

```
LicitacoesCad/
├── Formulário Principal (Licitação)
│   ├── Informações Básicas
│   ├── Datas e Vigências
│   ├── Órgão e Cliente (com LOV)
│   └── Observações
├── Gestão de Produtos
│   ├── Tabela com Ordenação
│   ├── Modal de Produto (3 abas)
│   └── CRUD de Produtos
├── Gestão de Concorrentes
│   ├── Listagem
│   └── Formulário Inline
├── Gestão de Documentos
│   ├── Upload para Storage
│   ├── Visualização
│   └── Download/Exclusão
└── Informações Complementares
```

### 1.3 Padrões de Organização

#### Separação de Responsabilidades

1. **Estado Local**: Gerenciado com `useState` para formulários e UI
2. **Estado do Servidor**: Gerenciado com hooks customizados (React Query pattern)
3. **Lógica de Negócio**: Encapsulada em hooks customizados
4. **Validação**: Implementada antes de operações críticas
5. **Feedback**: Toast notifications para todas as operações

#### Hierarquia de Componentes

```typescript
LicitacoesCad (Container)
├── Tabs (shadcn/ui)
│   ├── TabsContent: Informações e Produtos
│   │   ├── Card: Informações Básicas
│   │   └── Card: Produtos Licitados
│   │       └── Table com ordenação
│   ├── TabsContent: Concorrentes
│   │   └── Card com Table
│   ├── TabsContent: Documentos
│   │   └── Card com Table e Upload
│   └── TabsContent: Informação Complementar
│       └── Card com campos adicionais
├── Dialog: Produto (Modal complexo com 3 abas)
├── Dialog: Órgão Licitante (LOV)
├── Dialog: Cliente (LOV)
├── Dialog: Produto Catálogo (LOV)
├── Dialog: Concorrente (LOV com CRUD inline)
└── AlertDialog: Confirmações de exclusão
```

### 1.4 Dependências Principais

```typescript
// React e Roteamento
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'

// Componentes UI (shadcn/ui)
import { Button, Input, Textarea, Select, Card, Tabs, Table, Dialog, AlertDialog, Checkbox, Label } from '@/components/ui/*'

// Ícones
import { ArrowLeft, Save, Trash, Eye, Pencil, Search, Download, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"

// Hooks Customizados
import { useLicitacoes } from '@/hooks/useLicitacoes'
import { useProdutosLicitacao } from '@/hooks/useProdutosLicitacao'
import { useClientes } from '@/hooks/useClientes'
import { useProdutos } from '@/hooks/useProdutos'
import { useConcorrentes } from '@/hooks/useConcorrentes'

// Tipos
import { LicitacaoFormData } from '@/types/licitacao-type'
import { ProdutoFormData } from '@/types/produto-type'

// Utilitários
import { toast } from '@/hooks/use-toast'
import { supabase, handleSupabaseError } from '@/lib/supabase'
import { formatNumberBR } from '@/lib/number-format'
```

### 1.5 Fluxo de Dados

```
Usuário → Componente → Hook Customizado → Supabase → Banco de Dados
                ↓                              ↓
            Estado Local                   Toast Feedback
                ↓
            Renderização
```

### 1.6 Padrões de Estado

#### Estado do Formulário Principal
```typescript
const [formData, setFormData] = useState<LicitacaoFormData>({
  dataAbertura: "",
  horaAbertura: "",
  origem: undefined,
  status: undefined,
  // ... outros campos
})
```

#### Estado de Produtos
```typescript
const [produtos, setProdutos] = useState<ProdutoFormData[]>([])
const [produtoForm, setProdutoForm] = useState<ProdutoFormData>({ /* valores iniciais */ })
```

#### Estados de UI
```typescript
const [activeTab, setActiveTab] = useState("informacoes")
const [isProdutoDialogOpen, setIsProdutoDialogOpen] = useState(false)
const [produtoDialogMode, setProdutoDialogMode] = useState<'create' | 'edit' | 'view'>('create')
```

### 1.7 Padrões de Comunicação com Backend

#### Uso de RPC para SQL Customizado
```typescript
const { data, error } = await supabase.rpc('execute_sql_query', {
  sql_query: sqlQuery
})
```

#### Soft Delete Pattern
```typescript
await supabase
  .from('tblicitacao')
  .update({
    deletado: 'S',
    data_del: new Date().toISOString(),
    usuario_d: usuarioId
  })
  .eq('licitacao_id', parseInt(id))
```

### 1.8 Responsividade

- **Desktop**: Layout completo com todas as funcionalidades
- **Mobile**: Botões flutuantes fixos na parte inferior
- **Tablets**: Layout adaptativo com grid responsivo

```typescript
{/* Botões flutuantes - apenas em dispositivos móveis */}
<div className="fixed bottom-4 right-4 left-4 z-10 md:hidden">
  {/* Botões de ação */}
</div>
```

