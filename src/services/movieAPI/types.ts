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
export const convertMovieFromAPI = (movie: MovieFromAPI): MovieItem => {
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
