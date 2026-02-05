/**
 * Gráfico de Pareto para paradas grandes
 */
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  LabelList
} from 'recharts'

export type ParetoParadaChartItem = {
  parada: string
  quantidade: number
  tempoParadaHoras: number
  percentual: number
  percentualAcumulado: number
}

type ParetoParadasChartProps = {
  data: ParetoParadaChartItem[]
  altura?: number
}

const formatadorNumero = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

const formatarPercentualLabel = (valor: number) => `${formatadorNumero.format(Number(valor))}%`
const formatarHorasLabel = (valor: number) => `${formatadorNumero.format(Number(valor))} h`

const TooltipPareto = ({
  active,
  payload,
  label
}: {
  active?: boolean
  payload?: Array<{ payload: ParetoParadaChartItem }>
  label?: string
}) => {
  if (!active || !payload?.length) {
    return null
  }

  const item = payload[0]?.payload
  if (!item) {
    return null
  }

  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-foreground">{label || item.parada}</p>
      <p className="text-muted-foreground">
        Tempo: {formatadorNumero.format(item.tempoParadaHoras)} h
      </p>
      <p className="text-muted-foreground">
        Quantidade: {item.quantidade}
      </p>
      <p className="text-muted-foreground">
        % acumulado: {formatadorNumero.format(item.percentualAcumulado)}%
      </p>
    </div>
  )
}

export function ParetoParadasChart({ data, altura = 340 }: ParetoParadasChartProps) {
  return (
    <div className="w-full" style={{ height: altura }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 24, left: 8, bottom: 70 }}
        >
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <XAxis
            dataKey="parada"
            interval={0}
            angle={-30}
            textAnchor="end"
            height={70}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            yAxisId="tempo"
            tickFormatter={(valor) => formatadorNumero.format(Number(valor))}
            tick={{ fontSize: 11 }}
            width={64}
          />
          <YAxis
            yAxisId="percentual"
            orientation="right"
            domain={[0, 100]}
            tickFormatter={(valor) => `${formatadorNumero.format(Number(valor))}%`}
            tick={{ fontSize: 11 }}
            width={70}
          />
          <Tooltip content={<TooltipPareto />} />
          <Legend />
          <Bar
            yAxisId="tempo"
            dataKey="tempoParadaHoras"
            name="Tempo (h)"
            fill="hsl(var(--chart-1))"
            radius={[4, 4, 0, 0]}
          >
            <LabelList
              dataKey="tempoParadaHoras"
              position="top"
              offset={8}
              formatter={formatarHorasLabel}
              fill="hsl(var(--foreground))"
              fontSize={11}
            />
          </Bar>
          <Line
            yAxisId="percentual"
            dataKey="percentualAcumulado"
            name="% acumulado"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          >
            <LabelList
              dataKey="percentualAcumulado"
              position="top"
              offset={6}
              formatter={formatarPercentualLabel}
              fill="hsl(var(--chart-2))"
              fontSize={11}
            />
          </Line>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
