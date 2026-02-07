import { cn } from '@/lib/utils'
import type { CardResumo } from '../types'

type ResumoKpisProps = {
  cards: CardResumo[]
}

export function ResumoKpis({ cards }: ResumoKpisProps) {
  return (
    <section className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
      {cards.map((card) => (
        <article
          key={card.id}
          className="min-w-[180px] flex-1 bg-surface-light dark:bg-surface-dark p-3 rounded-lg border border-border-light dark:border-border-dark shadow-sm"
        >
          <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{card.titulo}</h3>
          <p className={cn('text-lg font-bold', card.classeValor || 'text-gray-800 dark:text-gray-100')}>
            {card.valor}
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">{card.detalhe}</p>
        </article>
      ))}
    </section>
  )
}
