# Guia de Implementação — Modal de Busca de Cliente (Cobrança)

Este guia descreve a implementação do modal "Filtros adicionais" da página `/cobranca` (`src/pages/cobranca/Cobranca.tsx`), enfatizando o padrão de busca de clientes reutilizável para outras entidades. Cada seção detalha componentes, estado, integração com hooks, requisitos de UX e boas práticas adotadas no projeto.

## 1. Arquitetura e Componentes

### Estrutura geral do modal de filtros
- O modal principal utiliza `Dialog` + `DialogContent` do shadcn/ui para encapsular os filtros adicionais, garantindo consistência visual com o restante da aplicação (`src/pages/cobranca/Cobranca.tsx:500`).
- A largura responde ao viewport com `w-[92vw] md:w-[80vw] max-w-[1100px]` e altura máxima `max-h-[90vh]`, mantendo proporção 16:9 (`aspect-video`) e `overflow-auto` para rolagem interna.

### Campo numérico para código do cliente
- Implementado com `Input` `flex-1`, `inputMode="numeric"` e máscara por regex para aceitar apenas dígitos (`src/pages/cobranca/Cobranca.tsx:555`).
- O placeholder comunica claramente o formato esperado: "Código numérico do Cliente".

### Botão de pesquisa com ícone
- Utiliza `Button` variante `outline`, largura fixa (`flex-none px-2`), cor de destaque `text-brand-primary` e ícone `Search` do Lucide (`src/pages/cobranca/Cobranca.tsx:567`).
- Deve incluir `title="Pesquisar cliente"` e recomenda-se adicionar `aria-label="Pesquisar cliente"` para leitores de tela ao replicar o padrão.

### Modal secundário de busca de clientes
- Um segundo `Dialog` (`src/pages/cobranca/Cobranca.tsx:595`) é controlado por `isClienteDialogOpen`, permitindo pesquisa textual e seleção de clientes.
- `DialogContent` usa `sm:max-w-[900px] w-full max-h-[70vh] overflow-auto` para manter responsividade e usabilidade em listas extensas.

### Campo de busca textual e feedback de loading
- `Input` com placeholder "Buscar por nome..." aciona o debounce. Um container `flex gap-2` posiciona o spinner textual "Carregando..." ao lado (`src/pages/cobranca/Cobranca.tsx:603`).

### Tabela de resultados com ações
- A lista utiliza `Table`, `TableHeader`, `TableBody` e `TableRow` do shadcn/ui (`src/pages/cobranca/Cobranca.tsx:622`).
- Colunas definidas com largura relativa (`w-[50%]`, `w-[20%]`, etc.) garantem alinhamento. O botão "Selecionar" emprega `variant="ghost"`, `size="sm"`, `className="h-8 px-2"` para compacidade.

## 2. Estado e Lógica

### Estados locais envolvidos
- `draftClienteId`: mantém o código numérico digitado no filtro principal.
- `isClienteDialogOpen`: controla visibilidade do modal de busca.
- `searchCliente`: termo digitado na busca textual.
- `clientesFaturamento`: lista de resultados retornados pelo hook.
- Estados adicionais do formulário principal (`draft`) mantêm coerência com outros filtros.

### Debounce com `useRef`
- `searchClienteTimeoutRef` (`useRef<NodeJS.Timeout | null>`) guarda referência do timeout.
- Ao alterar o campo de busca, o código limpa o timeout anterior, agenda nova chamada de `handleSearchCliente` em 500ms e evita requisições redundantes (`src/pages/cobranca/Cobranca.tsx:603`–`612`).

### Sincronização entre código e nome
- Limpeza automática do campo `draft.cliente` sempre que um novo código numérico é digitado no filtro principal (`src/pages/cobranca/Cobranca.tsx:560`).
- Ao selecionar um cliente na tabela, o fluxo preenche `draftClienteId` com o `cliente_id`, atualiza `draft.cliente` com o `nome`, zera `searchCliente` e fecha o modal (`src/pages/cobranca/Cobranca.tsx:639`–`648`).

### Limpeza de timeouts
- `useEffect` monitora `isClienteDialogOpen`: ao fechar, cancela o timeout e reseta a ref (`src/pages/cobranca/Cobranca.tsx:94`).
- Um segundo `useEffect` com retorno de limpeza garante que, na desmontagem do componente, qualquer timeout pendente seja descartado (`src/pages/cobranca/Cobranca.tsx:101`).

## 3. Integração com Hooks

### `useClientes()`
- O hook fornece `loading` (renomeado localmente para `loadingClientes`) e `searchClientes` (`src/pages/cobranca/Cobranca.tsx:63`).
- `searchClientes(term, 50)` executa a query em Supabase aplicando limite de 50 registros e filtro `ilike` por nome (`src/hooks/useClientes.ts:70`).

### Função de busca `handleSearchCliente`
- Wrapper assíncrono responsável por checar `loadingClientes` e atualizar `clientesFaturamento` (`src/pages/cobranca/Cobranca.tsx:81`).
- Invocado ao abrir o modal com termo vazio para apresentar resultados iniciais (`src/pages/cobranca/Cobranca.tsx:88`).

### Tratamento de loading e erros
- O estado `loadingClientes` controla feedback visual "Carregando..." e mensagem de fallback na tabela, integrada à lógica do hook que propaga toasts em erros (`src/hooks/useClientes.ts:28`).

## 4. UX e Acessibilidade

- **Rótulos explícitos**: `Label htmlFor="f-cliente-id"` vincula o input numérico ao rótulo e reforça acessibilidade (`src/pages/cobranca/Cobranca.tsx:553`).
- **Botões acessíveis**: Utilize sempre `title` e `aria-label` nos ícones; replicar esse padrão garante compreensão para leitores de tela.
- **Placeholders informativos**: "Código numérico do Cliente" (campo numérico) e "Buscar por nome..." (busca textual) guiam o usuário sobre o tipo de dado esperado.
- **Feedback de loading**: Mensagens "Carregando..." e "Carregando clientes..." evitam sensação de travamento (`src/pages/cobranca/Cobranca.tsx:616`, `658`).
- **Mensagens de vazio**: "Nenhum cliente encontrado." fornece retorno claro quando a busca não retorna resultados.
- **Responsividade**: Utilizar `sm:max-w-[900px]`, `max-h-[70vh]`, `overflow-auto` garante uso confortável em diferentes tamanhos de tela.

## 5. Padrões de Implementação

- **Interface de dados**: Utilize a interface `Cliente` definida em `src/types/supabase-type-cliente.ts` para tipar resultados (`cliente_id`, `nome`, `cidade`, `uf`, etc.).
- **Validação de entrada**: Restrinja o campo de código a números com `inputMode="numeric"` e `replace(/[^0-9]/g, '')` para impedir caracteres inválidos.
- **Fluxo de seleção**: Selecionar um cliente deve preencher o ID, ajustar o nome nos filtros e fechar o modal, mantendo consistência com o restante da UI.
- **Integração com filtros**: Ao aplicar filtros (`onApplyFilters`), lembre-se de reiniciar a paginação (`setPage(1)`) e propagar o `draft.cliente` para o contexto global via `applyFilters`.
- **Limite de resultados**: Mantenha o limite de 50 registros por busca para preservar performance e UX.

## 6. Código de Referência

```tsx
// src/pages/cobranca/Cobranca.tsx (trechos principais)
const { loading: loadingClientes, searchClientes } = useClientes()
const [isClienteDialogOpen, setIsClienteDialogOpen] = useState(false)
const [searchCliente, setSearchCliente] = useState('')
const [clientesFaturamento, setClientesFaturamento] = useState<Cliente[]>([])
const searchClienteTimeoutRef = useRef<NodeJS.Timeout | null>(null)
const [draftClienteId, setDraftClienteId] = useState('')

const handleSearchCliente = async (term: string) => {
  if (loadingClientes) return
  const resultados = await searchClientes(term, 50)
  setClientesFaturamento(resultados)
}

<Input
  id="f-cliente-id"
  placeholder="Código numérico do Cliente"
  inputMode="numeric"
  value={draftClienteId}
  onChange={(e) => {
    const val = e.target.value.replace(/[^0-9]/g, '')
    setDraftClienteId(val)
    setDraft((d) => ({ ...d, cliente: '' }))
  }}
  className="flex-1"
/>
<Button
  type="button"
  variant="outline"
  className="flex-none px-2 text-brand-primary"
  onClick={() => setIsClienteDialogOpen(true)}
  title="Pesquisar cliente"
  aria-label="Pesquisar cliente"
>
  <Search className="h-4 w-4" />
</Button>

<Input
  placeholder="Buscar por nome..."
  value={searchCliente}
  onChange={(e) => {
    const val = e.target.value
    setSearchCliente(val)
    if (searchClienteTimeoutRef.current) clearTimeout(searchClienteTimeoutRef.current)
    searchClienteTimeoutRef.current = setTimeout(() => {
      handleSearchCliente(val)
    }, 500)
  }}
  className="flex-1"
/>
<TableRow
  key={cli.cliente_id}
  className="cursor-pointer hover:bg-gray-50"
>
  <TableCell className="font-medium">{cli.nome}</TableCell>
  <TableCell>{cli.cidade || '-'}</TableCell>
  <TableCell>{cli.uf || '-'}</TableCell>
  <TableCell className="text-center">
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2"
      onClick={() => {
        setDraftClienteId(String(cli.cliente_id))
        setDraft((prev) => ({ ...prev, cliente: cli.nome }))
        setSearchCliente('')
        setIsClienteDialogOpen(false)
      }}
    >
      Selecionar
    </Button>
  </TableCell>
</TableRow>
```

## 7. Passo a passo para reutilização

1. **Importe os componentes base** (`Dialog`, `Input`, `Button`, `Table`, `Search`) e crie o estado mínimo (`draftEntityId`, `isEntityDialogOpen`, `searchEntity`, `entities`, `timeoutRef`).
2. **Implemente o filtro principal** com campo numérico (ou específico da entidade) e botão de acionamento do modal secundário, respeitando a máscara de entrada.
3. **Construa o modal secundário** com campo de busca textual debounced, lista tabular e botão de seleção que sincroniza ID e nome com o formulário pai.
4. **Integre o hook de dados** (`useClientes` ou equivalente) para carregar registros com limite configurável e feedback de loading.
5. **Garanta a limpeza de efeitos colaterais** (timeouts e estados temporários) ao fechar o modal ou desmontar o componente.
6. **Conecte a seleção ao sistema de filtros** persistente do formulário, garantindo que aplicar/limpar filtros atualize a listagem sem inconsistências.

Seguindo estes passos, é possível replicar o padrão de busca modal para outras entidades (produtos, fornecedores, órgãos) mantendo experiência consistente, performance adequada e aderência aos padrões visuais do sistema.
