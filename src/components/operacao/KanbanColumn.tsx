/**
 * Componente KanbanColumn - Coluna do Kanban
 * Representa uma fase do processo produtivo com suas OPs
 */

import { OrdemProducao, FaseProducao, FASES_CONFIG } from '@/types/operacao'
import OPCard from './OPCard'
import { Badge } from '@/components/ui/badge'
import { useDroppable } from '@dnd-kit/core'
import {
  ClipboardList,
  FileText,
  Scale,
  Beaker,
  Droplet,
  Zap,
  Package,
  CheckCircle2,
  LucideIcon
} from 'lucide-react'

interface KanbanColumnProps {
  fase: FaseProducao
  ops: OrdemProducao[]
}

/**
 * Mapeamento de ícones para cada fase
 */
const ICONES_FASES: Record<FaseProducao, LucideIcon> = {
  'Planejado': ClipboardList,
  'Emissão de Dossiê': FileText,
  'Pesagem': Scale,
  'Preparação': Beaker,
  'Envase': Droplet,
  'Esterilização': Zap,
  'Embalagem': Package,
  'Concluído': CheckCircle2
}

export default function KanbanColumn({ fase, ops }: KanbanColumnProps) {
  // Configura a coluna como área de drop
  const { setNodeRef, isOver } = useDroppable({
    id: fase,
  })

  // Obtém configuração da fase
  const config = FASES_CONFIG[fase]
  const IconeFase = ICONES_FASES[fase]

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-lg bg-white/50 border border-border ${config.borderClass} border-l-4 min-h-[600px] w-full tab-prod:min-h-[280px] tab-prod:rounded tab-prod:border-l-[3px] transition-all duration-300 ${
        isOver ? 'ring-2 ring-primary/30 scale-[1.01] bg-white/80' : ''
      }`}
    >
      {/* Cabeçalho da Coluna */}
      <div className="p-4 border-b border-border/50 sticky top-0 bg-white/80 backdrop-blur-sm z-10 tab-prod:p-2">
        <div className="flex items-center justify-between gap-3 tab-prod:gap-1.5">
          <div className="flex items-center gap-2 tab-prod:gap-1">
            <IconeFase
              className={`h-5 w-5 flex-shrink-0 tab-prod:h-4 tab-prod:w-4 ${config.textClass}`}
              strokeWidth={2}
            />
            <h3 className={`font-bold text-base leading-tight tab-prod:text-xs ${config.textClass}`}>
              {fase}
            </h3>
          </div>
          <Badge className={`${config.badgeClass} font-semibold rounded-full shadow-sm tab-prod:text-[10px] tab-prod:px-1.5 tab-prod:py-0.5`}>
            {ops.length}
          </Badge>
        </div>
      </div>

      {/* Lista de Cards */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto tab-prod:p-2 tab-prod:space-y-2">
        {ops.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-32 text-muted-foreground text-sm tab-prod:h-24 tab-prod:text-xs transition-all duration-200 ${
            isOver ? 'text-primary font-semibold scale-105' : ''
          }`}>
            {isOver ? (
              <>
                <IconeFase className="h-8 w-8 mb-2 tab-prod:h-6 tab-prod:w-6" />
                <span>Solte aqui</span>
              </>
            ) : (
              <>
                <IconeFase className="h-8 w-8 mb-2 opacity-30 tab-prod:h-6 tab-prod:w-6" />
                <span>Nenhuma OP</span>
              </>
            )}
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

