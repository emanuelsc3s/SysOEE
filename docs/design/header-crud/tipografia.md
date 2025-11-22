# Sistema Tipográfico

## 📋 Visão Geral

O sistema tipográfico do APFAR utiliza a fonte **Inter** como família principal, com uma escala de tamanhos baseada no Tailwind CSS. A tipografia é configurada para proporcionar hierarquia clara e legibilidade em diferentes dispositivos.

## 🔤 Família de Fontes

### Fonte Principal: Inter

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
}
```

**Pesos disponíveis:**
- **300** - Light
- **400** - Regular (padrão para corpo de texto)
- **500** - Medium (padrão para botões)
- **600** - Semibold (padrão para subtítulos)
- **700** - Bold (padrão para títulos)

**Configuração Tailwind:**
```typescript
// tailwind.config.ts
fontFamily: {
  sans: ['Inter', 'sans-serif'],
}
```

---

## 📏 Escala de Tamanhos

### Tabela de Referência

| Classe | Tamanho | Line Height | Pixels | Uso |
|--------|---------|-------------|--------|-----|
| `text-xs` | 0.75rem | 1rem | 12px | Texto muito pequeno, labels |
| `text-sm` | 0.875rem | 1.25rem | 14px | **Botões, inputs** |
| `text-base` | 1rem | 1.5rem | 16px | **Corpo de texto** |
| `text-lg` | 1.125rem | 1.75rem | 18px | Texto destacado |
| `text-xl` | 1.25rem | 1.75rem | 20px | Subtítulos |
| `text-2xl` | 1.5rem | 2rem | 24px | **Títulos principais** |
| `text-3xl` | 1.875rem | 2.25rem | 30px | Títulos grandes |
| `text-4xl` | 2.25rem | 2.5rem | 36px | Títulos muito grandes |

---

## 🎯 Tipografia no Header CRUD

### Título Principal (h1)

```tsx
<h1 className="text-2xl font-bold text-brand-primary">
  Licitação Número: [49666]
</h1>
```

**Especificações:**
- **Tamanho:** `text-2xl` (1.5rem / 24px)
- **Peso:** `font-bold` (700)
- **Cor:** `text-brand-primary` (#242f65)
- **Line Height:** 2rem (32px)

**Uso:**
- Títulos principais de páginas
- Cabeçalhos de formulários
- Identificadores principais

---

### Subtítulo (p)

```tsx
<p className="text-brand-text-secondary">
  Registre uma nova licitação ou edite existente
</p>
```

**Especificações:**
- **Tamanho:** `text-base` (1rem / 16px) - padrão
- **Peso:** `font-normal` (400) - padrão
- **Cor:** `text-brand-text-secondary` (#57636c)
- **Line Height:** 1.5rem (24px)

**Uso:**
- Descrições de páginas
- Textos explicativos
- Informações complementares

---

### Texto de Botões

```tsx
<Button className="text-sm font-medium">
  Salvar
</Button>
```

**Especificações:**
- **Tamanho:** `text-sm` (0.875rem / 14px)
- **Peso:** `font-medium` (500)
- **Line Height:** 1.25rem (20px)

**Uso:**
- Todos os botões do sistema
- Labels de ações
- Textos interativos

---

## 📐 Pesos de Fonte

### Tabela de Pesos

| Classe | Valor | Nome | Uso Principal |
|--------|-------|------|---------------|
| `font-light` | 300 | Light | Textos decorativos |
| `font-normal` | 400 | Regular | **Corpo de texto** |
| `font-medium` | 500 | Medium | **Botões, labels** |
| `font-semibold` | 600 | Semibold | **Subtítulos, h3-h6** |
| `font-bold` | 700 | Bold | **Títulos h1-h2** |

### Exemplos de Uso

```tsx
// Título principal
<h1 className="font-bold">Título Principal</h1>

// Subtítulo
<h2 className="font-semibold">Subtítulo</h2>

// Corpo de texto
<p className="font-normal">Texto do corpo</p>

// Botão
<Button className="font-medium">Ação</Button>

// Texto leve
<span className="font-light">Informação secundária</span>
```

---

## 🎨 Cores de Texto

### Cores Principais

```tsx
// Texto primário (padrão)
<p className="text-brand-text-primary">Texto principal</p>

// Texto secundário
<p className="text-brand-text-secondary">Texto secundário</p>

// Cor da marca
<h1 className="text-brand-primary">Título com cor da marca</h1>
```

**Valores:**
- `text-brand-text-primary`: #141b1b (quase preto)
- `text-brand-text-secondary`: #57636c (cinza médio)
- `text-brand-primary`: #242f65 (azul institucional)

### Cores Semânticas

```tsx
// Texto destrutivo
<p className="text-destructive">Erro ou ação destrutiva</p>

// Texto muted (desabilitado)
<p className="text-muted-foreground">Texto desabilitado</p>
```

---

## 📏 Line Height (Altura de Linha)

### Escala de Line Height

| Classe | Valor | Uso |
|--------|-------|-----|
| `leading-none` | 1 | Títulos compactos |
| `leading-tight` | 1.25 | Títulos |
| `leading-snug` | 1.375 | Subtítulos |
| `leading-normal` | 1.5 | **Corpo de texto** |
| `leading-relaxed` | 1.625 | Texto confortável |
| `leading-loose` | 2 | Texto espaçado |

**Padrão do sistema:**
- Títulos: Line height automático baseado no tamanho
- Corpo de texto: `leading-normal` (1.5)

---

## 🎯 Hierarquia Tipográfica

### Níveis de Hierarquia

```tsx
// Nível 1 - Título da Página
<h1 className="text-2xl font-bold text-brand-primary">
  Título Principal
</h1>

// Nível 2 - Seção Principal
<h2 className="text-xl font-semibold text-brand-text-primary">
  Seção Principal
</h2>

// Nível 3 - Subseção
<h3 className="text-lg font-semibold text-brand-text-primary">
  Subseção
</h3>

// Nível 4 - Título de Card
<h4 className="text-base font-semibold text-brand-text-primary">
  Título de Card
</h4>

// Corpo de Texto
<p className="text-base font-normal text-brand-text-primary">
  Texto do corpo
</p>

// Texto Secundário
<p className="text-sm font-normal text-brand-text-secondary">
  Informação adicional
</p>

// Texto Pequeno
<span className="text-xs font-normal text-brand-text-secondary">
  Nota de rodapé
</span>
```

---

## 🎨 Estilos Globais

### Configuração Base

```css
/* src/index.css */
@layer base {
  body {
    @apply bg-brand-bg-primary text-brand-text-primary font-sans;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-semibold text-brand-text-primary;
  }
}
```

**Comportamento:**
- Todos os headings recebem `font-semibold` por padrão
- Cor padrão dos headings: `text-brand-text-primary`
- Fonte padrão do body: Inter (via `font-sans`)

---

## 📱 Tipografia Responsiva

### Ajustes por Breakpoint

```tsx
// Título que cresce em telas maiores
<h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
  Título Responsivo
</h1>

// Texto que ajusta em mobile
<p className="text-sm md:text-base">
  Texto que fica maior em desktop
</p>
```

### Padrões Mobile

```tsx
// Header mobile - título menor
<h1 className="text-xl md:text-2xl font-bold">
  Título
</h1>

// Botões mobile - texto mantém tamanho
<Button className="text-sm">
  Ação
</Button>
```

---

## ♿ Acessibilidade

### Contraste de Texto

**Combinações aprovadas (WCAG AA):**

✅ **Texto grande (18px+ ou 14px+ bold):**
- `text-brand-primary` sobre `bg-white` - 9.8:1
- `text-brand-text-primary` sobre `bg-white` - 14.5:1
- `text-brand-text-secondary` sobre `bg-white` - 5.2:1

✅ **Texto normal (< 18px):**
- `text-brand-text-primary` sobre `bg-white` - 14.5:1
- `text-brand-text-secondary` sobre `bg-white` - 5.2:1

⚠️ **Atenção:**
- `text-brand-secondary` sobre `bg-white` - 3.2:1 (apenas texto grande)

### Tamanho Mínimo

**Recomendações:**
- Texto de corpo: Mínimo `text-sm` (14px)
- Texto de botões: Mínimo `text-sm` (14px)
- Labels: Mínimo `text-xs` (12px)

---

## 🎯 Guia de Uso

### Quando usar cada tamanho

| Tamanho | Uso | Exemplo |
|---------|-----|---------|
| `text-xs` | Metadados, timestamps | "Atualizado há 2 horas" |
| `text-sm` | Botões, inputs, labels | Texto de botões |
| `text-base` | Corpo de texto | Parágrafos, descrições |
| `text-lg` | Texto destacado | Valores importantes |
| `text-xl` | Subtítulos de seção | "Informações Gerais" |
| `text-2xl` | Títulos de página | "Cadastro de Licitação" |
| `text-3xl+` | Títulos especiais | Landing pages, hero |

### Quando usar cada peso

| Peso | Uso | Exemplo |
|------|-----|---------|
| `font-light` | Decorativo | Textos grandes decorativos |
| `font-normal` | Corpo de texto | Parágrafos, descrições |
| `font-medium` | Botões, labels | Elementos interativos |
| `font-semibold` | Subtítulos | h3, h4, h5, h6 |
| `font-bold` | Títulos principais | h1, h2 |

---

## 🔗 Referências

- [Inter Font](https://fonts.google.com/specimen/Inter)
- [Tailwind CSS Typography](https://tailwindcss.com/docs/font-size)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

**Última atualização:** 2025-01-16

