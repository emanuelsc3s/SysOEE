# Base CSS - Design System

## Índice
1. [Visão Geral](#visão-geral)
2. [Código Completo](#código-completo)
3. [Explicação Detalhada](#explicação-detalhada)
4. [Variáveis CSS Customizadas](#variáveis-css-customizadas)
5. [Modo Escuro (Dark Mode)](#modo-escuro-dark-mode)
6. [Estilos Base Globais](#estilos-base-globais)
7. [Como Usar](#como-usar)
8. [Boas Práticas](#boas-práticas)

---

## Visão Geral

Este documento detalha a estrutura e funcionamento do arquivo `index.css` que define a base do design system. O arquivo utiliza **Tailwind CSS v3** com variáveis CSS customizadas para criar um sistema de design consistente, escalável e com suporte nativo a modo escuro.

### Características Principais
- ✅ Sistema de cores semântico baseado em HSL
- ✅ Suporte nativo a Dark Mode
- ✅ Variáveis CSS reutilizáveis
- ✅ Integração completa com Tailwind CSS
- ✅ Sistema de sombras padronizado
- ✅ Tipografia com múltiplas famílias de fontes
- ✅ Componentes de sidebar customizados
- ✅ Paleta de cores para gráficos (charts)

---

## Código Completo

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Definition of the design system. All colors, gradients, fonts, etc should be defined here. */

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 20%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 25%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 20%;
    --primary: 211.8947 94.0594% 39.6078%;
    --primary-foreground: 0 0% 100%;
    --secondary: 220.0000 14.2857% 95.8824%;
    --secondary-foreground: 215 13.7931% 34.1176%;
    --muted: 210 20.0000% 98.0392%;
    --muted-foreground: 220 8.9362% 46.0784%;
    --accent: 204.0000 93.7500% 93.7255%;
    --accent-foreground: 224.4444 64.2857% 32.9412%;
    --destructive: 0 84.2365% 60.1961%;
    --destructive-foreground: 0 0% 100%;
    --border: 220 13.0435% 90.9804%;
    --input: 220 13.0435% 90.9804%;
    --ring: 217.2193 91.2195% 59.8039%;
    --chart-1: 217.2193 91.2195% 59.8039%;
    --chart-2: 221.2121 83.1933% 53.3333%;
    --chart-3: 224.2781 76.3265% 48.0392%;
    --chart-4: 225.9310 70.7317% 40.1961%;
    --chart-5: 224.4444 64.2857% 32.9412%;
    --sidebar: 210 20.0000% 98.0392%;
    --sidebar-foreground: 0 0% 20%;
    --sidebar-primary: 217.2193 91.2195% 59.8039%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 204.0000 93.7500% 93.7255%;
    --sidebar-accent-foreground: 224.4444 64.2857% 32.9412%;
    --sidebar-border: 220 13.0435% 90.9804%;
    --sidebar-ring: 217.2193 91.2195% 59.8039%;
    --font-sans: Inter, sans-serif;
    --font-serif: Source Serif 4, serif;
    --font-mono: JetBrains Mono, monospace;
    --radius: 0.375rem;
    --shadow-x: 0;
    --shadow-y: 1px;
    --shadow-blur: 3px;
    --shadow-spread: 0px;
    --shadow-opacity: 0.1;
    --shadow-color: oklch(0 0 0);
    --shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
    --shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
    --shadow-sm: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
    --shadow: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
    --shadow-md: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10);
    --shadow-lg: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10);
    --shadow-xl: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10);
    --shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25);
    --tracking-normal: 0em;
    --spacing: 0.25rem;
  }

  .dark {
    --background: 0 0% 9.0196%;
    --foreground: 0 0% 89.8039%;
    --card: 0 0% 14.9020%;
    --card-foreground: 0 0% 89.8039%;
    --popover: 0 0% 14.9020%;
    --popover-foreground: 0 0% 89.8039%;
    --primary: 217.2193 91.2195% 59.8039%;
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 14.9020%;
    --secondary-foreground: 0 0% 89.8039%;
    --muted: 0 0% 12.1569%;
    --muted-foreground: 0 0% 63.9216%;
    --accent: 224.4444 64.2857% 32.9412%;
    --accent-foreground: 213.3333 96.9231% 87.2549%;
    --destructive: 0 84.2365% 60.1961%;
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 25.0980%;
    --input: 0 0% 25.0980%;
    --ring: 217.2193 91.2195% 59.8039%;
    --chart-1: 213.1169 93.9024% 67.8431%;
    --chart-2: 217.2193 91.2195% 59.8039%;
    --chart-3: 221.2121 83.1933% 53.3333%;
    --chart-4: 224.2781 76.3265% 48.0392%;
    --chart-5: 225.9310 70.7317% 40.1961%;
    --sidebar: 0 0% 9.0196%;
    --sidebar-foreground: 0 0% 89.8039%;
    --sidebar-primary: 217.2193 91.2195% 59.8039%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 224.4444 64.2857% 32.9412%;
    --sidebar-accent-foreground: 213.3333 96.9231% 87.2549%;
    --sidebar-border: 0 0% 25.0980%;
    --sidebar-ring: 217.2193 91.2195% 59.8039%;
    --font-sans: Inter, sans-serif;
    --font-serif: Source Serif 4, serif;
    --font-mono: JetBrains Mono, monospace;
    --radius: 0.375rem;
    --shadow-x: 0;
    --shadow-y: 1px;
    --shadow-blur: 3px;
    --shadow-spread: 0px;
    --shadow-opacity: 0.1;
    --shadow-color: oklch(0 0 0);
    --shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
    --shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
    --shadow-sm: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
    --shadow: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
    --shadow-md: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10);
    --shadow-lg: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10);
    --shadow-xl: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10);
    --shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25);
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
  }
}
```

---

## Explicação Detalhada

### 1. Diretivas Tailwind

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**O que faz:**
- `@tailwind base`: Injeta os estilos base do Tailwind (reset CSS, normalize)
- `@tailwind components`: Injeta classes de componentes customizados
- `@tailwind utilities`: Injeta todas as classes utilitárias do Tailwind

**Por que é importante:**
Essas diretivas são processadas pelo Tailwind durante o build e substituídas pelo CSS gerado. A ordem importa: base → components → utilities.

### 2. Camada Base (@layer base)

```css
@layer base {
  :root { /* variáveis */ }
  .dark { /* variáveis dark mode */ }
}
```

**O que faz:**
- Define variáveis CSS customizadas no escopo `:root` (modo claro)
- Define variáveis CSS customizadas no escopo `.dark` (modo escuro)
- Usa `@layer base` para garantir que esses estilos sejam incluídos na camada base do Tailwind

**Por que usar @layer:**
Permite que o Tailwind organize corretamente os estilos e possibilita sobrescrever com classes utilitárias quando necessário.

### 3. Formato de Cores HSL

```css
--primary: 211.8947 94.0594% 39.6078%;
```

**Formato:** `H S% L%` (sem `hsl()` wrapper)

**Por que esse formato:**
- Permite usar `hsl(var(--primary))` no Tailwind config
- Facilita manipulação de opacidade: `hsl(var(--primary) / 0.5)`
- Mais flexível para criar variações de cor

**Componentes HSL:**
- **H (Hue)**: Matiz (0-360 graus na roda de cores)
- **S (Saturation)**: Saturação (0-100%)
- **L (Lightness)**: Luminosidade (0-100%)

**Exemplo de conversão:**
```css
/* Formato armazenado */
--primary: 211.8947 94.0594% 39.6078%;

/* Como é usado */
background-color: hsl(var(--primary));

/* Com opacidade */
background-color: hsl(var(--primary) / 0.5);
```

### 4. Estrutura de Camadas

O arquivo está organizado em **duas camadas `@layer base`**:

#### Primeira Camada: Variáveis CSS
Define todas as variáveis de design (cores, fontes, sombras, etc.)

#### Segunda Camada: Estilos Globais
Aplica estilos base a elementos HTML usando as variáveis definidas

---

## Variáveis CSS Customizadas

### Categorias de Variáveis

#### 1. Cores Semânticas

| Variável | Modo Claro | Modo Escuro | Uso |
|----------|------------|-------------|-----|
| `--background` | Branco (100%) | Cinza escuro (9%) | Fundo principal da aplicação |
| `--foreground` | Cinza escuro (20%) | Cinza claro (90%) | Texto principal |
| `--card` | Branco (100%) | Cinza médio (15%) | Fundo de cards |
| `--card-foreground` | Cinza escuro (25%) | Cinza claro (90%) | Texto em cards |
| `--popover` | Branco (100%) | Cinza médio (15%) | Fundo de popovers/tooltips |
| `--popover-foreground` | Cinza escuro (20%) | Cinza claro (90%) | Texto em popovers |

**Padrão de nomenclatura:**
- Variável base: cor de fundo/borda
- Variável `-foreground`: cor de texto que contrasta com a base

#### 2. Cores de Ação

| Variável | Valor HSL | Cor Visual | Uso |
|----------|-----------|------------|-----|
| `--primary` | `211.89 94.06% 39.61%` | Azul vibrante | Botões principais, links, destaques |
| `--primary-foreground` | `0 0% 100%` | Branco | Texto sobre primary |
| `--secondary` | `220 14.29% 95.88%` | Cinza azulado claro | Botões secundários |
| `--secondary-foreground` | `215 13.79% 34.12%` | Azul escuro | Texto sobre secondary |
| `--destructive` | `0 84.24% 60.20%` | Vermelho | Ações destrutivas (deletar, cancelar) |
| `--destructive-foreground` | `0 0% 100%` | Branco | Texto sobre destructive |

#### 3. Cores de Estado

| Variável | Modo Claro | Modo Escuro | Uso |
|----------|------------|-------------|-----|
| `--muted` | Cinza muito claro (98%) | Cinza escuro (12%) | Backgrounds sutis, desabilitados |
| `--muted-foreground` | Cinza médio (46%) | Cinza médio (64%) | Texto secundário, placeholders |
| `--accent` | Azul muito claro (93%) | Azul escuro (33%) | Destaques, hover states |
| `--accent-foreground` | Azul escuro (33%) | Azul claro (87%) | Texto sobre accent |

#### 4. Cores de Interface

| Variável | Valor | Uso |
|----------|-------|-----|
| `--border` | `220 13.04% 90.98%` (claro) / `0 0% 25.10%` (escuro) | Bordas de elementos |
| `--input` | `220 13.04% 90.98%` (claro) / `0 0% 25.10%` (escuro) | Bordas de inputs |
| `--ring` | `217.22 91.22% 59.80%` | Anel de foco (outline) |

#### 5. Cores para Gráficos (Charts)

```css
--chart-1: 217.2193 91.2195% 59.8039%;  /* Azul claro */
--chart-2: 221.2121 83.1933% 53.3333%;  /* Azul médio */
--chart-3: 224.2781 76.3265% 48.0392%;  /* Azul */
--chart-4: 225.9310 70.7317% 40.1961%;  /* Azul escuro */
--chart-5: 224.4444 64.2857% 32.9412%;  /* Azul muito escuro */
```

**Uso:**
Paleta de 5 cores para gráficos e visualizações de dados, com progressão de luminosidade.

#### 6. Cores de Sidebar

| Variável | Uso |
|----------|-----|
| `--sidebar` | Fundo da sidebar |
| `--sidebar-foreground` | Texto na sidebar |
| `--sidebar-primary` | Cor primária da sidebar (item ativo) |
| `--sidebar-primary-foreground` | Texto sobre sidebar-primary |
| `--sidebar-accent` | Cor de hover/destaque |
| `--sidebar-accent-foreground` | Texto sobre sidebar-accent |
| `--sidebar-border` | Bordas na sidebar |
| `--sidebar-ring` | Anel de foco na sidebar |

#### 7. Tipografia

```css
--font-sans: Inter, sans-serif;
--font-serif: Source Serif 4, serif;
--font-mono: JetBrains Mono, monospace;
```

**Três famílias de fontes:**
- **Sans-serif (Inter)**: Fonte principal para UI
- **Serif (Source Serif 4)**: Para títulos ou conteúdo editorial
- **Monospace (JetBrains Mono)**: Para código e dados técnicos

**Como usar:**
```tsx
<p className="font-sans">Texto normal</p>
<h1 className="font-serif">Título elegante</h1>
<code className="font-mono">const x = 10;</code>
```

#### 8. Border Radius

```css
--radius: 0.375rem;  /* 6px */
```

**Uso no Tailwind:**
```tsx
<div className="rounded-lg">  {/* var(--radius) */}
<div className="rounded-md">  {/* calc(var(--radius) - 2px) = 4px */}
<div className="rounded-sm">  {/* calc(var(--radius) - 4px) = 2px */}
```

#### 9. Sistema de Sombras

**Variáveis de controle:**
```css
--shadow-x: 0;
--shadow-y: 1px;
--shadow-blur: 3px;
--shadow-spread: 0px;
--shadow-opacity: 0.1;
--shadow-color: oklch(0 0 0);
```

**Sombras pré-definidas:**

| Variável | Valor | Uso |
|----------|-------|-----|
| `--shadow-2xs` | `0 1px 3px 0px hsl(0 0% 0% / 0.05)` | Sombra mínima |
| `--shadow-xs` | `0 1px 3px 0px hsl(0 0% 0% / 0.05)` | Sombra extra pequena |
| `--shadow-sm` | `0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)` | Sombra pequena |
| `--shadow` | `0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)` | Sombra padrão |
| `--shadow-md` | `0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10)` | Sombra média |
| `--shadow-lg` | `0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10)` | Sombra grande |
| `--shadow-xl` | `0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10)` | Sombra extra grande |
| `--shadow-2xl` | `0 1px 3px 0px hsl(0 0% 0% / 0.25)` | Sombra máxima |

**Padrão de progressão:**
- Opacidade aumenta de 5% → 10% → 25%
- Blur aumenta de 3px → 10px
- Offset Y aumenta de 1px → 8px

#### 10. Outras Variáveis

```css
--tracking-normal: 0em;  /* Letter spacing normal */
--spacing: 0.25rem;      /* 4px - unidade base de espaçamento */
```

---

## Modo Escuro (Dark Mode)

### Como Funciona

O modo escuro é ativado adicionando a classe `.dark` ao elemento `<html>` ou `<body>`:

```html
<!-- Modo Claro -->
<html>
  <body>...</body>
</html>

<!-- Modo Escuro -->
<html class="dark">
  <body>...</body>
</html>
```

### Diferenças Principais entre Modos

#### Backgrounds
- **Claro**: Branco puro (100% lightness)
- **Escuro**: Cinza muito escuro (9% lightness)

#### Textos
- **Claro**: Cinza escuro (20% lightness)
- **Escuro**: Cinza claro (90% lightness)

#### Cards
- **Claro**: Branco puro
- **Escuro**: Cinza médio (15% lightness) - ligeiramente mais claro que o background

#### Primary
- **Claro**: Azul mais escuro (39% lightness)
- **Escuro**: Azul mais claro (60% lightness) - melhor contraste em fundo escuro

#### Accent
- **Claro**: Azul muito claro (93% lightness)
- **Escuro**: Azul escuro (33% lightness)

### Implementação de Toggle

```tsx
import { useEffect, useState } from 'react';

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <button onClick={() => setIsDark(!isDark)}>
      {isDark ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
    </button>
  );
}
```

---

## Estilos Base Globais

### Reset de Bordas

```css
* {
  @apply border-border;
}
```

**O que faz:**
Aplica a cor de borda padrão (`--border`) a todos os elementos que tiverem bordas.

**Equivalente a:**
```css
* {
  border-color: hsl(var(--border));
}
```

### Estilos do Body

```css
body {
  @apply bg-background text-foreground;
}
```

**O que faz:**
- Define o background do body como `--background`
- Define a cor de texto como `--foreground`

**Equivalente a:**
```css
body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

**Resultado:**
- Modo claro: fundo branco, texto cinza escuro
- Modo escuro: fundo cinza escuro, texto cinza claro

---

## Como Usar

### 1. Importar no Projeto

```tsx
// main.tsx ou App.tsx
import './index.css';
```

### 2. Usar Classes Tailwind

```tsx
// As variáveis são automaticamente mapeadas para classes Tailwind
<div className="bg-primary text-primary-foreground">
  Botão Primário
</div>

<div className="bg-card text-card-foreground border border-border rounded-lg">
  Card
</div>

<p className="text-muted-foreground">
  Texto secundário
</p>
```

### 3. Usar Variáveis CSS Diretamente

```tsx
<div style={{ backgroundColor: 'hsl(var(--primary))' }}>
  Usando variável CSS diretamente
</div>
```

### 4. Usar com Opacidade

```tsx
<div className="bg-primary/50">
  Primary com 50% de opacidade
</div>

{/* Equivalente a: */}
<div style={{ backgroundColor: 'hsl(var(--primary) / 0.5)' }}>
```

### 5. Configurar no tailwind.config.ts

```ts
export default {
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... outras cores
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
}
```

---

## Boas Práticas

### ✅ Fazer

1. **Usar variáveis semânticas**
   ```tsx
   <button className="bg-primary text-primary-foreground">
   ```

2. **Respeitar pares de cores**
   ```tsx
   {/* Sempre usar -foreground com sua cor base */}
   <div className="bg-card text-card-foreground">
   ```

3. **Usar classes Tailwind em vez de CSS inline**
   ```tsx
   {/* Preferir */}
   <div className="bg-primary">
   
   {/* Em vez de */}
   <div style={{ backgroundColor: 'hsl(var(--primary))' }}>
   ```

4. **Testar em ambos os modos**
   ```tsx
   {/* Sempre verificar aparência em modo claro E escuro */}
   ```

### ❌ Evitar

1. **Cores hardcoded**
   ```tsx
   {/* Evitar */}
   <div className="bg-blue-500">
   
   {/* Preferir */}
   <div className="bg-primary">
   ```

2. **Misturar variáveis incompatíveis**
   ```tsx
   {/* Evitar - baixo contraste */}
   <div className="bg-muted text-muted-foreground">
   
   {/* Preferir */}
   <div className="bg-muted text-foreground">
   ```

3. **Modificar variáveis CSS diretamente em componentes**
   ```tsx
   {/* Evitar */}
   <div style={{ '--primary': '0 0% 50%' }}>
   
   {/* Preferir: modificar no index.css */}
   ```

4. **Ignorar o modo escuro**
   ```tsx
   {/* Evitar cores que não funcionam em dark mode */}
   <div className="bg-white text-black">
   
   {/* Preferir variáveis que se adaptam */}
   <div className="bg-background text-foreground">
   ```

### 💡 Dicas

1. **Criar variações de opacidade**
   ```tsx
   <div className="bg-primary/10">  {/* 10% opacidade */}
   <div className="bg-primary/50">  {/* 50% opacidade */}
   <div className="bg-primary/90">  {/* 90% opacidade */}
   ```

2. **Usar variáveis de chart para dados**
   ```tsx
   <div className="bg-chart-1">Série 1</div>
   <div className="bg-chart-2">Série 2</div>
   <div className="bg-chart-3">Série 3</div>
   ```

3. **Aproveitar as sombras pré-definidas**
   ```tsx
   <div className="shadow-sm">Sombra pequena</div>
   <div className="shadow-md">Sombra média</div>
   <div className="shadow-lg">Sombra grande</div>
   ```

4. **Usar fontes apropriadas**
   ```tsx
   <p className="font-sans">Interface</p>
   <h1 className="font-serif">Título editorial</h1>
   <code className="font-mono">Código</code>
   ```

---

## Resumo

Este sistema de CSS base fornece:

✅ **40+ variáveis CSS** organizadas semanticamente  
✅ **Suporte completo a Dark Mode** com toggle simples  
✅ **Sistema de cores HSL** flexível e manipulável  
✅ **Paleta de 5 cores** para gráficos  
✅ **8 níveis de sombras** padronizadas  
✅ **3 famílias de fontes** para diferentes contextos  
✅ **Integração perfeita** com Tailwind CSS  
✅ **Acessibilidade** com pares de cores contrastantes  

**Resultado:** Um design system consistente, escalável e fácil de manter.

---

**Documento criado em:** 2025-10-19  
**Versão:** 1.0  
**Tailwind CSS:** v3