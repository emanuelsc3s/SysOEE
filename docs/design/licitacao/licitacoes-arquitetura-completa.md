# Documentação de Arquitetura - Funcionalidade de Licitações

## Sumário Executivo

Esta documentação descreve de forma completa a arquitetura da funcionalidade de **Licitações** do sistema APFAR, permitindo a reimplementação em outros projetos mantendo a mesma estrutura, componentes e lógica de negócio.

**Objetivo**: Fornecer especificação técnica detalhada para replicar a funcionalidade de gestão de licitações públicas em diferentes projetos, com foco em estrutura e lógica, independente de temas visuais.

---

## 1. Visão Geral da Funcionalidade

### 1.1 Descrição
Sistema completo para gestão de **licitações públicas**, permitindo:
- Cadastro e edição de licitações
- Listagem com filtros avançados
- Gerenciamento de produtos/itens da licitação
- Controle de status e acompanhamento
- Sistema de anexos
- Paginação e busca otimizada

### 1.2 Conceitos do Domínio
- **Licitação**: Processo de pregão/licitação pública
- **Item da Licitação**: Produto ou serviço sendo licitado
- **Órgão Licitante**: Instituição governamental que realiza a licitação
- **Cliente**: Entidade que irá receber faturamento (pode diferir do órgão)
- **Status**: Estados do processo (Aberta, Em Andamento, Finalizada, Ganha, Perdida, etc.)
- **Modalidade**: Tipo de licitação (Pregão Eletrônico, Concorrência, etc.)

---

## 2. Arquitetura de Componentes

### 2.1 Hierarquia de Componentes

```
App
├── AuthProvider (Context de autenticação)
├── QueryClientProvider (React Query)
│   ├── BrowserRouter
│   │   └── Routes
│   │       ├── /licitacoes → <Licitacoes />
│   │       ├── /licitacoes/nova → <LicitacoesCad />
│   │       └── /licitacoes/:id → <LicitacoesCad />
│   └── AppLayout (Layout autenticado)
│       ├── AppSidebar (navegação lateral)
│       ├── AppHeader (cabeçalho)
│       └── <main> (área de conteúdo)
│           └── <Outlet /> (renderiza páginas)
```

### 2.2 Componentes Principais

#### **2.2.1 Página Licitacoes.tsx** (Listagem)

**Responsabilidades**:
- Listagem paginada de licitações
- Busca local por número ou cliente
- Filtros avançados (modal)
- Ações: Visualizar, Editar, Excluir, Anexos
- Indicadores de status com badges coloridos
- Atualização em tempo real com React Query

**Props**: Nenhuma (rota)

**Estado Principal**:
```typescript
{
  searchTerm: string                    // Busca local
  currentPage: number                   // Página atual
  itemsPerPage: number                  // Registros por página
  appliedFilters: FilterState           // Filtros aplicados
  draftFilters: FilterState             // Filtros em edição (modal)
  isAnexosOpen: boolean                 // Controle modal anexos
  anexosLicitacaoId: string | null      // ID da licitação para anexos
}
```

**Estrutura Visual**:
```
┌─────────────────────────────────────────────────────┐
│ Header                                              │
│   Título + Botão "Nova Licitação"                  │
├─────────────────────────────────────────────────────┤
│ Card Principal                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Cabeçalho do Card                               │ │
│ │   Total de licitações + Loading indicator       │ │
│ ├─────────────────────────────────────────────────┤ │
│ │ Barra de Busca + Botões (Filtros, Atualizar)   │ │
│ ├─────────────────────────────────────────────────┤ │
│ │ Tabela (scroll vertical)                        │ │
│ │ ┌──────┬──────┬────────┬───────┬──────┬────────┐│ │
│ │ │Ações │Lançam│Cliente │Modalid│Data  │Status  ││ │
│ │ ├──────┼──────┼────────┼───────┼──────┼────────┤│ │
│ │ │[🔍✏️🗑️📎]│000001│Nome...│Pregão │01/01 │Aberta ││ │
│ │ └──────┴──────┴────────┴───────┴──────┴────────┘│ │
│ ├─────────────────────────────────────────────────┤ │
│ │ Paginação (< 1 2 3 > + Registros por página)   │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Hooks Utilizados**:
- `useNavigate()` - Navegação entre rotas
- `useState()` - Gerenciamento de estado local
- `useQuery()` - Busca de dados com React Query
- `useLicitacoes()` - Hook customizado para operações CRUD
- `useClientes()` - Busca de clientes/órgãos
- `useAvailableHeight()` - Cálculo dinâmico de altura

**Fluxo de Dados**:
```
1. Usuário acessa /licitacoes
2. useQuery busca dados via fetchLicitacoes()
3. Dados são armazenados em cache (React Query)
4. Listagem renderizada com filtros aplicados
5. Mudanças em filtros/página → refetch automático
6. Ações (editar/excluir) → navegação ou mutação → refetch
```

#### **2.2.2 Página LicitacoesCad.tsx** (Formulário)

**Nota**: O arquivo `LicitacaoForm.tsx` não foi encontrado. O formulário de cadastro está em **LicitacoesCad.tsx** (arquivo muito grande, ~36.500 tokens).

**Responsabilidades**:
- Criar nova licitação
- Editar licitação existente
- Validação de formulário
- Gerenciamento de produtos da licitação
- Salvamento com tratamento de erros

**Modo de Operação**:
- **Criação**: `/licitacoes/nova`
- **Edição**: `/licitacoes/:id`

**Estrutura Esperada** (baseada no hook):
- Formulário multi-seção (abas ou accordion)
- Campos de identificação (modalidade, número, data)
- Campos de relacionamento (órgão, cliente)
- Campos de vigência e prazos
- Observações (pública e privada)
- Grid de produtos (sub-formulário)

#### **2.2.3 AppLayout.tsx** (Layout Principal)

**Responsabilidades**:
- Wrapper para rotas autenticadas
- Renderizar sidebar e header
- Container principal com scroll
- Reset de scroll ao mudar de rota

**Estrutura**:
```typescript
<SidebarProvider>
  <div className="min-h-screen flex w-full">
    <AppSidebar />
    <div className="flex-1 flex flex-col">
      <AppHeader />
      <main id="app-scroll-container" className="flex-1 px-6 pt-3 pb-6 overflow-auto">
        <Outlet /> {/* Renderiza rotas filhas */}
      </main>
    </div>
  </div>
</SidebarProvider>
```

**Comportamento**:
- Auto-scroll ao topo ao mudar pathname
- Container com overflow para scroll isolado

---

## 3. Hooks Customizados

### 3.1 useLicitacoes.ts

**Responsabilidades**:
- Operações CRUD de licitações
- Mapeamento entre tipos do banco e formulário
- Tratamento de erros
- Notificações (toasts)

**API Exposta**:
```typescript
interface UseLicitacoesReturn {
  loading: boolean
  licitacoes: LicitacaoFormData[]

  fetchLicitacoes(filters?: FetchFilters): Promise<{
    data: LicitacaoFormData[]
    count: number
  }>

  fetchLicitacao(id: string): Promise<LicitacaoFormData>

  saveLicitacao(data: LicitacaoFormData): Promise<{
    licitacao_id: number
  }>

  deleteLicitacao(id: string): Promise<void>
}

interface FetchFilters {
  licitacao_id?: number
  data_ini?: string         // YYYY-MM-DD
  data_fim?: string         // YYYY-MM-DD
  origem?: string
  modalidade?: string
  status?: string
  cliente_id?: number
  orgao_id?: number
  page?: number
  itemsPerPage?: number
}
```

**Lógica de Busca**:
1. Tenta executar SQL customizado via RPC
2. Em caso de erro, usa fallback com query builder do Supabase
3. Aplica filtros via WHERE clauses
4. Implementa paginação via LIMIT/OFFSET ou .range()
5. Faz JOIN com `tbcliente` para obter nome do cliente
6. Mapeia campos do banco para interface do formulário

**Mapeamento de Campos**:
```typescript
// Banco → Formulário
{
  licitacao_id → id (string)
  data → dataAbertura
  hora → horaAbertura
  origem → origem
  status → status
  vigencia_ini → vigenciaInicial
  vigencia_data → vigenciaFinal
  vigencia → vigenciaMeses
  vendedor_id → vendedor
  garantia_preco → dataVigenciaPreco
  homologacao → dataHomologacao
  orgao_id → orgaoId + orgaoLicitante (nome via JOIN)
  cliente_id → clienteId + cliente (nome via JOIN)
  tipo → tipo
  modalidade → modalidade
  modalidade_numero → modalidadeNumero
  modalidade_ano → modalidadeAno
  processo → processoNumero
  processo_ano → processoAno
  validade_cotacao → dataValidadeCotacao
  entregas → numeroEntregas
  entrega → prazoEntregaDias
  tipo_entrega → tipoEntrega
  processo_admin → processoAdministrativo
  processo_admin_ano → processoAdministrativoAno
  site → sitePortal
  portaria → portariaLicitatoriaNumero
  portaria_ano → portariaAno
  licitacao_origem → licitacaoOrigem
  obs → observacaoGeral
  obs_interno → observacaoPrivada
  objeto → objeto
}
```

**Soft Delete**:
- Exclusão marca `deletado = 'S'`
- Registra `data_del` e `usuario_d`
- Filtros sempre aplicam `WHERE deletado = 'N'`

**Auditoria**:
- Inserção: `data_inc`, `usuario_i`
- Atualização: `data_alt`, `usuario_a`
- Exclusão: `data_del`, `usuario_d`
- Usuário obtido via `getUserIdFromTbusuario()` (do Supabase Auth)

### 3.2 useProdutosLicitacao.ts

**Responsabilidades**:
- CRUD de itens/produtos da licitação
- Busca/criação automática de produtos na `tbproduto`
- Upload de imagens
- Relacionamento com concorrentes e motivos de perda

**API Exposta**:
```typescript
interface UseProdutosLicitacaoReturn {
  loading: boolean
  produtos: ProdutoFormData[]

  fetchProdutos(licitacaoId: string): Promise<ProdutoFormData[]>

  saveProduto(
    data: ProdutoFormData,
    licitacaoId: string
  ): Promise<DbProdutoItem>

  deleteProduto(id: string): Promise<void>

  uploadImagem(
    file: File,
    path: string
  ): Promise<string> // retorna URL pública
}
```

**Lógica de Salvamento**:
1. Valida se `produto_id` é válido (não temporário, não timestamp)
2. Se inválido ou ausente → chama `findOrCreateProduto(nome)`
   - Busca produto por nome exato em `tbproduto`
   - Se não existe, cria novo registro
3. Salva item na `tblicitacao_item` com `produto_id` válido
4. Inclui campos de auditoria

**Mapeamento de Campos**:
```typescript
// Banco → Formulário (tblicitacao_item)
{
  litem_id → id
  produto.descricao (JOIN) → nome
  quantidade → quantidade
  item_edital → numeroEdital
  preco → precoReferencia
  preco_maximo → precoMaximo
  preco_final → precoFinal
  pdv → pdv
  preco_concorrente → precoConcorrente
  concorrente.razao_social (JOIN) → concorrente
  participa (S/N) → participa (boolean)
  margem → margem
  preco_inicial → preco_inicial
  preco_ganho → preco_ganho
  concorrente_id → concorrente_id
  status → status
  qtde_pedido → qtde_pedido
  qtde_nf → qtde_nf
  resultado → resultado
  marca → marca
  motivoperda_id → motivoperda_id
  motivoperda → motivoperda
  sync → sync
  sync_data → sync_data
}
```

**Upload de Imagens**:
- Bucket: `produtos-licitacao`
- Nome do arquivo: `{timestamp}_{filename_sanitizado}`
- Path: `{path}/{filename}`
- Retorna URL pública para armazenamento

---

## 4. Estrutura de Dados

### 4.1 Interfaces TypeScript

#### **LicitacaoFormData** (licitacao-type.ts)
```typescript
export interface LicitacaoFormData {
  id?: string                           // licitacao_id (string)

  // Identificação
  dataAbertura: string | null           // YYYY-MM-DD
  horaAbertura: string                  // HH:MM
  origem: string                        // Portal/fonte
  status: string                        // Aberta, Finalizada, etc.
  tipo: string                          // Tipo de licitação
  modalidade: string                    // Modalidade (Pregão, etc.)
  modalidadeNumero: string              // Número do edital
  modalidadeAno: string                 // Ano da modalidade

  // Processo
  processoNumero: string
  processoAno: string
  processoAdministrativo: string
  processoAdministrativoAno: string
  portariaLicitatoriaNumero: string
  portariaAno: string

  // Relacionamentos
  orgaoLicitante: string                // Nome (exibição)
  orgaoId?: number | null               // ID da FK
  orgaoNome?: string                    // Nome via JOIN
  cliente: string                       // Nome (exibição)
  clienteId?: number | null             // ID da FK
  vendedor: string                      // ID do vendedor (string)

  // Vigência e Prazos
  vigenciaInicial: string | null        // YYYY-MM-DD
  vigenciaFinal: string | null          // YYYY-MM-DD
  vigenciaMeses: string                 // Duração em meses
  dataVigenciaPreco: string | null      // Garantia de preço
  dataHomologacao: string | null        // Data de homologação
  dataValidadeCotacao: string | null    // Validade da cotação

  // Entrega
  numeroEntregas: string                // Quantidade de entregas
  prazoEntregaDias: string              // Prazo em dias
  tipoEntrega: string                   // Tipo de entrega

  // Observações
  objeto: string                        // Objeto da licitação
  observacaoGeral: string               // Observações públicas
  observacaoPrivada: string             // Observações internas
  sitePortal: string                    // URL do portal
  licitacaoOrigem: string               // ID de licitação origem
}
```

#### **ProdutoFormData** (produto-type.ts)
```typescript
export interface ProdutoFormData {
  id?: string                           // litem_id
  produto_id?: number                   // FK para tbproduto

  // Identificação
  nome: string                          // Descrição do produto
  numeroEdital: string                  // Item no edital
  marca: string                         // Marca do produto

  // Quantidades
  quantidade: number                    // Qtde licitada
  qtde_pedido: number                   // Qtde em pedido
  qtde_nf: number                       // Qtde em NF

  // Preços
  precoReferencia: number               // Preço base
  precoMaximo: number                   // Preço máximo
  precoFinal: number                    // Preço final
  preco_inicial: number                 // Preço inicial
  preco_ganho: number                   // Preço ganho
  pdv: number                           // PDV
  precoAplicado: number                 // Preço aplicado
  precoConcorrente: number              // Preço do concorrente
  margem: number                        // Margem

  // Concorrente
  concorrente: string                   // Nome do concorrente
  concorrente_id?: number | null        // FK para tbconcorrente

  // Status e Resultado
  participa: boolean                    // Participa ou não (S/N)
  status: string                        // Status do item
  resultado: string                     // Resultado final
  motivoPerda: string                   // Motivo da perda
  motivoperda_id?: number | null        // FK para tbmotivoperda
  motivoperda: string                   // Descrição do motivo

  // Imagem
  imagemUrl: string                     // URL da imagem
  imagemFile: File | null               // Arquivo para upload

  // Sincronização
  sync: string                          // Flag de sinc (S/N)
  sync_data?: string | null             // Data de sincronização
}
```

### 4.2 Schema do Banco de Dados

#### **Tabela: tblicitacao**

```sql
CREATE TABLE tblicitacao (
  -- Chave primária
  licitacao_id SERIAL PRIMARY KEY,

  -- Relacionamentos (FKs)
  cliente_id INTEGER REFERENCES tbcliente(cliente_id),
  orgao_id INTEGER REFERENCES tbcliente(cliente_id),
  vendedor_id INTEGER REFERENCES tbvendedor(vendedor_id),
  modalidade_id INTEGER REFERENCES tbmodalidade(modalidade_id),
  licitacao_origem INTEGER REFERENCES tblicitacao(licitacao_id),

  -- Identificação
  data DATE,
  hora VARCHAR(5),
  origem VARCHAR(50),
  status VARCHAR(30),
  tipo VARCHAR(30),
  modalidade VARCHAR(30),
  modalidade_numero VARCHAR(50),
  modalidade_ano VARCHAR(4),

  -- Processo
  processo VARCHAR(50),
  processo_ano VARCHAR(4),
  processo_admin VARCHAR(50),
  processo_admin_ano VARCHAR(4),
  portaria VARCHAR(50),
  portaria_ano VARCHAR(4),

  -- Vigência e Prazos
  vigencia_ini DATE,
  vigencia_data DATE,
  vigencia NUMERIC,
  garantia_preco DATE,
  homologacao DATE,
  validade_cotacao DATE,

  -- Entrega
  entregas INTEGER,
  entrega NUMERIC,
  tipo_entrega VARCHAR(30),

  -- Outros
  objeto VARCHAR(100),
  obs TEXT,              -- Observação geral (até 4000 chars)
  obs_interno TEXT,      -- Observação privada (até 4000 chars)
  obs_cliente TEXT,      -- Observação do cliente
  site VARCHAR(250),
  participa CHAR(1) DEFAULT 'S',
  ganha CHAR(1),
  motivo TEXT,

  -- Auditoria
  deletado CHAR(1) DEFAULT 'N',
  data_inc TIMESTAMP,
  usuario_i INTEGER,
  data_alt TIMESTAMP,
  usuario_a INTEGER,
  data_del TIMESTAMP,
  usuario_d INTEGER,

  -- Sincronização
  sync CHAR(1) DEFAULT 'N',
  sync_data TIMESTAMP
);
```

#### **Tabela: tblicitacao_item**

```sql
CREATE TABLE tblicitacao_item (
  -- Chave primária
  litem_id SERIAL PRIMARY KEY,

  -- Relacionamentos (FKs)
  licitacao_id INTEGER REFERENCES tblicitacao(licitacao_id),
  produto_id INTEGER REFERENCES tbproduto(produto_id),
  concorrente_id INTEGER REFERENCES tbconcorrente(concorrente_id),
  motivoperda_id INTEGER REFERENCES tbmotivoperda(motivoperda_id),

  -- Identificação
  item_edital VARCHAR(50),
  marca VARCHAR(100),

  -- Quantidades
  quantidade NUMERIC,
  qtde_pedido NUMERIC,
  qtde_nf NUMERIC,

  -- Preços
  preco NUMERIC,              -- Preço de referência
  preco_maximo NUMERIC,
  preco_final NUMERIC,
  preco_inicial NUMERIC,
  preco_ganho NUMERIC,
  pdv NUMERIC,
  preco_aplicado NUMERIC,
  preco_concorrente NUMERIC,
  margem NUMERIC,

  -- Status e Resultado
  participa CHAR(1) DEFAULT 'S',
  status VARCHAR(30),
  resultado VARCHAR(100),
  motivo_perda TEXT,
  motivoperda TEXT,
  concorrente VARCHAR(255),   -- Nome do concorrente (denormalizado)

  -- Imagem
  imagem_url VARCHAR(500),

  -- Auditoria
  deletado CHAR(1) DEFAULT 'N',
  data_inc TIMESTAMP,
  usuario_i INTEGER,
  data_alt TIMESTAMP,
  usuario_a INTEGER,
  data_del TIMESTAMP,
  usuario_d INTEGER,

  -- Sincronização
  sync CHAR(1) DEFAULT 'N',
  sync_data TIMESTAMP
);
```

#### **Tabela: tbproduto** (Catálogo)

```sql
CREATE TABLE tbproduto (
  produto_id SERIAL PRIMARY KEY,
  descricao VARCHAR(255),
  -- Outros campos (unidade, categoria, etc.)
  deletado CHAR(1) DEFAULT 'N',
  data_inc TIMESTAMP,
  usuario_i INTEGER,
  -- ...
);
```

#### **Tabela: tbcliente** (Órgãos e Clientes)

```sql
CREATE TABLE tbcliente (
  cliente_id SERIAL PRIMARY KEY,
  nome VARCHAR(255),
  email VARCHAR(255),
  telefone VARCHAR(50),
  endereco VARCHAR(255),
  cidade VARCHAR(100),
  uf VARCHAR(2),
  cep VARCHAR(10),
  data_cadastro TIMESTAMP,
  status VARCHAR(30),
  deletado CHAR(1) DEFAULT 'N'
);
```

### 4.3 Relacionamentos

```
tblicitacao
  ├─→ tbcliente (cliente_id)       [Cliente para faturamento]
  ├─→ tbcliente (orgao_id)         [Órgão licitante]
  ├─→ tbvendedor (vendedor_id)     [Vendedor responsável]
  ├─→ tbmodalidade (modalidade_id) [Modalidade da licitação]
  └─→ tblicitacao (licitacao_origem) [Licitação de origem]

tblicitacao_item
  ├─→ tblicitacao (licitacao_id)      [Licitação pai]
  ├─→ tbproduto (produto_id)          [Produto do catálogo]
  ├─→ tbconcorrente (concorrente_id)  [Concorrente]
  └─→ tbmotivoperda (motivoperda_id)  [Motivo da perda]
```

---

## 5. Fluxo de Dados

### 5.1 Fluxo de Listagem

```
┌────────────────────────────────────────────────────────────────┐
│ 1. Usuário acessa /licitacoes                                  │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────┐
│ 2. React Query verifica cache                                  │
│    - Cache válido (< 5 min)? Retorna dados do cache            │
│    - Cache inválido? Executa queryFn                           │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────┐
│ 3. queryFn → fetchLicitacoes(filters)                          │
│    - Constrói SQL customizado com filtros                      │
│    - Executa supabase.rpc('execute_sql_query')                 │
│    - Em caso de erro, usa fallback (.select())                 │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────┐
│ 4. Supabase executa query                                      │
│    SELECT l.*, c.nome as cliente                               │
│    FROM tblicitacao l                                          │
│    LEFT JOIN tbcliente c ON c.cliente_id = l.cliente_id       │
│    WHERE l.deletado = 'N' [+ filtros]                          │
│    ORDER BY l.licitacao_id DESC                                │
│    LIMIT [itemsPerPage] OFFSET [offset]                        │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────┐
│ 5. Hook mapeia dados do banco → LicitacaoFormData[]           │
│    - Converte IDs para strings                                 │
│    - Formata datas                                             │
│    - Mapeia nomes de campos                                    │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────┐
│ 6. React Query armazena em cache                               │
│    - staleTime: 5 minutos                                      │
│    - gcTime: 10 minutos                                        │
│    - queryKey inclui filtros e página                          │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────┐
│ 7. Componente renderiza tabela                                 │
│    - Aplica filtro local (searchTerm)                          │
│    - Mapeia cada item para TableRow                            │
│    - Renderiza badges de status                                │
│    - Botões de ação (Ver, Editar, Excluir, Anexos)            │
└────────────────────────────────────────────────────────────────┘
```

### 5.2 Fluxo de Criação/Edição

```
┌────────────────────────────────────────────────────────────────┐
│ A. Criação: Usuário clica "Nova Licitação"                    │
│    → Navega para /licitacoes/nova                             │
│                                                                 │
│ B. Edição: Usuário clica "Editar" ou na linha                 │
│    → Navega para /licitacoes/:id                              │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────┐
│ 1. LicitacoesCad monta                                         │
│    - Extrai :id dos params (se edição)                        │
│    - Se id existe → chama fetchLicitacao(id)                  │
│    - Se id não existe → inicializa formulário vazio           │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼ (Edição)
┌────────────────────────────────────────────────────────────────┐
│ 2. fetchLicitacao(id)                                          │
│    - SQL com JOINs para trazer nomes de cliente e órgão       │
│    - Mapeia campos do banco para formulário                    │
│    - Preenche estado do formulário                             │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────┐
│ 3. Usuário preenche/edita campos                              │
│    - Campos controlados via React state                        │
│    - Validações locais (opcional: Zod schema)                 │
│    - Busca de órgão/cliente via modal de pesquisa             │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────┐
│ 4. Usuário clica "Salvar"                                     │
│    → Chama saveLicitacao(formData)                            │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────┐
│ 5. saveLicitacao() prepara dados                              │
│    - Obtém usuarioId via getUserIdFromTbusuario()             │
│    - Mapeia campos do formulário → banco                       │
│    - Normaliza datas (string vazia → null)                    │
│    - Converte strings para números onde necessário            │
│    - Define campos de auditoria                                │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────┐
│ 6. Executa operação no Supabase                               │
│    - Se id existe: .update().eq('licitacao_id', id)           │
│    - Se id não existe: .insert()                              │
│    - Retorna registro criado/atualizado                        │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────┐
│ 7. Feedback ao usuário                                         │
│    - Sucesso: Toast + navegação ou permanece no formulário    │
│    - Erro: Toast com mensagem de erro                          │
└────────────────────────────────────────────────────────────────┘
```

### 5.3 Fluxo de Exclusão

```
┌────────────────────────────────────────────────────────────────┐
│ 1. Usuário clica no botão "Excluir"                           │
│    - Evento capturado (e.stopPropagation())                    │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────┐
│ 2. Exibe confirmação via window.confirm()                     │
│    "Deseja excluir esta licitação?"                           │
│    - Sim → prossegue                                           │
│    - Não → cancela operação                                    │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────┐
│ 3. Chama deleteLicitacao(id)                                  │
│    - Obtém usuarioId via getUserIdFromTbusuario()             │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────┐
│ 4. Executa soft delete                                         │
│    UPDATE tblicitacao SET                                      │
│      deletado = 'S',                                           │
│      data_del = NOW(),                                         │
│      usuario_d = [usuarioId]                                   │
│    WHERE licitacao_id = [id]                                   │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────┐
│ 5. Refetch da listagem                                        │
│    - React Query invalida cache                                │
│    - Recarrega dados (licitação excluída não aparece mais)    │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────┐
│ 6. Toast de sucesso                                           │
│    "Licitação excluída com sucesso"                           │
└────────────────────────────────────────────────────────────────┘
```

---

## 6. Lógica de Negócio

### 6.1 Regras de Validação

#### **Licitação**
- `dataAbertura`: Não obrigatória, mas recomendada
- `modalidade` ou `modalidadeNumero`: Pelo menos um deve ser preenchido
- `orgaoId` ou `clienteId`: Pelo menos um relacionamento deve existir
- `status`: Valores permitidos (Aberta, Em Andamento, Finalizada, Cancelada, Vigente, Sem Ata, Suspenso)
- `vigenciaMeses`: Se preenchida, deve ser numérica
- Datas: Formato YYYY-MM-DD ou null

#### **Produto**
- `nome`: Obrigatório
- `quantidade`: Deve ser > 0
- `precoReferencia`: Deve ser >= 0
- `participa`: Define se a empresa participa da concorrência deste item
- `produto_id`: Validado (não pode ser timestamp ou ID temporário)

### 6.2 Cálculos e Transformações

#### **Status Badge**
```typescript
function getStatusVariant(status: string, ganha: string) {
  // Licitação ganha sempre verde
  if (ganha === 'S') return 'success'

  switch (status.toLowerCase()) {
    case 'vigente': return 'success'
    case 'sem ata': return 'warning'
    case 'suspenso': return 'destructive'
    case 'aberta': return 'info'
    case 'em andamento': return 'info'
    case 'finalizada':
      return ganha === 'S' ? 'success' : 'destructive'
    case 'cancelada': return 'secondary'
    default: return 'outline'
  }
}
```

#### **Label de Status**
```typescript
function getStatusLabel(status: string, ganha: string) {
  if (status.toLowerCase() === 'finalizada') {
    return ganha === 'S' ? 'Ganha' : 'Perdida'
  }
  return status || 'N/A'
}
```

#### **Número de Licitação Formatado**
```typescript
// Exibe ID com padding de 9 dígitos
const numero = String(licitacao.id).padStart(9, '0')
// Exemplo: 1 → "000000001"
```

#### **Modalidade com Número e Ano**
```typescript
// Combina número e ano se ambos existirem
const modalidadeCompleta = licitacao.modalidadeNumero
  ? (licitacao.modalidadeAno
      ? `${licitacao.modalidadeNumero}/${licitacao.modalidadeAno}`
      : licitacao.modalidadeNumero)
  : 'N/A'
// Exemplo: "90043/2025"
```

### 6.3 Tratamento de Erros

```typescript
// Padrão de tratamento via handleSupabaseError
try {
  // Operação no Supabase
  const { data, error } = await supabase.from('...').select()
  if (error) throw error

  return data
} catch (error) {
  const errorMessage = handleSupabaseError(error)

  toast({
    title: "Erro ao [operação]",
    description: errorMessage,
    variant: "destructive"
  })

  throw error // Re-throw para propagação
}
```

**handleSupabaseError** (função utilitária):
- Mapeia códigos de erro do Supabase para mensagens em português
- Trata erros de rede, permissão, validação, etc.
- Retorna mensagem amigável para exibição

### 6.4 Paginação

#### **Configuração**
```typescript
const PAGE_SIZE_OPTIONS = [25, 50, 100, 200, 500, 1000]
const PAGE_SIZE_STORAGE_KEY = 'apfar_licitacoes_items_per_page'

// Carrega preferência do localStorage ao montar
useEffect(() => {
  const saved = localStorage.getItem(PAGE_SIZE_STORAGE_KEY)
  if (saved && PAGE_SIZE_OPTIONS.includes(parseInt(saved))) {
    setItemsPerPage(parseInt(saved))
  }
}, [])
```

#### **Cálculo de Offset**
```typescript
// SQL direto
const offset = (page - 1) * itemsPerPage
const limit = itemsPerPage
// LIMIT ${limit} OFFSET ${offset}

// Supabase query builder
const from = (page - 1) * itemsPerPage
const to = from + itemsPerPage - 1
// .range(from, to)
```

#### **Total de Páginas**
```typescript
const totalPages = Math.ceil(totalItems / itemsPerPage)
```

### 6.5 Filtros Avançados

#### **Estado de Filtros**
```typescript
interface FilterState {
  licitacao_id: string          // Número do lançamento
  data_ini?: Date               // Data inicial
  data_fim?: Date               // Data final
  orgao_id: string              // ID do órgão
  orgao_nome: string            // Nome do órgão (exibição)
  cliente_id: string            // ID do cliente
  cliente_nome: string          // Nome do cliente (exibição)
  origem: string                // Portal/fonte
  modalidade: string            // Modalidade
  status: string                // Status
}
```

#### **Aplicação de Filtros**
- **Filtros em draft**: Editados no modal (estado `draftFilters`)
- **Filtros aplicados**: Após clicar "Aplicar Filtros" (`appliedFilters`)
- **QueryKey**: Inclui filtros aplicados serializados → refetch automático
- **Badge de contagem**: Exibe quantidade de filtros ativos

#### **Busca de Órgão/Cliente**
- Modal com tabela de resultados
- Busca com debounce de 500ms
- Reutiliza hook `useClientes()` para buscar
- Seleção preenche ID e nome no filtro

---

## 7. Integrações

### 7.1 Supabase

#### **Configuração**
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### **Padrão Singleton**
- Cliente Supabase é exportado e reutilizado
- Não instanciar múltiplas vezes

#### **Operações Comuns**
```typescript
// SELECT
const { data, error } = await supabase
  .from('tblicitacao')
  .select('*, tbcliente!fk_tblicitacao_cliente(nome)')
  .eq('deletado', 'N')

// INSERT
const { data, error } = await supabase
  .from('tblicitacao')
  .insert(dbData)
  .select()

// UPDATE
const { data, error } = await supabase
  .from('tblicitacao')
  .update(dbData)
  .eq('licitacao_id', id)
  .select()

// RPC (SQL Customizado)
const { data, error } = await supabase.rpc('execute_sql_query', {
  sql_query: sqlString
})
```

#### **Autenticação**
```typescript
// Obter usuário autenticado
const { data: { user } } = await supabase.auth.getUser()

// Obter ID do usuário na tbusuario
async function getUserIdFromTbusuario() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('tbusuario')
    .select('usuario_id')
    .eq('auth_user_id', user.id)
    .single()

  return data?.usuario_id || null
}
```

### 7.2 React Query

#### **Configuração Global**
```typescript
// App.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutos
      gcTime: 10 * 60 * 1000,    // 10 minutos (cacheTime)
      refetchOnWindowFocus: false
    }
  }
})
```

#### **Uso no Componente**
```typescript
const { data, isLoading, isFetching, error, refetch } = useQuery({
  queryKey: ['licitacoes', currentPage, itemsPerPage, filters],
  queryFn: async () => {
    const result = await fetchLicitacoes({ page, itemsPerPage, ...filters })
    return result
  },
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000
})
```

**Estados**:
- `isLoading`: Primeira carga (sem dados em cache)
- `isFetching`: Qualquer busca (incluindo background refetch)
- `error`: Erro na última tentativa
- `data`: Dados em cache

**Invalidação**:
```typescript
// Refetch manual
refetch()

// Invalidar cache
queryClient.invalidateQueries({ queryKey: ['licitacoes'] })
```

### 7.3 React Router

#### **Configuração de Rotas**
```typescript
// App.tsx
<Routes>
  <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
    <Route path="/licitacoes" element={<Licitacoes />} />
    <Route path="/licitacoes/nova" element={<LicitacoesCad />} />
    <Route path="/licitacoes/:id" element={<LicitacoesCad />} />
  </Route>
</Routes>
```

#### **Navegação**
```typescript
const navigate = useNavigate()

// Navegar para edição
navigate(`/licitacoes/${id}`)

// Navegar para nova
navigate('/licitacoes/nova')

// Voltar
navigate(-1)

// Navegar com replace (não adiciona ao histórico)
navigate('/licitacoes', { replace: true })
```

#### **Parâmetros de Rota**
```typescript
import { useParams } from 'react-router-dom'

const { id } = useParams<{ id: string }>()

// id será undefined em /licitacoes/nova
// id será preenchido em /licitacoes/123
```

---

## 8. Estados e Comportamentos

### 8.1 Loading States

#### **Listagem**
```typescript
// isLoading: Primeira carga (skeleton ou spinner fullpage)
{isLoading && <LoadingSpinner />}

// isFetching: Background refetch (overlay na tabela)
{isFetching && (
  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
    <Loader2 className="animate-spin" />
    Aguarde, carregando dados...
  </div>
)}
```

#### **Formulário**
```typescript
// loading do hook (desabilita botão salvar)
<Button disabled={loading}>
  {loading && <Loader2 className="animate-spin mr-2" />}
  Salvar
</Button>
```

### 8.2 Error Handling

#### **Exibição de Erros**
```typescript
// Na tabela
{error && (
  <div className="text-center py-8 text-red-500">
    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
    <p className="font-medium">Erro ao carregar licitações</p>
    <p className="text-sm text-gray-500">Verifique sua conexão e tente novamente</p>
    <Button onClick={() => refetch()} className="mt-4">
      Tentar novamente
    </Button>
  </div>
)}
```

#### **Toasts**
```typescript
import { toast } from '@/hooks/use-toast'

// Sucesso
toast({
  title: "Sucesso",
  description: "Licitação salva com sucesso",
  variant: "default"
})

// Erro
toast({
  title: "Erro ao salvar",
  description: errorMessage,
  variant: "destructive"
})
```

### 8.3 Validações de Formulário

#### **Estrutura Recomendada**
```typescript
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const licitacaoSchema = z.object({
  dataAbertura: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  modalidade: z.string().min(1, "Modalidade obrigatória"),
  status: z.string().min(1, "Status obrigatório"),
  orgaoId: z.number().optional(),
  clienteId: z.number().optional(),
  // ...
}).refine(
  (data) => data.orgaoId || data.clienteId,
  { message: "Informe pelo menos órgão ou cliente", path: ['orgaoId'] }
)

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(licitacaoSchema)
})
```

#### **Validações Implementadas**
- Modalidade ou número da modalidade obrigatório
- Status obrigatório
- Datas no formato correto (YYYY-MM-DD)
- Valores numéricos válidos (vigência, entregas, preços)
- Relacionamentos (órgão ou cliente)

### 8.4 Responsividade

#### **Breakpoints Tailwind**
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px

#### **Padrões Responsivos**
```typescript
// Header empilhado no mobile, horizontal no desktop
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div>Título</div>
  <Button>Ação</Button>
</div>

// Barra de busca full-width no mobile
<div className="relative w-full md:flex-1 max-w-none">
  <Input ... />
</div>

// Tabela com scroll horizontal no mobile
<div className="overflow-auto">
  <table className="w-full table-auto min-w-[800px]">
    ...
  </table>
</div>

// Colunas do grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  ...
</div>
```

### 8.5 Altura Dinâmica

#### **Hook useAvailableHeight**
```typescript
const useAvailableHeight = (
  tableRef: RefObject<HTMLElement>,
  paginationRef: RefObject<HTMLElement>,
  extraGap: number = 0
) => {
  const [height, setHeight] = useState<number | undefined>()

  useEffect(() => {
    const calculate = () => {
      if (!tableRef.current || !paginationRef.current) return

      const viewportHeight = window.innerHeight
      const tableTop = tableRef.current.getBoundingClientRect().top
      const paginationHeight = paginationRef.current.offsetHeight

      const available = viewportHeight - tableTop - paginationHeight - extraGap
      setHeight(Math.max(available, 200))
    }

    calculate()
    window.addEventListener('resize', calculate)
    return () => window.removeEventListener('resize', calculate)
  }, [])

  return height
}
```

**Uso**:
```typescript
const tableContainerRef = useRef<HTMLDivElement>(null)
const paginationRef = useRef<HTMLDivElement>(null)
const tableMaxHeight = useAvailableHeight(tableContainerRef, paginationRef, 14)

return (
  <div
    ref={tableContainerRef}
    style={{ maxHeight: tableMaxHeight }}
    className="overflow-auto"
  >
    <table>...</table>
  </div>
)
```

---

## 9. Dependências

### 9.1 Bibliotecas Principais

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.x",

    "@supabase/supabase-js": "^2.x",
    "@tanstack/react-query": "^5.x",

    "react-hook-form": "^7.x",
    "zod": "^3.x",
    "@hookform/resolvers": "^3.x",

    "lucide-react": "^0.x",
    "tailwindcss": "^3.x",

    "@radix-ui/react-dialog": "^1.x",
    "@radix-ui/react-select": "^2.x",
    "@radix-ui/react-popover": "^1.x",
    "@radix-ui/react-calendar": "^1.x",

    "sonner": "^1.x"
  }
}
```

### 9.2 Componentes shadcn/ui Utilizados

**Instalados** (via `npx shadcn-ui@latest add [component]`):
- `button` - Botões
- `input` - Campos de texto
- `badge` - Badges de status
- `dialog` - Modais
- `select` - Dropdowns
- `popover` - Popovers
- `calendar` - Seletor de data
- `table` - Tabelas
- `label` - Labels de formulário
- `toaster` / `toast` - Notificações
- `sidebar` - Barra lateral

**Localização**: `src/components/ui/`

### 9.3 Configuração do Tailwind

```typescript
// tailwind.config.ts
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          secondary: 'var(--brand-secondary)',
          'bg-primary': 'var(--brand-bg-primary)',
          'text-primary': 'var(--brand-text-primary)',
          'text-secondary': 'var(--brand-text-secondary)',
        }
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
}
```

**CSS Variables** (index.css):
```css
:root {
  --brand-primary: #242f65;
  --brand-secondary: #1a2148;
  --brand-bg-primary: #f9fafb;
  --brand-text-primary: #1f2937;
  --brand-text-secondary: #6b7280;
}
```

---

## 10. Padrões de Código

### 10.1 Convenções de Nomenclatura

#### **Arquivos**
- Componentes: `PascalCase.tsx` (ex: `Licitacoes.tsx`)
- Hooks: `camelCase.ts` com prefixo `use` (ex: `useLicitacoes.ts`)
- Tipos: `kebab-case.ts` com sufixo `-type` (ex: `licitacao-type.ts`)
- Utilitários: `camelCase.ts` (ex: `supabase.ts`)

#### **Variáveis e Funções**
- `camelCase` para variáveis e funções
- `PascalCase` para componentes e interfaces
- `UPPER_SNAKE_CASE` para constantes globais

#### **Componentes**
```typescript
// Componente de página
export default function Licitacoes() { ... }

// Componente reutilizável
export function DataPagination({ ... }) { ... }

// Componente interno (não exportado)
function StatusBadge({ status }) { ... }
```

### 10.2 Estrutura de Arquivos

```
src/
├── components/
│   ├── auth/              # Autenticação
│   ├── dashboard/         # Específicos do dashboard
│   ├── layout/            # Layout (AppLayout, Header, Sidebar)
│   └── ui/                # shadcn/ui components
├── hooks/                 # Hooks customizados
│   ├── use-toast.ts
│   ├── useAuth.tsx
│   ├── useLicitacoes.ts
│   └── useProdutosLicitacao.ts
├── lib/                   # Utilitários e configs
│   ├── supabase.ts
│   └── utils.ts
├── pages/                 # Páginas (rotas)
│   ├── Licitacoes.tsx
│   └── LicitacoesCad.tsx
├── types/                 # Tipos TypeScript
│   ├── licitacao-type.ts
│   ├── produto-type.ts
│   └── supabase-type-*.ts
├── App.tsx                # Configuração de rotas
├── main.tsx               # Entry point
└── index.css              # CSS global
```

### 10.3 Patterns de Implementação

#### **Custom Hook Pattern**
```typescript
export function useResource() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])

  const fetchData = async () => {
    try {
      setLoading(true)
      // lógica...
      setData(result)
    } catch (error) {
      // tratamento...
    } finally {
      setLoading(false)
    }
  }

  return { loading, data, fetchData }
}
```

#### **Component Pattern**
```typescript
export default function PageComponent() {
  // 1. Hooks
  const navigate = useNavigate()
  const [state, setState] = useState()
  const { data, loading } = useQuery(...)

  // 2. Handlers
  const handleAction = async () => { ... }

  // 3. Effects
  useEffect(() => { ... }, [])

  // 4. Render
  return (
    <div>
      {loading ? <Loading /> : <Content data={data} />}
    </div>
  )
}
```

#### **Error Boundary Pattern**
```typescript
try {
  await operation()
  toast({ title: "Sucesso", ... })
} catch (error) {
  const message = handleSupabaseError(error)
  toast({ title: "Erro", description: message, variant: "destructive" })
  throw error
}
```

### 10.4 TypeScript

#### **Strict Mode**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

#### **Aliases de Caminho**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Uso**:
```typescript
import { Button } from '@/components/ui/button'
import { useLicitacoes } from '@/hooks/useLicitacoes'
```

---

## 11. Checklist de Implementação

### 11.1 Setup Inicial

- [ ] Criar projeto React com Vite
- [ ] Instalar dependências principais
  ```bash
  npm install react react-dom react-router-dom
  npm install @supabase/supabase-js
  npm install @tanstack/react-query
  npm install react-hook-form zod @hookform/resolvers
  npm install lucide-react
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```
- [ ] Configurar Tailwind CSS
- [ ] Instalar componentes shadcn/ui necessários
  ```bash
  npx shadcn-ui@latest init
  npx shadcn-ui@latest add button input badge dialog select popover calendar table label toast sidebar
  ```
- [ ] Criar arquivo `.env` com credenciais Supabase
  ```
  VITE_SUPABASE_URL=https://seu-projeto.supabase.co
  VITE_SUPABASE_ANON_KEY=sua-chave-anonima
  ```

### 11.2 Banco de Dados

- [ ] Criar tabela `tblicitacao`
- [ ] Criar tabela `tblicitacao_item`
- [ ] Criar tabela `tbproduto`
- [ ] Criar tabela `tbcliente`
- [ ] Criar foreign keys e índices
- [ ] Configurar RLS (Row Level Security) policies
- [ ] Criar função RPC `execute_sql_query` (se necessário)
- [ ] Criar storage bucket `produtos-licitacao` para imagens

### 11.3 Tipos TypeScript

- [ ] Criar `src/types/licitacao-type.ts`
- [ ] Criar `src/types/produto-type.ts`
- [ ] Criar `src/types/supabase-type-licitacao.ts`
- [ ] Criar `src/types/supabase-type-licitacao_item.ts`
- [ ] Criar `src/types/supabase-type-cliente.ts`
- [ ] Gerar tipos do Supabase (opcional)
  ```bash
  npx supabase gen types typescript --project-id seu-projeto-id > src/types/database.types.ts
  ```

### 11.4 Infraestrutura

- [ ] Criar `src/lib/supabase.ts` - Cliente Supabase
- [ ] Implementar `handleSupabaseError()` - Tratamento de erros
- [ ] Implementar `getUserIdFromTbusuario()` - Obter usuário
- [ ] Criar `src/hooks/use-toast.ts` - Sistema de notificações
- [ ] Criar `src/hooks/useAvailableHeight.ts` - Cálculo de altura
- [ ] Configurar QueryClient no `App.tsx`

### 11.5 Autenticação e Layout

- [ ] Criar `src/hooks/useAuth.tsx` - Context de autenticação
- [ ] Criar `src/components/auth/RequireAuth.tsx` - Guarda de rotas
- [ ] Criar `src/components/layout/AppLayout.tsx`
- [ ] Criar `src/components/layout/AppHeader.tsx`
- [ ] Criar `src/components/layout/AppSidebar.tsx`

### 11.6 Hooks de Dados

- [ ] Criar `src/hooks/useLicitacoes.ts`
  - [ ] Implementar `fetchLicitacoes()`
  - [ ] Implementar `fetchLicitacao()`
  - [ ] Implementar `saveLicitacao()`
  - [ ] Implementar `deleteLicitacao()`
  - [ ] Adicionar mapeamento de campos
  - [ ] Adicionar tratamento de erros
- [ ] Criar `src/hooks/useProdutosLicitacao.ts`
  - [ ] Implementar `fetchProdutos()`
  - [ ] Implementar `saveProduto()`
  - [ ] Implementar `deleteProduto()`
  - [ ] Implementar `findOrCreateProduto()`
  - [ ] Implementar `uploadImagem()`
- [ ] Criar `src/hooks/useClientes.ts`
  - [ ] Implementar `searchClientes()`

### 11.7 Componentes UI Customizados

- [ ] Criar `src/components/ui/data-pagination.tsx`
  - [ ] Navegação entre páginas
  - [ ] Seletor de itens por página
  - [ ] Indicadores de posição
- [ ] Criar `src/components/LicitacaoAnexos.tsx`
  - [ ] Upload de anexos
  - [ ] Listagem de anexos
  - [ ] Download/exclusão

### 11.8 Página de Listagem

- [ ] Criar `src/pages/Licitacoes.tsx`
  - [ ] Implementar header com título e botão "Nova"
  - [ ] Implementar barra de busca local
  - [ ] Implementar tabela de listagem
  - [ ] Implementar colunas (Ações, Lançamento, Cliente, Modalidade, Data, Status)
  - [ ] Implementar botões de ação (Ver, Editar, Excluir, Anexos)
  - [ ] Implementar badges de status com cores
  - [ ] Implementar modal de filtros avançados
  - [ ] Implementar filtros por:
    - [ ] Número de lançamento
    - [ ] Período (data inicial e final)
    - [ ] Órgão licitante
    - [ ] Cliente
    - [ ] Origem
    - [ ] Modalidade
    - [ ] Status
  - [ ] Implementar modal de busca de órgão
  - [ ] Implementar modal de busca de cliente
  - [ ] Implementar paginação
  - [ ] Implementar atualização manual (botão Refresh)
  - [ ] Implementar loading states (isLoading, isFetching)
  - [ ] Implementar modal de anexos
  - [ ] Integrar com React Query
  - [ ] Adicionar debounce na busca de órgão/cliente

### 11.9 Página de Formulário

- [ ] Criar `src/pages/LicitacoesCad.tsx`
  - [ ] Detectar modo (criação vs edição) via useParams
  - [ ] Implementar carregamento de dados em modo edição
  - [ ] Implementar seções do formulário:
    - [ ] Identificação (modalidade, tipo, número, ano)
    - [ ] Datas (abertura, homologação, vigência)
    - [ ] Relacionamentos (órgão, cliente, vendedor)
    - [ ] Processo (número, ano, administrativo, portaria)
    - [ ] Entrega (prazo, tipo, número de entregas)
    - [ ] Validades (cotação, preço)
    - [ ] Observações (geral, privada)
    - [ ] Objeto
  - [ ] Implementar busca de órgão (modal)
  - [ ] Implementar busca de cliente (modal)
  - [ ] Implementar grid de produtos
  - [ ] Implementar validação de formulário
  - [ ] Implementar salvamento (insert/update)
  - [ ] Implementar feedback visual (loading, toasts)
  - [ ] Implementar navegação após salvar
  - [ ] Adicionar campos obrigatórios com indicadores visuais

### 11.10 Grid de Produtos (Sub-componente)

- [ ] Criar componente `ProdutosGrid` ou integrar no formulário
  - [ ] Implementar tabela de produtos
  - [ ] Implementar botão "Adicionar Produto"
  - [ ] Implementar modal de produto
  - [ ] Implementar campos do produto:
    - [ ] Nome/descrição
    - [ ] Quantidade
    - [ ] Número do edital
    - [ ] Preços (referência, máximo, final, etc.)
    - [ ] PDV
    - [ ] Concorrente
    - [ ] Participa (checkbox)
    - [ ] Margem
    - [ ] Marca
    - [ ] Status
  - [ ] Implementar upload de imagem
  - [ ] Implementar exclusão de produto
  - [ ] Implementar validações
  - [ ] Sincronizar com licitação pai

### 11.11 Rotas

- [ ] Configurar rotas no `App.tsx`
  ```typescript
  <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
    <Route path="/licitacoes" element={<Licitacoes />} />
    <Route path="/licitacoes/nova" element={<LicitacoesCad />} />
    <Route path="/licitacoes/:id" element={<LicitacoesCad />} />
  </Route>
  ```
- [ ] Adicionar link no menu de navegação (AppSidebar)

### 11.12 Testes e Validação

- [ ] Testar fluxo completo:
  - [ ] Listagem carrega corretamente
  - [ ] Filtros funcionam
  - [ ] Paginação funciona
  - [ ] Busca local funciona
  - [ ] Criação de licitação
  - [ ] Edição de licitação
  - [ ] Exclusão de licitação (soft delete)
  - [ ] Adição de produtos
  - [ ] Edição de produtos
  - [ ] Exclusão de produtos
  - [ ] Upload de imagens
  - [ ] Sistema de anexos
- [ ] Testar responsividade (mobile, tablet, desktop)
- [ ] Testar loading states
- [ ] Testar error handling
- [ ] Testar validações de formulário
- [ ] Testar navegação entre páginas
- [ ] Testar persistência de preferências (itens por página)

### 11.13 Otimizações

- [ ] Implementar debounce em buscas
- [ ] Configurar staleTime e gcTime adequados
- [ ] Implementar lazy loading de componentes pesados
- [ ] Otimizar queries (índices no banco)
- [ ] Implementar cache de imagens
- [ ] Adicionar skeleton loaders
- [ ] Configurar retry policies do React Query

### 11.14 Documentação

- [ ] Documentar variáveis de ambiente
- [ ] Documentar estrutura do banco
- [ ] Documentar APIs dos hooks
- [ ] Criar guia de uso para usuários finais
- [ ] Documentar convenções de código
- [ ] Criar changelog

---

## 12. Diagramas de Fluxo

### 12.1 Fluxo de Navegação

```
┌─────────────────────────────────────────────────────────────────┐
│                        Página Inicial                           │
│                          (/home)                                │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ├──→ Menu: "Licitações"
                     │
                     ▼
         ┌─────────────────────────┐
         │   Lista de Licitações   │
         │     (/licitacoes)       │
         └────────────┬────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
    [Nova]       [Editar]     [Excluir]
         │            │            │
         ▼            ▼            ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Formulário   │ │ Formulário   │ │ Confirmação  │
│ Criação      │ │ Edição       │ │ → Refetch    │
│ (/nova)      │ │ (/:id)       │ └──────────────┘
└──────┬───────┘ └──────┬───────┘
       │                │
       └────────┬───────┘
                │
         [Salvar com sucesso]
                │
                ▼
         ┌──────────────┐
         │ Volta para   │
         │ Listagem     │
         │ ou Permanece │
         └──────────────┘
```

### 12.2 Diagrama de Estados (Listagem)

```
     [INICIAL]
         │
         ▼
    ┌─────────┐
    │ LOADING │ ← Primeira carga
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │  IDLE   │ ← Dados carregados
    └────┬────┘
         │
         ├──→ [Usuário muda filtro]
         │         │
         │         ▼
         │    ┌──────────┐
         │    │ FETCHING │ ← Background refresh
         │    └────┬─────┘
         │         │
         │         ▼
         │    ┌─────────┐
         └────┤  IDLE   │
              └────┬────┘
                   │
                   ├──→ [Erro na requisição]
                   │         │
                   │         ▼
                   │    ┌────────┐
                   │    │ ERROR  │
                   │    └────┬───┘
                   │         │
                   │    [Retry] ──┐
                   │         │    │
                   │         ▼    │
                   │    ┌──────────┐
                   └────┤ FETCHING │←┘
                        └──────────┘
```

---

## 13. Segurança e Performance

### 13.1 Segurança

#### **Row Level Security (RLS)**
```sql
-- Exemplo de policy para licitações
CREATE POLICY "Users can view own company licitacoes"
ON tblicitacao FOR SELECT
USING (
  auth.uid() IN (
    SELECT auth_user_id FROM tbusuario WHERE empresa_id = tblicitacao.empresa_id
  )
);
```

#### **Validação Server-Side**
- Todas as operações passam por validação no Supabase
- RLS policies impedem acesso não autorizado
- Campos sensíveis (obs_interno) devem ter policies restritas

#### **Sanitização de Inputs**
```typescript
// SQL injection prevention (via supabase query builder)
const { data } = await supabase
  .from('tblicitacao')
  .select()
  .eq('licitacao_id', parseInt(id)) // Garante que é número
```

### 13.2 Performance

#### **Índices Recomendados**
```sql
-- Licitações
CREATE INDEX idx_licitacao_deletado ON tblicitacao(deletado);
CREATE INDEX idx_licitacao_data ON tblicitacao(data);
CREATE INDEX idx_licitacao_status ON tblicitacao(status);
CREATE INDEX idx_licitacao_cliente ON tblicitacao(cliente_id);
CREATE INDEX idx_licitacao_orgao ON tblicitacao(orgao_id);

-- Itens
CREATE INDEX idx_licitacao_item_licitacao ON tblicitacao_item(licitacao_id);
CREATE INDEX idx_licitacao_item_produto ON tblicitacao_item(produto_id);
CREATE INDEX idx_licitacao_item_deletado ON tblicitacao_item(deletado);
```

#### **Otimizações de Query**
- Usar `select()` específico ao invés de `select('*')`
- Limitar dados retornados com `.limit()`
- Usar paginação sempre que possível
- Evitar N+1 queries (usar JOINs ou `select('*, relacionamento(campos)')`)

#### **Cache Strategy**
```typescript
// React Query cache config
{
  staleTime: 5 * 60 * 1000,  // 5 minutos (dados considerados fresh)
  gcTime: 10 * 60 * 1000,    // 10 minutos (mantém em cache)
  refetchOnWindowFocus: false // Não refetch ao focar janela
}
```

#### **Lazy Loading**
```typescript
// Carregar componente pesado só quando necessário
const LicitacoesCad = lazy(() => import('./pages/LicitacoesCad'))

<Suspense fallback={<Loading />}>
  <LicitacoesCad />
</Suspense>
```

---

## 14. Adaptações para Novo Projeto

### 14.1 Esquema de Cores

**Como adaptar**:
1. Definir novas variáveis CSS no `index.css`:
   ```css
   :root {
     --brand-primary: #SUA_COR;
     --brand-secondary: #SUA_COR;
     --brand-bg-primary: #SUA_COR;
     --brand-text-primary: #SUA_COR;
     --brand-text-secondary: #SUA_COR;
   }
   ```

2. Substituir classes hardcoded:
   - Buscar por `bg-[#242f65]` e substituir por `bg-brand-primary`
   - Buscar por `hover:bg-[#1a2148]` e substituir por `hover:bg-brand-secondary`
   - Buscar por `text-[#1f2937]` e substituir por `text-brand-text-primary`

3. Badges de status: Manter variantes (success, warning, destructive, info) e ajustar cores no tema do shadcn/ui

### 14.2 Nomenclatura e Domínio

**Termos a adaptar**:
- "Licitação" → Seu termo (ex: "Projeto", "Proposta", "Oportunidade")
- "Órgão Licitante" → Seu termo (ex: "Cliente", "Empresa")
- "Modalidade" → Seu termo (ex: "Tipo", "Categoria")
- Campos específicos do domínio público brasileiro

**Como adaptar**:
1. Fazer busca global e substituir termos
2. Ajustar labels nos componentes
3. Atualizar interfaces TypeScript
4. Revisar campos do banco de dados

### 14.3 Campos Customizados

**Para adicionar campos**:
1. Adicionar no schema do banco
2. Adicionar na interface TypeScript (`LicitacaoFormData`)
3. Adicionar no mapeamento do hook (`useLicitacoes`)
4. Adicionar no formulário (`LicitacoesCad`)
5. Adicionar nos filtros (se aplicável)

**Para remover campos**:
1. Tornar opcional na interface (`campo?: tipo`)
2. Remover do formulário
3. Manter no banco (para compatibilidade) ou criar migration

---

## 15. Extras

### 15.1 Funcionalidades Adicionais Implementadas

#### **Sistema de Anexos**
- Componente `LicitacaoAnexos`
- Upload de arquivos
- Listagem e exclusão
- Storage no Supabase

#### **Altura Dinâmica**
- Hook `useAvailableHeight`
- Tabela ocupa altura disponível
- Evita scroll duplo (página + tabela)

#### **Persistência de Preferências**
- LocalStorage para `itemsPerPage`
- Recupera ao recarregar página

#### **Debounce em Buscas**
- 500ms de debounce em busca de órgão/cliente
- Evita requisições excessivas

#### **Loading Overlay**
- Overlay translúcido durante refetch
- Não bloqueia visualização dos dados

### 15.2 Melhorias Futuras Sugeridas

- [ ] Exportação para Excel/PDF
- [ ] Gráficos e dashboards
- [ ] Filtros salvos (favoritos)
- [ ] Notificações de prazo
- [ ] Histórico de alterações (auditoria completa)
- [ ] Comentários/discussões
- [ ] Workflow de aprovação
- [ ] Integração com e-mail
- [ ] API REST/GraphQL para integrações
- [ ] Modo offline (PWA)

---

## 16. Conclusão

Esta documentação fornece uma especificação completa da funcionalidade de **Licitações** do sistema APFAR, permitindo sua reimplementação em qualquer projeto React/TypeScript moderno.

### 16.1 Resumo dos Componentes Principais

| Componente | Arquivo | Responsabilidade |
|------------|---------|------------------|
| **Listagem** | `Licitacoes.tsx` | Exibir, filtrar e gerenciar licitações |
| **Formulário** | `LicitacoesCad.tsx` | Criar/editar licitações e produtos |
| **Hook Licitações** | `useLicitacoes.ts` | CRUD de licitações |
| **Hook Produtos** | `useProdutosLicitacao.ts` | CRUD de produtos da licitação |
| **Layout** | `AppLayout.tsx` | Estrutura de página autenticada |

### 16.2 Tecnologias Core

- **React 18** + **TypeScript**
- **React Query** (gerenciamento de estado servidor)
- **Supabase** (backend, auth, storage)
- **React Router** v6 (navegação)
- **Tailwind CSS** + **shadcn/ui** (interface)
- **React Hook Form** + **Zod** (formulários)

### 16.3 Pontos de Atenção

1. **Soft Delete**: Sempre filtrar `deletado = 'N'`
2. **Auditoria**: Preencher campos de data/usuário em todas operações
3. **Tipagem**: Manter interfaces sincronizadas com banco
4. **Segurança**: Configurar RLS policies no Supabase
5. **Performance**: Usar índices e cache adequadamente
6. **UX**: Loading states e error handling em todos os fluxos

---

**Versão**: 1.0
**Data**: 2025-01-06
**Projeto**: APFAR - Sistema de Gestão de Licitações
**Autor**: Documentação gerada via Claude Code
