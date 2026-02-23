import type { InputHTMLAttributes, ReactNode } from 'react'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  id: string
  icon?: ReactNode
  containerClassName?: string
  labelClassName?: string
  inputClassName?: string
}

const defaultContainer = 'w-full'
const defaultLabel =
  'mb-2 block text-sm sm:text-base text-(--teal-tertiary)'
const defaultInput =
  'h-full w-full rounded-xl border border-(--app-border) bg-(--white) pr-14 pl-4 text-sm sm:text-base text-(--black) outline-none transition focus:border-(--teal-primary)'

export function FormInput({
  label,
  id,
  icon,
  containerClassName = defaultContainer,
  labelClassName = defaultLabel,
  inputClassName = defaultInput,
  className,
  ...props
}: FormInputProps) {
  return (
    <div className={containerClassName}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <div className="relative h-14 w-full sm:h-14">
        {icon ? (
          <>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--teal-tertiary)">
              {icon}
            </span>
            <span className="pointer-events-none absolute right-11 top-1/2 h-6 w-px -translate-y-1/2 bg-(--app-border)" />
          </>
        ) : null}
        <input
          id={id}
          className={className ?? inputClassName}
          {...props}
        />
      </div>
    </div>
  )
}
