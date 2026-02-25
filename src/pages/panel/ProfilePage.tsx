import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  IoPersonCircleOutline,
  IoCallOutline,
  IoChevronForward,
  IoNotificationsOutline,
  IoLockClosedOutline,
  IoCloudOutline,
  IoLanguageOutline,
  IoShareSocialOutline,
  IoLogOutOutline,
  IoCameraOutline,
  IoPencilOutline,
  IoMoonOutline,
  IoCardOutline,
} from 'react-icons/io5'

type SettingsRow = {
  id: string
  icon: React.ReactNode
  label: string
  value?: string
  href?: string
  danger?: boolean
}

type Theme = 'light' | 'dark'

function ProfilePage() {
  const navigate = useNavigate()
  const { user, refreshUser, logout: authLogout } = useAuth()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const handleLogout = () => {
    authLogout()
    navigate('/', { replace: true })
  }

  const displayName =
    user?.fullName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    user?.userName ||
    'کاربر'

  const infoSection: SettingsRow[] = []
  if (user?.phoneNumber) infoSection.push({ id: 'phone', icon: <IoCallOutline className="h-5 w-5" />, label: 'شماره تلفن', value: user.phoneNumber })
  if (user?.userName) infoSection.push({ id: 'username', icon: <IoPersonCircleOutline className="h-5 w-5" />, label: 'نام کاربری', value: `@${user.userName}` })
  if (user?.nationalCode) infoSection.push({ id: 'nationalCode', icon: <IoCardOutline className="h-5 w-5" />, label: 'کد ملی', value: user.nationalCode })

  const settingsSections: Array<{ title: string; rows: SettingsRow[] }> = [
    {
      title: 'اعلان‌ها و صدا',
      rows: [
        { id: 'notifications', icon: <IoNotificationsOutline className="h-5 w-5" />, label: 'اعلان‌ها', value: notificationsEnabled ? 'روشن' : 'خاموش' },
      ],
    },
    {
      title: 'حریم خصوصی و امنیت',
      rows: [
        { id: 'privacy', icon: <IoLockClosedOutline className="h-5 w-5" />, label: 'حریم خصوصی' },
        { id: 'security', icon: <IoLockClosedOutline className="h-5 w-5" />, label: 'امنیت' },
      ],
    },
    {
      title: 'داده و ذخیره',
      rows: [
        { id: 'storage', icon: <IoCloudOutline className="h-5 w-5" />, label: 'فضای ذخیره و داده' },
      ],
    },
    {
      title: 'ظاهر',
      rows: [
        { id: 'theme', icon: <IoMoonOutline className="h-5 w-5" />, label: 'قالب رنگ', value: theme === 'dark' ? 'تاریک' : 'روشن' },
        { id: 'language', icon: <IoLanguageOutline className="h-5 w-5" />, label: 'زبان', value: 'فارسی' },
      ],
    },
  ]

  return (
    <div
      dir="rtl"
      className="flex min-h-full w-full flex-col bg-(--background-light) text-right"
    >
      {/* Header area: avatar + name (from logged-in user) */}
      <div className="shrink-0 border-b border-(--app-border)/70">
        <div className="flex flex-col items-center px-4 pt-6 pb-4">
          {/* Avatar — from user or placeholder */}
          <button
            type="button"
            className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-(--teal-primary)/30 bg-(--teal-primary)/10 text-(--teal-primary) shadow-md transition active:scale-[0.98]"
            aria-label="تغییر تصویر پروفایل"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <IoPersonCircleOutline className="h-14 w-14" aria-hidden />
            )}
            <span className="absolute bottom-0 left-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-(--surface-light) bg-(--teal-primary) text-white">
              <IoCameraOutline className="h-4 w-4" aria-hidden />
            </span>
          </button>

          <h1 className="mt-3 text-xl font-bold text-(--black)">{displayName}</h1>
          {user?.userName && (
            <p className="mt-0.5 text-sm text-(--teal-tertiary)">@{user.userName}</p>
          )}
          <button
            type="button"
            className="mt-2 flex items-center gap-1.5 text-sm font-medium text-(--teal-primary)"
            aria-label="ویرایش پروفایل"
          >
            <IoPencilOutline className="h-4 w-4" />
            ویرایش پروفایل
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-auto px-4 pb-6 pt-2">
        {/* Info rows: only fields that exist for this user */}
        {infoSection.length > 0 && (
        <section className="rounded-2xl border border-(--app-border) bg-(--white) shadow-sm overflow-hidden">
          {infoSection.map((row, index) => (
            <div
              key={row.id}
              className={`flex items-center gap-3 px-3 py-3.5 text-(--black) ${
                index < infoSection.length - 1 ? 'border-b border-(--app-border)/60' : ''
              }`}
            >
              <span className="text-(--teal-tertiary)" aria-hidden>
                {row.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-(--teal-tertiary)">{row.label}</p>
                <p className="font-medium">{row.value ?? '—'}</p>
              </div>
              <IoChevronForward className="h-5 w-5 shrink-0 rotate-180 text-(--teal-tertiary)" aria-hidden />
            </div>
          ))}
        </section>
        )}

        {/* Settings sections */}
        {settingsSections.map((group) => (
          <section key={group.title} className="mt-4">
            <h2 className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-(--teal-tertiary)">
              {group.title}
            </h2>
            <div className="rounded-2xl border border-(--app-border) bg-(--white) shadow-sm overflow-hidden">
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
                  {row.value && row.id !== 'notifications' && (
                    <span className="text-sm text-(--teal-tertiary)">{row.value}</span>
                  )}
                  {row.id === 'notifications' && (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notificationsEnabled ? 'true' : 'false'}
                      aria-label={notificationsEnabled ? 'اعلان‌ها روشن' : 'اعلان‌ها خاموش'}
                      title={notificationsEnabled ? 'اعلان‌ها روشن' : 'اعلان‌ها خاموش'}
                      onClick={(e) => {
                        e.stopPropagation()
                        setNotificationsEnabled((v) => !v)
                      }}
                      className={`relative h-7 w-12 shrink-0 rounded-full border-2 transition ${
                        notificationsEnabled
                          ? 'border-(--teal-primary) bg-(--teal-primary)'
                          : 'border-(--app-border) bg-(--app-border)'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                          notificationsEnabled ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  )}
                  {row.id === 'theme' && (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={theme === 'dark' ? 'true' : 'false'}
                      aria-label={theme === 'dark' ? 'تم تاریک' : 'تم روشن'}
                      title={theme === 'dark' ? 'تم تاریک' : 'تم روشن'}
                      onClick={(e) => {
                        e.stopPropagation()
                        setTheme((t) => (t === 'light' ? 'dark' : 'light'))
                      }}
                      className={`relative h-7 w-12 shrink-0 rounded-full border-2 transition ${
                        theme === 'dark'
                          ? 'border-(--teal-primary) bg-(--teal-primary)'
                          : 'border-(--app-border) bg-(--app-border)'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                          theme === 'dark' ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  )}
                  {row.id !== 'notifications' && row.id !== 'theme' && (
                    <IoChevronForward className="h-5 w-5 shrink-0 rotate-180 text-(--teal-tertiary)" aria-hidden />
                  )}
                </button>
              ))}
            </div>
          </section>
        ))}

        {/* Invite / Share */}
        <section className="mt-4">
          <h2 className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-(--teal-tertiary)">
            دوستان
          </h2>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-2xl border border-(--app-border) bg-(--white) px-3 py-3.5 text-right shadow-sm transition active:scale-[0.99] active:bg-(--app-gradient-start)"
          >
            <IoShareSocialOutline className="h-5 w-5 text-(--teal-tertiary)" aria-hidden />
            <span className="flex-1 font-medium text-(--black)">دعوت از دوستان</span>
            <IoChevronForward className="h-5 w-5 shrink-0 rotate-180 text-(--teal-tertiary)" aria-hidden />
          </button>
        </section>

        {/* Log out */}
        <section className="mt-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-3.5 font-medium text-red-600 transition active:scale-[0.99] active:bg-red-100"
          >
            <IoLogOutOutline className="h-5 w-5" aria-hidden />
            خروج از حساب
          </button>
        </section>
      </main>
    </div>
  )
}

export default ProfilePage
