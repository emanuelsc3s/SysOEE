/**
 * Tabela de Turnos para Supervisão
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { TurnoSupervisao } from '@/types/supervisao';

interface TabelaTurnosProps {
  turnos: TurnoSupervisao[];
  onSelecionarTurno: (turno: TurnoSupervisao) => void;
}

export function TabelaTurnos({ turnos, onSelecionarTurno }: TabelaTurnosProps) {
  if (turnos.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        Nenhum turno encontrado para os filtros selecionados
      </div>
    );
  }

  const getBadgeStatus = (status: string) => {
    switch (status) {
      case 'ABERTO':
        return <Badge variant="warning">Aberto</Badge>;
      case 'FECHADO':
        return <Badge variant="success">Fechado</Badge>;
      case 'PLANEJADO':
        return <Badge variant="secondary">Planejado</Badge>;
      case 'CANCELADO':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const calcularOEEEstimado = (turno: TurnoSupervisao): number | null => {
    // Cálculo simplificado para preview
    // TODO: Implementar cálculo completo
    if (!turno.velocidade_nominal || turno.total_unidades_produzidas === 0) {
      return null;
    }
    // Apenas exemplo simplificado
    return 75.5;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Linha
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Turno
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Produto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Horário
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Paradas
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Produção
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Refugo
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              OEE Est.
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {turnos.map((turno) => {
            const oeeEstimado = calcularOEEEstimado(turno);

            return (
              <tr
                key={turno.lote_id}
                className={`hover:bg-gray-50 transition-colors ${
                  turno.paradas_em_andamento > 0 ? 'bg-yellow-50' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {turno.linha_nome}
                  </div>
                  <div className="text-xs text-gray-500">
                    {turno.departamento_nome}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {turno.turno_nome}
                  </div>
                  <div className="text-xs text-gray-500">
                    {turno.numero_lote}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {turno.produto_nome}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {turno.hora_inicio} - {turno.hora_fim || '...'}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {getBadgeStatus(turno.turno_status)}
                  {turno.paradas_em_andamento > 0 && (
                    <div className="text-xs text-yellow-600 mt-1">
                      {turno.paradas_em_andamento} parada(s) ativa(s)
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {turno.total_paradas}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round(turno.total_minutos_paradas)} min
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {turno.total_unidades_produzidas.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {turno.apontamentos_clp > 0 && `${turno.apontamentos_clp} CLP`}
                    {turno.apontamentos_clp > 0 && turno.apontamentos_manuais > 0 && ' + '}
                    {turno.apontamentos_manuais > 0 && `${turno.apontamentos_manuais} manual`}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {turno.total_refugo.toLocaleString('pt-BR')}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {oeeEstimado !== null ? (
                    <div className={`text-sm font-bold ${
                      oeeEstimado >= (turno.meta_oee_vigente || 85)
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {oeeEstimado.toFixed(1)}%
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelecionarTurno(turno)}
                  >
                    {turno.turno_status === 'ABERTO' ? 'Fechar Turno' : 'Ver Detalhes'}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
