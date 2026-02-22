import { useState } from "react"
import { Link } from "react-router-dom"
import PazhLogo from "../../assets/logos/PazhLogo"
import PazhLogoTypo from "../../assets/logos/PazhLogoTypo"
import { toPersianDigits } from "../../utils/digits"

const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.875a4.5 4.5 0 1 0-9 0V10.5" />
    <rect x="4.5" y="10.5" width="15" height="9" rx="2.25" />
  </svg>
)

const PhoneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
  </svg>
)

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.12a7.5 7.5 0 0 1 15 0" />
  </svg>
)

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58A3 3 0 0 0 13.42 13.42" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 5.08A10.4 10.4 0 0 1 12 4.88c6 0 9.75 7.12 9.75 7.12a16.8 16.8 0 0 1-3.34 4.35M6.16 6.16A16.9 16.9 0 0 0 2.25 12s3.75 6.75 9.75 6.75c1.3 0 2.48-.3 3.54-.78" />
  </svg>
)

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const supportPhone = toPersianDigits("09900213009")
  const appVersion = toPersianDigits("1.0.0")

  return (
    <div className="flex h-full w-full max-w-md flex-col items-center justify-center gap-6 px-4 py-4">
      <div className="w-full h-full flex flex-col justify-center items-center">
        <PazhLogo className="h-28 w-28 sm:h-36 sm:w-36" />
        <PazhLogoTypo width={146} />
        <div className="mt-4 flex h-auto w-full flex-col items-center justify-start gap-3 sm:mt-5">
          <div className="w-full">
            <label htmlFor="phoneNumber" className="mb-2 block text-sm sm:text-base text-(--teal-tertiary)">
              شماره موبایل
            </label>
            <div className="relative h-14 w-full sm:h-14">
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--teal-tertiary)">
                <PhoneIcon />
              </span>
              <span className="pointer-events-none absolute right-11 top-1/2 h-6 w-px -translate-y-1/2 bg-(--app-border)" />
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                className="h-full w-full rounded-xl border border-(--app-border) bg-(--white) pr-14 pl-4 text-sm sm:text-base text-(--black) outline-none transition focus:border-(--teal-primary)"
              />
            </div>
          </div>

          <div className="w-full">
            <label htmlFor="firstName" className="mb-2 block text-sm sm:text-base text-(--teal-tertiary)">
              نام
            </label>
            <div className="relative h-14 w-full sm:h-14">
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--teal-tertiary)">
                <UserIcon />
              </span>
              <span className="pointer-events-none absolute right-11 top-1/2 h-6 w-px -translate-y-1/2 bg-(--app-border)" />
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="نام خود را وارد کنید"
                className="h-full w-full rounded-xl border border-(--app-border) bg-(--white) pr-14 pl-4 text-sm sm:text-base text-(--black) outline-none transition focus:border-(--teal-primary)"
              />
            </div>
          </div>

          <div className="w-full">
            <label htmlFor="lastName" className="mb-2 block text-sm sm:text-base text-(--teal-tertiary)">
              نام خانوادگی
            </label>
            <div className="relative h-14 w-full sm:h-14">
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--teal-tertiary)">
                <UserIcon />
              </span>
              <span className="pointer-events-none absolute right-11 top-1/2 h-6 w-px -translate-y-1/2 bg-(--app-border)" />
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="نام خانوادگی خود را وارد کنید"
                className="h-full w-full rounded-xl border border-(--app-border) bg-(--white) pr-14 pl-4 text-sm sm:text-base text-(--black) outline-none transition focus:border-(--teal-primary)"
              />
            </div>
          </div>

          <div className="w-full">
            <label htmlFor="password" className="mb-2 block text-sm sm:text-base text-(--teal-tertiary)">
              رمز عبور
            </label>
            <div className="relative h-14 w-full sm:h-14">
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--teal-tertiary)">
                <LockIcon />
              </span>
              <span className="pointer-events-none absolute right-11 top-1/2 h-6 w-px -translate-y-1/2 bg-(--app-border)" />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-(--teal-tertiary)"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeIcon /> : <EyeOffIcon />}
              </button>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="رمز عبور خود را وارد کنید"
                className="h-full w-full rounded-xl border border-(--app-border) bg-(--white) pr-14 pl-12 text-sm sm:text-base text-(--black) outline-none transition focus:border-(--teal-primary)"
              />
            </div>
          </div>

          <div className="w-full">
            <label htmlFor="confirmPassword" className="mb-2 block text-sm sm:text-base text-(--teal-tertiary)">
              تکرار رمز عبور
            </label>
            <div className="relative h-14 w-full sm:h-14">
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--teal-tertiary)">
                <LockIcon />
              </span>
              <span className="pointer-events-none absolute right-11 top-1/2 h-6 w-px -translate-y-1/2 bg-(--app-border)" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-(--teal-tertiary)"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
              </button>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="رمز عبور را مجدد وارد کنید"
                className="h-full w-full rounded-xl border border-(--app-border) bg-(--white) pr-14 pl-12 text-sm sm:text-base text-(--black) outline-none transition focus:border-(--teal-primary)"
              />
            </div>
          </div>

          <button type="submit" className="h-12 w-full rounded-xl bg-(--teal-primary) text-(--white) font-medium sm:h-14">
            ثبت نام
          </button>

          <div className="mt-2 flex w-full items-center justify-between gap-3">
            <span className="text-xs sm:text-sm">قبلا ثبت نام کرده اید؟</span>
            <Link
              to="/"
              className="rounded-xl border border-(--teal-tertiary) px-4 py-2 sm:py-3"
            >
              <span className="text-xs sm:text-sm text-(--teal-tertiary)">ورود</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
