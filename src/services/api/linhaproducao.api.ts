/**
 * API de Linhas de Produção
 * Funções para interagir com dados de linhas de produção no Supabase
 */

import { supabase } from '@/lib/supabase'
import { LinhaProducao, LinhasProducaoResponse } from '@/types/linhaproducao'

/**
 * Interface para dados brutos retornados pelo Supabase
 */
interface LinhaProducaoSupabase {
  linhaproducao_id: number
  linhaproducao: string
  tipo: string
  ativo: boolean
  departamento_id: number | null
  tbdepartamento?: {
    departamento: string
  } | null
}

/**
 * Interface para parâmetros de busca de linhas de produção
 */
export interface BuscarLinhasProducaoParams {
  /** Termo de busca */
  searchTerm?: string
  /** Página atual (1-based) */
  page?: number
  /** Itens por página */
  itemsPerPage?: number
  /** Filtrar apenas ativos */
  apenasAtivos?: boolean
  /** Filtrar por departamento */
  departamentoId?: number
  /** Filtrar por tipo */
  tipo?: string
}

/**
 * Busca linhas de produção com paginação e filtros
 * @param params - Parâmetros de busca
 * @returns Resposta paginada com linhas de produção
 */
export async function buscarLinhasProducao(
  params: BuscarLinhasProducaoParams = {}
): Promise<LinhasProducaoResponse> {
  const {
    searchTerm = '',
    page = 1,
    itemsPerPage = 25,
    apenasAtivos = true,
    departamentoId,
    tipo,
  } = params

  try {
    // Construir query base com LEFT JOIN do departamento (relação opcional)
    let query = supabase
      .from('tblinhaproducao')
      .select(
        `
        *,
        tbdepartamento!left (
          departamento
        )
      `,
        { count: 'exact' }
      )

    // Filtrar apenas não deletados
    query = query.is('deleted_at', null)

    // Filtrar apenas ativos se solicitado
    if (apenasAtivos) {
      query = query.eq('ativo', 'Sim')
    }

    // Filtrar por departamento
    if (departamentoId) {
      query = query.eq('departamento_id', departamentoId)
    }

    // Filtrar por tipo
    if (tipo) {
      query = query.eq('tipo', tipo)
    }

    // Busca por termo (nome da linha)
    if (searchTerm) {
      query = query.ilike('linhaproducao', `%${searchTerm}%`)
    }

    // Ordenar por nome
    query = query.order('linhaproducao', { ascending: true })

    // Paginação
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Erro ao buscar linhas de produção:', error)
      throw new Error(`Erro ao buscar linhas de produção: ${error.message}`)
    }

    // Debug: Log dos dados retornados
    console.log('📊 Linhas de produção retornadas:', {
      total: count,
      registros: data?.length || 0,
      filtros: { apenasAtivos, tipo, searchTerm },
      primeiraLinha: data?.[0],
    })

    // Mapear dados para incluir nome do departamento
    const linhasComDepartamento = (data || []).map((linha: LinhaProducaoSupabase): Partial<LinhaProducao> => ({
      linhaproducao_id: linha.linhaproducao_id,
      linhaproducao: linha.linhaproducao,
      tipo: linha.tipo,
      ativo: linha.ativo ? 'S' : 'N',
      departamento_id: linha.departamento_id,
      departamento: linha.tbdepartamento?.departamento || null,
      created_at: new Date().toISOString(),
      created_by: null,
      updated_at: null,
      updated_by: null,
      deleted_at: null,
      deleted_by: null,
      sync: null,
      sync_data: null,
    }))

    return {
      data: linhasComDepartamento as LinhaProducao[],
      total: count || 0,
      page,
      itemsPerPage,
    }
  } catch (error) {
    console.error('Erro ao buscar linhas de produção:', error)
    throw error
  }
}

/**
 * Busca uma linha de produção por ID
 * @param id - ID da linha de produção
 * @returns Linha de produção ou null
 */
export async function buscarLinhaProducaoPorId(
  id: number
): Promise<LinhaProducao | null> {
  try {
    const { data, error } = await supabase
      .from('tblinhaproducao')
      .select(
        `
        *,
        tbdepartamento!left (
          departamento
        )
      `
      )
      .eq('linhaproducao_id', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      console.error('Erro ao buscar linha de produção:', error)
      return null
    }

    return {
      ...data,
      departamento: data.tbdepartamento?.departamento || null,
    } as LinhaProducao
  } catch (error) {
    console.error('Erro ao buscar linha de produção:', error)
    return null
  }
}

