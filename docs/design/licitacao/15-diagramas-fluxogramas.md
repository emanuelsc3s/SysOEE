# Diagramas e Fluxogramas

## Fluxo de Dados Principal

```mermaid
graph TD
    A[Usuário] --> B[Componente LicitacoesCad]
    B --> C{Modo}
    C -->|Novo| D[Estado Inicial Vazio]
    C -->|Edição| E[useEffect carrega dados]
    E --> F[useLicitacoes.fetchLicitacao]
    F --> G[Supabase RPC]
    G --> H[Banco de Dados]
    H --> I[Retorna dados]
    I --> J[Atualiza formData]
    D --> K[Renderiza Formulário]
    J --> K
    K --> L[Usuário preenche]
    L --> M[handleSave]
    M --> N{Validações}
    N -->|Erro| O[Toast de Erro]
    N -->|OK| P[useLicitacoes.saveLicitacao]
    P --> Q{Tem ID?}
    Q -->|Sim| R[UPDATE no Supabase]
    Q -->|Não| S[INSERT no Supabase]
    R --> T[Toast de Sucesso]
    S --> T
    T --> U[navigate para lista]
```

## Fluxo de Soft Delete

```mermaid
sequenceDiagram
    participant U as Usuário
    participant C as Componente
    participant D as Dialog
    participant H as Hook
    participant S as Supabase
    participant DB as Banco de Dados

    U->>C: Clica em Excluir
    C->>D: Abre Dialog de Confirmação
    D->>U: Exibe mensagem
    U->>D: Confirma exclusão
    D->>C: onConfirm()
    C->>H: deleteLicitacao(id)
    H->>H: getUserIdFromTbusuario()
    H->>S: UPDATE tblicitacao SET deletado='S'
    S->>DB: Executa UPDATE
    DB->>S: Sucesso
    S->>H: Retorna sucesso
    H->>C: Toast de sucesso
    C->>U: navigate('/licitacoes')
```

## Arquitetura de Componentes

```mermaid
graph TB
    A[LicitacoesCad] --> B[Tabs]
    B --> C[Tab: Informações]
    B --> D[Tab: Concorrentes]
    B --> E[Tab: Documentos]
    B --> F[Tab: Complementar]
    
    C --> G[Card: Informações Básicas]
    C --> H[Card: Produtos]
    
    G --> I[Inputs]
    G --> J[Selects]
    G --> K[LOV Dialogs]
    
    H --> L[Table Ordenável]
    H --> M[Dialog Produto]
    
    M --> N[Tab: Básico]
    M --> O[Tab: Competição]
    M --> P[Tab: Status]
    
    K --> Q[Dialog Órgão]
    K --> R[Dialog Cliente]
    
    D --> S[Table Concorrentes]
    
    E --> T[Upload Component]
    E --> U[Documents Table]
    
    F --> V[Textarea Observações]
```

## Fluxo de LOV (List of Values)

```mermaid
sequenceDiagram
    participant U as Usuário
    participant I as Input Campo
    participant B as Botão Pesquisar
    participant D as Dialog LOV
    participant S as Supabase
    participant T as Table Resultados

    U->>B: Clica em Pesquisar
    B->>D: Abre Dialog
    D->>U: Exibe campo de busca
    U->>D: Digite termo
    Note over D: Debounce 500ms
    D->>S: Busca no Supabase
    S->>D: Retorna resultados
    D->>T: Renderiza tabela
    T->>U: Exibe resultados
    U->>T: Clica em Selecionar
    T->>I: Preenche campo com nome
    T->>I: Armazena ID no estado
    D->>D: Fecha Dialog
```

## Ciclo de Vida do Componente

```mermaid
stateDiagram-v2
    [*] --> Montagem
    Montagem --> CarregandoDados: id existe
    Montagem --> FormularioVazio: id não existe
    
    CarregandoDados --> FormularioPreenchido: dados carregados
    CarregandoDados --> Erro: erro ao carregar
    
    FormularioVazio --> Editando: usuário preenche
    FormularioPreenchido --> Editando: usuário altera
    
    Editando --> Validando: clica em Salvar
    Validando --> Erro: validação falha
    Validando --> Salvando: validação OK
    
    Salvando --> Sucesso: salvo com sucesso
    Salvando --> Erro: erro ao salvar
    
    Sucesso --> [*]: navega para lista
    Erro --> Editando: usuário corrige
    
    Editando --> Excluindo: clica em Excluir
    Excluindo --> ConfirmandoExclusao: abre dialog
    ConfirmandoExclusao --> Editando: cancela
    ConfirmandoExclusao --> Excluido: confirma
    Excluido --> [*]: navega para lista
```

## Estrutura de Dados

```mermaid
erDiagram
    TBLICITACAO ||--o{ TBLICITACAO_ITEM : contem
    TBLICITACAO }o--|| TBCLIENTE : "orgao_id"
    TBLICITACAO }o--|| TBCLIENTE : "cliente_id"
    TBLICITACAO_ITEM }o--|| TBPRODUTO : "produto_id"
    TBLICITACAO_ITEM }o--o| TBCONCORRENTE : "concorrente_id"
    
    TBLICITACAO {
        int licitacao_id PK
        int orgao_id FK
        int cliente_id FK
        date data
        string modalidade
        string status
        char deletado
    }
    
    TBLICITACAO_ITEM {
        int litem_id PK
        int licitacao_id FK
        int produto_id FK
        int concorrente_id FK
        decimal quantidade
        decimal preco
        char deletado
    }
    
    TBPRODUTO {
        int produto_id PK
        string descricao
        char deletado
    }
    
    TBCLIENTE {
        int cliente_id PK
        string nome
        string cidade
        char deletado
    }
    
    TBCONCORRENTE {
        int concorrente_id PK
        string razao_social
        char deletado
    }
```

## Fluxo de Upload de Documentos

```mermaid
graph LR
    A[Usuário seleciona arquivo] --> B{Validar tamanho}
    B -->|> 100MB| C[Erro: arquivo muito grande]
    B -->|<= 100MB| D[Arquivo válido]
    D --> E{Licitação salva?}
    E -->|Não| F[Erro: salve primeiro]
    E -->|Sim| G[Upload para Storage]
    G --> H[Supabase Storage]
    H --> I{Sucesso?}
    I -->|Não| J[Toast de erro]
    I -->|Sim| K[Atualiza lista]
    K --> L[Toast de sucesso]
```

## Padrão de Ordenação de Tabela

```mermaid
stateDiagram-v2
    [*] --> SemOrdenacao
    SemOrdenacao --> OrdenacaoAsc: clica em coluna
    OrdenacaoAsc --> OrdenacaoDesc: clica mesma coluna
    OrdenacaoDesc --> SemOrdenacao: clica mesma coluna
    OrdenacaoAsc --> OrdenacaoAsc: clica outra coluna
    OrdenacaoDesc --> OrdenacaoAsc: clica outra coluna
    
    note right of SemOrdenacao
        Dados na ordem original
    end note
    
    note right of OrdenacaoAsc
        Dados ordenados A-Z
        Ícone: ArrowUp
    end note
    
    note right of OrdenacaoDesc
        Dados ordenados Z-A
        Ícone: ArrowDown
    end note
```

## Fluxo de Validação

```mermaid
flowchart TD
    A[handleSave] --> B{Campos obrigatórios preenchidos?}
    B -->|Não| C[Toast: campo obrigatório]
    B -->|Sim| D{IDs selecionados via LOV?}
    D -->|Não| E[Toast: selecione via pesquisa]
    D -->|Sim| F{Formato de datas válido?}
    F -->|Não| G[Toast: formato inválido]
    F -->|Sim| H{Tamanho dos campos OK?}
    H -->|Não| I[Truncar campos]
    H -->|Sim| J[Normalizar datas vazias]
    I --> J
    J --> K[Chamar saveLicitacao]
    K --> L{Sucesso?}
    L -->|Não| M[Toast: erro ao salvar]
    L -->|Sim| N[Toast: sucesso]
    N --> O[navigate para lista]
    C --> P[Retornar]
    E --> P
    G --> P
    M --> P
```

## Hierarquia de Estados

```mermaid
graph TD
    A[Estado Global] --> B[formData]
    A --> C[produtos]
    A --> D[documentos]
    A --> E[UI States]
    
    B --> B1[Campos da licitação]
    B --> B2[IDs de relacionamento]
    
    C --> C1[Array de produtos]
    C --> C2[produtoForm]
    C --> C3[currentProduto]
    
    D --> D1[Array de documentos]
    D --> D2[selectedFile]
    
    E --> E1[activeTab]
    E --> E2[Dialog states]
    E --> E3[Loading states]
    E --> E4[Sort states]
    
    E2 --> E2A[isProdutoDialogOpen]
    E2 --> E2B[isOrgaoDialogOpen]
    E2 --> E2C[isDeleteDialogOpen]
    
    E3 --> E3A[loading]
    E3 --> E3B[loadingProdutos]
    E3 --> E3C[uploadingDocumento]
    
    E4 --> E4A[sortField]
    E4 --> E4B[sortDirection]
```

