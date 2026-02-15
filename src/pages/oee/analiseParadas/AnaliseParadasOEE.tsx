import { useMemo, useRef, useState } from 'react'
import { AlertTriangle, ArrowLeft, Loader2, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import { AppHeader } from '@/components/layout/AppHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FiltrosAnaliseParadas } from './components/FiltrosAnaliseParadas'
import { KpiParadasCards } from './components/KpiParadasCards'
import { ParetoParadasLinhaChart } from './components/ParetoParadasLinhaChart'
import { TendenciaParadasChart } from './components/TendenciaParadasChart'
import { DistribuicaoClasseChart } from './components/DistribuicaoClasseChart'
import { TopNaturezasChart } from './components/TopNaturezasChart'
import { TopLinhasParadasChart } from './components/TopLinhasParadasChart'
import { TabelaAcoesPrioritarias } from './components/TabelaAcoesPrioritarias'
import { useAnaliseParadasOee } from './hooks/useAnaliseParadasOee'
import { converterDataBrParaIso, obterDataAtualFormatada } from './utils/date'
import { formatarDataHoraAtualizacao } from './utils/formatters'

type EstadoFiltros = {
  dataInicio: string
  dataFim: string
  linhaId: number | null
  turnoId: number | null
  produtoId: number | null
  limitePareto: number
}

const LIMITE_PARETO_PADRAO = 12

const criarFiltrosPadrao = (dataHoje: string): EstadoFiltros => ({
  dataInicio: dataHoje,
  dataFim: dataHoje,
  linhaId: null,
  turnoId: null,
  produtoId: null,
  limitePareto: LIMITE_PARETO_PADRAO,
})

export default function AnaliseParadasOEE() {
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const dataHojeRef = useRef(obterDataAtualFormatada())
  const dataHoje = dataHojeRef.current

  const [filtrosRascunho, setFiltrosRascunho] = useState<EstadoFiltros>(() => criarFiltrosPadrao(dataHoje))
  const [filtrosAplicados, setFiltrosAplicados] = useState<EstadoFiltros>(() => criarFiltrosPadrao(dataHoje))

  const dataInicioIso = converterDataBrParaIso(filtrosAplicados.dataInicio)
  const dataFimIso = converterDataBrParaIso(filtrosAplicados.dataFim)

  const {
    linhasFiltro,
    turnosFiltro,
    produtosFiltro,
    dados,
    parametrosValidos,
    periodoInvalido,
    isLoadingFiltros,
    isLoadingDados,
    isFetchingDados,
    erroConsulta,
    dataAtualizacao,
    refetch,
  } = useAnaliseParadasOee({
    dataInicioIso,
    dataFimIso,
    linhaId: filtrosAplicados.linhaId,
    turnoId: filtrosAplicados.turnoId,
    produtoId: filtrosAplicados.produtoId,
    limitePareto: filtrosAplicados.limitePareto,
  })

  const user = {
    name: authUser?.usuario || authUser?.email?.split('@')[0] || 'Usuário',
    initials: (authUser?.usuario || authUser?.email)?.substring(0, 2).toUpperCase() || 'U',
    role: authUser?.perfil || 'Operador',
  }

  const filtrosAtivos = useMemo(() => {
    let total = 0
    if (filtrosAplicados.dataInicio !== dataHoje || filtrosAplicados.dataFim !== dataHoje) {
      total += 1
    }
    if (filtrosAplicados.linhaId !== null) {
      total += 1
    }
    if (filtrosAplicados.turnoId !== null) {
      total += 1
    }
    if (filtrosAplicados.produtoId !== null) {
      total += 1
    }
    if (filtrosAplicados.limitePareto !== LIMITE_PARETO_PADRAO) {
      total += 1
    }
    return total
  }, [dataHoje, filtrosAplicados])

  const semDadosNoPeriodo = parametrosValidos && !isLoadingDados && dados.paradasNormalizadas.length === 0
  const carregandoPainel = !periodoInvalido && !erroConsulta && (isLoadingDados || isLoadingFiltros)
  const mostrarPainelAnalitico = !periodoInvalido && !erroConsulta
  const possuiFeedback =
    periodoInvalido || Boolean(erroConsulta) || carregandoPainel || semDadosNoPeriodo
  const atualizacaoFormatada = formatarDataHoraAtualizacao(dataAtualizacao)

  const aplicarFiltros = () => {
    setFiltrosAplicados({ ...filtrosRascunho })
  }

  const limparFiltros = () => {
    const filtrosPadrao = criarFiltrosPadrao(dataHoje)
    setFiltrosRascunho(filtrosPadrao)
    setFiltrosAplicados(filtrosPadrao)
  }

  const handleVoltar = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/')
  }

  return (
    <>
      <AppHeader
        title="SICFAR OEE - Análise de Paradas"
        userName={user.name}
        userInitials={user.initials}
        userRole={user.role}
      />

      <div className="relative mx-auto w-full max-w-none px-4 pb-7 pt-4 sm:px-6 lg:px-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-gradient-to-b from-brand-primary/10 via-brand-primary/[0.04] to-transparent"
          aria-hidden="true"
        />

        <main className="mx-auto max-w-[1600px] space-y-6">
          <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-brand-primary/15 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-brand-secondary/20 blur-2xl"
              aria-hidden="true"
            />

            <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 space-y-4">
                <Badge
                  variant="secondary"
                  className="rounded-full border border-brand-primary/25 bg-brand-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-brand-primary"
                >
                  Análise avançada de paradas
                </Badge>

                <div className="space-y-2">
                  <h2 className="max-w-[26ch] text-xl font-semibold leading-tight text-gray-800 sm:text-2xl">
                    Dashboard executivo de paradas OEE
                  </h2>
                  <p className="max-w-[72ch] text-sm leading-6 text-gray-600">
                    Visão analítica baseada na RPC{' '}
                    <code className="rounded bg-slate-100 px-1 py-0.5 text-xs text-gray-600">fn_resumo_oee_turno</code>{' '}
                    e nos apontamentos de{' '}
                    <code className="rounded bg-slate-100 px-1 py-0.5 text-xs text-gray-600">tboee_turno_parada</code>.
                    O objetivo é identificar impacto, recorrência e prioridade de tratativas por linha, turno e SKU.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                      Ocorrências no período
                    </p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-gray-800">
                      {dados.kpis.ocorrenciasTotais}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                      Linhas impactadas
                    </p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-gray-800">
                      {dados.kpis.linhasImpactadas}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                      Última atualização
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-700">
                      {atualizacaoFormatada}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
                {filtrosAtivos > 0 && (
                  <Badge className="rounded-full border border-brand-primary/30 bg-brand-primary/10 px-2.5 py-1 text-sm font-semibold text-brand-primary">
                    {filtrosAtivos} filtro{filtrosAtivos !== 1 ? 's' : ''} ativo{filtrosAtivos !== 1 ? 's' : ''}
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
                  onClick={() => void refetch()}
                  disabled={!parametrosValidos || isFetchingDados}
                  className="h-10 min-w-[128px] gap-2 px-4"
                  title="Atualizar análise"
                >
                  {isFetchingDados ? (
                    <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  )}
                  Atualizar dados
                </Button>
              </div>
            </div>

            {dados.resumoExecutivo.length > 0 && (
              <div className="relative mt-5 space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
                  Resumo executivo
                </p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {dados.resumoExecutivo.map((mensagem, index) => (
                    <div
                      key={`${mensagem}-${index}`}
                      className="flex items-start gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 shadow-sm"
                    >
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-primary/70" aria-hidden="true" />
                      <span className="break-words">{mensagem}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-gray-500">
                Recorte da análise
              </h3>
              <p className="max-w-[68ch] text-sm text-gray-500">
                Ajuste os filtros para comparar tendências e causas com maior impacto operacional.
              </p>
            </div>
            <FiltrosAnaliseParadas
              dataInicio={filtrosRascunho.dataInicio}
              dataFim={filtrosRascunho.dataFim}
              linhaId={filtrosRascunho.linhaId}
              turnoId={filtrosRascunho.turnoId}
              produtoId={filtrosRascunho.produtoId}
              limitePareto={filtrosRascunho.limitePareto}
              linhas={linhasFiltro}
              turnos={turnosFiltro}
              produtos={produtosFiltro}
              carregandoFiltros={isLoadingFiltros}
              carregandoDados={isFetchingDados}
              onDataInicioChange={(valor) => setFiltrosRascunho((anterior) => ({ ...anterior, dataInicio: valor }))}
              onDataFimChange={(valor) => setFiltrosRascunho((anterior) => ({ ...anterior, dataFim: valor }))}
              onLinhaIdChange={(valor) => setFiltrosRascunho((anterior) => ({ ...anterior, linhaId: valor }))}
              onTurnoIdChange={(valor) => setFiltrosRascunho((anterior) => ({ ...anterior, turnoId: valor }))}
              onProdutoIdChange={(valor) => setFiltrosRascunho((anterior) => ({ ...anterior, produtoId: valor }))}
              onLimiteParetoChange={(valor) => setFiltrosRascunho((anterior) => ({ ...anterior, limitePareto: valor }))}
              onAplicar={aplicarFiltros}
              onLimpar={limparFiltros}
            />
          </section>

          {possuiFeedback && (
            <section className="space-y-3" aria-live="polite">
              {periodoInvalido && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700">
                  A data inicial não pode ser maior que a data final.
                </div>
              )}

              {erroConsulta && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700">
                  {erroConsulta}
                </div>
              )}

              {carregandoPainel && (
                <div
                  role="status"
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/90 px-4 py-3 text-sm text-gray-500"
                >
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Carregando dados da análise de paradas…
                </div>
              )}

              {semDadosNoPeriodo && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <p>
                    Não foram encontradas paradas para o período e filtros aplicados. Tente ampliar o intervalo ou
                    remover restrições.
                  </p>
                </div>
              )}
            </section>
          )}

          {mostrarPainelAnalitico && (
            <>
              <KpiParadasCards kpis={dados.kpis} atualizadoEm={dataAtualizacao} />

              <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-8">
                  <ParetoParadasLinhaChart dados={dados.pareto} carregando={isLoadingDados || isFetchingDados} />
                </div>
                <div className="xl:col-span-4">
                  <DistribuicaoClasseChart
                    dados={dados.distribuicaoClasse}
                    carregando={isLoadingDados || isFetchingDados}
                  />
                </div>
                <div className="xl:col-span-12">
                  <TendenciaParadasChart dados={dados.tendencia} carregando={isLoadingDados || isFetchingDados} />
                </div>
                <div className="xl:col-span-6">
                  <TopNaturezasChart dados={dados.topNaturezas} carregando={isLoadingDados || isFetchingDados} />
                </div>
                <div className="xl:col-span-6">
                  <TopLinhasParadasChart dados={dados.topLinhas} carregando={isLoadingDados || isFetchingDados} />
                </div>
              </section>

              <TabelaAcoesPrioritarias
                dados={dados.acoesPrioritarias}
                carregando={isLoadingDados || isFetchingDados}
              />
            </>
          )}
        </main>
      </div>
    </>
  )
}
