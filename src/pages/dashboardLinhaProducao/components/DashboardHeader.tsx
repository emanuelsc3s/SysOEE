import { useEffect, useId, useRef, useState } from 'react';
import { Sun, Moon, ArrowLeft, Menu, Filter, RefreshCw } from 'lucide-react';

interface DashboardHeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  titulo?: string;
  onBack?: () => void;
  onFilter?: () => void;
  onRefreshDados?: () => void | Promise<void>;
  refreshDadosEmAndamento?: boolean;
}

export function DashboardHeader({
  theme,
  toggleTheme,
  titulo = 'EQUIPAMENTO',
  onBack,
  onFilter,
  onRefreshDados,
  refreshDadosEmAndamento = false,
}: DashboardHeaderProps) {
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    const handleClickFora = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuAberto(false);
      }
    };

    const handleTecla = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuAberto(false);
      }
    };

    document.addEventListener('mousedown', handleClickFora);
    document.addEventListener('keydown', handleTecla);

    return () => {
      document.removeEventListener('mousedown', handleClickFora);
      document.removeEventListener('keydown', handleTecla);
    };
  }, []);

  const handleToggleTheme = () => {
    setMenuAberto(false);
    toggleTheme();
  };

  const handleVoltar = () => {
    setMenuAberto(false);
    onBack?.();
  };

  const handleFiltrar = () => {
    setMenuAberto(false);
    onFilter?.();
  };

  return (
    <header className="header">
      <div className="logo-container">
        <img src="/logo-farmace.png" alt="Farmace Logo" className="logo-icon" />
      </div>
      <h1 className="main-title">{titulo}</h1>
      <div className="header-actions">
        <div className="header-quick-actions">
          <div className="auto-badge">AUTO</div>
          <button
            type="button"
            className={`header-menu-btn header-refresh-btn${refreshDadosEmAndamento ? ' is-loading' : ''}`}
            aria-label="Atualizar dados"
            onClick={() => void onRefreshDados?.()}
            disabled={!onRefreshDados || refreshDadosEmAndamento}
          >
            <RefreshCw />
          </button>

          <div className="header-menu" ref={menuRef}>
            <button
              type="button"
              className="header-menu-btn"
              aria-label="Abrir menu"
              aria-haspopup="menu"
              aria-expanded={menuAberto}
              aria-controls={menuId}
              onClick={() => setMenuAberto((aberto) => !aberto)}
            >
              <Menu />
            </button>

            {menuAberto && (
              <div id={menuId} className="header-menu-dropdown" role="menu" aria-label="Menu de ações">
                {onBack && (
                  <button
                    type="button"
                    className="header-menu-item"
                    role="menuitem"
                    onClick={handleVoltar}
                  >
                    <ArrowLeft />
                    <span>Voltar</span>
                  </button>
                )}
                {onBack && <div className="header-menu-separator" role="separator" />}
                <button
                  type="button"
                  className="header-menu-item"
                  role="menuitem"
                  onClick={handleFiltrar}
                >
                  <Filter />
                  <span>Filtrar</span>
                </button>
                <button
                  type="button"
                  className="header-menu-item"
                  role="menuitem"
                  onClick={handleToggleTheme}
                >
                  {theme === 'light' ? <Moon /> : <Sun />}
                  <span>{theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
