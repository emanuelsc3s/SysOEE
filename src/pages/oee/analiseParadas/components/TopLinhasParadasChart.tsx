import { useMemo } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TopLinhaItem } from '../types'
import {
  formatarMinutosHHMM,
  formatarNumeroInteiro,
  formatarPercentual,
} from '../utils/formatters'

type TopLinhasParadasChartProps = {
  dados: TopLinhaItem[]
  carregando: boolean
}

const limitarPercentual = (valor: number): number => {
  if (!Number.isFinite(valor)) {
    return 0
  }

  return Math.min(Math.max(valor, 0), 100)
}

export function TopLinhasParadasChart({ dados, carregando }: TopLinhasParadasChartProps) {
  const alturaLista = useMemo(() => {
    const base = Math.max(260, dados.length * 44)
    return Math.min(base, 420)
  }, [dados.length])

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-base font-semibold text-gray-700">
          Linhas com maior tempo de parada
        </CardTitle>
        <p className="text-sm text-gray-500">
          Concentração de impacto por linha para priorização de recursos e intervenção.
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {carregando ? (
          <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-slate-50/70 text-sm text-gray-500">
            Carregando linhas…
          </div>
        ) : dados.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-slate-50/70 text-sm text-gray-500">
            Sem linhas com parada no período selecionado.
          </div>
        ) : (
          <div className="w-full" style={{ height: `${alturaLista}px` }}>
            <div className="flex h-full flex-col rounded-lg border border-gray-100 bg-white">
              <div className="grid grid-cols-[minmax(0,1fr)_5.25rem_5.25rem] items-center gap-2 border-b border-gray-100 px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500 sm:grid-cols-[minmax(0,1fr)_5.75rem_5.75rem] sm:px-3">
                <span className="truncate">Linha</span>
                <span className="text-right">Tempo</span>
                <span className="text-right">% Part.</span>
              </div>

              <ul
                className="flex-1 space-y-1 overflow-y-auto px-2 py-2 sm:px-3"
                aria-label="Linhas com maior tempo de parada"
              >
                {dados.map((item, indice) => {
                  const linha = (item.linhaproducao || '').trim() || 'Linha não informada'
                  const percentual = limitarPercentual(item.percentual)
                  const percentualFormatado = formatarPercentual(percentual)
                  const tempoFormatado = `${formatarMinutosHHMM(item.tempoMinutos)}h`
                  const ocorrencias = formatarNumeroInteiro(item.quantidade)

                  return (
                    <li
                      key={`${linha}-${item.linhaproducaoId ?? 'sem-id'}-${indice}`}
                      className="grid grid-cols-[minmax(0,1fr)_5.25rem_5.25rem] items-center gap-2 py-0.5 sm:grid-cols-[minmax(0,1fr)_5.75rem_5.75rem]"
                      title={`${linha}: ${tempoFormatado} (${percentualFormatado}) • ${ocorrencias} ocorrência(s)`}
                    >
                      <span
                        className="truncate rounded-[4px] px-2 py-1 text-xs font-bold uppercase tracking-[0.02em] text-gray-800 sm:text-[13px]"
                        style={{
                          background: `linear-gradient(90deg, rgb(6 98 195 / 0.14) ${percentual}%, transparent ${percentual}%)`,
                        }}
                      >
                        {linha.toLocaleUpperCase('pt-BR')}
                      </span>
                      <span className="text-right text-xs font-semibold tabular-nums text-gray-800 sm:text-sm">
                        {tempoFormatado}
                      </span>
                      <span className="text-right text-xs font-semibold tabular-nums text-blue-700 sm:text-sm">
                        {percentualFormatado}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
