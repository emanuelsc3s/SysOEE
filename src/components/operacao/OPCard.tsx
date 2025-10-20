/**
 * Componente OPCard - Card de Ordem de Produção para o Kanban
 * Exibe informações detalhadas de uma OP em formato de card
 */

import { OrdemProducao } from '@/types/operacao'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Package, 
  Factory, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Users
} from 'lucide-react'

interface OPCardProps {
  op: OrdemProducao
}

/**
 * Retorna a cor do badge baseado no turno
 */
function getCorTurno(turno: string): string {
  const cores: Record<string, string> = {
    '1º Turno': 'bg-blue-100 text-blue-800 border-blue-200',
    '2º Turno': 'bg-green-100 text-green-800 border-green-200',
    '3º Turno': 'bg-purple-100 text-purple-800 border-purple-200',
    'Administrativo': 'bg-gray-100 text-gray-800 border-gray-200'
  }
  return cores[turno] || 'bg-gray-100 text-gray-800 border-gray-200'
}

/**
 * Retorna a cor do badge baseado no setor
 */
function getCorSetor(setor: string): string {
  const cores: Record<string, string> = {
    'SPEP': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'SPPV': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'Líquidos': 'bg-teal-100 text-teal-800 border-teal-200',
    'CPHD': 'bg-amber-100 text-amber-800 border-amber-200'
  }
  return cores[setor] || 'bg-gray-100 text-gray-800 border-gray-200'
}

/**
 * Calcula a porcentagem de produção
 */
function calcularProgresso(produzido: number, teorico: number): number {
  if (teorico === 0) return 0
  return Math.min(Math.round((produzido / teorico) * 100), 100)
}

/**
 * Formata número com separador de milhares
 */
function formatarNumero(num: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 0
  }).format(num)
}

export default function OPCard({ op }: OPCardProps) {
  const progresso = calcularProgresso(op.produzido, op.quantidadeTeorica)
  const temPerdas = op.perdas > 0

  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary tab-prod:border-l-2">
      <CardHeader className="pb-3 tab-prod:pb-1 tab-prod:px-2 tab-prod:pt-2">
        <div className="flex items-start justify-between gap-2 tab-prod:gap-1">
          <CardTitle className="text-lg font-bold text-primary tab-prod:text-xs tab-prod:leading-tight">
            OP {op.op}
          </CardTitle>
          <div className="flex flex-col gap-1 items-end tab-prod:gap-0">
            <Badge className={`text-xs ${getCorSetor(op.setor)} tab-prod:text-[9px] tab-prod:px-0.5 tab-prod:py-0 tab-prod:leading-tight`}>
              {op.setor}
            </Badge>
            <Badge className={`text-xs ${getCorTurno(op.turno)} tab-prod:text-[9px] tab-prod:px-0.5 tab-prod:py-0 tab-prod:leading-tight`}>
              {op.turno}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 tab-prod:space-y-1 tab-prod:px-2 tab-prod:pb-2">
        {/* Data de Emissão */}
        <div className="flex items-center gap-2 text-sm tab-prod:gap-0.5 tab-prod:text-[10px]">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0 tab-prod:h-2.5 tab-prod:w-2.5" />
          <span className="text-muted-foreground tab-prod:hidden">Emissão:</span>
          <span className="font-medium">{op.dataEmissao}</span>
        </div>

        {/* Lote */}
        <div className="flex items-center gap-2 text-sm tab-prod:gap-0.5 tab-prod:text-[10px]">
          <Package className="h-4 w-4 text-muted-foreground flex-shrink-0 tab-prod:h-2.5 tab-prod:w-2.5" />
          <span className="text-muted-foreground tab-prod:hidden">Lote:</span>
          <span className="font-medium">{op.lote}</span>
        </div>

        {/* Produto */}
        <div className="pt-2 pb-2 border-t border-b border-border tab-prod:pt-1 tab-prod:pb-1">
          <p className="text-sm font-semibold text-foreground line-clamp-2 tab-prod:text-[10px] tab-prod:line-clamp-1 tab-prod:leading-tight" title={op.produto}>
            {op.produto}
          </p>
          <p className="text-xs text-muted-foreground mt-1 tab-prod:text-[9px] tab-prod:mt-0 tab-prod:leading-tight">
            SKU: {op.sku}
          </p>
        </div>

        {/* Equipamento */}
        <div className="flex items-center gap-2 text-sm tab-prod:gap-0.5 tab-prod:text-[10px]">
          <Factory className="h-4 w-4 text-muted-foreground flex-shrink-0 tab-prod:h-2.5 tab-prod:w-2.5" />
          <span className="text-muted-foreground tab-prod:hidden">Equipamento:</span>
          <span className="font-medium">{op.equipamento}</span>
        </div>

        {/* Horas e Turno */}
        <div className="flex items-center justify-between gap-2 text-sm tab-prod:gap-0.5 tab-prod:text-[10px]">
          <div className="flex items-center gap-2 tab-prod:gap-0.5">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0 tab-prod:h-2.5 tab-prod:w-2.5" />
            <span className="text-muted-foreground tab-prod:hidden">Horas:</span>
            <span className="font-medium">{op.horas}</span>
          </div>
        </div>

        {/* Quantidades */}
        <div className="space-y-2 pt-2 border-t border-border tab-prod:space-y-0.5 tab-prod:pt-1">
          <div className="flex items-center justify-between text-sm tab-prod:text-[10px]">
            <span className="text-muted-foreground">Teórico:</span>
            <span className="font-semibold">{formatarNumero(op.quantidadeTeorica)}</span>
          </div>

          <div className="flex items-center justify-between text-sm tab-prod:text-[10px]">
            <div className="flex items-center gap-1 tab-prod:gap-0.5">
              <CheckCircle2 className="h-4 w-4 text-green-600 tab-prod:h-2.5 tab-prod:w-2.5" />
              <span className="text-muted-foreground tab-prod:hidden">Produzido:</span>
              <span className="text-muted-foreground tab-prod:inline hidden">Prod:</span>
            </div>
            <span className="font-semibold text-green-700">
              {formatarNumero(op.produzido)} ({progresso}%)
            </span>
          </div>

          {temPerdas && (
            <div className="flex items-center justify-between text-sm tab-prod:text-[10px]">
              <div className="flex items-center gap-1 tab-prod:gap-0.5">
                <AlertTriangle className="h-4 w-4 text-orange-600 tab-prod:h-2.5 tab-prod:w-2.5" />
                <span className="text-muted-foreground">Perdas:</span>
              </div>
              <span className="font-semibold text-orange-700">
                {formatarNumero(op.perdas)}
              </span>
            </div>
          )}

          {/* Barra de Progresso */}
          <div className="pt-2 tab-prod:pt-0.5">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden tab-prod:h-1">
              <div
                className="bg-primary h-full transition-all duration-300 rounded-full"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
        </div>

        {/* Informações Adicionais (se disponíveis) - Ocultar em tablet para economizar espaço */}
        {(op.dossie || op.anvisa) && (
          <div className="pt-2 border-t border-border space-y-1 tab-prod:hidden">
            {op.dossie && (
              <p className="text-xs text-muted-foreground">
                Dossiê: <span className="font-medium">{op.dossie}</span>
              </p>
            )}
            {op.anvisa && (
              <p className="text-xs text-muted-foreground">
                ANVISA: <span className="font-medium">{op.anvisa}</span>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

