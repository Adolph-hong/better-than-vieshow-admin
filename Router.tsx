// Router.tsx
import { createBrowserRouter } from 'react-router-dom'
import Home from './src/components/pages/Home'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
])

export default router
