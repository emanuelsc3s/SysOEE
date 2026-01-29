/**
 * Página de Listagem de Apontamentos OEE por Turno
 * Exibe tabela com todos os apontamentos de produção cadastrados na tboee_turno do Supabase
 * Implementa padrões avançados de UI: paginação, filtros, busca em tempo real
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
import { useOeeTurno } from '@/hooks/useOeeTurno'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { OeeTurnoFormData, OeeTurnoStatus } from '@/types/apontamento-oee'
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
  Package,
  Activity,
  Calendar
} from 'lucide-react'
import { DataPagination } from '@/components/ui/data-pagination'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Constantes estáveis no escopo do módulo para evitar warnings de dependências
const PAGE_SIZE_STORAGE_KEY = 'sysoee_oee_turno_items_per_page'
const PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const
const MENSAGEM_PERMISSAO_EXCLUSAO = 'Rotina de exclusão permitida apenas para os perfis Administrador e Supervisor'

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
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false)
  const [turnoToDelete, setTurnoToDelete] = useState<OeeTurnoFormData | null>(null)
  const [openFilterDialog, setOpenFilterDialog] = useState(false)

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
    turno: '',
    produto: '',
    status: '' as OeeTurnoStatus | '',
  })

  // Estado de edição (no modal) - começa com os filtros aplicados
  const [draftFilters, setDraftFilters] = useState({
    turno: '',
    produto: '',
    status: '' as OeeTurnoStatus | '',
  })

  // Contagem de filtros aplicados para badge
  const appliedCount = (() => {
    let count = 0
    const f = appliedFilters
    if (f.turno) count++
    if (f.produto) count++
    if (f.status) count++
    return count
  })()

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
      appliedFilters.turno,
      appliedFilters.produto,
      appliedFilters.status
    ],
    queryFn: async () => {
      // Construir filtro de busca combinando texto
      const searchFilter = [
        searchTerm,
        appliedFilters.turno,
        appliedFilters.produto
      ].filter(Boolean).join(' ')

      return await fetchOeeTurnos(
        {
          searchTerm: searchFilter || undefined,
          status: appliedFilters.status || undefined
        },
        currentPage,
        itemsPerPage
      )
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000 // 10 minutos
  })

  // Dados paginados já vêm do Supabase
  const turnosPaginados = turnosData?.data || []
  const totalItems = turnosData?.count || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)

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
      turno: '',
      produto: '',
      status: '' as OeeTurnoStatus | '',
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

  const handleVisualizar = (turno: OeeTurnoFormData) => {
    // Navega para a página de apontamento OEE com o ID do turno
    navigate(`/apontamento-oee?oeeturno_id=${turno.id}`)
  }

  const handleEditar = (turno: OeeTurnoFormData) => {
    navigate(`/apontamento-oee?oeeturno_id=${turno.id}&edit=true`)
  }

  const validarPermissaoExclusao = async (): Promise<boolean> => {
    if (!authUser?.id) {
      return false
    }

    try {
      const { data, error } = await supabase
        .from('tbusuario')
        .select('perfil')
        .eq('user_id', authUser.id)
        .eq('deletado', 'N')
        .maybeSingle()

      if (error || !data?.perfil) {
        if (error) {
          console.error('Erro ao validar perfil para exclusão:', error)
        }
        return false
      }

      const perfilNormalizado = data.perfil.trim().toLowerCase()
      return perfilNormalizado === 'administrador' || perfilNormalizado === 'supervisor'
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

        const sucesso = await deleteOeeTurno(turnoToDelete.id, authUser.id)
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
                            <Label htmlFor="f-turno">Turno</Label>
                            <Input
                              id="f-turno"
                              placeholder="Ex.: D1 - Diurno"
                              value={draftFilters.turno}
                              onChange={(e) => setDraftFilters((p) => ({ ...p, turno: e.target.value }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="f-produto">Produto</Label>
                            <Input
                              id="f-produto"
                              placeholder="Ex.: SOL. CLORETO"
                              value={draftFilters.produto}
                              onChange={(e) => setDraftFilters((p) => ({ ...p, produto: e.target.value }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="f-status">Status</Label>
                            <select
                              id="f-status"
                              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              value={draftFilters.status}
                              onChange={(e) => setDraftFilters((p) => ({ ...p, status: e.target.value as OeeTurnoStatus | '' }))}
                            >
                              <option value="">Todos</option>
                              <option value="Aberto">Aberto</option>
                              <option value="Fechado">Fechado</option>
                              <option value="Cancelado">Cancelado</option>
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
                        className="w-full text-left rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/60 transition cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Data/Turno</p>
                            <p className="text-base font-semibold text-gray-900">{formatarData(turno.data)}</p>
                            <p className="text-sm text-gray-700 mt-1">{turno.turno}</p>
                          </div>
                          <Badge variant={getBadgeStatus(turno.status)} className="flex items-center">
                            <Target className="h-3 w-3 mr-1" />
                            {turno.status || 'N/A'}
                          </Badge>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
                          <div className="flex items-start gap-2 col-span-2">
                            <Package className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Produto</p>
                              <p className="font-semibold text-gray-900">{turno.produto}</p>
                            <p className="text-xs text-gray-500 mt-1">Linha: {formatarLinhaProducao(turno)}</p>
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
                          <div className="mt-3 text-xs text-gray-500 line-clamp-2">
                            {turno.observacao}
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 min-w-[120px]"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditar(turno)
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
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-200">
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                        <th className="px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[10ch]">
                          Status
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[12ch]">
                          Turno
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[10ch]">
                          Data
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[25ch]">
                          Produto
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[8ch]">
                          Início
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[8ch]">
                          Fim
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {turnosPaginados.length === 0 && !isLoading ? (
                        <tr>
                          <td colSpan={7} className="px-4 md:px-6 py-8 text-center">
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
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center">
                              <Badge variant={getBadgeStatus(turno.status)}>
                                {turno.status || 'N/A'}
                              </Badge>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {turno.turno}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-gray-400" />
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
                  Tem certeza que deseja excluir o turno <strong>{turnoToDelete?.turno}</strong> do dia <strong>{turnoToDelete?.data ? formatarData(turnoToDelete.data) : ''}</strong>?
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
        </div>
      </div>
    </>
  )
}
