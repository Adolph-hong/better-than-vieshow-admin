import { useMemo } from "react"
import { useLocation } from "react-router-dom"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale/zh-TW"
import moviesData from "@/components/form/db.json"
import AdminContainer from "@/components/layout/AdminContainer"
import Header from "@/components/ui/Header"

interface Movie {
  id: string
  movieName: string
  duration: string
  poster: string
}

const TimeLineEditor = () => {
  const location = useLocation()
  const locationState = location.state as { formattedDate?: string } | null
  const formattedDate = useMemo(() => {
    if (locationState?.formattedDate) {
      return locationState.formattedDate
    }
    const today = new Date()
    const dateText = format(today, "yyyy/MM/dd", { locale: zhTW })
    const weekDay = today.toLocaleDateString("zh-TW", { weekday: "narrow" })
    return `${dateText}(${weekDay})`
  }, [locationState])

  const movies = useMemo(() => {
    const data = moviesData as { movies?: Movie[] }
    return data.movies ?? []
  }, [])

  const formatDuration = (minutes: string) => {
    const totalMinutes = parseInt(minutes, 10)
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    if (hours === 0) {
      return `${mins} 分鐘`
    }
    if (mins === 0) {
      return `${hours} 小時`
    }
    return `${hours} 小時 ${mins} 分鐘`
  }

  return (
    <AdminContainer>
      <Header title={`編輯時刻表 - ${formattedDate}`} back backTo="/timelines" />
      <div className="mt-3 flex gap-6 px-6">
        {/* 左邊電影列表 */}
        <div className="flex w-full max-w-67.5 flex-col rounded-sm bg-white p-3">
          <h1 className="font-family-inter flex px-2 py-3 text-base font-semibold text-[#000000]">
            電影
          </h1>
          <div className="flex flex-col gap-2">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="flex items-center gap-3 rounded-[10px] bg-gray-900 p-1"
              >
                <div className="flex w-full max-w-44.5 flex-col gap-1 px-2">
                  <span className="body-medium line-clamp-2 break-all text-white">
                    {movie.movieName}
                  </span>
                  <span className="font-family-inter line-clamp-2 text-xs font-normal break-all text-gray-50">
                    {formatDuration(movie.duration)}
                  </span>
                </div>
                <img
                  className="h-15 w-12 rounded-[10px] object-cover"
                  src={movie.poster}
                  alt={movie.movieName}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminContainer>
  )
}

export default TimeLineEditor
