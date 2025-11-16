# Diagramas e Referências Técnicas

## 📊 Diagrama de Estrutura Visual

```
┌─────────────────────────────────────────────────────────────────────┐
│ Header (h-16 = 64px, sticky top-0, z-40)                           │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │                                                                 │ │
│ │  ┌──────────────────────────────┐    ┌──────────────────────┐  │ │
│ │  │ APFARMA - Plataforma...      │    │ [Avatar] Nome ▼     │  │ │
│ │  │ (text-xl, brand-primary)     │    │ (Button ghost)       │  │ │
│ │  └──────────────────────────────┘    └──────────────────────┘  │ │
│ │                                                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼ (ao clicar)
                                    ┌──────────────────┐
                                    │ Minha Conta      │
                                    ├──────────────────┤
                                    │ 👤 Perfil        │
                                    ├──────────────────┤
                                    │ Sair             │
                                    └──────────────────┘
                                    (DropdownMenuContent)
```

## 🎨 Diagrama de Cores

```
┌─────────────────────────────────────────────────────────────┐
│ Paleta de Cores do AppHeader                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ■ #242f65  brand-primary      (Título, Avatar fallback)    │
│ ■ #ffffff  white              (Fundo do header)             │
│ ■ #e5e7eb  border             (Borda inferior)              │
│ ■ #6b7280  muted-foreground   (Texto "Administrador")       │
│ ■ #f3f4f6  accent             (Hover do botão)              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📐 Diagrama de Espaçamento

```
Header (px-6 = 24px padding horizontal)
│
├─ Seção Esquerda
│  └─ Título (sem padding adicional)
│
└─ Seção Direita (gap-4 = 16px)
   └─ Button (gap-2 = 8px interno)
      ├─ Avatar (h-8 w-8 = 32px)
      ├─ [gap-2]
      ├─ Texto (hidden md:block)
      ├─ [gap-2]
      └─ ChevronDown (h-4 w-4 = 16px)

Dimensões:
┌────────────────────────────────────────┐
│ 24px │ Conteúdo │ 16px │ User │ 24px  │
└────────────────────────────────────────┘
       ↑                    ↑
    px-6                  gap-4
```

## 🔄 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                     AppHeader Component                      │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   useAuth    │   │  useQuery    │   │ useNavigate  │
│   Hook       │   │  (tbusuario) │   │   Hook       │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Supabase     │   │ Supabase     │   │ React Router │
│ Auth         │   │ Database     │   │              │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        └───────────────────┴───────────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ UI Rendering │
                    └──────────────┘
```

## 🏗️ Hierarquia de Componentes

```
AppHeader
├── header (elemento HTML)
│   ├── div (seção esquerda)
│   │   └── h1 (título)
│   │
│   └── div (seção direita)
│       └── DropdownMenu (Radix UI)
│           ├── DropdownMenuTrigger
│           │   └── Button (shadcn/ui)
│           │       ├── div (container)
│           │       │   ├── Avatar (shadcn/ui)
│           │       │   │   ├── AvatarImage (opcional)
│           │       │   │   └── AvatarFallback
│           │       │   │       └── User (Lucide icon)
│           │       │   │
│           │       │   └── div (info usuário)
│           │       │       ├── p (nome)
│           │       │       └── p (cargo)
│           │       │
│           │       └── ChevronDown (Lucide icon)
│           │
│           └── DropdownMenuContent
│               ├── DropdownMenuLabel
│               ├── DropdownMenuSeparator
│               ├── DropdownMenuItem (Perfil)
│               ├── DropdownMenuSeparator
│               └── DropdownMenuItem (Sair)
```

## 📦 Dependências e Versões

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-slot": "^1.0.2",
    "@supabase/supabase-js": "^2.38.0",
    "@tanstack/react-query": "^5.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.263.0",
    "react-router-dom": "^6.16.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "^5.2.2"
  }
}
```

## 🎯 Mapeamento de Classes CSS

### Classes do Header

| Classe | Propriedade CSS | Valor |
|--------|----------------|-------|
| `bg-white` | background-color | #ffffff |
| `border-b` | border-bottom-width | 1px |
| `h-16` | height | 4rem (64px) |
| `flex` | display | flex |
| `items-center` | align-items | center |
| `justify-between` | justify-content | space-between |
| `px-6` | padding-left, padding-right | 1.5rem (24px) |
| `sticky` | position | sticky |
| `top-0` | top | 0 |
| `z-40` | z-index | 40 |

### Classes do Título

| Classe | Propriedade CSS | Valor |
|--------|----------------|-------|
| `text-xl` | font-size | 1.25rem (20px) |
| `font-semibold` | font-weight | 600 |
| `text-brand-primary` | color | #242f65 |

### Classes do Avatar

| Classe | Propriedade CSS | Valor |
|--------|----------------|-------|
| `h-8` | height | 2rem (32px) |
| `w-8` | width | 2rem (32px) |
| `rounded-full` | border-radius | 9999px |
| `bg-brand-primary` | background-color | #242f65 |
| `text-white` | color | #ffffff |

## 🔍 Atributos ARIA Completos

```html
<!-- Botão do dropdown -->
<button
  type="button"
  id="radix-:rf:"
  aria-haspopup="menu"
  aria-expanded="false"
  data-state="closed"
  class="..."
>

<!-- Menu dropdown -->
<div
  role="menu"
  aria-labelledby="radix-:rf:"
  data-state="open"
  class="..."
>

<!-- Item do menu -->
<div
  role="menuitem"
  tabindex="-1"
  data-orientation="vertical"
  class="..."
>
```

## 📱 Breakpoints e Media Queries

```css
/* Mobile First */
/* Base: < 640px */
.hidden { display: none; }

/* Small: ≥ 640px */
@media (min-width: 640px) {
  .sm\:block { display: block; }
}

/* Medium: ≥ 768px */
@media (min-width: 768px) {
  .md\:block { display: block; }
}

/* Large: ≥ 1024px */
@media (min-width: 1024px) {
  .lg\:block { display: block; }
}

/* Extra Large: ≥ 1280px */
@media (min-width: 1280px) {
  .xl\:block { display: block; }
}

/* 2X Large: ≥ 1400px */
@media (min-width: 1400px) {
  .\32xl\:block { display: block; }
}
```

## 🔗 Links de Referência

### Documentação Oficial

- **shadcn/ui**: https://ui.shadcn.com/
- **Radix UI**: https://www.radix-ui.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **Lucide Icons**: https://lucide.dev/
- **React Query**: https://tanstack.com/query/latest
- **Supabase**: https://supabase.com/docs
- **React Router**: https://reactrouter.com/

### Componentes Específicos

- **Button**: https://ui.shadcn.com/docs/components/button
- **Avatar**: https://ui.shadcn.com/docs/components/avatar
- **Dropdown Menu**: https://ui.shadcn.com/docs/components/dropdown-menu
- **Radix Avatar**: https://www.radix-ui.com/primitives/docs/components/avatar
- **Radix Dropdown**: https://www.radix-ui.com/primitives/docs/components/dropdown-menu

### Ferramentas

- **Tailwind Play**: https://play.tailwindcss.com/
- **CVA**: https://cva.style/docs
- **clsx**: https://github.com/lukeed/clsx
- **tailwind-merge**: https://github.com/dcastil/tailwind-merge

