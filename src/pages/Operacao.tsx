/**
 * Página Operação - Visualização Kanban de Ordens de Produção
 * Exibe as OPs em andamento organizadas por fase de produção
 */

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { FaseProducao, Setor, Turno } from '@/types/operacao'
import { mockOPs } from '@/data/mockOPs'
import KanbanColumn from '@/components/operacao/KanbanColumn'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Filter,
  RefreshCw,
  Factory,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * Todas as fases do Kanban na ordem do processo
 */
const FASES: FaseProducao[] = [
  'Planejado',
  'Parada',
  'Emissão de Dossiê',
  'Pesagem',
  'Preparação',
  'Envase',
  'Embalagem',
  'Concluído'
]

export default function Operacao() {
  const navigate = useNavigate()

  // Estados para filtros (futura implementação)
  const [setorFiltro, setSetorFiltro] = useState<Setor | 'Todos'>('Todos')
  const [turnoFiltro, setTurnoFiltro] = useState<Turno | 'Todos'>('Todos')
  const [dataAtual] = useState(new Date().toLocaleDateString('pt-BR'))

  // Ref e estados para controle de scroll horizontal
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  /**
   * Agrupa as OPs por fase
   */
  const opsPorFase = useMemo(() => {
    const grupos: Record<FaseProducao, typeof mockOPs> = {
      'Planejado': [],
      'Parada': [],
      'Emissão de Dossiê': [],
      'Pesagem': [],
      'Preparação': [],
      'Envase': [],
      'Embalagem': [],
      'Concluído': []
    }

    mockOPs.forEach((op) => {
      grupos[op.fase].push(op)
    })

    return grupos
  }, [])

  /**
   * Calcula estatísticas gerais
   */
  const estatisticas = useMemo(() => {
    const totalOPs = mockOPs.length
    const setoresAtivos = new Set(mockOPs.map(op => op.setor)).size
    const turnosAtivos = new Set(mockOPs.map(op => op.turno)).size
    const opsEmProducao = mockOPs.filter(
      op => !['Planejado', 'Parada', 'Concluído'].includes(op.fase)
    ).length

    return {
      totalOPs,
      setoresAtivos,
      turnosAtivos,
      opsEmProducao
    }
  }, [])

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
   * Simula atualização dos dados
   */
  const handleRefresh = () => {
    // TODO: Implementar atualização real dos dados
    console.log('Atualizando dados...')
  }

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
                  Operação - Kanban de Produção
                </h1>
                <p className="text-sm text-muted-foreground mt-1 tab-prod:text-xs tab-prod:mt-0">
                  Visualização em tempo real das ordens de produção
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
                {estatisticas.totalOPs} OPs
              </Badge>
              <Badge variant="outline" className="gap-1.5 bg-primary/10 text-primary border-primary/20 tab-prod:gap-1 tab-prod:text-xs tab-prod:px-1.5 tab-prod:py-0">
                <Factory className="h-3.5 w-3.5 tab-prod:h-3 tab-prod:w-3" />
                {estatisticas.opsEmProducao} Prod.
              </Badge>
              <Badge variant="outline" className="gap-1.5 tab-prod:gap-1 tab-prod:text-xs tab-prod:px-1.5 tab-prod:py-0">
                <Factory className="h-3.5 w-3.5 tab-prod:h-3 tab-prod:w-3" />
                {estatisticas.setoresAtivos} Setores
              </Badge>
              <Badge variant="outline" className="gap-1.5 tab-prod:gap-1 tab-prod:text-xs tab-prod:px-1.5 tab-prod:py-0">
                <Users className="h-3.5 w-3.5 tab-prod:h-3 tab-prod:w-3" />
                {estatisticas.turnosAtivos} Turnos
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="max-w-[1920px] mx-auto px-2 pb-2 tab-prod:px-1 tab-prod:pb-1">
        <div className="relative">
          {/* Botão de navegação esquerda - sticky para ficar sempre visível */}
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

          {/* Botão de navegação direita - sticky para ficar sempre visível */}
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
            {/*
              Largura das colunas otimizada para diferentes resoluções:
              - Desktop (≥1024px): 320px (padrão)
              - Tablet 1000-1023px: 243px (4 colunas visíveis em 1000px)

              Cálculo para 1000px:
              - Largura disponível: 1000px - (2px padding × 2) = 996px
              - 3 gaps × 8px = 24px
              - Largura por coluna: (996 - 24) / 4 = 243px
            */}
            <div className="flex gap-4 min-w-max tab-prod:gap-2">
              {FASES.map((fase) => (
                <div key={fase} className="w-[320px] flex-shrink-0 tab-prod:w-[243px]">
                  <KanbanColumn
                    fase={fase}
                    ops={opsPorFase[fase]}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legenda de Cores (opcional) */}
      <div className="max-w-[1920px] mx-auto px-4 pb-6 tab-prod:px-2 tab-prod:pb-3">
        <div className="bg-card rounded-lg border border-border p-4 tab-prod:p-2">
          <h3 className="text-sm font-semibold text-foreground mb-3 tab-prod:text-xs tab-prod:mb-2">
            Legenda de Setores
          </h3>
          <div className="flex flex-wrap gap-3 tab-prod:gap-1.5">
            <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 tab-prod:text-xs tab-prod:px-1.5 tab-prod:py-0">
              SPEP - Soluções Parenterais Embalagem Plástica
            </Badge>
            <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200 tab-prod:text-xs tab-prod:px-1.5 tab-prod:py-0">
              SPPV - Soluções Parenterais Pequeno Volume
            </Badge>
            <Badge className="bg-teal-100 text-teal-800 border-teal-200 tab-prod:text-xs tab-prod:px-1.5 tab-prod:py-0">
              Líquidos - Líquidos Orais
            </Badge>
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 tab-prod:text-xs tab-prod:px-1.5 tab-prod:py-0">
              CPHD - Concentrado Polieletrolítico Hemodiálise
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

