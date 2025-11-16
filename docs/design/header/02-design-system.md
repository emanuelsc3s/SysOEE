# Design System - Tokens e Estilos

## 🎨 Sistema de Cores

### Cores da Marca (Brand Colors)

Definidas em `tailwind.config.ts`:

```typescript
brand: {
  primary: '#242f65',        // Azul escuro principal
  secondary: '#62a183',      // Verde secundário
  tertiary: '#ee8b60',       // Laranja terciário
  alternate: '#e0e3e7',      // Cinza alternativo
  'text-primary': '#141b1b', // Texto principal
  'text-secondary': '#57636c', // Texto secundário
  'bg-primary': '#f1f4f8',   // Fundo primário
  'bg-secondary': '#ffffff',  // Fundo secundário (branco)
  'accent-1': '#4c4b39ef',   // Acento 1
  'accent-2': '#4d39d2c0',   // Acento 2
  'accent-3': '#4dee8b60',   // Acento 3
  'accent-4': '#ccffffff',   // Acento 4
}
```

### Cores Semânticas (CSS Variables)

Definidas em `src/index.css` usando formato HSL:

```css
:root {
  /* Cores de fundo */
  --background: 0 0% 100%;           /* Branco puro */
  --foreground: 222.2 84% 4.9%;      /* Texto escuro */
  
  /* Cores primárias */
  --primary: 228 48% 30%;            /* Azul primário (equivalente a #242f65) */
  --primary-foreground: 210 40% 98%; /* Texto sobre primário */
  
  /* Cores secundárias */
  --secondary: 147 25% 51%;          /* Verde secundário */
  --secondary-foreground: 222.2 47.4% 11.2%;
  
  /* Cores de estado */
  --muted: 210 40% 96.1%;            /* Cinza claro */
  --muted-foreground: 215.4 16.3% 46.9%; /* Texto secundário */
  --accent: 210 40% 96.1%;           /* Cor de destaque */
  --accent-foreground: 222.2 47.4% 11.2%;
  
  /* Bordas e inputs */
  --border: 214.3 31.8% 91.4%;       /* Cinza para bordas */
  --input: 214.3 31.8% 91.4%;
  --ring: 228 48% 30%;               /* Anel de foco */
  
  /* Border radius */
  --radius: 0.5rem;                  /* 8px */
}
```

### Uso no AppHeader

| Elemento | Classe Tailwind | Cor Resultante | Uso |
|----------|----------------|----------------|-----|
| Header background | `bg-white` | #ffffff | Fundo do cabeçalho |
| Título | `text-brand-primary` | #242f65 | Título da aplicação |
| Borda inferior | `border-b` | hsl(214.3 31.8% 91.4%) | Separação visual |
| Avatar fallback | `bg-brand-primary text-white` | #242f65 / #ffffff | Fundo e ícone |
| Texto cargo | `text-muted-foreground` | hsl(215.4 16.3% 46.9%) | Informação secundária |

## 📐 Sistema de Espaçamento

### Escala Tailwind (base: 0.25rem = 4px)

```
gap-2  = 0.5rem  = 8px   (espaçamento interno do botão)
gap-4  = 1rem    = 16px  (espaçamento entre elementos)
px-6   = 1.5rem  = 24px  (padding horizontal do header)
h-16   = 4rem    = 64px  (altura do header)
h-8    = 2rem    = 32px  (tamanho do avatar)
w-8    = 2rem    = 32px  (largura do avatar)
h-4    = 1rem    = 16px  (tamanho dos ícones)
w-4    = 1rem    = 16px  (largura dos ícones)
```

### Aplicação no AppHeader

```html
<!-- Header -->
<header class="h-16 px-6">
  <!-- Altura fixa de 64px, padding horizontal de 24px -->
  
  <!-- Seção direita -->
  <div class="gap-4">
    <!-- Espaçamento de 16px entre elementos -->
    
    <!-- Botão do usuário -->
    <Button class="gap-2">
      <!-- Espaçamento de 8px entre avatar e texto -->
      
      <!-- Avatar -->
      <Avatar class="h-8 w-8">
        <!-- 32px × 32px -->
      </Avatar>
    </Button>
  </div>
</header>
```

## 🔤 Sistema Tipográfico

### Fonte Base

```css
/* Definido em src/index.css */
body {
  font-family: 'Inter', sans-serif;
}
```

### Escala de Tamanhos

| Classe | Tamanho | Uso no AppHeader |
|--------|---------|------------------|
| `text-xl` | 1.25rem (20px) | Título principal |
| `text-sm` | 0.875rem (14px) | Nome do usuário |
| `text-xs` | 0.75rem (12px) | Cargo/função |

### Pesos de Fonte

| Classe | Peso | Valor | Uso |
|--------|------|-------|-----|
| `font-semibold` | 600 | Semi-negrito | Título e headings |
| `font-medium` | 500 | Médio | Nome do usuário |
| (padrão) | 400 | Regular | Texto do cargo |

### Aplicação

```tsx
<h1 className="text-xl font-semibold text-brand-primary">
  {/* 20px, peso 600, cor #242f65 */}
  APFARMA - Plataforma Integrada de Gestão
</h1>

<p className="font-medium">
  {/* 14px (herdado), peso 500 */}
  Emanuel Silva
</p>

<p className="text-xs text-muted-foreground">
  {/* 12px, peso 400, cor cinza */}
  Administrador
</p>
```

## 🎭 Estados Interativos

### Button (variant="ghost")

```css
/* Classes base do botão ghost */
.button-ghost {
  /* Estado normal - transparente */
  background: transparent;
  
  /* Hover */
  &:hover {
    background: hsl(var(--accent));      /* Cinza claro */
    color: hsl(var(--accent-foreground)); /* Texto escuro */
  }
  
  /* Focus visible (teclado) */
  &:focus-visible {
    outline: none;
    ring: 2px solid hsl(var(--ring));    /* Anel azul */
    ring-offset: 2px;
  }
  
  /* Disabled */
  &:disabled {
    pointer-events: none;
    opacity: 0.5;
  }
}
```

### Classes Aplicadas

```html
<button class="
  hover:bg-accent 
  hover:text-accent-foreground 
  focus-visible:outline-none 
  focus-visible:ring-2 
  focus-visible:ring-ring 
  focus-visible:ring-offset-2 
  disabled:pointer-events-none 
  disabled:opacity-50
">
```

## 📱 Breakpoints Responsivos

### Sistema Tailwind

```typescript
// tailwind.config.ts
screens: {
  'sm': '640px',
  'md': '768px',   // Usado no AppHeader
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1400px', // Customizado
}
```

### Uso no AppHeader

```html
<!-- Oculto em mobile, visível em desktop -->
<div class="hidden md:block">
  <p>Emanuel Silva</p>
  <p>Administrador</p>
</div>
```

**Comportamento:**
- `< 768px`: Elemento oculto
- `≥ 768px`: Elemento visível (block)

## 🎨 Border Radius

```css
:root {
  --radius: 0.5rem; /* 8px */
}

/* Escala derivada */
border-radius: {
  'lg': 'var(--radius)',           /* 8px */
  'md': 'calc(var(--radius) - 2px)', /* 6px */
  'sm': 'calc(var(--radius) - 4px)', /* 4px */
  'full': '9999px',                /* Circular */
}
```

### Aplicação

```html
<!-- Avatar circular -->
<Avatar class="rounded-full">

<!-- Botão com cantos arredondados -->
<Button class="rounded-md">  <!-- 6px -->
```

## 🌓 Suporte a Dark Mode

O sistema possui suporte a dark mode via classe `.dark`:

```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... outras variáveis invertidas */
}
```

**Nota:** O AppHeader atual usa cores fixas (`bg-white`, `text-brand-primary`), mas pode ser adaptado para dark mode substituindo por variáveis semânticas.

