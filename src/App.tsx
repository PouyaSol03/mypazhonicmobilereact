import { Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { router } from './app/router'

const toastFontFamily = '"Vazirmatn", Inter, system-ui, sans-serif'

function App() {
  return (
    <div className="h-full w-full">
      <Toaster
        position="top-center"
        gutter={10}
        containerClassName="pazhonic-toast"
        containerStyle={{
          direction: 'rtl',
          fontFamily: toastFontFamily,
          top: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
          pointerEvents: 'none',
        }}
        toastOptions={{
          duration: 3800,
        }}
      />
      <div className="relative h-full min-h-full h-dvh min-h-[100svh] w-full overflow-hidden bg-(--background-light)">
        <div className="relative z-10 flex h-full w-full justify-center">
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </div>
      </div>
    </div>
  )
}

export default App
