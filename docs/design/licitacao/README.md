# Documentação de Design System - LicitacoesCad.tsx

## 🚀 Início Rápido

- **Novo no projeto?** Comece pelo [SUMARIO-EXECUTIVO.md](./SUMARIO-EXECUTIVO.md)
- **Procurando algo específico?** Use o [INDICE-BUSCA.md](./INDICE-BUSCA.md)
- **Precisa de código pronto?** Veja [14-referencia-rapida.md](./14-referencia-rapida.md)

## 📋 Índice

Esta documentação fornece um guia completo e detalhado sobre a implementação do componente `LicitacoesCad.tsx`, servindo como referência para criar outros CRUDs no sistema APFAR.

### Arquivos da Documentação

1. **[01-visao-geral-arquitetura.md](./01-visao-geral-arquitetura.md)**
   - Visão geral do componente
   - Estrutura e hierarquia
   - Padrões de organização
   - Dependências principais
   - Fluxo de dados
   - Padrões de estado
   - Responsividade

2. **[02-funcionalidades-detalhadas.md](./02-funcionalidades-detalhadas.md)**
   - Visualização detalhada de registros
   - Edição de registros
   - Validação de formulários
   - Integração com Supabase
   - Feedback visual ao usuário

3. **[03-soft-delete-e-crud.md](./03-soft-delete-e-crud.md)**
   - Conceito de soft delete
   - Implementação completa
   - Exclusão de registros
   - Criação de novos registros
   - Validação de dados
   - Inserção no Supabase

4. **[04-lov-pattern-e-busca.md](./04-lov-pattern-e-busca.md)**
   - Padrão LOV (List of Values)
   - Implementação de busca com debounce
   - Dialog de seleção
   - LOV com CRUD inline
   - Vantagens do padrão

5. **[05-gestao-produtos-ordenacao.md](./05-gestao-produtos-ordenacao.md)**
   - Sistema de ordenação de tabelas
   - Modal de produto com 3 abas
   - Gestão completa de produtos
   - Upload de imagens
   - Componentes reutilizáveis

6. **[06-upload-documentos-storage.md](./06-upload-documentos-storage.md)**
   - Configuração do Supabase Storage
   - Upload de arquivos
   - Visualização de documentos
   - Download e exclusão
   - Validação de tamanho

7. **[07-componentes-ui-shadcn.md](./07-componentes-ui-shadcn.md)**
   - Lista completa de componentes shadcn/ui
   - Exemplos de uso
   - Variantes e tamanhos
   - Boas práticas

8. **[08-estilizacao-tailwind.md](./08-estilizacao-tailwind.md)**
   - Padrões de estilização
   - Sistema de espaçamento
   - Grid responsivo
   - Cores e temas
   - Tipografia
   - Bordas e sombras
   - Estados interativos

9. **[09-tipos-typescript.md](./09-tipos-typescript.md)**
   - Interfaces principais
   - Tipos do Supabase
   - Tipos auxiliares
   - Validação manual
   - Type guards
   - Mapeamento de dados

10. **[10-hooks-customizados.md](./10-hooks-customizados.md)**
    - useLicitacoes
    - useProdutosLicitacao
    - Padrões de implementação
    - Métodos CRUD completos
    - Tratamento de erros

11. **[11-guia-implementacao-completo.md](./11-guia-implementacao-completo.md)**
    - Passo a passo para criar novo CRUD
    - Definir tipos TypeScript
    - Criar hook customizado
    - Criar componente de cadastro
    - Configurar rotas
    - Configurar Supabase
    - Checklist de implementação

12. **[12-exemplos-codigo-completo.md](./12-exemplos-codigo-completo.md)**
    - Componente NumberInputBR
    - Tabela ordenável reutilizável
    - Hook useDebounce
    - Utilitários de formatação
    - Componente de confirmação
    - Validação de formulários

13. **[13-padroes-avancados-boas-praticas.md](./13-padroes-avancados-boas-praticas.md)**
    - Gerenciamento de estado complexo
    - Tratamento de erros robusto
    - Performance e otimização
    - Acessibilidade (a11y)
    - Segurança
    - Testes
    - Documentação de código

14. **[14-referencia-rapida.md](./14-referencia-rapida.md)**
    - Cheat sheet completo
    - Snippets de código
    - Comandos essenciais
    - Componentes UI mais usados
    - Classes Tailwind comuns
    - Validações padrão
    - Atalhos de desenvolvimento

15. **[15-diagramas-fluxogramas.md](./15-diagramas-fluxogramas.md)**
    - Fluxo de dados principal
    - Fluxo de soft delete
    - Arquitetura de componentes
    - Fluxo de LOV
    - Ciclo de vida do componente
    - Estrutura de dados (ERD)
    - Fluxo de upload
    - Padrão de ordenação
    - Fluxo de validação
    - Hierarquia de estados

### Documentos Auxiliares

- **[SUMARIO-EXECUTIVO.md](./SUMARIO-EXECUTIVO.md)** - Visão geral completa da documentação
- **[INDICE-BUSCA.md](./INDICE-BUSCA.md)** - Índice de busca por funcionalidade, componente e padrão
- **[ESTRUTURA.md](./ESTRUTURA.md)** - Estrutura e organização da documentação
- **[CHANGELOG.md](./CHANGELOG.md)** - Histórico de versões e mudanças
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Guia para contribuir com a documentação

## 🎯 Objetivo

Esta documentação foi criada para:

1. **Padronizar** a implementação de CRUDs no sistema
2. **Documentar** padrões e boas práticas utilizadas
3. **Facilitar** a criação de novos formulários
4. **Garantir** consistência na experiência do usuário
5. **Servir** como referência técnica para a equipe

## 🚀 Como Usar Esta Documentação

### Para Criar um Novo CRUD

1. Leia o **[11-guia-implementacao-completo.md](./11-guia-implementacao-completo.md)** primeiro
2. Consulte os arquivos específicos conforme necessário
3. Siga o checklist de implementação
4. Use os exemplos de código fornecidos

### Para Entender uma Funcionalidade Específica

1. Consulte o índice acima
2. Navegue até o arquivo correspondente
3. Leia os exemplos de código comentados
4. Adapte para seu caso de uso

### Para Revisar Padrões

1. Consulte **[01-visao-geral-arquitetura.md](./01-visao-geral-arquitetura.md)** para padrões gerais
2. Consulte **[07-componentes-ui-shadcn.md](./07-componentes-ui-shadcn.md)** para componentes UI
3. Consulte **[08-estilizacao-tailwind.md](./08-estilizacao-tailwind.md)** para estilos

## 📦 Dependências Principais

```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "@supabase/supabase-js": "^2.x",
  "@radix-ui/react-*": "^1.x",
  "tailwindcss": "^3.x",
  "lucide-react": "^0.x"
}
```

## 🏗️ Estrutura de Arquivos do Projeto

```
src/
├── components/
│   ├── ui/              # Componentes shadcn/ui
│   └── ...
├── hooks/
│   ├── useLicitacoes.ts
│   ├── useProdutosLicitacao.ts
│   └── ...
├── pages/
│   ├── LicitacoesCad.tsx
│   └── ...
├── types/
│   ├── licitacao-type.ts
│   ├── produto-type.ts
│   └── ...
└── lib/
    ├── supabase.ts
    └── utils.ts
```

## 🔑 Conceitos-Chave

### Soft Delete
Registros não são fisicamente removidos, mas marcados como deletados (`deletado = 'S'`)

### LOV (List of Values)
Padrão de seleção de valores através de dialog de busca

### RPC (Remote Procedure Call)
Execução de SQL customizado através de `supabase.rpc('execute_sql_query')`

### Auditoria
Rastreamento de quem criou, alterou ou excluiu registros

### Debounce
Atraso na execução de buscas para reduzir chamadas ao servidor

## 📝 Convenções de Nomenclatura

- **Componentes**: PascalCase (ex: `LicitacoesCad`)
- **Hooks**: camelCase com prefixo `use` (ex: `useLicitacoes`)
- **Tipos**: PascalCase com sufixo (ex: `LicitacaoFormData`)
- **Funções**: camelCase (ex: `handleSave`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `MAX_FILE_SIZE`)

## 🎨 Padrões de UI/UX

- **Feedback Visual**: Toast notifications para todas as operações
- **Loading States**: Indicadores de carregamento em botões e formulários
- **Validação**: Mensagens claras e específicas
- **Confirmação**: Dialogs para ações destrutivas
- **Responsividade**: Mobile-first com breakpoints do Tailwind

## 🔒 Segurança

- **Autenticação**: Supabase Auth
- **Autorização**: Row Level Security (RLS)
- **Validação**: Client-side e server-side
- **Auditoria**: Rastreamento completo de operações

## 📚 Recursos Adicionais

- [Documentação shadcn/ui](https://ui.shadcn.com/)
- [Documentação Tailwind CSS](https://tailwindcss.com/docs)
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação React Router](https://reactrouter.com/)

## 🤝 Contribuindo

Ao adicionar novas funcionalidades ou padrões:

1. Documente no arquivo apropriado
2. Adicione exemplos de código comentados
3. Atualize este README se necessário
4. Mantenha a consistência com os padrões existentes

---

**Última atualização**: 2025-01-16
**Versão**: 1.0.0
**Autor**: Equipe APFAR

