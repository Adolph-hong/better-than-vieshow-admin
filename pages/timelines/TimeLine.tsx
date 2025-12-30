import { useEffect, useMemo, useState } from "react"
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
import { timeSlots, type Theater } from "@/components/timelines/timelineData"
import Header from "@/components/ui/Header"
import sendAPI from "@/utils/sendAPI"
import {
  hasDraft,
  markDateAsPublished,
  isDatePublished,
  copySchedules,
} from "@/utils/storage"
import {
  getMonthOverview,
  getDailySchedule,
  TimelineAPIError,
  type ShowtimeResponse,
} from "@/services/timelineAPI"
import { fetchMovies } from "@/services/movieAPI"

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
  const [draftDates, setDraftDates] = useState<Date[]>([])
  const [sellingDates, setSellingDates] = useState<Date[]>([])
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false)
  const [scheduleStatus, setScheduleStatus] = useState<"OnSale" | "Draft" | null>(null)
  const [theaters, setTheaters] = useState<Theater[]>([])
  const [isLoadingTheaters, setIsLoadingTheaters] = useState(true)
  const [movies, setMovies] = useState<Array<{ id: string; movieName: string; poster: string }>>([])

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
        setIsLoadingTheaters(true)
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
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to load theaters:", error)
        // 如果載入失敗，使用空陣列
        setTheaters([])
      } finally {
        setIsLoadingTheaters(false)
      }
    }

    loadTheaters()
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

  // 載入電影列表（用於獲取電影海報）
  useEffect(() => {
    const loadMovies = async () => {
      try {
        const data = await fetchMovies()
        const movieList = data.map((movie) => ({
          id: movie.id,
          movieName: movie.movieName,
          poster: movie.poster || "",
        }))
        setMovies(movieList)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to load movies:", error)
        setMovies([])
      }
    }

    loadMovies()
  }, [])

  // 當選中日期改變時，從 API 獲取每日時刻表
  useEffect(() => {
    const loadDailySchedule = async () => {
      if (!selectedDate) {
        setSchedules([])
        setScheduleStatus(null)
        return
      }

      try {
        setIsLoadingSchedule(true)
        // 將日期轉換為 YYYY-MM-DD 格式
        const dateStr = format(selectedDate, "yyyy-MM-dd")

        const dailySchedule = await getDailySchedule(dateStr)

        // 轉換 API 資料為前端使用的 Schedule 格式
        const convertedSchedules: Schedule[] = dailySchedule.showtimes.map(
          (showtime: ShowtimeResponse) => {
            // 從電影列表中查找對應的電影，取得 poster
            const movieData = movies.find((m) => m.id === String(showtime.movieId))
            return {
              id: String(showtime.id),
              movieId: String(showtime.movieId),
              theaterId: String(showtime.theaterId),
              startTime: showtime.startTime,
              endTime: showtime.endTime,
              movie: {
                id: String(showtime.movieId),
                movieName: showtime.movieTitle,
                duration: String(showtime.movieDuration),
                poster: movieData?.poster || "", // 從電影列表取得 poster
              },
            }
          }
        )

        setSchedules(convertedSchedules)
        setScheduleStatus(dailySchedule.status)
      } catch (error) {
        if (error instanceof TimelineAPIError) {
          if (error.errorType === "NOT_FOUND") {
            // 該日期沒有時刻表記錄，返回空陣列
            setSchedules([])
            setScheduleStatus(null)
          } else if (error.errorType === "UNAUTHORIZED") {
            // 未授權，清除資料
            setSchedules([])
            setScheduleStatus(null)
            // 可以選擇顯示錯誤訊息或重新導向登入頁
          } else {
            // 其他錯誤
            // eslint-disable-next-line no-console
            console.error("Failed to load daily schedule:", error)
            setSchedules([])
            setScheduleStatus(null)
          }
        } else {
          // eslint-disable-next-line no-console
          console.error("Failed to load daily schedule:", error)
          setSchedules([])
          setScheduleStatus(null)
        }
      } finally {
        setIsLoadingSchedule(false)
      }
    }

    // 等待電影列表載入完成後再載入時刻表
    if (movies.length > 0 || selectedDate) {
      loadDailySchedule()
    }
  }, [selectedDate, movies])

  // 根據 API 返回的狀態判斷
  const hasDraftStatus = scheduleStatus === "Draft"
  const isPublished = scheduleStatus === "OnSale"

  // 當月份改變時，從 API 獲取月曆概覽
  useEffect(() => {
    const loadMonthOverview = async () => {
      try {
        setIsLoadingCalendar(true)
        const year = visibleMonth.getFullYear()
        const month = visibleMonth.getMonth() + 1 // getMonth() 返回 0-11，API 需要 1-12

        const overview = await getMonthOverview(year, month)

        // 將 API 返回的日期字串轉換為 Date 對象
        const draftDatesArray: Date[] = []
        const sellingDatesArray: Date[] = []

        overview.dates.forEach((item) => {
          const date = new Date(item.date)
          date.setHours(0, 0, 0, 0) // 確保時間為 00:00:00

          if (item.status === "Draft") {
            draftDatesArray.push(date)
          } else if (item.status === "OnSale") {
            sellingDatesArray.push(date)
          }
        })

        setDraftDates(draftDatesArray)
        setSellingDates(sellingDatesArray)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to load month overview:", error)
        if (error instanceof TimelineAPIError) {
          if (error.errorType === "UNAUTHORIZED") {
            // 未授權時，可以選擇清除狀態或顯示錯誤訊息
            setDraftDates([])
            setSellingDates([])
          }
        } else {
          // 其他錯誤時，保持空陣列
          setDraftDates([])
          setSellingDates([])
        }
      } finally {
        setIsLoadingCalendar(false)
      }
    }

    loadMonthOverview()
  }, [visibleMonth])

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
          <MovieList schedules={schedules} />
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
