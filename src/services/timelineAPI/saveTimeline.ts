import sendAPI from "@/utils/sendAPI"
import { TimelineAPIError, type UnauthorizedError, type ValidationError } from "./types"
import type { DailyScheduleResponse } from "./searchTimeline"

// 儲存每日時刻表請求資料結構
export interface ShowtimeItem {
  movieId: number
  theaterId: number
  startTime: string // 格式: "09:30", "14:00" 等，必須是 15 分鐘的倍數
}

export interface SaveDailyScheduleRequest {
  showtimes: ShowtimeItem[]
}

/**
 * 儲存每日時刻表
 * @param date 日期，格式: YYYY-MM-DD (例如: "2025-12-30")
 * @param showtimes 場次清單
 * @returns 每日時刻表資料
 * @throws {TimelineAPIError} 當 API 呼叫失敗時
 */
export const saveDailySchedule = async (
  date: string,
  showtimes: ShowtimeItem[]
): Promise<DailyScheduleResponse> => {
  try {
    // 驗證日期格式 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      throw new TimelineAPIError("日期格式錯誤，必須為 YYYY-MM-DD 格式", 400, "VALIDATION_ERROR")
    }

    const requestBody: SaveDailyScheduleRequest = {
      showtimes,
    }

    const response = await sendAPI(`/api/admin/daily-schedules/${date}`, "PUT", requestBody)

    // 處理不同的 HTTP 狀態碼
    if (response.status === 400) {
      const errorData = (await response.json()) as ValidationError
      throw new TimelineAPIError(
        errorData.detail || "參數錯誤 (電影/影廳不存在、時間格式錯誤等)",
        400,
        "VALIDATION_ERROR"
      )
    }

    if (response.status === 401) {
      const errorData = (await response.json()) as UnauthorizedError
      throw new TimelineAPIError(errorData.detail || "未授權，請重新登入", 401, "UNAUTHORIZED")
    }

    if (response.status === 403) {
      const errorData = (await response.json()) as UnauthorizedError
      throw new TimelineAPIError(
        errorData.detail || "該日期已開始販售，無法修改",
        403,
        "UNAUTHORIZED"
      )
    }

    if (response.status === 409) {
      const errorData = (await response.json()) as UnauthorizedError
      throw new TimelineAPIError(errorData.detail || "場次時間衝突", 409, "VALIDATION_ERROR")
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
    console.error("Failed to save daily schedule:", error)
    throw new TimelineAPIError(
      error instanceof Error ? error.message : "儲存每日時刻表時發生未知錯誤",
      undefined,
      "UNKNOWN"
    )
  }
}
