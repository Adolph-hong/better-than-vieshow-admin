import { useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { format, isSameMonth, startOfMonth } from "date-fns"
import { zhTW } from "date-fns/locale/zh-TW"
import AdminContainer from "@/components/layout/AdminContainer"
import TimelineLayout from "@/components/layout/TimelineLayout"
import CalendarPanel from "@/components/timelines/CalendarPanel"
import ConfirmDialog from "@/components/timelines/ConfirmDialog"
import CopyScheduleDialog from "@/components/timelines/CopyScheduleDialog"
import MovieList from "@/components/timelines/MovieList"
import ScheduleNav from "@/components/timelines/ScheduleNav"
import SchedulePreview from "@/components/timelines/SchedulePreview"
import TheaterScheduleList from "@/components/timelines/TheaterScheduleList"
import { theaters, timeSlots } from "@/components/timelines/timelineData"
import Header from "@/components/ui/Header"
import {
  getMovies,
  getSchedulesByFormattedDate,
  hasDraft,
  markDateAsPublished,
  isDatePublished,
  getScheduleStatusDates,
  copySchedules,
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

const parseDateFromFormatted = (formattedDate: string): Date | null => {
  const match = formattedDate.match(/^(\d{4})\/(\d{2})\/(\d{2})/)
  if (!match) return null
  const [, year, month, day] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

const TimeLine = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as { formattedDate?: string } | null

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (locationState?.formattedDate) {
      const parsed = parseDateFromFormatted(locationState.formattedDate)
      if (parsed) return parsed
    }
    return new Date()
  })
  const [visibleMonth, setVisibleMonth] = useState<Date>(() => startOfMonth(selectedDate))
  const [showPreview, setShowPreview] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showCopyDialog, setShowCopyDialog] = useState(false)
  const [copyError, setCopyError] = useState<string>("")
  const [, setRefreshKey] = useState(0)

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

  const schedules = getSchedulesByFormattedDate<Schedule>(formattedSelectedDate)

  const hasDraftStatus = hasDraft(formattedSelectedDate)

  const isPublished = isDatePublished(formattedSelectedDate)

  const { draft: draftDates, selling: sellingDates } = getScheduleStatusDates()

  const handleStartSelling = () => {
    setShowConfirmDialog(true)
  }

  const handleConfirmSelling = () => {
    markDateAsPublished(formattedSelectedDate)
    setRefreshKey((prev) => prev + 1)
    setShowConfirmDialog(false)
  }

  const handleCancelSelling = () => {
    setShowConfirmDialog(false)
  }

  const handleCopySchedule = () => {
    setCopyError("")
    setShowCopyDialog(true)
  }

  const handleConfirmCopy = (targetDate: string) => {
    const [year, month, day] = targetDate.split("/")
    const targetDateObj = new Date(Number(year), Number(month) - 1, Number(day))
    const weekDay = targetDateObj.toLocaleDateString("zh-TW", { weekday: "narrow" })
    const targetFormattedDateWithWeekday = `${targetDate}(${weekDay})`

    if (isDatePublished(targetFormattedDateWithWeekday)) {
      setCopyError("錯誤：該日已經開始販售了, 請選擇其他日期")
      return
    }

    const sourceDateMatch = formattedSelectedDate.match(/^(\d{4}\/\d{2}\/\d{2})/)
    if (!sourceDateMatch) {
      setCopyError("錯誤:無法解析來源日期")
      return
    }
    const sourceDate = sourceDateMatch[1]

    const success = copySchedules(sourceDate, targetDate)
    if (success) {
      setShowCopyDialog(false)
      setCopyError("")
      setRefreshKey((prev) => prev + 1)
      setSelectedDate(targetDateObj)
      if (!isSameMonth(targetDateObj, visibleMonth)) {
        setVisibleMonth(startOfMonth(targetDateObj))
      }
    } else {
      setCopyError("錯誤:複製失敗，請重試")
    }
  }

  const handleCancelCopy = () => {
    setShowCopyDialog(false)
    setCopyError("")
  }

  return (
    <AdminContainer>
      <Header title="時刻表" />
      <TimelineLayout>
        {/* 左邊排程區 */}
        <div className="flex w-full max-w-67.5 flex-col gap-6">
          <CalendarPanel
            selectedDate={selectedDate}
            visibleMonth={visibleMonth}
            draftDates={draftDates}
            sellingDates={sellingDates}
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
            onDuplicate={handleCopySchedule}
          />
          <TheaterScheduleList
            theaters={theaters}
            timeSlots={timeSlots}
            schedules={schedules}
            isInteractive={false}
          />
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
      {/* 複製時刻表對話框 */}
      <CopyScheduleDialog
        isOpen={showCopyDialog}
        onConfirm={handleConfirmCopy}
        onCancel={handleCancelCopy}
        errorMessage={copyError}
        draftDates={draftDates}
        sellingDates={sellingDates}
      />
    </AdminContainer>
  )
}

export default TimeLine
