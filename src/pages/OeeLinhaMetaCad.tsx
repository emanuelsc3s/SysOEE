/**
 * Página de Cadastro/Edição de Meta de OEE por Linha
 * Formulário para criação e manutenção de registros da tblinhaproducao_meta
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
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
import {
  ModalBuscaLinhaProducao,
  type LinhaProducaoSelecionada,
} from '@/components/modal/modalBuscaLinhaProducao'
import { useOeeLinhaMeta } from '@/hooks/useOeeLinhaMeta'
import { useAuth } from '@/hooks/useAuth'
import {
  OEE_LINHA_META_INITIAL_VALUES,
  OeeLinhaMetaFormData
} from '@/types/oee-linha-meta'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { differenceInCalendarDays, endOfMonth, format, isSameDay, subDays, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Save, Trash2, Calendar as CalendarIcon, Search, Sparkles, Loader2 } from 'lucide-react'

type OeeLinhaMetaCadLocationState = {
  returnSearchTerm?: string
}

type ResumoOeeTurnoSugestaoRow = {
  oeeturno_id?: number | null
  qtd_envase?: number | string | null
  envasado?: number | string | null
  embalado?: number | string | null
  qtd_embalagem?: number | string | null
  perdas_envase?: number | string | null
  perdas_embalagem?: number | string | null
  paradas_grandes_minutos?: number | string | null
  paradas_pequenas_minutos?: number | string | null
  paradas_totais_minutos?: number | string | null
  paradas_estrategicas_minutos?: number | string | null
}

type TurnoOeeResumo = {
  oeeturno_id: number
  turno_id: number | null
}

type TurnoBaseResumo = {
  turno_id: number
  hora_inicio: string | null
  hora_fim: string | null
}

type SugestaoMetaHistorica = {
  metaSugerida: number
  oeeMedioEstimado: number
  disponibilidadeMedia: number
  performanceMedia: number
  qualidadeMedia: number
  periodoAtualInicio: string
  periodoAtualFim: string
  periodoAnteriorInicio: string
  periodoAnteriorFim: string
  quantidadeTurnos: number
  totalProduzido: number
  totalPerdas: number
  totalParadasMinutos: number
  totalTempoPlanejadoMinutos: number
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

const normalizarNumero = (valor: number | string | null | undefined): number => {
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : 0
  }

  if (typeof valor !== 'string') {
    return 0
  }

  const texto = valor.trim()
  if (!texto) {
    return 0
  }

  const numero = texto.includes(',')
    ? Number(texto.replace(/\./g, '').replace(',', '.'))
    : Number(texto)

  return Number.isFinite(numero) ? numero : 0
}

const formatarNumeroPtBr = (valor: number, casas = 2): string => {
  if (!Number.isFinite(valor)) return '0'
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas
  })
}

const formatarMinutosParaHHMM = (valor: number): string => {
  const minutos = Math.max(0, Math.round(valor))
  const horas = Math.floor(minutos / 60)
  const minutosRestantes = minutos % 60

  return `${horas.toLocaleString('pt-BR')}:${String(minutosRestantes).padStart(2, '0')}`
}

const extrairMinutosHorario = (horario: string | null | undefined): number | null => {
  if (!horario) return null
  const texto = horario.trim()
  const match = texto.match(/^(\d{2}):(\d{2})/)
  if (!match) return null

  const horas = Number(match[1])
  const minutos = Number(match[2])
  if (!Number.isFinite(horas) || !Number.isFinite(minutos)) return null
  if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) return null

  return horas * 60 + minutos
}

const calcularDuracaoTurnoMinutos = (
  horaInicio: string | null | undefined,
  horaFim: string | null | undefined
): number | null => {
  const inicio = extrairMinutosHorario(horaInicio)
  const fim = extrairMinutosHorario(horaFim)

  if (inicio === null || fim === null) {
    return null
  }

  if (fim > inicio) {
    return fim - inicio
  }

  if (fim === inicio) {
    return 0
  }

  return (24 * 60 - inicio) + fim
}

const obterPeriodoAnteriorEquivalente = (
  inicio: Date,
  fim: Date
): { inicioAnterior: Date; fimAnterior: Date } => {
  const ehMesCompleto =
    inicio.getDate() === 1 &&
    inicio.getMonth() === fim.getMonth() &&
    inicio.getFullYear() === fim.getFullYear() &&
    isSameDay(fim, endOfMonth(fim))

  if (ehMesCompleto) {
    const mesAnterior = subMonths(inicio, 1)
    const inicioAnterior = new Date(mesAnterior.getFullYear(), mesAnterior.getMonth(), 1)
    const fimAnterior = endOfMonth(mesAnterior)
    return { inicioAnterior, fimAnterior }
  }

  const diasPeriodo = differenceInCalendarDays(fim, inicio) + 1
  const fimAnterior = subDays(inicio, 1)
  const inicioAnterior = subDays(fimAnterior, diasPeriodo - 1)

  return { inicioAnterior, fimAnterior }
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
  const [modalBuscaLinhaAberto, setModalBuscaLinhaAberto] = useState(false)
  const [isCalculandoSugestaoMeta, setIsCalculandoSugestaoMeta] = useState(false)
  const [modalSugestaoMetaAberto, setModalSugestaoMetaAberto] = useState(false)
  const [sugestaoMetaHistorica, setSugestaoMetaHistorica] = useState<SugestaoMetaHistorica | null>(null)

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

  const abrirModalBuscaLinha = () => {
    setModalBuscaLinhaAberto(true)
  }

  const handleSelecionarLinhaModal = (linha: LinhaProducaoSelecionada) => {
    if (linha.ativo === 'N') {
      toast({
        variant: 'destructive',
        title: 'Linha inativa',
        description: `A linha ${linha.linhaproducao_id} - ${linha.linhaproducao || 'Sem descrição'} está inativa e não pode ser selecionada.`
      })
      return
    }

    setFormData((prev) => ({
      ...prev,
      linhaProducaoId: linha.linhaproducao_id,
      linhaProducaoNome: linha.linhaproducao || `Linha ${linha.linhaproducao_id}`
    }))

    setModalBuscaLinhaAberto(false)
  }

  const handleSugerirMetaPeriodoAnterior = async () => {
    if (isCalculandoSugestaoMeta) {
      return
    }

    if (!formData.linhaProducaoId) {
      toast({
        variant: 'destructive',
        title: 'Validação',
        description: 'Selecione a linha de produção antes de gerar a sugestão.'
      })
      return
    }

    const dataInicioObj = parseDataParaDate(formData.dataInicio)
    if (!dataInicioObj) {
      toast({
        variant: 'destructive',
        title: 'Validação',
        description: 'Informe uma data de início válida para calcular a sugestão.'
      })
      return
    }

    const dataFimObj = formData.dataFim.trim() ? parseDataParaDate(formData.dataFim) : dataInicioObj
    if (!dataFimObj) {
      toast({
        variant: 'destructive',
        title: 'Validação',
        description: 'Informe uma data de fim válida para calcular a sugestão.'
      })
      return
    }

    if (dataFimObj.getTime() < dataInicioObj.getTime()) {
      toast({
        variant: 'destructive',
        title: 'Validação',
        description: 'A data de fim não pode ser anterior à data de início.'
      })
      return
    }

    const { inicioAnterior, fimAnterior } = obterPeriodoAnteriorEquivalente(dataInicioObj, dataFimObj)

    try {
      setIsCalculandoSugestaoMeta(true)

      const { data, error } = await supabase.rpc('fn_resumo_oee_turno', {
        p_data_inicio: format(inicioAnterior, 'yyyy-MM-dd'),
        p_data_fim: format(fimAnterior, 'yyyy-MM-dd'),
        p_turno_id: null,
        p_produto_id: null,
        p_linhaproducao_id: formData.linhaProducaoId,
        p_oeeturno_id: null
      })

      if (error) {
        throw error
      }

      const linhasResumo = (data || []) as ResumoOeeTurnoSugestaoRow[]
      const linhasComTurno = linhasResumo.filter(
        (linha): linha is ResumoOeeTurnoSugestaoRow & { oeeturno_id: number } =>
          typeof linha.oeeturno_id === 'number'
      )

      if (linhasComTurno.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Sem histórico para sugestão',
          description: 'Não há dados no período anterior para calcular a meta sugerida.'
        })
        return
      }

      const oeeturnoIds = Array.from(new Set(linhasComTurno.map((linha) => linha.oeeturno_id)))

      const { data: turnosOeeData, error: turnosOeeError } = await supabase
        .from('tboee_turno')
        .select('oeeturno_id, turno_id')
        .in('oeeturno_id', oeeturnoIds)
        .eq('deletado', 'N')

      if (turnosOeeError) {
        throw turnosOeeError
      }

      const turnosOee = (turnosOeeData || []) as TurnoOeeResumo[]
      const turnoIdPorOee = new Map<number, number | null>()
      for (const turno of turnosOee) {
        turnoIdPorOee.set(turno.oeeturno_id, turno.turno_id ?? null)
      }

      const turnoIds = Array.from(
        new Set(
          turnosOee
            .map((turno) => turno.turno_id)
            .filter((turnoId): turnoId is number => typeof turnoId === 'number')
        )
      )

      const duracaoPorTurnoId = new Map<number, number>()
      if (turnoIds.length > 0) {
        const { data: turnosBaseData, error: turnosBaseError } = await supabase
          .from('tbturno')
          .select('turno_id, hora_inicio, hora_fim')
          .in('turno_id', turnoIds)

        if (turnosBaseError) {
          throw turnosBaseError
        }

        for (const turnoBase of (turnosBaseData || []) as TurnoBaseResumo[]) {
          const duracao = calcularDuracaoTurnoMinutos(turnoBase.hora_inicio, turnoBase.hora_fim)
          if (duracao !== null && duracao > 0) {
            duracaoPorTurnoId.set(turnoBase.turno_id, duracao)
          }
        }
      }

      const totais = linhasComTurno.reduce(
        (acc, linha) => {
          acc.qtdEnvase += normalizarNumero(linha.qtd_envase)
          acc.envasado += normalizarNumero(linha.envasado)
          acc.embalado += normalizarNumero(linha.embalado)
          acc.qtdEmbalagem += normalizarNumero(linha.qtd_embalagem)
          acc.perdasEnvase += normalizarNumero(linha.perdas_envase)
          acc.perdasEmbalagem += normalizarNumero(linha.perdas_embalagem)
          acc.paradasGrandes += normalizarNumero(linha.paradas_grandes_minutos)
          acc.paradasPequenas += normalizarNumero(linha.paradas_pequenas_minutos)
          acc.paradasTotais += normalizarNumero(linha.paradas_totais_minutos)
          acc.paradasEstrategicas += normalizarNumero(linha.paradas_estrategicas_minutos)
          return acc
        },
        {
          qtdEnvase: 0,
          envasado: 0,
          embalado: 0,
          qtdEmbalagem: 0,
          perdasEnvase: 0,
          perdasEmbalagem: 0,
          paradasGrandes: 0,
          paradasPequenas: 0,
          paradasTotais: 0,
          paradasEstrategicas: 0
        }
      )

      const totalProduzido = Math.max(totais.qtdEnvase + totais.qtdEmbalagem, 0)
      if (totalProduzido <= 0) {
        toast({
          variant: 'destructive',
          title: 'Sem produção no período anterior',
          description: 'Não foi possível calcular a sugestão porque não houve produção suficiente no período base.'
        })
        return
      }

      let totalTempoPlanejadoMinutos = 0
      for (const oeeturnoId of oeeturnoIds) {
        const turnoId = turnoIdPorOee.get(oeeturnoId) ?? null
        const duracaoTurno = turnoId !== null ? duracaoPorTurnoId.get(turnoId) : undefined
        totalTempoPlanejadoMinutos += duracaoTurno ?? 480
      }

      const tempoDisponivelMinutos = Math.max(totalTempoPlanejadoMinutos - totais.paradasEstrategicas, 0)
      const tempoOperacaoMinutos = Math.max(tempoDisponivelMinutos - totais.paradasGrandes, 0)
      const tempoProdutivoMinutos = Math.max(tempoOperacaoMinutos - totais.paradasPequenas, 0)

      const disponibilidadeMedia = tempoDisponivelMinutos > 0
        ? Math.max(0, Math.min(tempoOperacaoMinutos / tempoDisponivelMinutos, 1))
        : 0
      const performanceMedia = tempoOperacaoMinutos > 0
        ? Math.max(0, Math.min(tempoProdutivoMinutos / tempoOperacaoMinutos, 1))
        : 0

      const totalBoas = Math.max(totais.envasado + totais.embalado, 0)
      const qualidadeMedia = totalProduzido > 0
        ? Math.max(0, Math.min(totalBoas / totalProduzido, 1))
        : 0

      const oeeMedioEstimado = Math.max(
        0,
        Math.min(disponibilidadeMedia * performanceMedia * qualidadeMedia * 100, 100)
      )
      const metaSugerida = Number(oeeMedioEstimado.toFixed(2))

      if (!Number.isFinite(metaSugerida) || metaSugerida <= 0) {
        toast({
          variant: 'destructive',
          title: 'Cálculo indisponível',
          description: 'Não foi possível calcular uma meta sugerida válida com os dados encontrados.'
        })
        return
      }

      setSugestaoMetaHistorica({
        metaSugerida,
        oeeMedioEstimado,
        disponibilidadeMedia,
        performanceMedia,
        qualidadeMedia,
        periodoAtualInicio: format(dataInicioObj, 'dd/MM/yyyy'),
        periodoAtualFim: format(dataFimObj, 'dd/MM/yyyy'),
        periodoAnteriorInicio: format(inicioAnterior, 'dd/MM/yyyy'),
        periodoAnteriorFim: format(fimAnterior, 'dd/MM/yyyy'),
        quantidadeTurnos: oeeturnoIds.length,
        totalProduzido,
        totalPerdas: Math.max(totais.perdasEnvase + totais.perdasEmbalagem, 0),
        totalParadasMinutos: Math.max(totais.paradasTotais, 0),
        totalTempoPlanejadoMinutos: Math.max(totalTempoPlanejadoMinutos, 0)
      })
      setModalSugestaoMetaAberto(true)
    } catch (error) {
      console.error('Erro ao calcular sugestão de meta por linha:', error)
      toast({
        variant: 'destructive',
        title: 'Erro ao sugerir meta',
        description: 'Não foi possível gerar a sugestão de meta com base no período anterior.'
      })
    } finally {
      setIsCalculandoSugestaoMeta(false)
    }
  }

  const handleAplicarMetaSugerida = () => {
    if (!sugestaoMetaHistorica) return

    setFormData((prev) => ({
      ...prev,
      meta: formatarMetaParaExibicao(String(sugestaoMetaHistorica.metaSugerida))
    }))

    setModalSugestaoMetaAberto(false)

    toast({
      title: 'Meta sugerida aplicada',
      description: `A meta ${formatarNumeroPtBr(sugestaoMetaHistorica.metaSugerida)}% foi aplicada no formulário.`
    })
  }

  const isActionDisabled = isFetchingData || isSaving || isDeleting
  const dataInicioSelecionada = useMemo(() => parseDataParaDate(formData.dataInicio), [formData.dataInicio])
  const dataFimSelecionada = useMemo(() => parseDataParaDate(formData.dataFim), [formData.dataFim])
  const linhaProducaoExibicao = useMemo(() => {
    const linhaId = formData.linhaProducaoId
    const linhaNome = formData.linhaProducaoNome.trim()

    if (!linhaId && !linhaNome) return ''
    if (linhaId && linhaNome) return `${linhaId} - ${linhaNome}`
    if (linhaNome) return linhaNome
    return `Linha ${linhaId}`
  }, [formData.linhaProducaoId, formData.linhaProducaoNome])
  const justificativaSugestaoMeta = useMemo(() => {
    if (!sugestaoMetaHistorica) return ''

    return `A sugestão usa o período anterior (${sugestaoMetaHistorica.periodoAnteriorInicio} a ${sugestaoMetaHistorica.periodoAnteriorFim}) da linha selecionada para estimar a média de OEE a partir de disponibilidade, performance e qualidade. Foram considerados ${sugestaoMetaHistorica.quantidadeTurnos} turnos, ${formatarNumeroPtBr(sugestaoMetaHistorica.totalProduzido, 0)} unidades produzidas, ${formatarNumeroPtBr(sugestaoMetaHistorica.totalPerdas, 0)} unidades de perdas e ${formatarMinutosParaHHMM(sugestaoMetaHistorica.totalParadasMinutos)} de paradas no total.`
  }, [sugestaoMetaHistorica])

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
                    <div className="flex gap-2">
                      <Input
                        id="linhaproducao"
                        type="text"
                        value={linhaProducaoExibicao}
                        readOnly
                        disabled={isActionDisabled}
                        onClick={() => {
                          if (isActionDisabled) return
                          abrirModalBuscaLinha()
                        }}
                        placeholder="Selecione uma linha de produção"
                        className={`flex-1 min-h-11 md:min-h-10 ${isActionDisabled ? 'bg-muted/50 cursor-not-allowed' : 'cursor-pointer'}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={abrirModalBuscaLinha}
                        disabled={isActionDisabled}
                        title="Buscar linha de produção"
                        className="flex-none h-11 w-11 md:h-10 md:w-10"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
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
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <Input
                        id="meta"
                        type="text"
                        inputMode="decimal"
                        placeholder="Ex.: 85,00"
                        value={formData.meta}
                        onChange={(e) => setFormData((prev) => ({ ...prev, meta: formatarMetaDigitada(e.target.value) }))}
                        onBlur={() => setFormData((prev) => ({ ...prev, meta: formatarMetaParaExibicao(prev.meta) }))}
                        readOnly={isActionDisabled}
                        className="md:flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSugerirMetaPeriodoAnterior}
                        disabled={isActionDisabled || isCalculandoSugestaoMeta}
                        className="min-h-10 whitespace-nowrap"
                        title="Sugerir meta com base no período anterior"
                      >
                        {isCalculandoSugestaoMeta ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Calculando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Sugerir Meta
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Informe a meta com até 2 casas decimais (padrão brasileiro).
                    </p>
                    <p className="text-xs text-gray-500">
                      A sugestão considera a média estimada do período anterior com a mesma janela de datas.
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

          <ModalBuscaLinhaProducao
            aberto={modalBuscaLinhaAberto}
            onFechar={() => setModalBuscaLinhaAberto(false)}
            onSelecionarLinha={handleSelecionarLinhaModal}
          />

          <Dialog open={modalSugestaoMetaAberto} onOpenChange={setModalSugestaoMetaAberto}>
            <DialogContent className="sm:max-w-[640px]">
              <DialogHeader>
                <DialogTitle>Sugestão de Meta por Histórico</DialogTitle>
                <DialogDescription>
                  Período atual: <strong>{sugestaoMetaHistorica?.periodoAtualInicio}</strong> até{' '}
                  <strong>{sugestaoMetaHistorica?.periodoAtualFim}</strong>
                </DialogDescription>
              </DialogHeader>

              {sugestaoMetaHistorica && (
                <div className="space-y-4">
                  <div className="rounded-md border border-brand-primary/30 bg-brand-primary/5 p-4">
                    <p className="text-xs uppercase tracking-wide text-brand-primary/80 font-semibold">
                      Meta sugerida
                    </p>
                    <p className="text-3xl font-bold text-brand-primary">
                      {formatarNumeroPtBr(sugestaoMetaHistorica.metaSugerida)}%
                    </p>
                    <p className="text-xs text-brand-primary/80 mt-1">
                      Base: {sugestaoMetaHistorica.periodoAnteriorInicio} até {sugestaoMetaHistorica.periodoAnteriorFim}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="rounded-md border border-gray-200 p-3">
                      <p className="text-xs text-gray-500">Disponibilidade média</p>
                      <p className="text-base font-semibold text-gray-800">
                        {formatarNumeroPtBr(sugestaoMetaHistorica.disponibilidadeMedia * 100)}%
                      </p>
                    </div>
                    <div className="rounded-md border border-gray-200 p-3">
                      <p className="text-xs text-gray-500">Performance média</p>
                      <p className="text-base font-semibold text-gray-800">
                        {formatarNumeroPtBr(sugestaoMetaHistorica.performanceMedia * 100)}%
                      </p>
                    </div>
                    <div className="rounded-md border border-gray-200 p-3">
                      <p className="text-xs text-gray-500">Qualidade média</p>
                      <p className="text-base font-semibold text-gray-800">
                        {formatarNumeroPtBr(sugestaoMetaHistorica.qualidadeMedia * 100)}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="rounded-md border border-gray-200 p-3">
                      <p className="text-xs text-gray-500">Turnos considerados</p>
                      <p className="text-base font-semibold text-gray-800">
                        {sugestaoMetaHistorica.quantidadeTurnos}
                      </p>
                    </div>
                    <div className="rounded-md border border-gray-200 p-3">
                      <p className="text-xs text-gray-500">Tempo planejado</p>
                      <p className="text-base font-semibold text-gray-800">
                        {formatarMinutosParaHHMM(sugestaoMetaHistorica.totalTempoPlanejadoMinutos)}
                      </p>
                    </div>
                    <div className="rounded-md border border-gray-200 p-3">
                      <p className="text-xs text-gray-500">Total produzido</p>
                      <p className="text-base font-semibold text-gray-800">
                        {formatarNumeroPtBr(sugestaoMetaHistorica.totalProduzido, 0)}
                      </p>
                    </div>
                    <div className="rounded-md border border-gray-200 p-3">
                      <p className="text-xs text-gray-500">Paradas totais</p>
                      <p className="text-base font-semibold text-gray-800">
                        {formatarMinutosParaHHMM(sugestaoMetaHistorica.totalParadasMinutos)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Justificativa</p>
                    <p className="text-sm text-gray-600">{justificativaSugestaoMeta}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      OEE estimado no período base: {formatarNumeroPtBr(sugestaoMetaHistorica.oeeMedioEstimado)}%
                    </p>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalSugestaoMetaAberto(false)}
                >
                  Manter valor atual
                </Button>
                <Button
                  type="button"
                  onClick={handleAplicarMetaSugerida}
                  disabled={!sugestaoMetaHistorica}
                  className="!bg-brand-primary !text-white !border-brand-primary hover:!bg-brand-primary/90 hover:!border-brand-primary/90"
                >
                  Aplicar {sugestaoMetaHistorica ? `${formatarNumeroPtBr(sugestaoMetaHistorica.metaSugerida)}%` : ''}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
