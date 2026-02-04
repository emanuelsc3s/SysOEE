/**
 * useDashboardOEE - Hook para dados do Dashboard OEE
 * Atualmente retorna dados mock; futuramente integrará com Supabase
 */

import { useState, useEffect, useMemo } from 'react'
import type { OEECardData, DashboardOEEData, DashboardTotals } from '../types/dashboard.types'

// Dados mock para desenvolvimento
const MOCK_CARDS: OEECardData[] = [
  {
    title: 'SPEP 2 - LINHA D - EMBALAGEM - ESTEIRA 8',
    oeeValue: 84.50,
    disponibilidade: 84.72,
    performance: 100.00,
    qualidade: 99.74,
    unidadesProduzidas: 3918,
    unidadesPerdas: 0,
    unidadesBoas: 3918,
  },
  {
    title: 'SPEP 3 - LINHA I - ENVASE',
    oeeValue: 56.53,
    disponibilidade: 88.06,
    performance: 64.25,
    qualidade: 99.92,
    unidadesProduzidas: 2450,
    unidadesPerdas: 12,
    unidadesBoas: 2438,
  },
  {
    title: 'CPHD - LINHA A',
    oeeValue: 56.29,
    disponibilidade: 90.28,
    performance: 62.36,
    qualidade: 100.00,
    unidadesProduzidas: 1876,
    unidadesPerdas: 0,
    unidadesBoas: 1876,
  },
  {
    title: 'SPPV - VIDRO 6 - EMBALAGEM',
    oeeValue: 53.52,
    disponibilidade: 77.78,
    performance: 73.49,
    qualidade: 93.63,
    unidadesProduzidas: 5240,
    unidadesPerdas: 334,
    unidadesBoas: 4906,
  },
]

/**
 * Calcula os totais consolidados a partir dos cards
 */
function calculateTotals(cards: OEECardData[]): DashboardTotals {
  if (cards.length === 0) {
    return {
      totalProduzido: 0,
      totalAprovadas: 0,
      totalPerdas: 0,
      oeeMedia: 0,
    }
  }

  const totalProduzido = cards.reduce((acc, card) => acc + card.unidadesProduzidas, 0)
  const totalAprovadas = cards.reduce((acc, card) => acc + card.unidadesBoas, 0)
  const totalPerdas = cards.reduce((acc, card) => acc + card.unidadesPerdas, 0)
  const oeeMedia = cards.reduce((acc, card) => acc + card.oeeValue, 0) / cards.length

  return {
    totalProduzido,
    totalAprovadas,
    totalPerdas,
    oeeMedia,
  }
}

/**
 * Hook principal para dados do Dashboard OEE
 */
export function useDashboardOEE(): DashboardOEEData {
  const [cards, setCards] = useState<OEECardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Simula carregamento assíncrono
    const loadData = async () => {
      try {
        setIsLoading(true)
        // Simula delay de rede
        await new Promise((resolve) => setTimeout(resolve, 500))
        setCards(MOCK_CARDS)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro ao carregar dados'))
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Calcula totais memoizados
  const totals = useMemo(() => calculateTotals(cards), [cards])

  return {
    cards,
    totals,
    isLoading,
    error,
  }
}
