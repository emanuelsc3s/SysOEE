# Exclusão com Soft Delete e CRUD Completo

## 2.3 Exclusão com Soft Delete

### Conceito

Soft delete é um padrão onde registros não são fisicamente removidos do banco de dados, mas marcados como deletados através de um campo flag (`deletado = 'S'`).

### Vantagens

1. **Auditoria**: Mantém histórico completo
2. **Recuperação**: Possibilidade de restaurar dados
3. **Integridade**: Preserva relacionamentos
4. **Compliance**: Atende requisitos legais

### Implementação no Hook

```typescript
// Hook: useLicitacoes.ts
const deleteLicitacao = async (id: string) => {
  try {
    setLoading(true)
    
    // Obter ID do usuário para auditoria
    const usuarioId = await getUserIdFromTbusuario()
    if (!usuarioId) {
      throw new Error('Usuário não encontrado na tabela de usuários')
    }
    
    // Soft delete: atualiza flags ao invés de DELETE
    const { error } = await supabase
      .from('tblicitacao')
      .update({
        deletado: 'S',                      // Marca como deletado
        data_del: new Date().toISOString(), // Data da exclusão
        usuario_d: usuarioId                // Usuário que excluiu
      })
      .eq('licitacao_id', parseInt(id))
    
    if (error) throw error
    
    toast({
      title: "Sucesso",
      description: "Licitação excluída com sucesso",
      variant: "default"
    })
  } catch (error) {
    const errorMessage = handleSupabaseError(error)
    toast({
      title: "Erro ao excluir licitação",
      description: errorMessage,
      variant: "destructive"
    })
    throw error
  } finally {
    setLoading(false)
  }
}
```

### Implementação no Componente

```typescript
// Componente: LicitacoesCad.tsx

// Estado para controlar o dialog de confirmação
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

// Handler de exclusão
const handleDelete = async () => {
  try {
    if (id) {
      await deleteLicitacao(id)
      toast({
        title: "Sucesso!",
        description: "Licitação excluída com sucesso.",
        variant: "default",
      })
      goBackToList()
    }
  } catch (error) {
    console.error('Erro ao excluir licitação:', error)
    toast({
      variant: "destructive",
      title: "Erro ao excluir licitação",
      description: error instanceof Error ? error.message : 'Erro desconhecido',
    })
  }
}

// Botão de exclusão
<Button
  variant="destructive"
  onClick={() => setIsDeleteDialogOpen(true)}
>
  <Trash className="mr-2 h-4 w-4" />
  Excluir
</Button>

// Dialog de confirmação
<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirmar Exclusão</DialogTitle>
      <DialogDescription>
        Tem certeza que deseja excluir esta licitação? Esta ação não pode ser desfeita.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
        Cancelar
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        Excluir
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Query com Filtro de Soft Delete

```typescript
// Sempre filtrar registros não deletados
const sqlQuery = `
  SELECT * FROM tblicitacao 
  WHERE deletado = 'N'
  AND licitacao_id = ${parseInt(id)}
`
```

### Exclusão de Produtos

```typescript
const handleDeleteProduto = async () => {
  try {
    if (!currentProduto?.id) return

    const isTempId = currentProduto.id.toString().startsWith('temp_')
    const isNumericId = !isNaN(parseInt(currentProduto.id.toString()))

    // Caso licitação não salva ou ID temporário: remoção apenas local
    if (!id || isTempId || !isNumericId) {
      setProdutos(prev => prev.filter(p => p.id !== currentProduto.id))
      setIsDeleteProdutoDialogOpen(false)
      toast({
        title: 'Sucesso',
        description: 'Produto removido da lista local. Salve a licitação para persistir no banco de dados.',
        variant: 'default'
      })
      return
    }

    // Licitação existente e ID válido: exclusão no backend
    await deleteProduto(currentProduto.id)
    setProdutos(prev => prev.filter(p => p.id !== currentProduto.id))
    setIsDeleteProdutoDialogOpen(false)
  } catch (error) {
    toast({ 
      title: 'Erro ao excluir produto', 
      description: 'Não foi possível excluir o produto.', 
      variant: 'destructive' 
    })
  }
}
```

## 2.4 Criação de Novos Registros

### Botão "Adicionar Produto"

```typescript
<Button
  className="bg-brand-primary hover:bg-brand-primary/90"
  onClick={handleAddProduto}
>
  Adicionar Produto
</Button>
```

### Handler de Criação

```typescript
const handleAddProduto = () => {
  setProdutoDialogMode('create')
  setCurrentProduto(null)
  setProdutoForm({
    id: "",
    nome: "",
    quantidade: 0,
    numeroEdital: "",
    precoReferencia: 0,
    precoMaximo: 0,
    precoFinal: 0,
    pdv: 0,
    precoAplicado: 0,
    precoConcorrente: 0,
    concorrente: "",
    participa: true,
    margem: 0,
    motivoPerda: "",
    imagemUrl: "",
    imagemFile: null,
    preco_inicial: 0,
    preco_ganho: 0,
    concorrente_id: null,
    status: "Ativo",
    qtde_pedido: 0,
    qtde_nf: 0,
    resultado: "",
    marca: "",
    motivoperda_id: null,
    motivoperda: "",
    sync: "N",
    sync_data: null
  })
  setImagemPreview(null)
  setIsProdutoDialogOpen(true)
}
```

### Validação de Dados

```typescript
const handleSaveProduto = async () => {
  try {
    // Validação de campos obrigatórios
    if (!produtoForm.nome || produtoForm.nome.trim() === '') {
      toast({
        title: "Erro de validação",
        description: "O nome do produto é obrigatório",
        variant: "destructive"
      })
      return
    }

    if (!produtoForm.quantidade || produtoForm.quantidade <= 0) {
      toast({
        title: "Erro de validação",
        description: "A quantidade deve ser maior que zero",
        variant: "destructive"
      })
      return
    }

    // Continuar com salvamento...
  }
}
```

### Inserção no Supabase

```typescript
// Hook: useProdutosLicitacao.ts
const saveProduto = async (produtoData: ProdutoFormData, licitacaoId: string) => {
  // Preparar dados
  const dbData = {
    licitacao_id: parseInt(licitacaoId),
    produto_id: produtoId,
    quantidade: produtoData.quantidade,
    // ... outros campos
    deletado: 'N',
    data_inc: new Date().toISOString(),
    usuario_i: usuarioId
  }

  // Inserir
  const { data, error } = await supabase
    .from('tblicitacao_item')
    .insert(dbData)
    .select()

  if (error) throw error

  return data[0]
}
```

### Redirecionamento Após Criação

```typescript
// Após salvar com sucesso
toast({
  title: "Sucesso!",
  description: "Licitação cadastrada com sucesso.",
  variant: "default",
})

goBackToList() // Volta para a lista
```

