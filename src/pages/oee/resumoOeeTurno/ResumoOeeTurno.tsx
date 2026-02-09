import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Filter, Loader2, RefreshCw, Search, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { AppHeader } from '@/components/layout/AppHeader'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { PeriodoSelector } from './components/PeriodoSelector'
import { ResumoDetalhamentoTable } from './components/ResumoDetalhamentoTable'
import { ResumoKpis } from './components/ResumoKpis'
import { useResumoOeeTurno } from './hooks/useResumoOeeTurno'
import { agruparLinhasResumo, criarCardsResumo } from './utils/aggregations'
import { converterDataBrParaIso, obterDataAtualFormatada } from './utils/date'
import {
  construirContextoInsight,
  criarChaveInsightSessao,
  gerarInsight,
  type InsightGerado,
  type InsightTipo,
  lerInsightsUsados,
  salvarInsightsUsados,
} from './utils/insights'

const INSIGHT_PLACEHOLDER =
  'Clique em "Gerar insight" para obter uma análise rápida dos dados (sem uso de IA externa).'

const INSIGHT_TIPO_CONFIG: Record<InsightTipo, { label: string; badge: 'warning' | 'success' | 'destructive' | 'info' }> = {
  warning: { label: 'Atenção', badge: 'warning' },
  success: { label: 'Positivo', badge: 'success' },
  critical: { label: 'Crítico', badge: 'destructive' },
  info: { label: 'Informativo', badge: 'info' },
}

const INSIGHT_ETAPAS = [
  { id: 'coletando', label: 'Coletando dados' },
  { id: 'analisando', label: 'Analisando' },
  { id: 'preparando', label: 'Preparando insight...' },
] as const

type InsightEtapaId = (typeof INSIGHT_ETAPAS)[number]['id']

const INSIGHT_ETAPA_PROGRESSO: Record<InsightEtapaId, number> = {
  coletando: 0.22,
  analisando: 0.6,
  preparando: 0.88,
}

export default function ResumoOeeTurno() {
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const dataAtualInicialRef = useRef(obterDataAtualFormatada())
  const filtrosIniciais = useRef({
    linha: '',
    produto: '',
    status: '',
  })
  const insightTimersRef = useRef<number[]>([])
  const insightEmProcessoRef = useRef(false)
  const insightResetRef = useRef<{
    dataInicioIso?: string
    dataFimIso?: string
    insightSessaoKey: string
  }>({
    dataInicioIso: undefined,
    dataFimIso: undefined,
    insightSessaoKey: '',
  })

  const user = {
    name: authUser?.usuario || authUser?.email?.split('@')[0] || 'Usuário',
    initials: (authUser?.usuario || authUser?.email)?.substring(0, 2).toUpperCase() || 'U',
    role: authUser?.perfil || 'Operador',
  }

  const [dataInicio, setDataInicio] = useState(dataAtualInicialRef.current)
  const [dataFim, setDataFim] = useState(dataAtualInicialRef.current)
  const [linhasExpandidas, setLinhasExpandidas] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [openFilterDialog, setOpenFilterDialog] = useState(false)
  const [draftFilters, setDraftFilters] = useState(() => ({ ...filtrosIniciais.current }))
  const [appliedFilters, setAppliedFilters] = useState(() => ({ ...filtrosIniciais.current }))
  const [insightAtual, setInsightAtual] = useState<InsightGerado | null>(null)
  const [insightAviso, setInsightAviso] = useState(INSIGHT_PLACEHOLDER)
  const [insightModalOpen, setInsightModalOpen] = useState(false)
  const [insightCarregando, setInsightCarregando] = useState(false)
  const [insightEtapa, setInsightEtapa] = useState<InsightEtapaId>('coletando')
  const [insightProgresso, setInsightProgresso] = useState(0)

  const dataInicioIso = converterDataBrParaIso(dataInicio)
  const dataFimIso = converterDataBrParaIso(dataFim)
  const insightSessaoKey = useMemo(() => criarChaveInsightSessao(authUser?.id), [authUser?.id])

  const {
    linhas,
    totais,
    parametrosValidos,
    periodoInvalido,
    resumoAtualizadoEm,
    isLoading,
    isFetching,
    erroConsulta,
    refetch,
  } = useResumoOeeTurno({
    dataInicioIso,
    dataFimIso,
  })

  const statusOptions = useMemo(() => {
    return Array.from(
      new Set(
        linhas
          .map((linha) => (linha.status_linha || '').trim())
          .filter((status) => status.length > 0)
      )
    ).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [linhas])

  const termoBuscaNormalizado = searchTerm.trim().toLowerCase()

  const linhasFiltradas = useMemo(() => {
    const filtroLinha = appliedFilters.linha.trim().toLowerCase()
    const filtroProduto = appliedFilters.produto.trim().toLowerCase()
    const filtroStatus = appliedFilters.status.trim().toLowerCase()

    return linhas.filter((linha) => {
      const nomeLinha = (linha.linhaproducao || '').toLowerCase()
      const nomeProduto = (linha.produto || '').toLowerCase()
      const status = (linha.status_linha || '').toLowerCase()
      const produtoId = linha.produto_id != null ? String(linha.produto_id) : ''
      const qtdeTurnos = linha.qtde_turnos != null ? String(linha.qtde_turnos) : ''
      const lancamento = linha.oeeturno_id != null ? String(linha.oeeturno_id) : ''

      const atendeBusca =
        !termoBuscaNormalizado ||
        nomeLinha.includes(termoBuscaNormalizado) ||
        nomeProduto.includes(termoBuscaNormalizado) ||
        status.includes(termoBuscaNormalizado) ||
        produtoId.includes(termoBuscaNormalizado) ||
        qtdeTurnos.includes(termoBuscaNormalizado) ||
        lancamento.includes(termoBuscaNormalizado)

      if (!atendeBusca) {
        return false
      }

      if (filtroLinha && !nomeLinha.includes(filtroLinha)) {
        return false
      }

      if (filtroProduto && !nomeProduto.includes(filtroProduto)) {
        return false
      }

      if (filtroStatus && status !== filtroStatus) {
        return false
      }

      return true
    })
  }, [appliedFilters.linha, appliedFilters.produto, appliedFilters.status, linhas, termoBuscaNormalizado])

  const linhasAgrupadas = useMemo(() => agruparLinhasResumo(linhasFiltradas), [linhasFiltradas])
  const cardsResumo = useMemo(() => criarCardsResumo(totais), [totais])
  const contextoInsight = useMemo(
    () => construirContextoInsight(linhasFiltradas, linhasAgrupadas),
    [linhasFiltradas, linhasAgrupadas]
  )
  const appliedCount = useMemo(() => {
    return [appliedFilters.linha, appliedFilters.produto, appliedFilters.status]
      .filter((valor) => valor.trim().length > 0)
      .length
  }, [appliedFilters.linha, appliedFilters.produto, appliedFilters.status])

  const limparAnimacaoInsight = () => {
    insightTimersRef.current.forEach((timer) => window.clearTimeout(timer))
    insightTimersRef.current = []
    insightEmProcessoRef.current = false
  }

  useEffect(() => {
    setLinhasExpandidas((estadoAnterior) => {
      if (estadoAnterior.size === 0) {
        return estadoAnterior
      }
      if (linhasAgrupadas.length === 0) {
        return new Set()
      }
      const idsValidos = new Set(linhasAgrupadas.map((linha) => linha.id))
      let existeInvalido = false
      estadoAnterior.forEach((id) => {
        if (!idsValidos.has(id)) {
          existeInvalido = true
        }
      })
      if (!existeInvalido) {
        return estadoAnterior
      }
      return new Set(Array.from(estadoAnterior).filter((id) => idsValidos.has(id)))
    })
  }, [linhasAgrupadas])

  useEffect(() => {
    const estadoAnterior = insightResetRef.current
    const mudouPeriodo =
      estadoAnterior.dataInicioIso !== dataInicioIso || estadoAnterior.dataFimIso !== dataFimIso
    const mudouSessao = estadoAnterior.insightSessaoKey !== insightSessaoKey

    insightResetRef.current = { dataInicioIso, dataFimIso, insightSessaoKey }

    if (insightEmProcessoRef.current && !mudouPeriodo && mudouSessao) {
      return
    }

    setInsightAtual(null)
    setInsightAviso(INSIGHT_PLACEHOLDER)
    setInsightCarregando(false)
    setInsightEtapa('coletando')
    setInsightProgresso(0)
    limparAnimacaoInsight()
  }, [dataInicioIso, dataFimIso, insightSessaoKey])

  useEffect(() => {
    if (!insightModalOpen) {
      limparAnimacaoInsight()
      setInsightCarregando(false)
      setInsightEtapa('coletando')
      setInsightProgresso(0)
    }
  }, [insightModalOpen])

  useEffect(() => {
    return () => {
      limparAnimacaoInsight()
    }
  }, [])

  const alternarLinhaExpandida = (id: string) => {
    setLinhasExpandidas((estadoAnterior) => {
      const proximoEstado = new Set(estadoAnterior)
      if (proximoEstado.has(id)) {
        proximoEstado.delete(id)
      } else {
        proximoEstado.add(id)
      }
      return proximoEstado
    })
  }

  const alternarTodasLinhas = () => {
    setLinhasExpandidas((estadoAnterior) => {
      if (linhasAgrupadas.length === 0) {
        return estadoAnterior
      }
      const todasExpandidas = linhasAgrupadas.every((linha) => estadoAnterior.has(linha.id))
      if (todasExpandidas) {
        return new Set()
      }
      return new Set(linhasAgrupadas.map((linha) => linha.id))
    })
  }

  const aplicarFiltros = () => {
    setAppliedFilters({
      linha: draftFilters.linha.trim(),
      produto: draftFilters.produto.trim(),
      status: draftFilters.status.trim(),
    })
    setOpenFilterDialog(false)
  }

  const limparFiltros = () => {
    const filtrosLimpos = { ...filtrosIniciais.current }
    setDraftFilters(filtrosLimpos)
    setAppliedFilters(filtrosLimpos)
    setOpenFilterDialog(false)
  }

  const gerarInsightLocal = () => {
    if (!parametrosValidos) {
      setInsightAtual(null)
      setInsightAviso('Informe um período válido para gerar insights.')
      return
    }

    if (erroConsulta) {
      setInsightAtual(null)
      setInsightAviso('Não foi possível gerar insights devido a um erro na consulta.')
      return
    }

    if (linhasFiltradas.length === 0) {
      setInsightAtual(null)
      setInsightAviso('Nenhum dado disponível para gerar insights no período/filtros selecionados.')
      return
    }

    const usados = lerInsightsUsados(insightSessaoKey)
    const insight = gerarInsight(contextoInsight, usados)

    if (!insight) {
      setInsightAtual(null)
      setInsightAviso('Nenhum insight disponível para os dados atuais.')
      return
    }

    usados.add(insight.id)
    salvarInsightsUsados(insightSessaoKey, usados)
    setInsightAtual(insight)
    setInsightAviso('')
  }

  const iniciarGeracaoInsight = () => {
    limparAnimacaoInsight()
    insightEmProcessoRef.current = true
    setInsightAtual(null)
    setInsightAviso('')
    setInsightCarregando(true)
    setInsightEtapa('coletando')
    setInsightProgresso(INSIGHT_ETAPA_PROGRESSO.coletando)

    const timerAnalise = window.setTimeout(() => {
      setInsightEtapa('analisando')
      setInsightProgresso(INSIGHT_ETAPA_PROGRESSO.analisando)
    }, 5000)

    const timerPreparacao = window.setTimeout(() => {
      setInsightEtapa('preparando')
      setInsightProgresso(INSIGHT_ETAPA_PROGRESSO.preparando)
    }, 10000)

    const timerFinal = window.setTimeout(() => {
      setInsightProgresso(1)
      gerarInsightLocal()
      setInsightCarregando(false)
      insightEmProcessoRef.current = false
    }, 15000)

    insightTimersRef.current = [timerAnalise, timerPreparacao, timerFinal]
  }

  const abrirInsightModal = () => {
    setInsightModalOpen(true)
    iniciarGeracaoInsight()
  }

  const handleVoltar = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/')
  }

  const insightEtapaIndex = Math.max(
    0,
    INSIGHT_ETAPAS.findIndex((etapa) => etapa.id === insightEtapa)
  )
  const insightPercentual = Math.round(insightProgresso * 100)

  return (
    <>
      <AppHeader
        title="SICFAR OEE - Resumo Consolidado por Turno"
        userName={user.name}
        userInitials={user.initials}
        userRole={user.role}
      />

      <div className="mx-auto w-full max-w-none px-4 pb-6 pt-4 sm:px-6 lg:px-8">
        <main className="mx-auto max-w-[1600px] space-y-5">
          <section className="relative">
            <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold uppercase tracking-[0.08em] text-gray-700">
                  Resumo Consolidado por Turno
                </h2>
                <p className="mt-1 text-sm leading-5 text-gray-500">
                  Acompanhe quantidades de envase e embalagem, além de perdas e paradas, no período selecionado.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {appliedCount > 0 && (
                  <Badge className="rounded-full border border-brand-primary/30 bg-brand-primary/10 px-2.5 py-1 text-sm font-semibold text-brand-primary">
                    {appliedCount} filtro{appliedCount !== 1 ? 's' : ''} ativo{appliedCount !== 1 ? 's' : ''}
                  </Badge>
                )}
                <Button
                  onClick={handleVoltar}
                  variant="outline"
                  className="h-10 min-w-[115px] gap-2 border-primary bg-white px-4 text-primary hover:bg-primary/10 hover:text-primary"
                  title="Voltar para página anterior"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Voltar
                </Button>
                <Button
                  onClick={abrirInsightModal}
                  disabled={!parametrosValidos || isLoading || isFetching || insightCarregando}
                  variant="outline"
                  className="h-10 min-w-[115px] gap-2 border-primary bg-white px-4 text-primary hover:bg-primary/10 hover:text-primary"
                  title="Gerar insight local"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Lis IA
                </Button>
                <Button
                  onClick={() => void refetch()}
                  disabled={!parametrosValidos || isFetching}
                  className="h-10 min-w-[115px] gap-2 px-4"
                  title="Atualizar lista"
                >
                  {isFetching ? (
                    <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  )}
                  Atualizar
                </Button>
              </div>
            </div>
          </section>

          <ResumoKpis cards={cardsResumo} animacaoKey={resumoAtualizadoEm} />

          <Dialog open={insightModalOpen} onOpenChange={setInsightModalOpen}>
              <DialogContent className="w-[95vw] max-w-[760px] max-h-[85vh] gap-0 overflow-hidden rounded-2xl border border-border bg-background p-0 shadow-2xl">
                <div className="flex h-full flex-col">
                  <div className="border-b border-border/80 bg-background px-4 py-4 sm:px-6">
                    <DialogHeader className="space-y-2 text-left">
                      <DialogTitle className="text-lg font-semibold text-foreground sm:text-xl">
                        Insight Lis IA
                      </DialogTitle>
                      <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                        Análise baseada nos dados carregados e processados conforme filtro aplicado.
                      </DialogDescription>
                    </DialogHeader>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-muted/20 px-4 py-4 sm:px-6">
                    {insightCarregando ? (
                      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                        <div className="flex flex-col gap-5">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="relative flex h-11 w-11 items-center justify-center rounded-full border border-brand-primary/20 bg-brand-primary/10">
                                <div className="absolute inset-0 rounded-full border border-brand-primary/20 animate-[pulse_2.6s_ease-in-out_infinite]" />
                                <Loader2
                                  className="relative h-5 w-5 text-brand-primary animate-[spin_1.6s_linear_infinite]"
                                  aria-hidden="true"
                                />
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-semibold text-foreground">Processando insight</p>
                                <p className="text-xs text-muted-foreground">
                                  Consolidando dados e preparando a análise do período.
                                </p>
                              </div>
                            </div>
                            <div className="hidden items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary/70 sm:flex">
                              <span className="h-1.5 w-1.5 rounded-full bg-brand-primary/70 animate-[pulse_2s_ease-in-out_infinite]" />
                              <span className="h-1.5 w-1.5 rounded-full bg-brand-primary/50 animate-[pulse_2.4s_ease-in-out_infinite]" />
                              <span className="h-1.5 w-1.5 rounded-full bg-brand-primary/40 animate-[pulse_2.8s_ease-in-out_infinite]" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              <span>{INSIGHT_ETAPAS[insightEtapaIndex]?.label}</span>
                              <span>{insightPercentual}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted/60">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-brand-primary/30 via-brand-primary to-brand-primary/40 transition-[width] transition-duration-[1200ms] ease-out"
                                style={{ width: `${insightPercentual}%` }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            {INSIGHT_ETAPAS.map((etapa, index) => {
                              const ativo = index <= insightEtapaIndex
                              return (
                                <div
                                  key={etapa.id}
                                  className={cn(
                                    'rounded-lg border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors',
                                    ativo
                                      ? 'border-brand-primary/30 bg-brand-primary/10 text-brand-primary'
                                      : 'border-border bg-muted/40 text-muted-foreground'
                                  )}
                                >
                                  {etapa.label}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    ) : insightAtual ? (
                      <article className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-2">
                            <Badge
                              variant={INSIGHT_TIPO_CONFIG[insightAtual.tipo].badge}
                              className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]"
                            >
                              {INSIGHT_TIPO_CONFIG[insightAtual.tipo].label}
                            </Badge>
                            <h3 className="text-base font-semibold text-foreground">{insightAtual.titulo}</h3>
                          </div>
                          {typeof insightAtual.confianca === 'number' && (
                            <Badge
                              variant="outline"
                              className="rounded-full border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground"
                            >
                              Confiança {insightAtual.confianca}%
                            </Badge>
                          )}
                        </div>

                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {insightAtual.texto}
                        </p>

                        {insightAtual.recomendacao && (
                          <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                              Recomendação
                            </p>
                            <p className="mt-1 text-sm text-foreground/90">{insightAtual.recomendacao}</p>
                          </div>
                        )}

                        {insightAtual.tags.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {insightAtual.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="rounded-md border border-border bg-muted/60 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </article>
                    ) : (
                      <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                        {insightAviso}
                      </div>
                    )}
                  </div>

                  <DialogFooter className="flex-col border-t border-border/80 bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:space-x-0 sm:px-6">
                    <p className="text-xs text-muted-foreground">
                      Baseado nos dados do período selecionado.
                    </p>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                      <Button
                        variant="outline"
                        onClick={() => setInsightModalOpen(false)}
                        className="w-full border-border bg-background text-foreground hover:bg-muted sm:w-auto"
                      >
                        Fechar
                      </Button>
                      <Button
                        onClick={iniciarGeracaoInsight}
                        disabled={!parametrosValidos || isLoading || isFetching || insightCarregando}
                        className="w-full sm:w-auto"
                      >
                        Gerar novo insight
                      </Button>
                    </div>
                  </DialogFooter>
                </div>
              </DialogContent>
          </Dialog>

          {periodoInvalido && (
            <div className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700">
              A data inicial não pode ser maior que a data final.
            </div>
          )}

          {erroConsulta && (
            <div className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700">
              {erroConsulta}
            </div>
          )}

          {isLoading && parametrosValidos && (
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/90 px-4 py-3 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Carregando resumo do período…
            </div>
          )}

          <ResumoDetalhamentoTable
            linhas={linhasAgrupadas}
            linhasExpandidas={linhasExpandidas}
            onAlternarLinha={alternarLinhaExpandida}
            onAlternarTodasLinhas={alternarTodasLinhas}
            parametrosValidos={parametrosValidos}
            carregando={isLoading}
            atualizando={isFetching}
            toolbar={(
              <div className="mb-6 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_auto_auto] xl:items-end">
                <div className="relative w-full">
                  <Label htmlFor="busca-resumo-turno" className="sr-only">
                    Pesquisar apontamentos
                  </Label>
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                  <Input
                    id="busca-resumo-turno"
                    name="busca_resumo_turno"
                    type="text"
                    autoComplete="off"
                    placeholder="Pesquisar por linha, turno, SKU ou produto…"
                    className="h-11 w-full rounded-md border-gray-200 bg-white pl-10 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-brand-primary/30 md:h-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1 xl:shrink-0">
                  <Label className="text-sm font-semibold uppercase tracking-[0.08em] text-gray-500">Período</Label>
                  <PeriodoSelector
                    dataInicio={dataInicio}
                    dataFim={dataFim}
                    onDataInicioChange={setDataInicio}
                    onDataFimChange={setDataFim}
                  />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row xl:shrink-0">
                  <Dialog
                    open={openFilterDialog}
                    onOpenChange={(open) => {
                      setOpenFilterDialog(open)
                      if (open) {
                        setDraftFilters({ ...appliedFilters })
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'h-11 w-full gap-2 border-gray-200 bg-white px-4 text-gray-700 hover:bg-gray-50 sm:h-10 sm:w-auto',
                          appliedCount > 0 && 'border-brand-primary/40 bg-brand-primary/5 text-brand-primary hover:bg-brand-primary/10'
                        )}
                      >
                        <Filter className="h-4 w-4" aria-hidden="true" />
                        Filtros
                        {appliedCount > 0 && (
                          <Badge variant="secondary" className="ml-1 border border-brand-primary/20 bg-brand-primary/10 text-brand-primary">
                            {appliedCount}
                          </Badge>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-full sm:w-[95vw] max-w-[640px] max-h-[80vh] overflow-auto p-0">
                      <div className="p-4 sm:p-6">
                        <DialogHeader>
                          <DialogTitle>Filtrar Resumo</DialogTitle>
                          <DialogDescription>
                            Selecione os critérios para filtrar o detalhamento.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="f-linha">Linha</Label>
                            <Input
                              id="f-linha"
                              name="filtro_linha"
                              autoComplete="off"
                              placeholder="Ex.: SPEP Linha A"
                              value={draftFilters.linha}
                              onChange={(e) =>
                                setDraftFilters((anterior) => ({ ...anterior, linha: e.target.value }))
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="f-produto">Produto</Label>
                            <Input
                              id="f-produto"
                              name="filtro_produto"
                              autoComplete="off"
                              placeholder="Ex.: Solução…"
                              value={draftFilters.produto}
                              onChange={(e) =>
                                setDraftFilters((anterior) => ({ ...anterior, produto: e.target.value }))
                              }
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="f-status">Status</Label>
                            <select
                              id="f-status"
                              name="filtro_status"
                              className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              value={draftFilters.status}
                              onChange={(e) =>
                                setDraftFilters((anterior) => ({ ...anterior, status: e.target.value }))
                              }
                            >
                              <option value="">Todos</option>
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <DialogFooter className="sticky bottom-0 z-10 border-t bg-white/95 px-4 py-3 backdrop-blur sm:px-6 items-center justify-end sm:justify-end">
                        <Button variant="outline" onClick={limparFiltros}>
                          Limpar Filtros
                        </Button>
                        <Button onClick={aplicarFiltros}>Aplicar Filtros</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
          />
        </main>
      </div>
    </>
  )
}
