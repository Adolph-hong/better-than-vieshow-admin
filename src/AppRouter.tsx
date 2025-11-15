import { Route, Routes } from "react-router-dom"
import Home from "../pages/Home"
import Movie from "../pages/Movie"

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/movies" element={<Movie />} />
    </Routes>
  )
}

export default AppRouter
