/* eslint-disable import/prefer-default-export */
import sendAPI from "@/utils/sendAPI"
import { MovieAPIError, convertMovieFromAPI } from "./types"
import type { MovieItem, MovieFromAPI, APIResponse, UnauthorizedError } from "./types"

/**
 * 取得管理員電影列表
 * @returns 電影資料列表
 * @throws {MovieAPIError} 當 API 呼叫失敗時
 */
export const fetchMovies = async (): Promise<MovieItem[]> => {
  try {
    const response = await sendAPI("/api/admin/movies", "GET")

    // 處理不同的 HTTP 狀態碼
    if (response.status === 401) {
      const errorData = (await response.json()) as UnauthorizedError
      throw new MovieAPIError(errorData.detail || "未授權，請重新登入", 401, "UNAUTHORIZED")
    }

    if (response.status === 403) {
      const errorData = (await response.json()) as UnauthorizedError
      throw new MovieAPIError(errorData.detail || "權限不足，需要 Admin 角色", 403, "FORBIDDEN")
    }

    if (response.status === 500) {
      // 500 錯誤也使用標準 API 回應格式
      const errorData = (await response.json()) as APIResponse<MovieFromAPI[]>
      throw new MovieAPIError(errorData.message || "伺服器內部錯誤", 500, "SERVER_ERROR")
    }

    if (!response.ok) {
      throw new MovieAPIError(`HTTP error! status: ${response.status}`, response.status, "UNKNOWN")
    }

    const result = (await response.json()) as APIResponse<MovieFromAPI[]>

    // 檢查 API 回應的 success 欄位
    if (!result.success) {
      throw new MovieAPIError(result.message || "取得電影列表失敗", response.status, "UNKNOWN")
    }

    // 確認 data 是陣列（data 可能是 null）
    const movies = Array.isArray(result.data) ? result.data : []

    // 轉換為前端格式
    return movies.map(convertMovieFromAPI)
  } catch (error) {
    // 如果已經是 MovieAPIError，直接拋出
    if (error instanceof MovieAPIError) {
      throw error
    }

    // 其他錯誤（網路錯誤等）
    // eslint-disable-next-line no-console
    console.error("Failed to fetch movies:", error)
    throw new MovieAPIError(
      error instanceof Error ? error.message : "取得電影列表時發生未知錯誤",
      undefined,
      "UNKNOWN"
    )
  }
}
