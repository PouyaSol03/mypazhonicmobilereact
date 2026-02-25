/**
 * Android WebView bridge (window.AndroidBridge).
 * Safe to use in browser: when bridge is missing, methods return null or throw with a clear message.
 */

declare global {
  interface Window {
    AndroidBridge?: {
      registerUser(userJson: string): string
      login(phoneNumber: string, password: string): string
      getSessionToken(): string
      getLatestUser(): string
      logout(): void
      setBiometricEnabled(enabled: string): void
      getBiometricEnabled(): string
      /** Async: calls callback with result JSON string. callback(JSON.stringify({ success, token?, user?, error? })) */
      loginWithBiometric(callbackJsName: string): void
      onReactReady?(): void
    }
  }
}

const getBridge = () => {
  if (typeof window === 'undefined' || !window.AndroidBridge) return null
  return window.AndroidBridge
}

export const isAndroidBridgeAvailable = () => !!getBridge()

/** Register user. Payload: { userName, phoneNumber, password, fullName?, firstName?, lastName?, nationalCode?, avatarUrl?, ipAddress? } */
export function registerUser(payload: {
  userName: string
  phoneNumber: string
  password: string
  fullName?: string
  firstName?: string
  lastName?: string
  nationalCode?: string
  avatarUrl?: string
  ipAddress?: string
}): { success: boolean; error?: string } {
  const bridge = getBridge()
  if (!bridge) return { success: false, error: 'Bridge not available' }
  try {
    const json = bridge.registerUser(JSON.stringify(payload))
    const result = JSON.parse(json) as { success: boolean; error?: string }
    return result
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { success: false, error: message }
  }
}

/** Login. Returns { success, token?, user?, error? } */
export function login(
  phoneNumber: string,
  password: string
): { success: boolean; token?: string; user?: Record<string, unknown>; error?: string } {
  const bridge = getBridge()
  if (!bridge) return { success: false, error: 'Bridge not available' }
  try {
    const json = bridge.login(phoneNumber, password)
    const result = JSON.parse(json) as {
      success: boolean
      token?: string
      user?: Record<string, unknown>
      error?: string
    }
    return result
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { success: false, error: message }
  }
}

/** Get current session token. Returns { token: string | null } */
export function getSessionToken(): { token: string | null; error?: string } {
  const bridge = getBridge()
  if (!bridge) return { token: null }
  try {
    const json = bridge.getSessionToken()
    const result = JSON.parse(json) as { token: string | null; error?: string }
    return result
  } catch {
    return { token: null }
  }
}

/** Get current user (only when session is valid). Returns { user: object | null } */
export function getLatestUser(): { user: Record<string, unknown> | null; error?: string } {
  const bridge = getBridge()
  if (!bridge) return { user: null }
  try {
    const json = bridge.getLatestUser()
    const result = JSON.parse(json) as { user: Record<string, unknown> | null; error?: string }
    return result
  } catch {
    return { user: null }
  }
}

/** Log out and clear session */
export function logout(): void {
  const bridge = getBridge()
  if (bridge) bridge.logout()
}

const TOKEN_KEY = 'pazhonic_session_token'

/** Persist token in localStorage (for React state restore). Only when bridge is available. */
export function setStoredToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

/** Read token from localStorage */
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/** Get whether biometric login is enabled (from Android prefs). */
export function getBiometricEnabled(): boolean {
  const bridge = getBridge()
  if (!bridge) return false
  try {
    return bridge.getBiometricEnabled() === 'true'
  } catch {
    return false
  }
}

/** Set biometric login enabled (persists on Android). */
export function setBiometricEnabled(enabled: boolean): void {
  const bridge = getBridge()
  if (bridge) bridge.setBiometricEnabled(enabled ? 'true' : 'false')
}

/**
 * Start biometric login. Async: shows system biometric prompt, then calls onResult with parsed result.
 * onResult receives { success, token?, user?, error? } same shape as login().
 */
export function loginWithBiometric(
  onResult: (result: {
    success: boolean
    token?: string
    user?: Record<string, unknown>
    error?: string
  }) => void
): void {
  const bridge = getBridge()
  if (!bridge) {
    onResult({ success: false, error: 'Bridge not available' })
    return
  }
  const callbackName = `__biometricLogin_${Date.now()}__`
  const win = window as unknown as Record<string, unknown>
  const cleanup = () => {
    try {
      delete win[callbackName]
    } catch {}
  }
  win[callbackName] = (jsonStr: string) => {
    cleanup()
    try {
      const parsed = JSON.parse(jsonStr) as {
        success: boolean
        token?: string
        user?: Record<string, unknown>
        error?: string
      }
      onResult(parsed)
    } catch {
      onResult({ success: false, error: 'پاسخ نامعتبر' })
    }
  }
  bridge.loginWithBiometric(callbackName)
}
