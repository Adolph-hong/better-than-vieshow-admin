import { Route, Routes } from 'react-router-dom'
import Home from '@/components/pages/Home'
import Theaters from '@/components/pages/Theaters'
import TheatersDetail from '@/components/pages/TheatersDetail'
import Movie from '@/components/pages/Movie'

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/theaters" element={<Theaters />} />
      <Route path="/theaters/new" element={<TheatersDetail />} />
      <Route path="/movie" element={<Movie />} />
    </Routes>
  )
}

export default AppRouter
