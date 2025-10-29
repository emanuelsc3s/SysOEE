/**
 * Componente OPCard - Card de Ordem de Produção para o Kanban
 * Exibe informações detalhadas de uma OP em formato de card
 */

import { useState, useRef } from 'react'
import { OrdemProducao, AssinaturaSupervisao } from '@/types/operacao'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Factory,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Paperclip,
  Pause,
  FileSignature, // Ícone para Assinatura Eletrônica
  FileText, // Ícone para Dossiê
  ChevronLeft, // Seta para esquerda (navegação do carrossel)
  ChevronRight // Seta para direita (navegação do carrossel)
} from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useNavigate } from 'react-router-dom'
import { ModalAssinaturaSupervisao } from './ModalAssinaturaSupervisao'
import { toast } from 'sonner'
import { salvarAssinatura } from '@/services/localStorage/assinatura.storage'

interface OPCardProps {
  op: OrdemProducao
}

/**
 * Retorna a cor do badge baseado no turno
 * Sistema utiliza apenas 2 turnos
 */
function getCorTurno(turno: string): string {
  const cores: Record<string, string> = {
    '1º Turno': 'bg-blue-100 text-blue-800 border-blue-200',
    '2º Turno': 'bg-green-100 text-green-800 border-green-200',
  }
  return cores[turno] || 'bg-gray-100 text-gray-800 border-gray-200'
}

/**
 * Retorna a cor do badge baseado no setor
 */
function getCorSetor(setor: string): string {
  const cores: Record<string, string> = {
    'SPEP': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'SPPV': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'Líquidos': 'bg-teal-100 text-teal-800 border-teal-200',
    'CPHD': 'bg-amber-100 text-amber-800 border-amber-200'
  }
  return cores[setor] || 'bg-gray-100 text-gray-800 border-gray-200'
}

/**
 * Calcula a porcentagem de produção
 */
function calcularProgresso(quantidadeEmbaladaUnidades: number, teorico: number): number {
  // Trata valores inválidos como zero
  if (quantidadeEmbaladaUnidades == null || isNaN(quantidadeEmbaladaUnidades) || !isFinite(quantidadeEmbaladaUnidades)) {
    return 0
  }
  if (teorico == null || isNaN(teorico) || !isFinite(teorico) || teorico === 0) {
    return 0
  }
  return Math.min(Math.round((quantidadeEmbaladaUnidades / teorico) * 100), 100)
}

/**
 * Formata número com separador de milhares
 */
function formatarNumero(num: number): string {
  // Trata valores inválidos como zero
  if (num == null || isNaN(num) || !isFinite(num)) {
    return '0'
  }
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 0
  }).format(num)
}

export default function OPCard({ op }: OPCardProps) {
  const navigate = useNavigate()
  const progresso = calcularProgresso(op.quantidadeEmbaladaUnidades, op.quantidadeTeorica)
  const temPerdas = op.perdas != null && !isNaN(op.perdas) && op.perdas > 0

  // Estado para controlar a rolagem dos botões
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(true)

  // Estado para controlar o modal de assinatura
  const [modalAssinaturaAberto, setModalAssinaturaAberto] = useState(false)

  // Configura o card como arrastável
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: op.op,
  })

  // Estilo de transformação durante o arrasto
  const style = {
    transform: CSS.Translate.toString(transform),
  }

  // Handler para navegação ao clicar no botão Detalhes
  const handleDetalhesClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/operacao/${op.op}`)
  }

  // Handler para abrir o modal de assinatura
  const handleAbrirModalAssinatura = (e: React.MouseEvent) => {
    e.stopPropagation()
    setModalAssinaturaAberto(true)
  }

  // Handler para confirmar a assinatura
  const handleConfirmarAssinatura = (assinatura: AssinaturaSupervisao) => {
    try {
      console.log('Assinatura confirmada:', assinatura)

      // Salva a assinatura no localStorage
      salvarAssinatura(assinatura)

      // Exibe notificação de sucesso
      toast.success('Assinatura registrada com sucesso!', {
        description: `OP ${op.op} assinada por ${assinatura.nomeSupervisor}`,
        duration: 5000,
      })

      // Fecha o modal
      setModalAssinaturaAberto(false)
    } catch (error) {
      console.error('Erro ao salvar assinatura:', error)

      // Exibe notificação de erro
      toast.error('Erro ao registrar assinatura', {
        description: 'Não foi possível salvar a assinatura. Tente novamente.',
        duration: 5000,
      })
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`w-full hover:shadow-md transition-all duration-200 border-l-4 border-l-primary tab-prod:border-l-2 ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      <CardHeader className="pb-3 tab-prod:pb-1 tab-prod:px-2 tab-prod:pt-2">
        <div className="flex items-center justify-between gap-2 tab-prod:gap-1">
          {/* Handle de Drag - Área específica para arrastar */}
          <div
            {...listeners}
            className="flex items-stretch gap-2 cursor-grab active:cursor-grabbing touch-none tab-prod:gap-1"
            title="Arraste para mover o card"
          >
            {/* Gripper customizado com 4 colunas × 6 linhas de pontos */}
            <svg
              className="w-6 text-muted-foreground/50 hover:text-muted-foreground transition-colors flex-shrink-0 self-stretch tab-prod:w-4"
              viewBox="0 0 28 48"
              fill="none"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Coluna 1 (cx="5") - 6 linhas */}
              <circle cx="5" cy="4" r="1.5" fill="currentColor" />
              <circle cx="5" cy="12" r="1.5" fill="currentColor" />
              <circle cx="5" cy="20" r="1.5" fill="currentColor" />
              <circle cx="5" cy="28" r="1.5" fill="currentColor" />
              <circle cx="5" cy="36" r="1.5" fill="currentColor" />
              <circle cx="5" cy="44" r="1.5" fill="currentColor" />

              {/* Coluna 2 (cx="11") - 6 linhas */}
              <circle cx="11" cy="4" r="1.5" fill="currentColor" />
              <circle cx="11" cy="12" r="1.5" fill="currentColor" />
              <circle cx="11" cy="20" r="1.5" fill="currentColor" />
              <circle cx="11" cy="28" r="1.5" fill="currentColor" />
              <circle cx="11" cy="36" r="1.5" fill="currentColor" />
              <circle cx="11" cy="44" r="1.5" fill="currentColor" />

              {/* Coluna 3 (cx="17") - 6 linhas */}
              <circle cx="17" cy="4" r="1.5" fill="currentColor" />
              <circle cx="17" cy="12" r="1.5" fill="currentColor" />
              <circle cx="17" cy="20" r="1.5" fill="currentColor" />
              <circle cx="17" cy="28" r="1.5" fill="currentColor" />
              <circle cx="17" cy="36" r="1.5" fill="currentColor" />
              <circle cx="17" cy="44" r="1.5" fill="currentColor" />

              {/* Coluna 4 (cx="23") - 6 linhas */}
              <circle cx="23" cy="4" r="1.5" fill="currentColor" />
              <circle cx="23" cy="12" r="1.5" fill="currentColor" />
              <circle cx="23" cy="20" r="1.5" fill="currentColor" />
              <circle cx="23" cy="28" r="1.5" fill="currentColor" />
              <circle cx="23" cy="36" r="1.5" fill="currentColor" />
              <circle cx="23" cy="44" r="1.5" fill="currentColor" />
            </svg>
            <div className="flex flex-col">
              <CardTitle className="text-sm font-bold text-primary leading-normal tab-prod:text-xs tab-prod:leading-tight">
                OP {op.op}
              </CardTitle>
              <span className="text-sm font-bold text-primary leading-normal tab-prod:text-xs tab-prod:leading-tight">
                Lote: {op.lote}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 items-end tab-prod:gap-0">
            <Badge className={`text-xs ${getCorSetor(op.setor)} tab-prod:text-[9px] tab-prod:px-0.5 tab-prod:py-0 tab-prod:leading-tight`}>
              {op.setor}
            </Badge>
            <Badge className={`text-xs ${getCorTurno(op.turno)} tab-prod:text-[9px] tab-prod:px-0.5 tab-prod:py-0 tab-prod:leading-tight`}>
              {op.turno}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 tab-prod:space-y-1 tab-prod:px-2 tab-prod:pb-2">
        {/* Data de Emissão */}
        <div className="flex items-center gap-2 text-sm tab-prod:gap-0.5 tab-prod:text-[10px]">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0 tab-prod:h-2.5 tab-prod:w-2.5" />
          <span className="text-muted-foreground tab-prod:hidden">Emissão:</span>
          <span className="font-medium">{op.dataEmissao}</span>
        </div>


        {/* Produto */}
        <div className="pt-2 pb-2 border-t border-b border-border tab-prod:pt-1 tab-prod:pb-1">
          <p className="text-sm font-semibold text-foreground truncate tab-prod:text-[10px]" title={op.produto}>
            {op.produto}
          </p>
          <p className="text-xs text-muted-foreground mt-1 tab-prod:text-[9px] tab-prod:mt-0 tab-prod:leading-tight">
            SKU: {op.sku}
          </p>
        </div>

        {/* Equipamento */}
        <div className="flex items-center gap-2 text-sm tab-prod:gap-0.5 tab-prod:text-[10px]">
          <Factory className="h-4 w-4 text-muted-foreground flex-shrink-0 tab-prod:h-2.5 tab-prod:w-2.5" />
          <span className="text-muted-foreground tab-prod:hidden">Equipamento:</span>
          <span className="font-medium">{op.equipamento}</span>
        </div>

        {/* Horas e Turno */}
        <div className="flex items-center justify-between gap-2 text-sm tab-prod:gap-0.5 tab-prod:text-[10px]">
          <div className="flex items-center gap-2 tab-prod:gap-0.5">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0 tab-prod:h-2.5 tab-prod:w-2.5" />
            <span className="text-muted-foreground tab-prod:hidden">Horas:</span>
            <span className="font-medium">{op.horas}</span>
          </div>
        </div>

        {/* Quantidades */}
        <div className="space-y-2 pt-2 border-t border-border tab-prod:space-y-0.5 tab-prod:pt-1">
          <div className="flex items-center justify-between text-sm tab-prod:text-[10px]">
            <span className="text-muted-foreground">Teórico:</span>
            <span className="font-semibold">{formatarNumero(op.quantidadeTeorica)}</span>
          </div>

          <div className="flex items-center justify-between text-sm tab-prod:text-[10px]">
            <div className="flex items-center gap-1 tab-prod:gap-0.5">
              <CheckCircle2 className="h-4 w-4 text-green-600 tab-prod:h-2.5 tab-prod:w-2.5" />
              <span className="text-muted-foreground tab-prod:hidden">Produzido:</span>
              <span className="text-muted-foreground tab-prod:inline hidden">Prod:</span>
            </div>
            <span className="font-semibold text-green-700">
              {formatarNumero(op.quantidadeEmbaladaUnidades)} ({progresso}%)
            </span>
          </div>

          {temPerdas && (
            <div className="flex items-center justify-between text-sm tab-prod:text-[10px]">
              <div className="flex items-center gap-1 tab-prod:gap-0.5">
                <AlertTriangle className="h-4 w-4 text-orange-600 tab-prod:h-2.5 tab-prod:w-2.5" />
                <span className="text-muted-foreground">Perdas:</span>
              </div>
              <span className="font-semibold text-orange-700">
                {formatarNumero(op.perdas)}
              </span>
            </div>
          )}

          {/* Barra de Progresso */}
          <div className="pt-2 tab-prod:pt-0.5">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden tab-prod:h-1">
              <div
                className="bg-primary h-full transition-all duration-300 rounded-full"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
        </div>

        {/* Informações Adicionais (se disponíveis) - Ocultar em tablet para economizar espaço */}
        {op.dossie && (
          <div className="pt-2 border-t border-border space-y-1 tab-prod:hidden">
            <p className="text-xs text-muted-foreground">
              Dossiê: <span className="font-medium">{op.dossie}</span>
            </p>
          </div>
        )}

        {/* Botões de Ação com Rolagem */}
        <div className="pt-3 border-t border-border tab-prod:pt-2">
          <div className="relative flex items-center">
            {/* Botão Rolar para Esquerda - Posicionamento Absoluto */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (scrollContainerRef.current) {
                  scrollContainerRef.current.scrollBy({ left: -100, behavior: 'smooth' })
                }
              }}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-5 h-10 flex items-center justify-center bg-background/50 backdrop-blur-sm border-0 rounded-md hover:bg-primary/10 hover:text-primary transition-all duration-200 tab-prod:hidden ${
                !canScrollUp ? 'opacity-0 pointer-events-none' : 'opacity-60 hover:opacity-100'
              }`}
              aria-label="Rolar para esquerda"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>

            {/* Container de Rolagem dos Botões - Ocupa 100% da largura */}
            <div
              ref={scrollContainerRef}
              onScroll={(e) => {
                const target = e.currentTarget
                // Para desktop (horizontal scroll)
                setCanScrollUp(target.scrollLeft > 0)
                setCanScrollDown(
                  target.scrollLeft < target.scrollWidth - target.clientWidth - 1
                )
                // Para tablet (vertical scroll)
                if (target.scrollHeight > target.clientHeight) {
                  setCanScrollUp(target.scrollTop > 0)
                  setCanScrollDown(
                    target.scrollTop < target.scrollHeight - target.clientHeight - 1
                  )
                }
              }}
              className="w-full flex gap-2 overflow-x-auto overflow-y-hidden tab-prod:gap-1 tab-prod:overflow-y-auto tab-prod:overflow-x-hidden tab-prod:flex-col tab-prod:max-h-32 scrollbar-none"
            >
              {/* Botão Detalhes */}
              <Button
                onClick={handleDetalhesClick}
                variant="outline"
                className="flex flex-col items-center justify-center h-14 gap-1 border-primary hover:bg-primary/10 min-w-[80px] tab-prod:h-12 tab-prod:gap-0.5 tab-prod:w-full tab-prod:min-w-0"
                size="sm"
              >
                <Eye className="h-4 w-4 text-primary tab-prod:h-3 tab-prod:w-3" />
                <span className="text-[10px] tab-prod:text-[9px] font-medium whitespace-nowrap">Detalhes</span>
              </Button>

              {/* Botão Anexos */}
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  console.log('Anexos clicado para OP:', op.op)
                  // TODO: Implementar visualização de anexos
                }}
                variant="outline"
                className="flex flex-col items-center justify-center h-14 gap-1 border-primary hover:bg-primary/10 min-w-[80px] tab-prod:h-12 tab-prod:gap-0.5 tab-prod:w-full tab-prod:min-w-0"
                size="sm"
              >
                <Paperclip className="h-4 w-4 text-primary tab-prod:h-3 tab-prod:w-3" />
                <span className="text-[10px] tab-prod:text-[9px] font-medium whitespace-nowrap">Anexos</span>
              </Button>

              {/* Botão Paradas */}
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  console.log('Paradas clicado para OP:', op.op)
                  // TODO: Implementar visualização de paradas
                }}
                variant="outline"
                className="flex flex-col items-center justify-center h-14 gap-1 border-primary hover:bg-primary/10 min-w-[80px] tab-prod:h-12 tab-prod:gap-0.5 tab-prod:w-full tab-prod:min-w-0"
                size="sm"
              >
                <Pause className="h-4 w-4 text-primary tab-prod:h-3 tab-prod:w-3" />
                <span className="text-[10px] tab-prod:text-[9px] font-medium whitespace-nowrap">Paradas</span>
              </Button>

              {/* Botão Dossiê */}
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  console.log('Dossiê clicado para OP:', op.op)
                  // TODO: Implementar visualização do dossiê
                }}
                variant="outline"
                className="flex flex-col items-center justify-center h-14 gap-1 border-primary hover:bg-primary/10 min-w-[80px] tab-prod:h-12 tab-prod:gap-0.5 tab-prod:w-full tab-prod:min-w-0"
                size="sm"
              >
                <FileText className="h-4 w-4 text-primary tab-prod:h-3 tab-prod:w-3" />
                <span className="text-[10px] tab-prod:text-[9px] font-medium whitespace-nowrap">Dossiê</span>
              </Button>

              {/* Botão Assinatura Eletrônica */}
              <Button
                onClick={handleAbrirModalAssinatura}
                variant="outline"
                className="flex flex-col items-center justify-center h-14 gap-1 border-primary hover:bg-primary/10 min-w-[80px] tab-prod:h-12 tab-prod:gap-0.5 tab-prod:w-full tab-prod:min-w-0"
                size="sm"
              >
                <FileSignature className="h-4 w-4 text-primary tab-prod:h-3 tab-prod:w-3" />
                <span className="text-[10px] tab-prod:text-[9px] font-medium whitespace-nowrap">Assinar</span>
              </Button>
            </div>

            {/* Botão Rolar para Direita - Posicionamento Absoluto */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (scrollContainerRef.current) {
                  scrollContainerRef.current.scrollBy({ left: 100, behavior: 'smooth' })
                }
              }}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-5 h-10 flex items-center justify-center bg-background/50 backdrop-blur-sm border-0 rounded-md hover:bg-primary/10 hover:text-primary transition-all duration-200 tab-prod:hidden ${
                !canScrollDown ? 'opacity-0 pointer-events-none' : 'opacity-60 hover:opacity-100'
              }`}
              aria-label="Rolar para direita"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </CardContent>

      {/* Modal de Assinatura de Aprovação da Supervisão */}
      <ModalAssinaturaSupervisao
        aberto={modalAssinaturaAberto}
        onFechar={() => setModalAssinaturaAberto(false)}
        op={op}
        onConfirmar={handleConfirmarAssinatura}
      />
    </Card>
  )
}

