/**
 * Componente CardParadasAtivas
 * Exibe lista de paradas em andamento e histórico de paradas finalizadas
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertCircle, 
  Clock, 
  User, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  XCircle,
  Loader2
} from 'lucide-react'
import { 
  buscarParadasEmAndamento, 
  buscarParadasFinalizadas,
  finalizarParada,
  calcularTempoDecorrido,
  formatarDuracao,
  ParadaLocalStorage
} from '@/services/localStorage/parada.storage'
import { CodigoParada } from '@/types/parada'

interface CardParadasAtivasProps {
  /** ID do lote da OP */
  loteId: string
  
  /** Códigos de parada para exibir descrições */
  codigosParada: CodigoParada[]
  
  /** ID do usuário atual */
  usuarioId: number
  
  /** Callback quando uma parada é finalizada */
  onParadaFinalizada?: () => void
}

export function CardParadasAtivas({ 
  loteId, 
  codigosParada, 
  usuarioId,
  onParadaFinalizada 
}: CardParadasAtivasProps) {
  const [paradasAtivas, setParadasAtivas] = useState<ParadaLocalStorage[]>([])
  const [paradasFinalizadas, setParadasFinalizadas] = useState<ParadaLocalStorage[]>([])
  const [mostrarHistorico, setMostrarHistorico] = useState(false)
  const [finalizandoId, setFinalizandoId] = useState<string | null>(null)
  const [temposDecorridos, setTemposDecorridos] = useState<Record<string, number>>({})

  /**
   * Carrega paradas do localStorage
   */
  const carregarParadas = () => {
    const ativas = buscarParadasEmAndamento(loteId)
    const finalizadas = buscarParadasFinalizadas(loteId)
    setParadasAtivas(ativas)
    setParadasFinalizadas(finalizadas)
  }

  /**
   * Atualiza tempos decorridos a cada segundo
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const novosTempos: Record<string, number> = {}
      paradasAtivas.forEach(parada => {
        novosTempos[parada.id] = calcularTempoDecorrido(parada.hora_inicio)
      })
      setTemposDecorridos(novosTempos)
    }, 1000)

    return () => clearInterval(interval)
  }, [paradasAtivas])

  /**
   * Carrega paradas ao montar e quando loteId mudar
   */
  useEffect(() => {
    carregarParadas()
  }, [loteId])

  /**
   * Busca descrição do código de parada
   */
  const obterDescricaoParada = (codigoParadaId: string): string => {
    const codigo = codigosParada.find(c => c.id === codigoParadaId)
    if (!codigo) return 'Código não encontrado'
    
    // Monta descrição hierárquica
    const partes = [
      codigo.nivel_2_grande_parada,
      codigo.nivel_3_apontamento,
      codigo.nivel_4_grupo,
      codigo.nivel_5_detalhamento
    ].filter(Boolean)
    
    return partes.join(' - ')
  }

  /**
   * Finaliza uma parada
   */
  const handleFinalizarParada = async (paradaId: string) => {
    setFinalizandoId(paradaId)
    
    try {
      const agora = new Date()
      const horaFim = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}:${String(agora.getSeconds()).padStart(2, '0')}`
      
      const paradaAtualizada = finalizarParada(paradaId, horaFim, usuarioId)
      
      if (paradaAtualizada) {
        console.log('✅ Parada finalizada:', paradaAtualizada)
        
        // Recarrega paradas
        carregarParadas()
        
        // Callback
        if (onParadaFinalizada) {
          onParadaFinalizada()
        }
        
        // Feedback visual
        alert(`✅ Parada finalizada com sucesso!\n\nDuração: ${formatarDuracao(paradaAtualizada.duracao_minutos || 0)}`)
      } else {
        throw new Error('Erro ao finalizar parada')
      }
    } catch (error) {
      console.error('❌ Erro ao finalizar parada:', error)
      alert('❌ Erro ao finalizar parada. Tente novamente.')
    } finally {
      setFinalizandoId(null)
    }
  }

  // Se não há paradas, não exibe o card
  if (paradasAtivas.length === 0 && paradasFinalizadas.length === 0) {
    return null
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-3 tab-prod:pb-2 tab-prod:px-3 tab-prod:pt-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2 tab-prod:text-sm">
            <AlertCircle className="h-5 w-5 text-orange-600 tab-prod:h-4 tab-prod:w-4" />
            Paradas em Andamento
            {paradasAtivas.length > 0 && (
              <Badge variant="destructive" className="ml-2 tab-prod:text-xs">
                {paradasAtivas.length}
              </Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 tab-prod:space-y-2 tab-prod:px-3 tab-prod:pb-3">
        {/* Paradas Ativas */}
        {paradasAtivas.length > 0 ? (
          <div className="space-y-2 tab-prod:space-y-1.5">
            {paradasAtivas.map(parada => (
              <div 
                key={parada.id}
                className="bg-white border border-orange-200 rounded-lg p-3 space-y-2 tab-prod:p-2 tab-prod:space-y-1.5"
              >
                {/* Descrição da Parada */}
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5 tab-prod:h-3 tab-prod:w-3" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-orange-900 tab-prod:text-xs">
                      {obterDescricaoParada(parada.codigo_parada_id)}
                    </p>
                  </div>
                </div>

                {/* Informações */}
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground tab-prod:text-[10px]">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 tab-prod:h-2.5 tab-prod:w-2.5" />
                    <span>Início: {parada.hora_inicio.substring(0, 5)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 tab-prod:h-2.5 tab-prod:w-2.5" />
                    <span>Op. {parada.criado_por_operador}</span>
                  </div>
                </div>

                {/* Duração em tempo real */}
                <div className="flex items-center justify-between pt-2 border-t border-orange-100 tab-prod:pt-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600 tab-prod:h-3 tab-prod:w-3" />
                    <span className="font-mono font-bold text-orange-700 text-sm tab-prod:text-xs">
                      {formatarDuracao(temposDecorridos[parada.id] || 0)}
                    </span>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => handleFinalizarParada(parada.id)}
                    disabled={finalizandoId === parada.id}
                    className="h-7 text-xs tab-prod:h-6 tab-prod:text-[10px]"
                  >
                    {finalizandoId === parada.id ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Finalizando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Finalizar
                      </>
                    )}
                  </Button>
                </div>

                {/* Observação (se houver) */}
                {parada.observacao && (
                  <div className="pt-2 border-t border-orange-100 tab-prod:pt-1">
                    <p className="text-xs text-muted-foreground italic tab-prod:text-[10px]">
                      "{parada.observacao}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground tab-prod:py-3 tab-prod:text-xs">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500 tab-prod:h-6 tab-prod:w-6" />
            <p>Nenhuma parada em andamento</p>
          </div>
        )}

        {/* Histórico de Paradas Finalizadas */}
        {paradasFinalizadas.length > 0 && (
          <div className="pt-3 border-t border-orange-200 tab-prod:pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMostrarHistorico(!mostrarHistorico)}
              className="w-full justify-between text-xs tab-prod:text-[10px] tab-prod:h-7"
            >
              <span className="flex items-center gap-2">
                📊 Histórico de Paradas ({paradasFinalizadas.length})
              </span>
              {mostrarHistorico ? (
                <ChevronUp className="h-4 w-4 tab-prod:h-3 tab-prod:w-3" />
              ) : (
                <ChevronDown className="h-4 w-4 tab-prod:h-3 tab-prod:w-3" />
              )}
            </Button>

            {mostrarHistorico && (
              <div className="mt-2 space-y-2 tab-prod:mt-1.5 tab-prod:space-y-1.5">
                {paradasFinalizadas.map(parada => (
                  <div 
                    key={parada.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-2 space-y-1.5 tab-prod:p-1.5"
                  >
                    <div className="flex items-start gap-2">
                      <XCircle className="h-3 w-3 text-gray-500 flex-shrink-0 mt-0.5 tab-prod:h-2.5 tab-prod:w-2.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs text-gray-700 tab-prod:text-[10px]">
                          {obterDescricaoParada(parada.codigo_parada_id)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-[10px] text-muted-foreground tab-prod:text-[9px]">
                      <div>
                        <span className="font-medium">Início:</span> {parada.hora_inicio.substring(0, 5)}
                      </div>
                      <div>
                        <span className="font-medium">Fim:</span> {parada.hora_fim?.substring(0, 5)}
                      </div>
                      <div className="font-mono font-bold text-gray-700">
                        {formatarDuracao(parada.duracao_minutos || 0)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

