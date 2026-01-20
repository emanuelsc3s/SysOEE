/**
 * Pagina de Cadastro de Velocidade Nominal por Linha e Produto
 * CRUD completo para a tabela tbvelocidadenominal do Supabase
 * Implementa padroes de UI do projeto: paginacao, filtros, busca, modais
 */

import { useState, useEffect, useRef, useCallback } from 'react'
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
import { useVelocidadeNominal } from '@/hooks/useVelocidadeNominal'
import { useAuth } from '@/hooks/useAuth'
import { VelocidadeNominalFormData } from '@/types/velocidadenominal'
import {
  ModalBuscaLinhaProducao,
  LinhaProducaoSelecionada
} from '@/components/modal/modalBuscaLinhaProducao'
import {
  ModalBuscaSKU,
  ProdutoSKU,
  SKUSelecionado
} from '@/components/modal/ModalBuscaSKU'
import {
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Filter,
  Loader2,
  ArrowLeft,
  Plus,
  Factory,
  Package,
  Gauge,
  Calendar
} from 'lucide-react'
import { DataPagination } from '@/components/ui/data-pagination'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

// Constantes de paginacao
const PAGE_SIZE_STORAGE_KEY = 'sysoee_velocidade_nominal_items_per_page'
const PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const

// Interface para produto selecionado no formulario (extendida)
interface ProdutoSelecionadoForm {
  id: number
  codigo: string
  descricao: string
}

export default function OeeLinhaVelocidade() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(() => {
    const p = Number(searchParams.get('page'))
    return Number.isFinite(p) && p > 0 ? p : 1
  })

  // Controla quantidade de registros exibidos por pagina (persistido em localStorage)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  // Estados de UI - Modais
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [velocidadeToDelete, setVelocidadeToDelete] = useState<VelocidadeNominalFormData | null>(null)
  const [openFilterDialog, setOpenFilterDialog] = useState(false)
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Estados do formulario de criacao/edicao
  const [formId, setFormId] = useState<string | null>(null)
  const [linhaSelecionada, setLinhaSelecionada] = useState<LinhaProducaoSelecionada | null>(null)
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoSelecionadoForm | null>(null)
  const [velocidadeInput, setVelocidadeInput] = useState('')
  const [observacaoInput, setObservacaoInput] = useState('')

  // Estados dos modais de busca
  const [modalLinhaAberto, setModalLinhaAberto] = useState(false)
  const [modalSKUAberto, setModalSKUAberto] = useState(false)

  // Estados para carregamento de produtos SKU (ModalBuscaSKU recebe via props)
  const [produtosSKU, setProdutosSKU] = useState<ProdutoSKU[]>([])
  const [carregandoProdutosSKU, setCarregandoProdutosSKU] = useState(false)
  const [erroProdutosSKU, setErroProdutosSKU] = useState<string | null>(null)

  // Hook para operacoes com Supabase
  const { fetchVelocidades, saveVelocidade, deleteVelocidade } = useVelocidadeNominal()

  // Hook de autenticacao
  const { user: authUser } = useAuth()

  // Derivar dados do usuario autenticado
  const user = {
    name: authUser?.usuario || authUser?.email?.split('@')[0] || 'Usuario',
    initials: (authUser?.usuario || authUser?.email)?.substring(0, 2).toUpperCase() || 'U',
    role: authUser?.perfil || 'Operador',
  }

  // Refs para calcular altura disponivel do grid
  const tableContainerRef = useRef<HTMLDivElement | null>(null)
  const paginationRef = useRef<HTMLDivElement | null>(null)

  // Carrega preferencia de "por pagina" do localStorage ao montar
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
    linhaProducaoId: null as number | null,
    linhaProducaoNome: '',
    produtoId: null as number | null,
    produtoCodigo: '',
  })

  // Estado de edicao (no modal) - comeca com os filtros aplicados
  const [draftFilters, setDraftFilters] = useState({
    linhaProducaoId: null as number | null,
    linhaProducaoNome: '',
    produtoId: null as number | null,
    produtoCodigo: '',
  })

  // Estados dos modais de busca para filtros
  const [modalLinhaFiltroAberto, setModalLinhaFiltroAberto] = useState(false)
  const [modalSKUFiltroAberto, setModalSKUFiltroAberto] = useState(false)

  // Contagem de filtros aplicados para badge
  const appliedCount = (() => {
    let count = 0
    if (appliedFilters.linhaProducaoId) count++
    if (appliedFilters.produtoId) count++
    return count
  })()

  // Query para buscar dados do Supabase
  const {
    data: velocidadesData,
    isLoading,
    isFetching,
    refetch
  } = useQuery({
    queryKey: [
      'velocidades-nominais',
      currentPage,
      itemsPerPage,
      searchTerm,
      appliedFilters.linhaProducaoId,
      appliedFilters.produtoId
    ],
    queryFn: async () => {
      return await fetchVelocidades(
        {
          searchTerm: searchTerm || undefined,
          linhaProducaoId: appliedFilters.linhaProducaoId || undefined,
          produtoId: appliedFilters.produtoId || undefined
        },
        currentPage,
        itemsPerPage
      )
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000 // 10 minutos
  })

  // Dados paginados ja vem do Supabase
  const velocidadesPaginadas = velocidadesData?.data || []
  const totalItems = velocidadesData?.count || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Resetar pagina para 1 quando searchTerm ou filtros mudarem
  useEffect(() => {
    setCurrentPage(1)
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.set('page', '1')
      return newParams
    })
  }, [searchTerm, appliedFilters, setSearchParams])

  // Funcao para buscar produtos SKU do Supabase
  const buscarProdutosSKU = useCallback(async () => {
    setCarregandoProdutosSKU(true)
    setErroProdutosSKU(null)

    try {
      const { data: produtosData, error } = await supabase
        .from('tbproduto')
        .select('produto_id, referencia, descricao, bloqueado, anvisa, gtin')
        .eq('deletado', 'N')
        .order('referencia', { ascending: true })

      if (error) throw error

      const produtosMapeados: ProdutoSKU[] = (produtosData || [])
        .map((produto) => ({
          codigo: produto.referencia || '',
          descricao: produto.descricao || '',
          bloqueado: produto.bloqueado === 'Sim' || produto.bloqueado === 'S',
          anvisa: produto.anvisa || null,
          gtin: produto.gtin || null,
          _id: produto.produto_id // Guardamos o ID para uso interno
        }))
        .filter((produto) => produto.codigo || produto.descricao)

      setProdutosSKU(produtosMapeados)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      setErroProdutosSKU('Erro ao carregar produtos. Tente novamente.')
    } finally {
      setCarregandoProdutosSKU(false)
    }
  }, [])

  // Handler para mudanca de pagina (sincroniza com query string)
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
      linhaProducaoId: null as number | null,
      linhaProducaoNome: '',
      produtoId: null as number | null,
      produtoCodigo: '',
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

  // Limpar formulario
  const limparFormulario = () => {
    setFormId(null)
    setLinhaSelecionada(null)
    setProdutoSelecionado(null)
    setVelocidadeInput('')
    setObservacaoInput('')
    setIsEditing(false)
  }

  // Abrir modal de criacao
  const handleNovaVelocidade = () => {
    limparFormulario()
    setOpenFormDialog(true)
  }

  // Abrir modal de edicao
  const handleEditar = (velocidade: VelocidadeNominalFormData) => {
    setFormId(velocidade.id)
    setLinhaSelecionada(velocidade.linhaProducaoId ? {
      linhaproducao_id: velocidade.linhaProducaoId,
      linhaproducao: velocidade.linhaProducaoNome,
      departamento_id: null,
      departamento: null,
      tipo: null,
      ativo: 'S'
    } : null)
    setProdutoSelecionado(velocidade.produtoId ? {
      id: velocidade.produtoId,
      codigo: velocidade.produtoCodigo,
      descricao: velocidade.produtoDescricao
    } : null)
    setVelocidadeInput(velocidade.velocidade?.toString() || '')
    setObservacaoInput(velocidade.observacao || '')
    setIsEditing(true)
    setOpenFormDialog(true)
  }

  // Abrir dialog de exclusao
  const handleExcluirClick = (velocidade: VelocidadeNominalFormData) => {
    setVelocidadeToDelete(velocidade)
    setIsDeleteDialogOpen(true)
  }

  // Confirmar exclusao
  const handleExcluirConfirm = async () => {
    if (velocidadeToDelete?.id) {
      try {
        // Obter ID do usuario (por enquanto fixo em 1 para desenvolvimento)
        const userId = 1
        const sucesso = await deleteVelocidade(velocidadeToDelete.id, userId)
        if (sucesso) {
          setIsDeleteDialogOpen(false)
          setVelocidadeToDelete(null)
          refetch()
        }
      } catch (error) {
        console.error('Erro ao excluir velocidade:', error)
      }
    }
  }

  // Salvar velocidade (criar ou atualizar)
  const handleSalvar = async () => {
    // Validacoes
    if (!linhaSelecionada) {
      toast({
        title: 'Campo obrigatorio',
        description: 'Selecione uma linha de producao.',
        variant: 'destructive'
      })
      return
    }

    if (!produtoSelecionado) {
      toast({
        title: 'Campo obrigatorio',
        description: 'Selecione um produto.',
        variant: 'destructive'
      })
      return
    }

    const velocidadeNum = parseFloat(velocidadeInput)
    if (!velocidadeInput || isNaN(velocidadeNum) || velocidadeNum <= 0) {
      toast({
        title: 'Campo obrigatorio',
        description: 'Informe uma velocidade valida (maior que zero).',
        variant: 'destructive'
      })
      return
    }

    setIsSaving(true)
    try {
      // Obter ID do usuario (por enquanto fixo em 1 para desenvolvimento)
      const userId = 1

      const formData: VelocidadeNominalFormData = {
        id: formId || '',
        linhaProducaoId: linhaSelecionada.linhaproducao_id,
        linhaProducaoNome: linhaSelecionada.linhaproducao,
        produtoId: produtoSelecionado.id,
        produtoCodigo: produtoSelecionado.codigo,
        produtoDescricao: produtoSelecionado.descricao,
        velocidade: velocidadeNum,
        observacao: observacaoInput || null,
        createdAt: '',
        createdBy: null
      }

      const sucesso = await saveVelocidade(formData, userId)
      if (sucesso) {
        setOpenFormDialog(false)
        limparFormulario()
        refetch()
      }
    } finally {
      setIsSaving(false)
    }
  }

  // Handler para selecao de linha no formulario
  const handleSelecionarLinha = (linha: LinhaProducaoSelecionada) => {
    setLinhaSelecionada(linha)
    setModalLinhaAberto(false)
  }

  // Handler para selecao de produto no formulario
  const handleSelecionarSKU = (sku: SKUSelecionado) => {
    // Buscar o ID do produto na lista carregada
    const produtoComId = produtosSKU.find(p => p.codigo === sku.codigo) as ProdutoSKU & { _id?: number }
    setProdutoSelecionado({
      id: produtoComId?._id || 0,
      codigo: sku.codigo,
      descricao: sku.descricao
    })
    setModalSKUAberto(false)
  }

  // Handler para selecao de linha no filtro
  const handleSelecionarLinhaFiltro = (linha: LinhaProducaoSelecionada) => {
    setDraftFilters(prev => ({
      ...prev,
      linhaProducaoId: linha.linhaproducao_id,
      linhaProducaoNome: linha.linhaproducao
    }))
    setModalLinhaFiltroAberto(false)
  }

  // Handler para selecao de produto no filtro
  const handleSelecionarSKUFiltro = (sku: SKUSelecionado) => {
    const produtoComId = produtosSKU.find(p => p.codigo === sku.codigo) as ProdutoSKU & { _id?: number }
    setDraftFilters(prev => ({
      ...prev,
      produtoId: produtoComId?._id || null,
      produtoCodigo: sku.codigo
    }))
    setModalSKUFiltroAberto(false)
  }

  // Abrir modal de SKU (carrega produtos se necessario)
  const abrirModalSKU = () => {
    if (produtosSKU.length === 0) {
      buscarProdutosSKU()
    }
    setModalSKUAberto(true)
  }

  const abrirModalSKUFiltro = () => {
    if (produtosSKU.length === 0) {
      buscarProdutosSKU()
    }
    setModalSKUFiltroAberto(true)
  }

  // Formatar data
  const formatarData = (dataStr: string) => {
    try {
      if (!dataStr) return '-'
      const dataComHora = dataStr.includes('T') ? dataStr : `${dataStr}T00:00:00`
      const data = new Date(dataComHora)
      if (isNaN(data.getTime())) return dataStr
      return format(data, 'dd/MM/yyyy HH:mm', { locale: ptBR })
    } catch {
      return dataStr
    }
  }

  // Formatar velocidade
  const formatarVelocidade = (velocidade: number | null) => {
    if (velocidade === null || velocidade === undefined) return '-'
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(velocidade) + ' un/h'
  }

  return (
    <>
      {/* Header da aplicacao */}
      <AppHeader
        title="SICFAR OEE - Velocidade Nominal"
        userName={user.name}
        userInitials={user.initials}
        userRole={user.role}
      />

      {/* Container principal */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-0 max-w-none">
        <div className="flex flex-col gap-4">
          {/* Cabecalho responsivo */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-[#1f2937]">Velocidade Nominal</h1>
              <p className="text-sm text-gray-500">Cadastre e gerencie as velocidades nominais por linha e produto</p>
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
                onClick={handleNovaVelocidade}
              >
                <Plus className="h-4 w-4" />
                Nova Velocidade
              </Button>
            </div>
          </div>

          {/* Card principal */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden mb-6">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 leading-tight">Lista de Velocidades Nominais</h2>
                  <p className="text-sm text-gray-500">
                    Total de {totalItems} registros encontrados
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

            {/* Conteudo */}
            <div className="px-4 sm:px-6 py-4 flex flex-col">
              {/* Barra de busca e acoes */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <div className="relative w-full md:flex-1 max-w-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Pesquisar por linha ou produto..."
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
                          <DialogTitle>Filtrar Velocidades</DialogTitle>
                          <DialogDescription>
                            Selecione os criterios para filtrar os registros.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="mt-4 grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label>Linha de Producao</Label>
                            <div className="flex gap-2">
                              <Input
                                value={draftFilters.linhaProducaoNome}
                                readOnly
                                placeholder="Selecione uma linha"
                                className="flex-1"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setModalLinhaFiltroAberto(true)}
                              >
                                <Search className="h-4 w-4" />
                              </Button>
                              {draftFilters.linhaProducaoId && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setDraftFilters(prev => ({
                                    ...prev,
                                    linhaProducaoId: null,
                                    linhaProducaoNome: ''
                                  }))}
                                >
                                  <span className="sr-only">Limpar</span>
                                  &times;
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Produto</Label>
                            <div className="flex gap-2">
                              <Input
                                value={draftFilters.produtoCodigo}
                                readOnly
                                placeholder="Selecione um produto"
                                className="flex-1"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={abrirModalSKUFiltro}
                              >
                                <Search className="h-4 w-4" />
                              </Button>
                              {draftFilters.produtoId && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setDraftFilters(prev => ({
                                    ...prev,
                                    produtoId: null,
                                    produtoCodigo: ''
                                  }))}
                                >
                                  <span className="sr-only">Limpar</span>
                                  &times;
                                </Button>
                              )}
                            </div>
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
                  {velocidadesPaginadas.length === 0 && !isLoading ? (
                    <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500 bg-gray-50">
                      <div>
                        {searchTerm || appliedCount > 0 ?
                          'Nenhuma velocidade encontrada com os filtros aplicados.' :
                          'Nenhuma velocidade cadastrada.'
                        }
                      </div>
                    </div>
                  ) : (
                    velocidadesPaginadas.map((velocidade: VelocidadeNominalFormData) => (
                      <div
                        key={velocidade.id}
                        className="w-full text-left rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Linha de Producao</p>
                            <p className="text-base font-semibold text-gray-900">{velocidade.linhaProducaoNome || '-'}</p>
                          </div>
                          <Badge variant="default" className="flex items-center bg-blue-600">
                            <Gauge className="h-3 w-3 mr-1" />
                            {formatarVelocidade(velocidade.velocidade)}
                          </Badge>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-700">
                          <div className="flex items-start gap-2">
                            <Package className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Produto</p>
                              <p className="font-semibold text-gray-900">
                                {velocidade.produtoCodigo ? `${velocidade.produtoCodigo} - ${velocidade.produtoDescricao}` : '-'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {velocidade.observacao && (
                          <div className="mt-3 text-xs text-gray-500 line-clamp-2">
                            {velocidade.observacao}
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 min-w-[120px]"
                            onClick={() => handleEditar(velocidade)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 min-w-[120px] text-destructive border-destructive/60 hover:border-destructive hover:text-destructive"
                            onClick={() => handleExcluirClick(velocidade)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Tabela para telas medias e maiores */}
                <div
                  ref={tableContainerRef}
                  className="hidden sm:block relative overflow-auto rounded-lg border border-gray-200"
                  style={{ maxHeight: '60vh' }}
                >
                  <table className="w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-200">
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acoes
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[6ch]">
                          ID
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[20ch]">
                          Linha de Producao
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[30ch]">
                          Produto
                        </th>
                        <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[12ch]">
                          Velocidade
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[20ch]">
                          Observacao
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[14ch]">
                          Criado em
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {velocidadesPaginadas.length === 0 && !isLoading ? (
                        <tr>
                          <td colSpan={7} className="px-4 md:px-6 py-8 text-center">
                            <div className="text-gray-500">
                              {searchTerm || appliedCount > 0 ?
                                'Nenhuma velocidade encontrada com os filtros aplicados.' :
                                'Nenhuma velocidade cadastrada.'
                              }
                            </div>
                          </td>
                        </tr>
                      ) : (
                        velocidadesPaginadas.map((velocidade: VelocidadeNominalFormData) => (
                          <tr
                            key={velocidade.id}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                              <div className="flex justify-start gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-[#242f65]"
                                  title="Editar"
                                  onClick={() => handleEditar(velocidade)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  title="Excluir"
                                  onClick={() => handleExcluirClick(velocidade)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                              {velocidade.id}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Factory className="h-3 w-3 text-gray-400" />
                                {velocidade.linhaProducaoNome || '-'}
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 text-sm text-gray-600 max-w-[350px]">
                              <div className="flex items-center gap-1">
                                <Package className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                <span className="truncate" title={`${velocidade.produtoCodigo} - ${velocidade.produtoDescricao}`}>
                                  {velocidade.produtoCodigo ? `${velocidade.produtoCodigo} - ${velocidade.produtoDescricao}` : '-'}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right font-semibold">
                              <div className="flex items-center justify-end gap-1">
                                <Gauge className="h-3 w-3 text-blue-500" />
                                {formatarVelocidade(velocidade.velocidade)}
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4 text-sm text-gray-500 max-w-[200px]">
                              <span className="truncate block" title={velocidade.observacao || ''}>
                                {velocidade.observacao || '-'}
                              </span>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                {formatarData(velocidade.createdAt)}
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

            {/* Componente de Paginacao */}
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

          {/* Dialog de criacao/edicao */}
          <Dialog open={openFormDialog} onOpenChange={(o) => {
            setOpenFormDialog(o)
            if (!o) limparFormulario()
          }}>
            <DialogContent className="w-full sm:w-[95vw] max-w-[600px] max-h-[90vh] overflow-auto p-0">
              <div className="p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-primary" />
                    {isEditing ? 'Editar' : 'Nova'} Velocidade Nominal
                  </DialogTitle>
                  <DialogDescription>
                    {isEditing ? 'Atualize os dados' : 'Preencha os campos'} da velocidade nominal.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 grid grid-cols-1 gap-4">
                  {/* Linha de Producao */}
                  <div className="space-y-2">
                    <Label htmlFor="form-linha">Linha de Producao *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="form-linha"
                        value={linhaSelecionada?.linhaproducao || ''}
                        readOnly
                        placeholder="Selecione uma linha de producao"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setModalLinhaAberto(true)}
                        type="button"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Produto */}
                  <div className="space-y-2">
                    <Label htmlFor="form-produto">Produto *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="form-produto"
                        value={produtoSelecionado ? `${produtoSelecionado.codigo} - ${produtoSelecionado.descricao}` : ''}
                        readOnly
                        placeholder="Selecione um produto"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={abrirModalSKU}
                        type="button"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Velocidade */}
                  <div className="space-y-2">
                    <Label htmlFor="form-velocidade">Velocidade (un/hora) *</Label>
                    <Input
                      id="form-velocidade"
                      type="number"
                      min="0"
                      step="0.01"
                      value={velocidadeInput}
                      onChange={(e) => setVelocidadeInput(e.target.value)}
                      placeholder="Ex: 1500.00"
                    />
                  </div>

                  {/* Observacao */}
                  <div className="space-y-2">
                    <Label htmlFor="form-observacao">Observacao</Label>
                    <Input
                      id="form-observacao"
                      value={observacaoInput}
                      onChange={(e) => setObservacaoInput(e.target.value)}
                      placeholder="Observacoes opcionais"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="sticky bottom-0 z-10 bg-white border-t px-4 sm:px-6 py-3 items-center justify-end sm:justify-end">
                <Button variant="outline" onClick={() => setOpenFormDialog(false)}>Cancelar</Button>
                <Button onClick={handleSalvar} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog de confirmacao de exclusao */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusao</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir a velocidade nominal de{' '}
                  <strong>{velocidadeToDelete?.linhaProducaoNome}</strong> para o produto{' '}
                  <strong>{velocidadeToDelete?.produtoCodigo}</strong>?
                  Esta acao nao pode ser desfeita.
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

          {/* Modal de busca de linha de producao (formulario) */}
          <ModalBuscaLinhaProducao
            aberto={modalLinhaAberto}
            onFechar={() => setModalLinhaAberto(false)}
            onSelecionarLinha={handleSelecionarLinha}
          />

          {/* Modal de busca de linha de producao (filtro) */}
          <ModalBuscaLinhaProducao
            aberto={modalLinhaFiltroAberto}
            onFechar={() => setModalLinhaFiltroAberto(false)}
            onSelecionarLinha={handleSelecionarLinhaFiltro}
          />

          {/* Modal de busca de SKU (formulario) */}
          <ModalBuscaSKU
            aberto={modalSKUAberto}
            onFechar={() => setModalSKUAberto(false)}
            onSelecionarSKU={handleSelecionarSKU}
            produtos={produtosSKU}
            loading={carregandoProdutosSKU}
            erro={erroProdutosSKU}
            onRecarregar={buscarProdutosSKU}
          />

          {/* Modal de busca de SKU (filtro) */}
          <ModalBuscaSKU
            aberto={modalSKUFiltroAberto}
            onFechar={() => setModalSKUFiltroAberto(false)}
            onSelecionarSKU={handleSelecionarSKUFiltro}
            produtos={produtosSKU}
            loading={carregandoProdutosSKU}
            erro={erroProdutosSKU}
            onRecarregar={buscarProdutosSKU}
          />
        </div>
      </div>
    </>
  )
}
