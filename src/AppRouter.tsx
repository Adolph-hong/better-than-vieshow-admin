import { Route, Routes } from "react-router-dom"
import Home from "../pages/Home"
import CreateMovie from "../pages/movies/CreateMovie"
import Movie from "../pages/movies/Movie"
import Theaters from "../pages/Theaters"
import TheatersDetail from "../pages/TheatersDetail"

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/theaters" element={<Theaters />} />
      <Route path="/theaters/new" element={<TheatersDetail />} />
      <Route path="/movies" element={<Movie />} />
      <Route path="/movies/create" element={<CreateMovie />} />
    </Routes>
  )
}

export default AppRouter
