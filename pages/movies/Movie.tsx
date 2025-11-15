import { useNavigate } from "react-router-dom"
import AdminContainer from "@/components/layout/AdminContainer"
import EmptyContent from "@/components/ui/EmptyContent"
import Header from "@/components/ui/Header"

const Movie = () => {
  const navigate = useNavigate()
  return (
    <AdminContainer>
      <Header title="電影" buttonText="建立電影" onClick={() => navigate("/movies/create")} />
      <EmptyContent title="一部電影都還沒有" description="點擊「建立電影」來新增第一部吧" />
    </AdminContainer>
  )
}

export default Movie
