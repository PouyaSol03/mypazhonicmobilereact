import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'

function App() {
  return (
    <div className="w-full h-full">
      <div className="md:hidden w-full h-full">
        <RouterProvider router={router} />
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
