# Exemplos de Código e Variações

## 🎨 Variações do AppHeader

### 1. Header Simples (Sem Autenticação)

```tsx
export function SimpleHeader() {
  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h1 className="text-xl font-semibold text-brand-primary">
          APFARMA - Plataforma Integrada de Gestão
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/login')}>
          Entrar
        </Button>
      </div>
    </header>
  );
}
```

### 2. Header com Notificações

```tsx
import { Bell } from "lucide-react";

export function HeaderWithNotifications() {
  const [notifications, setNotifications] = useState(3);
  
  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h1 className="text-xl font-semibold text-brand-primary">
          APFARMA - Plataforma Integrada de Gestão
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Botão de notificações */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {notifications}
            </span>
          )}
        </Button>
        
        {/* Menu do usuário */}
        <DropdownMenu>
          {/* ... resto do código ... */}
        </DropdownMenu>
      </div>
    </header>
  );
}
```

### 3. Header com Busca

```tsx
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function HeaderWithSearch() {
  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h1 className="text-xl font-semibold text-brand-primary">
          APFARMA - Plataforma Integrada de Gestão
        </h1>
      </div>
      
      <div className="flex items-center gap-4 flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <DropdownMenu>
          {/* ... menu do usuário ... */}
        </DropdownMenu>
      </div>
    </header>
  );
}
```

### 4. Header com Menu Hamburguer (Mobile)

```tsx
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function HeaderWithMobileMenu() {
  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Menu hamburguer (mobile) */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          {/* Conteúdo do menu lateral */}
        </SheetContent>
      </Sheet>
      
      <div className="flex-1 md:flex-none">
        <h1 className="text-lg md:text-xl font-semibold text-brand-primary">
          APFARMA
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <DropdownMenu>
          {/* ... menu do usuário ... */}
        </DropdownMenu>
      </div>
    </header>
  );
}
```

### 5. Header com Dark Mode Toggle

```tsx
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function HeaderWithThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <header className="bg-white dark:bg-gray-900 border-b h-16 flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h1 className="text-xl font-semibold text-brand-primary dark:text-white">
          APFARMA - Plataforma Integrada de Gestão
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Toggle de tema */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        
        {/* Menu do usuário */}
        <DropdownMenu>
          {/* ... resto do código ... */}
        </DropdownMenu>
      </div>
    </header>
  );
}
```

## 🔧 Customizações Comuns

### Alterar Altura do Header

```tsx
// Altura padrão: 64px (h-16)
<header className="h-16">

// Altura maior: 80px (h-20)
<header className="h-20">

// Altura menor: 56px (h-14)
<header className="h-14">
```

### Alterar Cores

```tsx
// Fundo colorido
<header className="bg-brand-primary text-white border-b border-brand-primary">
  <h1 className="text-xl font-semibold text-white">

// Fundo gradiente
<header className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
```

### Avatar com Iniciais

```tsx
<AvatarFallback className="bg-brand-primary text-white">
  {userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  }
</AvatarFallback>
```

### Menu com Mais Opções

```tsx
<DropdownMenuContent align="end" className="w-56">
  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
  <DropdownMenuSeparator />
  
  <DropdownMenuItem onClick={() => navigate('/perfil')}>
    <User className="mr-2 h-4 w-4" />
    <span>Perfil</span>
  </DropdownMenuItem>
  
  <DropdownMenuItem onClick={() => navigate('/configuracoes')}>
    <Settings className="mr-2 h-4 w-4" />
    <span>Configurações</span>
  </DropdownMenuItem>
  
  <DropdownMenuItem onClick={() => navigate('/ajuda')}>
    <HelpCircle className="mr-2 h-4 w-4" />
    <span>Ajuda</span>
  </DropdownMenuItem>
  
  <DropdownMenuSeparator />
  
  <DropdownMenuItem onClick={handleSignOut}>
    <LogOut className="mr-2 h-4 w-4" />
    <span>Sair</span>
  </DropdownMenuItem>
</DropdownMenuContent>
```

## 🧪 Testes

### Teste de Renderização

```tsx
import { render, screen } from '@testing-library/react';
import { AppHeader } from './AppHeader';

describe('AppHeader', () => {
  it('deve renderizar o título', () => {
    render(<AppHeader />);
    expect(screen.getByText(/APFARMA/i)).toBeInTheDocument();
  });
  
  it('deve exibir o nome do usuário', async () => {
    render(<AppHeader />);
    expect(await screen.findByText('Emanuel Silva')).toBeInTheDocument();
  });
});
```

### Teste de Interação

```tsx
import { fireEvent, waitFor } from '@testing-library/react';

it('deve abrir o menu ao clicar', async () => {
  render(<AppHeader />);
  
  const trigger = screen.getByRole('button', { name: /emanuel silva/i });
  fireEvent.click(trigger);
  
  await waitFor(() => {
    expect(screen.getByText('Minha Conta')).toBeVisible();
  });
});
```

## 📱 Responsividade Avançada

### Breakpoints Customizados

```tsx
// Ocultar em tablets
<div className="hidden lg:block">
  {/* Visível apenas em desktop */}
</div>

// Mostrar apenas em mobile
<div className="block md:hidden">
  {/* Visível apenas em mobile */}
</div>

// Tamanhos diferentes por breakpoint
<h1 className="text-base sm:text-lg md:text-xl lg:text-2xl">
  APFARMA
</h1>
```

## 🎯 Performance

### Lazy Loading do Avatar

```tsx
<AvatarImage 
  src={fotoUrl} 
  alt={userName}
  loading="lazy"
/>
```

### Memoização

```tsx
import { memo } from 'react';

export const AppHeader = memo(function AppHeader() {
  // ... código do componente
});
```

### Debounce na Busca

```tsx
import { useDebouncedCallback } from 'use-debounce';

const handleSearch = useDebouncedCallback((value: string) => {
  // Lógica de busca
}, 300);
```

## 🔗 Integração com Outras Bibliotecas

### Com Framer Motion (Animações)

```tsx
import { motion } from 'framer-motion';

<motion.header
  initial={{ y: -100 }}
  animate={{ y: 0 }}
  className="bg-white border-b h-16..."
>
  {/* Conteúdo */}
</motion.header>
```

### Com React Hook Form

```tsx
import { useForm } from 'react-hook-form';

const { register, handleSubmit } = useForm();

<form onSubmit={handleSubmit(onSearch)}>
  <Input {...register('search')} placeholder="Buscar..." />
</form>
```

