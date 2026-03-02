import { useState, useEffect, useCallback } from 'react'
import { supabase, handleSupabaseError } from '@/lib/supabase'
import type {
  TurnoLogComUsuario,
  FiltrosAuditoria,
  UsuarioAuditoria,
  StatsOperacoes,
} from '../types/turnoLog.types'

const ITENS_POR_PAGINA_PADRAO = 50

interface UseOeeTurnoLogReturn {
  logs: TurnoLogComUsuario[]
  totalItens: number
  totalPaginas: number
  loading: boolean
  erro: string | null
  stats: StatsOperacoes
  usuariosDisponiveis: UsuarioAuditoria[]
  operacoesDisponiveis: string[]
  tabelasDisponiveis: string[]
  recarregar: () => void
}

export function useOeeTurnoLog(
  filtros: FiltrosAuditoria,
  pagina: number,
  itensPorPagina: number = ITENS_POR_PAGINA_PADRAO
): UseOeeTurnoLogReturn {
  const [logs, setLogs] = useState<TurnoLogComUsuario[]>([])
  const [totalItens, setTotalItens] = useState(0)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState<UsuarioAuditoria[]>([])
  const [operacoesDisponiveis, setOperacoesDisponiveis] = useState<string[]>([])
  const [tabelasDisponiveis, setTabelasDisponiveis] = useState<string[]>([])
  const [stats, setStats] = useState<StatsOperacoes>({ inclusoes: 0, alteracoes: 0, exclusoes: 0 })
  const [versao, setVersao] = useState(0)
  const busca = filtros.busca.trim()
  const operacao = filtros.operacao
  const tabela = filtros.tabela
  const createdBy = filtros.createdBy
  const dataInicio = filtros.dataInicio
  const dataFim = filtros.dataFim

  const recarregar = useCallback(() => setVersao((v) => v + 1), [])

  // Buscar lista de usuários e valores distintos de operação/tabela (uma única vez)
  useEffect(() => {
    async function buscarMetadados() {
      const [{ data: dadosUsuarios }, { data: dadosOps }, { data: dadosTabelas }] =
        await Promise.all([
          supabase
            .from('tbusuario')
            .select('user_id, usuario, login')
            .eq('deletado', 'N')
            .order('usuario', { ascending: true }),
          supabase
            .from('tboee_turno_log')
            .select('operacao')
            .not('operacao', 'is', null),
          supabase
            .from('tboee_turno_log')
            .select('tabela')
            .not('tabela', 'is', null),
        ])

      if (dadosUsuarios) {
        setUsuariosDisponiveis(
          dadosUsuarios
            .filter((u) => u.user_id)
            .map((u) => ({
              user_id: u.user_id as string,
              nome: (u.usuario || u.login || u.user_id) as string,
            }))
        )
      }

      if (dadosOps) {
        const ops = [...new Set(dadosOps.map((r) => r.operacao).filter(Boolean))] as string[]
        setOperacoesDisponiveis(ops.sort())
      }

      if (dadosTabelas) {
        const tabs = [...new Set(dadosTabelas.map((r) => r.tabela).filter(Boolean))] as string[]
        setTabelasDisponiveis(tabs.sort())
      }
    }

    buscarMetadados()
  }, [])

  // Buscar logs com filtros e paginação
  useEffect(() => {
    let cancelado = false

    async function buscarLogs() {
      setLoading(true)
      setErro(null)

      try {
        const from = (pagina - 1) * itensPorPagina
        const to = from + itensPorPagina - 1

        let query = supabase
          .from('tboee_turno_log')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to)

        if (operacao) {
          query = query.eq('operacao', operacao)
        }
        if (tabela) {
          query = query.eq('tabela', tabela)
        }
        if (createdBy) {
          query = query.eq('created_by', createdBy)
        }
        if (dataInicio) {
          query = query.gte('created_at', `${dataInicio}T00:00:00`)
        }
        if (dataFim) {
          query = query.lte('created_at', `${dataFim}T23:59:59`)
        }
        if (busca) {
          query = query.or(
            `log.ilike.%${busca}%,tabela.ilike.%${busca}%`
          )
        }

        const { data, error, count } = await query

        if (cancelado) return
        if (error) throw error

        const total = count ?? 0
        setTotalItens(total)

        if (!data || data.length === 0) {
          setLogs([])
          setStats({ inclusoes: 0, alteracoes: 0, exclusoes: 0 })
          return
        }

        // Resolver nomes de usuários
        const uuidsUnicos = [...new Set(data.map((r) => r.created_by).filter(Boolean))] as string[]
        const mapaUsuarios = new Map<string, string>()

        if (uuidsUnicos.length > 0) {
          const { data: dadosUsuarios } = await supabase
            .from('tbusuario')
            .select('user_id, usuario, login')
            .in('user_id', uuidsUnicos)

          if (dadosUsuarios) {
            for (const u of dadosUsuarios) {
              if (u.user_id) {
                mapaUsuarios.set(u.user_id, u.usuario || u.login || u.user_id)
              }
            }
          }
        }

        const logsEnriquecidos: TurnoLogComUsuario[] = data.map((r) => ({
          ...r,
          usuario_nome: r.created_by ? (mapaUsuarios.get(r.created_by) ?? r.created_by.slice(0, 8)) : '—',
        }))

        // Calcular stats a partir da página atual (aproximado; suficiente para UX)
        const statsCalculado: StatsOperacoes = {
          inclusoes: logsEnriquecidos.filter((l) => l.operacao === 'Inclusão').length,
          alteracoes: logsEnriquecidos.filter((l) => l.operacao === 'Alteração').length,
          exclusoes: logsEnriquecidos.filter((l) => l.operacao === 'Exclusão').length,
        }

        setLogs(logsEnriquecidos)
        setStats(statsCalculado)
      } catch (err) {
        if (!cancelado) {
          setErro(handleSupabaseError(err))
        }
      } finally {
        if (!cancelado) {
          setLoading(false)
        }
      }
    }

    buscarLogs()

    return () => {
      cancelado = true
    }
  }, [busca, operacao, tabela, createdBy, dataInicio, dataFim, pagina, itensPorPagina, versao])

  const totalPaginas = Math.max(1, Math.ceil(totalItens / itensPorPagina))

  return {
    logs,
    totalItens,
    totalPaginas,
    loading,
    erro,
    stats,
    usuariosDisponiveis,
    operacoesDisponiveis,
    tabelasDisponiveis,
    recarregar,
  }
}
