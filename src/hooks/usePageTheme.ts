import { useCallback, useState } from 'react'

type Theme = 'light' | 'dark'

/**
 * Hook para gerenciar tema de forma isolada por página.
 * Não afeta o tema global da aplicação nem a classe do <html>.
 * Cada página usa sua própria chave no localStorage.
 *
 * @param pageKey - Identificador único da página (ex.: 'dashboard-linha')
 */
export function usePageTheme(pageKey: string) {
  const storageKey = `sysoee-theme-${pageKey}`

  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey) as Theme | null
      if (saved === 'light' || saved === 'dark') return saved
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
    }
    return 'light'
  })

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme)
      localStorage.setItem(storageKey, newTheme)
    },
    [storageKey]
  )

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem(storageKey, next)
      return next
    })
  }, [storageKey])

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
  }
}
