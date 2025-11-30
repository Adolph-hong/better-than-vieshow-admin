import { zhTW } from "date-fns/locale/zh-TW"
import { DayPicker, getDefaultClassNames } from "react-day-picker"

interface CalendarPanelProps {
  selectedDate: Date
  visibleMonth: Date
  onSelectDate: (date?: Date) => void
  onMonthChange: (month: Date) => void
}

const CalendarPanel = ({
  selectedDate,
  visibleMonth,
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
        classNames={{
          today: `border-amber-500 `,
          selected: `bg-amber-500 border-amber-500 text-white`,
          root: `${defaultClassNames.root} w-full rounded-sm`,
          caption_label:
            "flex justify-center items-center ml-3 text-gray-700 font-family-inter font-semibold",
          chevron: "fill-gray-700",
          button_next: "w-6 h-6",
          day_button: "w-8 h-8 text-xs",
        }}
      />
    </div>
  )
}

export default CalendarPanel
