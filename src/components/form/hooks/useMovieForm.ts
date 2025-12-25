import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { uploadImageToCloudinary } from "@/utils/cloudinary"
import { getMovies, saveMovies, type Movie } from "@/utils/storage"

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
    if (!isEditMode) return

    try {
      const movies = getMovies()
      const movie = movies.find((m) => m.id === movieId)

      if (!movie) {
        throw new Error("找不到電影資料")
      }

      setOriginalPosterUrl(movie.poster || null)
      form.reset({
        movieName: movie.movieName || "",
        filmType: movie.filmType || "",
        duration: movie.duration || "",
        category: movie.category || "",
        director: movie.director || "",
        actors: movie.actors || "",
        describe: movie.describe || "",
        trailerLink: movie.trailerLink || "",
        poster: null,
        startAt: movie.startAt || "",
        endAt: movie.endAt || "",
      })
    } catch (error) {
      alert("載入電影資料失敗")
      navigate("/movies")
    }
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

    const formData = { ...data }
    const { poster, ...rest } = formData

    let posterUrl = ""
    if (poster instanceof File) {
      try {
        posterUrl = await uploadImageToCloudinary(poster)
      } catch (error) {
        alert("上傳電影封面失敗，請稍後再試")
        return
      }
    }

    if (isEditMode) {
      const payload: Partial<Movie> = {
        ...rest,
        poster: posterUrl || originalPosterUrl || "",
      }

      try {
        const movies = getMovies()
        const updated: Movie[] = movies.map((movie) =>
          movie.id === movieId ? { ...movie, ...payload } : movie
        )
        saveMovies(updated)
        navigate("/movies")
      } catch (error) {
        alert("更新電影失敗，請稍後再試")
      }
    } else {
      const payload: Movie = {
        ...rest,
        poster: posterUrl || "",
        id: crypto.randomUUID(),
      }

      try {
        const movies = getMovies()
        const updated: Movie[] = [...movies, payload]
        saveMovies(updated)
        navigate("/movies")
      } catch (error) {
        alert("建立電影失敗，請稍後再試")
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
