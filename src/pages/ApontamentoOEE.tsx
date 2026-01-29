/**
 * Página de Apontamento de OEE
 * Permite apontamento de produção, qualidade (perdas) e paradas
 * Calcula OEE em tempo real e exibe em velocímetro
 *
 * Layout baseado em code_oee_apontar.html
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Save, Timer, CheckCircle, ChevronDownIcon, Trash, ArrowLeft, FileText, Play, StopCircle, Search, CircleCheck, Plus, Pencil, X, Settings, Info, Package, Clock, HelpCircle, AlertTriangle, StickyNote } from 'lucide-react'
import { ptBR } from 'date-fns/locale'
import { format, parse, parseISO } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { useOeeTurno } from '@/hooks/useOeeTurno'
import { useAuth } from '@/hooks/useAuth'
// Nota: buscarLinhaPorId foi removido pois espera IDs slug (ex: "spep-envase-e"),
// mas o sistema agora usa IDs numéricos do banco de dados
// Os dados da linha agora vêm de linhaProducaoSelecionada
import { obterTodasOPs } from '@/data/ordem-producao-totvs'
import { Turno, converterParaSetor } from '@/types/operacao'
import { CalculoOEE } from '@/types/apontamento-oee'
import { useToast } from '@/hooks/use-toast'
import { gerarTimestampLocal } from '@/utils/datahora.utils'
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
import { ModalBuscaSKU, type ProdutoSKU, type SKUSelecionado } from "@/components/modal/ModalBuscaSKU"
import { ModalBuscaLinhaProducao, type LinhaProducaoSelecionada } from "@/components/modal/modalBuscaLinhaProducao"
import { TipoParada } from '@/types/parada'

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
  oeeTurnoId?: number | null
  data: string
  turno: Turno
  linhaId: string
  linhaNome: string
  skuCodigo: string
  horaInicio: string
  horaFim: string
  quantidadeProduzida: number
  dataHoraRegistro: string
  createdAt?: string
  velocidade?: number
}

// Tipo para registro de parada no localStorage
interface RegistroParada {
  id: string
  oeeTurnoId?: number | null
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
  oeeturnoperdaId?: number | null
  oeeTurnoId?: number | null
  data: string
  turno: Turno
  linhaId: string
  linhaNome: string
  apontamentoProducaoId: string
  skuCodigo?: string
  tipo: 'PERDAS'
  quantidade: number
  motivo: string
  dataHoraRegistro: string
  deletado?: 'S' | 'N' | null
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

interface ProducaoSupabase {
  oeeturnoproducao_id: number
  linhaproducao_id: number | null
  linhaproducao: string | null
  departamento_id: number | null
  departamento: string | null
  produto_id: number | null
  produto: string | null
  velocidade: number | null
  quantidade: number | null
  data: string | null
  hora_inicio: string | null
  hora_final: string | null
  turno_id: number | null
  turno: string | null
  oeeturno_id: number | null
  created_at: string | null
  updated_at: string | null
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
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { fetchOeeTurno } = useOeeTurno()
  const { user, signOut } = useAuth()

  // ==================== Refs para controle de carregamento ====================
  const turnoOeeCarregadoRef = useRef<string | null>(null) // Evita loop infinito no useEffect de carregamento
  const producaoCarregadaRef = useRef<number | null>(null) // Evita recargas repetidas da produção

  // ==================== Estado de Navegação ====================
  const [formularioAtivo, setFormularioAtivo] = useState<FormularioAtivo>('production-form')
  const [modoVisualizacao, setModoVisualizacao] = useState<boolean>(false) // Quando carregado via oeeTurnoId

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
  const [produtosSKU, setProdutosSKU] = useState<ProdutoSKU[]>([])
  const [carregandoProdutosSKU, setCarregandoProdutosSKU] = useState<boolean>(false)
  const [erroProdutosSKU, setErroProdutosSKU] = useState<string | null>(null)
  const [modalSKUBloqueadoAberto, setModalSKUBloqueadoAberto] = useState<boolean>(false)
  const [skuBloqueadoInfo, setSkuBloqueadoInfo] = useState<{ codigo: string; descricao: string } | null>(null)
  const [modalLinhaInativaAberto, setModalLinhaInativaAberto] = useState<boolean>(false)
  const [linhaInativaInfo, setLinhaInativaInfo] = useState<{ id: number; nome: string } | null>(null)
  const [turnoHoraInicial, setTurnoHoraInicial] = useState<string>('') // Hora inicial do turno
  const [turnoHoraFinal, setTurnoHoraFinal] = useState<string>('') // Hora final do turno
  const [linhaId, setLinhaId] = useState<string>('')
  const [linhaNome, setLinhaNome] = useState<string>('') // Nome da linha selecionada para exibição
  const [linhaProducaoSelecionada, setLinhaProducaoSelecionada] = useState<LinhaProducaoSelecionada | null>(null)
  const [skuCodigo, setSkuCodigo] = useState<string>('')
  const [produtoId, setProdutoId] = useState<number | null>(null)
  const [produtoDescricao, setProdutoDescricao] = useState<string>('')
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
    produtoId: number | null
    produtoDescricao: string
  } | null>(null)

  // ==================== Estado de Controle de Turno ====================
  const [statusTurno, setStatusTurno] = useState<StatusTurno>('NAO_INICIADO')
  const [showConfirmEncerramento, setShowConfirmEncerramento] = useState(false)
  const [oeeTurnoId, setOeeTurnoId] = useState<number | null>(null) // ID do registro na tboee_turno

  // ==================== Estado de Configurações ====================
  const [modalConfiguracoesAberto, setModalConfiguracoesAberto] = useState(false)
  const [intervaloApontamento, setIntervaloApontamento] = useState<number>(1) // Padrão: 1 hora
  const [modalExplicacaoOEEAberto, setModalExplicacaoOEEAberto] = useState(false)
  const [modalAjudaViradaParadaAberto, setModalAjudaViradaParadaAberto] = useState(false)

  // ==================== Estado do Modal de Lotes ====================
  const [modalLotesAberto, setModalLotesAberto] = useState(false)
  const [lotesProducao, setLotesProducao] = useState<LoteProducao[]>([]) // Lista de lotes cadastrados
  const [dadosLote, setDadosLote] = useState<DadosLote>(estadoInicialLote)
  const [dataLoteDigitada, setDataLoteDigitada] = useState<string>('') // Data digitada no formato dd/mm/aaaa
  const [salvandoLote, setSalvandoLote] = useState(false)
  const [formularioLoteAberto, setFormularioLoteAberto] = useState(false) // Controla exibição do formulário inline
  const [loteEmEdicao, setLoteEmEdicao] = useState<string | null>(null) // ID do lote sendo editado

  // ==================== Estado de Linhas de Apontamento de Produção ====================
  const [linhasApontamento, setLinhasApontamento] = useState<LinhaApontamentoProducao[]>([])

  // ==================== Estado de Qualidade - Perdas ====================
  const [quantidadePerdas, setQuantidadePerdas] = useState<string>('')
  const [salvandoQualidade, setSalvandoQualidade] = useState(false)
  const [qualidadeEmEdicao, setQualidadeEmEdicao] = useState<RegistroQualidade | null>(null)
  const salvandoQualidadeRef = useRef(false) // Evita duplo clique no registro de perdas

  // ==================== Estado de Tempo de Parada ====================
  const [paradasGerais, setParadasGerais] = useState<ParadaGeral[]>([])
  const [carregandoParadas, setCarregandoParadas] = useState<boolean>(false)
  const [erroParadas, setErroParadas] = useState<string | null>(null)
  const [codigoParadaBusca, setCodigoParadaBusca] = useState<string>('')
  const [horaInicialParada, setHoraInicialParada] = useState<string>('')
  const [horaFinalParada, setHoraFinalParada] = useState<string>('')
  const [observacoesParada, setObservacoesParada] = useState<string>('')
  const [paradaSelecionada, setParadaSelecionada] = useState<ParadaGeral | null>(null)
  // Paradas em andamento ainda não são rastreadas no Supabase.
  const paradasAtivas: RegistroParada[] = []
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
  // Usar linhaProducaoSelecionada para obter dados da linha (não buscarLinhaPorId que usa IDs slug)
  // Criamos um objeto compatível com o formato esperado em outros lugares do código
  const linhaSelecionada = linhaProducaoSelecionada ? {
    id: linhaProducaoSelecionada.linhaproducao_id.toString(),
    nome: linhaProducaoSelecionada.linhaproducao,
    setor: converterParaSetor(linhaProducaoSelecionada.departamento),
    tipo: linhaProducaoSelecionada.tipo || 'Envase',
    metaOEE: 75
  } : null

  // Desabilita cabeçalho quando:
  // - Turno já iniciado/encerrado e não está editando o cabeçalho
  // - Ou quando está em modo de visualização (carregado via oeeTurnoId sem modo de edição)
  const cabecalhoBloqueado = (statusTurno !== 'NAO_INICIADO' && !editandoCabecalho) || modoVisualizacao

  // ==================== Estado de Histórico de Produção ====================
  const [historicoProducao, setHistoricoProducao] = useState<RegistroProducao[]>([])
  const [showConfirmExclusao, setShowConfirmExclusao] = useState(false)
  const [registroParaExcluir, setRegistroParaExcluir] = useState<string | null>(null)
  const [exclusaoBloqueada, setExclusaoBloqueada] = useState(false)
  const [mensagemExclusaoBloqueada, setMensagemExclusaoBloqueada] = useState('')

  // ==================== Estado de Histórico de Paradas ====================
  const [historicoParadas, setHistoricoParadas] = useState<RegistroParada[]>([])
  const [showConfirmExclusaoParada, setShowConfirmExclusaoParada] = useState(false)
  const [paradaParaExcluir, setParadaParaExcluir] = useState<string | null>(null)

  // ==================== Estado de Histórico de Qualidade ====================
  const [historicoQualidade, setHistoricoQualidade] = useState<RegistroQualidade[]>([])
  const [showConfirmExclusaoQualidade, setShowConfirmExclusaoQualidade] = useState(false)
  const [qualidadeParaExcluir, setQualidadeParaExcluir] = useState<string | null>(null)
  const historicoQualidadeAtivo = historicoQualidade.filter((registro) => registro.deletado !== 'S')
  const totalQuantidadeQualidade = historicoQualidadeAtivo.reduce((total, registro) => {
    if (!Number.isFinite(registro.quantidade)) {
      return total
    }
    return total + registro.quantidade
  }, 0)

  // ==================== Estado do Modal de Anotações ====================
  const [modalAnotacoesAberto, setModalAnotacoesAberto] = useState(false)
  const [linhaAnotacaoSelecionada, setLinhaAnotacaoSelecionada] = useState<LinhaApontamentoProducao | null>(null)
  const [textoAnotacao, setTextoAnotacao] = useState<string>('')
  const [salvandoAnotacao, setSalvandoAnotacao] = useState(false)

  // ==================== Constantes para chaves do localStorage ====================
  const STORAGE_KEY_CONFIGURACOES = 'oee_configuracoes_apontamento'

  /**
   * Carrega histórico de paradas do Supabase (tboee_turno_parada)
   * Filtra por oeeTurnoId, deletado = 'N' e ordena por created_at decrescente
   */
  const carregarHistoricoParadasSupabase = useCallback(async (oeeTurnoIdFiltro?: number | null): Promise<RegistroParada[]> => {
    if (!oeeTurnoIdFiltro) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('tboee_turno_parada')
        .select(`
          oeeturnoparada_id,
          oeeturno_id,
          oeeparada_id,
          parada,
          natureza,
          classe,
          hora_inicio,
          hora_fim,
          observacao,
          created_at,
          deletado
        `)
        .eq('oeeturno_id', oeeTurnoIdFiltro)
        .eq('deletado', 'N')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao carregar histórico de paradas do Supabase:', error)
        return []
      }

      if (!data || data.length === 0) {
        return []
      }

      // Converter registros do Supabase para o formato RegistroParada
      const registrosConvertidos: RegistroParada[] = data.map((registro) => {
        // Calcular duração em minutos
        let duracaoMinutos = 0
        if (registro.hora_inicio && registro.hora_fim) {
          const [hIni, mIni] = registro.hora_inicio.split(':').map(Number)
          const [hFim, mFim] = registro.hora_fim.split(':').map(Number)
          duracaoMinutos = (hFim * 60 + mFim) - (hIni * 60 + mIni)
          if (duracaoMinutos < 0) duracaoMinutos += 24 * 60 // Passou da meia-noite
        }

        return {
          id: String(registro.oeeturnoparada_id),
          oeeTurnoId: registro.oeeturno_id,
          data: registro.created_at ? format(new Date(registro.created_at), 'dd/MM/yyyy') : '',
          turno: turno,
          linhaId: linhaId || '',
          linhaNome: linhaSelecionada?.nome || 'Linha não identificada',
          horaInicio: registro.hora_inicio ? registro.hora_inicio.substring(0, 5) : '',
          horaFim: registro.hora_fim ? registro.hora_fim.substring(0, 5) : '',
          duracao: duracaoMinutos,
          tipoParada: registro.parada || '',
          codigoParada: String(registro.oeeparada_id || ''),
          descricaoParada: `${registro.natureza || ''} - ${registro.classe || ''}`.trim(),
          observacoes: registro.observacao || '',
          dataHoraRegistro: registro.created_at ? format(new Date(registro.created_at), 'dd/MM/yyyy HH:mm:ss') : ''
        }
      })

      return registrosConvertidos
    } catch (error) {
      console.error('Erro ao carregar histórico de paradas:', error)
      return []
    }
  }, [turno, linhaId, linhaSelecionada?.nome])

  /**
   * Busca o oeeparada_id pelo código da parada na tabela tboee_parada
   */
  const buscarOeeparadaIdPorCodigo = useCallback(async (codigo: string): Promise<number | null> => {
    if (!codigo) return null

    try {
      const { data, error } = await supabase
        .from('tboee_parada')
        .select('oeeparada_id')
        .eq('codigo', codigo)
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Erro ao buscar oeeparada_id:', error)
        return null
      }

      return data?.oeeparada_id || null
    } catch (error) {
      console.error('Erro ao buscar oeeparada_id:', error)
      return null
    }
  }, [])

  /**
   * Carrega histórico de qualidade do Supabase (tboee_turno_perda)
   * Filtra por oeeTurnoId, deletado = 'N' e ordena por data decrescente
   */
  const carregarHistoricoQualidadeSupabase = useCallback(async (oeeTurnoIdFiltro?: number | null): Promise<RegistroQualidade[]> => {
    if (!oeeTurnoIdFiltro) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('tboee_turno_perda')
        .select('oeeturnoperda_id, oeeturno_id, perda, created_at, deletado')
        .eq('oeeturno_id', oeeTurnoIdFiltro)
        .eq('deletado', 'N')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao carregar histórico de qualidade do Supabase:', error)
        return []
      }

      if (!data || data.length === 0) {
        return []
      }

      // Converter registros do Supabase para o formato RegistroQualidade
      const registrosConvertidos: RegistroQualidade[] = data.map((registro) => ({
        id: String(registro.oeeturnoperda_id),
        oeeturnoperdaId: registro.oeeturnoperda_id,
        oeeTurnoId: registro.oeeturno_id,
        data: registro.created_at ? format(new Date(registro.created_at), 'dd/MM/yyyy') : '',
        turno: turno, // Usar turno atual do contexto
        linhaId: linhaId || '',
        linhaNome: linhaSelecionada?.nome || 'Linha não identificada',
        apontamentoProducaoId: '',
        skuCodigo: skuCodigo,
        tipo: 'PERDAS' as const,
        quantidade: registro.perda ? Number(registro.perda) : 0,
        motivo: '',
        dataHoraRegistro: registro.created_at ? format(new Date(registro.created_at), 'dd/MM/yyyy HH:mm:ss') : '',
        deletado: registro.deletado as 'S' | 'N' | null
      }))

      return registrosConvertidos
    } catch (error) {
      console.error('Erro ao carregar histórico de qualidade do Supabase:', error)
      return []
    }
  }, [turno, linhaId, linhaSelecionada?.nome, skuCodigo])

  const normalizarHora = (hora: string): string => {
    if (!hora) return ''
    return hora.length === 5 ? `${hora}:00` : hora
  }

  /**
   * Limpa a hora digitada mantendo apenas números e ":".
   * Aceita entrada livre (ex.: "0730" ou "07:30") para formatação posterior.
   */
  const limparHoraDigitada = (valor: string): string => {
    const permitido = valor.replace(/[^\d:]/g, '')
    if (!permitido.includes(':')) {
      return permitido.slice(0, 4)
    }

    const [horas, minutos] = permitido.split(':')
    const horasLimitadas = (horas || '').slice(0, 2)
    const minutosLimitados = (minutos || '').slice(0, 2)
    return `${horasLimitadas}:${minutosLimitados}`
  }

  /**
   * Normaliza a hora digitada para o formato 24h (HH:mm).
   * - Se permitirSomenteHora = false, exige pelo menos hora e minuto.
   * - Se permitirSomenteHora = true, aceita só hora e completa com ":00".
   */
  const normalizarHoraDigitada = (valor: string, permitirSomenteHora = false): string => {
    const valorLimpo = valor.replace(/[^\d:]/g, '')
    const partes = valorLimpo.split(':')
    if (partes.length > 1) {
      const horasTexto = (partes[0] || '').slice(0, 2)
      const minutosTexto = (partes[1] || '').slice(0, 2)
      if (!horasTexto) return ''

      const horas = Number(horasTexto)
      if (Number.isNaN(horas) || horas > 23) return ''

      if (!minutosTexto) {
        if (!permitirSomenteHora) return ''
        return `${String(horas).padStart(2, '0')}:00`
      }

      const minutos = Number(minutosTexto.padStart(2, '0'))
      if (Number.isNaN(minutos) || minutos > 59) return ''
      return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`
    }

    const numeros = valorLimpo.replace(/\D/g, '').slice(0, 4)
    if (!numeros) return ''

    if (numeros.length <= 2) {
      if (!permitirSomenteHora) return ''
      const horas = Number(numeros)
      if (Number.isNaN(horas) || horas > 23) return ''
      return `${String(horas).padStart(2, '0')}:00`
    }

    const horas = Number(numeros.slice(0, 2))
    const minutos = Number(numeros.slice(2).padEnd(2, '0'))
    if (Number.isNaN(horas) || Number.isNaN(minutos) || horas > 23 || minutos > 59) return ''
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`
  }

  /**
   * Formata a data digitada para o padrão dd/mm/aaaa usando apenas números.
   */
  const formatarDataDigitada = (valor: string): string => {
    const numeros = valor.replace(/\D/g, '').slice(0, 8)
    const dia = numeros.slice(0, 2)
    const mes = numeros.slice(2, 4)
    const ano = numeros.slice(4, 8)
    const partes = []
    if (dia) partes.push(dia)
    if (mes) partes.push(mes)
    if (ano) partes.push(ano)
    return partes.join('/')
  }

  /**
   * Converte data no formato dd/mm/aaaa para ISO (aaaa-mm-dd).
   * Retorna string vazia se a data for inválida ou incompleta.
   */
  const converterDataBrParaIso = (dataBr: string): string => {
    const partes = dataBr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (!partes) return ''

    const dia = Number(partes[1])
    const mes = Number(partes[2])
    const ano = Number(partes[3])
    if (Number.isNaN(dia) || Number.isNaN(mes) || Number.isNaN(ano)) return ''
    if (mes < 1 || mes > 12) return ''

    const data = new Date(ano, mes - 1, dia)
    if (
      Number.isNaN(data.getTime()) ||
      data.getFullYear() !== ano ||
      data.getMonth() !== mes - 1 ||
      data.getDate() !== dia
    ) {
      return ''
    }

    return `${String(ano).padStart(4, '0')}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
  }

  /**
   * Converte data ISO (aaaa-mm-dd) para dd/mm/aaaa.
   */
  const formatarDataIsoParaBr = (dataIso: string): string => {
    if (!dataIso) return ''
    if (dataIso.includes('/')) return dataIso

    const partes = dataIso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!partes) return dataIso

    const ano = partes[1]
    const mes = partes[2]
    const dia = partes[3]
    return `${dia}/${mes}/${ano}`
  }

  const turnoHoraInicialNormalizada = normalizarHoraDigitada(turnoHoraInicial)
  const turnoHoraFinalNormalizada = normalizarHoraDigitada(turnoHoraFinal)
  const horaInicialParadaNormalizada = normalizarHoraDigitada(horaInicialParada, true)
  const horaFinalParadaNormalizada = normalizarHoraDigitada(horaFinalParada, true)

	/**
	 * Formata um valor de hora para o padrão brasileiro 24h.
	 *
	 * Observação: inputs nativos `type="time"` podem exibir AM/PM dependendo do SO/navegador.
	 * Para garantir consistência visual (ex.: tabelas/históricos), renderizamos o texto já formatado.
	 */
	const formatarHoraPtBr = (valor: string | null | undefined, incluirSegundos = false): string => {
		if (!valor) return ''

		const texto = String(valor).trim()
		if (!texto) return ''

		const formatarDate = (data: Date): string => {
			const opcoes: Intl.DateTimeFormatOptions = {
				hour: '2-digit',
				minute: '2-digit',
				hour12: false
			}
			if (incluirSegundos) {
				opcoes.second = '2-digit'
			}
			return data.toLocaleTimeString('pt-BR', opcoes)
		}

		// 1) ISO ou data/hora completa (ex.: 2026-01-19T14:30:00.000Z)
		if (texto.includes('T')) {
			const data = new Date(texto)
			if (!Number.isNaN(data.getTime())) {
				return formatarDate(data)
			}
		}

		// 2) Hora simples (aceita HH:mm, HH:mm:ss e também h:mm AM/PM)
		const match = texto.match(/^([0-9]{1,2}):([0-9]{2})(?::([0-9]{2}))?\s*(AM|PM)?$/i)
		if (match) {
			let horas = Number(match[1])
			const minutos = Number(match[2])
			const segundos = match[3] ? Number(match[3]) : 0
			const sufixo = match[4]?.toUpperCase()

			if (sufixo === 'PM' && horas < 12) horas += 12
			if (sufixo === 'AM' && horas === 12) horas = 0

			const hh = String(horas).padStart(2, '0')
			const mm = String(minutos).padStart(2, '0')
			if (incluirSegundos) {
				const ss = String(segundos).padStart(2, '0')
				return `${hh}:${mm}:${ss}`
			}
			return `${hh}:${mm}`
		}

		// 3) Fallback: tenta interpretar como Date
		const dataFallback = new Date(texto)
		if (!Number.isNaN(dataFallback.getTime())) {
			return formatarDate(dataFallback)
		}

		return texto
	}

  const formatarDataRegistro = useCallback((valor: string | null | undefined): string => {
    if (!valor) return ''

    const texto = String(valor).trim()
    if (!texto) return ''

    const dataIso = parseISO(texto)
    if (!Number.isNaN(dataIso.getTime())) {
      return format(dataIso, 'dd/MM/yyyy')
    }

    const dataPt = parse(texto, 'dd/MM/yyyy', new Date())
    if (!Number.isNaN(dataPt.getTime())) {
      return format(dataPt, 'dd/MM/yyyy')
    }

    return texto
  }, [])

  const obterMensagemErro = useCallback((error: unknown, fallback: string): string => {
    if (error && typeof error === 'object') {
      if ('status' in error && (error as { status?: number }).status === 403) {
        return 'Sem permissão para acessar o Supabase. Verifique as políticas RLS e o login.'
      }
      if ('code' in error && (error as { code?: string }).code === '42501') {
        return 'Permissão negada pelo banco de dados. Verifique as políticas de acesso.'
      }
      if ('message' in error) {
        const mensagem = (error as { message?: string }).message
        if (mensagem) {
          const mensagemNormalizada = mensagem.toLowerCase()
          if (
            mensagemNormalizada.includes('row level security') ||
            mensagemNormalizada.includes('row-level security') ||
            mensagemNormalizada.includes('permission denied') ||
            mensagemNormalizada.includes('permissão negada')
          ) {
            return 'Sem permissão para gravar no Supabase. Verifique as políticas RLS.'
          }
          return mensagem
        }
      }
    }
    return fallback
  }, [])

  const extrairCodigoSku = (sku: string): string => {
    return sku.includes(' - ') ? sku.split(' - ')[0].trim() : sku.trim()
  }

  const extrairDescricaoSku = (sku: string): string => {
    return sku.includes(' - ') ? sku.split(' - ').slice(1).join(' - ').trim() : sku.trim()
  }

  const converterBloqueadoParaBooleano = (valor: string | boolean | null): boolean => {
    if (typeof valor === 'boolean') {
      return valor
    }

    const texto = `${valor ?? ''}`.trim().toLowerCase()
    return texto.startsWith('s') || texto === 'true' || texto === '1'
  }

  const buscarProdutosSKU = useCallback(async () => {
    setCarregandoProdutosSKU(true)
    setErroProdutosSKU(null)

    try {
      const { data: produtosData, error } = await supabase
        .from('tbproduto')
        .select('referencia, descricao, bloqueado, anvisa, gtin')
        .eq('deletado', 'N')
        .order('referencia', { ascending: true })

      if (error) {
        throw error
      }

      const produtosMapeados: ProdutoSKU[] = (produtosData || [])
        .map((produto) => ({
          codigo: produto.referencia || '',
          descricao: produto.descricao || '',
          bloqueado: converterBloqueadoParaBooleano(produto.bloqueado),
          anvisa: produto.anvisa || null,
          gtin: produto.gtin || null,
        }))
        .filter((produto) => produto.codigo || produto.descricao)

      setProdutosSKU(produtosMapeados)
    } catch (error) {
      console.error('❌ Erro ao buscar produtos SKU:', error)
      setProdutosSKU([])
      setErroProdutosSKU(obterMensagemErro(error, 'Erro ao carregar produtos SKU.'))
    } finally {
      setCarregandoProdutosSKU(false)
    }
  }, [obterMensagemErro])

  useEffect(() => {
    if (modalBuscaSKUAberto) {
      buscarProdutosSKU()
    }
  }, [buscarProdutosSKU, modalBuscaSKUAberto])

  const obterUsuarioAutenticado = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      console.error('❌ Erro ao validar sessão do usuário:', error)
      await supabase.auth.signOut()
      toast({
        title: 'Sessão expirada',
        description: 'Faça login novamente para continuar.',
        variant: 'destructive'
      })
      return null
    }

    if (!data?.user) {
      toast({
        title: 'Usuário não autenticado',
        description: 'Faça login para continuar.',
        variant: 'destructive'
      })
      return null
    }

    return data.user
  }, [toast])

  const garantirProdutoPorSku = useCallback(async () => {
    const codigoSKU = extrairCodigoSku(skuCodigo)
    const descricaoSKU = extrairDescricaoSku(skuCodigo)

    if (!codigoSKU) {
      toast({
        title: 'SKU obrigatório',
        description: 'Informe o SKU para continuar.',
        variant: 'destructive'
      })
      return { produtoId: null, produtoDescricao: '' }
    }

    try {
      const { data: produtoData, error: produtoError } = await supabase
        .from('tbproduto')
        .select('produto_id, descricao')
        .or(`referencia.eq.${codigoSKU},erp_codigo.eq.${codigoSKU}`)
        .eq('deletado', 'N')
        .limit(1)
        .maybeSingle()

      if (produtoError) {
        throw produtoError
      }

      if (produtoData) {
        setProdutoId(produtoData.produto_id)
        setProdutoDescricao(produtoData.descricao || descricaoSKU)
        return { produtoId: produtoData.produto_id, produtoDescricao: produtoData.descricao || descricaoSKU }
      }

      const novoProduto = {
        referencia: codigoSKU,
        erp_codigo: codigoSKU,
        descricao: descricaoSKU,
        deletado: 'N'
      }

      const { data: produtoCriado, error: criarProdutoError } = await supabase
        .from('tbproduto')
        .insert(novoProduto)
        .select('produto_id, descricao')
        .single()

      if (criarProdutoError) {
        throw criarProdutoError
      }

      setProdutoId(produtoCriado.produto_id)
      setProdutoDescricao(produtoCriado.descricao || descricaoSKU)
      return { produtoId: produtoCriado.produto_id, produtoDescricao: produtoCriado.descricao || descricaoSKU }
    } catch (error) {
      console.error('❌ Erro ao garantir produto:', error)
      toast({
        title: 'Erro ao cadastrar produto',
        description: 'Não foi possível localizar ou cadastrar o produto.',
        variant: 'destructive'
      })
      return { produtoId: null, produtoDescricao: '' }
    }
  }, [skuCodigo, toast])

  const buscarVelocidadeNominal = useCallback(async (linhaProducaoId: number, produtoAtualId: number) => {
    try {
      const { data: velocidadeData, error: velocidadeError } = await supabase
        .from('tbvelocidadenominal')
        .select('velocidade')
        .eq('linhaproducao_id', linhaProducaoId)
        .eq('produto_id', produtoAtualId)
        .eq('deletado', 'N')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (velocidadeError) {
        throw velocidadeError
      }

      if (!velocidadeData?.velocidade) {
        return null
      }

      return Number(velocidadeData.velocidade)
    } catch (error) {
      console.error('❌ Erro ao buscar velocidade nominal:', error)
      toast({
        title: 'Erro ao buscar velocidade nominal',
        description: 'Não foi possível localizar a velocidade nominal para a linha e produto.',
        variant: 'destructive'
      })
      return null
    }
  }, [toast])

  const mapearRegistroSupabase = useCallback((registro: ProducaoSupabase): RegistroProducao => {
    const dataRegistro = formatarDataRegistro(registro.data)
		const horaInicio = formatarHoraPtBr(registro.hora_inicio, false)
		const horaFim = formatarHoraPtBr(registro.hora_final, false)
    const createdAtIso = registro.updated_at || registro.created_at
    const createdAt = createdAtIso ? new Date(createdAtIso) : new Date()

    return {
      id: registro.oeeturnoproducao_id.toString(),
      oeeTurnoId: registro.oeeturno_id ?? null,
      data: dataRegistro,
      turno: (registro.turno as Turno) || turno,
      linhaId: registro.linhaproducao_id?.toString() || linhaId,
      linhaNome: registro.linhaproducao || linhaSelecionada?.nome || '',
      skuCodigo: registro.produto || skuCodigo,
      horaInicio,
      horaFim,
      quantidadeProduzida: Number(registro.quantidade || 0),
      dataHoraRegistro: format(createdAt, 'dd/MM/yyyy HH:mm:ss'),
      createdAt: createdAt.toISOString(),
      velocidade: registro.velocidade ? Number(registro.velocidade) : undefined
    }
  }, [formatarDataRegistro, linhaId, linhaSelecionada?.nome, skuCodigo, turno])

  const montarLinhasApontamentoComRegistros = useCallback((
    registros: RegistroProducao[],
    horaInicioOverride?: string,
    horaFimOverride?: string,
    intervaloOverride?: number
  ) => {
    const horaInicioEfetiva = horaInicioOverride || turnoHoraInicialNormalizada
    const horaFimEfetiva = horaFimOverride || turnoHoraFinalNormalizada
    const intervaloEfetivo = intervaloOverride ?? intervaloApontamento

    if (!horaInicioEfetiva || !horaFimEfetiva || intervaloEfetivo <= 0) {
      return registros.map((registro) => ({
        id: registro.id,
        horaInicio: registro.horaInicio,
        horaFim: registro.horaFim,
        quantidadeProduzida: registro.quantidadeProduzida.toString(),
        apontamentoId: registro.id,
        editavel: false
      }))
    }

    const mapaHistorico = new Map<string, RegistroProducao>()
    registros.forEach((registro) => {
      mapaHistorico.set(registro.horaInicio, registro)
    })

    const [turnoInicioH, turnoInicioM] = horaInicioEfetiva.split(':').map(Number)
    const [turnoFimH, turnoFimM] = horaFimEfetiva.split(':').map(Number)

    let minutoAtual = turnoInicioH * 60 + turnoInicioM
    let minutoFimTurno = turnoFimH * 60 + turnoFimM

    if (minutoFimTurno < minutoAtual) {
      minutoFimTurno += 24 * 60
    }

    const intervaloMinutos = intervaloEfetivo * 60
    const linhas: LinhaApontamentoProducao[] = []

    const formatarHora = (minutos: number): string => {
      const horas = Math.floor(minutos / 60) % 24
      const mins = minutos % 60
      return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
    }

    while (minutoAtual < minutoFimTurno) {
      const proximoMinuto = Math.min(minutoAtual + intervaloMinutos, minutoFimTurno)
      const horaInicio = formatarHora(minutoAtual)
      const horaFim = formatarHora(proximoMinuto)
      const registroHistorico = mapaHistorico.get(horaInicio)

      if (registroHistorico) {
        linhas.push({
          id: registroHistorico.id,
          horaInicio: registroHistorico.horaInicio,
          horaFim: registroHistorico.horaFim,
          quantidadeProduzida: registroHistorico.quantidadeProduzida.toString(),
          apontamentoId: registroHistorico.id,
          editavel: false
        })
      } else {
        linhas.push({
          id: `linha-${Date.now()}-${minutoAtual}`,
          horaInicio,
          horaFim,
          quantidadeProduzida: '',
          editavel: true
        })
      }

      minutoAtual = proximoMinuto
    }

    return linhas
  }, [intervaloApontamento, turnoHoraFinalNormalizada, turnoHoraInicialNormalizada])

  const aplicarRegistrosProducao = useCallback((producoesData: ProducaoSupabase[]) => {
    const registros = (producoesData || []).map((registro) =>
      mapearRegistroSupabase(registro as ProducaoSupabase)
    )

    setHistoricoProducao(registros)
    setLinhasApontamento(montarLinhasApontamentoComRegistros(registros))

    if (registros.length > 0) {
      const registroMaisRecente = [...registros].sort((a, b) => {
        const dataA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dataB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dataB - dataA
      })[0]
      setApontamentoProducaoId(registroMaisRecente.id)
    } else {
      setApontamentoProducaoId(null)
    }

    return registros
  }, [mapearRegistroSupabase, montarLinhasApontamentoComRegistros])

  const carregarProducoesSupabase = useCallback(async (oeeturnoIdAtual: number) => {
    try {
      const { data: producoesData, error: producoesError } = await supabase
        .from('tboee_turno_producao')
        .select('*')
        .eq('oeeturno_id', oeeturnoIdAtual)
        .or('deletado.is.null,deletado.eq.N')
        .order('hora_inicio', { ascending: true })

      if (producoesError) {
        throw producoesError
      }

      const registros = aplicarRegistrosProducao((producoesData || []) as ProducaoSupabase[])

      producaoCarregadaRef.current = oeeturnoIdAtual
      return registros
    } catch (error) {
      console.error('❌ Erro ao carregar produção do Supabase:', error)
      toast({
        title: 'Erro ao carregar produção',
        description: 'Não foi possível carregar os registros de produção no Supabase.',
        variant: 'destructive'
      })
      setHistoricoProducao([])
      setLinhasApontamento([])
      setApontamentoProducaoId(null)
      return []
    }
  }, [aplicarRegistrosProducao, toast])

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
      if (turnoHoraInicialNormalizada && turnoHoraFinalNormalizada && statusTurno === 'NAO_INICIADO') {
        gerarLinhasApontamento(turnoHoraInicialNormalizada, turnoHoraFinalNormalizada, intervaloApontamento)
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
      normalizarHoraDigitada(dadosLote.horaInicial, true) !== '' &&
      (!dadosLote.horaFinal || normalizarHoraDigitada(dadosLote.horaFinal, true) !== '') &&
      (dadosLote.quantidadeProduzidaInicial >= 0 && dadosLote.quantidadeProduzidaFinal >= 0)
    )
  }

  /**
   * Reseta o formulário de lote para o estado inicial e fecha o formulário
   */
  const resetarFormularioLote = () => {
    setDadosLote(estadoInicialLote)
    setDataLoteDigitada('')
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
    setDataLoteDigitada(formatarDataIsoParaBr(lote.data))
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

    const horaInicialNormalizada = normalizarHoraDigitada(dadosLote.horaInicial, true)
    const horaFinalNormalizada = dadosLote.horaFinal
      ? normalizarHoraDigitada(dadosLote.horaFinal, true)
      : ''
    const dadosLoteNormalizados = {
      ...dadosLote,
      horaInicial: horaInicialNormalizada,
      horaFinal: horaFinalNormalizada
    }

    // Calcular quantidade produzida (valor absoluto), permitindo zero como valor válido
    const quantidadeProduzidaCalculada = dadosLote.quantidadeProduzidaFinal >= 0
      ? Math.abs(dadosLote.quantidadeProduzidaFinal - dadosLote.quantidadeProduzidaInicial)
      : 0

    try {
      if (loteEmEdicao) {
        // Atualizar lote existente
        setLotesProducao(prev =>
          prev.map(lote =>
            lote.id === loteEmEdicao
              ? { ...lote, ...dadosLoteNormalizados, quantidadeProduzida: quantidadeProduzidaCalculada }
              : lote
          )
        )
        toast({
          title: '✅ Lote Atualizado',
          description: `O lote ${dadosLoteNormalizados.numeroLote} foi atualizado com sucesso.`
        })
      } else {
        // Criar novo lote com ID único
        const novoLote: LoteProducao = {
          id: `lote-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          ...dadosLoteNormalizados,
          quantidadeProduzida: quantidadeProduzidaCalculada
        }
        setLotesProducao(prev => [...prev, novoLote])
        toast({
          title: '✅ Lote Adicionado',
          description: `O lote ${dadosLoteNormalizados.numeroLote} foi adicionado com sucesso.`
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

  const quantidadeProduzidaInvalida = (quantidade: string): boolean => {
    if (quantidade.trim() === '') {
      return true
    }

    const valor = Number(quantidade)
    return !Number.isFinite(valor) || valor < 0
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

    if (!data) {
      toast({
        title: 'Campo obrigatório',
        description: 'Selecione a Data',
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

    if (quantidadeProduzidaInvalida(linhaApontamento.quantidadeProduzida)) {
      toast({
        title: 'Campo obrigatório',
        description: 'Informe a Quantidade Produzida',
        variant: 'destructive'
      })
      return
    }

    // Usar linhaProducaoSelecionada que já contém os dados da linha do banco
    // Não usamos buscarLinhaPorId pois espera IDs slug (ex: "spep-envase-e"), mas temos IDs numéricos do BD
    if (!linhaProducaoSelecionada) {
      toast({
        title: 'Erro',
        description: 'Linha de produção não encontrada',
        variant: 'destructive'
      })
      return
    }

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

      const turnoAtualId = oeeTurnoId || await verificarOuCriarTurnoOEE()

      if (!turnoAtualId) {
        toast({
          title: 'Erro ao registrar turno',
          description: 'Não foi possível obter o turno OEE para salvar a produção.',
          variant: 'destructive'
        })
        return
      }

      if (!oeeTurnoId) {
        setOeeTurnoId(turnoAtualId)
      }

      const usuario = await obterUsuarioAutenticado()
      if (!usuario) {
        return
      }

      const produtoAtualId = produtoId ?? (await garantirProdutoPorSku()).produtoId

      if (!produtoAtualId) {
        return
      }

      const velocidadeNominal = await buscarVelocidadeNominal(
        linhaProducaoSelecionada.linhaproducao_id,
        produtoAtualId
      )

      if (!velocidadeNominal) {
        toast({
          title: 'Velocidade nominal não encontrada',
          description: 'Cadastre a velocidade nominal para a linha e produto antes de salvar.',
          variant: 'destructive'
        })
        return
      }

      const payload = {
        linhaproducao_id: linhaProducaoSelecionada.linhaproducao_id,
        linhaproducao: linhaProducaoSelecionada.linhaproducao,
        departamento_id: linhaProducaoSelecionada.departamento_id,
        departamento: linhaProducaoSelecionada.departamento,
        produto_id: produtoAtualId,
        produto: skuCodigo,
        velocidade: velocidadeNominal,
        quantidade: Number(linhaApontamento.quantidadeProduzida),
        data: format(data, 'yyyy-MM-dd'),
        hora_inicio: normalizarHora(linhaApontamento.horaInicio),
        hora_final: normalizarHora(linhaApontamento.horaFim),
        turno_id: parseInt(turnoId),
        turno: turno,
        oeeturno_id: turnoAtualId,
        updated_at: new Date().toISOString(),
        updated_by: usuario.id
      }

      let registroSalvo: ProducaoSupabase | null = null

      if (linhaApontamento.apontamentoId) {
        const { data: registroAtualizado, error } = await supabase
          .from('tboee_turno_producao')
          .update(payload)
          .eq('oeeturnoproducao_id', parseInt(linhaApontamento.apontamentoId))
          .select('*')
          .single()

        if (error) {
          throw error
        }

        registroSalvo = registroAtualizado as ProducaoSupabase
      } else {
        const { data: registroCriado, error } = await supabase
          .from('tboee_turno_producao')
          .insert({
            ...payload,
            created_at: new Date().toISOString(),
            created_by: usuario.id,
            deletado: 'N'
          })
          .select('*')
          .single()

        if (error) {
          throw error
        }

        registroSalvo = registroCriado as ProducaoSupabase
      }

      if (!registroSalvo) {
        throw new Error('Registro de produção não retornado pelo Supabase')
      }

      const registroMapeado = mapearRegistroSupabase(registroSalvo)
      const historicoAtualizado = linhaApontamento.apontamentoId
        ? historicoProducao.map((registro) => registro.id === registroMapeado.id ? registroMapeado : registro)
        : [registroMapeado, ...historicoProducao]

      setHistoricoProducao(historicoAtualizado)
      setApontamentoProducaoId(registroMapeado.id)
      setHorasRestantes(calcularHorasRestantes(historicoAtualizado))
      recalcularOeeComHistorico(historicoAtualizado)

      setLinhasApontamento(linhas =>
        linhas.map(l =>
          l.id === linhaApontamento.id
            ? { ...l, apontamentoId: registroMapeado.id, editavel: false }
            : l
        )
      )

      toast({
        title: '✅ Linha Salva',
        description: `Apontamento de ${Number(linhaApontamento.quantidadeProduzida).toLocaleString('pt-BR')} unidades registrado com sucesso`
      })

    } catch (error) {
      console.error('❌ Erro ao salvar linha:', error)
      toast({
        title: 'Erro ao salvar',
        description: obterMensagemErro(error, 'Não foi possível salvar o apontamento. Tente novamente.'),
        variant: 'destructive'
      })
    }
  }

  /**
   * Exclui uma linha individual de apontamento
   */
  const handleExcluirLinha = async (linhaApontamento: LinhaApontamentoProducao) => {
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
      const usuario = await obterUsuarioAutenticado()
      if (!usuario) {
        return
      }

      const timestampExclusao = gerarTimestampLocal()
      const { error } = await supabase
        .from('tboee_turno_producao')
        .update({
          deletado: 'S',
          deleted_at: timestampExclusao,
          deleted_by: usuario.id,
          updated_at: timestampExclusao,
          updated_by: usuario.id
        })
        .eq('oeeturnoproducao_id', parseInt(linhaApontamento.apontamentoId))

      if (error) {
        throw error
      }

      const novoHistorico = historicoProducao.filter(r => r.id !== linhaApontamento.apontamentoId)
      setHistoricoProducao(novoHistorico)

      // Limpar a linha
      setLinhasApontamento(linhas =>
        linhas.map(l =>
          l.id === linhaApontamento.id
            ? { ...l, quantidadeProduzida: '', apontamentoId: undefined, editavel: false }
            : l
        )
      )

      setHorasRestantes(calcularHorasRestantes(novoHistorico))
      recalcularOeeComHistorico(novoHistorico)

      toast({
        title: '✅ Linha Excluída',
        description: 'Apontamento removido com sucesso'
      })

    } catch (error) {
      console.error('❌ Erro ao excluir linha:', error)
      toast({
        title: 'Erro ao excluir',
        description: obterMensagemErro(error, 'Não foi possível excluir o apontamento. Tente novamente.'),
        variant: 'destructive'
      })
    }
  }

  /**
   * Abre o modal de anotações para uma linha específica
   * Carrega a anotação existente do banco de dados se houver
   */
  const handleAbrirAnotacoes = async (linhaApontamento: LinhaApontamentoProducao) => {
    if (!linhaApontamento.apontamentoId) {
      toast({
        title: 'Linha não salva',
        description: 'Salve a linha antes de adicionar anotações',
        variant: 'destructive'
      })
      return
    }

    setLinhaAnotacaoSelecionada(linhaApontamento)
    setTextoAnotacao('')

    // Buscar anotação existente do banco de dados
    try {
      const { data: registro, error } = await supabase
        .from('tboee_turno_producao')
        .select('anotacao')
        .eq('oeeturnoproducao_id', parseInt(linhaApontamento.apontamentoId))
        .single()

      if (error) {
        console.error('Erro ao buscar anotação:', error)
      } else if (registro?.anotacao) {
        setTextoAnotacao(registro.anotacao)
      }
    } catch (error) {
      console.error('Erro ao buscar anotação:', error)
    }

    setModalAnotacoesAberto(true)
  }

  /**
   * Salva a anotação no banco de dados seguindo princípios ALCOA+
   * Inclui timestamp e usuário que criou/atualizou a anotação
   */
  const handleSalvarAnotacao = async () => {
    if (!linhaAnotacaoSelecionada?.apontamentoId) {
      toast({
        title: 'Erro',
        description: 'Nenhuma linha selecionada para salvar anotação',
        variant: 'destructive'
      })
      return
    }

    setSalvandoAnotacao(true)

    try {
      const usuario = await obterUsuarioAutenticado()
      if (!usuario) {
        setSalvandoAnotacao(false)
        return
      }

      const { error } = await supabase
        .from('tboee_turno_producao')
        .update({
          anotacao: textoAnotacao.trim() || null,
          updated_at: new Date().toISOString(),
          updated_by: usuario.id
        })
        .eq('oeeturnoproducao_id', parseInt(linhaAnotacaoSelecionada.apontamentoId))

      if (error) {
        throw error
      }

      toast({
        title: '✅ Anotação salva',
        description: 'Anotação registrada com sucesso'
      })

      setModalAnotacoesAberto(false)
      setLinhaAnotacaoSelecionada(null)
      setTextoAnotacao('')

    } catch (error) {
      console.error('❌ Erro ao salvar anotação:', error)
      toast({
        title: 'Erro ao salvar anotação',
        description: obterMensagemErro(error, 'Não foi possível salvar a anotação. Tente novamente.'),
        variant: 'destructive'
      })
    } finally {
      setSalvandoAnotacao(false)
    }
  }

  /**
   * Fecha o modal de anotações e limpa os estados
   */
  const handleFecharModalAnotacoes = () => {
    setModalAnotacoesAberto(false)
    setLinhaAnotacaoSelecionada(null)
    setTextoAnotacao('')
  }

  const formatarQuantidade = (quantidade: number): string => {
    return quantidade.toLocaleString('pt-BR')
  }

  const normalizarPerdaPtBr = (valor: string) => {
    if (!valor) {
      return {
        formatado: '',
        valorNormalizado: '',
        valorNumero: Number.NaN
      }
    }

    const somenteNumerosEVirgula = valor.replace(/[^\d,]/g, '')
    const partes = somenteNumerosEVirgula.split(',')
    const temVirgula = partes.length > 1

    const totalMaximoDigitos = 15
    const inteiroRaw = partes[0] ?? ''
    let decimaisRaw = temVirgula ? partes.slice(1).join('') : ''

    let inteiroNumeros = inteiroRaw.replace(/^0+(?=\d)/, '')
    if (inteiroNumeros.length > totalMaximoDigitos) {
      inteiroNumeros = inteiroNumeros.slice(0, totalMaximoDigitos)
    }

    const maxDecimaisDisponiveis = Math.max(totalMaximoDigitos - inteiroNumeros.length, 0)
    const limiteDecimais = Math.min(4, maxDecimaisDisponiveis)
    if (decimaisRaw.length > limiteDecimais) {
      decimaisRaw = decimaisRaw.slice(0, limiteDecimais)
    }

    if (!inteiroNumeros && temVirgula) {
      inteiroNumeros = '0'
    }

    const inteiroFormatado = inteiroNumeros
      ? inteiroNumeros.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      : ''

    const formatado = temVirgula ? `${inteiroFormatado},${decimaisRaw}` : inteiroFormatado
    const valorNormalizado = inteiroNumeros
      ? `${inteiroNumeros}${decimaisRaw ? `.${decimaisRaw}` : ''}`
      : temVirgula
        ? `0${decimaisRaw ? `.${decimaisRaw}` : ''}`
        : ''
    const valorNumero = valorNormalizado ? Number(valorNormalizado) : Number.NaN

    return {
      formatado,
      valorNormalizado,
      valorNumero
    }
  }

  const formatarPerdaPtBr = (valor: string): string => {
    return normalizarPerdaPtBr(valor).formatado
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
   * Soma perdas por oeeturno_id
   * Usa histórico local de qualidade até a migração completa para Supabase
   */
  const calcularTotalPerdasDoApontamento = useCallback(
    (registrosQualidade = historicoQualidade): number => {
      if (!oeeTurnoId) {
        return 0
      }

      return registrosQualidade
        .filter((registro) => registro.oeeTurnoId === oeeTurnoId && registro.deletado !== 'S')
        .reduce((total, registro) => total + (registro.quantidade || 0), 0)
    },
    [historicoQualidade, oeeTurnoId]
  )

  const somarDuracoesMinutos = (paradas: RegistroParada[]): number => {
    return paradas.reduce((sum, parada) => sum + (parada.duracao || 0), 0)
  }

  const arredondar = (valor: number): number => {
    return Math.round(valor * 100) / 100
  }

  const identificarTipoParada = (parada: RegistroParada): TipoParada => {
    const obs = parada.observacoes?.toLowerCase() || ''
    const codigoParada = parada.codigoParada?.toLowerCase() || ''
    const tipoParada = parada.tipoParada?.toLowerCase() || ''
    const descricaoParada = parada.descricaoParada?.toLowerCase() || ''

    const padroesEstrategicos = [
      'feriado', 'inventário', 'inventario',
      'atividade programada', 'parada estratégica', 'parada estrategica',
      'sem programação', 'sem programacao', 'sem demanda', 'ociosidade planejada'
    ]

    for (const padrao of padroesEstrategicos) {
      if (codigoParada.includes(padrao) || obs.includes(padrao) || tipoParada.includes(padrao) || descricaoParada.includes(padrao)) {
        return 'ESTRATEGICA'
      }
    }

    const padroesPlaneados = [
      'cip', 'sip', 'cip/sip',
      'manutenção preventiva', 'manutencao preventiva',
      'manutenção planejada', 'manutencao planejada',
      'setup', 'troca de formato', 'troca de produto',
      'troca de lote', 'troca de sku',
      'início de produção', 'inicio de producao',
      'fim de produção', 'fim de producao',
      'validação', 'validacao', 'qualificação', 'qualificacao',
      'teste de filtro',
      'paradas planejadas', 'planejada'
    ]

    for (const padrao of padroesPlaneados) {
      if (codigoParada.includes(padrao) || obs.includes(padrao) || tipoParada.includes(padrao) || descricaoParada.includes(padrao)) {
        return 'PLANEJADA'
      }
    }

    const padroesNaoPlaneados = [
      'não planejada', 'nao planejada',
      'quebra', 'falha',
      'falta de', 'falta insumo',
      'emergência', 'emergencia',
      'corretiva'
    ]

    for (const padrao of padroesNaoPlaneados) {
      if (codigoParada.includes(padrao) || obs.includes(padrao) || tipoParada.includes(padrao) || descricaoParada.includes(padrao)) {
        return 'NAO_PLANEJADA'
      }
    }

    return 'NAO_PLANEJADA'
  }

  const recalcularOeeComHistorico = useCallback((
    registrosProducao: RegistroProducao[],
    registrosQualidade = historicoQualidade,
    registrosParadas = historicoParadas
  ) => {
    if (!linhaId || !oeeTurnoId) {
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
      return
    }

    if (registrosProducao.length === 0) {
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
      return
    }

    const quantidadeProduzidaTotal = registrosProducao.reduce(
      (total, registro) => total + registro.quantidadeProduzida,
      0
    )

    const velocidadeNominal = registrosProducao.find((registro) => registro.velocidade && registro.velocidade > 0)?.velocidade || 0
    const paradas = registrosParadas.filter((parada) => parada.oeeTurnoId === oeeTurnoId)
    const paradasComDuracao = paradas.filter((parada) => Number.isFinite(parada.duracao) && parada.duracao > 0)

    const paradasEstrategicas = paradasComDuracao.filter((parada) =>
      identificarTipoParada(parada) === 'ESTRATEGICA'
    )

    const paradasGrandes = paradasComDuracao.filter((parada) =>
      identificarTipoParada(parada) !== 'ESTRATEGICA' &&
      parada.duracao >= 10
    )

    const tempoDisponivelHoras = TEMPO_DISPONIVEL_PADRAO
    const tempoEstrategicoHoras = somarDuracoesMinutos(paradasEstrategicas) / 60
    const tempoParadasGrandesHoras = somarDuracoesMinutos(paradasGrandes) / 60

    const tempoDisponivelAjustado = tempoDisponivelHoras - tempoEstrategicoHoras
    const tempoOperacao = tempoDisponivelAjustado - tempoParadasGrandesHoras

    const disponibilidade = tempoDisponivelAjustado > 0
      ? (tempoOperacao / tempoDisponivelAjustado) * 100
      : 0

    const tempoOperacionalLiquido = velocidadeNominal > 0
      ? quantidadeProduzidaTotal / velocidadeNominal
      : 0

    const performanceBruta = tempoOperacao > 0
      ? (tempoOperacionalLiquido / tempoOperacao) * 100
      : 0

    const performance = Math.min(performanceBruta, 100)
    const totalPerdas = calcularTotalPerdasDoApontamento(registrosQualidade)
    const unidadesBoas = quantidadeProduzidaTotal - totalPerdas

    const qualidadeUnidades = quantidadeProduzidaTotal > 0
      ? (unidadesBoas / quantidadeProduzidaTotal) * 100
      : 100

    const qualidade = qualidadeUnidades
    const oee = (disponibilidade / 100) * (performance / 100) * (qualidade / 100) * 100
    const tempoValioso = (qualidade / 100) * tempoOperacionalLiquido

    setOeeCalculado({
      disponibilidade: arredondar(disponibilidade),
      performance: arredondar(performance),
      qualidade: arredondar(qualidade),
      oee: arredondar(oee),
      tempoOperacionalLiquido: arredondar(tempoOperacionalLiquido),
      tempoValioso: arredondar(tempoValioso)
    })

    setTotalPerdasQualidade(totalPerdas)
  }, [calcularTotalPerdasDoApontamento, historicoParadas, historicoQualidade, linhaId, oeeTurnoId])

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
  const recalcularIndicadoresAposExclusao = (historicoAtualizado: RegistroProducao[]) => {
    setHorasRestantes(calcularHorasRestantes(historicoAtualizado))

    if (historicoAtualizado.length > 0) {
      const registroMaisRecente = [...historicoAtualizado].sort((a, b) => {
        const dataA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dataB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dataB - dataA
      })[0]
      setApontamentoProducaoId(registroMaisRecente.id)
      recalcularOeeComHistorico(historicoAtualizado)
      return
    }

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
  const mensagemTurnoEncerrado = 'O turno está encerrado e a exclusão não pode ser realizada.'
  const mensagemFalhaStatusTurno = 'Não foi possível validar o status do turno. A exclusão foi bloqueada.'
  const mensagemTurnoNaoIdentificado = 'Não foi possível identificar o turno associado ao registro. A exclusão foi bloqueada.'
  const statusTurnoBloqueado = new Set(['encerrado', 'fechado'])

  const obterStatusTurno = async (oeeTurnoId?: number | null) => {
    if (!oeeTurnoId) {
      return { status: null, erro: mensagemTurnoNaoIdentificado }
    }

    try {
      const { data, error } = await supabase
        .from('tboee_turno')
        .select('status')
        .eq('oeeturno_id', oeeTurnoId)
        .eq('deletado', 'N')
        .maybeSingle()

      if (error || !data || !data.status) {
        return { status: null, erro: mensagemFalhaStatusTurno }
      }

      return { status: data.status || null, erro: null }
    } catch (error) {
      console.error('❌ Erro ao consultar status do turno:', error)
      return { status: null, erro: mensagemFalhaStatusTurno }
    }
  }

  /**
   * Abre o diálogo de confirmação de exclusão
   * @param registroId - ID do registro a ser excluído
   */
  const confirmarExclusao = async (registroId: string) => {
    setExclusaoBloqueada(false)
    setMensagemExclusaoBloqueada('')

    const registro = historicoProducao.find(r => r.id === registroId)
    const { status, erro } = await obterStatusTurno(registro?.oeeTurnoId)

    if (erro) {
      toast({
        title: 'Exclusão bloqueada',
        description: erro,
        variant: 'destructive'
      })
      setRegistroParaExcluir(registroId)
      setExclusaoBloqueada(true)
      setMensagemExclusaoBloqueada(erro)
      setShowConfirmExclusao(true)
      return
    }

    const statusNormalizado = status?.trim().toLowerCase()
    if (statusNormalizado && statusTurnoBloqueado.has(statusNormalizado)) {
      setRegistroParaExcluir(registroId)
      setExclusaoBloqueada(true)
      setMensagemExclusaoBloqueada(mensagemTurnoEncerrado)
      setShowConfirmExclusao(true)
      return
    }

    setRegistroParaExcluir(registroId)
    setShowConfirmExclusao(true)
  }

  /**
   * Cancela a exclusão e fecha o diálogo
   */
  const cancelarExclusao = () => {
    setRegistroParaExcluir(null)
    setShowConfirmExclusao(false)
    setExclusaoBloqueada(false)
    setMensagemExclusaoBloqueada('')
  }

  /**
   * Exclui um registro de produção do histórico
   */
  const handleExcluirProducao = async () => {
    if (!registroParaExcluir) return

    try {
      const registro = historicoProducao.find(r => r.id === registroParaExcluir)
      const { status, erro } = await obterStatusTurno(registro?.oeeTurnoId)

      if (erro) {
        toast({
          title: 'Exclusão bloqueada',
          description: erro,
          variant: 'destructive'
        })
        setExclusaoBloqueada(true)
        setMensagemExclusaoBloqueada(erro)
        return
      }

    const statusNormalizado = status?.trim().toLowerCase()
      if (statusNormalizado && statusTurnoBloqueado.has(statusNormalizado)) {
        setExclusaoBloqueada(true)
        setMensagemExclusaoBloqueada(mensagemTurnoEncerrado)
        return
      }

      const usuario = await obterUsuarioAutenticado()
      if (!usuario) {
        return
      }

      const timestampExclusao = gerarTimestampLocal()
      const { error } = await supabase
        .from('tboee_turno_producao')
        .update({
          deletado: 'S',
          deleted_at: timestampExclusao,
          deleted_by: usuario.id,
          updated_at: timestampExclusao,
          updated_by: usuario.id
        })
        .eq('oeeturnoproducao_id', parseInt(registroParaExcluir))

      if (error) {
        throw error
      }

      const novoHistorico = historicoProducao.filter(r => r.id !== registroParaExcluir)
      setHistoricoProducao(novoHistorico)

      setLinhasApontamento((linhas) =>
        linhas.map((linha) =>
          linha.apontamentoId === registroParaExcluir
            ? { ...linha, quantidadeProduzida: '', apontamentoId: undefined, editavel: false }
            : linha
        )
      )

      recalcularIndicadoresAposExclusao(novoHistorico)

      toast({
        title: '✅ Registro Excluído',
        description: 'O registro de produção foi excluído e os indicadores foram recalculados',
      })

      cancelarExclusao()
    } catch (error) {
      console.error('Erro ao excluir registro de produção:', error)
      toast({
        title: 'Erro ao excluir',
        description: obterMensagemErro(error, 'Não foi possível excluir o registro. Tente novamente.'),
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
    historicoParadasAtualizado: RegistroParada[]
  ) => {
    const totalHorasParadasCalculado = historicoParadasAtualizado.reduce(
      (total, parada) => total + (parada.duracao || 0),
      0
    ) / 60
    setTotalHorasParadas(totalHorasParadasCalculado)
    setHorasRestantes(calcularHorasRestantes())

    recalcularOeeComHistorico(historicoProducao, historicoQualidade, historicoParadasAtualizado)
  }

  /**
   * Exclui um registro de parada do histórico
   * Faz soft delete no Supabase e recalcula OEE automaticamente
   */
  const handleExcluirParada = async () => {
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

      const usuario = await obterUsuarioAutenticado()
      if (!usuario) {
        cancelarExclusaoParada()
        return
      }

      const oeeturnoparadaId = Number(paradaExcluida.id)
      if (!Number.isFinite(oeeturnoparadaId)) {
        toast({
          title: 'Erro ao excluir',
          description: 'Registro de parada sem vínculo com o banco de dados.',
          variant: 'destructive'
        })
        cancelarExclusaoParada()
        return
      }

      // Soft delete no Supabase
      const { error: erroExclusao } = await supabase
        .from('tboee_turno_parada')
        .update({
          deleted_at: gerarTimestampLocal(),
          deleted_by: usuario.id,
          deletado: 'S'
        })
        .eq('oeeturnoparada_id', oeeturnoparadaId)

      if (erroExclusao) {
        throw erroExclusao
      }

      console.log('Parada excluída (soft delete) no Supabase:', oeeturnoparadaId)

      // Recarregar histórico de paradas do Supabase
      const novoHistorico = await carregarHistoricoParadasSupabase(oeeTurnoId)
      setHistoricoParadas(novoHistorico)

      // Recalcular todos os indicadores impactados (OEE e secundários) para o período afetado
      recalcularIndicadoresAposExclusaoParada(novoHistorico)

      // Feedback de sucesso
      toast({
        title: 'Parada Excluída',
        description: 'O registro de parada foi excluído e os indicadores foram recalculados',
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
   * Marca como deletado no banco e recalcula OEE automaticamente
   */
  const handleExcluirQualidade = async () => {
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

      const usuario = await obterUsuarioAutenticado()
      if (!usuario) {
        return
      }

      const oeeturnoperdaId = qualidadeExcluida.oeeturnoperdaId ?? Number(qualidadeExcluida.id)
      if (!Number.isFinite(oeeturnoperdaId)) {
        toast({
          title: 'Erro ao excluir',
          description: 'Registro de perda sem vínculo com o banco de dados.',
          variant: 'destructive'
        })
        cancelarExclusaoQualidade()
        return
      }

      const { error: erroExclusao } = await supabase
        .from('tboee_turno_perda')
        .update({
          deleted_at: gerarTimestampLocal(),
          deleted_by: usuario.id,
          deletado: 'S'
        })
        .eq('oeeturnoperda_id', oeeturnoperdaId)

      if (erroExclusao) {
        throw erroExclusao
      }

      // Recarregar histórico de qualidade do Supabase
      const novoHistorico = await carregarHistoricoQualidadeSupabase(oeeTurnoId)
      setHistoricoQualidade(novoHistorico)

      console.log('🗑️ Qualidade excluída:', {
        id: qualidadeParaExcluir,
        tipo: qualidadeExcluida.tipo,
        quantidade: qualidadeExcluida.quantidade
      })

      recalcularOeeComHistorico(historicoProducao, novoHistorico)

      if (qualidadeEmEdicao?.id === qualidadeParaExcluir) {
        cancelarEdicaoQualidade()
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
   * Busca paradas cadastradas no Supabase (tboee_parada)
   */
  const buscarParadasSupabase = useCallback(async () => {
    if (carregandoParadas) {
      return
    }

    setCarregandoParadas(true)
    setErroParadas(null)

    try {
      const { data, error } = await supabase
        .from('tboee_parada')
        .select('codigo, componente, classe, natureza, parada, descricao')
        .order('codigo', { ascending: true })

      if (error) {
        throw error
      }

      const paradasFormatadas: ParadaGeral[] = (data || []).map((parada) => ({
        codigo: parada.codigo ?? '',
        componente: parada.componente ?? '',
        classe: parada.classe ?? '',
        natureza: parada.natureza ?? '',
        parada: parada.parada ?? '',
        descricao: parada.descricao ?? ''
      }))

      setParadasGerais(paradasFormatadas)
    } catch (error) {
      console.error('Erro ao buscar paradas no Supabase:', error)
      setParadasGerais([])
      setErroParadas('Não foi possível carregar a lista de paradas.')
      toast({
        title: 'Erro ao carregar paradas',
        description: 'Não foi possível buscar os tipos de parada no Supabase.',
        variant: 'destructive'
      })
    } finally {
      setCarregandoParadas(false)
    }
  }, [carregandoParadas, toast])

  /**
   * Abre o modal de busca de paradas
   */
  const abrirModalBuscaParadas = () => {
    setModalBuscaParadasAberto(true)
    if (paradasGerais.length === 0 || erroParadas) {
      buscarParadasSupabase()
    }
  }

  /**
   * Callback quando uma parada é selecionada no modal
   */
  const handleSelecionarParadaModal = (parada: ParadaGeral) => {
    setParadaSelecionada(parada)
    setCodigoParadaBusca(parada.codigo || '')

    toast({
      title: 'Parada selecionada',
      description: `${parada.codigo} - ${(parada.parada || parada.descricao || '').substring(0, 50)}...`,
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
		const horaInicioFormatada = formatarHoraPtBr(turnoSelecionado.horaInicio, false)
		const horaFimFormatada = formatarHoraPtBr(turnoSelecionado.horaFim, false)

    setTurnoId(turnoSelecionado.turno_id)
    setTurnoCodigo(turnoSelecionado.codigo)
    setTurnoNome(turnoSelecionado.turno)
    setTurno(turnoSelecionado.turno as Turno)  // Sincroniza o estado turno para o DTO de salvamento
		setTurnoHoraInicial(horaInicioFormatada)
		setTurnoHoraFinal(horaFimFormatada)

    // Gerar linhas de apontamento automaticamente
    // IMPORTANTE: Só gera se o turno ainda não foi iniciado (evita sobrescrever dados do histórico)
    if (statusTurno === 'NAO_INICIADO') {
			gerarLinhasApontamento(horaInicioFormatada, horaFimFormatada, intervaloApontamento)
    }

    toast({
      title: 'Turno selecionado',
			description: `${turnoSelecionado.codigo} - ${turnoSelecionado.turno} (${horaInicioFormatada} - ${horaFimFormatada})`,
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
    // Verifica se o produto está bloqueado na lista de produtos
    const produtoEncontrado = produtosSKU.find(p => p.codigo === skuSelecionado.codigo)
    
    if (produtoEncontrado?.bloqueado) {
      // Produto bloqueado - exibe modal de alerta e não permite seleção
      setSkuBloqueadoInfo({
        codigo: skuSelecionado.codigo,
        descricao: skuSelecionado.descricao
      })
      setModalSKUBloqueadoAberto(true)
      return
    }

    // Produto não bloqueado - permite seleção normalmente
    setSkuCodigo(`${skuSelecionado.codigo} - ${skuSelecionado.descricao}`)
    setProdutoId(null)
    setProdutoDescricao(skuSelecionado.descricao)

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
    // Verifica se a linha está inativa
    if (linha.ativo === 'N') {
      // Linha inativa - exibe modal de alerta e não permite seleção
      setLinhaInativaInfo({
        id: linha.linhaproducao_id,
        nome: linha.linhaproducao
      })
      setModalLinhaInativaAberto(true)
      return
    }

    // Linha ativa - permite seleção normalmente
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
  const calcularHorasRestantes = useCallback((registros = historicoProducao): number => {
    const tempoDisponivel = calcularTempoDisponivelTurno()

    if (!data || !linhaId || !skuCodigo) {
      return tempoDisponivel
    }

    const dataSelecionada = format(data, 'dd/MM/yyyy')

    const apontamentosTurnoAtual = registros.filter(
      (registro) =>
        registro.data === dataSelecionada &&
        registro.turno === turno &&
        registro.linhaId === linhaId &&
        registro.skuCodigo === skuCodigo
    )

    const horasApontadas = apontamentosTurnoAtual.reduce((total, apontamento) => {
      if (!apontamento.horaInicio || !apontamento.horaFim) {
        return total
      }

      const [horaInicioH, horaInicioM] = apontamento.horaInicio.split(':').map(Number)
      const [horaFimH, horaFimM] = apontamento.horaFim.split(':').map(Number)

      const minutosInicio = horaInicioH * 60 + horaInicioM
      let minutosFim = horaFimH * 60 + horaFimM

      if (minutosFim < minutosInicio) {
        minutosFim += 24 * 60
      }

      const duracaoMinutos = minutosFim - minutosInicio
      return total + (duracaoMinutos / 60)
    }, 0)

    return Math.max(0, tempoDisponivel - horasApontadas)
  }, [calcularTempoDisponivelTurno, data, historicoProducao, linhaId, skuCodigo, turno])

  // ==================== Carregar histórico ao montar o componente ====================
  useEffect(() => {
    // Carregar histórico de paradas do Supabase (assíncrono)
    const carregarParadas = async () => {
      const paradas = await carregarHistoricoParadasSupabase(oeeTurnoId)
      setHistoricoParadas(paradas)
      setTotalHorasParadas(paradas.reduce((total, p) => total + (p.duracao || 0), 0) / 60)
    }
    carregarParadas()

    // Carregar histórico de qualidade do Supabase (assíncrono)
    const carregarQualidade = async () => {
      const qualidade = await carregarHistoricoQualidadeSupabase(oeeTurnoId)
      setHistoricoQualidade(qualidade)
    }
    carregarQualidade()

    carregarConfiguracoes()
  }, [carregarHistoricoParadasSupabase, carregarHistoricoQualidadeSupabase, carregarConfiguracoes, oeeTurnoId])

  useEffect(() => {
    if (!oeeTurnoId) {
      return
    }

    if (producaoCarregadaRef.current === oeeTurnoId) {
      return
    }

    carregarProducoesSupabase(oeeTurnoId)
  }, [carregarProducoesSupabase, oeeTurnoId])

  // ==================== Carregar dados do turno OEE via parâmetros URL ====================
  /**
   * Quando a página é aberta com oeeturno_id na query string (vindo do OeeTurno),
   * busca os dados do turno OEE e preenche o formulário automaticamente.
   * Isso permite visualizar/editar um turno existente.
   *
   * IMPORTANTE: Usa uma ref para evitar loop infinito, garantindo que o carregamento
   * ocorra apenas uma vez por oeeTurnoId.
   */
  useEffect(() => {
    const oeeTurnoIdParam = searchParams.get('oeeturno_id') || searchParams.get('oeeTurnoId')
    const editMode = searchParams.get('edit') === 'true'
    const oeeTurnoIdNumero = oeeTurnoIdParam ? Number(oeeTurnoIdParam) : NaN

    // Se não há ID ou já foi carregado, sair
    if (!oeeTurnoIdParam || !Number.isFinite(oeeTurnoIdNumero) || turnoOeeCarregadoRef.current === oeeTurnoIdParam) {
      return
    }

    const carregarDadosTurnoOEE = async () => {
      // Marcar como carregado ANTES de fazer a busca para evitar chamadas duplicadas
      turnoOeeCarregadoRef.current = oeeTurnoIdParam

      console.log('🔍 Carregando dados do turno OEE:', oeeTurnoIdParam)

      try {
        // Buscar dados do turno OEE no Supabase
        const turnoData = await fetchOeeTurno(oeeTurnoIdParam)

        if (!turnoData) {
          console.error('❌ Turno OEE não encontrado')
          toast({
            title: 'Erro',
            description: 'Turno OEE não encontrado',
            variant: 'destructive'
          })
          return
        }

        console.log('✅ Dados do turno OEE carregados:', turnoData)

        // Popular campos do formulário com os dados recuperados

        // 1. Data do turno
        if (turnoData.data) {
          const dataParseada = parseISO(turnoData.data)
          setData(dataParseada)
        }

        // 2. Turno (ID, código e nome)
        if (turnoData.turnoId) {
          setTurnoId(turnoData.turnoId.toString())
          // Extrair código do turno se disponível no formato "D1 - Diurno"
          const turnoPartes = turnoData.turno.split(' - ')
          if (turnoPartes.length >= 2) {
            setTurnoCodigo(turnoPartes[0])
            setTurnoNome(turnoPartes.slice(1).join(' - '))
          } else {
            setTurnoNome(turnoData.turno)
          }
          setTurno(turnoData.turno as Turno)
        }

        // 3. Hora inicial e final do turno
        let horaInicioTurnoFormatada = ''
        let horaFimTurnoFormatada = ''
        if (turnoData.horaInicio) {
          horaInicioTurnoFormatada = formatarHoraPtBr(turnoData.horaInicio, false)
	        setTurnoHoraInicial(horaInicioTurnoFormatada)
        }
        if (turnoData.horaFim) {
          horaFimTurnoFormatada = formatarHoraPtBr(turnoData.horaFim, false)
	        setTurnoHoraFinal(horaFimTurnoFormatada)
        }

        // 4. Produto/SKU
        if (turnoData.produto) {
          setSkuCodigo(turnoData.produto)
          setProdutoDescricao(extrairDescricaoSku(turnoData.produto))
        }
        if (turnoData.produtoId) {
          setProdutoId(turnoData.produtoId)
        }

        let linhaIdExtraidoNumero: number | null = null

        // 5. Linha de produção (preferir campos diretos do turno)
        const linhaIdDireta = typeof turnoData.linhaProducaoId === 'number' ? turnoData.linhaProducaoId : null
        const linhaNomeDireto = turnoData.linhaProducaoNome?.trim() || ''

        if (linhaIdDireta || linhaNomeDireto) {
          if (linhaIdDireta) {
            setLinhaId(linhaIdDireta.toString())
            linhaIdExtraidoNumero = linhaIdDireta
          }

          const linhaNomeExibicao = linhaIdDireta && linhaNomeDireto
            ? `${linhaIdDireta} - ${linhaNomeDireto}`
            : (linhaNomeDireto || (linhaIdDireta ? linhaIdDireta.toString() : ''))

          if (linhaNomeExibicao) {
            setLinhaNome(linhaNomeExibicao)
          }

          if (linhaIdDireta) {
            setLinhaProducaoSelecionada({
              linhaproducao_id: linhaIdDireta,
              linhaproducao: linhaNomeDireto || linhaNomeExibicao,
              departamento_id: null, // Não disponível no turno
              departamento: null, // Será extraído do nome se necessário
              tipo: null, // Não disponível no turno
              ativo: 'S' // Assumimos ativo ao carregar de turno existente
            })
          }
        } else if (turnoData.observacao) {
          // Fallback: Observação pode conter informações da linha de produção
          // Formato esperado: "Turno iniciado via sistema OEE - Linha: 15 - SPEP 2 - LINHA E - ENVASE"
          const matchLinha = turnoData.observacao.match(/Linha:\s*(\d+)\s*-\s*(.+)/i)
          if (matchLinha) {
            const linhaIdExtraido = matchLinha[1]
            const linhaNomeExtraido = matchLinha[2]
            setLinhaId(linhaIdExtraido)
            setLinhaNome(linhaNomeExtraido)

            const linhaIdNumero = Number(linhaIdExtraido)
            linhaIdExtraidoNumero = Number.isFinite(linhaIdNumero) ? linhaIdNumero : null

            // Construir objeto LinhaProducaoSelecionada diretamente dos dados extraídos
            // Nota: buscarLinhaPorId espera IDs slug (ex: "spep-envase-e"), mas aqui temos IDs numéricos do BD
            // Por isso, construímos o objeto diretamente com os dados disponíveis
            setLinhaProducaoSelecionada({
              linhaproducao_id: linhaIdExtraidoNumero ?? 0,
              linhaproducao: linhaNomeExtraido,
              departamento_id: null, // Não disponível na observação
              departamento: null, // Será extraído do nome se necessário
              tipo: null, // Não disponível na observação
              ativo: 'S' // Assumimos ativo ao carregar de turno existente
            })
          }
        }

        // 6. Definir ID do turno OEE
        setOeeTurnoId(oeeTurnoIdNumero)

        const producoesCarregadas = await carregarProducoesSupabase(oeeTurnoIdNumero)

        const horaInicioOverride = horaInicioTurnoFormatada
          ? normalizarHoraDigitada(horaInicioTurnoFormatada, true)
          : ''
        const horaFimOverride = horaFimTurnoFormatada
          ? normalizarHoraDigitada(horaFimTurnoFormatada, true)
          : ''

        setLinhasApontamento(
          montarLinhasApontamentoComRegistros(
            producoesCarregadas,
            horaInicioOverride,
            horaFimOverride,
            intervaloApontamento
          )
        )

        // 7. Definir modo de visualização ou edição
        if (!editMode) {
          setModoVisualizacao(true)
          // Se o turno já está fechado ou cancelado, definir status
          if (turnoData.status === 'Fechado') {
            setStatusTurno('ENCERRADO')
          } else if (turnoData.status === 'Aberto') {
            setStatusTurno('INICIADO')
          }
        }

        const dataTurnoFormatada = formatarDataRegistro(turnoData.data)

        toast({
          title: 'Turno carregado',
          description: `Dados do turno OEE carregados: ${turnoData.turno} - ${dataTurnoFormatada || '-'}`,
          variant: 'default'
        })

      } catch (error) {
        console.error('❌ Erro ao carregar dados do turno OEE:', error)
        // Resetar ref em caso de erro para permitir nova tentativa
        turnoOeeCarregadoRef.current = null
        toast({
          title: 'Erro ao carregar turno',
          description: 'Não foi possível carregar os dados do turno OEE',
          variant: 'destructive'
        })
      }
    }

    carregarDadosTurnoOEE()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // ==================== Regenerar linhas de apontamento quando turno ou intervalo mudar ====================
  // IMPORTANTE: Só regenera se o turno NÃO estiver iniciado (evita sobrescrever dados durante o turno)
  // NOTA: NÃO incluir linhasApontamento nas dependências para evitar loop infinito
  useEffect(() => {
    if (turnoHoraInicialNormalizada && turnoHoraFinalNormalizada && intervaloApontamento > 0 && statusTurno === 'NAO_INICIADO') {
      gerarLinhasApontamento(turnoHoraInicialNormalizada, turnoHoraFinalNormalizada, intervaloApontamento)
      console.log('✅ Linhas de apontamento geradas automaticamente (useEffect)')
    }
  }, [turnoHoraInicialNormalizada, turnoHoraFinalNormalizada, intervaloApontamento, gerarLinhasApontamento, statusTurno])

  // ==================== Recalcula OEE quando dados mudam ====================
  useEffect(() => {
    if (!linhaId) {
      return
    }

    recalcularOeeComHistorico(historicoProducao)
  }, [historicoParadas, historicoProducao, historicoQualidade, linhaId, recalcularOeeComHistorico])

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

      const codigoSKUAtual = extrairCodigoSku(skuCodigo)
      let opsRelevantes = todasOPs.filter(op => {
        // Converter data de emissão (DD/MM/YYYY) para Date
        const [dia, mes, ano] = op.C2_EMISSAO.split('/')
        const dataEmissao = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia))

        // Filtrar por data e quantidade
        const dentroDataLimite = dataEmissao >= dataLimite
        const temQuantidade = op.C2_QUANT > 0

        // Se SKU já estiver preenchido, filtrar apenas OPs do mesmo SKU
        const mesmoSKU = !codigoSKUAtual || op.C2_PRODUTO === codigoSKUAtual

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
   * Verifica se já existe um turno aberto na tboee_turno para linha/data/turno/SKU
   * Se existir, retorna os dados existentes
   * Se não existir, cria um novo registro
   *
   * @returns ID do turno OEE (existente ou recém-criado)
   */
  const verificarOuCriarTurnoOEE = async (): Promise<number | null> => {
    try {
      const codigoSKU = extrairCodigoSku(skuCodigo)
      const descricaoSKU = extrairDescricaoSku(skuCodigo)

      const dataFormatada = data ? format(data, 'yyyy-MM-dd') : null
      const linhaProducaoIdBruta = linhaProducaoSelecionada?.linhaproducao_id ?? (linhaId ? Number(linhaId) : null)
      const linhaProducaoId = Number.isFinite(linhaProducaoIdBruta) ? linhaProducaoIdBruta : null
      const linhaNomeNormalizado = linhaNome ? linhaNome.replace(/^\s*\d+\s*-\s*/, '').trim() : ''
      const linhaProducaoNome = linhaProducaoSelecionada?.linhaproducao?.trim() || linhaNomeNormalizado || null

      if (!dataFormatada || !turnoId || !codigoSKU || !linhaProducaoId || !linhaProducaoNome) {
        console.error('❌ Dados obrigatórios faltando para criar turno OEE:', {
          data: dataFormatada,
          turnoId,
          codigoSKU,
          linhaproducao_id: linhaProducaoId,
          linhaproducao: linhaProducaoNome
        })
        return null
      }

      const { produtoId: produtoIdAtual, produtoDescricao: produtoDescricaoAtual } = await garantirProdutoPorSku()

      if (!produtoIdAtual) {
        return null
      }

      // Verificar se já existe um turno ABERTO para esta combinação
      // Critérios: mesma data + mesmo turno + mesmo produto + status Aberto + não deletado
      console.log('🔍 Verificando turno existente:', {
        data: dataFormatada,
        turno_id: parseInt(turnoId),
        produto_id: produtoIdAtual,
        linhaproducao_id: linhaProducaoId
      })

      const { data: turnoExistente, error: buscarError } = await supabase
        .from('tboee_turno')
        .select('oeeturno_id, data, produto_id, turno_id, status')
        .eq('data', dataFormatada)
        .eq('turno_id', parseInt(turnoId))
        .eq('produto_id', produtoIdAtual)
        .eq('linhaproducao_id', linhaProducaoId)
        .eq('status', 'Aberto')
        .eq('deletado', 'N')
        .limit(1)
        .maybeSingle()

      if (buscarError) {
        console.error('❌ Erro ao buscar turno existente:', buscarError)
        throw buscarError
      }

      // Se já existe um turno com essas características, retornar o ID existente
      if (turnoExistente) {
        console.log('✅ Turno OEE já existe:', turnoExistente)
        return turnoExistente.oeeturno_id
      }

      // Não existe, criar novo registro com status 'Aberto'
      console.log('📝 Criando novo registro de turno OEE...')

      const novoTurno = {
        data: dataFormatada,
        produto_id: produtoIdAtual,
        produto: `${codigoSKU} - ${produtoDescricaoAtual || descricaoSKU}`,
        turno_id: parseInt(turnoId),
        turno: turnoNome || turnoCodigo,
        linhaproducao_id: linhaProducaoId,
        linhaproducao: linhaProducaoNome,
        turno_hi: turnoHoraInicialNormalizada || null,
        turno_hf: turnoHoraFinalNormalizada || null,
        observacao: `Turno iniciado via sistema OEE - Linha: ${linhaProducaoId} - ${linhaProducaoNome}`,
        created_at: gerarTimestampLocal(),
        status: 'Aberto', // Status inicial do turno
        deletado: 'N', // Flag de exclusão lógica
        // created_by: TODO - adicionar quando autenticação estiver implementada
      }

      console.log('📤 Dados para inserção:', novoTurno)

      const { data: turnoInserido, error: inserirError } = await supabase
        .from('tboee_turno')
        .insert(novoTurno)
        .select('oeeturno_id')
        .single()

      if (inserirError) {
        console.error('❌ Erro ao inserir turno OEE:', inserirError)
        throw inserirError
      }

      console.log('✅ Turno OEE criado com sucesso:', turnoInserido)
      return turnoInserido.oeeturno_id
    } catch (error) {
      console.error('❌ Erro ao verificar/criar turno OEE:', error)
      toast({
        title: 'Erro ao registrar turno',
        description: 'Não foi possível registrar o turno no banco de dados. Os dados serão salvos localmente.',
        variant: 'destructive'
      })
      return null
    }
  }

  /**
   * Inicia o turno após validação dos campos obrigatórios
   * Bloqueia edição dos campos do cabeçalho
   * Inicializa cálculos de OEE com valores zerados
   * Aplica filtragem por oeeturno_id (ALCOA+)
   * PRÉ-CARREGA dados de produção de OPs ativas
   */
  const handleIniciarTurno = async () => {
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

    // ==================== Persistência do Turno OEE ====================
    // Verificar se já existe turno aberto ou criar novo registro na tboee_turno
    const turnoOeeId = await verificarOuCriarTurnoOEE()
    if (turnoOeeId) {
      setOeeTurnoId(turnoOeeId)
      console.log('✅ Turno OEE registrado/recuperado:', turnoOeeId)
    } else {
      console.warn('⚠️ Não foi possível registrar turno no banco. Salvamento de produção ficará indisponível.')
    }

    const historicoParadasSalvo = await carregarHistoricoParadasSupabase(turnoOeeId)
    const qualidadeDoTurno = await carregarHistoricoQualidadeSupabase(turnoOeeId)

    const producoesTurno = turnoOeeId
      ? await carregarProducoesSupabase(turnoOeeId)
      : []

    const temDadosSalvos = producoesTurno.length > 0 || historicoParadasSalvo.length > 0

    // Log dos filtros aplicados para auditoria (ALCOA+)
    console.log('🔍 Filtros aplicados ao iniciar turno (OEE por oeeturno_id):', {
      oeeTurnoId: turnoOeeId,
      linhaId,
      linhaProducaoId: linhaProducaoSelecionada?.linhaproducao_id,
      linhaNome: linhaSelecionada?.nome || 'Não encontrada',
      skuCodigo,
      producoesTurno: producoesTurno.length,
      paradasEncontradas: historicoParadasSalvo.length,
      perdasEncontradas: qualidadeDoTurno.length
    })

    if (temDadosSalvos) {
      setHistoricoProducao(producoesTurno)
      setHistoricoParadas(historicoParadasSalvo)
      setHistoricoQualidade(qualidadeDoTurno)

      const totalHorasParadasCalculado =
        historicoParadasSalvo.reduce((total, parada) => total + parada.duracao, 0) / 60
      setTotalHorasParadas(totalHorasParadasCalculado)
      setHorasRestantes(calcularHorasRestantes(producoesTurno))

      recalcularOeeComHistorico(producoesTurno, qualidadeDoTurno, historicoParadasSalvo)
      setStatusTurno('INICIADO')

      const linhaNome = linhaSelecionada?.nome || 'Linha não identificada'
      toast({
        title: 'Turno Iniciado',
        description: `Dados carregados para ${linhaNome} - SKU ${skuCodigo}: ${producoesTurno.length} produções e ${historicoParadasSalvo.length} paradas`,
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
    if (turnoHoraInicialNormalizada && turnoHoraFinalNormalizada && intervaloApontamento > 0) {
      gerarLinhasApontamento(turnoHoraInicialNormalizada, turnoHoraFinalNormalizada, intervaloApontamento)
      console.log(`✅ Linhas de apontamento geradas automaticamente (${turnoHoraInicialNormalizada} - ${turnoHoraFinalNormalizada}, intervalo: ${intervaloApontamento}h)`)
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
   * Atualiza o status no banco de dados para 'Fechado'
   * Segue princípios ALCOA+ (registro contemporâneo e atribuível)
   */
  const handleEncerrarTurno = async () => {
    // Fechar modal imediatamente para feedback visual
    setShowConfirmEncerramento(false)

    // Atualizar status no banco de dados
    if (oeeTurnoId) {
      try {
        console.log('📝 Iniciando encerramento do turno OEE:', {
          oeeTurnoId,
          timestamp: new Date().toISOString()
        })

        // Usar .select() para confirmar que a atualização foi feita e retornar dados
        const { data: updatedData, error: updateError } = await supabase
          .from('tboee_turno')
          .update({
            status: 'Fechado',
            updated_at: new Date().toISOString()
            // updated_by: TODO - adicionar quando autenticação estiver implementada
          })
          .eq('oeeturno_id', oeeTurnoId)
          .select('oeeturno_id, status, updated_at')

        if (updateError) {
          console.error('❌ Erro ao atualizar status do turno:', updateError)
          toast({
            title: 'Erro ao encerrar turno',
            description: `Não foi possível atualizar o status: ${updateError.message}`,
            variant: 'destructive'
          })
          return
        }

        // Verificar se a atualização realmente afetou algum registro
        if (!updatedData || updatedData.length === 0) {
          console.error('❌ Nenhum registro foi atualizado. Verificar se o ID existe:', oeeTurnoId)
          toast({
            title: 'Erro ao encerrar turno',
            description: 'Registro do turno não encontrado no banco de dados.',
            variant: 'destructive'
          })
          return
        }

        console.log('✅ Status do turno OEE atualizado para Fechado:', updatedData[0])

        // Atualizar estado local após sucesso confirmado no banco
        setStatusTurno('ENCERRADO')

        toast({
          title: 'Turno Encerrado',
          description: `Turno encerrado com sucesso às ${format(new Date(), 'HH:mm:ss')}.`,
          variant: 'default'
        })
      } catch (error) {
        console.error('❌ Exceção ao encerrar turno no banco:', error)
        toast({
          title: 'Erro ao encerrar turno',
          description: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
          variant: 'destructive'
        })
      }
    } else {
      console.warn('⚠️ oeeTurnoId não definido. Não é possível encerrar o turno.')
      toast({
        title: 'Erro ao encerrar turno',
        description: 'ID do turno não encontrado. Por favor, reinicie a aplicação.',
        variant: 'destructive'
      })
    }
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
      skuCodigo,
      produtoId,
      produtoDescricao
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
      setProdutoId(cabecalhoOriginal.produtoId)
      setProdutoDescricao(cabecalhoOriginal.produtoDescricao)
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
  const handleContinuarTurno = async () => {
    if (!validarCamposCabecalho()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos antes de continuar o turno.',
        variant: 'destructive'
      })
      return
    }

    if (!oeeTurnoId) {
      toast({
        title: 'Turno não encontrado',
        description: 'Não foi possível localizar o turno OEE para atualizar.',
        variant: 'destructive'
      })
      return
    }

    try {
      const usuario = await obterUsuarioAutenticado()
      if (!usuario) {
        return
      }

      const dataISO = data ? format(data, 'yyyy-MM-dd') : ''

      const produtoAtualId = produtoId ?? (await garantirProdutoPorSku()).produtoId

      if (!produtoAtualId || !linhaProducaoSelecionada) {
        return
      }

      const velocidadeNominal = await buscarVelocidadeNominal(
        linhaProducaoSelecionada.linhaproducao_id,
        produtoAtualId
      )

      if (!velocidadeNominal) {
        toast({
          title: 'Velocidade nominal não encontrada',
          description: 'Cadastre a velocidade nominal para atualizar o cabeçalho.',
          variant: 'destructive'
        })
        return
      }

      const { error: atualizarErro } = await supabase
        .from('tboee_turno_producao')
        .update({
          data: dataISO,
          turno_id: parseInt(turnoId),
          turno: turno,
          linhaproducao_id: linhaProducaoSelecionada.linhaproducao_id,
          linhaproducao: linhaProducaoSelecionada.linhaproducao,
          departamento_id: linhaProducaoSelecionada.departamento_id,
          departamento: linhaProducaoSelecionada.departamento,
          produto_id: produtoAtualId,
          produto: skuCodigo,
          velocidade: velocidadeNominal,
          updated_at: new Date().toISOString(),
          updated_by: usuario.id
        })
        .eq('oeeturno_id', oeeTurnoId)
        .eq('deletado', 'N')

      if (atualizarErro) {
        throw atualizarErro
      }

      // Recarregar histórico de paradas do Supabase (dados já estão no banco)
      const historicoParadasAtualizado = await carregarHistoricoParadasSupabase(oeeTurnoId)
      setHistoricoParadas(historicoParadasAtualizado)

      // Recarregar histórico de qualidade do Supabase (dados já estão no banco)
      const historicoQualidadeAtualizado = await carregarHistoricoQualidadeSupabase(oeeTurnoId)
      setHistoricoQualidade(historicoQualidadeAtualizado)

      const producoesAtualizadas = await carregarProducoesSupabase(oeeTurnoId)
      setHorasRestantes(calcularHorasRestantes(producoesAtualizadas))
      setTotalHorasParadas(historicoParadasAtualizado.reduce((total, parada) => total + (parada.duracao || 0), 0) / 60)
      recalcularOeeComHistorico(producoesAtualizadas, historicoQualidadeAtualizado, historicoParadasAtualizado)

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
        description: obterMensagemErro(error, 'Não foi possível atualizar o cabeçalho. Tente novamente.'),
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

  const iniciarEdicaoQualidade = (registro: RegistroQualidade) => {
    setQualidadeEmEdicao(registro)
    setQuantidadePerdas(registro.quantidade.toLocaleString('pt-BR', { maximumFractionDigits: 4 }))
  }

  const cancelarEdicaoQualidade = () => {
    setQualidadeEmEdicao(null)
    setQuantidadePerdas('')
  }

  const handleSalvarEdicaoQualidade = async () => {
    if (!qualidadeEmEdicao) {
      return
    }

    if (salvandoQualidadeRef.current) {
      return
    }

    salvandoQualidadeRef.current = true
    setSalvandoQualidade(true)

    try {
      const { valorNormalizado: perdaNormalizada, valorNumero: perdaValor } = normalizarPerdaPtBr(quantidadePerdas)
      const temPerdas = Number.isFinite(perdaValor) && perdaValor > 0

      if (!temPerdas) {
        toast({
          title: 'Erro de Validação',
          description: 'Informe a quantidade de perdas',
          variant: 'destructive'
        })
        return
      }

      const usuario = await obterUsuarioAutenticado()
      if (!usuario) {
        return
      }

      const oeeturnoperdaId = qualidadeEmEdicao.oeeturnoperdaId ?? Number(qualidadeEmEdicao.id)
      if (!Number.isFinite(oeeturnoperdaId)) {
        toast({
          title: 'Erro ao editar',
          description: 'Registro de perda sem vínculo com o banco de dados.',
          variant: 'destructive'
        })
        return
      }

      const { error: erroAtualizacao } = await supabase
        .from('tboee_turno_perda')
        .update({
          perda: perdaNormalizada,
          updated_at: gerarTimestampLocal(),
          updated_by: usuario.id
        })
        .eq('oeeturnoperda_id', oeeturnoperdaId)
        .eq('deletado', 'N')

      if (erroAtualizacao) {
        throw erroAtualizacao
      }

      // Recarregar histórico de qualidade do Supabase
      const historicoAtualizado = await carregarHistoricoQualidadeSupabase(oeeTurnoId)
      setHistoricoQualidade(historicoAtualizado)

      recalcularOeeComHistorico(historicoProducao, historicoAtualizado)

      toast({
        title: '✅ Perda Atualizada',
        description: 'Registro de perda atualizado com sucesso.'
      })

      cancelarEdicaoQualidade()
    } catch (error) {
      console.error('❌ Erro ao atualizar perda:', error)
      toast({
        title: 'Erro ao editar',
        description: obterMensagemErro(error, 'Não foi possível atualizar a perda. Tente novamente.'),
        variant: 'destructive'
      })
    } finally {
      salvandoQualidadeRef.current = false
      setSalvandoQualidade(false)
    }
  }

  /**
   * Adiciona registro de qualidade (perdas)
   */
  const handleAdicionarQualidade = async () => {
    if (salvandoQualidadeRef.current) {
      return
    }

    salvandoQualidadeRef.current = true
    setSalvandoQualidade(true)

    // =================================================================
    // VALIDAÇÃO 1: Verificar se existe apontamento de produção ativo
    // =================================================================
    try {
      if (!apontamentoProducaoId) {
        toast({
          title: 'Erro de Validação',
          description: 'É necessário ter um apontamento de produção ativo para registrar qualidade',
          variant: 'destructive'
        })
        return
      }

      // =================================================================
      // VALIDAÇÃO 2: Verificar se a quantidade de perdas está preenchida
      // =================================================================
      const { valorNormalizado: perdaNormalizada, valorNumero: perdaValor } = normalizarPerdaPtBr(quantidadePerdas)
      const temPerdas = Number.isFinite(perdaValor) && perdaValor > 0

      if (!temPerdas) {
        toast({
          title: 'Erro de Validação',
          description: 'Informe a quantidade de perdas',
          variant: 'destructive'
        })
        return
      }

      // =================================================================
      // VALIDAÇÃO 3: Verificar se existe turno OEE válido
      // =================================================================
      if (!oeeTurnoId) {
        toast({
          title: 'Erro de Validação',
          description: 'Turno OEE não encontrado. Inicie o turno antes de registrar perdas.',
          variant: 'destructive'
        })
        return
      }

      const usuario = await obterUsuarioAutenticado()
      if (!usuario) {
        return
      }

      // =================================================================
      // SALVAMENTO: Salvar perdas no Supabase e no histórico local
      // =================================================================
      const { data: perdaCriada, error: erroPerda } = await supabase
        .from('tboee_turno_perda')
        .insert({
          oeeturno_id: oeeTurnoId,
          perda: perdaNormalizada,
          created_at: gerarTimestampLocal(),
          created_by: usuario.id
        })
        .select('oeeturnoperda_id')
        .single()

      if (erroPerda) {
        throw erroPerda
      }

      if (!perdaCriada?.oeeturnoperda_id) {
        throw new Error('ID da perda não retornado pelo banco.')
      }

      // =================================================================
      // RECARREGAR HISTÓRICO DO SUPABASE
      // =================================================================
      const novoHistorico = await carregarHistoricoQualidadeSupabase(oeeTurnoId)
      setHistoricoQualidade(novoHistorico)

      recalcularOeeComHistorico(historicoProducao, novoHistorico)

      // =================================================================
      // LIMPAR FORMULÁRIO
      // =================================================================
      setQuantidadePerdas('')

      // =================================================================
      // FEEDBACK PARA O USUÁRIO
      // =================================================================
      toast({
        title: '✅ Qualidade Registrada',
        description: `Registrado: ${perdaValor.toLocaleString('pt-BR')} unidades de perdas. OEE atualizado.`
      })
    } catch (error) {
      console.error('❌ Erro ao salvar apontamento de qualidade:', error)
      toast({
        title: 'Erro ao salvar',
        description: obterMensagemErro(error, 'Não foi possível salvar o apontamento de qualidade. Tente novamente.'),
        variant: 'destructive'
      })
    } finally {
      salvandoQualidadeRef.current = false
      setSalvandoQualidade(false)
    }
  }

  const handleRegistrarParada = async () => {
    // Validar campos obrigatórios
    if (!paradaSelecionada) {
      toast({
        title: 'Erro de Validação',
        description: 'Por favor, busque e selecione um tipo de parada',
        variant: 'destructive'
      })
      return
    }

    if (!horaInicialParadaNormalizada) {
      toast({
        title: 'Erro de Validação',
        description: 'Por favor, informe a hora inicial da parada em formato 24h',
        variant: 'destructive'
      })
      return
    }

    if (!horaFinalParadaNormalizada) {
      toast({
        title: 'Erro de Validação',
        description: 'Por favor, informe a hora final da parada em formato 24h',
        variant: 'destructive'
      })
      return
    }

    // Validar se turno está iniciado
    if (!oeeTurnoId) {
      toast({
        title: 'Turno não iniciado',
        description: 'Inicie o turno antes de registrar paradas.',
        variant: 'destructive'
      })
      return
    }

    // Calcular duração em minutos
    const [horaIni, minIni] = horaInicialParadaNormalizada.split(':').map(Number)
    const [horaFin, minFin] = horaFinalParadaNormalizada.split(':').map(Number)
    const minutosInicio = horaIni * 60 + minIni
    let minutosFim = horaFin * 60 + minFin
    if (minutosFim < minutosInicio) {
      minutosFim += 24 * 60
    }
    const duracaoMinutos = minutosFim - minutosInicio

    // Validar que hora final é diferente da hora inicial
    if (duracaoMinutos <= 0) {
      toast({
        title: 'Erro de Validação',
        description: 'A hora final deve ser diferente da hora inicial',
        variant: 'destructive'
      })
      return
    }

    // Obter usuário autenticado
    const usuario = await obterUsuarioAutenticado()
    if (!usuario) {
      return
    }

    try {
      // Buscar oeeparada_id pelo código (lookup na tabela tboee_parada)
      const oeeparadaId = await buscarOeeparadaIdPorCodigo(paradaSelecionada.codigo)
      if (!oeeparadaId) {
        toast({
          title: 'Parada não encontrada',
          description: 'Não foi possível localizar o tipo de parada no banco de dados.',
          variant: 'destructive'
        })
        return
      }

      // Formatar horas para TIME (HH:MM)
      const horaInicioFormatada = horaInicialParadaNormalizada
      const horaFimFormatada = horaFinalParadaNormalizada

      // INSERT no Supabase
      const { data: paradaCriada, error: erroParada } = await supabase
        .from('tboee_turno_parada')
        .insert({
          oeeturno_id: oeeTurnoId,
          oeeparada_id: oeeparadaId,
          parada: paradaSelecionada.parada || paradaSelecionada.descricao || 'Parada',
          natureza: paradaSelecionada.natureza || null,
          classe: paradaSelecionada.classe || null,
          hora_inicio: horaInicioFormatada,
          hora_fim: horaFimFormatada,
          observacao: observacoesParada || null,
          created_at: gerarTimestampLocal(),
          created_by: usuario.id,
          deletado: 'N'
        })
        .select('oeeturnoparada_id')
        .single()

      if (erroParada) {
        throw erroParada
      }

      if (!paradaCriada?.oeeturnoparada_id) {
        throw new Error('ID da parada não retornado pelo banco.')
      }

      console.log('Parada registrada no Supabase:', paradaCriada.oeeturnoparada_id)

      // Recarregar histórico de paradas do Supabase
      const historicoAtualizado = await carregarHistoricoParadasSupabase(oeeTurnoId)
      setHistoricoParadas(historicoAtualizado)
      setTotalHorasParadas(historicoAtualizado.reduce((total, parada) => total + (parada.duracao || 0), 0) / 60)

      // Recalcular OEE
      recalcularOeeComHistorico(historicoProducao, historicoQualidade, historicoAtualizado)

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

    } catch (error) {
      console.error('Erro ao registrar parada no Supabase:', error)
      toast({
        title: 'Erro ao registrar parada',
        description: 'Não foi possível salvar a parada. Tente novamente.',
        variant: 'destructive'
      })
    }
  }

  const handleNovaParada = () => {
    setMostrarFormularioParada(true)
  }

  // ==================== Handlers do Header CRUD ====================
  const handleVoltar = () => {
    navigate('/oee-turno')
  }

  const handleAjuda = () => {
    navigate('/whats-new-oee')
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
        userName={user?.usuario || 'Usuário'}
        userRole={user?.perfil || 'Operador'}
        onLogout={signOut}
      />

      {/* Header CRUD */}
      <div className="bg-background-light dark:bg-background-dark">
        <div className="flex justify-center">
          <div className="w-full max-w-[1600px] px-3.5 pr-4 pt-3.5 pb-0">
            <div className="flex items-center justify-between gap-4">
              {/* Seção Esquerda - Título e Subtítulo */}
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-brand-primary truncate">
                  Diário de Bordo{oeeTurnoId ? `: [${oeeTurnoId}]` : ''}
                </h1>
                <p className="text-brand-text-secondary truncate">
                  Registro de produção, qualidade e paradas
                </p>
              </div>

              {/* Seção Direita - Botões de Ação */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex items-center justify-center gap-2 !bg-white !text-brand-primary !border-brand-primary hover:!bg-gray-50 hover:!border-brand-primary hover:!text-brand-primary min-h-10 px-4"
                  onClick={handleVoltar}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>

                {/* Dropdown de Complemento */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                    className="flex items-center justify-center gap-2 !bg-brand-primary !text-white !border-brand-primary hover:!bg-brand-primary/90 hover:!border-brand-primary/90 hover:!text-white min-h-10 px-4"
                    >
                    <FileText className="h-4 w-4" />
                      Complemento
                    <ChevronDownIcon className="h-4 w-4" />
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
                    <DropdownMenuItem onClick={handleAjuda}>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Ajuda
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="destructive"
                  className="flex items-center justify-center gap-2 min-h-10 px-4"
                  onClick={handleExcluir}
                >
                  <Trash className="h-4 w-4" />
                  Excluir
                </Button>

                <Button
                  className="flex items-center justify-center gap-2 !bg-brand-primary !text-white !border-brand-primary hover:!bg-brand-primary/90 hover:!border-brand-primary/90 hover:!text-white min-h-10 px-4"
                  onClick={handleSalvar}
                >
                  <Save className="h-4 w-4" />
                  Salvar
                </Button>

                <Button
                  className="flex items-center justify-center gap-2 !bg-brand-primary !text-white !border-brand-primary hover:!bg-brand-primary/90 hover:!border-brand-primary/90 hover:!text-white min-h-10 px-4"
                  onClick={handleAjuda}
                >
                  <HelpCircle className="h-4 w-4" />
                  Ajuda
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
          <div className="flex-grow flex flex-col min-w-0">
            {/* Main Content */}
            <main className="flex-grow p-4 pr-2 bg-background-light dark:bg-background-dark">
          {/* Dashboard OEE - Cabeçalho com Filtros */}
          <div className="flex-grow bg-white dark:bg-white p-4 pr-2 shadow-sm border-b border-border-light dark:border-border-dark mb-6">
            <div className="flex flex-col gap-y-4">
              {/* Primeira linha: Data, Turno, Hora Inicial, Hora Final */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-2">
                <div className="md:col-span-2 flex flex-col gap-1.5">
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
                <div className="md:col-span-6">
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
                <div className="md:col-span-2">
                  <span className="block text-sm font-medium text-muted-foreground mb-1.5">Hora Inicial</span>
                  <div className="relative">
                    <Input
                      type="text"
                      value={turnoHoraInicial}
                      onChange={(e) => setTurnoHoraInicial(limparHoraDigitada(e.target.value))}
                      onBlur={(e) => setTurnoHoraInicial(normalizarHoraDigitada(e.target.value, true))}
                      disabled={cabecalhoBloqueado}
                      placeholder="00:00"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={5}
                      className="bg-background-light dark:bg-background-dark pr-9 [&::-webkit-calendar-picker-indicator]:hidden"
                    />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Hora Final do Turno */}
                <div className="md:col-span-2">
                  <span className="block text-sm font-medium text-muted-foreground mb-1.5">Hora Final</span>
                  <div className="relative">
                    <Input
                      type="text"
                      value={turnoHoraFinal}
                      onChange={(e) => setTurnoHoraFinal(limparHoraDigitada(e.target.value))}
                      onBlur={(e) => setTurnoHoraFinal(normalizarHoraDigitada(e.target.value, true))}
                      disabled={cabecalhoBloqueado}
                      placeholder="00:00"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={5}
                      className="bg-background-light dark:bg-background-dark pr-9 [&::-webkit-calendar-picker-indicator]:hidden"
                    />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
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

                {/* Botão Lotes - disponível quando o turno está iniciado ou encerrado */}
                {(statusTurno === 'INICIADO' || statusTurno === 'ENCERRADO') && !editandoCabecalho && (
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
                <AlertDialogTitle>
                  {exclusaoBloqueada ? 'Exclusão Bloqueada' : 'Confirmar Exclusão de Registro'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {exclusaoBloqueada ? (
                    <>
                      {mensagemExclusaoBloqueada || mensagemTurnoEncerrado}
                      {registroParaExcluir && (
                        <span className="block mt-2 font-medium text-text-primary-light dark:text-text-primary-dark">
                          Registro: {historicoProducao.find(r => r.id === registroParaExcluir)?.dataHoraRegistro}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      Tem certeza que deseja excluir este registro de produção? Esta ação não pode ser desfeita.
                      {registroParaExcluir && (
                        <span className="block mt-2 font-medium text-text-primary-light dark:text-text-primary-dark">
                          Registro: {historicoProducao.find(r => r.id === registroParaExcluir)?.dataHoraRegistro}
                        </span>
                      )}
                    </>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                {exclusaoBloqueada ? (
                  <AlertDialogAction onClick={cancelarExclusao}>Fechar</AlertDialogAction>
                ) : (
                  <>
                    <AlertDialogCancel onClick={cancelarExclusao}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleExcluirProducao}
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                      Confirmar Exclusão
                    </AlertDialogAction>
                  </>
                )}
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
                  className={`bg-white dark:bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-primary border cursor-pointer hover:shadow-md transition-shadow ${
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
                    Registro de perdas
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
                            <th className="px-2 py-3 text-left font-medium w-24">Hora Início</th>
                            <th className="px-2 py-3 text-left font-medium w-24">Hora Fim</th>
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
                              <td className="px-2 py-3">
                                <Input
											type="text"
											value={formatarHoraPtBr(linha.horaInicio, false)}
                                  readOnly
                                  disabled={linha.editavel === false}
											inputMode="numeric"
                                  className={`w-20 ${linha.editavel === false ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                />
                              </td>
                              <td className="px-2 py-3">
                                <Input
											type="text"
											value={formatarHoraPtBr(linha.horaFim, false)}
                                  readOnly
                                  disabled={linha.editavel === false}
											inputMode="numeric"
                                  className={`w-20 ${linha.editavel === false ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <Input
                                  type="number"
                                  value={linha.quantidadeProduzida}
                                  onChange={(e) => atualizarQuantidadeLinha(linha.id, e.target.value)}
                                  className={`w-48 ${linha.editavel === false ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                  disabled={statusTurno !== 'INICIADO' || linha.editavel === false}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap items-center justify-center gap-2">
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
                                        quantidadeProduzidaInvalida(linha.quantidadeProduzida)
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
                                      quantidadeProduzidaInvalida(linha.quantidadeProduzida) ||
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
                                      quantidadeProduzidaInvalida(linha.quantidadeProduzida)
                                    }
                                  >
                                    <Trash className="h-4 w-4 mr-1" />
                                    Excluir
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAbrirAnotacoes(linha)}
                                    className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    title="Anotações"
                                    disabled={
                                      !linha.apontamentoId ||
                                      quantidadeProduzidaInvalida(linha.quantidadeProduzida)
                                    }
                                  >
                                    <StickyNote className="h-4 w-4 mr-1" />
                                    Anotações
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
							<td className="px-1 py-2 whitespace-nowrap">{formatarHoraPtBr(registro.horaInicio, false)}</td>
							<td className="px-1 py-2 whitespace-nowrap">{formatarHoraPtBr(registro.horaFim, false)}</td>
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
                    <div className="flex flex-wrap items-end gap-3">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="loss-quantity">
                          Quantidade
                        </label>
                        <input
                          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-48"
                          id="loss-quantity"
                          type="text"
                          inputMode="decimal"
                          placeholder="ex: 1.234,56"
                          value={quantidadePerdas}
                          onChange={(e) => setQuantidadePerdas(formatarPerdaPtBr(e.target.value))}
                        />
                      </div>

                      <button
                        className="h-9 bg-primary text-white font-semibold px-4 rounded-md hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                        type="button"
                        onClick={qualidadeEmEdicao ? handleSalvarEdicaoQualidade : handleAdicionarQualidade}
                        disabled={statusTurno !== 'INICIADO' || salvandoQualidade}
                      >
                        {salvandoQualidade ? (
                          <Timer className="h-5 w-5 animate-spin" />
                        ) : qualidadeEmEdicao ? (
                          <Save className="h-5 w-5" />
                        ) : (
                          <CheckCircle className="h-5 w-5" />
                        )}
                        {salvandoQualidade
                          ? (qualidadeEmEdicao ? 'Salvando...' : 'Registrando...')
                          : (qualidadeEmEdicao ? 'Salvar Perda' : 'Registrar Perda')}
                      </button>
                      {qualidadeEmEdicao && (
                        <button
                          className="h-9 border border-input text-foreground font-semibold px-4 rounded-md hover:bg-muted transition-colors flex items-center justify-center gap-2"
                          type="button"
                          onClick={cancelarEdicaoQualidade}
                          disabled={salvandoQualidade}
                        >
                          <X className="h-5 w-5" />
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
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
                      </tr>
                    </thead>
                    <tbody>
                      {historicoQualidadeAtivo.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-1 py-4 text-center text-muted-foreground">
                            Nenhum registro de qualidade encontrado
                          </td>
                        </tr>
                      ) : (
                        <>
                          {historicoQualidadeAtivo.map((registro) => (
                            <tr
                              key={registro.id}
                              className={`bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark`}
                            >
                              <td className="px-1 py-2 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => iniciarEdicaoQualidade(registro)}
                                    className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
                                    title="Editar registro"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => confirmarExclusaoQualidade(registro.id)}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    title="Excluir registro"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
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
                            </tr>
                          ))}
                          <tr className="bg-muted/40 border-t border-border-light dark:border-border-dark">
                            <td className="px-1 py-2 text-right font-semibold" colSpan={3}>
                              Total
                            </td>
                            <td className="px-1 py-2 text-right font-semibold whitespace-nowrap">
                              {formatarQuantidade(totalQuantidadeQualidade)}
                            </td>
                          </tr>
                        </>
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
                        <p><span className="font-medium">Parada:</span> {paradaSelecionada.parada || 'N/A'}</p>
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
                        type="text"
                        value={horaInicialParada}
                        onChange={(e) => setHoraInicialParada(limparHoraDigitada(e.target.value))}
                        onBlur={(e) => setHoraInicialParada(normalizarHoraDigitada(e.target.value, true))}
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={5}
                      />
                    </div>

                    {/* Hora Final */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="hora-final-parada">
                      Hora Final
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        className="w-36 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="hora-final-parada"
                        type="text"
                        value={horaFinalParada}
                        onChange={(e) => setHoraFinalParada(limparHoraDigitada(e.target.value))}
                        onBlur={(e) => setHoraFinalParada(normalizarHoraDigitada(e.target.value, true))}
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={5}
                      />
                      <button
                        type="button"
                        onClick={() => setModalAjudaViradaParadaAberto(true)}
                        className="inline-flex items-center justify-center h-6 w-6 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        title="Entenda a virada de meia-noite"
                        aria-label="Ajuda sobre virada de meia-noite"
                      >
                        <Info className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                      </button>
                    </div>
                  </div>
                  </div>

                  {/* Exibir duração calculada automaticamente */}
                  {horaInicialParadaNormalizada && horaFinalParadaNormalizada && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Duração calculada: {(() => {
                          const [horaIni, minIni] = horaInicialParadaNormalizada.split(':').map(Number)
                          const [horaFin, minFin] = horaFinalParadaNormalizada.split(':').map(Number)
                          const minutosInicio = horaIni * 60 + minIni
                          let minutosFim = horaFin * 60 + minFin
                          if (minutosFim < minutosInicio) {
                            minutosFim += 24 * 60
                          }
                          const duracaoMinutos = minutosFim - minutosInicio

                          if (duracaoMinutos <= 0) {
                            return 'Hora final deve ser diferente da hora inicial'
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
        <div className="w-80 lg:w-96 xl:w-[28rem] flex-shrink-0 pl-2 pr-4 py-4 bg-background-light dark:bg-background-dark self-start sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto">

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
            <div className="w-full">
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
        paradasGerais={paradasGerais}
        carregando={carregandoParadas}
        erro={erroParadas}
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
                    {formatarPercentual(oeeCalculado.qualidade)}% - Percentual de produtos sem defeitos
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

      {/* Modal de Ajuda: Virada de Meia-noite nas Paradas */}
      <Dialog open={modalAjudaViradaParadaAberto} onOpenChange={setModalAjudaViradaParadaAberto}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Info className="w-5 h-5 text-blue-500" />
              Virada de Meia-noite
            </DialogTitle>
            <DialogDescription>
              Como o sistema interpreta horários de parada que atravessam o dia.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-sm text-muted-foreground">
            <p>
              Se a hora final for menor que a hora inicial, a parada é interpretada
              como continuando no dia seguinte e o sistema soma 24 horas para
              calcular a duração.
            </p>
            <p>
              Exemplo: hora inicial 23:10 e hora final 00:20 resultam em 1h10
              (70 minutos).
            </p>
            <p>
              Se a hora final for igual à hora inicial, o registro é bloqueado.
            </p>
            <p>
              As colunas <span className="font-medium">hora_inicio</span> e{' '}
              <span className="font-medium">hora_fim</span> guardam apenas horários;
              a data exibida no histórico vem da data do turno no cabeçalho (campo Data).
            </p>
          </div>

          <DialogFooter>
            <Button type="button" onClick={() => setModalAjudaViradaParadaAberto(false)}>
              Entendi
            </Button>
          </DialogFooter>
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
        <DialogContent className="sm:max-w-[1296px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Controle de Lotes
            </DialogTitle>
            <DialogDescription>
              {statusTurno === 'ENCERRADO' 
                ? 'Visualize os lotes de produção do turno encerrado. O turno está encerrado, portanto não é possível adicionar ou editar lotes.'
                : 'Visualize e gerencie os lotes de produção do turno atual. Utilize o botão abaixo para adicionar novos lotes.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
            {/* Botão para adicionar novo lote */}
            {statusTurno !== 'ENCERRADO' && (
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
            )}

            {/* Formulário inline para adicionar/editar lote */}
            {formularioLoteAberto && statusTurno !== 'ENCERRADO' && (
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
                    type="text"
                    value={dataLoteDigitada}
                    onChange={(e) => {
                      const valorFormatado = formatarDataDigitada(e.target.value)
                      setDataLoteDigitada(valorFormatado)
                      const dataIso = converterDataBrParaIso(valorFormatado)
                      setDadosLote(prev => ({ ...prev, data: dataIso }))
                    }}
                    onBlur={(e) => {
                      const valorFormatado = formatarDataDigitada(e.target.value)
                      const dataIso = converterDataBrParaIso(valorFormatado)
                      if (dataIso) {
                        setDataLoteDigitada(formatarDataIsoParaBr(dataIso))
                        setDadosLote(prev => ({ ...prev, data: dataIso }))
                        return
                      }
                      setDataLoteDigitada(valorFormatado)
                      setDadosLote(prev => ({ ...prev, data: '' }))
                    }}
                    inputMode="numeric"
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
                      type="text"
                      value={dadosLote.horaInicial}
                      onChange={(e) => setDadosLote(prev => ({ ...prev, horaInicial: limparHoraDigitada(e.target.value) }))}
                      onBlur={(e) => setDadosLote(prev => ({ ...prev, horaInicial: normalizarHoraDigitada(e.target.value, true) }))}
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={5}
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
                      type="text"
                      value={dadosLote.horaFinal}
                      onChange={(e) => setDadosLote(prev => ({ ...prev, horaFinal: limparHoraDigitada(e.target.value) }))}
                      onBlur={(e) => setDadosLote(prev => ({ ...prev, horaFinal: normalizarHoraDigitada(e.target.value, true) }))}
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={5}
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
                      value={dadosLote.quantidadeProduzidaInicial ?? ''}
                      onChange={(e) => {
                        const valor = e.target.value === '' ? 0 : parseInt(e.target.value, 10)
                        setDadosLote(prev => ({
                          ...prev,
                          quantidadeProduzidaInicial: isNaN(valor) ? 0 : valor
                        }))
                      }}
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
                      value={dadosLote.quantidadeProduzidaFinal ?? ''}
                      onChange={(e) => {
                        const valor = e.target.value === '' ? 0 : parseInt(e.target.value, 10)
                        setDadosLote(prev => ({
                          ...prev,
                          quantidadeProduzidaFinal: isNaN(valor) ? 0 : valor
                        }))
                      }}
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
                      <TableHead className="font-semibold text-right">Total Produção</TableHead>
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
                        <TableCell className="font-semibold text-right">
                          {((lote.quantidadeProduzida ?? 0) - (lote.quantidadePerdas ?? 0)).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          {statusTurno !== 'ENCERRADO' ? (
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
                          ) : (
                            <div className="flex items-center justify-center text-muted-foreground text-xs">
                              Consulta
                            </div>
                          )}
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
                      <TableCell className="font-semibold text-right">
                        {(calcularTotaisLotes().totalProduzido - calcularTotaisLotes().totalPerdas).toLocaleString('pt-BR')}
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
        produtos={produtosSKU}
        loading={carregandoProdutosSKU}
        erro={erroProdutosSKU}
        onRecarregar={buscarProdutosSKU}
      />

      {/* Alert Dialog: SKU Bloqueado */}
      <AlertDialog open={modalSKUBloqueadoAberto} onOpenChange={setModalSKUBloqueadoAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Produto Bloqueado
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              O produto <strong>{skuBloqueadoInfo?.codigo}</strong> - {skuBloqueadoInfo?.descricao} está bloqueado e não pode ser selecionado.
              <br />
              <br />
              Por favor, selecione outro produto para continuar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setModalSKUBloqueadoAberto(false)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog: Linha de Produção Inativa */}
      <AlertDialog open={modalLinhaInativaAberto} onOpenChange={setModalLinhaInativaAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Linha de Produção Inativa
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              A linha de produção <strong>{linhaInativaInfo?.id}</strong> - {linhaInativaInfo?.nome} está inativa e não pode ser selecionada.
              <br />
              <br />
              Por favor, selecione uma linha ativa para continuar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setModalLinhaInativaAberto(false)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Busca de Linha de Produção */}
      <ModalBuscaLinhaProducao
        aberto={modalBuscaLinhaAberto}
        onFechar={() => setModalBuscaLinhaAberto(false)}
        onSelecionarLinha={handleSelecionarLinhaModal}
      />

      {/* Modal de Anotações da Linha de Produção */}
      <Dialog open={modalAnotacoesAberto} onOpenChange={(open) => {
        if (!open) handleFecharModalAnotacoes()
      }}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <StickyNote className="h-5 w-5 text-blue-500" />
              Anotações do Registro de Produção
            </DialogTitle>
            <DialogDescription>
              Adicione observações ou anotações adicionais sobre este registro de produção.
              As anotações são salvas seguindo os princípios ALCOA+ (com timestamp e usuário).
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Lado Esquerdo - Informações do Registro */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Informações do Registro
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Linha:</span>
                  <span className="text-sm">{linhaNome || 'Não definida'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Turno:</span>
                  <span className="text-sm">{turnoNome || turno || 'Não definido'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Data:</span>
                  <span className="text-sm">{data ? format(data, 'dd/MM/yyyy', { locale: ptBR }) : 'Não definida'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Produto (SKU):</span>
                  <span className="text-sm">{skuCodigo || 'Não definido'}</span>
                </div>
                {linhaAnotacaoSelecionada && (
                  <>
                    <hr className="border-gray-200 dark:border-gray-700" />
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Hora Início:</span>
                      <span className="text-sm">{linhaAnotacaoSelecionada.horaInicio}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Hora Fim:</span>
                      <span className="text-sm">{linhaAnotacaoSelecionada.horaFim}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Quantidade:</span>
                      <span className="text-sm font-bold text-green-600">
                        {formatarQuantidade(Number(linhaAnotacaoSelecionada.quantidadeProduzida))}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Lado Direito - Textarea para Anotações */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Anotações / Observações
              </h3>
              <div className="space-y-2">
                <Label htmlFor="anotacao" className="sr-only">Anotação</Label>
                <textarea
                  id="anotacao"
                  placeholder="Digite aqui suas anotações ou observações sobre este registro de produção..."
                  value={textoAnotacao}
                  onChange={(e) => setTextoAnotacao(e.target.value)}
                  className="w-full min-h-[200px] p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  disabled={salvandoAnotacao}
                />
                <p className="text-xs text-muted-foreground">
                  {textoAnotacao.length} caracteres
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleFecharModalAnotacoes}
              disabled={salvandoAnotacao}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSalvarAnotacao}
              disabled={salvandoAnotacao}
              className="bg-primary hover:bg-primary/90"
            >
              {salvandoAnotacao ? (
                <>
                  <Timer className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Anotação
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
