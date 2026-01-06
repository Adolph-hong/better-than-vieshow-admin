// 匯出所有類型
export type {
  APIResponse,
  UnauthorizedError,
  ScanTicketResponse,
  ValidateTicketResponse,
} from "./types"

// 匯出錯誤類別
export { TicketAPIError } from "./types"

// 匯出所有 API 函數
export { scanTicket } from "./scanTicket"
export { validateTicket } from "./validateTicket"
