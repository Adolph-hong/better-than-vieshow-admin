import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Search } from "lucide-react"
import AdminContainer from "@/components/layout/AdminContainer"
import EmptyContent from "@/components/ui/EmptyContent"
import Header from "@/components/ui/Header"
import { fetchMovies, MovieAPIError } from "@/services/movieAPI"
import filterMoviesByDate from "@/utils/movieFilter"

interface MovieItem {
  id: string
  movieName: string
  duration: string
  category: string
  director: string
  actors: string
  describe: string
  trailerLink: string
  poster: string | null
  startAt: string
  endAt: string
  createdAt: string
}

const categoryMap: Record<string, string> = {
  G: "普遍級",
  P: "保護級",
  PG: "輔導級",
  R: "限制級",
  // 保留舊格式的對應（向後相容）
  "PG-12": "輔導級",
  "R-18": "限制級",
}

const formatDuration = (minutes: string): string => {
  const totalMinutes = parseInt(minutes, 10)
  if (Number.isNaN(totalMinutes) || totalMinutes <= 0) return ""
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  if (hours === 0) {
    return `${mins}分鐘`
  }
  if (mins === 0) {
    return `${hours}小時`
  }
  return `${hours}小時 ${mins}分鐘`
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ""
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}/${month}/${day}`
}

const getPosterUrl = (poster: string | null): string => poster ?? ""

const Movie = () => {
  const navigate = useNavigate()
  const [movies, setMovies] = useState<MovieItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isInputFocused, setIsInputFocused] = useState(false)

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await fetchMovies()
        const allMovies = Array.isArray(data) ? data : []

        // 使用共用過濾函數，根據今天日期過濾
        const displayMovies = filterMoviesByDate(allMovies)

        setMovies(displayMovies)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to load movies:", err)

        // 處理不同的錯誤類型
        if (err instanceof MovieAPIError) {
          if (err.errorType === "UNAUTHORIZED") {
            // 401: 未授權，導向登入頁
            setError("未授權，請重新登入")
            // 可以選擇清除 token 並導向登入頁
            localStorage.removeItem("token")
            // navigate("/login") // 如果有登入頁的話
          } else if (err.errorType === "FORBIDDEN") {
            // 403: 權限不足
            setError("權限不足，需要 Admin 角色")
          } else if (err.errorType === "SERVER_ERROR") {
            // 500: 伺服器錯誤
            setError("伺服器發生錯誤，請稍後再試")
          } else {
            // 其他錯誤
            setError(err.message || "讀取電影列表時發生錯誤，請稍後再試")
          }
        } else {
          // 非 API 錯誤（網路錯誤等）
          setError("讀取電影列表時發生錯誤，請稍後再試")
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadMovies()
  }, [])

  const filteredMovies = useMemo(() => {
    if (!searchQuery.trim()) {
      return movies
    }
    return movies.filter((movie) =>
      movie.movieName.toLowerCase().includes(searchQuery.toLowerCase().trim())
    )
  }, [movies, searchQuery])

  return (
    <AdminContainer>
      <Header title="電影" buttonText="建立電影" onClick={() => navigate("/movies/create")} />
      <div className="px-6 pb-6">
        <div className="flex w-[calc(50%-12px)] items-center gap-3 rounded-lg border border-gray-200 bg-white px-4">
          <div className="flex h-6 w-6 items-center justify-center">
            <Search className="h-4.5 w-4.5 text-gray-300" />
          </div>
          <div className="flex w-full">
            {!isInputFocused && (
              <div className="item-center flex py-3">
                <span className="item-center body-medium flex shrink-0 border-l border-gray-300 pl-3 text-gray-300">
                  搜尋電影名稱
                </span>
              </div>
            )}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              className="body-medium w-full rounded-lg bg-transparent py-3 text-[#000000] placeholder:text-gray-400 focus:placeholder-transparent focus:outline-none"
            />
          </div>
        </div>
      </div>
      {isLoading && <EmptyContent title="資料載入中" description="請稍候，我們正在取得電影列表" />}
      {!isLoading && error && <EmptyContent title="載入失敗" description={error} />}
      {!isLoading && !error && movies.length === 0 && (
        <EmptyContent title="一部電影都還沒有" description="點擊「建立電影」來新增第一部吧" />
      )}
      {!isLoading && !error && movies.length > 0 && filteredMovies.length === 0 && (
        <EmptyContent title="找不到符合的電影" description="請嘗試其他搜尋關鍵字" />
      )}
      {!isLoading && !error && filteredMovies.length > 0 && (
        <section className="flex p-6">
          <div className="flex w-full flex-wrap gap-6">
            {filteredMovies.map((movie) => (
              <div
                key={movie.id}
                className="basis-[calc(50%-12px)] cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => navigate(`/movies/edit/${movie.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    navigate(`/movies/edit/${movie.id}`)
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <article className="flex h-51 rounded-lg border border-transparent bg-white p-3">
                  <div className="flex w-full items-center justify-between gap-4">
                    <img
                      className="h-full w-35 object-cover"
                      src={getPosterUrl(movie.poster)}
                      alt="movie poster"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                    <div className="flex flex-1 flex-col py-4.5">
                      {/* 標題 */}
                      <section className="mb-[26px] flex justify-between">
                        <h1 className="body-large line-clamp-1 break-all text-[#000000]">
                          {movie.movieName}
                        </h1>
                        <div className="body-small flex h-[28px] shrink-0 items-center justify-center rounded-3xl bg-[#454F8D] px-3 py-2.5 text-white">
                          上映中
                        </div>
                      </section>
                      {/* 內容 */}
                      <section className="flex flex-col gap-4">
                        <div className="flex gap-3">
                          <span className="body-medium w-20 text-gray-300">片長</span>
                          <span className="body-medium text-[#000000]">
                            {formatDuration(movie.duration)}
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <span className="body-medium w-20 text-gray-300">分級</span>
                          <span className="body-medium text-[#000000]">
                            {categoryMap[movie.category] || movie.category}
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <span className="body-medium w-20 text-gray-300">播放區間</span>
                          <span className="body-medium text-[#000000]">
                            {formatDate(movie.startAt)} - {formatDate(movie.endAt)}
                          </span>
                        </div>
                      </section>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </section>
      )}
    </AdminContainer>
  )
}

export default Movie
