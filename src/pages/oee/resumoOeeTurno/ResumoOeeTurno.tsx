import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarRange, Loader2, RefreshCw } from 'lucide-react'

import { AppHeader } from '@/components/layout/AppHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { ComparativoTurnoChart } from './components/ComparativoTurnoChart'
import { PeriodoSelector } from './components/PeriodoSelector'
import { ResumoDetalhamentoTable } from './components/ResumoDetalhamentoTable'
import { ResumoKpis } from './components/ResumoKpis'
import { useResumoOeeTurno } from './hooks/useResumoOeeTurno'
import { agruparLinhasResumo, criarCardsResumo } from './utils/aggregations'
import { converterDataBrParaIso, formatarDataExibicao, obterDataAtualFormatada } from './utils/date'

export default function ResumoOeeTurno() {
  const { user: authUser } = useAuth()
  const dataAtualInicialRef = useRef(obterDataAtualFormatada())

  const user = {
    name: authUser?.usuario || authUser?.email?.split('@')[0] || 'Usuário',
    initials: (authUser?.usuario || authUser?.email)?.substring(0, 2).toUpperCase() || 'U',
    role: authUser?.perfil || 'Operador',
  }

  const [dataInicio, setDataInicio] = useState(dataAtualInicialRef.current)
  const [dataFim, setDataFim] = useState(dataAtualInicialRef.current)
  const [linhasExpandidas, setLinhasExpandidas] = useState<Set<string>>(new Set())

  const dataInicioIso = converterDataBrParaIso(dataInicio)
  const dataFimIso = converterDataBrParaIso(dataFim)

  const {
    linhas,
    totais,
    comparativoTurnos,
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

  const linhasAgrupadas = useMemo(() => agruparLinhasResumo(linhas), [linhas])
  const cardsResumo = useMemo(() => criarCardsResumo(totais), [totais])
  const totalRegistros = linhas.length

  const periodoDescricao = useMemo(() => {
    if (!dataInicioIso || !dataFimIso) {
      return 'Período não definido'
    }

    const inicio = formatarDataExibicao(dataInicioIso)
    const fim = formatarDataExibicao(dataFimIso)

    if (dataInicioIso === dataFimIso) {
      return inicio
    }

    return `${inicio} a ${fim}`
  }, [dataFimIso, dataInicioIso])

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

  return (
    <>
      <AppHeader
        title="SICFAR OEE - Resumo Consolidado por Turno"
        userName={user.name}
        userInitials={user.initials}
        userRole={user.role}
      />

      <div className="mx-auto w-full max-w-none px-4 pb-6 pt-4 sm:px-6 lg:px-8">
        <main className="mx-auto max-w-[1600px] space-y-4">
          <ResumoKpis cards={cardsResumo} />

          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Resumo consolidado de OEE</h1>
                <p className="text-sm text-gray-500">Consolidado de produção e paradas por linha e produto.</p>
              </div>

              <div className="grid w-full gap-3 xl:w-auto xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                <div className="w-full xl:min-w-[420px]">
                  <Label className="mb-1 block text-xs font-medium text-gray-500">Período</Label>
                  <PeriodoSelector
                    dataInicio={dataInicio}
                    dataFim={dataFim}
                    onDataInicioChange={setDataInicio}
                    onDataFimChange={setDataFim}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                  <Badge
                    variant="outline"
                    className="inline-flex items-center gap-2 rounded-md border-blue-100 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700"
                  >
                    <CalendarRange className="h-3.5 w-3.5" />
                    <span>{periodoDescricao}</span>
                  </Badge>

                  <Badge
                    variant="secondary"
                    className="rounded-md border border-gray-200 bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600"
                  >
                    {totalRegistros} registro{totalRegistros !== 1 ? 's' : ''}
                  </Badge>

                  <Button
                    type="button"
                    onClick={() => void refetch()}
                    disabled={!parametrosValidos || isFetching}
                    className="h-8 gap-1.5 px-3 text-xs font-medium"
                  >
                    {isFetching ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    Atualizar
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {periodoInvalido && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              A data inicial não pode ser maior que a data final.
            </div>
          )}

          {erroConsulta && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erroConsulta}
            </div>
          )}

          {isLoading && parametrosValidos && (
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando resumo do período...
            </div>
          )}

          <ResumoDetalhamentoTable
            linhas={linhasAgrupadas}
            linhasExpandidas={linhasExpandidas}
            onAlternarLinha={alternarLinhaExpandida}
            parametrosValidos={parametrosValidos}
            carregando={isLoading}
          />

          <ComparativoTurnoChart
            dados={comparativoTurnos}
            parametrosValidos={parametrosValidos}
            carregando={isLoading}
          />
        </main>
      </div>
    </>
  )
}
