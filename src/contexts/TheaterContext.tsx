import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import type { ReactNode } from "react"
import type { SeatCell } from "@/components/theater-builder/SeatingChart"

export type TheaterData = {
  id: string
  name: string
  isActive: boolean
  normalSeats: number
  accessibleSeats: number
  seatMap: SeatCell[][]
  type: string
}

type TheaterContextType = {
  theaters: TheaterData[]
  addTheater: (theater: TheaterData) => void
  deleteTheater: (id: string) => void
  updateTheater: (id: string, theater: Partial<TheaterData>) => void
}

const TheaterContext = createContext<TheaterContextType | undefined>(undefined)

const STORAGE_KEY = "theaters_data"

export const TheaterProvider = ({ children }: { children: ReactNode }) => {
  const [theaters, setTheaters] = useState<TheaterData[]>(() => {
    // 從 localStorage 讀取資料
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // 當 theaters 改變時，同步到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theaters))
  }, [theaters])

  const addTheater = useCallback((theater: TheaterData) => {
    setTheaters((prev) => [...prev, theater])
  }, [])

  const deleteTheater = useCallback((id: string) => {
    setTheaters((prev) => prev.filter((theater) => theater.id !== id))
  }, [])

  const updateTheater = useCallback((id: string, updates: Partial<TheaterData>) => {
    setTheaters((prev) =>
      prev.map((theater) => (theater.id === id ? { ...theater, ...updates } : theater))
    )
  }, [])

  const value = useMemo(
    () => ({ theaters, addTheater, deleteTheater, updateTheater }),
    [theaters, addTheater, deleteTheater, updateTheater]
  )

  return <TheaterContext.Provider value={value}>{children}</TheaterContext.Provider>
}

export const useTheater = () => {
  const context = useContext(TheaterContext)
  if (context === undefined) {
    throw new Error("useTheater must be used within a TheaterProvider")
  }
  return context
}
