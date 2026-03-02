/**
 * Página de Cadastro/Edição de Meta de OEE por Linha
 * Formulário para criação e manutenção de registros da tblinhaproducao_meta
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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
import { useOeeLinhaMeta } from '@/hooks/useOeeLinhaMeta'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import {
  OEE_LINHA_META_INITIAL_VALUES,
  OeeLinhaMetaFormData,
  LinhaProducaoMetaOption
} from '@/types/oee-linha-meta'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Save, Trash2, Calendar as CalendarIcon } from 'lucide-react'

type OeeLinhaMetaCadLocationState = {
  returnSearchTerm?: string
}

const formatarDataDigitada = (valor: string): string => {
  const texto = valor.trim()
  const matchIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (matchIso) {
    return `${matchIso[3]}/${matchIso[2]}/${matchIso[1]}`
  }

  const numeros = texto.replace(/\D/g, '').slice(0, 8)
  if (!numeros) {
    return ''
  }

  const partes: string[] = []
  partes.push(numeros.slice(0, 2))
  if (numeros.length > 2) {
    partes.push(numeros.slice(2, 4))
  }
  if (numeros.length > 4) {
    partes.push(numeros.slice(4, 8))
  }

  return partes.join('/')
}

const parseDataParaDate = (valor: string): Date | undefined => {
  const texto = valor.trim()
  if (!texto) {
    return undefined
  }

  const matchBr = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  const matchIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  const dia = matchBr ? Number(matchBr[1]) : matchIso ? Number(matchIso[3]) : NaN
  const mes = matchBr ? Number(matchBr[2]) : matchIso ? Number(matchIso[2]) : NaN
  const ano = matchBr ? Number(matchBr[3]) : matchIso ? Number(matchIso[1]) : NaN

  if (!Number.isFinite(dia) || !Number.isFinite(mes) || !Number.isFinite(ano)) {
    return undefined
  }

  const data = new Date(ano, mes - 1, dia)
  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {
    return undefined
  }

  return data
}

const formatarMetaDigitada = (valor: string): string => {
  const limpo = valor.replace(/[^\d.,]/g, '')
  if (!limpo) {
    return ''
  }

  const separador = limpo.includes(',') ? ',' : limpo.includes('.') ? '.' : ''
  if (!separador) {
    return limpo
  }

  const partes = limpo.split(separador)
  const inteiro = (partes.shift() || '').replace(/[^\d]/g, '')
  const decimal = partes.join('').replace(/[^\d]/g, '').slice(0, 2)

  return decimal ? `${inteiro},${decimal}` : inteiro
}

const converterMetaPtBrParaNumero = (valor: string): number | null => {
  const texto = valor.trim()
  if (!texto) return null

  const numero = texto.includes(',')
    ? Number(texto.replace(/\./g, '').replace(',', '.'))
    : Number(texto)

  return Number.isFinite(numero) ? numero : null
}

const formatarMetaParaExibicao = (valor: string): string => {
  const numero = converterMetaPtBrParaNumero(valor)
  if (numero === null) {
    return valor
  }

  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export default function OeeLinhaMetaCad() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as OeeLinhaMetaCadLocationState | null
  const queryClient = useQueryClient()

  const returnSearchTerm = typeof locationState?.returnSearchTerm === 'string'
    ? locationState.returnSearchTerm || ''
    : ''

  const { fetchLinhaMeta, saveLinhaMeta, deleteLinhaMeta } = useOeeLinhaMeta()

  const { user: authUser } = useAuth()

  const user = {
    name: authUser?.usuario || authUser?.email?.split('@')[0] || 'Usuário',
    initials: (authUser?.usuario || authUser?.email)?.substring(0, 2).toUpperCase() || 'U',
    role: authUser?.perfil || 'Operador',
  }

  const [formData, setFormData] = useState<OeeLinhaMetaFormData>(OEE_LINHA_META_INITIAL_VALUES)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isFetchingData, setIsFetchingData] = useState(Boolean(id))
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [calendarioInicioAberto, setCalendarioInicioAberto] = useState(false)
  const [calendarioFimAberto, setCalendarioFimAberto] = useState(false)

  const { data: linhasDisponiveis = [], isLoading: isLoadingLinhas } = useQuery({
    queryKey: ['linhas-producao-meta-opcoes'],
    queryFn: async (): Promise<LinhaProducaoMetaOption[]> => {
      const { data, error } = await supabase
        .from('tblinhaproducao')
        .select('linhaproducao_id, linhaproducao, bloqueado, deleted_at')
        .is('deleted_at', null)
        .or('bloqueado.eq.Não,bloqueado.is.null')
        .order('linhaproducao', { ascending: true })

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar linhas',
          description: error.message
        })
        throw error
      }

      return (data || []).map((linha) => ({
        linhaproducao_id: linha.linhaproducao_id,
        linhaproducao: linha.linhaproducao
      }))
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  })

  const loadData = useCallback(async () => {
    if (!id) {
      return
    }

    try {
      setIsFetchingData(true)
      const data = await fetchLinhaMeta(id)
      if (data) {
        setFormData(data)
      } else {
        navigate('/oee-linha-meta')
      }
    } catch (error) {
      console.error('Erro ao carregar meta por linha:', error)
      navigate('/oee-linha-meta')
    } finally {
      setIsFetchingData(false)
    }
  }, [fetchLinhaMeta, id, navigate])

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id, loadData])

  const linhaSelecionadaInexistente = useMemo(() => {
    if (!formData.linhaProducaoId) return null

    const existeNaLista = linhasDisponiveis.some(
      (linha) => linha.linhaproducao_id === formData.linhaProducaoId
    )

    if (existeNaLista) return null

    const linhaFallback: LinhaProducaoMetaOption = {
      linhaproducao_id: formData.linhaProducaoId,
      linhaproducao: formData.linhaProducaoNome || `Linha ${formData.linhaProducaoId}`
    }

    return linhaFallback
  }, [formData.linhaProducaoId, formData.linhaProducaoNome, linhasDisponiveis])

  const handleSave = async () => {
    try {
      if (isSaving) {
        return
      }

      if (!authUser?.id) {
        toast({
          variant: 'destructive',
          title: 'Erro de autenticação',
          description: 'Você precisa estar logado para salvar. Faça login novamente.',
        })
        return
      }

      if (!formData.linhaProducaoId) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'Selecione a linha de produção.',
        })
        return
      }

      if (!formData.dataInicio.trim()) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'A data de início é obrigatória.',
        })
        return
      }

      if (!parseDataParaDate(formData.dataInicio)) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'Informe uma data de início válida no formato dd/MM/yyyy.',
        })
        return
      }

      if (formData.dataFim.trim() && !parseDataParaDate(formData.dataFim)) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'Informe uma data de fim válida no formato dd/MM/yyyy.',
        })
        return
      }

      const dataInicioObj = parseDataParaDate(formData.dataInicio)
      const dataFimObj = parseDataParaDate(formData.dataFim)
      if (dataInicioObj && dataFimObj && dataFimObj.getTime() < dataInicioObj.getTime()) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'A data de fim não pode ser anterior à data de início.',
        })
        return
      }

      if (!formData.meta.trim()) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'A meta é obrigatória.',
        })
        return
      }

      const metaNumero = converterMetaPtBrParaNumero(formData.meta)
      if (metaNumero === null || metaNumero <= 0) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'Informe uma meta válida maior que zero.',
        })
        return
      }

      setIsSaving(true)

      const sucesso = await saveLinhaMeta(
        {
          ...formData,
          meta: formatarMetaParaExibicao(formData.meta)
        },
        authUser.id
      )

      if (sucesso) {
        await queryClient.invalidateQueries({ queryKey: ['oee-linha-meta'] })
        navigate('/oee-linha-meta', {
          state: {
            shouldRefresh: true,
            restoreSearchTerm: returnSearchTerm,
          }
        })
      }
    } catch (error) {
      console.error('Erro ao salvar meta por linha:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      if (isDeleting || !id) {
        return
      }

      if (!authUser?.id) {
        toast({
          variant: 'destructive',
          title: 'Erro de autenticação',
          description: 'Você precisa estar logado para excluir. Faça login novamente.',
        })
        return
      }

      setIsDeleting(true)
      const sucesso = await deleteLinhaMeta(id, authUser.id)
      if (sucesso) {
        await queryClient.invalidateQueries({ queryKey: ['oee-linha-meta'] })
        navigate('/oee-linha-meta', {
          state: {
            shouldRefresh: true,
            restoreSearchTerm: returnSearchTerm,
          }
        })
      }
    } catch (error) {
      console.error('Erro ao excluir meta por linha:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleVoltar = () => {
    navigate('/oee-linha-meta', {
      state: {
        restoreSearchTerm: returnSearchTerm
      }
    })
  }

  const isActionDisabled = isFetchingData || isSaving || isDeleting
  const dataInicioSelecionada = useMemo(() => parseDataParaDate(formData.dataInicio), [formData.dataInicio])
  const dataFimSelecionada = useMemo(() => parseDataParaDate(formData.dataFim), [formData.dataFim])

  if (id && isFetchingData && !formData.id) {
    return (
      <>
        <AppHeader
          title="SICFAR OEE - Metas por Linha de Produção"
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
        title="SICFAR OEE - Metas por Linha de Produção"
        userName={user.name}
        userInitials={user.initials}
        userRole={user.role}
      />

      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-0 max-w-[1366px]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-[#1f2937]">
                {id ? 'Editar Meta por Linha' : 'Nova Meta por Linha'}
              </h1>
              <p className="text-sm text-gray-500">
                {id
                  ? `Editando meta #${id}`
                  : 'Cadastre uma nova meta de OEE por linha de produção'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 !bg-white !text-brand-primary !border-brand-primary hover:!bg-gray-50 hover:!border-brand-primary hover:!text-brand-primary min-h-10 px-4"
                onClick={handleVoltar}
                disabled={isActionDisabled}
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

          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden mb-6">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 leading-tight flex items-center gap-2">
                      Dados da Meta
                    </h2>
                    <p className="text-sm text-gray-500">
                      Defina linha, período e valor da meta de OEE
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-4 sm:px-6 py-4 flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="linhaproducao">
                      Linha de Produção <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.linhaProducaoId ? String(formData.linhaProducaoId) : 'NONE'}
                      onValueChange={(value) => {
                        if (value === 'NONE') {
                          setFormData((prev) => ({
                            ...prev,
                            linhaProducaoId: null,
                            linhaProducaoNome: ''
                          }))
                          return
                        }

                        const linhaSelecionada = linhasDisponiveis.find(
                          (linha) => String(linha.linhaproducao_id) === value
                        ) || linhaSelecionadaInexistente

                        setFormData((prev) => ({
                          ...prev,
                          linhaProducaoId: Number(value),
                          linhaProducaoNome: linhaSelecionada?.linhaproducao || `Linha ${value}`
                        }))
                      }}
                      disabled={isLoadingLinhas || isActionDisabled}
                    >
                      <SelectTrigger id="linhaproducao">
                        <SelectValue placeholder="Selecione a linha de produção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">Selecione uma linha</SelectItem>
                        {linhaSelecionadaInexistente && (
                          <SelectItem value={String(linhaSelecionadaInexistente.linhaproducao_id)}>
                            {linhaSelecionadaInexistente.linhaproducao}
                          </SelectItem>
                        )}
                        {linhasDisponiveis.map((linha) => (
                          <SelectItem key={linha.linhaproducao_id} value={String(linha.linhaproducao_id)}>
                            {linha.linhaproducao || `Linha ${linha.linhaproducao_id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataInicio">
                      Data Início <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="dataInicio"
                        type="text"
                        inputMode="numeric"
                        placeholder="dd/mm/aaaa"
                        value={formData.dataInicio}
                        onChange={(e) => setFormData((prev) => ({ ...prev, dataInicio: formatarDataDigitada(e.target.value) }))}
                        readOnly={isActionDisabled}
                      />
                      <Popover open={calendarioInicioAberto} onOpenChange={setCalendarioInicioAberto}>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline" size="icon" className="h-10 w-10 shrink-0" disabled={isActionDisabled}>
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dataInicioSelecionada}
                            locale={ptBR}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              if (date) {
                                setFormData((prev) => ({ ...prev, dataInicio: format(date, 'dd/MM/yyyy') }))
                              }
                              setCalendarioInicioAberto(false)
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataFim">Data Fim</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="dataFim"
                        type="text"
                        inputMode="numeric"
                        placeholder="dd/mm/aaaa"
                        value={formData.dataFim}
                        onChange={(e) => setFormData((prev) => ({ ...prev, dataFim: formatarDataDigitada(e.target.value) }))}
                        readOnly={isActionDisabled}
                      />
                      <Popover open={calendarioFimAberto} onOpenChange={setCalendarioFimAberto}>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline" size="icon" className="h-10 w-10 shrink-0" disabled={isActionDisabled}>
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dataFimSelecionada}
                            locale={ptBR}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              if (date) {
                                setFormData((prev) => ({ ...prev, dataFim: format(date, 'dd/MM/yyyy') }))
                              }
                              setCalendarioFimAberto(false)
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="meta">
                      Meta <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="meta"
                      type="text"
                      inputMode="decimal"
                      placeholder="Ex.: 85,00"
                      value={formData.meta}
                      onChange={(e) => setFormData((prev) => ({ ...prev, meta: formatarMetaDigitada(e.target.value) }))}
                      onBlur={() => setFormData((prev) => ({ ...prev, meta: formatarMetaParaExibicao(prev.meta) }))}
                      readOnly={isActionDisabled}
                    />
                    <p className="text-xs text-gray-500">
                      Informe a meta com até 2 casas decimais (padrão brasileiro).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden mb-6">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 leading-tight">Observação</h2>
                    <p className="text-sm text-gray-500">
                      Informações complementares sobre a meta cadastrada
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-4 sm:px-6 py-4 flex flex-col">
                <div className="space-y-2">
                  <Label htmlFor="observacao">Observação</Label>
                  <Textarea
                    id="observacao"
                    value={formData.observacao}
                    onChange={(e) => setFormData((prev) => ({ ...prev, observacao: e.target.value }))}
                    placeholder="Digite observações opcionais sobre o período ou critérios desta meta."
                    rows={4}
                    maxLength={1000}
                    readOnly={isActionDisabled}
                  />
                  <p className="text-xs text-gray-500">
                    {(formData.observacao || '').length}/1000 caracteres
                  </p>
                </div>
              </div>
            </div>
          </div>

          {id && (
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir esta meta por linha?
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
          )}
        </div>
      </div>
    </>
  )
}
