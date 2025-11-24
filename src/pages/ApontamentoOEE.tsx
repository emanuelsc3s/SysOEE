/**
 * Página de Apontamento de OEE
 * Permite apontamento de produção, qualidade (perdas e retrabalho) e paradas
 * Calcula OEE em tempo real e exibe em velocímetro
 *
 * Layout baseado em code_oee_apontar.html
 */

import { useState, useEffect, useCallback } from 'react'
import { Save, Timer, CheckCircle, ChevronDownIcon, Trash, LayoutDashboard, ArrowLeft, ClipboardCheck, FileText, Play, StopCircle, Search, CircleCheck, Plus, Pencil, X } from 'lucide-react'
import { ptBR } from 'date-fns/locale'
import { format } from 'date-fns'
import { LINHAS_PRODUCAO, buscarLinhaPorId } from '@/data/mockLinhas'
import { buscarOPTOTVSPorNumero } from '@/data/ordem-producao-totvs'
import paradasGeraisData from '../../data/paradas_gerais.json'
import { Turno } from '@/types/operacao'
import {
  salvarApontamentoProducao,
  calcularOEECompleto,
  excluirApontamentoProducao,
  buscarApontamentoProducaoPorId,
  buscarApontamentosPerdasPorProducao,
  buscarApontamentosRetrabalhoPorProducao,
  atualizarApontamentoProducao
} from '@/services/localStorage/apontamento-oee.storage'
import { salvarParada, ParadaLocalStorage, atualizarParada } from '@/services/localStorage/parada.storage'
import { CalculoOEE, CriarApontamentoProducaoDTO } from '@/types/apontamento-oee'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AppHeader } from "@/components/layout/AppHeader"
import { ModalBuscaParadas, type ParadaGeral } from "@/components/apontamento/ModalBuscaParadas"
import { ModalBuscaTurno, type TurnoSelecionado } from "@/components/modal/ModalBuscaTurno"

// Tipo para os formulários disponíveis
type FormularioAtivo = 'production-form' | 'quality-form' | 'downtime-form'

// Tipo para status do turno
type StatusTurno = 'NAO_INICIADO' | 'INICIADO' | 'ENCERRADO'

// Tipo para registro de produção no localStorage
interface RegistroProducao {
  id: string
  data: string
  turno: Turno
  linhaId: string
  linhaNome: string
  skuCodigo: string
  ordemProducao: string
  lote: string
  dossie: string
  horaInicio: string
  horaFim: string
  quantidadeProduzida: number
  dataHoraRegistro: string
}

// Tipo para registro de parada no localStorage
interface RegistroParada {
  id: string
  data: string
  turno: Turno
  linhaId: string
  linhaNome: string
  horaInicio: string
  horaFim: string
  duracao: number // em minutos
  tipoParada: string
  codigoParada: string
  descricaoParada: string
  observacoes: string
  dataHoraRegistro: string
}

const TEMPO_DISPONIVEL_PADRAO = 12

export default function ApontamentoOEE() {
  const { toast } = useToast()

  // ==================== Estado de Navegação ====================
  const [formularioAtivo, setFormularioAtivo] = useState<FormularioAtivo>('production-form')

  // ==================== Estado do Cabeçalho ====================
  const [data, setData] = useState<Date | undefined>(new Date())
  const [openDatePicker, setOpenDatePicker] = useState(false)
  const [turno, setTurno] = useState<Turno>('1º Turno')
  const [turnoId, setTurnoId] = useState<string>('') // ID do turno selecionado
  const [turnoCodigo, setTurnoCodigo] = useState<string>('') // Código do turno
  const [turnoNome, setTurnoNome] = useState<string>('') // Nome do turno
  const [modalBuscaTurnoAberto, setModalBuscaTurnoAberto] = useState<boolean>(false)
  const [turnoHoraInicial, setTurnoHoraInicial] = useState<string>('') // Hora inicial do turno
  const [turnoHoraFinal, setTurnoHoraFinal] = useState<string>('') // Hora final do turno
  const [linhaId, setLinhaId] = useState<string>('')
  const [skuCodigo, setSkuCodigo] = useState<string>('')
  const [ordemProducao, setOrdemProducao] = useState<string>('')
  const [lote, setLote] = useState<string>('')
  const [dossie, setDossie] = useState<string>('')
  const [editandoCabecalho, setEditandoCabecalho] = useState<boolean>(false)
  const [cabecalhoOriginal, setCabecalhoOriginal] = useState<{
    data: Date | undefined
    turno: Turno
    turnoId: string
    turnoCodigo: string
    turnoNome: string
    turnoHoraInicial: string
    turnoHoraFinal: string
    linhaId: string
    skuCodigo: string
    ordemProducao: string
    lote: string
    dossie: string
  } | null>(null)

  // ==================== Estado de Controle de Turno ====================
  const [statusTurno, setStatusTurno] = useState<StatusTurno>('NAO_INICIADO')
  const [showConfirmEncerramento, setShowConfirmEncerramento] = useState(false)

  // ==================== Estado de Produção ====================
  const [horaInicio, setHoraInicio] = useState<string>('')
  const [horaFim, setHoraFim] = useState<string>('')
  const [quantidadeProduzida, setQuantidadeProduzida] = useState<string>('')

  // ==================== Estado de Qualidade - Perdas ====================
  const [quantidadePerdas, setQuantidadePerdas] = useState<string>('')
  const [motivoPerdas, setMotivoPerdas] = useState<string>('')

  // ==================== Estado de Qualidade - Retrabalho ====================
  const [quantidadeRetrabalho, setQuantidadeRetrabalho] = useState<string>('')
  const [motivoRetrabalho, setMotivoRetrabalho] = useState<string>('')

  // ==================== Estado de Tempo de Parada ====================
  const [codigoParadaBusca, setCodigoParadaBusca] = useState<string>('')
  const [horaInicialParada, setHoraInicialParada] = useState<string>('')
  const [horaFinalParada, setHoraFinalParada] = useState<string>('')
  const [observacoesParada, setObservacoesParada] = useState<string>('')
  const [paradaSelecionada, setParadaSelecionada] = useState<ParadaGeral | null>(null)
  const [paradasAtivas] = useState<ParadaLocalStorage[]>([]) // Lista de paradas em andamento (setter não usado ainda)
  const [mostrarFormularioParada, setMostrarFormularioParada] = useState<boolean>(false)
  const [modalBuscaParadasAberto, setModalBuscaParadasAberto] = useState<boolean>(false)

  // ==================== Estado de OEE ====================
  const [apontamentoProducaoId, setApontamentoProducaoId] = useState<string | null>(null)
  const [oeeCalculado, setOeeCalculado] = useState<CalculoOEE>({
    disponibilidade: 0,
    performance: 0,
    qualidade: 0,
    oee: 0,
    tempoOperacionalLiquido: 0,
    tempoValioso: 0
  })

  // ==================== Estado de Métricas Adicionais ====================
  const [horasRestantes, setHorasRestantes] = useState<number>(0)
  const [totalHorasParadas, setTotalHorasParadas] = useState<number>(0)
  const [totalPerdasQualidade, setTotalPerdasQualidade] = useState<number>(0)

  // ==================== Dados Derivados ====================
  const linhaSelecionada = linhaId ? buscarLinhaPorId(linhaId) : null

  // Desabilita cabeçalho quando não está em edição ou antes do início
  const cabecalhoBloqueado = statusTurno !== 'NAO_INICIADO' && !editandoCabecalho

  // ==================== Estado de Histórico de Produção ====================
  const [historicoProducao, setHistoricoProducao] = useState<RegistroProducao[]>([])
  const [showConfirmExclusao, setShowConfirmExclusao] = useState(false)
  const [registroParaExcluir, setRegistroParaExcluir] = useState<string | null>(null)

  // ==================== Estado de Histórico de Paradas ====================
  const [historicoParadas, setHistoricoParadas] = useState<RegistroParada[]>([])
  const [showConfirmExclusaoParada, setShowConfirmExclusaoParada] = useState(false)
  const [paradaParaExcluir, setParadaParaExcluir] = useState<string | null>(null)

  // ==================== Constante para chave do localStorage ====================
  const STORAGE_KEY = 'oee_production_records'
  const STORAGE_KEY_PARADAS = 'oee_downtime_records'

  // ==================== Funções de localStorage ====================
  const carregarHistorico = useCallback((): RegistroProducao[] => {
    try {
      const dados = localStorage.getItem(STORAGE_KEY)
      if (dados) {
        return JSON.parse(dados)
      }
      return []
    } catch (error) {
      console.error('Erro ao carregar histórico do localStorage:', error)
      return []
    }
  }, [])

  const salvarNoLocalStorage = (registros: RegistroProducao[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(registros))
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar os dados',
        variant: 'destructive'
      })
    }
  }

  const carregarHistoricoParadas = useCallback((): RegistroParada[] => {
    try {
      const dados = localStorage.getItem(STORAGE_KEY_PARADAS)
      if (dados) {
        return JSON.parse(dados)
      }
      return []
    } catch (error) {
      console.error('Erro ao carregar histórico de paradas do localStorage:', error)
      return []
    }
  }, [])

  const salvarParadasNoLocalStorage = (registros: RegistroParada[]) => {
    try {
      localStorage.setItem(STORAGE_KEY_PARADAS, JSON.stringify(registros))
    } catch (error) {
      console.error('Erro ao salvar paradas no localStorage:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar os dados de paradas',
        variant: 'destructive'
      })
    }
  }

  const formatarQuantidade = (quantidade: number): string => {
    return quantidade.toLocaleString('pt-BR')
  }

  /**
   * Formata horas decimais para formato HH:MM
   * @param horas - Horas em formato decimal (ex: 1.5 = 1h30min)
   */
  const formatarHoras = (horas: number): string => {
    const horasInteiras = Math.floor(horas)
    const minutos = Math.round((horas - horasInteiras) * 60)
    return `${horasInteiras}:${minutos.toString().padStart(2, '0')}`
  }

  /**
   * Converte string de data/hora no padrão BR para timestamp
   * Mantém compatibilidade com registros já salvos no localStorage
   */
  const paraTimestamp = (dataHora: string): number => {
    try {
      const [dataParte, horaParte = '00:00:00'] = dataHora.split(' ')
      const [dia, mes, ano] = dataParte.split('/').map(Number)
      const [hora, minuto, segundo = 0] = horaParte.split(':').map(Number)
      return new Date(ano, mes - 1, dia, hora, minuto, segundo).getTime()
    } catch (error) {
      console.warn('Não foi possível converter data/hora:', dataHora, error)
      return 0
    }
  }

  /**
   * Converte data no formato dd/MM/yyyy para objeto Date
   */
  const converterDataBRParaDate = (dataTexto: string): Date | undefined => {
    try {
      const [dia, mes, ano] = dataTexto.split('/').map(Number)
      return new Date(ano, mes - 1, dia)
    } catch (error) {
      console.warn('Não foi possível converter data:', dataTexto, error)
      return undefined
    }
  }

  /**
   * Soma perdas e retrabalhos de um apontamento de produção
   */
  const calcularTotalPerdasDoApontamento = (apontamentoId: string): number => {
    const perdas = buscarApontamentosPerdasPorProducao(apontamentoId)
    const retrabalhos = buscarApontamentosRetrabalhoPorProducao(apontamentoId)

    const totalPerdas = perdas.reduce((total, perda) => total + perda.unidadesRejeitadas, 0)
    const totalRetrabalho = retrabalhos.reduce((total, retrabalho) => total + retrabalho.unidadesRetrabalho, 0)

    return totalPerdas + totalRetrabalho
  }

  /**
   * Formata percentual no padrão brasileiro (pt-BR)
   * @param valor - Valor numérico a ser formatado
   * @returns String formatada com vírgula como separador decimal e 2 casas decimais
   */
  const formatarPercentual = (valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  /**
   * Recalcula OEE e indicadores derivados após exclusão de um registro
   * garantindo atualização imediata da UI para o período afetado.
   */
  const recalcularIndicadoresAposExclusao = (
    registroExcluido: RegistroProducao,
    historicoAtualizado: RegistroProducao[]
  ) => {
    const historicoDoPeriodo = [...historicoAtualizado]
      .filter(
        (registro) =>
          registro.data === registroExcluido.data &&
          registro.turno === registroExcluido.turno &&
          registro.linhaId === registroExcluido.linhaId &&
          registro.lote === registroExcluido.lote
      )
      .sort((a, b) => paraTimestamp(b.dataHoraRegistro) - paraTimestamp(a.dataHoraRegistro))

    const apontamentoReferencia = historicoDoPeriodo[0]

    const paradasDoPeriodo = carregarHistoricoParadas().filter(
      (registroParada) =>
        registroParada.data === registroExcluido.data &&
        registroParada.turno === registroExcluido.turno &&
        registroParada.linhaId === registroExcluido.linhaId
    )

    const totalHorasParadasCalculado = paradasDoPeriodo.reduce((total, parada) => total + (parada.duracao || 0), 0) / 60
    setTotalHorasParadas(totalHorasParadasCalculado)
    setHorasRestantes(calcularHorasRestantes())

    if (apontamentoReferencia) {
      try {
        const novoOEE = calcularOEECompleto(apontamentoReferencia.id, linhaId, TEMPO_DISPONIVEL_PADRAO)
        setOeeCalculado(novoOEE)
        setApontamentoProducaoId(apontamentoReferencia.id)
        setTotalPerdasQualidade(calcularTotalPerdasDoApontamento(apontamentoReferencia.id))
        return
      } catch (error) {
        console.error('Erro ao recalcular OEE após exclusão:', error)
      }
    }

    // Quando não há mais registros relevantes, zera os indicadores para evitar ruído visual.
    setApontamentoProducaoId(null)
    setOeeCalculado({
      disponibilidade: 0,
      performance: 0,
      qualidade: 0,
      oee: 0,
      tempoOperacionalLiquido: 0,
      tempoValioso: 0
    })
    setTotalPerdasQualidade(0)
  }

  // ==================== Funções de Exclusão de Produção ====================

  /**
   * Abre o diálogo de confirmação de exclusão
   * @param registroId - ID do registro a ser excluído
   */
  const confirmarExclusao = (registroId: string) => {
    setRegistroParaExcluir(registroId)
    setShowConfirmExclusao(true)
  }

  /**
   * Cancela a exclusão e fecha o diálogo
   */
  const cancelarExclusao = () => {
    setRegistroParaExcluir(null)
    setShowConfirmExclusao(false)
  }

  /**
   * Exclui um registro de produção do histórico
   * Remove do localStorage e recalcula o OEE
   */
  const handleExcluirProducao = () => {
    if (!registroParaExcluir) return

    try {
      // Buscar o registro no histórico para obter o apontamentoProducaoId
      const registro = historicoProducao.find(r => r.id === registroParaExcluir)

      if (!registro) {
        toast({
          title: 'Erro',
          description: 'Registro não encontrado',
          variant: 'destructive'
        })
        cancelarExclusao()
        return
      }

      // Remover do histórico local e persistir
      const novoHistorico = historicoProducao.filter(r => r.id !== registroParaExcluir)
      setHistoricoProducao(novoHistorico)
      salvarNoLocalStorage(novoHistorico)

      // Remover também do serviço de apontamentos persistido
      excluirApontamentoProducao(registroParaExcluir)

      // Recalcular todos os indicadores impactados (OEE e secundários) para o período afetado
      recalcularIndicadoresAposExclusao(registro, novoHistorico)

      // Feedback de sucesso
      toast({
        title: '✅ Registro Excluído',
        description: 'O registro de produção foi excluído e os indicadores foram recalculados',
      })

      // Fechar diálogo
      cancelarExclusao()

    } catch (error) {
      console.error('Erro ao excluir registro de produção:', error)
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o registro. Tente novamente.',
        variant: 'destructive'
      })
      cancelarExclusao()
    }
  }

  /**
   * Confirma a exclusão de uma parada
   * @param paradaId - ID da parada a ser excluída
   */
  const confirmarExclusaoParada = (paradaId: string) => {
    setParadaParaExcluir(paradaId)
    setShowConfirmExclusaoParada(true)
  }

  /**
   * Cancela a exclusão de parada e fecha o diálogo
   */
  const cancelarExclusaoParada = () => {
    setParadaParaExcluir(null)
    setShowConfirmExclusaoParada(false)
  }

  /**
   * Exclui um registro de parada do histórico
   * Remove do localStorage
   */
  const handleExcluirParada = () => {
    if (!paradaParaExcluir) return

    try {
      // Remover do histórico local
      const novoHistorico = historicoParadas.filter(r => r.id !== paradaParaExcluir)
      setHistoricoParadas(novoHistorico)
      salvarParadasNoLocalStorage(novoHistorico)

      // Feedback de sucesso
      toast({
        title: '✅ Parada Excluída',
        description: 'O registro de parada foi excluído com sucesso',
      })

      // Fechar diálogo
      cancelarExclusaoParada()

    } catch (error) {
      console.error('Erro ao excluir registro de parada:', error)
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o registro de parada. Tente novamente.',
        variant: 'destructive'
      })
      cancelarExclusaoParada()
    }
  }

  /**
   * Formata duração em minutos para formato legível (ex: "2h 30min")
   * @param minutos - Duração em minutos
   */
  const formatarDuracao = (minutos: number): string => {
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60

    if (horas === 0) {
      return `${mins}min`
    } else if (mins === 0) {
      return `${horas}h`
    } else {
      return `${horas}h ${mins}min`
    }
  }

  /**
   * Busca dados da Ordem de Produção e popula os campos do formulário
   * Busca no arquivo JSON real do TOTVS (ordem-producao.json)
   */
  const buscarDadosOP = () => {
    // Validar se o campo OP está preenchido
    if (!ordemProducao.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, digite o número da Ordem de Produção',
        variant: 'destructive'
      })
      return
    }

    // Buscar a OP no JSON do TOTVS pelo campo C2_NUM
    const opEncontrada = buscarOPTOTVSPorNumero(ordemProducao.trim())

    if (!opEncontrada) {
      toast({
        title: 'OP não encontrada',
        description: `Ordem de Produção "${ordemProducao}" não foi encontrada no sistema`,
        variant: 'destructive'
      })
      return
    }

    // Popular os campos do formulário com dados do TOTVS
    // C2_PRODUTO + B1_DESC -> SKU (código do produto + descrição)
    setSkuCodigo(`${opEncontrada.C2_PRODUTO} - ${opEncontrada.B1_DESC}`)

    // C2_YLOTE -> Lote
    setLote(opEncontrada.C2_YLOTE)

    // C2_YDOSSIE -> Dossie
    setDossie(opEncontrada.C2_YDOSSIE)

    // Nota: O JSON do TOTVS não possui informação sobre linha de produção
    // O usuário deve selecionar manualmente a linha

    // Exibir mensagem de sucesso com informações do produto
    toast({
      title: 'Dados carregados com sucesso',
      description: `OP ${ordemProducao} - ${opEncontrada.B1_DESC}`,
      variant: 'default'
    })
  }

  /**
   * Abre o modal de busca de paradas
   */
  const abrirModalBuscaParadas = () => {
    setModalBuscaParadasAberto(true)
  }

  /**
   * Callback quando uma parada é selecionada no modal
   */
  const handleSelecionarParadaModal = (parada: ParadaGeral) => {
    setParadaSelecionada(parada)
    setCodigoParadaBusca(parada.Apontamento || '')

    toast({
      title: 'Parada selecionada',
      description: `${parada.Apontamento} - ${parada.Descrição?.substring(0, 50)}...`,
      variant: 'default'
    })
  }

  /**
   * Abre o modal de busca de turnos
   */
  const abrirModalBuscaTurno = () => {
    setModalBuscaTurnoAberto(true)
  }

  /**
   * Callback quando um turno é selecionado no modal
   */
  const handleSelecionarTurnoModal = (turnoSelecionado: TurnoSelecionado) => {
    setTurnoId(turnoSelecionado.turno_id)
    setTurnoCodigo(turnoSelecionado.codigo)
    setTurnoNome(turnoSelecionado.turno)
    setTurnoHoraInicial(turnoSelecionado.horaInicio)
    setTurnoHoraFinal(turnoSelecionado.horaFim)

    toast({
      title: 'Turno selecionado',
      description: `${turnoSelecionado.codigo} - ${turnoSelecionado.turno} (${turnoSelecionado.horaInicio} - ${turnoSelecionado.horaFim})`,
      variant: 'default'
    })
  }

  /**
   * Calcula o tempo disponível do turno em horas
   * Baseado no turno selecionado (12 horas por turno)
   */
  const calcularTempoDisponivelTurno = useCallback((): number => {
    // Cada turno tem 12 horas de tempo disponível (turno fixo definido para SicFar)
    return TEMPO_DISPONIVEL_PADRAO
  }, [])

  /**
   * Calcula horas restantes de apontamento de produção
   * Baseado no tempo disponível menos o tempo já apontado
   */
  const calcularHorasRestantes = useCallback((): number => {
    const tempoDisponivel = calcularTempoDisponivelTurno()
    const historico = carregarHistorico()

    // Filtrar apontamentos do turno atual
    const apontamentosTurnoAtual = historico.filter(
      h => h.data === format(data!, 'dd/MM/yyyy') &&
           h.turno === turno &&
           h.linhaId === linhaId
    )

    // Calcular total de horas já apontadas
    const horasApontadas = apontamentosTurnoAtual.reduce((total, apontamento) => {
      const [horaInicioH, horaInicioM] = apontamento.horaInicio.split(':').map(Number)
      const [horaFimH, horaFimM] = apontamento.horaFim.split(':').map(Number)
      const minutosInicio = horaInicioH * 60 + horaInicioM
      const minutosFim = horaFimH * 60 + horaFimM
      const duracaoMinutos = minutosFim - minutosInicio
      return total + (duracaoMinutos / 60)
    }, 0)

    return Math.max(0, tempoDisponivel - horasApontadas)
  }, [calcularTempoDisponivelTurno, carregarHistorico, data, linhaId, turno])

  // ==================== Carregar histórico ao montar o componente ====================
  useEffect(() => {
    const historico = carregarHistorico()
    setHistoricoProducao(historico)

    const historicoParadas = carregarHistoricoParadas()
    setHistoricoParadas(historicoParadas)
  }, [carregarHistorico, carregarHistoricoParadas])

  // ==================== Recalcula OEE quando dados mudam ====================
  useEffect(() => {
    if (apontamentoProducaoId && linhaId) {
      try {
        const novoOEE = calcularOEECompleto(apontamentoProducaoId, linhaId, 12)
        setOeeCalculado(novoOEE)
        console.log('f504 OEE recalculado automaticamente:', {
          apontamentoId: apontamentoProducaoId,
          linhaId,
          oee: `${novoOEE.oee}%`
        })
      } catch (error) {
        console.error(' d7❌ Erro ao recalcular OEE:', error)
      }
    }
  }, [apontamentoProducaoId, linhaId])

  // ==================== Atualiza métricas quando turno está ativo ====================
  useEffect(() => {
    if (statusTurno === 'INICIADO' && data && linhaId) {
      // Atualizar horas restantes
      const horasRestantesCalculadas = calcularHorasRestantes()
      setHorasRestantes(horasRestantesCalculadas)

      // TODO: Atualizar total de horas paradas quando implementar apontamento de paradas
      // TODO: Atualizar total de perdas de qualidade quando implementar apontamento de perdas
    }
  }, [historicoProducao, statusTurno, data, linhaId, turno, calcularHorasRestantes])

  // ==================== Funções de Validação ====================

  /**
   * Valida se todos os campos obrigatórios do cabeçalho estão preenchidos
   * Necessário para habilitar o botão "Iniciar Turno"
   */
  const validarCamposCabecalho = (): boolean => {
    return !!(
      data &&
      turnoId && // Validar turnoId ao invés de turno
      linhaId &&
      skuCodigo.trim() &&
      ordemProducao.trim() &&
      lote.trim() &&
      dossie.trim()
    )
  }

  // ==================== Funções de Controle de Turno ====================

  /**
   * Inicia o turno após validação dos campos obrigatórios
   * Bloqueia edição dos campos do cabeçalho
   * Inicializa cálculos de OEE com valores zerados
   */
  const handleIniciarTurno = () => {
    if (!validarCamposCabecalho()) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Preencha todos os campos do cabeçalho antes de iniciar o turno',
        variant: 'destructive'
      })
      return
    }

    const dataSelecionada = data ? format(data, 'dd/MM/yyyy') : ''
    const historico = carregarHistorico()
    const historicoParadasSalvo = carregarHistoricoParadas()

    // Filtra dados do turno atual para manter contemporaneidade (ALCOA+)
    const producoesDoTurno = historico.filter(
      (registro) =>
        registro.data === dataSelecionada &&
        registro.turno === turno &&
        registro.linhaId === linhaId
    )

    const paradasDoTurno = historicoParadasSalvo.filter(
      (registro) =>
        registro.data === dataSelecionada &&
        registro.turno === turno &&
        registro.linhaId === linhaId
    )

    const temDadosSalvos = producoesDoTurno.length > 0 || paradasDoTurno.length > 0

    if (temDadosSalvos) {
      const producaoReferencia = [...producoesDoTurno].sort(
        (a, b) => paraTimestamp(b.dataHoraRegistro) - paraTimestamp(a.dataHoraRegistro)
      )[0]

      // Carrega valores do cabeçalho e formulários com última produção registrada
      if (producaoReferencia) {
        const dataConvertida = converterDataBRParaDate(producaoReferencia.data)
        if (dataConvertida) setData(dataConvertida)

        setTurno(producaoReferencia.turno)
        setLinhaId(producaoReferencia.linhaId)
        setSkuCodigo(producaoReferencia.skuCodigo)
        setOrdemProducao(producaoReferencia.ordemProducao)
        setLote(producaoReferencia.lote)
        setDossie(producaoReferencia.dossie)
        setHoraInicio(producaoReferencia.horaInicio)
        setHoraFim(producaoReferencia.horaFim)
        setQuantidadeProduzida(producaoReferencia.quantidadeProduzida.toString())
        setApontamentoProducaoId(producaoReferencia.id)

        const apontamentoExistente = buscarApontamentoProducaoPorId(producaoReferencia.id)

        if (apontamentoExistente) {
          try {
            const oeeRecalculado = calcularOEECompleto(
              producaoReferencia.id,
              linhaId,
              12
            )
            setOeeCalculado(oeeRecalculado)
            setTotalPerdasQualidade(calcularTotalPerdasDoApontamento(producaoReferencia.id))
          } catch (error) {
            console.error('Erro ao recalcular OEE carregado:', error)
            setOeeCalculado({
              disponibilidade: 0,
              performance: 0,
              qualidade: 0,
              oee: 0,
              tempoOperacionalLiquido: 0,
              tempoValioso: 0
            })
            setTotalPerdasQualidade(0)
          }
        }
      } else {
        setApontamentoProducaoId(null)
        setOeeCalculado({
          disponibilidade: 0,
          performance: 0,
          qualidade: 0,
          oee: 0,
          tempoOperacionalLiquido: 0,
          tempoValioso: 0
        })
        setTotalPerdasQualidade(0)
      }

      setHistoricoProducao(producoesDoTurno)
      setHistoricoParadas(paradasDoTurno)

      // Atualiza métricas derivadas
      const totalHorasParadasCalculado =
        paradasDoTurno.reduce((total, parada) => total + parada.duracao, 0) / 60
      setTotalHorasParadas(totalHorasParadasCalculado)
      setHorasRestantes(calcularHorasRestantes())

      setStatusTurno('INICIADO')

      toast({
        title: 'Dados recuperados',
        description: `Turno carregado com ${producoesDoTurno.length} produções e ${paradasDoTurno.length} paradas. OEE recalculado.`,
        variant: 'default'
      })
      return
    }

    // Inicializar OEE com valores zerados quando não há histórico
    setApontamentoProducaoId(null)
    setOeeCalculado({
      disponibilidade: 0,
      performance: 0,
      qualidade: 0,
      oee: 0,
      tempoOperacionalLiquido: 0,
      tempoValioso: 0
    })

    // Inicializar métricas adicionais
    setHorasRestantes(calcularTempoDisponivelTurno())
    setTotalHorasParadas(0)
    setTotalPerdasQualidade(0)
    setHistoricoProducao([])
    setHistoricoParadas([])

    setStatusTurno('INICIADO')

    toast({
      title: 'Turno Iniciado',
      description: `Turno iniciado às ${format(new Date(), 'HH:mm:ss')}. Valores zerados e prontos para novos apontamentos. Os campos do cabeçalho foram bloqueados.`,
      variant: 'default'
    })
  }

  /**
   * Solicita confirmação para encerrar o turno
   */
  const handleSolicitarEncerramento = () => {
    setShowConfirmEncerramento(true)
  }

  /**
   * Encerra o turno após confirmação
   */
  const handleEncerrarTurno = () => {
    setStatusTurno('ENCERRADO')
    setShowConfirmEncerramento(false)

    toast({
      title: 'Turno Encerrado',
      description: `Turno encerrado às ${format(new Date(), 'HH:mm:ss')}.`,
      variant: 'default'
    })
  }

  /**
   * Entrar em modo de edição do cabeçalho após o turno já ter sido iniciado
   */
  const handleEditarCabecalho = () => {
    setCabecalhoOriginal({
      data,
      turno,
      turnoId,
      turnoCodigo,
      turnoNome,
      turnoHoraInicial,
      turnoHoraFinal,
      linhaId,
      skuCodigo,
      ordemProducao,
      lote,
      dossie
    })
    setEditandoCabecalho(true)
    toast({
      title: 'Edição liberada',
      description: 'Atualize os campos do cabeçalho e finalize em "Continuar Turno".'
    })
  }

  /**
   * Cancela a edição do cabeçalho e restaura os valores originais
   */
  const handleCancelarEdicaoCabecalho = () => {
    if (cabecalhoOriginal) {
      setData(cabecalhoOriginal.data)
      setTurno(cabecalhoOriginal.turno)
      setTurnoId(cabecalhoOriginal.turnoId)
      setTurnoCodigo(cabecalhoOriginal.turnoCodigo)
      setTurnoNome(cabecalhoOriginal.turnoNome)
      setTurnoHoraInicial(cabecalhoOriginal.turnoHoraInicial)
      setTurnoHoraFinal(cabecalhoOriginal.turnoHoraFinal)
      setLinhaId(cabecalhoOriginal.linhaId)
      setSkuCodigo(cabecalhoOriginal.skuCodigo)
      setOrdemProducao(cabecalhoOriginal.ordemProducao)
      setLote(cabecalhoOriginal.lote)
      setDossie(cabecalhoOriginal.dossie)
    }
    setEditandoCabecalho(false)
    setCabecalhoOriginal(null)
    toast({
      title: 'Edição cancelada',
      description: 'Os valores do cabeçalho foram restaurados e os campos bloqueados.'
    })
  }

  /**
   * Aplica alterações do cabeçalho, persiste e recalcula OEE
   */
  const handleContinuarTurno = () => {
    if (!validarCamposCabecalho()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos antes de continuar o turno.',
        variant: 'destructive'
      })
      return
    }

    try {
      const dataFormatada = data ? format(data, 'dd/MM/yyyy') : ''
      const dataISO = data ? format(data, 'yyyy-MM-dd') : ''
      const linhaAtualizada = linhaId ? buscarLinhaPorId(linhaId) : null

      // Atualiza histórico local exibido (registros do turno) e persiste
      const historicoAtualizado = historicoProducao.map((registro) => ({
        ...registro,
        data: dataFormatada,
        turno,
        linhaId,
        linhaNome: linhaAtualizada?.nome || registro.linhaNome,
        skuCodigo,
        ordemProducao,
        lote,
        dossie
      }))

      setHistoricoProducao(historicoAtualizado)
      salvarNoLocalStorage(historicoAtualizado)

      // Propaga atualização para o storage principal (cálculo de OEE)
      historicoAtualizado.forEach((registro) => {
        atualizarApontamentoProducao(registro.id, {
          turno,
          linha: linhaAtualizada?.nome || registro.linhaNome,
          setor: linhaAtualizada?.setor,
          ordemProducao: ordemProducao || 'S/N',
          lote,
          sku: skuCodigo.includes(' - ') ? skuCodigo.split(' - ')[0].trim() : skuCodigo.trim(),
          produto: skuCodigo.includes(' - ')
            ? skuCodigo.split(' - ').slice(1).join(' - ').trim()
            : skuCodigo.trim(),
          dataApontamento: dataISO || registro.data
        })
      })

      // Atualiza histórico de paradas exibido e storage para manter o vínculo
      const historicoParadasAtualizado = historicoParadas.map((parada) => ({
        ...parada,
        data: dataFormatada,
        turno,
        linhaId,
        linhaNome: linhaAtualizada?.nome || parada.linhaNome
      }))

      setHistoricoParadas(historicoParadasAtualizado)
      salvarParadasNoLocalStorage(historicoParadasAtualizado)
      historicoParadasAtualizado.forEach((parada) => {
        atualizarParada(parada.id, {
          linha_id: linhaId,
          lote_id: lote || null,
          turno_id: turno,
          data_parada: dataISO || parada.data
        })
      })

      // Recarrega dados mais recentes gravados
      setHistoricoProducao(carregarHistorico())
      setHistoricoParadas(carregarHistoricoParadas())

      // Recalcula indicadores
      setTotalHorasParadas(historicoParadasAtualizado.reduce((total, parada) => total + (parada.duracao || 0), 0) / 60)
      setHorasRestantes(calcularHorasRestantes())

      if (apontamentoProducaoId && linhaId) {
        const novoOEE = calcularOEECompleto(apontamentoProducaoId, linhaId, TEMPO_DISPONIVEL_PADRAO)
        setOeeCalculado(novoOEE)
        setTotalPerdasQualidade(calcularTotalPerdasDoApontamento(apontamentoProducaoId))
      }

      setEditandoCabecalho(false)
      setCabecalhoOriginal(null)

      toast({
        title: 'Cabeçalho atualizado',
        description: 'Dados salvos, campos bloqueados novamente e OEE recalculado.'
      })
    } catch (error) {
      console.error('Erro ao continuar turno com cabeçalho editado:', error)
      toast({
        title: 'Erro ao salvar alterações',
        description: 'Não foi possível atualizar o cabeçalho. Tente novamente.',
        variant: 'destructive'
      })
    }
  }

  /**
   * Calcula diferença em horas entre dois horários HH:MM
   * Suporta passagem de meia-noite
   */
  const calcularDiferencaHoras = (inicio: string, fim: string): number => {
    const [hInicio, mInicio] = inicio.split(':').map(Number)
    const [hFim, mFim] = fim.split(':').map(Number)

    const minutosInicio = hInicio * 60 + mInicio
    let minutosFim = hFim * 60 + mFim

    // Se fim < início, passou da meia-noite
    if (minutosFim < minutosInicio) {
      minutosFim += 24 * 60 // Adiciona 24 horas
    }

    return (minutosFim - minutosInicio) / 60
  }

  // ==================== Handlers ====================
  const handleSalvarProducao = () => {
    // =================================================================
    // VALIDAÇÃO 1: Campos do Cabeçalho
    // =================================================================

    if (!data) {
      toast({
        title: 'Campo obrigatório',
        description: 'Selecione a Data do apontamento',
        variant: 'destructive'
      })
      return
    }

    if (!turnoId) {
      toast({
        title: 'Campo obrigatório',
        description: 'Selecione o Turno',
        variant: 'destructive'
      })
      return
    }

    if (!linhaId) {
      toast({
        title: 'Campo obrigatório',
        description: 'Selecione a Linha de Produção',
        variant: 'destructive'
      })
      return
    }

    if (!skuCodigo) {
      toast({
        title: 'Campo obrigatório',
        description: 'Digite o código do SKU',
        variant: 'destructive'
      })
      return
    }

    if (!lote) {
      toast({
        title: 'Campo obrigatório',
        description: 'Digite o número do Lote',
        variant: 'destructive'
      })
      return
    }

    // =================================================================
    // VALIDAÇÃO 2: Campos do Formulário de Produção
    // =================================================================

    if (!horaInicio) {
      toast({
        title: 'Campo obrigatório',
        description: 'Informe a Hora de Início da produção',
        variant: 'destructive'
      })
      return
    }

    if (!horaFim) {
      toast({
        title: 'Campo obrigatório',
        description: 'Informe a Hora de Fim da produção',
        variant: 'destructive'
      })
      return
    }

    if (!quantidadeProduzida || Number(quantidadeProduzida) <= 0) {
      toast({
        title: 'Campo obrigatório',
        description: 'Informe a Quantidade Produzida (maior que zero)',
        variant: 'destructive'
      })
      return
    }

    // =================================================================
    // BUSCAR DADOS RELACIONADOS
    // =================================================================

    const linha = buscarLinhaPorId(linhaId)
    if (!linha) {
      toast({
        title: 'Erro',
        description: 'Linha de produção não encontrada',
        variant: 'destructive'
      })
      return
    }

    // =================================================================
    // EXTRAIR CÓDIGO E DESCRIÇÃO DO SKU
    // Suporta tanto dados do TOTVS ("código - descrição") quanto entrada manual
    // =================================================================

    const codigoSKU = skuCodigo.includes(' - ')
      ? skuCodigo.split(' - ')[0].trim()
      : skuCodigo.trim()

    const descricaoSKU = skuCodigo.includes(' - ')
      ? skuCodigo.split(' - ').slice(1).join(' - ').trim()
      : skuCodigo.trim()

    // =================================================================
    // CALCULAR TEMPO DE OPERAÇÃO
    // =================================================================

    const tempoOperacaoHoras = calcularDiferencaHoras(horaInicio, horaFim)

    if (tempoOperacaoHoras <= 0) {
      toast({
        title: 'Erro de validação',
        description: 'Hora de Fim deve ser posterior à Hora de Início',
        variant: 'destructive'
      })
      return
    }

    if (tempoOperacaoHoras > 24) {
      toast({
        title: 'Atenção',
        description: 'Tempo de operação superior a 24 horas. Verifique os horários.',
        variant: 'destructive'
      })
      return
    }

    // =================================================================
    // CRIAR DTO
    // Usa dados extraídos do campo SKU (suporta TOTVS e entrada manual)
    // =================================================================

    const dto: CriarApontamentoProducaoDTO = {
      turno,
      linha: linha.nome,
      setor: linha.setor,
      ordemProducao: ordemProducao || 'S/N', // Opcional
      lote,
      sku: codigoSKU,
      produto: descricaoSKU,
      velocidadeNominal: 4000, // CONSTANTE: 4000 unidades/hora
      quantidadeProduzida: Number(quantidadeProduzida),
      tempoOperacao: tempoOperacaoHoras,
      tempoDisponivel: 12, // CONSTANTE: 12 horas por turno
      dataApontamento: format(data, 'yyyy-MM-dd'),
      horaInicio: horaInicio.includes(':') ? horaInicio + ':00' : horaInicio,
      horaFim: horaFim.includes(':') ? horaFim + ':00' : horaFim,
      criadoPor: 1, // TODO: buscar do contexto de autenticação
      criadoPorNome: 'Emanuel Silva' // TODO: buscar do contexto
    }

    // =================================================================
    // SALVAR NO LOCALSTORAGE
    // =================================================================

    try {
      const apontamento = salvarApontamentoProducao(dto)

      console.log('✅ Apontamento de produção salvo:', apontamento)

      // =================================================================
      // ATUALIZAR ESTADO PARA RECALCULAR OEE
      // =================================================================

      setApontamentoProducaoId(apontamento.id)

      // Calcular OEE imediatamente (OEE é calculado por linha)
      if (linhaId) {
        const novoOEE = calcularOEECompleto(apontamento.id, linhaId, 12)
        setOeeCalculado(novoOEE)
        console.log('📊 OEE calculado:', novoOEE)
      }

      // =================================================================
      // ATUALIZAR HISTÓRICO LOCAL (para exibição na tabela)
      // =================================================================

      const novoRegistro: RegistroProducao = {
        id: apontamento.id,
        data: format(data!, 'dd/MM/yyyy'),
        turno,
        linhaId,
        linhaNome: linha.nome,
        skuCodigo,
        ordemProducao,
        lote,
        dossie,
        horaInicio,
        horaFim,
        quantidadeProduzida: Number(quantidadeProduzida),
        dataHoraRegistro: format(new Date(), 'dd/MM/yyyy HH:mm:ss')
      }

      const novoHistorico = [novoRegistro, ...historicoProducao]
      setHistoricoProducao(novoHistorico)
      salvarNoLocalStorage(novoHistorico)

      // =================================================================
      // LIMPAR FORMULÁRIO
      // =================================================================

      setHoraInicio('')
      setHoraFim('')
      setQuantidadeProduzida('')

      // =================================================================
      // FEEDBACK PARA O USUÁRIO
      // =================================================================

      toast({
        title: '✅ Produção Registrada',
        description: `${Number(quantidadeProduzida).toLocaleString('pt-BR')} unidades em ${tempoOperacaoHoras.toFixed(2)}h. OEE atualizado.`
      })

    } catch (error) {
      console.error('❌ Erro ao salvar apontamento:', error)
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o apontamento. Tente novamente.',
        variant: 'destructive'
      })
    }
  }

  const handleAdicionarQualidade = () => {
    toast({
      title: 'Sucesso',
      description: 'Registro de qualidade adicionado'
    })
  }

  const handleRegistrarParada = () => {
    // Validar campos obrigatórios
    if (!paradaSelecionada) {
      toast({
        title: 'Erro de Validação',
        description: 'Por favor, busque e selecione um tipo de parada',
        variant: 'destructive'
      })
      return
    }

    if (!horaInicialParada) {
      toast({
        title: 'Erro de Validação',
        description: 'Por favor, informe a hora inicial da parada',
        variant: 'destructive'
      })
      return
    }

    if (!horaFinalParada) {
      toast({
        title: 'Erro de Validação',
        description: 'Por favor, informe a hora final da parada',
        variant: 'destructive'
      })
      return
    }

    // Calcular duração em minutos
    const [horaIni, minIni] = horaInicialParada.split(':').map(Number)
    const [horaFin, minFin] = horaFinalParada.split(':').map(Number)
    const minutosInicio = horaIni * 60 + minIni
    const minutosFim = horaFin * 60 + minFin
    const duracaoMinutos = minutosFim - minutosInicio

    // Validar que hora final é maior que hora inicial
    if (duracaoMinutos <= 0) {
      toast({
        title: 'Erro de Validação',
        description: 'A hora final deve ser maior que a hora inicial',
        variant: 'destructive'
      })
      return
    }

    // Criar objeto de registro de parada (para exibição / debug)
    const registroParada = {
      id: `parada-${Date.now()}`,
      data: format(data!, 'dd/MM/yyyy'),
      turno,
      linhaId,
      linhaNome: linhaSelecionada?.nome || '',
      natureza: paradaSelecionada.Natureza || '',
      classe: paradaSelecionada.Classe || '',
      grandeParada: paradaSelecionada['Grande Parada'] || '',
      apontamento: paradaSelecionada.Apontamento || '',
      descricao: paradaSelecionada.Descrição || '',
      horaInicial: horaInicialParada,
      horaFinal: horaFinalParada,
      duracaoMinutos,
      observacoes: observacoesParada,
      dataHoraRegistro: new Date().toISOString()
    }

    console.log('Registro de Parada (UI):', registroParada)

    // Converter para formato ParadaLocalStorage (para cálculo do OEE)
    const horaInicioFormatada =
      horaInicialParada.length === 5 ? `${horaInicialParada}:00` : horaInicialParada
    const horaFimFormatada =
      horaFinalParada.length === 5 ? `${horaFinalParada}:00` : horaFinalParada

    const paradaData: ParadaLocalStorage = {
      id: registroParada.id,
      linha_id: linhaId,
      lote_id: lote || null,
      codigo_parada_id: paradaSelecionada.Apontamento || 'CODIGO_TEMP',
      turno_id: turno,
      data_parada: format(data!, 'yyyy-MM-dd'),
      hora_inicio: horaInicioFormatada,
      hora_fim: horaFimFormatada,
      duracao_minutos: duracaoMinutos,
      observacao: `${paradaSelecionada.Natureza || ''} - ${paradaSelecionada.Classe || ''} - ${paradaSelecionada['Grande Parada'] || ''} - ${observacoesParada || ''}`.trim(),
      criado_por_operador: 1,
      conferido_por_supervisor: null,
      conferido_em: null,
      created_at: new Date().toISOString(),
      created_by: 1,
      updated_at: new Date().toISOString(),
      updated_by: null,
      deleted_at: null,
      deleted_by: null
    }

    // Salvar no localStorage
    salvarParada(paradaData)

    // Atualiza histórico exibido imediatamente e persiste no storage da tela
    const registroHistorico: RegistroParada = {
      id: registroParada.id,
      data: format(data!, 'dd/MM/yyyy'),
      turno,
      linhaId,
      linhaNome: linhaSelecionada?.nome || '',
      horaInicio: horaInicialParada,
      horaFim: horaFinalParada,
      duracao: duracaoMinutos,
      tipoParada: paradaSelecionada.Apontamento || paradaSelecionada.Descrição || 'Parada',
      codigoParada: paradaSelecionada.Apontamento || 'CODIGO_TEMP',
      descricaoParada: paradaSelecionada.Descrição || '',
      observacoes: observacoesParada,
      dataHoraRegistro: format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
    }

    const historicoAtualizado = [registroHistorico, ...historicoParadas]
    setHistoricoParadas(historicoAtualizado)
    salvarParadasNoLocalStorage(historicoAtualizado)
    setTotalHorasParadas(historicoAtualizado.reduce((total, parada) => total + (parada.duracao || 0), 0) / 60)

    // Recalcular OEE se houver apontamento de produção e linha
    if (apontamentoProducaoId && linhaId) {
      try {
        const novoOEE = calcularOEECompleto(apontamentoProducaoId, linhaId, TEMPO_DISPONIVEL_PADRAO)
        setOeeCalculado(novoOEE)
        console.log('🔄 OEE recalculado após parada:', novoOEE)
      } catch (error) {
        console.error('Erro ao recalcular OEE após parada:', error)
      }
    }

    // Limpar formulário
    setCodigoParadaBusca('')
    setParadaSelecionada(null)
    setHoraInicialParada('')
    setHoraFinalParada('')
    setObservacoesParada('')

    toast({
      title: 'Sucesso',
      description: `Parada registrada: ${duracaoMinutos} minutos (${Math.floor(duracaoMinutos / 60)}h ${duracaoMinutos % 60}min)`,
      variant: 'default'
    })
  }

  const handleNovaParada = () => {
    setMostrarFormularioParada(true)
  }

  // ==================== Handlers do Header CRUD ====================
  const handleVoltar = () => {
    window.history.back()
  }

  const handleDashboard = () => {
    // TODO: Navegar para o dashboard principal quando a rota estiver definida
    toast({
      title: 'Navegação',
      description: 'Redirecionando para o dashboard...'
    })
  }

  const handleSalvar = () => {
    // TODO: Implementar lógica de salvamento geral do apontamento
    toast({
      title: 'Sucesso',
      description: 'Dados do apontamento salvos com sucesso'
    })
  }

  const handleExcluir = () => {
    // TODO: Adicionar diálogo de confirmação antes de excluir
    toast({
      title: 'Atenção',
      description: 'Funcionalidade de exclusão será implementada',
      variant: 'destructive'
    })
  }

  return (
    <>
      {/* Cabeçalho da Aplicação */}
      <AppHeader
        title="SysOEE - Sistema de Monitoramento OEE"
        userName="Emanuel Silva"
        userRole="Administrador"
      />

      {/* Header CRUD */}
      <div className="bg-background-light dark:bg-background-dark">
        <div className="flex justify-center">
          <div className="w-full max-w-[1600px] px-3.5 pr-1.5 pt-3.5 pb-0">
            <div className="flex items-center justify-between">
              {/* Seção Esquerda - Título e Subtítulo */}
              <div>
                <h1 className="text-2xl font-bold text-brand-primary">
                  Diário de Bordo
                </h1>
                <p className="text-brand-text-secondary">
                  Registro de produção, qualidade e paradas
                </p>
              </div>

              {/* Seção Direita - Botões de Ação */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-100 min-w-[120px] justify-center"
                  onClick={handleVoltar}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>

                <Button
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white min-w-[120px] justify-center"
                  onClick={handleDashboard}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>

                {/* Dropdown de Complemento */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="bg-brand-primary hover:bg-brand-primary/90 text-white min-w-[120px] justify-center"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Complemento
                      <ChevronDownIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => console.log('Procedimento Operacional')}>
                      Procedimento Operacional
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log('Anexos')}>
                      Anexos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log('Evento')}>
                      Evento
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log('Desvio')}>
                      Desvio
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log('Manutenção')}>
                      Manutenção
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log('Tecnologia da Informação')}>
                      Tecnologia da Informação
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="destructive"
                  className="min-w-[120px] justify-center"
                  onClick={handleExcluir}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Excluir
                </Button>

                <Button
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white min-w-[120px] justify-center"
                  onClick={handleSalvar}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo da Página - Container Centralizado */}
      <div className="min-h-screen flex justify-center gap-0 text-text-primary-light dark:text-text-primary-dark transition-colors duration-300" style={{ backgroundColor: '#f1f4f8' }}>
        {/* Container com largura máxima centralizado */}
        <div className="w-full max-w-[1600px] flex gap-0">
          {/* Conteúdo Principal */}
          <div className="flex-grow flex flex-col">
            {/* Main Content */}
            <main className="flex-grow p-4 pr-2 bg-background-light dark:bg-background-dark">
          {/* Dashboard OEE - Cabeçalho com Filtros */}
          <div className="flex-grow bg-white dark:bg-white p-4 pr-2 shadow-sm border-b border-border-light dark:border-border-dark mb-6">
            <div className="flex flex-col gap-y-4">
              {/* Primeira linha: Data, Código do Turno, Turno, Hora Inicial, Hora Final */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-x-4 gap-y-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="date" className="text-sm font-medium text-muted-foreground">
                    Data
                  </Label>
                  <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date"
                        className="w-full justify-between font-normal"
                        disabled={cabecalhoBloqueado}
                      >
                        {data ? data.toLocaleDateString('pt-BR') : "Selecione a data"}
                        <ChevronDownIcon className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={data}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          setData(date)
                          setOpenDatePicker(false)
                        }}
                        locale={ptBR}
                        disabled={cabecalhoBloqueado}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Turno - Código */}
                <div>
                  <span className="block text-sm font-medium text-muted-foreground mb-1.5">Código do Turno</span>
                  <Input
                    type="text"
                    value={turnoCodigo}
                    readOnly
                    disabled={cabecalhoBloqueado}
                    placeholder="Código"
                    className="bg-muted/50 cursor-not-allowed"
                  />
                </div>

                {/* Turno - Nome com Botão de Busca */}
                <div>
                  <span className="block text-sm font-medium text-muted-foreground mb-1.5">Turno</span>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={turnoNome}
                      readOnly
                      disabled={cabecalhoBloqueado}
                      placeholder="Selecione um turno"
                      className="flex-1 bg-muted/50 cursor-not-allowed"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={abrirModalBuscaTurno}
                      disabled={cabecalhoBloqueado}
                      title="Buscar turno"
                      className="flex-none"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Hora Inicial do Turno */}
                <div>
                  <span className="block text-sm font-medium text-muted-foreground mb-1.5">Hora Inicial</span>
                  <Input
                    type="time"
                    value={turnoHoraInicial}
                    onChange={(e) => setTurnoHoraInicial(e.target.value)}
                    disabled={cabecalhoBloqueado}
                    placeholder="00:00"
                    className="bg-background-light dark:bg-background-dark"
                  />
                </div>

                {/* Hora Final do Turno */}
                <div>
                  <span className="block text-sm font-medium text-muted-foreground mb-1.5">Hora Final</span>
                  <Input
                    type="time"
                    value={turnoHoraFinal}
                    onChange={(e) => setTurnoHoraFinal(e.target.value)}
                    disabled={cabecalhoBloqueado}
                    placeholder="00:00"
                    className="bg-background-light dark:bg-background-dark"
                  />
                </div>
              </div>

              {/* Segunda linha: Linha de Produção */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2">
                <div>
                  <span className="block text-sm font-medium text-muted-foreground mb-1.5">Linha de Produção</span>
                  <Select value={linhaId} onValueChange={setLinhaId} disabled={cabecalhoBloqueado}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>SPEP</SelectLabel>
                        {LINHAS_PRODUCAO.filter(l => l.setor === 'SPEP').map(linha => (
                          <SelectItem key={linha.id} value={linha.id}>{linha.nome}</SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>SPPV</SelectLabel>
                        {LINHAS_PRODUCAO.filter(l => l.setor === 'SPPV').map(linha => (
                          <SelectItem key={linha.id} value={linha.id}>{linha.nome}</SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Líquidos</SelectLabel>
                        {LINHAS_PRODUCAO.filter(l => l.setor === 'Líquidos').map(linha => (
                          <SelectItem key={linha.id} value={linha.id}>{linha.nome}</SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>CPHD</SelectLabel>
                        {LINHAS_PRODUCAO.filter(l => l.setor === 'CPHD').map(linha => (
                          <SelectItem key={linha.id} value={linha.id}>{linha.nome}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Terceira linha: OP (com busca), SKU, Lote, Dossie */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-2">
                <div>
                  <span className="block text-sm font-medium text-muted-foreground mb-1.5">Ordem de Produção</span>
                  <div className="flex gap-2">
                    <input
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      type="text"
                      value={ordemProducao}
                      onChange={(e) => setOrdemProducao(e.target.value)}
                      placeholder="Digite a OP"
                      disabled={cabecalhoBloqueado}
                    />
                    <button
                      type="button"
                      onClick={buscarDadosOP}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-3"
                      disabled={cabecalhoBloqueado}
                      title="Buscar dados da Ordem de Produção"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <span className="block text-sm font-medium text-muted-foreground mb-1.5">SKU</span>
                  <input
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    type="text"
                    value={skuCodigo}
                    onChange={(e) => setSkuCodigo(e.target.value)}
                    placeholder="Digite o código SKU"
                    disabled={cabecalhoBloqueado}
                  />
                </div>

                <div>
                  <span className="block text-sm font-medium text-muted-foreground mb-1.5">Lote</span>
                  <input
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    type="text"
                    value={lote}
                    onChange={(e) => setLote(e.target.value)}
                    disabled={cabecalhoBloqueado}
                  />
                </div>
              </div>

              {/* Terceira linha: Dossie */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-2">
                <div className="md:col-span-4">
                  <span className="block text-sm font-medium text-muted-foreground mb-1.5">Dossie</span>
                  <input
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    type="text"
                    value={dossie}
                    onChange={(e) => setDossie(e.target.value)}
                    disabled={cabecalhoBloqueado}
                  />
                </div>
              </div>

              {/* Terceira linha: Botão de Controle de Turno e edição de cabeçalho */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {statusTurno === 'INICIADO' && (
                  <div className="flex gap-2">
                    {!editandoCabecalho ? (
                      <Button
                        variant="outline"
                        onClick={handleEditarCabecalho}
                        className="border-orange-200 text-orange-700 hover:bg-orange-50"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Alterar Turno
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={handleCancelarEdicaoCabecalho}
                        className="border-gray-300 text-gray-700 hover:bg-gray-100"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancelar
                      </Button>
                    )}
                  </div>
                )}

                {statusTurno === 'NAO_INICIADO' && (
                  <Button
                    onClick={handleIniciarTurno}
                    disabled={!validarCamposCabecalho()}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Iniciar Turno
                  </Button>
                )}

                {statusTurno === 'INICIADO' && (
                  <Button
                    onClick={editandoCabecalho ? handleContinuarTurno : handleSolicitarEncerramento}
                    disabled={editandoCabecalho && !validarCamposCabecalho()}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {editandoCabecalho ? (
                      <CircleCheck className="mr-2 h-4 w-4" />
                    ) : (
                      <StopCircle className="mr-2 h-4 w-4" />
                    )}
                    {editandoCabecalho ? 'Continuar Turno' : 'Encerrar Turno'}
                  </Button>
                )}

                {statusTurno === 'ENCERRADO' && (
                  <div className="flex items-center gap-2 text-green-700 font-medium">
                    <CheckCircle className="h-5 w-5" />
                    Turno Encerrado
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dialog de Confirmação de Encerramento */}
          <AlertDialog open={showConfirmEncerramento} onOpenChange={setShowConfirmEncerramento}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Encerramento do Turno</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja encerrar o turno? Esta ação não poderá ser desfeita.
                  Certifique-se de que todos os apontamentos foram registrados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleEncerrarTurno} className="bg-orange-600 hover:bg-orange-700">
                  Confirmar Encerramento
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Dialog de Confirmação de Exclusão de Registro */}
          <AlertDialog open={showConfirmExclusao} onOpenChange={setShowConfirmExclusao}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão de Registro</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir este registro de produção? Esta ação não pode ser desfeita.
                  {registroParaExcluir && (
                    <span className="block mt-2 font-medium text-text-primary-light dark:text-text-primary-dark">
                      Registro: {historicoProducao.find(r => r.id === registroParaExcluir)?.dataHoraRegistro}
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={cancelarExclusao}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleExcluirProducao}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Confirmar Exclusão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Dialog de Confirmação de Exclusão de Parada */}
          <AlertDialog open={showConfirmExclusaoParada} onOpenChange={setShowConfirmExclusaoParada}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão de Parada</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir este registro de parada? Esta ação não pode ser desfeita.
                  {paradaParaExcluir && (
                    <span className="block mt-2 font-medium text-text-primary-light dark:text-text-primary-dark">
                      Registro: {historicoParadas.find(r => r.id === paradaParaExcluir)?.dataHoraRegistro}
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={cancelarExclusaoParada}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleExcluirParada}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Confirmar Exclusão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Cards de Seleção de Formulário */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div
              className={`bg-white dark:bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow ${
                formularioAtivo === 'production-form'
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-border-light dark:border-border-dark'
              }`}
              onClick={() => setFormularioAtivo('production-form')}
            >
              <h3 className="font-display text-lg font-bold text-primary mb-2">Produção</h3>
              <p className="text-sm text-muted-foreground">
                Registro de Produção em ciclos
              </p>
            </div>

            <div
              className={`bg-white dark:bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow ${
                formularioAtivo === 'quality-form'
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-border-light dark:border-border-dark'
              }`}
              onClick={() => setFormularioAtivo('quality-form')}
            >
              <h3 className="font-display text-lg font-bold text-primary mb-2">Qualidade</h3>
              <p className="text-sm text-muted-foreground">
                Registro de perdas e retrabalhos
              </p>
            </div>

            <div
              className={`bg-white dark:bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow ${
                formularioAtivo === 'downtime-form'
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-border-light dark:border-border-dark'
              }`}
              onClick={() => setFormularioAtivo('downtime-form')}
            >
              <h3 className="font-display text-lg font-bold text-primary mb-2">Tempo de Parada</h3>
              <p className="text-sm text-muted-foreground">
                Registro de interrupções e motivos
              </p>
            </div>
          </div>

          {/* Formulário de Produção */}
          {formularioAtivo === 'production-form' && (
            <div className="space-y-6">
              <section className="bg-white dark:bg-white p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
                <h2 className="font-display text-xl font-bold text-primary mb-4">Registro de Produção</h2>
                <div className="space-y-4">
                  {/* Container flex para inputs de tempo e quantidade na mesma linha */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="start-time" className="px-1">Hora Início</Label>
                      <Input type="time" id="start-time" step="60" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="bg-background-light dark:bg-background-dark appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-full sm:w-32 md:w-36" />
                    </div>

                    <div className="flex flex-col gap-3">
                      <Label htmlFor="end-time" className="px-1">Hora Fim</Label>
                      <Input type="time" id="end-time" step="60" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} className="bg-background-light dark:bg-background-dark appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-full sm:w-32 md:w-36" />
                    </div>

                    <div className="flex flex-col gap-3">
                      <Label htmlFor="quantity-produced" className="px-1">Quantidade Produzida</Label>
                      <input
                        className="flex h-9 w-full sm:w-40 md:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="quantity-produced"
                        type="number"
                        placeholder="ex: 10000"
                        value={quantidadeProduzida}
                        onChange={(e) => setQuantidadeProduzida(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-2">
                    <Button
                      className="bg-brand-primary hover:bg-brand-primary/90 text-white min-w-[120px] justify-center"
                      onClick={handleSalvarProducao}
                    >
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      Apontar
                    </Button>
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-white p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
                <h2 className="font-display text-xl font-bold text-primary mb-4">Histórico de Registros de Produção</h2>
                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                  <table className="w-full text-sm text-left text-text-primary-light dark:text-text-primary-dark">
                    <thead className="text-xs text-muted-foreground uppercase bg-background-light dark:bg-background-dark sticky top-0">
                      <tr>
                        <th className="px-1 py-2 font-medium w-10" scope="col">Ações</th>
                        <th className="px-1 py-2 font-medium" scope="col">Data/Hora</th>
                        <th className="px-1 py-2 font-medium" scope="col">Início</th>
                        <th className="px-1 py-2 font-medium" scope="col">Fim</th>
                        <th className="px-1 py-2 font-medium text-right" scope="col">Qtd. Prod.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicoProducao.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-1 py-4 text-center text-muted-foreground">
                            Nenhum registro de produção encontrado
                          </td>
                        </tr>
                      ) : (
                        historicoProducao.map((registro) => (
                          <tr
                            key={registro.id}
                            className={`bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark`}
                          >
                            <td className="px-1 py-2 whitespace-nowrap">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => confirmarExclusao(registro.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                title="Excluir registro"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </td>
                            <td className="px-1 py-2 whitespace-nowrap">{registro.dataHoraRegistro}</td>
                            <td className="px-1 py-2 whitespace-nowrap">{registro.horaInicio}</td>
                            <td className="px-1 py-2 whitespace-nowrap">{registro.horaFim}</td>
                            <td className="px-1 py-2 text-right whitespace-nowrap">{formatarQuantidade(registro.quantidadeProduzida)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* Formulário de Qualidade */}
          {formularioAtivo === 'quality-form' && (
            <section className="bg-surface-light dark:bg-surface-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
              <h2 className="font-display text-xl font-bold text-primary mb-4">Registro de Qualidade</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-2 border-b border-border-light dark:border-border-dark pb-2">
                    Perdas
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="loss-quantity">
                        Quantidade
                      </label>
                      <input
                        className="w-full rounded-md border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                        id="loss-quantity"
                        type="number"
                        value={quantidadePerdas}
                        onChange={(e) => setQuantidadePerdas(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="loss-reason">
                        Motivo
                      </label>
                      <input
                        className="w-full rounded-md border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                        id="loss-reason"
                        type="text"
                        value={motivoPerdas}
                        onChange={(e) => setMotivoPerdas(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-2 border-b border-border-light dark:border-border-dark pb-2">
                    Retrabalho
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="rework-quantity">
                        Quantidade
                      </label>
                      <input
                        className="w-full rounded-md border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                        id="rework-quantity"
                        type="number"
                        value={quantidadeRetrabalho}
                        onChange={(e) => setQuantidadeRetrabalho(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="rework-reason">
                        Motivo
                      </label>
                      <input
                        className="w-full rounded-md border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                        id="rework-reason"
                        type="text"
                        value={motivoRetrabalho}
                        onChange={(e) => setMotivoRetrabalho(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button
                  className="w-full mt-2 bg-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                  type="button"
                  onClick={handleAdicionarQualidade}
                >
                  <CheckCircle className="h-5 w-5" />
                  Adicionar Registro de Qualidade
                </button>
              </div>
            </section>
          )}

          {/* Formulário de Tempo de Parada */}
          {formularioAtivo === 'downtime-form' && (
            <section className="bg-surface-light dark:bg-surface-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
              <h2 className="font-display text-xl font-bold text-primary mb-4">Registro de Tempo de Parada</h2>

              {/* Tela de Estado Vazio - Nenhuma parada em andamento */}
              {paradasAtivas.length === 0 && !mostrarFormularioParada ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CircleCheck className="h-16 w-16 text-green-500 mb-4" />
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
                <div className="space-y-4">
                  {/* 1. Componente de Busca de Tipo de Parada */}
                  <div className="w-full sm:w-[304px]">
                    <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="codigo-parada">
                      Tipo de Parada
                    </label>
                    <div className="flex gap-2">
                      <input
                        className="flex flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="codigo-parada"
                        type="text"
                        value={codigoParadaBusca}
                        onChange={(e) => setCodigoParadaBusca(e.target.value)}
                        placeholder="Digite o código da parada ou clique na lupa para buscar"
                        readOnly
                        onClick={abrirModalBuscaParadas}
                      />
                      <button
                        type="button"
                        onClick={abrirModalBuscaParadas}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-3"
                        title="Buscar tipo de parada"
                      >
                        <Search className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Exibir hierarquia de 5 níveis quando parada for selecionada */}
                  {paradaSelecionada && (
                    <div className="p-4 bg-muted/50 rounded-md space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Hierarquia da Parada:</p>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Natureza:</span> {paradaSelecionada.Natureza || 'N/A'}</p>
                        <p><span className="font-medium">Classe:</span> {paradaSelecionada.Classe || 'N/A'}</p>
                        <p><span className="font-medium">Grande Parada:</span> {paradaSelecionada['Grande Parada'] || 'N/A'}</p>
                        <p><span className="font-medium">Apontamento:</span> {paradaSelecionada.Apontamento || 'N/A'}</p>
                        <p><span className="font-medium">Descrição:</span> {paradaSelecionada.Descrição || 'N/A'}</p>
                      </div>
                    </div>
                  )}

                  {/* 2 e 3. Componentes de Hora Inicial e Hora Final (lado a lado) */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Hora Inicial */}
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="hora-inicial-parada">
                        Hora Inicial
                      </label>
                      <input
                        className="w-36 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="hora-inicial-parada"
                        type="time"
                        value={horaInicialParada}
                        onChange={(e) => setHoraInicialParada(e.target.value)}
                      />
                    </div>

                    {/* Hora Final */}
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="hora-final-parada">
                        Hora Final
                      </label>
                      <input
                        className="w-36 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="hora-final-parada"
                        type="time"
                        value={horaFinalParada}
                        onChange={(e) => setHoraFinalParada(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Exibir duração calculada automaticamente */}
                  {horaInicialParada && horaFinalParada && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Duração calculada: {(() => {
                          const [horaIni, minIni] = horaInicialParada.split(':').map(Number)
                          const [horaFin, minFin] = horaFinalParada.split(':').map(Number)
                          const minutosInicio = horaIni * 60 + minIni
                          const minutosFim = horaFin * 60 + minFin
                          const duracaoMinutos = minutosFim - minutosInicio

                          if (duracaoMinutos < 0) {
                            return 'Hora final deve ser maior que hora inicial'
                          }

                          const horas = Math.floor(duracaoMinutos / 60)
                          const minutos = duracaoMinutos % 60
                          return `${horas}h ${minutos}min (${duracaoMinutos} minutos)`
                        })()}
                      </p>
                    </div>
                  )}

                  {/* 4. Componente de Observações */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="observacoes-parada">
                      Observações da Parada
                    </label>
                    <textarea
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                      id="observacoes-parada"
                      value={observacoesParada}
                      onChange={(e) => setObservacoesParada(e.target.value)}
                      placeholder="Digite observações adicionais sobre a parada..."
                    />
                  </div>

                  <button
                    className="w-full mt-2 bg-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                    type="button"
                    onClick={handleRegistrarParada}
                  >
                    <Timer className="h-5 w-5" />
                    Registrar Tempo de Parada
                  </button>
                </div>
              )}

              {/* Histórico de Registros de Paradas */}
              <section className="bg-white dark:bg-white p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark mt-6">
                <h2 className="font-display text-xl font-bold text-primary mb-4">Histórico de Registros de Paradas</h2>
                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                  <table className="w-full text-sm text-left text-text-primary-light dark:text-text-primary-dark">
                    <thead className="text-xs text-muted-foreground uppercase bg-background-light dark:bg-background-dark sticky top-0">
                      <tr>
                        <th className="px-1 py-2 font-medium w-10" scope="col">Ações</th>
                        <th className="px-1 py-2 font-medium" scope="col">Data/Hora</th>
                        <th className="px-1 py-2 font-medium" scope="col">Início</th>
                        <th className="px-1 py-2 font-medium" scope="col">Fim</th>
                        <th className="px-1 py-2 font-medium" scope="col">Duração</th>
                        <th className="px-1 py-2 font-medium" scope="col">Tipo de Parada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicoParadas.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-1 py-4 text-center text-muted-foreground">
                            Nenhum registro de parada encontrado
                          </td>
                        </tr>
                      ) : (
                        historicoParadas.map((registro) => (
                          <tr
                            key={registro.id}
                            className={`bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark`}
                          >
                            <td className="px-1 py-2 whitespace-nowrap">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => confirmarExclusaoParada(registro.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                title="Excluir registro"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </td>
                            <td className="px-1 py-2 whitespace-nowrap">{registro.dataHoraRegistro}</td>
                            <td className="px-1 py-2 whitespace-nowrap">{registro.horaInicio}</td>
                            <td className="px-1 py-2 whitespace-nowrap">{registro.horaFim}</td>
                            <td className="px-1 py-2 whitespace-nowrap">{formatarDuracao(registro.duracao)}</td>
                            <td className="px-1 py-2 whitespace-nowrap">{registro.tipoParada}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </section>
          )}
          </main>
        </div>

        {/* Sidebar Direita - OEE Real */}
        <div className="w-80 lg:w-96 xl:w-[28rem] flex-shrink-0 pl-2 pr-4 py-4 bg-background-light dark:bg-background-dark">
          <aside className="w-full bg-white dark:bg-white p-6 border border-border-light dark:border-border-dark flex flex-col items-center rounded-lg shadow-sm">
            <div className="sticky top-6 w-full">
              <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark mb-6 text-center">
                OEE Real
              </h2>

              <div className="flex flex-col items-center gap-8 mb-8">
                {/* Velocímetro SVG */}
                <div className="relative flex-shrink-0">
                  <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 120 120">
                    {/* Círculo de fundo */}
                    <circle
                      className="stroke-gray-200 dark:stroke-gray-700"
                      cx="60"
                      cy="60"
                      fill="none"
                      r="54"
                      strokeWidth="12"
                    />
                    {/* Círculo de progresso */}
                    <circle
                      className="stroke-primary"
                      cx="60"
                      cy="60"
                      fill="none"
                      r="54"
                      strokeDasharray="339.292"
                      strokeDashoffset={339.292 - (339.292 * oeeCalculado.oee) / 100}
                      strokeLinecap="round"
                      strokeWidth="12"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-bold text-text-primary-light dark:text-text-primary-dark" style={{ fontSize: '37.8px' }}>
                      {formatarPercentual(oeeCalculado.oee)}%
                    </span>
                  </div>
                </div>

                {/* Barras de Componentes */}
                <div className="w-full space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="font-semibold text-base">{formatarPercentual(oeeCalculado.disponibilidade)}%</span>
                      <span className="text-muted-foreground">Disponibilidade</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${oeeCalculado.disponibilidade}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="font-semibold text-base">{formatarPercentual(oeeCalculado.performance)}%</span>
                      <span className="text-muted-foreground">Performance</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${oeeCalculado.performance}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="font-semibold text-base">{formatarPercentual(oeeCalculado.qualidade)}%</span>
                      <span className="text-muted-foreground">Qualidade</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${oeeCalculado.qualidade}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="w-full border-t border-border-light dark:border-border-dark pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Horas Restantes de Apontamento de Produção
                  </span>
                  <span className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">
                    {formatarHoras(horasRestantes)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total de Horas Paradas
                  </span>
                  <span className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">
                    {formatarHoras(totalHorasParadas)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total de Perdas de Qualidade
                  </span>
                  <span className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">
                    {totalPerdasQualidade.toLocaleString('pt-BR')} un
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
        </div>
      </div>

      {/* Modal de Busca de Paradas */}
      <ModalBuscaParadas
        aberto={modalBuscaParadasAberto}
        onFechar={() => setModalBuscaParadasAberto(false)}
        onSelecionarParada={handleSelecionarParadaModal}
        paradasGerais={paradasGeraisData}
      />

      {/* Modal de Busca de Turno */}
      <ModalBuscaTurno
        aberto={modalBuscaTurnoAberto}
        onFechar={() => setModalBuscaTurnoAberto(false)}
        onSelecionarTurno={handleSelecionarTurnoModal}
      />
    </>
  )
}
