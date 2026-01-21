/**
 * Página de Consulta de Linhas de Produção
 * Segue o design system documentado em docs/design/consultas-design-system.md
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  Eye,
  Pencil,
  Trash,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { buscarLinhasProducao } from '@/services/api/linhaproducao.api'

/**
 * Interface para filtros aplicados
 */
interface FiltrosLinhaProducao {
  apenasAtivos: boolean
  tipo: string
}

/**
 * Página de Consulta de Linhas de Produção
 */
export default function LinhaProducaoConsulta() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Estados de UI
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)

  // Estados de filtros (padrão: mostrar TODAS as linhas)
  const [appliedFilters, setAppliedFilters] = useState<FiltrosLinhaProducao>({
    apenasAtivos: false,
    tipo: '',
  })
  const [draftFilters, setDraftFilters] = useState<FiltrosLinhaProducao>({
    apenasAtivos: false,
    tipo: '',
  })

  // Refs para cálculo de altura
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const paginationRef = useRef<HTMLDivElement>(null)

  // Sincronizar página com URL
  useEffect(() => {
    const pageParam = searchParams.get('page')
    const page = pageParam ? parseInt(pageParam, 10) : 1
    if (page > 0) {
      setCurrentPage(page)
    }
  }, [searchParams])

  // Carregar preferência de items por página do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sysoee_linhas_items_per_page')
      if (saved) {
        const parsed = parseInt(saved, 10)
        if ([25, 50, 100, 200].includes(parsed)) {
          setItemsPerPage(parsed)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error)
    }
  }, [])

  // Query para buscar linhas de produção
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
      appliedFilters,
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
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })

  const linhas = linhasData?.data || []
  const totalItems = linhasData?.total || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Resetar para página 1 quando busca ou filtros mudarem
  useEffect(() => {
    setCurrentPage(1)
    const params = new URLSearchParams(searchParams)
    params.delete('page')
    setSearchParams(params, { replace: true })
  }, [searchTerm, appliedFilters, searchParams, setSearchParams])

  // Atualizar URL quando página mudar
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    const params = new URLSearchParams(searchParams)
    if (page > 1) {
      params.set('page', String(page))
    } else {
      params.delete('page')
    }
    setSearchParams(params, { replace: true })
  }

  // Aplicar filtros
  const applyFilters = () => {
    setAppliedFilters(draftFilters)
    setIsFilterDialogOpen(false)
  }

  // Limpar filtros
  const clearFilters = () => {
    const defaultFilters: FiltrosLinhaProducao = {
      apenasAtivos: true,
      tipo: '',
    }
    setDraftFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
    setIsFilterDialogOpen(false)
  }

  // Contar filtros aplicados (excluindo apenasAtivos que é padrão)
  const appliedFiltersCount = Object.entries(appliedFilters).filter(
    ([key, value]) => {
      if (key === 'apenasAtivos') return false
      return value !== '' && value !== null && value !== undefined
    }
  ).length

  // Obter variante do badge de status
  const getStatusVariant = (ativo: string | null): 'success' | 'secondary' => {
    return ativo === 'Sim' ? 'success' : 'secondary'
  }

  // Obter label do status
  const getStatusLabel = (ativo: string | null): string => {
    return ativo === 'Sim' ? 'Ativo' : 'Inativo'
  }

  // Obter variante do badge de tipo
  const getTipoVariant = (tipo: string | null): 'info' | 'outline' => {
    if (!tipo) return 'outline'
    return 'info'
  }

  return (
    <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pt-0 pb-0 max-w-none">
      <div className="flex flex-col gap-4">
        {/* Cabeçalho da Página */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="h-8 w-8"
              title="Voltar para Home"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#1f2937]">
                Linhas de Produção
              </h1>
              <p className="text-gray-500">
                Gerencie e visualize todas as linhas de produção
              </p>
            </div>
          </div>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          {/* Cabeçalho do Card */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Listagem de Linhas
            </h2>
            <p className="text-sm text-gray-500">
              {totalItems} {totalItems === 1 ? 'linha encontrada' : 'linhas encontradas'}
            </p>
          </div>

          {/* Conteúdo do Card */}
          <div className="px-4 sm:px-6 py-4 flex flex-col">
            {/* Barra de Busca e Ações */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
              {/* Input de Busca */}
              <div className="relative w-full md:flex-1 max-w-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Pesquisar por nome da linha..."
                  className="pl-10 py-2 w-full border border-gray-200 rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Grupo de Botões */}
              <div className="flex gap-2 md:shrink-0">
                {/* Botão Filtros */}
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-[#242f65] text-white border-[#242f65] hover:bg-[#1a2148] hover:border-[#1a2148] hover:text-white"
                  onClick={() => setIsFilterDialogOpen(true)}
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                  {appliedFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {appliedFiltersCount}
                    </Badge>
                  )}
                </Button>

                {/* Botão Atualizar */}
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

            {/* Container da Tabela */}
            <div
              ref={tableContainerRef}
              className="relative overflow-auto"
              style={{ maxHeight: '600px' }}
            >
              {/* Loading Overlay */}
              {isFetching && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                  <div className="flex items-center gap-2 text-[#242f65] text-sm font-medium">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Aguarde, carregando dados...
                  </div>
                </div>
              )}

              {/* Tabela */}
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[15ch]">
                      ID
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-full">
                      Nome da Linha
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[20ch]">
                      Departamento
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[12ch]">
                      Tipo
                    </th>
                    <th className="px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[10ch]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Estado de Loading Inicial */}
                  {isLoading && (
                    <tr>
                      <td colSpan={6} className="px-4 md:px-6 py-8 text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Carregando...
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Estado de Erro */}
                  {error && !isLoading && (
                    <tr>
                      <td colSpan={6} className="px-4 md:px-6 py-8 text-center">
                        <div className="flex flex-col items-center gap-3 text-red-500">
                          <AlertCircle className="h-8 w-8" />
                          <div>
                            <p className="font-medium">
                              Erro ao carregar linhas de produção
                            </p>
                            <p className="text-sm text-gray-500">
                              Verifique sua conexão e tente novamente
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-300"
                          >
                            <AlertCircle className="h-4 w-4" />
                            Tentar novamente
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Estado Vazio */}
                  {!isLoading && !error && linhas.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 md:px-6 py-8 text-center">
                        <div className="text-gray-500">
                          {searchTerm
                            ? 'Nenhuma linha de produção encontrada com os filtros aplicados.'
                            : 'Nenhuma linha de produção cadastrada.'}
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Linhas de Dados */}
                  {!isLoading &&
                    !error &&
                    linhas.map((linha) => (
                      <tr
                        key={linha.linhaproducao_id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          // TODO: Navegar para detalhes da linha
                          console.log('Visualizar linha:', linha.linhaproducao_id)
                        }}
                      >
                        {/* Ações */}
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-start gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-brand-primary"
                              title="Visualizar"
                              onClick={(e) => {
                                e.stopPropagation()
                                console.log('Visualizar:', linha.linhaproducao_id)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-brand-primary"
                              title="Editar"
                              onClick={(e) => {
                                e.stopPropagation()
                                console.log('Editar:', linha.linhaproducao_id)
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
                                e.stopPropagation()
                                if (
                                  window.confirm(
                                    `Deseja realmente excluir a linha "${linha.linhaproducao}"?`
                                  )
                                ) {
                                  console.log('Excluir:', linha.linhaproducao_id)
                                }
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>

                        {/* ID */}
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                          {linha.linhaproducao_id}
                        </td>

                        {/* Nome da Linha */}
                        <td className="px-4 md:px-6 py-4 whitespace-normal break-words text-sm text-gray-600">
                          {linha.linhaproducao || 'N/A'}
                        </td>

                        {/* Departamento (opcional - pode ser null) */}
                        <td className="px-4 md:px-6 py-4 whitespace-normal break-words text-sm text-gray-600">
                          {linha.departamento || 'N/A'}
                        </td>

                        {/* Tipo */}
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          {linha.tipo ? (
                            <Badge variant={getTipoVariant(linha.tipo)}>
                              {linha.tipo}
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center">
                          <Badge variant={getStatusVariant(linha.ativo)}>
                            {getStatusLabel(linha.ativo)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Paginação */}
        <div
          ref={paginationRef}
          className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 sm:px-6 py-3"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Informações de paginação */}
            <div className="text-sm text-gray-500">
              Mostrando {linhas.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} até{' '}
              {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}{' '}
              {totalItems === 1 ? 'linha' : 'linhas'}
            </div>

            {/* Controles de paginação */}
            <div className="flex items-center gap-2">
              {/* Items por página */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Itens por página:</span>
                <Select
                  value={String(itemsPerPage)}
                  onValueChange={(value) => {
                    const newSize = parseInt(value, 10)
                    setItemsPerPage(newSize)
                    setCurrentPage(1)
                    try {
                      localStorage.setItem(
                        'sysoee_linhas_items_per_page',
                        String(newSize)
                      )
                    } catch (error) {
                      console.error('Erro ao salvar preferência:', error)
                    }
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botões de navegação */}
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Próxima
                </Button>
              </div>

              {/* Indicador de página */}
              <span className="text-sm text-gray-500">
                Página {currentPage} de {totalPages || 1}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de Filtros */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[80vh] overflow-auto p-0">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle>Filtrar Linhas de Produção</DialogTitle>
              <DialogDescription>
                Selecione os critérios para filtrar as linhas de produção.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 grid grid-cols-1 gap-4">
              {/* Filtro: Apenas Ativos */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={draftFilters.apenasAtivos ? 'ativos' : 'todos'}
                  onValueChange={(val) =>
                    setDraftFilters((p) => ({
                      ...p,
                      apenasAtivos: val === 'ativos',
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativos">Apenas Ativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro: Tipo */}
              <div className="space-y-2">
                <Label>Tipo de Linha</Label>
                <Select
                  value={draftFilters.tipo || 'todos'}
                  onValueChange={(val) =>
                    setDraftFilters((p) => ({
                      ...p,
                      tipo: val === 'todos' ? '' : val,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="Envase">Envase</SelectItem>
                    <SelectItem value="Embalagem">Embalagem</SelectItem>
                    <SelectItem value="Inspeção">Inspeção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 z-10 bg-white border-t px-6 py-3 items-center justify-end sm:justify-end">
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
            <Button onClick={applyFilters}>Aplicar Filtros</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

