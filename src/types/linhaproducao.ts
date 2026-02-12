/**
 * Tipos relacionados a Linhas de Produção
 */

/**
 * Interface para Linha de Produção
 */
export interface LinhaProducao {
  /** ID único da linha de produção */
  linhaproducao_id: number
  /** Nome da linha de produção */
  linhaproducao: string | null
  /** Segmento da câmera (sem barras no início/fim), ex: cam_spep02_linha_d */
  camera: string | null
  /** ID do departamento/setor */
  departamento_id: number | null
  /** Nome do departamento (join) */
  departamento?: string | null
  /** Status ativo/inativo */
  ativo: string | null
  /** Tipo da linha (envase, embalagem, etc) */
  tipo: string | null
  /** Data de criação */
  created_at: string
  /** ID do usuário que criou */
  created_by: number | null
  /** Data de atualização */
  updated_at: string | null
  /** ID do usuário que atualizou */
  updated_by: number | null
  /** Data de exclusão (soft delete) */
  deleted_at: string | null
  /** ID do usuário que excluiu */
  deleted_by: number | null
  /** Flag de sincronização */
  sync: string | null
  /** Data de sincronização */
  sync_data: string | null
}

/**
 * Interface para resposta paginada de linhas de produção
 */
export interface LinhasProducaoResponse {
  /** Lista de linhas de produção */
  data: LinhaProducao[]
  /** Total de registros */
  total: number
  /** Página atual */
  page: number
  /** Itens por página */
  itemsPerPage: number
}

