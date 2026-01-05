import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import toast from "react-hot-toast"
import scanBg from "@/assets/icon/scan-bg.png"
import ticketIcon from "@/assets/icon/ticket-icon.svg"
import QrScanner from "@/components/ticket/QrScanner"
import TicketInfo from "@/components/ticket/TicketInfo"
import VerificationResult from "@/components/ticket/VerificationResult"
import { scanTicket, validateTicket, TicketAPIError } from "@/services/ticketAPI"
import type { ScanTicketResponse } from "@/services/ticketAPI"

const TicketCheck = () => {
  const navigate = useNavigate()
  const [scanned, setScanned] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [ticketData, setTicketData] = useState<ScanTicketResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  const handleScan = async (decodedText: string) => {
    try {
      setIsLoading(true)
      // eslint-disable-next-line no-console
      console.log("掃描到的 QR Code 內容:", decodedText)

      const data = await scanTicket(decodedText)
      setTicketData(data)
      setScanned(true)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("掃描票券失敗:", error)

      if (error instanceof TicketAPIError) {
        if (error.errorType === "NOT_FOUND") {
          toast.error("票券不存在", { id: "scan-ticket-not-found" })
        } else if (error.errorType === "VALIDATION_ERROR") {
          toast.error(`掃描失敗：${error.message}`, { id: "scan-ticket-validation-error" })
        } else if (error.errorType === "UNAUTHORIZED") {
          toast.error("未授權，請重新登入", { id: "scan-ticket-unauthorized" })
          localStorage.removeItem("token")
          navigate("/login")
        } else if (error.errorType === "FORBIDDEN") {
          toast.error("權限不足，需要 Admin 角色", { id: "scan-ticket-forbidden" })
        } else {
          toast.error(`掃描失敗：${error.message}`, { id: "scan-ticket-error" })
        }
      } else {
        toast.error("掃描票券失敗，請稍後再試", { id: "scan-ticket-error" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    navigate("/")
  }

  const handleConfirm = async () => {
    if (!ticketData) return

    try {
      setIsValidating(true)
      // 呼叫驗票 API
      const result = await validateTicket(ticketData.ticketId)

      // 驗票成功
      setIsSuccess(true)
      setShowResult(true)
      toast.success(result.message || "驗票成功", { id: "validate-ticket-success" })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("驗票失敗:", error)

      // 驗票失敗
      setIsSuccess(false)
      setShowResult(true)

      if (error instanceof TicketAPIError) {
        if (error.errorType === "VALIDATION_ERROR") {
          // 400: 票券狀態不允許驗票 (已使用/已過期/未支付)
          toast.error(error.message || "驗票失敗", { id: "validate-ticket-error" })
        } else if (error.errorType === "NOT_FOUND") {
          toast.error("票券不存在", { id: "validate-ticket-not-found" })
        } else if (error.errorType === "UNAUTHORIZED") {
          toast.error("未授權，請重新登入", { id: "validate-ticket-unauthorized" })
          localStorage.removeItem("token")
          navigate("/login")
        } else if (error.errorType === "FORBIDDEN") {
          toast.error("權限不足，需要 Admin 角色", { id: "validate-ticket-forbidden" })
        } else {
          toast.error(`驗票失敗：${error.message}`, { id: "validate-ticket-error" })
        }
      } else {
        toast.error("驗票失敗，請稍後再試", { id: "validate-ticket-error" })
      }
    } finally {
      setIsValidating(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      const weekDay = date.toLocaleDateString("zh-TW", { weekday: "narrow" })
      const dateText = format(date, "yyyy/MM/dd", { locale: zhTW })
      return `${dateText}(${weekDay})`
    } catch {
      return dateString
    }
  }

  const formatTime = (timeString: string | null) => {
    if (!timeString) return ""
    try {
      // 假設時間格式為 HH:mm 或 HH:mm:ss
      const [hours, minutes] = timeString.split(":")
      const hour = parseInt(hours, 10)
      if (hour < 12) {
        return `上午 ${timeString}`
      }
      if (hour === 12) {
        return `下午 ${timeString}`
      }
      return `下午 ${String(hour - 12).padStart(2, "0")}:${minutes}`
    } catch {
      return timeString
    }
  }

  const formatSeat = (row: string | null, column: number | null, label: string | null) => {
    if (label) return label
    if (row && column !== null) {
      return `${row} 排 ${column} 號`
    }
    if (row) return `${row} 排`
    if (column !== null) return `${column} 號`
    return ""
  }

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
          {!scanned && !isLoading && (
            <QrScanner
              onScan={handleScan}
              onError={(err) => {
                const errorMessage =
                  err instanceof Error ? err.message : "無法啟動相機，請檢查權限設定"
                // eslint-disable-next-line no-console
                console.error("相機錯誤:", errorMessage)
                toast.error(errorMessage, { id: "camera-error" })
              }}
            />
          )}
          {isLoading && (
            <div className="flex h-full w-full items-center justify-center bg-black/50">
              <p className="font-family-inter text-xl font-bold text-white">掃描中...</p>
            </div>
          )}
          {scanned && (
            <>
              <img
                src={scanBg}
                alt="scan background"
                className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 z-10 bg-black/50" />
            </>
          )}
          <p className="font-family-inter pointer-events-none absolute top-4 left-4 z-20 text-xl leading-[1.2] font-bold text-white">
            掃描 QR Code 驗票
          </p>
        </div>
        {!scanned && (
          <button
            type="button"
            onClick={handleBack}
            className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-lg bg-[#5365AC] px-6 py-2 text-white"
          >
            返回
          </button>
        )}
        {scanned && ticketData && (
          <>
            <TicketInfo
              movieTitle={ticketData.movieTitle || "未知電影"}
              date={formatDate(ticketData.showDate)}
              theater={ticketData.theaterName || ""}
              showtime={formatTime(ticketData.showTime)}
              seat={formatSeat(ticketData.seatRow, ticketData.seatColumn, ticketData.seatLabel)}
              ticketNumber={ticketData.ticketNumber || ""}
              theaterType={ticketData.theaterType || ""}
              onConfirm={handleConfirm}
              showResult={showResult}
              isValidating={isValidating}
            />
            {showResult && <VerificationResult isSuccess={isSuccess} />}
          </>
        )}
      </div>
    </div>
  )
}

export default TicketCheck
