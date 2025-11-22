# Tipos TypeScript e Schemas de Validação

## Tipos de Dados

### 1. LicitacaoFormData

Interface principal para dados de licitação:

```typescript
// src/types/licitacao-type.ts

export interface LicitacaoFormData {
  // Identificação
  id?: string;
  
  // Datas
  dataAbertura: string | null;
  horaAbertura: string;
  dataVigenciaPreco: string | null;
  dataHomologacao: string | null;
  dataValidadeCotacao: string | null;
  
  // Vigência
  vigenciaInicial: string | null;
  vigenciaFinal: string | null;
  vigenciaMeses: string;
  
  // Informações Básicas
  origem: string;
  status: string;
  tipo: string;
  modalidade: string;
  modalidadeNumero: string;
  modalidadeAno: string;
  
  // Processo
  processoNumero: string;
  processoAno: string;
  processoAdministrativo: string;
  processoAdministrativoAno: string;
  
  // Órgão e Cliente (com IDs para relacionamento)
  orgaoLicitante: string;
  orgaoId?: number | null;
  orgaoNome?: string;
  cliente: string;
  clienteId?: number | null;
  
  // Entrega
  numeroEntregas: string;
  prazoEntregaDias: string;
  tipoEntrega: string;
  
  // Outros
  vendedor: string;
  sitePortal: string;
  portariaLicitatoriaNumero: string;
  portariaAno: string;
  licitacaoOrigem: string;
  objeto: string;
  
  // Observações
  observacaoGeral: string;
  observacaoPrivada: string;
}
```

### 2. ProdutoFormData

Interface para produtos da licitação:

```typescript
// src/types/produto-type.ts

export interface ProdutoFormData {
  // Identificação
  id?: string;
  produto_id?: number;
  
  // Informações Básicas
  nome: string;
  marca: string;
  numeroEdital: string;
  
  // Quantidades
  quantidade: number;
  qtde_pedido: number;
  qtde_nf: number;
  
  // Preços
  precoReferencia: number;
  precoMaximo: number;
  precoFinal: number;
  precoAplicado: number;
  preco_inicial: number;
  preco_ganho: number;
  precoConcorrente: number;
  pdv: number;
  margem: number;
  
  // Concorrente
  concorrente: string;
  concorrente_id?: number | null;
  
  // Status e Resultado
  status: string;
  resultado: string;
  participa: boolean;
  
  // Motivo de Perda
  motivoPerda: string;
  motivoperda_id?: number | null;
  motivoperda: string;
  
  // Imagem
  imagemUrl: string;
  imagemFile: File | null;
  
  // Sincronização
  sync: string;
  sync_data?: string | null;
}
```

### 3. Tipos do Supabase

#### Estrutura da Tabela TBLICITACAO

```typescript
// Mapeamento dos campos do banco para o formulário

interface TBLicitacaoDB {
  licitacao_id: number;
  data: string | null;
  hora: string | null;
  origem: string;
  status: string;
  vigencia_ini: string | null;
  vigencia_data: string | null;
  vigencia: number | null;
  vendedor_id: number | null;
  garantia_preco: string | null;
  homologacao: string | null;
  orgao_id: number | null;
  cliente_id: number | null;
  tipo: string;
  modalidade: string;
  modalidade_id: number | null;
  modalidade_numero: string;
  modalidade_ano: string;
  processo: string;
  processo_ano: string;
  validade_cotacao: string | null;
  entregas: number | null;
  entrega: number | null;
  tipo_entrega: string;
  processo_admin: string;
  processo_admin_ano: string;
  site: string;
  portaria: string;
  portaria_ano: string;
  licitacao_origem: number | null;
  obs: string;
  obs_interno: string;
  objeto: string;
  participa: string;
  deletado: string;
  data_inc: string;
  usuario_i: number;
  data_alt: string | null;
  usuario_a: number | null;
  data_del: string | null;
  usuario_d: number | null;
  sync: string;
}
```

#### Estrutura da Tabela TBLICITACAO_ITEM

```typescript
interface TBLicitacaoItemDB {
  litem_id: number;
  licitacao_id: number;
  produto_id: number;
  quantidade: number;
  preco: number;
  marca: string;
  item_edital: string | null;
  preco_maximo: number | null;
  preco_final: number | null;
  pdv: number | null;
  preco_concorrente: number | null;
  participa: string;
  margem: number | null;
  preco_inicial: number | null;
  preco_ganho: number | null;
  concorrente_id: number | null;
  status: string;
  qtde_pedido: number | null;
  qtde_nf: number | null;
  resultado: string | null;
  motivoperda_id: number | null;
  motivoperda: string | null;
  deletado: string;
  data_inc: string;
  usuario_i: number;
  data_alt: string | null;
  usuario_a: number | null;
  data_del: string | null;
  usuario_d: number | null;
  sync: string;
  sync_data: string | null;
}
```

### 4. Tipos Auxiliares

#### Tipo para Modo do Dialog

```typescript
type DialogMode = 'create' | 'edit' | 'view'
```

#### Tipo para Campos Ordenáveis

```typescript
type SortField = 
  | 'nome' 
  | 'quantidade' 
  | 'numeroEdital' 
  | 'precoReferencia' 
  | 'precoMaximo' 
  | 'precoFinal' 
  | 'pdv' 
  | 'precoConcorrente' 
  | 'concorrente' 
  | 'margem'
```

#### Tipo para Direção de Ordenação

```typescript
type SortDirection = 'asc' | 'desc' | null
```

### 5. Validação Manual (sem Zod)

O componente implementa validação manual ao invés de usar Zod:

```typescript
// Validação de campos obrigatórios
const validateForm = (): boolean => {
  // Validar órgão licitante
  if (!formData.orgaoLicitante.trim()) {
    toast({
      variant: "destructive",
      title: "Validação",
      description: "É obrigatório selecionar um órgão licitante.",
    });
    return false;
  }

  // Validar se ID foi selecionado
  if (!formData.orgaoId) {
    toast({
      variant: "destructive",
      title: "Validação",
      description: "Por favor, selecione um órgão licitante através do botão de pesquisa.",
    });
    return false;
  }

  return true;
}

// Validação de formato de data
const isValidDateStr = (s: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}$/.test(s)
}

// Validação de datas
const validateDates = (data: LicitacaoFormData): string | null => {
  const camposData = [
    'dataAbertura',
    'vigenciaInicial',
    'vigenciaFinal',
    'dataVigenciaPreco',
    'dataHomologacao',
    'dataValidadeCotacao'
  ]

  for (const campo of camposData) {
    const valor = data[campo as keyof LicitacaoFormData]
    
    if (valor === '' || valor === undefined || valor === null) {
      continue // Campo vazio é válido
    }
    
    if (typeof valor === 'string' && !isValidDateStr(valor)) {
      return `Formato de data inválido em "${campo}". Use AAAA-MM-DD ou deixe em branco.`
    }
  }

  return null
}

// Limitar tamanho de campos
const limitesCampos: Record<string, number> = {
  numero: 50,
  horaAbertura: 5,
  origem: 50,
  status: 30,
  modalidade: 30,
  modalidadeNumero: 50,
  modalidadeAno: 4,
  processoNumero: 50,
  processoAno: 4,
  tipo: 30,
  tipoEntrega: 30,
  processoAdministrativo: 50,
  processoAdministrativoAno: 4,
  sitePortal: 250,
  portariaLicitatoriaNumero: 50,
  portariaAno: 4,
  observacaoGeral: 4000,
  observacaoPrivada: 4000,
  objeto: 100
}

const applyFieldLimits = (data: LicitacaoFormData): LicitacaoFormData => {
  const result = { ...data }
  
  Object.entries(limitesCampos).forEach(([campo, tamanho]) => {
    const valor = result[campo as keyof LicitacaoFormData]
    if (typeof valor === 'string' && valor.length > 0) {
      result[campo as keyof LicitacaoFormData] = valor.substring(0, tamanho) as any
    }
  })
  
  return result
}
```

### 6. Type Guards

```typescript
// Verificar se uma chave é válida
function isKeyOf<T extends object>(
  key: string | number | symbol,
  obj: T
): key is keyof T {
  return key in obj
}

// Uso
if (isKeyOf(campo, dadosParaSalvar)) {
  dadosParaSalvar[campo] = valor
}
```

### 7. Mapeamento de Dados

```typescript
// Converter dados do formulário para o banco
const mapFormToDatabase = (formData: LicitacaoFormData): TBLicitacaoDB => {
  return {
    data: formData.dataAbertura,
    hora: formData.horaAbertura?.substring(0, 5) || null,
    origem: formData.origem?.substring(0, 50) || "",
    status: formData.status?.substring(0, 30) || "",
    // ... outros campos
  }
}

// Converter dados do banco para o formulário
const mapDatabaseToForm = (dbData: TBLicitacaoDB): LicitacaoFormData => {
  return {
    id: dbData.licitacao_id.toString(),
    dataAbertura: dbData.data || '',
    horaAbertura: dbData.hora || '',
    origem: dbData.origem || '',
    // ... outros campos
  }
}
```

