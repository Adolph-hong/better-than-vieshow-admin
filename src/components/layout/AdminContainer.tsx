import Sidebar from "@/components/layout/Sidebar"

const AdminContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col bg-[#E7E8EF]">{children}</div>
    </div>
  )
}

export default AdminContainer
