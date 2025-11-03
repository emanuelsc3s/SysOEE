import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, Search, Lock, X, CheckCircle2, XCircle, ClipboardList, Calendar, User, Save, History, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

/**
 * Interface para representar um armazém
 */
interface Armazem {
  codigo: string
  descricao: string
  bloqueado: boolean
}

/**
 * Interface para representar um lote (tabela SB8 do TOTVS)
 */
interface Lote {
  B8_FILIAL: string
  B8_PRODUTO: string
  B8_LOCAL: string
  B8_DATA: string
  B8_DTVALID: string
  B8_QTDORI: number
  B8_SALDO: number
  B8_EMPENHO: number
  B8_ORIGLAN: string
  B8_LOTEFOR: string
  B8_CHAVE: string
  B8_LOTECTL: string
  B8_NUMLOTE: string
  B8_QEMPPRE: number
  B8_QACLASS: number
  B8_SALDO2: number
  B8_QTDORI2: number
  B8_EMPENH2: number
  B8_QEPRE2: number
  B8_QACLAS2: number
  B8_DOC: string
  B8_SERIE: string
  B8_CLIFOR: string
  B8_LOJA: string
  B8_POTENCI: number
  B8_PRCLOT: number
  B8_ITEM: string
  B8_NUMDESP: string
  B8_ORIGEM: string
  B8_DFABRIC: string
  B8_SDOC: string
  B8_YDTFABR: string
  B8_YDTLIBE: string
  B8_YRESFIS: string | null
  B8_YRESPFI: string
  B8_YRESBIO: string
  B8_YRESPBI: string
  B8_YRESMIC: string
  B8_YRESPMI: string
  B8_YDOSSIE: string
  B8_YLIBERA: string
  B8_YULAUDO: string
  B8_YTPVALI: string
  D_E_L_E_T_: string
  R_E_C_N_O_: number
  R_E_C_D_E_L_: number
  B8_YSICEXP: string
  // Campo adicional para controle de status do lote
  status?: 'LIBERADO' | 'BLOQUEADO'
}

/**
 * Interface para item de lote no inventário
 */
interface ItemInventario {
  produto: string
  lote: string
  saldo_sistema: number
  quantidade_inventariada: number
  diferenca: number
}

/**
 * Interface para representar um inventário completo
 */
interface Inventario {
  id: string
  armazem_codigo: string
  armazem_descricao: string
  data_inventario: string
  responsavel: string
  data_cadastro: string
  lotes: ItemInventario[]
}

/**
 * Lista completa de armazéns do sistema
 * Armazéns bloqueados: 46, 49, 56, 58, 60, 89, 96
 */
const ARMAZENS_DATA: Armazem[] = [
  { codigo: '01', descricao: 'ALMOXARIFADO CENTRAL', bloqueado: false },
  { codigo: '02', descricao: 'MATERIA PRIMA', bloqueado: false },
  { codigo: '03', descricao: 'EMBALAGEM', bloqueado: false },
  { codigo: '04', descricao: 'REJEITADOS', bloqueado: false },
  { codigo: '05', descricao: 'SPPV', bloqueado: false },
  { codigo: '06', descricao: 'SPEP 01', bloqueado: false },
  { codigo: '07', descricao: 'LIQUIDOS', bloqueado: false },
  { codigo: '08', descricao: 'CPHD', bloqueado: false },
  { codigo: '09', descricao: 'PLASTICO', bloqueado: false },
  { codigo: '10', descricao: 'SPEP 03', bloqueado: false },
  { codigo: '11', descricao: 'SPEP 02', bloqueado: false },
  { codigo: '12', descricao: 'TEMP', bloqueado: false },
  { codigo: '13', descricao: 'A VENCER | VENCIDOS', bloqueado: false },
  { codigo: '14', descricao: 'EXPEDICAO PA', bloqueado: false },
  { codigo: '15', descricao: 'EXPEDICAO PA FRACAO', bloqueado: false },
  { codigo: '16', descricao: 'AMOSTRAS ANALISE', bloqueado: false },
  { codigo: '17', descricao: 'SERVICOS', bloqueado: false },
  { codigo: '18', descricao: 'PERDAS', bloqueado: false },
  { codigo: '19', descricao: 'RETEM', bloqueado: false },
  { codigo: '20', descricao: 'DEVOLUCAO', bloqueado: false },
  { codigo: '21', descricao: 'DESENVOLVIMENTO', bloqueado: false },
  { codigo: '22', descricao: 'ALMOXARIFADO 22', bloqueado: false },
  { codigo: '23', descricao: 'AMOSTRAGEM', bloqueado: false },
  { codigo: '27', descricao: 'SPP EXTRUSAO', bloqueado: false },
  { codigo: '30', descricao: 'IMPRESSOS', bloqueado: false },
  { codigo: '31', descricao: 'ARM SPEP 01 MP', bloqueado: false },
  { codigo: '32', descricao: 'ARM SPEP 02 MP', bloqueado: false },
  { codigo: '33', descricao: 'ARM SPEP 03', bloqueado: false },
  { codigo: '34', descricao: 'ARM CPHD', bloqueado: false },
  { codigo: '35', descricao: 'ARM SPPV', bloqueado: false },
  { codigo: '36', descricao: 'ARM SPEP 02 EM', bloqueado: false },
  { codigo: '37', descricao: 'ARM LIQUIDOS', bloqueado: false },
  { codigo: '38', descricao: 'ARM SPEP 01,02 TAMPA', bloqueado: false },
  { codigo: '39', descricao: 'ARM PLASTICO', bloqueado: false },
  { codigo: '40', descricao: 'ARM SPEP 01 EM', bloqueado: false },
  { codigo: '44', descricao: 'EXPEDICAO LISVET', bloqueado: false },
  { codigo: '45', descricao: 'SPPV LISVET', bloqueado: false },
  { codigo: '46', descricao: 'SPEP LISVET', bloqueado: true },
  { codigo: '49', descricao: 'LISVET RETEM', bloqueado: true },
  { codigo: '56', descricao: 'ANALISES LISVET', bloqueado: true },
  { codigo: '58', descricao: 'PERDAS LISVET', bloqueado: true },
  { codigo: '60', descricao: 'TEMP2', bloqueado: true },
  { codigo: '89', descricao: 'ERRADO', bloqueado: true },
  { codigo: '96', descricao: 'RETIFICACAO FISCAL', bloqueado: true },
  { codigo: '97', descricao: 'MATERIAL DE CONSUMO', bloqueado: false },
  { codigo: '98', descricao: 'QUARENTENA', bloqueado: false },
  { codigo: '99', descricao: 'PRODUTO ENVASADO', bloqueado: false },
]

/**
 * Chaves para armazenamento no localStorage
 */
const STORAGE_KEY = 'sysoee_armazens'
const LOTES_STORAGE_KEY = 'sysoee_lotes_armazem'
const INVENTARIOS_STORAGE_KEY = 'sysoee_inventarios_armazem'

/**
 * Dados de exemplo de lotes para o armazém 06
 */
const LOTES_ARMAZEM_06: Lote[] = [
  {
    B8_FILIAL: '01',
    B8_PRODUTO: '12010134',
    B8_LOCAL: '06',
    B8_DATA: '20250901',
    B8_DTVALID: '20260808',
    B8_QTDORI: 104000,
    B8_SALDO: 39361,
    B8_EMPENHO: 0,
    B8_ORIGLAN: 'MI',
    B8_LOTEFOR: '83416',
    B8_CHAVE: '',
    B8_LOTECTL: 'RF525002',
    B8_NUMLOTE: '',
    B8_QEMPPRE: 0,
    B8_QACLASS: 0,
    B8_SALDO2: 39361,
    B8_QTDORI2: 104000,
    B8_EMPENH2: 0,
    B8_QEPRE2: 0,
    B8_QACLAS2: 0,
    B8_DOC: 'WESLJYTIJ',
    B8_SERIE: '',
    B8_CLIFOR: '',
    B8_LOJA: '',
    B8_POTENCI: 0,
    B8_PRCLOT: 0,
    B8_ITEM: '',
    B8_NUMDESP: '',
    B8_ORIGEM: '',
    B8_DFABRIC: '20250808',
    B8_SDOC: '',
    B8_YDTFABR: '',
    B8_YDTLIBE: '',
    B8_YRESFIS: null,
    B8_YRESPFI: '',
    B8_YRESBIO: '',
    B8_YRESPBI: '',
    B8_YRESMIC: '',
    B8_YRESPMI: '',
    B8_YDOSSIE: '',
    B8_YLIBERA: '',
    B8_YULAUDO: '',
    B8_YTPVALI: '0',
    D_E_L_E_T_: ' ',
    R_E_C_N_O_: 853015,
    R_E_C_D_E_L_: 0,
    B8_YSICEXP: ' ',
    status: 'LIBERADO',
  },
  {
    B8_FILIAL: '01',
    B8_PRODUTO: '12010136',
    B8_LOCAL: '06',
    B8_DATA: '20250901',
    B8_DTVALID: '20260808',
    B8_QTDORI: 4980,
    B8_SALDO: 500,
    B8_EMPENHO: 0,
    B8_ORIGLAN: 'MI',
    B8_LOTEFOR: '83417',
    B8_CHAVE: '',
    B8_LOTECTL: 'RF625002',
    B8_NUMLOTE: '',
    B8_QEMPPRE: 0,
    B8_QACLASS: 0,
    B8_SALDO2: 500,
    B8_QTDORI2: 4980,
    B8_EMPENH2: 0,
    B8_QEPRE2: 0,
    B8_QACLAS2: 0,
    B8_DOC: 'WESLJYTIK',
    B8_SERIE: '',
    B8_CLIFOR: '',
    B8_LOJA: '',
    B8_POTENCI: 0,
    B8_PRCLOT: 0,
    B8_ITEM: '',
    B8_NUMDESP: '',
    B8_ORIGEM: '',
    B8_DFABRIC: '20250808',
    B8_SDOC: '',
    B8_YDTFABR: '',
    B8_YDTLIBE: '',
    B8_YRESFIS: null,
    B8_YRESPFI: '',
    B8_YRESBIO: '',
    B8_YRESPBI: '',
    B8_YRESMIC: '',
    B8_YRESPMI: '',
    B8_YDOSSIE: '',
    B8_YLIBERA: '',
    B8_YULAUDO: '',
    B8_YTPVALI: '0',
    D_E_L_E_T_: ' ',
    R_E_C_N_O_: 853018,
    R_E_C_D_E_L_: 0,
    B8_YSICEXP: ' ',
    status: 'BLOQUEADO',
  },
  {
    B8_FILIAL: '01',
    B8_PRODUTO: '01020001',
    B8_LOCAL: '06',
    B8_DATA: '20250908',
    B8_DTVALID: '20261207',
    B8_QTDORI: 974,
    B8_SALDO: 25,
    B8_EMPENHO: 0,
    B8_ORIGLAN: 'MI',
    B8_LOTEFOR: '2106152',
    B8_CHAVE: '',
    B8_LOTECTL: 'D125008',
    B8_NUMLOTE: '',
    B8_QEMPPRE: 0,
    B8_QACLASS: 0,
    B8_SALDO2: 0.025,
    B8_QTDORI2: 0.974,
    B8_EMPENH2: 0,
    B8_QEPRE2: 0,
    B8_QACLAS2: 0,
    B8_DOC: 'WESLJYV13',
    B8_SERIE: '',
    B8_CLIFOR: '',
    B8_LOJA: '',
    B8_POTENCI: 99.3,
    B8_PRCLOT: 0,
    B8_ITEM: '',
    B8_NUMDESP: '',
    B8_ORIGEM: '',
    B8_DFABRIC: '20241207',
    B8_SDOC: '',
    B8_YDTFABR: '',
    B8_YDTLIBE: '',
    B8_YRESFIS: null,
    B8_YRESPFI: '',
    B8_YRESBIO: '',
    B8_YRESPBI: '',
    B8_YRESMIC: '',
    B8_YRESPMI: '',
    B8_YDOSSIE: '',
    B8_YLIBERA: '',
    B8_YULAUDO: '',
    B8_YTPVALI: '0',
    D_E_L_E_T_: ' ',
    R_E_C_N_O_: 854471,
    R_E_C_D_E_L_: 0,
    B8_YSICEXP: ' ',
    status: 'LIBERADO',
  },
  {
    B8_FILIAL: '01',
    B8_PRODUTO: '01010014',
    B8_LOCAL: '06',
    B8_DATA: '20250905',
    B8_DTVALID: '20270805',
    B8_QTDORI: 5429.95,
    B8_SALDO: 7.22,
    B8_EMPENHO: 0,
    B8_ORIGLAN: 'MI',
    B8_LOTEFOR: '',
    B8_CHAVE: '',
    B8_LOTECTL: '25I122-90',
    B8_NUMLOTE: '',
    B8_QEMPPRE: 0,
    B8_QACLASS: 0,
    B8_SALDO2: 7.22,
    B8_QTDORI2: 5429.95,
    B8_EMPENH2: 0,
    B8_QEPRE2: 0,
    B8_QACLAS2: 0,
    B8_DOC: 'WESLJYV41',
    B8_SERIE: '',
    B8_CLIFOR: '',
    B8_LOJA: '',
    B8_POTENCI: 0,
    B8_PRCLOT: 0,
    B8_ITEM: '',
    B8_NUMDESP: '',
    B8_ORIGEM: '',
    B8_DFABRIC: '20250905',
    B8_SDOC: '',
    B8_YDTFABR: '',
    B8_YDTLIBE: '',
    B8_YRESFIS: null,
    B8_YRESPFI: '',
    B8_YRESBIO: '',
    B8_YRESPBI: '',
    B8_YRESMIC: '',
    B8_YRESPMI: '',
    B8_YDOSSIE: '',
    B8_YLIBERA: '',
    B8_YULAUDO: '',
    B8_YTPVALI: '0',
    D_E_L_E_T_: ' ',
    R_E_C_N_O_: 854542,
    R_E_C_D_E_L_: 0,
    B8_YSICEXP: ' ',
    status: 'LIBERADO',
  },
  {
    B8_FILIAL: '01',
    B8_PRODUTO: '01010014',
    B8_LOCAL: '06',
    B8_DATA: '20180521',
    B8_DTVALID: '20200521',
    B8_QTDORI: 4581.73,
    B8_SALDO: 298.113,
    B8_EMPENHO: 298.113,
    B8_ORIGLAN: ' ',
    B8_LOTEFOR: '',
    B8_CHAVE: '',
    B8_LOTECTL: '18E21-90',
    B8_NUMLOTE: '',
    B8_QEMPPRE: 0,
    B8_QACLASS: 0,
    B8_SALDO2: 298.11,
    B8_QTDORI2: 298.11,
    B8_EMPENH2: 0,
    B8_QEPRE2: 0,
    B8_QACLAS2: 0,
    B8_DOC: '046473010',
    B8_SERIE: '',
    B8_CLIFOR: '',
    B8_LOJA: '',
    B8_POTENCI: 0,
    B8_PRCLOT: 0,
    B8_ITEM: '',
    B8_NUMDESP: '',
    B8_ORIGEM: '',
    B8_DFABRIC: '20180521',
    B8_SDOC: '',
    B8_YDTFABR: '',
    B8_YDTLIBE: '',
    B8_YRESFIS: null,
    B8_YRESPFI: '',
    B8_YRESBIO: '',
    B8_YRESPBI: '',
    B8_YRESMIC: '',
    B8_YRESPMI: '',
    B8_YDOSSIE: '',
    B8_YLIBERA: '',
    B8_YULAUDO: '',
    B8_YTPVALI: '0',
    D_E_L_E_T_: ' ',
    R_E_C_N_O_: 277401,
    R_E_C_D_E_L_: 0,
    B8_YSICEXP: ' ',
    status: 'BLOQUEADO',
  },
  {
    B8_FILIAL: '01',
    B8_PRODUTO: '12020039',
    B8_LOCAL: '06',
    B8_DATA: '20221109',
    B8_DTVALID: '20251004',
    B8_QTDORI: 64400,
    B8_SALDO: 48140,
    B8_EMPENHO: 48140,
    B8_ORIGLAN: ' ',
    B8_LOTEFOR: '210010',
    B8_CHAVE: '',
    B8_LOTECTL: 'CT122007',
    B8_NUMLOTE: '',
    B8_QEMPPRE: 0,
    B8_QACLASS: 0,
    B8_SALDO2: 48140,
    B8_QTDORI2: 64400,
    B8_EMPENH2: 48140,
    B8_QEPRE2: 0,
    B8_QACLAS2: 0,
    B8_DOC: 'SK3341',
    B8_SERIE: '',
    B8_CLIFOR: '',
    B8_LOJA: '',
    B8_POTENCI: 0,
    B8_PRCLOT: 0,
    B8_ITEM: '',
    B8_NUMDESP: '',
    B8_ORIGEM: '',
    B8_DFABRIC: '20221004',
    B8_SDOC: '',
    B8_YDTFABR: '',
    B8_YDTLIBE: '',
    B8_YRESFIS: null,
    B8_YRESPFI: '',
    B8_YRESBIO: '',
    B8_YRESPBI: '',
    B8_YRESMIC: '',
    B8_YRESPMI: '',
    B8_YDOSSIE: '',
    B8_YLIBERA: '',
    B8_YULAUDO: '',
    B8_YTPVALI: '0',
    D_E_L_E_T_: ' ',
    R_E_C_N_O_: 632598,
    R_E_C_D_E_L_: 0,
    B8_YSICEXP: ' ',
    status: 'BLOQUEADO',
  },
  {
    B8_FILIAL: '01',
    B8_PRODUTO: '01020002',
    B8_LOCAL: '06',
    B8_DATA: '20251015',
    B8_DTVALID: '20300409',
    B8_QTDORI: 3000,
    B8_SALDO: 4674.374,
    B8_EMPENHO: 0,
    B8_ORIGLAN: 'MI',
    B8_LOTEFOR: '09042025',
    B8_CHAVE: '',
    B8_LOTECTL: 'C125006',
    B8_NUMLOTE: '',
    B8_QEMPPRE: 0,
    B8_QACLASS: 0,
    B8_SALDO2: 4674.374,
    B8_QTDORI2: 3000,
    B8_EMPENH2: 0,
    B8_QEPRE2: 0,
    B8_QACLAS2: 0,
    B8_DOC: 'WESLJZ4HR',
    B8_SERIE: '',
    B8_CLIFOR: '',
    B8_LOJA: '',
    B8_POTENCI: 100.2,
    B8_PRCLOT: 0,
    B8_ITEM: '',
    B8_NUMDESP: '',
    B8_ORIGEM: '',
    B8_DFABRIC: '20250409',
    B8_SDOC: '',
    B8_YDTFABR: '',
    B8_YDTLIBE: '',
    B8_YRESFIS: null,
    B8_YRESPFI: '',
    B8_YRESBIO: '',
    B8_YRESPBI: '',
    B8_YRESMIC: '',
    B8_YRESPMI: '',
    B8_YDOSSIE: '',
    B8_YLIBERA: '',
    B8_YULAUDO: '',
    B8_YTPVALI: '0',
    D_E_L_E_T_: ' ',
    R_E_C_N_O_: 863311,
    R_E_C_D_E_L_: 0,
    B8_YSICEXP: ' ',
    status: 'LIBERADO',
  },
  {
    B8_FILIAL: '01',
    B8_PRODUTO: '01010014',
    B8_LOCAL: '06',
    B8_DATA: '20251015',
    B8_DTVALID: '20270915',
    B8_QTDORI: 4245.94,
    B8_SALDO: 3707.693,
    B8_EMPENHO: 0,
    B8_ORIGLAN: 'MI',
    B8_LOTEFOR: '',
    B8_CHAVE: '',
    B8_LOTECTL: '25J142-90',
    B8_NUMLOTE: '',
    B8_QEMPPRE: 0,
    B8_QACLASS: 0,
    B8_SALDO2: 3707.693,
    B8_QTDORI2: 4245.94,
    B8_EMPENH2: 0,
    B8_QEPRE2: 0,
    B8_QACLAS2: 0,
    B8_DOC: 'WESLJZ4RP',
    B8_SERIE: '',
    B8_CLIFOR: '',
    B8_LOJA: '',
    B8_POTENCI: 0,
    B8_PRCLOT: 0,
    B8_ITEM: '',
    B8_NUMDESP: '',
    B8_ORIGEM: '',
    B8_DFABRIC: '20251015',
    B8_SDOC: '',
    B8_YDTFABR: '',
    B8_YDTLIBE: '',
    B8_YRESFIS: null,
    B8_YRESPFI: '',
    B8_YRESBIO: '',
    B8_YRESPBI: '',
    B8_YRESMIC: '',
    B8_YRESPMI: '',
    B8_YDOSSIE: '',
    B8_YLIBERA: '',
    B8_YULAUDO: '',
    B8_YTPVALI: '0',
    D_E_L_E_T_: ' ',
    R_E_C_N_O_: 863496,
    R_E_C_D_E_L_: 0,
    B8_YSICEXP: ' ',
    status: 'LIBERADO',
  },
  {
    B8_FILIAL: '01',
    B8_PRODUTO: '12020002',
    B8_LOCAL: '06',
    B8_DATA: '20251017',
    B8_DTVALID: '20280604',
    B8_QTDORI: 12960,
    B8_SALDO: 14000,
    B8_EMPENHO: 0,
    B8_ORIGLAN: 'MI',
    B8_LOTEFOR: '13182',
    B8_CHAVE: '',
    B8_LOTECTL: 'BU00225004',
    B8_NUMLOTE: '',
    B8_QEMPPRE: 0,
    B8_QACLASS: 0,
    B8_SALDO2: 14000,
    B8_QTDORI2: 12960,
    B8_EMPENH2: 0,
    B8_QEPRE2: 0,
    B8_QACLAS2: 0,
    B8_DOC: 'WESLJZ4QL',
    B8_SERIE: '',
    B8_CLIFOR: '',
    B8_LOJA: '',
    B8_POTENCI: 0,
    B8_PRCLOT: 0,
    B8_ITEM: '',
    B8_NUMDESP: '',
    B8_ORIGEM: '',
    B8_DFABRIC: '20250604',
    B8_SDOC: '',
    B8_YDTFABR: '',
    B8_YDTLIBE: '',
    B8_YRESFIS: null,
    B8_YRESPFI: '',
    B8_YRESBIO: '',
    B8_YRESPBI: '',
    B8_YRESMIC: '',
    B8_YRESPMI: '',
    B8_YDOSSIE: '',
    B8_YLIBERA: '',
    B8_YULAUDO: '',
    B8_YTPVALI: '0',
    D_E_L_E_T_: ' ',
    R_E_C_N_O_: 863501,
    R_E_C_D_E_L_: 0,
    B8_YSICEXP: ' ',
    status: 'LIBERADO',
  },
  {
    B8_FILIAL: '01',
    B8_PRODUTO: '01010014',
    B8_LOCAL: '06',
    B8_DATA: '20250909',
    B8_DTVALID: '20270809',
    B8_QTDORI: 4280.84,
    B8_SALDO: 187.913,
    B8_EMPENHO: 0,
    B8_ORIGLAN: 'MI',
    B8_LOTEFOR: '',
    B8_CHAVE: '',
    B8_LOTECTL: '25I124-90',
    B8_NUMLOTE: '',
    B8_QEMPPRE: 0,
    B8_QACLASS: 0,
    B8_SALDO2: 187.913,
    B8_QTDORI2: 4280.84,
    B8_EMPENH2: 0,
    B8_QEPRE2: 0,
    B8_QACLAS2: 0,
    B8_DOC: 'WESLJYVYN',
    B8_SERIE: '',
    B8_CLIFOR: '',
    B8_LOJA: '',
    B8_POTENCI: 0,
    B8_PRCLOT: 0,
    B8_ITEM: '',
    B8_NUMDESP: '',
    B8_ORIGEM: '',
    B8_DFABRIC: '20250909',
    B8_SDOC: '',
    B8_YDTFABR: '',
    B8_YDTLIBE: '',
    B8_YRESFIS: null,
    B8_YRESPFI: '',
    B8_YRESBIO: '',
    B8_YRESPBI: '',
    B8_YRESMIC: '',
    B8_YRESPMI: '',
    B8_YDOSSIE: '',
    B8_YLIBERA: '',
    B8_YULAUDO: '',
    B8_YTPVALI: '0',
    D_E_L_E_T_: ' ',
    R_E_C_N_O_: 855341,
    R_E_C_D_E_L_: 0,
    B8_YSICEXP: ' ',
    status: 'LIBERADO',
  },
  {
    B8_FILIAL: '01',
    B8_PRODUTO: '12010014',
    B8_LOCAL: '06',
    B8_DATA: '20250911',
    B8_DTVALID: '20270920',
    B8_QTDORI: 120400,
    B8_SALDO: 142593,
    B8_EMPENHO: 0,
    B8_ORIGLAN: 'MI',
    B8_LOTEFOR: '6205',
    B8_CHAVE: '',
    B8_LOTECTL: 'RG224004',
    B8_NUMLOTE: '',
    B8_QEMPPRE: 0,
    B8_QACLASS: 0,
    B8_SALDO2: 142593,
    B8_QTDORI2: 120400,
    B8_EMPENH2: 0,
    B8_QEPRE2: 0,
    B8_QACLAS2: 0,
    B8_DOC: 'WESLJYW2I',
    B8_SERIE: '',
    B8_CLIFOR: '',
    B8_LOJA: '',
    B8_POTENCI: 0,
    B8_PRCLOT: 0,
    B8_ITEM: '',
    B8_NUMDESP: '',
    B8_ORIGEM: '',
    B8_DFABRIC: '20240920',
    B8_SDOC: '',
    B8_YDTFABR: '',
    B8_YDTLIBE: '',
    B8_YRESFIS: null,
    B8_YRESPFI: '',
    B8_YRESBIO: '',
    B8_YRESPBI: '',
    B8_YRESMIC: '',
    B8_YRESPMI: '',
    B8_YDOSSIE: '',
    B8_YLIBERA: '',
    B8_YULAUDO: '',
    B8_YTPVALI: '0',
    D_E_L_E_T_: ' ',
    R_E_C_N_O_: 855457,
    R_E_C_D_E_L_: 0,
    B8_YSICEXP: ' ',
    status: 'LIBERADO',
  },
  {
    B8_FILIAL: '01',
    B8_PRODUTO: '12010059',
    B8_LOCAL: '06',
    B8_DATA: '20230504',
    B8_DTVALID: '20250619',
    B8_QTDORI: 6000,
    B8_SALDO: 3618,
    B8_EMPENHO: 3618,
    B8_ORIGLAN: ' ',
    B8_LOTEFOR: '70420',
    B8_CHAVE: '',
    B8_LOTECTL: 'RC7323001',
    B8_NUMLOTE: '',
    B8_QEMPPRE: 0,
    B8_QACLASS: 0,
    B8_SALDO2: 3618,
    B8_QTDORI2: 6000,
    B8_EMPENH2: 3618,
    B8_QEPRE2: 0,
    B8_QACLAS2: 0,
    B8_DOC: 'SK39FD',
    B8_SERIE: '',
    B8_CLIFOR: '',
    B8_LOJA: '',
    B8_POTENCI: 0,
    B8_PRCLOT: 0,
    B8_ITEM: '',
    B8_NUMDESP: '',
    B8_ORIGEM: '',
    B8_DFABRIC: '20230426',
    B8_SDOC: '',
    B8_YDTFABR: '',
    B8_YDTLIBE: '',
    B8_YRESFIS: null,
    B8_YRESPFI: '',
    B8_YRESBIO: '',
    B8_YRESPBI: '',
    B8_YRESMIC: '',
    B8_YRESPMI: '',
    B8_YDOSSIE: '',
    B8_YLIBERA: '',
    B8_YULAUDO: '',
    B8_YTPVALI: '0',
    D_E_L_E_T_: ' ',
    R_E_C_N_O_: 669747,
    R_E_C_D_E_L_: 0,
    B8_YSICEXP: ' ',
    status: 'LIBERADO',
  },
]

/**
 * Página de Armazéns - Exibe lista de armazéns em grid responsivo
 * 
 * Funcionalidades:
 * - Grid responsivo de cards (mobile-first)
 * - Armazenamento em localStorage
 * - Busca/filtro de armazéns
 * - Navegação de volta para Home
 */
export default function ArmazemSaldo() {
  const navigate = useNavigate()
  const [armazens, setArmazens] = useState<Armazem[]>([])
  const [filtro, setFiltro] = useState('')
  const [armazensFiltrados, setArmazensFiltrados] = useState<Armazem[]>([])
  const [dialogAberto, setDialogAberto] = useState(false)
  const [armazemSelecionado, setArmazemSelecionado] = useState<Armazem | null>(null)
  const [lotes, setLotes] = useState<Lote[]>([])

  // Estados para Inventário
  const [dialogInventarioAberto, setDialogInventarioAberto] = useState(false)
  const [dialogHistoricoAberto, setDialogHistoricoAberto] = useState(false)
  const [dialogDetalhesAberto, setDialogDetalhesAberto] = useState(false)
  const [dataInventario, setDataInventario] = useState('')
  const [responsavelInventario, setResponsavelInventario] = useState('')
  const [itensInventario, setItensInventario] = useState<ItemInventario[]>([])
  const [inventarios, setInventarios] = useState<Inventario[]>([])
  const [inventarioSelecionado, setInventarioSelecionado] = useState<Inventario | null>(null)
  const [salvandoInventario, setSalvandoInventario] = useState(false)
  const [errosValidacao, setErrosValidacao] = useState<{ [key: string]: string }>({})

  /**
   * Carrega armazéns do localStorage ou inicializa com dados padrão
   */
  useEffect(() => {
    const carregarArmazens = () => {
      try {
        const armazensStorage = localStorage.getItem(STORAGE_KEY)

        if (armazensStorage) {
          // Carrega do localStorage se existir
          const armazensParsed = JSON.parse(armazensStorage) as Armazem[]
          setArmazens(armazensParsed)
          setArmazensFiltrados(armazensParsed)
        } else {
          // Inicializa com dados padrão e salva no localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(ARMAZENS_DATA))
          setArmazens(ARMAZENS_DATA)
          setArmazensFiltrados(ARMAZENS_DATA)
        }
      } catch (error) {
        console.error('Erro ao carregar armazéns do localStorage:', error)
        // Em caso de erro, usa dados padrão
        setArmazens(ARMAZENS_DATA)
        setArmazensFiltrados(ARMAZENS_DATA)
      }
    }

    carregarArmazens()
  }, [])

  /**
   * Inicializa os lotes do armazém 06 no localStorage (apenas uma vez)
   */
  useEffect(() => {
    const inicializarLotes = () => {
      try {
        const lotesStorage = localStorage.getItem(LOTES_STORAGE_KEY)

        if (!lotesStorage) {
          // Inicializa com dados de exemplo apenas se não existir
          localStorage.setItem(LOTES_STORAGE_KEY, JSON.stringify(LOTES_ARMAZEM_06))
          console.log('Lotes do armazém 06 inicializados no localStorage')
        }
      } catch (error) {
        console.error('Erro ao inicializar lotes no localStorage:', error)
      }
    }

    inicializarLotes()
  }, [])

  /**
   * Filtra armazéns baseado no texto de busca
   */
  useEffect(() => {
    if (!filtro.trim()) {
      setArmazensFiltrados(armazens)
      return
    }

    const filtroLower = filtro.toLowerCase()
    const filtrados = armazens.filter(
      (armazem) =>
        armazem.codigo.toLowerCase().includes(filtroLower) ||
        armazem.descricao.toLowerCase().includes(filtroLower)
    )
    setArmazensFiltrados(filtrados)
  }, [filtro, armazens])

  /**
   * Navega de volta para a Home
   */
  const handleVoltar = () => {
    navigate('/')
  }

  /**
   * Handler para clique em um card de armazém
   * Carrega os lotes do armazém e abre o dialog
   */
  const handleArmazemClick = (armazem: Armazem) => {
    if (armazem.bloqueado) {
      console.log('Armazém bloqueado:', armazem)
      alert(`O armazém ${armazem.codigo} - ${armazem.descricao} está bloqueado e não pode ser acessado.`)
      return
    }

    console.log('Armazém selecionado:', armazem)

    // Carrega lotes do localStorage
    try {
      const lotesStorage = localStorage.getItem(LOTES_STORAGE_KEY)

      if (lotesStorage) {
        const todosLotes = JSON.parse(lotesStorage) as Lote[]
        // Filtra lotes pelo código do armazém
        const lotesFiltrados = todosLotes.filter(lote => lote.B8_LOCAL === armazem.codigo)

        setLotes(lotesFiltrados)
        setArmazemSelecionado(armazem)
        setDialogAberto(true)

        console.log(`${lotesFiltrados.length} lotes encontrados para o armazém ${armazem.codigo}`)
      } else {
        console.warn('Nenhum lote encontrado no localStorage')
        setLotes([])
        setArmazemSelecionado(armazem)
        setDialogAberto(true)
      }
    } catch (error) {
      console.error('Erro ao carregar lotes do localStorage:', error)
      setLotes([])
      setArmazemSelecionado(armazem)
      setDialogAberto(true)
    }
  }

  /**
   * Formata data do formato YYYYMMDD para DD/MM/YYYY
   */
  const formatarData = (data: string): string => {
    if (!data || data.length !== 8) return data

    const ano = data.substring(0, 4)
    const mes = data.substring(4, 6)
    const dia = data.substring(6, 8)

    return `${dia}/${mes}/${ano}`
  }

  /**
   * Formata número com separador de milhares e decimais
   */
  const formatarNumero = (numero: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }).format(numero)
  }

  /**
   * Gera um UUID simples para identificação de inventários
   */
  const gerarUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  /**
   * Abre o modal de inventário e inicializa os itens
   */
  const handleAbrirInventario = () => {
    // Inicializa data com hoje
    const hoje = new Date().toISOString().split('T')[0]
    setDataInventario(hoje)
    setResponsavelInventario('')

    // Inicializa itens do inventário com os lotes atuais
    const itens: ItemInventario[] = lotes.map(lote => ({
      produto: lote.B8_PRODUTO,
      lote: lote.B8_LOTECTL,
      saldo_sistema: lote.B8_SALDO,
      quantidade_inventariada: 0,
      diferenca: -lote.B8_SALDO,
    }))

    setItensInventario(itens)
    setErrosValidacao({})
    setDialogInventarioAberto(true)
  }

  /**
   * Atualiza quantidade inventariada de um item
   */
  const handleAtualizarQuantidade = (index: number, valor: string) => {
    const quantidade = parseFloat(valor) || 0

    setItensInventario(prev => {
      const novosItens = [...prev]
      novosItens[index] = {
        ...novosItens[index],
        quantidade_inventariada: quantidade,
        diferenca: quantidade - novosItens[index].saldo_sistema,
      }
      return novosItens
    })
  }

  /**
   * Valida o formulário de inventário
   */
  const validarInventario = (): boolean => {
    const erros: { [key: string]: string } = {}

    // Valida data
    if (!dataInventario) {
      erros.data = 'Data do inventário é obrigatória'
    } else {
      const dataInv = new Date(dataInventario)
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)

      if (dataInv > hoje) {
        erros.data = 'Data do inventário não pode ser futura'
      }
    }

    // Valida responsável
    if (!responsavelInventario.trim()) {
      erros.responsavel = 'Responsável é obrigatório'
    }

    // Valida se todos os itens foram preenchidos
    const todosPreenchidos = itensInventario.every(item => item.quantidade_inventariada >= 0)
    if (!todosPreenchidos) {
      erros.itens = 'Todos os lotes devem ter quantidade inventariada informada'
    }

    setErrosValidacao(erros)
    return Object.keys(erros).length === 0
  }

  /**
   * Salva o inventário no localStorage
   */
  const handleSalvarInventario = () => {
    if (!validarInventario()) {
      return
    }

    setSalvandoInventario(true)

    try {
      const novoInventario: Inventario = {
        id: gerarUUID(),
        armazem_codigo: armazemSelecionado?.codigo || '',
        armazem_descricao: armazemSelecionado?.descricao || '',
        data_inventario: dataInventario,
        responsavel: responsavelInventario,
        data_cadastro: new Date().toISOString(),
        lotes: itensInventario,
      }

      // Carrega inventários existentes
      const inventariosStorage = localStorage.getItem(INVENTARIOS_STORAGE_KEY)
      const inventariosExistentes: Inventario[] = inventariosStorage
        ? JSON.parse(inventariosStorage)
        : []

      // Adiciona novo inventário
      inventariosExistentes.push(novoInventario)

      // Salva no localStorage
      localStorage.setItem(INVENTARIOS_STORAGE_KEY, JSON.stringify(inventariosExistentes))

      // Atualiza estado
      setInventarios(inventariosExistentes)

      // Fecha modal e exibe sucesso
      setTimeout(() => {
        setSalvandoInventario(false)
        setDialogInventarioAberto(false)
        alert('Inventário salvo com sucesso!')
      }, 500)
    } catch (error) {
      console.error('Erro ao salvar inventário:', error)
      setSalvandoInventario(false)
      alert('Erro ao salvar inventário. Tente novamente.')
    }
  }

  /**
   * Carrega inventários do armazém selecionado
   */
  const carregarInventarios = () => {
    try {
      const inventariosStorage = localStorage.getItem(INVENTARIOS_STORAGE_KEY)

      if (inventariosStorage) {
        const todosInventarios: Inventario[] = JSON.parse(inventariosStorage)
        // Filtra apenas inventários do armazém selecionado
        const inventariosFiltrados = todosInventarios.filter(
          inv => inv.armazem_codigo === armazemSelecionado?.codigo
        )
        setInventarios(inventariosFiltrados)
      } else {
        setInventarios([])
      }
    } catch (error) {
      console.error('Erro ao carregar inventários:', error)
      setInventarios([])
    }
  }

  /**
   * Abre modal de histórico de inventários
   */
  const handleAbrirHistorico = () => {
    carregarInventarios()
    setDialogHistoricoAberto(true)
  }

  /**
   * Abre modal de detalhes de um inventário
   */
  const handleVerDetalhes = (inventario: Inventario) => {
    setInventarioSelecionado(inventario)
    setDialogDetalhesAberto(true)
  }

  /**
   * Formata data ISO para DD/MM/YYYY
   */
  const formatarDataISO = (dataISO: string): string => {
    if (!dataISO) return '-'
    const data = new Date(dataISO)
    return data.toLocaleDateString('pt-BR')
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary via-primary/95 to-accent shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 md:py-6">
          <div className="flex items-center justify-between">
            {/* Botão Voltar e Título */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleVoltar}
                className="text-white hover:bg-white/20"
                aria-label="Voltar para Home"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">
                  Armazéns
                </h1>
                <p className="text-white/80 text-xs md:text-sm">
                  Gestão de Armazéns de Estoque
                </p>
              </div>
            </div>

            {/* Ícone decorativo */}
            <div className="hidden md:block text-white/30">
              <Package className="h-10 w-10" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
        {/* Barra de Busca */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por código ou descrição..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-10"
              aria-label="Buscar armazéns"
            />
          </div>
          
          {/* Contador de resultados */}
          <p className="text-sm text-muted-foreground mt-2">
            {armazensFiltrados.length === armazens.length
              ? `${armazens.length} armazéns cadastrados`
              : `${armazensFiltrados.length} de ${armazens.length} armazéns`}
          </p>
        </div>

        {/* Grid de Cards de Armazéns */}
        {armazensFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {armazensFiltrados.map((armazem) => (
              <Card
                key={armazem.codigo}
                className={`
                  transition-all duration-300 relative
                  ${armazem.bloqueado
                    ? 'cursor-not-allowed border-red-500 bg-red-50/50 hover:shadow-sm'
                    : 'cursor-pointer hover:shadow-md hover:scale-[1.02] hover:border-primary/20'
                  }
                `}
                onClick={() => handleArmazemClick(armazem)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleArmazemClick(armazem)
                  }
                }}
                aria-label={`Armazém ${armazem.codigo} - ${armazem.descricao}${armazem.bloqueado ? ' - Bloqueado' : ''}`}
                aria-disabled={armazem.bloqueado}
              >
                {/* Badge de Bloqueado */}
                {armazem.bloqueado && (
                  <Badge
                    variant="destructive"
                    className="absolute top-2 right-2 text-xs font-semibold"
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    BLOQUEADO
                  </Badge>
                )}

                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div
                      className={`
                        flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm
                        ${armazem.bloqueado
                          ? 'bg-red-100 text-red-700'
                          : 'bg-primary/10 text-primary'
                        }
                      `}
                    >
                      {armazem.bloqueado && <Lock className="h-4 w-4" />}
                      {!armazem.bloqueado && armazem.codigo}
                    </div>
                    <span
                      className={`
                        text-sm font-semibold
                        ${armazem.bloqueado ? 'text-red-700' : 'text-muted-foreground'}
                      `}
                    >
                      Armazém {armazem.codigo}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className={`
                      text-sm font-medium leading-tight
                      ${armazem.bloqueado ? 'text-red-900/70' : 'text-foreground'}
                    `}
                  >
                    {armazem.descricao}
                  </p>
                </CardContent>

                {/* Barra inferior - vermelha para bloqueados, azul para ativos */}
                <div
                  className={`
                    absolute bottom-0 left-0 w-full h-1.5
                    ${armazem.bloqueado ? 'bg-red-500' : 'bg-primary'}
                  `}
                />
              </Card>
            ))}
          </div>
        ) : (
          // Mensagem quando não há resultados
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum armazém encontrado
            </h3>
            <p className="text-sm text-muted-foreground">
              Tente ajustar os termos de busca
            </p>
          </div>
        )}
      </main>

      {/* Modal de Lotes do Armazém */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="w-[95vw] md:w-[90vw] max-w-[1400px] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Lotes do Armazém {armazemSelecionado?.codigo} - {armazemSelecionado?.descricao}
            </DialogTitle>
            <DialogDescription>
              Listagem de todos os lotes armazenados neste local
            </DialogDescription>
          </DialogHeader>

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant="default"
              onClick={handleAbrirInventario}
              className="flex items-center gap-2"
            >
              <ClipboardList className="h-4 w-4" />
              Realizar Inventário
            </Button>
            <Button
              variant="outline"
              onClick={handleAbrirHistorico}
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              Histórico de Inventários
            </Button>
          </div>

          {/* Conteúdo do Modal */}
          <div className="mt-4">
            {lotes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border px-3 py-2 text-center font-semibold w-[100px]">Status</th>
                      <th className="border border-border px-3 py-2 text-left font-semibold">Produto</th>
                      <th className="border border-border px-3 py-2 text-left font-semibold">Lote</th>
                      <th className="border border-border px-3 py-2 text-left font-semibold">Data Entrada</th>
                      <th className="border border-border px-3 py-2 text-left font-semibold">Data Validade</th>
                      <th className="border border-border px-3 py-2 text-right font-semibold">Qtd Original</th>
                      <th className="border border-border px-3 py-2 text-right font-semibold">Saldo</th>
                      <th className="border border-border px-3 py-2 text-right font-semibold">Empenho</th>
                      <th className="border border-border px-3 py-2 text-left font-semibold">Origem</th>
                      <th className="border border-border px-3 py-2 text-left font-semibold">Documento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lotes.map((lote, index) => {
                      const status = lote.status || 'LIBERADO'
                      const isBloqueado = status === 'BLOQUEADO'

                      return (
                        <tr
                          key={`${lote.B8_LOTECTL}-${index}`}
                          className={`hover:bg-muted/50 transition-colors ${isBloqueado ? 'bg-red-50/30' : ''}`}
                        >
                          <td className="border border-border px-3 py-2">
                            <div className="flex items-center justify-center gap-2">
                              {isBloqueado ? (
                                <>
                                  <XCircle className="h-5 w-5 text-red-600" />
                                  <span className="text-xs font-semibold text-red-700">BLOQUEADO</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                                  <span className="text-xs font-semibold text-green-700">LIBERADO</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="border border-border px-3 py-2">{lote.B8_PRODUTO}</td>
                          <td className="border border-border px-3 py-2 font-medium">{lote.B8_LOTECTL}</td>
                          <td className="border border-border px-3 py-2">{formatarData(lote.B8_DATA)}</td>
                          <td className="border border-border px-3 py-2">{formatarData(lote.B8_DTVALID)}</td>
                          <td className="border border-border px-3 py-2 text-right">{formatarNumero(lote.B8_QTDORI)}</td>
                          <td className="border border-border px-3 py-2 text-right font-semibold text-primary">
                            {formatarNumero(lote.B8_SALDO)}
                          </td>
                          <td className="border border-border px-3 py-2 text-right">
                            {lote.B8_EMPENHO > 0 ? (
                              <span className="text-orange-600 font-medium">{formatarNumero(lote.B8_EMPENHO)}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="border border-border px-3 py-2">{lote.B8_ORIGLAN || '-'}</td>
                          <td className="border border-border px-3 py-2">{lote.B8_DOC || '-'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {/* Resumo */}
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Resumo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total de Lotes:</span>
                      <span className="ml-2 font-semibold">{lotes.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lotes Liberados:</span>
                      <span className="ml-2 font-semibold text-green-700">
                        {lotes.filter(l => (l.status || 'LIBERADO') === 'LIBERADO').length}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lotes Bloqueados:</span>
                      <span className="ml-2 font-semibold text-red-700">
                        {lotes.filter(l => l.status === 'BLOQUEADO').length}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Saldo Total:</span>
                      <span className="ml-2 font-semibold text-primary">
                        {formatarNumero(lotes.reduce((acc, lote) => acc + lote.B8_SALDO, 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhum lote encontrado
                </h3>
                <p className="text-sm text-muted-foreground">
                  Não há lotes cadastrados para este armazém
                </p>
              </div>
            )}
          </div>

          {/* Botão Fechar */}
          <div className="mt-6 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setDialogAberto(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Cadastro de Inventário */}
      <Dialog open={dialogInventarioAberto} onOpenChange={setDialogInventarioAberto}>
        <DialogContent className="w-[95vw] md:w-[90vw] max-w-[1200px] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ClipboardList className="h-6 w-6" />
              Realizar Inventário - Armazém {armazemSelecionado?.codigo}
            </DialogTitle>
            <DialogDescription>
              Preencha as quantidades inventariadas para cada lote
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Cabeçalho do Inventário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="data-inventario" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data do Inventário *
                </Label>
                <Input
                  id="data-inventario"
                  type="date"
                  value={dataInventario}
                  onChange={(e) => setDataInventario(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className={errosValidacao.data ? 'border-red-500' : ''}
                />
                {errosValidacao.data && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errosValidacao.data}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsavel-inventario" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Responsável pelo Inventário *
                </Label>
                <Input
                  id="responsavel-inventario"
                  type="text"
                  placeholder="Nome do responsável"
                  value={responsavelInventario}
                  onChange={(e) => setResponsavelInventario(e.target.value)}
                  className={errosValidacao.responsavel ? 'border-red-500' : ''}
                />
                {errosValidacao.responsavel && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errosValidacao.responsavel}
                  </p>
                )}
              </div>
            </div>

            {/* Mensagem de erro geral */}
            {errosValidacao.itens && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {errosValidacao.itens}
                </p>
              </div>
            )}

            {/* Tabela de Contagem */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border px-3 py-2 text-left font-semibold">Produto</th>
                    <th className="border border-border px-3 py-2 text-left font-semibold">Lote</th>
                    <th className="border border-border px-3 py-2 text-right font-semibold">Saldo Sistema</th>
                    <th className="border border-border px-3 py-2 text-right font-semibold">Qtd Inventariada *</th>
                    <th className="border border-border px-3 py-2 text-right font-semibold">Diferença</th>
                  </tr>
                </thead>
                <tbody>
                  {itensInventario.map((item, index) => {
                    const corDiferenca =
                      item.diferenca === 0 ? 'text-green-700' :
                      item.diferenca < 0 ? 'text-red-700' :
                      'text-orange-600'

                    return (
                      <tr key={`${item.lote}-${index}`} className="hover:bg-muted/50">
                        <td className="border border-border px-3 py-2">{item.produto}</td>
                        <td className="border border-border px-3 py-2 font-medium">{item.lote}</td>
                        <td className="border border-border px-3 py-2 text-right font-semibold text-primary">
                          {formatarNumero(item.saldo_sistema)}
                        </td>
                        <td className="border border-border px-3 py-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.001"
                            value={item.quantidade_inventariada || ''}
                            onChange={(e) => handleAtualizarQuantidade(index, e.target.value)}
                            className="text-right"
                            placeholder="0"
                          />
                        </td>
                        <td className={`border border-border px-3 py-2 text-right font-semibold ${corDiferenca}`}>
                          {item.diferenca > 0 ? '+' : ''}{formatarNumero(item.diferenca)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Resumo de Divergências */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Resumo de Divergências</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Sem Divergência:</span>
                  <span className="ml-2 font-semibold text-green-700">
                    {itensInventario.filter(i => i.diferenca === 0).length}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Falta:</span>
                  <span className="ml-2 font-semibold text-red-700">
                    {itensInventario.filter(i => i.diferenca < 0).length}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Sobra:</span>
                  <span className="ml-2 font-semibold text-orange-600">
                    {itensInventario.filter(i => i.diferenca > 0).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setDialogInventarioAberto(false)}
              disabled={salvandoInventario}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={handleSalvarInventario}
              disabled={salvandoInventario}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {salvandoInventario ? 'Salvando...' : 'Salvar Inventário'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Histórico de Inventários */}
      <Dialog open={dialogHistoricoAberto} onOpenChange={setDialogHistoricoAberto}>
        <DialogContent className="w-[95vw] md:w-[85vw] max-w-[1000px] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <History className="h-6 w-6" />
              Histórico de Inventários - Armazém {armazemSelecionado?.codigo}
            </DialogTitle>
            <DialogDescription>
              Consulte os inventários realizados neste armazém
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {inventarios.length > 0 ? (
              <div className="space-y-3">
                {inventarios
                  .sort((a, b) => new Date(b.data_cadastro).getTime() - new Date(a.data_cadastro).getTime())
                  .map((inventario) => {
                    const totalDivergencias = inventario.lotes.filter(l => l.diferenca !== 0).length

                    return (
                      <div
                        key={inventario.id}
                        className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleVerDetalhes(inventario)}
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold">
                                {formatarDataISO(inventario.data_inventario)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span>{inventario.responsavel}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span>
                                <span className="font-semibold">{inventario.lotes.length}</span> lotes
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                              <span>
                                <span className="font-semibold text-orange-600">{totalDivergencias}</span> divergências
                              </span>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleVerDetalhes(inventario)
                            }}
                          >
                            Ver Detalhes
                          </Button>
                        </div>

                        <div className="mt-2 text-xs text-muted-foreground">
                          Cadastrado em: {formatarDataISO(inventario.data_cadastro)}
                        </div>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhum inventário encontrado
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ainda não foram realizados inventários neste armazém
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <Button
              variant="outline"
              onClick={() => setDialogHistoricoAberto(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes do Inventário */}
      <Dialog open={dialogDetalhesAberto} onOpenChange={setDialogDetalhesAberto}>
        <DialogContent className="w-[95vw] md:w-[90vw] max-w-[1200px] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ClipboardList className="h-6 w-6" />
              Detalhes do Inventário
            </DialogTitle>
            <DialogDescription>
              Visualização completa do inventário realizado
            </DialogDescription>
          </DialogHeader>

          {inventarioSelecionado && (
            <div className="space-y-6">
              {/* Informações do Inventário */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Data do Inventário</span>
                  </div>
                  <p className="font-semibold">{formatarDataISO(inventarioSelecionado.data_inventario)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Responsável</span>
                  </div>
                  <p className="font-semibold">{inventarioSelecionado.responsavel}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>Armazém</span>
                  </div>
                  <p className="font-semibold">
                    {inventarioSelecionado.armazem_codigo} - {inventarioSelecionado.armazem_descricao}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ClipboardList className="h-4 w-4" />
                    <span>Data de Cadastro</span>
                  </div>
                  <p className="font-semibold">{formatarDataISO(inventarioSelecionado.data_cadastro)}</p>
                </div>
              </div>

              {/* Tabela de Lotes Inventariados */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border px-3 py-2 text-left font-semibold">Produto</th>
                      <th className="border border-border px-3 py-2 text-left font-semibold">Lote</th>
                      <th className="border border-border px-3 py-2 text-right font-semibold">Saldo Sistema</th>
                      <th className="border border-border px-3 py-2 text-right font-semibold">Qtd Inventariada</th>
                      <th className="border border-border px-3 py-2 text-right font-semibold">Diferença</th>
                      <th className="border border-border px-3 py-2 text-center font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventarioSelecionado.lotes.map((item, index) => {
                      const corDiferenca =
                        item.diferenca === 0 ? 'text-green-700' :
                        item.diferenca < 0 ? 'text-red-700' :
                        'text-orange-600'

                      const statusTexto =
                        item.diferenca === 0 ? 'OK' :
                        item.diferenca < 0 ? 'FALTA' :
                        'SOBRA'

                      const statusCor =
                        item.diferenca === 0 ? 'bg-green-100 text-green-800' :
                        item.diferenca < 0 ? 'bg-red-100 text-red-800' :
                        'bg-orange-100 text-orange-800'

                      return (
                        <tr key={`${item.lote}-${index}`} className="hover:bg-muted/50">
                          <td className="border border-border px-3 py-2">{item.produto}</td>
                          <td className="border border-border px-3 py-2 font-medium">{item.lote}</td>
                          <td className="border border-border px-3 py-2 text-right font-semibold text-primary">
                            {formatarNumero(item.saldo_sistema)}
                          </td>
                          <td className="border border-border px-3 py-2 text-right font-semibold">
                            {formatarNumero(item.quantidade_inventariada)}
                          </td>
                          <td className={`border border-border px-3 py-2 text-right font-semibold ${corDiferenca}`}>
                            {item.diferenca > 0 ? '+' : ''}{formatarNumero(item.diferenca)}
                          </td>
                          <td className="border border-border px-3 py-2 text-center">
                            <Badge className={`${statusCor} text-xs font-semibold`}>
                              {statusTexto}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Resumo Final */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-3">Resumo do Inventário</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total de Lotes:</span>
                    <span className="ml-2 font-semibold">{inventarioSelecionado.lotes.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sem Divergência:</span>
                    <span className="ml-2 font-semibold text-green-700">
                      {inventarioSelecionado.lotes.filter(l => l.diferenca === 0).length}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Falta:</span>
                    <span className="ml-2 font-semibold text-red-700">
                      {inventarioSelecionado.lotes.filter(l => l.diferenca < 0).length}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sobra:</span>
                    <span className="ml-2 font-semibold text-orange-600">
                      {inventarioSelecionado.lotes.filter(l => l.diferenca > 0).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <Button
              variant="outline"
              onClick={() => setDialogDetalhesAberto(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

