/* eslint-disable import/prefer-default-export */
import sendAPI from "@/utils/sendAPI"
import { MovieAPIError } from "./types"
import type { SchedulableMovieDto, APIResponse, UnauthorizedError } from "./types"

/**
 * 取得可排程電影列表（用於時刻表編輯）
 * @param date 查詢日期 (YYYY-MM-DD)
 * @returns 可排程電影列表
 * @throws {MovieAPIError} 當 API 呼叫失敗時
 */
export const getSchedulableMovies = async (date: string): Promise<SchedulableMovieDto[]> => {
  try {
    const response = await sendAPI(`/api/admin/movies/schedulable?date=${date}`, "GET")

    // 處理不同的 HTTP 狀態碼
    if (response.status === 400) {
      // 400: 日期格式錯誤
      const errorData = (await response.json()) as UnauthorizedError | null
      throw new MovieAPIError(
        errorData?.detail || "日期格式錯誤，請使用 YYYY-MM-DD 格式",
        400,
        "VALIDATION_ERROR"
      )
    }

    if (response.status === 401) {
      // 401: 未授權 (需登入)
      const errorData = (await response.json()) as UnauthorizedError | null
      throw new MovieAPIError(errorData?.detail || "未授權，請重新登入", 401, "UNAUTHORIZED")
    }

    if (response.status === 403) {
      // 403: 權限不足 (需 Admin 角色)
      const errorData = (await response.json()) as UnauthorizedError | null
      throw new MovieAPIError(errorData?.detail || "權限不足，需要 Admin 角色", 403, "FORBIDDEN")
    }

    if (response.status === 500) {
      // 500: 伺服器內部錯誤
      const errorData = (await response.json()) as APIResponse<null>
      throw new MovieAPIError(errorData.message || "伺服器內部錯誤", 500, "SERVER_ERROR")
    }

    if (!response.ok) {
      throw new MovieAPIError(`HTTP error! status: ${response.status}`, response.status, "UNKNOWN")
    }

    // 200 OK: 成功取得列表
    const result = (await response.json()) as APIResponse<SchedulableMovieDto[]>

    // 檢查 API 回應的 success 欄位
    if (!result.success) {
      throw new MovieAPIError(
        result.message || "取得可排程電影列表失敗",
        response.status,
        "UNKNOWN"
      )
    }

    // 確認 data 存在
    if (!result.data) {
      return []
    }

    return result.data
  } catch (error) {
    // 如果已經是 MovieAPIError，直接拋出
    if (error instanceof MovieAPIError) {
      throw error
    }

    // 其他錯誤（網路錯誤等）
    // eslint-disable-next-line no-console
    console.error("Failed to get schedulable movies:", error)
    throw new MovieAPIError(
      error instanceof Error ? error.message : "取得可排程電影列表時發生未知錯誤",
      undefined,
      "UNKNOWN"
    )
  }
}
