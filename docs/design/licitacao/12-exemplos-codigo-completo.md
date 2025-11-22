# Exemplos de Código Completo - Casos de Uso Práticos

## Exemplo 1: Componente NumberInputBR

Componente customizado para entrada de números no formato brasileiro.

```typescript
// src/components/ui/number-input-br.tsx

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'

interface NumberInputBRProps {
  id?: string
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  decimals?: number
  prefix?: string
  placeholder?: string
  className?: string
}

export function NumberInputBR({
  id,
  value,
  onChange,
  disabled = false,
  decimals = 2,
  prefix = '',
  placeholder = '',
  className = ''
}: NumberInputBRProps) {
  const [displayValue, setDisplayValue] = useState('')

  // Formatar número para exibição
  useEffect(() => {
    if (value === 0 && displayValue === '') return
    
    const formatted = value.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
    
    setDisplayValue(prefix + formatted)
  }, [value, decimals, prefix])

  // Processar entrada do usuário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value
    
    // Remover prefixo
    if (prefix && inputValue.startsWith(prefix)) {
      inputValue = inputValue.substring(prefix.length)
    }
    
    // Remover tudo exceto números, vírgula e ponto
    inputValue = inputValue.replace(/[^\d,.-]/g, '')
    
    // Substituir vírgula por ponto
    inputValue = inputValue.replace(',', '.')
    
    // Converter para número
    const numValue = parseFloat(inputValue) || 0
    
    // Atualizar valor
    onChange(numValue)
    
    // Atualizar display
    setDisplayValue(e.target.value)
  }

  const handleBlur = () => {
    // Reformatar ao perder foco
    const formatted = value.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
    setDisplayValue(prefix + formatted)
  }

  return (
    <Input
      id={id}
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
    />
  )
}
```

### Uso do NumberInputBR

```typescript
// No componente
<NumberInputBR
  id="quantidade"
  value={produtoForm.quantidade}
  onChange={(value) => setProdutoForm({ ...produtoForm, quantidade: value })}
  decimals={2}
  placeholder="0,00"
/>

<NumberInputBR
  id="preco"
  value={produtoForm.precoReferencia}
  onChange={(value) => setProdutoForm({ ...produtoForm, precoReferencia: value })}
  decimals={2}
  prefix="R$ "
  placeholder="R$ 0,00"
/>
```

## Exemplo 2: Componente de Tabela Ordenável Completo

```typescript
// Componente reutilizável de tabela com ordenação

import { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ArrowUp, ArrowDown, ArrowUpDown, Eye, Pencil, Trash } from 'lucide-react'

interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
}

interface SortableTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onView?: (row: T) => void
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
  emptyMessage?: string
}

export function SortableTable<T extends { id: string | number }>({
  data,
  columns,
  onView,
  onEdit,
  onDelete,
  emptyMessage = 'Nenhum registro encontrado'
}: SortableTableProps<T>) {
  const [sortField, setSortField] = useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null)

  // Função de ordenação
  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortField(null)
        setSortDirection(null)
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Dados ordenados
  const sortedData = useMemo(() => {
    if (!sortField || !sortDirection) {
      return data
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }

      const aStr = String(aValue).toLowerCase()
      const bStr = String(bValue).toLowerCase()
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr, 'pt-BR')
      } else {
        return bStr.localeCompare(aStr, 'pt-BR')
      }
    })
  }, [data, sortField, sortDirection])

  // Ícone de ordenação
  const SortIcon = ({ field }: { field: keyof T }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    )
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                className={column.sortable ? 'cursor-pointer hover:bg-gray-50 select-none' : ''}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-1">
                  <span>{column.label}</span>
                  {column.sortable && <SortIcon field={column.key} />}
                </div>
              </TableHead>
            ))}
            {(onView || onEdit || onDelete) && (
              <TableHead className="w-[120px]">Ações</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length > 0 ? (
            sortedData.map((row) => (
              <TableRow key={row.id}>
                {columns.map((column) => (
                  <TableCell key={String(column.key)}>
                    {column.render 
                      ? column.render(row[column.key], row)
                      : String(row[column.key] || '')}
                  </TableCell>
                ))}
                {(onView || onEdit || onDelete) && (
                  <TableCell>
                    <div className="flex gap-2">
                      {onView && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onView(row)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(row)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onDelete(row)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell 
                colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0)} 
                className="h-24 text-center"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
```

### Uso da SortableTable

```typescript
// Definir colunas
const columns: Column<ProdutoFormData>[] = [
  {
    key: 'nome',
    label: 'Produto',
    sortable: true
  },
  {
    key: 'quantidade',
    label: 'Quantidade',
    sortable: true,
    render: (value) => value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  },
  {
    key: 'precoReferencia',
    label: 'Preço Ref.',
    sortable: true,
    render: (value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  }
]

// Usar componente
<SortableTable
  data={produtos}
  columns={columns}
  onView={handleViewProduto}
  onEdit={handleEditProduto}
  onDelete={(produto) => {
    setCurrentProduto(produto)
    setIsDeleteProdutoDialogOpen(true)
  }}
  emptyMessage="Nenhum produto adicionado"
/>
```

## Exemplo 3: Hook useDebounce

Hook reutilizável para implementar debounce em buscas.

```typescript
// src/hooks/useDebounce.ts

import { useState, useEffect } from 'react'

/**
 * Hook para debounce de valores
 * @param value - Valor a ser debounced
 * @param delay - Delay em milissegundos (padrão: 500ms)
 * @returns Valor debounced
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Criar timer
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Limpar timer se value mudar antes do delay
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

### Uso do useDebounce

```typescript
// No componente
const [searchTerm, setSearchTerm] = useState('')
const debouncedSearchTerm = useDebounce(searchTerm, 500)

// Executar busca quando o valor debounced mudar
useEffect(() => {
  if (debouncedSearchTerm) {
    handleSearch(debouncedSearchTerm)
  }
}, [debouncedSearchTerm])

// No input
<Input
  placeholder="Digite para buscar..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
```

## Exemplo 4: Utilitário de Formatação

```typescript
// src/lib/format-utils.ts

/**
 * Formata número para moeda brasileira
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/**
 * Formata número decimal brasileiro
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * Formata data para padrão brasileiro
 */
export function formatDate(date: string | Date | null): string {
  if (!date) return ''

  const d = typeof date === 'string' ? new Date(date) : date

  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Formata data e hora para padrão brasileiro
 */
export function formatDateTime(date: string | Date | null): string {
  if (!date) return ''

  const d = typeof date === 'string' ? new Date(date) : date

  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Formata CNPJ
 */
export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '')

  if (cleaned.length !== 14) return cnpj

  return cleaned.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  )
}

/**
 * Formata CPF
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '')

  if (cleaned.length !== 11) return cpf

  return cleaned.replace(
    /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
    '$1.$2.$3-$4'
  )
}

/**
 * Formata telefone
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 10) {
    return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
  }

  if (cleaned.length === 11) {
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  }

  return phone
}

/**
 * Formata tamanho de arquivo
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Trunca texto com reticências
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
```

### Uso dos Utilitários

```typescript
// No componente
import { formatCurrency, formatDate, formatFileSize } from '@/lib/format-utils'

// Formatação de moeda
<TableCell>{formatCurrency(produto.precoReferencia)}</TableCell>

// Formatação de data
<TableCell>{formatDate(licitacao.dataAbertura)}</TableCell>

// Formatação de tamanho de arquivo
<TableCell>{formatFileSize(documento.size)}</TableCell>
```

## Exemplo 5: Componente de Confirmação Reutilizável

```typescript
// src/components/ui/confirm-dialog.tsx

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  variant?: 'default' | 'destructive'
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  variant = 'default'
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### Uso do ConfirmDialog

```typescript
// No componente
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

<ConfirmDialog
  open={isDeleteDialogOpen}
  onOpenChange={setIsDeleteDialogOpen}
  title="Confirmar Exclusão"
  description="Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita."
  confirmText="Excluir"
  cancelText="Cancelar"
  variant="destructive"
  onConfirm={handleDelete}
/>
```

## Exemplo 6: Validação de Formulário Completa

```typescript
// src/lib/validation-utils.ts

/**
 * Valida se uma string é uma data válida no formato YYYY-MM-DD
 */
export function isValidDate(dateStr: string): boolean {
  if (!dateStr) return true // Vazio é válido

  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateStr)) return false

  const date = new Date(dateStr)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Valida se uma string é um email válido
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Valida se uma string é um CNPJ válido
 */
export function isValidCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '')

  if (cleaned.length !== 14) return false

  // Validação de dígitos verificadores
  let sum = 0
  let pos = 5

  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned.charAt(i)) * pos
    pos = pos === 2 ? 9 : pos - 1
  }

  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (digit !== parseInt(cleaned.charAt(12))) return false

  sum = 0
  pos = 6

  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned.charAt(i)) * pos
    pos = pos === 2 ? 9 : pos - 1
  }

  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  return digit === parseInt(cleaned.charAt(13))
}

/**
 * Valida campos obrigatórios
 */
export function validateRequired(
  data: Record<string, any>,
  requiredFields: string[]
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  requiredFields.forEach(field => {
    const value = data[field]
    if (value === null || value === undefined || value === '') {
      errors[field] = 'Este campo é obrigatório'
    }
  })

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Valida tamanho máximo de campos
 */
export function validateMaxLength(
  data: Record<string, any>,
  maxLengths: Record<string, number>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  Object.entries(maxLengths).forEach(([field, maxLength]) => {
    const value = data[field]
    if (typeof value === 'string' && value.length > maxLength) {
      errors[field] = `Este campo deve ter no máximo ${maxLength} caracteres`
    }
  })

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}
```

### Uso das Validações

```typescript
// No componente
import { validateRequired, validateMaxLength, isValidDate } from '@/lib/validation-utils'

const handleSave = async () => {
  // Validar campos obrigatórios
  const { valid: requiredValid, errors: requiredErrors } = validateRequired(formData, [
    'orgaoLicitante',
    'cliente',
    'modalidade'
  ])

  if (!requiredValid) {
    toast({
      variant: "destructive",
      title: "Campos obrigatórios",
      description: Object.values(requiredErrors)[0],
    })
    return
  }

  // Validar tamanho máximo
  const { valid: lengthValid, errors: lengthErrors } = validateMaxLength(formData, {
    modalidadeNumero: 50,
    processoNumero: 50,
    observacaoGeral: 4000
  })

  if (!lengthValid) {
    toast({
      variant: "destructive",
      title: "Tamanho de campo excedido",
      description: Object.values(lengthErrors)[0],
    })
    return
  }

  // Validar datas
  if (formData.dataAbertura && !isValidDate(formData.dataAbertura)) {
    toast({
      variant: "destructive",
      title: "Data inválida",
      description: "A data de abertura está em formato inválido",
    })
    return
  }

  // Continuar com salvamento...
  await saveLicitacao(formData)
}
```

