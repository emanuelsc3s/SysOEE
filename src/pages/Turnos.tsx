/**
 * Página de Listagem de Turnos
 * Exibe tabela com todos os turnos cadastrados e permite CRUD completo
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { useTurnos } from '@/hooks/useTurnos'
import { TurnoFormData, calcularDuracaoTurno } from '@/types/turno'
import { Plus, Search, Pencil, Trash2, Clock, Target, RefreshCw } from 'lucide-react'

export default function Turnos() {
  const navigate = useNavigate()
  const { loading, turnos, fetchTurnos, deleteTurno } = useTurnos()

  // Estados de filtro
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredTurnos, setFilteredTurnos] = useState<TurnoFormData[]>([])

  // Estados de UI
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [turnoToDelete, setTurnoToDelete] = useState<TurnoFormData | null>(null)

  // Carregar turnos ao montar
  useEffect(() => {
    loadTurnos()
  }, [])

  // Filtrar turnos quando searchTerm ou turnos mudar
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTurnos(turnos)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = turnos.filter(
        (turno) =>
          turno.codigo.toLowerCase().includes(term) ||
          turno.turno.toLowerCase().includes(term)
      )
      setFilteredTurnos(filtered)
    }
  }, [searchTerm, turnos])

  const loadTurnos = async () => {
    await fetchTurnos()
  }

  const handleNovo = () => {
    navigate('/turno/novo')
  }

  const handleEditar = (turno: TurnoFormData) => {
    navigate(`/turno/${turno.id}`)
  }

  const handleExcluirClick = (turno: TurnoFormData) => {
    setTurnoToDelete(turno)
    setIsDeleteDialogOpen(true)
  }

  const handleExcluirConfirm = async () => {
    if (turnoToDelete?.id) {
      try {
        await deleteTurno(turnoToDelete.id)
        setIsDeleteDialogOpen(false)
        setTurnoToDelete(null)
        await loadTurnos()
      } catch (error) {
        console.error('Erro ao excluir turno:', error)
      }
    }
  }

  const formatarHorario = (hora: string) => {
    if (!hora) return '-'
    return hora
  }

  const formatarMetaOEE = (meta: number) => {
    return `${meta.toFixed(1)}%`
  }

  const getBadgeMetaOEE = (meta: number) => {
    if (meta >= 90) return 'bg-green-500 hover:bg-green-600'
    if (meta >= 85) return 'bg-blue-500 hover:bg-blue-600'
    if (meta >= 80) return 'bg-yellow-500 hover:bg-yellow-600'
    return 'bg-orange-500 hover:bg-orange-600'
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Turnos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerenciamento de turnos de trabalho
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadTurnos}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={handleNovo}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Turno
          </Button>
        </div>
      </div>

      {/* Card com filtros e tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Turnos</CardTitle>
          <CardDescription>
            {filteredTurnos.length} {filteredTurnos.length === 1 ? 'turno encontrado' : 'turnos encontrados'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de busca */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por código ou nome do turno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabela */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Código</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead className="w-[120px]">Início</TableHead>
                  <TableHead className="w-[120px]">Fim</TableHead>
                  <TableHead className="w-[120px]">Duração</TableHead>
                  <TableHead className="w-[120px]">Meta OEE</TableHead>
                  <TableHead className="w-[120px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredTurnos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Nenhum turno encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTurnos.map((turno) => (
                    <TableRow key={turno.id}>
                      <TableCell className="font-medium">{turno.codigo}</TableCell>
                      <TableCell>{turno.turno}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          {formatarHorario(turno.horaInicio)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          {formatarHorario(turno.horaFim)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {turno.horaInicio && turno.horaFim
                          ? `${calcularDuracaoTurno(turno.horaInicio, turno.horaFim).toFixed(1)}h`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getBadgeMetaOEE(turno.metaOee)}>
                          <Target className="h-3 w-3 mr-1" />
                          {formatarMetaOEE(turno.metaOee)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditar(turno)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleExcluirClick(turno)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o turno <strong>{turnoToDelete?.turno}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExcluirConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

