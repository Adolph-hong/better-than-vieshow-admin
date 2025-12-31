// 401 錯誤回應格式
export interface UnauthorizedError {
  detail: string | null
  instance: string | null
  status: number | null
  title: string | null
  type: string | null
  // 可能還有其他未知屬性
  [key: string]: unknown
}

// 400 錯誤回應格式（參數錯誤）
export interface ValidationError {
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

  errorType?: "UNAUTHORIZED" | "VALIDATION_ERROR" | "NOT_FOUND" | "SERVER_ERROR" | "UNKNOWN"

  constructor(
    message: string,
    statusCode?: number,
    errorType?: "UNAUTHORIZED" | "VALIDATION_ERROR" | "NOT_FOUND" | "SERVER_ERROR" | "UNKNOWN"
  ) {
    super(message)
    this.name = "TimelineAPIError"
    this.statusCode = statusCode
    this.errorType = errorType
  }
}
