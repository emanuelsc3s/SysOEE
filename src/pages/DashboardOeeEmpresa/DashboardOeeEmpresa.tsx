import { useMemo, useState } from 'react';
import '@/pages/dashboardLinhaProducao/DashboardLinha.css';

type UnidadeCorporativa = {
  id: string;
  codigo: string;
  local: string;
  unidade: string;
  disponibilidade: number;
  performance: number;
  qualidade: number;
  oee: number;
  status: string;
};

type ItemPareto = {
  nome: string;
  horas: number;
  percentual: number;
};

const CIRCUNFERENCIA_OEE = 339.292;

const UNIDADES: UnidadeCorporativa[] = [
  {
    id: '1',
    codigo: '0105',
    local: 'HEMODIALISE',
    unidade: 'CPHD',
    disponibilidade: 78,
    performance: 85,
    qualidade: 95,
    oee: 72.5,
    status: 'Operação Normal',
  },
  {
    id: '2',
    codigo: '04',
    local: 'SOLUÇÕES PARENTERAIS',
    unidade: 'SPEP 3',
    disponibilidade: 76,
    performance: 82,
    qualidade: 93,
    oee: 68.2,
    status: 'Operação Normal',
  },
  {
    id: '3',
    codigo: '0102',
    local: 'INJETÁVEIS - VIDROS',
    unidade: 'SPPV',
    disponibilidade: 69,
    performance: 77,
    qualidade: 91,
    oee: 59.8,
    status: 'Atenção Setup',
  }
];

const HISTORICO_OEE: Array<{ mes: string; valor: number }> = [
  { mes: 'Jan', valor: 57 },
  { mes: 'Fev', valor: 58 },
  { mes: 'Mar', valor: 56 },
  { mes: 'Abr', valor: 55 },
  { mes: 'Mai', valor: 58 },
  { mes: 'Jun', valor: 59 },
  { mes: 'Jul', valor: 60 },
  { mes: 'Ago', valor: 62 },
  { mes: 'Set', valor: 61 },
  { mes: 'Out', valor: 62 },
  { mes: 'Nov', valor: 63 },
  { mes: 'Dez', valor: 64 },
];

const MICROPARADAS: ItemPareto[] = [
  { nome: 'FALTA DE CARTUCHO', horas: 45.2, percentual: 35 },
  { nome: 'ERRO LEITURA DATAMATRIX', horas: 32.3, percentual: 25 },
  { nome: 'ENROSCO BULA', horas: 25.8, percentual: 20 },
  { nome: 'QUEDA DE BLISTER', horas: 19.4, percentual: 15 },
  { nome: 'FALHA SELAGEM', horas: 6.4, percentual: 5 },
];

const GRANDES_PARADAS: ItemPareto[] = [
  { nome: 'SETUP E PROCESSOS', horas: 795, percentual: 35 },
  { nome: 'QUEBRA FALHA', horas: 568, percentual: 25 },
  { nome: 'UTILIDADES', horas: 454, percentual: 20 },
  { nome: 'INÍCIO E FIM PRODUÇÃO', horas: 227, percentual: 10 },
  { nome: 'GESTÃO DE PESSOAS', horas: 227, percentual: 10 },
];

const APONTAMENTOS: ItemPareto[] = [
  { nome: 'TROCA FORMATO/PRODUTO', horas: 568, percentual: 25 },
  { nome: 'FALTA ENERGIA', horas: 340, percentual: 15 },
  { nome: 'LIMPEZA PLANEJADA', horas: 340, percentual: 15 },
  { nome: 'ESTAÇÃO MOLDAGEM', horas: 340, percentual: 15 },
  { nome: 'ÁGUA GELADA', horas: 227, percentual: 10 },
  { nome: 'FALTA VAPOR', horas: 227, percentual: 10 },
  { nome: 'ESTEIRA ENTRADA', horas: 227, percentual: 10 },
];

const formatarPercentual = (valor: number): string =>
  valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

const formatarCompacto = (valor: number): string => {
  if (valor >= 1_000_000) {
    return `${(valor / 1_000_000).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}M`;
  }

  if (valor >= 1_000) {
    return `${Math.round(valor / 1_000).toLocaleString('pt-BR')}K`;
  }

  return Math.round(valor).toLocaleString('pt-BR');
};

const obterClasseCorOee = (oee: number): string => {
  if (oee >= 70) {
    return 'green-text';
  }
  if (oee >= 58) {
    return 'orange-text';
  }
  return 'red-text';
};

export default function DashboardOeeEmpresa() {
  const [isDark, setIsDark] = useState(true);
  const [seedHistorico, setSeedHistorico] = useState(0);

  const indicadores = useMemo(() => {
    const total = UNIDADES.length || 1;
    const disponibilidade =
      UNIDADES.reduce((soma, unidade) => soma + unidade.disponibilidade, 0) / total;
    const performance =
      UNIDADES.reduce((soma, unidade) => soma + unidade.performance, 0) / total;
    const qualidade =
      UNIDADES.reduce((soma, unidade) => soma + unidade.qualidade, 0) / total;
    const oee = UNIDADES.reduce((soma, unidade) => soma + unidade.oee, 0) / total;

    return {
      disponibilidade,
      performance,
      qualidade,
      oee,
    };
  }, []);

  const historico = useMemo(
    () =>
      HISTORICO_OEE.map((item, indice) => ({
        ...item,
        altura: Math.max(
          30,
          Math.min(
            90,
            item.valor + (((seedHistorico + indice) % 5) - 2) * 1.4,
          ),
        ),
      })),
    [seedHistorico],
  );

  const unidadesOrdenadas = useMemo(
    () => [...UNIDADES].sort((a, b) => b.oee - a.oee),
    [],
  );

  const totalEnvasado = 1_450_000;
  const perdasEnvase = 12_000;
  const totalEmbalado = 1_400_000;
  const perdasEmbalagem = 28_000;
  const theme = isDark ? 'dark' : 'light';

  return (
    <div className="dashboard-linha-fullscreen" data-theme={theme}>
      <div className="dashboard-linha-wrapper" data-theme={theme}>
        <div className="dashboard-container">
          <header className="header">
            <div className="logo-container">
              <img src="/logo-farmace.png" alt="Farmace Logo" className="logo-icon" />
            </div>
            <h1 className="main-title">FARMACE</h1>
            <div className="header-actions" style={{ gap: '0.6cqi' }}>
              <button
                type="button"
                title="Alternar tema"
                className="theme-toggle-btn"
                onClick={() => setIsDark((valorAtual) => !valorAtual)}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ width: '1.2cqi', height: '1.2cqi' }}
              >
                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <circle cx="12" cy="20" r="1" fill="currentColor" />
              </svg>
              <div className="auto-badge" style={{ cursor: 'pointer' }} onClick={() => setSeedHistorico((valorAtual) => valorAtual + 1)}>
                GLOBAL
              </div>
            </div>
          </header>

          <main className="main-grid">
            <div className="col col-1">
              <div className="card card-oee-real">
                <h2>OEE</h2>
                <div className="oee-real-content">
                  <div className="bars-col">
                    <div className="bar-item">
                      <div className="bar-header">
                        <span className="bar-value blue-text">
                          {formatarPercentual(indicadores.disponibilidade)}%
                        </span>
                      </div>
                      <div className="progress-bg">
                        <div
                          className="progress-fill blue-fill"
                          style={{ width: `${indicadores.disponibilidade}%` }}
                        />
                      </div>
                      <span className="bar-name">Disponibilidade</span>
                    </div>

                    <div className="bar-item">
                      <div className="bar-header">
                        <span className="bar-value orange-text">
                          {formatarPercentual(indicadores.performance)}%
                        </span>
                      </div>
                      <div className="progress-bg">
                        <div
                          className="progress-fill orange-fill"
                          style={{ width: `${indicadores.performance}%` }}
                        />
                      </div>
                      <span className="bar-name">Performance</span>
                    </div>

                    <div className="bar-item">
                      <div className="bar-header">
                        <span className="bar-value green-text">
                          {formatarPercentual(indicadores.qualidade)}%
                        </span>
                      </div>
                      <div className="progress-bg">
                        <div
                          className="progress-fill green-fill"
                          style={{ width: `${indicadores.qualidade}%` }}
                        />
                      </div>
                      <span className="bar-name">Qualidade</span>
                    </div>
                  </div>

                  <div className="circle-col">
                    <div className="circular-chart">
                      <svg className="circular-svg" viewBox="0 0 120 120">
                        <circle className="circular-track" cx="60" cy="60" fill="none" r="54" strokeWidth="12" />
                        <circle
                          cx="60"
                          cy="60"
                          fill="none"
                          r="54"
                          strokeDasharray={CIRCUNFERENCIA_OEE}
                          strokeDashoffset={
                            CIRCUNFERENCIA_OEE - (CIRCUNFERENCIA_OEE * indicadores.oee) / 100
                          }
                          strokeLinecap="round"
                          strokeWidth="12"
                          stroke="var(--c-blue)"
                        />
                      </svg>
                      <div className="circular-chart-overlay">
                        <div className="circular-chart-center">
                          <span className="circular-chart-value">
                            {formatarPercentual(indicadores.oee)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card card-oee-history">
                <h2>
                  OEE Histórico <span className="subtitle">Últimos 12 meses</span>
                </h2>
                <div className="chart-placeholder">
                  <div className="bar-chart-container">
                    {historico.map((item) => (
                      <div key={item.mes} className="bar-wrapper" style={{ width: '6%' }}>
                        <div className="bar-val">{Math.round(item.altura)}</div>
                        <div className="bar-fill purple-fill" style={{ height: `${item.altura}%` }} />
                        <div className="bar-date">{item.mes}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col col-2">
              <div className="card card-fifo">
                <h2>DEPARTAMENTOS</h2>
                <div className="fifo-list">
                  {unidadesOrdenadas.slice(0, 3).map((unidade, indice) => (
                    <div key={unidade.id} className="fifo-item">
                      <span className="f-num">{indice + 1}</span>
                      <div className="f-info">
                        {unidade.codigo} | {unidade.local}
                        <br />
                        <b>{unidade.unidade}</b>
                      </div>
                      <div className={`f-val ${obterClasseCorOee(unidade.oee)}`}>
                        {formatarPercentual(unidade.oee)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card card-pareto">
                <h2>
                  Microparadas <span className="subtitle">Embalagem Secundária</span>
                </h2>
                <div className="pareto-list">
                  {MICROPARADAS.map((item) => (
                    <div key={item.nome} className="pareto-item">
                      <div className="p-label">
                        <span className="bluedot" style={{ backgroundColor: '#facc15' }} /> {item.nome}
                      </div>
                      <div className="p-val1">{item.horas.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}h</div>
                      <div className="p-val2">{formatarPercentual(item.percentual)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col" style={{ flex: 1 }}>
              <div className="card card-status" style={{ flex: 0.3, marginBottom: '0.6cqi' }}>
                <h2 style={{ textAlign: 'left', justifyContent: 'flex-start' }}>ENVASADO</h2>
                <div
                  className="status-content"
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.2cqi 0',
                    gap: '1cqi',
                  }}
                >
                  <div className="s-block" style={{ flex: 1 }}>
                    <div className="s-light-label">Envasado</div>
                    <div className="s-highlight green-text">
                      {formatarCompacto(totalEnvasado)}{' '}
                      <span style={{ fontSize: '0.8cqi', fontWeight: 'normal' }}>un</span>
                    </div>
                  </div>
                  <div className="s-block" style={{ flex: 1, textAlign: 'right' }}>
                    <div className="s-light-label">Perdas</div>
                    <div className="s-highlight red-text">
                      {formatarCompacto(perdasEnvase)}{' '}
                      <span style={{ fontSize: '0.8cqi', fontWeight: 'normal' }}>un</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card card-pareto" style={{ flex: 1 }}>
                <h2>
                  Grandes Paradas <span className="subtitle">Agrupamento</span>
                </h2>
                <div className="pareto-list">
                  {GRANDES_PARADAS.map((item) => (
                    <div key={item.nome} className="pareto-item">
                      <div className="p-label">
                        <span className="bluedot" /> {item.nome}
                      </div>
                      <div className="p-val1">{item.horas.toLocaleString('pt-BR')}h</div>
                      <div className="p-val2">{formatarPercentual(item.percentual)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col" style={{ flex: 0.8 }}>
              <div className="card card-status" style={{ flex: 0.3, marginBottom: '0.6cqi' }}>
                <h2 style={{ textAlign: 'left', justifyContent: 'flex-start' }}>EMBALADO</h2>
                <div
                  className="status-content"
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.2cqi 0',
                    gap: '1cqi',
                  }}
                >
                  <div className="s-block" style={{ flex: 1 }}>
                    <div className="s-light-label">Embalado</div>
                    <div className="s-highlight blue-text">
                      {formatarCompacto(totalEmbalado)}{' '}
                      <span style={{ fontSize: '0.8cqi', fontWeight: 'normal' }}>un</span>
                    </div>
                  </div>
                  <div className="s-block" style={{ flex: 1, textAlign: 'right' }}>
                    <div className="s-light-label">Perdas</div>
                    <div className="s-highlight red-text">
                      {formatarCompacto(perdasEmbalagem)}{' '}
                      <span style={{ fontSize: '0.8cqi', fontWeight: 'normal' }}>un</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card card-pareto" style={{ flex: 1 }}>
                <h2>
                  Apontamento <span className="subtitle">Detalhe Ocorrência</span>
                </h2>
                <div className="pareto-list">
                  {APONTAMENTOS.map((item) => (
                    <div key={item.nome} className="pareto-item">
                      <div className="p-label">
                        <span className="bluedot" style={{ backgroundColor: '#ef4444' }} /> {item.nome}
                      </div>
                      <div className="p-val1">{item.horas.toLocaleString('pt-BR')}h</div>
                      <div className="p-val2">{formatarPercentual(item.percentual)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
