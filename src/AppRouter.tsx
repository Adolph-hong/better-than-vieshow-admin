import { Route, Routes } from 'react-router-dom'
import Home from './components/pages/Home'
import Theaters from './components/pages/Theaters'
import TheatersDetail from './components/TheatersDetail'

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/theaters" element={<Theaters />} />
      <Route path="/theaters-detail" element={<TheatersDetail />} />
    </Routes>
  )
}

export default AppRouter
