import { useMemo, useState } from "react"
import { zhTW } from "date-fns/locale/zh-TW"
import { DayPicker, getDefaultClassNames } from "react-day-picker"
import moviesData from "@/components/form/db.json"
import AdminContainer from "@/components/layout/AdminContainer"
import TimelineLayout from "@/components/layout/TimelineLayout"
import Header from "@/components/ui/Header"

interface Movie {
  id: string
  movieName: string
}

const TimeLine = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const movies = useMemo(() => {
    const data = moviesData as { movies?: Movie[] }
    return data.movies ?? []
  }, [])

  const handleSelectDate = (date?: Date) => {
    if (!date) return
    setSelectedDate(date)
  }
  const defaultClassNames = getDefaultClassNames()

  return (
    <AdminContainer>
      <Header title="時刻表" />
      <TimelineLayout>
        <div className="flex w-full max-w-67.5 flex-col gap-6">
          {/* 左邊日曆 */}
          <div className="flex rounded-sm bg-white">
            <DayPicker
              mode="single"
              locale={zhTW}
              weekStartsOn={0}
              selected={selectedDate}
              onSelect={handleSelectDate}
              showOutsideDays
              classNames={{
                today: `border-amber-500 `,
                selected: `bg-amber-500 border-amber-500 text-white`,
                root: `${defaultClassNames.root} w-full rounded-sm`,
                caption_label:
                  "flex justify-center items-center ml-3 text-gray-700 font-family-inter font-semibold",
                chevron: "fill-gray-700",
                button_next: "w-6 h-6",
                // day: "h-8 w-8",
                day_button: "w-8 h-8 text-xs",
              }}
            />
          </div>
          {/* 右邊電影列表 */}
          <div className="rounded-sm bg-white p-4">
            <div className="font-family-inter flex justify-between px-2 py-3 font-semibold text-[#000000]">
              <span>電影</span>
              <span>場次</span>
            </div>

            <div className="flex flex-col">
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  className="body-medium flex justify-between border-t border-gray-50 px-2 py-3"
                >
                  <span className="line-clamp-2 max-w-46.5 break-all">{movie.movieName}</span>
                  <span>0</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* <div className="flex flex-1 items-center justify-center rounded-2xl bg-white text-[#BAB9BE]">
          右側排程區（之後再完成）
        </div> */}
      </TimelineLayout>
    </AdminContainer>
  )
}

export default TimeLine
