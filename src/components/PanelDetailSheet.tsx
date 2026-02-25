import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  IoClose,
  IoChatbubbleOutline,
  IoGlobeOutline,
  IoWifi,
  IoFolderOutline,
} from 'react-icons/io5'

export type ConnectionWay = 'sms' | 'internet' | 'wifi'

export interface PanelDetail {
  id: string
  name: string
  ip: string
  phone: string
  status: 'online' | 'offline'
  unreadCount?: number
  folderId?: number | null
}

export interface FolderOption {
  id: number | null
  name: string
}

interface PanelDetailSheetProps {
  open: boolean
  panel: PanelDetail | null
  onClose: () => void
  onConnect?: (panel: PanelDetail, way: ConnectionWay) => void
  onEdit?: (panel: PanelDetail) => void
  onDelete?: (panel: PanelDetail) => void
  /** Folders for "move to folder"; include { id: null, name: 'بدون پوشه' } for uncategorized */
  folders?: FolderOption[]
  onSetFolder?: (panelId: string, folderId: number | null) => void
}

const CONNECTION_WAYS: { value: ConnectionWay; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'sms', label: 'SMS', Icon: IoChatbubbleOutline },
  { value: 'internet', label: 'اینترنت', Icon: IoGlobeOutline },
  { value: 'wifi', label: 'وای‌فای', Icon: IoWifi },
]

export function PanelDetailSheet({
  open,
  panel,
  onClose,
  onConnect,
  folders = [],
  onSetFolder,
}: PanelDetailSheetProps) {
  const [showFolderPicker, setShowFolderPicker] = useState(false)

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const currentFolderName = panel
    ? folders.find((f) => f.id === (panel.folderId ?? null))?.name ?? 'بدون پوشه'
    : ''

  if (!panel) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            role="presentation"
            className="fixed inset-0 z-30 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            onClick={handleBackdropClick}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-detail-title"
            className="fixed inset-x-0 bottom-0 z-40 flex max-h-[90vh] flex-col rounded-t-3xl border-t border-(--app-border) bg-(--surface-light) shadow-2xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'tween',
              duration: 0.38,
              ease: [0.32, 0.72, 0, 1],
            }}
            style={{ willChange: 'transform' }}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-(--app-border)/70 px-4 py-3">
              <h2 id="panel-detail-title" className="text-lg font-semibold text-(--black)">
                {panel.name}
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

            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pb-8 pt-2">
              {/* پوشه (دسته) */}
              {folders.length > 0 && onSetFolder && (
                <section className="w-full">
                  <h3 className="mb-2 text-sm font-medium text-(--teal-tertiary)">پوشه</h3>
                  {!showFolderPicker ? (
                    <button
                      type="button"
                      onClick={() => setShowFolderPicker(true)}
                      className="flex w-full items-center gap-3 rounded-xl border border-(--app-border) bg-(--white) px-3 py-2.5 text-right transition hover:border-(--teal-primary)/50"
                    >
                      <IoFolderOutline className="h-5 w-5 text-(--teal-tertiary)" />
                      <span className="flex-1 font-medium text-(--black)">{currentFolderName}</span>
                    </button>
                  ) : (
                    <div className="rounded-xl border border-(--app-border) bg-(--white) overflow-hidden">
                      {folders.map((f) => (
                        <button
                          key={f.id ?? 'null'}
                          type="button"
                          onClick={() => {
                            onSetFolder(panel.id, f.id)
                            setShowFolderPicker(false)
                          }}
                          className={`flex w-full items-center gap-3 px-3 py-2.5 text-right transition hover:bg-(--app-gradient-start) ${
                            (panel.folderId ?? null) === f.id ? 'bg-(--teal-primary)/10 text-(--teal-primary)' : ''
                          }`}
                        >
                          <IoFolderOutline className="h-5 w-5 opacity-70" />
                          <span className="font-medium">{f.name}</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowFolderPicker(false)}
                        className="w-full border-t border-(--app-border) px-3 py-2 text-sm text-(--teal-tertiary)"
                      >
                        بستن
                      </button>
                    </div>
                  )}
                </section>
              )}

              {/* نحوه اتصال به این پنل — سه گزینه در یک ردیف */}
              <section className="w-full">
                <h3 className="mb-3 text-sm font-medium text-(--teal-tertiary)">
                  نحوه اتصال به این پنل
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {CONNECTION_WAYS.map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        onConnect?.(panel, value)
                        onClose()
                      }}
                      className="flex flex-col items-center gap-2 rounded-xl border border-(--app-border) bg-(--white) px-2 py-3 transition hover:border-(--teal-primary)/50 hover:bg-(--teal-primary)/5 active:bg-(--teal-primary)/10"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--teal-primary)/10 text-(--teal-primary)">
                        <Icon className="h-6 w-6" aria-hidden />
                      </span>
                      <span className="text-center text-xs font-medium text-(--black)">{label}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
