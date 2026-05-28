import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
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
  IoClose,
} from 'react-icons/io5'
import { getBiometricEnabled, setBiometricEnabled, getBooleanPreference, setPreference, getFolders, createFolder, updateFolder, deleteFolder, type BridgeFolder } from '../../utils/androidBridge'
import { appToast } from '../../utils/appToast'

const APP_VERSION = '1.0.0 (۱۴۰۳)'

type SettingsRow = {
  id: string
  icon: React.ReactNode
  label: string
  value?: string
  switchId?: 'biometric' | 'notifications'
  danger?: boolean
  detailRoute?: string
}

type FolderEditorMode = 'create' | 'edit'

function FolderEditorSheet({
  mode,
  name,
  error,
  onNameChange,
  onClose,
  onSubmit,
}: {
  mode: FolderEditorMode
  name: string
  error: string | null
  onNameChange: (name: string) => void
  onClose: () => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}) {
  const title = mode === 'create' ? 'افزودن پوشه جدید' : 'ویرایش پوشه'
  const submitLabel = mode === 'create' ? 'ثبت پوشه' : 'ذخیره تغییرات'

  return (
    <>
      <motion.div
        role="presentation"
        className="fixed inset-0 z-30 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="folder-editor-title"
        className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-[42rem] flex-col rounded-t-3xl border-t border-(--app-border) bg-(--surface-light) shadow-2xl"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'tween', duration: 0.36, ease: [0.32, 0.72, 0, 1] }}
        style={{ willChange: 'transform' }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-(--app-border)/70 px-4 py-3">
          <h2 id="folder-editor-title" className="text-lg font-semibold text-(--black)">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-(--teal-tertiary) transition hover:bg-(--app-gradient-start)"
            aria-label="بستن"
          >
            <IoClose className="h-6 w-6" />
          </button>
        </div>
        <div className="shrink-0 px-1 py-1">
          <div className="mx-auto h-1 w-12 rounded-full bg-(--app-border)" aria-hidden />
        </div>
        <form
          onSubmit={onSubmit}
          className="px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-3"
        >
          <label htmlFor="folder-name" className="mb-2 block text-sm text-(--teal-tertiary)">
            نام پوشه
          </label>
          <div className="flex h-14 w-full items-center rounded-xl border border-(--app-border) bg-(--white) px-4 transition focus-within:border-(--teal-primary)">
            <IoFolderOutline className="ml-3 h-5 w-5 shrink-0 text-(--teal-tertiary)" aria-hidden />
            <input
              id="folder-name"
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              autoFocus
              placeholder="نام پوشه را وارد کنید"
              className="min-w-0 flex-1 bg-transparent text-sm text-(--black) outline-none placeholder:text-(--teal-tertiary)/70"
            />
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="mt-4 h-12 w-full rounded-xl bg-(--teal-primary) font-medium text-(--app-on-primary)"
          >
            {submitLabel}
          </button>
        </form>
      </motion.div>
    </>
  )
}

function SettingsPage() {
  const navigate = useNavigate()
  const [biometricEnabled, setBiometricEnabledState] = useState(() => getBiometricEnabled())

  const handleBiometricToggle = (next: boolean) => {
    setBiometricEnabledState(next)
    setBiometricEnabled(next)
    appToast.success({ title: 'ورود بیومتریک', message: next ? 'ورود بیومتریک فعال شد.' : 'ورود بیومتریک غیرفعال شد.' })
  }

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => getBooleanPreference('notifications', true))
  const [folders, setFoldersState] = useState<BridgeFolder[]>(() => getFolders().folders)
  const [folderEditorMode, setFolderEditorMode] = useState<FolderEditorMode | null>(null)
  const [editingFolder, setEditingFolder] = useState<BridgeFolder | null>(null)
  const [folderName, setFolderName] = useState('')
  const [folderEditorError, setFolderEditorError] = useState<string | null>(null)
  const [folderToDelete, setFolderToDelete] = useState<BridgeFolder | null>(null)
  const [folderDeleteError, setFolderDeleteError] = useState<string | null>(null)

  const handleNotificationsToggle = (next: boolean) => {
    const result = setPreference('notifications', next)
    if (!result.success) {
      appToast.error({ title: 'ذخیره تنظیمات ناموفق', message: result.error })
      return
    }
    setNotificationsEnabled(next)
    appToast.success({ title: 'اعلان ها', message: next ? 'اعلان های برنامه روشن شد.' : 'اعلان های برنامه خاموش شد.' })
  }

  const refetchFolders = useCallback(() => {
    const { folders: list, error } = getFolders()
    if (!error) setFoldersState(list)
  }, [])

  const closeFolderEditor = () => {
    setFolderEditorMode(null)
    setEditingFolder(null)
    setFolderName('')
    setFolderEditorError(null)
  }

  const handleAddFolder = () => {
    setFolderName('')
    setEditingFolder(null)
    setFolderEditorError(null)
    setFolderEditorMode('create')
  }

  const handleEditFolder = (folder: BridgeFolder) => {
    setFolderName(folder.name)
    setEditingFolder(folder)
    setFolderEditorError(null)
    setFolderEditorMode('edit')
  }

  const handleFolderEditorSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const name = folderName.trim()
    if (!name) {
      setFolderEditorError('نام پوشه را وارد کنید.')
      return
    }

    const result =
      folderEditorMode === 'edit' && editingFolder
        ? updateFolder(editingFolder.id, name)
        : createFolder(name)

    if (result.success) {
      refetchFolders()
      closeFolderEditor()
      appToast.success({
        title: folderEditorMode === 'edit' ? 'پوشه ویرایش شد' : 'پوشه ایجاد شد',
        message: 'تغییرات پوشه های پنل ذخیره شد.',
      })
    } else {
      setFolderEditorError(result.error ?? 'ذخیره پوشه انجام نشد.')
      appToast.error({ title: 'ذخیره پوشه ناموفق', message: result.error })
    }
  }

  const handleDeleteFolder = (folder: BridgeFolder) => {
    setFolderDeleteError(null)
    setFolderToDelete(folder)
  }

  const confirmDeleteFolder = () => {
    if (!folderToDelete) return
    const result = deleteFolder(folderToDelete.id)
    if (result.success) {
      refetchFolders()
      setFolderToDelete(null)
      setFolderDeleteError(null)
      appToast.success({ title: 'پوشه حذف شد', message: 'پوشه از فهرست پنل ها حذف شد.' })
    } else {
      setFolderDeleteError(result.error ?? 'حذف پوشه انجام نشد.')
      appToast.error({ title: 'حذف پوشه ناموفق', message: result.error })
    }
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
          detailRoute: '/app/settings/ticketing',
        },
      ],
    },
    {
      title: 'نرم‌افزار',
      rows: [
        { id: 'version', icon: <IoCodeSlashOutline className="h-5 w-5" />, label: 'نسخه', value: APP_VERSION },
        { id: 'about', icon: <IoInformationCircleOutline className="h-5 w-5" />, label: 'درباره ما', detailRoute: '/app/settings/about' },
        { id: 'logs', icon: <IoDocumentTextOutline className="h-5 w-5" />, label: 'لاگ نرم‌افزار', detailRoute: '/app/settings/logs' },
      ],
    },
    {
      title: 'داده و ذخیره',
      rows: [
        { id: 'storage', icon: <IoCloudOutline className="h-5 w-5" />, label: 'فضای ذخیره و داده', detailRoute: '/app/settings/storage' },
        { id: 'cache', icon: <IoTrashOutline className="h-5 w-5" />, label: 'پاک کردن کش', detailRoute: '/app/settings/cache' },
      ],
    },
    {
      title: 'عمومی',
      rows: [
        { id: 'language', icon: <IoLanguageOutline className="h-5 w-5" />, label: 'زبان', value: 'فارسی' },
        { id: 'privacy', icon: <IoLockClosedOutline className="h-5 w-5" />, label: 'حریم خصوصی', detailRoute: '/app/settings/privacy' },
      ],
    },
  ]

  const renderSwitch = (switchId: 'biometric' | 'notifications') => {
    const isOn = switchId === 'biometric' ? biometricEnabled : notificationsEnabled
    const toggle = () => {
      if (switchId === 'biometric') handleBiometricToggle(!biometricEnabled)
      else handleNotificationsToggle(!notificationsEnabled)
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
                    onClick={row.detailRoute ? () => navigate(row.detailRoute as string) : undefined}
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
                    {row.detailRoute && (
                      <IoChevronForward className="h-5 w-5 shrink-0 rotate-180 text-(--teal-tertiary)" aria-hidden />
                    )}
                  </button>
                ))}
              </div>
            )}
          </section>
        ))}
      </main>

      <AnimatePresence>
        {folderEditorMode && (
          <FolderEditorSheet
            mode={folderEditorMode}
            name={folderName}
            error={folderEditorError}
            onNameChange={(name) => {
              setFolderName(name)
              setFolderEditorError(null)
            }}
            onClose={closeFolderEditor}
            onSubmit={handleFolderEditorSubmit}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {folderToDelete && (
          <>
            <motion.div
              role="presentation"
              className="fixed inset-0 z-50 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setFolderToDelete(null)
                setFolderDeleteError(null)
              }}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-folder-title"
              className="fixed left-1/2 top-1/2 z-50 w-[min(90vw,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-(--app-border) bg-(--surface-light) p-4 text-right shadow-2xl"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            >
              <h2 id="delete-folder-title" className="text-lg font-semibold text-(--black)">
                حذف پوشه
              </h2>
              <p className="mt-2 text-sm text-(--teal-tertiary)">
                آیا از حذف پوشه «{folderToDelete.name}» اطمینان دارید؟ پنل‌های داخل آن به «بدون پوشه» منتقل می‌شوند.
              </p>
              {folderDeleteError && (
                <p className="mt-2 text-sm text-red-500" role="alert">
                  {folderDeleteError}
                </p>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFolderToDelete(null)
                    setFolderDeleteError(null)
                  }}
                  className="flex-1 rounded-xl border border-(--app-border) bg-(--white) py-2.5 text-sm font-medium text-(--black)"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteFolder}
                  className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white"
                >
                  بله، حذف کن
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SettingsPage
