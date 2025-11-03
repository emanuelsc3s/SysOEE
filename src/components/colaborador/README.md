# Módulo de Perfil de Colaborador

Este módulo implementa a página de perfil do colaborador com visualização de treinamentos de POs (Procedimentos Operacionais).

## 📁 Estrutura de Arquivos

```
src/
├── components/colaborador/
│   ├── PerfilColaboradorHeader.tsx      # Cabeçalho com dados do colaborador
│   ├── ContadoresKPI.tsx                # Badges com contadores de treinamentos
│   ├── FiltrosTreinamentos.tsx          # Busca e ordenação
│   ├── ItemTreinamento.tsx              # Card/linha de treinamento (responsivo)
│   ├── ColaboradorPerfilSkeleton.tsx    # Loading skeleton
│   └── README.md                        # Esta documentação
├── pages/
│   └── ColaboradorPerfil.tsx            # Página principal
├── hooks/
│   ├── useDebounce.ts                   # Hook de debounce para busca
│   ├── useQueryParams.ts                # Sincronização com URL
│   └── useLocalStoragePreferences.ts    # Persistência de preferências
├── services/api/
│   └── colaborador.api.ts               # API mock de colaboradores
└── types/
    └── colaborador.ts                   # Tipos e interfaces
```

## 🎯 Funcionalidades Implementadas

### ✅ Perfil do Colaborador
- Avatar com iniciais ou foto
- Nome, matrícula, cargo, setor
- Email e data de admissão (quando disponíveis)
- Layout responsivo (mobile-first)

### ✅ Contadores KPI
- Total de POs atribuídos
- POs Concluídos (verde)
- POs Pendentes (laranja)
- POs Vencidos (vermelho)

### ✅ Filtros e Busca
- **Abas de Status**: Todos, Pendentes, Vencidos, Concluídos
- **Busca com Debounce**: Busca por código ou título do PO (300ms)
- **Ordenação**:
  - Proximidade de Vencimento (padrão)
  - Título (A–Z)
  - Mais Recentes Concluídos

### ✅ Lista de Treinamentos
- **Mobile**: Cards verticais com informações colapsáveis
- **Desktop**: Tabela com todas as informações visíveis
- **Informações exibidas**:
  - Código e título do PO
  - Versão do documento
  - Status (badge colorido)
  - Data de conclusão
  - Dias restantes/vencidos
  - Carga horária
  - Ações: Ver detalhes do PO, Ver certificado

### ✅ Sincronização com URL
- Query parameters: `?status=Pendente&q=termo&sort=titulo`
- Deep-linking: URL reconstrói estado exato da UI
- Navegação com histórico do navegador

### ✅ Persistência de Preferências
- **localStorage**: `colaborador.treinamentos.prefs.v1`
- **Dados salvos**:
  - Última aba/status selecionado
  - Último critério de ordenação
  - Último termo de busca
- **Botão "Limpar Preferências"**: Reseta para padrões

### ✅ Estados de UI
- **Loading**: Skeleton animado
- **Erro**: Mensagem com botão "Tentar Novamente"
- **Empty State**: Mensagem quando não há treinamentos
- **Sem Resultados**: Mensagem quando busca não retorna resultados

## 🚀 Como Usar

### Acessar Perfil de um Colaborador

```
http://localhost:8081/colaborador/000648
```

Substitua `000648` pela matrícula do colaborador desejado.

### Colaboradores Mock Disponíveis

- **000648**: João Silva Santos (SPEP) - 10 treinamentos
- **000649**: Maria Oliveira Costa (SPPV) - 2 treinamentos
- **000650**: Carlos Eduardo Pereira (Líquidos) - 2 treinamentos

### Exemplos de URLs com Filtros

```
# Ver apenas treinamentos pendentes
/colaborador/000648?status=Pendente

# Buscar por "higienização"
/colaborador/000648?q=higienização

# Ordenar por título
/colaborador/000648?sort=titulo

# Combinação de filtros
/colaborador/000648?status=Vencido&sort=vencimento
```

## 🔧 Tecnologias Utilizadas

- **React 18.3.1** + **TypeScript 5.5.3**
- **React Router DOM 6.26.2**: Roteamento dinâmico
- **Shadcn/UI**: Componentes (Tabs, Card, Badge, Input, Select, etc.)
- **Tailwind CSS 3.4.11**: Estilização responsiva
- **Lucide React 0.462.0**: Ícones
- **date-fns 3.0.0**: Manipulação de datas

## 📊 Dados Mock

Os dados mock são armazenados no **localStorage** para simular persistência:

- **Chave de colaboradores**: `sysoee_colaboradores`
- **Chave de treinamentos**: `sysoee_treinamentos`

Os dados são inicializados automaticamente na primeira chamada da API.

### Estrutura de Dados

#### Colaborador
```typescript
{
  id: string              // Matrícula
  nome: string
  cargo: string
  setor: string
  fotoUrl?: string
  email?: string
  dataAdmissao?: string   // ISO format
}
```

#### Treinamento
```typescript
{
  id: string
  codigoPO: string
  tituloPO: string
  versao: string
  status: 'Concluído' | 'Pendente' | 'Vencido'
  dataConclusao?: string  // ISO format
  dataValidade?: string   // ISO format
  cargaHoraria: number
  certificadoUrl?: string
  colaboradorId: string
}
```

## 🎨 Design System

### Cores de Status

- **Concluído**: Verde (`bg-green-600`)
- **Pendente**: Laranja (`bg-orange-600`)
- **Vencido**: Vermelho (`bg-red-600`)

### Breakpoints Responsivos

- **Mobile**: < 768px (cards verticais)
- **Desktop**: ≥ 768px (tabela)

### Componentes Shadcn Utilizados

- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Card`, `CardContent`
- `Badge`
- `Button`
- `Input`
- `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`
- `Avatar`, `AvatarImage`, `AvatarFallback`
- `Separator`
- `Skeleton`

## 🔄 Fluxo de Dados

1. **Montagem do Componente**:
   - Lê ID do colaborador da URL (`useParams`)
   - Carrega preferências do localStorage
   - Sincroniza estado inicial com query params da URL
   - Busca dados do colaborador e treinamentos (API mock)

2. **Interação do Usuário**:
   - Mudança de aba/status → Atualiza URL e localStorage
   - Digitação na busca → Debounce → Atualiza URL e localStorage
   - Mudança de ordenação → Atualiza URL e localStorage

3. **Filtragem e Ordenação**:
   - Filtra por status (se não for "Todos")
   - Filtra por termo de busca (debounced)
   - Ordena conforme critério selecionado
   - Renderiza lista filtrada e ordenada

4. **Persistência**:
   - Preferências salvas automaticamente no localStorage
   - URL atualizada para permitir deep-linking
   - Estado reconstruído ao recarregar página

## 🧪 Testes Manuais Recomendados

### Funcionalidades Básicas
- [ ] Carregar perfil de colaborador existente
- [ ] Tentar carregar colaborador inexistente (deve mostrar erro)
- [ ] Verificar se contadores KPI estão corretos
- [ ] Verificar se avatar mostra iniciais corretas

### Filtros e Busca
- [ ] Alternar entre abas de status
- [ ] Buscar por código de PO
- [ ] Buscar por título de PO
- [ ] Testar busca sem resultados
- [ ] Mudar critério de ordenação
- [ ] Verificar se ordenação está correta

### Sincronização URL
- [ ] Mudar filtros e verificar se URL atualiza
- [ ] Copiar URL e abrir em nova aba (deve manter filtros)
- [ ] Usar botões voltar/avançar do navegador

### Persistência
- [ ] Mudar filtros e recarregar página (deve manter preferências)
- [ ] Clicar em "Limpar Preferências" (deve resetar tudo)
- [ ] Verificar localStorage no DevTools

### Responsividade
- [ ] Testar em mobile (< 768px) - deve mostrar cards
- [ ] Testar em desktop (≥ 768px) - deve mostrar tabela
- [ ] Verificar se layout não quebra em diferentes tamanhos

### Ações
- [ ] Clicar em "Ver Certificado" (deve abrir em nova aba se disponível)
- [ ] Clicar em "Ver Certificado" desabilitado (quando não há URL)
- [ ] Clicar em "Detalhes do PO" (placeholder - apenas log no console)
- [ ] Clicar em "Voltar" (deve voltar para página anterior)

### Estados de UI
- [ ] Verificar skeleton durante carregamento
- [ ] Forçar erro (ID inválido) e verificar mensagem
- [ ] Verificar empty state (colaborador sem treinamentos)
- [ ] Verificar mensagem "Nenhum resultado" na busca

## 🚧 Melhorias Futuras

### Funcionalidades
- [ ] Paginação ou scroll infinito para muitos treinamentos
- [ ] Exportar lista de treinamentos (PDF/Excel)
- [ ] Filtro por data de vencimento (próximos 30 dias, etc.)
- [ ] Notificações de treinamentos próximos ao vencimento
- [ ] Histórico de treinamentos anteriores (versões antigas)
- [ ] Gráfico de evolução de treinamentos ao longo do tempo

### Integração
- [ ] Substituir API mock por integração real com Supabase
- [ ] Implementar rota de detalhes do PO
- [ ] Integração com sistema de certificados
- [ ] Upload de certificados
- [ ] Assinatura digital de conclusão de treinamento

### UX/UI
- [ ] Animações de transição entre abas
- [ ] Tooltip com informações adicionais
- [ ] Indicador visual de treinamentos próximos ao vencimento (< 30 dias)
- [ ] Modo escuro (dark mode)
- [ ] Impressão otimizada do perfil

### Performance
- [ ] Cache de dados com React Query
- [ ] Virtualização de lista para muitos treinamentos
- [ ] Lazy loading de componentes

## 📝 Notas de Desenvolvimento

### Convenções de Código
- Todos os comentários em português brasileiro
- Uso de path alias `@/` para imports
- Componentes funcionais com TypeScript
- Props tipadas com interfaces
- Uso de `cn()` para composição de classes

### Princípios ALCOA+
- **Atribuível**: Cada treinamento tem colaboradorId
- **Legível**: UI clara e informativa
- **Contemporâneo**: Dados de conclusão registrados com timestamp
- **Original**: Dados mock simulam dados originais
- **Exato**: Cálculos de status e vencimento precisos
- **Completo**: Todas as informações relevantes exibidas
- **Consistente**: Formatação uniforme de datas e dados
- **Durável**: Dados persistidos no localStorage (mock)
- **Disponível**: Dados acessíveis via API

## 🐛 Problemas Conhecidos

Nenhum problema conhecido no momento.

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- Documentação do projeto: `docs/project/`
- Especificações: `docs/EspecificacaoUsuario/md/`
- AGENTS.md e CLAUDE.md na raiz do projeto

