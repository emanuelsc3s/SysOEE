import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TopNaturezaItem } from '../types'
import { formatarHoras, formatarNumeroInteiro, formatarPercentual, truncarTexto } from '../utils/formatters'

type TopNaturezasChartProps = {
  dados: TopNaturezaItem[]
  carregando: boolean
}

type TooltipNaturezaProps = {
  active?: boolean
  payload?: Array<{ payload: TopNaturezaItem }>
}

const TooltipNatureza = ({ active, payload }: TooltipNaturezaProps) => {
  if (!active || !payload?.length) {
    return null
  }

  const item = payload[0]?.payload
  if (!item) {
    return null
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-gray-700">{item.natureza}</p>
      <p className="text-gray-500">Tempo: {formatarHoras(item.tempoHoras)}</p>
      <p className="text-gray-500">Ocorrências: {formatarNumeroInteiro(item.quantidade)}</p>
      <p className="text-gray-500">Participação: {formatarPercentual(item.percentual)}</p>
    </div>
  )
}

export function TopNaturezasChart({ dados, carregando }: TopNaturezasChartProps) {
  const alturaGrafico = useMemo(() => {
    const base = Math.max(260, dados.length * 44)
    return Math.min(base, 420)
  }, [dados.length])

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-base font-semibold text-gray-700">
          Top naturezas de paradas não estratégicas
        </CardTitle>
        <p className="text-sm text-gray-500">
          Ranking de impacto por natureza para direcionar plano de mitigação operacional.
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {carregando ? (
          <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-slate-50/70 text-sm text-gray-500">
            Carregando ranking…
          </div>
        ) : dados.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-slate-50/70 text-sm text-gray-500">
            Sem naturezas de parada para os filtros selecionados.
          </div>
        ) : (
          <div className="w-full" style={{ height: `${alturaGrafico}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dados} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(valor: number) => `${valor.toFixed(1)}h`}
                />
                <YAxis
                  type="category"
                  dataKey="natureza"
                  width={150}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(valor: string) => truncarTexto(valor, 22)}
                />
                <Tooltip content={<TooltipNatureza />} />
                <Bar dataKey="tempoHoras" name="Tempo (h)" fill="#0662c3" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
