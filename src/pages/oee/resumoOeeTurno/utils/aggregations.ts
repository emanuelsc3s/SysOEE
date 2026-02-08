import type {
  CardResumo,
  LinhaAgrupada,
  ResumoOeeTurnoLinhaNormalizada,
  ResumoTotais,
  TurnoAgrupado,
} from '../types'
import { formatarDecimal, formatarMinutos, formatarQuantidade, obterStatusPrioritario } from './formatters'

type TurnoAgrupadoInterno = Omit<TurnoAgrupado, 'produtos' | 'produtosCount' | 'status'> & {
  statusLista: string[]
  produtosSet: Set<string>
}

type LinhaAgrupadaInterna = Omit<LinhaAgrupada, 'turnos' | 'status'> & {
  statusLista: string[]
  turnosMap: Map<string, TurnoAgrupadoInterno>
  turnosSet: Set<number>
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
        turnosMap: new Map<string, TurnoAgrupadoInterno>(),
        turnosSet: new Set<number>(),
      })
    }

    const grupoLinha = linhasMap.get(chaveLinha)!
    const turnoId = linha.oeeturno_id ?? null
    if (turnoId !== null) {
      const turnoNumero = Number(turnoId)
      if (Number.isFinite(turnoNumero)) {
        grupoLinha.turnosSet.add(turnoNumero)
      }
    }
    grupoLinha.quantidade += linha.quantidade_produzida
    grupoLinha.perdas += linha.perdas
    grupoLinha.unidadesBoas += linha.unidades_boas
    grupoLinha.paradas += linha.paradas_minutos
    grupoLinha.paradasTotais += linha.paradas_totais_minutos
    grupoLinha.paradasEstrategicas += linha.paradas_estrategicas_minutos
    grupoLinha.statusLista.push(linha.status_linha || 'SEM_STATUS')

    const dataTurno = linha.data ?? null
    const chaveTurno = turnoId !== null ? `id-${turnoId}` : `sem-lancamento-${dataTurno ?? 'sem-data'}`

    if (!grupoLinha.turnosMap.has(chaveTurno)) {
      grupoLinha.turnosMap.set(chaveTurno, {
        id: chaveTurno,
        oeeturnoId: turnoId,
        data: dataTurno,
        qtdeTurnos: 0,
        quantidade: 0,
        perdas: 0,
        unidadesBoas: 0,
        paradas: 0,
        paradasTotais: 0,
        paradasEstrategicas: 0,
        statusLista: [],
        produtosSet: new Set<string>(),
      })
    }

    const grupoTurno = grupoLinha.turnosMap.get(chaveTurno)!
    grupoTurno.qtdeTurnos += linha.qtde_turnos ?? 0
    grupoTurno.quantidade += linha.quantidade_produzida
    grupoTurno.perdas += linha.perdas
    grupoTurno.unidadesBoas += linha.unidades_boas
    grupoTurno.paradas += linha.paradas_minutos
    grupoTurno.paradasTotais += linha.paradas_totais_minutos
    grupoTurno.paradasEstrategicas += linha.paradas_estrategicas_minutos
    grupoTurno.statusLista.push(linha.status_linha || 'SEM_STATUS')

    const nomeProduto = linha.produto || 'Produto não informado'
    grupoTurno.produtosSet.add(nomeProduto)
  }

  return Array.from(linhasMap.values())
    .map((linha) => ({
      id: linha.id,
      linhaId: linha.linhaId,
      linha: linha.linha,
      status: obterStatusPrioritario(linha.statusLista),
      qtdeTurnos: linha.turnosSet.size,
      quantidade: linha.quantidade,
      perdas: linha.perdas,
      unidadesBoas: linha.unidadesBoas,
      paradas: linha.paradas,
      paradasTotais: linha.paradasTotais,
      paradasEstrategicas: linha.paradasEstrategicas,
      turnos: Array.from(linha.turnosMap.values())
        .map((turno) => ({
          id: turno.id,
          oeeturnoId: turno.oeeturnoId,
          data: turno.data,
          status: obterStatusPrioritario(turno.statusLista),
          qtdeTurnos: turno.qtdeTurnos,
          quantidade: turno.quantidade,
          perdas: turno.perdas,
          unidadesBoas: turno.unidadesBoas,
          paradas: turno.paradas,
          paradasTotais: turno.paradasTotais,
          paradasEstrategicas: turno.paradasEstrategicas,
          produtos: Array.from(turno.produtosSet.values()).sort((a, b) => a.localeCompare(b, 'pt-BR')),
          produtosCount: turno.produtosSet.size,
        }))
        .sort((a, b) => {
          const dataA = a.data || ''
          const dataB = b.data || ''
          if (dataA !== dataB) {
            return dataA.localeCompare(dataB, 'pt-BR')
          }
          return (a.oeeturnoId ?? 0) - (b.oeeturnoId ?? 0)
        }),
    }))
    .sort((a, b) => a.linha.localeCompare(b.linha, 'pt-BR'))
}

export const criarCardsResumo = (totais: ResumoTotais): CardResumo[] => {
  return [
    {
      id: 'producao',
      titulo: 'Produção Total',
      valor: formatarQuantidade(totais.quantidade),
      valorNumero: totais.quantidade,
      detalhe: 'unidades produzidas',
      classeValor: 'text-primary dark:text-blue-400',
    },
    {
      id: 'perdas',
      titulo: 'Perdas Totais',
      valor: formatarQuantidade(totais.perdas),
      valorNumero: totais.perdas,
      detalhe: 'unidades descartadas',
      classeValor: 'text-red-600 dark:text-red-400',
    },
    {
      id: 'boas',
      titulo: 'Unidades Boas',
      valor: formatarQuantidade(totais.boas),
      valorNumero: totais.boas,
      detalhe: 'unidades aprovadas',
      classeValor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'paradas-grandes',
      titulo: 'Paradas Grandes',
      valor: formatarMinutos(totais.paradasGrandes),
      valorNumero: totais.paradasGrandes,
      detalhe: `${formatarDecimal(totais.paradasGrandes, 0)} min totais`,
      classeValor: 'text-orange-500 dark:text-orange-400',
    },
    {
      id: 'paradas-totais',
      titulo: 'Paradas Totais',
      valor: formatarMinutos(totais.paradasTotais),
      valorNumero: totais.paradasTotais,
      detalhe: `${formatarDecimal(totais.paradasTotais, 0)} min totais`,
      classeValor: 'text-orange-500 dark:text-orange-400',
    },
    {
      id: 'paradas-estrategicas',
      titulo: 'Paradas Estratégicas',
      valor: formatarMinutos(totais.paradasEstrategicas),
      valorNumero: totais.paradasEstrategicas,
      detalhe: `${formatarDecimal(totais.paradasEstrategicas, 0)} min totais`,
      classeValor: 'text-gray-800 dark:text-gray-100',
    },
  ]
}
