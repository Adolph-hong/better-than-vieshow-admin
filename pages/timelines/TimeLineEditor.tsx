import AdminContainer from "@/components/layout/AdminContainer"
import Header from "@/components/ui/Header"

const TimeLineEditor = () => {
  return (
    <AdminContainer>
      <Header title="編輯時刻表" />
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-gray-600">
        <p className="text-xl font-semibold text-gray-900">編輯頁面建置中</p>
        <p className="text-sm text-gray-500">之後會在這裡完成廳次與場次設定。</p>
      </div>
    </AdminContainer>
  )
}

export default TimeLineEditor
