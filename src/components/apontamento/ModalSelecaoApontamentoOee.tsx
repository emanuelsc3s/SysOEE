import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalSelecaoApontamentoOeeProps {
  /** Controla se o modal está aberto */
  aberto: boolean
  /** Callback chamado quando o modal é fechado */
  onFechar: () => void
}

export function ModalSelecaoApontamentoOee({
  aberto,
  onFechar,
}: ModalSelecaoApontamentoOeeProps) {
  const iconClassName = 'h-5 w-5 md:h-6 md:w-6'
  const cards = [
    {
      titulo: 'Apontamentos por Turno',
      descricao: 'Acesse a listagem detalhada e gerencie os lançamentos por turno.',
      rota: '/oee-turno',
      acao: 'Abrir listagem',
      icone: <FileText className={iconClassName} aria-hidden="true" />,
    },
    {
      titulo: 'Resumo Consolidado',
      descricao: 'Veja indicadores consolidados, tendências e comparativos do período.',
      rota: '/oee-resumo-turno',
      acao: 'Ver resumo',
      icone: <BarChart3 className={iconClassName} aria-hidden="true" />,
    },
  ]

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="sm:max-w-[760px] tab-prod:max-w-[560px] tab-prod:p-4 max-h-[90vh] overflow-y-auto overscroll-contain border-primary/10 bg-gradient-to-b from-background via-background to-muted/40">
        <DialogHeader className="tab-prod:space-y-1">
          <DialogTitle className="text-2xl tab-prod:text-lg font-bold text-primary">
            Apontamento de OEE
          </DialogTitle>
          <DialogDescription className="text-base tab-prod:text-xs">
            Escolha entre a listagem por turno ou o resumo consolidado.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5 tab-prod:mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 tab-prod:gap-2">
          {cards.map((card) => (
            <Link
              key={card.rota}
              to={card.rota}
              className={cn(
                'group relative flex h-full min-h-[140px] flex-col justify-between',
                'rounded-2xl border border-border/70 bg-card/95 p-4',
                'shadow-[0_14px_36px_-30px_hsl(var(--foreground)/0.55)]',
                'hover:border-primary/30 hover:shadow-[0_18px_40px_-30px_hsl(var(--primary)/0.35)]',
                'motion-safe:transition-[transform,box-shadow,border-color] motion-safe:duration-300',
                'motion-safe:hover:-translate-y-0.5',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {card.icone}
                </span>
              </div>

              <div className="mt-3">
                <h3 className="text-base font-semibold text-foreground">{card.titulo}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{card.descricao}</p>
              </div>

              <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                {card.acao}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
