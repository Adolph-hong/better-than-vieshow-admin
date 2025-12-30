import { useNavigate } from "react-router-dom"
import { ClipLoader } from "react-spinners"
import AdminContainer from "@/components/layout/AdminContainer"
import TheaterCard from "@/components/theater/TheaterCard"
import EmptyContent from "@/components/ui/EmptyContent"
import Header from "@/components/ui/Header"
import useTheaters from "./hooks/useTheaters"

const Theaters = () => {
  const navigate = useNavigate()
  const { theaters, isLoading, error, handleDelete } = useTheaters()

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-1 items-center justify-center p-6">
          <ClipLoader color="#5365AC" size={40} />
        </div>
      )
    }

    if (error) {
      return <p className="p-6 text-center text-red-500">發生錯誤：{error}</p>
    }

    if (theaters.length === 0) {
      return <EmptyContent title="一間影廳都還沒有" description="點擊「建立影廳」來新增第一間吧" />
    }

    return (
      <ul className="grid grid-cols-1 gap-6 px-6 md:grid-cols-2 lg:grid-cols-3">
        {theaters.map((theater) => (
          <li key={theater.id}>
            <TheaterCard theater={theater} onDelete={handleDelete} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <AdminContainer>
      <main className="flex flex-1 flex-col">
        <Header title="影廳" buttonText="建立影廳" onClick={() => navigate("/theaters/new")} />
        {renderContent()}
      </main>
    </AdminContainer>
  )
}

export default Theaters
