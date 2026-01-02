import { useEffect, useState } from "react"
import { fetchMovies, MovieAPIError } from "@/services/movieAPI"

interface Schedule {
  id: string
  movieId: string
  theaterId: string
  startTime: string
  endTime: string
}

export interface MovieListProps {
  schedules?: Schedule[]
}

const MovieList = ({ schedules = [] }: MovieListProps) => {
  const [movies, setMovies] = useState<{ id: string; movieName: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const safeSchedules = Array.isArray(schedules) ? schedules : []

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await fetchMovies()

        // 顯示所有電影，不過濾
        // 轉換為 MovieList 需要的格式
        const formattedMovies = data.map((movie) => ({
          id: movie.id,
          movieName: movie.movieName,
        }))

        setMovies(formattedMovies)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to load movies:", err)
        if (err instanceof MovieAPIError) {
          if (err.errorType === "UNAUTHORIZED") {
            setError("未授權，請重新登入")
          } else if (err.errorType === "FORBIDDEN") {
            setError("權限不足")
          } else {
            setError("載入電影列表失敗")
          }
        } else {
          setError("載入電影列表失敗")
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadMovies()
  }, [])

  const getShowtimeCount = (movieId: string): number => {
    return safeSchedules.filter((schedule) => schedule.movieId === movieId).length
  }

  if (isLoading) {
    return (
      <div className="rounded-sm bg-white p-4">
        <div className="font-family-inter flex justify-between px-2 py-3 font-semibold text-[#000000]">
          <span>電影</span>
          <span>場次</span>
        </div>
        <div className="body-medium flex items-center justify-center px-2 py-8 text-gray-400">
          載入中...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-sm bg-white p-4">
        <div className="font-family-inter flex justify-between px-2 py-3 font-semibold text-[#000000]">
          <span>電影</span>
          <span>場次</span>
        </div>
        <div className="body-medium flex items-center justify-center px-2 py-8 text-red-500">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-sm bg-white p-4">
      <div className="font-family-inter flex justify-between px-2 py-3 font-semibold text-[#000000]">
        <span>電影</span>
        <span>場次</span>
      </div>

      <div className="flex flex-col">
        {movies.length === 0 ? (
          <div className="body-medium flex items-center justify-center px-2 py-8 text-gray-400">
            尚無電影資料
          </div>
        ) : (
          movies.map((movie) => (
            <div
              key={movie.id}
              className="body-medium flex justify-between border-t border-gray-50 px-2 py-3"
            >
              <span className="line-clamp-2 max-w-46.5 break-all">{movie.movieName}</span>
              <span>{getShowtimeCount(movie.id)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MovieList
