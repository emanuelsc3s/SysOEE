import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ParetoParadaItem } from '../types'
import { formatarHoras, formatarPercentual, formatarNumeroInteiro, truncarTexto } from '../utils/formatters'

type ParetoParadasLinhaChartProps = {
  dados: ParetoParadaItem[]
  carregando: boolean
}

type TooltipParetoProps = {
  active?: boolean
  payload?: Array<{ payload: ParetoParadaItem }>
  label?: string
}

const TooltipPareto = ({ active, payload, label }: TooltipParetoProps) => {
  if (!active || !payload?.length) {
    return null
  }

  const item = payload[0]?.payload
  if (!item) {
    return null
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-gray-700">{label || item.parada}</p>
      <p className="text-gray-500">Tempo: {formatarHoras(item.tempoHoras)}</p>
      <p className="text-gray-500">Ocorrências: {formatarNumeroInteiro(item.quantidade)}</p>
      <p className="text-gray-500">Participação: {formatarPercentual(item.percentual)}</p>
      <p className="text-gray-500">Acumulado: {formatarPercentual(item.percentualAcumulado)}</p>
    </div>
  )
}

export function ParetoParadasLinhaChart({ dados, carregando }: ParetoParadasLinhaChartProps) {
  return (
    <Card className="h-full border-gray-200 bg-white shadow-sm">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-base font-semibold text-gray-700">
          Pareto de paradas grandes (barras + linha acumulada)
        </CardTitle>
        <p className="text-sm text-gray-500">
          Ordenação por impacto em horas para priorização de tratativas.
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        {carregando ? (
          <div className="flex h-[360px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-slate-50/70 text-sm text-gray-500">
            Carregando pareto…
          </div>
        ) : dados.length === 0 ? (
          <div className="flex h-[360px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-slate-50/70 text-sm text-gray-500">
            Sem paradas grandes para o período/filtros selecionados.
          </div>
        ) : (
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dados} margin={{ top: 12, right: 28, left: 8, bottom: 68 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="parada"
                  interval={0}
                  angle={-24}
                  textAnchor="end"
                  height={72}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(valor: string) => truncarTexto(valor, 26)}
                />
                <YAxis
                  yAxisId="horas"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(valor: number) => formatarHoras(valor).replace(' h', '')}
                  width={64}
                />
                <YAxis
                  yAxisId="percentual"
                  orientation="right"
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(valor: number) => `${Math.round(valor)}%`}
                  width={54}
                />
                <Tooltip content={<TooltipPareto />} />
                <Legend />
                <ReferenceLine
                  yAxisId="percentual"
                  y={80}
                  stroke="#ee8b60"
                  strokeDasharray="5 5"
                  label={{ value: '80%', fill: '#ee8b60', fontSize: 10, position: 'insideTopRight' }}
                />
                <Bar
                  yAxisId="horas"
                  dataKey="tempoHoras"
                  name="Tempo (h)"
                  fill="#0662c3"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="percentual"
                  type="monotone"
                  dataKey="percentualAcumulado"
                  name="% acumulado"
                  stroke="#ee8b60"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
