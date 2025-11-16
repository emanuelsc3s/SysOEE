# Boas Práticas - Design System APFAR

## 📋 Visão Geral

Este documento reúne as melhores práticas para utilização dos componentes e padrões do Design System APFAR, garantindo consistência, acessibilidade e manutenibilidade.

## 🎯 Princípios Gerais

### 1. Consistência Visual
- **Use sempre os tokens de design** (cores, espaçamento, tipografia)
- **Não crie variações customizadas** sem documentar
- **Mantenha a hierarquia visual** estabelecida

### 2. Reutilização
- **Prefira componentes existentes** antes de criar novos
- **Extraia padrões repetidos** em componentes reutilizáveis
- **Documente novos componentes** seguindo o padrão estabelecido

### 3. Acessibilidade
- **Sempre forneça texto alternativo** para ícones
- **Mantenha contraste adequado** (WCAG AA mínimo)
- **Teste com teclado** e leitores de tela

---

## 🎨 Cores

### ✅ Boas Práticas

```tsx
// ✅ Use tokens de cores da marca
<h1 className="text-brand-primary">Título</h1>

// ✅ Use variantes semânticas
<Button variant="destructive">Excluir</Button>

// ✅ Use opacidade para variações
<div className="bg-brand-primary/90">Hover state</div>
```

### ❌ Evite

```tsx
// ❌ Não use cores arbitrárias
<h1 className="text-[#123456]">Título</h1>

// ❌ Não use cores inline
<h1 style={{ color: '#123456' }}>Título</h1>

// ❌ Não ignore contraste
<p className="text-gray-400 bg-gray-300">Texto ilegível</p>
```

### 📝 Checklist de Cores

- [ ] Usa tokens de cores definidos no Design System?
- [ ] Mantém contraste mínimo de 4.5:1 para texto normal?
- [ ] Mantém contraste mínimo de 3:1 para texto grande?
- [ ] Cores têm significado semântico claro?

---

## 📏 Espaçamento

### ✅ Boas Práticas

```tsx
// ✅ Use escala de espaçamento padrão
<div className="gap-2">  {/* 8px */}
<div className="gap-4">  {/* 16px */}
<div className="gap-6">  {/* 24px */}

// ✅ Use space-y para espaçamento vertical consistente
<div className="space-y-4">
  <Section />
  <Section />
</div>

// ✅ Use gap para flexbox/grid
<div className="flex gap-2">
  <Button />
  <Button />
</div>
```

### ❌ Evite

```tsx
// ❌ Não use valores arbitrários
<div className="gap-[13px]">

// ❌ Não use margin em todos os filhos
<div>
  <Section className="mb-4" />
  <Section className="mb-4" />
  <Section className="mb-4" />
</div>

// ❌ Não misture unidades
<div className="p-4 m-[20px]">
```

### 📝 Checklist de Espaçamento

- [ ] Usa valores da escala padrão (2, 4, 6, 8)?
- [ ] Usa `gap` ou `space-y/x` para espaçamento entre elementos?
- [ ] Espaçamento reflete hierarquia de informação?
- [ ] Áreas de toque têm mínimo 44x44px?

---

## 🔤 Tipografia

### ✅ Boas Práticas

```tsx
// ✅ Use hierarquia semântica
<h1 className="text-2xl font-bold">Título Principal</h1>
<h2 className="text-xl font-semibold">Subtítulo</h2>
<p className="text-base">Corpo de texto</p>

// ✅ Use cores de texto semânticas
<p className="text-brand-text-primary">Texto principal</p>
<p className="text-brand-text-secondary">Texto secundário</p>

// ✅ Combine tamanho e peso apropriadamente
<h1 className="text-2xl font-bold">  {/* Grande + Negrito */}
<p className="text-sm font-normal">   {/* Pequeno + Regular */}
```

### ❌ Evite

```tsx
// ❌ Não use div para títulos
<div className="text-2xl font-bold">Título</div>

// ❌ Não use tamanhos arbitrários
<h1 className="text-[23px]">Título</h1>

// ❌ Não abuse de negrito
<p className="font-bold">Todo o parágrafo em negrito</p>
```

### 📝 Checklist de Tipografia

- [ ] Usa tags HTML semânticas (h1-h6, p, span)?
- [ ] Hierarquia visual clara (tamanho + peso)?
- [ ] Tamanho mínimo de 14px para texto de corpo?
- [ ] Line height adequado para legibilidade?

---

## 🔘 Botões

### ✅ Boas Práticas

```tsx
// ✅ Use variantes semânticas
<Button variant="outline">Cancelar</Button>
<Button variant="destructive">Excluir</Button>
<Button>Confirmar</Button>

// ✅ Combine ícones com texto
<Button>
  <Save className="mr-2 h-4 w-4" />
  Salvar
</Button>

// ✅ Forneça feedback de estado
<Button disabled={isLoading}>
  {isLoading ? 'Salvando...' : 'Salvar'}
</Button>

// ✅ Use aria-label para contexto
<Button size="icon" aria-label="Excluir licitação">
  <Trash className="h-4 w-4" />
</Button>
```

### ❌ Evite

```tsx
// ❌ Não use apenas ícones sem contexto
<Button size="icon">
  <Save />  {/* Sem aria-label */}
</Button>

// ❌ Não use cores arbitrárias
<Button className="bg-[#ff0000]">Excluir</Button>

// ❌ Não ignore estados de carregamento
<Button onClick={handleSave}>Salvar</Button>  {/* Sem feedback */}
```

### 📝 Checklist de Botões

- [ ] Variante apropriada para a ação?
- [ ] Texto descritivo claro?
- [ ] Ícone + texto (não apenas ícone)?
- [ ] Estados de loading/disabled implementados?
- [ ] Largura mínima de 120px para botões de ação?

---

## ♿ Acessibilidade

### ✅ Boas Práticas

```tsx
// ✅ Hierarquia de headings correta
<h1>Título da Página</h1>
<h2>Seção Principal</h2>
<h3>Subseção</h3>

// ✅ Labels para inputs
<Label htmlFor="nome">Nome</Label>
<Input id="nome" />

// ✅ Estados de foco visíveis
<Button>  {/* Já tem focus-visible:ring-2 */}
  Ação
</Button>

// ✅ Texto alternativo
<Button aria-label="Excluir licitação 49666">
  <Trash />
</Button>

// ✅ Estados ARIA
<Button aria-busy={isLoading} disabled={isLoading}>
  {isLoading ? 'Carregando...' : 'Carregar'}
</Button>
```

### ❌ Evite

```tsx
// ❌ Pular níveis de heading
<h1>Título</h1>
<h3>Subseção</h3>  {/* Pulou h2 */}

// ❌ Input sem label
<Input placeholder="Digite seu nome" />  {/* Sem label */}

// ❌ Remover outline de foco
<Button className="focus:outline-none">  {/* Sem alternativa */}

// ❌ Ícone sem contexto
<button><Trash /></button>  {/* Sem texto ou aria-label */}
```

### 📝 Checklist de Acessibilidade

- [ ] Hierarquia de headings correta (h1 → h2 → h3)?
- [ ] Todos os inputs têm labels associados?
- [ ] Estados de foco visíveis?
- [ ] Contraste de cores adequado (4.5:1 mínimo)?
- [ ] Ícones têm texto alternativo ou aria-label?
- [ ] Navegação por teclado funciona?
- [ ] Estados de loading comunicados (aria-busy)?

---

## 📱 Responsividade

### ✅ Boas Práticas

```tsx
// ✅ Mobile-first approach
<div className="p-4 md:p-6 lg:p-8">

// ✅ Ocultar/mostrar baseado em breakpoint
<div className="hidden md:block">Desktop only</div>
<div className="md:hidden">Mobile only</div>

// ✅ Ajustar tamanhos
<h1 className="text-xl md:text-2xl lg:text-3xl">
  Título Responsivo
</h1>

// ✅ Layout adaptativo
<div className="flex flex-col md:flex-row gap-4">
```

### ❌ Evite

```tsx
// ❌ Desktop-first (dificulta mobile)
<div className="p-8 md:p-4">

// ❌ Breakpoints customizados
<div className="hidden [@media(min-width:850px)]:block">

// ❌ Muitos breakpoints
<div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl">
```

### 📝 Checklist de Responsividade

- [ ] Testado em mobile (< 768px)?
- [ ] Testado em tablet (768px - 1024px)?
- [ ] Testado em desktop (> 1024px)?
- [ ] Botões têm área de toque adequada (44x44px)?
- [ ] Texto legível em todas as telas?

---

## 🎯 Formulários

### ✅ Boas Práticas

```tsx
// ✅ Estrutura clara
<div className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="nome">Nome</Label>
    <Input id="nome" />
    <FormDescription>Digite seu nome completo</FormDescription>
  </div>
</div>

// ✅ Validação com feedback
<Input 
  id="email"
  type="email"
  aria-invalid={!!errors.email}
  aria-describedby="email-error"
/>
{errors.email && (
  <p id="email-error" className="text-destructive text-sm">
    {errors.email.message}
  </p>
)}

// ✅ Estados de loading
<Button type="submit" disabled={isSubmitting}>
  {isSubmitting ? 'Salvando...' : 'Salvar'}
</Button>
```

### ❌ Evite

```tsx
// ❌ Inputs sem labels
<Input placeholder="Nome" />

// ❌ Validação sem feedback visual
<Input type="email" />  {/* Erro silencioso */}

// ❌ Botão submit sem estado
<Button type="submit">Salvar</Button>  {/* Sem loading */}
```

### 📝 Checklist de Formulários

- [ ] Todos os inputs têm labels?
- [ ] Validação com feedback visual?
- [ ] Mensagens de erro descritivas?
- [ ] Estados de loading implementados?
- [ ] Espaçamento consistente (space-y-4)?

---

## 🔄 Estados Interativos

### ✅ Boas Práticas

```tsx
// ✅ Hover states
<Button className="hover:bg-brand-primary/90">

// ✅ Focus states (já incluído no Button)
<Button>  {/* focus-visible:ring-2 */}

// ✅ Disabled states
<Button disabled={isLoading}>

// ✅ Loading states
<Button disabled={isLoading}>
  {isLoading ? 'Carregando...' : 'Carregar'}
</Button>
```

### 📝 Checklist de Estados

- [ ] Hover state visível?
- [ ] Focus state visível (anel de foco)?
- [ ] Disabled state claro (opacidade 50%)?
- [ ] Loading state com feedback textual?

---

## 📦 Organização de Código

### ✅ Boas Práticas

```tsx
// ✅ Imports organizados
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Trash } from 'lucide-react';

// ✅ Props tipadas
interface HeaderProps {
  title: string;
  onSave: () => void;
}

// ✅ Componente documentado
/**
 * Header CRUD para formulários
 * @param title - Título do formulário
 * @param onSave - Callback de salvamento
 */
export const Header: React.FC<HeaderProps> = ({ title, onSave }) => {
  // ...
}
```

### 📝 Checklist de Código

- [ ] Imports organizados (React → libs → componentes)?
- [ ] Props tipadas com TypeScript?
- [ ] Componente documentado (JSDoc)?
- [ ] Nomes descritivos e semânticos?

---

## 🔗 Recursos Adicionais

- [Componentes](./header-crud.md)
- [Tokens de Cores](../tokens/cores.md)
- [Sistema de Espaçamento](../tokens/espacamento.md)
- [Tipografia](../tokens/tipografia.md)

---

**Última atualização:** 2025-01-16

