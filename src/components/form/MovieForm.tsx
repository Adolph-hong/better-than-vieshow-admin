import { useForm } from "react-hook-form"
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
const MovieForm = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
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
  const onSubmit = () => {
    //  API
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-3 flex flex-col px-[122px]">
      {/* 基本資訊 */}
      <section className="flex justify-between border-t border-gray-100 py-6">
        <TitleComponent title="基本資訊" description="新增電影後無法更新" />
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
            label="電影封面"
            placeholder="JPG or PNG"
            onChange={(file) => setValue("poster", file)}
          />
        </div>
      </section>
    </form>
  )
}

export default MovieForm
