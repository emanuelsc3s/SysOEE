import type { OeeTurnoStatus } from '@/types/apontamento-oee'

export type FiltrosDashboardLinha = {
  dataInicio: string // dd/mm/aaaa
  dataFim: string // dd/mm/aaaa
  linhaIds: string[]
  turnoIds: string[]
  produtoIds: string[]
  statuses: OeeTurnoStatus[]
  lancamento: string
}

export const FILTROS_DASHBOARD_PADRAO: FiltrosDashboardLinha = {
  dataInicio: '',
  dataFim: '',
  linhaIds: [],
  turnoIds: [],
  produtoIds: [],
  statuses: [],
  lancamento: '',
}
