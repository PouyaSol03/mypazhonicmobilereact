import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  IoArrowBack,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoCloudDownloadOutline,
  IoCloudUploadOutline,
  IoDownloadOutline,
  IoExitOutline,
  IoInformationCircleOutline,
  IoPulseOutline,
  IoRefreshOutline,
  IoSearchOutline,
  IoSettingsOutline,
  IoShieldCheckmarkOutline,
  IoTimeOutline,
  IoWifi,
} from 'react-icons/io5'
import { appToast } from '../../utils/appToast'
import { toPersianDigits } from '../../utils/digits'
import { wifiReceiveData, wifiSendCommand, wifiSendData, type WifiPanelBridgeResult } from '../../utils/androidBridge'
import type { PanelDetail } from '../../components/PanelDetailSheet'

type WifiPageConfig = {
  path: string
  title: string
  group: string
  code?: number
  tabCode?: number
  rows: Array<{ label: string; value: string }>
  mode?: 'details' | 'partitions' | 'events' | 'reports'
}

type WifiLog = {
  id: number
  title: string
  detail: string
  tone: 'success' | 'warning' | 'info' | 'error'
  time: string
}

type Partition = {
  id: number
  name: string
  enabled: boolean
  entryDelay: string
  exitDelay: string
  warningDelay: string
  autoArm: string
  disarmDelay: string
  sensors: string[]
}

const STORAGE_KEY = 'pazhonic_wifi_selected_panel'
const ROOT = 'select-branch'

const pages: WifiPageConfig[] = [
  {
    path: 'panel-details',
    title: 'مشخصات پنل',
    group: 'اصلی',
    code: 1000,
    tabCode: 3,
    mode: 'details',
    rows: [
      { label: 'مدل پنل', value: 'PHC-64-L' },
      { label: 'نسخه نرم افزار', value: '3.111' },
      { label: 'نسخه سخت افزار', value: '4' },
    ],
  },
  {
    path: 'partitions',
    title: 'پارتیشن ها',
    group: 'اصلی',
    code: 1001,
    mode: 'partitions',
    rows: [
      { label: 'ناحیه ۱', value: 'فعال' },
      { label: 'ناحیه ۲', value: 'فعال' },
    ],
  },
  { path: 'inputs', title: 'ورودی ها', group: 'اصلی', code: 1002, rows: [{ label: 'زون ۱', value: 'نرمال' }, { label: 'زون ۲', value: 'باز' }] },
  { path: 'outputs', title: 'خروجی ها', group: 'اصلی', code: 1003, rows: [{ label: 'خروجی ۱', value: 'خاموش' }, { label: 'خروجی ۲', value: 'روشن' }] },
  { path: 'users/users', title: 'کاربران', group: 'کاربران', code: 1004, tabCode: 1, rows: [{ label: 'کاربر ۱', value: 'مدیر' }, { label: 'کاربر ۲', value: 'مهمان' }] },
  { path: 'users/access', title: 'دسترسی ها', group: 'کاربران', code: 1004, tabCode: 2, rows: [{ label: 'رمز مدیر', value: 'فعال' }, { label: 'رمز کاربر', value: 'فعال' }] },
  { path: 'events', title: 'رویدادها', group: 'اصلی', mode: 'events', rows: [{ label: 'ورود کاربر', value: 'کد ۱۱۰' }, { label: 'قطع برق', value: 'کد ۲۱۰' }] },
  { path: 'boss-modules/boss-keypads', title: 'کیپدهای باس', group: 'ماژول های باس', code: 1007, tabCode: 1, rows: [{ label: 'کیپد ۱', value: 'آنلاین' }, { label: 'کیپد ۲', value: 'آفلاین' }] },
  { path: 'boss-modules/boss-reciver', title: 'گیرنده رادیویی', group: 'ماژول های باس', code: 1007, tabCode: 2, rows: [{ label: 'گیرنده ۱', value: 'فعال' }] },
  { path: 'boss-modules/boss-modules', title: 'ماژول دما و رطوبت', group: 'ماژول های باس', code: 1007, tabCode: 3, rows: [{ label: 'دما', value: '۲۵ درجه' }, { label: 'رطوبت', value: '۴۰٪' }] },
  { path: 'boss-modules/input-increaser', title: 'افزایش دهنده ورودی', group: 'ماژول های باس', code: 1007, tabCode: 4, rows: [{ label: 'ماژول ۱', value: '۸ ورودی' }] },
  { path: 'boss-modules/output-increaser', title: 'افزایش دهنده خروجی', group: 'ماژول های باس', code: 1007, tabCode: 5, rows: [{ label: 'ماژول ۱', value: '۴ خروجی' }] },
  { path: 'monitoring', title: 'مانیتورینگ', group: 'ارتباطی', code: 1008, rows: [{ label: 'مرکز مانیتورینگ', value: 'فعال' }, { label: 'پروتکل', value: 'TCP' }] },
  { path: 'communication-modules/gsm', title: 'تنظیمات GSM', group: 'ارتباطی', code: 1009, tabCode: 1, rows: [{ label: 'آنتن', value: 'خوب' }, { label: 'اپراتور', value: 'ایرانسل' }] },
  { path: 'communication-modules/sms-contacts', title: 'مخاطبین پیامک', group: 'ارتباطی', code: 1009, tabCode: 2, rows: [{ label: 'مخاطب ۱', value: 'فعال' }] },
  { path: 'communication-modules/call-contacts', title: 'مخاطبین تماس', group: 'ارتباطی', code: 1009, tabCode: 3, rows: [{ label: 'تماس ۱', value: 'فعال' }] },
  { path: 'communication-modules/voicemail-number', title: 'شماره پیام صوتی', group: 'ارتباطی', code: 1009, tabCode: 4, rows: [{ label: 'شماره', value: 'تنظیم نشده' }] },
  { path: 'card', title: 'کارت ها', group: 'تجهیزات', code: 1010, rows: [{ label: 'کارت ۱', value: 'ثبت شده' }] },
  { path: 'remote', title: 'ریموت ها', group: 'تجهیزات', code: 1011, rows: [{ label: 'ریموت ۱', value: 'ثبت شده' }] },
  { path: 'reports', title: 'گزارشات', group: 'اصلی', code: 1013, mode: 'reports', rows: [{ label: 'آخرین گزارش', value: 'آماده دریافت' }] },
  { path: 'debug/input-status', title: 'وضعیت ورودی ها', group: 'عیب یابی', code: 1014, tabCode: 1, rows: [{ label: 'زون ۱', value: 'نرمال' }] },
  { path: 'debug/partition-status', title: 'وضعیت پارتیشن ها', group: 'عیب یابی', code: 1014, tabCode: 2, rows: [{ label: 'پارتیشن ۱', value: 'غیرمسلح' }] },
  { path: 'debug/system-status', title: 'وضعیت سیستم', group: 'عیب یابی', code: 1014, tabCode: 3, rows: [{ label: 'برق شهر', value: 'وصل' }, { label: 'باتری', value: 'خوب' }] },
  { path: 'debug/status-analysis', title: 'تحلیل وضعیت', group: 'عیب یابی', code: 1014, tabCode: 4, rows: [{ label: 'ولتاژ', value: '۱۳.۸V' }] },
  { path: 'debug/inner-gsm', title: 'GSM داخلی', group: 'عیب یابی', code: 1014, tabCode: 5, rows: [{ label: 'سیگنال', value: 'خوب' }] },
  { path: 'debug/output-status', title: 'وضعیت خروجی ها', group: 'عیب یابی', code: 1014, tabCode: 6, rows: [{ label: 'خروجی ۱', value: 'خاموش' }] },
  { path: 'debug/temp-system', title: 'دما و رطوبت', group: 'عیب یابی', code: 1014, tabCode: 7, rows: [{ label: 'دما', value: '۲۵ درجه' }] },
  { path: 'debug/core-status', title: 'هسته پردازنده', group: 'عیب یابی', code: 1014, tabCode: 8, rows: [{ label: 'وضعیت', value: 'پایدار' }] },
  { path: 'setting/basic-setting', title: 'تنظیمات ساده', group: 'تنظیمات', code: 1012, tabCode: 1, rows: [{ label: 'صدای آژیر', value: 'فعال' }, { label: 'تاخیر ورود', value: '۳۰ ثانیه' }] },
  { path: 'setting/advanced-setting', title: 'تنظیمات پیشرفته', group: 'تنظیمات', code: 1012, tabCode: 2, rows: [{ label: 'نظارت خط', value: 'فعال' }, { label: 'حالت سرویس', value: 'غیرفعال' }] },
]

const partitions: Partition[] = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  name: `ناحیه ${toPersianDigits(index + 1)}`,
  enabled: index < 4,
  entryDelay: index < 4 ? '۳۰ ثانیه' : '۳۰ ثانیه',
  exitDelay: index < 4 ? '۲۰ ثانیه' : '۳۰ ثانیه',
  warningDelay: index < 4 ? '۱۰ ثانیه' : '۶۰ ثانیه',
  autoArm: index < 4 ? '۲ دقیقه' : 'غیرفعال',
  disarmDelay: '۲۵۰ ثانیه',
  sensors: index < 4 ? ['حالت پنل دو زمانه', 'ضربه ای'] : ['اتمام زمان هشدار', 'تمام ورودی ها'],
}))

const groups = Array.from(new Set(pages.map((page) => page.group)))

function readStoredPanel(): PanelDetail | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PanelDetail) : null
  } catch {
    return null
  }
}

function formatResult(result: WifiPanelBridgeResult): string {
  if (!result.success) return result.error ?? 'خطا در ارتباط با پنل'
  if (result.chunks?.length) return result.chunks.join('\n')
  return result.response ?? 'انجام شد'
}

function nowLabel() {
  return new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(new Date())
}

export default function WifiConnectionPage({ panel: panelFromState }: { panel?: PanelDetail }) {
  const navigate = useNavigate()
  const location = useLocation()
  const panel = panelFromState ?? readStoredPanel()
  const currentPath = location.pathname.split(`${ROOT}/`)[1] ?? 'panel-details'
  const activePage = pages.find((page) => page.path === currentPath) ?? pages[0]
  const [activeGroup, setActiveGroup] = useState(activePage.group)
  const [busy, setBusy] = useState<string | null>(null)
  const [logs, setLogs] = useState<WifiLog[]>([
    { id: 1, title: 'آماده اتصال', detail: 'اطلاعات پنل از حافظه برنامه خوانده شد', tone: 'info', time: nowLabel() },
  ])

  useEffect(() => {
    if (panelFromState) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(panelFromState))
  }, [panelFromState])

  const visiblePages = useMemo(() => pages.filter((page) => page.group === activeGroup), [activeGroup])

  const appendLog = (title: string, detail: string, tone: WifiLog['tone'] = 'info') => {
    setLogs((prev) => [{ id: Date.now(), title, detail, tone, time: nowLabel() }, ...prev].slice(0, 6))
  }

  if (!panel) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-(--teal-tertiary)">پنل انتخاب نشده است.</p>
        <button type="button" onClick={() => navigate('/app/home')} className="h-11 rounded-lg bg-(--teal-primary) px-5 font-semibold text-(--app-on-primary)">
          بازگشت به پنل ها
        </button>
      </div>
    )
  }

  const basePath = `/app/panel/connect/wifi/${ROOT}`
  const hasRequiredWifiFields = Boolean(panel.ip && panel.port && panel.serialNumber && panel.codeUD)

  const runOperation = (
    label: string,
    action: () => WifiPanelBridgeResult,
    options?: { loading?: string; silent?: boolean }
  ) => {
    setBusy(label)
    const toastId = appToast.loading({ title: options?.loading ?? 'در حال ارتباط با پنل', message: label })
    window.setTimeout(() => {
      const output = action()
      appToast.dismiss(toastId)
      setBusy(null)
      if (output.success) {
        appendLog(label, formatResult(output).slice(0, 80), 'success')
        if (!options?.silent) appToast.success({ title: 'عملیات انجام شد', message: label })
      } else {
        appendLog(label, output.error ?? 'ارتباط ناموفق', 'error')
        appToast.error({ title: 'ارتباط ناموفق', message: output.error })
      }
    }, 80)
  }

  const runBatch = (type: 'download' | 'upload') => {
    const batchPages = pages.filter((page) => page.code && page.mode !== 'events')
    setBusy(type)
    const toastId = appToast.loading({
      title: type === 'download' ? 'دریافت همه اطلاعات' : 'ارسال همه اطلاعات',
      message: `${toPersianDigits(batchPages.length)} بخش`,
    })
    window.setTimeout(() => {
      const failed = batchPages.find((page) => {
        const result =
          type === 'download'
            ? wifiReceiveData(panel, page.code!, page.tabCode, page.mode === 'reports' ? 20 : null)
            : wifiSendData(panel, page.code!, page.tabCode)
        return !result.success
      })
      appToast.dismiss(toastId)
      setBusy(null)
      if (failed) {
        appendLog(type === 'download' ? 'دریافت همه اطلاعات' : 'ارسال همه اطلاعات', `خطا در ${failed.title}`, 'error')
        appToast.error({ title: 'عملیات کامل نشد', message: failed.title })
      } else {
        appendLog(type === 'download' ? 'دریافت همه اطلاعات' : 'ارسال همه اطلاعات', 'همه تب ها با موفقیت پردازش شدند', 'success')
        appToast.success({ title: 'عملیات کامل شد', message: 'همه تب ها پردازش شدند' })
      }
    }, 120)
  }

  return (
    <div className="flex min-h-full w-full flex-col bg-[#f4f8f7]">
      <header className="shrink-0 border-b border-(--app-border) bg-(--white) px-3 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top,0px))]">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/app/home')} className="flex h-10 w-10 items-center justify-center rounded-full text-(--teal-tertiary) active:bg-(--app-gradient-start)" aria-label="بازگشت">
            <IoArrowBack className="h-6 w-6" />
          </button>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--teal-primary)/10 text-(--teal-primary)">
            <IoWifi className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 text-right">
            <h1 className="truncate text-base font-semibold text-(--black)">اتصال از طریق وای فای</h1>
            <p className="truncate text-xs text-(--teal-tertiary)">{activePage.title} - {panel.name}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            آماده
          </span>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-3">
        {!hasRequiredWifiFields && (
          <div className="mb-3 rounded-lg border border-amber-300/70 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-800">
            برای ارتباط واقعی، IP، پورت، سریال پنل و کد آپلود/دانلود باید در اطلاعات پنل ثبت شده باشد.
          </div>
        )}

        <PanelSummary panel={panel} />
        <LogRail logs={logs} />

        <section className="sticky top-0 z-10 -mx-3 mb-3 border-y border-(--app-border)/70 bg-[#f4f8f7]/95 px-3 py-2 backdrop-blur">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {groups.map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => setActiveGroup(group)}
                className={`h-9 shrink-0 rounded-full px-3 text-xs font-semibold transition ${
                  group === activeGroup
                    ? 'bg-(--teal-primary) text-(--app-on-primary)'
                    : 'border border-(--app-border) bg-(--white) text-(--teal-tertiary)'
                }`}
              >
                {group}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto">
            {visiblePages.map((page) => (
              <Link
                key={page.path}
                to={`${basePath}/${page.path}`}
                state={{ panel }}
                onClick={() => setActiveGroup(page.group)}
                className={`flex h-10 shrink-0 items-center justify-center rounded-lg px-3 text-center text-xs font-semibold transition ${
                  page.path === activePage.path
                    ? 'bg-[#10272d] text-white'
                    : 'bg-(--white) text-(--teal-tertiary) ring-1 ring-(--app-border)'
                }`}
              >
                {page.title}
              </Link>
            ))}
          </div>
        </section>

        <Routes>
          <Route index element={<Navigate to={`${ROOT}/panel-details`} replace state={{ panel }} />} />
          <Route path={`${ROOT}`} element={<Navigate to="panel-details" replace state={{ panel }} />} />
          {pages.map((page) => (
            <Route
              key={page.path}
              path={`${ROOT}/${page.path}`}
              element={
                <WifiSection
                  busy={busy}
                  onLog={appendLog}
                  onRunOperation={runOperation}
                  panel={panel}
                  page={page}
                />
              }
            />
          ))}
          <Route path="*" element={<Navigate to={`${ROOT}/panel-details`} replace state={{ panel }} />} />
        </Routes>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[48rem] border-t border-(--app-border) bg-(--white)/95 px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] pt-2 backdrop-blur">
        <div className="grid grid-cols-4 gap-2">
          <FooterAction disabled={busy != null} label="پینگ" icon={<IoPulseOutline className="h-5 w-5" />} onClick={() => runOperation('پینگ پنل', () => wifiSendData(panel, 1000, 3), { loading: 'بررسی اتصال' })} />
          <FooterAction disabled={busy != null} label="دریافت همه" icon={<IoDownloadOutline className="h-5 w-5" />} onClick={() => runBatch('download')} />
          <FooterAction disabled={busy != null} label="ارسال همه" icon={<IoCloudUploadOutline className="h-5 w-5" />} onClick={() => runBatch('upload')} />
          <FooterAction disabled={busy != null} label="خروج" icon={<IoExitOutline className="h-5 w-5" />} onClick={() => navigate('/app/home')} />
        </div>
      </footer>
    </div>
  )
}

function PanelSummary({ panel }: { panel: PanelDetail }) {
  return (
    <section className="mb-3 overflow-hidden rounded-xl border border-(--app-border) bg-(--white)">
      <div className="flex items-center justify-between gap-3 border-b border-(--app-border)/70 px-3 py-3">
        <div className="min-w-0 text-right">
          <h2 className="truncate text-sm font-semibold text-(--black)">{panel.name}</h2>
          <p className="mt-0.5 text-xs text-(--teal-tertiary)">خلاصه پنل و مسیر ارتباط</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--teal-primary)/10 text-(--teal-primary)">
          <IoShieldCheckmarkOutline className="h-5 w-5" aria-hidden />
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
        <InfoPill label="آدرس شبکه" value={panel.ip || '-'} />
        <InfoPill label="پورت شبکه" value={panel.port ? toPersianDigits(panel.port) : '-'} />
        <InfoPill label="سریال پنل" value={panel.serialNumber || '-'} />
        <InfoPill label="کد شعبه" value={panel.codeUD || '-'} />
      </div>
    </section>
  )
}

function LogRail({ logs }: { logs: WifiLog[] }) {
  return (
    <section className="mb-3 rounded-xl border border-(--app-border) bg-(--white) p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-(--black)">گزارش ارتباط</span>
        <IoInformationCircleOutline className="h-5 w-5 text-(--teal-tertiary)" aria-hidden />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {logs.map((log) => (
          <div key={log.id} className="min-w-[13rem] rounded-lg border border-(--app-border)/70 bg-(--surface-light) px-3 py-2 text-right">
            <div className="flex items-center justify-between gap-2">
              <span className={`h-2 w-2 rounded-full ${log.tone === 'success' ? 'bg-emerald-500' : log.tone === 'error' ? 'bg-red-500' : log.tone === 'warning' ? 'bg-amber-500' : 'bg-(--teal-primary)'}`} />
              <span className="text-[11px] text-(--teal-tertiary)">{log.time}</span>
            </div>
            <p className="mt-1 text-xs font-semibold text-(--black)">{log.title}</p>
            <p className="mt-0.5 line-clamp-2 text-[11px] leading-5 text-(--teal-tertiary)">{log.detail}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function InfoPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded-lg bg-(--app-gradient-start) px-3 py-2 text-right">
      <span className="block text-[11px] text-(--teal-tertiary)">{label}</span>
      <span className="mt-1 block truncate text-sm font-semibold text-(--black)">{value}</span>
    </div>
  )
}

function WifiSection({
  busy,
  onLog,
  onRunOperation,
  panel,
  page,
}: {
  busy: string | null
  onLog: (title: string, detail: string, tone?: WifiLog['tone']) => void
  onRunOperation: (label: string, action: () => WifiPanelBridgeResult, options?: { loading?: string; silent?: boolean }) => void
  panel: PanelDetail
  page: WifiPageConfig
}) {
  const [result, setResult] = useState('')
  const [reportCount, setReportCount] = useState('20')

  const run = (type: 'send' | 'receive' | 'reset') => {
    if (!page.code && type !== 'reset') return
    onRunOperation(type === 'send' ? `ارسال ${page.title}` : type === 'receive' ? `دریافت ${page.title}` : 'بازنشانی ارتباط پنل', () => {
      const output =
        type === 'reset'
          ? wifiSendCommand(panel, '9997')
          : type === 'receive'
            ? wifiReceiveData(panel, page.code!, page.tabCode, page.mode === 'reports' ? reportCount : null)
            : wifiSendData(panel, page.code!, page.tabCode)
      setResult(formatResult(output))
      return output
    })
  }

  if (page.mode === 'details') {
    return <PanelDetailsTab busy={busy} onRun={run} page={page} panel={panel} result={result} />
  }

  if (page.mode === 'partitions') {
    return <PartitionsTab busy={busy} onLog={onLog} onRun={run} result={result} />
  }

  return (
    <section className="rounded-xl border border-(--app-border) bg-(--white) p-3">
      <SectionTitle page={page} />

      {page.mode === 'reports' && (
        <label className="mb-3 block text-right text-xs font-medium text-(--teal-tertiary)">
          تعداد گزارش
          <input
            value={reportCount}
            onChange={(event) => setReportCount(event.target.value.replace(/\D/g, '').slice(0, 4))}
            inputMode="numeric"
            className="mt-1 h-11 w-full rounded-lg border border-(--app-border) bg-(--surface-light) px-3 text-right text-sm text-(--black) outline-none focus:border-(--teal-primary)"
          />
        </label>
      )}

      <div className="grid grid-cols-2 gap-2">
        {page.rows.map((row) => (
          <div key={row.label} className="rounded-lg border border-(--app-border)/70 bg-(--surface-light) px-3 py-2 text-right">
            <span className="block text-xs text-(--teal-tertiary)">{row.label}</span>
            <span className="mt-1 block text-sm font-semibold text-(--black)">{row.value}</span>
          </div>
        ))}
      </div>

      <InlineActions busy={busy} onRun={run} page={page} />
      <ResultBlock result={result} />
    </section>
  )
}

function PanelDetailsTab({ busy, onRun, page, panel, result }: { busy: string | null; onRun: (type: 'send' | 'receive' | 'reset') => void; page: WifiPageConfig; panel: PanelDetail; result: string }) {
  return (
    <section className="space-y-3">
      <div className="rounded-xl border border-(--app-border) bg-(--white) p-3">
        <SectionTitle page={page} />
        <div className="grid grid-cols-2 gap-2">
          <MetricCard label="ساعت پنل" value="۰۹:۲۸:۱۴" icon={<IoTimeOutline className="h-5 w-5" />} strong />
          <MetricCard label="تاریخ پنل" value="۱۴۰۵/۰۳/۰۷" icon={<IoInformationCircleOutline className="h-5 w-5" />} strong />
          <MetricCard label="مدل" value="PHC64-L" icon={<IoShieldCheckmarkOutline className="h-5 w-5" />} />
          <MetricCard label="نسخه نرم افزار" value="3.111" icon={<IoRefreshOutline className="h-5 w-5" />} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <ActionButton disabled={busy != null} onClick={() => onRun('receive')} icon={<IoCloudDownloadOutline className="h-5 w-5" />} label="دریافت زمان و مشخصات" />
          <ActionButton disabled={busy != null} onClick={() => onRun('send')} icon={<IoTimeOutline className="h-5 w-5" />} label="همگام سازی ساعت" />
        </div>
      </div>

      <div className="rounded-xl border border-(--app-border) bg-(--white) p-3">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-(--black)">تنظیمات شبکه</h3>
          <IoWifi className="h-5 w-5 text-(--teal-primary)" aria-hidden />
        </div>
        <div className="space-y-2">
          <NetworkRow label="Mac Address" value="02:A1:01:EE:E3:C4" />
          <NetworkRow label="IP" value={panel.ip || '192.168.10.174'} />
          <NetworkRow label="Subnet mask" value="255.255.255.0" />
          <NetworkRow label="Gateway" value="192.168.10.254" />
          <NetworkRow label="DNS 1" value="8.8.8.8" />
          <NetworkRow label="DNS 2" value="4.2.2.4" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" className="h-11 rounded-lg border border-(--teal-primary)/40 bg-(--teal-primary)/10 px-2 text-xs font-semibold text-(--teal-primary)">
            ویرایش تنظیمات شبکه
          </button>
          <ActionButton disabled={busy != null} onClick={() => onRun('receive')} icon={<IoDownloadOutline className="h-5 w-5" />} label="دریافت شبکه" />
        </div>
      </div>

      <ResultBlock result={result} />
    </section>
  )
}

function PartitionsTab({ busy, onLog, onRun, result }: { busy: string | null; onLog: (title: string, detail: string, tone?: WifiLog['tone']) => void; onRun: (type: 'send' | 'receive' | 'reset') => void; result: string }) {
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [query, setQuery] = useState('')
  const visible = partitions.filter((partition) => {
    const filterMatch = filter === 'all' || (filter === 'active' ? partition.enabled : !partition.enabled)
    const queryMatch = partition.name.includes(query.trim()) || String(partition.id).includes(query.trim())
    return filterMatch && queryMatch
  })

  return (
    <section className="space-y-3">
      <div className="rounded-xl border border-(--app-border) bg-(--white) p-3">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="text-right">
            <h2 className="text-base font-semibold text-(--black)">پارتیشن ها</h2>
            <p className="mt-1 text-xs text-(--teal-tertiary)">نمای کارت محور برای تنظیم سریع هر ناحیه</p>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--teal-primary)/10 text-(--teal-primary)">
            <IoShieldCheckmarkOutline className="h-5 w-5" aria-hidden />
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <MetricCard label="کل" value={toPersianDigits(partitions.length)} />
          <MetricCard label="فعال" value={toPersianDigits(partitions.filter((item) => item.enabled).length)} />
          <MetricCard label="غیرفعال" value={toPersianDigits(partitions.filter((item) => !item.enabled).length)} />
        </div>

        <div className="mt-3 flex gap-2">
          {[
            ['all', 'همه'],
            ['active', 'فعال'],
            ['inactive', 'غیرفعال'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value as 'all' | 'active' | 'inactive')}
              className={`h-9 flex-1 rounded-lg text-xs font-semibold ${
                filter === value ? 'bg-[#10272d] text-white' : 'bg-(--app-gradient-start) text-(--teal-tertiary)'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="mt-3 flex h-11 items-center gap-2 rounded-lg border border-(--app-border) bg-(--surface-light) px-3">
          <IoSearchOutline className="h-5 w-5 text-(--teal-tertiary)" aria-hidden />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جستجوی ناحیه"
            className="min-w-0 flex-1 bg-transparent text-right text-sm text-(--black) outline-none placeholder:text-(--teal-tertiary)/60"
          />
        </label>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <ActionButton disabled={busy != null} onClick={() => onRun('receive')} icon={<IoCloudDownloadOutline className="h-5 w-5" />} label="دریافت پارتیشن ها" />
          <ActionButton disabled={busy != null} onClick={() => onRun('send')} icon={<IoCloudUploadOutline className="h-5 w-5" />} label="ارسال پارتیشن ها" />
        </div>
      </div>

      <div className="space-y-2">
        {visible.map((partition) => (
          <PartitionCard
            key={partition.id}
            partition={partition}
            onEdit={() => onLog('ویرایش پارتیشن', `${partition.name} برای نسخه بعدی آماده ویرایش شد`, 'info')}
          />
        ))}
      </div>
      <ResultBlock result={result} />
    </section>
  )
}

function PartitionCard({ onEdit, partition }: { onEdit: () => void; partition: Partition }) {
  const [open, setOpen] = useState(false)

  return (
    <article className="overflow-hidden rounded-xl border border-(--app-border) bg-(--white)">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center gap-3 px-3 py-3 text-right">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${partition.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {partition.enabled ? <IoCheckmarkCircle className="h-6 w-6" /> : <IoCloseCircle className="h-6 w-6" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-(--black)">{partition.name}</span>
          <span className="mt-0.5 block text-xs text-(--teal-tertiary)">
            ورود {partition.entryDelay} - خروج {partition.exitDelay}
          </span>
        </span>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${partition.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {partition.enabled ? 'فعال' : 'غیرفعال'}
        </span>
      </button>

      {open && (
        <div className="border-t border-(--app-border)/70 px-3 pb-3 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <MiniField label="زمان هشدار" value={partition.warningDelay} />
            <MiniField label="مسلح خودکار" value={partition.autoArm} />
            <MiniField label="عدم مسلح شدن" value={partition.disarmDelay} />
            <MiniField label="تعداد سنسور" value={toPersianDigits(partition.sensors.length)} />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {partition.sensors.map((sensor) => (
              <span key={sensor} className="rounded-full bg-(--app-gradient-start) px-2.5 py-1 text-[11px] font-medium text-(--teal-tertiary)">
                {sensor}
              </span>
            ))}
          </div>
          <button type="button" onClick={onEdit} className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-(--teal-primary)/40 bg-(--teal-primary)/10 text-xs font-semibold text-(--teal-primary)">
            <IoSettingsOutline className="h-5 w-5" aria-hidden />
            تنظیمات این ناحیه
          </button>
        </div>
      )}
    </article>
  )
}

function SectionTitle({ page }: { page: WifiPageConfig }) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="text-right">
        <h2 className="text-base font-semibold text-(--black)">{page.title}</h2>
        <p className="mt-1 text-xs text-(--teal-tertiary)">
          {page.code ? `کد ${toPersianDigits(page.code)}${page.tabCode ? ` / تب ${toPersianDigits(page.tabCode)}` : ''}` : 'داده نمایشی داخلی'}
        </p>
      </div>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--teal-primary)/10 text-(--teal-primary)">
        <IoSettingsOutline className="h-5 w-5" aria-hidden />
      </span>
    </div>
  )
}

function MetricCard({ icon, label, strong, value }: { icon?: ReactNode; label: string; strong?: boolean; value: string }) {
  return (
    <div className="rounded-lg border border-(--app-border)/70 bg-(--surface-light) px-3 py-2 text-right">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-(--teal-tertiary)">{label}</span>
        {icon && <span className="text-(--teal-primary)">{icon}</span>}
      </div>
      <span className={`mt-1 block truncate font-semibold text-(--black) ${strong ? 'text-xl leading-8' : 'text-sm'}`}>{value}</span>
    </div>
  )
}

function NetworkRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3 rounded-lg bg-(--surface-light) px-3 py-2">
      <span className="text-xs font-medium text-(--teal-tertiary)">{label}</span>
      <span className="min-w-0 truncate text-left text-sm font-semibold text-(--black)" dir="ltr">{value}</span>
    </div>
  )
}

function MiniField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-(--surface-light) px-3 py-2 text-right">
      <span className="block text-[11px] text-(--teal-tertiary)">{label}</span>
      <span className="mt-0.5 block text-xs font-semibold text-(--black)">{value}</span>
    </div>
  )
}

function InlineActions({ busy, onRun, page }: { busy: string | null; onRun: (type: 'send' | 'receive' | 'reset') => void; page: WifiPageConfig }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      <ActionButton disabled={!page.code || busy != null} onClick={() => onRun('receive')} icon={<IoCloudDownloadOutline className="h-5 w-5" />} label="دریافت از پنل" />
      <ActionButton disabled={!page.code || busy != null || page.mode === 'events'} onClick={() => onRun('send')} icon={<IoCloudUploadOutline className="h-5 w-5" />} label="ارسال به پنل" />
    </div>
  )
}

function ResultBlock({ result }: { result: string }) {
  if (!result) return null
  return (
    <pre className="mt-3 max-h-44 overflow-auto rounded-lg bg-[#10272d] p-3 text-left text-[11px] leading-5 text-white" dir="ltr">
      {result}
    </pre>
  )
}

function ActionButton({ disabled, onClick, icon, label }: { disabled: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-(--teal-primary) px-2 text-xs font-semibold text-(--app-on-primary) disabled:bg-(--teal-tertiary)/30">
      {icon}
      {label}
    </button>
  )
}

function FooterAction({ disabled, icon, label, onClick }: { disabled: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className="flex h-12 flex-col items-center justify-center gap-1 rounded-lg border border-(--app-border) bg-(--surface-light) text-[11px] font-semibold text-(--teal-tertiary) disabled:opacity-50">
      <span className="text-(--teal-primary)">{icon}</span>
      {label}
    </button>
  )
}
