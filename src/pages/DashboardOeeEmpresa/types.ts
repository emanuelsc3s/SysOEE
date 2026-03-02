export type PeriodoOeeEmpresa = {
  inicio: string
  fim: string
}

export type IndicadorHeroOeeEmpresa = {
  id: string
  titulo: string
  valor: number
  unidade: string
  cor: string
  fundo: string
  borda: string
}

export type ArcoRingOeeEmpresa = {
  id: string
  nome: string
  percentual: number
  cor: string
  raio: number
}

export type LegendaRingOeeEmpresa = {
  id: string
  nome: string
  percentual: number
  cor: string
}

export type KpiOeeEmpresa = {
  id: string
  nome: string
  percentual: number
  subtitulo: string
  cor: string
}

export type SegmentoTempoOeeEmpresa = {
  id: string
  valor: string
  larguraPercentual: number
  gradiente: string
  corTexto: string
  legenda: string
  corLegenda: string
  bordaLegenda?: string
}

export type HoraPeriodoOeeEmpresa = {
  id: string
  rotulo: string
  valor: string
  cor: string
}

export type LinhaProducaoOeeEmpresa = {
  id: string
  titulo: string
  subtitulo: string
  valor: number | string
  unidade: string
  corValor?: string
}

export type LinhaPerdaOeeEmpresa = {
  id: string
  titulo: string
  subtitulo: string
  valor: number
  corValor: string
  badge?: string
  unidade?: string
}

export type DashboardOeeEmpresaData = {
  rotuloDashboard: string
  tituloLinha: string
  periodo: PeriodoOeeEmpresa
  oeeGlobal: {
    percentual: number
    descricao: string
  }
  indicadoresHero: IndicadorHeroOeeEmpresa[]
  ring: {
    arcos: ArcoRingOeeEmpresa[]
    legenda: LegendaRingOeeEmpresa[]
  }
  kpis: KpiOeeEmpresa[]
  distribuicaoHoras: SegmentoTempoOeeEmpresa[]
  horasPeriodo: HoraPeriodoOeeEmpresa[]
  producao: LinhaProducaoOeeEmpresa[]
  perdas: LinhaPerdaOeeEmpresa[]
}
