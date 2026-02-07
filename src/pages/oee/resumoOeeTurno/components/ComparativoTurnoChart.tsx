import type { ComparativoTurno } from '../types'
import { formatarQuantidade } from '../utils/formatters'

type ComparativoTurnoChartProps = {
  dados: ComparativoTurno[]
  parametrosValidos: boolean
  carregando: boolean
}

const obterAlturaPercentual = (valor: number, maximo: number): number => {
  if (valor <= 0 || maximo <= 0) {
    return 4
  }

  return Math.max(8, Math.round((valor / maximo) * 100))
}

export function ComparativoTurnoChart({
  dados,
  parametrosValidos,
  carregando,
}: ComparativoTurnoChartProps) {
  const semDadosComparativo = dados.length === 0
  const maximo = Math.max(
    ...dados.flatMap((item) => [item.producao, item.perdas]),
    1
  )

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_14px_30px_-28px_rgba(15,23,42,0.55)] sm:p-5">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Comparativo de Produção por Turno</h2>
          <p className="mt-1 text-xs leading-5 text-gray-500">Análise comparativa de produção x perdas em cada turno.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <span className="mr-1.5 h-2.5 w-2.5 rounded-sm bg-primary"></span>
            <span className="text-[11px] font-medium text-gray-600">Produção</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1.5 h-2.5 w-2.5 rounded-sm bg-red-400"></span>
            <span className="text-[11px] font-medium text-gray-600">Perdas</span>
          </div>
        </div>
      </div>

      {!parametrosValidos && !carregando && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
          Informe um período válido para exibir o comparativo.
        </div>
      )}

      {parametrosValidos && carregando && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
          Carregando comparativo por turno…
        </div>
      )}

      {parametrosValidos && !carregando && semDadosComparativo && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
          Sem dados para exibir no comparativo do período selecionado.
        </div>
      )}

      {parametrosValidos && !carregando && !semDadosComparativo && (
        <div className="relative h-48 w-full border-b border-gray-200 px-6 pb-2 sm:px-12">
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-8 pr-4">
            <div className="h-0 w-full border-t border-dashed border-gray-100"></div>
            <div className="h-0 w-full border-t border-dashed border-gray-100"></div>
            <div className="h-0 w-full border-t border-dashed border-gray-100"></div>
          </div>

          <div className="relative z-10 flex h-full items-end justify-center gap-8 sm:gap-16">
            {dados.map((item) => {
              const alturaProducao = obterAlturaPercentual(item.producao, maximo)
              const alturaPerdas = obterAlturaPercentual(item.perdas, maximo)

              return (
                <div key={item.id} className="group flex h-full flex-1 flex-col items-center justify-end">
                  <div className="flex h-full w-full items-end justify-center space-x-2">
                    <div
                      className="relative w-10 rounded-t-md bg-primary transition-[opacity,transform] duration-200 hover:-translate-y-0.5 hover:opacity-90 motion-reduce:transform-none motion-reduce:transition-none sm:w-12"
                      style={{ height: `${alturaProducao}%` }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-1.5 py-0.5 text-[9px] tabular-nums text-white opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:transition-none">
                        {formatarQuantidade(item.producao)} un.
                      </div>
                    </div>

                    <div
                      className="relative w-10 rounded-t-md bg-red-400 transition-[opacity,transform] duration-200 hover:-translate-y-0.5 hover:opacity-90 motion-reduce:transform-none motion-reduce:transition-none sm:w-12"
                      style={{ height: `${alturaPerdas}%` }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-1.5 py-0.5 text-[9px] tabular-nums text-white opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:transition-none">
                        {formatarQuantidade(item.perdas)} un.
                      </div>
                    </div>
                  </div>

                  <span className="mt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    {item.nome}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
