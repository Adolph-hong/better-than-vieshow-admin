import { useMemo } from "react"
import { useLocation } from "react-router-dom"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale/zh-TW"
import AdminContainer from "@/components/layout/AdminContainer"
import Header from "@/components/ui/Header"

const TimeLineEditor = () => {
  const location = useLocation()
  const locationState = location.state as { formattedDate?: string } | null
  const formattedDate = useMemo(() => {
    if (locationState?.formattedDate) {
      return locationState.formattedDate
    }
    const today = new Date()
    const dateText = format(today, "yyyy/MM/dd", { locale: zhTW })
    const weekDay = today.toLocaleDateString("zh-TW", { weekday: "narrow" })
    return `${dateText}(${weekDay})`
  }, [locationState])

  return (
    <AdminContainer>
      <Header title={`編輯時刻表 - ${formattedDate}`} back backTo="/timelines" />
      <div className="mt-3 flex flex-1 justify-between gap-6 px-6">
        <p className="text-xl font-semibold text-gray-900">編輯頁面建置中</p>
        <p className="text-sm text-gray-500">之後會在這裡完成廳次與場次設定。</p>
      </div>
    </AdminContainer>
  )
}

export default TimeLineEditor
