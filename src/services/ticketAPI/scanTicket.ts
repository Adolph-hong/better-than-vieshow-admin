/* eslint-disable import/prefer-default-export */
import sendAPI from "@/utils/sendAPI"
import { TicketAPIError } from "./types"
import type { ScanTicketResponse, APIResponse, UnauthorizedError } from "./types"

/**
 * 掃描票券 QR Code
 * @param qrCode QR Code 內容（票券編號）
 * @returns 票券詳細資訊
 * @throws {TicketAPIError} 當 API 呼叫失敗時
 */
export const scanTicket = async (qrCode: string): Promise<ScanTicketResponse> => {
  try {
    const response = await sendAPI(
      `/api/admin/tickets/scan?qrCode=${encodeURIComponent(qrCode)}`,
      "GET"
    )

    // 處理不同的 HTTP 狀態碼
    if (response.status === 400) {
      // 400: 無效的 QR Code 格式
      const errorData = (await response.json()) as UnauthorizedError | null
      throw new TicketAPIError(errorData?.detail || "無效的 QR Code 格式", 400, "VALIDATION_ERROR")
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

    // 200 OK: 成功取得票券資訊
    const result = (await response.json()) as APIResponse<ScanTicketResponse>

    // 檢查 API 回應的 success 欄位
    if (!result.success) {
      throw new TicketAPIError(result.message || "掃描票券失敗", response.status, "UNKNOWN")
    }

    // 確認 data 存在
    if (!result.data) {
      throw new TicketAPIError("成功但未回傳資料", response.status, "UNKNOWN")
    }

    return result.data
  } catch (error) {
    // 如果已經是 TicketAPIError，直接拋出
    if (error instanceof TicketAPIError) {
      throw error
    }

    // 其他錯誤（網路錯誤等）
    // eslint-disable-next-line no-console
    console.error("Failed to scan ticket:", error)
    throw new TicketAPIError(
      error instanceof Error ? error.message : "掃描票券時發生未知錯誤",
      undefined,
      "UNKNOWN"
    )
  }
}
