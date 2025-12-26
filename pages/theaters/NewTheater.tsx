import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, ChevronDown } from "lucide-react"
import AdminContainer from "@/components/layout/AdminContainer"
import SeatingChart, {
  type SeatCell,
  type SeatStats,
  type ToolType,
} from "@/components/theater-builder/SeatingChart"
import SidebarToolbox from "@/components/theater-builder/SidebarToolbox"
import TheatersFooter from "@/components/theater-builder/TheatersFooter"
import sendAPI from "@/utils/sendAPI"

const NewTheater = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"tools" | "seats">("tools")
  const [selectedTool, setSelectedTool] = useState<ToolType>("normal")
  const [rows, setRows] = useState<number>(8)
  const [columns, setColumns] = useState<number>(16)
  const [theaterName, setTheaterName] = useState<string>("")

  const [floor, setFloor] = useState<number>(1)
  const [theaterType, setTheaterType] = useState<string>("一般數位")
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false)

  const [seatMapData, setSeatMapData] = useState<SeatCell[][]>([])
  const [seatStats, setSeatStats] = useState<SeatStats>({
    normalSeats: 0,
    accessibleSeats: 0,
    aisleSeats: 0,
    totalAssigned: 0,
  })

  const handleCreateTheater = async () => {
    const trimmedName = theaterName.trim()
    if (!trimmedName || seatStats.totalAssigned === 0) {
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

  return (
    <AdminContainer>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <header className="flex items-center gap-2 bg-[#E7E8EF] px-6 py-6">
          <button
            type="button"
            className="cursor-pointer transition-transform hover:scale-125 hover:cursor-pointer"
          >
            <ArrowLeft className="h-10 w-10" onClick={() => navigate("/theaters")} />
          </button>
          <h1 className="text-[40px] font-bold">新增影廳</h1>
        </header>
        <section className="px-6">
          <h1 className="text-2xl font-bold">基本資訊</h1>
          <div className="mt-4 flex gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="theaterName" className="flex flex-col text-sm font-normal">
                <span>影廳名稱</span>
                <input
                  id="theaterName"
                  type="text"
                  placeholder="影廳名稱"
                  value={theaterName}
                  onChange={(event) => setTheaterName(event.target.value)}
                  className="mt-2 w-[320px] rounded-md border border-white bg-white px-4 py-3 text-gray-700 placeholder:text-[#999999]"
                />
              </label>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="floorCount" className="flex flex-col text-sm font-normal">
                <span>樓層數</span>
                <input
                  id="floorCount"
                  type="number"
                  min={1}
                  placeholder="樓層數"
                  value={floor}
                  onChange={(e) => setFloor(Number(e.target.value))}
                  className="mt-2 w-[129px] rounded-md border border-white bg-white px-4 py-3 text-gray-700 placeholder:text-[#999999]"
                />
              </label>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="theaterType" className="text-sm font-normal">
                <span className="font-normal">類型</span>
                <div className="relative mt-2">
                  <button
                    type="button"
                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                    className="flex w-[194px] cursor-pointer items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3 text-left"
                  >
                    <span>{theaterType}</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>

                  {isTypeDropdownOpen && (
                    <>
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label="Close dropdown"
                        className="fixed inset-0 z-10"
                        onClick={() => setIsTypeDropdownOpen(false)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") setIsTypeDropdownOpen(false)
                        }}
                      />
                      <ul className="absolute z-20 w-[194px] overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                        {["一般數位", "IMAX", "4DX"].map((type) => (
                          <li
                            key={type}
                            role="option"
                            aria-selected={theaterType === type}
                            tabIndex={0}
                            onClick={() => {
                              setTheaterType(type)
                              setIsTypeDropdownOpen(false)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                setTheaterType(type)
                                setIsTypeDropdownOpen(false)
                              }
                            }}
                            className="cursor-pointer px-4 py-2"
                          >
                            {type}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>
          <div className="mt-6 flex gap-6">
            <SidebarToolbox
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              selectedTool={selectedTool}
              setSelectedTool={setSelectedTool}
              rows={rows}
              setRows={setRows}
              columns={columns}
              setColumns={setColumns}
            />
            <div className="mt-13 max-w-full min-w-0 flex-1 overflow-scroll">
              <SeatingChart
                selectedTool={selectedTool}
                rowsCount={rows}
                columnsCount={columns}
                onSeatStatsChange={setSeatStats}
                onSeatMapChange={setSeatMapData}
              />
            </div>
          </div>
        </section>
      </div>
      <TheatersFooter
        normalSeatCount={seatStats.normalSeats}
        accessibleSeatCount={seatStats.accessibleSeats}
        onCreate={handleCreateTheater}
        isCreateDisabled={!theaterName.trim() || seatStats.totalAssigned === 0}
      />
    </AdminContainer>
  )
}

export default NewTheater
