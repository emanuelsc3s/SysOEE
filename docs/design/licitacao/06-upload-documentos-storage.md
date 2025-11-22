# Upload de Documentos e Supabase Storage

## Gestão de Documentos

### Configuração do Supabase Storage

#### 1. Bucket Configuration

```typescript
// Constantes
const DOCUMENTS_BUCKET = 'licitacoes-documentos'
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
```

#### 2. Estrutura de Pastas

```
licitacoes-documentos/
└── licitacao_{id}/
    ├── documento1.pdf
    ├── documento2.xlsx
    └── imagem.jpg
```

### Implementação do Upload

#### 1. Estados Necessários

```typescript
// Lista de documentos
const [documentos, setDocumentos] = useState<any[]>([])

// Loading states
const [loadingDocumentos, setLoadingDocumentos] = useState(false)
const [uploadingDocumento, setUploadingDocumento] = useState(false)

// Arquivo selecionado
const [selectedFile, setSelectedFile] = useState<File | null>(null)
```

#### 2. Componente de Upload

```typescript
<Card>
  <CardHeader>
    <CardTitle>Documentos</CardTitle>
    <CardDescription>
      Anexe documentos relacionados à licitação (máx. 100MB por arquivo)
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Input de arquivo */}
    <div className="flex gap-2">
      <Input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            // Validar tamanho
            if (file.size > MAX_FILE_SIZE) {
              toast({
                title: "Arquivo muito grande",
                description: "O arquivo deve ter no máximo 100MB",
                variant: "destructive"
              })
              e.target.value = ''
              return
            }
            setSelectedFile(file)
          }
        }}
        disabled={!id || uploadingDocumento}
      />
      <Button
        onClick={handleUploadDocumento}
        disabled={!selectedFile || uploadingDocumento || !id}
      >
        {uploadingDocumento ? 'Enviando...' : 'Enviar'}
      </Button>
    </div>

    {/* Mensagem quando licitação não está salva */}
    {!id && (
      <p className="text-sm text-amber-600">
        Salve a licitação primeiro para poder anexar documentos
      </p>
    )}

    {/* Lista de documentos */}
    {documentos.length > 0 && (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Arquivo</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead>Data de Upload</TableHead>
              <TableHead className="w-[150px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documentos.map((doc) => (
              <TableRow key={doc.name}>
                <TableCell>{doc.name}</TableCell>
                <TableCell>{formatFileSize(doc.metadata?.size)}</TableCell>
                <TableCell>
                  {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDocumento(doc)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadDocumento(doc)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteDocumento(doc)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )}
  </CardContent>
</Card>
```

#### 3. Função de Upload

```typescript
const handleUploadDocumento = async () => {
  if (!selectedFile || !id) return

  try {
    setUploadingDocumento(true)

    // Sanitizar nome do arquivo
    const sanitizedFileName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const timestamp = Date.now()
    const fileName = `${timestamp}_${sanitizedFileName}`
    
    // Caminho no bucket
    const path = `licitacao_${id}/${fileName}`

    // Upload para o Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .upload(path, selectedFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: selectedFile.type || 'application/octet-stream'
      })

    if (uploadError) throw uploadError

    // Feedback de sucesso
    toast({
      title: "Sucesso",
      description: "Documento enviado com sucesso",
      variant: "default"
    })

    // Limpar seleção
    setSelectedFile(null)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) fileInput.value = ''

    // Recarregar lista de documentos
    await loadDocumentos()
  } catch (error) {
    console.error('Erro ao fazer upload:', error)
    toast({
      title: "Erro ao enviar documento",
      description: error instanceof Error ? error.message : 'Erro desconhecido',
      variant: "destructive"
    })
  } finally {
    setUploadingDocumento(false)
  }
}
```

#### 4. Carregar Lista de Documentos

```typescript
const loadDocumentos = async () => {
  if (!id) return

  try {
    setLoadingDocumentos(true)

    const path = `licitacao_${id}`

    // Listar arquivos no bucket
    const { data, error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .list(path, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) throw error

    setDocumentos(data || [])
  } catch (error) {
    console.error('Erro ao carregar documentos:', error)
    toast({
      title: "Erro ao carregar documentos",
      description: "Não foi possível carregar a lista de documentos",
      variant: "destructive"
    })
  } finally {
    setLoadingDocumentos(false)
  }
}

// Carregar ao montar o componente
useEffect(() => {
  if (id) {
    loadDocumentos()
  }
}, [id])
```

#### 5. Visualizar Documento

```typescript
const handleViewDocumento = async (doc: any) => {
  try {
    const path = `licitacao_${id}/${doc.name}`

    // Gerar URL assinada (válida por 1 hora)
    const { data, error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .createSignedUrl(path, 3600)

    if (error) throw error

    // Abrir em nova aba
    window.open(data.signedUrl, '_blank')
  } catch (error) {
    console.error('Erro ao visualizar documento:', error)
    toast({
      title: "Erro ao visualizar documento",
      description: "Não foi possível abrir o documento",
      variant: "destructive"
    })
  }
}
```

#### 6. Download de Documento

```typescript
const handleDownloadDocumento = async (doc: any) => {
  try {
    const path = `licitacao_${id}/${doc.name}`

    // Download do arquivo
    const { data, error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .download(path)

    if (error) throw error

    // Criar URL temporária e fazer download
    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = doc.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Sucesso",
      description: "Download iniciado",
      variant: "default"
    })
  } catch (error) {
    console.error('Erro ao fazer download:', error)
    toast({
      title: "Erro ao fazer download",
      description: "Não foi possível baixar o documento",
      variant: "destructive"
    })
  }
}
```

#### 7. Excluir Documento

```typescript
const handleDeleteDocumento = async (doc: any) => {
  if (!confirm('Tem certeza que deseja excluir este documento?')) {
    return
  }

  try {
    const path = `licitacao_${id}/${doc.name}`

    // Excluir do storage
    const { error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .remove([path])

    if (error) throw error

    toast({
      title: "Sucesso",
      description: "Documento excluído com sucesso",
      variant: "default"
    })

    // Recarregar lista
    await loadDocumentos()
  } catch (error) {
    console.error('Erro ao excluir documento:', error)
    toast({
      title: "Erro ao excluir documento",
      description: "Não foi possível excluir o documento",
      variant: "destructive"
    })
  }
}
```

#### 8. Utilitário para Formatar Tamanho

```typescript
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'N/A'
  
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}
```

