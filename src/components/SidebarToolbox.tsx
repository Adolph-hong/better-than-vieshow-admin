import { useState } from "react";
import { Armchair , Accessibility , Minus , Eraser, Plus} from 'lucide-react';


const SidebarToolbox = () => {
  const [activeTab, setActiveTab] = useState<"tools" | "seats">("tools");
  const [selectedTool, setSelectedTool] = useState<"normal" | "accessible" | "aisle" | "eraser" | null>(null);
  const [rows, setRows] = useState<number>(8);
  const [columns, setColumns] = useState<number>(15);

  const tabBase = "flex items-center justify-center w-full h-full text-sm rounded-md transition-colors";

  return (
    <div className="relative w-fit">
      <div className="pointer-events-none absolute -inset-3 rounded-2xl bg-indigo-50" />
      <aside
        className="relative w-[270px] h-[499px] bg-white border border-white rounded-sm p-3 space-y-4"
      >
        <div className="relative h-10 w-full rounded-sm bg-[#F7F7F7] p-1">
          <div
            className={`absolute inset-y-1 left-1 rounded-sm bg-white shadow transition-all duration-200 ${
              activeTab === "seats" 
                ? "w-[119px] translate-x-[119px]" 
                : "w-[119px] translate-x-0"
            }`}
          />

            <div className="relative z-10 grid h-full grid-cols-2">
            <button
              onClick={() => setActiveTab("tools")}
              className={`${tabBase}`}
            >
              工具箱
            </button>
            <button
              onClick={() => setActiveTab("seats")}
              className={`${tabBase}`}
            >
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
                  className="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-700 transition-colors"
                >
                  <Minus/>
                </button>
                <span className="text-3xl font-bold min-w-[60px] text-center">
                  {rows}
                </span>
                <button
                  onClick={() => setRows(rows + 1)}
                  className="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-700 transition-colors"
                >
                  <Plus/>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3>列數（寬度）</h3>
              <div className="flex items-center justify-center gap-9">
                <button
                  onClick={() => setColumns(Math.max(1, columns - 1))}
                  className="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-700 transition-colors"
                >
                  <Minus/>
                </button>
                <span className="text-3xl font-bold text-gray-800 min-w-[60px] text-center">
                  {columns}
                </span>
                <button
                  onClick={() => setColumns(columns + 1)}
                  className="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-700 transition-colors"
                >
                  <Plus/>
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
                  className={`w-[117px] h-[77px] flex flex-col items-center justify-center gap-2 rounded-[10px] border px-4 text-sm transition-colors ${
                    selectedTool === "normal"
                      ? "bg-primary-500 text-white"
                      : "bg-[#F7F7F7] border-[#F7F7F7]"
                  }`}
                >
                  <Armchair size={28} className="flex-shrink-0" />
                  <span>一般座位</span>
                </button>

                <button
                  onClick={() => setSelectedTool(selectedTool === "accessible" ? null : "accessible")}
                  className={`w-[117px] h-[77px] flex flex-col items-center justify-center gap-2 rounded-lg border px-4 text-sm transition-colors ${
                    selectedTool === "accessible"
                      ? "bg-primary-500 text-white"
                      : "bg-[#F7F7F7] border-[#F7F7F7]"
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
                  onClick={() =>
                    setSelectedTool(selectedTool === "aisle" ? null : "aisle")
                  }
                  className={`w-[117px] h-[77px] flex flex-col items-center justify-center gap-2 rounded-lg border px-4 text-sm transition-colors ${
                    selectedTool === "aisle"
                      ? "bg-primary-500 text-white"
                      : "bg-[#F7F7F7] border-[#F7F7F7]"
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
                  className={`w-[117px] h-[77px] flex flex-col items-center justify-center gap-2 rounded-lg border px-4 text-sm transition-colors ${
                    selectedTool === "eraser"
                      ? "bg-primary-500 text-white"
                      : "bg-[#F7F7F7] border-[#F7F7F7]"
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
  );
};

export default SidebarToolbox;