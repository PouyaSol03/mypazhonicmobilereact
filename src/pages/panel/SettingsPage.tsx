import { useCallback, useState, useEffect } from 'react'
import {
  IoFingerPrintOutline,
  IoNotificationsOutline,
  IoChevronForward,
  IoDocumentTextOutline,
  IoHelpBuoyOutline,
  IoInformationCircleOutline,
  IoCodeSlashOutline,
  IoTrashOutline,
  IoLanguageOutline,
  IoLockClosedOutline,
  IoCloudOutline,
  IoFolderOutline,
  IoAddOutline,
  IoPencilOutline,
} from 'react-icons/io5'
import { getBiometricEnabled, setBiometricEnabled, getFolders, createFolder, updateFolder, deleteFolder, type BridgeFolder } from '../../utils/androidBridge'

const APP_VERSION = '1.0.0 (۱۴۰۳)'

type SettingsRow = {
  id: string
  icon: React.ReactNode
  label: string
  value?: string
  switchId?: 'biometric' | 'notifications'
  danger?: boolean
}

function SettingsPage() {
  const [biometricEnabled, setBiometricEnabledState] = useState(false)

  useEffect(() => {
    setBiometricEnabledState(getBiometricEnabled())
  }, [])

  const handleBiometricToggle = (next: boolean) => {
    setBiometricEnabledState(next)
    setBiometricEnabled(next)
  }

  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [folders, setFoldersState] = useState<BridgeFolder[]>([])

  const refetchFolders = useCallback(() => {
    const { folders: list, error } = getFolders()
    if (!error) setFoldersState(list)
  }, [])

  useEffect(() => {
    refetchFolders()
  }, [refetchFolders])

  const handleAddFolder = () => {
    const name = window.prompt('نام پوشه جدید')
    if (!name?.trim()) return
    const result = createFolder(name.trim())
    if (result.success) refetchFolders()
    else if (result.error) window.alert(result.error)
  }

  const handleEditFolder = (folder: BridgeFolder) => {
    const name = window.prompt('نام پوشه', folder.name)
    if (name == null || name.trim() === '') return
    const result = updateFolder(folder.id, name.trim())
    if (result.success) refetchFolders()
    else if (result.error) window.alert(result.error)
  }

  const handleDeleteFolder = (folder: BridgeFolder) => {
    if (!window.confirm(`حذف پوشه «${folder.name}»؟ پنل‌های داخل آن به «بدون پوشه» منتقل می‌شوند.`)) return
    const result = deleteFolder(folder.id)
    if (result.success) refetchFolders()
    else if (result.error) window.alert(result.error)
  }

  const sections: Array<{ title: string; rows: SettingsRow[] }> = [
    {
      title: 'امنیت و ورود',
      rows: [
        {
          id: 'biometric',
          icon: <IoFingerPrintOutline className="h-5 w-5" />,
          label: 'ورود با اثر انگشت / بیومتریک',
          value: biometricEnabled ? 'فعال' : 'غیرفعال',
          switchId: 'biometric',
        },
      ],
    },
    {
      title: 'اعلان‌ها',
      rows: [
        {
          id: 'notifications',
          icon: <IoNotificationsOutline className="h-5 w-5" />,
          label: 'اعلان‌های اپلیکیشن',
          value: notificationsEnabled ? 'روشن' : 'خاموش',
          switchId: 'notifications',
        },
      ],
    },
    {
      title: 'پوشه‌های پنل (دسته‌ها)',
      rows: [], // rendered separately below
    },
    {
      title: 'پشتیبانی',
      rows: [
        {
          id: 'ticketing',
          icon: <IoHelpBuoyOutline className="h-5 w-5" />,
          label: 'تیکت و پشتیبانی',
        },
      ],
    },
    {
      title: 'نرم‌افزار',
      rows: [
        { id: 'version', icon: <IoCodeSlashOutline className="h-5 w-5" />, label: 'نسخه', value: APP_VERSION },
        { id: 'about', icon: <IoInformationCircleOutline className="h-5 w-5" />, label: 'درباره ما' },
        { id: 'logs', icon: <IoDocumentTextOutline className="h-5 w-5" />, label: 'لاگ نرم‌افزار' },
      ],
    },
    {
      title: 'داده و ذخیره',
      rows: [
        { id: 'storage', icon: <IoCloudOutline className="h-5 w-5" />, label: 'فضای ذخیره و داده' },
        { id: 'cache', icon: <IoTrashOutline className="h-5 w-5" />, label: 'پاک کردن کش' },
      ],
    },
    {
      title: 'عمومی',
      rows: [
        { id: 'language', icon: <IoLanguageOutline className="h-5 w-5" />, label: 'زبان', value: 'فارسی' },
        { id: 'privacy', icon: <IoLockClosedOutline className="h-5 w-5" />, label: 'حریم خصوصی' },
      ],
    },
  ]

  const renderSwitch = (switchId: 'biometric' | 'notifications') => {
    const isOn = switchId === 'biometric' ? biometricEnabled : notificationsEnabled
    const toggle = () => {
      if (switchId === 'biometric') handleBiometricToggle(!biometricEnabled)
      else setNotificationsEnabled((v) => !v)
    }
    return (
      <button
        type="button"
        role="switch"
        aria-checked={isOn ? 'true' : 'false'}
        aria-label={switchId === 'biometric' ? (isOn ? 'ورود با بیومتریک فعال' : 'ورود با بیومتریک غیرفعال') : (isOn ? 'اعلان‌ها روشن' : 'اعلان‌ها خاموش')}
        onClick={(e) => {
          e.stopPropagation()
          toggle()
        }}
        className={`relative h-7 w-12 shrink-0 rounded-full border-2 transition ${
          isOn ? 'border-(--teal-primary) bg-(--teal-primary)' : 'border-(--app-border) bg-(--app-border)'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${isOn ? 'right-0.5' : 'left-0.5'}`}
        />
      </button>
    )
  }

  return (
    <div
      dir="rtl"
      className="flex min-h-full w-full flex-col bg-(--background-light) text-right"
    >
      <header className="shrink-0 border-b border-(--app-border)/70 bg-(--surface-light) px-4 py-4">
        <h1 className="text-xl font-bold text-(--black)">تنظیمات</h1>
        <p className="mt-0.5 text-sm text-(--teal-tertiary)">مدیریت اپلیکیشن پاژونیک</p>
      </header>

      <main className="flex-1 overflow-auto px-4 pb-6 pt-4">
        {sections.map((group) => (
          <section key={group.title} className="mt-4">
            <h2 className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-(--teal-tertiary)">
              {group.title}
            </h2>
            {group.title === 'پوشه‌های پنل (دسته‌ها)' ? (
              <div className="overflow-hidden rounded-2xl border border-(--app-border) bg-(--white) shadow-sm">
                {folders.map((folder, index) => (
                  <div
                    key={folder.id}
                    className={`flex w-full items-center gap-3 px-3 py-3.5 text-right ${
                      index < folders.length - 1 ? 'border-b border-(--app-border)/60' : ''
                    }`}
                  >
                    <span className="text-(--teal-tertiary)" aria-hidden>
                      <IoFolderOutline className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1 font-medium text-(--black)">{folder.name}</span>
                    <button
                      type="button"
                      onClick={() => handleEditFolder(folder)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-(--teal-tertiary) transition hover:bg-(--app-gradient-start)"
                      aria-label="ویرایش پوشه"
                    >
                      <IoPencilOutline className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFolder(folder)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-red-500 transition hover:bg-red-500/10"
                      aria-label="حذف پوشه"
                    >
                      <IoTrashOutline className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddFolder}
                  className="flex w-full items-center gap-3 px-3 py-3.5 text-right transition active:bg-(--app-gradient-start) text-(--teal-primary)"
                >
                  <IoAddOutline className="h-5 w-5 shrink-0" aria-hidden />
                  <span className="font-medium">افزودن پوشه</span>
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-(--app-border) bg-(--white) shadow-sm">
                {group.rows.map((row, index) => (
                  <button
                    key={row.id}
                    type="button"
                    className={`flex w-full items-center gap-3 px-3 py-3.5 text-right transition active:bg-(--app-gradient-start) ${
                      index < group.rows.length - 1 ? 'border-b border-(--app-border)/60' : ''
                    } ${row.danger ? 'text-red-600' : 'text-(--black)'}`}
                  >
                    <span className={row.danger ? 'text-red-500' : 'text-(--teal-tertiary)'} aria-hidden>
                      {row.icon}
                    </span>
                    <span className="min-w-0 flex-1 font-medium">{row.label}</span>
                    {row.value && !row.switchId && (
                      <span className="text-sm text-(--teal-tertiary)">{row.value}</span>
                    )}
                    {row.switchId && renderSwitch(row.switchId)}
                    {!row.switchId && (
                      <IoChevronForward className="h-5 w-5 shrink-0 rotate-180 text-(--teal-tertiary)" aria-hidden />
                    )}
                  </button>
                ))}
              </div>
            )}
          </section>
        ))}
      </main>
    </div>
  )
}

export default SettingsPage
