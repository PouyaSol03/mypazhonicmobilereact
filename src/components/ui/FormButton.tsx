import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface FormButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
}

const defaultClassName =
  'h-12 w-full rounded-xl bg-(--teal-primary) text-(--white) font-medium sm:h-14 disabled:opacity-50 transition'

export function FormButton({
  children,
  className = defaultClassName,
  type = 'button',
  ...props
}: FormButtonProps) {
  return (
    <button type={type} className={className} {...props}>
      {children}
    </button>
  )
}
