import { useForm } from "react-hook-form"
import CustomSelect from "./CustomSelect"
import InputComponent from "./InputComponent"
import TitleComponent from "./TitleComponent"

interface MovieFormValues {
  title: string
  time: string
  category: string
  director: string
  actors: string
  describe: string
  trailer: string
  poster: FileList
  startAt: string
  endAt: string
}
const MovieForm = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<MovieFormValues>({
    defaultValues: {
      title: "",
      time: "",
      category: "",
      director: "",
      actors: "",
      describe: "",
      trailer: "",
      poster: undefined as unknown as FileList,
      startAt: "",
      endAt: "",
    },
  })

  const onSubmit = (data: MovieFormValues) => {
    console.log(data)
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
            registerName="title"
            error={errors.title?.message}
          />
          <div className="flex gap-6">
            <div className="flex-1">
              <InputComponent
                label="片長"
                placeholder="60"
                type="text"
                register={register}
                registerName="time"
                error={errors.time?.message}
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
    </form>
  )
}

export default MovieForm
