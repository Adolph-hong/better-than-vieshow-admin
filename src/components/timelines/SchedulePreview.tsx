import { useEffect, useRef, useState, useCallback } from "react"
import { X } from "lucide-react"
import AgeBadge from "@/components/timelines/AgeBadge"
import type {
  GroupedScheduleResponse,
  MovieShowtimeGroup,
  TheaterTypeGroup,
  GroupedShowtimeItem,
} from "@/services/timelineAPI"

export interface SchedulePreviewProps {
  formattedDate: string
  groupedSchedule: GroupedScheduleResponse
  onClose: () => void
}

// 將 API 的 rating 轉換為前端使用的 category
const convertRatingToCategory = (rating: string | null): string | undefined => {
  if (!rating) return undefined
  const ratingMap: Record<string, string> = {
    G: "普遍級",
    P: "保護級",
    PG: "輔導級",
    R: "限制級",
  }
  return ratingMap[rating] || undefined
}

const SchedulePreview = ({ formattedDate, groupedSchedule, onClose }: SchedulePreviewProps) => {
  const previewRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }, [onClose])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (previewRef.current && !previewRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timer)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [handleClose])

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
            {groupedSchedule.movieShowtimes.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="body-medium text-gray-400">目前沒有排程</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {groupedSchedule.movieShowtimes.flatMap((movieGroup: MovieShowtimeGroup) => {
                  // 遍歷每個影廳類型分組
                  return movieGroup.theaterTypeGroups.map((theaterTypeGroup: TheaterTypeGroup) => {
                    const theaterTypeDisplay = theaterTypeGroup.theaterTypeDisplay || "一般數位"
                    return (
                      <div
                        key={`${movieGroup.movieId}-${theaterTypeGroup.theaterType || "unknown"}`}
                        className="flex gap-3 rounded-sm bg-gray-900"
                      >
                        {/* 電影海報 */}
                        <img
                          src={movieGroup.posterUrl || ""}
                          alt={movieGroup.movieTitle || ""}
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
                                {movieGroup.movieTitle || "未知電影"}({theaterTypeDisplay})
                              </h3>
                              <p className="body-medium text-[#F2F2F2]">
                                片長 {movieGroup.durationDisplay || `${movieGroup.duration} 分鐘`}
                              </p>
                            </div>
                            <AgeBadge category={convertRatingToCategory(movieGroup.rating)} />
                          </div>
                          {/* 場次時間 */}
                          <div className="grid grid-cols-5">
                            {theaterTypeGroup.showtimes.map((showtime: GroupedShowtimeItem) => (
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
                    )
                  })
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default SchedulePreview
