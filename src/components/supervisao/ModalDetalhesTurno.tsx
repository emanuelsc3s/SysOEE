/**
 * Modal de Detalhes do Turno
 * Mostra todos os apontamentos e permite fechar o turno
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';

import {
  buscarDetalhesApontamentos,
  fecharTurno
} from '@/services/api/supervisao.api';
import type { TurnoSupervisao } from '@/types/supervisao';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ModalDetalhesTurnoProps {
  turno: TurnoSupervisao;
  aberto: boolean;
  onFechar: () => void;
  onTurnoFechado: () => void;
}

export function ModalDetalhesTurno({
  turno,
  aberto,
  onFechar,
  onTurnoFechado
}: ModalDetalhesTurnoProps) {
  const [observacoes, setObservacoes] = useState('');
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);

  // Buscar detalhes dos apontamentos
  const { data: detalhes, isLoading } = useQuery({
    queryKey: ['detalhes-apontamentos', turno.lote_id],
    queryFn: () => buscarDetalhesApontamentos(turno.lote_id),
    enabled: aberto
  });

  // Mutation para fechar turno
  const mutationFechar = useMutation({
    mutationFn: () => fecharTurno(turno.lote_id, 1, observacoes), // TODO: pegar supervisor_id do contexto
    onSuccess: () => {
      onTurnoFechado();
    }
  });

  const handleConfirmarFechamento = () => {
    mutationFechar.mutate();
  };

  const podeFechar = turno.turno_status === 'ABERTO' && turno.paradas_em_andamento === 0;

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Detalhes do Turno - {turno.linha_nome}
          </DialogTitle>
          <DialogDescription>
            {turno.turno_nome} • {format(new Date(turno.data_producao), 'dd/MM/yyyy')} •{' '}
            {turno.hora_inicio} - {turno.hora_fim || '...'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2 text-sm">Carregando apontamentos...</p>
          </div>
        ) : (
          <>
            {/* Resumo Geral */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Paradas</div>
                <div className="text-2xl font-bold">{detalhes?.paradas.length || 0}</div>
                <div className="text-xs text-gray-500">
                  {Math.round(turno.total_minutos_paradas)} min
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Produção</div>
                <div className="text-2xl font-bold">
                  {turno.total_unidades_produzidas.toLocaleString('pt-BR')}
                </div>
                <div className="text-xs text-gray-500">unidades</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Refugo</div>
                <div className="text-2xl font-bold text-red-600">
                  {turno.total_refugo.toLocaleString('pt-BR')}
                </div>
                <div className="text-xs text-gray-500">unidades</div>
              </div>
            </div>

            {/* Alertas */}
            {turno.paradas_em_andamento > 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  Existem {turno.paradas_em_andamento} parada(s) ainda ativa(s). Finalize todas
                  as paradas antes de fechar o turno.
                </AlertDescription>
              </Alert>
            )}

            {/* Abas de Apontamentos */}
            <Tabs defaultValue="paradas" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="paradas">
                  Paradas ({detalhes?.paradas.length || 0})
                </TabsTrigger>
                <TabsTrigger value="producao">
                  Produção ({detalhes?.producao.length || 0})
                </TabsTrigger>
                <TabsTrigger value="qualidade">
                  Qualidade ({detalhes?.qualidade.length || 0})
                </TabsTrigger>
              </TabsList>

              {/* Aba Paradas */}
              <TabsContent value="paradas" className="mt-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {detalhes?.paradas.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 text-sm">
                      Nenhuma parada registrada
                    </p>
                  ) : (
                    detalhes?.paradas.map((parada) => (
                      <div key={parada.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {parada.codigo_parada.codigo}
                              </span>
                              <Badge variant={
                                parada.codigo_parada.tipo_parada === 'NAO_PLANEJADA'
                                  ? 'destructive'
                                  : parada.codigo_parada.tipo_parada === 'PLANEJADA'
                                  ? 'warning'
                                  : 'secondary'
                              }>
                                {parada.codigo_parada.tipo_parada}
                              </Badge>
                              {!parada.hora_fim && (
                                <Badge variant="warning">Em Andamento</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {parada.codigo_parada.descricao}
                            </p>
                            <div className="text-xs text-gray-500 mt-1">
                              {parada.hora_inicio} - {parada.hora_fim || '...'}
                              {parada.duracao_minutos && ` (${parada.duracao_minutos} min)`}
                            </div>
                            {parada.observacao && (
                              <p className="text-xs text-gray-600 mt-1 italic">
                                Obs: {parada.observacao}
                              </p>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 text-right ml-4">
                            <div>{parada.operador.funcionario.nome}</div>
                            <div>{format(new Date(parada.created_at), 'HH:mm')}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Aba Produção */}
              <TabsContent value="producao" className="mt-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {detalhes?.producao.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 text-sm">
                      Nenhum apontamento de produção
                    </p>
                  ) : (
                    detalhes?.producao.map((prod) => (
                      <div key={prod.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg text-blue-600">
                                {prod.unidades_produzidas.toLocaleString('pt-BR')}
                              </span>
                              <span className="text-sm text-gray-600">unidades</span>
                              <Badge variant={
                                prod.fonte_dados === 'CLP_AUTOMATICO' ? 'success' : 'secondary'
                              }>
                                {prod.fonte_dados}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {prod.hora_apontamento}
                              {prod.clp_timestamp && (
                                <span className="ml-2">
                                  (CLP: {format(new Date(prod.clp_timestamp), 'HH:mm:ss')})
                                </span>
                              )}
                            </div>
                          </div>
                          {prod.usuario && (
                            <div className="text-xs text-gray-500 text-right">
                              <div>{prod.usuario.funcionario.nome}</div>
                              <div>{format(new Date(prod.created_at), 'HH:mm')}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Aba Qualidade */}
              <TabsContent value="qualidade" className="mt-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {detalhes?.qualidade.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 text-sm">
                      Nenhum apontamento de qualidade
                    </p>
                  ) : (
                    detalhes?.qualidade.map((qual) => (
                      <div key={qual.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                qual.tipo_perda === 'REFUGO' ? 'destructive' : 'warning'
                              }>
                                {qual.tipo_perda}
                              </Badge>
                              {qual.unidades_refugadas && (
                                <span className="text-sm font-medium text-red-600">
                                  {qual.unidades_refugadas.toLocaleString('pt-BR')} unidades
                                </span>
                              )}
                            </div>
                            {qual.motivo && (
                              <p className="text-sm text-gray-600 mt-1">{qual.motivo}</p>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              {qual.data_apontamento}
                            </div>
                          </div>
                          {qual.usuario && (
                            <div className="text-xs text-gray-500 text-right ml-4">
                              <div>{qual.usuario.funcionario.nome}</div>
                              <div>{format(new Date(qual.created_at), 'HH:mm')}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Observações do Supervisor (apenas se for fechar) */}
            {podeFechar && !confirmacaoAberta && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações do Supervisor (opcional)
                </label>
                <Textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Digite observações sobre o turno..."
                  rows={3}
                />
              </div>
            )}
          </>
        )}

        <DialogFooter>
          {turno.turno_status === 'ABERTO' ? (
            <>
              <Button variant="outline" onClick={onFechar}>
                Cancelar
              </Button>
              <Button
                onClick={() => setConfirmacaoAberta(true)}
                disabled={!podeFechar || mutationFechar.isPending}
              >
                {mutationFechar.isPending ? 'Fechando...' : 'Fechar Turno'}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onFechar}>
              Fechar
            </Button>
          )}
        </DialogFooter>

        {/* Dialog de Confirmação */}
        {confirmacaoAberta && (
          <Dialog open={confirmacaoAberta} onOpenChange={setConfirmacaoAberta}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Fechamento do Turno</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja fechar este turno? O OEE será calculado e o turno não
                  poderá mais receber apontamentos.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmacaoAberta(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleConfirmarFechamento} disabled={mutationFechar.isPending}>
                  {mutationFechar.isPending ? 'Calculando OEE...' : 'Confirmar Fechamento'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
