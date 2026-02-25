import { createHashRouter, Navigate } from 'react-router-dom'
import { RedirectIfAuth } from '../components/auth/RedirectIfAuth'
import { RequireAuth } from '../components/auth/RequireAuth'
import { MobileLayout } from '../layouts/MobileLayout'
import { NotFoundPage } from '../pages/NotFoundPage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import PanelListPage from '../pages/panel/PanelListPage'
import PanelConnectionPage from '../pages/panel/PanelConnectionPage'
import ExplorePage from '../pages/panel/ExplorePage'
import ProfilePage from '../pages/panel/ProfilePage'
import SettingsPage from '../pages/panel/SettingsPage'

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
        <RegisterPage />
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
      { path: 'panel/connect/:way', element: <PanelConnectionPage /> },
      { path: 'explore', element: <ExplorePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'profile', element: <ProfilePage /> }
    ]
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
])
