import { Beer, CalendarClock, CircleDollarSign, Film, House, Users, UserStar } from 'lucide-react'

interface SidebarItem {
  id: number
  title: string
  to: string
  icon: React.ElementType
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 1, title: '影廳', to: '/theaters', icon: House },
  { id: 2, title: '電影', to: '/movie', icon: Film },
  // { id: 3, title: '熱食部', to: '/#', icon: Beer },
  { id: 4, title: '時刻表', to: '/#', icon: CalendarClock },
  // { id: 5, title: '營收', to: '/#', icon: CircleDollarSign },
  // { id: 6, title: '會員', to: '/#', icon: Users },
  // { id: 7, title: '管理員', to: '/#', icon: UserStar },
]
export default SIDEBAR_ITEMS
