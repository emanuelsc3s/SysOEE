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
    <Card className="w-full hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-bold text-primary">
            OP {op.op}
          </CardTitle>
          <div className="flex flex-col gap-1 items-end">
            <Badge className={`text-xs ${getCorSetor(op.setor)}`}>
              {op.setor}
            </Badge>
            <Badge className={`text-xs ${getCorTurno(op.turno)}`}>
              {op.turno}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Data de Emissão */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">Emissão:</span>
          <span className="font-medium">{op.dataEmissao}</span>
        </div>

        {/* Lote */}
        <div className="flex items-center gap-2 text-sm">
          <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">Lote:</span>
          <span className="font-medium">{op.lote}</span>
        </div>

        {/* Produto */}
        <div className="pt-2 pb-2 border-t border-b border-border">
          <p className="text-sm font-semibold text-foreground line-clamp-2" title={op.produto}>
            {op.produto}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            SKU: {op.sku}
          </p>
        </div>

        {/* Equipamento */}
        <div className="flex items-center gap-2 text-sm">
          <Factory className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">Equipamento:</span>
          <span className="font-medium">{op.equipamento}</span>
        </div>

        {/* Horas e Turno */}
        <div className="flex items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">Horas:</span>
            <span className="font-medium">{op.horas}</span>
          </div>
        </div>

        {/* Quantidades */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Teórico:</span>
            <span className="font-semibold">{formatarNumero(op.quantidadeTeorica)}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-muted-foreground">Produzido:</span>
            </div>
            <span className="font-semibold text-green-700">
              {formatarNumero(op.produzido)} ({progresso}%)
            </span>
          </div>

          {temPerdas && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-muted-foreground">Perdas:</span>
              </div>
              <span className="font-semibold text-orange-700">
                {formatarNumero(op.perdas)}
              </span>
            </div>
          )}

          {/* Barra de Progresso */}
          <div className="pt-2">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300 rounded-full"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
        </div>

        {/* Informações Adicionais (se disponíveis) */}
        {(op.dossie || op.anvisa) && (
          <div className="pt-2 border-t border-border space-y-1">
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

