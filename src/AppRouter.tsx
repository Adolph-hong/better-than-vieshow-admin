import { Route, Routes } from 'react-router-dom'
import Home from '@/components/pages/Home'
import Movie from '@/components/pages/Movie'
import Theaters from '@/components/pages/Theaters'

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/theaters" element={<Theaters />} />
      <Route path="/movie" element={<Movie />} />
    </Routes>
  )
}

export default AppRouter
