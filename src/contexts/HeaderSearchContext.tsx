import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

interface HeaderSearchContextValue {
  showHeaderSearch: boolean
  setHeaderSearch: (show: boolean, onSearchClick?: () => void) => void
  scrollToTopRef: React.MutableRefObject<(() => void) | null>
  onHeaderSearchClick: () => void
}

const HeaderSearchContext = createContext<HeaderSearchContextValue | null>(null)

export function HeaderSearchProvider({ children }: { children: ReactNode }) {
  const [showHeaderSearch, setShowHeaderSearch] = useState(false)
  const onClickRef = useRef<(() => void) | null>(null)
  const scrollToTopRef = useRef<(() => void) | null>(null)

  const setHeaderSearch = useCallback((show: boolean, onSearchClick?: () => void) => {
    setShowHeaderSearch(show)
    onClickRef.current = onSearchClick ?? null
  }, [])

  const onHeaderSearchClick = useCallback(() => {
    scrollToTopRef.current?.()
    onClickRef.current?.()
  }, [])

  const value: HeaderSearchContextValue = {
    showHeaderSearch,
    setHeaderSearch,
    scrollToTopRef,
    onHeaderSearchClick,
  }

  return (
    <HeaderSearchContext.Provider value={value}>
      {children}
    </HeaderSearchContext.Provider>
  )
}

export function useHeaderSearch() {
  return useContext(HeaderSearchContext)
}