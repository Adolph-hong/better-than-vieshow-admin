import { Navigate, Route, Routes } from "react-router-dom"
import TheaterLayout from "@/components/layout/TheaterLayout"
import Home from "../pages/Home"
import AdminLogin from "../pages/login/AdminLogin"
import CreateMovie from "../pages/movies/CreateMovie"
import EditMovie from "../pages/movies/EditMovie"
import Movie from "../pages/movies/Movie"
import NewTheater from "../pages/theaters/NewTheater"
import Theaters from "../pages/theaters/Theaters"
import TicketCheck from "../pages/TicketCheck"
import TimeLine from "../pages/timelines/TimeLine"
import TimeLineEditor from "../pages/timelines/TimeLineEditor"

// 檢查是否已登入（有 token）
const isAuthenticated = () => {
  const token = localStorage.getItem("token")
  return !!token
}

// 保護路由：需要登入才能訪問
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}

// 公開路由：已登入則重定向到首頁
const PublicRoute = ({ children }: { children: React.ReactElement }) => {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />
  }
  return children
}

const AppRouter = () => {
  return (
    <Routes>
      {/* 根路徑：已登入顯示首頁，未登入重定向到登入頁 */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      {/* 登入頁：如果已登入則重定向到首頁 */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        }
      />
      {/* 其他需要登入的路由 */}
      <Route
        path="/theaters"
        element={
          <ProtectedRoute>
            <TheaterLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/theaters" element={<Theaters />} />
        <Route path="/theaters/new" element={<NewTheater />} />
      </Route>
      <Route
        path="/movies"
        element={
          <ProtectedRoute>
            <Movie />
          </ProtectedRoute>
        }
      />
      <Route
        path="/movies/create"
        element={
          <ProtectedRoute>
            <CreateMovie />
          </ProtectedRoute>
        }
      />
      <Route
        path="/movies/edit/:id"
        element={
          <ProtectedRoute>
            <EditMovie />
          </ProtectedRoute>
        }
      />
      <Route
        path="/timelines"
        element={
          <ProtectedRoute>
            <TimeLine />
          </ProtectedRoute>
        }
      />
      <Route
        path="/timelines/edit"
        element={
          <ProtectedRoute>
            <TimeLineEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ticket-check"
        element={
          <ProtectedRoute>
            <TicketCheck />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default AppRouter
