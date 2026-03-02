/**
 * Página de Consulta de Linhas de Produção
 * Padronizada com a experiência visual da consulta de OEE Paradas.
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
import { useAuth } from '@/hooks/useAuth'
import { DataPagination } from '@/components/ui/data-pagination'
import { buscarLinhasProducao } from '@/services/api/linhaproducao.api'
import { LinhaProducao } from '@/types/linhaproducao'
import {
  Search,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  Eye,
  Pencil,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  FileText,
} from 'lucide-react'

const PAGE_SIZE_STORAGE_KEY = 'sysoee_linhas_items_per_page'
const PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const

interface FiltrosLinhaProducao {
  apenasAtivos: boolean
  tipo: string
}

export default function LinhaProducaoConsulta() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(() => {
    const p = Number(searchParams.get('page'))
    return Number.isFinite(p) && p > 0 ? p : 1
  })
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [linhaToDelete, setLinhaToDelete] = useState<LinhaProducao | null>(null)

  const [appliedFilters, setAppliedFilters] = useState<FiltrosLinhaProducao>({
    apenasAtivos: false,
    tipo: '',
  })
  const [draftFilters, setDraftFilters] = useState<FiltrosLinhaProducao>({
    apenasAtivos: false,
    tipo: '',
  })

  const tableContainerRef = useRef<HTMLDivElement | null>(null)
  const paginationRef = useRef<HTMLDivElement | null>(null)
  const { user: authUser } = useAuth()

  const user = {
    name: authUser?.usuario || authUser?.email?.split('@')[0] || 'Usuário',
    initials: (authUser?.usuario || authUser?.email)?.substring(0, 2).toUpperCase() || 'U',
    role: authUser?.perfil || 'Operador',
  }

  useEffect(() => {
    const p = Number(searchParams.get('page'))
    const nextPage = Number.isFinite(p) && p > 0 ? p : 1
    if (nextPage !== currentPage) {
      setCurrentPage(nextPage)
    }
  }, [searchParams, currentPage])

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

  const {
    data: linhasData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'linhas-producao',
      currentPage,
      itemsPerPage,
      searchTerm,
      appliedFilters.apenasAtivos,
      appliedFilters.tipo,
    ],
    queryFn: async () => {
      return await buscarLinhasProducao({
        searchTerm,
        page: currentPage,
        itemsPerPage,
        apenasAtivos: appliedFilters.apenasAtivos,
        tipo: appliedFilters.tipo || undefined,
      })
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const linhas = linhasData?.data || []
  const totalItems = linhasData?.total || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.delete('page')
      return newParams
    }, { replace: true })
  }, [searchTerm, appliedFilters, setSearchParams])

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

  const applyFilters = () => {
    setAppliedFilters({ ...draftFilters })
    setCurrentPage(1)
    try {
      const params = new URLSearchParams(searchParams)
      params.delete('page')
      setSearchParams(params, { replace: true })
    } catch { /* noop */ }
    setIsFilterDialogOpen(false)
  }

  const clearFilters = () => {
    const defaultFilters: FiltrosLinhaProducao = {
      apenasAtivos: true,
      tipo: '',
    }
    setDraftFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
    setCurrentPage(1)
    try {
      const params = new URLSearchParams(searchParams)
      params.delete('page')
      setSearchParams(params, { replace: true })
    } catch { /* noop */ }
  }

  const handleVisualizar = (linha: LinhaProducao) => {
    console.log('Visualizar:', linha.linhaproducao_id)
  }

  const handleEditar = (linha: LinhaProducao) => {
    console.log('Editar:', linha.linhaproducao_id)
  }

  const handleExcluirClick = (linha: LinhaProducao) => {
    setLinhaToDelete(linha)
    setIsDeleteDialogOpen(true)
  }

  const handleExcluirConfirm = () => {
    if (linhaToDelete) {
      console.log('Excluir:', linhaToDelete.linhaproducao_id)
    }
    setIsDeleteDialogOpen(false)
    setLinhaToDelete(null)
  }

  const appliedFiltersCount = Object.entries(appliedFilters).filter(
    ([key, value]) => {
      if (key === 'apenasAtivos') return false
      return value !== '' && value !== null && value !== undefined
    }
  ).length

  const getStatusVariant = (ativo: string | null): 'success' | 'secondary' => {
    return ativo === 'Sim' ? 'success' : 'secondary'
  }

  const getStatusLabel = (ativo: string | null): string => {
    return ativo === 'Sim' ? 'Ativo' : 'Inativo'
  }

  const getTipoVariant = (tipo: string | null): 'info' | 'outline' => {
    if (!tipo) return 'outline'
    return 'info'
  }

  return (
    <>
      <AppHeader
        title="SICFAR OEE - Linhas de Produção"
        userName={user.name}
        userInitials={user.initials}
        userRole={user.role}
      />

      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-0 max-w-none">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-[#1f2937]">Linhas de Produção</h1>
              <p className="text-sm text-gray-500">Gerencie e visualize todas as linhas de produção</p>
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
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden mb-6">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 leading-tight">Lista de Linhas</h2>
                  <p className="text-sm text-gray-500">
                    Total de {totalItems} {totalItems === 1 ? 'linha cadastrada' : 'linhas cadastradas'}
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

            <div className="px-4 sm:px-6 py-4 flex flex-col">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <div className="relative w-full md:flex-1 max-w-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Pesquisar por nome da linha..."
                    className="pl-10 py-2 w-full border border-gray-200 rounded-md text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 md:shrink-0">
                  <Dialog open={isFilterDialogOpen} onOpenChange={(open) => {
                    setIsFilterDialogOpen(open)
                    if (open) setDraftFilters({ ...appliedFilters })
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center justify-center gap-2 !bg-brand-primary !text-white !border-brand-primary hover:!bg-brand-primary/90 hover:!border-brand-primary/90 hover:!text-white min-h-10 px-4"
                      >
                        <Filter className="h-4 w-4" />
                        Filtros
                        {appliedFiltersCount > 0 && (
                          <Badge variant="secondary" className="ml-1">{appliedFiltersCount}</Badge>
                        )}
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="w-full sm:w-[95vw] max-w-[640px] max-h-[80vh] overflow-auto p-0">
                      <div className="p-4 sm:p-6">
                        <DialogHeader>
                          <DialogTitle>Filtrar Linhas de Produção</DialogTitle>
                          <DialogDescription>
                            Selecione os critérios para filtrar as linhas de produção.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="f-status">Status</Label>
                            <select
                              id="f-status"
                              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              value={draftFilters.apenasAtivos ? 'ativos' : 'todos'}
                              onChange={(e) => setDraftFilters((p) => ({
                                ...p,
                                apenasAtivos: e.target.value === 'ativos',
                              }))}
                            >
                              <option value="todos">Todos</option>
                              <option value="ativos">Apenas Ativos</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="f-tipo">Tipo de Linha</Label>
                            <select
                              id="f-tipo"
                              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              value={draftFilters.tipo || 'todos'}
                              onChange={(e) => setDraftFilters((p) => ({
                                ...p,
                                tipo: e.target.value === 'todos' ? '' : e.target.value,
                              }))}
                            >
                              <option value="todos">Todos</option>
                              <option value="Envase">Envase</option>
                              <option value="Embalagem">Embalagem</option>
                              <option value="Inspeção">Inspeção</option>
                            </select>
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

              <div className="relative">
                {isFetching && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                    <div className="flex items-center gap-2 text-[#242f65] text-sm font-medium">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Aguarde, carregando dados...
                    </div>
                  </div>
                )}

                <div className="sm:hidden space-y-3">
                  {error && !isLoading ? (
                    <div className="rounded-lg border border-red-200 p-6 text-center bg-red-50 text-red-700">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="h-6 w-6" />
                        <div>
                          <p className="font-medium">Erro ao carregar linhas de produção</p>
                          <p className="text-sm text-red-600/80">Verifique sua conexão e tente novamente.</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => refetch()}
                          className="text-red-600 border-red-300 hover:text-red-700 hover:border-red-400"
                        >
                          Tentar novamente
                        </Button>
                      </div>
                    </div>
                  ) : linhas.length === 0 && !isLoading ? (
                    <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500 bg-gray-50">
                      <div>
                        {searchTerm || appliedFiltersCount > 0
                          ? 'Nenhuma linha de produção encontrada com os filtros aplicados.'
                          : 'Nenhuma linha de produção cadastrada.'}
                      </div>
                    </div>
                  ) : (
                    linhas.map((linha) => (
                      <div
                        key={linha.linhaproducao_id}
                        className="w-full text-left rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">ID</p>
                            <p className="text-base font-semibold text-gray-900">{linha.linhaproducao_id}</p>
                          </div>
                          <Badge variant={getStatusVariant(linha.ativo)}>
                            {getStatusLabel(linha.ativo)}
                          </Badge>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-700">
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Nome da Linha</p>
                              <p className="font-semibold text-gray-900">{linha.linhaproducao || 'N/A'}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Tipo</p>
                              {linha.tipo ? (
                                <Badge variant={getTipoVariant(linha.tipo)} className="mt-1">
                                  {linha.tipo}
                                </Badge>
                              ) : (
                                <p className="text-gray-400">N/A</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">Departamento</p>
                            <p className="font-medium text-gray-800">{linha.departamento || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 min-w-[120px]"
                            onClick={() => handleVisualizar(linha)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Visualizar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 min-w-[120px]"
                            onClick={() => handleEditar(linha)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 min-w-[120px] text-destructive border-destructive/60 hover:border-destructive hover:text-destructive"
                            onClick={() => handleExcluirClick(linha)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

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
                          ID
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[22ch]">
                          Nome da Linha
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[18ch]">
                          Departamento
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[12ch]">
                          Tipo
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[12ch]">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {error && !isLoading ? (
                        <tr>
                          <td colSpan={6} className="px-4 md:px-6 py-8 text-center">
                            <div className="flex flex-col items-center gap-3 text-red-500">
                              <AlertCircle className="h-8 w-8" />
                              <div>
                                <p className="font-medium">Erro ao carregar linhas de produção</p>
                                <p className="text-sm text-gray-500">Verifique sua conexão e tente novamente</p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetch()}
                                className="text-red-600 hover:text-red-700 border-red-300"
                              >
                                Tentar novamente
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ) : linhas.length === 0 && !isLoading ? (
                        <tr>
                          <td colSpan={6} className="px-4 md:px-6 py-8 text-center">
                            <div className="text-gray-500">
                              {searchTerm || appliedFiltersCount > 0
                                ? 'Nenhuma linha de produção encontrada com os filtros aplicados.'
                                : 'Nenhuma linha de produção cadastrada.'}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        linhas.map((linha) => (
                          <tr
                            key={linha.linhaproducao_id}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                              <div className="flex justify-start gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-[#242f65]"
                                  title="Visualizar"
                                  onClick={() => handleVisualizar(linha)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-[#242f65]"
                                  title="Editar"
                                  onClick={() => handleEditar(linha)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  title="Excluir"
                                  onClick={() => handleExcluirClick(linha)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {linha.linhaproducao_id}
                            </td>
                            <td className="px-4 md:px-6 py-4 text-sm text-gray-600 max-w-[260px]">
                              <span className="truncate block" title={linha.linhaproducao || undefined}>
                                {linha.linhaproducao || 'N/A'}
                              </span>
                            </td>
                            <td className="px-4 md:px-6 py-4 text-sm text-gray-600 max-w-[200px]">
                              <span className="truncate block" title={linha.departamento || undefined}>
                                {linha.departamento || 'N/A'}
                              </span>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm">
                              {linha.tipo ? (
                                <Badge variant={getTipoVariant(linha.tipo)}>
                                  {linha.tipo}
                                </Badge>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm">
                              <Badge variant={getStatusVariant(linha.ativo)}>
                                {getStatusLabel(linha.ativo)}
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

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir a linha <strong>{linhaToDelete?.linhaproducao || linhaToDelete?.linhaproducao_id}</strong>?
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
