import AdminContainer from "@/components/layout/AdminContainer"
import EmptyContent from "@/components/ui/EmptyContent"
import Header from "@/components/ui/Header"

const Theaters = () => {
  return (
    <AdminContainer>
      <Header title="影廳" buttonText="建立影廳" onClick={() => {}} />
      <EmptyContent title="一間影廳都還沒有" description="點擊「建立影廳」來新增第一間吧" />
    </AdminContainer>
  )
}

export default Theaters
