import { Fragment, type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataPagination } from '@/components/ui/data-pagination'
import type { LinhaAgrupada } from '../types'
import { formatarMinutos, formatarQuantidade, formatarStatus, getBadgeStatus } from '../utils/formatters'

type ResumoDetalhamentoTableProps = {
  linhas: LinhaAgrupada[]
  linhasExpandidas: Set<string>
  onAlternarLinha: (id: string) => void
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
      <thead className="bg-gray-50 sticky top-0 z-10">
        <tr className="border-b border-gray-200">
          <th className="bg-gray-50 w-10 px-4 md:px-6 py-3"></th>
          <th className="bg-gray-50 px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Linha / Produto</th>
          <th className="bg-gray-50 px-4 md:px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
          <th className="bg-gray-50 px-4 md:px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Turnos</th>
          <th className="bg-gray-50 px-4 md:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Produção</th>
          <th className="bg-gray-50 px-4 md:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Perdas</th>
          <th className="bg-gray-50 px-4 md:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Unid. boas</th>
          <th className="bg-gray-50 px-4 md:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Paradas</th>
          <th className="bg-gray-50 px-4 md:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Par. totais</th>
          <th className="bg-gray-50 px-4 md:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Par. estratég.</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-200">
        {!parametrosValidos && !carregando && (
          <tr>
            <td colSpan={10} className="px-4 py-12 text-center text-sm text-gray-500">
              Informe um período válido para carregar os dados.
            </td>
          </tr>
        )}

        {exibirSemDados && (
          <tr>
            <td colSpan={10} className="px-4 py-12 text-center text-sm text-gray-500">
              Nenhum dado encontrado para o período informado.
            </td>
          </tr>
        )}

        {linhasPaginadas.map((linha) => {
          const expandida = linhasExpandidas.has(linha.id)

          return (
            <Fragment key={`linha-${linha.id}`}>
              <tr
                className="cursor-pointer bg-gray-50/60 transition-colors hover:bg-gray-100"
                onClick={() => onAlternarLinha(linha.id)}
              >
                <td className="px-4 py-3 text-center">
                  {expandida ? (
                    <ChevronDown className="mx-auto h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="mx-auto h-4 w-4 text-gray-500" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900">{linha.linha}</span>
                    <span className="text-[10px] text-gray-500">Total de {linha.produtos.length} produto{linha.produtos.length !== 1 ? 's' : ''}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge
                    variant={getBadgeStatus(linha.status)}
                    className="px-2 py-0.5 text-[10px] font-bold"
                  >
                    {formatarStatus(linha.status)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center text-xs text-gray-900">{linha.qtdeTurnos}</td>
                <td className="px-4 py-3 text-right text-xs font-bold text-gray-900">{formatarQuantidade(linha.quantidade)}</td>
                <td className="px-4 py-3 text-right text-xs font-bold text-red-600">{formatarQuantidade(linha.perdas)}</td>
                <td className="px-4 py-3 text-right text-xs font-bold text-emerald-600">{formatarQuantidade(linha.unidadesBoas)}</td>
                <td className="px-4 py-3 text-right text-xs text-gray-600">{formatarMinutos(linha.paradas)}</td>
                <td className="px-4 py-3 text-right text-xs font-medium text-gray-600">{formatarMinutos(linha.paradasTotais)}</td>
                <td className="px-4 py-3 text-right text-xs text-gray-600">{formatarMinutos(linha.paradasEstrategicas)}</td>
              </tr>

              {expandida &&
                linha.produtos.map((produto) => (
                  <tr
                    key={`produto-${linha.id}-${produto.id}`}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="border-r border-gray-100 px-4 py-3"></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="max-w-[280px] truncate text-xs text-gray-900" title={produto.produto}>
                          {produto.produto}
                        </span>
                        <span className="text-[10px] text-gray-500">Cód. {produto.produtoId ?? '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">-</td>
                    <td className="px-4 py-3 text-center text-xs text-gray-900">{produto.qtdeTurnos}</td>
                    <td className="px-4 py-3 text-right text-xs text-gray-700">{formatarQuantidade(produto.quantidade)}</td>
                    <td className="px-4 py-3 text-right text-xs text-red-500">{formatarQuantidade(produto.perdas)}</td>
                    <td className="px-4 py-3 text-right text-xs text-emerald-500">{formatarQuantidade(produto.unidadesBoas)}</td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500">{formatarMinutos(produto.paradas)}</td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500">{formatarMinutos(produto.paradasTotais)}</td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500">{formatarMinutos(produto.paradasEstrategicas)}</td>
                  </tr>
                ))}
            </Fragment>
          )
        })}
      </tbody>
    </table>
  )

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden mb-6">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 leading-tight">Lista de Apontamentos</h2>
            <p className="text-sm text-gray-500">
              Total de {totalItems} apontamento{totalItems !== 1 ? 's' : ''} encontrados
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end md:self-center">
            <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 sm:hidden">
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
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando...
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 flex flex-col">
        {toolbar}

        <div className="relative">
          <div className="sm:hidden relative overflow-auto rounded-lg border border-gray-200 mb-4">
            {renderTabela('w-full min-w-[1060px] table-auto')}
          </div>

          <div
            className="hidden sm:block relative overflow-auto rounded-lg border border-gray-200"
            style={{ maxHeight: '60vh' }}
          >
            {renderTabela('w-full table-auto')}
          </div>
        </div>
      </div>

      <div className="sm:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            Mostrando {inicioFaixaItens} a {fimFaixaItens} de {totalItems}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Por página</span>
            <select
              value={String(itemsPerPage)}
              className="h-9 rounded-md border border-gray-200 bg-white px-2.5 text-xs text-gray-700"
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
        <p className="text-center text-xs text-gray-500">
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
