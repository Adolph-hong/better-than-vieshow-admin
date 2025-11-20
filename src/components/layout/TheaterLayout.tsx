import { Outlet } from "react-router-dom"
import { TheaterProvider } from "@/contexts/TheaterContext"

const TheaterLayout = () => {
  return (
    <TheaterProvider>
      <Outlet />
    </TheaterProvider>
  )
}

export default TheaterLayout
