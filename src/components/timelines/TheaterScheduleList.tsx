import { useState } from "react"
import type { Theater } from "@/components/timelines/timelineData"

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
  onDragStartSchedule?: (schedule: Schedule, e: React.DragEvent) => void
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

  const timeSlotHeight = 24
  const timeSlotGap = 6
  const slotHeight = timeSlotHeight + timeSlotGap

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  }

  const getSchedulePosition = (startTime: string, endTime: string) => {
    const startSlotIndex = timeSlots.findIndex((slot) => slot === startTime)
    if (startSlotIndex === -1) return null

    const endMinutes = timeToMinutes(endTime)

    let endSlotIndex = timeSlots.findIndex((slot) => {
      const slotMinutes = timeToMinutes(slot)
      return slotMinutes >= endMinutes
    })

    if (endSlotIndex === -1) {
      endSlotIndex = timeSlots.length
    }

    const top = startSlotIndex * slotHeight
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
        {theaters.map((theater) => (
          <div
            key={theater.id}
            className="flex w-full min-w-46.5 flex-col gap-2 border-r border-gray-50 p-2"
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
                        isInteractive
                          ? (e) => {
                              if (e.dataTransfer && e.currentTarget instanceof HTMLElement) {
                                e.dataTransfer.effectAllowed = "move"
                                e.currentTarget.style.opacity = "0.7"
                                const rect = e.currentTarget.getBoundingClientRect()
                                e.dataTransfer.setDragImage(
                                  e.currentTarget,
                                  e.clientX - rect.left,
                                  e.clientY - rect.top
                                )
                                setTimeout(() => {
                                  if (e.currentTarget instanceof HTMLElement) {
                                    e.currentTarget.style.opacity = "1"
                                  }
                                }, 0)
                              }
                              onDragStartSchedule?.(schedule, e)
                            }
                          : undefined
                      }
                      onDragEnd={
                        isInteractive
                          ? (e) => {
                              if (e.currentTarget instanceof HTMLElement) {
                                e.currentTarget.style.opacity = "1"
                              }
                            }
                          : undefined
                      }
                      className={`absolute right-0 left-0 overflow-hidden rounded-lg bg-gray-900 p-2 shadow-md ${
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
