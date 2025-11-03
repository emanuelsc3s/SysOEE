/**
 * Modal de Apontamento de Preparação
 * Permite apontamentos parciais e finais durante a fase de Preparação
 * Exibe histórico de apontamentos realizados
 */

import { useState, useEffect, useCallback } from 'react'
import { OrdemProducao, ApontamentoPreparacao } from '@/types/operacao'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, Beaker, Clock, User, FileText, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ModalApontamentoPreparacaoProps {
  /** OP em fase de Preparação */
  op: OrdemProducao | null
  /** Se o modal está aberto */
  aberto: boolean
  /** Callback ao fechar o modal */
  onFechar: () => void
  /** Callback ao confirmar apontamento */
  onConfirmar: (apontamento: Omit<ApontamentoPreparacao, 'id' | 'dataHoraApontamento' | 'usuarioId' | 'usuarioNome'>) => void
}

export default function ModalApontamentoPreparacao({
  op,
  aberto,
  onFechar,
  onConfirmar,
}: ModalApontamentoPreparacaoProps) {
  // Estados do formulário
  const [quantidadePreparada, setQuantidadePreparada] = useState('')
  const [perdasPreparacao, setPerdasPreparacao] = useState('')
  const [observacao, setObservacao] = useState('')
  const [tipoApontamento, setTipoApontamento] = useState<'parcial' | 'final'>('parcial')

  // Estados de validação
  const [erros, setErros] = useState<{
    quantidadePreparada?: string
    perdasPreparacao?: string
  }>({})

  // Histórico de apontamentos (mock - será substituído por dados do banco)
  const [historico, setHistorico] = useState<ApontamentoPreparacao[]>([])

  /**
   * Carrega histórico de apontamentos do localStorage
   * TODO: Substituir por chamada ao banco de dados
   */
  const carregarHistorico = useCallback(() => {
    if (!op) return

    try {
      const historicoStr = localStorage.getItem(`apontamentos_preparacao_${op.op}`)
      if (historicoStr) {
        const dados = JSON.parse(historicoStr) as ApontamentoPreparacao[]
        setHistorico(dados)
      } else {
        setHistorico([])
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de apontamentos:', error)
      setHistorico([])
    }
  }, [op])

  // Limpa o formulário quando o modal abre
  useEffect(() => {
    if (aberto) {
      setQuantidadePreparada('')
      setPerdasPreparacao('')
      setObservacao('')
      setTipoApontamento('parcial')
      setErros({})

      // TODO: Carregar histórico de apontamentos do banco de dados
      // Por enquanto, usa dados mockados do localStorage
      carregarHistorico()
    }
  }, [aberto, carregarHistorico])

  /**
   * Valida os campos do formulário
   */
  const validarFormulario = (): boolean => {
    const novosErros: typeof erros = {}

    const qtdPrep = parseFloat(quantidadePreparada)
    if (!quantidadePreparada || isNaN(qtdPrep)) {
      novosErros.quantidadePreparada = 'Campo obrigatório'
    } else if (qtdPrep <= 0) {
      novosErros.quantidadePreparada = 'Deve ser maior que zero'
    }

    const qtdPerda = perdasPreparacao.trim() === '' ? 0 : parseFloat(perdasPreparacao)
    if (!isNaN(qtdPerda) && qtdPerda < 0) {
      novosErros.perdasPreparacao = 'Não pode ser negativo'
    }

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  /**
   * Salva o apontamento
   */
  const handleSalvar = () => {
    if (!validarFormulario() || !op) return

    const qtdPrep = parseFloat(quantidadePreparada)
    const qtdPerda = perdasPreparacao.trim() === '' ? 0 : parseFloat(perdasPreparacao)

    const novoApontamento: Omit<ApontamentoPreparacao, 'id' | 'dataHoraApontamento' | 'usuarioId' | 'usuarioNome'> = {
      op: op.op,
      quantidadePreparadaMl: qtdPrep,
      perdasPreparacaoMl: qtdPerda,
      tipo: tipoApontamento,
      observacao: observacao.trim() || undefined,
    }

    onConfirmar(novoApontamento)
  }

  /**
   * Calcula o total acumulado de apontamentos
   */
  const calcularTotais = () => {
    const totalPreparado = historico.reduce((acc, apt) => acc + apt.quantidadePreparadaMl, 0)
    const totalPerdas = historico.reduce((acc, apt) => acc + (apt.perdasPreparacaoMl || 0), 0)
    return { totalPreparado, totalPerdas }
  }

  /**
   * Converte mL para litros
   */
  const converterParaLitros = (ml: number): string => {
    return (ml / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  /**
   * Formata data e hora
   */
  const formatarDataHora = (dataHora: string): string => {
    try {
      return format(new Date(dataHora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    } catch {
      return dataHora
    }
  }

  if (!op) return null

  const { totalPreparado, totalPerdas } = calcularTotais()

  return (
    <Dialog open={aberto} onOpenChange={(open) => !open && onFechar()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5 text-primary" />
            Apontamento de Preparação - OP {op.op}
          </DialogTitle>
          <DialogDescription>
            Registre a quantidade preparada (em mL) e perdas. O sistema converterá automaticamente para litros.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Informações da OP */}
          <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
            <p className="font-semibold text-foreground">{op.produto}</p>
            <p className="text-muted-foreground">Lote: {op.lote}</p>
            <p className="text-muted-foreground">
              Quantidade Teórica: {op.quantidadeTeorica.toLocaleString('pt-BR')} mL ({converterParaLitros(op.quantidadeTeorica)} L)
            </p>
          </div>

          {/* Totais Acumulados */}
          {historico.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                  Totais Acumulados ({historico.length} apontamento{historico.length > 1 ? 's' : ''})
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Preparado:</span>
                  <p className="font-semibold text-foreground">
                    {totalPreparado.toLocaleString('pt-BR')} mL ({converterParaLitros(totalPreparado)} L)
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Perdas:</span>
                  <p className="font-semibold text-orange-700 dark:text-orange-400">
                    {totalPerdas.toLocaleString('pt-BR')} mL ({converterParaLitros(totalPerdas)} L)
                  </p>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Formulário de Apontamento */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Novo Apontamento</h3>

            {/* Tipo de Apontamento */}
            <div className="space-y-2">
              <Label>Tipo de Apontamento</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={tipoApontamento === 'parcial' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTipoApontamento('parcial')}
                  className="flex-1"
                >
                  Parcial
                </Button>
                <Button
                  type="button"
                  variant={tipoApontamento === 'final' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTipoApontamento('final')}
                  className="flex-1"
                >
                  Final
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {tipoApontamento === 'parcial' 
                  ? 'Apontamento durante a execução da fase' 
                  : 'Apontamento final ao concluir a preparação'}
              </p>
            </div>

            {/* Quantidade Preparada */}
            <div className="space-y-2">
              <Label htmlFor="quantidadePreparada" className="flex items-center gap-2">
                Quantidade Preparada (mL) *
              </Label>
              <Input
                id="quantidadePreparada"
                type="number"
                min="1"
                step="1"
                placeholder="Ex: 95000"
                value={quantidadePreparada}
                onChange={(e) => {
                  setQuantidadePreparada(e.target.value)
                  if (erros.quantidadePreparada) setErros({ ...erros, quantidadePreparada: undefined })
                }}
                className={erros.quantidadePreparada ? 'border-red-500' : ''}
                autoFocus
              />
              {quantidadePreparada && !isNaN(parseFloat(quantidadePreparada)) && (
                <p className="text-xs text-muted-foreground">
                  ≈ {converterParaLitros(parseFloat(quantidadePreparada))} litros
                </p>
              )}
              {erros.quantidadePreparada && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {erros.quantidadePreparada}
                </p>
              )}
            </div>

            {/* Perdas */}
            <div className="space-y-2">
              <Label htmlFor="perdasPreparacao">Perdas (mL)</Label>
              <Input
                id="perdasPreparacao"
                type="number"
                min="0"
                step="1"
                placeholder="Ex: 120 (ou deixe vazio se não houver)"
                value={perdasPreparacao}
                onChange={(e) => {
                  setPerdasPreparacao(e.target.value)
                  if (erros.perdasPreparacao) setErros({ ...erros, perdasPreparacao: undefined })
                }}
                className={erros.perdasPreparacao ? 'border-red-500' : ''}
              />
              {perdasPreparacao && !isNaN(parseFloat(perdasPreparacao)) && (
                <p className="text-xs text-muted-foreground">
                  ≈ {converterParaLitros(parseFloat(perdasPreparacao))} litros
                </p>
              )}
              {erros.perdasPreparacao && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {erros.perdasPreparacao}
                </p>
              )}
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacao">Observações (opcional)</Label>
              <Textarea
                id="observacao"
                placeholder="Adicione observações sobre este apontamento..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Histórico de Apontamentos */}
          {historico.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Histórico de Apontamentos</h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {historico.map((apt) => (
                    <div
                      key={apt.id}
                      className="bg-muted p-3 rounded-lg text-sm space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant={apt.tipo === 'final' ? 'default' : 'secondary'}>
                          {apt.tipo === 'final' ? 'Final' : 'Parcial'}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatarDataHora(apt.dataHoraApontamento)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-muted-foreground">Preparado:</span>
                          <p className="font-medium">
                            {apt.quantidadePreparadaMl.toLocaleString('pt-BR')} mL
                            <span className="text-xs text-muted-foreground ml-1">
                              ({converterParaLitros(apt.quantidadePreparadaMl)} L)
                            </span>
                          </p>
                        </div>
                        {apt.perdasPreparacaoMl && apt.perdasPreparacaoMl > 0 && (
                          <div>
                            <span className="text-muted-foreground">Perdas:</span>
                            <p className="font-medium text-orange-700 dark:text-orange-400">
                              {apt.perdasPreparacaoMl.toLocaleString('pt-BR')} mL
                              <span className="text-xs text-muted-foreground ml-1">
                                ({converterParaLitros(apt.perdasPreparacaoMl)} L)
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                      {apt.observacao && (
                        <div className="flex items-start gap-1 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{apt.observacao}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        {apt.usuarioNome}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onFechar}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar}>
            Salvar Apontamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

