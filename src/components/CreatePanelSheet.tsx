import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IoClose,
  IoPersonOutline,
  IoGlobeOutline,
  IoCallOutline,
  IoLocationOutline,
  IoKeyOutline,
} from 'react-icons/io5'
import { FormInput } from './ui/FormInput'
import { FormButton } from './ui/FormButton'
import { FormSearchSelect, type SearchSelectOption } from './ui/FormSearchSelect'

const PROVINCE_OPTIONS: SearchSelectOption[] = [
  { value: 'tehran', label: 'تهران' },
  { value: 'isfahan', label: 'اصفهان' },
  { value: 'fars', label: 'فارس' },
  { value: 'khorsan-r', label: 'خراسان رضوی' },
  { value: 'azerbaijan-s', label: 'آذربایجان شرقی' },
  { value: 'azerbaijan-w', label: 'آذربایجان غربی' },
  { value: 'khozestan', label: 'خوزستان' },
  { value: 'mazandaran', label: 'مازندران' },
  { value: 'gilan', label: 'گیلان' },
  { value: 'qom', label: 'قم' },
  { value: 'markazi', label: 'مرکزی' },
  { value: 'kerman', label: 'کرمان' },
  { value: 'hamedan', label: 'همدان' },
  { value: 'yazd', label: 'یزد' },
  { value: 'kermanshah', label: 'کرمانشاه' },
  { value: 'golestan', label: 'گلستان' },
  { value: 'semnan', label: 'سمنان' },
  { value: 'qazvin', label: 'قزوین' },
  { value: 'zanjan', label: 'زنجان' },
  { value: 'ardebil', label: 'اردبیل' },
]

const CITY_OPTIONS: SearchSelectOption[] = [
  { value: 'tehran', label: 'تهران' },
  { value: 'isfahan', label: 'اصفهان' },
  { value: 'mashhad', label: 'مشهد' },
  { value: 'shiraz', label: 'شیراز' },
  { value: 'tabriz', label: 'تبریز' },
  { value: 'ahvaz', label: 'اهواز' },
  { value: 'qom', label: 'قم' },
  { value: 'kermanshah', label: 'کرمانشاه' },
  { value: 'karaj', label: 'کرج' },
  { value: 'arak', label: 'اراک' },
  { value: 'hamedan', label: 'همدان' },
  { value: 'yazd', label: 'یزد' },
  { value: 'rasht', label: 'رشت' },
  { value: 'sari', label: 'ساری' },
  { value: 'zahedan', label: 'زاهدان' },
  { value: 'kerman', label: 'کرمان' },
  { value: 'qazvin', label: 'قزوین' },
  { value: 'zanjan', label: 'زنجان' },
  { value: 'ardebil', label: 'اردبیل' },
  { value: 'urmia', label: 'ارومیه' },
]

interface CreatePanelSheetProps {
  open: boolean
  onClose: () => void
  onSubmit?: (data: CreatePanelFormData) => void
}

export interface CreatePanelFormData {
  name: string
  ip: string
  phone: string
  province: string
  city: string
  udlCode: string
}

const initialForm: CreatePanelFormData = {
  name: '',
  ip: '',
  phone: '',
  province: '',
  city: '',
  udlCode: '',
}

export function CreatePanelSheet({ open, onClose, onSubmit }: CreatePanelSheetProps) {
  const [form, setForm] = useState<CreatePanelFormData>(initialForm)

  const handleChange = (field: keyof CreatePanelFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(form)
    setForm(initialForm)
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
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
            onClick={handleBackdropClick}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-panel-title"
            className="fixed inset-x-0 bottom-0 z-40 flex max-h-[85vh] flex-col rounded-t-3xl border-t border-(--app-border) bg-(--surface-light) shadow-2xl"
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
              <h2 id="create-panel-title" className="text-lg font-semibold text-(--black)">
                افزودن پنل جدید
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
            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-8 pt-2"
            >
              <FormInput
                id="panel-name"
                label="نام پنل"
                placeholder="نام پنل را وارد کنید"
                value={form.name}
                onChange={handleChange('name')}
                icon={<IoPersonOutline className="h-5 w-5" aria-hidden />}
                containerClassName="w-full"
                labelClassName="mb-2 block text-sm text-(--teal-tertiary)"
                inputClassName="h-full w-full rounded-xl border border-(--app-border) bg-(--white) pr-14 pl-4 text-sm text-(--black) outline-none transition focus:border-(--teal-primary)"
              />
              <FormInput
                id="panel-ip"
                label="آی‌پی"
                type="text"
                placeholder="مثال: 192.168.1.1"
                value={form.ip}
                onChange={handleChange('ip')}
                icon={<IoGlobeOutline className="h-5 w-5" aria-hidden />}
                containerClassName="w-full"
                labelClassName="mb-2 block text-sm text-(--teal-tertiary)"
                inputClassName="h-full w-full rounded-xl border border-(--app-border) bg-(--white) pr-14 pl-4 text-sm text-(--black) outline-none transition focus:border-(--teal-primary)"
              />
              <FormInput
                id="panel-phone"
                label="شماره تماس"
                type="tel"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                value={form.phone}
                onChange={handleChange('phone')}
                icon={<IoCallOutline className="h-5 w-5" aria-hidden />}
                containerClassName="w-full"
                labelClassName="mb-2 block text-sm text-(--teal-tertiary)"
                inputClassName="h-full w-full rounded-xl border border-(--app-border) bg-(--white) pr-14 pl-4 text-sm text-(--black) outline-none transition focus:border-(--teal-primary)"
              />
              <FormSearchSelect
                id="panel-province"
                label="استان"
                placeholder="استان را انتخاب کنید"
                value={form.province}
                onChange={(v) => setForm((prev) => ({ ...prev, province: v }))}
                options={PROVINCE_OPTIONS}
                containerClassName="w-full"
                labelClassName="mb-2 block text-sm text-(--teal-tertiary)"
                triggerClassName="h-full w-full rounded-xl border border-(--app-border) bg-(--white) pr-14 pl-4 text-sm text-(--black) outline-none transition focus:border-(--teal-primary) text-right flex items-center"
                icon={<IoLocationOutline className="h-5 w-5" aria-hidden />}
              />
              <FormSearchSelect
                id="panel-city"
                label="شهر"
                placeholder="شهر را انتخاب کنید"
                value={form.city}
                onChange={(v) => setForm((prev) => ({ ...prev, city: v }))}
                options={CITY_OPTIONS}
                containerClassName="w-full"
                labelClassName="mb-2 block text-sm text-(--teal-tertiary)"
                triggerClassName="h-full w-full rounded-xl border border-(--app-border) bg-(--white) pr-14 pl-4 text-sm text-(--black) outline-none transition focus:border-(--teal-primary) text-right flex items-center"
                icon={<IoLocationOutline className="h-5 w-5" aria-hidden />}
              />
              <FormInput
                id="panel-udl"
                label="کد UDL"
                type="text"
                placeholder="کد UDL"
                value={form.udlCode}
                onChange={handleChange('udlCode')}
                icon={<IoKeyOutline className="h-5 w-5" aria-hidden />}
                containerClassName="w-full"
                labelClassName="mb-2 block text-sm text-(--teal-tertiary)"
                inputClassName="h-full w-full rounded-xl border border-(--app-border) bg-(--white) pr-14 pl-4 text-sm text-(--black) outline-none transition focus:border-(--teal-primary)"
              />
              <FormButton
                type="submit"
                className="mt-2 h-12 w-full rounded-xl bg-(--teal-primary) text-(--white) font-medium"
              >
                ثبت پنل
              </FormButton>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
