import { lazy, Suspense, type ReactNode } from 'react'
import { createHashRouter, Navigate } from 'react-router-dom'
import { RedirectIfAuth } from '../components/auth/RedirectIfAuth'
import { RequireAuth } from '../components/auth/RequireAuth'
import { RouteFallback } from '../components/auth/RouteFallback'
import { NotFoundPage } from '../pages/NotFoundPage'
import LoginPage from '../pages/auth/LoginPage'
import { MobileLayout } from '../layouts/MobileLayout'
import PanelListPage from '../pages/panel/PanelListPage'

const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'))
const PanelConnectionPage = lazy(() => import('../pages/panel/PanelConnectionPage'))
const ExplorePage = lazy(() => import('../pages/panel/ExplorePage'))
const SettingsPage = lazy(() => import('../pages/panel/SettingsPage'))
const ProfilePage = lazy(() => import('../pages/panel/ProfilePage'))
const ProfileDetailPage = lazy(() => import('../pages/panel/ProfileDetailPage'))
const SettingsDetailPage = lazy(() => import('../pages/panel/SettingsDetailPage'))

function loadRoute(element: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

export const router = createHashRouter([
  {
    path: '/',
    element: (
      <RedirectIfAuth>
        <LoginPage />
      </RedirectIfAuth>
    )
  },
  {
    path: '/register',
    element: (
      <RedirectIfAuth>
        {loadRoute(<RegisterPage />)}
      </RedirectIfAuth>
    )
  },
  {
    path: '/app',
    element: (
      <RequireAuth>
        <MobileLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/app/home" replace /> },
      { path: 'home', element: <PanelListPage /> },
      { path: 'panel/connect/:way/*', element: loadRoute(<PanelConnectionPage />) },
      { path: 'explore', element: loadRoute(<ExplorePage />) },
      { path: 'settings', element: loadRoute(<SettingsPage />) },
      { path: 'settings/:section', element: loadRoute(<SettingsDetailPage />) },
      { path: 'profile', element: loadRoute(<ProfilePage />) },
      { path: 'profile/:section', element: loadRoute(<ProfileDetailPage />) }
    ]
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
])
