import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'

function PageFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        color: '#8b90a8',
        fontSize: 14,
      }}
    >
      加载中…
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
