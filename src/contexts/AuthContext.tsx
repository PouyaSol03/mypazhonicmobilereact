import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  getLatestUser,
  getStoredToken,
  logout as bridgeLogout,
  setStoredToken,
} from '../utils/androidBridge'
import type { UserInfo } from '../types/auth'
import { toUserInfo } from '../types/auth'

type AuthState = {
  token: string | null
  user: UserInfo | null
  loading: boolean
}

type AuthContextValue = AuthState & {
  refreshUser: () => void
  setSession: (token: string, user?: Record<string, unknown> | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(() => {
    if (!token) {
      setUser(null)
      return
    }
    const { user: u } = getLatestUser()
    setUser(toUserInfo(u ?? null))
  }, [token])

  useEffect(() => {
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    refreshUser()
    setLoading(false)
  }, [token, refreshUser])

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
    loading,
    refreshUser,
    setSession,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

/** Optional hook: returns auth context or null when outside provider (e.g. tests). */
export function useAuthOptional(): AuthContextValue | null {
  return useContext(AuthContext)
}
