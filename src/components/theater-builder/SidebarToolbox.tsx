import { Armchair, Accessibility, Minus, Eraser, Plus } from "lucide-react"

type ToolType = "normal" | "accessible" | "aisle" | "eraser" | null

type SidebarToolboxProps = {
  activeTab: "tools" | "seats"
  setActiveTab: (tab: "tools" | "seats") => void
  selectedTool: ToolType
  setSelectedTool: (tool: ToolType) => void
  rows: number
  setRows: (rows: number) => void
  columns: number
  setColumns: (cols: number) => void
}

const SidebarToolbox = ({
  activeTab,
  setActiveTab,
  selectedTool,
  setSelectedTool,
  rows,
  setRows,
  columns,
  setColumns,
}: SidebarToolboxProps) => {
  const tabBase =
    "flex items-center justify-center w-full h-full text-sm rounded-md transition-colors"

  return (
    <div>
      <h1 className="header-3 mb-4">座位表</h1>
      <aside className="relative h-[499px] w-[270px] space-y-4 rounded-sm border border-white bg-white p-3">
        <div className="relative h-10 w-full rounded-sm bg-[#F7F7F7] p-1">
          <div
            className={`absolute inset-y-1 left-1 rounded-sm bg-white shadow transition-all duration-200 ${
              activeTab === "seats" ? "w-[119px] translate-x-[119px]" : "w-[119px] translate-x-0"
            }`}
          />

          <div className="relative z-10 grid h-full grid-cols-2">
            <button onClick={() => setActiveTab("tools")} className={`${tabBase}`}>
              工具箱
            </button>
            <button onClick={() => setActiveTab("seats")} className={`${tabBase}`}>
              座位數量
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          {activeTab === "seats" ? (
            <div className="space-y-[18px]">
              <div className="space-y-4">
                <h3>排數（深度）</h3>
                <div className="flex items-center justify-center gap-9">
                  <button
                    onClick={() => setRows(Math.max(1, rows - 1))}
                    className="bg-primary-500 hover:bg-primary-700 flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors"
                  >
                    <Minus />
                  </button>
                  <span className="min-w-[60px] text-center text-3xl font-bold">{rows}</span>
                  <button
                    onClick={() => setRows(rows + 1)}
                    className="bg-primary-500 hover:bg-primary-700 flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors"
                  >
                    <Plus />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3>列數（寬度）</h3>
                <div className="flex items-center justify-center gap-9">
                  <button
                    onClick={() => setColumns(Math.max(1, columns - 1))}
                    className="bg-primary-500 hover:bg-primary-700 flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors"
                  >
                    <Minus />
                  </button>
                  <span className="min-w-[60px] text-center text-3xl font-bold text-gray-800">
                    {columns}
                  </span>
                  <button
                    onClick={() => setColumns(columns + 1)}
                    className="bg-primary-500 hover:bg-primary-700 flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors"
                  >
                    <Plus />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <section className="mt-3 flex flex-col gap-3">
                <h3 className="font-medium">座位</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedTool(selectedTool === "normal" ? null : "normal")}
                    className={`flex h-[77px] w-[117px] flex-col items-center justify-center gap-2 rounded-[10px] border px-4 text-sm transition-colors ${
                      selectedTool === "normal"
                        ? "bg-primary-500 text-white"
                        : "border-[#F7F7F7] bg-[#F7F7F7]"
                    }`}
                  >
                    <Armchair size={28} className="flex-shrink-0" />
                    <span>一般座位</span>
                  </button>

                  <button
                    onClick={() =>
                      setSelectedTool(selectedTool === "accessible" ? null : "accessible")
                    }
                    className={`flex h-[77px] w-[117px] flex-col items-center justify-center gap-2 rounded-lg border px-4 text-sm transition-colors ${
                      selectedTool === "accessible"
                        ? "bg-primary-500 text-white"
                        : "border-[#F7F7F7] bg-[#F7F7F7]"
                    }`}
                  >
                    <Accessibility size={28} className="flex-shrink-0" />
                    <span>殘障座位</span>
                  </button>
                </div>
              </section>

              <hr className="w-full border-[#E5E5E5]" />

              <section className="space-y-3">
                <h3 className="font-medium">場景</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedTool(selectedTool === "aisle" ? null : "aisle")}
                    className={`flex h-[77px] w-[117px] flex-col items-center justify-center gap-2 rounded-lg border px-4 text-sm transition-colors ${
                      selectedTool === "aisle"
                        ? "bg-primary-500 text-white"
                        : "border-[#F7F7F7] bg-[#F7F7F7]"
                    }`}
                  >
                    <Minus size={28} className="flex-shrink-0" />
                    <span>走道</span>
                  </button>
                </div>
              </section>

              <hr className="w-full border-[#E5E5E5]" />

              <section className="space-y-3">
                <h3 className="font-medium">工具</h3>
                <div className="grid grid-cols-2">
                  <button
                    onClick={() => setSelectedTool(selectedTool === "eraser" ? null : "eraser")}
                    className={`flex h-[77px] w-[117px] flex-col items-center justify-center gap-2 rounded-lg border px-4 text-sm transition-colors ${
                      selectedTool === "eraser"
                        ? "bg-primary-500 text-white"
                        : "border-[#F7F7F7] bg-[#F7F7F7]"
                    }`}
                  >
                    <Eraser size={28} className="flex-shrink-0" />
                    <span>橡皮擦</span>
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}

export default SidebarToolbox
