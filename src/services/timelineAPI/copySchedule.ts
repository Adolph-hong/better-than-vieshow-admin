import sendAPI from "@/utils/sendAPI"
import { TimelineAPIError, type UnauthorizedError, type ValidationError } from "./types"
import type { DailyScheduleResponse } from "./searchTimeline"

/**
 * 複製時刻表請求資料結構
 */
export interface CopyScheduleRequest {
  targetDate: string // 格式: YYYY-MM-DD
}

/**
 * 複製時刻表回應資料結構
 */
export interface CopyScheduleResponse {
  sourceDate: string // ISO 8601 date-time format
  targetDate: string // ISO 8601 date-time format
  copiedCount: number // 成功複製的場次數量
  skippedCount: number // 被略過的場次數量（因電影檔期問題）
  message: string | null // 提示訊息（如：部分場次因電影檔期已過期未複製）
  targetSchedule: DailyScheduleResponse // 目標日期的時刻表
}

/**
 * 複製時刻表（將指定來源日期的時刻表複製到目標日期）
 * @param sourceDate 來源日期，格式: YYYY-MM-DD (例如: "2025-12-22")
 * @param targetDate 目標日期，格式: YYYY-MM-DD (例如: "2025-12-25")
 * @returns 複製結果，包含複製的場次數量和目標日期的時刻表
 * @throws {TimelineAPIError} 當 API 呼叫失敗時
 */
const copyDailySchedule = async (
  sourceDate: string,
  targetDate: string
): Promise<CopyScheduleResponse> => {
  try {
    // 驗證日期格式 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(sourceDate)) {
      throw new TimelineAPIError(
        "來源日期格式錯誤，必須為 YYYY-MM-DD 格式",
        400,
        "VALIDATION_ERROR"
      )
    }
    if (!dateRegex.test(targetDate)) {
      throw new TimelineAPIError(
        "目標日期格式錯誤，必須為 YYYY-MM-DD 格式",
        400,
        "VALIDATION_ERROR"
      )
    }

    const requestBody: CopyScheduleRequest = {
      targetDate,
    }

    const response = await sendAPI(
      `/api/admin/daily-schedules/${sourceDate}/copy`,
      "POST",
      requestBody
    )

    // 處理不同的 HTTP 狀態碼
    if (response.status === 400) {
      const errorData = (await response.json()) as ValidationError
      throw new TimelineAPIError(
        errorData.detail || "參數錯誤（來源時刻表狀態不是 OnSale、目標時刻表狀態不是 Draft 等）",
        400,
        "VALIDATION_ERROR"
      )
    }

    if (response.status === 401) {
      const errorData = (await response.json()) as UnauthorizedError
      throw new TimelineAPIError(errorData.detail || "未授權，請重新登入", 401, "UNAUTHORIZED")
    }

    if (response.status === 404) {
      const errorData = (await response.json()) as UnauthorizedError
      throw new TimelineAPIError(errorData.detail || "來源日期沒有時刻表記錄", 404, "NOT_FOUND")
    }

    if (!response.ok) {
      throw new TimelineAPIError(
        `HTTP error! status: ${response.status}`,
        response.status,
        "UNKNOWN"
      )
    }

    const result = (await response.json()) as CopyScheduleResponse

    return result
  } catch (error) {
    if (error instanceof TimelineAPIError) {
      throw error
    }
    // eslint-disable-next-line no-console
    console.error("Failed to copy daily schedule:", error)
    throw new TimelineAPIError(
      error instanceof Error ? error.message : "複製時刻表時發生未知錯誤",
      undefined,
      "UNKNOWN"
    )
  }
}

export default copyDailySchedule
