import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Operacao from './pages/Operacao'
import OperacaoPorEquipamento from './pages/OperacaoPorEquipamento'
import OperacaoDetalheOP from './pages/OperacaoDetalheOP'
import WhatsNewOEE from './pages/oee/whats-new/WhatsNewOEE'
import ResumoOeeTurno from './pages/oee/resumoOeeTurno/ResumoOeeTurno'
import ArmazemSaldo from './pages/ArmazemSaldo'
import ColaboradorPerfil from './pages/ColaboradorPerfil'
import LinhaProducaoConsulta from './pages/LinhaProducaoConsulta'
import ApontamentoOEE from './pages/ApontamentoOEE'
import Turnos from './pages/Turnos'
import TurnosCad from './pages/TurnosCad'
import OeeTurno from './pages/OeeTurno'
import OeeLinhaVelocidade from './pages/OeeLinhaVelocidade'
import OeeParada from './pages/OeeParada'
import OeeParadaCad from './pages/OeeParadaCad'
import DashboardOEE from './pages/dashboard/DashboardOEE'
import Usuarios from './pages/Usuarios'
import UsuariosCad from './pages/UsuariosCad'
import Placeholder from './pages/Placeholder'
import Login from './pages/Login'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Toaster } from '@/components/ui/toaster'

/**
 * Componente principal da aplicação
 * Configura roteamento e estrutura base
 */
function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Toaster />
      <Routes>
        {/* Rota pública de Login */}
        <Route path="/login" element={<Login />} />

        {/* Página Home */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />

        {/* Dashboard com gráficos OEE */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Dashboard OEE Premium - Monitoramento em tempo real */}
        <Route path="/dashboard-oee" element={<ProtectedRoute><DashboardOEE /></ProtectedRoute>} />

        {/* Página de Operação - Kanban de OPs */}
        <Route path="/operacao" element={<ProtectedRoute><Operacao /></ProtectedRoute>} />

        {/* Página de Operação - Por Equipamento */}
        <Route path="/operacao-equipamento" element={<ProtectedRoute><OperacaoPorEquipamento /></ProtectedRoute>} />

        {/* Página de Detalhes de OP */}
        <Route path="/operacao/:numeroOP" element={<ProtectedRoute><OperacaoDetalheOP /></ProtectedRoute>} />

        {/* Página de Apontamento de OEE */}
        <Route path="/apontamento-oee" element={<ProtectedRoute><ApontamentoOEE /></ProtectedRoute>} />

        {/* Página de Novidades do Sistema OEE */}
        <Route path="/whats-new-oee" element={<ProtectedRoute><WhatsNewOEE /></ProtectedRoute>} />

        {/* Página de Listagem de Apontamentos OEE por Turno */}
        <Route path="/oee-turno" element={<ProtectedRoute><OeeTurno /></ProtectedRoute>} />

        {/* Página de Resumo Consolidado de OEE por Turno */}
        <Route path="/oee-resumo-turno" element={<ProtectedRoute><ResumoOeeTurno /></ProtectedRoute>} />

        {/* Página de Cadastro de Velocidade Nominal por Linha e Produto */}
        <Route path="/oee-linha-velocidade" element={<ProtectedRoute><OeeLinhaVelocidade /></ProtectedRoute>} />

        {/* Páginas de Cadastro de Paradas OEE */}
        <Route path="/oee-parada" element={<ProtectedRoute><OeeParada /></ProtectedRoute>} />
        <Route path="/oee-parada-cad" element={<ProtectedRoute><OeeParadaCad /></ProtectedRoute>} />
        <Route path="/oee-parada-cad/:id" element={<ProtectedRoute><OeeParadaCad /></ProtectedRoute>} />

        {/* Página de Perfil do Colaborador */}
        <Route path="/colaborador/:id" element={<ProtectedRoute><ColaboradorPerfil /></ProtectedRoute>} />

        {/* Páginas placeholder para módulos em desenvolvimento */}
        <Route
          path="/ordem-producao"
          element={
            <ProtectedRoute>
              <Placeholder
                title="Ordem de Produção"
                description="Gestão de ordens de produção ativas e histórico de produção."
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/apontamento"
          element={
            <ProtectedRoute>
              <Placeholder
                title="Apontamento"
                description="Registro contemporâneo de paradas, perdas de qualidade e trocas de turno."
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/paradas"
          element={
            <ProtectedRoute>
              <Placeholder
                title="Paradas"
                description="Análise de paradas e gerenciamento de Books de Paradas por linha."
              />
            </ProtectedRoute>
          }
        />
        {/* Página de Linhas de Produção - Consulta */}
        <Route path="/equipamentos" element={<ProtectedRoute><LinhaProducaoConsulta /></ProtectedRoute>} />

        {/* Páginas de Turnos - Gerenciamento de Turnos */}
        <Route path="/turno" element={<ProtectedRoute><Turnos /></ProtectedRoute>} />
        <Route path="/turno/:id" element={<ProtectedRoute><TurnosCad /></ProtectedRoute>} />
        {/* Páginas de Usuários - Gerenciamento de Usuários */}
        <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
        <Route path="/usuario/:id" element={<ProtectedRoute><UsuariosCad /></ProtectedRoute>} />
        {/* Página de Armazéns - Gestão de Armazéns de Estoque */}
        <Route path="/armazens" element={<ProtectedRoute><ArmazemSaldo /></ProtectedRoute>} />
        <Route
          path="/ordem-servico"
          element={
            <ProtectedRoute>
              <Placeholder
                title="Ordem de Serviço"
                description="Manutenção preventiva e corretiva, ordens de serviço."
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auditoria"
          element={
            <ProtectedRoute>
              <Placeholder
                title="Auditoria"
                description="Audit trail completo, rastreabilidade de alterações e conformidade ALCOA+."
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracoes"
          element={
            <ProtectedRoute>
              <Placeholder
                title="Configurações"
                description="Configurações gerais do sistema, velocidades nominais e metas de OEE."
              />
            </ProtectedRoute>
          }
        />

        {/* Rota 404 - Página não encontrada */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <Placeholder
                title="Página Não Encontrada"
                description="A página que você está procurando não existe."
              />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App

