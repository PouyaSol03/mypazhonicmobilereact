import { motion, AnimatePresence } from 'framer-motion'
import {
  IoClose,
  IoChatbubbleOutline,
  IoGlobeOutline,
  IoWifi,
  IoTrashOutline,
  IoPencilOutline,
  IoCallOutline,
} from 'react-icons/io5'
import { FaBuilding } from 'react-icons/fa'
import { toPersianDigits } from '../utils/digits'

export type ConnectionWay = 'sms' | 'internet' | 'wifi'

export interface PanelDetail {
  id: string
  name: string
  ip: string
  phone: string
  status: 'online' | 'offline'
  unreadCount?: number
}

interface PanelDetailSheetProps {
  open: boolean
  panel: PanelDetail | null
  onClose: () => void
  onConnect?: (panel: PanelDetail, way: ConnectionWay) => void
  onEdit?: (panel: PanelDetail) => void
  onDelete?: (panel: PanelDetail) => void
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
  onEdit,
  onDelete,
}: PanelDetailSheetProps) {

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

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
              {/* نحوه اتصال به این پنل */}
              <section className="w-full">
                <h3 className="mb-3 text-sm font-medium text-(--teal-tertiary)">
                  نحوه اتصال به این پنل
                </h3>
                <div className="flex w-full flex-col gap-2">
                  {CONNECTION_WAYS.map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        onConnect?.(panel, value)
                        onClose()
                      }}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-(--app-border) bg-(--white) px-4 py-3.5 text-right transition hover:border-(--teal-primary)/50 hover:bg-(--teal-primary)/5 active:bg-(--teal-primary)/10"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--teal-primary)/10 text-(--teal-primary)">
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                        <span className="font-medium text-(--black)">{label}</span>
                      </span>
                      <span className="text-(--teal-tertiary) text-sm">ورود</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* جزئیات پنل */}
              <section>
                <h3 className="mb-3 text-sm font-medium text-(--teal-tertiary)">
                  جزئیات پنل
                </h3>
                <div className="rounded-xl border border-(--app-border) bg-(--white) overflow-hidden">
                  <div className="flex items-center gap-3 border-b border-(--app-border)/70 px-3 py-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                        panel.status === 'online'
                          ? 'bg-green-500/10 text-green-700'
                          : 'bg-red-500/10 text-red-700'
                      }`}
                    >
                      <FaBuilding className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1 text-right">
                      <p className="font-medium text-(--black)">{panel.name}</p>
                      <p className="text-xs text-(--teal-tertiary)">
                        {panel.status === 'online' ? 'آنلاین' : 'آفلاین'}
                        {panel.unreadCount != null && panel.unreadCount > 0 && (
                          <> · {toPersianDigits(panel.unreadCount)} اعلان</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="divide-y divide-(--app-border)/70">
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <IoGlobeOutline className="h-5 w-5 shrink-0 text-(--teal-tertiary)" />
                      <span className="text-sm text-(--teal-tertiary)">آی‌پی</span>
                      <span className="mr-auto text-sm font-medium text-(--black)">{panel.ip}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <IoCallOutline className="h-5 w-5 shrink-0 text-(--teal-tertiary)" />
                      <span className="text-sm text-(--teal-tertiary)">شماره تماس</span>
                      <span className="mr-auto text-sm font-medium text-(--black)">
                        {toPersianDigits(panel.phone)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* دکمه‌ها */}
              <section className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onEdit?.(panel)
                    onClose()
                  }}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-(--teal-primary) bg-(--white) text-(--teal-primary) font-medium transition hover:bg-(--teal-primary)/10"
                >
                  <IoPencilOutline className="h-5 w-5" aria-hidden />
                  ویرایش پنل
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDelete?.(panel)
                    onClose()
                  }}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-500/50 bg-red-500/5 text-red-600 font-medium transition hover:bg-red-500/10"
                >
                  <IoTrashOutline className="h-5 w-5" aria-hidden />
                  حذف پنل
                </button>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
