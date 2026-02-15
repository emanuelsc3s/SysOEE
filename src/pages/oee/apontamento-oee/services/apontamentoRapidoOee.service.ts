import type { ParadaGeral } from '@/components/apontamento/ModalBuscaParadas'
import { supabase } from '@/lib/supabase'
import { gerarTimestampLocal } from '@/utils/datahora.utils'
import { normalizarHoraBancoOEE } from '../utils/apontamentoRapidoOee.utils'
import type {
  ContextoTurnoRapidoOEE,
  RegistrarParadaRapidaOEEInput,
  RegistrarPerdaRapidaOEEInput,
  RegistrarProducaoRapidaOEEInput,
  RegistroProducaoRapidoOEE
} from '../types/apontamentoRapidoOee.types'

type LinhaProducaoResumo = {
  linhaproducao_id: number
  linhaproducao: string | null
  departamento_id: number | null
  departamento: string | null
}

type VelocidadeNominalQuery = {
  velocidade: number | string | null
}

type ParadaLookup = {
  oeeparada_id: number
  codigo: string | null
  natureza: string | null
  classe: string | null
  parada: string | null
  descricao: string | null
}

const obterMensagemErro = (error: unknown, mensagemPadrao: string): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    const mensagem = String((error as { message?: string }).message || '').trim()
    if (mensagem) {
      return mensagem
    }
  }

  return mensagemPadrao
}

const obterUsuarioAuthId = async (): Promise<string> => {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user?.id) {
    throw new Error('Usuário não autenticado. Faça login novamente para continuar.')
  }
  return data.user.id
}

const normalizarNumero = (valor: number | string | null | undefined): number | null => {
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : null
  }

  if (typeof valor === 'string') {
    const parsed = Number(valor)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

const buscarVelocidadeNominal = async (linhaProducaoId: number, produtoId: number): Promise<number | null> => {
  const { data, error } = await supabase
    .from('tbvelocidadenominal')
    .select('velocidade')
    .eq('linhaproducao_id', linhaProducaoId)
    .eq('produto_id', produtoId)
    .eq('deletado', 'N')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<VelocidadeNominalQuery>()

  if (error) {
    throw new Error(obterMensagemErro(error, 'Não foi possível consultar a velocidade nominal.'))
  }

  return normalizarNumero(data?.velocidade)
}

const buscarLinhaProducaoResumo = async (linhaProducaoId: number): Promise<LinhaProducaoResumo | null> => {
  const { data, error } = await supabase
    .from('tblinhaproducao')
    .select('linhaproducao_id, linhaproducao, departamento_id, departamento')
    .eq('linhaproducao_id', linhaProducaoId)
    .is('deleted_at', null)
    .maybeSingle<LinhaProducaoResumo>()

  if (error) {
    throw new Error(obterMensagemErro(error, 'Não foi possível consultar os dados da linha de produção.'))
  }

  return data ?? null
}

const buscarParadaPorCodigo = async (codigo: string): Promise<ParadaLookup | null> => {
  const { data, error } = await supabase
    .from('tboee_parada')
    .select('oeeparada_id, codigo, natureza, classe, parada, descricao')
    .eq('codigo', codigo)
    .eq('deletado', 'N')
    .limit(1)
    .maybeSingle<ParadaLookup>()

  if (error) {
    throw new Error(obterMensagemErro(error, 'Não foi possível localizar o código de parada.'))
  }

  return data ?? null
}

const validarContextoProducao = (contexto: ContextoTurnoRapidoOEE): void => {
  if (!Number.isFinite(contexto.oeeturnoId)) {
    throw new Error('Turno OEE inválido para registrar produção.')
  }

  if (!Number.isFinite(contexto.turnoId)) {
    throw new Error('Turno inválido para registrar produção.')
  }

  if (!Number.isFinite(contexto.produtoId)) {
    throw new Error('Produto inválido para registrar produção.')
  }

  if (!Number.isFinite(contexto.linhaProducaoId ?? Number.NaN)) {
    throw new Error('Linha de produção não identificada para este turno.')
  }
}

export async function buscarProducoesTurnoRapidoOEE(oeeturnoId: number): Promise<RegistroProducaoRapidoOEE[]> {
  if (!Number.isFinite(oeeturnoId)) {
    return []
  }

  const { data, error } = await supabase
    .from('tboee_turno_producao')
    .select('oeeturnoproducao_id, hora_inicio, hora_final, quantidade')
    .eq('oeeturno_id', oeeturnoId)
    .or('deletado.is.null,deletado.eq.N')
    .order('hora_inicio', { ascending: true })

  if (error) {
    throw new Error(obterMensagemErro(error, 'Não foi possível carregar os apontamentos de produção do turno.'))
  }

  return (data || []) as RegistroProducaoRapidoOEE[]
}

export async function buscarParadasGeraisRapidoOEE(): Promise<ParadaGeral[]> {
  const { data, error } = await supabase
    .from('tboee_parada')
    .select('codigo, componente, classe, natureza, parada, descricao')
    .eq('deletado', 'N')
    .order('codigo', { ascending: true })

  if (error) {
    throw new Error(obterMensagemErro(error, 'Não foi possível carregar os tipos de parada.'))
  }

  return (data || []).map((registro) => ({
    codigo: registro.codigo || '',
    componente: registro.componente || '',
    classe: registro.classe || '',
    natureza: registro.natureza || '',
    parada: registro.parada || '',
    descricao: registro.descricao || ''
  }))
}

export async function registrarProducaoRapidaOEE(input: RegistrarProducaoRapidaOEEInput): Promise<void> {
  const { contexto, janela, quantidade } = input
  validarContextoProducao(contexto)

  if (!Number.isFinite(quantidade) || quantidade <= 0) {
    throw new Error('Informe uma quantidade de produção válida.')
  }

  const horaInicio = normalizarHoraBancoOEE(janela.horaInicio)
  const horaFim = normalizarHoraBancoOEE(janela.horaFim)

  if (!horaInicio || !horaFim) {
    throw new Error('Janela de apontamento inválida.')
  }

  const { data: duplicado, error: erroDuplicado } = await supabase
    .from('tboee_turno_producao')
    .select('oeeturnoproducao_id')
    .eq('oeeturno_id', contexto.oeeturnoId)
    .eq('hora_inicio', horaInicio)
    .or('deletado.is.null,deletado.eq.N')
    .limit(1)
    .maybeSingle<{ oeeturnoproducao_id: number }>()

  if (erroDuplicado) {
    throw new Error(obterMensagemErro(erroDuplicado, 'Não foi possível validar duplicidade da produção.'))
  }

  if (duplicado?.oeeturnoproducao_id) {
    throw new Error('Já existe produção registrada para esta janela hora a hora.')
  }

  const linhaProducaoId = contexto.linhaProducaoId as number
  const velocidadeNominal = await buscarVelocidadeNominal(linhaProducaoId, contexto.produtoId)
  if (!velocidadeNominal) {
    throw new Error('Velocidade nominal não encontrada para linha e produto deste turno.')
  }

  const linhaResumo = await buscarLinhaProducaoResumo(linhaProducaoId)
  const usuarioAuthId = await obterUsuarioAuthId()
  const timestamp = gerarTimestampLocal()

  const payload = {
    linhaproducao_id: linhaProducaoId,
    linhaproducao: linhaResumo?.linhaproducao || contexto.linhaProducaoNome || null,
    departamento_id: linhaResumo?.departamento_id ?? null,
    departamento: linhaResumo?.departamento ?? null,
    produto_id: contexto.produtoId,
    produto: contexto.produto,
    velocidade: velocidadeNominal,
    quantidade,
    data: contexto.data,
    hora_inicio: horaInicio,
    hora_final: horaFim,
    turno_id: contexto.turnoId,
    turno: contexto.turno,
    oeeturno_id: contexto.oeeturnoId,
    created_at: timestamp,
    created_by: usuarioAuthId,
    updated_at: timestamp,
    updated_by: usuarioAuthId,
    deletado: 'N'
  }

  const { error } = await supabase
    .from('tboee_turno_producao')
    .insert(payload)

  if (error) {
    throw new Error(obterMensagemErro(error, 'Não foi possível registrar a produção rápida.'))
  }
}

export async function registrarPerdaRapidaOEE(input: RegistrarPerdaRapidaOEEInput): Promise<void> {
  const { contexto, perdaNormalizada } = input

  if (!Number.isFinite(contexto.oeeturnoId)) {
    throw new Error('Turno OEE inválido para registrar perda.')
  }

  if (!perdaNormalizada || Number(perdaNormalizada) <= 0) {
    throw new Error('Informe uma quantidade de perda válida.')
  }

  const usuarioAuthId = await obterUsuarioAuthId()

  const { error } = await supabase
    .from('tboee_turno_perda')
    .insert({
      oeeturno_id: contexto.oeeturnoId,
      data: contexto.data,
      perda: perdaNormalizada,
      created_at: gerarTimestampLocal(),
      created_by: usuarioAuthId
    })

  if (error) {
    throw new Error(obterMensagemErro(error, 'Não foi possível registrar a perda rápida.'))
  }
}

export async function registrarParadaRapidaOEE(input: RegistrarParadaRapidaOEEInput): Promise<void> {
  const { contexto, paradaSelecionada, horaInicial, horaFinal, observacao } = input

  if (!Number.isFinite(contexto.oeeturnoId)) {
    throw new Error('Turno OEE inválido para registrar parada.')
  }

  const parada = await buscarParadaPorCodigo(paradaSelecionada.codigo)
  if (!parada?.oeeparada_id) {
    throw new Error('Código de parada não encontrado no banco de dados.')
  }

  const horaInicioBanco = normalizarHoraBancoOEE(horaInicial)
  const horaFinalBanco = normalizarHoraBancoOEE(horaFinal)
  if (!horaInicioBanco || !horaFinalBanco) {
    throw new Error('Horário de parada inválido.')
  }

  const usuarioAuthId = await obterUsuarioAuthId()

  const { error } = await supabase
    .from('tboee_turno_parada')
    .insert({
      oeeturno_id: contexto.oeeturnoId,
      data: contexto.data,
      oeeparada_id: parada.oeeparada_id,
      parada: parada.parada || parada.descricao || paradaSelecionada.parada || 'Parada',
      natureza: parada.natureza || paradaSelecionada.natureza || null,
      classe: parada.classe || paradaSelecionada.classe || null,
      hora_inicio: horaInicioBanco,
      hora_fim: horaFinalBanco,
      observacao: observacao || null,
      created_at: gerarTimestampLocal(),
      created_by: usuarioAuthId,
      deletado: 'N'
    })

  if (error) {
    throw new Error(obterMensagemErro(error, 'Não foi possível registrar a parada rápida.'))
  }
}
