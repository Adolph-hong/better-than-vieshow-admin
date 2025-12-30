import sendAPI from "@/utils/sendAPI"

// API 標準回應格式
interface APIResponse<T> {
  success: boolean
  message: string | null
  data: T | null
  errors: unknown | null
}

// 401 錯誤回應格式
interface UnauthorizedError {
  detail: string | null
  instance: string | null
  status: number | null
  title: string | null
  type: string | null
  // 可能還有其他未知屬性
  [key: string]: unknown
}

// 400 錯誤回應格式（參數錯誤）
interface ValidationError {
  type: string | null
  title: string | null
  status: number | null
  detail: string | null
  instance: string | null
  [key: string]: unknown
}

/**
 * 自訂錯誤類別
 */
export class TimelineAPIError extends Error {
  statusCode?: number

  errorType?: "UNAUTHORIZED" | "VALIDATION_ERROR" | "SERVER_ERROR" | "UNKNOWN"

  constructor(
    message: string,
    statusCode?: number,
    errorType?: "UNAUTHORIZED" | "VALIDATION_ERROR" | "SERVER_ERROR" | "UNKNOWN"
  ) {
    super(message)
    this.name = "TimelineAPIError"
    this.statusCode = statusCode
    this.errorType = errorType
  }
}

// 月曆概覽回應資料結構
export interface DailyScheduleStatus {
  date: string // 格式: "2025-12-01"
  status: "OnSale" | "Draft"
}

export interface MonthOverviewResponse {
  year: number
  month: number
  dates: DailyScheduleStatus[]
}

/**
 * 獲取月曆概覽
 * @param year 年份 (例如: 2025)
 * @param month 月份 (1-12)
 * @returns 月曆概覽資料
 * @throws {TimelineAPIError} 當 API 呼叫失敗時
 */
export const getMonthOverview = async (
  year: number,
  month: number
): Promise<MonthOverviewResponse> => {
  try {
    // 驗證參數
    if (year < 1900 || year > 2100) {
      throw new TimelineAPIError("年份不合法", 400, "VALIDATION_ERROR")
    }
    if (month < 1 || month > 12) {
      throw new TimelineAPIError("月份不合法，必須在 1-12 之間", 400, "VALIDATION_ERROR")
    }

    const response = await sendAPI(
      `/api/admin/daily-schedules/month-overview?year=${year}&month=${month}`,
      "GET"
    )

    // 處理不同的 HTTP 狀態碼
    if (response.status === 400) {
      const errorData = (await response.json()) as ValidationError
      throw new TimelineAPIError(
        errorData.detail || "參數錯誤 (年份或月份不合法)",
        400,
        "VALIDATION_ERROR"
      )
    }

    if (response.status === 401) {
      const errorData = (await response.json()) as UnauthorizedError
      throw new TimelineAPIError(errorData.detail || "未授權，請重新登入", 401, "UNAUTHORIZED")
    }

    if (!response.ok) {
      throw new TimelineAPIError(
        `HTTP error! status: ${response.status}`,
        response.status,
        "UNKNOWN"
      )
    }

    const result = (await response.json()) as MonthOverviewResponse

    return result
  } catch (error) {
    if (error instanceof TimelineAPIError) {
      throw error
    }
    // eslint-disable-next-line no-console
    console.error("Failed to get month overview:", error)
    throw new TimelineAPIError(
      error instanceof Error ? error.message : "獲取月曆概覽時發生未知錯誤",
      undefined,
      "UNKNOWN"
    )
  }
}
