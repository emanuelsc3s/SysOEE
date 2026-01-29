/**
 * Página de Listagem de Usuários
 * Exibe tabela com todos os usuários cadastrados e permite CRUD completo
 * Implementa padrões avançados de UI: React Query, paginação, filtros, busca em tempo real
 */

import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { useUsuarios } from '@/hooks/useUsuarios'
import {
  UsuarioFormData,
  PERFIL_OPTIONS,
  getPerfilLabel,
  getPerfilBadgeVariant
} from '@/types/usuario'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Filter,
  Loader2,
  AlertCircle,
  Eye,
  ArrowLeft,
  User,
  Mail,
  Shield
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { DataPagination } from '@/components/ui/data-pagination'

// Constantes estáveis no escopo do módulo para evitar warnings de dependências
const PAGE_SIZE_STORAGE_KEY = 'sysoee_usuarios_items_per_page'
const PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const

export default function Usuarios() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(() => {
    const p = Number(searchParams.get('page'))
    return Number.isFinite(p) && p > 0 ? p : 1
  })

  // Controla quantidade de registros exibidos por página (persistido em localStorage)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const { fetchUsuarios, deleteUsuario } = useUsuarios()

  // Estados de UI
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [usuarioToDelete, setUsuarioToDelete] = useState<UsuarioFormData | null>(null)
  const [openFilterDialog, setOpenFilterDialog] = useState(false)

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
    login: '',
    usuario: '',
    email: '',
    perfilId: '',
  })

  // Estado de edição (no modal) - começa com os filtros aplicados
  const [draftFilters, setDraftFilters] = useState({
    login: '',
    usuario: '',
    email: '',
    perfilId: '',
  })

  // Contagem de filtros aplicados para badge
  const appliedCount = useMemo(() => {
    let count = 0
    const f = appliedFilters
    if (f.login) count++
    if (f.usuario) count++
    if (f.email) count++
    if (f.perfilId) count++
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

  // Usar React Query para gerenciar o estado dos usuários
  const {
    data: usuariosData,
    isLoading,
    isFetching,
    error,
    refetch
  } = useQuery({
    queryKey: [
      'usuarios',
      currentPage,
      itemsPerPage,
      searchTerm,
      {
        login: appliedFilters.login,
        usuario: appliedFilters.usuario,
        email: appliedFilters.email,
        perfilId: appliedFilters.perfilId,
      },
    ],
    queryFn: async () => {
      const result = await fetchUsuarios({
        login: appliedFilters.login || undefined,
        usuario: appliedFilters.usuario || undefined,
        email: appliedFilters.email || undefined,
        perfilId: appliedFilters.perfilId ? parseInt(appliedFilters.perfilId) : undefined,
      })

      // Filtrar localmente por busca (já que o backend pode não suportar todos os filtros)
      let filteredData = result.data || []

      // Aplicar busca por termo
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        filteredData = filteredData.filter(
          (usuario) =>
            usuario.login.toLowerCase().includes(term) ||
            usuario.usuario.toLowerCase().includes(term) ||
            usuario.email.toLowerCase().includes(term)
        )
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

  const usuariosList = usuariosData?.data || []
  const totalItems = usuariosData?.count || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const shouldRefreshFromNavigation = Boolean((location.state as { shouldRefresh?: boolean } | null)?.shouldRefresh)

  useEffect(() => {
    // Se voltamos do cadastro com sinalização de refresh, refaz a consulta automaticamente
    if (shouldRefreshFromNavigation) {
      void refetch()
      navigate(location.pathname + location.search, { replace: true })
    }
  }, [shouldRefreshFromNavigation, refetch, navigate, location.pathname, location.search])

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
      login: '',
      usuario: '',
      email: '',
      perfilId: '',
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
    navigate('/usuario/novo')
  }

  const handleEditar = (usuario: UsuarioFormData) => {
    navigate(`/usuario/${usuario.id}?page=${currentPage}`)
  }

  const handleVisualizar = (usuario: UsuarioFormData) => {
    navigate(`/usuario/${usuario.id}?page=${currentPage}`)
  }

  const handleExcluirClick = (usuario: UsuarioFormData) => {
    setUsuarioToDelete(usuario)
    setIsDeleteDialogOpen(true)
  }

  const handleExcluirConfirm = async () => {
    if (usuarioToDelete?.id) {
      try {
        await deleteUsuario(usuarioToDelete.id)
        setIsDeleteDialogOpen(false)
        setUsuarioToDelete(null)
        await refetch()
      } catch (error) {
        console.error('Erro ao excluir usuário:', error)
      }
    }
  }

  return (
    <>
      {/* Header da aplicação */}
      <AppHeader
        title="SICFAR OEE - Gerenciamento de Usuários"
        userName="Usuário"
        userRole="Administrador"
      />

      {/* Container mais fluido e responsivo para ocupar melhor o espaço disponível */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-0 max-w-none">
        <div className="flex flex-col gap-4">
          {/* Cabeçalho responsivo: empilha no mobile e distribui no desktop */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-[#1f2937]">Usuários</h1>
              <p className="text-sm text-gray-500">Gerencie os usuários do sistema e suas permissões</p>
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
                onClick={handleNovo}
              >
                <Plus className="h-4 w-4" />
                Novo Usuário
              </Button>
            </div>
          </div>

          {/* Card principal como coluna flex para permitir que o conteúdo ocupe a altura disponível */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden mb-6">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 leading-tight">Lista de Usuários</h2>
                  <p className="text-sm text-gray-500">
                    Total de {totalItems} usuários encontrados
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
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
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-300 min-h-9"
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
                    placeholder="Pesquisar por login, nome ou email..."
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
                          <DialogTitle>Filtrar Usuários</DialogTitle>
                          <DialogDescription>
                            Selecione os critérios para filtrar os usuários cadastrados.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="f-login">Login</Label>
                            <Input
                              id="f-login"
                              placeholder="Ex.: joao.silva"
                              value={draftFilters.login}
                              onChange={(e) => setDraftFilters((p) => ({ ...p, login: e.target.value }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="f-usuario">Nome do Usuário</Label>
                            <Input
                              id="f-usuario"
                              placeholder="Ex.: João Silva"
                              value={draftFilters.usuario}
                              onChange={(e) => setDraftFilters((p) => ({ ...p, usuario: e.target.value }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="f-email">Email</Label>
                            <Input
                              id="f-email"
                              placeholder="Ex.: joao@empresa.com"
                              value={draftFilters.email}
                              onChange={(e) => setDraftFilters((p) => ({ ...p, email: e.target.value }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="f-perfil">Perfil</Label>
                            <Select
                              value={draftFilters.perfilId}
                              onValueChange={(value) => setDraftFilters((p) => ({ ...p, perfilId: value }))}
                            >
                              <SelectTrigger id="f-perfil">
                                <SelectValue placeholder="Todos os perfis" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Todos os perfis</SelectItem>
                                {PERFIL_OPTIONS.map((perfil) => (
                                  <SelectItem key={perfil.value} value={perfil.value.toString()}>
                                    {perfil.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                    onClick={() => { refetch() }}
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
                  {usuariosList.length === 0 && !isLoading ? (
                    <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500 bg-gray-50">
                      {error ? (
                        <div className="flex flex-col items-center gap-3 text-red-500">
                          <AlertCircle className="h-8 w-8" />
                          <div>
                            <p className="font-medium">Erro ao carregar usuários</p>
                            <p className="text-sm text-gray-500">Verifique sua conexão e tente novamente</p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {searchTerm || appliedCount > 0 ?
                            'Nenhum usuário encontrado com os filtros aplicados.' :
                            'Nenhum usuário cadastrado.'
                          }
                        </div>
                      )}
                    </div>
                  ) : (
                    usuariosList.map((usuario: UsuarioFormData) => (
                      <div
                        key={usuario.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleVisualizar(usuario)}
                        onKeyDown={(e) => {
                          if (e.currentTarget !== e.target) return
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleVisualizar(usuario)
                          }
                        }}
                        className="w-full text-left rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/60 transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Login</p>
                            <p className="text-base font-semibold text-gray-900">{usuario.login}</p>
                            <p className="text-sm text-gray-700 mt-1">{usuario.usuario}</p>
                          </div>
                          <Badge variant={getPerfilBadgeVariant(usuario.perfilId)} className="flex items-center">
                            <Shield className="h-3 w-3 mr-1" />
                            {getPerfilLabel(usuario.perfilId)}
                          </Badge>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-700">
                          <div className="flex items-start gap-2">
                            <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Email</p>
                              <p className="font-semibold text-gray-900">{usuario.email || '-'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 min-w-[120px]"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditar(usuario)
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
                              handleExcluirClick(usuario)
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
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[12ch]">
                          Login
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-full">
                          Usuário
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[20ch]">
                          Email
                        </th>
                        <th className="px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[12ch]">
                          Perfil
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {usuariosList.length === 0 && !isLoading ? (
                        <tr>
                          <td colSpan={5} className="px-4 md:px-6 py-8 text-center">
                            {error ? (
                              <div className="flex flex-col items-center gap-3 text-red-500">
                                <AlertCircle className="h-8 w-8" />
                                <div>
                                  <p className="font-medium">Erro ao carregar usuários</p>
                                  <p className="text-sm text-gray-500">Verifique sua conexão e tente novamente</p>
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-500">
                                {searchTerm || appliedCount > 0 ?
                                  'Nenhum usuário encontrado com os filtros aplicados.' :
                                  'Nenhum usuário cadastrado.'
                                }
                              </div>
                            )}
                          </td>
                        </tr>
                      ) : (
                        usuariosList.map((usuario: UsuarioFormData) => (
                          <tr
                            key={usuario.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleVisualizar(usuario)}
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
                                    handleVisualizar(usuario)
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
                                    handleEditar(usuario)
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
                                    handleExcluirClick(usuario)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                {usuario.login}
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-normal break-words text-sm text-gray-600">
                              {usuario.usuario}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-gray-400" />
                                {usuario.email || '-'}
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center">
                              <Badge variant={getPerfilBadgeVariant(usuario.perfilId)}>
                                <Shield className="h-3 w-3 mr-1" />
                                {getPerfilLabel(usuario.perfilId)}
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
                  Tem certeza que deseja excluir o usuário <strong>{usuarioToDelete?.usuario}</strong>?
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
