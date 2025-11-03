/**
 * Hook useQueryParams
 * Sincroniza estado da UI com query parameters da URL
 */

import { useSearchParams } from 'react-router-dom'
import { useCallback } from 'react'

/**
 * Hook para gerenciar query parameters da URL
 * @returns Objeto com searchParams e funções para manipulá-los
 */
export function useQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  /**
   * Obtém um parâmetro específico da URL
   * @param key - Chave do parâmetro
   * @returns Valor do parâmetro ou null
   */
  const getParam = useCallback(
    (key: string): string | null => {
      return searchParams.get(key)
    },
    [searchParams]
  )

  /**
   * Define um parâmetro na URL
   * @param key - Chave do parâmetro
   * @param value - Valor do parâmetro (null para remover)
   */
  const setParam = useCallback(
    (key: string, value: string | null) => {
      const newParams = new URLSearchParams(searchParams)
      
      if (value === null || value === '') {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
      
      setSearchParams(newParams, { replace: true })
    },
    [searchParams, setSearchParams]
  )

  /**
   * Define múltiplos parâmetros de uma vez
   * @param params - Objeto com chave-valor dos parâmetros
   */
  const setParams = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams)
      
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === '') {
          newParams.delete(key)
        } else {
          newParams.set(key, value)
        }
      })
      
      setSearchParams(newParams, { replace: true })
    },
    [searchParams, setSearchParams]
  )

  /**
   * Limpa todos os parâmetros da URL
   */
  const clearParams = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }, [setSearchParams])

  return {
    searchParams,
    getParam,
    setParam,
    setParams,
    clearParams
  }
}

