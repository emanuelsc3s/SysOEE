# Sistema de Espaçamento

## 📋 Visão Geral

O sistema de espaçamento do APFAR utiliza a escala padrão do Tailwind CSS, baseada em múltiplos de 0.25rem (4px). Esta escala proporciona consistência visual e facilita a manutenção do layout.

## 📏 Escala de Espaçamento Base

### Tabela de Referência

| Classe | Valor | Pixels | Uso Comum |
|--------|-------|--------|-----------|
| `0` | 0 | 0px | Reset de espaçamento |
| `px` | 1px | 1px | Bordas finas |
| `0.5` | 0.125rem | 2px | Espaçamento mínimo |
| `1` | 0.25rem | 4px | Espaçamento muito pequeno |
| `1.5` | 0.375rem | 6px | Espaçamento pequeno |
| `2` | 0.5rem | 8px | **Espaçamento padrão** |
| `2.5` | 0.625rem | 10px | Espaçamento pequeno-médio |
| `3` | 0.75rem | 12px | Espaçamento médio |
| `3.5` | 0.875rem | 14px | Espaçamento médio-grande |
| `4` | 1rem | 16px | **Espaçamento comum** |
| `5` | 1.25rem | 20px | Espaçamento grande |
| `6` | 1.5rem | 24px | Espaçamento muito grande |
| `8` | 2rem | 32px | Seções |
| `10` | 2.5rem | 40px | Seções grandes |
| `12` | 3rem | 48px | Separação de blocos |
| `16` | 4rem | 64px | Separação de seções |

## 🎯 Espaçamento no Header CRUD

### Gap (Espaçamento entre elementos)

```tsx
// Container principal
<div className="flex items-center justify-between">
  
  // Seção de informações
  <div className="flex items-center gap-2">  {/* 8px entre elementos */}
    {/* Conteúdo */}
  </div>
  
  // Seção de botões
  <div className="flex gap-2">  {/* 8px entre botões */}
    {/* Botões */}
  </div>
</div>
```

**Valores utilizados:**
- `gap-2` (8px): Espaçamento padrão entre elementos relacionados

---

### Padding (Espaçamento interno)

#### Botões
```tsx
<Button className="px-4 py-2">  {/* 16px horizontal, 8px vertical */}
  Salvar
</Button>
```

**Valores utilizados:**
- `px-4` (16px): Padding horizontal dos botões
- `py-2` (8px): Padding vertical dos botões

#### Ícones
```tsx
<Save className="mr-2 h-4 w-4" />  {/* 8px de margem à direita */}
```

**Valores utilizados:**
- `mr-2` (8px): Margem direita do ícone
- `ml-2` (8px): Margem esquerda do ícone (quando à direita do texto)

---

### Margin (Espaçamento externo)

```tsx
// Espaçamento entre seções do formulário
<div className="space-y-6 pb-16">  {/* 24px entre seções, 64px padding inferior */}
  {/* Conteúdo */}
</div>
```

**Valores utilizados:**
- `space-y-6` (24px): Espaçamento vertical entre seções
- `pb-16` (64px): Padding inferior para evitar sobreposição com botões flutuantes

---

## 📐 Propriedades de Espaçamento

### Padding (p)

| Classe | Descrição | Exemplo |
|--------|-----------|---------|
| `p-{n}` | Padding em todos os lados | `p-4` = 16px |
| `px-{n}` | Padding horizontal (left + right) | `px-4` = 16px |
| `py-{n}` | Padding vertical (top + bottom) | `py-2` = 8px |
| `pt-{n}` | Padding top | `pt-4` = 16px |
| `pr-{n}` | Padding right | `pr-4` = 16px |
| `pb-{n}` | Padding bottom | `pb-4` = 16px |
| `pl-{n}` | Padding left | `pl-4` = 16px |

**Exemplo:**
```tsx
<div className="p-4">Padding 16px em todos os lados</div>
<div className="px-4 py-2">Padding 16px horizontal, 8px vertical</div>
```

---

### Margin (m)

| Classe | Descrição | Exemplo |
|--------|-----------|---------|
| `m-{n}` | Margin em todos os lados | `m-4` = 16px |
| `mx-{n}` | Margin horizontal (left + right) | `mx-4` = 16px |
| `my-{n}` | Margin vertical (top + bottom) | `my-2` = 8px |
| `mt-{n}` | Margin top | `mt-4` = 16px |
| `mr-{n}` | Margin right | `mr-2` = 8px |
| `mb-{n}` | Margin bottom | `mb-4` = 16px |
| `ml-{n}` | Margin left | `ml-2` = 8px |

**Exemplo:**
```tsx
<div className="mb-4">Margin bottom 16px</div>
<Icon className="mr-2" />  {/* Margin right 8px */}
```

---

### Gap (Flexbox/Grid)

| Classe | Descrição | Exemplo |
|--------|-----------|---------|
| `gap-{n}` | Gap em ambas as direções | `gap-2` = 8px |
| `gap-x-{n}` | Gap horizontal | `gap-x-4` = 16px |
| `gap-y-{n}` | Gap vertical | `gap-y-6` = 24px |

**Exemplo:**
```tsx
<div className="flex gap-2">
  <Button>Botão 1</Button>
  <Button>Botão 2</Button>
</div>
```

---

### Space Between (Espaçamento entre filhos)

| Classe | Descrição | Exemplo |
|--------|-----------|---------|
| `space-x-{n}` | Espaçamento horizontal entre filhos | `space-x-4` = 16px |
| `space-y-{n}` | Espaçamento vertical entre filhos | `space-y-6` = 24px |

**Exemplo:**
```tsx
<div className="space-y-6">
  <Section>Seção 1</Section>
  <Section>Seção 2</Section>
  <Section>Seção 3</Section>
</div>
```

---

## 🎨 Padrões de Espaçamento no APFAR

### Componentes de Formulário

```tsx
// Espaçamento entre campos de formulário
<div className="space-y-4">
  <FormField />
  <FormField />
  <FormField />
</div>

// Espaçamento interno de um campo
<div className="space-y-2">
  <Label />
  <Input />
  <FormDescription />
</div>
```

**Padrão:**
- Entre campos: `space-y-4` (16px)
- Dentro de um campo: `space-y-2` (8px)

---

### Cards e Painéis

```tsx
<div className="p-6 space-y-4">
  <CardHeader />
  <CardContent />
  <CardFooter />
</div>
```

**Padrão:**
- Padding interno: `p-6` (24px)
- Entre seções: `space-y-4` (16px)

---

### Botões

```tsx
// Grupo de botões
<div className="flex gap-2">
  <Button />
  <Button />
</div>

// Botão com ícone
<Button className="px-4 py-2">
  <Icon className="mr-2" />
  Texto
</Button>
```

**Padrão:**
- Entre botões: `gap-2` (8px)
- Padding: `px-4 py-2` (16px horizontal, 8px vertical)
- Ícone: `mr-2` ou `ml-2` (8px)

---

### Seções de Página

```tsx
<div className="space-y-6 pb-16">
  <Header />
  <MainContent />
  <Footer />
</div>
```

**Padrão:**
- Entre seções principais: `space-y-6` (24px)
- Padding inferior: `pb-16` (64px) para mobile com botões flutuantes

---

## 📱 Espaçamento Responsivo

### Breakpoints

```tsx
// Espaçamento que varia por tamanho de tela
<div className="p-4 md:p-6 lg:p-8">
  {/* 16px em mobile, 24px em tablet, 32px em desktop */}
</div>

// Gap responsivo
<div className="gap-2 md:gap-4">
  {/* 8px em mobile, 16px em tablet+ */}
</div>
```

### Padrões Mobile

```tsx
// Botões flutuantes mobile
<div className="fixed bottom-4 right-4 left-4 z-10 md:hidden">
  <div className="p-3 flex gap-2">
    {/* Padding reduzido e gap menor em mobile */}
  </div>
</div>
```

**Padrão Mobile:**
- Padding reduzido: `p-3` (12px) vs `p-6` (24px) desktop
- Gap menor: `gap-2` (8px) vs `gap-4` (16px) desktop

---

## 🎯 Guia de Decisão

### Quando usar cada espaçamento

| Espaçamento | Uso | Exemplo |
|-------------|-----|---------|
| `gap-1` (4px) | Elementos muito próximos | Ícone + badge |
| `gap-2` (8px) | **Elementos relacionados** | Botões, ícone + texto |
| `gap-4` (16px) | Elementos do mesmo grupo | Campos de formulário |
| `gap-6` (24px) | Seções de conteúdo | Blocos de informação |
| `gap-8` (32px) | Seções principais | Divisões de página |

### Hierarquia de Espaçamento

```
Menor espaçamento (mais relacionado)
↓
gap-1 (4px)   - Elementos inseparáveis
gap-2 (8px)   - Elementos muito relacionados ⭐ Padrão para botões
gap-4 (16px)  - Elementos relacionados ⭐ Padrão para formulários
gap-6 (24px)  - Grupos de elementos ⭐ Padrão para seções
gap-8 (32px)  - Seções distintas
↓
Maior espaçamento (menos relacionado)
```

---

## ♿ Acessibilidade

### Áreas de Toque (Mobile)

```tsx
// Mínimo de 44x44px para áreas clicáveis
<Button className="h-10 px-4">  {/* 40px altura */}
  Botão
</Button>

// Melhor para mobile
<Button className="h-11 px-4">  {/* 44px altura */}
  Botão Mobile
</Button>
```

**Recomendação:**
- Altura mínima de botões: `h-10` (40px) ou `h-11` (44px)
- Espaçamento mínimo entre elementos clicáveis: `gap-2` (8px)

---

## 🔗 Referências

- [Tailwind CSS Spacing](https://tailwindcss.com/docs/customizing-spacing)
- [Tailwind CSS Padding](https://tailwindcss.com/docs/padding)
- [Tailwind CSS Margin](https://tailwindcss.com/docs/margin)
- [Tailwind CSS Gap](https://tailwindcss.com/docs/gap)

---

**Última atualização:** 2025-01-16

