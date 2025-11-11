import { useMemo, useState } from 'react'
import { Armchair, Accessibility, Minus } from 'lucide-react'
import maskGroup from '../assets/maskgroup.svg'

type SeatType = 'normal' | 'accessible' | 'aisle' | 'empty'
export type ToolType = 'normal' | 'accessible' | 'aisle' | 'eraser' | null

type SeatingChartProps = {
  selectedTool: ToolType
  rowsCount: number
  columnsCount: number
}

type RowLabel = string

const SeatingChart = ({ selectedTool, rowsCount, columnsCount }: SeatingChartProps) => {
  // 以 "A-1" 作為 key 的座位圖狀態
  const [seatMap, setSeatMap] = useState<Record<string, SeatType>>({})

  // 產生行標籤 A, B, C...
  const rows: RowLabel[] = useMemo(() => {
    return Array.from({ length: rowsCount }, (_, i) => String.fromCharCode(65 + i))
  }, [rowsCount])

  // 產生列 [1..N]
  const allColumns: number[] = useMemo(() => {
    return Array.from({ length: columnsCount }, (_, i) => i + 1)
  }, [columnsCount])

  // 根據圖片描述定義座位類型
  const getSeatType = (row: RowLabel, col: number): SeatType => {
    const key = `${row}-${col}`
    return seatMap[key] ?? 'empty'
  }

  const handleSeatClick = (row: RowLabel, col: number) => {
    if (!selectedTool) return
    const key = `${row}-${col}`
    setSeatMap((prev) => {
      const next = { ...prev }
      if (selectedTool === 'eraser') {
        next[key] = 'empty'
      } else if (selectedTool === 'normal') {
        next[key] = 'normal'
      } else if (selectedTool === 'accessible') {
        next[key] = 'accessible'
      } else if (selectedTool === 'aisle') {
        next[key] = 'aisle'
      }
      return next
    })
  }

  const renderSeat = (row: RowLabel, col: number) => {
    const type = getSeatType(row, col)

    const baseClasses =
      'flex h-10 w-10 items-center justify-center rounded border border-white transition-colors'

    switch (type) {
      case 'accessible':
        return (
          <button
            key={`${row}-${col}`}
            className={`${baseClasses} bg-[#90EE90]`}
            title={`${row}${col} - 無障礙座位`}
            aria-label={`${row}${col} - 無障礙座位`}
            onClick={() => handleSeatClick(row, col)}
          >
            <Accessibility className="h-5 w-5 text-white" />
          </button>
        )
      case 'aisle':
        return (
          <button
            key={`${row}-${col}`}
            className={`${baseClasses} bg-gray-200`}
            title={`${row}${col} - 走道`}
            aria-label={`${row}${col} - 走道`}
            onClick={() => handleSeatClick(row, col)}
          >
            <Minus className="h-4 w-4 text-gray-500" />
          </button>
        )
      case 'empty':
        return (
          <button
            key={`${row}-${col}`}
            className={`${baseClasses} bg-white`}
            title={`${row}${col} - 空白`}
            aria-label={`${row}${col} - 空白`}
            onClick={() => handleSeatClick(row, col)}
          />
        )
      case 'normal':
      default:
        return (
          <button
            key={`${row}-${col}`}
            className={`${baseClasses} bg-[#87CEEB]`}
            title={`${row}${col} - 一般座位`}
            aria-label={`${row}${col} - 一般座位`}
            onClick={() => handleSeatClick(row, col)}
          >
            <Armchair className="h-5 w-5 text-white" />
          </button>
        )
    }
  }

  return (
    <div className="flex justify-center bg-[#E7E8EF] p-6">
      <div className="flex w-full max-w-6xl justify-center">
        <div className="flex flex-1 flex-col items-center">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex justify-center">
              <img src={maskGroup} alt="影廳螢幕裝飾" className="w-full max-w-5xl object-contain" />
            </div>
            <div className="mb-2 ml-8 flex gap-1">
              {allColumns.map((col) => (
                <div key={col} className="w-10 text-center text-sm font-medium text-gray-700">
                  {col}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1">
              {rows.map((row) => {
                return (
                  <div key={row}>
                    <div className="flex items-center gap-1">
                      <div className="w-8 text-center text-sm font-medium text-gray-700">{row}</div>

                      <div className="flex gap-1">
                        {allColumns.map((col) => (
                          <div key={`${row}-${col}`}>{renderSeat(row, col)}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SeatingChart
