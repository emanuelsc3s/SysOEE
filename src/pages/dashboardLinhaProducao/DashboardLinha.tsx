import { useTheme } from '@/hooks/useTheme';
import { useLocation, useNavigate } from 'react-router-dom';
import './DashboardLinha.css';

import { DashboardHeader } from './components/DashboardHeader';
import { OeeRealCard } from './components/OeeRealCard';
import { OeeHistoryCard } from './components/OeeHistoryCard';
import { ParetoCard } from './components/ParetoCard';
import { ManutencaoCard } from './components/ManutencaoCard';
import { FifoCard } from './components/FifoCard';
import { VelocidadeCard } from './components/VelocidadeCard';
import { StatusCard } from './components/StatusCard';
import { TimelineFooter } from './components/TimelineFooter';

type DashboardLinhaRouteState = {
  linhaId?: string;
  linhaNome?: string;
};

export default function DashboardLinha() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const routeState = (location.state as DashboardLinhaRouteState | null) ?? null;
  const tituloLinha =
    typeof routeState?.linhaNome === 'string' && routeState.linhaNome.trim().length > 0
      ? routeState.linhaNome
      : 'EQUIPAMENTO';

  return (
    <div className="dashboard-linha-fullscreen">
      <div className="dashboard-linha-wrapper" data-theme={theme}>
        <div className="dashboard-container">
        {/* HEADER */}
        <DashboardHeader theme={theme} toggleTheme={toggleTheme} titulo={tituloLinha} onBack={() => navigate(-1)} />

        {/* MAIN GRID */}
        <main className="main-grid">
          {/* COLUMN 1 */}
          <div className="col col-1">
            <OeeRealCard />
            <OeeHistoryCard />
          </div>

          {/* COLUMN 2 */}
          <div className="col col-2">
            <ParetoCard />
            <ManutencaoCard />
          </div>

          {/* COLUMN 3 */}
          <div className="col col-3">
            <FifoCard />
            <VelocidadeCard />
          </div>

          {/* COLUMN 4 */}
          <div className="col col-4">
            <StatusCard />
          </div>
        </main>

        {/* TIMELINE */}
        <TimelineFooter />
      </div>
    </div>
    </div>
  );
}
