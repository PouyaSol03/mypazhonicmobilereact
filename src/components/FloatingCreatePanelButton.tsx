import { IoAdd } from 'react-icons/io5'

interface FloatingCreatePanelButtonProps {
  onClick?: () => void
}

export function FloatingCreatePanelButton({ onClick }: FloatingCreatePanelButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-20 left-4 z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-(--teal-primary) text-white shadow-xl transition-transform active:scale-95 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--teal-primary)/50 focus-visible:ring-offset-2"
      aria-label="افزودن پنل جدید"
    >
      <IoAdd className="h-7 w-7" aria-hidden />
    </button>
  )
}
