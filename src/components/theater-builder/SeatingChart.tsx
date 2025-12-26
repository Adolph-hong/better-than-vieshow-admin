import { useCallback, useEffect, useMemo, useState, useRef } from "react"
import { Armchair, Accessibility, Minus } from "lucide-react"

type SeatType = "normal" | "accessible" | "aisle" | "empty"
export type ToolType = "normal" | "accessible" | "aisle" | "eraser" | null

export type SeatStats = {
  normalSeats: number
  accessibleSeats: number
  aisleSeats: number
  totalAssigned: number
}

type RowLabel = string

export type SeatCell = {
  type: "seat" | "aisle" | "empty"
  seatKind?: Extract<SeatType, "normal" | "accessible">
  row: RowLabel
  column: number
}

type SeatingChartProps = {
  selectedTool: ToolType
  rowsCount: number
  columnsCount: number
  onSeatStatsChange: (stats: SeatStats) => void
  onSeatMapChange?: (seatMap: SeatCell[][]) => void
}

const SeatingChart = ({
  selectedTool,
  rowsCount,
  columnsCount,
  onSeatStatsChange,
  onSeatMapChange,
}: SeatingChartProps) => {
  const [seatMap, setSeatMap] = useState<Record<string, SeatType>>({})
  const [isDragging, setIsDragging] = useState(false)
  const processedSeatsRef = useRef<Set<string>>(new Set())

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

  const getSeatType = useCallback(
    (row: RowLabel, col: number): SeatType => {
      const key = `${row}-${col}`
      return seatMap[key] ?? "empty"
    },
    [seatMap]
  )

  const isRowAllAisle = (row: RowLabel): boolean => {
    return columnsCount > 0 && allColumns.every((col) => getSeatType(row, col) === "aisle")
  }

  const isColumnAllAisle = (col: number): boolean => {
    return rows.length > 0 && rows.every((row) => getSeatType(row, col) === "aisle")
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

  const updateSeat = (row: RowLabel, col: number, skipCheck = false) => {
    if (!selectedTool) return
    const key = `${row}-${col}`

    if (isDragging && !skipCheck && processedSeatsRef.current.has(key)) {
      return
    }

    if (isDragging) {
      processedSeatsRef.current.add(key)
    }

    setSeatMap((prev) => {
      const next = { ...prev }
      if (selectedTool === "eraser") {
        delete next[key]
      } else if (selectedTool === "normal") {
        next[key] = "normal"
      } else if (selectedTool === "accessible") {
        next[key] = "accessible"
      } else if (selectedTool === "aisle") {
        next[key] = "aisle"
      }
      return next
    })
  }

  const handleSeatMouseDown = (row: RowLabel, col: number) => {
    if (!selectedTool) return
    setIsDragging(true)
    processedSeatsRef.current.clear()
    updateSeat(row, col, true)
  }

  const handleSeatMouseEnter = (row: RowLabel, col: number) => {
    if (isDragging && selectedTool) {
      updateSeat(row, col)
    }
  }

  const handleSeatClick = (row: RowLabel, col: number) => {
    if (!selectedTool || isDragging) return
    updateSeat(row, col, true)
  }

  const renderSeat = (row: RowLabel, col: number) => {
    const type = getSeatType(row, col)

    const baseClasses =
      "flex h-10 w-10 items-center justify-center rounded border transition-colors hover:cursor-pointer"

    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault()
      handleSeatMouseDown(row, col)
    }

    const handleMouseEnter = () => handleSeatMouseEnter(row, col)
    const handleClick = () => handleSeatClick(row, col)

    switch (type) {
      case "accessible":
        return (
          <button
            key={`${row}-${col}`}
            className={`${baseClasses} border-white bg-[#A0CBA3]`}
            title={`${row}${col} - 無障礙座位`}
            aria-label={`${row}${col} - 無障礙座位`}
            onMouseDown={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onClick={handleClick}
          >
            <Accessibility className="h-5 w-5 text-white" />
          </button>
        )
      case "aisle":
        return (
          <button
            key={`${row}-${col}`}
            className={`${baseClasses} border-white bg-gray-200`}
            title={`${row}${col} - 走道`}
            aria-label={`${row}${col} - 走道`}
            onMouseDown={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onClick={handleClick}
          >
            <Minus className="h-4 w-4 text-gray-300" />
          </button>
        )
      case "empty":
        return (
          <button
            key={`${row}-${col}`}
            className={`${baseClasses} border-[#C2C2C2] bg-white`}
            title={`${row}${col} - 空白`}
            aria-label={`${row}${col} - 空白`}
            onMouseDown={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onClick={handleClick}
          />
        )
      case "normal":
      default:
        return (
          <button
            key={`${row}-${col}`}
            className={`${baseClasses} border-white bg-[#8EAFCB]`}
            title={`${row}${col} - 一般座位`}
            aria-label={`${row}${col} - 一般座位`}
            onMouseDown={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onClick={handleClick}
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
      if (type === "normal") {
        normalSeats += 1
      } else if (type === "accessible") {
        accessibleSeats += 1
      } else if (type === "aisle") {
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

  const structuredSeatMap = useMemo<SeatCell[][]>(() => {
    return rows.map((row) =>
      allColumns.map((col) => {
        const seatType = getSeatType(row, col)
        if (seatType === "aisle") {
          return {
            type: "aisle" as const,
            row,
            column: col,
          }
        }
        if (seatType === "empty") {
          return {
            type: "empty" as const,
            row,
            column: col,
          }
        }
        return {
          type: "seat" as const,
          seatKind: seatType === "accessible" ? "accessible" : "normal",
          row,
          column: col,
        }
      })
    )
  }, [rows, allColumns, getSeatType])

  useEffect(() => {
    if (onSeatStatsChange) {
      onSeatStatsChange(seatStats)
    }
  }, [seatStats, onSeatStatsChange])

  useEffect(() => {
    if (onSeatMapChange) {
      onSeatMapChange(structuredSeatMap)
    }
  }, [structuredSeatMap, onSeatMapChange])

  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
        processedSeatsRef.current.clear()
      }
    }

    const handleMouseLeave = () => {
      if (isDragging) {
        setIsDragging(false)
        processedSeatsRef.current.clear()
      }
    }

    if (isDragging) {
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [isDragging])

  return (
    <div className="flex justify-start bg-[#E7E8EF]">
      <div className="flex w-full max-w-6xl justify-start">
        <div className="flex flex-1 flex-col items-start">
          <div className="rounded-sm bg-white p-4">
            <div className="flex w-full justify-center px-4" style={{ marginBottom: "19px" }}>
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
                const actualLabel = shouldShowRowLabel ? getRowLabel(rowIndex) : ""
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

SeatingChart.defaultProps = {
  onSeatMapChange: undefined,
}
