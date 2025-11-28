import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { format, isSameMonth, startOfMonth } from "date-fns"
import { zhTW } from "date-fns/locale/zh-TW"
import moviesData from "@/components/form/db.json"
import AdminContainer from "@/components/layout/AdminContainer"
import TimelineLayout from "@/components/layout/TimelineLayout"
import CalendarPanel from "@/components/timeline/CalendarPanel"
import MovieList from "@/components/timeline/MovieList"
import ScheduleNav from "@/components/timeline/ScheduleNav"
import TheaterScheduleList from "@/components/timeline/TheaterScheduleList"
import { theaters, timeSlots } from "@/components/timeline/timelineData"
import Header from "@/components/ui/Header"

interface Movie {
  id: string
  movieName: string
}

const TimeLine = () => {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [visibleMonth, setVisibleMonth] = useState<Date>(() => startOfMonth(new Date()))

  const movies = useMemo(() => {
    const data = moviesData as { movies?: Movie[] }
    return data.movies ?? []
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
          <MovieList movies={movies} />
        </div>
        {/* 右邊排程區 */}
        <div className="flex flex-1 flex-col gap-6 overflow-hidden">
          {/* nav */}
          <ScheduleNav
            formattedDate={formattedSelectedDate}
            onGoToday={handleGoToday}
            onPrevDay={() => handleChangeDay(-1)}
            onNextDay={() => handleChangeDay(1)}
            onEdit={() =>
              navigate("/timelines/edit", {
                state: { formattedDate: formattedSelectedDate },
              })
            }
          />
          {/* 廳次列表 */}
          <TheaterScheduleList theaters={theaters} timeSlots={timeSlots} />
        </div>
      </TimelineLayout>
    </AdminContainer>
  )
}

export default TimeLine
