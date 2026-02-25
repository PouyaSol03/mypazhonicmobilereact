import { Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'

const toastFontFamily = '"Vazirmatn", Inter, system-ui, sans-serif'

function App() {
  return (
    <div className="w-full h-full">
      <Toaster
        position="top-center"
        containerClassName="pazhonic-toast"
        containerStyle={{
          direction: 'rtl',
          fontFamily: toastFontFamily,
        }}
        toastOptions={{
          style: {
            fontFamily: toastFontFamily,
            direction: 'rtl',
          },
        }}
      />
      <div className="relative h-full w-full overflow-hidden bg-white md:hidden">
        {/* <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="iphone-bg-element iphone-bg-cyan-1" />
          <div className="iphone-bg-element iphone-bg-cyan-2" />
          <div className="iphone-bg-element iphone-bg-blue-1" />
          <div className="iphone-bg-element iphone-bg-blue-2" />
        </div> */}

        <div className="relative z-10 h-full w-full">
          <RouterProvider router={router} />
        </div>
      </div>

      <div className="hidden min-h-dvh flex-col items-center justify-center bg-(--background-light) bg-linear-to-b from-(--app-gradient-start) to-(--app-gradient-end) px-6 text-center text-(--black) md:flex">
        <p className="text-2xl font-semibold text-(--teal-tertiary)">
          Mobile App Only
        </p>
        <p className="mt-3 max-w-md text-sm text-(--teal-tertiary)/80">
          This project is designed for mobile screen sizes. Open it in a mobile
          viewport to continue.
        </p>
      </div>
    </div>
  )
}

export default App
