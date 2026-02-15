export type LinhaFiltroOption = {
  linhaproducao_id: number
  linhaproducao: string | null
}

export type TurnoFiltroOption = {
  turno_id: number
  codigo: string | null
  turno: string | null
  hora_inicio: string | null
  hora_fim: string | null
}

export type ProdutoFiltroOption = {
  produto_id: number
  referencia: string | null
  descricao: string | null
}

export type ResumoOeeTurnoRpcRow = {
  data?: string | null
  linhaproducao_id?: number | null
  linhaproducao?: string | null
  oeeturno_id?: number | null
  qtde_turnos?: number | string | null
  produto_id?: number | null
  produto?: string | null
  paradas_grandes_minutos?: number | string | null
  paradas_pequenas_minutos?: number | string | null
  paradas_totais_minutos?: number | string | null
  paradas_estrategicas_minutos?: number | string | null
}

export type TurnoFiltrado = {
  oeeturno_id: number
  data: string | null
  turno_id: number | null
  turno: string | null
  linhaproducao_id: number | null
  linhaproducao: string | null
  produto_id: number | null
  produto: string | null
  status: string | null
}

export type CadastroParadaRelacionado = {
  oeeparada_id: number
  codigo: string | null
  classe: string | null
  natureza: string | null
  parada: string | null
  componente: string | null
}

export type ParadaTurnoRaw = {
  oeeturnoparada_id: number
  oeeturno_id: number
  oeeparada_id: number | null
  parada: string | null
  natureza: string | null
  classe: string | null
  hora_inicio: string | null
  hora_fim: string | null
  observacao: string | null
  data: string | null
  produto_id: number | null
  produto: string | null
  tboee_parada?: CadastroParadaRelacionado | CadastroParadaRelacionado[] | null
}

export type ParadaNormalizada = {
  id: number
  oeeturnoId: number
  data: string | null
  linhaproducaoId: number | null
  linhaproducao: string
  turnoId: number | null
  turno: string
  produtoId: number | null
  produto: string
  oeeparadaId: number | null
  codigoParada: string | null
  parada: string
  natureza: string
  classe: string
  componente: string
  observacao: string | null
  duracaoMinutos: number
  estrategica: boolean
  paradaGrande: boolean
  paradaPequena: boolean
}

export type TotaisResumoRpc = {
  paradasGrandesMinutos: number
  paradasPequenasMinutos: number
  paradasTotaisMinutos: number
  paradasEstrategicasMinutos: number
  turnosRegistrados: number
}

export type AnaliseParadasKpis = {
  tempoTotalMinutos: number
  tempoGrandesMinutos: number
  tempoPequenasMinutos: number
  tempoEstrategicasMinutos: number
  ocorrenciasTotais: number
  ocorrenciasGrandes: number
  turnosComParada: number
  linhasImpactadas: number
  indiceGrandesPercentual: number
  indicePequenasPercentual: number
  indiceEstrategicasPercentual: number
}

export type ParetoParadaItem = {
  parada: string
  quantidade: number
  tempoMinutos: number
  tempoHoras: number
  percentual: number
  percentualAcumulado: number
}

export type TendenciaParadasItem = {
  data: string
  rotuloData: string
  minutosGrandes: number
  minutosPequenas: number
  minutosEstrategicas: number
  minutosTotais: number
}

export type DistribuicaoClasseItem = {
  classe: string
  tempoMinutos: number
  quantidade: number
  percentual: number
}

export type TopNaturezaItem = {
  natureza: string
  tempoMinutos: number
  tempoHoras: number
  quantidade: number
  percentual: number
}

export type TopLinhaItem = {
  linhaproducaoId: number | null
  linhaproducao: string
  tempoMinutos: number
  tempoHoras: number
  quantidade: number
  percentual: number
}

export type PrioridadeNivel = 'Crítica' | 'Alta' | 'Média'

export type AcaoPrioritariaItem = {
  parada: string
  tempoMinutos: number
  tempoHoras: number
  quantidade: number
  mediaMinutos: number
  percentual: number
  percentualAcumulado: number
  prioridade: PrioridadeNivel
  recomendacao: string
}

export type AnaliseParadasResultado = {
  totaisResumoRpc: TotaisResumoRpc
  kpis: AnaliseParadasKpis
  pareto: ParetoParadaItem[]
  tendencia: TendenciaParadasItem[]
  distribuicaoClasse: DistribuicaoClasseItem[]
  topNaturezas: TopNaturezaItem[]
  topLinhas: TopLinhaItem[]
  acoesPrioritarias: AcaoPrioritariaItem[]
  paradasNormalizadas: ParadaNormalizada[]
  resumoExecutivo: string[]
}

