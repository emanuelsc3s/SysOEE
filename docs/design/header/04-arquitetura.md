# Arquitetura e Padrões

## 🏗️ Padrões de Arquitetura

### 1. Composição de Componentes

O AppHeader segue o padrão de **composição** ao invés de configuração:

```tsx
// ❌ Evitado: Configuração via props
<Header 
  title="APFARMA"
  showAvatar={true}
  showUserInfo={true}
  menuItems={[...]}
/>

// ✅ Utilizado: Composição de componentes
<header>
  <div>
    <h1>APFARMA - Plataforma Integrada de Gestão</h1>
  </div>
  <div>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Avatar>...</Avatar>
          <div>...</div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>...</DropdownMenuContent>
    </DropdownMenu>
  </div>
</header>
```

**Vantagens:**
- Maior flexibilidade
- Código mais legível
- Fácil customização
- Melhor tree-shaking

### 2. Padrão Container/Presentational

```tsx
// Container: Lógica e estado
export function AppHeader() {
  const { user, signOut } = useAuth();
  const { data: tbusuario, isLoading } = useQuery({...});
  
  const userName = tbusuario?.usuario || user?.email || "Usuário";
  const fotoUrl = tbusuario?.foto ?? "";
  
  // Renderiza componente presentational
  return <HeaderView {...props} />;
}
```

**Separação de responsabilidades:**
- **Lógica**: Autenticação, queries, navegação
- **Apresentação**: JSX, estilos, layout

### 3. Hooks Customizados

```tsx
// Hook de autenticação
const { user, signOut } = useAuth();

// Hook de dados do usuário
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
    return data;
  },
});
```

**Benefícios:**
- Reutilização de lógica
- Testabilidade
- Separação de concerns

## ♿ Acessibilidade (A11y)

### ARIA Attributes

#### Dropdown Menu

```html
<!-- Trigger -->
<button 
  type="button"
  id="radix-:rf:"
  aria-haspopup="menu"
  aria-expanded="false"
  data-state="closed"
>
```

**Atributos:**
- `aria-haspopup="menu"`: Indica que abre um menu
- `aria-expanded="false/true"`: Estado do menu (fechado/aberto)
- `data-state="closed/open"`: Estado visual para CSS

#### Avatar

```tsx
<AvatarImage 
  src={fotoUrl} 
  alt={userName || 'Foto do usuário'} 
/>
```

**Atributos:**
- `alt`: Texto alternativo descritivo

### Navegação por Teclado

#### Suporte Nativo (Radix UI)

| Tecla | Ação |
|-------|------|
| `Space` / `Enter` | Abre/fecha dropdown |
| `↓` / `↑` | Navega entre itens do menu |
| `Esc` | Fecha o menu |
| `Tab` | Move foco para próximo elemento |
| `Shift + Tab` | Move foco para elemento anterior |

#### Focus Visible

```css
focus-visible:outline-none 
focus-visible:ring-2 
focus-visible:ring-ring 
focus-visible:ring-offset-2
```

**Comportamento:**
- Anel de foco visível apenas com teclado
- Não aparece ao clicar com mouse
- Cor: Azul primário (`--ring`)

### Semântica HTML

```html
<header>  <!-- Landmark semântico -->
  <h1>    <!-- Hierarquia de headings -->
  <button type="button">  <!-- Tipo explícito -->
  <img alt="...">  <!-- Texto alternativo -->
</header>
```

## 🎯 Posicionamento e Z-Index

### Sistema de Camadas

```
z-50  → Dropdown menu content (mais alto)
z-40  → Header sticky (meio)
z-0   → Conteúdo da página (base)
```

### Sticky Positioning

```tsx
<header className="sticky top-0 z-40">
```

**Comportamento:**
- Posição normal até rolar a página
- Fixa no topo (`top-0`) ao rolar
- Sobrepõe conteúdo (`z-40`)
- Não sobrepõe modais/dropdowns (`z-50`)

### Dropdown Portal

```tsx
<DropdownMenuPrimitive.Portal>
  <DropdownMenuPrimitive.Content>
    {/* Renderizado fora da hierarquia DOM */}
  </DropdownMenuPrimitive.Content>
</DropdownMenuPrimitive.Portal>
```

**Vantagens:**
- Evita problemas de overflow
- Z-index independente
- Posicionamento absoluto correto

## 🔄 Gerenciamento de Estado

### Estado Local (Radix UI)

```tsx
<DropdownMenu>
  {/* Estado interno gerenciado pelo Radix */}
  {/* - Aberto/fechado */}
  {/* - Item focado */}
  {/* - Posicionamento */}
</DropdownMenu>
```

### Estado do Servidor (React Query)

```tsx
const { data: tbusuario, isLoading } = useQuery({
  queryKey: ["tbusuario:nome", user?.id],
  enabled: !!user?.id,
  queryFn: fetchUserData,
});
```

**Características:**
- Cache automático
- Refetch em background
- Loading states
- Error handling

### Estado de Autenticação (Context)

```tsx
const { user, signOut } = useAuth();
```

**Provedor:**
```tsx
<AuthProvider>
  <App />
</AuthProvider>
```

## 🎨 Padrões de Estilização

### Utility-First (Tailwind CSS)

```tsx
<header className="bg-white border-b h-16 flex items-center justify-between px-6 sticky top-0 z-40">
```

**Vantagens:**
- Estilos colocalizados
- Sem CSS global
- Purge automático
- Consistência via design tokens

### Class Variance Authority (CVA)

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center...", // Base
  {
    variants: {
      variant: { ghost: "hover:bg-accent..." },
      size: { default: "h-10 px-4 py-2" }
    }
  }
);
```

**Benefícios:**
- Variantes tipadas
- Composição de classes
- IntelliSense no editor

### Merge de Classes (cn utility)

```typescript
import { cn } from "@/lib/utils";

<Button className={cn(
  buttonVariants({ variant, size }),
  className  // Props customizadas
)} />
```

**Função `cn`:**
```typescript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## 🔐 Segurança

### Proteção de Rotas

```tsx
// Layout protegido
<ProtectedRoute>
  <AppLayout>
    <AppHeader />
    {/* Conteúdo */}
  </AppLayout>
</ProtectedRoute>
```

### Sanitização de Dados

```tsx
// Nome do usuário com fallbacks seguros
const userName =
  tbusuario?.usuario?.trim() ||
  user?.user_metadata?.name ||
  user?.email ||
  "Usuário";
```

### Logout Seguro

```tsx
<DropdownMenuItem
  onClick={async () => {
    await signOut();  // Limpa sessão
    navigate('/login');  // Redireciona
  }}
>
  Sair
</DropdownMenuItem>
```

## 📱 Responsividade

### Mobile-First Approach

```tsx
// Base: Mobile
<div className="text-sm text-left hidden md:block">
  {/* Oculto em mobile */}
</div>

// Desktop: md breakpoint (≥768px)
// Elemento torna-se visível
```

### Breakpoints Estratégicos

```
< 768px  → Avatar + ícone apenas
≥ 768px  → Avatar + nome + cargo + ícone
```

**Decisão de design:**
- Prioriza espaço em telas pequenas
- Mantém funcionalidade completa
- Informações essenciais sempre visíveis

