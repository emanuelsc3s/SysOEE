import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { AcaoPrioritariaItem } from '../types'
import {
  formatarHoras,
  formatarMinutosHHMM,
  formatarNumeroInteiro,
  formatarPercentual,
} from '../utils/formatters'

type TabelaAcoesPrioritariasProps = {
  dados: AcaoPrioritariaItem[]
  carregando: boolean
}

const obterVariantPrioridade = (prioridade: AcaoPrioritariaItem['prioridade']) => {
  if (prioridade === 'Crítica') {
    return 'destructive' as const
  }
  if (prioridade === 'Alta') {
    return 'warning' as const
  }
  return 'info' as const
}

export function TabelaAcoesPrioritarias({ dados, carregando }: TabelaAcoesPrioritariasProps) {
  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-base font-semibold text-gray-700">
          Plano de ação prioritário por causa de parada
        </CardTitle>
        <p className="text-sm text-gray-500">
          Sequenciamento objetivo para atuação da diretoria com base em impacto e recorrência.
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {carregando ? (
          <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-slate-50/70 text-sm text-gray-500">
            Carregando plano de ação…
          </div>
        ) : dados.length === 0 ? (
          <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-slate-50/70 text-sm text-gray-500">
            Sem dados para priorização de ações no período filtrado.
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200">
            <Table className="table-auto">
              <TableHeader className="bg-slate-50/90">
                <TableRow className="border-gray-200">
                  <TableHead className="min-w-[200px] text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Causa de parada</TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Tempo total</TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Ocorrências</TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Média por evento</TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">% Pareto</TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">% Acumulado</TableHead>
                  <TableHead className="text-center text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Prioridade</TableHead>
                  <TableHead className="min-w-[280px] text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Recomendação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dados.map((item) => (
                  <TableRow key={item.parada} className="border-gray-200">
                    <TableCell className="font-medium text-gray-700">{item.parada}</TableCell>
                    <TableCell className="text-right tabular-nums text-gray-700">
                      {formatarMinutosHHMM(item.tempoMinutos)} ({formatarHoras(item.tempoHoras)})
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-gray-700">
                      {formatarNumeroInteiro(item.quantidade)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-gray-700">
                      {formatarMinutosHHMM(item.mediaMinutos)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-gray-700">
                      {formatarPercentual(item.percentual)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-gray-700">
                      {formatarPercentual(item.percentualAcumulado)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={obterVariantPrioridade(item.prioridade)}>
                        {item.prioridade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{item.recomendacao}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
