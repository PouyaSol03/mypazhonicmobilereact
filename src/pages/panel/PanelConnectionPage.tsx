import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { IoArrowBack, IoChatbubbleOutline, IoGlobeOutline, IoWifi } from 'react-icons/io5'
import { FaBuilding } from 'react-icons/fa'
import { toPersianDigits } from '../../utils/digits'
import type { PanelDetail } from '../../components/PanelDetailSheet'
import PanelSMSPage from './PanelSMSPage'

const WAY_LABELS: Record<string, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  sms: { label: 'اتصال از طریق SMS', Icon: IoChatbubbleOutline },
  internet: { label: 'اتصال از طریق اینترنت', Icon: IoGlobeOutline },
  wifi: { label: 'اتصال از طریق وای‌فای', Icon: IoWifi },
}

export default function PanelConnectionPage() {
  const navigate = useNavigate()
  const { way } = useParams<{ way: string }>()
  const location = useLocation()
  const panel = location.state?.panel as PanelDetail | undefined

  if (way === 'sms') {
    return <PanelSMSPage />
  }

  const wayConfig = way ? WAY_LABELS[way] : null

  if (!panel || !wayConfig) {
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

  const { label, Icon } = wayConfig

  return (
    <div className="flex min-h-full w-full flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b border-(--app-border) bg-(--surface-light) px-3 py-3">
        <button
          type="button"
          onClick={() => navigate('/app/home')}
          className="flex h-10 w-10 items-center justify-center rounded-full text-(--teal-tertiary) transition hover:bg-(--app-gradient-start)"
          aria-label="بازگشت"
        >
          <IoArrowBack className="h-6 w-6" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--teal-primary)/10 text-(--teal-primary)">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-(--black)">{label}</h1>
            <p className="truncate text-sm text-(--teal-tertiary)">{panel.name}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto px-4 py-4">
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-medium text-(--teal-tertiary)">اطلاعات پنل</h2>
          <div className="rounded-xl border border-(--app-border) bg-(--white) overflow-hidden">
            <div className="flex items-center gap-3 border-b border-(--app-border)/70 px-3 py-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                  panel.status === 'online' ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'
                }`}
              >
                <FaBuilding className="h-6 w-6" aria-hidden />
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
              <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <span className="text-sm text-(--teal-tertiary)">آی‌پی</span>
                <span className="text-sm font-medium text-(--black)">{panel.ip}</span>
              </div>
              <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <span className="text-sm text-(--teal-tertiary)">شماره تماس</span>
                <span className="text-sm font-medium text-(--black)">{toPersianDigits(panel.phone)}</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-(--teal-tertiary)">تنظیمات اتصال</h2>
          <div className="rounded-xl border border-(--app-border) bg-(--white) p-4">
            <p className="text-sm text-(--teal-tertiary)/90">
              تنظیمات مخصوص این نوع اتصال برای پنل «{panel.name}» در این صفحه قرار می‌گیرد.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
