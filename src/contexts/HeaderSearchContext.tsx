import { useCallback, useRef, useState, type ReactNode } from 'react'
import { HeaderSearchContext, type HeaderSearchContextValue } from './headerSearchState'

export function HeaderSearchProvider({ children }: { children: ReactNode }) {
  const [showHeaderSearch, setShowHeaderSearch] = useState(false)
  const onClickRef = useRef<(() => void) | null>(null)
  const scrollToTopRef = useRef<(() => void) | null>(null)

  const setHeaderSearch = useCallback((show: boolean, onSearchClick?: () => void) => {
    setShowHeaderSearch(show)
    onClickRef.current = onSearchClick ?? null
  }, [])

  const setScrollToTop = useCallback((callback: (() => void) | null) => {
    scrollToTopRef.current = callback
  }, [])

  const onHeaderSearchClick = useCallback(() => {
    scrollToTopRef.current?.()
    onClickRef.current?.()
  }, [])

  const value: HeaderSearchContextValue = {
    showHeaderSearch,
    setHeaderSearch,
    setScrollToTop,
    onHeaderSearchClick,
  }

  return (
    <HeaderSearchContext.Provider value={value}>
      {children}
    </HeaderSearchContext.Provider>
  )
}
