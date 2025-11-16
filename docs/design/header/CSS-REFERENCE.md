# Referência Completa de Classes CSS

## 📋 Todas as Classes Tailwind Utilizadas

### Header Container

```html
<header class="bg-white border-b h-16 flex items-center justify-between px-6 sticky top-0 z-40">
```

| Classe | Propriedade CSS | Valor | Descrição |
|--------|----------------|-------|-----------|
| `bg-white` | background-color | #ffffff | Fundo branco |
| `border-b` | border-bottom-width | 1px | Borda inferior |
| `h-16` | height | 4rem (64px) | Altura fixa |
| `flex` | display | flex | Layout flexbox |
| `items-center` | align-items | center | Alinhamento vertical |
| `justify-between` | justify-content | space-between | Espaçamento entre elementos |
| `px-6` | padding-left, padding-right | 1.5rem (24px) | Padding horizontal |
| `sticky` | position | sticky | Posicionamento sticky |
| `top-0` | top | 0 | Posição no topo |
| `z-40` | z-index | 40 | Camada de sobreposição |

### Título (h1)

```html
<h1 class="text-xl font-semibold text-brand-primary">
```

| Classe | Propriedade CSS | Valor | Descrição |
|--------|----------------|-------|-----------|
| `text-xl` | font-size | 1.25rem (20px) | Tamanho da fonte |
| `font-semibold` | font-weight | 600 | Peso da fonte |
| `text-brand-primary` | color | #242f65 | Cor do texto |

### Seção Direita

```html
<div class="flex items-center gap-4">
```

| Classe | Propriedade CSS | Valor | Descrição |
|--------|----------------|-------|-----------|
| `flex` | display | flex | Layout flexbox |
| `items-center` | align-items | center | Alinhamento vertical |
| `gap-4` | gap | 1rem (16px) | Espaçamento entre elementos |

### Button (User Menu)

```html
<button class="justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 flex items-center gap-2">
```

| Classe | Propriedade CSS | Valor | Descrição |
|--------|----------------|-------|-----------|
| `justify-center` | justify-content | center | Centralização horizontal |
| `whitespace-nowrap` | white-space | nowrap | Sem quebra de linha |
| `rounded-md` | border-radius | calc(var(--radius) - 2px) | Cantos arredondados |
| `text-sm` | font-size | 0.875rem (14px) | Tamanho da fonte |
| `font-medium` | font-weight | 500 | Peso da fonte |
| `ring-offset-background` | --tw-ring-offset-color | hsl(var(--background)) | Cor do offset do anel |
| `transition-colors` | transition-property | color, background-color, border-color | Transição de cores |
| `focus-visible:outline-none` | outline | none (quando :focus-visible) | Remove outline padrão |
| `focus-visible:ring-2` | box-shadow | 0 0 0 2px (quando :focus-visible) | Anel de foco |
| `focus-visible:ring-ring` | --tw-ring-color | hsl(var(--ring)) | Cor do anel |
| `focus-visible:ring-offset-2` | --tw-ring-offset-width | 2px | Largura do offset |
| `disabled:pointer-events-none` | pointer-events | none (quando :disabled) | Desabilita eventos |
| `disabled:opacity-50` | opacity | 0.5 (quando :disabled) | Opacidade reduzida |
| `[&_svg]:pointer-events-none` | pointer-events | none (para SVGs filhos) | Desabilita eventos em SVGs |
| `[&_svg]:size-4` | width, height | 1rem (16px) (para SVGs filhos) | Tamanho dos SVGs |
| `[&_svg]:shrink-0` | flex-shrink | 0 (para SVGs filhos) | Não encolhe SVGs |
| `hover:bg-accent` | background-color | hsl(var(--accent)) (quando :hover) | Fundo no hover |
| `hover:text-accent-foreground` | color | hsl(var(--accent-foreground)) (quando :hover) | Texto no hover |
| `h-10` | height | 2.5rem (40px) | Altura do botão |
| `px-4` | padding-left, padding-right | 1rem (16px) | Padding horizontal |
| `py-2` | padding-top, padding-bottom | 0.5rem (8px) | Padding vertical |
| `flex` | display | flex | Layout flexbox |
| `items-center` | align-items | center | Alinhamento vertical |
| `gap-2` | gap | 0.5rem (8px) | Espaçamento entre elementos |

### Avatar Container

```html
<span class="relative flex shrink-0 overflow-hidden rounded-full h-8 w-8">
```

| Classe | Propriedade CSS | Valor | Descrição |
|--------|----------------|-------|-----------|
| `relative` | position | relative | Posicionamento relativo |
| `flex` | display | flex | Layout flexbox |
| `shrink-0` | flex-shrink | 0 | Não encolhe |
| `overflow-hidden` | overflow | hidden | Oculta overflow |
| `rounded-full` | border-radius | 9999px | Circular |
| `h-8` | height | 2rem (32px) | Altura |
| `w-8` | width | 2rem (32px) | Largura |

### Avatar Fallback

```html
<span class="flex items-center justify-center h-full w-full bg-brand-primary text-white rounded-full">
```

| Classe | Propriedade CSS | Valor | Descrição |
|--------|----------------|-------|-----------|
| `flex` | display | flex | Layout flexbox |
| `items-center` | align-items | center | Alinhamento vertical |
| `justify-center` | justify-content | center | Alinhamento horizontal |
| `h-full` | height | 100% | Altura total |
| `w-full` | width | 100% | Largura total |
| `bg-brand-primary` | background-color | #242f65 | Fundo azul |
| `text-white` | color | #ffffff | Texto branco |
| `rounded-full` | border-radius | 9999px | Circular |

### User Info Container

```html
<div class="text-sm text-left hidden md:block">
```

| Classe | Propriedade CSS | Valor | Descrição |
|--------|----------------|-------|-----------|
| `text-sm` | font-size | 0.875rem (14px) | Tamanho da fonte |
| `text-left` | text-align | left | Alinhamento à esquerda |
| `hidden` | display | none | Oculto por padrão |
| `md:block` | display | block (≥768px) | Visível em desktop |

### User Name

```html
<p class="font-medium">
```

| Classe | Propriedade CSS | Valor | Descrição |
|--------|----------------|-------|-----------|
| `font-medium` | font-weight | 500 | Peso médio |

### User Role

```html
<p class="text-xs text-muted-foreground">
```

| Classe | Propriedade CSS | Valor | Descrição |
|--------|----------------|-------|-----------|
| `text-xs` | font-size | 0.75rem (12px) | Tamanho pequeno |
| `text-muted-foreground` | color | hsl(var(--muted-foreground)) | Cor cinza |

### Ícones (User, ChevronDown)

```html
<svg class="lucide lucide-user h-4 w-4">
<svg class="lucide lucide-chevron-down h-4 w-4">
```

| Classe | Propriedade CSS | Valor | Descrição |
|--------|----------------|-------|-----------|
| `h-4` | height | 1rem (16px) | Altura |
| `w-4` | width | 1rem (16px) | Largura |

## 🎨 Variáveis CSS Customizadas

```css
:root {
  /* Cores semânticas */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 228 48% 30%;
  --primary-foreground: 210 40% 98%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --border: 214.3 31.8% 91.4%;
  --ring: 228 48% 30%;
  
  /* Border radius */
  --radius: 0.5rem;
}
```

## 📊 Resumo de Uso

### Cores Mais Usadas
1. `bg-white` - Fundo do header
2. `text-brand-primary` - Título
3. `bg-brand-primary` - Avatar fallback
4. `text-muted-foreground` - Texto secundário
5. `hover:bg-accent` - Hover do botão

### Espaçamentos Mais Usados
1. `gap-2` (8px) - Espaçamento interno
2. `gap-4` (16px) - Espaçamento entre seções
3. `px-6` (24px) - Padding horizontal do header
4. `h-16` (64px) - Altura do header
5. `h-8 w-8` (32px) - Tamanho do avatar

### Tipografia Mais Usada
1. `text-xl` (20px) - Título
2. `text-sm` (14px) - Nome do usuário
3. `text-xs` (12px) - Cargo
4. `font-semibold` (600) - Título
5. `font-medium` (500) - Nome

## 🔍 Classes por Categoria

### Layout
- `flex`, `items-center`, `justify-between`, `justify-center`
- `relative`, `sticky`, `top-0`
- `hidden`, `md:block`

### Dimensões
- `h-4`, `h-8`, `h-10`, `h-16`, `h-full`
- `w-4`, `w-8`, `w-full`

### Espaçamento
- `px-4`, `px-6`, `py-2`
- `gap-2`, `gap-4`

### Cores
- `bg-white`, `bg-brand-primary`, `bg-accent`
- `text-white`, `text-brand-primary`, `text-muted-foreground`
- `border-b`

### Tipografia
- `text-xs`, `text-sm`, `text-xl`
- `font-medium`, `font-semibold`
- `text-left`, `whitespace-nowrap`

### Bordas e Formas
- `rounded-md`, `rounded-full`
- `border-b`

### Estados
- `hover:bg-accent`, `hover:text-accent-foreground`
- `focus-visible:outline-none`, `focus-visible:ring-2`
- `disabled:pointer-events-none`, `disabled:opacity-50`

### Outros
- `overflow-hidden`, `shrink-0`
- `transition-colors`
- `z-40`

