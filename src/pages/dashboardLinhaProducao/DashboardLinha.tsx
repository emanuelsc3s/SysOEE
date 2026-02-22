import { useTheme } from '@/hooks/useTheme';
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

export default function DashboardLinha() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="dashboard-linha-fullscreen">
      <div className="dashboard-linha-wrapper" data-theme={theme}>
        <div className="dashboard-container">
        {/* HEADER */}
        <DashboardHeader theme={theme} toggleTheme={toggleTheme} />

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
