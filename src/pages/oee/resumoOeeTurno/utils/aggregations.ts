import type {
  CardResumo,
  LinhaAgrupada,
  ResumoOeeTurnoLinhaNormalizada,
  ResumoTotais,
  TurnoAgrupado,
} from '../types'
import { formatarMinutos, formatarPeriodoMinutos, formatarQuantidade, obterStatusPrioritario } from './formatters'

type TurnoAgrupadoInterno = Omit<TurnoAgrupado, 'produtos' | 'produtosCount' | 'status'> & {
  statusLista: string[]
  produtosSet: Set<string>
}

type LinhaAgrupadaInterna = Omit<LinhaAgrupada, 'turnos' | 'status'> & {
  statusLista: string[]
  turnosMap: Map<string, TurnoAgrupadoInterno>
  turnosSet: Set<number>
}

const ordenarTurnos = (a: TurnoAgrupado, b: TurnoAgrupado): number => {
  const dataA = a.data || ''
  const dataB = b.data || ''
  if (dataA !== dataB) {
    return dataA.localeCompare(dataB, 'pt-BR')
  }
  return (a.oeeturnoId ?? 0) - (b.oeeturnoId ?? 0)
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
        qtdEnvase: 0,
        qtdEmbalagem: 0,
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
    grupoLinha.qtdEnvase += linha.qtd_envase
    grupoLinha.qtdEmbalagem += linha.qtd_embalagem
    grupoLinha.quantidade += linha.qtd_envase + linha.qtd_embalagem
    grupoLinha.perdas += linha.perdas
    grupoLinha.unidadesBoas += linha.unidades_boas
    grupoLinha.paradas += linha.paradas_grandes_minutos
    grupoLinha.paradasTotais += linha.paradas_totais_minutos
    grupoLinha.paradasEstrategicas += linha.paradas_estrategicas_minutos
    grupoLinha.statusLista.push(linha.status_linha || 'SEM_STATUS')

    const dataTurno = linha.data ?? null
    const chaveTurno = turnoId !== null ? `id-${turnoId}` : `sem-lancamento-${dataTurno ?? 'sem-data'}`

    if (!grupoLinha.turnosMap.has(chaveTurno)) {
      grupoLinha.turnosMap.set(chaveTurno, {
        id: chaveTurno,
        oeeturnoId: turnoId,
        turno: linha.turno ?? null,
        data: dataTurno,
        qtdeTurnos: 0,
        qtdEnvase: 0,
        qtdEmbalagem: 0,
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
    if (!grupoTurno.turno && linha.turno) {
      grupoTurno.turno = linha.turno
    }
    grupoTurno.qtdeTurnos = Math.max(grupoTurno.qtdeTurnos, linha.qtde_turnos ?? 0)
    grupoTurno.qtdEnvase += linha.qtd_envase
    grupoTurno.qtdEmbalagem += linha.qtd_embalagem
    grupoTurno.quantidade += linha.qtd_envase + linha.qtd_embalagem
    grupoTurno.perdas += linha.perdas
    grupoTurno.unidadesBoas += linha.unidades_boas
    grupoTurno.paradas += linha.paradas_grandes_minutos
    grupoTurno.paradasTotais += linha.paradas_totais_minutos
    grupoTurno.paradasEstrategicas += linha.paradas_estrategicas_minutos
    grupoTurno.statusLista.push(linha.status_linha || 'SEM_STATUS')

    const nomeProduto = linha.produto || 'Produto não informado'
    grupoTurno.produtosSet.add(nomeProduto)
  }

  return Array.from(linhasMap.values())
    .map((linha) => {
      const turnosNormalizados = Array.from(linha.turnosMap.values())
        .map((turno) => ({
          id: turno.id,
          oeeturnoId: turno.oeeturnoId,
          turno: turno.turno ?? null,
          data: turno.data,
          status: obterStatusPrioritario(turno.statusLista),
          qtdeTurnos: turno.qtdeTurnos,
          qtdEnvase: turno.qtdEnvase,
          qtdEmbalagem: turno.qtdEmbalagem,
          quantidade: turno.quantidade,
          perdas: turno.perdas,
          unidadesBoas: turno.unidadesBoas,
          paradas: turno.paradas,
          paradasTotais: turno.paradasTotais,
          paradasEstrategicas: turno.paradasEstrategicas,
          produtos: Array.from(turno.produtosSet.values()).sort((a, b) => a.localeCompare(b, 'pt-BR')),
          produtosCount: turno.produtosSet.size,
        }))
        .sort(ordenarTurnos)

      const turnosComLancamento = turnosNormalizados.filter((turno) => turno.oeeturnoId !== null)

      const turnosExibicao: TurnoAgrupado[] = (() => {
        if (turnosComLancamento.length > 0) {
          return turnosComLancamento
        }

        if (turnosNormalizados.length === 0) {
          return []
        }

        const agregadoSemLancamento = turnosNormalizados.reduce(
          (acumulado, turno) => {
            acumulado.qtdeTurnos += turno.qtdeTurnos
            acumulado.qtdEnvase += turno.qtdEnvase
            acumulado.qtdEmbalagem += turno.qtdEmbalagem
            acumulado.quantidade += turno.quantidade
            acumulado.perdas += turno.perdas
            acumulado.unidadesBoas += turno.unidadesBoas
            acumulado.paradas += turno.paradas
            acumulado.paradasTotais += turno.paradasTotais
            acumulado.paradasEstrategicas += turno.paradasEstrategicas
            acumulado.statusLista.push(turno.status)
            turno.produtos.forEach((produto) => acumulado.produtosSet.add(produto))
            return acumulado
          },
          {
            qtdeTurnos: 0,
            qtdEnvase: 0,
            qtdEmbalagem: 0,
            quantidade: 0,
            perdas: 0,
            unidadesBoas: 0,
            paradas: 0,
            paradasTotais: 0,
            paradasEstrategicas: 0,
            statusLista: [] as string[],
            produtosSet: new Set<string>(),
          }
        )

        const produtosSemLancamento = Array.from(agregadoSemLancamento.produtosSet.values())
          .filter((produto) => produto.trim() !== '' && produto !== 'Produto não informado')
          .sort((a, b) => a.localeCompare(b, 'pt-BR'))

        return [
          {
            id: `${linha.id}-sem-lancamento`,
            oeeturnoId: null,
            turno: null,
            data: null,
            status: obterStatusPrioritario(agregadoSemLancamento.statusLista),
            qtdeTurnos: agregadoSemLancamento.qtdeTurnos,
            qtdEnvase: agregadoSemLancamento.qtdEnvase,
            qtdEmbalagem: agregadoSemLancamento.qtdEmbalagem,
            quantidade: agregadoSemLancamento.quantidade,
            perdas: agregadoSemLancamento.perdas,
            unidadesBoas: agregadoSemLancamento.unidadesBoas,
            paradas: agregadoSemLancamento.paradas,
            paradasTotais: agregadoSemLancamento.paradasTotais,
            paradasEstrategicas: agregadoSemLancamento.paradasEstrategicas,
            produtos: produtosSemLancamento,
            produtosCount: produtosSemLancamento.length,
            semLancamento: true,
            diasSemLancamento: turnosNormalizados.length,
          },
        ]
      })()

      return {
        id: linha.id,
        linhaId: linha.linhaId,
        linha: linha.linha,
        status: obterStatusPrioritario(linha.statusLista),
        qtdeTurnos: linha.turnosSet.size,
        qtdEnvase: linha.qtdEnvase,
        qtdEmbalagem: linha.qtdEmbalagem,
        quantidade: linha.quantidade,
        perdas: linha.perdas,
        unidadesBoas: linha.unidadesBoas,
        paradas: linha.paradas,
        paradasTotais: linha.paradasTotais,
        paradasEstrategicas: linha.paradasEstrategicas,
        turnos: turnosExibicao,
      }
    })
    .sort((a, b) => a.linha.localeCompare(b.linha, 'pt-BR'))
}

export const criarCardsResumo = (totais: ResumoTotais): CardResumo[] => {
  return [
    {
      id: 'qtd_envase',
      campoRpc: 'qtd_envase',
      titulo: 'Envase',
      valor: formatarQuantidade(totais.qtdEnvase),
      valorNumero: totais.qtdEnvase,
      detalhe: 'unidades trabalhadas',
      classeValor: 'text-primary dark:text-blue-400',
    },
    {
      id: 'perdas_envase',
      campoRpc: 'perdas_envase',
      titulo: 'Perdas de Envase',
      valor: formatarQuantidade(totais.perdasEnvase),
      valorNumero: totais.perdasEnvase,
      detalhe: 'unidades perdidas',
      classeValor: 'text-red-600 dark:text-red-400',
    },
    {
      id: 'envasado',
      campoRpc: 'envasado',
      titulo: 'Total Envasado',
      valor: formatarQuantidade(totais.envasado),
      valorNumero: totais.envasado,
      detalhe: 'unidades envasadas',
      classeValor: 'text-primary dark:text-blue-400',
    },
    {
      id: 'paradas_grandes',
      campoRpc: 'paradas_grandes_minutos',
      titulo: 'Grandes Paradas',
      valor: formatarMinutos(totais.paradasGrandes),
      valorNumero: totais.paradasGrandes,
      detalhe: formatarPeriodoMinutos(totais.paradasGrandes),
      classeValor: 'text-orange-500 dark:text-orange-400',
    },
    {
      id: 'sku_produzidos',
      campoRpc: 'sku_produzidos',
      titulo: 'SKU Produzidos',
      valor: formatarQuantidade(totais.skuProduzidos),
      valorNumero: totais.skuProduzidos,
      detalhe: 'produtos distintos',
      classeValor: 'text-primary dark:text-blue-400',
    },
    {
      id: 'paradas_estrategicas',
      campoRpc: 'paradas_estrategicas_minutos',
      titulo: 'Paradas Estratégicas',
      valor: formatarMinutos(totais.paradasEstrategicas),
      valorNumero: totais.paradasEstrategicas,
      detalhe: formatarPeriodoMinutos(totais.paradasEstrategicas),
      classeValor: 'text-gray-500 dark:text-gray-100',
    },
    {
      id: 'qtd_embalagem',
      campoRpc: 'qtd_embalagem',
      titulo: 'Embalagem',
      valor: formatarQuantidade(totais.qtdEmbalagem),
      valorNumero: totais.qtdEmbalagem,
      detalhe: 'unidades processadas',
      classeValor: 'text-primary dark:text-blue-400',
    },
    {
      id: 'perdas_embalagem',
      campoRpc: 'perdas_embalagem',
      titulo: 'Perdas de Embalagem',
      valor: formatarQuantidade(totais.perdasEmbalagem),
      valorNumero: totais.perdasEmbalagem,
      detalhe: 'unidades perdidas',
      classeValor: 'text-red-600 dark:text-red-400',
    },
    {
      id: 'embalado',
      campoRpc: 'embalado',
      titulo: 'Total Embalado',
      valor: formatarQuantidade(totais.embalado),
      valorNumero: totais.embalado,
      detalhe: 'unidades embaladas',
      classeValor: 'text-primary dark:text-blue-400',
    },
    {
      id: 'pequenas_paradas',
      campoRpc: 'paradas_pequenas_minutos',
      titulo: 'Pequenas Paradas',
      valor: formatarMinutos(totais.paradasPequenas),
      valorNumero: totais.paradasPequenas,
      detalhe: formatarPeriodoMinutos(totais.paradasPequenas),
      classeValor: 'text-orange-500 dark:text-orange-400',
    },
    {
      id: 'qtde_turnos',
      campoRpc: 'qtde_turnos',
      titulo: 'Turnos Apontados',
      valor: formatarQuantidade(totais.turnosDistintos),
      valorNumero: totais.turnosDistintos,
      detalhe: 'turnos distintos no período',
      classeValor: 'text-primary dark:text-blue-400',
    },
    {
      id: 'paradas_totais',
      campoRpc: 'paradas_totais_minutos',
      titulo: 'Paradas Totais',
      valor: formatarMinutos(totais.paradasTotais),
      valorNumero: totais.paradasTotais,
      detalhe: formatarPeriodoMinutos(totais.paradasTotais),
      classeValor: 'text-orange-500 dark:text-orange-400',
    },
  ]
}
