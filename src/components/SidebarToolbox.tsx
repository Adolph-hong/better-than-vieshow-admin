import { useState } from "react";
import { Armchair , Accessibility , Minus , Eraser} from 'lucide-react';


const SidebarToolbox = () => {
  const [activeTab, setActiveTab] = useState<"tools" | "seats">("tools");
  const [seatType, setSeatType] = useState<"normal" | "accessible">("normal");
  const [selectedScene, setSelectedScene] = useState<"aisle" | null>(null);
  const [toolItem, setToolItem] = useState<"eraser" | null>(null);

  const tabBase = "flex items-center justify-center w-full h-full text-sm rounded-md transition-colors";

  return (
    <div className="relative w-fit">
      <div className="pointer-events-none absolute -inset-3 rounded-2xl bg-indigo-50" />
      <aside className="relative w-[270px] bg-white border border-white rounded-sm p-3 space-y-4">
        <div className="relative w-[246px] h-10 bg-[#F7F7F7] rounded-sm p-1">
          <div
            className={`absolute inset-y-1 w-[119px] rounded-sm bg-white shadow transition-transform duration-200 ${
              activeTab === "seats" ? "translate-x-full" : "translate-x-0"
            }`}
          />

          <div className="relative z-10 grid grid-cols-2 h-full">
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
      
      <section className="space-y-3">
        <h3 className="font-medium">座位</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSeatType("normal")}
            className={`w-[117px] flex flex-col items-center justify-center gap-2 rounded-[10px] border p-4 text-sm transition-colors ${
              seatType === "normal"
                ? "bg-[#5365AC] text-white"
                : "bg-[#F7F7F7] border-[#F7F7F7]"
            }`}
          >
            <Armchair/>
            <span>一般座位</span>
          </button>

          <button
            onClick={() => setSeatType("accessible")}
            className={`w-[117px] flex flex-col items-center justify-center gap-2 rounded-lg border p-4 text-sm transition-colors ${
              seatType === "accessible"
                ? "bg-[#5365AC] text-white"
                : "bg-[#F7F7F7] border-[#F7F7F7]"
            }`}
          >
            
            <Accessibility/>
            <span>殘障座位</span>
          </button>
        </div>
      </section>

      <hr className="w-[246px] border-[#E5E5E5]" />

      <section className="space-y-3">
        <h3 className="font-medium">場景</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() =>
              setSelectedScene(selectedScene === "aisle" ? null : "aisle")
            }
            className={`w-[117px] col-span-2 flex flex-col items-center justify-center gap-2 rounded-lg border p-4 text-sm transition-colors ${
              selectedScene === "aisle"
                ? "bg-[#5365AC] text-white"
                : "bg-[#F7F7F7] border-[#F7F7F7]"
            }`}
          >
            <Minus/>
            <span>走道</span>
          </button>
        </div>
      </section>

      <hr className="w-[246px] border-[#E5E5E5]" />

      <section className="space-y-3">
        <h3 className="font-medium">工具</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setToolItem(toolItem === "eraser" ? null : "eraser")}
            className={`w-[117px] col-span-2 flex flex-col items-center justify-center gap-2 rounded-lg border p-4 text-sm transition-colors ${
              toolItem === "eraser"
                ? "bg-[#5365AC] text-white"
                : "bg-[#F7F7F7] border-[#F7F7F7]"
            }`}
          >
            <Eraser/>
            <span>橡皮擦</span>
          </button>
        </div>
      </section>
      </aside>
    </div>
  );
};

export default SidebarToolbox;