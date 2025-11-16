# Componentes UI - shadcn/ui

## 📦 Componentes Utilizados

O AppHeader utiliza três componentes principais do shadcn/ui, todos baseados em primitivos do Radix UI.

## 1. Button Component

### Localização
`/src/components/ui/button.tsx`

### Dependências
```json
{
  "@radix-ui/react-slot": "^1.0.0",
  "class-variance-authority": "^0.7.0"
}
```

### Variantes Disponíveis

```typescript
variant: {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",  // ← Usado no AppHeader
  link: "text-primary underline-offset-4 hover:underline",
}
```

### Tamanhos Disponíveis

```typescript
size: {
  default: "h-10 px-4 py-2",  // ← Usado no AppHeader
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
}
```

### Uso no AppHeader

```tsx
<Button variant="ghost" className="flex items-center gap-2">
  {/* Conteúdo do botão */}
</Button>
```

**Características:**
- Variante `ghost`: Fundo transparente, hover com fundo cinza claro
- Tamanho `default`: Altura 40px, padding horizontal 16px
- Propriedade `asChild`: Permite composição com DropdownMenuTrigger

### Classes Base Aplicadas

```css
/* Todas as variantes incluem: */
inline-flex items-center justify-center gap-2
whitespace-nowrap rounded-md text-sm font-medium
ring-offset-background transition-colors
focus-visible:outline-none focus-visible:ring-2 
focus-visible:ring-ring focus-visible:ring-offset-2
disabled:pointer-events-none disabled:opacity-50
[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0
```

## 2. Avatar Component

### Localização
`/src/components/ui/avatar.tsx`

### Dependências
```json
{
  "@radix-ui/react-avatar": "^1.0.0"
}
```

### Subcomponentes

#### Avatar (Root)
Container principal do avatar.

```tsx
<Avatar className="h-8 w-8">
  {/* Conteúdo */}
</Avatar>
```

**Classes padrão:**
```css
relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full
```

#### AvatarImage
Exibe a imagem do usuário (quando disponível).

```tsx
<AvatarImage src={fotoUrl} alt="Nome do usuário" />
```

**Classes padrão:**
```css
aspect-square h-full w-full
```

**Comportamento:**
- Carrega imagem assincronamente
- Fallback automático se imagem falhar

#### AvatarFallback
Exibido quando não há imagem ou durante carregamento.

```tsx
<AvatarFallback className="bg-brand-primary text-white">
  <User className="h-4 w-4" />
</AvatarFallback>
```

**Classes padrão:**
```css
flex h-full w-full items-center justify-center rounded-full bg-muted
```

### Uso Completo no AppHeader

```tsx
<Avatar className="h-8 w-8">
  {fotoUrl ? (
    <AvatarImage src={fotoUrl} alt={userName || 'Foto do usuário'} />
  ) : null}
  <AvatarFallback className="h-full w-full bg-brand-primary text-white rounded-full">
    <User className="h-4 w-4" />
  </AvatarFallback>
</Avatar>
```

**Customizações aplicadas:**
- Tamanho reduzido: `h-8 w-8` (32px, padrão é 40px)
- Fallback customizado: Fundo azul primário com ícone branco
- Condicional: Só renderiza AvatarImage se houver URL

## 3. DropdownMenu Component

### Localização
`/src/components/ui/dropdown-menu.tsx`

### Dependências
```json
{
  "@radix-ui/react-dropdown-menu": "^2.0.0",
  "lucide-react": "^0.263.0"
}
```

### Subcomponentes Utilizados

#### DropdownMenu (Root)
Container principal que gerencia estado.

```tsx
<DropdownMenu>
  {/* Trigger e Content */}
</DropdownMenu>
```

#### DropdownMenuTrigger
Elemento que abre/fecha o menu.

```tsx
<DropdownMenuTrigger asChild>
  <Button variant="ghost">
    {/* Conteúdo do botão */}
  </Button>
</DropdownMenuTrigger>
```

**Propriedade `asChild`:**
- Permite usar Button como trigger
- Evita wrapper extra de botão

#### DropdownMenuContent
Container do menu dropdown.

```tsx
<DropdownMenuContent align="end" className="w-56">
  {/* Itens do menu */}
</DropdownMenuContent>
```

**Props:**
- `align="end"`: Alinha à direita do trigger
- `sideOffset={4}`: Espaçamento de 4px do trigger (padrão)
- `className="w-56"`: Largura fixa de 224px

**Classes padrão:**
```css
z-50 min-w-[8rem] overflow-hidden rounded-md border 
bg-popover p-1 text-popover-foreground shadow-md
data-[state=open]:animate-in data-[state=closed]:animate-out
data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
```

#### DropdownMenuLabel
Rótulo não-clicável do menu.

```tsx
<DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
```

**Classes padrão:**
```css
px-2 py-1.5 text-sm font-semibold
```

#### DropdownMenuSeparator
Linha divisória entre itens.

```tsx
<DropdownMenuSeparator />
```

**Classes padrão:**
```css
-mx-1 my-1 h-px bg-muted
```

#### DropdownMenuItem
Item clicável do menu.

```tsx
<DropdownMenuItem onClick={() => navigate('/perfil')}>
  <User className="mr-2 h-4 w-4" />
  <span>Perfil</span>
</DropdownMenuItem>
```

**Classes padrão:**
```css
relative flex cursor-default select-none items-center 
rounded-sm px-2 py-1.5 text-sm outline-none 
transition-colors focus:bg-accent focus:text-accent-foreground
data-[disabled]:pointer-events-none data-[disabled]:opacity-50
```

### Estrutura Completa no AppHeader

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" className="flex items-center gap-2">
      {/* Avatar e informações */}
    </Button>
  </DropdownMenuTrigger>
  
  <DropdownMenuContent align="end" className="w-56">
    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
    <DropdownMenuSeparator />
    
    <DropdownMenuItem onClick={() => navigate('/perfil')}>
      <User className="mr-2 h-4 w-4" />
      <span>Perfil</span>
    </DropdownMenuItem>
    
    <DropdownMenuSeparator />
    
    <DropdownMenuItem onClick={handleSignOut}>
      Sair
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## 🎨 Ícones Lucide React

### Ícones Utilizados

```tsx
import { ChevronDown, User } from "lucide-react";
```

#### User
- **Uso**: Fallback do avatar
- **Tamanho**: `h-4 w-4` (16px)
- **Cor**: Branca (sobre fundo azul)

#### ChevronDown
- **Uso**: Indicador de dropdown
- **Tamanho**: `h-4 w-4` (16px)
- **Cor**: Herdada do botão

### Instalação

```bash
npm install lucide-react
```

### Características
- Ícones SVG otimizados
- Totalmente customizáveis via props
- Suporte a acessibilidade
- Tree-shaking automático

