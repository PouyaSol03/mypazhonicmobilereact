import { NavLink } from 'react-router-dom'
import { IoGridOutline, IoGrid } from 'react-icons/io5'
import { IoSettingsOutline, IoSettings } from 'react-icons/io5'
import { IoPersonOutline, IoPerson } from 'react-icons/io5'

const navItems: Array<{
  to: string
  label: string
  Icon: typeof IoGridOutline
  IconActive: typeof IoGrid
  isActive?: (match: { pathname: string } | null, location: { pathname: string }) => boolean
}> = [
  {
    to: '/app/home',
    label: 'پنل\u200cها',
    Icon: IoGridOutline,
    IconActive: IoGrid,
    isActive: (match, location) => !!match || location.pathname.startsWith('/app/panel/'),
  },
  { to: '/app/settings', label: 'تنظیمات', Icon: IoSettingsOutline, IconActive: IoSettings },
  { to: '/app/profile', label: 'پروفایل', Icon: IoPersonOutline, IconActive: IoPerson },
]

export function BottomNav() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-4 pt-2 pointer-events-none [&>nav]:pointer-events-auto">
      <nav
        className="mx-auto max-w-md flex items-center justify-center gap-1 rounded-4xl border border-(--app-border) bg-(--surface-light) px-1 py-1 shadow-lg"
        aria-label="ناوبری پایین"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            isActive={item.isActive}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 rounded-3xl px-6 py-2 text-center text-xs font-medium transition ${
                isActive
                  ? 'bg-(--app-primary) text-(--white)'
                  : 'text-(--teal-tertiary) hover:bg-(--app-gradient-start)'
              }`
            }
          >
            {({ isActive }) => {
              const Icon = isActive ? item.IconActive : item.Icon
              return (
                <>
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  <span>{item.label}</span>
                </>
              )
            }}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
