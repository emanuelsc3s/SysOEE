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
import type { FifoCardItem } from './components/FifoCard';
import { VelocidadeCard } from './components/VelocidadeCard';
import type { MiniCardProdutivo } from './components/VelocidadeCard';
import { StatusCard } from './components/StatusCard';
import { TimelineFooter } from './components/TimelineFooter';
import type {
  TimelineFooterLote,
  TimelineFooterSegmento,
} from './components/TimelineFooter';

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

type ComponentesOeeRpc = {
  oeeturno_id?: number | string | null;
  linhaproducao_id?: number | string | null;
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

type ComponentesOeeDetalhe = {
  unidadesProduzidas: number;
  unidadesPerdas: number;
  unidadesBoas: number;
  tempoOperacionalLiquido: number;
  tempoValioso: number;
  tempoDisponivelHoras: number;
  tempoEstrategicoHoras: number;
  tempoParadasGrandesHoras: number;
  tempoOperacaoHoras: number;
  disponibilidade: number;
  performance: number;
  qualidade: number;
  oee: number;
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

type OeeTimelineRpcRow = {
  janela_inicio?: string | Date | null;
  janela_fim?: string | Date | null;
  timeline_times?: unknown;
  segmentos?: unknown;
  lotes?: unknown;
};

type OeeTimelineNormalizado = {
  janelaInicioIso: string | null;
  janelaFimIso: string | null;
  timelineTimes: string[];
  segmentos: TimelineFooterSegmento[];
  lotes: TimelineFooterLote[];
};

type UltimoLoteLinhaJoin = {
  oeeturno_id?: number | string | null;
  produto?: string | null;
  produto_id?: number | string | null;
  linhaproducao_id?: number | string | null;
  turno_id?: number | string | null;
  data?: string | Date | null;
  deletado?: string | null;
} | null;

type UltimoLoteLinhaRow = {
  oeeturnolote_id?: number | string | null;
  lote?: string | null;
  data?: string | Date | null;
  hora_inicio?: string | null;
  hora_fim?: string | null;
  qtd_produzida?: number | string | null;
  total_producao?: number | string | null;
  oeeturno_id?: number | string | null;
  turno?: UltimoLoteLinhaJoin | UltimoLoteLinhaJoin[] | null;
};

type StatusCardProdutoLote = {
  produto: string | null;
  lote: string | null;
};

const LIMITE_PARETO_CARD = 7;
const LIMITE_OEE_HISTORICO_CARD = 20;
const LIMITE_FIFO_CARD = 3;
const TEMPO_DISPONIVEL_PADRAO = 12;
const JANELA_TIMELINE_HORAS = 24;

const TIMELINE_VAZIA: OeeTimelineNormalizado = {
  janelaInicioIso: null,
  janelaFimIso: null,
  timelineTimes: [],
  segmentos: [],
  lotes: [],
};

const STATUS_CARD_PRODUTO_LOTE_VAZIO: StatusCardProdutoLote = {
  produto: null,
  lote: null,
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

const parseArrayJsonb = (valor: unknown): unknown[] => {
  if (Array.isArray(valor)) {
    return valor;
  }

  if (typeof valor === 'string') {
    try {
      const parsed = JSON.parse(valor) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

const normalizarTextoTimeline = (valor: unknown, fallback = ''): string => {
  if (typeof valor === 'string') {
    const texto = valor.trim();
    return texto || fallback;
  }

  if (valor === null || valor === undefined) {
    return fallback;
  }

  const texto = String(valor).trim();
  return texto || fallback;
};

const normalizarTimelineTimes = (valor: unknown): string[] =>
  parseArrayJsonb(valor)
    .map((item) => normalizarTextoTimeline(item))
    .filter((item) => item.length > 0);

const normalizarSegmentosTimeline = (valor: unknown): TimelineFooterSegmento[] =>
  parseArrayJsonb(valor)
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const registro = item as Record<string, unknown>;

      return {
        inicio: normalizarTextoTimeline(registro.inicio),
        fim: normalizarTextoTimeline(registro.fim),
        inicioHora: normalizarTextoTimeline(registro.inicio_hora),
        fimHora: normalizarTextoTimeline(registro.fim_hora),
        duracaoMinutos: Math.max(0, parseNumero(registro.duracao_minutos)),
        larguraPct: Math.max(0, parseNumero(registro.largura_pct)),
        statusTimeline: normalizarTextoTimeline(registro.status_timeline, 'SEM_APONTAMENTO'),
        classeCss: normalizarTextoTimeline(registro.classe_css, 'white-fill'),
        oeeturnoId:
          registro.oeeturno_id === null || registro.oeeturno_id === undefined
            ? null
            : normalizarTextoTimeline(registro.oeeturno_id),
        produto: normalizarTextoTimeline(registro.produto),
      } satisfies TimelineFooterSegmento;
    })
    .filter((item): item is TimelineFooterSegmento => item !== null);

const normalizarLotesTimeline = (valor: unknown): TimelineFooterLote[] =>
  parseArrayJsonb(valor)
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const registro = item as Record<string, unknown>;

      return {
        lote: normalizarTextoTimeline(registro.lote, 'LOTE N/I'),
        produto: normalizarTextoTimeline(registro.produto, 'Produto não informado'),
        produzido: Math.max(0, parseNumero(registro.produzido)),
        inicio: normalizarTextoTimeline(registro.inicio),
        fim: normalizarTextoTimeline(registro.fim),
        inicioHora: normalizarTextoTimeline(registro.inicio_hora),
        fimHora: normalizarTextoTimeline(registro.fim_hora),
        duracaoMinutos: Math.max(0, parseNumero(registro.duracao_minutos)),
        larguraPct: Math.max(0, parseNumero(registro.largura_pct)),
      } satisfies TimelineFooterLote;
    })
    .filter((item): item is TimelineFooterLote => item !== null);

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

const mapearComponentesOeeDashboard = (registro: ComponentesOeeRpc | null): ComponentesOeeDetalhe | null => {
  if (!registro) {
    return null;
  }

  const unidadesProduzidas = parseNumero(registro.unidades_produzidas);
  const unidadesPerdas = parseNumero(registro.unidades_perdas);
  const unidadesBoas =
    registro.unidades_boas === null || registro.unidades_boas === undefined
      ? Math.max(unidadesProduzidas - unidadesPerdas, 0)
      : parseNumero(registro.unidades_boas);

  const tempoDisponivelHoras = parseNumero(registro.tempo_disponivel_horas);
  const tempoEstrategicoHoras = parseNumero(registro.tempo_estrategico_horas);
  const tempoParadasGrandesHoras = parseNumero(registro.tempo_paradas_grandes_horas);
  const tempoOperacaoHoras =
    registro.tempo_operacao_horas === null || registro.tempo_operacao_horas === undefined
      ? Math.max(tempoDisponivelHoras - tempoEstrategicoHoras - tempoParadasGrandesHoras, 0)
      : parseNumero(registro.tempo_operacao_horas);

  const tempoOperacionalLiquido = parseNumero(registro.tempo_operacional_liquido);
  const tempoValioso =
    registro.tempo_valioso === null || registro.tempo_valioso === undefined
      ? (unidadesProduzidas > 0 ? (unidadesBoas / unidadesProduzidas) * tempoOperacionalLiquido : 0)
      : parseNumero(registro.tempo_valioso);

  const disponibilidade =
    registro.disponibilidade === null || registro.disponibilidade === undefined
      ? tempoDisponivelHoras - tempoEstrategicoHoras > 0
        ? (tempoOperacaoHoras / (tempoDisponivelHoras - tempoEstrategicoHoras)) * 100
        : 0
      : parseNumero(registro.disponibilidade);

  const performance =
    registro.performance === null || registro.performance === undefined
      ? tempoOperacaoHoras > 0
        ? Math.min((tempoOperacionalLiquido / tempoOperacaoHoras) * 100, 100)
        : 0
      : parseNumero(registro.performance);

  const qualidade =
    registro.qualidade === null || registro.qualidade === undefined
      ? unidadesProduzidas > 0
        ? (unidadesBoas / unidadesProduzidas) * 100
        : 100
      : parseNumero(registro.qualidade);

  const oee =
    registro.oee === null || registro.oee === undefined
      ? (disponibilidade / 100) * (performance / 100) * (qualidade / 100) * 100
      : parseNumero(registro.oee);

  return {
    unidadesProduzidas,
    unidadesPerdas,
    unidadesBoas,
    tempoOperacionalLiquido,
    tempoValioso,
    tempoDisponivelHoras,
    tempoEstrategicoHoras,
    tempoParadasGrandesHoras,
    tempoOperacaoHoras,
    disponibilidade,
    performance,
    qualidade,
    oee,
  };
};

const agregarComponentesOeeDashboard = (
  registros: ComponentesOeeRpc[],
): ComponentesOeeDetalhe | null => {
  if (registros.length === 0) {
    return null;
  }

  if (registros.length === 1) {
    return mapearComponentesOeeDashboard(registros[0]);
  }

  const acumulado = {
    unidadesProduzidas: 0,
    unidadesPerdas: 0,
    unidadesBoas: 0,
    tempoOperacionalLiquido: 0,
    tempoValioso: 0,
    tempoDisponivelHoras: 0,
    tempoEstrategicoHoras: 0,
    tempoParadasGrandesHoras: 0,
    tempoOperacaoHoras: 0,
  };
  let possuiUnidadesBoas = false;
  let possuiTempoValioso = false;
  let possuiTempoOperacaoHoras = false;

  for (const registro of registros) {
    acumulado.unidadesProduzidas += parseNumero(registro.unidades_produzidas);
    acumulado.unidadesPerdas += parseNumero(registro.unidades_perdas);
    if (registro.unidades_boas !== null && registro.unidades_boas !== undefined) {
      acumulado.unidadesBoas += parseNumero(registro.unidades_boas);
      possuiUnidadesBoas = true;
    }
    acumulado.tempoOperacionalLiquido += parseNumero(registro.tempo_operacional_liquido);
    if (registro.tempo_valioso !== null && registro.tempo_valioso !== undefined) {
      acumulado.tempoValioso += parseNumero(registro.tempo_valioso);
      possuiTempoValioso = true;
    }
    acumulado.tempoDisponivelHoras += parseNumero(registro.tempo_disponivel_horas);
    acumulado.tempoEstrategicoHoras += parseNumero(registro.tempo_estrategico_horas);
    acumulado.tempoParadasGrandesHoras += parseNumero(registro.tempo_paradas_grandes_horas);
    if (registro.tempo_operacao_horas !== null && registro.tempo_operacao_horas !== undefined) {
      acumulado.tempoOperacaoHoras += parseNumero(registro.tempo_operacao_horas);
      possuiTempoOperacaoHoras = true;
    }
  }

  return mapearComponentesOeeDashboard({
    unidades_produzidas: acumulado.unidadesProduzidas,
    unidades_perdas: acumulado.unidadesPerdas,
    unidades_boas: possuiUnidadesBoas ? acumulado.unidadesBoas : null,
    tempo_operacional_liquido: acumulado.tempoOperacionalLiquido,
    tempo_valioso: possuiTempoValioso ? acumulado.tempoValioso : null,
    tempo_disponivel_horas: acumulado.tempoDisponivelHoras,
    tempo_estrategico_horas: acumulado.tempoEstrategicoHoras,
    tempo_paradas_grandes_horas: acumulado.tempoParadasGrandesHoras,
    tempo_operacao_horas: possuiTempoOperacaoHoras ? acumulado.tempoOperacaoHoras : null,
    disponibilidade: null,
    performance: null,
    qualidade: null,
    oee: null,
  });
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

  const {
    data: timelineDados = TIMELINE_VAZIA,
    isLoading: timelineLoading,
    isFetching: timelineFetching,
    error: timelineError,
  } = useQuery({
    queryKey: [
      'dashboard-linha-timeline',
      {
        linhaIdRpc,
        janelaHoras: JANELA_TIMELINE_HORAS,
      },
    ],
    queryFn: async (): Promise<OeeTimelineNormalizado> => {
      if (!linhaIdRpc) {
        return TIMELINE_VAZIA;
      }

      const { data, error } = await supabase.rpc('fn_calcular_oee_timeline', {
        p_data_inicio: null,
        p_data_fim: null,
        p_turno_id: null,
        p_produto_id: null,
        p_linhaproducao_id: linhaIdRpc,
        p_oeeturno_id: null,
        p_statuses: null,
        p_janela_horas: JANELA_TIMELINE_HORAS,
      });

      if (error) {
        throw error;
      }

      const linha = ((data || []) as OeeTimelineRpcRow[])[0];
      if (!linha) {
        return TIMELINE_VAZIA;
      }

      return {
        janelaInicioIso: extrairDataIso(linha.janela_inicio),
        janelaFimIso: extrairDataIso(linha.janela_fim),
        timelineTimes: normalizarTimelineTimes(linha.timeline_times),
        segmentos: normalizarSegmentosTimeline(linha.segmentos),
        lotes: normalizarLotesTimeline(linha.lotes),
      } satisfies OeeTimelineNormalizado;
    },
    enabled: Boolean(linhaIdRpc),
    staleTime: 60_000,
  });

  const { data: statusCardProdutoLoteBanco = STATUS_CARD_PRODUTO_LOTE_VAZIO } = useQuery({
    queryKey: [
      'dashboard-linha-status-produto-lote',
      {
        linhaIdRpc,
        turnoIdRpc,
        produtoIdRpc,
        lancamentoId,
        dataInicioIso: dataInicioIso ?? null,
        dataFimIso: dataFimIso ?? null,
      },
    ],
    queryFn: async (): Promise<StatusCardProdutoLote> => {
      if (!linhaIdRpc && !lancamentoId) {
        return STATUS_CARD_PRODUTO_LOTE_VAZIO;
      }

      let query = supabase
        .from('tboee_turno_lote')
        .select(
          `
            oeeturnolote_id,
            lote,
            data,
            hora_inicio,
            hora_fim,
            oeeturno_id,
            turno:tboee_turno!inner(
              oeeturno_id,
              produto,
              produto_id,
              linhaproducao_id,
              turno_id,
              data,
              deletado
            )
          `,
        )
        .eq('deletado', 'N')
        .eq('turno.deletado', 'N')
        .order('data', { ascending: false })
        .order('hora_fim', { ascending: false })
        .order('hora_inicio', { ascending: false })
        .order('oeeturnolote_id', { ascending: false })
        .limit(1);

      if (linhaIdRpc) {
        query = query.eq('turno.linhaproducao_id', linhaIdRpc);
      }

      if (turnoIdRpc) {
        query = query.eq('turno.turno_id', turnoIdRpc);
      }

      if (produtoIdRpc) {
        query = query.eq('turno.produto_id', produtoIdRpc);
      }

      if (lancamentoId) {
        query = query.eq('oeeturno_id', lancamentoId);
      }

      if (dataInicioIso && !periodoFiltrosInvalido) {
        query = query.gte('data', dataInicioIso);
      }

      if (dataFimIso && !periodoFiltrosInvalido) {
        query = query.lte('data', dataFimIso);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const registro = ((data || []) as UltimoLoteLinhaRow[])[0];
      if (!registro) {
        return STATUS_CARD_PRODUTO_LOTE_VAZIO;
      }

      const turnoRelacionado = Array.isArray(registro.turno) ? registro.turno[0] ?? null : registro.turno;
      const produto =
        typeof turnoRelacionado?.produto === 'string' && turnoRelacionado.produto.trim().length > 0
          ? turnoRelacionado.produto.trim()
          : null;
      const lote =
        typeof registro.lote === 'string' && registro.lote.trim().length > 0
          ? registro.lote.trim()
          : null;

      return {
        produto,
        lote,
      } satisfies StatusCardProdutoLote;
    },
    enabled: Boolean((linhaIdRpc || lancamentoId) && !periodoFiltrosInvalido),
    staleTime: 60_000,
  });

  const {
    data: fifoItens = [],
    isLoading: fifoLoading,
    isFetching: fifoFetching,
    error: fifoError,
  } = useQuery({
    queryKey: [
      'dashboard-linha-fifo-lotes',
      {
        linhaIdRpc,
        limite: LIMITE_FIFO_CARD,
      },
    ],
    queryFn: async (): Promise<FifoCardItem[]> => {
      if (!linhaIdRpc) {
        return [];
      }

      let query = supabase
        .from('tboee_turno_lote')
        .select(
          `
            oeeturnolote_id,
            lote,
            data,
            hora_inicio,
            hora_fim,
            qtd_produzida,
            total_producao,
            oeeturno_id,
            turno:tboee_turno!inner(
              oeeturno_id,
              produto,
              produto_id,
              linhaproducao_id,
              turno_id,
              data,
              deletado
            )
          `,
        )
        .eq('deletado', 'N')
        .eq('turno.deletado', 'N')
        .order('data', { ascending: false })
        .order('hora_fim', { ascending: false })
        .order('hora_inicio', { ascending: false })
        .order('oeeturnolote_id', { ascending: false });

      if (linhaIdRpc) {
        query = query.eq('turno.linhaproducao_id', linhaIdRpc);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const agregadosPorLote = new Map<string, FifoCardItem>();

      for (const registro of (data || []) as UltimoLoteLinhaRow[]) {
        const turnoRelacionado = Array.isArray(registro.turno) ? registro.turno[0] ?? null : registro.turno;
        const lote =
          typeof registro.lote === 'string' && registro.lote.trim().length > 0
            ? registro.lote.trim()
            : 'Lote não informado';
        const produto =
          typeof turnoRelacionado?.produto === 'string' && turnoRelacionado.produto.trim().length > 0
            ? turnoRelacionado.produto.trim()
            : 'Produto não informado';
        const produtoId =
          turnoRelacionado?.produto_id === null || turnoRelacionado?.produto_id === undefined
            ? null
            : String(turnoRelacionado.produto_id).trim() || null;
        const temTotalProducao =
          registro.total_producao !== null && registro.total_producao !== undefined;
        const quantidadeProduzida = Math.max(
          0,
          temTotalProducao ? parseNumero(registro.total_producao) : parseNumero(registro.qtd_produzida),
        );
        const chaveLote = lote.toLocaleUpperCase('pt-BR');
        const existente = agregadosPorLote.get(chaveLote);

        if (existente) {
          existente.quantidadeProduzida += quantidadeProduzida;

          // Preserva a primeira ocorrência (mais recente pela ordenação da query), mas completa campos vazios.
          if ((!existente.produto || existente.produto === 'Produto não informado') && produto) {
            existente.produto = produto;
          }
          if (!existente.produtoId && produtoId) {
            existente.produtoId = produtoId;
          }

          continue;
        }

        agregadosPorLote.set(chaveLote, {
          lote,
          produto,
          produtoId,
          quantidadeProduzida,
        } satisfies FifoCardItem);
      }

      return Array.from(agregadosPorLote.values()).slice(0, LIMITE_FIFO_CARD);
    },
    enabled: Boolean(linhaIdRpc),
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

  const oeeturnoIdsFiltradosParaOeeReal = useMemo(
    () =>
      Array.from(
        new Set(
          linhasResumoFiltradas
            .map((linha) => linha.oeeturno_id)
            .filter((id): id is number => typeof id === 'number' && Number.isFinite(id)),
        ),
      ),
    [linhasResumoFiltradas],
  );

  const oeeRealExigeConsultaPorLancamento = useMemo(
    () =>
      statusSelecionadosNormalizados.length > 0 ||
      turnoIdsSelecionados.length > 1 ||
      produtoIdsSelecionados.length > 1,
    [
      produtoIdsSelecionados.length,
      statusSelecionadosNormalizados.length,
      turnoIdsSelecionados.length,
    ],
  );

  const { data: componentesOeeReal } = useQuery({
    queryKey: [
      'dashboard-linha-oee-real',
      {
        dataInicioIso: dataInicioIso ?? null,
        dataFimIso: dataFimIso ?? null,
        linhaIdRpc,
        turnoIdRpc,
        produtoIdRpc,
        lancamentoId,
        linhaIdsSelecionados,
        oeeturnoIdsFiltradosParaOeeReal: oeeRealExigeConsultaPorLancamento
          ? oeeturnoIdsFiltradosParaOeeReal
          : [],
        oeeRealExigeConsultaPorLancamento,
      },
    ],
    queryFn: async (): Promise<ComponentesOeeDetalhe | null> => {
      if (!dataInicioIso || !dataFimIso || periodoFiltrosInvalido) {
        return null;
      }

      if (oeeRealExigeConsultaPorLancamento) {
        if (oeeturnoIdsFiltradosParaOeeReal.length === 0) {
          return null;
        }

        const respostas = await Promise.all(
          oeeturnoIdsFiltradosParaOeeReal.map(async (oeeturnoId) => {
            const { data, error } = await supabase.rpc('fn_calcular_oee_dashboard', {
              p_data_inicio: dataInicioIso,
              p_data_fim: dataFimIso,
              p_turno_id: null,
              p_produto_id: null,
              p_linhaproducao_id: null,
              p_tempo_disponivel_padrao: TEMPO_DISPONIVEL_PADRAO,
              p_oeeturno_id: oeeturnoId,
            });

            if (error) {
              throw error;
            }

            const registros = (Array.isArray(data) ? data : data ? [data] : []) as ComponentesOeeRpc[];
            return registros[0] ?? null;
          }),
        );

        return agregarComponentesOeeDashboard(
          respostas.filter((registro): registro is ComponentesOeeRpc => registro !== null),
        );
      }

      const { data, error } = await supabase.rpc('fn_calcular_oee_dashboard', {
        p_data_inicio: dataInicioIso,
        p_data_fim: dataFimIso,
        p_turno_id: turnoIdRpc,
        p_produto_id: produtoIdRpc,
        p_linhaproducao_id: linhaIdRpc,
        p_tempo_disponivel_padrao: TEMPO_DISPONIVEL_PADRAO,
        p_oeeturno_id: lancamentoId,
      });

      if (error) {
        throw error;
      }

      const registros = (Array.isArray(data) ? data : data ? [data] : []) as ComponentesOeeRpc[];
      const linhaIdsSet = linhaIdsSelecionados.length > 0 ? new Set(linhaIdsSelecionados) : null;
      const registrosFiltrados = linhaIdsSet
        ? registros.filter((registro) => {
            const linhaId =
              registro.linhaproducao_id === null || registro.linhaproducao_id === undefined
                ? Number.NaN
                : Number.parseInt(String(registro.linhaproducao_id), 10);

            return Number.isFinite(linhaId) && linhaIdsSet.has(linhaId);
          })
        : registros;

      return agregarComponentesOeeDashboard(registrosFiltrados);
    },
    enabled: Boolean(dataInicioIso && dataFimIso && !periodoFiltrosInvalido),
    staleTime: 60_000,
  });

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

  const statusCardDados = useMemo(() => {
    const linhasOrdenadas = [...linhasResumoFiltradas].sort((a, b) => {
      const dataA = typeof a.data === 'string' ? a.data : '';
      const dataB = typeof b.data === 'string' ? b.data : '';

      if (dataA !== dataB) {
        return dataB.localeCompare(dataA);
      }

      return (b.oeeturno_id ?? -1) - (a.oeeturno_id ?? -1);
    });

    for (const linha of linhasOrdenadas) {
      const statusTurno = linha.status_turno_registrado?.trim();
      if (statusTurno) {
        return {
          status: statusTurno,
          criadoEm: linha.turno_created_at?.trim() || null,
        };
      }
    }

    for (const linha of linhasOrdenadas) {
      const statusLinha = linha.status_linha?.trim();
      if (statusLinha) {
        return {
          status: statusLinha,
          criadoEm: linha.turno_created_at?.trim() || null,
        };
      }
    }

    return {
      status: null,
      criadoEm: linhasOrdenadas[0]?.turno_created_at?.trim() || null,
    };
  }, [linhasResumoFiltradas]);

  const statusCardProdutoLote = useMemo<StatusCardProdutoLote>(() => {
    const produtoBanco = statusCardProdutoLoteBanco.produto?.trim();
    const loteBanco = statusCardProdutoLoteBanco.lote?.trim();

    if (produtoBanco || loteBanco) {
      return {
        produto: produtoBanco || null,
        lote: loteBanco || null,
      };
    }

    const ultimoLoteTimeline = [...timelineDados.lotes]
      .filter((item) => item && (item.produto?.trim() || item.lote?.trim()))
      .sort((a, b) => {
        if (a.fim && b.fim && a.fim !== b.fim) {
          return b.fim.localeCompare(a.fim);
        }

        if (a.inicio && b.inicio && a.inicio !== b.inicio) {
          return b.inicio.localeCompare(a.inicio);
        }

        return 0;
      })[0];

    return {
      produto: ultimoLoteTimeline?.produto?.trim() || null,
      lote: ultimoLoteTimeline?.lote?.trim() || null,
    };
  }, [statusCardProdutoLoteBanco, timelineDados.lotes]);

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

  const statusFifo = useMemo(() => {
    if (!linhaIdRpc) {
      return 'Selecione linha';
    }

    if (fifoError) {
      return 'Erro ao carregar';
    }

    if (fifoLoading) {
      return 'Carregando...';
    }

    if (fifoItens.length === 0) {
      return 'Sem dados';
    }

    if (fifoFetching) {
      return 'Atualizando...';
    }

    return undefined;
  }, [
    fifoError,
    fifoFetching,
    fifoItens.length,
    fifoLoading,
    linhaIdRpc,
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

  const statusTimeline = useMemo(() => {
    if (!linhaIdRpc) {
      return 'Selecione linha';
    }

    if (timelineError) {
      return 'Erro ao carregar';
    }

    if (timelineLoading) {
      return 'Carregando...';
    }

    if (timelineDados.segmentos.length === 0 && timelineDados.lotes.length === 0) {
      return 'Sem dados';
    }

    if (timelineFetching) {
      return 'Atualizando...';
    }

    return undefined;
  }, [
    linhaIdRpc,
    timelineDados.lotes.length,
    timelineDados.segmentos.length,
    timelineError,
    timelineFetching,
    timelineLoading,
  ]);

  const mensagemFifoVazia = useMemo(() => {
    if (!linhaIdRpc) {
      return 'Selecione uma linha válida.';
    }

    if (fifoError) {
      return 'Não foi possível carregar os últimos lotes.';
    }

    if (fifoLoading) {
      return 'Carregando últimos lotes...';
    }

    return 'Sem lotes no período selecionado.';
  }, [fifoError, fifoLoading, linhaIdRpc]);

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

  const mensagemTimelineVazia = useMemo(() => {
    if (!linhaIdRpc) {
      return 'Selecione uma linha válida.';
    }

    if (timelineError) {
      return 'Não foi possível carregar a timeline.';
    }

    if (timelineLoading) {
      return 'Carregando timeline...';
    }

    return 'Sem apontamentos nas últimas 24 horas da linha.';
  }, [linhaIdRpc, timelineError, timelineLoading]);

  const tituloLinha =
    typeof routeState?.linhaNome === 'string' && routeState.linhaNome.trim().length > 0
      ? routeState.linhaNome
      : 'EQUIPAMENTO';

  const dadosOeeLinha = {
    oee: componentesOeeReal?.oee,
    disponibilidade: componentesOeeReal?.disponibilidade,
    performance: componentesOeeReal?.performance,
    qualidade: componentesOeeReal?.qualidade,
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
                  <FifoCard
                    itens={fifoItens}
                    statusTexto={statusFifo}
                    mensagemVazia={mensagemFifoVazia}
                  />
                </div>
                <div className="col-3-4-status">
                  <StatusCard
                    status={statusCardDados.status}
                    criadoEm={statusCardDados.criadoEm}
                    produto={statusCardProdutoLote.produto}
                    lote={statusCardProdutoLote.lote}
                  />
                </div>
              </div>
            </div>
          </main>

          {/* TIMELINE */}
          <TimelineFooter
            timelineTimes={timelineDados.timelineTimes}
            segmentos={timelineDados.segmentos}
            lotes={timelineDados.lotes}
            statusTexto={statusTimeline}
            mensagemVazia={mensagemTimelineVazia}
          />
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
