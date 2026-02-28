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
  updatePanel,
  deletePanel,
  setPanelFolder,
  type BridgePanel,
  type BridgeFolder,
} from '../../utils/androidBridge'

const SCROLL_HIDE = 56
const SCROLL_SHOW = 16

export type CategoryId = 'all' | 'uncategorized' | number

/** Last alarm status from panel; null when never connected. */
export type LastStatus = 'ARM' | 'DISARM' | null

interface Panel {
  id: string
  name: string
  ip: string
  port: number | null
  phone: string
  folderId: number | null
  icon: string | null
  serialNumber: string | null
  locationId: number | null
  codeUD: string | null
  /** Set after connect; null for newly created / never connected. */
  lastStatus: LastStatus
}

function bridgePanelToPanel(p: BridgePanel): Panel {
  const raw = (p.lastStatus ?? '').trim().toUpperCase()
  const lastStatus: LastStatus =
    raw === 'ARM' ? 'ARM' : raw === 'DISARM' ? 'DISARM' : null
  return {
    id: String(p.id),
    name: p.name,
    ip: p.ip ?? '',
    port: p.port ?? null,
    phone: p.gsmPhone ?? '',
    folderId: p.folderId,
    icon: p.icon,
    serialNumber: p.serialNumber ?? null,
    locationId: p.locationId ?? null,
    codeUD: p.codeUD ?? null,
    lastStatus,
  }
}

const LAST_STATUS_LABEL: Record<NonNullable<LastStatus>, string> = {
  ARM: 'مسلح',
  DISARM: 'غیرمسلح',
}

function PanelAvatar({
  lastStatus,
  iconKey,
}: {
  lastStatus: LastStatus
  iconKey?: string | null
}) {
  const Icon = getPanelIcon(iconKey)
  const hasStatus = lastStatus != null
  return (
    <div
      className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border shadow-sm transition-all duration-200 ${
        !hasStatus
          ? 'border-(--app-border) bg-(--teal-tertiary)/10 text-(--teal-tertiary)'
          : lastStatus === 'ARM'
            ? 'border-green-500/35 bg-green-500/10 text-green-700'
            : 'border-amber-500/35 bg-amber-500/10 text-amber-700'
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
  const [editingPanel, setEditingPanel] = useState<Panel | null>(null)
  const [deleteConfirmPanel, setDeleteConfirmPanel] = useState<{ id: string; name: string } | null>(null)
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
      {folders.length > 0 && (
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
                  className={`w-full rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 text-nowrap ${isActive
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
      )}
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
                      setEditingPanel(panel)
                      setCreateSheetOpen(true)
                    }}
                  >
                    <span className="flex h-full w-full min-w-18 items-center justify-center gap-1.5 bg-(--teal-primary) px-4 py-2 text-white">
                      <IoPencilOutline className="h-5 w-5 shrink-0" />
                      <span className="text-xs font-medium">ویرایش</span>
                    </span>
                  </SwipeAction>
                  <SwipeAction
                    destructive
                    onClick={() => setDeleteConfirmPanel({ id: panel.id, name: panel.name })}
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
                className={`group flex w-full items-center gap-3 border-r-4 px-2 py-3 text-right transition-all duration-300 ease-out hover:bg-(--app-gradient-start)/45 ${
                  swipingPanelId === panel.id
                    ? 'border-r-transparent'
                    : panel.lastStatus == null
                      ? 'border-r-transparent'
                      : panel.lastStatus === 'ARM'
                        ? 'border-r-green-600'
                        : 'border-r-amber-600'
                }`}
              >
                <PanelAvatar lastStatus={panel.lastStatus} iconKey={panel.icon} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold tracking-tight text-(--black)">{panel.name}</p>
                  <p className="mt-0.5 truncate text-xs text-(--teal-tertiary)/90">
                    {panel.lastStatus != null
                      ? `وضعیت: ${LAST_STATUS_LABEL[panel.lastStatus]}`
                      : panel.phone
                        ? toPersianDigits(panel.phone)
                        : 'هنوز متصل نشده'}
                  </p>
                </div>
              </div>
            </SwipeableListItem>
          ))}
        </SwipeableList>
      </div>
      {/* حذف پنل — تأیید */}
      {deleteConfirmPanel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-panel-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-(--app-border) bg-(--surface-light) p-4 shadow-xl">
            <h2 id="delete-panel-title" className="text-lg font-semibold text-(--black)">
              حذف پنل
            </h2>
            <p className="mt-2 text-sm text-(--teal-tertiary)">
              آیا از حذف پنل «{deleteConfirmPanel.name}» اطمینان دارید؟
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmPanel(null)}
                className="flex-1 rounded-xl border border-(--app-border) bg-(--white) py-2.5 text-sm font-medium text-(--black)"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  const panel = deleteConfirmPanel
                  setDeleteConfirmPanel(null)
                  const result = deletePanel(panel.id)
                  if (result.success) {
                    setPanels((prev) => prev.filter((p) => p.id !== panel.id))
                  } else if (result.error) {
                    window.alert(result.error)
                  }
                }}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white"
              >
                بله، حذف کن
              </button>
            </div>
          </div>
        </div>
      )}

      <FloatingCreatePanelButton onClick={() => { setEditingPanel(null); setCreateSheetOpen(true) }} />
      <CreatePanelSheet
        open={createSheetOpen}
        onClose={() => {
          setCreateSheetOpen(false)
          setEditingPanel(null)
        }}
        initialData={editingPanel ? {
          id: editingPanel.id,
          name: editingPanel.name,
          ip: editingPanel.ip,
          port: editingPanel.port != null ? String(editingPanel.port) : '',
          phone: editingPanel.phone,
          province: '',
          city: editingPanel.locationId ? String(editingPanel.locationId) : '',
          udlCode: editingPanel.codeUD ?? '',
          avatar: editingPanel.icon ?? 'building',
          serialNumber: editingPanel.serialNumber ?? '',
        } : undefined}
        onSubmit={(data) => {
          if (editingPanel) {
            const result = updatePanel({
              id: Number(editingPanel.id),
              userId: 0,
              folderId: editingPanel.folderId,
              icon: data.avatar,
              name: data.name,
              gsmPhone: data.phone || null,
              ip: data.ip || null,
              port: data.port ? Number(data.port) : null,
              code: null,
              description: null,
              serialNumber: data.serialNumber || null,
              isActive: true,
              locationId: data.city ? Number(data.city) : null,
              codeUD: data.udlCode || null,
              lastStatus: editingPanel.lastStatus,
              createdAt: 0,
              updatedAt: 0,
            })
            if (result.success) {
              refetchPanels()
              setCreateSheetOpen(false)
              setEditingPanel(null)
            } else if (result.error) window.alert(result.error)
          } else {
            const result = createPanel({
              name: data.name,
              ip: data.ip || undefined,
              port: data.port ? Number(data.port) : undefined,
              gsmPhone: data.phone || undefined,
              codeUD: data.udlCode || undefined,
              icon: data.avatar,
              locationId: data.city ? Number(data.city) : undefined,
              serialNumber: data.serialNumber || undefined,
            })
            if (result.success) {
              refetchPanels()
              setCreateSheetOpen(false)
            } else if (result.error) window.alert(result.error)
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
          setDetailSheetOpen(false)
          setDetailPanel(null)
          setDeleteConfirmPanel({ id: p.id, name: p.name })
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