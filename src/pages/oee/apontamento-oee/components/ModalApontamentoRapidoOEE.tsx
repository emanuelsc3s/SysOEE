import { AlertTriangle, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ModalBuscaParadas } from '@/components/apontamento/ModalBuscaParadas'
import type { ContextoTurnoRapidoOEE } from '../types/apontamentoRapidoOee.types'
import { useApontamentoRapidoOEE } from '../hooks/useApontamentoRapidoOEE'
import { FormApontamentoRapidoProducao } from './FormApontamentoRapidoProducao'
import { FormApontamentoRapidoPerda } from './FormApontamentoRapidoPerda'
import { FormApontamentoRapidoParada } from './FormApontamentoRapidoParada'

type ModalApontamentoRapidoOEEProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  contexto: ContextoTurnoRapidoOEE | null
  onApontamentoRegistrado?: () => Promise<void> | void
}

const mapaStatusBadge: Record<string, 'secondary' | 'info' | 'success' | 'destructive' | 'warning' | 'outline' | 'default'> = {
  Aberto: 'info',
  Fechado: 'success',
  Cancelado: 'destructive'
}

const formatarData = (dataIso: string): string => {
  if (!dataIso) {
    return '-'
  }

  const data = new Date(`${dataIso}T00:00:00`)
  if (Number.isNaN(data.getTime())) {
    return dataIso
  }

  return data.toLocaleDateString('pt-BR')
}

const formatarHora = (hora: string | null): string => {
  if (!hora) {
    return '-'
  }
  return hora.slice(0, 5)
}

export function ModalApontamentoRapidoOEE({
  open,
  onOpenChange,
  contexto,
  onApontamentoRegistrado
}: ModalApontamentoRapidoOEEProps) {
  const {
    abaAtiva,
    setAbaAtiva,
    carregandoDados,
    totalJanelas,
    totalProducoesRegistradas,
    janelasFaltantes,
    janelaSelecionada,
    setJanelaSelecionada,
    quantidadeProducao,
    setQuantidadeProducao,
    quantidadePerda,
    setQuantidadePerda,
    codigoParadaBusca,
    paradaSelecionada,
    horaInicialParada,
    horaFinalParada,
    observacaoParada,
    setObservacaoParada,
    duracaoParadaFormatada,
    modalBuscaParadasAberto,
    setModalBuscaParadasAberto,
    paradasGerais,
    carregandoParadas,
    erroParadas,
    salvandoProducao,
    salvandoPerda,
    salvandoParada,
    abrirBuscaParadas,
    selecionarParada,
    registrarProducao,
    registrarPerda,
    registrarParada,
    atualizarHoraInicialParada,
    atualizarHoraFinalParada,
    finalizarHoraInicialParada,
    finalizarHoraFinalParada
  } = useApontamentoRapidoOEE({
    aberto: open,
    contexto,
    onApontamentoRegistrado
  })

  const turnoBloqueado = contexto?.status === 'Cancelado'

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>ModalApontamentoRapidoOEE</DialogTitle>
            <DialogDescription>
              Registro rápido de produção, perda e parada sem sair da listagem de turnos.
            </DialogDescription>
          </DialogHeader>

          {contexto ? (
            <div className="space-y-4">
              <div className="rounded-md border border-border bg-muted/30 p-3">
                <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                  <p><span className="font-semibold">Lançamento:</span> {contexto.oeeturnoId}</p>
                  <p><span className="font-semibold">Data:</span> {formatarData(contexto.data)}</p>
                  <p><span className="font-semibold">Turno:</span> {contexto.turno}</p>
                  <p><span className="font-semibold">Linha:</span> {contexto.linhaProducaoNome || 'N/A'}</p>
                  <p className="md:col-span-2"><span className="font-semibold">Produto:</span> {contexto.produto || 'N/A'}</p>
                  <p><span className="font-semibold">Janela do turno:</span> {formatarHora(contexto.horaInicio)} - {formatarHora(contexto.horaFim)}</p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Status:</span>
                    <Badge variant={mapaStatusBadge[contexto.status || ''] || 'secondary'}>
                      {contexto.status || 'N/A'}
                    </Badge>
                  </p>
                </div>
              </div>

              {turnoBloqueado && (
                <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  <p className="flex items-center gap-2 font-medium">
                    <AlertTriangle className="h-4 w-4" />
                    Turno cancelado
                  </p>
                  <p className="mt-1">
                    O status atual não permite novos apontamentos rápidos.
                  </p>
                </div>
              )}

              {carregandoDados ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Carregando dados do turno...
                </div>
              ) : (
                <Tabs value={abaAtiva} onValueChange={(valor) => setAbaAtiva(valor as typeof abaAtiva)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="PRODUCAO">Produção</TabsTrigger>
                    <TabsTrigger value="PERDA">Perda</TabsTrigger>
                    <TabsTrigger value="PARADA">Parada</TabsTrigger>
                  </TabsList>

                  <TabsContent value="PRODUCAO" className="mt-4">
                    <FormApontamentoRapidoProducao
                      totalJanelas={totalJanelas}
                      totalProducoesRegistradas={totalProducoesRegistradas}
                      janelasFaltantes={janelasFaltantes}
                      janelaSelecionada={janelaSelecionada}
                      onSelecionarJanela={setJanelaSelecionada}
                      quantidadeProducao={quantidadeProducao}
                      onChangeQuantidade={setQuantidadeProducao}
                      onRegistrar={registrarProducao}
                      salvando={salvandoProducao}
                      bloqueado={turnoBloqueado}
                    />
                  </TabsContent>

                  <TabsContent value="PERDA" className="mt-4">
                    <FormApontamentoRapidoPerda
                      quantidadePerda={quantidadePerda}
                      onChangeQuantidadePerda={(valor) => setQuantidadePerda(valor)}
                      totalProducoesRegistradas={totalProducoesRegistradas}
                      onRegistrar={registrarPerda}
                      salvando={salvandoPerda}
                      bloqueado={turnoBloqueado}
                    />
                  </TabsContent>

                  <TabsContent value="PARADA" className="mt-4">
                    <FormApontamentoRapidoParada
                      codigoParadaBusca={codigoParadaBusca}
                      paradaSelecionada={paradaSelecionada}
                      horaInicialParada={horaInicialParada}
                      horaFinalParada={horaFinalParada}
                      observacaoParada={observacaoParada}
                      duracaoParadaFormatada={duracaoParadaFormatada}
                      onAbrirBuscaParadas={abrirBuscaParadas}
                      onChangeHoraInicial={atualizarHoraInicialParada}
                      onBlurHoraInicial={finalizarHoraInicialParada}
                      onChangeHoraFinal={atualizarHoraFinalParada}
                      onBlurHoraFinal={finalizarHoraFinalParada}
                      onChangeObservacao={setObservacaoParada}
                      onRegistrar={registrarParada}
                      salvando={salvandoParada}
                      bloqueado={turnoBloqueado}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Nenhum turno selecionado para apontamento rápido.
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ModalBuscaParadas
        aberto={modalBuscaParadasAberto}
        onFechar={() => setModalBuscaParadasAberto(false)}
        onSelecionarParada={selecionarParada}
        paradasGerais={paradasGerais}
        carregando={carregandoParadas}
        erro={erroParadas}
      />
    </>
  )
}
