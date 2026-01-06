/* eslint-disable import/prefer-default-export */
import sendAPI from "@/utils/sendAPI"
import { TicketAPIError } from "./types"
import type { ValidateTicketResponse, APIResponse, UnauthorizedError } from "./types"

/**
 * 執行驗票
 * @param ticketId 票券 ID
 * @returns 驗票結果訊息
 * @throws {TicketAPIError} 當 API 呼叫失敗時
 */
export const validateTicket = async (ticketId: number): Promise<ValidateTicketResponse> => {
  try {
    const response = await sendAPI(`/api/admin/tickets/${ticketId}/validate`, "POST")

    // 處理不同的 HTTP 狀態碼
    if (response.status === 400) {
      // 400: 票券狀態不允許驗票 (已使用/已過期/未支付)
      const errorData = (await response.json()) as UnauthorizedError | null
      throw new TicketAPIError(errorData?.detail || "票券狀態不允許驗票", 400, "VALIDATION_ERROR")
    }

    if (response.status === 401) {
      // 401: 未授權 (需登入)
      const errorData = (await response.json()) as UnauthorizedError | null
      throw new TicketAPIError(errorData?.detail || "未授權，請重新登入", 401, "UNAUTHORIZED")
    }

    if (response.status === 403) {
      // 403: 權限不足 (需 Admin 角色)
      const errorData = (await response.json()) as UnauthorizedError | null
      throw new TicketAPIError(errorData?.detail || "權限不足，需要 Admin 角色", 403, "FORBIDDEN")
    }

    if (response.status === 404) {
      // 404: 票券不存在
      const errorData = (await response.json()) as UnauthorizedError | null
      throw new TicketAPIError(errorData?.detail || "票券不存在", 404, "NOT_FOUND")
    }

    if (response.status === 500) {
      // 500: 伺服器內部錯誤
      const errorData = (await response.json()) as APIResponse<null>
      throw new TicketAPIError(errorData.message || "伺服器內部錯誤", 500, "SERVER_ERROR")
    }

    if (!response.ok) {
      throw new TicketAPIError(`HTTP error! status: ${response.status}`, response.status, "UNKNOWN")
    }

    // 200 OK: 驗票成功
    const result = (await response.json()) as ValidateTicketResponse

    return result
  } catch (error) {
    // 如果已經是 TicketAPIError，直接拋出
    if (error instanceof TicketAPIError) {
      throw error
    }

    // 其他錯誤（網路錯誤等）
    // eslint-disable-next-line no-console
    console.error("Failed to validate ticket:", error)
    throw new TicketAPIError(
      error instanceof Error ? error.message : "驗票時發生未知錯誤",
      undefined,
      "UNKNOWN"
    )
  }
}
