import { useMemo } from "react"
import { Armchair, Accessibility, Minus, X } from "lucide-react"
import type { SeatCell } from "@/components/theater-builder/SeatingChart"

type SeatingChartViewProps = {
  seatMap: SeatCell[][]
  title: string
  onClose: () => void
}

const SeatingChartView = ({ seatMap, title, onClose }: SeatingChartViewProps) => {
  // 從 seatMap 中提取所有唯一的行和列
  const { rows, columns } = useMemo(() => {
    const allCells = seatMap.flatMap((row) => row)

    const uniqueRows = [...new Set(allCells.map((cell) => cell.row))].sort()
    const uniqueColumns = [...new Set(allCells.map((cell) => cell.column))].sort((a, b) => a - b)

    return { rows: uniqueRows, columns: uniqueColumns }
  }, [seatMap])

  // 創建一個映射來快速查找座位
  const seatMapLookup = useMemo(() => {
    const allCells = seatMap.flatMap((row) => row)
    return new Map(allCells.map((cell) => [`${cell.row}-${cell.column}`, cell]))
  }, [seatMap])

  const renderSeat = (row: string, col: number) => {
    const key = `${row}-${col}`
    const cell = seatMapLookup.get(key)

    if (!cell) {
      return (
        <div
          key={key}
          className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#C2C2C2]"
          style={{ borderWidth: "1px" }}
        />
      )
    }

    const baseClasses = "flex h-10 w-10 items-center justify-center rounded"

    switch (cell.type) {
      case "aisle":
        return (
          <div
            key={key}
            className={`${baseClasses} border-white bg-[#F2F2F2]`}
            title={`${row}${col} - 走道`}
            aria-label={`${row}${col} - 走道`}
          >
            <Minus className="h-4 w-4 text-gray-300" />
          </div>
        )

      case "empty":
        return (
          <div
            key={key}
            className={`${baseClasses} border border-[#C2C2C2] bg-white`}
            title={`${row}${col} - 空白`}
            aria-label={`${row}${col} - 空白`}
          />
        )

      case "seat": {
        switch (cell.seatKind) {
          case "accessible":
            return (
              <div
                key={key}
                className={`${baseClasses} bg-[#A0CBA3]`}
                title={`${row}${col} - 無障礙座位`}
                aria-label={`${row}${col} - 無障礙座位`}
              >
                <Accessibility className="h-5 w-5 text-white" />
              </div>
            )

          case "normal":
          default:
            return (
              <div
                key={key}
                className={`${baseClasses} bg-[#8EAFCB]`}
                title={`${row}${col} - 一般座位`}
                aria-label={`${row}${col} - 一般座位`}
              >
                <Armchair className="h-5 w-5 text-white" />
              </div>
            )
        }
      }

      default:
        return (
          <div
            key={key}
            className={`${baseClasses} border-[#C2C2C2]`}
            title={`${row}${col} - 空白`}
            aria-label={`${row}${col} - 空白`}
          />
        )
    }
  }

  return (
    <article className="w-full rounded-sm bg-white p-4">
      <header className="mb-[19px] flex items-center justify-between">
        <h2 className="text-2xl font-normal">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer hover:bg-gray-200"
          aria-label="關閉"
        >
          <X className="h-6 w-6" />
        </button>
      </header>

      <div className="mb-5 flex w-full flex-col items-center gap-2">
        <span className="text-sm font-normal">螢幕</span>
        <div className="h-1 w-full bg-[#243B97]" />
      </div>

      <div
        className="flex flex-col items-center gap-2"
        role="grid"
        aria-label={`${title} 座位網格`}
      >
        <div className="flex items-center gap-2" role="row">
          <div className="h-10 w-10 shrink-0" role="presentation" />
          {columns.map((col) => (
            <div
              key={col}
              className="flex h-10 w-10 shrink-0 items-center justify-center text-center text-[18px] font-medium text-gray-300"
              role="columnheader"
            >
              {col}
            </div>
          ))}
        </div>

        {rows.map((row) => (
          <div key={row} className="flex items-center gap-2" role="row">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center text-center text-[18px] font-medium text-gray-300"
              role="rowheader"
            >
              {row}
            </div>
            {columns.map((col) => (
              <div key={`${row}-${col}`} className="shrink-0" role="gridcell">
                {renderSeat(row, col)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </article>
  )
}

export default SeatingChartView
