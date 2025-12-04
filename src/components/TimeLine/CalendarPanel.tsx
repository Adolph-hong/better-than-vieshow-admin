import { zhTW } from "date-fns/locale/zh-TW"
import { DayPicker, getDefaultClassNames } from "react-day-picker"

interface CalendarPanelProps {
  selectedDate: Date
  visibleMonth: Date
  draftDates: Date[]
  sellingDates: Date[]
  onSelectDate: (date?: Date) => void
  onMonthChange: (month: Date) => void
}

const CalendarPanel = ({
  selectedDate,
  visibleMonth,
  draftDates,
  sellingDates,
  onSelectDate,
  onMonthChange,
}: CalendarPanelProps) => {
  const defaultClassNames = getDefaultClassNames()

  return (
    <div className="flex rounded-sm bg-white">
      <DayPicker
        mode="single"
        locale={zhTW}
        weekStartsOn={0}
        selected={selectedDate}
        month={visibleMonth}
        onSelect={onSelectDate}
        onMonthChange={onMonthChange}
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
        classNames={{
          today: `border-amber-500 `,
          selected: `relative before:content-[''] before:w-8 before:h-8 before:bg-[#5365AC] before:rounded-full before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:z-0 [&_button]:relative [&_button]:z-10 [&_button]:text-white`,
          root: `${defaultClassNames.root} w-full `,
          caption_label:
            "flex justify-center items-center ml-3 text-gray-700 font-family-inter font-semibold",
          chevron: "fill-gray-700",
          button_next: "w-6 h-6",
          day_button: "w-8 h-8 text-xs font-roboto font-normal",
        }}
      />
    </div>
  )
}

export default CalendarPanel
