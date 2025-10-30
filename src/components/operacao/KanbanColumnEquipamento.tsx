/**
 * Componente KanbanColumnEquipamento - Coluna do Kanban de Equipamentos
 * Representa uma etapa operacional com seus equipamentos (Redesign 2025)
 */

import { Equipamento, StatusEquipamento, STATUS_CONFIG } from '@/types/equipamento'
import EquipamentoCard from './EquipamentoCard'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  Play,
  Pause,
  XCircle,
  LucideIcon
} from 'lucide-react'

interface KanbanColumnEquipamentoProps {
  status: StatusEquipamento
  equipamentos: Equipamento[]
}

/**
 * Mapeamento de ícones para cada status
 */
const ICONES_STATUS: Record<StatusEquipamento, LucideIcon> = {
  'Disponível': CheckCircle,
  'Em Produção': Play,
  'Paradas': Pause,
  'Não Disponível': XCircle
}

export default function KanbanColumnEquipamento({ status, equipamentos }: KanbanColumnEquipamentoProps) {
  // Obtém configuração do status
  const config = STATUS_CONFIG[status]
  const IconeStatus = ICONES_STATUS[status]

  return (
    <div
      className={`flex flex-col rounded-lg bg-white/50 border border-border min-h-[600px] w-full tab-prod:min-h-[280px] tab-prod:rounded transition-all duration-300`}
    >
      {/* Cabeçalho da Coluna */}
      <div className="p-4 border-b border-border/50 sticky top-0 bg-white/80 backdrop-blur-sm z-10 tab-prod:p-2">
        <div className="flex items-center justify-between gap-3 tab-prod:gap-1.5">
          <div className="flex items-center gap-2 tab-prod:gap-1">
            <IconeStatus
              className={`h-5 w-5 flex-shrink-0 tab-prod:h-4 tab-prod:w-4 ${config.textClass}`}
              strokeWidth={2}
            />
            <h3 className={`font-bold text-base leading-tight tab-prod:text-xs ${config.textClass}`}>
              {status}
            </h3>
          </div>
          <Badge className={`${config.badgeClass} font-semibold rounded-full shadow-sm tab-prod:text-[10px] tab-prod:px-1.5 tab-prod:py-0.5`}>
            {equipamentos.length}
          </Badge>
        </div>
      </div>

      {/* Lista de Cards */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto tab-prod:p-2 tab-prod:space-y-2">
        {equipamentos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm tab-prod:h-24 tab-prod:text-xs">
            <IconeStatus className="h-8 w-8 mb-2 opacity-30 tab-prod:h-6 tab-prod:w-6" />
            <span>Nenhum equipamento</span>
          </div>
        ) : (
          equipamentos.map((equipamento) => (
            <EquipamentoCard key={equipamento.id} equipamento={equipamento} />
          ))
        )}
      </div>
    </div>
  )
}

