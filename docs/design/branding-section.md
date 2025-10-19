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
<div className="z-10 px-4 md:px-6 lg:px-8 text-white md:min-h-0 md:h-[calc(100svh-4rem)] md:supports-[height:100dvh]:h-[calc(100dvh-4rem)] flex">
  <div className="w-full grid min-h-full place-content-center">
    {/* Conteúdo aqui */}
  </div>
</div>
```

**Propriedades:**
- `z-10` - Sobrepõe o background pattern
- `px-4 md:px-6 lg:px-8` - Padding horizontal responsivo
- `text-white` - Texto branco para contraste com fundo escuro
- `h-[calc(100svh-4rem)]` - Altura dinâmica considerando viewport
- `grid place-content-center` - Centralização vertical e horizontal do conteúdo

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

### 1. Logo Section

```tsx
<div className="mb-6 md:mb-8 text-center">
  <img 
    src="/APFarmaHome.png" 
    alt="APFAR Logo"
    className="mb-4 mx-auto"
    onError={(e) => {
      const target = e.target as HTMLImageElement;
      target.style.display = 'none';
      const fallback = document.createElement('div');
      fallback.className = 'w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm';
      fallback.innerHTML = '<span class="text-white font-bold text-lg md:text-xl">AF</span>';
      target.parentElement?.insertBefore(fallback, target);
    }}
  />
</div>
```

**Características:**
- Centralizado com `text-center` e `mx-auto`
- Margem inferior: `mb-6` (24px) em mobile, `md:mb-8` (32px) em desktop
- Fallback com glassmorphism se imagem falhar
- Fallback: 80x80px, fundo branco semi-transparente, bordas arredondadas

### 2. Description Section

```tsx
<div className="mb-8 md:mb-12">
  <p className="text-white/80 text-sm md:text-lg leading-relaxed mb-4 md:mb-6">
    Gerencie todo o processo licitatório de forma eficiente, 
    desde a participação em pregões até o cumprimento de contratos.
  </p>
</div>
```

**Características:**
- Margem inferior: `mb-8` (32px) em mobile, `md:mb-12` (48px) em desktop
- Texto com opacidade reduzida para hierarquia visual
- Line-height relaxado para melhor legibilidade

### 3. Features List

```tsx
<div className="space-y-4 md:space-y-6">
  {/* Feature Item */}
</div>
```

**Espaçamento entre itens:**
- `space-y-4` (16px) em mobile
- `md:space-y-6` (24px) em desktop

### 4. Feature Item

```tsx
<div className="flex items-center space-x-3 md:space-x-4 group">
  {/* Icon Container */}
  <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
    <Shield className="w-4 h-4 md:w-5 md:h-5 text-white" />
  </div>
  
  {/* Text Content */}
  <div>
    <h3 className="font-semibold text-white text-sm md:text-base">Segurança Garantida</h3>
    <p className="text-white/70 text-xs md:text-sm">Seus dados protegidos com tecnologia de ponta</p>
  </div>
</div>
```

**Estrutura:**
- Container flex com alinhamento vertical centralizado
- Espaçamento horizontal: `space-x-3` (12px) em mobile, `md:space-x-4` (16px) em desktop
- Grupo para efeitos hover coordenados

**Icon Container (Glassmorphism):**
- Tamanho: 32x32px em mobile, 40x40px em desktop
- Fundo: `bg-white/20` (branco com 20% de opacidade)
- Bordas: `rounded-lg` (8px)
- Efeito blur: `backdrop-blur-sm`
- Hover: `group-hover:bg-white/30` (aumenta opacidade para 30%)
- Transição: `transition-all duration-300` (300ms)

**Ícones:**
- Tamanho: 16x16px em mobile, 20x20px em desktop
- Cor: `text-white`
- Biblioteca: Lucide React (Shield, TrendingUp, Users)

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
  '2xl': '1400px'
}
```

### Comportamento por Tamanho de Tela

#### Mobile (< 768px)
- **Visibilidade:** `hidden` - Componente completamente oculto
- **Razão:** Economizar espaço vertical em telas pequenas

#### Tablet/Desktop (≥ 768px)
- **Visibilidade:** `md:flex` - Componente visível
- **Largura:** `md:w-1/4` (25% da largura da tela)
- **Posicionamento:** `sticky top-0` (fixo durante scroll)

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
/* Logo margin-bottom */
mb-6 md:mb-8    /* 24px → 32px */

/* Description margin-bottom */
mb-8 md:mb-12   /* 32px → 48px */

/* Features spacing */
space-y-4 md:space-y-6  /* 16px → 24px */

/* Feature items spacing */
space-x-3 md:space-x-4  /* 12px → 16px */
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
import { Shield, Users, TrendingUp } from "lucide-react";

export function BrandingSection() {
  return (
    <div className="hidden md:flex md:w-1/4 lg:w-1/4 bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-secondary sticky top-0 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 md:w-32 md:h-32 border-2 border-white rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-10 md:right-20 w-12 h-12 md:w-20 md:h-20 border-2 border-white rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-20 left-10 md:left-20 w-10 h-10 md:w-16 md:h-16 border-2 border-white rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-32 right-8 md:right-16 w-16 h-16 md:w-24 md:h-24 border-2 border-white rounded-full animate-pulse delay-700"></div>
      </div>

      {/* Content */}
      <div className="z-10 px-4 md:px-6 lg:px-8 text-white md:min-h-0 md:h-[calc(100svh-4rem)] md:supports-[height:100dvh]:h-[calc(100dvh-4rem)] flex">
        <div className="w-full grid min-h-full place-content-center">
          {/* Logo/Icon */}
          <div className="mb-6 md:mb-8 text-center">
            <img 
              src="/APFarmaHome.png" 
              alt="APFAR Logo"
              className="mb-4 mx-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm';
                fallback.innerHTML = '<span class="text-white font-bold text-lg md:text-xl">AF</span>';
                target.parentElement?.insertBefore(fallback, target);
              }}
            />
          </div>

          {/* Description */}
          <div className="mb-8 md:mb-12">
            <p className="text-white/80 text-sm md:text-lg leading-relaxed mb-4 md:mb-6">
              Gerencie todo o processo licitatório de forma eficiente, 
              desde a participação em pregões até o cumprimento de contratos.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center space-x-3 md:space-x-4 group">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                <Shield className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm md:text-base">Segurança Garantida</h3>
                <p className="text-white/70 text-xs md:text-sm">Seus dados protegidos com tecnologia de ponta</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 md:space-x-4 group">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm md:text-base">Gestão Inteligente</h3>
                <p className="text-white/70 text-xs md:text-sm">Dashboards e relatórios em tempo real</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 md:space-x-4 group">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm md:text-base">Colaboração</h3>
                <p className="text-white/70 text-xs md:text-sm">Trabalhe em equipe de forma sincronizada</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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