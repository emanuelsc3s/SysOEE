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
  statusTurno: string | null
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
  statusTurno
}: ModalTurnoBloqueadoProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Turno {statusTurno === 'Fechado' ? 'Encerrado' : 'Cancelado'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            O turno atual está com status <strong>{statusTurno}</strong> e não pode ser editado.
            <br /><br />
            O registro de paradas e perdas não é permitido em turnos com status fechado ou cancelado.
            Isso garante a integridade temporal dos dados conforme os princípios ALCOA+.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={() => onOpenChange(false)}
            className="bg-destructive hover:bg-destructive/90"
          >
            Entendi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
