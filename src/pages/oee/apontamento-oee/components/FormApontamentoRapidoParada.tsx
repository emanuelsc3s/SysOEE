import { Loader2, Save, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { ParadaGeral } from '@/components/apontamento/ModalBuscaParadas'

type FormApontamentoRapidoParadaProps = {
  codigoParadaBusca: string
  paradaSelecionada: ParadaGeral | null
  horaInicialParada: string
  horaFinalParada: string
  observacaoParada: string
  duracaoParadaFormatada: string
  onAbrirBuscaParadas: () => Promise<void>
  onChangeHoraInicial: (valor: string) => void
  onBlurHoraInicial: (valor: string) => void
  onChangeHoraFinal: (valor: string) => void
  onBlurHoraFinal: (valor: string) => void
  onChangeObservacao: (valor: string) => void
  onRegistrar: () => Promise<void>
  salvando: boolean
  bloqueado: boolean
}

export function FormApontamentoRapidoParada({
  codigoParadaBusca,
  paradaSelecionada,
  horaInicialParada,
  horaFinalParada,
  observacaoParada,
  duracaoParadaFormatada,
  onAbrirBuscaParadas,
  onChangeHoraInicial,
  onBlurHoraInicial,
  onChangeHoraFinal,
  onBlurHoraFinal,
  onChangeObservacao,
  onRegistrar,
  salvando,
  bloqueado
}: FormApontamentoRapidoParadaProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tipo-parada-rapida-oee">Tipo de parada</Label>
        <div className="flex items-center gap-2">
          <Input
            id="tipo-parada-rapida-oee"
            value={codigoParadaBusca}
            readOnly
            placeholder="Selecione o código da parada"
            disabled={bloqueado || salvando}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => void onAbrirBuscaParadas()}
            disabled={bloqueado || salvando}
            title="Buscar tipo de parada"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {paradaSelecionada && (
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <p><span className="font-semibold text-foreground">Natureza:</span> {paradaSelecionada.natureza || 'N/A'}</p>
          <p><span className="font-semibold text-foreground">Classe:</span> {paradaSelecionada.classe || 'N/A'}</p>
          <p><span className="font-semibold text-foreground">Parada:</span> {paradaSelecionada.parada || 'N/A'}</p>
          <p><span className="font-semibold text-foreground">Descrição:</span> {paradaSelecionada.descricao || 'N/A'}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="hora-inicial-rapida-oee">Hora inicial</Label>
          <Input
            id="hora-inicial-rapida-oee"
            value={horaInicialParada}
            onChange={(event) => onChangeHoraInicial(event.target.value)}
            onBlur={(event) => onBlurHoraInicial(event.target.value)}
            placeholder="HH:MM"
            inputMode="numeric"
            maxLength={5}
            disabled={bloqueado || salvando}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hora-final-rapida-oee">Hora final</Label>
          <Input
            id="hora-final-rapida-oee"
            value={horaFinalParada}
            onChange={(event) => onChangeHoraFinal(event.target.value)}
            onBlur={(event) => onBlurHoraFinal(event.target.value)}
            placeholder="HH:MM"
            inputMode="numeric"
            maxLength={5}
            disabled={bloqueado || salvando}
          />
        </div>
      </div>

      {duracaoParadaFormatada && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
          Duração calculada: {duracaoParadaFormatada}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="observacao-parada-rapida-oee">Observações</Label>
        <Textarea
          id="observacao-parada-rapida-oee"
          value={observacaoParada}
          onChange={(event) => onChangeObservacao(event.target.value)}
          placeholder="Observações adicionais sobre a parada"
          className="min-h-24"
          disabled={bloqueado || salvando}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => void onRegistrar()}
          disabled={bloqueado || salvando}
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
              Registrar Parada
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
