/**
 * Página de Cadastro/Edição de Turno
 * Formulário completo para criar ou editar turnos
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { useTurnos } from '@/hooks/useTurnos'
import {
  TurnoFormData,
  TURNO_INITIAL_VALUES,
  META_OEE_OPTIONS,
  MetaOeeTipo,
  isValidTimeFormat,
  calcularDuracaoTurno
} from '@/types/turno'
import { toast } from '@/hooks/use-toast'
import { ArrowLeft, Save, Trash2, Clock, Target, Info } from 'lucide-react'

export default function TurnosCad() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { loading, fetchTurno, saveTurno, deleteTurno } = useTurnos()

  // Estado do formulário
  const [formData, setFormData] = useState<TurnoFormData>(TURNO_INITIAL_VALUES)
  const [metaOeeTipo, setMetaOeeTipo] = useState<MetaOeeTipo>('PADRAO')

  // Estados de UI
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [duracaoTurno, setDuracaoTurno] = useState<number>(0)

  const metaPadraoValue = META_OEE_OPTIONS.find((option) => option.value === 'PADRAO')?.metaValue ?? 85

  const resolverTipoMetaOee = (valor: number): MetaOeeTipo => {
    if (valor <= 0) return 'SEM_META'
    if (valor === metaPadraoValue) return 'PADRAO'
    return 'PERSONALIZADA'
  }

  // Carregar dados ao montar (modo edição)
  useEffect(() => {
    if (id && id !== 'novo') {
      loadData()
    }
  }, [id])

  // Calcular duração quando horários mudarem
  useEffect(() => {
    if (formData.horaInicio && formData.horaFim) {
      const duracao = calcularDuracaoTurno(formData.horaInicio, formData.horaFim)
      setDuracaoTurno(duracao)
    } else {
      setDuracaoTurno(0)
    }
  }, [formData.horaInicio, formData.horaFim])

  const loadData = async () => {
    try {
      const data = await fetchTurno(id!)
      setFormData(data)
      setMetaOeeTipo(resolverTipoMetaOee(data.metaOee))
    } catch (error) {
      console.error('Erro ao carregar turno:', error)
      navigate('/turno')
    }
  }

  const handleMetaOeeSelect = (value: MetaOeeTipo) => {
    setMetaOeeTipo(value)

    const option = META_OEE_OPTIONS.find((item) => item.value === value)

    if (option?.metaValue !== undefined) {
      setFormData((prev) => ({ ...prev, metaOee: option.metaValue ?? prev.metaOee }))
      return
    }

    setFormData((prev) => ({
      ...prev,
      metaOee: prev.metaOee > 0 ? prev.metaOee : 0
    }))
  }

  const handleSave = async () => {
    try {
      const metaOeeValor = metaOeeTipo === 'PADRAO'
        ? metaPadraoValue
        : metaOeeTipo === 'SEM_META'
          ? 0
          : formData.metaOee

      // Validações
      if (!formData.codigo.trim()) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'O código do turno é obrigatório',
        })
        return
      }

      if (!formData.turno.trim()) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'O nome do turno é obrigatório',
        })
        return
      }

      if (formData.horaInicio && !isValidTimeFormat(formData.horaInicio)) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'Hora de início inválida. Use o formato HH:MM',
        })
        return
      }

      if (formData.horaFim && !isValidTimeFormat(formData.horaFim)) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'Hora de fim inválida. Use o formato HH:MM',
        })
        return
      }

      if (metaOeeTipo === 'PERSONALIZADA' && (!metaOeeValor || metaOeeValor <= 0)) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'Informe uma meta personalizada maior que zero',
        })
        return
      }

      if (metaOeeValor < 0 || metaOeeValor > 100) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'Meta OEE deve estar entre 0 e 100',
        })
        return
      }

      // Salvar
      await saveTurno({ ...formData, metaOee: metaOeeValor })
      navigate('/turno', { state: { shouldRefresh: true } })
    } catch (error) {
      console.error('Erro ao salvar turno:', error)
    }
  }

  const handleDelete = async () => {
    try {
      if (id && id !== 'novo') {
        await deleteTurno(id)
        navigate('/turno', { state: { shouldRefresh: true } })
      }
    } catch (error) {
      console.error('Erro ao excluir turno:', error)
    }
  }

  const handleVoltar = () => {
    navigate('/turno')
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleVoltar}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {id && id !== 'novo' ? 'Editar Turno' : 'Novo Turno'}
            </h1>
            <p className="text-sm text-gray-500">
              {id && id !== 'novo' ? `Editando turno #${id}` : 'Cadastrar novo turno de trabalho'}
            </p>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2">
          {id && id !== 'novo' && (
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={loading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          )}
          <Button onClick={handleSave} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Formulário */}
      <div className="grid gap-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Dados principais do turno de trabalho
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Código */}
              <div className="space-y-2">
                <Label htmlFor="codigo">
                  Código <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  placeholder="Ex: T1, T2, T3"
                  maxLength={10}
                />
              </div>

              {/* Nome do Turno */}
              <div className="space-y-2">
                <Label htmlFor="turno">
                  Nome do Turno <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="turno"
                  value={formData.turno}
                  onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
                  placeholder="Ex: 1º Turno, 2º Turno, Turno Noturno"
                  maxLength={50}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horários
            </CardTitle>
            <CardDescription>
              Defina os horários de início e fim do turno
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Hora Início */}
              <div className="space-y-2">
                <Label htmlFor="horaInicio">Hora de Início</Label>
                <Input
                  id="horaInicio"
                  type="time"
                  value={formData.horaInicio}
                  onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                />
              </div>

              {/* Hora Fim */}
              <div className="space-y-2">
                <Label htmlFor="horaFim">Hora de Fim</Label>
                <Input
                  id="horaFim"
                  type="time"
                  value={formData.horaFim}
                  onChange={(e) => setFormData({ ...formData, horaFim: e.target.value })}
                />
              </div>

              {/* Duração (calculada) */}
              <div className="space-y-2">
                <Label>Duração</Label>
                <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm font-medium">
                    {duracaoTurno > 0 ? `${duracaoTurno.toFixed(1)} horas` : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Informação sobre turnos que cruzam meia-noite */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-800">
                Turnos que cruzam meia-noite (ex: 22:00 - 06:00) são suportados automaticamente.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Meta OEE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Meta de OEE
            </CardTitle>
            <CardDescription>
              Defina a meta de eficiência para este turno
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Meta OEE - Select */}
              <div className="space-y-2">
                <Label htmlFor="metaOeeSelect">Meta OEE Padrão</Label>
                <Select
                  value={metaOeeTipo}
                  onValueChange={(value) => handleMetaOeeSelect(value as MetaOeeTipo)}
                >
                  <SelectTrigger id="metaOeeSelect">
                    <SelectValue placeholder="Selecione uma meta" />
                  </SelectTrigger>
                  <SelectContent>
                    {META_OEE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Meta OEE - Input customizado */}
              <div className="space-y-2">
                <Label htmlFor="metaOee">Meta OEE Personalizada (%)</Label>
                <Input
                  id="metaOee"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.metaOee}
                  onChange={(e) => setFormData({ ...formData, metaOee: parseFloat(e.target.value) || 0 })}
                  disabled={metaOeeTipo !== 'PERSONALIZADA'}
                  required={metaOeeTipo === 'PERSONALIZADA'}
                />
              </div>
            </div>

            {/* Visualização da meta */}
            <div className="p-4 bg-gray-50 border rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Meta Atual:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formData.metaOee.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o turno <strong>{formData.turno}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
