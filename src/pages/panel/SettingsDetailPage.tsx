import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  IoArrowBack,
  IoCallOutline,
  IoCheckmarkCircleOutline,
  IoCloudOutline,
  IoDocumentTextOutline,
  IoHelpBuoyOutline,
  IoInformationCircleOutline,
  IoLockClosedOutline,
  IoMailOutline,
  IoRefreshOutline,
  IoShieldCheckmarkOutline,
  IoTrashOutline,
  IoWarningOutline,
} from 'react-icons/io5'
import { appToast } from '../../utils/appToast'
import { toPersianDigits } from '../../utils/digits'
import {
  clearAppCache,
  getActivityLogs,
  getBooleanPreference,
  getStorageSummary,
  sendSupportTicket,
  setPreference,
  type BridgeActivityLog,
} from '../../utils/androidBridge'

type DetailKey = 'ticketing' | 'about' | 'logs' | 'storage' | 'cache' | 'privacy'

const TITLES: Record<DetailKey, { title: string; Icon: React.ComponentType<{ className?: string }> }> = {
  ticketing: { title: 'تیکت و پشتیبانی', Icon: IoHelpBuoyOutline },
  about: { title: 'درباره ما', Icon: IoInformationCircleOutline },
  logs: { title: 'لاگ نرم‌افزار', Icon: IoDocumentTextOutline },
  storage: { title: 'فضای ذخیره و داده', Icon: IoCloudOutline },
  cache: { title: 'پاک کردن کش', Icon: IoTrashOutline },
  privacy: { title: 'حریم خصوصی', Icon: IoLockClosedOutline },
}

function Toggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center gap-3 border-b border-(--app-border)/60 px-3 py-3.5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-(--black)">{label}</p>
        <p className="mt-0.5 text-xs text-(--teal-tertiary)">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={onChange}
        className={`relative h-7 w-12 shrink-0 rounded-full border-2 transition ${
          value ? 'border-(--teal-primary) bg-(--teal-primary)' : 'border-(--app-border) bg-(--app-border)'
        }`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${value ? 'right-0.5' : 'left-0.5'}`} />
      </button>
    </div>
  )
}

export default function SettingsDetailPage() {
  const navigate = useNavigate()
  const { section } = useParams<{ section: string }>()
  const key = section as DetailKey
  const config = TITLES[key]
  const [ticketSubmitted, setTicketSubmitted] = useState(false)
  const [ticketSubject, setTicketSubject] = useState('مشکل در اتصال پنل')
  const [ticketMessage, setTicketMessage] = useState('')
  const [cacheCleared, setCacheCleared] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(() => getBooleanPreference('settings_analytics', false))
  const [diagnosticsEnabled, setDiagnosticsEnabled] = useState(() => getBooleanPreference('settings_diagnostics', true))
  const [logs, setLogs] = useState<BridgeActivityLog[]>(() => getActivityLogs().logs)
  const [storageSummary] = useState(() => getStorageSummary())

  const saveToggle = (preferenceKey: string, next: boolean, apply: (value: boolean) => void) => {
    const result = setPreference(preferenceKey, next)
    if (!result.success) {
      appToast.error({ title: 'ذخیره تنظیمات ناموفق', message: result.error })
      return
    }
    apply(next)
  }

  if (!config) {
    return <Navigate to="/app/settings" replace />
  }

  const { title, Icon } = config

  return (
    <div dir="rtl" className="flex min-h-full w-full flex-col bg-(--background-light) text-right">
      <header className="flex shrink-0 items-center gap-3 border-b border-(--app-border)/70 bg-(--surface-light) px-3 py-3">
        <button
          type="button"
          onClick={() => navigate('/app/settings')}
          className="flex h-10 w-10 items-center justify-center rounded-full text-(--teal-tertiary) transition hover:bg-(--app-gradient-start)"
          aria-label="بازگشت به تنظیمات"
        >
          <IoArrowBack className="h-6 w-6 rotate-180" />
        </button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--teal-primary)/10 text-(--teal-primary)">
          <Icon className="h-5 w-5" />
        </div>
        <h1 className="min-w-0 truncate text-lg font-semibold text-(--black)">{title}</h1>
      </header>

      <main className="flex-1 overflow-auto px-4 pb-7 pt-4">
        {key === 'ticketing' && (
          <>
            <section className="rounded-xl border border-(--app-border) bg-(--white) p-4">
              <h2 className="text-base font-semibold text-(--black)">ارسال درخواست جدید</h2>
              <label htmlFor="ticket-subject" className="mb-2 mt-4 block text-sm text-(--teal-tertiary)">موضوع</label>
              <input
                id="ticket-subject"
                type="text"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                className="h-12 w-full rounded-xl border border-(--app-border) bg-(--white) px-3 text-sm outline-none focus:border-(--teal-primary)"
              />
              <label htmlFor="ticket-message" className="mb-2 mt-3 block text-sm text-(--teal-tertiary)">توضیحات</label>
              <textarea
                id="ticket-message"
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder="توضیحات درخواست را وارد کنید"
                className="h-24 w-full resize-none rounded-xl border border-(--app-border) bg-(--white) p-3 text-sm outline-none focus:border-(--teal-primary)"
              />
              <button
                type="button"
                onClick={() => {
                  if (!ticketSubject.trim() || !ticketMessage.trim()) {
                    appToast.warning({ title: 'اطلاعات ناقص است', message: 'موضوع و توضیحات درخواست را وارد کنید.' })
                    return
                  }
                  const result = sendSupportTicket(ticketSubject.trim(), ticketMessage.trim())
                  if (!result.success) {
                    appToast.error({ title: 'ارسال درخواست ناموفق', message: result.error })
                    return
                  }
                  setTicketSubmitted(true)
                  appToast.success({ title: 'پیام پشتیبانی آماده شد', message: 'ارسال در برنامه ایمیل ادامه پیدا می کند.' })
                }}
                className="mt-4 h-12 w-full rounded-xl bg-(--teal-primary) font-medium text-(--app-on-primary)"
              >
                ثبت تیکت
              </button>
              {ticketSubmitted && (
                <p className="mt-3 flex items-center gap-2 text-sm text-green-700">
                  <IoCheckmarkCircleOutline className="h-5 w-5" />
                  برنامه ارسال پیام پشتیبانی باز شد.
                </p>
              )}
            </section>
            <section className="mt-4 rounded-xl border border-(--app-border) bg-(--white) p-4">
              <h2 className="mb-3 text-sm font-semibold text-(--teal-tertiary)">راه های تماس</h2>
              <p className="flex items-center gap-2 text-sm text-(--black)"><IoCallOutline className="text-(--teal-primary)" /> ۰۹۹۰۰۲۱۳۰۰۹</p>
              <p className="mt-3 flex items-center gap-2 text-sm text-(--black)"><IoMailOutline className="text-(--teal-primary)" /> support@pazhonic.ir</p>
            </section>
          </>
        )}

        {key === 'about' && (
          <>
            <section className="rounded-xl border border-(--app-border) bg-(--white) p-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-(--teal-primary)/10 text-(--teal-primary)">
                <IoShieldCheckmarkOutline className="h-9 w-9" />
              </div>
              <h2 className="mt-3 text-xl font-bold text-(--black)">پاژونیک</h2>
              <p className="mt-1 text-sm text-(--teal-tertiary)">مدیریت و کنترل پنل های حفاظتی</p>
            </section>
            <section className="mt-4 overflow-hidden rounded-xl border border-(--app-border) bg-(--white)">
              <div className="flex justify-between border-b border-(--app-border)/60 px-3 py-3 text-sm">
                <span className="text-(--teal-tertiary)">نسخه نرم افزار</span><span className="font-medium">1.0.0 (۱۴۰۳)</span>
              </div>
              <div className="flex justify-between border-b border-(--app-border)/60 px-3 py-3 text-sm">
                <span className="text-(--teal-tertiary)">وب سایت</span><span className="font-medium">pazhonic.ir</span>
              </div>
              <div className="flex justify-between px-3 py-3 text-sm">
                <span className="text-(--teal-tertiary)">پشتیبانی</span><span className="font-medium">۰۹۹۰۰۲۱۳۰۰۹</span>
              </div>
            </section>
          </>
        )}

        {key === 'logs' && (
          <>
            <section className="flex items-center justify-between rounded-xl border border-(--app-border) bg-(--white) px-3 py-3">
              <div>
                <p className="font-medium text-(--black)">رویدادهای اخیر</p>
                <p className="text-xs text-(--teal-tertiary)">آخرین عملیات ثبت شده در برنامه</p>
              </div>
              <button type="button" onClick={() => setLogs(getActivityLogs().logs)} className="flex h-10 w-10 items-center justify-center rounded-full text-(--teal-primary)" aria-label="به روز رسانی">
                <IoRefreshOutline className="h-5 w-5" />
              </button>
            </section>
            <ul className="mt-3 overflow-hidden rounded-xl border border-(--app-border) bg-(--white)">
              {logs.length === 0 && (
                <li className="px-3 py-5 text-center text-sm text-(--teal-tertiary)">هنوز رویدادی ثبت نشده است.</li>
              )}
              {logs.map((log) => (
                <li key={log.id} className="flex gap-3 border-b border-(--app-border)/60 px-3 py-3 last:border-b-0">
                  {log.tone === 'success'
                    ? <IoCheckmarkCircleOutline className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                    : <IoWarningOutline className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />}
                  <div>
                    <p className="text-sm font-medium text-(--black)">{log.label}</p>
                    <p className="mt-0.5 text-xs text-(--teal-tertiary)">{log.detail} - {new Date(log.timestamp).toLocaleString('fa-IR')}</p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {key === 'storage' && (
          <>
            <section className="rounded-xl border border-(--app-border) bg-(--white) p-4">
              <p className="text-sm text-(--teal-tertiary)">اطلاعات محلی ذخیره شده</p>
              <p className="mt-1 text-2xl font-bold text-(--black)">{toPersianDigits(String(storageSummary.panels))} پنل</p>
              <p className="mt-2 text-xs text-(--teal-tertiary)">داده ثبت شده در پایگاه داده برنامه</p>
            </section>
            <section className="mt-4 overflow-hidden rounded-xl border border-(--app-border) bg-(--white)">
              {[
                ['اطلاعات پنل ها', `${toPersianDigits(String(storageSummary.panels))} مورد`],
                ['پوشه های پنل', `${toPersianDigits(String(storageSummary.folders))} مورد`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-(--app-border)/60 px-3 py-3 text-sm last:border-b-0">
                  <span className="text-(--black)">{label}</span>
                  <span className="text-(--teal-tertiary)">{value}</span>
                </div>
              ))}
            </section>
          </>
        )}

        {key === 'cache' && (
          <section className="rounded-xl border border-(--app-border) bg-(--white) p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <IoTrashOutline className="h-6 w-6" />
            </div>
            <h2 className="mt-3 text-lg font-semibold text-(--black)">پاک کردن فایل های موقت</h2>
            <p className="mt-2 text-sm leading-6 text-(--teal-tertiary)">
              پاک کردن کش اطلاعات حساب و پنل های ذخیره شده را حذف نمی کند.
            </p>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-(--background-light) px-3 py-3 text-sm">
              <span>وضعیت کش WebView</span>
              <span className="font-medium">{cacheCleared ? 'پاک شد' : 'آماده پاک سازی'}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const result = clearAppCache()
                if (!result.success) {
                  appToast.error({ title: 'پاک کردن کش ناموفق', message: result.error })
                  return
                }
                setCacheCleared(true)
                appToast.success({ title: 'کش پاک شد', message: 'فایل های موقت برنامه حذف شدند.' })
              }}
              disabled={cacheCleared}
              className="mt-4 h-12 w-full rounded-xl bg-red-500 font-medium text-white disabled:opacity-50"
            >
              {cacheCleared ? 'کش پاک شد' : 'پاک کردن کش'}
            </button>
          </section>
        )}

        {key === 'privacy' && (
          <>
            <section className="overflow-hidden rounded-xl border border-(--app-border) bg-(--white)">
              <Toggle
                label="ارسال گزارش خطا"
                description="برای بهبود عملکرد برنامه"
                value={diagnosticsEnabled}
                onChange={() => saveToggle('settings_diagnostics', !diagnosticsEnabled, setDiagnosticsEnabled)}
              />
              <Toggle
                label="تحلیل نحوه استفاده"
                description="ارسال اطلاعات آماری بدون مشخصات هویتی"
                value={analyticsEnabled}
                onChange={() => saveToggle('settings_analytics', !analyticsEnabled, setAnalyticsEnabled)}
              />
            </section>
            <section className="mt-4 rounded-xl border border-(--app-border) bg-(--white) p-4">
              <h2 className="font-semibold text-(--black)">حفظ حریم خصوصی</h2>
              <p className="mt-2 text-sm leading-6 text-(--teal-tertiary)">
                اطلاعات پنل و حساب کاربری تنها برای اجرای قابلیت های برنامه استفاده می شوند.
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
