# Guia Rápido - Design System APFAR

## 🚀 Início Rápido

Este guia fornece referências rápidas para os padrões mais comuns do Design System APFAR.

## 🎨 Cores Mais Usadas

```tsx
// Cores da Marca
className="text-brand-primary"        // #242f65 - Azul institucional
className="text-brand-secondary"      // #62a183 - Verde institucional
className="text-brand-tertiary"       // #ee8b60 - Laranja institucional

// Cores de Texto
className="text-brand-text-primary"   // #141b1b - Texto principal
className="text-brand-text-secondary" // #57636c - Texto secundário

// Cores de Fundo
className="bg-brand-bg-primary"       // #f1f4f8 - Fundo principal
className="bg-brand-bg-secondary"     // #ffffff - Fundo cards/modais
```

## 🔘 Botões Comuns

### Botão Primário (Salvar, Confirmar)
```tsx
<Button className="bg-brand-primary hover:bg-brand-primary/90">
  <Save className="mr-2 h-4 w-4" />
  Salvar
</Button>
```

### Botão Secundário (Voltar, Cancelar)
```tsx
<Button variant="outline" className="border-gray-300 hover:bg-gray-100">
  <ArrowLeft className="mr-2 h-4 w-4" />
  Voltar
</Button>
```

### Botão Destrutivo (Excluir, Remover)
```tsx
<Button variant="destructive">
  <Trash className="mr-2 h-4 w-4" />
  Excluir
</Button>
```

### Botão com Loading
```tsx
<Button disabled={isLoading}>
  <Save className="mr-2 h-4 w-4" />
  {isLoading ? 'Salvando...' : 'Salvar'}
</Button>
```

## 📏 Espaçamento Comum

```tsx
// Entre botões
<div className="flex gap-2">

// Entre campos de formulário
<div className="space-y-4">

// Entre seções
<div className="space-y-6">

// Padding de cards
<div className="p-6">

// Padding de botões
<Button className="px-4 py-2">
```

## 🔤 Tipografia Comum

```tsx
// Título de Página
<h1 className="text-2xl font-bold text-brand-primary">
  Título Principal
</h1>

// Subtítulo
<p className="text-brand-text-secondary">
  Descrição ou subtítulo
</p>

// Título de Seção
<h2 className="text-xl font-semibold text-brand-text-primary">
  Seção
</h2>

// Corpo de Texto
<p className="text-base text-brand-text-primary">
  Conteúdo
</p>
```

## 📋 Estruturas Comuns

### Header CRUD
```tsx
<div className="flex items-center justify-between">
  <div className="flex items-center gap-2">
    <div>
      <h1 className="text-2xl font-bold text-brand-primary">
        Título
      </h1>
      <p className="text-brand-text-secondary">
        Subtítulo
      </p>
    </div>
  </div>
  <div className="flex gap-2">
    <Button variant="outline">Voltar</Button>
    <Button variant="destructive">Excluir</Button>
    <Button>Salvar</Button>
  </div>
</div>
```

### Card Padrão
```tsx
<div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
  <h3 className="text-lg font-semibold text-brand-primary mb-3">
    Título do Card
  </h3>
  <div className="space-y-4">
    {/* Conteúdo */}
  </div>
</div>
```

### Formulário
```tsx
<div className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="campo">Label</Label>
    <Input id="campo" />
    <FormDescription>Descrição do campo</FormDescription>
  </div>
</div>
```

## 🎯 Ícones Mais Usados

```tsx
import {
  ArrowLeft,    // Voltar
  Save,         // Salvar
  Trash,        // Excluir
  Edit,         // Editar
  Plus,         // Adicionar
  Search,       // Buscar
  X,            // Fechar
  Check,        // Confirmar
  AlertCircle,  // Alerta
  Info,         // Informação
} from 'lucide-react';

// Uso padrão
<Icon className="h-4 w-4" />
<Icon className="mr-2 h-4 w-4" />  // Com margem
```

## 📱 Padrões Responsivos

```tsx
// Ocultar em mobile
<div className="hidden md:block">Desktop</div>

// Mostrar apenas em mobile
<div className="md:hidden">Mobile</div>

// Tamanho responsivo
<h1 className="text-xl md:text-2xl">Título</h1>

// Padding responsivo
<div className="p-4 md:p-6">Conteúdo</div>

// Layout responsivo
<div className="flex flex-col md:flex-row gap-4">
```

## ♿ Acessibilidade Rápida

```tsx
// Label para input
<Label htmlFor="nome">Nome</Label>
<Input id="nome" />

// Aria-label para ícone
<Button size="icon" aria-label="Excluir">
  <Trash className="h-4 w-4" />
</Button>

// Estado de loading
<Button disabled={isLoading} aria-busy={isLoading}>
  {isLoading ? 'Carregando...' : 'Carregar'}
</Button>

// Erro de validação
<Input aria-invalid={!!error} aria-describedby="error-msg" />
{error && <p id="error-msg" className="text-destructive">{error}</p>}
```

## 🎨 Variações de Opacidade

```tsx
// 90% - Hover states
className="bg-brand-primary/90"

// 50% - Disabled states
className="bg-brand-primary/50"

// 10% - Backgrounds sutis
className="bg-brand-primary/10"
```

## 📊 Tabela de Referência Rápida

### Espaçamento
| Classe | Pixels | Uso |
|--------|--------|-----|
| `gap-2` | 8px | Entre botões, ícone + texto |
| `gap-4` | 16px | Entre campos de formulário |
| `gap-6` | 24px | Entre seções |
| `p-4` | 16px | Padding padrão |
| `p-6` | 24px | Padding de cards |

### Tipografia
| Classe | Pixels | Uso |
|--------|--------|-----|
| `text-sm` | 14px | Botões, inputs |
| `text-base` | 16px | Corpo de texto |
| `text-xl` | 20px | Subtítulos |
| `text-2xl` | 24px | Títulos principais |

### Cores
| Token | Hex | Uso |
|-------|-----|-----|
| `brand-primary` | #242f65 | Títulos, botões primários |
| `brand-secondary` | #62a183 | Elementos secundários |
| `brand-text-primary` | #141b1b | Texto principal |
| `brand-text-secondary` | #57636c | Texto secundário |

## 🔗 Links Úteis

- [Documentação Completa](./README.md)
- [Header CRUD](./componentes/header-crud.md)
- [Sistema de Botões](./componentes/botoes.md)
- [Tokens de Cores](./tokens/cores.md)
- [Espaçamento](./tokens/espacamento.md)
- [Tipografia](./tokens/tipografia.md)
- [Boas Práticas](./componentes/boas-praticas.md)
- [Exemplo de Código](./exemplos/header-crud-exemplo.tsx)

---

**Última atualização:** 2025-01-16

