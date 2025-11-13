import AdminContainer from '@/components/layout/AdminContainer'
import Content from '@/components/ui/Content'
import Header from '@/components/ui/Header'

const Movie = () => {
  return (
    <AdminContainer>
      <Header title="電影" buttonText="新增電影" onClick={() => {}} />
      <Content title="一部電影都還沒有" description="點擊「建立電影」來新增第一部吧" />
    </AdminContainer>
  )
}

export default Movie
