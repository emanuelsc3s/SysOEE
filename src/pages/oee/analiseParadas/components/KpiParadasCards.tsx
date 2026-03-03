import { cn } from '@/lib/utils'
import type { AnaliseParadasKpis } from '../types'
import {
  formatarDataHoraAtualizacao,
  formatarMinutosHHMM,
  formatarNumeroInteiro,
  formatarPercentual,
} from '../utils/formatters'

type KpiParadasCardsProps = {
  kpis: AnaliseParadasKpis
  atualizadoEm: number
}

type CardKpi = {
  id: string
  titulo: string
  valor: string
  detalhe: string
  classeAccent: string
  classeValor?: string
}

export function KpiParadasCards({ kpis, atualizadoEm }: KpiParadasCardsProps) {
  const cards: CardKpi[] = [
    {
      id: 'tempo-total',
      titulo: 'Tempo total de paradas',
      valor: formatarMinutosHHMM(kpis.tempoTotalMinutos),
      detalhe: 'Soma de grandes, pequenas e estratégicas',
      classeAccent: 'bg-primary/80',
    },
    {
      id: 'tempo-grandes',
      titulo: 'Paradas grandes',
      valor: formatarMinutosHHMM(kpis.tempoGrandesMinutos),
      detalhe: `${formatarPercentual(kpis.indiceGrandesPercentual)} do total`,
      classeAccent: 'bg-red-500/80',
      classeValor: 'text-red-600',
    },
    {
      id: 'tempo-pequenas',
      titulo: 'Paradas pequenas',
      valor: formatarMinutosHHMM(kpis.tempoPequenasMinutos),
      detalhe: `${formatarPercentual(kpis.indicePequenasPercentual)} do total`,
      classeAccent: 'bg-amber-500/80',
      classeValor: 'text-amber-600',
    },
    {
      id: 'tempo-estrategicas',
      titulo: 'Paradas estratégicas',
      valor: formatarMinutosHHMM(kpis.tempoEstrategicasMinutos),
      detalhe: `${formatarPercentual(kpis.indiceEstrategicasPercentual)} do total`,
      classeAccent: 'bg-slate-400/80',
    },
    {
      id: 'ocorrencias',
      titulo: 'Ocorrências',
      valor: formatarNumeroInteiro(kpis.ocorrenciasTotais),
      detalhe: `${formatarNumeroInteiro(kpis.ocorrenciasGrandes)} com impacto direto na disponibilidade`,
      classeAccent: 'bg-primary/80',
    },
    {
      id: 'impacto',
      titulo: 'Cobertura de impacto',
      valor: `${formatarNumeroInteiro(kpis.linhasImpactadas)} linhas`,
      detalhe: `${formatarNumeroInteiro(kpis.turnosComParada)} turnos com paradas`,
      classeAccent: 'bg-primary/80',
    },
  ]

  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-gray-500">
          Indicadores executivos de paradas
        </h2>
        <p className="text-xs text-gray-500">
          Atualizado em {formatarDataHoraAtualizacao(atualizadoEm)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {cards.map((card) => (
            <article
              key={card.id}
              className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none"
            >
              <span
                className={cn(
                  'mb-3 block h-1.5 w-11 rounded-full transition-[width] duration-200 group-hover:w-14 motion-reduce:transition-none',
                  card.classeAccent
                )}
                aria-hidden="true"
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-gray-500">
                  {card.titulo}
                </p>
              </div>
              <p className={cn('mt-1 text-xl font-semibold leading-tight tabular-nums sm:text-2xl text-gray-800', card.classeValor)}>
                {card.valor}
              </p>
              <p className="mt-1 text-sm leading-5 text-gray-500">{card.detalhe}</p>
            </article>
        ))}
      </div>
    </section>
  )
}
