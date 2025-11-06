import { Route, Routes } from 'react-router-dom'
import Home from './components/pages/Home'
import Theaters from './components/pages/Theaters'
import TheatersDetail from './components/pages/TheatersDetail'
import SidebarToolbox from './components/SidebarToolbox'

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/theaters" element={<Theaters />} />
      <Route path="/theaters-detail" element={<TheatersDetail />} />
      <Route path="/theaters-toolbox" element={<SidebarToolbox/>}/>
    </Routes>
  )
}

export default AppRouter
