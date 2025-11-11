import { Route, Routes } from 'react-router-dom'
import Home from '@/components/pages/Home'
import Movie from '@/components/pages/Movie'

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/movie" element={<Movie />} />
    </Routes>
  )
}

export default AppRouter
