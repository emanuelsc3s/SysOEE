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
import { Package } from 'lucide-react'

interface DialogoApontamentoEmbalagemProps {
  /** OP que está indo para Embalagem */
  op: OrdemProducao | null
  /** Se o diálogo está aberto */
  aberto: boolean
  /** Callback ao cancelar (retorna OP para fase original) */
  onCancelar: () => void
  /** Callback ao confirmar com dados informados */
  onConfirmar: (quantidadeEnvasadaUnidades: number, perdasEnvaseUnidades: number) => void
}

export default function DialogoApontamentoEmbalagem({
  op,
  aberto,
  onCancelar,
  onConfirmar,
}: DialogoApontamentoEmbalagemProps) {
  // Campos do formulário
  const [quantidadeEnvasada, setQuantidadeEnvasada] = useState('')
  const [perdasEnvase, setPerdasEnvase] = useState('')

  // Erros de validação
  const [erro, setErro] = useState<string | undefined>(undefined)
  const [erroPerda, setErroPerda] = useState<string | undefined>(undefined)

  // Pré-preenche quando abrir (se já houver dados na OP)
  useEffect(() => {
    if (aberto && op) {
      setQuantidadeEnvasada(
        op.quantidadeEnvasadaUnidades !== undefined && op.quantidadeEnvasadaUnidades > 0
          ? String(op.quantidadeEnvasadaUnidades)
          : ''
      )
      setPerdasEnvase(
        op.perdasEnvaseUnidades !== undefined && op.perdasEnvaseUnidades >= 0
          ? String(op.perdasEnvaseUnidades)
          : ''
      )
      setErro(undefined)
      setErroPerda(undefined)
    }
  }, [aberto, op])

  const validar = (): boolean => {
    let valido = true

    // Validação da Quantidade Envasada (Obrigatória > 0)
    const qtd = parseFloat(quantidadeEnvasada)
    if (!quantidadeEnvasada || isNaN(qtd)) {
      setErro('Campo obrigatório')
      valido = false
    } else if (qtd <= 0) {
      setErro('Deve ser maior que zero')
      valido = false
    } else {
      setErro(undefined)
    }

    // Validação de Perdas (Opcional ≥ 0)
    const perdasStr = perdasEnvase.trim()
    if (perdasStr !== '') {
      const perdas = parseFloat(perdasStr)
      if (isNaN(perdas)) {
        setErroPerda('Valor inválido')
        valido = false
      } else if (perdas < 0) {
        setErroPerda('Não pode ser negativo')
        valido = false
      } else {
        setErroPerda(undefined)
      }
    } else {
      // vazio é permitido → salvo como 0
      setErroPerda(undefined)
    }

    return valido
  }

  const handleSalvar = () => {
    if (!validar()) return
    const qtd = parseFloat(quantidadeEnvasada)
    const perdasStr = perdasEnvase.trim()
    const perdas = perdasStr === '' ? 0 : parseFloat(perdasStr)
    onConfirmar(qtd, isNaN(perdas) ? 0 : perdas)
  }

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
            Apontamento de Envase - OP {op.op}
          </DialogTitle>
          <DialogDescription>
            Informe a quantidade envasada (Unidades) e, se houver, as perdas (Unidades). Este apontamento é obrigatório para prosseguir para Embalagem.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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

          {/* Quantidade Envasada (ML) */}
          <div className="space-y-2">
            <Label htmlFor="qtdEnvasada" className="flex items-center gap-2">
              Quantidade Envasada (Unidades) *
            </Label>
            <Input
              id="qtdEnvasada"
              type="number"
              min="1"
              step="1"
              placeholder="Ex: 90000"
              value={quantidadeEnvasada}
              onChange={(e) => {
                setQuantidadeEnvasada(e.target.value)
                if (erro) setErro(undefined)
              }}
              onKeyPress={handleKeyPress}
              className={erro ? 'border-red-500' : ''}
              autoFocus
            />
            {erro && (
              <p className="text-sm text-red-500">{erro}</p>
            )}
          </div>

          {/* Quantidade de Perda (Unidades) - Opcional */}
          <div className="space-y-2">
            <Label htmlFor="perdasEnvase" className="flex items-center gap-2">
              Quantidade de Perda (Unidades)
            </Label>
            <Input
              id="perdasEnvase"
              type="number"
              min="0"
              step="1"
              placeholder="Ex: 100"
              value={perdasEnvase}
              onChange={(e) => {
                setPerdasEnvase(e.target.value)
                if (erroPerda) setErroPerda(undefined)
              }}
              onKeyPress={handleKeyPress}
              className={erroPerda ? 'border-red-500' : ''}
            />
            {erroPerda && (
              <p className="text-sm text-red-500">{erroPerda}</p>
            )}
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

