import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { uploadImageToCloudinary } from "@/utils/cloudinary"
import {
  createMovie,
  getMovieById,
  updateMovie,
  type CreateMovieRequest,
  MovieAPIError,
} from "@/services/movieAPI"

export interface MovieFormValues {
  movieName: string
  filmType: string
  duration: string
  category: string
  director: string
  actors: string
  describe: string
  trailerLink: string
  poster: File | null
  startAt: string
  endAt: string
}

// 影片類型映射：中文 → 英文代碼
const genreMapping: Record<string, string> = {
  動作: "Action",
  愛情: "Romance",
  冒險: "Adventure",
  懸疑: "Thriller",
  恐怖: "Horror",
  科幻: "SciFi",
  日本動漫: "Animation",
  喜劇: "Comedy",
}

// 將中文類型轉換為英文代碼
const convertGenreToEnglish = (chineseGenres: string): string => {
  if (!chineseGenres) return ""
  return chineseGenres
    .split(",")
    .map((genre) => genre.trim())
    .map((genre) => genreMapping[genre] || genre)
    .filter(Boolean)
    .join(",")
}

// 將英文代碼轉換為中文類型（用於編輯模式載入資料）
const convertGenreToChinese = (englishGenres: string): string => {
  if (!englishGenres) return ""
  const reverseMapping = Object.fromEntries(
    Object.entries(genreMapping).map(([chinese, english]) => [english, chinese])
  )
  return englishGenres
    .split(",")
    .map((genre) => genre.trim())
    .map((genre) => reverseMapping[genre] || genre)
    .filter(Boolean)
    .join(",")
}

// Rating 映射：前端值 → API 值
const ratingMapping: Record<string, string> = {
  G: "G",
  "PG-12": "PG", // 前端使用 PG-12，API 使用 PG
  "R-18": "R", // 前端使用 R-18，API 使用 R
}

// 將前端 rating 值轉換為 API 格式
const convertRatingToAPI = (frontendRating: string): string => {
  return ratingMapping[frontendRating] || frontendRating
}

// 將 API rating 值轉換為前端格式（用於編輯模式載入資料）
const convertRatingFromAPI = (apiRating: string): string => {
  const reverseMapping: Record<string, string> = {
    G: "G",
    PG: "PG-12", // API 使用 PG，前端使用 PG-12
    R: "R-18", // API 使用 R，前端使用 R-18
  }
  return reverseMapping[apiRating] || apiRating
}

export const useMovieForm = (movieId?: string) => {
  const navigate = useNavigate()
  const isEditMode = !!movieId
  const [originalPosterUrl, setOriginalPosterUrl] = useState<string | null>(null)

  const form = useForm<MovieFormValues>({
    defaultValues: {
      movieName: "",
      filmType: "",
      duration: "",
      category: "",
      director: "",
      actors: "",
      describe: "",
      trailerLink: "",
      poster: null,
      startAt: "",
      endAt: "",
    },
  })

  useEffect(() => {
    if (!isEditMode || !movieId) return

    const loadMovie = async () => {
      try {
        const movie = await getMovieById(Number(movieId))

        setOriginalPosterUrl(movie.posterUrl || null)
        form.reset({
          movieName: movie.title || "",
          filmType: convertGenreToChinese(movie.genre || ""), // 將 API 的 genre 轉換為中文
          duration: String(movie.duration || ""),
          category: convertRatingFromAPI(movie.rating || ""), // 將 API 的 rating 轉換為前端格式
          director: movie.director || "",
          actors: movie.cast || "",
          describe: movie.description || "",
          trailerLink: movie.trailerUrl || "",
          poster: null,
          startAt: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split("T")[0] : "",
          endAt: movie.endDate ? new Date(movie.endDate).toISOString().split("T")[0] : "",
        })
      } catch (error) {
        if (error instanceof MovieAPIError) {
          if (error.errorType === "NOT_FOUND") {
            alert("找不到指定的電影")
          } else if (error.errorType === "UNAUTHORIZED") {
            alert("未授權，請重新登入")
          } else {
            alert(`載入電影資料失敗：${error.message}`)
          }
        } else {
          alert("載入電影資料失敗，請稍後再試")
        }
        navigate("/movies")
      }
    }

    loadMovie()
  }, [movieId, isEditMode, form, navigate])

  const validateForm = (data: MovieFormValues, directorTags: string[], actorTags: string[]) => {
    const directorValue = directorTags.join(",")
    const actorValue = actorTags.join(",")
    const formData = { ...data, director: directorValue, actors: actorValue }

    if (formData.duration) {
      const durationPattern = /^[1-9]\d*$/
      if (!durationPattern.test(formData.duration)) {
        alert("片長只能輸入數字，且不能以0開頭")
        return false
      }
    }

    if (formData.trailerLink) {
      const trimmedLink = formData.trailerLink.trim()
      if (!trimmedLink.startsWith("http://") && !trimmedLink.startsWith("https://")) {
        alert("預告片連結必須以 http:// 或 https:// 開頭")
        return false
      }
      try {
        const url = new URL(trimmedLink)
        if (url.protocol !== "https:" && url.protocol !== "http:") {
          alert("預告片連結必須以 http:// 或 https:// 開頭")
          return false
        }
      } catch {
        alert("請輸入有效的網址")
        return false
      }
    }

    if (!isEditMode) {
      const requiredFields = [
        { key: "movieName", value: data.movieName },
        { key: "filmType", value: data.filmType },
        { key: "duration", value: data.duration },
        { key: "category", value: data.category },
        { key: "director", value: data.director },
        { key: "actors", value: data.actors },
        { key: "describe", value: data.describe },
        { key: "trailerLink", value: data.trailerLink },
        { key: "poster", value: data.poster },
        { key: "startAt", value: data.startAt },
        { key: "endAt", value: data.endAt },
      ]

      const emptyFields = requiredFields.filter((field) => {
        const { key, value: fieldValue } = field
        let value = fieldValue
        if (key === "director") {
          value = formData.director
        } else if (key === "actors") {
          value = formData.actors
        }
        if (field.key === "poster") {
          return !(value instanceof File)
        }

        return !value || (typeof value === "string" && value.trim() === "")
      })

      if (emptyFields.length > 0) {
        alert("請填寫所有欄位")
        return false
      }

      if (formData.startAt && formData.endAt && formData.startAt >= formData.endAt) {
        alert("開始日期必須小於結束日期")
        return false
      }

      if (formData.endAt) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const endDate = new Date(formData.endAt)
        endDate.setHours(0, 0, 0, 0)

        if (endDate < today) {
          alert("下映日不能是過去的日期，請選擇今天或未來的日期")
          return false
        }
      }
    }

    if (isEditMode && formData.startAt && formData.endAt && formData.startAt >= formData.endAt) {
      alert("開始日期必須小於結束日期")
      return false
    }

    if (isEditMode && formData.endAt) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const endDate = new Date(formData.endAt)
      endDate.setHours(0, 0, 0, 0)

      if (endDate < today) {
        alert("下映日不能是過去的日期，請選擇今天或未來的日期")
        return false
      }
    }

    return true
  }

  const handleSubmit = async (data: MovieFormValues) => {
    const directorTags =
      data.director && typeof data.director === "string"
        ? data.director
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : []
    const actorTags =
      data.actors && typeof data.actors === "string"
        ? data.actors
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : []

    if (!validateForm(data, directorTags, actorTags)) {
      return
    }

    const { poster } = data

    let posterUrl = ""
    if (poster instanceof File) {
      try {
        posterUrl = await uploadImageToCloudinary(poster)
      } catch (error) {
        alert("上傳電影封面失敗，請稍後再試")
        return
      }
    }

    // 轉換表單資料為 API 格式
    const convertToAPIFormat = (formData: MovieFormValues, posterUrlValue: string): CreateMovieRequest => {
      // 將日期轉換為 ISO 8601 date-time 格式
      const releaseDate = formData.startAt ? `${formData.startAt}T00:00:00` : ""
      const endDate = formData.endAt ? `${formData.endAt}T00:00:00` : ""

      return {
        title: formData.movieName,
        description: formData.describe,
        duration: Number(formData.duration),
        genre: convertGenreToEnglish(formData.filmType), // 將中文類型轉換為英文代碼
        rating: convertRatingToAPI(formData.category), // 將前端 rating 值轉換為 API 格式
        director: directorTags.join(","),
        cast: actorTags.join(","),
        posterUrl: posterUrlValue || "",
        trailerUrl: formData.trailerLink || "",
        releaseDate,
        endDate,
        canCarousel: false, // API 文件未說明如何設定，先設為 false
      }
    }

    const apiData = convertToAPIFormat(data, posterUrl || originalPosterUrl || "")

    if (isEditMode && movieId) {
      try {
        await updateMovie(Number(movieId), apiData)
        alert("電影更新成功")
        navigate("/movies")
      } catch (error) {
        if (error instanceof MovieAPIError) {
          if (error.errorType === "VALIDATION_ERROR") {
            alert(`更新電影失敗：${error.message}`)
          } else if (error.errorType === "NOT_FOUND") {
            alert("找不到指定的電影")
          } else if (error.errorType === "UNAUTHORIZED") {
            alert("未授權，請重新登入")
          } else if (error.errorType === "FORBIDDEN") {
            alert("權限不足，需要 Admin 角色")
          } else {
            alert(`更新電影失敗：${error.message}`)
          }
        } else {
          alert("更新電影失敗，請稍後再試")
        }
      }
    } else {
      try {
        await createMovie(apiData)
        alert("電影建立成功")
        navigate("/movies")
      } catch (error) {
        if (error instanceof MovieAPIError) {
          if (error.errorType === "VALIDATION_ERROR") {
            alert(`建立電影失敗：${error.message}`)
          } else if (error.errorType === "UNAUTHORIZED") {
            alert("未授權，請重新登入")
          } else if (error.errorType === "FORBIDDEN") {
            alert("權限不足，需要 Admin 角色")
          } else {
            alert(`建立電影失敗：${error.message}`)
          }
        } else {
          alert("建立電影失敗，請稍後再試")
        }
      }
    }
  }

  return {
    form,
    isEditMode,
    originalPosterUrl,
    handleSubmit,
  }
}
