import { Route, Routes } from "react-router-dom"
import Home from "../pages/Home"
import CreateMovie from "../pages/movies/CreateMovie"
import EditMovie from "../pages/movies/EditMovie"
import Movie from "../pages/movies/Movie"

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/movies" element={<Movie />} />
      <Route path="/movies/create" element={<CreateMovie />} />
      <Route path="/movies/edit/:id" element={<EditMovie />} />
    </Routes>
  )
}

export default AppRouter
