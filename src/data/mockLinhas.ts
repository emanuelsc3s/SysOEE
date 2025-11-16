/**
 * Dados mock das 37 linhas de produção
 * Baseado nas especificações do projeto (4 setores: SPEP, SPPV, Líquidos, CPHD)
 */

import { Setor } from '@/types/operacao'

export interface LinhaProducao {
  id: string
  nome: string
  setor: Setor
  tipo: 'Envase' | 'Embalagem'
  metaOEE: number
}

export const LINHAS_PRODUCAO: LinhaProducao[] = [
  // ==================== SPEP - 20 linhas ====================
  // 10 linhas de envase
  { id: 'spep-envase-a', nome: 'Linha A', setor: 'SPEP', tipo: 'Envase', metaOEE: 75 },
  { id: 'spep-envase-b', nome: 'Linha B', setor: 'SPEP', tipo: 'Envase', metaOEE: 75 },
  { id: 'spep-envase-c', nome: 'Linha C', setor: 'SPEP', tipo: 'Envase', metaOEE: 75 },
  { id: 'spep-envase-d', nome: 'Linha D', setor: 'SPEP', tipo: 'Envase', metaOEE: 75 },
  { id: 'spep-envase-e', nome: 'Linha E', setor: 'SPEP', tipo: 'Envase', metaOEE: 75 },
  { id: 'spep-envase-f', nome: 'Linha F', setor: 'SPEP', tipo: 'Envase', metaOEE: 75 },
  { id: 'spep-envase-g', nome: 'Linha G', setor: 'SPEP', tipo: 'Envase', metaOEE: 75 },
  { id: 'spep-envase-h', nome: 'Linha H', setor: 'SPEP', tipo: 'Envase', metaOEE: 75 },
  { id: 'spep-envase-i', nome: 'Linha I', setor: 'SPEP', tipo: 'Envase', metaOEE: 75 },
  { id: 'spep-envase-sle', nome: 'SLE', setor: 'SPEP', tipo: 'Envase', metaOEE: 75 },
  
  // 10 linhas de embalagem
  { id: 'spep-embalagem-02', nome: 'Esteira 02', setor: 'SPEP', tipo: 'Embalagem', metaOEE: 80 },
  { id: 'spep-embalagem-04', nome: 'Esteira 04', setor: 'SPEP', tipo: 'Embalagem', metaOEE: 80 },
  { id: 'spep-embalagem-05', nome: 'Esteira 05', setor: 'SPEP', tipo: 'Embalagem', metaOEE: 80 },
  { id: 'spep-embalagem-06', nome: 'Esteira 06', setor: 'SPEP', tipo: 'Embalagem', metaOEE: 80 },
  { id: 'spep-embalagem-07', nome: 'Esteira 07', setor: 'SPEP', tipo: 'Embalagem', metaOEE: 80 },
  { id: 'spep-embalagem-08', nome: 'Esteira 08', setor: 'SPEP', tipo: 'Embalagem', metaOEE: 80 },
  { id: 'spep-embalagem-09', nome: 'Esteira 09', setor: 'SPEP', tipo: 'Embalagem', metaOEE: 80 },
  { id: 'spep-embalagem-10', nome: 'Esteira 10', setor: 'SPEP', tipo: 'Embalagem', metaOEE: 80 },
  { id: 'spep-embalagem-h', nome: 'Esteira H', setor: 'SPEP', tipo: 'Embalagem', metaOEE: 80 },
  { id: 'spep-embalagem-i', nome: 'Esteira I', setor: 'SPEP', tipo: 'Embalagem', metaOEE: 80 },

  // ==================== SPPV - 10 linhas ====================
  // 5 linhas de envase
  { id: 'sppv-envase-01', nome: 'Vidro 01', setor: 'SPPV', tipo: 'Envase', metaOEE: 70 },
  { id: 'sppv-envase-02', nome: 'Vidro 02', setor: 'SPPV', tipo: 'Envase', metaOEE: 70 },
  { id: 'sppv-envase-03', nome: 'Vidro 03', setor: 'SPPV', tipo: 'Envase', metaOEE: 70 },
  { id: 'sppv-envase-04', nome: 'Vidro 04', setor: 'SPPV', tipo: 'Envase', metaOEE: 70 },
  { id: 'sppv-envase-05', nome: 'Vidro 05', setor: 'SPPV', tipo: 'Envase', metaOEE: 70 },
  
  // 5 linhas de embalagem
  { id: 'sppv-embalagem-01', nome: 'Sala 01', setor: 'SPPV', tipo: 'Embalagem', metaOEE: 75 },
  { id: 'sppv-embalagem-02', nome: 'Sala 02', setor: 'SPPV', tipo: 'Embalagem', metaOEE: 75 },
  { id: 'sppv-embalagem-04', nome: 'Sala 04', setor: 'SPPV', tipo: 'Embalagem', metaOEE: 75 },
  { id: 'sppv-embalagem-05', nome: 'Sala 05', setor: 'SPPV', tipo: 'Embalagem', metaOEE: 75 },
  { id: 'sppv-embalagem-06', nome: 'Sala 06', setor: 'SPPV', tipo: 'Embalagem', metaOEE: 75 },

  // ==================== Líquidos - 5 linhas ====================
  // 3 linhas de envase
  { id: 'liquidos-envase-a', nome: 'Linha A (L)', setor: 'Líquidos', tipo: 'Envase', metaOEE: 72 },
  { id: 'liquidos-envase-b', nome: 'Linha B (L)', setor: 'Líquidos', tipo: 'Envase', metaOEE: 72 },
  { id: 'liquidos-envase-c', nome: 'Linha C (L)', setor: 'Líquidos', tipo: 'Envase', metaOEE: 72 },
  
  // 2 linhas de embalagem (encartuchadeiras)
  { id: 'liquidos-embalagem-vertopack', nome: 'Encartuchadeira Vertopack', setor: 'Líquidos', tipo: 'Embalagem', metaOEE: 78 },
  { id: 'liquidos-embalagem-hicart', nome: 'Encartuchadeira Hicart', setor: 'Líquidos', tipo: 'Embalagem', metaOEE: 78 },

  // ==================== CPHD - 2 linhas ====================
  { id: 'cphd-linha-acida', nome: 'Linha Ácida', setor: 'CPHD', tipo: 'Envase', metaOEE: 68 },
  { id: 'cphd-linha-basica', nome: 'Linha Básica', setor: 'CPHD', tipo: 'Envase', metaOEE: 68 },
]

/**
 * Busca linha de produção por ID
 */
export function buscarLinhaPorId(id: string): LinhaProducao | undefined {
  return LINHAS_PRODUCAO.find(linha => linha.id === id)
}

/**
 * Busca linhas de produção por setor
 */
export function buscarLinhasPorSetor(setor: Setor): LinhaProducao[] {
  return LINHAS_PRODUCAO.filter(linha => linha.setor === setor)
}

/**
 * Busca linhas de produção por tipo
 */
export function buscarLinhasPorTipo(tipo: 'Envase' | 'Embalagem'): LinhaProducao[] {
  return LINHAS_PRODUCAO.filter(linha => linha.tipo === tipo)
}

/**
 * Busca linhas de produção por setor e tipo
 */
export function buscarLinhasPorSetorETipo(setor: Setor, tipo: 'Envase' | 'Embalagem'): LinhaProducao[] {
  return LINHAS_PRODUCAO.filter(linha => linha.setor === setor && linha.tipo === tipo)
}

