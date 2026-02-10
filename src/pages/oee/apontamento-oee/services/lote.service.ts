import { supabase } from '@/lib/supabase'
import { gerarTimestampLocal } from '@/utils/datahora.utils'
import { LoteSupabase, PayloadLoteSupabase } from '../types/lote.types'

const COLUNAS_LOTE = `
  oeeturnolote_id,
  lote,
  fabricacao,
  validade,
  hora_inicio,
  hora_fim,
  data,
  qtd_inicial,
  qtd_final,
  perda,
  qtd_produzida,
  total_producao,
  oeeturno_id,
  created_at,
  deletado
`

export async function listarLotesPorTurno(oeeturnoId: number): Promise<LoteSupabase[]> {
  const { data, error } = await supabase
    .from('tboee_turno_lote')
    .select(COLUNAS_LOTE)
    .eq('oeeturno_id', oeeturnoId)
    .or('deletado.is.null,deletado.eq.N')
    .order('hora_inicio', { ascending: true })

  if (error) {
    throw error
  }

  return (data || []) as LoteSupabase[]
}

export async function inserirLote(
  payload: PayloadLoteSupabase,
  userId: string
): Promise<LoteSupabase> {
  const timestampAtual = gerarTimestampLocal()

  const { data, error } = await supabase
    .from('tboee_turno_lote')
    .insert({
      ...payload,
      deletado: 'N',
      created_at: timestampAtual,
      created_by: userId,
      updated_at: timestampAtual,
      updated_by: userId,
    })
    .select(COLUNAS_LOTE)
    .single()

  if (error) {
    throw error
  }

  return data as LoteSupabase
}

export async function atualizarLote(
  oeeturnoloteId: number,
  payload: PayloadLoteSupabase,
  userId: string
): Promise<LoteSupabase> {
  const timestampAtual = gerarTimestampLocal()

  const { data, error } = await supabase
    .from('tboee_turno_lote')
    .update({
      ...payload,
      updated_at: timestampAtual,
      updated_by: userId,
    })
    .eq('oeeturnolote_id', oeeturnoloteId)
    .select(COLUNAS_LOTE)
    .single()

  if (error) {
    throw error
  }

  return data as LoteSupabase
}

export async function softDeleteLote(
  oeeturnoloteId: number,
  userId: string
): Promise<void> {
  const timestampAtual = gerarTimestampLocal()

  const { error } = await supabase
    .from('tboee_turno_lote')
    .update({
      deletado: 'S',
      deleted_at: timestampAtual,
      deleted_by: userId,
      updated_at: timestampAtual,
      updated_by: userId,
    })
    .eq('oeeturnolote_id', oeeturnoloteId)

  if (error) {
    throw error
  }
}
