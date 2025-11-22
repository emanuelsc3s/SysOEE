# Sistema de Botões

## 📋 Visão Geral

O sistema de botões do APFAR é baseado no componente `Button` do shadcn/ui, construído com Radix UI e class-variance-authority (CVA). Fornece variantes consistentes para diferentes tipos de ações na interface.

## 🎯 Componente Base

### Localização
```
/src/components/ui/button.tsx
```

### Implementação

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## 🎨 Variantes de Botões

### 1. Default (Primário)

**Uso:** Ação principal da interface

```tsx
<Button>Confirmar</Button>
```

**Estilos:**
- Fundo: `hsl(228 48% 30%)` - Azul escuro (brand-primary)
- Texto: `hsl(210 40% 98%)` - Branco
- Hover: 90% de opacidade do fundo

**Quando usar:**
- Ação principal de um formulário
- Confirmação de operações importantes
- Call-to-action primário

---

### 2. Destructive (Destrutivo)

**Uso:** Ações que removem ou excluem dados

```tsx
<Button variant="destructive">
  <Trash className="mr-2 h-4 w-4" />
  Excluir
</Button>
```

**Estilos:**
- Fundo: `hsl(0 84.2% 60.2%)` - Vermelho
- Texto: `hsl(210 40% 98%)` - Branco
- Hover: 90% de opacidade do fundo

**Quando usar:**
- Excluir registros
- Remover itens
- Cancelar operações irreversíveis
- Ações que requerem confirmação adicional

**⚠️ Importante:** Sempre combine com diálogos de confirmação

---

### 3. Outline (Secundário)

**Uso:** Ações secundárias ou navegação

```tsx
<Button variant="outline">
  <ArrowLeft className="mr-2 h-4 w-4" />
  Voltar
</Button>
```

**Estilos:**
- Fundo: Transparente
- Borda: `hsl(214.3 31.8% 91.4%)` - Cinza claro
- Texto: Cor do texto padrão
- Hover: Fundo accent (`hsl(210 40% 96.1%)`)

**Quando usar:**
- Botões de navegação (Voltar, Cancelar)
- Ações secundárias
- Alternativas à ação principal

**Customizações comuns:**
```tsx
<Button 
  variant="outline"
  className="border-gray-300 hover:bg-gray-100"
>
  Cancelar
</Button>
```

---

### 4. Secondary (Secundário Colorido)

**Uso:** Ações secundárias com destaque

```tsx
<Button variant="secondary">Visualizar</Button>
```

**Estilos:**
- Fundo: `hsl(147 25% 51%)` - Verde (brand-secondary)
- Texto: `hsl(222.2 47.4% 11.2%)` - Texto escuro
- Hover: 80% de opacidade do fundo

**Quando usar:**
- Ações secundárias que precisam de destaque
- Alternativas à ação primária
- Ações de visualização ou consulta

---

### 5. Ghost (Fantasma)

**Uso:** Ações terciárias ou sutis

```tsx
<Button variant="ghost">
  <MoreVertical className="h-4 w-4" />
</Button>
```

**Estilos:**
- Fundo: Transparente
- Sem borda
- Hover: Fundo accent sutil

**Quando usar:**
- Botões de menu
- Ações em tabelas
- Ícones clicáveis
- Ações que não devem chamar atenção

---

### 6. Link (Link Estilizado)

**Uso:** Links que parecem botões

```tsx
<Button variant="link">Saiba mais</Button>
```

**Estilos:**
- Sem fundo ou borda
- Texto sublinhado no hover
- Cor primária

**Quando usar:**
- Links de navegação
- Ações que levam a outras páginas
- Textos clicáveis

## 📏 Tamanhos de Botões

### Default (Padrão)
```tsx
<Button size="default">Botão Padrão</Button>
```
- Altura: 40px (`h-10`)
- Padding horizontal: 16px (`px-4`)
- Padding vertical: 8px (`py-2`)

### Small (Pequeno)
```tsx
<Button size="sm">Botão Pequeno</Button>
```
- Altura: 36px (`h-9`)
- Padding horizontal: 12px (`px-3`)

### Large (Grande)
```tsx
<Button size="lg">Botão Grande</Button>
```
- Altura: 44px (`h-11`)
- Padding horizontal: 32px (`px-8`)

### Icon (Apenas Ícone)
```tsx
<Button size="icon">
  <Search className="h-4 w-4" />
</Button>
```
- Dimensões: 40x40px (`h-10 w-10`)
- Quadrado perfeito para ícones

## 🎯 Classes Base (Aplicadas a Todos)

```css
inline-flex              /* Layout flexbox inline */
items-center             /* Alinhamento vertical */
justify-center           /* Alinhamento horizontal */
gap-2                    /* Espaçamento entre elementos (8px) */
whitespace-nowrap        /* Texto não quebra linha */
rounded-md               /* Bordas arredondadas */
text-sm                  /* Tamanho de fonte 14px */
font-medium              /* Peso da fonte 500 */
ring-offset-background   /* Offset do anel de foco */
transition-colors        /* Transição suave de cores */
```

## 🔄 Estados Interativos

### Focus (Foco)
```css
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-ring
focus-visible:ring-offset-2
```

**Comportamento:**
- Remove outline padrão do navegador
- Adiciona anel de foco de 2px
- Cor do anel: `hsl(228 48% 30%)`
- Offset de 2px para melhor visibilidade

### Disabled (Desabilitado)
```css
disabled:pointer-events-none
disabled:opacity-50
```

**Comportamento:**
- Cursor padrão (não clicável)
- Opacidade reduzida a 50%
- Eventos de ponteiro desabilitados

### Ícones SVG
```css
[&_svg]:pointer-events-none
[&_svg]:size-4
[&_svg]:shrink-0
```

**Comportamento:**
- Ícones não interceptam eventos de clique
- Tamanho fixo de 16x16px
- Não encolhem em layouts flex

## 🎨 Customizações Comuns

### Largura Mínima
```tsx
<Button className="min-w-[120px]">
  Salvar
</Button>
```

### Largura Total
```tsx
<Button className="w-full">
  Continuar
</Button>
```

### Cores Customizadas (Brand)
```tsx
<Button className="bg-brand-primary hover:bg-brand-primary/90">
  Ação Primária
</Button>

<Button className="bg-brand-secondary hover:bg-brand-secondary/90">
  Ação Secundária
</Button>

<Button className="bg-brand-tertiary hover:bg-brand-tertiary/90">
  Ação Terciária
</Button>
```

### Com Ícones
```tsx
// Ícone à esquerda
<Button>
  <Save className="mr-2 h-4 w-4" />
  Salvar
</Button>

// Ícone à direita
<Button>
  Continuar
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>

// Apenas ícone
<Button size="icon">
  <Settings className="h-4 w-4" />
</Button>
```

## 📦 Ícones Lucide React

### Ícones Comuns no Sistema

| Ícone | Componente | Uso |
|-------|------------|-----|
| ← | `ArrowLeft` | Voltar, navegação anterior |
| → | `ArrowRight` | Avançar, próximo |
| 💾 | `Save` | Salvar dados |
| 🗑️ | `Trash` | Excluir |
| ✏️ | `Edit` | Editar |
| ➕ | `Plus` | Adicionar novo |
| 🔍 | `Search` | Buscar |
| ⚙️ | `Settings` | Configurações |
| ✓ | `Check` | Confirmar |
| ✕ | `X` | Fechar, cancelar |

### Tamanhos de Ícones

```tsx
// Pequeno (12px)
<Icon className="h-3 w-3" />

// Padrão (16px)
<Icon className="h-4 w-4" />

// Médio (20px)
<Icon className="h-5 w-5" />

// Grande (24px)
<Icon className="h-6 w-6" />
```

## ♿ Acessibilidade

### Boas Práticas

1. **Texto Descritivo**
```tsx
// ✅ Bom - Texto claro
<Button>Salvar Licitação</Button>

// ❌ Evitar - Apenas ícone sem contexto
<Button size="icon">
  <Save />
</Button>

// ✅ Melhor - Ícone com aria-label
<Button size="icon" aria-label="Salvar licitação">
  <Save />
</Button>
```

2. **Estados de Carregamento**
```tsx
<Button disabled={isLoading} aria-busy={isLoading}>
  {isLoading ? 'Salvando...' : 'Salvar'}
</Button>
```

3. **Confirmação de Ações Destrutivas**
```tsx
<Button 
  variant="destructive"
  onClick={() => setShowConfirmDialog(true)}
  aria-label="Excluir licitação permanentemente"
>
  <Trash className="mr-2 h-4 w-4" />
  Excluir
</Button>
```

## 📱 Responsividade

### Adaptação Mobile

```tsx
// Ocultar texto em mobile, mostrar apenas ícone
<Button className="md:min-w-[120px]">
  <Save className="h-4 w-4 md:mr-2" />
  <span className="hidden md:inline">Salvar</span>
</Button>

// Largura total em mobile
<Button className="w-full md:w-auto">
  Continuar
</Button>
```

## 🔗 Componentes Relacionados

- [Header CRUD](./header-crud.md)
- [Tokens de Cores](../tokens/cores.md)
- [Sistema de Espaçamento](../tokens/espacamento.md)

---

**Última atualização:** 2025-01-16

