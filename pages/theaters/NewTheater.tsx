import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import AdminContainer from "@/components/layout/AdminContainer"
import TheaterBasicInfoForm from "@/components/theater/TheaterBasicInfoForm"
import SeatingChart from "@/components/theater-builder/SeatingChart"
import SidebarToolbox from "@/components/theater-builder/SidebarToolbox"
import TheatersFooter from "@/components/theater-builder/TheatersFooter"
import useNewTheaterForm from "./hooks/useNewTheaterForm"

const NewTheater = () => {
  const navigate = useNavigate()
  const {
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
    setSeatMapData,
    seatStats,
    setSeatStats,
    handleCreateTheater,
    isSubmitting,
    isCreateDisabled,
  } = useNewTheaterForm()

  return (
    <AdminContainer>
      <main className="flex min-w-0 flex-1 flex-col gap-3">
        <header className="flex items-center gap-2 bg-[#E7E8EF] px-6 py-6">
          <button
            type="button"
            className="cursor-pointer transition-transform hover:scale-125 hover:cursor-pointer"
            aria-label="返回影廳列表"
          >
            <ArrowLeft className="h-10 w-10" onClick={() => navigate("/theaters")} />
          </button>
          <h1 className="text-[40px] font-bold">新增影廳</h1>
        </header>

        <section className="px-6">
          <TheaterBasicInfoForm
            name={theaterName}
            onNameChange={setTheaterName}
            floor={floor}
            onFloorChange={setFloor}
            type={theaterType}
            onTypeChange={setTheaterType}
          />

          <section aria-label="座位配置" className="mt-[26px] flex gap-6">
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
            <div className="mt-13 max-w-full min-w-0 flex-1 overflow-scroll pb-10">
              <SeatingChart
                selectedTool={selectedTool}
                rowsCount={rows}
                columnsCount={columns}
                onSeatStatsChange={setSeatStats}
                onSeatMapChange={setSeatMapData}
              />
            </div>
          </section>
        </section>
      </main>
      <TheatersFooter
        normalSeatCount={seatStats.normalSeats}
        accessibleSeatCount={seatStats.accessibleSeats}
        onCreate={handleCreateTheater}
        isCreateDisabled={isCreateDisabled}
        isLoading={isSubmitting}
      />
    </AdminContainer>
  )
}

export default NewTheater
