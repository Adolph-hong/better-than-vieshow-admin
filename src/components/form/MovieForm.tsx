import { useCallback, useEffect, startTransition, useState } from "react"
import { useNavigate } from "react-router-dom"
import { X } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import Select from "react-select"
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "@/utils/cloudinary"
import { getMovies, saveMovies, type Movie } from "@/utils/storage"
import CustomSelect from "./CustomSelect"
import DatePicker from "./DatePicker"
import InputComponent from "./InputComponent"
import PosterUpload from "./PosterUpload"
import TitleComponent from "./TitleComponent"

interface MovieFormValues {
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

interface MovieFormProps {
  movieId?: string
}

const MovieForm = ({ movieId }: MovieFormProps) => {
  const navigate = useNavigate()
  const isEditMode = !!movieId
  const [originalPosterUrl, setOriginalPosterUrl] = useState<string | null>(null)
  const [directorTags, setDirectorTags] = useState<string[]>([])
  const [directorInput, setDirectorInput] = useState<string>("")
  const [actorTags, setActorTags] = useState<string[]>([])
  const [actorInput, setActorInput] = useState<string>("")
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
  } = useForm<MovieFormValues>({
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
      // 解析導演標籤（如果有的話，以逗號分隔）
      const directors = movie.director
        ? movie.director
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean)
        : []
      setDirectorTags(directors)
      // 解析演員標籤（如果有的話，以逗號分隔）
      const actors = movie.actors
        ? movie.actors
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean)
        : []
      setActorTags(actors)
      reset({
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
  }, [movieId, isEditMode, reset, navigate])

  const handleDirectorInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault()
        const inputElement = e.currentTarget
        const trimmedValue = inputElement.value.trim()
        if (trimmedValue && !directorTags.includes(trimmedValue)) {
          const newTags = [...directorTags, trimmedValue]
          const directorValue = newTags.join(",")
          // 立即清空 input，讓用戶可以繼續輸入
          inputElement.value = ""
          setDirectorInput("")
          // 使用 startTransition 標記非緊急更新，減少卡頓
          startTransition(() => {
            setDirectorTags(newTags)
            setValue("director", directorValue, { shouldDirty: false, shouldValidate: false })
          })
        }
      }
    },
    [directorTags, setValue]
  )

  const handleRemoveDirectorTag = useCallback(
    (tagToRemove: string) => {
      const newTags = directorTags.filter((tag) => tag !== tagToRemove)
      const directorValue = newTags.join(",")
      setDirectorTags(newTags)
      setValue("director", directorValue, { shouldDirty: false })
    },
    [directorTags, setValue]
  )

  const handleActorInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault()
        const inputElement = e.currentTarget
        const trimmedValue = inputElement.value.trim()
        if (trimmedValue && !actorTags.includes(trimmedValue)) {
          const newTags = [...actorTags, trimmedValue]
          const actorValue = newTags.join(",")
          // 立即清空 input，讓用戶可以繼續輸入
          inputElement.value = ""
          setActorInput("")
          // 使用 startTransition 標記非緊急更新，減少卡頓
          startTransition(() => {
            setActorTags(newTags)
            setValue("actors", actorValue, { shouldDirty: false, shouldValidate: false })
          })
        }
      }
    },
    [actorTags, setValue]
  )

  const handleRemoveActorTag = useCallback(
    (tagToRemove: string) => {
      const newTags = actorTags.filter((tag) => tag !== tagToRemove)
      const actorValue = newTags.join(",")
      setActorTags(newTags)
      setValue("actors", actorValue, { shouldDirty: false })
    },
    [actorTags, setValue]
  )

  const onSubmit = async (data: MovieFormValues) => {
    // 確保導演和演員標籤是最新的
    const directorValue = directorTags.join(",")
    const actorValue = actorTags.join(",")
    const formData = { ...data, director: directorValue, actors: actorValue }

    // 驗證片長：1-9開頭，後面可以是0-9，不能用0開頭
    if (formData.duration) {
      const durationPattern = /^[1-9]\d*$/
      if (!durationPattern.test(formData.duration)) {
        alert("片長只能輸入數字，且不能以0開頭")
        return
      }
    }

    // 驗證預告片連結：必須是有效的URL
    if (formData.trailerLink) {
      const trimmedLink = formData.trailerLink.trim()
      if (!trimmedLink.startsWith("http://") && !trimmedLink.startsWith("https://")) {
        alert("預告片連結必須以 http:// 或 https:// 開頭")
        return
      }
      try {
        const url = new URL(trimmedLink)
        if (url.protocol !== "https:" && url.protocol !== "http:") {
          alert("預告片連結必須以 http:// 或 https:// 開頭")
          return
        }
      } catch {
        alert("請輸入有效的網址")
        return
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
        return
      }

      if (formData.startAt && formData.endAt && formData.startAt >= formData.endAt) {
        alert("開始日期必須小於結束日期")
        return
      }

      // 檢查下映日是否已過
      if (formData.endAt) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const endDate = new Date(formData.endAt)
        endDate.setHours(0, 0, 0, 0)

        if (endDate < today) {
          alert("下映日不能是過去的日期，請選擇今天或未來的日期")
          return
        }
      }
    }

    if (isEditMode && formData.startAt && formData.endAt && formData.startAt >= formData.endAt) {
      alert("開始日期必須小於結束日期")
      return
    }

    // 編輯模式也檢查下映日是否已過
    if (isEditMode && formData.endAt) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const endDate = new Date(formData.endAt)
      endDate.setHours(0, 0, 0, 0)

      if (endDate < today) {
        alert("下映日不能是過去的日期，請選擇今天或未來的日期")
        return
      }
    }

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

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (formErrors) => {
        // 如果表單驗證失敗，顯示第一個錯誤
        const firstError = Object.values(formErrors)[0]
        if (firstError?.message) {
          alert(firstError.message)
        } else {
          alert("請檢查表單欄位是否填寫正確")
        }
      })}
      className="mt-3 flex flex-col px-[122px]"
    >
      {/* 基本資訊 */}
      <section className="flex justify-between border-t border-gray-100 py-6">
        <TitleComponent
          title="基本資訊"
          description={isEditMode ? "編輯電影資訊" : "新增電影後無法更新"}
        />
        <div className="flex w-full max-w-141 flex-col gap-6">
          <InputComponent
            label="電影名稱"
            placeholder="電影名稱"
            register={register}
            registerName="movieName"
            error={errors.movieName?.message}
          />
          <div className="font-family-inter flex flex-col gap-2 text-sm font-medium text-[#000000]">
            <span>影片類型</span>
            <Controller
              name="filmType"
              control={control}
              render={({ field }) => {
                const filmTypeOptions = [
                  { label: "動作", value: "動作" },
                  { label: "愛情", value: "愛情" },
                  { label: "冒險", value: "冒險" },
                  { label: "懸疑", value: "懸疑" },
                  { label: "恐怖", value: "恐怖" },
                  { label: "科幻", value: "科幻" },
                  { label: "日本動漫", value: "日本動漫" },
                  { label: "喜劇", value: "喜劇" },
                ]

                // 將字串轉換為選項陣列（如果有多個值，用逗號分隔）
                const selectedValues = field.value
                  ? field.value
                      .split(",")
                      .map((v: string) => v.trim())
                      .filter(Boolean)
                      .map((v: string) => filmTypeOptions.find((opt) => opt.value === v))
                      .filter(Boolean)
                  : []

                return (
                  <Select
                    isMulti
                    options={filmTypeOptions}
                    value={selectedValues}
                    onChange={(newValue) => {
                      const values = newValue
                        ? newValue
                            .map((item) => item?.value)
                            .filter(Boolean)
                            .join(",")
                        : ""
                      field.onChange(values)
                    }}
                    placeholder="請選擇影片類型"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: "40px",
                        border: "1px solid white",
                        borderRadius: "8px",
                        boxShadow: "none",
                        "&:hover": {
                          border: "1px solid white",
                        },
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        gap: "8px", // gap-2
                      }),
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: "#5365AC",
                        borderRadius: "8px", // rounded-lg = 0.5rem = 8px
                        margin: 0,
                        marginRight: "8px", // gap-2 標籤間隔
                      }),
                      multiValueLabel: (base) => ({
                        ...base,
                        color: "white",
                        fontSize: "14px",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: "normal",
                      }),
                      multiValueRemove: (base) => ({
                        ...base,
                        color: "white",
                        "&:hover": {
                          backgroundColor: "#4a5a9a",
                          color: "white",
                        },
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: "#9CA3AF",
                      }),
                    }}
                  />
                )
              }}
            />
            {errors.filmType?.message && (
              <span className="text-red-500">{errors.filmType.message}</span>
            )}
          </div>
          <div className="flex gap-6">
            <div className="flex-1">
              <InputComponent
                label="片長"
                placeholder="60"
                type="text"
                register={register}
                registerName="duration"
                error={errors.duration?.message}
                suffix="分鐘"
              />
            </div>
            <div className="flex-1">
              <CustomSelect
                label="分級"
                placeholder="請選擇分級"
                name="category"
                control={control}
                error={errors.category?.message}
                options={[
                  { label: "普遍級", value: "G" },
                  { label: "輔導級", value: "PG-12" },
                  { label: "限制級", value: "R-18" },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 電影介紹 */}
      <section className="flex justify-between border-t border-gray-100 py-6">
        <TitleComponent title="電影介紹" description="會顯示在電影資訊頁面" />
        <div className="flex w-full max-w-141 flex-col gap-6">
          <div className="font-family-inter flex flex-col gap-2 text-sm font-medium text-[#000000]">
            <span>導演</span>
            <input type="hidden" {...register("director")} />
            <label
              htmlFor="director-input"
              className="flex min-h-11.5 cursor-text flex-wrap items-center gap-2 rounded-lg border border-white bg-white p-2"
            >
              {directorTags.map((tag) => (
                <div
                  key={tag}
                  className="flex h-7 items-center gap-1 rounded-lg bg-[#5365AC] pr-1 pl-2 text-white"
                >
                  <span className="font-family-inter text-sm font-normal">{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDirectorTag(tag)}
                    className="flex items-center justify-center rounded hover:bg-blue-600"
                    aria-label={`移除 ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <input
                id="director-input"
                type="text"
                value={directorInput}
                onChange={(e) => setDirectorInput(e.target.value)}
                onKeyDown={handleDirectorInputKeyDown}
                placeholder={directorTags.length === 0 ? "導演" : ""}
                className="min-w-[120px] flex-1 border-none bg-transparent text-gray-900 outline-none"
                autoComplete="off"
              />
            </label>
            {errors.director?.message && (
              <span className="text-red-500">{errors.director.message}</span>
            )}
          </div>
          <div className="font-family-inter flex flex-col gap-2 text-sm font-medium text-[#000000]">
            <span>演員</span>
            <input type="hidden" {...register("actors")} />
            <label
              htmlFor="actor-input"
              className="flex min-h-11.5 cursor-text flex-wrap items-center gap-2 rounded-lg border border-white bg-white p-2"
            >
              {actorTags.map((tag) => (
                <div
                  key={tag}
                  className="flex h-7 items-center gap-1 rounded-lg bg-[#5365AC] pr-1 pl-2 text-white"
                >
                  <span className="font-family-inter text-sm font-normal">{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveActorTag(tag)}
                    className="flex items-center justify-center rounded hover:bg-blue-600"
                    aria-label={`移除 ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <input
                id="actor-input"
                type="text"
                value={actorInput}
                onChange={(e) => setActorInput(e.target.value)}
                onKeyDown={handleActorInputKeyDown}
                placeholder={actorTags.length === 0 ? "演員A、演員B、演員C" : ""}
                className="min-w-[120px] flex-1 border-none bg-transparent text-gray-900 outline-none"
                autoComplete="off"
              />
            </label>
            {errors.actors?.message && (
              <span className="text-red-500">{errors.actors.message}</span>
            )}
          </div>
          <InputComponent
            label="描述"
            placeholder="電影名稱"
            register={register}
            registerName="describe"
            error={errors.describe?.message}
            as="textarea"
          />
          <InputComponent
            label="預告片連結"
            placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXX"
            register={register}
            registerName="trailerLink"
            error={errors.trailerLink?.message}
          />
          <PosterUpload
            key={originalPosterUrl || "new"}
            label="電影封面"
            placeholder="JPG or PNG"
            existingImageUrl={originalPosterUrl}
            onChange={(file) => setValue("poster", file)}
          />
        </div>
      </section>

      {/* 播放區間 */}
      <section className="flex justify-between border-t border-gray-100 py-6">
        <TitleComponent
          title="播放區間"
          description="只有在播放區間內的電影可以被排進時刻標中販售"
        />
        <div className="flex w-full max-w-141 items-end gap-6">
          <div className="flex-1">
            <Controller
              name="startAt"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="上映日"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.startAt?.message}
                  placeholder="選擇上映日"
                />
              )}
            />
          </div>
          <div className="flex-1">
            <Controller
              name="endAt"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="下映日"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.endAt?.message}
                  placeholder="選擇下映日"
                />
              )}
            />
          </div>
          {isEditMode && (
            <button
              type="button"
              onClick={async () => {
                if (!movieId) return
                if (!window.confirm("確定要刪除這部電影嗎？")) return

                try {
                  if (originalPosterUrl) {
                    await deleteImageFromCloudinary(originalPosterUrl)
                  }

                  const res = await fetch(`http://localhost:3001/movies/${movieId}`, {
                    method: "DELETE",
                  })

                  if (!res.ok) {
                    throw new Error("刪除失敗")
                  }

                  navigate("/movies")
                } catch (error) {
                  alert("刪除電影失敗，請稍後再試")
                }
              }}
            >
              刪除
            </button>
          )}
        </div>
      </section>
      {/* 送出 */}
      <section className="flex justify-end gap-6 border-t border-gray-100 py-6">
        <button
          className="body-medium text-primary-500 border-primary-500 flex cursor-pointer items-center justify-center rounded-[10px] border px-4 py-2.5"
          type="button"
          onClick={() => navigate("/movies")}
        >
          取消
        </button>
        <button
          type="submit"
          className="body-medium border-primary-500 bg-primary-500 flex cursor-pointer items-center justify-center rounded-[10px] border px-4 py-2.5 text-white"
        >
          {isEditMode ? "更新" : "建立電影"}
        </button>
      </section>
    </form>
  )
}

export default MovieForm
