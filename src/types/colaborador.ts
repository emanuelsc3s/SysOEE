/**
 * Tipos de dados para o módulo de Colaboradores e Treinamentos
 * Define as estruturas de dados para perfil de colaborador e seus treinamentos em POs
 */

/**
 * Status do treinamento de PO
 */
export type StatusTreinamento = 'Concluído' | 'Pendente' | 'Vencido'

/**
 * Configuração visual dos status de treinamento
 */
export interface ConfigStatusTreinamento {
  /** Cor principal do status (hex) */
  cor: string
  /** Nome do ícone Lucide React */
  icone: string
  /** Classes Tailwind para badge */
  badgeClass: string
  /** Classes Tailwind para texto */
  textClass: string
}

/**
 * Configuração de cores e estilos para cada status de treinamento
 */
export const STATUS_TREINAMENTO_CONFIG: Record<StatusTreinamento, ConfigStatusTreinamento> = {
  'Concluído': {
    cor: '#16A34A',
    icone: 'CheckCircle2',
    badgeClass: 'bg-green-600 text-white',
    textClass: 'text-green-700'
  },
  'Pendente': {
    cor: '#F59E0B',
    icone: 'Clock',
    badgeClass: 'bg-orange-600 text-white',
    textClass: 'text-orange-700'
  },
  'Vencido': {
    cor: '#DC2626',
    icone: 'AlertCircle',
    badgeClass: 'bg-red-600 text-white',
    textClass: 'text-red-700'
  }
}

/**
 * Interface para Colaborador
 */
export interface Colaborador {
  /** ID único do colaborador (matrícula) */
  id: string

  /** Nome completo do colaborador */
  nome: string

  /** Cargo/função do colaborador */
  cargo: string

  /** Setor de atuação */
  setor: string

  /** URL da foto/avatar (opcional) */
  fotoUrl?: string

  /** Email do colaborador (opcional) */
  email?: string

  /** Data de admissão (formato ISO) */
  dataAdmissao?: string
}

/**
 * Interface para Treinamento de PO
 */
export interface Treinamento {
  /** ID único do treinamento */
  id: string

  /** Código do PO */
  codigoPO: string

  /** Título/nome do PO */
  tituloPO: string

  /** Versão do documento */
  versao: string

  /** Status do treinamento */
  status: StatusTreinamento

  /** Data de conclusão (formato ISO) - presente quando status = 'Concluído' */
  dataConclusao?: string

  /** Data de validade do treinamento (formato ISO) */
  dataValidade?: string

  /** Carga horária do treinamento em horas */
  cargaHoraria: number

  /** URL do certificado (quando disponível) */
  certificadoUrl?: string

  /** ID do colaborador */
  colaboradorId: string
}

/**
 * Critérios de ordenação disponíveis
 */
export type CriterioOrdenacao = 'vencimento' | 'titulo' | 'recentes'

/**
 * Interface para preferências do usuário (localStorage)
 */
export interface PreferenciasColaborador {
  /** Última aba/status selecionado */
  ultimoStatus?: StatusTreinamento | 'Todos'

  /** Último critério de ordenação */
  ultimaOrdenacao?: CriterioOrdenacao

  /** Último termo de busca */
  ultimaBusca?: string
}

/**
 * Interface para contadores/KPIs de treinamentos
 */
export interface ContadoresTreinamento {
  /** Total de POs atribuídos */
  total: number

  /** Total de POs concluídos */
  concluidos: number

  /** Total de POs pendentes */
  pendentes: number

  /** Total de POs vencidos */
  vencidos: number
}

/**
 * Calcula o status de um treinamento baseado nas datas
 * @param dataConclusao - Data de conclusão (se houver)
 * @param dataValidade - Data de validade
 * @returns Status calculado
 */
export function calcularStatusTreinamento(
  dataConclusao?: string,
  dataValidade?: string
): StatusTreinamento {
  // Se tem data de conclusão, está concluído
  if (dataConclusao) {
    return 'Concluído'
  }

  // Se não tem data de validade, considera pendente
  if (!dataValidade) {
    return 'Pendente'
  }

  // Verifica se está vencido
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  const validade = new Date(dataValidade)
  validade.setHours(0, 0, 0, 0)

  if (validade < hoje) {
    return 'Vencido'
  }

  return 'Pendente'
}

/**
 * Calcula dias restantes até vencimento ou dias expirados
 * @param dataValidade - Data de validade
 * @returns Objeto com dias e se está vencido
 */
export function calcularDiasVencimento(dataValidade?: string): {
  dias: number
  vencido: boolean
  texto: string
} {
  if (!dataValidade) {
    return { dias: 0, vencido: false, texto: 'Sem prazo definido' }
  }

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  const validade = new Date(dataValidade)
  validade.setHours(0, 0, 0, 0)

  const diffTime = validade.getTime() - hoje.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    const diasVencidos = Math.abs(diffDays)
    return {
      dias: diasVencidos,
      vencido: true,
      texto: `Vencido há ${diasVencidos} ${diasVencidos === 1 ? 'dia' : 'dias'}`
    }
  }

  if (diffDays === 0) {
    return { dias: 0, vencido: false, texto: 'Vence hoje' }
  }

  return {
    dias: diffDays,
    vencido: false,
    texto: `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'} restantes`
  }
}

/**
 * Calcula contadores de treinamentos por status
 * @param treinamentos - Lista de treinamentos
 * @returns Contadores calculados
 */
export function calcularContadores(treinamentos: Treinamento[]): ContadoresTreinamento {
  return {
    total: treinamentos.length,
    concluidos: treinamentos.filter(t => t.status === 'Concluído').length,
    pendentes: treinamentos.filter(t => t.status === 'Pendente').length,
    vencidos: treinamentos.filter(t => t.status === 'Vencido').length
  }
}

