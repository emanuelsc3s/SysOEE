# Header CRUD - Cabeçalho de Formulários

## 📋 Visão Geral

O Header CRUD é um componente de cabeçalho padrão utilizado em formulários de cadastro e edição (CRUD) do sistema APFAR. Ele fornece uma interface consistente com título, subtítulo e ações principais.

## 🎯 Anatomia do Componente

```
┌─────────────────────────────────────────────────────────────────┐
│ [Título]                              [Voltar] [Excluir] [Salvar]│
│ [Subtítulo]                                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Estrutura Hierárquica

```
div.flex.items-center.justify-between (Container Principal)
├── div.flex.items-center.gap-2 (Seção Esquerda - Informações)
│   └── div
│       ├── h1.text-2xl.font-bold.text-brand-primary (Título)
│       └── p.text-brand-text-secondary (Subtítulo)
└── div.flex.gap-2 (Seção Direita - Ações)
    ├── Button[variant="outline"] (Voltar)
    ├── Button[variant="destructive"] (Excluir)
    └── Button[className="bg-brand-primary"] (Salvar)
```

## 🧩 Elementos do Componente

### 1. Container Principal
```tsx
<div className="flex items-center justify-between">
```

**Classes Tailwind:**
- `flex`: Define layout flexbox
- `items-center`: Alinha itens verticalmente ao centro
- `justify-between`: Distribui espaço entre os elementos (esquerda e direita)

**Comportamento:**
- Cria um layout de duas colunas
- Informações à esquerda, ações à direita
- Responsivo e adaptável

---

### 2. Seção de Informações (Esquerda)

#### Container de Informações
```tsx
<div className="flex items-center gap-2">
  <div>
    {/* Título e Subtítulo */}
  </div>
</div>
```

**Classes Tailwind:**
- `flex`: Layout flexbox
- `items-center`: Alinhamento vertical
- `gap-2`: Espaçamento de 0.5rem (8px) entre elementos

#### Título
```tsx
<h1 className="text-2xl font-bold text-brand-primary">
  {id ? `Licitação Número: [${id}]` : 'Cadastro de Licitação'}
</h1>
```

**Classes Tailwind:**
- `text-2xl`: Tamanho de fonte 1.5rem (24px)
- `font-bold`: Peso da fonte 700
- `text-brand-primary`: Cor primária da marca (#242f65)

**Comportamento:**
- Título dinâmico baseado no contexto (novo ou edição)
- Exibe número da licitação quando em modo de edição

#### Subtítulo
```tsx
<p className="text-brand-text-secondary">
  Registre uma nova licitação ou edite existente
</p>
```

**Classes Tailwind:**
- `text-brand-text-secondary`: Cor secundária de texto (#57636c)

**Comportamento:**
- Fornece contexto adicional sobre a funcionalidade da página

---

### 3. Seção de Ações (Direita)

#### Container de Botões
```tsx
<div className="flex gap-2">
  {/* Botões de ação */}
</div>
```

**Classes Tailwind:**
- `flex`: Layout flexbox horizontal
- `gap-2`: Espaçamento de 0.5rem (8px) entre botões

**Comportamento:**
- Agrupa botões de ação
- Mantém espaçamento consistente

## 🎨 Variantes de Botões

### 1. Botão Voltar (Outline)

```tsx
<Button
  variant="outline"
  className="border-gray-300 hover:bg-gray-100 min-w-[120px] justify-center"
  onClick={handleBackButtonClick}
>
  <ArrowLeft className="mr-2 h-4 w-4" />
  Voltar
</Button>
```

**Propriedades:**
- **Variante:** `outline`
- **Classes customizadas:**
  - `border-gray-300`: Borda cinza clara
  - `hover:bg-gray-100`: Fundo cinza claro no hover
  - `min-w-[120px]`: Largura mínima de 120px
  - `justify-center`: Centraliza conteúdo

**Ícone:** `ArrowLeft` (Lucide React)
- Tamanho: 16px (h-4 w-4)
- Margem direita: 0.5rem (mr-2)

**Uso:** Navegação de retorno, ação secundária não destrutiva

---

### 2. Botão Excluir (Destructive)

```tsx
<Button
  variant="destructive"
  className="min-w-[120px] justify-center"
  onClick={() => setIsDeleteDialogOpen(true)}
>
  <Trash className="mr-2 h-4 w-4" />
  Excluir
</Button>
```

**Propriedades:**
- **Variante:** `destructive`
- **Cores:**
  - Fundo: `hsl(0 84.2% 60.2%)` (vermelho)
  - Texto: `hsl(210 40% 98%)` (branco)
  - Hover: `bg-destructive/90` (90% de opacidade)

**Ícone:** `Trash` (Lucide React)

**Uso:** Ações destrutivas que removem ou excluem dados

---

### 3. Botão Salvar (Primary)

```tsx
<Button
  type="button"
  className="bg-brand-primary hover:bg-brand-primary/90 min-w-[120px] justify-center"
  onClick={handleSave}
  disabled={loadingLicitacao}
>
  <Save className="mr-2 h-4 w-4" />
  {loadingLicitacao ? 'Salvando...' : 'Salvar'}
</Button>
```

**Propriedades:**
- **Variante:** `default` (implícita)
- **Classes customizadas:**
  - `bg-brand-primary`: Fundo com cor primária (#242f65)
  - `hover:bg-brand-primary/90`: Hover com 90% de opacidade
- **Estado disabled:** Desabilitado durante carregamento

**Ícone:** `Save` (Lucide React)

**Comportamento:**
- Texto dinâmico baseado no estado de carregamento
- Desabilitado durante operação de salvamento

**Uso:** Ação primária de confirmação/salvamento

## 📐 Sistema de Espaçamento

| Elemento | Propriedade | Valor | Pixels |
|----------|-------------|-------|--------|
| Gap entre seções | `gap-2` | 0.5rem | 8px |
| Gap entre botões | `gap-2` | 0.5rem | 8px |
| Padding horizontal botão | `px-4` | 1rem | 16px |
| Padding vertical botão | `py-2` | 0.5rem | 8px |
| Margem direita ícone | `mr-2` | 0.5rem | 8px |
| Altura botão | `h-10` | 2.5rem | 40px |

## 🎨 Tokens de Design Utilizados

### Cores

| Token | Valor | Uso |
|-------|-------|-----|
| `brand-primary` | `#242f65` | Título e botão primário |
| `brand-text-secondary` | `#57636c` | Subtítulo |
| `destructive` | `hsl(0 84.2% 60.2%)` | Botão excluir |
| `gray-300` | Tailwind padrão | Borda botão outline |
| `gray-100` | Tailwind padrão | Hover botão outline |

### Tipografia

| Elemento | Tamanho | Peso | Família |
|----------|---------|------|---------|
| Título (h1) | 1.5rem (24px) | 700 (bold) | Inter |
| Subtítulo (p) | 1rem (16px) | 400 (regular) | Inter |
| Texto botão | 0.875rem (14px) | 500 (medium) | Inter |

## 🔄 Estados Interativos

### Botões - Estados Visuais

#### Estado Normal
- Cores base conforme variante
- Cursor pointer
- Transição suave de cores

#### Estado Hover
```css
/* Outline */
hover:bg-gray-100

/* Destructive */
hover:bg-destructive/90

/* Primary */
hover:bg-brand-primary/90
```

#### Estado Focus
```css
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-ring
focus-visible:ring-offset-2
```

- Anel de foco visível para acessibilidade
- Cor do anel: `hsl(228 48% 30%)`
- Offset de 2px

#### Estado Disabled
```css
disabled:pointer-events-none
disabled:opacity-50
```

- Cursor padrão (não clicável)
- Opacidade reduzida a 50%
- Eventos de ponteiro desabilitados

## ♿ Acessibilidade

### Boas Práticas Implementadas

1. **Hierarquia Semântica**
   - Uso correto de `<h1>` para título principal
   - Uso de `<p>` para texto descritivo

2. **Estados de Foco**
   - Anel de foco visível em todos os botões
   - Contraste adequado para visibilidade

3. **Feedback Visual**
   - Estado disabled claramente visível
   - Texto dinâmico durante carregamento ("Salvando...")

4. **Ícones com Texto**
   - Todos os botões possuem texto descritivo
   - Ícones complementam, não substituem o texto

### Recomendações Adicionais

```tsx
// Adicionar aria-label para contexto adicional
<Button
  variant="destructive"
  aria-label="Excluir licitação permanentemente"
>
  <Trash className="mr-2 h-4 w-4" />
  Excluir
</Button>

// Indicar estado de carregamento
<Button
  disabled={loadingLicitacao}
  aria-busy={loadingLicitacao}
>
  <Save className="mr-2 h-4 w-4" />
  {loadingLicitacao ? 'Salvando...' : 'Salvar'}
</Button>
```

## 📱 Responsividade

### Comportamento Mobile

O componente possui uma versão mobile com botões flutuantes:

```tsx
{/* Botões flutuantes - apenas em dispositivos móveis */}
<div className="fixed bottom-4 right-4 left-4 z-10 md:hidden">
  <div className="bg-white rounded-lg shadow-lg p-3 flex justify-between gap-2">
    {/* Botões adaptados para mobile */}
  </div>
</div>
```

**Características:**
- Oculto em telas médias e maiores (`md:hidden`)
- Posicionamento fixo na parte inferior
- Sombra elevada para destaque
- Espaçamento reduzido para otimizar espaço

### Breakpoints

| Breakpoint | Comportamento |
|------------|---------------|
| `< 768px` | Botões flutuantes fixos na parte inferior |
| `≥ 768px` | Header padrão no topo do formulário |

## 💻 Exemplo de Implementação

Ver arquivo: [/exemplos/header-crud-exemplo.tsx](../exemplos/header-crud-exemplo.tsx)

## 🔗 Componentes Relacionados

- [Sistema de Botões](./botoes.md)
- [Tipografia](./tipografia.md)
- [Tokens de Cores](../tokens/cores.md)
- [Sistema de Espaçamento](../tokens/espacamento.md)

---

**Última atualização:** 2025-01-16

