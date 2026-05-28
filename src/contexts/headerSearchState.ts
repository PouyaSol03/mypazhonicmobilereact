import { createContext } from 'react'

export interface HeaderSearchContextValue {
  showHeaderSearch: boolean
  setHeaderSearch: (show: boolean, onSearchClick?: () => void) => void
  setScrollToTop: (callback: (() => void) | null) => void
  onHeaderSearchClick: () => void
}

export const HeaderSearchContext = createContext<HeaderSearchContextValue | null>(null)
