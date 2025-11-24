import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "@/utils/cloudinary"
import CustomSelect from "./CustomSelect"
import InputComponent from "./InputComponent"
import PosterUpload from "./PosterUpload"
import TitleComponent from "./TitleComponent"

interface MovieFormValues {
  movieName: string
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

    const fetchMovie = async () => {
      try {
        const res = await fetch(`http://localhost:3001/movies/${movieId}`)
        if (!res.ok) {
          throw new Error("無法取得電影資料")
        }
        const movie = await res.json()

        setOriginalPosterUrl(movie.poster || null)
        reset({
          movieName: movie.movieName || "",
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
    }

    fetchMovie()
  }, [movieId, isEditMode, reset, navigate])

  const onSubmit = async (data: MovieFormValues) => {
    if (!isEditMode) {
      const requiredFields = [
        { key: "movieName", value: data.movieName },
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
        if (field.key === "poster") {
          return !(field.value instanceof File)
        }

        return !field.value || (typeof field.value === "string" && field.value.trim() === "")
      })

      if (emptyFields.length > 0) {
        alert("請填寫所有欄位")
        return
      }

      if (data.startAt && data.endAt && data.startAt >= data.endAt) {
        alert("開始日期必須小於結束日期")
        return
      }
    }

    if (isEditMode && data.startAt && data.endAt && data.startAt >= data.endAt) {
      alert("開始日期必須小於結束日期")
      return
    }

    const { poster, ...rest } = data

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
      const payload: Record<string, unknown> = {
        ...rest,

        poster: posterUrl || originalPosterUrl || "",
      }

      try {
        const res = await fetch(`http://localhost:3001/movies/${movieId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          throw new Error("更新失敗")
        }
        navigate("/movies")
      } catch (error) {
        alert("更新電影失敗，請稍後再試")
      }
    } else {
      const payload = {
        ...rest,
        poster: posterUrl,
        id: crypto.randomUUID(),
      }

      try {
        const res = await fetch("http://localhost:3001/movies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          throw new Error("建立失敗")
        }
        navigate("/movies")
      } catch (error) {
        alert("建立電影失敗，請稍後再試")
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-3 flex flex-col px-[122px]">
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
          <InputComponent
            label="導演"
            placeholder="導演"
            register={register}
            registerName="director"
            error={errors.director?.message}
          />
          <InputComponent
            label="演員"
            placeholder="演員A、演員B、演員C"
            register={register}
            registerName="actors"
            error={errors.actors?.message}
          />
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
            <InputComponent
              label="上映日"
              type="date"
              register={register}
              registerName="startAt"
              error={errors.startAt?.message}
            />
          </div>
          <div className="flex-1">
            <InputComponent
              label="上映日"
              type="date"
              register={register}
              registerName="endAt"
              error={errors.endAt?.message}
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
          {isEditMode ? "更新" : "建立影廳"}
        </button>
      </section>
    </form>
  )
}

export default MovieForm
