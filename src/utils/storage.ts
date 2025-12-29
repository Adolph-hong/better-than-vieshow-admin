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
  filmType?: string
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

// 過濾掉下映日已過的電影（僅用於顯示，不刪除資料）
export const filterExpiredMoviesForDisplay = (movies: Movie[]): Movie[] => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return movies.filter((movie) => {
    if (!movie.endAt) {
      // 如果沒有下映日，保留
      return true
    }

    // 解析下映日
    const endDate = new Date(movie.endAt)
    endDate.setHours(0, 0, 0, 0)

    // 如果下映日小於今天（已過），過濾掉（不顯示）
    return endDate >= today
  })
}

// 開發環境：從 LocalStorage 讀取，如果為空則從 db.json 初始化
// 生產環境：從 LocalStorage 讀取，如果為空則從 db.json 初始化
export const getMovies = (): Movie[] => {
  try {
    // 確保 moviesData 存在
    if (!moviesData) {
      return []
    }

    const data = moviesData as MoviesData
    const moviesFromJson = Array.isArray(data.movies) ? data.movies : []

    // 優先從 LocalStorage 讀取
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MOVIES)
      if (stored) {
        const parsed = JSON.parse(stored) as Movie[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          // 返回所有電影資料（不過濾，保留後端資料）
          return parsed
        }
      }

      // 如果 LocalStorage 為空或無效，從 db.json 初始化
      if (moviesFromJson.length > 0) {
        // 儲存所有電影資料（不過濾）
        localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(moviesFromJson))
        localStorage.setItem(STORAGE_KEYS.VERSION, DATA_VERSION)
        return moviesFromJson
      }
      return moviesFromJson
    } catch {
      // 如果讀取失敗，回退到 db.json（保留所有資料）
      return moviesFromJson
    }
  } catch {
    return []
  }
}

// 儲存電影資料（寫入 LocalStorage）
export const saveMovies = (movies: Movie[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(movies))
  } catch {
    // 靜默失敗即可，避免中斷流程
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
  } catch {
    // 讀取失敗時，回傳空陣列即可
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
    return
  }

  try {
    const key = `${STORAGE_KEYS.SCHEDULES}-${date}`
    localStorage.setItem(key, JSON.stringify(schedules))
  } catch {
    // 靜默失敗即可
  }
}

// 從 formattedDate 儲存排程
export const saveSchedulesByFormattedDate = <T>(schedules: T[], formattedDate: string): void => {
  const date = parseDateFromFormatted(formattedDate)
  saveSchedules(schedules, date)
}

// 複製時刻表：從來源日期複製到目標日期
export const copySchedules = (sourceDate: string, targetDate: string): boolean => {
  // sourceDate 和 targetDate 格式都是 "yyyy/MM/dd"
  if (!sourceDate || !targetDate) {
    return false
  }

  try {
    // 讀取來源日期的排程
    const sourceKey = `${STORAGE_KEYS.SCHEDULES}-${sourceDate}`
    const sourceStored = localStorage.getItem(sourceKey)
    if (!sourceStored) {
      return false
    }

    // 解析並複製排程
    const schedules = JSON.parse(sourceStored) as unknown[]

    // 儲存到目標日期
    const targetKey = `${STORAGE_KEYS.SCHEDULES}-${targetDate}`
    localStorage.setItem(targetKey, JSON.stringify(schedules))

    return true
  } catch {
    return false
  }
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
  } catch {
    // 若讀取失敗，一律視為沒有草稿
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
  } catch {
    // 標記失敗時忽略，不中斷流程
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
  } catch {
    // 檢查失敗時，一律視為未販售
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
      } catch {
        // 單一日期讀取失敗時略過即可
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
  } catch {
    // 讀取失敗時，視為目前沒有已販售日期
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
