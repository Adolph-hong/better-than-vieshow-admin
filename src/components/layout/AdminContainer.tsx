import Sidebar from "@/components/layout/Sidebar"

interface AdminContainerProps {
  children: React.ReactNode
  sidebarBorderColor?: string
}

const AdminContainer = ({ children, sidebarBorderColor }: AdminContainerProps) => {
  return (
    <div className="flex">
      <Sidebar borderColor={sidebarBorderColor} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-[#E7E8EF]">{children}</div>
    </div>
  )
}

export default AdminContainer
