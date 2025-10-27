/**
 * Página Operação Por Equipamento - Visualização Kanban de Equipamentos
 * Exibe os equipamentos/linhas de produção organizados por status operacional
 */

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { StatusEquipamento, Equipamento } from '@/types/equipamento'
import { Setor } from '@/types/operacao'
import {
  buscarTodosEquipamentos,
  inicializarDados
} from '@/services/localStorage/equipamento.storage'
import KanbanColumnEquipamento from '@/components/operacao/KanbanColumnEquipamento'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Filter,
  RefreshCw,
  Factory,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * Todas as etapas operacionais na ordem
 */
const STATUS_ETAPAS: StatusEquipamento[] = [
  'Disponível',
  'Não Disponível',
  'Paradas',
  'Em Produção'
]

export default function OperacaoPorEquipamento() {
  const navigate = useNavigate()

  // Estado para os equipamentos
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([])

  /**
   * Carrega equipamentos do localStorage
   */
  const carregarEquipamentos = useCallback(() => {
    const equipamentosStorage = buscarTodosEquipamentos()
    setEquipamentos(equipamentosStorage)
  }, [])

  // Estados para filtros (futura implementação)
  const [setorFiltro] = useState<Setor | 'Todos'>('Todos')
  const [dataAtual] = useState(new Date().toLocaleDateString('pt-BR'))

  // Ref e estados para controle de scroll horizontal
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  /**
   * Agrupa os equipamentos por status
   */
  const equipamentosPorStatus = useMemo(() => {
    const grupos: Record<StatusEquipamento, Equipamento[]> = {
      'Disponível': [],
      'Não Disponível': [],
      'Paradas': [],
      'Em Produção': []
    }

    // Aplica filtro de setor se necessário
    const equipamentosFiltrados = setorFiltro === 'Todos'
      ? equipamentos
      : equipamentos.filter(eq => eq.setor === setorFiltro)

    equipamentosFiltrados.forEach((equipamento) => {
      grupos[equipamento.status].push(equipamento)
    })

    return grupos
  }, [equipamentos, setorFiltro])

  /**
   * Calcula estatísticas gerais
   */
  const estatisticas = useMemo(() => {
    const totalEquipamentos = equipamentos.length
    const setoresAtivos = new Set(equipamentos.map(eq => eq.setor)).size
    const emProducao = equipamentos.filter(eq => eq.status === 'Em Produção').length
    const disponiveis = equipamentos.filter(eq => eq.status === 'Disponível').length
    const paradas = equipamentos.filter(eq => eq.status === 'Paradas').length
    const naoDisponiveis = equipamentos.filter(eq => eq.status === 'Não Disponível').length

    return {
      totalEquipamentos,
      setoresAtivos,
      emProducao,
      disponiveis,
      paradas,
      naoDisponiveis
    }
  }, [equipamentos])

  /**
   * Verifica se pode rolar para esquerda ou direita
   */
  const checkScrollability = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container

    // Pode rolar para esquerda se não estiver no início
    setCanScrollLeft(scrollLeft > 0)

    // Pode rolar para direita se não estiver no final
    // Adiciona margem de 1px para evitar problemas de arredondamento
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
  }, [])

  /**
   * Rola o container horizontalmente
   * @param direction - Direção do scroll ('left' ou 'right')
   */
  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    // Largura de scroll: 1.5 colunas (320px * 1.5 + gap)
    const scrollAmount = 500
    const newScrollLeft = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    })
  }

  /**
   * Atualiza os dados do localStorage
   */
  const handleRefresh = () => {
    console.log('🔄 Atualizando dados dos equipamentos...')
    carregarEquipamentos()
  }

  /**
   * Inicializa dados no primeiro carregamento
   */
  useEffect(() => {
    // Inicializa dados no localStorage se não existirem
    inicializarDados()
    // Carrega equipamentos
    carregarEquipamentos()
  }, [carregarEquipamentos])

  /**
   * Configura listeners de scroll e verifica scrollability inicial
   */
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    // Verifica scrollability inicial
    checkScrollability()

    // Adiciona listener de scroll
    container.addEventListener('scroll', checkScrollability)

    // Adiciona listener de resize para recalcular ao redimensionar janela
    window.addEventListener('resize', checkScrollability)

    return () => {
      container.removeEventListener('scroll', checkScrollability)
      window.removeEventListener('resize', checkScrollability)
    }
  }, [checkScrollability])

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-20 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-2 py-2 tab-prod:px-1 tab-prod:py-1">
          {/* Linha 1: Título e Ações */}
          <div className="flex items-center justify-between gap-4 mb-2 tab-prod:gap-2 tab-prod:mb-1">
            <div className="flex items-center gap-3 tab-prod:gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/')}
                className="flex-shrink-0 tab-prod:h-8 tab-prod:w-8"
              >
                <ArrowLeft className="h-5 w-5 tab-prod:h-4 tab-prod:w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-primary tab-prod:text-xl">
                  Operação - Por Equipamento
                </h1>
                <p className="text-sm text-muted-foreground mt-1 tab-prod:text-xs tab-prod:mt-0">
                  Visualização em tempo real do status dos equipamentos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 tab-prod:gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="gap-2 tab-prod:gap-1 tab-prod:h-8 tab-prod:px-2 tab-prod:text-xs"
              >
                <RefreshCw className="h-4 w-4 tab-prod:h-3 tab-prod:w-3" />
                <span className="tab-prod:hidden">Atualizar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 tab-prod:gap-1 tab-prod:h-8 tab-prod:px-2 tab-prod:text-xs"
              >
                <Filter className="h-4 w-4 tab-prod:h-3 tab-prod:w-3" />
                <span className="tab-prod:hidden">Filtros</span>
              </Button>
            </div>
          </div>

          {/* Linha 2: Estatísticas */}
          <div className="flex flex-wrap items-center gap-4 tab-prod:gap-2">
            <div className="flex items-center gap-2 text-sm tab-prod:gap-1 tab-prod:text-xs">
              <Calendar className="h-4 w-4 text-muted-foreground tab-prod:h-3 tab-prod:w-3" />
              <span className="text-muted-foreground">Data:</span>
              <span className="font-semibold">{dataAtual}</span>
            </div>

            <div className="h-4 w-px bg-border tab-prod:hidden" />

            <div className="flex items-center gap-2 tab-prod:gap-1">
              <Badge variant="outline" className="gap-1.5 tab-prod:gap-1 tab-prod:text-xs tab-prod:px-1.5 tab-prod:py-0">
                <Factory className="h-3.5 w-3.5 tab-prod:h-3 tab-prod:w-3" />
                {estatisticas.totalEquipamentos} Linhas
              </Badge>
              <Badge variant="outline" className="gap-1.5 bg-green-100 text-green-800 border-green-200 tab-prod:gap-1 tab-prod:text-xs tab-prod:px-1.5 tab-prod:py-0">
                <Factory className="h-3.5 w-3.5 tab-prod:h-3 tab-prod:w-3" />
                {estatisticas.emProducao} Produzindo
              </Badge>
              <Badge variant="outline" className="gap-1.5 bg-blue-100 text-blue-800 border-blue-200 tab-prod:gap-1 tab-prod:text-xs tab-prod:px-1.5 tab-prod:py-0">
                <Factory className="h-3.5 w-3.5 tab-prod:h-3 tab-prod:w-3" />
                {estatisticas.disponiveis} Disponíveis
              </Badge>
              <Badge variant="outline" className="gap-1.5 bg-orange-100 text-orange-800 border-orange-200 tab-prod:gap-1 tab-prod:text-xs tab-prod:px-1.5 tab-prod:py-0">
                <Factory className="h-3.5 w-3.5 tab-prod:h-3 tab-prod:w-3" />
                {estatisticas.paradas} Paradas
              </Badge>
              <Badge variant="outline" className="gap-1.5 bg-red-100 text-red-800 border-red-200 tab-prod:gap-1 tab-prod:text-xs tab-prod:px-1.5 tab-prod:py-0">
                <Factory className="h-3.5 w-3.5 tab-prod:h-3 tab-prod:w-3" />
                {estatisticas.naoDisponiveis} Indisponíveis
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board de Equipamentos */}
      <div className="max-w-[1920px] mx-auto px-2 pb-2 pt-4 tab-prod:px-1 tab-prod:pb-1 tab-prod:pt-2">
        <div className="relative">
          {/* Botão de navegação esquerda */}
          {canScrollLeft && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleScroll('left')}
              className="sticky left-2 top-[50vh] -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-card/95 backdrop-blur-sm shadow-lg border-2 hover:bg-card hover:scale-110 transition-all duration-200 float-left tab-prod:h-8 tab-prod:w-8 tab-prod:left-1"
              aria-label="Rolar para esquerda"
            >
              <ChevronLeft className="h-6 w-6 tab-prod:h-4 tab-prod:w-4" />
            </Button>
          )}

          {/* Botão de navegação direita */}
          {canScrollRight && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleScroll('right')}
              className="sticky right-2 top-[50vh] -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-card/95 backdrop-blur-sm shadow-lg border-2 hover:bg-card hover:scale-110 transition-all duration-200 float-right tab-prod:h-8 tab-prod:w-8 tab-prod:right-1"
              aria-label="Rolar para direita"
            >
              <ChevronRight className="h-6 w-6 tab-prod:h-4 tab-prod:w-4" />
            </Button>
          )}

          {/* Container de scroll */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto overflow-y-visible pb-6 scrollbar-enhanced clear-both tab-prod:pb-3"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'hsl(var(--muted-foreground) / 0.3) hsl(var(--muted) / 0.5)'
            }}
          >
            <div className="flex gap-4 min-w-max tab-prod:gap-2">
              {STATUS_ETAPAS.map((status) => (
                <div key={status} className="w-[320px] flex-shrink-0 tab-prod:w-[243px]">
                  <KanbanColumnEquipamento
                    status={status}
                    equipamentos={equipamentosPorStatus[status]}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

