import { Route, Routes } from "react-router-dom"
import TheaterLayout from "@/components/layout/TheaterLayout"
import Home from "../pages/Home"
import CreateMovie from "../pages/movies/CreateMovie"
import EditMovie from "../pages/movies/EditMovie"
import Movie from "../pages/movies/Movie"
import NewTheater from "../pages/NewTheater"
import Theaters from "../pages/Theaters"

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/theaters" element={<TheaterLayout />}>
        <Route path="/theaters" element={<Theaters />} />
        <Route path="/theaters/new" element={<NewTheater />} />
      </Route>
      <Route path="/movies" element={<Movie />} />
      <Route path="/movies/create" element={<CreateMovie />} />
      <Route path="/movies/edit/:id" element={<EditMovie />} />
    </Routes>
  )
}

export default AppRouter
