import type {
  AndroidBridgeApi,
  BridgeFolder,
  BridgeLocation,
  BridgePanel,
} from './androidBridge'

type DevelopmentUser = {
  id: number
  userName: string
  phoneNumber: string
  password: string
  fullName?: string
  firstName?: string
  lastName?: string
  nationalCode?: string
  avatarUrl?: string
  email?: string
}

type DevelopmentState = {
  users: DevelopmentUser[]
  lastUserId: number | null
  sessionToken: string | null
  biometricEnabled: boolean
  preferences: Record<string, string>
  logs: Array<{ id: number; label: string; detail: string; tone: 'success' | 'warning' | 'info'; timestamp: number }>
  folders: BridgeFolder[]
  panels: BridgePanel[]
  nextUserId: number
  nextFolderId: number
  nextPanelId: number
}

const STORAGE_KEY = 'pazhonic_development_bridge'

const locations: BridgeLocation[] = [
  { id: 1, name: 'Iran', type: 'COUNTRY', parentId: null, sortOrder: 1 },
  { id: 11, name: 'Tehran', type: 'STATE', parentId: 1, sortOrder: 1 },
  { id: 12, name: 'Fars', type: 'STATE', parentId: 1, sortOrder: 2 },
  { id: 111, name: 'Tehran', type: 'CITY', parentId: 11, sortOrder: 1 },
  { id: 112, name: 'Shemiranat', type: 'CITY', parentId: 11, sortOrder: 2 },
  { id: 121, name: 'Shiraz', type: 'CITY', parentId: 12, sortOrder: 1 },
]

function initialState(): DevelopmentState {
  const now = Date.now()
  return {
    users: [
      {
        id: 1,
        userName: 'debug',
        phoneNumber: '09120000000',
        password: 'debug',
        fullName: 'Debug User',
      },
    ],
    lastUserId: 1,
    sessionToken: null,
    biometricEnabled: false,
    preferences: {},
    logs: [],
    folders: [
      { id: 1, userId: 1, name: 'Home', sortOrder: 1 },
      { id: 2, userId: 1, name: 'Office', sortOrder: 2 },
    ],
    panels: [
      {
        id: 1,
        userId: 1,
        folderId: 1,
        icon: 'home',
        name: 'Home alarm',
        gsmPhone: '09120000001',
        ip: '192.168.1.20',
        port: 8080,
        code: null,
        description: null,
        serialNumber: 'DEV-100001',
        isActive: true,
        locationId: 111,
        codeUD: 'HOME01',
        lastStatus: 'DISARM',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        userId: 1,
        folderId: 2,
        icon: 'building',
        name: 'Office panel',
        gsmPhone: '09120000002',
        ip: '192.168.1.30',
        port: 8080,
        code: null,
        description: null,
        serialNumber: 'DEV-100002',
        isActive: true,
        locationId: 111,
        codeUD: 'OFFICE01',
        lastStatus: 'ARM',
        createdAt: now,
        updatedAt: now,
      },
    ],
    nextUserId: 2,
    nextFolderId: 3,
    nextPanelId: 3,
  }
}

function readState(): DevelopmentState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const state = JSON.parse(stored) as DevelopmentState
      state.preferences ??= {}
      state.logs ??= []
      return state
    }
  } catch {
    // Fall through to clean development data if local storage was cleared or invalid.
  }
  const state = initialState()
  writeState(state)
  return state
}

function writeState(state: DevelopmentState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function json(value: unknown): string {
  return JSON.stringify(value)
}

function toPublicUser(user: DevelopmentUser): Record<string, unknown> {
  return {
    userName: user.userName,
    phoneNumber: user.phoneNumber,
    fullName: user.fullName,
    firstName: user.firstName,
    lastName: user.lastName,
    nationalCode: user.nationalCode,
    avatarUrl: user.avatarUrl,
  }
}

function currentUser(state: DevelopmentState): DevelopmentUser | null {
  if (!state.sessionToken || state.lastUserId == null) return null
  return state.users.find((user) => user.id === state.lastUserId) ?? null
}

function makeSession(state: DevelopmentState, user: DevelopmentUser): string {
  const token = `debug-session-${user.id}-${Date.now()}`
  state.lastUserId = user.id
  state.sessionToken = token
  return token
}

function findPanel(state: DevelopmentState, panelId: string): BridgePanel | undefined {
  return state.panels.find((panel) => panel.id === Number(panelId))
}

function appendLog(
  state: DevelopmentState,
  label: string,
  detail: string,
  tone: 'success' | 'warning' | 'info' = 'success'
): void {
  state.logs = [{ id: Date.now(), label, detail, tone, timestamp: Date.now() }, ...(state.logs ?? [])].slice(0, 20)
}

let bridge: AndroidBridgeApi | undefined

export function getDevelopmentBridge(): AndroidBridgeApi {
  if (bridge) return bridge

  bridge = {
    registerUser(userJson) {
      const payload = JSON.parse(userJson) as {
        userName: string
        phoneNumber: string
        password: string
        fullName?: string
        firstName?: string
        lastName?: string
        nationalCode?: string
        avatarUrl?: string
      }
      const state = readState()
      if (state.users.some((user) => user.phoneNumber === payload.phoneNumber)) {
        return json({ success: false, error: 'This phone number is already registered in debug data.' })
      }
      state.users.push({ id: state.nextUserId++, ...payload })
      appendLog(state, 'ثبت نام', payload.phoneNumber)
      writeState(state)
      return json({ success: true })
    },

    login(phoneNumber, password) {
      const state = readState()
      let user = state.users.find((entry) => entry.phoneNumber === phoneNumber)
      if (user && user.password !== password) {
        return json({ success: false, error: 'Invalid debug password.' })
      }
      if (!user) {
        user = {
          id: state.nextUserId++,
          userName: phoneNumber,
          phoneNumber,
          password,
          fullName: 'Debug User',
        }
        state.users.push(user)
      }
      const token = makeSession(state, user)
      appendLog(state, 'ورود به حساب', user.phoneNumber)
      writeState(state)
      return json({ success: true, token, user: toPublicUser(user) })
    },

    getSessionToken() {
      return json({ token: readState().sessionToken })
    },

    getLatestUser() {
      const user = currentUser(readState())
      return json({ user: user ? toPublicUser(user) : null })
    },

    logout() {
      const state = readState()
      state.sessionToken = null
      appendLog(state, 'خروج از حساب', 'نشست کاربری بسته شد', 'info')
      writeState(state)
    },

    setBiometricEnabled(enabled) {
      const state = readState()
      state.biometricEnabled = enabled === 'true'
      appendLog(state, 'ورود بیومتریک', state.biometricEnabled ? 'فعال شد' : 'غیرفعال شد')
      writeState(state)
    },

    getBiometricEnabled() {
      return String(readState().biometricEnabled)
    },

    loginWithBiometric(callbackJsName) {
      const state = readState()
      const user = state.users.find((entry) => entry.id === state.lastUserId) ?? state.users[0]
      const token = makeSession(state, user)
      writeState(state)
      const callback = (window as unknown as Record<string, unknown>)[callbackJsName]
      if (typeof callback === 'function') {
        callback(json({ success: true, token, user: toPublicUser(user) }))
      }
    },

    getLocationsByType(type) {
      return json({ locations: locations.filter((location) => location.type === type) })
    },

    getLocationsByParentId(parentId) {
      return json({ locations: locations.filter((location) => location.parentId === Number(parentId)) })
    },

    getLocationsByTypeAndParent(type, parentId) {
      return json({
        locations: locations.filter(
          (location) => location.type === type && location.parentId === Number(parentId)
        ),
      })
    },

    getCitiesByStateId(stateId) {
      return json({
        locations: locations.filter(
          (location) => location.type === 'CITY' && location.parentId === Number(stateId)
        ),
      })
    },

    getPanelsForUser() {
      return json({ panels: readState().panels })
    },

    getPanelsByFolder(folderId) {
      const selectedFolderId = folderId === 'null' || folderId === '' ? null : Number(folderId)
      return json({
        panels: readState().panels.filter((panel) => panel.folderId === selectedFolderId),
      })
    },

    createPanel(panelJson) {
      const payload = JSON.parse(panelJson) as Partial<BridgePanel> & { name: string }
      const state = readState()
      const now = Date.now()
      const panel: BridgePanel = {
        id: state.nextPanelId++,
        userId: state.lastUserId ?? 1,
        folderId: payload.folderId ?? null,
        icon: payload.icon ?? null,
        name: payload.name,
        gsmPhone: payload.gsmPhone ?? null,
        ip: payload.ip ?? null,
        port: payload.port ?? null,
        code: payload.code ?? null,
        description: payload.description ?? null,
        serialNumber: payload.serialNumber ?? null,
        isActive: payload.isActive ?? true,
        locationId: payload.locationId ?? null,
        codeUD: payload.codeUD ?? null,
        lastStatus: payload.lastStatus ?? null,
        createdAt: now,
        updatedAt: now,
      }
      state.panels.push(panel)
      appendLog(state, 'ثبت پنل', panel.name)
      writeState(state)
      return json({ success: true, id: panel.id })
    },

    updatePanel(panelJson) {
      const payload = JSON.parse(panelJson) as BridgePanel
      const state = readState()
      const panel = findPanel(state, String(payload.id))
      if (!panel) return json({ success: false, error: 'Debug panel was not found.' })
      Object.assign(panel, payload, {
        userId: panel.userId,
        createdAt: panel.createdAt,
        updatedAt: Date.now(),
      })
      appendLog(state, 'ویرایش پنل', panel.name)
      writeState(state)
      return json({ success: true })
    },

    deletePanel(panelId) {
      const state = readState()
      const before = state.panels.length
      state.panels = state.panels.filter((panel) => panel.id !== Number(panelId))
      if (state.panels.length !== before) appendLog(state, 'حذف پنل', `شناسه ${panelId}`)
      writeState(state)
      return json({ success: state.panels.length !== before })
    },

    setPanelFolder(panelId, folderId) {
      const state = readState()
      const panel = findPanel(state, panelId)
      if (!panel) return json({ success: false, error: 'Debug panel was not found.' })
      panel.folderId = folderId === '' ? null : Number(folderId)
      panel.updatedAt = Date.now()
      appendLog(state, 'انتقال پنل', panel.name)
      writeState(state)
      return json({ success: true })
    },

    setPanelLastStatus(panelId, lastStatus) {
      const state = readState()
      const panel = findPanel(state, panelId)
      if (!panel) return json({ success: false, error: 'Debug panel was not found.' })
      panel.lastStatus = lastStatus
      panel.updatedAt = Date.now()
      writeState(state)
      return json({ success: true })
    },

    getFolders() {
      return json({ folders: readState().folders })
    },

    createFolder(name) {
      const state = readState()
      const folder: BridgeFolder = {
        id: state.nextFolderId++,
        userId: state.lastUserId ?? 1,
        name,
        sortOrder: state.folders.length + 1,
      }
      state.folders.push(folder)
      appendLog(state, 'ایجاد پوشه', folder.name)
      writeState(state)
      return json({ success: true, id: folder.id })
    },

    updateFolder(folderId, name) {
      const state = readState()
      const folder = state.folders.find((entry) => entry.id === Number(folderId))
      if (!folder) return json({ success: false, error: 'Debug folder was not found.' })
      folder.name = name
      appendLog(state, 'ویرایش پوشه', folder.name)
      writeState(state)
      return json({ success: true })
    },

    deleteFolder(folderId) {
      const state = readState()
      const id = Number(folderId)
      const before = state.folders.length
      state.folders = state.folders.filter((folder) => folder.id !== id)
      state.panels.forEach((panel) => {
        if (panel.folderId === id) panel.folderId = null
      })
      if (state.folders.length !== before) appendLog(state, 'حذف پوشه', `شناسه ${folderId}`)
      writeState(state)
      return json({ success: state.folders.length !== before })
    },

    getSerialNumber(codeUD) {
      return json({ serialNumber: `DEV-${codeUD.trim().toUpperCase() || 'PANEL'}` })
    },

    wifiSendData(panelJson, code, tabCode) {
      const panel = JSON.parse(panelJson) as Partial<BridgePanel>
      return json({
        success: true,
        request: `debug-${panel.serialNumber ?? 'serial'}-${panel.codeUD ?? 'code'}-${code}${tabCode ? `-${tabCode}` : ''};@`,
        response: code === '1000' && tabCode === '3'
          ? `time:12:30;date:1403/08/15;softv:1.0.0;model:UDL;hardv:2.1;@`
          : 'Valid;@',
        chunks: [],
        chunkCount: 0,
      })
    },

    wifiReceiveData(panelJson, code, tabCode) {
      const panel = JSON.parse(panelJson) as Partial<BridgePanel>
      const label = `${code}${tabCode ? `-${tabCode}` : ''}`
      return json({
        success: true,
        request: `debug-${panel.serialNumber ?? 'serial'}-${panel.codeUD ?? 'code'}-${label}-Get;@`,
        response: `debug-${label}-2;@`,
        chunks: [
          `1:name:${label} item 1;active:1;@`,
          `2:name:${label} item 2;active:0;@`,
        ],
        chunkCount: 2,
      })
    },

    wifiSendCommand(panelJson, message) {
      const panel = JSON.parse(panelJson) as Partial<BridgePanel>
      return json({
        success: true,
        request: `debug-${panel.serialNumber ?? 'serial'}-${panel.codeUD ?? 'code'}-${message};@`,
        response: 'Valid;@',
        chunks: [],
        chunkCount: 0,
      })
    },

    updateProfile(profileJson) {
      const payload = JSON.parse(profileJson) as { fullName?: string; phoneNumber: string; email?: string; avatarUrl?: string }
      const state = readState()
      const user = currentUser(state)
      if (!user) return json({ success: false, error: 'لطفا وارد شوید' })
      user.fullName = payload.fullName
      user.phoneNumber = payload.phoneNumber
      user.email = payload.email
      user.avatarUrl = payload.avatarUrl
      state.preferences ??= {}
      state.preferences.profile_email = payload.email ?? ''
      appendLog(state, 'ویرایش پروفایل', 'اطلاعات حساب به روز شد')
      writeState(state)
      return json({ success: true, user: toPublicUser(user) })
    },

    changePassword(currentPassword, newPassword) {
      const state = readState()
      const user = currentUser(state)
      if (!user || user.password !== currentPassword) return json({ success: false, error: 'رمز عبور فعلی صحیح نیست' })
      user.password = newPassword
      appendLog(state, 'تغییر رمز عبور', 'رمز عبور حساب تغییر کرد')
      writeState(state)
      return json({ success: true })
    },

    getPreference(key, defaultValue) {
      const state = readState()
      return json({ success: true, value: state.preferences?.[key] ?? defaultValue })
    },

    setPreference(key, value) {
      const state = readState()
      state.preferences ??= {}
      state.preferences[key] = value
      writeState(state)
      return json({ success: true })
    },

    sendSupportTicket(subject) {
      const state = readState()
      appendLog(state, 'درخواست پشتیبانی', subject)
      writeState(state)
      return json({ success: true })
    },

    clearAppCache() {
      const state = readState()
      appendLog(state, 'پاک کردن کش', 'کش برنامه پاک شد')
      writeState(state)
      return json({ success: true })
    },

    copyText(text) {
      void navigator.clipboard?.writeText(text)
      return json({ success: true })
    },

    shareText() {
      return json({ success: true })
    },

    shareBackup() {
      const state = readState()
      appendLog(state, 'پشتیبان داده ها', 'خروجی آماده شد')
      writeState(state)
      return json({ success: true })
    },

    getStorageSummary() {
      const state = readState()
      return json({ success: true, panels: state.panels.length, folders: state.folders.length })
    },

    getActivityLogs() {
      return json({ success: true, logs: readState().logs ?? [] })
    },
  }

  return bridge
}
