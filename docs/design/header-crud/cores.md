# Tokens de Cores

## 📋 Visão Geral

O sistema de cores do APFAR utiliza uma combinação de tokens CSS customizados (HSL) e cores da marca (HEX). As cores são definidas em dois locais principais:
- **Variáveis CSS**: `/src/index.css` (tokens HSL)
- **Tailwind Config**: `/tailwind.config.ts` (cores da marca)

## 🎨 Cores da Marca (Brand Colors)

### Paleta Principal

```typescript
// tailwind.config.ts
brand: {
  primary: '#242f65',      // Azul escuro institucional
  secondary: '#62a183',    // Verde institucional
  tertiary: '#ee8b60',     // Laranja institucional
  alternate: '#e0e3e7',    // Cinza claro alternativo
}
```

#### Brand Primary
- **Valor:** `#242f65`
- **RGB:** `rgb(36, 47, 101)`
- **HSL:** `hsl(228, 48%, 30%)`
- **Uso:** 
  - Cor principal da marca
  - Títulos importantes
  - Botões de ação primária
  - Sidebar e navegação
  - Links e elementos interativos

**Exemplo:**
```tsx
<h1 className="text-brand-primary">Título Principal</h1>
<Button className="bg-brand-primary hover:bg-brand-primary/90">
  Ação Primária
</Button>
```

#### Brand Secondary
- **Valor:** `#62a183`
- **RGB:** `rgb(98, 161, 131)`
- **HSL:** `hsl(147, 25%, 51%)`
- **Uso:**
  - Elementos secundários de destaque
  - Ícones e badges
  - Estados de sucesso
  - Elementos complementares

**Exemplo:**
```tsx
<Badge className="bg-brand-secondary">Ativo</Badge>
```

#### Brand Tertiary
- **Valor:** `#ee8b60`
- **RGB:** `rgb(238, 139, 96)`
- **HSL:** `hsl(18, 80%, 65%)`
- **Uso:**
  - Destaques e call-to-actions
  - Alertas informativos
  - Elementos de atenção (não críticos)

**Exemplo:**
```tsx
<Alert className="border-brand-tertiary">Informação importante</Alert>
```

#### Brand Alternate
- **Valor:** `#e0e3e7`
- **RGB:** `rgb(224, 227, 231)`
- **HSL:** `hsl(214, 14%, 89%)`
- **Uso:**
  - Fundos alternativos
  - Separadores sutis
  - Áreas de baixo contraste

---

### Cores de Texto

```typescript
brand: {
  'text-primary': '#141b1b',    // Texto principal
  'text-secondary': '#57636c',  // Texto secundário
}
```

#### Text Primary
- **Valor:** `#141b1b`
- **RGB:** `rgb(20, 27, 27)`
- **Uso:**
  - Texto principal do corpo
  - Títulos e cabeçalhos
  - Conteúdo de alta prioridade

**Exemplo:**
```tsx
<p className="text-brand-text-primary">Conteúdo principal</p>
```

#### Text Secondary
- **Valor:** `#57636c`
- **RGB:** `rgb(87, 99, 108)`
- **Uso:**
  - Texto descritivo
  - Subtítulos
  - Informações complementares
  - Labels de formulário

**Exemplo:**
```tsx
<p className="text-brand-text-secondary">Descrição adicional</p>
```

---

### Cores de Fundo

```typescript
brand: {
  'bg-primary': '#f1f4f8',    // Fundo principal
  'bg-secondary': '#ffffff',  // Fundo secundário
}
```

#### Background Primary
- **Valor:** `#f1f4f8`
- **RGB:** `rgb(241, 244, 248)`
- **Uso:**
  - Fundo principal da aplicação
  - Áreas de conteúdo
  - Background padrão do body

**Exemplo:**
```tsx
<div className="bg-brand-bg-primary">Conteúdo</div>
```

#### Background Secondary
- **Valor:** `#ffffff`
- **RGB:** `rgb(255, 255, 255)`
- **Uso:**
  - Cards e painéis
  - Modais e diálogos
  - Áreas de destaque sobre o fundo principal

---

### Cores de Acento

```typescript
brand: {
  'accent-1': '#4c4b39ef',  // Acento 1 (com transparência)
  'accent-2': '#4d39d2c0',  // Acento 2 (com transparência)
  'accent-3': '#4dee8b60',  // Acento 3 (com transparência)
  'accent-4': '#ccffffff',  // Acento 4 (branco transparente)
}
```

**Uso:** Overlays, sombras, efeitos especiais

---

## 🎨 Tokens Semânticos (HSL)

### Cores Primárias

```css
:root {
  --primary: 228 48% 30%;              /* #242f65 */
  --primary-foreground: 210 40% 98%;   /* Texto sobre primary */
}
```

**Uso:**
```tsx
<Button>Ação Primária</Button>  // Usa bg-primary
```

---

### Cores Secundárias

```css
:root {
  --secondary: 147 25% 51%;            /* #62a183 */
  --secondary-foreground: 222.2 47.4% 11.2%;
}
```

**Uso:**
```tsx
<Button variant="secondary">Ação Secundária</Button>
```

---

### Cores Destrutivas

```css
:root {
  --destructive: 0 84.2% 60.2%;        /* Vermelho */
  --destructive-foreground: 210 40% 98%;
}
```

**Uso:**
```tsx
<Button variant="destructive">Excluir</Button>
```

**Visualização:**
- **Cor:** Vermelho vibrante
- **Uso:** Ações de exclusão, remoção, cancelamento irreversível

---

### Cores de Fundo e Superfície

```css
:root {
  --background: 0 0% 100%;             /* Branco */
  --foreground: 222.2 84% 4.9%;        /* Texto escuro */
  
  --card: 0 0% 100%;                   /* Fundo de cards */
  --card-foreground: 222.2 84% 4.9%;   /* Texto em cards */
  
  --popover: 0 0% 100%;                /* Fundo de popovers */
  --popover-foreground: 222.2 84% 4.9%;
}
```

---

### Cores de Estado

```css
:root {
  --muted: 210 40% 96.1%;              /* Cinza claro */
  --muted-foreground: 215.4 16.3% 46.9%;
  
  --accent: 210 40% 96.1%;             /* Acento sutil */
  --accent-foreground: 222.2 47.4% 11.2%;
}
```

**Uso:**
- **Muted:** Elementos desabilitados, texto secundário
- **Accent:** Hover states, elementos destacados sutilmente

---

### Cores de Borda e Input

```css
:root {
  --border: 214.3 31.8% 91.4%;         /* Bordas padrão */
  --input: 214.3 31.8% 91.4%;          /* Bordas de input */
  --ring: 228 48% 30%;                 /* Anel de foco */
}
```

**Uso:**
```tsx
<Input className="border-input focus:ring-ring" />
```

---

## 🌙 Modo Escuro (Dark Mode)

```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  
  --primary: 228 48% 30%;
  --primary-foreground: 210 40% 98%;
  
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  
  /* ... outras cores ajustadas */
}
```

**Ativação:**
```tsx
<html className="dark">
```

---

## 🎨 Cores da Sidebar

```css
:root {
  --sidebar-background: 228 48% 30%;           /* Azul escuro */
  --sidebar-foreground: 0 0% 100%;             /* Branco */
  --sidebar-primary: 147 25% 51%;              /* Verde */
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 228 48% 20%;               /* Azul mais escuro */
  --sidebar-accent-foreground: 0 0% 100%;
  --sidebar-border: 228 48% 20%;
  --sidebar-ring: 228 48% 35%;
}
```

---

## 📊 Tabela de Referência Rápida

| Nome | Valor HEX | Valor HSL | Uso Principal |
|------|-----------|-----------|---------------|
| Brand Primary | `#242f65` | `228 48% 30%` | Títulos, botões primários |
| Brand Secondary | `#62a183` | `147 25% 51%` | Elementos secundários |
| Brand Tertiary | `#ee8b60` | `18 80% 65%` | Destaques, alertas |
| Text Primary | `#141b1b` | - | Texto principal |
| Text Secondary | `#57636c` | - | Texto descritivo |
| BG Primary | `#f1f4f8` | - | Fundo da aplicação |
| BG Secondary | `#ffffff` | `0 0% 100%` | Cards, modais |
| Destructive | - | `0 84.2% 60.2%` | Ações destrutivas |

---

## 🎯 Guia de Uso

### Quando usar cada cor

#### Brand Primary (`#242f65`)
✅ **Use para:**
- Títulos principais (h1, h2)
- Botões de ação primária
- Links importantes
- Navegação principal

❌ **Evite:**
- Texto de corpo extenso (baixo contraste)
- Fundos grandes (muito escuro)

#### Brand Secondary (`#62a183`)
✅ **Use para:**
- Badges de status positivo
- Ícones de sucesso
- Elementos complementares
- Botões secundários

❌ **Evite:**
- Ações destrutivas
- Alertas de erro

#### Destructive (Vermelho)
✅ **Use para:**
- Botões de exclusão
- Mensagens de erro
- Alertas críticos

❌ **Evite:**
- Elementos decorativos
- Informações neutras

---

## 🔧 Utilitários Tailwind

### Opacidade
```tsx
// 90% de opacidade
<div className="bg-brand-primary/90">

// 50% de opacidade
<div className="bg-brand-primary/50">

// 10% de opacidade
<div className="bg-brand-primary/10">
```

### Gradientes
```tsx
<div className="bg-gradient-to-r from-brand-primary to-brand-secondary">
  Gradiente
</div>
```

### Hover States
```tsx
<Button className="bg-brand-primary hover:bg-brand-primary/90">
  Hover com opacidade
</Button>
```

---

## ♿ Acessibilidade e Contraste

### Combinações Aprovadas (WCAG AA)

✅ **Texto sobre fundos:**
- `text-brand-primary` sobre `bg-white` - Contraste: 9.8:1
- `text-brand-text-primary` sobre `bg-white` - Contraste: 14.5:1
- `text-white` sobre `bg-brand-primary` - Contraste: 9.8:1

⚠️ **Atenção:**
- `text-brand-secondary` sobre `bg-white` - Contraste: 3.2:1 (apenas para texto grande)

❌ **Evitar:**
- `text-brand-tertiary` sobre `bg-white` - Contraste insuficiente para texto pequeno

---

## 🔗 Referências

- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- [HSL Color Picker](https://hslpicker.com/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**Última atualização:** 2025-01-16

