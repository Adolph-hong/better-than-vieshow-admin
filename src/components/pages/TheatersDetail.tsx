import { useState } from 'react'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import SidebarToolbox from '@/components/SidebarToolbox'
import SeatingChart from '@/components/SeatingChart'
import type { ToolType } from '@/components/SeatingChart'

const TheatersDetail = () => {
  const [activeTab, setActiveTab] = useState<'tools' | 'seats'>('tools')
  const [selectedTool, setSelectedTool] = useState<ToolType>('normal')
  const [rows, setRows] = useState<number>(8)
  const [columns, setColumns] = useState<number>(16)

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 border-r border-gray-300 bg-gray-500">臨時側邊欄</aside>
      <div className="flex flex-1 flex-col gap-3 bg-[#E7E8EF]">
        <header className="flex items-center gap-2 bg-[#E7E8EF] px-6 py-6">
          <button type="button" className="cursor-pointer transition-transform hover:scale-125">
            <ArrowLeft className="h-10 w-10" />
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
                  className="mt-2 w-[320px] rounded-md border border-white bg-white px-4 py-3 text-[#353642] placeholder:text-[#999999]"
                />
              </label>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="floorCount" className="flex flex-col text-sm font-normal">
                <span>樓層數</span>
                <input
                  id="floorCount"
                  placeholder="樓層數"
                  className="mt-2 w-[129px] rounded-md border border-white bg-white px-4 py-3 text-[#353642] placeholder:text-[#999999]"
                />
              </label>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="theaterType" className="text-sm font-normal">
                <span className="font-normal">類型</span>
                <div className="relative mt-2">
                  <select
                    id="theaterType"
                    className="w-[194px] appearance-none rounded-md border border-gray-200 bg-white px-4 py-3 pr-10"
                    defaultValue="general"
                  >
                    <option value="general">一般數位</option>
                    <option value="imax">4DX</option>
                    <option value="4dx">IMAX</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
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
            <div className="flex-1">
              <SeatingChart selectedTool={selectedTool} rowsCount={rows} columnsCount={columns} />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default TheatersDetail
