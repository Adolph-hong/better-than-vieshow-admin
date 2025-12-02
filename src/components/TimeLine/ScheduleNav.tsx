import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, MoreVertical } from "lucide-react"

interface ScheduleNavProps {
  formattedDate: string
  hasDraft?: boolean
  onGoToday: () => void
  onPrevDay: () => void
  onNextDay: () => void
  onEdit?: () => void
  onPreview?: () => void
  onStartSelling?: () => void
}

const ScheduleNav = ({
  formattedDate,
  hasDraft = false,
  onGoToday,
  onPrevDay,
  onNextDay,
  onEdit,
  onPreview,
  onStartSelling,
}: ScheduleNavProps) => {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 點擊外部關閉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showMenu])

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
      {hasDraft && (
        <div className="flex items-center gap-4 px-6">
          <span className="font-family-inter rounded-[48px] bg-gray-300 px-4 py-2 font-normal text-white">
            草稿
          </span>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="flex h-8 w-8 cursor-pointer items-center justify-center text-gray-900"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical className="h-8 w-8 text-gray-900" />
            </button>
            {showMenu && (
              <div className="absolute top-12 right-0 z-10 min-w-32 rounded-sm bg-white py-1 shadow-lg">
                <button
                  type="button"
                  className="font-family-inter w-full rounded-lg px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-100"
                  onClick={() => {
                    onPreview?.()
                    setShowMenu(false)
                  }}
                >
                  預覽
                </button>
                <button
                  type="button"
                  className="font-family-inter w-full rounded-lg px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-100"
                  onClick={() => {
                    onEdit?.()
                    setShowMenu(false)
                  }}
                >
                  編輯
                </button>
                <button
                  type="button"
                  className="font-family-inter w-full rounded-lg px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-100"
                  onClick={() => {
                    onStartSelling?.()
                    setShowMenu(false)
                  }}
                >
                  開始販售
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {!hasDraft && (
        <button
          type="button"
          className="bg-primary-500 body-medium cursor-pointer rounded-[10px] px-4 py-2.5 text-white"
          onClick={onEdit}
        >
          編輯
        </button>
      )}
    </div>
  )
}

export default ScheduleNav
