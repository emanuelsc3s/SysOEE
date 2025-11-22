# Padrão LOV (List of Values) e Sistema de Busca

## 2.5 Padrão LOV - List of Values

### Conceito

LOV (List of Values) é um padrão de UI onde o usuário seleciona valores de uma lista através de um dialog de busca, ao invés de digitar manualmente. Garante integridade referencial e melhora a experiência do usuário.

### Implementação Completa - Órgão Licitante

#### 1. Estados Necessários

```typescript
// Dialog de busca
const [isOrgaoDialogOpen, setIsOrgaoDialogOpen] = useState(false)

// Termo de busca
const [searchOrgaoTerm, setSearchOrgaoTerm] = useState('')

// Resultados da busca
const [orgaosEncontrados, setOrgaosEncontrados] = useState<any[]>([])

// Loading state
const [loadingOrgaos, setLoadingOrgaos] = useState(false)
```

#### 2. Campo com Botão de Busca

```typescript
<div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
  {/* Campo de exibição (read-only) */}
  <div className="space-y-2">
    <Label htmlFor="orgaoLicitante">Órgão Licitante *</Label>
    <Input
      id="orgaoLicitante"
      name="orgaoLicitante"
      value={formData.orgaoLicitante}
      readOnly
      placeholder="Clique no botão de pesquisa para selecionar"
      className="bg-gray-50"
    />
  </div>

  {/* Botão de busca */}
  <div className="flex items-end">
    <Button
      type="button"
      variant="outline"
      onClick={() => setIsOrgaoDialogOpen(true)}
      className="w-full md:w-auto"
    >
      <Search className="h-4 w-4 mr-2" />
      Pesquisar
    </Button>
  </div>
</div>
```

#### 3. Dialog de Busca

```typescript
<Dialog open={isOrgaoDialogOpen} onOpenChange={setIsOrgaoDialogOpen}>
  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Pesquisar Órgão Licitante</DialogTitle>
      <DialogDescription>
        Digite o nome do órgão para buscar
      </DialogDescription>
    </DialogHeader>

    {/* Campo de busca com debounce */}
    <div className="space-y-4">
      <Input
        placeholder="Digite o nome do órgão..."
        value={searchOrgaoTerm}
        onChange={(e) => {
          setSearchOrgaoTerm(e.target.value)
          // Debounce: aguarda 500ms após parar de digitar
          clearTimeout(window.searchOrgaoTimeout)
          window.searchOrgaoTimeout = setTimeout(() => {
            handleSearchOrgao(e.target.value)
          }, 500)
        }}
        autoFocus
      />

      {/* Loading state */}
      {loadingOrgaos && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">Buscando...</p>
        </div>
      )}

      {/* Resultados */}
      {!loadingOrgaos && orgaosEncontrados.length > 0 && (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>UF</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgaosEncontrados.map((orgao) => (
                <TableRow key={orgao.cliente_id}>
                  <TableCell>{orgao.nome}</TableCell>
                  <TableCell>{orgao.cidade}</TableCell>
                  <TableCell>{orgao.uf}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => handleSelectOrgao(orgao)}
                    >
                      Selecionar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Estado vazio */}
      {!loadingOrgaos && searchOrgaoTerm && orgaosEncontrados.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">
            Nenhum órgão encontrado com o termo "{searchOrgaoTerm}"
          </p>
        </div>
      )}
    </div>
  </DialogContent>
</Dialog>
```

#### 4. Função de Busca com Debounce

```typescript
const handleSearchOrgao = async (term: string) => {
  if (!term || term.trim().length < 2) {
    setOrgaosEncontrados([])
    return
  }

  try {
    setLoadingOrgaos(true)
    
    // Buscar no Supabase
    const { data, error } = await supabase
      .from('tbcliente')
      .select('cliente_id, nome, cidade, uf')
      .eq('deletado', 'N')
      .ilike('nome', `%${term}%`)
      .order('nome')
      .limit(50)

    if (error) throw error

    setOrgaosEncontrados(data || [])
  } catch (error) {
    console.error('Erro ao buscar órgãos:', error)
    toast({
      title: "Erro ao buscar órgãos",
      description: "Não foi possível realizar a busca",
      variant: "destructive"
    })
  } finally {
    setLoadingOrgaos(false)
  }
}
```

#### 5. Função de Seleção

```typescript
const handleSelectOrgao = (orgao: any) => {
  // Atualizar formulário com nome e ID
  setFormData({
    ...formData,
    orgaoLicitante: orgao.nome,
    orgaoId: orgao.cliente_id
  })
  
  // Fechar dialog
  setIsOrgaoDialogOpen(false)
  
  // Limpar busca
  setSearchOrgaoTerm('')
  setOrgaosEncontrados([])
  
  // Feedback
  toast({
    title: "Órgão selecionado",
    description: `${orgao.nome} foi selecionado como órgão licitante`,
    variant: "default"
  })
}
```

### LOV com CRUD Inline - Concorrente

Permite criar/editar registros diretamente no dialog de busca:

```typescript
<Dialog open={isConcorrenteDialogOpen} onOpenChange={setIsConcorrenteDialogOpen}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Pesquisar Concorrente</DialogTitle>
    </DialogHeader>

    {/* Modo de busca */}
    {concorrenteDialogMode === 'search' && (
      <>
        <Input
          placeholder="Digite o nome do concorrente..."
          value={searchConcorrenteTerm}
          onChange={(e) => {
            setSearchConcorrenteTerm(e.target.value)
            clearTimeout(window.searchConcorrenteTimeout)
            window.searchConcorrenteTimeout = setTimeout(() => {
              handleSearchConcorrente(e.target.value)
            }, 500)
          }}
        />

        {/* Botão para criar novo */}
        <Button
          onClick={() => {
            setConcorrenteDialogMode('create')
            setConcorrenteForm({
              razao_social: '',
              nome_fantasia: '',
              cnpj: '',
              // ... outros campos
            })
          }}
        >
          Criar Novo Concorrente
        </Button>

        {/* Lista de resultados */}
        {/* ... */}
      </>
    )}

    {/* Modo de criação/edição */}
    {(concorrenteDialogMode === 'create' || concorrenteDialogMode === 'edit') && (
      <>
        <div className="space-y-4">
          <Input
            placeholder="Razão Social"
            value={concorrenteForm.razao_social}
            onChange={(e) => setConcorrenteForm({
              ...concorrenteForm,
              razao_social: e.target.value
            })}
          />
          {/* Outros campos */}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setConcorrenteDialogMode('search')}
          >
            Cancelar
          </Button>
          <Button onClick={handleSaveConcorrente}>
            Salvar
          </Button>
        </DialogFooter>
      </>
    )}
  </DialogContent>
</Dialog>
```

### Vantagens do Padrão LOV

1. **Integridade Referencial**: Garante que apenas valores válidos sejam selecionados
2. **Experiência do Usuário**: Evita erros de digitação
3. **Performance**: Busca com debounce reduz chamadas ao servidor
4. **Flexibilidade**: Permite criar novos registros inline quando necessário
5. **Validação**: Campos obrigatórios garantem que IDs sejam selecionados

