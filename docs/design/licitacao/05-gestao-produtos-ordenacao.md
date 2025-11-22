# Gestão de Produtos e Sistema de Ordenação

## Gestão Completa de Produtos

### Estrutura da Tabela com Ordenação

#### 1. Estados de Ordenação

```typescript
// Tipo para campos ordenáveis
type SortField = 'nome' | 'quantidade' | 'numeroEdital' | 'precoReferencia' | 
                 'precoMaximo' | 'precoFinal' | 'pdv' | 'precoConcorrente' | 
                 'concorrente' | 'margem'

// Estados
const [sortField, setSortField] = useState<SortField | null>(null)
const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null)
```

#### 2. Função de Ordenação

```typescript
const handleSort = (field: SortField) => {
  if (sortField === field) {
    // Mesmo campo: alternar direção ou resetar
    if (sortDirection === 'asc') {
      setSortDirection('desc')
    } else if (sortDirection === 'desc') {
      setSortField(null)
      setSortDirection(null)
    }
  } else {
    // Novo campo: ordenar ascendente
    setSortField(field)
    setSortDirection('asc')
  }
}
```

#### 3. Produtos Ordenados (useMemo para Performance)

```typescript
const sortedProdutos = useMemo(() => {
  if (!sortField || !sortDirection) {
    return produtos
  }

  return [...produtos].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    // Tratamento para valores nulos/undefined
    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

    // Comparação numérica
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }

    // Comparação de strings
    const aStr = String(aValue).toLowerCase()
    const bStr = String(bValue).toLowerCase()
    
    if (sortDirection === 'asc') {
      return aStr.localeCompare(bStr, 'pt-BR')
    } else {
      return bStr.localeCompare(aStr, 'pt-BR')
    }
  })
}, [produtos, sortField, sortDirection])
```

#### 4. Componente de Cabeçalho Ordenável

```typescript
// Componente reutilizável para cabeçalhos de tabela
const SortableTableHead = ({ 
  field, 
  label 
}: { 
  field: SortField
  label: string 
}) => {
  const isActive = sortField === field
  
  return (
    <TableHead 
      className="cursor-pointer hover:bg-gray-50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {isActive ? (
          sortDirection === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="h-4 w-4 text-gray-400" />
        )}
      </div>
    </TableHead>
  )
}

// Uso na tabela
<TableHeader>
  <TableRow>
    <SortableTableHead field="nome" label="Produto" />
    <SortableTableHead field="quantidade" label="Quantidade" />
    <SortableTableHead field="numeroEdital" label="Nº Edital" />
    <SortableTableHead field="precoReferencia" label="Preço Ref." />
    {/* ... outros campos */}
    <TableHead className="w-[120px]">Ações</TableHead>
  </TableRow>
</TableHeader>
```

### Modal de Produto com 3 Abas

#### 1. Estrutura do Modal

```typescript
<Dialog open={isProdutoDialogOpen} onOpenChange={setIsProdutoDialogOpen}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>
        {/* Título dinâmico baseado no modo */}
        {produtoDialogMode === 'create' && 'Adicionar Produto'}
        {produtoDialogMode === 'edit' && 'Editar Produto'}
        {produtoDialogMode === 'view' && 'Visualizar Produto'}
      </DialogTitle>
    </DialogHeader>

    {/* Tabs */}
    <Tabs defaultValue="basico" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="basico">Básico</TabsTrigger>
        <TabsTrigger value="competicao">Competição</TabsTrigger>
        <TabsTrigger value="status">Status</TabsTrigger>
      </TabsList>

      {/* Aba Básico */}
      <TabsContent value="basico" className="space-y-4">
        {/* Campos básicos */}
      </TabsContent>

      {/* Aba Competição */}
      <TabsContent value="competicao" className="space-y-4">
        {/* Campos de competição */}
      </TabsContent>

      {/* Aba Status */}
      <TabsContent value="status" className="space-y-4">
        {/* Campos de status */}
      </TabsContent>
    </Tabs>

    {/* Footer com botões */}
    <DialogFooter>
      {produtoDialogMode !== 'view' && (
        <>
          <Button variant="outline" onClick={() => setIsProdutoDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveProduto}>
            Salvar
          </Button>
        </>
      )}
      {produtoDialogMode === 'view' && (
        <Button onClick={() => setIsProdutoDialogOpen(false)}>
          Fechar
        </Button>
      )}
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### 2. Aba Básico - Campos Principais

```typescript
<TabsContent value="basico" className="space-y-4">
  {/* Nome do Produto com LOV */}
  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
    <div className="space-y-2">
      <Label htmlFor="produtoNome">Produto *</Label>
      <Input
        id="produtoNome"
        value={produtoForm.nome}
        onChange={(e) => setProdutoForm({ ...produtoForm, nome: e.target.value })}
        disabled={produtoDialogMode === 'view'}
        placeholder="Nome do produto"
      />
    </div>
    <div className="flex items-end">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsProdutoCatalogoDialogOpen(true)}
        disabled={produtoDialogMode === 'view'}
      >
        <Search className="h-4 w-4 mr-2" />
        Catálogo
      </Button>
    </div>
  </div>

  {/* Quantidade e Número Edital */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="produtoQuantidade">Quantidade *</Label>
      <NumberInputBR
        id="produtoQuantidade"
        value={produtoForm.quantidade}
        onChange={(value) => setProdutoForm({ ...produtoForm, quantidade: value })}
        disabled={produtoDialogMode === 'view'}
        decimals={2}
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="produtoNumeroEdital">Nº Edital</Label>
      <Input
        id="produtoNumeroEdital"
        value={produtoForm.numeroEdital}
        onChange={(e) => setProdutoForm({ ...produtoForm, numeroEdital: e.target.value })}
        disabled={produtoDialogMode === 'view'}
      />
    </div>
  </div>

  {/* Marca */}
  <div className="space-y-2">
    <Label htmlFor="produtoMarca">Marca</Label>
    <Input
      id="produtoMarca"
      value={produtoForm.marca}
      onChange={(e) => setProdutoForm({ ...produtoForm, marca: e.target.value })}
      disabled={produtoDialogMode === 'view'}
    />
  </div>

  {/* Upload de Imagem */}
  <div className="space-y-2">
    <Label htmlFor="produtoImagem">Imagem do Produto</Label>
    <Input
      id="produtoImagem"
      type="file"
      accept="image/*"
      onChange={handleImagemChange}
      disabled={produtoDialogMode === 'view'}
    />
    {imagemPreview && (
      <div className="mt-2">
        <img 
          src={imagemPreview} 
          alt="Preview" 
          className="max-w-xs max-h-48 object-contain border rounded"
        />
      </div>
    )}
  </div>
</TabsContent>
```

#### 3. Aba Competição - Preços e Concorrente

```typescript
<TabsContent value="competicao" className="space-y-4">
  {/* Grid de Preços */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="produtoPrecoReferencia">Preço Referência</Label>
      <NumberInputBR
        id="produtoPrecoReferencia"
        value={produtoForm.precoReferencia}
        onChange={(value) => setProdutoForm({ ...produtoForm, precoReferencia: value })}
        disabled={produtoDialogMode === 'view'}
        decimals={2}
        prefix="R$ "
      />
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="produtoPrecoMaximo">Preço Máximo</Label>
      <NumberInputBR
        id="produtoPrecoMaximo"
        value={produtoForm.precoMaximo}
        onChange={(value) => setProdutoForm({ ...produtoForm, precoMaximo: value })}
        disabled={produtoDialogMode === 'view'}
        decimals={2}
        prefix="R$ "
      />
    </div>
  </div>

  {/* Concorrente com LOV */}
  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
    <div className="space-y-2">
      <Label htmlFor="produtoConcorrente">Concorrente</Label>
      <Input
        id="produtoConcorrente"
        value={produtoForm.concorrente}
        readOnly
        disabled={produtoDialogMode === 'view'}
        placeholder="Clique em pesquisar para selecionar"
        className="bg-gray-50"
      />
    </div>
    <div className="flex items-end">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsConcorrenteDialogOpen(true)}
        disabled={produtoDialogMode === 'view'}
      >
        <Search className="h-4 w-4 mr-2" />
        Pesquisar
      </Button>
    </div>
  </div>

  {/* Checkbox Participa */}
  <div className="flex items-center space-x-2">
    <Checkbox
      id="produtoParticipa"
      checked={produtoForm.participa}
      onCheckedChange={(checked) => 
        setProdutoForm({ ...produtoForm, participa: checked as boolean })
      }
      disabled={produtoDialogMode === 'view'}
    />
    <Label htmlFor="produtoParticipa">Participa da licitação</Label>
  </div>
</TabsContent>
```

