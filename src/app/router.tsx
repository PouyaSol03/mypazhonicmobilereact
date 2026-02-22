import { createHashRouter, Navigate } from 'react-router-dom'
import { NotFoundPage } from '../pages/NotFoundPage'
import LoginPage from '../pages/auth/LoginPage'

export const router = createHashRouter([
  {
    path: '/',
    element: <LoginPage />
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
])
