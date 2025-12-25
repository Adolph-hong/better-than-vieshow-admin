import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AdminContainer from "@/components/layout/AdminContainer"
import TheaterCard from "@/components/theater/TheaterCard"
import EmptyContent from "@/components/ui/EmptyContent"
import Header from "@/components/ui/Header"
import { type TheaterData } from "@/contexts/TheaterContext"
import sendAPI from "@/utils/sendAPI"

const Theaters = () => {
  const navigate = useNavigate()
  const [theaters, setTheaters] = useState<TheaterData[]>([])

  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        const response = await sendAPI("/api/admin/Theaters", "GET")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        const theaterList = Array.isArray(data) ? data : data.data || []
        setTheaters(theaterList)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("獲取影廳列表失敗:", error)
      }
    }

    fetchTheaters()
  }, [])

  const handleDelete = (id: string) => {
    // 暫時僅作提示，之後需串接 DELETE API
    // eslint-disable-next-line no-alert
    alert(`刪除功能尚未實作 (ID: ${id})`)
  }

  return (
    <AdminContainer>
      <Header title="影廳" buttonText="建立影廳" onClick={() => navigate("/theaters/new")} />
      {theaters.length === 0 ? (
        <EmptyContent title="一間影廳都還沒有" description="點擊「建立影廳」來新增第一間吧" />
      ) : (
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
          {theaters.map((theater) => (
            <TheaterCard key={theater.id} theater={theater} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </AdminContainer>
  )
}

export default Theaters
