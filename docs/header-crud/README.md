# Design System - APFAR

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Início Rápido](#início-rápido)
- [Estrutura da Documentação](#estrutura-da-documentação)
- [Componentes Documentados](#componentes-documentados)
- [Tokens de Design](#tokens-de-design)
- [Como Usar](#como-usar)
- [Arquivos Criados](#arquivos-criados)

## 🎯 Visão Geral

Este Design System documenta os padrões visuais, componentes e diretrizes de implementação do sistema APFAR (Sistema de Gestão de Licitações Públicas). 

O sistema é construído com:
- **React 18** + **TypeScript**
- **Tailwind CSS** para estilização
- **shadcn/ui** com primitivos **Radix UI**
- **Lucide React** para ícones
- **class-variance-authority** para variantes de componentes

## 🚀 Início Rápido

**Novo no Design System?** Comece aqui:

1. 📖 Leia o [Guia Rápido](./guia-rapido.md) para referências rápidas
2. 🎨 Consulte os [Tokens de Cores](./tokens/cores.md) para paleta de cores
3. 🔘 Veja o [Sistema de Botões](./componentes/botoes.md) para componentes interativos
4. 💻 Use o [Exemplo de Código](./exemplos/header-crud-exemplo.tsx) como template
5. ✅ Siga as [Boas Práticas](./componentes/boas-praticas.md) para código consistente

## 📁 Estrutura da Documentação

```
docs/design-system/
├── README.md                          # Este arquivo
├── componentes/
│   ├── header-crud.md                 # Cabeçalho de formulários CRUD
│   ├── botoes.md                      # Sistema de botões
│   └── tipografia.md                  # Sistema tipográfico
├── tokens/
│   ├── cores.md                       # Paleta de cores e tokens
│   ├── espacamento.md                 # Sistema de espaçamento
│   └── tipografia.md                  # Escalas tipográficas
└── exemplos/
    └── header-crud-exemplo.tsx        # Exemplo de implementação
```

## 🧩 Componentes Documentados

### 1. Header CRUD
Cabeçalho padrão para formulários de cadastro/edição com:
- Título dinâmico
- Subtítulo descritivo
- Botões de ação (Voltar, Excluir, Salvar)

**Documentação:** [componentes/header-crud.md](./componentes/header-crud.md)

### 2. Sistema de Botões
Variantes de botões baseadas em shadcn/ui:
- **Default**: Ação primária padrão
- **Outline**: Ações secundárias
- **Destructive**: Ações destrutivas (excluir, remover)
- **Ghost**: Ações terciárias
- **Link**: Links estilizados como botões

**Documentação:** [componentes/botoes.md](./componentes/botoes.md)

## 🎨 Tokens de Design

### Cores Principais

| Token | Valor | Uso |
|-------|-------|-----|
| `brand-primary` | `#242f65` | Cor primária da marca |
| `brand-secondary` | `#62a183` | Cor secundária |
| `brand-tertiary` | `#ee8b60` | Cor terciária |
| `destructive` | `hsl(0 84.2% 60.2%)` | Ações destrutivas |

**Documentação completa:** [tokens/cores.md](./tokens/cores.md)

### Espaçamento

O sistema utiliza a escala padrão do Tailwind CSS:
- **gap-2**: 0.5rem (8px)
- **px-4**: 1rem (16px)
- **py-2**: 0.5rem (8px)

**Documentação completa:** [tokens/espacamento.md](./tokens/espacamento.md)

## 🚀 Como Usar

### Instalação de Dependências

```bash
npm install @radix-ui/react-slot class-variance-authority lucide-react
```

### Importação de Componentes

```tsx
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Trash } from "lucide-react"
```

### Exemplo Básico

```tsx
<Button variant="outline" onClick={handleBack}>
  <ArrowLeft className="mr-2 h-4 w-4" />
  Voltar
</Button>
```

## 📚 Referências

- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [Class Variance Authority](https://cva.style/)

## 📝 Contribuindo

Ao adicionar novos componentes ou padrões:
1. Documente a anatomia do componente
2. Liste todas as variantes disponíveis
3. Forneça exemplos de código
4. Inclua considerações de acessibilidade
5. Atualize este README

## 📁 Arquivos Criados

Esta documentação inclui os seguintes arquivos:

### 📄 Documentação Principal
- **README.md** - Este arquivo (visão geral e índice)
- **guia-rapido.md** - Referência rápida com exemplos práticos

### 🧩 Componentes
- **componentes/header-crud.md** - Documentação completa do Header CRUD
- **componentes/botoes.md** - Sistema de botões e variantes
- **componentes/tipografia.md** - Tipografia nos componentes
- **componentes/boas-praticas.md** - Diretrizes e boas práticas

### 🎨 Tokens de Design
- **tokens/cores.md** - Paleta de cores e tokens semânticos
- **tokens/espacamento.md** - Sistema de espaçamento e layout
- **tokens/tipografia.md** - Escalas tipográficas e hierarquia

### 💻 Exemplos de Código
- **exemplos/header-crud-exemplo.tsx** - Implementação completa do Header CRUD

### 📊 Estrutura de Arquivos

```
docs/design-system/
├── README.md                          # Visão geral (você está aqui)
├── guia-rapido.md                     # Referência rápida
├── componentes/
│   ├── header-crud.md                 # Header CRUD completo
│   ├── botoes.md                      # Sistema de botões
│   ├── tipografia.md                  # Tipografia em componentes
│   └── boas-praticas.md               # Diretrizes de uso
├── tokens/
│   ├── cores.md                       # Paleta de cores
│   ├── espacamento.md                 # Sistema de espaçamento
│   └── tipografia.md                  # Escalas tipográficas
└── exemplos/
    └── header-crud-exemplo.tsx        # Código de exemplo
```

---

**Versão:** 1.0.0
**Última atualização:** 2025-01-16
**Mantido por:** Equipe APFAR

