# Guia de Referência Rápida - AppHeader

## 🎯 Uso Básico

```tsx
import { AppHeader } from '@/components/layout/AppHeader';

function App() {
  return (
    <>
      <AppHeader />
      <main>{/* Conteúdo */}</main>
    </>
  );
}
```

## 📐 Especificações Visuais

### Dimensões
```
Altura: 64px (h-16)
Padding horizontal: 24px (px-6)
Avatar: 32px × 32px (h-8 w-8)
Ícones: 16px × 16px (h-4 w-4)
```

### Cores
```
Fundo: #ffffff (bg-white)
Título: #242f65 (text-brand-primary)
Borda: #e5e7eb (border-b)
Avatar fallback: #242f65 (bg-brand-primary)
Texto secundário: #6b7280 (text-muted-foreground)
```

### Tipografia
```
Título: 20px / 600 (text-xl font-semibold)
Nome: 14px / 500 (text-sm font-medium)
Cargo: 12px / 400 (text-xs)
Fonte: Inter
```

## 🔧 Instalação Rápida

```bash
# 1. Componentes shadcn/ui
npx shadcn-ui@latest add button avatar dropdown-menu

# 2. Ícones
npm install lucide-react

# 3. React Query
npm install @tanstack/react-query

# 4. Supabase
npm install @supabase/supabase-js
```

## 📝 Código Mínimo

```tsx
import { ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppHeader() {
  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-6 sticky top-0 z-40">
      <h1 className="text-xl font-semibold text-brand-primary">
        APFARMA
      </h1>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-brand-primary text-white">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Perfil</DropdownMenuItem>
          <DropdownMenuItem>Sair</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
```

## 🎨 Classes Tailwind Principais

```css
/* Container */
bg-white border-b h-16 flex items-center justify-between px-6 sticky top-0 z-40

/* Título */
text-xl font-semibold text-brand-primary

/* Botão */
variant="ghost" flex items-center gap-2

/* Avatar */
h-8 w-8 rounded-full bg-brand-primary text-white

/* Ícones */
h-4 w-4

/* Responsivo */
hidden md:block
```

## 🔑 Props e Configurações

### Button
```tsx
variant="ghost"      // Fundo transparente
size="default"       // 40px altura
asChild={true}       // Composição com Trigger
```

### Avatar
```tsx
className="h-8 w-8" // Tamanho customizado
```

### DropdownMenuContent
```tsx
align="end"          // Alinha à direita
className="w-56"     // Largura fixa
```

## 📱 Breakpoints

```tsx
// Mobile (< 768px)
<div className="hidden md:block">
  {/* Oculto em mobile */}
</div>

// Desktop (≥ 768px)
<div className="block md:hidden">
  {/* Oculto em desktop */}
</div>
```

## 🎯 Estados Comuns

### Loading
```tsx
{isLoading ? "Carregando..." : userName}
```

### Erro
```tsx
{error ? "Erro ao carregar" : userName}
```

### Sem foto
```tsx
<Avatar>
  {fotoUrl ? <AvatarImage src={fotoUrl} /> : null}
  <AvatarFallback>
    <User className="h-4 w-4" />
  </AvatarFallback>
</Avatar>
```

## 🔐 Autenticação

```tsx
const { user, signOut } = useAuth();

// Logout
<DropdownMenuItem
  onClick={async () => {
    await signOut();
    navigate('/login');
  }}
>
  Sair
</DropdownMenuItem>
```

## 🎨 Variações Rápidas

### Com notificação
```tsx
<Button variant="ghost" size="icon" className="relative">
  <Bell className="h-5 w-5" />
  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
    3
  </span>
</Button>
```

### Com busca
```tsx
<div className="relative flex-1 max-w-md">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
  <Input type="search" placeholder="Buscar..." className="pl-10" />
</div>
```

### Fundo colorido
```tsx
<header className="bg-brand-primary text-white border-b border-brand-primary">
```

## ⚡ Atalhos de Teclado

```
Space/Enter → Abre dropdown
↓ / ↑       → Navega itens
Esc         → Fecha dropdown
Tab         → Próximo elemento
```

## 🐛 Problemas Comuns

### Dropdown não abre
```tsx
// ✅ Correto
<DropdownMenuTrigger asChild>
  <Button>...</Button>
</DropdownMenuTrigger>

// ❌ Errado
<DropdownMenuTrigger>
  <Button>...</Button>
</DropdownMenuTrigger>
```

### Avatar não aparece
```tsx
// Verificar z-index e overflow
<Avatar className="h-8 w-8 relative">
```

### Estilos não aplicam
```tsx
// Verificar importação do CSS
import './index.css'
```

## 📚 Links Úteis

- [Documentação Completa](./README.md)
- [Guia de Implementação](./05-guia-implementacao.md)
- [Exemplos de Código](./06-exemplos-codigo.md)
- [Troubleshooting](./08-troubleshooting-faq.md)
- [shadcn/ui Docs](https://ui.shadcn.com/)

