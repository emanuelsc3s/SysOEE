/**
 * Página de Cadastro/Edição de Ordem de Serviço de Manutenção
 * Formulário completo com suporte a anexos em base64
 * Segue o padrão de design de OeeParadaCad.tsx
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { AppHeader } from '@/components/layout/AppHeader'
import { useAuth } from '@/hooks/useAuth'
import {
  ManutencaoOrdemServico,
  ManutencaoAnexo,
  MANUTENCAO_INITIAL_VALUES,
  PRIORIDADE_OPTIONS,
  DEPARTAMENTO_OPTIONS,
  CENTRO_CUSTO_OPTIONS,
} from '@/types/manutencao'
import {
  buscarOrdemPorId,
  salvarOrdem,
  atualizarOrdem,
  excluirOrdem,
} from '@/services/localStorage/manutencao.storage'
import { toast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  Save,
  Trash2,
  Wrench,
  FileText,
  Paperclip,
  Upload,
  X,
  CalendarIcon,
  ClipboardList,
  File,
  Image,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

function gerarId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

type ManutencaoCadLocationState = {
  returnSearchTerm?: string
  fromApontamento?: boolean
  oeeTurnoId?: number
  linhaId?: string
  linhaNome?: string
  skuCodigo?: string
  produtoDescricao?: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB por arquivo
const ACCEPTED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export default function ManutencaoCad() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as ManutencaoCadLocationState | null
  const returnSearchTerm = typeof locationState?.returnSearchTerm === 'string'
    ? locationState.returnSearchTerm || ''
    : ''
  const fromApontamento = Boolean(locationState?.fromApontamento)
  const oeeTurnoId = locationState?.oeeTurnoId
  const linhaId = locationState?.linhaId
  const linhaNome = locationState?.linhaNome
  const skuCodigo = locationState?.skuCodigo
  const produtoDescricao = locationState?.produtoDescricao

  const navegarRetorno = useCallback((extras?: Record<string, unknown>) => {
    if (fromApontamento && oeeTurnoId) {
      navigate(`/apontamento-oee?oeeturno_id=${oeeTurnoId}`, extras)
    } else {
      navigate('/manutencao', {
        state: {
          restoreSearchTerm: returnSearchTerm,
          oeeTurnoId,
          linhaId,
          linhaNome,
          skuCodigo,
          produtoDescricao,
          ...extras?.state as Record<string, unknown>,
        }
      })
    }
  }, [
    fromApontamento,
    linhaId,
    linhaNome,
    navigate,
    oeeTurnoId,
    produtoDescricao,
    returnSearchTerm,
    skuCodigo,
  ])

  const { user: authUser } = useAuth()

  const user = {
    name: authUser?.usuario || authUser?.email?.split('@')[0] || 'Usuário',
    initials: (authUser?.usuario || authUser?.email)?.substring(0, 2).toUpperCase() || 'U',
    role: authUser?.perfil || 'Operador',
  }

  const [formData, setFormData] = useState<ManutencaoOrdemServico>(() => {
    const initial = { ...MANUTENCAO_INITIAL_VALUES }
    if (!id && locationState) {
      initial.oeeturno_id = locationState.oeeTurnoId ?? null
      initial.linha_id = locationState.linhaId || ''
      initial.linha_nome = locationState.linhaNome || ''
      initial.sku_codigo = locationState.skuCodigo || ''
      initial.produto_descricao = locationState.produtoDescricao || ''
      initial.data = new Date().toISOString().split('T')[0]
    }
    return initial
  })

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isFetchingData, setIsFetchingData] = useState(Boolean(id))
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadData = useCallback(() => {
    if (!id) return

    try {
      setIsFetchingData(true)
      const data = buscarOrdemPorId(id)
      if (data) {
        setFormData(data)
      } else {
        toast({
          variant: 'destructive',
          title: 'Não encontrado',
          description: 'A ordem de serviço não foi encontrada.',
        })
        navegarRetorno()
      }
    } catch (error) {
      console.error('Erro ao carregar ordem de manutenção:', error)
      navegarRetorno()
    } finally {
      setIsFetchingData(false)
    }
  }, [id, navegarRetorno])

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id, loadData])

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const processarArquivos = async (files: FileList | File[]) => {
    const novosAnexos: ManutencaoAnexo[] = []

    for (const file of Array.from(files)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast({
          variant: 'destructive',
          title: 'Tipo de arquivo não suportado',
          description: `O arquivo "${file.name}" não é suportado. Use imagens, PDF ou DOC.`,
        })
        continue
      }

      if (file.size > MAX_FILE_SIZE) {
        toast({
          variant: 'destructive',
          title: 'Arquivo muito grande',
          description: `O arquivo "${file.name}" excede o limite de 5MB.`,
        })
        continue
      }

      try {
        const base64 = await fileToBase64(file)
        novosAnexos.push({
          id: gerarId(),
          nome: file.name,
          tipo: file.type,
          tamanho: file.size,
          data_base64: base64,
        })
      } catch (error) {
        console.error('Erro ao processar arquivo:', error)
        toast({
          variant: 'destructive',
          title: 'Erro ao processar arquivo',
          description: `Não foi possível processar "${file.name}".`,
        })
      }
    }

    if (novosAnexos.length > 0) {
      setFormData(prev => ({
        ...prev,
        anexos: [...prev.anexos, ...novosAnexos],
      }))
    }
  }

  const removerAnexo = (anexoId: string) => {
    setFormData(prev => ({
      ...prev,
      anexos: prev.anexos.filter(a => a.id !== anexoId),
    }))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      processarArquivos(e.dataTransfer.files)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processarArquivos(e.target.files)
      e.target.value = ''
    }
  }

  const formatarTamanhoArquivo = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const isImageType = (tipo: string) => tipo.startsWith('image/')

  const handleSave = () => {
    try {
      if (isSaving) return

      if (!formData.data) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'A data da ordem é obrigatória.',
        })
        return
      }

      if (!formData.descricao_manutencao.trim()) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'A descrição da manutenção é obrigatória.',
        })
        return
      }

      setIsSaving(true)

      if (id) {
        const resultado = atualizarOrdem(id, {
          ...formData,
          updated_by: authUser?.id || null,
        })
        if (resultado) {
          toast({
            title: 'Ordem atualizada',
            description: 'A ordem de serviço foi atualizada com sucesso.',
          })
          navegarRetorno()
        }
      } else {
        const novaOrdem: ManutencaoOrdemServico = {
          ...formData,
          id: gerarId(),
          created_at: new Date().toISOString(),
          created_by: authUser?.id || null,
        }
        salvarOrdem(novaOrdem)
        toast({
          title: 'Ordem criada',
          description: 'A ordem de serviço foi criada com sucesso.',
        })
        navegarRetorno()
      }
    } catch (error) {
      console.error('Erro ao salvar ordem de manutenção:', error)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível salvar a ordem de serviço.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    try {
      if (isDeleting) return
      if (!id) return

      setIsDeleting(true)
      const sucesso = excluirOrdem(id)
      if (sucesso) {
        toast({
          title: 'Ordem excluída',
          description: 'A ordem de serviço foi excluída com sucesso.',
        })
        navegarRetorno()
      }
    } catch (error) {
      console.error('Erro ao excluir ordem de manutenção:', error)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível excluir a ordem de serviço.',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleVoltar = () => {
    navigate('/manutencao', {
      state: {
        restoreSearchTerm: returnSearchTerm,
        oeeTurnoId,
        linhaId,
        linhaNome,
        skuCodigo,
        produtoDescricao,
      }
    })
  }

  const isActionDisabled = isFetchingData || isSaving || isDeleting

  const selectedDate = formData.data ? parseISO(formData.data) : undefined

  if (id && isFetchingData && !formData.id) {
    return (
      <>
        <AppHeader
          title="SICFAR OEE - Manutenção"
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
      <AppHeader
        title="SICFAR OEE - Manutenção"
        userName={user.name}
        userInitials={user.initials}
        userRole={user.role}
      />

      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-8 max-w-[1366px]">
        <div className="flex flex-col gap-4">
          {/* Cabeçalho */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-[#1f2937]">
                {id ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
              </h1>
              <p className="text-sm text-gray-500">
                {id ? `Editando ordem #${id.substring(0, 8)}...` : 'Cadastrar nova ordem de serviço de manutenção'}
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
            {/* Seção 1: Informações do Turno */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 leading-tight flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      Informações do Turno
                    </h2>
                    <p className="text-sm text-gray-500">
                      Dados preenchidos automaticamente a partir do turno atual
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-4 sm:px-6 py-4 flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linha_nome">Linha de Produção</Label>
                    <Input
                      id="linha_nome"
                      value={formData.linha_nome}
                      readOnly
                      className="bg-gray-50"
                      placeholder="Preenchido automaticamente"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku_codigo">SKU do Produto</Label>
                    <Input
                      id="sku_codigo"
                      value={formData.sku_codigo ? `${formData.sku_codigo}${formData.produto_descricao ? ` - ${formData.produto_descricao}` : ''}` : ''}
                      readOnly
                      className="bg-gray-50"
                      placeholder="Preenchido automaticamente"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Seção 2: Dados da Ordem */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 leading-tight flex items-center gap-2">
                      <ClipboardList className="h-5 w-5" />
                      Dados da Ordem
                    </h2>
                    <p className="text-sm text-gray-500">
                      Informações principais da ordem de serviço
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-4 sm:px-6 py-4 flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Data */}
                  <div className="space-y-2">
                    <Label>
                      Data <span className="text-red-500">*</span>
                    </Label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !formData.data && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.data
                            ? format(parseISO(formData.data), 'dd/MM/yyyy', { locale: ptBR })
                            : 'Selecione a data'
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            if (date) {
                              setFormData(prev => ({
                                ...prev,
                                data: format(date, 'yyyy-MM-dd'),
                              }))
                            }
                            setCalendarOpen(false)
                          }}
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Prioridade */}
                  <div className="space-y-2">
                    <Label htmlFor="prioridade">Prioridade</Label>
                    <Select
                      value={formData.prioridade}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        prioridade: value as ManutencaoOrdemServico['prioridade'],
                      }))}
                    >
                      <SelectTrigger id="prioridade">
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORIDADE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Centro de Custo */}
                  <div className="space-y-2">
                    <Label htmlFor="centro_custo">Centro de Custo</Label>
                    <Select
                      value={formData.centro_custo || 'NONE'}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        centro_custo: value === 'NONE' ? '' : value,
                      }))}
                    >
                      <SelectTrigger id="centro_custo">
                        <SelectValue placeholder="Selecione o centro de custo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">Nenhum</SelectItem>
                        {CENTRO_CUSTO_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Departamento */}
                  <div className="space-y-2">
                    <Label htmlFor="departamento">Departamento</Label>
                    <Select
                      value={formData.departamento || 'NONE'}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        departamento: value === 'NONE' ? '' : value,
                      }))}
                    >
                      <SelectTrigger id="departamento">
                        <SelectValue placeholder="Selecione o departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">Nenhum</SelectItem>
                        {DEPARTAMENTO_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção 3: Descrição */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 leading-tight flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Descrição
                    </h2>
                    <p className="text-sm text-gray-500">
                      Detalhes da manutenção a ser realizada
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-4 sm:px-6 py-4 flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="descricao_manutencao">
                    Descrição da Manutenção <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="descricao_manutencao"
                    value={formData.descricao_manutencao}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      descricao_manutencao: e.target.value,
                    }))}
                    placeholder="Descreva detalhadamente o serviço de manutenção necessário, incluindo equipamento, problema identificado e ação requerida..."
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500">
                    {formData.descricao_manutencao?.length || 0}/1000 caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacao">Observações</Label>
                  <Textarea
                    id="observacao"
                    value={formData.observacao}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      observacao: e.target.value,
                    }))}
                    placeholder="Observações adicionais, instruções especiais, materiais necessários, etc."
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500">
                    {formData.observacao?.length || 0}/500 caracteres
                  </p>
                </div>
              </div>
            </div>

            {/* Seção 4: Anexos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden mb-6">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 leading-tight flex items-center gap-2">
                      <Paperclip className="h-5 w-5" />
                      Anexos
                    </h2>
                    <p className="text-sm text-gray-500">
                      Fotos, documentos ou evidências relacionadas à manutenção
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-4 sm:px-6 py-4 flex flex-col gap-4">
                {/* Área de drag-and-drop */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                    isDragging
                      ? 'border-brand-primary bg-brand-primary/5'
                      : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                  )}
                >
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Arraste arquivos aqui ou <span className="text-brand-primary font-medium">clique para selecionar</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Imagens, PDF e DOC (máx. 5MB por arquivo)
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* Lista de anexos */}
                {formData.anexos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      {formData.anexos.length} {formData.anexos.length === 1 ? 'arquivo anexado' : 'arquivos anexados'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {formData.anexos.map((anexo) => (
                        <div
                          key={anexo.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50"
                        >
                          {/* Preview ou ícone */}
                          <div className="flex-shrink-0">
                            {isImageType(anexo.tipo) ? (
                              <div className="h-10 w-10 rounded overflow-hidden bg-white border border-gray-200">
                                <img
                                  src={anexo.data_base64}
                                  alt={anexo.nome}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : anexo.tipo === 'application/pdf' ? (
                              <div className="h-10 w-10 rounded bg-red-50 flex items-center justify-center">
                                <File className="h-5 w-5 text-red-500" />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded bg-blue-50 flex items-center justify-center">
                                <Image className="h-5 w-5 text-blue-500" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{anexo.nome}</p>
                            <p className="text-xs text-gray-500">{formatarTamanhoArquivo(anexo.tamanho)}</p>
                          </div>

                          {/* Remover */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-destructive flex-shrink-0"
                            onClick={() => removerAnexo(anexo.id)}
                            title="Remover anexo"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dialog de confirmação de exclusão */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir esta ordem de serviço de manutenção?
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
