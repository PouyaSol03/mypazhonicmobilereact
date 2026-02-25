import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IoSearchOutline, IoPencilOutline, IoTrashOutline } from 'react-icons/io5'
import { toPersianDigits } from '../../utils/digits'
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
import { getPanelIcon } from '../../constants/panelIcons'
import {
  getPanelsForUser,
  getFolders,
  createPanel,
  deletePanel,
  setPanelFolder,
  type BridgePanel,
  type BridgeFolder,
} from '../../utils/androidBridge'

const SCROLL_HIDE = 56
const SCROLL_SHOW = 16

type PanelStatus = 'online' | 'offline'

export type CategoryId = 'all' | 'uncategorized' | number

interface Panel {
  id: string
  name: string
  ip: string
  phone: string
  status: PanelStatus
  unreadCount?: number
  lastEvent?: string
  folderId: number | null
  icon: string | null
}

function bridgePanelToPanel(p: BridgePanel): Panel {
  return {
    id: String(p.id),
    name: p.name,
    ip: p.ip ?? '',
    phone: p.gsmPhone ?? '',
    status: p.isActive ? 'online' : 'offline',
    folderId: p.folderId,
    icon: p.icon,
  }
}

function PanelAvatar({ status, iconKey }: { status: PanelStatus; iconKey?: string | null }) {
  const Icon = getPanelIcon(iconKey)
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
        <Icon className="h-6 w-6" aria-hidden />
      </span>
    </div>
  )
}

const PanelListPage = () => {
  const navigate = useNavigate()
  const headerSearch = useHeaderSearch()
  const [showSearch, setShowSearch] = useState(true)
  const [panels, setPanels] = useState<Panel[]>([])
  const [folders, setFolders] = useState<BridgeFolder[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all')
  const [createSheetOpen, setCreateSheetOpen] = useState(false)
  const [detailPanel, setDetailPanel] = useState<PanelDetail | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [swipingPanelId, setSwipingPanelId] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const lastShowRef = useRef(true)

  const refetchPanels = useCallback(() => {
    const { panels: list, error } = getPanelsForUser()
    if (error) return
    setPanels(list.map(bridgePanelToPanel))
  }, [])

  const refetchFolders = useCallback(() => {
    const { folders: list, error } = getFolders()
    if (error) return
    setFolders(list)
  }, [])

  useEffect(() => {
    refetchPanels()
    refetchFolders()
  }, [refetchPanels, refetchFolders])

  const categories = useMemo(() => {
    const items: { id: CategoryId; label: string }[] = [
      { id: 'all', label: 'همه' },
      { id: 'uncategorized', label: 'بدون پوشه' },
    ]
    folders.forEach((f) => items.push({ id: f.id, label: f.name }))
    return items
  }, [folders])

  const filteredPanels = useMemo(() => {
    let list = panels
    if (activeCategory === 'uncategorized') list = list.filter((p) => p.folderId == null)
    else if (activeCategory !== 'all') list = list.filter((p) => p.folderId === activeCategory)
    const q = searchQuery.trim().toLowerCase()
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q))
    return list
  }, [panels, activeCategory, searchQuery])

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
          {categories.map((cat) => {
            const isActive = cat.id === activeCategory
            return (
              <button
                key={cat.id === 'all' ? 'all' : cat.id === 'uncategorized' ? 'uncategorized' : `f-${cat.id}`}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 text-nowrap ${
                  isActive
                    ? 'border-(--teal-primary)/40 bg-(--teal-primary) text-black shadow-sm'
                    : 'border-(--teal-tertiary)/80 bg-(--teal-tertiary)/30 text-black hover:border-(--teal-primary)/25 hover:bg-(--app-gradient-start)/40'
                }`}
              >
                {cat.label}
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
          {filteredPanels.map((panel) => (
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
                        const result = deletePanel(panel.id)
                        if (result.success) {
                          setPanels((prev) => prev.filter((p) => p.id !== panel.id))
                        } else if (result.error) {
                          window.alert(result.error)
                        }
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
                <PanelAvatar status={panel.status} iconKey={panel.icon} />
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
          const result = createPanel({
            name: data.name,
            ip: data.ip || undefined,
            gsmPhone: data.phone || undefined,
            codeUD: data.udlCode || undefined,
            icon: data.avatar,
          })
          if (result.success) {
            refetchPanels()
            setCreateSheetOpen(false)
          } else if (result.error) {
            window.alert(result.error)
          }
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
          const result = deletePanel(p.id)
          if (result.success) {
            setPanels((prev) => prev.filter((item) => item.id !== p.id))
            setDetailSheetOpen(false)
            setDetailPanel(null)
          } else if (result.error) window.alert(result.error)
        }}
        folders={[{ id: null, name: 'بدون پوشه' }, ...folders]}
        onSetFolder={(panelId, folderId) => {
          const result = setPanelFolder(panelId, folderId ?? '')
          if (result.success) refetchPanels()
          else if (result.error) window.alert(result.error)
        }}
      />
    </div>
  )
}

export default PanelListPage