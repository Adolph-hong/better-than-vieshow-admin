import { Route, Routes } from "react-router-dom"
import Home from "../pages/Home"
import CreateMovie from "../pages/movies/CreateMovie"
import Movie from "../pages/movies/Movie"

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/movies" element={<Movie />} />
      <Route path="/movies/create" element={<CreateMovie />} />
    </Routes>
  )
}

export default AppRouter
