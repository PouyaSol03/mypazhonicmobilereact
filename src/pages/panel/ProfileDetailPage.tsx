import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  IoArrowBack,
  IoCheckmarkCircleOutline,
  IoCloudOutline,
  IoCopyOutline,
  IoDownloadOutline,
  IoKeyOutline,
  IoLockClosedOutline,
  IoMailOutline,
  IoPersonCircleOutline,
  IoSaveOutline,
  IoShareSocialOutline,
  IoShieldCheckmarkOutline,
} from 'react-icons/io5'
import { appToast } from '../../utils/appToast'
import { toPersianDigits } from '../../utils/digits'
import {
  changePassword,
  copyText,
  getBiometricEnabled,
  getBooleanPreference,
  getPreference,
  getStorageSummary,
  setBiometricEnabled as persistBiometricEnabled,
  setPreference,
  shareBackup,
  shareText,
  updateProfile,
} from '../../utils/androidBridge'

type DetailKey = 'edit' | 'privacy' | 'security' | 'storage' | 'invite'

const TITLES: Record<DetailKey, { title: string; Icon: React.ComponentType<{ className?: string }> }> = {
  edit: { title: 'ویرایش پروفایل', Icon: IoPersonCircleOutline },
  privacy: { title: 'حریم خصوصی', Icon: IoLockClosedOutline },
  security: { title: 'امنیت', Icon: IoShieldCheckmarkOutline },
  storage: { title: 'فضای ذخیره و داده', Icon: IoCloudOutline },
  invite: { title: 'دعوت از دوستان', Icon: IoShareSocialOutline },
}

const INVITE_CODE = 'PAZH-1403'

function SwitchRow({
  title,
  detail,
  enabled,
  onToggle,
}: {
  title: string
  detail: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center gap-3 border-b border-(--app-border)/60 px-3 py-3.5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-(--black)">{title}</p>
        <p className="mt-0.5 text-xs text-(--teal-tertiary)">{detail}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={`relative h-7 w-12 shrink-0 rounded-full border-2 transition ${
          enabled ? 'border-(--teal-primary) bg-(--teal-primary)' : 'border-(--app-border) bg-(--app-border)'
        }`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${enabled ? 'right-0.5' : 'left-0.5'}`} />
      </button>
    </div>
  )
}

export default function ProfileDetailPage() {
  const navigate = useNavigate()
  const { section } = useParams<{ section: string }>()
  const key = section as DetailKey
  const config = TITLES[key]
  const { user, refreshUser } = useAuth()

  const [fullName, setFullName] = useState(user?.fullName ?? 'کاربر پاژونیک')
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '')
  const [email, setEmail] = useState(() => getPreference('profile_email', ''))
  const [profileSaved, setProfileSaved] = useState(false)
  const [activityVisible, setActivityVisible] = useState(() => getBooleanPreference('profile_activity_visible', true))
  const [marketingEnabled, setMarketingEnabled] = useState(() => getBooleanPreference('profile_marketing', false))
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => getBooleanPreference('profile_two_factor', false))
  const [biometricEnabled, setBiometricEnabledState] = useState(() => getBiometricEnabled())
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordChanged, setPasswordChanged] = useState(false)
  const [backupCreated, setBackupCreated] = useState(false)
  const [referralCopied, setReferralCopied] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)
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
    return <Navigate to="/app/profile" replace />
  }

  const { title, Icon } = config

  return (
    <div dir="rtl" className="flex min-h-full w-full flex-col bg-(--background-light) text-right">
      <header className="flex shrink-0 items-center gap-3 border-b border-(--app-border)/70 bg-(--surface-light) px-3 py-3">
        <button
          type="button"
          onClick={() => navigate('/app/profile')}
          className="flex h-10 w-10 items-center justify-center rounded-full text-(--teal-tertiary) transition hover:bg-(--app-gradient-start)"
          aria-label="بازگشت به پروفایل"
        >
          <IoArrowBack className="h-6 w-6 rotate-180" />
        </button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--teal-primary)/10 text-(--teal-primary)">
          <Icon className="h-5 w-5" />
        </div>
        <h1 className="min-w-0 truncate text-lg font-semibold text-(--black)">{title}</h1>
      </header>

      <main className="flex-1 overflow-auto px-4 pb-7 pt-4">
        {key === 'edit' && (
          <section className="rounded-xl border border-(--app-border) bg-(--white) p-4">
            <div
              className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-(--teal-primary)/30 bg-(--teal-primary)/10 text-(--teal-primary)"
            >
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" /> : <IoPersonCircleOutline className="h-14 w-14" />}
            </div>
            <label htmlFor="profile-name" className="mb-2 mt-5 block text-sm text-(--teal-tertiary)">نام و نام خانوادگی</label>
            <input
              id="profile-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-12 w-full rounded-xl border border-(--app-border) px-3 text-sm outline-none focus:border-(--teal-primary)"
            />
            <label htmlFor="profile-phone" className="mb-2 mt-3 block text-sm text-(--teal-tertiary)">شماره تماس</label>
            <input
              id="profile-phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="h-12 w-full rounded-xl border border-(--app-border) px-3 text-sm outline-none focus:border-(--teal-primary)"
            />
            <label htmlFor="profile-email" className="mb-2 mt-3 block text-sm text-(--teal-tertiary)">ایمیل</label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-xl border border-(--app-border) px-3 text-sm outline-none focus:border-(--teal-primary)"
            />
            <button
              type="button"
              onClick={() => {
                if (!fullName.trim() || !phoneNumber.trim()) {
                  appToast.warning({ title: 'اطلاعات ناقص است', message: 'نام و شماره تماس را وارد کنید.' })
                  return
                }
                const result = updateProfile({ fullName: fullName.trim(), phoneNumber: phoneNumber.trim(), email: email.trim() })
                if (!result.success) {
                  appToast.error({ title: 'ذخیره پروفایل ناموفق', message: result.error })
                  return
                }
                refreshUser()
                setProfileSaved(true)
                appToast.success({ title: 'پروفایل ذخیره شد', message: 'اطلاعات حساب به روز شد.' })
              }}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-(--teal-primary) font-medium text-(--app-on-primary)"
            >
              <IoSaveOutline className="h-5 w-5" />
              ذخیره تغییرات
            </button>
            {profileSaved && (
              <p className="mt-3 flex items-center gap-2 text-sm text-green-700">
                <IoCheckmarkCircleOutline className="h-5 w-5" />
                اطلاعات حساب ذخیره شد.
              </p>
            )}
          </section>
        )}

        {key === 'privacy' && (
          <>
            <section className="overflow-hidden rounded-xl border border-(--app-border) bg-(--white)">
              <SwitchRow
                title="نمایش وضعیت فعالیت"
                detail="آخرین اتصال شما در برنامه نمایش داده شود"
                enabled={activityVisible}
                onToggle={() => saveToggle('profile_activity_visible', !activityVisible, setActivityVisible)}
              />
              <SwitchRow
                title="پیام های پیشنهادی"
                detail="دریافت پیشنهادهای مرتبط با محصولات"
                enabled={marketingEnabled}
                onToggle={() => saveToggle('profile_marketing', !marketingEnabled, setMarketingEnabled)}
              />
            </section>
            <section className="mt-4 rounded-xl border border-(--app-border) bg-(--white) p-4">
              <h2 className="font-semibold text-(--black)">مدیریت داده شخصی</h2>
              <p className="mt-2 text-sm leading-6 text-(--teal-tertiary)">
                اطلاعات حساب و پنل ها تنها برای خدمات اپلیکیشن استفاده می شوند.
              </p>
            </section>
          </>
        )}

        {key === 'security' && (
          <>
            <section className="overflow-hidden rounded-xl border border-(--app-border) bg-(--white)">
              <SwitchRow
                title="ورود دو مرحله ای"
                detail="درخواست کد تایید هنگام ورود جدید"
                enabled={twoFactorEnabled}
                onToggle={() => saveToggle('profile_two_factor', !twoFactorEnabled, setTwoFactorEnabled)}
              />
              <SwitchRow
                title="ورود بیومتریک"
                detail="باز کردن برنامه با اثر انگشت"
                enabled={biometricEnabled}
                onToggle={() => {
                  const next = !biometricEnabled
                  persistBiometricEnabled(next)
                  setBiometricEnabledState(next)
                  appToast.success({ title: 'ورود بیومتریک', message: next ? 'ورود بیومتریک فعال شد.' : 'ورود بیومتریک غیرفعال شد.' })
                }}
              />
            </section>
            <section className="mt-4 rounded-xl border border-(--app-border) bg-(--white) p-4">
              <h2 className="flex items-center gap-2 font-semibold text-(--black)">
                <IoKeyOutline className="h-5 w-5 text-(--teal-primary)" />
                تغییر رمز عبور
              </h2>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="رمز عبور فعلی" className="mt-4 h-12 w-full rounded-xl border border-(--app-border) px-3 text-sm outline-none focus:border-(--teal-primary)" />
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="رمز عبور جدید" className="mt-3 h-12 w-full rounded-xl border border-(--app-border) px-3 text-sm outline-none focus:border-(--teal-primary)" />
              <button
              type="button"
              onClick={() => {
                const result = changePassword(currentPassword, newPassword)
                if (!result.success) {
                  appToast.error({ title: 'تغییر رمز ناموفق', message: result.error })
                  return
                }
                setCurrentPassword('')
                setNewPassword('')
                setPasswordChanged(true)
                appToast.success({ title: 'رمز عبور تغییر کرد', message: 'رمز جدید برای حساب ذخیره شد.' })
                }}
                className="mt-4 h-12 w-full rounded-xl bg-(--teal-primary) font-medium text-(--app-on-primary)"
              >
                ثبت رمز جدید
              </button>
              {passwordChanged && <p className="mt-3 text-sm text-green-700">رمز عبور با موفقیت تغییر کرد.</p>}
            </section>
          </>
        )}

        {key === 'storage' && (
          <>
            <section className="rounded-xl border border-(--app-border) bg-(--white) p-4">
              <p className="text-sm text-(--teal-tertiary)">داده ثبت شده در حساب شما</p>
              <p className="mt-1 text-2xl font-bold text-(--black)">{toPersianDigits(String(storageSummary.panels))} پنل</p>
            </section>
            <section className="mt-4 overflow-hidden rounded-xl border border-(--app-border) bg-(--white)">
              {[
                ['پنل ها', `${toPersianDigits(String(storageSummary.panels))} مورد`],
                ['پوشه ها', `${toPersianDigits(String(storageSummary.folders))} مورد`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-(--app-border)/60 px-3 py-3 text-sm last:border-b-0">
                  <span>{label}</span>
                  <span className="text-(--teal-tertiary)">{value}</span>
                </div>
              ))}
            </section>
            <button
              type="button"
              onClick={() => {
                const result = shareBackup()
                if (!result.success) {
                  appToast.error({ title: 'ایجاد پشتیبان ناموفق', message: result.error })
                  return
                }
                setBackupCreated(true)
                appToast.info({ title: 'پشتیبان آماده است', message: 'گزینه اشتراک گذاری پشتیبان باز شد.' })
              }}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-(--teal-primary) bg-(--white) font-medium text-(--teal-primary)"
            >
              <IoDownloadOutline className="h-5 w-5" />
              دریافت پشتیبان داده ها
            </button>
            {backupCreated && <p className="mt-3 text-center text-sm text-green-700">پشتیبان برای اشتراک گذاری آماده شد.</p>}
          </>
        )}

        {key === 'invite' && (
          <section className="rounded-xl border border-(--app-border) bg-(--white) p-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-(--teal-primary)/10 text-(--teal-primary)">
              <IoShareSocialOutline className="h-7 w-7" />
            </div>
            <h2 className="mt-3 text-lg font-semibold text-(--black)">دعوت از دوستان</h2>
            <p className="mt-2 text-sm leading-6 text-(--teal-tertiary)">
              کد دعوت خود را برای دوستان ارسال کنید و برنامه را با آنها به اشتراک بگذارید.
            </p>
            <div className="mt-5 flex items-center justify-between rounded-xl border border-dashed border-(--teal-primary)/50 bg-(--background-light) px-3 py-3">
              <span className="font-semibold text-(--black)">{INVITE_CODE}</span>
              <button
                type="button"
                onClick={() => {
                  const result = copyText(INVITE_CODE)
                  if (!result.success) {
                    appToast.error({ title: 'کپی ناموفق', message: result.error })
                    return
                  }
                  setReferralCopied(true)
                  appToast.success({ title: 'کد دعوت کپی شد', message: 'کد آماده اشتراک گذاری است.' })
                }}
                className="flex items-center gap-1 text-sm font-medium text-(--teal-primary)"
              >
                <IoCopyOutline className="h-4 w-4" />
                کپی
              </button>
            </div>
            {referralCopied && <p className="mt-2 text-sm text-green-700">کد دعوت کپی شد.</p>}
            <button
              type="button"
              onClick={() => {
                const result = shareText('دعوت به پاژونیک', `برای استفاده از پاژونیک ثبت نام کنید. کد دعوت: ${INVITE_CODE}`)
                if (!result.success) {
                  appToast.error({ title: 'اشتراک گذاری ناموفق', message: result.error })
                  return
                }
                setInviteSent(true)
                appToast.success({ title: 'دعوت نامه آماده شد', message: 'اشتراک گذاری در برنامه مقصد ادامه پیدا می کند.' })
              }}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-(--teal-primary) font-medium text-(--app-on-primary)"
            >
              <IoMailOutline className="h-5 w-5" />
              ارسال دعوت نامه
            </button>
            {inviteSent && <p className="mt-3 text-sm text-green-700">اشتراک گذاری دعوت نامه باز شد.</p>}
          </section>
        )}
      </main>
    </div>
  )
}
