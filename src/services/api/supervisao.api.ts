/**
 * API de Supervisão de Turnos
 * Consultas para página de supervisão onde supervisor fecha turnos
 */

import { supabase } from '@/lib/supabase';
import type {
  TurnoSupervisao,
  DetalheApontamentos,
  ApontamentoParada,
  ApontamentoProducao,
  ApontamentoQualidade,
  FiltroSupervisao,
  ResultadoFechamentoTurno
} from '@/types/supervisao';

/**
 * Busca turnos do dia para supervisão
 */
export const buscarTurnosDoDia = async (
  filtros: FiltroSupervisao
): Promise<TurnoSupervisao[]> => {
  let query = supabase
    .from('vw_supervisao_turnos')
    .select('*')
    .eq('data_producao', filtros.data);

  // Filtro por linha
  if (filtros.linhaproducao_id) {
    query = query.eq('linhaproducao_id', filtros.linhaproducao_id);
  }

  // Filtro por departamento
  if (filtros.departamento_id) {
    query = query.eq('departamento_id', filtros.departamento_id);
  }

  // Filtro por status
  if (filtros.status) {
    query = query.eq('turno_status', filtros.status);
  }

  // Ordenar por linha e turno
  query = query.order('linhaproducao_id', { ascending: true });
  query = query.order('turno_codigo', { ascending: true });

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

/**
 * Busca detalhes de apontamentos de um turno específico
 */
export const buscarDetalhesApontamentos = async (
  lote_id: string
): Promise<DetalheApontamentos> => {
  // Buscar paradas
  const { data: paradas, error: errorParadas } = await supabase
    .from('tbapontamentoparada')
    .select(`
      *,
      codigo_parada:tbcodigoparada(
        codigo,
        descricao,
        tipo_parada,
        nivel_1_classe,
        nivel_2_grande_parada,
        nivel_3_apontamento,
        nivel_4_grupo,
        nivel_5_detalhamento
      ),
      operador:tbusuario!criado_por_operador(
        usuario_id,
        login,
        funcionario:tbfuncionario(nome)
      )
    `)
    .eq('lote_id', lote_id)
    .eq('deletado', 'N')
    .order('data_parada', { ascending: true })
    .order('hora_inicio', { ascending: true });

  if (errorParadas) throw errorParadas;

  // Buscar produção
  const { data: producao, error: errorProducao } = await supabase
    .from('tbapontamentoproducao')
    .select(`
      *,
      usuario:tbusuario!created_by(
        usuario_id,
        login,
        funcionario:tbfuncionario(nome)
      )
    `)
    .eq('lote_id', lote_id)
    .eq('deletado', 'N')
    .order('data_apontamento', { ascending: true })
    .order('hora_apontamento', { ascending: true });

  if (errorProducao) throw errorProducao;

  // Buscar qualidade
  const { data: qualidade, error: errorQualidade } = await supabase
    .from('tbapontamentoqualidade')
    .select(`
      *,
      usuario:tbusuario!created_by(
        usuario_id,
        login,
        funcionario:tbfuncionario(nome)
      )
    `)
    .eq('lote_id', lote_id)
    .eq('deletado', 'N')
    .order('data_apontamento', { ascending: true });

  if (errorQualidade) throw errorQualidade;

  return {
    paradas: (paradas || []) as ApontamentoParada[],
    producao: (producao || []) as ApontamentoProducao[],
    qualidade: (qualidade || []) as ApontamentoQualidade[]
  };
};

/**
 * Fecha um turno e calcula OEE
 */
export const fecharTurno = async (
  lote_id: string,
  supervisor_id: number,
  observacoes?: string
): Promise<ResultadoFechamentoTurno> => {
  // 1. Atualizar lote para status CONCLUIDO
  const { error: errorLote } = await supabase
    .from('tblote')
    .update({
      status: 'CONCLUIDO',
      conferido_por_supervisor: supervisor_id,
      conferido_em: new Date().toISOString(),
      observacoes: observacoes,
      updated_at: new Date().toISOString(),
      updated_by: supervisor_id
    })
    .eq('lote_id', lote_id);

  if (errorLote) throw errorLote;

  // 2. Chamar function que calcula e insere OEE
  const { data: oeeData, error: errorOEE } = await supabase.rpc(
    'inserir_snapshot_oee',
    { p_lote_id: lote_id }
  );

  if (errorOEE) throw errorOEE;

  return {
    sucesso: true,
    lote_id,
    oee_id: oeeData?.oee_id,
    mensagem: 'Turno fechado e OEE calculado com sucesso'
  };
};

/**
 * Reabre um turno (desfaz fechamento)
 * ATENÇÃO: Invalida o OEE calculado
 */
export const reabrirTurno = async (
  lote_id: string,
  supervisor_id: number,
  motivo: string
): Promise<void> => {
  // 1. Invalidar OEE
  const { error: errorOEE } = await supabase
    .from('tboee')
    .update({
      status: 'INVALIDADO',
      invalidado_em: new Date().toISOString(),
      invalidado_por: supervisor_id,
      invalidado_motivo: motivo
    })
    .eq('lote_id', lote_id)
    .eq('status', 'ATIVO');

  if (errorOEE) throw errorOEE;

  // 2. Reabrir lote
  const { error: errorLote } = await supabase
    .from('tblote')
    .update({
      status: 'EM_ANDAMENTO',
      conferido_por_supervisor: null,
      conferido_em: null,
      updated_at: new Date().toISOString(),
      updated_by: supervisor_id
    })
    .eq('lote_id', lote_id);

  if (errorLote) throw errorLote;
};

/**
 * Busca resumo de turnos por status
 */
export const buscarResumoTurnos = async (data: string) => {
  const { data: turnos, error } = await supabase
    .from('vw_supervisao_turnos')
    .select('turno_status')
    .eq('data_producao', data);

  if (error) throw error;

  const resumo = {
    total: turnos?.length || 0,
    abertos: turnos?.filter(t => t.turno_status === 'ABERTO').length || 0,
    fechados: turnos?.filter(t => t.turno_status === 'FECHADO').length || 0
  };

  return resumo;
};
