import { NavLink } from 'react-router-dom'
import SIDEBAR_ITEMS from '@/components/layout/sidebarItem'
import logo from '@/assets/icon/logo.svg'
import adminPhoto from '@/assets/icon/admin-photo.svg'

const sidebarStyle = (isActive: boolean) => {
  const baseStyle =
    'font-family-inter font-midium text-[14px] active:text-primary-500 active:border-primary-500 flex items-center gap-4 py-5 leading-none text-gray-500 hover:bg-[#F5F5F5] active:bg-[#6877D9]/6'
  const activeStyle = 'border-primary-500 border-l-4 bg-[#6877D9]/6'
  const defaultStyle = 'border-transparent border-l-4'
  return `${baseStyle} ${isActive ? activeStyle : defaultStyle}`
}

const Sidebar = () => {
  return (
    <aside className="flex min-h-screen w-60 flex-col bg-white py-6">
      {/* 上方logo與主題文字 */}
      <section className="mb-11 ml-4 flex gap-5 text-[#333333]">
        <img src={logo} alt="logo" />
        <div className="flex flex-col items-center">
          <span className="body-small font-bold">Better Than</span>
          <span className="body-large font-semibold">威秀</span>
        </div>
      </section>
      {/* 中間選單 */}
      <section className="flex flex-col">
        {SIDEBAR_ITEMS.map(({ id, to, title, icon: Icon }) => (
          <NavLink key={id} to={to} className={({ isActive }) => sidebarStyle(isActive)}>
            <Icon className="ml-8" />
            <span>{title}</span>
          </NavLink>
        ))}
      </section>
      {/* 下方會員 */}
      <section className="mt-auto px-3">
        <div className="flex gap-3">
          <img src={adminPhoto} alt="admin-photo" />
          <div className="mt-auto flex h-[45px] min-w-0 flex-1 flex-col justify-end gap-1">
            <span className="font-inter text-lg leading-none font-semibold text-[#000000]">
              Zhen Yu
            </span>
            <span className="font-inter truncate text-sm font-normal text-[#BAB9BE]">
              zhen-yu@gmail.com
            </span>
          </div>
        </div>
      </section>
    </aside>
  )
}

export default Sidebar
