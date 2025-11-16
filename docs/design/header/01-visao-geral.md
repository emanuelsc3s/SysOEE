# Visão Geral - AppHeader

## 📐 Estrutura do Componente

O `AppHeader` é o componente de cabeçalho principal da aplicação APFARMA, posicionado no topo de todas as páginas autenticadas.

### Hierarquia de Elementos

```
<header> (Container principal)
├── <div> (Seção esquerda - Título)
│   └── <h1> (Título da aplicação)
└── <div> (Seção direita - Menu do usuário)
    └── <DropdownMenu>
        ├── <DropdownMenuTrigger>
        │   └── <Button variant="ghost">
        │       ├── <div> (Container do avatar e info)
        │       │   ├── <Avatar>
        │       │   │   ├── <AvatarImage> (opcional)
        │       │   │   └── <AvatarFallback>
        │       │   │       └── <User icon>
        │       │   └── <div> (Info do usuário - oculto em mobile)
        │       │       ├── <p> (Nome do usuário)
        │       │       └── <p> (Cargo/função)
        │       └── <ChevronDown icon>
        └── <DropdownMenuContent>
            ├── <DropdownMenuLabel>
            ├── <DropdownMenuSeparator>
            ├── <DropdownMenuItem> (Perfil)
            ├── <DropdownMenuSeparator>
            └── <DropdownMenuItem> (Sair)
```

## 🎯 Funcionalidades Principais

### 1. Identificação da Aplicação
- Exibe o título "APFARMA - Plataforma Integrada de Gestão"
- Utiliza a cor primária da marca (`brand-primary`)
- Sempre visível em todas as telas

### 2. Perfil do Usuário
- **Avatar**: Exibe foto do usuário ou ícone de fallback
- **Nome**: Carregado dinamicamente do banco de dados (tabela `tbusuario`)
- **Cargo**: Exibe "Administrador" (pode ser dinâmico)
- **Responsivo**: Oculta informações textuais em telas pequenas (< 768px)

### 3. Menu Dropdown
- Acesso ao perfil do usuário
- Opção de logout
- Alinhado à direita
- Animações suaves de abertura/fechamento

## 📏 Dimensões e Layout

### Container Principal (Header)
- **Altura fixa**: `h-16` (64px)
- **Largura**: 100% da viewport
- **Padding horizontal**: `px-6` (24px)
- **Posicionamento**: `sticky top-0` (fixo no topo ao rolar)
- **Z-index**: `z-40` (sobrepõe conteúdo, mas abaixo de modais)

### Avatar
- **Tamanho**: `h-8 w-8` (32px × 32px)
- **Formato**: Circular (`rounded-full`)
- **Fallback**: Ícone de usuário centralizado

### Espaçamento
- **Gap entre elementos**: `gap-4` (16px) na seção direita
- **Gap interno do botão**: `gap-2` (8px) entre avatar e texto

## 🎨 Aparência Visual

### Cores
- **Background**: Branco (`bg-white`)
- **Borda inferior**: Cinza claro (`border-b`)
- **Título**: Azul primário da marca (`text-brand-primary` - #242f65)
- **Avatar fallback**: Fundo azul primário com ícone branco
- **Texto secundário**: Cinza médio (`text-muted-foreground`)

### Tipografia
- **Título**: `text-xl font-semibold` (20px, peso 600)
- **Nome do usuário**: `text-sm font-medium` (14px, peso 500)
- **Cargo**: `text-xs` (12px)

## 📱 Comportamento Responsivo

### Desktop (≥ 768px)
- Exibe avatar + nome + cargo + ícone dropdown
- Layout completo com todas as informações

### Mobile (< 768px)
- Exibe apenas avatar + ícone dropdown
- Informações textuais ocultas (`hidden md:block`)
- Mantém funcionalidade completa do menu

## 🔄 Estados do Componente

### Loading
- Exibe "Carregando..." enquanto busca dados do usuário
- Mantém estrutura visual consistente

### Autenticado
- Exibe nome real do usuário
- Avatar com foto (se disponível) ou fallback
- Menu dropdown funcional

### Dropdown Aberto/Fechado
- **Fechado**: `data-state="closed"`, `aria-expanded="false"`
- **Aberto**: `data-state="open"`, `aria-expanded="true"`
- Animações controladas por Radix UI

## 🔗 Integração com Sistema

### Autenticação (Supabase)
- Hook `useAuth()` fornece dados do usuário
- Função `signOut()` para logout

### Dados do Usuário
- Query React Query busca dados da tabela `tbusuario`
- Fallback para metadados do Supabase Auth
- Cache automático de dados

### Navegação
- React Router para navegação entre páginas
- Redirecionamento após logout

## 📂 Arquivos de Origem

- **Componente principal**: `/src/components/layout/AppHeader.tsx`
- **Button**: `/src/components/ui/button.tsx`
- **Avatar**: `/src/components/ui/avatar.tsx`
- **DropdownMenu**: `/src/components/ui/dropdown-menu.tsx`
- **Configuração Tailwind**: `/tailwind.config.ts`
- **Estilos globais**: `/src/index.css`

