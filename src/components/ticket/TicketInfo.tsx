import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { Movie } from "@/utils/storage"

interface TicketInfoProps {
  movie: Movie
  date: string
  theater: string
  showtime: string
  seat: string
  ticketNumber: string
  onConfirm: () => void
  showResult: boolean
}

const TicketInfo = ({
  movie,
  date,
  theater,
  showtime,
  seat,
  ticketNumber,
  onConfirm,
  showResult,
}: TicketInfoProps) => {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true)
    })
  }, [])

  const handleButtonClick = () => {
    if (showResult) {
      navigate("/")
    } else {
      onConfirm()
    }
  }

  return (
    <div
      className={`absolute right-0 bottom-0 left-0 z-20 flex h-[calc(50vh+54px)] flex-col overflow-hidden rounded-t-3xl bg-white shadow-lg transition-transform duration-300 ease-out ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex flex-1 flex-col overflow-y-auto rounded-t-3xl">
        <div className="relative h-40 w-full">
          <div className="absolute inset-0 h-full w-full bg-black/40" />
          <img src={movie.poster} alt={movie.movieName} className="h-full w-full object-cover" />
          <h2 className="font-family-inter absolute bottom-3 line-clamp-1 px-3 text-xl leading-normal font-bold tracking-[0.04em] break-all text-white">
            {movie.movieName}
          </h2>
        </div>
        <div className="flex flex-col px-4 pt-4">
          <div className="flex flex-col gap-8">
            <div className="flex">
              <div className="flex flex-1 flex-col gap-1">
                <span className="font-family-inter text-sm font-semibold text-[#777777]">日期</span>
                <span className="body-medium text-[#232323]">{date}</span>
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <span className="font-family-inter text-sm font-semibold text-[#777777]">場次</span>
                <span className="body-medium text-[#232323]">{showtime}</span>
              </div>
            </div>
            <div className="flex">
              <div className="flex flex-1 flex-col gap-1">
                <span className="font-family-inter text-sm font-semibold text-[#777777]">影廳</span>
                <span className="body-medium text-[#232323]">{theater}</span>
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <span className="font-family-inter text-sm font-semibold text-[#777777]">座位</span>
                <span className="body-medium text-[#232323]">{seat}</span>
              </div>
            </div>
            <div className="flex">
              <div className="flex flex-1 flex-col gap-1">
                <span className="font-family-inter text-sm font-semibold text-[#777777]">類型</span>
                <span className="body-medium text-[#232323]">
                  一般{" "}
                  {(() => {
                    if (movie.filmType?.includes("3DX")) return "3DX"
                    if (movie.filmType?.includes("IMAX")) return "IMAX"
                    return "2D"
                  })()}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <span className="font-family-inter text-sm font-semibold text-[#777777]">編號</span>
                <span className="body-medium text-[#232323]">{ticketNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={handleButtonClick}
          className="body-medium bg-primary-500 w-full rounded-[10px] px-4 py-2.5 text-white"
        >
          {showResult ? "確認" : "確認驗票"}
        </button>
      </div>
    </div>
  )
}

export default TicketInfo
