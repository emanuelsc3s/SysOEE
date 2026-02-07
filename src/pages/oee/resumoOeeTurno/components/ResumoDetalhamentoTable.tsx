import { Fragment } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import type { LinhaAgrupada } from '../types'
import { formatarMinutos, formatarQuantidade, formatarStatus, getBadgeStatus } from '../utils/formatters'

type ResumoDetalhamentoTableProps = {
  linhas: LinhaAgrupada[]
  linhasExpandidas: Set<string>
  onAlternarLinha: (id: string) => void
  parametrosValidos: boolean
  carregando: boolean
}

export function ResumoDetalhamentoTable({
  linhas,
  linhasExpandidas,
  onAlternarLinha,
  parametrosValidos,
  carregando,
}: ResumoDetalhamentoTableProps) {
  const exibirSemDados = parametrosValidos && !carregando && linhas.length === 0

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-5">
        <h2 className="text-base font-bold text-gray-900">Detalhamento por linha e produto</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1060px] text-left whitespace-nowrap">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="w-10 px-4 py-3"></th>
              <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Linha / Produto</th>
              <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500">Turnos</th>
              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500">Produção</th>
              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500">Perdas</th>
              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500">Unid. boas</th>
              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500">Paradas</th>
              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500">Par. totais</th>
              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500">Par. estratég.</th>
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

            {linhas.map((linha) => {
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
      </div>
    </section>
  )
}
