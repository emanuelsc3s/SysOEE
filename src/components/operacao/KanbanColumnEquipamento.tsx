/**
 * Componente KanbanColumnEquipamento - Coluna do Kanban de Equipamentos
 * Representa uma etapa operacional com seus equipamentos
 */

import { Equipamento, StatusEquipamento } from '@/types/equipamento'
import EquipamentoCard from './EquipamentoCard'
import { Badge } from '@/components/ui/badge'

interface KanbanColumnEquipamentoProps {
  status: StatusEquipamento
  equipamentos: Equipamento[]
}

/**
 * Retorna a cor de fundo da coluna baseado no status
 */
function getCorStatus(status: StatusEquipamento): string {
  const cores: Record<StatusEquipamento, string> = {
    'Disponível': 'bg-blue-50 border-blue-200',
    'Não Disponível': 'bg-red-50 border-red-200',
    'Paradas': 'bg-orange-50 border-orange-200',
    'Em Produção': 'bg-green-50 border-green-200'
  }
  return cores[status]
}

/**
 * Retorna a cor do badge de contagem baseado no status
 */
function getCorBadge(status: StatusEquipamento): string {
  const cores: Record<StatusEquipamento, string> = {
    'Disponível': 'bg-blue-600 text-white',
    'Não Disponível': 'bg-red-600 text-white',
    'Paradas': 'bg-orange-600 text-white',
    'Em Produção': 'bg-green-600 text-white'
  }
  return cores[status]
}

/**
 * Retorna o ícone baseado no status
 */
function getIconeStatus(status: StatusEquipamento): string {
  const icones: Record<StatusEquipamento, string> = {
    'Disponível': '✓',
    'Não Disponível': '✕',
    'Paradas': '⏸',
    'Em Produção': '▶'
  }
  return icones[status]
}

export default function KanbanColumnEquipamento({ status, equipamentos }: KanbanColumnEquipamentoProps) {
  return (
    <div
      className={`flex flex-col rounded-lg border-2 ${getCorStatus(status)} min-h-[600px] w-full tab-prod:min-h-[280px] tab-prod:rounded tab-prod:border transition-all duration-200`}
    >
      {/* Cabeçalho da Coluna */}
      <div className="p-4 border-b-2 border-inherit sticky top-0 bg-inherit z-10 tab-prod:p-1.5 tab-prod:border-b">
        <div className="flex items-center justify-between gap-2 tab-prod:gap-1">
          <div className="flex items-center gap-2 tab-prod:gap-1">
            <span className="text-xl tab-prod:text-sm">{getIconeStatus(status)}</span>
            <h3 className="font-bold text-base text-foreground tab-prod:text-xs tab-prod:leading-tight">
              {status}
            </h3>
          </div>
          <Badge className={`${getCorBadge(status)} font-semibold tab-prod:text-[10px] tab-prod:px-1 tab-prod:py-0 tab-prod:leading-tight`}>
            {equipamentos.length}
          </Badge>
        </div>
      </div>

      {/* Lista de Cards */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto tab-prod:p-1.5 tab-prod:space-y-1.5">
        {equipamentos.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm tab-prod:h-16 tab-prod:text-[10px]">
            Nenhum equipamento nesta etapa
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

