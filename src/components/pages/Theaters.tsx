const Theaters = () =>{
    return(
        <div className="flex">
            <aside className="w-60 border-r border-gray-300 bg-gray-500 p-4">臨時側邊欄</aside>
            <div className="flex-1">
                <header className="flex items-center justify-between p-6 bg-[#E7E8EF]">
                    <h1 className="font-bold text-[40px]">影廳</h1>
                    <button type="button" className="inline-flex items-center justify-center w-24 h-10 bg-[#5365AC] text-white rounded-[10px] cursor-pointer">建立影廳</button>
                </header>
            </div> 
        </div>
    )
}

export default Theaters