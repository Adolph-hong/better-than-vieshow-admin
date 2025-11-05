import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './index.css'
import Home from './components/pages/Home';
import Theaters from './components/pages/Theaters';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <nav className="flex gap-4">
        <Link to="/">Home</Link> |{" "}
        <Link to="/theaters">Theaters</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/theaters" element={<Theaters />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
