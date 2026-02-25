import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IoEllipsisVertical,
  IoSettingsOutline,
  IoPencilOutline,
  IoChatbubbleOutline,
  IoShieldCheckmarkOutline,
  IoLockOpenOutline,
  IoPauseOutline,
  IoLockClosedOutline,
  IoFlashOutline,
  IoNotificationsOutline,
  IoNotificationsOffOutline,
  IoEllipsisHorizontal,
  IoStatsChartOutline,
  IoCardOutline,
  IoTimeOutline,
  IoChevronBack,
  IoClose,
  IoSendOutline,
  IoCheckmarkCircleOutline,
  IoInformationCircleOutline,
  IoWarningOutline,
} from 'react-icons/io5'
import { FaBuilding } from 'react-icons/fa'
import type { PanelDetail } from '../../components/PanelDetailSheet'

// Mock last status for SMS (e.g. last reply received from panel)
const MOCK_LAST_STATUS = 'آخرین وضعیت دریافت شده: ۱۴۰۳/۰۶/۰۱ - ۱۰:۳۲'

type SwitchListItem = { id: string; label: string; enabled: boolean }

function SwitchListSheet({
  open,
  onClose,
  title,
  items,
  onToggle,
  showConfirmFooter,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  title: string
  items: SwitchListItem[]
  onToggle: (id: string) => void
  /** When true, shows انصراف + تأیید buttons in a footer row */
  showConfirmFooter?: boolean
  /** Called when user taps تأیید (submit); then sheet closes */
  onConfirm?: () => void
}) {
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }
  const handleSubmit = () => {
    onConfirm?.()
    onClose()
  }
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
            onClick={handleBackdrop}
          />
          <motion.div
            dir="rtl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="switch-sheet-title"
            className="fixed inset-x-0 bottom-0 z-40 flex max-h-[70vh] flex-col rounded-t-3xl border-t border-(--app-border) bg-(--surface-light) shadow-2xl text-right"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            style={{ willChange: 'transform' }}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-(--app-border)/70 px-4 py-3">
              <h2 id="switch-sheet-title" className="text-lg font-semibold text-(--black)">
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
            <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 pt-2 pb-4">
              {items.map((item) =>
                showConfirmFooter ? (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onToggle(item.id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-right transition active:scale-[0.99] ${
                        item.enabled
                          ? 'bg-(--teal-primary)/15 text-(--teal-tertiary)'
                          : 'bg-transparent hover:bg-(--app-gradient-start)'
                      }`}
                      aria-pressed={item.enabled}
                    >
                      <span className="font-medium text-(--black)">{item.label}</span>
                      {item.enabled && (
                        <IoCheckmarkCircleOutline
                          className="h-6 w-6 shrink-0 text-(--teal-primary)"
                          aria-hidden
                        />
                      )}
                    </button>
                  </li>
                ) : (
                  <li key={item.id} className="py-1">
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-(--app-border)/60 bg-(--white) px-3 py-3">
                      <span className="font-medium text-(--black)">{item.label}</span>
                      <button
                        title={item.enabled ? 'غیرفعال کردن' : 'فعال کردن'}
                        type="button"
                        role="switch"
                        aria-checked={item.enabled}
                        onClick={() => onToggle(item.id)}
                        className={`relative h-7 w-12 shrink-0 rounded-full border-2 transition ${
                          item.enabled
                            ? 'border-(--teal-primary) bg-(--teal-primary)'
                            : 'border-(--app-border) bg-(--app-border)'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                            item.enabled ? 'right-0.5' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </li>
                )
              )}
            </ul>
            {showConfirmFooter && (
              <div className="shrink-0 border-t border-(--app-border)/70 px-4 py-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-xl border border-(--app-border) bg-(--white) px-3 py-2.5 text-sm font-medium text-(--teal-tertiary) transition hover:bg-(--app-gradient-start)"
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 rounded-xl bg-(--teal-primary) px-3 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-(--teal-secondary)"
                  >
                    تأیید
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const INITIAL_PARTITIONS: SwitchListItem[] = [
  { id: 'p1', label: 'پارتیشن ۱', enabled: false },
  { id: 'p2', label: 'پارتیشن ۲', enabled: true },
  { id: 'p3', label: 'پارتیشن ۳', enabled: false },
  { id: 'p4', label: 'پارتیشن ۴', enabled: false },
]

const INITIAL_OUTPUTS: SwitchListItem[] = [
  { id: 'o1', label: 'خروجی ۱', enabled: true },
  { id: 'o2', label: 'خروجی ۲', enabled: false },
  { id: 'o3', label: 'خروجی ۳', enabled: true },
  { id: 'o4', label: 'خروجی ۴', enabled: false },
]

const INITIAL_ALARMS: SwitchListItem[] = [
  { id: 'a1', label: 'زون آژیر ۱', enabled: true },
  { id: 'a2', label: 'زون آژیر ۲', enabled: false },
  { id: 'a3', label: 'زون آژیر ۳', enabled: false },
]

// Demo: bottom sheet wrapper (title + content)
function DemoSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }
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
            onClick={handleBackdrop}
          />
          <motion.div
            dir="rtl"
            role="dialog"
            aria-modal="true"
            className="fixed inset-x-0 bottom-0 z-40 flex max-h-[80vh] flex-col rounded-t-3xl border-t border-(--app-border) bg-(--surface-light) shadow-2xl text-right"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            style={{ willChange: 'transform' }}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-(--app-border)/70 px-4 py-3">
              <h2 className="text-lg font-semibold text-(--black)">{title}</h2>
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
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-2">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Demo: activity log entry (SMS flow)
type LogType = 'sent' | 'received' | 'alarm' | 'info'
const DEMO_LOGS: Array<{ id: string; date: string; time: string; message: string; type: LogType }> = [
  { id: '1', date: '۱۴۰۳/۰۶/۰۱', time: '۱۰:۳۵', message: 'ارسال دستور غیرفعال‌سازی به پنل (SMS)', type: 'sent' },
  { id: '2', date: '۱۴۰۳/۰۶/۰۱', time: '۱۰:۳۴', message: 'دریافت پاسخ: پارتیشن ۱ غیرفعال شد', type: 'received' },
  { id: '3', date: '۱۴۰۳/۰۶/۰۱', time: '۱۰:۳۲', message: 'درخواست وضعیت فعلی دستگاه (SMS)', type: 'sent' },
  { id: '4', date: '۱۴۰۳/۰۶/۰۱', time: '۱۰:۳۱', message: 'وضعیت دریافت شد: پارتیشن ۲ فعال، خروجی ۱ روشن', type: 'received' },
  { id: '5', date: '۱۴۰۳/۰۶/۰۱', time: '۱۰:۲۸', message: 'فعال‌سازی خروجی ۲ (SMS)', type: 'sent' },
  { id: '6', date: '۱۴۰۳/۰۶/۰۱', time: '۱۰:۲۷', message: 'خروجی ۲ روشن شد', type: 'received' },
  { id: '7', date: '۱۴۰۳/۰۵/۳۱', time: '۱۸:۱۵', message: 'هشدار: زون آژیر ۱ فعال شد', type: 'alarm' },
  { id: '8', date: '۱۴۰۳/۰۵/۳۱', time: '۱۸:۱۰', message: 'قطع آژیر توسط کاربر (SMS)', type: 'sent' },
]

export default function PanelSMSPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const panel = location.state?.panel as PanelDetail | undefined

  const [partitionSheetOpen, setPartitionSheetOpen] = useState(false)
  const [outputSheetOpen, setOutputSheetOpen] = useState(false)
  const [alarmSheetOpen, setAlarmSheetOpen] = useState(false)
  const [alarmConfirm, setAlarmConfirm] = useState<'siren_off' | 'panic' | null>(null)
  const [statusSheetOpen, setStatusSheetOpen] = useState(false)
  const [simSheetOpen, setSimSheetOpen] = useState(false)
  const [historySheetOpen, setHistorySheetOpen] = useState(false)
  const [partitions, setPartitions] = useState<SwitchListItem[]>(INITIAL_PARTITIONS)
  const [outputs, setOutputs] = useState<SwitchListItem[]>(INITIAL_OUTPUTS)
  const [alarms, setAlarms] = useState<SwitchListItem[]>(INITIAL_ALARMS)

  const togglePartition = (id: string) => {
    setPartitions((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)))
  }
  const toggleOutput = (id: string) => {
    setOutputs((prev) => prev.map((o) => (o.id === id ? { ...o, enabled: !o.enabled } : o)))
  }
  const toggleAlarm = (id: string) => {
    setAlarms((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)))
  }

  if (!panel) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 px-4">
        <p className="text-(--teal-tertiary)">پنل یافت نشد</p>
        <button
          type="button"
          onClick={() => navigate('/app/home')}
          className="rounded-xl bg-(--teal-primary) px-4 py-2 text-white"
        >
          بازگشت به لیست پنل‌ها
        </button>
      </div>
    )
  }

  return (
    <div
      dir="rtl"
      className="flex min-h-full w-full flex-col bg-linear-to-b from-(--background-light) to-(--app-gradient-start) text-right"
    >
      {/* Top: Back button + Avatar, name, last status */}
      <div className="mx-3 mt-3 shrink-0 rounded-3xl border border-(--app-border)/80 bg-(--surface-light)/95 px-4 pb-3 pt-3 shadow-sm backdrop-blur">
        <div className="flex items-center gap-3 rounded-2xl bg-(--app-gradient-start)/60 px-2.5 py-2">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-(--teal-primary)/30 bg-(--white) text-(--teal-primary) shadow-sm">
            <FaBuilding className="h-7 w-7" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold text-(--black)">{panel.name}</h1>
            <p className="mt-0.5 truncate text-xs text-(--teal-tertiary)">{MOCK_LAST_STATUS}</p>
          </div>
        </div>
        {/* Row two: more, settings, edit, sms */}
        <div className="mt-3 flex items-stretch gap-2 rounded-2xl bg-(--app-gradient-start)/70 px-2 py-2">
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center justify-center rounded-xl border border-violet-200/80 bg-violet-50 py-2.5 text-violet-600 shadow-sm transition hover:border-violet-300 hover:bg-violet-100 hover:text-violet-700"
            aria-label="بیشتر"
          >
            <IoEllipsisVertical className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center justify-center rounded-xl border border-amber-200/80 bg-amber-50 py-2.5 text-amber-600 shadow-sm transition hover:border-amber-300 hover:bg-amber-100 hover:text-amber-700"
            aria-label="تنظیمات"
          >
            <IoSettingsOutline className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center justify-center rounded-xl border border-sky-200/80 bg-sky-50 py-2.5 text-sky-600 shadow-sm transition hover:border-sky-300 hover:bg-sky-100 hover:text-sky-700"
            aria-label="ویرایش"
          >
            <IoPencilOutline className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center justify-center rounded-xl border border-teal-200/80 bg-teal-50 py-2.5 text-teal-600 shadow-sm transition hover:border-teal-300 hover:bg-teal-100 hover:text-teal-700"
            aria-label="SMS"
          >
            <IoChatbubbleOutline className="h-5 w-5" />
          </button>
        </div>
      </div>

      <main className="flex-1 space-y-5 overflow-auto px-4 pb-6 pt-4">
        {/* کنترل دستگاه */}
        <section className="w-full">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-(--teal-tertiary)">
            <IoShieldCheckmarkOutline className="h-5 w-5" aria-hidden />
            کنترل دستگاه
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPartitionSheetOpen(true)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-(--app-border) bg-(--white) px-3 py-4 shadow-sm transition active:scale-[0.98] hover:border-red-400/50 hover:bg-red-50/50"
            >
              <IoLockOpenOutline className="h-8 w-8 text-red-500" aria-hidden />
              <span className="text-center text-xs font-medium text-(--black)">غیرفعال</span>
              <span className="text-center text-[10px] text-(--teal-tertiary)">Disarm</span>
            </button>
            <button
              type="button"
              onClick={() => setPartitionSheetOpen(true)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-(--app-border) bg-(--white) px-3 py-4 shadow-sm transition active:scale-[0.98] hover:border-amber-400/50 hover:bg-amber-50/50"
            >
              <IoPauseOutline className="h-8 w-8 text-amber-500" aria-hidden />
              <span className="text-center text-xs font-medium text-(--black)">معلق</span>
              <span className="text-center text-[10px] text-(--teal-tertiary)">Stay</span>
            </button>
            <button
              type="button"
              onClick={() => setPartitionSheetOpen(true)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-(--app-border) bg-(--white) px-3 py-4 shadow-sm transition active:scale-[0.98] hover:border-green-500/50 hover:bg-green-50/50"
            >
              <IoLockClosedOutline className="h-8 w-8 text-green-600" aria-hidden />
              <span className="text-center text-xs font-medium text-(--black)">فعال</span>
              <span className="text-center text-[10px] text-(--teal-tertiary)">Arm</span>
            </button>
          </div>
        </section>

        {/* کنترل خروجی */}
        <section className="w-full">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-(--teal-tertiary)">
            <IoFlashOutline className="h-5 w-5" aria-hidden />
            کنترل خروجی
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOutputSheetOpen(true)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-(--app-border) bg-(--white) px-3 py-4 shadow-sm transition active:scale-[0.98] hover:border-purple-400/50 hover:bg-purple-50/30"
            >
              <IoFlashOutline className="h-8 w-8 stroke-2 text-purple-500" aria-hidden />
              <span className="text-center text-xs font-medium text-(--black)">خاموش کردن</span>
              <span className="text-center text-[10px] text-(--teal-tertiary)">Output OFF</span>
            </button>
            <button
              type="button"
              onClick={() => setOutputSheetOpen(true)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-(--app-border) bg-(--white) px-3 py-4 shadow-sm transition active:scale-[0.98] hover:border-(--teal-primary)/50 hover:bg-(--teal-primary)/5"
            >
              <IoFlashOutline className="h-8 w-8 text-(--teal-primary)" aria-hidden />
              <span className="text-center text-xs font-medium text-(--black)">روشن کردن</span>
              <span className="text-center text-[10px] text-(--teal-tertiary)">Output ON</span>
            </button>
          </div>
        </section>

        {/* هشدار و آژیر */}
        <section className="w-full">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-(--teal-tertiary)">
            <IoNotificationsOutline className="h-5 w-5" aria-hidden />
            هشدار و آژیر
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAlarmConfirm('siren_off')}
              className="flex flex-col items-center gap-2 rounded-2xl border border-(--app-border) bg-(--white) px-3 py-4 shadow-sm transition active:scale-[0.98] hover:bg-(--app-gradient-start)"
            >
              <IoNotificationsOffOutline className="h-8 w-8 text-(--teal-tertiary)" aria-hidden />
              <span className="text-center text-xs font-medium text-(--black)">قطع آژیر</span>
              <span className="text-center text-[10px] text-(--teal-tertiary)">Siren Off</span>
            </button>
            <button
              type="button"
              onClick={() => setAlarmConfirm('panic')}
              className="flex flex-col items-center gap-2 rounded-2xl border border-(--app-border) bg-(--white) px-3 py-4 shadow-sm transition active:scale-[0.98] hover:border-pink-400/50 hover:bg-pink-50/30"
            >
              <IoNotificationsOutline className="h-8 w-8 text-pink-500" aria-hidden />
              <span className="text-center text-xs font-medium text-(--black)">فعال کردن آژیر</span>
              <span className="text-center text-[10px] text-(--teal-tertiary)">Panic</span>
            </button>
          </div>
        </section>

        {/* عملیات دیگر */}
        <section className="w-full">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-(--teal-tertiary)">
            <IoEllipsisHorizontal className="h-5 w-5" aria-hidden />
            عملیات دیگر
          </h2>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setStatusSheetOpen(true)}
              className="flex items-center gap-3 rounded-2xl border border-(--app-border) bg-(--white) px-3 py-3.5 shadow-sm transition active:scale-[0.99] hover:bg-(--app-gradient-start)"
            >
              <IoStatsChartOutline className="h-6 w-6 shrink-0 text-(--teal-primary)" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-(--black)">استعلام وضعیت</p>
                <p className="text-xs text-(--teal-tertiary)">دریافت وضعیت فعلی دستگاه</p>
              </div>
              <IoChevronBack className="h-5 w-5 shrink-0 text-(--teal-tertiary)" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setSimSheetOpen(true)}
              className="flex items-center gap-3 rounded-2xl border border-(--app-border) bg-(--white) px-3 py-3.5 shadow-sm transition active:scale-[0.99] hover:bg-(--app-gradient-start)"
            >
              <IoCardOutline className="h-6 w-6 shrink-0 text-green-600" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-(--black)">شارژ سیم کارت</p>
                <p className="text-xs text-(--teal-tertiary)">افزایش اعتبار سیم کارت پنل</p>
              </div>
              <IoChevronBack className="h-5 w-5 shrink-0 text-(--teal-tertiary)" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setHistorySheetOpen(true)}
              className="flex items-center gap-3 rounded-2xl border border-(--app-border) bg-(--white) px-3 py-3.5 shadow-sm transition active:scale-[0.99] hover:bg-(--app-gradient-start)"
            >
              <IoTimeOutline className="h-6 w-6 shrink-0 text-purple-500" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-(--black)">تاریخچه فعالیت</p>
                <p className="text-xs text-(--teal-tertiary)">مشاهده رویدادهای اخیر</p>
              </div>
              <IoChevronBack className="h-5 w-5 shrink-0 text-(--teal-tertiary)" aria-hidden />
            </button>
          </div>
        </section>
      </main>

      <SwitchListSheet
        open={partitionSheetOpen}
        onClose={() => setPartitionSheetOpen(false)}
        title="پارتیشن‌ها"
        items={partitions}
        onToggle={togglePartition}
        showConfirmFooter
        onConfirm={() => {
          /* submit partitions (e.g. send to panel) */
        }}
      />
      <SwitchListSheet
        open={outputSheetOpen}
        onClose={() => setOutputSheetOpen(false)}
        title="خروجی‌ها"
        items={outputs}
        onToggle={toggleOutput}
        showConfirmFooter
        onConfirm={() => {
          /* submit outputs (e.g. send to panel) */
        }}
      />
      <SwitchListSheet
        open={alarmSheetOpen}
        onClose={() => setAlarmSheetOpen(false)}
        title="هشدار و آژیر"
        items={alarms}
        onToggle={toggleAlarm}
      />

      {/* تأیید قطع آژیر / فعال‌سازی آژیر (Panic) */}
      <AnimatePresence>
        {alarmConfirm && (
          <>
            <motion.div
              role="presentation"
              className="fixed inset-0 z-50 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setAlarmConfirm(null)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="alarm-confirm-title"
              aria-describedby="alarm-confirm-desc"
              className="fixed left-1/2 top-1/2 z-50 w-[min(90vw,20rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-(--app-border) bg-(--surface-light) p-4 shadow-2xl text-right"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="alarm-confirm-title" className="text-lg font-semibold text-(--black)">
                {alarmConfirm === 'siren_off' ? 'قطع آژیر' : 'فعال کردن آژیر'}
              </h2>
              <p id="alarm-confirm-desc" className="mt-2 text-sm text-(--teal-tertiary)">
                {alarmConfirm === 'siren_off'
                  ? 'آیا از قطع آژیر مطمئن هستید؟'
                  : 'آیا از فعال‌سازی آژیر (Panic) مطمئن هستید؟'}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAlarmConfirm(null)}
                  className="flex-1 rounded-xl border border-(--app-border) bg-(--white) px-3 py-2.5 text-sm font-medium text-(--teal-tertiary) transition hover:bg-(--app-gradient-start)"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAlarmConfirm(null)
                    // setAlarmSheetOpen(true)
                  }}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium text-white shadow-sm transition ${
                    alarmConfirm === 'panic'
                      ? 'bg-pink-500 hover:bg-pink-600'
                      : 'bg-(--teal-primary) hover:bg-(--teal-secondary)'
                  }`}
                >
                  تأیید
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Demo: استعلام وضعیت — current status (received via SMS from panel) */}
      <DemoSheet
        open={statusSheetOpen}
        onClose={() => setStatusSheetOpen(false)}
        title="استعلام وضعیت"
      >
        <p className="mb-3 text-xs text-(--teal-tertiary)">
          وضعیت زیر از طریق پیامک از پنل دریافت شده است. (دمو)
        </p>
        <div className="space-y-2 rounded-2xl border border-(--app-border) bg-(--white) p-3">
          <p className="text-sm font-medium text-(--black)">پارتیشن‌ها</p>
          <ul className="space-y-1.5 text-sm text-(--teal-tertiary)">
            <li>پارتیشن ۱: غیرفعال</li>
            <li>پارتیشن ۲: فعال</li>
            <li>پارتیشن ۳: غیرفعال</li>
            <li>پارتیشن ۴: غیرفعال</li>
          </ul>
        </div>
        <div className="mt-2 space-y-2 rounded-2xl border border-(--app-border) bg-(--white) p-3">
          <p className="text-sm font-medium text-(--black)">خروجی‌ها</p>
          <ul className="space-y-1.5 text-sm text-(--teal-tertiary)">
            <li>خروجی ۱: روشن</li>
            <li>خروجی ۲: خاموش</li>
          </ul>
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-(--teal-tertiary)">
          <IoInformationCircleOutline className="h-4 w-4 shrink-0" />
          در نسخه واقعی، با ارسال کد وضعیت به پنل، این اطلاعات از طریق SMS برمی‌گردد.
        </p>
      </DemoSheet>

      {/* Demo: شارژ سیم کارت — recharge via SMS/USSD to panel */}
      <DemoSheet open={simSheetOpen} onClose={() => setSimSheetOpen(false)} title="شارژ سیم کارت">
        <p className="mb-3 text-xs text-(--teal-tertiary)">
          شارژ سیم کارت پنل از طریق ارسال کد (SMS/USSD) به سیم کارت پنل انجام می‌شود. (دمو)
        </p>
        <div className="rounded-2xl border border-(--app-border) bg-(--white) p-3">
          <p className="text-sm font-medium text-(--black)">اعتبار فعلی (دمو)</p>
          <p className="mt-1 text-lg font-semibold text-(--teal-primary)">۴۵,۰۰۰ تومان</p>
        </div>
        <p className="mt-3 text-xs text-(--teal-tertiary)">
          با زدن دکمه زیر، در نسخه واقعی یک پیامک حاوی کد شارژ به شماره سیم کارت پنل ارسال می‌شود.
        </p>
        <button
          type="button"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-(--app-border) bg-(--teal-primary) px-4 py-3 font-medium text-white shadow-sm transition active:scale-[0.99]"
          onClick={() => setSimSheetOpen(false)}
        >
          <IoSendOutline className="h-5 w-5" />
          ارسال درخواست شارژ (دمو)
        </button>
      </DemoSheet>

      {/* Demo: تاریخچه فعالیت — event log (client actions + panel events) */}
      <DemoSheet
        open={historySheetOpen}
        onClose={() => setHistorySheetOpen(false)}
        title="تاریخچه فعالیت"
      >
        <p className="mb-3 text-xs text-(--teal-tertiary)">
          رویدادهای ارسالی شما به پنل و پاسخ‌های دریافتی از پنل. (دمو)
        </p>
        <ul className="space-y-2">
          {DEMO_LOGS.map((log) => (
            <li
              key={log.id}
              className="flex gap-3 rounded-2xl border border-(--app-border) bg-(--white) px-3 py-2.5 text-right"
            >
              <span className="shrink-0 text-xs text-(--teal-tertiary)">
                {log.date} · {log.time}
              </span>
              <span className="min-w-0 flex-1 text-sm text-(--black)">{log.message}</span>
              <span className="shrink-0 pt-0.5" aria-hidden>
                {log.type === 'sent' && (
                  <IoSendOutline className="h-4 w-4 text-(--teal-primary)" title="ارسال به پنل" />
                )}
                {log.type === 'received' && (
                  <IoCheckmarkCircleOutline
                    className="h-4 w-4 text-green-600"
                    title="پاسخ از پنل"
                  />
                )}
                {log.type === 'alarm' && (
                  <IoWarningOutline className="h-4 w-4 text-amber-500" title="هشدار" />
                )}
                {log.type === 'info' && (
                  <IoInformationCircleOutline
                    className="h-4 w-4 text-(--teal-tertiary)"
                    title="اطلاعات"
                  />
                )}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex items-center gap-2 text-xs text-(--teal-tertiary)">
          <IoInformationCircleOutline className="h-4 w-4 shrink-0" />
          همه عملیات در پس‌زمینه به صورت کد از طریق SMS به پنل ارسال می‌شوند.
        </p>
      </DemoSheet>
    </div>
  )
}
