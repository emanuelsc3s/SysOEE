# Guia de Implementação

## 🚀 Passo a Passo Completo

### Passo 1: Instalação de Dependências

```bash
# Dependências principais
npm install react react-dom
npm install -D typescript @types/react @types/react-dom

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# shadcn/ui CLI
npx shadcn-ui@latest init

# Componentes shadcn/ui necessários
npx shadcn-ui@latest add button
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dropdown-menu

# Ícones
npm install lucide-react

# React Query (para dados do usuário)
npm install @tanstack/react-query

# React Router (para navegação)
npm install react-router-dom

# Supabase (para autenticação)
npm install @supabase/supabase-js
```

### Passo 2: Configuração do Tailwind

**tailwind.config.ts:**

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores semânticas (CSS variables)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        // Cores da marca
        brand: {
          primary: '#242f65',
          secondary: '#62a183',
          'text-primary': '#141b1b',
          'text-secondary': '#57636c',
          'bg-primary': '#f1f4f8',
          'bg-secondary': '#ffffff',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

### Passo 3: Estilos Globais

**src/index.css:**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 228 48% 30%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 228 48% 30%;
    --radius: 0.5rem;
  }
  
  body {
    @apply bg-brand-bg-primary text-brand-text-primary font-sans;
  }
}
```

### Passo 4: Configuração do Supabase

**src/lib/supabase.ts:**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**.env:**

```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

### Passo 5: Hook de Autenticação

**src/hooks/useAuth.ts:**

```typescript
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Busca sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, signOut };
}
```

### Passo 6: Componente AppHeader

**src/components/layout/AppHeader.tsx:**

```typescript
import { ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppHeader() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Busca dados do usuário
  const { data: tbusuario, isLoading } = useQuery({
    queryKey: ["tbusuario:nome", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tbusuario")
        .select("usuario,foto")
        .eq("uuid", user!.id)
        .single();

      if (error) throw error;
      return data as { usuario: string | null; foto: string | null };
    },
  });

  const userName =
    tbusuario?.usuario?.trim() ||
    user?.email ||
    "Usuário";
  const fotoUrl = tbusuario?.foto ?? "";

  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h1 className="text-xl font-semibold text-brand-primary">
          APFARMA - Plataforma Integrada de Gestão
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {fotoUrl ? (
                    <AvatarImage src={fotoUrl} alt={userName} />
                  ) : null}
                  <AvatarFallback className="bg-brand-primary text-white">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-sm text-left hidden md:block">
                  <p className="font-medium">
                    {isLoading ? "Carregando..." : userName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Administrador
                  </p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => navigate('/perfil')}>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={async () => {
                await signOut();
                navigate('/login');
              }}
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
```

### Passo 7: Integração no App

**src/App.tsx:**

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppHeader />
        {/* Resto da aplicação */}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
```

## ✅ Checklist de Implementação

- [ ] Dependências instaladas
- [ ] Tailwind configurado
- [ ] Variáveis CSS definidas
- [ ] Fonte Inter importada
- [ ] Componentes shadcn/ui adicionados
- [ ] Supabase configurado
- [ ] Hook useAuth criado
- [ ] Componente AppHeader implementado
- [ ] Integrado no App
- [ ] Testado em diferentes resoluções
- [ ] Navegação por teclado funcional
- [ ] Logout funcionando

