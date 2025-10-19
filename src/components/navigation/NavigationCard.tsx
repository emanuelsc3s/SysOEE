import { useNavigate } from 'react-router-dom'
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
  className,
}: NavigationCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      navigate(path)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        // Layout e dimensões fixas com aspect ratio
        'flex flex-col items-center justify-center',
        'aspect-[4/3] w-full',
        'p-4 sm:p-6',
        // Cursor e transições
        'cursor-pointer transition-all duration-300',
        // Background e bordas
        'bg-card rounded-xl shadow-sm',
        // Hover effects
        'hover:shadow-md hover:scale-[1.02]',
        'border border-transparent hover:border-primary/20',
        // Posicionamento relativo para barra inferior
        'relative overflow-hidden',
        className
      )}
    >
      {/* Ícone */}
      <div className="mb-3 text-primary flex-shrink-0">
        {icon}
      </div>

      {/* Título */}
      <p className="font-medium text-center text-foreground text-sm md:text-base">
        {title}
      </p>

      {/* Barra decorativa inferior */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-primary"></div>
    </div>
  )
}

