# Componentes UI shadcn/ui - Guia Completo

## Lista Completa de Componentes Utilizados

### 1. Button

**Uso**: Ações primárias e secundárias

```typescript
import { Button } from "@/components/ui/button"

// Variantes disponíveis
<Button variant="default">Salvar</Button>
<Button variant="destructive">Excluir</Button>
<Button variant="outline">Cancelar</Button>
<Button variant="ghost">Fechar</Button>
<Button variant="link">Ver mais</Button>

// Tamanhos
<Button size="default">Normal</Button>
<Button size="sm">Pequeno</Button>
<Button size="lg">Grande</Button>
<Button size="icon">
  <Search className="h-4 w-4" />
</Button>

// Com ícone
<Button>
  <Save className="mr-2 h-4 w-4" />
  Salvar
</Button>

// Estados
<Button disabled>Desabilitado</Button>
<Button disabled>
  {loading ? 'Salvando...' : 'Salvar'}
</Button>
```

### 2. Input

**Uso**: Campos de texto

```typescript
import { Input } from "@/components/ui/input"

// Básico
<Input
  type="text"
  placeholder="Digite aqui..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// Read-only (para LOV)
<Input
  value={formData.orgaoLicitante}
  readOnly
  className="bg-gray-50"
  placeholder="Clique no botão de pesquisa"
/>

// Com validação
<Input
  type="email"
  required
  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
/>

// Tipos especiais
<Input type="file" accept="image/*" />
<Input type="date" />
<Input type="time" />
<Input type="number" step="0.01" />
```

### 3. Textarea

**Uso**: Campos de texto multilinha

```typescript
import { Textarea } from "@/components/ui/textarea"

<Textarea
  placeholder="Digite suas observações..."
  value={formData.observacaoGeral}
  onChange={(e) => setFormData({ 
    ...formData, 
    observacaoGeral: e.target.value 
  })}
  rows={4}
  maxLength={4000}
/>
```

### 4. Select

**Uso**: Dropdown de seleção

```typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

<Select
  value={formData.status}
  onValueChange={(value) => setFormData({ ...formData, status: value })}
>
  <SelectTrigger>
    <SelectValue placeholder="Selecione o status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="Aberta">Aberta</SelectItem>
    <SelectItem value="Em Andamento">Em Andamento</SelectItem>
    <SelectItem value="Concluída">Concluída</SelectItem>
    <SelectItem value="Cancelada">Cancelada</SelectItem>
  </SelectContent>
</Select>
```

### 5. Card

**Uso**: Container para agrupar conteúdo relacionado

```typescript
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Informações Básicas</CardTitle>
    <CardDescription>
      Dados gerais sobre a licitação
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Conteúdo */}
  </CardContent>
  <CardFooter>
    {/* Rodapé opcional */}
  </CardFooter>
</Card>
```

### 6. Tabs

**Uso**: Organização de conteúdo em abas

```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="informacoes">Informações</TabsTrigger>
    <TabsTrigger value="concorrentes">Concorrentes</TabsTrigger>
    <TabsTrigger value="documentos">Documentos</TabsTrigger>
    <TabsTrigger value="complementar">Complementar</TabsTrigger>
  </TabsList>

  <TabsContent value="informacoes" className="space-y-4">
    {/* Conteúdo da aba */}
  </TabsContent>

  <TabsContent value="concorrentes">
    {/* Conteúdo da aba */}
  </TabsContent>

  {/* Outras abas */}
</Tabs>
```

### 7. Table

**Uso**: Exibição de dados tabulares

```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Produto</TableHead>
      <TableHead>Quantidade</TableHead>
      <TableHead>Preço</TableHead>
      <TableHead className="w-[120px]">Ações</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {produtos.map((produto) => (
      <TableRow key={produto.id}>
        <TableCell>{produto.nome}</TableCell>
        <TableCell>{produto.quantidade}</TableCell>
        <TableCell>{formatCurrency(produto.preco)}</TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### 8. Dialog

**Uso**: Modais e popups

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Título do Modal</DialogTitle>
      <DialogDescription>
        Descrição opcional do modal
      </DialogDescription>
    </DialogHeader>

    {/* Conteúdo do modal */}
    <div className="space-y-4">
      {/* Campos do formulário */}
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancelar
      </Button>
      <Button onClick={handleSave}>
        Salvar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 9. AlertDialog

**Uso**: Confirmações e alertas

```typescript
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

<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
      <AlertDialogDescription>
        Tem certeza que deseja excluir este registro? 
        Esta ação não pode ser desfeita.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>
        Excluir
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### 10. Label

**Uso**: Rótulos para campos de formulário

```typescript
import { Label } from "@/components/ui/label"

<div className="space-y-2">
  <Label htmlFor="campo">Nome do Campo *</Label>
  <Input id="campo" />
</div>
```

### 11. Checkbox

**Uso**: Campos booleanos

```typescript
import { Checkbox } from "@/components/ui/checkbox"

<div className="flex items-center space-x-2">
  <Checkbox
    id="participa"
    checked={formData.participa}
    onCheckedChange={(checked) => 
      setFormData({ ...formData, participa: checked as boolean })
    }
  />
  <Label htmlFor="participa">Participa da licitação</Label>
</div>
```

