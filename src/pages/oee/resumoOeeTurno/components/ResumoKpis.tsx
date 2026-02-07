import { cn } from '@/lib/utils'
import type { CardResumo } from '../types'

type ResumoKpisProps = {
  cards: CardResumo[]
}

const CARD_ACCENTS: Record<string, string> = {
  producao: 'bg-primary/80',
  perdas: 'bg-red-500/80',
  boas: 'bg-emerald-500/80',
  'paradas-grandes': 'bg-orange-500/80',
  'paradas-totais': 'bg-orange-500/80',
  'paradas-estrategicas': 'bg-slate-400/80',
}

export function ResumoKpis({ cards }: ResumoKpisProps) {
  return (
    <section className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
      {cards.map((card) => (
        <article
          key={card.id}
          className="group min-w-[210px] flex-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none"
        >
          <span
            className={cn(
              'mb-3 block h-1.5 w-11 rounded-full transition-[width] duration-200 group-hover:w-14 motion-reduce:transition-none',
              CARD_ACCENTS[card.id] || 'bg-gray-300'
            )}
            aria-hidden="true"
          />

          <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-gray-500">
            {card.titulo}
          </h3>
          <p
            className={cn(
              'mt-1 text-xl font-semibold leading-tight tabular-nums sm:text-2xl',
              card.classeValor || 'text-gray-800 dark:text-gray-100'
            )}
          >
            {card.valor}
          </p>
          <p className="mt-1 text-sm leading-5 text-gray-500">{card.detalhe}</p>
        </article>
      ))}
    </section>
  )
}
