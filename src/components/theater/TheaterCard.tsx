import { useState, useRef, useEffect } from "react"
import { Maximize2, MoreVertical, Trash2 } from "lucide-react"
import type { TheaterData } from "@/contexts/TheaterContext"

interface TheaterCardProps {
  theater: TheaterData
  onDelete: (id: string) => void
}

const TheaterCard = ({ theater, onDelete }: TheaterCardProps) => {
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

  const handleDelete = () => {
    onDelete(theater.id)
    setShowMenu(false)
  }

  return (
    <div className="relative rounded-lg bg-white p-6 shadow-sm">
      {/* 標題和狀態區域 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-gray-700">{theater.name}</h3>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              theater.isActive ? "bg-[#5B9BD5] text-white" : "bg-gray-200 text-gray-600"
            }`}
          >
            {theater.isActive ? "使用中" : "未使用"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100"
            aria-label="全屏"
          >
            <Maximize2 className="h-5 w-5 text-gray-600" />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="更多選項"
            >
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </button>
            {showMenu && (
              <div className="absolute top-10 right-0 z-10 min-w-[120px] rounded-lg border border-gray-200 bg-white shadow-lg">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  刪除
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 座位統計區域 */}
      <div className="flex gap-8">
        <div className="flex flex-col">
          <span className="text-3xl font-bold text-gray-700">{theater.normalSeats}</span>
          <span className="text-sm text-gray-500">一般座位</span>
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-bold text-gray-700">{theater.accessibleSeats}</span>
          <span className="text-sm text-gray-500">殘障座位</span>
        </div>
      </div>
    </div>
  )
}

export default TheaterCard
