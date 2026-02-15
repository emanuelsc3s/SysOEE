import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { JanelaFaltanteOEE } from '../types/apontamentoRapidoOee.types'

type FormApontamentoRapidoProducaoProps = {
  totalJanelas: number
  totalProducoesRegistradas: number
  janelasFaltantes: JanelaFaltanteOEE[]
  janelaSelecionada: string
  onSelecionarJanela: (janela: string) => void
  quantidadeProducao: string
  onChangeQuantidade: (valor: string) => void
  onRegistrar: () => Promise<void>
  salvando: boolean
  bloqueado: boolean
}

export function FormApontamentoRapidoProducao({
  totalJanelas,
  totalProducoesRegistradas,
  janelasFaltantes,
  janelaSelecionada,
  onSelecionarJanela,
  quantidadeProducao,
  onChangeQuantidade,
  onRegistrar,
  salvando,
  bloqueado
}: FormApontamentoRapidoProducaoProps) {
  const semJanelasFaltantes = janelasFaltantes.length === 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="rounded-md border border-border px-3 py-2 text-sm">
          <p className="text-muted-foreground">Janelas totais</p>
          <p className="font-semibold">{totalJanelas}</p>
        </div>
        <div className="rounded-md border border-border px-3 py-2 text-sm">
          <p className="text-muted-foreground">Já apontadas</p>
          <p className="font-semibold">{totalProducoesRegistradas}</p>
        </div>
        <div className="rounded-md border border-border px-3 py-2 text-sm">
          <p className="text-muted-foreground">Faltantes</p>
          <p className="font-semibold">{janelasFaltantes.length}</p>
        </div>
      </div>

      {semJanelasFaltantes ? (
        <div className="rounded-md border border-dashed border-green-300 bg-green-50 p-3 text-sm text-green-800">
          Todas as janelas hora a hora já possuem apontamento de produção.
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="janela-faltante-oee">Janela faltante (1h)</Label>
            <Select value={janelaSelecionada} onValueChange={onSelecionarJanela} disabled={bloqueado || salvando}>
              <SelectTrigger id="janela-faltante-oee">
                <SelectValue placeholder="Selecione a janela faltante" />
              </SelectTrigger>
              <SelectContent>
                {janelasFaltantes.map((janela) => (
                  <SelectItem key={janela.chave} value={janela.chave}>
                    {janela.horaInicio} - {janela.horaFim}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantidade-producao-rapida-oee">Quantidade produzida</Label>
            <Input
              id="quantidade-producao-rapida-oee"
              type="number"
              min="0"
              step="1"
              value={quantidadeProducao}
              onChange={(event) => onChangeQuantidade(event.target.value)}
              disabled={bloqueado || salvando}
              placeholder="Ex: 1500"
            />
          </div>
        </>
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => void onRegistrar()}
          disabled={bloqueado || salvando || semJanelasFaltantes}
          className="min-w-44"
        >
          {salvando ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Registrar Produção
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
