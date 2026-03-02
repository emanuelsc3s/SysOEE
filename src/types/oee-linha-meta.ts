/**
 * Tipos de dados para o módulo de Metas de OEE por Linha de Produção
 * Define as estruturas de dados para a tabela tblinhaproducao_meta
 */

/**
 * Interface para dados do banco de dados (tblinhaproducao_meta)
 */
export interface OeeLinhaMetaDB {
  /** ID único auto-incrementado */
  linhameta_id: number
  /** Data inicial de vigência da meta (yyyy-MM-dd) */
  data_inicio: string | null
  /** Data final de vigência da meta (yyyy-MM-dd) */
  data_fim: string | null
  /** Valor da meta */
  meta: number | string | null
  /** ID da linha de produção */
  linhaproducao_id: number | null
  /** Observação adicional */
  observacao: string | null
  /** Data/hora de criação */
  created_at: string | null
  /** UUID do usuário que criou */
  created_by: string | null
  /** Data/hora da última atualização */
  updated_at: string | null
  /** UUID do usuário que atualizou */
  updated_by: string | null
  /** Data/hora da exclusão lógica */
  deleted_at: string | null
  /** UUID do usuário que excluiu */
  deleted_by: string | null
  /** Join com linha de produção */
  tblinhaproducao?: {
    linhaproducao_id: number | null
    linhaproducao: string | null
  } | Array<{
    linhaproducao_id: number | null
    linhaproducao: string | null
  }> | null
}

/**
 * Interface para dados do formulário/UI de Meta por Linha
 */
export interface OeeLinhaMetaFormData {
  /** ID do registro (string para compatibilidade com formulário) */
  id: string
  /** ID da linha de produção */
  linhaProducaoId: number | null
  /** Nome da linha de produção para exibição */
  linhaProducaoNome: string
  /** Data inicial no padrão brasileiro (dd/MM/yyyy) */
  dataInicio: string
  /** Data final no padrão brasileiro (dd/MM/yyyy) */
  dataFim: string
  /** Meta no padrão brasileiro com 2 casas (ex.: 85,00) */
  meta: string
  /** Observação */
  observacao: string
  /** Data de criação */
  createdAt: string
  /** Usuário que criou */
  createdBy: string | null
}

/**
 * Interface para filtros de busca de metas por linha
 */
export interface FetchOeeLinhaMetaFilters {
  /** Termo de busca geral */
  searchTerm?: string
  /** Filtrar por linha de produção */
  linhaProducaoId?: number
}

/**
 * Interface de resposta para busca paginada
 */
export interface FetchOeeLinhaMetaResponse {
  data: OeeLinhaMetaFormData[]
  count: number
}

/**
 * Interface para opção de linha de produção no formulário
 */
export interface LinhaProducaoMetaOption {
  linhaproducao_id: number
  linhaproducao: string | null
}

/**
 * Valores iniciais do formulário
 */
export const OEE_LINHA_META_INITIAL_VALUES: OeeLinhaMetaFormData = {
  id: '',
  linhaProducaoId: null,
  linhaProducaoNome: '',
  dataInicio: '',
  dataFim: '',
  meta: '',
  observacao: '',
  createdAt: '',
  createdBy: null
}
