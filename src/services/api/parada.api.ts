/**
 * API de Paradas
 * Funções para interagir com dados de paradas no Supabase
 */

import { supabase } from '@/lib/supabase'
import { CodigoParada, Turno, ApontamentoParada, CriarApontamentoParadaDTO } from '@/types/parada'
import { mockCodigosParada, mockTurnos } from '@/data/mockParadas'
import {
  salvarParada,
  buscarParadasEmAndamento as buscarParadasEmAndamentoLS,
  buscarParadasPorLote as buscarParadasPorLoteLS,
  finalizarParada as finalizarParadaLS,
  ParadaLocalStorage
} from '@/services/localStorage/parada.storage'

// Flag para usar dados mock (desenvolvimento)
const USE_MOCK_DATA = true

/**
 * Busca códigos de parada disponíveis para uma linha
 * @param linhaId ID da linha de produção (opcional - se não informado, retorna paradas globais)
 * @returns Lista de códigos de parada
 */
export async function buscarCodigosParada(linhaId?: string): Promise<CodigoParada[]> {
  // Modo mock para desenvolvimento
  if (USE_MOCK_DATA) {
    console.log('🔧 Usando dados mock de códigos de parada')
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockCodigosParada.filter(cp => !linhaId || cp.linha_id === null || cp.linha_id === linhaId))
      }, 500) // Simula delay de rede
    })
  }

  try {
    let query = supabase
      .from('tbcodigoparada')
      .select('*')
      .eq('ativo', true)
      .order('nivel_1_classe')
      .order('nivel_2_grande_parada')

    // Busca paradas específicas da linha OU paradas globais (linha_id = NULL)
    if (linhaId) {
      query = query.or(`linha_id.eq.${linhaId},linha_id.is.null`)
    } else {
      query = query.is('linha_id', null)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar códigos de parada:', error)
      throw new Error(`Erro ao buscar códigos de parada: ${error.message}`)
    }

    return (data || []) as CodigoParada[]
  } catch (error) {
    console.error('Erro ao buscar códigos de parada:', error)
    throw error
  }
}

/**
 * Busca todos os turnos ativos
 * @returns Lista de turnos
 */
export async function buscarTurnos(): Promise<Turno[]> {
  // Modo mock para desenvolvimento
  if (USE_MOCK_DATA) {
    console.log('🔧 Usando dados mock de turnos')
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockTurnos)
      }, 300) // Simula delay de rede
    })
  }

  try {
    const { data, error } = await supabase
      .from('tbturno')
      .select('*')
      .eq('ativo', true)
      .order('hora_inicio')

    if (error) {
      console.error('Erro ao buscar turnos:', error)
      throw new Error(`Erro ao buscar turnos: ${error.message}`)
    }

    return (data || []) as Turno[]
  } catch (error) {
    console.error('Erro ao buscar turnos:', error)
    throw error
  }
}

/**
 * Cria um novo apontamento de parada
 * @param dados Dados do apontamento de parada
 * @returns Apontamento criado
 */
export async function criarApontamentoParada(
  dados: CriarApontamentoParadaDTO
): Promise<ApontamentoParada> {
  // Modo mock para desenvolvimento - usa localStorage
  if (USE_MOCK_DATA) {
    console.log('🔧 Criando apontamento de parada no localStorage', dados)
    return new Promise((resolve) => {
      setTimeout(() => {
        const paradaLocalStorage: ParadaLocalStorage = {
          id: `parada-${Date.now()}`,
          linha_id: dados.linha_id,
          lote_id: dados.lote_id || null,
          codigo_parada_id: dados.codigo_parada_id,
          turno_id: dados.turno_id,
          data_parada: dados.data_parada,
          hora_inicio: dados.hora_inicio,
          hora_fim: null,
          duracao_minutos: null,
          observacao: dados.observacao || null,
          criado_por_operador: dados.criado_por_operador,
          conferido_por_supervisor: null,
          conferido_em: null,
          created_at: new Date().toISOString(),
          created_by: dados.criado_por_operador,
          updated_at: new Date().toISOString(),
          updated_by: null,
          deleted_at: null,
          deleted_by: null,
        }

        // Salva no localStorage
        const paradaSalva = salvarParada(paradaLocalStorage)
        console.log('✅ Parada salva no localStorage:', paradaSalva)
        resolve(paradaSalva as ApontamentoParada)
      }, 500) // Simula delay de rede
    })
  }

  try {
    // Obtém o usuário atual para auditoria
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    // Prepara dados para inserção
    const dadosInsercao = {
      linha_id: dados.linha_id,
      lote_id: dados.lote_id,
      codigo_parada_id: dados.codigo_parada_id,
      turno_id: dados.turno_id,
      data_parada: dados.data_parada,
      hora_inicio: dados.hora_inicio,
      hora_fim: null, // Parada em andamento
      observacao: dados.observacao,
      criado_por_operador: dados.criado_por_operador,
      deletado: 'N',
      // Campos de auditoria ALCOA+
      created_by: dados.criado_por_operador,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('tbapontamentoparada')
      .insert(dadosInsercao)
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar apontamento de parada:', error)
      throw new Error(`Erro ao criar apontamento de parada: ${error.message}`)
    }

    return data as ApontamentoParada
  } catch (error) {
    console.error('Erro ao criar apontamento de parada:', error)
    throw error
  }
}

/**
 * Finaliza um apontamento de parada (registra hora_fim)
 * @param apontamentoId ID do apontamento
 * @param horaFim Hora de fim da parada (formato HH:MM:SS)
 * @param usuarioId ID do usuário que está finalizando (opcional em mock)
 * @returns Apontamento atualizado
 */
export async function finalizarApontamentoParada(
  apontamentoId: string,
  horaFim: string,
  usuarioId?: number
): Promise<ApontamentoParada> {
  // Modo mock para desenvolvimento - usa localStorage
  if (USE_MOCK_DATA) {
    console.log('🔧 Finalizando parada no localStorage', { apontamentoId, horaFim })
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const paradaFinalizada = finalizarParadaLS(apontamentoId, horaFim, usuarioId || 1)

        if (paradaFinalizada) {
          console.log('✅ Parada finalizada no localStorage:', paradaFinalizada)
          resolve(paradaFinalizada as ApontamentoParada)
        } else {
          reject(new Error('Parada não encontrada'))
        }
      }, 500)
    })
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('tbapontamentoparada')
      .update({
        hora_fim: horaFim,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', apontamentoId)
      .select()
      .single()

    if (error) {
      console.error('Erro ao finalizar apontamento de parada:', error)
      throw new Error(`Erro ao finalizar apontamento de parada: ${error.message}`)
    }

    return data as ApontamentoParada
  } catch (error) {
    console.error('Erro ao finalizar apontamento de parada:', error)
    throw error
  }
}

/**
 * Busca apontamentos de parada de um lote
 * @param loteId ID do lote
 * @returns Lista de apontamentos
 */
export async function buscarApontamentosParadaPorLote(
  loteId: string
): Promise<ApontamentoParada[]> {
  // Modo mock para desenvolvimento - usa localStorage
  if (USE_MOCK_DATA) {
    console.log('🔧 Buscando todas as paradas do lote no localStorage', { loteId })
    return new Promise((resolve) => {
      setTimeout(() => {
        const paradas = buscarParadasPorLoteLS(loteId)
        console.log(`✅ ${paradas.length} parada(s) encontrada(s)`)
        resolve(paradas as ApontamentoParada[])
      }, 200)
    })
  }

  try {
    const { data, error } = await supabase
      .from('tbapontamentoparada')
      .select(`
        *,
        codigo_parada:tbcodigoparada(*),
        turno:tbturno(*),
        linha:tblinha(*)
      `)
      .eq('lote_id', loteId)
      .eq('deletado', 'N')
      .order('data_parada', { ascending: false })
      .order('hora_inicio', { ascending: false })

    if (error) {
      console.error('Erro ao buscar apontamentos de parada:', error)
      throw new Error(`Erro ao buscar apontamentos de parada: ${error.message}`)
    }

    return (data || []) as ApontamentoParada[]
  } catch (error) {
    console.error('Erro ao buscar apontamentos de parada:', error)
    throw error
  }
}

/**
 * Busca apontamentos de parada em andamento (sem hora_fim)
 * @param loteId ID do lote (obrigatório em mock)
 * @param linhaId ID da linha (opcional)
 * @returns Lista de apontamentos em andamento
 */
export async function buscarParadasEmAndamento(
  loteId?: string,
  linhaId?: string
): Promise<ApontamentoParada[]> {
  // Modo mock para desenvolvimento - usa localStorage
  if (USE_MOCK_DATA) {
    if (!loteId) {
      console.warn('⚠️ loteId é obrigatório em modo mock')
      return Promise.resolve([])
    }
    console.log('🔧 Buscando paradas em andamento do localStorage', { loteId })
    return new Promise((resolve) => {
      setTimeout(() => {
        const paradas = buscarParadasEmAndamentoLS(loteId)
        console.log(`✅ ${paradas.length} parada(s) em andamento encontrada(s)`)
        resolve(paradas as ApontamentoParada[])
      }, 200)
    })
  }

  try {
    let query = supabase
      .from('tbapontamentoparada')
      .select(`
        *,
        codigo_parada:tbcodigoparada(*),
        turno:tbturno(*),
        linha:tblinha(*)
      `)
      .is('hora_fim', null)
      .eq('deletado', 'N')
      .order('data_parada', { ascending: false })
      .order('hora_inicio', { ascending: false })

    if (linhaId) {
      query = query.eq('linha_id', linhaId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar paradas em andamento:', error)
      throw new Error(`Erro ao buscar paradas em andamento: ${error.message}`)
    }

    return (data || []) as ApontamentoParada[]
  } catch (error) {
    console.error('Erro ao buscar paradas em andamento:', error)
    throw error
  }
}

