import { Fragment, type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataPagination } from '@/components/ui/data-pagination'
import type { LinhaAgrupada } from '../types'
import { formatarDataExibicao } from '../utils/date'
import { formatarMinutos, formatarQuantidade, formatarStatus, getBadgeStatus } from '../utils/formatters'

type ResumoDetalhamentoTableProps = {
  linhas: LinhaAgrupada[]
  linhasExpandidas: Set<string>
  onAlternarLinha: (id: string) => void
  onAlternarTodasLinhas: () => void
  parametrosValidos: boolean
  carregando: boolean
  atualizando?: boolean
  toolbar?: ReactNode
}

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const

export function ResumoDetalhamentoTable({
  linhas,
  linhasExpandidas,
  onAlternarLinha,
  onAlternarTodasLinhas,
  parametrosValidos,
  carregando,
  atualizando = false,
  toolbar,
}: ResumoDetalhamentoTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(25)
  const paginationRef = useRef<HTMLDivElement | null>(null)

  const totalItems = linhas.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const totalPagesValidas = Math.max(totalPages, 1)
  const paginaAtualExibida = Math.min(currentPage, totalPagesValidas)
  const inicioFaixaItens = totalItems === 0 ? 0 : (paginaAtualExibida - 1) * itemsPerPage + 1
  const fimFaixaItens = totalItems === 0 ? 0 : Math.min(paginaAtualExibida * itemsPerPage, totalItems)
  const exibirSemDados = parametrosValidos && !carregando && totalItems === 0
  const todasExpandidas = useMemo(() => {
    if (linhas.length === 0) {
      return false
    }
    return linhas.every((linha) => linhasExpandidas.has(linha.id))
  }, [linhas, linhasExpandidas])
  const temLinhas = linhas.length > 0

  useEffect(() => {
    setCurrentPage(1)
  }, [linhas])

  useEffect(() => {
    if (currentPage <= totalPagesValidas) {
      return
    }
    setCurrentPage(totalPagesValidas)
  }, [currentPage, totalPagesValidas])

  const linhasPaginadas = useMemo(() => {
    const inicio = (paginaAtualExibida - 1) * itemsPerPage
    return linhas.slice(inicio, inicio + itemsPerPage)
  }, [linhas, paginaAtualExibida, itemsPerPage])

  const handlePageChange = (page: number) => {
    const next = Math.max(1, Math.min(page, totalPagesValidas))
    setCurrentPage(next)
  }

  const handleItemsPerPageChange = (size: number) => {
    if (!Number.isFinite(size) || size <= 0) {
      return
    }
    setItemsPerPage(size)
    setCurrentPage(1)
  }

  const renderTabela = (tableClassName: string) => (
    <table className={tableClassName}>
      <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
        <tr className="border-b border-gray-200">
          <th scope="col" className="w-12 bg-slate-50/95 px-4 py-3 md:px-6">
            <div className="flex items-center justify-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onAlternarTodasLinhas}
                className="h-8 w-8 text-gray-500 hover:bg-white hover:text-gray-700"
                aria-expanded={todasExpandidas}
                aria-label={todasExpandidas ? 'Recolher todas as linhas' : 'Expandir todas as linhas'}
                title={todasExpandidas ? 'Recolher todas as linhas' : 'Expandir todas as linhas'}
                disabled={!temLinhas}
              >
                {todasExpandidas ? (
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>
          </th>
          <th scope="col" className="bg-slate-50/95 px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.08em] text-gray-500 md:px-6">
            Linha / Turno
          </th>
          <th scope="col" className="bg-slate-50/95 px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.08em] text-gray-500 md:px-6">
            Status
          </th>
          <th scope="col" className="bg-slate-50/95 px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.08em] text-gray-500 md:px-6">
            Turnos
          </th>
          <th scope="col" className="bg-slate-50/95 px-4 py-3 text-right text-sm font-semibold uppercase tracking-[0.08em] text-gray-500 md:px-6">
            Qtd. envase
          </th>
          <th scope="col" className="bg-slate-50/95 px-4 py-3 text-right text-sm font-semibold uppercase tracking-[0.08em] text-gray-500 md:px-6">
            Qtd. embalagem
          </th>
          <th scope="col" className="bg-slate-50/95 px-4 py-3 text-right text-sm font-semibold uppercase tracking-[0.08em] text-gray-500 md:px-6">
            Perdas
          </th>
          <th scope="col" className="bg-slate-50/95 px-4 py-3 text-right text-sm font-semibold uppercase tracking-[0.08em] text-gray-500 md:px-6">
            Unid. boas
          </th>
          <th scope="col" className="bg-slate-50/95 px-4 py-3 text-right text-sm font-semibold uppercase tracking-[0.08em] text-gray-500 md:px-6">
            Paradas
          </th>
          <th scope="col" className="bg-slate-50/95 px-4 py-3 text-right text-sm font-semibold uppercase tracking-[0.08em] text-gray-500 md:px-6">
            Par. totais
          </th>
          <th scope="col" className="bg-slate-50/95 px-4 py-3 text-right text-sm font-semibold uppercase tracking-[0.08em] text-gray-500 md:px-6">
            Par. estratég.
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-200">
        {!parametrosValidos && !carregando && (
          <tr>
            <td colSpan={11} className="px-4 py-12 text-center text-sm text-gray-500">
              Informe um período válido para carregar os dados.
            </td>
          </tr>
        )}

        {exibirSemDados && (
          <tr>
            <td colSpan={11} className="px-4 py-12 text-center text-sm text-gray-500">
              Nenhum dado encontrado para o período informado.
            </td>
          </tr>
        )}

        {linhasPaginadas.map((linha) => {
          const expandida = linhasExpandidas.has(linha.id)

          return (
            <Fragment key={`linha-${linha.id}`}>
              <tr className="bg-slate-50/70 transition-colors hover:bg-slate-100/70">
                <td className="px-4 py-3 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onAlternarLinha(linha.id)}
                    className="h-8 w-8 text-gray-500 hover:bg-white hover:text-gray-700"
                    aria-expanded={expandida}
                    aria-label={expandida ? `Recolher linha ${linha.linha}` : `Expandir linha ${linha.linha}`}
                  >
                    {expandida ? (
                      <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    )}
                  </Button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">{linha.linha}</span>
                    <span className="text-sm text-gray-500">
                      Total de {linha.qtdeTurnos} turno{linha.qtdeTurnos !== 1 ? 's' : ''}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge
                    variant={getBadgeStatus(linha.status)}
                    className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  >
                    {formatarStatus(linha.status)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center text-sm tabular-nums text-gray-900">{linha.qtdeTurnos}</td>
                <td className="px-4 py-3 text-right text-sm font-bold tabular-nums text-slate-700">{formatarQuantidade(linha.qtdEnvase)}</td>
                <td className="px-4 py-3 text-right text-sm font-bold tabular-nums text-indigo-600">{formatarQuantidade(linha.qtdEmbalagem)}</td>
                <td className="px-4 py-3 text-right text-sm font-bold tabular-nums text-red-600">{formatarQuantidade(linha.perdas)}</td>
                <td className="px-4 py-3 text-right text-sm font-bold tabular-nums text-emerald-600">{formatarQuantidade(linha.unidadesBoas)}</td>
                <td className="px-4 py-3 text-right text-sm tabular-nums text-gray-600">{formatarMinutos(linha.paradas)}</td>
                <td className="px-4 py-3 text-right text-sm font-medium tabular-nums text-gray-600">{formatarMinutos(linha.paradasTotais)}</td>
                <td className="px-4 py-3 text-right text-sm tabular-nums text-gray-600">{formatarMinutos(linha.paradasEstrategicas)}</td>
              </tr>

              {expandida &&
                linha.turnos.map((turno) => (
                  <tr
                    key={`turno-${linha.id}-${turno.id}`}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    <td className="border-r border-gray-100 px-4 py-3"></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">
                          {turno.oeeturnoId !== null ? (
                            <>
                              Lançamento: <strong className="font-semibold">[{turno.oeeturnoId}]</strong>
                            </>
                          ) : (
                            'Lançamento não informado'
                          )}
                        </span>
                        <span className="text-sm text-gray-900">
                          {formatarDataExibicao(turno.data)} -{' '}
                          {turno.produtos.length > 0 ? turno.produtos.join(', ') : 'Produto não informado'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={getBadgeStatus(turno.status)}
                        className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                      >
                        {formatarStatus(turno.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center text-sm tabular-nums text-gray-900">{turno.qtdeTurnos}</td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-slate-700">{formatarQuantidade(turno.qtdEnvase)}</td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-indigo-500">{formatarQuantidade(turno.qtdEmbalagem)}</td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-red-500">{formatarQuantidade(turno.perdas)}</td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-emerald-500">{formatarQuantidade(turno.unidadesBoas)}</td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-gray-500">{formatarMinutos(turno.paradas)}</td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-gray-500">{formatarMinutos(turno.paradasTotais)}</td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-gray-500">{formatarMinutos(turno.paradasEstrategicas)}</td>
                  </tr>
                ))}
            </Fragment>
          )
        })}
      </tbody>
    </table>
  )

  return (
    <section className="mb-6 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_14px_30px_-28px_rgba(15,23,42,0.55)]">
      <div className="border-b border-gray-200 bg-gradient-to-r from-white to-slate-50/80 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
          <div>
            <h2 className="text-base font-semibold leading-tight text-gray-700 sm:text-lg">Lista de Apontamentos</h2>
            <p className="mt-1 text-sm text-gray-500">
              Total de {totalItems} apontamento{totalItems !== 1 ? 's' : ''} encontrados
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end md:self-center">
            <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium tabular-nums text-gray-600 sm:hidden">
              Página {paginaAtualExibida} de {totalPagesValidas}
            </div>
            <div className="hidden sm:flex sm:items-center sm:gap-3 sm:flex-wrap md:justify-end">
              <DataPagination
                currentPage={paginaAtualExibida}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                showInfo={false}
                className="!border-0 !bg-transparent !px-0 !py-0 !justify-end"
              />
            </div>
            {atualizando && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Carregando…
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col px-4 py-4 sm:px-6">
        {toolbar}

        <div className="relative">
          <div className="relative mb-4 overflow-auto rounded-lg border border-gray-200 sm:hidden">
            {renderTabela('w-full min-w-[1180px] table-auto')}
          </div>

          <div
            className="relative hidden overflow-auto rounded-lg border border-gray-200 sm:block"
            style={{ maxHeight: '60vh' }}
          >
            {renderTabela('w-full table-auto')}
          </div>
        </div>
      </div>

      <div className="space-y-3 border-t border-gray-200 bg-white px-4 py-4 sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm tabular-nums text-gray-600">
            Mostrando {inicioFaixaItens} a {fimFaixaItens} de {totalItems}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Por página</span>
            <select
              name="itens_por_pagina_mobile"
              value={String(itemsPerPage)}
              className="h-9 rounded-md border border-gray-200 bg-white px-2.5 text-sm text-gray-700"
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-10"
            onClick={() => handlePageChange(paginaAtualExibida - 1)}
            disabled={paginaAtualExibida <= 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            className="h-10"
            onClick={() => handlePageChange(paginaAtualExibida + 1)}
            disabled={paginaAtualExibida >= totalPagesValidas}
          >
            Próxima
          </Button>
        </div>
        <p className="text-center text-sm tabular-nums text-gray-500">
          Página {paginaAtualExibida} de {totalPagesValidas}
        </p>
      </div>

      <div className="hidden sm:block">
        <DataPagination
          containerRef={paginationRef}
          currentPage={paginaAtualExibida}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          showInfo
          pageSizeOptions={PAGE_SIZE_OPTIONS as unknown as number[]}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </section>
  )
}
