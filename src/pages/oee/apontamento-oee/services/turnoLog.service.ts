import { supabase } from '@/lib/supabase'

export type OperacaoTurnoLog = 'Inclusão' | 'Alteração' | 'Exclusão' | 'Visualização'

export type TabelaTurnoLog =
  | 'tboee_turno'
  | 'tboee_turno_producao'
  | 'tboee_turno_perda'
  | 'tboee_turno_parada'
  | 'tboee_turno_lote'

interface RegistrarLogTurnoParams {
  log: string
  operacao: OperacaoTurnoLog
  tabela: TabelaTurnoLog
  registroId: number | null
  userId: string
}

export async function registrarLogTurno(params: RegistrarLogTurnoParams): Promise<void> {
  try {
    const { error } = await supabase
      .from('tboee_turno_log')
      .insert({
        log: params.log,
        operacao: params.operacao,
        tabela: params.tabela,
        registro_id: params.registroId,
        created_by: params.userId,
      })

    if (error) {
      console.warn('⚠️ Falha ao registrar log operacional do turno:', {
        error,
        tabela: params.tabela,
        operacao: params.operacao,
        registroId: params.registroId,
      })
    }
  } catch (error) {
    console.warn('⚠️ Erro inesperado ao registrar log operacional do turno:', {
      error,
      tabela: params.tabela,
      operacao: params.operacao,
      registroId: params.registroId,
    })
  }
}
