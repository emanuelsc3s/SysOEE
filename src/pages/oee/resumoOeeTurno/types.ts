export type BadgeStatusVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'
  | 'info'

export type ResumoOeeTurnoRow = {
  data?: string | null
  linhaproducao_id?: number | null
  linhaproducao?: string | null
  oeeturno_id?: number | null
  qtde_turnos?: number | null
  status_linha?: string | null
  status_turno_registrado?: string | null
  produto_id?: number | null
  produto?: string | null
  quantidade_produzida?: number | string | null
  perdas?: number | string | null
  unidades_boas?: number | string | null
  paradas_minutos?: number | string | null
  paradas_grandes_minutos?: number | string | null
  paradas_totais_minutos?: number | string | null
  paradas_estrategicas_minutos?: number | string | null
  paradas_hh_mm?: string | null
  paradas_totais_hh_mm?: string | null
  paradas_estrategicas_hh_mm?: string | null
}

export type ResumoOeeTurnoParametros = {
  p_data_inicio?: string | null
  p_data_fim?: string | null
  p_turno_id?: number | null
  p_produto_id?: number | null
  p_linhaproducao_id?: number | null
  p_oeeturno_id?: number | null
}

export type ResumoOeeTurnoLinhaNormalizada = Omit<
  ResumoOeeTurnoRow,
  | 'quantidade_produzida'
  | 'perdas'
  | 'unidades_boas'
  | 'paradas_minutos'
  | 'paradas_grandes_minutos'
  | 'paradas_totais_minutos'
  | 'paradas_estrategicas_minutos'
> & {
  quantidade_produzida: number
  perdas: number
  unidades_boas: number
  paradas_minutos: number
  paradas_grandes_minutos: number
  paradas_totais_minutos: number
  paradas_estrategicas_minutos: number
}

export type ResumoTotais = {
  quantidade: number
  perdas: number
  boas: number
  paradasGrandes: number
  paradasTotais: number
  paradasEstrategicas: number
}

export type CardResumo = {
  id: string
  titulo: string
  valor: string
  detalhe: string
  classeValor?: string
  classeCard?: string
}

export type ProdutoAgrupado = {
  id: string
  produtoId: number | null
  produto: string
  qtdeTurnos: number
  quantidade: number
  perdas: number
  unidadesBoas: number
  paradas: number
  paradasTotais: number
  paradasEstrategicas: number
}

export type LinhaAgrupada = {
  id: string
  linhaId: number | null
  linha: string
  status: string
  qtdeTurnos: number
  quantidade: number
  perdas: number
  unidadesBoas: number
  paradas: number
  paradasTotais: number
  paradasEstrategicas: number
  produtos: ProdutoAgrupado[]
}

export type ComparativoTurno = {
  id: number
  nome: string
  producao: number
  perdas: number
}
