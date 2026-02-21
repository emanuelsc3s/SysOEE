/**
 * Página de Listagem de Ordens de Serviço de Manutenção
 * Exibe lista com todas as ordens cadastradas no localStorage
 * Segue o padrão de design de OeeParada.tsx
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
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
import { toast } from '@/hooks/use-toast'
import { ManutencaoOrdemServico, PRIORIDADE_OPTIONS } from '@/types/manutencao'
import { buscarOrdensPaginadas, excluirOrdem } from '@/services/localStorage/manutencao.storage'
import {
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Filter,
  ArrowLeft,
  Plus,
  Wrench,
  CalendarDays,
} from 'lucide-react'
import { DataPagination } from '@/components/ui/data-pagination'

const PAGE_SIZE_STORAGE_KEY = 'sysoee_manutencao_items_per_page'
const PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const

type ManutencaoLocationState = {
  shouldRefresh?: boolean
  restoreSearchTerm?: string
  oeeTurnoId?: number
  linhaId?: string
  linhaNome?: string
  skuCodigo?: string
  produtoDescricao?: string
}

export default function Manutencao() {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as ManutencaoLocationState | null
  const restoredSearchTerm = typeof locationState?.restoreSearchTerm === 'string'
    ? locationState.restoreSearchTerm
    : ''
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(restoredSearchTerm)
  const [currentPage, setCurrentPage] = useState(() => {
    const p = Number(searchParams.get('page'))
    return Number.isFinite(p) && p > 0 ? p : 1
  })

  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [ordemToDelete, setOrdemToDelete] = useState<ManutencaoOrdemServico | null>(null)
  const [openFilterDialog, setOpenFilterDialog] = useState(false)
  const [dataVersion, setDataVersion] = useState(0)

  const { user: authUser } = useAuth()

  const user = {
    name: authUser?.usuario || authUser?.email?.split('@')[0] || 'Usuário',
    initials: (authUser?.usuario || authUser?.email)?.substring(0, 2).toUpperCase() || 'U',
    role: authUser?.perfil || 'Operador',
  }

  const tableContainerRef = useRef<HTMLDivElement | null>(null)
  const paginationRef = useRef<HTMLDivElement | null>(null)

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

  const [appliedFilters, setAppliedFilters] = useState({ prioridade: '' })
  const [draftFilters, setDraftFilters] = useState({ prioridade: '' })

  const appliedCount = appliedFilters.prioridade ? 1 : 0

  const refetch = useCallback(() => {
    setDataVersion(v => v + 1)
  }, [])

  const { data: ordensPaginadas, count: totalItems } = (() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- dependência explícita no dataVersion para recarregar dados
    void dataVersion
    return buscarOrdensPaginadas(
      searchTerm,
      appliedFilters.prioridade,
      currentPage,
      itemsPerPage
    )
  })()

  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const shouldRefreshFromNavigation = Boolean(locationState?.shouldRefresh)

  useEffect(() => {
    if (shouldRefreshFromNavigation) {
      refetch()
      navigate(location.pathname + location.search, { replace: true })
    }
  }, [shouldRefreshFromNavigation, refetch, navigate, location.pathname, location.search])

  useEffect(() => {
    setCurrentPage(1)
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.set('page', '1')
      return newParams
    })
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
    setOpenFilterDialog(false)
  }

  const clearFilters = () => {
    const cleared = { prioridade: '' }
    setDraftFilters(cleared)
    setAppliedFilters(cleared)
    setCurrentPage(1)
    try {
      const params = new URLSearchParams(searchParams)
      params.delete('page')
      setSearchParams(params, { replace: true })
    } catch { /* noop */ }
  }

  const turnoContext = {
    oeeTurnoId: locationState?.oeeTurnoId,
    linhaId: locationState?.linhaId,
    linhaNome: locationState?.linhaNome,
    skuCodigo: locationState?.skuCodigo,
    produtoDescricao: locationState?.produtoDescricao,
  }

  const handleEditar = (ordem: ManutencaoOrdemServico) => {
    navigate(`/manutencao-cad/${ordem.id}`, {
      state: { returnSearchTerm: searchTerm, ...turnoContext }
    })
  }

  const handleExcluirClick = (ordem: ManutencaoOrdemServico) => {
    setOrdemToDelete(ordem)
    setIsDeleteDialogOpen(true)
  }

  const handleExcluirConfirm = () => {
    if (ordemToDelete?.id) {
      const sucesso = excluirOrdem(ordemToDelete.id)
      if (sucesso) {
        toast({
          title: 'Ordem excluída',
          description: 'A ordem de serviço foi excluída com sucesso.',
        })
        setIsDeleteDialogOpen(false)
        setOrdemToDelete(null)
        refetch()
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível excluir a ordem de serviço.',
        })
      }
    }
  }

  const getPrioridadeBadgeVariant = (prioridade: string): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' => {
    switch (prioridade) {
      case 'Crítica': return 'destructive'
      case 'Alta': return 'warning'
      case 'Média': return 'info'
      case 'Baixa': return 'success'
      default: return 'secondary'
    }
  }

  const formatarData = (dataISO: string): string => {
    if (!dataISO) return '-'
    try {
      const [ano, mes, dia] = dataISO.split('T')[0].split('-')
      return `${dia}/${mes}/${ano}`
    } catch {
      return dataISO
    }
  }

  const handleVoltar = () => {
    if (locationState?.oeeTurnoId) {
      navigate(`/apontamento-oee?oeeturno_id=${locationState.oeeTurnoId}`)
    } else {
      navigate('/')
    }
  }

  return (
    <>
      <AppHeader
        title="SICFAR OEE - Manutenção"
        userName={user.name}
        userInitials={user.initials}
        userRole={user.role}
      />

      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-0 max-w-none">
        <div className="flex flex-col gap-4">
          {/* Cabeçalho */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-[#1f2937]">Ordens de Serviço de Manutenção</h1>
              <p className="text-sm text-gray-500">Gerencie as ordens de serviço de manutenção</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 !bg-white !text-brand-primary !border-brand-primary hover:!bg-gray-50 hover:!border-brand-primary hover:!text-brand-primary min-h-10 px-4"
                onClick={handleVoltar}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 !bg-brand-primary !text-white !border-brand-primary hover:!bg-brand-primary/90 hover:!border-brand-primary/90 hover:!text-white min-h-10 px-4"
                onClick={() => navigate('/manutencao-cad', {
                  state: { returnSearchTerm: searchTerm, ...turnoContext }
                })}
              >
                <Plus className="h-4 w-4" />
                Nova Ordem
              </Button>
            </div>
          </div>

          {/* Card principal */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden mb-6">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 leading-tight">Lista de Ordens</h2>
                  <p className="text-sm text-gray-500">
                    Total de {totalItems} ordens cadastradas
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 py-4 flex flex-col">
              {/* Barra de busca e ações */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <div className="relative w-full md:flex-1 max-w-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Pesquisar por descrição, linha, SKU, departamento..."
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
                          <DialogTitle>Filtrar Ordens</DialogTitle>
                          <DialogDescription>
                            Selecione os critérios para filtrar as ordens de serviço.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="mt-4 grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="f-prioridade">Prioridade</Label>
                            <select
                              id="f-prioridade"
                              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              value={draftFilters.prioridade}
                              onChange={(e) => setDraftFilters((p) => ({ ...p, prioridade: e.target.value }))}
                            >
                              <option value="">Todas</option>
                              {PRIORIDADE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
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
                    className="flex items-center justify-center gap-2 !bg-brand-primary !text-white !border-brand-primary hover:!bg-brand-primary/90 hover:!border-brand-primary/90 hover:!text-white min-h-10 px-4"
                    title="Atualizar lista"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Atualizar
                  </Button>
                </div>
              </div>

              {/* Lista mobile em cards + tabela desktop */}
              <div className="relative">
                {/* Cards para mobile */}
                <div className="sm:hidden space-y-3">
                  {ordensPaginadas.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500 bg-gray-50">
                      <div>
                        {searchTerm || appliedCount > 0 ?
                          'Nenhuma ordem encontrada com os filtros aplicados.' :
                          'Nenhuma ordem de serviço cadastrada.'
                        }
                      </div>
                    </div>
                  ) : (
                    ordensPaginadas.map((ordem) => (
                      <div
                        key={ordem.id}
                        className="w-full text-left rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Data</p>
                            <p className="text-base font-semibold text-gray-900">{formatarData(ordem.data)}</p>
                          </div>
                          <Badge variant={getPrioridadeBadgeVariant(ordem.prioridade)}>
                            {ordem.prioridade}
                          </Badge>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-700">
                          {ordem.linha_nome && (
                            <div className="flex items-start gap-2">
                              <Wrench className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-500">Linha</p>
                                <p className="font-semibold text-gray-900">{ordem.linha_nome}</p>
                              </div>
                            </div>
                          )}
                          {ordem.departamento && (
                            <div className="flex items-start gap-2">
                              <CalendarDays className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-500">Departamento</p>
                                <p className="font-semibold text-gray-900">{ordem.departamento}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {ordem.descricao_manutencao && (
                          <div className="mt-3 text-xs text-gray-500 line-clamp-2">
                            {ordem.descricao_manutencao}
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 min-w-[120px]"
                            onClick={() => handleEditar(ordem)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 min-w-[120px] text-destructive border-destructive/60 hover:border-destructive hover:text-destructive"
                            onClick={() => handleExcluirClick(ordem)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Tabela desktop */}
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
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[14ch]">
                          Linha
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[12ch]">
                          SKU
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[25ch]">
                          Descrição
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[10ch]">
                          Prioridade
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[14ch]">
                          Departamento
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {ordensPaginadas.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 md:px-6 py-8 text-center">
                            <div className="text-gray-500">
                              {searchTerm || appliedCount > 0 ?
                                'Nenhuma ordem encontrada com os filtros aplicados.' :
                                'Nenhuma ordem de serviço cadastrada.'
                              }
                            </div>
                          </td>
                        </tr>
                      ) : (
                        ordensPaginadas.map((ordem) => (
                          <tr
                            key={ordem.id}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                              <div className="flex justify-start gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-[#242f65]"
                                  title="Editar"
                                  onClick={() => handleEditar(ordem)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  title="Excluir"
                                  onClick={() => handleExcluirClick(ordem)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatarData(ordem.data)}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {ordem.linha_nome || '-'}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {ordem.sku_codigo || '-'}
                            </td>
                            <td className="px-4 md:px-6 py-4 text-sm text-gray-600 max-w-[300px]">
                              <span className="truncate block" title={ordem.descricao_manutencao}>
                                {ordem.descricao_manutencao || '-'}
                              </span>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm">
                              <Badge variant={getPrioridadeBadgeVariant(ordem.prioridade)}>
                                {ordem.prioridade}
                              </Badge>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {ordem.departamento || '-'}
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

          {/* Dialog de confirmação de exclusão */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir esta ordem de serviço de manutenção?
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
