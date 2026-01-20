/**
 * Tipos de dados para Velocidade Nominal
 * CRUD para a tabela tbvelocidadenominal do Supabase
 */

/**
 * Interface para dados do banco de dados (tbvelocidadenominal)
 * Representa a estrutura exata da tabela no Supabase
 *
 * NOTA: Há inconsistência no schema original:
 * - updated_at: integer (FK para tbusuario) - deveria ser timestamp
 * - updated_by: timestamp - deveria ser integer FK
 * - deleted_at: integer (FK para tbusuario) - deveria ser timestamp
 * - deleted_by: timestamp - deveria ser integer FK
 * A implementação trata os campos conforme sua semântica correta
 */
export interface VelocidadeNominalDB {
  velocidade_id: number
  created_at: string // timestamp with time zone
  linhaproducao_id: number | null
  produto_id: number | null
  velocidade: number | null // numeric(10,2)
  observacao: string | null
  deletado: string | null // default 'N'
  sync: string | null // default 'N'
  sync_data: string | null // timestamp without time zone
  created_by: number | null // FK tbusuario
  // NOTA: Campos invertidos no schema - tratamos conforme semântica correta
  updated_at: number | null // Na verdade é updated_by (FK tbusuario)
  updated_by: string | null // Na verdade é updated_at (timestamp)
  deleted_at: number | null // Na verdade é deleted_by (FK tbusuario)
  deleted_by: string | null // Na verdade é deleted_at (timestamp)
}

/**
 * Interface para dados do banco com JOINs (linhaproducao e produto)
 */
export interface VelocidadeNominalComJoins extends VelocidadeNominalDB {
  tblinhaproducao?: {
    linhaproducao: string | null
    departamento_id: number | null
  } | null
  tbproduto?: {
    referencia: string | null
    descricao: string | null
  } | null
}

/**
 * Interface para dados do formulário/UI
 */
export interface VelocidadeNominalFormData {
  /** ID do registro (string para compatibilidade com formulário) */
  id: string
  /** ID da linha de produção */
  linhaProducaoId: number | null
  /** Nome da linha de produção (para exibição) */
  linhaProducaoNome: string
  /** ID do produto */
  produtoId: number | null
  /** Código do produto (para exibição) */
  produtoCodigo: string
  /** Descrição do produto (para exibição) */
  produtoDescricao: string
  /** Velocidade nominal (un/hora) */
  velocidade: number | null
  /** Observação */
  observacao: string | null
  /** Data de criação */
  createdAt: string
  /** Usuário que criou */
  createdBy: number | null
}

/**
 * Interface para filtros de busca
 */
export interface FetchVelocidadeNominalFilters {
  /** Termo de busca geral */
  searchTerm?: string
  /** Filtrar por ID da linha de produção */
  linhaProducaoId?: number
  /** Filtrar por ID do produto */
  produtoId?: number
}

/**
 * Interface para resposta paginada
 */
export interface FetchVelocidadesResponse {
  data: VelocidadeNominalFormData[]
  count: number
}
