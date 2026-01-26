/**
 * Tipos de dados para o módulo de Cadastro de Paradas OEE
 * Define as estruturas de dados para a tabela tboee_parada
 *
 * Estrutura da tabela no Supabase:
 * - oeeparada_id: integer (PK, auto-increment)
 * - codigo: text NOT NULL
 * - componente: text NULL
 * - classe: text NULL
 * - natureza: text NULL
 * - parada: text NULL
 * - descricao: text NULL
 * - created_at: timestamp (default now() AT TIME ZONE 'America/Fortaleza')
 * - created_by: uuid (FK auth.users)
 * - updated_at: timestamp
 * - updated_by: uuid (FK auth.users)
 * - deleted_at: timestamp
 * - deleted_by: uuid (FK auth.users)
 * - deletado: public.deletado ('S' | 'N')
 *
 * Políticas RLS:
 * - "ler": SELECT para authenticated USING (true)
 * - "Inserir": INSERT para authenticated WITH CHECK (true)
 * - "Editar": UPDATE para authenticated USING (true) WITH CHECK (true)
 */

/**
 * Interface para dados do banco de dados (tboee_parada)
 * Representa a estrutura exata da tabela no Supabase
 */
export interface OeeParadaDB {
  /** ID único auto-incrementado */
  oeeparada_id: number
  /** Código da parada (obrigatório) */
  codigo: string
  /** Componente OEE afetado: Disponibilidade, Performance ou Qualidade */
  componente: string | null
  /** Classe da parada: Planejada, Não Planejada ou Estratégica */
  classe: string | null
  /** Natureza/origem da parada: Mecânica, Elétrica, Setup, etc. */
  natureza: string | null
  /** Nome/descrição curta da parada */
  parada: string | null
  /** Descrição detalhada */
  descricao: string | null
  /** Data/hora de criação (timezone America/Fortaleza) */
  created_at: string | null
  /** UUID do usuário que criou (FK auth.users) */
  created_by: string | null
  /** Data/hora da última atualização */
  updated_at: string | null
  /** UUID do usuário que atualizou (FK auth.users) */
  updated_by: string | null
  /** Data/hora da exclusão lógica */
  deleted_at: string | null
  /** UUID do usuário que excluiu (FK auth.users) */
  deleted_by: string | null
  /** Flag de exclusão lógica: 'S' = excluído, 'N' = ativo */
  deletado: 'N' | 'S' | null
}

/**
 * Interface para dados do formulário/UI de Parada OEE
 */
export interface OeeParadaFormData {
  /** ID do registro (string para compatibilidade com formulário) */
  id: string
  /** Código da parada (obrigatório) */
  codigo: string
  /** Componente afetado pela parada */
  componente: string
  /** Classe da parada (Planejada/Não Planejada/Estratégica) */
  classe: string
  /** Natureza da parada */
  natureza: string
  /** Tipo de parada */
  parada: string
  /** Descrição detalhada */
  descricao: string
  /** Data de criação */
  createdAt: string
  /** Usuário que criou */
  createdBy: string | null
}

/**
 * Interface para filtros de busca de Paradas OEE
 */
export interface FetchOeeParadaFilters {
  /** Termo de busca geral */
  searchTerm?: string
  /** Filtrar por componente */
  componente?: string
  /** Filtrar por classe */
  classe?: string
  /** Filtrar por natureza */
  natureza?: string
}

/**
 * Interface de resposta para busca paginada
 */
export interface FetchOeeParadasResponse {
  data: OeeParadaFormData[]
  count: number
}

/**
 * Valores iniciais para formulário de parada
 */
export const OEE_PARADA_INITIAL_VALUES: OeeParadaFormData = {
  id: '',
  codigo: '',
  componente: '',
  classe: '',
  natureza: '',
  parada: '',
  descricao: '',
  createdAt: '',
  createdBy: null
}

/**
 * Opções de classe de parada
 */
export const CLASSE_PARADA_OPTIONS = [
  { value: 'Planejada', label: 'Planejada' },
  { value: 'Não Planejada', label: 'Não Planejada' },
  { value: 'Estratégica', label: 'Estratégica' }
] as const

/**
 * Opções de componente OEE afetado
 */
export const COMPONENTE_OEE_OPTIONS = [
  { value: 'Disponibilidade', label: 'Disponibilidade' },
  { value: 'Performance', label: 'Performance' },
  { value: 'Qualidade', label: 'Qualidade' }
] as const
