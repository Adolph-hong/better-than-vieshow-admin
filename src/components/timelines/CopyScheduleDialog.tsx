import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale/zh-TW"
import { AlertTriangle, CalendarDays } from "lucide-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"

interface CopyScheduleDialogProps {
  isOpen: boolean
  onConfirm: (targetDate: string) => void // targetDate 格式: "yyyy/MM/dd"
  onCancel: () => void
  errorMessage?: string
  draftDates: Date[]
  sellingDates: Date[]
}

const CopyScheduleDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  errorMessage,
  draftDates,
  sellingDates,
}: CopyScheduleDialogProps) => {
  const defaultClassNames = getDefaultClassNames()
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  })
  const [showCalendar, setShowCalendar] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false)
      }
    }

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showCalendar])

  if (!isOpen) return null

  const handleConfirm = () => {
    const targetDateStr = format(selectedDate, "yyyy/MM/dd")
    onConfirm(targetDateStr)
  }

  const formattedSelectedDate = format(selectedDate, "yyyy/MM/dd", { locale: zhTW })

  const handleDaySelect = (date?: Date) => {
    if (!date) return
    setSelectedDate(date)
    setShowCalendar(false)
  }

  const dayPickerClassNames = {
    today: `border-amber-500 `,
    selected: `relative before:content-[''] before:w-8 before:h-8 before:bg-[#5365AC] before:rounded-full before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:z-0 [&_button]:relative [&_button]:z-10 [&_button]:text-white`,
    root: `${defaultClassNames.root} w-full`,
    caption_label:
      "flex justify-center items-center ml-3 text-gray-700 font-family-inter font-semibold",
    chevron: "fill-gray-700",
    button_previous: "w-6 h-6 cursor-pointer",
    button_next: "w-6 h-6 cursor-pointer",
    day_button: "w-8 h-8 text-xs font-roboto font-normal cursor-pointer",
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative z-10 flex w-100 flex-col gap-4 rounded-xl bg-white px-6 py-4">
        {/* 標題 */}
        <h2 className="font-roboto m-auto text-lg font-semibold text-[#000000] uppercase">
          複製為草稿
        </h2>

        {/* 日期選擇 */}
        <div className="relative flex items-center justify-between">
          <span className="font-roboto font-normal text-[#000000] uppercase">複製到</span>
          <input
            ref={inputRef}
            type="text"
            readOnly
            value={formattedSelectedDate}
            onClick={() => setShowCalendar(!showCalendar)}
            aria-label="複製到"
            className="font-family-inter h-10 w-67 cursor-pointer rounded-lg border border-gray-50 px-3 text-gray-900 focus:ring-2 focus:ring-[#5365AC] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
            aria-label="開啟日曆"
          >
            <CalendarDays className="h-6 w-6 text-[#777777]" />
          </button>
          {showCalendar && (
            <div
              ref={calendarRef}
              className="absolute top-full z-20 mt-2 rounded-sm border border-gray-200 bg-white shadow-lg"
            >
              <DayPicker
                mode="single"
                locale={zhTW}
                weekStartsOn={0}
                selected={selectedDate}
                onSelect={handleDaySelect}
                showOutsideDays
                modifiers={{
                  draft: draftDates,
                  selling: sellingDates,
                }}
                modifiersClassNames={{
                  draft:
                    "relative after:content-[''] after:w-1.5 after:h-1.5 after:bg-gray-400 after:rounded-full after:absolute after:bottom-2 after:left-1/2 after:-translate-x-1/2 after:z-20",
                  selling:
                    "relative after:content-[''] after:w-1.5 after:h-1.5 after:bg-amber-400 after:rounded-full after:absolute after:bottom-2 after:left-1/2 after:-translate-x-1/2 after:z-20",
                }}
                classNames={dayPickerClassNames}
              />
            </div>
          )}
        </div>

        {/* 警告訊息 */}
        <div className="flex flex-col gap-3 border-l-4 border-[#CBA418] bg-[#F0E3B5] px-3 py-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 text-[#8E661A]" />
            <span className="font-roboto font-semibold text-[#8E661A] uppercase">警告</span>
          </div>
          <p className="font-roboto text-sm font-normal text-[#A98239]">
            複製草稿將會將現有草稿覆蓋掉
          </p>
        </div>

        {/* 錯誤訊息 */}
        {errorMessage && (
          <div className="font-roboto font-normal text-[#E70012] uppercase">{errorMessage}</div>
        )}

        <div className="flex h-10 justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="font-roboto h-full cursor-pointer rounded-sm bg-[#000000] px-3 text-white"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="font-roboto h-full cursor-pointer rounded-sm border border-[#000000] bg-white px-3 text-[#000000]"
          >
            確認
          </button>
        </div>
      </div>
    </div>
  )
}

export default CopyScheduleDialog
