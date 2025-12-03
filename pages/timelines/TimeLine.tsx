import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { format, isSameMonth, startOfMonth } from "date-fns"
import { zhTW } from "date-fns/locale/zh-TW"
import AdminContainer from "@/components/layout/AdminContainer"
import TimelineLayout from "@/components/layout/TimelineLayout"
import CalendarPanel from "@/components/timeline/CalendarPanel"
import ConfirmDialog from "@/components/timeline/ConfirmDialog"
import MovieList from "@/components/timeline/MovieList"
import ScheduleNav from "@/components/timeline/ScheduleNav"
import SchedulePreview from "@/components/timeline/SchedulePreview"
import TheaterScheduleList from "@/components/timeline/TheaterScheduleList"
import { theaters, timeSlots } from "@/components/timeline/timelineData"
import Header from "@/components/ui/Header"
import {
  getMovies,
  getSchedulesByFormattedDate,
  hasDraft,
  markDateAsPublished,
  isDatePublished,
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

const TimeLine = () => {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [visibleMonth, setVisibleMonth] = useState<Date>(() => startOfMonth(new Date()))
  const [showPreview, setShowPreview] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

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
  }, [formattedSelectedDate, refreshKey])

  // 檢查是否有草稿
  const hasDraftStatus = useMemo(() => {
    return hasDraft(formattedSelectedDate)
  }, [formattedSelectedDate, refreshKey])

  // 檢查是否已販售
  const isPublished = useMemo(() => {
    return isDatePublished(formattedSelectedDate)
  }, [formattedSelectedDate, refreshKey])

  // 處理開始販售
  const handleStartSelling = () => {
    setShowConfirmDialog(true)
  }

  // 確認開始販售
  const handleConfirmSelling = () => {
    markDateAsPublished(formattedSelectedDate)
    setRefreshKey((prev) => prev + 1)
    setShowConfirmDialog(false)
    // 可以加入成功提示或其他後續處理
  }

  // 取消開始販售
  const handleCancelSelling = () => {
    setShowConfirmDialog(false)
  }

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
            isPublished={isPublished}
            onGoToday={handleGoToday}
            onPrevDay={() => handleChangeDay(-1)}
            onNextDay={() => handleChangeDay(1)}
            onEdit={() =>
              navigate("/timelines/edit", {
                state: { formattedDate: formattedSelectedDate },
              })
            }
            onPreview={() => {
              setShowPreview(true)
            }}
            onStartSelling={handleStartSelling}
          />
          {/* 廳次列表 */}
          <TheaterScheduleList theaters={theaters} timeSlots={timeSlots} schedules={schedules} />
        </div>
      </TimelineLayout>
      {/* 預覽視窗 */}
      {showPreview && (
        <SchedulePreview
          formattedDate={formattedSelectedDate}
          schedules={schedules}
          onClose={() => setShowPreview(false)}
        />
      )}
      {/* 開始販售確認對話框 */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="開始販售"
        message={`確定要開始販售 ${formattedSelectedDate} 的電影票嗎?`}
        warning="販售後就無法再度編輯該日的電影時刻表"
        onConfirm={handleConfirmSelling}
        onCancel={handleCancelSelling}
        confirmText="確認"
        cancelText="取消"
      />
    </AdminContainer>
  )
}

export default TimeLine
