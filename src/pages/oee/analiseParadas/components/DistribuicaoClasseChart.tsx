import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DistribuicaoClasseItem } from '../types'
import { formatarMinutosHHMM, formatarPercentual } from '../utils/formatters'

type DistribuicaoClasseChartProps = {
  dados: DistribuicaoClasseItem[]
  carregando: boolean
}

const PALETA_CORES = ['#0662c3', '#d14c4c', '#d79c2f', '#5f7f95', '#62a183', '#7b6cf2']

type TooltipClasseProps = {
  active?: boolean
  payload?: Array<{ payload: DistribuicaoClasseItem }>
}

const TooltipClasse = ({ active, payload }: TooltipClasseProps) => {
  if (!active || !payload?.length) {
    return null
  }

  const item = payload[0]?.payload
  if (!item) {
    return null
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-gray-700">{item.classe}</p>
      <p className="text-gray-500">Tempo: {formatarMinutosHHMM(item.tempoMinutos)}</p>
      <p className="text-gray-500">Ocorrências: {item.quantidade}</p>
      <p className="text-gray-500">Participação: {formatarPercentual(item.percentual)}</p>
    </div>
  )
}

export function DistribuicaoClasseChart({ dados, carregando }: DistribuicaoClasseChartProps) {
  return (
    <Card className="h-full border-gray-200 bg-white shadow-sm">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-base font-semibold text-gray-700">
          Distribuição por classe de parada
        </CardTitle>
        <p className="text-sm text-gray-500">
          Proporção de tempo perdido por classe para apoiar decisões de planejamento e execução.
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {carregando ? (
          <div className="flex h-[360px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-slate-50/70 text-sm text-gray-500">
            Carregando distribuição…
          </div>
        ) : dados.length === 0 ? (
          <div className="flex h-[360px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-slate-50/70 text-sm text-gray-500">
            Sem dados de classe de parada para exibir.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dados}
                    dataKey="tempoMinutos"
                    nameKey="classe"
                    innerRadius={56}
                    outerRadius={88}
                    paddingAngle={2}
                  >
                    {dados.map((item, index) => (
                      <Cell key={`${item.classe}-${index}`} fill={PALETA_CORES[index % PALETA_CORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<TooltipClasse />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {dados.slice(0, 5).map((item, index) => (
                <div
                  key={item.classe}
                  className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: PALETA_CORES[index % PALETA_CORES.length] }}
                      aria-hidden="true"
                    />
                    <span className="font-medium text-gray-700">{item.classe}</span>
                  </div>
                  <div className="text-gray-500">
                    {formatarPercentual(item.percentual)} • {formatarMinutosHHMM(item.tempoMinutos)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
