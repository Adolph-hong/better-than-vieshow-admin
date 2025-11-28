import type { Theater } from "@/components/timeline/timelineData"

interface TheaterScheduleListProps {
  theaters: Theater[]
  timeSlots: string[]
}

const TheaterScheduleList = ({ theaters, timeSlots }: TheaterScheduleListProps) => {
  return (
    <div className="flex w-full overflow-x-auto overflow-y-auto rounded-sm bg-white [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex py-2">
        {theaters.map((theater, index) => (
          <div
            key={theater.id}
            className={`flex w-full min-w-46.5 flex-col gap-2 p-2 ${index < theaters.length - 1 ? "border-r border-gray-50" : ""}`}
          >
            <div className="flex flex-col gap-1 bg-white">
              <span className="body-medium text-gray-900">{theater.name}</span>
              <div className="font-family-inter flex w-full justify-between text-xs font-normal text-gray-300">
                <span>一般座位</span>
                <span>{theater.generalSeats} 位</span>
              </div>
              <div className="font-family-inter flex w-full justify-between text-xs font-normal text-gray-300">
                <span>殘障座位</span>
                <span>{theater.disabledSeats} 位</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              {timeSlots.map((time) => {
                const isHourly = time.endsWith(":00")
                return (
                  <div
                    key={time}
                    className={`font-family-inter flex h-6 items-center rounded-lg border border-dashed border-[#B2B2B2] px-2 text-xs font-normal [border-dasharray:4_4] ${isHourly ? "text-[#666666]" : "text-[#999999]"}`}
                  >
                    {time}
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
