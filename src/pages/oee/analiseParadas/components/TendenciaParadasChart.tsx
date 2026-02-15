import { useMemo } from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TendenciaParadasItem } from '../types'
import { formatarHoras } from '../utils/formatters'

type TendenciaParadasChartProps = {
  dados: TendenciaParadasItem[]
  carregando: boolean
}

type TooltipTendenciaProps = {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
}

const TooltipTendencia = ({ active, payload, label }: TooltipTendenciaProps) => {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-gray-700">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="text-gray-500">
          {item.name}: {formatarHoras(item.value)}
        </p>
      ))}
    </div>
  )
}

export function TendenciaParadasChart({ dados, carregando }: TendenciaParadasChartProps) {
  const dadosEmHoras = useMemo(() => {
    return dados.map((item) => ({
      ...item,
      horasGrandes: item.minutosGrandes / 60,
      horasPequenas: item.minutosPequenas / 60,
      horasEstrategicas: item.minutosEstrategicas / 60,
      horasTotais: item.minutosTotais / 60,
    }))
  }, [dados])

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-base font-semibold text-gray-700">
          Tendência diária de paradas
        </CardTitle>
        <p className="text-sm text-gray-500">
          Evolução do tempo de parada por dia, com separação entre grandes, pequenas e estratégicas.
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {carregando ? (
          <div className="flex h-[340px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-slate-50/70 text-sm text-gray-500">
            Carregando tendência…
          </div>
        ) : dadosEmHoras.length === 0 ? (
          <div className="flex h-[340px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-slate-50/70 text-sm text-gray-500">
            Sem dados suficientes para montar a série temporal.
          </div>
        ) : (
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dadosEmHoras} margin={{ top: 16, right: 20, left: 8, bottom: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="rotuloData" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(valor: number) => `${valor.toFixed(1)}h`}
                  width={62}
                />
                <Tooltip content={<TooltipTendencia />} />
                <Legend />
                <Bar dataKey="horasGrandes" stackId="tempo" name="Grandes (h)" fill="#d14c4c" radius={[3, 3, 0, 0]} />
                <Bar dataKey="horasPequenas" stackId="tempo" name="Pequenas (h)" fill="#d79c2f" radius={[3, 3, 0, 0]} />
                <Bar dataKey="horasEstrategicas" stackId="tempo" name="Estratégicas (h)" fill="#5f7f95" radius={[3, 3, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="horasTotais"
                  name="Total diário (h)"
                  stroke="#0662c3"
                  strokeWidth={2}
                  dot={{ r: 2.5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
