/**
 * Página Operação - Visualização Kanban de Ordens de Produção
 * Exibe as OPs em andamento organizadas por fase de produção
 */

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { FaseProducao, OrdemProducao, RegistroMovimentacao, TipoMovimentacao, Turno } from '@/types/operacao'
import { mockOPs } from '@/data/mockOPs'
import KanbanColumn from '@/components/operacao/KanbanColumn'
import DialogoConclusaoOP from '@/components/operacao/DialogoConclusaoOP'
import DialogoApontamentoEnvase from '@/components/operacao/DialogoApontamentoEnvase'
import DialogoApontamentoEmbalagem from '@/components/operacao/DialogoApontamentoEmbalagem'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  Filter,
  RefreshCw,
  Factory,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ArrowRight,
  MapPin,
  Lock,
  CheckCircle,
  RotateCcw,
  FileText
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
  pointerWithin
} from '@dnd-kit/core'
import OPCard from '@/components/operacao/OPCard'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'


/**
 * Todas as fases do Kanban na ordem do processo
 */
const FASES: FaseProducao[] = [
  'Planejado',
  'Emissão de Dossiê',
  'Pesagem',
  'Preparação',
  'Envase',
  'Esterilização',
  'Embalagem',
  'Concluído'
]

/**
 * Regras de transição permitidas entre fases (apenas fase seguinte, sem pulo de etapa)
 */
const TRANSICOES_VALIDAS: Record<FaseProducao, FaseProducao[]> = {
  'Planejado': ['Emissão de Dossiê'],
  'Emissão de Dossiê': ['Pesagem'],
  'Pesagem': ['Preparação'],
  'Preparação': ['Envase'],
  'Envase': ['Esterilização'],
  'Esterilização': ['Embalagem'],
  'Embalagem': ['Concluído'],
  'Concluído': [],
}

/**
 * Verifica se a transição de uma fase origem para uma fase destino é permitida
 */
function podeMoverParaFase(origem: FaseProducao, destino: FaseProducao): boolean {
  if (origem === destino) return false
  return TRANSICOES_VALIDAS[origem]?.includes(destino) ?? false
}


/**
 * Chaves para armazenamento no localStorage
 */
const STORAGE_KEY = 'sysoee_operacao_ops'
const STORAGE_KEY_HISTORICO = 'sysoee_operacao_historico_movimentacoes'

/**
 * Gera um ID único para registro de movimentação
 */
function gerarIdRegistro(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Registra uma movimentação no histórico de auditoria
 */
function registrarMovimentacao(
  op: string,
  faseOrigem: FaseProducao,
  faseDestino: FaseProducao,
  tipo: TipoMovimentacao,
  justificativa?: string
): void {
  const registro: RegistroMovimentacao = {
    id: gerarIdRegistro(),
    op,
    faseOrigem,
    faseDestino,
    tipo,
    dataHora: new Date().toISOString(),
    usuario: 'Usuário Atual', // TODO: Integrar com sistema de autenticação
    justificativa
  }

  // Recupera histórico existente
  const historicoStr = localStorage.getItem(STORAGE_KEY_HISTORICO)
  const historico: RegistroMovimentacao[] = historicoStr ? JSON.parse(historicoStr) : []

  // Adiciona novo registro
  historico.push(registro)

  // Salva no localStorage
  localStorage.setItem(STORAGE_KEY_HISTORICO, JSON.stringify(historico))

  console.log('📝 Movimentação registrada:', registro)
}

/**
 * Verifica se uma movimentação é um retrocesso (volta para fase anterior)
 */
function isRetrocesso(faseOrigem: FaseProducao, faseDestino: FaseProducao): boolean {
  const origemIndex = FASES.indexOf(faseOrigem)
  const destinoIndex = FASES.indexOf(faseDestino)
  return destinoIndex < origemIndex
}

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
 * Migra OPs antigas removendo fases e turnos inválidos
 */
function migrarOPsAntigas(ops: OrdemProducao[]): OrdemProducao[] {
  const fasesValidas: FaseProducao[] = [
    'Planejado',
    'Emissão de Dossiê',
    'Pesagem',
    'Preparação',
    'Envase',
    'Esterilização',
    'Embalagem',
    'Concluído'
  ]

  const turnosValidos: Turno[] = ['1º Turno', '2º Turno']

  let migradasFase = 0
  let migradasTurno = 0

  const opsMigradas = ops.map(op => {
    const opAtualizada = { ...op }

    // Se a fase não é válida, move para "Planejado"
    if (!fasesValidas.includes(op.fase)) {
      console.warn(`🔄 Migrando OP ${op.op} de fase inválida "${op.fase}" para "Planejado"`)
      migradasFase++
      opAtualizada.fase = 'Planejado' as FaseProducao
    }

    // Se o turno não é válido, define como "1º Turno"
    if (!turnosValidos.includes(op.turno)) {
      console.warn(`🔄 Migrando OP ${op.op} de turno inválido "${op.turno}" para "1º Turno"`)
      migradasTurno++
      opAtualizada.turno = '1º Turno' as Turno
    }

    return opAtualizada
  })

  if (migradasFase > 0 || migradasTurno > 0) {
    console.log(`✅ Migração concluída: ${migradasFase} fases e ${migradasTurno} turnos atualizados`)
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

  // Estados para controle do diálogo de apontamento ao entrar em Envase
  const [dialogoEnvaseAberto, setDialogoEnvaseAberto] = useState(false)
  const [opPendenteEnvase, setOpPendenteEnvase] = useState<{
    op: OrdemProducao
    faseOriginal: FaseProducao
  } | null>(null)

  // Estados para controle do diálogo de apontamento ao entrar em Embalagem
  const [dialogoEmbalagemAberto, setDialogoEmbalagemAberto] = useState(false)
  const [opPendenteEmbalagem, setOpPendenteEmbalagem] = useState<{
    op: OrdemProducao
    faseOriginal: FaseProducao
  } | null>(null)

  // Diálogo de erro para pulo de etapas
  const [dialogoMovimentoInvalidoAberto, setDialogoMovimentoInvalidoAberto] = useState(false)
  const [dadosMovimentoInvalido, setDadosMovimentoInvalido] = useState<{
    opId: string
    faseAtual: FaseProducao
    faseDestino: FaseProducao
    proximaFasePermitida: FaseProducao
  } | null>(null)

  // Estados para controle do diálogo de justificativa de retrocesso
  const [dialogoRetrocessoAberto, setDialogoRetrocessoAberto] = useState(false)
  const [dadosRetrocesso, setDadosRetrocesso] = useState<{
    op: OrdemProducao
    faseOrigem: FaseProducao
    faseDestino: FaseProducao
  } | null>(null)
  const [justificativaRetrocesso, setJustificativaRetrocesso] = useState('')


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
      'Esterilização': [],
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

    console.log('🎯 handleDragEnd chamado:', { activeId: active.id, overId: over?.id })

    // Limpa o estado de arrasto
    setActiveId(null)

    // Remove classe do body
    document.body.classList.remove('dragging')

    // Restaura a posição de scroll


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

    // Evita ação se destino for a mesma fase
    if (opSendoMovida.fase === novaFase) {
      console.log('ℹ️ OP já está na fase de destino')
      return
    }

    // Validação: permitir apenas movimentação para a fase imediatamente seguinte
    const origemIndex = FASES.indexOf(opSendoMovida.fase)
    const destinoIndex = FASES.indexOf(novaFase)

    // Detecta se é um retrocesso (volta para fase anterior)
    if (isRetrocesso(opSendoMovida.fase, novaFase)) {
      console.log(`⚠️ Retrocesso detectado: "${opSendoMovida.fase}" → "${novaFase}" - solicitando justificativa`)
      setDadosRetrocesso({
        op: opSendoMovida,
        faseOrigem: opSendoMovida.fase,
        faseDestino: novaFase
      })
      setJustificativaRetrocesso('')
      setDialogoRetrocessoAberto(true)
      return
    }

    // Bloqueia pulo de etapa (tentativa de avançar mais de 1 fase)
    if (destinoIndex > origemIndex + 1) {
      console.warn(`❌ Movimento inválido (pulo de etapa): "${opSendoMovida.fase}" → "${novaFase}"`)
      const proximaFase = FASES[origemIndex + 1]
      setDadosMovimentoInvalido({
        opId,
        faseAtual: opSendoMovida.fase,
        faseDestino: novaFase,
        proximaFasePermitida: proximaFase
      })
      setDialogoMovimentoInvalidoAberto(true)
      return
    }

    if (novaFase === 'Concluído') {
      console.log(`🔔 Interceptando movimento para "Concluído" - OP ${opId}`)
      setOpPendenteConclusao({
        op: opSendoMovida,
        faseOriginal: opSendoMovida.fase,
      })
      setDialogoConclusaoAberto(true)
      return
    }

    // Se está movendo para "Envase", abre o diálogo de apontamento de preparação
    if (novaFase === 'Envase') {
      console.log(`🔔 Interceptando movimento para "Envase" - OP ${opId}`)
      setOpPendenteEnvase({
        op: opSendoMovida,
        faseOriginal: opSendoMovida.fase,
      })
      setDialogoEnvaseAberto(true)
      return
    }

    // Se está movendo para "Embalagem", abre o diálogo de apontamento de envase
    if (novaFase === 'Embalagem') {
      console.log(`🔔 Interceptando movimento para "Embalagem" - OP ${opId}`)
      setOpPendenteEmbalagem({
        op: opSendoMovida,
        faseOriginal: opSendoMovida.fase,
      })
      setDialogoEmbalagemAberto(true)
      return
    }


	    // Validação padrão de transição (apenas avanço sequencial)
	    if (!podeMoverParaFase(opSendoMovida.fase, novaFase)) {
	      console.warn(`❌ Movimento inválido: "${opSendoMovida.fase}" → "${novaFase}" não é permitido pela sequência`)
	      return
	    }

    // Para outras fases, move normalmente
    console.log(`📦 Movendo OP ${opId} para fase "${novaFase}"`)

    // Registra a movimentação no histórico de auditoria
    registrarMovimentacao(opId, opSendoMovida.fase, novaFase, 'avanco')

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
   * Confirma o retrocesso com justificativa obrigatória
   */
  const confirmarRetrocesso = () => {
    if (!dadosRetrocesso) return

    // Valida justificativa (mínimo 10 caracteres)
    if (!justificativaRetrocesso || justificativaRetrocesso.trim().length < 10) {
      alert('Por favor, forneça uma justificativa com pelo menos 10 caracteres.')
      return
    }

    const { op, faseOrigem, faseDestino } = dadosRetrocesso

    console.log(`🔄 Retrocesso confirmado: OP ${op.op} de "${faseOrigem}" para "${faseDestino}"`)
    console.log(`📝 Justificativa: ${justificativaRetrocesso}`)

    // Registra a movimentação no histórico de auditoria com justificativa
    registrarMovimentacao(op.op, faseOrigem, faseDestino, 'retrocesso', justificativaRetrocesso)

    // Atualiza o estado das OPs
    setOps((opsAtuais) => {
      const opsAtualizadas = opsAtuais.map((opAtual) => {
        if (opAtual.op === op.op) {
          console.log(`✅ OP ${op.op}: "${opAtual.fase}" → "${faseDestino}" (retrocesso)`)
          return { ...opAtual, fase: faseDestino }
        }
        return opAtual
      })

      // Salva no localStorage
      salvarOPs(opsAtualizadas)

      return opsAtualizadas
    })

    // Fecha o diálogo e limpa os dados
    setDialogoRetrocessoAberto(false)
    setDadosRetrocesso(null)
    setJustificativaRetrocesso('')
  }

  /**
   * Cancela o retrocesso
   */
  const cancelarRetrocesso = () => {
    console.log('❌ Retrocesso cancelado pelo usuário')
    setDialogoRetrocessoAberto(false)
    setDadosRetrocesso(null)
    setJustificativaRetrocesso('')
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
  const handleConfirmarConclusao = (quantidadeEmbaladaUnidades: number, perdas: number) => {
    if (!opPendenteConclusao) return

    const { op } = opPendenteConclusao

    console.log(`✅ Concluindo OP ${op.op}:`)
    console.log(`   - Quantidade Embalada (Unidades): ${quantidadeEmbaladaUnidades}`)
    console.log(`   - Perdas: ${perdas}`)
    console.log(`   - Fase: "${op.fase}" → "Concluído"`)

    // Atualiza o estado das OPs
    setOps((opsAtuais) => {
      const opsAtualizadas = opsAtuais.map((opAtual) => {
        if (opAtual.op === op.op) {
          return {
            ...opAtual,
            fase: 'Concluído' as FaseProducao,
            quantidadeEmbaladaUnidades,
            perdas,
            dataHoraEmbalagem: new Date().toISOString(), // Registra timestamp da conclusão
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
   * Manipula o cancelamento do dialogo de apontamento de Envase
   * Retorna a OP para a fase original (nao move)
   */
  const handleCancelarEnvase = () => {
    console.log('❌ Apontamento de Preparacao (para Envase) cancelado pelo usuario')
    setDialogoEnvaseAberto(false)
    setOpPendenteEnvase(null)
  }

  /**
   * Manipula a confirmacao do apontamento ao entrar em Envase
   * Atualiza os dados da OP (quantidade preparada e perdas da preparacao) e move para "Envase"
   */
  const handleConfirmarEnvase = (quantidadePreparadaMl: number, perdasPreparacaoMl: number) => {
    if (!opPendenteEnvase) return

    const { op } = opPendenteEnvase

    console.log(`✅ Registrando apontamento de Preparacao para OP ${op.op}:`)
    console.log(`   - Quantidade Preparada (ML): ${quantidadePreparadaMl}`)
    console.log(`   - Perdas na Preparacao (ML): ${perdasPreparacaoMl}`)
    console.log(`   - Fase: "${op.fase}" → "Envase"`)

    // Atualiza o estado das OPs
    setOps((opsAtuais) => {
      const opsAtualizadas = opsAtuais.map((opAtual) => {
        if (opAtual.op === op.op) {
          return {
            ...opAtual,
            fase: 'Envase' as FaseProducao,
            quantidadePreparadaMl,
            perdasPreparacaoMl,
            dataHoraPreparacao: new Date().toISOString(), // Registra timestamp da conclusão
          }
        }
        return opAtual
      })

      // Salva no localStorage
      salvarOPs(opsAtualizadas)

      return opsAtualizadas
    })

    // Fecha o dialogo
    setDialogoEnvaseAberto(false)
    setOpPendenteEnvase(null)
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

  /**
   * Manipula o cancelamento do dialogo de apontamento de Embalagem
   * Retorna a OP para a fase original (nao move)
   */
  const handleCancelarEmbalagem = () => {
    console.log('❌ Apontamento de Envase (para Embalagem) cancelado pelo usuario')
    setDialogoEmbalagemAberto(false)
    setOpPendenteEmbalagem(null)
  }

  /**
   * Manipula a confirmacao do apontamento ao entrar em Embalagem
   * Atualiza os dados da OP (quantidade envasada) e move para "Embalagem"
   */
  const handleConfirmarEmbalagem = (quantidadeEnvasadaUnidades: number, perdasEnvaseUnidades: number) => {
    if (!opPendenteEmbalagem) return

    const { op } = opPendenteEmbalagem

    console.log(`✅ Registrando apontamento de Envase para OP ${op.op}:`)
    console.log(`   - Quantidade Envasada (Unidades): ${quantidadeEnvasadaUnidades}`)
    console.log(`   - Perdas no Envase (Unidades): ${perdasEnvaseUnidades}`)
    console.log(`   - Fase: "${op.fase}" → "Embalagem"`)

    setOps((opsAtuais) => {
      const opsAtualizadas = opsAtuais.map((opAtual) => {
        if (opAtual.op === op.op) {
          return {
            ...opAtual,
            fase: 'Embalagem' as FaseProducao,
            quantidadeEnvasadaUnidades,
            perdasEnvaseUnidades,
            dataHoraEnvase: new Date().toISOString(), // Registra timestamp da conclusão
          }
        }
        return opAtual
      })

      salvarOPs(opsAtualizadas)
      return opsAtualizadas
    })

    setDialogoEmbalagemAberto(false)
    setOpPendenteEmbalagem(null)
  }


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
        collisionDetection={pointerWithin}
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

      {/* Dialogo de Apontamento de Envase */}

      {/* Diálogo para bloqueio de pulo de etapas */}
      <Dialog open={dialogoMovimentoInvalidoAberto} onOpenChange={(open) => !open && setDialogoMovimentoInvalidoAberto(false)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle className="text-xl">Não é possível pular etapas</DialogTitle>
                <DialogDescription className="mt-1">
                  O processo produtivo deve seguir a sequência obrigatória
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {dadosMovimentoInvalido && (
            <div className="space-y-6 py-4">
              {/* Informações da OP */}
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Factory className="h-4 w-4 text-muted-foreground" />
                  <span>Ordem de Produção: <span className="font-bold text-foreground">{dadosMovimentoInvalido.opId}</span></span>
                </div>
              </div>

              {/* Visualização das fases */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Sequência do processo produtivo:</p>
                <div className="flex flex-wrap items-center gap-2">
                  {FASES.map((fase, index) => {
                    const isFaseAtual = fase === dadosMovimentoInvalido.faseAtual
                    const isFaseDestino = fase === dadosMovimentoInvalido.faseDestino
                    const isProximaPermitida = fase === dadosMovimentoInvalido.proximaFasePermitida

                    return (
                      <div key={fase} className="flex items-center gap-2">
                        <Badge
                          variant={
                            isFaseAtual ? 'default' :
                            isProximaPermitida ? 'outline' :
                            isFaseDestino ? 'destructive' :
                            'secondary'
                          }
                          className={`
                            relative px-3 py-1.5 text-xs font-medium transition-all
                            ${isFaseAtual ? 'ring-2 ring-primary ring-offset-2' : ''}
                            ${isProximaPermitida ? 'border-2 border-green-500 text-green-700 dark:text-green-400' : ''}
                            ${isFaseDestino ? 'ring-2 ring-destructive ring-offset-2' : ''}
                          `}
                        >
                          <div className="flex items-center gap-1.5">
                            {isFaseAtual && <MapPin className="h-3 w-3" />}
                            {isProximaPermitida && <CheckCircle className="h-3 w-3" />}
                            {isFaseDestino && <Lock className="h-3 w-3" />}
                            <span>{fase}</span>
                          </div>
                        </Badge>
                        {index < FASES.length - 1 && (
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Legenda */}
              <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Legenda:</p>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="px-2 py-0.5">
                      <MapPin className="mr-1 h-3 w-3" />
                      Fase atual
                    </Badge>
                    <span className="text-xs text-muted-foreground">Onde a OP está agora</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-2 border-green-500 px-2 py-0.5 text-green-700 dark:text-green-400">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Próxima permitida
                    </Badge>
                    <span className="text-xs text-muted-foreground">Para onde você pode mover</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="px-2 py-0.5">
                      <Lock className="mr-1 h-3 w-3" />
                      Destino bloqueado
                    </Badge>
                    <span className="text-xs text-muted-foreground">Fase que você tentou pular</span>
                  </div>
                </div>
              </div>

              {/* Mensagem de orientação */}
              <div className="rounded-lg border-l-4 border-l-amber-500 bg-amber-50 p-4 dark:bg-amber-950/20">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                  Para mover a OP <span className="font-bold">{dadosMovimentoInvalido.opId}</span>,
                  arraste de <span className="font-bold">"{dadosMovimentoInvalido.faseAtual}"</span> para <span className="font-bold">"{dadosMovimentoInvalido.proximaFasePermitida}"</span>.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setDialogoMovimentoInvalidoAberto(false)} className="w-full sm:w-auto">
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Justificativa para Retrocesso */}
      <Dialog open={dialogoRetrocessoAberto} onOpenChange={(open) => !open && cancelarRetrocesso()}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                <RotateCcw className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">Retrocesso de Fase Detectado</DialogTitle>
                <DialogDescription className="mt-1">
                  Justificativa obrigatória para auditoria (ALCOA+)
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {dadosRetrocesso && (
            <div className="space-y-6 py-4">
              {/* Informações da OP */}
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium mb-3">
                  <Factory className="h-4 w-4 text-muted-foreground" />
                  <span>Ordem de Produção: <span className="font-bold text-foreground">{dadosRetrocesso.op.op}</span></span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p><span className="font-medium">Produto:</span> {dadosRetrocesso.op.produto}</p>
                  <p><span className="font-medium">Lote:</span> {dadosRetrocesso.op.lote}</p>
                </div>
              </div>

              {/* Visualização do movimento */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Movimento solicitado:</p>
                <div className="flex items-center justify-center gap-3">
                  <Badge variant="default" className="px-4 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{dadosRetrocesso.faseOrigem}</span>
                    </div>
                  </Badge>
                  <div className="flex items-center gap-2 text-amber-600">
                    <RotateCcw className="h-5 w-5" />
                    <span className="text-sm font-semibold">Retrocesso</span>
                  </div>
                  <Badge variant="outline" className="border-2 border-amber-500 px-4 py-2 text-sm text-amber-700 dark:text-amber-400">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      <span>{dadosRetrocesso.faseDestino}</span>
                    </div>
                  </Badge>
                </div>
              </div>

              {/* Alerta de auditoria */}
              <div className="rounded-lg border-l-4 border-l-amber-500 bg-amber-50 p-4 dark:bg-amber-950/20">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
                      Registro de Auditoria Obrigatório
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      Conforme princípios ALCOA+, todo retrocesso de fase deve ser justificado e registrado
                      com data/hora e usuário responsável para rastreabilidade completa.
                    </p>
                  </div>
                </div>
              </div>

              {/* Campo de justificativa */}
              <div className="space-y-2">
                <Label htmlFor="justificativa" className="text-sm font-semibold">
                  Justificativa do Retrocesso <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="justificativa"
                  placeholder="Descreva o motivo do retrocesso de forma clara e detalhada (mínimo 10 caracteres)..."
                  value={justificativaRetrocesso}
                  onChange={(e) => setJustificativaRetrocesso(e.target.value)}
                  className="min-h-[120px] resize-none"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  {justificativaRetrocesso.length} / mínimo 10 caracteres
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={cancelarRetrocesso}>
              Cancelar
            </Button>
            <Button
              onClick={confirmarRetrocesso}
              disabled={!justificativaRetrocesso || justificativaRetrocesso.trim().length < 10}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Confirmar Retrocesso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DialogoApontamentoEnvase
        op={opPendenteEnvase?.op || null}
        aberto={dialogoEnvaseAberto}
        onCancelar={handleCancelarEnvase}
        onConfirmar={handleConfirmarEnvase}
      />



      {/* Diálogo de Apontamento de Embalagem */}
      <DialogoApontamentoEmbalagem
        op={opPendenteEmbalagem?.op || null}
        aberto={dialogoEmbalagemAberto}
        onCancelar={handleCancelarEmbalagem}
        onConfirmar={handleConfirmarEmbalagem}
      />


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

