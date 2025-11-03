/**
 * Componente ContadoresKPI
 * Exibe chips/badges com contadores de treinamentos por status
 */

import { ContadoresTreinamento } from '@/types/colaborador'
import { Badge } from '@/components/ui/badge'
import { FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

interface ContadoresKPIProps {
  contadores: ContadoresTreinamento
}

export default function ContadoresKPI({ contadores }: ContadoresKPIProps) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {/* Total de POs */}
      <Badge
        variant="outline"
        className="px-3 py-1.5 text-sm font-medium border-primary/30 text-primary"
      >
        <FileText className="h-4 w-4 mr-1.5" />
        Total: {contadores.total}
      </Badge>

      {/* Concluídos */}
      <Badge className="px-3 py-1.5 text-sm font-medium bg-green-600 hover:bg-green-700 text-white">
        <CheckCircle2 className="h-4 w-4 mr-1.5" />
        Concluídos: {contadores.concluidos}
      </Badge>

      {/* Pendentes */}
      <Badge className="px-3 py-1.5 text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white">
        <Clock className="h-4 w-4 mr-1.5" />
        Pendentes: {contadores.pendentes}
      </Badge>

      {/* Vencidos */}
      <Badge className="px-3 py-1.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white">
        <AlertCircle className="h-4 w-4 mr-1.5" />
        Vencidos: {contadores.vencidos}
      </Badge>
    </div>
  )
}

