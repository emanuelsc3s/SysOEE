/**
 * Modal de Seleção de Tipo de Visualização de Operação
 * Permite ao usuário escolher entre visualização por Ordem de Produção ou por Equipamento
 */

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ClipboardList, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalSelecaoOperacaoProps {
  /** Controla se o modal está aberto */
  aberto: boolean
  /** Callback chamado quando o modal é fechado */
  onFechar: () => void
  /** Callback chamado quando "Por Ordem de Produção" é selecionado */
  onSelecionarOrdemProducao: () => void
  /** Callback chamado quando "Por Equipamento" é selecionado */
  onSelecionarEquipamento: () => void
}

/**
 * Card de opção clicável dentro do modal
 */
interface OpcaoCardProps {
  /** Título da opção */
  titulo: string
  /** Descrição da opção */
  descricao: string
  /** Ícone da opção */
  icone: React.ReactNode
  /** Callback ao clicar */
  onClick: () => void
  /** Cor de destaque (primary ou secondary) */
  cor?: 'primary' | 'secondary'
}

function OpcaoCard({ titulo, descricao, icone, onClick, cor = 'primary' }: OpcaoCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        // Layout e dimensões - Otimizado para tablet de produção
        'relative overflow-hidden',
        'rounded-lg border-2 p-6 tab-prod:p-3',
        'cursor-pointer transition-all duration-300',
        // Cores baseadas no tema do projeto
        cor === 'primary'
          ? 'border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40'
          : 'border-accent/20 bg-accent/5 hover:bg-accent/10 hover:border-accent/40',
        // Efeitos de hover
        'hover:shadow-lg hover:scale-[1.02]',
        // Acessibilidade
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
      )}
    >
      {/* Barra superior decorativa */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1 transition-transform duration-300 tab-prod:h-0.5',
          cor === 'primary' ? 'bg-primary' : 'bg-accent',
          isHovered ? 'scale-x-100' : 'scale-x-0'
        )}
        style={{ transformOrigin: 'left' }}
      />

      {/* Ícone */}
      <div
        className={cn(
          'mb-4 tab-prod:mb-2 inline-flex items-center justify-center',
          'w-16 h-16 tab-prod:w-10 tab-prod:h-10 rounded-lg transition-all duration-300',
          cor === 'primary'
            ? 'bg-primary text-primary-foreground'
            : 'bg-accent text-accent-foreground',
          isHovered && 'scale-110 rotate-3'
        )}
      >
        {icone}
      </div>

      {/* Título */}
      <h3 className="text-xl tab-prod:text-sm font-semibold text-foreground mb-2 tab-prod:mb-1">
        {titulo}
      </h3>

      {/* Descrição */}
      <p className="text-sm tab-prod:text-[10px] text-muted-foreground leading-relaxed tab-prod:leading-tight">
        {descricao}
      </p>

      {/* Badge de disponibilidade */}
      <div className="mt-4 tab-prod:mt-2">
        <span
          className={cn(
            'inline-block px-3 py-1 tab-prod:px-2 tab-prod:py-0.5 rounded-full text-xs tab-prod:text-[9px] font-medium',
            cor === 'primary'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-amber-100 text-amber-800 border border-amber-200'
          )}
        >
          {cor === 'primary' ? 'Disponível' : 'Em Desenvolvimento'}
        </span>
      </div>
    </div>
  )
}

/**
 * Modal de Seleção de Tipo de Visualização de Operação
 * Otimizado para tablet de produção (1000x400px)
 */
export function ModalSelecaoOperacao({
  aberto,
  onFechar,
  onSelecionarOrdemProducao,
  onSelecionarEquipamento,
}: ModalSelecaoOperacaoProps) {
  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="sm:max-w-[700px] tab-prod:max-w-[500px] tab-prod:p-3">
        <DialogHeader className="tab-prod:space-y-1">
          <DialogTitle className="text-2xl tab-prod:text-lg font-bold text-primary">
            Selecione o Tipo de Visualização
          </DialogTitle>
          <DialogDescription className="text-base tab-prod:text-xs">
            Escolha como deseja visualizar as operações em andamento
          </DialogDescription>
        </DialogHeader>

        {/* Grid de opções - Otimizado para tablet de produção */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 tab-prod:gap-2 mt-4 tab-prod:mt-2 mb-4 tab-prod:mb-3">
          {/* Opção 1: Por Ordem de Produção */}
          <OpcaoCard
            titulo="Por Ordem de Produção"
            descricao="Visualização em tempo real das ordens de produção organizadas por fase de produção (Kanban)"
            icone={<ClipboardList className="w-8 h-8 tab-prod:w-5 tab-prod:h-5" />}
            onClick={onSelecionarOrdemProducao}
            cor="primary"
          />

          {/* Opção 2: Por Equipamento */}
          <OpcaoCard
            titulo="Por Equipamento"
            descricao="Visualização dos equipamentos e linhas de produção com status de operação em tempo real"
            icone={<Wrench className="w-8 h-8 tab-prod:w-5 tab-prod:h-5" />}
            onClick={onSelecionarEquipamento}
            cor="secondary"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

