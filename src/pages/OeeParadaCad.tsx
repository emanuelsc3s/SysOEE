/**
 * Página de Cadastro/Edição de Parada OEE
 * Formulário completo para criar ou editar paradas
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { AppHeader } from '@/components/layout/AppHeader'
import { useOeeParada } from '@/hooks/useOeeParada'
import { useAuth } from '@/hooks/useAuth'
import {
  OeeParadaFormData,
  OEE_PARADA_INITIAL_VALUES,
  CLASSE_PARADA_OPTIONS,
  COMPONENTE_OEE_OPTIONS
} from '@/types/oee-parada'
import { toast } from '@/hooks/use-toast'
import { ArrowLeft, Save, Trash2, AlertTriangle, FileText } from 'lucide-react'

type OeeParadaCadLocationState = {
  returnSearchTerm?: string
}

export default function OeeParadaCad() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as OeeParadaCadLocationState | null
  const queryClient = useQueryClient()
  const { fetchParada, saveParada, deleteParada } = useOeeParada()
  const returnSearchTerm = typeof locationState?.returnSearchTerm === 'string'
    ? locationState.returnSearchTerm || ''
    : ''

  // Hook de autenticação
  const { user: authUser } = useAuth()

  // Derivar dados do usuário autenticado
  const user = {
    name: authUser?.usuario || authUser?.email?.split('@')[0] || 'Usuário',
    initials: (authUser?.usuario || authUser?.email)?.substring(0, 2).toUpperCase() || 'U',
    role: authUser?.perfil || 'Operador',
  }

  // Estado do formulário
  const [formData, setFormData] = useState<OeeParadaFormData>(OEE_PARADA_INITIAL_VALUES)

  // Estados de UI
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isFetchingData, setIsFetchingData] = useState(Boolean(id))
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadData = useCallback(async () => {
    if (!id) {
      return
    }

    try {
      setIsFetchingData(true)
      const data = await fetchParada(id)
      if (data) {
        setFormData(data)
      } else {
        navigate('/oee-parada')
      }
    } catch (error) {
      console.error('Erro ao carregar parada:', error)
      navigate('/oee-parada')
    } finally {
      setIsFetchingData(false)
    }
  }, [fetchParada, id, navigate])

  // Carregar dados ao montar (modo edição)
  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id, loadData])

  const handleSave = async () => {
    try {
      if (isSaving) {
        return
      }

      // Validar autenticação
      if (!authUser?.id) {
        toast({
          variant: 'destructive',
          title: 'Erro de autenticação',
          description: 'Você precisa estar logado para salvar. Faça login novamente.',
        })
        return
      }

      // Validações de formulário
      if (!formData.codigo.trim()) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'O código da parada é obrigatório',
        })
        return
      }

      setIsSaving(true)

      // Salvar (authUser.id é o UUID do Supabase Auth)
      const sucesso = await saveParada(formData, authUser.id)
      if (sucesso) {
        await queryClient.invalidateQueries({ queryKey: ['oee-paradas'] })
        navigate('/oee-parada', {
          state: {
            shouldRefresh: true,
            restoreSearchTerm: returnSearchTerm,
          }
        })
      }
    } catch (error) {
      console.error('Erro ao salvar parada:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      if (isDeleting) {
        return
      }

      // Validar autenticação
      if (!authUser?.id) {
        toast({
          variant: 'destructive',
          title: 'Erro de autenticação',
          description: 'Você precisa estar logado para excluir. Faça login novamente.',
        })
        return
      }

      if (id) {
        setIsDeleting(true)

        // authUser.id é o UUID do Supabase Auth
        const sucesso = await deleteParada(id, authUser.id)
        if (sucesso) {
          await queryClient.invalidateQueries({ queryKey: ['oee-paradas'] })
          navigate('/oee-parada', {
            state: {
              shouldRefresh: true,
              restoreSearchTerm: returnSearchTerm,
            }
          })
        }
      }
    } catch (error) {
      console.error('Erro ao excluir parada:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleVoltar = () => {
    navigate('/oee-parada', {
      state: {
        restoreSearchTerm: returnSearchTerm,
      }
    })
  }

  const isActionDisabled = isFetchingData || isSaving || isDeleting

  // Exibir loading enquanto carrega dados em modo edição
  if (id && isFetchingData && !formData.id) {
    return (
      <>
        <AppHeader
          title="SICFAR OEE - Cadastro de Paradas"
          userName={user.name}
          userInitials={user.initials}
          userRole={user.role}
        />
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-0 max-w-[1366px]">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Carregando dados...</div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Header da aplicação */}
      <AppHeader
        title="SICFAR OEE - Cadastro de Paradas"
        userName={user.name}
        userInitials={user.initials}
        userRole={user.role}
      />

      {/* Container principal */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-0 max-w-[1366px]">
        <div className="flex flex-col gap-4">
          {/* Cabeçalho responsivo */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-[#1f2937]">
                {id ? 'Editar Parada' : 'Nova Parada'}
              </h1>
              <p className="text-sm text-gray-500">
                {id ? `Editando parada #${id}` : 'Cadastrar novo tipo de parada para OEE'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 !bg-white !text-brand-primary !border-brand-primary hover:!bg-gray-50 hover:!border-brand-primary hover:!text-brand-primary min-h-10 px-4"
                onClick={handleVoltar}
                disabled={isSaving || isDeleting}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              {id && (
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isActionDisabled}
                  className="flex items-center justify-center gap-2 min-h-10 px-4"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? 'Excluindo...' : 'Excluir'}
                </Button>
              )}
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 !bg-brand-primary !text-white !border-brand-primary hover:!bg-brand-primary/90 hover:!border-brand-primary/90 hover:!text-white min-h-10 px-4"
                onClick={handleSave}
                disabled={isActionDisabled}
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>

          {/* Formulário */}
          <div className="flex flex-col gap-4">
            {/* Informações Básicas */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden mb-6">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 leading-tight flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Informações Básicas
                    </h2>
                    <p className="text-sm text-gray-500">
                      Dados principais da parada
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-4 sm:px-6 py-4 flex flex-col">
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
                      placeholder="Ex: P001, PAR-001"
                      maxLength={20}
                    />
                  </div>

                  {/* Parada */}
                  <div className="space-y-2">
                    <Label htmlFor="parada">Nome da Parada</Label>
                    <Input
                      id="parada"
                      value={formData.parada}
                      onChange={(e) => setFormData({ ...formData, parada: e.target.value })}
                      placeholder="Ex: Troca de Turno, Manutenção Preventiva"
                      maxLength={100}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Classificação */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden mb-6">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 leading-tight flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Classificação
                    </h2>
                    <p className="text-sm text-gray-500">
                      Defina como a parada afeta o cálculo de OEE
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-4 sm:px-6 py-4 flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Componente OEE */}
                  <div className="space-y-2">
                    <Label htmlFor="componente">Componente OEE</Label>
                    <Select
                      value={formData.componente || 'NONE'}
                      onValueChange={(value) => setFormData({ ...formData, componente: value === 'NONE' ? '' : value })}
                    >
                      <SelectTrigger id="componente">
                        <SelectValue placeholder="Selecione o componente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">Nenhum</SelectItem>
                        {COMPONENTE_OEE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Qual componente do OEE é afetado por esta parada
                    </p>
                  </div>

                  {/* Classe */}
                  <div className="space-y-2">
                    <Label htmlFor="classe">Classe</Label>
                    <Select
                      value={formData.classe || 'NONE'}
                      onValueChange={(value) => setFormData({ ...formData, classe: value === 'NONE' ? '' : value })}
                    >
                      <SelectTrigger id="classe">
                        <SelectValue placeholder="Selecione a classe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">Nenhuma</SelectItem>
                        {CLASSE_PARADA_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Planejada, Não Planejada ou Estratégica
                    </p>
                  </div>

                  {/* Natureza */}
                  <div className="space-y-2">
                    <Label htmlFor="natureza">Natureza</Label>
                    <Input
                      id="natureza"
                      value={formData.natureza}
                      onChange={(e) => setFormData({ ...formData, natureza: e.target.value })}
                      placeholder="Ex: Mecânica, Elétrica, Setup"
                      maxLength={50}
                    />
                    <p className="text-xs text-gray-500">
                      Tipo ou origem da parada
                    </p>
                  </div>
                </div>

                {/* Informação sobre classificação */}
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md mt-4">
                  <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Importante:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li><strong>Paradas Estratégicas</strong> NÃO entram no cálculo do OEE (são excluídas do tempo disponível)</li>
                      <li><strong>Pequenas paradas</strong> (menos de 10 min) afetam Performance, não Disponibilidade</li>
                      <li><strong>Paradas Planejadas/Não Planejadas</strong> afetam o componente Disponibilidade</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden mb-6">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 leading-tight">Descrição Detalhada</h2>
                    <p className="text-sm text-gray-500">
                      Informações adicionais sobre a parada
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-4 sm:px-6 py-4 flex flex-col">
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descreva detalhadamente o tipo de parada, quando deve ser utilizada, procedimentos associados, etc."
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500">
                    {formData.descricao?.length || 0}/500 caracteres
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dialog de confirmação de exclusão */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir a parada <strong>{formData.codigo}</strong>?
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? 'Excluindo...' : 'Excluir'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </>
  )
}
