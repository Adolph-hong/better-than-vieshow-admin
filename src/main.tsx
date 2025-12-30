import { StrictMode } from "react"
import { BrowserRouter } from "react-router-dom"
import { createRoot } from "react-dom/client"
import { Toaster } from "react-hot-toast"
import AppRouter from "@/AppRouter"
import "@/assets/style/index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AppRouter />
      <Toaster position="top-center" />
    </BrowserRouter>
  </StrictMode>
)
