import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AppThemeContext, type AppTheme, type AppThemeContextValue } from './appTheme'

const STORAGE_KEY = 'pazhonic_app_theme'

function readStoredTheme(): AppTheme {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>(readStoredTheme)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // WebView storage can be unavailable in restricted browsing modes.
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))
  }, [])

  const value = useMemo<AppThemeContextValue>(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>
}
