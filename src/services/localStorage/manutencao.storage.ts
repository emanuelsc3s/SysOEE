/**
 * Serviço de armazenamento de ordens de serviço de manutenção no localStorage
 * Padrão CRUD com soft delete seguindo o modelo de parada.storage.ts
 */

import { ManutencaoOrdemServico } from '@/types/manutencao'

const STORAGE_KEY = 'sysoee_manutencao_ordens'

/**
 * Busca todas as ordens do localStorage (excluindo deletadas)
 */
export function buscarTodasOrdens(): ManutencaoOrdemServico[] {
  try {
    const dados = localStorage.getItem(STORAGE_KEY)
    if (!dados) return []
    const todas: ManutencaoOrdemServico[] = JSON.parse(dados)
    return todas.filter(o => !o.deleted_at)
  } catch (error) {
    console.error('Erro ao buscar ordens de manutenção do localStorage:', error)
    return []
  }
}

/**
 * Busca todas as ordens incluindo deletadas (uso interno)
 */
function buscarTodasOrdensRaw(): ManutencaoOrdemServico[] {
  try {
    const dados = localStorage.getItem(STORAGE_KEY)
    if (!dados) return []
    return JSON.parse(dados)
  } catch (error) {
    console.error('Erro ao buscar ordens de manutenção do localStorage:', error)
    return []
  }
}

/**
 * Busca uma ordem por ID
 */
export function buscarOrdemPorId(id: string): ManutencaoOrdemServico | null {
  const todas = buscarTodasOrdens()
  return todas.find(o => o.id === id) || null
}

/**
 * Busca ordens por oeeturno_id
 */
export function buscarOrdensPorOeeTurno(oeeturnoId: number): ManutencaoOrdemServico[] {
  const todas = buscarTodasOrdens()
  return todas.filter(o => o.oeeturno_id === oeeturnoId)
}

/**
 * Busca ordens com filtro de texto e paginação client-side
 */
export function buscarOrdensPaginadas(
  searchTerm: string,
  filtroPrioridade: string,
  page: number,
  pageSize: number
): { data: ManutencaoOrdemServico[]; count: number } {
  let ordens = buscarTodasOrdens()

  // Ordenar por data de criação mais recente
  ordens.sort((a, b) => {
    const dataA = new Date(a.created_at).getTime()
    const dataB = new Date(b.created_at).getTime()
    return dataB - dataA
  })

  // Filtrar por prioridade
  if (filtroPrioridade) {
    ordens = ordens.filter(o => o.prioridade === filtroPrioridade)
  }

  // Filtrar por texto
  if (searchTerm) {
    const termo = searchTerm.toLowerCase()
    ordens = ordens.filter(o =>
      o.descricao_manutencao.toLowerCase().includes(termo) ||
      o.observacao.toLowerCase().includes(termo) ||
      o.linha_nome.toLowerCase().includes(termo) ||
      o.sku_codigo.toLowerCase().includes(termo) ||
      o.departamento.toLowerCase().includes(termo) ||
      o.centro_custo.toLowerCase().includes(termo) ||
      o.produto_descricao.toLowerCase().includes(termo)
    )
  }

  const count = ordens.length
  const start = (page - 1) * pageSize
  const data = ordens.slice(start, start + pageSize)

  return { data, count }
}

/**
 * Salva uma nova ordem no localStorage
 */
export function salvarOrdem(ordem: ManutencaoOrdemServico): ManutencaoOrdemServico {
  try {
    const todas = buscarTodasOrdensRaw()
    todas.push(ordem)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todas))
    return ordem
  } catch (error) {
    console.error('Erro ao salvar ordem de manutenção no localStorage:', error)
    throw error
  }
}

/**
 * Atualiza uma ordem existente no localStorage
 */
export function atualizarOrdem(
  id: string,
  dadosAtualizacao: Partial<ManutencaoOrdemServico>
): ManutencaoOrdemServico | null {
  try {
    const todas = buscarTodasOrdensRaw()
    const index = todas.findIndex(o => o.id === id)

    if (index === -1) {
      console.error('Ordem de manutenção não encontrada:', id)
      return null
    }

    todas[index] = {
      ...todas[index],
      ...dadosAtualizacao,
      updated_at: new Date().toISOString(),
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(todas))
    return todas[index]
  } catch (error) {
    console.error('Erro ao atualizar ordem de manutenção no localStorage:', error)
    throw error
  }
}

/**
 * Exclui permanentemente uma ordem do localStorage (hard delete)
 */
export function excluirOrdem(id: string): boolean {
  try {
    const todas = buscarTodasOrdensRaw()
    const filtradas = todas.filter(o => o.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtradas))
    return true
  } catch (error) {
    console.error('Erro ao excluir ordem de manutenção do localStorage:', error)
    return false
  }
}
