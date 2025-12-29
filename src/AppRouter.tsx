import { Route, Routes } from "react-router-dom"
import TheaterLayout from "@/components/layout/TheaterLayout"
import Home from "../pages/Home"
import AdminLogin from "../pages/login/AdminLogin"
import CreateMovie from "../pages/movies/CreateMovie"
import EditMovie from "../pages/movies/EditMovie"
import Movie from "../pages/movies/Movie"
import NewTheater from "../pages/NewTheater"
import Theaters from "../pages/Theaters"
import TicketCheck from "../pages/TicketCheck"
import TimeLine from "../pages/timelines/TimeLine"
import TimeLineEditor from "../pages/timelines/TimeLineEditor"

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
      <Route path="/movies/edit/:id" element={<EditMovie />} />
      <Route path="/timelines" element={<TimeLine />} />
      <Route path="/timelines/edit" element={<TimeLineEditor />} />
      <Route path="/ticket-check" element={<TicketCheck />} />
    </Routes>
  )
}

export default AppRouter
