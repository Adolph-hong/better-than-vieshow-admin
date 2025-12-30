import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale/zh-TW"
import AdminContainer from "@/components/layout/AdminContainer"
import TheaterScheduleList from "@/components/timelines/TheaterScheduleList"
import { timeSlots, type Theater } from "@/components/timelines/timelineData"
import Header from "@/components/ui/Header"
import { fetchMovies } from "@/services/movieAPI"
import {
  saveDailySchedule,
  getDailySchedule,
  TimelineAPIError,
  type ShowtimeItem,
} from "@/services/timelineAPI"
import filterMoviesByDate from "@/utils/movieFilter"
import sendAPI from "@/utils/sendAPI"

interface Movie {
  id: string
  movieName: string
  duration: string
  poster: string
  startAt?: string
  endAt?: string
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
  const [isLoadingMovies, setIsLoadingMovies] = useState(true)
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [draggedItem, setDraggedItem] = useState<
    { type: "movie"; movie: Movie } | { type: "schedule"; schedule: Schedule } | null
  >(null)
  const [theaters, setTheaters] = useState<Theater[]>([])
  // 建立前端 theater.id (字串) 到 API theaterId (數字) 的映射表
  const [theaterIdMap, setTheaterIdMap] = useState<Map<string, number>>(new Map())

  // 將 API 的影廳類型映射到前端使用的類型
  const mapTheaterTypeToFrontend = (apiType: string): Theater["type"] => {
    const typeMap: Record<string, Theater["type"]> = {
      Digital: "一般數位",
      "4DX": "4DX",
      IMAX: "IMAX",
    }
    return typeMap[apiType] || "一般數位"
  }

  // 從 API 獲取影廳列表
  useEffect(() => {
    const loadTheaters = async () => {
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
          normalSeats?: number
          accessibleSeats?: number
        }

        const formattedTheaters: Theater[] = theaterList.map((theater: TheaterFromAPI) => ({
          id: String(theater.id), // API 的 id 可能是數字，轉為字串
          name: theater.name,
          type: mapTheaterTypeToFrontend(theater.type), // 映射影廳類型
          generalSeats: theater.normalSeats || 0,
          disabledSeats: theater.accessibleSeats || 0,
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
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to load theaters:", error)
        // 如果載入失敗，使用空陣列
        setTheaters([])
      }
    }

    loadTheaters()
  }, [])

  // 從 API 獲取電影列表
  useEffect(() => {
    const loadMovies = async () => {
      try {
        setIsLoadingMovies(true)
        const data = await fetchMovies()

        // 解析選中的日期
        const dateMatch = formattedDate.match(/^(\d{4})\/(\d{2})\/(\d{2})/)
        let selectedDate: Date | undefined
        if (dateMatch) {
          const [, year, month, day] = dateMatch
          selectedDate = new Date(Number(year), Number(month) - 1, Number(day))
        }

        // 使用共用過濾函數，根據選中日期過濾
        // 確保只顯示在該日期已經上映且還沒下架的電影
        const displayMovies = filterMoviesByDate(data, selectedDate)

        // 轉換為編輯頁面使用的格式
        const formattedMovies: Movie[] = displayMovies.map((movie) => ({
          id: movie.id,
          movieName: movie.movieName,
          duration: movie.duration,
          poster: movie.poster || "",
          startAt: movie.startAt,
          endAt: movie.endAt,
        }))
        setMovies(formattedMovies)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to load movies:", error)
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

        // 更新映射表：根據 API 返回的資料更新映射關係
        setTheaterIdMap((prevMap) => {
          const updatedMap = new Map(prevMap)
          dailySchedule.showtimes.forEach((showtime) => {
            // 根據 theaterId 找到對應的前端 theater
            const frontendTheater = Array.from(prevMap.entries()).find(
              ([, apiId]) => apiId === showtime.theaterId
            )
            // 如果找不到，嘗試根據 theaterName 匹配
            if (!frontendTheater) {
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
                updatedMap.set(matchedTheater.id, showtime.theaterId)
              }
            } else {
              updatedMap.set(frontendTheater[0], showtime.theaterId)
            }
          })
          return updatedMap
        })

        // 轉換 API 資料為前端使用的 Schedule 格式
        const convertedSchedules: Schedule[] = dailySchedule.showtimes.map((showtime) => {
          // 根據 API 的 theaterId 找到對應的前端 theater.id
          const frontendTheater = Array.from(theaterIdMap.entries()).find(
            ([, apiId]) => apiId === showtime.theaterId
          )
          const frontendTheaterId = frontendTheater
            ? frontendTheater[0]
            : String(showtime.theaterId)

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
                startAt: showtime.showDate,
                endAt: showtime.showDate,
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
        })

        setSchedules(convertedSchedules)
      } catch (error) {
        if (error instanceof TimelineAPIError) {
          if (error.errorType === "NOT_FOUND") {
            // 該日期沒有時刻表記錄，返回空陣列
            setSchedules([])
          } else {
            // eslint-disable-next-line no-console
            console.error("Failed to load schedule:", error)
            setSchedules([])
          }
        } else {
          // eslint-disable-next-line no-console
          console.error("Failed to load schedule:", error)
          setSchedules([])
        }
      } finally {
        setIsLoadingSchedule(false)
      }
    }

    // 等待影廳列表載入完成後再載入時刻表
    if (theaters.length > 0) {
      loadSchedule()
    }
  }, [formattedDate, theaters, theaterIdMap, movies])

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
      const currentDate = formattedDate.match(/^(\d{4})\/(\d{2})\/(\d{2})/)
      if (currentDate && draggedItem.movie.startAt && draggedItem.movie.endAt) {
        const [, year, month, day] = currentDate
        const currentDateObj = new Date(Number(year), Number(month) - 1, Number(day))
        currentDateObj.setHours(0, 0, 0, 0)

        const startDate = new Date(draggedItem.movie.startAt)
        startDate.setHours(0, 0, 0, 0)

        const endDate = new Date(draggedItem.movie.endAt)
        endDate.setHours(0, 0, 0, 0)

        if (currentDateObj < startDate || currentDateObj > endDate) {
          alert(
            `此電影的上映期間為 ${format(new Date(draggedItem.movie.startAt), "yyyy/MM/dd")} 至 ${format(new Date(draggedItem.movie.endAt), "yyyy/MM/dd")}，無法排在此日期`
          )
          setDraggedItem(null)
          return
        }
      }

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
        alert("日期格式錯誤")
        return
      }

      const [, year, month, day] = dateMatch
      const dateStr = `${year}-${month}-${day}`

      // 將 schedules 轉換為 API 需要的格式
      // 使用映射表將前端的 theater.id (字串) 轉換為 API 的 theaterId (數字)
      const showtimes: ShowtimeItem[] = schedules
        .map((schedule) => {
          const apiTheaterId = theaterIdMap.get(schedule.theaterId)
          if (!apiTheaterId) {
            // 如果映射表中沒有，顯示錯誤
            alert(`錯誤：找不到影廳 ${schedule.theaterId} 的對應關係，請重新載入頁面`)
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
      alert("時刻表儲存成功")
      navigate("/timelines", { state: { formattedDate } })
    } catch (error) {
      if (error instanceof TimelineAPIError) {
        if (error.errorType === "VALIDATION_ERROR") {
          alert(`儲存失敗：${error.message}`)
        } else if (error.statusCode === 403) {
          alert("該日期已開始販售，無法修改")
        } else if (error.statusCode === 409) {
          alert("場次時間衝突，請檢查時刻表")
        } else if (error.errorType === "UNAUTHORIZED") {
          alert("未授權，請重新登入")
        } else {
          alert(`儲存失敗：${error.message}`)
        }
      } else {
        alert("儲存失敗，請稍後再試")
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
                <div className="flex items-center justify-center py-8 text-gray-400">載入中...</div>
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
            <TheaterScheduleList
              theaters={theaters}
              timeSlots={timeSlots}
              schedules={schedules}
              draggedItem={draggedItem}
              onDrop={handleDrop}
              onDragStartSchedule={handleDragStartSchedule}
              isInteractive
            />
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
