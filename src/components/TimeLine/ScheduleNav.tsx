import { ChevronLeft, ChevronRight } from "lucide-react"

interface ScheduleNavProps {
  formattedDate: string
  onGoToday: () => void
  onPrevDay: () => void
  onNextDay: () => void
  onEdit?: () => void
}

const ScheduleNav = ({
  formattedDate,
  onGoToday,
  onPrevDay,
  onNextDay,
  onEdit,
}: ScheduleNavProps) => {
  return (
    <div className="flex items-center justify-between rounded-sm bg-white p-3">
      <div className="flex items-center gap-6">
        <button
          className="body-medium cursor-pointer rounded-3xl border border-gray-900 px-6.5 py-2.5 text-gray-900"
          onClick={onGoToday}
        >
          今天
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-8 w-8 cursor-pointer items-center justify-center text-gray-900"
            onClick={onPrevDay}
          >
            <ChevronLeft className="h-full w-full" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 cursor-pointer items-center justify-center text-gray-900"
            onClick={onNextDay}
          >
            <ChevronRight className="h-full w-full" />
          </button>
        </div>
        <span className="body-large text-gray-900">{formattedDate}</span>
      </div>
      <button
        type="button"
        className="bg-primary-500 body-medium cursor-pointer rounded-[10px] px-4 py-2.5 text-white"
        onClick={onEdit}
      >
        編輯
      </button>
    </div>
  )
}

export default ScheduleNav
