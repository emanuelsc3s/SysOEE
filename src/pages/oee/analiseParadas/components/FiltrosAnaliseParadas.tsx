import { Filter, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { LinhaFiltroOption, ProdutoFiltroOption, TurnoFiltroOption } from '../types'
import { PeriodoSelector } from '../../resumoOeeTurno/components/PeriodoSelector'

type FiltrosAnaliseParadasProps = {
  dataInicio: string
  dataFim: string
  linhaId: number | null
  turnoId: number | null
  produtoId: number | null
  limitePareto: number
  linhas: LinhaFiltroOption[]
  turnos: TurnoFiltroOption[]
  produtos: ProdutoFiltroOption[]
  carregandoFiltros: boolean
  carregandoDados: boolean
  onDataInicioChange: (valor: string) => void
  onDataFimChange: (valor: string) => void
  onLinhaIdChange: (valor: number | null) => void
  onTurnoIdChange: (valor: number | null) => void
  onProdutoIdChange: (valor: number | null) => void
  onLimiteParetoChange: (valor: number) => void
  onAplicar: () => void
  onLimpar: () => void
}

const LIMITE_PARETO_OPCOES = [8, 10, 12, 15, 20]

const formatarDescricaoTurno = (turno: TurnoFiltroOption): string => {
  const codigo = (turno.codigo || '').trim()
  const nomeTurno = (turno.turno || '').trim()
  const inicio = (turno.hora_inicio || '').slice(0, 5)
  const fim = (turno.hora_fim || '').slice(0, 5)

  if (codigo && nomeTurno && inicio && fim) {
    return `${codigo} - ${nomeTurno} (${inicio} às ${fim})`
  }
  if (codigo && nomeTurno) {
    return `${codigo} - ${nomeTurno}`
  }
  return codigo || nomeTurno || `Turno ${turno.turno_id}`
}

const formatarDescricaoProduto = (produto: ProdutoFiltroOption): string => {
  const referencia = (produto.referencia || '').trim()
  const descricao = (produto.descricao || '').trim()

  if (referencia && descricao) {
    return `${referencia} - ${descricao}`
  }
  return referencia || descricao || `Produto ${produto.produto_id}`
}

export function FiltrosAnaliseParadas({
  dataInicio,
  dataFim,
  linhaId,
  turnoId,
  produtoId,
  limitePareto,
  linhas,
  turnos,
  produtos,
  carregandoFiltros,
  carregandoDados,
  onDataInicioChange,
  onDataFimChange,
  onLinhaIdChange,
  onTurnoIdChange,
  onProdutoIdChange,
  onLimiteParetoChange,
  onAplicar,
  onLimpar,
}: FiltrosAnaliseParadasProps) {
  const desabilitarAcoes = carregandoFiltros || carregandoDados

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-brand-primary">
          <Filter className="h-3.5 w-3.5" aria-hidden="true" />
          Filtros de análise
        </div>
        <p className="text-sm text-gray-500">
          Combine período, linha, turno e SKU para priorizar as causas críticas de paradas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-sm font-semibold uppercase tracking-[0.08em] text-gray-500">
            Período
          </Label>
          <PeriodoSelector
            dataInicio={dataInicio}
            dataFim={dataFim}
            onDataInicioChange={onDataInicioChange}
            onDataFimChange={onDataFimChange}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filtro-linha-analise-paradas" className="text-sm font-semibold uppercase tracking-[0.08em] text-gray-500">
            Linha
          </Label>
          <select
            id="filtro-linha-analise-paradas"
            name="filtro_linha_analise_paradas"
            className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
            value={linhaId !== null ? String(linhaId) : ''}
            onChange={(event) => {
              const proximoValor = event.target.value ? Number(event.target.value) : null
              onLinhaIdChange(Number.isFinite(proximoValor) ? proximoValor : null)
            }}
            disabled={carregandoFiltros}
          >
            <option value="">Todas as linhas</option>
            {linhas.map((linha) => (
              <option key={linha.linhaproducao_id} value={linha.linhaproducao_id}>
                {linha.linhaproducao || `Linha ${linha.linhaproducao_id}`}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filtro-turno-analise-paradas" className="text-sm font-semibold uppercase tracking-[0.08em] text-gray-500">
            Turno
          </Label>
          <select
            id="filtro-turno-analise-paradas"
            name="filtro_turno_analise_paradas"
            className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
            value={turnoId !== null ? String(turnoId) : ''}
            onChange={(event) => {
              const proximoValor = event.target.value ? Number(event.target.value) : null
              onTurnoIdChange(Number.isFinite(proximoValor) ? proximoValor : null)
            }}
            disabled={carregandoFiltros}
          >
            <option value="">Todos os turnos</option>
            {turnos.map((turno) => (
              <option key={turno.turno_id} value={turno.turno_id}>
                {formatarDescricaoTurno(turno)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 xl:col-span-2">
          <Label htmlFor="filtro-produto-analise-paradas" className="text-sm font-semibold uppercase tracking-[0.08em] text-gray-500">
            SKU / Produto
          </Label>
          <select
            id="filtro-produto-analise-paradas"
            name="filtro_produto_analise_paradas"
            className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
            value={produtoId !== null ? String(produtoId) : ''}
            onChange={(event) => {
              const proximoValor = event.target.value ? Number(event.target.value) : null
              onProdutoIdChange(Number.isFinite(proximoValor) ? proximoValor : null)
            }}
            disabled={carregandoFiltros}
          >
            <option value="">Todos os SKUs</option>
            {produtos.map((produto) => (
              <option key={produto.produto_id} value={produto.produto_id}>
                {formatarDescricaoProduto(produto)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filtro-limite-pareto" className="text-sm font-semibold uppercase tracking-[0.08em] text-gray-500">
            Limite do Pareto
          </Label>
          <select
            id="filtro-limite-pareto"
            name="filtro_limite_pareto"
            className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
            value={String(limitePareto)}
            onChange={(event) => {
              const proximoValor = Number(event.target.value)
              if (Number.isFinite(proximoValor)) {
                onLimiteParetoChange(proximoValor)
              }
            }}
          >
            {LIMITE_PARETO_OPCOES.map((opcao) => (
              <option key={opcao} value={opcao}>
                Top {opcao} causas
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-10 border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          onClick={onLimpar}
          disabled={desabilitarAcoes}
        >
          Limpar filtros
        </Button>
        <Button type="button" onClick={onAplicar} disabled={desabilitarAcoes} className="h-10 min-w-[142px]">
          {carregandoDados ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Atualizando…
            </>
          ) : (
            'Aplicar filtros'
          )}
        </Button>
      </div>
    </section>
  )
}
