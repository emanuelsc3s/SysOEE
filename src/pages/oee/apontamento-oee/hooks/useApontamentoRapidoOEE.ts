import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ParadaGeral } from '@/components/apontamento/ModalBuscaParadas'
import { useToast } from '@/hooks/use-toast'
import {
  buscarParadasGeraisRapidoOEE,
  buscarProducoesTurnoRapidoOEE,
  registrarParadaRapidaOEE,
  registrarPerdaRapidaOEE,
  registrarProducaoRapidaOEE
} from '../services/apontamentoRapidoOee.service'
import type {
  AbaApontamentoRapidoOEE,
  ContextoTurnoRapidoOEE,
  JanelaFaltanteOEE
} from '../types/apontamentoRapidoOee.types'
import {
  calcularDuracaoMinutosComViradaOEE,
  formatarDuracaoMinutosOEE,
  gerarJanelasHoraAHoraOEE,
  identificarJanelasFaltantesOEE,
  limparHoraDigitadaOEE,
  normalizarHora24hOEE,
  normalizarPerdaPtBrRapidoOEE
} from '../utils/apontamentoRapidoOee.utils'

type UseApontamentoRapidoOEEProps = {
  aberto: boolean
  contexto: ContextoTurnoRapidoOEE | null
  onApontamentoRegistrado?: () => Promise<void> | void
}

const mensagemErro = (erro: unknown, padrao: string): string => {
  if (erro && typeof erro === 'object' && 'message' in erro) {
    const msg = String((erro as { message?: string }).message || '').trim()
    if (msg) {
      return msg
    }
  }

  return padrao
}

export function useApontamentoRapidoOEE({
  aberto,
  contexto,
  onApontamentoRegistrado
}: UseApontamentoRapidoOEEProps) {
  const { toast } = useToast()

  const [abaAtiva, setAbaAtiva] = useState<AbaApontamentoRapidoOEE>('PRODUCAO')
  const [carregandoDados, setCarregandoDados] = useState(false)

  const [totalJanelas, setTotalJanelas] = useState(0)
  const [janelasFaltantes, setJanelasFaltantes] = useState<JanelaFaltanteOEE[]>([])
  const [totalProducoesRegistradas, setTotalProducoesRegistradas] = useState(0)

  const [janelaSelecionada, setJanelaSelecionada] = useState('')
  const [quantidadeProducao, setQuantidadeProducao] = useState('')
  const [quantidadePerda, setQuantidadePerda] = useState('')

  const [codigoParadaBusca, setCodigoParadaBusca] = useState('')
  const [paradaSelecionada, setParadaSelecionada] = useState<ParadaGeral | null>(null)
  const [horaInicialParada, setHoraInicialParada] = useState('')
  const [horaFinalParada, setHoraFinalParada] = useState('')
  const [observacaoParada, setObservacaoParada] = useState('')

  const [paradasGerais, setParadasGerais] = useState<ParadaGeral[]>([])
  const [carregandoParadas, setCarregandoParadas] = useState(false)
  const [erroParadas, setErroParadas] = useState<string | null>(null)
  const [modalBuscaParadasAberto, setModalBuscaParadasAberto] = useState(false)

  const [salvandoProducao, setSalvandoProducao] = useState(false)
  const [salvandoPerda, setSalvandoPerda] = useState(false)
  const [salvandoParada, setSalvandoParada] = useState(false)

  const horaInicialParadaNormalizada = useMemo(
    () => normalizarHora24hOEE(horaInicialParada, true),
    [horaInicialParada]
  )

  const horaFinalParadaNormalizada = useMemo(
    () => normalizarHora24hOEE(horaFinalParada, true),
    [horaFinalParada]
  )

  const duracaoParadaMinutos = useMemo(
    () => calcularDuracaoMinutosComViradaOEE(horaInicialParadaNormalizada, horaFinalParadaNormalizada),
    [horaInicialParadaNormalizada, horaFinalParadaNormalizada]
  )

  const duracaoParadaFormatada = useMemo(
    () => formatarDuracaoMinutosOEE(duracaoParadaMinutos),
    [duracaoParadaMinutos]
  )

  const perdaNormalizada = useMemo(
    () => normalizarPerdaPtBrRapidoOEE(quantidadePerda),
    [quantidadePerda]
  )

  const recarregarParadas = useCallback(async () => {
    setCarregandoParadas(true)
    setErroParadas(null)

    try {
      const paradas = await buscarParadasGeraisRapidoOEE()
      setParadasGerais(paradas)
    } catch (error) {
      const descricao = mensagemErro(error, 'Não foi possível carregar os tipos de parada.')
      setErroParadas(descricao)
    } finally {
      setCarregandoParadas(false)
    }
  }, [])

  const carregarDados = useCallback(async () => {
    if (!contexto || !aberto) {
      return
    }

    setCarregandoDados(true)

    try {
      const [producoes, paradas] = await Promise.all([
        buscarProducoesTurnoRapidoOEE(contexto.oeeturnoId),
        paradasGerais.length > 0 ? Promise.resolve(paradasGerais) : buscarParadasGeraisRapidoOEE()
      ])

      const janelas = gerarJanelasHoraAHoraOEE(contexto.horaInicio, contexto.horaFim)
      const faltantes = identificarJanelasFaltantesOEE(janelas, producoes)

      setTotalJanelas(janelas.length)
      setJanelasFaltantes(faltantes)
      setTotalProducoesRegistradas(producoes.length)

      setParadasGerais(paradas)
      setErroParadas(null)

      setJanelaSelecionada((anterior) => {
        if (anterior && faltantes.some((janela) => janela.chave === anterior)) {
          return anterior
        }
        return faltantes[0]?.chave || ''
      })
    } catch (error) {
      toast({
        title: 'Erro ao carregar apontamento rápido',
        description: mensagemErro(error, 'Não foi possível carregar os dados do turno.'),
        variant: 'destructive'
      })
    } finally {
      setCarregandoDados(false)
    }
  }, [aberto, contexto, paradasGerais, toast])

  useEffect(() => {
    void carregarDados()
  }, [carregarDados])

  useEffect(() => {
    if (!aberto) {
      setQuantidadeProducao('')
      setQuantidadePerda('')
      setCodigoParadaBusca('')
      setParadaSelecionada(null)
      setHoraInicialParada('')
      setHoraFinalParada('')
      setObservacaoParada('')
      setAbaAtiva('PRODUCAO')
    }
  }, [aberto])

  const executarPosRegistro = useCallback(async () => {
    await carregarDados()
    if (onApontamentoRegistrado) {
      await onApontamentoRegistrado()
    }
  }, [carregarDados, onApontamentoRegistrado])

  const registrarProducao = useCallback(async () => {
    if (!contexto) {
      return
    }

    const janela = janelasFaltantes.find((item) => item.chave === janelaSelecionada)
    if (!janela) {
      toast({
        title: 'Janela obrigatória',
        description: 'Selecione uma janela faltante antes de registrar a produção.',
        variant: 'destructive'
      })
      return
    }

    const quantidade = Number(quantidadeProducao)
    if (!Number.isFinite(quantidade) || quantidade <= 0) {
      toast({
        title: 'Quantidade inválida',
        description: 'Informe uma quantidade de produção maior que zero.',
        variant: 'destructive'
      })
      return
    }

    setSalvandoProducao(true)
    try {
      await registrarProducaoRapidaOEE({
        contexto,
        janela,
        quantidade
      })

      setQuantidadeProducao('')

      await executarPosRegistro()

      toast({
        title: 'Produção registrada',
        description: `Janela ${janela.horaInicio}-${janela.horaFim} lançada com sucesso.`
      })
    } catch (error) {
      toast({
        title: 'Erro ao registrar produção',
        description: mensagemErro(error, 'Não foi possível registrar a produção rápida.'),
        variant: 'destructive'
      })
    } finally {
      setSalvandoProducao(false)
    }
  }, [contexto, executarPosRegistro, janelaSelecionada, janelasFaltantes, quantidadeProducao, toast])

  const registrarPerda = useCallback(async () => {
    if (!contexto) {
      return
    }

    if (totalProducoesRegistradas <= 0) {
      toast({
        title: 'Perda bloqueada',
        description: 'Registre ao menos uma produção no turno antes de lançar perda.',
        variant: 'destructive'
      })
      return
    }

    if (!Number.isFinite(perdaNormalizada.valorNumero) || perdaNormalizada.valorNumero <= 0) {
      toast({
        title: 'Quantidade inválida',
        description: 'Informe uma quantidade de perda válida.',
        variant: 'destructive'
      })
      return
    }

    setSalvandoPerda(true)
    try {
      await registrarPerdaRapidaOEE({
        contexto,
        perdaNormalizada: perdaNormalizada.valorNormalizado
      })

      setQuantidadePerda('')

      await executarPosRegistro()

      toast({
        title: 'Perda registrada',
        description: 'Lançamento de perda realizado com sucesso.'
      })
    } catch (error) {
      toast({
        title: 'Erro ao registrar perda',
        description: mensagemErro(error, 'Não foi possível registrar a perda rápida.'),
        variant: 'destructive'
      })
    } finally {
      setSalvandoPerda(false)
    }
  }, [contexto, executarPosRegistro, perdaNormalizada, toast, totalProducoesRegistradas])

  const registrarParada = useCallback(async () => {
    if (!contexto) {
      return
    }

    if (!paradaSelecionada) {
      toast({
        title: 'Parada obrigatória',
        description: 'Selecione um tipo de parada antes de continuar.',
        variant: 'destructive'
      })
      return
    }

    if (!horaInicialParadaNormalizada || !horaFinalParadaNormalizada) {
      toast({
        title: 'Horário obrigatório',
        description: 'Informe hora inicial e hora final válidas.',
        variant: 'destructive'
      })
      return
    }

    if (!Number.isFinite(duracaoParadaMinutos) || duracaoParadaMinutos === null || duracaoParadaMinutos <= 0) {
      toast({
        title: 'Duração inválida',
        description: 'A hora final deve ser diferente da hora inicial.',
        variant: 'destructive'
      })
      return
    }

    setSalvandoParada(true)
    try {
      await registrarParadaRapidaOEE({
        contexto,
        paradaSelecionada,
        horaInicial: horaInicialParadaNormalizada,
        horaFinal: horaFinalParadaNormalizada,
        observacao: observacaoParada.trim()
      })

      setCodigoParadaBusca('')
      setParadaSelecionada(null)
      setHoraInicialParada('')
      setHoraFinalParada('')
      setObservacaoParada('')

      await executarPosRegistro()

      toast({
        title: 'Parada registrada',
        description: 'Parada lançada com sucesso no turno selecionado.'
      })
    } catch (error) {
      toast({
        title: 'Erro ao registrar parada',
        description: mensagemErro(error, 'Não foi possível registrar a parada rápida.'),
        variant: 'destructive'
      })
    } finally {
      setSalvandoParada(false)
    }
  }, [
    contexto,
    duracaoParadaMinutos,
    executarPosRegistro,
    horaFinalParadaNormalizada,
    horaInicialParadaNormalizada,
    observacaoParada,
    paradaSelecionada,
    toast
  ])

  const abrirBuscaParadas = useCallback(async () => {
    if (paradasGerais.length === 0 && !carregandoParadas) {
      await recarregarParadas()
    }
    setModalBuscaParadasAberto(true)
  }, [carregandoParadas, paradasGerais.length, recarregarParadas])

  const selecionarParada = useCallback((parada: ParadaGeral) => {
    setParadaSelecionada(parada)
    setCodigoParadaBusca(parada.codigo || '')
  }, [])

  return {
    abaAtiva,
    setAbaAtiva,
    carregandoDados,
    totalJanelas,
    janelasFaltantes,
    totalProducoesRegistradas,
    janelaSelecionada,
    setJanelaSelecionada,
    quantidadeProducao,
    setQuantidadeProducao,
    quantidadePerda,
    setQuantidadePerda,
    perdaNormalizada,
    codigoParadaBusca,
    paradaSelecionada,
    horaInicialParada,
    setHoraInicialParada,
    horaFinalParada,
    setHoraFinalParada,
    observacaoParada,
    setObservacaoParada,
    duracaoParadaFormatada,
    modalBuscaParadasAberto,
    setModalBuscaParadasAberto,
    paradasGerais,
    carregandoParadas,
    erroParadas,
    salvandoProducao,
    salvandoPerda,
    salvandoParada,
    abrirBuscaParadas,
    selecionarParada,
    registrarProducao,
    registrarPerda,
    registrarParada,
    recarregarParadas,
    atualizarHoraInicialParada: (valor: string) => setHoraInicialParada(limparHoraDigitadaOEE(valor)),
    atualizarHoraFinalParada: (valor: string) => setHoraFinalParada(limparHoraDigitadaOEE(valor)),
    finalizarHoraInicialParada: (valor: string) => setHoraInicialParada(normalizarHora24hOEE(valor, true)),
    finalizarHoraFinalParada: (valor: string) => setHoraFinalParada(normalizarHora24hOEE(valor, true))
  }
}
