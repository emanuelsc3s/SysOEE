/**
 * Componente DialogoConclusaoOP - Diálogos para conclusão de Ordem de Produção
 * 
 * Fluxo de conclusão em 2 etapas:
 * 1. Confirmação: Pergunta se deseja realmente concluir a OP
 * 2. Dados de Produção: Solicita quantidade produzida e perdas
 */

import { useState } from 'react'
import { OrdemProducao } from '@/types/operacao'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import { AlertTriangle, CheckCircle2, Package } from 'lucide-react'
import TimelineEtapasOP from './TimelineEtapasOP'

interface DialogoConclusaoOPProps {
  /** OP que está sendo concluída */
  op: OrdemProducao | null
  /** Se o diálogo de confirmação está aberto */
  aberto: boolean
  /** Callback ao cancelar (retorna OP para fase original) */
  onCancelar: () => void
  /** Callback ao confirmar conclusão com dados atualizados */
  onConfirmar: (quantidadeEmbaladaUnidades: number, perdas: number) => void
}

export default function DialogoConclusaoOP({
  op,
  aberto,
  onCancelar,
  onConfirmar,
}: DialogoConclusaoOPProps) {
  // Estados para controlar qual diálogo está aberto
  const [etapa, setEtapa] = useState<'confirmacao' | 'dados'>('confirmacao')

  // Estados para os campos do formulário
  const [quantidadeEmbalada, setQuantidadeEmbalada] = useState('')
  const [perdas, setPerdas] = useState('0')

  // Estados para validação
  const [erros, setErros] = useState<{
    quantidadeEmbalada?: string
    perdas?: string
  }>({})

  /**
   * Reseta o estado do diálogo
   */
  const resetarEstado = () => {
    setEtapa('confirmacao')
    setQuantidadeEmbalada('')
    setPerdas('0')
    setErros({})
  }

  /**
   * Manipula o cancelamento em qualquer etapa
   */
  const handleCancelar = () => {
    resetarEstado()
    onCancelar()
  }

  /**
   * Manipula a confirmação na primeira etapa (vai para etapa de dados)
   */
  const handleConfirmarPrimeiraEtapa = () => {
    // Pré-preenche com os valores atuais da OP (se existirem)
    if (op) {
      setQuantidadeEmbalada(op.quantidadeEmbaladaUnidades > 0 ? op.quantidadeEmbaladaUnidades.toString() : '')
      setPerdas(op.perdas > 0 ? op.perdas.toString() : '0')
    }
    setEtapa('dados')
  }

  /**
   * Valida os campos do formulário
   */
  const validarFormulario = (): boolean => {
    const novosErros: typeof erros = {}

    // Valida quantidade embalada
    const qtdEmbalada = parseFloat(quantidadeEmbalada)
    if (!quantidadeEmbalada || isNaN(qtdEmbalada)) {
      novosErros.quantidadeEmbalada = 'Campo obrigatório'
    } else if (qtdEmbalada <= 0) {
      novosErros.quantidadeEmbalada = 'Deve ser maior que zero'
    }

    // Valida perdas
    const qtdPerdas = parseFloat(perdas)
    if (!perdas || isNaN(qtdPerdas)) {
      novosErros.perdas = 'Campo obrigatório'
    } else if (qtdPerdas < 0) {
      novosErros.perdas = 'Não pode ser negativo'
    }

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  /**
   * Manipula o salvamento dos dados (segunda etapa)
   */
  const handleSalvar = () => {
    if (!validarFormulario()) {
      return
    }

    const qtdEmbalada = parseFloat(quantidadeEmbalada)
    const qtdPerdas = parseFloat(perdas)

    resetarEstado()
    onConfirmar(qtdEmbalada, qtdPerdas)
  }

  /**
   * Manipula a tecla Enter no formulário
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSalvar()
    }
  }

  if (!op) return null

  return (
    <>
      {/* Primeira Etapa: Confirmação */}
      <AlertDialog open={aberto && etapa === 'confirmacao'}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Confirmar Conclusão da OP
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p>Deseja realmente marcar esta Ordem de Produção como concluída?</p>
              
              <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
                <p className="font-semibold text-foreground">OP {op.op}</p>
                <p className="text-foreground">{op.produto}</p>
                <p className="text-muted-foreground">Lote: {op.lote}</p>
                <p className="text-muted-foreground">Equipamento: {op.equipamento}</p>
              </div>

              <p className="text-sm text-muted-foreground">
                Na próxima etapa, você deverá informar a quantidade embalada (Unidades) e as perdas.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelar}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmarPrimeiraEtapa}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Segunda Etapa: Dados de Produção */}
      <Dialog open={aberto && etapa === 'dados'} onOpenChange={(open) => !open && handleCancelar()}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Dados de Produção - OP {op.op}
            </DialogTitle>
            <DialogDescription>
              Informe a quantidade embalada (Unidades) e as perdas para concluir a OP.
            </DialogDescription>
          </DialogHeader>

          {/* Layout de duas colunas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Coluna Esquerda: Timeline */}
            <div className="border-r pr-6 md:border-r-border md:pr-6 border-r-0 pr-0 pb-6 border-b md:border-b-0 md:pb-0">
              <TimelineEtapasOP op={op} />
            </div>

            {/* Coluna Direita: Formulário */}
            <div className="space-y-4">
            {/* Informações do Produto */}
            <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
              <p className="font-semibold text-foreground">{op.produto}</p>
              <p className="text-muted-foreground">Lote: {op.lote}</p>
              <p className="text-muted-foreground">
                Quantidade Teórica: {op.quantidadeTeorica?.toLocaleString('pt-BR')} ML
              </p>
            </div>

            {/* Referência: Quantidade Preparada (ML) */}
            <div className="space-y-2">
              <Label htmlFor="qtdPreparada" className="flex items-center gap-2">
                Quantidade Preparada (ML)
              </Label>
              <Input
                id="qtdPreparada"
                type="text"
                value={op.quantidadePreparadaMl !== undefined ? op.quantidadePreparadaMl.toLocaleString('pt-BR') : '—'}
                disabled
              />
            </div>

            {/* Referência: Quantidade de Perda na Preparação (ML) */}
            <div className="space-y-2">
              <Label htmlFor="perdasPreparacao" className="flex items-center gap-2">
                Quantidade de Perda na Preparação (ML)
              </Label>
              <Input
                id="perdasPreparacao"
                type="text"
                value={op.perdasPreparacaoMl !== undefined ? op.perdasPreparacaoMl.toLocaleString('pt-BR') : '—'}
                disabled
              />
            </div>

            {/* Referência: Quantidade Envasada (Unidades) */}
            <div className="space-y-2">
              <Label htmlFor="qtdEnvasada" className="flex items-center gap-2">
                Quantidade Envasada (Unidades)
              </Label>
              <Input
                id="qtdEnvasada"
                type="text"
                value={op.quantidadeEnvasadaUnidades !== undefined ? op.quantidadeEnvasadaUnidades.toLocaleString('pt-BR') : '—'}
                disabled
              />
            </div>

            {/* Referência: Quantidade de Perda no Envase (Unidades) */}
            <div className="space-y-2">
              <Label htmlFor="perdasEnvase" className="flex items-center gap-2">
                Quantidade de Perda no Envase (Unidades)
              </Label>
              <Input
                id="perdasEnvase"
                type="text"
                value={op.perdasEnvaseUnidades !== undefined ? op.perdasEnvaseUnidades.toLocaleString('pt-BR') : '—'}
                disabled
              />
            </div>

            {/* Campo: Quantidade Embalada (Unidades) */}
            <div className="space-y-2">
              <Label htmlFor="quantidadeEmbalada" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Quantidade Embalada (Unidades) *
              </Label>
              <Input
                id="quantidadeEmbalada"
                type="number"
                min="1"
                step="1"
                placeholder="Ex: 9500"
                value={quantidadeEmbalada}
                onChange={(e) => {
                  setQuantidadeEmbalada(e.target.value)
                  // Limpa erro ao digitar
                  if (erros.quantidadeEmbalada) {
                    setErros({ ...erros, quantidadeEmbalada: undefined })
                  }
                }}
                onKeyPress={handleKeyPress}
                className={erros.quantidadeEmbalada ? 'border-red-500' : ''}
                autoFocus
              />
              {erros.quantidadeEmbalada && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {erros.quantidadeEmbalada}
                </p>
              )}
            </div>

            {/* Campo: Perdas */}
            <div className="space-y-2">
              <Label htmlFor="perdas" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                Perdas *
              </Label>
              <Input
                id="perdas"
                type="number"
                min="0"
                step="1"
                placeholder="Ex: 50 (ou 0 se não houver perdas)"
                value={perdas}
                onChange={(e) => {
                  setPerdas(e.target.value)
                  // Limpa erro ao digitar
                  if (erros.perdas) {
                    setErros({ ...erros, perdas: undefined })
                  }
                }}
                onKeyPress={handleKeyPress}
                className={erros.perdas ? 'border-red-500' : ''}
              />
              {erros.perdas && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {erros.perdas}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Informe 0 (zero) se não houver perdas
              </p>
            </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelar}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar}>
              Salvar e Concluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

