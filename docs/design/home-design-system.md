# Design System - Página Home APFAR

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura de Layout](#estrutura-de-layout)
3. [Sistema de Cores](#sistema-de-cores)
4. [Tipografia](#tipografia)
5. [Componentes UI](#componentes-ui)
6. [Padrões de Espaçamento](#padrões-de-espaçamento)
7. [Ícones](#ícones)
8. [Animações e Transições](#animações-e-transições)
9. [Responsividade](#responsividade)
10. [Guia de Implementação](#guia-de-implementação)

---

## Visão Geral

Este documento detalha todos os padrões de design utilizados na página Home.tsx do sistema APFAR, permitindo replicar a mesma construção visual e arquitetural em outros projetos.

### Arquitetura Visual
A página Home utiliza um **layout split-screen** dividido em duas seções principais:
- **Lado Esquerdo (25%)**: Seção de branding com gradiente e animações
- **Lado Direito (75%)**: Conteúdo principal com navegação e informações

---

## Estrutura de Layout

### 1. Container Principal
```tsx
<div className="min-h-screen flex flex-col md:flex-row">
  {/* BrandingSection - 25% */}
  {/* ContentSection - 75% */}
</div>
```

**Características:**
- `min-h-screen`: Altura mínima de 100vh
- `flex flex-col md:flex-row`: Layout vertical em mobile, horizontal em desktop
- Divisão proporcional: 1/4 (branding) + 3/4 (conteúdo)

### 2. Seção de Branding (Lado Esquerdo)

**Estrutura:**
```tsx
<div className="hidden md:flex md:w-1/4 lg:w-1/4 bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-secondary sticky top-0 relative">
  {/* Background Pattern com círculos animados */}
  {/* Conteúdo centralizado */}
</div>
```

**Adaptação para novo tema:**
```tsx
// Substituir brand-primary e brand-secondary por:
className="bg-gradient-to-br from-primary via-primary/95 to-accent"
```

**Elementos da Seção de Branding:**

#### a) Background Pattern (Círculos Animados)
```tsx
<div className="absolute inset-0 opacity-10">
  <div className="absolute top-10 left-10 w-20 h-20 md:w-32 md:h-32 border-2 border-white rounded-full animate-pulse"></div>
  <div className="absolute top-32 right-10 md:right-20 w-12 h-12 md:w-20 md:h-20 border-2 border-white rounded-full animate-pulse delay-300"></div>
  <div className="absolute bottom-20 left-10 md:left-20 w-10 h-10 md:w-16 md:h-16 border-2 border-white rounded-full animate-pulse delay-500"></div>
  <div className="absolute bottom-32 right-8 md:right-16 w-16 h-16 md:w-24 md:h-24 border-2 border-white rounded-full animate-pulse delay-700"></div>
</div>
```

**Padrão:** 4 círculos decorativos com bordas brancas, opacidade 10%, animação pulse com delays escalonados

#### b) Logo e Descrição
```tsx
<div className="mb-6 md:mb-8 text-center">
  <img src="/logo.png" alt="Logo" className="mb-4 mx-auto" />
</div>

<div className="mb-8 md:mb-12">
  <p className="text-white/80 text-sm md:text-lg leading-relaxed mb-4 md:mb-6">
    Descrição do sistema
  </p>
</div>
```

#### c) Features List
```tsx
<div className="space-y-4 md:space-y-6">
  <div className="flex items-center space-x-3 md:space-x-4 group">
    <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
      <Shield className="w-4 h-4 md:w-5 md:h-5 text-white" />
    </div>
    <div>
      <h3 className="font-semibold text-white text-sm md:text-base">Título</h3>
      <p className="text-white/70 text-xs md:text-sm">Descrição</p>
    </div>
  </div>
</div>
```

**Padrão de Features:**
- Ícone em container com `bg-white/20` e `backdrop-blur-sm`
- Hover: `group-hover:bg-white/30`
- Transição suave: `transition-all duration-300`
- Espaçamento vertical: `space-y-4 md:space-y-6`

### 3. Seção de Conteúdo (Lado Direito)

**Container:**
```tsx
<div className="flex-1 md:w-3/4 lg:w-3/4 flex flex-col bg-brand-bg-primary">
  {/* Header Mobile */}
  {/* Main Content */}
  {/* Footer */}
</div>
```

**Adaptação para novo tema:**
```tsx
className="flex-1 md:w-3/4 lg:w-3/4 flex flex-col bg-muted"
```

#### a) Header com Saudação e Avatar
```tsx
<section className="mb-8">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-brand-primary">Bem-vindo!</h2>
      <p className="text-brand-text-secondary mt-1">Saudação personalizada</p>
    </div>
    {/* Dropdown Menu com Avatar */}
  </div>
</section>
```

**Adaptação para novo tema:**
```tsx
<h2 className="text-2xl md:text-3xl font-bold text-primary">Bem-vindo!</h2>
<p className="text-muted-foreground mt-1">Saudação personalizada</p>
```

#### b) Cards de Navegação (Módulos)
```tsx
<section className="mb-10">
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {/* NavigationCard */}
  </div>
</section>
```

**NavigationCard Component:**
```tsx
<div
  onClick={() => navigate(path)}
  className="flex flex-col items-center justify-center h-40 p-8 cursor-pointer transition-all duration-300 bg-white rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] relative overflow-hidden border border-transparent hover:border-brand-primary/20"
>
  <div className="mb-4 text-brand-primary">
    {icon}
  </div>
  <p className="font-medium text-center text-brand-text-primary text-base">
    {title}
  </p>
  <div className="absolute bottom-0 left-0 w-full h-1.5 bg-[#242f65]"></div>
</div>
```

**Adaptação para novo tema:**
```tsx
className="flex flex-col items-center justify-center h-40 p-8 cursor-pointer transition-all duration-300 bg-card rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] relative overflow-hidden border border-transparent hover:border-primary/20"

// Ícone
<div className="mb-4 text-primary">

// Texto
<p className="font-medium text-center text-foreground text-base">

// Barra inferior
<div className="absolute bottom-0 left-0 w-full h-1.5 bg-primary"></div>
```

**Características dos Cards de Navegação:**
- Altura fixa: `h-40`
- Padding generoso: `p-8`
- Ícone grande (40px): `<FileText size={40} />`
- Borda inferior decorativa: `h-1.5` na cor primária
- Hover: escala 102% + sombra aumentada + borda sutil
- Transição: `duration-300`

#### c) Botões de Ações Rápidas
```tsx
<section className="mb-10">
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
    {/* Botão Primário (Nova Licitação) */}
    <Button
      variant={undefined}
      className="h-12 bg-brand-primary hover:bg-brand-primary/90 text-white justify-center"
    >
      <PlusCircle className="h-4 w-4 mr-2" />
      Nova Licitação
    </Button>
    
    {/* Botões Secundários */}
    <Button
      variant="outline"
      className="h-12 justify-start border-brand-primary/20 hover:border-brand-primary hover:bg-white"
    >
      <FileText className="h-4 w-4 mr-2 text-brand-primary" />
      Ver Licitações
    </Button>
  </div>
</section>
```

**Adaptação para novo tema:**
```tsx
// Botão Primário
className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground justify-center"

// Botões Secundários
className="h-12 justify-start border-primary/20 hover:border-primary hover:bg-card"
<Icon className="h-4 w-4 mr-2 text-primary" />
```

**Padrão de Botões:**
- Altura fixa: `h-12`
- Ícone pequeno: `h-4 w-4`
- Espaçamento ícone-texto: `mr-2`
- Primário: fundo sólido, hover com opacidade 90%
- Secundário: outline, hover com borda mais forte

#### d) Cards de Licitações
```tsx
<Card className="transition-all hover:shadow-md">
  <CardHeader className="pb-2">
    <div className="flex items-center justify-between">
      <CardTitle className="text-base">Licitação Número</CardTitle>
      <Badge className="bg-brand-primary hover:bg-brand-primary/90">
        {String(id).padStart(9, '0')}
      </Badge>
    </div>
  </CardHeader>
  <CardContent className="space-y-3">
    {/* Linhas de informação */}
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-brand-primary" />
        <span className="font-medium">Modalidade:</span>
      </div>
      <span>{modalidade}</span>
    </div>
  </CardContent>
</Card>
```

**Adaptação para novo tema:**
```tsx
<Badge className="bg-primary hover:bg-primary/90 text-primary-foreground">
<Icon className="h-4 w-4 text-primary" />
```

**Padrão de Cards de Informação:**
- Hover: `hover:shadow-md`
- Header com `pb-2` (padding bottom reduzido)
- Content com `space-y-3` (espaçamento vertical entre linhas)
- Cada linha: `flex items-center justify-between text-sm`
- Ícones: `h-4 w-4` na cor primária
- Labels: `font-medium`

---

## Sistema de Cores

### Mapeamento de Cores APFAR → Novo Tema

| Uso no APFAR | Classe APFAR | Classe Novo Tema | Valor Novo Tema |
|--------------|--------------|------------------|-----------------|
| Cor primária | `bg-brand-primary` / `text-brand-primary` | `bg-primary` / `text-primary` | `hsl(211.89 94.06% 39.61%)` |
| Cor secundária | `bg-brand-secondary` | `bg-accent` | `hsl(204 93.75% 93.73%)` |
| Background principal | `bg-brand-bg-primary` | `bg-muted` | `hsl(210 20% 98.04%)` |
| Background secundário | `bg-brand-bg-secondary` | `bg-card` | `hsl(0 0% 100%)` |
| Texto primário | `text-brand-text-primary` | `text-foreground` | `hsl(0 0% 20%)` |
| Texto secundário | `text-brand-text-secondary` | `text-muted-foreground` | `hsl(220 8.94% 46.08%)` |
| Bordas | `border-brand-primary/20` | `border-primary/20` | - |

### Padrões de Aplicação de Cores

#### 1. Backgrounds
```tsx
// Container principal
className="bg-muted"  // Substitui bg-brand-bg-primary

// Cards
className="bg-card"  // Substitui bg-white ou bg-brand-bg-secondary

// Gradiente de branding
className="bg-gradient-to-br from-primary via-primary/95 to-accent"
```

#### 2. Textos
```tsx
// Títulos principais
className="text-primary"  // Substitui text-brand-primary

// Texto normal
className="text-foreground"  // Substitui text-brand-text-primary

// Texto secundário/muted
className="text-muted-foreground"  // Substitui text-brand-text-secondary
```

#### 3. Ícones
```tsx
// Ícones em destaque
className="text-primary"  // Sempre na cor primária

// Ícones em branco (sobre fundo escuro)
className="text-white"
```

#### 4. Bordas e Acentos
```tsx
// Bordas sutis
className="border-primary/20"

// Bordas em hover
className="hover:border-primary"

// Barra decorativa
className="bg-primary"
```

---

## Tipografia

### Hierarquia de Títulos

| Elemento | Classes | Tamanho Mobile | Tamanho Desktop |
|----------|---------|----------------|-----------------|
| H1 (Logo mobile) | `text-2xl font-bold` | 24px | 24px |
| H2 (Bem-vindo) | `text-2xl md:text-3xl font-bold` | 24px | 30px |
| H3 (Seção) | `text-lg font-semibold` | 18px | 18px |
| CardTitle | `text-base` | 16px | 16px |
| Feature Title | `text-sm md:text-base font-semibold` | 14px | 16px |

### Texto Corpo

| Uso | Classes | Tamanho |
|-----|---------|---------|
| Descrição principal | `text-sm md:text-lg leading-relaxed` | 14px → 18px |
| Texto normal | `text-sm` | 14px |
| Texto secundário | `text-xs md:text-sm` | 12px → 14px |
| Footer | `text-xs` | 12px |

### Pesos de Fonte

- **Bold**: `font-bold` (700) - Títulos principais
- **Semibold**: `font-semibold` (600) - Subtítulos e labels
- **Medium**: `font-medium` (500) - Labels de informação
- **Normal**: `font-normal` (400) - Texto corpo

### Família de Fontes

```css
--font-sans: Inter, sans-serif;
```

**Aplicação:**
```tsx
// Já aplicado globalmente via body
// Não precisa especificar em componentes individuais
```

---

## Componentes UI

### Lista de Componentes shadcn/ui Utilizados

1. **Card** (`@/components/ui/card`)
   - `Card`
   - `CardContent`
   - `CardHeader`
   - `CardTitle`

2. **Button** (`@/components/ui/button`)
   - Variantes: `default`, `outline`, `ghost`

3. **Badge** (`@/components/ui/badge`)

4. **Avatar** (`@/components/ui/avatar`)
   - `Avatar`
   - `AvatarImage`
   - `AvatarFallback`

5. **DropdownMenu** (`@/components/ui/dropdown-menu`)
   - `DropdownMenu`
   - `DropdownMenuTrigger`
   - `DropdownMenuContent`
   - `DropdownMenuItem`
   - `DropdownMenuLabel`
   - `DropdownMenuSeparator`

6. **AlertDialog** (`@/components/ui/alert-dialog`)
   - `AlertDialog`
   - `AlertDialogContent`
   - `AlertDialogHeader`
   - `AlertDialogTitle`
   - `AlertDialogDescription`
   - `AlertDialogFooter`
   - `AlertDialogAction`

7. **Skeleton** (`@/components/ui/skeleton`)

8. **Toast** (`@/components/ui/use-toast`)

### Padrões de Uso dos Componentes

#### Card
```tsx
<Card className="shadow-sm">  {/* ou transition-all hover:shadow-md */}
  <CardHeader className="pb-2">
    <CardTitle className="text-base">Título</CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    {/* Conteúdo */}
  </CardContent>
</Card>
```

#### Button
```tsx
// Primário
<Button className="bg-primary hover:bg-primary/90 text-primary-foreground">

// Outline
<Button variant="outline" className="border-primary/20 hover:border-primary">

// Ghost
<Button variant="ghost" className="text-primary">
```

#### Badge
```tsx
<Badge className="bg-primary hover:bg-primary/90 text-primary-foreground">
  {text}
</Badge>
```

#### Avatar com Fallback
```tsx
<Avatar className="h-8 w-8">
  {photoUrl && <AvatarImage src={photoUrl} alt={name} />}
  <AvatarFallback className="bg-primary text-white rounded-full">
    {initials}
  </AvatarFallback>
</Avatar>
```

#### Skeleton (Loading State)
```tsx
{loading && (
  <Card className="shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-base">Título</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Label</span>
        <Skeleton className="h-4 w-28" />
      </div>
    </CardContent>
  </Card>
)}
```

---

## Padrões de Espaçamento

### Espaçamento entre Seções
```tsx
<section className="mb-8">   {/* Seção de saudação */}
<section className="mb-10">  {/* Módulos e ações rápidas */}
<section>                     {/* Última seção (sem margin-bottom) */}
```

### Padding de Containers
```tsx
// Main content
className="px-4 py-6 md:px-6 md:py-10"

// Cards
className="p-8"  {/* NavigationCard */}

// Footer
className="px-4 py-6 md:px-6"
```

### Gaps em Grids
```tsx
// Cards de navegação
className="gap-6"

// Botões de ação rápida
className="gap-4"

// Cards de licitações
className="gap-4"
```

### Espaçamento Interno (space-y)
```tsx
// Features list
className="space-y-4 md:space-y-6"

// Card content
className="space-y-3"

// Ícone + texto
className="space-x-3 md:space-x-4"
```

### Margens Específicas
```tsx
// Entre ícone e título
className="mb-4"

// Entre título e descrição
className="mt-1"

// Entre ícone e texto
className="mr-2"  {/* Para ícones em botões */}
className="gap-2"  {/* Para ícones em labels */}
```

---

## Ícones

### Biblioteca
**Lucide React** - Todos os ícones são importados de `lucide-react`

### Ícones Utilizados e Contextos

| Ícone | Uso | Tamanho |
|-------|-----|---------|
| `LayoutDashboard` | Dashboard | 40px (cards), 16px (botões) |
| `FileText` | Licitações | 40px (cards), 16px (info) |
| `ClipboardList` | Contratos/Empenhos/Recebimentos | 40px (cards) |
| `PlusCircle` | Nova Licitação | 16px (botão) |
| `ArrowRight` | Ver mais/Abrir | 16px |
| `Building` | Órgão | 16px |
| `User` | Cliente/Perfil | 16px |
| `ReceiptText` | Faturamento | 40px |
| `CreditCard` | Cobrança | 40px |
| `ShoppingCart` | Pedidos | 40px |
| `PercentCircle` | Comissão | 40px |
| `Globe` | Origem | 16px |
| `CalendarClock` | Data/Hora | 16px |
| `ChevronDown` | Dropdown | 16px |
| `Shield` | Segurança (branding) | 16-20px |
| `TrendingUp` | Gestão (branding) | 16-20px |
| `Users` | Colaboração (branding) | 16-20px |

### Padrões de Tamanho
```tsx
// Cards de navegação (ícones grandes)
<FileText size={40} />

// Ícones em botões
<Icon className="h-4 w-4" />  {/* 16px */}

// Ícones em features (branding)
<Icon className="w-4 h-4 md:w-5 md:h-5" />  {/* 16px → 20px */}
```

### Cores de Ícones
```tsx
// Ícones em destaque
className="text-primary"

// Ícones em branding
className="text-white"

// Ícones em botões primários
{/* Herda a cor do texto do botão */}
```

---

## Animações e Transições

### Transições de Hover

#### Cards de Navegação
```tsx
className="transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
```
- Propriedades: todas (`transition-all`)
- Duração: 300ms
- Efeitos: sombra aumentada + escala 102%

#### Features (Branding)
```tsx
className="group-hover:bg-white/30 transition-all duration-300"
```
- Mudança de background em hover do grupo pai

#### Cards de Licitações
```tsx
className="transition-all hover:shadow-md"
```
- Apenas sombra aumentada

### Animações CSS

#### Pulse (Círculos de Background)
```tsx
className="animate-pulse"
```

**Delays escalonados:**
```tsx
className="animate-pulse"           {/* Sem delay */}
className="animate-pulse delay-300"
className="animate-pulse delay-500"
className="animate-pulse delay-700"
```

**Nota:** Os delays precisam ser definidos no Tailwind config:
```ts
// tailwind.config.ts
theme: {
  extend: {
    animation: {
      'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    },
    // Adicionar delays customizados se necessário
  }
}
```

### Efeitos Visuais

#### Backdrop Blur
```tsx
className="backdrop-blur-sm"
```
Usado em containers de ícones na seção de branding

#### Gradientes
```tsx
className="bg-gradient-to-br from-primary via-primary/95 to-accent"
```
- Direção: bottom-right (`to-br`)
- Paradas: início (primary) → meio (primary/95) → fim (accent)

---

## Responsividade

### Breakpoints Tailwind
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1400px (customizado)

### Padrões Responsivos

#### Layout Principal
```tsx
// Mobile: coluna (vertical)
// Desktop: linha (horizontal)
className="flex flex-col md:flex-row"
```

#### Branding Section
```tsx
// Oculto em mobile, visível em desktop
className="hidden md:flex md:w-1/4"
```

#### Grids
```tsx
// Módulos de navegação
className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
// Mobile: 1 coluna
// Small: 2 colunas
// Medium: 3 colunas
// Large: 4 colunas

// Botões de ação rápida
className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
// Mobile: 2 colunas
// Small: 3 colunas
// Large: 5 colunas

// Cards de licitações
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
// Mobile: 1 coluna
// Medium: 2 colunas
// Large: 3 colunas
```

#### Tipografia Responsiva
```tsx
className="text-2xl md:text-3xl"      // Títulos
className="text-sm md:text-lg"        // Descrições
className="text-xs md:text-sm"        // Texto pequeno
className="text-sm md:text-base"      // Features
```

#### Espaçamento Responsivo
```tsx
className="px-4 py-6 md:px-6 md:py-10"  // Padding de container
className="mb-6 md:mb-8"                 // Margens
className="space-y-4 md:space-y-6"       // Espaçamento vertical
className="space-x-3 md:space-x-4"       // Espaçamento horizontal
```

#### Tamanhos de Elementos
```tsx
className="w-8 h-8 md:w-10 md:h-10"  // Containers de ícones
className="w-4 h-4 md:w-5 md:h-5"    // Ícones
```

#### Visibilidade Condicional
```tsx
className="hidden sm:flex"           // Oculto em mobile
className="md:hidden"                // Visível apenas em mobile
className="hidden md:block"          // Oculto em mobile, visível em desktop
```

---

## Guia de Implementação

### Passo 1: Configurar Tema

#### 1.1 Criar `index.css` com o novo tema
Copiar o CSS fornecido com as variáveis CSS customizadas.

#### 1.2 Atualizar `tailwind.config.ts`
```ts
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        // ... outros
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}
```

### Passo 2: Instalar Componentes shadcn/ui

```bash
npx shadcn@latest add card
npx shadcn@latest add button
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add dropdown-menu
npx shadcn@latest add alert-dialog
npx shadcn@latest add skeleton
npx shadcn@latest add toast
```

### Passo 3: Instalar Dependências

```bash
npm install lucide-react
npm install react-router-dom
```

### Passo 4: Criar Estrutura de Componentes

#### 4.1 BrandingSection Component
```tsx
// components/BrandingSection.tsx
import { Shield, Users, TrendingUp } from "lucide-react";

export function BrandingSection() {
  return (
    <div className="hidden md:flex md:w-1/4 lg:w-1/4 bg-gradient-to-br from-primary via-primary/95 to-accent sticky top-0 relative">
      {/* Implementar conforme estrutura documentada */}
    </div>
  );
}
```

#### 4.2 NavigationCard Component
```tsx
// components/NavigationCard.tsx
interface NavigationCardProps {
  title: string;
  icon: React.ReactNode;
  path: string;
  onClick?: () => void;
}

export function NavigationCard({ title, icon, path, onClick }: NavigationCardProps) {
  const navigate = useNavigate();
  
  return (
    <div
      onClick={() => (onClick ? onClick() : navigate(path))}
      className="flex flex-col items-center justify-center h-40 p-8 cursor-pointer transition-all duration-300 bg-card rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] relative overflow-hidden border border-transparent hover:border-primary/20"
    >
      <div className="mb-4 text-primary">
        {icon}
      </div>
      <p className="font-medium text-center text-foreground text-base">
        {title}
      </p>
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-primary"></div>
    </div>
  );
}
```

### Passo 5: Implementar Página Home

```tsx
// pages/Home.tsx
import { NavigationCard } from '@/components/NavigationCard';
import { BrandingSection } from '@/components/BrandingSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// ... outros imports

export default function Home() {
  const navigate = useNavigate();
  
  const navigationItems = [
    { title: 'Módulo 1', icon: <FileText size={40} />, path: '/modulo1' },
    // ... outros módulos
  ];
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <BrandingSection />
      
      <div className="flex-1 md:w-3/4 lg:w-3/4 flex flex-col bg-muted">
        <main className="flex-1 px-4 py-6 md:px-6 md:py-10">
          {/* Implementar seções conforme documentado */}
        </main>
      </div>
    </div>
  );
}
```

### Checklist de Implementação

- [ ] Configurar tema no `index.css`
- [ ] Atualizar `tailwind.config.ts`
- [ ] Instalar todos os componentes shadcn/ui necessários
- [ ] Instalar Lucide React
- [ ] Criar componente `BrandingSection`
- [ ] Criar componente `NavigationCard`
- [ ] Implementar layout split-screen
- [ ] Adicionar seção de saudação com avatar
- [ ] Implementar grid de módulos de navegação
- [ ] Adicionar botões de ações rápidas
- [ ] Implementar cards de informações (se aplicável)
- [ ] Testar responsividade em diferentes breakpoints
- [ ] Verificar animações e transições
- [ ] Validar cores e contraste
- [ ] Testar estados de loading (Skeleton)
- [ ] Implementar tratamento de erros (AlertDialog)

---

## Notas Finais

### Diferenças Principais entre Temas

1. **Cores Primárias:**
   - APFAR: `#242f65` (azul escuro)
   - Novo: `hsl(211.89 94.06% 39.61%)` (azul vibrante)

2. **Backgrounds:**
   - APFAR: `#f1f4f8` (cinza azulado claro)
   - Novo: `hsl(210 20% 98.04%)` (cinza neutro muito claro)

3. **Abordagem:**
   - APFAR: Cores customizadas (`brand-*`)
   - Novo: Variáveis semânticas do shadcn/ui (`primary`, `muted`, etc.)

### Vantagens do Novo Tema

- **Consistência**: Usa nomenclatura padrão do shadcn/ui
- **Manutenibilidade**: Mais fácil atualizar cores globalmente
- **Dark Mode**: Suporte nativo para modo escuro
- **Acessibilidade**: Cores otimizadas para contraste

### Recomendações

1. **Sempre use variáveis semânticas** (`primary`, `muted`, etc.) em vez de cores hardcoded
2. **Teste em modo claro e escuro** se o projeto suportar
3. **Mantenha consistência** nos tamanhos de ícones e espaçamentos
4. **Use transições suaves** (300ms) para melhor UX
5. **Priorize responsividade** desde o início do desenvolvimento

---

**Documento criado em:** 2025-10-19  
**Baseado em:** `/home/emanuel/apfar/src/pages/Home.tsx`  
**Versão:** 1.0