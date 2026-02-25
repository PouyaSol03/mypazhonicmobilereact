import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import PazhLogo from "../../assets/logos/PazhLogo"
import PazhLogoTypo from "../../assets/logos/PazhLogoTypo"
import { IoMdFingerPrint } from "react-icons/io"
import { toPersianDigits } from "../../utils/digits"
import toast from "react-hot-toast"
import { useAuth } from "../../contexts/AuthContext"
import { login, getBiometricEnabled, loginWithBiometric } from "../../utils/androidBridge"

const LoginPage = () => {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [biometricLoading, setBiometricLoading] = useState(false)

  useEffect(() => {
    setBiometricEnabled(getBiometricEnabled())
  }, [])

  const supportPhone = toPersianDigits("09900213009")
  const appVersion = toPersianDigits("1.0.0")

  const handleLogin = async () => {
    const phone = phoneNumber.trim()
    const pass = password.trim()
    if (!phone || !pass) {
      toast.error("شماره موبایل و رمز عبور را وارد کنید")
      return
    }
    setLoading(true)
    try {
      const result = login(phone, pass)
      if (result.success && result.token) {
        setSession(result.token, result.user)
        toast.success("ورود با موفقیت انجام شد")
        navigate("/app/home")
      } else {
        toast.error(result.error || "ورود ناموفق بود")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricLogin = () => {
    if (!biometricEnabled) return
    setBiometricLoading(true)
    loginWithBiometric((result) => {
      setBiometricLoading(false)
      if (result.success && result.token) {
        setSession(result.token, result.user)
        toast.success("ورود با موفقیت انجام شد")
        navigate("/app/home")
      } else {
        toast.error(result.error || "ورود با اثر انگشت ناموفق بود")
      }
    })
  }

  return (
    <div className="flex h-full w-full max-w-md flex-col items-center justify-start gap-6 px-4 py-4">
      <div className="w-full h-full flex flex-col justify-start items-center">
        <PazhLogo className="h-28 w-28 sm:h-36 sm:w-36" />
        <PazhLogoTypo width={146} />
        <div className="mt-4 flex h-auto w-full flex-col items-center justify-start gap-3 sm:mt-5">
          <div className="w-full">
            <label htmlFor="phoneNumber" className="mb-2 block text-sm sm:text-base text-(--teal-tertiary)">
              شماره موبایل
            </label>
            <div className="relative h-14 w-full sm:h-14">
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--teal-tertiary)">
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
              </span>
              <span className="pointer-events-none absolute right-11 top-1/2 h-6 w-px -translate-y-1/2 bg-(--app-border)" />
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
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
              </span>
              <span className="pointer-events-none absolute right-11 top-1/2 h-6 w-px -translate-y-1/2 bg-(--app-border)" />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-(--teal-tertiary)"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
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
                ) : (
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
                )}
              </button>

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور خود را وارد کنید"
                className="h-full w-full rounded-xl border border-(--app-border) bg-(--white) pr-14 pl-12 text-sm sm:text-base text-(--black) outline-none transition focus:border-(--teal-primary)"
              />
            </div>
          </div>

          <span className="text-sm text-(--teal-tertiary) underline sm:text-base">درخواست فراموشی رمز عبور</span>

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="h-12 w-full rounded-xl bg-(--teal-primary) text-(--white) font-medium disabled:opacity-70 sm:h-14"
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>

          <div className="mt-2 flex w-full items-center justify-between gap-3">
            <div className="">
              <span className="text-xs sm:text-sm">حساب کاربری در نرم افزار پاژونیک ندارید؟</span>
            </div>
            <Link to="/register" className="rounded-xl border border-(--teal-tertiary) px-2 py-2 sm:py-3">
              <span className="text-xs sm:text-sm text-(--teal-tertiary)">ثبت نام کنید</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="w-full h-full flex flex-col justify-around items-center gap-5 pb-1">
        <button
          type="button"
          onClick={handleBiometricLogin}
          disabled={biometricLoading}
          className="flex flex-col justify-center items-center gap-2 rounded-xl p-2 active:opacity-80 disabled:opacity-60"
          aria-label="ورود با اثر انگشت"
        >
          <IoMdFingerPrint className="h-9 w-9 text-(--teal-tertiary) sm:h-10 sm:w-10" />
          <span className="text-sm text-(--teal-tertiary)">ورود با اثر انگشت</span>
        </button>
        <div className="w-full flex flex-wrap justify-between items-center gap-y-2">
          <div className="flex justify-center items-center gap-1 text-xs sm:text-sm">
            <span>شماره پشتیبانی:</span>
            <span>{supportPhone}</span>
          </div>
          <div className="flex justify-center items-center gap-1 text-xs sm:text-sm">
            <span>نسخه نرم افزار:</span>
            <span>{appVersion}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage