import { useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale/zh-TW"
import AdminContainer from "@/components/layout/AdminContainer"
import TheaterScheduleList from "@/components/timelines/TheaterScheduleList"
import { theaters, timeSlots } from "@/components/timelines/timelineData"
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

  const [schedules, setSchedules] = useState<Schedule[]>(() => {
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
        saveSchedulesByFormattedDate(updated, formattedDate)
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
        saveSchedulesByFormattedDate(updated, formattedDate)
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
        saveSchedulesByFormattedDate(updated, formattedDate)
        return updated
      })
    }
    setDraggedItem(null)
  }

  const handleSave = () => {
    saveSchedulesByFormattedDate(schedules, formattedDate)
    navigate("/timelines", { state: { formattedDate } })
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
