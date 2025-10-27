/**
 * Serviço de armazenamento de equipamentos no localStorage
 * Gerencia estado dos equipamentos/linhas de produção
 */

import { Equipamento, StatusEquipamento } from '@/types/equipamento'
import { Setor, Turno } from '@/types/operacao'

const STORAGE_KEY = 'sysoee_equipamentos'
const LINHAS_KEY = 'sysoee_linhas_producao'

/**
 * Interface para linha de produção do banco de dados
 */
export interface LinhaProducao {
  LINHAPRODUCAO_ID: number
  LINHAPRODUCAO: string
}

/**
 * Dados das linhas de produção reais
 */
const LINHAS_PRODUCAO_REAIS: LinhaProducao[] = [
  { LINHAPRODUCAO_ID: 1, LINHAPRODUCAO: "SPPV - VIDRO 1" },
  { LINHAPRODUCAO_ID: 2, LINHAPRODUCAO: "SPPV - VIDRO 2" },
  { LINHAPRODUCAO_ID: 3, LINHAPRODUCAO: "BOTTELPACK A" },
  { LINHAPRODUCAO_ID: 4, LINHAPRODUCAO: "BOTTELPACK B" },
  { LINHAPRODUCAO_ID: 5, LINHAPRODUCAO: "SPPV - VIDRO 3" },
  { LINHAPRODUCAO_ID: 6, LINHAPRODUCAO: "SPPV - VIDRO 4" },
  { LINHAPRODUCAO_ID: 7, LINHAPRODUCAO: "SPEP 3 - LINHA H - EMBALAGEM" },
  { LINHAPRODUCAO_ID: 8, LINHAPRODUCAO: "SPEP 3 - LINHA H - ENVASE" },
  { LINHAPRODUCAO_ID: 9, LINHAPRODUCAO: "SPEP 3 - LINHA I - EMBALAGEM" },
  { LINHAPRODUCAO_ID: 10, LINHAPRODUCAO: "SPEP 3 - LINHA I - ENVASE" },
  { LINHAPRODUCAO_ID: 11, LINHAPRODUCAO: "SPEP 1 - LINHA A - ENVASE" },
  { LINHAPRODUCAO_ID: 12, LINHAPRODUCAO: "SPEP 1 - LINHA B - ENVASE" },
  { LINHAPRODUCAO_ID: 13, LINHAPRODUCAO: "SPEP 1 - LINHA C - ENVASE" },
  { LINHAPRODUCAO_ID: 14, LINHAPRODUCAO: "SPEP 2 - LINHA D - ENVASE" },
  { LINHAPRODUCAO_ID: 15, LINHAPRODUCAO: "SPEP 2 - LINHA E - ENVASE" },
  { LINHAPRODUCAO_ID: 16, LINHAPRODUCAO: "SPEP 2 - LINHA F - ENVASE" },
  { LINHAPRODUCAO_ID: 17, LINHAPRODUCAO: "SPEP 2 - LINHA G - ENVASE" },
  { LINHAPRODUCAO_ID: 18, LINHAPRODUCAO: "SPEP 1 - LINHA A - EMBALAGEM - ESTEIRA 2" },
  { LINHAPRODUCAO_ID: 19, LINHAPRODUCAO: "SPEP 1 - LINHA A - EMBALAGEM - ESTEIRA 7" },
  { LINHAPRODUCAO_ID: 20, LINHAPRODUCAO: "SPEP 1 - LINHA B - EMBALAGEM - ESTEIRA 4" },
  { LINHAPRODUCAO_ID: 21, LINHAPRODUCAO: "SPEP 1 - LINHA C - EMBALAGEM - ESTEIRA 5" },
  { LINHAPRODUCAO_ID: 22, LINHAPRODUCAO: "SPEP 1 - LINHA C - EMBALAGEM - ESTEIRA 6" },
  { LINHAPRODUCAO_ID: 23, LINHAPRODUCAO: "SPEP 2 - LINHA D - EMBALAGEM - ESTEIRA 8" },
  { LINHAPRODUCAO_ID: 24, LINHAPRODUCAO: "SPEP 2 - LINHA E - EMBALAGEM - ESTEIRA 10" },
  { LINHAPRODUCAO_ID: 25, LINHAPRODUCAO: "SPEP 2 - LINHA F - EMBALAGEM - ESTEIRA 9" },
  { LINHAPRODUCAO_ID: 26, LINHAPRODUCAO: "SPEP 2 - LINHA G - EMBALAGEM - ESTEIRA 8" },
  { LINHAPRODUCAO_ID: 27, LINHAPRODUCAO: "SPEP 1 - LINHA A" },
  { LINHAPRODUCAO_ID: 28, LINHAPRODUCAO: "SPEP 1 - LINHA B" },
  { LINHAPRODUCAO_ID: 29, LINHAPRODUCAO: "SPEP 1 - LINHA C" },
  { LINHAPRODUCAO_ID: 37, LINHAPRODUCAO: "SPEP 2 - LINHA D" },
  { LINHAPRODUCAO_ID: 38, LINHAPRODUCAO: "SPEP 2 - LINHA E" },
  { LINHAPRODUCAO_ID: 39, LINHAPRODUCAO: "SPEP 2 - LINHA F" },
  { LINHAPRODUCAO_ID: 40, LINHAPRODUCAO: "SPEP 2 - LINHA G" },
  { LINHAPRODUCAO_ID: 30, LINHAPRODUCAO: "SPPV - VIDRO 5" },
  { LINHAPRODUCAO_ID: 31, LINHAPRODUCAO: "CPHD - LINHA A" },
  { LINHAPRODUCAO_ID: 32, LINHAPRODUCAO: "CPHD - LINHA B" },
  { LINHAPRODUCAO_ID: 33, LINHAPRODUCAO: "CPHD - LINHA C" },
  { LINHAPRODUCAO_ID: 34, LINHAPRODUCAO: "LIQUIDOS - LINHA A" },
  { LINHAPRODUCAO_ID: 35, LINHAPRODUCAO: "LIQUIDOS - LINHA B" },
  { LINHAPRODUCAO_ID: 36, LINHAPRODUCAO: "LIQUIDOS - LINHA C" },
  { LINHAPRODUCAO_ID: 41, LINHAPRODUCAO: "SPEP 3 - LINHA H" },
  { LINHAPRODUCAO_ID: 42, LINHAPRODUCAO: "SPEP 3 - LINHA I" }
]

/**
 * Turnos disponíveis (apenas 1º e 2º)
 */
const TURNOS: Turno[] = ['1º Turno', '2º Turno']

/**
 * Produtos disponíveis
 */
const PRODUTOS = [
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
 * Operadores disponíveis
 */
const OPERADORES = [
  'João Silva',
  'Maria Santos',
  'Pedro Oliveira',
  'Ana Costa',
  'Carlos Souza',
  'Juliana Lima',
  'Roberto Alves',
  'Fernanda Rocha'
]

/**
 * Motivos de parada
 */
const MOTIVOS_PARADA = [
  'Manutenção Preventiva',
  'Falta de Insumo',
  'Quebra de Equipamento',
  'Troca de Formato',
  'Limpeza Programada',
  'Ajuste de Máquina',
  'Falta de Energia',
  'Problema de Qualidade'
]

/**
 * Motivos de indisponibilidade
 */
const MOTIVOS_INDISPONIBILIDADE = [
  'Manutenção Corretiva',
  'Aguardando Peças',
  'Sem Programação',
  'Qualificação em Andamento',
  'Reforma',
  'Validação de Processo'
]

/**
 * Determina o setor com base no nome da linha
 */
function determinarSetor(nomeLinha: string): Setor {
  const nome = nomeLinha.toUpperCase()
  if (nome.includes('SPPV') || nome.includes('VIDRO')) return 'SPPV'
  if (nome.includes('SPEP') || nome.includes('BOTTELPACK')) return 'SPEP'
  if (nome.includes('CPHD')) return 'CPHD'
  if (nome.includes('LIQUIDOS')) return 'Líquidos'
  return 'SPEP' // fallback
}

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

/**
 * Gera dados iniciais de equipamentos baseado nas linhas reais
 */
function gerarEquipamentosIniciais(): Equipamento[] {
  return LINHAS_PRODUCAO_REAIS.map((linha) => {
    const setor = determinarSetor(linha.LINHAPRODUCAO)

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
      id: `EQ${linha.LINHAPRODUCAO_ID.toString().padStart(3, '0')}`,
      nome: linha.LINHAPRODUCAO,
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
      equipamento.produto = randomItem(PRODUTOS)
      equipamento.lote = `25${String.fromCharCode(65 + randomInt(0, 11))}${randomInt(100, 999)}`
      equipamento.turno = randomItem(TURNOS)
      equipamento.progresso = progresso
      equipamento.quantidadeProduzida = quantidadeProduzida
      equipamento.quantidadeTeorica = quantidadeTeorica
      equipamento.dataHoraInicio = new Date(Date.now() - randomTempo(60, 480) * 60000).toISOString()
      equipamento.operador = randomItem(OPERADORES)
    } else if (status === 'Paradas') {
      equipamento.motivoParada = randomItem(MOTIVOS_PARADA)
      equipamento.op = Math.random() > 0.5 ? `OP${randomInt(100000, 999999)}` : undefined
      equipamento.turno = randomItem(TURNOS)
      equipamento.operador = randomItem(OPERADORES)
    } else if (status === 'Não Disponível') {
      equipamento.motivoIndisponibilidade = randomItem(MOTIVOS_INDISPONIBILIDADE)
    } else if (status === 'Disponível') {
      equipamento.turno = randomItem(TURNOS)
    }

    return equipamento
  })
}

/**
 * Inicializa dados no localStorage se não existirem
 */
export function inicializarDados(): void {
  try {
    // Salva as linhas de produção
    const linhasExistentes = localStorage.getItem(LINHAS_KEY)
    if (!linhasExistentes) {
      localStorage.setItem(LINHAS_KEY, JSON.stringify({ RecordSet: LINHAS_PRODUCAO_REAIS }))
      console.log('✅ Linhas de produção inicializadas no localStorage')
    }

    // Salva os equipamentos
    const equipamentosExistentes = localStorage.getItem(STORAGE_KEY)
    if (!equipamentosExistentes) {
      const equipamentos = gerarEquipamentosIniciais()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(equipamentos))
      console.log('✅ Equipamentos inicializados no localStorage:', equipamentos.length, 'equipamentos')
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar dados no localStorage:', error)
  }
}

/**
 * Migra equipamentos com turnos inválidos
 */
function migrarEquipamentosAntigos(equipamentos: Equipamento[]): Equipamento[] {
  const turnosValidos: Turno[] = ['1º Turno', '2º Turno']
  let migrados = 0

  const equipamentosMigrados = equipamentos.map(eq => {
    if (eq.turno && !turnosValidos.includes(eq.turno)) {
      console.warn(`🔄 Migrando equipamento ${eq.nome} de turno inválido "${eq.turno}" para "1º Turno"`)
      migrados++
      return { ...eq, turno: '1º Turno' as Turno }
    }
    return eq
  })

  if (migrados > 0) {
    console.log(`✅ Migração de equipamentos concluída: ${migrados} turnos atualizados`)
  }

  return equipamentosMigrados
}

/**
 * Busca todos os equipamentos do localStorage
 */
export function buscarTodosEquipamentos(): Equipamento[] {
  try {
    const dados = localStorage.getItem(STORAGE_KEY)
    if (!dados) {
      // Se não existirem dados, inicializa
      inicializarDados()
      const novoDados = localStorage.getItem(STORAGE_KEY)
      return novoDados ? JSON.parse(novoDados) : []
    }

    // Migra equipamentos antigos se necessário
    let equipamentos = JSON.parse(dados)
    equipamentos = migrarEquipamentosAntigos(equipamentos)

    // Salva dados migrados
    localStorage.setItem(STORAGE_KEY, JSON.stringify(equipamentos))

    return equipamentos
  } catch (error) {
    console.error('❌ Erro ao buscar equipamentos do localStorage:', error)
    return []
  }
}

/**
 * Busca equipamentos por setor
 */
export function buscarEquipamentosPorSetor(setor: Setor): Equipamento[] {
  const todosEquipamentos = buscarTodosEquipamentos()
  return todosEquipamentos.filter(eq => eq.setor === setor)
}

/**
 * Busca equipamentos por status
 */
export function buscarEquipamentosPorStatus(status: StatusEquipamento): Equipamento[] {
  const todosEquipamentos = buscarTodosEquipamentos()
  return todosEquipamentos.filter(eq => eq.status === status)
}

/**
 * Busca um equipamento específico por ID
 */
export function buscarEquipamentoPorId(id: string): Equipamento | null {
  const todosEquipamentos = buscarTodosEquipamentos()
  return todosEquipamentos.find(eq => eq.id === id) || null
}

/**
 * Atualiza um equipamento no localStorage
 */
export function atualizarEquipamento(id: string, dadosAtualizacao: Partial<Equipamento>): Equipamento | null {
  try {
    const todosEquipamentos = buscarTodosEquipamentos()
    const index = todosEquipamentos.findIndex(eq => eq.id === id)

    if (index === -1) {
      console.error('❌ Equipamento não encontrado:', id)
      return null
    }

    // Atualiza o equipamento
    todosEquipamentos[index] = {
      ...todosEquipamentos[index],
      ...dadosAtualizacao,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(todosEquipamentos))
    console.log('✅ Equipamento atualizado no localStorage:', todosEquipamentos[index])
    return todosEquipamentos[index]
  } catch (error) {
    console.error('❌ Erro ao atualizar equipamento no localStorage:', error)
    throw error
  }
}

/**
 * Busca todas as linhas de produção
 */
export function buscarLinhasProducao(): LinhaProducao[] {
  try {
    const dados = localStorage.getItem(LINHAS_KEY)
    if (!dados) {
      inicializarDados()
      const novoDados = localStorage.getItem(LINHAS_KEY)
      const parsed = novoDados ? JSON.parse(novoDados) : { RecordSet: [] }
      return parsed.RecordSet || []
    }
    const parsed = JSON.parse(dados)
    return parsed.RecordSet || []
  } catch (error) {
    console.error('❌ Erro ao buscar linhas de produção do localStorage:', error)
    return []
  }
}

/**
 * Limpa todos os dados do localStorage (usar com cuidado!)
 */
export function limparTodosDados(): void {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(LINHAS_KEY)
  console.log('🗑️ Todos os dados de equipamentos foram removidos do localStorage')
}

/**
 * Reinicializa os dados (apaga e cria novamente)
 */
export function reinicializarDados(): void {
  limparTodosDados()
  inicializarDados()
  console.log('🔄 Dados reinicializados no localStorage')
}

/**
 * Exporta equipamentos para JSON (para backup/debug)
 */
export function exportarEquipamentos(): string {
  const equipamentos = buscarTodosEquipamentos()
  return JSON.stringify(equipamentos, null, 2)
}

/**
 * Importa equipamentos de JSON (para restaurar backup)
 */
export function importarEquipamentos(json: string): boolean {
  try {
    const equipamentos = JSON.parse(json)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(equipamentos))
    console.log('✅ Equipamentos importados com sucesso')
    return true
  } catch (error) {
    console.error('❌ Erro ao importar equipamentos:', error)
    return false
  }
}
