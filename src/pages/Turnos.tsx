/**
 * Página de Listagem de Turnos
 * Exibe tabela com todos os turnos cadastrados e permite CRUD completo
 * Implementa padrões avançados de UI: React Query, paginação, filtros, busca em tempo real
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { useTurnos } from '@/hooks/useTurnos'
import { TurnoFormData, calcularDuracaoTurno } from '@/types/turno'
import { Plus, Search, Pencil, Trash2, Clock, Target, RefreshCw, Filter, Loader2, AlertCircle, Eye } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { DataPagination } from '@/components/ui/data-pagination'

// Constantes estáveis no escopo do módulo para evitar warnings de dependências
const PAGE_SIZE_STORAGE_KEY = 'sysoee_turnos_items_per_page'
const PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const

export default function Turnos() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(() => {
    const p = Number(searchParams.get('page'))
    return Number.isFinite(p) && p > 0 ? p : 1
  })

  // Controla quantidade de registros exibidos por página (persistido em localStorage)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const { fetchTurnos, deleteTurno } = useTurnos()

  // Estados de UI
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [turnoToDelete, setTurnoToDelete] = useState<TurnoFormData | null>(null)
  const [openFilterDialog, setOpenFilterDialog] = useState(false)

  // Refs para calcular altura disponível do grid
  const tableContainerRef = useRef<HTMLDivElement | null>(null)
  const paginationRef = useRef<HTMLDivElement | null>(null)

  // Carrega preferência de "por página" do localStorage ao montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PAGE_SIZE_STORAGE_KEY)
      const parsed = raw ? parseInt(raw, 10) : NaN
      if (PAGE_SIZE_OPTIONS.includes(parsed as any)) {
        setItemsPerPage(parsed)
      }
    } catch { /* noop */ }
  }, [])

  // Estado de filtros aplicados (usado para consulta)
  const [appliedFilters, setAppliedFilters] = useState({
    codigo: '',
    turno: '',
    metaOeeMin: '',
    metaOeeMax: '',
  })

  // Estado de edição (no modal) - começa com os filtros aplicados
  const [draftFilters, setDraftFilters] = useState({
    codigo: '',
    turno: '',
    metaOeeMin: '',
    metaOeeMax: '',
  })

  // Contagem de filtros aplicados para badge
  const appliedCount = useMemo(() => {
    let count = 0
    const f = appliedFilters
    if (f.codigo) count++
    if (f.turno) count++
    if (f.metaOeeMin) count++
    if (f.metaOeeMax) count++
    return count
  }, [appliedFilters])

  // Resetar página para 1 quando searchTerm ou filtros mudarem
  useEffect(() => {
    setCurrentPage(1)
    // Atualizar query string para refletir a mudança
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.set('page', '1')
      return newParams
    })
  }, [searchTerm, appliedFilters, setSearchParams])

  // Usar React Query para gerenciar o estado dos turnos
  const {
    data: turnosData,
    isLoading,
    isFetching,
    error,
    refetch
  } = useQuery({
    queryKey: [
      'turnos',
      currentPage,
      itemsPerPage,
      searchTerm,
      {
        codigo: appliedFilters.codigo,
        turno: appliedFilters.turno,
        metaOeeMin: appliedFilters.metaOeeMin,
        metaOeeMax: appliedFilters.metaOeeMax,
      },
    ],
    queryFn: async () => {
      const result = await fetchTurnos({
        codigo: appliedFilters.codigo || undefined,
        turno: appliedFilters.turno || undefined,
      })

      // Filtrar localmente por busca e meta OEE (já que o backend não suporta esses filtros ainda)
      let filteredData = result.data || []

      // Aplicar busca por termo
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        filteredData = filteredData.filter(
          (turno) =>
            turno.codigo.toLowerCase().includes(term) ||
            turno.turno.toLowerCase().includes(term)
        )
      }

      // Aplicar filtro de meta OEE mínima
      if (appliedFilters.metaOeeMin) {
        const min = parseFloat(appliedFilters.metaOeeMin)
        if (!isNaN(min)) {
          filteredData = filteredData.filter((turno) => turno.metaOee >= min)
        }
      }

      // Aplicar filtro de meta OEE máxima
      if (appliedFilters.metaOeeMax) {
        const max = parseFloat(appliedFilters.metaOeeMax)
        if (!isNaN(max)) {
          filteredData = filteredData.filter((turno) => turno.metaOee <= max)
        }
      }

      // Paginação local
      const totalItems = filteredData.length
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedData = filteredData.slice(startIndex, endIndex)

      return {
        data: paginatedData,
        count: totalItems
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const turnosList = turnosData?.data || []
  const totalItems = turnosData?.count || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)

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
      codigo: '',
      turno: '',
      metaOeeMin: '',
      metaOeeMax: '',
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

  const handleNovo = () => {
    navigate('/turno/novo')
  }

  const handleEditar = (turno: TurnoFormData) => {
    navigate(`/turno/${turno.id}?page=${currentPage}`)
  }

  const handleVisualizar = (turno: TurnoFormData) => {
    navigate(`/turno/${turno.id}?page=${currentPage}`)
  }

  const handleExcluirClick = (turno: TurnoFormData) => {
    setTurnoToDelete(turno)
    setIsDeleteDialogOpen(true)
  }

  const handleExcluirConfirm = async () => {
    if (turnoToDelete?.id) {
      try {
        await deleteTurno(turnoToDelete.id)
        setIsDeleteDialogOpen(false)
        setTurnoToDelete(null)
        await refetch()
      } catch (error) {
        console.error('Erro ao excluir turno:', error)
      }
    }
  }

  const formatarHorario = (hora: string) => {
    if (!hora) return '-'
    return hora
  }

  const formatarMetaOEE = (meta: number) => {
    return `${meta.toFixed(1)}%`
  }

  const getBadgeMetaOEE = (meta: number): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' => {
    if (meta >= 90) return 'success'
    if (meta >= 85) return 'info'
    if (meta >= 80) return 'warning'
    return 'destructive'
  }

  return (
    <>
      {/* Header da aplicação */}
      <AppHeader
        title="SICFAR OEE - Gerenciamento de Turnos"
        userName="Usuário"
        userRole="Administrador"
      />

      {/* Container mais fluido e responsivo para ocupar melhor o espaço disponível */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pt-0 pb-0 max-w-none">
        <div className="flex flex-col gap-4">
          {/* Cabeçalho responsivo: empilha no mobile e distribui no desktop */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1f2937]">Turnos</h1>
              <p className="text-gray-500">Gerencie e acompanhe todos os turnos de trabalho</p>
            </div>
            <Button
              className="bg-[#242f65] hover:bg-[#1a2148] flex items-center gap-2"
              onClick={handleNovo}
            >
              <Plus className="h-4 w-4" />
              Novo Turno
            </Button>
          </div>

          {/* Card principal como coluna flex para permitir que o conteúdo ocupe a altura disponível */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden mb-6">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Lista de Turnos</h2>
                  <p className="text-sm text-gray-500">
                    Total de {totalItems} turnos encontrados
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {isLoading && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Carregando...
                    </div>
                  )}
                  {error && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetch()}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-300"
                    >
                      <AlertCircle className="h-4 w-4" />
                      Tentar novamente
                    </Button>
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
                    placeholder="Pesquisar por código ou nome do turno..."
                    className="pl-10 py-2 w-full border border-gray-200 rounded-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 md:shrink-0">
                  <Dialog open={openFilterDialog} onOpenChange={(o) => {
                    setOpenFilterDialog(o)
                    if (o) setDraftFilters({ ...appliedFilters })
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 bg-[#242f65] text-white border-[#242f65] hover:bg-[#1a2148] hover:border-[#1a2148] hover:text-white"
                      >
                        <Filter className="h-4 w-4" />
                        Filtros
                        {appliedCount > 0 && (
                          <Badge variant="secondary" className="ml-1">{appliedCount}</Badge>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-[600px] max-h-[80vh] overflow-auto p-0">
                      <div className="p-6">
                        <DialogHeader>
                          <DialogTitle>Filtrar Turnos</DialogTitle>
                          <DialogDescription>
                            Selecione os critérios para filtrar os turnos cadastrados.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="f-codigo">Código</Label>
                            <Input
                              id="f-codigo"
                              placeholder="Ex.: T1"
                              value={draftFilters.codigo}
                              onChange={(e) => setDraftFilters((p) => ({ ...p, codigo: e.target.value }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="f-turno">Nome do Turno</Label>
                            <Input
                              id="f-turno"
                              placeholder="Ex.: Manhã"
                              value={draftFilters.turno}
                              onChange={(e) => setDraftFilters((p) => ({ ...p, turno: e.target.value }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="f-meta-min">Meta OEE Mínima (%)</Label>
                            <Input
                              id="f-meta-min"
                              type="number"
                              placeholder="Ex.: 80"
                              min="0"
                              max="100"
                              step="0.1"
                              value={draftFilters.metaOeeMin}
                              onChange={(e) => setDraftFilters((p) => ({ ...p, metaOeeMin: e.target.value }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="f-meta-max">Meta OEE Máxima (%)</Label>
                            <Input
                              id="f-meta-max"
                              type="number"
                              placeholder="Ex.: 95"
                              min="0"
                              max="100"
                              step="0.1"
                              value={draftFilters.metaOeeMax}
                              onChange={(e) => setDraftFilters((p) => ({ ...p, metaOeeMax: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter className="sticky bottom-0 z-10 bg-white border-t px-6 py-3 items-center justify-end sm:justify-end">
                        <Button variant="outline" onClick={clearFilters}>Limpar Filtros</Button>
                        <Button onClick={applyFilters}>Aplicar Filtros</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    onClick={() => { refetch() }}
                    disabled={isFetching}
                    className="flex items-center gap-2 bg-[#242f65] text-white border-[#242f65] hover:bg-[#1a2148] hover:border-[#1a2148] hover:text-white"
                    title="Atualizar lista"
                  >
                    <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    Atualizar
                  </Button>
                </div>
              </div>

              {/* Grid/Tabela: altura máxima calculada pelo viewport, rola internamente */}
              <div
                ref={tableContainerRef}
                className="relative overflow-auto"
                style={{ maxHeight: '60vh' }}
              >
                {/* Overlay de carregamento exibido sempre que houver busca em andamento */}
                {isFetching && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                    <div className="flex items-center gap-2 text-[#242f65] text-sm font-medium">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Aguarde, carregando dados...
                    </div>
                  </div>
                )}
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[10ch]">
                        Código
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-full">
                        Turno
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[9ch]">
                        Início
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[9ch]">
                        Fim
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[9ch]">
                        Duração
                      </th>
                      <th className="px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[10ch]">
                        Meta OEE
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {turnosList.length === 0 && !isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-4 md:px-6 py-8 text-center">
                          {error ? (
                            <div className="flex flex-col items-center gap-3 text-red-500">
                              <AlertCircle className="h-8 w-8" />
                              <div>
                                <p className="font-medium">Erro ao carregar turnos</p>
                                <p className="text-sm text-gray-500">Verifique sua conexão e tente novamente</p>
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-500">
                              {searchTerm || appliedCount > 0 ?
                                'Nenhum turno encontrado com os filtros aplicados.' :
                                'Nenhum turno cadastrado.'
                              }
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : (
                      turnosList.map((turno: TurnoFormData) => (
                        <tr
                          key={turno.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleVisualizar(turno)}
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
                                  handleEditar(turno)
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
                                  handleExcluirClick(turno)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                            {turno.codigo}
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-normal break-words text-sm text-gray-600">
                            {turno.turno}
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
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {turno.horaInicio && turno.horaFim
                              ? `${calcularDuracaoTurno(turno.horaInicio, turno.horaFim).toFixed(1)}h`
                              : '-'}
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center">
                            <Badge variant={getBadgeMetaOEE(turno.metaOee)}>
                              <Target className="h-3 w-3 mr-1" />
                              {formatarMetaOEE(turno.metaOee)}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Componente de Paginação reutilizável (idêntico ao arquivo de referência) */}
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
                  Tem certeza que deseja excluir o turno <strong>{turnoToDelete?.turno}</strong>?
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
        </div>
      </div>
    </>
  )
}
