import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { IoEllipsisVertical, IoSearchOutline } from 'react-icons/io5'
import { BottomNav } from '../components/navigation/BottomNav'
import { StoryScreen } from '../components/StoryScreen'
import PazhLogo from '../assets/logos/PazhLogo'
import { HeaderSearchProvider } from '../contexts/HeaderSearchContext'
import { AppThemeProvider } from '../contexts/AppThemeProvider'
import { useAppTheme } from '../hooks/useAppTheme'
import { useHeaderSearch } from '../hooks/useHeaderSearch'

const STORY_OPEN_DELAY_MS = 700

function preloadPrimaryRoutes() {
  void import('../pages/panel/ExplorePage')
  void import('../pages/panel/SettingsPage')
  void import('../pages/panel/ProfilePage')
  void import('../pages/panel/SettingsDetailPage')
  void import('../pages/panel/ProfileDetailPage')
}

function MobileLayoutContent() {
  const headerSearch = useHeaderSearch()
  const { theme } = useAppTheme()
  const mainRef = useRef<HTMLElement>(null)
  const [storyOpen, setStoryOpen] = useState(false)

  const handleStoryAvatarClick = () => {
    setTimeout(() => setStoryOpen(true), STORY_OPEN_DELAY_MS)
  }

  useEffect(() => {
    if (!headerSearch) return
    headerSearch.setScrollToTop(() => mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' }))
    return () => headerSearch.setScrollToTop(null)
  }, [headerSearch])

  useEffect(() => {
    const requestIdle = window.requestIdleCallback ?? ((callback: IdleRequestCallback) => window.setTimeout(callback, 250))
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout
    const handle = requestIdle(preloadPrimaryRoutes)
    return () => cancelIdle(handle)
  }, [])

  return (
    <div
      data-app-theme={theme}
      className="app-shell flex h-full min-h-0 w-full flex-col overflow-hidden bg-(--background-light) text-(--black)"
    >
      <header
        className={`mx-auto flex w-full max-w-[42rem] items-center justify-between px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] transition-shadow duration-200 ${
          headerSearch?.showHeaderSearch ? 'border-b border-(--app-border)/70 shadow-sm bg-(--background-light)' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStoryAvatarClick}
            className="story-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-(--teal-primary)"
            aria-label="Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø§Ø³ØªÙˆØ±ÛŒ"
          >
            <span className="story-ring-inner flex h-full w-full items-center justify-center">
              <PazhLogo className="h-8 w-8 shrink-0" />
            </span>
          </button>
          <span className="text-base font-bold tracking-normal text-(--black)" aria-label="پاژونیک">
            پاژونیک
          </span>
        </div>
        <div className="flex items-center gap-1">
          {headerSearch?.showHeaderSearch && (
            <button
              type="button"
              onClick={headerSearch.onHeaderSearchClick}
              className="flex w-8 h-8 shrink-0 items-center justify-center rounded-full text-(--teal-tertiary) transition hover:bg-(--app-gradient-start)"
              aria-label="Ø¬Ø³ØªØ¬Ùˆ"
            >
              <IoSearchOutline className="w-6 h-6" />
            </button>
          )}
          <button
            type="button"
            className="flex w-8 h-8 shrink-0 items-center justify-center rounded-full text-(--teal-tertiary) transition hover:bg-(--app-gradient-start)"
            aria-label="Ù…Ù†Ùˆ"
          >
            <IoEllipsisVertical className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main
        ref={mainRef}
        className="mx-auto min-h-0 w-full max-w-[42rem] flex-1 overflow-auto pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))]"
      >
        <Outlet />
      </main>

      <div
        className="bottom-nav-fade pointer-events-none fixed inset-x-0 bottom-0 z-9 h-[calc(5.75rem+env(safe-area-inset-bottom,0px))]"
        aria-hidden
      />

      <BottomNav />

      <StoryScreen key={storyOpen ? 'open' : 'closed'} open={storyOpen} onClose={() => setStoryOpen(false)} />
    </div>
  )
}

export function MobileLayout() {
  return (
    <AppThemeProvider>
      <HeaderSearchProvider>
        <MobileLayoutContent />
      </HeaderSearchProvider>
    </AppThemeProvider>
  )
}
