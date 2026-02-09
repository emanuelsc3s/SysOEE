/**
 * Modal de resumo consolidado do OEE Turno.
 * Exibe KPIs e tabela a partir da RPC fn_resumo_oee_turno.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  CalendarRange,
  Loader2,
  RefreshCw,
} from 'lucide-react'

import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataPagination } from '@/components/ui/data-pagination'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ResumoOeeTurnoRow = {
  data?: string | null
  linhaproducao_id?: number | null
  linhaproducao?: string | null
  oeeturno_id?: number | null
  qtde_turnos?: number | null
  status_linha?: string | null
  status_turno_registrado?: string | null
  produto_id?: number | null
  produto?: string | null
  qtd_envase?: number | string | null
  qtd_embalagem?: number | string | null
  perdas_envase?: number | string | null
  perdas_embalagem?: number | string | null
  unidades_boas?: number | string | null
  paradas_grandes_minutos?: number | string | null
  paradas_totais_minutos?: number | string | null
  paradas_estrategicas_minutos?: number | string | null
  paradas_hh_mm?: string | null
  paradas_totais_hh_mm?: string | null
  paradas_estrategicas_hh_mm?: string | null
}

type ResumoOeeTurnoParametros = {
  p_data_inicio?: string | null
  p_data_fim?: string | null
  p_turno_id?: number | null
  p_produto_id?: number | null
  p_linhaproducao_id?: number | null
  p_oeeturno_id?: number | null
}

interface ModalResumoOeeTurnoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dataInicio: string
  dataFim: string
  parametros: ResumoOeeTurnoParametros
}

type CardResumo = {
  id: string
  titulo: string
  valor: string
  detalhe: string
  classeValor?: string
  classeCard?: string
}

const formatadorDataPtBr = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

const normalizarNumero = (valor: number | string | null | undefined): number => {
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : 0
  }

  if (valor === null || valor === undefined) {
    return 0
  }

  if (typeof valor === 'string') {
    const limpo = valor.trim().replace('%', '').replace(/\s+/g, '')
    if (!limpo) {
      return 0
    }

    if (limpo.includes(',') && limpo.includes('.')) {
      const normalizado = limpo.replace(/\./g, '').replace(',', '.')
      const parsed = Number.parseFloat(normalizado)
      return Number.isFinite(parsed) ? parsed : 0
    }

    if (limpo.includes(',')) {
      const parsed = Number.parseFloat(limpo.replace(',', '.'))
      return Number.isFinite(parsed) ? parsed : 0
    }

    const parsed = Number.parseFloat(limpo)
    return Number.isFinite(parsed) ? parsed : 0
  }

  const parsed = Number(valor)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatarQuantidade = (valor: number): string => {
  if (!Number.isFinite(valor)) return '0'
  return Math.round(valor).toLocaleString('pt-BR')
}

const formatarDecimal = (valor: number, casas = 2): string => {
  if (!Number.isFinite(valor)) return '0'
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas
  })
}

const formatarMinutos = (minutos: number): string => {
  if (!Number.isFinite(minutos)) return '00:00'
  const total = Math.max(0, Math.round(minutos))
  const horas = Math.floor(total / 60)
  const resto = total % 60
  return `${String(horas).padStart(2, '0')}:${String(resto).padStart(2, '0')}`
}

const formatarData = (dataISO?: string | null): string => {
  if (!dataISO) return '-'

  const texto = dataISO.trim()
  if (!texto) return '-'

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) {
    return texto
  }

  const apenasData = texto.split('T')[0]
  const matchIso = apenasData.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (matchIso) {
    const ano = Number(matchIso[1])
    const mes = Number(matchIso[2])
    const dia = Number(matchIso[3])
    const data = new Date(Date.UTC(ano, mes - 1, dia))
    return formatadorDataPtBr.format(data)
  }

  const data = new Date(texto)
  if (Number.isNaN(data.getTime())) {
    return texto
  }

  return formatadorDataPtBr.format(data)
}

const formatarStatus = (status?: string | null): string => {
  const valor = (status || '').trim()
  if (!valor) return '-'
  return valor.replace(/_/g, ' ')
}

const getBadgeStatus = (status: string | null | undefined):
  'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' => {
  const valor = (status || '').toUpperCase()
  if (valor.includes('FECHADA')) return 'success'
  if (valor.includes('CANCELADA')) return 'destructive'
  if (valor.includes('EM_PRODUCAO')) return 'info'
  return 'secondary'
}

const obterQuantidadeTotal = (linha: Pick<ResumoOeeTurnoRow, 'qtd_envase' | 'qtd_embalagem'>): number => {
  return normalizarNumero(linha.qtd_envase) + normalizarNumero(linha.qtd_embalagem)
}

export function ModalResumoOeeTurno({
  open,
  onOpenChange,
  dataInicio,
  dataFim,
  parametros
}: ModalResumoOeeTurnoProps) {
  const periodoDescricao = useMemo(() => {
    if (!dataInicio || !dataFim) {
      return 'Período não definido'
    }
    const inicio = formatarData(dataInicio)
    const fim = formatarData(dataFim)

    if (dataInicio === dataFim) {
      return inicio
    }
    return `${inicio} a ${fim}`
  }, [dataInicio, dataFim])

  const parametrosRpc = useMemo(() => ({
    p_data_inicio: parametros.p_data_inicio ?? null,
    p_data_fim: parametros.p_data_fim ?? null,
    p_turno_id: parametros.p_turno_id ?? null,
    p_produto_id: parametros.p_produto_id ?? null,
    p_linhaproducao_id: parametros.p_linhaproducao_id ?? null,
    p_oeeturno_id: parametros.p_oeeturno_id ?? null
  }), [parametros])

  const periodoInvalido = Boolean(
    parametrosRpc.p_data_inicio &&
    parametrosRpc.p_data_fim &&
    parametrosRpc.p_data_inicio > parametrosRpc.p_data_fim
  )

  const parametrosValidos = Boolean(parametrosRpc.p_data_inicio && parametrosRpc.p_data_fim && !periodoInvalido)

  const {
    data: resumoData,
    isLoading,
    isFetching,
    error,
    refetch
  } = useQuery({
    queryKey: ['resumo-oee-turno', parametrosRpc],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('fn_resumo_oee_turno', parametrosRpc)
      if (error) {
        throw error
      }
      return (data || []) as ResumoOeeTurnoRow[]
    },
    enabled: open && parametrosValidos,
    staleTime: 60_000
  })

  const linhas = useMemo(
    () =>
      (resumoData || []).map((linha) => {
        const perdasEnvase = normalizarNumero(linha.perdas_envase)
        const perdasEmbalagem = normalizarNumero(linha.perdas_embalagem)

        return {
          ...linha,
          qtd_envase: normalizarNumero(linha.qtd_envase),
          qtd_embalagem: normalizarNumero(linha.qtd_embalagem),
          perdas_envase: perdasEnvase,
          perdas_embalagem: perdasEmbalagem,
          perdas: perdasEnvase + perdasEmbalagem,
          unidades_boas: normalizarNumero(linha.unidades_boas),
          paradas_grandes_minutos: normalizarNumero(linha.paradas_grandes_minutos),
          paradas_totais_minutos: normalizarNumero(linha.paradas_totais_minutos),
          paradas_estrategicas_minutos: normalizarNumero(linha.paradas_estrategicas_minutos),
        }
      }),
    [resumoData]
  )

  const totais = useMemo(() => {
    return linhas.reduce((acc, linha) => {
      acc.quantidade += obterQuantidadeTotal(linha)
      acc.perdas += normalizarNumero(linha.perdas)
      acc.boas += normalizarNumero(linha.unidades_boas)
      acc.paradasGrandes += normalizarNumero(linha.paradas_grandes_minutos)
      acc.paradasTotais += normalizarNumero(linha.paradas_totais_minutos)
      acc.paradasEstrategicas += normalizarNumero(linha.paradas_estrategicas_minutos)
      return acc
    }, {
      quantidade: 0,
      perdas: 0,
      boas: 0,
      paradasGrandes: 0,
      paradasTotais: 0,
      paradasEstrategicas: 0
    })
  }, [linhas])

  const cardsResumo = useMemo<CardResumo[]>(() => ([
    {
      id: 'producao',
      titulo: 'Produção total',
      valor: formatarQuantidade(totais.quantidade),
      detalhe: 'unidades produzidas',
      classeValor: 'text-primary',
      classeCard: 'border-primary/20 bg-primary/[0.06]',
    },
    {
      id: 'perdas',
      titulo: 'Perdas totais',
      valor: formatarQuantidade(totais.perdas),
      detalhe: 'unidades descartadas',
      classeValor: 'text-destructive',
      classeCard: 'border-destructive/20 bg-destructive/[0.06]',
    },
    {
      id: 'boas',
      titulo: 'Unidades boas',
      valor: formatarQuantidade(totais.boas),
      detalhe: 'unidades aprovadas',
      classeValor: 'text-brand-secondary',
      classeCard: 'border-brand-secondary/30 bg-brand-secondary/10',
    },
    {
      id: 'paradas-grandes',
      titulo: 'Paradas grandes',
      valor: formatarMinutos(totais.paradasGrandes),
      detalhe: `${formatarDecimal(totais.paradasGrandes, 0)} min totais`,
      classeValor: 'text-foreground',
      classeCard: 'border-border bg-card',
    },
    {
      id: 'paradas-totais',
      titulo: 'Paradas totais',
      valor: formatarMinutos(totais.paradasTotais),
      detalhe: `${formatarDecimal(totais.paradasTotais, 0)} min totais`,
      classeValor: 'text-foreground',
      classeCard: 'border-border bg-card',
    },
    {
      id: 'paradas-estrategicas',
      titulo: 'Paradas estratégicas',
      valor: formatarMinutos(totais.paradasEstrategicas),
      detalhe: `${formatarDecimal(totais.paradasEstrategicas, 0)} min totais`,
      classeValor: 'text-foreground',
      classeCard: 'border-border bg-card',
    }
  ]), [totais])

  const erroConsulta = error ? 'Não foi possível carregar o resumo do período informado.' : null
  const totalRegistros = linhas.length
  const exibirSemDados = parametrosValidos && linhas.length === 0 && !isLoading
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(25)
  const paginationRef = useRef<HTMLDivElement | null>(null)

  const totalPages = Math.ceil(totalRegistros / itemsPerPage)
  const totalPagesValidas = Math.max(totalPages, 1)
  const paginaAtualExibida = Math.min(currentPage, totalPagesValidas)
  const inicioFaixaItens = totalRegistros === 0 ? 0 : (paginaAtualExibida - 1) * itemsPerPage + 1
  const fimFaixaItens = totalRegistros === 0 ? 0 : Math.min(paginaAtualExibida * itemsPerPage, totalRegistros)

  useEffect(() => {
    setCurrentPage(1)
  }, [open, parametrosRpc, totalRegistros])

  useEffect(() => {
    if (currentPage <= totalPagesValidas) {
      return
    }
    setCurrentPage(totalPagesValidas)
  }, [currentPage, totalPagesValidas])

  const linhasPaginadas = useMemo(() => {
    const inicio = (paginaAtualExibida - 1) * itemsPerPage
    return linhas.slice(inicio, inicio + itemsPerPage)
  }, [linhas, paginaAtualExibida, itemsPerPage])

  const handlePageChange = (page: number) => {
    const next = Math.max(1, Math.min(page, totalPagesValidas))
    setCurrentPage(next)
  }

  const handleItemsPerPageChange = (size: number) => {
    if (!Number.isFinite(size) || size <= 0) {
      return
    }
    setItemsPerPage(size)
    setCurrentPage(1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[95vw] max-w-[1440px] max-h-[94dvh] gap-0 overflow-hidden rounded-[1.25rem] border border-border bg-background p-0 shadow-2xl"
      >
        <div className="flex h-full min-h-0 flex-col bg-gradient-to-br from-primary/[0.05] via-background to-background">
          <div className="border-b border-border/80 bg-background/95 px-4 py-4 backdrop-blur sm:px-6 sm:py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <DialogHeader className="space-y-2 pr-8 text-left sm:pr-10">
                <DialogTitle className="text-xl font-semibold leading-tight text-foreground sm:text-2xl">
                  Resumo consolidado de OEE
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                  Consolidado de produção e paradas por linha e produto no período selecionado.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <Badge
                  variant="outline"
                  className="inline-flex items-center gap-2 rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  <CalendarRange className="h-3.5 w-3.5 text-primary/80" />
                  <span>{periodoDescricao}</span>
                </Badge>
                <Badge
                  variant="secondary"
                  className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-foreground tabular-nums"
                >
                  {totalRegistros} registro{totalRegistros !== 1 ? 's' : ''}
                </Badge>
                {isFetching && !isLoading && (
                  <div className="flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Atualizando...
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-muted/20 px-4 py-4 sm:px-6 sm:py-5">
            <div className="space-y-5">
              {!parametrosValidos && !periodoInvalido && (
                <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>Informe um período válido para carregar o resumo.</p>
                </div>
              )}

              {periodoInvalido && (
                <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>A data inicial não pode ser maior que a data final.</p>
                </div>
              )}

              {erroConsulta && (
                <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{erroConsulta}</p>
                </div>
              )}

              {(isLoading || isFetching) && parametrosValidos && (
                <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Carregando resumo do período...</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 2xl:grid-cols-6">
                {cardsResumo.map((card) => (
                  <div
                    key={card.id}
                    className={cn(
                      'rounded-xl border px-4 py-2.5 shadow-sm',
                      card.classeCard || 'border-border bg-card'
                    )}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      {card.titulo}
                    </p>
                    <p className={cn('mt-0.5 text-[1.7rem] font-semibold leading-tight tabular-nums', card.classeValor || 'text-foreground')}>
                      {card.valor}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {card.detalhe}
                    </p>
                  </div>
                ))}
              </div>

              <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border px-4 py-4 sm:px-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                    <div>
                      <h2 className="text-base font-semibold leading-tight text-foreground sm:text-lg">
                        Detalhamento por linha e produto
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Visão consolidada por data, linha, status e SKU.
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-2 md:items-end md:self-center">
                      <div className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground lg:hidden">
                        Página {paginaAtualExibida} de {totalPagesValidas}
                      </div>
                      <div className="hidden lg:flex lg:items-center lg:gap-3 lg:flex-wrap lg:justify-end">
                        <DataPagination
                          currentPage={paginaAtualExibida}
                          totalPages={totalPages}
                          onPageChange={handlePageChange}
                          itemsPerPage={itemsPerPage}
                          totalItems={totalRegistros}
                          showInfo={false}
                          className="!border-0 !bg-transparent !px-0 !py-0 !justify-end"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching || !parametrosValidos}
                        className="h-9 w-full gap-2 border-border bg-background text-foreground hover:bg-muted md:w-auto"
                      >
                        {isFetching ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        Atualizar
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="lg:hidden">
                  {!parametrosValidos || exibirSemDados ? (
                    <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                      {!parametrosValidos
                        ? 'Informe um período válido para carregar os dados.'
                        : 'Nenhum dado encontrado para o período informado.'}
                    </div>
                  ) : (
                    <div className="space-y-3 px-3 py-3">
                      {linhasPaginadas.map((linha, index) => (
                        <article
                          key={`${linha.data}-${linha.linhaproducao_id}-${linha.produto_id}-${index}`}
                          className="rounded-xl border border-border bg-background p-3 shadow-sm"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground" title={linha.linhaproducao || ''}>
                                {linha.linhaproducao || '-'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatarData(linha.data)} • Lançamento {linha.oeeturno_id ?? '-'}
                              </p>
                            </div>
                            <Badge
                              variant={getBadgeStatus(linha.status_linha)}
                              className="rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em]"
                            >
                              {linha.status_linha ? formatarStatus(linha.status_linha) : 'SEM STATUS'}
                            </Badge>
                          </div>

                          <p className="mt-2 truncate text-xs text-muted-foreground" title={linha.produto || ''}>
                            {linha.produto || 'Produto não informado'} • Cód. {linha.produto_id ?? '-'}
                          </p>

                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="rounded-lg bg-muted/50 p-2">
                              <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Produção</p>
                              <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">
                                {formatarQuantidade(obterQuantidadeTotal(linha))}
                              </p>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-2">
                              <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Perdas</p>
                              <p className="mt-1 text-sm font-semibold tabular-nums text-destructive">
                                {formatarQuantidade(normalizarNumero(linha.perdas))}
                              </p>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-2">
                              <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Unid. boas</p>
                              <p className="mt-1 text-sm font-semibold tabular-nums text-emerald-700">
                                {formatarQuantidade(normalizarNumero(linha.unidades_boas))}
                              </p>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-2">
                              <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Paradas</p>
                              <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">
                                {linha.paradas_hh_mm || formatarMinutos(normalizarNumero(linha.paradas_grandes_minutos))}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span className="rounded-md bg-muted px-2 py-1">
                              Turnos: {linha.qtde_turnos ?? 0}
                            </span>
                            <span className="rounded-md bg-muted px-2 py-1">
                              Totais: {linha.paradas_totais_hh_mm || formatarMinutos(normalizarNumero(linha.paradas_totais_minutos))}
                            </span>
                            <span className="rounded-md bg-muted px-2 py-1">
                              Estratégicas: {linha.paradas_estrategicas_hh_mm || formatarMinutos(normalizarNumero(linha.paradas_estrategicas_minutos))}
                            </span>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hidden lg:block">
                  <div className="relative overflow-auto px-1 pb-2 scrollbar-thin" style={{ maxHeight: '50vh' }}>
                    <table className="w-full min-w-[1120px] table-auto" aria-label="Resumo consolidado de OEE por linha e produto">
                      <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
                        <tr className="border-b border-border">
                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Data</th>
                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Linha</th>
                          <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Status</th>
                          <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Turnos</th>
                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Produto</th>
                          <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Produção</th>
                          <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Perdas</th>
                          <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Unid. boas</th>
                          <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Paradas</th>
                          <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Par. totais</th>
                          <th className="pl-4 pr-6 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Par. estratég.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {(!parametrosValidos || exibirSemDados) && !isLoading ? (
                          <tr>
                            <td colSpan={11} className="px-4 py-10 text-center text-sm text-muted-foreground">
                              {!parametrosValidos
                                ? 'Informe um período válido para carregar os dados.'
                                : 'Nenhum dado encontrado para o período informado.'}
                            </td>
                          </tr>
                        ) : (
                          linhasPaginadas.map((linha, index) => (
                            <tr
                              key={`${linha.data}-${linha.linhaproducao_id}-${linha.produto_id}-${index}`}
                              className="align-top transition-colors odd:bg-background even:bg-muted/30 hover:bg-muted/55"
                            >
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">
                                {formatarData(linha.data)}
                              </td>
                              <td className="px-4 py-3 text-sm text-foreground">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-semibold leading-tight">{linha.linhaproducao || '-'}</span>
                                  <span className="text-xs text-muted-foreground">
                                    Lançamento: {linha.oeeturno_id ?? '-'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center text-sm">
                                <Badge
                                  variant={getBadgeStatus(linha.status_linha)}
                                  className="rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em]"
                                >
                                  {linha.status_linha ? formatarStatus(linha.status_linha) : 'SEM STATUS'}
                                </Badge>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {linha.status_turno_registrado ? formatarStatus(linha.status_turno_registrado) : '-'}
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-center text-sm font-semibold tabular-nums text-foreground">
                                {linha.qtde_turnos ?? 0}
                              </td>
                              <td className="max-w-[320px] px-4 py-3 text-sm text-foreground">
                                <div className="flex flex-col gap-0.5">
                                  <span className="truncate" title={linha.produto || ''}>
                                    {linha.produto || 'Produto não informado'}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Cód. {linha.produto_id ?? '-'}
                                  </span>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold tabular-nums text-foreground">
                                {formatarQuantidade(obterQuantidadeTotal(linha))}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold tabular-nums text-destructive">
                                {formatarQuantidade(normalizarNumero(linha.perdas))}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold tabular-nums text-brand-secondary">
                                {formatarQuantidade(normalizarNumero(linha.unidades_boas))}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-right text-sm tabular-nums text-foreground">
                                {linha.paradas_hh_mm || formatarMinutos(normalizarNumero(linha.paradas_grandes_minutos))}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-right text-sm tabular-nums text-foreground">
                                {linha.paradas_totais_hh_mm || formatarMinutos(normalizarNumero(linha.paradas_totais_minutos))}
                              </td>
                              <td className="whitespace-nowrap pl-4 pr-6 py-3 text-right text-sm tabular-nums text-foreground">
                                {linha.paradas_estrategicas_hh_mm || formatarMinutos(normalizarNumero(linha.paradas_estrategicas_minutos))}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:hidden border-t border-border bg-background px-4 py-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      Mostrando {inicioFaixaItens} a {fimFaixaItens} de {totalRegistros}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Por página</span>
                      <select
                        value={String(itemsPerPage)}
                        className="h-9 rounded-md border border-border bg-background px-2.5 text-xs text-foreground"
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      >
                        {PAGE_SIZE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="h-10"
                      onClick={() => handlePageChange(paginaAtualExibida - 1)}
                      disabled={paginaAtualExibida <= 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10"
                      onClick={() => handlePageChange(paginaAtualExibida + 1)}
                      disabled={paginaAtualExibida >= totalPagesValidas}
                    >
                      Próxima
                    </Button>
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    Página {paginaAtualExibida} de {totalPagesValidas}
                  </p>
                </div>

                <div className="hidden lg:block">
                  <DataPagination
                    containerRef={paginationRef}
                    currentPage={paginaAtualExibida}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalRegistros}
                    showInfo
                    pageSizeOptions={PAGE_SIZE_OPTIONS as unknown as number[]}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                </div>
              </section>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border/80 bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:space-x-0 sm:px-6 sm:py-4">
          <p className="text-xs text-muted-foreground">
            Tempos de parada em HH:MM • {totalRegistros} linha{totalRegistros !== 1 ? 's' : ''}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="w-full border-border bg-background text-foreground hover:bg-muted sm:w-auto"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
