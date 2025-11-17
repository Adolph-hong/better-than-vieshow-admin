import { useState, useRef, useEffect } from "react"
import { Fullscreen, EllipsisVertical, Trash2 } from "lucide-react"
import type { TheaterData } from "@/contexts/TheaterContext"

type TheaterCardProps = {
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
    <div className="relative rounded-xl bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-normal text-gray-700">{theater.name}</h1>
          <span
            className={`rounded-full px-3 py-1 text-sm font-normal ${
              theater.isActive ? "bg-[#69BDCE] text-white" : "bg-gray-200 text-gray-600"
            }`}
          >
            {theater.isActive ? "使用中" : "未使用"}
          </span>
        </div>
        <div className="flex gap-5">
          <button type="button" className="hover:cursor-pointer" aria-label="全屏">
            <Fullscreen />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="flex items-center hover:cursor-pointer"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="更多選項"
            >
              <EllipsisVertical />
            </button>
            {showMenu && (
              <div className="absolute top-8 right-0 min-w-[143px] rounded-sm border border-gray-200 bg-white shadow-sm">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-2 text-left hover:cursor-pointer"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-[18px] w-[18px] text-[#575867]" />
                  刪除
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="flex flex-col">
          <span className="text-[32px] font-semibold">{theater.normalSeats}</span>
          <span className="text-xl font-medium text-[#646464]">一般座位</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[32px] font-semibold">{theater.accessibleSeats}</span>
          <span className="text-xl font-medium text-[#646464]">殘障座位</span>
        </div>
      </div>
    </div>
  )
}

export default TheaterCard
