import { useEffect, useState } from "react"
import { type TheaterData } from "@/contexts/TheaterContext"
import sendAPI from "@/utils/sendAPI"

const useTheaters = () => {
  const [theaters, setTheaters] = useState<TheaterData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        const response = await sendAPI("/api/admin/theaters", "GET")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        const theaterList = Array.isArray(data) ? data : data.data || []
        
        // 將後端回傳的欄位名稱轉換為前端期望的格式
        const transformedTheaters = theaterList.map((theater: any) => ({
          ...theater,
          normalSeats: theater.standard ?? theater.normalSeats ?? 0,
          accessibleSeats: theater.wheelchair ?? theater.accessibleSeats ?? 0,
          canDelete: theater.canDelete,
        }))
        
        setTheaters(transformedTheaters)
      } catch (err) {
        const message = err instanceof Error ? err.message : "獲取影廳列表失敗"
        setError(message)
        // eslint-disable-next-line no-console
        console.error("獲取影廳列表失敗:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTheaters()
  }, [])

  const handleDelete = async (id: string): Promise<boolean> => {
    try {
      const response = await sendAPI(`/api/admin/theaters/${id}`, "DELETE")

      if (!response.ok) {
        throw new Error(`刪除失敗! status: ${response.status}`)
      }

      setTheaters((prev) => prev.filter((theater) => theater.id !== id))
      return true
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("刪除影廳失敗:", err)
      return false
    }
  }

  return {
    theaters,
    isLoading,
    error,
    handleDelete,
  }
}

export default useTheaters
