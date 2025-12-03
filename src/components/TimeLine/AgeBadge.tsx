interface AgeBadgeProps {
  category?: string
}

const AgeBadge = ({ category = "G" }: AgeBadgeProps) => {
  if (category === "R-18") {
    // 限制級
    return (
      <div className="flex max-h-[85px] w-18 flex-col overflow-hidden rounded-sm">
        <div className="flex h-15 w-full justify-center bg-[#E70012]">
          <div className="header-2 flex text-white">18</div>
          <div className="header-3 flex h-9 text-white">+</div>
        </div>
        <div className="font-family-inter flex w-full items-center justify-center bg-white py-1 text-sm leading-[120%] font-semibold text-gray-900">
          限制級
        </div>
      </div>
    )
  }

  if (category === "PG-12") {
    // 輔導級
    return (
      <div className="flex max-h-[85px] w-18 flex-col overflow-hidden rounded-sm">
        <div className="flex h-15 w-full justify-center bg-[#EE7700]">
          <div className="header-2 flex text-white">15</div>
          <div className="header-3 flex h-9 text-white">+</div>
        </div>
        <div className="font-family-inter flex w-full items-center justify-center bg-white py-1 text-sm leading-[120%] font-semibold text-gray-900">
          輔導級
        </div>
      </div>
    )
  }

  // 預設：普遍級 (G)
  return (
    <div className="flex max-h-[85px] w-18 flex-col overflow-hidden rounded-sm">
      <div className="flex h-15 w-full justify-center bg-[#58B530]">
        <div className="header-2 flex text-white">0</div>
        <div className="header-3 flex h-9 text-white">+</div>
      </div>
      <div className="font-family-inter flex w-full items-center justify-center bg-white py-1 text-sm leading-[120%] font-semibold text-gray-900">
        普遍級
      </div>
    </div>
  )
}

export default AgeBadge
