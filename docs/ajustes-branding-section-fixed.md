# Ajustes de Posicionamento Fixo da BrandingSection

## Objetivo
Tornar a BrandingSection completamente fixa durante o scroll da página, garantindo que ela permaneça sempre visível enquanto o usuário navega pelo conteúdo.

## Problema Identificado
- A BrandingSection estava usando `position: sticky`, o que fazia com que ela rolasse junto com o conteúdo
- O conteúdo interno não estava centralizado verticalmente de forma consistente
- A seção não ocupava 100% da altura da viewport

## Solução Implementada

### 1. BrandingSection (`src/components/branding/BrandingSection.tsx`)

#### Posicionamento Fixo
**Antes:**
```tsx
<div className="hidden md:flex md:w-1/4 lg:w-1/4 bg-gradient-to-br from-primary via-primary/95 to-brand-primary sticky top-0 relative">
```

**Depois:**
```tsx
<div className="hidden md:flex md:fixed md:left-0 md:top-0 md:h-screen md:w-1/4 lg:w-1/4 bg-gradient-to-br from-primary via-primary/95 to-brand-primary">
```

**Mudanças:**
- ✅ `sticky top-0` → `fixed left-0 top-0` (posicionamento fixo absoluto)
- ✅ `relative` removido (não é necessário com fixed)
- ✅ `md:h-screen` adicionado (ocupa 100% da altura da viewport)
- ✅ `md:flex` adicionado (necessário para sobrescrever `hidden` em desktop)

#### Centralização Vertical do Conteúdo
**Antes:**
```tsx
<div className="z-10 px-4 md:px-6 lg:px-8 tab-prod:px-4 text-white md:min-h-0 md:h-[calc(100svh-4rem)] md:supports-[height:100dvh]:h-[calc(100dvh-4rem)] flex">
  <div className="w-full grid min-h-full place-content-center">
```

**Depois:**
```tsx
<div className="relative z-10 h-full flex items-center justify-center px-4 md:px-6 lg:px-8 tab-prod:px-4 text-white">
  <div className="w-full">
```

**Mudanças:**
- ✅ `relative` adicionado para contexto de posicionamento
- ✅ `h-full` para ocupar toda a altura do container pai (100vh)
- ✅ `flex items-center justify-center` para centralização vertical e horizontal
- ✅ Removido `grid place-content-center` (substituído por flexbox mais simples)
- ✅ Removido cálculos complexos de altura (`calc(100svh-4rem)`)

### 2. Home (`src/pages/Home.tsx`)

#### Compensação de Espaço
**Antes:**
```tsx
<div className="flex-1 md:w-3/4 lg:w-3/4 flex flex-col bg-muted md:pb-20 tab-prod:pb-12">
```

**Depois:**
```tsx
<div className="flex-1 md:ml-[25%] md:w-3/4 lg:w-3/4 flex flex-col bg-muted md:pb-20 tab-prod:pb-12">
```

**Mudanças:**
- ✅ `md:ml-[25%]` adicionado (margem esquerda de 25% para compensar a branding fixa)
- ✅ Mantém `md:w-3/4` para garantir que o conteúdo ocupe 75% da largura

## Comportamento Resultante

### Posicionamento
- ✅ **BrandingSection fixa**: Permanece no lado esquerdo, sempre visível
- ✅ **Não rola com a página**: Mantém-se estática durante o scroll
- ✅ **Ocupa 25% da largura**: Consistente em todas as resoluções desktop/tablet
- ✅ **Ocupa 100% da altura**: Preenche toda a viewport verticalmente

### Centralização
- ✅ **Conteúdo centralizado verticalmente**: Sempre no centro da viewport
- ✅ **Centralização dinâmica**: Ajusta-se automaticamente se a altura da viewport mudar
- ✅ **Centralização horizontal**: Conteúdo centralizado dentro dos 25% de largura

### Layout da Página
- ✅ **Conteúdo principal**: Ocupa 75% da largura à direita
- ✅ **Margem compensatória**: `ml-[25%]` garante que o conteúdo não fique sob a branding
- ✅ **Scroll independente**: Apenas o conteúdo principal rola, branding permanece fixa

## Estrutura Visual

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌──────────┐  ┌────────────────────────────────────┐  │
│  │          │  │                                    │  │
│  │          │  │                                    │  │
│  │          │  │                                    │  │
│  │ Branding │  │         Conteúdo Principal         │  │
│  │  (Fixed) │  │         (Scrollable)               │  │
│  │   25%    │  │            75%                     │  │
│  │          │  │                                    │  │
│  │          │  │         ↕ Scroll                   │  │
│  │          │  │                                    │  │
│  └──────────┘  └────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
     ↑ Fixa              ↑ ml-[25%] para compensar
```

## Classes Tailwind Utilizadas

### BrandingSection - Container Principal
```css
hidden          /* Oculto em mobile */
md:flex         /* Display flex em desktop/tablet (sobrescreve hidden) */
md:fixed        /* Posicionamento fixo em desktop/tablet */
md:left-0       /* Alinhado à esquerda */
md:top-0        /* Alinhado ao topo */
md:h-screen     /* Altura de 100vh */
md:w-1/4        /* Largura de 25% */
```

### BrandingSection - Container de Conteúdo
```css
relative        /* Contexto de posicionamento */
z-10            /* Acima do background pattern */
h-full          /* 100% da altura do pai (100vh) */
flex            /* Flexbox para centralização */
items-center    /* Centralização vertical */
justify-center  /* Centralização horizontal */
```

### Home - Seção de Conteúdo
```css
flex-1          /* Ocupa espaço restante */
md:ml-[25%]     /* Margem esquerda de 25% (compensa branding fixa) */
md:w-3/4        /* Largura de 75% */
```

## Compatibilidade

### Desktop/Tablet (≥ 768px)
- ✅ BrandingSection fixa no lado esquerdo
- ✅ Conteúdo com margem de 25% à esquerda
- ✅ Scroll independente do conteúdo

### Mobile (< 768px)
- ✅ BrandingSection oculta (`hidden`)
- ✅ Conteúdo ocupa 100% da largura
- ✅ Header mobile visível no topo

### Resolução 1000x400px (tab-prod)
- ✅ Mantém todos os ajustes de responsividade anteriores
- ✅ BrandingSection compacta e fixa
- ✅ Conteúdo otimizado com 4 colunas de cards

## Vantagens da Implementação

1. **Simplicidade**: Uso de `flex items-center justify-center` é mais simples que `grid place-content-center`
2. **Performance**: Menos cálculos de altura (`calc(100svh-4rem)` removido)
3. **Responsividade**: Centralização automática em qualquer altura de viewport
4. **Manutenibilidade**: Código mais limpo e fácil de entender
5. **Consistência**: Comportamento previsível em todas as resoluções

## Testes Recomendados

### Teste 1: Scroll
1. Abrir a página Home
2. Fazer scroll para baixo
3. ✅ Verificar que a BrandingSection permanece fixa
4. ✅ Verificar que apenas o conteúdo principal rola

### Teste 2: Centralização Vertical
1. Redimensionar a altura da janela do navegador
2. ✅ Verificar que o conteúdo da BrandingSection permanece centralizado
3. Testar em diferentes alturas (400px, 600px, 800px, 1080px)

### Teste 3: Responsividade
1. Testar em resolução mobile (< 768px)
2. ✅ Verificar que BrandingSection está oculta
3. Testar em resolução tablet (768px - 1024px)
4. ✅ Verificar que BrandingSection está visível e fixa
5. Testar em resolução 1000x400px
6. ✅ Verificar que todos os ajustes de compactação estão funcionando

### Teste 4: Layout
1. Verificar que não há sobreposição de conteúdo
2. ✅ Conteúdo principal não fica sob a BrandingSection
3. ✅ Footer está posicionado corretamente
4. ✅ Não há scroll horizontal indesejado

## Notas Técnicas

- **z-index**: BrandingSection usa `z-10` para ficar acima do background pattern
- **Overflow**: Não há overflow na BrandingSection (conteúdo sempre cabe na viewport)
- **Flexbox**: Preferido sobre Grid para centralização simples
- **Viewport units**: `h-screen` usa `100vh` (altura da viewport)
- **Margem compensatória**: `ml-[25%]` garante que o conteúdo não fique sob a branding fixa

## Arquivos Modificados

1. ✅ `src/components/branding/BrandingSection.tsx`
   - Posicionamento fixo
   - Centralização vertical com flexbox
   - Altura de 100vh

2. ✅ `src/pages/Home.tsx`
   - Margem esquerda de 25% no conteúdo
   - Comentários atualizados

