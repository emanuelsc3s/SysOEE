import { describe, expect, it } from 'vitest'
import {
  calcularDuracaoMinutosComViradaOEE,
  gerarJanelasHoraAHoraOEE,
  identificarJanelasFaltantesOEE,
  normalizarHora24hOEE,
  normalizarPerdaPtBrRapidoOEE
} from '../apontamentoRapidoOee.utils'

describe('apontamentoRapidoOee.utils', () => {
  it('deve gerar janelas hora a hora no mesmo dia', () => {
    const janelas = gerarJanelasHoraAHoraOEE('08:00', '12:00')

    expect(janelas).toHaveLength(4)
    expect(janelas[0].chave).toBe('08:00-09:00')
    expect(janelas[3].chave).toBe('11:00-12:00')
  })

  it('deve gerar janelas hora a hora com virada de meia-noite', () => {
    const janelas = gerarJanelasHoraAHoraOEE('22:00', '01:00')

    expect(janelas).toHaveLength(3)
    expect(janelas.map((item) => item.chave)).toEqual([
      '22:00-23:00',
      '23:00-00:00',
      '00:00-01:00'
    ])
  })

  it('deve identificar apenas janelas faltantes', () => {
    const janelas = gerarJanelasHoraAHoraOEE('08:00', '11:00')
    const faltantes = identificarJanelasFaltantesOEE(janelas, [
      {
        oeeturnoproducao_id: 1,
        hora_inicio: '08:00:00',
        hora_final: '09:00:00',
        quantidade: 100
      }
    ])

    expect(faltantes).toHaveLength(2)
    expect(faltantes[0].chave).toBe('09:00-10:00')
    expect(faltantes[1].chave).toBe('10:00-11:00')
  })

  it('deve calcular duração com virada de meia-noite', () => {
    expect(calcularDuracaoMinutosComViradaOEE('23:10', '00:20')).toBe(70)
    expect(calcularDuracaoMinutosComViradaOEE('10:00', '10:00')).toBe(0)
  })

  it('deve normalizar hora digitada no formato 24h', () => {
    expect(normalizarHora24hOEE('9', true)).toBe('09:00')
    expect(normalizarHora24hOEE('0930', true)).toBe('09:30')
    expect(normalizarHora24hOEE('25:00', true)).toBe('')
  })

  it('deve normalizar perda em formato pt-BR', () => {
    const normalizado = normalizarPerdaPtBrRapidoOEE('1.234,56')

    expect(normalizado.formatado).toBe('1.234,56')
    expect(normalizado.valorNormalizado).toBe('1234.56')
    expect(normalizado.valorNumero).toBe(1234.56)
  })
})
