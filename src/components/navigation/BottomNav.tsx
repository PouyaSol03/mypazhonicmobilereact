import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/app/home', label: 'Home' },
  { to: '/app/explore', label: 'Explore' },
  { to: '/app/profile', label: 'Profile' }
]

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 border-t border-(--app-divider) bg-(--surface-light)/95 px-4 py-3 backdrop-blur">
      <ul className="grid grid-cols-3 gap-2">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `block rounded-xl px-2 py-2 text-center text-sm font-medium transition ${
                  isActive
                    ? 'bg-(--app-primary) text-(--white)'
                    : 'border border-(--app-border-unfocused) bg-(--surface-light) text-(--teal-tertiary) hover:border-(--app-border) hover:bg-(--app-gradient-start)'
                }`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
