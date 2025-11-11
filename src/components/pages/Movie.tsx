import Main from '@/components/layout/Main'
import Sidebar from '@/components/layout/Sidebar'
import Layout from '@/movie/Layout'
import MovieContent from '@/movie/MovieContent'
import MovieHeader from '@/movie/MovieHeader'

const Movie = () => {
  return (
    <Main>
      <Sidebar />
      <Layout>
        <MovieHeader title="電影" buttonText="新增電影" onClick={() => {}} />
        <MovieContent title="一部電影都還沒有" description="點擊「建立電影」來新增第一部吧" />
      </Layout>
    </Main>
  )
}

export default Movie
