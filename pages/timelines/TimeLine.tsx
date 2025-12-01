import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { format, isSameMonth, startOfMonth } from "date-fns"
import { zhTW } from "date-fns/locale/zh-TW"
import AdminContainer from "@/components/layout/AdminContainer"
import TimelineLayout from "@/components/layout/TimelineLayout"
import CalendarPanel from "@/components/TimeLine/CalendarPanel"
import MovieList from "@/components/TimeLine/MovieList"
import ScheduleNav from "@/components/TimeLine/ScheduleNav"
import TheaterScheduleList from "@/components/TimeLine/TheaterScheduleList"
import { theaters, timeSlots } from "@/components/TimeLine/timelineData"
import Header from "@/components/ui/Header"
import { getMovies, getSchedulesByFormattedDate, hasDraft } from "@/utils/storage"

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

const TimeLine = () => {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [visibleMonth, setVisibleMonth] = useState<Date>(() => startOfMonth(new Date()))

  const movies = useMemo(() => {
    const moviesData = getMovies()
    return Array.isArray(moviesData) ? moviesData : []
  }, [])

  const handleSelectDate = (date?: Date) => {
    if (!date) return
    setSelectedDate(date)
    if (!isSameMonth(date, visibleMonth)) {
      setVisibleMonth(startOfMonth(date))
    }
  }

  const handleMonthChange = (month: Date) => {
    setVisibleMonth(startOfMonth(month))
  }

  const handleGoToday = () => {
    const today = new Date()
    setSelectedDate(today)
    if (!isSameMonth(today, visibleMonth)) {
      setVisibleMonth(startOfMonth(today))
    }
  }

  const handleChangeDay = (delta: number) => {
    setSelectedDate((prev) => {
      const next = new Date(prev)
      next.setDate(prev.getDate() + delta)
      if (!isSameMonth(next, visibleMonth)) {
        setVisibleMonth(startOfMonth(next))
      }
      return next
    })
  }

  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return ""
    const weekDay = selectedDate.toLocaleDateString("zh-TW", { weekday: "narrow" })
    const dateText = format(selectedDate, "yyyy/MM/dd", { locale: zhTW })
    return `${dateText}(${weekDay})`
  }, [selectedDate])

  // 讀取當前日期的排程
  const schedules = useMemo(() => {
    return getSchedulesByFormattedDate<Schedule>(formattedSelectedDate)
  }, [formattedSelectedDate])

  // 檢查是否有草稿
  const hasDraftStatus = useMemo(() => {
    return hasDraft(formattedSelectedDate)
  }, [formattedSelectedDate])

  return (
    <AdminContainer>
      <Header title="時刻表" />
      <TimelineLayout>
        {/* 左邊日曆和電影列表 */}
        <div className="flex w-full max-w-67.5 flex-col gap-6">
          <CalendarPanel
            selectedDate={selectedDate}
            visibleMonth={visibleMonth}
            onSelectDate={handleSelectDate}
            onMonthChange={handleMonthChange}
          />
          <MovieList movies={movies} schedules={schedules} />
        </div>
        {/* 右邊排程區 */}
        <div className="flex flex-1 flex-col gap-6 overflow-hidden">
          {/* nav */}
          <ScheduleNav
            formattedDate={formattedSelectedDate}
            hasDraft={hasDraftStatus}
            onGoToday={handleGoToday}
            onPrevDay={() => handleChangeDay(-1)}
            onNextDay={() => handleChangeDay(1)}
            onEdit={() =>
              navigate("/timelines/edit", {
                state: { formattedDate: formattedSelectedDate },
              })
            }
            onPreview={() => {
              // TODO: 實作預覽功能
            }}
            onStartSelling={() => {
              // TODO: 實作開始販售功能
            }}
          />
          {/* 廳次列表 */}
          <TheaterScheduleList theaters={theaters} timeSlots={timeSlots} schedules={schedules} />
        </div>
      </TimelineLayout>
    </AdminContainer>
  )
}

export default TimeLine
