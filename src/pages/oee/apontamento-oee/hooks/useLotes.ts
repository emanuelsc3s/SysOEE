import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import {
  atualizarLote,
  inserirLote,
  listarLotesPorTurno,
  softDeleteLote,
} from '../services/lote.service'
import {
  DadosLote,
  ESTADO_INICIAL_LOTE,
  LoteProducao,
  PayloadLoteSupabase,
} from '../types/lote.types'
import {
  calcularTotaisLotes,
  formatarDataIsoParaBr,
  mapearLoteSupabase,
  normalizarHoraDigitada,
  normalizarHoraParaBanco,
  ordenarLotesPorHora,
  validarDadosLote,
} from '../utils/lote.utils'

interface UseLotesParams {
  aberto: boolean
  oeeturnoId: number | null
  resolverTurnoId?: () => Promise<number | null>
  onTurnoIdResolvido?: (oeeturnoId: number) => void
  validarPermissaoEdicao?: (mensagemNegada: string) => Promise<boolean>
}

const MENSAGEM_ERRO_PADRAO = 'Não foi possível processar a operação de lotes. Tente novamente.'

export function useLotes({
  aberto,
  oeeturnoId,
  resolverTurnoId,
  onTurnoIdResolvido,
  validarPermissaoEdicao,
}: UseLotesParams) {
  const { toast } = useToast()

  const [lotesProducao, setLotesProducao] = useState<LoteProducao[]>([])
  const [carregandoLotes, setCarregandoLotes] = useState(false)

  const [dadosLote, setDadosLote] = useState<DadosLote>(ESTADO_INICIAL_LOTE)
  const [dataLoteDigitada, setDataLoteDigitada] = useState<string>('')
  const [dataFabricacaoDigitada, setDataFabricacaoDigitada] = useState<string>('')
  const [dataValidadeDigitada, setDataValidadeDigitada] = useState<string>('')
  const [salvandoLote, setSalvandoLote] = useState(false)
  const [formularioLoteAberto, setFormularioLoteAberto] = useState(false)
  const [loteEmEdicao, setLoteEmEdicao] = useState<string | null>(null)

  const obterMensagemErro = useCallback((error: unknown, fallback: string): string => {
    if (error && typeof error === 'object') {
      if ('status' in error && (error as { status?: number }).status === 403) {
        return 'Sem permissão para acessar o Supabase. Verifique as políticas RLS e o login.'
      }

      if ('code' in error && (error as { code?: string }).code === '42501') {
        return 'Permissão negada pelo banco de dados. Verifique as políticas de acesso.'
      }

      if ('message' in error) {
        const mensagem = (error as { message?: string }).message
        if (mensagem) {
          const mensagemNormalizada = mensagem.toLowerCase()
          if (
            mensagemNormalizada.includes('row level security')
            || mensagemNormalizada.includes('row-level security')
            || mensagemNormalizada.includes('permission denied')
            || mensagemNormalizada.includes('permissão negada')
          ) {
            return 'Sem permissão para gravar no Supabase. Verifique as políticas RLS.'
          }

          return mensagem
        }
      }
    }

    return fallback
  }, [])

  const resetarFormularioLote = useCallback(() => {
    setDadosLote(ESTADO_INICIAL_LOTE)
    setDataLoteDigitada('')
    setDataFabricacaoDigitada('')
    setDataValidadeDigitada('')
    setLoteEmEdicao(null)
    setFormularioLoteAberto(false)
  }, [])

  const obterUsuarioAutenticado = useCallback(async (): Promise<string> => {
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      throw error
    }

    if (!data?.user?.id) {
      throw new Error('Usuário não autenticado. Faça login para continuar.')
    }

    return data.user.id
  }, [])

  const carregarLotes = useCallback(async (turnoId: number) => {
    setCarregandoLotes(true)

    try {
      const lotesBanco = await listarLotesPorTurno(turnoId)
      const lotesMapeados = lotesBanco.map(mapearLoteSupabase)
      setLotesProducao(ordenarLotesPorHora(lotesMapeados))
    } catch (error) {
      console.error('Erro ao carregar lotes:', error)
      setLotesProducao([])
      toast({
        title: 'Erro ao carregar lotes',
        description: obterMensagemErro(error, 'Não foi possível carregar os lotes do turno no Supabase.'),
        variant: 'destructive',
      })
    } finally {
      setCarregandoLotes(false)
    }
  }, [obterMensagemErro, toast])

  const garantirPermissaoEdicao = useCallback(async (mensagemNegada: string): Promise<boolean> => {
    if (!validarPermissaoEdicao) {
      return true
    }

    return validarPermissaoEdicao(mensagemNegada)
  }, [validarPermissaoEdicao])

  const handleNovoLote = useCallback(() => {
    resetarFormularioLote()
    setFormularioLoteAberto(true)
  }, [resetarFormularioLote])

  const handleEditarLote = useCallback(async (lote: LoteProducao) => {
    const permitido = await garantirPermissaoEdicao('Você não tem permissão para editar este lote de produção.')

    if (!permitido) {
      return
    }

    setDataLoteDigitada(formatarDataIsoParaBr(lote.data))
    setDataFabricacaoDigitada(formatarDataIsoParaBr(lote.fabricacao))
    setDataValidadeDigitada(formatarDataIsoParaBr(lote.validade))
    setDadosLote({
      numeroLote: lote.numeroLote,
      data: lote.data,
      fabricacao: lote.fabricacao,
      validade: lote.validade,
      horaInicial: lote.horaInicial,
      horaFinal: lote.horaFinal,
      quantidadePerdas: lote.quantidadePerdas,
      quantidadeProduzidaInicial: lote.quantidadeProduzidaInicial,
      quantidadeProduzidaFinal: lote.quantidadeProduzidaFinal,
    })
    setLoteEmEdicao(lote.id)
    setFormularioLoteAberto(true)
  }, [garantirPermissaoEdicao])

  const validarCamposLote = useCallback(() => {
    return validarDadosLote(dadosLote).valido
  }, [dadosLote])

  const handleExcluirLote = useCallback(async (id: string) => {
    const lote = lotesProducao.find((item) => item.id === id)
    if (!lote) {
      return
    }

    const permitido = await garantirPermissaoEdicao('Você não tem permissão para excluir este lote de produção.')
    if (!permitido) {
      return
    }

    try {
      const usuarioId = await obterUsuarioAutenticado()
      const oeeturnoloteId = Number(id)

      if (!Number.isFinite(oeeturnoloteId)) {
        setLotesProducao((prev) => prev.filter((item) => item.id !== id))
      } else {
        await softDeleteLote(oeeturnoloteId, usuarioId)
        setLotesProducao((prev) => prev.filter((item) => item.id !== id))
      }

      toast({
        title: 'Lote excluído',
        description: `O lote ${lote.numeroLote} foi removido.`,
      })
    } catch (error) {
      console.error('Erro ao excluir lote:', error)
      toast({
        title: 'Erro ao excluir',
        description: obterMensagemErro(error, 'Não foi possível excluir o lote. Tente novamente.'),
        variant: 'destructive',
      })
    }
  }, [garantirPermissaoEdicao, lotesProducao, obterMensagemErro, obterUsuarioAutenticado, toast])

  const handleSalvarLote = useCallback(async () => {
    const validacao = validarDadosLote(dadosLote)

    if (!validacao.valido) {
      toast({
        title: 'Campos obrigatórios',
        description: validacao.mensagem || 'Revise os dados do lote antes de salvar.',
        variant: 'destructive',
      })
      return
    }

    setSalvandoLote(true)

    const horaInicialNormalizada = normalizarHoraDigitada(dadosLote.horaInicial, true)
    const horaFinalNormalizada = normalizarHoraDigitada(dadosLote.horaFinal, true)

    try {
      let turnoAtualId = oeeturnoId

      if (!turnoAtualId && resolverTurnoId) {
        turnoAtualId = await resolverTurnoId()
      }

      if (!turnoAtualId) {
        toast({
          title: 'Erro ao registrar turno',
          description: 'Não foi possível obter o turno OEE para salvar o lote.',
          variant: 'destructive',
        })
        return
      }

      onTurnoIdResolvido?.(turnoAtualId)

      const payloadLote: PayloadLoteSupabase = {
        lote: dadosLote.numeroLote.trim(),
        fabricacao: dadosLote.fabricacao,
        validade: dadosLote.validade,
        hora_inicio: normalizarHoraParaBanco(horaInicialNormalizada),
        hora_fim: normalizarHoraParaBanco(horaFinalNormalizada),
        data: dadosLote.data,
        qtd_inicial: Number(dadosLote.quantidadeProduzidaInicial) || 0,
        qtd_final: Number(dadosLote.quantidadeProduzidaFinal) || 0,
        perda: Number(dadosLote.quantidadePerdas) || 0,
        oeeturno_id: turnoAtualId,
      }

      const usuarioId = await obterUsuarioAutenticado()
      let registroSalvo

      if (loteEmEdicao) {
        const oeeturnoloteId = Number(loteEmEdicao)
        if (!Number.isFinite(oeeturnoloteId)) {
          throw new Error('ID do lote inválido para atualização.')
        }

        registroSalvo = await atualizarLote(oeeturnoloteId, payloadLote, usuarioId)
      } else {
        registroSalvo = await inserirLote(payloadLote, usuarioId)
      }

      if (!registroSalvo?.oeeturnolote_id) {
        throw new Error('ID do lote não retornado pelo banco.')
      }

      const loteSalvo = mapearLoteSupabase(registroSalvo)

      setLotesProducao((prev) => {
        const lotesSemDuplicacao = prev.filter((item) => item.id !== loteSalvo.id)
        return ordenarLotesPorHora([...lotesSemDuplicacao, loteSalvo])
      })

      toast({
        title: loteEmEdicao ? 'Lote atualizado' : 'Lote adicionado',
        description: `O lote ${loteSalvo.numeroLote} foi salvo com sucesso.`,
      })

      resetarFormularioLote()
    } catch (error) {
      console.error('Erro ao salvar lote:', error)
      toast({
        title: 'Erro ao salvar',
        description: obterMensagemErro(error, MENSAGEM_ERRO_PADRAO),
        variant: 'destructive',
      })
    } finally {
      setSalvandoLote(false)
    }
  }, [
    dadosLote,
    loteEmEdicao,
    oeeturnoId,
    obterMensagemErro,
    obterUsuarioAutenticado,
    onTurnoIdResolvido,
    resetarFormularioLote,
    resolverTurnoId,
    toast,
  ])

  useEffect(() => {
    if (!aberto) {
      resetarFormularioLote()
      return
    }

    if (!oeeturnoId) {
      setLotesProducao([])
      return
    }

    void carregarLotes(oeeturnoId)
  }, [aberto, carregarLotes, oeeturnoId, resetarFormularioLote])

  const totaisLotes = useMemo(() => calcularTotaisLotes(lotesProducao), [lotesProducao])

  return {
    lotesProducao,
    carregandoLotes,
    dadosLote,
    setDadosLote,
    dataLoteDigitada,
    setDataLoteDigitada,
    dataFabricacaoDigitada,
    setDataFabricacaoDigitada,
    dataValidadeDigitada,
    setDataValidadeDigitada,
    salvandoLote,
    formularioLoteAberto,
    loteEmEdicao,
    totaisLotes,
    validarCamposLote,
    handleNovoLote,
    handleEditarLote,
    handleExcluirLote,
    handleSalvarLote,
    resetarFormularioLote,
    setFormularioLoteAberto,
  }
}
