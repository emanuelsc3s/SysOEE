import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/hooks/useTheme';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
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
import type { OeeHistoryCardItem } from './components/OeeHistoryCard';
import { ParetoCard } from './components/ParetoCard';
import type { ParetoCardItem } from './components/ParetoCard';
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

type ParetoLinhaRpcRow = {
  parada?: string | null;
  quantidade?: number | string | null;
  tempo_parada_horas?: number | string | null;
  percentual?: number | string | null;
  percentual_acumulado?: number | string | null;
};

type OeeDiarioRpcRow = {
  data?: string | Date | null;
  linhaproducao_id?: number | string | null;
  linhaproducao?: string | null;
  qtde_turnos?: number | string | null;
  unidades_produzidas?: number | string | null;
  unidades_perdas?: number | string | null;
  unidades_boas?: number | string | null;
  tempo_operacional_liquido?: number | string | null;
  tempo_valioso?: number | string | null;
  tempo_disponivel_horas?: number | string | null;
  tempo_estrategico_horas?: number | string | null;
  tempo_paradas_grandes_horas?: number | string | null;
  tempo_operacao_horas?: number | string | null;
  disponibilidade?: number | string | null;
  performance?: number | string | null;
  qualidade?: number | string | null;
  oee?: number | string | null;
};

type OeeDiarioNormalizado = {
  dataIso: string;
  linhaproducaoId: number | null;
  qtdeTurnos: number;
  unidadesProduzidas: number;
  unidadesPerdas: number;
  unidadesBoas: number;
  tempoOperacionalLiquido: number;
  tempoDisponivelHoras: number;
  tempoEstrategicoHoras: number;
  tempoParadasGrandesHoras: number;
};

const LIMITE_PARETO_CARD = 7;
const LIMITE_OEE_HISTORICO_CARD = 20;
const TEMPO_DISPONIVEL_PADRAO = 12;

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

const parseNumero = (valor: unknown): number => {
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : 0;
  }

  if (valor === null || valor === undefined) {
    return 0;
  }

  if (typeof valor === 'string') {
    const limpo = valor.trim().replace('%', '').replace(/\s+/g, '');
    if (!limpo) {
      return 0;
    }

    if (limpo.includes(',') && limpo.includes('.')) {
      const normalizado = limpo.replace(/\./g, '').replace(',', '.');
      const parsed = Number.parseFloat(normalizado);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    if (limpo.includes(',')) {
      const parsed = Number.parseFloat(limpo.replace(',', '.'));
      return Number.isFinite(parsed) ? parsed : 0;
    }

    const parsed = Number.parseFloat(limpo);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const parsed = Number(valor);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatarTempoParadaHorasMinutos = (horasDecimais: number): string => {
  const totalMinutos = Math.max(0, Math.round(horasDecimais * 60));
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;

  return `${horas.toLocaleString('pt-BR')}:${String(minutos).padStart(2, '0')}`;
};

const extrairDataIso = (valor: unknown): string | null => {
  if (typeof valor === 'string') {
    const match = valor.trim().match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
  }

  if (valor instanceof Date && Number.isFinite(valor.getTime())) {
    const ano = valor.getFullYear();
    const mes = String(valor.getMonth() + 1).padStart(2, '0');
    const dia = String(valor.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  return null;
};

const formatarRotuloDataHistorico = (dataIso: string): string => {
  const partes = dataIso.split('-');
  if (partes.length !== 3) {
    return dataIso;
  }

  return partes[2];
};

const formatarTooltipDataHistorico = (dataIso: string): string => {
  const partes = dataIso.split('-');
  if (partes.length !== 3) {
    return dataIso;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const deslocarDataIso = (dataIso: string, deslocamentoDias: number): string | null => {
  const partes = dataIso.split('-');
  if (partes.length !== 3) {
    return null;
  }

  const ano = Number.parseInt(partes[0], 10);
  const mes = Number.parseInt(partes[1], 10);
  const dia = Number.parseInt(partes[2], 10);

  if (!Number.isFinite(ano) || !Number.isFinite(mes) || !Number.isFinite(dia)) {
    return null;
  }

  const dataUtc = new Date(Date.UTC(ano, mes - 1, dia));
  if (!Number.isFinite(dataUtc.getTime())) {
    return null;
  }

  dataUtc.setUTCDate(dataUtc.getUTCDate() + deslocamentoDias);

  const novoAno = dataUtc.getUTCFullYear();
  const novoMes = String(dataUtc.getUTCMonth() + 1).padStart(2, '0');
  const novoDia = String(dataUtc.getUTCDate()).padStart(2, '0');

  return `${novoAno}-${novoMes}-${novoDia}`;
};

const calcularOeePorComponentes = (item: {
  unidadesProduzidas: number;
  unidadesBoas: number;
  tempoOperacionalLiquido: number;
  tempoDisponivelHoras: number;
  tempoEstrategicoHoras: number;
  tempoParadasGrandesHoras: number;
}): number => {
  const tempoDisponivelAjustado = Math.max(item.tempoDisponivelHoras - item.tempoEstrategicoHoras, 0);
  const tempoOperacao = Math.max(tempoDisponivelAjustado - item.tempoParadasGrandesHoras, 0);

  const disponibilidade =
    tempoDisponivelAjustado > 0 ? tempoOperacao / tempoDisponivelAjustado : 0;

  const performance =
    tempoOperacao > 0 ? Math.min(item.tempoOperacionalLiquido / tempoOperacao, 1) : 0;

  const qualidade =
    item.unidadesProduzidas > 0 ? item.unidadesBoas / item.unidadesProduzidas : 1;

  const oee = disponibilidade * performance * qualidade * 100;
  return Number.isFinite(oee) ? Math.min(Math.max(oee, 0), 100) : 0;
};

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
  const dataFimHistoricoIso = dataFimIso;
  const dataInicioHistoricoIso = useMemo(
    () => (dataFimIso ? deslocarDataIso(dataFimIso, -LIMITE_OEE_HISTORICO_CARD) : null),
    [dataFimIso],
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
  const periodoFiltrosInvalido = Boolean(dataInicioIso && dataFimIso && dataInicioIso > dataFimIso);

  const {
    data: paretoItens = [],
    isLoading: paretoLoading,
    isFetching: paretoFetching,
    error: paretoError,
  } = useQuery({
    queryKey: [
      'dashboard-linha-pareto',
      {
        dataInicioIso: dataInicioIso ?? null,
        dataFimIso: dataFimIso ?? null,
        linhaIdRpc,
        turnoIdRpc,
        produtoIdRpc,
        lancamentoId,
        limite: LIMITE_PARETO_CARD,
      },
    ],
    queryFn: async (): Promise<ParetoCardItem[]> => {
      if (!dataInicioIso || !dataFimIso) {
        return [];
      }

      const { data, error } = await supabase.rpc('fn_calcular_pareto_paradas_linha', {
        p_data_inicio: dataInicioIso,
        p_data_fim: dataFimIso,
        p_turno_id: turnoIdRpc,
        p_produto_id: produtoIdRpc,
        p_linhaproducao_id: linhaIdRpc,
        p_tempo_disponivel_padrao: TEMPO_DISPONIVEL_PADRAO,
        p_oeeturno_id: lancamentoId,
        p_limite: LIMITE_PARETO_CARD,
      });

      if (error) {
        throw error;
      }

      return ((data || []) as ParetoLinhaRpcRow[]).map((item) => {
        const parada = (item.parada || '').trim();
        const percentual = Math.min(Math.max(parseNumero(item.percentual), 0), 100);
        const percentualAcumulado = Math.min(
          Math.max(parseNumero(item.percentual_acumulado), 0),
          100,
        );
        const tempoParadaHoras =
          typeof item.tempo_parada_horas === 'string' && item.tempo_parada_horas.trim().length > 0
            ? item.tempo_parada_horas.trim()
            : formatarTempoParadaHorasMinutos(Math.max(0, parseNumero(item.tempo_parada_horas)));

        return {
          parada: parada || 'Parada não informada',
          quantidade: Math.max(0, Math.round(parseNumero(item.quantidade))),
          tempoParadaHoras,
          percentual,
          percentualAcumulado,
        } satisfies ParetoCardItem;
      });
    },
    enabled: Boolean(dataInicioIso && dataFimIso && !periodoFiltrosInvalido),
    staleTime: 60_000,
  });

  const {
    data: oeeHistoricoLinhas = [],
    isLoading: oeeHistoricoLoading,
    isFetching: oeeHistoricoFetching,
    error: oeeHistoricoError,
  } = useQuery({
    queryKey: [
      'dashboard-linha-oee-historico',
      {
        dataInicioIso: dataInicioHistoricoIso ?? null,
        dataFimIso: dataFimHistoricoIso ?? null,
        linhaIdRpc,
        turnoIdRpc,
        produtoIdRpc,
        lancamentoId,
        limiteDias: LIMITE_OEE_HISTORICO_CARD,
      },
    ],
    queryFn: async (): Promise<OeeDiarioNormalizado[]> => {
      if (!dataInicioHistoricoIso || !dataFimHistoricoIso) {
        return [];
      }

      const { data, error } = await supabase.rpc('fn_calcular_oee_diario', {
        p_data_inicio: dataInicioHistoricoIso,
        p_data_fim: dataFimHistoricoIso,
        p_turno_id: turnoIdRpc,
        p_produto_id: produtoIdRpc,
        p_linhaproducao_id: linhaIdRpc,
        p_oeeturno_id: lancamentoId,
        p_tempo_disponivel_padrao: TEMPO_DISPONIVEL_PADRAO,
        p_limite_dias: LIMITE_OEE_HISTORICO_CARD,
      });

      if (error) {
        throw error;
      }

      return ((data || []) as OeeDiarioRpcRow[])
        .map((item) => {
          const dataIso = extrairDataIso(item.data);
          if (!dataIso) {
            return null;
          }

          const linhaId =
            item.linhaproducao_id === null || item.linhaproducao_id === undefined
              ? null
              : Number.parseInt(String(item.linhaproducao_id), 10);

          return {
            dataIso,
            linhaproducaoId: Number.isFinite(linhaId ?? Number.NaN) ? linhaId : null,
            qtdeTurnos: Math.max(0, Math.round(parseNumero(item.qtde_turnos))),
            unidadesProduzidas: Math.max(0, parseNumero(item.unidades_produzidas)),
            unidadesPerdas: Math.max(0, parseNumero(item.unidades_perdas)),
            unidadesBoas: Math.max(0, parseNumero(item.unidades_boas)),
            tempoOperacionalLiquido: Math.max(0, parseNumero(item.tempo_operacional_liquido)),
            tempoDisponivelHoras: Math.max(0, parseNumero(item.tempo_disponivel_horas)),
            tempoEstrategicoHoras: Math.max(0, parseNumero(item.tempo_estrategico_horas)),
            tempoParadasGrandesHoras: Math.max(0, parseNumero(item.tempo_paradas_grandes_horas)),
          } satisfies OeeDiarioNormalizado;
        })
        .filter((item): item is OeeDiarioNormalizado => item !== null);
    },
    enabled: Boolean(dataInicioHistoricoIso && dataFimHistoricoIso),
    staleTime: 60_000,
  });

  const oeeHistoricoItens = useMemo<OeeHistoryCardItem[]>(() => {
    if (oeeHistoricoLinhas.length === 0) {
      return [];
    }

    const linhaIdsSet = linhaIdsSelecionados.length > 0 ? new Set(linhaIdsSelecionados) : null;
    const linhasFiltradas = linhaIdsSet
      ? oeeHistoricoLinhas.filter((linha) =>
          linha.linhaproducaoId !== null ? linhaIdsSet.has(linha.linhaproducaoId) : false,
        )
      : oeeHistoricoLinhas;

    if (linhasFiltradas.length === 0) {
      return [];
    }

    const agregadoPorData = new Map<
      string,
      {
        dataIso: string;
        qtdeTurnos: number;
        unidadesProduzidas: number;
        unidadesPerdas: number;
        unidadesBoas: number;
        tempoOperacionalLiquido: number;
        tempoDisponivelHoras: number;
        tempoEstrategicoHoras: number;
        tempoParadasGrandesHoras: number;
      }
    >();

    for (const linha of linhasFiltradas) {
      const acumulado = agregadoPorData.get(linha.dataIso) ?? {
        dataIso: linha.dataIso,
        qtdeTurnos: 0,
        unidadesProduzidas: 0,
        unidadesPerdas: 0,
        unidadesBoas: 0,
        tempoOperacionalLiquido: 0,
        tempoDisponivelHoras: 0,
        tempoEstrategicoHoras: 0,
        tempoParadasGrandesHoras: 0,
      };

      acumulado.qtdeTurnos += linha.qtdeTurnos;
      acumulado.unidadesProduzidas += linha.unidadesProduzidas;
      acumulado.unidadesPerdas += linha.unidadesPerdas;
      acumulado.unidadesBoas += linha.unidadesBoas;
      acumulado.tempoOperacionalLiquido += linha.tempoOperacionalLiquido;
      acumulado.tempoDisponivelHoras += linha.tempoDisponivelHoras;
      acumulado.tempoEstrategicoHoras += linha.tempoEstrategicoHoras;
      acumulado.tempoParadasGrandesHoras += linha.tempoParadasGrandesHoras;

      agregadoPorData.set(linha.dataIso, acumulado);
    }

    const itens = Array.from(agregadoPorData.values())
      .sort((a, b) => a.dataIso.localeCompare(b.dataIso))
      .slice(-LIMITE_OEE_HISTORICO_CARD)
      .map((item) => {
        const oee = calcularOeePorComponentes({
          unidadesProduzidas: item.unidadesProduzidas,
          unidadesBoas: item.unidadesBoas,
          tempoOperacionalLiquido: item.tempoOperacionalLiquido,
          tempoDisponivelHoras: item.tempoDisponivelHoras,
          tempoEstrategicoHoras: item.tempoEstrategicoHoras,
          tempoParadasGrandesHoras: item.tempoParadasGrandesHoras,
        });

        return {
          dataLabel: formatarRotuloDataHistorico(item.dataIso),
          dataTooltip: formatarTooltipDataHistorico(item.dataIso),
          oee,
        } satisfies OeeHistoryCardItem;
      });

    return itens;
  }, [linhaIdsSelecionados, oeeHistoricoLinhas]);

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

  const statusPareto = useMemo(() => {
    if (periodoFiltrosInvalido) {
      return 'Período inválido';
    }

    if (!dataInicioIso || !dataFimIso) {
      return 'Selecione período';
    }

    if (paretoError) {
      return 'Erro ao carregar';
    }

    if (paretoLoading) {
      return 'Carregando...';
    }

    if (paretoItens.length === 0) {
      return 'Sem dados';
    }

    if (paretoFetching) {
      return 'Atualizando...';
    }

    return undefined;
  }, [
    dataFimIso,
    dataInicioIso,
    paretoError,
    paretoFetching,
    paretoItens.length,
    paretoLoading,
    periodoFiltrosInvalido,
  ]);

  const statusOeeHistorico = useMemo(() => {
    if (!dataFimHistoricoIso || !dataInicioHistoricoIso) {
      return 'Selecione período';
    }

    if (oeeHistoricoError) {
      return 'Erro ao carregar';
    }

    if (oeeHistoricoLoading) {
      return 'Carregando...';
    }

    if (oeeHistoricoItens.length === 0) {
      return 'Sem dados';
    }

    if (oeeHistoricoFetching) {
      return 'Atualizando...';
    }

    return undefined;
  }, [
    dataFimHistoricoIso,
    dataInicioHistoricoIso,
    oeeHistoricoError,
    oeeHistoricoFetching,
    oeeHistoricoItens.length,
    oeeHistoricoLoading,
  ]);

  const mensagemParetoVazio = useMemo(() => {
    if (periodoFiltrosInvalido) {
      return 'Período inválido para consulta.';
    }

    if (!dataInicioIso || !dataFimIso) {
      return 'Selecione um período válido.';
    }

    if (paretoError) {
      return 'Não foi possível carregar o Pareto.';
    }

    if (paretoLoading) {
      return 'Carregando Pareto...';
    }

    return 'Sem paradas grandes no período.';
  }, [dataFimIso, dataInicioIso, paretoError, paretoLoading, periodoFiltrosInvalido]);

  const mensagemOeeHistoricoVazio = useMemo(() => {
    if (!dataFimHistoricoIso || !dataInicioHistoricoIso) {
      return 'Selecione um período válido.';
    }

    if (oeeHistoricoError) {
      return 'Não foi possível carregar o histórico de OEE.';
    }

    if (oeeHistoricoLoading) {
      return 'Carregando histórico de OEE...';
    }

    return 'Sem histórico de OEE no período.';
  }, [dataFimHistoricoIso, dataInicioHistoricoIso, oeeHistoricoError, oeeHistoricoLoading]);

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
              <OeeHistoryCard
                itens={oeeHistoricoItens}
                statusTexto={statusOeeHistorico}
                mensagemVazia={mensagemOeeHistoricoVazio}
                limiteDias={LIMITE_OEE_HISTORICO_CARD}
              />
            </div>

            {/* COLUMN 2 */}
            <div className="col col-2">
              <ParetoCard
                itens={paretoItens}
                statusTexto={statusPareto}
                mensagemVazia={mensagemParetoVazio}
              />
              <ManutencaoCard />
            </div>

            {/* COLUMN 3 + 4: VelocidadeCard largo no topo, Fifo e Status na mesma altura embaixo */}
            <div className="col col-3-4">
              <div className="col-3-4-grid">
                <div className="col-3-4-velocidade">
                  <VelocidadeCard miniCards={miniCardsProdutivos} statusTexto={statusMiniCards} />
                </div>
                <div className="col-3-4-fifo">
                  <FifoCard />
                </div>
                <div className="col-3-4-status">
                  <StatusCard />
                </div>
              </div>
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
