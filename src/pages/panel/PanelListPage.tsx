import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IoSearchOutline, IoPencilOutline, IoTrashOutline } from 'react-icons/io5'
import { toPersianDigits } from '../../utils/digits'
import { FaBuilding } from 'react-icons/fa'
import {
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
  Type,
} from 'react-swipeable-list'
import 'react-swipeable-list/dist/styles.css'
import { FloatingCreatePanelButton } from '../../components/FloatingCreatePanelButton'
import { CreatePanelSheet } from '../../components/CreatePanelSheet'
import { PanelDetailSheet, type PanelDetail } from '../../components/PanelDetailSheet'
import { useHeaderSearch } from '../../contexts/HeaderSearchContext'

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
  /** آخرین رویداد — only shown when panel has badge (unreadCount) */
  lastEvent?: string
}

const MOCK_PANELS: Panel[] = [
  { id: '1', name: 'پنل فروشگاه مرکزی', ip: '192.168.1.101', phone: '09121234567', status: 'online', unreadCount: 3, lastEvent: 'ورود غیر مجاز' },
  { id: '2', name: 'پنل انبار شمال', ip: '192.168.1.102', phone: '09129876543', status: 'offline', unreadCount: 12, lastEvent: 'هشدار دما' },
  { id: '3', name: 'پنل شعبه یک', ip: '192.168.1.103', phone: '09131112222', status: 'online' },
  { id: '4', name: 'پنل شعبه دو', ip: '192.168.1.104', phone: '09133334444', status: 'online', unreadCount: 1, lastEvent: 'ورود غیر مجاز' },
  { id: '6', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'offline', unreadCount: 99, lastEvent: 'قطع اتصال' },
  { id: '7', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'online' },
  { id: '8', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'offline', unreadCount: 5, lastEvent: 'ورود غیر مجاز' },
  { id: '9', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'online', unreadCount: 2, lastEvent: 'تغییر رمز' },
  { id: '10', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'offline' },
  { id: '11', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'online', unreadCount: 1, lastEvent: 'ورود غیر مجاز' },
  { id: '12', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'online' },
  { id: '13', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'offline' },
  { id: '14', name: 'پنل اداری', ip: '192.168.1.105', phone: '09125556666', status: 'online', unreadCount: 7, lastEvent: 'ورود غیر مجاز' },
]

function PanelAvatar({ status }: { status: PanelStatus }) {
  return (
    <div
      className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border shadow-sm transition-all duration-200 ${status === 'online'
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
  const headerSearch = useHeaderSearch()
  const [showSearch, setShowSearch] = useState(true)
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>('همه')
  const [createSheetOpen, setCreateSheetOpen] = useState(false)
  const [detailPanel, setDetailPanel] = useState<PanelDetail | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [panels, setPanels] = useState<Panel[]>(() => [...MOCK_PANELS])
  const [swipingPanelId, setSwipingPanelId] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const lastShowRef = useRef(true)

  useEffect(() => {
    if (!headerSearch) return
    headerSearch.setHeaderSearch(!showSearch, () => setShowSearch(true))
  }, [showSearch, headerSearch])

  useEffect(() => {
    return () => headerSearch?.setHeaderSearch(false)
  }, [headerSearch])

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
      <div
        className={`sticky top-0 z-20 w-full px-3 pb-1 transition-[padding] duration-200 ${!showSearch ? 'pt-2' : ''
          }`}
      >
        {!showSearch && (
          <>
            <div
              className="category-bar-fade pointer-events-none absolute inset-x-0 bottom-5 z-10 h-8"
              aria-hidden
            />
          </>
        )}
        <div className="relative z-10 no-scrollbar flex w-full items-center gap-1 overflow-x-auto rounded-2xl border border-(--teal-primary)/30 px-1 py-1 shadow-sm bg-(--background-light)">
          {CATEGORIES.map((category) => {
            const isActive = category === activeCategory
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`w-full rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 text-nowrap ${isActive
                  ? 'border-(--teal-primary)/40 bg-(--teal-primary) text-black shadow-sm'
                  : 'border-(--teal-tertiary)/80 bg-(--teal-tertiary)/30 text-black hover:border-(--teal-primary)/25 hover:bg-(--app-gradient-start)/40'
                  }`}
              >
                {category}
              </button>
            )
          })}
        </div>
      </div>
      <div className="px-1.5">
        <SwipeableList
          type={Type.IOS}
          fullSwipe={false}
          threshold={0.25}
          scrollStartThreshold={15}
          swipeStartThreshold={5}
          className="divide-y divide-(--app-border)/70"
        >
          {panels.map((panel) => (
            <SwipeableListItem
              key={panel.id}
              threshold={0.25}
              scrollStartThreshold={15}
              swipeStartThreshold={5}
              trailingActions={(() => (
                <TrailingActions>
                  <SwipeAction
                    onClick={() => {
                      setDetailPanel(panel as PanelDetail)
                      setDetailSheetOpen(true)
                    }}
                  >
                    <span className="flex h-full w-full min-w-18 items-center justify-center gap-1.5 bg-(--teal-primary) px-4 py-2 text-white">
                      <IoPencilOutline className="h-5 w-5 shrink-0" />
                      <span className="text-xs font-medium">ویرایش</span>
                    </span>
                  </SwipeAction>
                  <SwipeAction
                    destructive
                    onClick={() => {
                      if (window.confirm(`حذف پنل «${panel.name}»؟`)) {
                        setPanels((prev) => prev.filter((p) => p.id !== panel.id))
                      }
                    }}
                  >
                    <span className="flex h-full w-full min-w-18 items-center justify-center gap-1.5 bg-red-500 px-4 py-2 text-white">
                      <IoTrashOutline className="h-5 w-5" />
                      <span className="text-xs font-medium">حذف</span>
                    </span>
                  </SwipeAction>
                </TrailingActions>
              ))()}
              onClick={() => {
                setDetailPanel(panel as PanelDetail)
                setDetailSheetOpen(true)
              }}
              onSwipeStart={() => setSwipingPanelId(panel.id)}
              onSwipeEnd={() => setSwipingPanelId(null)}
            >
              <div
                className={`group flex w-full items-center gap-3 border-r-4 px-2 py-3 text-right transition-all duration-300 ease-out hover:bg-(--app-gradient-start)/45  ${swipingPanelId === panel.id
                  ? 'border-r-transparent'
                  : panel.status === 'online'
                    ? 'border-r-green-600'
                    : 'border-r-red-600'
                  }`}
              >
                <PanelAvatar status={panel.status} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold tracking-tight text-(--black)">{panel.name}</p>
                  <p className="mt-0.5 truncate text-xs text-(--teal-tertiary)/90">
                    {panel.unreadCount != null && panel.unreadCount > 0
                      ? `آخرین رویداد: ${panel.lastEvent ?? 'ورود غیر مجاز'}`
                      : toPersianDigits(panel.phone)}
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
              </div>
            </SwipeableListItem>
          ))}
        </SwipeableList>
      </div>
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
        onDelete={(p) => {
          setPanels((prev) => prev.filter((item) => item.id !== p.id))
          setDetailSheetOpen(false)
          setDetailPanel(null)
        }}
      />
    </div>
  )
}

export default PanelListPage