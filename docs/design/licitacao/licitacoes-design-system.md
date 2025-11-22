# Design System - Página de Licitações

## Visão Geral

Este documento detalha o design system completo da página de listagem de licitações, incluindo layout, tipografia, cores, componentes, estados e comportamentos. Use este guia para replicar exatamente o design em outros projetos.

---

## 1. Paleta de Cores

### 1.1 Cores Primárias

| Uso | Cor | Hex | Classe Tailwind |
|-----|-----|-----|-----------------|
| Primária (Normal) | Azul Escuro | `#242f65` | `bg-[#242f65]` |
| Primária (Hover) | Azul Mais Escuro | `#1a2148` | `bg-[#1a2148]` |
| Background Principal | Branco | `#ffffff` | `bg-white` |
| Background Página | Branco | `#ffffff` | - |

### 1.2 Cores de Texto

| Uso | Cor | Classe Tailwind |
|-----|-----|-----------------|
| Título Principal | Gray 800 | `text-[#1f2937]` |
| Texto Primário | Gray 800 | `text-gray-800` |
| Texto Secundário | Gray 600 | `text-gray-600` |
| Texto Terciário | Gray 500 | `text-gray-500` |
| Texto Quaternário | Gray 400 | `text-gray-400` |
| Texto de Marca Secundário | - | `text-brand-text-secondary` |
| Texto de Marca Primário | - | `text-brand-primary` |

### 1.3 Cores de Borda

| Uso | Cor | Classe Tailwind |
|-----|-----|-----------------|
| Borda Padrão | Gray 200 | `border-gray-200` |
| Borda Card | Gray 200 | `border border-gray-200` |

### 1.4 Cores de Status (Badges)

| Status | Variante | Cor Visual | Uso |
|--------|----------|------------|-----|
| Vigente | `success` | Verde suave | Licitações vigentes |
| Sem Ata | `warning` | Amarelo suave | Licitações sem ata |
| Suspenso | `destructive` | Vermelho suave | Licitações suspensas |
| Aberta | `info` | Azul suave | Licitações abertas |
| Em Andamento | `info` | Azul suave | Licitações em andamento |
| Finalizada (Ganha) | `success` | Verde suave | Licitações ganhas |
| Finalizada (Perdida) | `destructive` | Vermelho suave | Licitações perdidas |
| Cancelada | `secondary` | Cinza suave | Licitações canceladas |
| Padrão | `outline` | Outline | Outros status |

### 1.5 Cores de Estado Interativo

| Estado | Classe |
|--------|--------|
| Hover Linha Tabela | `hover:bg-gray-50` |
| Hover Botão Primário | `hover:bg-[#1a2148] hover:border-[#1a2148] hover:text-white` |
| Hover Linha Dialog | `hover:bg-gray-50` |

### 1.6 Cores Especiais

| Uso | Cor | Classe Tailwind |
|-----|-----|-----------------|
| Loading Overlay | Branco com opacidade | `bg-white/70` |
| Loading Backdrop | - | `backdrop-blur-[1px]` |
| Erro | Vermelho | `text-red-500`, `text-red-600`, `border-red-300` |

---

## 2. Tipografia

### 2.1 Hierarquia de Títulos

| Elemento | Tamanho | Peso | Cor | Classe Completa |
|----------|---------|------|-----|-----------------|
| H1 - Título Página | 2xl | Bold | Gray 800 | `text-2xl font-bold text-[#1f2937]` |
| H2 - Título Seção | lg | Semibold | Gray 800 | `text-lg font-semibold text-gray-800` |
| H3 - Título Dialog | - | - | - | `DialogTitle` (componente) |

### 2.2 Texto de Corpo

| Uso | Tamanho | Peso | Cor | Classe Completa |
|-----|---------|------|-----|-----------------|
| Descrição Página | base | Normal | Gray 500 | `text-gray-500` |
| Descrição Seção | sm | Normal | Gray 500 | `text-sm text-gray-500` |
| Texto Tabela | sm | Normal | Gray 600 | `text-sm text-gray-600` |
| Texto Tabela (Destaque) | sm | Medium | Gray 600 | `text-sm font-medium text-gray-600` |
| Texto Secundário Tabela | xs | Normal | Brand Secondary | `text-xs text-brand-text-secondary` |
| Loading Text | sm | Normal | Gray 500 | `text-sm text-gray-500` |
| Loading Text (Botão) | sm | Medium | Brand Primary | `text-sm font-medium text-[#242f65]` |

### 2.3 Labels e Cabeçalhos

| Uso | Tamanho | Peso | Transform | Tracking | Cor | Classe Completa |
|-----|---------|------|-----------|----------|-----|-----------------|
| Table Header | xs | Medium | Uppercase | Wider | Gray 500 | `text-xs font-medium text-gray-500 uppercase tracking-wider` |
| Form Label | - | - | - | - | - | Componente `Label` |

### 2.4 Texto de Estado

| Estado | Classes |
|--------|---------|
| Placeholder Input | `placeholder:"Pesquisar por lançamento, cliente ou modalidade..."` |
| Empty State | `text-gray-500` |
| Error Message | `text-sm text-gray-500` |

---

## 3. Layout e Espaçamento

### 3.1 Container Principal

```tsx
<div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pt-0 pb-0 max-w-none">
```

**Características:**
- Largura: 100% com padding responsivo
- Padding horizontal:
  - Mobile: `16px` (px-4)
  - Small: `24px` (sm:px-6)
  - Large: `32px` (lg:px-8)
- Padding vertical: `0` (pt-0 pb-0)
- Max-width: Sem limite (max-w-none)

### 3.2 Espaçamento entre Seções

```tsx
<div className="flex flex-col gap-4">
```

**Gap padrão entre seções:** `16px` (gap-4)

### 3.3 Cabeçalho da Página

```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
```

**Layout:**
- Mobile: Coluna (empilhado)
- Desktop: Linha com items centralizados e espaço entre
- Gap: `16px`

**Estrutura:**
```tsx
<div>
  <h1 className="text-2xl font-bold text-[#1f2937]">Licitações</h1>
  <p className="text-gray-500">Gerencie e acompanhe todas as licitações</p>
</div>
```

### 3.4 Card Principal

```tsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
```

**Características:**
- Background: Branco
- Border-radius: `8px` (rounded-lg)
- Shadow: Suave (shadow-sm)
- Border: `1px solid gray-200`
- Display: Flex column
- Overflow: Hidden

### 3.5 Cabeçalho do Card

```tsx
<div className="px-4 sm:px-6 py-4 border-b border-gray-200">
```

**Padding:**
- Horizontal: `16px` mobile, `24px` desktop
- Vertical: `16px`
- Border bottom: `1px solid gray-200`

### 3.6 Conteúdo do Card

```tsx
<div className="px-4 sm:px-6 py-4 flex flex-col">
```

**Padding:**
- Horizontal: `16px` mobile, `24px` desktop
- Vertical: `16px`
- Display: Flex column

### 3.7 Barra de Busca e Ações

```tsx
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
```

**Layout:**
- Mobile: Coluna
- Desktop: Linha com items centralizados e espaço entre
- Gap: `12px`
- Margin bottom: `24px`

### 3.8 Grupo de Botões

```tsx
<div className="flex gap-2 md:shrink-0">
```

**Gap entre botões:** `8px`

---

## 4. Componentes

### 4.1 Botão Primário (Call-to-Action)

```tsx
<Button
  className="bg-[#242f65] hover:bg-[#1a2148] flex items-center gap-2"
  onClick={() => navigate('/licitacoes/nova')}
>
  <Plus className="h-4 w-4" />
  Nova Licitação
</Button>
```

**Características:**
- Background: `#242f65`
- Hover: `#1a2148`
- Display: Flex com gap de `8px`
- Ícone: `16x16px`
- Texto: Branco (implícito no componente Button)

### 4.2 Botão com Outline (Filtros/Atualizar)

```tsx
<Button
  variant="outline"
  className="flex items-center gap-2 bg-[#242f65] text-white border-[#242f65] hover:bg-[#1a2148] hover:border-[#1a2148] hover:text-white"
>
  <Filter className="h-4 w-4" />
  Filtros
  {appliedCount > 0 && (
    <Badge variant="secondary" className="ml-1">{appliedCount}</Badge>
  )}
</Button>
```

**Características:**
- Variante: Outline
- Background: `#242f65`
- Texto: Branco
- Border: `#242f65`
- Hover: Background e border mudam para `#1a2148`
- Gap entre elementos: `8px`
- Badge (quando aplicável): Variante secondary, margin-left `4px`

### 4.3 Input de Busca

```tsx
<div className="relative w-full md:flex-1 max-w-none">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
  <Input
    type="text"
    placeholder="Pesquisar por lançamento, cliente ou modalidade..."
    className="pl-10 py-2 w-full border border-gray-200 rounded-md"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>
```

**Características:**
- Container: Relativo, largura completa, flex-1 em desktop
- Ícone:
  - Posição: Absoluta, esquerda `12px`, centrado verticalmente
  - Cor: Gray 400
  - Tamanho: `16x16px`
- Input:
  - Padding left: `40px` (para acomodar ícone)
  - Padding vertical: `8px`
  - Border: `1px solid gray-200`
  - Border-radius: `6px` (rounded-md)
  - Largura: 100%

### 4.4 Badge de Status

```tsx
<Badge variant={getStatusVariant(licitacao.status, licitacao.ganha)}>
  {getStatusLabel(licitacao.status, licitacao.ganha)}
</Badge>
```

**Variantes possíveis:**
- `success`: Verde suave
- `warning`: Amarelo suave
- `destructive`: Vermelho suave
- `info`: Azul suave
- `secondary`: Cinza suave
- `outline`: Contorno

**Lógica de variante:**
```typescript
const getStatusVariant = (status: string, ganha: string) => {
  if (ganha === 'S') return 'success';

  switch (status.toLowerCase()) {
    case 'vigente': return 'success';
    case 'sem ata': return 'warning';
    case 'suspenso': return 'destructive';
    case 'aberta': return 'info';
    case 'em andamento': return 'info';
    case 'finalizada': return ganha === 'S' ? 'success' : 'destructive';
    case 'cancelada': return 'secondary';
    default: return 'outline';
  }
};
```

**Lógica de label:**
```typescript
const getStatusLabel = (status: string, ganha: string): string => {
  if (status.toLowerCase() === 'finalizada') {
    return ganha === 'S' ? 'Ganha' : 'Perdida';
  }
  return status || 'N/A';
};
```

### 4.5 Botões de Ação da Tabela

```tsx
<div className="flex justify-start gap-1">
  {/* Visualizar */}
  <Button
    variant="ghost"
    size="icon"
    className="h-8 w-8 text-brand-primary"
    title="Visualizar"
  >
    <Eye className="h-4 w-4" />
  </Button>

  {/* Editar */}
  <Button
    variant="ghost"
    size="icon"
    className="h-8 w-8 text-brand-primary"
    title="Editar"
  >
    <Pencil className="h-4 w-4" />
  </Button>

  {/* Excluir */}
  <Button
    variant="ghost"
    size="icon"
    className="h-8 w-8 text-destructive"
    title="Excluir"
  >
    <Trash className="h-4 w-4" />
  </Button>

  {/* Anexos */}
  <Button
    variant="ghost"
    size="icon"
    className="h-8 w-8 text-brand-primary"
    title="Anexos"
  >
    <Paperclip className="h-4 w-4" />
  </Button>
</div>
```

**Características:**
- Container: Flex com gap de `4px`
- Botões:
  - Variante: Ghost
  - Size: Icon
  - Dimensões: `32x32px`
  - Ícones: `16x16px`
  - Cores:
    - Visualizar/Editar/Anexos: `text-brand-primary`
    - Excluir: `text-destructive`

---

## 5. Tabela

### 5.1 Container da Tabela

```tsx
<div
  ref={tableContainerRef}
  className="relative overflow-auto"
  style={tableMaxHeight !== undefined ? { maxHeight: tableMaxHeight } : undefined}
>
```

**Características:**
- Posição: Relativa
- Overflow: Auto (scroll quando necessário)
- Max-height: Calculada dinamicamente via hook

### 5.2 Estrutura da Tabela

```tsx
<table className="w-full table-auto">
  <thead>
    <tr className="border-b border-gray-200">
      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
```

**Cabeçalho:**
- Border bottom: `1px solid gray-200`
- Padding horizontal: `16px` mobile, `24px` desktop
- Padding vertical: `12px`
- Alinhamento: Esquerda
- Texto: `xs`, medium, gray-500, uppercase, tracking-wider

**Larguras das colunas:**
- Ações: Auto
- Lançamento: `min-w-[10ch]`
- Cliente: `!min-w-[500px] !max-w-[500px]`
- Modalidade: `w-full`
- Data: `min-w-[9ch]`
- Status: `min-w-[8ch]`, centralizado

### 5.3 Corpo da Tabela

```tsx
<tbody className="divide-y divide-gray-200">
  <tr className="hover:bg-gray-50 cursor-pointer">
    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
```

**Características:**
- Divisor: `1px solid gray-200` entre linhas
- Hover: Background gray-50
- Cursor: Pointer
- Padding células: `16px` horizontal mobile, `24px` desktop, `16px` vertical
- Whitespace: Nowrap (exceto cliente e modalidade que usam `whitespace-normal break-words`)

### 5.4 Formatação de Células

**Célula de Lançamento:**
```tsx
<td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
  {licitacao.numero}
</td>
```

**Célula de Cliente:**
```tsx
<td className="px-4 md:px-6 py-4 whitespace-normal break-words text-sm text-gray-600">
  <div>{licitacao.cliente}</div>
  {(licitacao.clienteCidade || licitacao.clienteUf) && (
    <div className="text-xs text-brand-text-secondary">
      {[licitacao.clienteCidade, licitacao.clienteUf].filter(Boolean).join('-').toUpperCase()}
    </div>
  )}
</td>
```

**Célula de Modalidade:**
```tsx
<td className="px-4 md:px-6 py-4 whitespace-normal break-words text-sm text-gray-600">
  <div>{licitacao.modalidade}</div>
  <div className="text-xs text-brand-text-secondary">{licitacao.modalidadeNumero}</div>
</td>
```

**Célula de Data:**
```tsx
<td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
  {licitacao.data && licitacao.data !== 'N/A'
    ? new Date(licitacao.data + 'T00:00:00').toLocaleDateString('pt-BR')
    : 'N/A'}
</td>
```

**Célula de Status:**
```tsx
<td className="px-4 md:px-6 py-4 whitespace-nowrap text-center">
  <Badge variant={getStatusVariant(licitacao.status, licitacao.ganha)}>
    {getStatusLabel(licitacao.status, licitacao.ganha)}
  </Badge>
</td>
```

---

## 6. Estados de Interface

### 6.1 Estado de Loading (Overlay)

```tsx
{isFetching && (
  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
    <div className="flex items-center gap-2 text-[#242f65] text-sm font-medium">
      <Loader2 className="h-4 w-4 animate-spin" />
      Aguarde, carregando dados...
    </div>
  </div>
)}
```

**Características:**
- Posição: Absoluta, cobrindo todo container
- Z-index: 10
- Display: Flex, items e justify center
- Background: Branco com 70% opacidade
- Backdrop blur: 1px
- Ícone: `16x16px` com animação spin
- Texto: Brand primary, `sm`, medium
- Gap: `8px`

### 6.2 Estado de Loading (Inline)

```tsx
{isLoading && (
  <div className="flex items-center gap-2 text-sm text-gray-500">
    <Loader2 className="h-4 w-4 animate-spin" />
    Carregando...
  </div>
)}
```

### 6.3 Estado de Erro

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

**Mensagem de erro na tabela:**
```tsx
<div className="flex flex-col items-center gap-3 text-red-500">
  <AlertCircle className="h-8 w-8" />
  <div>
    <p className="font-medium">Erro ao carregar licitações</p>
    <p className="text-sm text-gray-500">Verifique sua conexão e tente novamente</p>
  </div>
</div>
```

### 6.4 Estado Vazio

```tsx
<div className="text-gray-500">
  {searchTerm ?
    'Nenhuma licitação encontrada com os filtros aplicados.' :
    'Nenhuma licitação cadastrada.'
  }
</div>
```

**Container do estado vazio:**
```tsx
<tr>
  <td colSpan={6} className="px-4 md:px-6 py-8 text-center">
```

---

## 7. Dialog de Filtros

### 7.1 Estrutura do Dialog

```tsx
<DialogContent className="w-[95vw] max-w-[1100px] max-h-[80vh] overflow-auto p-0">
  <div className="p-6">
    <DialogHeader>
      <DialogTitle>Filtrar Licitações</DialogTitle>
      <DialogDescription>
        Selecione os critérios para filtrar as licitações cadastradas.
      </DialogDescription>
    </DialogHeader>

    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Campos de filtro */}
    </div>
  </div>

  <DialogFooter className="sticky bottom-0 z-10 bg-white border-t px-6 py-3 items-center justify-end sm:justify-end">
    <Button variant="outline" onClick={clearFilters}>Limpar Filtros</Button>
    <Button onClick={applyFilters}>Aplicar Filtros</Button>
  </DialogFooter>
</DialogContent>
```

**Características:**
- Largura: `95vw` com max de `1100px`
- Max-height: `80vh`
- Overflow: Auto
- Padding externo: `0`
- Padding interno: `24px`
- Grid: 1 coluna mobile, 2 colunas desktop
- Gap: `16px`
- Footer: Sticky, z-10, background branco, border-top

### 7.2 Campos de Filtro

**Input de texto:**
```tsx
<div className="space-y-2">
  <Label htmlFor="f-licitacao-id">Lançamento Número</Label>
  <Input
    id="f-licitacao-id"
    placeholder="Ex.: 1024"
    inputMode="numeric"
    value={draftFilters.licitacao_id}
    onChange={(e) => setDraftFilters((p) => ({ ...p, licitacao_id: e.target.value.replace(/[^0-9]/g, '') }))}
  />
</div>
```

**Campo com botão de busca:**
```tsx
<div className="space-y-2">
  <Label htmlFor="f-orgao-id">Órgão</Label>
  <div className="flex gap-2">
    <Input
      id="f-orgao-id"
      placeholder="Código numérico do Órgão"
      inputMode="numeric"
      value={draftFilters.orgao_id}
      onChange={(e) => setDraftFilters((p) => ({ ...p, orgao_id: e.target.value.replace(/[^0-9]/g, ''), orgao_nome: '' }))}
      className="flex-1"
    />
    <Button
      type="button"
      variant="outline"
      className="flex-none px-2 text-brand-primary"
      onClick={() => setIsOrgaoDialogOpen(true)}
      title="Pesquisar órgão"
    >
      <Search className="h-4 w-4" />
    </Button>
  </div>
  {draftFilters.orgao_nome && (
    <div className="text-xs text-gray-500">Selecionado: {draftFilters.orgao_nome}</div>
  )}
</div>
```

**Seletor de período (Calendar):**
```tsx
<div className="space-y-2">
  <Label>Período (Data inicial e final)</Label>
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" className="justify-start w-full text-left font-normal">
        <CalendarIcon className="mr-2 h-4 w-4" />
        {draftFilters.data_ini && draftFilters.data_fim
          ? `${draftFilters.data_ini.toLocaleDateString('pt-BR')} - ${draftFilters.data_fim.toLocaleDateString('pt-BR')}`
          : 'Selecione o período'}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar
        mode="range"
        selected={{ from: draftFilters.data_ini, to: draftFilters.data_fim }}
        onSelect={(range) => {
          setDraftFilters((p) => ({ ...p, data_ini: range?.from, data_fim: range?.to }));
        }}
        numberOfMonths={2}
      />
    </PopoverContent>
  </Popover>
</div>
```

**Select:**
```tsx
<div className="space-y-2 md:col-span-2">
  <Label>Status</Label>
  <Select
    value={draftFilters.status || 'todos'}
    onValueChange={(val) => setDraftFilters((p) => ({ ...p, status: val === 'todos' ? '' : val }))}
  >
    <SelectTrigger>
      <SelectValue placeholder="Selecione um status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="todos">Todos</SelectItem>
      <SelectItem value="Vigente">Vigente</SelectItem>
      <SelectItem value="Sem Ata">Sem Ata</SelectItem>
      <SelectItem value="Suspenso">Suspenso</SelectItem>
      <SelectItem value="Aberta">Aberta</SelectItem>
      <SelectItem value="Em Andamento">Em Andamento</SelectItem>
      <SelectItem value="Finalizada">Finalizada</SelectItem>
      <SelectItem value="Cancelada">Cancelada</SelectItem>
    </SelectContent>
  </Select>
</div>
```

---

## 8. Dialog de Pesquisa (Órgão/Cliente)

### 8.1 Estrutura

```tsx
<Dialog open={isOrgaoDialogOpen} onOpenChange={setIsOrgaoDialogOpen}>
  <DialogContent className="sm:max-w-[900px] w-full max-h-[70vh] overflow-auto">
    <DialogHeader>
      <DialogTitle>Pesquisar Órgão Licitante</DialogTitle>
      <DialogDescription>
        Busque e selecione o órgão licitante desejado
      </DialogDescription>
    </DialogHeader>

    <div className="my-4 space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Buscar por nome..."
          value={searchOrgao}
          onChange={(e) => {
            const val = e.target.value;
            setSearchOrgao(val);
            // Debounce logic
          }}
          className="flex-1"
        />
        {loadingClientes && (
          <div className="flex items-center px-3 text-sm text-gray-500">
            Carregando...
          </div>
        )}
      </div>
    </div>

    <div className="relative max-h-[320px] overflow-auto rounded-md border">
      <Table>
        {/* Tabela de resultados */}
      </Table>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOrgaoDialogOpen(false)}>
        Cancelar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Características:**
- Max-width: `900px`
- Max-height: `70vh`
- Tabela de resultados: Max-height `320px` com overflow auto
- Border: rounded-md

### 8.2 Tabela de Resultados

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[50%]">Nome</TableHead>
      <TableHead className="w-[20%]">Cidade</TableHead>
      <TableHead className="w-[20%]">UF</TableHead>
      <TableHead className="w-[10%] text-center">Ações</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {orgaosLicitantes.map((orgao) => (
      <TableRow key={orgao.cliente_id} className="cursor-pointer hover:bg-gray-50">
        <TableCell className="font-medium">{orgao.nome}</TableCell>
        <TableCell>{orgao.cidade || '-'}</TableCell>
        <TableCell>{orgao.uf || '-'}</TableCell>
        <TableCell className="text-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => {
              // Selecionar lógica
            }}
          >
            Selecionar
          </Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**Distribuição de largura:**
- Nome: 50%
- Cidade: 20%
- UF: 20%
- Ações: 10%, centralizado

---

## 9. Paginação

### 9.1 Componente DataPagination

```tsx
<DataPagination
  containerRef={paginationRef}
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={handlePageChange}
  itemsPerPage={itemsPerPage}
  totalItems={totalItems}
  showInfo={true}
  pageSizeOptions={[25, 50, 100, 200, 500, 1000]}
  onItemsPerPageChange={(size) => {
    setItemsPerPage(size);
    setCurrentPage(1);
    // Salvar no localStorage e atualizar URL
  }}
/>
```

**Características:**
- Sempre visível (mesmo sem dados)
- Mostra informações de paginação
- Permite ajuste de items por página
- Opções: 25, 50, 100, 200, 500, 1000
- Preferência salva em localStorage com chave: `apfar_licitacoes_items_per_page`

---

## 10. Responsividade

### 10.1 Breakpoints Utilizados

| Breakpoint | Tamanho | Uso |
|------------|---------|-----|
| `sm` | ≥640px | Ajustes de padding, layout de cabeçalho |
| `md` | ≥768px | Layout de busca/filtros, padding de tabela, grid de filtros |
| `lg` | ≥1024px | Padding de container |

### 10.2 Comportamentos Responsivos

**Container:**
- Padding horizontal aumenta progressivamente (4 → 6 → 8)

**Cabeçalho:**
- Mobile: Coluna (flex-col)
- Desktop: Linha (sm:flex-row)

**Barra de Busca:**
- Mobile: Coluna (flex-col)
- Desktop: Linha (md:flex-row)

**Grid de Filtros:**
- Mobile: 1 coluna (grid-cols-1)
- Desktop: 2 colunas (md:grid-cols-2)
- Status: Ocupa 2 colunas em desktop (md:col-span-2)

**Tabela:**
- Padding de células aumenta em desktop
- Cliente e Modalidade permitem quebra de linha (whitespace-normal break-words)

**Dialog:**
- Largura: 95vw em mobile com max-width definido

---

## 11. Animações e Transições

### 11.1 Animações Utilizadas

| Elemento | Animação | Classe |
|----------|----------|--------|
| Loader (Spinner) | Rotação contínua | `animate-spin` |
| Botão Atualizar | Rotação quando fetching | `${isFetching ? 'animate-spin' : ''}` |

### 11.2 Efeitos Visuais

| Elemento | Efeito | Classe |
|----------|--------|--------|
| Loading Overlay | Backdrop blur | `backdrop-blur-[1px]` |
| Linha da Tabela | Hover background | `hover:bg-gray-50` |
| Botão Primário | Hover background | `hover:bg-[#1a2148]` |

---

## 12. Ícones (Lucide React)

### 12.1 Ícones Utilizados

| Ícone | Uso | Tamanho |
|-------|-----|---------|
| `Plus` | Botão "Nova Licitação" | 16x16px |
| `Search` | Input de busca, botões de pesquisa | 16x16px |
| `Filter` | Botão de filtros | 16x16px |
| `Loader2` | Estados de loading | 16x16px (cabeçalho), 16x16px (overlay) |
| `AlertCircle` | Estados de erro | 16x16px (cabeçalho), 32x32px (tabela) |
| `RefreshCw` | Botão atualizar | 16x16px |
| `CalendarIcon` | Seletor de data | 16x16px |
| `Eye` | Visualizar licitação | 16x16px |
| `Pencil` | Editar licitação | 16x16px |
| `Trash` | Excluir licitação | 16x16px |
| `Paperclip` | Anexos | 16x16px |

### 12.2 Padrão de Uso

```tsx
<IconName className="h-4 w-4" />  {/* 16x16px */}
<IconName className="h-8 w-8" />  {/* 32x32px */}
```

---

## 13. Interações e Comportamentos

### 13.1 Busca

- **Input de busca:** Atualiza `searchTerm` em tempo real
- **Resetar página:** Volta para página 1 quando searchTerm muda
- **Backend:** Busca é processada no servidor
- **URL:** Atualiza query param `page` conforme navegação

### 13.2 Filtros

- **Estado duplo:**
  - `appliedFilters`: Filtros atualmente aplicados (usado na query)
  - `draftFilters`: Filtros em edição no modal
- **Aplicar:** Copia `draftFilters` para `appliedFilters` e fecha modal
- **Limpar:** Reseta ambos os estados
- **Badge de contagem:** Mostra número de filtros ativos
- **Resetar página:** Volta para página 1 quando filtros mudam

### 13.3 Paginação

- **Sincronização com URL:** Query param `page` reflete página atual
- **Items por página:** Salvo em localStorage
- **Mudança de tamanho:** Reseta para página 1

### 13.4 Ações da Tabela

- **Linha clicável:** Navega para visualização/edição
- **Botões de ação:** Previnem propagação do click da linha (stopPropagation)
- **Exclusão:** Confirma com `window.confirm()` antes de deletar
- **Navegação:** Mantém query param `page` na URL

### 13.5 Pesquisa de Órgão/Cliente

- **Debounce:** 500ms de delay após última digitação
- **Carregamento inicial:** Busca vazia ao abrir modal
- **Limpeza:** Cancela debounce ao fechar modal
- **Seleção:** Preenche campos de filtro e fecha modal

---

## 14. Acessibilidade

### 14.1 Atributos Semânticos

- **Títulos:** Uso correto de h1, h2 (via componentes Dialog)
- **Labels:** Associados a inputs via htmlFor
- **Title:** Atributo title em botões de ação
- **Placeholder:** Textos descritivos em inputs
- **Alt/Title:** Contexto para ícones via title

### 14.2 Navegação

- **Cursor:** Pointer em elementos clicáveis
- **Tab order:** Fluxo natural de navegação
- **Focus:** Estados visuais padrão dos componentes

---

## 15. Gerenciamento de Estado

### 15.1 React Query

```typescript
const {
  data: licitacoesData,
  isLoading,
  isFetching,
  error,
  refetch
} = useQuery({
  queryKey: [
    'licitacoes',
    currentPage,
    itemsPerPage,
    searchTerm,
    {
      licitacao_id: appliedFilters.licitacao_id,
      data_ini: appliedFilters.data_ini?.toISOString().slice(0, 10) || '',
      data_fim: appliedFilters.data_fim?.toISOString().slice(0, 10) || '',
      orgao_id: appliedFilters.orgao_id,
      cliente_id: appliedFilters.cliente_id,
      origem: appliedFilters.origem,
      modalidade: appliedFilters.modalidade,
      status: appliedFilters.status,
    },
  ],
  queryFn: async () => {
    // Fetch logic
  },
  staleTime: 5 * 60 * 1000,    // 5 minutos
  gcTime: 10 * 60 * 1000,      // 10 minutos
});
```

**Características:**
- **QueryKey:** Serializa todos os parâmetros de busca
- **StaleTime:** 5 minutos
- **GcTime:** 10 minutos
- **Refetch:** Manual via botão

### 15.2 URL State (SearchParams)

```typescript
const [searchParams, setSearchParams] = useSearchParams();

// Sincronizar página atual com URL
useEffect(() => {
  const p = Number(searchParams.get('page'));
  return Number.isFinite(p) && p > 0 ? p : 1;
}, []);

// Atualizar URL quando página muda
const handlePageChange = (page: number) => {
  const params = new URLSearchParams(searchParams);
  if (page > 1) {
    params.set('page', String(page));
  } else {
    params.delete('page');
  }
  setSearchParams(params, { replace: true });
};
```

### 15.3 LocalStorage

```typescript
// Carregar preferência
useEffect(() => {
  try {
    const raw = localStorage.getItem('apfar_licitacoes_items_per_page');
    const parsed = raw ? parseInt(raw, 10) : NaN;
    if ([25, 50, 100, 200, 500, 1000].includes(parsed)) {
      setItemsPerPage(parsed);
    }
  } catch { /* noop */ }
}, []);

// Salvar preferência
onItemsPerPageChange={(size) => {
  try {
    localStorage.setItem('apfar_licitacoes_items_per_page', String(size));
  } catch { /* noop */ }
}}
```

---

## 16. Formatação de Dados

### 16.1 Números

```typescript
// Número de lançamento (padding com zeros)
numero: String(licitacao.id).padStart(9, '0')
// Exemplo: "000001024"
```

### 16.2 Datas

```typescript
// Formatação de data para exibição
{licitacao.data && licitacao.data !== 'N/A'
  ? new Date(licitacao.data + 'T00:00:00').toLocaleDateString('pt-BR')
  : 'N/A'}
// Exemplo: "15/03/2025"

// Formatação de range de datas
`${data_ini.toLocaleDateString('pt-BR')} - ${data_fim.toLocaleDateString('pt-BR')}`
// Exemplo: "01/01/2025 - 31/03/2025"
```

### 16.3 Texto

```typescript
// Cidade-UF em uppercase
{[licitacao.clienteCidade, licitacao.clienteUf].filter(Boolean).join('-').toUpperCase()}
// Exemplo: "SÃO PAULO-SP"

// Modalidade número e ano
licitacao.modalidadeNumero
  ? (licitacao.modalidadeAno ? `${licitacao.modalidadeNumero}/${licitacao.modalidadeAno}` : licitacao.modalidadeNumero)
  : 'N/A'
// Exemplo: "90043/2025"
```

---

## 17. Hooks Customizados Utilizados

### 17.1 useAvailableHeight

```typescript
const tableMaxHeight = useAvailableHeight(tableContainerRef, paginationRef, 14);
```

**Propósito:** Calcular altura máxima disponível para tabela

**Parâmetros:**
- `tableContainerRef`: Ref do container da tabela
- `paginationRef`: Ref do componente de paginação
- `14`: Gap extra para prevenir scroll da página

### 17.2 useLicitacoes

```typescript
const { fetchLicitacoes, deleteLicitacao } = useLicitacoes();
```

**Métodos:**
- `fetchLicitacoes`: Buscar licitações com filtros
- `deleteLicitacao`: Excluir licitação

### 17.3 useClientes

```typescript
const { loading: loadingClientes, searchClientes } = useClientes();
```

**Métodos:**
- `searchClientes`: Buscar clientes/órgãos por termo

---

## 18. Componentes shadcn/ui Utilizados

| Componente | Uso |
|------------|-----|
| `Button` | Botões de ação, navegação, etc. |
| `Input` | Campos de entrada de texto |
| `Badge` | Status das licitações |
| `Dialog` | Modais de filtros e pesquisa |
| `Label` | Labels de formulário |
| `Select` | Seletor de status |
| `Popover` | Container do calendário |
| `Calendar` | Seletor de range de datas |
| `Table` | Tabelas de listagem |
| `DataPagination` | Componente customizado de paginação |

---

## 19. Checklist de Implementação

Use este checklist para garantir que todos os aspectos do design foram implementados:

### Layout
- [ ] Container principal com padding responsivo
- [ ] Cabeçalho com layout flex responsivo
- [ ] Card principal com shadow e border
- [ ] Grid de 2 colunas para filtros
- [ ] Tabela com scroll interno
- [ ] Paginação sticky/fixa

### Cores
- [ ] Primária: #242f65
- [ ] Hover primária: #1a2148
- [ ] Texto gray-800, gray-600, gray-500
- [ ] Bordas gray-200
- [ ] Status badges com variantes corretas

### Tipografia
- [ ] H1: text-2xl font-bold
- [ ] H2: text-lg font-semibold
- [ ] Table headers: text-xs uppercase tracking-wider
- [ ] Texto tabela: text-sm
- [ ] Texto secundário: text-xs

### Componentes
- [ ] Botão primário com ícone
- [ ] Input de busca com ícone à esquerda
- [ ] Badge de status com lógica condicional
- [ ] Botões ghost de ação (4 botões)
- [ ] Dialog de filtros responsivo
- [ ] Dialog de pesquisa com tabela
- [ ] DataPagination com opções de tamanho

### Estados
- [ ] Loading overlay com backdrop blur
- [ ] Loading inline com spinner
- [ ] Erro com AlertCircle e botão retry
- [ ] Empty state com mensagens contextuais
- [ ] Hover em linhas da tabela

### Interações
- [ ] Busca em tempo real
- [ ] Filtros com estado draft/applied
- [ ] Paginação com sincronização URL
- [ ] Pesquisa com debounce (500ms)
- [ ] Confirmação de exclusão
- [ ] Preservação da página na navegação

### Formatação
- [ ] Números com padding zeros
- [ ] Datas em pt-BR
- [ ] Cidade-UF uppercase
- [ ] Modalidade número/ano
- [ ] Status labels condicionais (Ganha/Perdida)

### Responsividade
- [ ] Padding mobile (px-4) → desktop (sm:px-6, lg:px-8)
- [ ] Layout coluna → linha em breakpoints
- [ ] Grid 1 coluna → 2 colunas
- [ ] Tabela com células quebráveis

### Acessibilidade
- [ ] Labels associados a inputs
- [ ] Title em botões de ação
- [ ] Placeholders descritivos
- [ ] Cursor pointer em clicáveis
- [ ] Elementos semânticos (h1, h2, table)

### Performance
- [ ] React Query com staleTime 5min
- [ ] localStorage para preferências
- [ ] Debounce em buscas
- [ ] Cleanup de timeouts

---

## 20. Variáveis CSS Customizadas (se aplicável)

Se seu projeto usa variáveis CSS customizadas, considere adicionar:

```css
:root {
  /* Cores primárias */
  --color-brand-primary: #242f65;
  --color-brand-primary-hover: #1a2148;

  /* Cores de texto */
  --color-text-primary: #1f2937;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;

  /* Cores de borda */
  --color-border: #e5e7eb;

  /* Espaçamentos */
  --spacing-page-horizontal-mobile: 1rem;
  --spacing-page-horizontal-desktop: 1.5rem;
  --spacing-page-horizontal-large: 2rem;

  /* Shadows */
  --shadow-card: 0 1px 2px 0 rgb(0 0 0 / 0.05);

  /* Bordas */
  --border-radius-card: 0.5rem;
  --border-radius-input: 0.375rem;
}
```

---

## 21. Observações Finais

### 21.1 Pontos de Atenção

1. **Largura da coluna Cliente:** Fixada em 500px para evitar truncamento excessivo
2. **Altura dinâmica da tabela:** Calculada via hook para evitar scroll da página
3. **Estado duplo de filtros:** Draft vs Applied para permitir cancelamento
4. **Preservação de contexto:** Query param `page` mantido na navegação
5. **Debounce de busca:** 500ms para evitar requests excessivos
6. **Cleanup de timers:** useEffect com cleanup para evitar memory leaks

### 21.2 Melhorias Possíveis

1. **Virtualização:** Para listas muito grandes (react-window/react-virtual)
2. **Skeleton loading:** Em vez de spinner para melhor UX
3. **Filtros na URL:** Sincronizar filtros aplicados com query params
4. **Ordenação:** Permitir ordenar colunas
5. **Seleção múltipla:** Para ações em lote
6. **Export:** Exportar dados filtrados (CSV/Excel)
7. **Busca avançada:** Operadores booleanos, campos específicos

### 21.3 Dependências Necessárias

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "@tanstack/react-query": "^5.x",
    "lucide-react": "^0.x",
    "react-day-picker": "^8.x",
    "@radix-ui/react-*": "várias versões",
    "tailwindcss": "^3.x"
  }
}
```

---

## Conclusão

Este design system fornece todos os detalhes necessários para replicar fielmente a página de licitações em outro projeto. Certifique-se de seguir as especificações de cores, tipografia, espaçamento e comportamentos para manter a consistência visual e de experiência do usuário.

Para dúvidas ou ajustes, consulte o código-fonte original em `/src/pages/Licitacoes.tsx`.
