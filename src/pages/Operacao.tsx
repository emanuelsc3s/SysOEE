/**
 * Página Operação - Visualização Kanban de Ordens de Produção
 * Exibe as OPs em andamento organizadas por fase de produção
 */

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { FaseProducao, OrdemProducao } from '@/types/operacao'
import { mockOPs } from '@/data/mockOPs'
import KanbanColumn from '@/components/operacao/KanbanColumn'
import DialogoConclusaoOP from '@/components/operacao/DialogoConclusaoOP'
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
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners
} from '@dnd-kit/core'
import OPCard from '@/components/operacao/OPCard'

/**
 * Todas as fases do Kanban na ordem do processo
 */
const FASES: FaseProducao[] = [
  'Planejado',
  'Emissão de Dossiê',
  'Pesagem',
  'Preparação',
  'Envase',
  'Embalagem',
  'Concluído'
]

/**
 * Chave para armazenamento no localStorage
 */
const STORAGE_KEY = 'sysoee_operacao_ops'

/**
 * Gera dados mock iniciais com distribuição garantida em todas as fases
 */
function gerarDadosMockIniciais(): OrdemProducao[] {
  // Cria uma cópia dos dados mock originais
  const opsBase = [...mockOPs]

  // Distribui as OPs entre as fases de forma equilibrada
  const opsPorFase = Math.ceil(opsBase.length / FASES.length)

  return opsBase.map((op, index) => {
    // Calcula qual fase esta OP deve estar baseado no índice
    const faseIndex = Math.floor(index / opsPorFase)
    const fase = FASES[Math.min(faseIndex, FASES.length - 1)]

    return {
      ...op,
      fase
    }
  })
}

/**
 * Migra OPs antigas removendo fases inválidas (como "Parada")
 */
function migrarOPsAntigas(ops: OrdemProducao[]): OrdemProducao[] {
  const fasesValidas: FaseProducao[] = [
    'Planejado',
    'Emissão de Dossiê',
    'Pesagem',
    'Preparação',
    'Envase',
    'Embalagem',
    'Concluído'
  ]

  let migradas = 0
  const opsMigradas = ops.map(op => {
    // Se a fase não é válida, move para "Planejado"
    if (!fasesValidas.includes(op.fase)) {
      console.warn(`🔄 Migrando OP ${op.op} de fase inválida "${op.fase}" para "Planejado"`)
      migradas++
      return { ...op, fase: 'Planejado' as FaseProducao }
    }
    return op
  })

  if (migradas > 0) {
    console.log(`✅ Migração concluída: ${migradas} OPs atualizadas`)
  }

  return opsMigradas
}

/**
 * Carrega OPs do localStorage ou gera dados iniciais
 */
function carregarOPs(): OrdemProducao[] {
  try {
    const dadosSalvos = localStorage.getItem(STORAGE_KEY)

    if (dadosSalvos) {
      let ops = JSON.parse(dadosSalvos) as OrdemProducao[]
      console.log('✅ Dados carregados do localStorage:', ops.length, 'OPs')

      // Migra OPs antigas se necessário
      ops = migrarOPsAntigas(ops)

      // Salva dados migrados
      salvarOPs(ops)

      return ops
    }
  } catch (error) {
    console.error('❌ Erro ao carregar dados do localStorage:', error)
  }

  // Se não há dados salvos ou houve erro, gera dados iniciais
  console.log('🔄 Gerando dados mock iniciais...')
  const opsIniciais = gerarDadosMockIniciais()
  salvarOPs(opsIniciais)
  return opsIniciais
}

/**
 * Salva OPs no localStorage
 */
function salvarOPs(ops: OrdemProducao[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ops))
    console.log('💾 Dados salvos no localStorage:', ops.length, 'OPs')
  } catch (error) {
    console.error('❌ Erro ao salvar dados no localStorage:', error)
  }
}

export default function Operacao() {
  const navigate = useNavigate()

  // Estado para as OPs (carregadas do localStorage ou geradas inicialmente)
  const [ops, setOps] = useState<OrdemProducao[]>(() => carregarOPs())

  // Estados para filtros (futura implementação)
  // const [setorFiltro, setSetorFiltro] = useState<Setor | 'Todos'>('Todos')
  // const [turnoFiltro, setTurnoFiltro] = useState<Turno | 'Todos'>('Todos')
  const [dataAtual] = useState(new Date().toLocaleDateString('pt-BR'))

  // Ref e estados para controle de scroll horizontal
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Estados para controle de drag-and-drop
  const [activeId, setActiveId] = useState<string | null>(null)

  // Ref para armazenar a posição de scroll antes do drag
  const scrollPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  // Estados para controle do diálogo de conclusão
  const [dialogoConclusaoAberto, setDialogoConclusaoAberto] = useState(false)
  const [opPendenteConclusao, setOpPendenteConclusao] = useState<{
    op: OrdemProducao
    faseOriginal: FaseProducao
  } | null>(null)

  // Configuração dos sensores de drag (requer movimento mínimo para evitar conflitos com cliques e scroll)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 15, // Requer movimento de 15px para iniciar o drag (evita conflito com scroll)
        delay: 0,
        tolerance: 5,
      },
    })
  )

  /**
   * Agrupa as OPs por fase
   */
  const opsPorFase = useMemo(() => {
    const grupos: Record<FaseProducao, OrdemProducao[]> = {
      'Planejado': [],
      'Emissão de Dossiê': [],
      'Pesagem': [],
      'Preparação': [],
      'Envase': [],
      'Embalagem': [],
      'Concluído': []
    }

    ops.forEach((op) => {
      // Valida se a fase da OP é válida (ignora fases antigas como "Parada")
      if (grupos[op.fase]) {
        grupos[op.fase].push(op)
      } else {
        console.warn(`OP ${op.op} possui fase inválida: "${op.fase}". Ignorando.`)
      }
    })

    return grupos
  }, [ops])

  /**
   * Calcula estatísticas gerais
   */
  const estatisticas = useMemo(() => {
    const totalOPs = ops.length
    const setoresAtivos = new Set(ops.map(op => op.setor)).size
    const turnosAtivos = new Set(ops.map(op => op.turno)).size
    const opsEmProducao = ops.filter(
      op => !['Planejado', 'Concluído'].includes(op.fase)
    ).length

    return {
      totalOPs,
      setoresAtivos,
      turnosAtivos,
      opsEmProducao
    }
  }, [ops])

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
    console.log('🔄 Atualizando dados do localStorage...')
    const opsAtualizadas = carregarOPs()
    setOps(opsAtualizadas)
  }

  /**
   * Manipula o início do arrasto
   */
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)

    // Salva a posição de scroll atual
    scrollPositionRef.current = {
      x: window.scrollX,
      y: window.scrollY
    }

    // Adiciona classe ao body para prevenir seleção de texto e scroll
    document.body.classList.add('dragging')

    console.log('🎯 Iniciando arrasto da OP:', active.id)
  }

  /**
   * Manipula o fim do arrasto
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    // Limpa o estado de arrasto
    setActiveId(null)

    // Remove classe do body
    document.body.classList.remove('dragging')

    // Restaura a posição de scroll
    window.scrollTo(scrollPositionRef.current.x, scrollPositionRef.current.y)

    // Se não há destino válido, cancela
    if (!over) {
      console.log('❌ Arrasto cancelado - sem destino válido')
      return
    }

    const opId = active.id as string
    const novaFase = over.id as FaseProducao

    // Encontra a OP que está sendo movida
    const opSendoMovida = ops.find((op) => op.op === opId)
    if (!opSendoMovida) {
      console.error('❌ OP não encontrada:', opId)
      return
    }

    // Se está movendo para "Concluído", abre o diálogo de confirmação
    if (novaFase === 'Concluído') {
      console.log(`🔔 Interceptando movimento para "Concluído" - OP ${opId}`)
      setOpPendenteConclusao({
        op: opSendoMovida,
        faseOriginal: opSendoMovida.fase,
      })
      setDialogoConclusaoAberto(true)
      return
    }

    // Para outras fases, move normalmente
    console.log(`📦 Movendo OP ${opId} para fase "${novaFase}"`)

    // Atualiza o estado das OPs
    setOps((opsAtuais) => {
      const opsAtualizadas = opsAtuais.map((op) => {
        if (op.op === opId) {
          console.log(`✅ OP ${opId}: "${op.fase}" → "${novaFase}"`)
          return { ...op, fase: novaFase }
        }
        return op
      })

      // Salva no localStorage
      salvarOPs(opsAtualizadas)

      return opsAtualizadas
    })
  }

  /**
   * Encontra a OP que está sendo arrastada (para o DragOverlay)
   */
  const activeOP = useMemo(() => {
    if (!activeId) return null
    return ops.find((op) => op.op === activeId)
  }, [activeId, ops])

  /**
   * Manipula o cancelamento do diálogo de conclusão
   * Retorna a OP para a fase original (não move)
   */
  const handleCancelarConclusao = () => {
    console.log('❌ Conclusão cancelada pelo usuário')
    setDialogoConclusaoAberto(false)
    setOpPendenteConclusao(null)
  }

  /**
   * Manipula a confirmação do diálogo de conclusão
   * Atualiza os dados da OP e move para "Concluído"
   */
  const handleConfirmarConclusao = (produzido: number, perdas: number) => {
    if (!opPendenteConclusao) return

    const { op } = opPendenteConclusao

    console.log(`✅ Concluindo OP ${op.op}:`)
    console.log(`   - Produzido: ${produzido}`)
    console.log(`   - Perdas: ${perdas}`)
    console.log(`   - Fase: "${op.fase}" → "Concluído"`)

    // Atualiza o estado das OPs
    setOps((opsAtuais) => {
      const opsAtualizadas = opsAtuais.map((opAtual) => {
        if (opAtual.op === op.op) {
          return {
            ...opAtual,
            fase: 'Concluído' as FaseProducao,
            produzido,
            perdas,
          }
        }
        return opAtual
      })

      // Salva no localStorage
      salvarOPs(opsAtualizadas)

      return opsAtualizadas
    })

    // Fecha o diálogo
    setDialogoConclusaoAberto(false)
    setOpPendenteConclusao(null)
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

      {/* Kanban Board com Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        autoScroll={false}
      >
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

        {/* Overlay visual durante o arrasto */}
        <DragOverlay>
          {activeOP ? (
            <div className="opacity-80 rotate-3 scale-105">
              <OPCard op={activeOP} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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

      {/* Diálogo de Conclusão de OP */}
      <DialogoConclusaoOP
        op={opPendenteConclusao?.op || null}
        aberto={dialogoConclusaoAberto}
        onCancelar={handleCancelarConclusao}
        onConfirmar={handleConfirmarConclusao}
      />
    </div>
  )
}

