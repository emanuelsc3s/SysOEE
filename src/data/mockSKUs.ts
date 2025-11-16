/**
 * Dados mock de SKUs (produtos)
 * Cada SKU possui velocidade nominal diferente por linha
 */

import { Setor } from '@/types/operacao'

export interface SKU {
  id: string
  codigo: string
  descricao: string
  setor: Setor
  velocidadeNominal: number // unidades/hora
  unidade: 'UN' | 'ML' | 'L'
}

export const SKUS_MOCK: SKU[] = [
  // ==================== SPEP ====================
  {
    id: 'sku-001',
    codigo: 'SF-NaCl-0.9-100',
    descricao: 'Solução de Cloreto de Sódio 0,9% - 100mL',
    setor: 'SPEP',
    velocidadeNominal: 12000,
    unidade: 'UN'
  },
  {
    id: 'sku-002',
    codigo: 'SF-NaCl-0.9-250',
    descricao: 'Solução de Cloreto de Sódio 0,9% - 250mL',
    setor: 'SPEP',
    velocidadeNominal: 10000,
    unidade: 'UN'
  },
  {
    id: 'sku-003',
    codigo: 'SF-NaCl-0.9-500',
    descricao: 'Solução de Cloreto de Sódio 0,9% - 500mL',
    setor: 'SPEP',
    velocidadeNominal: 8000,
    unidade: 'UN'
  },
  {
    id: 'sku-004',
    codigo: 'SF-Glicose-5-250',
    descricao: 'Solução de Glicose 5% - 250mL',
    setor: 'SPEP',
    velocidadeNominal: 9500,
    unidade: 'UN'
  },
  {
    id: 'sku-005',
    codigo: 'SF-Glicose-5-500',
    descricao: 'Solução de Glicose 5% - 500mL',
    setor: 'SPEP',
    velocidadeNominal: 7500,
    unidade: 'UN'
  },

  // ==================== SPPV ====================
  {
    id: 'sku-006',
    codigo: 'SV-NaCl-0.9-10',
    descricao: 'Solução de Cloreto de Sódio 0,9% - 10mL (Vidro)',
    setor: 'SPPV',
    velocidadeNominal: 15000,
    unidade: 'UN'
  },
  {
    id: 'sku-007',
    codigo: 'SV-Glicose-50-10',
    descricao: 'Solução de Glicose 50% - 10mL (Vidro)',
    setor: 'SPPV',
    velocidadeNominal: 14000,
    unidade: 'UN'
  },
  {
    id: 'sku-008',
    codigo: 'SV-Agua-Inj-10',
    descricao: 'Água para Injeção - 10mL (Vidro)',
    setor: 'SPPV',
    velocidadeNominal: 16000,
    unidade: 'UN'
  },
  {
    id: 'sku-009',
    codigo: 'SV-Ringer-Lactato-250',
    descricao: 'Solução de Ringer com Lactato - 250mL (Vidro)',
    setor: 'SPPV',
    velocidadeNominal: 8500,
    unidade: 'UN'
  },

  // ==================== Líquidos ====================
  {
    id: 'sku-010',
    codigo: 'LO-Dipirona-500-20',
    descricao: 'Dipirona Sódica 500mg/mL - 20mL (Gotas)',
    setor: 'Líquidos',
    velocidadeNominal: 6000,
    unidade: 'UN'
  },
  {
    id: 'sku-011',
    codigo: 'LO-Paracetamol-200-15',
    descricao: 'Paracetamol 200mg/mL - 15mL (Gotas)',
    setor: 'Líquidos',
    velocidadeNominal: 6500,
    unidade: 'UN'
  },
  {
    id: 'sku-012',
    codigo: 'LO-Amoxicilina-250-100',
    descricao: 'Amoxicilina 250mg/5mL - 100mL (Xarope)',
    setor: 'Líquidos',
    velocidadeNominal: 4500,
    unidade: 'UN'
  },
  {
    id: 'sku-013',
    codigo: 'LO-Ibuprofeno-100-120',
    descricao: 'Ibuprofeno 100mg/5mL - 120mL (Xarope)',
    setor: 'Líquidos',
    velocidadeNominal: 4000,
    unidade: 'UN'
  },

  // ==================== CPHD ====================
  {
    id: 'sku-014',
    codigo: 'CPHD-Acido-5L',
    descricao: 'Concentrado Ácido para Hemodiálise - 5L',
    setor: 'CPHD',
    velocidadeNominal: 800,
    unidade: 'UN'
  },
  {
    id: 'sku-015',
    codigo: 'CPHD-Basico-5L',
    descricao: 'Concentrado Básico para Hemodiálise - 5L',
    setor: 'CPHD',
    velocidadeNominal: 750,
    unidade: 'UN'
  },
]

/**
 * Busca SKU por ID
 */
export function buscarSKUPorId(id: string): SKU | undefined {
  return SKUS_MOCK.find(sku => sku.id === id)
}

/**
 * Busca SKU por código
 */
export function buscarSKUPorCodigo(codigo: string): SKU | undefined {
  return SKUS_MOCK.find(sku => sku.codigo === codigo)
}

/**
 * Busca SKUs por setor
 */
export function buscarSKUsPorSetor(setor: Setor): SKU[] {
  return SKUS_MOCK.filter(sku => sku.setor === setor)
}

/**
 * Busca SKUs por termo de pesquisa (código ou descrição)
 */
export function buscarSKUsPorTermo(termo: string): SKU[] {
  const termoLower = termo.toLowerCase()
  return SKUS_MOCK.filter(
    sku =>
      sku.codigo.toLowerCase().includes(termoLower) ||
      sku.descricao.toLowerCase().includes(termoLower)
  )
}

