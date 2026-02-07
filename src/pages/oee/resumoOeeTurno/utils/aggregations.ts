import type {
  CardResumo,
  LinhaAgrupada,
  ProdutoAgrupado,
  ResumoOeeTurnoLinhaNormalizada,
  ResumoTotais,
} from '../types'
import { formatarDecimal, formatarMinutos, formatarQuantidade, obterStatusPrioritario } from './formatters'

type LinhaAgrupadaInterna = Omit<LinhaAgrupada, 'produtos' | 'status'> & {
  statusLista: string[]
  produtosMap: Map<string, ProdutoAgrupado>
}

export const agruparLinhasResumo = (
  linhas: ResumoOeeTurnoLinhaNormalizada[]
): LinhaAgrupada[] => {
  const linhasMap = new Map<string, LinhaAgrupadaInterna>()

  for (const linha of linhas) {
    const linhaId = linha.linhaproducao_id ?? null
    const nomeLinha = linha.linhaproducao || 'Linha não informada'
    const chaveLinha = `${linhaId ?? 'sem-id'}-${nomeLinha}`

    if (!linhasMap.has(chaveLinha)) {
      linhasMap.set(chaveLinha, {
        id: chaveLinha,
        linhaId,
        linha: nomeLinha,
        qtdeTurnos: 0,
        quantidade: 0,
        perdas: 0,
        unidadesBoas: 0,
        paradas: 0,
        paradasTotais: 0,
        paradasEstrategicas: 0,
        statusLista: [],
        produtosMap: new Map<string, ProdutoAgrupado>(),
      })
    }

    const grupoLinha = linhasMap.get(chaveLinha)!
    grupoLinha.qtdeTurnos += linha.qtde_turnos ?? 0
    grupoLinha.quantidade += linha.quantidade_produzida
    grupoLinha.perdas += linha.perdas
    grupoLinha.unidadesBoas += linha.unidades_boas
    grupoLinha.paradas += linha.paradas_minutos
    grupoLinha.paradasTotais += linha.paradas_totais_minutos
    grupoLinha.paradasEstrategicas += linha.paradas_estrategicas_minutos
    grupoLinha.statusLista.push(linha.status_linha || 'SEM_STATUS')

    const produtoId = linha.produto_id ?? null
    const nomeProduto = linha.produto || 'Produto não informado'
    const chaveProduto = `${produtoId ?? 'sem-id'}-${nomeProduto}`

    if (!grupoLinha.produtosMap.has(chaveProduto)) {
      grupoLinha.produtosMap.set(chaveProduto, {
        id: chaveProduto,
        produtoId,
        produto: nomeProduto,
        qtdeTurnos: 0,
        quantidade: 0,
        perdas: 0,
        unidadesBoas: 0,
        paradas: 0,
        paradasTotais: 0,
        paradasEstrategicas: 0,
      })
    }

    const grupoProduto = grupoLinha.produtosMap.get(chaveProduto)!
    grupoProduto.qtdeTurnos += linha.qtde_turnos ?? 0
    grupoProduto.quantidade += linha.quantidade_produzida
    grupoProduto.perdas += linha.perdas
    grupoProduto.unidadesBoas += linha.unidades_boas
    grupoProduto.paradas += linha.paradas_minutos
    grupoProduto.paradasTotais += linha.paradas_totais_minutos
    grupoProduto.paradasEstrategicas += linha.paradas_estrategicas_minutos
  }

  return Array.from(linhasMap.values())
    .map((linha) => ({
      id: linha.id,
      linhaId: linha.linhaId,
      linha: linha.linha,
      status: obterStatusPrioritario(linha.statusLista),
      qtdeTurnos: linha.qtdeTurnos,
      quantidade: linha.quantidade,
      perdas: linha.perdas,
      unidadesBoas: linha.unidadesBoas,
      paradas: linha.paradas,
      paradasTotais: linha.paradasTotais,
      paradasEstrategicas: linha.paradasEstrategicas,
      produtos: Array.from(linha.produtosMap.values()).sort((a, b) =>
        a.produto.localeCompare(b.produto, 'pt-BR')
      ),
    }))
    .sort((a, b) => a.linha.localeCompare(b.linha, 'pt-BR'))
}

export const criarCardsResumo = (totais: ResumoTotais): CardResumo[] => {
  return [
    {
      id: 'producao',
      titulo: 'Produção Total',
      valor: formatarQuantidade(totais.quantidade),
      detalhe: 'unidades produzidas',
      classeValor: 'text-primary dark:text-blue-400',
    },
    {
      id: 'perdas',
      titulo: 'Perdas Totais',
      valor: formatarQuantidade(totais.perdas),
      detalhe: 'unidades descartadas',
      classeValor: 'text-red-600 dark:text-red-400',
    },
    {
      id: 'boas',
      titulo: 'Unidades Boas',
      valor: formatarQuantidade(totais.boas),
      detalhe: 'unidades aprovadas',
      classeValor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'paradas-grandes',
      titulo: 'Paradas Grandes',
      valor: formatarMinutos(totais.paradasGrandes),
      detalhe: `${formatarDecimal(totais.paradasGrandes, 0)} min totais`,
      classeValor: 'text-orange-500 dark:text-orange-400',
    },
    {
      id: 'paradas-totais',
      titulo: 'Paradas Totais',
      valor: formatarMinutos(totais.paradasTotais),
      detalhe: `${formatarDecimal(totais.paradasTotais, 0)} min totais`,
      classeValor: 'text-orange-500 dark:text-orange-400',
    },
    {
      id: 'paradas-estrategicas',
      titulo: 'Paradas Estratégicas',
      valor: formatarMinutos(totais.paradasEstrategicas),
      detalhe: `${formatarDecimal(totais.paradasEstrategicas, 0)} min totais`,
      classeValor: 'text-gray-800 dark:text-gray-100',
    },
  ]
}
