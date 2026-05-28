import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from '../contexts/authContextState'

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export function useAuthOptional(): AuthContextValue | null {
  return useContext(AuthContext)
}
