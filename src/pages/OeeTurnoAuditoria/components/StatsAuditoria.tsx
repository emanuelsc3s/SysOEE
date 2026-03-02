import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { StatsOperacoes } from '../types/turnoLog.types'

interface StatsAuditoriaProps {
  stats: StatsOperacoes
  loading: boolean
}

export function StatsAuditoria({ stats, loading }: StatsAuditoriaProps) {
  const itens = [
    {
      label: 'Inclusões',
      valor: stats.inclusoes,
      Icone: Plus,
      corIcone: 'text-emerald-600',
      corBg: 'bg-emerald-50',
      corBorda: 'border-emerald-200',
    },
    {
      label: 'Alterações',
      valor: stats.alteracoes,
      Icone: Pencil,
      corIcone: 'text-blue-600',
      corBg: 'bg-blue-50',
      corBorda: 'border-blue-200',
    },
    {
      label: 'Exclusões',
      valor: stats.exclusoes,
      Icone: Trash2,
      corIcone: 'text-red-600',
      corBg: 'bg-red-50',
      corBorda: 'border-red-200',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {itens.map(({ label, valor, Icone, corIcone, corBg, corBorda }) => (
        <Card key={label} className={`border ${corBorda}`}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`rounded-xl p-3 ${corBg}`}>
              <Icone className={`h-5 w-5 ${corIcone}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                {label}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {loading ? '—' : valor.toLocaleString('pt-BR')}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
