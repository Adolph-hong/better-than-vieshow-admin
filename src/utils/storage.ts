import moviesData from "@/components/form/db.json"

const STORAGE_KEYS = {
  MOVIES: "better-than-vieshow-movies",
  SCHEDULES: "better-than-vieshow-schedules",
  VERSION: "better-than-vieshow-version",
  PUBLISHED_DATES: "better-than-vieshow-published-dates",
} as const

const DATA_VERSION = "1.0.0"

export interface Movie {
  id: string
  movieName: string
  duration: string
  poster: string
  category?: string
  director?: string
  actors?: string
  describe?: string
  trailerLink?: string
  startAt?: string
  endAt?: string
}

interface MoviesData {
  movies?: Movie[]
}

// 開發環境：永遠從 db.json 讀取
// 生產環境：從 LocalStorage 讀取，如果為空則從 db.json 初始化
export const getMovies = (): Movie[] => {
  try {
    // 確保 moviesData 存在
    if (!moviesData) {
      console.error("moviesData is not available")
      return []
    }

    const data = moviesData as MoviesData
    const moviesFromJson = Array.isArray(data.movies) ? data.movies : []

    if (import.meta.env.DEV) {
      // 開發環境：直接從 db.json 讀取
      return moviesFromJson
    }

    // 生產環境：從 LocalStorage 讀取
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MOVIES)
      if (stored) {
        const parsed = JSON.parse(stored) as Movie[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }

      // 如果 LocalStorage 為空或無效，從 db.json 初始化
      if (moviesFromJson.length > 0) {
        localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(moviesFromJson))
        localStorage.setItem(STORAGE_KEYS.VERSION, DATA_VERSION)
      }
      return moviesFromJson
    } catch (localStorageError) {
      console.error("Failed to read movies from localStorage:", localStorageError)
      // 如果讀取失敗，回退到 db.json
      return moviesFromJson
    }
  } catch (error) {
    console.error("Failed to get movies:", error)
    return []
  }
}

// 儲存電影資料（只在生產環境寫入 LocalStorage）
export const saveMovies = (movies: Movie[]): void => {
  if (import.meta.env.DEV) {
    // 開發環境：不寫入 LocalStorage（保持 db.json 為唯一來源）
    console.log("開發環境：電影資料不會寫入 LocalStorage")
    return
  }

  // 生產環境：寫入 LocalStorage
  try {
    localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(movies))
  } catch (error) {
    console.error("Failed to save movies to localStorage:", error)
  }
}

// 從 formattedDate 解析出日期字串 (yyyy/MM/dd)
const parseDateFromFormatted = (formattedDate: string): string => {
  // formattedDate 格式: "2025/11/30(日)"
  const match = formattedDate.match(/^(\d{4}\/\d{2}\/\d{2})/)
  return match ? match[1] : ""
}

// 排程資料的讀取和儲存（根據日期）
export const getSchedules = <T>(date?: string): T[] => {
  if (!date) return []

  try {
    const key = `${STORAGE_KEYS.SCHEDULES}-${date}`
    const stored = localStorage.getItem(key)
    if (stored) {
      return JSON.parse(stored) as T[]
    }
  } catch (error) {
    console.error("Failed to read schedules from localStorage:", error)
  }
  return []
}

// 從 formattedDate 讀取排程
export const getSchedulesByFormattedDate = <T>(formattedDate: string): T[] => {
  const date = parseDateFromFormatted(formattedDate)
  return getSchedules<T>(date)
}

export const saveSchedules = <T>(schedules: T[], date?: string): void => {
  if (!date) {
    console.error("saveSchedules: date is required")
    return
  }

  try {
    const key = `${STORAGE_KEYS.SCHEDULES}-${date}`
    localStorage.setItem(key, JSON.stringify(schedules))
  } catch (error) {
    console.error("Failed to save schedules to localStorage:", error)
  }
}

// 從 formattedDate 儲存排程
export const saveSchedulesByFormattedDate = <T>(schedules: T[], formattedDate: string): void => {
  const date = parseDateFromFormatted(formattedDate)
  saveSchedules(schedules, date)
}

// 檢查指定日期是否有草稿
export const hasDraft = (formattedDate: string): boolean => {
  const date = parseDateFromFormatted(formattedDate)
  if (!date) return false

  try {
    const key = `${STORAGE_KEYS.SCHEDULES}-${date}`
    const stored = localStorage.getItem(key)
    if (stored) {
      const schedules = JSON.parse(stored) as unknown[]
      return schedules.length > 0
    }
  } catch (error) {
    console.error("Failed to check draft:", error)
  }
  return false
}

// 清除所有資料（用於重置）
export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.MOVIES)
  localStorage.removeItem(STORAGE_KEYS.VERSION)
  // 清除所有日期的排程
  const keys = Object.keys(localStorage)
  keys.forEach((key) => {
    if (key.startsWith(STORAGE_KEYS.SCHEDULES)) {
      localStorage.removeItem(key)
    }
  })
}

// 重置為預設資料（從 db.json 重新載入）
export const resetToDefault = (): void => {
  const data = moviesData as MoviesData
  const movies = data.movies ?? []
  localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(movies))
  localStorage.setItem(STORAGE_KEYS.VERSION, DATA_VERSION)
  // 清除所有日期的排程
  const keys = Object.keys(localStorage)
  keys.forEach((key) => {
    if (key.startsWith(STORAGE_KEYS.SCHEDULES)) {
      localStorage.removeItem(key)
    }
  })
}

// 標記指定日期為已販售（無法再編輯）
export const markDateAsPublished = (formattedDate: string): void => {
  const date = parseDateFromFormatted(formattedDate)
  if (!date) return

  try {
    const key = STORAGE_KEYS.PUBLISHED_DATES
    const stored = localStorage.getItem(key)
    const publishedDates = stored ? (JSON.parse(stored) as string[]) : []

    if (!publishedDates.includes(date)) {
      publishedDates.push(date)
      localStorage.setItem(key, JSON.stringify(publishedDates))
    }
  } catch (error) {
    console.error("Failed to mark date as published:", error)
  }
}

// 檢查指定日期是否已販售（無法再編輯）
export const isDatePublished = (formattedDate: string): boolean => {
  const date = parseDateFromFormatted(formattedDate)
  if (!date) return false

  try {
    const key = STORAGE_KEYS.PUBLISHED_DATES
    const stored = localStorage.getItem(key)
    if (stored) {
      const publishedDates = JSON.parse(stored) as string[]
      return publishedDates.includes(date)
    }
  } catch (error) {
    console.error("Failed to check if date is published:", error)
  }
  return false
}

// 取得所有有排程的日期（草稿）與已販售日期
export const getScheduleStatusDates = (): { draft: Date[]; selling: Date[] } => {
  const draftMap = new Map<string, boolean>()

  // 先收集有排程的日期
  const keys = Object.keys(localStorage)
  keys.forEach((key) => {
    if (key.startsWith(STORAGE_KEYS.SCHEDULES)) {
      const dateStr = key.substring(`${STORAGE_KEYS.SCHEDULES}-`.length)
      try {
        const stored = localStorage.getItem(key)
        if (stored) {
          const schedules = JSON.parse(stored) as unknown[]
          if (schedules.length > 0) {
            draftMap.set(dateStr, true)
          }
        }
      } catch (error) {
        console.error("Failed to read schedules when collecting status dates:", error)
      }
    }
  })

  // 取得已販售日期
  let publishedDates: string[] = []
  try {
    const publishedStored = localStorage.getItem(STORAGE_KEYS.PUBLISHED_DATES)
    if (publishedStored) {
      publishedDates = JSON.parse(publishedStored) as string[]
    }
  } catch (error) {
    console.error("Failed to read published dates:", error)
  }

  const draft: Date[] = []
  const selling: Date[] = []

  draftMap.forEach((_, dateStr) => {
    const isSelling = publishedDates.includes(dateStr)
    const match = dateStr.match(/^(\d{4})\/(\d{2})\/(\d{2})/)
    if (!match) return
    const [, year, month, day] = match
    const d = new Date(Number(year), Number(month) - 1, Number(day))

    if (isSelling) {
      selling.push(d)
    } else {
      draft.push(d)
    }
  })

  return { draft, selling }
}
