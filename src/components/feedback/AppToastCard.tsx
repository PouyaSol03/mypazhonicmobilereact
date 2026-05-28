import type { ReactNode } from 'react'
import type { Toast } from 'react-hot-toast'
import toast from 'react-hot-toast'
import {
  IoCheckmarkCircleOutline,
  IoCloseOutline,
  IoInformationCircleOutline,
  IoRefreshOutline,
  IoWarningOutline,
} from 'react-icons/io5'

export type AppToastTone = 'success' | 'error' | 'warning' | 'info' | 'loading'

type AppToastCardProps = {
  item: Toast
  tone: AppToastTone
  title: string
  message?: string
}

const toneStyles: Record<AppToastTone, { icon: ReactNode; iconClassName: string; lineClassName: string }> = {
  success: {
    icon: <IoCheckmarkCircleOutline className="h-6 w-6" />,
    iconClassName: 'bg-[#e3f5f4] text-[#087f82]',
    lineClassName: 'bg-[#09a1a4]',
  },
  error: {
    icon: <IoWarningOutline className="h-6 w-6" />,
    iconClassName: 'bg-[#feecee] text-[#cf3545]',
    lineClassName: 'bg-[#dc3545]',
  },
  warning: {
    icon: <IoWarningOutline className="h-6 w-6" />,
    iconClassName: 'bg-[#fff3db] text-[#a86500]',
    lineClassName: 'bg-[#e09a1b]',
  },
  info: {
    icon: <IoInformationCircleOutline className="h-6 w-6" />,
    iconClassName: 'bg-[#e9f0ff] text-[#326bd2]',
    lineClassName: 'bg-[#326bd2]',
  },
  loading: {
    icon: <IoRefreshOutline className="h-6 w-6 animate-spin" />,
    iconClassName: 'bg-[#e3f5f4] text-[#087f82]',
    lineClassName: 'bg-[#09a1a4]',
  },
}

export function AppToastCard({ item, tone, title, message }: AppToastCardProps) {
  const style = toneStyles[tone]

  return (
    <div
      dir="rtl"
      className={`relative flex w-[min(calc(100vw-1.5rem),24rem)] items-start gap-3 overflow-hidden rounded-lg border border-[#dbe6e7] bg-white px-3 py-3 text-right shadow-[0_10px_28px_rgba(8,32,39,0.16)] transition duration-200 ${
        item.visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      }`}
      role={tone === 'error' || tone === 'warning' ? 'alert' : 'status'}
    >
      <span className={`absolute inset-y-0 right-0 w-1 ${style.lineClassName}`} aria-hidden />
      <span className={`mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.iconClassName}`} aria-hidden>
        {style.icon}
      </span>
      <span className="min-w-0 flex-1 pt-0.5">
        <span className="block text-sm font-semibold text-[#10272d]">{title}</span>
        {message && <span className="mt-0.5 block text-xs leading-5 text-[#556b70]">{message}</span>}
      </span>
      <button
        type="button"
        onClick={() => toast.dismiss(item.id)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#65797d] transition active:bg-[#eef4f4]"
        aria-label="بستن اعلان"
      >
        <IoCloseOutline className="h-5 w-5" />
      </button>
    </div>
  )
}
