/**
 * Dados mock de equipamentos/linhas de produção
 * Baseado nas 37 linhas do MVP distribuídas nos 4 setores
 */

import { Equipamento, StatusEquipamento } from '@/types/equipamento'
import { Setor, Turno } from '@/types/operacao'

/**
 * Gera um tempo aleatório em minutos
 */
function randomTempo(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Gera um progresso aleatório
 */
function randomProgresso(): number {
  return Math.floor(Math.random() * 100)
}

/**
 * Seleciona um item aleatório de um array
 */
function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Gera um número aleatório entre min e max
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const turnos: Turno[] = ['1º Turno', '2º Turno', '3º Turno', 'Administrativo']
const operadores = [
  'João Silva',
  'Maria Santos',
  'Pedro Oliveira',
  'Ana Costa',
  'Carlos Souza',
  'Juliana Lima',
  'Roberto Alves',
  'Fernanda Rocha'
]

const motivosParada = [
  'Manutenção Preventiva',
  'Falta de Insumo',
  'Quebra de Equipamento',
  'Troca de Formato',
  'Limpeza Programada',
  'Ajuste de Máquina',
  'Falta de Energia',
  'Problema de Qualidade'
]

const motivosIndisponibilidade = [
  'Manutenção Corretiva',
  'Aguardando Peças',
  'Sem Programação',
  'Qualificação em Andamento',
  'Reforma',
  'Validação de Processo'
]

const produtos = [
  'Soro Fisiológico 0,9% 500ml',
  'Ringer Lactato 500ml',
  'Glicose 5% 500ml',
  'Solução Glicofisiológica 500ml',
  'Cloreto de Sódio 20% 10ml',
  'Água para Injeção 10ml',
  'Dipirona Sódica 500mg/ml',
  'Paracetamol 200mg/ml',
  'Amoxicilina 250mg/5ml',
  'Concentrado Ácido para HD',
  'Concentrado Básico para HD'
]

/**
 * Gera dados mock de equipamentos com distribuição realista de status
 */
export function gerarMockEquipamentos(): Equipamento[] {
  const equipamentos: Equipamento[] = []
  let idCounter = 1

  // SPEP - 20 linhas (10 envase + 10 embalagem)
  const linhasSPEPEnvase = ['Linha A', 'Linha B', 'Linha C', 'Linha D', 'Linha E', 'Linha F', 'Linha G', 'Linha H', 'Linha I', 'SLE']
  const linhasSPEPEmbalagem = ['Esteira 02', 'Esteira 04', 'Esteira 05', 'Esteira 06', 'Esteira 07', 'Esteira 08', 'Esteira 09', 'Esteira 10', 'Esteira H', 'Esteira I']

  linhasSPEPEnvase.forEach((nome) => {
    equipamentos.push(gerarEquipamento(idCounter++, nome, 'SPEP'))
  })

  linhasSPEPEmbalagem.forEach((nome) => {
    equipamentos.push(gerarEquipamento(idCounter++, nome, 'SPEP'))
  })

  // SPPV - 10 linhas (5 envase + 5 embalagem)
  const linhasSPPVEnvase = ['Vidro 01', 'Vidro 02', 'Vidro 03', 'Vidro 04', 'Vidro 05']
  const linhasSPPVEmbalagem = ['Sala 01', 'Sala 02', 'Sala 04', 'Sala 05', 'Sala 06']

  linhasSPPVEnvase.forEach((nome) => {
    equipamentos.push(gerarEquipamento(idCounter++, nome, 'SPPV'))
  })

  linhasSPPVEmbalagem.forEach((nome) => {
    equipamentos.push(gerarEquipamento(idCounter++, nome, 'SPPV'))
  })

  // Líquidos - 5 linhas (3 envase + 2 embalagem)
  const linhasLiquidosEnvase = ['Linha A (L)', 'Linha B (L)', 'Linha C (L)']
  const linhasLiquidosEmbalagem = ['Encartuchadeira Vertopack', 'Encartuchadeira Hicart']

  linhasLiquidosEnvase.forEach((nome) => {
    equipamentos.push(gerarEquipamento(idCounter++, nome, 'Líquidos'))
  })

  linhasLiquidosEmbalagem.forEach((nome) => {
    equipamentos.push(gerarEquipamento(idCounter++, nome, 'Líquidos'))
  })

  // CPHD - 2 linhas
  const linhasCPHD = ['Linha Ácida', 'Linha Básica']

  linhasCPHD.forEach((nome) => {
    equipamentos.push(gerarEquipamento(idCounter++, nome, 'CPHD'))
  })

  return equipamentos
}

/**
 * Gera um equipamento individual com dados aleatórios
 */
function gerarEquipamento(id: number, nome: string, setor: Setor): Equipamento {
  // Distribuição de status (aproximadamente):
  // 40% Em Produção
  // 30% Disponível
  // 20% Paradas
  // 10% Não Disponível
  const rand = Math.random()
  let status: StatusEquipamento

  if (rand < 0.4) {
    status = 'Em Produção'
  } else if (rand < 0.7) {
    status = 'Disponível'
  } else if (rand < 0.9) {
    status = 'Paradas'
  } else {
    status = 'Não Disponível'
  }

  const equipamento: Equipamento = {
    id: `EQ${id.toString().padStart(3, '0')}`,
    nome,
    setor,
    status,
    tempoNaEtapa: randomTempo(5, 480), // 5 min a 8 horas
  }

  // Adiciona dados específicos baseado no status
  if (status === 'Em Produção') {
    const progresso = randomProgresso()
    const quantidadeTeorica = randomInt(1000, 10000)
    const quantidadeProduzida = Math.floor((quantidadeTeorica * progresso) / 100)

    equipamento.op = `OP${randomInt(100000, 999999)}`
    equipamento.produto = randomItem(produtos)
    equipamento.lote = `25${String.fromCharCode(65 + randomInt(0, 11))}${randomInt(100, 999)}`
    equipamento.turno = randomItem(turnos)
    equipamento.progresso = progresso
    equipamento.quantidadeProduzida = quantidadeProduzida
    equipamento.quantidadeTeorica = quantidadeTeorica
    equipamento.dataHoraInicio = new Date(Date.now() - randomTempo(60, 480) * 60000).toISOString()
    equipamento.operador = randomItem(operadores)
  } else if (status === 'Paradas') {
    equipamento.motivoParada = randomItem(motivosParada)
    equipamento.op = Math.random() > 0.5 ? `OP${randomInt(100000, 999999)}` : undefined
    equipamento.turno = randomItem(turnos)
    equipamento.operador = randomItem(operadores)
  } else if (status === 'Não Disponível') {
    equipamento.motivoIndisponibilidade = randomItem(motivosIndisponibilidade)
  } else if (status === 'Disponível') {
    equipamento.turno = randomItem(turnos)
  }

  return equipamento
}

/**
 * Dados mock de equipamentos
 */
export const mockEquipamentos: Equipamento[] = gerarMockEquipamentos()

