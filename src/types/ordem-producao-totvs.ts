/**
 * Tipos para Ordem de Produção do TOTVS
 * Estrutura baseada no arquivo ordem-producao.json
 */

/**
 * Interface para Ordem de Produção do TOTVS
 * Campos extraídos do ERP TOTVS
 */
export interface OrdemProducaoTOTVS {
  /** Data de emissão da OP (formato DD/MM/YYYY) */
  C2_EMISSAO: string

  /** Número da Ordem de Produção */
  C2_NUM: number

  /** Código do produto/SKU */
  C2_PRODUTO: string

  /** Descrição do produto */
  B1_DESC: string

  /** Quantidade planejada */
  C2_QUANT: number

  /** Quantidade em ML do produto */
  B1_YQTML: number

  /** Concentração */
  B1_YCONC: number

  /** Número do dossiê */
  C2_YDOSSIE: string

  /** Número do lote */
  C2_YLOTE: string

  /** Registro ANVISA */
  B1_YREGANS: string | null

  /** Código de barras */
  B1_CODBAR: string | null
}

