/**
 * Modal de Apontamento de Parada de Produção
 * Permite registrar paradas contemporâneas seguindo princípios ALCOA+
 * Seleção simplificada de tipo de parada
 *
 * Versão 3.0: Formulário simplificado com dropdown único
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  AlertTriangle,
  Clock,
  Pause,
  AlertCircle,
  User,
  CheckCircle2,
  XCircle,
  Loader2,
  Plus
} from 'lucide-react'
import { CodigoParada, Turno, CriarApontamentoParadaDTO } from '@/types/parada'
import {
  buscarParadasEmAndamento,
  buscarParadasFinalizadas,
  finalizarParada as finalizarParadaLS,
  calcularTempoDecorrido,
  formatarDuracao,
  ParadaLocalStorage
} from '@/services/localStorage/parada.storage'

interface ModalApontamentoParadaProps {
  /** Controla se o modal está aberto */
  aberto: boolean
  /** Callback chamado quando o modal é fechado */
  onFechar: () => void
  /** Callback chamado quando a parada é registrada com sucesso */
  onConfirmar: (dados: CriarApontamentoParadaDTO) => void
  /** Callback chamado quando uma parada é finalizada (opcional) */
  onParadaFinalizada?: (duracaoMinutos: number) => void
  /** Número da OP em execução */
  numeroOP: string
  /** ID da linha de produção */
  linhaId: string
  /** ID do lote (opcional) */
  loteId?: string | null
  /** Lista de códigos de parada disponíveis */
  codigosParada: CodigoParada[]
  /** Lista de turnos disponíveis */
  turnos: Turno[]
  /** ID do usuário logado */
  usuarioId: number
}

/**
 * Modal de Apontamento de Parada
 * Otimizado para tablet de produção (1000x400px)
 */
export function ModalApontamentoParada({
  aberto,
  onFechar,
  onConfirmar,
  onParadaFinalizada,
  numeroOP,
  linhaId,
  loteId,
  codigosParada,
  turnos,
  usuarioId,
}: ModalApontamentoParadaProps) {
  // Estados de controle de abas
  const [abaAtiva, setAbaAtiva] = useState<string>('em-andamento')

  // Estados de paradas
  const [paradasAtivas, setParadasAtivas] = useState<ParadaLocalStorage[]>([])
  const [paradasFinalizadas, setParadasFinalizadas] = useState<ParadaLocalStorage[]>([])
  const [temposDecorridos, setTemposDecorridos] = useState<Record<string, number>>({})
  const [finalizandoId, setFinalizandoId] = useState<string | null>(null)

  // Estado do Alert Dialog de validação
  const [alertParadasAtivasAberto, setAlertParadasAtivasAberto] = useState(false)

  // Estado do Alert Dialog de sucesso ao registrar parada
  const [alertSucessoAberto, setAlertSucessoAberto] = useState(false)
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('')

  // Estados do modal de confirmação de finalização
  const [modalFinalizacaoAberto, setModalFinalizacaoAberto] = useState(false)
  const [paradaParaFinalizar, setParadaParaFinalizar] = useState<string | null>(null)
  const [dataFinalizacao, setDataFinalizacao] = useState<string>('')
  const [horaFinalizacao, setHoraFinalizacao] = useState<string>('')
  const [errosFinalizacao, setErrosFinalizacao] = useState<{
    dataFinalizacao?: string
    horaFinalizacao?: string
  }>({})

  // Estados do formulário
  const [tipoParadaSelecionado, setTipoParadaSelecionado] = useState<string>('')
  const [turnoSelecionado, setTurnoSelecionado] = useState<string>('')
  const [dataParada, setDataParada] = useState<string>('')
  const [horaInicio, setHoraInicio] = useState<string>('')
  const [observacao, setObservacao] = useState<string>('')

  // Estados de validação
  const [erros, setErros] = useState<{
    tipoParada?: string
    turno?: string
    dataParada?: string
    horaInicio?: string
  }>({})

  // Detecta turno atual automaticamente quando o modal é aberto
  // NOTA: Data e hora NÃO são mais inicializadas aqui (contemporaneidade)
  // Serão capturadas apenas no momento do clique em "Registrar Parada"
  useEffect(() => {
    if (aberto) {
      // Detecta turno atual automaticamente
      const agora = new Date()
      const horaAtual = agora.toTimeString().split(' ')[0].substring(0, 5) // HH:MM
      const turnoAtual = detectarTurnoAtual(turnos, horaAtual)
      if (turnoAtual) {
        setTurnoSelecionado(turnoAtual.id)
      }
    }
  }, [aberto, turnos])

  // Reseta formulário ao fechar
  useEffect(() => {
    if (!aberto) {
      resetarFormulario()
    }
  }, [aberto])

  /**
   * Carrega paradas do localStorage
   */
  const carregarParadas = useCallback(() => {
    if (!loteId) return

    const ativas = buscarParadasEmAndamento(loteId)
    const finalizadas = buscarParadasFinalizadas(loteId)
    setParadasAtivas(ativas)
    setParadasFinalizadas(finalizadas)

    // Define aba inicial baseado em paradas ativas
    if (ativas.length > 0) {
      setAbaAtiva('em-andamento')
    } else {
      setAbaAtiva('nova-parada')
    }
  }, [loteId])

  /**
   * Carrega paradas ao abrir o modal
   */
  useEffect(() => {
    if (aberto && loteId) {
      carregarParadas()
    }
  }, [aberto, loteId, carregarParadas])

  /**
   * Atualiza tempos decorridos a cada segundo
   */
  useEffect(() => {
    if (!aberto || paradasAtivas.length === 0) return

    const interval = setInterval(() => {
      const novosTempos: Record<string, number> = {}
      paradasAtivas.forEach(parada => {
        novosTempos[parada.id] = calcularTempoDecorrido(parada.hora_inicio)
      })
      setTemposDecorridos(novosTempos)
    }, 1000)

    return () => clearInterval(interval)
  }, [aberto, paradasAtivas])

  /**
   * Detecta o turno atual baseado na hora
   */
  const detectarTurnoAtual = (turnos: Turno[], hora: string): Turno | null => {
    const horaAtual = hora.split(':').map(Number)
    const minutosAtual = horaAtual[0] * 60 + horaAtual[1]

    for (const turno of turnos) {
      const inicio = turno.hora_inicio.split(':').map(Number)
      const fim = turno.hora_fim.split(':').map(Number)
      const minutosInicio = inicio[0] * 60 + inicio[1]
      const minutosFim = fim[0] * 60 + fim[1]

      // Turno que cruza meia-noite
      if (minutosInicio > minutosFim) {
        if (minutosAtual >= minutosInicio || minutosAtual < minutosFim) {
          return turno
        }
      } else {
        if (minutosAtual >= minutosInicio && minutosAtual < minutosFim) {
          return turno
        }
      }
    }
    return null
  }

  /**
   * Lista de tipos de parada disponíveis
   */
  const tiposParada = [
    'Sem Programação PMP',
    'Atendimento Regulatório e Inovação',
    'Eventos de Força Maior',
    'Manutenção Planejada',
    'Início de Produção',
    'Fim Produção',
    'CIP/SIP',
    'Teste de Filtro',
    'Troca de Formato/Produto',
    'Limpeza Planejada de Componentes',
    'Qualificação na Linha',
    'Validação na Linha',
    'Treinamento/ Reuniões/Eventos',
    'Refeições',
    'Falha Sistema de Água Gelada',
    'Falha no Sistema HVAC',
    'Falta de Energia',
    'Falta de Ar Comprimido',
    'Falta de Gases',
    'Falta de Vapor',
    'Falta de Água Bruta',
    'Falta de WFI (CIP/SIP)',
    'Falta de Internet/Sistemas',
    'Falta de Solução/Produto',
    'Falta Matéria Prima',
    'Falta Material Embalagem',
    'Falta Materiais GGF',
    'Aguardando Análise de Amostras',
    'Aguardando Dossiê/RG',
    'Interrupção devido Etapa Posterior',
    'Ausência de Espaço na Expedição',
  ]

  /**
   * Reseta todos os campos do formulário
   */
  const resetarFormulario = () => {
    setTipoParadaSelecionado('')
    setTurnoSelecionado('')
    setDataParada('')
    setHoraInicio('')
    setObservacao('')
    setErros({})
  }

  /**
   * Busca descrição do código de parada
   * Se for um ID temporário, extrai o nome do tipo de parada
   */
  const obterDescricaoParada = (codigoParadaId: string): string => {
    // Se for um ID temporário (formato: temp-nome-da-parada)
    if (codigoParadaId.startsWith('temp-')) {
      // Remove o prefixo 'temp-' e converte hífens de volta para espaços
      const descricao = codigoParadaId
        .substring(5) // Remove 'temp-'
        .split('-')
        .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
        .join(' ')
      return descricao
    }

    // Busca no cadastro de códigos de parada (quando implementado)
    const codigo = codigosParada.find(c => c.id === codigoParadaId)
    if (!codigo) return 'Código não encontrado'

    // Retorna o nível 2 (Grande Parada) como descrição principal
    return codigo.nivel_2_grande_parada
  }

  /**
   * Calcula o total de minutos de todas as paradas
   */
  const calcularTotalMinutosParadas = (paradas: ParadaLocalStorage[]): number => {
    return paradas.reduce((total, parada) => total + (parada.duracao_minutos || 0), 0)
  }

  /**
   * Formata duração total para o formato "hhh:mm" (sem segundos)
   */
  const formatarDuracaoTotal = (minutos: number): string => {
    const horas = Math.floor(minutos / 60)
    const mins = Math.floor(minutos % 60)
    return `${horas}:${String(mins).padStart(2, '0')}`
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
      const paradaAtualizada = finalizarParadaLS(paradaParaFinalizar, horaFinalizacao, usuarioId)

      if (paradaAtualizada) {
        // Recarrega paradas
        carregarParadas()

        // Notifica o componente pai sobre a finalização da parada
        if (onParadaFinalizada && paradaAtualizada.duracao_minutos) {
          onParadaFinalizada(paradaAtualizada.duracao_minutos)
        }

        // Exibe modal de sucesso
        setMensagemSucesso(`Parada finalizada com sucesso!\n\nDuração: ${formatarDuracao(paradaAtualizada.duracao_minutos || 0)}`)
        setAlertSucessoAberto(true)
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

  /**
   * Valida se pode registrar nova parada
   * Exibe alert se houver paradas ativas
   */
  const handleNovaParada = () => {
    if (paradasAtivas.length > 0) {
      setAlertParadasAtivasAberto(true)
    } else {
      setAbaAtiva('nova-parada')
    }
  }

  /**
   * Valida o formulário
   * NOTA: Data e hora são validadas apenas se já estiverem preenchidas
   * (serão preenchidas automaticamente no momento do clique em "Registrar Parada")
   */
  const validarFormulario = (): boolean => {
    const novosErros: typeof erros = {}

    if (!tipoParadaSelecionado) novosErros.tipoParada = 'Selecione o tipo de parada'
    if (!turnoSelecionado) novosErros.turno = 'Selecione o turno'

    // Data e hora são validadas apenas se já estiverem preenchidas
    // (serão preenchidas automaticamente no handleSalvar)
    if (dataParada && horaInicio) {
      // Valida que data/hora não seja futura
      const agora = new Date()
      const dataHoraParada = new Date(`${dataParada}T${horaInicio}:00`)
      if (dataHoraParada > agora) {
        novosErros.dataParada = 'Data/hora não pode ser futura'
        novosErros.horaInicio = 'Data/hora não pode ser futura'
      }
    }

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  /**
   * Salva o apontamento de parada
   * Usa o tipo de parada selecionado diretamente como código
   * IMPORTANTE: Captura timestamp CONTEMPORÂNEO no momento do clique (ALCOA+)
   */
  const handleSalvar = async () => {
    // CAPTURA TIMESTAMP CONTEMPORÂNEO (momento exato do clique no botão)
    const agora = new Date()
    const dataAtual = agora.toISOString().split('T')[0] // YYYY-MM-DD
    const horaAtual = agora.toTimeString().split(' ')[0].substring(0, 5) // HH:MM

    // Atualiza os estados com o timestamp contemporâneo
    setDataParada(dataAtual)
    setHoraInicio(horaAtual)

    // Valida formulário (agora com data/hora contemporâneas)
    if (!validarFormulario()) return

    // Gera um ID temporário baseado no tipo de parada
    // Quando implementarmos o cadastro de paradas, isso será substituído
    const codigoParadaId = `temp-${tipoParadaSelecionado.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-')}`

    const dados: CriarApontamentoParadaDTO = {
      linha_id: linhaId,
      lote_id: loteId || null,
      codigo_parada_id: codigoParadaId,
      turno_id: turnoSelecionado,
      data_parada: dataAtual, // Usa timestamp contemporâneo
      hora_inicio: `${horaAtual}:00`, // Usa timestamp contemporâneo + segundos
      observacao: observacao.trim() || null,
      criado_por_operador: usuarioId,
    }

    // Aguarda o salvamento completar antes de recarregar
    await onConfirmar(dados)

    // Exibe modal de sucesso
    setMensagemSucesso(`Parada registrada com sucesso!\n\nTipo: ${tipoParadaSelecionado}\nInício: ${horaAtual}`)
    setAlertSucessoAberto(true)

    // Reseta formulário e volta para aba de paradas ativas
    resetarFormulario()

    // Pequeno delay para garantir que localStorage foi atualizado
    setTimeout(() => {
      carregarParadas()
      setAbaAtiva('em-andamento')
    }, 100)
  }

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="sm:max-w-[900px] tab-prod:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl tab-prod:text-lg">
            <Pause className="h-5 w-5 text-orange-500" />
            Controle de Paradas - OP {numeroOP}
          </DialogTitle>
          <DialogDescription className="text-sm tab-prod:text-xs">
            Gerencie paradas em andamento e registre novas paradas
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
          <TabsList className={`grid w-full ${paradasAtivas.length > 0 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            <TabsTrigger value="em-andamento" className="text-xs sm:text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              Em Andamento ({paradasAtivas.length})
            </TabsTrigger>
            {paradasAtivas.length === 0 && (
              <TabsTrigger value="nova-parada" className="text-xs sm:text-sm">
                <Plus className="h-4 w-4 mr-1" />
                Nova Parada
              </TabsTrigger>
            )}
            <TabsTrigger value="historico" className="text-xs sm:text-sm">
              <Clock className="h-4 w-4 mr-1" />
              Histórico ({paradasFinalizadas.length})
            </TabsTrigger>
          </TabsList>

          {/* Aba 1: Paradas em Andamento */}
          <TabsContent value="em-andamento" className="space-y-4 mt-4">
            {paradasAtivas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold text-green-700">
                  ✅ Nenhuma parada em andamento
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  A produção está operando normalmente
                </p>
                <Button
                  onClick={handleNovaParada}
                  className="mt-6"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Nova Parada
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    Paradas Ativas ({paradasAtivas.length})
                  </h3>
                  <Button
                    onClick={handleNovaParada}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Parada
                  </Button>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {paradasAtivas.map((parada) => (
                    <div
                      key={parada.id}
                      className="border border-orange-200 bg-orange-50 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">
                            {obterDescricaoParada(parada.codigo_parada_id)}
                          </h4>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Início: {parada.hora_inicio.substring(0, 5)}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              Op. {parada.criado_por_operador}
                            </span>
                          </div>
                          {parada.observacao && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              Obs: {parada.observacao}
                            </p>
                          )}
                        </div>
                        <Badge variant="destructive" className="ml-4">
                          ⏱️ {formatarDuracao(temposDecorridos[parada.id] || 0)}
                        </Badge>
                      </div>
                      <Button
                        onClick={() => handleFinalizarParada(parada.id)}
                        disabled={finalizandoId === parada.id}
                        size="sm"
                        className="w-full"
                      >
                        {finalizandoId === parada.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Finalizando...
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Finalizar Parada
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Aba 2: Nova Parada */}
          <TabsContent value="nova-parada" className="space-y-4 mt-4">
            <div className="space-y-4 tab-prod:space-y-3">
          {/* Informações da OP */}
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>OP:</strong> {numeroOP}
            </p>
          </div>

          {/* Alerta de Contemporaneidade */}
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 p-3 rounded-md">
            <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-800">
              <strong>Registro Contemporâneo (ALCOA+):</strong> A data e hora de início da parada serão registradas automaticamente no momento em que você clicar no botão "Registrar Parada", garantindo a contemporaneidade do apontamento.
            </div>
          </div>

          {/* Tipo de Parada */}
          <div className="space-y-2">
            <Label htmlFor="tipoParada" className="flex items-center gap-2">
              Tipo de Parada *
            </Label>
            <Select
              value={tipoParadaSelecionado}
              onValueChange={(value) => {
                setTipoParadaSelecionado(value)
                if (erros.tipoParada) setErros({ ...erros, tipoParada: undefined })
              }}
            >
              <SelectTrigger className={erros.tipoParada ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione o tipo de parada" />
              </SelectTrigger>
              <SelectContent>
                {tiposParada.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {erros.tipoParada && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {erros.tipoParada}
              </p>
            )}
          </div>

          {/* Separador */}
          <div className="border-t pt-4" />

          {/* Turno */}
          <div className="space-y-2">
            <Label htmlFor="turno">Turno *</Label>
            <Select
              value={turnoSelecionado}
              onValueChange={(value) => {
                setTurnoSelecionado(value)
                if (erros.turno) setErros({ ...erros, turno: undefined })
              }}
            >
              <SelectTrigger className={erros.turno ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione o turno" />
              </SelectTrigger>
              <SelectContent>
                {turnos.map((turno) => (
                  <SelectItem key={turno.id} value={turno.id}>
                    {turno.nome} ({turno.hora_inicio.substring(0, 5)} - {turno.hora_fim.substring(0, 5)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {erros.turno && (
              <p className="text-sm text-red-500">{erros.turno}</p>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacao">Observações</Label>
            <Textarea
              id="observacao"
              placeholder="Descreva detalhes sobre a parada (opcional)"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Máximo de 500 caracteres
            </p>
          </div>

          {/* Botões do formulário */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setAbaAtiva('em-andamento')}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar} className="bg-orange-500 hover:bg-orange-600">
              <Pause className="h-4 w-4 mr-2" />
              Registrar Parada
            </Button>
          </div>
        </div>
          </TabsContent>

          {/* Aba 3: Histórico */}
          <TabsContent value="historico" className="space-y-4 mt-4">
            {paradasFinalizadas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">
                  Nenhuma parada finalizada
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  O histórico de paradas aparecerá aqui
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    Paradas Finalizadas ({paradasFinalizadas.length}) - Total em Horas: {formatarDuracaoTotal(calcularTotalMinutosParadas(paradasFinalizadas))}
                  </h3>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {paradasFinalizadas.map((parada) => (
                    <div
                      key={parada.id}
                      className="border border-gray-200 bg-gray-50 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">
                            {obterDescricaoParada(parada.codigo_parada_id)}
                          </h4>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Início: {parada.hora_inicio.substring(0, 5)}
                            </span>
                            <span className="flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Fim: {parada.hora_fim?.substring(0, 5)}
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-gray-700">
                              Duração: {formatarDuracao(parada.duracao_minutos || 0)}
                            </span>
                          </div>
                          {parada.observacao && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              Obs: {parada.observacao}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onFechar}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Alert Dialog: Validação de Paradas Ativas */}
      <AlertDialog open={alertParadasAtivasAberto} onOpenChange={setAlertParadasAtivasAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              ⚠️ Paradas em Andamento
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Existem <strong>{paradasAtivas.length}</strong> parada(s) em andamento.
              Finalize todas as paradas ativas antes de registrar uma nova parada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertParadasAtivasAberto(false)}>
              Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog: Sucesso ao Registrar Parada */}
      <AlertDialog open={alertSucessoAberto} onOpenChange={setAlertSucessoAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              ✅ Parada Registrada com Sucesso
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base whitespace-pre-line">
              {mensagemSucesso}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setAlertSucessoAberto(false)}
              className="bg-green-600 hover:bg-green-700"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
    </Dialog>
  )
}

