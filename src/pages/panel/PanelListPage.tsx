import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { IoChevronBack, IoSearchOutline } from 'react-icons/io5'
import { toPersianDigits } from '../../utils/digits'
import { FaBuilding } from 'react-icons/fa'

const SCROLL_HIDE = 56
const SCROLL_SHOW = 16

type PanelStatus = 'online' | 'offline'

interface Panel {
  id: string
  name: string
  ip: string
  phone: string
  status: PanelStatus
}

const MOCK_PANELS: Panel[] = [
  { id: '1', name: 'پنل فروشگاه مرکزی', ip: '192.168.1.101', phone: '09121234567', status: 'online' },
  { id: '2', name: 'پنل انبار شمال', ip: '192.168.1.102', phone: '09129876543', status: 'offline' },
  { id: '3', name: 'پنل شعبه یک', ip: '192.168.1.103', phone: '09131112222', status: 'online' },
  { id: '4', name: 'پنل شعبه دو', ip: '192.168.1.104', phone: '09133334444', status: 'online' },
  { id: '6', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'offline' },
  { id: '7', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'online' },
  { id: '8', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'offline' },
  { id: '9', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'online' },
  { id: '10', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'offline' },
  { id: '11', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'online' },
  { id: '12', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'online' },
  { id: '13', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'offline' },
  { id: '14', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'online' },
]

function PanelAvatar({ status }: { status: PanelStatus }) {
  // const borderColor = status === 'online' ? 'border-green-500' : 'border-red-500'
  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-lg bg-(--surface-light) text-(--teal-tertiary)`}
      aria-hidden
    >
      <span className="text-lg font-semibold"><FaBuilding /></span>
    </div>
  )
}

const PanelListPage = () => {
  const [showSearch, setShowSearch] = useState(true)
  const rootRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const lastShowRef = useRef(true)

  useEffect(() => {
    const scrollEl = rootRef.current?.parentElement
    if (!scrollEl) return

    const onScroll = () => {
      if (rafRef.current != null) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        const top = scrollEl.scrollTop
        const nextShow =
          top >= SCROLL_HIDE ? false : top < SCROLL_SHOW ? true : lastShowRef.current
        if (nextShow !== lastShowRef.current) {
          lastShowRef.current = nextShow
          setShowSearch(nextShow)
        }
      })
    }

    scrollEl.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scrollEl.removeEventListener('scroll', onScroll)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div ref={rootRef} className="w-full">
      <motion.div
        className="w-full overflow-hidden"
        initial={false}
        animate={{
          height: showSearch ? 'auto' : 0,
          opacity: showSearch ? 1 : 0,
        }}
        transition={{ type: 'tween', duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="px-3 pb-3 pt-1">
          <div className="flex w-full items-center gap-2 rounded-xl border border-(--app-border) bg-(--surface-light) px-3 py-2.5">
            <IoSearchOutline className="h-5 w-5 shrink-0 text-(--teal-tertiary)" aria-hidden />
            <input
              type="search"
              placeholder="جستجوی پنل..."
              className="min-w-0 flex-1 bg-transparent text-sm text-(--black) outline-none placeholder:text-(--teal-tertiary)/70"
              aria-label="جستجوی پنل"
            />
          </div>
        </div>
      </motion.div>
      <ul className="divide-y divide-(--app-border) px-1.5">
        {MOCK_PANELS.map((panel) => (
          <li key={panel.id}>
            <button
              type="button"
              className={`flex w-full items-center gap-3 border-r-4 px-2 py-3 text-right transition active:bg-(--app-gradient-start) ${
                panel.status === 'online' ? 'border-r-green-600' : 'border-r-red-600'
              }`}
            >
              <PanelAvatar status={panel.status} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-(--black)">{panel.name}</p>
                <p className="mt-0.5 truncate text-xs text-(--teal-tertiary)">
                  {panel.ip} · {toPersianDigits(panel.phone)}
                </p>
              </div>
              <span className="shrink-0 text-(--teal-tertiary)" aria-hidden>
                <IoChevronBack className="h-6 w-6" />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default PanelListPage
