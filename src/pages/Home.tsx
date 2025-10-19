import { 
  LayoutDashboard, 
  ClipboardList, 
  FileText, 
  AlertCircle,
  Settings,
  Users,
  Clock,
  Package,
  Wrench,
  Shield,
  ChevronDown
} from 'lucide-react'
import { BrandingSection } from '@/components/branding/BrandingSection'
import { NavigationCard } from '@/components/navigation/NavigationCard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * Página Home do Sistema OEE SicFar
 * Layout split-screen: 25% branding + 75% conteúdo
 * Segue especificações do home-design-system.md e PRD
 */
export default function Home() {
  // Mock de dados do usuário (será substituído por autenticação real)
  const user = {
    name: 'Usuário Demo',
    email: 'usuario@sicfar.com.br',
    initials: 'UD',
    photoUrl: null,
  }

  // Definição dos módulos de navegação
  const navigationItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard size={40} />,
      path: '/dashboard',
      description: 'Visualização de OEE e gráficos principais'
    },
    {
      title: 'Ordem de Produção',
      icon: <ClipboardList size={40} />,
      path: '/ordem-producao',
      description: 'Gestão de ordens de produção ativas'
    },
    {
      title: 'Apontamento',
      icon: <FileText size={40} />,
      path: '/apontamento',
      description: 'Registro contemporâneo de paradas e perdas'
    },
    {
      title: 'Paradas',
      icon: <AlertCircle size={40} />,
      path: '/paradas',
      description: 'Análise de paradas e Books de Paradas'
    },
    {
      title: 'Equipamentos',
      icon: <Wrench size={40} />,
      path: '/equipamentos',
      description: 'Cadastro de linhas e setores'
    },
    {
      title: 'Turnos',
      icon: <Clock size={40} />,
      path: '/turnos',
      description: 'Configuração de turnos de trabalho'
    },
    {
      title: 'Usuários',
      icon: <Users size={40} />,
      path: '/usuarios',
      description: 'Gerenciamento de usuários e permissões'
    },
    {
      title: 'Armazéns',
      icon: <Package size={40} />,
      path: '/armazens',
      description: 'Gestão de armazéns e estoque'
    },
    {
      title: 'Ordem de Serviço',
      icon: <Wrench size={40} />,
      path: '/ordem-servico',
      description: 'Manutenção e ordens de serviço'
    },
    {
      title: 'Auditoria',
      icon: <Shield size={40} />,
      path: '/auditoria',
      description: 'Audit trail e rastreabilidade'
    },
    {
      title: 'Configurações',
      icon: <Settings size={40} />,
      path: '/configuracoes',
      description: 'Configurações do sistema'
    },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Seção de Branding (25% - Lado Esquerdo) */}
      <BrandingSection />

      {/* Seção de Conteúdo (75% - Lado Direito) */}
      <div className="flex-1 md:w-3/4 lg:w-3/4 flex flex-col bg-muted">
        {/* Header Mobile (visível apenas em mobile) */}
        <div className="md:hidden bg-gradient-to-br from-primary via-primary/95 to-accent p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">SysOEE</h1>
              <p className="text-white/80 text-sm">Sistema OEE para SicFar</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 px-4 py-6 md:px-6 md:py-10">
          {/* Seção de Saudação e Avatar */}
          <section className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-primary">
                  Bem-vindo!
                </h2>
                <p className="text-muted-foreground mt-1">
                  Olá, {user.name}. Selecione um módulo para começar.
                </p>
              </div>

              {/* Dropdown Menu com Avatar */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <Avatar className="h-10 w-10">
                    {user.photoUrl && <AvatarImage src={user.photoUrl} alt={user.name} />}
                    <AvatarFallback className="bg-primary text-white">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
                  <DropdownMenuItem className="text-destructive">
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </section>

          {/* Grid de Cards de Navegação */}
          <section className="mb-10">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Módulos do Sistema
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {navigationItems.map((item) => (
                <NavigationCard
                  key={item.path}
                  title={item.title}
                  icon={item.icon}
                  path={item.path}
                />
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="px-4 py-6 md:px-6 border-t border-border bg-card">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>© 2025 Farmace/SicFar. Todos os direitos reservados.</p>
            <p className="mt-2 md:mt-0">
              Versão 1.0.0 | <span className="text-primary">MVP</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

