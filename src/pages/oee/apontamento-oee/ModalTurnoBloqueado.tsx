import type { ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from 'lucide-react'

interface ModalTurnoBloqueadoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  statusTurno?: string | null
  titulo?: string
  descricao?: ReactNode
  textoBotao?: string
}

/**
 * Modal de alerta exibido quando o usuário tenta editar um turno bloqueado
 * (status "Fechado" ou "Cancelado")
 *
 * Garante a integridade temporal dos dados conforme os princípios ALCOA+
 */
export function ModalTurnoBloqueado({
  open,
  onOpenChange,
  statusTurno,
  titulo,
  descricao,
  textoBotao
}: ModalTurnoBloqueadoProps) {
  const tituloPadrao = statusTurno === 'Fechado' ? 'Turno Encerrado' : 'Turno Cancelado'
  const descricaoPadrao = (
    <>
      O turno atual está com status <strong>{statusTurno}</strong> e não pode ser editado.
      <br /><br />
      O registro de paradas e perdas não é permitido em turnos com status fechado ou cancelado.
      Isso garante a integridade temporal dos dados conforme os princípios ALCOA+.
    </>
  )
  const tituloFinal = titulo ?? (statusTurno ? tituloPadrao : 'Ação bloqueada')
  const descricaoFinal = descricao ?? (statusTurno ? descricaoPadrao : 'A ação solicitada não pode ser realizada no momento.')
  const textoBotaoFinal = textoBotao ?? 'Entendi'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {tituloFinal}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {descricaoFinal}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={() => onOpenChange(false)}
            className="bg-destructive hover:bg-destructive/90"
          >
            {textoBotaoFinal}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
