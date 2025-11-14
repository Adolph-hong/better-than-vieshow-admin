import { useEffect, useMemo, useState } from 'react'
import { Armchair, Accessibility, Minus } from 'lucide-react'

type SeatType = 'normal' | 'accessible' | 'aisle' | 'empty'
export type ToolType = 'normal' | 'accessible' | 'aisle' | 'eraser' | null

export type SeatStats = {
  normalSeats: number
  accessibleSeats: number
  aisleSeats: number
  totalAssigned: number
}

type SeatingChartProps = {
  selectedTool: ToolType
  rowsCount: number
  columnsCount: number
  onSeatStatsChange: (stats: SeatStats) => void
}

type RowLabel = string

const SeatingChart = ({
  selectedTool,
  rowsCount,
  columnsCount,
  onSeatStatsChange,
}: SeatingChartProps) => {
  const [seatMap, setSeatMap] = useState<Record<string, SeatType>>({})

  const screenWidth = useMemo(() => {
    const seatWidth = 40
    const seatGap = 8
    const cols = Math.max(columnsCount, 1)
    const totalSeatWidth = cols * seatWidth
    const totalGapWidth = Math.max(cols - 1, 0) * seatGap
    return totalSeatWidth + totalGapWidth
  }, [columnsCount])

  const rows: RowLabel[] = useMemo(() => {
    return Array.from({ length: rowsCount }, (_, i) => String.fromCharCode(65 + i))
  }, [rowsCount])

  const allColumns: number[] = useMemo(() => {
    return Array.from({ length: columnsCount }, (_, i) => i + 1)
  }, [columnsCount])

  const getSeatType = (row: RowLabel, col: number): SeatType => {
    const key = `${row}-${col}`
    return seatMap[key] ?? 'empty'
  }

  const isRowAllAisle = (row: RowLabel): boolean => {
    return columnsCount > 0 && allColumns.every((col) => getSeatType(row, col) === 'aisle')
  }

  const isColumnAllAisle = (col: number): boolean => {
    return rows.length > 0 && rows.every((row) => getSeatType(row, col) === 'aisle')
  }

  const getRowLabel = (rowIndex: number): string => {
    const nonAisleRows = rows.slice(0, rowIndex + 1).filter((row) => !isRowAllAisle(row))
    const labelIndex = nonAisleRows.length
    return String.fromCharCode(65 + labelIndex - 1)
  }

  const getColumnLabel = (col: number): number => {
    const nonAisleColumns = allColumns.filter((c) => c < col && !isColumnAllAisle(c))
    return nonAisleColumns.length + 1
  }

  const handleSeatClick = (row: RowLabel, col: number) => {
    if (!selectedTool) return
    const key = `${row}-${col}`
    setSeatMap((prev) => {
      const next = { ...prev }
      if (selectedTool === 'eraser') {
        delete next[key]
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
      'flex h-10 w-10 items-center justify-center rounded border transition-colors'

    switch (type) {
      case 'accessible':
        return (
          <button
            key={`${row}-${col}`}
            className={`${baseClasses} border-white bg-[#A0CBA3]`}
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
            className={`${baseClasses} border-white bg-gray-200`}
            title={`${row}${col} - 走道`}
            aria-label={`${row}${col} - 走道`}
            onClick={() => handleSeatClick(row, col)}
          >
            <Minus className="h-4 w-4 text-gray-300" />
          </button>
        )
      case 'empty':
        return (
          <button
            key={`${row}-${col}`}
            className={`${baseClasses} border-[#C2C2C2] bg-white`}
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
            className={`${baseClasses} border-white bg-[#8EAFCB]`}
            title={`${row}${col} - 一般座位`}
            aria-label={`${row}${col} - 一般座位`}
            onClick={() => handleSeatClick(row, col)}
          >
            <Armchair className="h-5 w-5 text-white" />
          </button>
        )
    }
  }

  const seatStats = useMemo<SeatStats>(() => {
    let normalSeats = 0
    let accessibleSeats = 0
    let aisleSeats = 0

    Object.values(seatMap).forEach((type) => {
      if (type === 'normal') {
        normalSeats += 1
      } else if (type === 'accessible') {
        accessibleSeats += 1
      } else if (type === 'aisle') {
        aisleSeats += 1
      }
    })

    return {
      normalSeats,
      accessibleSeats,
      aisleSeats,
      totalAssigned: normalSeats + accessibleSeats + aisleSeats,
    }
  }, [seatMap])

  useEffect(() => {
    if (onSeatStatsChange) {
      onSeatStatsChange(seatStats)
    }
  }, [seatStats, onSeatStatsChange])

  return (
    <div className="flex justify-start bg-[#E7E8EF] p-6">
      <div className="flex w-full max-w-6xl justify-start">
        <div className="flex flex-1 flex-col items-start">
          <div className="rounded-sm bg-white px-6 pt-4 pb-6">
            <div className="flex w-full justify-center px-4" style={{ marginBottom: '19px' }}>
              <div
                className="flex flex-col items-center gap-2"
                style={{
                  width: `${screenWidth}px`,
                }}
              >
                <span className="text-sm font-normal">螢幕</span>
                <div className="h-1 w-full bg-[#243B97]" />
              </div>
            </div>
            <div className="mb-2 flex items-center gap-1">
              <div className="h-10 w-10" />
              <div className="flex gap-2">
                {allColumns.map((col) => {
                  if (isColumnAllAisle(col)) {
                    return <div key={col} className="h-10 w-10" />
                  }
                  const actualLabel = getColumnLabel(col)
                  return (
                    <div
                      key={col}
                      className="flex h-10 w-10 items-center justify-center text-center text-[18px] font-medium text-gray-300"
                    >
                      {actualLabel}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {rows.map((row, rowIndex) => {
                const shouldShowRowLabel = !isRowAllAisle(row)
                const actualLabel = shouldShowRowLabel ? getRowLabel(rowIndex) : ''
                return (
                  <div key={row}>
                    <div className="flex items-center gap-1">
                      <div className="flex h-10 w-10 items-center justify-center text-center text-[18px] font-medium text-gray-300">
                        {actualLabel}
                      </div>

                      <div className="flex gap-2">
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
