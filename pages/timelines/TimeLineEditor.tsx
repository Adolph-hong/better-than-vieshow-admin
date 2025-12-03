import { useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale/zh-TW"
import AdminContainer from "@/components/layout/AdminContainer"
import TheaterScheduleList from "@/components/TimeLine/TheaterScheduleList"
import { theaters, timeSlots } from "@/components/TimeLine/timelineData"
import Header from "@/components/ui/Header"
import {
  getMovies,
  getSchedulesByFormattedDate,
  saveSchedulesByFormattedDate,
} from "@/utils/storage"

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

  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    // 初始化時從 LocalStorage 讀取該日期的排程
    return getSchedulesByFormattedDate<Schedule>(formattedDate)
  })
  const [draggedItem, setDraggedItem] = useState<
    { type: "movie"; movie: Movie } | { type: "schedule"; schedule: Schedule } | null
  >(null)

  const movies = useMemo(() => {
    return getMovies()
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

  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(":").map(Number)
    const totalMinutes = hours * 60 + minutes + durationMinutes
    const endHours = Math.floor(totalMinutes / 60)
    const endMins = totalMinutes % 60
    return `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`
  }

  const handleDragStartMovie = (movie: Movie) => {
    setDraggedItem({ type: "movie", movie })
  }

  const handleDragStartSchedule = (schedule: Schedule) => {
    setDraggedItem({ type: "schedule", schedule })
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

    // 找到目標廳的種類
    const targetTheater = theaters.find((t) => t.id === theaterId)
    if (!targetTheater) return false

    return schedules.some((schedule) => {
      // 排除自己（重新拖曳時）
      if (excludeScheduleId && schedule.id === excludeScheduleId) return false

      const scheduleStart = timeToMinutes(schedule.startTime)
      const scheduleEnd = timeToMinutes(schedule.endTime)

      // 1. 檢查同一個廳的時間重疊
      if (schedule.theaterId === theaterId) {
        // 衝突條件：新排程的開始時間 < 現有排程的結束時間 且 新排程的結束時間 > 現有排程的開始時間
        return startMinutes < scheduleEnd && endMinutes > scheduleStart
      }

      // 2. 檢查同一部電影在不同廳（同種類）的衝突
      // 必須是同一部電影
      if (schedule.movieId !== movieId) return false

      // 找到現有排程的廳
      const existingTheater = theaters.find((t) => t.id === schedule.theaterId)
      if (!existingTheater) return false

      // 必須是同種類的廳
      if (existingTheater.type !== targetTheater.type) return false

      // 檢查開始時間間隔：至少需要間隔15分鐘
      // 計算兩個排程開始時間的差距
      const timeDiff = Math.abs(startMinutes - scheduleStart)

      // 如果開始時間差距小於15分鐘，則衝突
      return timeDiff < 15
    })
  }

  const handleDrop = (theaterId: string, timeSlot: string) => {
    if (!draggedItem) return

    if (draggedItem.type === "movie") {
      // 從左邊拖曳電影過來
      const durationMinutes = parseInt(draggedItem.movie.duration, 10)
      const endTime = calculateEndTime(timeSlot, durationMinutes)

      // 檢查衝突
      if (checkConflict(theaterId, timeSlot, endTime, draggedItem.movie.id)) {
        setDraggedItem(null)
        return // 如果有衝突，不執行放置
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
        saveSchedulesByFormattedDate(updated, formattedDate)
        return updated
      })
    } else if (draggedItem.type === "schedule") {
      // 重新拖曳已存在的排程
      const durationMinutes = parseInt(draggedItem.schedule.movie.duration, 10)
      const endTime = calculateEndTime(timeSlot, durationMinutes)

      // 檢查衝突（排除自己）
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
        return // 如果有衝突，不執行放置
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
        saveSchedulesByFormattedDate(updated, formattedDate)
        return updated
      })
    }

    setDraggedItem(null)
  }

  const handleDragEnd = () => {
    // 如果拖曳結束時沒有成功放置，就刪除（拖到外面）
    if (draggedItem?.type === "schedule") {
      setSchedules((prev) => {
        const updated = prev.filter((s) => s.id !== draggedItem.schedule.id)
        saveSchedulesByFormattedDate(updated, formattedDate)
        return updated
      })
    }
    setDraggedItem(null)
  }

  const handleSave = () => {
    // 儲存排程
    saveSchedulesByFormattedDate(schedules, formattedDate)
    // 導航回 TimeLine 頁面
    navigate("/timelines")
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
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  draggable
                  onDragStart={() => handleDragStartMovie(movie)}
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
            />
          </div>
        </div>
        {/* 底部 */}
        <div className="flex shrink-0 justify-end bg-white p-6">
          <button
            type="button"
            onClick={handleSave}
            className="bg-primary-500 body-medium flex cursor-pointer rounded-[10px] px-4 py-2.5 text-white"
          >
            儲存時刻表
          </button>
        </div>
      </div>
    </AdminContainer>
  )
}

export default TimeLineEditor
