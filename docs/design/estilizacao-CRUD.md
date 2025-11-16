# Estilização com Tailwind CSS - Padrões e Boas Práticas

## Padrões de Estilização Utilizados

### 1. Sistema de Espaçamento

#### Espaçamento Vertical (space-y)

```typescript
// Container principal
<div className="space-y-6">
  {/* Espaçamento de 1.5rem (24px) entre elementos filhos */}
</div>

// Formulários
<div className="space-y-4">
  {/* Espaçamento de 1rem (16px) entre campos */}
</div>

// Campos individuais
<div className="space-y-2">
  <Label>Campo</Label>
  <Input />
</div>
```

#### Espaçamento Horizontal (space-x)

```typescript
// Botões lado a lado
<div className="flex space-x-2">
  <Button>Salvar</Button>
  <Button variant="outline">Cancelar</Button>
</div>
```

#### Gap (para Grid e Flex)

```typescript
// Grid com gap
<div className="grid grid-cols-2 gap-4">
  <Input />
  <Input />
</div>

// Flex com gap
<div className="flex gap-2">
  <Button />
  <Button />
</div>
```

### 2. Sistema de Grid Responsivo

#### Grid de 2 Colunas

```typescript
// Desktop: 2 colunas | Mobile: 1 coluna
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>Coluna 1</div>
  <div>Coluna 2</div>
</div>
```

#### Grid de 3 Colunas

```typescript
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div>Coluna 1</div>
  <div>Coluna 2</div>
  <div>Coluna 3</div>
</div>
```

#### Grid com Colunas Customizadas

```typescript
// Campo com botão de busca
<div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
  <Input />
  <Button>Pesquisar</Button>
</div>
```

### 3. Responsividade

#### Breakpoints do Tailwind

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

#### Padrões de Uso

```typescript
// Ocultar em mobile, mostrar em desktop
<div className="hidden md:block">
  Visível apenas em desktop
</div>

// Mostrar em mobile, ocultar em desktop
<div className="md:hidden">
  Visível apenas em mobile
</div>

// Botões flutuantes em mobile
<div className="fixed bottom-4 right-4 left-4 z-10 md:hidden">
  <div className="flex gap-2">
    <Button className="flex-1">Salvar</Button>
    <Button className="flex-1" variant="outline">Cancelar</Button>
  </div>
</div>
```

### 4. Cores e Temas

#### Cores do Sistema

```typescript
// Cores de marca (brand)
className="bg-brand-primary hover:bg-brand-primary/90"
className="text-brand-primary"

// Cores semânticas
className="bg-destructive text-destructive-foreground" // Vermelho
className="bg-primary text-primary-foreground"         // Azul
className="bg-secondary text-secondary-foreground"     // Cinza
className="bg-muted text-muted-foreground"            // Cinza claro

// Estados
className="hover:bg-gray-50"
className="focus:ring-2 focus:ring-brand-primary"
className="disabled:opacity-50 disabled:cursor-not-allowed"
```

#### Transparência

```typescript
// Opacidade com /
className="bg-black/50"  // 50% de opacidade
className="bg-white/90"  // 90% de opacidade
```

### 5. Tipografia

#### Tamanhos de Texto

```typescript
className="text-xs"    // 0.75rem (12px)
className="text-sm"    // 0.875rem (14px)
className="text-base"  // 1rem (16px)
className="text-lg"    // 1.125rem (18px)
className="text-xl"    // 1.25rem (20px)
className="text-2xl"   // 1.5rem (24px)
```

#### Peso da Fonte

```typescript
className="font-normal"    // 400
className="font-medium"    // 500
className="font-semibold"  // 600
className="font-bold"      // 700
```

#### Alinhamento

```typescript
className="text-left"
className="text-center"
className="text-right"
```

### 6. Bordas e Sombras

#### Bordas

```typescript
className="border"              // Borda padrão
className="border-2"            // Borda mais grossa
className="border-gray-200"     // Cor da borda
className="rounded"             // Border radius padrão
className="rounded-md"          // Border radius médio
className="rounded-lg"          // Border radius grande
className="rounded-full"        // Border radius circular
```

#### Sombras

```typescript
className="shadow"      // Sombra padrão
className="shadow-sm"   // Sombra pequena
className="shadow-md"   // Sombra média
className="shadow-lg"   // Sombra grande
className="shadow-none" // Sem sombra
```

### 7. Layout e Posicionamento

#### Flexbox

```typescript
// Container flex
<div className="flex items-center justify-between">
  <span>Esquerda</span>
  <span>Direita</span>
</div>

// Centralizar
<div className="flex items-center justify-center">
  Centralizado
</div>

// Direção
className="flex flex-col"     // Vertical
className="flex flex-row"     // Horizontal (padrão)
className="flex flex-wrap"    // Quebra linha
```

#### Posicionamento

```typescript
// Fixo
className="fixed top-0 left-0 right-0"
className="fixed bottom-4 right-4"

// Absoluto
className="absolute top-2 right-2"

// Relativo
className="relative"

// Z-index
className="z-10"
className="z-50"
```

### 8. Dimensões

#### Largura

```typescript
className="w-full"        // 100%
className="w-1/2"         // 50%
className="w-auto"        // Automático
className="w-[120px]"     // Valor customizado
className="max-w-3xl"     // Largura máxima
className="min-w-[200px]" // Largura mínima
```

#### Altura

```typescript
className="h-full"        // 100%
className="h-screen"      // 100vh
className="h-auto"        // Automático
className="h-[500px]"     // Valor customizado
className="max-h-[80vh]"  // Altura máxima
className="min-h-[200px]" // Altura mínima
```

### 9. Estados Interativos

#### Hover

```typescript
className="hover:bg-gray-50"
className="hover:text-brand-primary"
className="hover:scale-105"
className="hover:shadow-lg"
```

#### Focus

```typescript
className="focus:outline-none focus:ring-2 focus:ring-brand-primary"
className="focus:border-brand-primary"
```

#### Active

```typescript
className="active:scale-95"
className="active:bg-gray-100"
```

#### Disabled

```typescript
className="disabled:opacity-50 disabled:cursor-not-allowed"
```

### 10. Utilitários Comuns

#### Overflow

```typescript
className="overflow-hidden"
className="overflow-y-auto"
className="overflow-x-scroll"
```

#### Cursor

```typescript
className="cursor-pointer"
className="cursor-not-allowed"
className="cursor-default"
```

#### Select

```typescript
className="select-none"  // Não selecionável
className="select-text"  // Selecionável
```

#### Transições

```typescript
className="transition-all duration-200"
className="transition-colors"
className="ease-in-out"
```

### 11. Classes Customizadas do Projeto

```typescript
// Cores de marca
className="bg-brand-primary"
className="text-brand-primary"
className="border-brand-primary"

// Hover de marca
className="hover:bg-brand-primary/90"
```

### 12. Padrão de Composição

```typescript
// Exemplo completo de um botão customizado
<Button
  className={cn(
    "bg-brand-primary hover:bg-brand-primary/90",
    "text-white font-medium",
    "px-4 py-2 rounded-md",
    "transition-colors duration-200",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
  )}
>
  Salvar
</Button>
```