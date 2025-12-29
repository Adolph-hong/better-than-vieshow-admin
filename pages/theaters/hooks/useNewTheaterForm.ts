import { useState } from "react"
import { useNavigate } from "react-router-dom"
import type { SeatCell, SeatStats, ToolType } from "@/components/theater-builder/SeatingChart"
import sendAPI from "@/utils/sendAPI"

const useNewTheaterForm = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"tools" | "seats">("tools")
  const [selectedTool, setSelectedTool] = useState<ToolType>("normal")
  const [rows, setRows] = useState<number>(8)
  const [columns, setColumns] = useState<number>(16)
  const [theaterName, setTheaterName] = useState<string>("")
  const [floor, setFloor] = useState<number | "">("")
  const [theaterType, setTheaterType] = useState<string>("一般數位")
  const [seatMapData, setSeatMapData] = useState<SeatCell[][]>([])
  const [seatStats, setSeatStats] = useState<SeatStats>({
    normalSeats: 0,
    accessibleSeats: 0,
    aisleSeats: 0,
    totalAssigned: 0,
  })

  const handleCreateTheater = async () => {
    const trimmedName = theaterName.trim()
    if (!trimmedName || seatStats.totalAssigned === 0 || floor === "") {
      return
    }

    const formattedSeats = seatMapData.map((row) =>
      row.map((cell) => {
        if (cell.type === "seat") {
          return cell.seatKind === "accessible" ? "殘障座位" : "一般座位"
        }
        if (cell.type === "aisle") {
          return "走道"
        }
        return "Empty"
      })
    )

    const payload = {
      name: trimmedName,
      type: theaterType,
      floor,
      rowCount: rows,
      columnCount: columns,
      seats: formattedSeats,
    }

    try {
      const response = await sendAPI("/api/admin/theaters", "POST", payload)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      navigate("/theaters")
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("新增影廳失敗:", error)
      alert("新增影廳失敗，請稍後再試")
    }
  }

  return {
    activeTab,
    setActiveTab,
    selectedTool,
    setSelectedTool,
    rows,
    setRows,
    columns,
    setColumns,
    theaterName,
    setTheaterName,
    floor,
    setFloor,
    theaterType,
    setTheaterType,
    seatMapData,
    setSeatMapData,
    seatStats,
    setSeatStats,
    handleCreateTheater,
    isCreateDisabled: !theaterName.trim() || seatStats.totalAssigned === 0 || floor === "",
  }
}

export default useNewTheaterForm
