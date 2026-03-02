/**
 * Página de Listagem de Metas de OEE por Linha de Produção
 * Exibe tabela com registros da tblinhaproducao_meta no Supabase
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { AppHeader } from '@/components/layout/AppHeader'
import { useOeeLinhaMeta } from '@/hooks/useOeeLinhaMeta'
import { useAuth } from '@/hooks/useAuth'
import type { OeeLinhaMetaFormData } from '@/types/oee-linha-meta'
import { toast } from '@/hooks/use-toast'
import {
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Loader2,
  ArrowLeft,
  Plus,
  CalendarDays,
  FileText,
  Target
} from 'lucide-react'
import { DataPagination } from '@/components/ui/data-pagination'

const PAGE_SIZE_STORAGE_KEY = 'sysoee_oee_linha_meta_items_per_page'
const PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const

type OeeLinhaMetaLocationState = {
  shouldRefresh?: boolean
  restoreSearchTerm?: string
}

const formatarMetaExibicao = (meta: string): string => {
  const texto = meta.trim()
  if (!texto) return '-'

  const numero = texto.includes(',')
    ? Number(texto.replace(/\./g, '').replace(',', '.'))
    : Number(texto)

  if (!Number.isFinite(numero)) {
    return texto
  }

  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export default function OeeLinhaMeta() {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as OeeLinhaMetaLocationState | null
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
  const [linhaMetaToDelete, setLinhaMetaToDelete] = useState<OeeLinhaMetaFormData | null>(null)

  const { fetchLinhasMeta, deleteLinhaMeta } = useOeeLinhaMeta()
  const { user: authUser } = useAuth()

  const user = {
    name: authUser?.usuario || authUser?.email?.split('@')[0] || 'Usuário',
    initials: (authUser?.usuario || authUser?.email)?.substring(0, 2).toUpperCase() || 'U',
    role: authUser?.perfil || 'Operador',
  }

  const tableContainerRef = useRef<HTMLDivElement | null>(null)
  const paginationRef = useRef<HTMLDivElement | null>(null)
  const prevSearchTermRef = useRef(searchTerm)
  const shouldRefreshFromNavigation = Boolean(locationState?.shouldRefresh)

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
    data: metasData,
    isLoading,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['oee-linha-meta', currentPage, itemsPerPage, searchTerm],
    queryFn: async () => {
      return await fetchLinhasMeta(
        {
          searchTerm: searchTerm || undefined,
        },
        currentPage,
        itemsPerPage
      )
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  })

  const metasPaginadas = metasData?.data || []
  const totalItems = metasData?.count || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const totalPagesValidas = Math.max(totalPages, 1)
  const paginaAtualExibida = Math.min(currentPage, totalPagesValidas)
  const inicioFaixaItens = totalItems === 0 ? 0 : (paginaAtualExibida - 1) * itemsPerPage + 1
  const fimFaixaItens = totalItems === 0 ? 0 : Math.min(paginaAtualExibida * itemsPerPage, totalItems)

  useEffect(() => {
    if (shouldRefreshFromNavigation) {
      void refetch()
      navigate(location.pathname + location.search, { replace: true })
    }
  }, [shouldRefreshFromNavigation, refetch, navigate, location.pathname, location.search])

  useEffect(() => {
    const searchChanged = prevSearchTermRef.current !== searchTerm
    if (!searchChanged) {
      return
    }

    prevSearchTermRef.current = searchTerm
    setCurrentPage(1)
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.set('page', '1')
      return newParams
    })
  }, [searchTerm, setSearchParams])

  useEffect(() => {
    if (!metasData) return
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
  }, [currentPage, totalPagesValidas, setSearchParams, metasData])

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
    try {
      const params = new URLSearchParams(searchParams)
      params.delete('page')
      setSearchParams(params, { replace: true })
    } catch { /* noop */ }
    try {
      localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(size))
    } catch { /* noop */ }
  }

  const handleEditar = (linhaMeta: OeeLinhaMetaFormData) => {
    navigate(`/oee-linha-meta-cad/${linhaMeta.id}`, {
      state: { returnSearchTerm: searchTerm }
    })
  }

  const handleExcluirClick = (linhaMeta: OeeLinhaMetaFormData) => {
    setLinhaMetaToDelete(linhaMeta)
    setIsDeleteDialogOpen(true)
  }

  const handleExcluirConfirm = async () => {
    if (!authUser?.id) {
      toast({
        variant: 'destructive',
        title: 'Erro de autenticação',
        description: 'Você precisa estar logado para excluir. Faça login novamente.',
      })
      return
    }

    if (linhaMetaToDelete?.id) {
      try {
        const sucesso = await deleteLinhaMeta(linhaMetaToDelete.id, authUser.id)
        if (sucesso) {
          setIsDeleteDialogOpen(false)
          setLinhaMetaToDelete(null)
          refetch()
        }
      } catch (error) {
        console.error('Erro ao excluir meta por linha:', error)
      }
    }
  }

  return (
    <>
      <AppHeader
        title="SICFAR OEE - Metas por Linha de Produção"
        userName={user.name}
        userInitials={user.initials}
        userRole={user.role}
      />

      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-0 max-w-none">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-[#1f2937]">Metas por Linha</h1>
              <p className="text-sm text-gray-500">Gerencie metas de OEE por período e linha de produção</p>
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
                onClick={() => navigate('/oee-linha-meta-cad', {
                  state: { returnSearchTerm: searchTerm }
                })}
              >
                <Plus className="h-4 w-4" />
                Nova Meta
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden mb-6">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 leading-tight">Lista de Metas</h2>
                  <p className="text-sm text-gray-500">
                    Total de {totalItems} metas cadastradas
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

            <div className="px-4 sm:px-6 py-4 flex flex-col">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <div className="relative w-full md:flex-1 max-w-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Pesquisar por observação ou ID..."
                    className="pl-10 py-2 w-full border border-gray-200 rounded-md text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 md:shrink-0">
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
                  {metasPaginadas.length === 0 && !isLoading ? (
                    <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500 bg-gray-50">
                      <div>
                        {searchTerm
                          ? 'Nenhuma meta encontrada com o filtro aplicado.'
                          : 'Nenhuma meta cadastrada.'
                        }
                      </div>
                    </div>
                  ) : (
                    metasPaginadas.map((linhaMeta: OeeLinhaMetaFormData) => (
                      <div
                        key={linhaMeta.id}
                        className="w-full text-left rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Linha de Produção</p>
                            <p className="text-base font-semibold text-gray-900">
                              {linhaMeta.linhaProducaoNome || `Linha ${linhaMeta.linhaProducaoId ?? '-'}`}
                            </p>
                          </div>
                          <Badge variant="info" className="flex items-center">
                            <Target className="h-3 w-3 mr-1" />
                            {formatarMetaExibicao(linhaMeta.meta)}
                          </Badge>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-700">
                          <div className="flex items-start gap-2">
                            <CalendarDays className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Vigência</p>
                              <p className="font-semibold text-gray-900">
                                {linhaMeta.dataInicio || '-'} {linhaMeta.dataFim ? `até ${linhaMeta.dataFim}` : '(sem data fim)'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {linhaMeta.observacao && (
                          <div className="mt-3 text-xs text-gray-500 line-clamp-2">
                            {linhaMeta.observacao}
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 min-w-[120px]"
                            onClick={() => handleEditar(linhaMeta)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 min-w-[120px] text-destructive border-destructive/60 hover:border-destructive hover:text-destructive"
                            onClick={() => handleExcluirClick(linhaMeta)}
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
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[20ch]">
                          Linha de Produção
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[12ch]">
                          Data Início
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[12ch]">
                          Data Fim
                        </th>
                        <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[10ch]">
                          Meta
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[28ch]">
                          Observação
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {metasPaginadas.length === 0 && !isLoading ? (
                        <tr>
                          <td colSpan={6} className="px-4 md:px-6 py-8 text-center">
                            <div className="text-gray-500">
                              {searchTerm
                                ? 'Nenhuma meta encontrada com o filtro aplicado.'
                                : 'Nenhuma meta cadastrada.'
                              }
                            </div>
                          </td>
                        </tr>
                      ) : (
                        metasPaginadas.map((linhaMeta: OeeLinhaMetaFormData) => (
                          <tr
                            key={linhaMeta.id}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                              <div className="flex justify-start gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-[#242f65]"
                                  title="Editar"
                                  onClick={() => handleEditar(linhaMeta)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  title="Excluir"
                                  onClick={() => handleExcluirClick(linhaMeta)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {linhaMeta.linhaProducaoNome || `Linha ${linhaMeta.linhaProducaoId ?? '-'}`}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {linhaMeta.dataInicio || '-'}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {linhaMeta.dataFim || '-'}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-800">
                              {formatarMetaExibicao(linhaMeta.meta)}
                            </td>
                            <td className="px-4 md:px-6 py-4 text-sm text-gray-500 max-w-[420px]">
                              <div className="flex items-start gap-2">
                                <FileText className="h-3.5 w-3.5 mt-0.5 text-gray-400 shrink-0" />
                                <span className="line-clamp-2" title={linhaMeta.observacao || ''}>
                                  {linhaMeta.observacao || '-'}
                                </span>
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

            <div className="sm:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-gray-600">
                  Mostrando {inicioFaixaItens} a {fimFaixaItens} de {totalItems}
                </p>
                <div className="flex items-center gap-2">
                  <Label htmlFor="itens-por-pagina-mobile-meta" className="text-xs text-gray-500">Por página</Label>
                  <select
                    id="itens-por-pagina-mobile-meta"
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

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir a meta da linha{' '}
                  <strong>{linhaMetaToDelete?.linhaProducaoNome || `ID ${linhaMetaToDelete?.linhaProducaoId ?? '-'}`}</strong>{' '}
                  com vigência iniciando em{' '}
                  <strong>{linhaMetaToDelete?.dataInicio || '-'}</strong>?
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
