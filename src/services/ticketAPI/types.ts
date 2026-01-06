// API 標準回應格式
export interface APIResponse<T> {
  success: boolean
  message: string | null
  data: T | null
  errors: unknown | null
}

// 401/403 錯誤回應格式
export interface UnauthorizedError {
  detail: string | null
  instance: string | null
  status: number | null
  title: string | null
  type: string | null
  // 可能還有其他未知屬性
  [key: string]: unknown
}

// 掃描票券回應資料結構
export interface ScanTicketResponse {
  ticketId: number
  ticketNumber: string | null
  status: string | null
  movieTitle: string | null
  posterUrl?: string | null
  showDate: string | null
  showTime: string | null
  seatRow: string | null
  seatColumn: number | null
  seatLabel: string | null
  theaterName: string | null
  theaterType: string | null
}

// 驗票回應資料結構
export interface ValidateTicketResponse {
  message: string
}

/**
 * 自訂錯誤類別
 */
export class TicketAPIError extends Error {
  statusCode?: number

  errorType?:
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "SERVER_ERROR"
    | "VALIDATION_ERROR"
    | "NOT_FOUND"
    | "UNKNOWN"

  constructor(
    message: string,
    statusCode?: number,
    errorType?:
      | "UNAUTHORIZED"
      | "FORBIDDEN"
      | "SERVER_ERROR"
      | "VALIDATION_ERROR"
      | "NOT_FOUND"
      | "UNKNOWN"
  ) {
    super(message)
    this.name = "TicketAPIError"
    this.statusCode = statusCode
    this.errorType = errorType
  }
}
