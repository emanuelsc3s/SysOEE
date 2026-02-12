/**
 * Página Dashboard - Visualização de OEE e cards por linha
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertTriangle, Calendar as CalendarIcon, ChevronDown, Filter, Info, Loader2, RefreshCw, Pause, Play, Sun, Moon, ArrowLeft, Video } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { useTheme } from '@/hooks/useTheme'
import { AppHeader } from '@/components/layout/AppHeader'
import { ParetoParadasChart, type ParetoParadaChartItem } from '@/components/charts/ParetoParadasChart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

type TurnoOption = {
  turno_id: number
  codigo: string
  turno: string | null
  hora_inicio: string | null
  hora_fim: string | null
}

type LinhaOption = {
  linhaproducao_id: number
  linhaproducao: string | null
  camera: string | null
}

type ProdutoOption = {
  produto_id: number
  referencia: string | null
  descricao: string | null
}

type OeeLinhaRow = {
  linhaproducao_id: number
  linhaproducao: string | null
  disponibilidade: number
  performance: number
  qualidade: number
  oee: number
}

type OeeLinhaRpc = {
  linhaproducao_id: number | string | null
  linhaproducao: string | null
  disponibilidade: number | string | null
  performance: number | string | null
  qualidade: number | string | null
  oee: number | string | null
}

type ComponentesOeeRpc = {
  unidades_produzidas?: number | string | null
  unidades_perdas?: number | string | null
  unidades_boas?: number | string | null
  tempo_operacional_liquido?: number | string | null
  tempo_valioso?: number | string | null
  tempo_disponivel_horas?: number | string | null
  tempo_estrategico_horas?: number | string | null
  tempo_paradas_grandes_horas?: number | string | null
  tempo_operacao_horas?: number | string | null
  disponibilidade?: number | string | null
  performance?: number | string | null
  qualidade?: number | string | null
  oee?: number | string | null
}

type ComponentesOeeDetalhe = {
  unidadesProduzidas: number
  unidadesPerdas: number
  unidadesBoas: number
  tempoOperacionalLiquido: number
  tempoValioso: number
  tempoDisponivelHoras: number
  tempoEstrategicoHoras: number
  tempoParadasGrandesHoras: number
  tempoOperacaoHoras: number
  disponibilidade: number
  performance: number
  qualidade: number
  oee: number
}

type ParetoParadaRpc = {
  parada?: string | null
  quantidade?: number | string | null
  tempo_parada_horas?: number | string | null
  percentual?: number | string | null
  percentual_acumulado?: number | string | null
}

type FiltrosDashboard = {
  linhaIds: string[]
  produtoId: string
  turnoId: string
  dataInicio: string
  dataFim: string
}

const TEMPO_DISPONIVEL_PADRAO = 12
const MENSAGEM_PERMISSAO_CAMERA = 'Usuário de Nível Operador sem permissão para visualizar cameras'

const formatarPercentual = (valor: number): string => {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatarQuantidade = (quantidade: number): string => {
  return quantidade.toLocaleString('pt-BR')
}

const formatarNumeroDecimal = (valor: number, casas = 2): string => {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas
  })
}

const parseNumero = (valor: unknown): number => {
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : 0
  }

  if (valor === null || valor === undefined) {
    return 0
  }

  if (typeof valor === 'string') {
    const limpo = valor.trim().replace('%', '').replace(/\s+/g, '')
    if (!limpo) {
      return 0
    }

    if (limpo.includes(',') && limpo.includes('.')) {
      const normalizado = limpo.replace(/\./g, '').replace(',', '.')
      const parsed = Number.parseFloat(normalizado)
      return Number.isFinite(parsed) ? parsed : 0
    }

    if (limpo.includes(',')) {
      const parsed = Number.parseFloat(limpo.replace(',', '.'))
      return Number.isFinite(parsed) ? parsed : 0
    }

    const parsed = Number.parseFloat(limpo)
    return Number.isFinite(parsed) ? parsed : 0
  }

  const parsed = Number(valor)
  return Number.isFinite(parsed) ? parsed : 0
}

const mapearComponentesOee = (registro: ComponentesOeeRpc | null): ComponentesOeeDetalhe | null => {
  if (!registro) {
    return null
  }

  const unidadesProduzidas = parseNumero(registro.unidades_produzidas)
  const unidadesPerdas = parseNumero(registro.unidades_perdas)
  const unidadesBoas =
    registro.unidades_boas === null || registro.unidades_boas === undefined
      ? Math.max(unidadesProduzidas - unidadesPerdas, 0)
      : parseNumero(registro.unidades_boas)

  const tempoDisponivelHoras = parseNumero(registro.tempo_disponivel_horas)
  const tempoEstrategicoHoras = parseNumero(registro.tempo_estrategico_horas)
  const tempoParadasGrandesHoras = parseNumero(registro.tempo_paradas_grandes_horas)
  const tempoOperacaoHoras =
    registro.tempo_operacao_horas === null || registro.tempo_operacao_horas === undefined
      ? Math.max(tempoDisponivelHoras - tempoEstrategicoHoras - tempoParadasGrandesHoras, 0)
      : parseNumero(registro.tempo_operacao_horas)

  const tempoOperacionalLiquido = parseNumero(registro.tempo_operacional_liquido)
  const tempoValioso =
    registro.tempo_valioso === null || registro.tempo_valioso === undefined
      ? (unidadesProduzidas > 0 ? (unidadesBoas / unidadesProduzidas) * tempoOperacionalLiquido : 0)
      : parseNumero(registro.tempo_valioso)

  const disponibilidade =
    registro.disponibilidade === null || registro.disponibilidade === undefined
      ? (tempoDisponivelHoras - tempoEstrategicoHoras) > 0
        ? (tempoOperacaoHoras / (tempoDisponivelHoras - tempoEstrategicoHoras)) * 100
        : 0
      : parseNumero(registro.disponibilidade)

  const performance =
    registro.performance === null || registro.performance === undefined
      ? tempoOperacaoHoras > 0
        ? Math.min((tempoOperacionalLiquido / tempoOperacaoHoras) * 100, 100)
        : 0
      : parseNumero(registro.performance)

  const qualidade =
    registro.qualidade === null || registro.qualidade === undefined
      ? unidadesProduzidas > 0
        ? (unidadesBoas / unidadesProduzidas) * 100
        : 100
      : parseNumero(registro.qualidade)

  const oee =
    registro.oee === null || registro.oee === undefined
      ? (disponibilidade / 100) * (performance / 100) * (qualidade / 100) * 100
      : parseNumero(registro.oee)

  return {
    unidadesProduzidas,
    unidadesPerdas,
    unidadesBoas,
    tempoOperacionalLiquido,
    tempoValioso,
    tempoDisponivelHoras,
    tempoEstrategicoHoras,
    tempoParadasGrandesHoras,
    tempoOperacaoHoras,
    disponibilidade,
    performance,
    qualidade,
    oee
  }
}

const formatarDataDigitada = (valor: string): string => {
  const texto = valor.trim()
  const matchIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (matchIso) {
    return `${matchIso[3]}/${matchIso[2]}/${matchIso[1]}`
  }

  const numeros = texto.replace(/\D/g, '').slice(0, 8)
  if (!numeros) {
    return ''
  }

  const partes: string[] = []
  partes.push(numeros.slice(0, 2))
  if (numeros.length > 2) {
    partes.push(numeros.slice(2, 4))
  }
  if (numeros.length > 4) {
    partes.push(numeros.slice(4, 8))
  }
  return partes.join('/')
}

const converterDataParaIso = (valor: string): string | null => {
  const texto = valor.trim()
  if (!texto) {
    return null
  }

  const matchIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (matchIso) {
    return texto
  }

  const matchBr = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!matchBr) {
    return null
  }

  const dia = Number(matchBr[1])
  const mes = Number(matchBr[2])
  const ano = Number(matchBr[3])
  const data = new Date(ano, mes - 1, dia)

  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {
    return null
  }

  return `${matchBr[3]}-${matchBr[2]}-${matchBr[1]}`
}

const parseDataParaDate = (valor: string): Date | undefined => {
  const texto = valor.trim()
  if (!texto) {
    return undefined
  }

  const matchBr = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  const matchIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  const dia = matchBr ? Number(matchBr[1]) : matchIso ? Number(matchIso[3]) : NaN
  const mes = matchBr ? Number(matchBr[2]) : matchIso ? Number(matchIso[2]) : NaN
  const ano = matchBr ? Number(matchBr[3]) : matchIso ? Number(matchIso[1]) : NaN

  if (!Number.isFinite(dia) || !Number.isFinite(mes) || !Number.isFinite(ano)) {
    return undefined
  }

  const data = new Date(ano, mes - 1, dia)
  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {
    return undefined
  }

  return data
}

const normalizarTexto = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

/**
 * Retorna uma cor em gradiente baseada no percentual do indicador.
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

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [linhas, setLinhas] = useState<LinhaOption[]>([])
  const [produtos, setProdutos] = useState<ProdutoOption[]>([])
  const [turnos, setTurnos] = useState<TurnoOption[]>([])
  const [listasCarregadas, setListasCarregadas] = useState(false)
  const [periodoInicializado, setPeriodoInicializado] = useState(false)
  const periodoInicializadoRef = useRef(false)
  const campoBuscaLinhaRef = useRef<HTMLInputElement | null>(null)

  const [filtros, setFiltros] = useState<FiltrosDashboard>({
    linhaIds: [],
    produtoId: 'todos',
    turnoId: 'todos',
    dataInicio: '',
    dataFim: ''
  })

  const [carregandoListas, setCarregandoListas] = useState(true)
  const [carregandoDados, setCarregandoDados] = useState(false)
  const [erroDados, setErroDados] = useState<string | null>(null)
  const [dadosOee, setDadosOee] = useState<OeeLinhaRow[]>([])
  const [calendarioInicioAberto, setCalendarioInicioAberto] = useState(false)
  const [calendarioFimAberto, setCalendarioFimAberto] = useState(false)
  const [menuLinhaAberto, setMenuLinhaAberto] = useState(false)
  const [buscaLinha, setBuscaLinha] = useState('')

  const [modalDetalhamentoAberto, setModalDetalhamentoAberto] = useState(false)
  const [linhaDetalheSelecionada, setLinhaDetalheSelecionada] = useState<OeeLinhaRow | null>(null)
  const [componentesOeeDetalhe, setComponentesOeeDetalhe] = useState<ComponentesOeeDetalhe | null>(null)
  const [carregandoDetalhamento, setCarregandoDetalhamento] = useState(false)
  const [erroDetalhamento, setErroDetalhamento] = useState<string | null>(null)
  const [modalParetoAberto, setModalParetoAberto] = useState(false)
  const [paretoParadas, setParetoParadas] = useState<ParetoParadaChartItem[]>([])
  const [carregandoPareto, setCarregandoPareto] = useState(false)
  const [erroPareto, setErroPareto] = useState<string | null>(null)
  const [modalCameraAberto, setModalCameraAberto] = useState(false)
  const [linhaCameraSelecionada, setLinhaCameraSelecionada] = useState<OeeLinhaRow | null>(null)
  const [carregandoCamera, setCarregandoCamera] = useState(false)
  const [erroCamera, setErroCamera] = useState<string | null>(null)
  const [cameraAguardandoFrame, setCameraAguardandoFrame] = useState(false)
  const [videoCameraPronto, setVideoCameraPronto] = useState(false)
  const [validandoPermissaoCamera, setValidandoPermissaoCamera] = useState(false)
  const [modalPermissaoCameraAberto, setModalPermissaoCameraAberto] = useState(false)
  const videoCameraRef = useRef<HTMLVideoElement | null>(null)
  const conexaoCameraRef = useRef<RTCPeerConnection | null>(null)

  // Estados para atualização automática
  const [atualizacaoAutomatica, setAtualizacaoAutomatica] = useState(false)
  const [intervaloSegundos, setIntervaloSegundos] = useState(30)
  const [contagemRegressiva, setContagemRegressiva] = useState(0)
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const contagemRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [filtrosAbertos, setFiltrosAbertos] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return window.matchMedia('(min-width: 640px)').matches
  })

  const carregarLinhas = useCallback(async () => {
    const { data, error } = await supabase
      .from('tblinhaproducao')
      .select('linhaproducao_id, linhaproducao, camera, bloqueado, deleted_at')
      .is('deleted_at', null)
      .or('bloqueado.eq.Não,bloqueado.is.null')
      .order('linhaproducao', { ascending: true })

    if (error) {
      throw error
    }

    setLinhas((data || []) as LinhaOption[])
  }, [])

  const carregarProdutos = useCallback(async () => {
    const { data, error } = await supabase
      .from('tbproduto')
      .select('produto_id, referencia, descricao')
      .eq('deletado', 'N')
      .order('referencia', { ascending: true })

    if (error) {
      throw error
    }

    setProdutos((data || []) as ProdutoOption[])
  }, [])

  const carregarTurnos = useCallback(async () => {
    const { data, error } = await supabase
      .from('tbturno')
      .select('turno_id, codigo, turno, hora_inicio, hora_fim')
      .eq('deletado', 'N')
      .order('codigo', { ascending: true })

    if (error) {
      throw error
    }

    const turnosCarregados = (data || []) as TurnoOption[]
    setTurnos(turnosCarregados)
  }, [])

  const carregarPeriodoInicial = useCallback(() => {
    const dataLocal = new Date()
    const dataFormatada = format(dataLocal, 'dd/MM/yyyy')

    setFiltros((prev) => {
      if (prev.dataInicio || prev.dataFim) {
        return prev
      }
      return {
        ...prev,
        dataInicio: dataFormatada,
        dataFim: dataFormatada
      }
    })

    setPeriodoInicializado(true)
  }, [])

  useEffect(() => {
    const carregarListas = async () => {
      try {
        setCarregandoListas(true)
        await Promise.all([carregarLinhas(), carregarProdutos(), carregarTurnos()])
        setListasCarregadas(true)
      } catch (error) {
        console.error('❌ Erro ao carregar filtros do dashboard:', error)
        toast({
          title: 'Erro ao carregar filtros',
          description: 'Não foi possível carregar linhas, turnos ou produtos.',
          variant: 'destructive'
        })
      } finally {
        setCarregandoListas(false)
      }
    }

    carregarListas()
  }, [carregarLinhas, carregarProdutos, carregarTurnos, toast])

  useEffect(() => {
    if (periodoInicializadoRef.current) {
      return
    }
    periodoInicializadoRef.current = true
    carregarPeriodoInicial()
  }, [carregarPeriodoInicial])

  useEffect(() => {
    if (menuLinhaAberto) {
      campoBuscaLinhaRef.current?.focus()
    }
  }, [menuLinhaAberto])

  useEffect(() => {
    if (!menuLinhaAberto && buscaLinha) {
      setBuscaLinha('')
    }
  }, [buscaLinha, menuLinhaAberto])

  const linhaIdsSelecionadas = useMemo(
    () =>
      filtros.linhaIds
        .map((linhaId) => Number(linhaId))
        .filter((linhaId) => Number.isFinite(linhaId)),
    [filtros.linhaIds]
  )

  const linhasFiltradas = useMemo(() => {
    const termo = normalizarTexto(buscaLinha.trim())
    if (!termo) {
      return linhas
    }

    return linhas.filter((linha) => {
      const textoLinha = normalizarTexto(`${linha.linhaproducao ?? ''} ${linha.linhaproducao_id}`)
      return textoLinha.includes(termo)
    })
  }, [buscaLinha, linhas])

  const resumoLinhasSelecionadas = useMemo(() => {
    if (filtros.linhaIds.length === 0) {
      return 'Todas as linhas'
    }

    if (filtros.linhaIds.length === 1) {
      const linhaIdSelecionada = filtros.linhaIds[0]
      const linhaSelecionada = linhas.find(
        (linha) => String(linha.linhaproducao_id) === linhaIdSelecionada
      )
      return linhaSelecionada?.linhaproducao || `Linha ${linhaIdSelecionada}`
    }

    return `${filtros.linhaIds.length} linhas selecionadas`
  }, [filtros.linhaIds, linhas])

  const turnoSelecionado = useMemo(() => {
    if (filtros.turnoId === 'todos') {
      return null
    }
    return (
      turnos.find((turno) => String(turno.turno_id) === filtros.turnoId) || null
    )
  }, [filtros.turnoId, turnos])

  const produtoSelecionado = useMemo(() => {
    if (filtros.produtoId === 'todos') {
      return null
    }
    return (
      produtos.find((produto) => String(produto.produto_id) === filtros.produtoId) || null
    )
  }, [filtros.produtoId, produtos])

  const parametrosRpc = useMemo(() => {
    const linhaIdUnica = linhaIdsSelecionadas.length === 1 ? linhaIdsSelecionadas[0] : null
    const produtoId = filtros.produtoId === 'todos' ? null : Number(filtros.produtoId)
    const turnoId = filtros.turnoId === 'todos' ? null : Number(filtros.turnoId)
    const dataInicioIso = converterDataParaIso(filtros.dataInicio)
    const dataFimIso = converterDataParaIso(filtros.dataFim)

    return {
      p_data_inicio: dataInicioIso,
      p_data_fim: dataFimIso,
      p_turno_id: Number.isFinite(turnoId) ? turnoId : null,
      p_produto_id: Number.isFinite(produtoId) ? produtoId : null,
      p_linhaproducao_id: Number.isFinite(linhaIdUnica) ? linhaIdUnica : null,
      p_tempo_disponivel_padrao: TEMPO_DISPONIVEL_PADRAO
    }
  }, [filtros, linhaIdsSelecionadas])

  const dataInicioSelecionada = useMemo(() => parseDataParaDate(filtros.dataInicio), [filtros.dataInicio])
  const dataFimSelecionada = useMemo(() => parseDataParaDate(filtros.dataFim), [filtros.dataFim])

  const detalhesComponentesOee = useMemo(() => {
    if (!componentesOeeDetalhe) {
      return null
    }

    const tempoDisponivelAjustado = Math.max(
      componentesOeeDetalhe.tempoDisponivelHoras - componentesOeeDetalhe.tempoEstrategicoHoras,
      0
    )
    const tempoOperacaoCalculado = Math.max(
      tempoDisponivelAjustado - componentesOeeDetalhe.tempoParadasGrandesHoras,
      0
    )
    const disponibilidadeCalculada = tempoDisponivelAjustado > 0
      ? (tempoOperacaoCalculado / tempoDisponivelAjustado) * 100
      : 0
    const performanceCalculada = tempoOperacaoCalculado > 0
      ? Math.min((componentesOeeDetalhe.tempoOperacionalLiquido / tempoOperacaoCalculado) * 100, 100)
      : 0
    const qualidadeCalculada = componentesOeeDetalhe.unidadesProduzidas > 0
      ? (componentesOeeDetalhe.unidadesBoas / componentesOeeDetalhe.unidadesProduzidas) * 100
      : 100
    const oeeCalculado =
      (disponibilidadeCalculada / 100) * (performanceCalculada / 100) * (qualidadeCalculada / 100) * 100

    return {
      tempoDisponivelAjustado,
      tempoOperacaoCalculado,
      disponibilidadeCalculada,
      performanceCalculada,
      qualidadeCalculada,
      oeeCalculado
    }
  }, [componentesOeeDetalhe])

  const periodoDescricao = useMemo(() => {
    if (!filtros.dataInicio || !filtros.dataFim) {
      return 'Período não definido'
    }
    if (filtros.dataInicio === filtros.dataFim) {
      return filtros.dataInicio
    }
    return `${filtros.dataInicio} a ${filtros.dataFim}`
  }, [filtros.dataFim, filtros.dataInicio])

  const podeAbrirPareto = Boolean(linhaDetalheSelecionada && componentesOeeDetalhe && !carregandoPareto)

  const carregarDadosOee = useCallback(async () => {
    if (!parametrosRpc.p_data_inicio || !parametrosRpc.p_data_fim) {
      return
    }

    if (parametrosRpc.p_data_inicio > parametrosRpc.p_data_fim) {
      setErroDados('A data inicial não pode ser maior que a data final.')
      setDadosOee([])
      return
    }

    try {
      setCarregandoDados(true)
      setErroDados(null)

      const { data, error } = await supabase.rpc('fn_calcular_oee_dashboard', parametrosRpc)

      if (error) {
        throw error
      }

      const dadosMapeados: OeeLinhaRow[] = (data || [])
        .map((linha: OeeLinhaRpc) => ({
          linhaproducao_id: Number(linha.linhaproducao_id),
          linhaproducao: linha.linhaproducao,
          disponibilidade: parseNumero(linha.disponibilidade),
          performance: parseNumero(linha.performance),
          qualidade: parseNumero(linha.qualidade),
          oee: parseNumero(linha.oee)
        }))
        .sort((a: OeeLinhaRow, b: OeeLinhaRow) => {
          if (b.oee !== a.oee) {
            return b.oee - a.oee
          }
          return (a.linhaproducao || '').localeCompare(b.linhaproducao || '', 'pt-BR', { sensitivity: 'base' })
        })

      const dadosFiltrados =
        linhaIdsSelecionadas.length > 0
          ? dadosMapeados.filter((linha) => linhaIdsSelecionadas.includes(linha.linhaproducao_id))
          : dadosMapeados

      setDadosOee(dadosFiltrados)
    } catch (error) {
      console.error('❌ Erro ao buscar OEE no dashboard:', error)
      setErroDados('Não foi possível carregar o OEE para os filtros selecionados.')
      setDadosOee([])
    } finally {
      setCarregandoDados(false)
    }
  }, [linhaIdsSelecionadas, parametrosRpc])

  useEffect(() => {
    if (!listasCarregadas || !periodoInicializado) {
      return
    }
    carregarDadosOee()
  }, [carregarDadosOee, listasCarregadas, periodoInicializado])

  // Efeito para atualização automática
  useEffect(() => {
    // Limpar intervalos anteriores
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current)
      intervaloRef.current = null
    }
    if (contagemRef.current) {
      clearInterval(contagemRef.current)
      contagemRef.current = null
    }

    if (!atualizacaoAutomatica || !listasCarregadas || !periodoInicializado) {
      setContagemRegressiva(0)
      return
    }

    // Iniciar contagem regressiva
    setContagemRegressiva(intervaloSegundos)

    // Intervalo para atualizar os dados
    intervaloRef.current = setInterval(() => {
      carregarDadosOee()
      setContagemRegressiva(intervaloSegundos)
    }, intervaloSegundos * 1000)

    // Intervalo para decrementar a contagem regressiva a cada segundo
    contagemRef.current = setInterval(() => {
      setContagemRegressiva((prev) => (prev > 0 ? prev - 1 : intervaloSegundos))
    }, 1000)

    // Cleanup ao desmontar ou quando dependências mudarem
    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current)
        intervaloRef.current = null
      }
      if (contagemRef.current) {
        clearInterval(contagemRef.current)
        contagemRef.current = null
      }
    }
  }, [atualizacaoAutomatica, intervaloSegundos, listasCarregadas, periodoInicializado, carregarDadosOee])

  const atualizarFiltro = <T extends keyof FiltrosDashboard>(campo: T, valor: FiltrosDashboard[T]) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
  }

  const alternarLinhaSelecionada = (linhaId: string) => {
    setFiltros((prev) => {
      if (prev.linhaIds.includes(linhaId)) {
        return {
          ...prev,
          linhaIds: prev.linhaIds.filter((id) => id !== linhaId)
        }
      }

      return {
        ...prev,
        linhaIds: [...prev.linhaIds, linhaId]
      }
    })
  }

  const handleIntervaloChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const valor = event.target.value.replace(/\D/g, '')
    if (!valor) {
      setIntervaloSegundos(5)
      return
    }
    const numero = Math.max(5, Math.min(300, Number(valor)))
    setIntervaloSegundos(numero)
  }

  const alternarAtualizacaoAutomatica = () => {
    setAtualizacaoAutomatica((prev) => !prev)
  }

  const handleAtualizarIndicadores = useCallback(() => {
    carregarDadosOee()
  }, [carregarDadosOee])

  const abrirDetalhamentoLinha = useCallback(
    async (linha: OeeLinhaRow) => {
      if (carregandoDetalhamento) {
        return
      }

      const dataInicioIso = converterDataParaIso(filtros.dataInicio)
      const dataFimIso = converterDataParaIso(filtros.dataFim)

      if (!dataInicioIso || !dataFimIso) {
        toast({
          title: 'Período inválido',
          description: 'Informe uma data de início e fim válidas para consultar o detalhamento.',
          variant: 'destructive'
        })
        return
      }

      if (dataInicioIso > dataFimIso) {
        toast({
          title: 'Período inválido',
          description: 'A data inicial não pode ser maior que a data final.',
          variant: 'destructive'
        })
        return
      }

      const turnoId = filtros.turnoId === 'todos' ? null : Number(filtros.turnoId)
      const produtoId = filtros.produtoId === 'todos' ? null : Number(filtros.produtoId)

      setLinhaDetalheSelecionada(linha)
      setModalDetalhamentoAberto(true)
      setCarregandoDetalhamento(true)
      setErroDetalhamento(null)
      setComponentesOeeDetalhe(null)

      try {
        const { data, error } = await supabase.rpc('fn_calcular_oee_dashboard', {
          p_data_inicio: dataInicioIso,
          p_data_fim: dataFimIso,
          p_turno_id: Number.isFinite(turnoId) ? turnoId : null,
          p_produto_id: Number.isFinite(produtoId) ? produtoId : null,
          p_linhaproducao_id: linha.linhaproducao_id,
          p_tempo_disponivel_padrao: TEMPO_DISPONIVEL_PADRAO,
          p_oeeturno_id: null
        })

        if (error) {
          throw error
        }

        const registro = Array.isArray(data) ? data[0] : data
        const detalhes = mapearComponentesOee((registro || null) as ComponentesOeeRpc | null)

        if (!detalhes) {
          setErroDetalhamento('Nenhum dado encontrado para a linha selecionada.')
        } else {
          setComponentesOeeDetalhe(detalhes)
        }
      } catch (error) {
        console.error('❌ Erro ao carregar detalhamento do OEE:', error)
        const mensagemErro = error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: string }).message)
          : ''
        const mensagemAmigavel = mensagemErro.includes('schema cache') && mensagemErro.includes('fn_calcular_oee_dashboard')
          ? 'A função fn_calcular_oee_dashboard não foi localizada no schema público. Verifique se ela foi criada no Supabase e se o parâmetro correto é p_oeeturno_id.'
          : 'Não foi possível carregar o detalhamento do OEE.'
        setErroDetalhamento(mensagemAmigavel)
      } finally {
        setCarregandoDetalhamento(false)
      }
    },
    [carregandoDetalhamento, filtros.dataFim, filtros.dataInicio, filtros.produtoId, filtros.turnoId, toast]
  )

  const abrirParetoParadas = useCallback(async () => {
    if (carregandoPareto || !linhaDetalheSelecionada) {
      return
    }

    const dataInicioIso = converterDataParaIso(filtros.dataInicio)
    const dataFimIso = converterDataParaIso(filtros.dataFim)

    if (!dataInicioIso || !dataFimIso) {
      toast({
        title: 'Período inválido',
        description: 'Informe uma data de início e fim válidas para consultar o Pareto.',
        variant: 'destructive'
      })
      return
    }

    if (dataInicioIso > dataFimIso) {
      toast({
        title: 'Período inválido',
        description: 'A data inicial não pode ser maior que a data final.',
        variant: 'destructive'
      })
      return
    }

    const turnoId = filtros.turnoId === 'todos' ? null : Number(filtros.turnoId)
    const produtoId = filtros.produtoId === 'todos' ? null : Number(filtros.produtoId)

    setModalParetoAberto(true)
    setCarregandoPareto(true)
    setErroPareto(null)
    setParetoParadas([])

    try {
      const { data, error } = await supabase.rpc('fn_calcular_pareto_paradas', {
        p_data_inicio: dataInicioIso,
        p_data_fim: dataFimIso,
        p_turno_id: Number.isFinite(turnoId) ? turnoId : null,
        p_produto_id: Number.isFinite(produtoId) ? produtoId : null,
        p_linhaproducao_id: linhaDetalheSelecionada.linhaproducao_id,
        p_tempo_disponivel_padrao: TEMPO_DISPONIVEL_PADRAO,
        p_oeeturno_id: null
      })

      if (error) {
        throw error
      }

      const dadosMapeados: ParetoParadaChartItem[] = (data || []).map((item: ParetoParadaRpc) => {
        const parada = (item.parada || '').trim()
        return {
          parada: parada || 'Parada não informada',
          quantidade: Math.max(0, Math.round(parseNumero(item.quantidade))),
          tempoParadaHoras: parseNumero(item.tempo_parada_horas),
          percentual: parseNumero(item.percentual),
          percentualAcumulado: parseNumero(item.percentual_acumulado)
        }
      })

      if (dadosMapeados.length === 0) {
        setErroPareto('Nenhuma parada grande encontrada para os filtros selecionados.')
      } else {
        setParetoParadas(dadosMapeados)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar Pareto de paradas:', error)
      const mensagemErro = error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: string }).message)
        : ''
      const mensagemAmigavel = mensagemErro.includes('schema cache') && mensagemErro.includes('fn_calcular_pareto_paradas')
        ? 'A função fn_calcular_pareto_paradas não foi localizada no schema público. Verifique se ela foi criada no Supabase.'
        : 'Não foi possível carregar o Pareto de paradas.'
      setErroPareto(mensagemAmigavel)
    } finally {
      setCarregandoPareto(false)
    }
  }, [carregandoPareto, filtros.dataFim, filtros.dataInicio, filtros.produtoId, filtros.turnoId, linhaDetalheSelecionada, toast])

  const handleModalDetalhamentoChange = (aberto: boolean) => {
    setModalDetalhamentoAberto(aberto)
    if (!aberto) {
      setErroDetalhamento(null)
      setComponentesOeeDetalhe(null)
      setLinhaDetalheSelecionada(null)
      setModalParetoAberto(false)
      setParetoParadas([])
      setErroPareto(null)
      setCarregandoPareto(false)
    }
  }

  const handleModalParetoChange = (aberto: boolean) => {
    setModalParetoAberto(aberto)
    if (!aberto) {
      setErroPareto(null)
      setParetoParadas([])
      setCarregandoPareto(false)
    }
  }

  const handleAbrirParetoKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      abrirParetoParadas()
    }
  }, [abrirParetoParadas])

  const obterSegmentoCameraPorLinhaId = useCallback((linhaproducaoId: number): string | null => {
    const cameraBruta = linhas.find((linha) => linha.linhaproducao_id === linhaproducaoId)?.camera
    const cameraNormalizada = (cameraBruta || '').trim().replace(/^\/+|\/+$/g, '')
    return cameraNormalizada || null
  }, [linhas])

  const obterUrlCameraWhepPorLinhaId = useCallback((linhaproducaoId: number): string | null => {
    const cameraBase = (import.meta.env.VITE_CAMERA_URL || '').trim().replace(/\/+$/g, '')
    const cameraSegmento = obterSegmentoCameraPorLinhaId(linhaproducaoId)

    if (!cameraBase || !cameraSegmento) {
      return null
    }

    return `${cameraBase}/${cameraSegmento}/whep`
  }, [obterSegmentoCameraPorLinhaId])

  const obterUrlCameraBasePorLinhaId = useCallback((linhaproducaoId: number): string | null => {
    const cameraBase = (import.meta.env.VITE_CAMERA_URL || '').trim().replace(/\/+$/g, '')
    const cameraSegmento = obterSegmentoCameraPorLinhaId(linhaproducaoId)

    if (!cameraBase || !cameraSegmento) {
      return null
    }

    return `${cameraBase}/${cameraSegmento}/`
  }, [obterSegmentoCameraPorLinhaId])

  const encerrarConexaoCamera = useCallback(() => {
    const conexao = conexaoCameraRef.current
    if (conexao) {
      conexao.ontrack = null
      conexao.getSenders().forEach((sender) => sender.track?.stop())
      conexao.getReceivers().forEach((receiver) => receiver.track?.stop())
      conexao.close()
      conexaoCameraRef.current = null
    }

    const video = videoCameraRef.current
    if (!video) {
      return
    }

    if (video.srcObject instanceof MediaStream) {
      video.srcObject.getTracks().forEach((track) => track.stop())
    }

    video.srcObject = null
  }, [])

  const definirVideoCameraRef = useCallback((elemento: HTMLVideoElement | null) => {
    videoCameraRef.current = elemento
    setVideoCameraPronto(Boolean(elemento))
  }, [])

  const iniciarStreamCamera = useCallback(async (linhaproducaoId: number) => {
    const cameraSegmento = obterSegmentoCameraPorLinhaId(linhaproducaoId)
    if (!cameraSegmento) {
      setErroCamera('Câmera não configurada para esta linha.')
      setCarregandoCamera(false)
      setCameraAguardandoFrame(false)
      return
    }

    const urlWhep = obterUrlCameraWhepPorLinhaId(linhaproducaoId)
    const urlBaseCamera = obterUrlCameraBasePorLinhaId(linhaproducaoId)
    if (!urlWhep) {
      setErroCamera('URL base da câmera não configurada. Defina VITE_CAMERA_URL no ambiente.')
      setCarregandoCamera(false)
      setCameraAguardandoFrame(false)
      return
    }

    if (!videoCameraRef.current) {
      return
    }

    setCarregandoCamera(true)
    setCameraAguardandoFrame(true)
    setErroCamera(null)
    encerrarConexaoCamera()

    try {
      const pc = new RTCPeerConnection()
      conexaoCameraRef.current = pc

      pc.addTransceiver('video', { direction: 'recvonly' })
      pc.ontrack = (evento) => {
        const [stream] = evento.streams
        const video = videoCameraRef.current
        if (stream && video) {
          video.srcObject = stream
          void video.play().catch(() => {
            // Navegadores podem bloquear play sem interação explícita em alguns cenários.
          })
        }
      }

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      const offerSdp = offer.sdp

      if (!offerSdp) {
        throw new Error('Não foi possível gerar SDP de oferta para conexão WHEP.')
      }

      console.info('📷 Iniciando stream WHEP', {
        linhaproducaoId,
        cameraSegmento,
        urlWhep
      })

      const resposta = await fetch(urlWhep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: offerSdp
      })

      if (!resposta.ok) {
        throw new Error(`Falha ao conectar ao stream de vídeo (HTTP ${resposta.status}).`)
      }

      const answerSdp = await resposta.text()
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })
    } catch (error) {
      console.error('❌ Erro ao iniciar stream da câmera via WHEP:', {
        linhaproducaoId,
        cameraSegmento,
        urlWhep,
        error
      })
      let mensagemErro = 'Não foi possível abrir a câmera. Verifique endpoint WHEP, rede e permissões do servidor.'

      if (error instanceof TypeError && urlBaseCamera) {
        try {
          const respostaBase = await fetch(urlBaseCamera, { method: 'GET' })
          if (respostaBase.ok) {
            mensagemErro = `Servidor da câmera respondeu no endpoint base (${urlBaseCamera}), mas o POST no WHEP falhou (${urlWhep}).`
          }
        } catch {
          mensagemErro = `Falha de rede ao acessar o servidor da câmera (${urlWhep}).`
        }
      }

      setErroCamera(mensagemErro)
      setCameraAguardandoFrame(false)
      encerrarConexaoCamera()
    } finally {
      setCarregandoCamera(false)
    }
  }, [encerrarConexaoCamera, obterSegmentoCameraPorLinhaId, obterUrlCameraBasePorLinhaId, obterUrlCameraWhepPorLinhaId])

  const validarPermissaoVisualizacaoCamera = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      setModalPermissaoCameraAberto(true)
      return false
    }

    try {
      setValidandoPermissaoCamera(true)

      const { data, error } = await supabase
        .from('tbusuario')
        .select('perfil')
        .eq('user_id', user.id)
        .eq('deletado', 'N')
        .maybeSingle()

      if (error) {
        throw error
      }

      const perfilNormalizado = (data?.perfil || '').trim().toLowerCase()
      const semPermissao = !perfilNormalizado || perfilNormalizado === 'operador'

      if (semPermissao) {
        setModalPermissaoCameraAberto(true)
        return false
      }

      return true
    } catch (error) {
      console.error('❌ Erro ao validar perfil para visualizar câmera:', error)
      toast({
        title: 'Erro ao validar permissão',
        description: 'Não foi possível validar a permissão para visualizar câmera.',
        variant: 'destructive'
      })
      return false
    } finally {
      setValidandoPermissaoCamera(false)
    }
  }, [toast, user?.id])

  const abrirModalCamera = useCallback((linha: OeeLinhaRow) => {
    setLinhaCameraSelecionada(linha)
    setErroCamera(null)
    setModalCameraAberto(true)
  }, [])

  const handleAbrirCameraComPermissao = useCallback(async (linha: OeeLinhaRow) => {
    if (validandoPermissaoCamera) {
      return
    }

    const permitido = await validarPermissaoVisualizacaoCamera()
    if (!permitido) {
      return
    }

    abrirModalCamera(linha)
  }, [abrirModalCamera, validarPermissaoVisualizacaoCamera, validandoPermissaoCamera])

  const handleModalCameraChange = useCallback((aberto: boolean) => {
    setModalCameraAberto(aberto)
    if (!aberto) {
      encerrarConexaoCamera()
      setCarregandoCamera(false)
      setCameraAguardandoFrame(false)
      setErroCamera(null)
      setLinhaCameraSelecionada(null)
      setVideoCameraPronto(false)
    }
  }, [encerrarConexaoCamera])

  const handleAtualizarCamera = useCallback(() => {
    if (!linhaCameraSelecionada || !videoCameraPronto || carregandoCamera) {
      return
    }

    void iniciarStreamCamera(linhaCameraSelecionada.linhaproducao_id)
  }, [carregandoCamera, iniciarStreamCamera, linhaCameraSelecionada, videoCameraPronto])

  useEffect(() => {
    if (!modalCameraAberto || !linhaCameraSelecionada || !videoCameraPronto) {
      return
    }

    void iniciarStreamCamera(linhaCameraSelecionada.linhaproducao_id)

    return () => {
      encerrarConexaoCamera()
    }
  }, [encerrarConexaoCamera, iniciarStreamCamera, linhaCameraSelecionada, modalCameraAberto, videoCameraPronto])

  const cameraEmProcessamento = carregandoCamera || cameraAguardandoFrame

  return (
    <div className="min-h-screen bg-muted">
      <AppHeader
        title="SICFAR OEE - Dashboard"
        userName={user?.usuario || 'Usuário'}
        userRole={user?.perfil || 'Operador'}
        onLogout={signOut}
      />

      <main className="max-w-[1920px] mx-auto px-3 py-6 space-y-6 sm:px-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1.5">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Filter className="h-5 w-5 text-primary" />
                  Filtros do Dashboard
                </CardTitle>
                <CardDescription>
                  Ajuste os filtros para recalcular automaticamente os cards de OEE.
                </CardDescription>
              </div>

              {/* Controles de atualização automática */}
              <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:items-end sm:gap-1.5">
                <div className="ml-auto flex w-fit flex-col items-end gap-2 sm:ml-0 sm:w-auto sm:flex-row sm:flex-nowrap sm:items-center sm:justify-end sm:gap-2">
                  <span className="text-sm text-muted-foreground hidden sm:inline">Atualização:</span>
                  <div className="order-2 flex items-center justify-end gap-2 sm:order-none sm:contents">
                    <Button
                      type="button"
                      variant={atualizacaoAutomatica ? 'default' : 'outline'}
                      size="sm"
                      onClick={alternarAtualizacaoAutomatica}
                      className={`flex h-11 w-11 min-w-[44px] items-center justify-center gap-0 sm:h-9 sm:w-auto sm:min-w-[100px] sm:gap-2 ${
                        atualizacaoAutomatica
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : theme === 'light'
                            ? '!bg-white !text-brand-primary !border-brand-primary hover:!bg-brand-primary hover:!border-brand-primary hover:!text-white'
                            : ''
                      }`}
                      title={atualizacaoAutomatica ? 'Clique para pausar a atualização automática' : 'Clique para ativar a atualização automática'}
                      aria-label={atualizacaoAutomatica ? 'Pausar atualização automática' : 'Ativar atualização automática'}
                    >
                    {atualizacaoAutomatica ? (
                      <>
                        <Pause className="h-4 w-4" />
                        <span className="hidden sm:inline">Pausar</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        <span className="hidden sm:inline">Auto</span>
                      </>
                    )}
                  </Button>
                    <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-background px-2 py-1 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={intervaloSegundos}
                      onChange={handleIntervaloChange}
                      className="h-9 w-16 text-center sm:w-14"
                      title="Intervalo de atualização em segundos (mínimo: 5, máximo: 300)"
                      disabled={atualizacaoAutomatica}
                      />
                      <span className="text-xs text-muted-foreground sm:text-sm">seg</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleAtualizarIndicadores}
                      className="h-11 w-11 !bg-white !text-brand-primary !border-brand-primary hover:!bg-brand-primary hover:!border-brand-primary hover:!text-white dark:!bg-background dark:!text-foreground dark:!border-input dark:hover:!bg-accent dark:hover:!text-accent-foreground dark:hover:!border-input sm:h-9 sm:w-9"
                      title="Atualizar indicadores"
                      aria-label="Atualizar indicadores"
                      disabled={carregandoDados}
                    >
                      <RefreshCw className={`h-4 w-4 ${carregandoDados ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  <div className="order-1 flex items-center justify-end gap-2 sm:order-none sm:contents">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={toggleTheme}
                      className="h-11 w-11 !bg-white !text-brand-primary !border-brand-primary hover:!bg-brand-primary hover:!border-brand-primary hover:!text-white dark:!bg-background dark:!text-foreground dark:!border-input dark:hover:!bg-accent dark:hover:!text-accent-foreground dark:hover:!border-input sm:h-9 sm:w-9"
                      title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
                    >
                    {theme === 'dark' ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/')}
                      className={`flex h-11 w-11 min-w-[44px] items-center justify-center gap-0 sm:h-9 sm:w-auto sm:min-w-[80px] sm:gap-2 ${
                        theme === 'light'
                          ? '!bg-white !text-brand-primary !border-brand-primary hover:!bg-brand-primary hover:!border-brand-primary hover:!text-white'
                          : ''
                      }`}
                      title="Voltar para a Home"
                      aria-label="Voltar para a Home"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Voltar</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setFiltrosAbertos((prev) => !prev)}
                      className="h-11 w-11 !bg-white !text-brand-primary !border-brand-primary hover:!bg-brand-primary hover:!border-brand-primary hover:!text-white dark:!bg-background dark:!text-foreground dark:!border-input dark:hover:!bg-accent dark:hover:!text-accent-foreground dark:hover:!border-input sm:h-9 sm:w-9"
                      title={filtrosAbertos ? 'Recolher filtros do dashboard' : 'Expandir filtros do dashboard'}
                      aria-label={filtrosAbertos ? 'Recolher filtros do dashboard' : 'Expandir filtros do dashboard'}
                      aria-controls="filtros-dashboard-conteudo"
                    aria-expanded={filtrosAbertos}
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${filtrosAbertos ? 'rotate-180' : ''}`}
                    />
                  </Button>
                  </div>
                </div>
                {atualizacaoAutomatica && (
                  <div className="flex w-full items-center gap-1.5 text-[11px] text-green-600 dark:text-green-400 sm:w-auto sm:justify-end sm:text-xs">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Próxima atualização em {contagemRegressiva}s</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent
            id="filtros-dashboard-conteudo"
            className={`space-y-4 ${filtrosAbertos ? '' : 'hidden'}`}
            aria-hidden={!filtrosAbertos}
          >
            {carregandoListas ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="filtro-linha">Linha de Produção</Label>
                  <DropdownMenu open={menuLinhaAberto} onOpenChange={setMenuLinhaAberto}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        id="filtro-linha"
                        variant="outline"
                        className="h-11 w-full justify-between font-normal sm:h-10"
                      >
                        <span className="truncate">{resumoLinhasSelecionadas}</span>
                        <ChevronDown className="h-4 w-4 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-[var(--radix-dropdown-menu-trigger-width)]"
                    >
                      <div className="p-2">
                        <Input
                          ref={campoBuscaLinhaRef}
                          placeholder="Buscar linha"
                          value={buscaLinha}
                          onChange={(event) => setBuscaLinha(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key !== 'Escape') {
                              event.stopPropagation()
                            }
                          }}
                        />
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={filtros.linhaIds.length === 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            atualizarFiltro('linhaIds', [])
                          }
                        }}
                        onSelect={(event) => event.preventDefault()}
                      >
                        Todas as linhas
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      <div className="max-h-64 overflow-y-auto">
                        {linhasFiltradas.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            Nenhuma linha encontrada.
                          </div>
                        ) : (
                          linhasFiltradas.map((linha) => {
                            const linhaId = String(linha.linhaproducao_id)
                            return (
                              <DropdownMenuCheckboxItem
                                key={linha.linhaproducao_id}
                                checked={filtros.linhaIds.includes(linhaId)}
                                onCheckedChange={() => alternarLinhaSelecionada(linhaId)}
                                onSelect={(event) => event.preventDefault()}
                              >
                                {linha.linhaproducao || `Linha ${linha.linhaproducao_id}`}
                              </DropdownMenuCheckboxItem>
                            )
                          })
                        )}
                      </div>
                      <DropdownMenuSeparator />
                      <div className="p-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full"
                          onClick={() => setMenuLinhaAberto(false)}
                        >
                          Fechar
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filtro-produto">Produto SKU</Label>
                  <Select value={filtros.produtoId} onValueChange={(value) => atualizarFiltro('produtoId', value)}>
                    <SelectTrigger id="filtro-produto" className="h-11 sm:h-10">
                      <SelectValue placeholder="Todos os produtos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {produtos.map((produto) => (
                        <SelectItem key={produto.produto_id} value={String(produto.produto_id)}>
                          {(produto.referencia || 'SKU')} - {produto.descricao || 'Sem descrição'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filtro-turno">Turno</Label>
                  <Select value={filtros.turnoId} onValueChange={(value) => atualizarFiltro('turnoId', value)}>
                    <SelectTrigger id="filtro-turno" className="h-11 sm:h-10">
                      <SelectValue placeholder="Todos os turnos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {turnos.map((turno) => (
                        <SelectItem key={turno.turno_id} value={String(turno.turno_id)}>
                          {turno.codigo} - {turno.turno || 'Turno'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Período</Label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="dd/mm/aaaa"
                        value={filtros.dataInicio}
                        onChange={(e) => atualizarFiltro('dataInicio', formatarDataDigitada(e.target.value))}
                        className="h-11 sm:h-10"
                      />
                      <Popover open={calendarioInicioAberto} onOpenChange={setCalendarioInicioAberto}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label="Selecionar data inicial"
                            className="h-11 w-11 shrink-0 sm:h-10 sm:w-10"
                          >
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dataInicioSelecionada}
                            captionLayout="dropdown"
                            locale={ptBR}
                            onSelect={(date) => {
                              if (date) {
                                atualizarFiltro('dataInicio', format(date, 'dd/MM/yyyy'))
                              }
                              setCalendarioInicioAberto(false)
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="dd/mm/aaaa"
                        value={filtros.dataFim}
                        onChange={(e) => atualizarFiltro('dataFim', formatarDataDigitada(e.target.value))}
                        className="h-11 sm:h-10"
                      />
                      <Popover open={calendarioFimAberto} onOpenChange={setCalendarioFimAberto}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label="Selecionar data final"
                            className="h-11 w-11 shrink-0 sm:h-10 sm:w-10"
                          >
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dataFimSelecionada}
                            captionLayout="dropdown"
                            locale={ptBR}
                            onSelect={(date) => {
                              if (date) {
                                atualizarFiltro('dataFim', format(date, 'dd/MM/yyyy'))
                              }
                              setCalendarioFimAberto(false)
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {erroDados && (
          <Card className="border border-destructive/40">
            <CardContent className="flex items-center gap-2 text-sm text-destructive py-4">
              {erroDados}
            </CardContent>
          </Card>
        )}

        {carregandoDados ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={`skeleton-${index}`}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : dadosOee.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Nenhum dado encontrado para os filtros selecionados.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {dadosOee.map((linha) => {
              const cameraDisponivel = Boolean(obterSegmentoCameraPorLinhaId(linha.linhaproducao_id))

              return (
                <Card
                  key={linha.linhaproducao_id}
                  className="cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={carregandoDetalhamento ? undefined : () => void abrirDetalhamentoLinha(linha)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      if (!carregandoDetalhamento) {
                        void abrirDetalhamentoLinha(linha)
                      }
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-busy={
                    carregandoDetalhamento &&
                    linhaDetalheSelecionada?.linhaproducao_id === linha.linhaproducao_id
                  }
                  title="Clique para ver o detalhamento do cálculo do OEE"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="min-h-[3rem] flex-1 break-words text-base sm:min-h-[3.5rem] sm:text-lg">
                        {linha.linhaproducao || 'Linha sem nome'}
                      </CardTitle>
                      {cameraDisponivel && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            void handleAbrirCameraComPermissao(linha)
                          }}
                          onKeyDown={(event) => {
                            event.stopPropagation()
                          }}
                          disabled={validandoPermissaoCamera}
                          title={`Abrir câmera da linha ${linha.linhaproducao || ''}`}
                          aria-label={`Abrir câmera da linha ${linha.linhaproducao || 'selecionada'}`}
                        >
                          <Video className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-6">
                  {/* Velocímetro SVG inline com cores dinâmicas */}
                  <div className="relative flex-shrink-0">
                    <svg className="h-36 w-36 transform -rotate-90 sm:h-40 sm:w-40" viewBox="0 0 120 120">
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
                        strokeDashoffset={339.292 - (339.292 * linha.oee) / 100}
                        strokeLinecap="round"
                        strokeWidth="12"
                        stroke={getColorByPercentage(linha.oee)}
                        style={{ transition: 'stroke 0.3s ease-in-out' }}
                      />
                      {/* Destaque visual do gap até a meta (65%) - exibido apenas quando OEE < 65% */}
                      {linha.oee < 65 && (
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
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-xl text-foreground sm:text-2xl">
                          {formatarPercentual(linha.oee)}%
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mt-1 h-5 w-5 text-blue-500/80 dark:text-blue-400/80"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                          <path d="M12 17h.01"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Barras de componentes com cores dinâmicas */}
                  <div className="w-full space-y-3 sm:space-y-4">
                    {/* Disponibilidade */}
                    <div>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-sm font-semibold sm:text-base">{formatarPercentual(linha.disponibilidade)}%</span>
                        <span className="text-muted-foreground">Disponibilidade</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="h-2 rounded-full transition-all duration-300 ease-in-out"
                          style={{
                            width: `${Math.max(0, Math.min(100, linha.disponibilidade))}%`,
                            backgroundColor: getColorByPercentage(linha.disponibilidade)
                          }}
                        />
                      </div>
                    </div>

                    {/* Performance */}
                    <div>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-sm font-semibold sm:text-base">{formatarPercentual(linha.performance)}%</span>
                        <span className="text-muted-foreground">Performance</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="h-2 rounded-full transition-all duration-300 ease-in-out"
                          style={{
                            width: `${Math.max(0, Math.min(100, linha.performance))}%`,
                            backgroundColor: getColorByPercentage(linha.performance)
                          }}
                        />
                      </div>
                    </div>

                    {/* Qualidade */}
                    <div>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-sm font-semibold sm:text-base">{formatarPercentual(linha.qualidade)}%</span>
                        <span className="text-muted-foreground">Qualidade</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="h-2 rounded-full transition-all duration-300 ease-in-out"
                          style={{
                            width: `${Math.max(0, Math.min(100, linha.qualidade))}%`,
                            backgroundColor: getColorByPercentage(linha.qualidade)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <AlertDialog open={modalPermissaoCameraAberto} onOpenChange={setModalPermissaoCameraAberto}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Permissão necessária</AlertDialogTitle>
              <AlertDialogDescription>
                {MENSAGEM_PERMISSAO_CAMERA}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setModalPermissaoCameraAberto(false)}>
                Entendi
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={modalCameraAberto} onOpenChange={handleModalCameraChange}>
          <DialogContent className="max-w-[calc(100vw-1.5rem)] p-4 sm:max-w-4xl sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-2xl">
                <Video className="h-5 w-5 text-blue-500" />
                Câmera da linha
              </DialogTitle>
              <DialogDescription>
                {linhaCameraSelecionada?.linhaproducao || 'Linha não definida'}
              </DialogDescription>
            </DialogHeader>

            <div className="relative overflow-hidden rounded-lg border border-border bg-black">
              <video
                ref={definirVideoCameraRef}
                autoPlay
                playsInline
                muted
                onPlaying={() => setCameraAguardandoFrame(false)}
                onWaiting={() => setCameraAguardandoFrame(true)}
                onStalled={() => setCameraAguardandoFrame(true)}
                className="aspect-video w-full bg-black object-contain"
              />
              {linhaCameraSelecionada && (
                <div className="pointer-events-none absolute left-3 top-3 z-10">
                  <div className="rounded-xl border border-white/20 bg-black/40 p-2.5 backdrop-blur-sm">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-white/80">
                      OEE atual
                    </p>
                    <div className="relative mt-1 h-20 w-20 sm:h-24 sm:w-24">
                      <svg className="h-full w-full transform -rotate-90" viewBox="0 0 120 120">
                        <circle
                          cx="60"
                          cy="60"
                          fill="none"
                          r="54"
                          strokeWidth="12"
                          className="stroke-white/25"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          fill="none"
                          r="54"
                          strokeDasharray="339.292"
                          strokeDashoffset={339.292 - (339.292 * linhaCameraSelecionada.oee) / 100}
                          strokeLinecap="round"
                          strokeWidth="12"
                          stroke={getColorByPercentage(linhaCameraSelecionada.oee)}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-white sm:text-sm">
                          {formatarPercentual(linhaCameraSelecionada.oee)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {cameraEmProcessamento && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-950/85 via-slate-900/70 to-black/85 backdrop-blur-[1px]">
                  <div className="relative h-14 w-14">
                    <div className="absolute inset-0 rounded-full border border-cyan-300/40" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-r-cyan-400/70 border-t-cyan-300 animate-spin" />
                    <div className="absolute inset-2 rounded-full border border-cyan-300/30 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-cyan-100">Processando stream da câmera</p>
                    <p className="text-xs text-cyan-200/80">Aguarde alguns segundos...</p>
                  </div>
                  <div className="h-1.5 w-48 overflow-hidden rounded-full bg-cyan-400/20">
                    <div className="h-full w-1/2 animate-pulse rounded-full bg-cyan-300/70" />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(125,211,252,0.08)_50%,transparent_100%)] bg-[length:100%_6px] opacity-40" />
                </div>
              )}
            </div>

            {erroCamera && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-300">
                {erroCamera}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleAtualizarCamera}
                disabled={!linhaCameraSelecionada || !videoCameraPronto || carregandoCamera}
              >
                <RefreshCw className={`h-4 w-4 ${carregandoCamera ? 'animate-spin' : ''}`} />
                Atualizar câmera
              </Button>
              <Button type="button" variant="outline" onClick={() => handleModalCameraChange(false)}>
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={modalDetalhamentoAberto} onOpenChange={handleModalDetalhamentoChange}>
          <DialogContent className="max-h-[90vh] max-w-[calc(100vw-1.5rem)] overflow-y-auto p-4 sm:max-w-4xl sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-2xl">
                <Info className="w-6 h-6 text-blue-500" />
                Detalhamento do cálculo do OEE
              </DialogTitle>
              <DialogDescription className="space-y-1 text-sm text-muted-foreground">
                <span className="block">
                  Linha:{' '}
                  <strong className="text-foreground">
                    {linhaDetalheSelecionada?.linhaproducao || 'Não definida'}
                  </strong>
                </span>
                <span className="block">
                  Período: <strong className="text-foreground">{periodoDescricao}</strong>
                </span>
                <span className="block">
                  Turno:{' '}
                  <strong className="text-foreground">
                    {turnoSelecionado ? `${turnoSelecionado.codigo} - ${turnoSelecionado.turno || 'Turno'}` : 'Todos'}
                  </strong>
                </span>
                <span className="block">
                  Produto:{' '}
                  <strong className="text-foreground">
                    {produtoSelecionado ? `${produtoSelecionado.referencia || 'SKU'} - ${produtoSelecionado.descricao || 'Sem descrição'}` : 'Todos'}
                  </strong>
                </span>
              </DialogDescription>
            </DialogHeader>

            {carregandoDetalhamento && (
              <div className="py-10 flex items-center justify-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                Carregando detalhes do OEE...
              </div>
            )}

            {!carregandoDetalhamento && erroDetalhamento && (
              <div className="mt-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-300 flex gap-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Não foi possível carregar os detalhes.</p>
                  <p className="text-sm text-muted-foreground">{erroDetalhamento}</p>
                </div>
              </div>
            )}

            {!carregandoDetalhamento && !erroDetalhamento && !componentesOeeDetalhe && (
              <div className="py-6 text-sm text-muted-foreground">
                Nenhum dado encontrado para a linha selecionada.
              </div>
            )}

            {!carregandoDetalhamento && !erroDetalhamento && componentesOeeDetalhe && detalhesComponentesOee && (
              <div className="space-y-6 py-4">
                <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
                  <div className="relative flex-shrink-0">
                    <svg className="h-32 w-32 transform -rotate-90 sm:h-40 sm:w-40" viewBox="0 0 120 120">
                      <circle
                        className="stroke-gray-200 dark:stroke-gray-700"
                        cx="60"
                        cy="60"
                        fill="none"
                        r="54"
                        strokeWidth="12"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        fill="none"
                        r="54"
                        strokeDasharray="339.292"
                        strokeDashoffset={339.292 - (339.292 * componentesOeeDetalhe.oee) / 100}
                        strokeLinecap="round"
                        strokeWidth="12"
                        stroke={getColorByPercentage(componentesOeeDetalhe.oee)}
                        style={{ transition: 'stroke 0.3s ease-in-out' }}
                      />
                      {componentesOeeDetalhe.oee < 65 && (
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
                      <span className="font-bold text-xl text-foreground sm:text-2xl">
                        {formatarPercentual(componentesOeeDetalhe.oee)}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    <div className="rounded-lg border border-border bg-card text-card-foreground p-3">
                      <p className="text-xs text-muted-foreground">OEE</p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: getColorByPercentage(componentesOeeDetalhe.oee) }}
                      >
                        {formatarPercentual(componentesOeeDetalhe.oee)}%
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-card text-card-foreground p-3">
                      <p className="text-xs text-muted-foreground">Disponibilidade</p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: getColorByPercentage(componentesOeeDetalhe.disponibilidade) }}
                      >
                        {formatarPercentual(componentesOeeDetalhe.disponibilidade)}%
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-card text-card-foreground p-3">
                      <p className="text-xs text-muted-foreground">Performance</p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: getColorByPercentage(componentesOeeDetalhe.performance) }}
                      >
                        {formatarPercentual(componentesOeeDetalhe.performance)}%
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-card text-card-foreground p-3">
                      <p className="text-xs text-muted-foreground">Qualidade</p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: getColorByPercentage(componentesOeeDetalhe.qualidade) }}
                      >
                        {formatarPercentual(componentesOeeDetalhe.qualidade)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Base de produção e perdas</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="rounded-lg border border-border bg-card text-card-foreground p-3">
                      <p className="text-xs text-muted-foreground">Unidades produzidas</p>
                      <p className="text-lg font-semibold text-card-foreground">
                        {formatarQuantidade(componentesOeeDetalhe.unidadesProduzidas)} un
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-card text-card-foreground p-3">
                      <p className="text-xs text-muted-foreground">Unidades perdas</p>
                      <p className="text-lg font-semibold text-card-foreground">
                        {formatarQuantidade(componentesOeeDetalhe.unidadesPerdas)} un
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-card text-card-foreground p-3">
                      <p className="text-xs text-muted-foreground">Unidades boas</p>
                      <p className="text-lg font-semibold text-card-foreground">
                        {formatarQuantidade(componentesOeeDetalhe.unidadesBoas)} un
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Tempos (horas)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="rounded-lg border border-border bg-card text-card-foreground p-3">
                      <p className="text-xs text-muted-foreground">Tempo disponível</p>
                      <p className="text-lg font-semibold text-card-foreground">
                        {formatarNumeroDecimal(componentesOeeDetalhe.tempoDisponivelHoras)} h
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-card text-card-foreground p-3">
                      <p className="text-xs text-muted-foreground">Tempo estratégico</p>
                      <p className="text-lg font-semibold text-card-foreground">
                        {formatarNumeroDecimal(componentesOeeDetalhe.tempoEstrategicoHoras)} h
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-card text-card-foreground p-3">
                      <p className="text-xs text-muted-foreground">Tempo disponível ajustado</p>
                      <p className="text-lg font-semibold text-card-foreground">
                        {formatarNumeroDecimal(detalhesComponentesOee.tempoDisponivelAjustado)} h
                      </p>
                    </div>
                    <div
                      className={`rounded-lg border border-border bg-card text-card-foreground p-3 transition ${
                        podeAbrirPareto
                          ? 'cursor-pointer hover:border-primary/60 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
                          : 'opacity-70'
                      }`}
                      role={podeAbrirPareto ? 'button' : undefined}
                      tabIndex={podeAbrirPareto ? 0 : -1}
                      aria-disabled={!podeAbrirPareto}
                      title={podeAbrirPareto ? 'Clique para ver o Pareto de paradas grandes' : undefined}
                      onClick={podeAbrirPareto ? abrirParetoParadas : undefined}
                      onKeyDown={podeAbrirPareto ? handleAbrirParetoKeyDown : undefined}
                    >
                      <p className="text-xs text-muted-foreground">Paradas grandes</p>
                      <p className="text-lg font-semibold text-card-foreground">
                        {formatarNumeroDecimal(componentesOeeDetalhe.tempoParadasGrandesHoras)} h
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-card text-card-foreground p-3">
                      <p className="text-xs text-muted-foreground">Tempo de operação</p>
                      <p className="text-lg font-semibold text-card-foreground">
                        {formatarNumeroDecimal(componentesOeeDetalhe.tempoOperacaoHoras)} h
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-card text-card-foreground p-3">
                      <p className="text-xs text-muted-foreground">Tempo operacional líquido</p>
                      <p className="text-lg font-semibold text-card-foreground">
                        {formatarNumeroDecimal(componentesOeeDetalhe.tempoOperacionalLiquido)} h
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-card text-card-foreground p-3">
                      <p className="text-xs text-muted-foreground">Tempo valioso</p>
                      <p className="text-lg font-semibold text-card-foreground">
                        {formatarNumeroDecimal(componentesOeeDetalhe.tempoValioso)} h
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Fórmulas e cálculos</h3>
                  <div className="space-y-3">
                    <div className="rounded-lg border border-border bg-muted/40 p-3">
                      <p className="text-sm font-medium text-foreground">Tempo disponível ajustado</p>
                      <p className="text-xs text-muted-foreground">
                        Tempo disponível ajustado = Tempo disponível − Tempo estratégico
                      </p>
                      <p className="mt-1 break-words font-mono text-[11px] text-foreground/90 sm:text-xs">
                        = {formatarNumeroDecimal(componentesOeeDetalhe.tempoDisponivelHoras)} − {formatarNumeroDecimal(componentesOeeDetalhe.tempoEstrategicoHoras)} = {formatarNumeroDecimal(detalhesComponentesOee.tempoDisponivelAjustado)} h
                      </p>
                    </div>

                    <div className="rounded-lg border border-border bg-muted/40 p-3">
                      <p className="text-sm font-medium text-foreground">Tempo de operação</p>
                      <p className="text-xs text-muted-foreground">
                        Tempo de operação = Tempo disponível ajustado − Paradas grandes
                      </p>
                      <p className="mt-1 break-words font-mono text-[11px] text-foreground/90 sm:text-xs">
                        = {formatarNumeroDecimal(detalhesComponentesOee.tempoDisponivelAjustado)} − {formatarNumeroDecimal(componentesOeeDetalhe.tempoParadasGrandesHoras)} = {formatarNumeroDecimal(detalhesComponentesOee.tempoOperacaoCalculado)} h
                      </p>
                    </div>

                    <div className="rounded-lg border border-border bg-muted/40 p-3">
                      <p className="text-sm font-medium text-foreground">Disponibilidade</p>
                      <p className="text-xs text-muted-foreground">
                        Disponibilidade = (Tempo de operação ÷ Tempo disponível ajustado) × 100
                      </p>
                      <p className="mt-1 break-words font-mono text-[11px] text-foreground/90 sm:text-xs">
                        = ({formatarNumeroDecimal(detalhesComponentesOee.tempoOperacaoCalculado)} / {formatarNumeroDecimal(detalhesComponentesOee.tempoDisponivelAjustado)}) × 100 = {formatarPercentual(componentesOeeDetalhe.disponibilidade)}%
                      </p>
                    </div>

                    <div className="rounded-lg border border-border bg-muted/40 p-3">
                      <p className="text-sm font-medium text-foreground">Performance</p>
                      <p className="text-xs text-muted-foreground">
                        Performance = (Tempo operacional líquido ÷ Tempo de operação) × 100
                      </p>
                      <p className="mt-1 break-words font-mono text-[11px] text-foreground/90 sm:text-xs">
                        = ({formatarNumeroDecimal(componentesOeeDetalhe.tempoOperacionalLiquido)} / {formatarNumeroDecimal(detalhesComponentesOee.tempoOperacaoCalculado)}) × 100 = {formatarPercentual(componentesOeeDetalhe.performance)}%
                      </p>
                    </div>

                    <div className="rounded-lg border border-border bg-muted/40 p-3">
                      <p className="text-sm font-medium text-foreground">Qualidade</p>
                      <p className="text-xs text-muted-foreground">
                        Qualidade = (Unidades boas ÷ Unidades produzidas) × 100
                      </p>
                      <p className="mt-1 break-words font-mono text-[11px] text-foreground/90 sm:text-xs">
                        = ({formatarQuantidade(componentesOeeDetalhe.unidadesBoas)} / {formatarQuantidade(componentesOeeDetalhe.unidadesProduzidas)}) × 100 = {formatarPercentual(componentesOeeDetalhe.qualidade)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={modalParetoAberto} onOpenChange={handleModalParetoChange}>
          <DialogContent className="max-h-[90vh] max-w-[calc(100vw-1.5rem)] overflow-y-auto p-4 sm:max-w-5xl sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-2xl">
                <Info className="w-6 h-6 text-blue-500" />
                Pareto de paradas grandes
              </DialogTitle>
              <DialogDescription className="space-y-1 text-sm text-muted-foreground">
                <span className="block">
                  Linha:{' '}
                  <strong className="text-foreground">
                    {linhaDetalheSelecionada?.linhaproducao || 'Não definida'}
                  </strong>
                </span>
                <span className="block">
                  Período: <strong className="text-foreground">{periodoDescricao}</strong>
                </span>
                <span className="block">
                  Turno:{' '}
                  <strong className="text-foreground">
                    {turnoSelecionado ? `${turnoSelecionado.codigo} - ${turnoSelecionado.turno || 'Turno'}` : 'Todos'}
                  </strong>
                </span>
                <span className="block">
                  Produto:{' '}
                  <strong className="text-foreground">
                    {produtoSelecionado ? `${produtoSelecionado.referencia || 'SKU'} - ${produtoSelecionado.descricao || 'Sem descrição'}` : 'Todos'}
                  </strong>
                </span>
              </DialogDescription>
            </DialogHeader>

            {carregandoPareto && (
              <div className="py-10 flex items-center justify-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                Carregando Pareto de paradas...
              </div>
            )}

            {!carregandoPareto && erroPareto && (
              <div className="mt-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-300 flex gap-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Não foi possível carregar o Pareto.</p>
                  <p className="text-sm text-muted-foreground">{erroPareto}</p>
                </div>
              </div>
            )}

            {!carregandoPareto && !erroPareto && paretoParadas.length === 0 && (
              <div className="py-6 text-sm text-muted-foreground">
                Nenhuma parada grande encontrada para a linha e período selecionados.
              </div>
            )}

            {!carregandoPareto && !erroPareto && paretoParadas.length > 0 && (
              <div className="space-y-4 py-4">
                <div className="rounded-lg border border-border bg-card text-card-foreground p-3">
                  <p className="text-xs text-muted-foreground">Total de paradas grandes</p>
                  <p className="text-lg font-semibold text-card-foreground">
                    {componentesOeeDetalhe
                      ? `${formatarNumeroDecimal(componentesOeeDetalhe.tempoParadasGrandesHoras)} h`
                      : '-'}
                  </p>
                </div>
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[560px] sm:min-w-0">
                    <ParetoParadasChart data={paretoParadas} />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => handleModalParetoChange(false)}>
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex flex-col items-start gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-end sm:gap-4">
          {atualizacaoAutomatica && (
            <div className="flex w-full items-center gap-1.5 rounded-md bg-green-100 px-2 py-1 text-green-700 dark:bg-green-900/30 dark:text-green-400 sm:w-auto">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Atualização automática ativa ({intervaloSegundos}s)</span>
            </div>
          )}
          {carregandoDados && (
            <div className="flex w-full items-center gap-1.5 sm:w-auto">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Atualizando indicadores...</span>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

