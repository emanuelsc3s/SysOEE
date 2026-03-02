import { useState, useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Filter, Shield, RefreshCw, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataPagination } from '@/components/ui/data-pagination'
import { AppHeader } from '@/components/layout/AppHeader'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'
import { useOeeTurnoLog } from './hooks/useOeeTurnoLog'
import { StatsAuditoria } from './components/StatsAuditoria'
import { FiltrosAuditoriaBar } from './components/FiltrosAuditoria'
import type { FiltrosAuditoria } from './types/turnoLog.types'
import { FILTROS_AUDITORIA_PADRAO } from './types/turnoLog.types'

const OPCOES_PAGINA = [25, 50, 100]
const PAGINA_PADRAO = 1
const ITENS_PAGINA_PADRAO = 50

function tabelaSemPrefixo(tabela: string | null): string {
  if (!tabela) return '—'
  return tabela.replace(/^tboee_/, '')
}

function formatarDataHora(isoStr: string | null): { data: string; hora: string } {
  if (!isoStr) return { data: '—', hora: '—' }
  try {
    const date = new Date(isoStr)
    return {
      data: format(date, 'dd/MM/yyyy', { locale: ptBR }),
      hora: format(date, 'HH:mm', { locale: ptBR }),
    }
  } catch {
    return { data: isoStr, hora: '' }
  }
}

function badgeOperacao(operacao: string | null) {
  switch (operacao) {
    case 'Inclusão':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
          Inclusão
        </Badge>
      )
    case 'Alteração':
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
          Alteração
        </Badge>
      )
    case 'Exclusão':
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
          Exclusão
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary">{operacao ?? '—'}</Badge>
      )
  }
}

function renderizarLog(texto: string) {
  const partes = texto.split(/(Alterações:.*|Status:.*)/)
  if (partes.length > 1) {
    return (
      <>
        {partes[0]}
        <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-mono text-xs">
          {partes[1]}
        </span>
        {partes[2]}
      </>
    )
  }
  return texto
}

export default function OeeTurnoAuditoria() {
  const { user: authUser } = useAuth()
  const navigate = useNavigate()
  const [filtros, setFiltros] = useState<FiltrosAuditoria>(FILTROS_AUDITORIA_PADRAO)
  const [buscaInput, setBuscaInput] = useState('')
  const [pagina, setPagina] = useState(PAGINA_PADRAO)
  const [itensPorPagina, setItensPorPagina] = useState(ITENS_PAGINA_PADRAO)
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false)

  const user = {
    name: authUser?.usuario || authUser?.email?.split('@')[0] || 'Usuário',
    initials: (authUser?.usuario || authUser?.email)?.substring(0, 2).toUpperCase() || 'U',
    role: authUser?.perfil || 'Operador',
  }

  const buscaDebounced = useDebounce(buscaInput, 400)

  const filtrosComBusca = useMemo<FiltrosAuditoria>(
    () => ({
      ...filtros,
      busca: buscaDebounced,
    }),
    [filtros, buscaDebounced]
  )

  const {
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
  } = useOeeTurnoLog(filtrosComBusca, pagina, itensPorPagina)

  const handleFiltroChange = useCallback((campo: keyof FiltrosAuditoria, valor: string) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
    setPagina(1)
  }, [])

  const handleBuscaChange = useCallback((valor: string) => {
    setBuscaInput(valor)
    setPagina(1)
  }, [])

  const handleLimparFiltros = useCallback(() => {
    setFiltros(FILTROS_AUDITORIA_PADRAO)
    setBuscaInput('')
    setPagina(1)
  }, [])

  const handlePaginaChange = useCallback((novaPagina: number) => {
    setPagina(novaPagina)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleItensPorPaginaChange = useCallback((novosTamanho: number) => {
    setItensPorPagina(novosTamanho)
    setPagina(1)
  }, [])

  const ultimaAtualizacaoMaisRecente = useMemo(
    () => logs[0]?.created_at ?? null,
    [logs]
  )

  return (
    <>
      <AppHeader
        title="SICFAR OEE - Apontamentos por Turno"
        userName={user.name}
        userInitials={user.initials}
        userRole={user.role}
      />

      <div className="min-h-screen bg-background">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

          {/* Cabeçalho */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-primary/10">
                <Shield className="h-6 w-6 text-brand-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Trilha de Auditoria OEE</h1>
                <p className="text-sm text-muted-foreground">
                  Registro de operações conforme padrão ALCOA+
                </p>
              </div>
            </div>
            <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:items-center">
              <Button
                variant="outline"
                className="flex w-full items-center justify-center gap-2 !bg-white !text-brand-primary !border-brand-primary hover:!bg-gray-50 hover:!border-brand-primary hover:!text-brand-primary min-h-11 sm:min-h-10 px-4"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <Button
                variant="outline"
                className="flex w-full items-center justify-center gap-2 !bg-white !text-brand-primary !border-brand-primary hover:!bg-gray-50 hover:!border-brand-primary hover:!text-brand-primary min-h-11 sm:min-h-10 px-4"
                onClick={() => setFiltrosVisiveis((prev) => !prev)}
              >
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
              <Button
                variant="outline"
                onClick={recarregar}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 !bg-brand-primary !text-white !border-brand-primary hover:!bg-brand-primary/90 hover:!border-brand-primary/90 hover:!text-white min-h-11 sm:min-h-10 px-4"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Cards de estatísticas */}
          <StatsAuditoria
            stats={stats}
            loading={loading}
            ultimaAtualizacao={ultimaAtualizacaoMaisRecente}
          />

          {/* Filtros */}
          {filtrosVisiveis && (
            <FiltrosAuditoriaBar
              filtros={filtros}
              buscaInput={buscaInput}
              onBuscaChange={handleBuscaChange}
              onFiltroChange={handleFiltroChange}
              onLimpar={handleLimparFiltros}
              operacoesDisponiveis={operacoesDisponiveis}
              tabelasDisponiveis={tabelasDisponiveis}
              usuariosDisponiveis={usuariosDisponiveis}
            />
          )}

          {/* Tabela de logs */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {/* Erro */}
            {erro && !loading && (
              <div className="p-8 text-center text-destructive text-sm">{erro}</div>
            )}

            {/* Tabela */}
            {!erro && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                        Data / Hora
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                        Operação
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                        Tabela
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                        Reg. ID
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                        Responsável
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Descrição do Log
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Carregando registros...
                          </div>
                        </td>
                      </tr>
                    )}

                    {!loading && logs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                          Nenhum registro encontrado para os filtros selecionados.
                        </td>
                      </tr>
                    )}

                    {!loading &&
                      logs.map((log) => {
                        const { data, hora } = formatarDataHora(log.created_at)
                        return (
                          <tr
                            key={log.oeeturnolog_id}
                            className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                          >
                            {/* Data/Hora */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="font-medium text-foreground">{data}</div>
                              <div className="text-xs text-muted-foreground">{hora}</div>
                            </td>

                            {/* Operação */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              {badgeOperacao(log.operacao)}
                            </td>

                            {/* Tabela */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="font-mono text-xs bg-muted px-2 py-1 rounded border border-border text-muted-foreground">
                                {tabelaSemPrefixo(log.tabela)}
                              </span>
                            </td>

                            {/* Registro ID */}
                            <td className="px-4 py-3 whitespace-nowrap font-mono text-amber-600 font-semibold">
                              {log.registro_id != null ? `#${log.registro_id}` : '—'}
                            </td>

                            {/* Responsável */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0">
                                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                                <span className="text-sm text-foreground">{log.usuario_nome}</span>
                              </div>
                            </td>

                            {/* Log */}
                            <td className="px-4 py-3 max-w-[400px] leading-relaxed text-foreground">
                              {renderizarLog(log.log)}
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Paginação */}
            {!erro && totalItens > 0 && (
              <DataPagination
                currentPage={pagina}
                totalPages={totalPaginas}
                onPageChange={handlePaginaChange}
                itemsPerPage={itensPorPagina}
                totalItems={totalItens}
                showInfo
                pageSizeOptions={OPCOES_PAGINA}
                onItemsPerPageChange={handleItensPorPaginaChange}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
