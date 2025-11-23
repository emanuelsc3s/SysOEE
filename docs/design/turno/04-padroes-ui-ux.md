# Padrões de UI/UX

## 🎨 Visão Geral

A página de Turnos segue um design system consistente baseado em Shadcn/UI + Tailwind CSS, com paleta de cores personalizada e padrões de responsividade bem definidos.

---

## 🎨 Paleta de Cores

### Cores Primárias

```css
/* Cor primária do projeto */
--primary: #242f65
--primary-hover: #1a2148

/* Textos */
--text-primary: #1f2937
--text-secondary: #6b7280
--text-muted: #9ca3af

/* Bordas */
--border: #e5e7eb
--border-dark: #d1d5db
```

### Cores Semânticas (Meta OEE)

| Meta OEE | Cor | Variante Badge | Hex |
|----------|-----|----------------|-----|
| ≥ 90% | Sucesso | `success` | `#10b981` |
| ≥ 85% | Info | `info` | `#3b82f6` |
| ≥ 80% | Aviso | `warning` | `#f59e0b` |
| < 80% | Erro | `destructive` | `#ef4444` |

**Implementação:**
```typescript
const getBadgeMetaOEE = (meta: number): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' => {
  if (meta >= 90) return 'success'
  if (meta >= 85) return 'info'
  if (meta >= 80) return 'warning'
  return 'destructive'
}
```

---

## 📐 Layout e Espaçamento

### Container Principal

```tsx
<div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pt-0 pb-0 max-w-none">
  <div className="flex flex-col gap-4">
    {/* Conteúdo */}
  </div>
</div>
```

**Breakpoints de Padding:**
- Mobile: `px-4` (16px)
- Tablet: `sm:px-6` (24px)
- Desktop: `lg:px-8` (32px)

### Card Principal

```tsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden mb-6">
  {/* Conteúdo */}
</div>
```

**Propriedades:**
- Fundo branco: `bg-white`
- Bordas arredondadas: `rounded-lg` (8px)
- Sombra sutil: `shadow-sm`
- Borda cinza: `border border-gray-200`
- Margem inferior: `mb-6` (24px)

### Espaçamento Interno

```tsx
<div className="px-4 sm:px-6 py-4 border-b border-gray-200">
  {/* Cabeçalho do card */}
</div>
```

**Padrão:**
- Horizontal: `px-4 sm:px-6` (16px → 24px)
- Vertical: `py-4` (16px)

---

## 🔘 Componentes de UI

### Botões

#### Botão Primário

```tsx
<Button
  className="bg-[#242f65] hover:bg-[#1a2148] flex items-center gap-2"
  onClick={handleNovo}
>
  <Plus className="h-4 w-4" />
  Novo Turno
</Button>
```

**Características:**
- Cor de fundo: `#242f65`
- Hover: `#1a2148`
- Ícone: `h-4 w-4` (16px)
- Gap: `gap-2` (8px)

#### Botão Outline (Ações Secundárias)

```tsx
<Button
  variant="outline"
  className="flex items-center gap-2 bg-[#242f65] text-white border-[#242f65] hover:bg-[#1a2148] hover:border-[#1a2148] hover:text-white"
>
  <Filter className="h-4 w-4" />
  Filtros
</Button>
```

**Características:**
- Variante: `outline`
- Cores customizadas para manter identidade visual
- Mesmo comportamento de hover

#### Botão Ghost (Ações na Tabela)

```tsx
<Button
  variant="ghost"
  size="icon"
  className="h-8 w-8 text-[#242f65]"
  title="Visualizar"
>
  <Eye className="h-4 w-4" />
</Button>
```

**Características:**
- Variante: `ghost` (sem fundo)
- Tamanho: `icon` (quadrado)
- Dimensões: `h-8 w-8` (32px)
- Cor do ícone: `text-[#242f65]`

### Inputs

#### Campo de Busca

```tsx
<div className="relative w-full md:flex-1 max-w-none">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
  <Input
    type="text"
    placeholder="Pesquisar por código ou nome do turno..."
    className="pl-10 py-2 w-full border border-gray-200 rounded-md"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>
```

**Características:**
- Ícone posicionado absolutamente à esquerda
- Padding left: `pl-10` (40px) para acomodar ícone
- Placeholder descritivo

#### Campo de Filtro

```tsx
<div className="space-y-2">
  <Label htmlFor="f-codigo">Código</Label>
  <Input
    id="f-codigo"
    placeholder="Ex.: T1"
    value={draftFilters.codigo}
    onChange={(e) => setDraftFilters((p) => ({ ...p, codigo: e.target.value }))}
  />
</div>
```

**Características:**
- Espaçamento vertical: `space-y-2` (8px)
- Label associado via `htmlFor`
- Placeholder com exemplo

### Badges

```tsx
<Badge variant={getBadgeMetaOEE(turno.metaOee)}>
  <Target className="h-3 w-3 mr-1" />
  {formatarMetaOEE(turno.metaOee)}
</Badge>
```

**Características:**
- Ícone: `h-3 w-3` (12px)
- Margem direita do ícone: `mr-1` (4px)
- Variante dinâmica baseada em valor

### Tabela

```tsx
<table className="w-full table-auto">
  <thead>
    <tr className="border-b border-gray-200">
      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Código
      </th>
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-200">
    <tr className="hover:bg-gray-50 cursor-pointer">
      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
        {turno.codigo}
      </td>
    </tr>
  </tbody>
</table>
```

**Características do Header:**
- Padding: `px-4 md:px-6 py-3`
- Texto: `text-xs font-medium text-gray-500 uppercase tracking-wider`
- Borda inferior: `border-b border-gray-200`

**Características das Células:**
- Padding: `px-4 md:px-6 py-4`
- Texto: `text-sm text-gray-600`
- Hover: `hover:bg-gray-50`

---

## 📱 Responsividade

### Breakpoints Tailwind

| Breakpoint | Largura Mínima | Uso |
|------------|----------------|-----|
| `sm:` | 640px | Tablet pequeno |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Desktop grande |

### Padrões Responsivos

#### Cabeçalho da Página

```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div>
    <h1 className="text-2xl font-bold text-[#1f2937]">Turnos</h1>
    <p className="text-gray-500">Gerencie e acompanhe todos os turnos de trabalho</p>
  </div>
  <Button>Novo Turno</Button>
</div>
```

**Comportamento:**
- Mobile: Empilhado verticalmente (`flex-col`)
- Tablet+: Horizontal (`sm:flex-row sm:justify-between`)

#### Barra de Busca e Ações

```tsx
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
  <div className="relative w-full md:flex-1 max-w-none">
    {/* Input de busca */}
  </div>
  <div className="flex gap-2 md:shrink-0">
    {/* Botões de ação */}
  </div>
</div>
```

**Comportamento:**
- Mobile: Empilhado (`flex-col`)
- Desktop: Horizontal (`md:flex-row`)
- Busca ocupa espaço disponível (`md:flex-1`)
- Botões não encolhem (`md:shrink-0`)

#### Tabela

```tsx
<th className="px-4 md:px-6 py-3 ...">
<td className="px-4 md:px-6 py-4 ...">
```

**Comportamento:**
- Mobile: Padding menor (`px-4`)
- Desktop: Padding maior (`md:px-6`)

---

## 🎭 Estados Visuais

### Hover

```tsx
<tr className="hover:bg-gray-50 cursor-pointer">
```

**Efeito:** Fundo cinza claro ao passar o mouse

### Active (Página Atual)

```tsx
className={`cursor-pointer hover:bg-gray-100 ${
  page === currentPage ? 'bg-[#242f65] text-white hover:bg-[#1a2148]' : ''
}`}
```

**Efeito:** Fundo azul com texto branco

### Disabled

```tsx
<Button disabled={isFetching}>
  Atualizar
</Button>
```

**Efeito:** Opacidade 50%, sem interação

### Loading

```tsx
<RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
```

**Efeito:** Ícone rotacionando

---

**Próximo:** [Integração com Backend →](./05-integracao-backend.md)

