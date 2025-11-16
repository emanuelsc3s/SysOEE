# Troubleshooting e FAQ

## 🐛 Problemas Comuns e Soluções

### 1. Componentes shadcn/ui não encontrados

**Erro:**
```
Module not found: Can't resolve '@/components/ui/button'
```

**Solução:**
```bash
# Instalar componentes necessários
npx shadcn-ui@latest add button
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dropdown-menu

# Verificar alias no tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 2. Estilos Tailwind não aplicados

**Problema:** Classes Tailwind não funcionam

**Solução:**
```javascript
// tailwind.config.ts - verificar content paths
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ...
}
```

**Verificar importação no main:**
```tsx
// src/main.tsx
import './index.css'
```

### 3. Variáveis CSS não definidas

**Erro:**
```
Invalid property value for 'color': 'hsl(var(--brand-primary))'
```

**Solução:**
```css
/* src/index.css - adicionar variáveis */
@layer base {
  :root {
    --primary: 228 48% 30%;
    --muted-foreground: 215.4 16.3% 46.9%;
    /* ... outras variáveis */
  }
}
```

### 4. Avatar não exibe imagem

**Problema:** Imagem do avatar não carrega

**Soluções:**

```tsx
// 1. Verificar URL da imagem
console.log('URL da foto:', fotoUrl);

// 2. Verificar CORS (Supabase Storage)
// No Supabase Dashboard: Storage > Policies
// Criar policy de leitura pública

// 3. Adicionar fallback
<Avatar className="h-8 w-8">
  {fotoUrl && fotoUrl.trim() !== '' ? (
    <AvatarImage 
      src={fotoUrl} 
      alt={userName}
      onError={(e) => {
        console.error('Erro ao carregar imagem:', e);
      }}
    />
  ) : null}
  <AvatarFallback className="bg-brand-primary text-white">
    <User className="h-4 w-4" />
  </AvatarFallback>
</Avatar>
```

### 5. Dropdown não abre

**Problema:** Menu dropdown não funciona ao clicar

**Soluções:**

```tsx
// 1. Verificar prop asChild
<DropdownMenuTrigger asChild>
  <Button variant="ghost">
    {/* Conteúdo */}
  </Button>
</DropdownMenuTrigger>

// 2. Verificar se DropdownMenu envolve trigger e content
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    {/* ... */}
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    {/* ... */}
  </DropdownMenuContent>
</DropdownMenu>

// 3. Verificar z-index
// DropdownMenuContent deve ter z-50 (maior que header z-40)
```

### 6. Header não fica fixo no topo

**Problema:** Header rola com a página

**Solução:**
```tsx
// Verificar classes sticky e top-0
<header className="sticky top-0 z-40">

// Se não funcionar, tentar fixed
<header className="fixed top-0 left-0 right-0 z-40">
```

### 7. Texto do usuário não carrega

**Problema:** Exibe "Carregando..." indefinidamente

**Soluções:**

```tsx
// 1. Verificar query
const { data, isLoading, error } = useQuery({
  queryKey: ["tbusuario:nome", user?.id],
  enabled: !!user?.id, // Importante!
  queryFn: async () => {
    const { data, error } = await supabase
      .from("tbusuario")
      .select("usuario,foto")
      .eq("uuid", user!.id)
      .single();
    
    if (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
    return data;
  },
});

// 2. Adicionar error handling
{error && <p>Erro ao carregar dados</p>}

// 3. Verificar se tabela existe no Supabase
// 4. Verificar RLS policies
```

### 8. Ícones não aparecem

**Problema:** Ícones Lucide não renderizam

**Solução:**
```bash
# Instalar lucide-react
npm install lucide-react

# Importar corretamente
import { User, ChevronDown } from "lucide-react";

# Verificar tamanho
<User className="h-4 w-4" />
```

### 9. Responsividade não funciona

**Problema:** Layout não se adapta em mobile

**Soluções:**

```tsx
// 1. Verificar breakpoint correto
<div className="hidden md:block">  {/* ≥768px */}

// 2. Testar em DevTools
// Chrome DevTools > Toggle device toolbar (Ctrl+Shift+M)

// 3. Verificar viewport meta tag
// index.html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

### 10. Logout não funciona

**Problema:** Botão de sair não desloga

**Solução:**
```tsx
<DropdownMenuItem
  onClick={async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }}
>
  Sair
</DropdownMenuItem>

// Verificar implementação do signOut
export function useAuth() {
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };
  
  return { user, signOut };
}
```

## ❓ Perguntas Frequentes (FAQ)

### Como alterar a cor do header?

```tsx
// Alterar fundo
<header className="bg-brand-primary text-white">

// Alterar título
<h1 className="text-white">  {/* ou text-brand-secondary */}
```

### Como adicionar logo ao invés de texto?

```tsx
<div>
  <img 
    src="/logo.png" 
    alt="APFARMA" 
    className="h-10"
  />
</div>
```

### Como fazer o header transparente?

```tsx
<header className="bg-transparent backdrop-blur-md border-b border-white/20">
```

### Como adicionar sombra ao header?

```tsx
<header className="bg-white border-b shadow-md">

// Ou customizada
<header 
  className="bg-white border-b"
  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
>
```

### Como ocultar o header em certas páginas?

```tsx
// No componente da página
export function LoginPage() {
  return (
    <div>
      {/* Não incluir AppHeader */}
      <main>...</main>
    </div>
  );
}

// Ou condicionalmente
{!isLoginPage && <AppHeader />}
```

### Como adicionar animação ao dropdown?

```tsx
// Já incluído via Radix UI e tailwindcss-animate
// Classes automáticas:
// data-[state=open]:animate-in
// data-[state=closed]:animate-out

// Customizar velocidade
<DropdownMenuContent 
  className="animate-in fade-in-0 zoom-in-95 duration-200"
>
```

### Como fazer o nome do usuário ser clicável?

```tsx
<div 
  className="text-sm text-left hidden md:block cursor-pointer hover:opacity-80"
  onClick={() => navigate('/perfil')}
>
  <p className="font-medium">{userName}</p>
  <p className="text-xs text-muted-foreground">Administrador</p>
</div>
```

### Como adicionar badge de status online?

```tsx
<div className="relative">
  <Avatar className="h-8 w-8">
    {/* ... */}
  </Avatar>
  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white" />
</div>
```

### Como internacionalizar (i18n)?

```tsx
import { useTranslation } from 'react-i18next';

export function AppHeader() {
  const { t } = useTranslation();
  
  return (
    <header>
      <h1>{t('header.title')}</h1>
      {/* ... */}
    </header>
  );
}
```

### Como testar o componente?

```tsx
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AppHeader } from './AppHeader';

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </QueryClientProvider>
);

test('renderiza o título', () => {
  render(<AppHeader />, { wrapper });
  expect(screen.getByText(/APFARMA/i)).toBeInTheDocument();
});
```

## 🔧 Otimizações de Performance

### 1. Lazy Loading de Imagens

```tsx
<AvatarImage 
  src={fotoUrl} 
  alt={userName}
  loading="lazy"
/>
```

### 2. Memoização do Componente

```tsx
import { memo } from 'react';

export const AppHeader = memo(function AppHeader() {
  // ...
});
```

### 3. Otimizar React Query

```tsx
const { data: tbusuario } = useQuery({
  queryKey: ["tbusuario:nome", user?.id],
  enabled: !!user?.id,
  staleTime: 5 * 60 * 1000, // 5 minutos
  cacheTime: 10 * 60 * 1000, // 10 minutos
  queryFn: fetchUserData,
});
```

## 📚 Recursos Adicionais

- [Documentação completa do projeto](../README.md)
- [Guia de estilo Tailwind](https://tailwindcss.com/docs)
- [Padrões de acessibilidade WCAG](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)

