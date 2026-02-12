/**
 * Componente de cabeçalho da aplicação
 * Baseado no design system documentado em docs/design/header/
 *
 * Características:
 * - Altura fixa de 64px (h-16)
 * - Sticky no topo da página
 * - Menu dropdown com perfil do usuário
 * - Responsivo (layout centralizado e compacto em mobile)
 * - Acessível (ARIA attributes)
 */

import { ArrowLeft, ChevronDown, User, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
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

const APP_SUBTITLE = "Sistema de Monitoramento de Eficiência Operacional"

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

function gerarIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)

  if (partes.length === 0) {
    return "US"
  }

  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase()
  }

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
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
  const navigate = useNavigate()
  const nomeExibicao = userName.trim() || "Usuário"
  const cargoExibicao = userRole.trim() || "Operador"
  const initials = userInitials?.trim().slice(0, 2).toUpperCase() || gerarIniciais(nomeExibicao)
  const semAcoes = !onProfileClick && !onLogout
  const tituloMobile = "SICFAR OEE"

  const handleVoltarClick = () => {
    navigate(-1)
  }

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-primary/20 bg-primary text-primary-foreground shadow-sm dark:bg-muted dark:border-border dark:text-foreground">
      <div className="grid h-full grid-cols-[auto_1fr_auto] items-center gap-2 px-4 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:px-6">
        {/* Seção esquerda - Título e identidade */}
        <div className="flex h-full min-w-0 items-center gap-2 sm:gap-4 sm:flex-1">
          <button
            type="button"
            onClick={handleVoltarClick}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors hover:bg-primary-foreground/10 dark:hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:hidden"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="hidden h-full min-w-0 items-center gap-3 sm:flex">
            <img
              src="/logo-farmace.png"
              alt="Logomarca Farmace"
              className="w-[138px] h-auto object-contain"
              loading="eager"
            />
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold leading-tight tracking-tight text-primary-foreground dark:text-foreground sm:text-base lg:text-lg">
                {title}
              </h1>
              <p className="hidden truncate text-xs text-primary-foreground/70 dark:text-muted-foreground sm:block">
                {APP_SUBTITLE}
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-0 justify-self-center text-center sm:hidden">
          <p className="truncate text-[24px] font-semibold leading-tight tracking-tight text-primary-foreground dark:text-foreground">
            {tituloMobile}
          </p>
        </div>

        {/* Seção direita - Menu do usuário */}
        <div className="flex shrink-0 items-center justify-self-end sm:ml-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-11 min-w-[44px] gap-2 rounded-full border border-transparent px-1.5 pr-2 text-primary-foreground transition-colors hover:border-primary-foreground/20 hover:bg-primary-foreground/10 data-[state=open]:border-primary-foreground/20 data-[state=open]:bg-primary-foreground/10 dark:text-foreground dark:hover:border-border dark:hover:bg-accent dark:data-[state=open]:border-border dark:data-[state=open]:bg-accent sm:px-2 sm:pr-3"
                aria-label={`Abrir menu do usuário ${nomeExibicao}`}
              >
                <div className="flex items-center gap-2">
                  {/* Avatar */}
                  <Avatar className="h-8 w-8 ring-1 ring-primary-foreground/20 dark:ring-white/[0.08]">
                    {userPhotoUrl ? (
                      <AvatarImage src={userPhotoUrl} alt={nomeExibicao} />
                    ) : null}
                    <AvatarFallback className="bg-primary-foreground/15 text-primary-foreground font-semibold dark:bg-white/[0.08] dark:text-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  {/* Informações do usuário - oculto em mobile */}
                  <div className="hidden max-w-[180px] text-left md:block">
                    <p className="truncate text-sm font-medium leading-none text-primary-foreground dark:text-foreground">
                      {nomeExibicao}
                    </p>
                    <p className="mt-1 truncate text-xs leading-none text-primary-foreground/70 dark:text-muted-foreground">
                      {cargoExibicao}
                    </p>
                  </div>
                </div>

                {/* Ícone dropdown */}
                <ChevronDown
                  className="hidden h-4 w-4 text-primary-foreground/70 dark:text-muted-foreground transition-transform duration-200 sm:block"
                  aria-hidden="true"
                />
              </Button>
            </DropdownMenuTrigger>

            {/* Conteúdo do dropdown */}
            <DropdownMenuContent align="end" sideOffset={8} className="w-56 rounded-lg p-2 sm:w-64">
              <DropdownMenuLabel className="px-2 py-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 ring-1 ring-primary/30 dark:ring-white/[0.08]">
                    {userPhotoUrl ? (
                      <AvatarImage src={userPhotoUrl} alt={nomeExibicao} />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold dark:bg-white/[0.08] dark:text-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {nomeExibicao}
                    </p>
                    <p className="truncate text-xs font-normal text-muted-foreground">
                      {cargoExibicao}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {onProfileClick && (
                <>
                  <DropdownMenuItem className="min-h-11 cursor-pointer rounded-md" onClick={onProfileClick}>
                    <User className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  {onLogout ? <DropdownMenuSeparator /> : null}
                </>
              )}

              {onLogout && (
                <DropdownMenuItem
                  className="min-h-11 cursor-pointer rounded-md text-destructive focus:text-destructive"
                  onClick={onLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>Sair</span>
                </DropdownMenuItem>
              )}
              {semAcoes && (
                <DropdownMenuItem disabled className="min-h-11 rounded-md text-muted-foreground">
                  Nenhuma ação disponível
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
