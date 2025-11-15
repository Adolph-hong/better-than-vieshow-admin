import MovieForm from "@/components/form/MovieForm"
import AdminContainer from "@/components/layout/AdminContainer"
import Header from "@/components/ui/Header"

const CreateMovie = () => {
  return (
    <AdminContainer>
      <Header back title="電影" />
      <MovieForm />
    </AdminContainer>
  )
}

export default CreateMovie
