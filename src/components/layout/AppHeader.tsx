/**
 * Componente de cabeçalho da aplicação
 * Baseado no design system documentado em docs/design/header/
 *
 * Características:
 * - Altura fixa de 64px (h-16)
 * - Sticky no topo da página
 * - Menu dropdown com perfil do usuário
 * - Responsivo (oculta informações em mobile)
 * - Acessível (ARIA attributes)
 */

import { ChevronDown, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AppHeaderProps {
  /** Título da aplicação (padrão: "SysOEE - Sistema de Monitoramento OEE") */
  title?: string
  /** Nome do usuário logado */
  userName?: string
  /** Cargo/função do usuário */
  userRole?: string
  /** Iniciais do usuário para o avatar (calculado automaticamente se não fornecido) */
  userInitials?: string
  /** URL da foto do usuário */
  userPhotoUrl?: string
  /** Callback para logout */
  onLogout?: () => void
  /** Callback para navegar ao perfil */
  onProfileClick?: () => void
}

export function AppHeader({
  title = "SICFAR OEE - Sistema de Monitoramento OEE",
  userName = "Usuário",
  userRole = "Operador",
  userInitials,
  userPhotoUrl,
  onLogout,
  onProfileClick,
}: AppHeaderProps) {
  // Calcula as iniciais do usuário se não foram fornecidas
  const initials = userInitials || userName.substring(0, 2).toUpperCase()
	  return (
	    <header className="bg-white border-b h-16 flex items-center justify-between px-6 sticky top-0 z-40">
	      {/* Seção esquerda - Título */}
	      <div className="flex items-center gap-4 min-w-0">
        <img
          src="/logo-farmace.png"
          alt="Logo Farmace"
          className="h-full w-[136px] flex-shrink-0"
        />

        <div className="flex flex-col gap-0 min-w-0 leading-[18px]">
          <h1 className="text-lg sm:text-xl font-semibold text-primary leading-tight tracking-tight truncate">
	            {title}
	          </h1>
          <p className="text-sm text-muted-foreground leading-tight truncate">
	            Sistema de Monitoramento de Eficiência Operacional
	          </p>
	        </div>
	      </div>

	      {/* Seção direita - Menu do usuário */}
	      <div className="flex items-center gap-4">
	        <DropdownMenu>
	          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              aria-label="Menu do usuário"
            >
              <div className="flex items-center gap-2">
                {/* Avatar */}
                <Avatar className="h-8 w-8">
                  {userPhotoUrl ? (
                    <AvatarImage src={userPhotoUrl} alt={userName} />
                  ) : null}
                  <AvatarFallback className="bg-primary text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Informações do usuário - oculto em mobile */}
                <div className="text-sm text-left hidden md:block">
                  <p className="font-medium leading-none mb-1">
                    {userName}
                  </p>
                  <p className="text-xs text-muted-foreground leading-none">
                    {userRole}
                  </p>
                </div>
              </div>

              {/* Ícone dropdown */}
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>

          {/* Conteúdo do dropdown */}
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {onProfileClick && (
              <>
                <DropdownMenuItem onClick={onProfileClick}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            {onLogout && (
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
