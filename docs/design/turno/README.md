# Documentação Técnica - Página de Turnos (SysOEE)

## 📋 Índice

Esta documentação serve como **guia de referência e padrão** para implementação de novas páginas no sistema SysOEE, garantindo consistência de código, UI/UX e arquitetura.

### Documentos Disponíveis

1. **[Arquitetura e Componentes](./01-arquitetura-componentes.md)**
   - Hierarquia de componentes React
   - Estrutura de layout (containers, cards, grids)
   - Padrão de organização de código
   - Diagrama de componentes

2. **[Gerenciamento de Estado](./02-gerenciamento-estado.md)**
   - React Query (@tanstack/react-query)
   - Configuração de cache (staleTime, gcTime)
   - Estados locais (useState)
   - Sincronização com URL (useSearchParams)
   - Persistência em localStorage

3. **[Funcionalidades](./03-funcionalidades.md)**
   - Sistema de paginação avançada
   - Busca em tempo real
   - Sistema de filtros com modal
   - CRUD completo (Create, Read, Update, Delete)
   - Loading states e overlays
   - Tratamento de erros

4. **[Padrões de UI/UX](./04-padroes-ui-ux.md)**
   - Componentes Shadcn/UI utilizados
   - Esquema de cores do projeto
   - Responsividade (breakpoints)
   - Ícones Lucide React
   - Estados visuais (hover, active, disabled, loading)

5. **[Integração com Backend](./05-integracao-backend.md)**
   - Hook customizado `useTurnos`
   - Estrutura de dados (tipos TypeScript)
   - Tratamento de respostas e erros
   - Mapeamento de dados (DB ↔ UI)

6. **[Boas Práticas](./06-boas-praticas.md)**
   - Acessibilidade (ARIA labels, navegação por teclado)
   - Performance (memoização, lazy loading)
   - Código limpo e manutenível
   - Comentários em português
   - Tratamento de erros

7. **[Checklist de Implementação](./07-checklist-implementacao.md)**
   - Checklist completo para novas páginas
   - Dependências necessárias
   - Troubleshooting de problemas comuns
   - Exemplos de código

---

## 🎯 Visão Geral

A página **Turnos** (`src/pages/Turnos.tsx`) é uma implementação completa e moderna de uma página de listagem com CRUD, servindo como **referência padrão** para todas as páginas de gerenciamento do sistema SysOEE.

### Características Principais

- ✅ **React Query** para gerenciamento de estado assíncrono
- ✅ **Paginação avançada** com navegação por números de página
- ✅ **Busca em tempo real** sem debounce manual (React Query cuida disso)
- ✅ **Sistema de filtros** com modal dedicado
- ✅ **CRUD completo** (Create, Read, Update, Delete)
- ✅ **Sincronização com URL** para compartilhamento de estado
- ✅ **Persistência em localStorage** para preferências do usuário
- ✅ **Loading states** e overlays visuais
- ✅ **Tratamento de erros** robusto
- ✅ **Responsividade** completa (mobile, tablet, desktop)
- ✅ **Acessibilidade** (ARIA labels, navegação por teclado)

### Arquivo de Referência Original

Esta implementação foi baseada no arquivo `Licitacoes.tsx` do projeto APFAR, adaptando os padrões para o contexto de Turnos do SysOEE.

---

## 📊 Estatísticas do Código

| Métrica | Valor |
|---------|-------|
| **Total de Linhas** | 659 |
| **Componentes Shadcn/UI** | 12 |
| **Hooks Utilizados** | 8 |
| **Estados Gerenciados** | 10 |
| **Handlers de Eventos** | 9 |
| **Ícones Lucide** | 11 |

---

## 🚀 Início Rápido

Para implementar uma nova página seguindo este padrão:

1. Leia a **[Arquitetura e Componentes](./01-arquitetura-componentes.md)** para entender a estrutura
2. Configure o **[Gerenciamento de Estado](./02-gerenciamento-estado.md)** com React Query
3. Implemente as **[Funcionalidades](./03-funcionalidades.md)** necessárias
4. Aplique os **[Padrões de UI/UX](./04-padroes-ui-ux.md)** do projeto
5. Integre com o **[Backend](./05-integracao-backend.md)** usando hooks customizados
6. Siga as **[Boas Práticas](./06-boas-praticas.md)** de código e acessibilidade
7. Use o **[Checklist](./07-checklist-implementacao.md)** para validar a implementação

---

## 📦 Dependências Principais

```json
{
  "@tanstack/react-query": "^5.56.2",
  "react": "^18.3.1",
  "react-router-dom": "^6.26.2",
  "lucide-react": "^0.462.0",
  "@radix-ui/react-*": "várias versões",
  "tailwindcss": "^3.4.11"
}
```

---

## 🎨 Paleta de Cores do Projeto

| Cor | Hex | Uso |
|-----|-----|-----|
| **Primária** | `#242f65` | Botões, links, destaques |
| **Primária Hover** | `#1a2148` | Estado hover de elementos primários |
| **Texto Principal** | `#1f2937` | Títulos e textos principais |
| **Texto Secundário** | `#6b7280` | Textos auxiliares e labels |
| **Sucesso** | `#10b981` | Meta OEE ≥ 90% |
| **Info** | `#3b82f6` | Meta OEE ≥ 85% |
| **Aviso** | `#f59e0b` | Meta OEE ≥ 80% |
| **Erro** | `#ef4444` | Meta OEE < 80%, erros |

---

## 📞 Suporte

Para dúvidas ou sugestões sobre esta documentação, entre em contato com a equipe de desenvolvimento do SysOEE.

---

**Última atualização:** 2025-11-23  
**Versão:** 1.0.0  
**Autor:** Equipe SysOEE

