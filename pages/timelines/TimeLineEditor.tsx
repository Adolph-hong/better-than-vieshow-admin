import { useEffect, useMemo, useState, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale/zh-TW"
import toast from "react-hot-toast"
import { ClipLoader } from "react-spinners"
import AdminContainer from "@/components/layout/AdminContainer"
import TheaterScheduleList from "@/components/timelines/TheaterScheduleList"
import { timeSlots, type Theater } from "@/components/timelines/timelineData"
import Header from "@/components/ui/Header"
import { getSchedulableMovies, MovieAPIError } from "@/services/movieAPI"
import {
  saveDailySchedule,
  getDailySchedule,
  TimelineAPIError,
  type ShowtimeItem,
  type ShowtimeResponse,
} from "@/services/timelineAPI"
import sendAPI from "@/utils/sendAPI"

interface Movie {
  id: string
  movieName: string
  duration: string
  poster: string
}

interface Schedule {
  id: string
  movieId: string
  theaterId: string
  startTime: string
  endTime: string
  movie: Movie
}

const TimeLineEditor = () => {
  const location = useLocation()
  const navigate = useNavigate()
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

  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoadingTheaters, setIsLoadingTheaters] = useState(true)
  const [isLoadingMovies, setIsLoadingMovies] = useState(true)
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [draggedItem, setDraggedItem] = useState<
    { type: "movie"; movie: Movie } | { type: "schedule"; schedule: Schedule } | null
  >(null)
  const [theaters, setTheaters] = useState<Theater[]>([])
  // 建立前端 theater.id (字串) 到 API theaterId (數字) 的映射表
  const [theaterIdMap, setTheaterIdMap] = useState<Map<string, number>>(new Map())
  // 使用 ref 來避免 useEffect 依賴造成的無限循環
  const theaterIdMapRef = useRef<Map<string, number>>(new Map())

  // 將 API 的影廳類型映射到前端使用的類型
  const mapTheaterTypeToFrontend = (apiType: string): Theater["type"] => {
    if (apiType === "Digital") {
      return "一般數位" as Theater["type"]
    }
    if (apiType === "4DX") {
      return "4DX" as Theater["type"]
    }
    if (apiType === "IMAX") {
      return "IMAX" as Theater["type"]
    }
    return "一般數位" as Theater["type"]
  }

  // 從 API 獲取影廳列表
  useEffect(() => {
    const loadTheaters = async () => {
      setIsLoadingTheaters(true)
      try {
        const response = await sendAPI("/api/admin/theaters", "GET")

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        const theaterList = Array.isArray(data) ? data : data.data || []

        // 轉換為前端使用的 Theater 格式
        interface TheaterFromAPI {
          id: number | string
          name: string
          type: string
          standard?: number
          wheelchair?: number
          normalSeats?: number
          accessibleSeats?: number
        }

        const formattedTheaters: Theater[] = theaterList.map((theater: TheaterFromAPI) => ({
          id: String(theater.id), // API 的 id 可能是數字，轉為字串
          name: theater.name,
          type: mapTheaterTypeToFrontend(theater.type), // 映射影廳類型
          generalSeats: theater.standard ?? theater.normalSeats ?? 0,
          disabledSeats: theater.wheelchair ?? theater.accessibleSeats ?? 0,
        }))

        setTheaters(formattedTheaters)

        // 建立映射表：前端 theater.id (字串) -> API theaterId (數字)
        const newTheaterIdMap = new Map<string, number>()
        theaterList.forEach((theater: TheaterFromAPI) => {
          const frontendId = String(theater.id)
          const apiId = typeof theater.id === "number" ? theater.id : Number(theater.id)
          if (!Number.isNaN(apiId)) {
            newTheaterIdMap.set(frontendId, apiId)
          }
        })
        setTheaterIdMap(newTheaterIdMap)
        theaterIdMapRef.current = newTheaterIdMap
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to load theaters:", error)
        toast.error("載入影廳列表失敗，請稍後再試", { id: "load-theaters-error" })
        // 如果載入失敗，使用空陣列
        setTheaters([])
      } finally {
        setIsLoadingTheaters(false)
      }
    }

    loadTheaters()
  }, [])

  // 從 API 獲取可排程電影列表
  useEffect(() => {
    const loadMovies = async () => {
      try {
        setIsLoadingMovies(true)

        // 將 formattedDate 轉換為 YYYY-MM-DD 格式
        const dateMatch = formattedDate.match(/^(\d{4})\/(\d{2})\/(\d{2})/)
        if (!dateMatch) {
          setMovies([])
          return
        }

        const [, year, month, day] = dateMatch
        const dateStr = `${year}-${month}-${day}`

        // 使用新的 API 取得可排程電影
        const data = await getSchedulableMovies(dateStr)

        // 轉換為編輯頁面使用的格式
        const formattedMovies: Movie[] = data.map((movie) => ({
          id: String(movie.id),
          movieName: movie.title || "",
          duration: String(movie.duration),
          poster: movie.posterUrl || "",
        }))
        setMovies(formattedMovies)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to load movies:", error)
        if (error instanceof MovieAPIError) {
          if (error.errorType === "UNAUTHORIZED") {
            toast.error("未授權，請重新登入", { id: "load-movies-unauthorized" })
            // 可以選擇清除 token 並導向登入頁
            localStorage.removeItem("token")
          } else {
            toast.error("載入可排程電影列表失敗，請稍後再試", { id: "load-movies-error" })
          }
        } else {
          toast.error("載入可排程電影列表失敗，請稍後再試", { id: "load-movies-error" })
        }
        setMovies([])
      } finally {
        setIsLoadingMovies(false)
      }
    }

    loadMovies()
  }, [formattedDate])

  // 從 API 獲取該日期的時刻表
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        setIsLoadingSchedule(true)
        // 將 formattedDate 轉換為 YYYY-MM-DD 格式
        const dateMatch = formattedDate.match(/^(\d{4})\/(\d{2})\/(\d{2})/)
        if (!dateMatch) {
          setSchedules([])
          return
        }

        const [, year, month, day] = dateMatch
        const dateStr = `${year}-${month}-${day}`

        const dailySchedule = await getDailySchedule(dateStr)

        // 建立臨時映射表：根據 API 返回的資料建立映射關係
        const tempTheaterIdMap = new Map(theaterIdMapRef.current)
        dailySchedule.showtimes.forEach((showtime: ShowtimeResponse) => {
          // 檢查映射表中是否已有這個 theaterId
          const existingEntry = Array.from(tempTheaterIdMap.entries()).find(
            ([, apiId]) => apiId === showtime.theaterId
          )
          // 如果沒有，嘗試根據 theaterName 匹配
          if (!existingEntry) {
            const matchedTheater = theaters.find((t) => {
              const apiName = showtime.theaterName.trim()
              const frontendName = t.name.trim()
              return (
                apiName === frontendName ||
                apiName.includes(frontendName) ||
                frontendName.includes(apiName)
              )
            })
            if (matchedTheater) {
              tempTheaterIdMap.set(matchedTheater.id, showtime.theaterId)
            }
          }
        })
        // 更新映射表（只在有新映射時才更新，避免無限循環）
        if (tempTheaterIdMap.size > theaterIdMapRef.current.size) {
          setTheaterIdMap(tempTheaterIdMap)
          theaterIdMapRef.current = tempTheaterIdMap
        }

        // 轉換 API 資料為前端使用的 Schedule 格式
        const convertedSchedules: Schedule[] = dailySchedule.showtimes.map(
          (showtime: ShowtimeResponse) => {
            // 根據 API 的 theaterId 找到對應的前端 theater.id
            const frontendTheater = Array.from(tempTheaterIdMap.entries()).find(
              ([, apiId]) => apiId === showtime.theaterId
            )
            // 如果映射表中沒有，嘗試根據 theaterName 匹配
            let frontendTheaterId = frontendTheater ? frontendTheater[0] : null
            if (!frontendTheaterId) {
              const matchedTheater = theaters.find((t) => {
                const apiName = showtime.theaterName.trim()
                const frontendName = t.name.trim()
                return (
                  apiName === frontendName ||
                  apiName.includes(frontendName) ||
                  frontendName.includes(apiName)
                )
              })
              frontendTheaterId = matchedTheater?.id || String(showtime.theaterId)
            }

            // 需要找到對應的電影資料
            const movie = movies.find((m) => m.id === String(showtime.movieId))
            if (!movie) {
              // 如果找不到電影，使用 API 返回的資料
              return {
                id: String(showtime.id),
                movieId: String(showtime.movieId),
                theaterId: frontendTheaterId,
                startTime: showtime.startTime,
                endTime: showtime.endTime,
                movie: {
                  id: String(showtime.movieId),
                  movieName: showtime.movieTitle,
                  duration: String(showtime.movieDuration),
                  poster: "",
                },
              }
            }

            return {
              id: String(showtime.id),
              movieId: String(showtime.movieId),
              theaterId: frontendTheaterId,
              startTime: showtime.startTime,
              endTime: showtime.endTime,
              movie,
            }
          }
        )

        setSchedules(convertedSchedules)
      } catch (error: unknown) {
        if (error instanceof TimelineAPIError) {
          const apiError: TimelineAPIError = error
          if (apiError.errorType === "NOT_FOUND") {
            // 該日期沒有時刻表記錄，返回空陣列
            setSchedules([])
          } else if (apiError.errorType === "UNAUTHORIZED") {
            toast.error("未授權，請重新登入", { id: "load-schedule-unauthorized" })
            setSchedules([])
          } else {
            // eslint-disable-next-line no-console
            console.error("Failed to load schedule:", apiError)
            toast.error(`載入時刻表失敗：${apiError.message}`, { id: "load-schedule-error" })
            setSchedules([])
          }
        } else {
          // eslint-disable-next-line no-console
          console.error("Failed to load schedule:", error)
          toast.error("載入時刻表失敗，請稍後再試", { id: "load-schedule-error" })
          setSchedules([])
        }
      } finally {
        setIsLoadingSchedule(false)
      }
    }

    // 等待影廳列表和電影列表載入完成後再載入時刻表
    if (theaters.length > 0 && movies.length > 0) {
      loadSchedule()
    }
  }, [formattedDate, theaters, movies])

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

  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(":").map(Number)
    const totalMinutes = hours * 60 + minutes + durationMinutes
    const endHours = Math.floor(totalMinutes / 60)
    const endMins = totalMinutes % 60
    return `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`
  }

  const handleDragStartMovie = (movie: Movie, e: React.DragEvent) => {
    setDraggedItem({ type: "movie", movie })
    if (e.dataTransfer && e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.effectAllowed = "move"
      e.currentTarget.style.opacity = "0.7"
      const rect = e.currentTarget.getBoundingClientRect()
      e.dataTransfer.setDragImage(e.currentTarget, e.clientX - rect.left, e.clientY - rect.top)
      setTimeout(() => {
        if (e.currentTarget instanceof HTMLElement) {
          e.currentTarget.style.opacity = "1"
        }
      }, 0)
    }
  }

  const handleDragStartSchedule = (schedule: Schedule, e: React.DragEvent) => {
    setDraggedItem({ type: "schedule", schedule })
    if (e.dataTransfer && e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.effectAllowed = "move"
      e.currentTarget.style.opacity = "0.7"
      const rect = e.currentTarget.getBoundingClientRect()
      e.dataTransfer.setDragImage(e.currentTarget, e.clientX - rect.left, e.clientY - rect.top)
      setTimeout(() => {
        if (e.currentTarget instanceof HTMLElement) {
          e.currentTarget.style.opacity = "1"
        }
      }, 0)
    }
  }

  const checkConflict = (
    theaterId: string,
    startTime: string,
    endTime: string,
    movieId: string,
    excludeScheduleId?: string
  ): boolean => {
    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(":").map(Number)
      return hours * 60 + minutes
    }

    const startMinutes = timeToMinutes(startTime)
    const endMinutes = timeToMinutes(endTime)

    const targetTheater = theaters.find((t) => t.id === theaterId)
    if (!targetTheater) return false

    return schedules.some((schedule) => {
      if (excludeScheduleId && schedule.id === excludeScheduleId) return false

      const scheduleStart = timeToMinutes(schedule.startTime)
      const scheduleEnd = timeToMinutes(schedule.endTime)

      if (schedule.theaterId === theaterId) {
        return startMinutes < scheduleEnd && endMinutes > scheduleStart
      }

      if (schedule.movieId !== movieId) return false

      const existingTheater = theaters.find((t) => t.id === schedule.theaterId)
      if (!existingTheater) return false

      if (existingTheater.type !== targetTheater.type) return false

      const timeDiff = Math.abs(startMinutes - scheduleStart)

      return timeDiff < 15
    })
  }

  const handleDrop = (theaterId: string, timeSlot: string) => {
    if (!draggedItem) return

    if (draggedItem.type === "movie") {
      const durationMinutes = parseInt(draggedItem.movie.duration, 10)
      const endTime = calculateEndTime(timeSlot, durationMinutes)

      if (checkConflict(theaterId, timeSlot, endTime, draggedItem.movie.id)) {
        setDraggedItem(null)
        return
      }

      const newSchedule: Schedule = {
        id: `${theaterId}-${timeSlot}-${Date.now()}`,
        movieId: draggedItem.movie.id,
        theaterId,
        startTime: timeSlot,
        endTime,
        movie: draggedItem.movie,
      }

      setSchedules((prev) => {
        const updated = [...prev, newSchedule]
        return updated
      })
    } else if (draggedItem.type === "schedule") {
      const durationMinutes = parseInt(draggedItem.schedule.movie.duration, 10)
      const endTime = calculateEndTime(timeSlot, durationMinutes)

      if (
        checkConflict(
          theaterId,
          timeSlot,
          endTime,
          draggedItem.schedule.movieId,
          draggedItem.schedule.id
        )
      ) {
        setDraggedItem(null)
        return
      }

      setSchedules((prev) => {
        const updated = prev.map((schedule) =>
          schedule.id === draggedItem.schedule.id
            ? {
                ...schedule,
                theaterId,
                startTime: timeSlot,
                endTime,
              }
            : schedule
        )
        return updated
      })
    }

    setDraggedItem(null)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1"
    }
    if (draggedItem?.type === "schedule") {
      setSchedules((prev) => {
        const updated = prev.filter((s) => s.id !== draggedItem.schedule.id)
        return updated
      })
    }
    setDraggedItem(null)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      // 將 formattedDate 轉換為 YYYY-MM-DD 格式
      const dateMatch = formattedDate.match(/^(\d{4})\/(\d{2})\/(\d{2})/)
      if (!dateMatch) {
        toast.error("日期格式錯誤", { id: "save-date-format-error" })
        setIsSaving(false)
        return
      }

      const [, year, month, day] = dateMatch
      const dateStr = `${year}-${month}-${day}`

      // 將 schedules 轉換為 API 需要的格式
      // 使用映射表將前端的 theater.id (字串) 轉換為 API 的 theaterId (數字)
      const showtimes: ShowtimeItem[] = schedules
        .map((schedule) => {
          const apiTheaterId = theaterIdMapRef.current.get(schedule.theaterId)
          if (!apiTheaterId) {
            // 如果映射表中沒有，顯示錯誤
            toast.error(`錯誤：找不到影廳 ${schedule.theaterId} 的對應關係，請重新載入頁面`, {
              id: "save-theater-mapping-error",
            })
            // eslint-disable-next-line no-console
            console.error(
              `找不到影廳 ${schedule.theaterId}，映射表:`,
              Array.from(theaterIdMap.entries())
            )
            return null
          }

          return {
            movieId: Number(schedule.movieId),
            theaterId: apiTheaterId,
            startTime: schedule.startTime,
          }
        })
        .filter((item): item is ShowtimeItem => item !== null)

      // 調試：輸出要發送的資料
      // eslint-disable-next-line no-console
      console.log("準備發送的 showtimes:", showtimes)

      await saveDailySchedule(dateStr, showtimes)
      toast.success("時刻表儲存成功", { id: "save-success" })
      navigate("/timelines", { state: { formattedDate } })
    } catch (error: unknown) {
      if (error instanceof TimelineAPIError) {
        const apiError: TimelineAPIError = error
        if (apiError.errorType === "VALIDATION_ERROR") {
          toast.error(`儲存失敗：${apiError.message}`, { id: "save-validation-error" })
        } else if (apiError.statusCode === 403) {
          toast.error("該日期已開始販售，無法修改", { id: "save-forbidden" })
        } else if (apiError.statusCode === 409) {
          toast.error("場次時間衝突，請檢查時刻表", { id: "save-conflict" })
        } else if (apiError.errorType === "UNAUTHORIZED") {
          toast.error("未授權，請重新登入", { id: "save-unauthorized" })
        } else {
          toast.error(`儲存失敗：${apiError.message}`, { id: "save-error" })
        }
      } else {
        toast.error("儲存失敗，請稍後再試", { id: "save-error" })
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminContainer sidebarBorderColor="border-gray-50">
      <div className="flex h-screen flex-col overflow-hidden">
        <Header title={`編輯時刻表 - ${formattedDate}`} back backTo="/timelines" />
        <div className="flex flex-1 gap-6 overflow-hidden px-6 pt-3 pb-6">
          {/* 左邊電影列表 */}
          <div className="flex w-67.5 shrink-0 flex-col rounded-sm bg-white p-3">
            <h1 className="font-family-inter flex shrink-0 px-2 py-3 text-base font-semibold text-[#000000]">
              電影
            </h1>
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {isLoadingMovies && (
                <div className="flex items-center justify-center py-8">
                  <ClipLoader color="#5365AC" size={30} />
                </div>
              )}
              {!isLoadingMovies && movies.length === 0 && (
                <div className="flex items-center justify-center py-8 text-gray-400">
                  尚無電影資料
                </div>
              )}
              {!isLoadingMovies && movies.length > 0 && (
                <>
                  {movies.map((movie) => (
                    <div
                      key={movie.id}
                      draggable
                      onDragStart={(e) => handleDragStartMovie(movie, e)}
                      onDragEnd={(e) => {
                        if (e.currentTarget instanceof HTMLElement) {
                          e.currentTarget.style.opacity = "1"
                        }
                      }}
                      className="flex cursor-move items-center gap-3 rounded-[10px] bg-gray-900 p-1"
                    >
                      <div className="flex w-full max-w-44.5 flex-col gap-1 px-2">
                        <span className="body-medium line-clamp-1 break-all text-white">
                          {movie.movieName}
                        </span>
                        <span className="font-family-inter line-clamp-1 text-xs font-normal break-all text-gray-50">
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
                </>
              )}
            </div>
          </div>
          {/* 右邊時刻表 */}
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden" onDragEnd={handleDragEnd}>
            {isLoadingSchedule || isLoadingTheaters ? (
              <div className="flex flex-1 items-center justify-center">
                <ClipLoader color="#5365AC" size={40} />
              </div>
            ) : (
              <TheaterScheduleList
                theaters={theaters}
                timeSlots={timeSlots}
                schedules={schedules}
                draggedItem={draggedItem}
                onDrop={handleDrop}
                onDragStartSchedule={handleDragStartSchedule}
                isInteractive
              />
            )}
          </div>
        </div>
        {/* 底部 */}
        <div className="flex shrink-0 justify-end bg-white p-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoadingSchedule}
            className="bg-primary-500 body-medium flex cursor-pointer rounded-[10px] px-4 py-2.5 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "儲存中..." : "儲存時刻表"}
          </button>
        </div>
      </div>
    </AdminContainer>
  )
}

export default TimeLineEditor
