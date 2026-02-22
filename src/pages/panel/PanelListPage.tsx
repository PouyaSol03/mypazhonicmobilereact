import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IoSearchOutline } from 'react-icons/io5'
import { toPersianDigits } from '../../utils/digits'
import { FaBuilding } from 'react-icons/fa'
import { FloatingCreatePanelButton } from '../../components/FloatingCreatePanelButton'
import { CreatePanelSheet } from '../../components/CreatePanelSheet'
import { PanelDetailSheet, type PanelDetail } from '../../components/PanelDetailSheet'

const SCROLL_HIDE = 56
const SCROLL_SHOW = 16
const CATEGORIES = ['همه', 'دیده نشده', 'خانه', 'محل کار', 'مغازه ها'] as const

type PanelStatus = 'online' | 'offline'

interface Panel {
  id: string
  name: string
  ip: string
  phone: string
  status: PanelStatus
  unreadCount?: number
}

const MOCK_PANELS: Panel[] = [
  { id: '1', name: 'پنل فروشگاه مرکزی', ip: '192.168.1.101', phone: '09121234567', status: 'online', unreadCount: 3 },
  { id: '2', name: 'پنل انبار شمال', ip: '192.168.1.102', phone: '09129876543', status: 'offline', unreadCount: 12 },
  { id: '3', name: 'پنل شعبه یک', ip: '192.168.1.103', phone: '09131112222', status: 'online' },
  { id: '4', name: 'پنل شعبه دو', ip: '192.168.1.104', phone: '09133334444', status: 'online', unreadCount: 1 },
  { id: '6', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'offline', unreadCount: 99 },
  { id: '7', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'online' },
  { id: '8', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'offline', unreadCount: 5 },
  { id: '9', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'online', unreadCount: 2 },
  { id: '10', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'offline' },
  { id: '11', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'online', unreadCount: 1 },
  { id: '12', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'online' },
  { id: '13', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'offline' },
  { id: '14', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'online', unreadCount: 7 },
]

function PanelAvatar({ status }: { status: PanelStatus }) {
  return (
    <div
      className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border shadow-sm transition-all duration-200 ${
        status === 'online'
          ? 'border-green-500/35 bg-green-500/10 text-green-700'
          : 'border-red-500/35 bg-red-500/10 text-red-700'
      }`}
      aria-hidden
    >
      <span className="text-lg font-semibold">
        <FaBuilding />
      </span>
    </div>
  )
}

const PanelListPage = () => {
  const navigate = useNavigate()
  const [showSearch, setShowSearch] = useState(true)
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>('همه')
  const [createSheetOpen, setCreateSheetOpen] = useState(false)
  const [detailPanel, setDetailPanel] = useState<PanelDetail | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
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
          <div className="flex w-full items-center gap-2 rounded-2xl border border-(--app-border)/70 bg-(--surface-light)/95 px-3 py-2.5 shadow-sm backdrop-blur transition-all duration-300 focus-within:border-(--teal-primary)/40 focus-within:shadow-md">
            <IoSearchOutline className="h-5 w-5 shrink-0 text-(--teal-tertiary)/90" aria-hidden />
            <input
              type="search"
              placeholder="جستجوی پنل..."
              className="min-w-0 flex-1 bg-transparent text-sm text-(--black) outline-none placeholder:text-(--teal-tertiary)/60"
              aria-label="جستجوی پنل"
            />
          </div>
        </div>
      </motion.div>
      <div className="sticky top-0 z-20 mb-1 w-full px-3 pb-1 backdrop-blur-[1px]">
        <div className="no-scrollbar flex w-full items-center gap-1 overflow-x-auto py-1 bg-(--teal-tertiary)/30 rounded-2xl px-1">
          {CATEGORIES.map((category) => {
            const isActive = category === activeCategory
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'border-(--teal-primary)/40 bg-(--teal-primary) text-white shadow-sm'
                    : 'border-(--teal-tertiary)/80 bg-(--teal-tertiary)/30 text-white hover:border-(--teal-primary)/25 hover:bg-(--app-gradient-start)/40'
                }`}
              >
                {category}
              </button>
            )
          })}
        </div>
      </div>
      <ul className="divide-y divide-(--app-border)/70 px-1.5">
        {MOCK_PANELS.map((panel) => (
          <li key={panel.id}>
            <button
              type="button"
              onClick={() => {
                setDetailPanel(panel as PanelDetail)
                setDetailSheetOpen(true)
              }}
              className={`group flex w-full items-center gap-3 border-r-4 px-2 py-3 text-right transition-all duration-300 ease-out hover:bg-(--app-gradient-start)/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--teal-primary)/35 ${
                panel.status === 'online' ? 'border-r-green-600' : 'border-r-red-600'
              }`}
            >
              <PanelAvatar status={panel.status} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold tracking-tight text-(--black)">{panel.name}</p>
                <p className="mt-0.5 truncate text-xs text-(--teal-tertiary)/90">
                  {panel.ip} · {toPersianDigits(panel.phone)}
                </p>
              </div>
              {panel.unreadCount != null && panel.unreadCount > 0 ? (
                <span
                  className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-(--teal-primary) px-1.5 text-xs font-semibold leading-none text-white shadow-sm transition-transform duration-200 group-hover:scale-105"
                  aria-label={`${toPersianDigits(panel.unreadCount)} اعلان خوانده نشده`}
                >
                  {panel.unreadCount > 99 ? '99+' : toPersianDigits(panel.unreadCount)}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
      <FloatingCreatePanelButton onClick={() => setCreateSheetOpen(true)} />
      <CreatePanelSheet
        open={createSheetOpen}
        onClose={() => setCreateSheetOpen(false)}
        onSubmit={(data) => {
          console.log('Create panel:', data)
        }}
      />
      <PanelDetailSheet
        open={detailSheetOpen}
        panel={detailPanel}
        onClose={() => {
          setDetailSheetOpen(false)
          setDetailPanel(null)
        }}
        onConnect={(p, way) => {
          navigate(`/app/panel/connect/${way}`, { state: { panel: p } })
          setDetailSheetOpen(false)
          setDetailPanel(null)
        }}
        onEdit={(p) => console.log('Edit panel:', p)}
        onDelete={(p) => console.log('Delete panel:', p)}
      />
    </div>
  )
}

export default PanelListPage