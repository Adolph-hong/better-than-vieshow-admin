import { useState } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { Menu, MenuItem } from "@mui/material"
import adminLogo from "@/assets/icon/admin-logo.png"
import adminPhoto from "@/assets/icon/admin-photo.svg"
import logoText from "@/assets/icon/logoText.svg"
import SIDEBAR_ITEMS from "@/components/layout/sidebarItem"

interface SidebarProps {
  borderColor?: string
}

const sidebarStyle = (isActive: boolean) => {
  const baseStyle =
    "font-family-inter font-midium text-[14px] active:text-primary-500 active:border-primary-500 flex items-center gap-4 py-5 leading-none text-gray-500 hover:bg-[#F5F5F5] active:bg-[#6877D9]/6 hover:cursor-pointer"
  const activeStyle = "border-primary-500 border-l-4 bg-[#6877D9]/6 text-primary-500"
  const defaultStyle = "border-transparent border-l-4"
  return `${baseStyle} ${isActive ? activeStyle : defaultStyle}`
}

const Sidebar = ({ borderColor = "border-white" }: SidebarProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("userEmail")
    handleClose()
    navigate("/login")
  }

  const checkIsActive = (to: string, currentPath: string) => {
    if (to === "/#") {
      return currentPath === "/" || currentPath === "/#"
    }
    if (to === "/") {
      return currentPath === "/"
    }
    return currentPath.startsWith(to)
  }

  return (
    <aside
      className={`sticky top-0 flex h-screen w-[239px] shrink-0 flex-col border-r bg-white py-6 ${borderColor}`}
    >
      {/* 上方logo與主題文字 */}
      <section className="mb-6 ml-4 flex text-[#333333]">
        <img src={adminLogo} alt="logo" />
        <img src={logoText} alt="Better Than 威秀" className="h-14.5" />
      </section>
      {/* 中間選單 */}
      <section className="flex flex-col">
        {SIDEBAR_ITEMS.map(({ id, to, title, icon: Icon }) => {
          const isActive = checkIsActive(to, location.pathname)
          return (
            <NavLink
              key={id}
              to={to}
              className={sidebarStyle(isActive)}
              onClick={(e) => {
                // 如果是 /# 路由，阻止預設行為並導向首頁
                if (to === "/#") {
                  e.preventDefault()
                  // 使用 navigate 而不是 window.location
                }
              }}
            >
              <Icon className="ml-8" />
              <span>{title}</span>
            </NavLink>
          )
        })}
      </section>
      {/* 下方會員 */}
      <section className="mt-auto px-3">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClick}
            className="cursor-pointer border-none bg-transparent p-0 outline-none"
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <img src={adminPhoto} alt="admin-photo" />
          </button>
          <div className="mt-auto flex h-[45px] min-w-0 flex-1 flex-col justify-end gap-1">
            <span className="font-inter text-lg leading-none font-semibold text-[#000000]">
              {localStorage.getItem("user") || "未登入"}
            </span>
            <span className="font-inter truncate text-sm font-normal text-[#BAB9BE]">
              {localStorage.getItem("userEmail") || "未登入"}
            </span>
          </div>
        </div>
        <Menu
          id="account-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          transformOrigin={{ horizontal: "right", vertical: "bottom" }}
          anchorOrigin={{ horizontal: "right", vertical: "top" }}
        >
          <MenuItem onClick={handleLogout}>登出</MenuItem>
        </Menu>
      </section>
    </aside>
  )
}

export default Sidebar
