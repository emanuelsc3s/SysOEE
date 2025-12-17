/**
 * Página de Apontamento de OEE
 * Permite apontamento de produção, qualidade (perdas e retrabalho) e paradas
 * Calcula OEE em tempo real e exibe em velocímetro
 *
 * Layout baseado em code_oee_apontar.html
 */

import { useState, useEffect, useCallback } from 'react'
import { Save, Timer, CheckCircle, ChevronDownIcon, Trash, LayoutDashboard, ArrowLeft, FileText, Play, StopCircle, Search, CircleCheck, Plus, Pencil, X, Settings, Info, Package } from 'lucide-react'
import { ptBR } from 'date-fns/locale'
import { format } from 'date-fns'
import { buscarLinhaPorId } from '@/data/mockLinhas'
import { obterTodasOPs } from '@/data/ordem-producao-totvs'
import paradasGeraisData from '../../data/paradas.json'
import { Turno } from '@/types/operacao'
import {
  salvarApontamentoProducao,
  calcularOEECompleto,
  excluirApontamentoProducao,
  buscarApontamentoProducaoPorId,
  atualizarApontamentoProducao,
  salvarApontamentoPerdas,
  salvarApontamentoRetrabalho,
  buscarTodosApontamentosPerdas,
  buscarTodosApontamentosRetrabalho,
  calcularTotalPerdasPorLinhaESku
} from '@/services/localStorage/apontamento-oee.storage'
import { salvarParada, ParadaLocalStorage, atualizarParada, excluirParada } from '@/services/localStorage/parada.storage'
import { CalculoOEE, CriarApontamentoProducaoDTO } from '@/types/apontamento-oee'
import { useToast } from '@/hooks/use-toast'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AppHeader } from "@/components/layout/AppHeader"
import { ModalBuscaParadas, type ParadaGeral } from "@/components/apontamento/ModalBuscaParadas"
import { ModalBuscaTurno, type TurnoSelecionado } from "@/components/modal/ModalBuscaTurno"
import { ModalBuscaSKU, type SKUSelecionado } from "@/components/modal/ModalBuscaSKU"
import { ModalBuscaLinhaProducao, type LinhaProducaoSelecionada } from "@/components/modal/modalBuscaLinhaProducao"

// Tipo para os formulários disponíveis
type FormularioAtivo = 'production-form' | 'quality-form' | 'downtime-form'

// Tipo para status do turno
type StatusTurno = 'NAO_INICIADO' | 'INICIADO' | 'ENCERRADO'

// Tipo para linha de apontamento de produção
type LinhaApontamentoProducao = {
  id: string
  horaInicio: string
  horaFim: string
  quantidadeProduzida: string
  apontamentoId?: string // ID do apontamento salvo no banco
  editavel?: boolean // Indica se a linha está em modo de edição
}

// Tipo para registro de produção no localStorage
interface RegistroProducao {
  id: string
  data: string
  turno: Turno
  linhaId: string
  linhaNome: string
  skuCodigo: string
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

// Tipo para registro de qualidade no localStorage
interface RegistroQualidade {
  id: string
  data: string
  turno: Turno
  linhaId: string
  linhaNome: string
  apontamentoProducaoId: string
  tipo: 'PERDAS' | 'RETRABALHO'
  quantidade: number
  motivo: string
  dataHoraRegistro: string
}

// Tipo para dados de lote com ID único
interface LoteProducao {
  id: string
  numeroLote: string
  data: string
  horaInicial: string
  horaFinal: string
  quantidadePerdas: number
  quantidadeProduzidaInicial: number
  quantidadeProduzidaFinal: number
  quantidadeProduzida: number // Calculado: Final - Inicial
}

// Tipo para dados do formulário de lote (sem ID para cadastro)
interface DadosLote {
  numeroLote: string
  data: string
  horaInicial: string
  horaFinal: string
  quantidadePerdas: number
  quantidadeProduzidaInicial: number
  quantidadeProduzidaFinal: number
}

// Estado inicial do formulário de lote
const estadoInicialLote: DadosLote = {
  numeroLote: '',
  data: '',
  horaInicial: '',
  horaFinal: '',
  quantidadePerdas: 0,
  quantidadeProduzidaInicial: 0,
  quantidadeProduzidaFinal: 0
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
  const [modalBuscaSKUAberto, setModalBuscaSKUAberto] = useState<boolean>(false)
  const [modalBuscaLinhaAberto, setModalBuscaLinhaAberto] = useState<boolean>(false)
  const [turnoHoraInicial, setTurnoHoraInicial] = useState<string>('') // Hora inicial do turno
  const [turnoHoraFinal, setTurnoHoraFinal] = useState<string>('') // Hora final do turno
  const [linhaId, setLinhaId] = useState<string>('')
  const [linhaNome, setLinhaNome] = useState<string>('') // Nome da linha selecionada para exibição
  const [linhaProducaoSelecionada, setLinhaProducaoSelecionada] = useState<LinhaProducaoSelecionada | null>(null)
  const [skuCodigo, setSkuCodigo] = useState<string>('')
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
    linhaNome: string
    linhaProducaoSelecionada: LinhaProducaoSelecionada | null
    skuCodigo: string
  } | null>(null)

  // ==================== Estado de Controle de Turno ====================
  const [statusTurno, setStatusTurno] = useState<StatusTurno>('NAO_INICIADO')
  const [showConfirmEncerramento, setShowConfirmEncerramento] = useState(false)

  // ==================== Estado de Configurações ====================
  const [modalConfiguracoesAberto, setModalConfiguracoesAberto] = useState(false)
  const [intervaloApontamento, setIntervaloApontamento] = useState<number>(1) // Padrão: 1 hora
  const [modalExplicacaoOEEAberto, setModalExplicacaoOEEAberto] = useState(false)

  // ==================== Estado do Modal de Lotes ====================
  const [modalLotesAberto, setModalLotesAberto] = useState(false)
  const [lotesProducao, setLotesProducao] = useState<LoteProducao[]>([]) // Lista de lotes cadastrados
  const [dadosLote, setDadosLote] = useState<DadosLote>(estadoInicialLote)
  const [salvandoLote, setSalvandoLote] = useState(false)
  const [formularioLoteAberto, setFormularioLoteAberto] = useState(false) // Controla exibição do formulário inline
  const [loteEmEdicao, setLoteEmEdicao] = useState<string | null>(null) // ID do lote sendo editado

  // ==================== Estado de Linhas de Apontamento de Produção ====================
  const [linhasApontamento, setLinhasApontamento] = useState<LinhaApontamentoProducao[]>([])

  // ==================== Estado de Produção ====================
  // Estados usados para restaurar dados ao editar um registro existente
  const [, setHoraInicio] = useState<string>('')
  const [, setHoraFim] = useState<string>('')
  const [, setQuantidadeProduzida] = useState<string>('')

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

  // ==================== Estado de Histórico de Qualidade ====================
  const [historicoQualidade, setHistoricoQualidade] = useState<RegistroQualidade[]>([])
  const [showConfirmExclusaoQualidade, setShowConfirmExclusaoQualidade] = useState(false)
  const [qualidadeParaExcluir, setQualidadeParaExcluir] = useState<string | null>(null)

  // ==================== Constante para chave do localStorage ====================
  const STORAGE_KEY = 'oee_production_records'
  const STORAGE_KEY_PARADAS = 'oee_downtime_records'
  const STORAGE_KEY_QUALIDADE = 'oee_quality_records'
  const STORAGE_KEY_CONFIGURACOES = 'oee_configuracoes_apontamento'

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

  /**
   * Carrega histórico de qualidade do localStorage
   */
  const carregarHistoricoQualidade = useCallback((): RegistroQualidade[] => {
    try {
      const dados = localStorage.getItem(STORAGE_KEY_QUALIDADE)
      if (dados) {
        return JSON.parse(dados)
      }
      return []
    } catch (error) {
      console.error('Erro ao carregar histórico de qualidade do localStorage:', error)
      return []
    }
  }, [])

  /**
   * Salva histórico de qualidade no localStorage
   */
  const salvarQualidadeNoLocalStorage = (registros: RegistroQualidade[]) => {
    try {
      localStorage.setItem(STORAGE_KEY_QUALIDADE, JSON.stringify(registros))
    } catch (error) {
      console.error('Erro ao salvar qualidade no localStorage:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar os dados de qualidade',
        variant: 'destructive'
      })
    }
  }

  /**
   * Carrega configurações do localStorage
   */
  const carregarConfiguracoes = useCallback(() => {
    try {
      const dados = localStorage.getItem(STORAGE_KEY_CONFIGURACOES)
      if (dados) {
        const config = JSON.parse(dados)
        setIntervaloApontamento(config.intervaloApontamento || 1)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do localStorage:', error)
    }
  }, [])

  /**
   * Salva configurações no localStorage
   */
  const salvarConfiguracoes = () => {
    try {
      const config = {
        intervaloApontamento
      }
      localStorage.setItem(STORAGE_KEY_CONFIGURACOES, JSON.stringify(config))
      toast({
        title: '✅ Configurações Salvas',
        description: `Intervalo de apontamento definido para ${intervaloApontamento} ${intervaloApontamento === 1 ? 'hora' : 'horas'}`,
      })
      setModalConfiguracoesAberto(false)

      // Regenerar linhas de apontamento se o turno já estiver selecionado
      // IMPORTANTE: Só regenera se o turno NÃO estiver iniciado
      if (turnoHoraInicial && turnoHoraFinal && statusTurno === 'NAO_INICIADO') {
        gerarLinhasApontamento(turnoHoraInicial, turnoHoraFinal, intervaloApontamento)
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações',
        variant: 'destructive'
      })
    }
  }

  /**
   * Valida os campos obrigatórios do formulário de lote
   * @returns true se todos os campos obrigatórios estão preenchidos
   */
  const validarCamposLote = (): boolean => {
    return (
      dadosLote.numeroLote.trim() !== '' &&
      dadosLote.data !== '' &&
      dadosLote.horaInicial !== '' &&
      (dadosLote.quantidadeProduzidaInicial > 0 || dadosLote.quantidadeProduzidaFinal > 0)
    )
  }

  /**
   * Reseta o formulário de lote para o estado inicial e fecha o formulário
   */
  const resetarFormularioLote = () => {
    setDadosLote(estadoInicialLote)
    setLoteEmEdicao(null)
    setFormularioLoteAberto(false)
  }

  /**
   * Calcula os totalizadores dos lotes
   */
  const calcularTotaisLotes = () => {
    return lotesProducao.reduce(
      (acc, lote) => ({
        totalProduzidoInicial: acc.totalProduzidoInicial + lote.quantidadeProduzidaInicial,
        totalProduzidoFinal: acc.totalProduzidoFinal + lote.quantidadeProduzidaFinal,
        totalProduzido: acc.totalProduzido + lote.quantidadeProduzida,
        totalPerdas: acc.totalPerdas + lote.quantidadePerdas
      }),
      { totalProduzidoInicial: 0, totalProduzidoFinal: 0, totalProduzido: 0, totalPerdas: 0 }
    )
  }

  /**
   * Abre o formulário para adicionar novo lote
   */
  const handleNovoLote = () => {
    resetarFormularioLote()
    setFormularioLoteAberto(true)
  }

  /**
   * Abre o formulário para editar um lote existente
   */
  const handleEditarLote = (lote: LoteProducao) => {
    setDadosLote({
      numeroLote: lote.numeroLote,
      data: lote.data,
      horaInicial: lote.horaInicial,
      horaFinal: lote.horaFinal,
      quantidadePerdas: lote.quantidadePerdas,
      quantidadeProduzidaInicial: lote.quantidadeProduzidaInicial,
      quantidadeProduzidaFinal: lote.quantidadeProduzidaFinal
    })
    setLoteEmEdicao(lote.id)
    setFormularioLoteAberto(true)
  }

  /**
   * Exclui um lote da lista
   */
  const handleExcluirLote = (id: string) => {
    const lote = lotesProducao.find(l => l.id === id)
    setLotesProducao(prev => prev.filter(l => l.id !== id))
    toast({
      title: '🗑️ Lote Excluído',
      description: `O lote ${lote?.numeroLote} foi removido.`
    })
  }

  /**
   * Salva os dados do lote (adiciona novo ou atualiza existente)
   */
  const handleSalvarLote = async () => {
    // Validar campos obrigatórios
    if (!validarCamposLote()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios: Número do Lote, Data, Hora Inicial e Quantidade Produzida (Inicial ou Final).',
        variant: 'destructive'
      })
      return
    }

    setSalvandoLote(true)

    // Calcular quantidade produzida (Final - Inicial), apenas se a quantidade final for maior que zero
    const quantidadeProduzidaCalculada = dadosLote.quantidadeProduzidaFinal > 0
      ? dadosLote.quantidadeProduzidaFinal - dadosLote.quantidadeProduzidaInicial
      : 0

    try {
      if (loteEmEdicao) {
        // Atualizar lote existente
        setLotesProducao(prev =>
          prev.map(lote =>
            lote.id === loteEmEdicao
              ? { ...lote, ...dadosLote, quantidadeProduzida: quantidadeProduzidaCalculada }
              : lote
          )
        )
        toast({
          title: '✅ Lote Atualizado',
          description: `O lote ${dadosLote.numeroLote} foi atualizado com sucesso.`
        })
      } else {
        // Criar novo lote com ID único
        const novoLote: LoteProducao = {
          id: `lote-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          ...dadosLote,
          quantidadeProduzida: quantidadeProduzidaCalculada
        }
        setLotesProducao(prev => [...prev, novoLote])
        toast({
          title: '✅ Lote Adicionado',
          description: `O lote ${dadosLote.numeroLote} foi adicionado com sucesso.`
        })
      }

      // Resetar formulário
      resetarFormularioLote()
    } catch (error) {
      console.error('Erro ao salvar lote:', error)
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar os dados do lote. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setSalvandoLote(false)
    }
  }

  /**
   * Gera linhas de apontamento de produção com base no intervalo configurado
   * @param horaInicial - Hora inicial do turno (formato HH:mm)
   * @param horaFinal - Hora final do turno (formato HH:mm)
   * @param intervalo - Intervalo em horas
   */
  const gerarLinhasApontamento = useCallback((horaInicial: string, horaFinal: string, intervalo: number) => {
    if (!horaInicial || !horaFinal || intervalo < 1) {
      setLinhasApontamento([])
      return
    }

    try {
      // Converter horas para minutos desde meia-noite
      const [horaInicioH, horaInicioM] = horaInicial.split(':').map(Number)
      const [horaFimH, horaFimM] = horaFinal.split(':').map(Number)

      const minutoInicio = horaInicioH * 60 + horaInicioM
      let minutoFim = horaFimH * 60 + horaFimM

      // Se hora final for menor que inicial, significa que o turno passa da meia-noite
      if (minutoFim < minutoInicio) {
        minutoFim += 24 * 60 // Adiciona 24 horas em minutos
      }

      const intervaloMinutos = intervalo * 60
      const linhas: LinhaApontamentoProducao[] = []
      let minutoAtual = minutoInicio

      // Gerar linhas de apontamento
      while (minutoAtual < minutoFim) {
        const proximoMinuto = Math.min(minutoAtual + intervaloMinutos, minutoFim)

        // Converter minutos de volta para formato HH:mm
        const formatarHora = (minutos: number): string => {
          const horas = Math.floor(minutos / 60) % 24
          const mins = minutos % 60
          return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
        }

        linhas.push({
          id: `linha-${Date.now()}-${minutoAtual}`,
          horaInicio: formatarHora(minutoAtual),
          horaFim: formatarHora(proximoMinuto),
          quantidadeProduzida: '',
          editavel: true // Linhas geradas automaticamente são editáveis
        })

        minutoAtual = proximoMinuto
      }

      setLinhasApontamento(linhas)
    } catch (error) {
      console.error('Erro ao gerar linhas de apontamento:', error)
      setLinhasApontamento([])
    }
  }, [])

  /**
   * Atualiza a quantidade produzida de uma linha específica
   */
  const atualizarQuantidadeLinha = (linhaId: string, quantidade: string) => {
    setLinhasApontamento(linhas =>
      linhas.map(linha =>
        linha.id === linhaId
          ? { ...linha, quantidadeProduzida: quantidade }
          : linha
      )
    )
  }

  /**
   * Habilita o modo de edição para uma linha específica
   */
  const handleEditarLinha = (linhaId: string) => {
    setLinhasApontamento(linhas =>
      linhas.map(linha =>
        linha.id === linhaId
          ? { ...linha, editavel: true }
          : linha
      )
    )
  }

  /**
   * Salva uma linha individual de apontamento de produção
   */
  const handleSalvarLinha = async (linhaApontamento: LinhaApontamentoProducao) => {
    // Validações
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

    if (!linhaApontamento.quantidadeProduzida || Number(linhaApontamento.quantidadeProduzida) <= 0) {
      toast({
        title: 'Campo obrigatório',
        description: 'Informe a Quantidade Produzida',
        variant: 'destructive'
      })
      return
    }

    const linha = buscarLinhaPorId(linhaId)
    if (!linha) {
      toast({
        title: 'Erro',
        description: 'Linha de produção não encontrada',
        variant: 'destructive'
      })
      return
    }

    const codigoSKU = skuCodigo.includes(' - ')
      ? skuCodigo.split(' - ')[0].trim()
      : skuCodigo.trim()

    const descricaoSKU = skuCodigo.includes(' - ')
      ? skuCodigo.split(' - ').slice(1).join(' - ').trim()
      : skuCodigo.trim()

    try {
      const tempoOperacaoHoras = calcularDiferencaHoras(
        linhaApontamento.horaInicio,
        linhaApontamento.horaFim
      )

      if (tempoOperacaoHoras <= 0) {
        toast({
          title: 'Erro',
          description: 'Tempo de operação inválido',
          variant: 'destructive'
        })
        return
      }

      const dto: CriarApontamentoProducaoDTO = {
        turno,
        linha: linha.nome,
        setor: linha.setor,
        sku: codigoSKU,
        produto: descricaoSKU,
        velocidadeNominal: 4000,
        quantidadeProduzida: Number(linhaApontamento.quantidadeProduzida),
        tempoOperacao: tempoOperacaoHoras,
        tempoDisponivel: 12,
        dataApontamento: format(data, 'yyyy-MM-dd'),
        horaInicio: linhaApontamento.horaInicio.includes(':')
          ? linhaApontamento.horaInicio + ':00'
          : linhaApontamento.horaInicio,
        horaFim: linhaApontamento.horaFim.includes(':')
          ? linhaApontamento.horaFim + ':00'
          : linhaApontamento.horaFim,
        criadoPor: 1,
        criadoPorNome: 'Emanuel Silva'
      }

      const apontamento = salvarApontamentoProducao(dto)

      // Criar registro para histórico
      const novoRegistro: RegistroProducao = {
        id: apontamento.id,
        data: format(data!, 'dd/MM/yyyy'),
        turno,
        linhaId,
        linhaNome: linha.nome,
        skuCodigo,
        horaInicio: linhaApontamento.horaInicio,
        horaFim: linhaApontamento.horaFim,
        quantidadeProduzida: Number(linhaApontamento.quantidadeProduzida),
        dataHoraRegistro: format(new Date(), 'dd/MM/yyyy HH:mm:ss')
      }

      // Atualizar histórico
      const novoHistorico = [novoRegistro, ...historicoProducao]
      setHistoricoProducao(novoHistorico)
      salvarNoLocalStorage(novoHistorico)

      // Atualizar linha com ID do apontamento e desabilitar edição
      setLinhasApontamento(linhas =>
        linhas.map(l =>
          l.id === linhaApontamento.id
            ? { ...l, apontamentoId: apontamento.id, editavel: false }
            : l
        )
      )

      // Atualizar OEE
      if (linhaId) {
        setApontamentoProducaoId(apontamento.id)
        const novoOEE = calcularOEECompleto(apontamento.id, linhaId, 12)
        setOeeCalculado(novoOEE)
      }

      toast({
        title: '✅ Linha Salva',
        description: `Apontamento de ${Number(linhaApontamento.quantidadeProduzida).toLocaleString('pt-BR')} unidades registrado com sucesso`
      })

    } catch (error) {
      console.error('❌ Erro ao salvar linha:', error)
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o apontamento. Tente novamente.',
        variant: 'destructive'
      })
    }
  }

  /**
   * Exclui uma linha individual de apontamento
   */
  const handleExcluirLinha = (linhaApontamento: LinhaApontamentoProducao) => {
    if (!linhaApontamento.apontamentoId) {
      // Se não foi salvo ainda, apenas limpa a quantidade
      setLinhasApontamento(linhas =>
        linhas.map(l =>
          l.id === linhaApontamento.id
            ? { ...l, quantidadeProduzida: '', editavel: false }
            : l
        )
      )
      toast({
        title: 'Linha limpa',
        description: 'Quantidade produzida removida'
      })
      return
    }

    // Se já foi salvo, confirmar exclusão
    try {
      // Buscar o registro no histórico
      const registro = historicoProducao.find(r => r.id === linhaApontamento.apontamentoId)

      if (!registro) {
        toast({
          title: 'Erro',
          description: 'Registro não encontrado',
          variant: 'destructive'
        })
        return
      }

      // Remover do histórico
      const novoHistorico = historicoProducao.filter(r => r.id !== linhaApontamento.apontamentoId)
      setHistoricoProducao(novoHistorico)
      salvarNoLocalStorage(novoHistorico)

      // Remover do serviço de apontamentos
      excluirApontamentoProducao(linhaApontamento.apontamentoId)

      // Limpar a linha
      setLinhasApontamento(linhas =>
        linhas.map(l =>
          l.id === linhaApontamento.id
            ? { ...l, quantidadeProduzida: '', apontamentoId: undefined, editavel: false }
            : l
        )
      )

      // Recalcular OEE
      recalcularIndicadoresAposExclusao(registro, novoHistorico)

      toast({
        title: '✅ Linha Excluída',
        description: 'Apontamento removido com sucesso'
      })

    } catch (error) {
      console.error('❌ Erro ao excluir linha:', error)
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o apontamento. Tente novamente.',
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
   * Soma perdas e retrabalhos por linha e SKU
   * OEE é calculado por linha de produção e código SKU, não por apontamento individual
   */
  const calcularTotalPerdasDoApontamento = (): number => {
    // Extrair apenas o código do SKU (sem a descrição)
    // skuCodigo pode ser "07010001 - SOL. CLORETO DE SODIO..." ou apenas "07010001"
    const codigoSKU = skuCodigo.includes(' - ')
      ? skuCodigo.split(' - ')[0].trim()
      : skuCodigo.trim()

    // Verificar se há linha e SKU selecionados
    if (!linhaId || !codigoSKU) {
      return 0
    }

    // Obter o nome da linha a partir do ID
    const linhaNome = linhaSelecionada?.nome

    // Usar a nova função que soma TODAS as perdas da linha e SKU
    // Passamos tanto o ID quanto o nome da linha para garantir a busca correta
    return calcularTotalPerdasPorLinhaESku(linhaId, codigoSKU, linhaNome)
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
   * Calcula a cor dinâmica baseada no percentual do indicador OEE
   * Implementa gradiente de vermelho (valores baixos) até azul (valores próximos a 100%)
   *
   * Escala de cores:
   * - 0-50%: Vermelho (#DC2626 a #F97316)
   * - 50-75%: Laranja/Amarelo (#F97316 a #EAB308)
   * - 75-90%: Verde/Azul claro (#10B981 a #3B82F6)
   * - 90-100%: Azul (#3B82F6 a #1E40AF)
   *
   * @param percentage - Percentual do indicador (0-100)
   * @returns Cor em formato hexadecimal
   */
  const getColorByPercentage = (percentage: number): string => {
    // Garantir que o percentual está entre 0 e 100
    const percent = Math.max(0, Math.min(100, percentage))

    // Definir pontos de cor (RGB)
    const colorStops = [
      { percent: 0, color: { r: 220, g: 38, b: 38 } },    // Vermelho escuro #DC2626
      { percent: 25, color: { r: 239, g: 68, b: 68 } },   // Vermelho #EF4444
      { percent: 50, color: { r: 249, g: 115, b: 22 } },  // Laranja #F97316
      { percent: 65, color: { r: 234, g: 179, b: 8 } },   // Amarelo #EAB308
      { percent: 75, color: { r: 34, g: 197, b: 94 } },   // Verde #22C55E
      { percent: 85, color: { r: 16, g: 185, b: 129 } },  // Verde-azulado #10B981
      { percent: 90, color: { r: 59, g: 130, b: 246 } },  // Azul claro #3B82F6
      { percent: 95, color: { r: 37, g: 99, b: 235 } },   // Azul #2563EB
      { percent: 100, color: { r: 30, g: 64, b: 175 } }   // Azul escuro #1E40AF
    ]

    // Encontrar os dois pontos de cor mais próximos
    let lowerStop = colorStops[0]
    let upperStop = colorStops[colorStops.length - 1]

    for (let i = 0; i < colorStops.length - 1; i++) {
      if (percent >= colorStops[i].percent && percent <= colorStops[i + 1].percent) {
        lowerStop = colorStops[i]
        upperStop = colorStops[i + 1]
        break
      }
    }

    // Calcular a interpolação entre os dois pontos
    const range = upperStop.percent - lowerStop.percent
    const rangePercent = range === 0 ? 0 : (percent - lowerStop.percent) / range

    // Interpolar RGB
    const r = Math.round(lowerStop.color.r + (upperStop.color.r - lowerStop.color.r) * rangePercent)
    const g = Math.round(lowerStop.color.g + (upperStop.color.g - lowerStop.color.g) * rangePercent)
    const b = Math.round(lowerStop.color.b + (upperStop.color.b - lowerStop.color.b) * rangePercent)

    // Converter para hexadecimal
    const toHex = (value: number) => {
      const hex = value.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
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
          registro.skuCodigo === registroExcluido.skuCodigo
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
        setTotalPerdasQualidade(calcularTotalPerdasDoApontamento())
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
   * Recalcula OEE e indicadores derivados após exclusão de uma parada
   * garantindo atualização imediata da UI para o período afetado.
   */
  const recalcularIndicadoresAposExclusaoParada = (
    paradaExcluida: RegistroParada,
    historicoParadasAtualizado: RegistroParada[]
  ) => {
    // Buscar o apontamento de produção ativo para o mesmo período
    const historicoProducao = carregarHistorico()
    const producoesDoPeriodo = historicoProducao.filter(
      (registro) =>
        registro.data === paradaExcluida.data &&
        registro.turno === paradaExcluida.turno &&
        registro.linhaId === paradaExcluida.linhaId
    )

    // Ordenar por data de registro (mais recente primeiro)
    const producoesOrdenadas = [...producoesDoPeriodo].sort(
      (a, b) => paraTimestamp(b.dataHoraRegistro) - paraTimestamp(a.dataHoraRegistro)
    )

    const apontamentoReferencia = producoesOrdenadas[0]

    // Recalcular total de horas paradas com o histórico atualizado
    const paradasDoPeriodo = historicoParadasAtualizado.filter(
      (registroParada) =>
        registroParada.data === paradaExcluida.data &&
        registroParada.turno === paradaExcluida.turno &&
        registroParada.linhaId === paradaExcluida.linhaId
    )

    const totalHorasParadasCalculado = paradasDoPeriodo.reduce(
      (total, parada) => total + (parada.duracao || 0),
      0
    ) / 60
    setTotalHorasParadas(totalHorasParadasCalculado)

    // Recalcular horas restantes
    setHorasRestantes(calcularHorasRestantes())

    // Se houver apontamento de produção ativo, recalcular OEE
    if (apontamentoReferencia) {
      try {
        const novoOEE = calcularOEECompleto(
          apontamentoReferencia.id,
          paradaExcluida.linhaId,
          TEMPO_DISPONIVEL_PADRAO
        )
        setOeeCalculado(novoOEE)
        setApontamentoProducaoId(apontamentoReferencia.id)
        setTotalPerdasQualidade(calcularTotalPerdasDoApontamento())

        console.log('✅ OEE recalculado após exclusão de parada:', {
          paradaExcluida: paradaExcluida.id,
          apontamentoReferencia: apontamentoReferencia.id,
          oee: `${novoOEE.oee.toFixed(2)}%`,
          disponibilidade: `${novoOEE.disponibilidade.toFixed(2)}%`,
          performance: `${novoOEE.performance.toFixed(2)}%`,
          qualidade: `${novoOEE.qualidade.toFixed(2)}%`,
          totalHorasParadas: totalHorasParadasCalculado.toFixed(2)
        })
        return
      } catch (error) {
        console.error('❌ Erro ao recalcular OEE após exclusão de parada:', error)
      }
    }

    // Se não houver apontamento de produção, apenas atualizar métricas de paradas
    console.log('ℹ️ Nenhum apontamento de produção ativo para recalcular OEE')
  }

  /**
   * Exclui um registro de parada do histórico
   * Remove do localStorage e recalcula OEE automaticamente
   */
  const handleExcluirParada = () => {
    if (!paradaParaExcluir) return

    try {
      // Buscar o registro da parada antes de excluir
      const paradaExcluida = historicoParadas.find(r => r.id === paradaParaExcluir)

      if (!paradaExcluida) {
        toast({
          title: 'Erro',
          description: 'Registro de parada não encontrado',
          variant: 'destructive'
        })
        cancelarExclusaoParada()
        return
      }

      // Remover do histórico local (oee_downtime_records)
      const novoHistorico = historicoParadas.filter(r => r.id !== paradaParaExcluir)
      setHistoricoParadas(novoHistorico)
      salvarParadasNoLocalStorage(novoHistorico)

      // IMPORTANTE: Também remover do serviço de paradas (sysoee_paradas)
      // Esta é a chave usada pelo cálculo de OEE
      excluirParada(paradaParaExcluir)

      console.log('🗑️ Parada excluída de ambos os storages:', {
        id: paradaParaExcluir,
        historicoLocal: 'oee_downtime_records',
        servicoParadas: 'sysoee_paradas'
      })

      // Recalcular todos os indicadores impactados (OEE e secundários) para o período afetado
      recalcularIndicadoresAposExclusaoParada(paradaExcluida, novoHistorico)

      // Feedback de sucesso
      toast({
        title: '✅ Parada Excluída',
        description: 'O registro de parada foi excluído e os indicadores foram recalculados',
      })

      // Fechar diálogo
      cancelarExclusaoParada()

    } catch (error) {
      console.error('❌ Erro ao excluir registro de parada:', error)
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o registro de parada. Tente novamente.',
        variant: 'destructive'
      })
      cancelarExclusaoParada()
    }
  }

  // ==================== Funções de Exclusão de Qualidade ====================

  /**
   * Confirma a exclusão de um registro de qualidade
   * @param qualidadeId - ID do registro de qualidade a ser excluído
   */
  const confirmarExclusaoQualidade = (qualidadeId: string) => {
    setQualidadeParaExcluir(qualidadeId)
    setShowConfirmExclusaoQualidade(true)
  }

  /**
   * Cancela a exclusão de qualidade e fecha o diálogo
   */
  const cancelarExclusaoQualidade = () => {
    setQualidadeParaExcluir(null)
    setShowConfirmExclusaoQualidade(false)
  }

  /**
   * Exclui um registro de qualidade do histórico
   * Remove do localStorage e recalcula OEE automaticamente
   */
  const handleExcluirQualidade = () => {
    if (!qualidadeParaExcluir) return

    try {
      // Buscar o registro de qualidade antes de excluir
      const qualidadeExcluida = historicoQualidade.find(r => r.id === qualidadeParaExcluir)

      if (!qualidadeExcluida) {
        toast({
          title: 'Erro',
          description: 'Registro de qualidade não encontrado',
          variant: 'destructive'
        })
        cancelarExclusaoQualidade()
        return
      }

      // Remover do histórico local
      const novoHistorico = historicoQualidade.filter(r => r.id !== qualidadeParaExcluir)
      setHistoricoQualidade(novoHistorico)
      salvarQualidadeNoLocalStorage(novoHistorico)

      // Remover do serviço de apontamentos (localStorage de perdas/retrabalho)
      if (qualidadeExcluida.tipo === 'PERDAS') {
        const perdas = buscarTodosApontamentosPerdas()
        const perdasAtualizadas = perdas.filter(p => p.id !== qualidadeParaExcluir)
        localStorage.setItem('sysoee_apontamentos_perdas', JSON.stringify(perdasAtualizadas))
      } else if (qualidadeExcluida.tipo === 'RETRABALHO') {
        const retrabalhos = buscarTodosApontamentosRetrabalho()
        const retrabalhosAtualizados = retrabalhos.filter(r => r.id !== qualidadeParaExcluir)
        localStorage.setItem('sysoee_apontamentos_retrabalho', JSON.stringify(retrabalhosAtualizados))
      }

      console.log('🗑️ Qualidade excluída:', {
        id: qualidadeParaExcluir,
        tipo: qualidadeExcluida.tipo,
        quantidade: qualidadeExcluida.quantidade
      })

      // Recalcular OEE se houver apontamento de produção ativo
      if (apontamentoProducaoId && linhaId) {
        const novoOEE = calcularOEECompleto(apontamentoProducaoId, linhaId, TEMPO_DISPONIVEL_PADRAO)
        setOeeCalculado(novoOEE)
        setTotalPerdasQualidade(calcularTotalPerdasDoApontamento())

        console.log('✅ OEE recalculado após exclusão de qualidade:', {
          qualidadeExcluida: qualidadeExcluida.id,
          tipo: qualidadeExcluida.tipo,
          oee: `${novoOEE.oee.toFixed(2)}%`,
          qualidade: `${novoOEE.qualidade.toFixed(2)}%`
        })
      }

      toast({
        title: '✅ Qualidade Excluída',
        description: 'Registro removido com sucesso e OEE recalculado'
      })

      cancelarExclusaoQualidade()
    } catch (error) {
      console.error('❌ Erro ao excluir qualidade:', error)
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o registro. Tente novamente.',
        variant: 'destructive'
      })
      cancelarExclusaoQualidade()
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
    setCodigoParadaBusca(parada.apontamento || '')

    toast({
      title: 'Parada selecionada',
      description: `${parada.apontamento} - ${parada.descricao?.substring(0, 50)}...`,
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
    setTurno(turnoSelecionado.turno as Turno)  // Sincroniza o estado turno para o DTO de salvamento
    setTurnoHoraInicial(turnoSelecionado.horaInicio)
    setTurnoHoraFinal(turnoSelecionado.horaFim)

    // Gerar linhas de apontamento automaticamente
    // IMPORTANTE: Só gera se o turno ainda não foi iniciado (evita sobrescrever dados do histórico)
    if (statusTurno === 'NAO_INICIADO') {
      gerarLinhasApontamento(turnoSelecionado.horaInicio, turnoSelecionado.horaFim, intervaloApontamento)
    }

    toast({
      title: 'Turno selecionado',
      description: `${turnoSelecionado.codigo} - ${turnoSelecionado.turno} (${turnoSelecionado.horaInicio} - ${turnoSelecionado.horaFim})`,
      variant: 'default'
    })
  }

  /**
   * Abre o modal de busca de SKU
   */
  const abrirModalBuscaSKU = () => {
    setModalBuscaSKUAberto(true)
  }

  /**
   * Callback quando um SKU é selecionado no modal
   */
  const handleSelecionarSKUModal = (skuSelecionado: SKUSelecionado) => {
    // Preenche o campo SKU com código + descrição
    setSkuCodigo(`${skuSelecionado.codigo} - ${skuSelecionado.descricao}`)

    toast({
      title: 'Produto selecionado',
      description: `${skuSelecionado.codigo} - ${skuSelecionado.descricao}`,
      variant: 'default'
    })
  }

  /**
   * Abre o modal de busca de Linha de Produção
   */
  const abrirModalBuscaLinha = () => {
    setModalBuscaLinhaAberto(true)
  }

  /**
   * Callback quando uma Linha de Produção é selecionada no modal
   */
  const handleSelecionarLinhaModal = (linha: LinhaProducaoSelecionada) => {
    // Armazena o ID da linha (usado internamente)
    setLinhaId(linha.linhaproducao_id.toString())
    // Armazena o nome da linha para exibição no campo (formato: código - nome)
    setLinhaNome(`${linha.linhaproducao_id} - ${linha.linhaproducao}`)
    // Armazena o objeto completo para referência
    setLinhaProducaoSelecionada(linha)

    toast({
      title: 'Linha de Produção selecionada',
      description: `${linha.linhaproducao_id} - ${linha.linhaproducao}${linha.departamento ? ` (${linha.departamento})` : ''}`,
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
   * Filtra por Data + Turno + Linha + SKU (ALCOA+)
   */
  const calcularHorasRestantes = useCallback((): number => {
    const tempoDisponivel = calcularTempoDisponivelTurno()
    const historico = carregarHistorico()

    // Filtrar apontamentos do turno atual por Data + Turno + Linha + SKU
    const apontamentosTurnoAtual = historico.filter(
      h => h.data === format(data!, 'dd/MM/yyyy') &&
           h.turno === turno &&
           h.linhaId === linhaId &&
           h.skuCodigo === skuCodigo // Filtro adicional por SKU
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
  }, [calcularTempoDisponivelTurno, carregarHistorico, data, linhaId, turno, skuCodigo])

  // ==================== Carregar histórico ao montar o componente ====================
  useEffect(() => {
    const historico = carregarHistorico()
    setHistoricoProducao(historico)

    const historicoParadas = carregarHistoricoParadas()
    setHistoricoParadas(historicoParadas)

    // Carregar configurações
    carregarConfiguracoes()
  }, [carregarHistorico, carregarHistoricoParadas, carregarConfiguracoes])

  // ==================== Regenerar linhas de apontamento quando turno ou intervalo mudar ====================
  // IMPORTANTE: Só regenera se o turno NÃO estiver iniciado (evita sobrescrever dados durante o turno)
  // NOTA: NÃO incluir linhasApontamento nas dependências para evitar loop infinito
  useEffect(() => {
    if (turnoHoraInicial && turnoHoraFinal && intervaloApontamento > 0 && statusTurno === 'NAO_INICIADO') {
      gerarLinhasApontamento(turnoHoraInicial, turnoHoraFinal, intervaloApontamento)
      console.log('✅ Linhas de apontamento geradas automaticamente (useEffect)')
    }
  }, [turnoHoraInicial, turnoHoraFinal, intervaloApontamento, gerarLinhasApontamento, statusTurno])

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
      skuCodigo.trim()
    )
  }

  // ==================== Funções de Controle de Turno ====================

  /**
   * Pré-carrega dados de produção do histórico de OPs do TOTVS
   * Busca OPs ativas para a linha de produção selecionada
   * Preenche automaticamente o campo SKU se houver apenas uma OP
   */
  const preCarregarDadosProducao = useCallback(() => {
    try {
      // Buscar todas as OPs disponíveis do TOTVS
      const todasOPs = obterTodasOPs()

      // Filtrar OPs relevantes
      // Critério 1: OPs recentes (últimos 30 dias)
      // Critério 2: Quantidade > 0
      // Critério 3: Mesmo SKU se já estiver preenchido
      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() - 30)

      let opsRelevantes = todasOPs.filter(op => {
        // Converter data de emissão (DD/MM/YYYY) para Date
        const [dia, mes, ano] = op.C2_EMISSAO.split('/')
        const dataEmissao = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia))

        // Filtrar por data e quantidade
        const dentroDataLimite = dataEmissao >= dataLimite
        const temQuantidade = op.C2_QUANT > 0

        // Se SKU já estiver preenchido, filtrar apenas OPs do mesmo SKU
        const mesmoSKU = !skuCodigo || op.C2_PRODUTO === skuCodigo

        return dentroDataLimite && temQuantidade && mesmoSKU
      })

      // Ordenar por data de emissão (mais recentes primeiro)
      opsRelevantes.sort((a, b) => {
        const [diaA, mesA, anoA] = a.C2_EMISSAO.split('/')
        const [diaB, mesB, anoB] = b.C2_EMISSAO.split('/')
        const dataA = new Date(parseInt(anoA), parseInt(mesA) - 1, parseInt(diaA))
        const dataB = new Date(parseInt(anoB), parseInt(mesB) - 1, parseInt(diaB))
        return dataB.getTime() - dataA.getTime()
      })

      // Limitar a 5 OPs mais recentes
      opsRelevantes = opsRelevantes.slice(0, 5)

      if (opsRelevantes.length === 0) {
        console.log('ℹ️ Nenhuma OP relevante encontrada para pré-carregamento')
        return { linhas: [], opUnica: null }
      }

      // Se houver apenas UMA OP, pré-preencher os campos do cabeçalho
      let opUnica = null
      if (opsRelevantes.length === 1) {
        opUnica = opsRelevantes[0]
        console.log('✅ OP única encontrada, pré-preenchendo campos:', {
          numero: opUnica.C2_NUM,
          produto: opUnica.C2_PRODUTO
        })
      }

      // Converter OPs para linhas de apontamento
      const linhasPreCarregadas: LinhaApontamentoProducao[] = opsRelevantes.map((_op, index) => ({
        id: `pre-${Date.now()}-${index}`,
        horaInicio: '',
        horaFim: '',
        quantidadeProduzida: '',
        editavel: true
      }))

      console.log(`✅ Pré-carregadas ${linhasPreCarregadas.length} linhas de produção`, {
        ops: opsRelevantes.map(op => ({
          numero: op.C2_NUM,
          produto: op.C2_PRODUTO,
          descricao: op.B1_DESC,
          quantidade: op.C2_QUANT
        }))
      })

      return { linhas: linhasPreCarregadas, opUnica }
    } catch (error) {
      console.error('❌ Erro ao pré-carregar dados de produção:', error)
      return { linhas: [], opUnica: null }
    }
  }, [skuCodigo])

  /**
   * Inicia o turno após validação dos campos obrigatórios
   * Bloqueia edição dos campos do cabeçalho
   * Inicializa cálculos de OEE com valores zerados
   * Aplica filtragem por Linha de Produção e SKU (ALCOA+)
   * PRÉ-CARREGA dados de produção de OPs ativas
   */
  const handleIniciarTurno = () => {
    // Validação 1: Campos obrigatórios do cabeçalho
    if (!validarCamposCabecalho()) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Preencha todos os campos do cabeçalho antes de iniciar o turno',
        variant: 'destructive'
      })
      return
    }

    // Validação 2: Linha de Produção selecionada
    if (!linhaId || linhaId.trim() === '') {
      toast({
        title: 'Linha de Produção Obrigatória',
        description: 'Selecione uma Linha de Produção antes de iniciar o turno',
        variant: 'destructive'
      })
      return
    }

    // Validação 3: SKU selecionado
    if (!skuCodigo || skuCodigo.trim() === '') {
      toast({
        title: 'SKU Obrigatório',
        description: 'Informe o código SKU do produto antes de iniciar o turno',
        variant: 'destructive'
      })
      return
    }

    const dataSelecionada = data ? format(data, 'dd/MM/yyyy') : ''
    const historico = carregarHistorico()
    const historicoParadasSalvo = carregarHistoricoParadas()

    // Filtra dados do turno atual para manter contemporaneidade (ALCOA+)
    // IMPORTANTE: Aplica filtros de Data + Turno + Linha + SKU simultaneamente
    const producoesDoTurno = historico.filter(
      (registro) =>
        registro.data === dataSelecionada &&
        registro.turno === turno &&
        registro.linhaId === linhaId &&
        registro.skuCodigo === skuCodigo // Filtro adicional por SKU
    )

    // Paradas são filtradas apenas por Data + Turno + Linha
    // (paradas não são específicas de SKU, mas sim da linha)
    const paradasDoTurno = historicoParadasSalvo.filter(
      (registro) =>
        registro.data === dataSelecionada &&
        registro.turno === turno &&
        registro.linhaId === linhaId
    )

    const temDadosSalvos = producoesDoTurno.length > 0 || paradasDoTurno.length > 0

    // Log dos filtros aplicados para auditoria (ALCOA+)
    console.log('🔍 Filtros aplicados ao iniciar turno:', {
      data: dataSelecionada,
      turno,
      linhaId,
      linhaNome: linhaSelecionada?.nome || 'Não encontrada',
      skuCodigo,
      producoesEncontradas: producoesDoTurno.length,
      paradasEncontradas: paradasDoTurno.length
    })

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
            setTotalPerdasQualidade(calcularTotalPerdasDoApontamento())
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

      // Carregar histórico de qualidade do turno
      const qualidadeDoTurno = carregarHistoricoQualidade().filter(
        (registro) =>
          data && registro.data === format(data, 'dd/MM/yyyy') &&
          registro.turno === turno &&
          registro.linhaId === linhaId
      )
      setHistoricoQualidade(qualidadeDoTurno)

      // GERAR TODAS AS LINHAS DO TURNO (do início ao fim) e preencher com dados do histórico
      let todasAsLinhas: LinhaApontamentoProducao[] = []

      if (turnoHoraInicial && turnoHoraFinal && intervaloApontamento > 0) {
        // Criar um mapa de registros do histórico por hora de início para busca rápida
        const mapaHistorico = new Map<string, RegistroProducao>()
        producoesDoTurno.forEach(registro => {
          mapaHistorico.set(registro.horaInicio, registro)
        })

        // Calcular minutos de início e fim do turno
        const [turnoInicioH, turnoInicioM] = turnoHoraInicial.split(':').map(Number)
        const [turnoFimH, turnoFimM] = turnoHoraFinal.split(':').map(Number)

        let minutoAtual = turnoInicioH * 60 + turnoInicioM
        let minutoFimTurno = turnoFimH * 60 + turnoFimM

        // Se hora final do turno for menor que hora inicial, significa que passa da meia-noite
        if (minutoFimTurno < minutoAtual) {
          minutoFimTurno += 24 * 60
        }

        const intervaloMinutos = intervaloApontamento * 60

        // Função auxiliar para formatar minutos em HH:MM
        const formatarHora = (minutos: number): string => {
          const horas = Math.floor(minutos / 60) % 24
          const mins = minutos % 60
          return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
        }

        // Gerar todas as linhas do turno
        while (minutoAtual < minutoFimTurno) {
          const proximoMinuto = Math.min(minutoAtual + intervaloMinutos, minutoFimTurno)
          const horaInicio = formatarHora(minutoAtual)
          const horaFim = formatarHora(proximoMinuto)

          // Verificar se existe registro do histórico para este horário
          const registroHistorico = mapaHistorico.get(horaInicio)

          if (registroHistorico) {
            // Linha do histórico (pré-preenchida e bloqueada)
            todasAsLinhas.push({
              id: registroHistorico.id,
              horaInicio: registroHistorico.horaInicio,
              horaFim: registroHistorico.horaFim,
              quantidadeProduzida: registroHistorico.quantidadeProduzida.toString(),
              apontamentoId: registroHistorico.id,
              editavel: false // Bloqueado
            })
          } else {
            // Linha vazia (editável)
            todasAsLinhas.push({
              id: `linha-${Date.now()}-${minutoAtual}`,
              horaInicio,
              horaFim,
              quantidadeProduzida: '',
              editavel: true // Editável
            })
          }

          minutoAtual = proximoMinuto
        }

        const linhasHistorico = todasAsLinhas.filter(l => l.apontamentoId).length
        const linhasVazias = todasAsLinhas.filter(l => !l.apontamentoId).length

        console.log(`✅ Tabela de produção montada em ordem cronológica: ${linhasHistorico} do histórico + ${linhasVazias} vazias = ${todasAsLinhas.length} total`)
      } else {
        // Fallback: Se não houver configuração de turno, apenas converter histórico
        todasAsLinhas = producoesDoTurno.map((registro) => ({
          id: registro.id,
          horaInicio: registro.horaInicio,
          horaFim: registro.horaFim,
          quantidadeProduzida: registro.quantidadeProduzida.toString(),
          apontamentoId: registro.id,
          editavel: false
        }))
      }

      // Pré-preencher a tabela "Registro de Produção" com todas as linhas ordenadas
      setLinhasApontamento(todasAsLinhas)

      console.log(`✅ Tabela de produção pré-preenchida com ${todasAsLinhas.length} linhas`, {
        linhas: todasAsLinhas.map(l => ({
          horaInicio: l.horaInicio,
          horaFim: l.horaFim,
          quantidade: l.quantidadeProduzida || '(vazio)',
          salvo: !!l.apontamentoId
        }))
      })

      // Atualiza métricas derivadas
      const totalHorasParadasCalculado =
        paradasDoTurno.reduce((total, parada) => total + parada.duracao, 0) / 60
      setTotalHorasParadas(totalHorasParadasCalculado)
      setHorasRestantes(calcularHorasRestantes())

      setStatusTurno('INICIADO')

      const linhaNome = linhaSelecionada?.nome || 'Linha não identificada'
      toast({
        title: 'Turno Iniciado',
        description: `Dados carregados para ${linhaNome} - SKU ${skuCodigo}: ${producoesDoTurno.length} produções e ${paradasDoTurno.length} paradas`,
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
    setHistoricoQualidade([])

    // PRÉ-CARREGAR linhas de produção com dados de OPs ativas
    const { linhas: linhasPreCarregadas, opUnica } = preCarregarDadosProducao()

    // Se houver apenas UMA OP, pré-preencher os campos do cabeçalho
    if (opUnica) {
      // Só preencher SKU se ainda não estiver preenchido
      if (!skuCodigo) {
        setSkuCodigo(opUnica.C2_PRODUTO)
      }

      console.log('✅ Campos do cabeçalho pré-preenchidos com OP única:', {
        sku: opUnica.C2_PRODUTO
      })
    }

    // GERAR LINHAS DE APONTAMENTO VAZIAS baseadas no intervalo configurado
    // Isso garante que sempre haverá linhas para o usuário preencher
    if (turnoHoraInicial && turnoHoraFinal && intervaloApontamento > 0) {
      gerarLinhasApontamento(turnoHoraInicial, turnoHoraFinal, intervaloApontamento)
      console.log(`✅ Linhas de apontamento geradas automaticamente (${turnoHoraInicial} - ${turnoHoraFinal}, intervalo: ${intervaloApontamento}h)`)
    }

    setStatusTurno('INICIADO')

    const linhaNome = linhaSelecionada?.nome || 'Linha não identificada'
    let mensagemPreCarregamento = ' Linhas de apontamento geradas. Pronto para registrar produção.'

    if (opUnica) {
      mensagemPreCarregamento = ` OP ${opUnica.C2_NUM} pré-carregada automaticamente.`
    } else if (linhasPreCarregadas.length > 0) {
      mensagemPreCarregamento = ` ${linhasPreCarregadas.length} OPs disponíveis para seleção.`
    }

    toast({
      title: 'Turno Iniciado',
      description: `Novo turno iniciado para ${linhaNome} - SKU ${skuCodigo || 'a definir'}.${mensagemPreCarregamento}`,
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
      linhaNome,
      linhaProducaoSelecionada,
      skuCodigo
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
      setLinhaNome(cabecalhoOriginal.linhaNome)
      setLinhaProducaoSelecionada(cabecalhoOriginal.linhaProducaoSelecionada)
      setSkuCodigo(cabecalhoOriginal.skuCodigo)
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
        skuCodigo
      }))

      setHistoricoProducao(historicoAtualizado)
      salvarNoLocalStorage(historicoAtualizado)

      // Propaga atualização para o storage principal (cálculo de OEE)
      historicoAtualizado.forEach((registro) => {
        atualizarApontamentoProducao(registro.id, {
          turno,
          linha: linhaAtualizada?.nome || registro.linhaNome,
          setor: linhaAtualizada?.setor,
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
          lote_id: null,
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
        setTotalPerdasQualidade(calcularTotalPerdasDoApontamento())
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

  /**
   * Adiciona registro de qualidade (perdas e/ou retrabalho)
   */
  const handleAdicionarQualidade = () => {
    // =================================================================
    // VALIDAÇÃO 1: Verificar se existe apontamento de produção ativo
    // =================================================================
    if (!apontamentoProducaoId) {
      toast({
        title: 'Erro de Validação',
        description: 'É necessário ter um apontamento de produção ativo para registrar qualidade',
        variant: 'destructive'
      })
      return
    }

    // =================================================================
    // VALIDAÇÃO 2: Verificar se pelo menos um campo está preenchido
    // =================================================================
    const temPerdas = quantidadePerdas && Number(quantidadePerdas) > 0
    const temRetrabalho = quantidadeRetrabalho && Number(quantidadeRetrabalho) > 0

    if (!temPerdas && !temRetrabalho) {
      toast({
        title: 'Erro de Validação',
        description: 'Informe a quantidade de perdas e/ou retrabalho',
        variant: 'destructive'
      })
      return
    }

    // =================================================================
    // VALIDAÇÃO 3: Verificar se os motivos estão preenchidos
    // =================================================================
    if (temPerdas && !motivoPerdas.trim()) {
      toast({
        title: 'Erro de Validação',
        description: 'Informe o motivo das perdas',
        variant: 'destructive'
      })
      return
    }

    if (temRetrabalho && !motivoRetrabalho.trim()) {
      toast({
        title: 'Erro de Validação',
        description: 'Informe o motivo do retrabalho',
        variant: 'destructive'
      })
      return
    }

    // =================================================================
    // SALVAMENTO: Salvar perdas e/ou retrabalho
    // =================================================================
    try {
      const novosRegistros: RegistroQualidade[] = []

      // Salvar perdas se informado
      if (temPerdas) {
        const apontamentoPerdas = salvarApontamentoPerdas(
          apontamentoProducaoId,
          Number(quantidadePerdas),
          motivoPerdas,
          null, // observacao
          1, // TODO: buscar do contexto de autenticação
          'Operador' // TODO: buscar do contexto de autenticação
        )

        const registroPerdas: RegistroQualidade = {
          id: apontamentoPerdas.id,
          data: format(data!, 'dd/MM/yyyy'),
          turno,
          linhaId: linhaId!,
          linhaNome: linhaSelecionada?.nome || 'Linha não identificada',
          apontamentoProducaoId,
          tipo: 'PERDAS',
          quantidade: Number(quantidadePerdas),
          motivo: motivoPerdas,
          dataHoraRegistro: format(new Date(), 'dd/MM/yyyy HH:mm:ss')
        }

        novosRegistros.push(registroPerdas)
      }

      // Salvar retrabalho se informado
      if (temRetrabalho) {
        const apontamentoRetrabalho = salvarApontamentoRetrabalho(
          apontamentoProducaoId,
          Number(quantidadeRetrabalho),
          0, // tempoRetrabalho - TODO: adicionar campo no formulário
          motivoRetrabalho,
          null, // observacao
          1, // TODO: buscar do contexto de autenticação
          'Operador' // TODO: buscar do contexto de autenticação
        )

        const registroRetrabalho: RegistroQualidade = {
          id: apontamentoRetrabalho.id,
          data: format(data!, 'dd/MM/yyyy'),
          turno,
          linhaId: linhaId!,
          linhaNome: linhaSelecionada?.nome || 'Linha não identificada',
          apontamentoProducaoId,
          tipo: 'RETRABALHO',
          quantidade: Number(quantidadeRetrabalho),
          motivo: motivoRetrabalho,
          dataHoraRegistro: format(new Date(), 'dd/MM/yyyy HH:mm:ss')
        }

        novosRegistros.push(registroRetrabalho)
      }

      // =================================================================
      // ATUALIZAR HISTÓRICO E LOCALSTORAGE
      // =================================================================
      const novoHistorico = [...novosRegistros, ...historicoQualidade]
      setHistoricoQualidade(novoHistorico)
      salvarQualidadeNoLocalStorage(novoHistorico)

      // =================================================================
      // RECALCULAR OEE
      // =================================================================
      if (linhaId) {
        const novoOEE = calcularOEECompleto(apontamentoProducaoId, linhaId, TEMPO_DISPONIVEL_PADRAO)
        setOeeCalculado(novoOEE)
        setTotalPerdasQualidade(calcularTotalPerdasDoApontamento())
      }

      // =================================================================
      // LIMPAR FORMULÁRIO
      // =================================================================
      setQuantidadePerdas('')
      setMotivoPerdas('')
      setQuantidadeRetrabalho('')
      setMotivoRetrabalho('')

      // =================================================================
      // FEEDBACK PARA O USUÁRIO
      // =================================================================
      const mensagens: string[] = []
      if (temPerdas) mensagens.push(`${Number(quantidadePerdas).toLocaleString('pt-BR')} unidades de perdas`)
      if (temRetrabalho) mensagens.push(`${Number(quantidadeRetrabalho).toLocaleString('pt-BR')} unidades de retrabalho`)

      toast({
        title: '✅ Qualidade Registrada',
        description: `Registrado: ${mensagens.join(' e ')}. OEE atualizado.`
      })

    } catch (error) {
      console.error('❌ Erro ao salvar apontamento de qualidade:', error)
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o apontamento de qualidade. Tente novamente.',
        variant: 'destructive'
      })
    }
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
      natureza: paradaSelecionada.natureza || '',
      classe: paradaSelecionada.classe || '',
      grandeParada: paradaSelecionada.grandeParada || '',
      apontamento: paradaSelecionada.apontamento || '',
      descricao: paradaSelecionada.descricao || '',
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
      lote_id: null,
      codigo_parada_id: paradaSelecionada.apontamento || 'CODIGO_TEMP',
      turno_id: turno,
      data_parada: format(data!, 'yyyy-MM-dd'),
      hora_inicio: horaInicioFormatada,
      hora_fim: horaFimFormatada,
      duracao_minutos: duracaoMinutos,
      observacao: `${paradaSelecionada.natureza || ''} - ${paradaSelecionada.classe || ''} - ${paradaSelecionada.grandeParada || ''} - ${observacoesParada || ''}`.trim(),
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
      tipoParada: paradaSelecionada.apontamento || paradaSelecionada.descricao || 'Parada',
      codigoParada: paradaSelecionada.apontamento || 'CODIGO_TEMP',
      descricaoParada: paradaSelecionada.descricao || '',
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
                    <DropdownMenuItem onClick={() => setModalConfiguracoesAberto(true)}>
                      <Settings className="mr-2 h-4 w-4" />
                      Configurações
                    </DropdownMenuItem>
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
              {/* Primeira linha: Data, Turno, Hora Inicial, Hora Final */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-2">
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

                {/* Turno - Código e Nome com Botão de Busca */}
                <div>
                  <span className="block text-sm font-medium text-muted-foreground mb-1.5">Turno</span>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={turnoCodigo && turnoNome ? `${turnoCodigo} - ${turnoNome}` : ''}
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

              {/* Segunda linha: Linha de Produção e Produto SKU */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-2">
                <div className="md:col-span-6">
                  <span className="block text-sm font-medium text-muted-foreground mb-1.5">Linha de Produção</span>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={linhaNome}
                      readOnly
                      disabled={cabecalhoBloqueado}
                      placeholder="Selecione uma linha de produção"
                      className="flex-1 bg-muted/50 cursor-not-allowed"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={abrirModalBuscaLinha}
                      disabled={cabecalhoBloqueado}
                      title="Buscar linha de produção"
                      className="flex-none"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="md:col-span-6">
                  <span className="block text-sm font-medium text-muted-foreground mb-1.5">Produto SKU</span>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={skuCodigo}
                      readOnly
                      disabled={cabecalhoBloqueado}
                      placeholder="Selecione um produto SKU"
                      className="flex-1 bg-muted/50 cursor-not-allowed"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={abrirModalBuscaSKU}
                      disabled={cabecalhoBloqueado}
                      title="Buscar produto SKU"
                      className="flex-none"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Botão de Controle de Turno e edição de cabeçalho */}
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

                {/* Botão Lotes - disponível quando o turno está iniciado */}
                {statusTurno === 'INICIADO' && !editandoCabecalho && (
                  <Button
                    variant="outline"
                    onClick={() => setModalLotesAberto(true)}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Lotes
                  </Button>
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

          {/* Dialog de Confirmação de Exclusão de Qualidade */}
          <AlertDialog open={showConfirmExclusaoQualidade} onOpenChange={setShowConfirmExclusaoQualidade}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão de Qualidade</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir este registro de qualidade? Esta ação não pode ser desfeita e o OEE será recalculado.
                  {qualidadeParaExcluir && (
                    <span className="block mt-2 font-medium text-text-primary-light dark:text-text-primary-dark">
                      Registro: {historicoQualidade.find(r => r.id === qualidadeParaExcluir)?.dataHoraRegistro} - {historicoQualidade.find(r => r.id === qualidadeParaExcluir)?.tipo}
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={cancelarExclusaoQualidade}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleExcluirQualidade}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Confirmar Exclusão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Mensagem quando turno não foi iniciado */}
          {statusTurno === 'NAO_INICIADO' ? (
            <div className="bg-white dark:bg-white p-12 rounded-lg shadow-md border border-border-light dark:border-border-dark">
              <div className="flex flex-col items-center justify-center text-center space-y-6">
                {/* Ilustração SVG */}
                <svg
                  className="w-32 h-32 text-muted-foreground/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>

                {/* Mensagem principal */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">
                    Turno não iniciado
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Para começar a registrar apontamentos de produção, qualidade e paradas, é necessário iniciar um turno.
                  </p>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Preencha os campos do cabeçalho acima e clique em <span className="font-semibold text-green-600">"Iniciar Turno"</span> para começar.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
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

                {linhasApontamento.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="mb-2">Nenhuma linha de apontamento gerada.</p>
                    <p className="text-sm">Selecione um turno para gerar automaticamente as linhas de apontamento com base no intervalo configurado.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Tabela de linhas de apontamento */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-xs text-muted-foreground uppercase bg-background-light dark:bg-background-dark">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium">Hora Início</th>
                            <th className="px-4 py-3 text-left font-medium">Hora Fim</th>
                            <th className="px-4 py-3 text-left font-medium">Quantidade Produzida</th>
                            <th className="px-4 py-3 text-center font-medium">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {linhasApontamento.map((linha, index) => (
                            <tr
                              key={linha.id}
                              className={`border-b border-border-light dark:border-border-dark ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              }`}
                            >
                              <td className="px-4 py-3">
                                <Input
                                  type="time"
                                  value={linha.horaInicio}
                                  readOnly
                                  disabled={linha.editavel === false}
                                  className={`w-32 ${linha.editavel === false ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <Input
                                  type="time"
                                  value={linha.horaFim}
                                  readOnly
                                  disabled={linha.editavel === false}
                                  className={`w-32 ${linha.editavel === false ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <Input
                                  type="number"
                                  placeholder="ex: 10000"
                                  value={linha.quantidadeProduzida}
                                  onChange={(e) => atualizarQuantidadeLinha(linha.id, e.target.value)}
                                  className={`w-48 ${linha.editavel === false ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                  disabled={statusTurno !== 'INICIADO' || linha.editavel === false}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  {!linha.editavel && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditarLinha(linha.id)}
                                      className="h-8 px-3 text-primary hover:text-primary/90 hover:bg-primary/10"
                                      title="Alterar linha"
                                      disabled={
                                        statusTurno !== 'INICIADO' ||
                                        !linha.apontamentoId ||
                                        !linha.quantidadeProduzida ||
                                        Number(linha.quantidadeProduzida) <= 0
                                      }
                                    >
                                      <Pencil className="h-4 w-4 mr-1" />
                                      Alterar
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSalvarLinha(linha)}
                                    className="h-8 px-3 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    title="Salvar linha"
                                    disabled={
                                      statusTurno !== 'INICIADO' ||
                                      !linha.quantidadeProduzida ||
                                      Number(linha.quantidadeProduzida) <= 0 ||
                                      Boolean(linha.apontamentoId && !linha.editavel)
                                    }
                                  >
                                    <Save className="h-4 w-4 mr-1" />
                                    Salvar
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleExcluirLinha(linha)}
                                    className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Excluir linha"
                                    disabled={
                                      statusTurno !== 'INICIADO' ||
                                      !linha.apontamentoId ||
                                      !linha.quantidadeProduzida ||
                                      Number(linha.quantidadeProduzida) <= 0
                                    }
                                  >
                                    <Trash className="h-4 w-4 mr-1" />
                                    Excluir
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
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
                        className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-48"
                        id="loss-quantity"
                        type="number"
                        placeholder="ex: 500"
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
                        className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-48"
                        id="rework-quantity"
                        type="number"
                        placeholder="ex: 200"
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
                  disabled={statusTurno !== 'INICIADO'}
                >
                  <CheckCircle className="h-5 w-5" />
                  Adicionar Registro de Qualidade
                </button>
              </div>

              {/* Histórico de Registros de Qualidade */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
                  Histórico de Registros de Qualidade
                </h3>
                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                  <table className="w-full text-sm text-left text-text-primary-light dark:text-text-primary-dark">
                    <thead className="text-xs text-muted-foreground uppercase bg-background-light dark:bg-background-dark sticky top-0">
                      <tr>
                        <th className="px-1 py-2 font-medium w-10" scope="col">Ações</th>
                        <th className="px-1 py-2 font-medium" scope="col">Data/Hora</th>
                        <th className="px-1 py-2 font-medium" scope="col">Tipo</th>
                        <th className="px-1 py-2 font-medium text-right" scope="col">Quantidade</th>
                        <th className="px-1 py-2 font-medium" scope="col">Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicoQualidade.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-1 py-4 text-center text-muted-foreground">
                            Nenhum registro de qualidade encontrado
                          </td>
                        </tr>
                      ) : (
                        historicoQualidade.map((registro) => (
                          <tr
                            key={registro.id}
                            className={`bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark`}
                          >
                            <td className="px-1 py-2 whitespace-nowrap">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => confirmarExclusaoQualidade(registro.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                title="Excluir registro"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </td>
                            <td className="px-1 py-2 whitespace-nowrap">{registro.dataHoraRegistro}</td>
                            <td className="px-1 py-2 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                registro.tipo === 'PERDAS'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {registro.tipo}
                              </span>
                            </td>
                            <td className="px-1 py-2 text-right whitespace-nowrap">
                              {formatarQuantidade(registro.quantidade)}
                            </td>
                            <td className="px-1 py-2 truncate max-w-xs" title={registro.motivo}>
                              {registro.motivo}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
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
                        <p><span className="font-medium">Natureza:</span> {paradaSelecionada.natureza || 'N/A'}</p>
                        <p><span className="font-medium">Classe:</span> {paradaSelecionada.classe || 'N/A'}</p>
                        <p><span className="font-medium">Grande Parada:</span> {paradaSelecionada.grandeParada || 'N/A'}</p>
                        <p><span className="font-medium">Apontamento:</span> {paradaSelecionada.apontamento || 'N/A'}</p>
                        <p><span className="font-medium">Descrição:</span> {paradaSelecionada.descricao || 'N/A'}</p>
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
            </>
          )}
          </main>
        </div>

        {/* Sidebar Direita - OEE Real */}
        <div className="w-80 lg:w-96 xl:w-[28rem] flex-shrink-0 pl-2 pr-4 py-4 bg-background-light dark:bg-background-dark">

          {/* Cards de Métricas - Grid 2x2 (FORA do aside) */}
          <div className="grid grid-cols-2 gap-3 mb-4 w-full">
            {/* Card 1 - Meta */}
            <div className="bg-white dark:bg-white border border-border-light dark:border-border-dark rounded-lg p-3 text-center shadow-sm">
              <span className="text-xs text-muted-foreground block mb-1">Meta</span>
              <span className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">65%</span>
            </div>

            {/* Card 2 - Horas Restantes */}
            <div className="bg-white dark:bg-white border border-border-light dark:border-border-dark rounded-lg p-3 text-center shadow-sm">
              <span className="text-xs text-muted-foreground block mb-1">Horas Restantes</span>
              <span className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">{formatarHoras(horasRestantes)}</span>
            </div>

            {/* Card 3 - Total Horas Paradas */}
            <div className="bg-white dark:bg-white border border-border-light dark:border-border-dark rounded-lg p-3 text-center shadow-sm">
              <span className="text-xs text-muted-foreground block mb-1">Horas Paradas</span>
              <span className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">{formatarHoras(totalHorasParadas)}</span>
            </div>

            {/* Card 4 - Perdas de Qualidade */}
            <div className="bg-white dark:bg-white border border-border-light dark:border-border-dark rounded-lg p-3 text-center shadow-sm">
              <span className="text-xs text-muted-foreground block mb-1">Perdas Qualidade</span>
              <span className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">{totalPerdasQualidade.toLocaleString('pt-BR')} un</span>
            </div>
          </div>

          {/* Aside do OEE Real - Velocímetro e Barras */}
          <aside className="w-full bg-white dark:bg-white p-6 border border-border-light dark:border-border-dark flex flex-col items-center rounded-lg shadow-sm">
            <div className="sticky top-6 w-full">
              <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark mb-6 text-center">
                OEE Real
              </h2>

              <div className="flex flex-col items-center gap-8 mb-8">
                {/* Velocímetro SVG */}
                <div
                  className="relative flex-shrink-0 cursor-pointer group"
                  onClick={() => setModalExplicacaoOEEAberto(true)}
                  title="Clique para ver explicação do velocímetro de OEE"
                >
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
                    {/* Círculo de progresso com cor dinâmica */}
                    <circle
                      cx="60"
                      cy="60"
                      fill="none"
                      r="54"
                      strokeDasharray="339.292"
                      strokeDashoffset={339.292 - (339.292 * oeeCalculado.oee) / 100}
                      strokeLinecap="round"
                      strokeWidth="12"
                      stroke={getColorByPercentage(oeeCalculado.oee)}
                      style={{ transition: 'stroke 0.3s ease-in-out' }}
                    />
                    {/* Destaque visual do gap até a meta (65%) - exibido apenas quando OEE < 65% */}
                    {oeeCalculado.oee < 65 && (
                      <circle
                        cx="60"
                        cy="60"
                        fill="none"
                        r="54"
                        strokeDasharray="339.292"
                        strokeDashoffset={339.292 - (339.292 * 65) / 100}
                        strokeLinecap="round"
                        strokeWidth="12"
                        stroke="#EAB308"
                        opacity="0.25"
                        style={{ transition: 'opacity 0.3s ease-in-out' }}
                      />
                    )}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="font-bold text-text-primary-light dark:text-text-primary-dark" style={{ fontSize: '37.8px' }}>
                      {formatarPercentual(oeeCalculado.oee)}%
                    </span>
                  </div>
                  {/* Ícone de informação - sempre visível para tablets */}
                  <div className="absolute top-2 right-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-6 h-6 text-blue-500 dark:text-blue-400"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <path d="M12 17h.01"></path>
                    </svg>
                  </div>
                </div>

                {/* Barras de Componentes com cores dinâmicas */}
                <div className="w-full space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="font-semibold text-base">{formatarPercentual(oeeCalculado.disponibilidade)}%</span>
                      <span className="text-muted-foreground">Disponibilidade</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                      <div
                        className="h-2 rounded-full transition-all duration-300 ease-in-out"
                        style={{
                          width: `${oeeCalculado.disponibilidade}%`,
                          backgroundColor: getColorByPercentage(oeeCalculado.disponibilidade)
                        }}
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
                        className="h-2 rounded-full transition-all duration-300 ease-in-out"
                        style={{
                          width: `${oeeCalculado.performance}%`,
                          backgroundColor: getColorByPercentage(oeeCalculado.performance)
                        }}
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
                        className="h-2 rounded-full transition-all duration-300 ease-in-out"
                        style={{
                          width: `${oeeCalculado.qualidade}%`,
                          backgroundColor: getColorByPercentage(oeeCalculado.qualidade)
                        }}
                      />
                    </div>
                  </div>
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

      {/* Modal de Configurações */}
      <Dialog open={modalConfiguracoesAberto} onOpenChange={setModalConfiguracoesAberto}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configurações de Apontamento</DialogTitle>
            <DialogDescription>
              Configure o intervalo obrigatório para apontamento de produção
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="intervalo-apontamento">
                Intervalo de apontamento de produção (horas)
              </Label>
              <Input
                id="intervalo-apontamento"
                type="number"
                min="1"
                max="24"
                value={intervaloApontamento}
                onChange={(e) => {
                  const valor = parseInt(e.target.value)
                  if (valor >= 1 && valor <= 24) {
                    setIntervaloApontamento(valor)
                  }
                }}
                placeholder="Ex: 1"
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Define a cada quantas horas o apontamento de produção deve ser realizado.
                Valor entre 1 e 24 horas (1 dia).
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalConfiguracoesAberto(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={salvarConfiguracoes}
              className="bg-brand-primary hover:bg-brand-primary/90"
            >
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Explicação do Velocímetro de OEE */}
      <Dialog open={modalExplicacaoOEEAberto} onOpenChange={setModalExplicacaoOEEAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Info className="w-6 h-6 text-blue-500" />
              Entendendo o Velocímetro de OEE
            </DialogTitle>
            <DialogDescription>
              Explicação dos elementos visuais do indicador de Overall Equipment Effectiveness
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Seção: OEE Atual */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getColorByPercentage(oeeCalculado.oee) }}
                />
                Círculo de Progresso (OEE Atual)
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                O círculo colorido representa o <strong>OEE atual calculado</strong> ({formatarPercentual(oeeCalculado.oee)}%).
                A cor muda dinamicamente conforme o desempenho da linha de produção, facilitando a identificação
                rápida do status operacional.
              </p>
            </div>

            {/* Seção: Meta de OEE */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500" />
                Meta de OEE (65%)
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A meta estabelecida para esta linha de produção é de <strong>65%</strong>. Este é o objetivo
                mínimo de eficiência que deve ser alcançado para garantir a produtividade esperada.
              </p>
            </div>

            {/* Seção: Gap até a Meta */}
            {oeeCalculado.oee < 65 && (
              <div className="space-y-2 bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 opacity-25" />
                  Destaque do Gap (Diferença até a Meta)
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  O círculo amarelo translúcido que você vê representa a <strong>distância entre o OEE atual
                  ({formatarPercentual(oeeCalculado.oee)}%) e a meta (65%)</strong>. Este destaque visual ajuda a
                  identificar rapidamente o quanto falta para atingir o objetivo estabelecido.
                </p>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                  Gap atual: {formatarPercentual(65 - oeeCalculado.oee)} pontos percentuais
                </p>
              </div>
            )}

            {oeeCalculado.oee >= 65 && (
              <div className="space-y-2 bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  Meta Atingida!
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Parabéns! O OEE atual ({formatarPercentual(oeeCalculado.oee)}%) está <strong>acima da meta de 65%</strong>.
                  O destaque do gap não é exibido quando a meta é atingida ou superada.
                </p>
              </div>
            )}

            {/* Seção: Escala de Cores */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Escala de Cores do Velocímetro</h3>
              <p className="text-sm text-muted-foreground">
                As cores do velocímetro indicam o nível de desempenho da linha:
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 rounded bg-gray-50 dark:bg-gray-800">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Vermelho (0-50%)</p>
                    <p className="text-xs text-muted-foreground">Desempenho crítico - requer ação imediata</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 rounded bg-gray-50 dark:bg-gray-800">
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Laranja (50-65%)</p>
                    <p className="text-xs text-muted-foreground">Desempenho abaixo da meta - necessita melhoria</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 rounded bg-gray-50 dark:bg-gray-800">
                  <div className="w-8 h-8 rounded-full bg-yellow-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Amarelo (65-75%)</p>
                    <p className="text-xs text-muted-foreground">Desempenho na meta - satisfatório</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 rounded bg-gray-50 dark:bg-gray-800">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Verde (75-100%)</p>
                    <p className="text-xs text-muted-foreground">Desempenho excelente - acima da meta</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção: Componentes do OEE */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="font-semibold text-lg">Componentes do OEE</h3>
              <p className="text-sm text-muted-foreground">
                O OEE é calculado multiplicando três componentes principais:
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[140px]">Disponibilidade:</span>
                  <span className="text-muted-foreground">
                    {formatarPercentual(oeeCalculado.disponibilidade)}% - Tempo que o equipamento esteve disponível para produção
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[140px]">Performance:</span>
                  <span className="text-muted-foreground">
                    {formatarPercentual(oeeCalculado.performance)}% - Velocidade de produção comparada à velocidade nominal
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[140px]">Qualidade:</span>
                  <span className="text-muted-foreground">
                    {formatarPercentual(oeeCalculado.qualidade)}% - Percentual de produtos sem defeitos ou retrabalho
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200 dark:border-blue-800 mt-3">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  OEE = Disponibilidade × Performance × Qualidade
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  {formatarPercentual(oeeCalculado.disponibilidade)}% × {formatarPercentual(oeeCalculado.performance)}% × {formatarPercentual(oeeCalculado.qualidade)}% = {formatarPercentual(oeeCalculado.oee)}%
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={() => setModalExplicacaoOEEAberto(false)}
              className="bg-brand-primary hover:bg-brand-primary/90"
            >
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Controle de Lotes */}
      <Dialog
        open={modalLotesAberto}
        onOpenChange={(open) => {
          setModalLotesAberto(open)
          if (!open) {
            resetarFormularioLote()
          }
        }}
      >
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Controle de Lotes
            </DialogTitle>
            <DialogDescription>
              Visualize e gerencie os lotes de produção do turno atual. Utilize o botão abaixo para adicionar novos lotes.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
            {/* Botão para adicionar novo lote */}
            <div className="flex justify-end">
              <Button
                onClick={handleNovoLote}
                className="bg-brand-primary hover:bg-brand-primary/90"
                disabled={formularioLoteAberto}
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Lote
              </Button>
            </div>

            {/* Formulário inline para adicionar/editar lote */}
            {formularioLoteAberto && (
              <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">
                    {loteEmEdicao ? 'Editar Lote' : 'Novo Lote'}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetarFormularioLote}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Campos do formulário em grid compacto */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Número do Lote */}
                  <div className="grid gap-1">
                    <Label htmlFor="numero-lote" className="text-xs flex items-center gap-1">
                      Nº Lote <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="numero-lote"
                      type="text"
                      value={dadosLote.numeroLote}
                      onChange={(e) => setDadosLote(prev => ({ ...prev, numeroLote: e.target.value }))}
                      placeholder="LT-001"
                      className="h-9"
                    />
                  </div>

                  {/* Data */}
                  <div className="grid gap-1">
                    <Label htmlFor="data-lote" className="text-xs flex items-center gap-1">
                      Data <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="data-lote"
                      type="date"
                      value={dadosLote.data}
                      onChange={(e) => setDadosLote(prev => ({ ...prev, data: e.target.value }))}
                      className="h-9"
                    />
                  </div>

                  {/* Hora Inicial */}
                  <div className="grid gap-1">
                    <Label htmlFor="hora-inicial-lote" className="text-xs flex items-center gap-1">
                      Hora Inicial <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="hora-inicial-lote"
                      type="time"
                      value={dadosLote.horaInicial}
                      onChange={(e) => setDadosLote(prev => ({ ...prev, horaInicial: e.target.value }))}
                      className="h-9"
                    />
                  </div>

                  {/* Hora Final (opcional) */}
                  <div className="grid gap-1">
                    <Label htmlFor="hora-final-lote" className="text-xs">
                      Hora Final
                    </Label>
                    <Input
                      id="hora-final-lote"
                      type="time"
                      value={dadosLote.horaFinal}
                      onChange={(e) => setDadosLote(prev => ({ ...prev, horaFinal: e.target.value }))}
                      className="h-9"
                    />
                  </div>

                  {/* Quantidade Produzida Inicial */}
                  <div className="grid gap-1">
                    <Label htmlFor="quantidade-produzida-inicial-lote" className="text-xs flex items-center gap-1">
                      Qtd/Ciclo Inicial <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="quantidade-produzida-inicial-lote"
                      type="number"
                      min="0"
                      value={dadosLote.quantidadeProduzidaInicial || ''}
                      onChange={(e) => setDadosLote(prev => ({
                        ...prev,
                        quantidadeProduzidaInicial: parseInt(e.target.value) || 0
                      }))}
                      placeholder="0"
                      className="h-9"
                    />
                  </div>

                  {/* Quantidade Produzida Final */}
                  <div className="grid gap-1">
                    <Label htmlFor="quantidade-produzida-final-lote" className="text-xs flex items-center gap-1">
                      Qtd/Ciclo Final <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="quantidade-produzida-final-lote"
                      type="number"
                      min="0"
                      value={dadosLote.quantidadeProduzidaFinal || ''}
                      onChange={(e) => setDadosLote(prev => ({
                        ...prev,
                        quantidadeProduzidaFinal: parseInt(e.target.value) || 0
                      }))}
                      placeholder="0"
                      className="h-9"
                    />
                  </div>

                  {/* Quantidade de Perdas */}
                  <div className="grid gap-1">
                    <Label htmlFor="quantidade-perdas-lote" className="text-xs">
                      Qtd. Perdas
                    </Label>
                    <Input
                      id="quantidade-perdas-lote"
                      type="number"
                      min="0"
                      value={dadosLote.quantidadePerdas || ''}
                      onChange={(e) => setDadosLote(prev => ({
                        ...prev,
                        quantidadePerdas: parseInt(e.target.value) || 0
                      }))}
                      placeholder="0"
                      className="h-9"
                    />
                  </div>

                  {/* Botões de ação do formulário */}
                  <div className="flex items-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetarFormularioLote}
                      disabled={salvandoLote}
                      className="h-9"
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSalvarLote}
                      disabled={salvandoLote || !validarCamposLote()}
                      className="h-9 bg-green-600 hover:bg-green-700"
                    >
                      {salvandoLote ? (
                        <Timer className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Tabela de lotes */}
            <div className="flex-1 overflow-auto border rounded-lg">
              {lotesProducao.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhum lote cadastrado ainda</p>
                  <p className="text-sm">Clique em "Novo Lote" para adicionar o primeiro registro.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Nº Lote</TableHead>
                      <TableHead className="font-semibold">Data</TableHead>
                      <TableHead className="font-semibold">Hora Inicial</TableHead>
                      <TableHead className="font-semibold">Hora Final</TableHead>
                      <TableHead className="font-semibold text-right">Qtd/Ciclo Inicial</TableHead>
                      <TableHead className="font-semibold text-right">Qtd/Ciclo Final</TableHead>
                      <TableHead className="font-semibold text-right">Qtd. Produzida</TableHead>
                      <TableHead className="font-semibold text-right">Perdas</TableHead>
                      <TableHead className="font-semibold text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lotesProducao.map((lote, index) => (
                      <TableRow
                        key={lote.id}
                        className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                      >
                        <TableCell className="font-medium">{lote.numeroLote}</TableCell>
                        <TableCell>
                          {lote.data ? new Date(lote.data + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                        </TableCell>
                        <TableCell>{lote.horaInicial}</TableCell>
                        <TableCell>{lote.horaFinal}</TableCell>
                        <TableCell className="text-right font-medium">
                          {lote.quantidadeProduzidaInicial.toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {lote.quantidadeProduzidaFinal.toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {lote.quantidadeProduzida.toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          {lote.quantidadePerdas.toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditarLote(lote)}
                              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                              title="Editar lote"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExcluirLote(lote.id)}
                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
                              title="Excluir lote"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  {/* Linha de totalizadores */}
                  <TableFooter>
                    <TableRow className="bg-muted font-bold">
                      <TableCell colSpan={6} className="text-right">
                        TOTAIS:
                      </TableCell>
                      <TableCell className="text-right text-green-700 font-bold">
                        {calcularTotaisLotes().totalProduzido.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right text-red-700">
                        {calcularTotaisLotes().totalPerdas.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalLotesAberto(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Busca de Turno */}
      <ModalBuscaTurno
        aberto={modalBuscaTurnoAberto}
        onFechar={() => setModalBuscaTurnoAberto(false)}
        onSelecionarTurno={handleSelecionarTurnoModal}
      />

      {/* Modal de Busca de SKU */}
      <ModalBuscaSKU
        aberto={modalBuscaSKUAberto}
        onFechar={() => setModalBuscaSKUAberto(false)}
        onSelecionarSKU={handleSelecionarSKUModal}
      />

      {/* Modal de Busca de Linha de Produção */}
      <ModalBuscaLinhaProducao
        aberto={modalBuscaLinhaAberto}
        onFechar={() => setModalBuscaLinhaAberto(false)}
        onSelecionarLinha={handleSelecionarLinhaModal}
      />
    </>
  )
}
