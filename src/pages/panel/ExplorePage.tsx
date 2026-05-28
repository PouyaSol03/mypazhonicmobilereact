import { useNavigate } from 'react-router-dom'
import {
  IoChevronForward,
  IoFolderOutline,
  IoGridOutline,
  IoPersonOutline,
  IoSettingsOutline,
} from 'react-icons/io5'
import { getFolders, getPanelsForUser } from '../../utils/androidBridge'
import { toPersianDigits } from '../../utils/digits'

const ExplorePage = () => {
  const navigate = useNavigate()
  const panels = getPanelsForUser().panels
  const folders = getFolders().folders

  const actions = [
    { label: 'مدیریت پنل ها', detail: 'ثبت، ویرایش و دسته بندی', route: '/app/home', Icon: IoGridOutline },
    { label: 'تنظیمات برنامه', detail: 'پوشه ها، پشتیبانی و حریم خصوصی', route: '/app/settings', Icon: IoSettingsOutline },
    { label: 'حساب کاربری', detail: 'امنیت، پشتیبان و اشتراک گذاری', route: '/app/profile', Icon: IoPersonOutline },
  ]

  return (
    <div dir="rtl" className="flex min-h-full w-full flex-col bg-(--background-light) px-4 pb-7 pt-4 text-right">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-(--black)">کاوش</h1>
        <p className="mt-1 text-sm text-(--teal-tertiary)">دسترسی سریع به اطلاعات و عملیات برنامه</p>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-(--app-border) bg-(--white) p-4">
          <IoGridOutline className="h-5 w-5 text-(--teal-primary)" aria-hidden />
          <p className="mt-3 text-2xl font-bold text-(--black)">{toPersianDigits(String(panels.length))}</p>
          <p className="text-sm text-(--teal-tertiary)">پنل ثبت شده</p>
        </div>
        <div className="rounded-xl border border-(--app-border) bg-(--white) p-4">
          <IoFolderOutline className="h-5 w-5 text-(--teal-primary)" aria-hidden />
          <p className="mt-3 text-2xl font-bold text-(--black)">{toPersianDigits(String(folders.length))}</p>
          <p className="text-sm text-(--teal-tertiary)">پوشه فعال</p>
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 px-1 text-xs font-semibold text-(--teal-tertiary)">دسترسی سریع</h2>
        <div className="overflow-hidden rounded-xl border border-(--app-border) bg-(--white)">
          {actions.map(({ label, detail, route, Icon }, index) => (
            <button
              key={route}
              type="button"
              onClick={() => navigate(route)}
              className={`flex w-full items-center gap-3 px-3 py-3.5 text-right transition active:bg-(--app-gradient-start) ${
                index < actions.length - 1 ? 'border-b border-(--app-border)/60' : ''
              }`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-(--teal-primary)/10 text-(--teal-primary)">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-(--black)">{label}</span>
                <span className="mt-0.5 block text-xs text-(--teal-tertiary)">{detail}</span>
              </span>
              <IoChevronForward className="h-5 w-5 shrink-0 rotate-180 text-(--teal-tertiary)" aria-hidden />
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

export default ExplorePage
