# Referência Rápida - Cheat Sheet

## Comandos Essenciais

### Criar Novo CRUD

```bash
# 1. Criar arquivo de tipos
touch src/types/[entidade]-type.ts

# 2. Criar hook customizado
touch src/hooks/use[Entidade].ts

# 3. Criar componente de cadastro
touch src/pages/[Entidade]Cad.tsx

# 4. Adicionar rotas no router
```

## Snippets de Código

### Hook Básico

```typescript
export function use[Entidade]() {
  const [loading, setLoading] = useState(false)
  const [registros, setRegistros] = useState<[Entidade]FormData[]>([])

  const fetchRegistros = async () => { /* ... */ }
  const fetchRegistro = async (id: string) => { /* ... */ }
  const saveRegistro = async (data: [Entidade]FormData) => { /* ... */ }
  const deleteRegistro = async (id: string) => { /* ... */ }

  return { loading, registros, fetchRegistros, fetchRegistro, saveRegistro, deleteRegistro }
}
```

### Componente Básico

```typescript
export default function [Entidade]Cad() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { loading, fetchRegistro, saveRegistro, deleteRegistro } = use[Entidade]()
  
  const [formData, setFormData] = useState<[Entidade]FormData>({ /* ... */ })

  useEffect(() => {
    if (id) loadData()
  }, [id])

  const loadData = async () => { /* ... */ }
  const handleSave = async () => { /* ... */ }
  const handleDelete = async () => { /* ... */ }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Conteúdo */}
    </div>
  )
}
```

### Query SQL com RPC

```typescript
const sqlQuery = `
  SELECT * FROM tb[entidade]
  WHERE deletado = 'N'
  ORDER BY [campo]_id DESC
`

const { data, error } = await supabase.rpc('execute_sql_query', {
  sql_query: sqlQuery
})
```

### Soft Delete

```typescript
const { error } = await supabase
  .from('tb[entidade]')
  .update({
    deletado: 'S',
    data_del: new Date().toISOString(),
    usuario_d: usuarioId
  })
  .eq('[campo]_id', parseInt(id))
```

## Componentes UI Mais Usados

### Button

```typescript
<Button variant="default">Salvar</Button>
<Button variant="destructive">Excluir</Button>
<Button variant="outline">Cancelar</Button>
<Button size="sm">Pequeno</Button>
<Button disabled={loading}>
  {loading ? 'Salvando...' : 'Salvar'}
</Button>
```

### Input

```typescript
<Input
  id="campo"
  value={formData.campo}
  onChange={(e) => setFormData({ ...formData, campo: e.target.value })}
  placeholder="Digite aqui..."
/>
```

### Select

```typescript
<Select
  value={formData.status}
  onValueChange={(value) => setFormData({ ...formData, status: value })}
>
  <SelectTrigger>
    <SelectValue placeholder="Selecione" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="ativo">Ativo</SelectItem>
    <SelectItem value="inativo">Inativo</SelectItem>
  </SelectContent>
</Select>
```

### Dialog

```typescript
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
    </DialogHeader>
    {/* Conteúdo */}
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancelar
      </Button>
      <Button onClick={handleSave}>Salvar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Table

```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Coluna 1</TableHead>
      <TableHead>Coluna 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.campo1}</TableCell>
        <TableCell>{item.campo2}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## Classes Tailwind Mais Usadas

### Layout

```typescript
className="container mx-auto py-6"
className="space-y-4"
className="grid grid-cols-1 md:grid-cols-2 gap-4"
className="flex items-center justify-between"
```

### Espaçamento

```typescript
className="p-4"      // padding
className="m-4"      // margin
className="px-4"     // padding horizontal
className="py-4"     // padding vertical
className="gap-4"    // gap em flex/grid
```

### Cores

```typescript
className="bg-brand-primary text-white"
className="bg-gray-50"
className="text-gray-600"
className="border-gray-200"
```

### Responsividade

```typescript
className="hidden md:block"        // Ocultar em mobile
className="md:hidden"              // Ocultar em desktop
className="grid-cols-1 md:grid-cols-2"  // 1 col mobile, 2 desktop
```

## Validações Comuns

### Campo Obrigatório

```typescript
if (!formData.campo.trim()) {
  toast({
    variant: "destructive",
    title: "Validação",
    description: "Este campo é obrigatório",
  })
  return
}
```

### Formato de Data

```typescript
const isValidDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s)

if (formData.data && !isValidDate(formData.data)) {
  toast({
    variant: "destructive",
    title: "Data inválida",
    description: "Use o formato AAAA-MM-DD",
  })
  return
}
```

### Tamanho Máximo

```typescript
if (formData.campo.length > 100) {
  toast({
    variant: "destructive",
    title: "Tamanho excedido",
    description: "Este campo deve ter no máximo 100 caracteres",
  })
  return
}
```

## Toast Notifications

### Sucesso

```typescript
toast({
  title: "Sucesso",
  description: "Operação realizada com sucesso",
  variant: "default"
})
```

### Erro

```typescript
toast({
  title: "Erro",
  description: "Não foi possível realizar a operação",
  variant: "destructive"
})
```

### Aviso

```typescript
toast({
  title: "Atenção",
  description: "Verifique os dados informados",
  variant: "default"
})
```

## Estrutura SQL Padrão

### Criar Tabela

```sql
CREATE TABLE tb[entidade] (
  [campo]_id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  status VARCHAR(30),
  deletado CHAR(1) DEFAULT 'N',
  data_inc TIMESTAMP DEFAULT NOW(),
  usuario_i INTEGER,
  data_alt TIMESTAMP,
  usuario_a INTEGER,
  data_del TIMESTAMP,
  usuario_d INTEGER,
  sync CHAR(1) DEFAULT 'N'
);
```

### Query com Filtro

```sql
SELECT * FROM tb[entidade]
WHERE deletado = 'N'
  AND nome ILIKE '%termo%'
ORDER BY [campo]_id DESC
LIMIT 10 OFFSET 0
```

## Atalhos de Desenvolvimento

### Importações Comuns

```typescript
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
```

### Padrão de Estado

```typescript
const [formData, setFormData] = useState<FormData>({ /* ... */ })
const [loading, setLoading] = useState(false)
const [isDialogOpen, setIsDialogOpen] = useState(false)
```

### Padrão de useEffect

```typescript
useEffect(() => {
  if (id) {
    loadData()
  }
}, [id])
```

### Padrão de Handler

```typescript
const handleSave = async () => {
  try {
    setLoading(true)
    // validações
    // operação
    toast({ title: "Sucesso", description: "..." })
    navigate('/lista')
  } catch (error) {
    toast({ title: "Erro", description: "...", variant: "destructive" })
  } finally {
    setLoading(false)
  }
}
```

