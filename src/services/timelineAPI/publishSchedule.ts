import sendAPI from "@/utils/sendAPI"
import { TimelineAPIError, type UnauthorizedError, type ValidationError } from "./types"
import type { DailyScheduleResponse } from "./searchTimeline"

/**
 * 開始販售時刻表（將狀態從 Draft 轉為 OnSale）
 * @param date 日期，格式: YYYY-MM-DD (例如: "2025-12-30")
 * @returns 每日時刻表資料
 * @throws {TimelineAPIError} 當 API 呼叫失敗時
 */
const publishDailySchedule = async (date: string): Promise<DailyScheduleResponse> => {
  try {
    // 驗證日期格式 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      throw new TimelineAPIError("日期格式錯誤，必須為 YYYY-MM-DD 格式", 400, "VALIDATION_ERROR")
    }

    const response = await sendAPI(`/api/admin/daily-schedules/${date}/publish`, "POST")

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
    console.error("Failed to publish daily schedule:", error)
    throw new TimelineAPIError(
      error instanceof Error ? error.message : "開始販售時刻表時發生未知錯誤",
      undefined,
      "UNKNOWN"
    )
  }
}

export default publishDailySchedule
