/**
 * Página de Supervisão de Turnos
 * Permite supervisor visualizar e fechar turnos do dia
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { buscarTurnosDoDia } from '@/services/api/supervisao.api';
import type { TurnoSupervisao, FiltroSupervisao } from '@/types/supervisao';

import { TabelaTurnos } from '@/components/supervisao/TabelaTurnos';
import { ModalDetalhesTurno } from '@/components/supervisao/ModalDetalhesTurno';
// TODO: Implementar componentes FiltrosSupervisao e ResumoCards
// import { FiltrosSupervisao } from '@/components/supervisao/FiltrosSupervisao';
// import { ResumoCards } from '@/components/supervisao/ResumoCards';

export default function SupervisaoTurnos() {
  const [filtros] = useState<FiltroSupervisao>({
    data: format(new Date(), 'yyyy-MM-dd')
  });

  const [turnoSelecionado, setTurnoSelecionado] = useState<TurnoSupervisao | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  // Query de turnos
  const {
    data: turnos,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['supervisao-turnos', filtros],
    queryFn: () => buscarTurnosDoDia(filtros),
    refetchInterval: 30000 // Atualiza a cada 30s
  });

  // Query de resumo - TODO: Usar quando ResumoCards for implementado
  // const { data: resumo } = useQuery({
  //   queryKey: ['resumo-turnos', filtros.data],
  //   queryFn: () => buscarResumoTurnos(filtros.data),
  //   refetchInterval: 30000
  // });

  const handleSelecionarTurno = (turno: TurnoSupervisao) => {
    setTurnoSelecionado(turno);
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setTurnoSelecionado(null);
  };

  const handleTurnoFechado = () => {
    refetch(); // Atualizar lista
    handleFecharModal();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Supervisão de Turnos
          </h1>
          <p className="text-gray-600 mt-1">
            {format(new Date(filtros.data), "EEEE, dd 'de' MMMM 'de' yyyy", {
              locale: ptBR
            })}
          </p>
        </div>

        {/* Resumo em Cards */}
        {/* TODO: Implementar componente ResumoCards */}
        {/* {resumo && <ResumoCards resumo={resumo} />} */}

        {/* Filtros */}
        {/* TODO: Implementar componente FiltrosSupervisao */}
        {/* <FiltrosSupervisao filtros={filtros} onChange={setFiltros} /> */}

        {/* Tabela de Turnos */}
        <div className="bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Carregando turnos...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">Erro ao carregar turnos</p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <TabelaTurnos
              turnos={turnos || []}
              onSelecionarTurno={handleSelecionarTurno}
            />
          )}
        </div>

        {/* Modal de Detalhes */}
        {turnoSelecionado && (
          <ModalDetalhesTurno
            turno={turnoSelecionado}
            aberto={modalAberto}
            onFechar={handleFecharModal}
            onTurnoFechado={handleTurnoFechado}
          />
        )}
      </div>
    </div>
  );
}
