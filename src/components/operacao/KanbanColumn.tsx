/**
 * Componente KanbanColumn - Coluna do Kanban
 * Representa uma fase do processo produtivo com suas OPs
 */

import { OrdemProducao, FaseProducao } from '@/types/operacao'
import OPCard from './OPCard'
import { Badge } from '@/components/ui/badge'

interface KanbanColumnProps {
  fase: FaseProducao
  ops: OrdemProducao[]
}

/**
 * Retorna a cor de fundo da coluna baseado na fase
 */
function getCorFase(fase: FaseProducao): string {
  const cores: Record<FaseProducao, string> = {
    'Planejado': 'bg-slate-50 border-slate-200',
    'Parada': 'bg-red-50 border-red-200',
    'Emissão de Dossiê': 'bg-blue-50 border-blue-200',
    'Pesagem': 'bg-purple-50 border-purple-200',
    'Preparação': 'bg-indigo-50 border-indigo-200',
    'Envase': 'bg-cyan-50 border-cyan-200',
    'Embalagem': 'bg-teal-50 border-teal-200',
    'Concluído': 'bg-green-50 border-green-200'
  }
  return cores[fase]
}

/**
 * Retorna a cor do badge de contagem baseado na fase
 */
function getCorBadge(fase: FaseProducao): string {
  const cores: Record<FaseProducao, string> = {
    'Planejado': 'bg-slate-600 text-white',
    'Parada': 'bg-red-600 text-white',
    'Emissão de Dossiê': 'bg-blue-600 text-white',
    'Pesagem': 'bg-purple-600 text-white',
    'Preparação': 'bg-indigo-600 text-white',
    'Envase': 'bg-cyan-600 text-white',
    'Embalagem': 'bg-teal-600 text-white',
    'Concluído': 'bg-green-600 text-white'
  }
  return cores[fase]
}

export default function KanbanColumn({ fase, ops }: KanbanColumnProps) {
  return (
    <div className={`flex flex-col rounded-lg border-2 ${getCorFase(fase)} min-h-[600px] w-full tab-prod:min-h-[280px] tab-prod:rounded tab-prod:border`}>
      {/* Cabeçalho da Coluna */}
      <div className="p-4 border-b-2 border-inherit sticky top-0 bg-inherit z-10 tab-prod:p-1.5 tab-prod:border-b">
        <div className="flex items-center justify-between gap-2 tab-prod:gap-1">
          <h3 className="font-bold text-base text-foreground tab-prod:text-xs tab-prod:leading-tight">
            {fase}
          </h3>
          <Badge className={`${getCorBadge(fase)} font-semibold tab-prod:text-[10px] tab-prod:px-1 tab-prod:py-0 tab-prod:leading-tight`}>
            {ops.length}
          </Badge>
        </div>
      </div>

      {/* Lista de Cards */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto tab-prod:p-1.5 tab-prod:space-y-1.5">
        {ops.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm tab-prod:h-16 tab-prod:text-[10px]">
            Nenhuma OP nesta fase
          </div>
        ) : (
          ops.map((op) => (
            <OPCard key={op.op} op={op} />
          ))
        )}
      </div>
    </div>
  )
}

