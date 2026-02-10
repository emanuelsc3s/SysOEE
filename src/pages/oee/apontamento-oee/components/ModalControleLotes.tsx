import { Loader2, Package, Pencil, Plus, Save, Timer, Trash, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useLotes } from '../hooks/useLotes'
import { StatusTurnoLote } from '../types/lote.types'
import {
  converterDataBrParaIso,
  formatarDataDigitada,
  limparHoraDigitada,
  normalizarHoraDigitada,
} from '../utils/lote.utils'

interface ModalControleLotesProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  oeeturnoId: number | null
  statusTurno: StatusTurnoLote
  podeEditarTurnoFechado: boolean
  resolverTurnoId?: () => Promise<number | null>
  onTurnoIdResolvido?: (oeeturnoId: number) => void
  validarPermissaoEdicao?: (mensagemNegada: string) => Promise<boolean>
}

const converterNumeroEntrada = (valor: string): number => {
  if (!valor) {
    return 0
  }

  const numero = Number(valor.replace(',', '.'))
  return Number.isFinite(numero) ? numero : 0
}

export function ModalControleLotes({
  open,
  onOpenChange,
  oeeturnoId,
  statusTurno,
  podeEditarTurnoFechado,
  resolverTurnoId,
  onTurnoIdResolvido,
  validarPermissaoEdicao,
}: ModalControleLotesProps) {
  const {
    lotesProducao,
    carregandoLotes,
    dadosLote,
    setDadosLote,
    dataLoteDigitada,
    setDataLoteDigitada,
    dataFabricacaoDigitada,
    setDataFabricacaoDigitada,
    dataValidadeDigitada,
    setDataValidadeDigitada,
    salvandoLote,
    formularioLoteAberto,
    loteEmEdicao,
    totaisLotes,
    validarCamposLote,
    handleNovoLote,
    handleEditarLote,
    handleExcluirLote,
    handleSalvarLote,
    resetarFormularioLote,
  } = useLotes({
    aberto: open,
    oeeturnoId,
    resolverTurnoId,
    onTurnoIdResolvido,
    validarPermissaoEdicao,
  })

  const podeEditarLotes = statusTurno !== 'ENCERRADO' || podeEditarTurnoFechado

  return (
    <Dialog
      open={open}
      onOpenChange={(modalAberto) => {
        onOpenChange(modalAberto)
        if (!modalAberto) {
          resetarFormularioLote()
        }
      }}
    >
      <DialogContent className="sm:max-w-[1296px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Controle de Lotes
          </DialogTitle>
          <DialogDescription>
            {statusTurno === 'ENCERRADO' && !podeEditarTurnoFechado
              ? 'Visualize os lotes de produção do turno encerrado. O turno está encerrado, portanto não é possível adicionar ou editar lotes.'
              : statusTurno === 'ENCERRADO'
                ? 'Turno encerrado com permissão para ajustes. Você pode adicionar ou editar lotes.'
                : 'Visualize e gerencie os lotes de produção do turno atual. Utilize o botão abaixo para adicionar novos lotes.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
          {podeEditarLotes && (
            <div className="flex justify-end">
              <Button
                onClick={handleNovoLote}
                className="bg-brand-primary hover:bg-brand-primary/90"
                disabled={formularioLoteAberto}
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Lote
              </Button>
            </div>
          )}

          {formularioLoteAberto && podeEditarLotes && (
            <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">
                  {loteEmEdicao ? 'Editar Lote' : 'Novo Lote'}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetarFormularioLote}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="numero-lote" className="text-xs flex items-center gap-1">
                    Nº Lote <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="numero-lote"
                    type="text"
                    value={dadosLote.numeroLote}
                    onChange={(e) => setDadosLote((prev) => ({ ...prev, numeroLote: e.target.value }))}
                    placeholder="LT-001"
                    className="h-9"
                  />
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="data-lote" className="text-xs flex items-center gap-1">
                    Data Produção <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="data-lote"
                    type="text"
                    value={dataLoteDigitada}
                    onChange={(e) => {
                      const valorFormatado = formatarDataDigitada(e.target.value)
                      setDataLoteDigitada(valorFormatado)
                      const dataIso = converterDataBrParaIso(valorFormatado)
                      setDadosLote((prev) => ({ ...prev, data: dataIso }))
                    }}
                    onBlur={(e) => {
                      const valorFormatado = formatarDataDigitada(e.target.value)
                      const dataIso = converterDataBrParaIso(valorFormatado)
                      if (dataIso) {
                        setDataLoteDigitada(valorFormatado)
                        setDadosLote((prev) => ({ ...prev, data: dataIso }))
                        return
                      }

                      setDataLoteDigitada(valorFormatado)
                      setDadosLote((prev) => ({ ...prev, data: '' }))
                    }}
                    inputMode="numeric"
                    className="h-9"
                  />
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="fabricacao-lote" className="text-xs flex items-center gap-1">
                    Fabricação <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fabricacao-lote"
                    type="text"
                    value={dataFabricacaoDigitada}
                    onChange={(e) => {
                      const valorFormatado = formatarDataDigitada(e.target.value)
                      setDataFabricacaoDigitada(valorFormatado)
                      const dataIso = converterDataBrParaIso(valorFormatado)
                      setDadosLote((prev) => ({ ...prev, fabricacao: dataIso }))
                    }}
                    onBlur={(e) => {
                      const valorFormatado = formatarDataDigitada(e.target.value)
                      const dataIso = converterDataBrParaIso(valorFormatado)

                      if (dataIso) {
                        setDataFabricacaoDigitada(valorFormatado)
                        setDadosLote((prev) => ({ ...prev, fabricacao: dataIso }))
                        return
                      }

                      setDataFabricacaoDigitada(valorFormatado)
                      setDadosLote((prev) => ({ ...prev, fabricacao: '' }))
                    }}
                    inputMode="numeric"
                    className="h-9"
                  />
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="validade-lote" className="text-xs flex items-center gap-1">
                    Validade <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="validade-lote"
                    type="text"
                    value={dataValidadeDigitada}
                    onChange={(e) => {
                      const valorFormatado = formatarDataDigitada(e.target.value)
                      setDataValidadeDigitada(valorFormatado)
                      const dataIso = converterDataBrParaIso(valorFormatado)
                      setDadosLote((prev) => ({ ...prev, validade: dataIso }))
                    }}
                    onBlur={(e) => {
                      const valorFormatado = formatarDataDigitada(e.target.value)
                      const dataIso = converterDataBrParaIso(valorFormatado)

                      if (dataIso) {
                        setDataValidadeDigitada(valorFormatado)
                        setDadosLote((prev) => ({ ...prev, validade: dataIso }))
                        return
                      }

                      setDataValidadeDigitada(valorFormatado)
                      setDadosLote((prev) => ({ ...prev, validade: '' }))
                    }}
                    inputMode="numeric"
                    className="h-9"
                  />
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="hora-inicial-lote" className="text-xs flex items-center gap-1">
                    Hora Inicial <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="hora-inicial-lote"
                    type="text"
                    value={dadosLote.horaInicial}
                    onChange={(e) => setDadosLote((prev) => ({ ...prev, horaInicial: limparHoraDigitada(e.target.value) }))}
                    onBlur={(e) => setDadosLote((prev) => ({ ...prev, horaInicial: normalizarHoraDigitada(e.target.value, true) }))}
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={5}
                    className="h-9"
                  />
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="hora-final-lote" className="text-xs flex items-center gap-1">
                    Hora Final <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="hora-final-lote"
                    type="text"
                    value={dadosLote.horaFinal}
                    onChange={(e) => setDadosLote((prev) => ({ ...prev, horaFinal: limparHoraDigitada(e.target.value) }))}
                    onBlur={(e) => setDadosLote((prev) => ({ ...prev, horaFinal: normalizarHoraDigitada(e.target.value, true) }))}
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={5}
                    className="h-9"
                  />
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="quantidade-produzida-inicial-lote" className="text-xs flex items-center gap-1">
                    Qtd/Ciclo Inicial <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quantidade-produzida-inicial-lote"
                    type="number"
                    min="0"
                    step="0.0001"
                    value={dadosLote.quantidadeProduzidaInicial || ''}
                    onChange={(e) => {
                      setDadosLote((prev) => ({
                        ...prev,
                        quantidadeProduzidaInicial: converterNumeroEntrada(e.target.value),
                      }))
                    }}
                    placeholder="0"
                    className="h-9"
                  />
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="quantidade-produzida-final-lote" className="text-xs flex items-center gap-1">
                    Qtd/Ciclo Final <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quantidade-produzida-final-lote"
                    type="number"
                    min="0"
                    step="0.0001"
                    value={dadosLote.quantidadeProduzidaFinal || ''}
                    onChange={(e) => {
                      setDadosLote((prev) => ({
                        ...prev,
                        quantidadeProduzidaFinal: converterNumeroEntrada(e.target.value),
                      }))
                    }}
                    placeholder="0"
                    className="h-9"
                  />
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="quantidade-perdas-lote" className="text-xs">
                    Qtd. Perdas
                  </Label>
                  <Input
                    id="quantidade-perdas-lote"
                    type="number"
                    min="0"
                    step="0.0001"
                    value={dadosLote.quantidadePerdas || ''}
                    onChange={(e) => {
                      setDadosLote((prev) => ({
                        ...prev,
                        quantidadePerdas: converterNumeroEntrada(e.target.value),
                      }))
                    }}
                    placeholder="0"
                    className="h-9"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetarFormularioLote}
                    disabled={salvandoLote}
                    className="h-9"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSalvarLote}
                    disabled={salvandoLote || !validarCamposLote()}
                    className="h-9 bg-green-600 hover:bg-green-700"
                  >
                    {salvandoLote ? (
                      <Timer className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-auto border rounded-lg">
            {carregandoLotes ? (
              <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Carregando lotes...
              </div>
            ) : lotesProducao.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhum lote cadastrado ainda</p>
                <p className="text-sm">Clique em "Novo Lote" para adicionar o primeiro registro.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Nº Lote</TableHead>
                    <TableHead className="font-semibold">Data</TableHead>
                    <TableHead className="font-semibold">Hora Inicial</TableHead>
                    <TableHead className="font-semibold">Hora Final</TableHead>
                    <TableHead className="font-semibold text-right">Qtd/Ciclo Inicial</TableHead>
                    <TableHead className="font-semibold text-right">Qtd/Ciclo Final</TableHead>
                    <TableHead className="font-semibold text-right">Qtd. Produzida</TableHead>
                    <TableHead className="font-semibold text-right">Perdas</TableHead>
                    <TableHead className="font-semibold text-right">Total Produção</TableHead>
                    <TableHead className="font-semibold text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lotesProducao.map((lote, index) => (
                    <TableRow
                      key={lote.id}
                      className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                    >
                      <TableCell className="font-medium">{lote.numeroLote}</TableCell>
                      <TableCell>
                        {lote.data ? new Date(`${lote.data}T00:00:00`).toLocaleDateString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell>{lote.horaInicial}</TableCell>
                      <TableCell>{lote.horaFinal}</TableCell>
                      <TableCell className="text-right font-medium">
                        {lote.quantidadeProduzidaInicial.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {lote.quantidadeProduzidaFinal.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {lote.quantidadeProduzida.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {lote.quantidadePerdas.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="font-semibold text-right">
                        {lote.totalProducao.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {podeEditarLotes ? (
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => void handleEditarLote(lote)}
                              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                              title="Editar lote"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => void handleExcluirLote(lote.id)}
                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
                              title="Excluir lote"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center text-muted-foreground text-xs">
                            Consulta
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-muted font-bold">
                    <TableCell colSpan={4} className="text-right">
                      TOTAIS:
                    </TableCell>
                    <TableCell className="text-right">
                      {totaisLotes.totalProduzidoInicial.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      {totaisLotes.totalProduzidoFinal.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right text-green-700 font-bold">
                      {totaisLotes.totalProduzido.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right text-red-700">
                      {totaisLotes.totalPerdas.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-semibold text-right">
                      {totaisLotes.totalProducao.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
