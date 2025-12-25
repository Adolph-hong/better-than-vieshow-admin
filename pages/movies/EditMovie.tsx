import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import MovieForm from "@/components/form/MovieForm"
import AdminContainer from "@/components/layout/AdminContainer"

const EditMovie = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

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
      <MovieForm movieId={id} />
    </AdminContainer>
  )
}

export default EditMovie
