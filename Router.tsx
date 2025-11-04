// Router.tsx
import { createBrowserRouter } from 'react-router-dom'
import Home from './src/components/pages/Home'
import Theaters from './src/components/pages/Theaters'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/theaters',
    element: <Theaters />,
  },
])

export default router
