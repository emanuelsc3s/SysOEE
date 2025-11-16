# Página de Consulta de Linhas de Produção

## Visão Geral

Página de listagem e consulta de linhas de produção do sistema OEE SicFar. Implementada seguindo rigorosamente o design system documentado em `docs/design/consultas-design-system.md`.

## Características

### Design System
- **Paleta de cores**: Primária `#242f65`, hover `#1a2148`
- **Tipografia**: Hierarquia definida (H1: 2xl bold, H2: lg semibold, texto: sm)
- **Layout**: Container responsivo com padding adaptativo
- **Componentes**: Shadcn/UI (Button, Input, Badge, Dialog, Select)
- **Estados**: Loading overlay, erro, vazio, dados

### Funcionalidades

#### 1. Listagem de Linhas
- Exibe todas as linhas de produção cadastradas
- Colunas: ID, Nome, Departamento, Tipo, Status
- Paginação com opções de 25, 50, 100, 200 itens por página
- Preferência de paginação salva em localStorage

#### 2. Busca
- Input de busca em tempo real
- Busca por nome da linha
- Ícone de lupa à esquerda do input
- Resetar para página 1 ao buscar

#### 3. Filtros
- Dialog modal para filtros avançados
- Filtro por status (Todos/Apenas Ativos)
- Filtro por tipo (Envase, Embalagem, Inspeção)
- Contador de filtros aplicados no botão
- Botões "Limpar Filtros" e "Aplicar Filtros"

#### 4. Ações por Linha
- **Visualizar** (ícone Eye): Ver detalhes da linha
- **Editar** (ícone Pencil): Editar linha
- **Excluir** (ícone Trash): Excluir linha (com confirmação)

#### 5. Estados de Interface
- **Loading inicial**: Spinner centralizado
- **Loading overlay**: Backdrop blur durante refetch
- **Erro**: Mensagem com botão "Tentar novamente"
- **Vazio**: Mensagem contextual (com/sem filtros)

### Integração com Supabase

#### Tabela: `tblinhaproducao`
```sql
Campos principais:
- linhaproducao_id (PK)
- linhaproducao (nome)
- departamento_id (FK)
- ativo ('Sim'/'Não')
- tipo (enum)
- created_at, updated_at, deleted_at (auditoria)
```

#### Join com Departamento (Opcional)
A query faz **LEFT JOIN** com `tbdepartamento` para exibir o nome do departamento.
Como a relação `departamento_id` é **opcional**, linhas sem departamento também são exibidas:
```typescript
.select(`
  *,
  tbdepartamento!left (
    departamento
  )
`)
```
**Nota**: Linhas sem departamento exibirão "N/A" na coluna Departamento.

#### Filtros Aplicados
- Apenas registros não deletados (`deleted_at IS NULL`)
- Filtro de status ativo/inativo
- Filtro por tipo de linha
- Busca por nome (ILIKE)
- Ordenação alfabética por nome

### React Query

#### Query Key
```typescript
['linhas-producao', currentPage, itemsPerPage, searchTerm, appliedFilters]
```

#### Configuração
- **staleTime**: 5 minutos
- **gcTime**: 10 minutos
- **Refetch**: Manual via botão "Atualizar"

### Navegação

#### Rota
- **Path**: `/equipamentos`
- **Componente**: `LinhaProducaoConsulta`
- **Acesso**: Card "Equipamentos" na Home (ícone Wrench)

#### Botão Voltar
- Ícone `ArrowLeft` no canto superior esquerdo
- Navega de volta para Home (`/`)

## Arquivos Relacionados

### Componentes
- `src/pages/LinhaProducaoConsulta.tsx` - Página principal
- `src/components/ui/badge.tsx` - Badge com variantes success/info
- `src/components/ui/button.tsx` - Botões
- `src/components/ui/input.tsx` - Input de busca
- `src/components/ui/dialog.tsx` - Dialog de filtros
- `src/components/ui/select.tsx` - Seletores

### Tipos
- `src/types/linhaproducao.ts` - Interfaces TypeScript

### API
- `src/services/api/linhaproducao.api.ts` - Funções de integração com Supabase

### Configuração
- `src/lib/queryClient.ts` - Configuração React Query
- `src/App.tsx` - Roteamento

## Responsividade

### Mobile (< 640px)
- Grid de 1 coluna
- Padding reduzido (px-4)
- Busca e filtros empilhados

### Tablet (640px - 1024px)
- Padding intermediário (sm:px-6)
- Busca e filtros em linha

### Desktop (> 1024px)
- Padding completo (lg:px-8)
- Layout otimizado para telas grandes

## Próximos Passos

### Funcionalidades Pendentes
- [ ] Implementar visualização de detalhes da linha
- [ ] Implementar edição de linha
- [ ] Implementar exclusão (soft delete)
- [ ] Adicionar filtro por departamento
- [ ] Adicionar ordenação por colunas
- [ ] Exportar dados (CSV/Excel)

### Melhorias Futuras
- [ ] Skeleton loading em vez de spinner
- [ ] Virtualização para listas grandes
- [ ] Busca avançada com múltiplos campos
- [ ] Histórico de alterações (auditoria)

