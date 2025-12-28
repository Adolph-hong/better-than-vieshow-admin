import { useState, useMemo } from "react"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import ticketIcon from "@/assets/icon/ticket-icon.svg"
import moviesData from "@/components/form/db.json"
import QrScanner from "@/components/ticket/QrScanner"
import TicketInfo from "@/components/ticket/TicketInfo"
import VerificationResult from "@/components/ticket/VerificationResult"
import type { Movie } from "@/utils/storage"

const TARGET_MOVIE_ID = "9879baaf-2c45-4ace-8193-82af637e06a9"

const TicketCheck = () => {
  const [scanned, setScanned] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const movie = useMemo(() => {
    const data = moviesData as { movies?: Movie[] }
    const movies = Array.isArray(data.movies) ? data.movies : []
    return movies.find((m) => m.id === TARGET_MOVIE_ID) || movies[0]
  }, [])

  const handleScan = (decodedText: string) => {
    // 實驗用：掃描任何 QR Code 都顯示預設的軒轅劍票券
    // eslint-disable-next-line no-console
    console.log("🎯 handleScan 被調用！掃描到的 QR Code 內容:", decodedText)
    // eslint-disable-next-line no-console
    console.log("🎯 準備設置 scanned = true")
    // 直接顯示票券資訊（使用預設的 TARGET_MOVIE_ID）
    setScanned(true)
    // eslint-disable-next-line no-console
    console.log("🎯 scanned 已設置為 true")
  }

  const handleManualScan = () => {
    setScanned(true)
  }

  const handleConfirm = () => {
    const success = Math.random() > 0.5
    setIsSuccess(success)
    setShowResult(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const weekDay = date.toLocaleDateString("zh-TW", { weekday: "narrow" })
    const dateText = format(date, "yyyy/MM/dd", { locale: zhTW })
    return `${dateText}(${weekDay})`
  }

  const today = new Date()
  const formattedDate = formatDate(today.toISOString().split("T")[0])

  return (
    <div className="m-auto flex h-screen max-w-[375px] flex-col">
      <header className="flex border-b border-[#E5E5E5] px-4 py-2">
        <div className="flex">
          <img src={ticketIcon} alt="ticket-icon" />
          <div className="flex flex-col">
            <p className="font-family-inter text-xs leading-[1.2] font-bold text-[#333333]">
              Better Than
            </p>
            <p className="font-family-noto-serif flex justify-center text-xl leading-[1.2] font-semibold text-[#333333]">
              威秀
            </p>
          </div>
        </div>
      </header>
      <div className="relative flex flex-1 overflow-hidden">
        <div className="absolute h-full w-full overflow-hidden">
          {!scanned && (
            <QrScanner
              onScan={handleScan}
              onError={(err) => {
                const errorMessage =
                  err instanceof Error ? err.message : "無法啟動相機，請檢查權限設定"
                // eslint-disable-next-line no-console
                console.error("相機錯誤:", errorMessage)
              }}
            />
          )}
          {/* 移除黑色遮罩，讓掃描畫面完整顯示 */}
          <p className="font-family-inter pointer-events-none absolute top-4 left-4 z-20 text-xl leading-[1.2] font-bold text-white">
            掃描 QR Code 驗票
          </p>
        </div>
        {!scanned && (
          <button
            type="button"
            onClick={handleManualScan}
            className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-lg bg-[#5365AC] px-6 py-2 text-white"
          >
            測試掃描
          </button>
        )}
        {scanned && movie && (
          <>
            <TicketInfo
              movie={movie}
              date={formattedDate}
              theater="2A"
              showtime="下午 2:30"
              seat="D 排 12 號"
              ticketNumber="13395332"
              onConfirm={handleConfirm}
              showResult={showResult}
            />
            {showResult && <VerificationResult isSuccess={isSuccess} />}
          </>
        )}
      </div>
    </div>
  )
}

export default TicketCheck
