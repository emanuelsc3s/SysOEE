/**
 * Componente CardParadasAtivas
 * Exibe lista de paradas em andamento e histórico de paradas finalizadas
 */

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

  // Estados do modal de confirmação de finalização
  const [modalFinalizacaoAberto, setModalFinalizacaoAberto] = useState(false)
  const [paradaParaFinalizar, setParadaParaFinalizar] = useState<string | null>(null)
  const [dataFinalizacao, setDataFinalizacao] = useState<string>('')
  const [horaFinalizacao, setHoraFinalizacao] = useState<string>('')
  const [errosFinalizacao, setErrosFinalizacao] = useState<{
    dataFinalizacao?: string
    horaFinalizacao?: string
  }>({})

  /**
   * Carrega paradas do localStorage
   */
  const carregarParadas = useCallback(() => {
    const ativas = buscarParadasEmAndamento(loteId)
    const finalizadas = buscarParadasFinalizadas(loteId)
    setParadasAtivas(ativas)
    setParadasFinalizadas(finalizadas)
  }, [loteId])

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
  }, [loteId, carregarParadas])

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
   * Abre modal de confirmação de finalização
   */
  const handleFinalizarParada = (paradaId: string) => {
    // Inicializa data e hora com valores atuais
    const agora = new Date()
    const dataAtual = agora.toISOString().split('T')[0] // YYYY-MM-DD
    const horaAtual = agora.toTimeString().split(' ')[0].substring(0, 8) // HH:MM:SS

    setParadaParaFinalizar(paradaId)
    setDataFinalizacao(dataAtual)
    setHoraFinalizacao(horaAtual)
    setErrosFinalizacao({})
    setModalFinalizacaoAberto(true)
  }

  /**
   * Valida data e hora de finalização
   */
  const validarFinalizacao = (parada: ParadaLocalStorage): boolean => {
    const novosErros: typeof errosFinalizacao = {}

    if (!dataFinalizacao) {
      novosErros.dataFinalizacao = 'Data de finalização é obrigatória'
    }

    if (!horaFinalizacao) {
      novosErros.horaFinalizacao = 'Hora de finalização é obrigatória'
    }

    if (dataFinalizacao && horaFinalizacao) {
      // Valida se data/hora não é futura
      const dataHoraFinalizacao = new Date(`${dataFinalizacao}T${horaFinalizacao}`)
      const agora = new Date()

      if (dataHoraFinalizacao > agora) {
        novosErros.dataFinalizacao = 'Data/hora de finalização não pode ser futura'
      }

      // Valida se data/hora não é anterior ao início da parada
      const dataHoraInicio = new Date(`${parada.data_parada}T${parada.hora_inicio}`)

      if (dataHoraFinalizacao < dataHoraInicio) {
        novosErros.dataFinalizacao = 'Data/hora de finalização não pode ser anterior ao início da parada'
      }
    }

    setErrosFinalizacao(novosErros)
    return Object.keys(novosErros).length === 0
  }

  /**
   * Confirma finalização da parada com data/hora validada
   */
  const confirmarFinalizacao = async () => {
    if (!paradaParaFinalizar) return

    // Busca a parada para validação
    const parada = paradasAtivas.find(p => p.id === paradaParaFinalizar)
    if (!parada) return

    // Valida data e hora
    if (!validarFinalizacao(parada)) {
      return
    }

    setFinalizandoId(paradaParaFinalizar)
    setModalFinalizacaoAberto(false)

    try {
      const paradaAtualizada = finalizarParada(paradaParaFinalizar, horaFinalizacao, usuarioId)

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
      setParadaParaFinalizar(null)
    }
  }

  /**
   * Cancela finalização
   */
  const cancelarFinalizacao = () => {
    setModalFinalizacaoAberto(false)
    setParadaParaFinalizar(null)
    setDataFinalizacao('')
    setHoraFinalizacao('')
    setErrosFinalizacao({})
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

      {/* Dialog: Confirmação de Finalização de Parada */}
      <Dialog open={modalFinalizacaoAberto} onOpenChange={setModalFinalizacaoAberto}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-orange-500" />
              Confirmar Finalização de Parada
            </DialogTitle>
            <DialogDescription>
              Informe a data e hora exatas em que a parada foi finalizada.
              <br />
              <span className="text-xs text-muted-foreground mt-1 block">
                ⚠️ Princípio ALCOA+: Registro contemporâneo e exato
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Data de Finalização */}
            <div className="space-y-2">
              <Label htmlFor="dataFinalizacao">
                Data de Finalização *
              </Label>
              <Input
                id="dataFinalizacao"
                type="date"
                value={dataFinalizacao}
                onChange={(e) => {
                  setDataFinalizacao(e.target.value)
                  if (errosFinalizacao.dataFinalizacao) {
                    setErrosFinalizacao({ ...errosFinalizacao, dataFinalizacao: undefined })
                  }
                }}
                className={errosFinalizacao.dataFinalizacao ? 'border-red-500' : ''}
              />
              {errosFinalizacao.dataFinalizacao && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errosFinalizacao.dataFinalizacao}
                </p>
              )}
            </div>

            {/* Hora de Finalização */}
            <div className="space-y-2">
              <Label htmlFor="horaFinalizacao">
                Hora de Finalização *
              </Label>
              <Input
                id="horaFinalizacao"
                type="time"
                step="1"
                value={horaFinalizacao}
                onChange={(e) => {
                  setHoraFinalizacao(e.target.value)
                  if (errosFinalizacao.horaFinalizacao) {
                    setErrosFinalizacao({ ...errosFinalizacao, horaFinalizacao: undefined })
                  }
                }}
                className={errosFinalizacao.horaFinalizacao ? 'border-red-500' : ''}
              />
              {errosFinalizacao.horaFinalizacao && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errosFinalizacao.horaFinalizacao}
                </p>
              )}
            </div>

            {/* Informações da Parada */}
            {paradaParaFinalizar && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
                <p className="text-sm font-medium text-blue-900">
                  Parada a ser finalizada:
                </p>
                <p className="text-xs text-blue-700">
                  {obterDescricaoParada(
                    paradasAtivas.find(p => p.id === paradaParaFinalizar)?.codigo_parada_id || ''
                  )}
                </p>
                <p className="text-xs text-blue-600">
                  Início: {paradasAtivas.find(p => p.id === paradaParaFinalizar)?.data_parada} às{' '}
                  {paradasAtivas.find(p => p.id === paradaParaFinalizar)?.hora_inicio}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={cancelarFinalizacao}
              disabled={finalizandoId !== null}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={confirmarFinalizacao}
              disabled={finalizandoId !== null}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {finalizandoId ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Finalizando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmar Finalização
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

