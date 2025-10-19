import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Operacao from './pages/Operacao'
import Placeholder from './pages/Placeholder'

/**
 * Componente principal da aplicação
 * Configura roteamento e estrutura base
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Página Home */}
        <Route path="/" element={<Home />} />

        {/* Dashboard com gráficos OEE */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Página de Operação - Kanban de OPs */}
        <Route path="/operacao" element={<Operacao />} />

        {/* Páginas placeholder para módulos em desenvolvimento */}
        <Route
          path="/ordem-producao"
          element={
            <Placeholder
              title="Ordem de Produção"
              description="Gestão de ordens de produção ativas e histórico de produção."
            />
          }
        />
        <Route 
          path="/apontamento" 
          element={
            <Placeholder 
              title="Apontamento" 
              description="Registro contemporâneo de paradas, perdas de qualidade e trocas de turno."
            />
          } 
        />
        <Route 
          path="/paradas" 
          element={
            <Placeholder 
              title="Paradas" 
              description="Análise de paradas e gerenciamento de Books de Paradas por linha."
            />
          } 
        />
        <Route 
          path="/equipamentos" 
          element={
            <Placeholder 
              title="Equipamentos" 
              description="Cadastro e configuração de linhas de produção e setores."
            />
          } 
        />
        <Route 
          path="/turnos" 
          element={
            <Placeholder 
              title="Turnos" 
              description="Configuração de turnos de trabalho e horários."
            />
          } 
        />
        <Route 
          path="/usuarios" 
          element={
            <Placeholder 
              title="Usuários" 
              description="Gerenciamento de usuários, permissões e roles (Operador, Supervisor, Gestor, Admin)."
            />
          } 
        />
        <Route 
          path="/armazens" 
          element={
            <Placeholder 
              title="Armazéns" 
              description="Gestão de armazéns e controle de estoque."
            />
          } 
        />
        <Route 
          path="/ordem-servico" 
          element={
            <Placeholder 
              title="Ordem de Serviço" 
              description="Manutenção preventiva e corretiva, ordens de serviço."
            />
          } 
        />
        <Route 
          path="/auditoria" 
          element={
            <Placeholder 
              title="Auditoria" 
              description="Audit trail completo, rastreabilidade de alterações e conformidade ALCOA+."
            />
          } 
        />
        <Route 
          path="/configuracoes" 
          element={
            <Placeholder 
              title="Configurações" 
              description="Configurações gerais do sistema, velocidades nominais e metas de OEE."
            />
          } 
        />

        {/* Rota 404 - Página não encontrada */}
        <Route 
          path="*" 
          element={
            <Placeholder 
              title="Página Não Encontrada" 
              description="A página que você está procurando não existe."
            />
          } 
        />
      </Routes>
    </Router>
  )
}

export default App

