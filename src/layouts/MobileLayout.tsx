import { Outlet } from 'react-router-dom'
import { BottomNav } from '../components/navigation/BottomNav'

export function MobileLayout() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-(--background-light) text-(--black)">
      <header className="border-b border-(--app-divider) bg-(--surface-light) px-4 py-4">
        
      </header>

      <main className="flex-1 px-4 py-5">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
