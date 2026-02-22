import { Sun, Moon, ArrowLeft } from 'lucide-react';

interface DashboardHeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  titulo?: string;
  onBack?: () => void;
}

export function DashboardHeader({
  theme,
  toggleTheme,
  titulo = 'EQUIPAMENTO',
  onBack,
}: DashboardHeaderProps) {
  return (
    <header className="header">
      <div className="logo-container">
        <img src="/logo-farmace.png" alt="Farmace Logo" className="logo-icon" />
      </div>
      <h1 className="main-title">{titulo}</h1>
      <div className="header-actions">
        <svg className="wifi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
          <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
          <circle cx="12" cy="20" r="1" fill="currentColor"></circle>
        </svg>
        <div className="auto-badge">AUTO</div>
        {onBack && (
          <button className="header-back-btn" onClick={onBack} aria-label="Voltar">
            <ArrowLeft />
          </button>
        )}
        <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Alternar tema">
          {theme === 'light' ? <Moon /> : <Sun />}
        </button>
      </div>
    </header>
  );
}
