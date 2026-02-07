import { useEffect, useMemo, useRef, useState } from 'react'
import { Filter, Loader2, RefreshCw, Search } from 'lucide-react'

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

export default function ResumoOeeTurno() {
  const { user: authUser } = useAuth()
  const dataAtualInicialRef = useRef(obterDataAtualFormatada())
  const filtrosIniciais = useRef({
    linha: '',
    produto: '',
    status: '',
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

  const dataInicioIso = converterDataBrParaIso(dataInicio)
  const dataFimIso = converterDataBrParaIso(dataFim)

  const {
    linhas,
    totais,
    parametrosValidos,
    periodoInvalido,
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
  const appliedCount = useMemo(() => {
    return [appliedFilters.linha, appliedFilters.produto, appliedFilters.status]
      .filter((valor) => valor.trim().length > 0)
      .length
  }, [appliedFilters.linha, appliedFilters.produto, appliedFilters.status])
  useEffect(() => {
    setLinhasExpandidas(new Set(linhasAgrupadas.map((linha) => linha.id)))
  }, [linhasAgrupadas])

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
                  Acompanhe produção, perdas e paradas no período selecionado em uma visão única por linha e produto.
                </p>
              </div>

              {appliedCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge className="rounded-full border border-brand-primary/30 bg-brand-primary/10 px-2.5 py-1 text-sm font-semibold text-brand-primary">
                    {appliedCount} filtro{appliedCount !== 1 ? 's' : ''} ativo{appliedCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              )}
            </div>
          </section>

          <ResumoKpis cards={cardsResumo} />

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

                  <Button
                    onClick={() => void refetch()}
                    disabled={!parametrosValidos || isFetching}
                    className="h-11 w-full gap-2 px-4 sm:h-10 sm:w-auto"
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
            )}
          />
        </main>
      </div>
    </>
  )
}
