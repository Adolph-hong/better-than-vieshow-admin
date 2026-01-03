import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { ClipLoader } from "react-spinners"
import MovieForm from "@/components/form/MovieForm"
import AdminContainer from "@/components/layout/AdminContainer"
import { useMovieForm } from "@/components/form/hooks/useMovieForm"

const EditMovie = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isLoading } = useMovieForm(id)

  return (
    <AdminContainer>
      <section className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="cursor-pointer" />
          </button>
          <span className="header-2 text-gray-700">編輯電影</span>
        </div>
      </section>
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <ClipLoader color="#5365AC" size={40} />
        </div>
      ) : (
        <MovieForm movieId={id} />
      )}
    </AdminContainer>
  )
}

export default EditMovie
