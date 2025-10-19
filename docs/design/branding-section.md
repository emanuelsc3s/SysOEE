# Design System - Branding Section

## 📋 Sumário
- [Visão Geral](#visão-geral)
- [Estrutura e Layout](#estrutura-e-layout)
- [Sistema de Cores](#sistema-de-cores)
- [Tipografia](#tipografia)
- [Componentes](#componentes)
- [Animações](#animações)
- [Responsividade](#responsividade)
- [Implementação Completa](#implementação-completa)

---

## 🎯 Visão Geral

A **BrandingSection** é um componente de apresentação visual que aparece no lado esquerdo da tela em layouts de autenticação e páginas principais. Ela utiliza um design moderno com gradientes, padrões animados e elementos glassmorphism.

### Características Principais
- Layout fixo/sticky no lado esquerdo (25% da largura em desktop)
- Gradiente de marca com padrão de círculos animados
- **Todo conteúdo alinhado ao topo** (sem centralização vertical)
- **Logomarca posicionada no topo** da seção
- **Título "SysOEE" logo abaixo da logomarca**
- **Descrição e features logo abaixo do título**
- **Alinhamento com div de saudação** em resoluções >= 1000x400px
- Seção de features com ícones e descrições
- Efeito glassmorphism nos elementos interativos
- Totalmente responsivo (oculto em mobile)

---

## 🏗️ Estrutura e Layout

### Container Principal
```tsx
<div className="hidden md:flex md:w-1/4 lg:w-1/4 bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-secondary sticky top-0 relative">
```

**Propriedades:**
- `hidden md:flex` - Oculto em mobile, visível em tablets e desktop
- `md:w-1/4 lg:w-1/4` - Largura de 25% em telas médias e grandes
- `bg-gradient-to-br` - Gradiente diagonal (top-left para bottom-right)
- `sticky top-0` - Fixo no topo durante scroll
- `relative` - Contexto de posicionamento para elementos absolutos

### Background Pattern (Círculos Animados)
```tsx
<div className="absolute inset-0 opacity-10">
  <div className="absolute top-10 left-10 w-20 h-20 md:w-32 md:h-32 border-2 border-white rounded-full animate-pulse"></div>
  <div className="absolute top-32 right-10 md:right-20 w-12 h-12 md:w-20 md:h-20 border-2 border-white rounded-full animate-pulse delay-300"></div>
  <div className="absolute bottom-20 left-10 md:left-20 w-10 h-10 md:w-16 md:h-16 border-2 border-white rounded-full animate-pulse delay-500"></div>
  <div className="absolute bottom-32 right-8 md:right-16 w-16 h-16 md:w-24 md:h-24 border-2 border-white rounded-full animate-pulse delay-700"></div>
</div>
```

**Padrão de Círculos:**
- 4 círculos posicionados nos cantos
- Opacidade de 10% para efeito sutil
- Bordas brancas de 2px
- Animação pulse com delays escalonados (0ms, 300ms, 500ms, 700ms)
- Tamanhos responsivos (menores em mobile, maiores em desktop)

### Content Container
```tsx
<div className="relative z-10 h-full px-4 md:px-6 lg:px-8 tab-prod:px-4 text-white">
  {/* Todo conteúdo alinhado ao topo */}
  <div className="pt-8 md:pt-12 tab-prod:pt-6 text-center min-[1000px]:min-h-[400px]:pt-16">
    {/* Logo */}
    {/* Título */}
    {/* Descrição */}
    {/* Features */}
  </div>
</div>
```

**Propriedades:**
- `z-10` - Sobrepõe o background pattern
- `h-full` - Ocupa toda a altura disponível
- `px-4 md:px-6 lg:px-8 tab-prod:px-4` - Padding horizontal responsivo
- `text-white` - Texto branco para contraste com fundo escuro

**Container de Conteúdo:**
- `pt-8 md:pt-12 tab-prod:pt-6` - Padding superior responsivo
- `min-[1000px]:min-h-[400px]:pt-16` - Padding maior em resoluções >= 1000x400px para alinhamento com div de saudação
- `text-center` - Centralização horizontal de todo o conteúdo
- **Sem centralização vertical** - Todo conteúdo flui naturalmente do topo para baixo

---

## 🎨 Sistema de Cores

### Cores da Marca (Brand Colors)

#### Definição no Tailwind Config
```typescript
brand: {
  primary: '#242f65',      // Azul escuro principal
  secondary: '#62a183',    // Verde água
  tertiary: '#ee8b60',     // Laranja coral
  alternate: '#e0e3e7',    // Cinza claro
  'text-primary': '#141b1b',    // Texto principal (quase preto)
  'text-secondary': '#57636c',  // Texto secundário (cinza)
  'bg-primary': '#f1f4f8',      // Fundo principal (cinza muito claro)
  'bg-secondary': '#ffffff',    // Fundo secundário (branco)
  'accent-1': '#4c4b39ef',      // Acento 1
  'accent-2': '#4d39d2c0',      // Acento 2
  'accent-3': '#4dee8b60',      // Acento 3
  'accent-4': '#ccffffff',      // Acento 4
}
```

#### Variáveis CSS (index.css)
```css
:root {
  --primary: 228 48% 30%;           /* HSL do brand-primary */
  --secondary: 147 25% 51%;         /* HSL do brand-secondary */
  --sidebar-background: 228 48% 30%;
  --sidebar-primary: 147 25% 51%;
}
```

### Gradiente Principal
```css
bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-secondary
```

**Composição:**
- `from-brand-primary` - Início: #242f65 (azul escuro)
- `via-brand-primary/95` - Meio: #242f65 com 95% de opacidade
- `to-brand-secondary` - Fim: #62a183 (verde água)
- Direção: `to-br` (diagonal para bottom-right)

### Opacidades Utilizadas
- `opacity-10` - Background pattern (10%)
- `bg-white/20` - Ícones de features (20%)
- `bg-white/30` - Ícones em hover (30%)
- `text-white/70` - Texto secundário (70%)
- `text-white/80` - Descrição principal (80%)

---

## 📝 Tipografia

### Fonte
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

body {
  @apply font-sans; /* Inter */
}
```

**Pesos utilizados:**
- 300 (Light)
- 400 (Regular)
- 500 (Medium)
- 600 (Semibold)
- 700 (Bold)

### Hierarquia de Texto

#### Logo/Título Principal
```tsx
<span className="text-white font-bold text-lg md:text-xl">AF</span>
```
- Tamanho: `text-lg` (18px) em mobile, `md:text-xl` (20px) em desktop
- Peso: `font-bold` (700)
- Cor: `text-white`

#### Descrição Principal
```tsx
<p className="text-white/80 text-sm md:text-lg leading-relaxed mb-4 md:mb-6">
```
- Tamanho: `text-sm` (14px) em mobile, `md:text-lg` (18px) em desktop
- Cor: `text-white/80` (80% de opacidade)
- Espaçamento: `leading-relaxed` (line-height: 1.625)
- Margem inferior: `mb-4` (16px) em mobile, `md:mb-6` (24px) em desktop

#### Títulos de Features
```tsx
<h3 className="font-semibold text-white text-sm md:text-base">
```
- Tamanho: `text-sm` (14px) em mobile, `md:text-base` (16px) em desktop
- Peso: `font-semibold` (600)
- Cor: `text-white`

#### Descrições de Features
```tsx
<p className="text-white/70 text-xs md:text-sm">
```
- Tamanho: `text-xs` (12px) em mobile, `md:text-sm` (14px) em desktop
- Cor: `text-white/70` (70% de opacidade)

---

## 🧩 Componentes

### 1. Seção Completa de Conteúdo (Alinhada ao Topo)

```tsx
<div className="pt-8 md:pt-12 tab-prod:pt-6 text-center min-[1000px]:min-h-[400px]:pt-16">
  {/* Logo/Icon */}
  <div className="mb-4 tab-prod:mb-2">
    <img
      src="/logo-farmace.png"
      alt="SysOEE Logo"
      className="mx-auto tab-prod:max-h-12"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.className = 'w-20 h-20 tab-prod:w-12 tab-prod:h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mx-auto';
        fallback.innerHTML = '<span class="text-white font-bold text-lg md:text-xl tab-prod:text-sm">OEE</span>';
        target.parentElement?.insertBefore(fallback, target);
      }}
    />
  </div>

  {/* Título Principal com Efeito Visual */}
  <h1 className="text-2xl md:text-3xl lg:text-4xl tab-prod:text-xl font-bold mb-6 md:mb-8 tab-prod:mb-4 text-shimmer drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-500 hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]">
    SysOEE
  </h1>

  {/* Texto Descritivo */}
  <div className="mb-8 md:mb-12 tab-prod:mb-4">
    <p className="text-white/80 text-sm md:text-lg tab-prod:text-xs leading-relaxed tab-prod:leading-snug">
      Monitoramento de Eficiência Operacional de Equipamentos com compliance ALCOA+ e BPF ANVISA.
    </p>
  </div>

  {/* Features */}
  <div className="space-y-4 md:space-y-6 tab-prod:space-y-2">
    {/* Feature items aqui */}
  </div>
</div>
```

**Características:**
- **Todo conteúdo em um único container** alinhado ao topo
- Padding superior responsivo: `pt-8` (32px) em mobile, `md:pt-12` (48px) em desktop, `tab-prod:pt-6` (24px) em tablets de produção
- **Padding especial em resoluções >= 1000x400px**: `min-[1000px]:min-h-[400px]:pt-16` (64px) para alinhamento com div de saudação
- Centralizado horizontalmente com `text-center` e `mx-auto`
- Logomarca com margem inferior: `mb-4` (16px), `tab-prod:mb-2` (8px)
- Título com margem inferior: `mb-6` (24px) em mobile, `md:mb-8` (32px) em desktop, `tab-prod:mb-4` (16px)
- Descrição com margem inferior: `mb-8` (32px) em mobile, `md:mb-12` (48px) em desktop, `tab-prod:mb-4` (16px)
- Features com espaçamento vertical: `space-y-4` (16px) em mobile, `md:space-y-6` (24px) em desktop, `tab-prod:space-y-2` (8px)
- Fallback com glassmorphism se imagem falhar
- Fallback: 80x80px (ou 48x48px em tab-prod), fundo branco semi-transparente, bordas arredondadas
- **Efeito shimmer** no título com drop-shadow animado

### 2. Feature Items

```tsx
<div className="flex items-center space-x-3 md:space-x-4 tab-prod:space-x-2 group">
  <div className="w-8 h-8 md:w-10 md:h-10 tab-prod:w-7 tab-prod:h-7 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
    <Shield className="w-4 h-4 md:w-5 md:h-5 tab-prod:w-3.5 tab-prod:h-3.5 text-white" />
  </div>
  <div>
    <h3 className="font-semibold text-white text-sm md:text-base tab-prod:text-xs">Compliance Regulatório</h3>
    <p className="text-white/70 text-xs md:text-sm tab-prod:text-[10px]">ALCOA+ e CFR 21 Part 11</p>
  </div>
</div>
```

**Características:**
- Container flex com alinhamento vertical centralizado
- Espaçamento horizontal: `space-x-3` (12px) em mobile, `md:space-x-4` (16px) em desktop, `tab-prod:space-x-2` (8px)
- Grupo para efeitos hover coordenados
- Icon container com glassmorphism
- Tamanhos responsivos para ícones e textos

**Icon Container (Glassmorphism):**
- Tamanho: 32x32px em mobile, 40x40px em desktop, 28x28px em tab-prod
- Fundo: `bg-white/20` (branco com 20% de opacidade)
- Bordas: `rounded-lg` (8px)
- Efeito blur: `backdrop-blur-sm`
- Hover: `group-hover:bg-white/30` (aumenta opacidade para 30%)
- Transição: `transition-all duration-300` (300ms)

**Ícones:**
- Tamanho: 16x16px em mobile, 20x20px em desktop, 14x14px em tab-prod
- Cor: `text-white`
- Biblioteca: Lucide React (Shield, TrendingUp, Users)

**Textos:**
- Título: `text-sm md:text-base tab-prod:text-xs` (14px → 16px → 12px)
- Descrição: `text-xs md:text-sm tab-prod:text-[10px]` (12px → 14px → 10px)

---

## ✨ Animações

### Pulse Animation (Círculos)

```css
/* Tailwind built-in */
animate-pulse
```

**Comportamento:**
- Animação de opacidade pulsante
- Duração: 2 segundos
- Loop infinito
- Easing: cubic-bezier

**Delays Customizados:**
```css
delay-300  /* 300ms */
delay-500  /* 500ms */
delay-700  /* 700ms */
```

### Hover Transitions

```css
transition-all duration-300
```

**Aplicado em:**
- Icon containers das features
- Mudança de `bg-white/20` para `bg-white/30`
- Transição suave de 300ms em todas as propriedades

---

## 📱 Responsividade

### Breakpoints Tailwind
```typescript
screens: {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1400px',
  'tab-prod': '1000px'  // Breakpoint customizado para tablets de produção
}
```

### Comportamento por Tamanho de Tela

#### Mobile (< 768px)
- **Visibilidade:** `hidden` - Componente completamente oculto
- **Razão:** Economizar espaço vertical em telas pequenas

#### Tablet/Desktop (≥ 768px)
- **Visibilidade:** `md:flex` - Componente visível
- **Largura:** `md:w-1/4` (25% da largura da tela)
- **Posicionamento:** `md:fixed md:left-0 md:top-0 md:h-screen` (fixo durante scroll)

#### Resoluções >= 1000x400px
- **Layout especial**: Logomarca e título fixos no topo
- **Padding superior aumentado**: `min-[1000px]:min-h-[400px]:pt-16` (64px)
- **Alinhamento**: Logomarca alinhada aproximadamente na mesma altura da div de saudação da página principal

### Ajustes Responsivos Detalhados

#### Padding
```css
px-4      /* 16px em mobile */
md:px-6   /* 24px em tablet */
lg:px-8   /* 32px em desktop */
```

#### Tamanhos de Círculos
```css
/* Círculo 1 */
w-20 h-20       /* 80x80px em mobile */
md:w-32 md:h-32 /* 128x128px em desktop */

/* Círculo 2 */
w-12 h-12       /* 48x48px em mobile */
md:w-20 md:h-20 /* 80x80px em desktop */

/* Círculo 3 */
w-10 h-10       /* 40x40px em mobile */
md:w-16 md:h-16 /* 64x64px em desktop */

/* Círculo 4 */
w-16 h-16       /* 64x64px em mobile */
md:w-24 md:h-24 /* 96x96px em desktop */
```

#### Espaçamentos
```css
/* Padding superior da seção de logomarca/título */
pt-8 md:pt-12 tab-prod:pt-6                    /* 32px → 48px → 24px */
min-[1000px]:min-h-[400px]:pt-16               /* 64px em >= 1000x400 */

/* Logo margin-bottom */
mb-4 tab-prod:mb-2                             /* 16px → 8px */

/* Título margin-bottom */
mb-6 md:mb-8 tab-prod:mb-4                     /* 24px → 32px → 16px */

/* Description margin-bottom */
mb-8 md:mb-12 tab-prod:mb-4                    /* 32px → 48px → 16px */

/* Features spacing */
space-y-4 md:space-y-6 tab-prod:space-y-2      /* 16px → 24px → 8px */

/* Feature items spacing */
space-x-3 md:space-x-4 tab-prod:space-x-2      /* 12px → 16px → 8px */
```

#### Tipografia
```css
/* Logo fallback */
text-lg md:text-xl      /* 18px → 20px */

/* Description */
text-sm md:text-lg      /* 14px → 18px */

/* Feature titles */
text-sm md:text-base    /* 14px → 16px */

/* Feature descriptions */
text-xs md:text-sm      /* 12px → 14px */
```

---

## 💻 Implementação Completa

### Arquivo: BrandingSection.tsx

```tsx
import { Shield, TrendingUp, Users } from 'lucide-react'

/**
 * Seção de branding (lado esquerdo 25% da Home)
 * Contém gradiente, círculos animados, logo e features list
 * Segue especificações do branding-section.md
 *
 * Posicionamento: Fixed para permanecer visível durante scroll
 * Altura: 100vh (toda a altura da viewport)
 * Layout: Todo conteúdo alinhado ao topo (logomarca, título, descrição e features)
 * Alinhamento: Logomarca alinhada com div de saudação em resoluções >= 1000x400
 */
export function BrandingSection() {
  return (
    <div className="hidden md:flex md:fixed md:left-0 md:top-0 md:h-screen md:w-1/4 lg:w-1/4 bg-gradient-to-br from-primary via-primary/95 to-brand-primary">
      {/* Background Pattern - Círculos Animados */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 md:w-32 md:h-32 border-2 border-white rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-10 md:right-20 w-12 h-12 md:w-20 md:h-20 border-2 border-white rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-20 left-10 md:left-20 w-10 h-10 md:w-16 md:h-16 border-2 border-white rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-32 right-8 md:right-16 w-16 h-16 md:w-24 md:h-24 border-2 border-white rounded-full animate-pulse delay-700"></div>
      </div>

      {/* Content - Layout com todo conteúdo alinhado ao topo */}
      <div className="relative z-10 h-full px-4 md:px-6 lg:px-8 tab-prod:px-4 text-white">
        {/* Todo conteúdo alinhado ao topo */}
        <div className="pt-8 md:pt-12 tab-prod:pt-6 text-center min-[1000px]:min-h-[400px]:pt-16">
          {/* Logo/Icon */}
          <div className="mb-4 tab-prod:mb-2">
            <img
              src="/logo-farmace.png"
              alt="SysOEE Logo"
              className="mx-auto tab-prod:max-h-12"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'w-20 h-20 tab-prod:w-12 tab-prod:h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mx-auto';
                fallback.innerHTML = '<span class="text-white font-bold text-lg md:text-xl tab-prod:text-sm">OEE</span>';
                target.parentElement?.insertBefore(fallback, target);
              }}
            />
          </div>

          {/* Título Principal com Efeito Visual */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl tab-prod:text-xl font-bold mb-6 md:mb-8 tab-prod:mb-4 text-shimmer drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-500 hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]">
            SysOEE
          </h1>

          {/* Texto Descritivo */}
          <div className="mb-8 md:mb-12 tab-prod:mb-4">
            <p className="text-white/80 text-sm md:text-lg tab-prod:text-xs leading-relaxed tab-prod:leading-snug">
              Monitoramento de Eficiência Operacional de Equipamentos com compliance ALCOA+ e BPF ANVISA.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 md:space-y-6 tab-prod:space-y-2">
            {/* Feature 1: Compliance */}
            <div className="flex items-center space-x-3 md:space-x-4 tab-prod:space-x-2 group">
              <div className="w-8 h-8 md:w-10 md:h-10 tab-prod:w-7 tab-prod:h-7 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                <Shield className="w-4 h-4 md:w-5 md:h-5 tab-prod:w-3.5 tab-prod:h-3.5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm md:text-base tab-prod:text-xs">Compliance Regulatório</h3>
                <p className="text-white/70 text-xs md:text-sm tab-prod:text-[10px]">ALCOA+ e CFR 21 Part 11</p>
              </div>
            </div>

            {/* Feature 2: Gestão em Tempo Real */}
            <div className="flex items-center space-x-3 md:space-x-4 tab-prod:space-x-2 group">
              <div className="w-8 h-8 md:w-10 md:h-10 tab-prod:w-7 tab-prod:h-7 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 tab-prod:w-3.5 tab-prod:h-3.5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm md:text-base tab-prod:text-xs">Gestão em Tempo Real</h3>
                <p className="text-white/70 text-xs md:text-sm tab-prod:text-[10px]">Controle Interativo e Análise Preditiva</p>
              </div>
            </div>

            {/* Feature 3: Colaboração */}
            <div className="flex items-center space-x-3 md:space-x-4 tab-prod:space-x-2 group">
              <div className="w-8 h-8 md:w-10 md:h-10 tab-prod:w-7 tab-prod:h-7 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                <Users className="w-4 h-4 md:w-5 md:h-5 tab-prod:w-3.5 tab-prod:h-3.5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm md:text-base tab-prod:text-xs">Colaboração Integrada</h3>
                <p className="text-white/70 text-xs md:text-sm tab-prod:text-[10px]">37 linhas de produção conectadas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Dependências Necessárias

```json
{
  "dependencies": {
    "lucide-react": "^0.x.x",
    "tailwindcss": "^3.x.x",
    "tailwindcss-animate": "^1.x.x"
  }
}
```

### Configuração Tailwind (tailwind.config.ts)

```typescript
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#242f65',
          secondary: '#62a183',
          tertiary: '#ee8b60',
          alternate: '#e0e3e7',
          'text-primary': '#141b1b',
          'text-secondary': '#57636c',
          'bg-primary': '#f1f4f8',
          'bg-secondary': '#ffffff',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    }
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
```

### Estilos Globais (index.css)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --primary: 228 48% 30%;
    --secondary: 147 25% 51%;
  }

  body {
    @apply font-sans;
  }
}
```

---

## 🎯 Layout e Posicionamento

### Estrutura Vertical

O componente BrandingSection utiliza um **layout simples alinhado ao topo**, sem centralização vertical. Todo o conteúdo flui naturalmente de cima para baixo.

#### Seção Única - Todo Conteúdo Alinhado ao Topo
- **Posicionamento**: Topo da seção de branding
- **Conteúdo** (em ordem vertical):
  1. Logomarca da Farmace (`/logo-farmace.png`)
  2. Título "SysOEE" com efeito shimmer
  3. Texto descritivo do sistema
  4. Lista de features (Compliance, Gestão em Tempo Real, Colaboração)
- **Comportamento**:
  - Todo conteúdo permanece alinhado ao topo
  - Padding superior aumentado em resoluções >= 1000x400px
  - Logomarca alinhada aproximadamente na mesma altura da div de saudação ("Boa noite, bem-vindo!") da página principal
  - **Sem centralização vertical** - conteúdo flui naturalmente com margens entre os elementos

### Alinhamento com a Página Principal

A logomarca e o título "SysOEE" na BrandingSection são posicionados para alinhar visualmente com a div de saudação da página principal:

```tsx
// Referência da div de saudação (página principal)
<div className="flex items-center justify-between">
  <div>
    <h2 className="text-2xl md:text-3xl tab:text-4xl tab-prod:text-xl font-bold text-primary">
      Boa noite, bem-vindo!
    </h2>
    <p className="text-muted-foreground mt-1 text-sm tab:text-base tab-prod:text-xs tab-prod:mt-0.5">
      Olá, Usuário Demo. Selecione um módulo para começar.
    </p>
  </div>
  {/* avatar e dropdown */}
</div>
```

O padding superior da seção de logomarca/título (`pt-8 md:pt-12 tab-prod:pt-6 min-[1000px]:min-h-[400px]:pt-16`) foi ajustado para criar esse alinhamento visual.

### Responsividade do Layout

| Resolução | Comportamento |
|-----------|---------------|
| < 768px | Componente oculto (`hidden`) |
| 768px - 999px | Layout padrão com padding `pt-8 md:pt-12` |
| >= 1000px com altura >= 400px | Padding superior aumentado para `pt-16` (64px) |
| Tablets de produção | Espaçamentos reduzidos (`tab-prod:pt-6`, `tab-prod:mb-2`, etc.) |

---

## 🎨 Variações e Customizações

### Alterar Cores do Gradiente

```tsx
// Original
className="bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-secondary"

// Variação 1: Gradiente mais suave
className="bg-gradient-to-br from-brand-primary/90 via-brand-primary/80 to-brand-secondary/90"

// Variação 2: Gradiente invertido
className="bg-gradient-to-br from-brand-secondary via-brand-secondary/95 to-brand-primary"

// Variação 3: Três cores
className="bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-tertiary"
```

### Ajustar Número de Círculos

```tsx
// Adicionar mais círculos
<div className="absolute top-1/2 left-1/2 w-14 h-14 border-2 border-white rounded-full animate-pulse delay-1000"></div>

// Remover círculos (manter apenas 2)
// Comentar ou deletar os círculos não desejados
```

### Personalizar Features

```tsx
// Adicionar nova feature
<div className="flex items-center space-x-3 md:space-x-4 group">
  <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
    <Zap className="w-4 h-4 md:w-5 md:h-5 text-white" />
  </div>
  <div>
    <h3 className="font-semibold text-white text-sm md:text-base">Performance</h3>
    <p className="text-white/70 text-xs md:text-sm">Sistema rápido e otimizado</p>
  </div>
</div>
```

---

## 📐 Guia de Uso

### Integração em Layout

```tsx
// Layout típico (Home.tsx)
<div className="min-h-screen flex flex-col md:flex-row">
  {/* Lado Esquerdo - Branding */}
  <BrandingSection />

  {/* Lado Direito - Conteúdo */}
  <div className="flex-1 md:w-3/4 lg:w-3/4 flex flex-col bg-brand-bg-primary">
    {/* Seu conteúdo aqui */}
  </div>
</div>
```

### Proporções Recomendadas
- **BrandingSection:** 25% da largura (1/4)
- **Conteúdo Principal:** 75% da largura (3/4)

---

## ✅ Checklist de Implementação

- [ ] Instalar dependências (lucide-react, tailwindcss, tailwindcss-animate)
- [ ] Configurar cores da marca no tailwind.config.ts
- [ ] Importar fonte Inter no index.css
- [ ] Criar componente BrandingSection.tsx
- [ ] Adicionar logo/imagem no diretório public
- [ ] Configurar variáveis CSS no index.css
- [ ] Testar responsividade em diferentes tamanhos de tela
- [ ] Verificar animações dos círculos
- [ ] Testar fallback da logo
- [ ] Validar contraste de cores (acessibilidade)

---

## 🔍 Troubleshooting

### Logo não aparece
- Verificar caminho da imagem (`/APFarmaHome.png` deve estar em `public/`)
- Confirmar que o fallback está funcionando (deve aparecer "AF" em um quadrado)

### Gradiente não aparece
- Verificar se as cores `brand-primary` e `brand-secondary` estão definidas no tailwind.config.ts
- Confirmar que o Tailwind está compilando corretamente

### Animações não funcionam
- Verificar se `tailwindcss-animate` está instalado
- Confirmar que o plugin está adicionado no tailwind.config.ts

### Componente não aparece em desktop
- Verificar classe `hidden md:flex`
- Confirmar que a tela tem pelo menos 768px de largura
- Verificar se não há CSS conflitante

---

## 📚 Recursos Adicionais

### Bibliotecas Utilizadas
- **Lucide React:** https://lucide.dev/
- **Tailwind CSS:** https://tailwindcss.com/
- **Tailwind Animate:** https://github.com/jamiebuilds/tailwindcss-animate

### Conceitos de Design
- **Glassmorphism:** Efeito de vidro fosco com `backdrop-blur`
- **Gradientes:** Transições suaves de cor
- **Micro-interações:** Animações sutis em hover

---

**Documentação criada em:** 2025-10-19  
**Versão:** 1.0  
**Projeto:** APFAR - Sistema de Gestão de Licitações