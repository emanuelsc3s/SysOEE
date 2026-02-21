/**
 * Tipos de dados para o módulo de Ordem de Serviço de Manutenção
 * Persistência em localStorage (chave: sysoee_manutencao_ordens)
 */

/**
 * Anexo de ordem de serviço armazenado em base64
 */
export interface ManutencaoAnexo {
  /** UUID gerado no front */
  id: string
  /** Nome original do arquivo */
  nome: string
  /** MIME type do arquivo (ex: image/png, application/pdf) */
  tipo: string
  /** Tamanho em bytes */
  tamanho: number
  /** Conteúdo do arquivo codificado em base64 (data URI) */
  data_base64: string
}

/**
 * Interface para dados da Ordem de Serviço de Manutenção
 */
export interface ManutencaoOrdemServico {
  /** UUID gerado no front */
  id: string
  /** ID do turno OEE associado */
  oeeturno_id: number | null
  /** ID da linha de produção */
  linha_id: string
  /** Nome da linha de produção */
  linha_nome: string
  /** Código do SKU/produto */
  sku_codigo: string
  /** Descrição do produto */
  produto_descricao: string
  /** Data da ordem (ISO date string YYYY-MM-DD) */
  data: string
  /** Descrição detalhada da manutenção */
  descricao_manutencao: string
  /** Observações adicionais */
  observacao: string
  /** Centro de custo */
  centro_custo: string
  /** Departamento responsável */
  departamento: string
  /** Prioridade da ordem */
  prioridade: 'Baixa' | 'Média' | 'Alta' | 'Crítica'
  /** Anexos com conteúdo base64 */
  anexos: ManutencaoAnexo[]
  /** Data/hora de criação (ISO) */
  created_at: string
  /** ID do usuário que criou */
  created_by: string | null
  /** Data/hora da última atualização (ISO) */
  updated_at: string | null
  /** ID do usuário que atualizou */
  updated_by: string | null
  /** Data/hora da exclusão lógica (ISO) */
  deleted_at: string | null
  /** ID do usuário que excluiu */
  deleted_by: string | null
}

/**
 * Valores iniciais para formulário de ordem de serviço
 */
export const MANUTENCAO_INITIAL_VALUES: ManutencaoOrdemServico = {
  id: '',
  oeeturno_id: null,
  linha_id: '',
  linha_nome: '',
  sku_codigo: '',
  produto_descricao: '',
  data: '',
  descricao_manutencao: '',
  observacao: '',
  centro_custo: '',
  departamento: '',
  prioridade: 'Média',
  anexos: [],
  created_at: '',
  created_by: null,
  updated_at: null,
  updated_by: null,
  deleted_at: null,
  deleted_by: null,
}

/**
 * Opções de prioridade
 */
export const PRIORIDADE_OPTIONS = [
  { value: 'Baixa', label: 'Baixa' },
  { value: 'Média', label: 'Média' },
  { value: 'Alta', label: 'Alta' },
  { value: 'Crítica', label: 'Crítica' },
] as const

/**
 * Opções de departamento
 */
export const DEPARTAMENTO_OPTIONS = [
  { value: 'Manutenção Mecânica', label: 'Manutenção Mecânica' },
  { value: 'Manutenção Elétrica', label: 'Manutenção Elétrica' },
  { value: 'Manutenção Predial', label: 'Manutenção Predial' },
  { value: 'Utilidades', label: 'Utilidades' },
  { value: 'Produção', label: 'Produção' },
  { value: 'Qualidade', label: 'Qualidade' },
  { value: 'Engenharia', label: 'Engenharia' },
  { value: 'TI', label: 'TI' },
  { value: 'Outro', label: 'Outro' },
] as const

/**
 * Opções de centro de custo
 */
export const CENTRO_CUSTO_OPTIONS = [
  { value: 'Manutenção Corretiva', label: 'Manutenção Corretiva' },
  { value: 'Manutenção Preventiva', label: 'Manutenção Preventiva' },
  { value: 'Manutenção Preditiva', label: 'Manutenção Preditiva' },
  { value: 'Investimento', label: 'Investimento' },
  { value: 'Melhorias', label: 'Melhorias' },
  { value: 'Outro', label: 'Outro' },
] as const
