/**
 * Página de Listagem de Apontamentos OEE por Turno
 * Exibe tabela com todos os apontamentos de produção cadastrados no localStorage
 * Implementa padrões avançados de UI: paginação, filtros, busca em tempo real
 * Baseado no layout de Turnos.tsx com dados do localStorage como em ApontamentoOEE.tsx
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
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
import { AppHeader } from '@/components/layout/AppHeader'
import {
  buscarTodosApontamentosProducao,
  excluirApontamentoProducao,
  calcularOEECompleto
} from '@/services/localStorage/apontamento-oee.storage'
import { ApontamentoProducao, CalculoOEE } from '@/types/apontamento-oee'
import {
  Search,
  Pencil,
  Trash2,
  Clock,
  Target,
  RefreshCw,
  Filter,
  Loader2,
  Eye,
  ArrowLeft,
  Factory,
  Package,
  Activity
} from 'lucide-react'
import { DataPagination } from '@/components/ui/data-pagination'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Constantes estáveis no escopo do módulo para evitar warnings de dependências
const PAGE_SIZE_STORAGE_KEY = 'sysoee_oee_turno_items_per_page'
const PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const

// Interface para apontamento com OEE calculado
interface ApontamentoComOEE extends ApontamentoProducao {
  oeeCalculado: CalculoOEE
}

export default function OeeTurno() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(() => {
    const p = Number(searchParams.get('page'))
    return Number.isFinite(p) && p > 0 ? p : 1
  })

  // Controla quantidade de registros exibidos por página (persistido em localStorage)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  // Estados de UI
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [apontamentoToDelete, setApontamentoToDelete] = useState<ApontamentoComOEE | null>(null)
  const [openFilterDialog, setOpenFilterDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  // Dados carregados do localStorage
  const [apontamentos, setApontamentos] = useState<ApontamentoComOEE[]>([])

  // Refs para calcular altura disponível do grid
  const tableContainerRef = useRef<HTMLDivElement | null>(null)
  const paginationRef = useRef<HTMLDivElement | null>(null)

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

  // Estado de filtros aplicados (usado para consulta)
  const [appliedFilters, setAppliedFilters] = useState({
    linha: '',
    turno: '',
    sku: '',
    oeeMin: '',
    oeeMax: '',
  })

  // Estado de edição (no modal) - começa com os filtros aplicados
  const [draftFilters, setDraftFilters] = useState({
    linha: '',
    turno: '',
    sku: '',
    oeeMin: '',
    oeeMax: '',
  })

  // Contagem de filtros aplicados para badge
  const appliedCount = useMemo(() => {
    let count = 0
    const f = appliedFilters
    if (f.linha) count++
    if (f.turno) count++
    if (f.sku) count++
    if (f.oeeMin) count++
    if (f.oeeMax) count++
    return count
  }, [appliedFilters])

  // Função para carregar dados do localStorage
  const carregarDados = useCallback(() => {
    setIsFetching(true)
    try {
      const apontamentosRaw = buscarTodosApontamentosProducao()

      console.log('[OeeTurno] Apontamentos carregados do localStorage:', apontamentosRaw.length)

      // Calcula OEE para cada apontamento COM tratamento de erro individual
      const apontamentosComOEE: ApontamentoComOEE[] = apontamentosRaw.map((ap) => {
        try {
          // Usa o linhaId para buscar paradas relacionadas
          // O campo 'linha' armazena o nome da linha
          const oeeCalculado = calcularOEECompleto(ap.id, ap.linha, ap.tempoDisponivel)
          return {
            ...ap,
            oeeCalculado
          }
        } catch (err) {
          console.error('[OeeTurno] Erro ao calcular OEE para apontamento:', ap.id, err)
          // Retornar OEE zerado em caso de erro - permite que o apontamento ainda seja exibido
          return {
            ...ap,
            oeeCalculado: {
              disponibilidade: 0,
              performance: 0,
              qualidade: 0,
              oee: 0,
              tempoOperacionalLiquido: 0,
              tempoValioso: 0
            }
          }
        }
      })

      console.log('[OeeTurno] Apontamentos processados:', apontamentosComOEE.length)
      setApontamentos(apontamentosComOEE)
    } catch (error) {
      console.error('[OeeTurno] Erro ao carregar apontamentos:', error)
    } finally {
      setIsFetching(false)
      setIsLoading(false)
    }
  }, [])

  // Carrega dados ao montar o componente
  useEffect(() => {
    setIsLoading(true)
    carregarDados()
  }, [carregarDados])

  // Filtragem e paginação dos dados
  const dadosFiltrados = useMemo(() => {
    let filtered = [...apontamentos]

    // Aplicar busca por termo
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (ap) =>
          ap.linha.toLowerCase().includes(term) ||
          ap.turno.toLowerCase().includes(term) ||
          ap.sku.toLowerCase().includes(term) ||
          ap.produto.toLowerCase().includes(term)
      )
    }

    // Aplicar filtros
    if (appliedFilters.linha) {
      filtered = filtered.filter((ap) =>
        ap.linha.toLowerCase().includes(appliedFilters.linha.toLowerCase())
      )
    }

    if (appliedFilters.turno) {
      filtered = filtered.filter((ap) =>
        ap.turno.toLowerCase().includes(appliedFilters.turno.toLowerCase())
      )
    }

    if (appliedFilters.sku) {
      filtered = filtered.filter((ap) =>
        ap.sku.toLowerCase().includes(appliedFilters.sku.toLowerCase())
      )
    }

    // Filtro de OEE mínimo
    if (appliedFilters.oeeMin) {
      const min = parseFloat(appliedFilters.oeeMin)
      if (!isNaN(min)) {
        filtered = filtered.filter((ap) => ap.oeeCalculado.oee >= min)
      }
    }

    // Filtro de OEE máximo
    if (appliedFilters.oeeMax) {
      const max = parseFloat(appliedFilters.oeeMax)
      if (!isNaN(max)) {
        filtered = filtered.filter((ap) => ap.oeeCalculado.oee <= max)
      }
    }

    // Ordenar por data mais recente
    filtered.sort((a, b) => {
      const dataA = new Date(a.dataApontamento + 'T' + a.horaInicio)
      const dataB = new Date(b.dataApontamento + 'T' + b.horaInicio)
      return dataB.getTime() - dataA.getTime()
    })

    return filtered
  }, [apontamentos, searchTerm, appliedFilters])

  // Paginação
  const totalItems = dadosFiltrados.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const apontamentosPaginados = dadosFiltrados.slice(startIndex, startIndex + itemsPerPage)

  // Resetar página para 1 quando searchTerm ou filtros mudarem
  useEffect(() => {
    setCurrentPage(1)
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.set('page', '1')
      return newParams
    })
  }, [searchTerm, appliedFilters, setSearchParams])

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

  // Aplicar e limpar filtros
  const applyFilters = () => {
    setAppliedFilters({ ...draftFilters })
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
      linha: '',
      turno: '',
      sku: '',
      oeeMin: '',
      oeeMax: '',
    }
    setDraftFilters(cleared)
    setAppliedFilters(cleared)
    setCurrentPage(1)
    try {
      const params = new URLSearchParams(searchParams)
      params.delete('page')
      setSearchParams(params, { replace: true })
    } catch { /* noop */ }
  }

  const handleVisualizar = (apontamento: ApontamentoComOEE) => {
    // Navega para a página de apontamento OEE
    navigate(`/apontamento-oee?id=${apontamento.id}`)
  }

  const handleEditar = (apontamento: ApontamentoComOEE) => {
    navigate(`/apontamento-oee?id=${apontamento.id}&edit=true`)
  }

  const handleExcluirClick = (apontamento: ApontamentoComOEE) => {
    setApontamentoToDelete(apontamento)
    setIsDeleteDialogOpen(true)
  }

  const handleExcluirConfirm = async () => {
    if (apontamentoToDelete?.id) {
      try {
        const sucesso = excluirApontamentoProducao(apontamentoToDelete.id)
        if (sucesso) {
          setIsDeleteDialogOpen(false)
          setApontamentoToDelete(null)
          carregarDados() // Recarrega os dados
        }
      } catch (error) {
        console.error('Erro ao excluir apontamento:', error)
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

  const formatarOEE = (valor: number) => {
    return `${valor.toFixed(1)}%`
  }

  const getBadgeOEE = (oee: number): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' => {
    if (oee >= 85) return 'success'
    if (oee >= 75) return 'info'
    if (oee >= 60) return 'warning'
    return 'destructive'
  }

  const getBadgeDisponibilidade = (valor: number): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' => {
    if (valor >= 90) return 'success'
    if (valor >= 80) return 'info'
    if (valor >= 70) return 'warning'
    return 'destructive'
  }

  return (
    <>
      {/* Header da aplicação */}
      <AppHeader
        title="SICFAR OEE - Apontamentos por Turno"
        userName="Usuário"
        userRole="Administrador"
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 !bg-white !text-brand-primary !border-brand-primary hover:!bg-gray-50 hover:!border-brand-primary hover:!text-brand-primary min-h-10 px-4"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 !bg-brand-primary !text-white !border-brand-primary hover:!bg-brand-primary/90 hover:!border-brand-primary/90 hover:!text-white min-h-10 px-4"
                onClick={() => navigate('/apontamento-oee')}
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
                <div className="flex items-center gap-3 flex-wrap">
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
              {/* Barra de busca e ações responsiva */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <div className="relative w-full md:flex-1 max-w-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Pesquisar por linha, turno, SKU ou produto..."
                    className="pl-10 py-2 w-full border border-gray-200 rounded-md text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 md:shrink-0">
                  <Dialog open={openFilterDialog} onOpenChange={(o) => {
                    setOpenFilterDialog(o)
                    if (o) setDraftFilters({ ...appliedFilters })
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center justify-center gap-2 !bg-brand-primary !text-white !border-brand-primary hover:!bg-brand-primary/90 hover:!border-brand-primary/90 hover:!text-white min-h-10 px-4"
                      >
                        <Filter className="h-4 w-4" />
                        Filtros
                        {appliedCount > 0 && (
                          <Badge variant="secondary" className="ml-1">{appliedCount}</Badge>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-full sm:w-[95vw] max-w-[640px] max-h-[80vh] overflow-auto p-0">
                      <div className="p-4 sm:p-6">
                        <DialogHeader>
                          <DialogTitle>Filtrar Apontamentos</DialogTitle>
                          <DialogDescription>
                            Selecione os critérios para filtrar os apontamentos de produção.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="f-linha">Linha de Produção</Label>
                            <Input
                              id="f-linha"
                              placeholder="Ex.: Linha A"
                              value={draftFilters.linha}
                              onChange={(e) => setDraftFilters((p) => ({ ...p, linha: e.target.value }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="f-turno">Turno</Label>
                            <Input
                              id="f-turno"
                              placeholder="Ex.: 1º Turno"
                              value={draftFilters.turno}
                              onChange={(e) => setDraftFilters((p) => ({ ...p, turno: e.target.value }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="f-sku">SKU</Label>
                            <Input
                              id="f-sku"
                              placeholder="Ex.: SKU001"
                              value={draftFilters.sku}
                              onChange={(e) => setDraftFilters((p) => ({ ...p, sku: e.target.value }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="f-oee-min">OEE Mínimo (%)</Label>
                            <Input
                              id="f-oee-min"
                              type="number"
                              placeholder="Ex.: 70"
                              min="0"
                              max="100"
                              step="0.1"
                              value={draftFilters.oeeMin}
                              onChange={(e) => setDraftFilters((p) => ({ ...p, oeeMin: e.target.value }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="f-oee-max">OEE Máximo (%)</Label>
                            <Input
                              id="f-oee-max"
                              type="number"
                              placeholder="Ex.: 95"
                              min="0"
                              max="100"
                              step="0.1"
                              value={draftFilters.oeeMax}
                              onChange={(e) => setDraftFilters((p) => ({ ...p, oeeMax: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter className="sticky bottom-0 z-10 bg-white border-t px-4 sm:px-6 py-3 items-center justify-end sm:justify-end">
                        <Button variant="outline" onClick={clearFilters}>Limpar Filtros</Button>
                        <Button onClick={applyFilters}>Aplicar Filtros</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    onClick={() => carregarDados()}
                    disabled={isFetching}
                    className="flex items-center justify-center gap-2 !bg-brand-primary !text-white !border-brand-primary hover:!bg-brand-primary/90 hover:!border-brand-primary/90 hover:!text-white min-h-10 px-4"
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
                <div className="sm:hidden space-y-3">
                  {apontamentosPaginados.length === 0 && !isLoading ? (
                    <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500 bg-gray-50">
                      <div>
                        {searchTerm || appliedCount > 0 ?
                          'Nenhum apontamento encontrado com os filtros aplicados.' :
                          'Nenhum apontamento cadastrado.'
                        }
                      </div>
                    </div>
                  ) : (
                    apontamentosPaginados.map((apontamento: ApontamentoComOEE) => (
                      <div
                        key={apontamento.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleVisualizar(apontamento)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleVisualizar(apontamento)
                          }
                        }}
                        className="w-full text-left rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/60 transition cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Data/Turno</p>
                            <p className="text-base font-semibold text-gray-900">{formatarData(apontamento.dataApontamento)}</p>
                            <p className="text-sm text-gray-700 mt-1">{apontamento.turno}</p>
                          </div>
                          <Badge variant={getBadgeOEE(apontamento.oeeCalculado.oee)} className="flex items-center">
                            <Target className="h-3 w-3 mr-1" />
                            OEE: {formatarOEE(apontamento.oeeCalculado.oee)}
                          </Badge>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
                          <div className="flex items-start gap-2">
                            <Factory className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Linha</p>
                              <p className="font-semibold text-gray-900">{apontamento.linha}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Package className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">SKU</p>
                              <p className="font-semibold text-gray-900">{apontamento.sku}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Início</p>
                              <p className="font-semibold text-gray-900">{formatarHorario(apontamento.horaInicio)}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Fim</p>
                              <p className="font-semibold text-gray-900">{formatarHorario(apontamento.horaFim)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant={getBadgeDisponibilidade(apontamento.oeeCalculado.disponibilidade)} className="text-xs">
                            Disp: {formatarOEE(apontamento.oeeCalculado.disponibilidade)}
                          </Badge>
                          <Badge variant={getBadgeDisponibilidade(apontamento.oeeCalculado.performance)} className="text-xs">
                            Perf: {formatarOEE(apontamento.oeeCalculado.performance)}
                          </Badge>
                          <Badge variant={getBadgeDisponibilidade(apontamento.oeeCalculado.qualidade)} className="text-xs">
                            Qual: {formatarOEE(apontamento.oeeCalculado.qualidade)}
                          </Badge>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 min-w-[120px]"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditar(apontamento)
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 min-w-[120px] text-destructive border-destructive/60 hover:border-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleExcluirClick(apontamento)
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
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-200">
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[10ch]">
                          Data
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[10ch]">
                          Turno
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Linha
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SKU
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[8ch]">
                          Início
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[8ch]">
                          Fim
                        </th>
                        <th className="px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[8ch]">
                          Qtd Prod.
                        </th>
                        <th className="px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[7ch]">
                          Disp.
                        </th>
                        <th className="px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[7ch]">
                          Perf.
                        </th>
                        <th className="px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[7ch]">
                          Qual.
                        </th>
                        <th className="px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[8ch]">
                          OEE
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {apontamentosPaginados.length === 0 && !isLoading ? (
                        <tr>
                          <td colSpan={12} className="px-4 md:px-6 py-8 text-center">
                            <div className="text-gray-500">
                              {searchTerm || appliedCount > 0 ?
                                'Nenhum apontamento encontrado com os filtros aplicados.' :
                                'Nenhum apontamento cadastrado.'
                              }
                            </div>
                          </td>
                        </tr>
                      ) : (
                        apontamentosPaginados.map((apontamento: ApontamentoComOEE) => (
                          <tr
                            key={apontamento.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleVisualizar(apontamento)}
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
                                    handleVisualizar(apontamento)
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
                                    handleEditar(apontamento)
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  title="Excluir"
                                  onClick={async (e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleExcluirClick(apontamento)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                              {formatarData(apontamento.dataApontamento)}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {apontamento.turno}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Factory className="h-3 w-3 text-gray-400" />
                                {apontamento.linha}
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Package className="h-3 w-3 text-gray-400" />
                                {apontamento.sku}
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                {formatarHorario(apontamento.horaInicio)}
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                {formatarHorario(apontamento.horaFim)}
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                              {apontamento.quantidadeProduzida.toLocaleString('pt-BR')}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center">
                              <Badge variant={getBadgeDisponibilidade(apontamento.oeeCalculado.disponibilidade)} className="text-xs">
                                {formatarOEE(apontamento.oeeCalculado.disponibilidade)}
                              </Badge>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center">
                              <Badge variant={getBadgeDisponibilidade(apontamento.oeeCalculado.performance)} className="text-xs">
                                {formatarOEE(apontamento.oeeCalculado.performance)}
                              </Badge>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center">
                              <Badge variant={getBadgeDisponibilidade(apontamento.oeeCalculado.qualidade)} className="text-xs">
                                {formatarOEE(apontamento.oeeCalculado.qualidade)}
                              </Badge>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center">
                              <Badge variant={getBadgeOEE(apontamento.oeeCalculado.oee)}>
                                <Target className="h-3 w-3 mr-1" />
                                {formatarOEE(apontamento.oeeCalculado.oee)}
                              </Badge>
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
            <DataPagination
              containerRef={paginationRef}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              showInfo={true}
              pageSizeOptions={PAGE_SIZE_OPTIONS as unknown as number[]}
              onItemsPerPageChange={(size) => {
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
              }}
            />
          </div>

          {/* Dialog de confirmação de exclusão */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o apontamento de produção do turno <strong>{apontamentoToDelete?.turno}</strong> na linha <strong>{apontamentoToDelete?.linha}</strong>?
                  Esta ação não pode ser desfeita e também removerá os registros de perdas e retrabalhos associados.
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
        </div>
      </div>
    </>
  )
}
