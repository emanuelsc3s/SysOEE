/**
 * Modal de resumo consolidado do OEE Turno.
 * Exibe KPIs e tabela a partir da RPC fn_resumo_oee_turno.
 */

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react'

import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
}

const formatadorDataPtBr = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

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

  const linhas = useMemo(() => (resumoData || []).map((linha) => ({
    ...linha,
    quantidade_produzida: normalizarNumero(linha.quantidade_produzida),
    perdas: normalizarNumero(linha.perdas),
    unidades_boas: normalizarNumero(linha.unidades_boas),
    paradas_minutos: normalizarNumero(linha.paradas_minutos),
    paradas_grandes_minutos: normalizarNumero(linha.paradas_grandes_minutos),
    paradas_totais_minutos: normalizarNumero(linha.paradas_totais_minutos),
    paradas_estrategicas_minutos: normalizarNumero(linha.paradas_estrategicas_minutos)
  })), [resumoData])

  const totais = useMemo(() => {
    return linhas.reduce((acc, linha) => {
      acc.quantidade += normalizarNumero(linha.quantidade_produzida)
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
      detalhe: 'unidades',
      classeValor: 'text-primary',
    },
    {
      id: 'perdas',
      titulo: 'Perdas totais',
      valor: formatarQuantidade(totais.perdas),
      detalhe: 'unidades',
      classeValor: 'text-destructive',
    },
    {
      id: 'boas',
      titulo: 'Unidades boas',
      valor: formatarQuantidade(totais.boas),
      detalhe: 'unidades aprovadas',
      classeValor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'paradas-grandes',
      titulo: 'Paradas grandes',
      valor: formatarMinutos(totais.paradasGrandes),
      detalhe: `${formatarDecimal(totais.paradasGrandes, 0)} min`,
    },
    {
      id: 'paradas-totais',
      titulo: 'Paradas totais',
      valor: formatarMinutos(totais.paradasTotais),
      detalhe: `${formatarDecimal(totais.paradasTotais, 0)} min`,
    },
    {
      id: 'paradas-estrategicas',
      titulo: 'Paradas estratégicas',
      valor: formatarMinutos(totais.paradasEstrategicas),
      detalhe: `${formatarDecimal(totais.paradasEstrategicas, 0)} min`,
    }
  ]), [totais])

  const erroConsulta = error ? 'Não foi possível carregar o resumo do período informado.' : null
  const totalRegistros = linhas.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[96vw] max-w-[1320px] max-h-[92vh] p-0 gap-0 overflow-hidden border-border bg-background"
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="border-b border-border bg-gradient-to-r from-primary/[0.08] via-background to-background px-4 py-4 sm:px-6">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
                Resumo consolidado de OEE
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                Consolidado de produção e paradas por linha e produto.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-md px-2.5 py-1 text-[11px] font-medium tracking-wide text-foreground"
              >
                Período: {periodoDescricao}
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-md px-2.5 py-1 text-[11px] font-medium tracking-wide"
              >
                {totalRegistros} registro(s)
              </Badge>
              {isFetching && !isLoading && (
                <Badge
                  variant="info"
                  className="rounded-md px-2.5 py-1 text-[11px] font-medium tracking-wide"
                >
                  Atualizando dados…
                </Badge>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            {!parametrosValidos && !periodoInvalido && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Informe um período válido para carregar o resumo.</p>
              </div>
            )}

            {periodoInvalido && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>A data inicial não pode ser maior que a data final.</p>
              </div>
            )}

            {erroConsulta && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{erroConsulta}</p>
              </div>
            )}

            {(isLoading || isFetching) && parametrosValidos && (
              <div
                role="status"
                aria-live="polite"
                className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando resumo…
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {cardsResumo.map((card) => (
                <Card key={card.id} className="border-border/80 bg-card/95 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                      {card.titulo}
                    </p>
                    <p
                      className={cn(
                        'mt-2 text-2xl font-semibold tracking-tight tabular-nums text-foreground',
                        card.classeValor
                      )}
                    >
                      {card.valor}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {card.detalhe}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mb-3 mt-6 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Detalhamento por linha e produto
                </h3>
                <p className="text-xs text-muted-foreground">
                  Visão por data, linha, status e SKU.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching || !parametrosValidos}
                className="min-w-[120px]"
              >
                {isFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Atualizar
              </Button>
            </div>

            <div
              className="relative overflow-auto rounded-lg border border-border bg-card"
              style={{ maxHeight: '45vh' }}
            >
              <Table className="min-w-[1120px] text-sm" aria-label="Resumo consolidado de OEE por linha e produto">
                <colgroup>
                  <col style={{ width: '7%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '9%' }} />
                  <col style={{ width: '6%' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '8%' }} />
                </colgroup>
                <TableHeader className="sticky top-0 z-10 bg-muted/70 backdrop-blur supports-[backdrop-filter]:bg-muted/60">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-11 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Data
                    </TableHead>
                    <TableHead className="h-11 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Linha
                    </TableHead>
                    <TableHead className="h-11 px-3 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="h-11 px-3 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Qtde. turnos
                    </TableHead>
                    <TableHead className="h-11 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Produto
                    </TableHead>
                    <TableHead className="h-11 px-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Produção
                    </TableHead>
                    <TableHead className="h-11 px-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Perdas
                    </TableHead>
                    <TableHead className="h-11 px-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Unidades boas
                    </TableHead>
                    <TableHead className="h-11 px-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Paradas
                    </TableHead>
                    <TableHead className="h-11 px-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Paradas totais
                    </TableHead>
                    <TableHead className="h-11 px-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Paradas estratégicas
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border">
                  {(!parametrosValidos || linhas.length === 0) && !isLoading ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={11} className="px-4 py-10 text-center text-sm text-muted-foreground">
                        {!parametrosValidos
                          ? 'Informe um período válido para carregar os dados.'
                          : 'Nenhum dado encontrado para o período informado.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    linhas.map((linha, index) => (
                      <TableRow
                        key={`${linha.data}-${linha.linhaproducao_id}-${linha.produto_id}-${index}`}
                        className="odd:bg-background even:bg-muted/[0.15] hover:bg-muted/40"
                      >
                        <TableCell className="px-3 py-2 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                          {formatarData(linha.data)}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-xs text-foreground">
                          <div className="flex flex-col gap-0.5">
                            <span className="break-words leading-tight font-medium">{linha.linhaproducao || '-'}</span>
                            <span className="text-[11px] text-muted-foreground">
                              Lançamento: {linha.oeeturno_id ?? '-'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-2 text-center text-xs text-foreground">
                          <Badge variant={getBadgeStatus(linha.status_linha)} className="mx-auto w-fit px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                            {linha.status_linha ? formatarStatus(linha.status_linha) : 'SEM STATUS'}
                          </Badge>
                          <div className="mt-1 break-words text-[11px] leading-tight text-muted-foreground">
                            {linha.status_turno_registrado ? formatarStatus(linha.status_turno_registrado) : '-'}
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-2 text-center text-xs font-medium tabular-nums text-foreground whitespace-nowrap">
                          {linha.qtde_turnos ?? 0}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-xs text-foreground">
                          <div className="flex flex-col gap-0.5">
                            <span className="break-words leading-tight" title={linha.produto || ''}>
                              {linha.produto || 'Produto não informado'}
                            </span>
                            <span className="text-[11px] text-muted-foreground">ID {linha.produto_id ?? '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-2 text-right text-xs font-medium tabular-nums text-foreground whitespace-nowrap">
                          {formatarQuantidade(normalizarNumero(linha.quantidade_produzida))}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-right text-xs font-medium tabular-nums text-destructive whitespace-nowrap">
                          {formatarQuantidade(normalizarNumero(linha.perdas))}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-right text-xs font-medium tabular-nums text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                          {formatarQuantidade(normalizarNumero(linha.unidades_boas))}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-right text-xs tabular-nums text-foreground whitespace-nowrap">
                          {linha.paradas_hh_mm || formatarMinutos(normalizarNumero(linha.paradas_minutos))}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-right text-xs tabular-nums text-foreground whitespace-nowrap">
                          {linha.paradas_totais_hh_mm || formatarMinutos(normalizarNumero(linha.paradas_totais_minutos))}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-right text-xs tabular-nums text-foreground whitespace-nowrap">
                          {linha.paradas_estrategicas_hh_mm || formatarMinutos(normalizarNumero(linha.paradas_estrategicas_minutos))}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border bg-background/95 px-4 py-3 sm:px-6 sm:justify-between sm:space-x-0">
          <p className="text-xs text-muted-foreground">
            Tempos de parada apresentados em HH:MM.
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
