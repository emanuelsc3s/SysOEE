import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface NavigationCardProps {
  /** Título do card */
  title: string
  /** Ícone do card (componente Lucide React) */
  icon: React.ReactNode
  /** Caminho de navegação */
  path: string
  /** Função de callback opcional (sobrescreve navegação padrão) */
  onClick?: () => void
  /** Tamanho visual do card */
  size?: 'default' | 'compact'
  /** Se true, bloqueia a navegação e o clique */
  disabled?: boolean
  /** Mensagem de tooltip quando desabilitado */
  disabledMessage?: string
  /** Classes CSS adicionais */
  className?: string
}

/**
 * Card de navegação reutilizável para a Home
 * Segue o design system especificado em home-design-system.md
 */
export function NavigationCard({
  title,
  icon,
  path,
  onClick,
  size = 'default',
  disabled = false,
  disabledMessage = 'Acesso negado',
  className,
}: NavigationCardProps) {
  const isCompact = size === 'compact'
  const cardClasses = cn(
    // Layout e dimensões fixas com aspect ratio
    'flex flex-col items-center justify-center',
    'aspect-[4/3] w-full',
    isCompact ? 'p-3 sm:p-4 tab-prod:p-2' : 'p-4 sm:p-6 tab-prod:p-2',
    // Cursor e transições
    'motion-safe:transition-transform motion-safe:transition-shadow motion-safe:transition-colors motion-safe:duration-300',
    'touch-manipulation',
    // Background e bordas
    'bg-card rounded-xl shadow-sm',
    'no-underline',
    // Hover effects
    disabled
      ? 'cursor-not-allowed opacity-55 border border-transparent'
      : 'cursor-pointer hover:shadow-md motion-safe:hover:scale-[1.02] border border-transparent hover:border-primary/20',
    // Estados de foco para acessibilidade
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    // Posicionamento relativo para barra inferior
    'relative overflow-hidden',
    className
  )

  const conteudo = (
    <>
      {/* Ícone */}
      <div
        className={cn(
          'text-primary flex-shrink-0 tab-prod:scale-75',
          isCompact ? 'mb-2 tab-prod:mb-1' : 'mb-3 tab-prod:mb-1.5'
        )}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Título */}
      <p
        className={cn(
          'font-medium text-center text-foreground tab-prod:leading-tight',
          isCompact ? 'text-[13px] md:text-sm tab-prod:text-[11px]' : 'text-sm md:text-base tab-prod:text-xs'
        )}
      >
        {title}
      </p>

      {/* Barra decorativa inferior */}
      <div
        className={cn(
          'absolute bottom-0 left-0 w-full bg-primary',
          isCompact ? 'h-1 tab-prod:h-0.5' : 'h-1.5 tab-prod:h-1'
        )}
      ></div>
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cardClasses}
        disabled={disabled}
        aria-disabled={disabled}
        title={disabled ? disabledMessage : undefined}
      >
        {conteudo}
      </button>
    )
  }

  if (disabled) {
    return (
      <button
        type="button"
        className={cardClasses}
        disabled
        aria-disabled
        title={disabledMessage}
      >
        {conteudo}
      </button>
    )
  }

  return (
    <Link to={path} className={cardClasses}>
      {conteudo}
    </Link>
  )
}

