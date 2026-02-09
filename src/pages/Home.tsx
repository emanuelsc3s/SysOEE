import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  Activity,
  FileText,
  AlertCircle,
  Settings,
  Users,
  Clock,
  Package,
  Wrench,
  Shield,
  ChevronDown,
  LogOut,
  Gauge
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { BrandingSection } from '@/components/branding/BrandingSection'
import { NavigationCard } from '@/components/navigation/NavigationCard'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ModalSelecaoOperacao } from '@/components/operacao/ModalSelecaoOperacao'
import { ModalSelecaoApontamentoOee } from '@/components/apontamento/ModalSelecaoApontamentoOee'

/**
 * Retorna a saudação apropriada baseada no horário atual
 * Bom dia: 00:00 - 11:59
 * Boa tarde: 12:00 - 17:59
 * Boa noite: 18:00 - 23:59
 */
const getSaudacao = (): string => {
  const hora = new Date().getHours()

  if (hora >= 0 && hora < 12) {
    return 'Bom dia'
  } else if (hora >= 12 && hora < 18) {
    return 'Boa tarde'
  } else {
    return 'Boa noite'
  }
}

/**
 * Página Home do Sistema OEE SicFar
 * Layout split-screen: 25% branding + 75% conteúdo
 * Segue especificações do home-design-system.md e PRD
 */
export default function Home() {
  const navigate = useNavigate()

  // Estado para controlar o modal de seleção de operação
  const [modalOperacaoAberto, setModalOperacaoAberto] = useState(false)

  // Estado para controlar o modal de seleção do apontamento OEE
  const [modalApontamentoOeeAberto, setModalApontamentoOeeAberto] = useState(false)

  // Estado para controlar o dialog de confirmação de logout
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  // Hook de autenticação
  const { user: authUser, isLoading, signOut } = useAuth()

  // Derivar dados do usuário autenticado
  const user = {
    name: authUser?.usuario || authUser?.email?.split('@')[0] || 'Usuário',
    email: authUser?.email || '',
    initials: (authUser?.usuario || authUser?.email)?.substring(0, 2).toUpperCase() || 'U',
    photoUrl: null,
    role: authUser?.perfil || 'Operador',
  }

  // Obtém a saudação baseada no horário
  const saudacao = getSaudacao()

  /**
   * Abre o modal de seleção de tipo de operação
   */
  const handleAbrirModalOperacao = () => {
    setModalOperacaoAberto(true)
  }

  /**
   * Fecha o modal de seleção
   */
  const handleFecharModalOperacao = () => {
    setModalOperacaoAberto(false)
  }

  /**
   * Abre o modal de seleção do apontamento OEE
   */
  const handleAbrirModalApontamentoOee = () => {
    setModalApontamentoOeeAberto(true)
  }

  /**
   * Fecha o modal de seleção do apontamento OEE
   */
  const handleFecharModalApontamentoOee = () => {
    setModalApontamentoOeeAberto(false)
  }

  /**
   * Navega para a página de Operação (visualização por Ordem de Produção)
   */
  const handleSelecionarOrdemProducao = () => {
    setModalOperacaoAberto(false)
    navigate('/operacao')
  }

  /**
   * Navega para a página de Operação (visualização por Equipamento)
   */
  const handleSelecionarEquipamento = () => {
    setModalOperacaoAberto(false)
    navigate('/operacao-equipamento')
  }

  /**
   * Abre o dialog de confirmação de logout
   */
  const handleOpenLogoutDialog = () => {
    setShowLogoutDialog(true)
  }

  /**
   * Fecha o dialog de confirmação sem fazer logout
   */
  const handleCancelLogout = () => {
    setShowLogoutDialog(false)
  }

  /**
   * Confirma e realiza logout do sistema
   */
  const handleConfirmLogout = async () => {
    setShowLogoutDialog(false)
    await signOut()
  }

  // Tamanho dos ícones otimizado para mobile sem impactar desktop
  const iconClassName = 'h-8 w-8 md:h-10 md:w-10'

  // Definição dos módulos de navegação
  const navigationItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className={iconClassName} />,
      path: '/dashboard',
      description: 'Visualização de OEE e gráficos principais'
    },
    {
      title: 'Ordem de Produção',
      icon: <ClipboardList className={iconClassName} />,
      path: '/ordem-producao',
      description: 'Gestão de ordens de produção ativas'
    },
    {
      title: 'Operação',
      icon: <Activity className={iconClassName} />,
      path: '/operacao',
      description: 'Visualizar quais equipamentos estão atualmente em operação',
      // Intercepta o clique para abrir o modal de seleção
      onClick: handleAbrirModalOperacao
    },
    {
      title: 'Apontamento OEE',
      icon: <FileText className={iconClassName} />,
      path: '/oee-turno',
      description: 'Listagem e consulta de apontamentos de OEE por turno',
      // Intercepta o clique para abrir o modal de seleção
      onClick: handleAbrirModalApontamentoOee
    },
    {
      title: 'Paradas',
      icon: <AlertCircle className={iconClassName} />,
      path: '/oee-parada',
      description: 'Análise de paradas e Books de Paradas'
    },
    {
      title: 'Linha de Produção',
      icon: <Wrench className={iconClassName} />,
      path: '/equipamentos',
      description: 'Cadastro de linhas e setores'
    },
    {
      title: 'Velocidade Nominal',
      icon: <Gauge className={iconClassName} />,
      path: '/oee-linha-velocidade',
      description: 'Cadastro de velocidades nominais por linha e produto'
    },
    {
      title: 'Turnos',
      icon: <Clock className={iconClassName} />,
      path: '/turno',
      description: 'Configuração de turnos de trabalho'
    },
    {
      title: 'Usuários',
      icon: <Users className={iconClassName} />,
      path: '/usuarios',
      description: 'Gerenciamento de usuários e permissões'
    },
    {
      title: 'Armazéns',
      icon: <Package className={iconClassName} />,
      path: '/armazens',
      description: 'Gestão de armazéns e estoque'
    },
    {
      title: 'Ordem de Serviço',
      icon: <Wrench className={iconClassName} />,
      path: '/ordem-servico',
      description: 'Manutenção e ordens de serviço'
    },
    {
      title: 'Auditoria',
      icon: <Shield className={iconClassName} />,
      path: '/auditoria',
      description: 'Audit trail e rastreabilidade'
    },
    {
      title: 'Configurações',
      icon: <Settings className={iconClassName} />,
      path: '/configuracoes',
      description: 'Configurações do sistema'
    },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Seção de Branding (25% - Lado Esquerdo) - Fixed */}
      <BrandingSection />

      {/* Seção de Conteúdo (75% - Lado Direito) - Com margem para compensar branding fixa */}
      <div className="flex-1 md:ml-[25%] md:w-3/4 lg:w-3/4 flex flex-col bg-gradient-to-b from-background via-background to-muted/60 md:bg-muted md:pb-20 tab-prod:pb-12">
        {/* Header Mobile (visível apenas em mobile) */}
        <div className="md:hidden sticky top-0 z-20 border-b border-border/80 bg-background/95 backdrop-blur-sm">
          <div className="px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.5rem)]">
            <div className="flex items-center justify-between gap-3 py-1">
              <div className="min-w-0 border-l-2 border-primary/35 pl-2.5">
                <h1 className="text-base font-semibold tracking-tight text-[hsl(211.8947_94.0594%_28%)]">SICFAR OEE</h1>
                <p className="mt-0.5 text-xs text-muted-foreground/90">Eficiência Operacional de Equipamentos</p>
              </div>
              <span className="inline-flex items-center rounded-full border border-primary/25 bg-transparent px-2.5 py-1 text-[11px] font-semibold text-primary">
                37 linhas
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 px-4 py-5 pb-8 md:px-6 md:py-10 tab:px-8 tab:py-12 tab-prod:px-4 tab-prod:py-3 md:snap-y md:snap-mandatory md:scroll-smooth">
          {/* Container centralizado com largura máxima */}
          <div className="max-w-7xl mx-auto">
            {/* Seção de Saudação e Avatar */}
            <section className="mb-8 tab-prod:mb-3 md:snap-start">
              <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-card px-4 py-5 shadow-[0_16px_40px_-28px_hsl(var(--foreground)/0.65)] md:rounded-none md:border-none md:bg-transparent md:px-0 md:py-0 md:shadow-none">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.14),transparent_62%)] md:hidden"></div>
                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/80 md:hidden">
                      Painel inicial
                    </p>
                    <h2 className="mt-1 text-xl md:text-3xl tab:text-4xl tab-prod:text-xl font-bold text-[hsl(211.8947_94.0594%_28%)]">
                      {saudacao}, bem-vindo!
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm tab:text-base tab-prod:text-xs tab-prod:mt-0.5">
                      Olá, {user.name}. Selecione um módulo para começar.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 md:hidden">
                      <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary/90">
                        {user.role}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                        {navigationItems.length} módulos
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Menu com Avatar */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-11 rounded-full border border-primary/15 bg-background/85 pl-1.5 pr-2.5 shadow-sm backdrop-blur-sm flex items-center gap-2 cursor-pointer transition-colors duration-200 hover:border-primary/30 hover:bg-background md:h-auto md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none md:hover:bg-transparent"
                        aria-label="Menu do usuário"
                        aria-haspopup="menu"
                      >
                        <Avatar className="h-10 w-10 tab-prod:h-8 tab-prod:w-8">
                          {user.photoUrl && <AvatarImage src={user.photoUrl} alt={user.name} />}
                          <AvatarFallback className="bg-primary text-white tab-prod:text-xs">
                            {isLoading ? '…' : user.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm text-left hidden md:block">
                          <p className="font-medium leading-none mb-1">{user.name}</p>
                          <p className="text-xs text-muted-foreground leading-none">{user.role}</p>
                        </div>
                        <ChevronDown className="h-4 w-4 tab-prod:h-3 tab-prod:w-3 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configurações</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleOpenLogoutDialog} className="text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </section>

            {/* Grid de Cards de Navegação */}
            <section className="mb-10 tab-prod:mb-4">
              <div className="mb-3 md:hidden">
                <h3 className="text-sm font-semibold tracking-tight text-foreground">Acessos rápidos</h3>
                <p className="text-xs text-muted-foreground">Escolha o módulo que deseja acessar.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 tab:grid-cols-3 tab-prod:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6 tab-prod:gap-2 auto-rows-fr">
                {navigationItems.map((item) => (
                  <NavigationCard
                    key={item.path}
                    title={item.title}
                    icon={item.icon}
                    path={item.path}
                    onClick={item.onClick}
                    className="aspect-[5/4] rounded-2xl border-primary/10 bg-card/95 p-3.5 shadow-[0_12px_28px_-24px_hsl(var(--foreground)/0.6)] hover:border-primary/30 hover:shadow-[0_18px_36px_-24px_hsl(var(--primary)/0.45)] md:aspect-[4/3] md:rounded-xl md:bg-card md:p-4 md:shadow-sm"
                  />
                ))}
              </div>
            </section>
          </div>
        </main>

        {/* Footer Fixo */}
        <footer className="mt-auto w-full px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:px-6 tab-prod:px-3 tab-prod:py-2 border-t border-border bg-card/95 backdrop-blur-sm md:bg-card md:backdrop-blur-none md:fixed md:bottom-0 md:right-0 md:left-[25%] md:w-[75%] z-10">
          <div className="flex flex-col md:flex-row items-center justify-between text-xs md:text-sm tab-prod:text-[10px] text-muted-foreground">
            <p className="text-center md:text-left">© {new Date().getFullYear()} - <span className="text-primary">SICFAR</span> Módulo de <span className="text-primary">OEE</span>. Todos os direitos reservados a <span className="text-primary">FARMACE</span>.</p>
            <p className="mt-2 md:mt-0 tab-prod:mt-0">
              Versão 1.1.8| <span className="text-primary">MVP</span>
            </p>
          </div>
        </footer>
      </div>

      {/* Modal de Seleção de Tipo de Operação */}
      <ModalSelecaoOperacao
        aberto={modalOperacaoAberto}
        onFechar={handleFecharModalOperacao}
        onSelecionarOrdemProducao={handleSelecionarOrdemProducao}
        onSelecionarEquipamento={handleSelecionarEquipamento}
      />

      {/* Modal de Seleção do Apontamento OEE */}
      <ModalSelecaoApontamentoOee
        aberto={modalApontamentoOeeAberto}
        onFechar={handleFecharModalApontamentoOee}
      />

      {/* Dialog de Confirmação de Logout */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar saída</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja sair do sistema? Você precisará fazer login novamente para acessar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelLogout}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLogout} className="bg-destructive hover:bg-destructive/90">
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
