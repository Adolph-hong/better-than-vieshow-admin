import sendAPI from "@/utils/sendAPI"
import { TimelineAPIError, type UnauthorizedError, type ValidationError } from "./types"

// 場次資料結構
export interface GroupedShowtimeItem {
  id: number
  theaterId: number
  theaterName: string
  startTime: string // 格式: "09:00"
  endTime: string // 格式: "11:53"
}

// 影廳類型分組資料結構
export interface TheaterTypeGroup {
  theaterType: string | null // "Digital", "4DX", "IMAX" 等
  theaterTypeDisplay: string | null // 中文顯示： "數位", "4DX", "IMAX"
  timeRange: string | null // 時間範圍，例如: "09:00 09:45"
  showtimes: GroupedShowtimeItem[]
}

// 電影場次分組資料結構
export interface MovieShowtimeGroup {
  movieId: number
  movieTitle: string | null
  posterUrl: string | null
  rating: string | null // "G", "P", "PG", "R"
  ratingDisplay: string | null // "0+", "12+", "18+" 等
  duration: number
  durationDisplay: string | null // "2 小時 23 分鐘"
  theaterTypeGroups: TheaterTypeGroup[]
}

// 分組時刻表回應資料結構
export interface GroupedScheduleResponse {
  scheduleDate: string // ISO 8601 date-time 格式
  status: "OnSale" | "Draft" | null
  movieShowtimes: MovieShowtimeGroup[]
}

/**
 * 取得分組時刻表（用於側邊欄顯示）
 * @param date 日期，格式: YYYY-MM-DD (例如: "2025-12-30")
 * @returns 分組時刻表資料
 * @throws {TimelineAPIError} 當 API 呼叫失敗時
 */
export const getGroupedSchedule = async (date: string): Promise<GroupedScheduleResponse> => {
  try {
    // 驗證日期格式 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      throw new TimelineAPIError("日期格式錯誤，必須為 YYYY-MM-DD 格式", 400, "VALIDATION_ERROR")
    }

    const response = await sendAPI(`/api/admin/daily-schedules/${date}/grouped`, "GET")

    // 處理不同的 HTTP 狀態碼
    if (response.status === 400) {
      const errorData = (await response.json()) as ValidationError
      throw new TimelineAPIError(errorData.detail || "日期格式錯誤", 400, "VALIDATION_ERROR")
    }

    if (response.status === 401) {
      const errorData = (await response.json()) as UnauthorizedError
      throw new TimelineAPIError(errorData.detail || "未授權，請重新登入", 401, "UNAUTHORIZED")
    }

    if (response.status === 404) {
      const errorData = (await response.json()) as UnauthorizedError
      throw new TimelineAPIError(errorData.detail || "該日期沒有時刻表記錄", 404, "NOT_FOUND")
    }

    if (!response.ok) {
      throw new TimelineAPIError(
        `HTTP error! status: ${response.status}`,
        response.status,
        "UNKNOWN"
      )
    }

    const result = (await response.json()) as GroupedScheduleResponse

    return result
  } catch (error) {
    if (error instanceof TimelineAPIError) {
      throw error
    }
    // eslint-disable-next-line no-console
    console.error("Failed to get grouped schedule:", error)
    throw new TimelineAPIError(
      error instanceof Error ? error.message : "查詢分組時刻表時發生未知錯誤",
      undefined,
      "UNKNOWN"
    )
  }
}
