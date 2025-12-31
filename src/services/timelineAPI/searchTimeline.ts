import sendAPI from "@/utils/sendAPI"
import { TimelineAPIError, type UnauthorizedError, type ValidationError } from "./types"

// 每日時刻表場次回應資料結構
export interface ShowtimeResponse {
  id: number
  movieId: number
  movieTitle: string
  movieDuration: number
  theaterId: number
  theaterName: string
  theaterType: string // "Digital", "4DX", "IMAX" 等
  showDate: string // ISO 8601 date-time 格式
  startTime: string // 格式: "10:00"
  endTime: string // 格式: "13:12"
  scheduleStatus: "OnSale" | "Draft"
  createdAt: string // ISO 8601 date-time 格式
}

// 每日時刻表回應資料結構
export interface DailyScheduleResponse {
  scheduleDate: string // ISO 8601 date-time 格式
  status: "OnSale" | "Draft"
  showtimes: ShowtimeResponse[]
  createdAt?: string // ISO 8601 date-time 格式
  updatedAt?: string // ISO 8601 date-time 格式
}

/**
 * 查詢每日時刻表
 * @param date 日期，格式: YYYY-MM-DD (例如: "2025-12-30")
 * @returns 每日時刻表資料
 * @throws {TimelineAPIError} 當 API 呼叫失敗時
 */
export const getDailySchedule = async (date: string): Promise<DailyScheduleResponse> => {
  try {
    // 驗證日期格式 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      throw new TimelineAPIError("日期格式錯誤，必須為 YYYY-MM-DD 格式", 400, "VALIDATION_ERROR")
    }

    const response = await sendAPI(`/api/admin/daily-schedules/${date}`, "GET")

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

    const result = (await response.json()) as DailyScheduleResponse

    return result
  } catch (error) {
    if (error instanceof TimelineAPIError) {
      throw error
    }
    // eslint-disable-next-line no-console
    console.error("Failed to get daily schedule:", error)
    throw new TimelineAPIError(
      error instanceof Error ? error.message : "查詢每日時刻表時發生未知錯誤",
      undefined,
      "UNKNOWN"
    )
  }
}
