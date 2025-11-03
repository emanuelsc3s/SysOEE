/**
 * Página ColaboradorPerfil
 * Exibe perfil do colaborador e seus treinamentos de POs
 * Rota: /colaborador/:id
 */

import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDebounce } from '@/hooks/useDebounce'
import { useQueryParams } from '@/hooks/useQueryParams'
import { useLocalStoragePreferences } from '@/hooks/useLocalStoragePreferences'
import { buscarColaborador, buscarTreinamentos } from '@/services/api/colaborador.api'
import {
  Colaborador,
  Treinamento,
  StatusTreinamento,
  CriterioOrdenacao,
  PreferenciasColaborador,
  calcularContadores,
} from '@/types/colaborador'
import PerfilColaboradorHeader from '@/components/colaborador/PerfilColaboradorHeader'
import ContadoresKPI from '@/components/colaborador/ContadoresKPI'
import FiltrosTreinamentos from '@/components/colaborador/FiltrosTreinamentos'
import ItemTreinamento from '@/components/colaborador/ItemTreinamento'
import ColaboradorPerfilSkeleton from '@/components/colaborador/ColaboradorPerfilSkeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  FileX,
  RefreshCw,
  Trash2,
} from 'lucide-react'

// Chave do localStorage para preferências
const PREFERENCIAS_KEY = 'colaborador.treinamentos.prefs.v1'

// Preferências padrão
const PREFERENCIAS_PADRAO: PreferenciasColaborador = {
  ultimoStatus: 'Todos',
  ultimaOrdenacao: 'vencimento',
  ultimaBusca: '',
}

export default function ColaboradorPerfil() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getParam, setParams, clearParams } = useQueryParams()

  // Estados de dados
  const [colaborador, setColaborador] = useState<Colaborador | null>(null)
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // Preferências persistidas no localStorage
  const [preferencias, setPreferencias, limparPreferencias] = useLocalStoragePreferences<PreferenciasColaborador>(
    PREFERENCIAS_KEY,
    PREFERENCIAS_PADRAO
  )

  // Estados de filtros (sincronizados com URL e localStorage)
  const [statusSelecionado, setStatusSelecionado] = useState<StatusTreinamento | 'Todos'>(() => {
    // Prioridade: URL > localStorage > Padrão
    const statusURL = getParam('status')
    if (statusURL && ['Todos', 'Concluído', 'Pendente', 'Vencido'].includes(statusURL)) {
      return statusURL as StatusTreinamento | 'Todos'
    }
    return preferencias.ultimoStatus || 'Todos'
  })

  const [busca, setBusca] = useState(() => {
    // Prioridade: URL > localStorage > Padrão
    return getParam('q') || preferencias.ultimaBusca || ''
  })

  const [ordenacao, setOrdenacao] = useState<CriterioOrdenacao>(() => {
    // Prioridade: URL > localStorage > Padrão
    const sortURL = getParam('sort')
    if (sortURL && ['vencimento', 'titulo', 'recentes'].includes(sortURL)) {
      return sortURL as CriterioOrdenacao
    }
    return preferencias.ultimaOrdenacao || 'vencimento'
  })

  // Debounce da busca para evitar muitas atualizações
  const buscaDebounced = useDebounce(busca, 300)

  /**
   * Carrega dados do colaborador e treinamentos
   */
  const carregarDados = async () => {
    if (!id) {
      setErro('ID do colaborador não fornecido')
      setCarregando(false)
      return
    }

    try {
      setCarregando(true)
      setErro(null)

      const [colaboradorData, treinamentosData] = await Promise.all([
        buscarColaborador(id),
        buscarTreinamentos(id),
      ])

      if (!colaboradorData) {
        setErro(`Colaborador com ID ${id} não encontrado`)
        setColaborador(null)
        setTreinamentos([])
      } else {
        setColaborador(colaboradorData)
        setTreinamentos(treinamentosData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setErro('Erro ao carregar dados. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  /**
   * Carrega dados ao montar o componente ou quando ID muda
   */
  useEffect(() => {
    carregarDados()
  }, [id])

  /**
   * Sincroniza estado com URL
   */
  useEffect(() => {
    setParams({
      status: statusSelecionado === 'Todos' ? null : statusSelecionado,
      q: buscaDebounced || null,
      sort: ordenacao === 'vencimento' ? null : ordenacao,
    })
  }, [statusSelecionado, buscaDebounced, ordenacao, setParams])

  /**
   * Atualiza preferências no localStorage
   */
  useEffect(() => {
    setPreferencias({
      ultimoStatus: statusSelecionado,
      ultimaOrdenacao: ordenacao,
      ultimaBusca: busca,
    })
  }, [statusSelecionado, ordenacao, busca, setPreferencias])

  /**
   * Filtra treinamentos por status
   */
  const treinamentosFiltradosPorStatus = useMemo(() => {
    if (statusSelecionado === 'Todos') {
      return treinamentos
    }
    return treinamentos.filter((t) => t.status === statusSelecionado)
  }, [treinamentos, statusSelecionado])

  /**
   * Filtra treinamentos por busca
   */
  const treinamentosFiltrados = useMemo(() => {
    if (!buscaDebounced) {
      return treinamentosFiltradosPorStatus
    }

    const termo = buscaDebounced.toLowerCase()
    return treinamentosFiltradosPorStatus.filter(
      (t) =>
        t.codigoPO.toLowerCase().includes(termo) ||
        t.tituloPO.toLowerCase().includes(termo)
    )
  }, [treinamentosFiltradosPorStatus, buscaDebounced])

  /**
   * Ordena treinamentos
   */
  const treinamentosOrdenados = useMemo(() => {
    const lista = [...treinamentosFiltrados]

    switch (ordenacao) {
      case 'titulo':
        return lista.sort((a, b) => a.tituloPO.localeCompare(b.tituloPO))

      case 'recentes':
        return lista.sort((a, b) => {
          if (!a.dataConclusao) return 1
          if (!b.dataConclusao) return -1
          return new Date(b.dataConclusao).getTime() - new Date(a.dataConclusao).getTime()
        })

      case 'vencimento':
      default:
        return lista.sort((a, b) => {
          // Vencidos primeiro
          if (a.status === 'Vencido' && b.status !== 'Vencido') return -1
          if (a.status !== 'Vencido' && b.status === 'Vencido') return 1

          // Depois pendentes por proximidade de vencimento
          if (a.status === 'Pendente' && b.status === 'Pendente') {
            if (!a.dataValidade) return 1
            if (!b.dataValidade) return -1
            return new Date(a.dataValidade).getTime() - new Date(b.dataValidade).getTime()
          }

          // Concluídos por último
          return 0
        })
    }
  }, [treinamentosFiltrados, ordenacao])

  /**
   * Calcula contadores
   */
  const contadores = useMemo(() => {
    return calcularContadores(treinamentos)
  }, [treinamentos])

  /**
   * Limpa preferências e reseta UI
   */
  const handleLimparPreferencias = () => {
    limparPreferencias()
    setStatusSelecionado('Todos')
    setBusca('')
    setOrdenacao('vencimento')
    clearParams()
  }

  /**
   * Tenta recarregar dados
   */
  const handleTentarNovamente = () => {
    carregarDados()
  }

  /**
   * Volta para página anterior
   */
  const handleVoltar = () => {
    navigate(-1)
  }

  // Estado de carregamento
  if (carregando) {
    return <ColaboradorPerfilSkeleton />
  }

  // Estado de erro
  if (erro || !colaborador) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Erro ao Carregar Dados</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {erro || 'Colaborador não encontrado'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleVoltar}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button onClick={handleTentarNovamente}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Renderização principal
  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
          <Button variant="ghost" onClick={handleVoltar} className="mb-3">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-6">
        {/* Perfil do Colaborador */}
        <PerfilColaboradorHeader colaborador={colaborador} />

        {/* Contadores KPI */}
        <Card className="shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Resumo de Treinamentos</h2>
            <ContadoresKPI contadores={contadores} />
          </CardContent>
        </Card>

        <Separator />

        {/* Seção de Treinamentos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Treinamentos de POs</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLimparPreferencias}
              className="text-xs"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Limpar Preferências
            </Button>
          </div>

          {/* Filtros */}
          <FiltrosTreinamentos
            busca={busca}
            onBuscaChange={setBusca}
            ordenacao={ordenacao}
            onOrdenacaoChange={setOrdenacao}
          />

          {/* Abas de Status */}
          <Tabs value={statusSelecionado} onValueChange={(v) => setStatusSelecionado(v as StatusTreinamento | 'Todos')}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="Todos">
                Todos ({contadores.total})
              </TabsTrigger>
              <TabsTrigger value="Pendente">
                Pendentes ({contadores.pendentes})
              </TabsTrigger>
              <TabsTrigger value="Vencido">
                Vencidos ({contadores.vencidos})
              </TabsTrigger>
              <TabsTrigger value="Concluído">
                Concluídos ({contadores.concluidos})
              </TabsTrigger>
            </TabsList>

            {/* Conteúdo das Abas */}
            <TabsContent value={statusSelecionado} className="mt-4">
              {/* Lista de Treinamentos - Mobile (Cards) */}
              <div className="block md:hidden space-y-3">
                {treinamentosOrdenados.length > 0 ? (
                  treinamentosOrdenados.map((treinamento) => (
                    <ItemTreinamento key={treinamento.id} treinamento={treinamento} modo="card" />
                  ))
                ) : (
                  <Card className="shadow-sm">
                    <CardContent className="p-12 text-center">
                      <FileX className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Nenhum treinamento encontrado
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {buscaDebounced
                          ? 'Tente ajustar os termos de busca'
                          : 'Não há treinamentos nesta categoria'}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Lista de Treinamentos - Desktop (Tabela) */}
              <div className="hidden md:block">
                {treinamentosOrdenados.length > 0 ? (
                  <Card className="shadow-sm">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted/50 border-b">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Código PO
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Título
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Versão
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Conclusão
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Vencimento
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Carga Horária
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Ações
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {treinamentosOrdenados.map((treinamento) => (
                              <ItemTreinamento key={treinamento.id} treinamento={treinamento} modo="table" />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="shadow-sm">
                    <CardContent className="p-12 text-center">
                      <FileX className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Nenhum treinamento encontrado
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {buscaDebounced
                          ? 'Tente ajustar os termos de busca'
                          : 'Não há treinamentos nesta categoria'}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

