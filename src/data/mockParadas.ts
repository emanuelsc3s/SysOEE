/**
 * Dados mock de Códigos de Parada e Turnos
 * Baseado nas especificações do projeto (hierarquia de 5 níveis)
 */

import { CodigoParada, Turno } from '@/types/parada'

/**
 * Códigos de Parada Mock (hierarquia de 5 níveis)
 * Baseado em database/migrations/08-seeds.sql
 */
export const mockCodigosParada: CodigoParada[] = [
  // Paradas Estratégicas
  {
    id: 'estr-001',
    linha_id: null,
    codigo: 'ESTR-001',
    descricao: 'Parada Estratégica - Controle de Estoque',
    nivel_1_classe: 'Estratégica',
    nivel_2_grande_parada: 'Decisão Gerencial',
    nivel_3_apontamento: 'Controle de Estoque',
    nivel_4_grupo: null,
    nivel_5_detalhamento: null,
    tipo_parada: 'ESTRATEGICA',
    impacta_disponibilidade: false,
    tempo_minimo_registro: 10,
    ativo: true,
  },

  // Paradas Planejadas
  {
    id: 'plan-man-pre',
    linha_id: null,
    codigo: 'PLAN-MAN-PRE',
    descricao: 'Manutenção Preventiva Programada',
    nivel_1_classe: 'Planejada',
    nivel_2_grande_parada: 'Manutenção',
    nivel_3_apontamento: 'Preventiva',
    nivel_4_grupo: 'Programada',
    nivel_5_detalhamento: null,
    tipo_parada: 'PLANEJADA',
    impacta_disponibilidade: true,
    tempo_minimo_registro: 10,
    ativo: true,
  },
  {
    id: 'plan-setup',
    linha_id: null,
    codigo: 'PLAN-SETUP',
    descricao: 'Setup - Troca de Produto',
    nivel_1_classe: 'Planejada',
    nivel_2_grande_parada: 'Setup',
    nivel_3_apontamento: 'Troca de SKU',
    nivel_4_grupo: null,
    nivel_5_detalhamento: null,
    tipo_parada: 'PLANEJADA',
    impacta_disponibilidade: true,
    tempo_minimo_registro: 10,
    ativo: true,
  },
  {
    id: 'plan-limpeza',
    linha_id: null,
    codigo: 'PLAN-LIMPEZA',
    descricao: 'Limpeza Programada CIP/SIP',
    nivel_1_classe: 'Planejada',
    nivel_2_grande_parada: 'Limpeza',
    nivel_3_apontamento: 'CIP/SIP',
    nivel_4_grupo: 'Sanitização',
    nivel_5_detalhamento: null,
    tipo_parada: 'PLANEJADA',
    impacta_disponibilidade: true,
    tempo_minimo_registro: 10,
    ativo: true,
  },

  // Paradas Não Planejadas
  {
    id: 'np-que-mec',
    linha_id: null,
    codigo: 'NP-QUE-MEC',
    descricao: 'Quebra Mecânica',
    nivel_1_classe: 'Não Planejada',
    nivel_2_grande_parada: 'Quebra/Falhas',
    nivel_3_apontamento: 'Mecânica',
    nivel_4_grupo: 'Equipamento',
    nivel_5_detalhamento: 'Extrusão, Sopro',
    tipo_parada: 'NAO_PLANEJADA',
    impacta_disponibilidade: true,
    tempo_minimo_registro: 10,
    ativo: true,
  },
  {
    id: 'np-que-ele',
    linha_id: null,
    codigo: 'NP-QUE-ELE',
    descricao: 'Quebra Elétrica',
    nivel_1_classe: 'Não Planejada',
    nivel_2_grande_parada: 'Quebra/Falhas',
    nivel_3_apontamento: 'Elétrica',
    nivel_4_grupo: 'Sistema Elétrico',
    nivel_5_detalhamento: null,
    tipo_parada: 'NAO_PLANEJADA',
    impacta_disponibilidade: true,
    tempo_minimo_registro: 10,
    ativo: true,
  },
  {
    id: 'np-fal-ins',
    linha_id: null,
    codigo: 'NP-FAL-INS',
    descricao: 'Falta de Insumo',
    nivel_1_classe: 'Não Planejada',
    nivel_2_grande_parada: 'Falta de Insumo',
    nivel_3_apontamento: 'Material',
    nivel_4_grupo: 'Matéria-Prima',
    nivel_5_detalhamento: null,
    tipo_parada: 'NAO_PLANEJADA',
    impacta_disponibilidade: true,
    tempo_minimo_registro: 10,
    ativo: true,
  },
  {
    id: 'np-fal-emb',
    linha_id: null,
    codigo: 'NP-FAL-EMB',
    descricao: 'Falta de Embalagem',
    nivel_1_classe: 'Não Planejada',
    nivel_2_grande_parada: 'Falta de Insumo',
    nivel_3_apontamento: 'Embalagem',
    nivel_4_grupo: 'Embalagem Primária',
    nivel_5_detalhamento: null,
    tipo_parada: 'NAO_PLANEJADA',
    impacta_disponibilidade: true,
    tempo_minimo_registro: 10,
    ativo: true,
  },

  // Pequenas Paradas (< 10 min - afetam Performance)
  {
    id: 'pp-ajuste',
    linha_id: null,
    codigo: 'PP-AJUSTE',
    descricao: 'Pequeno Ajuste de Máquina',
    nivel_1_classe: 'Não Planejada',
    nivel_2_grande_parada: 'Pequenas Paradas',
    nivel_3_apontamento: 'Ajuste',
    nivel_4_grupo: 'Operacional',
    nivel_5_detalhamento: null,
    tipo_parada: 'NAO_PLANEJADA',
    impacta_disponibilidade: false, // Afeta Performance, não Disponibilidade
    tempo_minimo_registro: 1,
    ativo: true,
  },
]

/**
 * Turnos Mock
 * Sistema utiliza apenas 2 turnos de 8 horas cada
 */
export const mockTurnos: Turno[] = [
  {
    id: 'turno-d1',
    codigo: 'D1',
    nome: '1º Turno',
    hora_inicio: '06:00:00',
    hora_fim: '14:00:00',
    duracao_horas: 8.0,
    ativo: true,
  },
  {
    id: 'turno-d2',
    codigo: 'D2',
    nome: '2º Turno',
    hora_inicio: '14:00:00',
    hora_fim: '22:00:00',
    duracao_horas: 8.0,
    ativo: true,
  },
]

