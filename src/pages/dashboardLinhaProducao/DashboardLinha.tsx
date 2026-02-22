import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  somarTotaisResumoOeeTurno,
  useResumoOeeTurno,
} from '@/pages/oee/resumoOeeTurno/hooks/useResumoOeeTurno';
import { criarCardsResumo } from '@/pages/oee/resumoOeeTurno/utils/aggregations';
import { converterDataBrParaIso } from '@/pages/oee/resumoOeeTurno/utils/date';
import type { ResumoOeeTurnoLinhaNormalizada } from '@/pages/oee/resumoOeeTurno/types';
import './DashboardLinha.css';

import { DashboardHeader } from './components/DashboardHeader';
import { FiltrarDashboardLinha } from './FiltrarDashboardLinha';
import { FILTROS_DASHBOARD_PADRAO } from './filtrosDashboardLinha';
import type { FiltrosDashboardLinha } from './filtrosDashboardLinha';
import { OeeRealCard } from './components/OeeRealCard';
import { OeeHistoryCard } from './components/OeeHistoryCard';
import { ParetoCard } from './components/ParetoCard';
import { ManutencaoCard } from './components/ManutencaoCard';
import { FifoCard } from './components/FifoCard';
import { VelocidadeCard } from './components/VelocidadeCard';
import type { MiniCardProdutivo } from './components/VelocidadeCard';
import { StatusCard } from './components/StatusCard';
import { TimelineFooter } from './components/TimelineFooter';

type DashboardLinhaRouteState = {
  linhaId?: string;
  linhaNome?: string;
  oee?: number;
  disponibilidade?: number;
  performance?: number;
  qualidade?: number;
  filtrosDashboardOrigem?: {
    linhaIds?: string[];
    produtoId?: string;
    turnoId?: string;
    dataInicio?: string;
    dataFim?: string;
  };
};

type ConfigMiniCardProdutivo = {
  id: string;
  titulo: string;
  detalhePadrao: string;
  variante: MiniCardProdutivo['variante'];
};

const CONFIG_MINI_CARDS_PRODUTIVOS: ConfigMiniCardProdutivo[] = [
  {
    id: 'qtd_envase',
    titulo: 'Produzido',
    detalhePadrao: 'unidades trabalhadas',
    variante: 'blue',
  },
  {
    id: 'perdas_envase',
    titulo: 'Perdas',
    detalhePadrao: 'unidades perdidas',
    variante: 'red',
  },
  {
    id: 'envasado',
    titulo: 'Total',
    detalhePadrao: 'unidades envasadas',
    variante: 'blue',
  },
  {
    id: 'paradas_grandes',
    titulo: 'Grandes Paradas',
    detalhePadrao: 'tempo total',
    variante: 'orange',
  },
  {
    id: 'paradas_estrategicas',
    titulo: 'Paradas Estratégicas',
    detalhePadrao: 'tempo total',
    variante: 'gray',
  },
];

const clonarFiltrosDashboardLinha = (filtros: FiltrosDashboardLinha): FiltrosDashboardLinha => ({
  dataInicio: filtros.dataInicio,
  dataFim: filtros.dataFim,
  linhaIds: [...filtros.linhaIds],
  turnoIds: [...filtros.turnoIds],
  produtoIds: [...filtros.produtoIds],
  statuses: [...filtros.statuses],
  lancamento: filtros.lancamento,
});

const mapearFiltrosDashboardPrincipalParaLinha = (
  routeState: DashboardLinhaRouteState | null,
): FiltrosDashboardLinha => {
  const filtrosOrigem = routeState?.filtrosDashboardOrigem;
  const linhaIdRota = typeof routeState?.linhaId === 'string' ? routeState.linhaId.trim() : '';

  const linhaIdsOrigem = Array.isArray(filtrosOrigem?.linhaIds)
    ? filtrosOrigem.linhaIds.filter(
        (id): id is string => typeof id === 'string' && id.trim().length > 0,
      )
    : [];

  return {
    ...FILTROS_DASHBOARD_PADRAO,
    dataInicio:
      typeof filtrosOrigem?.dataInicio === 'string'
        ? filtrosOrigem.dataInicio
        : FILTROS_DASHBOARD_PADRAO.dataInicio,
    dataFim:
      typeof filtrosOrigem?.dataFim === 'string'
        ? filtrosOrigem.dataFim
        : FILTROS_DASHBOARD_PADRAO.dataFim,
    // O dashboard de linha sempre representa a linha clicada; os demais filtros são preservados.
    linhaIds: linhaIdRota ? [linhaIdRota] : linhaIdsOrigem,
    turnoIds:
      typeof filtrosOrigem?.turnoId === 'string' &&
      filtrosOrigem.turnoId.trim().length > 0 &&
      filtrosOrigem.turnoId !== 'todos'
        ? [filtrosOrigem.turnoId]
        : FILTROS_DASHBOARD_PADRAO.turnoIds,
    produtoIds:
      typeof filtrosOrigem?.produtoId === 'string' &&
      filtrosOrigem.produtoId.trim().length > 0 &&
      filtrosOrigem.produtoId !== 'todos'
        ? [filtrosOrigem.produtoId]
        : FILTROS_DASHBOARD_PADRAO.produtoIds,
  };
};

const parseIdsNumericos = (ids: string[]): number[] => {
  const idsValidos = ids
    .map((id) => Number.parseInt(id.trim(), 10))
    .filter((id) => Number.isFinite(id));

  return Array.from(new Set(idsValidos));
};

const parseLancamentoNumerico = (lancamento: string): number | null => {
  const valor = lancamento.trim();
  if (!valor || !/^\d+$/.test(valor)) {
    return null;
  }

  const numero = Number.parseInt(valor, 10);
  return Number.isFinite(numero) ? numero : null;
};

const normalizarStatus = (status?: string | null): string =>
  (status || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const filtrarLinhasResumo = (
  linhas: ResumoOeeTurnoLinhaNormalizada[],
  linhaIdsSelecionados: number[],
  turnoIdsSelecionados: number[],
  produtoIdsSelecionados: number[],
  statusesSelecionados: string[],
  lancamentoId: number | null,
): ResumoOeeTurnoLinhaNormalizada[] => {
  if (linhas.length === 0) {
    return linhas;
  }

  const linhaIdsSet = linhaIdsSelecionados.length > 0 ? new Set(linhaIdsSelecionados) : null;
  const turnoIdsSet = turnoIdsSelecionados.length > 0 ? new Set(turnoIdsSelecionados) : null;
  const produtoIdsSet = produtoIdsSelecionados.length > 0 ? new Set(produtoIdsSelecionados) : null;
  const statusSet = statusesSelecionados.length > 0 ? new Set(statusesSelecionados) : null;

  return linhas.filter((linha) => {
    if (linhaIdsSet && !linhaIdsSet.has(linha.linhaproducao_id ?? Number.NaN)) {
      return false;
    }

    if (turnoIdsSet && !turnoIdsSet.has(linha.turno_id ?? Number.NaN)) {
      return false;
    }

    if (produtoIdsSet && !produtoIdsSet.has(linha.produto_id ?? Number.NaN)) {
      return false;
    }

    if (lancamentoId !== null && linha.oeeturno_id !== lancamentoId) {
      return false;
    }

    if (statusSet) {
      const statusTurno = normalizarStatus(linha.status_turno_registrado);
      const statusLinha = normalizarStatus(linha.status_linha);
      const atendeStatus = Array.from(statusSet).some(
        (status) =>
          statusTurno === status ||
          statusLinha === status ||
          statusTurno.includes(status) ||
          statusLinha.includes(status),
      );

      if (!atendeStatus) {
        return false;
      }
    }

    return true;
  });
};

const montarMiniCardsProdutivosPlaceholder = (): MiniCardProdutivo[] =>
  CONFIG_MINI_CARDS_PRODUTIVOS.map((config) => ({
    id: config.id,
    titulo: config.titulo,
    valor: '--',
    detalhe: config.detalhePadrao,
    variante: config.variante,
  }));

export default function DashboardLinha() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = (location.state as DashboardLinhaRouteState | null) ?? null;

  const filtrosRecebidosDoDashboard = useMemo(
    () => mapearFiltrosDashboardPrincipalParaLinha(routeState),
    [routeState],
  );

  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosDashboardLinha>(() =>
    clonarFiltrosDashboardLinha(filtrosRecebidosDoDashboard),
  );

  useEffect(() => {
    setFiltrosAplicados(clonarFiltrosDashboardLinha(filtrosRecebidosDoDashboard));
  }, [filtrosRecebidosDoDashboard]);

  const dataInicioIso = useMemo(
    () => converterDataBrParaIso(filtrosAplicados.dataInicio),
    [filtrosAplicados.dataInicio],
  );
  const dataFimIso = useMemo(
    () => converterDataBrParaIso(filtrosAplicados.dataFim),
    [filtrosAplicados.dataFim],
  );

  const linhaIdsSelecionados = useMemo(
    () => parseIdsNumericos(filtrosAplicados.linhaIds),
    [filtrosAplicados.linhaIds],
  );
  const turnoIdsSelecionados = useMemo(
    () => parseIdsNumericos(filtrosAplicados.turnoIds),
    [filtrosAplicados.turnoIds],
  );
  const produtoIdsSelecionados = useMemo(
    () => parseIdsNumericos(filtrosAplicados.produtoIds),
    [filtrosAplicados.produtoIds],
  );
  const statusSelecionadosNormalizados = useMemo(
    () => filtrosAplicados.statuses.map((status) => normalizarStatus(status)).filter(Boolean),
    [filtrosAplicados.statuses],
  );
  const lancamentoId = useMemo(
    () => parseLancamentoNumerico(filtrosAplicados.lancamento),
    [filtrosAplicados.lancamento],
  );

  const linhaIdRpc = linhaIdsSelecionados.length === 1 ? linhaIdsSelecionados[0] : null;
  const turnoIdRpc = turnoIdsSelecionados.length === 1 ? turnoIdsSelecionados[0] : null;
  const produtoIdRpc = produtoIdsSelecionados.length === 1 ? produtoIdsSelecionados[0] : null;

  const {
    linhas: linhasResumoBase,
    parametrosValidos: resumoParametrosValidos,
    periodoInvalido: resumoPeriodoInvalido,
    isLoading: resumoProdutivoLoading,
    isFetching: resumoProdutivoFetching,
    erroConsulta: erroResumoProdutivo,
  } = useResumoOeeTurno({
    dataInicioIso,
    dataFimIso,
    linhaId: linhaIdRpc,
    turnoId: turnoIdRpc,
    produtoId: produtoIdRpc,
    oeeturnoId: lancamentoId,
    incluirComparativo: false,
  });

  const linhasResumoFiltradas = useMemo(
    () =>
      filtrarLinhasResumo(
        linhasResumoBase,
        linhaIdsSelecionados,
        turnoIdsSelecionados,
        produtoIdsSelecionados,
        statusSelecionadosNormalizados,
        lancamentoId,
      ),
    [
      lancamentoId,
      linhaIdsSelecionados,
      linhasResumoBase,
      produtoIdsSelecionados,
      statusSelecionadosNormalizados,
      turnoIdsSelecionados,
    ],
  );

  const miniCardsProdutivos = useMemo<MiniCardProdutivo[]>(() => {
    if (!resumoParametrosValidos || resumoPeriodoInvalido || erroResumoProdutivo) {
      return montarMiniCardsProdutivosPlaceholder();
    }

    const totaisProdutivos = somarTotaisResumoOeeTurno(linhasResumoFiltradas);
    const cardsResumo = criarCardsResumo(totaisProdutivos);
    const cardsPorId = new Map(cardsResumo.map((card) => [card.id, card]));

    return CONFIG_MINI_CARDS_PRODUTIVOS.map((config) => {
      const card = cardsPorId.get(config.id);

      return {
        id: config.id,
        titulo: config.titulo,
        valor: card?.valor ?? '--',
        detalhe: card?.detalhe ?? config.detalhePadrao,
        variante: config.variante,
      };
    });
  }, [
    erroResumoProdutivo,
    linhasResumoFiltradas,
    resumoParametrosValidos,
    resumoPeriodoInvalido,
  ]);

  const statusMiniCards = useMemo(() => {
    if (resumoPeriodoInvalido) {
      return 'Período inválido';
    }

    if (!dataInicioIso || !dataFimIso) {
      return 'Selecione período';
    }

    if (erroResumoProdutivo) {
      return 'Erro ao carregar';
    }

    if (resumoProdutivoLoading) {
      return 'Carregando...';
    }

    if (linhasResumoFiltradas.length === 0) {
      return 'Sem dados';
    }

    if (resumoProdutivoFetching) {
      return 'Atualizando...';
    }

    return undefined;
  }, [
    dataFimIso,
    dataInicioIso,
    erroResumoProdutivo,
    linhasResumoFiltradas.length,
    resumoPeriodoInvalido,
    resumoProdutivoFetching,
    resumoProdutivoLoading,
  ]);

  const tituloLinha =
    typeof routeState?.linhaNome === 'string' && routeState.linhaNome.trim().length > 0
      ? routeState.linhaNome
      : 'EQUIPAMENTO';

  const dadosOeeLinha = {
    oee: routeState?.oee,
    disponibilidade: routeState?.disponibilidade,
    performance: routeState?.performance,
    qualidade: routeState?.qualidade,
  };

  return (
    <div className="dashboard-linha-fullscreen" data-theme={theme}>
      <div className="dashboard-linha-wrapper" data-theme={theme}>
        <div className="dashboard-container">
          {/* HEADER */}
          <DashboardHeader
            theme={theme}
            toggleTheme={toggleTheme}
            titulo={tituloLinha}
            onBack={() => navigate(-1)}
            onFilter={() => setFiltrosAbertos(true)}
          />

          {/* MAIN GRID */}
          <main className="main-grid">
            {/* COLUMN 1 */}
            <div className="col col-1">
              <OeeRealCard {...dadosOeeLinha} />
              <OeeHistoryCard />
            </div>

            {/* COLUMN 2 */}
            <div className="col col-2">
              <ParetoCard />
              <ManutencaoCard />
            </div>

            {/* COLUMN 3 */}
            <div className="col col-3">
              <VelocidadeCard miniCards={miniCardsProdutivos} statusTexto={statusMiniCards} />
              <FifoCard />
            </div>

            {/* COLUMN 4 */}
            <div className="col col-4">
              <StatusCard />
            </div>
          </main>

          {/* TIMELINE */}
          <TimelineFooter />
        </div>

        {/* MODAL DE FILTROS */}
        <FiltrarDashboardLinha
          aberto={filtrosAbertos}
          onFechar={() => setFiltrosAbertos(false)}
          filtrosAplicados={filtrosAplicados}
          onAplicar={(novosFiltros) => {
            setFiltrosAplicados(novosFiltros);
            setFiltrosAbertos(false);
          }}
        />
      </div>
    </div>
  );
}
