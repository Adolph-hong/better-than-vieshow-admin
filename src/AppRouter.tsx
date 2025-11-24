import { Route, Routes } from "react-router-dom"
import TheaterLayout from "@/components/layout/TheaterLayout"
import AdminLogin from "../pages/AdminLogin"
import Home from "../pages/Home"
import CreateMovie from "../pages/movies/CreateMovie"
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
      <Route path="/login" element={<AdminLogin />} />
    </Routes>
  )
}

export default AppRouter
