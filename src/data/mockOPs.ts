/**
 * Dados mock para Ordens de Produção
 * Baseado nos dados TSV fornecidos com campos adicionais gerados
 */

import { OrdemProducao, FaseProducao, Turno } from '@/types/operacao'

/**
 * Equipamentos por setor (baseado nas especificações do projeto)
 */
const equipamentosPorSetor = {
  SPEP: [
    'Linha A', 'Linha B', 'Linha C', 'Linha D', 'Linha E',
    'Linha F', 'Linha G', 'Linha H', 'Linha I', 'SLE',
    'Esteira 02', 'Esteira 04', 'Esteira 05', 'Esteira 06',
    'Esteira 07', 'Esteira 08', 'Esteira 09', 'Esteira 10',
    'Esteira H', 'Esteira I'
  ],
  SPPV: [
    'Vidro 01', 'Vidro 02', 'Vidro 03', 'Vidro 04', 'Vidro 05',
    'Sala 01', 'Sala 02', 'Sala 04', 'Sala 05', 'Sala 06'
  ],
  Líquidos: [
    'Linha A (L)', 'Linha B (L)', 'Linha C (L)',
    'Encartuchadeira Vertopack', 'Encartuchadeira Hicart'
  ],
  CPHD: ['Linha Ácida', 'Linha Básica']
}

/**
 * Fases disponíveis no Kanban
 */
const fases: FaseProducao[] = [
  'Planejado',
  'Emissão de Dossiê',
  'Pesagem',
  'Preparação',
  'Envase',
  'Embalagem',
  'Concluído'
]

/**
 * Turnos disponíveis
 * Sistema utiliza apenas 2 turnos de 8 horas cada
 */
const turnos: Turno[] = ['1º Turno', '2º Turno']

/**
 * Gera um número aleatório entre min e max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Seleciona um item aleatório de um array
 */
function randomItem<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)]
}

/**
 * Gera horas no formato HH:MM
 */
function gerarHoras(): string {
  const horas = randomInt(0, 48)
  const minutos = randomInt(0, 59)
  return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`
}

/**
 * Determina o setor baseado no código do SKU ou descrição
 * (Função reservada para uso futuro)
 */
/*
function determinarSetor(sku: string, descricao: string): Setor {
  const desc = descricao.toUpperCase()

  // Líquidos: produtos com "ML" em volumes maiores ou "GOTAS"
  if (desc.includes('GOTAS') || desc.includes('XAROPE')) {
    return 'Líquidos'
  }

  // CPHD: produtos de hemodiálise
  if (desc.includes('HEMODIALISE') || desc.includes('CONCENTRADO')) {
    return 'CPHD'
  }

  // SPPV: soluções em vidro
  if (desc.includes('VIDRO') || (desc.includes('SOL.') && desc.includes('ML'))) {
    return 'SPPV'
  }

  // SPEP: soluções parenterais em plástico (padrão)
  return 'SPEP'
}
*/

/**
 * Dados mock das Ordens de Produção
 * Baseado no TSV fornecido com campos adicionais gerados
 */
export const mockOPs: OrdemProducao[] = [
  {
    op: '136592',
    dataEmissao: '31/01/2025',
    lote: '25A016-90',
    sku: '01010014',
    produto: 'POLIETILENO PEBD FS0729',
    equipamento: randomItem(equipamentosPorSetor.SPEP),
    fase: randomItem(fases),
    quantidadeTeorica: 3738,
    perdas: randomInt(0, 100),
    quantidadeEmbaladaUnidades: randomInt(0, 3738),
    horas: gerarHoras(),
    turno: randomItem(turnos),
    dossie: '016/25',
    setor: 'SPEP'
  },
  {
    op: '136591',
    dataEmissao: '31/01/2025',
    lote: '25A031-PB',
    sku: '01010017',
    produto: 'POLIETILENO PEBD PROCESSADO RFS0729',
    equipamento: randomItem(equipamentosPorSetor.SPEP),
    fase: randomItem(fases),
    quantidadeTeorica: 3022.52,
    perdas: randomInt(0, 80),
    quantidadeEmbaladaUnidades: randomInt(0, 3022),
    horas: gerarHoras(),
    turno: randomItem(turnos),
    dossie: '031/25',
    setor: 'SPEP'
  },
  {
    op: '136557',
    dataEmissao: '31/01/2025',
    lote: 'DS25B056',
    sku: '07060039',
    produto: 'DIPIRONA MONOIDRATADA 500MG/ML 10ML - HOSP',
    equipamento: randomItem(equipamentosPorSetor.SPPV),
    fase: randomItem(fases),
    quantidadeTeorica: 98522,
    perdas: randomInt(0, 500),
    quantidadeEmbaladaUnidades: randomInt(0, 98522),
    horas: gerarHoras(),
    turno: randomItem(turnos),
    dossie: 'DS.056/25',
    anvisa: '1108500300027',
    setor: 'SPPV'
  },
  {
    op: '136556',
    dataEmissao: '31/01/2025',
    lote: 'DS25B055',
    sku: '07060039',
    produto: 'DIPIRONA MONOIDRATADA 500MG/ML 10ML - HOSP',
    equipamento: randomItem(equipamentosPorSetor.SPPV),
    fase: randomItem(fases),
    quantidadeTeorica: 98522,
    perdas: randomInt(0, 500),
    quantidadeEmbaladaUnidades: randomInt(0, 98522),
    horas: gerarHoras(),
    turno: randomItem(turnos),
    dossie: 'DS.055/25',
    anvisa: '1108500300027',
    setor: 'SPPV'
  },
  {
    op: '136554',
    dataEmissao: '31/01/2025',
    lote: 'DS25B054',
    sku: '07060041',
    produto: 'DIPIRONA MONOIDRATADA 500MG/ML 20ML - HOSP',
    equipamento: randomItem(equipamentosPorSetor.SPPV),
    fase: randomItem(fases),
    quantidadeTeorica: 49383,
    perdas: randomInt(0, 300),
    quantidadeEmbaladaUnidades: randomInt(0, 49383),
    horas: gerarHoras(),
    turno: randomItem(turnos),
    dossie: 'DS.054/25',
    anvisa: '1108500300086',
    setor: 'SPPV'
  },
  {
    op: '136553',
    dataEmissao: '31/01/2025',
    lote: 'DS25B053',
    sku: '07060041',
    produto: 'DIPIRONA MONOIDRATADA 500MG/ML 20ML - HOSP',
    equipamento: randomItem(equipamentosPorSetor.SPPV),
    fase: randomItem(fases),
    quantidadeTeorica: 49383,
    perdas: randomInt(0, 300),
    quantidadeEmbaladaUnidades: randomInt(0, 49383),
    horas: gerarHoras(),
    turno: randomItem(turnos),
    dossie: 'DS.043/25',
    anvisa: '1108500300086',
    setor: 'SPPV'
  },
  {
    op: '136552',
    dataEmissao: '31/01/2025',
    lote: 'DS25B052',
    sku: '07060040',
    produto: 'DIPIRONA MONOIDRATADA 500MG/ML 10ML CT - FARMA',
    equipamento: randomItem(equipamentosPorSetor.SPPV),
    fase: randomItem(fases),
    quantidadeTeorica: 98522,
    perdas: randomInt(0, 500),
    quantidadeEmbaladaUnidades: randomInt(0, 98522),
    horas: gerarHoras(),
    turno: randomItem(turnos),
    dossie: 'DS.052/25',
    anvisa: '1108500300019',
    setor: 'SPPV'
  },
  {
    op: '136551',
    dataEmissao: '31/01/2025',
    lote: '25B10113D',
    sku: '07010026',
    produto: 'AGUA PARA INJECAO 10ML - SF',
    equipamento: randomItem(equipamentosPorSetor.SPEP),
    fase: randomItem(fases),
    quantidadeTeorica: 95238,
    perdas: randomInt(0, 500),
    quantidadeEmbaladaUnidades: randomInt(0, 95238),
    horas: gerarHoras(),
    turno: randomItem(turnos),
    dossie: '10113D/25',
    anvisa: '1108500110066',
    setor: 'SPEP'
  },
  {
    op: '136550',
    dataEmissao: '31/01/2025',
    lote: '25B10112D',
    sku: '07010026',
    produto: 'AGUA PARA INJECAO 10ML - SF',
    equipamento: randomItem(equipamentosPorSetor.SPEP),
    fase: randomItem(fases),
    quantidadeTeorica: 95238,
    perdas: randomInt(0, 500),
    quantidadeEmbaladaUnidades: randomInt(0, 95238),
    horas: gerarHoras(),
    turno: randomItem(turnos),
    dossie: '10112D/25',
    anvisa: '1108500110066',
    setor: 'SPEP'
  },
  {
    op: '136549',
    dataEmissao: '31/01/2025',
    lote: '25B10111D',
    sku: '07010026',
    produto: 'AGUA PARA INJECAO 10ML - SF',
    equipamento: randomItem(equipamentosPorSetor.SPEP),
    fase: randomItem(fases),
    quantidadeTeorica: 95238,
    perdas: randomInt(0, 500),
    quantidadeEmbaladaUnidades: randomInt(0, 95238),
    horas: gerarHoras(),
    turno: randomItem(turnos),
    dossie: '10111D/25',
    anvisa: '1108500110066',
    setor: 'SPEP'
  },
  {
    op: '136548',
    dataEmissao: '31/01/2025',
    lote: '25B10110D',
    sku: '07010026',
    produto: 'AGUA PARA INJECAO 10ML - SF',
    equipamento: randomItem(equipamentosPorSetor.SPEP),
    fase: randomItem(fases),
    quantidadeTeorica: 95238,
    perdas: randomInt(0, 500),
    quantidadeEmbaladaUnidades: randomInt(0, 95238),
    horas: gerarHoras(),
    turno: randomItem(turnos),
    dossie: '10110D',
    anvisa: '1108500110066',
    setor: 'SPEP'
  },
  {
    op: '136538',
    dataEmissao: '31/01/2025',
    lote: '25B0025H',
    sku: '07010012',
    produto: 'SOL. CLORETO DE SODIO 0,9% 100ML - SF',
    equipamento: randomItem(equipamentosPorSetor.SPEP),
    fase: randomItem(fases),
    quantidadeTeorica: 196078,
    perdas: randomInt(0, 1000),
    quantidadeEmbaladaUnidades: randomInt(0, 196078),
    horas: gerarHoras(),
    turno: randomItem(turnos),
    dossie: '0025H/25',
    anvisa: '1108500010215',
    setor: 'SPEP'
  },
  {
    op: '136537',
    dataEmissao: '31/01/2025',
    lote: '25B20042G',
    sku: '07010027',
    produto: 'SOL. CLORETO DE SODIO 0,9% DE 10ML - SF',
    equipamento: randomItem(equipamentosPorSetor.SPEP),
    fase: randomItem(fases),
    quantidadeTeorica: 95238,
    perdas: randomInt(0, 500),
    quantidadeEmbaladaUnidades: randomInt(0, 95238),
    horas: gerarHoras(),
    turno: randomItem(turnos),
    dossie: '20042G/25',
    anvisa: '1108500010037',
    setor: 'SPEP'
  },
  {
    op: '136536',
    dataEmissao: '31/01/2025',
    lote: '25B20041G',
    sku: '07010027',
    produto: 'SOL. CLORETO DE SODIO 0,9% DE 10ML - SF',
    equipamento: randomItem(equipamentosPorSetor.SPEP),
    fase: randomItem(fases),
    quantidadeTeorica: 95238,
    perdas: randomInt(0, 500),
    quantidadeEmbaladaUnidades: randomInt(0, 95238),
    horas: gerarHoras(),
    turno: randomItem(turnos),
    dossie: '20041G/25',
    anvisa: '1108500010037',
    setor: 'SPEP'
  },
  {
    op: '136535',
    dataEmissao: '31/01/2025',
    lote: '25B20040G',
    sku: '07010027',
    produto: 'SOL. CLORETO DE SODIO 0,9% DE 10ML - SF',
    equipamento: randomItem(equipamentosPorSetor.SPEP),
    fase: randomItem(fases),
    quantidadeTeorica: 95238,
    perdas: randomInt(0, 500),
    quantidadeEmbaladaUnidades: randomInt(0, 95238),
    horas: gerarHoras(),
    turno: randomItem(turnos),
    dossie: '20040G/25',
    anvisa: '1108500010037',
    setor: 'SPEP'
  },
  {
    op: '136533',
    dataEmissao: '31/01/2025',
    lote: '25B16060F',
    sku: '07010013',
    produto: 'SOL. CLORETO DE SODIO 0,9% 250ML - SF',
    equipamento: randomItem(equipamentosPorSetor.SPEP),
    fase: randomItem(fases),
    quantidadeTeorica: 17254,
    perdas: randomInt(0, 200),
    quantidadeEmbaladaUnidades: randomInt(0, 17254),
    horas: gerarHoras(),
    turno: randomItem(turnos),
    dossie: '16060F/25',
    anvisa: '1108500010207',
    setor: 'SPEP'
  },
  {
    op: '136532',
    dataEmissao: '31/01/2025',
    lote: '25B16059F',
    sku: '07010013',
    produto: 'SOL. CLORETO DE SODIO 0,9% 250ML - SF',
    equipamento: randomItem(equipamentosPorSetor.SPEP),
    fase: randomItem(fases),
    quantidadeTeorica: 17254,
    perdas: randomInt(0, 200),
    quantidadeEmbaladaUnidades: randomInt(0, 17254),
    horas: gerarHoras(),
    turno: randomItem(turnos),
    dossie: '16059F/25',
    anvisa: '1108500010207',
    setor: 'SPEP'
  },
  {
    op: '136525',
    dataEmissao: '31/01/2025',
    lote: '25B12096E',
    sku: '07010001',
    produto: 'SOL. CLORETO DE SODIO 0,9% 500ML - SF',
    equipamento: randomItem(equipamentosPorSetor.SPEP),
    fase: randomItem(fases),
    quantidadeTeorica: 19607,
    perdas: randomInt(0, 300),
    quantidadeEmbaladaUnidades: randomInt(0, 19607),
    horas: gerarHoras(),
    turno: randomItem(turnos),
    dossie: '12096E/25',
    anvisa: '1108500010193',
    setor: 'SPEP'
  },
  {
    op: '136524',
    dataEmissao: '31/01/2025',
    lote: '25B12095E',
    sku: '07010001',
    produto: 'SOL. CLORETO DE SODIO 0,9% 500ML - SF',
    equipamento: randomItem(equipamentosPorSetor.SPEP),
    fase: randomItem(fases),
    quantidadeTeorica: 19607,
    perdas: randomInt(0, 300),
    quantidadeEmbaladaUnidades: randomInt(0, 19607),
    horas: gerarHoras(),
    turno: randomItem(turnos),
    dossie: '12095E/25',
    anvisa: '1108500010193',
    setor: 'SPEP'
  },
  {
    op: '136523',
    dataEmissao: '31/01/2025',
    lote: '25B12094E',
    sku: '07010001',
    produto: 'SOL. CLORETO DE SODIO 0,9% 500ML - SF',
    equipamento: randomItem(equipamentosPorSetor.SPEP),
    fase: randomItem(fases),
    quantidadeTeorica: 19607,
    perdas: randomInt(0, 300),
    quantidadeEmbaladaUnidades: randomInt(0, 19607),
    horas: gerarHoras(),
    turno: randomItem(turnos),
    dossie: '12094E/25',
    anvisa: '1108500010193',
    setor: 'SPEP'
  }
]

