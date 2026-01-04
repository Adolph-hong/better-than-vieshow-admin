import sendAPI from "@/utils/sendAPI"

// API 回應的電影資料結構 (MovieListItemDto)
export interface MovieFromAPI {
  id: number
  title: string
  posterUrl: string | null
  duration: number
  rating: string
  releaseDate: string
  endDate: string
  status: string
}

// 建立/更新電影的請求資料結構
export interface CreateMovieRequest {
  title: string
  description: string
  duration: number
  genre: string // 多個以逗號分隔，英文代碼：Action, Adventure, SciFi, Comedy, Drama, Horror, Animation, Romance, Thriller
  rating: string // 英文代碼：G, P, PG, R
  director: string
  cast: string
  posterUrl: string
  trailerUrl: string
  releaseDate: string // ISO 8601 date-time 格式
  endDate: string // ISO 8601 date-time 格式
  canCarousel: boolean
}

// 更新電影的請求資料結構（與建立相同）
export type UpdateMovieRequest = CreateMovieRequest

// 可排程電影的資料結構（用於時刻表編輯）
export interface SchedulableMovieDto {
  id: number
  title: string | null
  posterUrl: string | null
  duration: number
  genre: string | null
}

// 建立電影成功後的回應資料結構
export interface CreateMovieResponse {
  id: number
  title: string
  description: string
  duration: number
  genre: string
  rating: string
  director: string
  cast: string
  posterUrl: string | null
  trailerUrl: string | null
  releaseDate: string
  endDate: string
  canCarousel: boolean
  createdAt: string
}

// API 標準回應格式 (用於 200 和 500)
interface APIResponse<T> {
  success: boolean
  message: string | null
  data: T | null
  errors: unknown | null
}

// 401/403 錯誤回應格式
interface UnauthorizedError {
  detail: string | null
  instance: string | null
  status: number | null
  title: string | null
  type: string | null
  // 可能還有其他未知屬性
  [key: string]: unknown
}

// 轉換 API 電影資料為前端使用的格式
export interface MovieItem {
  id: string
  movieName: string
  duration: string
  category: string
  director: string
  actors: string
  describe: string
  trailerLink: string
  poster: string | null
  startAt: string
  endAt: string
  createdAt: string
}

// 轉換函數：將 API 的電影格式轉換為前端格式
const convertMovieFromAPI = (movie: MovieFromAPI): MovieItem => {
  return {
    id: String(movie.id),
    movieName: movie.title,
    duration: String(movie.duration),
    category: movie.rating || "G", // rating 對應到 category
    director: "", // API 沒有提供，留空
    actors: "", // API 沒有提供，留空
    describe: "", // API 沒有提供，留空
    trailerLink: "", // API 沒有提供，留空
    poster: movie.posterUrl || null,
    startAt: movie.releaseDate,
    endAt: movie.endDate,
    createdAt: movie.releaseDate, // 沒有 createdAt，用 releaseDate
  }
}

/**
 * 自訂錯誤類別
 */
export class MovieAPIError extends Error {
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
    this.name = "MovieAPIError"
    this.statusCode = statusCode
    this.errorType = errorType
  }
}

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

/**
 * 建立新電影
 * @param movieData 電影資料
 * @returns 建立成功的電影資料
 * @throws {MovieAPIError} 當 API 呼叫失敗時
 */
export const createMovie = async (movieData: CreateMovieRequest): Promise<CreateMovieResponse> => {
  try {
    const response = await sendAPI("/api/admin/movies", "POST", movieData)

    // 處理不同的 HTTP 狀態碼
    if (response.status === 400) {
      // 400: 欄位驗證失敗或日期邏輯錯誤
      // 使用標準 API 回應格式，success 應該是 false
      const errorData = (await response.json()) as APIResponse<null>
      throw new MovieAPIError(
        errorData.message || "欄位驗證失敗或日期邏輯錯誤",
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
      // 使用標準 API 回應格式
      const errorData = (await response.json()) as APIResponse<null>
      throw new MovieAPIError(errorData.message || "伺服器內部錯誤", 500, "SERVER_ERROR")
    }

    if (!response.ok) {
      throw new MovieAPIError(`HTTP error! status: ${response.status}`, response.status, "UNKNOWN")
    }

    // 201 Created: 成功建立電影
    const result = (await response.json()) as APIResponse<CreateMovieResponse>

    // 檢查 API 回應的 success 欄位
    if (!result.success) {
      throw new MovieAPIError(result.message || "建立電影失敗", response.status, "UNKNOWN")
    }

    // 確認 data 存在
    if (!result.data) {
      throw new MovieAPIError("建立電影成功，但未回傳資料", response.status, "UNKNOWN")
    }

    return result.data
  } catch (error) {
    // 如果已經是 MovieAPIError，直接拋出
    if (error instanceof MovieAPIError) {
      throw error
    }

    // 其他錯誤（網路錯誤等）
    // eslint-disable-next-line no-console
    console.error("Failed to create movie:", error)
    throw new MovieAPIError(
      error instanceof Error ? error.message : "建立電影時發生未知錯誤",
      undefined,
      "UNKNOWN"
    )
  }
}

/**
 * 取得單一電影詳情
 * @param id 電影 ID
 * @returns 電影詳細資料
 * @throws {MovieAPIError} 當 API 呼叫失敗時
 */
export const getMovieById = async (id: number): Promise<CreateMovieResponse> => {
  try {
    const response = await sendAPI(`/api/admin/movies/${id}`, "GET")

    // 處理不同的 HTTP 狀態碼
    if (response.status === 404) {
      // 404: 找不到指定的電影
      const errorData = (await response.json()) as APIResponse<null>
      throw new MovieAPIError(errorData.message || "找不到指定的電影", 404, "NOT_FOUND")
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

    // 200 OK: 成功取得電影詳情
    const result = (await response.json()) as APIResponse<CreateMovieResponse>

    // 檢查 API 回應的 success 欄位
    if (!result.success) {
      throw new MovieAPIError(result.message || "取得電影詳情失敗", response.status, "UNKNOWN")
    }

    // 確認 data 存在
    if (!result.data) {
      throw new MovieAPIError("成功但未回傳資料", response.status, "UNKNOWN")
    }

    return result.data
  } catch (error) {
    // 如果已經是 MovieAPIError，直接拋出
    if (error instanceof MovieAPIError) {
      throw error
    }

    // 其他錯誤（網路錯誤等）
    // eslint-disable-next-line no-console
    console.error("Failed to get movie by id:", error)
    throw new MovieAPIError(
      error instanceof Error ? error.message : "取得電影詳情時發生未知錯誤",
      undefined,
      "UNKNOWN"
    )
  }
}

/**
 * 更新電影資訊
 * @param id 電影 ID
 * @param movieData 電影資料
 * @returns 更新後的電影資料
 * @throws {MovieAPIError} 當 API 呼叫失敗時
 */
export const updateMovie = async (
  id: number,
  movieData: UpdateMovieRequest
): Promise<CreateMovieResponse> => {
  try {
    const response = await sendAPI(`/api/admin/movies/${id}`, "PUT", movieData)

    // 處理不同的 HTTP 狀態碼
    if (response.status === 400) {
      // 400: 欄位驗證失敗或日期邏輯錯誤
      const errorData = (await response.json()) as APIResponse<null>
      throw new MovieAPIError(
        errorData.message || "欄位驗證失敗或日期邏輯錯誤",
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

    if (response.status === 404) {
      // 404: 找不到指定的電影
      const errorData = (await response.json()) as APIResponse<null>
      throw new MovieAPIError(errorData.message || "找不到指定的電影", 404, "NOT_FOUND")
    }

    if (response.status === 500) {
      // 500: 伺服器內部錯誤
      const errorData = (await response.json()) as APIResponse<null>
      throw new MovieAPIError(errorData.message || "伺服器內部錯誤", 500, "SERVER_ERROR")
    }

    if (!response.ok) {
      throw new MovieAPIError(`HTTP error! status: ${response.status}`, response.status, "UNKNOWN")
    }

    // 200 OK: 成功更新電影
    const result = (await response.json()) as APIResponse<CreateMovieResponse>

    // 檢查 API 回應的 success 欄位
    if (!result.success) {
      throw new MovieAPIError(result.message || "更新電影失敗", response.status, "UNKNOWN")
    }

    // 確認 data 存在
    if (!result.data) {
      throw new MovieAPIError("更新成功但未回傳資料", response.status, "UNKNOWN")
    }

    return result.data
  } catch (error) {
    // 如果已經是 MovieAPIError，直接拋出
    if (error instanceof MovieAPIError) {
      throw error
    }

    // 其他錯誤（網路錯誤等）
    // eslint-disable-next-line no-console
    console.error("Failed to update movie:", error)
    throw new MovieAPIError(
      error instanceof Error ? error.message : "更新電影時發生未知錯誤",
      undefined,
      "UNKNOWN"
    )
  }
}

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
