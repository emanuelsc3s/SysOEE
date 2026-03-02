export interface TurnoLog {
  oeeturnolog_id: number
  log: string
  created_at: string
  created_by: string | null
  operacao: string | null
  tabela: string | null
  registro_id: number | null
}

export interface TurnoLogComUsuario extends TurnoLog {
  usuario_nome: string
}

export interface FiltrosAuditoria {
  busca: string
  operacao: string
  tabela: string
  dataInicio: string
  dataFim: string
  createdBy: string
}

export const FILTROS_AUDITORIA_PADRAO: FiltrosAuditoria = {
  busca: '',
  operacao: '',
  tabela: '',
  dataInicio: '',
  dataFim: '',
  createdBy: '',
}

export interface UsuarioAuditoria {
  user_id: string
  nome: string
}

export interface StatsOperacoes {
  inclusoes: number
  alteracoes: number
  exclusoes: number
}
