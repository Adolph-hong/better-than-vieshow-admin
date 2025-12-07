import { useState, useRef, useEffect } from "react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { CalendarDays } from "lucide-react"
import "react-day-picker/dist/style.css"

interface DatePickerProps {
  label: string
  value?: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
}

const DatePicker = ({
  label,
  value,
  onChange,
  error,
  placeholder = "選擇日期",
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  )
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value) {
      const date = new Date(value)
      if (!Number.isNaN(date.getTime())) {
        setSelectedDate(date)
      }
    } else {
      setSelectedDate(undefined)
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      // 格式化為 YYYY-MM-DD
      const formattedDate = format(date, "yyyy-MM-dd")
      onChange(formattedDate)
      setIsOpen(false)
    }
  }

  const displayValue = selectedDate ? format(selectedDate, "yyyy/MM/dd") : ""

  return (
    <div className="font-family-inter flex flex-col gap-2 text-sm font-medium text-[#000000]">
      <label>{label}</label>
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-white bg-white px-3 text-left text-gray-900 ${
            error ? "border-red-500" : ""
          }`}
        >
          <span className={displayValue ? "text-gray-900" : "text-gray-400"}>
            {displayValue || placeholder}
          </span>
          <CalendarDays className="h-4 w-4 text-gray-400" />
        </button>
        {isOpen && (
          <div className="absolute bottom-full z-50 mb-1 rounded-sm border border-gray-200 bg-white shadow-lg">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              locale={zhTW}
              weekStartsOn={0}
              showOutsideDays
              classNames={{
                today: "border-amber-500",
                selected:
                  "relative before:content-[''] before:w-8 before:h-8 before:bg-[#5365AC] before:rounded-full before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:z-0 [&_button]:relative [&_button]:z-10 [&_button]:text-white",
                root: `${getDefaultClassNames().root} w-full`,
                caption_label:
                  "flex justify-center items-center ml-3 text-gray-700 font-family-inter font-semibold",
                chevron: "fill-gray-700",
                button_previous: "w-6 h-6 cursor-pointer",
                button_next: "w-6 h-6 cursor-pointer",
                day_button: "w-8 h-8 text-xs font-roboto font-normal cursor-pointer",
              }}
            />
          </div>
        )}
      </div>
      {error && <span className="text-red-500">{error}</span>}
    </div>
  )
}

export default DatePicker
