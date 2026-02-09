import { describe, expect, it } from 'vitest'

import type { ResumoOeeTurnoLinhaNormalizada } from '../../types'
import { agruparLinhasResumo } from '../aggregations'

const criarLinha = (
  overrides: Partial<ResumoOeeTurnoLinhaNormalizada>
): ResumoOeeTurnoLinhaNormalizada => ({
  data: '2026-02-09',
  linhaproducao_id: 11,
  linhaproducao: 'SPEP 1 - LINHA A - ENVASE',
  oeeturno_id: 1001,
  qtde_turnos: 1,
  status_linha: 'FECHADA',
  status_turno_registrado: 'Fechado',
  produto_id: 15,
  produto: 'Produto Teste',
  sku_produzidos: 1,
  qtd_envase: 100,
  envasado: 100,
  embalado: 0,
  qtd_embalagem: 0,
  perdas_envase: 0,
  perdas_embalagem: 0,
  perdas: 0,
  unidades_boas: 100,
  paradas_grandes_minutos: 0,
  paradas_pequenas_minutos: 0,
  paradas_totais_minutos: 0,
  paradas_estrategicas_minutos: 0,
  paradas_hh_mm: '00:00',
  paradas_totais_hh_mm: '00:00',
  paradas_estrategicas_hh_mm: '00:00',
  ...overrides,
})

describe('agruparLinhasResumo', () => {
  it('deve exibir apenas turnos com lançamento quando houver mistura com sem lançamento', () => {
    const linhas = [
      criarLinha({
        oeeturno_id: 2001,
        produto: 'Produto A',
      }),
      criarLinha({
        oeeturno_id: null,
        qtde_turnos: 0,
        status_linha: 'Turno Não Iniciado',
        produto_id: null,
        produto: 'Produto não informado',
        qtd_envase: 0,
        envasado: 0,
        unidades_boas: 0,
      }),
    ]

    const agrupadas = agruparLinhasResumo(linhas)

    expect(agrupadas).toHaveLength(1)
    expect(agrupadas[0].turnos).toHaveLength(1)
    expect(agrupadas[0].turnos[0].oeeturnoId).toBe(2001)
    expect(agrupadas[0].turnos[0].semLancamento).toBeUndefined()
  })

  it('deve consolidar dias sem lançamento em uma única linha de drill-down', () => {
    const linhas = [
      criarLinha({
        data: '2026-02-08',
        oeeturno_id: null,
        qtde_turnos: 0,
        status_linha: 'Turno Não Iniciado',
        produto_id: null,
        produto: 'Produto não informado',
        qtd_envase: 0,
        envasado: 0,
        unidades_boas: 0,
      }),
      criarLinha({
        data: '2026-02-09',
        oeeturno_id: null,
        qtde_turnos: 0,
        status_linha: 'Turno Não Iniciado',
        produto_id: null,
        produto: 'Produto não informado',
        qtd_envase: 0,
        envasado: 0,
        unidades_boas: 0,
      }),
    ]

    const agrupadas = agruparLinhasResumo(linhas)

    expect(agrupadas).toHaveLength(1)
    expect(agrupadas[0].turnos).toHaveLength(1)
    expect(agrupadas[0].turnos[0].oeeturnoId).toBeNull()
    expect(agrupadas[0].turnos[0].semLancamento).toBe(true)
    expect(agrupadas[0].turnos[0].diasSemLancamento).toBe(2)
  })

  it('deve manter qtdeTurnos do lançamento como valor único, mesmo com múltiplos produtos', () => {
    const linhas = [
      criarLinha({
        oeeturno_id: 3001,
        qtde_turnos: 1,
        produto_id: 10,
        produto: 'Produto A',
        qtd_envase: 100,
      }),
      criarLinha({
        oeeturno_id: 3001,
        qtde_turnos: 1,
        produto_id: 11,
        produto: 'Produto B',
        qtd_envase: 200,
      }),
    ]

    const agrupadas = agruparLinhasResumo(linhas)
    const turno = agrupadas[0].turnos[0]

    expect(turno.oeeturnoId).toBe(3001)
    expect(turno.qtdeTurnos).toBe(1)
    expect(turno.qtdEnvase).toBe(300)
    expect(turno.produtos).toEqual(['Produto A', 'Produto B'])
  })
})
