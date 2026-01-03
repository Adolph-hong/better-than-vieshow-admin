import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
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
  const [isSubmitting, setIsSubmitting] = useState(false)
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
          return cell.seatKind === "accessible" ? "Wheelchair" : "Standard"
        }
        if (cell.type === "aisle") {
          return "Aisle"
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
      standard: seatStats.normalSeats,
      wheelchair: seatStats.accessibleSeats,
    }

    setIsSubmitting(true)
    try {
      const response = await sendAPI("/api/admin/theaters", "POST", payload)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      toast.success("建立成功")
      navigate("/theaters")
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("新增影廳失敗:", error)
      toast.error("新增影廳失敗，請稍後再試")
    } finally {
      setIsSubmitting(false)
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
    isSubmitting,
    isCreateDisabled: !theaterName.trim() || seatStats.totalAssigned === 0 || floor === "",
  }
}

export default useNewTheaterForm
