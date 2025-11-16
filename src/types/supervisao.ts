/**
 * Tipos para módulo de Supervisão de Turnos
 */

export interface TurnoSupervisao {
  // Identificação
  lote_id: string;
  numero_lote: string;
  linhaproducao_id: number;
  linha_nome: string;
  departamento_id: number;
  departamento_nome: string;
  produto_id: number;
  produto_nome: string;
  turno_id: string;
  turno_nome: string;
  turno_codigo: string;

  // Datas e horários
  data_producao: string;
  hora_inicio: string;
  hora_fim: string | null;

  // Status
  lote_status: 'PLANEJADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  turno_status: 'ABERTO' | 'FECHADO' | 'PLANEJADO' | 'CANCELADO';
  tem_oee_calculado: boolean;

  // Resumo de paradas
  total_paradas: number;
  total_minutos_paradas: number;
  paradas_em_andamento: number;

  // Resumo de produção
  total_unidades_produzidas: number;
  total_apontamentos_producao: number;
  apontamentos_clp: number;
  apontamentos_manuais: number;

  // Resumo de qualidade
  total_refugo: number;
  total_minutos_retrabalho: number;
  total_apontamentos_qualidade: number;

  // Parâmetros para OEE
  velocidade_nominal: number | null;
  meta_oee_vigente: number | null;

  // Auditoria
  conferido_por_supervisor: number | null;
  conferido_em: string | null;
  supervisor_nome: string | null;
  lote_criado_em: string;
  lote_atualizado_em: string | null;
}

export interface FiltroSupervisao {
  data: string; // YYYY-MM-DD
  linhaproducao_id?: number;
  departamento_id?: number;
  status?: 'ABERTO' | 'FECHADO';
}

export interface DetalheApontamentos {
  paradas: ApontamentoParada[];
  producao: ApontamentoProducao[];
  qualidade: ApontamentoQualidade[];
}

export interface ApontamentoParada {
  id: string;
  linha_id: string;
  lote_id: string;
  codigo_parada_id: string;
  turno_id: string;
  data_parada: string;
  hora_inicio: string;
  hora_fim: string | null;
  duracao_minutos: number | null;
  observacao: string | null;
  criado_por_operador: number;
  codigo_parada: {
    codigo: string;
    descricao: string;
    tipo_parada: 'ESTRATEGICA' | 'PLANEJADA' | 'NAO_PLANEJADA';
    nivel_1_classe: string;
    nivel_2_grande_parada: string;
    nivel_3_apontamento: string | null;
    nivel_4_grupo: string | null;
    nivel_5_detalhamento: string | null;
  };
  operador: {
    usuario_id: number;
    login: string;
    funcionario: {
      nome: string;
    };
  };
  created_at: string;
}

export interface ApontamentoProducao {
  id: string;
  lote_id: string;
  linha_id: string;
  turno_id: string;
  data_apontamento: string;
  hora_apontamento: string;
  unidades_produzidas: number;
  fonte_dados: 'CLP_AUTOMATICO' | 'MANUAL' | 'TOTVS';
  clp_timestamp: string | null;
  observacao: string | null;
  usuario: {
    usuario_id: number;
    login: string;
    funcionario: {
      nome: string;
    };
  } | null;
  created_at: string;
}

export interface ApontamentoQualidade {
  id: string;
  lote_id: string;
  linha_id: string;
  turno_id: string;
  data_apontamento: string;
  tipo_perda: 'REFUGO' | 'RETRABALHO' | 'DESVIO' | 'BLOQUEIO';
  unidades_refugadas: number | null;
  tempo_retrabalho_minutos: number | null;
  motivo: string | null;
  origem_dados: 'CLP_AUTOMATICO' | 'MANUAL' | 'TOTVS';
  totvs_integrado: boolean;
  observacao: string | null;
  usuario: {
    usuario_id: number;
    login: string;
    funcionario: {
      nome: string;
    };
  } | null;
  created_at: string;
}

export interface ResultadoFechamentoTurno {
  sucesso: boolean;
  lote_id: string;
  oee_id?: number;
  mensagem: string;
}

export interface ResumoTurnos {
  total: number;
  abertos: number;
  fechados: number;
}
