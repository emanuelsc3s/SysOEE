import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, subDays } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { OeeEmpresaHeader } from './components/OeeEmpresaHeader'
import { OeeHeroSection } from './components/OeeHeroSection'
import { OeeRingCard } from './components/OeeRingCard'
import { OeeKpiTriplet } from './components/OeeKpiTriplet'
import { OeeTimeDistribution } from './components/OeeTimeDistribution'
import { OeeHoursGrid } from './components/OeeHoursGrid'
import { OeeProductionLosses } from './components/OeeProductionLosses'
import { OeeEmpresaFooter } from './components/OeeEmpresaFooter'
import { useTheme } from '@/hooks/useTheme'
import type { DashboardOeeEmpresaData } from './types'
import './DashboardOeeEmpresa.css'

const TEMPO_DISPONIVEL_PADRAO = 12

type OeeEmpresaRpcRow = {
  data_inicio?: string | Date | null
  data_fim?: string | Date | null
  turnos_apontados?: number | string | null
  linhas_com_apontamento?: number | string | null
  sku_produzidos?: number | string | null
  qtd_envase?: number | string | null
  envasado?: number | string | null
  qtd_embalagem?: number | string | null
  embalado?: number | string | null
  perdas_envase?: number | string | null
  perdas_embalagem?: number | string | null
  perdas_total?: number | string | null
  unidades_produzidas?: number | string | null
  unidades_perdas?: number | string | null
  unidades_boas?: number | string | null
  tempo_operacional_liquido?: number | string | null
  tempo_valioso?: number | string | null
  tempo_disponivel_horas?: number | string | null
  tempo_estrategico_horas?: number | string | null
  tempo_paradas_grandes_horas?: number | string | null
  tempo_operacao_horas?: number | string | null
  paradas_pequenas_horas?: number | string | null
  paradas_totais_horas?: number | string | null
  disponibilidade?: number | string | null
  performance?: number | string | null
  qualidade?: number | string | null
  oee?: number | string | null
}

type PeriodoConsulta = {
  inicioIso: string
  fimIso: string
  inicioBr: string
  fimBr: string
}

const parseNumero = (valor: unknown): number => {
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : 0
  }

  if (typeof valor === 'string') {
    const limpo = valor.trim().replace('%', '').replace(/\s+/g, '')
    if (!limpo) {
      return 0
    }

    if (limpo.includes(',') && limpo.includes('.')) {
      const normalizado = limpo.replace(/\./g, '').replace(',', '.')
      const numero = Number.parseFloat(normalizado)
      return Number.isFinite(numero) ? numero : 0
    }

    if (limpo.includes(',')) {
      const numero = Number.parseFloat(limpo.replace(',', '.'))
      return Number.isFinite(numero) ? numero : 0
    }

    const numero = Number.parseFloat(limpo)
    return Number.isFinite(numero) ? numero : 0
  }

  if (valor === null || valor === undefined) {
    return 0
  }

  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : 0
}

const limitarPercentual = (valor: number): number => Math.min(Math.max(valor, 0), 100)

const formatarHorasParaHHMM = (horasDecimais: number): string => {
  const minutosTotais = Math.max(0, Math.round(horasDecimais * 60))
  const horas = Math.floor(minutosTotais / 60)
  const minutos = minutosTotais % 60
  return `${horas}:${String(minutos).padStart(2, '0')}`
}

const formatarDecimal = (valor: number, casasDecimais = 2): string =>
  valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  })

const criarDashboardPadrao = (
  periodo: PeriodoConsulta,
  descricao: string
): DashboardOeeEmpresaData => ({
  rotuloDashboard: 'Dashboard OEE',
  tituloLinha: 'TOTAL EMPRESA',
  periodo: {
    inicio: periodo.inicioBr,
    fim: periodo.fimBr,
  },
  oeeGlobal: {
    percentual: 0,
    descricao,
  },
  indicadoresHero: [
    {
      id: 'envazado',
      titulo: 'Envazado',
      valor: 0,
      unidade: 'un',
      cor: '#00a870',
      fundo: 'rgba(0,168,112,0.08)',
      borda: 'rgba(0,168,112,0.2)',
    },
    {
      id: 'embalado',
      titulo: 'Embalado',
      valor: 0,
      unidade: 'un',
      cor: '#0075d4',
      fundo: 'rgba(0,117,212,0.08)',
      borda: 'rgba(0,117,212,0.2)',
    },
  ],
  ring: {
    arcos: [
      { id: 'oee', nome: 'OEE', percentual: 0, cor: '#00a870', raio: 80 },
      { id: 'disponibilidade', nome: 'Disponibilidade', percentual: 0, cor: '#0075d4', raio: 62 },
      { id: 'performance', nome: 'Performance', percentual: 0, cor: '#7c3aed', raio: 44 },
    ],
    legenda: [
      { id: 'oee', nome: 'OEE', percentual: 0, cor: '#00a870' },
      { id: 'disponibilidade', nome: 'Disponibilidade', percentual: 0, cor: '#0075d4' },
      { id: 'performance', nome: 'Performance', percentual: 0, cor: '#7c3aed' },
      { id: 'qualidade', nome: 'Qualidade', percentual: 0, cor: '#059669' },
    ],
  },
  kpis: [
    {
      id: 'disponibilidade',
      nome: 'Disponibilidade',
      percentual: 0,
      subtitulo: 'Horas disponíveis: 0:00 h',
      cor: '#0097ff',
    },
    {
      id: 'performance',
      nome: 'Performance',
      percentual: 0,
      subtitulo: 'Horas trabalhadas: 0:00 h',
      cor: '#a78bfa',
    },
    {
      id: 'qualidade',
      nome: 'Qualidade',
      percentual: 0,
      subtitulo: 'Perdas totais: 0 un',
      cor: '#34d399',
    },
  ],
  distribuicaoHoras: [
    {
      id: 'trabalhadas',
      valor: '0:00h',
      larguraPercentual: 0,
      gradiente: 'linear-gradient(90deg,#0075d4,#0053a0)',
      corTexto: '#ffffff',
      legenda: 'Horas Trabalhadas (0:00)',
      corLegenda: '#0075d4',
    },
    {
      id: 'indisponiveis',
      valor: '0:00h',
      larguraPercentual: 0,
      gradiente: 'linear-gradient(90deg,#e05a20,#b84010)',
      corTexto: '#ffffff',
      legenda: 'Paradas Indisponíveis (0:00)',
      corLegenda: '#e05a20',
    },
    {
      id: 'estrategicas',
      valor: '0:00h',
      larguraPercentual: 0,
      gradiente: 'linear-gradient(90deg,#d1d5db,#b0b7c2)',
      corTexto: '#6b7280',
      legenda: 'Paradas Estratégicas (0:00)',
      corLegenda: '#d1d5db',
      bordaLegenda: '#b0b7c2',
    },
  ],
  horasPeriodo: [
    { id: 'horas-disponiveis', rotulo: 'Horas Disponíveis', valor: '0:00', cor: '#0097ff' },
    { id: 'horas-trabalhadas', rotulo: 'Horas Trabalhadas', valor: '0:00', cor: '#e8ecf0' },
    { id: 'paradas-indisponiveis', rotulo: 'Paradas Indisponíveis', valor: '0:00', cor: '#ff6b35' },
    { id: 'paradas-estrategicas', rotulo: 'Paradas Estratégicas', valor: '0:00', cor: '#6b7280' },
  ],
  producao: [
    {
      id: 'envazado',
      titulo: 'Envazado',
      subtitulo: 'Unidades processadas',
      valor: 0,
      unidade: 'unidades',
      corValor: 'var(--accent)',
    },
    {
      id: 'embalado',
      titulo: 'Embalado',
      subtitulo: 'Unidades embaladas',
      valor: 0,
      unidade: 'unidades',
      corValor: 'var(--accent2)',
    },
    {
      id: 'horas-producao',
      titulo: 'Horas com produção',
      subtitulo: 'Produção > zero',
      valor: '0:00',
      unidade: 'horas',
    },
  ],
  perdas: [
    {
      id: 'perdas-envase',
      titulo: 'Perdas no Envase',
      subtitulo: 'Unidades não conformes',
      valor: 0,
      corValor: 'var(--accent3)',
      badge: 'ENVASE',
    },
    {
      id: 'perdas-embalagem',
      titulo: 'Perdas na Embalagem',
      subtitulo: 'Unidades não conformes',
      valor: 0,
      corValor: 'var(--accent3)',
      badge: 'EMBALAGEM',
    },
    {
      id: 'perdas-total',
      titulo: 'Total de Perdas',
      subtitulo: 'Impacto na qualidade: 0,00%',
      valor: 0,
      corValor: 'var(--warn)',
      unidade: 'unidades',
    },
  ],
})

const mapearRpcParaDashboard = (
  registro: OeeEmpresaRpcRow | null,
  periodo: PeriodoConsulta
): DashboardOeeEmpresaData => {
  const base = criarDashboardPadrao(periodo, 'Sem dados de apontamento no período selecionado.')
  if (!registro) {
    return base
  }

  const oee = limitarPercentual(parseNumero(registro.oee))
  const disponibilidade = limitarPercentual(parseNumero(registro.disponibilidade))
  const performance = limitarPercentual(parseNumero(registro.performance))
  const qualidade = limitarPercentual(parseNumero(registro.qualidade))

  const envasado = Math.max(0, parseNumero(registro.envasado))
  const embalado = Math.max(0, parseNumero(registro.embalado))
  const perdasEnvase = Math.max(0, parseNumero(registro.perdas_envase))
  const perdasEmbalagem = Math.max(0, parseNumero(registro.perdas_embalagem))
  const perdasTotalBruto = parseNumero(registro.perdas_total)
  const perdasTotal = Math.max(
    0,
    perdasTotalBruto > 0 ? perdasTotalBruto : perdasEnvase + perdasEmbalagem
  )

  const tempoOperacionalLiquido = Math.max(0, parseNumero(registro.tempo_operacional_liquido))
  const tempoDisponivelHoras = Math.max(0, parseNumero(registro.tempo_disponivel_horas))
  const tempoEstrategicoHoras = Math.max(0, parseNumero(registro.tempo_estrategico_horas))
  const tempoParadasGrandesHoras = Math.max(0, parseNumero(registro.tempo_paradas_grandes_horas))
  const tempoOperacaoCalculado = Math.max(
    tempoDisponivelHoras - tempoEstrategicoHoras - tempoParadasGrandesHoras,
    0
  )
  const tempoOperacaoHorasRpc = parseNumero(registro.tempo_operacao_horas)
  const tempoOperacaoHoras =
    tempoOperacaoHorasRpc > 0 ? tempoOperacaoHorasRpc : tempoOperacaoCalculado
  const tempoDisponivelAjustado = Math.max(tempoDisponivelHoras - tempoEstrategicoHoras, 0)

  const totalDistribuicao = tempoOperacaoHoras + tempoParadasGrandesHoras + tempoEstrategicoHoras
  const larguraTrabalhadas = totalDistribuicao > 0 ? (tempoOperacaoHoras / totalDistribuicao) * 100 : 0
  const larguraIndisponiveis =
    totalDistribuicao > 0 ? (tempoParadasGrandesHoras / totalDistribuicao) * 100 : 0
  const larguraEstrategicas =
    totalDistribuicao > 0 ? (tempoEstrategicoHoras / totalDistribuicao) * 100 : 0

  const impactoQualidade = Math.max(0, 100 - qualidade)
  const turnosApontados = Math.max(0, Math.round(parseNumero(registro.turnos_apontados)))

  return {
    ...base,
    oeeGlobal: {
      percentual: oee,
      descricao: `${formatarDecimal(tempoOperacionalLiquido, 2)} horas com produção > zero registradas no período`,
    },
    indicadoresHero: [
      { ...base.indicadoresHero[0], valor: envasado },
      { ...base.indicadoresHero[1], valor: embalado },
    ],
    ring: {
      arcos: [
        { ...base.ring.arcos[0], percentual: oee },
        { ...base.ring.arcos[1], percentual: disponibilidade },
        { ...base.ring.arcos[2], percentual: performance },
      ],
      legenda: [
        { ...base.ring.legenda[0], percentual: oee },
        { ...base.ring.legenda[1], percentual: disponibilidade },
        { ...base.ring.legenda[2], percentual: performance },
        { ...base.ring.legenda[3], percentual: qualidade },
      ],
    },
    kpis: [
      {
        ...base.kpis[0],
        percentual: disponibilidade,
        subtitulo: `Horas disponíveis: ${formatarHorasParaHHMM(tempoDisponivelAjustado)} h`,
      },
      {
        ...base.kpis[1],
        percentual: performance,
        subtitulo: `Horas trabalhadas: ${formatarHorasParaHHMM(tempoOperacaoHoras)} h`,
      },
      {
        ...base.kpis[2],
        percentual: qualidade,
        subtitulo: `Perdas totais: ${Math.round(perdasTotal).toLocaleString('pt-BR')} un`,
      },
    ],
    distribuicaoHoras: [
      {
        ...base.distribuicaoHoras[0],
        valor: `${formatarHorasParaHHMM(tempoOperacaoHoras)}h`,
        larguraPercentual: larguraTrabalhadas,
        legenda: `Horas Trabalhadas (${formatarHorasParaHHMM(tempoOperacaoHoras)})`,
      },
      {
        ...base.distribuicaoHoras[1],
        valor: `${formatarHorasParaHHMM(tempoParadasGrandesHoras)}h`,
        larguraPercentual: larguraIndisponiveis,
        legenda: `Paradas Indisponíveis (${formatarHorasParaHHMM(tempoParadasGrandesHoras)})`,
      },
      {
        ...base.distribuicaoHoras[2],
        valor: `${formatarHorasParaHHMM(tempoEstrategicoHoras)}h`,
        larguraPercentual: larguraEstrategicas,
        legenda: `Paradas Estratégicas (${formatarHorasParaHHMM(tempoEstrategicoHoras)})`,
      },
    ],
    horasPeriodo: [
      { ...base.horasPeriodo[0], valor: formatarHorasParaHHMM(tempoDisponivelAjustado) },
      { ...base.horasPeriodo[1], valor: formatarHorasParaHHMM(tempoOperacaoHoras) },
      { ...base.horasPeriodo[2], valor: formatarHorasParaHHMM(tempoParadasGrandesHoras) },
      { ...base.horasPeriodo[3], valor: formatarHorasParaHHMM(tempoEstrategicoHoras) },
    ],
    producao: [
      { ...base.producao[0], valor: envasado },
      { ...base.producao[1], valor: embalado },
      { ...base.producao[2], valor: formatarHorasParaHHMM(tempoOperacionalLiquido) },
    ],
    perdas: [
      { ...base.perdas[0], valor: Math.round(perdasEnvase) },
      { ...base.perdas[1], valor: Math.round(perdasEmbalagem) },
      {
        ...base.perdas[2],
        valor: Math.round(perdasTotal),
        subtitulo: `Impacto na qualidade: ${formatarDecimal(impactoQualidade, 2)}%`,
      },
    ],
    tituloLinha: `TOTAL EMPRESA (${turnosApontados} turnos)`,
  }
}

export default function DashboardOeeEmpresa() {
  const { theme } = useTheme()
  const periodoConsulta = useMemo<PeriodoConsulta>(() => {
    const hoje = new Date()
    const inicio = subDays(hoje, 6)

    return {
      inicioIso: format(inicio, 'yyyy-MM-dd'),
      fimIso: format(hoje, 'yyyy-MM-dd'),
      inicioBr: format(inicio, 'dd/MM/yyyy'),
      fimBr: format(hoje, 'dd/MM/yyyy'),
    }
  }, [])

  const {
    data: dadosDashboard,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['dashboard-oee-empresa', periodoConsulta],
    queryFn: async () => {
      const { data, error: erroRpc } = await supabase.rpc('fn_calcular_oee_empresa', {
        p_data_inicio: periodoConsulta.inicioIso,
        p_data_fim: periodoConsulta.fimIso,
        p_turno_id: null,
        p_produto_id: null,
        p_linhaproducao_id: null,
        p_tempo_disponivel_padrao: TEMPO_DISPONIVEL_PADRAO,
        p_oeeturno_id: null,
      })

      if (erroRpc) {
        throw erroRpc
      }

      const linhas = (Array.isArray(data) ? data : []) as OeeEmpresaRpcRow[]
      return mapearRpcParaDashboard(linhas[0] ?? null, periodoConsulta)
    },
    staleTime: 60_000,
  })

  const data = useMemo(() => {
    if (dadosDashboard) {
      return dadosDashboard
    }

    if (error) {
      return criarDashboardPadrao(
        periodoConsulta,
        'Não foi possível carregar o consolidado da empresa no momento.'
      )
    }

    if (isLoading) {
      return criarDashboardPadrao(periodoConsulta, 'Carregando consolidado da empresa...')
    }

    return criarDashboardPadrao(periodoConsulta, 'Sem dados de apontamento no período selecionado.')
  }, [dadosDashboard, error, isLoading, periodoConsulta])

  return (
    <div className="dashboard-oee-empresa-page" data-theme={theme}>
      <div className="wrapper">
        <OeeEmpresaHeader
          rotuloDashboard={data.rotuloDashboard}
          tituloLinha={data.tituloLinha}
          periodo={data.periodo}
        />

        <div className="oee-hero">
          <OeeHeroSection
            percentualOee={data.oeeGlobal.percentual}
            descricao={data.oeeGlobal.descricao}
            indicadores={data.indicadoresHero}
          />
          <OeeRingCard
            arcos={data.ring.arcos}
            legenda={data.ring.legenda}
            percentualCentro={data.oeeGlobal.percentual}
          />
        </div>

        <OeeKpiTriplet kpis={data.kpis} />
        <OeeTimeDistribution segmentos={data.distribuicaoHoras} />
        <OeeHoursGrid horas={data.horasPeriodo} />
        <OeeProductionLosses producao={data.producao} perdas={data.perdas} />

        <OeeEmpresaFooter
          periodo={data.periodo}
          tituloLinha={data.tituloLinha}
          percentualOee={data.oeeGlobal.percentual}
        />
      </div>
    </div>
  )
}
