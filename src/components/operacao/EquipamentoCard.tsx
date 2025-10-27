/**
 * Componente EquipamentoCard - Card de Equipamento para o Kanban de Equipamentos
 * Exibe informações detalhadas de um equipamento/linha de produção
 */

import { Equipamento } from '@/types/equipamento'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Factory,
  Clock,
  User,
  Package,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  XCircle,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EquipamentoCardProps {
  equipamento: Equipamento
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
 * Retorna o ícone baseado no status
 */
function getIconeStatus(status: string) {
  const icones: Record<string, React.ReactNode> = {
    'Em Produção': <PlayCircle className="h-4 w-4 tab-prod:h-3 tab-prod:w-3" />,
    'Disponível': <CheckCircle2 className="h-4 w-4 tab-prod:h-3 tab-prod:w-3" />,
    'Paradas': <PauseCircle className="h-4 w-4 tab-prod:h-3 tab-prod:w-3" />,
    'Não Disponível': <XCircle className="h-4 w-4 tab-prod:h-3 tab-prod:w-3" />
  }
  return icones[status] || null
}

/**
 * Retorna a cor da borda lateral baseado no status
 */
function getCorBordaStatus(status: string): string {
  const cores: Record<string, string> = {
    'Em Produção': 'border-l-green-500',
    'Disponível': 'border-l-blue-500',
    'Paradas': 'border-l-orange-500',
    'Não Disponível': 'border-l-red-500'
  }
  return cores[status] || 'border-l-gray-500'
}

/**
 * Formata tempo em minutos para formato legível
 */
function formatarTempo(minutos: number): string {
  if (minutos < 60) {
    return `${minutos}min`
  }
  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60
  return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`
}

/**
 * Formata número com separador de milhares
 */
function formatarNumero(num: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 0
  }).format(num)
}

export default function EquipamentoCard({ equipamento }: EquipamentoCardProps) {
  const { status, nome, setor, turno, tempoNaEtapa, op, produto, lote, progresso, quantidadeProduzida, quantidadeTeorica, motivoParada, motivoIndisponibilidade, operador } = equipamento

  return (
    <Card
      className={cn(
        'w-full hover:shadow-md transition-all duration-200 border-l-4 tab-prod:border-l-2',
        getCorBordaStatus(status)
      )}
    >
      <CardHeader className="pb-3 tab-prod:pb-1 tab-prod:px-2 tab-prod:pt-2">
        <div className="flex items-start justify-between gap-2 tab-prod:gap-1">
          {/* Nome do Equipamento */}
          <CardTitle className="text-lg font-bold text-primary tab-prod:text-xs tab-prod:leading-tight flex items-center gap-2 tab-prod:gap-1">
            <Factory className="h-5 w-5 tab-prod:h-3 tab-prod:w-3 flex-shrink-0" />
            {nome}
          </CardTitle>

          {/* Badges de Setor */}
          <div className="flex flex-col gap-1 items-end tab-prod:gap-0">
            <Badge className={`text-xs ${getCorSetor(setor)} tab-prod:text-[9px] tab-prod:px-0.5 tab-prod:py-0 tab-prod:leading-tight`}>
              {setor}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 tab-prod:space-y-1 tab-prod:px-2 tab-prod:pb-2">
        {/* Tempo na Etapa */}
        <div className="flex items-center gap-2 text-sm tab-prod:gap-0.5 tab-prod:text-[10px]">
          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0 tab-prod:h-2.5 tab-prod:w-2.5" />
          <span className="text-muted-foreground tab-prod:hidden">Tempo:</span>
          <span className="font-medium">{formatarTempo(tempoNaEtapa)}</span>
        </div>

        {/* Turno (se disponível) */}
        {turno && (
          <div className="flex items-center gap-2 tab-prod:gap-1">
            <Badge className={`text-xs ${getCorTurno(turno)} tab-prod:text-[9px] tab-prod:px-1 tab-prod:py-0 tab-prod:leading-tight`}>
              {turno}
            </Badge>
          </div>
        )}

        {/* Conteúdo específico por status */}
        {status === 'Em Produção' && (
          <>
            {/* OP */}
            {op && (
              <div className="pt-2 border-t border-border tab-prod:pt-1">
                <div className="flex items-center gap-2 text-sm tab-prod:gap-0.5 tab-prod:text-[10px]">
                  <Package className="h-4 w-4 text-muted-foreground flex-shrink-0 tab-prod:h-2.5 tab-prod:w-2.5" />
                  <span className="text-muted-foreground tab-prod:hidden">OP:</span>
                  <span className="font-semibold text-primary">{op}</span>
                </div>
              </div>
            )}

            {/* Produto */}
            {produto && (
              <div className="pt-2 pb-2 border-t border-b border-border tab-prod:pt-1 tab-prod:pb-1">
                <p className="text-sm font-semibold text-foreground line-clamp-2 tab-prod:text-[10px] tab-prod:line-clamp-1 tab-prod:leading-tight" title={produto}>
                  {produto}
                </p>
                {lote && (
                  <p className="text-xs text-muted-foreground mt-1 tab-prod:text-[9px] tab-prod:mt-0 tab-prod:leading-tight">
                    Lote: {lote}
                  </p>
                )}
              </div>
            )}

            {/* Progresso */}
            {progresso !== undefined && (
              <div className="space-y-2 tab-prod:space-y-0.5">
                <div className="flex items-center justify-between text-sm tab-prod:text-[10px]">
                  <div className="flex items-center gap-1 tab-prod:gap-0.5">
                    <TrendingUp className="h-4 w-4 text-green-600 tab-prod:h-2.5 tab-prod:w-2.5" />
                    <span className="text-muted-foreground">Progresso:</span>
                  </div>
                  <span className="font-semibold text-green-700">{progresso}%</span>
                </div>

                {/* Quantidades */}
                {quantidadeProduzida !== undefined && quantidadeTeorica !== undefined && (
                  <div className="flex items-center justify-between text-xs tab-prod:text-[9px]">
                    <span className="text-muted-foreground">Produzido:</span>
                    <span className="font-medium">
                      {formatarNumero(quantidadeProduzida)} / {formatarNumero(quantidadeTeorica)}
                    </span>
                  </div>
                )}

                {/* Barra de Progresso */}
                <div className="pt-1 tab-prod:pt-0.5">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden tab-prod:h-1">
                    <div
                      className="bg-green-500 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${progresso}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Operador */}
            {operador && (
              <div className="flex items-center gap-2 text-sm tab-prod:gap-0.5 tab-prod:text-[10px] pt-2 border-t border-border tab-prod:pt-1">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0 tab-prod:h-2.5 tab-prod:w-2.5" />
                <span className="text-muted-foreground tab-prod:hidden">Operador:</span>
                <span className="font-medium">{operador}</span>
              </div>
            )}
          </>
        )}

        {status === 'Paradas' && (
          <>
            {/* Motivo da Parada */}
            {motivoParada && (
              <div className="pt-2 border-t border-border tab-prod:pt-1">
                <div className="flex items-start gap-2 text-sm tab-prod:gap-0.5 tab-prod:text-[10px]">
                  <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5 tab-prod:h-2.5 tab-prod:w-2.5" />
                  <div className="flex-1">
                    <span className="text-muted-foreground block tab-prod:hidden">Motivo:</span>
                    <span className="font-medium text-orange-700">{motivoParada}</span>
                  </div>
                </div>
              </div>
            )}

            {/* OP (se houver) */}
            {op && (
              <div className="flex items-center gap-2 text-sm tab-prod:gap-0.5 tab-prod:text-[10px]">
                <Package className="h-4 w-4 text-muted-foreground flex-shrink-0 tab-prod:h-2.5 tab-prod:w-2.5" />
                <span className="text-muted-foreground tab-prod:hidden">OP:</span>
                <span className="font-medium">{op}</span>
              </div>
            )}

            {/* Operador */}
            {operador && (
              <div className="flex items-center gap-2 text-sm tab-prod:gap-0.5 tab-prod:text-[10px]">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0 tab-prod:h-2.5 tab-prod:w-2.5" />
                <span className="text-muted-foreground tab-prod:hidden">Operador:</span>
                <span className="font-medium">{operador}</span>
              </div>
            )}
          </>
        )}

        {status === 'Não Disponível' && (
          <>
            {/* Motivo da Indisponibilidade */}
            {motivoIndisponibilidade && (
              <div className="pt-2 border-t border-border tab-prod:pt-1">
                <div className="flex items-start gap-2 text-sm tab-prod:gap-0.5 tab-prod:text-[10px]">
                  <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5 tab-prod:h-2.5 tab-prod:w-2.5" />
                  <div className="flex-1">
                    <span className="text-muted-foreground block tab-prod:hidden">Motivo:</span>
                    <span className="font-medium text-red-700">{motivoIndisponibilidade}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {status === 'Disponível' && (
          <div className="pt-2 border-t border-border tab-prod:pt-1">
            <div className="flex items-center gap-2 text-sm tab-prod:gap-0.5 tab-prod:text-[10px]">
              <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 tab-prod:h-2.5 tab-prod:w-2.5" />
              <span className="font-medium text-blue-700">Pronto para produção</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

