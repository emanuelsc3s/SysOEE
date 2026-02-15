import { AlertTriangle, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FormApontamentoRapidoPerdaProps = {
  quantidadePerda: string
  onChangeQuantidadePerda: (valor: string) => void
  totalProducoesRegistradas: number
  onRegistrar: () => Promise<void>
  salvando: boolean
  bloqueado: boolean
}

export function FormApontamentoRapidoPerda({
  quantidadePerda,
  onChangeQuantidadePerda,
  totalProducoesRegistradas,
  onRegistrar,
  salvando,
  bloqueado
}: FormApontamentoRapidoPerdaProps) {
  const semProducao = totalProducoesRegistradas <= 0

  return (
    <div className="space-y-4">
      {semProducao && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <p className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4" />
            Perda bloqueada
          </p>
          <p className="mt-1">
            Registre ao menos uma produção no turno para liberar apontamento de perda.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="perda-rapida-oee">Quantidade de perda</Label>
        <Input
          id="perda-rapida-oee"
          type="text"
          inputMode="decimal"
          value={quantidadePerda}
          onChange={(event) => onChangeQuantidadePerda(event.target.value)}
          disabled={bloqueado || salvando}
          placeholder="Ex: 12,5"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => void onRegistrar()}
          disabled={bloqueado || salvando || semProducao}
          className="min-w-40"
        >
          {salvando ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Registrar Perda
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
