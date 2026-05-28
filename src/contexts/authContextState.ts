import { createContext } from 'react'
import type { UserInfo } from '../types/auth'

export type AuthState = {
  token: string | null
  user: UserInfo | null
  loading: boolean
}

export type AuthContextValue = AuthState & {
  refreshUser: () => void
  setSession: (token: string, user?: Record<string, unknown> | null) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
