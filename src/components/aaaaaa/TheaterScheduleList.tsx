import { useState } from "react"
import type { Theater } from "@/components/aaaaaa/timelineData"

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

interface DraggedItem {
  type: "movie"
  movie: Movie
}

interface DraggedSchedule {
  type: "schedule"
  schedule: Schedule
}

interface TheaterScheduleListProps {
  theaters: Theater[]
  timeSlots: string[]
  schedules?: Schedule[]
  draggedItem?: DraggedItem | DraggedSchedule | null
  onDrop?: (theaterId: string, timeSlot: string) => void
  onDragStartSchedule?: (schedule: Schedule) => void
  isInteractive?: boolean
}

const TheaterScheduleList = ({
  theaters,
  timeSlots,
  schedules = [],
  draggedItem,
  onDrop,
  onDragStartSchedule,
  isInteractive = true,
}: TheaterScheduleListProps) => {
  const [draggedOverSlot, setDraggedOverSlot] = useState<{
    theaterId: string
    timeSlot: string
  } | null>(null)

  const timeSlotHeight = 24 // 每個時間槽位的高度 (h-6 = 24px)
  const timeSlotGap = 6 // 間距 (gap-1.5 = 6px)
  const slotHeight = timeSlotHeight + timeSlotGap

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  }

  const getSchedulePosition = (startTime: string, endTime: string) => {
    const startSlotIndex = timeSlots.findIndex((slot) => slot === startTime)
    if (startSlotIndex === -1) return null

    // 計算結束時間的分鐘數
    const endMinutes = timeToMinutes(endTime)

    // 找到結束時間應該對應的槽位
    // 如果結束時間不是整點（:00, :15, :30, :45），向上取整到下一個槽位
    let endSlotIndex = timeSlots.findIndex((slot) => {
      const slotMinutes = timeToMinutes(slot)
      return slotMinutes >= endMinutes
    })

    // 如果找不到（結束時間超過所有槽位），使用最後一個槽位
    if (endSlotIndex === -1) {
      endSlotIndex = timeSlots.length
    }

    // 精確對齊：top 位置 = 槽位索引 * (槽位高度 + 間距)
    const top = startSlotIndex * slotHeight
    // 高度 = (結束槽位索引 - 開始槽位索引) * (槽位高度 + 間距) - 間距
    const height = (endSlotIndex - startSlotIndex) * slotHeight - timeSlotGap
    return { top, height }
  }

  const handleDragOver = (e: React.DragEvent, theaterId: string, timeSlot: string) => {
    if (!isInteractive) return
    e.preventDefault()
    setDraggedOverSlot({ theaterId, timeSlot })
  }

  const handleDragLeave = () => {
    if (!isInteractive) return
    setDraggedOverSlot(null)
  }

  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(":").map(Number)
    const totalMinutes = hours * 60 + minutes + durationMinutes
    const endHours = Math.floor(totalMinutes / 60)
    const endMins = totalMinutes % 60
    return `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`
  }

  const checkConflict = (
    theaterId: string,
    startTime: string,
    endTime: string,
    movieId: string,
    excludeScheduleId?: string
  ): boolean => {
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

  const getSlotState = (theaterId: string, timeSlot: string) => {
    if (!isInteractive) return null
    if (
      !draggedItem ||
      draggedOverSlot?.theaterId !== theaterId ||
      draggedOverSlot?.timeSlot !== timeSlot
    ) {
      return null
    }

    let durationMinutes: number
    let movieId: string
    let excludeScheduleId: string | undefined

    if (draggedItem.type === "movie") {
      durationMinutes = parseInt(draggedItem.movie.duration, 10)
      movieId = draggedItem.movie.id
    } else {
      durationMinutes = parseInt(draggedItem.schedule.movie.duration, 10)
      movieId = draggedItem.schedule.movieId
      excludeScheduleId = draggedItem.schedule.id
    }

    const endTime = calculateEndTime(timeSlot, durationMinutes)
    const hasConflict = checkConflict(theaterId, timeSlot, endTime, movieId, excludeScheduleId)

    return hasConflict ? "conflict" : "can-place"
  }

  const handleDropOnTimeSlot = (e: React.DragEvent, theaterId: string, timeSlot: string) => {
    if (!isInteractive) return
    e.preventDefault()
    setDraggedOverSlot(null)
    if (onDrop) {
      onDrop(theaterId, timeSlot)
    }
  }
  return (
    <div className="flex h-full w-full overflow-x-auto overflow-y-auto rounded-sm bg-white [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex py-2">
        {theaters.map((theater, index) => (
          <div
            key={theater.id}
            className={`flex w-full min-w-46.5 flex-col gap-2 p-2 ${index < theaters.length - 1 ? "border-r border-gray-50" : ""}`}
          >
            <div className="flex flex-col gap-1 bg-white">
              <span className="body-medium text-gray-900">
                {theater.name}({theater.type})
              </span>
              <div className="font-family-inter flex w-full justify-between text-xs font-normal text-gray-300">
                <span>一般座位</span>
                <span>{theater.generalSeats} 位</span>
              </div>
              <div className="font-family-inter flex w-full justify-between text-xs font-normal text-gray-300">
                <span>殘障座位</span>
                <span>{theater.disabledSeats} 位</span>
              </div>
            </div>

            <div className="relative flex flex-col gap-1.5">
              {timeSlots.map((time) => {
                const isHourly = time.endsWith(":00")
                const slotState = getSlotState(theater.id, time)
                const isDraggedOver =
                  draggedOverSlot?.theaterId === theater.id && draggedOverSlot?.timeSlot === time

                let borderColor = "border-[#B2B2B2]"
                let bgColor = ""
                let textColor = isHourly ? "text-[#666666]" : "text-[#999999]"
                let displayText = time
                let borderStyle = "border-dashed"

                if (isDraggedOver) {
                  borderStyle = "border-solid"
                  if (slotState === "conflict") {
                    borderColor = "border-[#E70012]"
                    bgColor = "bg-[#FEECEE]"
                    textColor = "text-[#E70012]"
                    displayText = "衝突"
                  } else if (slotState === "can-place") {
                    borderColor = "border-[#5365AC]"
                    bgColor = "bg-[#BEC9F5]"
                    textColor = "text-gray-900"
                  }
                }

                return (
                  <div
                    key={time}
                    onDragOver={
                      isInteractive ? (e) => handleDragOver(e, theater.id, time) : undefined
                    }
                    onDragLeave={isInteractive ? handleDragLeave : undefined}
                    onDrop={
                      isInteractive ? (e) => handleDropOnTimeSlot(e, theater.id, time) : undefined
                    }
                    className={`font-family-inter flex h-6 items-center rounded-lg border px-2 text-xs font-normal transition-colors ${borderStyle} ${borderStyle === "border-dashed" ? "[border-dasharray:4_4]" : ""} ${borderColor} ${bgColor} ${textColor}`}
                  >
                    {displayText}
                  </div>
                )
              })}
              {/* 渲染排程 */}
              {schedules
                .filter((schedule) => schedule.theaterId === theater.id)
                .map((schedule) => {
                  const position = getSchedulePosition(schedule.startTime, schedule.endTime)
                  if (!position) return null

                  return (
                    <div
                      key={schedule.id}
                      draggable={isInteractive}
                      onDragStart={
                        isInteractive ? () => onDragStartSchedule?.(schedule) : undefined
                      }
                      className={`absolute right-0 left-0 rounded-lg bg-gray-900 p-2 shadow-md ${
                        isInteractive ? "cursor-move" : "cursor-default"
                      }`}
                      style={{
                        top: `${position.top}px`,
                        height: `${position.height}px`,
                        minHeight: "60px",
                      }}
                    >
                      <div className="flex h-full flex-col gap-2">
                        <div className="flex shrink-0 flex-col gap-2">
                          <span className="font-family-inter text-xs font-normal text-white">
                            {schedule.startTime} ~ {schedule.endTime}
                          </span>
                          <span className="body-small line-clamp-1 text-white">
                            {schedule.movie.movieName}
                          </span>
                        </div>
                        <div className="relative flex max-h-45 min-h-0 flex-1">
                          <img
                            src={schedule.movie.poster}
                            alt={schedule.movie.movieName}
                            className="h-full w-full rounded-lg object-cover"
                          />
                          <div className="absolute right-0 bottom-0 left-0 h-8 rounded-b-lg bg-linear-to-t from-gray-900 to-transparent" />
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TheaterScheduleList
