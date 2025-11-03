/**
 * Modal de Cadastro de Amostra
 * Permite registrar amostras de Flash de Linha ou Reator vinculadas a uma OP
 */

import { useState, useEffect } from 'react'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { FileText, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

/**
 * Tipos de amostra disponíveis
 */
export type TipoAmostra = 'Flash de Linha' | 'Reator'

/**
 * Interface para dados da amostra
 */
export interface DadosAmostra {
  id: string
  tipoAmostra: TipoAmostra
  opId: string
  opDescricao: string
  dataHoraColeta: string
  observacoes?: string
  usuarioId: number
  usuarioNome: string
  dataHoraCadastro: string
}

interface ModalCadastroAmostraProps {
  aberto: boolean
  onFechar: () => void
  onSalvar: (amostra: Omit<DadosAmostra, 'id' | 'dataHoraCadastro' | 'usuarioId' | 'usuarioNome'>) => void
  ops: OrdemProducao[]
}

export default function ModalCadastroAmostra({
  aberto,
  onFechar,
  onSalvar,
  ops,
}: ModalCadastroAmostraProps) {
  // Estados do formulário
  const [tipoAmostra, setTipoAmostra] = useState<TipoAmostra | ''>('')
  const [opSelecionada, setOpSelecionada] = useState<string>('')
  const [dataHoraColeta, setDataHoraColeta] = useState<string>('')
  const [observacoes, setObservacoes] = useState<string>('')

  // Estado de validação
  const [erros, setErros] = useState<{
    tipoAmostra?: string
    opSelecionada?: string
    dataHoraColeta?: string
  }>({})

  /**
   * Inicializa data/hora atual quando o modal é aberto
   */
  useEffect(() => {
    if (aberto) {
      // Preenche com data/hora atual no formato datetime-local
      const agora = new Date()
      const dataHoraLocal = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
      setDataHoraColeta(dataHoraLocal)
    }
  }, [aberto])

  /**
   * Limpa o formulário
   */
  const limparFormulario = () => {
    setTipoAmostra('')
    setOpSelecionada('')
    setDataHoraColeta('')
    setObservacoes('')
    setErros({})
  }

  /**
   * Valida os campos do formulário
   */
  const validarFormulario = (): boolean => {
    const novosErros: typeof erros = {}

    if (!tipoAmostra) {
      novosErros.tipoAmostra = 'Selecione o tipo de amostra'
    }

    if (!opSelecionada) {
      novosErros.opSelecionada = 'Selecione uma Ordem de Produção'
    }

    if (!dataHoraColeta) {
      novosErros.dataHoraColeta = 'Informe a data e hora da coleta'
    }

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  /**
   * Manipula o cancelamento
   */
  const handleCancelar = () => {
    limparFormulario()
    onFechar()
  }

  /**
   * Manipula o salvamento
   */
  const handleSalvar = () => {
    if (!validarFormulario()) {
      toast.error('Preencha todos os campos obrigatórios', {
        description: 'Verifique os campos destacados em vermelho',
        duration: 4000,
      })
      return
    }

    // Encontra a OP selecionada para obter a descrição
    const op = ops.find((o) => o.op === opSelecionada)
    if (!op) {
      toast.error('OP não encontrada', {
        description: 'A Ordem de Produção selecionada não foi encontrada',
        duration: 4000,
      })
      return
    }

    // Prepara os dados da amostra
    const dadosAmostra = {
      tipoAmostra: tipoAmostra as TipoAmostra,
      opId: opSelecionada,
      opDescricao: `${op.produto} - Lote ${op.lote}`,
      dataHoraColeta: new Date(dataHoraColeta).toISOString(),
      observacoes: observacoes.trim() || undefined,
    }

    console.log('📋 Salvando amostra:', dadosAmostra)

    // Chama o callback de salvamento
    onSalvar(dadosAmostra)

    // Limpa o formulário e fecha o modal
    limparFormulario()
  }

  /**
   * Filtra OPs que estão em produção (não Planejado nem Concluído)
   */
  const opsDisponiveis = ops.filter(
    (op) => !['Planejado', 'Concluído'].includes(op.fase)
  )

  return (
    <Dialog open={aberto} onOpenChange={(open) => !open && handleCancelar()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Cadastro de Amostra</DialogTitle>
              <DialogDescription className="mt-1">
                Registre a coleta de amostra de Flash de Linha ou Reator
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Tipo de Amostra */}
          <div className="space-y-2">
            <Label htmlFor="tipo-amostra" className="text-sm font-medium">
              Tipo de Amostra <span className="text-destructive">*</span>
            </Label>
            <Select
              value={tipoAmostra}
              onValueChange={(value) => {
                setTipoAmostra(value as TipoAmostra)
                setErros((prev) => ({ ...prev, tipoAmostra: undefined }))
              }}
            >
              <SelectTrigger
                id="tipo-amostra"
                className={erros.tipoAmostra ? 'border-destructive' : ''}
              >
                <SelectValue placeholder="Selecione o tipo de amostra" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Flash de Linha">Flash de Linha</SelectItem>
                <SelectItem value="Reator">Reator</SelectItem>
              </SelectContent>
            </Select>
            {erros.tipoAmostra && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>{erros.tipoAmostra}</span>
              </div>
            )}
          </div>

          {/* Ordem de Produção */}
          <div className="space-y-2">
            <Label htmlFor="op" className="text-sm font-medium">
              Ordem de Produção <span className="text-destructive">*</span>
            </Label>
            <Select
              value={opSelecionada}
              onValueChange={(value) => {
                setOpSelecionada(value)
                setErros((prev) => ({ ...prev, opSelecionada: undefined }))
              }}
            >
              <SelectTrigger
                id="op"
                className={erros.opSelecionada ? 'border-destructive' : ''}
              >
                <SelectValue placeholder="Selecione uma OP" />
              </SelectTrigger>
              <SelectContent>
                {opsDisponiveis.length === 0 ? (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                    Nenhuma OP em produção disponível
                  </div>
                ) : (
                  opsDisponiveis.map((op) => (
                    <SelectItem key={op.op} value={op.op}>
                      <div className="flex flex-col">
                        <span className="font-medium">{op.op}</span>
                        <span className="text-xs text-muted-foreground">
                          {op.produto} - Lote {op.lote} ({op.fase})
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {erros.opSelecionada && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>{erros.opSelecionada}</span>
              </div>
            )}
          </div>

          {/* Data e Hora da Coleta */}
          <div className="space-y-2">
            <Label htmlFor="data-hora-coleta" className="text-sm font-medium">
              Data e Hora da Coleta <span className="text-destructive">*</span>
            </Label>
            <Input
              id="data-hora-coleta"
              type="datetime-local"
              value={dataHoraColeta}
              onChange={(e) => {
                setDataHoraColeta(e.target.value)
                setErros((prev) => ({ ...prev, dataHoraColeta: undefined }))
              }}
              className={erros.dataHoraColeta ? 'border-destructive' : ''}
            />
            {erros.dataHoraColeta && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>{erros.dataHoraColeta}</span>
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-sm font-medium">
              Observações <span className="text-muted-foreground text-xs">(opcional)</span>
            </Label>
            <Textarea
              id="observacoes"
              placeholder="Informações adicionais sobre a coleta da amostra..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {observacoes.length} caracteres
            </p>
          </div>

          {/* Informação ALCOA+ */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/20">
            <p className="text-xs text-blue-900 dark:text-blue-200">
              <strong>ALCOA+:</strong> Este registro será atribuído ao usuário atual com timestamp
              automático, garantindo rastreabilidade completa conforme BPF.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancelar}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar}>
            Salvar Amostra
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

