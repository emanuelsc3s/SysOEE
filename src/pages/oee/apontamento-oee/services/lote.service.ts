import { supabase } from '@/lib/supabase'
import { gerarTimestampLocal } from '@/utils/datahora.utils'
import { LoteSupabase, PayloadLoteSupabase } from '../types/lote.types'
import { registrarLogTurno } from './turnoLog.service'

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

const formatarValorLog = (valor: unknown): string => {
  if (valor === null || valor === undefined) {
    return ''
  }

  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor.toLocaleString('pt-BR') : String(valor)
  }

  if (typeof valor === 'string') {
    const texto = valor.trim()
    if (!texto) {
      return ''
    }

    const numero = Number(texto)
    if (Number.isFinite(numero) && /^-?\d+(\.\d+)?$/.test(texto)) {
      return numero.toLocaleString('pt-BR')
    }

    return texto
  }

  return String(valor)
}

const CAMPOS_LOG_LOTE: Array<keyof PayloadLoteSupabase> = [
  'lote',
  'fabricacao',
  'validade',
  'hora_inicio',
  'hora_fim',
  'data',
  'qtd_inicial',
  'qtd_final',
  'perda',
]

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

  void registrarLogTurno({
    tabela: 'tboee_turno_lote',
    operacao: 'Inclusão',
    registroId: data.oeeturnolote_id,
    userId,
    log: `Lote #${data.oeeturnolote_id} incluído no Turno #${payload.oeeturno_id}. lote=${payload.lote}, qtd_inicial=${formatarValorLog(payload.qtd_inicial)}, qtd_final=${formatarValorLog(payload.qtd_final)}`,
  })

  return data as LoteSupabase
}

export async function atualizarLote(
  oeeturnoloteId: number,
  payload: PayloadLoteSupabase,
  userId: string
): Promise<LoteSupabase> {
  const timestampAtual = gerarTimestampLocal()
  let registroAnterior: LoteSupabase | null = null

  const { data: dadosAnteriores, error: erroFetchAnterior } = await supabase
    .from('tboee_turno_lote')
    .select(COLUNAS_LOTE)
    .eq('oeeturnolote_id', oeeturnoloteId)
    .maybeSingle()

  if (erroFetchAnterior) {
    console.warn('⚠️ Não foi possível carregar lote anterior para log:', erroFetchAnterior)
  }

  registroAnterior = (dadosAnteriores as LoteSupabase | null) ?? null

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

  const camposAlterados = CAMPOS_LOG_LOTE
    .map((campo) => {
      const valorAnterior = registroAnterior ? registroAnterior[campo as keyof LoteSupabase] : undefined
      const valorNovo = payload[campo]

      if (String(valorAnterior ?? '') === String(valorNovo ?? '')) {
        return null
      }

      return `${campo}: '${formatarValorLog(valorAnterior)}' → '${formatarValorLog(valorNovo)}'`
    })
    .filter((item): item is string => Boolean(item))
    .join(', ')

  void registrarLogTurno({
    tabela: 'tboee_turno_lote',
    operacao: 'Alteração',
    registroId: oeeturnoloteId,
    userId,
    log: `Lote #${oeeturnoloteId} alterado no Turno #${payload.oeeturno_id}. Alterações: ${camposAlterados || 'sem mudanças detectadas'}`,
  })

  return data as LoteSupabase
}

export async function softDeleteLote(
  oeeturnoloteId: number,
  userId: string
): Promise<void> {
  const timestampAtual = gerarTimestampLocal()
  let oeeturnoId: number | null = null

  try {
    const { data } = await supabase
      .from('tboee_turno_lote')
      .select('oeeturno_id')
      .eq('oeeturnolote_id', oeeturnoloteId)
      .maybeSingle<{ oeeturno_id: number | null }>()

    oeeturnoId = data?.oeeturno_id ?? null
  } catch (error) {
    console.warn('⚠️ Não foi possível carregar turno do lote para log de exclusão:', error)
  }

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

  void registrarLogTurno({
    tabela: 'tboee_turno_lote',
    operacao: 'Exclusão',
    registroId: oeeturnoloteId,
    userId,
    log: `Lote #${oeeturnoloteId} excluído no Turno #${oeeturnoId ?? '-'}`,
  })
}
