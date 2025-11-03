/**
 * Testes para utilitários de manipulação de horas
 */

import { describe, it, expect } from 'vitest'
import {
  horaParaMinutos,
  minutosParaHora,
  somarHoras,
  subtrairHoras,
  duracaoParaHora,
  formatarDuracaoLegivel,
  validarFormatoHora,
} from '../horas.utils'

describe('horas.utils', () => {
  describe('horaParaMinutos', () => {
    it('deve converter HH:MM para minutos corretamente', () => {
      expect(horaParaMinutos('00:00')).toBe(0)
      expect(horaParaMinutos('01:00')).toBe(60)
      expect(horaParaMinutos('00:30')).toBe(30)
      expect(horaParaMinutos('17:14')).toBe(1034)
      expect(horaParaMinutos('23:59')).toBe(1439)
    })

    it('deve retornar 0 para entradas inválidas', () => {
      expect(horaParaMinutos('')).toBe(0)
      expect(horaParaMinutos('invalid')).toBe(0)
      expect(horaParaMinutos('25:00')).toBe(1500) // Aceita valores > 24h
    })
  })

  describe('minutosParaHora', () => {
    it('deve converter minutos para HH:MM corretamente', () => {
      expect(minutosParaHora(0)).toBe('00:00')
      expect(minutosParaHora(60)).toBe('01:00')
      expect(minutosParaHora(30)).toBe('00:30')
      expect(minutosParaHora(1034)).toBe('17:14')
      expect(minutosParaHora(1439)).toBe('23:59')
    })

    it('deve retornar 00:00 para valores inválidos', () => {
      expect(minutosParaHora(-10)).toBe('00:00')
      expect(minutosParaHora(NaN)).toBe('00:00')
    })

    it('deve suportar valores maiores que 24 horas', () => {
      expect(minutosParaHora(1500)).toBe('25:00')
      expect(minutosParaHora(3000)).toBe('50:00')
    })
  })

  describe('somarHoras', () => {
    it('deve somar duas horas corretamente', () => {
      expect(somarHoras('00:00', '00:00')).toBe('00:00')
      expect(somarHoras('01:00', '01:00')).toBe('02:00')
      expect(somarHoras('00:30', '00:30')).toBe('01:00')
      expect(somarHoras('17:14', '02:46')).toBe('20:00')
      expect(somarHoras('23:30', '01:30')).toBe('25:00') // Passa de 24h
    })

    it('deve lidar com valores vazios', () => {
      expect(somarHoras('', '01:00')).toBe('01:00')
      expect(somarHoras('01:00', '')).toBe('01:00')
      expect(somarHoras('', '')).toBe('00:00')
    })
  })

  describe('subtrairHoras', () => {
    it('deve subtrair duas horas corretamente', () => {
      expect(subtrairHoras('02:00', '01:00')).toBe('01:00')
      expect(subtrairHoras('17:14', '02:14')).toBe('15:00')
      expect(subtrairHoras('01:00', '00:30')).toBe('00:30')
    })

    it('deve retornar 00:00 quando resultado for negativo', () => {
      expect(subtrairHoras('01:00', '02:00')).toBe('00:00')
      expect(subtrairHoras('00:00', '01:00')).toBe('00:00')
    })
  })

  describe('duracaoParaHora', () => {
    it('deve converter duração em minutos para HH:MM', () => {
      expect(duracaoParaHora(0)).toBe('00:00')
      expect(duracaoParaHora(60)).toBe('01:00')
      expect(duracaoParaHora(30)).toBe('00:30')
      expect(duracaoParaHora(125.5)).toBe('02:06') // Arredonda 125.5 para 126
    })

    it('deve arredondar valores decimais', () => {
      expect(duracaoParaHora(30.4)).toBe('00:30')
      expect(duracaoParaHora(30.6)).toBe('00:31')
    })

    it('deve retornar 00:00 para valores inválidos', () => {
      expect(duracaoParaHora(-10)).toBe('00:00')
      expect(duracaoParaHora(NaN)).toBe('00:00')
    })
  })

  describe('formatarDuracaoLegivel', () => {
    it('deve formatar duração de forma legível', () => {
      expect(formatarDuracaoLegivel(0)).toBe('0min')
      expect(formatarDuracaoLegivel(30)).toBe('30min')
      expect(formatarDuracaoLegivel(60)).toBe('1h')
      expect(formatarDuracaoLegivel(90)).toBe('1h 30min')
      expect(formatarDuracaoLegivel(125)).toBe('2h 5min')
      expect(formatarDuracaoLegivel(120)).toBe('2h')
    })

    it('deve retornar 0min para valores inválidos', () => {
      expect(formatarDuracaoLegivel(-10)).toBe('0min')
      expect(formatarDuracaoLegivel(NaN)).toBe('0min')
    })
  })

  describe('validarFormatoHora', () => {
    it('deve validar formato HH:MM correto', () => {
      expect(validarFormatoHora('00:00')).toBe(true)
      expect(validarFormatoHora('17:14')).toBe(true)
      expect(validarFormatoHora('23:59')).toBe(true)
      expect(validarFormatoHora('9:30')).toBe(true) // Aceita 1 dígito na hora
    })

    it('deve rejeitar formatos inválidos', () => {
      expect(validarFormatoHora('')).toBe(false)
      expect(validarFormatoHora('invalid')).toBe(false)
      expect(validarFormatoHora('25:00')).toBe(true) // Aceita horas > 23
      expect(validarFormatoHora('12:60')).toBe(false) // Minutos >= 60
      expect(validarFormatoHora('12:5')).toBe(false) // Minutos com 1 dígito
      expect(validarFormatoHora('12')).toBe(false) // Sem minutos
    })
  })

  describe('Cenários de uso real', () => {
    it('deve acumular múltiplas paradas corretamente', () => {
      let horasAcumuladas = '00:00'
      
      // Parada 1: 30 minutos
      horasAcumuladas = somarHoras(horasAcumuladas, duracaoParaHora(30))
      expect(horasAcumuladas).toBe('00:30')
      
      // Parada 2: 45 minutos
      horasAcumuladas = somarHoras(horasAcumuladas, duracaoParaHora(45))
      expect(horasAcumuladas).toBe('01:15')
      
      // Parada 3: 1 hora e 30 minutos (90 minutos)
      horasAcumuladas = somarHoras(horasAcumuladas, duracaoParaHora(90))
      expect(horasAcumuladas).toBe('02:45')
    })

    it('deve converter duração de parada do localStorage para formato de exibição', () => {
      // Simula duração retornada do localStorage (em minutos decimais)
      const duracaoParada1 = 125.5 // 2h 5min 30s
      const duracaoParada2 = 30.25 // 30min 15s
      
      const hora1 = duracaoParaHora(duracaoParada1)
      const hora2 = duracaoParaHora(duracaoParada2)
      
      expect(hora1).toBe('02:06') // Arredonda para 126 minutos
      expect(hora2).toBe('00:30') // Arredonda para 30 minutos
      
      const total = somarHoras(hora1, hora2)
      expect(total).toBe('02:36')
    })
  })
})

