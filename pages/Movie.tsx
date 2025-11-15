import AdminContainer from "@/components/layout/AdminContainer"
import EmptyContent from "@/components/ui/EmptyContent"
import Header from "@/components/ui/Header"

const Movie = () => {
  return (
    <AdminContainer>
      <Header title="電影" buttonText="新增電影" onClick={() => {}} />
      <EmptyContent title="一部電影都還沒有" description="點擊「建立電影」來新增第一部吧" />
    </AdminContainer>
  )
}

export default Movie
