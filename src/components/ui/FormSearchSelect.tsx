import { useState, useRef, useEffect } from 'react'
import { IoChevronDown } from 'react-icons/io5'

export interface SearchSelectOption {
  value: string
  label: string
}

interface FormSearchSelectProps {
  id: string
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  options: SearchSelectOption[]
  containerClassName?: string
  labelClassName?: string
  triggerClassName?: string
  icon?: React.ReactNode
}

const defaultContainer = 'w-full'
const defaultLabel = 'mb-2 block text-sm text-(--teal-tertiary)'
const defaultTrigger =
  'h-full w-full rounded-xl border border-(--app-border) bg-(--white) pr-14 pl-4 text-sm text-(--black) outline-none transition focus:border-(--teal-primary) text-right flex items-center'

const MIN_SPACE_THRESHOLD = 200

export function FormSearchSelect({
  id,
  label,
  placeholder = 'جستجو یا انتخاب...',
  value,
  onChange,
  options,
  containerClassName = defaultContainer,
  labelClassName = defaultLabel,
  triggerClassName = defaultTrigger,
  icon,
}: FormSearchSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [openAbove, setOpenAbove] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const displayLabel = value
    ? options.find((o) => o.value === value)?.label ?? value
    : ''

  const filtered = options.filter(
    (o) =>
      o.label.includes(search) || o.value.includes(search)
  )

  useEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    setOpenAbove(spaceBelow < MIN_SPACE_THRESHOLD && spaceAbove > spaceBelow)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={containerRef} className={`relative ${containerClassName}`}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <div ref={triggerRef} className="relative h-14 w-full">
        {icon ? (
          <>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--teal-tertiary)">
              {icon}
            </span>
            <span className="pointer-events-none absolute right-11 top-1/2 h-6 w-px -translate-y-1/2 bg-(--app-border)" />
          </>
        ) : null}
        <button
          type="button"
          id={id}
          onClick={() => setOpen((p) => !p)}
          className={triggerClassName}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className={displayLabel ? 'text-(--black)' : 'text-(--teal-tertiary)/70'}>
            {displayLabel || placeholder}
          </span>
          <IoChevronDown
            className={`absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-(--teal-tertiary) transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>
      </div>

      {open && (
        <div
          className={`absolute left-0 right-0 z-50 max-h-56 overflow-hidden rounded-xl border border-(--app-border) bg-(--white) shadow-lg ${
            openAbove ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
          role="listbox"
        >
          <div className="sticky top-0 border-b border-(--app-border) bg-(--white) p-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو..."
              className="w-full rounded-lg border border-(--app-border) bg-(--surface-light) px-3 py-2 text-sm text-(--black) outline-none placeholder:text-(--teal-tertiary)/70 focus:border-(--teal-primary)"
              autoFocus
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          <ul className="max-h-44 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-(--teal-tertiary)">موردی یافت نشد</li>
            ) : (
              filtered.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={value === opt.value}
                    onClick={() => {
                      onChange(opt.value)
                      setSearch('')
                      setOpen(false)
                    }}
                    className={`w-full px-3 py-2.5 text-right text-sm transition ${
                      value === opt.value
                        ? 'bg-(--teal-primary)/15 text-(--teal-primary) font-medium'
                        : 'text-(--black) hover:bg-(--app-gradient-start)'
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
