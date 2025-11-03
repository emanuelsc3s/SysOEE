/**
 * Componente DialogoApontamentoEnvase - Apontamento obrigatório ao entrar em "Envase"
 *
 * Solicita os dados referentes à etapa anterior (Preparação):
 * - Quantidade Preparada (em ML)
 * - Quantidade de Perda (em ML)
 *
 * Validações:
 * - Quantidade Preparada > 0 (obrigatório)
 * - Quantidade de Perda >= 0 (opcional; pode ficar vazio ou 0)
 */

import { useEffect, useState } from 'react'
import { OrdemProducao } from '@/types/operacao'
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
import { AlertTriangle, Package } from 'lucide-react'

interface DialogoApontamentoEnvaseProps {
  /** OP que está entrando em Envase */
  op: OrdemProducao | null
  /** Se o diálogo está aberto */
  aberto: boolean
  /** Callback ao cancelar (retorna OP para fase original) */
  onCancelar: () => void
  /** Callback ao confirmar com dados informados */
  onConfirmar: (quantidadePreparadaMl: number, perdasPreparacaoMl: number) => void
}

export default function DialogoApontamentoEnvase({
  op,
  aberto,
  onCancelar,
  onConfirmar,
}: DialogoApontamentoEnvaseProps) {
  // Campos do formulário (string para facilitar validação/inputs)
  const [quantidadePreparada, setQuantidadePreparada] = useState('')
  const [perdasPreparacao, setPerdasPreparacao] = useState('')

  // Erros de validação
  const [erros, setErros] = useState<{
    quantidadePreparada?: string
    perdasPreparacao?: string
  }>({})

  // Pré-preenche quando abrir (se já houver dados na OP)
  useEffect(() => {
    if (aberto && op) {
      setQuantidadePreparada(
        op.quantidadePreparadaMl !== undefined && op.quantidadePreparadaMl > 0
          ? String(op.quantidadePreparadaMl)
          : ''
      )
      setPerdasPreparacao(
        op.perdasPreparacaoMl !== undefined && op.perdasPreparacaoMl >= 0
          ? String(op.perdasPreparacaoMl)
          : ''
      )
      setErros({})
    }
  }, [aberto, op])

  // Validação dos campos
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

  // Salva
  const handleSalvar = () => {
    if (!validarFormulario()) return

    const qtdPrep = parseFloat(quantidadePreparada)
    const qtdPerda = perdasPreparacao.trim() === '' ? 0 : parseFloat(perdasPreparacao)

    onConfirmar(qtdPrep, isNaN(qtdPerda) ? 0 : qtdPerda)
  }

  // Enter para salvar
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSalvar()
    }
  }

  if (!op) return null

  return (
    <Dialog open={aberto} onOpenChange={(open) => !open && onCancelar()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Apontamento de Preparação (ML) - OP {op.op}
          </DialogTitle>
          <DialogDescription>
            Informe os dados referentes à etapa de Preparação para prosseguir com o
            Envase. Este apontamento é obrigatório.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info da OP */}
          <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
            <p className="font-semibold text-foreground">{op.produto}</p>
            <p className="text-muted-foreground">Lote: {op.lote}</p>
            <p className="text-muted-foreground">
              Quantidade Teórica: {op.quantidadeTeorica.toLocaleString('pt-BR')} ML
            </p>
          </div>

          {/* Quantidade Preparada */}
          <div className="space-y-2">
            <Label htmlFor="quantidadePreparada" className="flex items-center gap-2">
              Quantidade Preparada (ML) *
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
              onKeyPress={handleKeyPress}
              className={erros.quantidadePreparada ? 'border-red-500' : ''}
              autoFocus
            />
            {erros.quantidadePreparada && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {erros.quantidadePreparada}
              </p>
            )}
          </div>

          {/* Quantidade de Perda com conversão automática */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="perdasPreparacao" className="flex items-center gap-2">
                  Quantidade de Perdas (mL)
                </Label>
                <Input
                  id="perdasPreparacao"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Ex: 120 (ou 0 se não houver)"
                  value={perdasPreparacao}
                  onChange={(e) => {
                    setPerdasPreparacao(e.target.value)
                    if (erros.perdasPreparacao) setErros({ ...erros, perdasPreparacao: undefined })
                  }}
                  onKeyPress={handleKeyPress}
                  className={erros.perdasPreparacao ? 'border-red-500' : ''}
                />
                {erros.perdasPreparacao && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {erros.perdasPreparacao}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="perdasPreparacaoLitros" className="flex items-center gap-2">
                  Quantidade de Perdas (L)
                </Label>
                <Input
                  id="perdasPreparacaoLitros"
                  type="text"
                  placeholder="0,00"
                  value={perdasPreparacao && !isNaN(parseFloat(perdasPreparacao))
                    ? (parseFloat(perdasPreparacao) / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : ''}
                  disabled
                  readOnly
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Conversão automática
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar}>Salvar e Prosseguir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

