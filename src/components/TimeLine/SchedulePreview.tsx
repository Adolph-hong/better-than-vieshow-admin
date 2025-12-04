import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { X } from "lucide-react"
import AgeBadge from "@/components/timeline/AgeBadge"
import { theaters, type TheaterType } from "@/components/timeline/timelineData"

interface Movie {
  id: string
  movieName: string
  duration: string
  poster: string
  category?: string
}

interface Schedule {
  id: string
  movieId: string
  theaterId: string
  startTime: string
  endTime: string
  movie: Movie
}

interface SchedulePreviewProps {
  formattedDate: string
  schedules: Schedule[]
  onClose: () => void
}

const formatDuration = (minutes: string): string => {
  const totalMinutes = parseInt(minutes, 10)
  if (Number.isNaN(totalMinutes) || totalMinutes <= 0) return ""
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

const SchedulePreview = ({ formattedDate, schedules, onClose }: SchedulePreviewProps) => {
  const previewRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // 控制進場動畫
  useEffect(() => {
    // 下一個 event loop 再切換成顯示，觸發 transition
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = useCallback(() => {
    // 先把面板推回去，再在動畫結束後真正關閉
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300) // 300ms 是動畫時間
  }, [onClose])

  // 點擊外部關閉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (previewRef.current && !previewRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    // 延遲一下再綁定，避免立即觸發
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timer)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [handleClose])

  // 按種類分組排程
  const schedulesByType = useMemo(() => {
    const grouped: Record<TheaterType, typeof schedules> = {
      數位: [],
      "3DX": [],
      IMAX: [],
    }

    schedules.forEach((schedule) => {
      const theater = theaters.find((t) => t.id === schedule.theaterId)
      if (theater) {
        grouped[theater.type].push(schedule)
      }
    })

    return grouped
  }, [schedules])

  // 按種類和電影分組，每個電影+種類組合為一個項目
  const movieTypeList = useMemo(() => {
    const types: TheaterType[] = ["數位", "3DX", "IMAX"]
    const result: Array<{
      movie: Movie
      type: TheaterType
      showtimes: { startTime: string; theaterId: string }[]
    }> = []

    types.forEach((type) => {
      const typeSchedules = schedulesByType[type]
      // 按電影分組
      const movieGroups = typeSchedules.reduce(
        (acc, schedule) => {
          if (!acc[schedule.movieId]) {
            acc[schedule.movieId] = {
              movie: schedule.movie,
              showtimes: [],
            }
          }
          acc[schedule.movieId].showtimes.push({
            startTime: schedule.startTime,
            theaterId: schedule.theaterId,
          })
          return acc
        },
        {} as Record<
          string,
          {
            movie: Movie
            showtimes: { startTime: string; theaterId: string }[]
          }
        >
      )

      // 將每個電影+種類組合加入結果
      Object.values(movieGroups).forEach((group) => {
        result.push({
          movie: group.movie,
          type,
          showtimes: group.showtimes.sort((a, b) => a.startTime.localeCompare(b.startTime)),
        })
      })
    })

    return result
  }, [schedulesByType])

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* 預覽視窗 - 從右側滑入 */}
      <div
        ref={previewRef}
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-[623px] transform rounded-tl-3xl rounded-bl-3xl bg-white p-6 shadow-[0_4px_4px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col gap-6">
          {/* 標題列 */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="header-3 text-gray-900">電影時刻表(預覽)</h2>
              <p className="body-medium text-gray-500">{formattedDate}</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="flex h-8 w-8 cursor-pointer items-center justify-center border border-gray-50 hover:bg-gray-100"
            >
              <X className="h-3 w-3 text-gray-500" />
            </button>
          </div>

          {/* 內容區域 */}
          <div className="flex-1 overflow-y-auto">
            {movieTypeList.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="body-medium text-gray-400">目前沒有排程</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {movieTypeList.map(({ movie, type, showtimes }) => (
                  <div key={`${movie.id}-${type}`} className="flex gap-3 rounded-sm bg-gray-900">
                    {/* 電影海報 */}
                    <img
                      src={movie.poster || ""}
                      alt={movie.movieName}
                      className="h-40 w-25 shrink-0 rounded-[10px] object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />

                    {/* 電影資訊 */}
                    <div className="flex flex-1 flex-col p-1">
                      {/* 片名 片長 分級 */}
                      <div className="flex justify-between">
                        {/* 片名 片長 */}
                        <div className="flex flex-col gap-1">
                          <h3 className="header-3 text-[#F2F2F2]">
                            {movie.movieName}({type})
                          </h3>
                          <p className="body-medium text-[#F2F2F2]">
                            片長 {formatDuration(movie.duration)}
                          </p>
                        </div>
                        <AgeBadge category={movie.category} />
                      </div>
                      {/* 場次時間 */}
                      <div className="grid grid-cols-5">
                        {showtimes.map((showtime) => (
                          <span
                            key={`${showtime.theaterId}-${showtime.startTime}`}
                            className="header-3 flex text-[#F2F2F2]"
                          >
                            {showtime.startTime}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default SchedulePreview
