import { ArrowLeft, ChevronDown } from 'lucide-react'

const TheatersDetail = () => {
  return (
    <div className="flex">
      <aside className="w-60 border-r border-gray-300 bg-gray-500">臨時側邊欄</aside>
      <div className="flex flex-1 flex-col gap-3">
        <header className="flex items-center gap-2 px-6 py-6">
          <ArrowLeft className="h-10 w-10" />
          <h1 className="text-[40px] font-bold">新增影廳</h1>
        </header>
        <section className="px-6">
          <h1 className="text-2xl font-bold">基本資訊</h1>
          <div className="mt-4 grid grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="theaterName" className="text-sm font-medium text-gray-600">
                <span>影廳名稱</span>
                <input
                  id="theaterName"
                  type="text"
                  placeholder="影廳名稱"
                  className="mt-2 w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm ring-2 focus:border-gray-300 focus:ring-gray-300 focus:outline-none"
                />
              </label>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="floorCount" className="text-sm font-medium text-gray-600">
                <span>樓層數</span>
                <input
                  id="floorCount"
                  type="number"
                  placeholder="樓層數"
                  className="mt-2 w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm ring-2 focus:border-gray-300 focus:ring-gray-300 focus:outline-none"
                />
              </label>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="theaterType" className="text-sm font-medium text-gray-600">
                <span>類型</span>
                <div className="relative mt-2">
                  <select
                    id="theaterType"
                    className="w-full appearance-none rounded-md border border-gray-200 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm ring-2 focus:border-gray-300 focus:ring-gray-300 focus:outline-none"
                    defaultValue="general"
                  >
                    <option value="general">一般數位</option>
                    <option value="imax">IMAX</option>
                    <option value="4dx">4DX</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
                </div>
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default TheatersDetail
