import { useContext } from 'react'
import { HeaderSearchContext } from '../contexts/headerSearchState'

export function useHeaderSearch() {
  return useContext(HeaderSearchContext)
}
