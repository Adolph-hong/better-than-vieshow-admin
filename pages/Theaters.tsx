import { useNavigate } from "react-router-dom"
import AdminContainer from "@/components/layout/AdminContainer"
import TheaterCard from "@/components/theater/TheaterCard"
import EmptyContent from "@/components/ui/EmptyContent"
import Header from "@/components/ui/Header"
import { useTheater } from "@/contexts/TheaterContext"

const Theaters = () => {
  const navigate = useNavigate()
  const { theaters, deleteTheater } = useTheater()

  return (
    <AdminContainer>
      <Header title="影廳" buttonText="建立影廳" onClick={() => navigate("/theaters/new")} />
      {theaters.length === 0 ? (
        <EmptyContent title="一間影廳都還沒有" description="點擊「建立影廳」來新增第一間吧" />
      ) : (
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
          {theaters.map((theater) => (
            <TheaterCard key={theater.id} theater={theater} onDelete={deleteTheater} />
          ))}
        </div>
      )}
    </AdminContainer>
  )
}

export default Theaters
