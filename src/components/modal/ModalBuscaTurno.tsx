/**
 * Modal de Busca de Turno
 * Permite buscar e selecionar turnos da tabela tbturno
 * Segue padrão de modais de busca do projeto (ModalBuscaParadas, ModalSelecaoOperacao)
 */

import { useState, useMemo, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, X, Loader2 } from 'lucide-react'
import { useTurnos } from '@/hooks/useTurnos'
import { TurnoFormData } from '@/types/turno'

interface ModalBuscaTurnoProps {
  /** Controla se o modal está aberto */
  aberto: boolean
  /** Callback chamado quando o modal é fechado */
  onFechar: () => void
  /** Callback chamado quando um turno é selecionado */
  onSelecionarTurno: (turno: TurnoSelecionado) => void
}

/**
 * Dados do turno selecionado retornados ao componente pai
 */
export interface TurnoSelecionado {
  turno_id: string
  codigo: string
  turno: string
  horaInicio: string
  horaFim: string
}

export function ModalBuscaTurno({
  aberto,
  onFechar,
  onSelecionarTurno,
}: ModalBuscaTurnoProps) {
  const [termoBusca, setTermoBusca] = useState('')
  const { loading, turnos, fetchTurnos } = useTurnos()

  // Carregar turnos ao abrir o modal
  useEffect(() => {
    if (aberto) {
      console.log('🔍 ModalBuscaTurno: Modal aberto, carregando turnos...')
      fetchTurnos()
        .then((result) => {
          console.log('✅ ModalBuscaTurno: Turnos carregados:', result)
        })
        .catch((error) => {
          console.error('❌ ModalBuscaTurno: Erro ao carregar turnos:', error)
        })
    }
  }, [aberto, fetchTurnos])

  // Filtrar turnos com base no termo de busca
  const turnosFiltrados = useMemo(() => {
    console.log('🔍 ModalBuscaTurno: Filtrando turnos. Total:', turnos.length, 'Termo:', termoBusca)

    if (!termoBusca.trim()) {
      return turnos
    }

    const termo = termoBusca.toLowerCase()
    const filtrados = turnos.filter((turno) => {
      return (
        turno.codigo?.toLowerCase().includes(termo) ||
        turno.turno?.toLowerCase().includes(termo)
      )
    })

    console.log('🔍 ModalBuscaTurno: Turnos filtrados:', filtrados.length)
    return filtrados
  }, [termoBusca, turnos])

  /**
   * Seleciona um turno e fecha o modal
   */
  const handleSelecionarTurno = (turno: TurnoFormData) => {
    const turnoSelecionado: TurnoSelecionado = {
      turno_id: turno.id || '',
      codigo: turno.codigo,
      turno: turno.turno,
      horaInicio: turno.horaInicio,
      horaFim: turno.horaFim,
    }
    onSelecionarTurno(turnoSelecionado)
    handleFechar()
  }

  /**
   * Fecha o modal e limpa o termo de busca
   */
  const handleFechar = () => {
    setTermoBusca('')
    onFechar()
  }

  /**
   * Formata horário para exibição (HH:MM)
   */
  const formatarHorario = (horario: string | undefined): string => {
    if (!horario) return '--:--'
    // Remove segundos se existir (HH:MM:SS -> HH:MM)
    return horario.substring(0, 5)
  }

  return (
    <Dialog open={aberto} onOpenChange={handleFechar}>
      <DialogContent className="max-w-[90vw] w-[900px] max-h-[85vh] p-0 flex flex-col gap-0 min-h-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            Buscar Turno
          </DialogTitle>
          <DialogDescription className="text-base">
            Pesquise e selecione um turno de trabalho
          </DialogDescription>
        </DialogHeader>

        {/* Campo de Busca */}
        <div className="px-6 py-4 border-b bg-muted/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Digite para buscar por código ou nome do turno..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="pl-10 pr-10 h-12 text-base"
              autoFocus
            />
            {termoBusca && (
              <button
                onClick={() => setTermoBusca('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando turnos...
              </span>
            ) : (
              `${turnosFiltrados.length} turno(s) encontrado(s)`
            )}
          </p>
        </div>

        {/* Tabela de Turnos */}
        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : turnosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum turno encontrado</p>
              <p className="text-sm text-muted-foreground mt-2">
                Tente ajustar os termos de busca
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[15%]">Código</TableHead>
                  <TableHead className="w-[30%]">Turno</TableHead>
                  <TableHead className="w-[15%]">Hora Início</TableHead>
                  <TableHead className="w-[15%]">Hora Fim</TableHead>
                  <TableHead className="w-[15%]">Meta OEE</TableHead>
                  <TableHead className="w-[10%] text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turnosFiltrados.map((turno) => (
                  <TableRow
                    key={turno.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleSelecionarTurno(turno)}
                  >
                    <TableCell className="font-medium">{turno.codigo}</TableCell>
                    <TableCell>{turno.turno}</TableCell>
                    <TableCell>{formatarHorario(turno.horaInicio)}</TableCell>
                    <TableCell>{formatarHorario(turno.horaFim)}</TableCell>
                    <TableCell>
                      {turno.metaOee ? `${turno.metaOee.toFixed(1)}%` : '--'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelecionarTurno(turno)
                        }}
                      >
                        Selecionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Rodapé com botão de cancelar */}
        <DialogFooter className="border-t bg-background px-6 py-4 w-full">
          <Button variant="outline" onClick={handleFechar}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
