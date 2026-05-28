import { getDevelopmentBridge } from './developmentBridge'

/**
 * Android WebView bridge (window.AndroidBridge).
 * Vite development mode uses a browser-backed adapter and never calls Android.
 * Production builds use the injected Android bridge when it is available.
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
      /** Locations: type = "COUNTRY"|"STATE"|"COUNTY"|"CITY". Returns JSON { locations: [...], error? } */
      getLocationsByType(type: string): string
      getLocationsByParentId(parentId: string): string
      getLocationsByTypeAndParent(type: string, parentId: string): string
      getCitiesByStateId(stateId: string): string
      /** Panels & folders (current user). */
      getPanelsForUser(): string
      getPanelsByFolder(folderIdJson: string): string
      createPanel(panelJson: string): string
      updatePanel(panelJson: string): string
      deletePanel(panelId: string): string
      setPanelFolder(panelId: string, folderId: string): string
      setPanelLastStatus(panelId: string, lastStatus: string): string
      getFolders(): string
      createFolder(name: string): string
      updateFolder(folderId: string, name: string): string
      deleteFolder(folderId: string): string
      /** Get panel serial number via TCP. codeUD, ip, port (string). Returns JSON { serialNumber } or { error }. */
      getSerialNumber(codeUD: string, ip: string, port: string): string
      /** WiFi panel TCP operations. panelJson must include ip, port, serialNumber, codeUD. */
      wifiSendData(panelJson: string, code: string, tabCode: string): string
      wifiReceiveData(panelJson: string, code: string, tabCode: string, count: string): string
      wifiSendCommand(panelJson: string, message: string): string
      updateProfile(profileJson: string): string
      changePassword(currentPassword: string, newPassword: string): string
      getPreference(key: string, defaultValue: string): string
      setPreference(key: string, value: string): string
      sendSupportTicket(subject: string, message: string): string
      clearAppCache(): string
      copyText(text: string): string
      shareText(title: string, text: string): string
      shareBackup(): string
      getStorageSummary(): string
      getActivityLogs(): string
      onReactReady?(): void
    }
  }
}

export type AndroidBridgeApi = NonNullable<Window['AndroidBridge']>

/** Location item from bridge (id, name, type, parentId, code?, sortOrder). */
export type BridgeLocation = {
  id: number
  name: string
  type: 'COUNTRY' | 'STATE' | 'COUNTY' | 'CITY'
  parentId: number | null
  code?: string
  sortOrder: number
}

/** Panel from bridge (matches PanelEntity). */
export type BridgePanel = {
  id: number
  userId: number
  folderId: number | null
  icon: string | null
  name: string
  gsmPhone: string | null
  ip: string | null
  port: number | null
  code: string | null
  description: string | null
  serialNumber: string | null
  isActive: boolean
  locationId: number | null
  codeUD: string | null
  /** Last alarm status from panel: "ARM" | "DISARM", null when never connected. */
  lastStatus: string | null
  createdAt: number
  updatedAt: number
}

/** Folder (category) from bridge. */
export type BridgeFolder = {
  id: number
  userId: number
  name: string
  sortOrder: number
}

export type BridgeActivityLog = {
  id: number
  label: string
  detail: string
  tone: 'success' | 'warning' | 'info'
  timestamp: number
}

const getBridge = (): AndroidBridgeApi | null => {
  if (typeof window === 'undefined') return null
  if (import.meta.env.DEV) return getDevelopmentBridge()
  if (!window.AndroidBridge) return null
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

/** Result shape for location bridge calls. */
export type LocationsResult = { locations: BridgeLocation[]; error?: string }

function parseLocationsResponse(json: string): LocationsResult {
  try {
    const data = JSON.parse(json) as { locations?: BridgeLocation[]; error?: string }
    return { locations: data.locations ?? [], error: data.error }
  } catch {
    return { locations: [], error: 'پاسخ نامعتبر' }
  }
}

/** Get all locations of a type (e.g. "STATE" for provinces). */
export function getLocationsByType(type: string): LocationsResult {
  const bridge = getBridge()
  if (!bridge) return { locations: [] }
  return parseLocationsResponse(bridge.getLocationsByType(type))
}

/** Get direct children of a parent (e.g. parentId "1" for states of Iran, "10" for counties of Tehran). */
export function getLocationsByParentId(parentId: string): LocationsResult {
  const bridge = getBridge()
  if (!bridge) return { locations: [] }
  return parseLocationsResponse(bridge.getLocationsByParentId(parentId))
}

/** Get all cities under a state (State → County → City). */
export function getCitiesByStateId(stateId: string): LocationsResult {
  const bridge = getBridge()
  if (!bridge) return { locations: [] }
  return parseLocationsResponse(bridge.getCitiesByStateId(stateId))
}

/** Get locations of given type with specific parent (e.g. type "STATE", parentId "1"). */
export function getLocationsByTypeAndParent(type: string, parentId: string): LocationsResult {
  const bridge = getBridge()
  if (!bridge) return { locations: [] }
  return parseLocationsResponse(bridge.getLocationsByTypeAndParent(type, parentId))
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
    } catch {
      // The host may expose callback properties that cannot be deleted.
    }
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

// --- Panels & folders ---

export type PanelsResult = { panels: BridgePanel[]; error?: string }
export type FoldersResult = { folders: BridgeFolder[]; error?: string }

function parsePanelsResponse(json: string): PanelsResult {
  try {
    const data = JSON.parse(json) as { panels?: BridgePanel[]; error?: string }
    return { panels: data.panels ?? [], error: data.error }
  } catch {
    return { panels: [], error: 'پاسخ نامعتبر' }
  }
}

function parseFoldersResponse(json: string): FoldersResult {
  try {
    const data = JSON.parse(json) as { folders?: BridgeFolder[]; error?: string }
    return { folders: data.folders ?? [], error: data.error }
  } catch {
    return { folders: [], error: 'پاسخ نامعتبر' }
  }
}

export function getPanelsForUser(): PanelsResult {
  const bridge = getBridge()
  if (!bridge) return { panels: [] }
  return parsePanelsResponse(bridge.getPanelsForUser())
}

/** folderId: empty string or "null" = uncategorized; number string = that folder. */
export function getPanelsByFolder(folderId: string): PanelsResult {
  const bridge = getBridge()
  if (!bridge) return { panels: [] }
  return parsePanelsResponse(bridge.getPanelsByFolder(folderId === '' ? 'null' : folderId))
}

export function createPanel(payload: Partial<BridgePanel> & { name: string }): { success: boolean; id?: number; error?: string } {
  const bridge = getBridge()
  if (!bridge) return { success: false, error: 'Bridge not available' }
  try {
    const json = bridge.createPanel(JSON.stringify(payload))
    const data = JSON.parse(json) as { success?: boolean; id?: number; error?: string }
    return { success: !!data.success, id: data.id, error: data.error }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export function updatePanel(payload: BridgePanel): { success: boolean; error?: string } {
  const bridge = getBridge()
  if (!bridge) return { success: false, error: 'Bridge not available' }
  try {
    const json = bridge.updatePanel(JSON.stringify(payload))
    const data = JSON.parse(json) as { success?: boolean; error?: string }
    return { success: !!data.success, error: data.error }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export function deletePanel(panelId: string | number): { success: boolean; error?: string } {
  const bridge = getBridge()
  if (!bridge) return { success: false, error: 'Bridge not available' }
  try {
    const json = bridge.deletePanel(String(panelId))
    const data = JSON.parse(json) as { success?: boolean; error?: string }
    return { success: !!data.success, error: data.error }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export function setPanelFolder(panelId: string | number, folderId: string | number | null): { success: boolean; error?: string } {
  const bridge = getBridge()
  if (!bridge) return { success: false, error: 'Bridge not available' }
  try {
    const json = bridge.setPanelFolder(String(panelId), folderId == null ? '' : String(folderId))
    const data = JSON.parse(json) as { success?: boolean; error?: string }
    return { success: !!data.success, error: data.error }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

/** Set last alarm status (e.g. "ARM", "DISARM") after connecting to panel. */
export function setPanelLastStatus(panelId: string | number, lastStatus: string): { success: boolean; error?: string } {
  const bridge = getBridge()
  if (!bridge) return { success: false, error: 'Bridge not available' }
  try {
    const json = bridge.setPanelLastStatus(String(panelId), lastStatus)
    const data = JSON.parse(json) as { success?: boolean; error?: string }
    return { success: !!data.success, error: data.error }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export function getFolders(): FoldersResult {
  const bridge = getBridge()
  if (!bridge) return { folders: [] }
  return parseFoldersResponse(bridge.getFolders())
}

export function createFolder(name: string): { success: boolean; id?: number; error?: string } {
  const bridge = getBridge()
  if (!bridge) return { success: false, error: 'Bridge not available' }
  try {
    const json = bridge.createFolder(name)
    const data = JSON.parse(json) as { success?: boolean; id?: number; error?: string }
    return { success: !!data.success, id: data.id, error: data.error }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export function updateFolder(folderId: string | number, name: string): { success: boolean; error?: string } {
  const bridge = getBridge()
  if (!bridge) return { success: false, error: 'Bridge not available' }
  try {
    const json = bridge.updateFolder(String(folderId), name)
    const data = JSON.parse(json) as { success?: boolean; error?: string }
    return { success: !!data.success, error: data.error }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export function deleteFolder(folderId: string | number): { success: boolean; error?: string } {
  const bridge = getBridge()
  if (!bridge) return { success: false, error: 'Bridge not available' }
  try {
    const json = bridge.deleteFolder(String(folderId))
    const data = JSON.parse(json) as { success?: boolean; error?: string }
    return { success: !!data.success, error: data.error }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

type BridgeActionResult = { success: boolean; error?: string }

export type WifiPanelBridgeResult = {
  success: boolean
  request?: string
  response?: string
  chunks?: string[]
  chunkCount?: number
  error?: string
}

function parseActionResult(raw: string): BridgeActionResult {
  try {
    const data = JSON.parse(raw) as BridgeActionResult
    return { success: !!data.success, error: data.error }
  } catch {
    return { success: false, error: 'پاسخ نامعتبر از برنامه میزبان' }
  }
}

export function getPreference(key: string, defaultValue = ''): string {
  const bridge = getBridge()
  if (!bridge?.getPreference) return defaultValue
  try {
    const data = JSON.parse(bridge.getPreference(key, defaultValue)) as { success?: boolean; value?: string }
    return data.value ?? defaultValue
  } catch {
    return defaultValue
  }
}

export function getBooleanPreference(key: string, defaultValue: boolean): boolean {
  return getPreference(key, String(defaultValue)) === 'true'
}

export function setPreference(key: string, value: string | boolean): BridgeActionResult {
  const bridge = getBridge()
  if (!bridge?.setPreference) return { success: false, error: 'Bridge not available' }
  return parseActionResult(bridge.setPreference(key, String(value)))
}

export function updateProfile(payload: {
  fullName: string
  phoneNumber: string
  email?: string
  avatarUrl?: string
}): { success: boolean; user?: Record<string, unknown>; error?: string } {
  const bridge = getBridge()
  if (!bridge?.updateProfile) return { success: false, error: 'Bridge not available' }
  try {
    const data = JSON.parse(bridge.updateProfile(JSON.stringify(payload))) as {
      success?: boolean
      user?: Record<string, unknown>
      error?: string
    }
    return { success: !!data.success, user: data.user, error: data.error }
  } catch {
    return { success: false, error: 'پاسخ نامعتبر از برنامه میزبان' }
  }
}

export function changePassword(currentPassword: string, newPassword: string): BridgeActionResult {
  const bridge = getBridge()
  if (!bridge?.changePassword) return { success: false, error: 'Bridge not available' }
  return parseActionResult(bridge.changePassword(currentPassword, newPassword))
}

export function sendSupportTicket(subject: string, message: string): BridgeActionResult {
  const bridge = getBridge()
  if (!bridge?.sendSupportTicket) return { success: false, error: 'Bridge not available' }
  return parseActionResult(bridge.sendSupportTicket(subject, message))
}

export function clearAppCache(): BridgeActionResult {
  const bridge = getBridge()
  if (!bridge?.clearAppCache) return { success: false, error: 'Bridge not available' }
  return parseActionResult(bridge.clearAppCache())
}

export function copyText(text: string): BridgeActionResult {
  const bridge = getBridge()
  if (!bridge?.copyText) return { success: false, error: 'Bridge not available' }
  return parseActionResult(bridge.copyText(text))
}

export function shareText(title: string, text: string): BridgeActionResult {
  const bridge = getBridge()
  if (!bridge?.shareText) return { success: false, error: 'Bridge not available' }
  return parseActionResult(bridge.shareText(title, text))
}

export function shareBackup(): BridgeActionResult {
  const bridge = getBridge()
  if (!bridge?.shareBackup) return { success: false, error: 'Bridge not available' }
  return parseActionResult(bridge.shareBackup())
}

export function getStorageSummary(): { success: boolean; panels: number; folders: number; error?: string } {
  const bridge = getBridge()
  if (!bridge?.getStorageSummary) return { success: false, panels: 0, folders: 0, error: 'Bridge not available' }
  try {
    const data = JSON.parse(bridge.getStorageSummary()) as { success?: boolean; panels?: number; folders?: number; error?: string }
    return { success: !!data.success, panels: data.panels ?? 0, folders: data.folders ?? 0, error: data.error }
  } catch {
    return { success: false, panels: 0, folders: 0, error: 'پاسخ نامعتبر از برنامه میزبان' }
  }
}

export function getActivityLogs(): { success: boolean; logs: BridgeActivityLog[]; error?: string } {
  const bridge = getBridge()
  if (!bridge?.getActivityLogs) return { success: false, logs: [], error: 'Bridge not available' }
  try {
    const data = JSON.parse(bridge.getActivityLogs()) as { success?: boolean; logs?: BridgeActivityLog[]; error?: string }
    return { success: !!data.success, logs: data.logs ?? [], error: data.error }
  } catch {
    return { success: false, logs: [], error: 'پاسخ نامعتبر از برنامه میزبان' }
  }
}

/** Result of getSerialNumber: either serial number or error. */
export type GetSerialNumberResult =
  | { serialNumber: string; error?: undefined }
  | { serialNumber: null; error: string }

/** Get panel serial number from device via TCP. Requires codeUD, ip, port (from CreatePanel form). */
export function getSerialNumber(
  codeUD: string,
  ip: string,
  port: string | number
): GetSerialNumberResult {
  const bridge = getBridge()
  if (!bridge?.getSerialNumber) return { serialNumber: null, error: 'پل در دسترس نیست' }
  try {
    const portStr = typeof port === 'number' ? String(port) : String(port).trim()
    const raw = bridge.getSerialNumber(codeUD.trim(), ip.trim(), portStr)
    const data = JSON.parse(raw) as { serialNumber?: string | null; error?: string }
    if (data.error) return { serialNumber: null, error: data.error }
    if (data.serialNumber != null && data.serialNumber !== '') {
      return { serialNumber: data.serialNumber }
    }
    return { serialNumber: null, error: 'پاسخ نامعتبر' }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { serialNumber: null, error: message }
  }
}

function panelPayloadForWifi(panel: {
  ip?: string | null
  port?: number | string | null
  serialNumber?: string | null
  codeUD?: string | null
}): string {
  return JSON.stringify({
    ip: panel.ip ?? '',
    port: panel.port ?? '',
    serialNumber: panel.serialNumber ?? '',
    codeUD: panel.codeUD ?? '',
  })
}

function parseWifiResult(raw: string): WifiPanelBridgeResult {
  try {
    const data = JSON.parse(raw) as WifiPanelBridgeResult
    return {
      success: !!data.success,
      request: data.request,
      response: data.response,
      chunks: Array.isArray(data.chunks) ? data.chunks : [],
      chunkCount: data.chunkCount ?? 0,
      error: data.error,
    }
  } catch {
    return { success: false, error: 'پاسخ نامعتبر از برنامه میزبان' }
  }
}

export function wifiSendData(
  panel: { ip?: string | null; port?: number | string | null; serialNumber?: string | null; codeUD?: string | null },
  code: string | number,
  tabCode?: string | number | null
): WifiPanelBridgeResult {
  const bridge = getBridge()
  if (!bridge?.wifiSendData) return { success: false, error: 'Bridge not available' }
  return parseWifiResult(bridge.wifiSendData(panelPayloadForWifi(panel), String(code), tabCode == null ? '' : String(tabCode)))
}

export function wifiReceiveData(
  panel: { ip?: string | null; port?: number | string | null; serialNumber?: string | null; codeUD?: string | null },
  code: string | number,
  tabCode?: string | number | null,
  count?: string | number | null
): WifiPanelBridgeResult {
  const bridge = getBridge()
  if (!bridge?.wifiReceiveData) return { success: false, error: 'Bridge not available' }
  return parseWifiResult(
    bridge.wifiReceiveData(
      panelPayloadForWifi(panel),
      String(code),
      tabCode == null ? '' : String(tabCode),
      count == null ? '' : String(count),
    ),
  )
}

export function wifiSendCommand(
  panel: { ip?: string | null; port?: number | string | null; serialNumber?: string | null; codeUD?: string | null },
  message: string
): WifiPanelBridgeResult {
  const bridge = getBridge()
  if (!bridge?.wifiSendCommand) return { success: false, error: 'Bridge not available' }
  return parseWifiResult(bridge.wifiSendCommand(panelPayloadForWifi(panel), message))
}
