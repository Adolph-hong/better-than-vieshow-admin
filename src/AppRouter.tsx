import { Route, Routes } from 'react-router-dom'
import Home from '@/components/pages/Home'
import Theaters from '@/components/pages/Theaters'

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/theaters" element={<Theaters />} />
    </Routes>
  )
}

export default AppRouter
