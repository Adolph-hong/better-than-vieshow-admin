// Router.tsx
import { createBrowserRouter } from 'react-router-dom'
import Home from './src/components/pages/Home'
import TheatersDetail from './src/components/TheatersDetail'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/theaters-detail',
    element: <TheatersDetail/>,
  },
])

export default router
