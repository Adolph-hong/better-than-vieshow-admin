import ghost from "../../asset/Group.svg"

const Theaters = () =>{
    return(
        <div className="flex">
            <aside className="w-60 border-r border-gray-300 bg-gray-500 p-4">臨時側邊欄</aside>
            <div className="flex-1 flex flex-col min-h-screen">
                <header className="flex items-center justify-between p-6 bg-[#E7E8EF]">
                    <h1 className="font-bold text-[40px]">影廳</h1>
                    <button type="button" className="inline-flex items-center justify-center w-24 h-10 bg-[#5365AC] text-white rounded-[10px] cursor-pointer">建立影廳</button>
                </header>
                <section className="flex-1 flex items-center justify-center bg-[#E7E8EF]">
                    <div className="flex flex-col items-center">
                        <img src={ghost} alt="ghost icon" />
                        <p className="text-[#838495] text-xl font-medium mt-10">一間影廳都還沒有</p>
                        <p className="text-[#A0A1B6]">點擊「建立影廳」來新增第一間吧</p>
                    </div>
                </section>
            </div> 
        </div>
    )
}

export default Theaters