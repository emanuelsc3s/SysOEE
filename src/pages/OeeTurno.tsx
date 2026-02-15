/**
 * Página de Listagem de Apontamentos OEE por Turno
 * Exibe tabela com todos os apontamentos de produção cadastrados na tboee_turno do Supabase
 * Implementa padrões avançados de UI: paginação, filtros, busca em tempo real
 */

import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { AppHeader } from '@/components/layout/AppHeader'
import { useOeeTurno } from '@/hooks/useOeeTurno'
import { useAuth } from '@/hooks/useAuth'
import { SYSOEE_APP_ID, type Rotina } from '@/hooks/usePermissions'
import { supabase } from '@/lib/supabase'
import { OeeTurnoFormData, OeeTurnoStatus } from '@/types/apontamento-oee'
import {
  Search,
  Check,
  Pencil,
  Trash2,
  ChevronDown,
  Clock,
  Target,
  RefreshCw,
  Filter,
  Loader2,
  Eye,
  ArrowLeft,
  Package,
  Activity,
  ClipboardList,
  Calendar as CalendarIcon,
  X
} from 'lucide-react'
import { DataPagination } from '@/components/ui/data-pagination'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Constantes estáveis no escopo do módulo para evitar warnings de dependências
const PAGE_SIZE_STORAGE_KEY = 'sysoee_oee_turno_items_per_page'
const SEARCH_TERM_STORAGE_KEY = 'sysoee_oee_turno_search_term'
const PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const
const MENSAGEM_PERMISSAO_EXCLUSAO = 'Rotina de exclusão permitida apenas para os perfis Administrador e Supervisor'
const ROTINA_PERMISSAO_OEE_TURNO: Rotina = 'OEE_TURNO_A'
const TEMPO_DISPONIVEL_PADRAO = 12
const TURNOS_VAZIOS: OeeTurnoFormData[] = []
const STATUS_OEE_DISPONIVEIS: OeeTurnoStatus[] = ['Aberto', 'Fechado', 'Cancelado']

type OeeTurnoRpc = {
  oee?: number | string | null
}

type TurnoFiltroOption = {
  turno_id: number
  codigo: string | null
  turno: string | null
}

const clamp = (valor: number, min: number, max: number): number => {
  return Math.min(Math.max(valor, min), max)
}

const hexParaRgb = (hex: string): { r: number; g: number; b: number } => {
  const limpo = hex.replace('#', '')
  const r = Number.parseInt(limpo.substring(0, 2), 16)
  const g = Number.parseInt(limpo.substring(2, 4), 16)
  const b = Number.parseInt(limpo.substring(4, 6), 16)
  return { r, g, b }
}

const rgbParaHex = (r: number, g: number, b: number): string => {
  const toHex = (valor: number) => valor.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

const interpolarCores = (corInicial: string, corFinal: string, fator: number): string => {
  const inicio = hexParaRgb(corInicial)
  const fim = hexParaRgb(corFinal)
  const t = clamp(fator, 0, 1)
  const r = Math.round(inicio.r + (fim.r - inicio.r) * t)
  const g = Math.round(inicio.g + (fim.g - inicio.g) * t)
  const b = Math.round(inicio.b + (fim.b - inicio.b) * t)
  return rgbParaHex(r, g, b)
}

const calcularCorOee = (valor: number | null | undefined): string | null => {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) {
    return null
  }

  const oee = clamp(valor, 0, 100)
  if (oee <= 25) {
    const fator = oee / 25
    return interpolarCores('#DC2626', '#EF4444', fator)
  }

  if (oee <= 50) {
    const fator = (oee - 25) / 25
    return interpolarCores('#EF4444', '#F97316', fator)
  }

  if (oee <= 65) {
    const fator = (oee - 50) / 15
    return interpolarCores('#F97316', '#EAB308', fator)
  }

  const fator = (oee - 65) / 35
  return interpolarCores('#2563EB', '#1E40AF', fator)
}

const normalizarTexto = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const formatarLabelTurno = (turno: TurnoFiltroOption): string => {
  const codigo = (turno.codigo || '').trim()
  const nome = (turno.turno || '').trim()

  if (codigo && nome) {
    return `${codigo} - ${nome}`
  }

  return codigo || nome || `Turno ${turno.turno_id}`
}

const serializarIdsSelecionados = (ids: string[]): string =>
  [...ids]
    .sort((a, b) => Number(a) - Number(b))
    .join(',')

const serializarStatusSelecionados = (status: OeeTurnoStatus[]): string =>
  [...status]
    .sort((a, b) => a.localeCompare(b))
    .join(',')

const normalizarNumeroRpc = (valor: number | string | null | undefined): number => {
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

const buscarOeePorTurno = async (oeeturnoId: number): Promise<number | null> => {
  if (!Number.isFinite(oeeturnoId)) {
    return null
  }

  try {
    const { data, error } = await supabase.rpc('fn_calcular_oee_dashboard', {
      p_data_inicio: null,
      p_data_fim: null,
      p_turno_id: null,
      p_produto_id: null,
      p_linhaproducao_id: null,
      p_tempo_disponivel_padrao: TEMPO_DISPONIVEL_PADRAO,
      p_oeeturno_id: oeeturnoId
    })

    if (error) {
      throw error
    }

    const registro = Array.isArray(data) ? data[0] : data
    const oeeBruto = (registro as OeeTurnoRpc | null | undefined)?.oee

    if (oeeBruto === null || oeeBruto === undefined || oeeBruto === '') {
      return null
    }

    const oee = normalizarNumeroRpc(oeeBruto)
    return Number.isFinite(oee) ? oee : null
  } catch (error) {
    console.error('Erro ao buscar OEE do turno:', oeeturnoId, error)
    return null
  }
}

/**
 * Formata texto digitado pelo usuário no campo de data para o padrão dd/mm/aaaa
 */
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

/**
 * Converte string de data (dd/mm/aaaa ou yyyy-mm-dd) para objeto Date
 */
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

/**
 * Converte data no formato dd/mm/aaaa para yyyy-mm-dd (ISO) para queries no Supabase
 */
const converterDataBrParaIso = (valor: string): string | undefined => {
  const texto = valor.trim()
  if (!texto) {
    return undefined
  }

  const matchIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (matchIso) {
    return texto
  }

  const matchBr = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!matchBr) {
    return undefined
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
    return undefined
  }

  return `${matchBr[3]}-${matchBr[2]}-${matchBr[1]}`
}

/**
 * Retorna a data atual no formato dd/mm/aaaa usando o fuso local do navegador.
 */
const obterDataAtualFormatada = (): string => {
  return format(new Date(), 'dd/MM/yyyy')
}

export default function OeeTurno() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const dataAtualInicialRef = useRef(obterDataAtualFormatada())
  const [searchTerm, setSearchTerm] = useState(() => {
    try {
      return sessionStorage.getItem(SEARCH_TERM_STORAGE_KEY) ?? ''
    } catch {
      return ''
    }
  })
  const [currentPage, setCurrentPage] = useState(() => {
    const p = Number(searchParams.get('page'))
    return Number.isFinite(p) && p > 0 ? p : 1
  })

  // Controla quantidade de registros exibidos por página (persistido em localStorage)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  // Estados dos date pickers de período
  const [dataInicio, setDataInicio] = useState(dataAtualInicialRef.current)
  const [dataFim, setDataFim] = useState(dataAtualInicialRef.current)
  const [calendarioInicioAberto, setCalendarioInicioAberto] = useState(false)
  const [calendarioFimAberto, setCalendarioFimAberto] = useState(false)

  // Estados de UI
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false)
  const [turnoToDelete, setTurnoToDelete] = useState<OeeTurnoFormData | null>(null)
  const [openFilterDialog, setOpenFilterDialog] = useState(false)
  const [usuarioIdAutenticado, setUsuarioIdAutenticado] = useState<number | null>(null)

  // Estados para modal de turno fechado
  const [isStatusFechadoDialogOpen, setIsStatusFechadoDialogOpen] = useState(false)
  const [turnoParaVisualizar, setTurnoParaVisualizar] = useState<OeeTurnoFormData | null>(null)
  const [oeePorTurno, setOeePorTurno] = useState<Record<string, number | null>>({})
  const [carregandoOeePorTurno, setCarregandoOeePorTurno] = useState<Record<string, boolean>>({})
  const [menuTurnoAberto, setMenuTurnoAberto] = useState(false)
  const [menuStatusAberto, setMenuStatusAberto] = useState(false)
  const [buscaTurno, setBuscaTurno] = useState('')

  // Hook para operações com Supabase
  const { fetchOeeTurnos, deleteOeeTurno } = useOeeTurno()

  // Hook de autenticação
  const { user: authUser } = useAuth()

  // Derivar dados do usuário autenticado
  const user = {
    name: authUser?.usuario || authUser?.email?.split('@')[0] || 'Usuário',
    initials: (authUser?.usuario || authUser?.email)?.substring(0, 2).toUpperCase() || 'U',
    role: authUser?.perfil || 'Operador',
  }

  // Refs para calcular altura disponível do grid
  const tableContainerRef = useRef<HTMLDivElement | null>(null)
  const paginationRef = useRef<HTMLDivElement | null>(null)
  const campoBuscaTurnoRef = useRef<HTMLInputElement | null>(null)

  // Carrega preferência de "por página" do localStorage ao montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PAGE_SIZE_STORAGE_KEY)
      const parsed = raw ? parseInt(raw, 10) : NaN
      const validPageSize = PAGE_SIZE_OPTIONS.find((option) => option === parsed)
      if (validPageSize) {
        setItemsPerPage(validPageSize)
      }
    } catch { /* noop */ }
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem(SEARCH_TERM_STORAGE_KEY, searchTerm)
    } catch { /* noop */ }
  }, [searchTerm])

  // Estado de filtros aplicados (usado para consulta)
  const [appliedFilters, setAppliedFilters] = useState({
    turnoIds: [] as string[],
    produto: '',
    statuses: [] as OeeTurnoStatus[],
  })

  // Estado de edição (no modal) - começa com os filtros aplicados
  const [draftFilters, setDraftFilters] = useState({
    turnoIds: [] as string[],
    produto: '',
    statuses: [] as OeeTurnoStatus[],
  })
  const prevFiltersRef = useRef(appliedFilters)
  const prevSearchTermRef = useRef(searchTerm)
  const prevDataInicioRef = useRef(dataInicio)
  const prevDataFimRef = useRef(dataFim)

  // Datas selecionadas como objetos Date (para o componente Calendar)
  const dataInicioSelecionada = useMemo(() => parseDataParaDate(dataInicio), [dataInicio])
  const dataFimSelecionada = useMemo(() => parseDataParaDate(dataFim), [dataFim])
  // Contagem de filtros aplicados no modal "Filtros" (não inclui período inline)
  const appliedCountBadge = (() => {
    let count = 0
    const f = appliedFilters
    if (f.turnoIds.length > 0) count++
    if (f.produto) count++
    if (f.statuses.length > 0) count++
    return count
  })()

  // Contagem de filtros aplicados para estado da lista (inclui datas inline)
  const appliedCount = (() => {
    let count = 0
    const f = appliedFilters
    if (f.turnoIds.length > 0) count++
    if (f.produto) count++
    if (f.statuses.length > 0) count++
    if (dataInicio) count++
    if (dataFim) count++
    return count
  })()

  const draftCountBadge = (() => {
    let count = 0
    const f = draftFilters
    if (f.turnoIds.length > 0) count++
    if (f.produto.trim()) count++
    if (f.statuses.length > 0) count++
    return count
  })()

  const { data: turnosDisponiveis = [] } = useQuery({
    queryKey: ['oee-turnos-filtro-opcoes'],
    queryFn: async (): Promise<TurnoFiltroOption[]> => {
      const { data, error } = await supabase
        .from('tbturno')
        .select('turno_id, codigo, turno')
        .eq('deletado', 'N')
        .order('codigo', { ascending: true })

      if (error) {
        throw error
      }

      return (data || []) as TurnoFiltroOption[]
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  })

  const turnoIdsAplicados = useMemo(
    () => appliedFilters.turnoIds
      .map((turnoId) => Number(turnoId))
      .filter((turnoId) => Number.isFinite(turnoId)),
    [appliedFilters.turnoIds]
  )

  const turnosFiltradosDropdown = useMemo(() => {
    const termo = normalizarTexto(buscaTurno.trim())
    if (!termo) {
      return turnosDisponiveis
    }

    return turnosDisponiveis.filter((turno) => {
      const textoTurno = normalizarTexto(`${turno.codigo ?? ''} ${turno.turno ?? ''} ${turno.turno_id}`)
      return textoTurno.includes(termo)
    })
  }, [buscaTurno, turnosDisponiveis])

  const resumoTurnosSelecionados = useMemo(() => {
    if (draftFilters.turnoIds.length === 0) {
      return 'Todos os turnos'
    }

    if (draftFilters.turnoIds.length === 1) {
      const turnoIdSelecionado = draftFilters.turnoIds[0]
      const turnoSelecionado = turnosDisponiveis.find(
        (turno) => String(turno.turno_id) === turnoIdSelecionado
      )

      if (!turnoSelecionado) {
        return `Turno ${turnoIdSelecionado}`
      }

      return formatarLabelTurno(turnoSelecionado)
    }

    return `${draftFilters.turnoIds.length} turnos selecionados`
  }, [draftFilters.turnoIds, turnosDisponiveis])

  const resumoStatusSelecionados = useMemo(() => {
    if (draftFilters.statuses.length === 0) {
      return 'Todos os status'
    }

    if (draftFilters.statuses.length === 1) {
      return draftFilters.statuses[0]
    }

    return `${draftFilters.statuses.length} status selecionados`
  }, [draftFilters.statuses])

  // Query para buscar dados do Supabase
  const {
    data: turnosData,
    isLoading,
    isFetching,
    refetch
  } = useQuery({
    queryKey: [
      'oee-turnos',
      currentPage,
      itemsPerPage,
      searchTerm,
      serializarIdsSelecionados(appliedFilters.turnoIds),
      appliedFilters.produto,
      serializarStatusSelecionados(appliedFilters.statuses),
      dataInicio,
      dataFim
    ],
    queryFn: async () => {
      // Construir filtro de busca combinando texto
      const searchFilter = [
        searchTerm,
        appliedFilters.produto
      ].filter(Boolean).join(' ')

      return await fetchOeeTurnos(
        {
          searchTerm: searchFilter || undefined,
          turnoIds: turnoIdsAplicados.length > 0 ? turnoIdsAplicados : undefined,
          statuses: appliedFilters.statuses.length > 0 ? appliedFilters.statuses : undefined,
          dataInicio: converterDataBrParaIso(dataInicio),
          dataFim: converterDataBrParaIso(dataFim)
        },
        currentPage,
        itemsPerPage
      )
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000 // 10 minutos
  })

  // Dados paginados já vêm do Supabase
  const turnosPaginados = useMemo(
    () => turnosData?.data ?? TURNOS_VAZIOS,
    [turnosData?.data]
  )
  const totalItems = turnosData?.count || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const totalPagesValidas = Math.max(totalPages, 1)
  const paginaAtualExibida = Math.min(currentPage, totalPagesValidas)
  const inicioFaixaItens = totalItems === 0 ? 0 : (paginaAtualExibida - 1) * itemsPerPage + 1
  const fimFaixaItens = totalItems === 0 ? 0 : Math.min(paginaAtualExibida * itemsPerPage, totalItems)

  // Sincroniza a página atual quando o backend corrige paginação fora do intervalo.
  useEffect(() => {
    const paginaCorrigida = turnosData?.page
    if (!paginaCorrigida || paginaCorrigida === currentPage) {
      return
    }

    setCurrentPage(paginaCorrigida)
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      if (paginaCorrigida > 1) {
        params.set('page', String(paginaCorrigida))
      } else {
        params.delete('page')
      }
      return params
    }, { replace: true })
  }, [turnosData?.page, currentPage, setSearchParams])

  // Segurança adicional: mantém o estado da página dentro do total calculado.
  useEffect(() => {
    if (currentPage <= totalPagesValidas) {
      return
    }

    setCurrentPage(totalPagesValidas)
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      if (totalPagesValidas > 1) {
        params.set('page', String(totalPagesValidas))
      } else {
        params.delete('page')
      }
      return params
    }, { replace: true })
  }, [currentPage, totalPagesValidas, setSearchParams])

  useEffect(() => {
    if (menuTurnoAberto) {
      campoBuscaTurnoRef.current?.focus()
    }
  }, [menuTurnoAberto])

  useEffect(() => {
    if (!menuTurnoAberto && buscaTurno) {
      setBuscaTurno('')
    }
  }, [buscaTurno, menuTurnoAberto])

  useEffect(() => {
    if (turnosPaginados.length === 0) {
      return
    }

    let ativo = true

    const turnosValidos = turnosPaginados
      .map((turno) => ({
        id: turno.id,
        idNumerico: Number(turno.id)
      }))
      .filter((turno) => Number.isFinite(turno.idNumerico))

    if (turnosValidos.length === 0) {
      return
    }

    const carregarOee = async () => {
      setCarregandoOeePorTurno((prev) => {
        const proximo = { ...prev }
        turnosValidos.forEach((turno) => {
          proximo[turno.id] = true
        })
        return proximo
      })

      const resultados = await Promise.all(
        turnosValidos.map(async (turno) => ({
          id: turno.id,
          oee: await buscarOeePorTurno(turno.idNumerico)
        }))
      )

      if (!ativo) {
        return
      }

      setOeePorTurno((prev) => {
        const proximo = { ...prev }
        resultados.forEach((resultado) => {
          proximo[resultado.id] = resultado.oee
        })
        return proximo
      })

      setCarregandoOeePorTurno((prev) => {
        const proximo = { ...prev }
        turnosValidos.forEach((turno) => {
          proximo[turno.id] = false
        })
        return proximo
      })
    }

    carregarOee()

    return () => {
      ativo = false
    }
  }, [turnosPaginados])

  // Resetar página para 1 quando searchTerm, filtros ou datas mudarem
  useEffect(() => {
    const prevFilters = prevFiltersRef.current
    const turnosAlterados =
      serializarIdsSelecionados(prevFilters.turnoIds) !== serializarIdsSelecionados(appliedFilters.turnoIds)
    const filtersChanged =
      turnosAlterados ||
      prevFilters.produto !== appliedFilters.produto ||
      serializarStatusSelecionados(prevFilters.statuses) !== serializarStatusSelecionados(appliedFilters.statuses)
    const searchChanged = prevSearchTermRef.current !== searchTerm
    const dataInicioChanged = prevDataInicioRef.current !== dataInicio
    const dataFimChanged = prevDataFimRef.current !== dataFim
    if (!filtersChanged && !searchChanged && !dataInicioChanged && !dataFimChanged) {
      return
    }
    prevFiltersRef.current = appliedFilters
    prevSearchTermRef.current = searchTerm
    prevDataInicioRef.current = dataInicio
    prevDataFimRef.current = dataFim
    setCurrentPage(1)
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.set('page', '1')
      return newParams
    })
  }, [searchTerm, appliedFilters, dataInicio, dataFim, setSearchParams])

  // Handler para mudança de página (sincroniza com query string)
  const handlePageChange = (page: number) => {
    const next = Math.max(1, page)
    setCurrentPage(next)
    try {
      const params = new URLSearchParams(searchParams)
      if (next > 1) {
        params.set('page', String(next))
      } else {
        params.delete('page')
      }
      setSearchParams(params, { replace: true })
    } catch { /* noop */ }
  }

  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size)
    setCurrentPage(1)
    // Atualiza query param para refletir primeira página
    try {
      const params = new URLSearchParams(searchParams)
      params.delete('page')
      setSearchParams(params, { replace: true })
    } catch { /* noop */ }
    try {
      localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(size))
    } catch { /* noop */ }
  }

  const alternarTurnoSelecionado = (turnoId: string) => {
    setDraftFilters((prev) => {
      if (prev.turnoIds.includes(turnoId)) {
        return {
          ...prev,
          turnoIds: prev.turnoIds.filter((id) => id !== turnoId)
        }
      }

      return {
        ...prev,
        turnoIds: [...prev.turnoIds, turnoId]
      }
    })
  }

  const alternarStatusSelecionado = (status: OeeTurnoStatus) => {
    setDraftFilters((prev) => {
      if (prev.statuses.includes(status)) {
        return {
          ...prev,
          statuses: prev.statuses.filter((item) => item !== status)
        }
      }

      return {
        ...prev,
        statuses: [...prev.statuses, status]
      }
    })
  }

  // Aplicar e limpar filtros
  const applyFilters = () => {
    setAppliedFilters({
      ...draftFilters,
      turnoIds: [...draftFilters.turnoIds],
      statuses: [...draftFilters.statuses]
    })
    setCurrentPage(1)
    try {
      const params = new URLSearchParams(searchParams)
      params.delete('page')
      setSearchParams(params, { replace: true })
    } catch { /* noop */ }
    setOpenFilterDialog(false)
  }

  const clearFilters = () => {
    const cleared = {
      turnoIds: [] as string[],
      produto: '',
      statuses: [] as OeeTurnoStatus[],
    }
    const dataAtual = obterDataAtualFormatada()
    setDraftFilters(cleared)
    setAppliedFilters(cleared)
    setDataInicio(dataAtual)
    setDataFim(dataAtual)
    setCurrentPage(1)
    try {
      const params = new URLSearchParams(searchParams)
      params.delete('page')
      setSearchParams(params, { replace: true })
    } catch { /* noop */ }
  }

  const handleVisualizar = (turno: OeeTurnoFormData) => {
    // Navega para a página de apontamento OEE com o ID do turno
    navigate(`/apontamento-oee?oeeturno_id=${turno.id}`)
  }

  const validarPermissaoEdicaoTurnoFechado = async (): Promise<boolean> => {
    if (!authUser?.id) {
      return false
    }

    const parametrosBase = {
      p_user_id: authUser.id,
      p_rotina: ROTINA_PERMISSAO_OEE_TURNO
    }

    const tentativaComApp = await supabase.rpc('check_user_permission', {
      ...parametrosBase,
      p_app_id: SYSOEE_APP_ID
    })

    if (!tentativaComApp.error) {
      return tentativaComApp.data === true
    }

    const mensagemErro = `${tentativaComApp.error.message ?? ''}`.toLowerCase()
    const deveTentarSemApp =
      tentativaComApp.error.code === 'PGRST202' ||
      tentativaComApp.error.code === '42883' ||
      mensagemErro.includes('function check_user_permission') ||
      mensagemErro.includes('does not exist')

    if (!deveTentarSemApp) {
      console.error('Erro ao validar permissão no backend:', tentativaComApp.error)
      return false
    }

    const tentativaSemApp = await supabase.rpc('check_user_permission', parametrosBase)

    if (tentativaSemApp.error) {
      console.error('Erro ao validar permissão no backend:', tentativaSemApp.error)
      return false
    }

    return tentativaSemApp.data === true
  }

  const handleEditar = async (turno: OeeTurnoFormData) => {
    // Se o turno está fechado, exibir modal de alerta
    if (turno.status === 'Fechado') {
      const permitido = await validarPermissaoEdicaoTurnoFechado()

      if (!permitido) {
        setTurnoParaVisualizar(turno)
        setIsStatusFechadoDialogOpen(true)
        return
      }
    }
    // Se está aberto, permitir edição normalmente
    navigate(`/apontamento-oee?oeeturno_id=${turno.id}&edit=true`)
  }

  const handleConfirmarVisualizacaoFechado = () => {
    if (turnoParaVisualizar) {
      // Redireciona para consulta (SEM edit=true)
      navigate(`/apontamento-oee?oeeturno_id=${turnoParaVisualizar.id}`)
    }
    setIsStatusFechadoDialogOpen(false)
    setTurnoParaVisualizar(null)
  }

  const validarPermissaoExclusao = async (): Promise<boolean> => {
    if (!authUser?.id) {
      return false
    }

    try {
      const { data, error } = await supabase
        .from('tbusuario')
        .select('usuario_id, perfil')
        .eq('user_id', authUser.id)
        .eq('deletado', 'N')
        .maybeSingle()

      if (error || !data?.perfil) {
        if (error) {
          console.error('Erro ao validar perfil para exclusão:', error)
        }
        return false
      }

      if (!Number.isFinite(data.usuario_id)) {
        console.error('Usuário interno não identificado para exclusão.')
        return false
      }

      const perfilNormalizado = data.perfil.trim().toLowerCase()
      const permitido = perfilNormalizado === 'administrador' || perfilNormalizado === 'supervisor'
      if (permitido) {
        setUsuarioIdAutenticado(data.usuario_id)
      }
      return permitido
    } catch (error) {
      console.error('Erro inesperado ao validar perfil:', error)
      return false
    }
  }

  const handleExcluirClick = async (turno: OeeTurnoFormData) => {
    const permitido = await validarPermissaoExclusao()
    if (!permitido) {
      setTurnoToDelete(null)
      setIsDeleteDialogOpen(false)
      setIsPermissionDialogOpen(true)
      return
    }

    setTurnoToDelete(turno)
    setIsDeleteDialogOpen(true)
  }

  const handleExcluirConfirm = async () => {
    if (turnoToDelete?.id) {
      try {
        if (!authUser?.id) {
          setIsDeleteDialogOpen(false)
          setIsPermissionDialogOpen(true)
          return
        }

        if (!Number.isFinite(usuarioIdAutenticado ?? NaN)) {
          setIsDeleteDialogOpen(false)
          setIsPermissionDialogOpen(true)
          return
        }

        const sucesso = await deleteOeeTurno(
          turnoToDelete.id,
          authUser.id,
          usuarioIdAutenticado as number
        )
        if (sucesso) {
          setIsDeleteDialogOpen(false)
          setTurnoToDelete(null)
          refetch() // Recarrega os dados
        }
      } catch (error) {
        console.error('Erro ao excluir turno OEE:', error)
      }
    }
  }

  const formatarData = (dataStr: string) => {
    try {
      if (!dataStr) {
        console.warn('[OeeTurno] dataApontamento vazio ou undefined')
        return '-'
      }
      // Formato esperado: yyyy-MM-dd (ex: 2025-12-01)
      // Adiciona T00:00:00 para evitar problemas de timezone
      const dataComHora = dataStr.includes('T') ? dataStr : `${dataStr}T00:00:00`
      const data = new Date(dataComHora)

      if (isNaN(data.getTime())) {
        console.warn('[OeeTurno] Data inválida:', dataStr)
        return dataStr
      }

      return format(data, 'dd/MM/yyyy', { locale: ptBR })
    } catch (err) {
      console.error('[OeeTurno] Erro ao formatar data:', dataStr, err)
      return dataStr
    }
  }

  const formatarHorario = (hora: string | null) => {
    if (!hora) return '-'
    // Remove segundos se presente (HH:MM:SS -> HH:MM)
    return hora.substring(0, 5)
  }

  const formatarLinhaProducao = (turno: OeeTurnoFormData) => {
    const nomeLinha = turno.linhaProducaoNome?.trim()
    if (nomeLinha) {
      return nomeLinha
    }
    if (turno.linhaProducaoId) {
      return `ID ${turno.linhaProducaoId}`
    }
    return 'N/A'
  }

  const getBadgeStatus = (status: OeeTurnoStatus | null): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' => {
    switch (status) {
      case 'Aberto': return 'info'
      case 'Fechado': return 'success'
      case 'Cancelado': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <>
      {/* Header da aplicação */}
      <AppHeader
        title="SICFAR OEE - Apontamentos por Turno"
        userName={user.name}
        userInitials={user.initials}
        userRole={user.role}
      />

      {/* Container mais fluido e responsivo para ocupar melhor o espaço disponível */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-0 max-w-none">
        <div className="flex flex-col gap-4">
          {/* Cabeçalho responsivo: empilha no mobile e distribui no desktop */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-[#1f2937]">Apontamentos OEE</h1>
              <p className="text-sm text-gray-500">Visualize e acompanhe os apontamentos de produção por turno</p>
            </div>
            <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:items-center">
              <Button
                variant="outline"
                className="flex w-full items-center justify-center gap-2 !bg-white !text-brand-primary !border-brand-primary hover:!bg-gray-50 hover:!border-brand-primary hover:!text-brand-primary min-h-11 sm:min-h-10 px-4"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <Button
                variant="outline"
                className="flex w-full items-center justify-center gap-2 !bg-brand-primary !text-white !border-brand-primary hover:!bg-brand-primary/90 hover:!border-brand-primary/90 hover:!text-white min-h-11 sm:min-h-10 px-4"
                onClick={() => navigate('/oee-resumo-turno')}
              >
                <ClipboardList className="h-4 w-4" />
                Resumo
              </Button>
              <Button
                variant="outline"
                className="flex w-full items-center justify-center gap-2 !bg-brand-primary !text-white !border-brand-primary hover:!bg-brand-primary/90 hover:!border-brand-primary/90 hover:!text-white min-h-11 sm:min-h-10 px-4"
                onClick={() => navigate('/apontamento-oee?modo=inclusao')}
              >
                <Activity className="h-4 w-4" />
                Novo Apontamento
              </Button>
            </div>
          </div>

          {/* Card principal como coluna flex para permitir que o conteúdo ocupe a altura disponível */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden mb-6">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 leading-tight">Lista de Apontamentos</h2>
                  <p className="text-sm text-gray-500">
                    Total de {totalItems} apontamentos encontrados
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2 md:items-end md:self-center">
                  <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 sm:hidden">
                    Página {paginaAtualExibida} de {totalPagesValidas}
                  </div>
                  <div className="hidden sm:flex sm:items-center sm:gap-3 sm:flex-wrap md:justify-end">
                    <DataPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      itemsPerPage={itemsPerPage}
                      totalItems={totalItems}
                      showInfo={false}
                      className="!border-0 !bg-transparent !px-0 !py-0 !justify-end"
                    />
                  </div>
                  {isLoading && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Carregando...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Conteúdo cresce para ocupar o espaço vertical */}
            <div className="px-4 sm:px-6 py-4 flex flex-col">
              {/* Barra de busca, período e ações responsiva */}
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
                <div className="relative w-full md:flex-1 max-w-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Pesquisar por linha, turno, SKU ou produto..."
                    className="h-11 md:h-10 pl-10 w-full border border-gray-200 rounded-md text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filtro de período por data */}
                <div className="flex flex-col gap-1 md:shrink-0">
                  <Label className="text-xs font-medium text-gray-500">Período</Label>
                  <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-2">
                    <div className="space-y-1 sm:space-y-0">
                      <Label className="text-[11px] text-gray-500 sm:hidden">Data inicial</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="dd/mm/aaaa"
                          className="h-10 w-full min-w-0 text-sm border border-gray-200 rounded-md"
                          value={dataInicio}
                          onChange={(e) => setDataInicio(formatarDataDigitada(e.target.value))}
                        />
                        <Popover open={calendarioInicioAberto} onOpenChange={setCalendarioInicioAberto}>
                          <PopoverTrigger asChild>
                            <Button type="button" variant="outline" size="icon" className="h-10 w-10 shrink-0" aria-label="Selecionar data inicial">
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
                                  setDataInicio(format(date, 'dd/MM/yyyy'))
                                }
                                setCalendarioInicioAberto(false)
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <span className="hidden text-xs text-gray-400 sm:inline">até</span>
                    <div className="space-y-1 sm:space-y-0">
                      <Label className="text-[11px] text-gray-500 sm:hidden">Data final</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="dd/mm/aaaa"
                          className="h-10 w-full min-w-0 text-sm border border-gray-200 rounded-md"
                          value={dataFim}
                          onChange={(e) => setDataFim(formatarDataDigitada(e.target.value))}
                        />
                        <Popover open={calendarioFimAberto} onOpenChange={setCalendarioFimAberto}>
                          <PopoverTrigger asChild>
                            <Button type="button" variant="outline" size="icon" className="h-10 w-10 shrink-0" aria-label="Selecionar data final">
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
                                  setDataFim(format(date, 'dd/MM/yyyy'))
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

                <div className="flex flex-col gap-2 md:shrink-0 sm:flex-row">
                  <Dialog open={openFilterDialog} onOpenChange={(o) => {
                    setOpenFilterDialog(o)
                    if (!o) {
                      setMenuTurnoAberto(false)
                      setMenuStatusAberto(false)
                    }
                    if (o) {
                      setDraftFilters({
                        ...appliedFilters,
                        turnoIds: [...appliedFilters.turnoIds],
                        statuses: [...appliedFilters.statuses]
                      })
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex w-full items-center justify-center gap-2 !bg-brand-primary !text-white !border-brand-primary hover:!bg-brand-primary/90 hover:!border-brand-primary/90 hover:!text-white min-h-11 sm:min-h-10 px-4"
                      >
                        <Filter className="h-4 w-4" />
                        Filtros
                        {appliedCountBadge > 0 && (
                          <Badge variant="secondary" className="ml-1">{appliedCountBadge}</Badge>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-full max-w-[calc(100vw-1rem)] sm:max-w-[680px] md:max-w-[760px] lg:max-w-[820px] max-h-[90dvh] overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-[0_25px_60px_rgba(20,27,27,0.12),0_8px_24px_rgba(20,27,27,0.08),0_0_0_1px_rgba(15,23,42,0.05)] [&>button]:right-4 [&>button]:top-4 [&>button]:h-8 [&>button]:w-8 [&>button]:rounded-md [&>button]:text-slate-400 [&>button]:opacity-100 [&>button]:hover:bg-slate-100 [&>button]:hover:text-slate-600">
                      <div className="flex max-h-[90dvh] flex-col">
                        <div className="border-b border-slate-100 px-4 py-4 sm:px-5 sm:py-5 md:px-6 lg:px-7">
                          <DialogHeader className="text-left">
                            <div className="flex items-center gap-3 pr-8 sm:pr-10">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                                <svg
                                  width={18}
                                  height={18}
                                  viewBox="0 0 18 18"
                                  fill="none"
                                  aria-hidden="true"
                                  className="shrink-0"
                                >
                                  <path
                                    d="M2.25 4.5H15.75M4.5 9H13.5M6.75 13.5H11.25"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <DialogTitle className="text-[1.125rem] font-semibold leading-tight tracking-[-0.02em] text-gray-700">
                                    Filtrar Apontamentos
                                  </DialogTitle>
                                  {draftCountBadge > 0 && (
                                    <Badge
                                      variant="secondary"
                                      className="mt-0.5 border border-brand-primary/20 bg-brand-primary/10 text-xs text-brand-primary"
                                    >
                                      {draftCountBadge} ativos
                                    </Badge>
                                  )}
                                </div>
                                <DialogDescription className="text-xs leading-normal tracking-[-0.01em] text-slate-500 sm:text-sm">
                                  Refine seus resultados de busca com filtros específicos.
                                </DialogDescription>
                              </div>
                            </div>
                          </DialogHeader>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 md:px-6 lg:px-7">
                          <div className="space-y-4 sm:space-y-5">
                            <section className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/40 p-4 sm:p-5">
                              <div className="flex items-start justify-between gap-3">
                                <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-slate-700">
                                  Turnos
                                </p>
                                {draftFilters.turnoIds.length > 0 && (
                                  <span className="whitespace-nowrap text-[11px] font-medium text-brand-primary sm:text-xs">
                                    {draftFilters.turnoIds.length}{' '}
                                    selecionado{draftFilters.turnoIds.length > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>

                              <div>
                                <DropdownMenu open={menuTurnoAberto} onOpenChange={setMenuTurnoAberto}>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      id="f-turno"
                                      variant="outline"
                                      className="h-10 w-full justify-between rounded-xl border-slate-200 bg-white px-3.5 text-left font-normal text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-brand-primary/25"
                                    >
                                      <span className="truncate">{resumoTurnosSelecionados}</span>
                                      <ChevronDown className="h-4 w-4 text-slate-400" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="start"
                                    className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl border-slate-200 bg-white p-0 shadow-lg"
                                  >
                                    <div className="p-2">
                                      <Input
                                        ref={campoBuscaTurnoRef}
                                        placeholder="Buscar turno"
                                        className="h-10 rounded-lg border-slate-200 bg-slate-50/50"
                                        value={buscaTurno}
                                        onChange={(event) => setBuscaTurno(event.target.value)}
                                        onKeyDown={(event) => {
                                          if (event.key !== 'Escape') {
                                            event.stopPropagation()
                                          }
                                        }}
                                      />
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuCheckboxItem
                                      className="min-h-10 rounded-sm px-2 py-2 text-sm data-[state=checked]:bg-brand-primary/10 [&>span]:hidden"
                                      checked={draftFilters.turnoIds.length === 0}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setDraftFilters((prev) => ({ ...prev, turnoIds: [] }))
                                        }
                                      }}
                                      onSelect={(event) => event.preventDefault()}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`flex h-4 w-4 items-center justify-center rounded-[3px] border transition-colors ${
                                            draftFilters.turnoIds.length === 0
                                              ? 'border-brand-primary bg-brand-primary text-white'
                                              : 'border-input bg-background text-transparent'
                                          }`}
                                        >
                                          <Check className="h-3 w-3" />
                                        </span>
                                        <span>Todos os turnos</span>
                                      </div>
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuSeparator />
                                    <div className="max-h-64 overflow-y-auto">
                                      {turnosFiltradosDropdown.length === 0 ? (
                                        <div className="px-2 py-2 text-sm text-muted-foreground">
                                          Nenhum turno encontrado.
                                        </div>
                                      ) : (
                                        turnosFiltradosDropdown.map((turno) => {
                                          const turnoId = String(turno.turno_id)
                                          const selecionado = draftFilters.turnoIds.includes(turnoId)
                                          return (
                                            <DropdownMenuCheckboxItem
                                              key={turno.turno_id}
                                              className="min-h-10 rounded-sm px-2 py-2 text-sm data-[state=checked]:bg-brand-primary/10 [&>span]:hidden"
                                              checked={selecionado}
                                              onCheckedChange={() => alternarTurnoSelecionado(turnoId)}
                                              onSelect={(event) => event.preventDefault()}
                                            >
                                              <div className="flex items-center gap-2">
                                                <span
                                                  className={`flex h-4 w-4 items-center justify-center rounded-[3px] border transition-colors ${
                                                    selecionado
                                                      ? 'border-brand-primary bg-brand-primary text-white'
                                                      : 'border-input bg-background text-transparent'
                                                  }`}
                                                >
                                                  <Check className="h-3 w-3" />
                                                </span>
                                                <span>{formatarLabelTurno(turno)}</span>
                                              </div>
                                            </DropdownMenuCheckboxItem>
                                          )
                                        })
                                      )}
                                    </div>
                                    <DropdownMenuSeparator />
                                    <div className="flex justify-end p-2">
                                      <Button
                                        type="button"
                                        variant="secondary"
                                        className="h-9 w-24 rounded-lg"
                                        onClick={() => setMenuTurnoAberto(false)}
                                      >
                                        Fechar
                                      </Button>
                                    </div>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </section>

                            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                            <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                              <div className="mb-3 space-y-1 sm:mb-4">
                                <p className="inline-flex items-center gap-2 text-[14px] font-semibold uppercase tracking-[0.08em] text-slate-700">
                                  Produto
                                </p>
                              </div>

                              <div className="space-y-2 sm:space-y-3">
                                <div className="relative">
                                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                  <Input
                                    id="f-produto"
                                    placeholder="Buscar produto... ex.: SOL. CLORETO"
                                    className="h-10 rounded-xl border-slate-200 bg-slate-50/50 pl-9 pr-9 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-brand-primary/25"
                                    value={draftFilters.produto}
                                    onChange={(e) => setDraftFilters((p) => ({ ...p, produto: e.target.value }))}
                                  />
                                  {draftFilters.produto && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                      onClick={() => setDraftFilters((p) => ({ ...p, produto: '' }))}
                                      aria-label="Limpar produto"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                </div>
                              </div>

                              <div className="mt-5 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                              <div className="mt-5 space-y-2 sm:space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                  <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-slate-700">
                                    Status
                                  </p>
                                  {draftFilters.statuses.length > 0 && (
                                    <span className="whitespace-nowrap text-[11px] font-medium text-brand-primary sm:text-xs">
                                      {draftFilters.statuses.length}{' '}
                                      selecionado{draftFilters.statuses.length > 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                                <DropdownMenu open={menuStatusAberto} onOpenChange={setMenuStatusAberto}>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      id="f-status"
                                      variant="outline"
                                      className="h-10 w-full justify-between rounded-xl border-slate-200 bg-white px-3.5 text-left font-normal text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-brand-primary/25"
                                    >
                                      <span className="truncate">{resumoStatusSelecionados}</span>
                                      <ChevronDown className="h-4 w-4 text-slate-400" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="start"
                                    className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl border-slate-200 bg-white p-0 shadow-lg"
                                  >
                                    <DropdownMenuCheckboxItem
                                      className="min-h-10 rounded-sm px-2 py-2 text-sm data-[state=checked]:bg-brand-primary/10 [&>span]:hidden"
                                      checked={draftFilters.statuses.length === 0}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setDraftFilters((prev) => ({ ...prev, statuses: [] }))
                                        }
                                      }}
                                      onSelect={(event) => event.preventDefault()}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`flex h-4 w-4 items-center justify-center rounded-[3px] border transition-colors ${
                                            draftFilters.statuses.length === 0
                                              ? 'border-brand-primary bg-brand-primary text-white'
                                              : 'border-input bg-background text-transparent'
                                          }`}
                                        >
                                          <Check className="h-3 w-3" />
                                        </span>
                                        <span>Todos os status</span>
                                      </div>
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuSeparator />
                                    {STATUS_OEE_DISPONIVEIS.map((status) => {
                                      const selecionado = draftFilters.statuses.includes(status)
                                      return (
                                        <DropdownMenuCheckboxItem
                                          key={status}
                                          className="min-h-10 rounded-sm px-2 py-2 text-sm data-[state=checked]:bg-brand-primary/10 [&>span]:hidden"
                                          checked={selecionado}
                                          onCheckedChange={() => alternarStatusSelecionado(status)}
                                          onSelect={(event) => event.preventDefault()}
                                        >
                                          <div className="flex items-center gap-2">
                                            <span
                                              className={`flex h-4 w-4 items-center justify-center rounded-[3px] border transition-colors ${
                                                selecionado
                                                  ? 'border-brand-primary bg-brand-primary text-white'
                                                  : 'border-input bg-background text-transparent'
                                              }`}
                                            >
                                              <Check className="h-3 w-3" />
                                            </span>
                                            <span>{status}</span>
                                          </div>
                                        </DropdownMenuCheckboxItem>
                                      )
                                    })}
                                    <DropdownMenuSeparator />
                                    <div className="flex justify-end p-2">
                                      <Button
                                        type="button"
                                        variant="secondary"
                                        className="h-9 w-24 rounded-lg"
                                        onClick={() => setMenuStatusAberto(false)}
                                      >
                                        Fechar
                                      </Button>
                                    </div>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </section>
                          </div>
                        </div>

                        <DialogFooter className="border-t border-slate-100 bg-white/95 px-4 py-4 sm:px-5 md:px-6 lg:px-7">
                          <div className="grid w-full grid-cols-1 gap-3 sm:flex sm:items-center sm:justify-end">
                            <div className="grid grid-cols-1 gap-2 sm:flex sm:items-center sm:gap-2 md:gap-3">
                              <Button
                                type="button"
                                variant="outline"
                                className="h-10 min-w-[132px] rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                                onClick={() => setOpenFilterDialog(false)}
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="button"
                                className="h-10 min-w-[168px] rounded-xl bg-brand-primary text-white shadow-[0_4px_16px_rgba(6,98,195,0.24)] transition-colors hover:bg-brand-primary/90"
                                onClick={applyFilters}
                              >
                                Aplicar filtros
                                {draftCountBadge > 0 && (
                                  <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-md bg-white/20 px-1.5 text-[11px] font-semibold">
                                    {draftCountBadge}
                                  </span>
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogFooter>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="flex w-full items-center justify-center gap-2 !bg-brand-primary !text-white !border-brand-primary hover:!bg-brand-primary/90 hover:!border-brand-primary/90 hover:!text-white min-h-11 sm:min-h-10 px-4"
                    title="Atualizar lista"
                  >
                    <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    Atualizar
                  </Button>
                </div>
              </div>

              {/* Lista mobile em cards + tabela para telas maiores */}
              <div className="relative">
                {/* Overlay de carregamento exibido sempre que houver busca em andamento */}
                {isFetching && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                    <div className="flex items-center gap-2 text-[#242f65] text-sm font-medium">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Aguarde, carregando dados...
                    </div>
                  </div>
                )}

                {/* Cards para mobile */}
                <div className="sm:hidden space-y-4">
                  {turnosPaginados.length === 0 && !isLoading ? (
                    <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500 bg-gray-50">
                      <div>
                        {searchTerm || appliedCount > 0 ?
                          'Nenhum turno encontrado com os filtros aplicados.' :
                          'Nenhum turno cadastrado.'
                        }
                      </div>
                    </div>
                  ) : (
                    turnosPaginados.map((turno: OeeTurnoFormData) => (
                      <div
                        key={turno.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleVisualizar(turno)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleVisualizar(turno)
                          }
                        }}
                        className="w-full text-left rounded-2xl border border-gray-200 bg-white p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/60 transition-all cursor-pointer active:scale-[0.995]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Data/Turno</p>
                            <p className="text-base font-semibold text-gray-900">{formatarData(turno.data)}</p>
                            <p className="mt-1 text-sm text-gray-700 truncate">{turno.turno}</p>
                            <p className="mt-1 text-[11px] text-gray-500">Lançamento: {turno.id}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">OEE</span>
                              {carregandoOeePorTurno[turno.id] || oeePorTurno[turno.id] === undefined ? (
                                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-[10px] text-gray-500">
                                  ...
                                </div>
                              ) : (
                                <div className="relative inline-flex h-11 w-11 items-center justify-center">
                                  <svg className="h-11 w-11 -rotate-90" viewBox="0 0 120 120">
                                    <circle
                                      className="stroke-gray-200"
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
                                      strokeDashoffset={339.292 - (339.292 * (oeePorTurno[turno.id] ?? 0)) / 100}
                                      strokeLinecap="round"
                                      strokeWidth="12"
                                      stroke={calcularCorOee(oeePorTurno[turno.id]) ?? '#9CA3AF'}
                                      style={{ transition: 'stroke-dashoffset 0.3s ease-in-out, stroke 0.3s ease-in-out' }}
                                    />
                                  </svg>
                                  <span
                                    className="absolute text-[10px] font-bold"
                                    style={{ color: calcularCorOee(oeePorTurno[turno.id]) ?? undefined }}
                                  >
                                    {Math.round(oeePorTurno[turno.id] ?? 0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <Badge variant={getBadgeStatus(turno.status)} className="flex items-center">
                              <Target className="h-3 w-3 mr-1" />
                              {turno.status || 'N/A'}
                            </Badge>
                            <span className="text-[10px] text-gray-500">
                              Por: {turno.createdByLogin || 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
                          <div className="flex items-start gap-2 col-span-2">
                            <Package className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500">Produto</p>
                              <p className="font-semibold text-gray-900 line-clamp-2">{turno.produto}</p>
                              <p className="text-xs text-gray-500 mt-1 truncate" title={formatarLinhaProducao(turno)}>
                                Linha: {formatarLinhaProducao(turno)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Início</p>
                              <p className="font-semibold text-gray-900">{formatarHorario(turno.horaInicio)}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Fim</p>
                              <p className="font-semibold text-gray-900">{formatarHorario(turno.horaFim)}</p>
                            </div>
                          </div>
                        </div>

                        {turno.observacao && (
                          <div className="mt-3 rounded-md bg-gray-50 px-2.5 py-2 text-xs text-gray-500 line-clamp-2 border border-gray-100">
                            {turno.observacao}
                          </div>
                        )}

                        <p className="mt-3 text-[11px] text-gray-500">Toque no card para consultar detalhes</p>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10"
                            onClick={(e) => {
                              e.stopPropagation()
                              void handleEditar(turno)
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 text-destructive border-destructive/60 hover:border-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              void handleExcluirClick(turno)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Tabela para telas médias e maiores */}
                <div
                  ref={tableContainerRef}
                  className="hidden sm:block relative overflow-auto rounded-lg border border-gray-200"
                  style={{ maxHeight: '60vh' }}
                >
                  <table className="w-full table-auto">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr className="border-b border-gray-200">
                        <th className="bg-gray-50 px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                        <th className="bg-gray-50 px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[12ch]">
                          Turno
                        </th>
                        <th className="bg-gray-50 px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[10ch]">
                          Status
                        </th>
                        <th className="bg-gray-50 px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[10ch]">
                          OEE
                        </th>
                        <th className="bg-gray-50 px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[10ch]">
                          Data
                        </th>
                        <th className="bg-gray-50 px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[25ch]">
                          Produto
                        </th>
                        <th className="bg-gray-50 px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[8ch]">
                          Início
                        </th>
                        <th className="bg-gray-50 px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[8ch]">
                          Fim
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {turnosPaginados.length === 0 && !isLoading ? (
                        <tr>
                          <td colSpan={8} className="px-4 md:px-6 py-8 text-center">
                            <div className="text-gray-500">
                              {searchTerm || appliedCount > 0 ?
                                'Nenhum turno encontrado com os filtros aplicados.' :
                                'Nenhum turno cadastrado.'
                              }
                            </div>
                          </td>
                        </tr>
                      ) : (
                        turnosPaginados.map((turno: OeeTurnoFormData) => (
                          <tr
                            key={turno.id}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                              <div className="flex justify-start gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-[#242f65]"
                                  title="Visualizar"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleVisualizar(turno)
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-[#242f65]"
                                  title="Editar"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    void handleEditar(turno)
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  title="Excluir"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    void handleExcluirClick(turno)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {turno.turno}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex flex-col items-center gap-1">
                                <Badge variant={getBadgeStatus(turno.status)}>
                                  {turno.status || 'N/A'}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  Por: {turno.createdByLogin || 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center">
                              {carregandoOeePorTurno[turno.id] || oeePorTurno[turno.id] === undefined ? (
                                <span className="text-sm text-gray-600">...</span>
                              ) : (
                                <div className="relative inline-flex items-center justify-center w-10 h-10">
                                  <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 120 120">
                                    {/* Círculo de fundo (trilha) */}
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
                                      cx="60"
                                      cy="60"
                                      fill="none"
                                      r="54"
                                      strokeDasharray="339.292"
                                      strokeDashoffset={339.292 - (339.292 * (oeePorTurno[turno.id] ?? 0)) / 100}
                                      strokeLinecap="round"
                                      strokeWidth="12"
                                      stroke={calcularCorOee(oeePorTurno[turno.id]) ?? '#9CA3AF'}
                                      style={{ transition: 'stroke-dashoffset 0.3s ease-in-out, stroke 0.3s ease-in-out' }}
                                    />
                                  </svg>
                                  {/* Valor percentual centralizado */}
                                  <span
                                    className="absolute text-[9px] font-bold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[1px]"
                                    style={{ color: calcularCorOee(oeePorTurno[turno.id]) ?? undefined }}
                                  >
                                    {Math.round(oeePorTurno[turno.id] ?? 0)}%
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3 text-gray-400" />
                                  {formatarData(turno.data)}
                                </div>
                                <div className="text-xs text-gray-500 font-normal">
                                  Lançamento: {turno.id}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 text-sm text-gray-600 max-w-[300px]">
                              <div className="flex flex-col gap-1">
                                <span className="truncate block" title={turno.produto}>{turno.produto}</span>
                                <span className="truncate text-xs text-gray-500" title={formatarLinhaProducao(turno)}>
                                  Linha: {formatarLinhaProducao(turno)}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                {formatarHorario(turno.horaInicio)}
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                {formatarHorario(turno.horaFim)}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Componente de Paginação reutilizável */}
            <div className="sm:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-gray-600">
                  Mostrando {inicioFaixaItens} a {fimFaixaItens} de {totalItems}
                </p>
                <div className="flex items-center gap-2">
                  <Label htmlFor="itens-por-pagina-mobile" className="text-xs text-gray-500">Por página</Label>
                  <select
                    id="itens-por-pagina-mobile"
                    value={String(itemsPerPage)}
                    className="h-9 rounded-md border border-gray-200 bg-white px-2.5 text-xs text-gray-700"
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  >
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-10"
                  onClick={() => handlePageChange(paginaAtualExibida - 1)}
                  disabled={paginaAtualExibida <= 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  className="h-10"
                  onClick={() => handlePageChange(paginaAtualExibida + 1)}
                  disabled={paginaAtualExibida >= totalPagesValidas}
                >
                  Próxima
                </Button>
              </div>
              <p className="text-center text-xs text-gray-500">
                Página {paginaAtualExibida} de {totalPagesValidas}
              </p>
            </div>

            <div className="hidden sm:block">
              <DataPagination
                containerRef={paginationRef}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                showInfo={true}
                pageSizeOptions={PAGE_SIZE_OPTIONS as unknown as number[]}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          </div>

          {/* Dialog de confirmação de exclusão */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o turno <strong>{turnoToDelete?.turno}</strong> (Lançamento: <strong>{turnoToDelete?.id ?? '-'}</strong>) do dia <strong>{turnoToDelete?.data ? formatarData(turnoToDelete.data) : ''}</strong>?
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleExcluirConfirm}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Permissão necessária</AlertDialogTitle>
                <AlertDialogDescription>
                  {MENSAGEM_PERMISSAO_EXCLUSAO}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setIsPermissionDialogOpen(false)}>
                  Entendi
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Dialog de alerta para turno fechado */}
          <AlertDialog open={isStatusFechadoDialogOpen} onOpenChange={setIsStatusFechadoDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Turno Encerrado</AlertDialogTitle>
                <AlertDialogDescription>
                  O turno <strong>{turnoParaVisualizar?.turno}</strong> do dia{' '}
                  <strong>{turnoParaVisualizar?.data ? formatarData(turnoParaVisualizar.data) : ''}</strong>{' '}
                  está com status <strong>Fechado</strong> e não pode ser editado.
                  <br /><br />
                  Você será redirecionado para a tela de consulta.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => {
                  setIsStatusFechadoDialogOpen(false)
                  setTurnoParaVisualizar(null)
                }}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmarVisualizacaoFechado}>
                  Consultar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </>
  )
}
