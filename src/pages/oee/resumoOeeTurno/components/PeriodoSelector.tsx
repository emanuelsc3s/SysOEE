import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { formatarDataDigitada, parseDataParaDate } from '../utils/date'

type PeriodoSelectorProps = {
  dataInicio: string
  dataFim: string
  onDataInicioChange: (valor: string) => void
  onDataFimChange: (valor: string) => void
}

export function PeriodoSelector({
  dataInicio,
  dataFim,
  onDataInicioChange,
  onDataFimChange,
}: PeriodoSelectorProps) {
  const [calendarioInicioAberto, setCalendarioInicioAberto] = useState(false)
  const [calendarioFimAberto, setCalendarioFimAberto] = useState(false)

  const dataInicioSelecionada = useMemo(() => parseDataParaDate(dataInicio), [dataInicio])
  const dataFimSelecionada = useMemo(() => parseDataParaDate(dataFim), [dataFim])

  return (
    <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-2">
      <div className="space-y-1 sm:space-y-0">
        <Label htmlFor="periodo-data-inicial" className="text-sm text-gray-500 sm:hidden">Data inicial</Label>
        <div className="flex items-center gap-2">
          <Input
            id="periodo-data-inicial"
            name="periodo_data_inicial"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="dd/mm/aaaa"
            className="h-10 w-full min-w-0 rounded-md border border-gray-200 bg-white text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-brand-primary/30"
            value={dataInicio}
            onChange={(event) => onDataInicioChange(formatarDataDigitada(event.target.value))}
          />
          <Popover open={calendarioInicioAberto} onOpenChange={setCalendarioInicioAberto}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                aria-label="Selecionar data inicial"
              >
                <CalendarIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={dataInicioSelecionada}
                captionLayout="dropdown"
                locale={ptBR}
                onSelect={(date) => {
                  if (date) {
                    onDataInicioChange(format(date, 'dd/MM/yyyy'))
                  }
                  setCalendarioInicioAberto(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <span className="hidden text-sm text-gray-400 sm:inline">até</span>

      <div className="space-y-1 sm:space-y-0">
        <Label htmlFor="periodo-data-final" className="text-sm text-gray-500 sm:hidden">Data final</Label>
        <div className="flex items-center gap-2">
          <Input
            id="periodo-data-final"
            name="periodo_data_final"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="dd/mm/aaaa"
            className="h-10 w-full min-w-0 rounded-md border border-gray-200 bg-white text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-brand-primary/30"
            value={dataFim}
            onChange={(event) => onDataFimChange(formatarDataDigitada(event.target.value))}
          />
          <Popover open={calendarioFimAberto} onOpenChange={setCalendarioFimAberto}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                aria-label="Selecionar data final"
              >
                <CalendarIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={dataFimSelecionada}
                captionLayout="dropdown"
                locale={ptBR}
                onSelect={(date) => {
                  if (date) {
                    onDataFimChange(format(date, 'dd/MM/yyyy'))
                  }
                  setCalendarioFimAberto(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
