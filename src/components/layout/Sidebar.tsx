import { NavLink } from 'react-router-dom'
import SIDEBAR_ITEMS from '@/data/sidebarItem'

const Sidebar = () => {
  return (
    <aside className="flex min-h-screen w-60 flex-col bg-white py-6">
      {/* 上方logo與主題文字 */}
      <section className="mb-11 flex justify-center gap-5">
        <img src="/public/logo.svg" alt="logo" />
        <div className="flex flex-col items-center">
          <span className="body-small">Better Than</span>
          <span className="body-large">威秀</span>
        </div>
      </section>
      {/* 中間選單 */}
      <section className="flex flex-col">
        {SIDEBAR_ITEMS.map(({ id, to, title, icon: Icon }) => (
          <NavLink
            key={id}
            to={to}
            className="flex items-center gap-4 py-5 hover:bg-[#F5F5F5] active:bg-[#6877D9]/6"
          >
            <Icon className="ml-9 text-gray-500" active:text-primary-500 />
            <span className="active:text-primary-500">{title}</span>
          </NavLink>
        ))}
      </section>
      {/* 下方會員 */}
      <section className="mt-auto h-12 px-3">
        <div className="flex gap-3">
          <img src="/public/admin-photo.svg" alt="admin-photo" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="font-family-inter leading-nore text-lg font-semibold text-[#000000]">
              Zhen Yu
            </span>
            <span className="leading-nore font-family-inter truncate font-normal text-[#BAB9BE]">
              zhen-yu@gmail.com
            </span>
          </div>
        </div>
      </section>
    </aside>
  )
}

export default Sidebar
