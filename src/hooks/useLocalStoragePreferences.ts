/**
 * Hook useLocalStoragePreferences
 * Gerencia persistência de preferências do usuário no localStorage
 */

import { useState, useEffect, useCallback } from 'react'

/**
 * Hook genérico para gerenciar preferências no localStorage
 * @param key - Chave do localStorage
 * @param defaultValue - Valor padrão se não houver dados salvos
 * @returns [valor, setValue, clearValue]
 */
export function useLocalStoragePreferences<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void, () => void] {
  // Estado inicial: tenta carregar do localStorage
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Erro ao carregar preferências (${key}):`, error)
      return defaultValue
    }
  })

  // Atualiza localStorage quando o valor muda
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Erro ao salvar preferências (${key}):`, error)
    }
  }, [key, value])

  // Função para limpar as preferências
  const clearValue = useCallback(() => {
    try {
      localStorage.removeItem(key)
      setValue(defaultValue)
      console.log(`✅ Preferências limpas: ${key}`)
    } catch (error) {
      console.error(`Erro ao limpar preferências (${key}):`, error)
    }
  }, [key, defaultValue])

  return [value, setValue, clearValue]
}

