import { useCallback, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'sysoee-theme'
const VOLTAR_FORCE_LIGHT_KEY = 'sysoee-voltar-force-light'

/**
 * Hook para gerenciar o tema da aplicação (claro/escuro)
 * Persiste a preferência no localStorage e sincroniza com a classe CSS
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Verificar preferência salva no localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
      if (saved === 'light' || saved === 'dark') {
        return saved
      }
      // Verificar preferência do sistema operacional
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark'
      }
    }
    return 'light'
  })

  // Aplicar a classe dark no documento (respeitando flag "voltar = light sem persistir")
  useEffect(() => {
    const root = window.document.documentElement
    if (sessionStorage.getItem(VOLTAR_FORCE_LIGHT_KEY)) {
      root.classList.remove('dark')
      sessionStorage.removeItem(VOLTAR_FORCE_LIGHT_KEY)
      return
    }
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  // Escutar mudanças na preferência do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
      // Só atualiza automaticamente se o usuário não tiver escolhido manualmente
      if (!savedTheme) {
        setThemeState(event.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  /** Força modo light apenas visualmente na próxima página, sem persistir (ex.: botão Voltar do Dashboard). */
  const forceLightForNextPage = useCallback(() => {
    if (typeof window === 'undefined') return
    window.document.documentElement.classList.remove('dark')
    sessionStorage.setItem(VOLTAR_FORCE_LIGHT_KEY, '1')
  }, [])

  return {
    theme,
    setTheme,
    toggleTheme,
    forceLightForNextPage,
    isDark: theme === 'dark'
  }
}
