/**
 * Página de Listagem de Cadastro de Paradas OEE
 * Exibe tabela com todas as paradas cadastradas na tboee_parada do Supabase
 * Implementa padrões avançados de UI: paginação, filtros, busca em tempo real
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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
import { useOeeParada } from '@/hooks/useOeeParada'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'
import { OeeParadaFormData, CLASSE_PARADA_OPTIONS, COMPONENTE_OEE_OPTIONS } from '@/types/oee-parada'
import {
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Filter,
  Loader2,
  ArrowLeft,
  Plus,
  AlertTriangle,
  FileText
} from 'lucide-react'
import { DataPagination } from '@/components/ui/data-pagination'

// Constantes estáveis no escopo do módulo para evitar warnings de dependências
const PAGE_SIZE_STORAGE_KEY = 'sysoee_oee_parada_items_per_page'
const PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const

type OeeParadaLocationState = {
  shouldRefresh?: boolean
  restoreSearchTerm?: string
}

export default function OeeParada() {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as OeeParadaLocationState | null
  const restoredSearchTerm = typeof locationState?.restoreSearchTerm === 'string'
    ? locationState.restoreSearchTerm
    : ''
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(restoredSearchTerm)
  const [currentPage, setCurrentPage] = useState(() => {
    const p = Number(searchParams.get('page'))
    return Number.isFinite(p) && p > 0 ? p : 1
  })

  // Controla quantidade de registros exibidos por página (persistido em localStorage)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  // Estados de UI
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [paradaToDelete, setParadaToDelete] = useState<OeeParadaFormData | null>(null)
  const [openFilterDialog, setOpenFilterDialog] = useState(false)

  // Hook para operações com Supabase
  const { fetchParadas, deleteParada } = useOeeParada()

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
    componente: '',
    classe: '',
    natureza: '',
  })

  // Estado de edição (no modal) - começa com os filtros aplicados
  const [draftFilters, setDraftFilters] = useState({
    componente: '',
    classe: '',
    natureza: '',
  })

  // Contagem de filtros aplicados para badge
  const appliedCount = (() => {
    let count = 0
    const f = appliedFilters
    if (f.componente) count++
    if (f.classe) count++
    if (f.natureza) count++
    return count
  })()

  // Query para buscar dados do Supabase
  const {
    data: paradasData,
    isLoading,
    isFetching,
    refetch
  } = useQuery({
    queryKey: [
      'oee-paradas',
      currentPage,
      itemsPerPage,
      searchTerm,
      appliedFilters.componente,
      appliedFilters.classe,
      appliedFilters.natureza
    ],
    queryFn: async () => {
      return await fetchParadas(
        {
          searchTerm: searchTerm || undefined,
          componente: appliedFilters.componente || undefined,
          classe: appliedFilters.classe || undefined,
          natureza: appliedFilters.natureza || undefined
        },
        currentPage,
        itemsPerPage
      )
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000 // 10 minutos
  })

  // Dados paginados já vêm do Supabase
  const paradasPaginadas = paradasData?.data || []
  const totalItems = paradasData?.count || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const shouldRefreshFromNavigation = Boolean(locationState?.shouldRefresh)

  useEffect(() => {
    // Se voltamos do cadastro com sinalização de refresh, refaz a consulta automaticamente
    if (shouldRefreshFromNavigation) {
      void refetch()
      navigate(location.pathname + location.search, { replace: true })
    }
  }, [shouldRefreshFromNavigation, refetch, navigate, location.pathname, location.search])

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
      componente: '',
      classe: '',
      natureza: '',
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

  const handleEditar = (parada: OeeParadaFormData) => {
    navigate(`/oee-parada-cad/${parada.id}`, {
      state: { returnSearchTerm: searchTerm }
    })
  }

  const handleExcluirClick = (parada: OeeParadaFormData) => {
    setParadaToDelete(parada)
    setIsDeleteDialogOpen(true)
  }

  const handleExcluirConfirm = async () => {
    // Validar autenticação
    if (!authUser?.id) {
      toast({
        variant: 'destructive',
        title: 'Erro de autenticação',
        description: 'Você precisa estar logado para excluir. Faça login novamente.',
      })
      return
    }

    if (paradaToDelete?.id) {
      try {
        // authUser.id é o UUID do Supabase Auth
        const sucesso = await deleteParada(paradaToDelete.id, authUser.id)
        if (sucesso) {
          setIsDeleteDialogOpen(false)
          setParadaToDelete(null)
          refetch()
        }
      } catch (error) {
        console.error('Erro ao excluir parada OEE:', error)
      }
    }
  }

  const getBadgeVariant = (classe: string): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' => {
    switch (classe) {
      case 'Planejada': return 'info'
      case 'Não Planejada': return 'destructive'
      case 'Estratégica': return 'warning'
      default: return 'secondary'
    }
  }

  const getComponenteBadgeVariant = (componente: string): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' => {
    switch (componente) {
      case 'Disponibilidade': return 'info'
      case 'Performance': return 'warning'
      case 'Qualidade': return 'success'
      default: return 'secondary'
    }
  }

  return (
    <>
      {/* Header da aplicação */}
      <AppHeader
        title="SICFAR OEE - Cadastro de Paradas"
        userName={user.name}
        userInitials={user.initials}
        userRole={user.role}
      />

      {/* Container principal */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-0 max-w-none">
        <div className="flex flex-col gap-4">
          {/* Cabeçalho responsivo */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-[#1f2937]">Cadastro de Paradas</h1>
              <p className="text-sm text-gray-500">Gerencie os tipos de paradas para o cálculo de OEE</p>
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
                onClick={() => navigate('/oee-parada-cad', {
                  state: { returnSearchTerm: searchTerm }
                })}
              >
                <Plus className="h-4 w-4" />
                Nova Parada
              </Button>
            </div>
          </div>

          {/* Card principal */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden mb-6">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 leading-tight">Lista de Paradas</h2>
                  <p className="text-sm text-gray-500">
                    Total de {totalItems} paradas cadastradas
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

            {/* Conteúdo */}
            <div className="px-4 sm:px-6 py-4 flex flex-col">
              {/* Barra de busca e ações */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <div className="relative w-full md:flex-1 max-w-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Pesquisar por código, parada, descrição..."
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
                          <DialogTitle>Filtrar Paradas</DialogTitle>
                          <DialogDescription>
                            Selecione os critérios para filtrar as paradas cadastradas.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="f-componente">Componente OEE</Label>
                            <select
                              id="f-componente"
                              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              value={draftFilters.componente}
                              onChange={(e) => setDraftFilters((p) => ({ ...p, componente: e.target.value }))}
                            >
                              <option value="">Todos</option>
                              {COMPONENTE_OEE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="f-classe">Classe</Label>
                            <select
                              id="f-classe"
                              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              value={draftFilters.classe}
                              onChange={(e) => setDraftFilters((p) => ({ ...p, classe: e.target.value }))}
                            >
                              <option value="">Todas</option>
                              {CLASSE_PARADA_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="f-natureza">Natureza</Label>
                            <Input
                              id="f-natureza"
                              placeholder="Ex.: Mecânica, Elétrica, Setup..."
                              value={draftFilters.natureza}
                              onChange={(e) => setDraftFilters((p) => ({ ...p, natureza: e.target.value }))}
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
                    onClick={() => refetch()}
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
                {/* Overlay de carregamento */}
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
                  {paradasPaginadas.length === 0 && !isLoading ? (
                    <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500 bg-gray-50">
                      <div>
                        {searchTerm || appliedCount > 0 ?
                          'Nenhuma parada encontrada com os filtros aplicados.' :
                          'Nenhuma parada cadastrada.'
                        }
                      </div>
                    </div>
                  ) : (
                    paradasPaginadas.map((parada: OeeParadaFormData) => (
                      <div
                        key={parada.id}
                        className="w-full text-left rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Código</p>
                            <p className="text-base font-semibold text-gray-900">{parada.codigo}</p>
                          </div>
                          {parada.classe && (
                            <Badge variant={getBadgeVariant(parada.classe)}>
                              {parada.classe}
                            </Badge>
                          )}
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-700">
                          {parada.componente && (
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-500">Componente</p>
                                <Badge variant={getComponenteBadgeVariant(parada.componente)} className="mt-1">
                                  {parada.componente}
                                </Badge>
                              </div>
                            </div>
                          )}
                          {parada.parada && (
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-500">Parada</p>
                                <p className="font-semibold text-gray-900">{parada.parada}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {parada.descricao && (
                          <div className="mt-3 text-xs text-gray-500 line-clamp-2">
                            {parada.descricao}
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 min-w-[120px]"
                            onClick={() => handleEditar(parada)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 min-w-[120px] text-destructive border-destructive/60 hover:border-destructive hover:text-destructive"
                            onClick={() => handleExcluirClick(parada)}
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
                          Código
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[14ch]">
                          Componente
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[14ch]">
                          Classe
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[12ch]">
                          Natureza
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[20ch]">
                          Parada
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[25ch]">
                          Descrição
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paradasPaginadas.length === 0 && !isLoading ? (
                        <tr>
                          <td colSpan={7} className="px-4 md:px-6 py-8 text-center">
                            <div className="text-gray-500">
                              {searchTerm || appliedCount > 0 ?
                                'Nenhuma parada encontrada com os filtros aplicados.' :
                                'Nenhuma parada cadastrada.'
                              }
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paradasPaginadas.map((parada: OeeParadaFormData) => (
                          <tr
                            key={parada.id}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                              <div className="flex justify-start gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-[#242f65]"
                                  title="Editar"
                                  onClick={() => handleEditar(parada)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  title="Excluir"
                                  onClick={() => handleExcluirClick(parada)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {parada.codigo}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm">
                              {parada.componente ? (
                                <Badge variant={getComponenteBadgeVariant(parada.componente)}>
                                  {parada.componente}
                                </Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm">
                              {parada.classe ? (
                                <Badge variant={getBadgeVariant(parada.classe)}>
                                  {parada.classe}
                                </Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {parada.natureza || '-'}
                            </td>
                            <td className="px-4 md:px-6 py-4 text-sm text-gray-600 max-w-[200px]">
                              <span className="truncate block" title={parada.parada}>
                                {parada.parada || '-'}
                              </span>
                            </td>
                            <td className="px-4 md:px-6 py-4 text-sm text-gray-500 max-w-[250px]">
                              <span className="truncate block" title={parada.descricao}>
                                {parada.descricao || '-'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Componente de Paginação */}
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
                  Tem certeza que deseja excluir a parada <strong>{paradaToDelete?.codigo}</strong>?
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
