import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IoClose,
  IoPersonOutline,
  IoCallOutline,
  IoLocationOutline,
  IoKeyOutline,
  IoDownloadOutline,
} from 'react-icons/io5'
import { FormInput } from './ui/FormInput'
import { PANEL_ICONS } from '../constants/panelIcons'
import { FormButton } from './ui/FormButton'
import { FormSearchSelect, type SearchSelectOption } from './ui/FormSearchSelect'
import toast from 'react-hot-toast'
import { getLocationsByType, getCitiesByStateId, getSerialNumber } from '../utils/androidBridge'

interface CreatePanelSheetProps {
  open: boolean
  onClose: () => void
  /** When set, sheet is in edit mode (title and submit label change). */
  initialData?: Partial<CreatePanelFormData> & { id?: string }
  onSubmit?: (data: CreatePanelFormData) => void
}

export interface CreatePanelFormData {
  name: string
  ip: string
  port: string
  phone: string
  province: string
  city: string
  udlCode: string
  avatar: string
  serialNumber: string
}

const initialForm: CreatePanelFormData = {
  name: '',
  ip: '',
  port: '',
  phone: '',
  province: '',
  city: '',
  udlCode: '',
  avatar: PANEL_ICONS[0].value,
  serialNumber: '',
}

export function CreatePanelSheet({ open, onClose, initialData, onSubmit }: CreatePanelSheetProps) {
  const [form, setForm] = useState<CreatePanelFormData>(initialForm)
  const [downloading, setDownloading] = useState(false)
  const [serialError, setSerialError] = useState<string | null>(null)
  const isEdit = Boolean(initialData?.id)

  useEffect(() => {
    if (open && initialData) {
      setForm({
        name: initialData.name ?? '',
        ip: initialData.ip ?? '',
        port: initialData.port ?? '',
        phone: initialData.phone ?? '',
        province: initialData.province ?? '',
        city: initialData.city ?? '',
        udlCode: initialData.udlCode ?? '',
        avatar: initialData.avatar ?? PANEL_ICONS[0].value,
        serialNumber: initialData.serialNumber ?? '',
      })
    } else if (open && !initialData) {
      setForm(initialForm)
    }
  }, [open, initialData])

  const provinceOptions = useMemo<SearchSelectOption[]>(() => {
    const { locations } = getLocationsByType('STATE')
    return locations.map((l) => ({ value: String(l.id), label: l.name }))
  }, [])

  const [cityOptions, setCityOptions] = useState<SearchSelectOption[]>([])

  useEffect(() => {
    if (!form.province) {
      setCityOptions([])
      return
    }
    const { locations } = getCitiesByStateId(form.province)
    setCityOptions(locations.map((l) => ({ value: String(l.id), label: l.name })))
  }, [form.province])

  const handleChange = (field: keyof CreatePanelFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEdit && !form.serialNumber.trim()) return
    onSubmit?.(form)
    setForm(initialForm)
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleDownloadSerial = () => {
    if (!form.udlCode.trim()) {
      console.warn('[getSerialNumber] validation: codeUD is empty')
      toast.error('کد آپلود دانلود (UDL) را وارد کنید')
      return
    }
    if (!form.ip.trim() || !form.port.trim()) {
      console.warn('[getSerialNumber] validation: ip or port is empty')
      toast.error('آی‌پی و پورت را وارد کنید')
      return
    }
    setSerialError(null)
    setDownloading(true)
    console.log('[getSerialNumber] request:', { codeUD: form.udlCode, ip: form.ip, port: form.port })
    const result = getSerialNumber(form.udlCode, form.ip, form.port)
    setDownloading(false)
    if (result.error) {
      console.error('[getSerialNumber] error:', result.error)
      setSerialError(result.error)
      toast.error(result.error)
    } else {
      console.log('[getSerialNumber] success:', { serialNumber: result.serialNumber })
      setForm((prev) => ({ ...prev, serialNumber: result.serialNumber ?? '' }))
      setSerialError(null)
      toast.success('شماره سریال دریافت شد')
    }
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
            className="fixed inset-x-0 bottom-0 z-40 flex max-h-[94vh] flex-col rounded-t-3xl border-t border-(--app-border) bg-(--surface-light) shadow-2xl"
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
                {isEdit ? 'ویرایش پنل' : 'افزودن پنل جدید'}
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
              {/* انتخاب آیکون پنل */}
              <div className="w-full">
                <label className="mb-2 block text-sm text-(--teal-tertiary)">
                  آیکون پنل
                </label>
                <div className="flex flex-wrap gap-2">
                  {PANEL_ICONS.map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, avatar: value }))}
                      title={label}
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 transition ${
                        form.avatar === value
                          ? 'border-(--teal-primary) bg-(--teal-primary)/10 text-(--teal-primary)'
                          : 'border-(--app-border) bg-(--white) text-(--black)/60 hover:border-(--teal-primary)/50 hover:bg-(--teal-primary)/5'
                      }`}
                      aria-label={label}
                    >
                      <Icon className="h-6 w-6" aria-hidden />
                    </button>
                  ))}
                </div>
              </div>
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
                id="panel-udl"
                label="کد UDL (کد آپلود دانلود)"
                type="text"
                placeholder="کد UDL"
                value={form.udlCode}
                onChange={handleChange('udlCode')}
                icon={<IoKeyOutline className="h-5 w-5" aria-hidden />}
                containerClassName="w-full"
                labelClassName="mb-2 block text-sm text-(--teal-tertiary)"
                inputClassName="h-full w-full rounded-xl border border-(--app-border) bg-(--white) pr-14 pl-4 text-sm text-(--black) outline-none transition focus:border-(--teal-primary)"
              />
              {/* آی‌پی و پورت در یک ردیف */}
              <div className="w-full">
                <label className="mb-2 block text-sm text-(--teal-tertiary)">
                  آی‌پی و پورت
                </label>
                <div className="flex h-14 w-full overflow-hidden rounded-xl border border-(--app-border) bg-(--white) transition focus-within:border-(--teal-primary)">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="مثال: 192.168.1.1"
                    value={form.ip}
                    onChange={(e) => setForm((prev) => ({ ...prev, ip: e.target.value }))}
                    className="min-w-0 flex-1 bg-transparent px-4 text-sm text-(--black) outline-none placeholder:text-(--teal-tertiary)/70"
                    aria-label="آی‌پی"
                  />
                  <span className="w-px shrink-0 bg-(--app-border)" aria-hidden />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="پورت"
                    value={form.port}
                    onChange={(e) => setForm((prev) => ({ ...prev, port: e.target.value.replace(/\D/g, '') }))}
                    className="w-20 shrink-0 bg-transparent px-3 text-center text-sm text-(--black) outline-none placeholder:text-(--teal-tertiary)/70"
                    aria-label="پورت"
                  />
                </div>
              </div>
              <FormSearchSelect
                id="panel-province"
                label="استان"
                placeholder="استان را انتخاب کنید"
                value={form.province}
                onChange={(v) => setForm((prev) => ({ ...prev, province: v, city: '' }))}
                options={provinceOptions}
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
                options={cityOptions}
                containerClassName="w-full"
                labelClassName="mb-2 block text-sm text-(--teal-tertiary)"
                triggerClassName="h-full w-full rounded-xl border border-(--app-border) bg-(--white) pr-14 pl-4 text-sm text-(--black) outline-none transition focus:border-(--teal-primary) text-right flex items-center"
                icon={<IoLocationOutline className="h-5 w-5" aria-hidden />}
              />
              {/* شماره سریال پنل — دکمه دریافت از پنل در سمت چپ */}
              <div className="w-full">
                <label htmlFor="panel-serial" className="mb-2 block text-sm text-(--teal-tertiary)">
                  شماره سریال پنل <span className="text-red-500">*</span>
                  {serialError && (
                    <span className="mr-2 text-xs text-red-500">({serialError})</span>
                  )}
                </label>
                <div className="flex h-14 w-full overflow-hidden rounded-xl border border-(--app-border) bg-(--white) transition focus-within:border-(--teal-primary)">
                  <button
                    type="button"
                    title="دریافت از پنل"
                    onClick={handleDownloadSerial}
                    disabled={downloading}
                    className="flex shrink-0 items-center justify-center border-l border-(--app-border) bg-(--teal-tertiary)/10 px-3 text-(--teal-primary) transition hover:bg-(--teal-primary)/10 disabled:opacity-50"
                    aria-label="دریافت شماره سریال از پنل"
                  >
                    {downloading ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <IoDownloadOutline className="h-6 w-6" />
                    )}
                  </button>
                  <input
                    id="panel-serial"
                    type="text"
                    placeholder="شماره سریال را وارد کنید یا از پنل دریافت کنید"
                    value={form.serialNumber}
                    onChange={(e) => setForm((prev) => ({ ...prev, serialNumber: e.target.value }))}
                    className="min-w-0 flex-1 bg-transparent px-4 text-sm text-(--black) outline-none placeholder:text-(--teal-tertiary)/70"
                  />
                </div>
              </div>
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
              <FormButton
                type="submit"
                className="mt-2 h-12 w-full rounded-xl bg-(--teal-primary) text-(--white) font-medium py-2"
              >
                {isEdit ? 'ذخیره تغییرات' : 'ثبت پنل'}
              </FormButton>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
