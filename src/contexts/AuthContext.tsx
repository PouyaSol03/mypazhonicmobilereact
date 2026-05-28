import { useCallback, useState, type ReactNode } from 'react'
import {
  getLatestUser,
  getStoredToken,
  logout as bridgeLogout,
  setStoredToken,
} from '../utils/androidBridge'
import type { UserInfo } from '../types/auth'
import { toUserInfo } from '../types/auth'
import { AuthContext, type AuthContextValue } from './authContextState'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [user, setUser] = useState<UserInfo | null>(() =>
    getStoredToken() ? toUserInfo(getLatestUser().user ?? null) : null
  )

  const refreshUser = useCallback(() => {
    if (!token) {
      setUser(null)
      return
    }
    const { user: u } = getLatestUser()
    setUser(toUserInfo(u ?? null))
  }, [token])

  const setSession = useCallback((newToken: string, userPayload?: Record<string, unknown> | null) => {
    setStoredToken(newToken)
    setToken(newToken)
    setUser(toUserInfo(userPayload ?? null))
  }, [])

  const logout = useCallback(() => {
    bridgeLogout()
    setStoredToken(null)
    setToken(null)
    setUser(null)
  }, [])

  const value: AuthContextValue = {
    token,
    user,
    loading: false,
    refreshUser,
    setSession,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
