/**
 * Serviço de armazenamento de paradas no localStorage
 * Usado para validação antes de integrar com Supabase
 */

import { ApontamentoParada } from '@/types/parada'

const STORAGE_KEY = 'sysoee_paradas'

/**
 * Interface para parada armazenada no localStorage
 */
export interface ParadaLocalStorage extends Omit<ApontamentoParada, 'id'> {
  id: string
  oeeturno_id?: number | null
}

/**
 * Busca todas as paradas do localStorage
 */
export function buscarTodasParadas(): ParadaLocalStorage[] {
  try {
    const dados = localStorage.getItem(STORAGE_KEY)
    if (!dados) return []
    return JSON.parse(dados)
  } catch (error) {
    console.error('❌ Erro ao buscar paradas do localStorage:', error)
    return []
  }
}

/**
 * Busca paradas em andamento (hora_fim = null) de um lote
 */
export function buscarParadasEmAndamento(loteId: string): ParadaLocalStorage[] {
  const todasParadas = buscarTodasParadas()
  return todasParadas.filter(
    p => p.lote_id === loteId && p.hora_fim === null
  )
}

/**
 * Busca paradas finalizadas de um lote
 */
export function buscarParadasFinalizadas(loteId: string): ParadaLocalStorage[] {
  const todasParadas = buscarTodasParadas()
  return todasParadas.filter(
    p => p.lote_id === loteId && p.hora_fim !== null
  )
}

/**
 * Busca todas as paradas de um lote (ativas + finalizadas)
 */
export function buscarParadasPorLote(loteId: string): ParadaLocalStorage[] {
  const todasParadas = buscarTodasParadas()
  return todasParadas.filter(p => p.lote_id === loteId)
}

/**
 * Busca todas as paradas de uma linha de produção
 * Usado para cálculo de OEE da linha (independente de lote, data ou turno)
 */
export function buscarParadasPorLinha(linhaId: string): ParadaLocalStorage[] {
  const todasParadas = buscarTodasParadas()
  return todasParadas.filter(p => p.linha_id === linhaId)
}

/**
 * Busca todas as paradas de um turno OEE específico
 * Usado para cálculo de OEE por oeeturno_id
 */
export function buscarParadasPorOeeTurno(oeeturnoId: number): ParadaLocalStorage[] {
  const todasParadas = buscarTodasParadas()
  return todasParadas.filter(p => p.oeeturno_id === oeeturnoId)
}

/**
 * Busca uma parada específica por ID
 */
export function buscarParadaPorId(id: string): ParadaLocalStorage | null {
  const todasParadas = buscarTodasParadas()
  return todasParadas.find(p => p.id === id) || null
}

/**
 * Salva uma nova parada no localStorage
 */
export function salvarParada(parada: ParadaLocalStorage): ParadaLocalStorage {
  try {
    const todasParadas = buscarTodasParadas()
    todasParadas.push(parada)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todasParadas))
    console.log('✅ Parada salva no localStorage:', parada)
    return parada
  } catch (error) {
    console.error('❌ Erro ao salvar parada no localStorage:', error)
    throw error
  }
}

/**
 * Atualiza uma parada existente no localStorage
 */
export function atualizarParada(id: string, dadosAtualizacao: Partial<ParadaLocalStorage>): ParadaLocalStorage | null {
  try {
    const todasParadas = buscarTodasParadas()
    const index = todasParadas.findIndex(p => p.id === id)
    
    if (index === -1) {
      console.error('❌ Parada não encontrada:', id)
      return null
    }

    // Atualiza a parada
    todasParadas[index] = {
      ...todasParadas[index],
      ...dadosAtualizacao,
      updated_at: new Date().toISOString(),
    }

    // Calcula duração se hora_fim foi definida
    if (dadosAtualizacao.hora_fim && todasParadas[index].hora_inicio) {
      const duracao = calcularDuracaoMinutos(
        todasParadas[index].hora_inicio,
        dadosAtualizacao.hora_fim
      )
      todasParadas[index].duracao_minutos = duracao
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(todasParadas))
    console.log('✅ Parada atualizada no localStorage:', todasParadas[index])
    return todasParadas[index]
  } catch (error) {
    console.error('❌ Erro ao atualizar parada no localStorage:', error)
    throw error
  }
}

/**
 * Finaliza uma parada (registra hora_fim)
 */
export function finalizarParada(id: string, horaFim: string, usuarioId: number): ParadaLocalStorage | null {
  return atualizarParada(id, {
    hora_fim: horaFim,
    updated_by: usuarioId,
  })
}

/**
 * Remove uma parada do localStorage (soft delete)
 */
export function removerParada(id: string, usuarioId: number): boolean {
  try {
    const parada = atualizarParada(id, {
      deleted_at: new Date().toISOString(),
      deleted_by: usuarioId,
    })
    return parada !== null
  } catch (error) {
    console.error('❌ Erro ao remover parada do localStorage:', error)
    return false
  }
}

/**
 * Exclui permanentemente uma parada do localStorage (hard delete)
 * Usado quando o usuário exclui um registro de parada do histórico
 */
export function excluirParada(id: string): boolean {
  try {
    const todasParadas = buscarTodasParadas()
    const paradasFiltradas = todasParadas.filter(p => p.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(paradasFiltradas))
    console.log('✅ Parada excluída permanentemente do localStorage:', id)
    return true
  } catch (error) {
    console.error('❌ Erro ao excluir parada do localStorage:', error)
    return false
  }
}

/**
 * Calcula duração em minutos entre duas horas (formato HH:MM:SS ou HH:MM)
 */
function calcularDuracaoMinutos(horaInicio: string, horaFim: string): number {
  try {
    const [hInicio, mInicio, sInicio = 0] = horaInicio.split(':').map(Number)
    const [hFim, mFim, sFim = 0] = horaFim.split(':').map(Number)

    const minutosInicio = hInicio * 60 + mInicio + sInicio / 60
    const minutosFim = hFim * 60 + mFim + sFim / 60

    let duracao = minutosFim - minutosInicio

    // Se hora fim for menor que início, passou da meia-noite
    if (duracao < 0) {
      duracao += 24 * 60 // Adiciona 24 horas
    }

    // Retorna com precisão decimal para preservar os segundos
    return duracao
  } catch (error) {
    console.error('❌ Erro ao calcular duração:', error)
    return 0
  }
}

/**
 * Calcula tempo decorrido desde o início da parada até agora
 */
export function calcularTempoDecorrido(horaInicio: string): number {
  const agora = new Date()
  const horaAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}:${String(agora.getSeconds()).padStart(2, '0')}`
  return calcularDuracaoMinutos(horaInicio, horaAtual)
}

/**
 * Formata duração em minutos para HH:MM:SS
 */
export function formatarDuracao(minutos: number): string {
  const horas = Math.floor(minutos / 60)
  const mins = Math.floor(minutos % 60)
  const segs = Math.floor((minutos % 1) * 60)
  
  return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(segs).padStart(2, '0')}`
}

/**
 * Limpa todas as paradas do localStorage (usar com cuidado!)
 */
export function limparTodasParadas(): void {
  localStorage.removeItem(STORAGE_KEY)
  console.log('🗑️ Todas as paradas foram removidas do localStorage')
}

/**
 * Exporta paradas para JSON (para backup/debug)
 */
export function exportarParadas(): string {
  const paradas = buscarTodasParadas()
  return JSON.stringify(paradas, null, 2)
}

/**
 * Importa paradas de JSON (para restaurar backup)
 */
export function importarParadas(json: string): boolean {
  try {
    const paradas = JSON.parse(json)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(paradas))
    console.log('✅ Paradas importadas com sucesso')
    return true
  } catch (error) {
    console.error('❌ Erro ao importar paradas:', error)
    return false
  }
}

