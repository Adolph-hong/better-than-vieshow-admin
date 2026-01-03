import { useState, useRef, useEffect } from "react"
import { Fullscreen, EllipsisVertical, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import { ClipLoader } from "react-spinners"
import Modal from "@/components/theater/Modal"
import SeatingChartView from "@/components/theater/SeatingChartView"
import type { SeatCell } from "@/components/theater-builder/SeatingChart"
import type { TheaterData } from "@/contexts/TheaterContext"
import sendAPI from "@/utils/sendAPI"

type TheaterCardProps = {
  theater: TheaterData
  onDelete: (id: string) => Promise<boolean>
}

const TheaterCard = ({ theater, onDelete }: TheaterCardProps) => {
  const [showMenu, setShowMenu] = useState(false)
  const [showSeatingChart, setShowSeatingChart] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [previewSeatMap, setPreviewSeatMap] = useState<SeatCell[][]>([])
  const [isLoading, setIsLoading] = useState(false)

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

  const handleDeleteClick = () => {
    setShowMenu(false)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    const success = await onDelete(theater.id)
    setIsDeleting(false)

    if (success) {
      toast.success("刪除成功")
      setShowDeleteConfirm(false)
    } else {
      toast.error("刪除失敗，請稍後再試")
    }
  }

  const transformSeatMap = (rawSeats: string[][]): SeatCell[][] => {
    return rawSeats.map((row, rowIndex) => {
      const rowLabel = String.fromCharCode(65 + rowIndex) // A, B, C...
      return row.map((seatType, colIndex) => {
        const colNumber = colIndex + 1
        const baseCell = {
          row: rowLabel,
          column: colNumber,
        }

        switch (seatType) {
          case "Standard":
            return {
              ...baseCell,
              type: "seat",
              seatKind: "normal",
            } as SeatCell
          case "Wheelchair":
            return {
              ...baseCell,
              type: "seat",
              seatKind: "accessible",
            } as SeatCell
          case "Aisle":
            return {
              ...baseCell,
              type: "aisle",
            } as SeatCell
          default:
            return {
              ...baseCell,
              type: "empty",
            } as SeatCell
        }
      })
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformObjectSeatMap = (rawSeats: any[][]): SeatCell[][] => {
    return rawSeats.map((row) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return row.map((cell: any) => {
        const baseCell = {
          row: cell.rowName,
          column: cell.columnNumber,
        }

        switch (cell.seatType) {
          case "Standard":
            return {
              ...baseCell,
              type: "seat",
              seatKind: "normal",
            } as SeatCell
          case "Wheelchair":
            return {
              ...baseCell,
              type: "seat",
              seatKind: "accessible",
            } as SeatCell
          case "Aisle":
            return {
              ...baseCell,
              type: "aisle",
            } as SeatCell
          default:
            return {
              ...baseCell,
              type: "empty",
            } as SeatCell
        }
      })
    })
  }

  const handleShowSeatingChart = async () => {
    setShowSeatingChart(true)
    setIsLoading(true)
    try {
      const response = await sendAPI(`/api/admin/theaters/${theater.id}`, "GET")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()

      // 這裡假設後端回傳的 data 結構中包含 seatMap 陣列
      // API 回傳結構: { data: { seatMap: [...] } }
      const seatsData = data.data?.seatMap || data.seatMap || []

      if (Array.isArray(seatsData)) {
        // 檢查第一列第一個元素是否為字串，來決定是否需要轉換
        const isStringData =
          seatsData.length > 0 && seatsData[0].length > 0 && typeof seatsData[0][0] === "string"

        if (isStringData) {
          const transformedMap = transformSeatMap(seatsData as string[][])
          setPreviewSeatMap(transformedMap)
        } else {
          // 如果是物件格式 (例如 { rowName: 'A', ... })，使用新的轉換函式
          const transformedMap = transformObjectSeatMap(seatsData)
          setPreviewSeatMap(transformedMap)
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("獲取影廳詳情失敗:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <article
      className="relative rounded-xl bg-white p-6"
      aria-labelledby={`theater-title-${theater.id}`}
    >
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <h3 id={`theater-title-${theater.id}`} className="truncate text-2xl" title={theater.name}>
            {theater.name}
          </h3>
          <span className="shrink-0 rounded-full bg-[#69BDCE] px-4 py-2 text-sm leading-none font-normal text-white">
            {theater.type}
          </span>
        </div>
        <div className="flex gap-5">
          <button
            type="button"
            className="hover:cursor-pointer"
            aria-label="全屏"
            onClick={handleShowSeatingChart}
          >
            <Fullscreen />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="flex items-center hover:cursor-pointer"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="更多選項"
              aria-haspopup="true"
              aria-expanded={showMenu}
            >
              <EllipsisVertical />
            </button>
            {showMenu && (
              <div
                className="absolute top-8 right-0 min-w-[143px] rounded-sm border border-gray-200 bg-white shadow-sm"
                role="menu"
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-2 text-left hover:cursor-pointer"
                  onClick={handleDeleteClick}
                  role="menuitem"
                >
                  <Trash2 className="h-[18px] w-[18px] text-gray-500" />
                  刪除
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <dl className="flex gap-8">
        <div className="flex flex-col-reverse">
          <dt className="text-xl font-medium text-[#646464]">一般座位</dt>
          <dd className="text-[32px] font-semibold">{theater.normalSeats}</dd>
        </div>
        <div className="flex flex-col-reverse">
          <dt className="text-xl font-medium text-[#646464]">友善座位</dt>
          <dd className="text-[32px] font-semibold">{theater.accessibleSeats}</dd>
        </div>
      </dl>
      <Modal isOpen={showSeatingChart} onClose={() => setShowSeatingChart(false)}>
        {isLoading ? (
          <div className="flex h-64 min-w-[500px] flex-col items-center justify-center gap-4">
            <ClipLoader color="#5365AC" size={32} />
            <p className="text-gray-500">正在載入座位圖...</p>
          </div>
        ) : (
          <SeatingChartView
            seatMap={previewSeatMap.length > 0 ? previewSeatMap : theater.seatMap || []}
            title={`${theater.name} 座位表`}
            onClose={() => setShowSeatingChart(false)}
          />
        )}
      </Modal>

      <Modal isOpen={showDeleteConfirm} onClose={() => !isDeleting && setShowDeleteConfirm(false)}>
        <div className="w-[400px] p-6">
          <h2 className="mb-4 text-xl font-bold">確定要刪除嗎？</h2>
          <p className="mb-6 text-gray-600">即將刪除「{theater.name}」，此操作無法復原。</p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="flex cursor-pointer items-center rounded-lg bg-[#5365AC] px-4 py-2 text-white"
            >
              {isDeleting ? <ClipLoader color="#ffffff" size={20} /> : "刪除"}
            </button>
          </div>
        </div>
      </Modal>
    </article>
  )
}

export default TheaterCard
