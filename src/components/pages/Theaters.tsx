import ghost from "../../asset/Group.svg"

const Theaters = () => {
  return (
    <div className="flex">
      <aside className="w-60 border-r border-gray-300 bg-gray-500 p-4">臨時側邊欄</aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between bg-[#E7E8EF] p-6">
          <h1 className="text-[40px] font-bold">影廳</h1>
          <button
            type="button"
            className="inline-flex h-10 w-24 cursor-pointer items-center justify-center rounded-[10px] bg-[#5365AC] text-white"
          >
            建立影廳
          </button>
        </header>
        <section className="flex flex-1 items-center justify-center bg-[#E7E8EF]">
          <div className="flex flex-col items-center">
            <img src={ghost} alt="ghost icon" />
            <p className="mt-10 text-xl font-medium text-[#838495]">一間影廳都還沒有</p>
            <p className="text-[#A0A1B6]">點擊「建立影廳」來新增第一間吧</p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Theaters
